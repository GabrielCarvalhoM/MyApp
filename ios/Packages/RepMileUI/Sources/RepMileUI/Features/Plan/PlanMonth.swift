import CoachingPresentation
import SwiftUI

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
