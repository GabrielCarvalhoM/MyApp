import Accessibility
import CoachingPresentation
import SwiftUI

/// The engine's URGENT_CARE_ADVISED level (#73), shown distinctly from the professional-assessment card: the "URGENTE" label in
/// estado/negativo, the only red of a hold (Figma 72 `805:492`, #99). Its copy is INTERIM (CLINICAL_HUMAN_REQUIRED, G04, #87): a
/// care-seeking level only, never a diagnosis or a treatment. The card is opaque (fundo/elevado, outlined in "agora"), so no light shows
/// through it (#99 H1).
///
/// `underHeadline`: on Hoje the screen's headline is the urgent instruction (#99), and the card names the emergency line and that the app
/// does not diagnose. Elsewhere (a flow's result, the session, the run) the card carries the instruction itself, as before.
/// VoiceOver reads it as one element, first in its container, and it is announced when it appears (a result that replaces a form is not
/// otherwise read until the athlete moves focus). A banner that stands for a hold (Today, session detail, the run screen) passes
/// `announceKey` (`key(for:)`): that urgent level is announced once, not at every reappearance of the screen; a result banner and the run
/// screen pass none (the run screen's banner appears once per gate).
struct UrgentCareBanner: View {
    let reportKept: Bool
    var underHeadline = false
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

    private var title: String { L.t(underHeadline ? "hold.urgent.title.interim" : "state.blocked.urgent.title.interim") }
    private var message: String {
        if underHeadline { return L.t("hold.urgent.body.interim") }
        return L.t(reportKept ? "state.blocked.urgent.body.interim" : "state.blocked.urgent.body.interim.reportNotKept")
    }
    /// What VoiceOver announces: on Hoje the headline's instruction first, so the announcement never lacks it.
    private var spoken: String { (underHeadline ? L.t("today.hero.urgent.interim") + ". " : "") + title + ". " + message }

    var body: some View {
        // A container around the one combined element, so an identifier a caller puts on the banner (e.g. "session-urgent") never replaces
        // "guidance-urgent".
        VStack(spacing: 0) {
            SafetyCard(label: L.t("hold.urgent.label"), title: title, message: message, prominent: !underHeadline)
                .accessibilityElement(children: .combine)
                .accessibilityAddTraits(.isHeader)
                .accessibilityIdentifier("guidance-urgent")
        }
        .accessibilityElement(children: .contain)
        .accessibilitySortPriority(1)
        .task {
            // After the screen change settles, so the announcement is not cut by VoiceOver's own reading of the new screen. A banner gone
            // before that (the task cancelled) announces nothing.
            guard (try? await Task.sleep(for: .milliseconds(700))) != nil else { return }
            guard Self.claimAnnouncement(announceKey) else { return }
            var text = AttributedString(spoken)
            text.accessibilitySpeechAnnouncementPriority = .high
            AccessibilityNotification.Announcement(text).post()
        }
    }
}

/// The outlined card of a hold (Figma 72 `805:451` / `805:518`): fundo/elevado, opaque, 1.5 pt "agora" outline, radius 20. An optional micro
/// label in estado/negativo (only the urgent level has one), the instruction, then the detail. `prominent` keeps the larger type where the
/// card stands alone (a flow's result, the run screen) and no headline carries the instruction.
struct SafetyCard: View {
    var label: String?
    let title: String
    let message: String
    var prominent = false

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            if let label { Text(label).rmText(.micro, RM.Palette.negativo) }
            Text(title).rmText(prominent ? .titulo : .subtitulo).fixedSize(horizontal: false, vertical: true)
            Text(message).rmText(prominent ? .corpo : .detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
                .padding(.top, prominent ? 4 : 0)
        }
        .padding(.horizontal, 16).padding(.vertical, 14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 20, style: .continuous).strokeBorder(RM.Palette.agora, lineWidth: 1.5))
    }
}
