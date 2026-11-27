import CoachingPresentation
import SwiftUI

// Plano · semana: the week's counts, its double-lane ring and its day rows (the week segment of `PlanScreen`).

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
