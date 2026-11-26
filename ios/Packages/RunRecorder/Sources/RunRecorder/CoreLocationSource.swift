import CoreLocation
import Foundation

/// The device's location for a run: when-in-use authorisation, background updates while a run is active (the app declares the location
/// background mode), fitness activity type. Denied, no signal and poor accuracy are visible states; none stops a run by time.
public final class CoreLocationSource: NSObject, LocationSource, CLLocationManagerDelegate {
    public private(set) var state: LocationState = .notRequested
    public var onFix: ((Fix) -> Void)?
    public var onState: ((LocationState) -> Void)?
    private let manager = CLLocationManager()

    public override init() {
        super.init()
        manager.delegate = self
        manager.activityType = .fitness
        manager.desiredAccuracy = kCLLocationAccuracyBest
        manager.distanceFilter = 5
        state = Self.map(manager.authorizationStatus)
    }

    public func start() {
        if manager.authorizationStatus == .notDetermined { manager.requestWhenInUseAuthorization() }
        #if os(iOS)
        if Bundle.main.object(forInfoDictionaryKey: "UIBackgroundModes").map({ ($0 as? [String])?.contains("location") == true }) == true {
            manager.allowsBackgroundLocationUpdates = true
            manager.showsBackgroundLocationIndicator = true
        }
        manager.pausesLocationUpdatesAutomatically = false
        #endif
        manager.startUpdatingLocation()
    }

    public func stop() { manager.stopUpdatingLocation() }

    public func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        set(Self.map(manager.authorizationStatus))
    }

    public func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        for l in locations {
            onFix?(Fix(t: l.timestamp, lat: l.coordinate.latitude, lon: l.coordinate.longitude, horizontalAccuracy: l.horizontalAccuracy))
        }
    }

    public func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        if (error as? CLError)?.code == .denied { set(.denied) } else { set(.noSignal) }
    }

    private func set(_ s: LocationState) { state = s; onState?(s) }

    static func map(_ s: CLAuthorizationStatus) -> LocationState {
        switch s {
        case .notDetermined: .notRequested
        case .denied, .restricted: .denied
        default: .noSignal
        }
    }
}
