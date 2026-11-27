import CoachingPresentation
import IntegrationContracts
import RunRecorder
import SwiftUI

/// The app root. In the parallel phase it composes the fixture providers (front C); at integration the composition root passes front A's
/// CoachingHost and front B's adapter instead, and nothing below changes.
public struct RepMileShell: View {
    /// What the production composition root (`ios/App/Composition`, #16) hands the shell besides the model: the athlete id the host was
    /// opened with (the intake carries it) and the hook run once the account is known erased (the next launch is a new account, CCP-A-05).
    public struct Live {
        public let athleteId: String
        public let accountErased: @MainActor () -> Void
        public init(athleteId: String, accountErased: @escaping @MainActor () -> Void) {
            self.athleteId = athleteId; self.accountErased = accountErased
        }
    }

    @State private var model: AppModel
    @State private var recorder: RunRecorder
    /// nil: the fixture composition (`-scenario`). Set: the live composition, which never swaps in a fixture reader.
    private let live: Live?

    /// The fixture composition's recorder (`-scenario`, Debug only; the live composition passes its own). CoreLocation on a device; a
    /// scripted source for UI tests (`-simulatedLocation`), so no permission prompt blocks a journey.
    @MainActor static func makeRecorder() -> RunRecorder {
        let args = ProcessInfo.processInfo.arguments
        let simulated = args.contains("-simulatedLocation")
        let source: LocationSource = simulated ? SimulatedLocationSource(state: .noSignal) : CoreLocationSource()
        let store = RecordingStore(directory: fixtureRecordingsDirectory(arguments: args, simulated: simulated, temporary: FileManager.default.temporaryDirectory))
        return RunRecorder(source: source, store: store)
    }

    /// Where the fixture composition keeps its recordings: never the live `RecordingStore.standardDirectory` (#76), so a fixture launch can
    /// neither show nor erase the athlete's real recordings, nor leave one that the live composition would then index. UI tests
    /// (`-simulatedLocation`): a store per launch, so one journey's recording never resumes in the next; `-recordingStore <name>` reuses one
    /// on purpose (a relaunch that must resume). CoreLocation: one fixture store kept across launches, as before, still not the live one.
    static func fixtureRecordingsDirectory(arguments: [String], simulated: Bool, temporary: URL,
                                           newName: () -> String = { UUID().uuidString }) -> URL {
        let named = arguments.firstIndex(of: "-recordingStore").flatMap { arguments.indices.contains($0 + 1) ? arguments[$0 + 1] : nil }
        let name = named.flatMap { $0.isEmpty || $0.contains("/") || $0.hasPrefix(".") ? nil : $0 } ?? (simulated ? newName() : "device")
        return temporary.appendingPathComponent("fixture-recordings-" + name, isDirectory: true)
    }

    /// Parallel-phase composition: replay the bundled CoachingCore captures for `scenario` (launch argument `-scenario <id>`).
    public init(scenario: String? = nil) {
        RMFonts.register()
        let store = FixtureStore.bundled ?? FixtureStore(directory: URL(fileURLWithPath: "/nonexistent"))
        let chosen = Scenario.named(scenario ?? UserDefaults.standard.string(forKey: "scenario"))
        _model = State(initialValue: AppModel(reader: FixtureCoachingReader(scenario: chosen, store: store), writer: FixtureCoachingWriter(store: store),
                                              health: FixtureHealthIngestStatus(queued: chosen.healthQueued), athleteName: "Lucas Andrade"))
        _recorder = State(initialValue: RepMileShell.makeRecorder())
        live = nil
    }

    public init(model: AppModel) { RMFonts.register(); _model = State(initialValue: model); _recorder = State(initialValue: RepMileShell.makeRecorder()); live = nil }

    /// The live composition: the recorder is the composition's (its `RecordingStore` is also front B's `AppRecordingIndex`).
    public init(model: AppModel, recorder: RunRecorder, live: Live) {
        RMFonts.register(); _model = State(initialValue: model); _recorder = State(initialValue: recorder); self.live = live
    }

    public var body: some View {
        Group {
            switch model.route {
            case .loading: LoadingSkeleton()
            case .app: AppTabs()
            case .onboarding:
                OnboardingFlow(viewModel: live.map { OnboardingViewModel(writer: model.writer, athleteId: $0.athleteId) } ?? OnboardingViewModel(writer: model.writer), onEnrolled: {
                    // Live: the host reads the new record. Never a fixture reader here.
                    if live != nil { Task { await model.load() } }
                    // Fixture phase: the state the engine answered after an accepted intake (`special-none-plan`, the first week).
                    else if let store = FixtureStore.bundled { Task { await model.replaceReader(FixtureCoachingReader(scenario: .firstWeek, store: store)) } }
                    else { Task { await model.load() } }
                })
            default: StateScreen(route: model.route, primary: {}, retry: { Task { await model.load() } })
            }
        }
        .environment(model)
        .environment(recorder)
        // An account found erased (GONE) erases this front's recordings too (G07), also when the erasure happened elsewhere.
        // A failed removal is not lost in the live composition: the rotation leaves the device erasure pending, and the next open removes
        // the folder or does not open (`DEVICE_ERASURE_PENDING`, #63 P3-1, #76).
        .onChange(of: model.route) { _, r in if r == .accountErased { try? recorder.eraseAllRecordings(); live?.accountErased() } }
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
    /// The gate that stops a live unplanned run (`AppModel.unplannedRunGate`, the same rule that withholds the steps of a run in progress).
    private var runGate: NotStartableReason? { model.unplannedRunGate }

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
            case .notFeeling: NotFeeling100Flow(viewModel: NotFeeling100ViewModel(reader: model.reader, writer: model.writer, planToday: { [model] in model.plan?.today },
                                                                                  holdGuidance: { [model] in model.plan?.clinicalGuidance }))
            case .readiness: ReadinessFlow(viewModel: ReadinessViewModel(reader: model.reader, writer: model.writer, planToday: { [model] in model.plan?.today },
                                                                         holdGuidance: { [model] in model.plan?.clinicalGuidance }))
            case .strength(let l): StrengthLogView(viewModel: StrengthLogViewModel(session: l.session, writer: model.writer, planToday: { [model] in model.plan?.today },
                                                                                   holdGuidance: { [model] in model.plan?.clinicalGuidance }))
            case .moving(let s):
                UnavailableDaySheet(viewModel: UnavailableDayViewModel(session: s, writer: model.writer, planToday: { [model] in model.plan?.today },
                                                                       reload: { [model] in await model.load() },
                                                                       presentation: { [model] in model.presentation },
                                                                       holdGuidance: { [model] in model.plan?.clinicalGuidance }))
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
        case .profile:
            ProfileScreen(viewModel: ProfileViewModel(writer: model.writer, reload: { [model] in await model.load() },
                                                      eraseRecordings: { [recorder] in try? recorder.eraseAllRecordings() },
                                                      accountErased: { [model] in await model.accountErased() }),
                          openZones: { todayPath.append(.hrZones) })
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
