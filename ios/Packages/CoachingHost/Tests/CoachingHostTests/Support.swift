import Foundation
import XCTest
import CryptoKit
@testable @_spi(CoachingHostTesting) import CoachingHost
import CoachingPresentation
import IntegrationContracts

/// A wall clock the test sets, over the real monotonic clock; the boot session can be changed to simulate a reboot.
final class TestClock: HostClockSource, @unchecked Sendable {
    var wall: Double
    var boot = "boot-A"
    var extraNanos: UInt64 = 0
    let device = DeviceClock()
    init(_ iso: String = "2026-11-14T12:00:00-03:00") { wall = TestClock.ms(iso) }
    static func ms(_ iso: String) -> Double { (ISO8601DateFormatter().date(from: iso)!.timeIntervalSince1970 * 1000) }
    /// Moves the wall clock as time passing would: a forward move advances the monotonic clock by the same amount (a backward move does not).
    func set(_ iso: String) { let w = Self.ms(iso); if w > wall { extraNanos += UInt64((w - wall) * 1_000_000) }; wall = w }
    /// D1 tests only: the wall clock moves and the monotonic clock does not (the device clock set ahead by hand).
    func setWallOnly(_ ms: Double) { wall = ms }
    func set(day: String, _ time: String = "12:00") { set("\(day)T\(time):00-03:00") }
    func wallMs() -> Double { wall }
    func continuousNanos() -> UInt64 { device.continuousNanos() + extraNanos }
    func bootSession() -> String { boot }
}

/// The fixture keys of the Node oracles: each reference is the key text itself (as the oracles passed it). Test target only.
final class FixtureKeys: IntegrityKeyResolving {
    func key(for ref: String) -> Data? { Data(ref.utf8) }
}

/// A `DeviceQueueControl` double that records every call and, at each call, the record version on disk (contract §8: after the commit).
final class RecordingQueueControl: DeviceQueueControl, @unchecked Sendable {
    struct Call: Equatable { let name: String; let versionOnDisk: Int?; let fileExists: Bool }
    private let lock = NSLock()
    private var _calls: [Call] = []
    var probe: () -> (Int?, Bool) = { (nil, false) }
    var calls: [Call] { lock.withLock { _calls } }
    private func record(_ name: String) { let p = probe(); lock.withLock { _calls.append(Call(name: name, versionOnDisk: p.0, fileExists: p.1)) } }
    func deliveryConditionsChanged() async { record("deliveryConditionsChanged") }
    func purge(_ reason: QueuePurgeReason) async throws { record("purge:\(reason.rawValue)") }
    func reset() { lock.withLock { _calls = [] } }
}

enum TestEnv {
    static func root(_ name: String) -> URL {
        let base = (try? FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)) ?? FileManager.default.temporaryDirectory
        let u = base.appendingPathComponent("coachinghost-tests").appendingPathComponent(name)
        try? FileManager.default.removeItem(at: u)
        return u
    }
    static func prefix(_ name: String) -> String { "test.\(name)." }
    /// KEYCHAIN_TESTING.md: on macOS the tests never touch the login keychain (its access is bound to the ad-hoc signature of each rebuilt
    /// test binary, so it prompts a person); they use the file storage below, shared by the test processes. On iOS (the iPhone tests) it is
    /// nil: the real data-protection Keychain, isolated by the lab bundle id and the test prefix.
    static var keychainDirectory: URL? {
        #if os(macOS)
        let base = (try? FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)) ?? FileManager.default.temporaryDirectory
        return base.appendingPathComponent("coachinghost-tests").appendingPathComponent("keychain", isDirectory: true)
        #else
        return nil
        #endif
    }
    static var keychainStorage: KeychainItems.Storage { keychainDirectory.map { .file($0) } ?? .system }
    static func items(_ prefix: String) -> KeychainItems { KeychainItems(service: CoachingHost.keychainService, prefix: prefix, storage: keychainStorage) }
    static func cleanup(_ name: String) {
        items(prefix(name)).deleteAll()
        try? FileManager.default.removeItem(at: root(name))
    }
    static func fixture(_ name: String) throws -> Data {
        guard let url = Bundle.module.url(forResource: name, withExtension: "json", subdirectory: "Fixtures") else { throw EngineRuntime.Failure.resource(name) }
        return try Data(contentsOf: url)
    }
    /// The repository root (macOS only: the tests that read the shared sources or run Node).
    static var repo: URL { URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent() }
}

/// A host over a fresh store and Keychain prefix, with the production Keychain key (or the fixture keys), a test clock and a recording B.
struct HostFixture {
    let name: String
    let clock: TestClock
    let b: RecordingQueueControl
    let host: CoachingHost
    /// What B heard while the host opened (the first-launch purge, "available again").
    var callsAtOpen: [String] = []
    static func make(_ name: String, clock: TestClock = TestClock(), fixtureKeys: Bool = false, keyRef: String? = nil, clean: Bool = true,
                     exposeModules: Bool = false, athlete: String? = nil, b: RecordingQueueControl? = nil) async throws -> HostFixture {
        if clean { TestEnv.cleanup(name) }
        let b = b ?? RecordingQueueControl()
        let root = clean ? TestEnv.root(name) : TestEnv.rootNoClean(name)
        let host = try await CoachingHost.openForTesting(.init(athleteId: athlete ?? "athlete-\(name)", root: root), keychainPrefix: TestEnv.prefix(name),
                                                         queueControl: b, clock: clock, keys: fixtureKeys ? FixtureKeys() : nil,
                                                         keyRef: keyRef ?? (fixtureKeys ? "v1int-synthetic-key" : nil), exposeModules: exposeModules,
                                                         testKeychainDirectory: TestEnv.keychainDirectory)
        host.timezoneOffsetOverride = -180
        let store = host.store, id = host.athleteId
        b.probe = { (NativeStore.versionOf(store.rawData(id)), FileManager.default.fileExists(atPath: store.file(id).path)) }
        let atOpen = b.calls.map(\.name)
        b.reset()
        return HostFixture(name: name, clock: clock, b: b, host: host, callsAtOpen: atOpen)
    }
    /// A new host over the same store and Keychain (a new process would see the same).
    func reopen(clock: TestClock? = nil, athlete: String? = nil, b: RecordingQueueControl? = nil) async throws -> HostFixture {
        try await HostFixture.make(name, clock: clock ?? self.clock, clean: false, athlete: athlete ?? host.athleteId, b: b)
    }
}
extension TestEnv {
    static func rootNoClean(_ name: String) -> URL {
        let base = (try? FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)) ?? FileManager.default.temporaryDirectory
        return base.appendingPathComponent("coachinghost-tests").appendingPathComponent(name)
    }
}

/// The synthetic athlete the shared request tests use (RequestSchemaTests.answers), as C fills the onboarding form.
enum Athlete {
    static let screen = EligibilityScreen(status: .nonclinicalConfirmed, assessedAt: "2026-11-13", pain: false, persistentPain: false, injury: false,
                                          illness: false, functionalLimitation: false, clinicalConcern: false)
    static func screen(_ day: String, pain: Bool = false) -> EligibilityScreen {
        EligibilityScreen(status: .nonclinicalConfirmed, assessedAt: day, pain: pain, persistentPain: false, injury: false, illness: false, functionalLimitation: false, clinicalConcern: false)
    }
    static func answers(special: [SpecialPopulation] = [], start: String = "2026-11-16", assessedAt: String = "2026-11-13", pain: Bool = false, hr: HeartRateProfileRequest? = nil, id: String = "swift-a") -> OnboardingAnswers {
        OnboardingAnswers(athlete: AthleteIntake(id: id, ageYears: 32, eligibility: screen(assessedAt, pain: pain), specialPopulation: special, strengthTrainingMonths: 18,
                                                 runTrainingMonths: 36, exerciseRotationPreference: "COACH_DECIDES",
                                                 goals: IntakeGoals(run: RunGoal(kind: "RACE", event: GoalEvent(kind: "10K", date: "2027-01-10")), strength: "RUNNING_SUPPORT"),
                                                 equipment: ["BARBELL", "RACK", "BENCH", "DUMBBELLS", "KETTLEBELL", "MACHINES", "BANDS", "PULL_UP_BAR"],
                                                 recent: RecentTraining(strengthDaysPerWeek: 2, runDaysPerWeek: 4, runMinutesPerWeek: 200, longestRunMinutes: 80),
                                                 performanceAnchors: [PerformanceAnchor(kind: "RACE_RESULT", distance: "10K", seconds: 3000, date: "2026-11-01",
                                                                                        measurement: "OFFICIAL", rpe: 9, tolerated: true)]),
                          schedule: TrainingSchedule(strengthDays: [2, 5], strengthMinutes: 45, runDays: [1, 3, 5, 6], runMinutes: 50, longRunMinutes: 90,
                                                     longRunDay: 6, runTurn: "AM", strengthTurn: "PM"),
                          weeks: 8, startDate: start, heartRateProfile: hr)
    }
    static let all = Consents(coaching: true, healthSignals: true, learning: true)
}

/// Prints one result line the run log can be grepped for ("CHRESULT <name> <json>") and keeps it as a test attachment.
func emit<T: Encodable>(_ name: String, _ value: T) {
    let enc = JSONEncoder(); enc.outputFormatting = [.sortedKeys]
    guard let data = try? enc.encode(value), let s = String(data: data, encoding: .utf8) else { return }
    print("CHRESULT \(name) \(s)")
}
