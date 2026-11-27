import CoachingPresentation
import SwiftUI

/// Treino planejado · corrida (run reference `643:317` "longão de 80 min"): steps, effort and pace only from
/// `PresentationSnapshot.runSession(for:)` (FND-ABC-05), never the prescription's text. Shown by `SessionDetailView` when nothing is paused.
struct SessionRunDetail: View {
    @Environment(AppModel.self) private var model
    let session: PlannedSession
    let prescription: Prescription

    private var run: RunSessionPresentation? { model.presentation?.runSession(for: session) }

    var body: some View {
        let p = prescription
        let steps = flatSteps
        let main = run.flatMap(TodayContent.mainStep)
        MetricGrid(items: runMetrics(p, main: main, steps: steps)).padding(.top, 20)
        if !steps.isEmpty {
            StructureChart(steps: steps).padding(.top, 24)
            Text(L.f("session.steps", Fmt.minutes(steps.reduce(0) { $0 + ($1.step.target.seconds ?? 0) } / 60))).rmText(.micro, RM.Palette.textoTerciario).padding(.top, 24)
            VStack(spacing: 4) {
                ForEach(Array(steps.enumerated()), id: \.offset) { i, s in StepRow(index: i + 1, step: s.step, repeats: s.repeats, highlighted: s.step.kind.raw == main?.kind.raw) }
            }
            .padding(.top, 8)
            .accessibilityElement(children: .contain).accessibilityIdentifier("session-steps")
        } else {
            Text(L.t("session.noSteps")).rmText(.detalhe, RM.Palette.textoSecundario).padding(.top, 16)
        }
        effortCard(main: main).padding(.top, 24)
    }

    /// Each block's steps once, with the block's repeat count (a 3 × 5 min block lists its WORK and RECOVERY with "3 ×").
    private var flatSteps: [(step: RunStep, repeats: Int)] {
        (run?.blocks ?? []).flatMap { b in b.steps.map { ($0, b.repeat_) } }
    }

    private func runMetrics(_ p: Prescription, main: RunStep?, steps: [(step: RunStep, repeats: Int)]) -> [MetricGrid.Item] {
        var items: [MetricGrid.Item] = []
        if let m = p.durationMinutes { items.append(.init(value: L.f("common.minutes", Fmt.minutes(m)), label: L.t("session.duration"))) }
        if let rpe = Fmt.rpe(main?.intensity?.rpe) { items.append(.init(value: rpe, label: L.code("effort", main?.intensity?.effortDomain) ?? L.t("session.effort"))) }
        if let pace = main?.intensity?.pace {
            items.append(.init(value: Fmt.paceBand(fast: pace.fastSecondsPerKm, slow: pace.slowSecondsPerKm).replacingOccurrences(of: " /km", with: "").replacingOccurrences(of: " /mi", with: ""),
                               label: L.t(Fmt.usesMiles ? "session.pace.mi" : "session.pace")))
        }
        let metres = steps.compactMap { s -> (Double, Double)? in s.step.estimate?.metres.map { ($0.low * Double(s.repeats), $0.high * Double(s.repeats)) } }
        if !metres.isEmpty {
            let lo = metres.reduce(0) { $0 + $1.0 } / 1000, hi = metres.reduce(0) { $0 + $1.1 } / 1000
            items.append(.init(value: "≈ " + Fmt.distance(km: lo).replacingOccurrences(of: Fmt.usesMiles ? " mi" : " km", with: "") + "–" + Fmt.distance(km: hi), label: L.t("session.distance")))
        }
        if let main, main.kind.raw == "STEADY", let s = main.target.seconds { items.append(.init(value: L.f("common.minutes", Fmt.minutes(s / 60)), label: L.t("session.continuous"))) }
        if let t = L.code("turn.short", session.turn) { items.append(.init(value: t, label: L.t("session.turn"))) }
        return items
    }

    private func effortCard(main: RunStep?) -> some View {
        RMCard {
            Text(L.t("session.effortSection")).rmText(.micro, RM.Palette.textoTerciario)
            if main?.effortGoverns == true { Text(L.t("session.effortGoverns")).rmText(.titulo) }
            if let d = main?.intensity?.effortDomain {
                HStack(alignment: .firstTextBaseline) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text((L.code("effort", d) ?? "").capitalizedFirst).rmText(.subtitulo)
                        if let talk = L.code("talk", d) { Text(talk).rmText(.detalhe, RM.Palette.textoSecundario) }
                    }
                    Spacer()
                    if let r = Fmt.rpe(main?.intensity?.rpe) {
                        HStack(alignment: .firstTextBaseline, spacing: 4) { Text(r).rmText(.numeroM); Text(L.t("session.rpeOf")).rmText(.detalhe, RM.Palette.textoSecundario) }
                    }
                }
            }
            PaceBands(bands: model.presentation?.readings?.runCalibration?.paceBands ?? [:], highlight: main?.intensity?.pace?.domain?.raw)
            if let cap = model.presentation?.readings?.runCalibration?.capacity, let ref = cap.reference, let km = ref.distanceKm, let s = ref.seconds, let d = ref.date {
                Text([L.f("today.race.base", Fmt.distance(km: km), Fmt.clock(s), Fmt.shortDate(d)),
                      cap.validUntil.flatMap { v in L.code("confidence", cap.confidence).map { L.f("session.estimatedBand", $0, Fmt.shortDate(v)) } }]
                    .compactMap { $0 }.joined(separator: " "))
                    .rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
            }
        }
    }
}

/// "Gráfico de estrutura": each step's width by its time, height by its RPE (display only).
struct StructureChart: View {
    let steps: [(step: RunStep, repeats: Int)]
    var body: some View {
        let expanded = steps.flatMap { s in Array(repeating: s.step, count: max(1, s.repeats)) }
        let total = max(1, expanded.reduce(0) { $0 + ($1.target.seconds ?? 60) })
        GeometryReader { g in
            HStack(alignment: .bottom, spacing: 2) {
                ForEach(Array(expanded.enumerated()), id: \.offset) { _, s in
                    let rpe = s.intensity?.rpe?.last ?? 3
                    RoundedRectangle(cornerRadius: 6, style: .continuous)
                        .fill(["WARMUP", "COOLDOWN", "RECOVERY"].contains(s.kind.raw) ? RM.Palette.corridaPrevisto : RM.Palette.corridaCheio)
                        .frame(width: max(4, (g.size.width - CGFloat(expanded.count) * 2) * CGFloat((s.target.seconds ?? 60) / total)),
                               height: 18 + 50 * CGFloat(rpe / 10))
                }
            }
            .frame(maxHeight: .infinity, alignment: .bottom)
        }
        .frame(height: 72)
        .accessibilityHidden(true)
    }
}

struct StepRow: View {
    let index: Int
    let step: RunStep
    let repeats: Int
    let highlighted: Bool
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Text("\(index)").rmText(.rotulo, highlighted ? RM.Palette.corridaSobre : RM.Palette.textoPrimario)
                .frame(width: 24, height: 24).background(highlighted ? RM.Palette.corridaCheio : RM.Palette.fundoElevado2, in: Circle())
            VStack(alignment: .leading, spacing: 2) {
                HStack(alignment: .firstTextBaseline, spacing: 6) {
                    Text((repeats > 1 ? L.f("session.repeat", "\(repeats)") + " " : "") + (L.code("step", step.kind) ?? "")).rmText(.subtitulo)
                    if let s = step.target.seconds { Text(L.f("common.minutes", Fmt.number(s / 60, fraction: 1))).rmText(.rotulo, RM.Palette.textoSecundario) }
                    else if let m = step.target.metres { Text(Fmt.distance(km: m / 1000)).rmText(.rotulo, RM.Palette.textoSecundario) }
                }
                if let e = L.code("effort", step.intensity?.effortDomain) { Text(e).rmText(.detalhe, RM.Palette.textoSecundario) }
            }
            Spacer(minLength: 8)
            VStack(alignment: .trailing, spacing: 6) {
                if let p = step.intensity?.pace { Text(Fmt.paceBand(fast: p.fastSecondsPerKm, slow: p.slowSecondsPerKm)).rmText(.rotulo) }
                if let r = step.intensity?.rpe { RPEDots(range: r) }
            }
        }
        .padding(12)
        .background(highlighted ? RM.Palette.corridaSuave : .clear, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .accessibilityElement(children: .combine)
    }
}

/// "Escala de esforço em pontos": ten dots, the prescribed RPE range filled.
struct RPEDots: View {
    let range: [Double]
    var body: some View {
        let lo = Int(range.first ?? 0), hi = Int(range.last ?? 0)
        HStack(spacing: 3) {
            ForEach(1...10, id: \.self) { i in Circle().fill(i >= lo && i <= hi ? RM.Palette.corrida : RM.Palette.fundoTrilho).frame(width: 4, height: 4) }
        }
        .accessibilityHidden(true)
    }
}

/// "Faixas de ritmo": the calibrated bands the engine made AVAILABLE, fastest to slowest, on one shared axis.
struct PaceBands: View {
    let bands: [String: CalibratedPaceBand]
    let highlight: String?
    var body: some View {
        let order = ["FIVE_K_EFFORT", "TEN_K_EFFORT", "THRESHOLD_CONTROLLED", "HALF_MARATHON_EFFORT", "MARATHON_EFFORT", "LONG", "EASY", "RECOVERY"]
        let shown = order.compactMap { k -> (String, Double, Double)? in
            guard let b = bands[k], b.status.raw == "AVAILABLE", let f = b.fastSecondsPerKm, let s = b.slowSecondsPerKm, L.code("band", Code(raw: k)) != nil else { return nil }
            return (k, f, s)
        }
        if let lo = shown.map(\.1).min(), let hi = shown.map(\.2).max(), hi > lo {
            VStack(alignment: .leading, spacing: 8) {
                Text(L.t("session.paceBands")).rmText(.detalhe, RM.Palette.textoSecundario)
                ForEach(shown, id: \.0) { k, f, s in
                    HStack(spacing: 8) {
                        Text(L.code("band", Code(raw: k)) ?? "").rmText(.detalhe, k == highlight ? RM.Palette.textoPrimario : RM.Palette.textoSecundario).frame(width: 96, alignment: .leading)
                        GeometryReader { g in
                            ZStack(alignment: .leading) {
                                Capsule().fill(RM.Palette.fundoTrilho).frame(height: 4)
                                Capsule().fill(k == highlight ? RM.Palette.corrida : RM.Palette.corridaPrevisto)
                                    .frame(width: max(6, g.size.width * CGFloat((s - f) / (hi - lo))), height: 4)
                                    .offset(x: g.size.width * CGFloat((f - lo) / (hi - lo)))
                            }
                            .frame(maxHeight: .infinity)
                        }
                        .frame(height: 12)
                    }
                    .accessibilityElement(children: .ignore)
                    .accessibilityLabel((L.code("band", Code(raw: k)) ?? "") + ", " + Fmt.paceBand(fast: f, slow: s))
                }
                HStack {
                    Text(Fmt.clock(lo * (Fmt.usesMiles ? 1.609344 : 1))).rmText(.tab, RM.Palette.textoTerciario)
                    Spacer()
                    Text(Fmt.clock(hi * (Fmt.usesMiles ? 1.609344 : 1))).rmText(.tab, RM.Palette.textoTerciario)
                }
                .padding(.leading, 104)
            }
        }
    }
}
