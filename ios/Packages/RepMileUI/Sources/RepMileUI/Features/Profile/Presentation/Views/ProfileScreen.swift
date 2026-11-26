import CoachingPresentation
import SwiftUI

/// Perfil e ajustes (Figma page 70). Account, subscription, sync and feedback depend on the backend and are not in the parallel phase
/// (handoff §11). The privacy writes and the erase confirmation live in `ProfileViewModel`; this view renders them.
struct ProfileScreen: View {
    @Environment(AppModel.self) private var model
    @State private var viewModel: ProfileViewModel
    var openZones: () -> Void

    init(viewModel: ProfileViewModel, openZones: @escaping () -> Void) { _viewModel = State(initialValue: viewModel); self.openZones = openZones }

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
                            if viewModel.consentDone.contains(p) {
                                Text(L.t("profile.consent.done")).rmText(.detalhe, RM.Palette.positivo)
                            } else {
                                if viewModel.consentFailed.contains(p) {
                                    Text(L.t("profile.consent.failed")).rmText(.detalhe, RM.Palette.negativo).fixedSize(horizontal: false, vertical: true)
                                        .accessibilityIdentifier("consent-failed-\(p.rawValue)")
                                }
                                HStack(spacing: 8) {
                                    SecondaryPillButton(L.t("profile.consent.grant")) { Task { await viewModel.setConsent(p, granted: true) } }
                                    SecondaryPillButton(L.t("profile.consent.revoke")) { Task { await viewModel.setConsent(p, granted: false) } }
                                        .accessibilityIdentifier("consent-revoke-\(p.rawValue)")
                                }
                                .disabled(viewModel.isWriting)
                            }
                        }
                        .padding(16)
                        RMDivider()
                    }
                    Button { viewModel.confirm = .health } label: { ChevronRow(title: L.t("profile.eraseHealth"), detail: L.t("profile.eraseHealth.detail")).padding(16) }
                        .buttonStyle(.plain).disabled(viewModel.isWriting).accessibilityIdentifier("profile-erase-health")
                    RMDivider()
                    Button { viewModel.confirm = .account } label: {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(L.t("profile.eraseAccount")).rmText(.subtitulo, RM.Palette.negativo)
                            Text(L.t("profile.eraseAccount.detail")).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading).padding(16)
                    }
                    .buttonStyle(.plain).disabled(viewModel.isWriting).accessibilityIdentifier("profile-erase-account")
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
        .onChange(of: viewModel.consentFailed) { old, new in
            // VoiceOver hears a consent write that was not recorded (a failed revocation is a privacy fact), not only sees it.
            if !new.subtracting(old).isEmpty { AccessibilityNotification.Announcement(L.t("profile.consent.failed")).post() }
        }
        .confirmationDialog(viewModel.confirm == .account ? L.t("profile.eraseAccount.confirm") : L.t("profile.eraseHealth.confirm"),
                            isPresented: Binding(get: { viewModel.confirm != nil }, set: { if !$0 { viewModel.confirm = nil } }), titleVisibility: .visible) {
            Button(L.t("profile.erase"), role: .destructive) {
                let which = viewModel.confirm
                Task { await viewModel.erase(which) }
            }
            .disabled(viewModel.isWriting)
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
}
