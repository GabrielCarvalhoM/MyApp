import Foundation
import IntegrationContracts

/// Mission 6.3: time in zone. Implemented by front A: it runs the facade's `timeInZones(readings, series, {durationSeconds})` (the frozen engine
/// classifier over the zones of the athlete's CURRENT five-zone reading) on its serial queue. The composition root gets the series from front
/// B (`HeartRateSeriesSource`) and hands it here; C renders the answer. Nobody else classifies a heart rate: no zone table, percentage or
/// threshold exists in Swift (B and C), and a distribution is never built from an average.
/// Until the series channel is reviewed (SSCTR C10) the answer is `UNAVAILABLE / SERIES_CHANNEL_NOT_REVIEWED`, and the UI shows the
/// "Tempo por zona" component hidden (`Availability.unsupported`).
public protocol TimeInZoneClassifying: AnyObject, Sendable {
    func timeInZones(_ series: HeartRateSeries) async -> TimeInZoneReading
}
