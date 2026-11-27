import CoachingPresentation
import SwiftUI

/// The readiness declaration (the only exit of a clinical hold): the READINESS set (15 signs), "recovered", and sport by sport. State, the read
/// of the set and the write live in `ReadinessViewModel`; this view renders them.
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
                    case .returning, .stillBlocked:
                        result(returning: viewModel.phase == .returning)
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

    @ViewBuilder private func result(returning done: Bool) -> some View {
        StateBanner(tone: done ? .neutral : .safety, icon: done ? .repetir : .pausa,
                    title: done ? L.t("state.returning.title") : L.t("state.blocked.title"),
                    message: done ? L.t("state.returning.body") : L.t("state.blocked.body.interim"))
            .accessibilityIdentifier(done ? "readiness-returning" : "readiness-still-blocked")
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
        Text(L.t("readiness.note.interim")).rmText(.detalhe, RM.Palette.textoSecundario)
        // Off while the one request is in flight (no second declaration).
        PrimaryActionButton(L.t("nf.send"), icon: .check, enabled: viewModel.canSend) {
            Task { await viewModel.send { change in withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) { change() } } }
        }
        .accessibilityIdentifier("readiness-send")
    }
}
