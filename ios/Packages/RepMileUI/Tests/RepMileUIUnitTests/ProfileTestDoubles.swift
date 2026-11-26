import CoachingPresentation
import Foundation
@testable import RepMileUI

/// The fixture writer for the Profile and heart-rate view-model tests (#32 increments 5 and 6): the engine's captured answers, an optional
/// delay on every privacy write (a request still in flight) and per-call overrides for the answers no scenario captures.
final class PrivacyWriter: CoachingWriting {
    let base = FixtureCoachingWriter(store: Repo.store)
    let delay: Duration
    let consentAnswer: BoundaryAnswer?
    let accountAnswer: BoundaryAnswer?
    let healthAnswer: BoundaryAnswer?
    let eraseProfileResult: Result<HeartRateProfileAnswer, BoundaryError>?

    init(delay: Duration = .zero, consentAnswer: BoundaryAnswer? = nil, accountAnswer: BoundaryAnswer? = nil, healthAnswer: BoundaryAnswer? = nil,
         eraseProfileResult: Result<HeartRateProfileAnswer, BoundaryError>? = nil) {
        self.delay = delay; self.consentAnswer = consentAnswer; self.accountAnswer = accountAnswer; self.healthAnswer = healthAnswer
        self.eraseProfileResult = eraseProfileResult
    }

    func calls(_ name: String) -> [Data] { base.journal.entries.filter { $0.call == name }.map(\.json) }

    private func wait() async { if delay > .zero { try? await Task.sleep(for: delay) } }

    func setConsent(_ purpose: ConsentPurpose, granted: Bool) async -> WriteOutcome {
        let out = await base.setConsent(purpose, granted: granted)
        await wait()
        return consentAnswer.map { WriteOutcome(answer: $0, kept: [], notKept: []) } ?? out
    }
    func eraseHealthFacts(eventIds: [String]) async -> WriteOutcome {
        let out = await base.eraseHealthFacts(eventIds: eventIds)
        await wait()
        return healthAnswer.map { WriteOutcome(answer: $0, kept: [], notKept: []) } ?? out
    }
    func eraseAccount() async -> WriteOutcome {
        let out = await base.eraseAccount()
        await wait()
        return accountAnswer.map { WriteOutcome(answer: $0, kept: [], notKept: []) } ?? out
    }
    func setHeartRateProfile(_ profile: HeartRateProfileRequest) async -> Result<HeartRateProfileAnswer, BoundaryError> {
        let out = await base.setHeartRateProfile(profile)
        await wait()
        return out
    }
    func eraseHeartRateProfile() async -> Result<HeartRateProfileAnswer, BoundaryError> {
        let out = await base.eraseHeartRateProfile()
        await wait()
        return eraseProfileResult ?? out
    }

    func submit(_ review: ReviewRequest) async -> WriteOutcome { await base.submit(review) }
    func onboard(_ answers: OnboardingAnswers, consents: Consents) async -> WriteOutcome { await base.onboard(answers, consents: consents) }
    func restart(_ answers: OnboardingAnswers) async -> WriteOutcome { await base.restart(answers) }
    func accept(decisionId: String) async -> WriteOutcome { await base.accept(decisionId: decisionId) }
    func decline(decisionId: String) async -> WriteOutcome { await base.decline(decisionId: decisionId) }
    func acknowledgeRecordLoss() async -> WriteOutcome { await base.acknowledgeRecordLoss() }
}

enum Zones {
    /// The five-zone reading of a captured `hr5r-<name>-presentation`.
    static func five(_ name: String) throws -> HeartRateFiveZones? {
        try Repo.store.decode(PresentationSnapshot.self, "hr5r-\(name)-presentation").readings?.runCalibration?.heartRateFiveZones
    }
}
