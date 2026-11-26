import Foundation

/// Handoff §6.1 / NATIVE 1.5 (physically confirmed in the harness): the record file is deleted with the app, the Keychain items survive it, and a
/// reinstall would read `RECORD_LOST`. On the first launch after an install, detected by a marker in the app container (never in the
/// Keychain), the host reconciles:
///  - **no backup (V1 today):** with no record file in the store, it removes this app's leftover Keychain items (anchors and the integrity key),
///    then the host calls `DeviceQueueControl.purge(.freshInstall)`; the athlete starts as a new install and never meets a `RECORD_LOST` that only
///    the reinstall caused;
///  - **with a backup (D2, Founder):** the extension point `RecordBackupRestoring` restores the sealed record and its anchor before anything is
///    read. It does not exist in V1: nothing is restored, nothing is invented.
public enum FirstLaunch {
    public enum Outcome: String, Equatable, Sendable {
        /// The marker was there: not a first launch.
        case notNeeded = "NOT_NEEDED"
        /// First launch, no record, leftover Keychain items removed (possibly none); B is told to purge.
        case freshInstallPurged = "FRESH_INSTALL_PURGED"
        /// First launch with a record already in the store (an install that wrote records before the marker existed): nothing removed.
        case markerWrittenOverExistingRecord = "MARKER_WRITTEN_OVER_EXISTING_RECORD"
    }
    static let markerName = "install-marker.json"

    static func reconcile(root: URL, store: NativeStore, keychain: KeychainItems) -> Outcome {
        let marker = root.appendingPathComponent(markerName)
        if FileManager.default.fileExists(atPath: marker.path) { return .notNeeded }
        let outcome: Outcome
        if store.hasAnyRecord() { outcome = .markerWrittenOverExistingRecord }
        else {
            let removed = keychain.deleteAll()
            HostLog.host("first-launch-reconciled", code: removed > 0 ? "KEYCHAIN_LEFTOVERS_REMOVED" : "NOTHING_LEFT_OVER")
            outcome = .freshInstallPurged
        }
        let body = "{\"installedAt\":\"\(ISO8601DateFormatter().string(from: Date()))\",\"outcome\":\"\(outcome.rawValue)\"}"
        try? AtomicFile.write(Data(body.utf8), to: marker)
        return outcome
    }
}

/// D2 extension point (not implemented in V1: the Founder decides whether a backup exists). A conforming type would restore the opaque sealed
/// record bytes and their anchor; the boundary then verifies them against the anchor as for any record (`RECORD_ROLLED_BACK` is the app's job).
public protocol RecordBackupRestoring: AnyObject, Sendable {
    func restore(athleteId: String) async -> (record: Data, anchor: Data)?
}
