# QRE FPV R1: final physical validation of the V1 candidate

**Judge:** Quality & Reliability Engineer (independent; not the author). **Synthetic only.**

**Version judged:** `503945a` on `claude/v1-cc-final-physical`, against the release candidate RC-1 base `8ff74bb` (content `89796df`, record `96a8ccc`).

**Scope:**
- the candidate's two runtime changes (`views.mjs` SEC-BC-R2-01, `custody.mjs` FPV-01) and their tests;
- the relinked harness;
- the physical-equivalence evidence and the EXPLAINED_LIBM rule;
- determinism.

This is not a new audit. Real-athlete readiness is out of scope.

## Verdict

**READY_WITH_CONDITIONS.** Both fixes do what they claim:
- They are RED on `8ff74bb` and GREEN on `503945a`.
- They regress nothing by title.
- Every mutant that changes their meaning in the tested direction is killed.

The physical evidence holds up when I recompute it myself:
- I emulated the platform C libm in Node. That reproduces the device's step classification **exactly**: the same 127 EXPLAINED_LIBM step ids and 57 IDENTICAL steps, from a single 1-ULP difference in `exp(-0.6)`. That is the same argument the device's own `testLibmBits` reports.
- No step is DIVERGED, and nothing outside `runForecast` moves.

The conditions are documentary only (C-FPV-1, C-FPV-2). They change no `CoachingCore` byte, so `REPMILE-COACHINGCORE-V1-FINAL-RELEASE-FREEZE` may be emitted on these bytes (synthetic use) once they are met in the freeze record and the final report. Any later change to `CoachingCore` invalidates this verdict for the changed scope.

## Commands

All of these ran in my own scratch copies: a local clone checked out at `503945a`, and a worktree of that clone at `8ff74bb`, each with `npm ci` in `CoachingCore`. A third worktree at `503945a` was used for mutation only. Nothing in the author's worktree was modified, staged or committed, except this file and `probes/`.

- **New tests.** `node --test --test-reporter=tap test/v1final-sec-bc-r2-01.test.mjs test/v1final-fpv-01.test.mjs` on `503945a`, then the same two files copied onto `8ff74bb`.
- **Suite.** `node --test --test-reporter=tap` in `CoachingCore` on both copies. Failing titles were compared from the TAP output. My candidate titles were also compared with the author's `suite-mac-final.txt` (`evidence/titles.mjs`).
- **RC-1 verifier.** `node CoachingCore/scripts/v1-rc-1.mjs --check` on both. I also recomputed the record's 87 bound hashes directly.
- **Oracles and determinism** on `503945a`, with `git status --porcelain` after each:
  - `build/link.mjs`;
  - `lab/oracle.mjs`;
  - `lab/focal-oracle.mjs`;
  - `core-oracle.mjs`;
  - `int-oracle.mjs`;
  - `final-oracle.mjs`;
  - `hmac-oracle.mjs`;
  - `final-vm-check.mjs` and the older `vm-check.mjs`, each with and without `--jitless`.
- **Probes** (`probes/`, outputs in `probes/out/`):
  - `p01-libm-emulation.mjs`: final.json replayed in Node with Math.exp/log/pow taken from the platform C libm (the library JavaScriptCore calls), and with every exp or pow result moved by 1 ULP;
  - `p02-mutants.mjs`: 15 mutants, run against the two new test files and, for survivors, also the 10 `v1int-*`/`v1bc-*` boundary files;
  - `p03-fix-edges.mjs`: a clock-ahead readiness for the view, and a 90-case FPV-01 sweep over weeks 0–2.
- **Device and Mac evidence.** I read the raw device logs and the macOS XCTest logs. I extracted every `P0RESULT boundary-*` report and compared the EXPLAINED step sets across the runs. I recomputed PF-0 with `lab/device-budgets.mjs` from the raw device results, including the cold samples. I did not copy any device identifier, account or personal path.
- **Not run by me:** `swift test` on this Mac. It writes to the user's login Keychain. The Mac and device JavaScriptCore results are the author's runs, and I judged them from their raw logs and from p01.

## Evidence

| Check | Result |
|---|---|
| New tests on `8ff74bb` | SEC-BC-R2-01: **2/3 fail** (tests 1 and 3; test 2, the caught-up clock, already held). FPV-01: **3/3 fail** |
| New tests on `503945a` | **6/6 pass** |
| Suite `8ff74bb` | 1934 tests, 1888 pass, 46 fail |
| Suite `503945a` | **1940 tests, 1893 pass, 47 fail**, as reported. Against `8ff74bb`: **1 new failing title**, the RC-1 record test, and 0 gone. My 47 titles equal the author's 47 (0/0 difference). The 6 added tests are the two new files |
| RC-1 | On `8ff74bb`, `--check` gives 87/87 and exit 0. On `503945a`, it exits 1 with `CHANGED and not declared: views.mjs` and the two new tests. Of the 87 bound hashes, exactly **`custody.mjs` and `views.mjs`** differ (`custody.mjs` is a declared RC-1 amendment file, so the undeclared-change line names only `views.mjs`). This is by design; the freeze record must bind the new bytes |
| `CoachingCore` diff | 4 files: the two sources and the two tests. No engine file changed |
| Oracles | All exit 0. **`git status` is empty after every one.** `link.mjs` gives 48 modules and bundle `9cf3149b83540685…`, the same as the committed `build-manifest.json`. The `final-oracle` digest is `84ffa15a…`; the replay equals the live run and is deterministic twice. The tampered codes are `FORBIDDEN, RECORD_ROLLED_BACK, INTEGRITY_FAILURE, OK` |
| Fixtures vs `8ff74bb` | `j5.json`, `p16.json`, `core.json` and `int.json` are byte-identical. `focal.json` changes only `bundleSha256` and `defaultLocale` (pt-BR → en-US, the machine locale, outside the digest). `final.json` and `hmac.json` are new |
| `final-vm-check` (JIT / `--jitless`) | ok: int 78 steps and final 184 steps, `digestEqual` true, 0 diffs, 0 unsupported, 0 misses, HMAC through the host shim. `vm-check.mjs` (core) is ok in both modes, with `localeCompareCalls` 0 |
| Device boundary (iPhone18,2, iOS 27.2.1, Release) | final memory and final native file+Keychain: 184 steps, **0 DIVERGED**, 57 IDENTICAL, 127 EXPLAINED_LIBM. int memory: 78 steps, 0 DIVERGED, 22 IDENTICAL, 56 candidates, **unexplained 0**. The bundle SHA in the log is `9cf3149b…` (= my relink of `503945a`). Keychain failures: none. Anchor writes: 66 |
| Consistency of the EXPLAINED sets | The device memory, device native, Mac memory and Mac native sets (both Mac logs) are **identical**, id for id. The int set equals the `final-int-*` subset of final. Per journey: b 17, d 11, g 12, h 16, A 8, C 6, E 9, F 4, G07 1, SEC-BC-R2-01 1, D1 10, H 32 |
| p01, platform libm emulated in Node | Node uses 4 distinct exp arguments; only `exp(-0.6)` differs (V8 `…0265`, libm `…0264`, the device's `testLibmBits` value). With it: **57 IDENTICAL / 127 EXPLAINED / 0 DIVERGED, the same 127 ids as the device** |
| p01, worst cases | Every exp result ±1 ULP (344 calls): 127 EXPLAINED, 0 DIVERGED. Every pow result +1 ULP (2568 calls, beyond any real libm): 127 DIVERGED, all on `forecastCoarse` only, with nothing else in any step changing. The classifier flags a change it should not excuse |
| Other device suites | EquivalenceTests 5/5: J5 5 IDENTICAL; P16 29 IDENTICAL + 4 EXPLAINED_LIBM (as P0); restore IDENTICAL. `testCoreSafetyLifecycle` en/pt-BR/da/nb/cs: 24 journeys, 171 steps, 0 DIVERGED, `digestEqual`, anchors equal; the five reports are byte-identical. `testLocaleAndSortCoverage` en: `localeCompare` 0 |
| HMAC / store | HMAC vectors 40/40, both direct and through the JS host. Keychain class `cku` (AfterFirstUnlockThisDeviceOnly). Concurrent writers: 200 wins / 200 refusals / 0 other. File protection: CompleteUntilFirstUserAuthentication. Write failure gives PERSISTENCE_FAILURE with the record unchanged, then OK at v2. Locked device: read and write OK while locked, no Keychain failure. This one ran from an **uncommitted** `BoundaryTests.swift` (background task + `.complete` canary), not from `503945a`'s; see QRE-FPV-04. Reinstall: the file is gone and the Keychain marker survives, so the read is `RECORD_LOST` (fails closed) |
| PF-0 (recomputed) | All PASS: warm load p95 44 ms; first plan 100 ms; review p95 285 ms, worst 290 ms; footprint 13 / 33 MB; atomic write 3.3 ms; main stall 9 ms; **cold** load p95 47 ms and cold first plan 106 ms (n=10). The cold samples were taken charging with thermal state `serious`, which only makes the margins conservative |

## The two fixes

**SEC-BC-R2-01 (`views.mjs`).**
- `ahead` contains only `ERASED_F08` markers that the as-of read dropped. `lastReady` is computed from the as-of list only, so the union can only add holds and never release one. The claim "it can only add a hold" is true by construction.
- p03 (a): a readiness declared with the clock 20 days ahead, then the clock set right. The committed view stays BLOCKED (0 executable), writes are CLOCK_BEHIND_RECORD, and RETURNING comes only once the clock passes the declaration. That is correct and conservative.
- Mutants (p02): V1 (drop `ahead`) is **killed** by tests 1 and 3.
- V2 (every fact type ahead) and V3 (everything read at Infinity) **survive**, both on the two new files and on the 10 boundary files. p03 (a) shows the state where they differ: V2 would read 0 holds and release the view. See QRE-FPV-01.
- V4 (order) is equivalent, because `standingHolds` sorts.

**FPV-01 (`custody.mjs`).**
- `asRecorded` only replaces the engine's context with the recorded one when the contexts differ exactly in `mode` and/or `phaseClass` and both new values are strings. It excludes F08 facts, so nothing new is stored. The `annotates`/`evolves` checks then run unchanged.
- I confirmed the `bindObservations` context (16 keys) in `r6-adaptation.mjs`. Only `mode` and `phaseClass` depend on the plan's mode for a session already on record.
- p03 (b), 90 cases (hold in weeks 0, 1 or 2, any day, declaration 1–3 days later, report done or stopped, then screen, later report and correction):
  - on `8ff74bb`: **36 ENGINE_CONTRACT_VIOLATION**, 12 in each week, so the class is wider than week 0;
  - on `503945a`: **0**.
- Mutants:
  - widening REBINDING (+sessionType, +plannedMinutes, +sessionId/sport): **killed**;
  - narrowing to `mode` or `phaseClass` only: **killed**;
  - dropping the `typeof` check: **killed**;
  - `asRecorded` returning `y` unconditionally: **killed**;
  - keeping the engine's context: **killed**;
  - no omit comparison: **killed**;
  - replacing every differing context: **killed**;
  - C10 (drop the `fact` exclusion) **survives**, and is equivalent on current shapes: F08 fact rows carry no `context` object (checked), so `isObj(x.context)` already returns `y`.

## The EXPLAINED_LIBM rule (RFC-NUMERIC-1 at the boundary)

**What it accepts.**
- A step is EXPLAINED_LIBM only when everything in the step report except the full `answer` and `stored` digests is equal. That includes:
  - code, status, version, counts, screen, state, `executable` and hold;
  - `answerSans` and `storedSans`, which leave out only keys named `runForecast` and `carriedMac`;
  - `canonical`, the stored document without `carried`/`carriedMac`;
  - `forecastCoarse`: every forecast value with only its non-integer numbers at 9 significant digits and its `hash` keys left out, while strings and integers, such as a shown h:mm:ss, stay exact.
- So a difference can hide only in non-integer forecast numbers beyond the 9th significant digit, a forecast's own hash, or the carried MAC that seals them.

**Why it is sound.**
- The forecast is a projection carried for the app. `docMac` does not cover it: `canonical` includes `docMac`, and `canonical` is equal on every step.
- A 1-ULP change that reached a prescription, a safety state or the canonical record would show in `answerSans`, `storedSans` or `canonical`, and the step would be DIVERGED.
- p01 shows that 1 ULP on every exp reaches nothing outside `runForecast` in all 184 steps.
- A rounding that flips (a shown second or an integer) is DIVERGED by `forecastCoarse`; p01 up:pow shows the classifier rejecting it.
- A wrong `carriedMac` cannot persist unseen: the next load refuses it (`openCarried` → CARRIED_INTEGRITY), and that changes the next step's code.

**Could it hide a real divergence?** Only one smaller than 1e-9 relative inside forecast numbers, which is immaterial to a range shown in seconds, or a bad `carriedMac` on a journey's last step. The latter is excluded here: the 57 IDENTICAL steps include sealed writes, the HMAC vectors pass, and p01 attributes all 127 EXPLAINED steps to `exp(-0.6)`.

**What is wrong with it is the documentation, not the rule.** README §5 still states that these values have no persistence path ("Não há caminho de persistência para eles"). The author found that they do: `carried.presentation.readings.runForecast`. The boundary rule also tolerates a differing seal (`carriedMac`), which §5 never named (QRE-FPV-02).

## Process-death tests

- **`_exit(137)` instead of `kill(SIGKILL)`.** Inside the hook, `_exit` ends the process synchronously: no user code runs after it, the kernel closes the descriptors, and the page cache is kept. For on-disk state it is the abrupt death the test means, and it is deterministic where an asynchronously delivered signal was not.
- **A (after rename, before the answer).**
  - The log shows the restart after an unexpected exit, and the `XCTFail("unreachable")` never ran.
  - The `.lock` was left behind (the `defer` never ran).
  - The new process reads OK at v2, and the retry with the same `clientRequestId` is `replayed`, at v2.
  - The anchor is written after the commit (`integration.mjs` `commit`), so here the anchor lagged the file by one version. The load accepts an anchor behind the file and refuses one ahead of it.
- **B (after the tmp file is synced, before the rename).**
  - The `.json.tmp` was left behind and is removed at start.
  - The record reads OK at v1, the earlier record, and the retry records anew (`replayed:false`, v2).
- **Limit (not a finding against the candidate).** These are process deaths, not power loss or an OS crash. On Apple platforms `fsync` does not flush the drive cache (`F_FULLFSYNC` does), so the tests say nothing about durability across power loss. That belongs to the app's persistence layer (NATIVE_OBLIGATIONS), not to this harness.

## Findings

| ID | Severity | Blocking | Reproduction | What closes it |
|---|---|---|---|---|
| **QRE-FPV-01** | Low | No | `p02-mutants.mjs <copy> --wide --only=V2,V3`: reading every F08 fact type at Infinity (not only erasure markers) survives the two new test files and all 10 boundary test files. `p03` (a) builds a state where it matters: a readiness declared with the clock ahead; the committed view is BLOCKED, the mutant would read 0 holds. The committed code is correct; only the "every other fact is read as of the clock" half of the claim is not pinned | One test: a non-erasure F08 fact dated ahead (a readiness) is still read as of the clock (BLOCKED). It goes in the next line that touches `CoachingCore`; adding it now would change the frozen bytes. Not a freeze condition |
| **QRE-FPV-02** | Low | No | README §5 / RFC-NUMERIC-1 says that libm differences have no persistence path. In the boundary they do: `carried.presentation.readings.runForecast`, sealed by `carriedMac`. The boundary classifier (final-driver.js, BoundaryTests.swift) accepts a different `stored` and `carriedMac` under five equalities that §5 does not state | **C-FPV-1:** the final report and the freeze record state the boundary EXPLAINED_LIBM rule as adopted (the five equalities above, the `carriedMac` tolerance, `LIBM_CANDIDATE` resolved by the final-driver replay), and correct §5's no-persistence sentence. Documentary only |
| **QRE-FPV-03** | Info | No | The classifier does not require that a forecast actually differ: a step whose only difference was `carriedMac` would also be EXPLAINED_LIBM. Mitigated as above (the next load refuses a bad seal; HMAC 40/40; p01 attributes all 127 steps to `exp(-0.6)`). Nothing observed | Nothing for this freeze. The freeze record may cite p01 (the device set reproduced from the libm difference alone) as the attribution |
| **QRE-FPV-04** | Low | No | Provenance: the device runs are stamped 15:14–15:37 and `503945a` is stamped 15:26, so most device logs predate the commit. The JS bytes are bound (the boundary log's bundle SHA = my relink of `503945a`), and the fixtures' inputs are bound indirectly (p01 reproduces the exact id set from the committed `final.json`). The Swift host and test sources of the device builds are bound to `503945a` by no recorded hash, and only the boundary log prints the bundle SHA. One concrete instance: when this review was written, the author's worktree held an uncommitted `BoundaryTests.swift` change to `testPhaseLockedDevice` (modified 15:32), and `locked.log` (passed 15:37) came from that version, not from `503945a` | **C-FPV-2:** the final report states that the device builds were made from a tree whose `audits/v1-aif-p0-jsc-2026-11-17/ios` and `CoachingCore` equal `503945a` (for example `git diff 503945a -- <those paths>` empty at build time), or re-runs the boundary suite on the committed tree. The locked-device evidence is either attributed to the committed harness change that produced it (harness only, no `CoachingCore` byte), or not claimed for `503945a`. Documentary only, unless the statement cannot be made |

No finding blocks. None is a reproduced material defect in safety, integrity, an essential journey, or the prescription/safety/canonical record.

## Disclosure

- I did not run JavaScriptCore myself (no `swift test`, no device). My JSC conclusions rest on the author's raw logs, cross-checked by p01's independent emulation.
- p01 swaps in libm values for the exp/log/pow calls only. It cannot model a JSC difference in the `**` operator. The device's own `testLibmBits` reports pow 0 differ.
