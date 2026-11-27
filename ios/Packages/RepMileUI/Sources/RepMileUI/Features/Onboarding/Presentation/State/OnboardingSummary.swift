import Foundation

/// The sentences the respiros, "Montando seu plano" and "Retomar" compose from the athlete's own answers (Figma 08, 09, 16, 28, 30,
/// `838:3918`). Only the answers: nothing here says what the plan will do. A sentence the Figma draws for one case only is not extended to
/// other cases with new wording (D22): it is omitted.
enum OBText {
    static func race(_ d: RaceDistance) -> String { L.t("event.\(d.rawValue)") }
    static func list(_ items: [String]) -> String { items.formatted(.list(type: .and).locale(Fmt.locale)) }

    private static func formatted(_ day: String, _ template: String) -> String {
        guard let d = Fmt.day(day) else { return "" }
        let f = DateFormatter(); f.calendar = Fmt.calendar; f.timeZone = Fmt.utc; f.locale = Fmt.locale
        f.setLocalizedDateFormatFromTemplate(template)
        return f.string(from: d)
    }
    /// "domingo, 20 de dezembro"
    static func weekdayDayMonth(_ day: String) -> String { formatted(day, "EEEEdMMMM") }
    /// "sáb 24 out" (08 timeline): short weekday, day and short month, without punctuation.
    static func weekdayDayMonth(short day: String) -> String {
        [formatted(day, "EEE"), formatted(day, "d"), formatted(day, "MMM")]
            .map { $0.replacingOccurrences(of: ".", with: "").lowercased(with: Fmt.locale) }.joined(separator: " ")
    }
    /// "26 out" (34 eyebrow, 30 and 28 summaries): day and short month, as the Figma writes them.
    static func dayMonth(short day: String) -> String {
        [formatted(day, "d"), formatted(day, "MMM")].map { $0.replacingOccurrences(of: ".", with: "").lowercased(with: Fmt.locale) }.joined(separator: " ")
    }
    /// "seg, 26 out" (31 period).
    static func weekdayCommaDayMonth(_ day: String) -> String {
        formatted(day, "EEE").replacingOccurrences(of: ".", with: "").lowercased(with: Fmt.locale) + ", " + dayMonth(short: day)
    }
    /// "Domingo, 20 de dezembro" (04 "Leitura da data")
    static func dateReading(_ day: String) -> String { weekdayDayMonth(day).capitalizedFirst }
    /// "14 de fevereiro de 2027"
    static func dayMonthYear(_ day: String) -> String { formatted(day, "dMMMMy") }
    /// "no domingo, 20 de dezembro" / "na segunda, 26 de outubro"
    static func onDay(_ day: String) -> String { Fmt.onWeekday(day) + ", " + formatted(day, "dMMMM") }

    static func turn(_ t: DayTurn) -> String { L.t("ob.turnPhrase.\(t.rawValue)") }

    /// "4 corridas e 3 de força"
    static func counts(runs: Int, strength: Int) -> String {
        let r = runs == 1 ? L.t("ob.count.run") : L.f("ob.count.runs", "\(runs)")
        let s = L.f("ob.count.strength", "\(strength)")
        switch (runs > 0, strength > 0) {
        case (true, true): return L.f("ob.count.pair", r, s)
        case (true, false): return r
        default: return s
        }
    }

    /// 09 / 30: "Quinta: força de manhã, corrida à noite" for each day with both.
    static func sharedDays(_ d: OnboardingDraft) -> [String] {
        guard let rt = d.runTurn, let st = d.strengthTurn else { return [] }
        return d.runDays.intersection(d.strengthDays).sorted().map { L.f("ob.week.shared", OBDays.full($0), turn(st), turn(rt)) }
    }

    /// 16: "4 corridas e 3 de força. Quinta com os dois, em turnos diferentes. Sexta livre."
    static func routineBody(_ d: OnboardingDraft) -> String {
        var parts = [counts(runs: d.runDays.count, strength: d.strengthDays.count) + "."]
        if let rt = d.runTurn, let st = d.strengthTurn, rt.engineTurn != st.engineTurn {
            for day in d.runDays.intersection(d.strengthDays).sorted() { parts.append(L.f("ob.routineDone.shared", OBDays.full(day))) }
        }
        let free = (0..<7).filter { !d.runDays.contains($0) && !d.strengthDays.contains($0) }
        if free.count == 1, let f = free.first { parts.append(L.f("ob.routineDone.free", OBDays.full(f))) }
        return parts.joined(separator: " ")
    }

    /// 30 "Objetivo" and the resume row: "10 km em 20 dez e força" (drawn for a race with strength).
    static func goal(_ d: OnboardingDraft) -> String? {
        guard let distance = d.runAim?.race, let day = d.raceDay, d.train == .both else { return nil }
        return L.f("ob.summary.goal", race(distance), dayMonth(short: day))
    }

    /// 30 "Ponto de partida": "5 km em 21:48" (the cargas part waits for D01).
    static func start(_ d: OnboardingDraft) -> String? {
        guard d.hasResult == true, let r = d.resultDistance, let m = d.resultMinutes, let s = d.resultSeconds else { return nil }
        return L.f("ob.summary.start", race(r), Fmt.clock(Double(m * 60 + s)))
    }

    /// 30 "Seus dias": "Corrida ter, qui, sáb e dom; força seg, qua e qui".
    static func days(_ d: OnboardingDraft) -> String? {
        guard !d.runDays.isEmpty, !d.strengthDays.isEmpty else { return nil }
        func names(_ s: Set<Int>) -> String { list(s.sorted().map { OBDays.short($0).lowercased(with: Fmt.locale) }) }
        return L.f("ob.summary.days", names(d.runDays), names(d.strengthDays))
    }

    /// 28 "Resultado recente": "5 km · prova oficial · 18 out" and "21:48".
    static func result(_ d: OnboardingDraft) -> (detail: String, value: String)? {
        guard d.hasResult == true, let r = d.resultDistance, let m = d.resultMinutes, let s = d.resultSeconds, let day = d.resultDay,
              let how = d.resultMeasure else { return nil }
        let measure = L.t("ob.resultDetail.\(how.rawValue)").lowercased(with: Fmt.locale)
        return ([race(r), measure, dayMonth(short: day)].joined(separator: " · "), Fmt.clock(Double(m * 60 + s)))
    }
}
