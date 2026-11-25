# FINAL_REPORT — RepMile V1 test-suite sanitization and regression closure

2026-11-25 · Mac mini M4 (macOS 27.0, Node v24.19.0) · all athletes and records synthetic.

**Line.** Branch `claude/v1-test-suite-sanitization`, created from `90452b8` (`claude/v1-hr5-runna-parity`, the published physical commit) in its own worktree. The baselines were confirmed in git before the work began:

| Commit | What it is |
|---|---|
| `96a8ccc` | RC-1 |
| `a7e2e24` | the final physical freeze |
| `4850560` | amendment 1 |
| `465e7c8` | the HR5R correction |

The A, B, C and UI worktrees were not touched. Nothing was merged, reset or force-pushed.

## Result

| Criterion | Result |
|---|---|
| ALL_FAILURES_ACCOUNTED_FOR | **YES**: 51 reproduced (= the reported 51), each mapped individually ([FAILURE_INVENTORY.md](FAILURE_INVENTORY.md)) |
| HISTORICAL_TESTS_PRESERVED | **YES**: no historical test edited or deleted (bytes pinned); 53/53 green at the commit each belongs to |
| ACTIVE_TEST_SUITE_GREEN | **YES**: `npm test` **1952 / 1952 / 0**; the 53 historical tests fail at their pinned assertion, as declared |
| NO_ACTIVE_SECURITY_REGRESSION | **YES**: no runtime byte changed; the safety points are reproduced through the integration API |
| NO_ACTIVE_CUSTODY_REGRESSION | **YES**: custody, versioning, idempotency, rollback, integrity and other-athlete isolation pass through the boundary |
| NO_SPORTS_REGRESSION | **YES**: no sporting rule changed. Every sporting effect of the superseding changes traces to a recorded SSCTR decision (SSCTR R1/R2), and the O-1 lineage dose dump on HEAD is byte-identical to the authorized one |
| HR5_AMENDMENT_INTEGRITY_PRESERVED | **YES**: AMENDMENT-2's 91 bound files are byte-identical, its bundle `d087ad51` is as recorded, and its record plus the two earlier ones are at their commits. v1hr5 33/33 and v1hr5r pass |
| INDEPENDENT_REVIEW_PASSED | **YES**: QRE/Security **READY** (R3) after two correction cycles; SSCTR **ACCEPT** (R2); no BLOCKER, HIGH or MEDIUM open; four residuals accepted and named |
| READY_FOR_ABC_FOUNDATION | **YES**: a green, trustworthy active suite on an unchanged runtime; no known engine or sync defect that would change CoachingHost, HealthKit or the SwiftUI contract (§7). This holds in synthetic mode. |
| REAL_ATHLETE_READY | **NO** (unchanged; this mission does not touch what blocks it, §7) |

## 1. Numbers

| | Count |
|---|---|
| Failures at the start (`90452b8`) | **51** of 1985 real tests. node reported 1993/1942/51, which counts 8 helper modules as passing tests. |
| Active tests at the end | **1952**, of which **1952 pass** and **0 fail** |
| Moved, legitimately, to historical verification | **53**: the 51, plus H52 and H53. These two pass on `90452b8`, and this mission's test files make them fail by design. |
| Real defects of the current runtime found | **0**. Each of the 22 "pinned defect" tests (category B) pins a defect that a later versioned amendment had already corrected; this was reproduced on the current runtime and through the integration API. |
| Problems actually corrected by this mission | **1 structural root cause** of the 51 (RC-1, the line-local record chain), ended by the class-based integrity test and the historical suite. **1 coverage gap** (H26's still-valid assertions, QRE-SAN-02). **4 weaker-than-claimed tests** of its own (QRE-SAN-06). **3 defects in its own instrumentation** (REGRESSION_REPORT.md §5). |
| Tests added | 20, all passing: boundary safety 13, runtime integrity 5, H26 successor 1, historical-layer record 1. Final run: `evidence/final-active.txt`, on `2a865f8`. |

**Versus the 51 at the start.** All 51 are still executable, and each is green in its own context. None is in the active suite's verdict as a failure; each is accounted as historical, failing exactly where it is declared to fail. Every test that passed on `90452b8` still passes, except H52 and H53, which became historical by design.

## 2. Classification ([ROOT_CAUSE_CLASSIFICATION.md](ROOT_CAUSE_CLASSIFICATION.md), [RESOLUTION_MATRIX.md](RESOLUTION_MATRIX.md))

**51 = 28 A + 23 B; 0 C, 0 D, 0 E.**

**Category A, 28 tests.** These verify a record or a contract of an earlier line that was legitimately replaced.

| Root cause | Tests | What replaced them |
|---|---|---|
| RC-1 | 15 line-local freeze/record tests | every later amendment changes files they bind |
| RC-5 | 10 | the conflict-voice model (NCC, O-1, C-O1-2; SSCTR decisions A and C) |
| RC-6 | H27 | the reviewed safety-excess limit |
| RC-7 | H10 | FIVE-ZONE-AMENDMENT-2's composed entry |
| RC-2 | H40 | the lifecycle and O-1 order behaviour |

**Category B, 23 tests.** These pinned a defect, or the compensation for one, as their line's behaviour.

| Root cause | Tests | The fix that closed it |
|---|---|---|
| RC-2 | 19 | E-1 and QRE-AIF-02, fixed in `0b8e45a` |
| RC-3 | 2 | C-F01-1 r2 |
| RC-4 | 1 | SEC-R2-03/-04 |
| RC-6 | H26 | QRE-INT-02 |

**Provenance.** Each failure was replayed at all 73 first-parent commits that touch CoachingCore. Each passes at a commit of its own line and first fails at a named, audited amendment ([evidence/provenance-matrix.json](evidence/provenance-matrix.json)). On HEAD, each of the 51 fails at the same assertion line as on `90452b8`.

## 3. Safety and integrity first (Phase 3)

The current runtime was driven through `createIntegration` + api.mjs, the app's route (`test/v1san-boundary-safety.test.mjs`, 13/13):

- **HARD GATE E-1**: a re-sync no longer erases the athlete's answers. With the athlete first, the device first, or late, the row keeps `ADVERSE`/`HARDER`, the adverse count stays 1, there is one row, and completion is unchanged. A targeted re-introduction of E-1 turns those tests red at that assertion, and it also makes 18 historical tests pass again, which fails `npm test`. Scope: **closed at the Core and at the boundary on synthetic inputs; open for real athletes under C-C5 (a real HealthKit re-sync).**
- **Import against manual report**: one flagged row, both voices kept, never COMPLETED, never dose twice.
- **Duplicates and late corrections**: no write, no engine call, calibration unchanged.
- **Warning signs**: a symptom stop survives an import and a re-sync, and the screen is still asked.
- **Another athlete**, enrolled in the same custody: refused, and the record stays byte-identical. After a restart, no old row credits a session of the new plan.
- **Custody**: a stale version is refused, a request id replays without writing, and rollback and tamper are detected.
- **QRE-RWS-F-01** (still open in the engine) is **not reachable through the boundary**: `REPORT_VOICE_MIXED`.

## 4. Historical tests (Phase 4, [HISTORICAL_TEST_POLICY.md](HISTORICAL_TEST_POLICY.md))

- `npm test`: one unfiltered run, accounted from junit and checked against node's own counters. Active tests must pass. Historical tests must fail at their pinned line.
- `npm run test:historical`: each historical test at its own commit, in a temporary worktree. **53/53.**
- `npm run test:all-raw`: the former `npm test`.

Guarding the layers:

- **The runtime** is pinned by `v1san-runtime-integrity` to the bytes AMENDMENT-2 binds. A runtime change still requires a versioned amendment, but test-only work no longer breaks a record. That is what made the chain reach 51, and it now stops.
- **The historical layer** is bound by **REPMILE-COACHINGCORE-V1-TEST-SUITE-SANITIZATION-2** (`HISTORICAL_LAYER_RECORD.json`, commit `2a865f8`), a test-infrastructure record and not a freeze. It binds 33 files: the manifest, the runners, `package.json`, the record test, the 16 successor files, and their helpers, harness and verifier scripts. Git proves it was written once and never modified. The runner checks it before the suite and requires the record test to pass.
- **Residuals, stated** (policy §4.3): an active test outside the layer can be weakened by a passing commit; a `process.exit` part-way through a file truncates it; a commit can rewrite the guard itself; the written-once proof needs a full, unrewritten history (protect the branch).

Original freeze files, records and hashes: **untouched**. Every record under `CoachingCore/v1/` is byte-identical to `90452b8`.

## 5. Regression (Phase 6, [REGRESSION_REPORT.md](REGRESSION_REPORT.md))

| Check | Result |
|---|---|
| Active suite | 1952 / 1952 / 0 |
| Historical suite | 53/53 at their own commits |
| Raw suite | 2005 real tests: exactly the 53 historical tests fail |
| `TZ=UTC`, `TZ=Asia/Tokyo` | green |
| Wall clock past the R7B0 `review_by` (2027-06-13) | green |
| Integration, custody, security, run, strength and HR5 families | all pass |
| Verifiers | AMENDMENT-2's `--check` fails only on its "nothing else changed" step, naming only this line's test-infrastructure files; the integrity test proves every other check of it |
| Negative checks | 9 attacks on the new infrastructure, each detected |

**Not re-run:** JavaScriptCore, the iPhone and the HR5 physical tests. No runtime byte or bundle changed, so the V1HR5R physical evidence still describes this runtime.

## 6. Independent review (Phase 8, [INDEPENDENT_REVIEW.md](INDEPENDENT_REVIEW.md))

| Round | Reviewer | Verdict |
|---|---|---|
| R1 | QRE/Security | READY_WITH_CONDITIONS: 4 MEDIUM and 4 LOW findings, fixed |
| R1 | SSCTR | ACCEPT_WITH_CONDITIONS: 6 record conditions, all applied |
| R2 | SSCTR | **ACCEPT**: 6/6 MET |
| R2 | QRE | READY_WITH_CONDITIONS: QRE-SAN-10 (MEDIUM), 11 (LOW), 12 (NOTE); fixed |
| R3 | QRE | **READY**: 10 and 11 CLOSED; QRE-SAN-13 (LOW, shallow or rewritten history) accepted as a named residual |

The author approved none of their own fixes.

## 7. State for A + B + C (Phase 7)

1. **Does the active suite have an unresolved failure?** **No.** 1952/1952. The 53 historical tests fail only where declared, and each is green in its own version.
2. **Are there known engine defects that would affect CoachingHost?** **None found among the 51.** The open limits stay pinned by *passing* tests:
   - QRE-RWS-F-01: engine-level, refused at the boundary;
   - C-F01-2: the custody residual of an unmarked stale copy;
   - SSCTR-BC-03 (F6);
   - SSCTR-STR-A-04a (the hold rule's limitation).

   CoachingHost must keep the boundary's obligations: the channel is decided by the native entry point (SEC-CORE-03); one serial queue; the store and anchor contracts (N-3, N-4, N-5).
3. **Are there sync failures that would affect HealthKit?** **None in CoachingCore.** A re-sync is bound to the device's own report by activity. Duplicates are refused or deduplicated. A device report cannot state athlete facts. Future-dated or ASK-ed workouts are not recorded, and the answer says so. **Still open:** C-C5, a real HealthKit re-sync and synced week (never run natively), together with the I-2 and I-4 data obligations (a correction restates all its speaker says; an athlete edit never goes under a device id).
4. **Would any blocker change the contract SwiftUI consumes?** **No.** No runtime byte, API or stored format changed. The contract gaps already recorded stand as before: CHG-UI-1, CHG-UI-4, FND-HR5-01, FND-HR5-03.
5. **Are the HR5 amendments intact?** **Yes** (see the table).
6. **Is there a security risk that prevents development in synthetic mode?** **No.**
7. **What is still required before real athletes?** This list is unchanged by this mission, and taken from the final physical and HR5R reports:
   - SEC-FPV-01, -02 and -03;
   - G07 retention (Founder and legal), including whether HEALTH_SIGNALS governs the heart-rate profile;
   - D1 on the device, D2 backup, D3 minimum iOS;
   - the SEC-INT-05/-12 schema tests;
   - SSCTR-BC-01 and the C-BC-3/SSCTR-BC-05 copy;
   - HealthKit background delivery and a real synced week (C-C5);
   - log privacy;
   - the **R7-B0 renewal before 2027-04-30**;
   - a Security and privacy review of heart-rate data;
   - the HR5 locked-device and reinstall phases;
   - the clinical items SSCTR flags CLINICAL_HUMAN_REQUIRED (whether the warning-sign screen is enough after a symptom stop; the clinical part of O-SC-S2);
   - the funded-human revalidation of the SSCTR decisions (HQ-SSCTR-O1-02 and HQ-SSCTR-SC-01 proposed, not appended).

## 8. Publication

- **Branch** `claude/v1-test-suite-sanitization`, pushed to `origin`. The remote head is verified equal to the final commit (see the ledger entry).
- **Not merged** into A, B, C, `main` or any other branch.
- **MISSION_LEDGER.md**: one entry, insert-only.
- **Not changed:** CURRENT_MISSION.md, any freeze or record, and any runtime file.
