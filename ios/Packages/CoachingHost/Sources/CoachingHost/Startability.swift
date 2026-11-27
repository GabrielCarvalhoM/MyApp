import Foundation
import CoachingPresentation

// MARK: - CoachingReading.startability (the host's native rules over the engine's view)

extension CoachingHost {
    /// A handoff §4 item 10 and 18a: `executable && !SEC-FPV-01 && !screen pending && trusted clock && R7-B0 valid && !outside scope`. The engine's
    /// view says whether the session is executable; the host adds the native rules. Fail closed: anything unreadable is not startable.
    public func startability(sessionId: String) async -> Startability {
        await onQueue { self.startabilityOnQueue(sessionId) }
    }

    func startabilityOnQueue(_ sessionId: String) -> Startability {
        dispatchPrecondition(condition: .onQueue(queue))
        // #49 P2-1: the signals are read again from disk under the athlete's lock (another instance or process may have written them), and
        // that one snapshot is what every rule below reads. The lock not obtained: nothing starts.
        // QRE-A-02/08: signals that are not durable, unreadable, or a restart whose outcome was never resolved: nothing starts.
        let snapshot: HostSignals? = try? store.withLock(athleteId) { () -> HostSignals? in
            signals.flush()
            return signals.unreadable || signals.dirty ? nil : signals.current
        }
        guard let sig = snapshot, !sig.pendingIntake else { return .notStartable(reason: .recordUnavailable) }
        // FND-ABC-04 / 04b first: a refused or clinical restart leaves the earlier plan executable in the record.
        switch sig.scope {
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
        if sig.screenRequiredAfterErasure || sig.warningSignsAsked { return .notStartable(reason: .screenRequired) }
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
}
