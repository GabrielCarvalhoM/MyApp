import SwiftUI

/// Day labels of the week grammar: the first letter of the short weekday (Monday = 0), "S T Q Q S S D".
enum OBDays {
    static func letter(_ d: Int) -> String { String(L.t("weekday.\(d)").prefix(1)) }
    static func short(_ d: Int) -> String { L.t("weekday.\(d)") }
    /// A full weekday name in the app's language, from a fixed Monday (2026-11-16) plus `d` days.
    static func full(_ d: Int) -> String {
        guard let base = Fmt.day("2026-11-16"), let date = Fmt.calendar.date(byAdding: .day, value: d, to: base) else { return "" }
        // "Quinta", "Sábado" (the Figma's names): without the Portuguese "-feira".
        return Fmt.weekdayName(Fmt.dayString(date)).replacingOccurrences(of: "-feira", with: "").capitalizedFirst
    }
}

/// "Arte · a semana com os dois" (01, 16, 28, 30, 31, 34 and the outcome screens): runs above the line, strength below, the long run taller.
/// `ghost` is the outlined week of the screens without a plan (`838:4053`, `838:3689`).
struct OBWeekArt: View {
    enum Style { case dashed, ghost }
    let run: Set<Int>
    let strength: Set<Int>
    var longRun: Int?
    var style: Style = .dashed
    var showsLetters = true

    var body: some View {
        VStack(spacing: 10) {
            ZStack {
                Rectangle().fill(RM.Palette.linhaBase.opacity(0.5)).frame(height: 1)
                HStack(spacing: 0) {
                    ForEach(0..<7, id: \.self) { d in
                        VStack(spacing: 8) {
                            shape(run: true, on: run.contains(d), tall: d == longRun).frame(height: 74, alignment: .bottom)
                            shape(run: false, on: strength.contains(d), tall: false).frame(height: 70, alignment: .top)
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
            }
            if showsLetters {
                HStack(spacing: 0) {
                    ForEach(0..<7, id: \.self) { d in
                        Text(OBDays.letter(d)).rmText(.micro, run.contains(d) || strength.contains(d) ? RM.Palette.textoSecundario : RM.Palette.textoTerciario)
                            .frame(maxWidth: .infinity)
                    }
                }
            }
        }
        .padding(.horizontal, 16)
        .accessibilityHidden(true)
    }

    @ViewBuilder private func shape(run isRun: Bool, on: Bool, tall: Bool) -> some View {
        let color = isRun ? RM.Palette.corrida : RM.Palette.forca
        let height: CGFloat = isRun ? (tall ? 70 : 48) : 66
        let radius: CGFloat = isRun ? 15 : 6
        if on {
            RoundedRectangle(cornerRadius: radius, style: .continuous)
                .fill(LinearGradient(colors: [color.opacity(style == .ghost ? 0 : 0.35), color.opacity(0.05)], startPoint: isRun ? .bottom : .top, endPoint: isRun ? .top : .bottom))
                .overlay(RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .strokeBorder(style == .ghost ? RM.Palette.textoTerciario : color, style: StrokeStyle(lineWidth: 1.5, dash: [4, 3])))
                .frame(width: 30, height: height)
        } else {
            Color.clear.frame(width: 30, height: height)
        }
    }
}

/// 09 "Em quais dias você treina?" grid: tap above the line for a run, below for strength (`862:2271`). A chosen run is a filled blue
/// capsule, a chosen strength day a filled orange block; an empty slot is the dotted outline.
struct OBWeekGrid: View {
    let runs: Bool
    let lifts: Bool
    let runDays: Set<Int>
    let strengthDays: Set<Int>
    let toggle: (_ day: Int, _ run: Bool) -> Void

    var body: some View {
        VStack(spacing: 10) {
            if runs { row(run: true) }
            Rectangle().fill(RM.Palette.linhaBase.opacity(0.6)).frame(height: 1)
            if lifts { row(run: false) }
            HStack(spacing: 0) {
                ForEach(0..<7, id: \.self) { d in Text(OBDays.letter(d)).rmText(.micro, RM.Palette.textoTerciario).frame(maxWidth: .infinity) }
            }
        }
        .padding(.horizontal, RM.Space.gutter)
    }

    private func row(run: Bool) -> some View {
        HStack(spacing: 0) {
            ForEach(0..<7, id: \.self) { d in
                let on = run ? runDays.contains(d) : strengthDays.contains(d)
                let color = run ? RM.Palette.corrida : RM.Palette.forca
                let r: CGFloat = run ? 17 : 8
                Button { toggle(d, run) } label: {
                    RoundedRectangle(cornerRadius: r, style: .continuous)
                        .fill(on ? color : .clear)
                        .overlay(RoundedRectangle(cornerRadius: r, style: .continuous)
                            .strokeBorder(on ? .clear : RM.Palette.textoTerciario.opacity(0.6), style: StrokeStyle(lineWidth: 1, dash: [3, 3])))
                        .frame(width: 34, height: run ? 50 : 44)
                        .frame(maxWidth: .infinity, minHeight: 50)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel(L.t(run ? "ob.sport.run" : "ob.sport.strength") + ", " + OBDays.full(d))
                .accessibilityAddTraits(on ? .isSelected : [])
                .accessibilityIdentifier("ob-day-\(run ? "run" : "strength")-\(d)")
            }
        }
    }
}
