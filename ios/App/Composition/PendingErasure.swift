import Foundation

/// The device-side half of an account erasure that the composition finishes itself (#63 P3-1, G07).
///
/// The shell erases front C's recordings and then rotates the athlete id, but C's `eraseAll()` cannot report a failed removal. So `rotate`
/// writes the new id together with "device erasure pending" (one atomic write), and the next open of the composition removes the recordings
/// folder with calls that do report failure, checks the recordings index through C's own port, and only then clears the flag. While it is
/// set, the composition does not open: no recording of the erased account can come back under the new one.
enum PendingErasure {
    enum Failure: Error, Equatable { case notErased }

    /// Removes `directory` and everything in it. A missing directory is already erased; any failure throws.
    static func erase(_ directory: URL, fileManager: FileManager = .default) throws {
        guard fileManager.fileExists(atPath: directory.path) else { return }
        do { try fileManager.removeItem(at: directory) } catch { throw Failure.notErased }
        guard !fileManager.fileExists(atPath: directory.path) else { throw Failure.notErased }
    }

    /// The sequence the composition runs at every open, before front C's store is used: when the identity says an erasure is pending,
    /// remove `directory`, build the store (`openStore`, which recreates its folder), check through the store's own index that nothing is
    /// left (`isEmpty`), and only then clear the flag. A crash or a failure at any step leaves the flag set, so the next open does it all
    /// again; a failure throws and the composition does not open.
    static func complete<Store>(identity: AthleteIdentityStore, directory: URL, openStore: () -> Store,
                                isEmpty: (Store) async -> Bool, fileManager: FileManager = .default) async throws -> Store {
        guard try identity.isDeviceErasurePending() else { return openStore() }
        try erase(directory, fileManager: fileManager)
        let store = openStore()
        guard await isEmpty(store) else { throw Failure.notErased }
        try identity.deviceErasureDone()
        return store
    }

    /// Every instant, for a query of the recordings index that must come back empty.
    static let everything = DateInterval(start: .distantPast, end: .distantFuture)
}
