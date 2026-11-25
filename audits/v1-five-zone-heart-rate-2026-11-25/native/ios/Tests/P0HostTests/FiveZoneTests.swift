import Foundation
import XCTest
import P0Host

// V1HR5 (2026-11-25): the five heart-rate zones in JavaScriptCore on the Mac and on the iPhone. Every expected value comes from the Node oracle
// (audits/v1-five-zone-heart-rate-2026-11-25/mac/hr5-oracle.mjs -> Fixtures/hr5.json); nothing here decides training. Any DIVERGED step fails.
// - testFiveZoneJourneys / ...NativeStore: the hr5 journeys (strap, lab, conflict, no heart rate, invalid and extreme values, a hold, declared
//   evidence refused by the boundary, a restart, a reopen, a tampered five-zone value) through createIntegration and api.mjs, over the memory
//   store and over the native file store + Keychain anchor. Each step compares the digests AND the readable five- and three-zone summaries.
// - testFiveZoneModuleInJavaScriptCore: v1-heart-rate-zones.mjs called directly: the edges for every maximum 140-220, readings on the edges,
//   the sample classifier and the refusal of impossible maxima, byte-equal to Node.
extension BoundaryTests {
    func testFiveZoneJourneys() async throws { try await replay("hr5", global: "__hr5", native: false) }
    func testFiveZoneJourneysNativeStore() async throws { try await replay("hr5", global: "__hr5", native: true) }

    func testFiveZoneModuleInJavaScriptCore() async throws {
        guard let url = Bundle.module.url(forResource: "hr5", withExtension: "json", subdirectory: "Fixtures") else { throw CoachingCoreRuntime.P0Error.resource("hr5") }
        struct Units: Decodable { let driver: String; let unitsInputJSON: String; let unitsExpectedJSON: String }
        let fx = try JSONDecoder().decode(Units.self, from: Data(contentsOf: url))
        let ids = try CoachingCoreRuntime.bundleModuleIds()
        let id = try XCTUnwrap(ids["CoachingCore/src/v1-heart-rate-zones.mjs"], "the five-zone module is linked into the bundle")
        let rt = try await CoachingCoreRuntime.make(label: "fit.vilumo.p0.hr5", exposeModules: true)
        let got = try await rt.run { rt -> String in
            _ = try rt.evaluate(fx.driver)
            _ = try rt.evaluate("globalThis.__runU = i => __hr5units(__p0req(\(id)), i);")
            return try rt.callGlobal("__runU", [fx.unitsInputJSON])
        }
        let g = try JSONSerialization.jsonObject(with: Data(got.utf8)) as! NSDictionary
        let e = try JSONSerialization.jsonObject(with: Data(fx.unitsExpectedJSON.utf8)) as! NSDictionary
        if !g.isEqual(to: e as! [AnyHashable: Any]) { let a = XCTAttachment(string: got); a.name = "hr5-units-reply.json"; a.lifetime = .keepAlways; add(a) }
        XCTAssertEqual(g, e, "the five-zone module answers in JavaScriptCore exactly as in Node")
        XCTAssertEqual(g["valid"] as? Bool, true, "the pinned values are read from the bundled asset")
        let edges = try XCTUnwrap(g["edges"] as? [String: Any])
        XCTAssertEqual(edges.count, 81, "every maximum from 140 to 220 bpm")
        XCTAssertEqual(edges["186"] as? String, e.value(forKeyPath: "edges.186") as? String)
        let h = try await rt.run { try hostCalls($0) }
        assertHostClean(h, "hr5-units")
        struct UnitsReport: Encodable { let identical: Bool; let maxima: Int; let bundleSha256: String }
        await emit("hr5-units", UnitsReport(identical: g.isEqual(to: e as! [AnyHashable: Any]), maxima: edges.count, bundleSha256: try CoachingCoreRuntime.bundleSha256().shipped))
    }
}
