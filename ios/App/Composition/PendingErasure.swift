import Foundation

/// The device-side half of an account erasure that the composition finishes itself (#63 P3-1, G07).
///
/// The shell erases front C's recordings and then rotates the athlete id; a removal that fails there is not lost. `rotate` writes the new id
/// together with "device erasure pending" (one atomic write), and the next open of the composition erases the recordings through front C's
/// own store (`RecordingStore.eraseAll()`, which throws when anything is left, #76: the composition never knows C's folder), checks the
/// recordings index through C's own port, and only then clears the flag. While it is set, the composition does not open: no recording of
/// the erased account can come back under the new one.
enum PendingErasure {
    enum Failure: Error, Equatable { case notErased }

    /// The sequence the composition runs at every open, before front C's store is used: when the identity says an erasure is pending, build
    /// the store (`openStore`), erase everything in it (`erase`, which throws on any failure), check through the store's own index that
    /// nothing is left (`isEmpty`), and only then clear the flag. A crash or a failure at any step leaves the flag set, so the next open does
    /// it all again; a failure throws `Failure.notErased` (`DEVICE_ERASURE_PENDING`) and the composition does not open.
    static func complete<Store>(identity: AthleteIdentityStore, openStore: () -> Store, erase: (Store) throws -> Void,
                                isEmpty: (Store) async -> Bool) async throws -> Store {
        guard try identity.isDeviceErasurePending() else { return openStore() }
        let store = openStore()
        do { try erase(store) } catch { throw Failure.notErased }
        guard await isEmpty(store) else { throw Failure.notErased }
        try identity.deviceErasureDone()
        return store
    }

    /// Every instant, for a query of the recordings index that must come back empty.
    static let everything = DateInterval(start: .distantPast, end: .distantFuture)
}
