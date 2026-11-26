import CoachingPresentation
import SwiftUI

/// Informar a máxima / personalizar limites: renders `HeartRateZonesViewModel` (fields, the engine's answer as copy, erase when the athlete
/// has something of their own in force).
struct HeartRateProfileEditor: View {
    @Environment(\.dismiss) private var dismiss
    @State private var viewModel: HeartRateZonesViewModel
    let current: HeartRateFiveZones?

    init(viewModel: HeartRateZonesViewModel, current: HeartRateFiveZones?) { _viewModel = State(initialValue: viewModel); self.current = current }

    var body: some View {
        @Bindable var vm = viewModel
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    if viewModel.mode == .maximum {
                        field(L.t("hr.max.field"), $vm.maximum, id: "hr-max-field")
                    } else {
                        ForEach(0..<4, id: \.self) { i in field(L.f("hr.limit.field", "Z\(i + 1)"), $vm.limits[i], id: "hr-limit-\(i + 1)") }
                    }
                    if let m = viewModel.message { Text(L.t(m.key)).rmText(.detalhe, m.ok ? RM.Palette.positivo : RM.Palette.negativo).accessibilityIdentifier("hr-message") }
                    PrimaryActionButton(L.t("hr.save"), icon: .check, enabled: viewModel.canSave) { Task { await viewModel.save() } }.accessibilityIdentifier("hr-save")
                    if HeartRateZonesViewModel.offersErase(current) {
                        Button(role: .destructive) { Task { await viewModel.erase() } } label: { Text(L.t("hr.erase")).rmText(.rotulo, RM.Palette.negativo) }
                            .disabled(viewModel.activity != .idle)
                            .accessibilityIdentifier("hr-erase")
                    }
                }
                .padding(RM.Space.gutter)
            }
            .background(RM.Palette.fundoApp.ignoresSafeArea())
            .navigationTitle(viewModel.mode == .maximum ? L.t("hr.enterMax") : L.t("hr.customize")).navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button { dismiss() } label: { RMIconView(.fechar, size: 18) }.accessibilityLabel(L.t("common.close")) } }
        }
    }

    private func field(_ label: String, _ text: Binding<String>, id: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label).rmText(.detalhe, RM.Palette.textoSecundario)
            TextField("", text: text).keyboardType(.numberPad).rmText(.numeroM)
                .padding(12).background(RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 12)).accessibilityIdentifier(id)
        }
    }
}
