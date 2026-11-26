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
    private var run: RunSessionPresentation? { model.presentation?.runSession(for: session) }
    private var startability: Startability { model.startability(of: session) }
    private var paused: Bool { model.plan?.hold != nil || [.outsideV1Scope, .clinicalHumanRequired].contains(model.globalGate) }
    private var done: LoggedEntry? { model.logged?.entries.first { $0.sessionId == session.id && $0.date == session.date && $0.completed && !$0.superseded } }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                header
                if !paused, let p = session.prescription {
                    if sport == .run { runBody(p) } else { strengthBody(p) }
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

    // MARK: run

    @ViewBuilder private func runBody(_ p: Prescription) -> some View {
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

    // MARK: strength

    @ViewBuilder private func strengthBody(_ p: Prescription) -> some View {
        let exercises = p.exercises ?? []
        MetricGrid(items: [
            p.durationMinutes.map { MetricGrid.Item(value: L.f("common.minutes", Fmt.minutes($0)), label: L.t("session.duration")) },
            MetricGrid.Item(value: "\(exercises.count)", label: L.t("session.label.exercises")),
            MetricGrid.Item(value: "\(exercises.reduce(0) { $0 + $1.sets })", label: L.t("session.label.sets")),
            L.code("turn.short", session.turn).map { MetricGrid.Item(value: $0, label: L.t("session.turn")) },
        ].compactMap { $0 }).padding(.top, 20)
        Text(L.f("session.exercises", "\(exercises.count)")).rmText(.micro, RM.Palette.textoTerciario).padding(.top, 24)
        VStack(spacing: 0) {
            ForEach(exercises, id: \.id) { e in
                ExerciseRow(exercise: e, previous: previousLoad(e.id))
                if e.id != exercises.last?.id { RMDivider() }
            }
        }
        .padding(.top, 8)
        .accessibilityElement(children: .contain).accessibilityIdentifier("session-exercises")
    }

    /// The athlete's last logged working load for this exercise (the record, never the engine): "Anterior".
    private func previousLoad(_ id: String) -> String? {
        let rows = (model.logged?.entries ?? []).filter { !$0.superseded && $0.date < session.date }.sorted { $0.date > $1.date }
        for r in rows {
            if let set = r.exercises?.first(where: { $0.id == id })?.sets.last, let load = set.load {
                if load.unit.raw == "BODYWEIGHT" { return L.t("load.BODYWEIGHT") }
                return Fmt.number(load.value, fraction: 1) + " " + load.unit.raw.lowercased() + (set.reps.map { " × \($0)" } ?? "")
            }
        }
        return nil
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

struct ExerciseRow: View {
    let exercise: PrescribedExercise
    let previous: String?
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(alignment: .firstTextBaseline) {
                Text(L.code("exercise", Code(raw: exercise.id)) ?? exercise.id).rmText(.subtitulo)
                Spacer()
                Text(L.f("session.setsReps", "\(exercise.sets)", exercise.reps.map(String.init) ?? "–")).rmText(.numeroS)
            }
            Text(detail).rmText(.detalhe, RM.Palette.textoSecundario)
            if let previous { Text(L.f("session.previous", previous)).rmText(.detalhe, RM.Palette.textoTerciario) }
        }
        .padding(.vertical, 12)
        .accessibilityElement(children: .combine)
    }
    private var detail: String {
        var parts: [String] = []
        if let load = exercise.load {
            if load.mode.raw == "KNOWN", let v = load.value {
                parts.append(Fmt.number(v, fraction: 1) + " " + (load.unit?.raw.lowercased() ?? "") + (L.code("convention", load.convention).map { " " + $0 } ?? ""))
            } else if let copy = L.code("load", load.mode) { parts.append(copy) }
        }
        if let rir = exercise.rir { parts.append(L.f("session.rir", Fmt.number(rir))) }
        if let rest = exercise.restSeconds { parts.append(L.f("session.rest", Fmt.clock(rest))) }
        return parts.joined(separator: " · ")
    }
}
