import SwiftUI

/// "Semana em painéis" (Figma `880:4283`): one panel per day, today wide in the centre; run marks above the baseline (line), strength below
/// (block). Filled = done, soft dashed = planned, white halo = the next session. Marks scale with prescribed or logged minutes (display only).
struct WeekPanels: View {
    let days: [TodayContent.Day]
    let label: String
    var onSelect: (TodayContent.Mark) -> Void = { _ in }
    @Environment(\.dynamicTypeSize) private var typeSize

    /// Above Large the fixed-geometry graphic would cut its text: the same days, marks and actions in a list that scales (#99 H3).
    var body: some View {
        if typeSize > .large {
            WeekList(days: days, label: label, onSelect: onSelect)
        } else {
            panels
        }
    }

    // Figma geometry (393 pt frame).
    private let height: CGFloat = 340, panelH: CGFloat = 306, baseline: CGFloat = 170
    private let narrow: CGFloat = 40, gap: CGFloat = 4, wide: CGFloat = 190

    private var panels: some View {
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
        // A fixed-geometry graphic, shown up to Large only (above, `WeekList`).
        .dynamicTypeSize(...DynamicTypeSize.large)
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
        guard let m = minutes else { return 90 }
        return min(124, max(90, 90 + CGFloat(m - 40) * 0.85))
    }

    @ViewBuilder private func dayPanel(_ day: TodayContent.Day) -> some View {
        let hasToday = days.contains { $0.isToday }
        let w = hasToday ? narrow : nil
        ZStack(alignment: .topLeading) {
            RoundedRectangle(cornerRadius: 14, style: .continuous).fill(RM.Palette.fundoElevado)
                .frame(width: w ?? 40, height: panelH)
            if day.isRest {
                ZStack {
                    RoundedRectangle(cornerRadius: 14, style: .continuous).fill(RM.Palette.fundoElevado).frame(width: 28, height: 28)
                    RMIconView(.descanso, size: 16).foregroundStyle(RM.Palette.textoTerciario)
                }
                .offset(x: ((w ?? 40) - 28) / 2, y: baseline - 14)
            }
            ForEach(day.marks) { m in
                bar(m).offset(x: ((w ?? 40) - 32) / 2, y: m.sport == .run ? baseline - 4 - barHeight(m.minutes) : baseline + 5)
            }
            Text(Fmt.weekdayShort(day.date)).rmText(.rotulo, RM.Palette.textoTerciario)
                .fixedSize()
                .frame(width: w ?? 40)
                .offset(y: 318)
        }
        .frame(width: w ?? 40, height: height, alignment: .topLeading)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(dayLabel(day))
    }

    private func bar(_ m: TodayContent.Mark) -> some View {
        let done = m.status == .done
        return VStack(spacing: 1) {
            if done { RMIconView(.check, size: 12).foregroundStyle(m.sport.onFilled) }
            if m.status == .held { RMIconView(.pausa, size: 12).foregroundStyle(RM.Palette.textoTerciario) }
            else if m.status == .missed { RMIconView(.fechar, size: 12).foregroundStyle(RM.Palette.negativo) }
            else if let minutes = m.minutes {
                Text(Fmt.minutes(minutes)).rmText(.numeroXS, done ? m.sport.onFilled : m.sport.color)
                Text(L.t("common.min")).rmText(.tab, done ? m.sport.onFilled : m.sport.color)
            }
        }
        .padding(.top, 8)
        .frame(width: 32, height: barHeight(m.minutes), alignment: .top)
        .background {
            let shape = RoundedRectangle(cornerRadius: 10, style: .continuous)
            if done { shape.fill(m.sport.filled) }
            else if m.status == .held { HeldPill.fill(shape) }
            else if m.status == .missed { shape.fill(RM.Palette.negativoSuave).overlay(shape.strokeBorder(RM.Palette.negativo, lineWidth: 1.5)) }
            else { shape.fill(m.sport.soft).overlay(shape.strokeBorder(m.sport.color, style: StrokeStyle(lineWidth: 1.5, dash: [4, 3]))) }
        }
    }

    private func todayPanel(_ day: TodayContent.Day) -> some View {
        ZStack(alignment: .topLeading) {
            RoundedRectangle(cornerRadius: 20, style: .continuous).fill(RM.Palette.fundoElevado2).frame(width: wide, height: panelH)
            Text(label).rmText(.micro, RM.Palette.textoSecundario).frame(width: wide).offset(y: 14)
            if day.isRest {
                VStack(spacing: 6) {
                    RMIconView(.descanso, size: 24).foregroundStyle(RM.Palette.textoSecundario)
                }
                .frame(width: wide).offset(y: baseline - 12)
            }
            ForEach(day.marks) { m in
                let top: CGFloat = m.sport == .run ? 42 : 174
                Button { onSelect(m) } label: { card(m) }
                    .buttonStyle(PressableStyle())
                    .offset(x: 8, y: top)
                    .accessibilityIdentifier("today-card-\(m.session.id)")
                if m.status == .next {
                    RoundedRectangle(cornerRadius: 20, style: .continuous).strokeBorder(RM.Palette.agora, lineWidth: 2)
                        .frame(width: 182, height: 132).offset(x: 4, y: top - 4).allowsHitTesting(false)
                }
            }
            Text(Fmt.weekdayShort(day.date) + " " + Fmt.dayNumber(day.date)).rmText(.rotulo).fixedSize().frame(width: wide).offset(y: 318)
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
            HStack(spacing: 6) {
                RMIconView(m.status == .done ? .check : held ? .pausa : m.sport.icon, size: 16)
                if let label = m.ordinalLabel { Text(label).rmText(.micro, accent).lineLimit(1).minimumScaleFactor(0.7) }
                Spacer(minLength: 0)
                if m.status == .next { RMIconView(.play, size: 14) }
            }
            .foregroundStyle(accent)
            Spacer(minLength: 0)
            VStack(alignment: .leading, spacing: 1) {
                Text(m.title).rmText(.titulo, fg).lineLimit(1).minimumScaleFactor(0.7)
                ForEach(m.details, id: \.self) { Text($0).rmText(.detalhe, sub).lineLimit(1).minimumScaleFactor(0.8) }
            }
        }
        .padding(12)
        .frame(width: 174, height: 124, alignment: .topLeading)
        .background {
            let shape = RoundedRectangle(cornerRadius: 16, style: .continuous)
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
            [m.title, m.minutes.map { L.f("common.minutes", Fmt.minutes($0)) }, WeekList.statusText(m.status)]
                .compactMap { $0 }.joined(separator: " ")
        }.joined(separator: "; ")
    }
}

/// A session held while nothing may start (#99, Figma 72 `805:432` "em espera"): grey, dashed, never a sport colour.
enum HeldPill {
    static func fill<S: InsettableShape>(_ shape: S) -> some View {
        shape.fill(RM.Palette.fundoElevado2).overlay(shape.strokeBorder(RM.Palette.textoTerciario, style: StrokeStyle(lineWidth: 1.5, dash: [4, 3])))
    }
}
