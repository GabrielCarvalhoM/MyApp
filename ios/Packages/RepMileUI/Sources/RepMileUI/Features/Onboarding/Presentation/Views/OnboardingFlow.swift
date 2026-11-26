import CoachingPresentation
import SwiftUI

/// Onboarding (Figma page 10; Cuidados `836:3299`; out of scope `838:4053`). Every answer the engine reads is asked; the outcome is the engine's
/// (`BoundaryAnswer.planOutcome`): a plan, "Plano indisponível · sinal informado no cadastro", a professional assessment, a missing answer, or
/// answers that do not fit together (INVALID_INPUT, #61).
/// State and the write live in `OnboardingViewModel`; this view renders them.
struct OnboardingFlow: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var viewModel: OnboardingViewModel
    var onEnrolled: () -> Void

    init(viewModel: OnboardingViewModel, onEnrolled: @escaping () -> Void) {
        _viewModel = State(initialValue: viewModel)
        self.onEnrolled = onEnrolled
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            switch viewModel.phase {
            case .form: form
            case .building: building
            case .outcome(let o): outcome(o)
            }
        }
        .animation(.easeInOut, value: viewModel.phase)
        .background(RM.Palette.fundoApp.ignoresSafeArea())
        .accessibilityElement(children: .contain).accessibilityIdentifier("screen-onboarding")
    }

    // MARK: form

    private var form: some View {
        @Bindable var vm = viewModel
        let step = viewModel.step
        return VStack(alignment: .leading, spacing: 0) {
            if step != .welcome {
                HStack {
                    Button { withAnimation { viewModel.back() } } label: { RMIconView(.chevronEsquerda, size: 22).foregroundStyle(RM.Palette.textoPrimario) }
                        .accessibilityLabel(L.t("ob.back"))
                    Spacer()
                    Text(L.f("ob.step", "\(step.rawValue)", "\(viewModel.stepCount)")).rmText(.micro, RM.Palette.textoTerciario)
                }
                .padding(.horizontal, RM.Space.gutter).padding(.top, 8)
                ProgressView(value: Double(step.rawValue), total: Double(viewModel.stepCount)).tint(RM.Palette.agora).padding(.horizontal, RM.Space.gutter).padding(.top, 8)
            }
            ScrollView {
                VStack(alignment: .leading, spacing: 18) { OnboardingStepView(step: step, draft: $vm.draft) }
                    .padding(RM.Space.gutter)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .scrollIndicators(.hidden)
            VStack(spacing: 6) {
                if let note = viewModel.requiredNote { Text(L.t(note)).rmText(.detalhe, RM.Palette.textoSecundario).accessibilityIdentifier("ob-required") }
                PrimaryActionButton(step == .welcome ? L.t("ob.start") : step == .consents ? L.t("ob.build") : L.t("ob.next"), icon: .chevronDireita,
                                    enabled: viewModel.canContinue) { advance() }
                    .accessibilityIdentifier("ob-next")
            }
            .padding(RM.Space.gutter)
        }
    }

    private func advance() {
        if viewModel.isLastStep {
            let minimum: Duration = reduceMotion ? .milliseconds(300) : .milliseconds(1600)
            Task { await viewModel.submit(minimumDisplay: minimum) }
        } else {
            withAnimation(.easeInOut(duration: 0.25)) { viewModel.next() }
        }
    }

    // MARK: building and outcomes

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
                SecondaryPillButton(L.t("ob.outsideScope.review")) { withAnimation { viewModel.reviewCare() } }
            case .clinicalHumanRequired:
                RMIconView(.pausa, size: 32).foregroundStyle(RM.Palette.negativo)
                Text(L.t("ob.clinical.title")).rmText(.manchete)
                Text(L.t("ob.clinical.body.interim")).rmText(.corpo, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
                Spacer()
            case .invalidInput:
                Text(L.t("ob.invalidInput.title")).rmText(.manchete).accessibilityIdentifier("ob-invalid-input")
                Text(L.t("ob.invalidInput.body")).rmText(.corpo, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
                if !viewModel.reviewSteps.isEmpty {
                    Text(L.f("ob.invalidInput.steps", viewModel.reviewSteps.map { L.t("ob.stepName.\($0)") }.formatted(.list(type: .and))))
                        .rmText(.subtitulo).accessibilityIdentifier("ob-invalid-steps")
                }
                Spacer()
                SecondaryPillButton(L.t("ob.invalidInput.action")) { withAnimation { viewModel.reviewAnswers() } }.accessibilityIdentifier("ob-invalid-review")
            case .needsInput:
                Text(L.t("state.needsInput.title")).rmText(.manchete)
                Text(L.t("ob.needsInput")).rmText(.corpo, RM.Palette.textoSecundario)
                Spacer()
                SecondaryPillButton(L.t("ob.back")) { withAnimation { viewModel.returnToForm() } }
            case .failed, .unrecognized:
                Text(L.t("state.opError.title")).rmText(.manchete)
                Text(L.t("state.opError.body")).rmText(.corpo, RM.Palette.textoSecundario)
                Spacer()
                SecondaryPillButton(L.t("common.tryAgain")) { withAnimation { viewModel.returnToForm() } }
            }
        }
        .padding(RM.Space.gutter)
        .accessibilityElement(children: .contain).accessibilityIdentifier("ob-outcome")
    }
}
