import CoachingPresentation
import Foundation
import Observation

/// The onboarding flow (Figma 10): which screen is shown, what may continue, the one write (`CoachingWriting.onboard`) and the screen the
/// engine's answer leads to (`planOutcome`, never decided here). The view renders `phase` / `step` and forwards the answers to `draft`.
@Observable @MainActor
final class OnboardingViewModel {
    enum Phase: Equatable {
        /// `838:3918` "Continue de onde parou": unsent answers were found on this iPhone.
        case resume
        case form
        /// 30 "Montando seu plano": the write is in flight (one at a time).
        case building
        /// 31 Plano pronto, then 34 Primeira semana.
        case ready
        case firstWeek
        case outcome(Outcome)
    }
    /// The engine's answer, as the Figma draws it.
    enum Outcome: Equatable {
        case outsideScope                 // `838:4053`
        case heldForSafety                // `838:3689`
        case missingAnswer([String])      // `838:4011`, with the engine's missing inputs
        case notBuilt                     // `838:3972`: INVALID_INPUT and operational failures (engineering decision D27/D23, 27/11)
    }
    enum Sheet: String, Identifiable { case confirmCare, leave, account; var id: String { rawValue } }

    private(set) var phase: Phase
    private(set) var step: OnboardingStep
    var sheet: Sheet?
    var draft = OnboardingDraft()

    private let writer: CoachingWriting
    private let store: OnboardingStoring
    private let athleteId: String
    private let now: () -> Date

    init(writer: CoachingWriting, store: OnboardingStoring, athleteId: String = "synthetic-athlete", now: @escaping () -> Date = Date.init) {
        self.writer = writer; self.store = store; self.athleteId = athleteId; self.now = now
        if let saved = store.load(), let d = saved.draft, let s = saved.step, s != .opening {
            draft = d; step = s; phase = .resume
        } else {
            step = .opening; phase = .form
        }
    }

    // MARK: flow

    var flow: [OnboardingStep] { OnboardingStep.flow(for: draft) }

    /// The plan's first day: the next Monday after today, in the device's calendar ("O primeiro treino pode ser já na segunda").
    var startDay: String {
        let date = now()
        let monday = Calendar.current.nextDate(after: date, matching: DateComponents(weekday: 2), matchingPolicy: .nextTime) ?? date
        return Fmt.deviceDay(monday)
    }
    var today: String { Fmt.deviceDay(now()) }

    /// 04: the race day picked is beyond the longest plan (`838:3864`).
    var raceBeyondPlan: Bool { draft.raceDay != nil && planWeeks == nil }
    var planWeeks: Int? { draft.raceDay.flatMap { OnboardingDraft.planWeeks(start: startDay, race: $0) } }

    /// How full the current stage's segment is, 0…1 (a respiro closes it).
    var stageProgress: Double {
        let inStage = flow.filter { $0.stage == step.stage }
        guard let i = inStage.firstIndex(of: step) else { return 0 }
        return step.isRespiro ? 1 : Double(i + 1) / Double(inStage.count + 1)
    }

    var holds: [BuildHold] { draft.holds }

    var canContinue: Bool {
        switch step {
        case .raceDate: draft.answered(.raceDate) && !raceBeyondPlan
        // D19: a half or a full marathon needs hours, which the drawn wheel (min/s) cannot hold; held until the design answers.
        case .result: draft.answered(.result) && (draft.hasResult == false || ![.half, .marathon].contains(draft.resultDistance))
        case .dataUse: phase == .form && holds.isEmpty
        default: draft.answered(step)
        }
    }

    func next() {
        guard phase == .form, step != .dataUse, canContinue else { return }
        // 27b: a clinical sign marked is confirmed before continuing (`838:4148`).
        if step == .care, draft.care.contains(where: \.isClinical), sheet != .confirmCare { sheet = .confirmCare; return }
        advance()
    }

    /// 27b "Confirmar resposta".
    func confirmCare() { guard sheet == .confirmCare else { return }; sheet = nil; advance() }

    private func advance() {
        let f = flow
        guard let i = f.firstIndex(of: step), f.indices.contains(i + 1) else { return }
        step = f[i + 1]; persist()
    }

    func back() {
        guard phase == .form else { return }
        let f = flow
        guard let i = f.firstIndex(of: step), i > 0 else { return }
        step = f[i - 1]; persist()
    }

    /// 05 "Seguir sem meta", 19 "Pular", 20 "Agora não": the skip answers the step and continues. 23 "Não tenho resultado recente" shows
    /// its variant (`838:1143`), where Continuar follows.
    func skip() {
        switch step {
        case .goalTime: draft.goalSkipped = true; draft.goalMinutes = nil; draft.goalSeconds = nil
        case .bodySize: draft.bodySizeSkipped = true; draft.heightCm = nil; draft.weightKg = nil
        case .appleHealth: draft.appleHealthAnswered = true
        case .result: draft.hasResult = false; return
        default: return
        }
        next()
    }

    /// 04 "Seguir sem prova por enquanto": back to the run aim, the race answers dropped.
    func continueWithoutRace() {
        guard step == .raceDate else { return }
        draft.raceDay = nil; draft.runAim = nil; step = .runAim; persist()
    }

    // MARK: resume and leave (`838:3918`, `838:4219`)

    func resumeWhereStopped() { guard phase == .resume else { return }; phase = .form }
    /// "Recomeçar": the unsent answers are erased from this iPhone.
    func restart() { store.erase(); draft = OnboardingDraft(); step = .opening; phase = .form }
    func persist() {
        guard phase == .form || phase == .building else { return }
        store.save(OnboardingSaved(draft: draft, step: step, profile: store.load()?.profile))
    }

    // MARK: building

    /// Sends the intake once. A second call while building or after an outcome does nothing (no double enrolment). `minimumDisplay` keeps
    /// "Montando seu plano" readable (0 in tests).
    func submit(minimumDisplay: Duration = .zero) async {
        guard phase == .form, step == .dataUse, case .ready(let answers) = draft.build(athleteId: athleteId, today: today, startDate: startDay)
        else { return }
        persist()
        phase = .building
        let out = await writer.onboard(answers, consents: draft.consents)
        if minimumDisplay > .zero { try? await Task.sleep(for: minimumDisplay) }
        phase = Self.phase(for: out.answer.planOutcome)
        // Accepted: the record holds the answers now; only the local profile stays.
        if phase == .ready { store.save(OnboardingSaved(draft: nil, step: nil, profile: OnboardingProfile(draft))) }
    }

    /// The screen the Figma draws for each engine outcome (pure).
    static func phase(for outcome: PlanOutcome) -> Phase {
        switch outcome {
        case .planCreated: .ready
        case .outsideV1Scope: .outcome(.outsideScope)
        case .clinicalHumanRequired: .outcome(.heldForSafety)
        case .needsInput(let fields): .outcome(.missingAnswer(fields))
        case .invalidInput, .failed, .unrecognized: .outcome(.notBuilt)
        }
    }

    /// "Tentar de novo" (`838:3972`): the same answers, sent again (still once at a time).
    func retry(minimumDisplay: Duration = .zero) async {
        guard phase == .outcome(.notBuilt) else { return }
        phase = .form; step = .dataUse
        await submit(minimumDisplay: minimumDisplay)
    }

    /// "Revisar respostas" / "Revisar resposta" / the back of `838:4011`: back to the form, answers kept.
    func review() {
        guard case .outcome(let o) = phase else { return }
        phase = .form
        switch o {
        case .outsideScope, .heldForSafety: step = .care
        case .missingAnswer(let fields): step = Self.step(asking: fields, in: flow) ?? .dataUse
        case .notBuilt: step = .train
        }
        persist()
    }

    /// Where the form asks a field the engine named (display routing only: the engine decided what is missing).
    static func step(asking fields: [String], in flow: [OnboardingStep]) -> OnboardingStep? {
        let named: [OnboardingStep] = fields.flatMap { f -> [OnboardingStep] in
            if f.hasPrefix("athlete.event") || f.hasPrefix("event.") { return [.raceDate] }
            if f.hasPrefix("schedule.longRunDay") { return [.longRun] }
            if f.hasPrefix("schedule.") && f.hasSuffix("Minutes") { return [.duration] }
            if f.hasPrefix("schedule.") { return [.week] }
            if f.hasPrefix("recent.") { return [.runNow, .strengthYears] }
            if f.hasSuffix("TrainingMonths") { return [.runYears, .strengthYears] }
            if f.contains("ageEligibility") || f.contains("ageYears") { return [.age] }
            if f.contains("eligibility") { return [.care] }
            if f.contains("equipment") { return [.strengthPlace] }
            return []
        }
        return flow.first(where: named.contains)
    }

    // MARK: after the plan (31 → 32 → 34)

    /// 31 "Salvar meu plano" → 32 (folha de conta).
    func saveThePlan() { guard phase == .ready else { return }; sheet = .account }
    /// 32 has no account behind it (#28, D18: its actions are held). Closing it is the alpha path to the first week (Founder 27/11, "Alpha
    /// local": a temporary technical path, not an approved journey).
    func accountSheetClosed() { if phase == .ready { phase = .firstWeek } }
}

#if DEBUG
extension OnboardingViewModel {
    /// `-onboardingPhase <phase>` (fixture composition only): opens the screen a visual capture needs.
    func debugShow(_ name: String) {
        switch name {
        case "form": phase = .form
        case "building": phase = .building
        case "ready": phase = .ready
        case "firstWeek": phase = .firstWeek
        case "account": phase = .ready; sheet = .account
        case "confirmCare": phase = .form; step = .care; sheet = .confirmCare
        case "notBuilt": phase = .outcome(.notBuilt)
        case "missing": phase = .outcome(.missingAnswer([]))
        case "outside": phase = .outcome(.outsideScope)
        case "held": phase = .outcome(.heldForSafety)
        default: break
        }
    }
}
#endif
