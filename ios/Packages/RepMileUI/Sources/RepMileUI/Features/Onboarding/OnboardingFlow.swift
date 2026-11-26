import CoachingPresentation
import SwiftUI

/// What the onboarding form collects, turned into the shared `OnboardingAnswers` only (handoff C §4). Safety fields: `specialPopulation` is
/// always sent (`[]` for "Nenhum destes"; no choice = cannot continue), the eligibility flags stay nil until answered (never false by default).
struct OnboardingDraft: Equatable {
    enum Care: Equatable { case pregnancy, postpartum, noneOfThese }
    var age = 30
    var runGoal = "RACE"
    var eventKind = "10K"
    var eventDate = Calendar.current.date(byAdding: .day, value: 84, to: Date()) ?? Date()
    var strengthGoal = "RUNNING_SUPPORT"
    var runMonths = 12
    var strengthMonths = 6
    var runDaysPerWeek = 3
    var runMinutesPerWeek = 120
    var longestRun = 50
    var strengthDaysPerWeek = 2
    var runDays: Set<Int> = [1, 3, 5]
    var strengthDays: Set<Int> = [0, 3]
    var longRunDay = 5
    var runMinutes = 40
    var strengthMinutes = 40
    var longRunMinutes = 70
    var runTurn = "AM"
    var strengthTurn = "PM"
    var weeks = 8
    var equipment: Set<String> = ["DUMBBELLS", "BENCH"]
    var anchorTime = ""
    var anchorDistance = "10K"
    var anchorDate = Calendar.current.date(byAdding: .day, value: -21, to: Date()) ?? Date()
    var hasAnchor = false
    var care: Care?
    var eligibility = EligibilityScreen(status: nil, assessedAt: "", pain: nil, persistentPain: nil, injury: nil, illness: nil, functionalLimitation: nil, clinicalConcern: nil)
    var consents: [ConsentPurpose: Bool] = [:]

    static func seconds(_ s: String) -> Double? {
        let parts = s.split(separator: ":").compactMap { Double($0) }
        guard (2...3).contains(parts.count), parts.count == s.split(separator: ":").count else { return nil }
        return parts.reduce(0) { $0 * 60 + $1 }
    }

    var careAnswered: Bool { care != nil }
    var eligibilityAnswered: Bool {
        let flags = [eligibility.pain, eligibility.persistentPain, eligibility.injury, eligibility.illness, eligibility.functionalLimitation, eligibility.clinicalConcern]
        return flags.allSatisfy { $0 != nil } && (eligibility.statesAClinicalFlag || eligibility.status == .nonclinicalConfirmed)
    }
    var consentsAnswered: Bool { ConsentPurpose.allCases.allSatisfy { consents[$0] != nil } }

    /// The shared request. `id` and the dates of the plan-local day come from the host side in integration (A sets the athlete id).
    func answers(athleteId: String, today: String, startDate: String) -> OnboardingAnswers? {
        guard let care, eligibilityAnswered else { return nil }
        var e = eligibility; e.assessedAt = today
        let special: [SpecialPopulation] = care == .pregnancy ? [.pregnancy] : care == .postpartum ? [.postpartum] : []
        var anchors: [PerformanceAnchor] = []
        if hasAnchor, let s = Self.seconds(anchorTime) {
            anchors.append(PerformanceAnchor(kind: "RACE_RESULT", distance: anchorDistance, seconds: s, date: Fmt.dayString(anchorDate), measurement: "GPS"))
        }
        let event = runGoal == "RACE" ? GoalEvent(kind: eventKind, date: Fmt.dayString(eventDate)) : nil
        return OnboardingAnswers(
            athlete: AthleteIntake(id: athleteId, ageYears: age, eligibility: e, specialPopulation: special, strengthTrainingMonths: strengthMonths,
                                   runTrainingMonths: runMonths, exerciseRotationPreference: "COACH_DECIDES",
                                   goals: IntakeGoals(run: RunGoal(kind: runGoal, event: event), strength: strengthGoal), equipment: equipment.sorted(),
                                   recent: RecentTraining(strengthDaysPerWeek: strengthDaysPerWeek, runDaysPerWeek: runDaysPerWeek, runMinutesPerWeek: runMinutesPerWeek,
                                                          longestRunMinutes: longestRun),
                                   performanceAnchors: anchors),
            schedule: TrainingSchedule(strengthDays: strengthDays.sorted(), strengthMinutes: strengthMinutes, runDays: runDays.sorted(), runMinutes: runMinutes,
                                       longRunMinutes: longRunMinutes, longRunDay: longRunDay, runTurn: runTurn, strengthTurn: strengthTurn),
            weeks: weeks, startDate: startDate)
    }

    var consentsValue: Consents { Consents(coaching: consents[.coaching] ?? false, healthSignals: consents[.healthSignals] ?? false, learning: consents[.learning] ?? false) }
}

/// Onboarding (Figma page 10; Cuidados `836:3299`; out of scope `838:4053`). Every answer the engine reads is asked; the outcome is the engine's
/// (`BoundaryAnswer.planOutcome`): a plan, "Plano indisponível · sinal informado no cadastro", a professional assessment, or a missing answer.
struct OnboardingFlow: View {
    enum Step: Int, CaseIterable { case welcome, age, goals, experience, schedule, equipment, anchor, care, consents }
    enum Phase: Equatable { case form, building, outcome(PlanOutcome) }
    @Environment(AppModel.self) private var model
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    var onEnrolled: () -> Void
    @State private var step: Step = .welcome
    @State private var draft = OnboardingDraft()
    @State private var phase: Phase = .form

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            switch phase {
            case .form: form
            case .building: building
            case .outcome(let o): outcome(o)
            }
        }
        .background(RM.Palette.fundoApp.ignoresSafeArea())
        .accessibilityElement(children: .contain).accessibilityIdentifier("screen-onboarding")
    }

    // MARK: form

    private var form: some View {
        VStack(alignment: .leading, spacing: 0) {
            if step != .welcome {
                HStack {
                    Button { withAnimation { step = Step(rawValue: step.rawValue - 1) ?? .welcome } } label: { RMIconView(.chevronEsquerda, size: 22).foregroundStyle(RM.Palette.textoPrimario) }
                        .accessibilityLabel(L.t("ob.back"))
                    Spacer()
                    Text(L.f("ob.step", "\(step.rawValue)", "\(Step.allCases.count - 1)")).rmText(.micro, RM.Palette.textoTerciario)
                }
                .padding(.horizontal, RM.Space.gutter).padding(.top, 8)
                ProgressView(value: Double(step.rawValue), total: Double(Step.allCases.count - 1)).tint(RM.Palette.agora).padding(.horizontal, RM.Space.gutter).padding(.top, 8)
            }
            ScrollView {
                VStack(alignment: .leading, spacing: 18) { stepBody }
                    .padding(RM.Space.gutter)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .scrollIndicators(.hidden)
            VStack(spacing: 6) {
                if step == .care, !draft.careAnswered { Text(L.t("ob.care.required")).rmText(.detalhe, RM.Palette.textoSecundario) }
                PrimaryActionButton(step == .welcome ? L.t("ob.start") : step == .consents ? L.t("ob.build") : L.t("ob.next"), icon: .chevronDireita, enabled: canContinue) { advance() }
                    .accessibilityIdentifier("ob-next")
            }
            .padding(RM.Space.gutter)
        }
    }

    private var canContinue: Bool {
        switch step {
        case .schedule: !draft.runDays.isEmpty
        case .anchor: !draft.hasAnchor || OnboardingDraft.seconds(draft.anchorTime) != nil
        case .care: draft.careAnswered && draft.eligibilityAnswered
        case .consents: draft.consentsAnswered
        default: true
        }
    }

    private func advance() {
        if let next = Step(rawValue: step.rawValue + 1) { withAnimation(.easeInOut(duration: 0.25)) { step = next } } else { Task { await submit() } }
    }

    @ViewBuilder private var stepBody: some View {
        switch step {
        case .welcome:
            RMIllustration.caderno.image.resizable().scaledToFit().frame(maxHeight: 260).frame(maxWidth: .infinity).accessibilityHidden(true)
            Text(L.t("ob.welcome.title")).rmText(.manchete)
            Text(L.t("ob.welcome.body")).rmText(.corpo, RM.Palette.textoSecundario)
        case .age:
            Text(L.t("ob.age.title")).rmText(.manchete)
            Stepper(value: $draft.age, in: 18...80) { Text(L.f("ob.age.value", "\(draft.age)")).rmText(.numeroL) }.accessibilityIdentifier("ob-age")
            Text(L.t("ob.age.note")).rmText(.detalhe, RM.Palette.textoSecundario)
        case .goals:
            Text(L.t("ob.goal.title")).rmText(.manchete)
            choices(["RACE", "PERFORMANCE", "REGULAR", "GENERAL"], selected: draft.runGoal, prefix: "goal.run") { draft.runGoal = $0 }
            if draft.runGoal == "RACE" {
                Text(L.t("ob.event.title")).rmText(.titulo)
                chips(["5K", "10K", "HALF_MARATHON", "MARATHON"], selected: [draft.eventKind], prefix: "event") { draft.eventKind = $0 }
                DatePicker("", selection: $draft.eventDate, in: Date()..., displayedComponents: .date).labelsHidden().tint(RM.Palette.corrida)
            }
            Text(L.t("ob.strength.title")).rmText(.titulo)
            choices(["RUNNING_SUPPORT", "STRENGTH", "HYPERTROPHY", "MAINTAIN", "GENERAL"], selected: draft.strengthGoal, prefix: "goal.strength") { draft.strengthGoal = $0 }
        case .experience:
            Text(L.t("ob.experience.title")).rmText(.manchete)
            number(L.t("ob.runMonths"), $draft.runMonths, 0...240)
            number(L.t("ob.strengthMonths"), $draft.strengthMonths, 0...240)
            Text(L.t("ob.recent.title")).rmText(.titulo)
            number(L.t("ob.runDays"), $draft.runDaysPerWeek, 0...7)
            number(L.t("ob.runMinutes"), $draft.runMinutesPerWeek, 0...900, step: 10)
            number(L.t("ob.longest"), $draft.longestRun, 0...300, step: 5)
            number(L.t("ob.strengthDays"), $draft.strengthDaysPerWeek, 0...7)
        case .schedule:
            Text(L.t("ob.schedule.title")).rmText(.manchete)
            Text(L.t("ob.schedule.run")).rmText(.rotulo, RM.Palette.textoSecundario)
            weekdays(draft.runDays) { d in if draft.runDays.contains(d) { draft.runDays.remove(d) } else { draft.runDays.insert(d) } }
            Text(L.t("ob.schedule.strength")).rmText(.rotulo, RM.Palette.textoSecundario)
            weekdays(draft.strengthDays) { d in if draft.strengthDays.contains(d) { draft.strengthDays.remove(d) } else { draft.strengthDays.insert(d) } }
            Text(L.t("ob.schedule.long")).rmText(.rotulo, RM.Palette.textoSecundario)
            weekdays([draft.longRunDay]) { draft.longRunDay = $0 }
            number(L.t("ob.schedule.runMinutes"), $draft.runMinutes, 15...180, step: 5)
            number(L.t("ob.schedule.longMinutes"), $draft.longRunMinutes, 20...240, step: 5)
            number(L.t("ob.schedule.strengthMinutes"), $draft.strengthMinutes, 15...120, step: 5)
            Text(L.t("ob.schedule.runTurn")).rmText(.rotulo, RM.Palette.textoSecundario)
            chips(["AM", "PM"], selected: [draft.runTurn], prefix: "turn.short") { draft.runTurn = $0 }
            Text(L.t("ob.schedule.strengthTurn")).rmText(.rotulo, RM.Palette.textoSecundario)
            chips(["AM", "PM"], selected: [draft.strengthTurn], prefix: "turn.short") { draft.strengthTurn = $0 }
            Text(L.t("ob.weeks")).rmText(.rotulo, RM.Palette.textoSecundario)
            chips(["4", "8", "12", "16"], selected: ["\(draft.weeks)"], prefix: nil) { draft.weeks = Int($0) ?? 8 }
        case .equipment:
            Text(L.t("ob.equipment.title")).rmText(.manchete)
            chips(["DUMBBELLS", "BENCH", "BARBELL", "RACK", "KETTLEBELL", "MACHINES", "BANDS", "PULL_UP_BAR"], selected: draft.equipment, prefix: "equipment") { e in
                if draft.equipment.contains(e) { draft.equipment.remove(e) } else { draft.equipment.insert(e) }
            }
        case .anchor:
            Text(L.t("ob.anchor.title")).rmText(.manchete)
            Text(L.t("ob.anchor.body")).rmText(.corpo, RM.Palette.textoSecundario)
            Toggle(isOn: $draft.hasAnchor) { Text(L.t("ob.anchor.add")).rmText(.subtitulo) }.tint(RM.Palette.corrida).accessibilityIdentifier("ob-anchor-toggle")
            if draft.hasAnchor {
                chips(["5K", "10K", "HALF_MARATHON", "MARATHON"], selected: [draft.anchorDistance], prefix: "event") { draft.anchorDistance = $0 }
                TextField(L.t("ob.anchor.time"), text: $draft.anchorTime).keyboardType(.numbersAndPunctuation).rmText(.numeroM)
                    .padding(12).background(RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 12)).accessibilityIdentifier("ob-anchor-time")
                DatePicker(L.t("ob.anchor.date"), selection: $draft.anchorDate, in: ...Date(), displayedComponents: .date).tint(RM.Palette.corrida)
            }
        case .care:
            Text(L.t("ob.care.title")).rmText(.manchete)
            Text(L.t("ob.care.body")).rmText(.corpo, RM.Palette.textoSecundario)
            VStack(spacing: 8) {
                careOption(.pregnancy, "care.PREGNANCY"); careOption(.postpartum, "care.POSTPARTUM"); careOption(.noneOfThese, "care.none")
            }
            Text(L.t("ob.eligibility.body")).rmText(.detalhe, RM.Palette.textoSecundario).padding(.top, 8)
            EligibilityForm(screen: $draft.eligibility)
        case .consents:
            Text(L.t("ob.consents.title")).rmText(.manchete)
            Text(L.t("ob.consents.body")).rmText(.corpo, RM.Palette.textoSecundario)
            ForEach(ConsentPurpose.allCases, id: \.self) { p in
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text(L.t("profile.consent." + p.rawValue)).rmText(.subtitulo).frame(maxWidth: .infinity, alignment: .leading)
                        YesNo(value: Binding(get: { draft.consents[p] }, set: { draft.consents[p] = $0 }), id: "consent-\(p.rawValue)")
                    }
                    Text(L.t("profile.consent." + p.rawValue + ".detail")).rmText(.detalhe, RM.Palette.textoSecundario)
                }
                RMDivider()
            }
        }
    }

    private func careOption(_ c: OnboardingDraft.Care, _ key: String) -> some View {
        Button { draft.care = c } label: {
            HStack {
                Text(L.t(key)).rmText(.subtitulo, draft.care == c ? RM.Palette.agoraSobre : RM.Palette.textoPrimario)
                Spacer()
                if draft.care == c { RMIconView(.check, size: 16).foregroundStyle(RM.Palette.agoraSobre) }
            }
            .padding(16).background(draft.care == c ? RM.Palette.agora : RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 16))
        }
        .buttonStyle(.plain).accessibilityAddTraits(draft.care == c ? .isSelected : []).accessibilityIdentifier("ob-" + key)
    }

    private func choices(_ codes: [String], selected: String, prefix: String, pick: @escaping (String) -> Void) -> some View {
        VStack(spacing: 8) {
            ForEach(codes, id: \.self) { c in
                Button { pick(c) } label: {
                    HStack {
                        Text(L.t(prefix + "." + c)).rmText(.corpo, selected == c ? RM.Palette.agoraSobre : RM.Palette.textoPrimario)
                        Spacer()
                    }
                    .padding(14).background(selected == c ? RM.Palette.agora : RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 14))
                }
                .buttonStyle(.plain).accessibilityAddTraits(selected == c ? .isSelected : []).accessibilityIdentifier("ob-\(prefix)-\(c)")
            }
        }
    }

    private func chips(_ codes: [String], selected: Set<String>, prefix: String?, pick: @escaping (String) -> Void) -> some View {
        FlowChips(items: codes.map { code in (code, prefix.map { p in L.t(p + "." + code) } ?? code) }, selected: selected, pick: pick)
    }

    private func weekdays(_ selected: Set<Int>, toggle: @escaping (Int) -> Void) -> some View {
        HStack(spacing: 6) {
            ForEach(0..<7, id: \.self) { d in
                Button { toggle(d) } label: {
                    Text(L.t("weekday.\(d)")).rmText(.rotulo, selected.contains(d) ? RM.Palette.agoraSobre : RM.Palette.textoPrimario)
                        .frame(maxWidth: .infinity, minHeight: 40).background(selected.contains(d) ? RM.Palette.agora : RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 10))
                }
                .buttonStyle(.plain).accessibilityAddTraits(selected.contains(d) ? .isSelected : [])
            }
        }
    }

    private func number(_ label: String, _ value: Binding<Int>, _ range: ClosedRange<Int>, step: Int = 1) -> some View {
        Stepper(value: value, in: range, step: step) {
            HStack { Text(label).rmText(.corpo, RM.Palette.textoSecundario); Spacer(); Text("\(value.wrappedValue)").rmText(.numeroS) }
        }
    }

    // MARK: submit and outcomes

    private func submit() async {
        let today = Fmt.dayString(Date())
        let start = Fmt.calendar.nextDate(after: Date(), matching: DateComponents(weekday: 2), matchingPolicy: .nextTime).map(Fmt.dayString) ?? today
        guard let answers = draft.answers(athleteId: "synthetic-athlete", today: today, startDate: start) else { return }
        withAnimation { phase = .building }
        let out = await model.writer.onboard(answers, consents: draft.consentsValue)
        try? await Task.sleep(nanoseconds: reduceMotion ? 300_000_000 : 1_600_000_000)
        withAnimation(.easeInOut) { phase = .outcome(out.answer.planOutcome) }
    }

    private var building: some View {
        VStack(spacing: 24) {
            Spacer()
            PlanBuildingMark(animate: !reduceMotion)
            Text(L.t("ob.building")).rmText(.titulo)
            Text(L.t("ob.building.body")).rmText(.corpo, RM.Palette.textoSecundario)
            Spacer()
        }
        .frame(maxWidth: .infinity)
        .padding(RM.Space.gutter)
        .accessibilityElement(children: .contain).accessibilityIdentifier("ob-building")
    }

    @ViewBuilder private func outcome(_ o: PlanOutcome) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            Spacer()
            switch o {
            case .planCreated:
                RMIconView(.check, size: 32).foregroundStyle(RM.Palette.positivo)
                Text(L.t("ob.created")).rmText(.manchete).accessibilityIdentifier("ob-created")
                Spacer()
                PrimaryActionButton(L.t("ob.open"), icon: .chevronDireita) { onEnrolled() }.accessibilityIdentifier("ob-open")
            case .outsideV1Scope:
                RMIconView(.cadeado, size: 32).foregroundStyle(RM.Palette.textoSecundario)
                Text(L.t("ob.outsideScope.title")).rmText(.manchete)
                Text(L.t("ob.outsideScope.subtitle")).rmText(.micro, RM.Palette.textoSecundario)
                Text(L.t("ob.outsideScope.body.interim")).rmText(.corpo, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
                Spacer()
                SecondaryPillButton(L.t("ob.outsideScope.review")) { withAnimation { phase = .form; step = .care } }
            case .clinicalHumanRequired:
                RMIconView(.pausa, size: 32).foregroundStyle(RM.Palette.negativo)
                Text(L.t("ob.clinical.title")).rmText(.manchete)
                Text(L.t("ob.clinical.body.interim")).rmText(.corpo, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
                Spacer()
            case .needsInput, .invalidInput:
                Text(L.t("state.needsInput.title")).rmText(.manchete)
                Text(L.t("ob.needsInput")).rmText(.corpo, RM.Palette.textoSecundario)
                Spacer()
                SecondaryPillButton(L.t("ob.back")) { withAnimation { phase = .form } }
            case .failed, .unrecognized:
                Text(L.t("state.opError.title")).rmText(.manchete)
                Text(L.t("state.opError.body")).rmText(.corpo, RM.Palette.textoSecundario)
                Spacer()
                SecondaryPillButton(L.t("common.tryAgain")) { withAnimation { phase = .form } }
            }
        }
        .padding(RM.Space.gutter)
        .accessibilityElement(children: .contain).accessibilityIdentifier("ob-outcome")
    }
}

/// Wrapping selection chips.
struct FlowChips: View {
    let items: [(String, String)]
    let selected: Set<String>
    let pick: (String) -> Void
    var body: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 96), spacing: 8)], alignment: .leading, spacing: 8) {
            ForEach(items, id: \.0) { code, label in
                Button { pick(code) } label: {
                    Text(label).rmText(.rotulo, selected.contains(code) ? RM.Palette.agoraSobre : RM.Palette.textoPrimario).lineLimit(1).minimumScaleFactor(0.8)
                        .frame(maxWidth: .infinity, minHeight: 40).padding(.horizontal, 8)
                        .background(selected.contains(code) ? RM.Palette.agora : RM.Palette.fundoElevado, in: Capsule())
                }
                .buttonStyle(.plain).accessibilityAddTraits(selected.contains(code) ? .isSelected : []).accessibilityIdentifier("chip-\(code)")
            }
        }
    }
}

/// "Montando o plano" (motion priority 2): the double lane drawing itself; a static mark with Reduce Motion.
struct PlanBuildingMark: View {
    let animate: Bool
    @State private var progress: CGFloat = 0
    var body: some View {
        ZStack {
            Capsule().stroke(RM.Palette.fundoTrilho, lineWidth: 14)
            Capsule().trim(from: 0, to: progress).stroke(RM.Palette.corrida, style: StrokeStyle(lineWidth: 5, lineCap: .round))
            Capsule().inset(by: 18).trim(from: 0, to: progress).stroke(RM.Palette.forca, style: StrokeStyle(lineWidth: 12, dash: [22, 4]))
        }
        .frame(width: 220, height: 140)
        .onAppear {
            if animate { withAnimation(.easeInOut(duration: 1.4).repeatForever(autoreverses: false)) { progress = 1 } } else { progress = 1 }
        }
        .accessibilityHidden(true)
    }
}
