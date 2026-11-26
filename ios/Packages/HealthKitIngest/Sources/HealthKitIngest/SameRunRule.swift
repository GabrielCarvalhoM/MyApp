import Foundation
import IntegrationContracts

/// The provenance of one run as HealthKit states it, kept in B's own file. `DeviceActivity` has no field for it: the boundary writes
/// `source.provider = HEALTHKIT`, which is the CHANNEL (the run came through Apple Health), never the app that recorded it.
struct RunProvenance: Codable, Equatable, Sendable {
    let sourceBundleId: String
    let sourceName: String?
    let productType: String?
    let syncIdentifier: String?
    let syncVersion: Int?
    let hasRoute: Bool
    init(_ w: WorkoutSnapshot) {
        sourceBundleId = w.sourceBundleId; sourceName = w.sourceName; productType = w.sourceProductType
        syncIdentifier = w.syncIdentifier; syncVersion = w.syncVersion; hasRoute = w.hasRoute
    }
    var origin: ImportedRunOrigin { ImportedRunOrigin.of(bundleId: sourceBundleId, productType: productType) }
}

/// OPEN-1 policy 2, layer B and C (`OPEN1_THIRD_PARTY_POLICY.md` §4): when several HealthKit workouts (different UUIDs) are the same physical
/// run, written by several apps or devices. Vendor-neutral: the source never decides identity, only the facts every source states.
///
/// Identity of two runs (in this order):
/// 1. the same source AND the same `HKMetadataKeySyncIdentifier`: the same record (an app's newer version of it) → the same run;
/// 2. intervals that overlap by at most `touchingTolerance` (60 s), without meeting rule 4's `sameRun` → two runs: both are kept. One person cannot run two runs at the same
///    time, so ONLY an overlap can make two workouts one run; but back-to-back runs, or two devices whose clocks or start/stop presses
///    differ by seconds, may overlap by a few seconds without being one run (QRE-B-O1-02). PROVISIONAL (OPEN-B-3, SSCTR + Engineering);
/// 3. an overlap below `RecordingDedupe.sameRun` (the shared rule: overlap ≥ half of the LONGER) → inconclusive: one workout covers only part
///    of the other (fragments, G-3) → reconciliation;
/// 4. `sameRun`, and the facts both state agree → the same run (consolidated). They agree when the durations differ by at most
///    max(3 min, 10 % of the longer) (the engine's own R7-A rule for two reports of one execution, `r6-provenance.mjs physicalAgrees`) and,
///    when both state a distance, the distances differ by at most 10 % of the longer (PROVISIONAL, OPEN-B-1: the engine has no distance
///    agreement rule; the relative part of the duration rule, reviewed by SSCTR + Engineering at integration);
/// 5. `sameRun` but the facts disagree → inconclusive → reconciliation (never "pick one" on a weak signal).
///
/// Several workouts are one group when they are linked by any non-"two runs" pair (transitively). A group is consolidated only when EVERY
/// pair in it is the same run; otherwise every open member waits for reconciliation and none is delivered. A member already sent (frozen,
/// in flight, delivered) is never changed: it is the run of its group, and a later copy is consolidated into it or waits for reconciliation.
enum SameRunRule {
    struct Facts: Equatable {
        let id: String
        let start: Date
        let end: Date
        let minutes: Double?
        let distanceKm: Double?
        let quality: DeviceSourceQuality?
        let sourceBundleId: String
        let syncIdentifier: String?
        let syncVersion: Int?
        /// Already sent (frozen, in flight or delivered): its bytes and its place on the record are fixed.
        let fixed: Bool
        var interval: DateInterval { DateInterval(start: start, end: max(start, end)) }
    }

    enum Decision: Equatable {
        /// Alone, or the run its group delivers.
        case deliver
        case duplicateOf(String)
        case reconcile(code: String, group: String)
    }

    enum Pair: Equatable { case twoRuns, sameRun, inconclusive(code: String) }

    /// PROVISIONAL (OPEN-B-3): an overlap of at most this many seconds is "touching", never one run.
    static let touchingTolerance: TimeInterval = 60

    /// The engine's R7-A duration agreement (`physicalAgrees`): |a − b| ≤ max(3, 0.1 × max(a, b)) minutes.
    static func minutesAgree(_ a: Double?, _ b: Double?) -> Bool {
        guard let a, let b else { return true }
        return abs(a - b) <= max(3, 0.1 * max(a, b)) + 1e-9
    }
    /// PROVISIONAL (OPEN-B-1): |a − b| ≤ 0.1 × max(a, b) km. Unknown never disagrees (missing stays missing, DR-118).
    static let distanceTolerance = 0.1
    static func distanceAgrees(_ a: Double?, _ b: Double?) -> Bool {
        guard let a, let b else { return true }
        return abs(a - b) <= distanceTolerance * max(a, b) + 1e-9
    }

    static func pair(_ a: Facts, _ b: Facts) -> Pair {
        if let s = a.syncIdentifier, s == b.syncIdentifier, a.sourceBundleId == b.sourceBundleId { return .sameRun }
        guard let o = a.interval.intersection(with: b.interval), o.duration > 0 else { return .twoRuns }
        // The tolerance applies only to a PARTIAL overlap: copies of one very short run (≤ ~2 min) still meet `sameRun` (QRE-B-O1-11).
        guard RecordingDedupe.sameRun(a.interval, b.interval) else {
            return o.duration <= touchingTolerance ? .twoRuns : .inconclusive(code: IngestCode.reconcilePartialOverlap)
        }
        guard minutesAgree(a.minutes, b.minutes), distanceAgrees(a.distanceKm, b.distanceKm) else {
            return .inconclusive(code: IngestCode.reconcileMeasurementsDisagree)
        }
        return .sameRun
    }

    /// The run a consolidated group delivers when none of it was sent yet, so arrival order never decides. First, an older version of a
    /// synced record (same source and sync identifier, lower version) is never the run. Among the others, a strict total order: the more
    /// complete measurement (`WEARABLE_FULL`), then a stated distance, then the earliest start, then the id.
    static func representative(_ open: [Facts]) -> Facts {
        let candidates = open.filter { a in !open.contains { b in
            b.id != a.id && a.syncIdentifier != nil && b.syncIdentifier == a.syncIdentifier && b.sourceBundleId == a.sourceBundleId
                && ((b.syncVersion ?? 0), b.id) > ((a.syncVersion ?? 0), a.id) } }
        func key(_ f: Facts) -> (Int, Int, Date, String) { (f.quality == .wearableFull ? 0 : 1, f.distanceKm != nil ? 0 : 1, f.start, f.id) }
        return candidates.min { key($0) < key($1) }!
    }

    /// One decision per workout that is not fixed. Deterministic: the same facts always give the same decisions, whatever their order.
    static func decide(_ facts: [Facts]) -> [String: Decision] {
        let f = facts.sorted { ($0.start, $0.id) < ($1.start, $1.id) }
        var parent = Array(f.indices)
        func root(_ i: Int) -> Int { var i = i; while parent[i] != i { parent[i] = parent[parent[i]]; i = parent[i] }; return i }
        // Overlap sweep (sorted by start) plus same-record links (a newer version may not overlap the old one).
        var active: [Int] = []
        for i in f.indices {
            active.removeAll { f[$0].end <= f[i].start }
            for j in active where pair(f[j], f[i]) != .twoRuns { parent[root(i)] = root(j) }
            active.append(i)
        }
        var bySync: [String: Int] = [:]
        for i in f.indices { if let s = f[i].syncIdentifier { let k = f[i].sourceBundleId + "\u{1F}" + s
            if let j = bySync[k] { parent[root(i)] = root(j) } else { bySync[k] = i } } }

        var groups: [Int: [Int]] = [:]
        for i in f.indices { groups[root(i), default: []].append(i) }
        var out: [String: Decision] = [:]
        for members in groups.values {
            let open = members.filter { !f[$0].fixed }
            guard !open.isEmpty else { continue }
            guard members.count > 1 else { out[f[members[0]].id] = .deliver; continue }
            var codes = Set<String>()
            for x in members.indices { for y in members.indices where y > x {
                switch pair(f[members[x]], f[members[y]]) {
                case .sameRun: break
                case .twoRuns: codes.insert(IngestCode.reconcileSeveralRuns)
                case .inconclusive(let c): codes.insert(c)
                }
            } }
            if codes.isEmpty {
                let fixed = members.filter { f[$0].fixed }.sorted { (f[$0].end, f[$0].id) < (f[$1].end, f[$1].id) }
                let repId = fixed.first.map { f[$0].id } ?? representative(open.map { f[$0] }).id
                for i in open { out[f[i].id] = f[i].id == repId ? .deliver : .duplicateOf(repId) }
            } else {
                let code = [IngestCode.reconcileSeveralRuns, IngestCode.reconcilePartialOverlap, IngestCode.reconcileMeasurementsDisagree].first { codes.contains($0) }!
                let group = members.map { f[$0].id }.min()!
                for i in open { out[f[i].id] = .reconcile(code: code, group: group) }
            }
        }
        return out
    }
}

// MARK: - What C can show of each run (local adapter, CCP-B-05)

/// Where a run came from, as far as HealthKit says. Display only: it never selects, links or weighs a run. The two vendor bundle ids are
/// the apps' public App Store identifiers (PROVISIONAL display table, OPEN-B-2); any other app is `OTHER_APP` with its `sourceName`.
public enum ImportedRunOrigin: String, Codable, Sendable, CaseIterable {
    case appleWatch = "APPLE_WATCH", iPhone = "IPHONE", appleOther = "APPLE_OTHER"
    case garmin = "GARMIN", strava = "STRAVA", otherApp = "OTHER_APP", unknown = "UNKNOWN"

    static let vendorBundles: [String: ImportedRunOrigin] = ["com.garmin.connect.mobile": .garmin, "com.strava.stravaride": .strava]

    static func of(bundleId: String, productType: String?) -> ImportedRunOrigin {
        if bundleId.isEmpty { return .unknown }
        if WorkoutNormalizer.isAppleSource(bundleId) {
            if productType?.hasPrefix("Watch") == true { return .appleWatch }
            if productType?.hasPrefix("iPhone") == true { return .iPhone }
            return .appleOther
        }
        return vendorBundles[bundleId] ?? .otherApp
    }
}

/// Where a run stands between Apple Health and the engine.
public enum ImportedRunStatus: String, Codable, Sendable, CaseIterable {
    /// Imported from Apple Health, not yet counted by the engine (queued, in flight, waiting for the host or a NOT_RECORDED re-send).
    case awaitingDelivery = "AWAITING_DELIVERY"
    /// The engine holds it (RECORDED, or DUPLICATE: it already held exactly this).
    case counted = "COUNTED"
    /// Another workout of the same physical run is the one delivered (`sameRunAs`); this one is never sent.
    case consolidatedDuplicate = "CONSOLIDATED_DUPLICATE"
    /// Probably the same run as another workout, not enough evidence: not delivered until reconciled (`reconciliationGroup`, `statusCode`).
    case awaitingReconciliation = "AWAITING_RECONCILIATION"
    /// Not sent and not retried (`statusCode`: BEFORE_RECORD_START, OVERLAPS_APP_RECORDING, ATTEMPTS_EXHAUSTED, a boundary refusal…).
    case setAside = "SET_ASIDE"
    /// The athlete typed it (`HKMetadataKeyWasUserEntered`): history only, never a device measurement.
    case notForEngine = "NOT_FOR_ENGINE"
}

/// One run read from Apple Health, for C's history and import screens. Values are what HealthKit stated; nil is "not stated" (no route, pace,
/// split or heart rate is ever promised). Local adapter type: the shared form is proposed in CCP-B-05.
public struct ImportedRunRecord: Equatable, Sendable, Identifiable {
    /// `HKWorkout.uuid` (the `activityId` of the DEVICE observation when it is delivered).
    public let id: String
    public let start: Date
    public let end: Date
    public let origin: ImportedRunOrigin
    /// As Apple Health reports it (e.g. the app's or the watch's name).
    public let sourceName: String?
    public let status: ImportedRunStatus
    /// The code behind `setAside`, `awaitingReconciliation`, `notForEngine` or a NOT_RECORDED wait; nil otherwise.
    public let statusCode: String?
    /// `consolidatedDuplicate`: the workout delivered for this run.
    public let sameRunAs: String?
    /// `awaitingReconciliation`: the records to reconcile share this id.
    public let reconciliationGroup: String?
    /// As normalized for the engine (nil: HealthKit stated none). For `notForEngine`, `minutes` is the athlete's entry and `distanceKm` is nil.
    public let minutes: Double?
    public let distanceKm: Double?
    /// A route exists (presence only; B never reads a coordinate).
    public let hasRoute: Bool
    /// `WEARABLE_PARTIAL`: some measurement is missing (partial data). nil for `notForEngine` (not a measurement).
    public let completeness: DeviceSourceQuality?
    /// The engine session it is linked to, once frozen (nil: unlinked or not yet decided).
    public let sessionId: String?
}
