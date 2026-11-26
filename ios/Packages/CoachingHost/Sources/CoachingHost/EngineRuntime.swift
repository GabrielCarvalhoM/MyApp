import Foundation
import JavaScriptCore
import CryptoKit

/// The production bundle in JavaScriptCore (handoff §3, A handoff §4 items 1–3). One `JSVirtualMachine` and one `JSContext`, confined to one
/// serial queue off the main thread; every call of the app facade runs on it. Before the bundle is evaluated the host verifies the shipped
/// bytes against the pin compiled into this module (`BundlePin`) and every asset against its manifest; a changed byte refuses to boot.
/// The host gives the bundle exactly the functions of handoff §3 (`readAsset`, `existsAsset`, `sha256`, `now`, `hmacSHA256`,
/// `constantTimeEqual`); `hmacSHA256` resolves the opaque `keyRef` through an `IntegrityKeyResolving`, so the key never crosses into JavaScript.
/// Only small JSON strings cross the bridge; the custody document crosses only through the store adapter.
final class EngineRuntime {
    enum Failure: Error, CustomStringConvertible {
        case resource(String), bundleHash(String), assetHash(String), js(String)
        var description: String {
            switch self {
            case .resource(let s): return "resource: \(s)"
            case .bundleHash(let s): return "bundle hash mismatch: \(s)"
            case .assetHash(let s): return "asset hash mismatch: \(s)"
            case .js(let s): return "javascript: \(s)"
            }
        }
    }

    /// Host counters (tests and PF-0 only).
    final class Counters {
        var readAsset = 0, existsAsset = 0, sha256 = 0, hmac = 0, constantTimeEqual = 0
    }

    struct LoadMetrics: Codable, Equatable {
        var verifyMs: Double, contextMs: Double, evalMs: Double, totalMs: Double, bundleBytes: Int, assetCount: Int
    }

    let queue: DispatchQueue
    let counters = Counters()
    private(set) var load: LoadMetrics?
    private var vm: JSVirtualMachine!
    private(set) var context: JSContext!
    private var api: JSValue!
    private var assets: [String: String] = [:]
    private var lastException: String?
    private let keys: IntegrityKeyResolving

    /// `tamper` (tests only) rewrites one asset's text after it is read, to prove a changed asset is refused before the engine sees it.
    /// `exposeModules` (tests only) publishes the bundle's module registry as `globalThis.__p0req` (the linker's own export-gate tail change),
    /// so the equivalence drivers can reach the boundary modules by id; module code is unchanged. `testMode` sets `__chTestMode`, which the
    /// facade requires for its test-only options (memory store, deterministic ids). The app sets none of them.
    init(queue: DispatchQueue, keys: IntegrityKeyResolving, tamper: ((String, String) -> String)? = nil, exposeModules: Bool = false,
         testMode: Bool = false, resources: URL? = nil) throws {
        dispatchPrecondition(condition: .onQueue(queue))
        self.queue = queue; self.keys = keys
        try boot(tamper: tamper, exposeModules: exposeModules, testMode: testMode, resources: resources ?? Bundle.module.resourceURL)
    }

    static func resourceURL() throws -> URL {
        guard let r = Bundle.module.resourceURL else { throw Failure.resource("resource bundle") }
        return r
    }

    private func boot(tamper: ((String, String) -> String)?, exposeModules: Bool, testMode: Bool, resources: URL?) throws {
        guard let res = resources else { throw Failure.resource("resource bundle") }
        let t0 = Clock.ms()
        // 1. The shipped bundle and asset manifest are the bytes this module was built with (A handoff §7 test 1: "sha do bundle verificado no boot").
        let bundleData = try Data(contentsOf: res.appendingPathComponent("coachinghost.js"))
        let manifestData = try Data(contentsOf: res.appendingPathComponent("assets-manifest.json"))
        guard Self.hex(SHA256.hash(data: bundleData)) == BundlePin.bundleSha256 else { throw Failure.bundleHash("coachinghost.js") }
        guard Self.hex(SHA256.hash(data: manifestData)) == BundlePin.assetsManifestSha256 else { throw Failure.bundleHash("assets-manifest.json") }
        // 2. Every asset at its manifest sha; what the engine reads is byte for byte what was verified.
        struct Asset: Decodable { let key: String; let file: String; let bytes: Int; let sha256: String }
        let manifest = try JSONDecoder().decode([Asset].self, from: manifestData)
        for a in manifest {
            let data = try Data(contentsOf: res.appendingPathComponent("assets").appendingPathComponent(a.file))
            guard Self.hex(SHA256.hash(data: data)) == a.sha256, data.count == a.bytes else { throw Failure.assetHash(a.key) }
            guard var text = String(data: data, encoding: .utf8) else { throw Failure.resource("utf8 \(a.key)") }
            if let tamper { text = tamper(a.key, text) }
            guard Self.hex(SHA256.hash(data: Data(text.utf8))) == a.sha256 else { throw Failure.assetHash(a.key) }
            assets[a.key] = text
        }
        let t1 = Clock.ms()
        vm = JSVirtualMachine()
        context = JSContext(virtualMachine: vm)
        context.name = "RepMile CoachingHost"
        context.exceptionHandler = { [weak self] _, exc in
            guard let exc else { self?.lastException = "unknown exception"; return }
            let stack: String = exc.objectForKeyedSubscript("stack")?.toString() ?? ""
            self?.lastException = "\(exc)\n\(stack)"
        }
        installHost()
        if testMode { context.setObject(true, forKeyedSubscript: "__chTestMode" as NSString) }
        let t2 = Clock.ms()
        guard var source = String(data: bundleData, encoding: .utf8) else { throw Failure.resource("bundle utf8") }
        if exposeModules {
            let tail = "\nconst __api = __req("
            guard source.components(separatedBy: tail).count == 2 else { throw Failure.resource("bundle tail for exposeModules") }
            source = source.replacingOccurrences(of: tail, with: "\nglobalThis.__p0req = __req;" + tail)
        }
        context.evaluateScript(source, withSourceURL: res.appendingPathComponent("coachinghost.js"))
        try check()
        guard let api = context.objectForKeyedSubscript("RepMileCoachingHost"), !api.isUndefined else { throw Failure.js("RepMileCoachingHost not defined") }
        self.api = api
        let t3 = Clock.ms()
        load = LoadMetrics(verifyMs: t1 - t0, contextMs: t2 - t1, evalMs: t3 - t2, totalMs: t3 - t0, bundleBytes: bundleData.count, assetCount: manifest.count)
    }

    private func installHost() {
        let c = counters, keys = self.keys
        let assetsRef = assets
        let readAsset: @convention(block) (String) -> String? = { key in c.readAsset += 1; return assetsRef[key] }
        let existsAsset: @convention(block) (String) -> Bool = { key in c.existsAsset += 1; return assetsRef[key] != nil }
        let sha256: @convention(block) (String) -> String = { text in c.sha256 += 1; return EngineRuntime.hex(SHA256.hash(data: Data(text.utf8))) }
        // Timing only (prelude `performance.now`), never a decision clock.
        let now: @convention(block) () -> Double = { Clock.ms() }
        let hmac: @convention(block) (String, String) -> String = { ref, text in
            // Unknown or unresolvable reference: "" and the bundle's createHmac refuses loudly (SEC-FPV-02).
            guard let key = keys.key(for: ref) else { return "" }
            c.hmac += 1
            return EngineRuntime.hex(HMAC<SHA256>.authenticationCode(for: Data(text.utf8), using: SymmetricKey(data: key)))
        }
        let constantTimeEqual: @convention(block) (String, String) -> Bool = { a, b in
            c.constantTimeEqual += 1; return EngineRuntime.constantTimeEqual(Array(a.utf8), Array(b.utf8))
        }
        let obj = JSValue(newObjectIn: context)!
        obj.setObject(unsafeBitCast(readAsset, to: AnyObject.self), forKeyedSubscript: "readAsset" as NSString)
        obj.setObject(unsafeBitCast(existsAsset, to: AnyObject.self), forKeyedSubscript: "existsAsset" as NSString)
        obj.setObject(unsafeBitCast(sha256, to: AnyObject.self), forKeyedSubscript: "sha256" as NSString)
        obj.setObject(unsafeBitCast(now, to: AnyObject.self), forKeyedSubscript: "now" as NSString)
        obj.setObject(unsafeBitCast(hmac, to: AnyObject.self), forKeyedSubscript: "hmacSHA256" as NSString)
        obj.setObject(unsafeBitCast(constantTimeEqual, to: AnyObject.self), forKeyedSubscript: "constantTimeEqual" as NSString)
        context.setObject(obj, forKeyedSubscript: "__p0host" as NSString)
    }

    /// Installs a named global object of host functions (the native store `__chstore`, the anchor `__chanchor`, the log `__chlog`).
    func install(_ name: String, _ members: [String: Any]) {
        dispatchPrecondition(condition: .onQueue(queue))
        if members.count == 1, let f = members[""] { context.setObject(f, forKeyedSubscript: name as NSString); return }
        let o = JSValue(newObjectIn: context)!
        for (k, v) in members { o.setObject(v, forKeyedSubscript: k as NSString) }
        context.setObject(o, forKeyedSubscript: name as NSString)
    }

    private func check() throws {
        if let e = lastException { lastException = nil; throw Failure.js(e) }
    }

    /// Calls one facade function; returns its JSON string.
    func call(_ method: String, _ args: [Any] = []) throws -> String {
        dispatchPrecondition(condition: .onQueue(queue))
        let r = api.invokeMethod(method, withArguments: args)
        try check()
        guard let r, r.isString, let s = r.toString() else { throw Failure.js("\(method) returned no string") }
        return s
    }

    /// Tests only: evaluates a script (an equivalence driver) in the context.
    func evaluate(_ script: String) throws -> JSValue? {
        dispatchPrecondition(condition: .onQueue(queue))
        let v = context.evaluateScript(script)
        try check()
        return v
    }

    /// Tests only: calls a global function defined by `evaluate`.
    func callGlobal(_ name: String, _ args: [Any]) throws -> String {
        dispatchPrecondition(condition: .onQueue(queue))
        let r = context.objectForKeyedSubscript(name)?.call(withArguments: args)
        try check()
        guard let r, r.isString, let s = r.toString() else { throw Failure.js("\(name) returned no string") }
        return s
    }

    func collectGarbage() {
        dispatchPrecondition(condition: .onQueue(queue))
        JSGarbageCollect(context.jsGlobalContextRef)
    }

    static func hex<D: Sequence>(_ d: D) -> String where D.Element == UInt8 {
        var out = [UInt8](); out.reserveCapacity(64)
        for b in d { out.append(hexDigits[Int(b >> 4)]); out.append(hexDigits[Int(b & 0x0f)]) }
        return String(decoding: out, as: UTF8.self)
    }
    private static let hexDigits = Array("0123456789abcdef".utf8)

    /// Equal lengths and every byte equal; the time does not depend on where two equal-length inputs differ.
    static func constantTimeEqual(_ a: [UInt8], _ b: [UInt8]) -> Bool {
        guard a.count == b.count else { return false }
        var d: UInt8 = 0
        for i in 0..<a.count { d |= a[i] ^ b[i] }
        return d == 0
    }

    /// The build manifest's module ids by repository path (tests reach boundary modules through `__p0req` by path, never by a fixed id).
    static func moduleIds(resources: URL? = nil) throws -> [String: Int] {
        let res = try resources ?? resourceURL()
        struct M: Decodable { struct Mod: Decodable { let id: Int; let file: String }; let modules: [Mod] }
        let m = try JSONDecoder().decode(M.self, from: Data(contentsOf: res.appendingPathComponent("build-manifest.json")))
        return Dictionary(uniqueKeysWithValues: m.modules.map { ($0.file, $0.id) })
    }
}

enum Clock {
    static func ms() -> Double { Double(DispatchTime.now().uptimeNanoseconds) / 1_000_000 }
}
