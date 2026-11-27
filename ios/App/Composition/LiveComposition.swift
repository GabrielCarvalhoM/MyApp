import CoachingHost
import Foundation
import HealthKitIngest
import IntegrationContracts
import RepMileUI
import RunRecorder

/// The production composition root (#16, `specs/v1/ARCHITECTURE.md` §7): front A's `CoachingHost` as `CoachingReading & CoachingWriting`,
/// front B's `HealthKitIngestor` as `HealthIngestStatusSource`, front C's `RunRecorder` over the `RecordingStore` that is also B's
/// `AppRecordingIndex`, and the `AppModel` the shell renders. No screen changes in the swap.
///
/// Lifetime: one instance per process (`SingleOpen`), kept for the life of the process. It owns A, B and the recorder strongly; B holds A
/// as its `queueControl` peer only through the `DeviceActivitySinkProxy`, which holds A weakly. So there is exactly one `CoachingHost` for the
/// athlete in this process (#49 P2-1), and no app extension exists that could write A's signals.
///
/// Opened at launch by the app delegate (#63 P2-1), so B's observer and background delivery are registered also when HealthKit wakes the app
/// in the background with no SwiftUI scene; the root (`LiveRoot`) reuses that same instance (`LaunchOpener`, one `SingleOpen`).
///
/// Order (A needs B at open, B needs A as its sink):
///  1. the athlete id (`AthleteIdentityStore`, CCP-A-05); after a rotation, the erased account's recordings are removed first (#63 P3-1);
///  2. the recordings store and the recorder (C);
///  3. B over the unbound proxy: until A is bound, B is answered "host unavailable" and keeps its queue;
///  4. `CoachingHost.open` with B as `DeviceQueueControl` (A purges B after its first-launch reconciliation and signals it, outside its queue);
///  5. bind A into the proxy; then B's `start()`, which never asks for HealthKit authorization (only `requestAuthorization()` does; that
///     request belongs to the Apple Health screen, a later UI issue).
@MainActor
final class LiveComposition {
    let athleteId: String
    let host: CoachingHost
    let ingestor: HealthKitIngestor
    let recordings: RecordingStore
    let recorder: RunRecorder
    let model: AppModel
    private let reader: HealthKitReader
    private let sink: DeviceActivitySinkProxy
    private let identity: AthleteIdentityStore

    private static let opener = LaunchOpener<LiveComposition> { try await make() }
    /// Hosts opened in this process: never more than one (#49 P2-1). `SingleOpen` guarantees it; this makes a regression stop the process.
    private static var hostsOpened = 0

    /// The process's composition, opened on first use. Throws when A cannot open (bundle not the pinned bytes, protected data unavailable, the
    /// store folder cannot be created), the identity cannot be read, or an erased account's recordings cannot be removed yet; nothing
    /// half-built is kept, and a later call tries again.
    static func open() async throws -> LiveComposition { try await opener.open() }

    /// `application(_:didFinishLaunchingWithOptions:)`: opens the composition now (foreground or background launch) and again on the next
    /// unlock if that fails. Nothing for the fixture composition.
    static func launch(_ mode: LaunchMode) { opener.launch(mode) }

    /// Application Support/RunRecorder: the folder `RecordingStore.standard()` uses (C). Erased here only after a rotation; the index check
    /// in `make` catches a drift between the two.
    private static func recordingsDirectory() -> URL {
        FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0].appendingPathComponent("RunRecorder", isDirectory: true)
    }

    private init(athleteId: String, host: CoachingHost, ingestor: HealthKitIngestor, reader: HealthKitReader, recordings: RecordingStore,
                 recorder: RunRecorder, sink: DeviceActivitySinkProxy, identity: AthleteIdentityStore) {
        self.athleteId = athleteId; self.host = host; self.ingestor = ingestor; self.reader = reader; self.recordings = recordings
        self.recorder = recorder; self.sink = sink; self.identity = identity
        // No account layer yet (#28): the profile shows no name rather than an invented one.
        model = AppModel(reader: host, writer: host, health: ingestor, athleteName: "")
    }

    private static func make() async throws -> LiveComposition {
        let identity = try AthleteIdentityStore.standard()
        let athleteId = try identity.current()
        let erasurePending = try identity.isDeviceErasurePending()
        if erasurePending { try PendingErasure.erase(recordingsDirectory()) }
        let recordings = RecordingStore.standard()
        if erasurePending {
            guard await recordings.recordings(overlapping: PendingErasure.everything).isEmpty else { throw PendingErasure.Failure.notErased }
            try identity.deviceErasureDone()
        }
        let recorder = RunRecorder(source: locationSource(), store: recordings)
        let sink = DeviceActivitySinkProxy()
        let reader = HealthKitReader()
        let ingestor = HealthKitIngestor(reader: reader, sink: sink, recordings: recordings, store: try FileQueueStore.applicationSupport())
        let host = try await CoachingHost.open(CoachingHost.Configuration(athleteId: athleteId), queueControl: ingestor, clock: DeviceClock())
        hostsOpened += 1
        precondition(hostsOpened == 1, "one CoachingHost per athlete per process")
        guard sink.bind(host) else { preconditionFailure("one CoachingHost per process") }
        let c = LiveComposition(athleteId: athleteId, host: host, ingestor: ingestor, reader: reader, recordings: recordings, recorder: recorder,
                                sink: sink, identity: identity)
        c.startIngest()
        return c
    }

    /// CoreLocation. Debug builds only: `-simulatedLocation` scripts the location (no permission prompt) so a live UI journey can record a
    /// run into the real `RecordingStore`, the one the erasure must empty (#63 P3-6).
    private static func locationSource() -> LocationSource {
        #if DEBUG
        if ProcessInfo.processInfo.arguments.contains("-simulatedLocation") { return SimulatedLocationSource(state: .noSignal) }
        #endif
        return CoreLocationSource()
    }

    /// B at launch (B's report §5, `HealthKitIngestor.start`): load the queue, register the observer and background delivery, read. With no
    /// authorization asked yet, nothing prompts and nothing is read into the engine (A answers NOT_ENROLLED until an enrolment). Not awaited:
    /// the first screen does not wait for HealthKit.
    private func startIngest() {
        let ingestor = self.ingestor
        reader.onProtectedDataAvailable { await ingestor.protectedDataDidBecomeAvailable() }
        Task.detached { await ingestor.start() }
    }

    /// The account is known erased (a successful `eraseAccount`, or `GONE` read for this id): the next launch opens a new athlete id, so the
    /// athlete meets NOT_ENROLLED and onboarding again (CCP-A-05 rule 3). This process keeps its host on the erased id until it ends. A failed
    /// write is not lost: the next launch reads `GONE` for the same id and rotates again.
    func accountErased() {
        _ = try? identity.rotate(from: athleteId)
    }
}
