import SwiftUI

/// Sport roles of the mirrored grammar: run above the baseline (line), strength below (block).
public enum Sport: String, Sendable {
    case run = "RUN", strength = "STRENGTH"
    init?(code: String) { self.init(rawValue: code) }
    var icon: RMIcon { self == .run ? .corrida : .forca }
    var color: Color { self == .run ? RM.Palette.corrida : RM.Palette.forca }
    var filled: Color { self == .run ? RM.Palette.corridaCheio : RM.Palette.forca }
    var soft: Color { self == .run ? RM.Palette.corridaSuave : RM.Palette.forcaSuave }
    var onFilled: Color { self == .run ? RM.Palette.corridaSobre : RM.Palette.forcaSobre }
    var action: Color { self == .run ? RM.Palette.acaoCorrida : RM.Palette.acaoForca }
    var actionText: Color { self == .run ? RM.Palette.acaoCorridaTexto : RM.Palette.acaoForcaTexto }
    var glow: Color { self == .run ? RM.Palette.luzCorrida : RM.Palette.luzForca }
}

/// Figma "Botão · Começar …": 56 pt, full width, pill, sport action colour. Disabled renders the locked neutral variant.
public struct PrimaryActionButton: View {
    let title: String
    let icon: RMIcon
    let fill: Color
    let textColor: Color
    let enabled: Bool
    let action: () -> Void
    public init(_ title: String, icon: RMIcon = .play, fill: Color = RM.Palette.agora, textColor: Color = RM.Palette.agoraSobre, enabled: Bool = true, action: @escaping () -> Void) {
        self.title = title; self.icon = icon; self.fill = fill; self.textColor = textColor; self.enabled = enabled; self.action = action
    }
    public var body: some View {
        Button(action: action) {
            HStack(spacing: 10) {
                RMIconView(enabled ? icon : .cadeado, size: 18)
                Text(title).rmText(.botao, enabled ? textColor : RM.Palette.textoTerciario)
            }
            .foregroundStyle(enabled ? textColor : RM.Palette.textoTerciario)
            .frame(maxWidth: .infinity, minHeight: 56)
            .background(enabled ? fill : RM.Palette.fundoElevado2, in: Capsule())
            .contentShape(Capsule())
        }
        .buttonStyle(PressableStyle())
        .disabled(!enabled)
    }
}

/// Figma "Botões · principal / neutro" (`901:1367`): 52 pt, full width, pill. `.now` is the white primary ("Entendi", "Começar");
/// `.neutral` the fundo/elevado-2 secondary ("Declarar que estou pronto"). No icon.
public struct RMButton: View {
    public enum Kind: Sendable { case now, neutral }
    let title: String
    let kind: Kind
    let action: () -> Void
    public init(_ title: String, kind: Kind, action: @escaping () -> Void) { self.title = title; self.kind = kind; self.action = action }
    public var body: some View {
        Button(action: action) {
            Text(title).rmText(.botao, kind == .now ? RM.Palette.agoraSobre : RM.Palette.textoPrimario)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 16).padding(.vertical, 8)
                .frame(maxWidth: .infinity, minHeight: 52)
                .background(kind == .now ? RM.Palette.agora : RM.Palette.fundoElevado2, in: Capsule())
                .contentShape(Capsule())
        }
        .buttonStyle(PressableStyle())
    }
}

/// Figma secondary pill (46 pt, fundo/elevado-2).
public struct SecondaryPillButton: View {
    let title: String
    let icon: RMIcon?
    let action: () -> Void
    public init(_ title: String, icon: RMIcon? = nil, action: @escaping () -> Void) { self.title = title; self.icon = icon; self.action = action }
    public var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if let icon { RMIconView(icon, size: 16) }
                Text(title).rmText(.rotulo)
            }
            .foregroundStyle(RM.Palette.textoPrimario)
            .frame(maxWidth: .infinity, minHeight: 46)
            .background(RM.Palette.fundoElevado2, in: Capsule())
            .contentShape(Capsule())
        }
        .buttonStyle(PressableStyle())
    }
}

struct PressableStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .opacity(configuration.isPressed ? 0.85 : 1)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

/// Figma row "Título + detalhe + chevron" (e.g. "Algo mudou na sua semana?").
public struct ChevronRow: View {
    let title: String
    let detail: String?
    public init(title: String, detail: String?) { self.title = title; self.detail = detail }
    public var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                Text(title).rmText(.subtitulo)
                if let detail { Text(detail).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true) }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            RMIconView(.chevronDireita, size: 18).foregroundStyle(RM.Palette.textoTerciario)
        }
        .contentShape(Rectangle())
    }
}

/// The elevated card of the design (radius 28, fundo/elevado, padding 20).
public struct RMCard<Content: View>: View {
    let content: Content
    public init(@ViewBuilder content: () -> Content) { self.content = content() }
    public var body: some View {
        VStack(alignment: .leading, spacing: 12) { content }
            .padding(RM.Space.card)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
    }
}

public struct RMDivider: View {
    public init() {}
    public var body: some View { Rectangle().fill(RM.Palette.linhaDivisor).frame(height: 1) }
}

/// A state banner: the screens of BLOCKED, PENDING, RETURNING, NEEDS_INPUT and the host gates. Never an empty plan or a rest day.
public struct StateBanner: View {
    public enum Tone: Sendable { case safety, neutral, milestone }
    let tone: Tone
    let icon: RMIcon
    let title: String
    let message: String
    let actionTitle: String?
    let action: (() -> Void)?
    public init(tone: Tone, icon: RMIcon, title: String, message: String, actionTitle: String? = nil, action: (() -> Void)? = nil) {
        self.tone = tone; self.icon = icon; self.title = title; self.message = message; self.actionTitle = actionTitle; self.action = action
    }
    /// The #73 styling, kept where no Figma frame covers the context (QRE P2-1, #99): Hoje's hold uses `SafetyCard` (`805:451`) instead.
    var accent: Color { switch tone { case .safety: RM.Palette.negativo; case .neutral: RM.Palette.textoPrimario; case .milestone: RM.Palette.marco } }
    public var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                RMIconView(icon, size: 18).foregroundStyle(accent)
                Text(title).rmText(.subtitulo)
            }
            Text(message).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
            if let actionTitle, let action { RMButton(actionTitle, kind: .now, action: action) }   // 52 pt (#99, `901:1367`)
        }
        .padding(RM.Space.card)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 24, style: .continuous).strokeBorder(tone == .safety ? RM.Palette.negativo.opacity(0.4) : .clear, lineWidth: 1))
        .accessibilityElement(children: .contain)
    }
}

/// "Luz" (Figma `880:4258` / `805:411`, ellipse 620 × 460 at (-113, -270), a radial fill to 0 at its edge): an elliptical gradient that reaches zero at the ellipse's edge, so it never ends in a
/// straight cut (#99 H1). Behind the content, decorative.
struct RMGlow: View {
    let color: Color
    var body: some View {
        EllipticalGradient(colors: [color, color.opacity(0)], center: .center, startRadiusFraction: 0, endRadiusFraction: 0.5)
            .frame(width: 620, height: 460)
            .offset(y: -270)
            .allowsHitTesting(false)
            .accessibilityHidden(true)
    }
}

/// "Avatar · anel do foco" (36 pt): a ring split in the two sport colours around the initials.
public struct FocusRingAvatar: View {
    let initials: String
    public init(initials: String) { self.initials = initials }
    public var body: some View {
        ZStack {
            Circle().trim(from: 0, to: 0.5).stroke(RM.Palette.corrida, style: StrokeStyle(lineWidth: 2.5, lineCap: .round)).rotationEffect(.degrees(-90))
            Circle().trim(from: 0.5, to: 1).stroke(RM.Palette.forca, style: StrokeStyle(lineWidth: 2.5, lineCap: .round)).rotationEffect(.degrees(-90))
            Circle().fill(RM.Palette.fundoElevado2).frame(width: 24, height: 24)
            Text(initials).rmText(.micro).minimumScaleFactor(0.6).lineLimit(1).frame(width: 22)
        }
        .frame(width: 36, height: 36)
        .frame(width: 44, height: 44)   // touch area ≥ 44 pt (#99); the ring stays `880:4262`'s 36 pt
        .contentShape(Circle())
    }
}
