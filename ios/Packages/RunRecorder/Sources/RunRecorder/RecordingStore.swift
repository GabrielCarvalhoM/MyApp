import Foundation
import IntegrationContracts

/// The recorder's files: the active recording (written atomically, protected until first unlock so a background run keeps writing) and the
/// index of finished recordings B consults for dedupe. Everything here is erased with the account (G07).
public final class RecordingStore: AppRecordingIndex, @unchecked Sendable {
    let directory: URL
    private let lock = NSLock()

    public init(directory: URL) {
        self.directory = directory
        try? FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
    }

    /// Application Support/RunRecorder: the one place the app's own recordings live (#76: written here only, never again elsewhere).
    public static var standardDirectory: URL {
        FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0].appendingPathComponent("RunRecorder", isDirectory: true)
    }

    /// The store at `standardDirectory` (excluded from backup: a recording belongs to this device).
    public static func standard() -> RecordingStore {
        let base = standardDirectory
        let store = RecordingStore(directory: base)
        var url = base; var values = URLResourceValues(); values.isExcludedFromBackup = true; try? url.setResourceValues(values)
        return store
    }

    var activeURL: URL { directory.appendingPathComponent("active.json") }
    var indexURL: URL { directory.appendingPathComponent("index.json") }
    func recordingURL(_ id: String) -> URL { directory.appendingPathComponent("rec-\(id).json") }

    private func write(_ data: Data, to url: URL) {
        #if os(iOS)
        try? data.write(to: url, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
        #else
        try? data.write(to: url, options: [.atomic])
        #endif
    }

    func saveActive(_ s: RecordingState) {
        lock.lock(); defer { lock.unlock() }
        guard let d = try? JSONEncoder().encode(s) else { return }
        write(d, to: activeURL)
        if s.phase == .finished { write(d, to: recordingURL(s.id)) }
    }
    func loadActive() -> RecordingState? {
        lock.lock(); defer { lock.unlock() }
        return (try? Data(contentsOf: activeURL)).flatMap { try? JSONDecoder().decode(RecordingState.self, from: $0) }
    }
    func clearActive() { lock.lock(); try? FileManager.default.removeItem(at: activeURL); lock.unlock() }

    func remove(id: String) {
        lock.lock(); defer { lock.unlock() }
        try? FileManager.default.removeItem(at: activeURL)
        try? FileManager.default.removeItem(at: recordingURL(id))
        var refs = readIndex(); refs.removeAll { $0.id == id }; writeIndex(refs)
    }

    func index(_ ref: AppRecordedRunRef) {
        lock.lock(); defer { lock.unlock() }
        var refs = readIndex(); refs.removeAll { $0.id == ref.id }; refs.append(ref); writeIndex(refs)
    }
    private func readIndex() -> [AppRecordedRunRef] {
        (try? Data(contentsOf: indexURL)).flatMap { try? JSONDecoder().decode([AppRecordedRunRef].self, from: $0) } ?? []
    }
    private func writeIndex(_ refs: [AppRecordedRunRef]) { if let d = try? JSONEncoder().encode(refs) { write(d, to: indexURL) } }

    /// A finished recording kept on the device (summary, map, share).
    public func recording(id: String) -> RecordingState? {
        (try? Data(contentsOf: recordingURL(id))).flatMap { try? JSONDecoder().decode(RecordingState.self, from: $0) }
    }

    public func recordings(overlapping interval: DateInterval) async -> [AppRecordedRunRef] {
        lock.withLock { readIndex().filter { $0.interval.intersects(interval) } }
    }

    /// An erasure that did not remove everything: something of a recording may still be on the device.
    public enum ErasureError: Error, Equatable { case notErased }

    /// Account erasure (G07): every recording, the index and the active file. Throws `ErasureError.notErased` when the folder could not be
    /// removed or is still there afterwards (#76: a failure is reported, never swallowed). A folder that does not exist is already erased.
    /// The folder is then recreated empty, so the store keeps working; a failed recreation is not an erasure failure (nothing is left).
    public func eraseAll() throws {
        lock.lock(); defer { lock.unlock() }
        let fm = FileManager.default
        if fm.fileExists(atPath: directory.path) {
            do { try fm.removeItem(at: directory) } catch { throw ErasureError.notErased }
        }
        guard !fm.fileExists(atPath: directory.path) else { throw ErasureError.notErased }
        try? fm.createDirectory(at: directory, withIntermediateDirectories: true)
        var url = directory; var values = URLResourceValues(); values.isExcludedFromBackup = true; try? url.setResourceValues(values)
    }
}
