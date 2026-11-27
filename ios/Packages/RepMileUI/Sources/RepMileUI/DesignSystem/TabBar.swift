import SwiftUI

public enum AppTab: String, CaseIterable, Identifiable, Sendable {
    case today, plan, history, progress
    public var id: String { rawValue }
    var icon: RMIcon { switch self { case .today: .hoje; case .plan: .plano; case .history: .historico; case .progress: .progresso } }
    var title: String { L.t("tab." + rawValue) }
}

/// Figma "Tab bar" (`507:313`): four tabs and, in the centre, the + that opens the unplanned-workout actions. The + is an action, not a tab.
/// The active tab is "the light of now" (agora/suave). 68 pt, radius 34; placed by `TabBarArea`.
struct RMTabBar: View {
    @Binding var selection: AppTab
    var onAdd: () -> Void

    var body: some View {
        HStack(spacing: 6) {
            item(.today); item(.plan)
            Button(action: onAdd) {
                RMIconView(.adicionar, size: 22).foregroundStyle(RM.Palette.agoraSobre)
                    .frame(width: 48, height: 48)
                    .background(RM.Palette.agora, in: Circle())
            }
            .buttonStyle(PressableStyle())
            .accessibilityLabel(L.t("tab.add"))
            .accessibilityHint(L.t("tab.add.hint"))
            .accessibilityIdentifier("tab-add")
            item(.history); item(.progress)
        }
        .padding(10)
        .frame(height: TabBarArea.barHeight)
        .dynamicTypeSize(...DynamicTypeSize.xLarge)
        .background(RM.Palette.fundoElevado, in: Capsule())
        .padding(.horizontal, RM.Space.gutter)
    }

    private func item(_ tab: AppTab) -> some View {
        let active = selection == tab
        return Button { selection = tab } label: {
            VStack(spacing: 5) {
                RMIconView(tab.icon, size: 22)
                Text(tab.title).rmText(.tab, active ? RM.Palette.agora : RM.Palette.textoTerciario).lineLimit(1).minimumScaleFactor(0.8)
            }
            .foregroundStyle(active ? RM.Palette.agora : RM.Palette.textoTerciario)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(active ? RM.Palette.agoraSuave : .clear, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityShowsLargeContentViewer { Label { Text(tab.title) } icon: { tab.icon.image } }
        .accessibilityLabel(tab.title)
        .accessibilityAddTraits(active ? [.isSelected, .isButton] : .isButton)
        .accessibilityIdentifier("tab-" + tab.rawValue)
    }
}

/// Where the tab bar sits (#99 H2, Figma `880:4403` "Tab bar" area, 393 × 118: the bar 353 × 68 with 20 pt above it and 30 pt below it to
/// the bottom edge). The area is the screen's own fundo/app, as in the frame: content scrolling under it is covered by the area, not cut
/// by the bar's edge, and the content gets a bottom inset that ends it at the area's top, so nothing ends hidden under the bar. No other
/// scrim, gradient or elevation: the Figma area has none.
struct TabBarArea: View {
    @Binding var selection: AppTab
    var onAdd: () -> Void

    static let barHeight: CGFloat = 68
    static let bottomGap: CGFloat = 30
    /// Space between the end of the content and the top of the bar (`880:4403` top padding).
    static let clearance: CGFloat = 20

    /// The bottom inset the content needs beyond the safe area's own (`safeBottom`), so its end clears the bar.
    static func contentInset(safeBottom: CGFloat) -> CGFloat { max(0, barHeight + bottomGap + clearance - safeBottom) }

    var body: some View {
        RMTabBar(selection: $selection, onAdd: onAdd)
            .padding(.top, Self.clearance)
            .padding(.bottom, Self.bottomGap)
            .background(RM.Palette.fundoApp)
    }
}

extension View {
    /// The bottom inset of a tab's root screen (#99 H2): its scroll content ends at the tab bar area's top (`880:4403`). Applied inside the
    /// tab's NavigationStack (an inset outside it does not reach the scroll view); a pushed screen has no bar and gets none.
    func tabBarInset(_ height: CGFloat) -> some View {
        safeAreaInset(edge: .bottom, spacing: 0) { Color.clear.frame(height: height).allowsHitTesting(false) }
    }
}
