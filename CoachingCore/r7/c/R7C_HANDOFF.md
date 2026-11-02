# R7-C (Longitudinal Coaching) — handoff for consumers and later missions

What R7-C changes, what binds any consumer of this runtime, and what is routed. Shadow reference runtime only: `V1_COACHING_AUTHORITY_READY = NO`.

## Runtime and records

- **Freeze:** `R7C-FREEZE-2` ([record](RUNTIME_FREEZE_R7C_2.json); verifier `node CoachingCore/scripts/verify-r7c.mjs --revision 2`), commit `a10cec0`, on top of R7B2-FREEZE-1 (`1a1c728`). Only `src/r6-adaptation.mjs` and `src/r6-composition.mjs` differ from it. It supersedes `R7C-FREEZE-1` ([record](RUNTIME_FREEZE_R7C_1.json)).
- **The single correction cycle** (after the Engineering review of R7C-FREEZE-1, NOT_READY; `audits/domain-coaching-r7-c-2026-11-01/reviews/engineering/`):
  - QE-R7C-01: a stored run dose above the single-run ceiling the record allows, resting on credit, is re-planned from the facts whichever decision recorded them (the ceiling re-plan, below);
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
- **The ceiling re-plan (correction cycle; subject to the SSCTR recheck of the cycle):**
  - The single-run ceiling the record allows is the longest completed run in the 30 days before the week plus 5 minutes, or the reviewed entry when there is none.
  - A run dose still ahead that exceeds it, while the window holds run sessions of this plan with no executed report outside a declared break, rests on training the record does not show.
  - Such a dose is re-planned from the facts at the next decision, whichever decision recorded them. That includes the answer a refusal (R4) or a clinical route recorded.
  - Scope: easy running only (a return, restart or walk/jog week follows its re-entry recipe); never a return report (it decides its own re-entry from the break it declares); never a return-entry week (its current demonstration is not in the record); never while a question about unknown training stands (that question decides alone, with no run dose planned).
- **Phase records:** `audits/domain-coaching-r7-c-2026-11-01/` (checkpoints of Phases 1–5).

## Binding consumer conditions (SSCTR-SD-R7C-r2; the acceptance holds only with these)

- **C2:** while a result has planValidity `REQUIRES_RECONCILIATION`, no consumer presents the stored run doses ahead as a prescription. That covers a pending `UNREPORTED_TRAINING` question, a HOLD such as R4, and a clinical dependency. The question, and any strength change kept beside it, are the only actionable items.
- **C3 (G03, before any use beyond the offline reference):**
  - The answer path is low-friction and factual: done or not done per session, or a declared break with its reason, screened clinically.
  - HealthKit evidence is used before asking where available.
  - Non-response never falls back silently to credit or zero.
  - While `referenceState.pending.signal` is present, the answer is delivered as a plain review of that week, or as the pending event kind with its signals.
  - An answer inside another event kind is followed by the held signal re-submitted before the plan is presented.
  - A RECOVERED event does not carry the answer.
  - After a clinical route, the answer is kept and re-sent, or asked again, after qualified clearance (R5).
- **C8:** in the next runtime revision, the engine never clears a held reactive signal without re-evaluating it, keeping it pending, or at least disclosing it. Until then C3 applies (SSCTR-SD5-02).
- **C9:** after an answer that leaves sessions of the answer week elapsed before it, the following week's conditional projection is not presented or delivered as a prescription until a decision re-plans it. That decision is the answer week's review, or the first decision of the next week, and the client triggers it at the week boundary. Its continued binding after the cycle is for the SSCTR recheck.
  - **Engineering part: done in R7C-FREEZE-2.** The re-projection no longer credits those elapsed unreported sessions (read as unknown). A directed test pins week b+1 after a day-2 known-stop answer, including the taper-to-race-week case (SSCTR-SD5-01, FR-03). The first decision of week b+1 keeps only what the facts allow when the answer week's review is skipped (QE-R7C-02).
- **Also in force:**
  - **C4:** the internal label MISSED for an elapsed session with no report never surfaces as "not done"; history and adherence keep "no report" distinct from "reported not done".
  - **C5:** apply a nonclinical substitution strength-only while the run question is pending. Next runtime revision; not blocking.

## Disclosed residuals (C7)

- **D1 (ACCEPTABLE_RESIDUAL, pre-existing):** a third adverse key session mid-week changes nothing until the weekly review. The clinical route is intact.
- **B2:** with a known run anchoring the window and easy runs unreported, the taper's easy runs sit at the minimum. This is conservative.
- **B1:** a hold after about four known-miss weeks while an anchor run is still in the window. B.2-identical; routed to the policy owner.
- **Fifth legacy fixture** (`test/r6-adaptation.test.mjs`, short break): the Phase 2 edit is ratified as the EXECUTED variant; UNREPORTED, KNOWN_MISS and ANSWERED_KNOWN_STOP were added.
- **R1 (C9): fixed in R7C-FREEZE-2, subject to the SSCTR recheck.** On R7C-FREEZE-1, after a mid-week known-stop answer, the next week's projection credited the elapsed stale prescription: up to EASY 50 / QUALITY 34 / LONG 55, and a race touch in race week. On FREEZE-2 week b+1 equals the on-time plan in the 8 measured cases, the taper-to-race-week case included.
- **R2:** re-entry after a known multi-week stop depends on how the facts arrived:
  - the strictly timely path trims the state and plans no quality;
  - the late or batch path progresses at the single-run ceiling, with threshold work in week 4;
  - the declared-break path is RESTART.

  All three stay within D17/D18. Routed to the policy owner (C10).
- **R3:** with adverse evidence in a week whose review asked, the answer holds that week's long run where a timely review steps it back one step, and the step persists into the next week. With mixed evidence, the answer never plans longer.
- **R4 (pre-existing):** a SCHEDULE_CHANGE in the program's last week throws and returns HOLD. An answer it carries is recorded. Since the correction cycle, the next decision applies it (the ceiling re-plan). The HOLD itself is routed to Engineering.
- **R5 (pre-existing):** an eligibility clinical flag returns before the reports are read; the answer is re-sent after clearance (C3). After a handler clinical route, which records the answer, the next decision after qualified clearance applies it, with or without the re-send.
- **SSCTR-SD5-02 (narrowed by QE-R7C-03):** a held signal is dropped when the answer arrives inside a non-review event kind that returns VALID (C3, C8). It now survives a change kept beside the open question.
- **QE-R7C-05 (minor, conservative):** a partial executed answer followed by the rest gives a more conservative answer week than the same facts in one batch, including through a schedule change. Both converge at the week's review.

## Routed, not done here

- **C10 (policy owner, SSCTR with PCG):** coherence of re-entry across report timings (R2). There is no new rule without its own evidence review.
- **Engineering, next runtime revision:** C8 (held signals), C5 (substitution), R4 (the last-week schedule change HOLD itself). C9's projection part was done in the correction cycle.
- **G03 (Product/Data):** C3 and C4, the answer path, cadence and wording.
- **Proposed queue items** (listed in SSCTR-SD-R7C-r2, not appended): the R7-C unknown semantics, and the G02 binding.
