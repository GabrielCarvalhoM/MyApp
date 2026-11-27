import CoachingPresentation
import Foundation

/// Everything Hoje shows, derived from the shared types only (plan view, logged entries, presentation, week plan, the host's startability).
/// A pure mapping: it decides no prescription, reason, load, zone or rule; it only selects and formats what the engine and the record hold.
struct TodayContent: Equatable {
    struct Mark: Equatable, Identifiable {
        enum Status: Equatable { case done, missed, planned, next }
        let id: String
        let sport: Sport
        let status: Status
        /// Logged minutes when done; prescribed minutes when planned (nil under a hold: nothing is invented).
        let minutes: Double?
        let title: String
        let details: [String]
        let ordinalLabel: String?
        let session: PlannedSession
    }
    struct Day: Equatable, Identifiable {
        var id: String { date }
        let date: String
        let isToday: Bool
        let marks: [Mark]
        var isRest: Bool { marks.isEmpty }
    }
    struct Race: Equatable {
        let title: String
        let daysLeft: String?
        let range: String?
        let low: String?
        let high: String?
        let estimateCaption: String?
        let base: String?
    }
    struct Phase: Equatable, Identifiable {
        let id: Int
        let name: String?
        let timing: Int  // -1 past, 0 current, 1 ahead
    }

    let header: String
    let heroLead: String
    let heroRest: String
    let body: String?
    let weekLabel: String
    let days: [Day]
    let summary: String?
    let next: Mark?
    let startability: Startability?
    let race: Race?
    let phaseName: String?
    let phaseWeek: String?
    let phases: [Phase]

    /// `paused`: a clinical hold, or a persistent host gate that starts nothing (outside V1 scope, clinical human required). Then no session
    /// is "next", the hero never invites training and no start is offered.
    static func build(plan: PlanView, logged: LoggedEntries?, presentation: PresentationSnapshot?, weekPlan: WeekPlanProjection?,
                      paused hostPaused: Bool = false, startability: (PlannedSession) -> Startability) -> TodayContent {
        let today = plan.today
        let paused = hostPaused || plan.hold != nil || plan.state == .blocked
        let sessions = plan.week?.sessions ?? []
        let entries = (logged?.entries ?? []).filter { !$0.superseded }
        func doneEntry(_ s: PlannedSession) -> LoggedEntry? {
            entries.first { $0.sessionId == s.id && $0.date == s.date && $0.completed && $0.date <= today }
        }
        /// The athlete reported the session as not done (a record row with `completed == false`): never inferred from absence.
        func missedEntry(_ s: PlannedSession) -> LoggedEntry? {
            entries.first { $0.sessionId == s.id && $0.date == s.date && !$0.completed }
        }
        let todaySessions = sessions.filter { $0.date == today }
            .sorted { ($0.turn?.raw ?? "") < ($1.turn?.raw ?? "") }
        let nextSession = paused ? nil : todaySessions.first { doneEntry($0) == nil && missedEntry($0) == nil }

        func mark(_ s: PlannedSession, ordinal: Int?) -> Mark? {
            guard let sport = Sport(code: s.sport.raw) else { return nil }
            let done = doneEntry(s)
            let status: Mark.Status = done != nil ? .done : missedEntry(s) != nil ? .missed : (s.id == nextSession?.id && s.date == nextSession?.date ? .next : .planned)
            let minutes = done?.minutes ?? (paused ? nil : s.prescription?.durationMinutes)
            var details: [String] = []
            if let p = s.prescription, !paused {
                if sport == .strength, let ex = p.exercises {
                    details.append(L.f("today.card.strength.detail", "\(ex.count)", "\(ex.reduce(0) { $0 + $1.sets })"))
                    if let m = p.durationMinutes { details.append(L.f("common.minutes", Fmt.minutes(m))) }
                } else if sport == .run, let m = p.durationMinutes {
                    let step = presentation?.runSession(for: s).flatMap(Self.mainStep)
                    if let rpe = Fmt.rpe(step?.intensity?.rpe) { details.append(L.f("today.card.run.detail", Fmt.minutes(m), rpe)) } else { details.append(L.f("common.minutes", Fmt.minutes(m))) }
                    if let pace = step?.intensity?.pace { details.append(Fmt.paceBand(fast: pace.fastSecondsPerKm, slow: pace.slowSecondsPerKm)) }
                }
            }
            var label: String?
            if let ordinal {
                let when = status == .done ? L.t("today.card.done") : status == .missed ? L.t("today.card.missed") : status == .next ? L.t("today.card.next") : paused ? L.t("today.card.paused") : L.t("today.card.later")
                label = [ordinal > 0 ? L.f("today.card.ordinal", "\(ordinal)") : nil, when, L.code("turn.short", s.turn)].compactMap { $0 }.joined(separator: " · ")
            }
            return Mark(id: s.id + s.date, sport: sport, status: status, minutes: minutes, title: Self.title(s), details: details, ordinalLabel: label, session: s)
        }

        // Seven plan-local days of the plan's current week.
        let start = plan.week.flatMap { Fmt.day($0.startDate) }
        let dates: [String] = (0..<7).compactMap { i in start.flatMap { Fmt.calendar.date(byAdding: .day, value: i, to: $0) }.map(Fmt.dayString) }
        let days = dates.map { d -> Day in
            let ofDay = sessions.filter { $0.date == d }.sorted { ($0.turn?.raw ?? "") < ($1.turn?.raw ?? "") }
            let isToday = d == today
            let marks = ofDay.enumerated().compactMap { i, s in mark(s, ordinal: isToday ? (ofDay.count > 1 ? i + 1 : 0) : nil) }
            return Day(date: d, isToday: isToday, marks: marks)
        }
        let todayMarks = days.first { $0.isToday }?.marks ?? []

        // Header.
        let weekNo = "\(plan.weekIndex + 1)", weeksTotal = "\(plan.weeks)"
        let beforeStart = start.map { today < Fmt.dayString($0) } ?? false
        let header = beforeStart ? L.f("today.header.beforeStart", Fmt.longDay(today)) : L.f("today.header", Fmt.longDay(today), weekNo, weeksTotal)

        // Hero (the coach's voice: what passed in grey, what matters now in white). Descriptive only, from the plan's own codes.
        let lead: String, rest: String
        if paused {
            lead = L.t("today.hero.paused"); rest = L.t("today.hero.paused.rest")
        } else if todayMarks.count >= 2 {
            lead = todayMarks.allSatisfy { $0.status == .done || $0.status == .missed } ? L.t("today.hero.done") : L.t("today.hero.two")
            let a = todayMarks[0], b = todayMarks[1]
            rest = L.f("today.hero.pair", a.title, L.code("turn", a.session.turn) ?? "", b.title.lowercased(with: Fmt.locale), L.code("turn", b.session.turn) ?? "")
        } else if let m = todayMarks.first {
            lead = todayMarks.allSatisfy { $0.status == .done || $0.status == .missed } ? L.t("today.hero.done") : L.t("today.hero.one")
            rest = L.f("today.hero.single", m.title, L.code("turn", m.session.turn) ?? "")
        } else if beforeStart, let first = days.first(where: { !$0.isRest }) {
            lead = L.f("today.hero.beforeStart", Fmt.weekdayName(first.date))
            rest = first.marks.first.map { L.f("today.hero.single", $0.title, L.code("turn", $0.session.turn) ?? "") } ?? ""
        } else {
            lead = L.t("today.hero.rest")
            let upcoming = days.first { $0.date > today && !$0.isRest }
            rest = upcoming.flatMap { d in d.marks.first.map { L.f("today.hero.rest.next", $0.title.lowercased(with: Fmt.locale) + ", " + Fmt.weekdayName(d.date)) } } ?? ""
        }
        let body: String? = paused ? nil : todayMarks.compactMap { m -> String? in
            guard let p = m.session.prescription else { return nil }
            if m.sport == .run, let mins = p.durationMinutes, let effort = L.code("effort", p.effortDomain) { return L.f("today.body.run", m.title, Fmt.minutes(mins), effort) }
            if m.sport == .strength, let ex = p.exercises { return L.f("today.body.strength", m.title, "\(ex.count)", "\(ex.reduce(0) { $0 + $1.sets })") }
            return nil
        }.joined(separator: " ").nilIfEmpty

        let weekLabel = todayMarks.count >= 2 ? L.t("today.week.label.double") : L.t("today.week.label")

        // Week summary from the record: sessions done of the week's sessions; the next rest day if any.
        let planned = sessions.filter { $0.status.raw != "REST" }
        let doneCount = planned.filter { doneEntry($0) != nil }.count
        let restDay = days.first { $0.isRest && $0.date >= today }
        let summary: String? = planned.isEmpty || paused ? nil : (restDay.map { L.f("today.week.summary.rest", "\(doneCount)", "\(planned.count)", Fmt.onWeekday($0.date)) }
            ?? L.f("today.week.summary", "\(doneCount)", "\(planned.count)"))

        let next = todayMarks.first { $0.status == .next }
        return TodayContent(header: header, heroLead: lead, heroRest: rest, body: body, weekLabel: weekLabel, days: days, summary: summary, next: next,
                            startability: next.map { startability($0.session) }, race: race(plan: plan, presentation: presentation, today: today),
                            phaseName: phaseName(plan: plan, weekPlan: weekPlan), phaseWeek: L.f("today.race.week", weekNo, weeksTotal),
                            phases: (weekPlan?.weeks ?? []).map { Phase(id: $0.index, name: L.code("phase", $0.phase), timing: $0.index < plan.weekIndex ? -1 : $0.index == plan.weekIndex ? 0 : 1) })
    }

    static func title(_ s: PlannedSession) -> String {
        L.code("family", s.prescription?.family) ?? L.code("family", s.sport) ?? ""
    }
    /// The step that carries the session's effort (the first one that is not warm-up or cool-down).
    static func mainStep(_ p: RunSessionPresentation) -> RunStep? {
        p.blocks?.flatMap(\.steps).first { !["WARMUP", "COOLDOWN"].contains($0.kind.raw) }
    }
    static func phaseName(plan: PlanView, weekPlan: WeekPlanProjection?) -> String? {
        L.code("phase", weekPlan?.weeks.first { $0.index == plan.weekIndex }?.phase)
    }
    static func race(plan: PlanView, presentation: PresentationSnapshot?, today: String) -> Race? {
        let forecast = presentation?.readings?.runForecast
        guard let event = forecast?.event ?? plan.week?.sessions.compactMap({ $0.prescription?.event }).first,
              let eventName = L.code("event", event.kind) else { return nil }
        let estimate = presentation?.readings?.runCalibration?.estimates?[event.kind.raw]
        var range: String?, low: String?, high: String?
        if estimate?.status.raw == "AVAILABLE", let lo = estimate?.lowSeconds, let hi = estimate?.highSeconds {
            range = Fmt.clock(lo) + "–" + Fmt.clock(hi); low = Fmt.clock(lo); high = Fmt.clock(hi)
        }
        var base: String?
        if let ref = presentation?.readings?.runCalibration?.capacity?.reference, let km = ref.distanceKm, let s = ref.seconds, let d = ref.date {
            base = L.f("today.race.base", Fmt.distance(km: km), Fmt.clock(s), Fmt.shortDate(d))
        }
        var days: String?
        if let t = Fmt.day(today), let e = Fmt.day(event.date), let n = Fmt.calendar.dateComponents([.day], from: t, to: e).day, n >= 0 { days = L.f("today.race.days", "\(n)") }
        return Race(title: L.f("today.race.title", eventName, Fmt.weekdayAndDate(event.date)), daysLeft: days, range: range, low: low, high: high,
                    estimateCaption: range == nil ? nil : L.f("today.race.estimate", eventName), base: range == nil ? nil : base)
    }
}

extension String {
    var nilIfEmpty: String? { isEmpty ? nil : self }
}

/// One banner of Today's banner area (#73).
enum TodayBanner: Equatable {
    case urgentHold
    case gate(NotStartableReason)
    case state(ClientState)
}

extension TodayContent {
    /// Today's banners, in order: a hold at URGENT_CARE_ADVISED first and never hidden, not even by a host gate (QRE P3-2); then the host's
    /// gate; else the plan state's own banner (the urgent banner already stands for a blocked plan).
    static func banners(plan: PlanView, gate: NotStartableReason?) -> [TodayBanner] {
        let urgent = plan.clinicalGuidance == .urgentCare
        var out: [TodayBanner] = urgent ? [.urgentHold] : []
        if let gate, gate != .blocked {
            out.append(.gate(gate))
        } else if !urgent, [ClientState.blocked, .pendingConfirmation, .returning, .needsInput].contains(plan.state) {
            out.append(.state(plan.state))
        }
        return out
    }
}
