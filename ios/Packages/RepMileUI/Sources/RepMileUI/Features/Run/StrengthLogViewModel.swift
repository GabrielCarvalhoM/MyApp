import CoachingPresentation
import Foundation
import Observation

/// Execução de força (Figma 41) and "Força avulsa": what the athlete states of a strength session and its one write
/// (`CoachingWriting.submit`). Nothing is reported as done unless the athlete says so (#37): a prescribed set enters the report only once
/// the athlete states it, by "Fiz como prescrito", by the set's own check or by giving its repetitions; a set nobody stated is absent,
/// never imputed from the prescription. The load starts empty (GAP-10) and is sent only as typed (KG, the prescription's convention); no
/// RIR is asked, so none is stated. Minutes are typed by the athlete. "Salvo" only after `WriteOutcome.kept` (GAP-12).
@Observable @MainActor
final class StrengthLogViewModel {
    enum Phase: Equatable { case editing, submitting, saved, notKept, failed(String) }

    /// One prescribed set as the athlete states it. `reps == nil`: not stated, so not recorded.
    struct SetDraft: Equatable {
        var reps: Int?
        var load = ""
    }

    /// nil = unplanned strength.
    let session: PlannedSession?
    let exercises: [PrescribedExercise]
    private(set) var sets: [String: [SetDraft]]
    var minutes: Double?
    private(set) var phase: Phase = .editing

    private let writer: CoachingWriting
    private let planToday: () -> String?
    private let now: () -> Date

    init(session: PlannedSession?, writer: CoachingWriting, planToday: @escaping () -> String?, now: @escaping () -> Date = Date.init) {
        self.session = session; self.writer = writer; self.planToday = planToday; self.now = now
        exercises = session?.prescription?.exercises ?? []
        sets = Dictionary(exercises.map { ($0.id, Array(repeating: SetDraft(), count: max(0, $0.sets))) }, uniquingKeysWith: { first, _ in first })
    }

    /// The form can change until the report is on its way or kept; a report that was not kept stays editable and resendable.
    var editable: Bool { phase != .submitting && phase != .saved }

    func draft(_ id: String, _ i: Int) -> SetDraft? { sets[id].flatMap { $0.indices.contains(i) ? $0[i] : nil } }

    /// The athlete's repetitions for one set. Zero or nothing withdraws the set from the report.
    func setReps(_ reps: Int?, _ id: String, _ i: Int) {
        guard editable, draft(id, i) != nil else { return }
        sets[id]?[i].reps = reps.flatMap { $0 > 0 ? $0 : nil }
    }

    func setLoad(_ text: String, _ id: String, _ i: Int) {
        guard editable, draft(id, i) != nil else { return }
        sets[id]?[i].load = text
    }

    /// The set's check: states it at the prescribed repetitions, or withdraws it. A set without prescribed repetitions is stated by giving
    /// its own count; the app never supplies one.
    func toggleSet(_ e: PrescribedExercise, _ i: Int) {
        guard canToggle(e, i) else { return }
        setReps(draft(e.id, i)?.reps == nil ? e.reps : nil, e.id, i)
    }

    func canToggle(_ e: PrescribedExercise, _ i: Int) -> Bool {
        guard editable, let d = draft(e.id, i) else { return false }
        return d.reps != nil || (e.reps ?? 0) > 0
    }

    /// "Fiz como prescrito" is offered only when the prescription gives every set a repetition count: it states exactly those sets and
    /// counts (edits made before are replaced by the prescription the athlete confirms). Loads are left as typed.
    var canConfirmAsPrescribed: Bool { editable && !exercises.isEmpty && exercises.allSatisfy { ($0.reps ?? 0) > 0 } }

    func confirmAsPrescribed() {
        guard canConfirmAsPrescribed else { return }
        for e in exercises { for i in (sets[e.id] ?? []).indices { sets[e.id]?[i].reps = e.reps } }
    }

    var statedSetCount: Int { sets.values.reduce(0) { $0 + $1.filter { $0.reps != nil }.count } }

    /// Minutes are always the athlete's; a planned session also needs at least one stated set (an untouched form sends nothing).
    var canSend: Bool { editable && (minutes ?? 0) > 0 && (exercises.isEmpty || statedSetCount > 0) }

    /// The contract's reading of a strength session done (CoachingCore `bindObservations` / `strengthLogs`: a shortfall is fewer sets, or
    /// fewer repetitions, than prescribed): every prescribed set stated, none below its prescribed repetitions. Anything less is partial. An
    /// unplanned session has no prescription; its stated minutes are the whole report.
    var completed: Bool {
        exercises.allSatisfy { e in
            let stated = (sets[e.id] ?? []).compactMap(\.reps)
            return stated.count >= e.sets && stated.allSatisfy { $0 >= (e.reps ?? 1) }
        }
    }

    /// The report exactly as the shared types encode it: only stated sets, each with the athlete's repetitions and, when typed, the load.
    /// An exercise with no stated set is absent.
    func actual() -> StrengthActual {
        let logged = exercises.compactMap { e -> LoggedExerciseEntry? in
            let stated = (sets[e.id] ?? []).compactMap { d in d.reps.map { LoggedSetEntry(reps: $0, load: Self.loggedLoad(d.load, for: e), rir: nil) } }
            return stated.isEmpty ? nil : LoggedExerciseEntry(id: e.id, sets: stated)
        }
        return StrengthActual(completed: completed, minutes: minutes, exercises: logged)
    }

    /// A typed load as logged: KG in the prescription's convention, never converted; bodyweight rows carry none.
    static func loggedLoad(_ text: String, for e: PrescribedExercise) -> LoggedLoadEntry? {
        guard e.load?.mode.raw != "BODYWEIGHT",
              let value = Double(text.trimmingCharacters(in: .whitespaces).replacingOccurrences(of: ",", with: ".")), value.isFinite, value >= 0 else { return nil }
        return LoggedLoadEntry(value: value, unit: .kg, convention: LoadConvention(rawValue: e.load?.convention?.raw ?? "") ?? .total)
    }

    /// An unplanned report carries `observedAt` (FND-ABC-01).
    func observation() -> AthleteObservation {
        let end = RunReportViewModel.instant(now())
        if let s = session { return .plannedStrength(sessionId: s.id, occurrenceDate: s.date, observedAt: end, actual: actual(), response: .unknown) }
        return .unplannedStrength(occurrenceDate: planToday() ?? Fmt.deviceDay(now()), observedAt: end, actual: actual(), response: .unknown)
    }

    /// One write at a time: a second call while submitting, or after the report is kept, does nothing.
    func send() async {
        guard canSend else { return }
        phase = .submitting
        let outcome = await writer.submit(ReviewRequest(.sessionReports([observation()]), eligibility: nil))
        phase = Self.phase(for: outcome)
    }

    /// `WriteOutcome` → what the form shows. Pure: tested without UI. An engine error is shown with its code, never as saved.
    static func phase(for outcome: WriteOutcome) -> Phase {
        guard outcome.answer.ok else { return .failed(outcome.answer.error?.code.raw ?? "UNKNOWN") }
        let kept = outcome.answer.recorded?.first.map { outcome.kept.contains($0) } ?? false
        return kept ? .saved : .notKept
    }
}
