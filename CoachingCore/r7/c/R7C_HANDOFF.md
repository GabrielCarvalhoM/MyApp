# R7-C (Longitudinal Coaching) — handoff for consumers and later missions

What R7-C changes, what binds any consumer of this runtime, and what is routed. Shadow reference runtime only: `V1_COACHING_AUTHORITY_READY = NO`.

**Status: R7-C Phase 6 (QE-R7C-07) frozen as `R7C-FREEZE-3`, under the Engineering review and the SSCTR narrow recheck (2026-11-02).** Phase 5 closed CLOSED_NOT_READY on QE-R7C-07 (the Engineering recheck of R7C-FREEZE-2, `audits/domain-coaching-r7-c-2026-11-01/reviews/engineering/ENGINEERING_RECHECK_R7C.md`); Phase 6 is the Founder's specific fix of that blocker, with no correction loop.

## Runtime and records

- **Freeze:** `R7C-FREEZE-3` ([record](RUNTIME_FREEZE_R7C_3.json); verifier `node CoachingCore/scripts/verify-r7c.mjs --revision 3`, 20/20 with `--suite`: [report](VERIFICATION_R7C_3.json)), commit `08c6db3`, record sha256 `e21da973…0f36`, source `764ad023…4b38`, manifest `ebc8af2f…bbaa`, 163 files, 866/866, on top of R7B2-FREEZE-1 (`1a1c728`). Only `src/r6-adaptation.mjs` and `src/r6-composition.mjs` differ from it. It supersedes `R7C-FREEZE-2` ([record](RUNTIME_FREEZE_R7C_2.json), commit `a10cec0`) and `R7C-FREEZE-1` ([record](RUNTIME_FREEZE_R7C_1.json)); their verifiers now fail `files-current` by design.
- **Phase 6, QE-R7C-07 (the recorded-answer re-plan, `answeredOnRecord`):** an answer to `UNREPORTED_TRAINING` that a decision recorded without applying it (a refusal: the R4 HOLD; a handler clinical route) is applied by the next eligible decision from the record, whichever decision recorded it, with no re-send. Same answer + same record + same clock + same safety state = same plan.
  - **The test, on state:** on the record without the run reports the stored plan did not read (weeks it only projected; weeks a review closed with every run gate holding that the record now shows executed), the run doses ahead depend on unreported training; on the record as it stands they do not. The answer week is then re-planned from the facts, with C9, before any handler decides. No new schema.
  - **Order kept:** clinical/safety → factual reconciliation → ordinary adaptation. While a clinical route stands nothing is prescribed. A known stop is still applied by the ceiling re-plan. A partial answer still asks. The re-plan never travels with an `UNREPORTED_TRAINING` question.
  - **Recorder independence:** 0 of 160 cells (72 on FREEZE-2): EXEC, MIXED, ADVERSE, MISS and PARTIAL, through the R4 HOLD and the clinical route, with and without the re-send.
  - **Reach (a consequence of carrier independence on state):** a stored plan that rests on projection over its whole run window, with no evidence anchor in it that read an executed run, follows the record of that window at the first decision whose factual plan differs, however the facts arrived. That includes on-time reports under KEEP reviews or none. A plan whose window holds a run a review read keeps projecting until its review (Property B), as before.
  - **Classified test update:** five closed state-model tests (`r7asm` T1, T6, T6b, T7c; `r7asc` S3) relied on that projection staying ahead. Their fixture was pinned, EXPECTED_SEMANTIC_UPDATE of the fixture only: week 4's review adopts a back squat logged above the plan, an evidence anchor. No assertion changed.
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
  - Such a dose is re-planned from the facts at the next decision, whichever decision recorded them. That includes a known-stop answer a refusal (R4) or a clinical route recorded. Since R7C-FREEZE-3 an executed, mixed or adverse answer recorded that way is re-planned too, by the recorded-answer re-plan (QE-R7C-07, CC-F02).
  - Scope: easy running only (a return, restart or walk/jog week follows its re-entry recipe); never a return report (it decides its own re-entry from the break it declares); never a return-entry week (its current demonstration is not in the record); never while a question about unknown training stands (that question decides alone, with no run dose planned).
- **Phase records:** `audits/domain-coaching-r7-c-2026-11-01/` (checkpoints of Phases 1–6).

## Binding consumer conditions (SSCTR-SD-R7C-r2, updated by SSCTR-CC-R7C-r4; the acceptance holds only with these)

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
  - **Engine fix in R7C-FREEZE-3 (QE-R7C-07):** after qualified clearance the first eligible decision applies an executed, mixed or adverse answer the handler clinical route recorded, with no re-send. Whether the r4 clause above can be narrowed is the SSCTR's to decide; until it does, it stands as written. An eligibility clinical flag still returns before the reports are read, so its answer is still re-sent (R5).
- **C8:** in the next runtime revision, the engine never clears a held reactive signal without re-evaluating it, keeping it pending, or at least disclosing it. Until then C3 applies (SSCTR-SD5-02).
- **C9:** after an answer that leaves sessions of the answer week elapsed before it, the following week's conditional projection is not presented or delivered as a prescription until a decision re-plans it. That decision is the answer week's review, or the first decision of the next week, and the client triggers it at the week boundary. **It still binds** (SSCTR-CC-R7C-r4: r2 text verbatim, including the taper-to-race-week case). On R7C-FREEZE-2 its premise holds: the factual re-plan no longer credits the elapsed unreported sessions, and the first decision of week b+1 asks or re-plans within the ceiling in every measured case. The stale projection persists on handler routes that re-compose from the answer week (EXERCISE_SUBSTITUTION, RETURN_AFTER_PAUSE, EVENT_DATE_CHANGE), the taper-to-race-week case included.
  - **Engineering part: done for the factual re-plan in R7C-FREEZE-2.** That re-projection no longer credits the elapsed unreported sessions (read as unknown). A directed test pins week b+1 after a day-2 known-stop answer, including the taper-to-race-week case (SSCTR-SD5-01, FR-03). The first decision of week b+1 keeps only what the facts allow when the answer week's review is skipped (QE-R7C-02).
  - **Still owed** for the handler re-compositions: read the elapsed unreported sessions as unknown in every composition from the answer week, or mark the projection conditional, with a directed test per route, including a substitution answer on day 4 of the taper (SSCTR-CC-R7C-r4, CC-F01).
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
- **R3:** with adverse evidence in a week whose review asked, the answer holds that week's long run where a timely review steps it back one step, and the step persists into the next week. With mixed evidence, the answer never plans longer.
- **R4 (pre-existing):** a SCHEDULE_CHANGE in the program's last week throws and returns HOLD. An answer it carries is recorded. The next decision applies it: a known stop by the ceiling re-plan (since the correction cycle), an executed, mixed or adverse answer by the recorded-answer re-plan (since R7C-FREEZE-3), as the same answer delivered directly. The HOLD itself is routed to Engineering, not fixed here.
- **R5 (pre-existing):** an eligibility clinical flag returns before the reports are read, so nothing is recorded and the answer is re-sent after clearance (C3). A handler clinical route records the answer: while it stands nothing is prescribed, and after qualified clearance the first eligible decision applies it with no re-send, whatever the answer reports (since R7C-FREEZE-3).
- **SSCTR-SD5-02 (narrowed by QE-R7C-03):** a held signal is dropped when the answer arrives inside a non-review event kind that returns VALID (C3, C8). It now survives a change kept beside the open question.
- **QE-R7C-07 (the Engineering recheck of R7C-FREEZE-2; fixed in R7C-FREEZE-3, under review):** on FREEZE-2 an answer that reported executed, mixed or adverse training, recorded by a decision that did not apply it (an R4 HOLD, a handler clinical route), was never applied; the stale projection stayed VALID (a race touch in race week, taper quality, QUALITY 34 / LONG 60 where the adverse answer delivered directly gives EASY 45 / LONG 35), in 72 of 160 cells. On FREEZE-3 the recorded-answer re-plan applies it: 0 of 160.
- **Edge (disclosed):** the transition path of SD-01 (the answer inside the review that receives it) lets its re-plan travel beside an `UNREPORTED_TRAINING` question about a later week; the recorded-answer re-plan never does (G01). Either way the result is `REQUIRES_RECONCILIATION`, never valid (C2).
- **QE-R7C-08 / CC-F04 (minor, pre-existing):** never reported, easy running: within the intake window a credited progression below the single-run ceiling, quality activation included, stands at non-review decisions until the week's own review (e.g. EASY 50/QUALITY 34/LONG 65 against the reviewed EASY 45/45/LONG 60). Only doses above the minute ceiling are re-planned. Disclosed (SSCTR C7).
- **CC-F05 (pre-existing):** never-reported restart and walk/jog progress on credit, outside the unknown window by design (restart, re-entry and walk/jog follow their own recipe), e.g. EASY 30/LONG 35 by week 5 against 15. Disclosed (SSCTR C7).
- **QE-R7C-09 (observation):** after an uncredited re-plan, week b+1's start premise still names the uncredited session as assumed executed. No decision reads it.
- **QE-R7C-05 (minor, conservative):** a partial executed answer followed by the rest gives a more conservative answer week than the same facts in one batch, including through a schedule change. Both converge at the week's review.

## Routed, not done here

- **C10 (policy owner, SSCTR with PCG):** coherence of re-entry across report timings (R2). There is no new rule without its own evidence review. Extended with CC-F06 (SSCTR-CC-R7C-r4; adequacy, not safety): after a short return following known misses, the reviewed path returns to the entry the week after the re-entry week, as on R7B2-FREEZE-1, and the late path now matches it.
- **Engineering, a later runtime mission (its own Founder authorization):** CC-F01 (C9's Engineering part on the handler re-compositions); then C8 (held signals), C5 (substitution), R4 (the last-week schedule change HOLD itself), and QE-R7C-09. QE-R7C-07 and CC-F02 are the Phase 6 fix (R7C-FREEZE-3). QE-R7C-08 stays a disclosure or a policy question for the SSCTR.
- **G03 (Product/Data):** C3 and C4, the answer path, cadence and wording.
- **Proposed queue items** (listed in SSCTR-SD-R7C-r2, not appended): the R7-C unknown semantics, and the G02 binding.
