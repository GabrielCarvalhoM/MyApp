# R6 quality and reliability review

**Verdict: FAIL (QUALITY_BLOCKED).** Freeze digest `507f35fc66f4d1e105e19ce513dc067f9fee5fdc35c039ad52a8c825e46bf857` matched at the start and the end of the review. Independent judge. All checks use the real `r6Authority()`; the development authority was not used. The full record is in `quality-engineering-review.json`, and the probes and their raw outputs are in `quality-engineering/`.

## What holds

- **Freeze and authority.** All 53 frozen files match. The real authority enables exactly the ten approved SSCTR records, bound to policy `af2779fe…`. Changing a single policy value disables all ten boundaries. With any one boundary removed, the runtime fails closed for that boundary.
- **Determinism.** Results are deterministic within a process, across fresh processes and across four process time zones. The R6 source reads no wall clock and uses no randomness.
- **Immutability.** Across 486 reviews:
  - inputs were never mutated;
  - the official plan state and the completed-work field never changed;
  - no past prescription was rewritten.
- **Tests and simulator.** `node --test` passed 373/373. The 14 development trajectories satisfy every simulator invariant under the real authority, and 336 generated simulations show no invariant failure.
- **Clinical routing.** All 279 structured clinical-routing cases are correct. Free text alone, or a flag alone, never confirms a nonclinical break.
- **Substitutions** persist through later reviews and a schedule change.

## Findings, by severity

| ID | Sev. | Summary |
|---|---|---|
| 01 | CRITICAL | A pound value becomes kilograms: a known 135 LB is prescribed as 135 KG, and a logged 176 LB becomes next week's 176 KG |
| 02 | HIGH | Logged loads are adopted with no bound: a logged 800 kg is prescribed as 800 kg next week, under status KEEP |
| 03 | HIGH | When the race falls on day 0–1 of the race week, a 45–65 min long run lands the day before it and heavy lower-body strength 1–2 days before it (48 and 36 violations across 840 event programs) |
| 04 | HIGH | A run dimension with no gate defaults to ADVANCE, so strides unlock after the race with zero executed runs |
| 05 | HIGH | An eligibility `assessedAt` that is not a date counts as current and bypasses the return gate and the post-race gate |
| 06 | HIGH | Contradictory interruption facts (2 days vs dates spanning 40 days, negative days, `clinicalReason: 'true'`) take the least conservative class |
| 07 | HIGH | With a nonclinical category, 26 of 36 clinical texts outside the lexicon get a return recipe ("heart attack", "broke my leg", "chemotherapy") |
| 08 | HIGH | Unvalidated SCHEDULE_CHANGE input produces duplicate session IDs, two key runs on one date, 1-minute runs and silently dropped strength |
| 09 | MEDIUM | For EASY_LOW athletes with little running, the 15-min floor beats the week-1 caps, creating 5-min easy runs and a +10 min step; the ceiling is unbounded after an empty window |
| 10 | MEDIUM | 132 of 3,466 malformed-input cases throw instead of returning INVALID_INPUT, ASK or HOLD |
| 11 | MEDIUM | GOAL_CHANGE and EVENT_DATE_CHANGE accept invalid dates and unknown goals, producing a RACE goal with no race week |
| 12 | MEDIUM | Out-of-range or unknown intake values degrade silently: `pause.weeks` 200, an implausible familiar task, a non-string goal, known sets above 6 |
| 13 | MEDIUM | One wearable activity attached to two sessions counts as two completed sessions |
| 14 | MEDIUM | The completed-work ledger is not append-only: a later conflicting report removes executed work |
| 15 | MEDIUM | MISSED_SESSION for a completed session is not reconciled: the executed session is marked SKIPPED and its content repeated |
| 16 | MEDIUM | The learned rearrangement runs without learning consent |
| 17–23 | LOW | Set count restored in one step after re-establishment; race date marked unavailable is kept silently; a walk-only preparation before a race; simulator clock is UTC-stamped (HOLDs from UTC+3); simulator metric is NaN; hashes depend on the host's sort locale; a report dated before its activity is accepted |

## What makes a readiness claim unsafe

- Any readiness or envelope claim on this digest that does not carry findings 01–08 as open blockers.
- Holdout or simulation results read as evidence for:
  - load prescription;
  - event-week structure;
  - intensity activation;
  - return after a pause;
  - schedule changes.
- Citing the passing simulator invariants as proof of envelope adherence. They did not detect findings 03, 04 or 09.
- Fixing these findings changes the runtime. That invalidates this freeze and any evidence generated on it for the affected behaviour.

## Routing

- **Runtime author:** fixes and a new freeze, followed by an independent re-review.
- **SSCTR:** event-week semantics (03), lexicon coverage (07) and coaching adequacy (19).
- **Product/Data (privacy):** consent scope (16).
