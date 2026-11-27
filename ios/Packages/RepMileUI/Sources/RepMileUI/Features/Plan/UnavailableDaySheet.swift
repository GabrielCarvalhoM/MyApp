import CoachingPresentation
import SwiftUI

/// "Não posso neste dia" (GAP-09; Figma 30 `593:689` → `597:1542`): the origin day becomes unavailable, the engine proposes, the athlete
/// confirms. The UI never chooses a destination. The proposal's run sessions come from `presentation().pending`; strength rows of a proposal
/// are not exposed yet (GAP-08, A's `pendingWeek`). The request carries the eligibility screen answered here (#72). State, the two writes and
/// the re-read live in `UnavailableDayViewModel`; this view renders.
struct UnavailableDaySheet: View {
    @Environment(\.dismiss) private var dismiss
    @State private var viewModel: UnavailableDayViewModel

    init(viewModel: UnavailableDayViewModel) { _viewModel = State(initialValue: viewModel) }

    private var session: PlannedSession { viewModel.session }

    var body: some View {
        ScrollView { content.padding(RM.Space.gutter) }
            .background(RM.Palette.fundoElevado.ignoresSafeArea())
            // The screen's six rows do not fit a half sheet.
            .presentationDetents([.large])
            .presentationBackground(RM.Palette.fundoElevado)
    }

    private var content: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text(L.t("session.cantThisDay")).rmText(.titulo)
                Spacer()
                Button { dismiss() } label: { RMIconView(.fechar, size: 20).foregroundStyle(RM.Palette.textoSecundario) }
                    .accessibilityLabel(L.t("common.close"))
            }
            switch viewModel.phase {
            case .ask, .sending:
                askForm
            case .needsInput:
                StateBanner(tone: .neutral, icon: .lista, title: L.t("state.needsInput.title"), message: L.t("state.needsInput.body"))
                    .accessibilityIdentifier("move-needs-input")
                SecondaryPillButton(L.t("common.close")) { dismiss() }
            case .clinical:
                ClinicalRouteBanner(reportKept: false).accessibilityIdentifier("move-blocked")
                SecondaryPillButton(L.t("common.close")) { dismiss() }
            case .proposed, .accepting:
                Text(L.t("move.proposed")).rmText(.corpo, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
                if viewModel.proposalUnavailable {
                    Text(L.t("move.proposal.unavailable")).rmText(.subtitulo).fixedSize(horizontal: false, vertical: true)
                        .accessibilityIdentifier("move-proposal-unavailable")
                }
                ForEach(viewModel.proposal, id: \.sessionId) { p in
                    HStack {
                        RMIconView(.corrida, size: 16).foregroundStyle(RM.Palette.corrida)
                        Text(Fmt.weekdayName(p.date).capitalizedFirst + " · " + (L.code("family", p.family) ?? L.t("family.RUN"))).rmText(.subtitulo)
                    }
                }
                Spacer()
                PrimaryActionButton(L.t("move.accept"), icon: .check, enabled: viewModel.canAccept) { Task { await viewModel.accept() } }.accessibilityIdentifier("move-accept")
                SecondaryPillButton(L.t("move.later")) { dismiss() }
            case .accepted:
                Label { Text(L.t("move.accepted")).rmText(.subtitulo) } icon: { RMIconView(.check, size: 18).foregroundStyle(RM.Palette.positivo) }
                    .accessibilityIdentifier("move-accepted")
                Spacer()
                SecondaryPillButton(L.t("common.close")) { dismiss() }
            case .failed(let code):
                Text(L.t(UnavailableDayViewModel.failureKey(code))).rmText(.corpo, RM.Palette.textoSecundario)
                Spacer()
                SecondaryPillButton(L.t("common.close")) { dismiss() }
            }
        }
    }

    @ViewBuilder private var askForm: some View {
        @Bindable var vm = viewModel
        Text(L.f("move.ask", Fmt.onWeekday(session.date), TodayContent.title(session).lowercased(with: Fmt.locale))).rmText(.corpo, RM.Palette.textoSecundario)
            .fixedSize(horizontal: false, vertical: true)
        // #72: the engine applies no change without the screen sent with it.
        EligibilityForm(screen: $vm.eligibility).disabled(viewModel.phase == .sending)
        Text(L.t("ob.eligibility.body")).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
        PrimaryActionButton(L.t("move.send"), icon: .relogio, enabled: viewModel.canSend) { Task { await viewModel.send() } }
            .accessibilityIdentifier("move-send")
    }
}
