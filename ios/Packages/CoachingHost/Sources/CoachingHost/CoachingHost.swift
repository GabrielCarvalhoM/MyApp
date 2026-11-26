import Foundation
import IntegrationContracts
import CoachingPresentation

/// Front A's implementation of the shared ports: `CoachingReading`, `CoachingWriting`, `TimeInZoneClassifying` (CoachingPresentation) and
/// `DeviceActivitySink` (IntegrationContracts). One instance per signed-in athlete.
///
/// Every call runs on ONE serial engine queue (never the main thread) and, for its whole duration, under the athlete's kernel lock (N-5), so
/// a read-compare-write of the record is never interleaved with another process. The host sets the actor, a fresh `clientRequestId` per
/// user action (reused only for the BUSY retry of that same action), and the current `expectedVersion`; the UI sets none of them.
/// States and executability come only from the engine's `view`; the host adds only the native rules the engine cannot see (`startability`).
/// Signals to front B (`DeviceQueueControl`) are sent only after the operation is committed, and a failure there undoes nothing here.
public final class CoachingHost: @unchecked Sendable {
    public struct Configuration: Sendable {
        public var athleteId: String
        /// The store folder (Application Support/CoachingHost by default). One file per athlete plus the host's side files.
        public var root: URL
        public var keychainService: String
        /// Tests only: isolates Keychain items under a prefix.
        var keychainPrefix: String = ""
        public init(athleteId: String, root: URL? = nil, keychainService: String = CoachingHost.keychainService) {
            self.athleteId = athleteId
            self.root = root ?? CoachingHost.defaultRoot()
            self.keychainService = keychainService
        }
    }

    /// The Keychain service of front A (contract §9).
    public static let keychainService = "fit.vilumo.repmile.lab.coachinghost"

    public static func defaultRoot() -> URL {
        let base = (try? FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true))
            ?? FileManager.default.temporaryDirectory
        return base.appendingPathComponent("CoachingHost", isDirectory: true)
    }

    let configuration: Configuration
    let athleteId: String
    let queue: DispatchQueue
    let store: NativeStore
    let keychain: KeychainItems
    let anchor: KeychainAnchor
    let keys: IntegrityKeyResolving
    let productionKey: KeychainIntegrityKey?
    let clock: TrustedClock
    let signals: SignalStore
    private(set) var runtime: EngineRuntime!
    private let keyRef: String
    public let queueControl: DeviceQueueControl?
    /// The first launch reconciliation's outcome for this process (handoff §6.1).
    public private(set) var reconciliation: FirstLaunch.Outcome = .notNeeded
    /// D1 / CLOCK_BEHIND_RECORD: the next committed mutating operation signals B (contract §4.2).
    private var conditionsWaitOnClock = false
    var inFlightWritesValue = 0
    /// Test hooks.
    var idSource: () -> String = { UUID().uuidString }
    var busyRetryDelay: useconds_t = 50_000
    /// Tests only: the plan's fixed offset to state in an intake (the app uses the device's current offset).
    var timezoneOffsetOverride: Int?

    // MARK: opening

    /// Opens the host for one athlete: the first-launch reconciliation, the runtime (bundle verified), the native store and the Keychain anchor.
    /// Throws if the bundle or an asset is not the pinned bytes, or the store folder cannot be created (e.g. protected data unavailable).
    public static func open(_ configuration: Configuration, queueControl: DeviceQueueControl? = nil, clock: HostClockSource = DeviceClock()) async throws -> CoachingHost {
        let keychain = KeychainItems(service: configuration.keychainService, prefix: configuration.keychainPrefix)
        let key = KeychainIntegrityKey(items: keychain)
        let host = try CoachingHost(configuration, queueControl: queueControl, clock: clock, keys: key, keyRef: KeychainIntegrityKey.keyRef, production: key)
        try await host.start(testMode: false, exposeModules: false)
        return host
    }

    /// Tests only (SPI): any key resolver (the fixture keys of the equivalence journeys), the test mode of the facade, the module registry.
    @_spi(CoachingHostTesting)
    public static func openForTesting(_ configuration: Configuration, keychainPrefix: String, queueControl: DeviceQueueControl? = nil,
                                      clock: HostClockSource = DeviceClock(), keys: IntegrityKeyResolving? = nil, keyRef: String? = nil,
                                      exposeModules: Bool = false) async throws -> CoachingHost {
        var c = configuration; c.keychainPrefix = keychainPrefix
        let keychain = KeychainItems(service: c.keychainService, prefix: keychainPrefix)
        let production = keys == nil ? KeychainIntegrityKey(items: keychain) : nil
        let host = try CoachingHost(c, queueControl: queueControl, clock: clock, keys: keys ?? production!, keyRef: keyRef ?? KeychainIntegrityKey.keyRef, production: production)
        try await host.start(testMode: true, exposeModules: exposeModules)
        return host
    }

    private init(_ configuration: Configuration, queueControl: DeviceQueueControl?, clock: HostClockSource, keys: IntegrityKeyResolving, keyRef: String,
                 production: KeychainIntegrityKey?) throws {
        self.configuration = configuration
        athleteId = configuration.athleteId
        queue = DispatchQueue(label: "fit.vilumo.repmile.coachinghost.engine", qos: .userInitiated)
        store = try NativeStore(dir: configuration.root)
        keychain = KeychainItems(service: configuration.keychainService, prefix: configuration.keychainPrefix)
        anchor = KeychainAnchor(items: keychain)
        self.keys = keys; self.keyRef = keyRef; productionKey = production
        let tag = NativeStore.name(configuration.athleteId)
        self.clock = TrustedClock(source: clock, file: configuration.root.appendingPathComponent("clock-\(tag).json"))
        signals = SignalStore(file: configuration.root.appendingPathComponent("signals-\(tag).json"))
        self.queueControl = queueControl
    }

    private func start(testMode: Bool, exposeModules: Bool) async throws {
        let outcome: FirstLaunch.Outcome = try await onQueue {
            let r = FirstLaunch.reconcile(root: self.configuration.root, store: self.store, keychain: self.keychain)
            self.runtime = try EngineRuntime(queue: self.queue, keys: self.keys, exposeModules: exposeModules, testMode: testMode)
            self.runtime.install("__chstore", self.store.jsMembers())
            self.runtime.install("__chanchor", self.anchor.jsMembers())
            let log: @convention(block) (String) -> Void = { HostLog.telemetry($0) }
            self.runtime.install("__chlog", ["": unsafeBitCast(log, to: AnyObject.self)])
            let opened = try self.runtime.call("open", [JSONText.object([("athleteId", JSONText.string(self.athleteId)), ("keyRef", JSONText.string(self.keyRef)), ("store", JSONText.string("native"))])])
            guard (try? JSONSerialization.jsonObject(with: Data(opened.utf8)) as? [String: Any])?["ok"] as? Bool == true else { throw EngineRuntime.Failure.js("open: \(opened)") }
            return r
        }
        reconciliation = outcome
        // Contract §4.2/§6.1: purge after the reconciliation is done (A's side first), then "the host is available again".
        if outcome == .freshInstallPurged { try? await queueControl?.purge(.freshInstall) }
        await queueControl?.deliveryConditionsChanged()
    }

    func onQueue<T>(_ body: @escaping () throws -> T) async throws -> T {
        try await withCheckedThrowingContinuation { cont in queue.async { do { cont.resume(returning: try body()) } catch { cont.resume(throwing: error) } } }
    }
    func onQueue<T>(_ body: @escaping () -> T) async -> T {
        await withCheckedContinuation { cont in queue.async { cont.resume(returning: body()) } }
    }

    // MARK: the one way to the facade

    /// How an operation meets the trusted clock (D1): `bounded` operations are refused when the clock is more than 300 s ahead of the
    /// reference; `exempt` ones (revocation, erasures, the record-loss acknowledgement) always pass, as the boundary lets them pass a clock
    /// behind the record; `read` operations are not refused (startability reports an untrusted clock).
    enum ClockRule { case bounded, exempt, read }

    struct Answer {
        let json: String
        let object: [String: Any]
        var ok: Bool { object["ok"] as? Bool == true }
        var code: String? { (object["error"] as? [String: Any])?["code"] as? String }
        var data: Data { Data(json.utf8) }
    }

    static func hostFailure(_ code: String, _ message: String, state: String = "OPERATIONAL_ERROR") -> Answer {
        let j = JSONText.object([("ok", "false"), ("error", JSONText.object([("code", JSONText.string(code)), ("message", JSONText.string(message))])), ("state", JSONText.string(state))])
        return Answer(json: j, object: (try? JSONSerialization.jsonObject(with: Data(j.utf8)) as? [String: Any]) ?? [:])
    }

    /// Runs one facade function on the engine queue under the athlete's lock. `args` are JSON fragments by key; `versioned` adds the current
    /// `expectedVersion` read under the same lock; `requestId` adds a `clientRequestId` (a new one after CONFLICT_STALE_VERSION /
    /// REQUEST_ID_REUSED, the same one for BUSY; contract §6.1, handoff §7).
    func perform(_ fn: String, _ args: [(String, String)]? = nil, versioned: Bool = false, requestId: String? = nil, clockRule: ClockRule) -> Answer {
        dispatchPrecondition(condition: .onQueue(queue))
        var rid = requestId, stale = 0, busy = 0
        while true {
            let nowMs: Double
            switch clock.check() {
            case .trusted(let now): nowMs = now
            case .aheadOfReference(let now, _):
                if clockRule == .bounded { conditionsWaitOnClock = true; HostLog.host("d1-refused", code: HostCode.clockAheadOfReference)
                    return Self.hostFailure(HostCode.clockAheadOfReference, "The device clock is ahead of the trusted reference; check date and time") }
                nowMs = now
            }
            let a: Answer
            do {
                a = try store.withLock(athleteId) { () throws -> Answer in
                    var fields = args ?? []
                    if versioned {
                        let v = try self.runtime.call("version", [nowMs])
                        let vo = (try? JSONSerialization.jsonObject(with: Data(v.utf8)) as? [String: Any]) ?? [:]
                        fields.append(("expectedVersion", (vo["version"] as? NSNumber).map { String($0.intValue) } ?? "null"))
                    }
                    if let rid { fields.append(("clientRequestId", JSONText.string(rid))) }
                    let out = args == nil && !versioned && rid == nil ? try self.runtime.call(fn, [nowMs]) : try self.runtime.call(fn, [JSONText.object(fields), nowMs])
                    return Answer(json: out, object: (try? JSONSerialization.jsonObject(with: Data(out.utf8)) as? [String: Any]) ?? [:])
                }
            } catch NativeStore.StoreError.busy {
                a = Self.hostFailure("BUSY", "Another process holds this record")
            } catch {
                HostLog.host("facade-error", code: "OPERATIONAL_ERROR")
                return Self.hostFailure("OPERATIONAL_ERROR", "The coaching engine could not run this operation")
            }
            // A committed write whose anchor could not be written: rewrite it from the record now, before answering (contract §6.1).
            if a.object["anchorStale"] as? Bool == true, let s = store.anchorOfStored(athleteId) { _ = anchor.set(athleteId, s) }
            if let c = a.code, c == "CONFLICT_STALE_VERSION" || c == "REQUEST_ID_REUSED", versioned, stale < 3 {
                stale += 1; if rid != nil { rid = idSource() }; continue
            }
            if a.code == "BUSY", busy < 3 { busy += 1; usleep(busyRetryDelay); continue }
            if a.code == "CLOCK_BEHIND_RECORD" { conditionsWaitOnClock = true }
            if a.ok && clockRule != .read && a.object["replayed"] as? Bool != true { clock.recordWrite(atMs: nowMs) }
            return a
        }
    }

    /// After a committed mutating operation: whether B must hear `deliveryConditionsChanged()` because an earlier clock refusal is over.
    func takeClockRecovery(_ a: Answer) -> Bool {
        guard a.ok, conditionsWaitOnClock else { return false }
        conditionsWaitOnClock = false; return true
    }

    // MARK: decoding

    static func decode<T: Decodable>(_ t: T.Type, _ data: Data) -> T? { try? JSONDecoder().decode(T.self, from: data) }
    static func boundaryError(_ a: Answer) -> BoundaryError {
        if let e = a.object["error"], let d = try? JSONSerialization.data(withJSONObject: e), let be = decode(BoundaryError.self, d) { return be }
        return BoundaryError(code: Code(raw: "OPERATIONAL_ERROR"))
    }
    static func answer(_ a: Answer) -> BoundaryAnswer {
        decode(BoundaryAnswer.self, a.data) ?? decode(BoundaryAnswer.self, hostFailure("OPERATIONAL_ERROR", "An answer this app cannot read").data)!
    }
    static func result<T: Decodable>(_ a: Answer, _ t: T.Type, key: String? = nil) -> Result<T, BoundaryError> {
        guard a.ok else { return .failure(boundaryError(a)) }
        let d: Data? = key.map { k in a.object[k].flatMap { try? JSONSerialization.data(withJSONObject: $0, options: [.fragmentsAllowed]) } } ?? a.data
        guard let d, let v = decode(T.self, d) else { return .failure(BoundaryError(code: "OPERATIONAL_ERROR", message: nil)) }
        return .success(v)
    }
}

/// Small JSON text composition: the host sends the requests exactly as the shared Swift types encode them, inside an envelope it writes as text
/// (no re-serialisation of a request through a dictionary, which would reorder or retype it).
enum JSONText {
    static let encoder: JSONEncoder = { let e = JSONEncoder(); e.outputFormatting = [.withoutEscapingSlashes]; return e }()
    static func string(_ s: String) -> String { String(data: try! encoder.encode(s), encoding: .utf8)! }
    static func object(_ fields: [(String, String)]) -> String { "{" + fields.map { string($0.0) + ":" + $0.1 }.joined(separator: ",") + "}" }
    static func encode<T: Encodable>(_ v: T) throws -> String { String(data: try encoder.encode(v), encoding: .utf8)! }
    static func bool(_ b: Bool) -> String { b ? "true" : "false" }
}
