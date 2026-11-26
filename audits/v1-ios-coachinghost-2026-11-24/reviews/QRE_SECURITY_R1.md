# QRE/Security review R1 — front A CoachingHost (as received)

Independent reviewer (a separate agent instance, read-only, worker ≠ judge), over `git diff v1-abc-ready-2026-11-26..33e1198`. Received verbatim below; the disposition is in `FINAL_REPORT.md` §7.

---

**Scope:** `git diff v1-abc-ready-2026-11-26..HEAD` (33e1198) over Sources, facade, build, Tools and CoachingHostLab. I read the frozen boundary (`integration.mjs`, `custody.mjs`, `api.mjs`), the shared ports and the authorities listed in the brief. I did not run anything. Every finding comes from reading the code, and the ones that are suspicions say so.

**Verdict: READY_WITH_CONDITIONS.** QRE-A-01 to QRE-A-04 must be fixed, each with a test that fails without the fix, before front A closes. The rest can be tracked.

**Verified OK:**
- Bundle and asset pin are checked before evaluation, and the export gate is in place.
- Keychain writes are update-then-add, never delete-then-add. Accessibility is `AfterFirstUnlockThisDeviceOnly`.
- The key is 32 random bytes from `SecRandomCopyBytes`, behind a one-entry allowlist, never in JS and never logged. The creation race is handled with `addIfAbsent` and a read-back.
- The flock is held from the version read through the facade call and its commit, within one `perform`. The bytes-CAS logic is correct, including an absent file and repeated loads.
- `.tmp` is cleaned only under the lock.
- `DeliveryResult` mapping follows §6.1: `~n` ids, BUSY with the same id, `halted` after stale retries.
- B's signals come after the commit. Purge happens after the reconciliation.
- `timeInZones` is gated by the shared gate (`enabled:false`).
- The `syntheticOnly` and test-only facade options are refused unless `__chTestMode` is set.
- Logs carry `telemetryOf` records only.

## Findings

**QRE-A-01 — MAJOR — `CoachingHost.swift:162-165, 194`; `TrustedClock.swift:65-69`. An exempt operation turns an ahead clock into the trusted reference (D1 bypass).**
- **Scenario:** the device clock is set 1 day ahead. `deliver` correctly returns `waiting(CLOCK_AHEAD_OF_REFERENCE)`. The athlete then revokes a consent (or calls `eraseHeartRateProfile` or `eraseHealthFacts`).
- Exempt operations pass with `nowMs` set to the ahead device time. `recordWrite(atMs: nowMs)` moves the reference to +1 day, and the boundary writes `lastAt` at +1 day.
- `takeClockRecovery` then tells B that conditions changed. B's redelivery, and every `submit`/`accept` after it, now passes at +1 day.
- After the clock is corrected, every mutating operation gets `CLOCK_BEHIND_RECORD` for a day.
- `testTrustedClockD1` reboots right after the exempt operations, so it hides this.
- **Fix:**
  - When the verdict is `.aheadOfReference`, run exempt operations with `boundMs` as the operation clock (the boundary already accepts a clamped instant for these).
  - Never advance the reference past `bound + tolerance`, and do not count an exempt success as clock recovery.
  - Test: +301 s → revoke → submit must still return `CLOCK_AHEAD_OF_REFERENCE`.
- **Note:** even bounded operations ratchet the reference forward by up to 300 s per commit. This is inherited from the spec, but worth recording.

**QRE-A-02 — MAJOR — `Ports.swift:161-169, 247`; `HostSignals.swift:38-44`. The FND-ABC-04/04b and SEC-FPV-01 signals are written after the operation, and a failed write is ignored.**
- A refused restart (`UNSUPPORTED` or `CLINICAL_HUMAN_REQUIRED`) commits nothing (`custody.mjs` restart returns `ok:true` without a commit), so the signal file is the only durable trace.
- `signals.update` returns `false` on an I/O failure. Every caller discards that result. Memory then holds the gate, but the file does not.
- A process death, or a failed write, between the JS answer and `AtomicFile.write` means that on the next launch the earlier plan is `.startable`, even though the athlete declared postpartum or a clinical flag.
- The same applies to `eraseHealthFacts`: the erasure is committed, and the screen-required signal is lost.
- **Fix:**
  - Write a fail-closed "intake pending" or "erasure pending" marker before calling the facade, then resolve it from the answer. On open, treat a pending marker as `screenRequired` or the scope reason.
  - Check the result of `update`. On failure, retry, and keep startability closed until the write succeeds.

**QRE-A-03 — MAJOR — `NativeStore.swift:183-188` with `integration.mjs:77-82`. A Keychain read failure turns off rollback and loss detection (fails open).**
- `KeychainAnchor.get` returns `nil` for any status other than success. It records the status, but JS sees "no anchor".
- `carriedStore.load` runs every RECORD_LOST and RECORD_ROLLED_BACK check under `if(a&&…)`, so all of them are skipped. The next commit then writes the anchor from the record that was served, which may be the rolled-back one.
- **Fix:** for any status other than `errSecSuccess` or `errSecItemNotFound`, make the bridge signal an error. The facade's `get` should throw, which custody already maps to a failure.
- The trigger is narrow (a transient Keychain error, or an item class that differs from the file's), but the behaviour is fail-open on the integrity anchor.

**QRE-A-04 — MAJOR (needs an authority decision) — `Ports.swift:261`; `Keychain.swift:114`; `custody.mjs:58, 196, 394`. Erasing the key in `eraseAccount` makes the tombstone unfindable.**
- The tombstone subject is `hmac(key, …|subject|athleteId)`. After `productionKey?.erase()`, the next `key(for:)` creates a new random key, so `tombstoneOf(subjectOf(id))` misses the tombstone.
- **Scenario:** `eraseAccount`, then `onboard` with the same `athleteId`. The athlete is enrolled again instead of getting `GONE`, which defeats the "no resurrection" guarantee.
- NATIVE 6.3 requires removing the key, and the custody tombstone requires keeping it. This conflict needs Security/Core arbitration.
- **Interim:** add a test pinning the current behaviour, and record it as a contract-change proposal.

**QRE-A-05 — MINOR — `Ports.swift:172-177, 201`. The A18a(ii) warning-sign gate is released by any later answer that does not ask.**
- `warningSignsAsked` is recomputed on every successful submit.
- **Suspected scenario (not verified against the engine):** a symptom stop sets REQUIRED. The athlete leaves, then logs an unrelated session without eligibility. That answer has no `warningSignScreen`, the flag clears, and sessions are startable without the signs answered. It depends on whether the record of formats keeps the screen.
- The test at `PortTests.swift:107-110` hits `.projected` first, so it never proves the native flag gates anything.
- **Fix:** release only on an answer to a request that carries warning-sign answers, or eligibility. Add the unrelated-submit test.

**QRE-A-06 — MINOR — `Ports.swift:255-266`; custody `eraseAccount`. Native erasure only runs when the boundary erasure succeeds.**
- For a never-enrolled athlete (refused at onboarding) or after `acknowledgeRecordLoss`, the boundary answers `NOT_ENROLLED`.
- The signals file (which can hold `CLINICAL_HUMAN_REQUIRED`), the clock reference and the key all survive the athlete's erasure request.
- **Fix:** perform the native erasure on `NOT_ENROLLED` too.

**QRE-A-07 — MINOR — `Ports.swift:259, 263`; `CoachingHost.swift:188`. Side effects run outside the flock.**
- `removeLockFile` unlinks the `.lock` after the lock is released. The type comment itself says this "would split the lock in two" if another process is waiting on it.
- `eraseFiles` and the `anchorStale` rewrite (`anchorOfStored` reads the file unlocked) also run outside the lock.
- Signal and clock files share a fixed `.tmp` path with no lock across processes.
- **Fix:** run these inside `store.withLock`, and keep the lock file (it is harmless).

**QRE-A-08 — MINOR — `HostSignals.swift:19, 38-43`. An unreadable signals file becomes a persisted false `outsideV1Scope`.**
- The first `update` after a read failure writes `failClosed` (scope `OUTSIDE_V1_SCOPE`) to disk. From then on the athlete sees "outside V1 scope" until a restart or an erasure.
- **Fix:** persist only the fields the event sets, and keep the reason `recordUnavailable`.

**QRE-A-09 — MINOR — `CoachingHost.swift:80-90`; `TestingSupport.swift`. Test hooks are reachable from production code.**
- `@_spi(CoachingHostTesting)` is not a boundary. Any importer can call `openForTesting(testMode: true, keys: any)`, which unlocks the memory store, deterministic ids and arbitrary keys, or `submitRawForTesting`.
- `sentRequestIds` grows without bound in production.
- `lastAnswerJSON` keeps the last health answer in memory.
- **Fix:** put these behind `#if DEBUG` or a separate testing target, and drop the production bookkeeping.

**QRE-A-10 — MINOR — tests that do not prove their claim.**
- `PlatformTests.swift:124`: `hits.contains{…"timeInZonesForReviewOnly"}` is vacuous, because `hits` holds only fixture-key matches. The 18a(iv) grep must scan the Swift sources and the bundle's call sites.
- The bytes-CAS branch (`bytesConflicts`) has no test. The 200-round race also passes because the lock already prevents stale reads, so removing the CAS would leave every test green.
- There is no test for "3 stale retries then `halted`".
- "Reopen the process" in `PortTests` is a new instance in the same process. The signals file is never exercised across real processes.

**QRE-A-11 — NOTE — store files and device backup (D2).**
- Nothing sets `isExcludedFromBackup`. On a restore to a new device, the container (record, marker, signals) comes back but the `ThisDeviceOnly` key and anchor do not.
- The reconciliation is skipped, and `key(for:)` silently creates a new key, so the result is `INTEGRITY_FAILURE` (fail-closed).
- Health records also end up in OS backups. Until the Founder decides D2, either exclude the store from backup or detect "record without key".

**QRE-A-12 — NOTE.**
- Store I/O errors, such as the lock file being unopenable before first unlock, map to `OPERATIONAL_ERROR` → `retryLater`. They count toward B's attempt cap, where `hostUnavailable` seems intended.
- Because `expectedVersion` is re-read under the lock, user actions never see `CONFLICT_STALE_VERSION`. That follows the port design, but optimistic concurrency is effectively gone for user intent.
