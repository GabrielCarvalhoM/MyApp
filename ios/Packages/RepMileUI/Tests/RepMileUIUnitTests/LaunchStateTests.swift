import Foundation
import RunRecorder
import XCTest
@testable import RepMileUI

/// #76: the launch's damaged-identity state (no "try again", its own copy in the three languages) and the fixture composition's recordings
/// store, which is never the live one.
final class LaunchStateTests: XCTestCase {
    // MARK: state mapping

    func testTheLaunchPhasesMapToTheirStates() {
        XCTAssertNil(RepMileLaunchScreen.stateKind(.opening), "opening is the loading skeleton")
        XCTAssertEqual(RepMileLaunchScreen.stateKind(.failed(code: "HOST_UNAVAILABLE")), .route(.operationalError(code: "HOST_UNAVAILABLE")))
        XCTAssertEqual(RepMileLaunchScreen.stateKind(.identityDamaged), .identityDamaged)
    }

    /// Trying again reads the same file: the damaged identity never offers it, and it is not the operational error under another name.
    func testADamagedIdentityOffersNoRetryAndHasItsOwnCopy() {
        let damaged = StateContent.of(.identityDamaged)
        XCTAssertFalse(damaged.offersRetry)
        XCTAssertNil(damaged.action, "no action: nothing the athlete can do here changes the file")
        XCTAssertEqual(damaged.identifier, "identity-damaged")
        XCTAssertEqual(damaged.title, L.t("state.identityDamaged.title"))
        XCTAssertEqual(damaged.body, L.t("state.identityDamaged.body"))
        let operational = StateContent.of(.route(.operationalError(code: "HOST_UNAVAILABLE")))
        XCTAssertNotEqual(damaged.title, operational.title)
        XCTAssertNotEqual(damaged.body, operational.body)
        XCTAssertNotEqual(damaged.identifier, operational.identifier)
    }

    /// Only the operational error offers "try again" (as before #76); every other state, the damaged identity included, does not.
    func testOnlyTheOperationalErrorOffersRetry() {
        let routes: [RootRoute] = [.loading, .app, .onboarding, .accountErased, .integrityFailure, .recordLost, .unrecognized("X")]
        for r in routes { XCTAssertFalse(StateContent.of(.route(r)).offersRetry, "\(r)") }
        XCTAssertTrue(StateContent.of(.route(.operationalError(code: "HOST_UNAVAILABLE"))).offersRetry)
        XCTAssertTrue(StateContent.of(.route(.operationalError(code: "CONFLICT_STALE_VERSION"))).offersRetry)
        XCTAssertEqual(StateContent.of(.route(.operationalError(code: "CONFLICT_STALE_VERSION"))).body, L.t("state.stale.body"))
    }

    /// The identifiers the UI tests use are unchanged by the refactor (#76 moved the mapping, not the screens).
    func testTheRouteIdentifiersAreUnchanged() {
        let expected: [(RootRoute, String)] = [(.loading, "loading"), (.app, "app"), (.onboarding, "onboarding"), (.accountErased, "gone"),
                                               (.integrityFailure, "integrity"), (.recordLost, "record-lost"),
                                               (.operationalError(code: "X"), "operational-error"), (.unrecognized("X"), "unrecognized")]
        for (r, id) in expected { XCTAssertEqual(StateContent.of(.route(r)).identifier, id) }
    }

    /// The copy comes from the pipeline (copy.psv → Localizable.strings) in pt-BR, en and es: present, non-empty, distinct per language.
    func testTheDamagedIdentityCopyExistsInTheThreeLanguages() throws {
        var titles = Set<String>()
        for lang in ["pt-BR", "en", "es"] {
            let path = try XCTUnwrap(Bundle.module.path(forResource: "Localizable", ofType: "strings", inDirectory: nil, forLocalization: lang), lang)
            let table = try XCTUnwrap(NSDictionary(contentsOfFile: path) as? [String: String], lang)
            for key in ["state.identityDamaged.title", "state.identityDamaged.body"] {
                let value = try XCTUnwrap(table[key], "\(lang) \(key)")
                XCTAssertFalse(value.isEmpty, "\(lang) \(key)")
                XCTAssertNotEqual(value, key)
            }
            titles.insert(table["state.identityDamaged.title"] ?? "")
        }
        XCTAssertEqual(titles.count, 3, "each language has its own wording")
    }

    // MARK: fixture recordings (#76)

    private let tmp = URL(fileURLWithPath: "/tmp/fixture-test", isDirectory: true)

    func testTheFixtureStoreIsNeverTheLiveOne() {
        let cases: [([String], Bool)] = [([], false), ([], true), (["-recordingStore", "j1"], true), (["-recordingStore", "j1"], false),
                                         (["-recordingStore"], true), (["-recordingStore", ""], true), (["-recordingStore", "../RunRecorder"], true)]
        for (args, simulated) in cases {
            let dir = RepMileShell.fixtureRecordingsDirectory(arguments: args, simulated: simulated, temporary: tmp)
            XCTAssertNotEqual(dir.standardizedFileURL, RecordingStore.standardDirectory.standardizedFileURL, "\(args)")
            XCTAssertEqual(dir.deletingLastPathComponent().standardizedFileURL.path, tmp.standardizedFileURL.path, "stays in its folder: \(args)")
            XCTAssertTrue(dir.lastPathComponent.hasPrefix("fixture-recordings-"), "\(args)")
        }
    }

    func testUITestsGetAStorePerLaunchUnlessOneIsNamed() {
        var n = 0
        let next = { () -> String in n += 1; return "launch\(n)" }
        let a = RepMileShell.fixtureRecordingsDirectory(arguments: ["-scenario", "today"], simulated: true, temporary: tmp, newName: next)
        let b = RepMileShell.fixtureRecordingsDirectory(arguments: ["-scenario", "today"], simulated: true, temporary: tmp, newName: next)
        XCTAssertNotEqual(a, b, "one journey's recording never resumes in the next")
        let named = ["-scenario", "today", "-recordingStore", "resume-1"]
        XCTAssertEqual(RepMileShell.fixtureRecordingsDirectory(arguments: named, simulated: true, temporary: tmp, newName: next),
                       RepMileShell.fixtureRecordingsDirectory(arguments: named, simulated: true, temporary: tmp, newName: next),
                       "a named store is reused on purpose (a relaunch that resumes)")
        XCTAssertEqual(RepMileShell.fixtureRecordingsDirectory(arguments: ["-scenario", "today"], simulated: false, temporary: tmp, newName: next),
                       RepMileShell.fixtureRecordingsDirectory(arguments: ["-scenario", "today"], simulated: false, temporary: tmp, newName: next),
                       "with CoreLocation the fixture store is kept across launches, still apart from the live one")
    }
}
