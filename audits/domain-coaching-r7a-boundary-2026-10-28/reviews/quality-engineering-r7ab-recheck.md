# R7-A Final Boundary Closure engineering re-check (R7AB-QE-r1)

**R7A_FINAL_ENGINEERING_RECHECK = NOT_READY on R7A-BOUNDARY-FINAL-FREEZE.** This is the single engineering re-check of the single freeze. No correction cycle follows it (Founder request §22).

**The answer to Founder §20 is yes.**
- **QE-R7AF-01 itself is closed.** After an unfinished, unreviewed re-entry week, no later decision (equipment, full-kit statement, systemic fatigue, schedule, goal) now makes the projected week start the next break's point. It reproduces on the R7A-FINAL-FREEZE copy and no longer on the frozen bytes.
- **A projected value still becomes history through a weekly review that holds it.** The review records the next week's start as `WEEK_EVIDENCE`. Every value its evidence did not move is carried over from the week's own start. When that start was an unverified projection, the carried values are the projection's. Outside a return, `historicalWeekStart` accepts such a start without asking where its held values came from. "Outside a return" covers the first interruption of a program, the weeks after a SHORT return and the weeks after a completed return.
- **Example: 22 kg that was never lifted.** A first interruption starts from 22 kg for two exercises the athlete last lifted at 20 kg, and the start is recorded as `WEEK_EVIDENCE`. The same history with one extra review gives 20 kg.

This is **QE-R7AB-01** (MEDIUM, material). It is a new manifestation of projected-vs-historical (Founder 0.1, §8, §9; I2, I3, I8).

| | |
|---|---|
| Material finding | **QE-R7AB-01 (MEDIUM)**: a weekly review, or any handler applying its rule, stamps `WEEK_EVIDENCE` on values it only carried from an unverified projected start. Outside a return, `historicalWeekStart` reuses them as history |
| Closed | QE-R7AF-01, QE-R7AF-02 (by §11), QE-R7A-01, QE-R7A1-09, QE-R7A1-10, QE-R7A2-01, QE-R7A2-02 (engineering), QE-R7A2-03 |
| Not material | QE-R7AB-02 (LOW): an exactly executed week with establishment rows gives a less progressed start unreviewed than reviewed. QE-R7AB-03 (LOW): a named correction that encloses training recorded *before* the first report is applied silently |
| Preserved | Week composition, event supersession, exercise merge, identity: all 47 engineering re-runs are byte-identical to the author's runs; 540/540 tests |

**Who did this.** I am the Quality & Reliability Engineer (constitution 1.3.0), a fresh instance (claude-opus-5-5, effort xhigh). I did not write this runtime. I changed nothing under `CoachingCore/`, and I rule on no sporting dose. Everything I wrote is in this folder with the prefix `qe-r7ab-`, except this file and its JSON.

## Freeze checked

R7A-BOUNDARY-FINAL-FREEZE: `CoachingCore/r7/boundary/RUNTIME_FREEZE_R7A_BOUNDARY.json`.

| Check | Start (18:35 UTC) | End (18:58 UTC) |
|---|---|---|
| Source digest, recomputed (canonical `hash()` of the `src/*.mjs` SHA-256 map, as in `freeze-r7ab.mjs`) | `36a71ca84fb87789d8623e2050ac9e308a963400af86a3ba73a373043bbf186c` | `36a71ca84fb87789d8623e2050ac9e308a963400af86a3ba73a373043bbf186c` |
| Freeze file SHA-256 | `3ebc9b02995d95f39b172fbbb79b652c149b10c74984ce7b8da6fd870778b97d` | same |
| Bound files that differ from the freeze (81: src, tests, policy, fixtures, package) | 0 | 0 |
| Policy | R6-POLICY-5 `18ec48f3…`, unchanged | same |
| `node CoachingCore/scripts/verify-r7ab.mjs` (no `--write`) | 15/17. Open: `independent-reviews`, `deliverables`, as expected before the re-checks | 15/17 before this JSON was written. After it (19:02 UTC, digest unchanged): 16/17, `independent-reviews` passes with both re-check JSONs bound to the digest; `deliverables` open |
| `node --test` (CoachingCore) | 540/540 | not re-run |

Files: `qe-r7ab-digest.mjs`, `qe-r7ab-digest-{start,end}.out.json`, `qe-r7ab-verify.{start,end}.out.json` and `qe-r7ab-node-test.out.txt`.

## What I ran

Every script loads the runtime read-only, uses synthetic data and the DEV_TEST_ONLY authority, and prints only. "FINAL-FREEZE" means the same script also ran against the byte-exact `final-freeze-source/` copy, pointed to by `QE_LIVE_ROOT`.

**The author's evidence, re-run by my own harness** (`qe-r7ab-rerun.mjs`, outputs in `qe-r7ab-runs/`). It ran every engineering probe of `probes/EVIDENCE_RUNS_R7AB.json`: 47 runs, with the SSCTR grids excluded. **47 of 47 are byte-identical to the author's recorded outputs.** These include:
- the §20 probes P13, P14, P15, P17, P19, P20, P21, P34, P35, P37, P38, and P31 at UTC, +9, −5 and −10;
- the preservation probes P01–P10 and P16, and P09 at SEED 7 and SEED 1013 (5,000 sequences, O1–O7 all 0);
- the R7-A.1 composition and handler grids, the R7-A.2 and R7-A final self-challenges, and this mission's self-challenge (0 violations; 56 on the FINAL-FREEZE copy, as claimed).

**The original QE-R7AF-01 probes, before and after**

| Probe | R7A-FINAL-FREEZE copy | Frozen bytes |
|---|---|---|
| P30c (`qe-r7ab-P30c*.out.json`) | Content-identical to the R7-A final judge's output: equipment window, full kit and systemic fatigue each give `WEEK_START/w6`, A's stored start, run return step 1, week 6 runs 30/45 | Every cell gives the control's start: `RETURN/w5`, step 0, week 6 runs 15/20 |
| P30b (`qe-r7ab-P30b*.out.json`) | Content-identical: 13 of 15 cells change B's start, 7 advance the run | 6 of 15 differ from their control, none advances the run. All 6 are Sunday cells where the handler applied the weekly review's rule. Every Monday cell and every equipment cell equals the control |

**My own probes**

| Probe | What it attacks | Result |
|---|---|---|
| `qe-r7ab-P40-held-outside-return` (+FINAL-FREEZE, +3 time zones) | Before any return: week F with one session missed and unreviewed (U) or reviewed (R); week F+1 the same session missed and reviewed; then a first interruption B | **QE-R7AB-01.** Identical at four time zones and on FINAL-FREEZE |
| `qe-r7ab-P40b-held-variants` | Three sessions (Saturday lift, Wednesday lift, Sunday long run) × three kinds of week F+1 (missed again, nothing executed, reps unlogged) | 9 of 9 cells differ from their control (detail below) |
| `qe-r7ab-P40c-moderate-ceiling` | P40 with a MODERATE B (14 days) | U's return entry carries 22 kg as the exercises' earlier load (their ceiling); R's carries 20 |
| `qe-r7ab-P41-held-after-short-return` | P40 after a SHORT return (7 days) | U's entry holds counts the projection assumed: `lastExecutedSets` 4/3 vs 3/2, never executed |
| `qe-r7ab-P47-noop-clock-grid`, `qe-r7ab-P47b-localfatigue-pre` | Six no-op handlers at Sunday 11:00, 13:00 (either side of the AM shift's end), 22:00 and Monday 06:00, on a return base and a pre-return base | The 42 true no-op cells equal the control. The 6 local-fatigue cells are reviews by design (R7-A.1 C4). On the pre-return base they reproduce QE-R7AB-01 through that handler (P47b: 22 kg against 20) |
| `qe-r7ab-P46-promotion-outside-return` (F = 1, 3) | Evidence promotion before any return: a week executed exactly as projected, unreviewed against reviewed; then missed, partial, adverse, lighter, unlogged, reduced and moved | F = 3: P2 holds, and every not-as-projected cell walks back (0 violations). F = 1: QE-R7AB-02 |
| `qe-r7ab-P44-whole-week-absent-exercise` | Inside a return: the "executed in full" exception when an exercise is absent from the whole week (equipment window) | No finding. Its values are backed by the week's execution. One observation for the SSCTR, below |
| `qe-r7ab-P45-temporal-contradiction` (+FINAL-FREEZE), `qe-r7ab-P45b-enclosed-training` | §11 by my own cases: the end moved onto the executed re-entry; moved after it with `startedAt`; days only; by report id; consistent corrections | C1, C2, C3 and C6 are asked; all four were applied on FINAL-FREEZE. C5 and C7 apply. P45b: QE-R7AB-03 |
| Scratch: `qe-r7ab-scratch-rows`, `-p40diff`, `-p46diff` | Rows and authorities of the default program; field-level diffs | Quoted below |

**Not run:**
- `npm run verify` and `simulate`;
- any `verify-r*.mjs` with `--write`;
- any `freeze-*`, `prepare-*`, `queue-*` or `regress-*` script;
- the evidence runners (`run-evidence-r7ab.mjs`, `ssctr-*`);
- the SSCTR grids and instrument;
- the author's `mutation-check-r7ab.mjs`, whose output I read but did not re-derive.

## QE-R7AB-01 (MEDIUM, material, new manifestation of projected-vs-historical): a review stamps evidence authority on values it only carried from a projection

**What the freeze says it does.** Contract §3 accepts a `WEEK_EVIDENCE` start when it was set before the cut. The base rule is applied only "inside a return (the start carries return steps)": there, "the week before's own start must hold too, or the week before was executed in full: a value the review held is that start's value (I4)". B3 is superseded: "before any return, a planned week start is history only through evidence". Item S-F: "No unexecuted return step, load or whole count reaches a ceiling or a resumed dose through a stored start". §3 also claims that only `stateAtBreak` reuses a week start as history.

**What the code does.**
- `evidenceStart` (`src/r6-adaptation.mjs:242–245`) takes `program.stateTrace[w]`, the week's stored start, as the base of the next start. It moves only what the week's evidence advances; everything held is carried unchanged.
- `weeklyReview` (`:364`) and `rebuild` and `composeWeeks` (`r6-composition.mjs:243`) record the result as `anchoredStart(WEEK_START.WEEK_EVIDENCE)`, whatever authority the base had.
- `historicalWeekStart` (`:691`) checks the base only through `carried()`, which returns true whenever `!returning(state)`.

So outside a return, a projection that a review held is accepted as evidence-anchored history. `evidenceStart` is a second consumer that reuses a stored start, the base of every evidence start, and the contract does not list it.

**Reproduction** (`qe-r7ab-P40-held-outside-return.mjs`, variant `saturdayLift`; the field diff is `qe-r7ab-scratch-p40diff.out.json`). Default synthetic profile; every input is an ordinary review accepted by `evaluateProgram`.
1. Weeks 0 and 1 are trained and reviewed. Week 2's review keeps the plan, so week 3's start is the generator's projection (CONDITIONAL_PLAN), with `db-rdl` and `db-split-squat` at 22 kg.
2. Week 2 (11-16 to 11-22): every session but Saturday's lift is executed and reported day by day. Sunday's run is reported on Monday.
   - Cell **U**: no review of week 2.
   - Cell **R** (control): the same facts reviewed on Sunday 21:00.
3. Week 3: Saturday's lift (11-28) is missed again, and the rest is executed. Weekly review on Sunday 21:00 (GATED_NEXT_STEP).
4. **B**: a 2-day trip, Tuesday 12-01 to Wednesday 12-02, reported Thursday 06:00. It is the program's first interruption, SHORT ("resume the last completed doses").

| | Week 3 start | Week 4 start | B's point | B's entry | After B |
|---|---|---|---|---|---|
| U | PROJECTED (unverified: week 2's Saturday missed) | `WEEK_EVIDENCE` | `WEEK_START/w4`, authority `WEEK_EVIDENCE` / `WEEK_EVIDENCE` | `db-rdl` 22, `db-split-squat` 22; `db-row` and `db-bench-press` one load tick ahead | 12-05: `db-rdl 3x5@3 KNOWN22`, `db-split-squat 2x6@3 KNOWN22`; week 5: `db-row KNOWN24`, `db-bench-press KNOWN22` |
| R | `WEEK_EVIDENCE` | `WEEK_EVIDENCE` | `WEEK_START/w4`, `WEEK_EVIDENCE` | 20, 20; no ticks | 20, 20; week 5: 22, 20 |

The ledger shows `db-rdl` and `db-split-squat` last executed at 20 kg (11-14). Every later Saturday was missed, so 22 kg was never lifted. In U, 22 kg and the load ticks are the projection's assumption that week 2's Saturday was done. Week 3's review held them, and they were then recorded and reused as evidence-anchored history.

**How far it reaches**
- **P40b, 9 of 9 cells.** The clean cells are "missed again" and "nothing executed". In them, B's start holds values the ledger never shows executed:
  - Saturday's lift: 22 against 20 kg, plus ticks;
  - Wednesday's lift: `db-calf-raise` 22 against 20, plus ticks on `back-squat`, `db-bench-press` and `db-row`;
  - Sunday's long run: `run.long` 70 against 65 and `easyWeeksDone` 3 against 2.

  "Nothing executed" in week F+1 is the brief's "weeks reviewed with nothing executed" case. That review carries week F+1's projected start whole into a `WEEK_EVIDENCE` start, which is Founder §9's forbidden example. The "reps unlogged" cells are weaker (the load was lifted). The long-run cell whose week F+1 was executed in full is real execution of a different plan, and I do not count it.
- **P40c, MODERATE B.** The return entry holds 22 kg as the earlier load, so it is the return's ceiling (D49), against 20. A load never lifted reaches the ceiling, as S-F excludes.
- **P41, after a SHORT return.** The base rule never applies after such a return, because it carries no return steps. B's entry holds `lastExecutedSets` 4 for `db-rdl` and 3 for `db-split-squat`, the whole count a later return takes as its ceiling. The athlete executed at most 3 and 2.
- **P47b, another handler.** Same history, no weekly review of week 3. A local-fatigue report on Sunday 22:00 with nothing optional left reviews the week (R7-A.1 C4). B then starts from week 4 at 22 kg; without the report it walks back to week 2 at 20 kg. A handler obtains different behaviour because its review read a projected start as factual: I8 by its wording.
- **Time zones.** P40 is identical at UTC, +9, −5 and −10.
- **Before the mission.** P40 gives the same 22 kg on the R7A-FINAL-FREEZE copy: this mission did not change the path.

**Why it is material**
- **Founder 0.1 and §8.** A week start is consolidated history only when derived from "executed state of previous period + valid evidence/review/correction". Week 4's `db-rdl` value comes from week 3's start, which was a projection. Week 3's evidence says `db-rdl` was not executed.
- **Founder §9 and I3.** "There is a week start, therefore this is factual history" is what happens here. The field is filled by a review instead of a return, and storage still confers the authority.
- **I2.** The recorded provenance (`WEEK_EVIDENCE`) does not explain the value. Its real provenance is CONDITIONAL_PLAN.
- **The contract's own rules.** It accepts I4's rationale ("a value the review held is that start's value") but applies it only inside a return. It claims S-F, and P40 (resumed dose), P40c (ceiling) and P41 (whole count) contradict S-F.
- **A common V1 path.** It takes an ordinary sequence: one week with a missed session that is never reviewed (its last session synced the next morning), the same session missed the next week, which is reviewed, then a short trip. The unreviewed-week premise is the one QE-R7AF-01's reproduction and this mission's tests rely on.

**Why MEDIUM, not HIGH:**
- identity is never wrong;
- the effect is one progression step (+2 kg, a load tick, +5 long-run minutes, one set in a ceiling count);
- no row returns to a pre-break dose after a long break on these paths.

The dose size is the SSCTR's to rule on.

**Founder §26**
- **Reproduction:** `reviews/qe-r7ab-P40-held-outside-return.mjs` (cell U against R), with P40b, P40c, P41 and P47b.
- **New manifestation of projected-vs-historical?** Yes. A projected state acquires historical authority because a later decision stored it, here a weekly review that held it. It is not QE-R7AF-01's path: there is no earlier return and no unrelated handler, and the storing decision is the canonical review itself.
- **Does it require revising the history/state model?** Yes.
  - At minimum, evidence authority must become recursive on every week, not only inside a return: a reviewed start is history only when the start it was computed from is history, or the week was executed in full.
  - Even that is per week. An exact answer needs to know, per value, which values the review moved from evidence and which it carried. The contract's B8 says per-exercise authority "would be a new state model".
- **Why the current solution is insufficient.** Authority is recorded per start and per sport, and `WEEK_EVIDENCE` certifies the review's transition, not the base it was applied to. The base check exists only behind `returning(state)`. Every week outside a return therefore inherits whatever its base held: the first weeks of a program, the weeks after a SHORT return and the weeks after a completed return.

## Other findings (not material)

**QE-R7AB-02 (LOW, not material): exactly executed establishment weeks are not equivalent reviewed and unreviewed.** Reproduction: `qe-r7ab-P46-promotion-outside-return.mjs` with `QE_F=1`, and `qe-r7ab-scratch-p46diff.out.json`.
- Week 1 is executed exactly as projected. Unreviewed, its projection verifies (COMPLETED_SESSIONS) with `db-rdl`, `db-split-squat` and `db-calf-raise` as `FROM_LOG` and a pending 20 kg. Reviewed, the second log confirms `KNOWN 20`.
- So P2 and the I5 test's claim "executed and reviewed give the same steps" hold only up to a conservative difference. B7 declares last-performed dates only.
- Load check (c) passes vacuously when the projection assumed no load.
- No unexecuted value enters: the unreviewed start is less progressed.

**QE-R7AB-03 (LOW, not material): §11 covers only training after the first report.** Reproduction: `qe-r7ab-P45b-enclosed-training.mjs`.
- A named correction moves A's start from 11-21 to 11-15. Four sessions executed before A's first report (11-15 to 11-19) now fall inside A.
- It is applied silently, and the entry changes (point at week 1).
- Contract §5 scopes the rule to training after the first report, which covers the Founder's example. A's own first report already encloses executed sessions (11-21, 11-22) and is accepted, so the runtime's model treats training inside an interruption as possible.
- For the Founder: whether "already-attributed execution" in §11 includes pre-report training. It does not block.

**Observation for the SSCTR (no finding): P44.**
- Inside a return, week 5's Wednesday lift was missed and week 5 was unreviewed. Week 6 was planned from the projection (step 1) and executed in full with `back-squat` substituted by an equipment window.
- The review then ends the return for the exercises in use, and D51 ends `back-squat`'s return too.
- B's entry has `back-squat` at 3 sets `KNOWN 82.5` with no return step, although `back-squat` was never lifted after A. The control keeps it at step 0.
- Every in-use value is backed by week 6's execution and the trigger is D51, so this is not projected-as-history. The dose is the SSCTR's.

## Founder §11 (QE-R7AF-02)

- P37 E1 (A's identity), E2 (A's report id) and E7 (a reused name) are asked.
- My P45 cases are also asked: C1 the end onto the executed Tuesday; C2 moved after the re-entry with `startedAt`; C3 days only, whose default end crosses the re-entry; C6 by report id.
- On FINAL-FREEZE every one of them was applied. The consistent corrections (C5 shorter, C7 before any re-entry training) apply.
- The rule fails closed as decided. Its scope is discussed under QE-R7AB-03.

## Blockers

| Id | Status | Evidence |
|---|---|---|
| QE-R7AF-01 | **CLOSED** on its path | P30c and P30b before and after (above). The author's tests "QE-R7AF-01", "I8/P1/P2", "families A, C". P47: no no-op handler at any clock changes the start after the unfinished re-entry week. The class is still open: QE-R7AB-01 |
| QE-R7AF-02 | **CLOSED** (Founder §11) | P37 E1, E2, E7; P45 C1, C2, C3, C6 asked |
| QE-R7A-01 | **CLOSED** (through its identity manifestations) | P13, P14, P17, P19, P20, P31 at four time zones (V1, V2, V4, V5 all 0), P35, P38: byte-identical |
| QE-R7A1-09 | **CLOSED** | P17 L1–L4, P19 0/48, P31 V1 0/216 at four time zones, P35, P37 E1/E2 now asked |
| QE-R7A1-10 | **CLOSED** | P14, P20 (`EASY 34`, eased for B), P35, byte-identical |
| QE-R7A2-01 | **CLOSED** | P17, P19, P31 |
| QE-R7A2-02 | **CLOSED** (engineering) | P18, P32 (only L4's unreviewed variant changed, now confirmation-first because its point moved to the intake) |
| QE-R7A2-03 | **CLOSED** | P21, P38 |
| **QE-R7AB-01** | **OPEN (material)** | P40, P40b, P40c, P41, P47b |

## Rulings on the declared boundaries

| # | Ruling | Why |
|---|---|---|
| B1 | **Accepted** | P32 L3 byte-identical: after the re-entry week a late fact is not replayed |
| B2 | **Accepted** | P32 L4 reviewed is identical. Unreviewed, the point is now the intake, so the late log is after the point and is asked. Conservative |
| B3 (superseded) | **Supersession accepted; its implementation is incomplete** | Founder 0.1 applied: a planned start is no longer read directly (author's family G, my P46). It still reaches history through a review that holds it (QE-R7AB-01) |
| B4 | **Accepted** | P31 V5 0 at four time zones; P34, P35; P37 E5 |
| B5 | **Accepted** | P19, P31, P33 byte-identical |
| B6 | **Accepted** | P21, P38 byte-identical |
| B7 | **Accepted, with QE-R7AB-02** | Last-performed dates differ by design. Establishment confirmations differ too (conservative), which B7 does not declare |
| B8 | **Accepted inside a return; its restriction to returns is QE-R7AB-01** | The per-week rule works inside a return (I4 test). Its "executed in full" exception is backed by execution (P44). Outside a return the rule is absent |
| B9 | **Accepted** | A recorded review stands when its evidence is corrected later. A start verified by completed sessions is recomputed (P4 test passes) |
| B10 | **Accepted** | Legacy weeks without authority; no V1 program is generated without it |
| B11 | **Accepted** | Points read weeks up to the cut's week, whose starts no decision after the cut re-sets (a return keeps the replaced start with its authority). The documented survivor is equivalent on reachable paths |

## Integrity recommendations (engineering scope)

| Verdict | Recommendation | Why |
|---|---|---|
| WEEK_START_STATE_AUTHORITY | **NOT_READY** | QE-R7AB-01 |
| STATE_PRESERVATION_INTEGRITY | **NOT_READY** | QE-R7AB-01: the state a first interruption starts from depends on whether an earlier week was reviewed (or a Sunday handler ran), and can hold loads never executed |
| WEEK_COMPOSITION_INTEGRITY | **READY** | P09 O1–O7 0 in 5,000 sequences; P01–P08, P10, P15, P16 and the R7-A.1 grids byte-identical; 540/540 tests |
| EVENT_SUPERSESSION_INTEGRITY | **READY** | P34, P31 V2 0 at four time zones, P09 O6 0 |
| EXERCISE_MERGE_INTEGRITY | **READY** | P07 byte-identical (`66405732…`) |
| RETURN_RECOVERY_CEILING_INTEGRITY (engineering) | **NOT_READY** | Item S-F does not hold on QE-R7AB-01's path: a SHORT return resumes 22 kg never lifted (P40), a MODERATE return's ceiling is 22 kg (P40c), a later ceiling count is never executed (P41). Inside a return the ceilings hold (author's tests, P13, P17, P19, P31 V4 0). Dose size is the SSCTR's |

## Is the author's evidence adequate?

Every claim I re-ran matches byte for byte: the tests, the verifier, all 47 engineering runs, and the self-challenge with 0 / 56. The gap is in coverage:
- The self-challenge's C8 checks the first interruption only directly: week 3 half executed and unreviewed, then the break.
- The mutation set has "held value from a projected start accepted inside a return", but no analogue outside one.
- Every completed-sessions and premise test runs inside a MODERATE return.

No probe combines an unreviewed week with a reviewed one before any return, or after a SHORT one.

## Verdict and binding

**NOT_READY**, bound to R7A-BOUNDARY-FINAL-FREEZE:
- source digest `36a71ca84fb87789d8623e2050ac9e308a963400af86a3ba73a373043bbf186c`, recomputed at start and end;
- freeze file `3ebc9b02…`;
- policy R6-POLICY-5 `18ec48f3…`, unchanged.

The material blocker is QE-R7AB-01. Following Founder §22 and §26: R7A_EXIT_READINESS = NOT_READY, NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION. The decision it needs is whether evidence authority is recursive on every week, or recorded per value. QE-R7AB-02 and QE-R7AB-03 do not block.

Machine-readable version: `quality-engineering-r7ab-recheck.json`.
