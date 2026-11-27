import CoachingPresentation
import RunRecorder
import SwiftUI

/// Execução de corrida (Figma page 40, V1 variant "sem FC ao vivo", row `879:3062`). Time and steps from the prescription through
/// `RunRecorder`; distance and pace measured by the iPhone are shown live and kept local ("medido pelo iPhone · não usado pelo plano").
/// Location states are visible and never stop a run by time.
struct RunSessionScreen: View {
    @Environment(AppModel.self) private var model
    @Environment(RunRecorder.self) private var recorder
    @Environment(\.dismiss) private var dismiss
    /// nil = an unplanned run ("corrida avulsa").
    let session: PlannedSession?
    @State private var confirmFinish = false
    @State private var finished: FinishedRecording?

    private var presentation: RunSessionPresentation? { session.flatMap { model.presentation?.runSession(for: $0) } }
    /// The prescribed steps expanded like the recorder's, for each step's intensity (pace band, RPE) on screen.
    /// Expanded exactly like `RecorderStep.steps(of:)` (same filter), so the recorder's step index names the same step here.
    private var runSteps: [RunStep] {
        (presentation?.blocks ?? []).flatMap { b in (0..<max(1, b.repeat_)).flatMap { _ in b.steps.filter { s in
            (s.target.type.raw == "TIME" && s.target.seconds != nil) || (s.target.type.raw == "DISTANCE" && s.target.metres != nil) } } }
    }

    var body: some View {
        Group {
            if let finished {
                RunReportView(session: session,
                              viewModel: RunReportViewModel(recording: finished, writer: model.writer, planToday: { [model] in model.plan?.today },
                                                            markReported: { [recorder] in recorder.markReported(eventId: $0) },
                                                            holdGuidance: { [model] in model.plan?.clinicalGuidance })) { dismiss() }
            } else {
                TimelineView(.periodic(from: .now, by: 1)) { _ in live }
            }
        }
        .background(RM.Palette.fundoApp.ignoresSafeArea())
        // On the stable container: the live view it would otherwise sit on is replaced by the report when the run finishes.
        .confirmationDialog(L.t("run.finishConfirm"), isPresented: $confirmFinish, titleVisibility: .visible) {
            Button(L.t("run.finish")) { finished = recorder.finish() }.accessibilityIdentifier("run-finish-confirm")
            Button(L.t("run.discard"), role: .destructive) { recorder.discard(); dismiss() }
        }
        // VoiceOver: a gate that arrives while the screen is open is announced (the steps disappear at that moment).
        .onChange(of: model.runSafetyGate(for: session)) { old, new in
            guard old == nil, let new else { return }
            let urgent = new == .blocked && model.plan?.clinicalGuidance == .urgentCare
            AccessibilityNotification.Announcement(urgent ? L.t("state.blocked.urgent.title.interim") + ". " + L.t("state.blocked.urgent.body.interim")
                                                          : Self.gateTitle(new) + ". " + Self.gateMessage(new)).post()
        }
        .onAppear {
            recorder.resumeIfNeeded()
            if recorder.state == nil { recorder.start(sessionId: session?.id, sessionDate: session?.date, steps: RecorderStep.steps(of: presentation)) }
            // Killed on the report screen: the finished recording comes back to its report.
            if finished == nil, let f = recorder.finishedRecording { finished = f }
        }
    }

    /// The banner's title per reason, the same titles Hoje uses; the message never repeats it.
    static func gateTitle(_ r: NotStartableReason) -> String {
        switch r {
        case .outsideV1Scope: L.t("state.outsideScope.title")
        case .screenRequired: L.t("state.screenRequired.title")
        default: L.t("state.blocked.title")
        }
    }
    static func gateMessage(_ r: NotStartableReason) -> String {
        r == .blocked ? L.t("run.safety.keepRecording") : L.t("reason." + r.rawValue) + " " + L.t("run.safety.keepRecording")
    }

    private var live: some View {
        // #38: a safety gate that applies now (also one that arrived while the recording was stopped by a killed process) withholds the
        // prescription: no step, target, intensity or countdown; the recording, its measurement, pause and finish → report stay.
        let gate = model.runSafetyGate(for: session)
        let current = gate == nil ? recorder.currentStep : nil
        let step = current.map { runSteps.indices.contains($0.index) ? runSteps[$0.index] : nil } ?? nil
        let paused = recorder.state?.phase == .paused
        return VStack(alignment: .leading, spacing: 0) {
            HStack {
                Text(session.map(TodayContent.title) ?? L.t("run.freeRun")).rmText(.subtitulo)
                Spacer()
                LocationChip(state: recorder.location)
            }
            .padding(.top, 12)
            if let gate, gate == .blocked, let plan = model.plan, plan.clinicalGuidance == .urgentCare {
                // #73 (QRE P3-3): a hold at URGENT_CARE_ADVISED shows its existing INTERIM text, never "a gravação continua".
                UrgentCareBanner(reportKept: true, announceKey: UrgentCareBanner.key(for: plan))
                    .padding(.top, 20)
                    .accessibilityIdentifier("run-safety-gate")
            } else if let gate {
                StateBanner(tone: .safety, icon: .pausa, title: Self.gateTitle(gate), message: Self.gateMessage(gate))
                    .padding(.top, 20)
                    .accessibilityIdentifier("run-safety-gate")
            }
            if let c = current, let s = recorder.state {
                Text(L.f("run.step", "\(c.index + 1)", "\(s.steps.count)") + " · " + (L.code("step", Code(raw: c.step.kind)) ?? ""))
                    .rmText(.micro, RM.Palette.textoSecundario).padding(.top, 32)
                    .accessibilityIdentifier("run-step")
            }
            Spacer()
            VStack(alignment: .leading, spacing: 4) {
                if let c = current, case .seconds = c.step.target {
                    Text(Fmt.clock(c.remaining)).rmText(.numeroXXL).monospacedDigit().minimumScaleFactor(0.5).lineLimit(1)
                        .accessibilityIdentifier("run-timer")
                    Text(L.t("run.remaining")).rmText(.detalhe, RM.Palette.textoSecundario)
                } else if let c = current, case .metres = c.step.target {
                    Text(Fmt.distance(km: c.remaining / 1000)).rmText(.numeroXL).accessibilityIdentifier("run-timer")
                    Text(L.t("run.distanceStep")).rmText(.detalhe, RM.Palette.textoSecundario)
                } else {
                    Text(Fmt.clock(recorder.movingTime)).rmText(.numeroXXL).monospacedDigit().minimumScaleFactor(0.5).lineLimit(1)
                        .accessibilityIdentifier("run-timer")
                    Text(L.t("run.elapsed")).rmText(.detalhe, RM.Palette.textoSecundario).accessibilityIdentifier("run-timer-elapsed")
                }
                if let i = step?.intensity {
                    HStack(spacing: 12) {
                        if let e = L.code("effort", i.effortDomain) { Text(e.capitalizedFirst).rmText(.subtitulo, RM.Palette.corrida) }
                        if let p = i.pace { Text(Fmt.paceBand(fast: p.fastSecondsPerKm, slow: p.slowSecondsPerKm)).rmText(.rotulo, RM.Palette.textoSecundario) }
                    }
                    .padding(.top, 12)
                }
            }
            Spacer()
            HStack(alignment: .firstTextBaseline) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(Fmt.clock(recorder.movingTime)).rmText(.numeroM).monospacedDigit()
                    Text(L.t("run.elapsed")).rmText(.detalhe, RM.Palette.textoSecundario)
                }
                Spacer()
                if let m = recorder.measuredMetres {
                    VStack(alignment: .trailing, spacing: 2) {
                        Text(Fmt.distance(km: m / 1000)).rmText(.numeroM)
                        Text(L.t("run.measuredLocal")).rmText(.tab, RM.Palette.textoTerciario)
                    }
                    .accessibilityIdentifier("run-local-distance")
                }
            }
            if let c = current, case .metres = c.step.target, recorder.location != .good {
                SecondaryPillButton(L.t("run.nextStep"), icon: .chevronDireita) { recorder.advanceDistanceStep() }.padding(.top, 12)
            }
            HStack(spacing: 16) {
                Button { paused ? recorder.resume() : recorder.pause() } label: {
                    RMIconView(paused ? .play : .pausa, size: 28).foregroundStyle(RM.Palette.agoraSobre)
                        .frame(width: 88, height: 88).background(RM.Palette.agora, in: Circle())
                }
                .buttonStyle(PressableStyle())
                .accessibilityLabel(paused ? L.t("run.resume") : L.t("run.pause"))
                .accessibilityIdentifier("run-pause")
                Button { confirmFinish = true } label: {
                    Text(L.t("run.finish")).rmText(.botao).frame(maxWidth: .infinity, minHeight: 56).background(RM.Palette.fundoElevado2, in: Capsule())
                }
                .buttonStyle(PressableStyle())
                .accessibilityIdentifier("run-finish")
            }
            .padding(.top, 24).padding(.bottom, 12)
        }
        .padding(.horizontal, RM.Space.gutter)
        .overlay(alignment: .top) { if paused { Text(L.t("run.paused")).rmText(.micro, RM.Palette.marco).padding(.top, 4) } }
        .accessibilityElement(children: .contain).accessibilityIdentifier("screen-run")
    }
}

struct LocationChip: View {
    let state: LocationState
    var body: some View {
        HStack(spacing: 6) {
            RMIconView(.gps, size: 14)
            if state != .good { Text(L.t("location." + state.rawValue)).rmText(.tab).lineLimit(2).frame(maxWidth: 170, alignment: .leading) }
        }
        .foregroundStyle(state == .good ? RM.Palette.positivo : RM.Palette.textoSecundario)
        .padding(.horizontal, 10).padding(.vertical, 6)
        .background(RM.Palette.fundoElevado, in: Capsule())
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(L.t("location." + state.rawValue))
        .accessibilityIdentifier("run-location-" + state.rawValue)
    }
}
