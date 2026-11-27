import XCTest
@testable import HealthKitIngest
import IntegrationContracts

/// #48 P3-3: the athlete's switch turned off while the observer or background delivery is being registered leaves nothing registered.
final class ObservationRaceTests: XCTestCase {
    func make(_ rig: Rig, _ reader: GatedReader) -> HealthKitIngestor { rig.make(reader: reader) }

    func offDuring(_ gate: GatedReader.Gate) async throws -> (GatedReader, ScriptedSink, HealthKitIngestor) {
        let sink = ScriptedSink(); let rig = Rig(sink: sink); let reader = GatedReader()
        reader.hold(gate)
        let ing = make(rig, reader)
        let started = Task { await ing.start() }
        try await eventually { reader.isHolding }
        XCTAssertTrue(reader.isHolding)
        let off = Task { try await ing.setEnabled(false) }
        try await Task.sleep(nanoseconds: 50_000_000)        // setEnabled(false) runs while the registration is held
        reader.release()
        await started.value; try await off.value
        return (reader, sink, ing)
    }

    func testTurningOffWhileTheObserverRegistersLeavesNothingRegistered() async throws {
        let (reader, sink, ing) = try await offDuring(.startObserving)
        XCTAssertFalse(reader.inner.observing, "the observer registered after the switch went off is stopped")
        XCTAssertFalse(reader.inner.backgroundDelivery)
        reader.inner.add(workout("A", end: at("2026-11-17", "07:45"))); await reader.inner.fire(); await ing.settled()
        XCTAssertEqual(sink.deliveries.count, 0); let st = await ing.status(); XCTAssertTrue(st.disabledInApp)
    }

    func testTurningOffWhileBackgroundDeliveryRegistersLeavesNothingRegistered() async throws {
        let (reader, sink, ing) = try await offDuring(.backgroundOn)
        XCTAssertFalse(reader.inner.observing); XCTAssertFalse(reader.inner.backgroundDelivery, "background delivery enabled late is disabled again")
        await ing.readNow(); XCTAssertEqual(sink.deliveries.count, 0)
    }

    /// Off then on again during one registration: the last switch wins, registered once, and delivery works.
    func testOffAndOnAgainDuringARegistrationEndsRegistered() async throws {
        let sink = ScriptedSink(); let rig = Rig(sink: sink); let reader = GatedReader()
        reader.hold(.startObserving)
        let ing = make(rig, reader)
        let started = Task { await ing.start() }
        try await eventually { reader.isHolding }
        let off = Task { try await ing.setEnabled(false) }
        try await Task.sleep(nanoseconds: 30_000_000)
        let on = Task { try await ing.setEnabled(true) }
        try await Task.sleep(nanoseconds: 30_000_000)
        reader.release()
        await started.value; try await off.value; try await on.value
        XCTAssertTrue(reader.inner.observing); XCTAssertTrue(reader.inner.backgroundDelivery)
        reader.inner.add(workout("A", end: at("2026-11-17", "07:45"))); await reader.inner.fire(); await ing.settled()
        XCTAssertEqual(sink.deliveries.count, 1)
    }

    /// Turning the switch off at launch (a crash between the switch's write and the HealthKit calls) is repaired by the next start.
    func testAStartWithTheSwitchOffDisablesWhatIsRegistered() async throws {
        let sink = ScriptedSink(); let rig = Rig(sink: sink)
        let ing = rig.make(); await ing.start()
        try await ing.setEnabled(false)
        try await rig.reader.setBackgroundDelivery(true)       // what a crash could have left behind
        let relaunched = rig.make(); await relaunched.start()
        XCTAssertFalse(rig.reader.backgroundDelivery); XCTAssertFalse(rig.reader.observing)
    }
}

/// #48 / QRE-B-R2-03: an observer notification's delivery runs inside a background window asked for before the completion handler.
final class BackgroundWindowTests: XCTestCase {
    func testTheObserverDeliveryRunsInsideAWindowAskedForBeforeTheCompletion() async throws {
        let window = RecordingWindow(); let inner = ScriptedSink(); let rig = Rig(sink: NotingSink(inner, window), window: window)
        let ing = rig.make(); await ing.start()
        inner.holdNext = true
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        await rig.reader.fire(); window.note("completion")    // HealthKit calls the completion handler when `fire` returns
        try await eventually { inner.isHolding }
        XCTAssertNil(window.at("end1"), "the window stays open while the delivery is in flight")
        inner.release(); await ing.settled()
        let e = window.events
        XCTAssertLessThan(try XCTUnwrap(window.at("begin1")), try XCTUnwrap(window.at("completion")), "asked for before the completion: \(e)")
        XCTAssertEqual(e.filter { $0 != "completion" }, ["begin1", "deliver:A", "answered:A", "end1"])
        let c = await ing.counts(); XCTAssertEqual(c.delivered, 1)
        XCTAssertTrue(rig.log.lines.contains("hki.backgroundWindow code=GRANTED")); XCTAssertTrue(rig.log.lines.contains("hki.backgroundWindow code=ENDED"))
    }

    /// A delivery loop already running (started by a launch) when the notification arrives: the window lasts until that loop has also sent
    /// what the notification read.
    func testTheWindowLastsUntilARunningDeliveryLoopHasEnded() async throws {
        let window = RecordingWindow(); let inner = ScriptedSink(); let rig = Rig(sink: NotingSink(inner, window), window: window)
        inner.holdNext = true
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        let ing = rig.make()
        let launch = Task { await ing.start() }
        try await eventually { inner.isHolding }
        rig.reader.add(workout("B", end: at("2026-11-18", "07:45")))
        await rig.reader.fire()
        try await Task.sleep(nanoseconds: 30_000_000)
        XCTAssertNil(window.at("end1"))
        inner.release(); await launch.value; await ing.settled()
        XCTAssertEqual(window.events, ["deliver:A", "begin1", "answered:A", "deliver:B", "answered:B", "end1"])
    }

    /// A retryLater parks the loop on a timer: the window is released at once, never held through the backoff.
    func testTheWindowIsNotHeldThroughABackoff() async throws {
        let window = RecordingWindow(); let inner = ScriptedSink(); let rig = Rig(sink: NotingSink(inner, window), window: window)
        let ing = rig.make(); await ing.start()
        inner.answers = [{ _ in .retryLater(code: "BUSY") }]
        rig.reader.add(workout("A", end: at("2026-11-17", "07:45")))
        await rig.reader.fire(); await ing.settled()
        XCTAssertEqual(window.events, ["begin1", "deliver:A", "answered:A", "end1"]); XCTAssertEqual(rig.scheduler.delays.count, 1)
    }
}

/// The production window's own logic, with the system call scripted (macOS has no `performExpiringActivity`).
final class ProcessBackgroundWindowTests: XCTestCase {
    final class System: @unchecked Sendable {
        private let lock = NSLock(); private var blocks: [@Sendable (Bool) -> Void] = []
        func keep(_ b: @escaping @Sendable (Bool) -> Void) { lock.withLock { blocks.append(b) } }
        var last: (@Sendable (Bool) -> Void)? { lock.withLock { blocks.last } }
    }

    func testGrantedHoldsUntilEnd() async throws {
        let w = ProcessBackgroundWindow(perform: { _, block in DispatchQueue.global().async { block(false) } })
        let t = await w.begin("test"); let a = try XCTUnwrap(t as? ExpiringActivity)
        XCTAssertEqual(t.grant, .granted); XCTAssertTrue(a.isHolding, "the assertion is held until end()")
        t.end(); try await eventually { !a.isHolding }; XCTAssertFalse(a.isHolding); XCTAssertFalse(t.expired)
    }

    func testRefusedAtOnce() async {
        let w = ProcessBackgroundWindow(perform: { _, block in DispatchQueue.global().async { block(true) } })
        let t = await w.begin("test"); XCTAssertEqual(t.grant, .refused); XCTAssertTrue(t.expired); t.end()
    }

    func testExpiryReleasesTheHoldingCall() async throws {
        let system = System()
        let w = ProcessBackgroundWindow(perform: { _, block in system.keep(block); DispatchQueue.global().async { block(false) } })
        let t = await w.begin("test"); let a = try XCTUnwrap(t as? ExpiringActivity)
        try await eventually { a.isHolding }
        DispatchQueue.global().async { system.last?(true) }                 // the system: time is up
        try await eventually { !a.isHolding }
        XCTAssertFalse(a.isHolding); XCTAssertTrue(t.expired); XCTAssertEqual(t.grant, .granted)
        t.end()
    }

    func testNoAnswerNeverHoldsTheCompletionLongerThanTheBound() async {
        var w = ProcessBackgroundWindow(perform: { _, _ in }); w.confirmationWait = 0.05
        let start = Date(); let t = await w.begin("test")
        XCTAssertEqual(t.grant, .unconfirmed); XCTAssertLessThan(Date().timeIntervalSince(start), 1); t.end()
    }

    func testTheDefaultWindowBeginsAndEndsOnThisPlatform() async throws {
        let t = await ProcessBackgroundWindow().begin("test"); let a = try XCTUnwrap(t as? ExpiringActivity)
        XCTAssertEqual(t.grant, .granted); t.end(); try await eventually { !a.isHolding }; XCTAssertFalse(a.isHolding)
    }
}
