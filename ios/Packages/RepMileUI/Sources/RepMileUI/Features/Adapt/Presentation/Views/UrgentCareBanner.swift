import Accessibility
import CoachingPresentation
import SwiftUI

/// The engine's URGENT_CARE_ADVISED level (#73), shown distinctly from and more prominently than the professional-assessment banner: a filled
/// safety card with a strong border, the urgent instruction as its title, and the blocked state as its label. Its copy is INTERIM
/// (CLINICAL_HUMAN_REQUIRED, G04): the engine's own interim wording, a care-seeking level only, never a diagnosis or a treatment.
/// VoiceOver reads it as one element, first in its container, and it is announced when it appears (a result that replaces a form is not
/// otherwise read until the athlete moves focus). A banner that stands for a hold (Today, session detail, the run screen) passes
/// `announceKey` (`key(for:)`): that urgent level is announced once, not at every reappearance of the screen; a result banner and the run
/// screen pass none (the run screen's banner appears once per gate).
struct UrgentCareBanner: View {
    let reportKept: Bool
    var actionTitle: String?
    var action: (() -> Void)?
    var announceKey: String?

    /// The urgent levels already announced in this process.
    @MainActor private static var announced: Set<String> = []

    /// One key per urgent level of a hold: its start, and the decision that set the urgent level when the view names it (the last decision,
    /// carrying URGENT_CARE_ADVISED). A hold that goes urgent, then professional (#79), then urgent again is announced again (QRE P3-c). When
    /// the last decision carries no urgent level (e.g. a later ASK), the key is the standing hold's: announced at most once more.
    static func key(for plan: PlanView) -> String {
        let last = plan.lastDecision
        let setBy = last?.guidance?.level.raw == ClinicalGuidance.urgentCode ? last?.decisionId ?? "" : "standing"
        return "hold:" + (plan.hold?.since ?? "") + ":" + setBy
    }

    /// Whether an appearance with `key` announces: always without a key; with one, only the first time.
    @MainActor static func claimAnnouncement(_ key: String?) -> Bool {
        guard let key else { return true }
        return announced.insert(key).inserted
    }

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
            // After the screen change settles, so the announcement is not cut by VoiceOver's own reading of the new screen. A banner gone
            // before that (the task cancelled) announces nothing.
            guard (try? await Task.sleep(for: .milliseconds(700))) != nil else { return }
            guard Self.claimAnnouncement(announceKey) else { return }
            var spoken = AttributedString(title + ". " + message)
            spoken.accessibilitySpeechAnnouncementPriority = .high
            AccessibilityNotification.Announcement(spoken).post()
        }
    }
}
