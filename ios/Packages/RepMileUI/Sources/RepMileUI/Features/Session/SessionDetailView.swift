import CoachingPresentation
import SwiftUI

/// Treino planejado (Figma page 31; run reference `643:317` "longão de 80 min", strength `662:…` "Corpo inteiro"). Steps, effort and pace only
/// from `PresentationSnapshot.runSession(for:)` (FND-ABC-05); loads only from `prescription.load` with no suggested number (GAP-10); "Anterior"
/// from `loggedEntries`. Engine English text (reason, instructions) is never shown; the "Por que este treino" and "Como fazer" blocks wait
/// for reviewed copy by code.
struct SessionDetailView: View {
    @Environment(AppModel.self) private var model
    let session: PlannedSession
    var onStart: (PlannedSession) -> Void = { _ in }
    var onCantThisDay: (PlannedSession) -> Void = { _ in }

    private var sport: Sport { Sport(code: session.sport.raw) ?? .run }
    private var startability: Startability { model.startability(of: session) }
    private var paused: Bool { model.plan?.hold != nil || [.outsideV1Scope, .clinicalHumanRequired].contains(model.globalGate) }
    private var done: LoggedEntry? { model.logged?.entries.first { $0.sessionId == session.id && $0.date == session.date && $0.completed && !$0.superseded } }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                header
                if !paused, let p = session.prescription {
                    if sport == .run { SessionRunDetail(session: session, prescription: p) } else { SessionStrengthDetail(session: session, prescription: p) }
                } else if model.plan?.clinicalGuidance == .urgentCare {
                    // #73: a hold at URGENT_CARE_ADVISED shows its level here too, never only "nothing to start".
                    UrgentCareBanner(reportKept: true, announceKey: model.plan.map(UrgentCareBanner.key(for:))).padding(.top, 20)
                        .accessibilityIdentifier("session-urgent")
                } else {
                    StateBanner(tone: .safety, icon: .pausa, title: L.t("state.blocked.title"), message: L.t("today.hero.paused.rest"))
                        .padding(.top, 20)
                }
                if !paused, session.executable, done == nil {
                    SecondaryPillButton(L.t("session.cantThisDay"), icon: .relogio) { onCantThisDay(session) }
                        .padding(.top, 24).accessibilityIdentifier("session-cant-this-day")
                }
            }
            .padding(.horizontal, RM.Space.gutter)
            .padding(.bottom, 140)
        }
        .scrollIndicators(.hidden)
        .accessibilityIdentifier("screen-session")
        .background(RM.Palette.fundoApp.ignoresSafeArea())
        .safeAreaInset(edge: .bottom) { startBar }
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(RM.Palette.fundoApp, for: .navigationBar)
    }

    // MARK: header

    private var header: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 6) {
                RMIconView(sport.icon, size: 14)
                Text(TodayContent.title(session)).rmText(.rotulo, sport.color)
            }
            .foregroundStyle(sport.color)
            .padding(.horizontal, 10).padding(.vertical, 5)
            .background(sport.soft, in: Capsule())
            if let m = done?.minutes ?? (paused ? nil : session.prescription?.durationMinutes) {
                Text(L.f("common.minutes", Fmt.minutes(m))).rmText(.numeroXL).accessibilityIdentifier("session-duration")
            }
            Text(subtitle).rmText(.detalhe, RM.Palette.textoSecundario)
            if done != nil {
                Label { Text(L.t("session.done")).rmText(.rotulo, RM.Palette.positivo) } icon: { RMIconView(.check, size: 14).foregroundStyle(RM.Palette.positivo) }
            }
        }
        .padding(.top, 8)
    }

    private var subtitle: String {
        var parts = [Fmt.longDay(session.date).replacingOccurrences(of: " · ", with: ", ")]
        if let t = L.code("turn", session.turn) { parts.append(t) }
        if let plan = model.plan {
            let week = (model.weeks.first { w in w.sessions.contains { $0.id == session.id && $0.date == session.date } }?.index ?? plan.weekIndex)
            parts.append(L.f("session.week", "\(week + 1)", "\(plan.weeks)"))
            if let phase = L.code("phase", model.weekPlan?.weeks.first { $0.index == week }?.phase) { parts.append(phase) }
        }
        return parts.joined(separator: " · ")
    }

    // MARK: start

    private var startBar: some View {
        VStack(spacing: 6) {
            if done == nil, !paused {
                PrimaryActionButton(L.f("today.start", TodayContent.title(session).lowercased(with: Fmt.locale)), fill: sport.action, textColor: sport.actionText,
                                    enabled: model.canStart(session)) { onStart(session) }
                    .accessibilityIdentifier("session-start")
                if case .notStartable(let r) = startability {
                    Text(L.t("reason." + r.rawValue)).rmText(.detalhe, RM.Palette.textoSecundario).multilineTextAlignment(.center)
                        .accessibilityIdentifier("session-start-reason")
                }
            }
        }
        .padding(.horizontal, RM.Space.gutter).padding(.top, 8).padding(.bottom, 8)
        .background(RM.Palette.fundoApp.opacity(done == nil && !paused ? 0.96 : 0))
    }
}

extension String {
    var capitalizedFirst: String { prefix(1).uppercased() + dropFirst() }
}

/// The 3 × 2 (or fewer, closing without gaps) metric grid of a session header.
struct MetricGrid: View {
    struct Item: Hashable { let value: String; let label: String }
    let items: [Item]
    var body: some View {
        LazyVGrid(columns: [GridItem(.flexible(), alignment: .topLeading), GridItem(.flexible(), alignment: .topLeading), GridItem(.flexible(), alignment: .topLeading)], alignment: .leading, spacing: 16) {
            ForEach(items, id: \.self) { i in
                VStack(alignment: .leading, spacing: 2) {
                    Text(i.value).rmText(.numeroS).lineLimit(1).minimumScaleFactor(0.7)
                    Text(i.label).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
                }
                .accessibilityElement(children: .combine)
            }
        }
    }
}
