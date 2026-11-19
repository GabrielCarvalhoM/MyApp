# SSCTR review of the Normalization Consistency Closure (F1, F2, F3), R1 (2026-11-19)

**Decision: ACCEPT_WITH_CONDITIONS.** All three findings my role raised (C-SR2-2, -3, -4 in `audits/v1-core-sec-r2-2026-11-19/reviews/ssctr/SSCTR_SR2_R1.md`) are closed on their stated criteria. I reproduced each on FREEZE-4 and saw it fixed on the candidate. The fix changes no training rule. No recovered row is read as permission to raise load.

None of my conditions needs this line's correction cycle:
- One condition binds the closing record (C-NCC-2).
- One new finding is pre-existing and binds before real-athlete use. It needs a runtime change in the conflict-policy mission, not here (C-NCC-1 / SSCTR-NCC-01).
- One integration condition binds before real-athlete use. It needs no CoachingCore change (C-NCC-3).

| # | Question | Disposition | Blocks this candidate |
|---|---|---|---|
| 1 | F1: athlete's reports under late arrival, symptom stops, SB-1 | ACCEPTED. C-SR2-2 closed. "A real conflict flags the carried row and refuses the late report" is sound because it equals the monotone-clock outcome | no |
| 2 | F2: one activity, one execution; restart running 45 → 40 | ACCEPTED. The 5 min is the existing activity-conflict rule, now applied the same whoever holds the row. It is folded into C-SR2-5 | no |
| 3 | F3: CONFLICTED persists; a valid correction resolves it | ACCEPTED. C-SR2-3 closed. One pre-existing resolution path remains (SSCTR-NCC-01) | no |
| 4 | Lineage scenario 21 EASY: history reference = re-synced device measurement | ACCEPTED for the synthetic freeze. Calibration, the easy band and the next long run are unchanged. The weekly-review credit goes CONFLICTED → COMPLETED, which the record does not state (C-NCC-2). The path is SSCTR-NCC-01 | no |
| 5 | Missed effects; recovered evidence read as permission to increase load | None found in recovery, pause/return, readiness holds or strength. Run calibration moves in F2 (easy-run count 2 → 1, conservative). No recovered row raises load | no |

## 0. Reviewer, target, method

**Reviewer:** SSCTR (SSCTR-1.0.0 / SSCTR-CONST-1.0.0), model claude-opus-5-5. The Chief launched me as a fresh instance; this is not the instance that wrote SSCTR_SR2_R1/R2, although it reuses those probes.
- I wrote none of the change, its tests or its records. I did not read the QRE or Security reviews of this line, nor the other reviewers' scratch directories.
- Authority: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical only. No human review took place, I made no clinical judgment, and I delegated nothing.

**Literature access:** WebSearch and WebFetch are available as deferred tools; I did not load them.
- Every item here checks evidence admission against decided rules: QRE-R6-13/-14, C-Q08-1/-2, SB-1, SSCTR-CORE-B-01, C-SR2-1 and the RWS lineage items L1–L5.
- I make no empirical sporting claim, so I assign no evidence status and decide no dose, threshold or progression.
- For that reason I wrote no structured JSON record and did not run the skill's validator.

**Judged bytes.** Worktree `.claude/worktrees/v1-core-ncc`, HEAD `ef490bb`, clean.
- `git diff e704180 ef490bb -- CoachingCore/src` touches one file, `src/r6-provenance.mjs` (+26/−11): `partOf`, the sort into groups, the chain rule, `heldBefore`, and activity binding through parts and in-force rows.
- `CoachingCore/src` and `CoachingCore/test` have no diff between `07301f3` and `ef490bb`.
- The author's claim holds: no sporting rule, threshold, progression, periodization, calibration, Race Forecast, Pace Insights or Strength file is touched, and `v1-f08.mjs` is FREEZE-4's bytes.

| File | SHA-256 |
|---|---|
| `CoachingCore/src/r6-provenance.mjs` | `fc04b9e21ed5435bbe66fd0bf6bfe40972755b5dc8311a1dd00b7fcf84eddb19` (FREEZE-4: `d2439377…b3a`) |
| `CoachingCore/src/v1-f08.mjs` (unchanged) | `f1065bf1e8c29a4019cf5f8f1c72e9f50f38a11796bf126d39c52a6470e27d37` |
| `CoachingCore/test/v1core-ncc-normalization-consistency.test.mjs` | `43c13b99448878d48af138d64eed1381774746dff84a8d5a018849b2499962ca` |
| `CANDIDATE.md` | `b7717b7d1dc89c733a7283d130a8be800c4a0dd2cb31b85ba79aa19ee9ef443c` |
| `SUCCESSOR_LEDGER.json` | `878c1cb572bf977cdc2c7e8dcc255853a46f3da1c42934f8d13e2bbd78ddd701` |
| `evidence/dose-impact.mjs` | `2ef37847e348f7969215451d26b52cc91cb318aa0a52c375fc1f18ca0e44bd09` |
| `evidence/dose-e704180.json` | `0dfb8668b1ab22cd0b30fc08df83ffb0ebc81c585e3bfa6284038d29a4f7394d` |
| `evidence/dose-candidate.json` | `9c6d6b8c555d4f4d0928bcd15a5f7e40c36b955ec2ad492e241485317913770c` |

**Base.** The base is the read-only worktree `.claude/worktrees/v1-core-sec-r2` at `e704180`, which is clean. Its `r6-provenance.mjs` is `d2439377…b3a`.

**Commands** (Node v24.19.0, on `git archive` extracts of `ef490bb` and `e704180`):
- `node --test test/v1core-ncc-normalization-consistency.test.mjs` gives **21/21** on the candidate.
- `dose-impact.mjs` on both extracts reproduces `dose-e704180.json` and `dose-candidate.json` **byte for byte**.
- I did not run `npm run verify`, `verify-r*`, the freeze scripts or the full suite.

**Probes.** They are read-only, use synthetic athletes and ran on both trees. They are in `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/f7ba5817-8741-42b6-9733-0c42b02ab685/scratchpad/ssctr-ncc-r1-5e81/probes/`:
- `f1.mjs`, `f2.mjs`, `f3.mjs` and `f3b.mjs` are my SR2 R1 reproductions, unchanged.
- `sb1inv.mjs` and `sb1mono.mjs` test SB-1 after a readiness declaration. They cover the f1 shape and the inverse (a late athlete stop against a carried device row), with stops of 30 and 0 minutes, under late and monotone clocks.
- `inv-*.mjs` tests the inverse F1 shape through the composed engine, cited and uncited, to show symptom-screen visibility.
- `s21-*.mjs` and `s21x-*.mjs` cover lineage scenario 21 and its variants, EASY and LONG, through the frozen matrix harness. They read the ledger, weekly evidence, the history reference, the warning-sign screen, the easy band, the long run ahead, and weeks w+1/w+2.
- `f2row.mjs` tests F2 three ways: the athlete's row merged, the watch only, and the watch first.
- `f3resync.mjs` runs the F3 dispute followed by a watch re-sync, or by an athlete re-correction.
- `skew-*.mjs` tests a symptom-stop correction dated before its original's report.
- `dose-x.mjs` and `dose-f2cal.mjs` are `dose-impact.mjs` plus the restart bound, class, pause, and the calibration, forecast, pace and strength hashes.

## 1. F1: ACCEPTED (C-SR2-2 closed)

**The athlete's own reports are kept under late arrival.**
- In `f1.mjs`, a carried correction C ("stopped, SYMPTOM", recovery ADVERSE) meets a late watch sync dated before C:
  - On FREEZE-4, C is refused and leaves the record. The record holds no stop.
  - On the candidate, C stays in force, flagged, and the sync is refused. The result is byte-equal to the control where the sync arrives after C.
- The author's differential reports 0 rows in force lost across six runs. The F1 cases break down as: 10 rows restored in force, 28 restored and flagged conflicted, and 10 replaced by a valid correction in the same review. I checked the 10 restored in force: each is a carried row or correction whose own amount was already admitted, so none is new evidence.

**"A real conflict flags the carried row and refuses the late report" is sound for sport.**
- Neither voice of a disputed amount reaches dose, gating or calibration. That is QRE-R6-14, unchanged.
- The outcome no longer depends on the order in which reports reach the server. This is the stability property I asked for in C-SR2-2.
- The F1 journey shows the restart unchanged: bound 40, EASY_LOW, 25+15 / 20+20 / 27+27, pause RUN 4 / STRENGTH 5. Calibration, forecast, pace and strength-exposure hashes are identical on both trees.

**Symptom-stop visibility: kept in every order I tried.**
- **F1 shape:** the stop row is now in the ledger, so the run-format screen (`rowStops`, SSCTR-CORE-B-01) reads it directly. On FREEZE-4 it was gone.
- **Inverse shape** (`inv-*.mjs`): the device row is carried and a late athlete stop is dated earlier.
  - The candidate refuses the stop as the conflict and flags the device row. FREEZE-4 instead evicted the device row.
  - The warning-sign screen is still `REQUIRED` for that session, cited (TIME format) or uncited. It hears the refused report through the run-format record (`facts.stops`).
  - So visibility of a refused athlete stop now depends on that record travelling with the ledger. See C-NCC-3.

**SB-1 after a readiness declaration** (`sb1inv.mjs`, `sb1mono.mjs`):

| Shape | FREEZE-4 | Candidate | Monotone clock (both trees) |
|---|---|---|---|
| f1, stop 30 min | asked | asked | asked |
| inverse, stop 30 min | asked | asked | — |
| inverse, stop 0 min | **not asked** (stop row only) | asked (device "done" in force, flagged) | — |
| f1, stop 0 min | asked (only because C was lost and the device "done" remained) | **not asked** | **not asked** |

- The candidate equals the monotone outcome in every row.
- The one row that turns from asked to not asked is the f1 shape with a zero-minute symptom stop. There the only voice in force says no training took place, and SB-1 only hears "a session took place after the declaration". FREEZE-4 asked there only by losing the athlete's stop.
- The stop itself is now in the record and raised by the warning-sign screen. Whether a new symptom stop after a declaration should also re-open the readiness question is a scope question for SB-1, not something F1 changes (O-NCC-S1, §6).

## 2. F2: ACCEPTED; the 5 minutes is folded into C-SR2-5

**One activity, one execution: verified.**
- `f2.mjs` (journey B): on FREEZE-4 the borrowing correction of d3 is admitted, d3 becomes `WEARABLE_FULL` with HK-D1, and d1 keeps HK-D1 as a part.
- On the candidate it is refused (`ACTIVITY_BOUND_TO_TWO_SESSIONS`): d3 keeps its 40-min manual report, no manual report is upgraded, and run-history facts go from 4 to 3.

**The author's consistency claim holds** (`f2row.mjs`). The candidate gives the same outcome in all three shapes, and FREEZE-4 already gave it in two:

| d1 reported as | FREEZE-4 | Candidate |
|---|---|---|
| athlete row, watch merged | borrow admitted, d1 clean | borrow refused, d1 flagged |
| watch only | borrow refused, d1 flagged | same |
| watch first, then athlete | borrow refused, d1 flagged | same |

**Dose** (`dose-x.mjs`):

| | Bound (min/wk) | Week 0 running (EASY + LONG) | Walks | Strength |
|---|---|---|---|---|
| FREEZE-4 | 49 | 25 + 20 | 20 + 20 | 27 + 27 |
| Candidate | 40 | 25 + 15 | 20 + 20 | 27 + 27 |

- Both trees: EASY_LOW, 1 day/wk, pause RUN 4 / STRENGTH 5, strength exposure hash identical.
- The weekly review in the same week and the next is identical on both trees.
- Run calibration changes in one field: the field-assessment progress `easyRuns.count` goes 2 → 1. No pace band, estimate, forecast or Pace Insights output changes. CANDIDATE §C does not state this (C-NCC-2).

**Sporting reading:**
- FREEZE-4's 49 counted a borrowed-evidence row (d3 at 35 min with d1's watch). That is not a trustworthy measure of executed running.
- The candidate's 40 under-counts by one corroborated run (d1, 40 min, athlete and watch agreeing). At an EASY_LOW restart this is a small, conservative difference with no safety cost. Its cost is a slightly slower return, below what the athlete actually ran.
- The remaining question is a policy one: a refused report should perhaps not be able to flag an execution whose own voices agree. That is exactly C-SR2-5, and this shape is added to its scope (§6). It does not block.

## 3. F3: ACCEPTED (C-SR2-3 closed); one pre-existing resolution path remains (SSCTR-NCC-01)

**CONFLICTED persists.**
- `f3.mjs` and `f3b.mjs`: a later review with nothing new reads d1 `CONFLICTED` (conflicted 1, completed 0) on the candidate. FREEZE-4 read `PARTIAL` (disputed 20 min, ADVERSE) or `COMPLETED` (disputed 60 min).
- The dose journey matches this.

**A dispute held inside a row is no longer resolved by the other voice** (`f3resync.mjs`). After the athlete disputes their own part against the watch, a watch re-sync of the same measurement:
- leaves d1 `CONFLICTED` on the candidate, with both voices kept as parts;
- turned d1 `COMPLETED` (40 min, recovery UNKNOWN) on FREEZE-4.

An athlete re-correction that still disagrees with the watch also stays CONFLICTED on the candidate. This is right: no voice gave way.

**Gating consequences of a valid correction resolving a dispute.**
- Within the shape F3 covers, I find none that is unsound. The rule remains "a correction resolves a conflict on its identity", now read from the quarantine held before the correction, never from its own flag.
- The action in these journeys is unchanged (`MODIFY/GATED_NEXT_STEP`).

**SSCTR-NCC-01 (new, pre-existing): in a direct conflict, the kept speaker's own correction resolves the dispute the refused speaker raised.**
- **Shape:** lineage scenario 21 and its variants (`s21x-*.mjs`). The device reports the whole run, the athlete then reports "stopped at 30 min, SYMPTOM", and the device re-syncs its own report.
- **What happens:**
  - The athlete's stop is refused as the conflict, so it is not a part of any row, and the device row is flagged.
  - The re-sync is a valid correction of the device row. It resolves the conflict, so the session reads `COMPLETED` with the device's whole amount.
  - The history reference is the whole distance (11 km EASY, 16 km LONG). On LONG, week w+2 regains the QUALITY session (34 min) that the unresolved conflict withheld (`EASY:70,QUALITY:34,EASY:65,LONG:100` versus `EASY:70,EASY:65,EASY:65,LONG:100`).
- **What holds:**
  - The warning-sign screen stays `REQUIRED` until it is answered.
  - The run stays withheld from pace readers (`REPORT_NOT_CARRIED`), and the easy band equals the control's.
  - The next long run is identical to the control's in both families: 100 min, LONG 16 km.
  - So no load is raised above what a completed run would earn. But a disputed amount earns completion credit and a progression step, while the athlete said they stopped a third of the way in for a symptom.
- **Order dependence:** when the athlete speaks first (`S21b`), the device is refused, its re-sync is an invalid chain, and the session stays CONFLICTED with no history reference. Who resolves a dispute therefore depends on who spoke first.
- **Not introduced here:**
  - FREEZE-4 gives the same result on LONG, and on EASY whenever the two reports have distinct clocks (`S21mono`, identical on both trees).
  - The candidate only removes the EASY tie-break accident by which FREEZE-4 lost the device report.
  - The dispute held inside a row (the F3 shape) is already protected, as shown above.
- **Binding:** before real-athlete weekly-review gating and run-history use. Not before the synthetic freeze. It needs a runtime change, owned by the conflict-policy mission (C-NCC-1).

## 4. Lineage scenario 21 EASY: ACCEPTED for the synthetic freeze

`s21x-*.mjs`, EASY, base and candidate:

| | Ledger | Weekly evidence | History reference | Pace word | Easy band | Screen | Long run ahead |
|---|---|---|---|---|---|---|---|
| FREEZE-4 | `app-stop!`; `dev-x` lost, `dev-x-v2` invalid chain | CONFLICTED | none | REPORT_NOT_CARRIED | AVAILABLE 345–420 | REQUIRED | 100 min TIME |
| Candidate | `dev-x-v2`, `dev-x` replaced; `app-stop` refused | **COMPLETED** | **11 km** | REPORT_NOT_CARRIED | AVAILABLE 345–420 | REQUIRED | 100 min TIME |

- **Run history.** The reference becomes the device's whole measurement, the same as LONG and the monotone EASY case. That is consistent, and it never exceeds what a completed run gives (L3/L4 are not raised; the control is 11 km). It is still a disputed amount, through SSCTR-NCC-01.
- **Calibration.** It is unchanged. The run is withheld from pace readers, the easy band is the control's, and matrix assertion 4 passes in the successor.
- **The next long run.** It is unchanged: 100 min on EASY, and 100 min / 16 km on LONG, identical to the control and to the unresolved case.
- **What the record omits.** The session's weekly evidence goes CONFLICTED → COMPLETED. Neither the ledger's `sporting` field nor CANDIDATE §C says so (C-NCC-2).

## 5. Missed effects and load

- **Recovery and response.** A refused athlete report's ADVERSE recovery stays out of the ledger, as with a monotone clock. The session is CONFLICTED and earns no credit, except through SSCTR-NCC-01.
- **Pause and return.** The pause is identical in every dose journey (RUN 4 / STRENGTH 5). The direct conflicts the fix produces are not counted as `occurred`, as before. This errs toward a longer pause, never a shorter one.
- **Readiness holds.** F08 facts are filtered out before the normalizer, and `v1-f08.mjs` is unchanged. A refused or recovered report cannot set or release a hold.
- **Strength.** Strength exposure and week-0 strength (27/27) are identical in every journey. The tests cover strength under F1 and F2.
- **Run evidence readers.**
  - F2 removes borrowed wearable trust and drops one corroborated run, so `easyRuns.count` goes 2 → 1.
  - F1 and F3 change no calibration, forecast or Pace Insights hash in the journeys.
- **Recovered evidence and load.** The restored rows carry their own amounts, as already admitted, or are flagged and out of dose. No journey raises a bound, a class, a session or a long run above FREEZE-4 or the control.
- **The new chain rule** (a correction dated before its original's availability is refused). In `skew-*.mjs` it keeps a refusal that FREEZE-4 already made, via the sort, in both one- and two-review shapes. The integration consequence is under C-NCC-3.
- **O-NCC-1 and O-NCC-2** (the author's §F). These are FLAGGED_LATER and REFUSED_IDENTITY: weekly-review evidence only, erring low. They are carried with C-SR2-5 / O-4, non-binding.
- **Learning model** (the author's observation: carried corrections are refused on each update). It is unchanged here. I did not verify its effect on learned long-run maintenance. It is routed to the R7-C/G02 owner as an observation.

## 6. Conditions, findings and observations

| Id | What | Binding | Runtime change | Owner | Closes when |
|---|---|---|---|---|---|
| C-NCC-1 (SSCTR-NCC-01) | In a direct conflict, a correction by the kept speaker (a device re-sync of the same measurement) resolves the dispute that the refused speaker's report raised (the athlete's symptom stop). The disputed amount earns COMPLETED, becomes the history reference and, on LONG, unlocks the w+2 QUALITY session. Order-dependent | **Before real-athlete weekly-review gating and run-history use.** Not for the synthetic freeze (FREEZE-5) | Yes, in the conflict-policy mission (with C-SR2-5), not this cycle | Core with QRE and Security; Product/UX for visibility; then SSCTR | A dispute raised by a refused report is resolved only by that speaker or by an explicit athlete answer, or the refused voice is kept as a part of the flagged row (as the F3 shape already does). Scenario 21 and S21b agree, and both stay CONFLICTED until then |
| C-NCC-2 | Correct the records. (a) The ledger's `sporting` field and CANDIDATE §C: on scenario 21 EASY the weekly evidence also goes CONFLICTED → COMPLETED, and the new history reference is the device amount the athlete's symptom stop disputes; link SSCTR-NCC-01. (b) §C, journey F2: run calibration `easyRuns.count` goes 2 → 1, and the bound goes 49 → 40 | Binds the closing record only | No | Chief with the candidate author | The closing record states it |
| C-NCC-3 | Integration: (a) a refused athlete stop is visible to the warning-sign screen only through the run-format record, so the client must persist that record and pass it to every review and restart alongside the ledger; (b) `reportedAt` and `correctedAt` must come from one clock, because a skewed correction of a stop is refused and the earlier amount keeps its credit | **Before real-athlete use** | No CoachingCore change | Integration (Core with QRE and Security) | The integration contract states both, with a test |
| C-SR2-5 (extended) | Adds the F2 shape: a refused report that borrows an activity flags an execution whose own voices agree (d1), taking it out of dose (−5 min at restart) and calibration | Non-binding, as recorded | Policy | As recorded in SSCTR_SR2_R1 | Policy record |
| O-NCC-S1 | A zero-minute symptom stop after a readiness declaration does not re-open the readiness question (SB-1 hears only "done" voices). Only the warning-sign screen raises it. This is the monotone outcome on both trees, and unchanged by F1 in kind | Observation | — | F08 owners (Core, Security), with SSCTR | Scope note |
| Discharged | C-SR2-2 (F1), C-SR2-3 (F3), C-SR2-4 (F2) | — | — | — | Closed by this review |
| Carried | C-SR2-5 (as extended), O-3, O-4 (with O-NCC-1/-2), C-R2-2, O-1 (B0-F05), O-2 | Unchanged | — | As recorded | — |

C-F01-2, SEC-CORE-03, the 28-day window contract, custody and iOS revalidation are unchanged and outside this review.

**Human queue** (proposed only, not appended). **HQ-NCC-SSCTR-A** enters as QUEUED_FOR_FUNDED_HUMAN_REVALIDATION. It covers this reading:
- arrival order does not change which execution evidence is admitted;
- a direct conflict keeps the first-admitted row flagged and out of dose and calibration;
- one device activity backs one execution;
- a disputed session earns no completion credit until a valid correction resolves it;
- the open exception is SSCTR-NCC-01.

**Re-review triggers:**
- any change to the normalizer's conflict kinds, its resolution rule or how quarantine persists;
- the C-NCC-1 or C-SR2-5 policy;
- a change to SB-1's scope;
- a change to the lineage items L1–L5 or RUN_CLASS_THRESHOLDS;
- real-athlete data.
