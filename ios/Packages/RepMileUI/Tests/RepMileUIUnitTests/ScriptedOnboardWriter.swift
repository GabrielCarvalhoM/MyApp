import CoachingPresentation
import XCTest
@testable import RepMileUI

/// A writer whose `onboard` answers one given answer and counts the calls.
final class ScriptedOnboardWriter: CoachingWriting, @unchecked Sendable {
    let answer: BoundaryAnswer
    private(set) var calls = 0
    init(_ answer: BoundaryAnswer) { self.answer = answer }
    private var none: WriteOutcome { WriteOutcome(answer: FixtureCoachingWriter.unavailable, kept: [], notKept: []) }
    func onboard(_ answers: OnboardingAnswers, consents: Consents) async -> WriteOutcome { calls += 1; return WriteOutcome(answer: answer, kept: [], notKept: []) }
    func restart(_ answers: OnboardingAnswers) async -> WriteOutcome { none }
    func submit(_ review: ReviewRequest) async -> WriteOutcome { none }
    func accept(decisionId: String) async -> WriteOutcome { none }
    func decline(decisionId: String) async -> WriteOutcome { none }
    func setHeartRateProfile(_ profile: HeartRateProfileRequest) async -> Result<HeartRateProfileAnswer, BoundaryError> { .failure(BoundaryError(code: "UNUSED")) }
    func eraseHeartRateProfile() async -> Result<HeartRateProfileAnswer, BoundaryError> { .failure(BoundaryError(code: "UNUSED")) }
    func setConsent(_ purpose: ConsentPurpose, granted: Bool) async -> WriteOutcome { none }
    func eraseHealthFacts(eventIds: [String]) async -> WriteOutcome { none }
    func eraseAccount() async -> WriteOutcome { none }
    func acknowledgeRecordLoss() async -> WriteOutcome { none }
}
