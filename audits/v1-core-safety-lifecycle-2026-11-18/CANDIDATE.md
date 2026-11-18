# Core Safety & Lifecycle Closure: the candidate under review

**Mission:** Founder, 2026-11-18 (RepMile, CoachingCore V1). Chief: Opus 5.5, effort high, on Windows.
**Line:** branch `claude/v1-core-safety-lifecycle`, worktree `.claude/worktrees/v1-core-safety-lifecycle`, from `origin/claude/v1-aif-p0-jsc` @ `16577b6` (the P0 device report). Nothing is pushed or merged.
**Candidate:** commit `0b8e45a` (reproductions on `7e03f84`).
**Scope:** synthetic data only. No HealthKit, no SwiftUI, no Figma, no backend, no new sporting behavior, Pace Revision stays off, and the AM/PM change is not implemented.

## 1. What changed, by finding

| Finding | Reproduced on `16577b6` | Cause | Change | Files |
|---|---|---|---|---|
| **QRE-AIF-01** (P0): after the R7B0 records' `review_by` (2027-04-30, UTC day), a warning sign gives `UNSUPPORTED` | yes. The same sign is `CLINICAL_HUMAN_REQUIRED` on 04-29/04-30 and `UNSUPPORTED` on 05-01 (`repro/repro-p0.mjs`) | `r6-adaptation.mjs` checks the repertoire's validity (expiry is one cause) **before** input validation and the clinical screen | **New composed entry `src/v1-safety-index.mjs`** (`V1X-SAFETY-LIFECYCLE-1`, engine id `V1_CORE_ENGINE`). For a review only, and only when the repertoire is refused **solely** because its records' dates have passed (the same records enable it once the dates are set aside), the review is read again with the dates set aside. **Only** `CLINICAL_HUMAN_REQUIRED` with no proposal is taken from that reading; every other result is discarded and the refusal stands. Each answer given while expired carries `authorityExpiry`. Missing, altered or vetoed records, a caller's own repertoire, and every new plan behave as before. This is the precedence `v1-strength-index.mjs` already gives a plan built under other strength rules | `src/v1-safety-index.mjs` |
| **QRE-AIF-02** (P0, L-APP-06): restart identity | yes, and **wider than reported**: after a restart, **any** review (even one with no report) re-binds every plan A row to the plan B session with the same id (planned hash replaced, `dateShift −21`). Through the V1CIB custody, every review after a restart is refused (`ENGINE_CONTRACT_VIOLATION`), not only the first report; plan B's week 0 was credited with plan A's executions (`repro/repro-restart-rebind.mjs`) | session ids are `w<w>-<sport>-d<day>` in every plan; identity is `session:<id>` without a plan; `bindObservations` binds every carried row to the current plan by bare id | **(1)** A plan made by a record restart gets a session namespace, `r<10 hex>`, the hash of the updated intake and the restart's decision instant (UTC). It is stored as `program.sessionNamespace`, and every week built for it (then or by a later review) prefixes its ids (`r49e6ce41a0.w0-run-d1`). Callers cannot set it: it is a module symbol checked by regex. Plans that are not restarts have none, and their ids are byte-identical. **(2)** In a plan with a namespace, a carried row already bound to a session id outside that namespace is carried exactly as recorded and never re-bound | `src/r6-program.mjs`, `src/r6-index.mjs`, `src/r6-adaptation.mjs` (`bindObservations`) |
| **E-1** (P1, SSCTR L5): a device re-sync erases the athlete's effort and recovery | yes: `recovery ADVERSE→UNKNOWN`, `rpe 8→null`, `adverseSessions 1→0` (`repro/repro-e1.mjs`) | a correction retires the whole merged row; the merged row keeps one value per field and no record of who said it | **As-if invariant** in `normalizeObservations`. A merge records each report's own part (`provenance.parts`, by event id). A correction replaces **only** the corrected report's part, and the row it makes is the correction merged again with the parts still in force, under the existing merge rules: the row the corrected reports would have made from the start. A correction that disagrees physically, or in response, with a report in force flags a conflict (`CORRECTION_CONFLICTS_WITH_A_REPORT_IN_FORCE`), never resolved by arrival order. A merged row without parts (recorded before this line) is corrected as before | `src/r6-provenance.mjs` |
| **QRE-RWS-F-01** (P1): conflicting voices contaminate comparability facts | the contamination itself was measured by QRE-RWS-F-01 | the merge keeps one value per field | Closure **(a)** of `E01_PATCH_CLOSURE.md` §4.1 (disjoint fields per author), as an executable ingest guard `src/boundary/report-voices.mjs`: `checkReportVoice('DEVICE'|'ATHLETE', report)` refuses the four mixed forms (K1, K4, K5, MANUAL with an activity id) and an athlete report that carries `gpsQuality`/`measurement`. With disjoint voices, HEAT, walk breaks and POOR GPS survive the merge and the re-sync. **Open:** the field in which the athlete states the surface apart from the device's `measurement` does not exist; it was not invented | `src/boundary/report-voices.mjs` |
| **C-3** (P2): locale-dependent order | yes: `anchorConfigurationHash` differs between da/nb/cs collators | `localeCompare` at 6 sites in the V1 graph | code-unit order at those 6 sites (`r5-contract:14`, `r5-learning` ×3, `r5-schedule:26`, `r6-program:960`). `r4-candidates` and `semantics.mjs` are outside the V1 graph (P0 build manifest) and are untouched | 4 files |
| **QRE-P0-03** (P2): engine error text in an answer | `r6-adaptation:695` puts `e.message` in the `reason` the app keeps in `decisions[]` | V8 and JSC word messages differently | the reason names the error class (`Malformed review facts (TypeError): …`); `errors:['malformed:<class>']` unchanged | `src/r6-adaptation.mjs` |
| **EXPLAINED_LIBM** (P2): Race Forecast | (device) | 1-ULP `exp` differences between V8 and JSC | **Policy A, no code change: RFC-NUMERIC-1.** Outside `runForecast` nothing may differ. Inside it, every status, text, boolean and integer (every shown value is an integer of seconds) is identical; only non-integer numbers may differ, by ≤ 1e-12 relative. `runForecast.hash` and `runForecast.inputDigest` are runtime-local: never persisted, compared across runtimes or used as identity. Proven on Node by running journeys with `Math.exp/log/pow` each moved 1 ULP up and down: persisted state is byte-identical at every step (`test/v1core-forecast-numeric.test.mjs`) | test only |

## 2. Evidence (Node 24, Windows)

- **RED → GREEN:** every new test was run against the base engine (a `git archive` of `16577b6` in a scratch dir). AIF-02: 9/10 fail on the base. AIF-01: 5/9 fail with the old entry; the 4 controls pass on both. E-1: 16/17 fail on the base. C-3: the graph scan and the cross-collator anchor hash fail on the base.
- **New tests:** `test/v1core-{restart,expiry,e1,voices,locale,forecast-numeric}.test.mjs`. On the candidate, all pass.
- **Preservation.** P0's `lab/oracle.mjs`, rerun on this line, regenerates the J5 (5 answers) and P16 (33 steps, 95-row record, restorations) oracles **byte-identical**: `git diff` is empty. That covers the facade bundle's journeys under the amended engine (`v1-strength-index.mjs`). `lab/focal-oracle.mjs`: every engine result identical; only its collation section changes, because `localeCompare` is now called 0 times (62 pairs → 0). The Swift `FocalTests` expectation must change with it (Mac package).
- **Full suite:** base `16577b6` 1603 tests, 1601 pass, 2 fail. Candidate: see `REGRESSION.md` (recorded after this run). Failures by design are listed there with their cause.

## 3. Failures by design (historical tests that pin a state this line changes; not edited)

1. `V1RC COACHINGCORE-V1-FREEZE-1 is preserved…` and `I10, V6: every file the two earlier freezes bind…`: fail on the base too (earlier amendments).
2. `the four earlier freezes are preserved on this line, and the one amended file is the authorized bytes and diff` (V1STR): this line amends files those freezes bind.
3. `QRE-RFC-A-03 closed: after a restart, a row of the previous plan is no execution of the new plan's session of the same id` (`v1rfc-cycle.test.mjs:107`): its first assertion is the defect itself ("the ids of the new plan's sessions are ids of the old plan's"), and line 114 asserts "the layer below hands an old execution under the new id". Its invariant (the forecast credits nothing, `MISSING_REPORT`) is what this line makes true at the engine level.
4. `E-01 from stored records … after a restart …` (`v1rws-e01.test.mjs:217`): it asserts `wholeRow === REPORT_NOT_CARRIED`, the RWS reading of a corrected row that no longer carries the athlete's report. With E-1 fixed, the row carries every report in force, so the reading is `null` and **the run is read for pace evidence again, as if no correction had happened**. Sporting impact for the SSCTR: it reduces the L1-f cost (runs kept out of pace evidence forever after a device re-sync).

## 4. Questions per judge

**SSCTR:**
- (a) AIF-01. After expiry: only the clinical route answers; a readiness declaration does not release a standing hold (the reference continuation keeps the dependency); no new plan. Integrity failures (records missing or altered) stay `UNSUPPORTED` even with a sign. Is this the authorized safety behavior without widening clinical scope?
- (b) AIF-02. Plan B's week evidence no longer counts plan A's executions (the base counted them). Plan A rows stay readable by the date-based continuity readers, with plan A's own context. A late plan A report is recorded `UNPLANNED` and credited to nothing. Any sporting reader that should treat earlier-plan rows differently?
- (c) E-1. The as-if row. The conflict path. The RWS consequence (§3.4).
- (d) RFC-NUMERIC-1.

**QRE:** identity, continuity, persistence, determinism, regressions, the failures by design, test strength (including whether any assertion is weaker than its label), performance.

**Security/PCG:**
- `v1-safety-index` precedence (no bypass of validation; caller-supplied authority excluded);
- the namespace not settable by a caller;
- `report-voices` as an ingest boundary;
- `provenance.parts`: athlete health data now kept per report inside a merged row (retention and erasure, G07);
- the error-text removal;
- what remains for D1 (the custody threat model on the device) and is **not** decided here.

## 5. Known limits

- The namespace applies to plans made **from now on** by restart. A plan restarted under an earlier engine has none and collides as before; the envelope engine id changes (`V1_CORE_ENGINE`), so such an envelope is refused on restore (explicit migration).
- A correction of a plan A report after a restart is recorded with `UNPLANNED` context (its superseded original keeps plan A's).
- E-1 holds for merges recorded on this line; older merged rows are corrected as before.
- Nothing here is validated on JavaScriptCore. Serialization, hashing, persistence and ordering changes need the Mac focal run (`mac/`).
