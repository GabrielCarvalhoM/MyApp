# Test-quality audit — corrections, retractions, supersession and conflicts (Founder §23; QE-R7ASM-07)

## What the engineering judge found

T15, P7 and the self-challenge's correction class (`test/r7asm-state-model.test.mjs`, `probes/r7asm-self-challenge.mjs`) built their "correction" with a `supersedes:` field. The R6 normalizer recognises only `correctionOf` (`src/r6-provenance.mjs:100`). So those reports were a second, disagreeing report of the same session, which the normalizer treats as a **conflict** (`CONFLICTING_PHYSICAL_OR_RESPONSE_REPORTS`). They passed only because a quarantined session counts nothing.

## The criterion

A test counts as correction coverage only if:
- its report reaches `evaluateProgram` (or `normalizeObservations` directly);
- it carries `correctionOf` naming the original, with `correctedAt` at or after the original's execution and not after the decision clock;
- it is for the same session identity, so it forms a valid chain;
- its assertion can only hold if the correction applied: the superseded row is present, no conflict was recorded, or a value only the corrected fact gives.

A test that exercises only a conflict is labelled as one.

## The audit

The R6 and R7 suites. `test/semantics.test.mjs` uses `supersedes` as the correction field of the separate pre-R6 `reconcileExposure` API (`src/semantics.mjs`), a different contract. It is out of this scope and correct for its own API.

| Test | Path | Kind | Verdict |
|---|---|---|---|
| `r7asm-state-model` T15 | evaluateProgram | was `supersedes:` → conflict | **Re-expressed** (marked `State consumer`): `correctionOf` + `correctedAt` at the execution's own clock. It asserts the normalizer superseded the original and recorded no conflict, then the corrected history (20 kg, 2026-11-14) |
| `r7asm-state-model` T15c (new) | evaluateProgram | conflict | The old form kept as what it is: it asserts a `CONFLICTING_PHYSICAL_OR_RESPONSE_REPORTS` conflict, no supersession, and that the quarantined session counts nothing |
| `r7asm-state-model` P7 | evaluateProgram | was `supersedes:` → conflict | **Re-expressed**: a real chain, asserting supersession and no conflict |
| `r7asc-state-consumer` QE-R7ASM-01 (4 variants, facts only) | evaluateProgram | correction | Valid chain (`correctionOf`, the original's `observedAt`, `correctedAt` after it); identical records in both cells are asserted |
| `r7asc-state-consumer` QE-R7ASM-01 (Q3b) | evaluateProgram | conflict (late wearable record) | Labelled conflict; the quarantine is the trigger under test |
| `r7asc-state-consumer` QE-R7ASM-04, H5, P2, P7 | evaluateProgram, then `historicalStateOf` on the record as returned | correction | Valid chain; QE-R7ASM-04 asserts the superseded row is carried, and all assert the corrected value (20) at every reader |
| `r7ab-week-start-authority` P4 | evaluateProgram | correction | Valid chain (`obs(thu)` gives the original's session and clock, `correctedAt` = the review time); its assertion (the state at the break becomes a RETURN point) holds only if the correction applied |
| `r7ase-state-evidence` J | evaluateProgram | correction | Valid chain; asserts the corrected load is history |
| `r7a-cycle2` (QE-R7A-16; INV-10) | normalizeObservations and evaluateProgram | correction of a wearable/manual pair, carried twice | Asserts the live rows after the correction, in both the normalizer and the carried ledger |
| `r7a-semantic-core` C10 | normalizeObservations, then evaluateProgram | correction chain, carried record, correction of a correction | Asserts idempotent normalization, live rows, supersession and no INVALID_CORRECTION_CHAIN |
| `r7a-semantic-core` C09, `r7a-cycle2` (QE-R7A-06/07), `r6-balanced-provenance`, `r6-engineering-fixes` QRE-R6-14, `r6-ssctr-r10-fixes` D52 conflicted | evaluateProgram / normalizeObservations | conflict | Labelled and asserted as conflicts (quarantine; no count) |
| `r7a1-correction`, `r7a2-interruption`, `r7af-episode-identity` (`interruption.supersedes`) | evaluateProgram | a return report's supersession of an earlier report of the same break | A different mechanism (the interruption episode), correctly tested on its own field |

**The self-challenge** of this mission builds every correction with `correctionOf` (`probes/r7asc-self-challenge.mjs`). Its correction class asserts the supersession before it judges history.

## Result

No test in the R6/R7 suites now counts a conflict as correction coverage. T15 and P7 fail on HISTORICAL-PROJECTION-FREEZE-1 in their re-expressed form (`probes/tests-on-predecessor.mjs`), which shows that they now reach QE-R7ASM-04's path. QE-R7ASM-07 is closed collaterally, as the Founder's §16 asks.
