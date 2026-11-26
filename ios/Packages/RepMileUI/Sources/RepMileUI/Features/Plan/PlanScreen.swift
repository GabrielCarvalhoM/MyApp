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

/// Counts for one week, from the plan and the record (no rule: what is planned and what the record keeps as done).
struct WeekSummary {
    struct Day { let date: String; let sessions: [(PlannedSession, LoggedEntry?)] }
    let days: [Day]
    let totalSessions: Int, doneSessions: Int
    let runPlannedMinutes: Double, runDoneMinutes: Double
    let strengthTotal: Int, strengthDone: Int
    let plannedMinutes: Double, doneMinutes: Double
    var runProgress: Double { runPlannedMinutes > 0 ? min(1, runDoneMinutes / runPlannedMinutes) : 0 }
    var strengthProgress: Double { strengthTotal > 0 ? Double(strengthDone) / Double(strengthTotal) : 0 }

    init(week: Week, logged: LoggedEntries?, weekPlan: WeekPlanEntry?, today: String, paused: Bool) {
        let entries = (logged?.entries ?? []).filter { !$0.superseded }
        func entry(_ s: PlannedSession) -> LoggedEntry? { entries.first { $0.sessionId == s.id && $0.date == s.date } }
        let start = Fmt.day(week.startDate)
        days = (0..<7).compactMap { i in start.flatMap { Fmt.calendar.date(byAdding: .day, value: i, to: $0) }.map(Fmt.dayString) }.map { d in
            Day(date: d, sessions: week.sessions.filter { $0.date == d && $0.status.raw != "REST" }.sorted { ($0.turn?.raw ?? "") < ($1.turn?.raw ?? "") }.map { ($0, entry($0)) })
        }
        let all = days.flatMap(\.sessions)
        totalSessions = all.count
        doneSessions = all.filter { $0.1?.completed == true }.count
        let runs = all.filter { $0.0.sport.raw == "RUN" }, strength = all.filter { $0.0.sport.raw == "STRENGTH" }
        runPlannedMinutes = weekPlan?.plannedRunMinutes ?? runs.compactMap { $0.0.prescription?.durationMinutes }.reduce(0, +)
        runDoneMinutes = runs.compactMap { $0.1?.completed == true ? $0.1?.minutes : nil }.reduce(0, +)
        strengthTotal = strength.count
        strengthDone = strength.filter { $0.1?.completed == true }.count
        plannedMinutes = all.compactMap { $0.0.prescription?.durationMinutes }.reduce(0, +)
        doneMinutes = all.compactMap { $0.1?.completed == true ? $0.1?.minutes : nil }.reduce(0, +)
    }
}

extension Fmt {
    /// 154 → "2h34"; 45 → "45 min".
    static func hoursMinutes(_ minutes: Double) -> String {
        let m = Int(minutes.rounded())
        return m >= 60 ? String(format: "%dh%02d", m / 60, m % 60) : L.f("common.minutes", "\(m)")
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

/// "Pista de raia dupla": the outer lane is a line (run), the inner one blocks (strength); each fills with what the record keeps as done.
struct DoubleLaneRing: View {
    let runProgress: Double, strengthProgress: Double
    let done: Int, total: Int
    var body: some View {
        ZStack {
            Capsule().stroke(RM.Palette.fundoTrilho, lineWidth: 16)
            Capsule().trim(from: 0, to: runProgress).stroke(RM.Palette.corrida, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                .padding(-1)
            Capsule().inset(by: 20).stroke(RM.Palette.forcaPrevisto, style: StrokeStyle(lineWidth: 14, dash: [26, 4]))
            Capsule().inset(by: 20).trim(from: 0, to: strengthProgress).stroke(RM.Palette.forca, style: StrokeStyle(lineWidth: 14, dash: [26, 4]))
            VStack(spacing: 0) {
                HStack(alignment: .firstTextBaseline, spacing: 4) {
                    Text("\(done)").rmText(.numeroL)
                    Text(L.f("plan.ring.of", "\(total)")).rmText(.detalhe, RM.Palette.textoSecundario)
                }
                Text(L.t("plan.ring.sessions")).rmText(.detalhe, RM.Palette.textoSecundario)
            }
        }
        .padding(8)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(done) " + L.f("plan.ring.of", "\(total)") + " " + L.t("plan.ring.sessions"))
    }
}

struct DayRow: View {
    let day: WeekSummary.Day
    let today: String
    var open: (PlannedSession) -> Void
    var cantThisDay: (PlannedSession) -> Void

    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            VStack(spacing: 2) {
                Text(Fmt.weekdayShort(day.date)).rmText(.micro, day.date == today ? RM.Palette.textoPrimario : RM.Palette.textoTerciario)
                Text(Fmt.dayNumber(day.date)).rmText(.numeroS, day.date == today ? RM.Palette.agoraSobre : RM.Palette.textoPrimario)
                    .frame(width: 30, height: 30)
                    .background(day.date == today ? RM.Palette.agora : .clear, in: Circle())
            }
            .frame(width: 40)
            if day.sessions.isEmpty {
                VStack(alignment: .leading, spacing: 2) {
                    Label { Text(L.t("plan.rest.title")).rmText(.subtitulo, RM.Palette.textoSecundario) } icon: { RMIconView(.descanso, size: 16).foregroundStyle(RM.Palette.textoTerciario) }
                    Text(L.t("plan.rest.detail")).rmText(.detalhe, RM.Palette.textoTerciario)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            } else {
                VStack(alignment: .leading, spacing: 12) {
                    ForEach(day.sessions, id: \.0.id) { s, entry in
                        Button { open(s) } label: { row(s, entry) }
                            .buttonStyle(.plain)
                            .accessibilityIdentifier("plan-session-\(s.id)")
                            .contextMenu {
                                if s.executable, entry == nil {
                                    Button { cantThisDay(s) } label: { Text(L.t("session.cantThisDay")) }
                                }
                            }
                    }
                }
            }
        }
        .padding(.vertical, 14)
    }

    private func row(_ s: PlannedSession, _ entry: LoggedEntry?) -> some View {
        let sport = Sport(code: s.sport.raw) ?? .run
        let minutes = entry?.completed == true ? entry?.minutes : s.prescription?.durationMinutes
        let detail = [minutes.map { L.f("common.minutes", Fmt.minutes($0)) },
                      s.prescription?.effortDomain.flatMap { d in L.code("effort", d) },
                      s.prescription?.exercises.map { L.f("today.card.strength.detail", "\($0.count)", "\($0.reduce(0) { $0 + $1.sets })") }]
            .compactMap { $0 }.joined(separator: " · ")
        return HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    RMIconView(sport.icon, size: 16).foregroundStyle(sport.color)
                    Text(TodayContent.title(s)).rmText(.subtitulo)
                    if s.projected { Text(L.t("plan.projected")).rmText(.tab, RM.Palette.textoSecundario).padding(.horizontal, 6).padding(.vertical, 2).background(RM.Palette.fundoElevado2, in: Capsule()) }
                }
                if !detail.isEmpty { Text(detail).rmText(.detalhe, RM.Palette.textoSecundario) }
            }
            Spacer()
            if entry?.completed == true { RMIconView(.check, size: 16).foregroundStyle(RM.Palette.positivo).accessibilityLabel(L.t("today.card.done")) }
            else if entry?.completed == false { RMIconView(.fechar, size: 16).foregroundStyle(RM.Palette.negativo).accessibilityLabel(L.t("today.card.missed")) }
            else if let t = L.code("turn.short", s.turn) { Text(t).rmText(.detalhe, RM.Palette.textoTerciario) }
        }
        .contentShape(Rectangle())
        .accessibilityElement(children: .combine)
    }
}

/// "Fases até a prova · minutos por semana": run minutes above the baseline, strength sets below (mirrored bars, display only).
struct PhasesChart: View {
    let entries: [WeekPlanEntry]
    let current: Int
    let logged: LoggedEntries?
    let weeks: [Week]

    var body: some View {
        RMCard {
            HStack {
                Text(L.t("plan.phases.title")).rmText(.subtitulo)
                Spacer()
                Text(L.t("plan.phases.unit")).rmText(.detalhe, RM.Palette.textoSecundario)
            }
            let maxRun = max(1, entries.compactMap(\.plannedRunMinutes).max() ?? 1)
            let maxSets = max(1, entries.compactMap(\.plannedStrengthSets).max() ?? 1)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(alignment: .center, spacing: 6) {
                    ForEach(entries, id: \.index) { e in
                        VStack(spacing: 4) {
                            Text(e.plannedRunMinutes.map { Fmt.minutes($0) } ?? "").rmText(.tab, e.index == current ? RM.Palette.textoPrimario : RM.Palette.textoSecundario)
                            Spacer(minLength: 0)
                            RoundedRectangle(cornerRadius: 8, style: .continuous)
                                .fill(e.index < current ? RM.Palette.corrida : e.index == current ? RM.Palette.corridaCheio : RM.Palette.corridaPrevisto)
                                .frame(width: 26, height: 10 + 90 * CGFloat((e.plannedRunMinutes ?? 0) / maxRun))
                            Rectangle().fill(RM.Palette.linhaBase).frame(width: 34, height: 1)
                            RoundedRectangle(cornerRadius: 6, style: .continuous)
                                .fill(e.index <= current ? RM.Palette.forca : RM.Palette.forcaPrevisto)
                                .frame(width: 26, height: 6 + 40 * CGFloat((e.plannedStrengthSets ?? 0) / maxSets))
                            Spacer(minLength: 0)
                            Text(e.startDate.map(Fmt.shortDate) ?? "").rmText(.tab, e.index == current ? RM.Palette.textoPrimario : RM.Palette.textoTerciario)
                                .fixedSize()
                        }
                        .frame(width: 34, height: 210)
                        .background(e.index == current ? RM.Palette.fundoElevado2 : .clear, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                        .accessibilityElement(children: .ignore)
                        .accessibilityLabel([e.startDate.map(Fmt.shortDate), L.code("phase", e.phase), e.plannedRunMinutes.map { L.f("common.minutes", Fmt.minutes($0)) }]
                            .compactMap { $0 }.joined(separator: ", "))
                    }
                }
            }
            HStack(spacing: 0) {
                ForEach(Array(phaseGroups.enumerated()), id: \.offset) { _, g in
                    VStack(alignment: .leading, spacing: 4) {
                        Capsule().fill(g.containsCurrent ? RM.Palette.textoPrimario : RM.Palette.fundoTrilho).frame(height: 2)
                        Text(g.name).rmText(.tab, g.containsCurrent ? RM.Palette.textoPrimario : RM.Palette.textoTerciario).lineLimit(1).minimumScaleFactor(0.7)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .layoutPriority(Double(g.count))
                }
            }
            Text(L.t("plan.phases.legend")).rmText(.detalhe, RM.Palette.textoSecundario)
        }
        .accessibilityElement(children: .contain).accessibilityIdentifier("plan-phases")
    }

    private var phaseGroups: [(name: String, count: Int, containsCurrent: Bool)] {
        entries.reduce(into: []) { acc, e in
            let n = L.code("phase", e.phase) ?? ""
            if let last = acc.last, last.name == n { acc[acc.count - 1].count += 1; if e.index == current { acc[acc.count - 1].containsCurrent = true } }
            else { acc.append((n, 1, e.index == current)) }
        }
    }
}

/// "Mês": the plan's days on a calendar grid, one mark per session (run line, strength block), done filled.
struct MonthGrid: View {
    let weeks: [Week]
    let today: String
    let logged: LoggedEntries?
    var body: some View {
        let sessions = weeks.flatMap(\.sessions)
        let entries = logged?.entries ?? []
        VStack(alignment: .leading, spacing: 10) {
            ForEach(weeks, id: \.index) { w in
                HStack(spacing: 4) {
                    ForEach(0..<7, id: \.self) { i in
                        let d = Fmt.day(w.startDate).flatMap { Fmt.calendar.date(byAdding: .day, value: i, to: $0) }.map(Fmt.dayString) ?? ""
                        let ofDay = sessions.filter { $0.date == d && $0.status.raw != "REST" }
                        VStack(spacing: 4) {
                            Text(Fmt.dayNumber(d)).rmText(.rotulo, d == today ? RM.Palette.agoraSobre : RM.Palette.textoPrimario)
                                .frame(width: 26, height: 26).background(d == today ? RM.Palette.agora : .clear, in: Circle())
                            HStack(spacing: 2) {
                                ForEach(ofDay, id: \.id) { s in
                                    let done = entries.contains { $0.sessionId == s.id && $0.date == s.date && $0.completed }
                                    let sport = Sport(code: s.sport.raw) ?? .run
                                    RoundedRectangle(cornerRadius: 2).fill(done ? sport.color : sport.soft)
                                        .frame(width: sport == .run ? 10 : 6, height: sport == .run ? 3 : 6)
                                }
                            }
                            .frame(height: 6)
                        }
                        .frame(maxWidth: .infinity)
                        .accessibilityElement(children: .ignore)
                        .accessibilityLabel(Fmt.weekdayName(d) + " " + Fmt.dayNumber(d) + ", " + ofDay.map { TodayContent.title($0) }.joined(separator: ", "))
                    }
                }
            }
        }
        .accessibilityElement(children: .contain).accessibilityIdentifier("plan-month")
    }
}
