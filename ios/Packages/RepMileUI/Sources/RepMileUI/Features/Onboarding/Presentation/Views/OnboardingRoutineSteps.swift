import SwiftUI

/// Etapa 2 · Rotina (Figma 10, row `835:2064`): 09 Sua semana, 10 Dia do longão, 11 Duração, 12 Onde treina força, 13 Onde corre, 14 O que
/// você usa na corrida. 07 Prioridade, 15 Treinador and 09b Turno por dia are held (D08, D11, D10).
extension OnboardingFormView {
    @ViewBuilder var routineContent: some View {
        switch vm.step {
        case .week: week
        case .longRun:
            OBQuestion(stage: 2, title: L.t("ob.longRun.title"))
            OBWeekGrid(runs: true, lifts: false, runDays: vm.draft.runDays, strengthDays: [], toggle: { _, _ in }).allowsHitTesting(false)
                .padding(.top, 20)
            OBPills(items: vm.draft.runDays.sorted().map { ("\($0)", OBDays.short($0)) },
                    selected: Set([vm.draft.longRunDay.map(String.init)].compactMap { $0 })) { vm.draft.longRunDay = Int($0) }
                .padding(.horizontal, RM.Space.gutter).padding(.top, 20)
            OBFootnote(text: L.t("ob.longRun.note"))
        case .duration:
            OBQuestion(stage: 2, title: L.t("ob.duration.title"))
            OBGroup {
                // 10–240 min per session: the session lengths the engine reads (`schedule.*Minutes`).
                if vm.draft.runs {
                    OBCounterRow(title: L.t("ob.duration.run"), detail: L.t("ob.duration.run.detail"), value: $vm.draft.runMinutes, range: 10...240, step: 5,
                                 unit: L.t("ob.unit.min"), id: "ob-duration-run")
                    RMDivider()
                    OBCounterRow(title: L.t("ob.duration.long"), detail: vm.draft.longRunDay.map(OBDays.full), value: $vm.draft.longRunMinutes, range: 10...240,
                                 step: 5, unit: L.t("ob.unit.min"), id: "ob-duration-long")
                }
                if vm.draft.runs && vm.draft.lifts { RMDivider() }
                if vm.draft.lifts {
                    OBCounterRow(title: L.t("ob.duration.strength"), detail: L.t("ob.duration.strength.detail"), value: $vm.draft.strengthMinutes, range: 10...240,
                                 step: 5, unit: L.t("ob.unit.min"), id: "ob-duration-strength")
                }
            }
            .padding(.top, 20)
            OBFootnote(text: L.t("ob.duration.note"))
        case .strengthPlace:
            OBQuestion(stage: 2, title: L.t("ob.place.title"))
            OBPills(items: StrengthPlace.allCases.map { ($0.rawValue, L.t("ob.place.\($0.rawValue)")) },
                    selected: Set([vm.draft.strengthPlace?.rawValue].compactMap { $0 })) { vm.draft.strengthPlace = StrengthPlace(rawValue: $0) }
                .padding(.horizontal, RM.Space.gutter).padding(.top, 20)
            if vm.draft.strengthPlace == .fullGym {
                // SSCTR 27/11 (D14): the stated assumption stays visible before Continuar.
                OBFootnote(text: L.t("ob.place.fullGym.note"))
            } else if vm.draft.strengthPlace?.asksEquipment == true {
                VStack(alignment: .leading, spacing: 6) {
                    Text(L.t("ob.place.items.title")).rmText(.titulo)
                    Text(L.t("ob.place.items.body")).rmText(.detalhe, RM.Palette.textoSecundario)
                }
                .padding(.horizontal, RM.Space.gutter).padding(.top, 24)
                OBPills(items: GymItem.allCases.map { ($0.rawValue, L.t("ob.gym.\($0.rawValue)")) }, selected: Set(vm.draft.gymItems.map(\.rawValue)), checks: true) { id in
                    guard let item = GymItem(rawValue: id) else { return }
                    if vm.draft.gymItems.contains(item) { vm.draft.gymItems.remove(item) } else { vm.draft.gymItems.insert(item) }
                }
                .padding(.horizontal, RM.Space.gutter).padding(.top, 14)
                if OBCopyDeviation.showConfirmInFirstWorkout { OBFootnote(text: L.t("ob.place.items.note")) }
            }
        case .runPlace:
            OBQuestion(stage: 2, title: L.t("ob.runPlace.title"), subtitle: L.t("ob.runPlace.body"))
            OBPills(items: RunPlace.allCases.map { ($0.rawValue, L.t("ob.runPlace.\($0.rawValue)")) }, selected: Set(vm.draft.runPlaces.map(\.rawValue)), checks: true) { id in
                guard let p = RunPlace(rawValue: id) else { return }
                if vm.draft.runPlaces.contains(p) { vm.draft.runPlaces.remove(p) } else { vm.draft.runPlaces.insert(p) }
            }
            .padding(.horizontal, RM.Space.gutter).padding(.top, 20)
        case .runDevice:
            OBQuestion(stage: 2, title: L.t("ob.runDevice.title"))
            OBPills(items: RunDevice.allCases.map { ($0.rawValue, L.t("ob.runDevice.\($0.rawValue)")) },
                    selected: Set([vm.draft.runDevice?.rawValue].compactMap { $0 })) { vm.draft.runDevice = RunDevice(rawValue: $0) }
                .padding(.horizontal, RM.Space.gutter).padding(.top, 20)
            OBFootnote(text: L.t("ob.runDevice.note"))
        default: EmptyView()
        }
    }

    // MARK: 09 Sua semana (`862:2271`)

    private var week: some View {
        VStack(alignment: .leading, spacing: 0) {
            OBQuestion(stage: 2, title: L.t("ob.week.title"), subtitle: L.t("ob.week.body"))
            if vm.draft.runs { sportHeader(run: true).padding(.top, 20) }
            OBWeekGrid(runs: vm.draft.runs, lifts: vm.draft.lifts, runDays: vm.draft.runDays, strengthDays: vm.draft.strengthDays) { d, run in
                vm.draft.toggle(day: d, run: run)
            }
            .padding(.top, 12)
            if vm.draft.lifts { sportHeader(run: false).padding(.top, 14) }
            if !vm.draft.runDays.isEmpty || !vm.draft.strengthDays.isEmpty {
                VStack(alignment: .leading, spacing: 0) {
                    HStack(alignment: .top, spacing: 12) {
                        RMIconView(.hibrido, size: 20).foregroundStyle(RM.Palette.textoPrimario)
                        VStack(alignment: .leading, spacing: 3) {
                            Text(OBText.counts(runs: vm.draft.runDays.count, strength: vm.draft.strengthDays.count)).rmText(.subtitulo)
                            ForEach(OBText.sharedDays(vm.draft), id: \.self) { Text($0 + ".").rmText(.detalhe, RM.Palette.textoSecundario) }
                        }
                    }
                    .padding(.vertical, 14)
                    RMDivider()
                    // 09b "Turno por dia" is held (D10): the row renders disabled.
                    HStack {
                        Spacer()
                        Text(L.t("ob.week.adjust")).rmText(.rotulo, RM.Palette.textoTerciario)
                        RMIconView(.chevronDireita, size: 14).foregroundStyle(RM.Palette.textoTerciario)
                    }
                    .padding(.vertical, 12).accessibilityElement(children: .combine).accessibilityAddTraits(.isButton).accessibilityIdentifier("ob-week-adjust")
                }
                .padding(.horizontal, 16)
                .background(RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                .padding(.horizontal, RM.Space.gutter).padding(.top, 20)
            }
        }
    }

    /// "● Corrida   Manhã Tarde Noite": the sport and its turn (D10 interim: Manhã → AM, Tarde and Noite → PM). With large text the turns move
    /// under the sport instead of breaking words (Figma 83 "Texto grande": the layout wraps and stacks).
    private func sportHeader(run: Bool) -> some View {
        let title = HStack(spacing: 8) {
            RoundedRectangle(cornerRadius: 2).fill(run ? RM.Palette.corrida : RM.Palette.forca).frame(width: 4, height: 14)   // the sport bar
            Text(L.t(run ? "ob.sport.run" : "ob.sport.strength")).rmText(.subtitulo).lineLimit(1).fixedSize()
        }
        return ViewThatFits(in: .horizontal) {
            HStack(spacing: 8) { title; Spacer(minLength: 8); turns(run: run) }
            VStack(alignment: .leading, spacing: 10) { title; HStack(spacing: 8) { turns(run: run) } }
        }
        .padding(.horizontal, RM.Space.gutter)
    }

    @ViewBuilder private func turns(run: Bool) -> some View {
        let selected = run ? vm.draft.runTurn : vm.draft.strengthTurn
        ForEach(DayTurn.allCases, id: \.self) { t in
            let on = selected == t
            Button { if run { vm.draft.runTurn = t } else { vm.draft.strengthTurn = t } } label: {
                Text(L.t("ob.turn.\(t.rawValue)")).rmText(.rotulo, on ? RM.Palette.agoraSobre : RM.Palette.textoPrimario).lineLimit(1).fixedSize()
                    .padding(.horizontal, 12).padding(.vertical, 9)
                    .background(on ? RM.Palette.agora : RM.Palette.fundoElevado, in: Capsule())
            }
            .buttonStyle(.plain).accessibilityAddTraits(on ? .isSelected : [])
            .accessibilityIdentifier("ob-turn-\(run ? "run" : "strength")-\(t.rawValue)")
        }
    }
}
