import SwiftUI

/// Etapa 1 · Objetivo (Figma 10, row `835:2063`): 02 O que treinar, 03 Objetivo na corrida, 04 Data da prova, 05 Meta de tempo, 06 Objetivo
/// na força, 08 Respiro.
extension OnboardingFormView {
    @ViewBuilder var goalContent: some View {
        switch vm.step {
        case .train:
            OBQuestion(stage: 1, title: L.t("ob.train.title"))
            VStack(spacing: 10) {
                card(.both, [.hibrido]); card(.runOnly, [.corrida]); card(.strengthOnly, [.forca])
            }
            .padding(.horizontal, RM.Space.gutter).padding(.top, 20)
        case .runAim:
            OBQuestion(stage: 1, title: L.t("ob.runAim.title"))
            section(L.t("ob.runAim.race")) {
                OBPills(items: RaceDistance.allCases.map { ($0.rawValue, L.t("ob.race.\($0.rawValue)")) },
                        selected: Set([vm.draft.runAim?.race?.rawValue].compactMap { $0 })) { id in
                    if let d = RaceDistance(rawValue: id) { vm.draft.choose(aim: .race(d)) }
                }
            }
            section(L.t("ob.runAim.noRace")) {
                OBPills(items: NoRaceAim.allCases.map { ($0.rawValue, L.t("ob.noRace.\($0.rawValue)")) },
                        selected: Set([noRace(vm.draft.runAim)].compactMap { $0 })) { id in
                    if let a = NoRaceAim(rawValue: id) { vm.draft.choose(aim: .noRace(a)) }
                }
            }
        case .raceDate: raceDate
        case .goalTime:
            OBQuestion(stage: 1, title: L.t("ob.goal.title"), subtitle: L.t("ob.goal.optional"))
            OBWheelCard {
                // 10…400 min: the time goals the engine reads (`event.timeGoalMinutes`); kept locally until D07.
                OBWheelColumn(values: Array(10...400), selection: $vm.draft.goalMinutes, label: { "\($0)" }, unit: L.t("ob.unit.min"), id: "ob-goal-min")
                OBWheelColumn(values: Array(0...59), selection: $vm.draft.goalSeconds, label: { String(format: "%02d", $0) }, unit: L.t("ob.unit.s"), id: "ob-goal-s")
            }
            .padding(.top, 20)
            .onChange(of: vm.draft.goalMinutes) { if vm.draft.goalMinutes != nil { vm.draft.goalSkipped = false } }
            OBFootnote(text: L.t("ob.goal.note"))
        case .strengthAim:
            OBQuestion(stage: 1, title: L.t("ob.strengthAim.title"))
            OBPills(items: StrengthAim.allCases.map { ($0.rawValue, L.t("ob.strengthAim.\($0.rawValue)")) },
                    selected: Set([vm.draft.strengthAim?.rawValue].compactMap { $0 })) { vm.draft.strengthAim = StrengthAim(rawValue: $0) }
                .padding(.horizontal, RM.Space.gutter).padding(.top, 20)
            // The Figma writes the line for "Força" only (D22): the other aims show none.
            if vm.draft.strengthAim == .strength { OBFootnote(text: L.t("ob.strengthAim.STRENGTH.note")) }
        default: EmptyView()
        }
    }

    private func noRace(_ aim: RunAim?) -> String? { if case .noRace(let a) = aim { return a.rawValue }; return nil }

    private func card(_ t: TrainChoice, _ icons: [RMIcon]) -> some View {
        OBOptionCard(icons: icons, title: L.t("ob.train.\(t.rawValue)"), detail: L.t("ob.train.\(t.rawValue).detail"), selected: vm.draft.train == t,
                     id: "ob-train-\(t.rawValue)") { vm.draft.choose(train: t) }
    }

    private func section<C: View>(_ title: String, @ViewBuilder _ content: () -> C) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title).rmText(.micro, RM.Palette.textoTerciario)
            content()
        }
        .padding(.horizontal, RM.Space.gutter).padding(.top, 20)
    }

    // MARK: 04 Data da prova (`835:2245`, maratona `838:913`, além de 16 semanas `838:3864`)

    private var raceDate: some View {
        VStack(alignment: .leading, spacing: 0) {
            OBQuestion(stage: 1, title: L.t("ob.raceDate.title"))
            RaceDateWheel(day: vm.draft.raceDay, startYear: Int(vm.today.prefix(4)) ?? 2026) { vm.draft.raceDay = $0 }
                .padding(.top, 20)
            if let day = vm.draft.raceDay, vm.raceBeyondPlan {
                HStack(alignment: .top, spacing: 12) {
                    RMIconView(.fechar, size: 16).foregroundStyle(RM.Palette.negativo).padding(.top, 2)
                    VStack(alignment: .leading, spacing: 4) {
                        Text(L.t("ob.raceDate.beyond.title")).rmText(.subtitulo)
                        Text(L.f("ob.raceDate.beyond.body", OBText.dayMonthYear(OnboardingDraft.lastRaceDay(start: vm.startDay) ?? day)))
                            .rmText(.detalhe, RM.Palette.textoSecundario).fixedSize(horizontal: false, vertical: true)
                    }
                }
                .padding(16).frame(maxWidth: .infinity, alignment: .leading)
                .background(RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                .padding(.horizontal, RM.Space.gutter).padding(.top, 12)
                .accessibilityElement(children: .combine).accessibilityIdentifier("ob-race-beyond")
            } else if let day = vm.draft.raceDay, let weeks = vm.planWeeks {
                let marathon = vm.draft.runAim?.race == .marathon
                HStack(spacing: 12) {
                    RMIconView(.prova, size: 18).foregroundStyle(RM.Palette.marco)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(OBText.dateReading(day)).rmText(.subtitulo)
                        Text(L.f(marathon ? "ob.raceDate.untilMarathon" : "ob.raceDate.until", "\(weeks)")).rmText(.detalhe, RM.Palette.textoSecundario)
                    }
                    Spacer()
                }
                .padding(16)
                .background(RM.Palette.fundoElevado, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                .padding(.horizontal, RM.Space.gutter).padding(.top, 12)
                .accessibilityElement(children: .combine).accessibilityIdentifier("ob-race-reading")
                OBFootnote(text: L.t(marathon ? "ob.raceDate.noteMarathon" : "ob.raceDate.note"))
            } else {
                OBFootnote(text: L.t(vm.draft.runAim?.race == .marathon ? "ob.raceDate.noteMarathon" : "ob.raceDate.note"))
            }
        }
    }
}

/// Day / month / year of a plan-local day.
enum RaceDateParts {
    static func split(_ day: String?) -> (Int?, Int?, Int?) {
        guard let day else { return (nil, nil, nil) }
        let p = day.split(separator: "-").compactMap { Int($0) }
        return p.count == 3 ? (p[2], p[1], p[0]) : (nil, nil, nil)
    }
    /// The day, or nil while a column is unset or the date does not exist (31 Feb).
    static func join(_ d: Int?, _ m: Int?, _ y: Int?) -> String? {
        guard let d, let m, let y else { return nil }
        var c = Fmt.calendar.dateComponents([.year], from: Date()); c.year = y; c.month = m; c.day = d
        guard let date = Fmt.calendar.date(from: c), Fmt.calendar.component(.day, from: date) == d else { return nil }
        return Fmt.dayString(date)
    }
}

/// 04 "Seletor em roda": day, month, year, each "—" until moved (D17). The day the athlete picks is a local calendar day (#61b).
struct RaceDateWheel: View {
    let day: String?
    let startYear: Int
    let set: (String?) -> Void
    @State private var d: Int?
    @State private var m: Int?
    @State private var y: Int?

    init(day: String?, startYear: Int, set: @escaping (String?) -> Void) {
        self.day = day; self.startYear = startYear; self.set = set
        let (d0, m0, y0) = RaceDateParts.split(day)
        _d = State(initialValue: d0); _m = State(initialValue: m0); _y = State(initialValue: y0)
    }

    var body: some View {
        OBWheelCard {
            OBWheelColumn(values: Array(1...31), selection: $d, label: { String(format: "%02d", $0) }, id: "ob-race-day")
            OBWheelColumn(values: Array(1...12), selection: $m, label: { Self.month($0) }, id: "ob-race-month")
            OBWheelColumn(values: Array(startYear...(startYear + 2)), selection: $y, label: { "\($0)" }, id: "ob-race-year")
        }
        .onChange(of: [d, m, y]) { set(RaceDateParts.join(d, m, y)) }
    }

    static func month(_ m: Int) -> String {
        let f = DateFormatter(); f.locale = Fmt.locale
        return f.shortMonthSymbols[m - 1].replacingOccurrences(of: ".", with: "").lowercased(with: Fmt.locale)
    }
}
