import CoachingPresentation
import SwiftUI

/// The centre "+" of the tab bar (Figma `543:1296`): start an unplanned run now, or log a workout already done.
struct AddWorkoutSheet: View {
    @Environment(\.dismiss) private var dismiss
    var startRun: () -> Void
    var logStrength: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(L.t("add.title")).rmText(.titulo)
            PrimaryActionButton(L.t("add.runNow"), icon: .corrida, fill: RM.Palette.acaoCorrida, textColor: RM.Palette.acaoCorridaTexto) { dismiss(); startRun() }
                .accessibilityIdentifier("add-run-now")
            SecondaryPillButton(L.t("add.logDone") + " · " + L.t("add.logStrength"), icon: .forca) { dismiss(); logStrength() }
                .accessibilityIdentifier("add-log-strength")
            Spacer()
        }
        .padding(RM.Space.gutter)
        .presentationDetents([.height(260)])
        .presentationBackground(RM.Palette.fundoElevado)
        .accessibilityElement(children: .contain).accessibilityIdentifier("sheet-add")
    }
}

/// "Algo mudou na sua semana?": the adaptation entries that exist in V1 (Figma 72). Each opens its own flow; nothing changes on its own.
struct ChangesSheet: View {
    @Environment(\.dismiss) private var dismiss
    var notFeeling100: () -> Void
    var readiness: () -> Void
    let blocked: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(L.t("changes.title")).rmText(.titulo).padding(.bottom, 8)
            if blocked {
                Button { dismiss(); readiness() } label: { ChevronRow(title: L.t("readiness.title"), detail: L.t("readiness.note")).padding(.vertical, 10) }
                    .buttonStyle(.plain).accessibilityIdentifier("changes-readiness")
            } else {
                Button { dismiss(); notFeeling100() } label: { ChevronRow(title: L.t("changes.notFeeling"), detail: L.t("changes.notFeeling.detail")).padding(.vertical, 10) }
                    .buttonStyle(.plain).accessibilityIdentifier("changes-not-feeling")
                RMDivider()
                ChevronRow(title: L.t("changes.cantDay"), detail: L.t("changes.cantDay.detail")).padding(.vertical, 10).opacity(0.8)
            }
            Spacer()
        }
        .padding(RM.Space.gutter)
        .presentationDetents([.medium])
        .presentationBackground(RM.Palette.fundoElevado)
        .accessibilityElement(children: .contain).accessibilityIdentifier("sheet-changes")
    }
}
