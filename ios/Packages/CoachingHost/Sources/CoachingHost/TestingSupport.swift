import Foundation
import CoachingPresentation

#if COACHINGHOST_TESTING

/// Test-only reads (SPI): never part of a shared port. They expose opaque ids and versions, never a value.
extension CoachingHost {
    @_spi(CoachingHostTesting)
    public func heartRateDeclarationIdsForTesting() async -> [String] {
        let a: Answer = await onQueue { self.perform("heartRateDeclarationIds", clockRule: .read) }
        return a.object["ids"] as? [String] ?? []
    }
    @_spi(CoachingHostTesting)
    public func versionForTesting() async -> Int? {
        let a: Answer = await onQueue { self.perform("version", clockRule: .read) }
        return (a.object["version"] as? NSNumber)?.intValue
    }
    /// Tests only: a review JSON exactly as given (what the Swift types cannot produce, e.g. an unplanned report without observedAt), with an
    /// optional fixed request id (a retry of the same action after a process death).
    @_spi(CoachingHostTesting)
    public func submitRawForTesting(_ reviewJSON: String, requestId: String? = nil, screened: Bool = false) async -> WriteOutcome {
        await write {
            if let requestId { let saved = self.idSource; self.idSource = { requestId }; defer { self.idSource = saved }; return self.submitOnQueue(review: reviewJSON, screened: screened, answersSigns: screened) }
            return self.submitOnQueue(review: reviewJSON, screened: screened, answersSigns: screened)
        }
    }
    /// Tests only: kill this process at the next record write, after the temporary file is synced (`afterTmp`) or after the rename
    /// (`afterRename`), before the answer (the process-death proofs of NATIVE 1.1).
    @_spi(CoachingHostTesting)
    public func armFaultForTesting(_ kind: String) async {
        await onQueue {
            switch kind {
            case "afterTmp": self.store.faultAfterTmp = { _exit(137) }
            case "afterRename": self.store.faultAfterRename = { _exit(137) }
            default: break
            }
        }
    }
    /// Tests only: what this process cleaned at start (a dead writer's `.tmp`).
    @_spi(CoachingHostTesting)
    public func cleanedAtStartForTesting() async -> [String] { await onQueue { self.store.cleanedAtStart } }
}
#endif
