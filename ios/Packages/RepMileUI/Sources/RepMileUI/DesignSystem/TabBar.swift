import SwiftUI

public enum AppTab: String, CaseIterable, Identifiable, Sendable {
    case today, plan, history, progress
    public var id: String { rawValue }
    var icon: RMIcon { switch self { case .today: .hoje; case .plan: .plano; case .history: .historico; case .progress: .progresso } }
    var title: String { L.t("tab." + rawValue) }
}

/// Figma "Tab bar" (`507:313`): four tabs and, in the centre, the + that opens the unplanned-workout actions. The + is an action, not a tab.
/// The active tab is "the light of now" (agora/suave). Floats over content, 68 pt, radius 34.
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
        .frame(height: 68)
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
        .accessibilityLabel(tab.title)
        .accessibilityAddTraits(active ? [.isSelected, .isButton] : .isButton)
        .accessibilityIdentifier("tab-" + tab.rawValue)
    }
}
