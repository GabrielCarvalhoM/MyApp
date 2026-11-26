import Foundation

public enum QueueStoreError: Error, Equatable {
    /// The file exists but cannot be read now (protected data before the first unlock). B never treats this as "empty": it waits.
    case unavailable
    case writeFailed(code: Int32)
}

/// Where B's single state file lives. Production: `FileQueueStore` in Application Support/`HealthKitIngest/`.
public protocol QueueStore: AnyObject, Sendable {
    /// nil when there is no file yet (a first launch); throws `.unavailable` when it exists but cannot be read.
    func load() throws -> Data?
    /// Atomic and durable: tmp + fsync + rename + directory fsync. Returns only after the bytes are on disk.
    func save(_ data: Data) throws
    func remove() throws
}

/// One file, written atomically, with `completeUntilFirstUserAuthentication` protection on iOS (contract §7). No Keychain.
public final class FileQueueStore: QueueStore, @unchecked Sendable {
    public let directory: URL
    private var file: URL { directory.appendingPathComponent("queue.json") }
    private let lock = NSLock()

    public init(directory: URL) { self.directory = directory }

    /// Application Support/HealthKitIngest/ of the app's own container.
    public static func applicationSupport() throws -> FileQueueStore {
        let base = try FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
        return FileQueueStore(directory: base.appendingPathComponent("HealthKitIngest", isDirectory: true))
    }

    public func load() throws -> Data? {
        lock.lock(); defer { lock.unlock() }
        guard FileManager.default.fileExists(atPath: file.path) else { return nil }
        do { return try Data(contentsOf: file) } catch { throw QueueStoreError.unavailable }
    }

    public func save(_ data: Data) throws {
        lock.lock(); defer { lock.unlock() }
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true, attributes: Self.protection)
        let tmp = directory.appendingPathComponent("queue.json.tmp")
        let fd = open(tmp.path, O_WRONLY | O_CREAT | O_TRUNC, 0o600)
        guard fd >= 0 else { throw QueueStoreError.writeFailed(code: errno) }
        var ok = data.withUnsafeBytes { buf -> Bool in
            var off = 0
            while off < buf.count {
                let n = write(fd, buf.baseAddress!.advanced(by: off), buf.count - off)
                if n <= 0 { return false }
                off += n
            }
            return true
        }
        ok = ok && fsync(fd) == 0
        let err = errno
        close(fd)
        guard ok else { unlink(tmp.path); throw QueueStoreError.writeFailed(code: err) }
        #if os(iOS)
        try? FileManager.default.setAttributes([.protectionKey: FileProtectionType.completeUntilFirstUserAuthentication], ofItemAtPath: tmp.path)
        #endif
        guard rename(tmp.path, file.path) == 0 else { let e = errno; unlink(tmp.path); throw QueueStoreError.writeFailed(code: e) }
        let dfd = open(directory.path, O_RDONLY)
        if dfd >= 0 { _ = fsync(dfd); close(dfd) }
    }

    public func remove() throws {
        lock.lock(); defer { lock.unlock() }
        for name in ["queue.json", "queue.json.tmp"] {
            let u = directory.appendingPathComponent(name)
            if FileManager.default.fileExists(atPath: u.path) { try FileManager.default.removeItem(at: u) }
        }
    }

    private static var protection: [FileAttributeKey: Any]? {
        #if os(iOS)
        return [.protectionKey: FileProtectionType.completeUntilFirstUserAuthentication]
        #else
        return nil
        #endif
    }
}
