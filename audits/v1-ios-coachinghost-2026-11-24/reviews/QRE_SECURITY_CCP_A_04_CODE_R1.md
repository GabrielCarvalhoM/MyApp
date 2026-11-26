# QRE/Security targeted code review R1 of the CCP-A-04 changes (as received)

Independent reviewer (read-only agent instance, worker ≠ judge), 2026-11-26, over the uncommitted diff on `claude/v1-ios-coachinghost`. Note: the documentation (finding 2) was being written while this review ran; the disposition is in `FINAL_REPORT.md` §7.

---

**QRE/Security code review of CCP-A-04: uncommitted diff on claude/v1-ios-coachinghost (2026-11-26)**

**Verdict: READY_WITH_CONDITIONS.** No blocker. In the main single-host flow the fence does what it claims. `swift test --filter ErasureTests` passes on macOS: 13 tests, 0 failures, all CHRESULTs as expected. The conditions are findings 1 and 2, and minors 3–5 should go in the same pass.

**Findings**

1. **MAJOR: a cached old key can seal a new enrolment, so the other athlete's record ends up destroyed. Two places are involved: `Keychain.swift:100` (the cache) and `CoachingHost.swift:290-291` (the key removal).**
   - Each `KeychainIntegrityKey` instance caches the key. `erase()` clears only its own instance's cache.
   - Each host's `pendingErasures` is loaded only in `start` (`CoachingHost.swift:134`). So `ErasureFence.swift:14` ("old key material can never serve a later enrolment") holds only within one host instance.
   - Scenario: X's eraseAccount fails at the key removal, leaving the fence REQUESTED.
     1. Y's host opens, which is blocked, as intended. Any Y read runs `subjectOf`, which calls hmac, and Y's instance caches K1.
     2. X's still-live host, or another process, then completes the erasure and deletes K1.
     3. Y's next `perform` sees the fence is no longer REQUESTED and lets the call through.
     4. `onboard` seals Y's record with the cached K1.
   - Result: on the next launch Y gets INTEGRITY_FAILURE. A non-erased athlete's record is effectively destroyed.
   - A second race exists in `completeErasure`: the `hasAnyRecord()` check and `k.erase()` are not atomic with respect to a concurrent `onboard`. The onboard pre-check (`Ports.swift:139`) is also a check-then-act race against X's `eraseFiles`.
   - Fix:
     - Drop the cache, or re-check the cached key against the Keychain (one `SecItemCopyMatching`), before any enrolment seal.
     - Invalidate `productionKey`'s cache whenever `completePendingErasures` sees a fence finished elsewhere.
     - Hold one install-wide flock across "no record → erase key → remove tombstones" and across onboard's check plus its perform.
     - Re-scan `fence.tags(.requested)` inside onboard.

2. **MAJOR (gate): Security R1 F4 and F7 and the design text are not done.**
   - There is no CCP-A-05 in `CONTRACT_CHANGE_PROPOSALS.md`, and the `Intake.swift` "authenticated account" comment is unchanged.
   - `CCP_A_04_RESOLUTION.md` still says `REQUESTED|ERASED`. It does not mention NATIVE_DONE, the seal-nothing rule, one athlete per install, the fencing of a never-enrolled id, the mtime residual, the `.lock` deviation, or the §7/G07 entries.
   - Without a binding CCP-A-05, a stable IdP subject would turn the fence into a lifetime ban on that install.

3. **MINOR: several paths fail open when the folder listing fails.**
   - `NativeStore.hasAnyRecord` returns false, so the key is erased even if another record exists (`CoachingHost.swift:290`).
   - `removeTombstones` returns true, so files holding times stay.
   - `fence.tags` returns `[]`, so pending erasures are not seen at start.
   - `hasRecord(otherThan:)` returns false, so the second athlete is allowed in.
   - Fix: `try` the listing and treat an error as "unknown". Don't remove the key, leave the erasure pending, and refuse the onboard.

4. **MINOR: completion outside `eraseAccount` is not under one lock hold (`CoachingHost.swift:284-295`).**
   - Only `eraseFiles` holds the tag lock. The anchor, side-file and key removals run outside it.
   - If the lock is BUSY, the anchor is still deleted while another process holds the record. That process can re-set the anchor afterwards.
   - It converges on retry, but it is not what Security R1 F6 asked for. Fix: wrap the whole body in `withLock(tag:)`.

5. **MINOR: the owed purge has gaps.**
   - (a) A REQUESTED fence whose completion fails at start never purges B, so B keeps the erased athlete's queue, ledger and HealthKit anchors. Security R1 F2a asked for "any fence not ERASED".
   - (b) A completion triggered by a read or a delivery (`perform`) owes the purge until the next `write`/`start`, because `deliver` and the reads never call `settleOwedPurge`.
   - (c) The owed purge is not scoped to an athlete. After Y enrols, Y's `write` sends `purge(.accountErased)` for X's owed tag through Y's B. That wipes Y's new queue and anchors and moves B's purge generation, which discards Y's in-flight deliveries.
   - Fix:
     - Purge B at start for REQUESTED fences too.
     - Settle the purge after a completion done inside `perform`.
     - Refuse onboard while any purge is owed, or settle it first.

6. **MINOR: unreadable fences.**
   - A corrupt fence for another tag blocks every operation of a non-erased host (reads included) for good, as HOST_UNAVAILABLE, with no recovery path (`CoachingHost.swift:282`).
   - For the host's own tag, `eraseAccount` overwrites an unreadable fence with REQUESTED (`Ports.swift:446`). That contradicts Security R1 F8's "never overwritten with a guess". It is benign, but if the file was actually ERASED the answer is NOT_ENROLLED instead of GONE.
   - Document both, or give an explicit recovery path.

7. **MINOR: `eraseAccount` lost its BUSY retries (`Ports.swift:454-463`).**
   - The outer `withLock` throws BUSY after `lockWait` (10 s). `perform` used to retry up to 3 times.
   - `catch {}` maps every non-io error to BUSY.
   - The user is told "BUSY" (retry), but the REQUESTED fence means the next operation, even a read, erases natively without the boundary erasure. That is acceptable, but the answer should say the erasure is pending, not BUSY.

8. **NOTE: smaller points.**
   - A repeat `eraseAccount` on an ERASED fence does not remove a restored record file (T3 bytes stay on disk; they are not served).
   - `ANOTHER_ATHLETE_ON_THIS_INSTALL` is an ad-hoc code outside the boundary code set, so the UI has no mapping for it. It also comes before `perform`'s pending completion, so a stale X record yields this code instead of HOST_UNAVAILABLE.
   - Cross-tag lock nesting (own lock held, other tag's completion inside `perform`) is bounded by the flock timeout, so it cannot deadlock.
   - No retain cycle: the closure uses `[weak self]`, nil means fenced, and the clock/signals closures capture only the fence and the tag.
   - The logs carry codes only, never an id or a tag.

9. **NOTE: what the tests do and do not prove.**
   - T4's docstring says "no side file comes back" but it checks only the signals file. T9 checks the clock file too.
   - T12 checks the same id on the same host, not "a new id in the same process while the key removal fails" (the scenario in finding 1).
   - Missing:
     - T13 (equivalence: hashes and fixture-key answers; not evidenced).
     - T14 (`servingErasure` reset on throw).
     - Process kills between steps (only failures are simulated).
     - The cached-key residual (Security R1 F8).
     - A log scan.
   - The second "malformed" name in `testUnreadableAndMalformedFences` does not exercise a traversal.

**Core R1 / Security R1 → implemented?**

| Finding | Implemented | Where / gap |
|---|---|---|
| Core F1 (repeat → GONE) | yes | `Ports.swift:443-461`; test T10 |
| Core F2 (never-enrolled fenced) | partly | code and T11 pin it; design §3 not updated |
| Core F3 (seal nothing while REQUESTED) | partly | `perform` gate `CoachingHost.swift:186`; per instance only (finding 1); design not updated |
| Core F4 (bundle invariant) | yes | comments; `testPinnedBundleTombstoneCallSites` |
| Core F5 (one athlete per install) | partly | `onboard` check; racy and fails open (findings 1, 3); design not updated |
| Core T13 / T14 | no | — |
| Sec F1 (per-install key) | partly | onboard rule plus `hasAnyRecord` guard; X/Y test; races (finding 1) |
| Sec F2a (NATIVE_DONE, purge re-sent at start) | partly | done for NATIVE_DONE only (finding 5) |
| Sec F2b (fail closed, checked removals) | yes | `perform` gate; `erase()`, `eraseFiles(tag:)` and the anchor removal are checked |
| Sec F3 (acknowledgeRecordLoss) | yes | `Ports.swift:489`; T4 |
| Sec F4 (CCP-A-05) | no | finding 2 |
| Sec F5 (orphan tombstones) | partly | removed with the key; mtime residual not documented |
| Sec F6 (one hold, scoped bypass, tag validation) | partly | one hold in `eraseAccount` yes; `defer` yes; `isTag` yes; start/perform completion no (finding 4) |
| Sec F7 (docs) | no | finding 2 |
| Sec F8 (tests) | partly | X/Y, unreadable/malformed, idempotent, exact codes yes; kill points, cached key, log scan, B history no |
