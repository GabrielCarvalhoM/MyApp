import SwiftUI

/// The three respiros (Figma 10): 08 objetivo definido (`835:2475`), 16 rotina definida (`836:882`), 28 ponto de partida (`836:3372`).
/// Each one says back only what the athlete answered.
extension OnboardingFormView {
    @ViewBuilder var respiroContent: some View {
        switch vm.step {
        case .goalDone: goalDone
        case .routineDone:
            VStack(alignment: .leading, spacing: 0) {
                OBWeekArt(run: vm.draft.runDays, strength: vm.draft.strengthDays, longRun: vm.draft.longRunDay).padding(.top, 40)
                respiroText(stage: 2, title: L.f("ob.routineDone.title", "\(vm.draft.runDays.count + vm.draft.strengthDays.count)",
                                                 "\(vm.draft.runDays.union(vm.draft.strengthDays).count)"), body: OBText.routineBody(vm.draft))
            }
        case .youDone: youDone
        default: EmptyView()
        }
    }

    private func respiroText(stage: Int, title: String?, body: String?) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Self.stageDone(stage)
            if let title { Text(title).rmText(.manchete).fixedSize(horizontal: false, vertical: true).accessibilityAddTraits(.isHeader) }
            if let body { Text(body).rmText(.corpo, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true) }
        }
        .padding(.horizontal, RM.Space.gutter).padding(.top, 24)
    }

    // MARK: 08

    @ViewBuilder private var goalDone: some View {
        if let race = vm.draft.runAim?.race, let day = vm.draft.raceDay, let weeks = vm.planWeeks {
            VStack(alignment: .leading, spacing: 0) {
                VStack(spacing: 2) {
                    Text("\(weeks)").rmText(.numeroXL)
                    Text(L.t("ob.goalDone.weeks")).rmText(.detalhe, RM.Palette.textoSecundario)
                }
                .frame(maxWidth: .infinity).padding(.top, 32)
                timeline(weeks: weeks, race: day).padding(.top, 20)
                // "até os seus 10 km" is drawn for the 5 and 10 km (D22): the half and the marathon show no title.
                respiroText(stage: 1, title: [.fiveK, .tenK].contains(race) ? L.f("ob.goalDone.title", "\(weeks)", OBText.race(race)) : nil,
                            body: L.f("ob.goalDone.body", OBText.onDay(day), OBText.onDay(vm.startDay)))
            }
        }
    }

    private func timeline(weeks: Int, race: String) -> some View {
        VStack(spacing: 8) {
            ZStack {
                Rectangle().fill(RM.Palette.textoTerciario).frame(height: 1)
                HStack(spacing: 0) {
                    Circle().fill(RM.Palette.agora).frame(width: 12, height: 12).overlay(Circle().stroke(RM.Palette.fundoApp, lineWidth: 3))
                    ForEach(1..<weeks, id: \.self) { _ in Spacer(); Rectangle().fill(RM.Palette.textoSecundario).frame(width: 1, height: 12) }
                    Spacer()
                    Circle().fill(RM.Palette.marco).frame(width: 14, height: 14)
                }
            }
            HStack {
                Text(L.f("ob.goalDone.today", Fmt.weekdayAndDate(vm.today))).rmText(.detalhe, RM.Palette.textoPrimario)
                Spacer()
                Text(L.f("ob.goalDone.race", Fmt.weekdayAndDate(race))).rmText(.detalhe, RM.Palette.marco)
            }
        }
        .padding(.horizontal, RM.Space.gutter)
        .accessibilityElement(children: .combine)
    }

    // MARK: 28

    private var youDone: some View {
        let d = vm.draft
        return VStack(alignment: .leading, spacing: 0) {
            OBWeekArt(run: d.runDays, strength: d.strengthDays, longRun: d.longRunDay).padding(.top, 24)
            respiroText(stage: 3, title: L.t("ob.youDone.title"), body: nil)
            OBGroup {
                if let days = d.recentRunDays ?? d.recentRunDaysChoice?.rawValue ?? (d.runStart == .never ? 0 : nil), d.runs {
                    OBSummaryRow(title: L.t("ob.youDone.run"), detail: L.f("ob.youDone.daysPerWeek", "\(days)"),
                                 value: d.recentRunMinutes.map { "\($0) " + L.t("ob.unit.min") })
                }
                if let r = OBText.result(d) {
                    RMDivider()
                    OBSummaryRow(title: L.t("ob.youDone.result"), detail: r.detail, value: r.value)
                }
                if d.lifts, let days = d.strengthBand == .never ? 0 : d.recentStrengthDays {
                    if d.runs { RMDivider() }
                    // The "7 cargas" value waits for D01 (cargas conhecidas).
                    OBSummaryRow(title: L.t("ob.youDone.strength"), detail: L.f("ob.youDone.daysPerWeek", "\(days)"))
                }
            }
            .padding(.top, 20)
        }
    }
}
