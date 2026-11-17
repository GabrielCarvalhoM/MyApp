import Foundation
import JavaScriptCore
import CryptoKit
import os

/// P0 host for the CoachingCore bundle. One JSVirtualMachine and one JSContext, confined to one serial queue off the main thread.
/// The host gives the bundle exactly four functions (readAsset, existsAsset, sha256, now) and never reads or decides training rules.
/// Only small JSON strings cross the bridge, except exportEnvelope/restore (persistence) and the diagnostic answer, which are measured.
public final class CoachingCoreRuntime {
    public enum P0Error: Error, CustomStringConvertible {
        case resource(String), assetHash(String), js(String)
        public var description: String {
            switch self { case .resource(let s): return "resource: \(s)"; case .assetHash(let s): return "asset hash mismatch: \(s)"; case .js(let s): return "javascript: \(s)" }
        }
    }

    /// Host-side counters and timers (Swift side only: the time inside CryptoKit and hex encoding, not the bridge conversion).
    public final class Host {
        var assets: [String: String] = [:]
        public fileprivate(set) var readAsset = 0, existsAsset = 0, sha256Calls = 0, sha256UTF8Bytes = 0
        public fileprivate(set) var sha256Nanos: UInt64 = 0
        fileprivate var lastException: String?
    }

    public struct LoadMetrics: Codable {
        public var assetsReadVerifyMs: Double, vmContextMs: Double, hostInstallMs: Double, bundleEvalMs: Double, totalMs: Double
        public var bundleBytes: Int, assetBytes: Int, assetCount: Int
    }

    public static let signposter = OSSignposter(subsystem: "fit.vilumo.p0", category: .pointsOfInterest)
    public let queue: DispatchQueue
    public let host = Host()
    public private(set) var load: LoadMetrics!
    private var vm: JSVirtualMachine!
    private var context: JSContext!
    private var api: JSValue!

    private init(queue: DispatchQueue) { self.queue = queue }

    /// Creates a runtime on its own serial queue: reads and verifies the assets, creates the VM and context, installs the host, evaluates the bundle.
    /// `tamper` (tests only) rewrites one asset's text after reading, to prove a changed asset is refused before the engine sees it.
    public static func make(label: String = "fit.vilumo.coachingcore", tamper: ((String, String) -> String)? = nil) async throws -> CoachingCoreRuntime {
        let rt = CoachingCoreRuntime(queue: DispatchQueue(label: label, qos: .userInitiated))
        return try await rt.run { rt in try rt.boot(tamper: tamper); return rt }
    }

    /// Runs `body` on the engine queue (never the main thread) and resumes the caller with its result.
    public func run<T>(_ body: @escaping (CoachingCoreRuntime) throws -> T) async throws -> T {
        try await withCheckedThrowingContinuation { cont in
            queue.async { do { cont.resume(returning: try body(self)) } catch { cont.resume(throwing: error) } }
        }
    }

    // MARK: boot

    private func boot(tamper: ((String, String) -> String)?) throws {
        dispatchPrecondition(condition: .onQueue(queue))
        let sp = Self.signposter, st = sp.beginInterval("boot", id: sp.makeSignpostID())
        defer { sp.endInterval("boot", st) }
        guard let res = Bundle.module.url(forResource: "Resources", withExtension: nil) else { throw P0Error.resource("Resources folder") }
        let t0 = Clock.ms()
        struct Asset: Decodable { let key: String; let file: String; let bytes: Int; let sha256: String }
        let manifest = try JSONDecoder().decode([Asset].self, from: Data(contentsOf: res.appendingPathComponent("assets-manifest.json")))
        var assetBytes = 0
        for a in manifest {
            let data = try Data(contentsOf: res.appendingPathComponent("assets").appendingPathComponent(a.file))
            guard Self.hex(SHA256.hash(data: data)) == a.sha256, data.count == a.bytes else { throw P0Error.assetHash(a.key) }
            guard var text = String(data: data, encoding: .utf8) else { throw P0Error.resource("utf8 \(a.key)") }
            if let tamper { text = tamper(a.key, text) }
            // What the engine reads must be byte-for-byte what was verified: a tampered text is refused here.
            guard Self.hex(SHA256.hash(data: Data(text.utf8))) == a.sha256 else { throw P0Error.assetHash(a.key) }
            host.assets[a.key] = text
            assetBytes += data.count
        }
        let t1 = Clock.ms()
        vm = JSVirtualMachine()
        context = JSContext(virtualMachine: vm)
        context.name = "CoachingCore P0"
        let h = host
        context.exceptionHandler = { _, exc in
            guard let exc else { h.lastException = "unknown exception"; return }
            let stack: String = exc.objectForKeyedSubscript("stack")?.toString() ?? ""
            h.lastException = "\(exc)\n\(stack)"
        }
        let t2 = Clock.ms()
        installHost()
        let t3 = Clock.ms()
        let bundleURL = res.appendingPathComponent("coachingcore-p0.js")
        let source = try String(contentsOf: bundleURL, encoding: .utf8)
        context.evaluateScript(source, withSourceURL: bundleURL)
        try check()
        guard let api = context.objectForKeyedSubscript("CoachingCoreP0"), !api.isUndefined else { throw P0Error.js("CoachingCoreP0 not defined") }
        self.api = api
        let t4 = Clock.ms()
        load = LoadMetrics(assetsReadVerifyMs: t1 - t0, vmContextMs: t2 - t1, hostInstallMs: t3 - t2, bundleEvalMs: t4 - t3, totalMs: t4 - t0,
                           bundleBytes: source.utf8.count, assetBytes: assetBytes, assetCount: manifest.count)
    }

    private func installHost() {
        let h = host
        let readAsset: @convention(block) (String) -> String? = { key in h.readAsset += 1; return h.assets[key] }
        let existsAsset: @convention(block) (String) -> Bool = { key in h.existsAsset += 1; return h.assets[key] != nil }
        let sha256: @convention(block) (String) -> String = { text in
            let t0 = DispatchTime.now().uptimeNanoseconds
            let bytes = Data(text.utf8)
            let hex = CoachingCoreRuntime.hex(SHA256.hash(data: bytes))
            h.sha256Calls += 1; h.sha256UTF8Bytes += bytes.count; h.sha256Nanos += DispatchTime.now().uptimeNanoseconds - t0
            return hex
        }
        let now: @convention(block) () -> Double = { Clock.ms() }
        let obj = JSValue(newObjectIn: context)!
        obj.setObject(unsafeBitCast(readAsset, to: AnyObject.self), forKeyedSubscript: "readAsset" as NSString)
        obj.setObject(unsafeBitCast(existsAsset, to: AnyObject.self), forKeyedSubscript: "existsAsset" as NSString)
        obj.setObject(unsafeBitCast(sha256, to: AnyObject.self), forKeyedSubscript: "sha256" as NSString)
        obj.setObject(unsafeBitCast(now, to: AnyObject.self), forKeyedSubscript: "now" as NSString)
        context.setObject(obj, forKeyedSubscript: "__p0host" as NSString)
    }

    private func check() throws {
        if let e = host.lastException { host.lastException = nil; throw P0Error.js(e) }
    }

    // MARK: bridge calls (engine queue only)

    /// Calls one method of the bundle's facade and returns its string result.
    public func call(_ method: String, _ args: [Any] = []) throws -> String {
        dispatchPrecondition(condition: .onQueue(queue))
        let r = api.invokeMethod(method, withArguments: args)
        try check()
        guard let r, r.isString, let s = r.toString() else { throw P0Error.js("\(method) returned no string") }
        return s
    }

    /// Evaluates a script in the context (benchmarks only).
    public func evaluate(_ script: String) throws -> JSValue? {
        dispatchPrecondition(condition: .onQueue(queue))
        let v = context.evaluateScript(script)
        try check()
        return v
    }

    /// A full JavaScriptCore collection (public C API), so a footprint read after it approximates retained memory.
    public func collectGarbage() {
        dispatchPrecondition(condition: .onQueue(queue))
        JSGarbageCollect(context.jsGlobalContextRef)
    }

    public static func hex<D: Sequence>(_ d: D) -> String where D.Element == UInt8 {
        var out = [UInt8](); out.reserveCapacity(64)
        for b in d { out.append(hexDigits[Int(b >> 4)]); out.append(hexDigits[Int(b & 0x0f)]) }
        return String(decoding: out, as: UTF8.self)
    }
    private static let hexDigits = Array("0123456789abcdef".utf8)
}

public enum Clock {
    public static func ms() -> Double { Double(DispatchTime.now().uptimeNanoseconds) / 1_000_000 }
    /// CPU time of the calling thread.
    public static func threadCpuMs() -> Double { Double(clock_gettime_nsec_np(CLOCK_THREAD_CPUTIME_ID)) / 1_000_000 }
}
