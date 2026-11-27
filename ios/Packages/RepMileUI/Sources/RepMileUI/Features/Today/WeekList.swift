import SwiftUI

/// "Semana em painéis" at large text (#99 H3): the same seven days as `WeekPanels`, as a list whose text scales with Dynamic Type, up to the
/// accessibility sizes. Today first (its own background and label), the marks of today tappable as in the panels (same
/// identifiers), the other days read-only. Nothing is computed here: it lays out `TodayContent.Day` as it comes.
struct WeekList: View {
    let days: [TodayContent.Day]
    let label: String
    var onSelect: (TodayContent.Mark) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Today first (it carries the actions), then the other days in order.
            ForEach(days.filter(\.isToday) + days.filter { !$0.isToday }) { day in
                VStack(alignment: .leading, spacing: 8) {
                    if day.isToday { Text(label).rmText(.micro, RM.Palette.textoSecundario) }
                    Text(Fmt.weekdayShort(day.date) + " " + Fmt.dayNumber(day.date))
                        .rmText(day.isToday ? .subtitulo : .rotulo, day.isToday ? RM.Palette.textoPrimario : RM.Palette.textoTerciario)
                    if day.isRest {
                        Label { Text(L.t("plan.rest.title")).rmText(.detalhe, RM.Palette.textoTerciario) } icon: {
                            RMIconView(.descanso, size: 16).foregroundStyle(RM.Palette.textoTerciario)
                        }
                    }
                    ForEach(day.marks) { m in
                        if day.isToday {
                            Button { onSelect(m) } label: { row(m) }
                                .buttonStyle(PressableStyle())
                                .accessibilityIdentifier("today-card-\(m.session.id)")
                        } else {
                            row(m)
                        }
                    }
                }
                .padding(.horizontal, day.isToday ? 14 : 4).padding(.vertical, day.isToday ? 14 : 6)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(day.isToday ? RM.Palette.fundoElevado2 : .clear, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            }
        }
        .padding(.horizontal, RM.Space.gutter)
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("week-list")
    }

    private func row(_ m: TodayContent.Mark) -> some View {
        let tint = m.status == .held ? RM.Palette.textoTerciario : m.status == .missed ? RM.Palette.negativo : m.sport.color
        let icon: RMIcon = m.status == .done ? .check : m.status == .held ? .pausa : m.status == .missed ? .fechar : m.sport.icon
        return HStack(alignment: .top, spacing: 10) {
            RoundedRectangle(cornerRadius: 2).fill(tint).frame(width: 4).frame(maxHeight: .infinity)
            RMIconView(icon, size: 18).foregroundStyle(tint)
            VStack(alignment: .leading, spacing: 2) {
                Text(m.title).rmText(.subtitulo).fixedSize(horizontal: false, vertical: true)
                // The status; the minutes only when no detail line already carries them (a held or logged mark).
                Text(([m.ordinalLabel ?? Self.statusText(m.status), m.details.isEmpty ? m.minutes.map { L.f("common.minutes", Fmt.minutes($0)) } : nil]
                    .compactMap { $0 }).joined(separator: " · "))
                    .rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
                ForEach(m.details, id: \.self) { Text($0).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true) }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .fixedSize(horizontal: false, vertical: true)
        .contentShape(Rectangle())
        .accessibilityElement(children: .combine)
    }

    static func statusText(_ s: TodayContent.Mark.Status) -> String {
        switch s {
        case .done: L.t("today.card.done")
        case .missed: L.t("today.card.missed")
        case .held: L.t("today.card.paused")
        case .next: L.t("today.card.next")
        case .planned: L.t("today.card.planned")
        }
    }
}
