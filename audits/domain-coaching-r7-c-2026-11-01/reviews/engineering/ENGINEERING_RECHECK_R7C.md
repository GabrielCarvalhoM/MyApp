# R7-C Phase 5: Engineering narrow recheck of R7C-FREEZE-2

Record `R7C-ENGINEERING-RECHECK-1`, dated 2026-11-02. The structured record is [ENGINEERING_RECHECK_R7C.json](ENGINEERING_RECHECK_R7C.json).

- **Judge:** `quality-reliability-engineer`, a fresh instance; model `claude-opus-5-5`, effort xhigh.
- **Independence:** I did not author the runtime, the correction cycle, its tests, its evidence, or the review of R7C-FREEZE-1. Untracked SSCTR recheck work (`reviews/ssctr/probes/cc/`) appeared in the worktree during this recheck; I did not open it. The session scratchpad turned out to be shared with the authoring session and holds its working files, including a draft template for this recheck. I read none of them.

## Verdict

**NOT_READY.** One blocker comes directly from the R7-C delta. There is no second cycle, so R7-C closes as `CLOSED_NOT_READY`.

The cycle closes QE-R7C-02, -03, -04 and -06. QE-R7C-01 is closed only for the cases it reproduced: answers that report a known stop. The defect class it named is still open.

Some decisions record an answer to `UNREPORTED_TRAINING` without applying it: a refusal (R4) or a handler clinical route. When that answer reports executed, mixed or adverse training, it is still never applied afterwards. The stale projection stays **VALID**, including:
- a race touch in race week;
- quality in the taper;
- a long run that the adverse evidence would shorten.

| Id | Severity | DIRECT_R7C_DELTA | One line |
|---|---|---|---|
| QE-R7C-07 | BLOCKER | yes | QE-R7C-01 holds only for known stops. A mixed, adverse or executed answer recorded by an R4 HOLD or a clinical route is never applied: the stale projection stays VALID in 72 of 160 cells. R7B2-FREEZE-1 has 0. |
| QE-R7C-08 | MINOR | no | The never-reported class is re-planned only where a dose exceeds the minute ceiling. Credited doses inside it, including a quality session in week 4, stay VALID (pre-existing). |
| QE-R7C-09 | OBSERVATION | yes | After an uncredited re-plan, week b+1's start premise names the uncredited session as assumed executed. No decision reads it. |

| Earlier finding | Now |
|---|---|
| QE-R7C-01 (BLOCKER) | **Partially closed:** known stops 16 → 0 stale cells. The class stays open as QE-R7C-07. |
| QE-R7C-02 (BLOCKER) | Closed |
| QE-R7C-03 (MAJOR) | Closed |
| QE-R7C-04 (MINOR) | Closed |
| QE-R7C-05 (MINOR) | Accepted as disclosed (unchanged) |
| QE-R7C-06 (OBSERVATION) | Closed |

## Freeze identity

| Field | Value |
|---|---|
| Record | `CoachingCore/r7/c/RUNTIME_FREEZE_R7C_2.json`, sha256 `457582a2…fa8d` |
| Commit | `a10cec04071be97e409f11a4f831f13eae0c9769` |
| Source digest | `9e424f70…3f35` |
| Manifest digest | `02c50ef3…efb9` |
| Size | 150 files, 854 tests |
| Evidence head | `963239b` (no difference from `a10cec0` in `src`, `test`, `r6` or the fixtures) |

Verifier runs, both `node CoachingCore/scripts/verify-r7c.mjs --revision 2 --suite`:
- **Before** (06:34:58Z): PASS 16/16, suite 854/854.
- **After** (07:09:07Z): PASS 16/16, suite 854/854.
- **Worktree HEAD:** `b31d036` at the start and at the end.

## QE-R7C-07: a recorded answer is still never applied unless it reports a known stop (BLOCKER)

**Root cause.**
- `gapAnsweredBy` still detects an answer only as a transition: from the review's carried record to the same review's reports.
- The cycle's ceiling re-plan (`aboveFactsCeiling`) catches the stale projection only when a stored dose exceeds the facts' single-run ceiling.
- After a known stop, that works: no run is recorded, so the ceiling is the entry (15).
- When the answer reports executed gap runs (all, only the long runs, or with an adverse response), they lift the ceiling to 70–75. That is above every stale dose, so nothing re-plans.

**Reproduction.**
- Grid: `probes/recheck/rc-p4-recorder-independence.mjs`, output `out/rc-p4.json`, identical over two runs.
- Mechanism, one cell per carrier with the ceiling printed: `rc-p4b-mechanism.mjs`.
- The grid extends the predecessor's E1 from V = MISS to V ∈ {MISS, EXEC, MIXED, ADVERSE, PARTIAL}:
  - carriers: the R4 schedule change in race week, and the clinical substitution followed by clearance;
  - weeks: GEN week 7, the R10K taper and race week;
  - gap: g 0/2, RV/NR;
  - next decision: a plain review on day 3, with and without the re-send.
- Property: the plan in force equals the plan after the same answer delivered as a plain review on day 2.

| Recorder-dependent cells (of 160) | MISS | EXEC | MIXED | ADVERSE | PARTIAL | Total |
|---|---|---|---|---|---|---|
| R7B2-FREEZE-1 | 0 | 0 | 0 | 0 | 0 | **0** |
| R7C-FREEZE-1 | 32 | 8 | 32 | 32 | 0 | **104** |
| R7C-FREEZE-2 | 0 | 8 | 32 | 32 | 0 | **72** |

Of the 72 cells:
- 62 leave more run minutes ahead than the direct answer;
- 32 keep a race touch the direct answer does not plan;
- 24 keep a quality session it does not plan.

| Case (rc-p4b) | Facts' ceiling | Next decision on FREEZE-2 | Same answer, delivered directly |
|---|---|---|---|
| R10K race week, MIXED, inside a day-2 schedule change (HOLD, recorded) | 75 | **KEEP, VALID, RACE_TOUCH 25** + RACE 75 | EASY 20 + RACE 75 |
| Same, through a clinical substitution, then clearance | 75 | **KEEP, VALID, RACE_TOUCH 25** + RACE 75 | EASY 20 + RACE 75 |
| GEN week 7, ADVERSE (long runs done with an adverse response), clinical, then clearance | 70 | **KEEP, VALID, QUALITY 34 / LONG 60** | EASY 45 / LONG 35 |
| R10K taper, MIXED, clinical, then clearance | 75 | **KEEP, VALID, QUALITY 28 / LONG 45** | EASY 30 / LONG 40 |

**What this violates.**
- The predecessor's QE-R7C-01 expectation: once the facts make the window known, the doses ahead follow them, whichever decision carried the reports. That covers projection vs fact, deterministic answer processing and no stale dose in race week.
- SSCTR-SD-R7C-r2's grid properties, which hold for direct answers but not here:
  - M2: mixed evidence never leaves a run longer than on time;
  - E1: adverse responses never lengthen the long run.
- **Evidence preservation:** the adverse long runs are recorded and never acted on.

**No consumer condition shields it.**
- The plan is VALID, so C2 does not apply.
- C3's re-send after clearance changes nothing: the reports are already in the carried record, and the re-send is deduplicated.

**Inaccurate disclosures on FREEZE-2.** Both handoff notes are false for executed, mixed and adverse answers:
- R4: "Since the correction cycle, the next decision applies it (the ceiling re-plan)".
- R5: "the next decision after qualified clearance applies it, with or without the re-send".

**Why the cycle's evidence did not see it.**
- The QE-R7C-01 directed tests and CC-M1 use V = MISS only. A trigger limited to known stops passes them, and that is what FREEZE-2 effectively is for this class.
- The SD grid still classifies its 24 R4 HOLD cells and never looks at the decision after them.

**DIRECT_R7C_DELTA: yes.** R7B2-FREEZE-1 is recorder-independent on all 160 cells. The stale credited projection exists only because R7-C asks instead of planning.

**Smallest fix**, for the next runtime mission (this is the predecessor's own recommendation):
- Make the answered re-plan state-based, neither transition-based nor ceiling-based. Re-plan from the facts, with `uncredited`, whenever the run doses ahead were stored while the window was unknown and the facts now make it known, whichever decision recorded the reports. Two ways to do it:
  - the reference state, or the program, records that the question stood when the week's doses were stored;
  - a received-at comparison.
- Keep the ceiling re-plan for the never-reported class, if the SSCTR accepts it.
- Add directed tests for R4 and the clinical carriers × {MISS, EXEC, MIXED, ADVERSE} × with and without the re-send. `rc-p4` is a ready grid.
- Policy, catalog and the clinical routes stay untouched.

No product, policy, catalog or clinical decision was needed to judge this.

## QE-R7C-08 and QE-R7C-09

**QE-R7C-08 (MINOR, not DIRECT_R7C_DELTA)**
- **Setup:** GEN, nothing ever reported, the intake run still in the window. Probe: `rc-p2-reach-grid.mjs`.
- **What happens on FREEZE-2:**
  - week 3 is re-planned to EASY 35 / 35 / LONG 50, which equals the on-time path with empty reviews, strength included;
  - week 2 keeps LONG 55 (on time: 50);
  - week 4 keeps **EASY 40 / QUALITY 34 / LONG 55, VALID**, where empty reviews give EASY 35 / 35 / LONG 40.
- **Baseline:** R7B2-FREEZE-1 and R7C-FREEZE-1 behave the same, so this is pre-existing.
- **Why it is a finding:** the request presents the never-reported class as re-planned from the facts, but the reach is partial.
- **Fix:** disclose it with the ceiling re-plan. Separately, the SSCTR can decide whether the trigger should also read the PlanningView's run mode (a policy question).

**QE-R7C-09 (OBSERVATION, from the cycle)**
- **What:** `composeWeeks` projects week b+1 from `credited`, but records `projectedStart(first.week)`. Its RUN premise therefore names `w7-run-d1` as assumed executed.
- **Evidence:** the recorded premise is `01329b2b…`, which is the week as planned; without `w7-run-d1` it would be `3d10d363…`. Probe: `rc-p5-uncredited-premise.mjs`.
- **Impact:** no decision reads the premise.
- **Fix:** use `projectedStart(credited.week, by)` and pin it in a test.

## The recheck items

| Item | Result | Basis |
|---|---|---|
| 1. QE-R7C-01..04 closed | **01 partial** (→ QE-R7C-07); 02, 03, 04 closed | See the evidence lines after this table |
| 2. No regression | PASS | See the evidence lines after this table |
| 3. Ceiling re-plan and G01 guard | **Partial** | The guard is correct. No path was found that acts on facts the record does not keep, travels with an `UNREPORTED_TRAINING` question, or rewrites history. The re-plan is not sufficient for its class (QE-R7C-07). |
| 4. `r7a-cycle2:111` | ACCEPT as EXPECTED_SEMANTIC_UPDATE | Subject to the SSCTR accepting the ceiling re-plan. See the evidence lines after this table. |
| 5. Mutation | PASS as recorded; coverage caveat | See the evidence lines after this table |
| 6. QE-R7C-05 / -06 | 05 accepted as disclosed; 06 closed | See the evidence lines after this table |

**Item 1 evidence.**
- qe-e1 rerun: 0 stale cells (was 16).
- qe-e3b: 0 (was 12). Week 8 is EASY 20 / 20 / LONG 20, the ceiling.
- qe-e3: week b+1 equals on time in 8/8 (was 2/8).
- qe-e2(a): the fatigue survives the kept change and is re-evaluated, equal to on time for MISS and EXEC.
- qe-e2b: no replay across weeks.
- Directed test caveats:
  - the QE-R7C-01 directed tests are MISS-only;
  - the skipped-review part of the QE-R7C-02 test `continue`s on cells that are not VALID. All 12 are VALID today, so it is not vacuous now.

**Item 2 evidence.**
- Suite 854/854 in both verifier runs.
- Committed probes rerun on the FREEZE-2 bytes, byte-identical to the committed evidence:
  - the SD grid (1,200 cells, 0 violations);
  - the G01 grids (148 rows at 76/40/32, grid B 46/46, P1 165/0);
  - G02 and sd01;
  - the cc-differential (99 scenarios: 97 identical, 2 never-reported).
- Exactly 6 G01 grid-A rows changed, with every verdict identical.
- qe-e4 is identical to FREEZE-1, check by check.
- Returns, the week after the re-entry week (`rc-p1`): FREEZE-1 equals FREEZE-2 in all 60 cases.
- Reach grid (`rc-p2`), 540 decisions: only the intended never-reported week-3 decisions differ, and there FREEZE-2 equals on time.
- Census on an instrumented isolated copy: the ceiling re-plan acts in 30 suite decisions across 6 files, all skipped-review or never-reported fixtures; in 9 G01-grid decisions; and in no SD-grid decision.

**Item 3 evidence.**
- **The G01 guard:**
  - it fires once in the suite and 3 times in the G01 grid;
  - every re-decision is ASK `UNREPORTED_TRAINING`, REQUIRES_RECONCILIATION, with no proposal;
  - `NO_CEILING` is a module-private Symbol, so no caller can set it;
  - the re-plan cannot raise `UNREPORTED_TRAINING` for its own week, because it requires `!runGapInForce`.
- **Facts the record does not keep:**
  - the return entry, return and restart weeks, and the return report are all excluded;
  - the week after a re-entry week is unchanged from FREEZE-1 (`rc-p1`).
- **History:** every proposal passes `immutabilityErrors` and `validateWeeks`, failing closed to UNSUPPORTED otherwise; SD grid H1 has 0 violations.
- **Scope beyond the handoff text:** the re-plan re-composes every sport, not only the run doses. Strength goes from FROM_LOG 3×5 to ESTABLISH 2×5, equal to on time (`rc-p3`). It is correct but should be disclosed.

**Item 4 evidence.**
- On the test's own fixture, all four refused-date variants on FREEZE-2 give ASK, REQUIRES_RECONCILIATION, with a proposal identical session by session to the plain review's ceiling re-plan at the same clock. Nothing of the refused change leaks into any week.
- This is the pre-existing `withFactualReplan` rule.
- The no-proposal reading is kept where nothing is credited, so INV-11 is still pinned.

**Item 5 evidence.**
- The committed record shows 17/18 + witness, 8/8, 6/6 and CC 9/9. The earlier sets equal FREEZE-1's.
- My independent rerun of CC-M1..M9 on an isolated archive: baseline 55/55, then 9/9 killed.
- Caveat: CC-M1 is killed only by MISS cases.

**Item 6 evidence.**
- QE-R7C-05: qe-e4 shows the same 2 batch checks. The handoff discloses it.
- QE-R7C-06: both package files are bound in FREEZE-2 and unchanged since `1a1c728`.

## Reproduced and not reproduced

**Rerun:**
- the verifier, before and after;
- qe-e1..e4;
- phase5-adversarial-sd, phase4-adversarial-g01, phase3-adversarial-g02, phase4-verify-sd01, phase5-cc-differential;
- the full suite file by file, plus the G01 and SD grids, on an instrumented isolated copy. The patch only logs, and the grid outputs are identical to the committed ones.
- Outputs are in `probes/recheck/out/`.

**New probes**, in `probes/recheck/`:
- rc-p1 to rc-p5 and rc-p4b;
- rc-instrument and rc-mutants, which edit only isolated copies;
- rc-lib.

**Not rerun:**
- phase5-run-evidence and phase5-mutation (the rules forbid it);
- `npm run verify`, any other `verify-r*`, and anything with `--write`;
- the b2-copy clinical probes, conformance, neighbours, holdout and the R7B2 differential (outputs not re-derived).

**Caveats:**
- There is no clinical-clearance API. Clinical cells model clearance as the predecessor did: the client continues with the carried record and no clinical reference state. The R4 cells need no such assumption, and they fail the same way.
- Predecessor and mutant bytes come from `git archive` into the scratchpad; node_modules were copied, not reinstalled.
- Before I created a dedicated folder, I extracted `1a1c728` and `a10cec0` over two pre-existing scratchpad folders (`b2/`, `f2/`) that belong to the authoring session's scratch.
- The repository was written only under `reviews/engineering/`: the two deliverables and `probes/recheck/`. There were no commits or git state changes.

## Routing

- **Closure:** QE-R7C-07 is a blocker and DIRECT_R7C_DELTA, and no second correction cycle is permitted, so R7-C closes `CLOSED_NOT_READY`.
- **Next runtime mission:** fix QE-R7C-07 as the smallest fix describes, and QE-R7C-09 alongside it.
- **SSCTR:**
  - the ceiling re-plan's semantics, and the `r7a-cycle2` classification that depends on them;
  - QE-R7C-08, as a disclosure or a policy question;
  - the R4 and R5 handoff notes, which need correcting.
- **No escalation needed:** no product, policy or clinical decision was needed to judge.

R7C_ENGINEERING_GATE = NOT_READY
