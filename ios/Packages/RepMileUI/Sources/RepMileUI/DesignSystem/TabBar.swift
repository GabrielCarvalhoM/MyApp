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
        // Its own elevation over the content (#99 H2): a hairline, as the cards' dividers.
        .overlay(Capsule().strokeBorder(RM.Palette.linhaDivisor, lineWidth: 1))
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

/// Where the tab bar sits (#99 H2, Figma "Tab bar" area: 353 × 68, 30 pt from the bottom edge). The content gets a bottom inset that ends
/// it above the bar (`contentInset`), so nothing is cut or hidden under it at the end of a scroll; while scrolling, the content fades into a
/// scrim of the app background behind the bar instead of running under it.
struct TabBarArea: View {
    @Binding var selection: AppTab
    var onAdd: () -> Void

    static let barHeight: CGFloat = 68
    static let bottomGap: CGFloat = 30
    /// Space kept between the end of the content and the top of the bar.
    static let clearance: CGFloat = 12

    /// The bottom inset the content needs beyond the safe area's own (`safeBottom`), so its end clears the bar.
    static func contentInset(safeBottom: CGFloat) -> CGFloat { max(0, barHeight + bottomGap + clearance - safeBottom) }

    var body: some View {
        RMTabBar(selection: $selection, onAdd: onAdd)
            .padding(.bottom, Self.bottomGap)
            .background(alignment: .bottom) {
                LinearGradient(stops: [.init(color: RM.Palette.fundoApp.opacity(0), location: 0), .init(color: RM.Palette.fundoApp.opacity(0.9), location: 0.45),
                                       .init(color: RM.Palette.fundoApp, location: 1)], startPoint: .top, endPoint: .bottom)
                    .frame(height: Self.barHeight + Self.bottomGap + 44)
                    .allowsHitTesting(false)
                    .accessibilityHidden(true)
            }
    }
}
