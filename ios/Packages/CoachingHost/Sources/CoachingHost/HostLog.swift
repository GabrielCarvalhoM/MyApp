import Foundation
import os

/// Logs (3.5): only the boundary's own `telemetryOf` records (a neutral operation class, ok, an error code, a version, a status category, an
/// opaque decision id) and the host's own codes. Never a payload, a health field or a key. The code, the operation class and the version are
/// public; the decision id is private (opaque but personal).
enum HostLog {
    static let logger = Logger(subsystem: "fit.vilumo.repmile.coachinghost", category: "boundary")
    /// Every record the facade handed to `__chlog`, for the tests that check what a log would contain (no payload ever reaches this).
    nonisolated(unsafe) static var tap: ((String) -> Void)?

    static func telemetry(_ json: String) {
        tap?(json)
        guard let o = try? JSONSerialization.jsonObject(with: Data(json.utf8)) as? [String: Any] else { return }
        let op = o["op"] as? String ?? "-", ok = (o["ok"] as? Bool) ?? false, code = o["code"] as? String ?? "-"
        let version = (o["version"] as? NSNumber)?.intValue ?? -1, category = o["category"] as? String ?? "-", decision = o["decisionId"] as? String ?? "-"
        logger.info("op=\(op, privacy: .public) ok=\(ok, privacy: .public) code=\(code, privacy: .public) version=\(version, privacy: .public) category=\(category, privacy: .public) decision=\(decision, privacy: .private)")
    }

    static func host(_ event: String, code: String? = nil) {
        tap?("{\"host\":\"\(event)\",\"code\":\"\(code ?? "-")\"}")
        logger.info("host=\(event, privacy: .public) code=\(code ?? "-", privacy: .public)")
    }
}
