import CoachingPresentation
import XCTest
@testable import RepMileUI

/// #101 local onboarding store (spec F-ONBOARDING-FIGMA §5; QRE P2-3): out of backups, erased with the account, and an erasure that fails is
/// finished before anything is read or written again, so a later account never inherits an earlier profile.
@MainActor
final class OnboardingStoreTests: XCTestCase {
    private var dir: URL!
    private var defaults: UserDefaults!

    override func setUp() {
        dir = FileManager.default.temporaryDirectory.appendingPathComponent("i101-store-\(UUID().uuidString)", isDirectory: true)
        defaults = UserDefaults(suiteName: "i101-store-\(UUID().uuidString)")
    }
    override func tearDown() { try? FileManager.default.removeItem(at: dir) }

    private func saved() -> OnboardingSaved { OnboardingSaved(draft: OnboardingTests.lucas(), step: .care, profile: OnboardingProfile(OnboardingTests.lucas())) }

    func testItIsKeptOutOfBackupsAndReadBack() throws {
        let store = FileOnboardingStore(directory: dir, defaults: defaults)
        store.save(saved())
        XCTAssertEqual(store.load(), saved())
        XCTAssertEqual(try dir.resourceValues(forKeys: [.isExcludedFromBackupKey]).isExcludedFromBackup, true)
    }

    func testTheAccountErasureRemovesTheFolder() {
        let store = FileOnboardingStore(directory: dir, defaults: defaults)
        store.save(saved())
        RepMileShell.accountErased(onboarding: store)
        XCTAssertFalse(FileManager.default.fileExists(atPath: dir.path))
        XCTAssertNil(store.load())
        XCTAssertFalse(store.erasurePending)
    }

    func testAFailedRemovalIsFinishedBeforeAnythingIsReadOrWritten() {
        final class Gate: @unchecked Sendable { var fail = true }
        let gate = Gate()
        let store = FileOnboardingStore(directory: dir, defaults: defaults) { url in
            if gate.fail { throw CocoaError(.fileWriteNoPermission) }
            try FileManager.default.removeItem(at: url)
        }
        store.save(saved())
        store.erase()
        XCTAssertTrue(store.erasurePending, "the removal failed: the marker stays")
        XCTAssertTrue(FileManager.default.fileExists(atPath: dir.path))
        XCTAssertNil(store.load(), "nothing of the erased account is read")
        store.save(OnboardingSaved(draft: OnboardingDraft(), step: .train, profile: nil))
        XCTAssertNil(FileOnboardingStore(directory: dir, defaults: defaults) { _ in throw CocoaError(.fileWriteNoPermission) }.load(),
                     "nothing is written over a pending erasure, and a new store of the same folder still reads nothing")
        gate.fail = false
        XCTAssertNil(store.load(), "the next read finishes the erasure")
        XCTAssertFalse(store.erasurePending)
        XCTAssertFalse(FileManager.default.fileExists(atPath: dir.path))
        store.save(saved())
        XCTAssertEqual(store.load(), saved(), "a new account writes again")
    }

    /// The onboarding stays on screen for 31–34, never over an erased account.
    func testTheShellLeavesTheHeldOnboardingForTheErasedState() {
        XCTAssertTrue(RepMileShell.showsOnboarding(route: .onboarding, held: false))
        XCTAssertTrue(RepMileShell.showsOnboarding(route: .app, held: true))
        XCTAssertFalse(RepMileShell.showsOnboarding(route: .accountErased, held: true))
        XCTAssertFalse(RepMileShell.showsOnboarding(route: .app, held: false))
    }
}
