import CoachingPresentation
import Foundation

/// 31 "Plano pronto" and 34 "Primeira semana" read from the engine after the write (`plan`, `weekPlan`, `presentation`): a pure mapping.
/// A card is shown only when the engine gave its data; a line the Figma writes from data no port carries (the marathon criteria D25, the
/// verdict on the time goal D07, the loads D01, "Três decisões do treinador" D26) is not shown.
struct OnboardingPlanPreview: Equatable {
    struct Card: Equatable {
        enum Icon: Equatable { case run, race, clock }
        let icon: Icon
        let title: String
        let detail: String?
        let value: String?
    }
    var title: String?
    var period: String?
    var runDays: Set<Int> = []
    var strengthDays: Set<Int> = []
    var longRunDay: Int?
    var weekLine: String?
    var weekRange: String?
    var cards: [Card] = []
    var preparatory = false

    init(plan: PlanView?, weekPlan: WeekPlanProjection?, presentation: PresentationSnapshot?, race: RaceDistance?, name: String) {
        let first = plan?.week
        let start = first?.startDate ?? weekPlan?.startDate
        let sessions = first?.sessions ?? []
        func day(_ s: PlannedSession) -> Int? {
            guard let st = start, let n = OnboardingDraft.days(from: st, to: s.date), (0..<7).contains(n) else { return nil }
            return n
        }
        // SSCTR C6: a run is a RUN session that is not a walk (an optional WALK is not a run); counted by role, never by sport alone.
        let isRun: (PlannedSession) -> Bool = { $0.sport.raw == "RUN" && $0.role.raw != "WALK" }
        runDays = Set(sessions.filter(isRun).compactMap(day))
        strengthDays = Set(sessions.filter { $0.sport.raw == "STRENGTH" }.compactMap(day))
        longRunDay = sessions.first { $0.sport.raw == "RUN" && $0.role.raw == "LONG" }.flatMap(day)

        let phases = (weekPlan?.weeks ?? []).compactMap { $0.phase?.raw }
        let raceShaped = phases.contains { ["SPECIFIC", "TAPER", "RACE_WEEK"].contains($0) }
        preparatory = race == .marathon && !phases.isEmpty && !raceShaped
        let weeks = plan?.weeks ?? weekPlan?.weeks.count
        let named: (String) -> String = { t in name.isEmpty ? t : L.f("ob.withName", t, name) }
        if preparatory {
            title = L.t("ob.ready.title.prep")
        } else if let race, race != .half, let weeks {
            title = named(L.f("ob.ready.title.\(race.rawValue)", "\(weeks)"))
        }
        if let s = start, let last = Self.lastDay(weekPlan: weekPlan, weeks: weeks, start: s) {
            if preparatory {
                period = L.f("ob.ready.period.prep", OBText.weekdayCommaDayMonth(s), OBText.weekdayCommaDayMonth(last))
            } else if !phases.isEmpty {
                var seen: [String] = []
                for p in phases where !seen.contains(p) { seen.append(p) }
                let names = seen.map { $0 == "RACE_WEEK" ? L.t("ob.ready.phase.raceWeek") : (L.code("phase", Code(raw: $0)) ?? "").lowercased(with: Fmt.locale) }.filter { !$0.isEmpty }
                period = L.f("ob.ready.period", OBText.weekdayCommaDayMonth(s), OBText.weekdayCommaDayMonth(last), OBText.list(names))
            }
            weekRange = L.f("ob.firstWeek.eyebrow", OBText.dayMonth(short: s), OBText.dayMonth(short: Self.add(6, to: s) ?? s))
        }
        if !sessions.isEmpty, let s = start {
            let runs = sessions.filter(isRun).count, lifts = sessions.filter { $0.sport.raw == "STRENGTH" }.count
            weekLine = L.f("ob.ready.week1", OBText.counts(runs: runs, strength: lifts), OBText.onDay(s))
        }
        cards = Self.cards(presentation?.readings?.runCalibration, race: race)
    }

    private static func add(_ n: Int, to day: String) -> String? {
        guard let d = Fmt.day(day), let x = Fmt.calendar.date(byAdding: .day, value: n, to: d) else { return nil }
        return Fmt.dayString(x)
    }
    private static func lastDay(weekPlan: WeekPlanProjection?, weeks: Int?, start: String) -> String? {
        guard let weeks, weeks > 0 else { return nil }
        return add(weeks * 7 - 1, to: weekPlan?.startDate ?? start)
    }

    /// "Ritmos calibrados" / "Ritmo de maratona" and "Capacidade atual" from the engine's calibration; "Faixas de ritmo e estimativas ·
    /// Indisponíveis" when it calibrated nothing.
    static func cards(_ rc: RunCalibration?, race: RaceDistance?) -> [Card] {
        guard let rc else { return [] }
        var out: [Card] = []
        let easy = rc.paceBands?["EASY"].flatMap { b -> String? in
            guard b.status.raw == "AVAILABLE", let f = b.fastSecondsPerKm, let s = b.slowSecondsPerKm else { return nil }
            let k = Fmt.usesMiles ? 1.609344 : 1
            return L.f("ob.ready.paceRange", Fmt.clock(f * k), Fmt.clock(s * k) + (Fmt.usesMiles ? " /mi" : " /km"))
        }
        if let ref = rc.capacity?.reference, rc.capacity?.status.raw == "CALIBRATED", let km = ref.distanceKm, let secs = ref.seconds, let easy {
            let refName = RaceDistance.allCases.first { abs((Self.km[$0] ?? 0) - km) < 0.05 }.map(OBText.race) ?? Fmt.distance(km: km)
            let detail = L.f("ob.ready.pacesDetail", refName, Fmt.clock(secs), easy)
            if race == .marathon, let m = rc.paceBands?["MARATHON_EFFORT"], m.status.raw == "AVAILABLE", let f = m.fastSecondsPerKm, let s = m.slowSecondsPerKm {
                out.append(Card(icon: .run, title: L.t("ob.ready.marathonPace"), detail: detail, value: Fmt.paceBand(fast: f, slow: s)))
            } else {
                out.append(Card(icon: .run, title: L.t("ob.ready.paces"), detail: detail, value: nil))
            }
            if let race, race != .half, let e = rc.estimates?[race.rawValue], e.status.raw == "AVAILABLE", let lo = e.lowSeconds, let hi = e.highSeconds {
                out.append(Card(icon: .race, title: L.t("ob.ready.capacity.\(race.rawValue)"), detail: L.t("ob.ready.estimate"),
                                value: Fmt.clock(lo) + "–" + Fmt.clock(hi)))
            }
        } else if rc.capacity?.status.raw != "CALIBRATED" {
            out.append(Card(icon: .clock, title: L.t("ob.ready.noPaces"), detail: L.t("ob.ready.noPaces.detail"), value: L.t("ob.ready.noPaces.value")))
        }
        return out
    }

    private static let km: [RaceDistance: Double] = [.fiveK: 5, .tenK: 10, .half: 21.0975, .marathon: 42.195]
}
