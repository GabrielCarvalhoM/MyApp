import Foundation
import XCTest
@testable import HealthKitIngest
import IntegrationContracts

// Test doubles. Everything here is synthetic: no real Apple Health data exists on the Mac, and none is used.

enum Repo {
    /// <repo>/ios/Packages/HealthKitIngest/Tests/HealthKitIngestTests/<this file>
    static let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
        .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
    static func url(_ rel: String) -> URL { root.appendingPathComponent(rel) }
}

let t0 = Date(timeIntervalSince1970: 1_795_000_000) // 2026-11-18T11:06:40Z

/// A synthetic HealthKit workout (a run unless stated otherwise).
func workout(_ id: String, end: Date, minutes: Double = 30, meters: Double? = 5000, route: Bool = true, indoor: Bool? = nil,
             type: UInt = WorkoutKind.running, userEntered: Bool = false, source: String = "com.apple.health.6F1C2B9E",
             sourceName: String? = "Apple Watch", tz: String? = "America/Sao_Paulo") -> WorkoutSnapshot {
    WorkoutSnapshot(id: id, activityTypeRaw: type, start: end.addingTimeInterval(-minutes * 60), end: end, durationSeconds: minutes * 60,
                    distanceMeters: meters, hasRoute: route, indoor: indoor, wasUserEntered: userEntered, sourceBundleId: source,
                    sourceName: sourceName, timeZoneIdentifier: tz)
}

/// A local wall-clock instant in a fixed offset (minutes), e.g. at("2026-11-17", "07:45", -180).
func at(_ day: String, _ time: String, _ offsetMinutes: Int = -180) -> Date {
    let d = day.split(separator: "-").map { Int($0)! }, h = time.split(separator: ":").map { Int($0)! }
    var cal = Calendar(identifier: .gregorian); cal.timeZone = TimeZone(secondsFromGMT: offsetMinutes * 60)!
    return cal.date(from: DateComponents(year: d[0], month: d[1], day: d[2], hour: h[0], minute: h[1]))!
}

/// Apple Health as a list of changes; the anchor is the index of the last change read.
final class ScriptedReader: HealthReading, @unchecked Sendable {
    private let lock = NSLock()
    private var changes: [(added: WorkoutSnapshot?, deleted: String?)] = []
    private var onChange: (@Sendable () async -> Void)?
    var failNextRead: HealthReadError?
    /// HealthKit's own predicate (workouts reaching the enrolment day). Off only to reach the boundary's BEFORE_RECORD_START refusal.
    var applyPredicate = true
    private(set) var reads = 0, authorizationRequests = 0
    private(set) var observing = false, backgroundDelivery = false
    private(set) var lastStartingAt: Date?

    func add(_ ws: WorkoutSnapshot...) { lock.lock(); for w in ws { changes.append((w, nil)) }; lock.unlock() }
    func delete(_ id: String) { lock.lock(); changes.append((nil, id)); lock.unlock() }
    func fire() async { let f = lock.withLock { onChange }; await f?() }

    func requestReadAuthorization() async throws { lock.withLock { authorizationRequests += 1 } }
    func readWorkouts(anchor: Data?, startingAt: Date) async throws -> WorkoutReadBatch {
        try lock.withLock {
            reads += 1; lastStartingAt = startingAt
            if let e = failNextRead { failNextRead = nil; throw e }
            let from = anchor.flatMap { Int(String(decoding: $0, as: UTF8.self)) } ?? 0
            let slice = changes[min(from, changes.count)...]
            return WorkoutReadBatch(added: slice.compactMap(\.added).filter { !applyPredicate || $0.end >= startingAt }, deletedIds: slice.compactMap(\.deleted),
                                    anchor: Data(String(changes.count).utf8))
        }
    }
    func startObserving(_ onChange: @escaping @Sendable () async -> Void) async throws { lock.withLock { self.onChange = onChange; observing = true } }
    func stopObserving() async { lock.withLock { onChange = nil; observing = false } }
    func setBackgroundDelivery(_ enabled: Bool) async throws { lock.withLock { backgroundDelivery = enabled } }
}

/// A host whose answers the test scripts (codes and shapes from the shared contract only).
final class ScriptedSink: DeviceActivitySink, @unchecked Sendable {
    private let lock = NSLock()
    var context: IngestContextResult
    /// Answers in order; when empty, every workout is RECORDED.
    var answers: [(DeviceDelivery) -> DeliveryResult] = []
    private(set) var deliveries: [DeviceDelivery] = []
    /// When set, `deliver` waits for `release()` before answering (a delivery "in flight" on A's queue).
    var holdNext = false
    private var waiter: CheckedContinuation<Void, Never>?

    init(context: IngestContextResult = .ready(IngestContext(recordStartDay: "2026-11-14", timezoneOffsetMinutes: -180, runSessions: [], version: 1))) {
        self.context = context
    }
    func ingestContext() async -> IngestContextResult { lock.withLock { context } }
    func deliver(_ d: DeviceDelivery) async -> DeliveryResult {
        let hold = lock.withLock { () -> Bool in deliveries.append(d); let h = holdNext; holdNext = false; return h }
        if hold { await withCheckedContinuation { c in lock.withLock { waiter = c } } }
        let next = lock.withLock { answers.isEmpty ? nil : answers.removeFirst() }
        return next?(d) ?? Self.recordAll(d)
    }
    func release() { let w = lock.withLock { () -> CheckedContinuation<Void, Never>? in let w = waiter; waiter = nil; return w }; w?.resume() }
    var isHolding: Bool { lock.withLock { waiter != nil } }
    static func recordAll(_ d: DeviceDelivery) -> DeliveryResult {
        .answered(version: 2, activities: d.activities.enumerated().map { ActivityResult(index: $0.offset, activityId: $0.element.activityId, outcome: .recorded(eventId: "ev-\($0.element.activityId)")) })
    }
    static func each(_ outcome: ActivityOutcome) -> (DeviceDelivery) -> DeliveryResult {
        { d in .answered(version: 2, activities: d.activities.enumerated().map { ActivityResult(index: $0.offset, activityId: $0.element.activityId, outcome: outcome) }) }
    }
}

/// Front A's part played by the real frozen boundary in Node (NodeDouble/boundary-double.mjs). Skipped when Node is not installed.
final class NodeSink: DeviceActivitySink, @unchecked Sendable {
    private let process = Process()
    private let input = Pipe(), output = Pipe()
    private var buffer = Data()
    private var nextId = 0
    private let queue = DispatchQueue(label: "node-sink")

    init(athleteId: String) throws {
        let script = Repo.url("ios/Packages/HealthKitIngest/Tests/HealthKitIngestTests/NodeDouble/boundary-double.mjs").path
        process.executableURL = URL(fileURLWithPath: "/usr/bin/env")
        process.arguments = ["node", script, Repo.url("CoachingCore/test/v1int-helpers.mjs").absoluteString]
        process.standardInput = input; process.standardOutput = output; process.standardError = FileHandle.standardError
        try process.run()
        guard (try? call("init", ["athleteId": athleteId])) != nil else { throw XCTSkip("node not available") }
    }
    deinit { process.terminate() }

    @discardableResult
    func call(_ op: String, _ args: [String: Any] = [:]) throws -> Any {
        try queue.sync {
            nextId += 1
            var req = args; req["id"] = nextId; req["op"] = op
            input.fileHandleForWriting.write(try JSONSerialization.data(withJSONObject: req) + Data("\n".utf8))
            while true {
                if let nl = buffer.firstIndex(of: 0x0A) {
                    let line = buffer[buffer.startIndex..<nl]; buffer = Data(buffer[(nl + 1)...])
                    let o = try JSONSerialization.jsonObject(with: line) as! [String: Any]
                    guard o["ok"] as? Bool == true else { throw NSError(domain: "node", code: 1, userInfo: [NSLocalizedDescriptionKey: "\(o["error"] ?? "")"]) }
                    return o["result"] ?? NSNull()
                }
                let chunk = output.fileHandleForReading.availableData
                if chunk.isEmpty { throw XCTSkip("node exited") }
                buffer.append(chunk)
            }
        }
    }

    func set(_ day: String, _ time: String) throws { try call("set", ["day": day, "time": time]) }
    func version() throws -> Int { (try call("version") as! [String: Any])["version"] as! Int }
    func deviceRows() throws -> [[String: Any]] { try call("deviceRows") as! [[String: Any]] }

    func ingestContext() async -> IngestContextResult {
        guard let r = try? call("context") as? [String: Any] else { return .unavailable(code: HostCode.hostUnavailable) }
        if r["kind"] as? String != "ready" { return .unavailable(code: r["code"] as? String ?? "UNKNOWN") }
        let sessions = (r["runSessions"] as! [[String: Any]]).map { PlannedRunSession(sessionId: $0["sessionId"] as! String, day: $0["day"] as! String) }
        return .ready(IngestContext(recordStartDay: r["recordStartDay"] as! String, timezoneOffsetMinutes: r["timezoneOffsetMinutes"] as! Int,
                                    runSessions: sessions, version: r["version"] as! Int))
    }

    private(set) var sent: [DeviceDelivery] = []
    func deliver(_ d: DeviceDelivery) async -> DeliveryResult {
        queue.sync { sent.append(d) }
        guard let data = try? JSONEncoder().encode(d.activities), let acts = try? JSONSerialization.jsonObject(with: data),
              let r = try? call("deliver", ["deliveryId": d.deliveryId, "activities": acts]) as? [String: Any] else { return .hostUnavailable }
        if r["kind"] as? String == "answered" {
            let results = (r["activities"] as! [[String: Any]]).map { a -> ActivityResult in
                let outcome: ActivityOutcome
                switch a["outcome"] as! String {
                case "RECORDED": outcome = .recorded(eventId: a["eventId"] as! String)
                case "DUPLICATE": outcome = .duplicate
                default: outcome = .notRecorded(reason: a["reason"] as? String ?? "NOT_RECORDED")
                }
                return ActivityResult(index: a["index"] as! Int, activityId: a["activityId"] as! String, outcome: outcome)
            }
            return .answered(version: r["version"] as! Int, activities: results)
        }
        let code = r["code"] as! String, index = r["index"] as? Int
        // A's mapping of a failure (contract §6.2): the shared disposition table, verbatim.
        let disposition = BoundaryDisposition.of(code: code, index: index)
        switch disposition {
        case .setAsideItem, .resendUnlinked, .adapterBug: return .refused(code: code, index: index, disposition: disposition)
        case .waiting: return .waiting(code: code)
        case .retryLater: return .retryLater(code: code)
        case .halted: return .halted(code: code)
        }
    }
}

final class MemoryStore: QueueStore, @unchecked Sendable {
    private let lock = NSLock()
    private(set) var data: Data?
    var locked = false
    /// Fails the next N saves (a write that never reached the disk).
    var failSaves = 0
    private(set) var saves = 0
    func load() throws -> Data? { try lock.withLock { if locked && data != nil { throw QueueStoreError.unavailable }; return data } }
    func save(_ d: Data) throws {
        try lock.withLock {
            if locked { throw QueueStoreError.unavailable }
            if failSaves > 0 { failSaves -= 1; throw QueueStoreError.writeFailed(code: 5) }
            data = d; saves += 1
        }
    }
    func remove() throws { lock.withLock { data = nil } }
}

final class CapturingLog: IngestLogSink, @unchecked Sendable {
    private let lock = NSLock()
    private(set) var events: [IngestLogEvent] = []
    func log(_ event: IngestLogEvent) { lock.withLock { events.append(event) } }
    var lines: [String] { lock.withLock { events.map(\.description) } }
}

final class ManualScheduler: RetryScheduler, @unchecked Sendable {
    private let lock = NSLock()
    private(set) var pending: [(TimeInterval, @Sendable () async -> Void)] = []
    func schedule(after seconds: TimeInterval, _ work: @escaping @Sendable () async -> Void) { lock.withLock { pending.append((seconds, work)) } }
    func runAll() async { let p = lock.withLock { let p = pending; pending = []; return p }; for (_, w) in p { await w() } }
    var delays: [TimeInterval] { lock.withLock { pending.map(\.0) } }
}

final class Clock: @unchecked Sendable {
    private let lock = NSLock()
    private var now: Date
    init(_ d: Date) { now = d }
    func advance(_ s: TimeInterval) { lock.withLock { now = now.addingTimeInterval(s) } }
    var get: @Sendable () -> Date { { [unowned self] in self.lock.withLock { self.now } } }
}

final class FakeRecordingIndex: AppRecordingIndex, @unchecked Sendable {
    private let lock = NSLock()
    var recordings: [AppRecordedRunRef] = []
    func set(_ r: [AppRecordedRunRef]) { lock.withLock { recordings = r } }
    func recordings(overlapping interval: DateInterval) async -> [AppRecordedRunRef] {
        lock.withLock { recordings.filter { $0.interval.intersects(interval) } }
    }
}

/// One ingestor with its doubles.
struct Rig {
    let reader = ScriptedReader()
    let store: QueueStore
    let log = CapturingLog()
    let scheduler = ManualScheduler()
    let clock = Clock(t0)
    let sink: DeviceActivitySink
    let index: FakeRecordingIndex?
    /// Records every background window (QRE-B-R2-03); never the system's.
    let window: RecordingWindow
    var config = HealthKitIngestor.Configuration()

    init(sink: DeviceActivitySink, store: QueueStore = MemoryStore(), index: FakeRecordingIndex? = nil, window: RecordingWindow = RecordingWindow()) {
        self.sink = sink; self.store = store; self.index = index; self.window = window
    }
    func make(reader: HealthReading? = nil) -> HealthKitIngestor {
        HealthKitIngestor(reader: reader ?? self.reader, sink: sink, recordings: index, store: store, log: log, clock: clock.get,
                          scheduler: scheduler, configuration: config, backgroundWindow: window)
    }
}

extension IngestContext {
    static func plan(_ sessions: [(String, String)], start: String = "2026-11-14", offset: Int = -180) -> IngestContext {
        IngestContext(recordStartDay: start, timezoneOffsetMinutes: offset, runSessions: sessions.map { PlannedRunSession(sessionId: $0.0, day: $0.1) }, version: 1)
    }
}

func node() -> Bool {
    let p = Process(); p.executableURL = URL(fileURLWithPath: "/usr/bin/env"); p.arguments = ["node", "--version"]
    p.standardOutput = Pipe(); p.standardError = Pipe()
    do { try p.run(); p.waitUntilExit(); return p.terminationStatus == 0 } catch { return false }
}

/// Runs a Node ESM script with arguments and returns the last stdout line parsed as JSON.
func runNode(_ script: String, args: [String] = []) throws -> Any {
    let dir = FileManager.default.temporaryDirectory.appendingPathComponent("hki-\(UUID().uuidString)")
    try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true); defer { try? FileManager.default.removeItem(at: dir) }
    let url = dir.appendingPathComponent("s.mjs"); try Data(script.utf8).write(to: url)
    let p = Process(); p.executableURL = URL(fileURLWithPath: "/usr/bin/env"); p.arguments = ["node", url.path] + args
    let pipe = Pipe(); p.standardOutput = pipe; p.standardError = pipe
    try p.run()
    let out = String(data: pipe.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""
    p.waitUntilExit()
    if p.terminationStatus == 127 { throw XCTSkip("node not installed") }
    guard p.terminationStatus == 0, let last = out.split(separator: "\n").last else { throw NSError(domain: "node", code: Int(p.terminationStatus), userInfo: [NSLocalizedDescriptionKey: out]) }
    return try JSONSerialization.jsonObject(with: Data(last.utf8))
}
