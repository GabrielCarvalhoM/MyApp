import CoachingPresentation
import SwiftUI

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
