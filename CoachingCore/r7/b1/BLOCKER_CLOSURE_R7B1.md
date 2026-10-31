# R7-B.1 — blocker closure record

DOMAIN_COACHING_R7-B.1 (contract [R7B1-CONTRACT-r1](../../../audits/domain-coaching-r7-b1-2026-10-31/TASK_CONTRACT.md)) closes the explicit blockers of the R7-B closure ([handoff](../b/R7B_CLOSURE_HANDOFF.md)) on the predecessor runtime **R7B-RUNTIME-REPERTOIRE-FREEZE-2** (`10b26d6`, source `d2c73014…`). For each blocker: finding → root cause → authority → runtime path → fix → regression test → preservation. Tests are in [`test/r7b1-residual-closure.test.mjs`](../../test/r7b1-residual-closure.test.mjs); "RED on FREEZE-2" means the test fails on the FREEZE-2 bytes (`git archive 10b26d6`) and passes on these.

Nothing in R6-POLICY-5, R7B0-CATALOG-2, its schema or the 13 B0 SSCTR r2 records changed; no catalog or policy contradiction was found.

## B1 — QE-R7B-OBS-04: event-week substitution (SSCTR, blocking)

- **Finding.** A reason-based substitution requested in the taper or race week put a configuration never performed in the program into TAPER, RACE_WEEK and POST_EVENT sessions (SSCTR r06: 18 of 20).
- **Root cause.** The planner applied the event-week rule to the dose (phase reduction, MAIN only in race and post-event weeks) but nothing kept a configuration that a reason-based substitution placed in a slot out of those weeks, so its first exposure could fall in them.
- **Authority.** R6-EVENT-TRANSITION condition 7 (no new exercise, load increase or rotation in taper and race week); B0-C05 condition 1 (no new exercise in TAPER, RACE_WEEK or POST_EVENT); R6-SUBSTITUTION condition 8 (a pattern without a substitute is omitted and disclosed); B0-C06 condition 8 (the clinical screen first); the SSCTR R7B-SSCTR-r2 required change. The planner's own taper instruction already said "no new exercises or heavier loads". No new policy.
- **Runtime path.** `src/r6-program.mjs` `strengthRowsFor` (per day phase, from the week's start state), `eventWeekStandIn`, `buildWeek` (session `eventStandIns`); `src/r6-adaptation.mjs` `exerciseSubstitution` and `eventWeekDisclosure`; `src/r7b-repertoire.mjs` `buildTemplates` marks a set-aside fallback row (`fallbackFor`).
- **Fix.** On a TAPER, RACE_WEEK or POST_EVENT day, a slot whose configuration a reason-based substitution placed there (its decision, or the fallback of the configuration it set aside) and which this program has not performed takes a configuration this program has performed. That configuration must be:
  - not set aside;
  - an admissible alternative of the set-aside one (B0-C06 condition 1: same subpattern or group, a shared primary muscle, within one demand step) in the slot's role and MAIN subpatterns;
  - available with the equipment of that date, at an admissible skill;
  - after a SKILL_MISMATCH, in the reason's direction;
  - not already in the session.

  The most recently performed one is chosen. Otherwise the slot is left out of that session. "Performed" means executed in this program: the week's start state holds an execution date on or after the program start. An exercise reported only at intake does not count.

  The substitute starts after the post-event week with its own establishment. The decision states it in the `NO_NEW_EXERCISE_IN_EVENT_WEEKS` disclosure, which lists the stand-ins, the sessions left out, and the option to keep the exercise until after the event. The clinical screen and the questions are unchanged and come first.
- **Regression tests.**
  - In TAPER, RACE_WEEK and POST_EVENT, for both reasons and every exercise in use: no never-performed exercise, the set-aside one leaves, the substitute's first exposure after the event is an establishment, and the decision discloses it.
  - A performed, admissible stand-in is used at its own dose (rotation case).
  - After a SKILL_MISMATCH, a stand-in follows the reason's direction, or the slot is left out.
  - An exercise familiar at intake but never performed here is still new.
  - A program that ends with the post-event week still records the decision.
  - The clinical screen and the questions come first.
  - All of these are RED on FREEZE-2.
- **Preservation.** A substitution before the taper whose substitute was performed keeps it in the taper (unchanged). Planned taper, combined strength taper and event-transition semantics are byte-identical (timeline differential `corpus:*`, `event:planned-taper`). SSCTR r06 on these bytes: 0 of 20. The decision's own projection may show the substitute in later event weeks when it is planned in an earlier week (a conditional projection assumes planned exposures executed). The weekly review of that week re-plans from the evidence: missed → left out. The adversarial probe P1 counts these cases (`projectedOnly`).
- **Not changed (observation for the SSCTR).** The inherited R6-SUBSTITUTION path, a permanent equipment change in the taper week, still brings same-intent substitutes in the event weeks. It is not a reason-based substitution and is not in this blocker's scope (adversarial P1 `inheritedEquipmentChangeInTaper`).

## B2 — QE-R7B-R2-01: rebuilt novice templates not stored (Engineering, BLOCKER)

- **Finding.** After a decision that rebuilt the capped (novice) templates, the next weekly review composed capped weeks from the intake's templates. That reverted a capped novice's substitution, lost a cap started by a schedule change (SSCTR F9), and made the review after a switch to kettlebell only UNSUPPORTED.
- **Root cause.** `rebuild` built its proposal fields without `noviceTemplates`. `finishProposal` copied none. The equipment change passed none. A stored proposal therefore kept the previous context's capped templates while its context changed.
- **Authority.** R7-A.1 C2 (the context in force travels with the program); B0-C08 (novice density); the state model (planned ≠ released ≠ executed; whether a week is capped is the state's).
- **Runtime path.** `src/r6-adaptation.mjs` `finishProposal`, `rebuild` (fields), `equipmentChange` (both proposals).
- **Fix.** A proposal that changes the context stores that context's `noviceTemplates`. If the new context has none, they are removed. Nothing else is copied, and the cap itself stays in the state (`densityCappedAt`).
- **Regression tests.** Capped novice SKILL_MISMATCH and preference substitutions survive the next weekly reviews. A cap started by a schedule change survives, and the plan is capped exactly when its state is. A kettlebell-only change while capped survives the next reviews. All RED on FREEZE-2.
- **Preservation.** Programs without novice templates are byte-identical (no field added). SSCTR r03 and r04 differ from FREEZE-2 only by F9 resolved. P2 (adversarial) covers seven decision kinds × the next weekly reviews.

## B3 — QE-R7B-R2-02: the block-choice ASK dropped the factual re-plan (Engineering, MAJOR; introduced by the R7-B fix cycle)

- **Finding.** A review carrying a correction and a block choice returned ASK without the factual re-plan. The sessions ahead stayed planned from retracted facts (R7-A A5 regression), and a graduation withdrawal waited for the next review.
- **Root cause.** `evaluateProgram` computed the canonical factual state (factual re-plan, graduation withdrawal) and then returned its two block-choice questions directly, without passing them through `withFactualReplan`. These are the question of a review that is not a complete weekly review, and the question of a complete review whose handler never reached the block-boundary step.
- **Authority.** R7-A A5 and the residual authority closure (QE-R7ADA-01): the canonical factual state comes before any decision; a question still carries the re-plan, because the facts it follows stand.
- **Runtime path.** `src/r6-adaptation.mjs` `evaluateProgram`.
- **Fix.** Both block-choice questions are decisions like any other. A question raised by the factual re-plan itself keeps precedence. Otherwise the block-choice question carries the factual proposal and its disclosures through `withFactualReplan`. A review rejected before anything is recorded (unrecognised choice, malformed list) records nothing and proposes nothing, as before, so record and plan agree.
- **Regression tests.**
  - A mid-week correction with a block choice: ASK with exactly the correction's re-plan.
  - Another review kind, the same.
  - A complete final-week review, the same.
  - A graduation answer: ASK with the withdrawal.
  - No stale-state resurrection: the follow-up review and the next weekly review keep the corrected basis, and history agrees.
  - Without a correction: ASK, nothing proposed.
  - All RED on FREEZE-2 except the last.
- **Preservation.** In the timeline differential (`r202`), R7-B.1's question carries exactly the re-plan FREEZE-2 gives for the same correction without the choice. The next three weekly reviews are identical. P3 (adversarial) covers four review kinds × five choices × two corrections.

## B4 — QE-R7B-R2-03: the SKILL_MISMATCH fallback climbed the ladder (Engineering, MAJOR)

- **Finding.** db-rdl was set aside for SKILL_MISMATCH and replaced by kb-deadlift. Once the kettlebell went (permanently or in a window), the fallback prescribed single-leg-rdl-db, the next rung above db-rdl.
- **Root cause.** When the configuration a slot reaches through its recorded decisions is set aside and the decision's substitute no longer fits, `buildTemplates` took the slot's best configuration, ranked with the higher admissible skill first.
- **Authority.** Catalog `strength.substitution` (SKILL_MISMATCH: "the previous configuration on its skill ladder"); B0-C07 condition 1 (regression along the chain); the B0 skill ladders; the request: fallback skill ≤ current admissible skill, and losing equipment never raises the skill demand.
- **Runtime path.** `src/r7b-repertoire.mjs` `buildTemplates`, `ladderDown`, `followsSkillMismatch`; `src/r6-adaptation.mjs` `skillMismatchGap` (`equipmentChange`, `exerciseSubstitution`).
- **Fix.** Where the set-aside configuration was in use (the decision's slots, or a template the decision did not see), the fallback follows the reason. It is a rung below on its ladder (nearest first) or of lower skill, and never above the skill of the substitute the decision selected. Without such a configuration the slot stays unfilled (`asideGaps`), and the decision that removed the equipment asks (`NO_LOWER_SKILL_ALTERNATIVE`).

  A slot that only reached the set-aside configuration because the substitute left it keeps its R7-B fallback. Binding those slots too had produced false questions (found by the timeline differential and fixed before the freeze).
- **Regression tests.** A permanent loss never climbs, also after later reviews. A dated window never climbs, and the substitute returns after it. The fallback never rises above the substitute in use, even where harder options lie below the set-aside one. With no lower option the change asks. A substitute that held another slot is still applied. All RED on FREEZE-2 except the last (preservation).
- **Preservation.** P4 (adversarial): 52 substitutions × permanent and window losses, 0 climbs. The substitution grid of the engineering recheck: the 138 applied decisions are unchanged except the 8 FREEZE-2 could not apply in every slot (B5).

## B5 — QE-R7B-01 and QE-R7B-05 residuals (Engineering)

- **QE-R7B-01** ("the plan prescribes what the decision selects") still failed at FREEZE-2 through R2-01, R2-03 and R2-04. R2-01 and R2-03 are closed above.

  **R2-04** (8 of 138 grid decisions named an exercise already in the same session, so the replaced slot got another one, once two rungs up) is closed as the residual path of QE-R7B-01. `exerciseSubstitution` keeps R7-B's candidate order, so its first candidate is the R7-B choice. It tries the next candidate when one cannot take every template slot of the replaced exercise (`slipsFrom`), and asks about a named one.

  Grid: inconsistent 8 → 0, exactly those 8 decisions changed, and the other 130 applied decisions are unchanged. Tests: three grid scenarios and a named exercise, RED on FREEZE-2.
- **QE-R7B-05** (the cap a context change starts) failed through R2-01, closed above.

  **R2-05**, listed beside it by the judge, occurs only when an elapsed week receives no review at all. That is the R18 contract path, which request §9 excludes. With the week reviewed, even with nothing reported, the cap holds (adversarial RES, judge's N2 control). Recorded, not changed.
- Not changed: QE-R7B-R2-OBS-01 and QE-R7B-OBS-01 … -03 (observations routed to a later runtime mission), F6, F7, F8, F10 and the rest of the R7-B backlog.

## Evidence on these bytes

| Evidence | Result |
|---|---|
| Suite | all pass (733 R7-B and earlier tests unchanged + the R7-B.1 file); see the freeze record |
| R7-B.1 tests on FREEZE-2 | RED except the preservation tests |
| R7-B conformance (`scripts/conformance-r7b.mjs`) | PASS, 301 entries |
| Timeline differential vs FREEZE-2 (`scripts/regress-r7b1.mjs`) | PASS: 98 preservation timelines identical; blocker paths classified; grid 8 → 0; envelope 0; run rises 0; R2-02 cross-check identical |
| Adversarial probes (`audits/domain-coaching-r7-b1-2026-10-31/probes/`) | R7-B.1: 0 failed; FREEZE-2: 445 failed across all grids |
| Mutation (`scripts/mutate-r7b1.mjs`) | 15 of 15 killed |
| R7-B mutation on these bytes (`scripts/mutate-r7b.mjs`) | see the freeze record |
| Engineering and SSCTR recheck probes of R7-B, from a temporary mirror | no PASS → FAIL; N1, N1b, N3, N5, A10, A13, N7a–d FAIL → PASS; SSCTR 17 of 20 byte-identical, r03, r04 and r06 changed as intended |
