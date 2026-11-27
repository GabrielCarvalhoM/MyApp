import SwiftUI

/// Etapa 3 · Você, first half (Figma 10, row `835:2065`): 17 Nome, 18 Idade, 19 Altura e peso, 20 Apple Saúde, 21 Corrida até aqui (sem Apple
/// Saúde `838:969`; iniciante `838:1045`), 21b Corrida recente (`838:1093`), 22 Tempo de corrida.
extension OnboardingFormView {
    @ViewBuilder var youContent: some View {
        switch vm.step {
        case .name:
            OBQuestion(stage: 3, title: L.t("ob.name.title"))
            VStack(alignment: .leading, spacing: 8) {
                Text(L.t("ob.name.label")).rmText(.rotulo, RM.Palette.textoSecundario)
                TextField("", text: $vm.draft.name).rmText(.subtitulo).textContentType(.givenName).submitLabel(.go)
                    .onSubmit { vm.next() }
                    .padding(.horizontal, 16).frame(minHeight: 52)
                    .background(RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).strokeBorder(RM.Palette.agora.opacity(0.9), lineWidth: 1))
                    .accessibilityLabel(L.t("ob.name.label")).accessibilityIdentifier("ob-name")
            }
            .padding(.horizontal, RM.Space.gutter).padding(.top, 20)
            OBFootnote(text: L.t("ob.name.note"))
        case .age:
            OBQuestion(stage: 3, title: L.t("ob.age.title"))
            // D16 (27/11): the engine decides the 18–80 range; the wheel does not, so an age outside reaches `838:4053`.
            OBWheelCard {
                OBWheelColumn(values: Array(10...100), selection: $vm.draft.age, label: { "\($0)" }, unit: L.t("ob.unit.years"), columnWidth: 88, id: "ob-age")
            }
            .padding(.top, 20)
            OBFootnote(text: L.t("ob.age.note"), icon: .cadeado)
        case .bodySize:
            OBQuestion(stage: 3, title: L.t("ob.body.title"))
            VStack(spacing: 12) {
                OBRuler(title: L.t("ob.body.height"), values: Array(120...220), selection: $vm.draft.heightCm,
                        label: { Fmt.number(Double($0) / 100, fraction: 2) }, unit: L.t("ob.unit.m"), id: "ob-height")
                OBRuler(title: L.t("ob.body.weight"), values: Array(30...200), selection: $vm.draft.weightKg, label: { "\($0)" }, unit: L.t("ob.unit.kg"), id: "ob-weight")
            }
            .padding(.top, 20)
            .onChange(of: [vm.draft.heightCm, vm.draft.weightKg]) { if vm.draft.heightCm != nil || vm.draft.weightKg != nil { vm.draft.bodySizeSkipped = false } }
            OBFootnote(text: L.t("ob.body.note"), icon: .cadeado)
        case .appleHealth: appleHealth
        case .runStart:
            OBQuestion(stage: 3, title: L.t("ob.runStart.title"))
            OBPills(items: RunStart.allCases.map { ($0.rawValue, L.t("ob.runStart.\($0.rawValue)")) },
                    selected: Set([vm.draft.runStart?.rawValue].compactMap { $0 })) { if let s = RunStart(rawValue: $0) { vm.draft.choose(start: s) } }
                .padding(.horizontal, RM.Space.gutter).padding(.top, 20)
            // Drawn with "Nunca corri" (`838:1045`); not extended to the other answers (D22).
            if vm.draft.runStart == .never { OBFootnote(text: L.t("ob.runStart.note")) }
        case .runRecentDays:
            OBQuestion(stage: 3, title: L.t("ob.runRecent.title"))
            OBPills(items: [(RecentRunDays.none, "none"), (.one, "one"), (.two, "two"), (.threeOrMore, "threeOrMore")].map { ("\($0.0.rawValue)", L.t("ob.runRecent.\($0.1)")) },
                    selected: Set([vm.draft.recentRunDaysChoice.map { "\($0.rawValue)" }].compactMap { $0 })) { id in
                vm.draft.recentRunDaysChoice = Int(id).flatMap(RecentRunDays.init(rawValue:))
            }
            .padding(.horizontal, RM.Space.gutter).padding(.top, 20)
        case .runNow:
            // 21 "sem Apple Saúde" (`838:969`): the only variant while Apple Health has no port (D15).
            OBQuestion(stage: 3, title: L.t("ob.runNow.title"), subtitle: L.t("ob.runNow.body"))
            OBGroup {
                // Bounds: the engine's accepted recent-training ranges (`recent.*`, r6-intake).
                OBCounterRow(title: L.t("ob.runNow.days"), value: $vm.draft.recentRunDays, range: 0...7, unit: L.t("ob.unit.days"), id: "ob-run-days")
                RMDivider()
                OBCounterRow(title: L.t("ob.runNow.minutes"), value: $vm.draft.recentRunMinutes, range: 0...1500, step: 10, unit: L.t("ob.unit.min"), id: "ob-run-minutes")
                RMDivider()
                OBCounterRow(title: L.t("ob.runNow.longest"), value: $vm.draft.longestRunMinutes, range: 0...300, step: 5, unit: L.t("ob.unit.min"), id: "ob-run-longest")
            }
            .padding(.top, 20)
            OBFootnote(text: L.t("ob.runNow.note"))
        case .runYears:
            OBQuestion(stage: 3, title: L.t("ob.runYears.title"))
            OBPills(items: TrainingBand.running.map { ($0.rawValue, L.t("ob.band.\($0.rawValue)")) },
                    selected: Set([vm.draft.runBand?.rawValue].compactMap { $0 })) { vm.draft.runBand = TrainingBand(rawValue: $0) }
                .padding(.horizontal, RM.Space.gutter).padding(.top, 20)
        default: EmptyView()
        }
    }

    // MARK: 20 Apple Saúde (`836:2791`)

    private var appleHealth: some View {
        VStack(alignment: .leading, spacing: 0) {
            OBQuestion(stage: 3, title: L.t("ob.health.title"), subtitle: L.t("ob.health.body"))
            Text(L.t("ob.health.reads")).rmText(.micro, RM.Palette.textoTerciario).padding(.horizontal, RM.Space.gutter).padding(.top, 20)
            OBGroup {
                healthRow(.corrida, RM.Palette.corrida, "runs"); RMDivider()
                healthRow(.forca, RM.Palette.forca, "strength"); RMDivider()
                healthRow(.relogio, RM.Palette.textoPrimario, "heartRate"); RMDivider()
                healthRow(.ajustes, RM.Palette.textoPrimario, "size")
            }
            .padding(.top, 10)
            OBFootnote(text: L.t("ob.health.note"), icon: .cadeado)
        }
    }

    private func healthRow(_ icon: RMIcon, _ color: Color, _ key: String) -> some View {
        HStack(spacing: 14) {
            RMIconView(icon, size: 18).foregroundStyle(color)
            VStack(alignment: .leading, spacing: 2) {
                Text(L.t("ob.health.\(key)")).rmText(.subtitulo)
                Text(L.t("ob.health.\(key).detail")).rmText(.detalhe, RM.Palette.textoSecundario)
            }
            Spacer()
        }
        .padding(.vertical, 12).accessibilityElement(children: .combine)
    }
}
