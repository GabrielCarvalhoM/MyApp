# REPMILE CoachingCore V1: final physical validation and release freeze

**State: CLOSED. `REPMILE-COACHINGCORE-V1-FINAL-RELEASE-FREEZE` is emitted.**

| Flag | Value |
|---|---|
| `COACHINGCORE_RUNTIME_FROZEN` | **YES** |
| `INTEGRATION_CONTRACT_STABLE` | **YES** |
| `NATIVE_HOST_VALIDATED` | **YES for the harness host** (JavaScriptCore, CryptoKit, Keychain, file store, process death, locked device, reinstall). **NO** for HealthKit background delivery, watch observations and a real synced week, which have no native implementation yet |
| `REAL_ATHLETE_READY` | **NO** |
| `APPLICATION_READY_FOR_RELEASE` | **NO** |

**Line:** branch `claude/v1-cc-final-physical`, from `8ff74bb` (RC-1, content `89796df`), worktree `.codex/worktrees/myapp-v1-final`. Nothing merged into `main` and nothing pushed.

| Commit | What |
|---|---|
| `503945a` | the candidate: two focal runtime fixes, the bundle relinked with the boundary, the native host and its tests |
| `395c985` | the reviews as received, the evidence, the handoff, the freeze verifier; QRE-FPV-01 closed by a test |
| `460a9ab` | the clean-build iPhone rerun, the freeze inputs (**the commit the record binds**) |
| `6482749` | `CoachingCore/v1/FINAL_RELEASE_FREEZE_V1.json` |

## 1. Repository and environment

- **Branch on the remote:** `origin/claude/v1-cc-blocker-closure` at `8ff74bb` (the handoff commit, a child of `89796df`).
  - `git diff 89796df 8ff74bb` holds the handoff file only.
  - `ee256ae` and `16577b6` are ancestors.
- **Mac:** Mac mini M4, arm64, macOS 27.0 (26A428), Xcode 27.2 (27B52), Swift 6.4.2, Node v24.19.0, `npm ci` (ajv 8.20.0).
- **iPhone:** iPhone 17 Pro Max (`iPhone18,2`), iOS 27.2.1, Developer Mode on, an Apple Development identity, Release, no debugger attached.
- Nothing was reinstalled, and neither Rosetta nor any extra component was needed.

## 2. RC-1 on the Mac (before any change)

- **RC-1 verifier:** `v1-rc-1.mjs --check` gives 87/87, exit 0.
- **Bundle:** `link.mjs` rebuilds the committed bundle `f5d684e5…` (41 modules).
- **Oracles:** J5/P16, focal, core (`dfecdce2…`) and int are equal; vm-check ok with and without `--jitless`. The only diff is `focal.json` `defaultLocale` (this Mac runs en-US), outside the digest.
- **Suite:** 1934 tests / 1888 pass / 46 fail. The failing titles are exactly those of the Windows evidence `suite-96a8ccc.txt`: 0 new, 0 gone (`results/node/suite-titles.txt`).

## 3. What changed (two runtime files, focal)

| File | Finding | Reproduction before | After |
|---|---|---|---|
| `src/boundary/views.mjs` | **SEC-BC-R2-01** (Security R2) | After one operation with the clock 20 days ahead, erasing the report of a standing hold made the plan view **RETURNING, with 3 sessions executable**, while the hold stood: a prescriptive authorization the G07 directive forbids | An erasure marker is read as in force whatever its instant; it can only add a hold. BLOCKED, 0 executable |
| `src/boundary/custody.mjs` | **FPV-01** (found by this mission's journeys, reproduced on `89796df` **and** `ee256ae`) | A report recorded in a week, then a "not 100%" hold and a readiness declaration in the same week: every later write of the athlete was `ENGINE_CONTRACT_VIOLATION`, an essential journey made impossible. The engine re-binds the report's `context.mode`/`phaseClass` to the RETURN plan, and custody refused that as a stored row changed. A sweep found 30 of 144 cases refused | Such a re-binding is read as the row as recorded; any other change is refused as before. 0 of 144 refused |

**Tests** (RED on `8ff74bb`, GREEN on the candidate):
- `test/v1final-sec-bc-r2-01.test.mjs`: 4 tests, 2/3 RED before; the 4th test was added for QRE-FPV-01 and kills the all-facts-ahead mutant.
- `test/v1final-fpv-01.test.mjs`: 3 tests, 3/3 RED before, including the forgeries that stay refused.

**Untouched:**
- No sporting module changed.
- SSCTR confirms no prescriptive change.
- J5/P16, `core.json` and `int.json` are byte-identical.

## 4. The JavaScriptCore bundle with the boundary (README §14, §15)

- **Prelude:** host `hmacSHA256(keyRef, text)` and `constantTimeEqual`, and a minimal `Buffer.from`. Without them `createHmac` still refuses, as before.
- **`entry.mjs`:** also carries `integration`, `store` and `api.mjs`, imported after the engine, so no earlier module id moved.
- **Bundle:** `9cf3149b83540685…`, 48 modules (integration `5b4530ed`, custody `fc576c43`, admission `fe78490f`, views `6f0eb07c`, api `b7c16af2`), 16 assets, export gate 777 bindings, 0 mismatches.
- **Swift host:** CryptoKit `HMAC<SHA256>` with the key resolved by the host from the Keychain; the key never crosses into JS.
- **Native store and Keychain anchor:** `NativeCustody.swift`.

## 5. Node × JavaScriptCore (`results/node-x-jsc.json`, `results/device-395c985/node-x-jsc.json`)

| Fixture | Steps | Mac JSC | iPhone JSC |
|---|---|---|---|
| J5 + P16 + restorations | 38 | 0 DIVERGED | 34 IDENTICAL, 4 EXPLAINED_LIBM, 0 DIVERGED |
| Core lifecycle (24 journeys) ×5 languages | 171 | digest equal | digest equal, anchors equal, `localeCompare` 0, 0 DIVERGED |
| int.json (B, D, G, H) | 78 | 0 DIVERGED | 0 DIVERGED; 56 explained by their final-driver replay |
| final.json (A–H, G07, SEC-BC-R2-01, D1, storage faults), memory store | 184 | 57 IDENTICAL / 127 EXPLAINED_LIBM | the same sets, 0 DIVERGED |
| final.json over the native file store + Keychain | 184 | the same | the same, 0 DIVERGED |

What the comparison covered, and how it was checked:
- **Fields compared:** prescription, ordering, calculations, serialization, timestamps, rounding, hashes, exception classes, persisted state, custody seals and the interpretation of decisions. The result: every digest is equal, except EXPLAINED_LIBM.
- **The EXPLAINED_LIBM rule (RFC-NUMERIC-1 at the boundary; QRE C-FPV-1, Mac README §16).** The boundary keeps the last answer's Race Forecast readings in `carried.presentation.readings`, sealed by `carriedMac`. A 1-ULP `exp` difference in JavaScriptCore therefore changes the stored digest. A step is EXPLAINED only when all of these are equal: the canonical record, the answer and the stored document without the forecast and `carriedMac`, and the forecasts at 9 significant digits.
- **Independent confirmation (QRE):** replaying in Node with the macOS C libm reproduces the device's 57/127 sets id for id. They come from one ULP of `exp(-0.6)`.

## 6. Journeys A–H through the boundary

| Journey | Result (identical in Node, Mac JSC and iPhone JSC) |
|---|---|
| A, first plan | enrol, valid plan, new process over the stored bytes, the same plan |
| B, run | watch + form = one execution, two voices, the same workout again = DUPLICATE |
| C, strength | sets/loads/RIR kept as sent across a new process; `api.logStrength` |
| D, correction | history kept, deterministic bytes |
| E, invalid corrections | another athlete's event, another author, a forged identity: refused, the record byte-identical |
| F, restart | the whole record handed to the engine, the new plan continues after a new process |
| G, safety | hold, readiness, a symptom stop corrected: the restart still asks; a later declaration answers it |
| G07, erasure | the hold's report erased: **BLOCKED**, delivery `SCREEN_REQUIRED`; a valid readiness declaration and a new screen continue |
| H, failures | `replayed`, `CONFLICT_STALE_VERSION`, `BEFORE_RECORD_START`, DUPLICATE, `RECORD_ROLLED_BACK`, acknowledgement, `FORBIDDEN`/`INTEGRITY_FAILURE` on tampering, `RECORD_LOST`, `GONE` |
| D1, clock | an observation 299 s ahead is quarantined, 301 s refused; behind the record writes are refused while revocation passes; an operation clock a day ahead is accepted by the boundary (the native bound is required) |

## 7. CryptoKit, Keychain, persistence and the iPhone (`results/device/IOS_REVALIDATION_REPORT.md`)

- **CryptoKit:** HMAC equal to Node, 40/40 directly and through the JSContext, and every boundary seal.
- **Keychain:** class `cku` (AfterFirstUnlockThisDeviceOnly).
- **One writer:** 200/200.
- **Failed write:** a simulated ENOSPC gives `PERSISTENCE_FAILURE` with the record unchanged.
- **Process death after the rename:** the stale lock is cleaned and the retry answers `replayed`.
- **Process death before the rename:** `.tmp`/`.lock` are cleaned, the earlier record verifies, and the retry records anew.
- **Device locked:** the record was read and written over the native store while locked (`completeUntilFirstUserAuthentication`).
- **Reinstall:** the file is deleted, the Keychain items survive, and the boundary answers `RECORD_LOST`. That is a new, physically confirmed app obligation (NATIVE 1.5, handoff §6.1).
- **Not done:** HealthKit was not run, since the harness has no path for it; nothing is claimed for background delivery, watch observations or sync.

## 8. Performance and memory (PF-0, iPhone, clean build of `395c985`)

| Measure | Result | Budget |
|---|---|---|
| Cold context + bundle p95 (n=10) | 47.7 ms | 1 s |
| Cold first plan p95 | 105.7 ms | 2 s |
| Full-plan review p95 | 290.8 ms | 1.5 s |
| Review worst case | 296.9 ms | 3 s |
| Footprint after GC | 14.4 MB | 150 MB |
| Lifetime peak footprint | 33.3 MB | 350 MB |
| Atomic write p95 | 3.1 ms | 50 ms |
| Max main-queue stall | 9.1 ms | 100 ms |

Notes:
- **Thermal state:** nominal at the start, fair at the end. The first run, under `serious`, gave the same verdicts.
- **Boundary replay:** the 184-step replay peaks at 36.5 MB.

## 9. Independent reviews (as received, `reviews/`)

| Judge | Verdict | Conditions and how they were met |
|---|---|---|
| QRE | **READY_WITH_CONDITIONS** | C-FPV-1: the libm persistence rule stated (README §16, handoff §10). C-FPV-2: the clean-build rerun of `395c985` on the iPhone, and the locked-device harness committed. QRE-FPV-01: test added. QRE-FPV-03 (info) |
| Security / PCG | **PASS_WITH_CONDITIONS** | C1: the G07 claim scoped to holds (SEC-FPV-01). C2: Founder and legal G07 retention. C3: D1 wording adopted (handoff §8). C4: schema requirements (handoff §5). C5: SEC-FPV-02/03 native obligations (N-4, N-5); SEC-FPV-04 locked-device evidence done. C6: sanitization done |
| SSCTR | **ACCEPT** | no prescriptive change. SSCTR-FPV-01..03 informational |

**Correction cycles:** one focal correction for each reproduced material defect, and none after the reviews (the QRE test addition touches no runtime byte).

## 10. Findings and remaining conditions

**Not blocking the freeze:**

| ID | Severity | Note |
|---|---|---|
| SEC-FPV-01 | Low | Before real athletes. Erasing a "not 100%" report that opened no hold drops its question and the view becomes executable; writes still need a new screen. Native obligation N-3, or a reviewed boundary state |
| SEC-FPV-02 | Low | Before real athletes. Production key handling (N-4) |
| SEC-FPV-03 | Low | Before real athletes. Cross-process lock and atomic anchor update (N-5) |
| QRE-FPV-02 | Low | Met |
| QRE-FPV-03 | Info | — |
| SSCTR-FPV-01..03 | Info | — |
| SEC-BC-O-1 | Optional | — |
| SSCTR-BC-02/03 | — | Pre-existing Core decisions |

**G07, as delivered:**
- **The safety need:** an erasure is never read as recovery or readiness for any clinical hold. Readiness must be declared again.
- **The legal side:** keeping the stop facts after an erasure request, and the wider ledger row Security points to, need **Founder and legal validation**. Unrestricted retention is not presumed.

**SEC-INT-05 rest and SEC-INT-12:**
- The schemas are prepared (handoff §5).
- They close with the schema tests (N-1) and Security's C4 requirements (closed at every level, typed and bounded, no free text).

**D1:** the 300 s policy holds in the engine. The trusted reference is the app's (handoff §8); no source of trusted time is invented.

## 11. Final regression

The suite with the record (`6482749`) is in §13. The other final checks:
- **Records:** none lost, no credit doubled (journey B, sweeps), no dose change (SSCTR; core fixtures byte-identical), no readiness released improperly (SEC-BC-R2-01, G07 variants, the forgeries of p8/q4/r1).
- **Runtimes:** no unexplained JavaScriptCore divergence.
- **Performance and determinism:** performance within PF-0; oracles deterministic; hashes as recorded.

## 12. Answers

1. **Is the engine definitively frozen?** **Yes.** `REPMILE-COACHINGCORE-V1-FINAL-RELEASE-FREEZE`, record `CoachingCore/v1/FINAL_RELEASE_FREEZE_V1.json`, binding 87 files at `460a9ab` (filesDigest `0a417686…`) and the bundle `9cf3149b…` that ran on the iPhone. Verify with `node CoachingCore/scripts/v1-final-release-freeze.mjs --check`.
2. **Does the implementation need any further internal change before launch?** **No planned one.** The engine and the boundary need nothing for SwiftUI, backend or HealthKit work. The real-athlete items are app or native obligations and decisions. SEC-FPV-01 is the one that may become a small reviewed boundary change, under the post-freeze exception rule, if the Founder prefers it to the native obligation N-3.
3. **What still depends on the app?** `NATIVE_OBLIGATIONS_FINAL.md`. Main items:
   - the app facade bundle (handoff §2);
   - the store, anchor, key and first-launch reconciliation on the app's own code;
   - the cross-process lock;
   - HealthKit delivery and its queue;
   - the trusted clock;
   - erasure on every layer;
   - the warning-sign screen and copy;
   - logs without payload;
   - the R7-B0 expiry warning.
4. **What still prevents real athletes?** SEC-FPV-01/-02/-03, the Founder and legal G07 retention, D1 on the device, D2 backup, D3 minimum iOS, the SEC-INT-05/-12 schema tests, SSCTR-BC-01, the C-BC-3/SSCTR-BC-05 copy, HealthKit background delivery and a real synced week, log privacy, and the R7-B0 renewal before **2027-04-30**.
5. **Which commit should SwiftUI consume?** **`460a9ab`** (the CoachingCore bytes bound by the record), on branch `claude/v1-cc-final-physical`, whose tip `6482749` carries the record. Push the branch first, which needs the Founder's authorization.
6. **What is the next implementation mission?**
   - The V1 app integration layer: the production facade bundle and its device equivalence gate; the Swift `CoachingHost` (queue, crypto, Keychain key and anchor, file store, first-launch reconciliation, trusted clock); and the HealthKit queue.
   - The SwiftUI screens over the views of handoff §7, built against the new Figma once promoted.
   - It ends with background delivery and a real synced week on the device.

## 13. Suite with the record

On `6482749`, the suite with the record ran **1942 tests / 1895 pass / 47 fail** (`results/node/suite-freeze.txt`).

**Against RC-1:**
- The one new failing title is the RC-1 record test. It fails by design: its successor `v1final-freeze-record.test.mjs` passes.
- No title stopped failing.
- The other 46 failing titles are RC-1's own, identical to the Windows evidence.
- All 7 new tests pass.

**Swift:** `swift test` from a clean `git archive` of `395c985` gives 24 tests, 0 failures (the 6 guarded phases are skipped; `results/mac/swift-test-mac-clean-395c985.log`).

## 14. Policy after the freeze

- **No planned change to CoachingCore before the V1 launch.**
- **Exceptions:** a real safety defect, a proven incompatibility, an integrity failure, or a bug that makes an essential journey impossible.
- **Each exception needs:** a reproduction, a focal fix, the regression, the device equivalence rerun, the competent reviews, and a successor record.
- **Forbidden:** new sporting features, optional refactors, prescription expansion, generic audits, intermediate freezes, a new engine architecture, unauthorised dose changes.
- **Further coach development** happens on a successor line; this release stays as frozen.

No further mission is started here.
