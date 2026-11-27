import CoachingPresentation
import SwiftUI

/// The readiness declaration (the only exit of a clinical hold): the READINESS set (15 signs), "recovered", sport by sport, and the eligibility
/// screen (#72). State, the read of the set and the write live in `ReadinessViewModel`; this view renders them.
struct ReadinessFlow: View {
    @Environment(\.dismiss) private var dismiss
    @State private var viewModel: ReadinessViewModel

    init(viewModel: ReadinessViewModel) { _viewModel = State(initialValue: viewModel) }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    switch viewModel.phase {
                    case .needsAnswers:
                        StateBanner(tone: .neutral, icon: .lista, title: L.t("state.needsInput.title"), message: L.t("nf.needsAnswers"))
                            .accessibilityIdentifier("readiness-needs-answers")
                        SecondaryPillButton(L.t("ob.back")) { viewModel.back() }
                    case .returning:
                        result(stillBlocked: nil)
                    case .stillBlocked(let guidance):
                        result(stillBlocked: guidance)
                    case .answering(let set), .submitting(let set):
                        form(set)
                    case .loading:
                        EmptyView()
                    }
                }
                .padding(RM.Space.gutter)
            }
            .background(RM.Palette.fundoApp.ignoresSafeArea())
            .navigationTitle(L.t("readiness.title")).navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button { dismiss() } label: { RMIconView(.fechar, size: 18) }.accessibilityLabel(L.t("common.close")) } }
        }
        .task { await viewModel.load() }
        .accessibilityElement(children: .contain).accessibilityIdentifier("flow-readiness")
    }

    /// `stillBlocked` nil: the engine restarted training. A declaration that keeps the hold is not recorded as a release: #68's banner without
    /// "o seu registro continua guardado", at the engine's guidance level (#73).
    @ViewBuilder private func result(stillBlocked guidance: ClinicalGuidance?) -> some View {
        if let guidance {
            ClinicalRouteBanner(reportKept: false, guidance: guidance).accessibilityIdentifier("readiness-still-blocked")
        } else {
            StateBanner(tone: .neutral, icon: .repetir, title: L.t("state.returning.title"), message: L.t("state.returning.body"))
                .accessibilityIdentifier("readiness-returning")
        }
        SecondaryPillButton(L.t("common.close")) { dismiss() }
    }

    @ViewBuilder private func form(_ set: WarningSignQuestionSet) -> some View {
        @Bindable var vm = viewModel
        HStack {
            Text(L.t("readiness.recovered")).rmText(.titulo).frame(maxWidth: .infinity, alignment: .leading)
            YesNo(value: $vm.recovered, id: "readiness-recovered")
        }
        SignQuestionnaire(title: L.t("signs.title"), signs: set.warningSigns, answers: $vm.answers)
        Toggle(isOn: $vm.run) { Text(L.t("readiness.run")).rmText(.corpo) }.tint(RM.Palette.corrida)
        Toggle(isOn: $vm.strength) { Text(L.t("readiness.strength")).rmText(.corpo) }.tint(RM.Palette.forca)
        // #72: the engine releases no hold without the screen sent with the declaration.
        EligibilityForm(screen: $vm.eligibility).disabled(viewModel.phase != .answering(set))
        Text(L.t("ob.eligibility.body")).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
        Text(L.t("readiness.note.interim")).rmText(.detalhe, RM.Palette.textoSecundario)
        // Off while the one request is in flight (no second declaration).
        PrimaryActionButton(L.t("nf.send"), icon: .check, enabled: viewModel.canSend) {
            Task { await viewModel.send { change in withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) { change() } } }
        }
        .accessibilityIdentifier("readiness-send")
    }
}
