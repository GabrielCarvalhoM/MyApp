import SwiftUI

/// "Arte · a semana com os dois" (Figma `835:2085`, onboarding opening, #99): a week strip of planned (dashed) pills, run above the baseline,
/// strength below, a rest dot on Friday, the day initials under it. Decorative (hidden from VoiceOver): it shows the product's grammar, not
/// the athlete's plan. Drawn with the colour tokens (not the exported SVG) so it follows the appearance (#94); geometry from the frame.
struct WeekStripArt: View {
    struct Pill: Equatable { let day: Int; let sport: Sport; let height: CGFloat }
    /// Monday first, as the Figma strip: S(trength) · T(run) · Q(strength) · Q(run + strength) · S(rest) · S(long run) · D(run).
    static let pills: [Pill] = [Pill(day: 0, sport: .strength, height: 64), Pill(day: 1, sport: .run, height: 64), Pill(day: 2, sport: .strength, height: 64),
                                Pill(day: 3, sport: .run, height: 64), Pill(day: 3, sport: .strength, height: 64), Pill(day: 5, sport: .run, height: 90),
                                Pill(day: 6, sport: .run, height: 64)]
    static let restDay = 4

    // Figma geometry (393 × 206 strip): pills 28 wide every 50 pt, the run ones end at y 103, the strength ones start at y 117, baseline 110.
    private let width: CGFloat = 28, step: CGFloat = 50, baseline: CGFloat = 110, height: CGFloat = 206

    /// The day initials of the device language, Monday first ("S T Q Q S S D" in pt-BR).
    static func initials(locale: Locale) -> [String] {
        var cal = Calendar(identifier: .gregorian); cal.locale = locale
        let sundayFirst = cal.veryShortStandaloneWeekdaySymbols
        return Array(sundayFirst[1...]) + [sundayFirst[0]]
    }

    var body: some View {
        let letters = Self.initials(locale: Fmt.locale)
        ZStack(alignment: .topLeading) {
            LinearGradient(stops: [.init(color: RM.Palette.linhaBase.opacity(0), location: 0), .init(color: RM.Palette.linhaBase, location: 0.18),
                                   .init(color: RM.Palette.linhaBase, location: 0.82), .init(color: RM.Palette.linhaBase.opacity(0), location: 1)],
                           startPoint: .leading, endPoint: .trailing)
                .frame(height: 1.5).offset(y: baseline - 0.75)
            HStack(alignment: .top, spacing: step - width) {
                ForEach(0..<7, id: \.self) { day in
                    ZStack(alignment: .top) {
                        ForEach(Array(Self.pills.filter { $0.day == day }.enumerated()), id: \.offset) { _, p in
                            pill(p).offset(y: p.sport == .run ? baseline - 7 - p.height : baseline + 7)
                        }
                        if day == Self.restDay {
                            Circle().fill(RM.Palette.textoTerciario).frame(width: 6, height: 6).offset(y: baseline - 3)
                        }
                        Text(letters.indices.contains(day) ? letters[day] : "")
                            .rmText(.tab, day == Self.restDay ? RM.Palette.textoTerciario : RM.Palette.textoSecundario)
                            .fixedSize().offset(y: 190)
                    }
                    .frame(width: width, height: height, alignment: .top)
                }
            }
            .frame(maxWidth: .infinity)
        }
        .frame(height: height)
        .dynamicTypeSize(...DynamicTypeSize.large)   // a fixed-geometry drawing; its letters are decoration
        .accessibilityHidden(true)
    }

    @ViewBuilder private func pill(_ p: Pill) -> some View {
        let fill = LinearGradient(colors: [p.sport.color.opacity(0.42), p.sport.color.opacity(0)],
                                  startPoint: p.sport == .run ? .bottom : .top, endPoint: p.sport == .run ? .top : .bottom)
        let dash = StrokeStyle(lineWidth: 2, lineCap: .round, dash: [4.5, 5.5])
        Group {
            if p.sport == .run {
                Capsule().fill(fill).overlay(Capsule().strokeBorder(p.sport.color, style: dash))
            } else {
                RoundedRectangle(cornerRadius: 7, style: .continuous).fill(fill)
                    .overlay(RoundedRectangle(cornerRadius: 7, style: .continuous).strokeBorder(p.sport.color, style: dash))
            }
        }
        .frame(width: width, height: p.height)
        .opacity(0.85)
    }
}
