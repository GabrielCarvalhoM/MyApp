import CoachingPresentation
import IntegrationContracts
import SwiftUI

/// Histórico (Figma page 50) from `loggedEntries` only (GAP-06): measured, declared and contested distances apart; a conflicted row (or one
/// with more than one athlete voice) shows every voice; `unplannedMerge` says it was not saved as a separate session. No delete (GAP-13).
struct HistoryScreen: View {
    @Environment(AppModel.self) private var model
    @State private var selected: LoggedEntry?

    private var entries: [LoggedEntry] {
        (model.logged?.entries ?? []).filter { !$0.superseded }.sorted { ($0.date, $0.observedAt ?? "") > ($1.date, $1.observedAt ?? "") }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                Text(L.t("history.title")).rmText(.numeroL).padding(.top, 8).accessibilityAddTraits(.isHeader)
                if let h = model.healthStatus { HealthStatusRow(status: h).padding(.top, 16) }
                if entries.isEmpty {
                    VStack(spacing: 16) {
                        RMIllustration.prancheta.image.resizable().scaledToFit().frame(height: 120).accessibilityHidden(true)
                        Text(L.t("history.empty")).rmText(.corpo, RM.Palette.textoSecundario).multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity).padding(.top, 60)
                    .accessibilityIdentifier("history-empty")
                } else {
                    ForEach(groupedByWeek, id: \.0) { week, rows in
                        Text(week).rmText(.micro, RM.Palette.textoTerciario).padding(.top, 24).padding(.bottom, 4)
                        ForEach(rows) { e in
                            Button { selected = e } label: { HistoryRow(entry: e, title: title(e)) }
                                .buttonStyle(.plain)
                                .accessibilityIdentifier("history-row-\(e.eventId)")
                            RMDivider()
                        }
                    }
                }
            }
            .padding(.horizontal, RM.Space.gutter)
            .padding(.bottom, 120)
        }
        .scrollIndicators(.hidden)
        .accessibilityIdentifier("screen-history")
        .background(RM.Palette.fundoApp.ignoresSafeArea())
        .toolbar(.hidden, for: .navigationBar)
        .sheet(item: $selected) {
            HistoryDetail(viewModel: HistoryCorrectionViewModel(entry: $0, sessionDate: HistoryCorrectionViewModel.sessionDate(of: $0, in: model.weeks), writer: model.writer, planToday: { [model] in await model.planDayNow() },
                                                                reload: { [model] in await model.load() }, holdGuidance: { [model] in model.plan?.clinicalGuidance }),
                          title: title($0),
                          signs: { [model] in NotFeeling100ViewModel(reader: model.reader, writer: model.writer, planToday: { model.plan?.today },
                                                                     holdGuidance: { model.plan?.clinicalGuidance }) })
        }
    }

    private var groupedByWeek: [(String, [LoggedEntry])] {
        let weeks = model.weeks
        var groups: [(String, [LoggedEntry])] = []
        for e in entries {
            let w = weeks.first { w in Fmt.day(w.startDate).map { start in
                let d = Fmt.day(e.date) ?? start
                return d >= start && d < start.addingTimeInterval(7 * 86_400)
            } ?? false }
            let label = w.map { L.f("plan.week.title", "\($0.index + 1)", "\(model.plan?.weeks ?? weeks.count)") } ?? Fmt.shortDate(e.date)
            if let i = groups.firstIndex(where: { $0.0 == label }) { groups[i].1.append(e) } else { groups.append((label, [e])) }
        }
        return groups
    }

    func title(_ e: LoggedEntry) -> String {
        if let id = e.sessionId, let s = model.weeks.flatMap(\.sessions).first(where: { $0.id == id && $0.date == e.date }) { return TodayContent.title(s) }
        if e.channels.map(\.raw) == ["DEVICE"] { return L.t("history.deviceRun") }
        return e.sport?.raw == "STRENGTH" ? L.t("history.unplannedStrength") : L.t("history.unplannedRun")
    }
}

/// A distance with whose number it is: measured (device), declared (athlete), contested (athlete's correction of a measurement).
enum DistanceText {
    static func lines(measured: Double?, declared: Double?, contested: ContestedDistanceEntry?, measurement: Code?) -> [String] {
        var out: [String] = []
        if let m = measured { out.append(L.f("history.measured", Fmt.distance(km: m)) + (L.code("history.measurement", measurement).map { " · " + $0 } ?? "")) }
        if let c = contested { out.append(L.f("history.contested", Fmt.distance(km: c.distanceKm)) + (L.code("reason", c.reason).map { " · " + $0 } ?? "")) }
        else if let d = declared { out.append(L.f("history.declared", Fmt.distance(km: d))) }
        return out
    }
}

struct HistoryRow: View {
    let entry: LoggedEntry
    let title: String
    var body: some View {
        let sport = Sport(code: entry.sport?.raw ?? "RUN") ?? .run
        HStack(alignment: .top, spacing: 12) {
            RMIconView(sport.icon, size: 18).foregroundStyle(entry.completed ? sport.color : RM.Palette.negativo).frame(width: 28, height: 28)
                .background(entry.completed ? sport.soft : RM.Palette.negativoSuave, in: Circle())
            VStack(alignment: .leading, spacing: 2) {
                Text(title).rmText(.subtitulo)
                Text(([Fmt.weekdayAndDate(entry.date)] + (entry.completed ? [entry.minutes.map { L.f("common.minutes", Fmt.minutes($0)) }].compactMap { $0 } : [L.t("history.notDone")]))
                    .joined(separator: " · ")).rmText(.detalhe, RM.Palette.textoSecundario)
                ForEach(DistanceText.lines(measured: entry.measuredKm, declared: entry.declaredKm, contested: entry.contested, measurement: entry.measurement), id: \.self) {
                    Text($0).rmText(.detalhe, RM.Palette.textoSecundario)
                }
                if entry.unplannedMerge { Text(L.t("history.merged")).rmText(.detalhe, RM.Palette.marco).fixedSize(horizontal: false, vertical: true) }
                if entry.conflicted {
                    Text(L.t(entry.channels.contains { $0.raw == "DEVICE" } ? "history.conflicted" : "history.conflicted.athlete"))
                        .rmText(.detalhe, RM.Palette.marco).fixedSize(horizontal: false, vertical: true)
                }
            }
            Spacer()
            if entry.channels.count > 1 { RMIconView(.relogio, size: 14).foregroundStyle(RM.Palette.textoTerciario).accessibilityHidden(true) }
            RMIconView(.chevronDireita, size: 16).foregroundStyle(RM.Palette.textoTerciario)
        }
        .padding(.vertical, 12)
        .contentShape(Rectangle())
        .accessibilityElement(children: .combine)
    }
}

/// Apple Saúde as B can honestly say it (Figma 81 / 20): never "denied"; nothing received is "nada recebido".
struct HealthStatusRow: View {
    let status: HealthIngestStatus
    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            RMIconView(.relogio, size: 16).foregroundStyle(RM.Palette.textoSecundario)
            VStack(alignment: .leading, spacing: 2) {
                Text(L.t("health.title")).rmText(.rotulo)
                if status.lastWorkoutReceivedAt == nil { Text(L.t("health.nothing")).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true) }
                if status.queued > 0 { Text(L.f("health.queued", "\(status.queued)")).rmText(.detalhe, RM.Palette.textoSecundario) }
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .accessibilityElement(children: .combine)
        .accessibilityIdentifier("health-status")
    }
}
