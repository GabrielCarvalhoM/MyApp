import SwiftUI

/// 31 Plano pronto (`837:1144` and its variants), 32 Salvar o plano (`837:1323`) and 34 Primeira semana (`837:1239`), from what the engine
/// answered after the write (`OnboardingPlanPreview`). 33 Assinar is held (D18: no price is approved and no billing exists).
struct OnboardingPlanReadyView: View {
    let preview: OnboardingPlanPreview
    let save: () -> Void
    let seePlan: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            OBNavigation(stage: 4, progress: 1, showsBack: false) {}
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    VStack(alignment: .leading, spacing: 10) {
                        HStack(spacing: 8) {
                            RMIconView(.check, size: 14).foregroundStyle(RM.Palette.positivo)
                            Text(L.t("ob.ready.eyebrow")).rmText(.micro)
                        }
                        if let t = preview.title { Text(t).rmText(.manchete).fixedSize(horizontal: false, vertical: true).accessibilityAddTraits(.isHeader) }
                        if let p = preview.period { Text(p).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true) }
                    }
                    .padding(.horizontal, RM.Space.gutter).padding(.top, 18)
                    OBWeekArt(run: preview.runDays, strength: preview.strengthDays, longRun: preview.longRunDay).padding(.top, 18)
                    if let w = preview.weekLine {
                        Text(w).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
                            .padding(.horizontal, RM.Space.gutter).padding(.top, 12)
                    }
                    if !preview.cards.isEmpty {
                        OBGroup {
                            ForEach(Array(preview.cards.enumerated()), id: \.offset) { i, c in
                                if i > 0 { RMDivider() }
                                HStack(alignment: .center, spacing: 14) {
                                    icon(c.icon)
                                    VStack(alignment: .leading, spacing: 3) {
                                        Text(c.title).rmText(.subtitulo).fixedSize(horizontal: false, vertical: true)
                                        if let d = c.detail { Text(d).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true) }
                                    }
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    if let v = c.value { Text(v).rmText(c.icon == .clock ? .rotulo : .numeroS, c.icon == .clock ? RM.Palette.textoTerciario : RM.Palette.textoPrimario) }
                                }
                                .padding(.vertical, 14).accessibilityElement(children: .combine)
                            }
                        }
                        .padding(.top, 20)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .scrollIndicators(.hidden).obScrollAnchor()
            VStack(spacing: 6) {
                OBPrimaryButton(title: L.t("ob.ready.save"), id: "ob-save", action: save)
                OBLink(title: L.t("ob.ready.seePlan"), id: "ob-see-plan", action: seePlan)
            }
            .padding(.horizontal, RM.Space.gutter).padding(.bottom, 8)
        }
        .accessibilityElement(children: .contain).accessibilityIdentifier("ob-ready")
    }

    private func icon(_ i: OnboardingPlanPreview.Card.Icon) -> some View {
        switch i {
        case .run: RMIconView(.corrida, size: 18).foregroundStyle(RM.Palette.corrida)
        case .race: RMIconView(.prova, size: 18).foregroundStyle(RM.Palette.marco)
        case .clock: RMIconView(.relogio, size: 18).foregroundStyle(RM.Palette.textoPrimario)
        }
    }
}

/// 32 "Salve o seu plano": the account sheet. No account exists in V1 yet (#28): every way in is held and renders disabled (D18). Sized to
/// its content and scrolling at large text, so the legal line is never cut (visual review P2).
struct OnboardingAccountSheet: View {
    @Environment(\.dynamicTypeSize) private var typeSize
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                Text(L.t("ob.account.title")).rmText(.titulo).fixedSize(horizontal: false, vertical: true).accessibilityAddTraits(.isHeader)
                Text(L.t("ob.account.body")).rmText(.corpo, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
                OBPrimaryButton(title: L.t("ob.account.apple"), enabled: false, outlinedWhenDisabled: true, id: "ob-account-apple") {}.padding(.top, 6)
                OBSecondaryButton(title: L.t("ob.account.google"), enabled: false, id: "ob-account-google") {}
                OBSecondaryButton(title: L.t("ob.account.email"), enabled: false, id: "ob-account-email") {}
                Text(L.t("ob.account.terms")).rmText(.detalhe, RM.Palette.textoTerciario).multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true).frame(maxWidth: .infinity)
                OBLink(title: L.t("ob.account.signIn"), enabled: false, id: "ob-account-signin") {}
            }
            .padding(.horizontal, RM.Space.gutter).padding(.top, 24).padding(.bottom, 8)
        }
        .scrollBounceBehavior(.basedOnSize)
        .presentationDetents(typeSize.isAccessibilitySize ? [.large] : [.height(460), .large])
        .presentationDragIndicator(.visible)
        .presentationBackground(RM.Palette.fundoElevado)
        .accessibilityElement(children: .contain).accessibilityIdentifier("ob-account")
    }
}

/// 34 "Sua primeira semana está montada". "Três decisões do treinador" waits for D26; "Mudar dias ou horários" is held.
struct OnboardingFirstWeekView: View {
    let preview: OnboardingPlanPreview
    let goToday: () -> Void
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            OBWeekArt(run: preview.runDays, strength: preview.strengthDays, longRun: preview.longRunDay).padding(.top, 64)
            VStack(alignment: .leading, spacing: 10) {
                if let r = preview.weekRange { Text(r).rmText(.micro, RM.Palette.textoTerciario) }
                Text(L.t("ob.firstWeek.title")).rmText(.manchete).fixedSize(horizontal: false, vertical: true).accessibilityAddTraits(.isHeader)
            }
            .padding(.horizontal, RM.Space.gutter).padding(.top, 20)
            Spacer()
            VStack(spacing: 6) {
                OBPrimaryButton(title: L.t("ob.firstWeek.today"), id: "ob-go-today", action: goToday)
                OBLink(title: L.t("ob.firstWeek.change"), enabled: false, id: "ob-change-days") {}
            }
            .padding(.horizontal, RM.Space.gutter).padding(.bottom, 8)
        }
        .accessibilityElement(children: .contain).accessibilityIdentifier("ob-first-week")
    }
}
