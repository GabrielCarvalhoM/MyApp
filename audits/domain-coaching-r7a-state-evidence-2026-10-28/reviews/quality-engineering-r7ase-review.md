# COACHING CORE — STATE EVIDENCE MODEL engineering review (R7ASE-QE-r1)

**STATE_EVIDENCE_ENGINEERING_REVIEW = NOT_READY on STATE-EVIDENCE-FREEZE-1.** This is the single engineering review of the single freeze. No correction cycle follows it (Founder request §27).

**The answer to Founder §28 is yes.** Two normal V1 paths consume a value that only a projection made as a historical fact, without evidence pertinent to that value:

1. **History (QE-R7ASE-01).** When the athlete lifts a projected load, `atDose` promotes the stored start's whole dose, including its **load ticks**. When the projection ran two weeks ahead of history, the tick at the new load counts an exposure the athlete never executed. The result:
   - two ledgers that are identical field by field give different histories (tick 1 against tick 0);
   - the rebuilt value is marked `rebuilt: true`;
   - after a SHORT return, the next load step comes one exposure early.
2. **Planning (QE-R7ASE-02).** The planner's D52 re-establishment threshold ("in calendar days from its last executed exposure") reads a projected last-performed date, a Saturday the athlete never trained. It does so after several weekly reviews had the facts. Result: 35 days after the last real exposure, the plan prescribes a known 22 kg the athlete never lifted, where the same facts reviewed one week earlier prescribe the D52 re-establishment by effort.

Both are new, material manifestations of projected-vs-historical (Founder §1, §2, §13, §16; I1, I2, I5). **QE-R7AB-01's own recorded path is closed** (P40 and its variants, at four time zones).

| | |
|---|---|
| Material | **QE-R7ASE-01 (MEDIUM)**: `atDose` carries the projection's load tick into history. **QE-R7ASE-02 (MEDIUM)**: the planner's D52 threshold reads a projected last-performed date as the last executed exposure. The same E1 class also reaches return-step doses (P52) |
| Not material | **QE-R7ASE-03 (LOW)**: a run value kept through an unreviewed week (E2) can be ahead of its reviewed control (`run.long` 70 against 65). It is a review's step, not a projection. **QE-R7ASE-04 (LOW)**: a fresh exercise's history inherits the planning view's entry-week flag (cross-exercise) |
| Closed | QE-R7AB-01 (its path), QE-R7AF-01, QE-R7AF-02, QE-R7A-01, QE-R7A1-09, QE-R7A1-10, QE-R7A2-01, QE-R7A2-02 (engineering), QE-R7A2-03 |
| Preserved | Week composition, event supersession, exercise merge, identity. Evidence: 64 of 64 engineering re-runs byte-identical to the author's outputs; 46 byte-identical to R7A-BOUNDARY-FINAL-FREEZE, and the 17 that differ are exactly the author's named differences; 555/555 tests |

**Who did this.** I am the Quality & Reliability Engineer (constitution 1.3.0), a fresh instance (claude-opus-5-5, effort max).
- I did not write this runtime and changed nothing under `CoachingCore/`.
- I rule on no sporting dose; dose size is the SSCTR's.
- Everything I wrote is in this folder with the prefix `qe-r7ase-`, except this file and its JSON.

## Freeze checked

STATE-EVIDENCE-FREEZE-1: `CoachingCore/r7/state-evidence/RUNTIME_FREEZE_STATE_EVIDENCE.json`.

| Check | Start (22:01 UTC) | End (22:34 UTC) |
|---|---|---|
| Source digest, recomputed (canonical `hash()` of the `src/*.mjs` SHA-256 map, as in `freeze-r7ase.mjs`) | `692483ce5147d90797441baf2ac73c9d433197bd40047f147202ca4e4bff2cc1` | `692483ce5147d90797441baf2ac73c9d433197bd40047f147202ca4e4bff2cc1` |
| Freeze file SHA-256 | `a8683cbad60fd7f7b9da8b09e5c44bc74a55c6a2445e744606d37dbc6fde69f7` | same |
| Bound files that differ from the freeze (src, tests, policy, fixtures, package) | 0 | 0 |
| Policy | R6-POLICY-5 `18ec48f3…`, unchanged | same |
| `node CoachingCore/scripts/verify-r7ase.mjs` (no `--write`) | 15/17. Open: `independent-reviews`, `deliverables`, as expected | After this review's JSON was written (digest re-checked unchanged): 16/17. `independent-reviews` passes, with both review JSONs bound to the digest; `deliverables` is open (`qe-r7ase-verify.end.out.json`) |
| `node --test` (CoachingCore, Node v24.19.0) | 555/555 | — |

Files: `qe-r7ase-digest.mjs`, `qe-r7ase-digest-{start,end}.out.json`, `qe-r7ase-verify.start.out.json`, `qe-r7ase-node-test.out.txt`.

## What I ran

Every script loads the runtime read-only, uses synthetic data and the DEV_TEST_ONLY authority, and prints only. "BOUNDARY" means the same script also ran against the byte-exact `boundary-freeze-source/` copy, pointed to by `QE_LIVE_ROOT`.

**The author's evidence, re-run by my own harness** (`qe-r7ase-rerun.mjs`; outputs in `qe-r7ase-runs/rerun/`, summary in `qe-r7ase-rerun.out.json`):
- Scope: every engineering job of `probes/EVIDENCE_RUNS_R7ASE.json`, 64 runs, with the SSCTR grids and instrument excluded.
- **64 of 64 are byte-identical to the author's recorded outputs.** They include the §28 probes P13, P14, P17, P19, P20, P21, P30b, P30c and P31 at UTC, +9, −5 and −10; P09 at two seeds; the R7-A.1 grids; and the four self-challenges. This mission's self-challenge has 0 violations, and 52 on the boundary copy, as claimed.
- I then compared my re-runs with the R7-A boundary mission's recorded outputs myself (`qe-r7ase-compare-boundary.out.json`). 46 are byte-identical. The 17 that differ are exactly the ones `probes/COMPARE_R7ASE_NAMED.json` names: P30, P30b, P40 ×4, P40b, P40c, P41, P44, P46.F1, P47, P47b, and three self-challenges.
- I ran the author's E6 oracles (`probes/scratch/p30b-oracle.mjs`, `p47-oracle.mjs`, print-only) into `qe-r7ase-runs/author-*`.

**The required probes, before and after** (`qe-r7ase-runs/`):

| Probe | R7A-BOUNDARY-FINAL-FREEZE copy | Frozen bytes |
|---|---|---|
| P40, UTC, +9, −5, −10 | Identical to the predecessor's outputs (only the `runtime` label differs). U: B's entry holds `db-rdl` and `db-split-squat` at 22 kg | U = R at all four time zones: 20 kg. U's planning view still holds 22 kg, so the plan still projects 22 (Founder §18) |
| P40b, P40c, P41, P47b | Identical to the predecessor's outputs | P40c: ceiling 20. P41: projected counts gone. P47b: equal to its control. P40b: every remaining U-against-R difference is one of: U behind R; a load the athlete lifted (reps unlogged); `run.long` (QE-R7ASE-03); or, in cells 8–9, a repetition target U keeps from history (7) where R's review adopts the logged repetitions (6). The last is QE-R7AB-02's class, and U is ahead there; the author's named note omits it (`qe-r7ase-scratch-p40b-reps.mjs`) |
| QE-R7AF-01 (P30c, P30b) | — | P30c byte-identical to the boundary freeze: every cell gives the control's start. P30b: only Sunday cells differ, per E6 (below); no run step ahead; every Monday cell equals the control |
| QE-R7A2-01 (P17, P19, P20, P21); QE-R7A1-09/10 (P13, P14); identity (P31 at four time zones) | — | Byte-identical to the boundary freeze |

**My own probes** (each `.mjs` with its `.out.json`):

| Probe | What it attacks | Result |
|---|---|---|
| `qe-r7ase-P50-reestablish-projected-date` (+3 time zones, +BOUNDARY) | Planning after facts: P40's U/R split, then Saturday's lift missed through week 6, each week reviewed. Per week: the planning view, history (a what-if return evaluated but never applied), and the Saturday rows | **QE-R7ASE-02** |
| `qe-r7ase-P51` | `atDose` tick, projection one week ahead (consolidation week) | U = R3 (no tick to carry): no finding |
| `qe-r7ase-P51b` | `atDose` tick, projection two weeks ahead (development weeks), target met | U `tick 1`, R6 `tick 0`; U steps a week earlier |
| `qe-r7ase-P51c` (+3 time zones, +BOUNDARY) | As P51b, the 24 kg lift falling short: reps 3 of 5, reps unlogged, or RIR 0 | **QE-R7ASE-01**: no success at 24 kg in the record, yet U `tick 1` |
| `qe-r7ase-P51d` (+2 time zones) | P51c with **identical ledgers** | **QE-R7ASE-01** confirmed: ledgers equal, histories differ |
| `qe-r7ase-P52-fresh-exercise-entryweek` | Cross-exercise inside a return (P44's history): a fresh substitute exercise, full entry diff | QE-R7ASE-02's class in return-step doses; QE-R7ASE-04 |
| `qe-r7ase-I01`, `qe-r7ase-I02`, `qe-r7ase-I02b` | Instrumentation: the run value through an unreviewed week; same-facts premise checks | QE-R7ASE-03; P50's cells hold the same facts; P51c's differ only in two other exercises' loads, hence P51d |
| Scratch: `qe-r7ase-scratch-phases`, `-traj`, `-p40b-reps` | The default program's phases and projected trajectory; P40b's rep difference | Used to place P51b–P51d; QE-R7AB-02's class (below) |

**Not run:**
- `npm run verify` and `simulate`;
- any `verify-r*.mjs` with `--write`;
- any `freeze-*`, `prepare-*`, `queue-*` or `regress-*` script;
- the evidence runner (`run-evidence-r7ase.mjs`) and any `ssctr-*` runner or instrument;
- the author's `mutation-check-r7ase.mjs`, whose output (23/23 caught) I read but did not re-derive;
- the author's `probes/scratch/se-scratch-holdout.mjs`, which writes files.

## QE-R7AB-01: closed on its path

Its recorded reproductions fail on the boundary copy and pass on the frozen bytes:
- **P40:** U equals R (20 kg) at four time zones, while U's plan still prescribes 22 kg (historical 20, projected 22).
- **P40c:** the MODERATE ceiling is 20.
- **P41:** the never-executed counts are gone.
- **P47b:** equal to its control.

The mechanism the predecessor described (a review stamping `WEEK_EVIDENCE` on values it carried from a projection) is fixed: those values are recorded as `projectedBase` and rebuilt by history.

The class it belongs to is not closed. QE-R7ASE-01 is a projected value that reaches history through the very rebuild that closes QE-R7AB-01.

## QE-R7ASE-01 (MEDIUM, material; projection consumed as history): a lifted projected dose carries a load tick the athlete never executed

**What the contract says.** Contract §5: "A projected dose the athlete then lifted is a fact... the exercise enters the week at that dose: its load, repetitions and load ticks, **the step the projection took and the athlete then took**."

**What the code does.** `atDose` (`src/r6-adaptation.mjs:714–720`):
- It applies when the week's deciding log equals the known load the row prescribed from the stored start, and history holds another load.
- It then replaces the exercise with `{...h, load: s.load, reps: s.reps, loadTick: s.loadTick}`, where `s` is the **stored (planning) start**.
- The load is evidenced; the repetitions and the tick are not checked against anything.
- `atDose` feeds every history path: the facts read onto history (`factsOf`), the review's rule rebuilt on history (`ruleOn`) and the break's own week (`stateAtBreak`).

When the projection ran more than one week beyond history, the stored tick at the new load includes an exposure at that load which the projection assumed and the athlete never executed.

**Reproduction** (`qe-r7ase-P51d-identical-ledgers.mjs`; also `P51c` at four time zones and `P51b`). Default synthetic profile; every input is an ordinary report or review accepted by `evaluateProgram`.
1. Weeks 0–4 are trained and reviewed. Week 5 starts `db-rdl` and `db-split-squat` at 22 kg, tick 1, as history.
2. Weeks 5 and 6 (DEVELOPMENT) are executed except Saturday's lift and reported day by day, with Sunday's run synced Monday 06:00.
   - Cell **U**: neither week is reviewed. The projection runs: week 6 at 24 kg tick 0 (week 5's Saturday assumed lifted: the step), week 7 at 24 kg **tick 1** (week 6's Saturday at 24 kg assumed lifted).
   - Cell **R6** (control): the same facts, with week 6 reviewed Sunday 21:00. Week 7 starts at 24 kg tick 0.
3. Week 7: Saturday's lift is done at the prescribed 24 kg but falls short: 3 of 5 repetitions, or repetitions unlogged. Every other exercise is reported at the same loads in both cells, and the week is reviewed. **The two ledgers are equal field by field** (`ledgersEqual: true`).
4. B: a 2-day trip, Tuesday–Wednesday of week 8, reported Thursday 06:00. It is SHORT and resumes the state.

| | B's `db-rdl` / `db-split-squat` | Per-value basis | Saturday rows after B (`db-rdl`) |
|---|---|---|---|
| U | `KNOWN24 tick 1` / `KNOWN24 tick 1` | `WEEK_EVIDENCE`, week 8, `rebuilt: true` | 01-02 24 kg, **01-09 26 kg**, 01-16 26 kg |
| R6 | `KNOWN24 tick 0` / `KNOWN24 tick 0` | `WEEK_EVIDENCE`, week 8, `rebuilt: true` | 01-02 24 kg, 01-09 24 kg, 01-16 26 kg |

**The record.**
- The only exposure at 24 kg is 12-26, with `repsMet = false` (or `null` when reps are unlogged).
- Under the 2-tick LOAD rule, no tick at 24 kg is evidenced in either cell.
- U's tick is week 6's missed Saturday, as the projection assumed it.
- The step after the return comes one exposure early: 26 kg on 01-09 instead of 01-16.
- Identical at UTC, +9, −5 and −10.
- The boundary copy gives the same numbers through its old whole-start rule. This mission's rebuild did not remove the value; it now reaches history by another copy.

**Why it is material.**
- **Founder §1, §11, I1, I3.** A tick counts successful exposures at a load. A projection's assumed success is promoted to a historical count without the execution that would support it.
- **§13, I5 (partial evidence remains partial).** The lifted load is evidence for the load, not for the tick, yet the tick is filled from the projection.
- **I2 at value scale.** The load's evidence lends its authority to the other atoms of the dose tuple.
- **P7.** Identical facts give different histories depending only on whether week 6 was reviewed, and the unreviewed cell is ahead.
- **Contract §5.** Its own justification ("the step... the athlete then took") does not hold for the second projected week.
- **A common V1 path.** Two consecutive weeks whose last session syncs the next morning (QE-R7AB-01's premise, twice), then a lift that misses reps or lacks a rep count.
- **MEDIUM, not HIGH:** identity is never wrong, and the effect is one progression step, the same size as QE-R7AB-01. Dose size is the SSCTR's.

**Coverage gap in the author's evidence.**
- Test "families B, I" checks the tick only where the projection ran one week ahead (stored tick 0).
- The mutation set has the opposite direction ("a tick counted at the earlier load is carried onto the lifted one"), not this one.

**Founder §32**
- **Reproduction:** `reviews/qe-r7ase-P51d-identical-ledgers.mjs` (cell U against R6; identical ledgers), with `qe-r7ase-P51c-…` (four time zones, BOUNDARY) and `qe-r7ase-P51b-…`.
- **State atom that lost its provenance:** the strength exercise's `loadTick`, the count of successful exposures at the current load (`db-rdl`, `db-split-squat`). By the same code, also `reps` where the goal progresses repetitions (inferred, not run). Its recorded basis says `WEEK_EVIDENCE … rebuilt`; its real provenance is CONDITIONAL_PLAN week 7's assumption about week 6.
- **Does the failure come from the chosen granularity?** Yes. Contract §3 makes one strength exercise one value (load, repetitions, ticks, …). `atDose` promotes that value's dose tuple on the evidence for one atom (the load), which is a container-level promotion inside the value. Finer atoms (the load from the log; the tick from executed successes at that load) would not leak.
- **Would HistoricalState and PlanningProjection need to be physically separate structures?**
  - Not for this instance. A narrow change (promote only the load and re-derive the tick from executed exposures) would close it inside the current model.
  - The pattern argues otherwise. History is reconstructed by copying values out of the planning record under per-value conditions, and every copy rule must be exact per atom. QE-R7AB-01 was one copy rule (a review's carried values). This is another, introduced by the fix itself.
  - A HistoricalState advanced only by executed evidence, never initialized from `stateTrace` except at the intake and a return's entry, removes the class structurally rather than rule by rule.
  - That is my engineering recommendation for the Founder's decision.

## QE-R7ASE-02 (MEDIUM, material; projection consumed as history): the planner's D52 threshold reads a projected last-performed date as the last executed exposure

**What the contract says.**
- E1: "Planning reads the planning view: its rows, including the re-establishment threshold (D52)…".
- "History never reads them as facts. A plan made before facts arrive cannot know them, and **the next review reads the facts**."
- The consumer audit classes `strengthCandidate` / `needsReestablishment` under E1 with the same rationale.

**What the code does.**
- The D52 predicate is `dayGap(ex.lastPerformed, date) > moderateMaxDays`, with 28 days in R6-POLICY-5 (`src/r6-program.mjs:335`).
- Its row comment reads "in calendar days from its last executed exposure (SSCTR D52)", and its note template reads "Not done for more than 28 days **as of the last review**" (`:360–362`).
- It reads `lastPerformed` from the planning start.
- A weekly review updates `lastPerformed` only for an exercise performed that week (`advanceStrength`, `:526`, via `evidenceStart`). A planned date carried from an unreviewed week therefore survives every later review in which the exercise is missed.
- The review itself computes the historical value: `projectedBaseOf` names the exercise as carried, and history gives the real date. The planner never reads it.

**Reproduction** (`qe-r7ase-P50-reestablish-projected-date.mjs`):
1. P40's split: week 2 executed except Saturday's lift.
   - Cell **U**: week 2 is never reviewed.
   - Cell **R**: the same facts, reviewed. `qe-r7ase-I02` checks that both ledgers hold the same facts.
2. Weeks 3–6: Saturday's lift is missed again and each week is reviewed Sunday 21:00. `db-rdl` and `db-split-squat` were last executed on 2026-11-14 (20 kg).

| Week | U planning view (`lastPerformed`) | U history (what-if return, not applied) | Saturday rows U | Saturday rows R |
|---|---|---|---|---|
| 3–5 | KNOWN22, **2026-11-21** | KNOWN20, 2026-11-14 (week 3: carried from week 2; weeks 4–6: `rebuilt`) | KNOWN22 (the plan's projection; allowed, §3) | KNOWN20 |
| 6 (2026-12-19, 35 days after the last exposure) | KNOWN22, **2026-11-21** | KNOWN20, 2026-11-14 | **`db-rdl 3x5@3 KNOWN22`, `db-split-squat 2x6@3 KNOWN22`** | `db-rdl 2x5@3 ESTABLISH REESTABLISH`, `db-split-squat 2x7@3 ESTABLISH REESTABLISH` |

On 12-19 the gap from the projected date is 28 days, which is not more than 28, so the planner skips the re-establishment D52 requires (35 days from the last executed exposure). It prescribes a known 22 kg the athlete never lifted.

The result is identical at four time zones. The rows are identical on the boundary copy: the planner did not change in this mission, and only history did. The class also reaches return steps:
- **P52 (P44's history):** after week 5's re-entry Wednesday was missed and reported, a Monday handler plans week 6 at return-step doses (`db-bench-press 2x6@3 RETURN_STEP`, `goblet-squat 2x5@3 FIRST_ESTABLISH`), from the projected return step 1.
- **Control:** the same facts reviewed plans the entry again (`1x6@4 RETURN_ENTRY`, `goblet-squat 1x5@4 RETURN_ENTRY`).

**Why it is material.**
- **Founder §28** asks about any normal V1 path, and **§21** puts planning consumers in scope: "consumers that treat `state.*`, `weekStart.*`, `stateTrace.*` … as if any value present were factual".
- D52's predicate is a statement about history. The value it reads is a projection the record contradicts at the time of the decision.
- **§16:** planning may combine historical facts with *valid* projections. A past exposure the record shows was not executed is not a valid projection.
- **E1's justification fails here.** These plans are made by reviews after the facts arrived, and no review reads the fact for an exercise it does not see performed.
- **I7 is not at stake.** Reading the historical date for a history-defined predicate takes no progression away from the planner (the 22 kg target may still be projected). It applies the safety rule on the real date.
- **MEDIUM:** one session per unreviewed missed week. The dose is the SSCTR's.

**Founder §32**
- **Reproduction:** `reviews/qe-r7ase-P50-reestablish-projected-date.mjs` (cells U against R, four time zones, BOUNDARY); also `reviews/qe-r7ase-P52-fresh-exercise-entryweek.mjs` for the return-step instance.
- **State atom that lost its provenance:** the strength exercise's `lastPerformed` in the planning view (`stateTrace[k].strength.exercises[id].lastPerformed`), read as the last executed exposure by `needsReestablishment`. In P52 it is the exercises' `returnStep`, read by the row's exposure kind.
- **Does the failure come from the chosen granularity?** No. The value is correctly identified (`projectedBase` names it) and history is right. The failure is in the view assignment: a planner predicate defined on executed history reads the planning view (contract E1, too broad).
- **Would HistoricalState and PlanningProjection need to be physically separate structures?** Separate read paths are needed: history-defined predicates inside the planner must take their atoms from the historical view. Physical separation is one way to enforce it, not the only one. A single record serving both views is what lets such a predicate silently read a projected atom.

## Other findings (not material)

**QE-R7ASE-03 (LOW, not material, other): E2 lets an unreviewed week's run value be ahead of its reviewed control.** Reproduction: P40b cells 7–9 and `qe-r7ase-I01-sundaylong-trace.mjs`.
- B's run is `rebuilt` (week 4's start records `projectedBase: true`), yet its `long` is 70 against R's 65. Only 65-minute long runs were ever executed.
- The 70 is week 2's evidence start: week 1's review stepped the executed 65 to 70. Week 2's capped prescription (65) is what R's review "continues from" (the cap-trim rule). U never reviews week 2, and E2 does not re-gate it.
- The kept value is a review's step, never a projection's, so this is not §28's class.
- It is one atom where U is ahead of R, which E2's "conservative everywhere else" does not cover. For the SSCTR: a SHORT return then resumes a 70-minute long run never executed.

**QE-R7ASE-04 (LOW, not material, other): a fresh exercise's history inherits the planning view's entry-week flag.** Reproduction: `qe-r7ase-P52-fresh-exercise-entryweek.mjs`.
- In a reviewed start, a fresh exercise is "held" and takes the stored value. The planning review set that value up with the planning view's `entryWeek` (other exercises' projected return steps), and `ruleOn` also passes `entryWeek: st.strength.entryWeek` from the stored start.
- B's `goblet-squat` in U is established outside the return (`regainCap 3`, `lastExecutedSets 2`); in R it is at return step 1.
- U's atoms match the row the athlete executed (`2x5@3 FIRST_ESTABLISH`), so no unexecuted value enters. It is a cross-exercise dependence on projected state (Founder §12, family E) to remove with QE-R7ASE-02.

**Interpretation point for the Founder (no finding).**
- After a review steps a load from evidence (20 kg × target met → 22), the runtime's historical "load" is the evidence-gated next load. Example: P40b cell R `saturdayLift/nothing` holds `db-calf-raise` 22 kg, never lifted.
- This matches contract §4 (a review built on history is history) and every earlier control.
- Founder §3's canonical example calls "next prescribed load = 22 kg" projected. If "historical load" must mean the last load lifted, the state machine's `load` atom conflates the two meanings, and that is a Founder decision.

**Earlier LOW findings, unchanged:**
- **QE-R7AB-02** (P46.F1, named). Its class also shows U *ahead* in one atom: P40b cells 8–9 (`qe-r7ase-scratch-p40b-reps.mjs`).
  - An exactly executed strength week verifies the projection, whose transition keeps the earlier rep target (7).
  - The review adopts the logged repetitions (6).
  - It is an earlier historical value, not a projection, so it is not §28's class. It does contradict E3's "U ≤ R" for that atom.
- **QE-R7AB-03** (P45b, byte-identical to the boundary freeze).

## Blockers

| Id | Status | Evidence |
|---|---|---|
| **QE-R7AB-01** | **CLOSED on its path**; its class is open as QE-R7ASE-01 | P40 at four time zones, P40b, P40c, P41, P47b, each before and after |
| QE-R7AF-01 | **CLOSED** | P30c byte-identical to the boundary freeze (control's start in every cell); P30b: Sunday cells per E6, no run step ahead, Monday cells equal the control |
| QE-R7AF-02 | **CLOSED** (Founder §11) | P37, P45 byte-identical |
| QE-R7A-01 | **CLOSED** | P13, P14, P17, P19, P20, P31 at four time zones, P35, P38 byte-identical |
| QE-R7A1-09 | **CLOSED** | P17, P19, P31 at four time zones, P35, P37 byte-identical |
| QE-R7A1-10 | **CLOSED** | P14, P20, P35 byte-identical |
| QE-R7A2-01 | **CLOSED** | P17, P19, P31 byte-identical |
| QE-R7A2-02 | **CLOSED** (engineering) | P18, P32 byte-identical |
| QE-R7A2-03 | **CLOSED** | P21, P38 byte-identical |
| **QE-R7ASE-01** | **OPEN (material)** | P51d, P51c, P51b |
| **QE-R7ASE-02** | **OPEN (material)** | P50, P52 |

## Rulings on the declared boundaries

| # | Ruling | Why |
|---|---|---|
| E1 | **Rejected in part** | Accepted for projections of the future: targets, loads and steps (§3, §15, I7), and counters a plan made before the facts arrived (the H35 rationale, test "I7, I10"). Rejected for planner predicates defined on executed history that are evaluated after the facts arrived. Its rationale "the next review reads the facts" is false for atoms a review does not move: D52 (QE-R7ASE-02) and the return-step kind (P52) |
| E2 | **Accepted, with QE-R7ASE-03** | The kept run value is a review-built evidence start, never a projection (I01: a carried run is `rebuilt`). The one non-conservative atom is QE-R7ASE-03 |
| E3 | **Accepted** | Per sport, U behind R wherever a week is not executed as assumed (P40b, P46, P51d's `db-calf-raise`). Its "U ≤ R" does not hold for the rep target of an exactly executed week (QE-R7AB-02's class, above): not a projection |
| E4 | **Accepted** | The record at the cut decides; consistent with I6. Not tested: gate time windows (EARNED surplus) shifting between the review's clock and the cut |
| E5 | **Accepted for planning; its history claim fails for the tick atom** | "Weeks never reported are not history" holds for the stored values. Through `atDose`, an assumed exposure can still become a tick (QE-R7ASE-01's mechanism; inferred for unreported weeks, not run) |
| E6 | **Accepted** | P47: all 12 Monday cells and every true no-op cell equal the control. The 18 differing cells are the Sunday cells of the three handlers that apply the review's rule. The author's oracles show each equals a Sunday review for the sport it re-planned and the control for the other (P30b: 4 cells, same). Per sport, as SSCTR R40, and history still rebuilds what such a handler carried |

## Integrity recommendations (engineering scope)

| Verdict | Recommendation | Why |
|---|---|---|
| VALUE_SCOPED_EVIDENCE_AUTHORITY | **NOT_READY** | QE-R7ASE-01: promotion inside one value; QE-R7ASE-02: a planner predicate reads a projected atom as fact |
| HISTORICAL_STATE_INTEGRITY | **NOT_READY** | QE-R7ASE-01 |
| PLANNING_PROJECTION_INTEGRITY | **NOT_READY** | QE-R7ASE-02. The planner does keep projecting (P40: 22 kg), but a projection stands in for a fact in its own history-defined predicates |
| STATE_PRESERVATION_INTEGRITY | **NOT_READY** | P51d: identical facts, different state at a return, depending on a review |
| WEEK_START_STATE_AUTHORITY | **NOT_READY** | A rebuilt `WEEK_EVIDENCE` value carries a projected tick (QE-R7ASE-01) |
| RETURN_RECOVERY_CEILING_INTEGRITY (engineering) | **NOT_READY** | A SHORT return resumes a projected tick (P51d). Load ceilings hold (P40c: 20). Dose size is the SSCTR's |
| WEEK_COMPOSITION_INTEGRITY | **READY** | P01–P10, P15, P16, P09 (two seeds) and the R7-A.1 grids byte-identical to the boundary freeze; 555/555 |
| EVENT_SUPERSESSION_INTEGRITY | **READY** | P31 at four time zones, P34 byte-identical; P09 (two seeds) O1–O4, O6, O7 empty, byte-identical |
| EXERCISE_MERGE_INTEGRITY | **READY** | P07 byte-identical (`66405732…`) |

## Proven, inferred, not tested

- **Proven (run on the frozen bytes):**
  - QE-R7AB-01's path closed (P40 ×4 time zones and variants);
  - QE-R7ASE-01 (P51b, P51c ×4 time zones, P51d ×3 with identical ledgers);
  - QE-R7ASE-02 (P50 ×4 time zones, P52);
  - QE-R7ASE-03, QE-R7ASE-04;
  - all earlier blockers' probes byte-identical to the boundary freeze;
  - 555/555 tests; verifier 15/17.
- **Inferred (from the code, not run):**
  - `atDose` leaks repetition steps the same way under a repetition-progression goal;
  - a MODERATE or LONG return carries the projected tick through its steps (`startStrengthReturn` keeps `loadTick`);
  - weeks never reported (E5) feed the same leak when the athlete later lifts the projected load;
  - the run unlock counters and `achieved` peaks in the planning view are QE-R7ASE-02's class, but declared with a rationale (H35).
- **Not tested:**
  - gate time windows at the cut against the review's clock (E4);
  - cross-exercise couplings in `advanceStrength` beyond `entryWeek` (D51's return end applied to a held exercise);
  - the mutation suite (forbidden to run; output read).

## Is the author's evidence adequate?

Every claim I re-ran matches byte for byte: the 64 engineering runs, the self-challenge (0, and 52 on the boundary copy), the tests and the verifier. The comparison with the boundary freeze is exact: 46 identical, 17 named.

The gaps are in coverage:
- `atDose` is tested only where the projection ran one week ahead, so its stored tick is 0.
- No mutant promotes a projected tick at the new load.
- The consumer audit's E1 rationale was not tested against a review that carries a projected atom it does not move.

## Verdict and binding

**NOT_READY**, bound to STATE-EVIDENCE-FREEZE-1:
- source digest `692483ce5147d90797441baf2ac73c9d433197bd40047f147202ca4e4bff2cc1`, recomputed at the start and at the end;
- freeze file `a8683cbad60fd7f7b9da8b09e5c44bc74a55c6a2445e744606d37dbc6fde69f7`;
- policy R6-POLICY-5 `18ec48f3…`, unchanged.

The material blockers are QE-R7ASE-01 and QE-R7ASE-02. Following Founder §27 and §32: STATE_EVIDENCE_MODEL = NOT_READY, NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION. The decision they need:
- whether history stays a value-scoped reconstruction from the planning record, whose copy rules must each be exact per atom, or becomes its own record advanced only by executed evidence;
- and whether planner predicates defined on history must read that record.

Machine-readable version: `quality-engineering-r7ase-review.json`.
