import SwiftUI

/// The Repmile icon set (Figma page 02 `507:51`): run is a line, strength is a block. Vector template assets, tinted by the caller.
public enum RMIcon: String, CaseIterable, Sendable {
    case corrida, forca, descanso, prova, hoje, plano, historico, progresso
    case chevronDireita = "chevron-direita", chevronEsquerda = "chevron-esquerda", chevronBaixo = "chevron-baixo", chevronCima = "chevron-cima"
    case play, pausa, check, cadeado, voz, compartilhar, mais, fechar, repetir, lista, ajustes, relogio, marco, gps, adicionar, coroa

    public var image: Image { Image("icone-" + rawValue, bundle: .module).renderingMode(.template) }
}

public struct RMIconView: View {
    let icon: RMIcon
    let size: CGFloat
    public init(_ icon: RMIcon, size: CGFloat = 24) { self.icon = icon; self.size = size }
    public var body: some View {
        icon.image.resizable().interpolation(.high).frame(width: size, height: size).accessibilityHidden(true)
    }
}

/// Line-art illustrations (Figma `Traço/*`), used in empty states and onboarding. Not tinted: each has a light ("A · Claro") and a dark
/// variant in the asset catalog, its colours mapped variable by variable (`Tools/illustrations-light.mjs`).
public enum RMIllustration: String, CaseIterable, Sendable {
    case bandeira, bolsa, caderno, calendario, mapa, pistaNoite = "pista-noite", pranchetaLapis = "prancheta-lapis", prancheta
    case quadroSemana = "quadro-semana", relogioPulso = "relogio-pulso", relogio

    public var image: Image { Image("traco-" + rawValue, bundle: .module) }
}
