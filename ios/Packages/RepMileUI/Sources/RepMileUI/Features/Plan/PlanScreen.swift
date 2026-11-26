import CoachingPresentation
import SwiftUI

/// Plano (Figma page 30; reference `509:115` "Semana · semana 3, hoje"). Weeks from `allWeeks()`, phases and planned volume from `weekPlan`
/// (GAP-07), done from `loggedEntries`. "Toque e segure" opens "não posso neste dia" (GAP-09): the engine proposes, the athlete confirms.
struct PlanScreen: View {
    enum Segment: String, CaseIterable { case week, month, phases }
    @Environment(AppModel.self) private var model
    @State private var segment: Segment = .week
    @State private var weekIndex: Int?
    var openSession: (PlannedSession) -> Void
    var cantThisDay: (PlannedSession) -> Void

    private var current: Int { weekIndex ?? model.plan?.weekIndex ?? 0 }
    private var week: Week? {
        if current == model.plan?.week?.index { return model.plan?.week }
        return model.weeks.first { $0.index == current }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                HStack {
                    Text(L.t("plan.title")).rmText(.numeroL).accessibilityAddTraits(.isHeader)
                    Spacer()
                    SegmentPicker(selection: $segment)
                }
                .padding(.top, 8)
                switch segment {
                case .week: weekBody
                case .month: MonthGrid(weeks: allWeeks, today: model.plan?.today ?? "", logged: model.logged).padding(.top, 20)
                case .phases: PhasesChart(entries: model.weekPlan?.weeks ?? [], current: model.plan?.weekIndex ?? 0, logged: model.logged, weeks: allWeeks).padding(.top, 20)
                }
            }
            .padding(.horizontal, RM.Space.gutter)
            .padding(.bottom, 120)
        }
        .scrollIndicators(.hidden)
        .background(RM.Palette.fundoApp.ignoresSafeArea())
        .toolbar(.hidden, for: .navigationBar)
        .accessibilityIdentifier("screen-plan")
    }

    private var allWeeks: [Week] {
        var w = model.weeks
        if let cw = model.plan?.week, let i = w.firstIndex(where: { $0.index == cw.index }) { w[i] = cw }
        return w
    }

    @ViewBuilder private var weekBody: some View {
        let total = model.plan?.weeks ?? allWeeks.count
        HStack {
            roundButton(.chevronEsquerda, L.t("plan.week.prev"), enabled: current > 0) { weekIndex = current - 1 }
            Spacer()
            VStack(spacing: 2) {
                Text([L.f("plan.week.title", "\(current + 1)", "\(total)"), L.code("phase", model.weekPlan?.weeks.first { $0.index == current }?.phase)]
                    .compactMap { $0 }.joined(separator: " · ")).rmText(.subtitulo)
                if let w = week, let start = Fmt.day(w.startDate), let end = Fmt.calendar.date(byAdding: .day, value: 6, to: start) {
                    Text(L.f("plan.week.range", Fmt.shortDate(w.startDate), Fmt.shortDate(Fmt.dayString(end)))).rmText(.detalhe, RM.Palette.textoSecundario)
                }
            }
            .accessibilityElement(children: .combine)
            .accessibilityIdentifier("plan-week-title")
            Spacer()
            roundButton(.chevronDireita, L.t("plan.week.next"), enabled: current + 1 < total) { weekIndex = current + 1 }
        }
        .padding(.top, 20)
        if let w = week {
            let summary = WeekSummary(week: w, logged: model.logged, weekPlan: model.weekPlan?.weeks.first { $0.index == w.index }, today: model.plan?.today ?? "",
                                      paused: model.plan?.hold != nil)
            summaryBlock(summary).padding(.top, 20)
            Text(L.t("plan.days")).rmText(.micro, RM.Palette.textoTerciario).padding(.top, 24)
            VStack(spacing: 0) {
                ForEach(summary.days, id: \.date) { d in
                    DayRow(day: d, today: model.plan?.today ?? "", open: openSession, cantThisDay: cantThisDay)
                    RMDivider()
                }
            }
            .padding(.top, 8)
            HStack(alignment: .top, spacing: 8) {
                RMIconView(.ajustes, size: 14).foregroundStyle(RM.Palette.textoTerciario)
                Text(L.t("plan.moveHint")).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
            }
            .padding(.top, 16)
            PhasesChart(entries: model.weekPlan?.weeks ?? [], current: model.plan?.weekIndex ?? 0, logged: model.logged, weeks: allWeeks).padding(.top, 20)
        } else {
            Text(L.t("plan.unavailable")).rmText(.corpo, RM.Palette.textoSecundario).padding(.top, 24)
        }
    }

    private func roundButton(_ icon: RMIcon, _ label: String, enabled: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            RMIconView(icon, size: 18).foregroundStyle(enabled ? RM.Palette.textoPrimario : RM.Palette.textoTerciario)
                .frame(width: 36, height: 36).background(RM.Palette.fundoElevado, in: Circle())
        }
        .buttonStyle(PressableStyle()).disabled(!enabled).accessibilityLabel(label)
    }

    private func summaryBlock(_ s: WeekSummary) -> some View {
        VStack(spacing: 16) {
            HStack(spacing: 20) {
                DoubleLaneRing(runProgress: s.runProgress, strengthProgress: s.strengthProgress, done: s.doneSessions, total: s.totalSessions)
                    .frame(width: 190, height: 140)
                VStack(alignment: .leading, spacing: 14) {
                    VStack(alignment: .leading, spacing: 2) {
                        Label { Text(L.t("family.RUN")).rmText(.rotulo, RM.Palette.textoSecundario) } icon: { Capsule().fill(RM.Palette.corrida).frame(width: 18, height: 6) }
                        HStack(alignment: .firstTextBaseline, spacing: 4) {
                            Text(Fmt.minutes(s.runDoneMinutes)).rmText(.numeroM)
                            Text(L.f("plan.run.ofMinutes", Fmt.minutes(s.runPlannedMinutes))).rmText(.detalhe, RM.Palette.textoSecundario)
                        }
                    }
                    VStack(alignment: .leading, spacing: 2) {
                        Label { Text(L.t("family.STRENGTH")).rmText(.rotulo, RM.Palette.textoSecundario) } icon: {
                            HStack(spacing: 2) { ForEach(0..<3, id: \.self) { _ in RoundedRectangle(cornerRadius: 1).fill(RM.Palette.forca).frame(width: 5, height: 6) } }
                        }
                        HStack(alignment: .firstTextBaseline, spacing: 4) {
                            Text("\(s.strengthDone)").rmText(.numeroM)
                            Text(L.f("plan.strength.ofSessions", "\(s.strengthTotal)")).rmText(.detalhe, RM.Palette.textoSecundario)
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            VStack(spacing: 8) {
                HStack {
                    Text(L.t("plan.time.title")).rmText(.detalhe, RM.Palette.textoSecundario)
                    Spacer()
                    Text(Fmt.hoursMinutes(s.doneMinutes)).rmText(.numeroS)
                    Text(L.f("plan.time.of", Fmt.hoursMinutes(s.plannedMinutes))).rmText(.detalhe, RM.Palette.textoSecundario)
                }
                GeometryReader { g in
                    ZStack(alignment: .leading) {
                        Capsule().fill(RM.Palette.fundoTrilho)
                        Capsule().fill(RM.Palette.textoSecundario).frame(width: g.size.width * CGFloat(s.plannedMinutes > 0 ? min(1, s.doneMinutes / s.plannedMinutes) : 0))
                    }
                }
                .frame(height: 6)
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityIdentifier("plan-summary")
    }
}

struct SegmentPicker: View {
    @Binding var selection: PlanScreen.Segment
    var body: some View {
        HStack(spacing: 2) {
            ForEach(PlanScreen.Segment.allCases, id: \.self) { s in
                Button { selection = s } label: {
                    Text(L.t("plan.segment." + s.rawValue)).rmText(.rotulo, selection == s ? RM.Palette.agoraSobre : RM.Palette.textoSecundario)
                        .padding(.horizontal, 14).frame(height: 32)
                        .background(selection == s ? RM.Palette.agora : .clear, in: Capsule())
                }
                .buttonStyle(.plain)
                .accessibilityAddTraits(selection == s ? [.isSelected, .isButton] : .isButton)
                .accessibilityIdentifier("plan-segment-" + s.rawValue)
            }
        }
        .padding(3)
        .background(RM.Palette.fundoElevado, in: Capsule())
    }
}
