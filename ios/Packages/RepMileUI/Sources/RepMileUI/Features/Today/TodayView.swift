import CoachingPresentation
import SwiftUI

/// Hoje (Figma page 20; reference frame `880:4257` "Dia duplo · manhã · sem relógio (sem sono e VFC)"). Sleep, HRV and weather are not in
/// V1 (`notInV1`, no WeatherKit source): their slots close without a gap.
struct TodayView: View {
    @Environment(AppModel.self) private var model
    var openProfile: () -> Void
    var openSession: (PlannedSession) -> Void
    var startSession: (PlannedSession) -> Void
    var openChanges: () -> Void
    var openReadiness: () -> Void

    var body: some View {
        if let plan = model.plan {
            let content = TodayContent.build(plan: plan, logged: model.logged, presentation: model.presentation, weekPlan: model.weekPlan,
                                             paused: [.outsideV1Scope, .clinicalHumanRequired].contains(model.globalGate),
                                             startability: model.startability(of:))
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    header(content)
                    hero(content)
                    banner(plan)
                    WeekPanels(days: content.days, label: content.weekLabel) { openSession($0.session) }
                        .padding(.top, 22)
                    if let s = content.summary {
                        Text(s).rmText(.detalhe, RM.Palette.textoSecundario).multilineTextAlignment(.center)
                            .frame(maxWidth: .infinity).padding(.top, 6).padding(.horizontal, RM.Space.gutter)
                    }
                    actions(content)
                    if let race = content.race { raceCard(race, content: content).padding(.top, 28).padding(.horizontal, RM.Space.gutter) }
                    VStack(spacing: 16) {
                        RMDivider()
                        Button(action: openChanges) { ChevronRow(title: L.t("today.changed.title"), detail: L.t("today.changed.detail")) }
                            .buttonStyle(.plain).accessibilityIdentifier("today-changed")
                    }
                    .padding(.top, 22).padding(.horizontal, 24)
                }
            }
            .scrollIndicators(.hidden)
            .background(alignment: .top) { RMGlow(color: Self.glowColor(content)) }
            .accessibilityIdentifier("screen-today")
        }
    }

    /// The light of the next session's sport; neutral when nothing may start (a hold or a host gate, #99) or nothing is planned today.
    static func glowColor(_ c: TodayContent) -> Color {
        guard !c.paused else { return RM.Palette.luzNeutra }
        return (c.next?.sport ?? c.days.first { $0.isToday }?.marks.first?.sport)?.glow ?? RM.Palette.luzNeutra
    }

    private func header(_ c: TodayContent) -> some View {
        HStack {
            Text(c.header).rmText(.micro, RM.Palette.textoSecundario).lineLimit(2).minimumScaleFactor(0.9)
            Spacer()
            Button(action: openProfile) { FocusRingAvatar(initials: model.initials) }
                .buttonStyle(.plain)
                .accessibilityLabel(L.t("profile.open"))
                .accessibilityIdentifier("open-profile")
        }
        .padding(.top, 6).padding(.horizontal, RM.Space.gutter)
    }

    private func hero(_ c: TodayContent) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            if let at = c.signalAt {   // Figma `805:448` "Sinal informado · …"
                Text(L.f("today.signal", at)).rmText(.micro, RM.Palette.textoTerciario).accessibilityIdentifier("today-signal")
            }
            (Text(c.heroLead).foregroundColor(RM.Palette.textoTerciario) + Text(c.heroLead.isEmpty || c.heroRest.isEmpty ? c.heroRest : " " + c.heroRest))
                .rmText(.manchete)
                .fixedSize(horizontal: false, vertical: true)
                .accessibilityAddTraits(.isHeader)
                .accessibilityIdentifier("today-headline")
            if let body = c.body { Text(body).rmText(.corpo, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true) }
        }
        .padding(.top, 16).padding(.horizontal, RM.Space.gutter)
    }

    @ViewBuilder private func banner(_ plan: PlanView) -> some View {
        let banners = TodayContent.banners(plan: plan, gate: model.globalGate)
        if !banners.isEmpty {
            VStack(alignment: .leading, spacing: 12) {
                ForEach(Array(banners.enumerated()), id: \.offset) { _, b in bannerView(b, plan) }
            }
            .padding(.top, 16).padding(.horizontal, RM.Space.gutter)
        }
    }

    @ViewBuilder private func bannerView(_ banner: TodayBanner, _ plan: PlanView) -> some View {
        switch banner {
        case .urgentHold:
            HoldPanel(plan: plan, guidance: .urgentCare, declareReady: openReadiness)
        case .gate(let gate):
            gateBanner(gate)
        case .state(.blocked):
            HoldPanel(plan: plan, guidance: plan.clinicalGuidance ?? .professionalAssessment, declareReady: openReadiness)
        case .state(.pendingConfirmation):
            StateBanner(tone: .milestone, icon: .marco, title: L.t("state.pending.title"), message: L.t("state.pending.body"),
                        actionTitle: L.t("state.pending.action"), action: openChanges)
        case .state(.returning):
            StateBanner(tone: .neutral, icon: .repetir, title: L.t("state.returning.title"), message: L.t("state.returning.body"))
        case .state(.needsInput):
            StateBanner(tone: .neutral, icon: .lista, title: L.t("state.needsInput.title"), message: L.t("state.needsInput.body"),
                        actionTitle: L.t("state.needsInput.action"), action: openChanges)
        case .state:
            EmptyView()
        }
    }

    @ViewBuilder private func gateBanner(_ gate: NotStartableReason) -> some View {
        switch gate {
        case .outsideV1Scope:
            StateBanner(tone: .safety, icon: .cadeado, title: L.t("state.outsideScope.title"), message: L.t("state.outsideScope.body.interim"))
                .accessibilityIdentifier("banner-outside-scope")
        case .screenRequired:
            StateBanner(tone: .safety, icon: .lista, title: L.t("state.screenRequired.title"), message: L.t("state.screenRequired.body"),
                        actionTitle: L.t("state.screenRequired.action"), action: openChanges)
        case .clockUntrusted:
            StateBanner(tone: .neutral, icon: .relogio, title: L.t("state.clock.title"), message: L.t("reason.CLOCK_UNTRUSTED"))
        default:
            StateBanner(tone: .safety, icon: .cadeado, title: L.t("today.notStartable"), message: L.t("reason." + gate.rawValue))
        }
    }

    private func actions(_ c: TodayContent) -> some View {
        VStack(spacing: 10) {
            if let next = c.next {
                let startable = c.startability == .startable && !model.isLoading
                PrimaryActionButton(L.f("today.start", next.title.lowercased(with: Fmt.locale)), fill: next.sport.action, textColor: next.sport.actionText,
                                    enabled: startable) { startSession(next.session) }
                    .accessibilityIdentifier("today-start")
                if case .notStartable(let r) = c.startability, model.globalGate == nil {
                    Text(L.t("reason." + r.rawValue)).rmText(.detalhe, RM.Palette.textoSecundario).frame(maxWidth: .infinity)
                        .accessibilityIdentifier("today-start-reason")
                }
                SecondaryPillButton(L.t("today.viewSession"), icon: .lista) { openSession(next.session) }
                    .accessibilityIdentifier("today-view-session")
            }
        }
        .padding(.top, 14).padding(.horizontal, RM.Space.gutter)
    }

    private func raceCard(_ r: TodayContent.Race, content c: TodayContent) -> some View {
        RMCard {
            HStack {
                HStack(spacing: 8) {
                    RMIconView(.prova, size: 16).foregroundStyle(RM.Palette.textoSecundario)
                    Text(r.title).rmText(.rotulo, RM.Palette.textoSecundario)
                }
                Spacer()
                if let d = r.daysLeft { Text(d).rmText(.rotulo, RM.Palette.marco) }
            }
            if let range = r.range {
                VStack(alignment: .leading, spacing: 2) {
                    Text(range).rmText(.numeroL).accessibilityLabel(range)
                    if let cap = r.estimateCaption { Text(cap).rmText(.detalhe, RM.Palette.textoSecundario) }
                }
                RangeBar(low: r.low, high: r.high)
                if let base = r.base { Text(base).rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true) }
                Text(L.t("today.race.notPromise")).rmText(.detalhe, RM.Palette.textoTerciario).fixedSize(horizontal: false, vertical: true)
            } else {
                Text(L.t("today.race.unavailable")).rmText(.detalhe, RM.Palette.textoSecundario)
            }
            if let phase = c.phaseName {
                RMDivider()
                HStack(alignment: .firstTextBaseline) {
                    Text(phase).rmText(.subtitulo)
                    Spacer()
                    if let w = c.phaseWeek { Text(w).rmText(.detalhe, RM.Palette.textoSecundario) }
                }
                PhaseTrack(phases: c.phases)
            }
        }
        .accessibilityElement(children: .contain).accessibilityIdentifier("today-race")
    }
}

/// "Faixa da estimativa": the range is the message (range first, central never alone). No goal marker: the goal is not in the contract.
struct RangeBar: View {
    let low: String?, high: String?
    var body: some View {
        VStack(spacing: 6) {
            GeometryReader { g in
                ZStack(alignment: .leading) {
                    Capsule().fill(RM.Palette.fundoTrilho).frame(height: 6)
                    Capsule().fill(RM.Palette.corrida).frame(width: g.size.width * 0.8, height: 6).offset(x: g.size.width * 0.1)
                }
                .frame(maxHeight: .infinity)
            }
            .frame(height: 14)
            HStack {
                if let low { Text(low).rmText(.detalhe, RM.Palette.textoTerciario) }
                Spacer()
                if let high { Text(high).rmText(.detalhe, RM.Palette.textoTerciario) }
            }
            .padding(.horizontal, 8)
        }
        .accessibilityHidden(true)
    }
}

/// "Fases até a prova · o branco é a semana de agora": one dot per week of `weekPlan`, phase names under their first week.
struct PhaseTrack: View {
    let phases: [TodayContent.Phase]
    var body: some View {
        let groups = phases.reduce(into: [(name: String?, first: Int, count: Int)]()) { acc, p in
            if let last = acc.last, last.name == p.name { acc[acc.count - 1].count += 1 } else { acc.append((p.name, p.id, 1)) }
        }
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 0) {
                ForEach(phases) { p in
                    ZStack {
                        if p.id != phases.first?.id { Rectangle().fill(p.timing <= 0 ? RM.Palette.textoSecundario : RM.Palette.fundoTrilho).frame(height: 1.5).offset(x: -8) }
                        Circle().fill(p.timing < 0 ? RM.Palette.textoSecundario : p.timing == 0 ? RM.Palette.agora : RM.Palette.fundoApp)
                            .overlay(Circle().strokeBorder(p.timing > 0 ? RM.Palette.fundoTrilho : .clear, lineWidth: 1.5))
                            .frame(width: p.timing == 0 ? 12 : 7, height: p.timing == 0 ? 12 : 7)
                    }
                    .frame(maxWidth: .infinity)
                }
                RMIconView(.prova, size: 16).foregroundStyle(RM.Palette.marco)
            }
            GeometryReader { g in
                let unit = (g.size.width - 16) / CGFloat(max(phases.count, 1))
                ForEach(groups, id: \.first) { grp in
                    if let n = grp.name {
                        Text(n).rmText(.tab, phases.first { $0.id == grp.first }?.timing == 0 || (phases.first { $0.id == grp.first }?.timing ?? 1) < 0 ? RM.Palette.textoPrimario : RM.Palette.textoTerciario)
                            .fixedSize().offset(x: CGFloat(grp.first - (phases.first?.id ?? 0)) * unit + 2)
                    }
                }
            }
            .frame(height: 12)
        }
        .accessibilityHidden(true)
    }
}
