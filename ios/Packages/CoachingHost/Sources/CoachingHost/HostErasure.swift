import Foundation
import IntegrationContracts

// MARK: - account erasure (CCP-A-04, 6.3) and B's owed purges (CCP-B-04 rule 2)

extension CoachingHost {
    static func clockFile(_ root: URL, _ tag: String) -> URL { root.appendingPathComponent("clock-\(tag).json") }
    static func signalsFile(_ root: URL, _ tag: String) -> URL { root.appendingPathComponent("signals-\(tag).json") }

    /// Whether the custody must see a tombstone for this host's athlete now (the store adapter's `tombstoneOf`). Only this host's own tag.
    var fencedOnQueue: Bool { !servingErasure && fence.state(tag) != nil }

    /// The answer a fenced athlete gets on the one path that does not reach the custody's tombstone (`acknowledgeRecordLoss`), in the
    /// custody's own shape and words (Security R1 F3).
    static func gone() -> Answer {
        let j = #"{"ok":false,"error":{"code":"GONE","message":"This account was erased; nothing is accepted for it"}}"#
        return Answer(json: j, object: (try? JSONSerialization.jsonObject(with: Data(j.utf8)) as? [String: Any]) ?? [:])
    }

    /// B's purges that are owed: first every durable purge intent (`PurgeIntent`: the fresh install, an acknowledged record loss; #49 P2-2),
    /// then the account erasures whose native side is done (fence NATIVE_DONE, read again from disk) or `reason`; at start also for erasures
    /// still REQUESTED (Security R1 F2a, code review R1 #5a: B must not keep the erased athlete's queue while A completes). An intent is
    /// removed, and a fence becomes ERASED, only once its purge returned; a failure leaves everything owed, re-sent at the next start or write.
    /// Without a B, nothing is owed.
    func settleOwedPurge(_ reason: QueuePurgeReason?, includeRequested: Bool = false) async {
        let (owed, requested, intents): (Set<String>, Bool, [PurgeIntent.Owed]) = await onQueue {
            self.purgeOwed.formUnion(self.fence.tags(.nativeDone) ?? [])
            return (self.purgeOwed, includeRequested && !(self.fence.tags(.requested) ?? ["?"]).isEmpty, self.purgeIntent.owed())
        }
        for i in intents {
            if let q = queueControl {
                do { try await q.purge(i.reason) } catch { HostLog.host("purge-failed", code: "PURGE_OWED"); return }
            }
            await onQueue { _ = try? self.store.withLock(tag: NativeStore.installTag) { self.purgeIntent.settle(i) } }
        }
        guard reason != nil || !owed.isEmpty || requested else { return }
        if let q = queueControl {
            do { try await q.purge(reason ?? .accountErased) } catch { HostLog.host("purge-failed", code: "PURGE_OWED"); return }
        }
        await onQueue { for t in owed where self.fence.state(t) == .nativeDone && self.fence.set(t, .erased) { self.purgeOwed.remove(t) } }
    }

    /// Whether B is owed any purge now (an intent, or an erasure whose native side is done). On the engine queue.
    var purgeIsOwedOnQueue: Bool { !purgeOwed.isEmpty || !purgeIntent.owed().isEmpty }

    /// Records the durable intent to purge B for `reason`, under the install lock. True when it is on disk.
    func owePurge(_ reason: QueuePurgeReason) -> Bool { owePurgeToken(reason) != nil }
    /// The same; the token written (to withdraw exactly this intent), nil when it is not durable.
    func owePurgeToken(_ reason: QueuePurgeReason) -> String? {
        (try? store.withLock(tag: NativeStore.installTag) { purgeIntent.add(reason) }) ?? nil
    }

    /// The native side of an account erasure, by tag alone, under ONE hold of that athlete's lock (code review R1 #4): the record and its
    /// `.tmp`, the anchor, the side files and their orphan temporaries, and, under the install lock and only when no athlete record exists,
    /// the integrity key and the custody tombstones it named. Each removal is checked; only then is the fence NATIVE_DONE. True when complete.
    @discardableResult
    func completeErasure(tag t: String) -> Bool {
        dispatchPrecondition(condition: .onQueue(queue))
        guard ErasureFence.isTag(t), !fence.isUnreadable(t) else { pendingErasures.insert(t); return false }
        let root = configuration.root
        let ok: Bool = (try? store.withLock(tag: t) { () throws -> Bool in
            var ok = store.eraseFiles(tag: t)
            let st = keychain.delete(KeychainAnchor.account(tag: t)); ok = ok && (st == errSecSuccess || st == errSecItemNotFound)
            if t == tag { signals.erase(); clock.erase() }
            for u in [Self.signalsFile(root, t), Self.clockFile(root, t)] { try? FileManager.default.removeItem(at: u); if FileManager.default.fileExists(atPath: u.path) { ok = false } }
            // #49 P3-1: a side file's temporary left by a writer that died mid-write (`AtomicFile`) holds the same data; it goes too. A live
            // writer in another process then fails its rename and writes nothing, which an erased athlete needs. Unlistable: not complete.
            if let names = store.names() {
                for n in names where Self.isSideTemporary(n, tag: t) {
                    let u = root.appendingPathComponent(n); try? FileManager.default.removeItem(at: u); if FileManager.default.fileExists(atPath: u.path) { ok = false }
                }
            } else { ok = false }
            // The integrity key is per install (NATIVE 1.5) and V1 enrols one athlete per install (`onboard` refuses a second one under the same
            // install lock; Security R1 F1). It goes with the athlete's record (6.3) unless another athlete's record still needs it (an install
            // from before that rule, or a folder that cannot be listed: kept, and the erasure stays pending).
            if ok, let k = productionKey {
                ok = try store.withLock(tag: NativeStore.installTag) { () -> Bool in
                    guard let names = store.names() else { return false }
                    if names.contains(where: { $0.hasPrefix("athlete-") && $0.hasSuffix(".json") }) { return true }
                    // Security R1 F5: every custody tombstone file was named under a key that is now gone, so none can be found again; the
                    // fence is what refuses the erased id. They are removed, with the time they held.
                    return k.erase() && store.removeTombstones()
                }
            }
            return ok && fence.set(t, .nativeDone)
        }) ?? false
        if ok { pendingErasures.remove(t); purgeOwed.insert(t) } else { pendingErasures.insert(t); HostLog.host("erasure-incomplete", code: "PERSISTENCE_FAILURE") }
        return ok
    }

    /// `AtomicFile`'s temporary of this athlete's signals or clock file: `.<file name>.<pid>.<uuid>.tmp`.
    static func isSideTemporary(_ name: String, tag t: String) -> Bool {
        name.hasSuffix(".tmp") && (name.hasPrefix(".signals-\(t).json.") || name.hasPrefix(".clock-\(t).json."))
    }

    /// Completes every erasure left REQUESTED (read again from disk: another instance or process may have started or finished one).
    func completePendingErasures() {
        if let r = fence.tags(.requested) { fenceScanUnknown = false; pendingErasures.formUnion(r) } else { fenceScanUnknown = true }
        for t in pendingErasures.sorted() {
            if fence.state(t) != .requested { pendingErasures.remove(t); continue }
            completeErasure(tag: t)
        }
    }
}

/// CCP-B-04 rule 2 (#49 P2-2): a purge of B that A owes for a reason other than an account erasure (which the erasure fence carries), one file
/// per reason in A's store folder, `purge-owed-<REASON>.json`. Its existence is the intent (as with the fence: no read is needed to act on it,
/// so a file that cannot be read before the first unlock still counts). It holds only a random token, no time, no id, no health data.
///  - It is written BEFORE the event that owes the purge can commit: before the first-launch marker, and before `acknowledgeRecordLoss` is sent.
///    If it cannot be written, that event does not happen (the reconciliation is incomplete; the acknowledgement answers PERSISTENCE_FAILURE).
///  - It is sent at every start and after every write (`settleOwedPurge`) until `purge` returns, and removed only then, under the install lock,
///    and only if its token is still the one that was sent (an intent written again meanwhile stays owed).
///  - A spurious purge costs B a re-read of HealthKit (its anchors reset; the engine answers DUPLICATE), never data.
final class PurgeIntent {
    struct Owed: Equatable { let reason: QueuePurgeReason; let token: String? }
    static let prefix = "purge-owed-"
    let dir: URL
    /// Tests only: returns false to make the next writes fail.
    var writeHook: (() -> Bool)?
    init(dir: URL) { self.dir = dir }

    func file(_ r: QueuePurgeReason) -> URL { dir.appendingPathComponent("\(Self.prefix)\(r.rawValue).json") }
    func isOwed(_ r: QueuePurgeReason) -> Bool { FileManager.default.fileExists(atPath: file(r).path) }
    private func token(_ r: QueuePurgeReason) -> String? { (try? Data(contentsOf: file(r))).flatMap { String(data: $0, encoding: .utf8) } }

    /// Every reason owed now, in a fixed order (never the account erasure: the fence carries it).
    func owed() -> [Owed] {
        [QueuePurgeReason.freshInstall, .recordLossAcknowledged].filter(isOwed).map { Owed(reason: $0, token: token($0)) }
    }

    /// Writes the intent (a new token). Under the install lock. Returns the file's content when it is durable, nil otherwise.
    func add(_ r: QueuePurgeReason) -> String? {
        if writeHook?() == false { return nil }
        let body = "{\"token\":\"\(UUID().uuidString)\"}"
        do { try AtomicFile.write(Data(body.utf8), to: file(r)); return body } catch { return nil }
    }

    /// After `purge(owed.reason)` returned: removes the intent if it is still the one sent. Under the install lock. True when it is gone.
    @discardableResult
    func settle(_ o: Owed) -> Bool {
        guard isOwed(o.reason) else { return true }
        // A token that could not be read (at the snapshot or now) proves nothing: kept, sent again later (review P3-2).
        guard let sent = o.token, token(o.reason) == sent else { return false }
        try? FileManager.default.removeItem(at: file(o.reason))
        return !isOwed(o.reason)
    }

    /// Withdraws the intent this operation wrote (`token`) for an event that did not happen (a refusal that committed nothing), under the
    /// install lock. An intent written again meanwhile is kept; a failure leaves a harmless spurious purge owed.
    func withdraw(_ r: QueuePurgeReason, token t: String) { if token(r) == t { try? FileManager.default.removeItem(at: file(r)) } }
}
