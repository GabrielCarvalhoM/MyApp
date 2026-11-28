import SwiftUI

/// What this build can do (#28): no account service exists yet, so the alpha-local variants of the Figma are shown (D18, #113).
enum OBBuild {
    static let accountAvailable = false
}

/// 32 "Salvar o plano · alpha local" (`1491:8743`): the plan stays on this iPhone; every account way in is shown unavailable; the way on is
/// "Continuar neste iPhone". Nothing simulates a remote account.
struct OnboardingAlphaAccountSheet: View {
    @Environment(\.dynamicTypeSize) private var typeSize
    let continueHere: () -> Void
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                VStack(alignment: .leading, spacing: 6) {
                    Text(L.t("ob.alpha.title")).rmText(.titulo).fixedSize(horizontal: false, vertical: true).accessibilityAddTraits(.isHeader)
                    Text(L.t("ob.alpha.body")).rmText(.corpo, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
                }
                VStack(alignment: .leading, spacing: 10) {
                    Text(L.t("ob.alpha.unavailable")).rmText(.micro, RM.Palette.textoTerciario)
                    OBPrimaryButton(title: L.t("ob.account.apple"), enabled: false, height: 56, id: "ob-account-apple") {}
                    OBSecondaryButton(title: L.t("ob.account.google"), enabled: false, id: "ob-account-google") {}
                    OBSecondaryButton(title: L.t("ob.account.email"), enabled: false, id: "ob-account-email") {}
                }
                OBPrimaryButton(title: L.t("ob.alpha.continue"), height: 56, id: "ob-continue-here", action: continueHere)
                Text(L.t("ob.alpha.haveAccount")).rmText(.rotulo, RM.Palette.textoTerciario).multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true).frame(maxWidth: .infinity)
            }
            .padding(.horizontal, RM.Space.gutter).padding(.top, 24).padding(.bottom, 8)
        }
        .scrollBounceBehavior(.basedOnSize)
        .presentationDetents(typeSize.isAccessibilitySize ? [.large] : [.height(500), .large])
        .presentationDragIndicator(.visible)
        .presentationBackground(RM.Palette.fundoElevado)
        .accessibilityElement(children: .contain).accessibilityIdentifier("ob-account")
    }
}

/// 33 "Assinar · build de teste" (`1491:8865`, D18 assinatura A): the test badge, no price ("a definir"), no offer, no trial, nothing
/// bought. The canonical paywall (`851:9600`) is for the commercial build with a real App Store offer.
struct OnboardingTestSubscriptionView: View {
    let preview: OnboardingPlanPreview
    let race: RaceDistance?
    let raceDay: String?
    let done: () -> Void
    @State private var annual = true

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Button(action: done) {
                    RMIconView(.fechar, size: 16).foregroundStyle(RM.Palette.textoPrimario)
                        .frame(width: 36, height: 36).background(RM.Palette.fundoElevado, in: Circle()).frame(width: 44, height: 44).contentShape(Rectangle())
                }
                .buttonStyle(.plain).accessibilityLabel(L.t("ob.close")).accessibilityIdentifier("ob-test-close")
                Spacer()
                Text(L.t("ob.test.title")).rmText(.subtitulo).accessibilityAddTraits(.isHeader)
                Spacer()
                Color.clear.frame(width: 44, height: 44)
            }
            .padding(.horizontal, 12)
            ScrollView {
                VStack(alignment: .leading, spacing: 8) {
                    Text(L.t("ob.test.badge")).rmText(.micro, RM.Palette.marco)
                        .padding(.horizontal, 10).padding(.vertical, 5).background(RM.Palette.marcoSuave, in: Capsule())
                    Text(L.t("ob.test.ready")).rmText(.micro, RM.Palette.textoTerciario)
                    if let race, [.fiveK, .tenK].contains(race), let weeks = preview.weeks {
                        Text(L.f("ob.goalDone.title", "\(weeks)", OBText.race(race))).rmText(.manchete).fixedSize(horizontal: false, vertical: true)
                    }
                }
                .padding(.horizontal, RM.Space.gutter).padding(.top, 14)
                OBWeekArt(run: preview.runDays, strength: preview.strengthDays, longRun: preview.longRunDay).padding(.top, 12)
                if let raceDay, let counts = preview.weekCounts {
                    Text(L.f("ob.test.week1", counts, OBText.dayMonthLong(raceDay))).rmText(.detalhe, RM.Palette.textoSecundario)
                        .fixedSize(horizontal: false, vertical: true).padding(.horizontal, RM.Space.gutter).padding(.top, 6)
                }
                VStack(spacing: 8) {
                    plan(L.t("ob.test.annual"), on: annual) { annual = true }
                    plan(L.t("ob.test.monthly"), on: !annual) { annual = false }
                }
                .padding(.horizontal, RM.Space.gutter).padding(.top, 12)
            }
            .scrollIndicators(.hidden).obScrollAnchor()
            VStack(alignment: .leading, spacing: 10) {
                OBPrimaryButton(title: L.t("ob.test.continue"), id: "ob-test-continue", action: done)
                Text(L.t("ob.test.note")).rmText(.detalhe, RM.Palette.textoTerciario).fixedSize(horizontal: false, vertical: true)
                // No terms or privacy document exists yet: the two names are shown as the Figma draws them, without a link.
                HStack(spacing: 20) {
                    Text(L.t("ob.test.terms")); Text(L.t("ob.test.privacy"))
                }
                .font(RMTextStyle.rotulo.font).foregroundStyle(RM.Palette.textoSecundario).frame(maxWidth: .infinity)
            }
            .padding(.horizontal, RM.Space.gutter).padding(.vertical, 8)
        }
        .accessibilityElement(children: .contain).accessibilityIdentifier("ob-test-subscription")
    }

    private func plan(_ name: String, on: Bool, pick: @escaping () -> Void) -> some View {
        Button(action: pick) {
            HStack(spacing: 12) {
                OBRadio(selected: on)
                Text(name).rmText(.subtitulo, on ? RM.Palette.textoPrimario : RM.Palette.textoSecundario).frame(maxWidth: .infinity, alignment: .leading)
                Text(L.t("ob.test.price")).rmText(.rotulo, RM.Palette.textoTerciario)
            }
            .padding(.horizontal, 14).padding(.vertical, 12).frame(minHeight: 48)
            .background(on ? RM.Palette.fundoElevado2 : .clear, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 22, style: .continuous).strokeBorder(on ? RM.Palette.agora : RM.Palette.linhaDivisor, lineWidth: on ? 2 : 1.5))
            .contentShape(RoundedRectangle(cornerRadius: 22))
        }
        .buttonStyle(.plain).accessibilityAddTraits(on ? .isSelected : [])
    }
}
