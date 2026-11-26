import CoachingPresentation
import SwiftUI

/// "Não posso neste dia" (GAP-09; Figma 30 `593:689` → `597:1542`): the origin day becomes unavailable, the engine proposes, the athlete
/// confirms. The UI never chooses a destination. The proposal's run sessions come from `presentation().pending`; strength rows of a proposal
/// are not exposed yet (GAP-08, A's `pendingWeek`).
struct UnavailableDaySheet: View {
    enum Phase: Equatable { case ask, sending, proposed(decisionId: String), accepted, failed(String) }
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    let session: PlannedSession
    @State private var phase: Phase = .ask

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text(L.t("session.cantThisDay")).rmText(.titulo)
                Spacer()
                Button { dismiss() } label: { RMIconView(.fechar, size: 20).foregroundStyle(RM.Palette.textoSecundario) }
                    .accessibilityLabel(L.t("common.close"))
            }
            switch phase {
            case .ask, .sending:
                Text(L.f("move.ask", Fmt.onWeekday(session.date), TodayContent.title(session).lowercased(with: Fmt.locale))).rmText(.corpo, RM.Palette.textoSecundario)
                    .fixedSize(horizontal: false, vertical: true)
                Spacer()
                PrimaryActionButton(L.t("move.send"), icon: .relogio, enabled: phase == .ask) { Task { await send() } }
                    .accessibilityIdentifier("move-send")
            case .proposed(let id):
                Text(L.t("move.proposed")).rmText(.corpo, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
                ForEach(pendingRuns, id: \.sessionId) { p in
                    HStack {
                        RMIconView(.corrida, size: 16).foregroundStyle(RM.Palette.corrida)
                        Text(Fmt.weekdayName(p.date).capitalizedFirst + " · " + (L.code("family", p.family) ?? L.t("family.RUN"))).rmText(.subtitulo)
                    }
                }
                Spacer()
                PrimaryActionButton(L.t("move.accept"), icon: .check) { Task { await accept(id) } }.accessibilityIdentifier("move-accept")
                SecondaryPillButton(L.t("move.later")) { dismiss() }
            case .accepted:
                Label { Text(L.t("move.accepted")).rmText(.subtitulo) } icon: { RMIconView(.check, size: 18).foregroundStyle(RM.Palette.positivo) }
                    .accessibilityIdentifier("move-accepted")
                Spacer()
                SecondaryPillButton(L.t("common.close")) { dismiss() }
            case .failed(let code):
                Text(code == "CONFLICT_STALE_VERSION" ? L.t("state.stale.body") : L.t("state.opError.body")).rmText(.corpo, RM.Palette.textoSecundario)
                Spacer()
                SecondaryPillButton(L.t("common.close")) { dismiss() }
            }
        }
        .padding(RM.Space.gutter)
        .background(RM.Palette.fundoElevado.ignoresSafeArea())
        .presentationDetents([.medium])
        .presentationBackground(RM.Palette.fundoElevado)
    }

    private var pendingRuns: [RunSessionPresentation] {
        (model.presentation?.pending?.values.map { $0 } ?? []).sorted { $0.date < $1.date }
    }

    private func send() async {
        phase = .sending
        let outcome = await model.writer.submit(ReviewRequest(.unavailableDays([session.date]), eligibility: nil))
        if outcome.answer.ok, let id = outcome.answer.view?.pending?.decisionId ?? outcome.answer.decisionId {
            phase = .proposed(decisionId: id)
        } else {
            phase = .failed(outcome.answer.error?.code.raw ?? "UNKNOWN")
        }
    }

    private func accept(_ id: String) async {
        let outcome = await model.writer.accept(decisionId: id)
        phase = outcome.answer.ok ? .accepted : .failed(outcome.answer.error?.code.raw ?? "UNKNOWN")
    }
}
