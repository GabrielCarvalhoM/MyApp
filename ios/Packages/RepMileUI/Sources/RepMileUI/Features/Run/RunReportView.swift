import CoachingPresentation
import RunRecorder
import SwiftUI

/// The athlete's report after a recording (Figma 40 "salvando" → 50 summary). It carries only what the athlete states: completed, minutes,
/// RPE, a stop (planned runs only) and the response. A distance the iPhone measured never enters it (GAP-16): `declaredDistanceKm` stays nil.
/// "Salvo" and the celebration only after `WriteOutcome.kept` (GAP-12). An unplanned run asks "Parou ou sentiu algo fora do normal?"
/// (SSCTR-ABC-S1): no answer is not "no"; "yes" opens "Não estou 100%" with the eligibility screen.
struct RunReportView: View {
    @Environment(AppModel.self) private var model
    @Environment(RunRecorder.self) private var recorder
    /// For the title only. Whether the report is planned comes from the recording itself (QRE: a resumed recording whose session is no
    /// longer in the loaded week is still reported as that planned session, never as an unplanned run).
    let session: PlannedSession?
    let recording: FinishedRecording
    var close: () -> Void
    private var planned: Bool { recording.ref.sessionId != nil }
    @State private var confirmLeave = false

    @State private var completed = true
    @State private var minutes: Double = 0
    @State private var rpe: Double?
    @State private var stopped = false
    @State private var stopReason: StopReason?
    @State private var effort: EffortResponse = .unknown
    @State private var unusual: Bool?
    @State private var sending = false
    @State private var result: Result?
    @State private var showSigns = false
    /// The engine asked for the warning-sign screen (`warningSignScreen.status == REQUIRED`). Kept apart from `result`: the instruction stands
    /// whether or not the report itself was kept ("whatever the plan state", Readings.swift), so a not-kept report still shows it.
    @State private var screenRequired = false
    enum Result: Equatable { case saved, notKept, failed(String), screenRequired }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text(L.t("report.title")).rmText(.manchete).padding(.top, 16)
                LocalSummary(local: recording.local, movingMinutes: recording.movingMinutes)
                if planned {
                    Picker("", selection: $completed) {
                        Text(L.t("report.completed")).tag(true)
                        Text(L.t("report.partial")).tag(false)
                    }
                    .pickerStyle(.segmented)
                    .accessibilityIdentifier("report-completed")
                }
                Stepper(value: $minutes, in: 1...600, step: 1) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(L.t("report.minutes")).rmText(.detalhe, RM.Palette.textoSecundario)
                        Text(L.f("common.minutes", Fmt.minutes(minutes))).rmText(.numeroM)
                    }
                }
                .accessibilityIdentifier("report-minutes")
                VStack(alignment: .leading, spacing: 8) {
                    Text(L.t("report.rpe")).rmText(.detalhe, RM.Palette.textoSecundario)
                    HStack(spacing: 4) {
                        ForEach(0...10, id: \.self) { v in
                            Button { rpe = Double(v) } label: {
                                Text("\(v)").rmText(.rotulo, rpe == Double(v) ? RM.Palette.agoraSobre : RM.Palette.textoPrimario)
                                    .frame(maxWidth: .infinity, minHeight: 36)
                                    .background(rpe == Double(v) ? RM.Palette.agora : RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 8))
                            }
                            .buttonStyle(.plain)
                            .accessibilityIdentifier("report-rpe-\(v)")
                        }
                    }
                }
                if planned {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(L.t("report.effort")).rmText(.detalhe, RM.Palette.textoSecundario)
                        Picker("", selection: $effort) {
                            ForEach([EffortResponse.easier, .onTarget, .harder, .unknown], id: \.self) { Text(L.t("response." + $0.rawValue)).tag($0) }
                        }
                        .pickerStyle(.segmented)
                    }
                    Toggle(isOn: $stopped) { Text(L.t("report.stopped")).rmText(.subtitulo) }
                        .tint(RM.Palette.corrida).accessibilityIdentifier("report-stopped")
                    if stopped {
                        Picker(L.t("report.stopReason"), selection: $stopReason) {
                            Text(L.t("report.stopReason")).tag(StopReason?.none)
                            ForEach(StopReason.allCases, id: \.self) { Text(L.t("stop." + $0.rawValue)).tag(Optional($0)) }
                        }
                        .pickerStyle(.menu).tint(RM.Palette.textoPrimario)
                        .accessibilityIdentifier("report-stop-reason")
                    }
                } else {
                    unusualQuestion
                }
                resultView
                if result == .saved || result == .screenRequired {
                    PrimaryActionButton(L.t("report.done"), icon: .check) { close() }.accessibilityIdentifier("report-done")
                } else {
                    PrimaryActionButton(result == .notKept ? L.t("report.resend") : L.t("report.save"), icon: .check, enabled: canSend) { Task { await send() } }
                        .accessibilityIdentifier("report-save")
                    Button { confirmLeave = true } label: { Text(L.t("report.leave")).rmText(.rotulo, RM.Palette.textoSecundario).frame(maxWidth: .infinity) }
                        .accessibilityIdentifier("report-leave")
                }
            }
            .padding(.horizontal, RM.Space.gutter)
            .padding(.bottom, 40)
        }
        .scrollIndicators(.hidden)
        .onAppear {
            minutes = max(1, recording.movingMinutes.rounded())
            // A recording restored after a killed process may already be reported: never offer to send it a second time (QRE recheck N2).
            if recording.ref.reportedEventId != nil, result == nil { result = .saved }
        }
        // Closing "Não estou 100%" returns to the report (still to save or resend); it never closes the run screen.
        .sheet(isPresented: $showSigns) { NotFeeling100Flow(requireEligibility: true) }
        .confirmationDialog(L.t("report.leave.confirm"), isPresented: $confirmLeave, titleVisibility: .visible) {
            Button(L.t("report.leave"), role: .destructive) { recorder.discard(); close() }
        }
        .accessibilityElement(children: .contain).accessibilityIdentifier("screen-report")
    }

    private var unusualQuestion: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(L.t("report.symptomQuestion")).rmText(.subtitulo)
            HStack(spacing: 8) {
                choice(L.t("report.symptomNo"), unusual == false, id: "report-unusual-no") { unusual = false }
                // "Sim" opens the flow at once (SSCTR-ABC-S1); the report is saved apart.
                choice(L.t("report.symptomYes"), unusual == true, id: "report-unusual-yes") { unusual = true; showSigns = true }
            }
            if unusual == nil { Text(L.t("report.symptomRequired")).rmText(.detalhe, RM.Palette.textoSecundario) }
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
        switch result {
        case .saved?:
            Label { Text(L.t("report.saved")).rmText(.subtitulo) } icon: { RMIconView(.check, size: 18).foregroundStyle(RM.Palette.positivo) }
                .transition(.scale.combined(with: .opacity)).accessibilityIdentifier("report-saved")
            if screenRequired { screenRequiredBanner }
        case .notKept?:
            Text(L.t("report.notKept")).rmText(.detalhe, RM.Palette.negativo).accessibilityIdentifier("report-not-kept")
            if screenRequired { screenRequiredBanner }
        case .screenRequired?:
            screenRequiredBanner
        case .failed(let code)?:
            Text(code == "CONFLICT_STALE_VERSION" ? L.t("state.stale.body") : L.t("state.opError.body")).rmText(.detalhe, RM.Palette.negativo)
            if screenRequired { screenRequiredBanner }
        case nil: EmptyView()
        }
    }

    private var screenRequiredBanner: some View {
        StateBanner(tone: .safety, icon: .lista, title: L.t("state.screenRequired.title"), message: L.t("screen.required"),
                    actionTitle: L.t("state.screenRequired.action")) { showSigns = true }
            .accessibilityIdentifier("report-screen-required")
    }

    private var canSend: Bool { !sending && result != .saved && result != .screenRequired && (planned || unusual != nil) && (!stopped || stopReason != nil) }

    /// The end of the recording with its offset (BoundaryInstant format).
    static func instant(_ d: Date) -> String {
        let f = ISO8601DateFormatter(); f.timeZone = .current; f.formatOptions = [.withInternetDateTime]
        return f.string(from: d)
    }

    func observation() -> AthleteObservation {
        Self.makeObservation(planned: recording.ref.sessionId.flatMap { id in recording.sessionDate.map { (id, $0) } },
                             today: Self.occurrenceDay(end: recording.ref.end, planToday: model.plan?.today), end: recording.ref.end, completed: completed,
                             minutes: minutes, rpe: rpe, stop: stopped ? stopReason : nil, effort: effort)
    }

    /// The day an unplanned run happened: the device-local day of the recording's end, not the day it is reported (QRE recheck N5: a run
    /// ending at 23:50 reported after midnight, or a restored recording, was filed under the wrong day). The plan's own "today" is used
    /// only when it is that same day.
    static func occurrenceDay(end: Date, planToday: String?, now: Date = Date()) -> String {
        let endDay = Fmt.deviceDay(end)
        if let planToday, endDay == Fmt.deviceDay(now) { return planToday }
        return endDay
    }

    /// The report the form produces: only the athlete's statements. There is no parameter for a distance: the iPhone's measurement cannot
    /// reach a report by construction (GAP-16).
    static func makeObservation(planned: (sessionId: String, date: String)?, today: String, end: Date, completed: Bool, minutes: Double, rpe: Double?,
                                stop: StopReason?, effort: EffortResponse) -> AthleteObservation {
        let at = instant(end)
        let response = SessionResponse(performance: .unknown, recovery: .unknown, effort: planned == nil ? .unknown : effort, nextDayFunction: .unknown)
        if let s = planned {
            return .plannedRun(sessionId: s.sessionId, occurrenceDate: s.date, observedAt: at,
                               actual: PlannedRunActual(completed: completed && stop == nil, minutes: minutes, rpe: rpe, stop: stop.map(RunStop.init(reason:))),
                               response: response)
        }
        return .unplannedRun(occurrenceDate: today, observedAt: at, actual: UnplannedRunActual(completed: true, minutes: minutes, rpe: rpe), response: response)
    }

    private func send() async {
        sending = true; defer { sending = false }
        let outcome = await model.writer.submit(ReviewRequest(.sessionReports([observation()]), eligibility: nil))
        guard outcome.answer.ok else { result = .failed(outcome.answer.error?.code.raw ?? "UNKNOWN"); return }
        let id = outcome.answer.recorded?.first
        let kept = id.map { outcome.kept.contains($0) } ?? false
        if kept, let id { recorder.markReported(eventId: id) }
        // REQUIRED always shows the screen (verification of increment 09, N1). Not kept: the banner plus "Reenviar" / "Sair" (QRE recheck
        // N7: "Concluir" would close the recording and lose the report); kept: the banner plus "Concluir".
        // Sticky for the life of this report (verification of increment 10, F1): an instruction already given still stands when a later
        // resend, with other values, comes back without it.
        screenRequired = screenRequired || outcome.answer.warningSignScreen?.status.raw == "REQUIRED"
        if kept, screenRequired { withAnimation { result = .screenRequired }; return }
        withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) { result = kept ? .saved : .notKept }
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
