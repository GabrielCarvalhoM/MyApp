import Foundation
import IntegrationContracts
import XCTest
@testable import RunRecorder

final class TestClock: RecorderClock, @unchecked Sendable {
    var t = Date(timeIntervalSince1970: 1_795_000_000)
    func now() -> Date { t }
    func advance(_ s: TimeInterval) { t = t.addingTimeInterval(s) }
}

/// Handoff C §8.7: with simulated location, the recorder follows the steps, pauses and resumes, survives a killed process, and no measured
/// distance reaches a report (the recorder exposes moving minutes for the report and keeps distance in `LocalMeasurement` only).
@MainActor
final class RunRecorderTests: XCTestCase {
    var dir: URL!
    override func setUp() { dir = FileManager.default.temporaryDirectory.appendingPathComponent("rr-\(UUID().uuidString)") }
    override func tearDown() { try? FileManager.default.removeItem(at: dir) }

    let steps = [RecorderStep(kind: "WARMUP", target: .seconds(300)), RecorderStep(kind: "STEADY", target: .seconds(1800)),
                 RecorderStep(kind: "COOLDOWN", target: .seconds(300))]

    /// A straight line north, ~11.1 m per 1e-4 degree of latitude.
    func fix(_ i: Int, clock: TestClock, accuracy: Double = 5) -> Fix { Fix(t: clock.now(), lat: -23.55 + Double(i) * 0.0001, lon: -46.63, horizontalAccuracy: accuracy) }

    func testFollowsTimedSteps() {
        let clock = TestClock(), src = SimulatedLocationSource()
        let r = RunRecorder(source: src, store: RecordingStore(directory: dir), clock: clock)
        r.start(sessionId: "w0-run-d1", sessionDate: "2026-11-17", steps: steps)
        XCTAssertEqual(r.currentStep?.index, 0)
        clock.advance(299); XCTAssertEqual(r.currentStep?.index, 0)
        clock.advance(2); XCTAssertEqual(r.currentStep?.index, 1)
        XCTAssertEqual(r.currentStep?.remaining ?? 0, 1799, accuracy: 0.01)
        clock.advance(1800); XCTAssertEqual(r.currentStep?.index, 2)
        clock.advance(400); XCTAssertNil(r.currentStep)
    }

    func testPauseStopsTimeAndDistance() {
        let clock = TestClock(), src = SimulatedLocationSource()
        let r = RunRecorder(source: src, store: RecordingStore(directory: dir), clock: clock)
        r.start(sessionId: nil, sessionDate: nil, steps: steps)
        for i in 0..<10 { clock.advance(4); src.send(fix(i, clock: clock)) }
        r.pause()
        let t = r.movingTime, d = r.measuredMetres ?? 0
        clock.advance(600)
        src.send(fix(500, clock: clock))  // a fix while paused is ignored
        XCTAssertEqual(r.movingTime, t)
        XCTAssertEqual(r.measuredMetres ?? 0, d, accuracy: 0.001)
        r.resume()
        src.send(fix(600, clock: clock))  // far away: a new segment never adds the jump
        clock.advance(4); src.send(fix(601, clock: clock))
        XCTAssertEqual(r.movingTime, t + 4, accuracy: 0.001)
        XCTAssertEqual(r.measuredMetres ?? 0, d + 11.1, accuracy: 0.5)
    }

    func testKilledProcessResumes() {
        let clock = TestClock(), src = SimulatedLocationSource()
        var r: RunRecorder? = RunRecorder(source: src, store: RecordingStore(directory: dir), clock: clock)
        r?.start(sessionId: "w0-run-d1", sessionDate: "2026-11-17", steps: steps)
        clock.advance(120)
        r?.pause(); r?.resume()  // persists
        let id = r?.state?.id
        r = nil  // the process dies
        clock.advance(60)
        let again = RunRecorder(source: SimulatedLocationSource(), store: RecordingStore(directory: dir), clock: clock)
        again.resumeIfNeeded()
        XCTAssertEqual(again.state?.id, id)
        XCTAssertEqual(again.movingTime, 180, accuracy: 0.001, "time keeps counting from the running segment")
        XCTAssertEqual(again.currentStep?.index, 0)
    }

    func testFinishIndexesWithoutDistanceInTheReportSide() async {
        let clock = TestClock(), src = SimulatedLocationSource()
        let store = RecordingStore(directory: dir)
        let r = RunRecorder(source: src, store: store, clock: clock)
        r.start(sessionId: nil, sessionDate: nil, steps: [])
        for i in 0..<200 { clock.advance(3); src.send(fix(i, clock: clock)) }
        let done = r.finish()
        XCTAssertEqual(done?.movingMinutes ?? 0, 10, accuracy: 0.01)
        XCTAssertGreaterThan(done?.local.distanceMetres ?? 0, 2000)
        XCTAssertNil(done?.ref.reportedEventId, "not reported yet: B holds a matching workout until it settles")
        let found = await store.recordings(overlapping: DateInterval(start: clock.now().addingTimeInterval(-60), duration: 30))
        XCTAssertEqual(found.map(\.id), [done!.ref.id])
        // The index carries identity and interval only: no coordinate, no distance.
        let json = String(data: try! Data(contentsOf: store.indexURL), encoding: .utf8)!
        XCTAssertFalse(json.contains("lat"))
        XCTAssertFalse(json.contains("distance"))
        r.markReported(eventId: "ob_1")
        let again = await store.recordings(overlapping: done!.ref.interval)
        XCTAssertEqual(again.first?.reportedEventId, "ob_1")
        XCTAssertEqual(RecordingDedupe.decision(workout: done!.ref.interval, recordings: again), .setAside(code: RecordingDedupe.overlapsAppRecording))
    }

    func testDistanceStepWithoutGpsAdvancesOnlyByTheAthlete() {
        let clock = TestClock(), src = SimulatedLocationSource(state: .denied)
        let r = RunRecorder(source: src, store: RecordingStore(directory: dir), clock: clock)
        r.start(sessionId: nil, sessionDate: nil, steps: [RecorderStep(kind: "WORK", target: .metres(400)), RecorderStep(kind: "RECOVERY", target: .seconds(90))])
        clock.advance(3600)
        XCTAssertEqual(r.currentStep?.index, 0, "time never converts into distance")
        r.advanceDistanceStep()
        XCTAssertEqual(r.currentStep?.index, 1, "the recovery counts from the end of the distance step")
        XCTAssertEqual(r.currentStep?.remaining ?? 0, 90, accuracy: 0.01)
        clock.advance(91); XCTAssertNil(r.currentStep)
        XCTAssertEqual(r.location, .denied)
    }

    func testDistanceStepEndsByMeasuredDistance() {
        let clock = TestClock(), src = SimulatedLocationSource()
        let r = RunRecorder(source: src, store: RecordingStore(directory: dir), clock: clock)
        r.start(sessionId: nil, sessionDate: nil, steps: [RecorderStep(kind: "WORK", target: .metres(100)), RecorderStep(kind: "RECOVERY", target: .seconds(60))])
        for i in 0..<12 { clock.advance(3); src.send(fix(i, clock: clock)) }  // ~122 m
        XCTAssertEqual(r.currentStep?.index, 1)
        XCTAssertLessThanOrEqual(r.currentStep?.remaining ?? 0, 60)
    }

    func testPoorAccuracyIsVisibleAndNotCounted() {
        let clock = TestClock(), src = SimulatedLocationSource()
        let r = RunRecorder(source: src, store: RecordingStore(directory: dir), clock: clock)
        r.start(sessionId: nil, sessionDate: nil, steps: steps)
        for i in 0..<5 { clock.advance(4); src.send(fix(i, clock: clock, accuracy: 80)) }
        XCTAssertEqual(r.location, .poorAccuracy)
        XCTAssertNil(r.measuredMetres)
    }

    func testDiscardAndEraseAll() async {
        let clock = TestClock(), store = RecordingStore(directory: dir)
        let r = RunRecorder(source: SimulatedLocationSource(), store: store, clock: clock)
        r.start(sessionId: nil, sessionDate: nil, steps: steps)
        r.discard()
        XCTAssertNil(store.loadActive())
        r.start(sessionId: nil, sessionDate: nil, steps: steps); clock.advance(60); r.finish()
        store.eraseAll()
        let none = await store.recordings(overlapping: DateInterval(start: .distantPast, end: .distantFuture))
        XCTAssertTrue(none.isEmpty)
    }
}
