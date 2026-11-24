# SEC_FPV_R1: Security / PCG review of the V1 final physical validation

**Judge:** Security, Privacy & Abuse Architect. This is the same independent instance as SEC_BC_R1/R2. I am not the author. **Date:** 2026-11-24. Synthetic athletes only.

**Scope:** final validation, not a new audit. I judge the six items the mission names, on commit `503945a` (branch `claude/v1-cc-final-physical`) against base `8ff74bb` (RC-1 content `89796df`). I block only for a reproduced material defect.

**Bytes judged:**

| File | sha256 (16) |
|---|---|
| `boundary/custody.mjs` | `fc576c433b26fb78` |
| `boundary/views.mjs` | `6f0eb07c50933152` |
| `boundary/integration.mjs` (unchanged since R2) | `5b4530edd9cda9b2` |
| `boundary/admission.mjs` (unchanged) | `fe78490f9c481af7` |

The shipped bundle `coachingcore-p0.js` is `9cf3149b…`. It equals the build manifest and the `bundleSha256` the device reported. The manifest names these four module hashes, and the bundle text contains both corrections.

**My R2 run condition is met:** the device now ran the boundary, not only the engine.

## Commands run

All runs were in my own `git archive` copies of `503945a` and `8ff74bb` (`npm ci` in each). The author's worktree was not touched, except this file and `probes/`. Nothing was committed or pushed.

**Tests:**
- `node --test test/v1final-fpv-01.test.mjs test/v1final-sec-bc-r2-01.test.mjs`: **6/6 pass**.
- Boundary sets `v1int*`, `v1bc*`, `v1final*`, `v1fc*`, `v1cib*`, `v1cp*`:
  - `503945a`: 330/334;
  - `8ff74bb`: 324/328.
  - The 4 failures are identical by title on both trees: the old freeze/inventory pins C-NCC-3(b), QRE-INT-11 A04L, RC-1 FREEZE-7 and V1INT-SUCCESSOR-1.

**Fixtures:**
- `final-oracle.mjs` regenerated `final.json` byte-identical to the committed one (digest `84ffa15a…`, 184 steps).
- `hmac-oracle.mjs` regenerated `hmac.json` byte-identical.

**My earlier probes, re-run on both trees** (each takes the root holding `CoachingCore`; `p8` runs from `CoachingCore/`): `q5`, `q4`, `p8`, `q6`.

**New probes** (in `probes/`):

| Probe | sha256 (16) |
|---|---|
| `r1-rebinding-forgery.mjs` | `e201501a95a2b37a` |
| `r2-g07-erasure-never-readiness.mjs` | `9857781cb83bbe08` |
| `r3-g07-erased-question.mjs` | `06c2f58a197707bc` |
| `r3b-after-erased-question.mjs` | `c8f26d93d2f170e0` |
| `r4-hold-fact-clock-behind.mjs` | `aaf1d1b670747848` |

**Device evidence read:** the raw `boundary`, `deathA1`, `deathB1`, `recover`, `locked` and `reinstall1/2` logs from iPhone 17 Pro Max, iOS 27.2.1. No identifier from them is copied here.

## Verdict: **PASS_WITH_CONDITIONS**

REPMILE-COACHINGCORE-V1-FINAL-RELEASE-FREEZE may be emitted on these bytes, **for synthetic athletes**:
- SEC-BC-R2-01 is closed.
- FPV-01 opens no forgery path.
- Erasure is never read as readiness for any hold.

No finding is blocking. The conditions below go in the freeze record.

## Per item

**1. SEC-BC-R2-01 (views.mjs): CLOSED.**
- **Result:** `q5` v6 now reads **BLOCKED**, with weekly `CLOCK_BEHIND_RECORD`. On `8ff74bb` it read RETURNING. v1–v5 and v7 are unchanged (BLOCKED / CLINICAL_HUMAN_REQUIRED).
- **It cannot release a hold:**
  - The extra set holds only `ERASED_F08` rows.
  - `lastReady` in `standingHolds` is computed from READINESS_DECLARED rows only, so it does not move.
  - So the holds list can only grow.
- **No new forgery surface:**
  - A marker is a sealed custody fact. It is dated `max(now, lastAt)` by custody, and the client cannot set its date (`ENGINE_OWNED_FIELDS`). It sits under the keyed chain and the doc MAC, so a planted one is `INTEGRITY_FAILURE`.
  - Even a forged far-future marker would only *add* a hold: fail-closed.
- **"Stuck BLOCKED":**
  - The view stays BLOCKED only while writes are already locked (`CLOCK_BEHIND_RECORD`).
  - Once the clock passes `lastAt`, a readiness declaration is dated after the marker and releases it, as the test pins.
  - How long this lasts is the D1 window (item 5), not a new problem.
- **Other readers:**
  - `custody.mjs` `holdsOf` (lines 287, 316) still reads as of `op.at`, but every mutating op is refused first when `lastAt > op.at` (integration.mjs:81).
  - `r4` found no CLINICAL_HOLD analogue: a hold recorded ahead stays BLOCKED through `reference.pending`.

**2. FPV-01 (custody.mjs `asRecorded`): ACCEPTED, no forgery path.**
- **Earlier probes:** `p8` (6/6 forgeries refused, both controls kept) and `q4` (all forgeries refused except the known optional SEC-BC-O-1 label swap, all legitimate shapes kept). The output is identical on both trees.
- **New probe `r1` (forgery plus re-binding):** it re-binds mode/phaseClass *and* applies a forgery in the same review. All 7 forgeries are still `ENGINE_CONTRACT_VIOLATION`: dropped ADVERSE/IMPAIRED, fabricated rpe, completed removed, stop removed, kept voice amount fabricated, conflict flag cleared, plain minutes change.
- **New probe `r1` (legitimate shapes):** MERGE and KEPT with re-binding are kept, and the stored context is unchanged (`mode` stays `EASY`). A re-binding alone is kept byte-equal with no chain entry. On `8ff74bb` all three were refused.
- **New probe `r1` (other shapes):** 9 are refused:
  - a key added;
  - a key removed;
  - mode as a number or as an object;
  - phaseClass removed;
  - context removed or replaced by a string;
  - sessionType or plannedHash changed together with mode.
- **Keeping the recorded context is the safe choice:**
  - Storage is unchanged from before the fix: no reader of stored rows sees anything new.
  - The engine re-binds every row on each decision (`bindObservations` overwrites `context` for in-plan rows), so engine readers are unaffected.
  - Rows of an earlier plan are "carried exactly as recorded" (r6-adaptation.mjs:209). For them the recorded binding is the truthful one: the session was done under that prescription.
- **Readers outside the engine:**
  - `v1-f08.mjs` `restartIntake` `sportOf` reads `context.sessionType` / `sport`. Both are enforced byte-equal.
  - Run calibration and forecast read `context.mode === 'EASY'`, but on engine-bound rows.
  - Record the semantics in the contract: stored `context.mode` / `phaseClass` mean "as bound when first recorded".

**3. Harness host crypto: correct for the harness. It differs from production in the ways listed under SEC-FPV-02/03.**
- **CryptoKit HMAC against Node:**
  - 40/40 vectors, direct and through JS.
  - `boundary-final-*` and `int` ran 1098/685 `constantTimeEqual` calls with no divergence. The `digestEqual:false` entries are all classified libm (`unexplained: 0`, a QRE matter).
- **Fail-closed paths:**
  - The `createHmac` path fails closed: no resolver or an unknown reference gives `""`, and the JS side throws.
  - `timingSafeEqual` throws without the host function.
- **Keychain:** the Keychain class read back is `AfterFirstUnlockThisDeviceOnly` ("cku").
- **Native store results:**
  - `death-A1`/`B1`/`recover`: replayed vs recorded anew, as specified, with the leftovers cleaned.
  - Write failure: `PERSISTENCE_FAILURE`, then OK.
  - Reinstall: `RECORD_LOST`, with the Keychain kept.
  - Concurrent writers: 200 wins and 200 refusals.
- **Info:** `Buffer.from().length` is the UTF-16 length, while Node uses the UTF-8 byte length. Custody compares string lengths first, and MACs are hex, so there is no effect.

**4. G07 (erasure):**
- **Met for every hold:**
  - `final-g07-erasure` gives BLOCKED, then `SCREEN_REQUIRED`, then the declaration and screen continue.
  - `r2` e1–e4, e6, e7 all end BLOCKED, with 0 executable, status BLOCKED and the next weekly CLINICAL_HUMAN_REQUIRED. The variants cover:
    - erasing every F08 fact;
    - erasing **the readiness declaration** only (RETURNING became BLOCKED);
    - a screen with no declaration;
    - erasing the erasure marker itself (a new marker; still BLOCKED);
    - revoke, erase and re-grant;
    - erasing twice.
  - A readiness declaration is the only exit (e9, e10). In e10 the symptom stop is still retained; it was screened when it was reported.
- **Not met for a pending question (SEC-FPV-01):**
  - A "not 100%" report that opened no hold but left an ASK (warning signs unanswered) is erased through the logged-only path.
  - No marker is written, the question goes, and the view moves from NEEDS_INPUT (0 executable) to VALID_PLAN (3 executable).
  - This is identical on `8ff74bb`.
- **Legal / Founder validation (not assumed permitted):**
  - **(a) Stop-fact retention (§6.2), wider than its wording.** A session report that states `stop: SYMPTOM` and `recovery: ADVERSE` is not erasable by `eraseHealthFacts` (`r2` e5: `NOT_FOUND`). The whole ledger row is kept, not only "session, report id, speaker, reason". This is data concerning health. It needs a lawful basis for keeping it against an erasure request (GDPR Art. 9/17(3), LGPD Art. 11/16), a stated purpose (the athlete's safety), a retention period, and the athlete's notice. Otherwise the row must be narrowed to the four fields, or made erasable with a content-free safety marker.
  - **(b) Keyed digests of erased rows.** The chain keeps them (no oracle without the key). Confirm that this counts as erased.
  - **(c) Decision entries.** Their id and time are kept after scrubbing.
  - **(d) Device backups.** iCloud/Finder backups may hold copies from before the erasure (D2). Either exclude the store from backup, or state that the erasure reaches backups only as they rotate.
  - **(e) Keychain items survive app deletion.** The anchor and key hold no health content. §6.3 must delete them at account erasure.

**5. D1 (trusted clock):**
- **What the journey shows:** a workout 299 s ahead is quarantined, 301 s ahead is `FUTURE_OBSERVATION`, and the boundary accepts an operation clock a day ahead.
- **What §5.1 assumes:** a "last server time". It must not presuppose a source V1 does not have. The wording I require is under Conditions, C3.

**6. SEC-INT-05 rest / SEC-INT-12:**
- **Not closed by this candidate.** There is no code change.
- **What closes them:** the schema handoff can close them only with the content listed under C4.

## Findings

| ID | Severity | Blocking for the synthetic freeze | What | Reproduction | What closes it | Owner |
|---|---|---|---|---|---|---|
| **SEC-FPV-01** | Low (view only; the athlete's own erasure; pre-existing, by design SEC-V1FC-05) | **No.** **Yes before real athletes.** | Erasing a "not 100%" report that left an unanswered question (ASK, NEEDS_INPUT) drops the question with no marker. The plan view then shows sessions executable, although no warning sign was ever answered. This breaks the letter of the G07 directive for this one class. **Mitigated:** the device channel is `SCREEN_REQUIRED`, and an athlete report without a screen answers ASK with nothing recorded (`r3b`). So nothing is prescribed, recorded or delivered over it. | `r3` a/b/c: before NEEDS_INPUT/0 executable, after VALID_PLAN/3 executable, `marker:false`. The same on `8ff74bb`. | Either of these: **(a)**, preferred and portable: an erased question leaves a content-free "screen required" state. For example, the logged-only path keeps the pending reference as `{status:'ASK', missingInputs:['eligibility'], reason:null}`, or the view reads NEEDS_INPUT while no screen is stored after an erasure. **(b)** A native obligation (strengthen §6.1): after any `eraseHealthFacts`, the app shows no session as executable and opens the warning-sign screen until a screen is recorded. SSCTR ratifies. The freeze record must scope its G07 claim: "never readiness for any hold; a question goes with its report, and a new screen is required to record anything". | Engineering (boundary views/custody), or Native + SSCTR |
| **SEC-FPV-02** | Low | **No.** **Yes before real athletes.** | The harness passes the synthetic key **text** as the HMAC reference. The key is then in the JS heap and in committed fixtures (`int.json`, `final.json`, `hmac.json`). The resolver maps any registered reference. | `BoundaryTests.keychainKeys`; `hmac-oracle.mjs`. | Production, in the wording of §1.5/§2.1: **(1)** `createIntegration({key})` gets an opaque label (for example `custody.v1`), never key bytes. **(2)** The host generates 256 random bits (`SymmetricKey(size:.bits256)` / `SecRandomCopyBytes`) at first enrollment. It stores them as a generic-password item: `AfterFirstUnlockThisDeviceOnly`, `kSecAttrSynchronizable=false`. **(3)** The resolver answers only that label (an allowlist), and nil for anything else. **(4)** The key is never logged, never in a crash report, and never equal to a committed fixture key: refuse to start otherwise. **(5)** Item writes use `SecItemUpdate`, and fall back to add on `errSecItemNotFound`. **(6)** §6.3 deletes the key and the anchor. | Native |
| **SEC-FPV-03** | Low | **No.** **Yes before real athletes.** | **(a)** `NativeFileStore` deletes every `.lock` at start unconditionally, and its writer test is two threads in one process. That is safe for one process only; §1.3 covers the app, its extensions and background delivery. **(b)** `Keychain.set` is delete-then-add. A crash between the two loses the anchor, which weakens rollback detection. | `NativeCustody.swift` `init`, `Keychain.set`; `native-concurrent-writers` (in-process). | **(a)** A kernel-released lock (`flock`/`fcntl` on an open descriptor). Stale-lock removal happens only once the holder is known dead. A two-process test (app plus extension, or two processes). **(b)** Atomic update, as in SEC-FPV-02 (5). | Native |
| **SEC-FPV-04** | Info (evidence) | No (Security) | At `503945a` the locked-device run (§1.2) was **skipped** ("not locked within 120 s"). The author's worktree has an uncommitted retry. The background write after first unlock is therefore not yet evidenced. | `locked.log` (1 skipped). | The freeze record must not count §1.2 as proven until a committed run shows `locked-device` with `locked && stillLocked`, `write: OK` and no Keychain failure. | QRE / Native |
| **SEC-FPV-05** | Info (privacy of evidence) | No | The raw device logs contain the developer's home path, a device-identifier-shaped value and team references. The untracked `results/mac/*.log` contain the home path. | Counts only; nothing copied here. | Sanitize before anything is committed: paths become `<repo>`/`<home>`, identifiers are dropped. Commit only `P0RESULT` lines and summaries. | Author |

**Not mine, noted:** SEC-BC-O-1 (the label swap kept, optional) is unchanged.

## Conditions for the freeze record

These are not blocking for the synthetic freeze.

- **C1.** SEC-FPV-01 as above, with the G07 claim scoped.
- **C2.** Founder/legal validation of the G07 retention points (a)–(e) in item 4. Nothing beyond §6.2's four fields may be assumed permitted.
- **C3.** D1 wording for §5.1, with no invented source. It replaces "the last server time plus the monotonic uptime since". The device clock given to `createIntegration` must be bounded by **one of two references, each named concretely:**
  - **(i) A server reference.** The instant in an authenticated response from a server the project operates. It exists only if V1 has such a server (a Founder decision): Apple's NTP and HTTP `Date` headers of third parties are not trusted references. It is extended by a monotonic clock that counts sleep (`mach_continuous_time` / `clock_gettime(CLOCK_MONOTONIC_RAW)`), and invalidated at reboot (the boot session changes).
  - **(ii) A local reference.** The `lastAt` of the record plus the monotonic time elapsed since that write, in the same boot session.
  - **Refusal:** an operation more than **300 s** ahead of the reference is refused before custody, and nothing is written.
  - **With no valid reference** (first launch offline, or after a reboot before any contact): the app must not treat the wall clock as trusted. The Founder decides between two options. One is to accept, labelling the operation as unbounded, with the window shown as a known residual (it can lock writes and delay the hold view until the clock catches up). The other is to refuse until a reference exists.
  - **Check:** a clock set a day ahead is refused, both with a reference and in the same boot session.
- **C4.** SEC-INT-05 rest / SEC-INT-12 close only with a schema that:
  - **(1)** is closed at every level (`additionalProperties:false`), per entry point: intake anchors, and `actual` per channel (ATHLETE form vs DEVICE/HealthKit). The DEVICE channel holds only measured fields (§4.1).
  - **(2)** lists every key with its type, its bounds (number ranges, string length, list counts) and its enum vocabulary, derived from what the engine's readers read (the five modules named in V1_BLOCKER_INVENTORY), and nothing else.
  - **(3)** has no free-text field, or every one listed, bounded and justified.
  - **(4)** is encoded by Swift `Codable` structs with no `[String: Any]` or `JSON` pass-through.
  - **(5)** has a contract test: every schema-valid payload is admitted, and a payload with one extra key at any depth is rejected before the boundary.
  - **(6)** is versioned, so a schema change is a reviewed change.
  - The boundary-side allowlist (admission/r6-intake) stays a residual (Low, Engineering/Core) until any second client exists.
- **C5.** SEC-FPV-02/03 native obligations, and SEC-FPV-04 evidence.
- **C6.** SEC-FPV-05 sanitization before commit.

## Before real athletes

C1–C5, plus the earlier open items: Founder D1/D2, the §3.5 and §4–§7 native obligations at revalidation, SSCTR-BC-02/03, and SEC-BC-O-1 (optional).

**Gate scope:** `503945a` only. **Real athletes:** NO.
