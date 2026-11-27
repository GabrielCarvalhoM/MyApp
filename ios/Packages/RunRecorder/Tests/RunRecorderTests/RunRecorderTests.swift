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

    /// QRE: killed while paused, then resumed: GPS restarts and fixes count again.
    func testKilledWhilePausedResumesWithFixes() {
        let clock = TestClock()
        var r: RunRecorder? = RunRecorder(source: SimulatedLocationSource(), store: RecordingStore(directory: dir), clock: clock)
        r?.start(sessionId: nil, sessionDate: nil, steps: steps); r?.pause(); r = nil
        let src = SimulatedLocationSource()
        let again = RunRecorder(source: src, store: RecordingStore(directory: dir), clock: clock)
        again.resumeIfNeeded()
        XCTAssertFalse(src.running, "paused: no GPS until resumed")
        again.resume()
        XCTAssertTrue(src.running)
        for i in 0..<3 { clock.advance(4); src.send(fix(i, clock: clock)) }
        XCTAssertGreaterThan(again.measuredMetres ?? 0, 0)
    }

    /// QRE: killed on the report screen: the finished recording comes back with its planned identity, so the report is not lost.
    func testFinishedUnreportedRecordingComesBack() {
        let clock = TestClock()
        var r: RunRecorder? = RunRecorder(source: SimulatedLocationSource(), store: RecordingStore(directory: dir), clock: clock)
        r?.start(sessionId: "w0-run-d6", sessionDate: "2026-11-22", steps: steps); clock.advance(600); r?.finish(); r = nil
        let again = RunRecorder(source: SimulatedLocationSource(), store: RecordingStore(directory: dir), clock: clock)
        again.resumeIfNeeded()
        XCTAssertEqual(again.finishedRecording?.ref.sessionId, "w0-run-d6")
        XCTAssertEqual(again.finishedRecording?.sessionDate, "2026-11-22")
        XCTAssertEqual(again.finishedRecording?.movingMinutes ?? 0, 10, accuracy: 0.01)
    }

    func testPoorAccuracyIsVisibleAndNotCounted() {
        let clock = TestClock(), src = SimulatedLocationSource()
        let r = RunRecorder(source: src, store: RecordingStore(directory: dir), clock: clock)
        r.start(sessionId: nil, sessionDate: nil, steps: steps)
        for i in 0..<5 { clock.advance(4); src.send(fix(i, clock: clock, accuracy: 80)) }
        XCTAssertEqual(r.location, .poorAccuracy)
        XCTAssertNil(r.measuredMetres)
    }

    func testDiscardAndEraseAll() async throws {
        let clock = TestClock(), store = RecordingStore(directory: dir)
        let r = RunRecorder(source: SimulatedLocationSource(), store: store, clock: clock)
        r.start(sessionId: nil, sessionDate: nil, steps: steps)
        r.discard()
        XCTAssertNil(store.loadActive())
        r.start(sessionId: nil, sessionDate: nil, steps: steps); clock.advance(60); r.finish()
        try store.eraseAll()
        let none = await store.recordings(overlapping: DateInterval(start: .distantPast, end: .distantFuture))
        XCTAssertTrue(none.isEmpty)
    }
}

/// #76: the erasure reports a failure (the composition keeps "erasure pending" and does not open), and the store's folder is written in one
/// place only (`standardDirectory`).
@MainActor
final class RecordingStoreErasureTests: XCTestCase {
    var dir: URL!
    override func setUp() { dir = FileManager.default.temporaryDirectory.appendingPathComponent("rr-erase-\(UUID().uuidString)") }
    override func tearDown() {
        try? FileManager.default.setAttributes([.posixPermissions: 0o755], ofItemAtPath: dir.path)
        try? FileManager.default.removeItem(at: dir)
    }
    let everything = DateInterval(start: .distantPast, end: .distantFuture)

    /// A store holding a finished (indexed) recording, a running one in the active file, and a stray file.
    private func filled() async -> (RecordingStore, RunRecorder) {
        let clock = TestClock(), store = RecordingStore(directory: dir)
        let r = RunRecorder(source: SimulatedLocationSource(), store: store, clock: clock)
        r.start(sessionId: nil, sessionDate: nil, steps: [RecorderStep(kind: "STEADY", target: .seconds(600))]); clock.advance(120); r.finish()
        r.close()
        r.start(sessionId: nil, sessionDate: nil, steps: [RecorderStep(kind: "STEADY", target: .seconds(600))]); clock.advance(30)
        try? Data("{}".utf8).write(to: dir.appendingPathComponent("stray.json"))
        let indexed = await store.recordings(overlapping: everything)
        XCTAssertEqual(indexed.count, 1)
        XCTAssertNotNil(store.loadActive())
        return (store, r)
    }

    func testEraseAllEmptiesAFilledFolderAndTheStoreKeepsWorking() async throws {
        let (store, _) = await filled()
        try store.eraseAll()
        XCTAssertEqual(try FileManager.default.contentsOfDirectory(atPath: dir.path), [], "the folder is recreated empty")
        let none = await store.recordings(overlapping: everything)
        XCTAssertTrue(none.isEmpty)
        XCTAssertNil(store.loadActive())
        XCTAssertNoThrow(try store.eraseAll(), "erasing an empty store is fine")
        try FileManager.default.removeItem(at: dir)
        XCTAssertNoThrow(try store.eraseAll(), "a missing folder is already erased")
    }

    func testTheRecorderEraseDropsTheRunInMemoryAndOnDisk() async throws {
        let (store, r) = await filled()
        try r.eraseAllRecordings()
        XCTAssertNil(r.state)
        XCTAssertNil(store.loadActive())
        let none = await store.recordings(overlapping: everything)
        XCTAssertTrue(none.isEmpty)
    }

    /// A removal that fails throws, and nothing claims it is erased: the index still answers what is left.
    func testAFailedRemovalThrows() async throws {
        let (store, r) = await filled()
        try FileManager.default.setAttributes([.posixPermissions: 0o555], ofItemAtPath: dir.path)
        XCTAssertThrowsError(try store.eraseAll()) { XCTAssertEqual($0 as? RecordingStore.ErasureError, .notErased) }
        XCTAssertThrowsError(try r.eraseAllRecordings()) { XCTAssertEqual($0 as? RecordingStore.ErasureError, .notErased) }
        XCTAssertNil(r.state, "the recording in memory is dropped either way")
        let left = await store.recordings(overlapping: everything)
        XCTAssertFalse(left.isEmpty, "a failed erasure is visible through the index")
        try FileManager.default.setAttributes([.posixPermissions: 0o755], ofItemAtPath: dir.path)
        try store.eraseAll()
        let none = await store.recordings(overlapping: everything)
        XCTAssertTrue(none.isEmpty, "the next erasure finishes it")
    }

    /// Read only: `standard()` would create the folder on the machine running the tests.
    func testTheStandardDirectoryIsApplicationSupportRunRecorder() {
        let support = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        XCTAssertEqual(RecordingStore.standardDirectory.standardizedFileURL, support.appendingPathComponent("RunRecorder", isDirectory: true).standardizedFileURL)
    }
}
