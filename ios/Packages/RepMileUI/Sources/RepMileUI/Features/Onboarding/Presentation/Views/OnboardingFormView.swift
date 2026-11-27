import SwiftUI

/// The question screens of the onboarding (Figma 10, etapas 1–4 up to "Seus dados"). Each step's content lives in the stage files
/// (`OnboardingGoalSteps`, `OnboardingRoutineSteps`, `OnboardingYouSteps`, `OnboardingStartSteps`); this view frames it and wires the actions.
struct OnboardingFormView: View {
    @Bindable var vm: OnboardingViewModel
    let build: () -> Void

    var body: some View {
        Group {
            switch vm.step {
            case .opening: opening
            case .goalDone, .routineDone, .youDone: respiro
            default:
                OBScaffold(stage: vm.step.stage, progress: vm.stageProgress, back: { withAnimation(.easeInOut(duration: 0.25)) { vm.back() } }) {
                    content
                } actions: {
                    actions
                }
            }
        }
        .sheet(item: Binding(get: { vm.sheet == .confirmCare ? vm.sheet : nil }, set: { if $0 == nil, vm.sheet == .confirmCare { vm.sheet = nil } })) { _ in
            CareConfirmSheet(vm: vm).presentationDetents([.height(360), .large]).presentationDragIndicator(.visible)
        }
    }

    @ViewBuilder private var content: some View {
        switch vm.step {
        case .train, .runAim, .raceDate, .goalTime, .strengthAim: goalContent
        case .week, .longRun, .duration, .strengthPlace, .runPlace, .runDevice: routineContent
        case .name, .age, .bodySize, .appleHealth, .runStart, .runRecentDays, .runNow, .runYears: youContent
        case .result, .resultDetail, .strengthYears, .care, .dataUse: startContent
        case .opening, .goalDone, .routineDone, .youDone: EmptyView()
        }
    }

    private func advance() { withAnimation(.easeInOut(duration: 0.25)) { vm.next() } }

    @ViewBuilder private var actions: some View {
        switch vm.step {
        case .dataUse:
            OBPrimaryButton(title: L.t("ob.data.build"), enabled: vm.canContinue, id: "ob-build", action: build)
        case .raceDate:
            OBPrimaryButton(title: L.t("ob.continue"), enabled: vm.canContinue, id: "ob-next", action: advance)
            if vm.raceBeyondPlan { OBLink(title: L.t("ob.raceDate.withoutRace"), id: "ob-without-race") { withAnimation { vm.continueWithoutRace() } } }
        case .goalTime:
            OBPrimaryButton(title: L.t("ob.continue"), enabled: vm.canContinue, id: "ob-next", action: advance)
            OBLink(title: L.t("ob.goal.skip"), id: "ob-skip") { withAnimation { vm.skip() } }
        case .bodySize:
            OBPrimaryButton(title: L.t("ob.continue"), enabled: vm.canContinue, id: "ob-next", action: advance)
            OBLink(title: L.t("ob.body.skip"), id: "ob-skip") { withAnimation { vm.skip() } }
        case .appleHealth:
            // D15: no port asks Apple Health for access yet; the button is held (rendered disabled), "Agora não" answers the step.
            OBPrimaryButton(title: L.t("ob.health.connect"), enabled: false, id: "ob-health-connect") {}
            OBLink(title: L.t("ob.health.notNow"), id: "ob-skip") { withAnimation { vm.skip() } }
        case .result where vm.draft.hasResult != false:
            OBPrimaryButton(title: L.t("ob.continue"), enabled: vm.canContinue, id: "ob-next", action: advance)
            OBLink(title: L.t("ob.result.none"), id: "ob-skip") { withAnimation { vm.skip() } }
        default:
            OBPrimaryButton(title: L.t("ob.continue"), enabled: vm.canContinue, id: "ob-next", action: advance)
        }
    }

    // MARK: 01 Abertura (`835:2069`)

    private var opening: some View {
        VStack(alignment: .leading, spacing: 0) {
            OBWeekArt(run: [1, 3, 5, 6], strength: [0, 2, 3], longRun: 5).padding(.top, 84)
            VStack(alignment: .leading, spacing: 12) {
                RMLogo()
                Text(L.t("ob.opening.title")).rmText(.manchete).fixedSize(horizontal: false, vertical: true)
                Text(L.t("ob.opening.body")).rmText(.corpo, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
            }
            .padding(.horizontal, RM.Space.gutter).padding(.top, 24)
            Spacer()
            VStack(spacing: 6) {
                OBPrimaryButton(title: L.t("ob.opening.start"), id: "ob-start") { withAnimation { vm.next() } }
                // D18: no account exists yet (#28); the link is held, rendered disabled.
                OBLink(title: L.t("ob.opening.haveAccount"), enabled: false, id: "ob-have-account") {}
            }
            .padding(.horizontal, RM.Space.gutter).padding(.bottom, 8)
        }
    }

    // MARK: respiros (08 `835:2475`, 16 `836:882`, 28 `836:3372`)

    private var respiro: some View {
        VStack(alignment: .leading, spacing: 0) {
            OBNavigation(stage: vm.step.stage, progress: 1) { withAnimation { vm.back() } }
            ScrollView { respiroContent.frame(maxWidth: .infinity, alignment: .leading) }.scrollIndicators(.hidden)
            OBPrimaryButton(title: L.t(vm.step == .goalDone ? "ob.goalDone.next" : vm.step == .routineDone ? "ob.routineDone.next" : "ob.youDone.next"), id: "ob-next") { advance() }
                .padding(.horizontal, RM.Space.gutter).padding(.vertical, 8)
        }
    }

    /// The check and "<Etapa> · etapa N de 4 concluída".
    static func stageDone(_ stage: Int) -> some View {
        HStack(spacing: 8) {
            RMIconView(.check, size: 14).foregroundStyle(RM.Palette.positivo)
            Text(L.t("ob.stageDone.\(stage)")).rmText(.micro, RM.Palette.textoPrimario)
        }
    }
}

/// 27b "Confirma esta resposta?" (`838:4148`): the marked signs in the Figma's sentence, then confirm or review.
struct CareConfirmSheet: View {
    @Bindable var vm: OnboardingViewModel
    var body: some View {
        let marked = CareItem.allCases.filter { $0.isClinical && vm.draft.care.contains($0) }.map { L.t("ob.care.\($0.rawValue)").lowercased(with: Fmt.locale) }
        VStack(alignment: .leading, spacing: 12) {
            Text(L.t("ob.careConfirm.title")).rmText(.titulo).padding(.top, 8)
            Text(L.f("ob.careConfirm.body", OBText.list(marked))).rmText(.corpo, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
            OBPrimaryButton(title: L.t("ob.careConfirm.confirm"), id: "ob-care-confirm") { vm.confirmCare() }
            OBSecondaryButton(title: L.t("ob.careConfirm.review"), id: "ob-care-review") { vm.sheet = nil }
        }
        .padding(RM.Space.gutter)
        .background(RM.Palette.fundoElevado.ignoresSafeArea())
    }
}
