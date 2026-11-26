import CoachingPresentation
import IntegrationContracts
import SwiftUI

/// The app root. In the parallel phase it composes the fixture providers (front C); at integration the composition root passes front A's
/// CoachingHost and front B's adapter instead, and nothing below changes.
public struct RepMileShell: View {
    @State private var model: AppModel

    /// Parallel-phase composition: replay the bundled CoachingCore captures for `scenario` (launch argument `-scenario <id>`).
    public init(scenario: String? = nil) {
        RMFonts.register()
        let store = FixtureStore.bundled ?? FixtureStore(directory: URL(fileURLWithPath: "/nonexistent"))
        let chosen = Scenario.named(scenario ?? UserDefaults.standard.string(forKey: "scenario"))
        _model = State(initialValue: AppModel(reader: FixtureCoachingReader(scenario: chosen, store: store), writer: FixtureCoachingWriter(store: store),
                                              health: FixtureHealthIngestStatus(queued: chosen.healthQueued), athleteName: "Lucas Andrade"))
    }

    public init(model: AppModel) { RMFonts.register(); _model = State(initialValue: model) }

    public var body: some View {
        Group {
            switch model.route {
            case .loading: LoadingSkeleton()
            case .app: AppTabs()
            default: StateScreen(route: model.route, primary: {}, retry: { Task { await model.load() } })
            }
        }
        .environment(model)
        .preferredColorScheme(.dark)
        .task { if model.route == .loading { await model.load() } }
    }
}

enum Route: Hashable {
    case profile
    case session(String, String)
}

struct AppTabs: View {
    @Environment(AppModel.self) private var model
    @State private var tab: AppTab = .today
    @State private var todayPath: [Route] = []
    @State private var showAdd = false
    @State private var showChanges = false

    var body: some View {
        ZStack(alignment: .bottom) {
            Group {
                switch tab {
                case .today:
                    NavigationStack(path: $todayPath) {
                        TodayView(openProfile: { todayPath.append(.profile) },
                                  openSession: { todayPath.append(.session($0.id, $0.date)) },
                                  openChanges: { showChanges = true },
                                  openReadiness: { showChanges = true })
                            .toolbar(.hidden, for: .navigationBar)
                            .background(RM.Palette.fundoApp)
                            .navigationDestination(for: Route.self, destination: destination)
                    }
                case .plan: NavigationStack { PreviewScreen(title: L.t("plan.title"), icon: .plano) }
                case .history: NavigationStack { PreviewScreen(title: L.t("history.title"), icon: .historico) }
                case .progress: NavigationStack { PreviewScreen(title: L.t("progress.title"), icon: .progresso) }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            if todayPath.isEmpty || tab != .today {
                RMTabBar(selection: $tab, onAdd: { showAdd = true }).padding(.bottom, 8)
            }
        }
        .background(RM.Palette.fundoApp.ignoresSafeArea())
        .sheet(isPresented: $showAdd) { PreviewScreen(title: L.t("tab.add"), icon: .adicionar).presentationDetents([.medium]) }
        .sheet(isPresented: $showChanges) { PreviewScreen(title: L.t("today.changed.title"), icon: .lista).presentationDetents([.medium]) }
    }

    @ViewBuilder private func destination(_ r: Route) -> some View {
        switch r {
        case .profile: PreviewScreen(title: L.t("profile.title"), icon: .ajustes)
        case .session(let id, let date):
            if let s = model.plan?.week?.sessions.first(where: { $0.id == id && $0.date == date }) {
                PreviewScreen(title: TodayContent.title(s), icon: Sport(code: s.sport.raw)?.icon ?? .lista)
            }
        }
    }
}

/// A navigable destination whose screen lands in a later increment of this front (kept visibly provisional, never a fake screen).
struct PreviewScreen: View {
    let title: String
    let icon: RMIcon
    var body: some View {
        VStack(spacing: 12) {
            RMIconView(icon, size: 32).foregroundStyle(RM.Palette.textoSecundario)
            Text(title).rmText(.titulo)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(RM.Palette.fundoApp)
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(RM.Palette.fundoApp, for: .navigationBar)
        .accessibilityIdentifier("screen-" + title)
    }
}
