import Accessibility
import SwiftUI

/// The engine's URGENT_CARE_ADVISED level (#73), shown distinctly from and more prominently than the professional-assessment banner: a filled
/// safety card with a strong border, the urgent instruction as its title, and the blocked state as its label. Its copy is INTERIM
/// (CLINICAL_HUMAN_REQUIRED, G04): the engine's own interim wording, a care-seeking level only, never a diagnosis or a treatment.
/// VoiceOver reads it as one element, first in its container, and it is announced when it appears (a result that replaces a form is not
/// otherwise read until the athlete moves focus).
struct UrgentCareBanner: View {
    let reportKept: Bool
    var actionTitle: String?
    var action: (() -> Void)?

    private var title: String { L.t("state.blocked.urgent.title.interim") }
    private var message: String { L.t(reportKept ? "state.blocked.urgent.body.interim" : "state.blocked.urgent.body.interim.reportNotKept") }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 8) {
                    RMIconView(.pausa, size: 18).foregroundStyle(RM.Palette.negativo)
                    Text(L.t("state.blocked.title")).rmText(.micro, RM.Palette.negativo)
                }
                Text(title).rmText(.titulo).fixedSize(horizontal: false, vertical: true)
                Text(message).rmText(.corpo).fixedSize(horizontal: false, vertical: true)
            }
            .accessibilityElement(children: .combine)
            .accessibilityAddTraits(.isHeader)
            .accessibilitySortPriority(1)
            .accessibilityIdentifier("guidance-urgent")
            if let actionTitle, let action {
                Button(action: action) {
                    Text(actionTitle).rmText(.rotulo, RM.Palette.agoraSobre)
                        .frame(maxWidth: .infinity, minHeight: 44)
                        .background(RM.Palette.agora, in: Capsule())
                }
                .buttonStyle(PressableStyle())
            }
        }
        .padding(RM.Space.card)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RM.Palette.negativoSuave, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 24, style: .continuous).strokeBorder(RM.Palette.negativo, lineWidth: 2))
        .accessibilityElement(children: .contain)
        .task {
            // After the screen change settles, so the announcement is not cut by VoiceOver's own reading of the new screen.
            try? await Task.sleep(for: .milliseconds(700))
            var spoken = AttributedString(title + ". " + message)
            spoken.accessibilitySpeechAnnouncementPriority = .high
            AccessibilityNotification.Announcement(spoken).post()
        }
    }
}
