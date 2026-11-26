import Foundation
import IntegrationContracts
import CoachingPresentation

// MARK: - CoachingReading

extension CoachingHost: CoachingReading {
    public func plan(week: Int?) async -> Result<PlanView, BoundaryError> {
        let a = await onQueue { self.perform("plan", [("week", week.map(String.init) ?? "null")], clockRule: .read) }
        return Self.result(a, PlanView.self, key: "view")
    }
    public func allWeeks() async -> Result<[Week], BoundaryError> {
        struct Weeks: Decodable { let weeks: [Week?] }
        let a = await onQueue { self.perform("sessions", clockRule: .read) }
        return Self.result(a, Weeks.self).map { $0.weeks.compactMap { $0 } }
    }
    public func presentation() async -> Result<PresentationSnapshot, BoundaryError> {
        let a = await onQueue { self.perform("presentation", clockRule: .read) }
        return Self.result(a, PresentationSnapshot.self)
    }
    public func history() async -> Result<HistoryView, BoundaryError> {
        let a = await onQueue { self.perform("history", clockRule: .read) }
        return Self.result(a, HistoryView.self, key: "history")
    }
    public func decision(id: String) async -> Result<DecisionDetail, BoundaryError> {
        let a = await onQueue { self.perform("decision", [("decisionId", JSONText.string(id))], clockRule: .read) }
        return Self.result(a, DecisionDetail.self, key: "decision")
    }
    public func loggedEntries() async -> Result<LoggedEntries, BoundaryError> {
        let a = await onQueue { self.perform("loggedEntries", clockRule: .read) }
        return Self.result(a, LoggedEntries.self)
    }
    public func weekPlan() async -> Result<WeekPlanProjection, BoundaryError> {
        let a = await onQueue { self.perform("weekPlan", clockRule: .read) }
        return Self.result(a, WeekPlanProjection.self)
    }
    public func warningSignSet(condition: String) async -> Result<WarningSignQuestionSet, BoundaryError> {
        let a = await onQueue { self.perform("warningSignSet", [("condition", JSONText.string(condition))], clockRule: .read) }
        if let e = a.object["error"] as? String { return .failure(BoundaryError(code: Code(raw: e))) }
        guard let v = Self.decode(WarningSignQuestionSet.self, a.data) else { return .failure(Self.boundaryError(a)) }
        return .success(v)
    }
    public func pendingReports() async -> PendingReports {
        await onQueue { PendingReports(count: self.inFlightWritesCount, oldestQueuedAt: nil) }
    }

    /// A handoff §4 item 10 and 18a: `executable && !SEC-FPV-01 && !screen pending && trusted clock && R7-B0 valid && !outside scope`. The engine's
    /// view says whether the session is executable; the host adds the native rules. Fail closed: anything unreadable is not startable.
    public func startability(sessionId: String) async -> Startability {
        await onQueue { self.startabilityOnQueue(sessionId) }
    }

    func startabilityOnQueue(_ sessionId: String) -> Startability {
        dispatchPrecondition(condition: .onQueue(queue))
        // QRE-A-02/08: signals that are not durable, unreadable, or a restart whose outcome was never resolved: nothing starts.
        signals.flush()
        if signals.unreadable || signals.dirty || signals.current.pendingIntake { return .notStartable(reason: .recordUnavailable) }
        // FND-ABC-04 / 04b first: a refused or clinical restart leaves the earlier plan executable in the record.
        switch signals.current.scope {
        case .outsideV1Scope: return .notStartable(reason: .outsideV1Scope)
        case .clinicalHumanRequired: return .notStartable(reason: .clinicalHumanRequired)
        case nil: break
        }
        let planA = perform("plan", [("week", "null")], clockRule: .read)
        guard planA.ok, let view = Self.result(planA, PlanView.self, key: "view").value else { return .notStartable(reason: .recordUnavailable) }
        if case .unrecognized = view.state { return .notStartable(reason: .recordUnavailable) }
        if view.state == .blocked || view.hold != nil { return .notStartable(reason: .blocked) }
        struct Weeks: Decodable { let weeks: [Week?] }
        let weeksA = perform("sessions", clockRule: .read)
        guard let weeks = Self.result(weeksA, Weeks.self).value else { return .notStartable(reason: .recordUnavailable) }
        guard let session = weeks.weeks.compactMap({ $0 }).flatMap(\.sessions).first(where: { $0.id == sessionId }) else { return .notStartable(reason: .notExecutable) }
        if session.projected { return .notStartable(reason: .projected) }
        if !session.executable { return .notStartable(reason: .notExecutable) }
        if signals.current.screenRequiredAfterErasure || signals.current.warningSignsAsked { return .notStartable(reason: .screenRequired) }
        let presA = perform("presentation", clockRule: .read)
        guard let pres = Self.result(presA, PresentationSnapshot.self).value else { return .notStartable(reason: .recordUnavailable) }
        if pres.readings?.warningSignScreen?.status == "REQUIRED" { return .notStartable(reason: .screenRequired) }
        if view.question?.missingInputs.contains(where: Self.asksWarningSigns) == true { return .notStartable(reason: .screenRequired) }
        if case .aheadOfReference = clock.check() { return .notStartable(reason: .clockUntrusted) }
        let rep = (try? runtime.call("repertoire", [JSONText.object([("today", JSONText.string(view.today))])])).flatMap { try? JSONSerialization.jsonObject(with: Data($0.utf8)) as? [String: Any] }
        if rep?["valid"] as? Bool != true { return .notStartable(reason: .repertoireExpired) }
        return .startable
    }

    static func asksWarningSigns(_ input: String) -> Bool {
        input.hasPrefix("wellbeing.warningSigns") || input.hasPrefix("wellbeingCheck.warningSigns") || input.hasPrefix("readiness.warningSigns")
            || input.hasPrefix("wellbeingCheck.improved") || input.hasPrefix("wellbeingCheck.exerciseResponse")
    }

    var inFlightWritesCount: Int { inFlightWritesValue }
}

extension Result {
    var value: Success? { if case .success(let v) = self { return v }; return nil }
}

// MARK: - CoachingWriting

extension CoachingHost: CoachingWriting {
    /// A write: the facade call, then `kept`/`notKept` (computed by the facade right after the write, same call), then the native signals,
    /// then B's signals (after the commit).
    struct Write {
        let answer: Answer
        let outcome: WriteOutcome
        var signalConditions = false
        var purge: QueuePurgeReason? = nil
    }

    func outcome(_ a: Answer) -> WriteOutcome {
        WriteOutcome(answer: Self.answer(a), kept: a.object["kept"] as? [String] ?? [], notKept: a.object["notKept"] as? [String] ?? [])
    }

    func write(_ body: @escaping () -> Write) async -> WriteOutcome {
        let w: Write = await onQueue { self.inFlightWritesValue += 1; defer { self.inFlightWritesValue -= 1 }; let w = body(); if self.testing { self.lastAnswerJSON = w.answer.json }; return w }
        // CCP-A-04: an account erasure's purge, or one still owed by an earlier erasure (fence NATIVE_DONE), marks the fence ERASED once it returns.
        if let p = w.purge, p != .accountErased { try? await queueControl?.purge(p); await settleOwedPurge(nil) } else { await settleOwedPurge(w.purge) }
        if w.signalConditions { await queueControl?.deliveryConditionsChanged() }
        return w.outcome
    }

    static func localDay(_ ms: Double, offsetMinutes: Int) -> String {
        let f = DateFormatter(); f.calendar = Calendar(identifier: .gregorian); f.locale = Locale(identifier: "en_US_POSIX")
        f.timeZone = TimeZone(secondsFromGMT: offsetMinutes * 60); f.dateFormat = "yyyy-MM-dd"
        return f.string(from: Date(timeIntervalSince1970: ms / 1000))
    }

    /// The intake envelope only the host writes (`IntakeRequest`): today in the device's offset, that offset as the plan's fixed offset, the
    /// learning consent as stated, and the only custody mode V1 has (synthetic shadow reference; OPEN-4).
    func intake(_ answers: OnboardingAnswers, learning: Bool) -> IntakeRequest {
        let offset = timezoneOffsetOverride ?? TimeZone.current.secondsFromGMT() / 60
        return IntakeRequest(answers: answers, asOf: Self.localDay(clock.source.wallMs(), offsetMinutes: offset), timezoneOffsetMinutes: offset,
                             learningConsent: learning, mode: .syntheticShadowReference)
    }

    public func onboard(_ answers: OnboardingAnswers, consents: Consents) async -> WriteOutcome {
        let intake = intake(answers, learning: consents.learning)
        return await write {
            guard let i = try? JSONText.encode(intake), let c = try? JSONText.encode(consents) else { return self.invalid() }
            // CCP-A-04 (Security R1 F1, code review R1 #1/#5c): the enrolment's checks and its seal run under the athlete's lock and then the
            // install lock, the same order as an erasure's key removal, so the two never interleave. Nothing is enrolled while any erasure is
            // incomplete or its B purge is owed (that purge must reach B before a new athlete's data does), nor beside another athlete's record
            // (the integrity key is per install, NATIVE 1.5, and an erasure removes it, 6.3).
            var a = Self.hostFailure("BUSY", "Another process holds this record")
            do {
                try self.store.withLock(self.athleteId) { try self.store.withLock(tag: NativeStore.installTag) {
                    if self.fence.state(self.tag) == nil, (self.fence.tags(.requested) ?? ["?"]).isEmpty == false || (self.fence.tags(.nativeDone) ?? ["?"]).isEmpty == false {
                        a = Self.hostFailure(HostCode.hostUnavailable, "An account erasure is still completing on this install; try again")
                    } else if self.fence.state(self.tag) == nil, self.store.hasRecord(otherThan: self.tag) {
                        a = Self.hostFailure("ANOTHER_ATHLETE_ON_THIS_INSTALL", "Another athlete is enrolled on this install")
                    } else {
                        a = self.perform("onboard", [("intake", i), ("consents", c)], requestId: self.idSource(), clockRule: .bounded)
                    }
                } }
            } catch NativeStore.StoreError.io { a = Self.hostFailure(HostCode.hostUnavailable, "The record cannot be opened now") } catch {}
            var w = Write(answer: a, outcome: self.outcome(a))
            if a.ok {
                self.afterIntake(w.outcome.answer)
                // enroll (contract §4.2): only when a record now exists (a refusal by scope enrols nothing).
                if w.outcome.answer.planOutcome == .planCreated { w.signalConditions = true }
            }
            if self.takeClockRecovery(a) { w.signalConditions = true }
            return w
        }
    }

    public func restart(_ answers: OnboardingAnswers) async -> WriteOutcome {
        // The learning consent of a restart is the one on record; the intake states it as the engine reads it (the custody keeps consents apart).
        let intake = intake(answers, learning: false)
        return await write {
            guard let i = try? JSONText.encode(intake) else { return self.invalid() }
            // QRE-A-02: the restart is marked in flight, durably, BEFORE it is sent; if that cannot be written, nothing is sent.
            // CCP-A-04 F5: no side file is recreated for an erased athlete (the custody answers GONE).
            if self.fencedOnQueue { let a = self.perform("restart", [("intake", i)], versioned: true, clockRule: .bounded); return Write(answer: a, outcome: self.outcome(a)) }
            guard self.signals.update({ $0.pendingIntake = true }) else { return self.notDurable() }
            let a = self.perform("restart", [("intake", i)], versioned: true, clockRule: .bounded)
            var w = Write(answer: a, outcome: self.outcome(a))
            if a.ok { self.afterIntake(w.outcome.answer); if w.outcome.answer.planOutcome == .planCreated { w.signalConditions = true } }
            else { self.signals.update { $0.pendingIntake = false } }      // refused before the engine: nothing changed
            if self.takeClockRecovery(a) { w.signalConditions = true }
            return w
        }
    }

    /// FND-ABC-04 / 04b: the persistent scope signal, from the engine's own outcome of the intake.
    func afterIntake(_ answer: BoundaryAnswer) {
        switch answer.planOutcome {
        case .planCreated: signals.update { $0.scope = nil; $0.pendingIntake = false; $0.warningSignsAsked = false }
        case .outsideV1Scope: signals.update { $0.scope = .outsideV1Scope; $0.pendingIntake = false }
        case .clinicalHumanRequired: signals.update { $0.scope = .clinicalHumanRequired; $0.pendingIntake = false }
        default: signals.update { $0.pendingIntake = false }   // ASK, INVALID_INPUT: no scope signal (the earlier state stands)
        }
        trackWarningSigns(answer, releasable: true)
    }

    /// A18a (ii): an answer that asks for the warning signs keeps every session from starting until an answer no longer asks for them.
    /// QRE-A-05: set by any answer that asks; released only by the answer to a request that carried sign answers or a screen (`releasable`).
    func trackWarningSigns(_ answer: BoundaryAnswer, releasable: Bool) {
        guard answer.ok else { return }
        let asks = answer.warningSignScreen?.status == "REQUIRED" || (answer.missingInputs ?? []).contains(where: Self.asksWarningSigns)
            || (answer.view?.question?.missingInputs ?? []).contains(where: Self.asksWarningSigns)
        if asks { signals.update { $0.warningSignsAsked = true } } else if releasable { signals.update { $0.warningSignsAsked = false } }
    }

    /// A safety signal could not be made durable before the operation: nothing is sent (QRE-A-02).
    func notDurable() -> Write {
        let a = Self.hostFailure("PERSISTENCE_FAILURE", "A safety signal could not be saved; nothing was sent")
        return Write(answer: a, outcome: outcome(a))
    }

    func invalid() -> Write {
        let a = Self.hostFailure("INVALID_REQUEST", "The request could not be encoded")
        return Write(answer: a, outcome: outcome(a))
    }

    public func submit(_ review: ReviewRequest) async -> WriteOutcome {
        await write {
            guard let r = try? JSONText.encode(review) else { return self.invalid() }
            let answersSigns: Bool = { switch review.body { case .notFeeling100, .wellbeingCheck, .readiness: return true; default: return false } }()
            return self.submitOnQueue(review: r, screened: review.eligibility != nil, answersSigns: answersSigns)
        }
    }

    /// Every athlete review through `integration.submit` (FND-ABC-03). `screened`: the review carries `eligibility` (a new screen).
    func submitOnQueue(review json: String, screened: Bool, answersSigns: Bool = false) -> Write {
        let a = perform("submit", [("review", json)], versioned: true, requestId: idSource(), clockRule: .bounded)
        var w = Write(answer: a, outcome: outcome(a))
        if a.ok {
            if screened {
                // SEC-FPV-01: the signal falls only when a request with `eligibility` is recorded (a replayed answer recorded it before).
                signals.update { $0.screenRequiredAfterErasure = false }
                w.signalConditions = true                    // a new screen frees SCREEN_REQUIRED and the NOT_RECORDED of an ASK (§4.2)
            }
            trackWarningSigns(w.outcome.answer, releasable: screened || answersSigns)
        }
        if takeClockRecovery(a) { w.signalConditions = true }
        return w
    }

    public func accept(decisionId: String) async -> WriteOutcome { await adoption("accept", decisionId) }
    public func decline(decisionId: String) async -> WriteOutcome { await adoption("decline", decisionId) }
    func adoption(_ fn: String, _ id: String) async -> WriteOutcome {
        await write {
            let a = self.perform(fn, [("decisionId", JSONText.string(id))], versioned: true, clockRule: .bounded)
            var w = Write(answer: a, outcome: self.outcome(a)); if self.takeClockRecovery(a) { w.signalConditions = true }; return w
        }
    }

    public func setHeartRateProfile(_ profile: HeartRateProfileRequest) async -> Result<HeartRateProfileAnswer, BoundaryError> {
        let r: (Answer, Bool) = await onQueue {
            guard let p = try? JSONText.encode(profile) else { return (Self.hostFailure("INVALID_REQUEST", "The profile could not be encoded"), false) }
            let a = self.perform("setHeartRateProfile", [("heartRateProfile", p)], versioned: true, requestId: self.idSource(), clockRule: .bounded)
            return (a, self.takeClockRecovery(a))
        }
        if r.1 { await queueControl?.deliveryConditionsChanged() }
        return r.0.ok ? Self.result(r.0, HeartRateProfileAnswer.self) : .failure(Self.boundaryError(r.0))
    }

    public func eraseHeartRateProfile() async -> Result<HeartRateProfileAnswer, BoundaryError> {
        let a: Answer = await onQueue { self.perform("eraseHeartRateProfile", [], versioned: true, requestId: self.idSource(), clockRule: .exempt) }
        return a.ok ? Self.result(a, HeartRateProfileAnswer.self) : .failure(Self.boundaryError(a))
    }

    public func setConsent(_ purpose: ConsentPurpose, granted: Bool) async -> WriteOutcome {
        await write {
            let a = self.perform("setConsent", [("purpose", JSONText.string(purpose.rawValue)), ("granted", JSONText.bool(granted))], versioned: true,
                                 clockRule: granted ? .bounded : .exempt)
            var w = Write(answer: a, outcome: self.outcome(a))
            if a.ok && granted { w.signalConditions = true }
            if self.takeClockRecovery(a) { w.signalConditions = true }
            return w
        }
    }

    public func eraseHealthFacts(eventIds: [String]) async -> WriteOutcome {
        await write {
            guard let ids = try? JSONText.encode(eventIds) else { return self.invalid() }
            // SEC-FPV-01 / N-3: after ANY erasure, no session starts until a new screen is recorded. Set durably BEFORE the erasure is sent
            // (QRE-A-02); withdrawn only if the erasure was refused and the signal was not set before.
            if self.fencedOnQueue {      // CCP-A-04 F5
                let a = self.perform("eraseHealthFacts", [("eventIds", ids)], versioned: true, clockRule: .exempt); return Write(answer: a, outcome: self.outcome(a))
            }
            let before = self.signals.current.screenRequiredAfterErasure
            guard self.signals.update({ $0.screenRequiredAfterErasure = true }) else { return self.notDurable() }
            let a = self.perform("eraseHealthFacts", [("eventIds", ids)], versioned: true, clockRule: .exempt)
            if !a.ok && !before { self.signals.update { $0.screenRequiredAfterErasure = false } }
            return Write(answer: a, outcome: self.outcome(a))
        }
    }

    /// Account erasure (G07, 6.3; CCP-A-04): the erasure fence is written REQUESTED first; the boundary erases the record, writes its tombstone
    /// and clears the anchor; then the native side removes the store file, its `.tmp`, the host's side files, the anchor and the integrity key,
    /// each checked, and the fence becomes NATIVE_DONE; then B purges, and the fence becomes ERASED once that returned. From then on the custody answers GONE for this athlete id in every process,
    /// whatever the key (a new account is a new athlete). A fence that cannot be written starts nothing (not durable: retry).
    public func eraseAccount() async -> WriteOutcome {
        await write {
            let was = self.fence.state(self.tag), complete = was == .erased || was == .nativeDone
            // Core R1 F1: an erasure already complete is served the fence, so the custody answers GONE itself, as in the frozen flow.
            if !complete {
                guard self.fence.set(self.tag, .requested) else {
                    let a = Self.hostFailure("PERSISTENCE_FAILURE", "The account erasure could not be started; nothing was erased")
                    return Write(answer: a, outcome: self.outcome(a))
                }
                self.pendingErasures.insert(self.tag)
            }
            // Security R1 F6: the boundary erasure, the native removals and the fence update run under ONE hold of the athlete's lock; the
            // fence is not served only for this one call (reset by defer), and never when the erasure was already complete.
            // Code review R1 #7: the lock is retried as `perform` retries BUSY; a lock never obtained leaves the erasure pending (the fence is
            // REQUESTED, nothing else runs, the next operation or start completes it), and the answer says so.
            var a = Self.hostFailure(HostCode.hostUnavailable, "The account erasure is pending; it completes at the next attempt"), done = false
            for attempt in 0..<3 {
                do {
                    try self.store.withLock(self.athleteId) {
                        self.servingErasure = !complete
                        defer { self.servingErasure = false }
                        a = self.perform("eraseAccount", clockRule: .exempt)
                        // A repeat of a complete erasure writes no new fence and no new time (the custody's GONE is its answer); a record file
                        // put back since is removed again (code review R1 #8).
                        if a.ok || a.code == "NOT_ENROLLED" || a.code == "GONE" { done = complete ? self.store.eraseFiles(tag: self.tag) : self.completeErasure(tag: self.tag) }
                    }
                    break
                } catch NativeStore.StoreError.busy { if attempt < 2 { usleep(self.busyRetryDelay) } } catch { break }
            }
            var w = Write(answer: a, outcome: self.outcome(a))
            // QRE-A-06: the native side is erased also when the boundary has no record (never enrolled, or after a record loss): the signals,
            // the clock reference and the key must not outlive the athlete's erasure request. Core R1 F2: that id is fenced too (A's host-level
            // outcome: the athlete asked to erase this account; a new account is a new athlete).
            if a.ok || a.code == "NOT_ENROLLED" || a.code == "GONE" {
                if !done {
                    let f = Self.hostFailure("PERSISTENCE_FAILURE", "The account was erased but a device copy could not be removed yet; try again")
                    w = Write(answer: f, outcome: self.outcome(f))
                }
                w.purge = .accountErased
            }
            // Any other answer (a technical failure): the fence stays REQUESTED, nothing else runs, and the next operation or start completes it.
            return w
        }
    }

    /// Reachable only from the RECORD_LOST / RECORD_ROLLED_BACK screen (the boundary refuses it otherwise: NOT_LOST).
    public func acknowledgeRecordLoss() async -> WriteOutcome {
        await write {
            // Security R1 F3: the one boundary path that does not consult the tombstone refuses an erased athlete as the custody would.
            if self.fencedOnQueue { let g = Self.gone(); return Write(answer: g, outcome: self.outcome(g)) }
            let a = self.perform("acknowledgeRecordLoss", clockRule: .exempt)
            var w = Write(answer: a, outcome: self.outcome(a))
            if a.ok { w.purge = .recordLossAcknowledged }
            return w
        }
    }
}

// MARK: - TimeInZoneClassifying

extension CoachingHost: TimeInZoneClassifying {
    /// The facade's `timeInZones` (the engine classifier over the current five-zone reading) behind the shared gate (`enabled:false` until
    /// SSCTR C10). Never a Swift zone table.
    public func timeInZones(_ series: HeartRateSeries) async -> TimeInZoneReading {
        let a: Answer = await onQueue {
            guard let s = try? JSONText.encode(series) else { return Self.hostFailure("INVALID_REQUEST", "series") }
            return self.perform("timeInZones", [("series", s), ("durationSeconds", String(series.durationSeconds))], clockRule: .read)
        }
        if let r = Self.decode(TimeInZoneReading.self, a.data) { return r }
        let reason = Self.boundaryError(a).code.raw
        return Self.decode(TimeInZoneReading.self, Data("{\"status\":\"UNAVAILABLE\",\"reason\":\(JSONText.string(reason)),\"fromAverageHeartRate\":false}".utf8))!
    }
}

// MARK: - DeviceActivitySink

extension CoachingHost: DeviceActivitySink {
    public func ingestContext() async -> IngestContextResult {
        let a: Answer = await onQueue { self.perform("ingestContext", clockRule: .read) }
        guard a.ok, let day = a.object["recordStartDay"] as? String, let tz = (a.object["timezoneOffsetMinutes"] as? NSNumber)?.intValue,
              let v = (a.object["version"] as? NSNumber)?.intValue, let runs = a.object["runSessions"] as? [[String: Any]] else {
            return .unavailable(code: a.code ?? HostCode.hostUnavailable)
        }
        return .ready(IngestContext(recordStartDay: day, timezoneOffsetMinutes: tz,
                                    runSessions: runs.compactMap { r in (r["sessionId"] as? String).flatMap { s in (r["day"] as? String).map { PlannedRunSession(sessionId: s, day: $0) } } },
                                    version: v))
    }

    /// Contract §4.1 item 1 and §6.1: `importActivities` with the authenticated actor, `clientRequestId = deliveryId` (`<deliveryId>~<n>` after a
    /// stale version or a reused id, at most 3), the current version; BUSY retried with the same id at most 3 times, then `retryLater`; D1 refuses
    /// before custody (`waiting`). Exactly one `DeliveryResult`; never throws.
    public func deliver(_ delivery: DeviceDelivery) async -> DeliveryResult {
        let r: (DeliveryResult, Bool) = await onQueue {
            guard let acts = try? JSONText.encode(delivery.activities) else { return (.refused(code: "INVALID_REQUEST", index: nil, disposition: .adapterBug), false) }
            var n = 0
            let saved = self.idSource
            self.idSource = { n += 1; return "\(delivery.deliveryId)~\(n)" }
            defer { self.idSource = saved }
            let a = self.perform("importActivities", [("activities", acts)], versioned: true, requestId: delivery.deliveryId, clockRule: .bounded)
            return (Self.deliveryResult(a), self.takeClockRecovery(a))
        }
        if r.1 { await queueControl?.deliveryConditionsChanged() }
        // Code review R1 #5b: an erasure completed during this delivery owes B a purge; it is sent outside B's call (never re-entering it).
        if await onQueue({ !self.purgeOwed.isEmpty }) { Task { await self.settleOwedPurge(nil) } }
        return r.0
    }

    static func deliveryResult(_ a: Answer) -> DeliveryResult {
        if a.ok, let v = (a.object["version"] as? NSNumber)?.intValue {
            let items = (a.object["activities"] as? [[String: Any]] ?? []).compactMap { x -> ActivityResult? in
                guard let i = (x["index"] as? NSNumber)?.intValue, let id = x["activityId"] as? String, let o = x["outcome"] as? String else { return nil }
                let outcome: ActivityOutcome
                switch o {
                case "RECORDED": outcome = .recorded(eventId: x["eventId"] as? String ?? "")
                case "DUPLICATE": outcome = .duplicate
                default: outcome = .notRecorded(reason: x["reason"] as? String ?? o)
                }
                return ActivityResult(index: i, activityId: id, outcome: outcome)
            }
            return .answered(version: v, activities: items)
        }
        let e = a.object["error"] as? [String: Any], code = e?["code"] as? String ?? "OPERATIONAL_ERROR", index = (e?["index"] as? NSNumber)?.intValue
        if code == HostCode.clockAheadOfReference { return .waiting(code: code) }
        if code == "HOST_NOT_OPEN" || code == HostCode.hostUnavailable { return .hostUnavailable }
        switch BoundaryDisposition.of(code: code, index: index) {
        case .waiting: return .waiting(code: code)
        case .retryLater: return .retryLater(code: code)
        case .halted: return .halted(code: code)
        case let d: return .refused(code: code, index: index, disposition: d)
        }
    }
}
