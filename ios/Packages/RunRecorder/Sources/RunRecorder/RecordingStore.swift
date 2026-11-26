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

    /// Application Support/RunRecorder (excluded from backup: a recording belongs to this device).
    public static func standard() -> RecordingStore {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0].appendingPathComponent("RunRecorder", isDirectory: true)
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

    /// Account erasure: every recording, the index and the active file.
    public func eraseAll() {
        lock.lock(); defer { lock.unlock() }
        try? FileManager.default.removeItem(at: directory)
        try? FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        var url = directory; var values = URLResourceValues(); values.isExcludedFromBackup = true; try? url.setResourceValues(values)
    }
}
