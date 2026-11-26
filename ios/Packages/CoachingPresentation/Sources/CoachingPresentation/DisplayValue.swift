import Foundation

/// The presentation contract of one value on screen (reconciliation §5). Built by front C's view models from the frozen readings, the
/// athlete's own log, HealthKit facts (front B) or a platform source; consumed by components, which never fetch data themselves.
/// A component renders by `availability`, never by "has a watch".
public struct DisplayValue<Value: Equatable & Sendable>: Equatable, Sendable {
    public let availability: Availability
    public let value: Value?
    /// e.g. "s/km", "km", "kg", "min".
    public let unit: String?
    public let source: ValueSource
    public let observedAt: Date?
    /// The window the value describes (e.g. a week, a session), when it is not a point.
    public let window: DateInterval?
    /// The source's own quality code (e.g. confidence HIGH, gpsQuality POOR, label ESTIMATED), shown as the copy table says.
    public let quality: String?
    public init(availability: Availability, value: Value?, unit: String?, source: ValueSource, observedAt: Date? = nil,
                window: DateInterval? = nil, quality: String? = nil) {
        precondition(availability.carriesValue == (value != nil), "a value is shown only when its availability carries one")
        self.availability = availability; self.value = value; self.unit = unit; self.source = source
        self.observedAt = observedAt; self.window = window; self.quality = quality
    }
}

public enum Availability: Equatable, Sendable {
    case available
    /// Some of a composite is present (e.g. duration without distance): render what is present, hide the rest without a gap.
    case partial(missing: [String])
    /// The capability exists, there is no data (yet): hide optional metrics; show the engine's named reason where it has one.
    case missing(reason: String?)
    /// A value exists but is older than its validity (`validUntil`, the source's own rule): show it only with its date, or hide.
    case stale(asOf: Date)
    case loading
    /// A read failed (not "no data", not "denied"): show recovery only if the user can act.
    case error(code: String)
    /// No capability in this version or on this device (e.g. HRV, VO2max, HR zones in V1): the component keeps its future variant, hidden.
    case unsupported(reason: String)
    /// The athlete switched the source off inside the app (an explicit, observable act). HealthKit read denial is never observable and never
    /// mapped here (Apple does not reveal it): an empty HealthKit read is `missing`.
    case disabledInApp

    public var carriesValue: Bool {
        switch self { case .available, .partial, .stale: true; default: false }
    }
}

public enum ValueSource: String, Equatable, Sendable {
    /// A frozen-engine output (prescription, estimate, forecast, decision).
    case coachingCore = "COACHING_CORE"
    /// The athlete's own report (ATHLETE channel).
    case athleteReport = "ATHLETE_REPORT"
    /// A HealthKit workout fact delivered on the DEVICE channel, as the record kept it.
    case healthKit = "HEALTHKIT"
    /// The app's own live measurement during a session (CoreLocation, timer), before it reaches any record.
    case liveSession = "LIVE_SESSION"
    case weatherKit = "WEATHERKIT"
    case storeKit = "STOREKIT"
    case backend = "BACKEND"
}
