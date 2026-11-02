# R7-D Phase 3 — request for the narrow SSCTR recheck and the engineering check

**Candidate:** branch `claude/domain-coaching-r7-d`, commit `7039bc1`.
- Runtime bytes are those of `9e1ecbf`. The delta from R7C-FREEZE-4 (`a9654c8`) is six source files:
  - `CoachingCore/src/r6-provenance.mjs`, `r6-adaptation.mjs`, `r6-composition.mjs`, `r6-prescription.mjs`, `r6-program.mjs` and `r7b-repertoire.mjs`;
  - plus the new test file `CoachingCore/test/r7d-phase3.test.mjs`.
- No existing test, fixture, policy, catalog or record changed.
- See `git diff a9654c8 9e1ecbf -- CoachingCore`.

**Authority:** the Founder's R7-D Phase 3 authorization (summary in the checkpoint, not saved verbatim).
- Correct only DX-01, DX-02, F03 (A: unit round trip; B: executable progression under a narrow policy decision) and F04.
- Correct the harness gaps that could distort the final gate. Freeze only if every check is clear.
- If a review finds a new blocker: `R7D_PHASE3_STATUS = CORRECTION_BLOCKED` and stop. There is no correction loop after these reviews.

**The findings being corrected:** `PHASE2_CHECKPOINT.md` (FINDINGS), `diagnostic/triage/`.

## What changed, one line each

| Item | Change (runtime) | Directed tests |
|---|---|---|
| DX-01 | `r6-provenance.mjs`: a carried row with `provenance.timePrecision: 'DAY'` keeps its stored instant and local day. Every screen applies to it as to a day-precision report | `R7-D DX-01: …` (5 tests) |
| DX-02 | `r6-adaptation.mjs`: a `WEEKLY_REVIEW` with a non-empty `interruption` is decided as `RETURN_AFTER_PAUSE`, using the existing return handler, its clinical screen, episode identity and re-entry. Another event kind declaring one is screened clinically (`clinicalRoute`), then asked (`breakCarrierAsk`). Clinical first. An empty `{}` declares nothing | `R7-D DX-02: …` (6 tests) |
| F03-A | `r6-prescription.mjs`: a machine row's load unit is KG, the unit of its value. `STACK_STEP` stays the unit of a step only | `R7-D F03-A` |
| F03-B | Rule `F03B-MACHINE-STEP-r1` (`policy/SSCTR_F03B_DECISION_R7D.*`, `policy/PCG_F03B_AUTHORITY_R7D.*`, interpretation I-1):<br>• `incrementFor(S,'MACHINE_STACK')` is 0, so no kilogram step or tolerance exists for a machine;<br>• `advanceStrength` sets `stepDue` where the existing rule makes a load step due, and the next row is numberless (`load.nextSetting:{aboveKg,fallbackReps}`);<br>• `loggedLoadDecision` adopts a heavier machine value only on ADVANCE plus D45 verification (confirmation, or the same value at another exposure) and never above a ceiling; it is otherwise pending (`pendingSetting`, one question);<br>• REGRESS goes back to `previousLoad` or lowers repetitions;<br>• a step logged at R holds the fallback dose;<br>• re-establishment and return clear the machine fields | `R7-D F03-B T2…T11` (6 tests) |
| F04 | `r6-adaptation.mjs` `kindOf`: a confounded row with recovery ADVERSE or next day IMPAIRED is ADVERSE; otherwise CONFOUNDED (performance and effort unreadable) | `R7-D F04: …` (4 tests) |

**Evidence**, made on the candidate's runtime bytes and listed in `evidence/EVIDENCE_PHASE3.json` (result PASS):
- **Tests:** 23/23 directed tests; the full suite at 900/900 (884 frozen plus the directed tests that existed when it ran); conformance R7-B, R7-B.1 and R7-B.2 PASS.
- **Mutation:** 6/6 mutants (DX01-M1, DX02-M1, F03-M1, F03-M2, F03-M3, F04-M1), each killed by its own witness (`evidence/MUTATION_PHASE3.json`).
- **Harness:** R7D-HARNESS-2 validation (`../harness/validation/HARNESS_VALIDATION_R7D_2.json`).
- **Regressions:** diagnostic corpus and generated sample, regression only (`regression/*/RUN_REPORT.json`).
- **Differential:** against R7C-FREEZE-4, 137 cases, no unexplained difference (`evidence/DIFFERENTIAL_VS_R7C_FREEZE_4.json`).
- **F03-B athlete probe:** `evidence/F03B_ATHLETE_PROBE.json`, `probes/f03b-athlete-probe.mjs`.
- **Authorities:** policy bytes, canonical hash `18ec48f3…`, all 10 R6 boundaries, catalog and B0 records unchanged.

**Pre-holdout documents** (for the engineering check only): `../PREREGISTRATION_R7D_2.md` with its delta, `../author/INTERFACE_DELTA_R7D_2.md` and `../author/AUTHOR_BRIEF_FINAL_R7D.md`.

To rebuild R7C-FREEZE-4 outside the repository:
```
git archive a9654c8 CoachingCore audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json | tar -x -C <dir>
```
Then copy `CoachingCore/node_modules` into it.

## Behaviours the coordinator flags for you (not hidden, not decided by the coordinator)

1. **P3-F01 (pre-existing; measured by the new P05 coverage).**
   - A declared-break answer to UNREPORTED_TRAINING delivered inside a pain substitution (clinical route) is not retained across qualified clearance. The next decision asks again: REQUIRES_RECONCILIATION, no run dose.
   - Delivered directly, the same answer re-enters by the return recipe.
   - On R7C-FREEZE-4 the return-report form already differed. The weekly-review form showed nothing there only because the break was ignored (DX-02).
   - The relation CARRIER_CLINICAL stays strict in PREREG-2, with no envelope. Evidence: the validation's `findings`.
2. **Break plus clinical flag, then clearance.** With no question pending, a break declared together with a clinical flag routes clinically and is not retained. After clearance a plain review no longer knows the break, so the stored plan can continue (the F08 family: no path back to the plan after a clinical route).
3. **F03-B, hold weeks.** In a phase that holds the load (consolidation, taper), a machine row states R (no step). The athlete's compliant log at R drops a pending heavier setting, as rule P3 "a later log at or below R drops the pending H" states. Verification then starts again: one more question.
4. **F03-B cadence.** `stepDue` persists across a week whose gate is HOLD (the exposure not executed, or below target). The same step is offered again next week, as "HOLD repeats the dose it held".
5. **DX-02, another event kind.** The question (`breakCarrierAsk`) carries the factual re-plan every question carries (`withFactualReplan`), with REQUIRES_RECONCILIATION. It applies neither the event's own change nor the return.

## Questions

**SSCTR (narrow; DX-02, F03-B and F04 only, as the Founder asked):**
1. Does DX-02 now respect return and re-entry without undue dose? That covers the weekly-review carrier, the ongoing break, clinical-first, and another event kind.
2. Does F03 have an executable unit and progression without false precision? Does the implementation match `F03B-MACHINE-STEP-r1` and its conditions C1–C9 (C8: you are not the instance that wrote the rule)? Are flagged behaviours 3 and 4 acceptable readings of the rule?
3. Does F04 preserve adverse signals despite `confounded`?
4. Did any correction introduce new prescriptive authority?
5. Flagged behaviours 1, 2 and 5: is each a blocker for Phase 3, or a disclosed non-blocking residual (and routed where)?

**Engineering check (narrow; not a new general audit):**
1. DX-01: factual persistence of carried rows without disabling the temporal screens (corrections, duplicates, `firstRecordedAt`, append-only).
2. Carrier independence of a declared break.
3. Machine round trip (prescription → log → ingestion → record → next cycle) and no computed machine load anywhere.
4. Confounded semantics.
5. No mutation of closed history; no regression of clinical-first; no new stale VALID.
6. The harness revision and PREREG-2: is anything weakened against PREREG-1 to make the runtime pass? Do the oracles measure the four invariants? Is P16 sound?
7. Flagged behaviours 1, 2 and 5 from the engineering side.
