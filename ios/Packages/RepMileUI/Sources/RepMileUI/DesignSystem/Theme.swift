import CoreText
import SwiftUI

/// Repmile design tokens, read from the Figma collection "Repmile · Cor" (mode A · Sem acento) and the 15 "Repmile/*" text styles
/// (Figma `90oyvXHxxBQAvr1netov7S`, page 01 `901:109`). Role colours carry meaning and are never used outside their role:
/// blue = run, orange = strength, white = now, champagne = milestone, lime = done/improved, red = missed/declined.
public enum RM {
    public enum Palette {
        public static let fundoApp = Color(hex: 0x0C0D10)
        public static let fundoElevado = Color(hex: 0x15171B)
        public static let fundoElevado2 = Color(hex: 0x1E2126)
        public static let fundoTrilho = Color(hex: 0x2A2E36)
        public static let textoPrimario = Color(hex: 0xF3F4F6)
        public static let textoSecundario = Color(hex: 0xA4A8B1)
        public static let textoTerciario = Color(hex: 0x7C818B)
        public static let linhaBase = Color.white.opacity(0.30)
        public static let linhaDivisor = Color.white.opacity(0.10)
        public static let agora = Color.white
        public static let agoraSuave = Color.white.opacity(0.12)
        public static let agoraSobre = Color(hex: 0x0C0D10)
        public static let corrida = Color(hex: 0x4B8BFF)
        public static let corridaCheio = Color(hex: 0x2F6FED)
        public static let corridaSuave = Color(hex: 0x4B8BFF, opacity: 0x29 / 255)
        public static let corridaPrevisto = Color(hex: 0x4B8BFF, opacity: 0x6B / 255)
        public static let corridaSobre = Color.white
        public static let forca = Color(hex: 0xFF6A2C)
        public static let forcaSuave = Color(hex: 0xFF6A2C, opacity: 0x29 / 255)
        public static let forcaPrevisto = Color(hex: 0xFF6A2C, opacity: 0x6B / 255)
        public static let forcaSobre = Color(hex: 0x1A0D05)
        public static let acaoCorrida = Color(hex: 0x2F6FED)
        public static let acaoCorridaTexto = Color.white
        public static let acaoForca = Color(hex: 0xFF6A2C)
        public static let acaoForcaTexto = Color(hex: 0x1A0D05)
        public static let marco = Color(hex: 0xE6D2A8)
        public static let marcoSuave = Color(hex: 0xE6D2A8, opacity: 0x1F / 255)
        /// estado/positivo (lime): done, improved.
        public static let positivo = Color(hex: 0xCFFF04)
        public static let positivoSuave = Color(hex: 0xCFFF04, opacity: 0x24 / 255)
        /// estado/negativo (red): missed, declined.
        public static let negativo = Color(hex: 0xFF5A5F)
        public static let negativoSuave = Color(hex: 0xFF5A5F, opacity: 0x24 / 255)
        /// zona/1…5: heart-rate zones only.
        public static let zonas: [Color] = [Color(hex: 0x8A8F98), Color(hex: 0x2EC4D6), Color(hex: 0x45C977), Color(hex: 0xF5B83D), Color(hex: 0xF2566E)]
        public static let luzCorrida = Color(hex: 0x4B8BFF, opacity: 0x42 / 255)
        public static let luzForca = Color(hex: 0xFF6A2C, opacity: 0x3D / 255)
        public static let luzNeutra = Color(hex: 0xFFFFFF, opacity: 0x17 / 255)
        public static let luzMarco = Color(hex: 0xE6D2A8, opacity: 0x33 / 255)
    }

    public enum Space {
        public static let gutter: CGFloat = 20
        public static let card: CGFloat = 20
    }
}

extension Color {
    init(hex: UInt32, opacity: Double = 1) {
        self.init(.sRGB, red: Double((hex >> 16) & 0xFF) / 255, green: Double((hex >> 8) & 0xFF) / 255, blue: Double(hex & 0xFF) / 255, opacity: opacity)
    }
}

/// The two typographic voices: Unbounded for numbers, Geist for everything else. Each style scales with Dynamic Type through `relativeTo`.
public struct RMTextStyle: Sendable {
    public enum Family: String, Sendable { case geist = "Geist", unbounded = "Unbounded" }
    let family: Family
    let size: CGFloat
    let weight: Font.Weight
    let lineHeight: CGFloat
    let tracking: CGFloat
    let relativeTo: Font.TextStyle
    let uppercase: Bool

    public static let numeroXXL = RMTextStyle(family: .unbounded, size: 96, weight: .bold, lineHeight: 96, tracking: -2, relativeTo: .largeTitle, uppercase: false)
    public static let numeroXL = RMTextStyle(family: .unbounded, size: 44, weight: .bold, lineHeight: 48, tracking: -1, relativeTo: .largeTitle, uppercase: false)
    public static let numeroL = RMTextStyle(family: .unbounded, size: 30, weight: .bold, lineHeight: 34, tracking: -0.6, relativeTo: .title, uppercase: false)
    public static let numeroM = RMTextStyle(family: .unbounded, size: 21, weight: .semibold, lineHeight: 26, tracking: -0.3, relativeTo: .title2, uppercase: false)
    public static let numeroS = RMTextStyle(family: .unbounded, size: 15, weight: .semibold, lineHeight: 20, tracking: 0, relativeTo: .subheadline, uppercase: false)
    public static let numeroXS = RMTextStyle(family: .unbounded, size: 11, weight: .semibold, lineHeight: 14, tracking: 0, relativeTo: .caption2, uppercase: false)
    public static let manchete = RMTextStyle(family: .geist, size: 28, weight: .medium, lineHeight: 33, tracking: -0.7, relativeTo: .title, uppercase: false)
    public static let titulo = RMTextStyle(family: .geist, size: 20, weight: .semibold, lineHeight: 25, tracking: -0.3, relativeTo: .title3, uppercase: false)
    public static let subtitulo = RMTextStyle(family: .geist, size: 16, weight: .medium, lineHeight: 21, tracking: -0.16, relativeTo: .callout, uppercase: false)
    public static let corpo = RMTextStyle(family: .geist, size: 15, weight: .regular, lineHeight: 22, tracking: -0.075, relativeTo: .body, uppercase: false)
    public static let detalhe = RMTextStyle(family: .geist, size: 13, weight: .regular, lineHeight: 18, tracking: 0, relativeTo: .footnote, uppercase: false)
    public static let rotulo = RMTextStyle(family: .geist, size: 13, weight: .medium, lineHeight: 17, tracking: 0, relativeTo: .footnote, uppercase: false)
    public static let botao = RMTextStyle(family: .geist, size: 16, weight: .semibold, lineHeight: 20, tracking: -0.16, relativeTo: .callout, uppercase: false)
    public static let micro = RMTextStyle(family: .geist, size: 11, weight: .semibold, lineHeight: 14, tracking: 0.77, relativeTo: .caption2, uppercase: true)
    public static let tab = RMTextStyle(family: .geist, size: 10.5, weight: .medium, lineHeight: 12, tracking: 0, relativeTo: .caption2, uppercase: false)

    var font: Font { .custom(family.rawValue, size: size, relativeTo: relativeTo).weight(weight) }
}

struct RMTextModifier: ViewModifier {
    let style: RMTextStyle
    func body(content: Content) -> some View {
        content
            .font(style.font)
            .tracking(style.tracking)
            .lineSpacing(max(0, style.lineHeight - style.size * 1.2))
            .textCase(style.uppercase ? .uppercase : nil)
    }
}

public extension View {
    func rmText(_ style: RMTextStyle, _ color: Color = RM.Palette.textoPrimario) -> some View {
        modifier(RMTextModifier(style: style)).foregroundStyle(color)
    }
}

/// Registers the bundled OFL fonts (Geist, Unbounded) once per process. Fonts ship with their licences in Resources/Fonts.
public enum RMFonts {
    nonisolated(unsafe) private static var done = false
    public static func register() {
        guard !done else { return }
        done = true
        for name in ["Geist-Variable", "Unbounded-Variable"] {
            guard let url = Bundle.module.url(forResource: name, withExtension: "ttf") else { continue }
            CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
        }
    }
}
