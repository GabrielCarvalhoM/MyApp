import Foundation
import XCTest
@testable @_spi(CoachingHostTesting) import CoachingHost
import CoachingPresentation
import IntegrationContracts

/// A B double for #49: every call recorded in order; purges can fail; the signal and the purge can be held at a gate (to prove that A does
/// not await them inside B's own call). Synthetic only.
final class GatedQueueControl: DeviceQueueControl, @unchecked Sendable {
    actor Gate {
        private var open = true
        private var waiters: [CheckedContinuation<Void, Never>] = []
        func close() { open = false }
        func release() { open = true; waiters.forEach { $0.resume() }; waiters = [] }
        func pass() async { if open { return }; await withCheckedContinuation { waiters.append($0) } }
    }
    private let lock = NSLock()
    private var _calls: [String] = []
    private var _failPurges = false
    var calls: [String] { lock.withLock { _calls } }
    var failPurges: Bool { get { lock.withLock { _failPurges } } set { lock.withLock { _failPurges = newValue } } }
    let signalGate = Gate(), purgeGate = Gate()
    func deliveryConditionsChanged() async { lock.withLock { _calls.append("deliveryConditionsChanged") }; await signalGate.pass() }
    func purge(_ reason: QueuePurgeReason) async throws {
        await purgeGate.pass()
        let fail = lock.withLock { () -> Bool in _calls.append("purge:\(reason.rawValue)\(_failPurges ? "!" : "")"); return _failPurges }
        if fail { throw NSError(domain: "b", code: 1) }
    }
    func reset() { lock.withLock { _calls = [] } }
}

enum Wait {
    /// Whether `t` finishes within `seconds`; `then` runs once that is known (it opens the gate a blocked call waits on), before returning.
    static func finishes<T>(_ t: Task<T, Never>, within seconds: Double, then: @escaping () async -> Void) async -> Bool {
        await withTaskGroup(of: Bool.self) { g in
            g.addTask { _ = await t.value; return true }
            g.addTask { try? await Task.sleep(nanoseconds: UInt64(seconds * 1_000_000_000)); return false }
            let first = await g.next() ?? false
            await then()
            g.cancelAll()
            return first
        }
    }
    /// Polls `condition` until it holds or `seconds` pass.
    static func until(_ seconds: Double = 5, _ condition: () -> Bool) async -> Bool {
        let deadline = Date().addingTimeInterval(seconds)
        while Date() < deadline { if condition() { return true }; try? await Task.sleep(nanoseconds: 20_000_000) }
        return condition()
    }
}

/// #49 (front A's integration conditions): P2-1, P2-2 and P3-4. Each test fails without its fix.
final class IntegrationConditionsTests: XCTestCase {
    func open(_ name: String, b: GatedQueueControl, clock: TestClock = TestClock(), athlete: String? = nil, clean: Bool) async throws -> CoachingHost {
        if clean { TestEnv.cleanup(name) }
        let h = try await CoachingHost.openForTesting(.init(athleteId: athlete ?? "athlete-\(name)", root: clean ? TestEnv.root(name) : TestEnv.rootNoClean(name)),
                                                      keychainPrefix: TestEnv.prefix(name), queueControl: b, clock: clock,
                                                      testKeychainDirectory: TestEnv.keychainDirectory)
        h.timezoneOffsetOverride = -180
        return h
    }
    func onDisk(_ h: CoachingHost) throws -> HostSignals { try JSONDecoder().decode(HostSignals.self, from: Data(contentsOf: h.signals.file)) }

    /// P2-1 (FND-ABC-04b): two instances for the same athlete. One records CLINICAL_HUMAN_REQUIRED; the other, which read the signals before,
    /// then writes an unrelated signal, and both then interleave writes of other signals. The scope is never erased, and the other instance's
    /// startability reads it from disk.
    func testTwoInstancesNeverEraseTheClinicalScope() async throws {
        let f = try await HostFixture.make("i49-p21")
        _ = await f.host.onboard(Athlete.answers(), consents: Athlete.all)
        let g = try await f.reopen()                       // a second instance, same athlete and store; both stay open
        let first = try await f.host.allWeeks().get().flatMap(\.sessions).first { $0.executable }?.id
        let id = try XCTUnwrap(first)
        let before = await g.host.startability(sessionId: id)
        XCTAssertEqual(before, .startable, "g has read the signals: no scope")
        f.clock.set(day: "2026-11-20", "10:00")
        let r = await f.host.restart(Athlete.answers(start: "2026-11-23", assessedAt: "2026-11-20", pain: true))
        XCTAssertEqual(r.answer.planOutcome, .clinicalHumanRequired)
        // g: an unrelated write that sets (and, refused, withdraws) the erasure's screen-required signal.
        _ = await g.host.eraseHealthFacts(eventIds: ["no-such-event"])
        XCTAssertEqual(try onDisk(f.host).scope, .clinicalHumanRequired, "an unrelated write by another instance kept the scope")
        // Interleaved writes of two other signals from both instances.
        @Sendable func writes(_ h: CoachingHost, _ set: @escaping @Sendable (inout HostSignals, Bool) -> Void) async {
            for i in 0..<15 { _ = await h.onQueue { h.signals.update { set(&$0, i % 2 == 0) } } }
        }
        async let a: Void = writes(f.host) { $0.warningSignsAsked = $1 }
        async let b: Void = writes(g.host) { $0.screenRequiredAfterErasure = $1 }
        _ = await (a, b)
        let disk = try onDisk(f.host)
        XCTAssertEqual(disk.scope, .clinicalHumanRequired)
        XCTAssertTrue(disk.warningSignsAsked, "f's last write survived g's writes"); XCTAssertTrue(disk.screenRequiredAfterErasure, "g's last write survived f's")
        let there = await g.host.startability(sessionId: id)
        XCTAssertEqual(there, .notStartable(reason: .clinicalHumanRequired), "startability reads the scope from disk, not g's earlier copy")
        emit("i49-p2-1", ["scopeOnDisk": disk.scope?.rawValue ?? "nil", "otherInstance": "\(there)"])
        TestEnv.cleanup("i49-p21")
    }

    /// P2-2: the fresh-install purge is a durable intent written before the marker. B fails: it stays owed, blocks a new enrolment, and is
    /// retried before and after each enrolment; once B works, the next enrolment settles it first and goes through.
    func testFreshInstallPurgeFailsThenIsRetriedByTheNextWrite() async throws {
        let name = "i49-p22-fresh", b = GatedQueueControl()
        b.failPurges = true
        let h = try await open(name, b: b, clean: true)
        XCTAssertEqual(h.reconciliation, .freshInstallPurged)
        XCTAssertTrue(h.purgeIntent.isOwed(.freshInstall), "owed durably: B's purge failed")
        XCTAssertEqual(b.calls, ["purge:FRESH_INSTALL!", "deliveryConditionsChanged"])
        let refused = await h.onboard(Athlete.answers(), consents: Athlete.all)
        XCTAssertEqual(refused.answer.error?.code.raw, HostCode.hostUnavailable, "no enrolment while B still holds a queue it was told to drop")
        XCTAssertEqual(b.calls.filter { $0.hasPrefix("purge") }.count, 3, "retried before and after that enrolment")
        b.failPurges = false
        let o = await h.onboard(Athlete.answers(), consents: Athlete.all)
        XCTAssertEqual(o.answer.planOutcome, .planCreated, "settled first, then enrolled")
        XCTAssertFalse(h.purgeIntent.isOwed(.freshInstall))
        XCTAssertEqual(b.calls.filter { $0.hasPrefix("purge") }, ["purge:FRESH_INSTALL!", "purge:FRESH_INSTALL!", "purge:FRESH_INSTALL!", "purge:FRESH_INSTALL"])
        emit("i49-p2-2-fresh", ["purges": b.calls.filter { $0.hasPrefix("purge") }])
        TestEnv.cleanup(name)
    }

    /// P2-2: the record-loss purge. The intent is written before the acknowledgement; if it cannot be written, nothing is sent. B fails: the
    /// intent stays owed and the next start re-sends it. A refused acknowledgement (NOT_LOST) withdraws its intent and purges nothing.
    func testRecordLossPurgeFailsThenIsRetriedAtTheNextStart() async throws {
        let name = "i49-p22-loss", b = GatedQueueControl()
        let h = try await open(name, b: b, clean: true)
        _ = await h.onboard(Athlete.answers(), consents: Athlete.all)
        b.reset()
        let notLost = await h.acknowledgeRecordLoss()
        XCTAssertFalse(notLost.answer.ok); XCTAssertFalse(h.purgeIntent.isOwed(.recordLossAcknowledged)); XCTAssertEqual(b.calls, [])
        try FileManager.default.removeItem(at: h.store.file(h.athleteId))     // the record is lost (the anchor is there)
        h.purgeIntent.writeHook = { false }
        let notDurable = await h.acknowledgeRecordLoss()
        XCTAssertEqual(notDurable.answer.error?.code, "PERSISTENCE_FAILURE", "no acknowledgement without its purge intent on disk first")
        guard case .failure(let e) = await h.plan(week: nil) else { return XCTFail("the record is not lost any more") }
        XCTAssertEqual(e.code, "RECORD_LOST", "nothing was sent")
        h.purgeIntent.writeHook = nil
        b.failPurges = true
        let ack = await h.acknowledgeRecordLoss()
        XCTAssertTrue(ack.answer.ok)
        XCTAssertTrue(h.purgeIntent.isOwed(.recordLossAcknowledged)); XCTAssertEqual(b.calls, ["purge:RECORD_LOSS_ACKNOWLEDGED!"])
        b.failPurges = false
        let b2 = GatedQueueControl()
        let h2 = try await open(name, b: b2, athlete: h.athleteId, clean: false)
        XCTAssertEqual(b2.calls, ["purge:RECORD_LOSS_ACKNOWLEDGED", "deliveryConditionsChanged"], "re-sent at the next start, then available")
        XCTAssertFalse(h2.purgeIntent.isOwed(.recordLossAcknowledged))
        emit("i49-p2-2-loss", ["notLost": "withdrawn", "intentNotDurable": "PERSISTENCE_FAILURE", "failed": "owed", "nextStart": "settled"])
        TestEnv.cleanup(name)
    }

    /// Review P1-1: a safety signal's mark, the operation it guards and its resolution are ONE hold of the athlete's lock. Probed when each
    /// operation's `perform` returns (between the operation and its resolution): another holder cannot take the lock there.
    func testSignalsAndTheirOperationShareOneLockHold() async throws {
        let f = try await HostFixture.make("i49-hold")
        let lockPath = f.host.store.lockFile(f.host.athleteId).path
        var probed: [String: Bool] = [:]
        f.host.afterPerformForTesting = { fn in
            let fd = Darwin.open(lockPath, O_CREAT | O_RDWR, 0o600); defer { close(fd) }
            let free = flock(fd, LOCK_EX | LOCK_NB) == 0; if free { flock(fd, LOCK_UN) }
            probed[fn] = !free
        }
        _ = await f.host.onboard(Athlete.answers(), consents: Athlete.all)
        f.clock.set(day: "2026-11-17", "19:00")
        _ = await f.host.submit(ReviewRequest(.sessionReports([]), eligibility: Athlete.screen("2026-11-17")))
        _ = await f.host.eraseHealthFacts(eventIds: ["no-such-event"])
        f.clock.set(day: "2026-11-20", "10:00")
        _ = await f.host.restart(Athlete.answers(start: "2026-11-23", assessedAt: "2026-11-20", pain: true))
        f.host.afterPerformForTesting = nil
        XCTAssertEqual(probed, ["onboard": true, "submit": true, "eraseHealthFacts": true, "restart": true], "held between the operation and its signals")
        emit("i49-review-p1-1-hold", probed.mapValues { "\($0)" })
        TestEnv.cleanup("i49-hold")
    }

    /// Review P1-1: a change left pending (its write failed) is replayed whole only over the file it was decided against. Over a file another
    /// writer changed since, it only tightens: a stale release never clears a newer, stricter signal.
    func testAStalePendingReleaseNeverClearsANewerSignal() throws {
        TestEnv.cleanup("i49-replay")
        let dir = TestEnv.root("i49-replay"); try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        let file = dir.appendingPathComponent("signals.json")
        let a = SignalStore(file: file), b = SignalStore(file: file)
        XCTAssertTrue(a.update { $0.pendingIntake = true })
        a.writeHook = { false }
        XCTAssertFalse(a.update { $0.pendingIntake = false; $0.scope = nil })      // a release, not durable: pending
        XCTAssertTrue(b.update { $0.scope = .clinicalHumanRequired })               // another writer, later, stricter
        a.writeHook = nil
        XCTAssertTrue(a.flush())
        let disk = try JSONDecoder().decode(HostSignals.self, from: Data(contentsOf: file))
        XCTAssertEqual(disk, HostSignals(scope: .clinicalHumanRequired, pendingIntake: true), "the stale release tightened nothing away")
        // Over an unchanged file the pending change is replayed whole.
        a.writeHook = { false }; XCTAssertFalse(a.update { $0.pendingIntake = false }); a.writeHook = nil
        XCTAssertTrue(a.flush())
        XCTAssertFalse(try JSONDecoder().decode(HostSignals.self, from: Data(contentsOf: file)).pendingIntake)
        TestEnv.cleanup("i49-replay")
    }

    /// P3-4 (CCP-B-04 rule 1): a delivery that ends a clock refusal tells B, but never awaits B inside B's own pending call: `deliver`
    /// returns while B's `deliveryConditionsChanged()` is still held; the signal arrives anyway.
    func testDeliverNeverAwaitsBsSignalInsideBsCall() async throws {
        let name = "i49-p34", b = GatedQueueControl(), clock = TestClock()
        let h = try await open(name, b: b, clock: clock, clean: true)
        _ = await h.onboard(Athlete.answers(), consents: Athlete.all)
        let wall = clock.wall
        clock.setWallOnly(wall + 86_400_000)
        let ahead = await h.submit(ReviewRequest(.sessionReports([]), eligibility: Athlete.screen("2026-11-15")))
        XCTAssertEqual(ahead.answer.error?.code, "CLOCK_AHEAD_OF_REFERENCE")
        clock.setWallOnly(wall)
        b.reset()
        await b.signalGate.close()
        let dd = try DeviceDelivery(deliveryId: UUID().uuidString, activities: [DeviceActivity(activityId: "HK-i49-p34", observedAt: "2026-11-14T11:00:00-03:00", actual: DeviceActual(completed: true, minutes: 30))])
        let t = Task { await h.deliver(dd) }
        let returned = await Wait.finishes(t, within: 5, then: { await b.signalGate.release() })
        XCTAssertTrue(returned, "deliver returned while B's signal was held (A did not await it inside B's call)")
        guard case .answered = await t.value else { return XCTFail("the delivery was not committed") }
        let signalled = await Wait.until { b.calls.contains("deliveryConditionsChanged") }
        XCTAssertTrue(signalled, "the clock recovery still reaches B")
        emit("i49-p3-4", ["returnedWhileSignalHeld": returned, "signalled": signalled])
        TestEnv.cleanup(name)
    }

    /// P3-5 (code review R1 #5b): an erasure completed by a delivery owes B a purge, sent outside B's call: `deliver` returns while that
    /// purge is held, and the fence becomes ERASED once it returns.
    func testPurgeOwedByADeliveryIsSentOutsideBsCall() async throws {
        let name = "i49-purge-after-delivery", b = GatedQueueControl()
        let h = try await open(name, b: b, clean: true)
        _ = await h.onboard(Athlete.answers(), consents: Athlete.all)
        h.store.failErasureForTesting = true
        let e = await h.eraseAccount()
        XCTAssertEqual(e.answer.error?.code, "PERSISTENCE_FAILURE"); XCTAssertEqual(h.fence.state(h.tag), .requested)
        h.store.failErasureForTesting = false
        b.reset()
        await b.purgeGate.close()
        let dd = try DeviceDelivery(deliveryId: UUID().uuidString, activities: [DeviceActivity(activityId: "HK-i49-pd", observedAt: "2026-11-14T11:00:00-03:00", actual: DeviceActual(completed: true, minutes: 30))])
        let t = Task { await h.deliver(dd) }
        let returned = await Wait.finishes(t, within: 5, then: {
            XCTAssertEqual(h.fence.state(h.tag), .nativeDone, "the delivery completed the native side; the purge is owed")
            await b.purgeGate.release()
        })
        XCTAssertTrue(returned, "deliver returned while the owed purge was held")
        let result = await t.value
        XCTAssertEqual(result, .halted(code: "GONE"))
        let erased = await Wait.until { h.fence.state(h.tag) == .erased }
        XCTAssertTrue(erased); XCTAssertEqual(b.calls, ["purge:ACCOUNT_ERASED"])
        emit("i49-purge-after-delivery", ["returnedWhilePurgeHeld": "\(returned)", "fence": h.fence.state(h.tag)?.rawValue ?? "nil"])
        TestEnv.cleanup(name)
    }
}
