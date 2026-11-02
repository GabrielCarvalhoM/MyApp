# R7-C (Longitudinal Coaching) — handoff for consumers and later missions

What R7-C changes, what binds any consumer of this runtime, and what is routed. Shadow reference runtime only: `V1_COACHING_AUTHORITY_READY = NO`.

**Status: R7-C Phase 7 (QE-R7C-10): R7C-FREEZE-4 frozen; the Engineering gate and the SSCTR narrow recheck are pending.** Phase 7 is the Founder's specific fix of QE-R7C-10 (SSCTR P6-F01, same cause), with no correction loop: a new blocker from a gate closes R7-C `CLOSED_NOT_READY`.
- **Before Phase 7:** Phase 6 closed NOT_READY on QE-R7C-10 (Engineering review of R7C-FREEZE-3, `audits/domain-coaching-r7-c-2026-11-01/reviews/engineering/PHASE6_REVIEW_R7C.md`); SSCTR-P6-R7C-r5 ACCEPT_WITH_CONDITIONS (`reviews/ssctr/SSCTR_PHASE6_RECHECK_R7C.md`).

## Runtime and records

- **Freeze:** `R7C-FREEZE-4` ([record](RUNTIME_FREEZE_R7C_4.json); verifier `node CoachingCore/scripts/verify-r7c.mjs --revision 4`, 27/27 with `--suite`: [report](VERIFICATION_R7C_4.json)), commit `a9654c8`, record sha256 `bf99c01b…2fc2`, source `16d0633e…69c1`, manifest `61937f87…f6b8`, 197 files, 884/884, on top of R7B2-FREEZE-1 (`1a1c728`). Its delta from R7C-FREEZE-3 (`08c6db3`): `src/r6-provenance.mjs`, `src/r6-adaptation.mjs` and the new `test/r7c-phase7.test.mjs`; no existing test or fixture changed. It supersedes `R7C-FREEZE-3` ([record](RUNTIME_FREEZE_R7C_3.json)), `R7C-FREEZE-2` and `R7C-FREEZE-1`; their verifiers now fail `files-current` by design.
- **Phase 7, QE-R7C-10 (what a review read, from the record and its clock):** whether an earlier review read a run is derived from the canonical record available to it, never from the gate it gave. A run done short gives HOLD, adverse runs HOLD or REGRESS, so on R7C-FREEZE-3 a late shortened answer read as already read and the stale projection stayed VALID.
  - **The record notes arrivals:** each completed-work record row carries `provenance.firstRecordedAt`, the clock of the decision whose input first carried a report of that execution. The runtime writes it (`evaluateProgram`), never takes it from the input, keeps it when the row is carried, and keeps the earliest for one execution (an agreeing duplicate, a correction and what it corrects). Evidence visibility only: no dose, no authority; the evidence reducer, HistoricalState, gates and the learning model never read or keep it.
  - **Why new metadata:** without it a late report and an on-time report of a run done short are the same canonical facts (same ledger rows, clocks, gates and stored states; only the review's reason text differs), so no rule on the existing structures can read the first as unread and the second as read.
  - **The rule (`unreadRunReports`), per report:** a week the plan projected read none of its run reports; a week a review closed read exactly the reports the record held by that review's clock, whatever they report and whatever gate they gave; any other start (intake, a return's entry) read the week. The recorded-answer re-plan (`answeredOnRecord`) is otherwise R7C-FREEZE-3's: trigger, order, C9, ceiling re-plan and G01 guard unchanged.
  - **Backward behaviour:** a record written before R7C-FREEZE-4 carries no clock; for such a report the R7C-FREEZE-3 reading stands (the gate-class rule: sound for full-dose and adverse answers; a shortened late answer on such a record reads as on R7C-FREEZE-3). Nothing is migrated: those arrivals were never recorded and are not invented.
  - **Record format (consumers):** every row a decision records now has the extra provenance field. A tool that digests the carried record sees a new value at each such step (the R7-B.2 timeline differential `scripts/regress-r7b2.mjs` does; its stamp-neutral form reads exactly as on R7C-FREEZE-3).
  - **Recorder independence on R7C-FREEZE-4** (evidence `probes/out/*.R7C-P7-*`): the original grid 0/160; the Engineering's shortened grid 0/280 (FREEZE-3 28); the SSCTR's mixed scope 0/768 (FREEZE-3 16, P6-F01) and CC2 0/1,200 (FREEZE-3 18); 1,536 trajectories with no stale valid plan (FREEZE-3 54) and no full-dose or shortened failure. The differential against R7C-FREEZE-3: 128/128 scenarios identical, the habitual late reporters (full dose and shortened) included.
- **Phase 6 (R7C-FREEZE-3), kept:** the recorded-answer re-plan (below), QE-R7C-07 closed at full dose; its reach; the classified fixture pin.
- **Phase 6, QE-R7C-07 (the recorded-answer re-plan, `answeredOnRecord`):** an answer to `UNREPORTED_TRAINING` that a decision recorded without applying it (a refusal: the R4 HOLD; a handler clinical route) is applied by the next eligible decision from the record, whichever decision recorded it, with no re-send, as the same answer delivered directly. Since R7C-FREEZE-4 for every answer shape measured (known stops, executed, shortened, adverse and mixed).
  - **The test, on state:** on the record without the run reports the stored plan did not read, the run doses ahead depend on unreported training; on the record as it stands they do not. The answer week is then re-planned from the facts, with C9, before any handler decides.
    - The reports not read: weeks the plan only projected and, since R7C-FREEZE-4, reports the record first held after the review that closed their week (Phase 7, above). On R7C-FREEZE-3 that second part was a gate test (every run gate holding, now read as executed), which missed shortened runs: QE-R7C-10.
  - **Order kept:** clinical/safety → factual reconciliation → ordinary adaptation. While a clinical route stands nothing is prescribed (960/960 checks). A known stop is still applied by the ceiling re-plan. A partial answer still asks. The re-plan never travels with an `UNREPORTED_TRAINING` question.
  - **Recorder independence:** see Phase 7 above (R7C-FREEZE-3: full-dose answers 0 of 160 and of 1,536 trajectories; shortened 28 of 280; P6-F01 16 of 768).
  - **Reach (accepted by the SSCTR; wider than the Phase 6 request stated, QE-R7C-11):** a stored plan resting on projection over its whole run window, with no evidence anchor in it that read an executed run, follows the record of that window at the first decision whose factual plan differs, however the facts arrived. That covers:
    - never-reviewed reporters, once the intake run leaves the window (week 5);
    - windows of KEEP-only reviews;
    - habitual late reporters.

    It is never above R7C-FREEZE-2 or the single-run ceiling in any measured cell, and it rewrites no history (111 re-plans checked). A plan whose window holds a run a review read keeps projecting until its review (Property B), as before. On the timely weekly-reviewed path see C11.
  - **Classified test update:** five closed state-model tests (`r7asm` T1, T6, T6b, T7c; `r7asc` S3) relied on that projection staying ahead.
    - Their fixture was pinned: week 4's review adopts a back squat logged above the plan, an evidence anchor. No assertion changed.
    - Both gates confirm the classification as EXPECTED_SEMANTIC_UPDATE of the fixture only: with the old fixture only premise assertions fail, and the pinned tests pass on FREEZE-2 too.
- **The single correction cycle** (after the Engineering review of R7C-FREEZE-1, NOT_READY; `audits/domain-coaching-r7-c-2026-11-01/reviews/engineering/`):
  - QE-R7C-01, **partially:** a stored run dose above the single-run ceiling the record allows, resting on credit, is re-planned from the facts whichever decision recorded them (the ceiling re-plan, below). That closes the known-stop answers only; the rest of the class is the open blocker QE-R7C-07;
  - QE-R7C-02 / C9: a factual re-plan never credits the decision week's elapsed run sessions with no report in the weeks it projects;
  - QE-R7C-03: a held reactive signal keeps travelling beside a change kept while the question stays open;
  - QE-R7C-04: the held signal's week guard is tested;
  - QE-R7C-05 is disclosed below, and QE-R7C-06 is closed: `package.json` and `package-lock.json` are bound in FREEZE-2.
- **Semantics accepted:** [SSCTR-SD-R7C-r2](../../../audits/domain-coaching-r7-c-2026-11-01/reviews/ssctr/SSCTR_SEMANTIC_REDISPOSITION_R7C.md), `ACCEPT_R7C_UNKNOWN_SEMANTICS`:
  - a session with no report is unknown, never success or failure;
  - a session reported not done is a known miss;
  - a declared break is a known stop with its return recipe;
  - where a run dose depends on unknown training, the engine asks `UNREPORTED_TRAINING` and plans neither the projection (credit) nor zero;
  - once answered, the answer week and the weeks after are re-planned from the facts.
- **The ceiling re-plan (correction cycle; confirmed by [SSCTR-CC-R7C-r4](../../../audits/domain-coaching-r7-c-2026-11-01/reviews/ssctr/SSCTR_CC_RECHECK_R7C.md): it plans what the reviewed path plans, never raises a dose and never fires on the timely path):**
  - The single-run ceiling the record allows is the longest completed run in the 30 days before the week plus 5 minutes, or the reviewed entry when there is none.
  - A run dose still ahead that exceeds it, while the window holds run sessions of this plan with no executed report outside a declared break, rests on training the record does not show.
  - Such a dose is re-planned from the facts at the next decision, whichever decision recorded them. That includes a known-stop answer a refusal (R4) or a clinical route recorded.
  - Since R7C-FREEZE-3 an executed, mixed or adverse answer recorded that way is re-planned too, by the recorded-answer re-plan (QE-R7C-07, CC-F02); since R7C-FREEZE-4 shortened answers and the P6-F01 mixed patterns as well (QE-R7C-10).
  - Scope: easy running only (a return, restart or walk/jog week follows its re-entry recipe); never a return report (it decides its own re-entry from the break it declares); never a return-entry week (its current demonstration is not in the record); never while a question about unknown training stands (that question decides alone, with no run dose planned).
- **Phase records:** `audits/domain-coaching-r7-c-2026-11-01/` (checkpoints of Phases 1–7).

## Binding consumer conditions (SSCTR-SD-R7C-r2, updated by SSCTR-CC-R7C-r4 and SSCTR-P6-R7C-r5; the acceptance holds only with these)

- **C2:** while a result has planValidity `REQUIRES_RECONCILIATION`, no consumer presents the stored run doses ahead as a prescription. That covers a pending `UNREPORTED_TRAINING` question, a HOLD such as R4, and a clinical dependency. The question, and any strength change kept beside it, are the only actionable items.
- **C3 (G03, before any use beyond the offline reference):**
  - The answer path is low-friction and factual: done or not done per session, or a declared break with its reason, screened clinically.
  - HealthKit evidence is used before asking where available.
  - Non-response never falls back silently to credit or zero.
  - While `referenceState.pending.signal` is present, the answer is delivered as a plain review of that week, or as the pending event kind with its signals.
  - An answer inside another event kind is followed by the held signal re-submitted before the plan is presented.
  - A RECOVERED event does not carry the answer.
  - After a clinical route, the answer is kept and re-sent, or asked again, after qualified clearance (R5).
  - **(r4)** Since R7C-FREEZE-2 a known stop recorded by a refusal or a clinical route is applied by the next decision, with or without the re-send. An adverse or mixed answer recorded by a handler clinical route (a substitution with pain, a clinical return report) is not: after qualified clearance the next decisions keep the stored run doses of that week, and re-sending the answer does not re-plan them. Until an engine fix, after such a route the run doses remaining in that week are not presented as a prescription; the qualified human's clearance and the week's own review decide, and that review re-plans the following week from the facts.
  - **(r5, SSCTR-P6-R7C-r5, replacing the r4 clause above)** Since R7C-FREEZE-3 an answer to UNREPORTED_TRAINING that a refusal (the R4 HOLD) or a handler clinical route (a substitution with pain, a clinical return report) recorded is applied by the first eligible decision after it (after qualified clearance for a clinical route), with no re-send, as the same answer delivered directly. Measured: known stops, executed and adverse answers in every cell; mixed answers in most. Residual: a mixed answer (some runs of the window reported done, some reported not done) recorded by a handler clinical route is not applied, re-send included, when a week of the window was closed by a review that saw none of its run reports and that week has a run reported done but no run role reported done in full; after clearance the next decisions keep the stored run doses of the answer week as VALID (for example QUALITY 34 / LONG 60 where the direct answer plans EASY 45 / LONG 50). Until an engine fix, after a handler clinical route that recorded a mixed answer, the run doses remaining in that week are not presented as a prescription; the qualified human's clearance and the week's own review decide, and that review re-plans the following week from the facts. An eligibility clinical flag still records nothing, so its answer is re-sent after clearance (R5).
  - **Open conflict between the gates (Phase 6), to be settled on R7C-FREEZE-4.**
    - The Engineering review of R7C-FREEZE-3 (QE-R7C-10) showed that an answer with **every run done but shortened** was not applied either, and routed that the r4 clause must not be narrowed while QE-R7C-10 stood. The r5 residual ("mixed") did not name it.
    - Phase 7 fixes QE-R7C-10 and P6-F01 by the same mechanism. The SSCTR is asked for **one single final C3 text** compatible with R7C-FREEZE-4, replacing both the r4 and the r5 clause; after the closure no two C3 texts stay in force.
    - The runtime stays a shadow reference, so no consumer acts on either text now.
- **C8:** in the next runtime revision, the engine never clears a held reactive signal without re-evaluating it, keeping it pending, or at least disclosing it. Until then C3 applies (SSCTR-SD5-02).
- **C9:** after an answer that leaves sessions of the answer week elapsed before it, the following week's conditional projection is not presented or delivered as a prescription until a decision re-plans it. That decision is the answer week's review, or the first decision of the next week, and the client triggers it at the week boundary. **It still binds** (SSCTR-CC-R7C-r4: r2 text verbatim, including the taper-to-race-week case). On R7C-FREEZE-2 its premise holds: the factual re-plan no longer credits the elapsed unreported sessions, and the first decision of week b+1 asks or re-plans within the ceiling in every measured case. The stale projection persists on handler routes that re-compose from the answer week (EXERCISE_SUBSTITUTION, RETURN_AFTER_PAUSE, EVENT_DATE_CHANGE), the taper-to-race-week case included.
  - **Engineering part: done for the factual re-plan in R7C-FREEZE-2.** That re-projection no longer credits the elapsed unreported sessions (read as unknown). A directed test pins week b+1 after a day-2 known-stop answer, including the taper-to-race-week case (SSCTR-SD5-01, FR-03). The first decision of week b+1 keeps only what the facts allow when the answer week's review is skipped (QE-R7C-02).
  - **Still owed** for the handler re-compositions: read the elapsed unreported sessions as unknown in every composition from the answer week, or mark the projection conditional, with a directed test per route, including a substitution answer on day 4 of the taper (SSCTR-CC-R7C-r4, CC-F01).
  - **(r5 status)** R7C-FREEZE-3 does not change the handler re-compositions: the SSCTR's 66 handler cells are identical to R7C-FREEZE-2 (EXERCISE_SUBSTITUTION 44, RETURN_SHORT 14, EVENT_DATE_CHANGE 8). The first decision of week b+1 still asks or re-plans within the single-run ceiling in every measured case. The Engineering part is still owed; the consumer part binds.
  - **QE-R7C-12 (Engineering, MINOR):** after a direct answer, the recorded-answer re-plan fires again later in the answer week. After a known stop it can raise next week's VALID conditional easy runs from 15/15 to the ceiling's 20/20, above the week's own review (6 cells, day 4 until that review). C9's text does not literally cover it, because the 07:00 answer left no answer-week session elapsed. Routed to the SSCTR (C9 semantics). **On R7C-FREEZE-4** it also fires after a direct shortened answer (the Engineering probe `p6-x7` against R7C-FREEZE-3: 6 more re-plans in 224 cells, 2 cells changed, both more conservative: R10K next week QUALITY 34 → EASY 40; no dose raised above the plan before or above R7C-FREEZE-3). Not absorbed: the class stays as classified.
- **C11 (new, SSCTR-P6-R7C-r5; disclosure and G03 presentation note):** On the timely, weekly-reviewed path, since R7C-FREEZE-3 a decision made before the week's review while a run session of the week has elapsed with no report re-plans the following week without crediting it: it holds the quality step (GEN THRESHOLD 3x10 back to the week's 4x8; R10K 5x4 back to 6x3; taper 3x4 to 3x3), and the week's review restores the progression once the reports arrive (24 of 210 measured cells change mid-week, 0 after the review). This is the accepted unknown semantics, not a new dose. Consumers present the following week's plan as provisional until the week's review and do not surface the interim hold as a coaching change; cadence and wording belong to G03.
- **Also in force:**
  - **C4:** the internal label MISSED for an elapsed session with no report never surfaces as "not done"; history and adherence keep "no report" distinct from "reported not done".
  - **C5:** apply a nonclinical substitution strength-only while the run question is pending. Next runtime revision; not blocking.

## Disclosed residuals (C7)

- **D1 (ACCEPTABLE_RESIDUAL, pre-existing):** a third adverse key session mid-week changes nothing until the weekly review. The clinical route is intact.
- **B2:** with a known run anchoring the window and easy runs unreported, the taper's easy runs sit at the minimum. This is conservative.
- **B1:** a hold after about four known-miss weeks while an anchor run is still in the window. B.2-identical; routed to the policy owner.
- **Fifth legacy fixture** (`test/r6-adaptation.test.mjs`, short break): the Phase 2 edit is ratified as the EXECUTED variant; UNREPORTED, KNOWN_MISS and ANSWERED_KNOWN_STOP were added.
- **R1 (C9): narrowed, not closed (SSCTR-CC-R7C-r4, CC-F01).**
  - Fixed on the factual re-plan route: on R7C-FREEZE-1 the next week's projection after a mid-week known-stop answer credited the elapsed stale prescription; on FREEZE-2, 168/168 next-week cells equal the on-time plan, the taper-to-race-week case included.
  - Persisting on handler routes that re-compose the weeks from the answer week (a nonclinical EXERCISE_SUBSTITUTION, a short RETURN_AFTER_PAUSE, an EVENT_DATE_CHANGE): week b+1 stored up to EASY 50/QUALITY 34/LONG 60, and a 25-minute race touch in race week after a taper answer, until the first decision of the next week, which in every measured case asks or re-plans within the single-run ceiling.
- **R2:** re-entry after a known multi-week stop depends on how the facts arrived:
  - the strictly timely path trims the state and plans no quality;
  - the late or batch path progresses at the single-run ceiling, with threshold work in week 4;
  - the declared-break path is RESTART.

  All three stay within D17/D18. Routed to the policy owner (C10).
- **R3:** with adverse evidence in a week whose review asked, the answer holds that week's long run where a timely review steps it back one step, and the step persists into the next week. On the answer path the held long run can sit up to 10 minutes above the on-time step-back (GEN b=5, gap from week 2: LONG 65 against 55), identical on R7C-FREEZE-2 (P6-F07). With mixed evidence, the answer never plans longer.
- **R4 (pre-existing):** a SCHEDULE_CHANGE in the program's last week throws and returns HOLD. An answer it carries is recorded, and the next decision applies it as the same answer delivered directly:
  - a known stop, by the ceiling re-plan (since the correction cycle);
  - an executed, mixed or adverse answer at full dose, by the recorded-answer re-plan (since R7C-FREEZE-3);
  - a shortened answer, by the same re-plan (since R7C-FREEZE-4).

  The HOLD itself is routed to Engineering, not fixed here.
- **R5 (pre-existing):** an eligibility clinical flag returns before the reports are read, so nothing is recorded and the answer is re-sent after clearance (C3). A handler clinical route records the answer, and nothing is prescribed while it stands. After qualified clearance, the first eligible decision applies it with no re-send. Since R7C-FREEZE-4 that holds for every answer shape measured: known stops, executed, shortened, adverse and mixed (including P6-F01's patterns). On a record written before R7C-FREEZE-4 (no first-recorded clocks), a shortened answer such a route recorded keeps R7C-FREEZE-3's reading (backward behaviour above).
- **SSCTR-SD5-02 (narrowed by QE-R7C-03):** a held signal is dropped when the answer arrives inside a non-review event kind that returns VALID (C3, C8). It now survives a change kept beside the open question.
- **QE-R7C-07 (the Engineering recheck of R7C-FREEZE-2): partially closed on R7C-FREEZE-3.**
  - **On FREEZE-2:** an answer that reported executed, mixed or adverse training, recorded by a decision that did not apply it (an R4 HOLD, a handler clinical route), was never applied. The stale projection stayed VALID in 72 of 160 cells: a race touch in race week, taper quality, QUALITY 34 / LONG 60 where the adverse answer delivered directly gives EASY 45 / LONG 35.
  - **On FREEZE-3:** 0 of 160, and 0 of 1,536 trajectories at full dose. The rest of the class was QE-R7C-10, fixed on R7C-FREEZE-4.
- **QE-R7C-10 (BLOCKER on R7C-FREEZE-3; fixed in Phase 7, gates pending):** shortened executed answers were recorder-dependent.
  - **Mechanism on FREEZE-3:** a week a review closed while no run was reported counted as unread only if its late runs then read as executed; shortened runs read as HOLD.
  - **Reproduction on FREEZE-3:** GEN week 7, weeks reviewed with strength only, every gap run done at 60 %, recorded by a clinical substitution with pain, then cleared: the next day's plain review returned KEEP, VALID, QUALITY 34 / LONG 60 where the direct answer gives EASY 44 / LONG 44 (R10K taper: QUALITY 28 / LONG 45 against EASY 30 / LONG 40). 28 of 280 cells.
  - **On R7C-FREEZE-4:** 0 of 280 (Phase 7 above); the same cell re-plans from the facts as the direct answer (`test/r7c-phase7.test.mjs`, visibility (3)).
- **P6-F01 (SSCTR condition on R7C-FREEZE-3, same cause):** some mixed answers recorded by a handler clinical route were not applied (C3 r5 residual), 16 of 768 SSCTR cells; 0 of 768 and 0 of 1,200 (CC2) on R7C-FREEZE-4, by the same fix, no special case.
- **QE-R7C-11 (MINOR):** the reach is wider than the Phase 6 request stated. It changes Property B's scope, conservatively; see the reach above.
  - The G01 grid A changed **8 rows** (MISS and UNREP plans) with **4 verdict changes** (OK_INDEPENDENT → OK_HOLD_LIKE_REVIEWED_MISS), and 0 violations.
  - The Phase 6 differential's 120 identical scenarios do not cover the mid-week case of C11.
- **QE-R7C-13 (OBSERVATION):** a factual re-plan can travel beside an `UNREPORTED_TRAINING` question about a later week. It happens through the transition path of SD-01 (the answer inside the review that receives it) and also through the MOVED origin (a correction inside the same change), identically on FREEZE-2 and FREEZE-3.
  - The recorded-answer re-plan never travels that way (G01 guard).
  - Either way the result is `REQUIRES_RECONCILIATION`, never valid (C2), and on FREEZE-3 the paths converge at the next decision.
  - Classified by Engineering as an acceptable disclosed residual.
- **QE-R7C-14 (OBSERVATION on R7C-FREEZE-3):** the directed tests used full-dose answers only, and one judge mutant (REGRESS not counted as executed) survived. Phase 7's directed tests cover shortened (60 %, 80 %, the long run only, with misses, with adverse responses), all-adverse and mixed answers, timely reviews that gave HOLD or REGRESS on reports they had, and present and late reports of one week. Each Phase 7 mutant is killed by its own witness; the judge's mutant survives only in the reading kept for records without clocks, where it is now F7-M7, killed by the backward-behaviour test.
- **P6-F03, P6-F04 (SSCTR disclosures, C7):** in never-reviewed weeks the facts reading holds every run role.
  - After adverse long runs, the long run stays at the stored dose where the review steps it back, up to 10 minutes above.
  - A lift also done in another session keeps its executed load: 24 against 22 kg.
- **QE-R7C-05:** on FREEZE-3 the Engineering probe's two batch checks pass (81/81; FREEZE-2 79/81). The residual below is kept as history.
- **QE-R7C-08 / CC-F04 (minor, pre-existing):** never reported, easy running: within the intake window a credited progression below the single-run ceiling, quality activation included, stands at non-review decisions until the week's own review (e.g. EASY 50/QUALITY 34/LONG 65 against the reviewed EASY 45/45/LONG 60). Only doses above the minute ceiling are re-planned. Disclosed (SSCTR C7).
- **CC-F05 (pre-existing):** never-reported restart and walk/jog progress on credit, outside the unknown window by design (restart, re-entry and walk/jog follow their own recipe), e.g. EASY 30/LONG 35 by week 5 against 15. Disclosed (SSCTR C7).
- **QE-R7C-09 (observation):** after an uncredited re-plan, week b+1's start premise still names the uncredited session as assumed executed. No decision reads it.
- **QE-R7C-05 (minor, conservative):** a partial executed answer followed by the rest gives a more conservative answer week than the same facts in one batch, including through a schedule change. Both converge at the week's review.

## Routed, not done here

- **C10 (policy owner, SSCTR with PCG):** coherence of re-entry across report timings (R2). There is no new rule without its own evidence review. Extended with CC-F06 (SSCTR-CC-R7C-r4; adequacy, not safety): after a short return following known misses, the reviewed path returns to the entry the week after the re-entry week, as on R7B2-FREEZE-1, and the late path now matches it.
- **Engineering, a later runtime mission (its own Founder authorization):**
  - QE-R7C-10 is Phase 7's (above);
  - QE-R7C-13 (extend the G01 guard to every factual origin, or disclose it);
  - CC-F01 (C9's Engineering part on the handler re-compositions), C8 (held signals), C5 (substitution), R4 (the last-week schedule change HOLD itself) and QE-R7C-09.
  - QE-R7C-08 stays a disclosure or a policy question for the SSCTR.
- **SSCTR:** Property B's scope under the reach (QE-R7C-11); C9 under the direct path's repeated re-plan (QE-R7C-12); the single final C3 text on R7C-FREEZE-4 (Phase 7's recheck).
- **G03 (Product/Data):** C3 and C4, the answer path, cadence and wording.
- **Proposed queue items** (listed in SSCTR-SD-R7C-r2, not appended): the R7-C unknown semantics, and the G02 binding.
