# SSCTR narrow recheck of R7-C Phase 6 on R7C-FREEZE-3 (QE-R7C-07)

Record `SSCTR-P6-R7C-r5`, dated 2026-11-02. The structured record is [SSCTR_PHASE6_RECHECK_R7C.json](SSCTR_PHASE6_RECHECK_R7C.json). The request is [PHASE6_RECHECK_REQUEST.md](PHASE6_RECHECK_REQUEST.md); my previous record is [SSCTR-CC-R7C-r4](SSCTR_CC_RECHECK_R7C.md).

## Decision

**Gate: ACCEPT_WITH_CONDITIONS. No SSCTR blocker.**

- **What Phase 6 fixed:**
  - Executed and adverse answers recorded by an R4 HOLD or a handler clinical route are now applied by the next eligible decision, with no re-send, as the direct answer applies them. This held in every cell I measured.
  - Most mixed answers are applied the same way.
  - The re-plan never plans above the direct answer, the single-run ceiling or R7C-FREEZE-2.
- **Why the gate is not READY:**
  - **A residual of CC-F02 / QE-R7C-07 remains (P6-F01).** One mixed pattern recorded by a handler clinical route is still not applied after clearance, re-send included: 16 of 768 cells in my scope grid and 18 of 1,200 in my CC2 re-run. The stale projection stays VALID, for example QUALITY 34 / LONG 60 where the direct answer plans EASY 45 / LONG 50. It is identical on R7C-FREEZE-2, so the phase did not cause it, but the fix does not cover it. The C3 clause is narrowed, not retired.
  - **The reach touches the timely path (P6-F02).** On a weekly-reviewed, on-time athlete, a decision made before the week's review, while a run of that week has elapsed with no report, holds the next week's quality step until the review. That is the accepted unknown semantics, not a new dose, but it is plan churn and needs a presentation note (C11).
  - **The consumer conditions C2, C3, C8, C9 and C11 remain obligations.** No frozen byte discharges them.
- **For the closure:** P6-F01 falsifies the claim that the recorded answer is applied "whatever the answer reports" (handoff R5). Whether QE-R7C-07 counts as closed is Engineering's call; the reproduction is below. In my domain it is the same class I accepted under C3 in r4, now smaller, behind a clinical route, within the ceiling and limited to the answer week. So it is a condition, not a blocker.

This is a narrow recheck within SSCTR-SD-R7C-r2, not a new disposition.

| # | Item | Result |
|---|---|---|
| 1 | No new prescriptive effect; never above the direct answer | **CONFIRMED.** Where it fires, the re-plan equals the direct answer. In the reach grid it is never above R7C-FREEZE-2 (0 of 170) or the ceiling. Within the timely path it holds a step and adds nothing. |
| 2 | Adverse and mixed answers inside the authorities (E1, M2, no causation) | **PARTIALLY CONFIRMED.** Adverse: yes, everywhere. Mixed: yes where applied; the P6-F01 residual keeps the stale projection and fails M2 there (C3). |
| 3 | Clinical-first | **CONFIRMED** |
| 4 | Taper and race-week bounds | **CONFIRMED.** 0 race touches or taper quality sessions beyond the direct or reviewed plan. |
| 5 | C9; its Engineering part on handler routes | **CONFIRMED binding. Engineering part unchanged** (66 handler cells identical to R7C-FREEZE-2). |
| 6 | G02 unchanged | **CONFIRMED** (byte-identical; SD grid, holdout and SD-01 too) |
| 7 | The reach and the five fixture pins | **The accepted semantics applied consistently, not a new prescriptive effect.** The pins are accepted as EXPECTED_SEMANTIC_UPDATE. Three disclosures: P6-F02, P6-F03, P6-F04. |
| 8 | Narrow the C3 r4 clause; condition texts | **Narrowed:** adverse answers leave the clause; mixed answers stay. Texts below. |

## Why

**1. No new prescriptive effect.**
- **Where it fires, it equals the direct answer:**
  - Coordinator grid: 160 of 160 cells.
  - My CC2 re-run: ADVERSE 228 of 228 VALID cells (120 on R7C-FREEZE-2); EXEC above the direct answer 0 (was 6).
  - My scope grid: every applied cell.
- **Reach grid (P6-R, 170 cells):** stored plans resting on projection, facts reported on time with no weekly review, ten execution variants, three kinds of first decision.
  - 0 cells above R7C-FREEZE-2.
  - 0 runs above the single-run ceiling.
  - 0 VALID results with a question pending.
  - Overperformance (runs at 120 %, long run +20 minutes, lifts +5 kg) is never adopted outside a review: identical to R7C-FREEZE-2 and to the reviewed path.
- **Timely path (P6-T, 210 cells):**
  - 24 cells change mid-week, all a hold of next week's quality step, for example THRESHOLD 3x10 back to week 8's 4x8.
  - The minute counts rise (49 to 53) only because the held step has a different structure. It is the same session already prescribed that week, not a harder one.
  - 0 of 210 differ after the week's review.

**2. Adverse and mixed answers.**
- **Adverse:**
  - Applied in every cell: CC2 228 of 228, scope 96 of 96.
  - E1 holds on the 160-cell grid: 32 of 32 pairs, with no plan equal to all-done and no longer long run.
  - The only E1-type flags sit on the direct path itself in GEN b=5 (gap from week 2). They are identical on R7C-FREEZE-2 and are R3 (P6-F07).
- **Causation:**
  - The re-plan's reason names facts only, and the trace keeps `noCausalClaim`.
  - Adverse responses act only through the existing gates, and no learned pattern is involved.
- **Mixed:**
  - Applied in 4 of the 6 patterns in every cell, including the Phase 6 grid's pattern (long runs done, the rest not done).
  - **Residual (P6-F01).**
    - **Where:** 16 scope cells and 18 CC2 cells, all with the same signature:
      - the gap weeks were closed by reviews that saw no run reports;
      - some week holds a run reported done but no run role done in full;
      - the answer was recorded by a substitution with pain or a clinical return report;
      - the next decision is plain or re-sends the answer.
    - **Not affected:** taper, race week and the R4 HOLD (64 R4 cells clean).
    - **What stays VALID:** the stored doses, up to QUALITY 34 / LONG 60 where the direct answer plans EASY 45 / LONG 50 and the on-time plan EASY 45 / LONG 55 (M2 fails), and QUALITY 38 / LONG 70 against EASY 40 / LONG 65.
    - **Bounds:** within the ceiling (0 breaches). Week b+1 converges at the week's review (CC2 next-week cells identical to R7C-FREEZE-2: 162 of 166 VALID equal the direct path).

**3. Clinical-first.**
- **Order in `evaluateProgram`, read in code:**
  - An eligibility clinical flag returns before any report is read.
  - A standing clinical reference returns before the factual re-plan.
  - The handler's clinical screen decides alone, with no proposal.
  - The G01 re-decision never applies to a clinical result.
- **Outputs, unchanged:**
  - My CC2 recorder statuses are identical to R7C-FREEZE-2.
  - K6, K6b, the inventory (CAND-01, CAND-02, ADJ) and 3,228 adversarial checks with 0 failed are equal to the coordinator's Phase 6 outputs after labels.
  - SD grid C: 9 of 9.
- No clinical judgment is made here; clearance stays CLINICAL_HUMAN_REQUIRED.

**4. Taper and race week.**
- 0 race touches or taper quality sessions that the direct answer lacks: 160-cell grid, my 768-cell scope grid, and the reach grid's taper and race cases.
- The 8 G01 rows that changed are all late known-miss rows. Each now equals its reviewed-miss row, which is unchanged since R7C-FREEZE-2. That includes the taper week's THRESHOLD 27 after four missed weeks.

**5. C9.**
- My CC3 re-run: the 66 handler cells (EXERCISE_SUBSTITUTION 44, RETURN_SHORT 14, EVENT_DATE_CHANGE 8) are byte-identical to R7C-FREEZE-2. `rebuild()` and the return composition are untouched.
- The next decision still contains them: 0 material failures in the cure step.
- The non-handler next-week one-step differences fall from 96 to 16.
- **C9 still binds. Its Engineering part on the handler routes did not change.**

**6. G02.** The adversarial-g02 output is byte-identical (`47212a8f…`). So are the SD grid (`b091d1aa…`), the holdout (`83ea8dc2…`) and SD-01 (`99b624f6…`).

**7. The reach and the pins.** Following the facts here is r2's rule applied consistently: unknown earns no credit, and a current week's earlier weeks are facts or unknown. It is not a new prescriptive effect.
- **Down toward the reviewed path:**
  - Underperformance, missed or unreported runs, and unreported lifts.
  - The P51 case: the Saturday-only lift follows history (22 kg).
- **Never up.**
- **Where the reach stops short of the reviewed path, it is the facts reading of a never-reviewed week, which holds every role (P6-F03, P6-F04):**
  - Adverse long runs: the long run stays at the stored dose (+5 to +10 minutes over the reviewed step-back), as on R7C-FREEZE-2.
  - A lift also executed in another session keeps its executed load, 24 kg against the review's 22.
- **The five pins:**
  - They are fixture-only: week 4's review adopts a back squat logged 2.5 kg above plan, and no assertion changed.
  - The original history is pinned by the reach test.
  - They expose an anchor asymmetry: with that earlier anchor, the same facts leave the projection ahead (24 kg) until the week's own review. That is Property B, unchanged.

**8. C3.**
- Adverse answers leave the r4 clause.
- Mixed answers stay, because of the residual.
- The clause cannot be retired until an engine fix.

## Conditions as set now (the closure carries these)

- **C2, C4, C5, C8:** unchanged; the freeze record's verbatim texts govern.
- **C10:** carried as in r4, including CC-F06.
- **C3 (G03; r2 text, plus this clause replacing the r4 clause):**

  > Since R7C-FREEZE-3 an answer to UNREPORTED_TRAINING that a refusal (the R4 HOLD) or a handler clinical route (a substitution with pain, a clinical return report) recorded is applied by the first eligible decision after it (after qualified clearance for a clinical route), with no re-send, as the same answer delivered directly. Measured: known stops, executed and adverse answers in every cell; mixed answers in most. Residual: a mixed answer (some runs of the window reported done, some reported not done) recorded by a handler clinical route is not applied, re-send included, when a week of the window was closed by a review that saw none of its run reports and that week has a run reported done but no run role reported done in full; after clearance the next decisions keep the stored run doses of the answer week as VALID (for example QUALITY 34 / LONG 60 where the direct answer plans EASY 45 / LONG 50). Until an engine fix, after a handler clinical route that recorded a mixed answer, the run doses remaining in that week are not presented as a prescription; the qualified human's clearance and the week's own review decide, and that review re-plans the following week from the facts. An eligibility clinical flag still records nothing, so its answer is re-sent after clearance (R5).

- **C7 (disclosure; r4 text with these r5 changes):**
  - **R3:** add "on the answer path the held long run can sit up to 10 minutes above the on-time step-back (GEN b=5, gap from week 2: LONG 65 against 55), identical on R7C-FREEZE-2".
  - **R4:** "the HOLD remains (Engineering); a known stop, an executed, a mixed or an adverse answer it records is applied by the next decision (no residual measured)".
  - **R5:** "the eligibility flag records nothing, the re-send applies it; after a handler clinical route a known stop, an executed and an adverse answer are applied after clearance with no re-send, and a mixed answer is too except the residual in C3 (r5)".
  - **Add the reach:**

    > A stored plan resting on projection over its run window follows the record at the first decision whose factual plan differs, never above R7C-FREEZE-2 or the single-run ceiling in any measured cell, and overperformance is not adopted outside a review; where weeks were never reviewed, the facts reading holds every run role (no step): after adverse long-run responses the long run stays at the stored dose where the weekly review would step it back (up to 10 minutes above the reviewed path), and a lift also executed in another session of the week keeps its executed load where the review holds it (24 against 22 kg); with an earlier evidence anchor in the window the projection still stands until the week's own review (Property B: the Saturday-only lift 24 kg against 22 kg in history); on the timely path, see C11.

- **C9:** r2 text verbatim, including the taper-to-race-week case, and the r4 status note. Add this r5 status note:

  > R7C-FREEZE-3 does not change the handler re-compositions: the 66 handler cells of my CC3 re-run are identical to R7C-FREEZE-2 (EXERCISE_SUBSTITUTION 44, RETURN_SHORT 14, EVENT_DATE_CHANGE 8), and the first decision of week b+1 still asks or re-plans within the single-run ceiling in every measured case. Engineering part: still owed for those re-compositions, unchanged from r4, with a directed test per route including a substitution answer on day 4 of the taper. The consumer part binds.

- **C11 (new; disclosure and G03 presentation note):**

  > On the timely, weekly-reviewed path, since R7C-FREEZE-3 a decision made before the week's review while a run session of the week has elapsed with no report re-plans the following week without crediting it: it holds the quality step (GEN THRESHOLD 3x10 back to the week's 4x8; R10K 5x4 back to 6x3; taper 3x4 to 3x3), and the week's review restores the progression once the reports arrive (24 of 210 measured cells change mid-week, 0 after the review). This is the accepted unknown semantics, not a new dose. Consumers present the following week's plan as provisional until the week's review and do not surface the interim hold as a coaching change; cadence and wording belong to G03.

## Findings (one line each)

- **P6-F01** (condition; residual of CC-F02 / QE-R7C-07; identical on R7C-FREEZE-2): a mixed answer recorded by a handler clinical route is not applied after clearance when a review-closed week of the window has done runs but no run role done in full.
  - **Reproduction:** GEN, 12 weeks.
    1. Weeks 0-5 reviewed with strength only.
    2. Week 6's review asks.
    3. Day 2 of week 7: a substitution with `pain: true` carries every other run of weeks 0-6 not done.
    4. Clearance (no reference state).
    5. Plain decision on day 3: KEEP, VALID, QUALITY 34 / LONG 60. The direct answer gives EASY 45 / LONG 50.
  - **Cause:**
    - `unreadRunWeeks` keeps weeks 1 and 3 as read, because their run gates still hold.
    - Week 3's done 45-minute easy run (2026-11-26) is in the 30-day window, so `answeredOnRecord` returns false.
- **P6-F02** (Phase 6 delta; C11): mid-week on the timely path, the recorded-answer re-plan holds next week's quality step until the review.
- **P6-F03** (pre-existing reading now applied; C7): in never-reviewed weeks with adverse long runs, all run roles are held, not the long run stepped back.
- **P6-F04** (pre-existing; C7): in never-reviewed weeks with an unreported lift, lifts executed elsewhere keep their executed load. With an earlier anchor the projection stands (24 against 22 kg).
- **P6-F05** (positive): recorder independence for known stops, executed and adverse answers everywhere measured; the re-plan never above the direct answer, R7C-FREEZE-2 or the ceiling; G01 late rows equal the reviewed miss.
- **P6-F06** (C9): handler routes unchanged; non-handler next-week steps narrowed (96 to 16).
- **P6-F07** (pre-existing, R3): in GEN b=5 with the gap from week 2, the direct answer holds LONG 65 for adverse and executed alike, where on time steps back to 55. Identical on R7C-FREEZE-2.
- **P6-F08** (documentary; the handoff is not a frozen byte): three statements in the handoff overstate the phase. Correct them at closure.
  - Handoff R5 and line 31 say "whatever the answer reports".
  - It says "four rows" of G01; four verdicts changed, but eight rows changed content.
  - The differential's "on-time identical" does not cover the mid-week timely reach.

## What I ran, and what I did not

**Run:**
- **Verifier:** `verify-r7c.mjs --revision 3 --suite` without `--write`: 20 of 20 PASS, 866 of 866.
- **My own probes:** seven, in [probes/phase6/](probes/phase6/):
  - reach;
  - adverse trace;
  - timely mid-week;
  - quality detail;
  - mixed diagnosis, on an instrumented temporary copy outside the repository;
  - mixed scope;
  - direct check.
- **Re-runs on R7C-FREEZE-3:**
  - my CC2 and CC3;
  - the coordinator's G02, SD, G01, holdout and SD-01 probes;
  - the four clinical copies, run from verbatim copies in `probes/phase6/clinical/`.
- **Literature:** WebSearch works (checked 2026-11-02). The screen was negative and no new claim is made.
- **Unchanged inputs:** the policy, the catalog and the queue (230 items, funding NOT_DECLARED).

**Not run, read only:** the mutation run (from the freeze record: Phase 6 7 of 7).

**Not opened:**
- the Engineering review of R7C-FREEZE-3 (its untracked probe folder appeared during this review);
- the authoring session's scratchpad. My own session scratchpad lies inside it, so I used none.

**Not verified:**
- **Schema validation:** Python is unavailable.
- **Clinical clearance:** modelled as the tests model it.
- **Strength-side recorder independence.**
- **Real-user behaviour and consumer compliance.**
- **Native dispatch:** cannot be observed.

**Authority:**
- PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY.
- No human, empirical or clinical validation; no publication; V1 authority stays NO.
- Nothing was appended to the queue.

**Re-review:** on any change to a file bound by R7C-FREEZE-3 (manifest `ebc8af2f…bbaa`), any change to when the recorded-answer re-plan fires, an engine fix for the C3 residual, C9's handler routes, C8, C5 or R4, a G03 cadence decision, a relevant policy change, new V1 data, or a relevant systematic review. At the latest 2027-04-30. Owner: Chief.
