import SwiftUI

/// The frame every onboarding question shares (Figma 10): navigation (back + "Progresso em quatro etapas"), the question block, the content,
/// the footnote and the actions pinned to the bottom ("Ações": a 52 pt pill and an optional link).
struct OBScaffold<Content: View, Actions: View>: View {
    let stage: Int
    let progress: Double
    var showsBack = true
    let back: () -> Void
    /// D21 A (#113): the × of every frame 02–29 goes straight to "Retomar o cadastro", the answers kept.
    var close: (() -> Void)?
    @ViewBuilder let content: Content
    @ViewBuilder let actions: Actions

    var body: some View {
        VStack(spacing: 0) {
            if stage > 0 { OBNavigation(stage: stage, progress: progress, showsBack: showsBack, back: back, close: close) }
            ScrollView {
                VStack(alignment: .leading, spacing: 0) { content }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.bottom, 24)
            }
            .scrollIndicators(.hidden).obScrollAnchor()
            .scrollDismissesKeyboard(.interactively)
            VStack(spacing: 6) { actions }
                .padding(.horizontal, RM.Space.gutter).padding(.top, 16).padding(.bottom, 8)
        }
    }
}

/// "Navegação": the 36 pt back button and the four segments (the current stage fills with `progress`).
struct OBNavigation: View {
    let stage: Int
    let progress: Double
    var showsBack = true
    let back: () -> Void
    var close: (() -> Void)?
    var body: some View {
        HStack(spacing: 14) {
            Button(action: back) {
                RMIconView(.chevronEsquerda, size: 16).foregroundStyle(RM.Palette.textoPrimario)
                    .frame(width: 36, height: 36).background(RM.Palette.fundoElevado, in: Circle())
                    .frame(width: 44, height: 44).contentShape(Rectangle())   // 44 pt hit area around the 36 pt circle
            }
            .buttonStyle(.plain).opacity(showsBack ? 1 : 0).disabled(!showsBack)
            .accessibilityLabel(L.t("ob.back")).accessibilityIdentifier("ob-back")
            OBProgress(stage: stage, progress: progress).frame(height: 5)
            if let close {
                Button(action: close) {
                    RMIconView(.fechar, size: 16).foregroundStyle(RM.Palette.textoPrimario)
                        .frame(width: 36, height: 36).background(RM.Palette.fundoElevado, in: Circle())
                        .frame(width: 44, height: 44).contentShape(Rectangle())
                }
                .buttonStyle(.plain).accessibilityLabel(L.t("ob.close")).accessibilityIdentifier("ob-close")
            } else {
                Color.clear.frame(width: 44, height: 44)
            }
        }
        .padding(.horizontal, 12).padding(.top, 0)
    }
}

struct OBProgress: View {
    let stage: Int
    let progress: Double
    var body: some View {
        HStack(spacing: 6) {
            ForEach(1...4, id: \.self) { s in
                GeometryReader { g in
                    ZStack(alignment: .leading) {
                        Capsule().fill(RM.Palette.fundoTrilho)
                        Capsule().fill(RM.Palette.agora).frame(width: g.size.width * (s < stage ? 1 : s == stage ? max(0.08, progress) : 0))
                    }
                }
            }
        }
        .accessibilityElement().accessibilityLabel(L.t("ob.stage.\(max(1, min(4, stage)))"))
    }
}

/// "Pergunta": the stage eyebrow, the question (Manchete) and its optional line.
struct OBQuestion: View {
    let stage: Int
    let title: String
    var subtitle: String?
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(L.t("ob.stage.\(stage)")).rmText(.micro, RM.Palette.textoTerciario)
            Text(title).rmText(.manchete).fixedSize(horizontal: false, vertical: true).accessibilityAddTraits(.isHeader)
            if let subtitle { Text(subtitle).rmText(.corpo, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true) }
        }
        .padding(.horizontal, RM.Space.gutter).padding(.top, 18)
    }
}

/// "Para que serve": the footnote under the answers (Detalhe, texto/terciário), with the lock or the error mark when the Figma draws one.
struct OBFootnote: View {
    let text: String
    var icon: RMIcon?
    var iconColor = RM.Palette.textoTerciario
    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            if let icon { RMIconView(icon, size: 14).foregroundStyle(iconColor).padding(.top, 2) }
            Text(text).rmText(.detalhe, RM.Palette.textoTerciario).fixedSize(horizontal: false, vertical: true)
        }
        .padding(.horizontal, RM.Space.gutter).padding(.top, 14)
    }
}

/// "Botão · Continuar": 52 pt white pill; disabled is the neutral pill the Figma draws (`838:3819`, `838:4011`).
struct OBPrimaryButton: View {
    let title: String
    var enabled = true
    /// A held action that the Figma draws as the white pill (32 "Continuar com a Apple"): disabled, its outline kept.
    var outlinedWhenDisabled = false
    /// 52 pt (Figma "Botão · Continuar"); 56 pt in the sheets (`1491:8743`).
    var height: CGFloat = 52
    let id: String
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            Text(title).rmText(.botao, enabled ? RM.Palette.agoraSobre : RM.Palette.textoTerciario)
                .frame(maxWidth: .infinity, minHeight: height)
                .background(enabled ? RM.Palette.agora : RM.Palette.fundoElevado, in: Capsule())
                .overlay(Capsule().strokeBorder(!enabled && outlinedWhenDisabled ? RM.Palette.textoTerciario : .clear, lineWidth: 1))
                .contentShape(Capsule())
        }
        .buttonStyle(PressableStyle()).disabled(!enabled).accessibilityIdentifier(id)
    }
}

/// The secondary pill of the sheets and outcome screens (fundo/elevado-2, 52 pt).
struct OBSecondaryButton: View {
    let title: String
    var enabled = true
    let id: String
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            Text(title).rmText(.botao, enabled ? RM.Palette.textoPrimario : RM.Palette.textoTerciario)
                .frame(maxWidth: .infinity, minHeight: 52)
                .background(RM.Palette.fundoElevado2, in: Capsule())
                .contentShape(Capsule())
        }
        .buttonStyle(PressableStyle()).disabled(!enabled).accessibilityIdentifier(id)
    }
}

/// "Links": the text action under the main button ("Seguir sem meta", "Pular", "Agora não"…). A held action renders disabled.
struct OBLink: View {
    let title: String
    var enabled = true
    let id: String
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            Text(title).rmText(.rotulo, enabled ? RM.Palette.textoSecundario : RM.Palette.textoTerciario.opacity(0.6))
                .frame(maxWidth: .infinity, minHeight: 32)
        }
        .buttonStyle(.plain).disabled(!enabled).accessibilityIdentifier(id)
    }
}
