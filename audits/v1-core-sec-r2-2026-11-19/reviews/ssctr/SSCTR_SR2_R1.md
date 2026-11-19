# SSCTR review of SEC-R2-03 + SEC-R2-04, R1 (2026-11-19)

**Decision: ACCEPT_WITH_CONDITIONS.** On the sporting side, the fix is correct. A refused correction no longer removes a real execution from dose, pause, calibration or restart. The fix changes no training rule, and the clinical-hold and symptom-stop paths are kept or improved.

None of my conditions needs the runtime correction cycle:
- One condition binds the closing record: §C of CANDIDATE.md misstates the dose attribution.
- Three routed findings bind before real-athlete use. I reproduced each on FREEZE-3 and on the candidate, with the same result on both.

| # | Question | Disposition | Blocking this candidate |
|---|---|---|---|
| 1 | Restoring the lost execution, and the dose change | ACCEPTED. The attribution in CANDIDATE §C is wrong, see C-SR2-1 | no |
| 2 | Pause and return, SB-1, clinical hold, symptom stop | KEPT or IMPROVED | no |
| 3 | Run and strength evidence | Nothing is admitted that should not be. Two existing effects hold back valid evidence (O-1, O-4) | no |
| 4 | O-1, the event-id conflict rule | ACCEPTABLE for synthetic use. Condition C-SR2-5 for the conflict-policy mission | no |
| 5 | Interference and hybrid | No effect beyond the restored execution being read correctly | no |
| 6 | F1, F2, F3 | All three have sporting consequences. Each binds before real-athlete use, but they bind different readers | no (pre-existing) |

## 0. Reviewer, target, method

**Reviewer:** SSCTR (SSCTR-1.0.0 / SSCTR-CONST-1.0.0), model claude-opus-5-5. The Chief launched me as a fresh instance.
- I wrote none of the change, its tests or its records, and I did not read the Security or QRE reviews of this line.
- Authority: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical only. No human review took place, I made no clinical judgment, and I delegated nothing.

**Literature:** none used. WebSearch and WebFetch are available as deferred tools; I did not load them.
- Every item here checks the fix against decided rules: C-Q08-1, C-Q08-2, QRE-R6-13/-14, SB-1, SSCTR-V1RC-R-01, SSCTR-CORE-B-01 and the RUN_CLASS_THRESHOLDS binding. It also checks measurement integrity.
- I make no empirical claim, so I assign no evidence status. No new dose, threshold or progression is decided here.
- For that reason I wrote no structured JSON record and did not run the skill's validator.

**Judged bytes (SHA-256).** The worktree HEAD is `f6a934f`. `CoachingCore/src` has no diff between `4e8cffe` and HEAD.

| File | SHA-256 |
|---|---|
| `CoachingCore/src/r6-provenance.mjs` | `277addbc53883e9df3a8d3a591081679955181f7a7fde5910e7120ea4d43d391` |
| `CoachingCore/src/v1-f08.mjs` | `f1065bf1e8c29a4019cf5f8f1c72e9f50f38a11796bf126d39c52a6470e27d37` |
| `CoachingCore/test/v1core-secr2-correction-integrity.test.mjs` | `9f6b0669a5ea05864e8f0561d2f236de442799c7feeb7821fa6121297455da0e` |
| `audits/v1-core-sec-r2-2026-11-19/CANDIDATE.md` | `ba04256b1da94c950f4c3dc928805ca28b892ebf2bdd485252b043834b33136b` |
| `evidence/dose-impact.mjs` | `1d67b7aff2f5c05a635d24f64a2d91bbd3f375d6ce4573dfa3c1aa390bcc9796` |
| `evidence/dose-a6e10d0.json` | `4734194b443bdcac5540b3edce4e751dda70d02fff970fcace7ba2304e9cd2df` |
| `evidence/dose-4e8cffe.json` | `53f1feaaea6157535f486b34a3e584231df44457a066bfeebc08604c8bf0f0b0` |

**Base.** The base is the read-only worktree `.claude/worktrees/v1-core-cf011-r2` at `a6e10d0`, which is clean. Its `r6-provenance.mjs` and `v1-f08.mjs` are byte-identical to `a6e10d0`.

**Commands** (Node v24.19.0):
- `node --test test/v1core-secr2-correction-integrity.test.mjs` gives **20/20**.
- I did not run `npm run verify`, `verify-r*`, the freeze scripts or the full suite.

**Probes.** They are read-only, use synthetic athletes and ran on both trees. They are in `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/d9ef9ce4-1d97-47de-bf54-0b1d98cf2cf8/scratchpad/ssctr-sr2r1-7c3a/`:
- `attr.mjs` re-runs the `dose-impact.mjs` journeys with instrumentation: the bound, the class, the week-0 roles, run facts, the calibration, forecast and pace hashes, and strength. It also maps a stated bound alone to the restart plan. Outputs: `cand.json`, `f3.json`.
- `walk.mjs` reads the run sessions' roles and optional flags, and the running and walking minutes of weeks 0–3.
- `f1.mjs` tests F1 with a symptom-stop correction.
- `f2.mjs` tests F2: borrowed watch evidence.
- `f3.mjs` and `f3b.mjs` test F3 through the weekly review.

## 1. The dose change: ACCEPTED, with attribution corrected (C-SR2-1)

**Restoring the execution is correct for sport.**
- The run took place and its report was valid. C-Q08-1 is defined as the run minutes the record shows *executed* in the window. A refused message is no fact about training, so it cannot remove an execution from that measure.
- The restored row keeps its original value (40 min). The content of the refused correction (35 min) is not applied. That is right, because nothing admitted it.
- In both FREEZE-3 and the candidate, the result equals the same report sent without `correctionOf` (`A` and `A-plain`).

**My reading of the attribution differs from CANDIDATE §C.**

| | Runs counted (min) | Bound, min/wk (days/wk) | Class | Week 0 running: EASY + LONG | Optional brisk walks | Running, weeks 0–3 |
|---|---|---|---|---|---|---|
| Control | d1 40, d3 40, d5 40, d6 80 | **50** (1) | EASY_LOW | 15 + 15 + 20 = **50** | 20 | 50/50/50/55 |
| FREEZE-3 | d5 40, d6 80 | **30** (1) | EASY_LOW | 15 + 15 = **30** | 40 | 30/30/30/35 |
| Candidate = plain report | d3 40, d5 40, d6 80 | **40** (1) | EASY_LOW | 25 + 15 = **40** | 40 | 40/40/45/50 |

- **The bounds.** The bounds are 50, 30 and 40 min/week, not the ≈40, ≈20 and ≈30 that CANDIDATE.md gives.
- **The "RUN minutes" are not running minutes.**
  - The 70, 70 and 80 totals count the `RUN`-sport sessions that the plan converted into **optional brisk walks** (`role: WALK`, `optional: true`, `converted: TOO_MANY_RUN_DAYS_FOR_CURRENT_PRACTICE`).
  - Prescribed running is 50, 30 and 40, which is **monotone in the bound** and stays so through week 3. The stated bound alone gives the same mapping on an empty record, identically on both trees.
  - So the candidate prescribes 10 min/week **less running** than the control, not 10 more. It has one more optional walk, which explains its +10 on the total.
- **O-1/B0-F05 is not the mechanism.** That residual concerns a class that is not monotonic (0 min/week → RESTART at 45 min versus 25 min/week → EASY_LOW at 15). Here every case is EASY_LOW, and the run days are bounded to 1 in all three.
- **What does differ is the split (observation O-3).**
  - Within EASY_LOW, a budget of 40–45 is laid out as one 25-min EASY session plus a LONG of 15–20.
  - A budget of 50 or more is laid out as 15 + 15 + 20.
  - So the largest single session at a bound of 40 (25 min) exceeds the largest at 50 (20 min), and the "LONG" is shorter than the EASY.
  - For sport this is harmless: within the window the athlete ran 40, 40 and 80 min sessions, four to ten days earlier.
  - It is a distribution oddity for the B0-F05 / RUN distribution revision. This mission should not change it.

**For synthetic use, the dose change is acceptable with no runtime condition.**
- The candidate sits between FREEZE-3 (lost execution) and the control (no bad report).
- It lies below the control because d1 stays excluded under O-1.
- The run days, class, strength plan (27/27), pause (RUN 4 / STRENGTH 5 days) and status are unchanged.

**C-SR2-1** (binds the closing record, not runtime; owner Chief with the candidate author). Correct §C:
- the bounds are 50/30/40;
- the "RUN minutes" include optional walks;
- running is 50/30/40 and monotone;
- the +10 is walking, not O-1.

Record O-3 for the distribution revision.

## 2. Pause and return, SB-1, clinical hold, symptom stop: KEPT or IMPROVED

**Pause and last executed day.**
- On FREEZE-3, the lost session no longer counted as `occurred`. Had it been the latest one, the pause would have been read from an earlier session: longer than the facts, and possibly crossing the C-Q08-2 floor.
- On the candidate, the row is in force and the pause is factual. In the journey, RUN is 4 days on both trees, because d3 is not the latest run.

**SB-1 and the readiness question.**
- On FREEZE-3, the stop after a declaration was asked only through the SEC-R2-01 orphan-voice rule.
- On the candidate, the row is in force, so `claimsDone` hears it directly.
- SEC-R2-04 removes the false match where two missing identities counted as the same session. With that match, a declaration answered a stop that came after it (tests 18, SEC-R2-04, and the SEC-R2-01 successor all pass).
- This only adds a question, never dose. The controls (a legitimate manual "not done", another provider, a session-bound row) still read as history.

**Clinical hold.**
- In reviews, F08 facts are filtered out before `normalizeObservations`, and the restart reads them separately (`standingHolds`, `clinicalBreak`). The diff touches neither.
- A refused report is an observation: it cannot set or release a hold. Only the readiness declaration releases (CF-OBS-1). The clinical criteria themselves are out of scope.

**Symptom stop.**
- Test 18: the original's stop (`SYMPTOM`, recovery `ADVERSE`) stays in force after a refused correction that would have erased it.
- The run-format screen (`rowStops`, SSCTR-CORE-B-01) reads every row, superseded or conflicted. On FREEZE-3 the stop therefore stayed visible to that screen. On the candidate it is also a row in force for every other reader.
- **Not covered by this fix:** F1 can still delete a stop from the record (§6).

## 3. Run and strength evidence: nothing wrongly admitted

**The shapes the fix changes:**
- **(A)–(C):** the refused content never enters, and the original is the valid evidence it was. `factsFromLedger` and calibration's `runRows` still exclude `conflicted` and `superseded` rows.
- **(D):** a correction that resolves a conflict is admitted under the existing rule, which retires the conflicted reports. The fix only stops that session from vanishing. Nothing conflicted is admitted.
- **(E):** a second correction of a corrected part now merges into the row in force or conflicts with it. Before, one execution could be evidence twice. That is an improvement.
- **SEC-R2-04:** readiness question only; no evidence reader reads it.

**At restart, both trees give the same outputs.**
- In the A journey, the run calibration hash (`e9836271…`), the forecast hash (`7206ce4f…`), Pace Insights (`aab2290a…`) and strength exposure (`fd2fd058…`) are identical on FREEZE-3 and the candidate.
- Run-history facts go from 2 to 3: d3 is restored, equal to the plain report.
- Strength (journey S): the restart plan is unchanged and consumers equal the plain report.

**Valid evidence held back, by existing effects, not by this fix:**
- **O-1** (§4): d1 is a run corroborated by the watch, yet it stays out of dose and calibration.
- **O-4 (observation).** Within the pass that receives a refused report, that report's identity is quarantined. That identity is the original's session, so `weekEvidence` reads the session `CONFLICTED` for that pass and `COMPLETED` on the next one, with no new fact.
  - The plain report behaves the same, and this errs low in gating.
  - It belongs with the F3 work on how quarantine persists (non-binding).

## 4. O-1: acceptable for synthetic use; a condition for the conflict-policy mission

A refused report that reuses an event id flags the row holding that id as `conflicted` (QRE-R6-14). Activity reuse does the same (QRE-R6-13).

**Effect for sport:**
- The row leaves dose, gating and calibration.
- Its occurrence does not count for the pause, because `occurred` admits only `CORRECTION_CONFLICTS_WITH_A_REPORT_IN_FORCE`.
- A stop on that row stays visible to the run-format screen.

The direction is conservative: a lower bound, a longer pause, possibly the return floor, and less calibration evidence.

**Two limits:**
- Removing a recent result can leave an older one as the calibration anchor, within the 56-day currency rule. This is the same exposure as an athlete who does not report a race, so it is no new risk class.
- A client defect or a replay can remove executions the athlete and the device agree on, with no visible way to restore them.

**C-SR2-5** (non-binding, not before real-athlete restart; owner: the next conflict-policy mission, Core with Security and QRE, then SSCTR; visibility with Product/UX, alongside O-2):
- a conflict raised only by a report that was itself refused, against a row whose voices agree, should be visible to the athlete and resolvable by the athlete;
- or it should be defined as not raising a conflict.

## 5. Interference and hybrid: no effect beyond correct input

- The restored run is a real execution. It is now the correct input to the weekly review's load and convergence readers and to the hybrid arrangement. Consumers equal the plain report ("15 and consumers").
- The strength plan (27/27), the per-sport pause, the arrangement and the status are unchanged.
- No interference, spacing or priority rule is edited, and none reads the normalizer differently.
- (E) removes a double-counted execution. That double count could have overstated the week's load.

## 6. F1, F2, F3: each binds before real-athlete use

All three are identical on FREEZE-3 and the candidate (my probes). None blocks this candidate.

**F1: a carried row in force is refused again when an incoming report sorts earlier. BINDING before any real-athlete use, review or restart.**
- **Reproduction** (`f1.mjs`):
  - X is a 40-min run. Correction C ("stopped, `SYMPTOM`", recovery `ADVERSE`) is carried in force.
  - A late watch sync of the same session arrives, reported before C's instant.
  - On both trees, C is refused (`DUPLICATE_CONFLICT_QUARANTINED`) and leaves the record. X is left replaced by a row that no longer exists, and the record holds no stop at all.
  - The control (the sync reported after C) keeps C, conflicted, with its stop.
- **Consequences:**
  - **The athlete's own symptom report disappears.** The run-format warning-sign screen cannot see it, so the screen is not asked for it. This is a loss of safety visibility, not only low dose.
  - The execution also leaves dose, pause and calibration.
- **Owner:** Core with QRE, then Security, then an SSCTR recheck. The recheck covers symptom-stop visibility, and dose/pause under arrival order.

**F2: a watch activity merged as a part of another row is not indexed. BINDING before real-athlete use of the run-evidence readers** (run history, calibration, Race Forecast, Pace Insights, including those carried in a restart's output) **and of weekly reviews. Not binding for the restart dose alone.**
- **Reproduction** (`f2.mjs`, journey B):
  - A correction of d3 carries HK-D1, which d1's merged row holds as a part.
  - It is admitted, and its row becomes `sourceQuality: WEARABLE_FULL` with `activityIds: [HK-D1]`.
  - d1 stays in force. One device activity now backs two sessions, and a manual report is upgraded to wearable-quality distance evidence.
- **Direction:** unpredictable for pace and forecast, because one effort is duplicated with borrowed device trust. The dose effect is small: the minutes are the athlete's own (35).
- **Owner:** Core with Security, then an SSCTR recheck.

**F3: a carried correction in conflict loses its quarantine when re-read. BINDING before real-athlete weekly-review gating. Not binding for restart** (the restart reads the row's `conflicted` flag).
- **Reproduction** (`f3.mjs`, `f3b.mjs`, through `evaluateProgram`):
  - Run d1 is reported by the athlete and the watch. The athlete then corrects their own part against the watch voice in force, and `weekEvidence` reads `CONFLICTED`.
  - A later review in the same week, with nothing new, reads `PARTIAL` (correction 20 min, `ADVERSE`) or `COMPLETED` (correction 60 min), with `conflicted: 0`.
- **Consequences:**
  - A disputed amount reaches gating. QRE-R6-14 says it never should.
  - The session's state changes with no new fact, against the stability principle.
  - In the upward case, a disputed amount earns completion credit for the next step.
- **Owner:** Core with QRE, then an SSCTR recheck.

## 7. Conditions and residuals

| Id | What | Binding | Owner | Closes when |
|---|---|---|---|---|
| C-SR2-1 | Correct CANDIDATE §C: bounds 50/30/40; "RUN minutes" include optional walks; running 50/30/40 is monotone; the +10 is walking, not O-1. Record O-3 | Binds the closing record only; no runtime cycle | Chief with the candidate author | The closing record states it |
| C-SR2-2 | F1, including the loss of a symptom stop | Before any real-athlete use, review or restart | Core with QRE, then Security, then SSCTR recheck | Arrival order cannot drop a row in force or a stop; SSCTR recheck |
| C-SR2-3 | F3: quarantine lost on re-read; a disputed amount reaches gating | Before real-athlete weekly-review gating; not for restart | Core with QRE, then SSCTR recheck | A conflicted session stays `CONFLICTED` on every re-read |
| C-SR2-4 | F2: borrowed watch activity admitted as wearable evidence; one activity, two sessions | Before real-athlete use of the run-evidence readers and weekly reviews; not for restart dose alone | Core with Security, then SSCTR recheck | A merged part's activity binds like a row's own |
| C-SR2-5 | O-1: a refused report can remove a corroborated execution with no visible way back | Non-binding; not before real-athlete restart | Next conflict-policy mission (Core, Security, QRE), Product/UX for visibility, then SSCTR | Policy record |
| O-3 | EASY_LOW split: at 40–45 one 25-min EASY plus a shorter LONG; at 50 or more, 15+15+20 | Observation | B0-F05 / RUN distribution revision (SSCTR) | Revision record |
| O-4 | Pass-local quarantine of the refused report's identity flips the session for one pass | Observation | With C-SR2-3 | — |
| Carried | C-R2-2, O-1 (B0-F05), O-2 from SSCTR_R2_R1/R2_R2 | Unchanged | As recorded | — |

C-F01-2 and SEC-CORE-03 are unchanged and outside this review.

**Human queue** (proposed only, not appended). **HQ-SECR2-SSCTR-A** enters as QUEUED_FOR_FUNDED_HUMAN_REVALIDATION. It covers this reading:
- a refused correction leaves the original execution in force, counted for dose, pause, calibration and SB-1 exactly as the same report without `correctionOf`;
- the refused content is not applied.

**Re-review triggers:**
- any change to the normalizer's conflict kinds, or to how quarantine persists;
- the fixes for F1, F2 or F3, or the C-SR2-5 policy;
- a change to RUN_CLASS_THRESHOLDS or to the RUN distribution;
- real-athlete data.
