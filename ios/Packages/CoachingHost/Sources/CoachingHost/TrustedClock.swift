import Foundation
import Darwin

/// The wall clock and the monotonic clock the host reads. Injectable for tests (a reboot, a clock set ahead); production reads the device.
public protocol HostClockSource: AnyObject, Sendable {
    /// The device wall clock, epoch milliseconds.
    func wallMs() -> Double
    /// A monotonic clock that keeps counting while the device sleeps (`mach_continuous_time`), nanoseconds.
    func continuousNanos() -> UInt64
    /// An id of the current boot session (`kern.bootsessionuuid`): a reboot invalidates the local reference.
    func bootSession() -> String
}

public final class DeviceClock: HostClockSource, @unchecked Sendable {
    public init() {}
    public func wallMs() -> Double { (Date().timeIntervalSince1970 * 1000).rounded(.down) }
    public func continuousNanos() -> UInt64 {
        var tb = mach_timebase_info_data_t(); mach_timebase_info(&tb)
        return mach_continuous_time() * UInt64(tb.numer) / UInt64(tb.denom)
    }
    public func bootSession() -> String {
        var size = 0
        guard sysctlbyname("kern.bootsessionuuid", nil, &size, nil, 0) == 0, size > 0 else { return "unknown" }
        var buf = [CChar](repeating: 0, count: size)
        guard sysctlbyname("kern.bootsessionuuid", &buf, &size, nil, 0) == 0 else { return "unknown" }
        return String(cString: buf)
    }
}

/// D1, option (ii) of handoff §8 (Security SEC_FPV_R1 C3): the local reference is the instant of the record's last write (`lastAt`, the
/// operation clock of the last committed operation) plus the monotonic time elapsed since that write, in the same boot session.
///  - an operation more than 300 s ahead of the reference is refused BEFORE custody, with nothing written (`CLOCK_AHEAD_OF_REFERENCE`);
///  - with no reference (first run, or after a reboot) the device clock is used, as the handoff provides; no time source is invented;
///  - a clock behind the record is the boundary's own refusal (`CLOCK_BEHIND_RECORD`), not this one.
/// The reference is persisted beside the store (same protection), so it survives a process restart inside the same boot session.
final class TrustedClock {
    static let toleranceMs: Double = 300_000
    struct Reference: Codable, Equatable { let lastAtMs: Double; let continuousNanos: UInt64; let bootSession: String }
    enum Verdict: Equatable { case trusted(nowMs: Double), aheadOfReference(nowMs: Double, boundMs: Double) }

    let source: HostClockSource
    let file: URL
    private(set) var reference: Reference?

    init(source: HostClockSource, file: URL) {
        self.source = source; self.file = file
        reference = (try? Data(contentsOf: file)).flatMap { try? JSONDecoder().decode(Reference.self, from: $0) }
    }

    /// The reference's bound now, if it is valid in this boot session.
    func boundMs() -> Double? {
        guard let r = reference, r.bootSession == source.bootSession() else { return nil }
        let now = source.continuousNanos()
        guard now >= r.continuousNanos else { return nil }
        return r.lastAtMs + Double(now - r.continuousNanos) / 1_000_000
    }

    func check() -> Verdict {
        let now = source.wallMs()
        guard let bound = boundMs() else { return .trusted(nowMs: now) }
        return now > bound + Self.toleranceMs ? .aheadOfReference(nowMs: now, boundMs: bound) : .trusted(nowMs: now)
    }

    /// After a committed operation at `atMs` (the operation clock it ran with).
    func recordWrite(atMs: Double) {
        let r = Reference(lastAtMs: atMs, continuousNanos: source.continuousNanos(), bootSession: source.bootSession())
        reference = r
        if erased() { return }
        if let d = try? JSONEncoder().encode(r) { try? AtomicFile.write(d, to: file) }
        // CCP-A-04: an erasure in another process writes its fence BEFORE it removes this file, so a write that lands after the removal sees
        // the fence here and takes the file back out: no clock reference outlives the account.
        if erased() { try? FileManager.default.removeItem(at: file) }
    }
    /// Whether this athlete is behind an erasure fence (set by the host).
    var erased: () -> Bool = { false }

    func erase() { reference = nil; try? FileManager.default.removeItem(at: file) }
}

/// tmp + fsync + rename + directory fsync for the host's small side files (signals, clock reference, install marker).
enum AtomicFile {
    static func write(_ data: Data, to url: URL) throws {
        // A unique temporary name per writer: two processes writing the same side file never share a .tmp (QRE-A-07).
        let tmp = url.deletingLastPathComponent().appendingPathComponent(".\(url.lastPathComponent).\(getpid()).\(UUID().uuidString).tmp")
        let fd = open(tmp.path, O_CREAT | O_TRUNC | O_WRONLY | O_CLOEXEC, 0o600)
        guard fd >= 0 else { throw NativeStore.StoreError.io(errno) }
        var ok = data.withUnsafeBytes { buf -> Bool in
            var off = 0
            while off < buf.count { let n = Darwin.write(fd, buf.baseAddress! + off, buf.count - off); if n <= 0 { return false }; off += n }
            return true
        }
        ok = ok && fsync(fd) == 0
        close(fd)
        guard ok else { unlink(tmp.path); throw NativeStore.StoreError.io(EIO) }
        if !NativeStore.protection.isEmpty { try FileManager.default.setAttributes(NativeStore.protection, ofItemAtPath: tmp.path) }
        guard rename(tmp.path, url.path) == 0 else { let e = errno; unlink(tmp.path); throw NativeStore.StoreError.io(e) }
        let dfd = open(url.deletingLastPathComponent().path, O_RDONLY | O_CLOEXEC); if dfd >= 0 { fsync(dfd); close(dfd) }
    }
}
