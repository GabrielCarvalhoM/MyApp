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

    /// Every instant, for a query of the recordings index that must come back empty.
    static let everything = DateInterval(start: .distantPast, end: .distantFuture)
}
