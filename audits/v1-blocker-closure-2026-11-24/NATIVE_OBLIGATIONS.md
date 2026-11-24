# V1 native and platform obligations (Mac, SwiftUI, backend)

**For:** REPMILE-COACHINGCORE-V1-RC-1. Each item is the app's to implement and check on the Mac/iPhone. **None needs a change to the engine or the boundary.**
**Base:** `INTEGRATION_BOUNDARY_CONTRACT.md` §9 (V1INT), unchanged in substance. This list adds what the blocker closure decided (marked **new**).

**Status labels:**
- **P** = the physical-validation run must prove it.
- **R** = before any real athlete.
- **S** = before App Store submission.

## 1. Custody and storage (C-F01-2 native part)

| # | Obligation | Check | When |
|---|---|---|---|
| 1.1 | One file per athlete in Application Support, written by `tmp + fsync + rename`. Success is reported only after the rename. | Kill the process between the write and the answer: the retry answers `replayed` | P |
| 1.2 | File protection `completeUntilFirstUserAuthentication`, so HealthKit background delivery can write | Background delivery with the device locked after first unlock | P |
| 1.3 | One writer across the app, its extensions and background delivery: a file lock with compare-and-swap, and stale-lock recovery once the writer is known dead. Leftover `.tmp`/`.lock` files are cleaned at start. | Two concurrent writers: one wins, the other gets `CONFLICT_STALE_VERSION` | P |
| 1.4 | Anchor: a Keychain item `{version, docMac}` per athlete, written after each commit. `RECORD_LOST` / `RECORD_ROLLED_BACK` are shown as such, never as an empty plan. Starting over is the athlete's explicit act; `acknowledgeRecordLoss` is reachable only from that screen. | Delete the file: `RECORD_LOST`. Restore an older file: `RECORD_ROLLED_BACK` | P |
| 1.5 | Key: a per-install random key in the Keychain (`kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`), never in the UI layer, never logged. On reinstall, check the anchor against the store before showing `RECORD_LOST`. | Reinstall with the Keychain kept | P |
| 1.6 | Disk full: a write that fails confirms nothing (`PERSISTENCE_FAILURE`), and the earlier record stays | Fill the disk | P |
| 1.7 | Backup policy (Founder D2) | Founder decision | S |

## 2. Crypto and runtime host (JavaScriptCore)

| # | Obligation | Check | When |
|---|---|---|---|
| 2.1 | Host functions `hmacSHA256(keyRef, text) -> hex` (CryptoKit `HMAC<SHA256>`, key read by the host) and `constantTimeEqual(a, b)`, plus a minimal `Buffer.from(string)` for custody's `timingSafeEqual` (Mac README §14 step 1) | `Fixtures/int.json`: every `stored` digest equal to Node's | P |
| 2.2 | The bundle `coachingcore-p0.js` is the relinked RC bundle (sha256 `f5d684e5…`, 41 modules), with the assets the build manifest lists. The 16 data files the runtime reads are part of the bundle, among them the R7-B0 records. | `FocalTests` with `focal.json`, `core.json` and `int.json` regenerated for the RC; vm-check is the lab twin | P |
| 2.3 | `build/entry.mjs` also exports `integration` and `store`, then relink (README §14 step 2) | `FocalTests.testIntegrationBoundary` | P |
| 2.4 | Minimum iOS version and device matrix (Founder D3) | Founder decision | S |

## 3. Channels and authorship (SEC-CORE-03 native part, SEC-INT-09)

| # | Obligation | When |
|---|---|---|
| 3.1 | `importActivities` is reachable only from the HealthKit delivery code, and `submit` only from the athlete's own UI. Both run on one serial queue. | P |
| 3.2 | Only workouts a device recorded count as the device. A user-entered workout (`HKMetadataKeyWasUserEntered`) or another app's write is the athlete's statement and goes through the form, if at all. | P |
| 3.3 | No screen is ever built on the device route. | P |
| 3.4 | **New (SEC-INT-06):** HealthKit workouts from before the enrollment day go only into the onboarding intake (its run history). A delivery dated before it is refused (`BEFORE_RECORD_START`), so the queue sets it aside and does not retry it. | P |
| 3.4a | **Cycle 1 (SEC-BC-O-2, QRE C-BC-4):** `BEFORE_RECORD_START` refuses the whole request (refusal shape: `{code:'BEFORE_RECORD_START', index, field, firstDay}`, plus `safetyFields`). The HealthKit anchor starts at the enrollment day. A refused index is set aside and the rest of the chunk is re-sent, so one old workout never stalls later deliveries. The athlete's date picker offers no day before enrollment. A refused athlete report that names safety fields is kept as a draft, and the app points to the warning-sign / eligibility screen (SSCTR-BC-05). | P |
| 3.5 | No payload content in logs or crash reports. | R |

## 4. HealthKit queue (QRE-INT-05/06/09, SSCTR-INT-02/03/05/06, SSCTR_INT_R2)

| # | Obligation | When |
|---|---|---|
| 4.1 | `HKWorkout.uuid` → `activityId`; the end date → `observedAt` (ISO with offset); running only. Distance, duration and route presence → `actual` and `sourceQuality`, nothing the athlete states. | P |
| 4.2 | A workout leaves the queue only on `RECORDED` or `DUPLICATE` in `activities`. One refused at admission is set aside and the rest of its chunk is re-sent. A refused link (`UNKNOWN_SESSION` after a restart, `SPORT_MISMATCH`) is re-sent unlinked. Never retry forever. | P |
| 4.3 | Link at most one workout per session, and only when the match is unambiguous: fragments are read as voices, not summed. | P |
| 4.4 | Queued workouts go with, or just before, the review that carries a new screen. A delivery that gets `ASK` (stale screen) is re-sent after the athlete answers. Since the RC it is then recorded once and carried to pace readings (QRE-INT-02 closed). | P |
| 4.4a | **Cycle 1 (SSCTR-BC-01):** an athlete form answered `ASK` and not recorded goes back **in the same request** as the screen answer. Until then the device run of that session is carried to pace readings without the form; once the form is recorded the session is disputed and withheld, and the stop is screened throughout. Pinned by a boundary test at the native integration (ask, re-send with the screen, disputed, withheld). | R (before real athletes see pace readings) |
| 4.5 | Between a restart and the new plan's start, a review answers HOLD and the view reads NEEDS_INPUT; the queue may wait for the start (O-R2-1, Product/UX). | R |
| 4.6 | HealthKit deletions (`HKDeletedObject`) are not sent in V1. | R |

## 5. Clock (SEC-INT-04, Founder D1; **new**)

| # | Obligation | Check | When |
|---|---|---|---|
| 5.1 | The device clock passed to `createIntegration({clock})` is bounded by a trusted reference: the last server time plus the monotonic uptime since. An operation whose device clock is more than **300 s ahead** of that reference is refused before custody (the engine's own `futureSkewSeconds`) and shown as "check date and time". With no reference yet, the first server contact sets it. | Set the clock a day ahead: refused, nothing written. Set it back: `CLOCK_BEHIND_RECORD` with the recovery screen; a consent revocation and an erasure still pass | R |
| 5.2 | Why no V1 flow is blocked until then: no engine safety hold is released by elapsed time alone. A clinical hold ends only by a readiness declaration, a stop only by a screen answered after it, and the restart pause only lengthens with a later clock. A clock set ahead lets the athlete move through the plan's calendar faster on their own record, and setting it back locks writes. | — | — |

## 6. Erasure (G07; **new** behaviour of `eraseHealthFacts`)

| # | Obligation | When |
|---|---|---|
| 6.1 | `eraseHealthFacts` erases the named F08 facts, the last readings, the request record and the athlete's stored screen. The app then asks for a new screen; deliveries wait (`SCREEN_REQUIRED`). | P |
| 6.2 | The stop facts of the record of formats are kept as a safety retention: no free text, only session, report id, speaker and reason. The warning-sign screen keeps asking until the athlete answers it after the stop. **The Founder confirms this retention, or narrows it, before real athletes.** | R |
| 6.3 | Account erasure removes the store file, `.tmp`/`.lock` files, the anchor and the Keychain key. | P |

## 7. App behaviour the engine relies on

| # | Obligation | When |
|---|---|---|
| 7.1 | Show the warning-sign screen whenever an answer carries one, whatever the status. Since the RC a duplicate-only answer carries the stored reading. After an erasure took the readings, the engine is asked instead (SSCTR-INT-R2-01 and SEC-BC-02 closed). `presentation.readings` stays the source between answers. | P |
| 7.2 | Athlete drafts are kept until their id is in `recorded`. Every correction is built from the report in force. A refusal that names safety fields is never discarded. | P |
| 7.3 | Run forms with a stop, effort or conditions go through `submit`: the frozen `api.mjs` `logRun` cannot carry them (SSCTR-INT-06). | P |
| 7.4 | Plan sessions are shown only through views that honour the authority-expiry state (SEC-CORE-07). | P |
| 7.5 | **C-O1-5 (new):** contest a device workout through the athlete's own form ("this workout is wrong" or "not done"). The session then stays CONFLICTED and earns no credit until the voices agree. No engine change. **Copy (SSCTR C-BC-3):** say that it records a disagreement (no credit, not used for pace), never that the device workout is corrected or deleted. The cause question for a 0-week stop asks what stopped the session (SSCTR-BC-05). | R |
| 7.6 | **R7-B0 expiry (new):** the strength repertoire records expire on **2027-04-30** (`review_by`). An SSCTR renewal must be released before then, or strength planning stops. The app warns when fewer than 60 days remain. | S, and an operational date |
| 7.7 | Request ids: a fresh UUID per user action, reused only for a retry of that action. `CONFLICT_ALREADY_ENROLLED` after a write that landed means the plan exists: read it. | P |

## 8. Physical checks the RC needs (IOS_REVALIDATION_PENDING)

Run them in order (Mac README §15):
1. the FREEZE-7 revalidation as packaged, now with the RC bundle;
2. `testIntegrationBoundary` with `int.json`;
3. the native store and anchor tests of §1;
4. HealthKit background delivery with the app closed;
5. CryptoKit HMAC equal to Node's;
6. the `--jitless`-equivalent JSC run of every fixture;
7. a real synced week.

Any `DIVERGED` fails the run.
