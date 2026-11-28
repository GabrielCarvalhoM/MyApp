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
        if vm.draft.runs, vm.draft.runAim?.race == nil || vm.planWeeks == nil {
            goalDoneWithoutRace
        } else if !vm.draft.runs {
            goalDoneWithoutRace
        } else if let race = vm.draft.runAim?.race, let day = vm.draft.raceDay, let weeks = vm.planWeeks {
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

    /// 08 without a race (D09 A, `1491:8326` running + strength, `1491:8385` strength only): the answers of 03 and 06, no weeks (D03).
    private var goalDoneWithoutRace: some View {
        let d = vm.draft
        let strength = d.strengthAim.map { L.t("ob.strengthAim.\($0.rawValue)").lowercased(with: Fmt.locale) }
        let run: String? = { if case .noRace(let a)? = d.runAim, a != .startRunning { return L.t("ob.noRace.\(a.rawValue)") }; return nil }()
        let title: String? = {
            if d.runAim == .noRace(.startRunning) { return strength.map { L.f("ob.goalDone.noRace.startRunningStrength", $0) } ?? L.t("ob.noRace.startRunning") }
            switch (run, strength, d.runs) {
            case (let r?, let s?, _): return L.f("ob.goalDone.noRace.runStrength", r, s)
            case (let r?, nil, _): return L.f("ob.goalDone.noRace.run", r)
            case (nil, let s?, false): return L.f("ob.goalDone.noRace.strength", s.capitalizedFirst)
            default: return nil
            }
        }()
        let lead = !d.runs ? L.t("ob.train.strengthOnly.detail") : !d.lifts ? L.t("ob.train.runOnly.detail") : L.t("ob.goalDone.noRace.body")
        return VStack(alignment: .leading, spacing: 0) {
            VStack(spacing: 8) {
                ZStack(alignment: .leading) {
                    Rectangle().fill(RM.Palette.textoTerciario).frame(height: 1)
                    Circle().fill(RM.Palette.agora).frame(width: 12, height: 12).overlay(Circle().stroke(RM.Palette.fundoApp, lineWidth: 3))
                }
                HStack {
                    Text(L.f("ob.goalDone.today", OBText.weekdayDayMonth(short: vm.today))).rmText(.detalhe, RM.Palette.textoPrimario)
                    Spacer()
                    Text(L.t("ob.goalDone.noRaceDate")).rmText(.detalhe, RM.Palette.textoTerciario)
                }
            }
            .padding(.horizontal, RM.Space.gutter).padding(.top, 120)
            .accessibilityElement(children: .combine)
            respiroText(stage: 1, title: title, body: lead + " " + L.f("ob.goalDone.firstWorkout", OBText.onDay(vm.startDay)))
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
                Text(L.f("ob.goalDone.today", OBText.weekdayDayMonth(short: vm.today))).rmText(.detalhe, RM.Palette.textoPrimario)
                Spacer()
                Text(L.f("ob.goalDone.race", OBText.weekdayDayMonth(short: race))).rmText(.detalhe, RM.Palette.marco)
            }
        }
        .padding(.horizontal, RM.Space.gutter)
        .accessibilityElement(children: .combine)
    }

    // MARK: 28

    private var youDone: some View {
        let d = vm.draft
        return VStack(alignment: .leading, spacing: 0) {
            OBWeekArt(run: d.runDays, strength: d.strengthDays, longRun: d.longRunDay, style: .solid).padding(.top, 24)
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
