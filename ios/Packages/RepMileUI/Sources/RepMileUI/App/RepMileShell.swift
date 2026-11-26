import CoachingPresentation
import IntegrationContracts
import RunRecorder
import SwiftUI

/// The app root. In the parallel phase it composes the fixture providers (front C); at integration the composition root passes front A's
/// CoachingHost and front B's adapter instead, and nothing below changes.
public struct RepMileShell: View {
    @State private var model: AppModel
    @State private var recorder: RunRecorder = RepMileShell.makeRecorder()

    /// CoreLocation on a device; a scripted source for UI tests (`-simulatedLocation`), so no permission prompt blocks a journey.
    @MainActor static func makeRecorder() -> RunRecorder {
        let simulated = ProcessInfo.processInfo.arguments.contains("-simulatedLocation")
        let source: LocationSource = simulated ? SimulatedLocationSource(state: .noSignal) : CoreLocationSource()
        // UI tests: a store per launch, so one journey's recording never resumes in the next (`-recordingStore <name>` reuses one on purpose).
        let args = ProcessInfo.processInfo.arguments
        let name = args.firstIndex(of: "-recordingStore").flatMap { args.indices.contains($0 + 1) ? args[$0 + 1] : nil } ?? UUID().uuidString
        let store = simulated ? RecordingStore(directory: FileManager.default.temporaryDirectory.appendingPathComponent("uitest-recordings-" + name)) : RecordingStore.standard()
        return RunRecorder(source: source, store: store)
    }

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
            case .onboarding:
                OnboardingFlow(onEnrolled: {
                    // Fixture phase: the state the engine answered after an accepted intake (`special-none-plan`, the first week).
                    if let store = FixtureStore.bundled { Task { await model.replaceReader(FixtureCoachingReader(scenario: .firstWeek, store: store)) } }
                    else { Task { await model.load() } }
                })
            default: StateScreen(route: model.route, primary: {}, retry: { Task { await model.load() } })
            }
        }
        .environment(model)
        .environment(recorder)
        // An account found erased (GONE) erases this front's recordings too (G07), also when the erasure happened elsewhere.
        .onChange(of: model.route) { _, r in if r == .accountErased { recorder.eraseAllRecordings() } }
        .preferredColorScheme(.dark)
        .task { if model.route == .loading { await model.load() } }
    }
}

enum Route: Hashable {
    case profile
    case hrZones
    case session(String, String)
}

struct AppTabs: View {
    @Environment(AppModel.self) private var model
    @Environment(RunRecorder.self) private var recorder
    @State private var tab: AppTab = .today
    @State private var todayPath: [Route] = []
    @State private var planPath: [Route] = []
    @State private var sheet: Sheet?
    /// What to present once the current sheet is gone (one presentation at a time: a sheet opening a flow or the run cover).
    @State private var afterDismiss: (() -> Void)?
    @State private var runLaunch: Launch?

    struct Launch: Identifiable { let id = UUID(); let session: PlannedSession? }
    enum Sheet: Identifiable {
        case add, changes, notFeeling, readiness, strength(Launch), moving(PlannedSession)
        var id: String {
            switch self {
            case .add: "add"; case .changes: "changes"; case .notFeeling: "not-feeling"; case .readiness: "readiness"
            case .strength(let l): "strength-\(l.id)"; case .moving(let s): "moving-\(s.id)\(s.date)"
            }
        }
    }

    /// Defence in depth: a session starts only when the host says `.startable` (the buttons are already gated).
    private func start(_ s: PlannedSession) {
        guard model.canStart(s) else { return }
        if s.sport.raw == "RUN" { runLaunch = Launch(session: s) } else { sheet = .strength(Launch(session: s)) }
    }
    private func then(_ action: @escaping () -> Void) { afterDismiss = action }
    /// Defence in depth, as `start(_:)`: the gate is read again when the sheet is gone (a reload may have raised it meanwhile).
    private func startUnplannedRun() {
        guard !model.isLoading, runGate == nil else { return }
        runLaunch = Launch(session: nil)
    }
    /// The gate that stops a live unplanned run (a hold or a persistent host gate). Founder provisional decision (26/11) and SSCTR
    /// recheck ruling on QRE P1-11: a clinical block, outside V1 scope or a pending symptom assessment; nothing else is added here.
    private var runGate: NotStartableReason? {
        if model.plan?.hold != nil || model.plan?.state == .blocked { return .blocked }
        if let g = model.globalGate, [.blocked, .outsideV1Scope, .clinicalHumanRequired, .screenRequired].contains(g) { return g }
        return nil
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            Group {
                switch tab {
                case .today:
                    NavigationStack(path: $todayPath) {
                        TodayView(openProfile: { todayPath.append(.profile) },
                                  openSession: { todayPath.append(.session($0.id, $0.date)) },
                                  startSession: start,
                                  openChanges: { sheet = .changes },
                                  openReadiness: { sheet = .readiness })
                            .toolbar(.hidden, for: .navigationBar)
                            .background(RM.Palette.fundoApp)
                            .navigationDestination(for: Route.self, destination: destination)
                    }
                case .plan:
                    NavigationStack(path: $planPath) {
                        PlanScreen(openSession: { planPath.append(.session($0.id, $0.date)) }, cantThisDay: { sheet = .moving($0) })
                            .navigationDestination(for: Route.self, destination: destination)
                    }
                case .history: NavigationStack { HistoryScreen() }
                case .progress: NavigationStack { ProgressScreen() }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            if (tab == .today && todayPath.isEmpty) || (tab == .plan && planPath.isEmpty) || tab == .history || tab == .progress {
                RMTabBar(selection: $tab, onAdd: { sheet = .add }).padding(.bottom, 8)
            }
        }
        .background(RM.Palette.fundoApp.ignoresSafeArea())
        .sheet(item: $sheet, onDismiss: {
            let next = afterDismiss; afterDismiss = nil
            if let next { next() } else { Task { await model.load() } }
        }) { which in
            switch which {
            case .add: AddWorkoutSheet(startRun: { then { startUnplannedRun() } }, logStrength: { then { sheet = .strength(Launch(session: nil)) } },
                                       runBlockedReason: runGate.map { L.t("reason." + $0.rawValue) }, runPending: model.isLoading)
            case .changes: ChangesSheet(notFeeling100: { then { sheet = .notFeeling } }, readiness: { then { sheet = .readiness } }, blocked: model.plan?.state == .blocked)
            case .notFeeling: NotFeeling100Flow()
            case .readiness: ReadinessFlow()
            case .strength(let l): StrengthLogView(session: l.session)
            case .moving(let s): UnavailableDaySheet(session: s)
            }
        }
        .fullScreenCover(item: $runLaunch, onDismiss: { recorder.close(); Task { await model.load() } }) { RunSessionScreen(session: $0.session) }
        .onAppear {
            // A recording that survived a killed process comes back on screen.
            recorder.resumeIfNeeded()
            // Running, paused or finished-but-not-reported: the report identity comes from the recording itself, whatever week is loaded.
            if let st = recorder.state, runLaunch == nil {
                let all = (model.plan?.week?.sessions ?? []) + model.weeks.flatMap(\.sessions)
                runLaunch = Launch(session: all.first { $0.id == st.sessionId && $0.date == st.sessionDate })
            }
        }
    }

    @ViewBuilder private func destination(_ r: Route) -> some View {
        switch r {
        case .profile: ProfileScreen(openZones: { todayPath.append(.hrZones) })
        case .hrZones: HeartRateZonesScreen()
        case .session(let id, let date):
            if let s = (model.plan?.week?.sessions ?? []).first(where: { $0.id == id && $0.date == date })
                ?? model.weeks.flatMap(\.sessions).first(where: { $0.id == id && $0.date == date }) {
                SessionDetailView(session: s, onStart: start, onCantThisDay: { sheet = .moving($0) })
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
