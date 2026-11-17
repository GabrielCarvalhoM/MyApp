import Foundation
import XCTest
import P0Host

/// A journey recorded by the Node oracle (lab/oracle.mjs): the exact JSON inputs and the expected digests of every answer and envelope.
struct Fixture: Decodable {
    struct Step: Decodable { let kind: String; let intakeJSON: String?; let asOf: String?; let factsJSON: String?; let eventId: String? }
    struct Expected: Decodable {
        let status: String, answer: String, envelope: String
        let answerSansForecast: String, envelopeSansForecast: String, forecastCoarse: String, ledgerRows: Int
    }
    let journey: String, engine: String, steps: [Step], expected: [Expected], fixedReviewStep: Int?

    static func load(_ name: String) throws -> Fixture {
        guard let url = Bundle.module.url(forResource: name, withExtension: "json", subdirectory: "Fixtures") else { throw CoachingCoreRuntime.P0Error.resource(name) }
        return try JSONDecoder().decode(Fixture.self, from: Data(contentsOf: url))
    }
}

/// What the bundle's facade returns for onboard/review (small JSON).
struct Reply: Decodable {
    let status: String, engineMs: Double, ledgerRows: Int, version: Int
    let answerDigest: String?, envelopeDigest: String?, answerSansForecast: String?, envelopeSansForecast: String?, forecastCoarse: String?, digestMs: Double?
}

/// IDENTICAL: answer and envelope byte-identical (canonical digests). EXPLAINED_LIBM: only the Race Forecast's unrounded math-library bits and
/// its own hashes differ (everything else exact, the forecast equal at 9 significant digits): needs an explicit decision (ADR §6). DIVERGED: blocks.
enum Verdict: String, Codable { case IDENTICAL, EXPLAINED_LIBM, DIVERGED }

struct StepResult: Codable {
    let step: Int, kind: String, status: String, verdict: Verdict, engineMs: Double, swiftWallMs: Double, cpuMs: Double, ledgerRows: Int
}

func verdict(_ r: Reply, _ e: Fixture.Expected) -> Verdict {
    if r.status == e.status && r.answerDigest == e.answer && r.envelopeDigest == e.envelope { return .IDENTICAL }
    if r.status == e.status && r.answerSansForecast == e.answerSansForecast && r.envelopeSansForecast == e.envelopeSansForecast && r.forecastCoarse == e.forecastCoarse { return .EXPLAINED_LIBM }
    return .DIVERGED
}

/// Replays fixture steps [from, to) on the engine queue. `opts` is the facade option JSON ({"digest":true} for equivalence, "{}" for timing).
func replaySteps(_ rt: CoachingCoreRuntime, _ fx: Fixture, from: Int = 0, to: Int? = nil, opts: String, onRaw: ((Int, String) -> Void)? = nil) throws -> [(Reply, StepResult)] {
    var out: [(Reply, StepResult)] = []
    for i in from..<(to ?? fx.steps.count) {
        let s = fx.steps[i]
        let sp = CoachingCoreRuntime.signposter, st = sp.beginInterval("step", id: sp.makeSignpostID())
        let w0 = Clock.ms(), c0 = Clock.threadCpuMs()
        let raw: String
        do {
            defer { sp.endInterval("step", st) }
            raw = s.kind == "ONBOARD"
                ? try rt.call("onboard", [s.intakeJSON!, opts])
                : try rt.call("review", [s.kind, s.asOf!, s.factsJSON!, s.eventId!, opts])
        }
        let wall = Clock.ms() - w0, cpu = Clock.threadCpuMs() - c0
        onRaw?(i, raw)
        let r = try JSONDecoder().decode(Reply.self, from: Data(raw.utf8))
        let v: Verdict = r.answerDigest == nil ? (r.status == fx.expected[i].status ? .IDENTICAL : .DIVERGED) : verdict(r, fx.expected[i])
        out.append((r, StepResult(step: i, kind: s.kind, status: r.status, verdict: v, engineMs: r.engineMs, swiftWallMs: wall, cpuMs: cpu, ledgerRows: r.ledgerRows)))
    }
    return out
}

/// The host counters of a runtime (engine queue only). QRE-P0-02: a prelude refusal or a missing asset can be caught by the engine and come
/// back as an ordinary answer, so these counters, not the call, are the loud signal: every equivalence run must end with both lists empty.
struct HostCalls: Codable {
    struct C: Codable { let readAsset: Int, existsAsset: Int, sha256: Int, sha256Chars: Int }
    let calls: C; let misses: [String]; let unsupported: [String]
}
func hostCalls(_ rt: CoachingCoreRuntime) throws -> HostCalls {
    try JSONDecoder().decode(HostCalls.self, from: Data(try rt.call("hostCalls").utf8))
}
func assertHostClean(_ h: HostCalls, _ what: String, file: StaticString = #filePath, line: UInt = #line) {
    XCTAssertTrue(h.misses.isEmpty, "\(what): assets asked for but not bundled: \(h.misses)", file: file, line: line)
    XCTAssertTrue(h.unsupported.isEmpty, "\(what): host functions asked for but not provided: \(h.unsupported)", file: file, line: line)
}

/// QRE-P0-05: every step that is not IDENTICAL keeps the device's full reply, for lab/diff-answer.mjs (EXPLAINED_LIBM is a localization,
/// accepted only after that field-level check and an explicit decision).
func attachNonIdentical(_ test: XCTestCase, _ journey: String, _ res: [(Reply, StepResult)], _ raws: [Int: String]) {
    for (_, s) in res where s.verdict != .IDENTICAL {
        let a = XCTAttachment(string: raws[s.step] ?? ""); a.name = "\(journey)-step\(s.step)-reply.json"; a.lifetime = .keepAlways; test.add(a)
    }
}

/// Prints one result line the run log can be grepped for ("P0RESULT <name> <json>") and keeps it as a test attachment.
@MainActor func emit<T: Encodable>(_ name: String, _ value: T) {
    let enc = JSONEncoder(); enc.outputFormatting = [.sortedKeys]
    guard let data = try? enc.encode(value), let s = String(data: data, encoding: .utf8) else { return }
    print("P0RESULT \(name) \(s)")
    let a = XCTAttachment(data: data, uniformTypeIdentifier: "public.json"); a.name = "\(name).json"; a.lifetime = .keepAlways
    XCTContext.runActivity(named: "P0RESULT \(name)") { $0.add(a) }
}
