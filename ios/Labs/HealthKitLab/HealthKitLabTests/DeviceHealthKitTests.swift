#if !targetEnvironment(simulator)
import XCTest
import HealthKit
import UIKit
@testable import HealthKitIngest
import IntegrationContracts

/// iPhone only (run through `tools/device-lock/with-device.sh healthkit --wait -- …`). The device's Apple Health data is the Founder's
/// (contract §9): nothing is written, heart rate is never requested, nothing reaches CoachingCore (the host double answers WAITING, so every
/// workout stays in a temporary queue that is purged at the end), and the output is counts and codes only, never a value.
final class DeviceHealthKitTests: XCTestCase {
    let hk = HKHealthStore()

    func testDeviceAuthorizationAndReadCountsOnly() async throws {
        XCTAssertTrue(HKHealthStore.isHealthDataAvailable())
        let st = await Lab.requestStatus(hk, share: [], read: HealthKitReader.readTypes)
        print("HKLAB_AUTHORIZATION_REQUEST_STATUS \(st == .unnecessary ? "ALREADY_ANSWERED" : st == .shouldRequest ? "NOT_YET_ASKED" : "UNKNOWN")")
        guard st == .unnecessary else {
            throw XCTSkip("FOUNDER_AUTHORIZATION_PENDING: launch HealthKitLab with -labAuthorize on the iPhone and answer the sheet")
        }
        let sink = LabSink(recordStartDay: Lab.day(Date().addingTimeInterval(-28 * 86_400)))
        sink.waitingCode = "LAB_NO_HOST"
        let log = LabLog()
        let ing = HealthKitIngestor(reader: HealthKitReader(store: hk), sink: sink, recordings: nil, store: Lab.tmpStore(), log: log)
        await ing.start()
        let status = await ing.status(), counts = await ing.counts()
        // Counts and codes only.
        print("HKLAB_READ lastReadError=\(status.lastReadError ?? "none") receivedTypes=\(status.receivedTypes.joined(separator: ","))")
        print("HKLAB_COUNTS queued=\(status.queued) pending=\(counts.pending) excluded=\(counts.excluded.sorted { $0.key < $1.key }.map { "\($0.key):\($0.value)" }.joined(separator: ","))")
        print("HKLAB_BACKGROUND_DELIVERY \(log.lines.first { $0.hasPrefix("hki.backgroundDelivery") } ?? "NOT_ATTEMPTED")")
        print("HKLAB_DELIVERIES_TO_DOUBLE \(sink.deliveries.count) (answered WAITING LAB_NO_HOST: nothing reaches CoachingCore)")
        for l in log.lines { print("HKLAB_LOG \(l)") }
        XCTAssertNil(status.lastReadError)
        try await ing.purge(.accountErased)
        try await ing.setEnabled(false)   // leaves no lab observer or background registration behind
    }

    /// Needs the Founder to press the side button within the window (HKLAB_LOCK_TEST=1 in the test environment); otherwise skipped.
    func testLockedDeviceWaitsAndResumes() async throws {
        guard ProcessInfo.processInfo.environment["HKLAB_LOCK_TEST"] == "1" else { throw XCTSkip("LOCK_TEST_NOT_REQUESTED") }
        let st = await Lab.requestStatus(hk, share: [], read: HealthKitReader.readTypes)
        guard st == .unnecessary else { throw XCTSkip("FOUNDER_AUTHORIZATION_PENDING") }
        let locked = expectation(forNotification: UIApplication.protectedDataWillBecomeUnavailableNotification, object: nil)
        print("HKLAB_LOCK_NOW: lock the iPhone within 60 s, wait 15 s, then unlock it")
        await fulfillment(of: [locked], timeout: 60)
        try await Task.sleep(nanoseconds: 12_000_000_000)
        let sink = LabSink(recordStartDay: Lab.day(Date().addingTimeInterval(-28 * 86_400))); sink.waitingCode = "LAB_NO_HOST"
        let log = LabLog()
        let ing = HealthKitIngestor(reader: HealthKitReader(store: hk), sink: sink, recordings: nil, store: Lab.tmpStore(), log: log)
        await ing.start()
        let whileLocked = await ing.status()
        print("HKLAB_LOCKED lastReadError=\(whileLocked.lastReadError ?? "none")")
        let unlocked = expectation(forNotification: UIApplication.protectedDataDidBecomeAvailableNotification, object: nil)
        await fulfillment(of: [unlocked], timeout: 120)
        await ing.protectedDataDidBecomeAvailable()
        let after = await ing.status()
        print("HKLAB_UNLOCKED lastReadError=\(after.lastReadError ?? "none") queued=\(after.queued)")
        XCTAssertEqual(whileLocked.lastReadError, IngestCode.protectedDataUnavailable)
        XCTAssertNil(after.lastReadError)
        try await ing.purge(.accountErased); try await ing.setEnabled(false)
    }
}
#endif
