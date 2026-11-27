import CoachingPresentation
import SwiftUI

/// The onboarding (Figma page 10 `551:5`, version "V1 alinhamento funcional · 26 nov"), from 01 Abertura to 34 Primeira semana. The state and
/// the one write live in `OnboardingViewModel`; this view renders its phase. After an accepted intake the root reads the new record
/// (`enrolled`) and this view stays on screen for 31–34, reading the plan from the app model, until the athlete leaves (`finished`).
struct OnboardingFlow: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(AppModel.self) private var model
    @State private var viewModel: OnboardingViewModel?
    let make: () -> OnboardingViewModel
    let enrolled: () -> Void
    let finished: () -> Void

    var body: some View {
        ZStack(alignment: .top) {
            // "Luz · neutra": the soft light at the top of every onboarding frame.
            // An overlay never sizes the stack: the 620 pt light is clipped to the screen.
            RM.Palette.fundoApp
                .overlay(alignment: .top) { Ellipse().fill(RM.Palette.luzNeutra).frame(width: 620, height: 460).blur(radius: 80).offset(y: -270) }
                .clipped().ignoresSafeArea().allowsHitTesting(false).accessibilityHidden(true)
            if let vm = viewModel { content(vm) }
        }
        .accessibilityElement(children: .contain).accessibilityIdentifier("screen-onboarding")
        .onAppear {
            guard viewModel == nil else { return }
            let vm = make()
            #if DEBUG
            if let p = OnboardingDebugSeed.phase(arguments: ProcessInfo.processInfo.arguments) {
                vm.debugShow(p)
                if [.ready, .firstWeek].contains(vm.phase) { enrolled() }
            }
            #endif
            viewModel = vm
        }
    }

    @ViewBuilder private func content(_ vm: OnboardingViewModel) -> some View {
        Group {
            switch vm.phase {
            case .resume: OnboardingResumeView(vm: vm)
            case .form: OnboardingFormView(vm: vm) { build(vm) }
            case .building: OnboardingBuildingView(draft: vm.draft, animate: !reduceMotion, shownAtStart: vm.debugBuildingShown)
            case .ready:
                OnboardingPlanReadyView(preview: preview(vm), save: { vm.saveThePlan() }, seePlan: finished)
                    .sheet(item: Binding(get: { vm.sheet == .account ? vm.sheet : nil }, set: { if $0 == nil { vm.sheet = nil; withAnimation { vm.accountSheetClosed() } } })) { _ in
                        OnboardingAccountSheet()
                    }
                    .overlay { if vm.sheet == .account { OBSheetDim() } }
            case .firstWeek: OnboardingFirstWeekView(preview: preview(vm), goToday: finished)
            case .outcome(let o):
                OnboardingOutcomeView(outcome: o, draft: vm.draft, retry: { Task { await vm.retry(minimumDisplay: minimum) } }, review: { withAnimation { vm.review() } })
            }
        }
        .animation(reduceMotion ? nil : .easeInOut(duration: 0.25), value: vm.phase)
        .onChange(of: vm.phase) { _, p in if p == .ready { enrolled() } }
    }

    private var minimum: Duration { reduceMotion ? .milliseconds(300) : .milliseconds(1600) }

    private func build(_ vm: OnboardingViewModel) { Task { await vm.submit(minimumDisplay: minimum) } }

    private func preview(_ vm: OnboardingViewModel) -> OnboardingPlanPreview {
        OnboardingPlanPreview(plan: model.plan, weekPlan: model.weekPlan, presentation: model.presentation, race: vm.draft.runAim?.race,
                              name: vm.draft.name.trimmingCharacters(in: .whitespacesAndNewlines))
    }
}
