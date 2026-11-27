import CoachingPresentation
import RunRecorder
import SwiftUI

/// The athlete's report after a recording (Figma 40 "salvando" → 50 summary). State, rules and the write live in `RunReportViewModel`;
/// this view renders them. An unplanned run asks "Parou ou sentiu algo fora do normal?" (SSCTR-ABC-S1); "yes" opens "Não estou 100%"
/// with the eligibility screen at once. Every report asks the eligibility screen itself (#68): "Salvar" stays off until it is answered, and an
/// answer that routes to a human shows the existing safety state (INTERIM copy) with no "Reenviar" invitation; the form stays editable, so
/// a mis-tap can be corrected (SSCTR #68 C5).
struct RunReportView: View {
    @Environment(AppModel.self) private var model
    @Environment(RunRecorder.self) private var recorder
    /// For the title only. Whether the report is planned comes from the recording itself.
    let session: PlannedSession?
    @State private var viewModel: RunReportViewModel
    var close: () -> Void
    @State private var confirmLeave = false
    @State private var showSigns = false

    init(session: PlannedSession?, viewModel: RunReportViewModel, close: @escaping () -> Void) {
        self.session = session; _viewModel = State(initialValue: viewModel); self.close = close
    }

    private var recording: FinishedRecording { viewModel.recording }
    private var planned: Bool { viewModel.planned }

    var body: some View {
        @Bindable var vm = viewModel
        return ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text(L.t("report.title")).rmText(.manchete).padding(.top, 16)
                LocalSummary(local: recording.local, movingMinutes: recording.movingMinutes)
                if planned {
                    Picker("", selection: $vm.completed) {
                        Text(L.t("report.completed")).tag(true)
                        Text(L.t("report.partial")).tag(false)
                    }
                    .pickerStyle(.segmented)
                    .accessibilityIdentifier("report-completed")
                }
                Stepper(value: $vm.minutes, in: 1...600, step: 1) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(L.t("report.minutes")).rmText(.detalhe, RM.Palette.textoSecundario)
                        Text(L.f("common.minutes", Fmt.minutes(viewModel.minutes))).rmText(.numeroM)
                    }
                }
                .accessibilityIdentifier("report-minutes")
                VStack(alignment: .leading, spacing: 8) {
                    Text(L.t("report.rpe")).rmText(.detalhe, RM.Palette.textoSecundario)
                    HStack(spacing: 4) {
                        ForEach(0...10, id: \.self) { v in
                            Button { viewModel.rpe = Double(v) } label: {
                                Text("\(v)").rmText(.rotulo, viewModel.rpe == Double(v) ? RM.Palette.agoraSobre : RM.Palette.textoPrimario)
                                    .frame(maxWidth: .infinity, minHeight: 36)
                                    .background(viewModel.rpe == Double(v) ? RM.Palette.agora : RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 8))
                            }
                            .buttonStyle(.plain)
                            .accessibilityIdentifier("report-rpe-\(v)")
                        }
                    }
                }
                if planned {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(L.t("report.effort")).rmText(.detalhe, RM.Palette.textoSecundario)
                        Picker("", selection: $vm.effort) {
                            ForEach([EffortResponse.easier, .onTarget, .harder, .unknown], id: \.self) { Text(L.t("response." + $0.rawValue)).tag($0) }
                        }
                        .pickerStyle(.segmented)
                    }
                    Toggle(isOn: $vm.stopped) { Text(L.t("report.stopped")).rmText(.subtitulo) }
                        .tint(RM.Palette.corrida).accessibilityIdentifier("report-stopped")
                    if viewModel.stopped {
                        Picker(L.t("report.stopReason"), selection: $vm.stopReason) {
                            Text(L.t("report.stopReason")).tag(StopReason?.none)
                            ForEach(StopReason.allCases, id: \.self) { Text(L.t("stop." + $0.rawValue)).tag(Optional($0)) }
                        }
                        .pickerStyle(.menu).tint(RM.Palette.textoPrimario)
                        .accessibilityIdentifier("report-stop-reason")
                    }
                } else {
                    unusualQuestion
                }
                // Hidden under "Não estou 100%" (its own form has the same identifiers); fixed while the report is on its way.
                if !viewModel.canClose && !showSigns {
                    EligibilityForm(screen: $vm.eligibility).disabled(viewModel.sending)
                    Text(L.t("ob.eligibility.body")).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
                }
                resultView
                if viewModel.canClose {
                    PrimaryActionButton(L.t("report.done"), icon: .check) { close() }.accessibilityIdentifier("report-done")
                } else {
                    PrimaryActionButton(viewModel.result == .notKept && !viewModel.clinical ? L.t("report.resend") : L.t("report.save"), icon: .check,
                                        enabled: viewModel.canSend) {
                        Task { await viewModel.send() }
                    }
                        .accessibilityIdentifier("report-save")
                    Button { confirmLeave = true } label: { Text(L.t("report.leave")).rmText(.rotulo, RM.Palette.textoSecundario).frame(maxWidth: .infinity) }
                        .accessibilityIdentifier("report-leave")
                }
            }
            .padding(.horizontal, RM.Space.gutter)
            .padding(.bottom, 40)
        }
        .scrollIndicators(.hidden)
        .animation(.spring(response: 0.4, dampingFraction: 0.7), value: viewModel.result)
        // Closing "Não estou 100%" returns to the report (still to save or resend); it never closes the run screen.
        .sheet(isPresented: $showSigns) {
            NotFeeling100Flow(viewModel: NotFeeling100ViewModel(reader: model.reader, writer: model.writer, planToday: { [model] in model.plan?.today }))
        }
        .confirmationDialog(L.t("report.leave.confirm"), isPresented: $confirmLeave, titleVisibility: .visible) {
            Button(L.t("report.leave"), role: .destructive) { recorder.discard(); close() }
        }
        .accessibilityElement(children: .contain).accessibilityIdentifier("screen-report")
    }

    private var unusualQuestion: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(L.t("report.symptomQuestion")).rmText(.subtitulo)
            HStack(spacing: 8) {
                choice(L.t("report.symptomNo"), viewModel.unusual == false, id: "report-unusual-no") { viewModel.unusual = false }
                // "Sim" opens the flow at once (SSCTR-ABC-S1); the report is saved apart.
                choice(L.t("report.symptomYes"), viewModel.unusual == true, id: "report-unusual-yes") { viewModel.unusual = true; showSigns = true }
            }
            if viewModel.unusual == nil { Text(L.t("report.symptomRequired")).rmText(.detalhe, RM.Palette.textoSecundario) }
        }
    }

    private func choice(_ title: String, _ on: Bool, id: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title).rmText(.rotulo, on ? RM.Palette.agoraSobre : RM.Palette.textoPrimario)
                .frame(maxWidth: .infinity, minHeight: 44).background(on ? RM.Palette.agora : RM.Palette.fundoElevado2, in: Capsule())
        }
        .buttonStyle(PressableStyle()).accessibilityIdentifier(id).accessibilityAddTraits(on ? .isSelected : [])
    }

    @ViewBuilder private var resultView: some View {
        switch viewModel.result {
        case .saved?:
            Label { Text(L.t("report.saved")).rmText(.subtitulo) } icon: { RMIconView(.check, size: 18).foregroundStyle(RM.Palette.positivo) }
                .transition(.scale.combined(with: .opacity)).accessibilityIdentifier("report-saved")
            if viewModel.screenRequired { screenRequiredBanner }
        case .notKept?:
            // Routed to a human: the report was not recorded, and nothing here invites a resend.
            Text(L.t(viewModel.clinical ? "report.clinical.notKept" : "report.notKept")).rmText(.detalhe, RM.Palette.negativo)
                .accessibilityIdentifier("report-not-kept")
            if viewModel.screenRequired { screenRequiredBanner }
        case .screenRequired?:
            screenRequiredBanner
        case .failed(let code)?:
            Text(code == "CONFLICT_STALE_VERSION" ? L.t("state.stale.body") : L.t("state.opError.body")).rmText(.detalhe, RM.Palette.negativo)
            if viewModel.screenRequired { screenRequiredBanner }
        case nil: EmptyView()
        }
        if let g = viewModel.clinicalGuidance { ClinicalRouteBanner(reportKept: viewModel.canClose, guidance: g).accessibilityIdentifier("report-blocked") }
    }

    private var screenRequiredBanner: some View {
        StateBanner(tone: .safety, icon: .lista, title: L.t("state.screenRequired.title"), message: L.t("screen.required"),
                    actionTitle: L.t("state.screenRequired.action")) { showSigns = true }
            .accessibilityIdentifier("report-screen-required")
    }
}

/// "Medido pelo iPhone · não usado pelo plano": the local measurement, shown and never sent.
struct LocalSummary: View {
    let local: LocalMeasurement
    let movingMinutes: Double
    var body: some View {
        RMCard {
            HStack(alignment: .firstTextBaseline, spacing: 24) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(Fmt.clock(movingMinutes * 60)).rmText(.numeroM)
                    Text(L.t("run.elapsed")).rmText(.detalhe, RM.Palette.textoSecundario)
                }
                if let d = local.distanceMetres {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(Fmt.distance(km: d / 1000)).rmText(.numeroM)
                        if let p = local.paceSecondsPerKm { Text(Fmt.paceBand(fast: p, slow: p).components(separatedBy: "–").last ?? "").rmText(.detalhe, RM.Palette.textoSecundario) }
                    }
                }
            }
            if local.distanceMetres != nil {
                Text(L.t("run.measuredLocal")).rmText(.tab, RM.Palette.textoTerciario).accessibilityIdentifier("report-local-label")
            }
        }
    }
}
