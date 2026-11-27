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
        /// Tests only (KEYCHAIN_TESTING.md): the macOS test runs use the file storage; production is always the system Keychain.
        var keychainStorage: KeychainItems.Storage = .system
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
    /// CCP-A-04: this athlete's erasure fence, its file tag, and the erasures not yet known to be complete (any athlete of this store).
    let fence: ErasureFence
    let tag: String
    var pendingErasures: Set<String> = []
    /// The store folder could not be listed for fences: unknown counts as pending (code review R1 #3).
    var fenceScanUnknown = false
    /// True only while the `eraseAccount` that wrote (or retries) a REQUESTED fence runs, so the custody can finish its own erasure path.
    var servingErasure = false
    /// Erasures whose native side is done and whose B purge has not returned yet (fence NATIVE_DONE).
    var purgeOwed: Set<String> = []
    /// CCP-B-04 rule 2 (#49 P2-2): the durable purges of B owed for the fresh install and an acknowledged record loss.
    let purgeIntent: PurgeIntent
    private(set) var runtime: EngineRuntime!
    private let keyRef: String
    public let queueControl: DeviceQueueControl?
    /// The first launch reconciliation's outcome for this process (handoff §6.1).
    public private(set) var reconciliation: FirstLaunch.Outcome = .notNeeded
    /// D1 / CLOCK_BEHIND_RECORD: the next committed mutating operation signals B (contract §4.2).
    private var conditionsWaitOnClock = false
    /// Whether the last `perform` ran on a trusted clock (D1).
    private var lastPerformTrusted = true
    /// Set only by `openForTesting`: the test bookkeeping below is kept only then (QRE-A-09).
    var testing = false
    var inFlightWritesValue = 0
    /// Test hooks.
    var idSource: () -> String = { UUID().uuidString }
    var busyRetryDelay: useconds_t = 50_000
    /// Tests only: the plan's fixed offset to state in an intake (the app uses the device's current offset).
    var timezoneOffsetOverride: Int?
    /// Tests only: the next N versioned calls send a version one behind (to exercise the CONFLICT_STALE_VERSION retry, contract §6.1).
    var versionSkewForTesting = 0
    /// Tests only: the request ids the host sent, in order.
    var sentRequestIds: [String] = []
    /// Tests only: the last write's answer as the facade returned it.
    var lastAnswerJSON: String?

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

    #if COACHINGHOST_TESTING
    /// Tests only (SPI, compiled only with COACHINGHOST_TESTING: debug `swift test`, the lab's device build; QRE-A-09): any key resolver (the
    /// fixture keys of the equivalence journeys), the test mode of the facade, the module registry.
    /// `testKeychainDirectory`: the file storage of KEYCHAIN_TESTING.md (macOS test runs); nil uses the system Keychain (the iPhone tests).
    @_spi(CoachingHostTesting)
    public static func openForTesting(_ configuration: Configuration, keychainPrefix: String, queueControl: DeviceQueueControl? = nil,
                                      clock: HostClockSource = DeviceClock(), keys: IntegrityKeyResolving? = nil, keyRef: String? = nil,
                                      exposeModules: Bool = false, testKeychainDirectory: URL? = nil) async throws -> CoachingHost {
        var c = configuration; c.keychainPrefix = keychainPrefix
        if let d = testKeychainDirectory { c.keychainStorage = .file(d) }
        let keychain = KeychainItems(service: c.keychainService, prefix: keychainPrefix, storage: c.keychainStorage)
        let production = keys == nil ? KeychainIntegrityKey(items: keychain) : nil
        let host = try CoachingHost(c, queueControl: queueControl, clock: clock, keys: keys ?? production!, keyRef: keyRef ?? KeychainIntegrityKey.keyRef, production: production)
        host.testing = true
        try await host.start(testMode: true, exposeModules: exposeModules)
        return host
    }
    #endif

    private init(_ configuration: Configuration, queueControl: DeviceQueueControl?, clock: HostClockSource, keys: IntegrityKeyResolving, keyRef: String,
                 production: KeychainIntegrityKey?) throws {
        self.configuration = configuration
        athleteId = configuration.athleteId
        queue = DispatchQueue(label: "fit.vilumo.repmile.coachinghost.engine", qos: .userInitiated)
        store = try NativeStore(dir: configuration.root)
        // QRE-A-11 (until D2): the record, its side files and the install marker are not in the device backup. A restore elsewhere would bring
        // the container without its ThisDeviceOnly key and anchor (an INTEGRITY_FAILURE), and the health record into an OS backup.
        var root = configuration.root; var rv = URLResourceValues(); rv.isExcludedFromBackup = true; try? root.setResourceValues(rv)
        keychain = KeychainItems(service: configuration.keychainService, prefix: configuration.keychainPrefix, storage: configuration.keychainStorage)
        anchor = KeychainAnchor(items: keychain)
        self.keys = keys; self.keyRef = keyRef; productionKey = production
        let tag = NativeStore.name(configuration.athleteId)
        self.tag = tag
        self.clock = TrustedClock(source: clock, file: Self.clockFile(configuration.root, tag))
        signals = SignalStore(file: Self.signalsFile(configuration.root, tag))
        fence = ErasureFence(dir: configuration.root)
        purgeIntent = PurgeIntent(dir: configuration.root)
        let f = fence, s = store, id = configuration.athleteId
        self.clock.erased = { f.state(tag) != nil }; signals.erased = { f.state(tag) != nil }
        // #49 P2-1: every read-modify-write of the signals file runs under the athlete's kernel lock, over the file as it is now.
        signals.withLock = { body in try s.withLock(id) { body() } }
        self.queueControl = queueControl
    }

    private func start(testMode: Bool, exposeModules: Bool) async throws {
        let outcome: FirstLaunch.Outcome = try await onQueue {
            // #49 P3-2: a reconciliation that cannot complete throws (fail closed): the host does not open, and the next open retries it.
            let r = try FirstLaunch.reconcile(root: self.configuration.root, store: self.store, keychain: self.keychain,
                                              owePurge: { self.owePurge(.freshInstall) })
            // CCP-A-04 F4: an erasure left REQUESTED (a process death, a failed removal) is completed before anything else runs.
            self.fenceScanUnknown = true
            self.completePendingErasures()
            self.runtime = try EngineRuntime(queue: self.queue, keys: self.keys, exposeModules: exposeModules, testMode: testMode)
            self.runtime.install("__chstore", self.store.jsMembers(fenced: { [weak self] in self?.fencedOnQueue ?? true }))
            self.runtime.install("__chanchor", self.anchor.jsMembers())
            let log: @convention(block) (String) -> Void = { HostLog.telemetry($0) }
            self.runtime.install("__chlog", ["": unsafeBitCast(log, to: AnyObject.self)])
            let opened = try self.runtime.call("open", [JSONText.object([("athleteId", JSONText.string(self.athleteId)), ("keyRef", JSONText.string(self.keyRef)), ("store", JSONText.string("native"))])])
            guard (try? JSONSerialization.jsonObject(with: Data(opened.utf8)) as? [String: Any])?["ok"] as? Bool == true else { throw EngineRuntime.Failure.js("open: \(opened)") }
            return r
        }
        reconciliation = outcome
        // Contract §4.2/§6.1: purge after the reconciliation is done (A's side first), then "the host is available again". The fresh-install
        // purge is a durable intent written before the marker (#49 P2-2): sent here and, until it returns, at every start and write.
        await settleOwedPurge(nil, includeRequested: true)
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
        // CCP-A-04 F3: while an account erasure is not known to be complete, nothing runs but that erasure. Nothing is sealed under a key that
        // is due to be removed, and no new enrolment can meet old key material.
        if !servingErasure && (!pendingErasures.isEmpty || fenceScanUnknown) {
            completePendingErasures()
            if !pendingErasures.isEmpty || fenceScanUnknown {
                HostLog.host("erasure-pending", code: HostCode.hostUnavailable)
                return Self.hostFailure(HostCode.hostUnavailable, "An account erasure is not complete yet; try again")
            }
        }
        // Code review R1 #1: a key cached by this instance is dropped if another instance or process removed it.
        productionKey?.revalidate()
        var rid = requestId, stale = 0, busy = 0
        while true {
            let nowMs: Double
            switch clock.check() {
            case .trusted(let now): nowMs = now; lastPerformTrusted = true
            case .aheadOfReference(let now, let bound):
                lastPerformTrusted = false
                if clockRule == .bounded { conditionsWaitOnClock = true; HostLog.host("d1-refused", code: HostCode.clockAheadOfReference)
                    return Self.hostFailure(HostCode.clockAheadOfReference, "The device clock is ahead of the trusted reference; check date and time") }
                // QRE-A-01: an exempt operation (revocation, erasures) passes, but at the trusted bound, never at the clock that is ahead: it can
                // neither move the record's lastAt nor the reference forward. A read keeps the device clock (it writes nothing).
                nowMs = clockRule == .exempt ? bound.rounded(.down) : now
            }
            let a: Answer
            do {
                a = try store.withLock(athleteId) { () throws -> Answer in
                    var fields = args ?? []
                    if versioned {
                        let v = try self.runtime.call("version", [nowMs])
                        let vo = (try? JSONSerialization.jsonObject(with: Data(v.utf8)) as? [String: Any]) ?? [:]
                        let skew = self.versionSkewForTesting > 0 ? 1 : 0; if skew > 0 { self.versionSkewForTesting -= 1 }
                        fields.append(("expectedVersion", (vo["version"] as? NSNumber).map { String($0.intValue - skew) } ?? "null"))
                    }
                    if let rid { fields.append(("clientRequestId", JSONText.string(rid))); if self.testing { self.sentRequestIds.append(rid) } }
                    let out = args == nil && !versioned && rid == nil ? try self.runtime.call(fn, [nowMs]) : try self.runtime.call(fn, [JSONText.object(fields), nowMs])
                    let ans = Answer(json: out, object: (try? JSONSerialization.jsonObject(with: Data(out.utf8)) as? [String: Any]) ?? [:])
                    // A committed write whose anchor could not be written: rewrite it from the record now, under the same lock (contract §6.1).
                    if ans.object["anchorStale"] as? Bool == true, let s = self.store.anchorOfStored(self.athleteId) { _ = self.anchor.set(self.athleteId, s) }
                    return ans
                }
            } catch NativeStore.StoreError.busy {
                a = Self.hostFailure("BUSY", "Another process holds this record")
            } catch NativeStore.StoreError.io {
                // QRE-A-12: the store cannot be opened (e.g. protected data unavailable before the first unlock): the host is unavailable.
                HostLog.host("store-unavailable", code: HostCode.hostUnavailable)
                return Self.hostFailure(HostCode.hostUnavailable, "The record cannot be opened now")
            } catch {
                HostLog.host("facade-error", code: "OPERATIONAL_ERROR")
                return Self.hostFailure("OPERATIONAL_ERROR", "The coaching engine could not run this operation")
            }
            if let c = a.code, c == "CONFLICT_STALE_VERSION" || c == "REQUEST_ID_REUSED", versioned, stale < 3 {
                stale += 1; if rid != nil { rid = idSource() }; continue
            }
            if a.code == "BUSY", busy < 3 { busy += 1; usleep(busyRetryDelay); continue }
            if a.code == "CLOCK_BEHIND_RECORD" { conditionsWaitOnClock = true }
            if a.ok && clockRule != .read && lastPerformTrusted && a.object["replayed"] as? Bool != true { clock.recordWrite(atMs: nowMs) }
            return a
        }
    }

    /// After a committed mutating operation: whether B must hear `deliveryConditionsChanged()` because an earlier clock refusal is over.
    func takeClockRecovery(_ a: Answer) -> Bool {
        // QRE-A-01: only a committed operation that ran on a trusted clock ends a clock refusal (an exempt one under a clock ahead does not).
        guard a.ok, lastPerformTrusted, conditionsWaitOnClock else { return false }
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
