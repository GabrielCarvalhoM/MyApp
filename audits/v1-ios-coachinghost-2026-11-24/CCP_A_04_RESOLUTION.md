# CCP-A-04: resolution (front A, native only)

**Status: RESOLVED IN FRONT A.** The fix is implemented and tested on macOS and the iPhone. Two independent design reviews approved it with changes, and every change they required is applied (§6):
- Core R1: `reviews/CORE_CCP_A_04_R1.md`, APPROVE_WITH_CHANGES;
- Security R1: `reviews/SECURITY_CCP_A_04_R1.md`, APPROVE_WITH_CHANGES.

A targeted review of the code (`reviews/QRE_SECURITY_CCP_A_04_CODE_R1.md`, READY_WITH_CONDITIONS) found a cached-key race and smaller gaps. They are fixed and tested; the disposition is in `FINAL_REPORT.md` §7. Among the fixes: key revalidation per operation, an install-wide lock for key removal and enrolment, and failed folder listings treated as unknown. Nothing in `CoachingCore/**`, `IntegrationContracts/**` or `CoachingPresentation/**` changed. The pinned bundle is unchanged (`c3c4cf98…`).

## 1. What the authorities say

| Source | Says |
|---|---|
| `custody.mjs:31-33` (RETENTION) | The tombstone keeps the pseudonymous subject digest, the time and the scope only. It "refuses any later write for an erased account (no resurrection by a device that synchronises old data)". Status: `MECHANISM_ONLY_PENDING_G07`. |
| `custody.mjs:196, 226` | `open` answers `GONE` ("nothing is accepted for it"). `enroll` answers `GONE` ("a new account is a new athlete"). |
| `custody.mjs:394` | `eraseAccount` removes the document, then writes `tombstone(subjectOf(athleteId), {scope, erasedAt})`, where `subjectOf = hmac(key, …|subject|athleteId)`. |
| NATIVE_OBLIGATIONS_FINAL 6.3 | Account erasure removes the file, `.tmp`/`.lock`, the anchor and **the key**. |
| Parallel contract §6, purge generation (line 224) | A delivery that waited on A's queue behind `eraseAccount` **comes back `GONE`**. |
| Parallel contract §7 | A owns the record, the anchor and the key. |
| `Intake.swift:44` (shared) | "The app's athlete id (A sets it from the authenticated account; C passes what A gives)". Authentication is PENDING. |
| G07 | The retention of erasure facts is the Founder's and legal's call. Nothing here changes a retention period. |

## 2. The answer to the question

**What the tombstone must prevent.** The custody's tombstone refuses the erased **account id**, not the person. Two guarantees are separate:

1. **No recovery of the old record or state.** The document is deleted, the integrity key that sealed it is destroyed (6.3), and the anchor is removed. A copy restored from anywhere fails `verify` under any later key. This does not depend on the tombstone. It is proven by T3/T6: `INTEGRITY_FAILURE`, never `ok`.
2. **No write accepted for the erased account.** This covers a delivery queued behind the erasure (contract line 224), another process, a retry of an old request, and a device that synchronises old data. The tombstone gives this guarantee, and the frozen custody defines it as covering the id ("a new account is a new athlete"). So the erased id stays erased on this install.

**A person is never banned.** Returning is a **new account with a new athlete id**. That gives new state and new key material, with nothing old reachable (T7). A permanent ban could only arise if the id were derived from a stable personal identifier. CCP-A-05 makes it a binding integration rule that it never is.

**No retention without need.** No personal identifier is added: the fence is named by the same digest tag that already names the athlete's `.lock` file, and it holds no time. The custody's own tombstone files, which carry `erasedAt`, are removed once the key that named them is gone, because nothing can ever find them again. Everything goes with the app container at a reinstall.

## 3. The defect

The custody names the tombstone with the integrity key. A's store adapter keyed the tombstone file by that name, and 6.3 then deleted the key. The next `hmac` created a new key, `subjectOf(id)` changed, and `tombstoneOf` missed. Guarantee 2 was lost, in the same process and in every later one. This was a defect of **A's store adapter**, not of the frozen custody.

## 4. The fix

**F1. The native erasure fence**, `erased-<tag>.json` in A's store folder (`ErasureFence.swift`), where tag = `NativeStore.name(athleteId)`.
- Content: `{"scope":"ACCOUNT","state":…}`. No time, no id, no key material.
- States: `REQUESTED` (asked, not known to be complete), then `NATIVE_DONE` (A's side removed and checked; B's purge owed), then `ERASED` (B's purge returned).
- It is not sealed. It only ever restricts.
- An unreadable fence fences the athlete but never drives a removal.
- Only names whose tag is exactly 32 lowercase hex characters count.

**F2. `tombstoneOf` honours the fence**, for this host's own athlete only (`NativeStore.jsMembers(fenced:)`). The custody calls `tombstoneOf` only for `subjectOf(actor.athleteId)`. The pinned bundle has exactly two such call sites, plus two adapter pass-throughs, and `testPinnedBundleTombstoneCallSites` fails if that changes. The frozen custody then answers `GONE` through its own code and shape. One path does not consult the tombstone: `acknowledgeRecordLoss` (`integration.mjs:398`). For a fenced athlete, the host answers it with the custody's GONE.

**F3. Ordering and failure (`Ports.eraseAccount`).**
- The fence is written `REQUESTED` **before** anything is sent. If it cannot be written, nothing is erased (`PERSISTENCE_FAILURE`; T8a).
- Then, under **one hold** of the athlete's lock, three steps run:
  1. The boundary erasure. The fence is not served for this one call (reset by `defer`), and never when the erasure was already complete (Core R1 F1: a repeat is the custody's own `GONE`, and nothing is rewritten).
  2. The checked native removals: the record and its `.tmp`, the anchor, the signals and clock files, and the integrity key.
  3. The fence goes to `NATIVE_DONE`.
- Then comes B's `purge(.accountErased)`. The fence goes to `ERASED` only once the purge returned. A purge that failed is re-sent at the next start and after each write (Security R1 F2a).
- A technical failure of the boundary call, or of a removal, leaves the fence `REQUESTED` (T8b, T8c).

**F4. Nothing runs while an erasure is incomplete** (`CoachingHost.perform`, Core R1 F3, Security R1 F2b).
- `start` completes every readable `REQUESTED` fence before any operation.
- While one remains, every operation except that erasure answers `HOST_UNAVAILABLE`. So nothing is sealed under a key that is due to be removed, and no new enrolment can meet old key material (T8c, T12).

**F5. No side file comes back.**
- The native pre-writes of `restart` / `eraseHealthFacts` are skipped for a fenced athlete.
- `SignalStore` and `TrustedClock` write nothing for a fenced athlete. A write that races an erasure in another process is taken back out: the erasure writes its fence before it removes the file, so the writer's check after its write sees the fence.
- `clock.recordWrite` for the erasure itself is suppressed by the fence. Found and fixed during T9.

**F6. One enrolled athlete per install** (Security R1 F1, Core R1 F5).
- The integrity key is per install (NATIVE 1.5). So `onboard` refuses a second athlete while another one's record exists (`ANOTHER_ATHLETE_ON_THIS_INSTALL`).
- The erasure removes the key and the custody tombstones only when no other athlete's record exists. An install from before this rule keeps the key the other athlete needs (T-XY).

**F7. A never-enrolled id is fenced by its erasure too** (Core R1 F2, T11). This is A's host-level outcome: the athlete asked to erase this account, and a new account is a new athlete.

## 5. What is decided where

| Point | Where it is decided |
|---|---|
| The conflict between 6.3 and the tombstone | **Resolved in A**: the key is removed (6.3), and the tombstone semantics hold without it (custody). This is CCP option 3 done natively, without a second long-lived key. |
| A new account gets a new athlete id, never derived from a stable personal identifier | **CCP-A-05**, a binding rule for whoever issues the id (integration / account layer). A invents no account system. |
| The tombstone subject not depending on the key that sealed the record | **CCP-A-06**, a recommendation to Core for a later cycle. It is not a blocker: the adapter invariant is pinned by a test. |
| The fence as an A-owned persistence; the deviations from the literal 6.3 | **CCP-A-06**, recorded for the contract's §7 table and the G07 row. The deviations: the `.lock` is kept (QRE-A-07), and the fence remains. |
| A device that synchronises old data after a device wipe | **A deployment limit, recorded for G07 and the future account service** (Core R1 Q3). On a device, the guarantee cannot outlive the container. |

**Residuals, stated:**
- A full restore of the container **together with** the ThisDeviceOnly Keychain items is outside the threat model. The folder is excluded from backup, and D2 decides on backups.
- The fence's file modification time records when the erasure completed. It names no one.
- A GONE check after the erasure creates a fresh, empty key, because the custody computes `subjectOf`. That key seals nothing, and T1 asserts the key is gone before any further call.
- A stale process that cached the old key in memory is refused by the fence (T4, T9). In V1 no extension exists.

## 6. Disposition of the design reviews

| Finding | Disposition |
|---|---|
| Core F1: a repeat erasure answered NOT_ENROLLED | **Applied.** The fence is served when the erasure was complete, so the custody answers GONE and nothing is rewritten (T10) |
| Core F2: a never-enrolled id gets fenced | **Applied as A's documented outcome** (F7), pinned by T11 |
| Core F3, Security F2b: seal nothing while REQUESTED | **Applied** (F4), T8c / T12 |
| Core F4: the pinned-bundle invariant | **Applied**: `testPinnedBundleTombstoneCallSites` (2 actor-subject calls, 4 in all); re-review on any bundle change |
| Core F5, Security F1: per-install key | **Applied** (F6), test T-XY |
| Security F2a: B's purge after a death | **Applied**: `NATIVE_DONE`, owed purge re-sent at start and after writes (`testPurgeFailureIsOwed`, T8c) |
| Security F3: `acknowledgeRecordLoss` bypasses the tombstone | **Applied**: GONE for a fenced athlete (T4) |
| Security F4: CCP-A-05 must be binding | **Applied**: CCP-A-05 written as binding, with the `Intake.swift:44` comment to reconcile |
| Security F5: the custody tombstone keeps `erasedAt` | **Applied**: removed once the key is gone. The mtime residual is stated (§5) |
| Security F6: one lock hold, `defer`, tag validation | **Applied** (F3, F1) |
| Security F7: documentation | **Applied**: CCP-A-06 for the §7 table and the G07 row; the `.lock` deviation and the fresh-key note are recorded (§5) |
| Security F8: missing tests | **Applied**: X/Y, death or failure at each step (T8a/b/c, owed purge), failed completion, the record-loss path, pre-writes, the unreadable fence, malformed names, idempotence. Process death between steps is covered by the persistent states; a kill-at-each-step harness is not added. The logs carry host codes only (`HostLog.host(name, code:)`), never an id or tag |
| Core Q6: T10–T14 | T10, T11, T12 and T13 (bundle unchanged; equivalence and replay unchanged on Mac and iPhone) are done. T14 is covered by `defer` (the flag cannot outlive the call) |

## 7. Tests

The tests are in `ErasureTests` (14 tests, including `testCachedOldKeyNeverSealsANewEnrolment` from the code review) and in the lab's locked-device phase. On macOS: 14/14. On the iPhone: 13 pass and 1 is skipped (macOS only: it reads the repository's bundle file). The locked phase passes on the iPhone on the final code.

| # | Property | Result |
|---|---|---|
| T1 | Effective erasure. Only the data-free `.lock`, the fence and the install marker remain. The fence holds `{scope, state}` only. | PASS |
| T2 | The old record bytes put in the new account's place are refused (`RECORD_ROLLED_BACK`) | PASS |
| T3 / T6 | The old record restored: with the fence, `GONE`; with the fence deleted, `INTEGRITY_FAILURE`; with the old anchor put back too, `INTEGRITY_FAILURE` | PASS |
| T4 | A new instance and a new process: reads, writes, `onboard`, `acknowledgeRecordLoss`, the delivery (`halted(GONE)`) and `ingestContext` are all `GONE`. No side file is recreated. | PASS |
| T5 | Reinstall: the same id enrols as a new install with a new key | PASS |
| T7 | A new account (new id): `planCreated`, a new key, version 1 | PASS |
| T8a/b/c, T12 | The fence write fails, so nothing is erased. The boundary fails, so the next operation completes. A removal fails, or the key removal fails, so everything is `HOST_UNAVAILABLE` until the next start completes | PASS |
| — | A failed purge is owed and re-sent at the next start | PASS |
| T9 | A submit, a delivery, a consent and a second process writing during the erasure: `ok` before it, `GONE` after it; no record and no side file remain | PASS (16 repeated runs) |
| T10 / T11 / T-XY | A repeat is `GONE`; a never-enrolled id is fenced; X erased, Y still verifies | PASS |
| Mutation | Removing the fence from `tombstoneOf` makes 7 of the 13 tests of that time fail. Removing `revalidate()` makes the cached-key test fail | detected |
| iPhone, locked | Locked: an erasure, `GONE` afterwards, the key removed, a new account with a new key; after the unlock, the record is recovered | PASS |
