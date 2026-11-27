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
        /// Only `.accountErased` (the fence carries it); every other purge is a durable `PurgeIntent` (#49 P2-2).
        var purge: QueuePurgeReason? = nil
    }

    func outcome(_ a: Answer) -> WriteOutcome {
        WriteOutcome(answer: Self.answer(a), kept: a.object["kept"] as? [String] ?? [], notKept: a.object["notKept"] as? [String] ?? [])
    }

    func write(_ body: @escaping () -> Write) async -> WriteOutcome {
        let w: Write = await onQueue { self.inFlightWritesValue += 1; defer { self.inFlightWritesValue -= 1 }; let w = body(); if self.testing { self.lastAnswerJSON = w.answer.json }; return w }
        // CCP-A-04 / CCP-B-04 rule 2: every purge owed (an intent, an account erasure's, one still owed by an earlier erasure) is sent; each
        // is settled only once it returns.
        await settleOwedPurge(w.purge)
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
        await settleOwedPurge(nil)          // #49 review P2-2: an owed purge B can take now never refuses this enrolment
        return await write {
            guard let i = try? JSONText.encode(intake), let c = try? JSONText.encode(consents) else { return self.invalid() }
            return self.underAthleteLock {
            // CCP-A-04 (Security R1 F1, code review R1 #1/#5c): the enrolment's checks and its seal run under the athlete's lock and then the
            // install lock, the same order as an erasure's key removal, so the two never interleave. Nothing is enrolled while any erasure is
            // incomplete or a B purge is owed (that purge must reach B before a new athlete's data does; #49 P2-2: also a fresh-install or
            // record-loss purge), nor beside another athlete's record
            // (the integrity key is per install, NATIVE 1.5, and an erasure removes it, 6.3).
            var a = Self.hostFailure("BUSY", "Another process holds this record")
            do {
                try self.store.withLock(self.athleteId) { try self.store.withLock(tag: NativeStore.installTag) {
                    if self.fence.state(self.tag) == nil, (self.fence.tags(.requested) ?? ["?"]).isEmpty == false || (self.fence.tags(.nativeDone) ?? ["?"]).isEmpty == false {
                        a = Self.hostFailure(HostCode.hostUnavailable, "An account erasure is still completing on this install; try again")
                    } else if self.fence.state(self.tag) == nil, !self.purgeIntent.owed().isEmpty {
                        HostLog.host("enrolment-waits-for-purge", code: "PURGE_OWED")
                        a = Self.hostFailure(HostCode.hostUnavailable, "The device queue has not been cleared yet; try again")
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
    }

    public func restart(_ answers: OnboardingAnswers) async -> WriteOutcome {
        // The learning consent of a restart is the one on record; the intake states it as the engine reads it (the custody keeps consents apart).
        let intake = intake(answers, learning: false)
        return await write {
            guard let i = try? JSONText.encode(intake) else { return self.invalid() }
            // QRE-A-02: the restart is marked in flight, durably, BEFORE it is sent; if that cannot be written, nothing is sent.
            // CCP-A-04 F5: no side file is recreated for an erased athlete (the custody answers GONE).
            return self.underAthleteLock {
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
    }

    /// #49 review P1-1: ONE hold of the athlete's lock across a safety signal's mark, the operation it guards and its resolution, so no other
    /// instance or process commits in between (the lock is re-entrant: `perform` and `signals` run inside it). Retried as `perform` retries BUSY.
    func underAthleteLock(_ body: () -> Write) -> Write {
        for attempt in 0..<3 {
            do { return try store.withLock(athleteId) { body() } }
            catch NativeStore.StoreError.busy { if attempt < 2 { usleep(busyRetryDelay) } }
            catch { let a = Self.hostFailure(HostCode.hostUnavailable, "The record cannot be opened now"); return Write(answer: a, outcome: outcome(a)) }
        }
        let a = Self.hostFailure("BUSY", "Another process holds this record")
        return Write(answer: a, outcome: outcome(a))
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
        underAthleteLock { submitLocked(review: json, screened: screened, answersSigns: answersSigns) }
    }
    private func submitLocked(review json: String, screened: Bool, answersSigns: Bool) -> Write {
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
            // (QRE-A-02); withdrawn only if the erasure was refused and the signal was not set before. All under one hold (review P1-1).
            return self.underAthleteLock {
            if self.fencedOnQueue {      // CCP-A-04 F5
                let a = self.perform("eraseHealthFacts", [("eventIds", ids)], versioned: true, clockRule: .exempt); return Write(answer: a, outcome: self.outcome(a))
            }
            var before = false        // #49 P2-1: read under the lock, from the file as it is now
            guard self.signals.update({ before = $0.screenRequiredAfterErasure; $0.screenRequiredAfterErasure = true }) else { return self.notDurable() }
            let a = self.perform("eraseHealthFacts", [("eventIds", ids)], versioned: true, clockRule: .exempt)
            if !a.ok && !before { self.signals.update { $0.screenRequiredAfterErasure = false } }
            return Write(answer: a, outcome: self.outcome(a))
            }
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
            // #49 P2-2 (CCP-B-04 rule 2): B's purge is owed durably BEFORE the acknowledgement is sent; if that cannot be written, nothing is
            // sent. Withdrawn only for a refusal known to commit nothing, and only if the file is still the one this call wrote (review P2-1):
            // any other answer keeps it (a spurious purge is harmless).
            // An intent already owed (an earlier acknowledgement whose purge has not returned) is kept as it is and never withdrawn.
            var token: String?
            if !self.purgeIntent.isOwed(.recordLossAcknowledged) {
                guard let t = self.owePurgeToken(.recordLossAcknowledged) else { return self.notDurable() }
                token = t
            }
            let a = self.perform("acknowledgeRecordLoss", clockRule: .exempt)
            if let token, !a.ok, ["NOT_LOST", "GONE", "BUSY", HostCode.hostUnavailable].contains(a.code ?? "") {
                _ = try? self.store.withLock(tag: NativeStore.installTag) { self.purgeIntent.withdraw(.recordLossAcknowledged, token: token) }
            }
            return Write(answer: a, outcome: self.outcome(a))
        }
    }
}
