import CoachingPresentation
import RunRecorder
import SwiftUI

/// Perfil e ajustes (Figma page 70). Account, subscription, sync and feedback depend on the backend and are not in the parallel phase
/// (handoff §11). Erasing the account reaches every layer this front owns (the run recordings) and the record (`eraseAccount`); erasing
/// health facts is never readiness.
struct ProfileScreen: View {
    @Environment(AppModel.self) private var model
    @Environment(RunRecorder.self) private var recorder
    var openZones: () -> Void
    @State private var confirm: Confirm?
    @State private var consentDone: Set<String> = []
    enum Confirm: String, Identifiable { case health, account; var id: String { rawValue } }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                HStack(spacing: 14) {
                    FocusRingAvatar(initials: model.initials).scaleEffect(1.6).frame(width: 60, height: 60)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(model.athleteName).rmText(.titulo)
                        if let p = model.plan { Text(L.f("plan.week.title", "\(p.weekIndex + 1)", "\(p.weeks)")).rmText(.detalhe, RM.Palette.textoSecundario) }
                    }
                }
                .padding(.top, 8)

                section(L.t("profile.training")) {
                    Button(action: openZones) { ChevronRow(title: L.t("profile.hrZones"), detail: L.t("profile.hrZones.detail")).padding(16) }
                        .buttonStyle(.plain).accessibilityIdentifier("profile-hr-zones")
                }
                if let h = model.healthStatus { HealthStatusRow(status: h) }
                section(L.t("profile.privacy")) {
                    ForEach(ConsentPurpose.allCases, id: \.self) { p in
                        VStack(alignment: .leading, spacing: 8) {
                            Text(L.t("profile.consent." + p.rawValue)).rmText(.subtitulo)
                            Text(L.t("profile.consent." + p.rawValue + ".detail")).rmText(.detalhe, RM.Palette.textoSecundario)
                            if consentDone.contains(p.rawValue) {
                                Text(L.t("profile.consent.done")).rmText(.detalhe, RM.Palette.positivo)
                            } else {
                                HStack(spacing: 8) {
                                    SecondaryPillButton(L.t("profile.consent.grant")) { Task { await consent(p, true) } }
                                    SecondaryPillButton(L.t("profile.consent.revoke")) { Task { await consent(p, false) } }
                                        .accessibilityIdentifier("consent-revoke-\(p.rawValue)")
                                }
                            }
                        }
                        .padding(16)
                        RMDivider()
                    }
                    Button { confirm = .health } label: { ChevronRow(title: L.t("profile.eraseHealth"), detail: L.t("profile.eraseHealth.detail")).padding(16) }
                        .buttonStyle(.plain).accessibilityIdentifier("profile-erase-health")
                    RMDivider()
                    Button { confirm = .account } label: {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(L.t("profile.eraseAccount")).rmText(.subtitulo, RM.Palette.negativo)
                            Text(L.t("profile.eraseAccount.detail")).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading).padding(16)
                    }
                    .buttonStyle(.plain).accessibilityIdentifier("profile-erase-account")
                }
                section(L.t("profile.about")) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(L.t("profile.language")).rmText(.subtitulo)
                        Text(L.t("profile.language.detail")).rmText(.detalhe, RM.Palette.textoSecundario)
                    }
                    .padding(16)
                    RMDivider()
                    Text(L.t("profile.synthetic")).rmText(.detalhe, RM.Palette.marco).padding(16).accessibilityIdentifier("profile-synthetic")
                }
            }
            .padding(.horizontal, RM.Space.gutter)
            .padding(.bottom, 40)
        }
        .scrollIndicators(.hidden)
        .accessibilityIdentifier("screen-profile")
        .background(RM.Palette.fundoApp.ignoresSafeArea())
        .navigationTitle(L.t("profile.title")).navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(RM.Palette.fundoApp, for: .navigationBar)
        .confirmationDialog(confirm == .account ? L.t("profile.eraseAccount.confirm") : L.t("profile.eraseHealth.confirm"),
                            isPresented: Binding(get: { confirm != nil }, set: { if !$0 { confirm = nil } }), titleVisibility: .visible) {
            Button(L.t("profile.erase"), role: .destructive) {
                let which = confirm
                Task { if which == .account { await eraseAccount() } else { await eraseHealth() } }
            }
            .accessibilityIdentifier("profile-erase-confirm")
        }
    }

    private func section<Content: View>(_ title: String, @ViewBuilder _ content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title).rmText(.micro, RM.Palette.textoTerciario)
            VStack(alignment: .leading, spacing: 0) { content() }
                .background(RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        }
    }

    private func consent(_ p: ConsentPurpose, _ granted: Bool) async {
        let out = await model.writer.setConsent(p, granted: granted)
        if out.answer.ok { consentDone.insert(p.rawValue) }
    }
    private func eraseHealth() async {
        _ = await model.writer.eraseHealthFacts(eventIds: [])
        await model.load()
    }
    /// G07: the record and this front's own layer (run recordings and their index). B's queue is purged by A's composition root.
    private func eraseAccount() async {
        let out = await model.writer.eraseAccount()
        if out.answer.ok { recorder.eraseAllRecordings(); await model.accountErased() }
    }
}
