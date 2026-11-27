import CoachingPresentation
import SwiftUI

/// "Não estou 100%" (Figma 72; F08 Situation 1). Condition → the engine's signs for it → the eligibility screen (every entry point, #72:
/// the engine routes no sign, red flags included, without it) → the intents the engine accepts for it → submit, on as soon as the screen
/// is answered. The answer decides; the UI shows its state (BLOCKED, ASK, kept). State, the read of the set
/// and the write live in `NotFeeling100ViewModel`; this view renders them.
struct NotFeeling100Flow: View {
    @Environment(\.dismiss) private var dismiss
    @State private var viewModel: NotFeeling100ViewModel

    init(viewModel: NotFeeling100ViewModel) { _viewModel = State(initialValue: viewModel) }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    if case .outcome(let outcome) = viewModel.phase { outcomeView(outcome) }
                    else if case .needsAnswers = viewModel.phase { needsAnswers }
                    else if let set = viewModel.questionSet { questions(set) } else { conditions }
                }
                .padding(RM.Space.gutter)
            }
            .background(RM.Palette.fundoApp.ignoresSafeArea())
            .navigationTitle(L.t("nf.title")).navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button { dismiss() } label: { RMIconView(.fechar, size: 18) }.accessibilityLabel(L.t("common.close")) } }
        }
        .accessibilityElement(children: .contain).accessibilityIdentifier("flow-not-feeling-100")
    }

    private var conditions: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(L.t("nf.condition")).rmText(.manchete)
            ForEach(WellbeingCondition.allCases, id: \.self) { c in
                Button { Task { await viewModel.choose(c) } } label: {
                    ChevronRow(title: L.t("condition." + c.rawValue), detail: nil).padding(.vertical, 12)
                }
                .buttonStyle(.plain).accessibilityIdentifier("condition-\(c.rawValue)")
                RMDivider()
            }
        }
    }

    @ViewBuilder private func questions(_ set: WarningSignQuestionSet) -> some View {
        @Bindable var vm = viewModel
        SignQuestionnaire(title: L.t("signs.title"), signs: set.warningSigns, answers: $vm.answers)
        EligibilityForm(screen: $vm.eligibility).disabled(viewModel.sending)
        Text(L.t("ob.eligibility.body")).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
        VStack(alignment: .leading, spacing: 10) {
            Text(L.t("nf.intent")).rmText(.titulo)
            ForEach(viewModel.intents, id: \.self) { i in
                Button { viewModel.intent = i } label: {
                    HStack {
                        Text(L.t("intent." + i.rawValue)).rmText(.corpo)
                        Spacer()
                        if viewModel.intent == i { RMIconView(.check, size: 16).foregroundStyle(RM.Palette.positivo) }
                    }
                    .padding(.vertical, 10)
                }
                .buttonStyle(.plain).accessibilityIdentifier("intent-\(i.rawValue)")
            }
        }
        PrimaryActionButton(L.t("nf.send"), icon: .check, enabled: viewModel.canSend) { Task { await viewModel.send { change in withAnimation { change() } } } }
            .accessibilityIdentifier("nf-send")
    }

    private var needsAnswersBanner: some View {
        StateBanner(tone: .neutral, icon: .lista, title: L.t("state.needsInput.title"), message: L.t("nf.needsAnswers")).accessibilityIdentifier("nf-needs-answers")
    }

    /// The engine asked for more: back to the same questions, answers kept.
    @ViewBuilder private var needsAnswers: some View {
        needsAnswersBanner
        SecondaryPillButton(L.t("ob.back")) { viewModel.back() }.accessibilityIdentifier("nf-back")
    }

    @ViewBuilder private func outcomeView(_ o: NotFeeling100ViewModel.Outcome) -> some View {
        switch o {
        case .kept: StateBanner(tone: .neutral, icon: .check, title: L.t("nf.title"), message: L.t("nf.kept")).accessibilityIdentifier("nf-kept")
        case .modified: StateBanner(tone: .neutral, icon: .repetir, title: L.t("nf.title"), message: L.t("nf.modified")).accessibilityIdentifier("nf-modified")
        // The engine records nothing with this route (#72 replay: recorded=0): never "o seu registro continua guardado" (#68's banner).
        case .blocked: ClinicalRouteBanner(reportKept: false).accessibilityIdentifier("nf-blocked")
        case .needsAnswers: needsAnswersBanner
        case .failed(let c): StateBanner(tone: .neutral, icon: .repetir, title: L.t("state.opError.title"), message: c == "CONFLICT_STALE_VERSION" ? L.t("state.stale.body") : L.t("state.opError.body"))
        }
        SecondaryPillButton(L.t("common.close")) { dismiss() }
    }
}
