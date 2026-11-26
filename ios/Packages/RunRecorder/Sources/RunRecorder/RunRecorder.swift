import CoachingPresentation
import Foundation
import IntegrationContracts
import Observation

/// Where fixes and authorisation come from: CoreLocation on the device, a scripted source in tests and the simulator.
public protocol LocationSource: AnyObject {
    var state: LocationState { get }
    var onFix: ((Fix) -> Void)? { get set }
    var onState: ((LocationState) -> Void)? { get set }
    func start()
    func stop()
}

/// The clock, injected so tests drive time.
public protocol RecorderClock: Sendable { func now() -> Date }
public struct SystemClock: RecorderClock { public init() {}; public func now() -> Date { Date() } }

/// The iPhone's run recorder (front C, no UI). Its screens only render it. It answers time from a timer and steps from the prescription;
/// a distance is shown locally and never leaves the device.
@MainActor @Observable
public final class RunRecorder {
    public private(set) var state: RecordingState?
    public private(set) var location: LocationState
    let source: LocationSource
    let store: RecordingStore
    let clock: RecorderClock

    public init(source: LocationSource, store: RecordingStore, clock: RecorderClock = SystemClock()) {
        self.source = source; self.store = store; self.clock = clock
        location = source.state
        source.onState = { [weak self] s in MainActor.assumeIsolated { self?.location = s } }
        source.onFix = { [weak self] f in MainActor.assumeIsolated { self?.receive(f) } }
    }

    /// After a process death: the recording comes back from the temporary file. A running one keeps counting from `segmentStart`; a finished
    /// one that was not closed (its report not done) comes back too, so the report is never silently lost.
    public func resumeIfNeeded() {
        guard state == nil, let saved = store.loadActive() else { return }
        state = saved
        if saved.phase == .running { source.start() }
    }

    /// The finished recording in memory (e.g. restored after a process death on the report screen).
    public var finishedRecording: FinishedRecording? {
        guard let s = state, s.phase == .finished else { return nil }
        return FinishedRecording(ref: ref(s), sessionDate: s.sessionDate, movingMinutes: s.accumulated / 60, local: local(s))
    }

    public func start(sessionId: String?, sessionDate: String?, steps: [RecorderStep]) {
        let now = clock.now()
        state = RecordingState(id: UUID().uuidString, sessionId: sessionId, sessionDate: sessionDate, steps: steps, startedAt: now, phase: .running,
                               accumulated: 0, segmentStart: now, endedAt: nil, segment: 0, fixes: [], reportedEventId: nil)
        persist()
        source.start()
    }

    public func pause() {
        guard var s = state, s.phase == .running else { return }
        s.accumulated = s.movingTime(at: clock.now()); s.segmentStart = nil; s.phase = .paused
        state = s; persist()
    }

    public func resume() {
        guard var s = state, s.phase == .paused else { return }
        s.segmentStart = clock.now(); s.phase = .running; s.segment += 1
        state = s; persist()
        source.start()  // idempotent; needed after a process death while paused
    }

    /// The athlete moves on from a distance step when no usable distance exists (GPS denied, no signal): never converted from time.
    public func advanceDistanceStep() {
        guard var s = state, s.phase != .finished, let c = currentStep, case .metres = c.step.target else { return }
        s.distanceStepEnd[c.index] = s.movingTime(at: clock.now()); state = s; persist()
    }

    /// Ends the recording. The moving minutes are what the athlete's report may carry; the local measurement stays on the device.
    @discardableResult
    public func finish() -> FinishedRecording? {
        guard var s = state, s.phase != .finished else { return nil }
        let now = clock.now()
        s.accumulated = s.movingTime(at: now); s.segmentStart = nil; s.phase = .finished; s.endedAt = now
        state = s
        source.stop()
        persist()
        store.index(ref(s))
        return FinishedRecording(ref: ref(s), sessionDate: s.sessionDate, movingMinutes: s.accumulated / 60, local: local(s))
    }

    /// The host accepted the athlete's report of this recording: B may now link a matching watch workout to it.
    public func markReported(eventId: String) {
        guard var s = state else { return }
        s.reportedEventId = eventId; state = s; persist(); store.index(ref(s))
    }

    /// The athlete abandons the recording: nothing kept, nothing indexed.
    public func discard() {
        if let s = state { store.remove(id: s.id) }
        source.stop(); state = nil
    }

    /// Account erasure (G07): every recording, the index and the active file; nothing of a run stays on the device.
    public func eraseAllRecordings() { source.stop(); state = nil; store.eraseAll() }

    /// Closes the screen after a finished recording (the file stays until erased; the index keeps the ref).
    public func close() { if state?.phase == .finished { store.clearActive(); state = nil } }

    // MARK: derived

    public var movingTime: TimeInterval { state?.movingTime(at: clock.now()) ?? 0 }
    public var measuredMetres: Double? {
        guard let s = state else { return nil }
        let d = Geo.distance(s.fixes)
        return d > 0 ? d : nil
    }

    /// The current step and its progress: by time for a timed step, by measured distance (or the athlete's advance) for a distance step.
    public var currentStep: (index: Int, step: RecorderStep, remaining: Double)? {
        guard let s = state, !s.steps.isEmpty else { return nil }
        let now = s.movingTime(at: clock.now())
        let metres = measuredMetres ?? 0
        var stepStart: TimeInterval = 0
        for (i, step) in s.steps.enumerated() {
            switch step.target {
            case .seconds(let sec):
                if now - stepStart < sec { return (i, step, sec - (now - stepStart)) }
                stepStart += sec
            case .metres(let m):
                if let end = s.distanceStepEnd[i] { stepStart = end; continue }
                return (i, step, max(0, m - (metres - (s.distanceStepStart[i] ?? metres))))
            }
        }
        return nil
    }

    private func receive(_ f: Fix) {
        guard var s = state, s.phase == .running else { return }
        var fix = f; fix.segment = s.segment
        s.fixes.append(fix); state = s
        // A distance step starts counting at the first fix inside it, and ends when the measured distance reaches its target.
        if let c = currentStep, case .metres(let m) = c.step.target {
            let d = measuredMetres ?? 0
            if s.distanceStepStart[c.index] == nil { s.distanceStepStart[c.index] = d }
            if d - (s.distanceStepStart[c.index] ?? d) >= m { s.distanceStepEnd[c.index] = s.movingTime(at: clock.now()) }
            state = s
        }
        location = f.horizontalAccuracy < 0 ? .noSignal : f.horizontalAccuracy > Geo.usableAccuracy ? .poorAccuracy : .good
        if s.fixes.count % 5 == 0 { persist() }
    }

    private func persist() { if let s = state { store.saveActive(s) } }

    private func ref(_ s: RecordingState) -> AppRecordedRunRef {
        AppRecordedRunRef(id: s.id, sessionId: s.sessionId, start: s.startedAt, end: s.endedAt ?? clock.now(), reportedEventId: s.reportedEventId)
    }

    private func local(_ s: RecordingState) -> LocalMeasurement {
        let d = Geo.distance(s.fixes)
        var splits: [Double] = []
        let ok = s.fixes.filter { $0.horizontalAccuracy >= 0 && $0.horizontalAccuracy <= Geo.usableAccuracy }
        var acc = 0.0, lastSplitAt = ok.first?.t
        for (a, b) in zip(ok, ok.dropFirst()) where a.segment == b.segment {
            acc += Geo.metres(a, b)
            if acc >= 1000, let start = lastSplitAt { splits.append(b.t.timeIntervalSince(start)); acc -= 1000; lastSplitAt = b.t }
        }
        return LocalMeasurement(distanceMetres: d > 0 ? d : nil, splitsSeconds: splits, route: s.fixes,
                                paceSecondsPerKm: d > 0 ? s.accumulated / (d / 1000) : nil)
    }
}

/// A scripted location source: tests and the simulator feed fixes; no CoreLocation.
public final class SimulatedLocationSource: LocationSource {
    public var state: LocationState
    public var onFix: ((Fix) -> Void)?
    public var onState: ((LocationState) -> Void)?
    public private(set) var running = false
    public init(state: LocationState = .good) { self.state = state }
    public func start() { running = true }
    public func stop() { running = false }
    public func send(_ f: Fix) { if running { onFix?(f) } }
    public func set(_ s: LocationState) { state = s; onState?(s) }
}
