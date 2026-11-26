import CoachingPresentation
import SwiftUI

/// Execução de força (Figma page 41) and "Força avulsa". Reps start from the prescription; the load field starts EMPTY: no suggested number in
/// the session (GAP-10); the prescribed mode (establish, bodyweight…) and the athlete's previous load are shown as context. The report keeps
/// the unit and convention as logged (never converted). An unplanned report carries `observedAt` (FND-ABC-01); "salvo" only after `kept`.
struct StrengthLogView: View {
    struct SetDraft: Equatable { var reps: Int; var load: String; var rir: Double? }
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    /// nil = unplanned strength.
    let session: PlannedSession?
    @State private var drafts: [String: [SetDraft]] = [:]
    @State private var minutes: Double?
    @State private var startedAt = Date()
    @State private var result: RunReportViewModel.Result?
    @State private var sending = false

    private var exercises: [PrescribedExercise] { session?.prescription?.exercises ?? [] }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    ForEach(exercises, id: \.id) { e in exerciseBlock(e) }
                    Stepper(value: Binding(get: { minutes ?? 0 }, set: { minutes = $0 }), in: 0...300, step: 5) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(L.t("strength.minutes")).rmText(.detalhe, RM.Palette.textoSecundario)
                            Text(minutes.map { L.f("common.minutes", Fmt.minutes($0)) } ?? "–").rmText(.numeroM)
                        }
                    }
                    .accessibilityIdentifier("strength-minutes")
                    switch result {
                    case .saved?: Label { Text(L.t("report.saved")).rmText(.subtitulo) } icon: { RMIconView(.check, size: 18).foregroundStyle(RM.Palette.positivo) }.accessibilityIdentifier("strength-saved")
                    case .notKept?: Text(L.t("report.notKept")).rmText(.detalhe, RM.Palette.negativo).accessibilityIdentifier("strength-not-kept")
                    case .failed?: Text(L.t("state.opError.body")).rmText(.detalhe, RM.Palette.negativo)
                    default: EmptyView()
                    }
                    PrimaryActionButton(result == .notKept ? L.t("report.resend") : L.t("report.save"), icon: .check, fill: RM.Palette.acaoForca, textColor: RM.Palette.acaoForcaTexto,
                                        enabled: !sending && result != .saved && (minutes ?? 0) > 0) { Task { await send() } }
                        .accessibilityIdentifier("strength-save")
                    if result == .saved { SecondaryPillButton(L.t("common.close")) { dismiss() } }
                }
                .padding(RM.Space.gutter)
            }
            .background(RM.Palette.fundoApp.ignoresSafeArea())
            .navigationTitle(session.map(TodayContent.title) ?? L.t("add.title")).navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button { dismiss() } label: { RMIconView(.fechar, size: 18) }.accessibilityLabel(L.t("common.close")) } }
        }
        .onAppear {
            startedAt = Date()
            // Reps start from the prescribed target for the athlete to adjust; RIR is not asked here, so none is stated.
            for e in exercises where drafts[e.id] == nil { drafts[e.id] = Array(repeating: SetDraft(reps: e.reps ?? 0, load: "", rir: nil), count: e.sets) }
        }
        .accessibilityElement(children: .contain).accessibilityIdentifier("screen-strength-log")
    }

    private func exerciseBlock(_ e: PrescribedExercise) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            ExerciseRow(exercise: e, previous: nil)
            ForEach(Array((drafts[e.id] ?? []).enumerated()), id: \.offset) { i, _ in
                HStack(spacing: 10) {
                    Text("\(i + 1)").rmText(.rotulo, RM.Palette.textoSecundario).frame(width: 20)
                    Stepper(value: binding(e.id, i, \.reps), in: 0...50) { Text("\(drafts[e.id]?[i].reps ?? 0)").rmText(.numeroS) }
                        .frame(width: 140)
                    if e.load?.mode.raw != "BODYWEIGHT" {
                        TextField("kg", text: binding(e.id, i, \.load))
                            .keyboardType(.decimalPad)
                            .rmText(.numeroS)
                            .padding(.horizontal, 10).frame(height: 36)
                            .background(RM.Palette.fundoElevado2, in: RoundedRectangle(cornerRadius: 8))
                            .accessibilityIdentifier("load-\(e.id)-\(i)")
                    }
                }
            }
        }
        .padding(.bottom, 8)
    }

    private func binding<T>(_ id: String, _ i: Int, _ path: WritableKeyPath<SetDraft, T>) -> Binding<T> {
        Binding(get: { drafts[id]![i][keyPath: path] }, set: { drafts[id]![i][keyPath: path] = $0 })
    }

    /// The report exactly as the shared types encode it: sets with reps, an optional load as logged (KG, the prescription's convention).
    func actual() -> StrengthActual {
        let ex = exercises.map { e in
            LoggedExerciseEntry(id: e.id, sets: (drafts[e.id] ?? []).map { d in
                let value = Double(d.load.replacingOccurrences(of: ",", with: "."))
                let convention = e.load?.mode.raw == "BODYWEIGHT" ? LoadConvention.bodyweight : LoadConvention(rawValue: e.load?.convention?.raw ?? "") ?? .total
                let load: LoggedLoadEntry? = e.load?.mode.raw == "BODYWEIGHT" ? nil : value.map { LoggedLoadEntry(value: $0, unit: .kg, convention: convention) }
                return LoggedSetEntry(reps: d.reps, load: load, rir: d.rir)
            })
        }
        return StrengthActual(completed: true, minutes: minutes, exercises: ex)
    }

    private func send() async {
        sending = true; defer { sending = false }
        let end = RunReportViewModel.instant(Date())
        let obs: AthleteObservation = session.map {
            .plannedStrength(sessionId: $0.id, occurrenceDate: $0.date, observedAt: end, actual: actual(), response: .unknown)
        } ?? .unplannedStrength(occurrenceDate: model.plan?.today ?? Fmt.deviceDay(Date()), observedAt: end, actual: actual(), response: .unknown)
        let out = await model.writer.submit(ReviewRequest(.sessionReports([obs]), eligibility: nil))
        guard out.answer.ok else { result = .failed(out.answer.error?.code.raw ?? ""); return }
        let kept = out.answer.recorded?.first.map { out.kept.contains($0) } ?? false
        withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) { result = kept ? .saved : .notKept }
    }
}
