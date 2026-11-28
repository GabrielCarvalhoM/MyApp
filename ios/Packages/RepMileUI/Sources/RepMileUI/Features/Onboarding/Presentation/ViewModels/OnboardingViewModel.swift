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
        /// 31 Plano pronto, 33 Assinar (build de teste, D18 A), then 34 Primeira semana.
        case ready
        case subscribe
        case firstWeek
        case outcome(Outcome)
    }
    /// The engine's answer, as the Figma draws it.
    enum Outcome: Equatable {
        case outsideScope(OutsideScope)   // `838:4053`, with the engine's scope (QRE P3-7)
        case heldForSafety                // `838:3689`
        case missingAnswer([String])      // `838:4011`, with the engine's missing inputs
        case notBuilt                     // `838:3972`: INVALID_INPUT and operational failures (engineering decision D27/D23, 27/11)
    }
    enum Sheet: String, Identifiable { case confirmCare, leave, account; var id: String { rawValue } }

    private(set) var phase: Phase
    private(set) var step: OnboardingStep
    var sheet: Sheet?
    var draft = OnboardingDraft()
    /// Debug captures only (`-onboardingPhase buildingProgress`): the rows of 30 already done. Always nil in release.
    private(set) var debugBuildingShown: Int?

    private let writer: CoachingWriting
    private let store: OnboardingStoring
    private let athleteId: String
    private let now: () -> Date

    init(writer: CoachingWriting, store: OnboardingStoring, athleteId: String = "synthetic-athlete", now: @escaping () -> Date = Date.init) {
        self.writer = writer; self.store = store; self.athleteId = athleteId; self.now = now
        let saved = store.load()
        if saved?.heldForSafety == true {
            // SSCTR C4: after CLINICAL_HUMAN_REQUIRED the athlete resumes on "Retido por segurança", never on an editable form that could
            // be sent again with other answers. The readiness-declaration path (D24) is what lifts it, not a new onboarding.
            draft = saved?.draft ?? OnboardingDraft(); step = .dataUse; phase = .outcome(.heldForSafety)
        } else if let d = saved?.draft, let s = saved?.step, s != .opening {
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
    var raceBeyondPlan: Bool { draft.raceDay != nil && planWeeks == nil && !raceTooClose }
    /// 04 `1491:8266`: before the start, or under 7 days from it for a 5 km, 10 km or half marathon (the marathon exception: preparatory plan).
    var raceTooClose: Bool {
        guard let d = draft.raceDay, let gap = OnboardingDraft.days(from: startDay, to: d) else { return false }
        return gap < 0 || (gap < OnboardingDraft.minimumDaysToRace && draft.runAim?.race != .marathon)
    }
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
        case .raceDate: draft.answered(.raceDate) && !raceBeyondPlan && !raceTooClose
        // QRE P3-6: "Montar meu plano" opens only when the request can actually be built.
        case .dataUse: phase == .form && buildable
        default: draft.answered(step)
        }
    }

    /// The request is complete and no decision holds it.
    var buildable: Bool {
        if case .ready = draft.build(athleteId: athleteId, today: today, startDate: startDay) { return true }
        return false
    }

    private var isHeldForSafety: Bool { store.load()?.heldForSafety == true }

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
        case .result:
            // "Não tenho resultado recente": no detail of a result stays behind (QRE P3-9), the local conditions included.
            draft.hasResult = false; draft.resultDistance = nil; draft.resultHours = nil; draft.resultMinutes = nil; draft.resultSeconds = nil; draft.resultDay = nil
            draft.resultMeasure = nil; draft.resultEffort = nil; draft.resultTolerated = nil; draft.resultConditions = nil
            return
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
    /// D21 A (#113): × on 02–29 and on "Falta uma resposta" goes straight to `838:3918`, the answers kept (nothing is lost, so no
    /// confirmation: the Founder's condition).
    func leaveToResume() {
        switch phase {
        case .form: persist(); sheet = nil; phase = .resume
        case .outcome(.missingAnswer): phase = .resume
        default: return
        }
    }
    /// "Recomeçar": the unsent answers are erased from this iPhone.
    func restart() { guard phase == .resume else { return }; store.erase(); draft = OnboardingDraft(); step = .opening; phase = .form }
    func persist() {
        guard phase == .form || phase == .building else { return }
        store.save(OnboardingSaved(draft: draft, step: step, profile: store.load()?.profile))
    }

    // MARK: building

    /// Sends the intake once. A second call while building or after an outcome does nothing (no double enrolment). `minimumDisplay` keeps
    /// "Montando seu plano" readable (0 in tests).
    func submit(minimumDisplay: Duration = .zero) async {
        guard phase == .form, step == .dataUse, !isHeldForSafety,
              case .ready(let answers) = draft.build(athleteId: athleteId, today: today, startDate: startDay) else { return }
        persist()
        phase = .building
        let out = await writer.onboard(answers, consents: draft.consents)
        let next = Self.phase(for: out.answer.planOutcome)
        // Stored before the minimum display (QRE P3-5): a kill during "Montando" never brings the sent draft back as unsent.
        switch next {
        case .ready: store.save(OnboardingSaved(draft: nil, step: nil, profile: OnboardingProfile(draft)))   // the record holds the answers now
        case .outcome(.heldForSafety): store.save(OnboardingSaved(draft: draft, step: .dataUse, profile: store.load()?.profile, heldForSafety: true))
        default: break
        }
        if minimumDisplay > .zero { try? await Task.sleep(for: minimumDisplay) }
        phase = next
    }

    /// "Tentar de novo" (`838:3972`): the same answers, sent again (still once at a time).
    func retry(minimumDisplay: Duration = .zero) async {
        guard phase == .outcome(.notBuilt) else { return }
        phase = .form; step = .dataUse
        await submit(minimumDisplay: minimumDisplay)
    }

    /// "Revisar respostas" / "Revisar resposta" / the back of `838:4011`: back to the form, answers kept. Never from "Retido por
    /// segurança" (SSCTR C4): that screen has no review and the held draft is never sent again.
    func review() {
        guard case .outcome(let o) = phase, o != .heldForSafety else { return }
        phase = .form
        step = Self.reviewStep(for: o, in: flow)
        persist()
    }

    // MARK: after the plan (31 → 32 → 34)

    /// 31 "Salvar meu plano" → 32 (folha de conta).
    func saveThePlan() { guard phase == .ready else { return }; sheet = .account }
    /// 32 alpha local (`1491:8743`, D18 conta B): "Continuar neste iPhone" → 33 build de teste (`1491:8865`).
    func continueOnThisIPhone() { guard phase == .ready, sheet == .account else { return }; sheet = nil; phase = .subscribe }
    /// 33 build de teste: "Continuar no teste, sem cobrança" or × → 34. Nothing is bought, nothing is charged.
    func subscriptionDone() { guard phase == .subscribe else { return }; phase = .firstWeek }
}

#if DEBUG
extension OnboardingViewModel {
    /// `-onboardingPhase <phase>` (fixture composition only): opens the screen a visual capture needs.
    func debugShow(_ name: String) {
        switch name {
        case "form": phase = .form
        case "building": phase = .building
        case "buildingProgress": phase = .building; debugBuildingShown = 2
        case "ready": phase = .ready
        case "firstWeek": phase = .firstWeek
        case "account": phase = .ready; sheet = .account
        case "subscribe": phase = .subscribe
        case "confirmCare": phase = .form; step = .care; sheet = .confirmCare
        case "notBuilt": phase = .outcome(.notBuilt)
        case "missing": phase = .outcome(.missingAnswer([]))
        case "outside": phase = .outcome(.outsideScope(.age))
        case "held": phase = .outcome(.heldForSafety)
        default: break
        }
    }
}
#endif
