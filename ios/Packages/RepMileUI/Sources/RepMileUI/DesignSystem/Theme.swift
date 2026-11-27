import CoreText
import SwiftUI

/// Repmile design tokens, read from the Figma collection "Repmile · Cor" (`901:109`, both modes: "A · Sem acento" dark and "A · Claro" light;
/// `RMColorToken`) and the 15 "Repmile/*" text styles (Figma `90oyvXHxxBQAvr1netov7S`). Every colour resolves by the system appearance.
/// Role colours carry meaning and are never used outside their role: blue = run, orange = strength, agora (white in dark, ink in light) =
/// now, champagne = milestone, lime = done/improved, red = missed/declined.
public enum RM {
    public enum Palette {
        public static let fundoApp = RMColorToken.fundoApp.color
        public static let fundoElevado = RMColorToken.fundoElevado.color
        public static let fundoElevado2 = RMColorToken.fundoElevado2.color
        public static let fundoTrilho = RMColorToken.fundoTrilho.color
        public static let textoPrimario = RMColorToken.textoPrimario.color
        public static let textoSecundario = RMColorToken.textoSecundario.color
        public static let textoTerciario = RMColorToken.textoTerciario.color
        public static let linhaBase = RMColorToken.linhaBase.color
        public static let linhaDivisor = RMColorToken.linhaDivisor.color
        public static let agora = RMColorToken.agora.color
        public static let agoraSuave = RMColorToken.agoraSuave.color
        public static let agoraSobre = RMColorToken.agoraSobre.color
        public static let corrida = RMColorToken.corrida.color
        public static let corridaCheio = RMColorToken.corridaCheio.color
        public static let corridaSuave = RMColorToken.corridaSuave.color
        public static let corridaPrevisto = RMColorToken.corridaPrevisto.color
        public static let corridaSobre = RMColorToken.corridaSobre.color
        public static let forca = RMColorToken.forca.color
        public static let forcaSuave = RMColorToken.forcaSuave.color
        public static let forcaPrevisto = RMColorToken.forcaPrevisto.color
        public static let forcaSobre = RMColorToken.forcaSobre.color
        public static let acaoCorrida = RMColorToken.acaoCorrida.color
        public static let acaoCorridaTexto = RMColorToken.acaoCorridaTexto.color
        public static let acaoForca = RMColorToken.acaoForca.color
        public static let acaoForcaTexto = RMColorToken.acaoForcaTexto.color
        public static let marco = RMColorToken.marco.color
        public static let marcoSuave = RMColorToken.marcoSuave.color
        /// estado/positivo (lime): done, improved.
        public static let positivo = RMColorToken.positivo.color
        public static let positivoSuave = RMColorToken.positivoSuave.color
        /// estado/negativo (red): missed, declined.
        public static let negativo = RMColorToken.negativo.color
        public static let negativoSuave = RMColorToken.negativoSuave.color
        /// zona/1…5: heart-rate zones only.
        public static let zonas: [Color] = [RMColorToken.zona1, .zona2, .zona3, .zona4, .zona5].map(\.color)
        public static let luzCorrida = RMColorToken.luzCorrida.color
        public static let luzForca = RMColorToken.luzForca.color
        public static let luzNeutra = RMColorToken.luzNeutra.color
        public static let luzMarco = RMColorToken.luzMarco.color
    }

    public enum Space {
        public static let gutter: CGFloat = 20
        public static let card: CGFloat = 20
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
