import SwiftUI

/// Which full-screen state is shown: a root route the host answered, or one only the launch knows (#76: the account identity on the device
/// is damaged, so the composition cannot open; no route of the host stands for it).
enum StateKind: Equatable {
    case route(RootRoute)
    case identityDamaged
}

/// What a full-screen state shows. Pure, so the mapping (copy, and whether "try again" is offered) is unit-tested.
struct StateContent: Equatable {
    let identifier: String
    let icon: RMIcon
    let illustration: RMIllustration?
    let title: String
    let body: String
    let action: String?
    /// Only when trying again can work: an operational error. Never for a damaged identity (re-reading the same file gives the same answer).
    let offersRetry: Bool

    static func of(_ kind: StateKind) -> StateContent {
        switch kind {
        case .identityDamaged:
            return StateContent(identifier: "identity-damaged", icon: .cadeado, illustration: nil, title: L.t("state.identityDamaged.title"),
                                body: L.t("state.identityDamaged.body"), action: nil, offersRetry: false)
        case .route(let route):
            return of(route)
        }
    }

    private static func of(_ route: RootRoute) -> StateContent {
        func c(_ id: String, _ icon: RMIcon, ill: RMIllustration? = nil, _ title: String, _ body: String, action: String? = nil,
               retry: Bool = false) -> StateContent {
            StateContent(identifier: id, icon: icon, illustration: ill, title: title, body: body, action: action, offersRetry: retry)
        }
        switch route {
        case .onboarding:
            return c("onboarding", .plano, ill: .caderno, L.t("state.noData.title"), L.t("state.noData.body"), action: L.t("state.noData.action"))
        case .accountErased: return c("gone", .fechar, L.t("state.gone.title"), L.t("state.gone.body"))
        case .integrityFailure: return c("integrity", .cadeado, L.t("state.integrity.title"), L.t("state.integrity.body"))
        case .recordLost:
            return c("record-lost", .cadeado, L.t("state.recordLost.title"), L.t("state.recordLost.body"), action: L.t("state.recordLost.action"))
        case .operationalError(let code):
            return c("operational-error", .repetir, L.t("state.opError.title"),
                     code == "CONFLICT_STALE_VERSION" ? L.t("state.stale.body") : L.t("state.opError.body"), retry: true)
        case .unrecognized: return c("unrecognized", .cadeado, L.t("state.unrecognized.title"), L.t("state.unrecognized.body"))
        case .loading: return c("loading", .relogio, L.t("common.loading"), "")
        case .app: return c("app", .relogio, L.t("common.loading"), "")
        }
    }
}

/// A full-screen state (handoff HO §7): no tabs, no plan, no "rest day", no start. Each state has its own copy and only the actions the
/// athlete can take.
struct StateScreen: View {
    let kind: StateKind
    var primary: (() -> Void)?
    var retry: (() -> Void)?

    init(route: RootRoute, primary: (() -> Void)? = nil, retry: (() -> Void)? = nil) { self.init(kind: .route(route), primary: primary, retry: retry) }
    init(kind: StateKind, primary: (() -> Void)? = nil, retry: (() -> Void)? = nil) { self.kind = kind; self.primary = primary; self.retry = retry }

    var body: some View {
        let c = StateContent.of(kind)
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
            if c.offersRetry, let retry {
                SecondaryPillButton(L.t("common.tryAgain"), icon: .repetir, action: retry).accessibilityIdentifier("state-retry")
            }
        }
        .padding(.horizontal, RM.Space.gutter)
        .padding(.bottom, 24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(RM.Palette.fundoApp)
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("state-\(c.identifier)")
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
