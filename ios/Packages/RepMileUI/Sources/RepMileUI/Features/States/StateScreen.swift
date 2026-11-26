import SwiftUI

/// A full-screen state (handoff HO §7): no tabs, no plan, no "rest day", no start. Each root route has its own copy and only the actions the
/// athlete can take.
struct StateScreen: View {
    let route: RootRoute
    var primary: (() -> Void)?
    var retry: (() -> Void)?

    private var content: (icon: RMIcon, illustration: RMIllustration?, title: String, body: String, action: String?) {
        switch route {
        case .onboarding: (.plano, .caderno, L.t("state.noData.title"), L.t("state.noData.body"), L.t("state.noData.action"))
        case .accountErased: (.fechar, nil, L.t("state.gone.title"), L.t("state.gone.body"), nil)
        case .integrityFailure: (.cadeado, nil, L.t("state.integrity.title"), L.t("state.integrity.body"), nil)
        case .recordLost: (.cadeado, nil, L.t("state.recordLost.title"), L.t("state.recordLost.body"), L.t("state.recordLost.action"))
        case .operationalError(let code): (.repetir, nil, L.t("state.opError.title"), code == "CONFLICT_STALE_VERSION" ? L.t("state.stale.body") : L.t("state.opError.body"), nil)
        case .unrecognized: (.cadeado, nil, L.t("state.unrecognized.title"), L.t("state.unrecognized.body"), nil)
        case .loading, .app: (.relogio, nil, L.t("common.loading"), "", nil)
        }
    }

    var body: some View {
        let c = content
        VStack(alignment: .leading, spacing: 16) {
            Spacer()
            if let ill = c.illustration { ill.image.resizable().scaledToFit().frame(maxHeight: 220).frame(maxWidth: .infinity).accessibilityHidden(true) }
            else { RMIconView(c.icon, size: 32).foregroundStyle(RM.Palette.textoSecundario) }
            Text(c.title).rmText(.manchete).fixedSize(horizontal: false, vertical: true).accessibilityAddTraits(.isHeader)
            if !c.body.isEmpty { Text(c.body).rmText(.corpo, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true) }
            Spacer()
            if let action = c.action, let primary {
                PrimaryActionButton(action, icon: .chevronDireita, action: primary).accessibilityIdentifier("state-primary")
            }
            if case .operationalError = route, let retry {
                SecondaryPillButton(L.t("common.tryAgain"), icon: .repetir, action: retry).accessibilityIdentifier("state-retry")
            }
        }
        .padding(.horizontal, RM.Space.gutter)
        .padding(.bottom, 24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(RM.Palette.fundoApp)
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("state-\(identifier)")
    }

    private var identifier: String {
        switch route {
        case .loading: "loading"; case .app: "app"; case .onboarding: "onboarding"; case .accountErased: "gone"; case .integrityFailure: "integrity"
        case .recordLost: "record-lost"; case .operationalError: "operational-error"; case .unrecognized: "unrecognized"
        }
    }
}

/// Skeleton while the first read runs (motion priority 3): soft pulsing blocks, no numbers.
struct LoadingSkeleton: View {
    @State private var on = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            RoundedRectangle(cornerRadius: 6).frame(width: 180, height: 12)
            RoundedRectangle(cornerRadius: 8).frame(height: 30)
            RoundedRectangle(cornerRadius: 8).frame(width: 240, height: 30)
            RoundedRectangle(cornerRadius: 20).frame(height: 300).padding(.top, 20)
            RoundedRectangle(cornerRadius: 28).frame(height: 56)
        }
        .foregroundStyle(RM.Palette.fundoElevado)
        .opacity(on ? 0.55 : 1)
        .padding(RM.Space.gutter)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        .background(RM.Palette.fundoApp)
        .onAppear { if !reduceMotion { withAnimation(.easeInOut(duration: 0.9).repeatForever()) { on = true } } }
        .accessibilityLabel(L.t("common.loading"))
        .accessibilityIdentifier("state-loading")
    }
}
