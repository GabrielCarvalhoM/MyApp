import CoachingPresentation
import SwiftUI

/// Progresso (Figma page 60). Estimates range first (central never alone), the plan scenario forecast, planned vs done volume per week from
/// `weekPlan` + `loggedEntries`, a consistency grid, results the athlete ran, and strength exposure (descriptive only). Hidden in V1: "Mapa
/// híbrido" (GAP-25), watch signals (`notInV1`), time in zone (C10). The volume bars draw progressively (motion priority 4).
struct ProgressScreen: View {
    @Environment(AppModel.self) private var model
    @State private var drawn = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    private var calibration: RunCalibration? { model.presentation?.readings?.runCalibration }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text(L.t("progress.title")).rmText(.numeroL).padding(.top, 8).accessibilityAddTraits(.isHeader)
                estimates
                forecast
                volume
                consistency
                results
                strength
            }
            .padding(.horizontal, RM.Space.gutter)
            .padding(.bottom, 24)   // the tab bar's own inset clears it (#99 H2)
        }
        .scrollIndicators(.hidden)
        .accessibilityIdentifier("screen-progress")
        .background(RM.Palette.fundoApp.ignoresSafeArea())
        .toolbar(.hidden, for: .navigationBar)
        .onAppear { if reduceMotion { drawn = true } else { withAnimation(.easeOut(duration: 0.9).delay(0.15)) { drawn = true } } }
    }

    @ViewBuilder private var estimates: some View {
        if let est = calibration?.estimates, !est.isEmpty {
            RMCard {
                Text(L.t("progress.estimates")).rmText(.subtitulo)
                ForEach(["5K", "10K", "HALF_MARATHON", "MARATHON"].filter { est[$0] != nil }, id: \.self) { k in
                    let e = est[k]!
                    HStack(alignment: .firstTextBaseline) {
                        Text(L.code("event", Code(raw: k))?.capitalizedFirst ?? k).rmText(.rotulo, RM.Palette.textoSecundario).frame(width: 110, alignment: .leading)
                        if e.status.raw == "AVAILABLE", let lo = e.lowSeconds, let hi = e.highSeconds {
                            Text(Fmt.clock(lo) + "–" + Fmt.clock(hi)).rmText(.numeroS)
                        } else {
                            Text(L.code("progress.estimate.unavailable", e.reason) ?? L.t("progress.estimate.unavailable")).rmText(.detalhe, RM.Palette.textoTerciario)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                        Spacer(minLength: 0)
                    }
                    .accessibilityElement(children: .combine)
                }
                Text(L.t("progress.estimates.note")).rmText(.detalhe, RM.Palette.textoTerciario).fixedSize(horizontal: false, vertical: true)
            }
            .accessibilityElement(children: .contain).accessibilityIdentifier("progress-estimates")
        }
    }

    @ViewBuilder private var forecast: some View {
        if let f = model.presentation?.readings?.runForecast, f.status.raw == "SHOWN", let event = f.event, let name = L.code("event", event.kind) {
            RMCard {
                HStack {
                    Text(L.t("progress.forecast")).rmText(.subtitulo)
                    Spacer()
                    Text(name + " · " + Fmt.weekdayAndDate(event.date)).rmText(.detalhe, RM.Palette.marco)
                }
                if let p = f.planScenario, p.status.raw != "UNAVAILABLE", let lo = p.lowSeconds, let hi = p.highSeconds {
                    Text(Fmt.clock(lo) + "–" + Fmt.clock(hi)).rmText(.numeroL)
                } else if let c = f.current {
                    Text(Fmt.clock(c.lowSeconds) + "–" + Fmt.clock(c.highSeconds)).rmText(.numeroL)
                }
                Text(L.t("progress.forecast.note")).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
                if let o = f.observedForecast, o.status.raw == "UNAVAILABLE", let n = o.needed {
                    Text(L.f("progress.forecast.observed", "\(n)")).rmText(.detalhe, RM.Palette.textoTerciario)
                }
            }
            .accessibilityElement(children: .contain).accessibilityIdentifier("progress-forecast")
        }
    }

    private var doneByWeek: [Int: (runMinutes: Double, sets: Double, sessions: Int)] {
        var out: [Int: (Double, Double, Int)] = [:]
        let entries = (model.logged?.entries ?? []).filter { !$0.superseded && $0.completed }
        for w in model.weeks {
            guard let start = Fmt.day(w.startDate) else { continue }
            let inWeek = entries.filter { e in Fmt.day(e.date).map { $0 >= start && $0 < start.addingTimeInterval(7 * 86_400) } ?? false }
            let run = inWeek.filter { $0.sport?.raw == "RUN" }.compactMap(\.minutes).reduce(0, +)
            let sets = inWeek.compactMap(\.exercises).flatMap { $0 }.reduce(0) { $0 + Double($1.sets.count) }
            out[w.index] = (run, sets, inWeek.count)
        }
        return out
    }

    @ViewBuilder private var volume: some View {
        let entries = model.weekPlan?.weeks ?? []
        if !entries.isEmpty {
            let done = doneByWeek
            let maxRun = max(1, entries.compactMap(\.plannedRunMinutes).max() ?? 1, done.values.map(\.runMinutes).max() ?? 1)
            let maxSets = max(1, entries.compactMap(\.plannedStrengthSets).max() ?? 1, done.values.map(\.sets).max() ?? 1)
            RMCard {
                Text(L.t("progress.volume")).rmText(.subtitulo)
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(alignment: .center, spacing: 8) {
                        ForEach(entries, id: \.index) { e in
                            let d = done[e.index]
                            VStack(spacing: 4) {
                                ZStack(alignment: .bottom) {
                                    RoundedRectangle(cornerRadius: 6).strokeBorder(RM.Palette.corridaPrevisto, lineWidth: 1.5)
                                        .frame(width: 22, height: 8 + 80 * CGFloat((e.plannedRunMinutes ?? 0) / maxRun))
                                    RoundedRectangle(cornerRadius: 6).fill(RM.Palette.corrida)
                                        .frame(width: 22, height: drawn ? 80 * CGFloat((d?.runMinutes ?? 0) / maxRun) : 0)
                                }
                                .frame(height: 90, alignment: .bottom)
                                Rectangle().fill(RM.Palette.linhaBase).frame(width: 28, height: 1)
                                ZStack(alignment: .top) {
                                    RoundedRectangle(cornerRadius: 4).strokeBorder(RM.Palette.forcaPrevisto, lineWidth: 1.5)
                                        .frame(width: 22, height: 6 + 36 * CGFloat((e.plannedStrengthSets ?? 0) / maxSets))
                                    RoundedRectangle(cornerRadius: 4).fill(RM.Palette.forca)
                                        .frame(width: 22, height: drawn ? 36 * CGFloat((d?.sets ?? 0) / maxSets) : 0)
                                }
                                .frame(height: 44, alignment: .top)
                                Text("\(e.index + 1)").rmText(.tab, e.index == model.plan?.weekIndex ? RM.Palette.textoPrimario : RM.Palette.textoTerciario)
                            }
                            .accessibilityElement(children: .ignore)
                            .accessibilityLabel(L.f("plan.week.title", "\(e.index + 1)", "\(entries.count)") + ", " + Fmt.minutes(d?.runMinutes ?? 0) + " " + L.f("plan.run.ofMinutes", Fmt.minutes(e.plannedRunMinutes ?? 0)))
                        }
                    }
                }
                Text(L.t("progress.volume.legend")).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
            }
            .accessibilityElement(children: .contain).accessibilityIdentifier("progress-volume")
        }
    }

    @ViewBuilder private var consistency: some View {
        let entries = (model.logged?.entries ?? []).filter { !$0.superseded }
        let weeks = model.weeks.filter { $0.index <= (model.plan?.weekIndex ?? 0) }
        if !weeks.isEmpty {
            RMCard {
                Text(L.t("progress.consistency")).rmText(.subtitulo)
                VStack(alignment: .leading, spacing: 6) {
                    ForEach(weeks, id: \.index) { w in
                        HStack(spacing: 4) {
                            Text("\(w.index + 1)").rmText(.tab, RM.Palette.textoTerciario).frame(width: 16)
                            ForEach(w.sessions.filter { $0.status.raw != "REST" }, id: \.id) { s in
                                let e = entries.first { $0.sessionId == s.id && $0.date == s.date }
                                let sport = Sport(code: s.sport.raw) ?? .run
                                RoundedRectangle(cornerRadius: 3)
                                    .fill(e?.completed == true ? sport.color : e?.completed == false ? RM.Palette.negativoSuave : RM.Palette.fundoTrilho)
                                    .frame(width: 18, height: 18)
                            }
                        }
                    }
                }
                Text(L.t("progress.consistency.note")).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
            }
            .accessibilityElement(children: .contain).accessibilityIdentifier("progress-consistency")
        }
    }

    @ViewBuilder private var results: some View {
        if let r = calibration?.actualResults, !r.isEmpty {
            RMCard {
                Text(L.t("progress.results")).rmText(.subtitulo)
                ForEach(Array(r.enumerated()), id: \.offset) { _, x in
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text([L.code("progress.result", x.kind), x.distanceKm.map { Fmt.distance(km: $0) }].compactMap { $0 }.joined(separator: " · ")).rmText(.rotulo)
                            if let d = x.date { Text(Fmt.shortDate(d)).rmText(.detalhe, RM.Palette.textoSecundario) }
                        }
                        Spacer()
                        if let s = x.seconds { Text(Fmt.clock(s)).rmText(.numeroS) }
                    }
                }
            }
        }
    }

    @ViewBuilder private var strength: some View {
        if let s = model.presentation?.readings?.strengthExposure, s.isDescriptiveOnly, let planned = s.planned?.byPrimaryMuscle, !planned.isEmpty {
            RMCard {
                Text(L.t("progress.strength")).rmText(.subtitulo)
                let maxV = max(1, planned.values.max() ?? 1)
                ForEach(planned.keys.sorted().filter { L.code("muscle", Code(raw: $0)) != nil }, id: \.self) { k in
                    HStack(spacing: 8) {
                        Text(L.code("muscle", Code(raw: k)) ?? "").rmText(.detalhe, RM.Palette.textoSecundario).frame(width: 130, alignment: .leading)
                        GeometryReader { g in
                            Capsule().fill(RM.Palette.forcaPrevisto).frame(width: g.size.width * CGFloat((planned[k] ?? 0) / maxV), height: 6)
                                .overlay(alignment: .leading) {
                                    Capsule().fill(RM.Palette.forca).frame(width: g.size.width * CGFloat((s.executed?.byPrimaryMuscle?[k] ?? 0) / maxV), height: 6)
                                }
                                .frame(maxHeight: .infinity)
                        }
                        .frame(height: 12)
                        Text(Fmt.number(planned[k] ?? 0)).rmText(.tab, RM.Palette.textoSecundario).frame(width: 20, alignment: .trailing)
                    }
                    .accessibilityElement(children: .combine)
                }
                Text(L.t("progress.strength.note")).rmText(.detalhe, RM.Palette.textoTerciario)
            }
        }
    }
}
