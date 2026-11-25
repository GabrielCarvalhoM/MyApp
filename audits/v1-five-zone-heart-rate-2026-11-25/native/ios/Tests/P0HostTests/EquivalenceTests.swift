import Foundation
import XCTest
import P0Host

/// JavaScriptCore against the Node oracle, on the same recorded synthetic inputs. A DIVERGED step fails; EXPLAINED_LIBM is reported, never hidden:
/// its replies are attached and it is accepted only after lab/diff-answer.mjs and an explicit decision (P0_REPORT.md §4.2).
@MainActor
final class EquivalenceTests: XCTestCase {
    /// Digests plus the full answer: equivalence runs pay the answer's bridge crossing so that any non-identical step leaves field-level evidence.
    private let opts = #"{"digest":true,"answer":true}"#

    /// Replays [from, to) and returns the step results, the raw replies, and the runtime's host counters at the end.
    private func replay(_ rt: CoachingCoreRuntime, _ fx: Fixture, from: Int = 0, to: Int? = nil) async throws -> ([(Reply, StepResult)], [Int: String], HostCalls) {
        let o = opts
        return try await rt.run { rt -> ([(Reply, StepResult)], [Int: String], HostCalls) in
            var raws: [Int: String] = [:]
            let res = try replaySteps(rt, fx, from: from, to: to, opts: o, onRaw: { raws[$0] = $1 })
            return (res, raws, try hostCalls(rt))
        }
    }

    private func check(_ journey: String, _ fx: Fixture, _ res: [(Reply, StepResult)], _ raws: [Int: String], _ h: HostCalls) {
        attachNonIdentical(self, journey, res, raws)
        for (r, s) in res { XCTAssertNotEqual(s.verdict, .DIVERGED, "\(journey) step \(s.step) diverged (status \(r.status), expected \(fx.expected[s.step].status))") }
        assertHostClean(h, journey)
    }

    /// The five reference answers of the ADR (J5): generate, three Sunday reviews, "not 100%" with a warning sign (CLINICAL_HUMAN_REQUIRED).
    func testJ5ReferenceAnswers() async throws {
        let fx = try Fixture.load("j5"), rt = try await CoachingCoreRuntime.make()
        let reset = try await rt.run { try $0.call("reset") }
        XCTAssertTrue(reset.contains(fx.engine), "bundle engine id differs from the fixture: \(reset)")
        let (res, raws, h) = try await replay(rt, fx)
        check("j5", fx, res, raws, h)
        emit("equivalence-j5", res.map { $0.1 })
    }

    /// The 16-week plan (P16): 33 engine calls, the record growing to ~95 rows.
    func testP16Journey() async throws {
        let fx = try Fixture.load("p16"), rt = try await CoachingCoreRuntime.make()
        _ = try await rt.run { try $0.call("reset") }
        let (res, raws, h) = try await replay(rt, fx)
        check("p16", fx, res, raws, h)
        XCTAssertEqual(res.last?.0.ledgerRows, fx.expected.last?.ledgerRows)
        emit("equivalence-p16", res.map { $0.1 })
    }

    /// Persist -> new VM and context -> restore -> continue: same digests as the uninterrupted oracle run (J5 before the warning sign; P16 mid-plan).
    func testRestoreContinuity() async throws {
        struct R: Codable { let journey: String; let at: Int; let envelopeBytes: Int; let writeMs: Double; let readMs: Double; let verdicts: [Verdict] }
        var out: [R] = []
        for (name, k) in [("j5", 4), ("p16", 16)] {
            let fx = try Fixture.load(name), a = try await CoachingCoreRuntime.make(label: "fit.vilumo.p0.a")
            let json = try await a.run { rt -> String in _ = try rt.call("reset"); _ = try replaySteps(rt, fx, to: k, opts: "{}"); return try rt.call("exportEnvelope") }
            let file = FileManager.default.temporaryDirectory.appendingPathComponent("p0-envelope-\(name).json")
            let w0 = Clock.ms()
            #if os(iOS)
            try Data(json.utf8).write(to: file, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
            #else
            try Data(json.utf8).write(to: file, options: [.atomic])
            #endif
            let writeMs = Clock.ms() - w0
            let b = try await CoachingCoreRuntime.make(label: "fit.vilumo.p0.b")
            let r0 = Clock.ms(), text = try String(contentsOf: file, encoding: .utf8), readMs = Clock.ms() - r0
            let restored = try await b.run { try $0.call("restore", [text]) }
            XCTAssertTrue(restored.contains("\"ok\":true"), restored)
            let (res, raws, h) = try await replay(b, fx, from: k)
            check("\(name)-restored", fx, res, raws, h)
            out.append(R(journey: name, at: k, envelopeBytes: json.utf8.count, writeMs: writeMs, readMs: readMs, verdicts: res.map { $0.1.verdict }))
            try? FileManager.default.removeItem(at: file)
        }
        emit("restore", out)
    }

    /// The engine used the host it was given and asked for nothing else (the AIF QRE-AIF-04 condition).
    func testHostContract() async throws {
        let fx = try Fixture.load("j5"), rt = try await CoachingCoreRuntime.make()
        let h = try await rt.run { rt -> HostCalls in _ = try rt.call("reset"); _ = try replaySteps(rt, fx, opts: "{}"); return try hostCalls(rt) }
        assertHostClean(h, "j5")
        XCTAssertGreaterThan(h.calls.readAsset, 0); XCTAssertGreaterThan(h.calls.sha256, 0)
        XCTAssertEqual(h.calls.sha256, rt.host.sha256Calls, "every engine hash went through the native host function")
        emit("host-contract", h)
    }

    /// A changed asset never reaches the engine: the host refuses it against the manifest digest. (This exercises the second check, on the
    /// text handed to the engine; the first, on the file bytes, is the same comparison on the bytes read.)
    func testTamperedAssetRefused() async throws {
        do {
            _ = try await CoachingCoreRuntime.make(tamper: { key, text in key.hasSuffix("PROGRAM_POLICY_R6.json") ? text.replacingOccurrences(of: "\"", with: "'", options: [], range: text.range(of: "\"")) : text })
            XCTFail("a tampered asset was accepted")
        } catch CoachingCoreRuntime.P0Error.assetHash(let key) {
            XCTAssertTrue(key.hasSuffix("PROGRAM_POLICY_R6.json"))
        }
    }
}
