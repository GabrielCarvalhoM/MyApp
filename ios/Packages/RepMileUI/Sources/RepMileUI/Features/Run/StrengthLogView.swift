import CoachingPresentation
import SwiftUI

/// Execução de força (Figma page 41) and "Força avulsa". State, rules and the write live in `StrengthLogViewModel`; this view renders
/// them. Every set starts unstated (#37): the athlete confirms "Fiz como prescrito", checks a set as prescribed or gives its repetitions;
/// only those sets are recorded. The load field starts EMPTY: no suggested number in the session (GAP-10); the prescribed mode (establish,
/// bodyweight…) is shown as context. The log asks the eligibility screen itself (#68); an answer that routes to a human shows the existing
/// safety state (INTERIM copy) with no "Reenviar" invitation; the form stays editable, so a mis-tap can be corrected (SSCTR #68 C5).
struct StrengthLogView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var viewModel: StrengthLogViewModel

    init(viewModel: StrengthLogViewModel) { _viewModel = State(initialValue: viewModel) }

    var body: some View {
        @Bindable var vm = viewModel
        return NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    if !viewModel.exercises.isEmpty {
                        Text(L.t("strength.hint")).rmText(.detalhe, RM.Palette.textoSecundario)
                        if viewModel.canConfirmAsPrescribed {
                            SecondaryPillButton(L.t("strength.asPrescribed"), icon: .check) { viewModel.confirmAsPrescribed() }
                                .accessibilityIdentifier("strength-as-prescribed")
                        }
                    }
                    ForEach(viewModel.exercises, id: \.id) { e in exerciseBlock(e) }
                    Stepper(value: Binding(get: { vm.minutes ?? 0 }, set: { vm.minutes = $0 }), in: 0...300, step: 5) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(L.t("strength.minutes")).rmText(.detalhe, RM.Palette.textoSecundario)
                            Text(viewModel.minutes.map { L.f("common.minutes", Fmt.minutes($0)) } ?? "–").rmText(.numeroM)
                        }
                    }
                    .disabled(!viewModel.editable)
                    .accessibilityIdentifier("strength-minutes")
                    if viewModel.editable {
                        EligibilityForm(screen: $vm.eligibility)
                        Text(L.t("ob.eligibility.body")).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
                    }
                    resultView
                    if !viewModel.exercises.isEmpty, viewModel.statedSetCount == 0 {
                        Text(L.t("strength.needsSet")).rmText(.detalhe, RM.Palette.textoSecundario).accessibilityIdentifier("strength-needs-set")
                    }
                    PrimaryActionButton(viewModel.phase == .notKept && !viewModel.clinical ? L.t("report.resend") : L.t("report.save"), icon: .check, fill: RM.Palette.acaoForca,
                                        textColor: RM.Palette.acaoForcaTexto, enabled: viewModel.canSend) { Task { await viewModel.send() } }
                        .accessibilityIdentifier("strength-save")
                    if viewModel.phase == .saved { SecondaryPillButton(L.t("common.close")) { dismiss() } }
                }
                .padding(RM.Space.gutter)
            }
            .background(RM.Palette.fundoApp.ignoresSafeArea())
            .navigationTitle(viewModel.session.map(TodayContent.title) ?? L.t("add.title")).navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button { dismiss() } label: { RMIconView(.fechar, size: 18) }.accessibilityLabel(L.t("common.close")) } }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.7), value: viewModel.phase)
        .accessibilityElement(children: .contain).accessibilityIdentifier("screen-strength-log")
    }

    @ViewBuilder private var resultView: some View {
        switch viewModel.phase {
        case .saved: Label { Text(L.t("report.saved")).rmText(.subtitulo) } icon: { RMIconView(.check, size: 18).foregroundStyle(RM.Palette.positivo) }.accessibilityIdentifier("strength-saved")
        case .notKept:
            Text(L.t(viewModel.clinical ? "report.clinical.notKept" : "report.notKept")).rmText(.detalhe, RM.Palette.negativo).accessibilityIdentifier("strength-not-kept")
        case .failed: Text(L.t("state.opError.body")).rmText(.detalhe, RM.Palette.negativo).accessibilityIdentifier("strength-failed")
        case .editing, .submitting: EmptyView()
        }
        if let g = viewModel.clinicalGuidance { ClinicalRouteBanner(reportKept: viewModel.phase == .saved, guidance: g).accessibilityIdentifier("strength-blocked") }
    }

    private func exerciseBlock(_ e: PrescribedExercise) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            ExerciseRow(exercise: e, previous: nil)
            ForEach(Array((viewModel.sets[e.id] ?? []).indices), id: \.self) { i in setRow(e, i) }
        }
        .padding(.bottom, 8)
    }

    private func setRow(_ e: PrescribedExercise, _ i: Int) -> some View {
        let reps = viewModel.draft(e.id, i)?.reps
        let stated = reps.map { $0 == 1 ? L.t("strength.set.doneOneRep") : L.f("strength.set.doneReps", "\($0)") } ?? L.t("strength.set.notDone")
        let name = L.code("exercise", Code(raw: e.id)) ?? e.id
        return HStack(spacing: 10) {
            Text("\(i + 1)").rmText(.rotulo, RM.Palette.textoSecundario).frame(width: 20)
            Button { viewModel.toggleSet(e, i) } label: {
                RMIconView(.check, size: 16)
                    .foregroundStyle(reps != nil ? RM.Palette.acaoForcaTexto : RM.Palette.textoTerciario)
                    .frame(width: 36, height: 36)
                    .background(reps != nil ? RM.Palette.acaoForca : RM.Palette.fundoElevado2, in: Circle())
                    .frame(width: 44, height: 44)
                    .contentShape(Rectangle())
            }
            .buttonStyle(PressableStyle())
            .disabled(!viewModel.canToggle(e, i))
            .accessibilityLabel(L.f("strength.set", name, "\(i + 1)"))
            .accessibilityValue(stated)
            .accessibilityIdentifier("set-\(e.id)-\(i)")
            Stepper(value: Binding(get: { reps ?? 0 }, set: { viewModel.setReps($0, e.id, i) }), in: 0...50) {
                Text(reps.map(String.init) ?? "–").rmText(.numeroS)
            }
            .frame(width: 140)
            .disabled(!viewModel.editable)
            .accessibilityLabel(L.f("strength.reps.label", name, "\(i + 1)"))
            .accessibilityValue(reps.map(String.init) ?? L.t("strength.set.notDone"))
            .accessibilityIdentifier("reps-\(e.id)-\(i)")
            if e.load?.mode.raw != "BODYWEIGHT" {
                // The load belongs to a stated set: off until the set is stated, and typing it never states the set.
                TextField("kg", text: Binding(get: { viewModel.draft(e.id, i)?.load ?? "" }, set: { viewModel.setLoad($0, e.id, i) }))
                    .keyboardType(.decimalPad)
                    .rmText(.numeroS)
                    .padding(.horizontal, 10).frame(height: 36)
                    .background(RM.Palette.fundoElevado2, in: RoundedRectangle(cornerRadius: 8))
                    .disabled(!viewModel.editable || reps == nil)
                    .opacity(reps == nil ? 0.5 : 1)
                    .accessibilityIdentifier("load-\(e.id)-\(i)")
            }
        }
    }
}
