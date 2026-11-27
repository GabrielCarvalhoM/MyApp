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

    /// #49 P3-2: the reconciliation could not complete. Nothing is guessed and the marker is not written: `CoachingHost.open` throws (fail
    /// closed: no operation runs over an install whose leftovers are unknown) and the next open tries again.
    public enum Incomplete: Error, Equatable {
        /// The store folder cannot be listed: whether a record exists is unknown (never "none", never "one").
        case storeUnlistable
        /// The Keychain items cannot be listed or one cannot be removed (e.g. before the first unlock): a leftover key or anchor would stay.
        case keychainUnavailable
        /// The durable intent to purge B (`PurgeIntent`) cannot be written.
        case purgeIntentNotDurable
    }

    /// `owePurge` writes the durable fresh-install purge intent; it runs before the marker, so a death between the two re-runs the whole step.
    static func reconcile(root: URL, store: NativeStore, keychain: KeychainItems, owePurge: () -> Bool) throws -> Outcome {
        let marker = root.appendingPathComponent(markerName)
        if FileManager.default.fileExists(atPath: marker.path) { return .notNeeded }
        guard let names = store.names() else { throw Incomplete.storeUnlistable }
        let outcome: Outcome
        if names.contains(where: { $0.hasPrefix("athlete-") && $0.hasSuffix(".json") }) { outcome = .markerWrittenOverExistingRecord }
        else {
            guard let removed = keychain.deleteAllChecked() else { throw Incomplete.keychainUnavailable }
            guard owePurge() else { throw Incomplete.purgeIntentNotDurable }
            HostLog.host("first-launch-reconciled", code: removed > 0 ? "KEYCHAIN_LEFTOVERS_REMOVED" : "NOTHING_LEFT_OVER")
            outcome = .freshInstallPurged
        }
        // A marker that cannot be written only repeats this step at the next launch, which is idempotent (nothing is left to remove, or a
        // record now exists and nothing is removed).
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
