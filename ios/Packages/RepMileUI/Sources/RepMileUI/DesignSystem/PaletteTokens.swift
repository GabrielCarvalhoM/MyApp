import SwiftUI
import UIKit

/// One variable of the Figma collection "Repmile · Cor" (`VariableCollectionId:507:2`, shown at `901:109`) in its two modes: "A · Sem acento"
/// (dark, mode 507:0, the default) and "A · Claro" (light, mode 507:3). Values are 0xRRGGBBAA exactly as the variable's `valuesByMode`
/// (read 2026-11-27, approved version "V1 alinhamento funcional · 26 nov"). The colour resolves by the trait collection's appearance.
public struct RMColorToken: Hashable, Sendable, Identifiable {
    public let figmaName: String
    public let dark: UInt32
    public let light: UInt32
    public var id: String { figmaName }

    init(_ figmaName: String, dark: UInt32, light: UInt32) { self.figmaName = figmaName; self.dark = dark; self.light = light }

    /// The 0xRRGGBBAA value for an appearance. Only `.dark` takes the dark mode; light and unspecified take the light one, as UIKit does.
    public func value(for style: UIUserInterfaceStyle) -> UInt32 { style == .dark ? dark : light }

    public var uiColor: UIColor {
        let token = self
        return UIColor { traits in Self.uiColor(token.value(for: traits.userInterfaceStyle)) }
    }

    public var color: Color { Color(uiColor: uiColor) }

    static func uiColor(_ rgba: UInt32) -> UIColor {
        UIColor(red: CGFloat((rgba >> 24) & 0xFF) / 255, green: CGFloat((rgba >> 16) & 0xFF) / 255,
                blue: CGFloat((rgba >> 8) & 0xFF) / 255, alpha: CGFloat(rgba & 0xFF) / 255)
    }
}

public extension RMColorToken {
    // Fundo e linha
    static let fundoApp = RMColorToken("fundo/app", dark: 0x0C0D10FF, light: 0xF3F4F6FF)
    static let fundoElevado = RMColorToken("fundo/elevado", dark: 0x15171BFF, light: 0xFFFFFFFF)
    static let fundoElevado2 = RMColorToken("fundo/elevado-2", dark: 0x1E2126FF, light: 0xE9EBEFFF)
    static let fundoTrilho = RMColorToken("fundo/trilho", dark: 0x2A2E36FF, light: 0xD9DCE2FF)
    static let linhaDivisor = RMColorToken("linha/divisor", dark: 0xFFFFFF1A, light: 0x0C0D101A)
    static let linhaBase = RMColorToken("linha/base", dark: 0xFFFFFF4D, light: 0x0C0D1052)
    // Texto
    static let textoPrimario = RMColorToken("texto/primario", dark: 0xF3F4F6FF, light: 0x0C0D10FF)
    static let textoSecundario = RMColorToken("texto/secundario", dark: 0xA4A8B1FF, light: 0x4A4F58FF)
    static let textoTerciario = RMColorToken("texto/terciario", dark: 0x7C818BFF, light: 0x6B707AFF)
    // Agora e ação
    static let agora = RMColorToken("agora", dark: 0xFFFFFFFF, light: 0x0C0D10FF)
    static let agoraSobre = RMColorToken("agora/sobre", dark: 0x0C0D10FF, light: 0xFFFFFFFF)
    static let agoraSuave = RMColorToken("agora/suave", dark: 0xFFFFFF1F, light: 0x0C0D1014)
    static let acaoCorrida = RMColorToken("acao/corrida", dark: 0x2F6FEDFF, light: 0x1F63E0FF)
    static let acaoCorridaTexto = RMColorToken("acao/corrida-texto", dark: 0xFFFFFFFF, light: 0xFFFFFFFF)
    static let acaoForca = RMColorToken("acao/forca", dark: 0xFF6A2CFF, light: 0xE8551AFF)
    static let acaoForcaTexto = RMColorToken("acao/forca-texto", dark: 0x1A0D05FF, light: 0x1A0D05FF)
    // Corrida
    static let corrida = RMColorToken("corrida", dark: 0x4B8BFFFF, light: 0x1F63E0FF)
    static let corridaCheio = RMColorToken("corrida/cheio", dark: 0x2F6FEDFF, light: 0x1F63E0FF)
    static let corridaSobre = RMColorToken("corrida/sobre", dark: 0xFFFFFFFF, light: 0xFFFFFFFF)
    static let corridaSuave = RMColorToken("corrida/suave", dark: 0x4B8BFF29, light: 0x1F63E01F)
    static let corridaPrevisto = RMColorToken("corrida/previsto", dark: 0x4B8BFF6B, light: 0x1F63E061)
    // Força
    static let forca = RMColorToken("forca", dark: 0xFF6A2CFF, light: 0xE8551AFF)
    static let forcaSobre = RMColorToken("forca/sobre", dark: 0x1A0D05FF, light: 0x1A0D05FF)
    static let forcaSuave = RMColorToken("forca/suave", dark: 0xFF6A2C29, light: 0xE8551A1F)
    static let forcaPrevisto = RMColorToken("forca/previsto", dark: 0xFF6A2C6B, light: 0xE8551A61)
    // Marco e estado
    static let marco = RMColorToken("marco", dark: 0xE6D2A8FF, light: 0x8A6A24FF)
    static let marcoSuave = RMColorToken("marco/suave", dark: 0xE6D2A81F, light: 0x8A6A241F)
    static let positivo = RMColorToken("estado/positivo", dark: 0xCFFF04FF, light: 0x4F7A00FF)
    static let positivoSuave = RMColorToken("estado/positivo-suave", dark: 0xCFFF0424, light: 0x4F7A001F)
    static let negativo = RMColorToken("estado/negativo", dark: 0xFF5A5FFF, light: 0xD12F36FF)
    static let negativoSuave = RMColorToken("estado/negativo-suave", dark: 0xFF5A5F24, light: 0xD12F361F)
    // Zonas (heart-rate zones only)
    static let zona1 = RMColorToken("zona/1", dark: 0x8A8F98FF, light: 0x6B707AFF)
    static let zona2 = RMColorToken("zona/2", dark: 0x2EC4D6FF, light: 0x0E9FB3FF)
    static let zona3 = RMColorToken("zona/3", dark: 0x45C977FF, light: 0x1E9E55FF)
    static let zona4 = RMColorToken("zona/4", dark: 0xF5B83DFF, light: 0xC98A0AFF)
    static let zona5 = RMColorToken("zona/5", dark: 0xF2566EFF, light: 0xD93A55FF)
    // Luz (glows)
    static let luzCorrida = RMColorToken("luz/corrida", dark: 0x4B8BFF42, light: 0x1F63E024)
    static let luzCorridaFim = RMColorToken("luz/corrida-fim", dark: 0x4B8BFF00, light: 0x1F63E000)
    static let luzForca = RMColorToken("luz/forca", dark: 0xFF6A2C3D, light: 0xE8551A1F)
    static let luzForcaFim = RMColorToken("luz/forca-fim", dark: 0xFF6A2C00, light: 0xE8551A00)
    static let luzNeutra = RMColorToken("luz/neutra", dark: 0xFFFFFF17, light: 0x0C0D1000)
    static let luzNeutraFim = RMColorToken("luz/neutra-fim", dark: 0xFFFFFF00, light: 0x0C0D1000)
    static let luzMarco = RMColorToken("luz/marco", dark: 0xE6D2A833, light: 0x8A6A241F)
    static let luzMarcoFim = RMColorToken("luz/marco-fim", dark: 0xE6D2A800, light: 0x8A6A2400)

    /// The 44 variables of "Repmile · Cor", in the Figma's order.
    static let all: [RMColorToken] = [
        fundoApp, fundoElevado, fundoElevado2, fundoTrilho, linhaDivisor, linhaBase,
        textoPrimario, textoSecundario, textoTerciario,
        agora, agoraSobre, agoraSuave, acaoCorrida, acaoCorridaTexto, acaoForca, acaoForcaTexto,
        corrida, corridaCheio, corridaSobre, corridaSuave, corridaPrevisto,
        forca, forcaSobre, forcaSuave, forcaPrevisto,
        marco, marcoSuave, positivo, positivoSuave, negativo, negativoSuave,
        zona1, zona2, zona3, zona4, zona5,
        luzCorrida, luzCorridaFim, luzForca, luzForcaFim, luzNeutra, luzNeutraFim, luzMarco, luzMarcoFim,
    ]

}
