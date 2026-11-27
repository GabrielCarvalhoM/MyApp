import SwiftUI

/// "Semana em painéis" (Figma `880:4283`): one panel per day, today wide in the centre; run marks above the baseline (line), strength below
/// (block). Filled = done, soft dashed = planned, white halo = the next session. Marks scale with prescribed or logged minutes (display only).
///
/// Large text (#99 H3, Figma `889:515` "Texto grande / Hoje", body +30 %): every measure of the strip grows with the text, by the same
/// factor, up to the frame's × 1.3 (today's panel 247, the others 52, the cards 226 × 161); the text inside grows up to xxxLarge with it.
struct WeekPanels: View {
    let days: [TodayContent.Day]
    let label: String
    var onSelect: (TodayContent.Mark) -> Void = { _ in }
    @ScaledMetric(relativeTo: .body) private var bodyScale: CGFloat = 1

    /// 1 up to Large; the text's own growth above it, up to the Figma's large-text frame (× 1.3).
    static func scale(bodyScale: CGFloat) -> CGFloat { min(max(bodyScale, 1), 1.3) }
    private var k: CGFloat { Self.scale(bodyScale: bodyScale) }

    // Figma geometry (393 pt frame, `880:4283`), times `k`.
    private var height: CGFloat { 340 * k }
    private var panelH: CGFloat { 306 * k }
    private var baseline: CGFloat { 170 * k }
    private var narrow: CGFloat { 40 * k }
    private var gap: CGFloat { 4 * k }
    private var wide: CGFloat { 190 * k }

    var body: some View {
        GeometryReader { geo in
            let todayIndex = days.firstIndex { $0.isToday }
            let todayX = (geo.size.width - wide) / 2
            ZStack(alignment: .topLeading) {
                ForEach(Array(days.enumerated()), id: \.element.id) { i, day in
                    let x = xFor(i, todayIndex: todayIndex, todayX: todayX, width: geo.size.width)
                    if day.isToday {
                        todayPanel(day).offset(x: x)
                    } else {
                        dayPanel(day).offset(x: x)
                    }
                }
                Rectangle().fill(RM.Palette.linhaBase).frame(height: 1).offset(y: baseline)
                    .allowsHitTesting(false)
            }
            .frame(width: geo.size.width, height: height, alignment: .topLeading)
            .clipped()
        }
        .frame(height: height)
        .accessibilityElement(children: .contain)
        // The geometry stops at the Figma's × 1.3; the text stops with it.
        .dynamicTypeSize(...DynamicTypeSize.xxxLarge)
        .accessibilityElement(children: .contain).accessibilityIdentifier("week-panels")
    }

    private func xFor(_ i: Int, todayIndex: Int?, todayX: CGFloat, width: CGFloat) -> CGFloat {
        guard let t = todayIndex else {
            // No today in this week (e.g. the eve of the plan): seven equal panels.
            let w = (width - 6 * gap) / 7
            return CGFloat(i) * (w + gap)
        }
        if i < t { return todayX - CGFloat(t - i) * (narrow + gap) }
        if i == t { return todayX }
        return todayX + wide + gap + CGFloat(i - t - 1) * (narrow + gap)
    }

    private func barHeight(_ minutes: Double?) -> CGFloat {
        guard let m = minutes else { return 90 * k }
        return min(124, max(90, 90 + CGFloat(m - 40) * 0.85)) * k
    }

    @ViewBuilder private func dayPanel(_ day: TodayContent.Day) -> some View {
        let hasToday = days.contains { $0.isToday }
        let w = hasToday ? narrow : 40 * k
        ZStack(alignment: .topLeading) {
            RoundedRectangle(cornerRadius: 14 * k, style: .continuous).fill(RM.Palette.fundoElevado)
                .frame(width: w, height: panelH)
            if day.isRest {
                ZStack {
                    RoundedRectangle(cornerRadius: 14 * k, style: .continuous).fill(RM.Palette.fundoElevado).frame(width: 28 * k, height: 28 * k)
                    RMIconView(.descanso, size: 16 * k).foregroundStyle(RM.Palette.textoTerciario)
                }
                .offset(x: (w - 28 * k) / 2, y: baseline - 14 * k)
            }
            ForEach(day.marks) { m in
                bar(m).offset(x: (w - 32 * k) / 2, y: m.sport == .run ? baseline - 4 * k - barHeight(m.minutes) : baseline + 5 * k)
            }
            Text(Fmt.weekdayShort(day.date)).rmText(.rotulo, RM.Palette.textoTerciario)
                .fixedSize()
                .frame(width: w)
                .offset(y: 318 * k)
        }
        .frame(width: w, height: height, alignment: .topLeading)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(dayLabel(day))
    }

    private func bar(_ m: TodayContent.Mark) -> some View {
        let done = m.status == .done
        return VStack(spacing: 1) {
            if done { RMIconView(.check, size: 12 * k).foregroundStyle(m.sport.onFilled) }
            if m.status == .held { RMIconView(.pausa, size: 12 * k).foregroundStyle(RM.Palette.textoTerciario) }
            else if m.status == .missed { RMIconView(.fechar, size: 12 * k).foregroundStyle(RM.Palette.negativo) }
            else if let minutes = m.minutes {
                Text(Fmt.minutes(minutes)).rmText(.numeroXS, done ? m.sport.onFilled : m.sport.color)
                Text(L.t("common.min")).rmText(.tab, done ? m.sport.onFilled : m.sport.color)
            }
        }
        .padding(.top, 8 * k)
        .frame(width: 32 * k, height: barHeight(m.minutes), alignment: .top)
        .background {
            let shape = RoundedRectangle(cornerRadius: 10 * k, style: .continuous)
            if done { shape.fill(m.sport.filled) }
            else if m.status == .held { HeldPill.fill(shape) }
            else if m.status == .missed { shape.fill(RM.Palette.negativoSuave).overlay(shape.strokeBorder(RM.Palette.negativo, lineWidth: 1.5)) }
            else { shape.fill(m.sport.soft).overlay(shape.strokeBorder(m.sport.color, style: StrokeStyle(lineWidth: 1.5, dash: [4, 3]))) }
        }
    }

    private func todayPanel(_ day: TodayContent.Day) -> some View {
        ZStack(alignment: .topLeading) {
            RoundedRectangle(cornerRadius: 20 * k, style: .continuous).fill(RM.Palette.fundoElevado2).frame(width: wide, height: panelH)
            Text(label).rmText(.micro, RM.Palette.textoSecundario).frame(width: wide).offset(y: 14 * k)
            if day.isRest {
                VStack(spacing: 6) {
                    RMIconView(.descanso, size: 24 * k).foregroundStyle(RM.Palette.textoSecundario)
                }
                .frame(width: wide).offset(y: baseline - 12 * k)
            }
            ForEach(day.marks) { m in
                let top: CGFloat = (m.sport == .run ? 42 : 174) * k
                Button { onSelect(m) } label: { card(m) }
                    .buttonStyle(PressableStyle())
                    .offset(x: 8 * k, y: top)
                    .accessibilityIdentifier("today-card-\(m.session.id)")
                if m.status == .next {
                    RoundedRectangle(cornerRadius: 20 * k, style: .continuous).strokeBorder(RM.Palette.agora, lineWidth: 2)
                        .frame(width: 182 * k, height: 132 * k).offset(x: 4 * k, y: top - 4 * k).allowsHitTesting(false)
                }
            }
            Text(Fmt.weekdayShort(day.date) + " " + Fmt.dayNumber(day.date)).rmText(.rotulo).fixedSize().frame(width: wide).offset(y: 318 * k)
        }
        .frame(width: wide, height: height, alignment: .topLeading)
    }

    private func card(_ m: TodayContent.Mark) -> some View {
        let filled = m.status == .done || m.status == .next
        let held = m.status == .held
        let fg = filled ? m.sport.onFilled : RM.Palette.textoPrimario
        let sub = filled ? m.sport.onFilled.opacity(0.9) : RM.Palette.textoSecundario
        let accent = filled ? m.sport.onFilled : held ? RM.Palette.textoSecundario : m.sport.color
        return VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 6 * k) {
                RMIconView(m.status == .done ? .check : held ? .pausa : m.sport.icon, size: 16 * k)
                if let label = m.ordinalLabel { Text(label).rmText(.micro, accent).lineLimit(1).minimumScaleFactor(0.7) }
                Spacer(minLength: 0)
                if m.status == .next { RMIconView(.play, size: 14 * k) }
            }
            .foregroundStyle(accent)
            Spacer(minLength: 0)
            VStack(alignment: .leading, spacing: 1) {
                Text(m.title).rmText(.titulo, fg).lineLimit(1).minimumScaleFactor(0.7)
                ForEach(m.details, id: \.self) { Text($0).rmText(.detalhe, sub).lineLimit(1).minimumScaleFactor(0.8) }
            }
        }
        .padding(12 * k)
        .frame(width: 174 * k, height: 124 * k, alignment: .topLeading)
        .background {
            let shape = RoundedRectangle(cornerRadius: 16 * k, style: .continuous)
            if filled { shape.fill(m.sport.filled) } else if held { HeldPill.fill(shape) } else {
                shape.fill(m.sport.soft).overlay(shape.strokeBorder(m.sport.color, style: StrokeStyle(lineWidth: 1.5, dash: [4, 3])))
            }
        }
        .accessibilityElement(children: .combine)
    }

    private func dayLabel(_ day: TodayContent.Day) -> String {
        let name = Fmt.weekdayName(day.date)
        guard !day.isRest else { return name + ", " + L.t("today.hero.rest") }
        return name + ", " + day.marks.map { m in
            [m.title, m.minutes.map { L.f("common.minutes", Fmt.minutes($0)) }, Self.statusText(m.status)]
                .compactMap { $0 }.joined(separator: " ")
        }.joined(separator: "; ")
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

/// A session held while nothing may start (#99, Figma 72 `805:437` "Em espera"): no fill, a dashed texto/terciario outline at 24 %, 1.5 pt;
/// never a sport colour. The pause glyph of the card is the art's `805:445`/`805:446` "Pausa".
enum HeldPill {
    static func fill<S: InsettableShape>(_ shape: S) -> some View {
        shape.strokeBorder(RM.Palette.textoTerciario.opacity(0.24), style: StrokeStyle(lineWidth: 1.5, lineCap: .round, dash: [3.6, 5.4]))
    }
}
