import SwiftUI

/// The screens around the write (Figma 10): 30 Montando (`837:1059`), the outcomes (`838:3972`, `838:4011`, `838:4053`, `838:3689`) and
/// Retomar (`838:3918`). Copy that would be untrue with the local engine is left out (D23: "falha de conexão do nosso lado", "a montagem
/// continua"); a held action renders disabled (D24).
struct OnboardingBuildingView: View {
    let draft: OnboardingDraft
    let animate: Bool
    /// Debug captures of the in-progress state (`-onboardingPhase buildingProgress`): rows done, the next one loading.
    var shownAtStart: Int?
    @State private var shown = 0

    var body: some View {
        let rows: [(String, String?)] = [("ob.building.goal", OBText.goal(draft)), ("ob.building.start", OBText.start(draft)),
                                         ("ob.building.days", OBText.days(draft)), ("ob.building.coordinating", OBText.sharedDays(draft).first)]
            .filter { $0.1 != nil }
        VStack(alignment: .leading, spacing: 0) {
            OBNavigation(stage: 4, progress: 0.75, showsBack: false) {}
            ScrollView {
            VStack(alignment: .leading, spacing: 0) {
            OBWeekArt(run: draft.runDays, strength: draft.strengthDays, longRun: draft.longRunDay).padding(.top, 28)
            VStack(alignment: .leading, spacing: 8) {
                Text(L.t("ob.stage.4")).rmText(.micro, RM.Palette.textoTerciario)
                Text(L.t("ob.building.title")).rmText(.manchete).fixedSize(horizontal: false, vertical: true)
            }
            .padding(.horizontal, RM.Space.gutter).padding(.top, 20)
            VStack(alignment: .leading, spacing: 16) {
                ForEach(Array(rows.enumerated()), id: \.offset) { i, row in
                    HStack(alignment: .top, spacing: 14) {
                        Group {
                            if i < shown { RMIconView(.check, size: 16).foregroundStyle(RM.Palette.positivo) }
                            else if i == shown { ProgressView().controlSize(.small).tint(RM.Palette.textoSecundario) }
                            else { Color.clear }
                        }
                        .frame(width: 18, height: 18)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(L.t(row.0)).rmText(.subtitulo, i <= shown ? RM.Palette.textoPrimario : RM.Palette.textoTerciario)
                            Text(row.1 ?? "").rmText(.detalhe, i <= shown ? RM.Palette.textoSecundario : RM.Palette.textoTerciario)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                }
            }
            .padding(.horizontal, RM.Space.gutter).padding(.top, 20)
            OBFootnote(text: L.t("ob.building.note"))
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            }
            .scrollIndicators(.hidden).obScrollAnchor()
        }
        .accessibilityElement(children: .contain).accessibilityIdentifier("ob-building")
        .task {
            if let shownAtStart { shown = shownAtStart; return }
            guard animate else { shown = rows.count; return }
            for i in 1...max(1, rows.count) { try? await Task.sleep(for: .milliseconds(380)); withAnimation(.easeOut(duration: 0.2)) { shown = i } }
        }
    }
}

struct OnboardingOutcomeView: View {
    let outcome: OnboardingViewModel.Outcome
    let draft: OnboardingDraft
    let retry: () -> Void
    let review: () -> Void
    var leave: () -> Void = {}

    var body: some View {
        switch outcome {
        case .notBuilt:
            frame(art: .blurred, eyebrow: nil, title: "ob.notBuilt.title", body: [L.t("ob.notBuilt.body")], id: "ob-not-built") {
                OBPrimaryButton(title: L.t("ob.notBuilt.retry"), id: "ob-retry", action: retry)
                OBSecondaryButton(title: L.t("ob.notBuilt.review"), id: "ob-review", action: review)
            }
        case .missingAnswer:
            VStack(alignment: .leading, spacing: 0) {
                OBNavigation(stage: 4, progress: 0.75, back: review, close: leave)
                OBQuestion(stage: 4, title: L.t("ob.missing.title"))
                // The shared-day question drawn here waits for D10; the engine's other missing answers are asked on their own step (back).
                OBFootnote(text: L.t("ob.missing.note"))
                Spacer()
                OBPrimaryButton(title: L.t("ob.data.build"), enabled: false, id: "ob-build") {}.padding(.horizontal, RM.Space.gutter).padding(.bottom, 8)
            }
            .accessibilityElement(children: .contain).accessibilityIdentifier("ob-missing")
        case .outsideScope(let scope):
            // The engine's scope decides the sentences (QRE P3-7): the gestation body only for the special population, the age line only
            // for the age; an event distance outside V1 gets the title alone (its own sentence is #120's).
            frame(art: .ghost, eyebrow: nil, title: "ob.outside.title", body: scope == .specialPopulation ? [L.t("ob.outside.body")] : [],
                  note: scope == .age || scope == .specialPopulation ? L.t("ob.outside.age") : nil, id: "ob-outside") {
                OBPrimaryButton(title: L.t("ob.outside.ok"), enabled: false, id: "ob-outside-ok") {}
                OBSecondaryButton(title: L.t("ob.outside.review"), id: "ob-review", action: review)
            }
        case .heldForSafety:
            frame(art: .ghost, eyebrow: L.t("ob.held.eyebrow"), title: "ob.held.title", body: [L.t("ob.held.body")], steps: ["ob.held.step1", "ob.held.step2", "ob.held.step3"],
                  id: "ob-held") {
                OBPrimaryButton(title: L.t("ob.held.ok"), enabled: false, id: "ob-held-ok") {}
                OBSecondaryButton(title: L.t("ob.held.declare"), enabled: false, id: "ob-held-declare") {}
            }
        }
    }

    private enum Art { case ghost, blurred }

    private func frame<A: View>(art: Art, eyebrow: String?, title: String, body: [String], note: String? = nil, steps: [String] = [], id: String,
                                @ViewBuilder actions: () -> A) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            ScrollView {
                VStack(alignment: .leading, spacing: 12) {
                    Group {
                        if art == .ghost { OBWeekArt(run: [1, 3, 5, 6], strength: [0, 2, 3], longRun: 5, style: .ghost) }
                        else { OBWeekArt(run: [0, 2, 4, 5], strength: [1, 2, 6], longRun: 4, showsLetters: false).blur(radius: 6).overlay(RMIconView(.fechar, size: 18).foregroundStyle(RM.Palette.negativo)) }
                    }
                    .padding(.top, 56).padding(.bottom, 12)
                    if let eyebrow {
                        HStack(spacing: 6) { RMIconView(.cadeado, size: 12); Text(eyebrow).rmText(.micro) }.foregroundStyle(RM.Palette.textoPrimario).padding(.horizontal, RM.Space.gutter)
                    }
                    Text(L.t(title)).rmText(.manchete).fixedSize(horizontal: false, vertical: true).padding(.horizontal, RM.Space.gutter).accessibilityAddTraits(.isHeader)
                    ForEach(body, id: \.self) { Text($0).rmText(.corpo, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true).padding(.horizontal, RM.Space.gutter) }
                    if let note { Text(note).rmText(.detalhe, RM.Palette.textoTerciario).fixedSize(horizontal: false, vertical: true).padding(.horizontal, RM.Space.gutter).padding(.top, 4) }
                    if !steps.isEmpty {
                        OBGroup {
                            ForEach(Array(steps.enumerated()), id: \.offset) { i, k in
                                if i > 0 { RMDivider() }
                                HStack(alignment: .top, spacing: 14) {
                                    Text("\(i + 1)").rmText(.rotulo).frame(width: 24, height: 24).background(RM.Palette.fundoElevado2, in: Circle())
                                    Text(L.t(k)).rmText(.detalhe).fixedSize(horizontal: false, vertical: true).frame(maxWidth: .infinity, alignment: .leading)
                                }
                                .padding(.vertical, 12)
                            }
                        }
                        .padding(.top, 8)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .scrollIndicators(.hidden).obScrollAnchor()
            VStack(spacing: 10) { actions() }.padding(.horizontal, RM.Space.gutter).padding(.vertical, 8)
        }
        .accessibilityElement(children: .contain).accessibilityIdentifier(id)
    }
}

/// `838:3918` "Continue de onde parou": where the unsent answers stopped.
struct OnboardingResumeView: View {
    let vm: OnboardingViewModel

    var body: some View {
        let point = OnboardingViewModel.resumePoint(for: vm.step)
        let stage = point.stage
        let name = vm.draft.name.trimmingCharacters(in: .whitespacesAndNewlines)
        VStack(alignment: .leading, spacing: 0) {
            OBNavigation(stage: stage, progress: vm.step.isRespiro ? 0 : vm.stageProgress, showsBack: false) {}
            ScrollView {
            VStack(alignment: .leading, spacing: 0) {
            VStack(alignment: .leading, spacing: 12) {
                RMLogo()
                Text(name.isEmpty ? L.t("ob.resume.title") : L.f("ob.withName", L.t("ob.resume.title"), name)).rmText(.manchete).fixedSize(horizontal: false, vertical: true)
                Text(L.t("ob.resume.body")).rmText(.corpo, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
            }
            .padding(.horizontal, RM.Space.gutter).padding(.top, 24)
            OBGroup {
                ForEach(1...4, id: \.self) { s in
                    if s > 1 { RMDivider() }
                    let detail: String? = s < stage ? (s == 1 ? OBText.goal(vm.draft) : nil)
                        : s == stage ? point.stoppedAt.map { L.f("ob.resume.stoppedAt", L.t("ob.stepName.\($0.rawValue)")) } : nil
                    OBSummaryRow(title: L.t("ob.resume.stage.\(s)"), detail: detail,
                                 value: L.t(s < stage ? "ob.resume.done" : s == stage ? "ob.resume.now" : "ob.resume.missing"), valueStyle: .rotulo, dimmed: s > stage)
                }
            }
            .padding(.top, 24)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            }
            .scrollIndicators(.hidden).obScrollAnchor()
            VStack(spacing: 6) {
                OBPrimaryButton(title: L.t("ob.resume.continue"), id: "ob-resume-continue") { withAnimation { vm.resumeWhereStopped() } }
                OBLink(title: L.t("ob.resume.restart"), id: "ob-resume-restart") { withAnimation { vm.restart() } }
            }
            .padding(.horizontal, RM.Space.gutter).padding(.bottom, 8)
        }
        .accessibilityElement(children: .contain).accessibilityIdentifier("ob-resume")
    }
}
