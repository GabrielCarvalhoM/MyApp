import SwiftUI

public struct RepMileShell: View {
    public init() {}

    public var body: some View {
        TabView {
            NavigationStack {
                SectionPlaceholder(title: "Hoje", icon: "calendar")
                    .toolbar {
                        ToolbarItem(placement: .topBarTrailing) {
                            NavigationLink {
                                SectionPlaceholder(title: "Perfil", icon: "person.crop.circle")
                            } label: {
                                Label("Perfil", systemImage: "person.crop.circle")
                            }
                            .accessibilityIdentifier("open-profile")
                        }
                    }
            }
            .tabItem { Label("Hoje", systemImage: "calendar") }

            NavigationStack {
                SectionPlaceholder(title: "Plano", icon: "list.bullet")
            }
            .tabItem { Label("Plano", systemImage: "list.bullet") }

            NavigationStack {
                SectionPlaceholder(title: "Histórico", icon: "clock")
            }
            .tabItem { Label("Histórico", systemImage: "clock") }

            NavigationStack {
                SectionPlaceholder(title: "Progresso", icon: "chart.bar")
            }
            .tabItem { Label("Progresso", systemImage: "chart.bar") }
        }
    }
}

private struct SectionPlaceholder: View {
    let title: LocalizedStringKey
    let icon: String

    var body: some View {
        ContentUnavailableView(
            title,
            systemImage: icon,
            description: Text("Prévia de navegação")
        )
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
    }
}
