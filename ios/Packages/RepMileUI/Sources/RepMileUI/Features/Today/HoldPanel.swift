import CoachingPresentation
import SwiftUI

/// Hoje under a clinical hold (#99; Figma 72 `805:410` professional assessment, `805:492` urgent care). The screen's headline already carries
/// the instruction (`TodayContent`); this panel holds the card, the sports the engine holds, and the two actions in the Figma's order:
/// "Entendi" is the primary, "Declarar que estou pronto" a neutral secondary (fundo/elevado-2, 52 pt). The readiness declaration stays the
/// only way out of the hold and is always offered; nothing here starts, answers or writes anything.
///
/// "Entendi" acknowledges the instruction for this hold (in memory, per hold key): its button goes, the card, the headline and the
/// declaration stay. It never hides the urgent level.
struct HoldPanel: View {
    let plan: PlanView
    let guidance: ClinicalGuidance
    var declareReady: () -> Void
    @State private var acknowledged = false

    private var key: String { UrgentCareBanner.key(for: plan) }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            switch guidance {
            case .urgentCare:
                UrgentCareBanner(reportKept: true, underHeadline: true, announceKey: key)
            case .professionalAssessment:
                SafetyCard(title: L.t("hold.professional.title.interim"), message: L.t("hold.professional.body.interim"))
                    .accessibilityElement(children: .combine)
                    .accessibilityIdentifier("guidance-professional")
            }
            let sports = Self.heldSports(plan)
            if !sports.isEmpty {
                Text(L.t("hold.meanwhile")).rmText(.micro, RM.Palette.textoTerciario).padding(.top, 22)
                VStack(spacing: 0) {
                    ForEach(Array(sports.enumerated()), id: \.element) { i, sport in
                        if i > 0 { RMDivider() }
                        heldRow(sport)
                    }
                }
                .padding(.horizontal, 16).padding(.vertical, 2)
                .background(RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                .padding(.top, 10)
            }
            Text(L.t("hold.note")).rmText(.detalhe, RM.Palette.textoTerciario).fixedSize(horizontal: false, vertical: true).padding(.top, 10)
            VStack(spacing: 10) {
                if !acknowledged {
                    RMButton(L.t("hold.understood"), kind: .now) {
                        HoldAcknowledgement.acknowledge(key)
                        acknowledged = true
                    }
                    .accessibilityIdentifier("hold-understood")
                }
                RMButton(L.t("hold.declare"), kind: .neutral, action: declareReady)
                    .accessibilityIdentifier("hold-declare")
            }
            .padding(.top, 20)
        }
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("banner-blocked")
        .onAppear { acknowledged = HoldAcknowledgement.isAcknowledged(key) }
    }

    private func heldRow(_ sport: Sport) -> some View {
        HStack(spacing: 12) {
            RMIconView(sport.icon, size: 18).foregroundStyle(RM.Palette.textoSecundario)
            VStack(alignment: .leading, spacing: 2) {
                Text(L.t("hold.sport." + sport.rawValue)).rmText(.subtitulo)
                Text(L.t("hold.sport.detail")).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            RMIconView(.cadeado, size: 16).foregroundStyle(RM.Palette.textoTerciario)
        }
        .padding(.vertical, 12)
        .accessibilityElement(children: .combine)
        .accessibilityIdentifier("held-sport-" + sport.rawValue)
    }

    /// The sports the engine holds (`view.sports[*].state` BLOCKED or HELD), run first. Only what the view says: a sport it does not name
    /// is not listed, and none is listed when the view names none (the card and the headline still say that nothing is prescribed).
    static func heldSports(_ plan: PlanView) -> [Sport] {
        [Sport.run, .strength].filter { ["BLOCKED", "HELD"].contains(plan.sports[$0.rawValue]?.state.raw ?? "") }
    }
}

/// The holds whose instruction the athlete acknowledged with "Entendi" in this process. Nothing is persisted or sent: a new hold (another
/// key) asks again, and so does the next launch.
@MainActor
enum HoldAcknowledgement {
    private static var keys: Set<String> = []
    static func acknowledge(_ key: String) { keys.insert(key) }
    static func isAcknowledged(_ key: String) -> Bool { keys.contains(key) }
}
