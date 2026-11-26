import Foundation
import XCTest
@testable import CoachingPresentation

/// Paths shared by the tests. <repo>/ios/Packages/CoachingPresentation/Tests/CoachingPresentationTests/<this file>
enum Repo {
    static let here = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
    static let root = here.appendingPathComponent("../../../../..").standardized
    /// The fixtures captured from the CURRENT runtime by Facade/capture-fixtures.mjs.
    static let fixtures = here.appendingPathComponent("Fixtures")
    static let facade = here.appendingPathComponent("../../Facade").standardized
    static func url(_ rel: String) -> URL { root.appendingPathComponent(rel) }
    static func text(_ rel: String) throws -> String { try String(contentsOf: url(rel), encoding: .utf8) }
}

/// Decode `name.json` of `dir` (default: the fixtures), optionally at a key path.
func fixture<T: Decodable>(_ type: T.Type, _ name: String, at path: [String] = [], in dir: URL = Repo.fixtures) throws -> T {
    let data = try Data(contentsOf: dir.appendingPathComponent(name + ".json"))
    var obj: Any = try JSONSerialization.jsonObject(with: data)
    for k in path { obj = try XCTUnwrap((obj as? [String: Any])?[k], "\(name): no \(k)") }
    return try JSONDecoder().decode(T.self, from: try JSONSerialization.data(withJSONObject: obj, options: [.fragmentsAllowed]))
}
func json(_ name: String, in dir: URL = Repo.fixtures) throws -> [String: Any] {
    try XCTUnwrap(try JSONSerialization.jsonObject(with: Data(contentsOf: dir.appendingPathComponent(name + ".json"))) as? [String: Any])
}
/// The JSON object a Swift value encodes to (sorted keys), for key-set assertions.
func encoded(_ v: some Encodable) throws -> [String: Any] {
    let e = JSONEncoder(); e.outputFormatting = .sortedKeys
    return try XCTUnwrap(try JSONSerialization.jsonObject(with: e.encode(v)) as? [String: Any])
}

#if os(macOS)
/// Run Node (from PATH) with `args`; returns (status, stdout+stderr). Skips the test when Node is not installed (exit 127 from env).
func node(_ args: [String], cwd: URL? = nil) throws -> (Int32, String) {
    let p = Process(); p.executableURL = URL(fileURLWithPath: "/usr/bin/env"); p.arguments = ["node"] + args
    if let cwd { p.currentDirectoryURL = cwd }
    let pipe = Pipe(); p.standardOutput = pipe; p.standardError = pipe
    try p.run()
    let data = pipe.fileHandleForReading.readDataToEndOfFile(); p.waitUntilExit()
    if p.terminationStatus == 127 { throw XCTSkip("node not installed") }
    return (p.terminationStatus, String(data: data, encoding: .utf8) ?? "")
}
#endif

/// `P-warning-sign-sets.json`.
struct SignSets: Decodable { let sets: [WarningSignQuestionSet] }
func signSets() throws -> [WarningSignQuestionSet] { try fixture(SignSets.self, "P-warning-sign-sets").sets }
