import CoachingPresentation
import Foundation
import XCTest
@testable import RepMileUI

/// #32 increment 6: the heart-rate editor's fields, its two writes and the engine's answer as copy live in `HeartRateZonesViewModel`
/// (behaviour of increment 06: validation is the engine's, CONSENT_REQUIRED and `fields` map to `hr.error.*`).
@MainActor
final class HeartRateZonesViewModelTests: XCTestCase {
    private typealias VM = HeartRateZonesViewModel

    private func json(_ d: Data) -> String { String(decoding: d, as: UTF8.self) }

    func testRequestNeedsWholeNumbersOnly() {
        XCTAssertEqual(VM.request(mode: .maximum, maximum: "195", limits: []), HeartRateProfileRequest(maxHeartRateBpm: .some(195)))
        XCTAssertNil(VM.request(mode: .maximum, maximum: "", limits: []))
        XCTAssertNil(VM.request(mode: .maximum, maximum: "19.5", limits: []))
        XCTAssertEqual(VM.request(mode: .maximum, maximum: "999", limits: []), HeartRateProfileRequest(maxHeartRateBpm: .some(999)), "the range is the engine's")
        XCTAssertEqual(VM.request(mode: .limits, maximum: "195", limits: ["150", "140", "160", "170"]),
                       HeartRateProfileRequest(zoneUpperBpm: .some([150, 140, 160, 170])), "the order is the engine's; the maximum is not sent")
        XCTAssertNil(VM.request(mode: .limits, maximum: "", limits: ["130", "150", "", "180"]))
    }

    func testFieldsStartFromTheProfileInForce() throws {
        let w = PrivacyWriter()
        let custom = VM(writer: w, mode: .limits, current: try Zones.five("custom"))
        XCTAssertEqual(custom.maximum, "195")
        XCTAssertEqual(custom.limits, ["130", "150", "165", "180"])
        let estimate = VM(writer: w, mode: .maximum, current: try Zones.five("age30"))
        XCTAssertEqual(estimate.maximum, "")
        XCTAssertEqual(estimate.limits, ["", "", "", ""])
        XCTAssertNil(estimate.message)
        XCTAssertFalse(estimate.canSave)
    }

    func testSaveMessageMapsTheEngineAnswer() throws {
        let ok = try Repo.store.decode(HeartRateProfileAnswer.self, "hr5r-declared-answer")
        let all: (String) -> Bool = { _ in true }
        XCTAssertEqual(VM.saveMessage(.success(ok), hasCopy: all), .saved)
        let notOk = try JSONDecoder().decode(HeartRateProfileAnswer.self, from: Data(#"{"ok":false}"#.utf8))
        XCTAssertEqual(VM.saveMessage(.success(notOk), hasCopy: all), .failed, "a success that is not ok is never \"saved\"")
        XCTAssertEqual(VM.saveMessage(.failure(try Repo.store.error("hr5r-set-without-consent")), hasCopy: all), .consentRequired)
        XCTAssertEqual(VM.saveMessage(.failure(BoundaryError(code: "CONSENT_REQUIRED", fields: ["maxHeartRateBpm.wholeBpm120to230"])), hasCopy: all),
                       .consentRequired, "consent first, whatever the fields")
        XCTAssertEqual(VM.saveMessage(.failure(try Repo.store.error("hr5r-invalid-answer")), hasCopy: all), .refused(field: "zoneUpperBpm.strictlyIncreasing"))
        let invalid = BoundaryError(code: "INVALID_REQUEST", fields: ["somethingNew", "zoneUpperBpm.wholeBpm60to230", "maxHeartRateBpm.wholeBpm120to230"])
        XCTAssertEqual(VM.saveMessage(.failure(invalid), hasCopy: { $0 != "somethingNew" }), .refused(field: "zoneUpperBpm.wholeBpm60to230"),
                       "the first field the copy table has")
        XCTAssertEqual(VM.saveMessage(.failure(invalid), hasCopy: { _ in false }), .failed, "a field without copy is never shown raw")
        XCTAssertEqual(VM.saveMessage(.failure(BoundaryError(code: "BUSY")), hasCopy: all), .failed)
        XCTAssertEqual(VM.eraseMessage(.success(ok)), .erased)
        XCTAssertEqual(VM.eraseMessage(.failure(BoundaryError(code: "BUSY"))), .failed)
    }

    func testEveryMessageKeyHasCopy() {
        let messages: [VM.Message] = [.saved, .erased, .consentRequired, .failed, .refused(field: "zoneUpperBpm.strictlyIncreasing"),
                                      .refused(field: "zoneUpperBpm.wholeBpm60to230"), .refused(field: "maxHeartRateBpm.wholeBpm120to230")]
        for m in messages { XCTAssertNotEqual(L.t(m.key), m.key, m.key) }
        XCTAssertEqual(messages.filter(\.ok), [.saved, .erased])
        XCTAssertNil(L.code("hr.error", Code(raw: "somethingNew")), "the default copy check refuses an unknown field")
    }

    func testDeclaredMaximumSavedAndDecreasingLimitsRefusedByTheEngine() async throws {
        let w = PrivacyWriter()
        let max = VM(writer: w, mode: .maximum, current: try Zones.five("age30"))
        max.maximum = "195"
        await max.save()
        XCTAssertEqual(max.message, .saved)
        let limits = VM(writer: w, mode: .limits, current: try Zones.five("age30"))
        limits.limits = ["150", "140", "160", "170"]
        await limits.save()
        XCTAssertEqual(limits.message, .refused(field: "zoneUpperBpm.strictlyIncreasing"))
        XCTAssertEqual(w.calls("setHeartRateProfile").map(json), [#"{"maxHeartRateBpm":195}"#, #"{"zoneUpperBpm":[150,140,160,170]}"#])
    }

    func testSaveSentOnceWhileInFlight() async throws {
        let w = PrivacyWriter(delay: .milliseconds(80))
        let vm = VM(writer: w, mode: .maximum, current: try Zones.five("age30"))
        vm.maximum = "195"
        XCTAssertTrue(vm.canSave)
        let first = Task { await vm.save() }
        for _ in 0..<100 where vm.activity == .idle { await Task.yield() }
        XCTAssertEqual(vm.activity, .saving)
        XCTAssertFalse(vm.canSave, "the button is off while the request is in flight")
        await vm.save()
        await vm.erase()
        await first.value
        XCTAssertEqual(w.calls("setHeartRateProfile").count, 1)
        XCTAssertEqual(w.calls("eraseHeartRateProfile").count, 0)
        XCTAssertEqual(vm.message, .saved)
        XCTAssertTrue(vm.canSave)
    }

    func testEraseAnswersAndIsOfferedOnlyForTheAthletesOwnValues() async throws {
        let w = PrivacyWriter()
        let vm = VM(writer: w, mode: .maximum, current: try Zones.five("declared"))
        await vm.erase()
        XCTAssertEqual(vm.message, .erased)
        XCTAssertEqual(w.calls("eraseHeartRateProfile").count, 1)
        let failing = VM(writer: PrivacyWriter(eraseProfileResult: .failure(BoundaryError(code: "PERSISTENCE_FAILURE"))), mode: .limits,
                         current: try Zones.five("custom"))
        await failing.erase()
        XCTAssertEqual(failing.message, .failed)
        XCTAssertTrue(VM.offersErase(try Zones.five("declared")))
        XCTAssertTrue(VM.offersErase(try Zones.five("custom")))
        XCTAssertFalse(VM.offersErase(try Zones.five("age30")))
        XCTAssertFalse(VM.offersErase(nil))
    }
}
