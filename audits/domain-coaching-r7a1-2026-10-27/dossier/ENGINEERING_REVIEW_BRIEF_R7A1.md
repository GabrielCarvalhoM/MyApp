# R7-A.1 — engineering review brief (R7A1-FREEZE-A1)

**For:** the independent engineering judge of DOMAIN_COACHING_R7-A.1 (gate `R7A1_ENGINEERING_REVIEW`). You did not write this code; the runtime author never judges it.
**Binding:** R7A1-FREEZE-A1, `CoachingCore/r7/a1/RUNTIME_FREEZE_R7A1_FREEZE_A1.json`, source digest `2de8681f13e5cb499df6a5a3dc443d52877850528ceb298b598d03de6ec2141a`, policy R6-POLICY-5 `18ec48f3…` (unchanged).
**Mission:** [FOUNDER_REQUEST.md](../FOUNDER_REQUEST.md) (§12 is your remit), [TASK_CONTRACT.md](../TASK_CONTRACT.md) (cycle bound, scope).

## Your remit

1. Check that the seven R7-A blockers are closed **by their mechanism**, not only in their reproductions: QE-R7A-01, 02, 03, 05, 12, 19 (yours from the R7-A re-check) and the engineering side of D56/D53.
2. **Central question (Founder §12):** *is there another handler that can destroy, or rebuild differently, state equivalent to what the contract protects?* Look for equivalent paths, not only the seven.
3. Judge whether the evidence is adequate: the tests have structural power (metamorphic and property tests, not count growth), the mutation check, the regression and its named differences.
4. Recommend the five integrity verdicts in your scope (below) and give your gate verdict.

Sporting dose content (D56 formulation, QE-R7A-12 dose reading, QE-R7A-02, the return and progression effects listed under "Differences") is the SSCTR's, reviewed in parallel on the same freeze. You may report a dose effect, but you do not rule on it.

## Bounds

- **Read-only runtime.** Do not edit `CoachingCore/` (src, test, scripts, r6, r7), `CURRENT_MISSION.md`, `MISSION_LEDGER.md`, the human queue, `product/`, `canon/` or any earlier audit. Write only under `audits/domain-coaching-r7a1-2026-10-27/reviews/`: your probes, their outputs and your review.
- **Never run** `npm run verify`, `npm run simulate`, `npm run demonstrations:r6`, any `CoachingCore/scripts/verify-r*.mjs` other than `verify-r7a1.mjs` (and that one never with `--write`), `regress-r7a.mjs`, `regress-r7a1.mjs`, `freeze-r7a1.mjs` or `prepare-r7a1.mjs`. They write closed or author evidence.
- In `probes/`, the `r7a1-*.mjs` probes only print and are safe to run. `ssctr-r12-instrument.mjs` and `mutation-check-r7a1.mjs` write files next to themselves. Copy them into your reviews folder before running; for the instrument, set `R7A_PROBE_OUT`.
- Your R7-A re-check probes (`audits/domain-coaching-r7a-2026-10-27/reviews/qe-recheck-P*.mjs`) print to stdout and load the current runtime. Do not redirect their output into the R7-A folder. P6's mutant helper checks the FREEZE-2 hashes and now refuses (expected).
- Synthetic data and the DEV_TEST_ONLY authority only (`CoachingCore/r6/fixtures/dev-authority.mjs`). No commit, no network needed.
- Verify the binding at your start and end: `node CoachingCore/scripts/verify-r7a1.mjs`. Its `freeze-current` check must pass; it prints a summary and writes nothing. Also recompute the source digest yourself.

## What changed (delta from R7A-FREEZE-2)

Diff: [RUNTIME_DELTA_R7A1.diff](RUNTIME_DELTA_R7A1.diff), against the byte-exact FREEZE-2 copy in [`freeze2-source/`](../freeze2-source/MANIFEST.json).

| File | Change |
|---|---|
| `src/r6-composition.mjs` (new, 213 lines) | The one composition model: `aheadOf` (C1), `withContextChange` (C2), `rebasedNext` / `conditionalNext` / `weekAsPlanned` (C3), the adaptation transforms and their replay (C4, C5), `composeWeeks` (C1–C6). Within `composeWeeks`: the planned weeks before a later `fromWeek` count for the run ceiling; rows of one slot keep the plan order; the week's `startBeforeReturn` is carried |
| `src/r6-adaptation.mjs` | Every handler that re-plans calls `composeWeeks`; every same-week adaptation goes through `adaptThisWeek` and is recorded; context changes go through `withContextChange`; final validation adds `duplicateRace` and validates under `skeletonOf(proposal)`. Also: a permanent equipment change ends earlier windows; a newer return of a break that began this week starts from `startBeforeReturn`; an event change reaches this week when it moves a remaining day into **or out of** the event window |
| `src/r6-program.mjs` | `skeletonOf` exposes the context in force per week (`sk.at`) and the latest equipment window; `projectWeeks` and `validateWeeks` build and check each week under its own context; D56 (one whole-count reading of the week for the caps); QE-R7A-12 (`progression` keeps the target under HOLD/REGRESS); `weekSummary` and `plannedStrengthOf` exported |
| `src/r6-provenance.mjs` | QE-R7A-05: field-by-field fill of the chosen entry from the agreeing report; a full tie is broken by content hash, not arrival |
| `test/r7a1-composition.test.mjs` (new, 17 tests) | The contract as metamorphic relations and properties (below), plus the tests that pin every mutation the first mutation run left alive |
| `test/r7a-semantic-core.test.mjs` | One scenario update (C11): the equipment-change review now includes the entry week's reports. Under C3 a complete, unreported week holds instead of assuming execution, so the old premise no longer exercised the entry-week rule. The assertion is unchanged |

## The model, in one paragraph

On FREEZE-2 each handler rebuilt the week from its own subset of the state. Now every re-planning handler (weekly review, the re-plan from next week, the re-plan of this week, equipment, goal and event change, schedule change, return) calls one function, `composeWeeks`. It keeps every row that is not *ahead* (C1, one shift-aware definition). It builds each week under the context in force for it (C2, `contextBefore` plus `sk.at`). It starts next week by one rule (C3): a return's re-base is kept; otherwise the evidence once the week is complete, or the conditional plan of the week as now planned while it is under way. It re-applies the week's recorded adaptations, in order and with their own clocks, to the new rows only (C4). It re-plans only the sports in scope (C6). Supersession (C5) and final validation (C7) close the set. Read the contract for the exact statements.

## The seven blockers: mechanism, fix, evidence

| Blocker | FREEZE-2 mechanism (your R7-A re-check) | R7-A.1 fix | Test (`test/r7a1-composition.test.mjs`) | Probe |
|---|---|---|---|---|
| QE-R7A-01 (HIGH) | `equipmentChange` projected from the pre-break state and never read `rebasedNext` | C3: next week's start follows one rule for every handler; a return's re-base is kept by any later change of the week; C6: an equipment change re-plans strength only | "C3: re-planning this week keeps the next-week start…": both orders and window or permanent; the entry week stays RETURN_ENTRY; the reviewed transition survives (E06/O-1) | composition probes E06; both handler grids |
| QE-R7A-03 (HIGH) | the return's wait kept the RACE row; `goalChange` forced `reachesThisWeek` false after a next-week return | C5: a newer event date is the event, and a change that reaches this week re-plans its remaining days whatever re-plans next week; C7: at most one race ahead (`duplicateRace`) | "C5/C7: a moved race replaces the earlier one in either order" | both grids (EVENT × RETURN pairs) |
| QE-R7A-19 | `rebuild(fromWeek=w)` re-projected from `stateTrace[w]`, dropping row-only adaptations | C4: adaptations are recorded on the week (`week.adaptations`) and re-applied on every re-plan | "C4: same-week adaptations and a later re-plan compose in either order" (fatigue, unavailable day, local fatigue × event change and equipment window) | both grids; E03, E04 |
| QE-R7A-02 | the short-return easy slot selected `date > asOfLocal` | C1 `aheadOf` everywhere (AM over at noon local; PM or no shift ahead until the day ends); the easy slot is an adaptation (`SHORT_RETURN_EASY`) and survives the review | "C1: same-day eligibility follows the chosen shift"; "C4/C5: a short return's easy slot survives the review" (E01) | your P2 |
| QE-R7A-05 | `mergeActual` kept one whole entry per exercise | the chosen entry takes each unknown load, reps or RIR from the other report's same set; full ties by content hash | "QE-R7A-05: an agreeing report never makes a known field unknown, in either arrival order" (7 × 7 field masks, both orders) | your P4, P5 |
| QE-R7A-12 | `advanceStrength` kept the target only on an exactly equal load | a logged known load is progression evidence: HOLD and REGRESS keep the repetition target; only establishment exposures take logged repetitions | "QE-R7A-12: a lighter known-load shortfall keeps the repetition target" | your P3 |
| D56 (engineering side; D53 family) | the review read a time-trimmed row as whole, so the regain and return caps rose or ended | one reading: the caps rise or end only after a week whose **last executed exposure** (the one giving the week's counts, R19) did its whole count after the time fit; legacy rows read their week's planned counts | "D56: trimmed weeks neither raise nor end the regain cap…" (all three representations); "D56/R19: the last executed exposure gives the week's counts" (your QE-R7A-22) | D56 grid |

### Ten more equivalent paths, found before any edit

`probes/r7a1-composition-probes.mjs`: on FREEZE-2 all eleven are defective (`.BEFORE.out.json`); on FREEZE-A1 none is (`.A1.out.json`).

| Path | What it does |
|---|---|
| E01 | Short return reported for next week, then the weekly review: the easy slot was lost |
| E02 | Dated schedule change (from week w+2), then a review: applied a week early |
| E03, E04 | Fatigue or an unavailable day, then an equipment change: the adaptation was lost |
| E06 | Weekly review, then an equipment change: the reviewed transition was lost (SSCTR O-1/R28) |
| E10 | Return this week, then a missed pre-break session moved into the re-entry |
| E11–E14 | A next-week schedule, goal or equipment change, then a re-plan of this week: the later context was applied to this week |
| D56 | Time-trimmed regain |

### Twelve more paths, found by the author before the freeze

Deeper checks, run before the freeze, found twelve more paths of the class. Each is now fixed, tested and pinned by a mutant:
- comparing the whole plan rather than the week and next week's start;
- checking that a later statement of one fact equals that statement alone;
- running the grid on every evening of the week;
- turning the mutation runs' survivors into tests.

Every path except the first five also exists on FREEZE-2 (R6 behaviour the composition had not yet covered).

| Path | What went wrong on the candidate | Fix |
|---|---|---|
| A dated schedule change, then another change from next week (or the reverse) | The dated change re-planned from its own week and counted only executed runs for the run ceiling, so the long run of its first week was 70 or 75 minutes by order | C3: the planned weeks before a later `fromWeek` count as executed, per the policy text |
| A window, then a permanent equipment change | The older window stayed recorded and would override the newer statement on its dates | C5: a permanent change ends earlier windows the day before it starts |
| An equipment change and a change that re-plans both sports, on a day with a race and a strength rest | The rows of one slot were ordered by which sports were re-planned | C1: rows of one slot keep the plan order |
| A 16-day return corrected to 5 days | The correction started from the start the first return had written, so the re-entry stayed | C5: `startBeforeReturn` |
| The race moved into next week, then postponed far | This week stayed a taper of the superseded date | C5: an event change reaches this week when it moves a day out of the event window too (sent to the SSCTR) |
| A missed key run, then a systemic fatigue report or a short return the same evening (or the reverse) | The later move placed a THRESHOLD after the fatigue report, or a quality run as the first one after the short break | C4: content an adaptation moves into a slot keeps the week's earlier adaptations (applied again to that slot) |
| Thursday made unavailable, then a missed Tuesday key run | The move used the skipped Thursday slot: a session on a day the athlete cannot train | C4: a move never uses a skipped slot |
| A systemic fatigue report on Sunday evening (nothing left to reduce), then the week's reports | The later review dropped the fatigue signal: next week advanced (4 sets) instead of holding (3) | C4: the signal is recorded (`SYSTEMIC_SIGNAL`) and later reviews of the week keep it |
| A return's wait over a skipped session; an event conflict over a rest day | A no-session day carried a skip status in one order only | C4: a waiting session is rest by design; a conflict skips sessions only |
| A goal change stated from a later date | Applied from next week | C2: from the first week that begins on or after its date |
| A change from a later week | That week started from the start written under its old context | C2: it starts from the week before it as planned, under its new context |

## Evidence

- **Tests:** `node --test` in `CoachingCore/` gives 495/495 (Node 24). The R7-A and R6 suites are unchanged except the C11 scenario above.
- **Monday handler grid** (`probes/r7a1-handler-grid.mjs`): two programs, every pair of 12–14 same-week changes in both orders on Monday morning.
  - Each pair is compared on the **whole plan** from that week: every week's rows in order and every later state.
  - 157 pairs. FREEZE-2: 84 defects. FREEZE-A1: 0 defects, 5 expected.
  - The expected pairs are order-dependent by meaning, and each one is **checked**, not assumed.
    - Two returns of one break, and two event dates: each order must equal its later statement alone.
    - Two adaptations of one week: their order may decide which slot carries a move or a skip, never a dose. Both orders must keep next week's start, no hard run after systemic fatigue, no session on an unavailable or conflict date, no quality run after a short return, and no run or set count above the planned.
- **Evening handler grid** (`probes/r7a1-handler-grid-midweek.mjs`): the same 15 changes on every evening from Tuesday to Sunday (20:00 and 21:00), compared and checked the same way.
  - It adds a missed past key session, mid-week partial and weekly reports, an event-week conflict, returns that re-plan the rest of the week and a fatigue report once nothing is left to reduce.
  - 1,188 pairs. FREEZE-2: 384 defects. FREEZE-A1: 0 defects, 16 expected (14 later-statement pairs, 2 adaptation pairs).
- **Representation only** (both grids; listed, not counted): in 16 Monday pairs and 54 evening pairs every row and state agree, but context records differ.
  - These are the arrangement annotations, or an arrangement entry for a phase context no remaining week uses, and a redundant `contextBefore` boundary.
  - A three-step search reached no row or state (`probes/r7a1-representation-three-step.mjs`): 172 sequences. Each of the 16 Monday pairs is followed by a third change (schedule, turn, goal, equipment back, event earlier or later), the same day or after the weekly review. The evening pairs are the same kinds of change.
- **D56 grid** (`probes/r7a1-d56-grid.mjs`): 144 timelines (re-establishment or 16-day return; 3 goals; known or no exercises; one or two 25–35 minute days; budget kept or raised to 75).
  - Caps rising or ending after a trimmed week: 54 of 70 on FREEZE-2, 0 of 196 on FREEZE-A1.
  - Capped exercises more than one set above the largest count executed: 20 on FREEZE-2, 0 on FREEZE-A1.
  - 30 uncovered jumps, identical on both: accessories no ceiling covers (dead-bug, and FROM_LOG calf raise and split squat). They come back from 1 to 3 sets when the budget is raised. This is the SSCTR's R23 class, sent to the SSCTR.
- **SSCTR round-12 instrument** (a byte copy): on FREEZE-A1, every section equals its R7-A CYCLE2 output (FREEZE-2), apart from the instrument's own path in three error strings and one named value.
  - The named value: after an event postponement, the race statement is 30 instead of 25 minutes (`V_D47reviews.goalChange.moveDate`). It comes from the symmetric event-window rule (SSCTR dossier S9).
  - The instrument's own condition holds.
  - `verify-r7a1.mjs` accepts exactly this difference.
- **Mutation** (`probes/mutation-check-r7a1.mjs`): 73 single-fix reverts (the 34 R7-A reverts re-anchored, 39 R7-A.1) in a temporary copy, against the R7-A and R7-A.1 tests: 72 caught. The R7-A survivor (`Counts from the first executed exposure`, QE-R7A-22) is now caught by the D56/R19 test. The one survivor is documented (below).
- **Regression** (`CoachingCore/r7/a1/REGRESSION_R7A1.json`; REGRESSION / challenge reuse, not generalization evidence). Every difference is named in `verify-r7a1.mjs` (`EXPLAINED`).
  - Against FREEZE-2: R5 24/24, profiles 16/16, simulations 13/14, R6 holdout 30/35, with no status change.
  - Against the R6 closure: R5 24/24, profiles 15/16, simulations 10/14, R6 holdout 22/35. The only status change is R6-H23, from R7-A.
- **Objective verifier:** `node CoachingCore/scripts/verify-r7a1.mjs` (read-only without `--write`). It re-runs the four R7-A.1 probes and requires their recorded outputs. It checks:
  - baseline preservation (1,266 files, mission files insert-only);
  - the freeze, the unchanged policy and the tests;
  - the regression, the instrument and the mutation;
  - review binding, the queue and the deliverables.
  - Before the reviews, only `independent-reviews` and `deliverables` can fail.

### Differences from FREEZE-2 in the regression corpus, by clause

| Case | Difference | Clause |
|---|---|---|
| R6-H22, R6-H25 | A re-plan from next week reported mid-week now starts next week from the conditional plan of the week as now planned. It was HOLD. H22: two accessories go 1→2 sets in week 8. H25 (new goal): dead-bug 14→12 repetitions and strides 4→5 | C3 |
| R6-H24 | An equipment window reported Sunday evening, after a complete week with no reports: next week starts from the week's evidence, so it holds. FREEZE-2 assumed execution. One accessory 2→1 set | C3 |
| R6-H26 | The return-week Monday lifting predates the return. It no longer counts as done in next week's conditional plan, so the goblet squat enters at the return entry in week 9 (1x8 @RIR4) instead of the post-entry step (2x8 @RIR3). The return week's rows are unchanged. Its totals are now the sum of its rows (90 min / 18 sets, history rows included); FREEZE-2 reported the whole-week re-entry rebuild (65 / 10) | C5; totals bookkeeping |
| R6-H29 | In race week, an event-period conflict over Wednesday to Friday: the Thursday strength rest (no strength in the last 3 days) keeps its rest instead of being marked skipped. Same decision and doses | C4 (a conflict skips sessions only) |
| T05 | An evening return no longer rewrites that morning's run (its shift is over): 45 instead of 40 minutes, then +5 minutes on two later easy runs | C1 |

The sporting side of these is in the SSCTR dossier.

## Known residuals (stated, not hidden)

1. **Shift granularity (QE-R7A-23).** The plan knows only the chosen shift. An AM session is over at noon. A PM or unspecified session stays ahead until the day ends, so an evening re-plan before a late PM report can still re-plan that PM row. The report then binds to the re-planned row.
2. **Adaptation × adaptation order.** Two adaptations of one week each apply to the week as it stands when reported (C4), so their order can decide which slot carries a move or a skip (for example, a missed key run moved and then made easy, or not moved). The grids check every such pair against the restrictions of both adaptations and the planned doses (4 pairs: 2 Monday, 2 evening).
3. **Week totals.** These are the summed rows before same-week adaptations (as before R7-A.1). The R6-H26 return week now sums its rows.
4. **Context records (representation only).**
   - Segments of `contextBefore` that only cover past weeks are pruned at the next context change, not on every review, and two orders can leave a redundant segment boundary.
   - An arrangement record keeps the annotations (sample rows, interference costs) of the templates in force when it was chosen. A permanent equipment change keeps the arrangement: substitution never rearranges the week (R6). An entry for a phase context that no remaining week uses is kept.
   - None of these reaches a row or state in the grids or in the three-step search (`probes/r7a1-representation-three-step.mjs`). The regression filter ignores `contextBefore`; the rows and decisions they shape are compared.
5. **Mutation survivor:** `A1 C7 two races ahead pass validation` (documented in the mutation script). It is a fail-closed guard of the final validation for a state no known composition path produces. The class it guards (an event change that leaves the earlier race) is pinned through its cause by the QE-R7A-03 test and the C3/C5 mutants. It is kept as defence in depth.
6. **R23 class** (uncovered jumps above): sent to the SSCTR; unchanged from FREEZE-2.
7. **Out of scope** (not among the seven; unchanged): your R7-A LOW items QE-R7A-13, 20 and 21.

## What to return

Write `audits/domain-coaching-r7a1-2026-10-27/reviews/quality-engineering-r7a1-review.md` and a machine-readable `quality-engineering-r7a1-review.json` with at least:

```json
{
  "revision": "R7A1-QE-r1",
  "reviewer": "quality-reliability-engineer (fresh instance)",
  "gate": "R7A1_ENGINEERING_REVIEW",
  "freezeReviewed": {"revision": "R7A1-FREEZE-A1", "file": "CoachingCore/r7/a1/RUNTIME_FREEZE_R7A1_FREEZE_A1.json", "sourceDigest": "<recomputed>", "policyHash": "<recomputed>"},
  "verdict": {"R7A1_ENGINEERING_REVIEW": "ACCEPT | NOT_READY", "reason": "..."},
  "blockers": [{"id": "QE-R7A-01", "status": "CLOSED | OPEN", "evidence": "..."}],
  "newFindings": [{"id": "QE-R7A1-01", "severity": "HIGH | MEDIUM | LOW", "material": true, "class": "...", "mechanism": "...", "reproduction": "...", "requiredChange": "..."}],
  "equivalentPathsSearched": ["..."],
  "integrityRecommendations": {"WEEK_COMPOSITION_INTEGRITY": "...", "STATE_PRESERVATION_INTEGRITY": "...", "EVENT_SUPERSESSION_INTEGRITY": "...", "EXERCISE_MERGE_INTEGRITY": "...", "RETURN_RECOVERY_CEILING_INTEGRITY": "..."}
}
```

- Mark a finding `material: true` only if it blocks: a wrong prescription or state, lost or rewritten history, or a blocker not closed by its mechanism.
- The bound allows **one** correction cycle with material findings only, then one narrow re-check of FREEZE-A2. There is no third cycle.
- State what you ran. Recompute the digest at the end; it must still equal `2de8681f13e5cb499df6a5a3dc443d52877850528ceb298b598d03de6ec2141a`.
