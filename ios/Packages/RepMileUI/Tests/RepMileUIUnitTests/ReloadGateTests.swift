import CoachingPresentation
import Foundation
import IntegrationContracts
import XCTest
@testable import RepMileUI

/// QRE recheck of increment 08, N1: during a reload no start is possible, and the previous safety gates stay visible.
@MainActor
final class ReloadGateTests: XCTestCase {
    /// The health port is the last read of `AppModel.load()`; holding it open freezes the model mid-read.
    final class GatedHealth: HealthIngestStatusSource, @unchecked Sendable {
        private let inner = FixtureHealthIngestStatus(queued: 0)
        private let lock = NSLock()
        private var armed = false
        private var waiting: CheckedContinuation<Void, Never>?
        func arm() { lock.withLock { armed = true } }
        var isWaiting: Bool { lock.withLock { waiting != nil } }
        func release() {
            let c = lock.withLock { () -> CheckedContinuation<Void, Never>? in armed = false; defer { waiting = nil }; return waiting }
            c?.resume()
        }
        func status() async -> HealthIngestStatus {
            if lock.withLock({ armed }) { await withCheckedContinuation { c in lock.withLock { waiting = c } } }
            return await inner.status()
        }
        func importedNonRunWorkouts(since: Date) async -> [ImportedWorkoutSummary] { await inner.importedNonRunWorkouts(since: since) }
    }

    private func model(_ scenario: Scenario, _ health: GatedHealth) -> AppModel {
        AppModel(reader: FixtureCoachingReader(scenario: scenario, store: Repo.store), writer: FixtureCoachingWriter(store: Repo.store),
                 health: health, athleteName: "Teste")
    }

    private func waitUntilFrozen(_ health: GatedHealth) async throws {
        // A time deadline, not a yield count: the fixture reads decode JSON off the main actor (verification N3).
        let deadline = Date().addingTimeInterval(10)
        while !health.isWaiting, Date() < deadline { try await Task.sleep(nanoseconds: 1_000_000) }
        XCTAssertTrue(health.isWaiting, "the reload did not reach the health read")
    }

    func testOutsideScopeGateStaysVisibleAndNothingStartsDuringAReload() async throws {
        let health = GatedHealth()
        let m = model(.restartOutsideScope, health)
        await m.load()
        XCTAssertEqual(m.globalGate, .outsideV1Scope)
        let sessions = try XCTUnwrap(m.plan?.week?.sessions)
        XCTAssertFalse(sessions.contains { m.canStart($0) })

        health.arm()
        let reload = Task { await m.load() }
        try await waitUntilFrozen(health)
        XCTAssertTrue(m.isLoading)
        XCTAssertEqual(m.globalGate, .outsideV1Scope, "the banner and the unplanned-run gate must not disappear during the read")
        XCTAssertFalse(sessions.contains { m.canStart($0) })
        health.release()
        await reload.value
        XCTAssertFalse(m.isLoading)
        XCTAssertEqual(m.globalGate, .outsideV1Scope)
    }

    func testAStartableSessionCannotStartWhileTheNextReadIsInFlight() async throws {
        let health = GatedHealth()
        let m = model(.today, health)
        await m.load()
        let startable = try XCTUnwrap(m.plan?.week?.sessions.first { m.startability(of: $0) == .startable })
        XCTAssertTrue(m.canStart(startable))

        health.arm()
        let reload = Task { await m.load() }
        try await waitUntilFrozen(health)
        XCTAssertFalse(m.canStart(startable), "the previous read's gate is shown, never trusted to start (QRE R1 P1-9)")
        health.release()
        await reload.value
        XCTAssertTrue(m.canStart(startable))
    }

    func testAccountErasedDuringAReadIsNotUndoneByThatRead() async throws {
        let health = GatedHealth()
        let m = model(.today, health)
        await m.load()
        health.arm()
        let reload = Task { await m.load() }
        try await waitUntilFrozen(health)
        await m.accountErased()
        health.release()
        await reload.value
        XCTAssertEqual(m.route, .accountErased)
        XCTAssertNil(m.plan)
        XCTAssertFalse(m.isLoading)
    }

    /// QRE recheck N5: an unplanned run is filed under the day it ended, not the day it is reported.
    func testUnplannedRunDayIsTheDayTheRecordingEnded() throws {
        // Gregorian with the device time zone, as `Fmt.deviceDay` (verification N4: `Calendar.current` may be Buddhist or Japanese).
        var cal = Calendar(identifier: .gregorian); cal.timeZone = .current
        let now = try XCTUnwrap(cal.date(from: DateComponents(year: 2026, month: 11, day: 23, hour: 0, minute: 10)))
        let lateRun = try XCTUnwrap(cal.date(from: DateComponents(year: 2026, month: 11, day: 22, hour: 23, minute: 50)))
        XCTAssertEqual(RunReportViewModel.occurrenceDay(end: lateRun, planToday: "2026-11-23", now: now), "2026-11-22")
        let sameDay = try XCTUnwrap(cal.date(from: DateComponents(year: 2026, month: 11, day: 23, hour: 0, minute: 5)))
        XCTAssertEqual(RunReportViewModel.occurrenceDay(end: sameDay, planToday: "2026-11-23", now: now), "2026-11-23")
        XCTAssertEqual(RunReportViewModel.occurrenceDay(end: sameDay, planToday: nil, now: now), "2026-11-23")
    }
}
