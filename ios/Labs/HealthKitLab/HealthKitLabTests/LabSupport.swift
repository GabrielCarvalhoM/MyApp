import Foundation
import HealthKit
import XCTest
@testable import HealthKitIngest
import IntegrationContracts

/// A host double for the lab (the lab never reaches CoachingCore: contract §9, custody is syntheticOnly). It records deliveries in memory
/// only and answers with `answer` (RECORDED by default, or a fixed waiting code so nothing ever leaves the queue).
final class LabSink: DeviceActivitySink, @unchecked Sendable {
    private let lock = NSLock()
    let context: IngestContext
    var waitingCode: String?
    private(set) var deliveries: [DeviceDelivery] = []
    init(recordStartDay: String, offsetMinutes: Int = 0) {
        context = IngestContext(recordStartDay: recordStartDay, timezoneOffsetMinutes: offsetMinutes, runSessions: [], version: 1)
    }
    func ingestContext() async -> IngestContextResult { .ready(context) }
    func deliver(_ d: DeviceDelivery) async -> DeliveryResult {
        lock.lock(); deliveries.append(d); let w = waitingCode; lock.unlock()
        if let w { return .waiting(code: w) }
        return .answered(version: 2, activities: d.activities.enumerated().map {
            ActivityResult(index: $0.offset, activityId: $0.element.activityId, outcome: .recorded(eventId: "lab-\($0.offset)")) })
    }
    var sent: [DeviceActivity] { lock.lock(); defer { lock.unlock() }; return deliveries.flatMap(\.activities) }
}

/// Counts only: the lab's log never carries a value (handoff §4 item 14).
final class LabLog: IngestLogSink, @unchecked Sendable {
    private let lock = NSLock()
    private(set) var lines: [String] = []
    func log(_ event: IngestLogEvent) { lock.lock(); lines.append(event.description); lock.unlock() }
}

enum Lab {
    static func day(_ date: Date, offsetMinutes: Int = 0) -> String { BoundaryInstant.day(date, offsetMinutes: offsetMinutes) }
    static func tmpStore() -> FileQueueStore {
        FileQueueStore(directory: FileManager.default.temporaryDirectory.appendingPathComponent("hklab-\(UUID().uuidString)"))
    }
    /// Polls `condition` (async) until true or the timeout.
    static func wait(_ seconds: TimeInterval, _ condition: () async -> Bool) async -> Bool {
        let end = Date().addingTimeInterval(seconds)
        while Date() < end { if await condition() { return true }; try? await Task.sleep(nanoseconds: 200_000_000) }
        return await condition()
    }
    static func requestStatus(_ store: HKHealthStore, share: Set<HKSampleType>, read: Set<HKObjectType>) async -> HKAuthorizationRequestStatus {
        await withCheckedContinuation { c in
            store.getRequestStatusForAuthorization(toShare: share, read: read) { s, _ in c.resume(returning: s) }
        }
    }
}
