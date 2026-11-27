import Foundation
#if canImport(os)
import os
#endif

/// The only thing B logs (handoff §4 item 14, NATIVE 3.5): an event name, counts by code, an optional code and an optional opaque delivery
/// id. The type has no field for a distance, a duration, a workout date, a source name or any other health value, so none can be logged.
public struct IngestLogEvent: Equatable, Sendable, CustomStringConvertible {
    public enum Name: String, Sendable {
        case started, readCompleted, readFailed, enqueued, deliverySent, deliveryAnswered, deliveryDiscardedAfterPurge, purged, enabledChanged,
             conditionsChanged, protectedDataUnavailable, protectedDataAvailable, adapterBug, observerFired, authorizationRequested, backgroundDelivery,
             policyMigrated, backgroundWindow
    }
    public let name: Name
    public let counts: [String: Int]
    public let code: String?
    public let deliveryId: String?
    public init(_ name: Name, counts: [String: Int] = [:], code: String? = nil, deliveryId: String? = nil) {
        self.name = name; self.counts = counts; self.code = code; self.deliveryId = deliveryId
    }
    public var description: String {
        var s = "hki.\(name.rawValue)"
        if let c = code { s += " code=\(c)" }
        if let d = deliveryId { s += " delivery=\(d)" }
        for k in counts.keys.sorted() { s += " \(k)=\(counts[k]!)" }
        return s
    }
}

public protocol IngestLogSink: Sendable {
    func log(_ event: IngestLogEvent)
}

/// Production sink: `os.Logger`, subsystem of the app, public because the event holds only codes and counts.
public struct OSIngestLog: IngestLogSink {
    public init() {}
    public func log(_ event: IngestLogEvent) {
        #if canImport(os)
        let line = event.description
        Logger(subsystem: "fit.vilumo.repmile.healthkit", category: "ingest").info("\(line, privacy: .public)")
        #endif
    }
}
