# R7-D Phase 5 final holdout: domain judgment (SSCTR)

**Record:** SSCTR-R7D-FINAL-HOLDOUT-2-r1, 2026-11-08. The full record is `SSCTR_FINAL_HOLDOUT_2_R7D.json`, beside this file.

**Judge:** a fresh SSCTR instance. Its authority is PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical only. It makes no claim of human, clinical or empirical validation and adds no number. It did not read the Quality judge's folder.

**What was judged:** R7D-FREEZE-6 under R7D-PREREG-8, in the single first evaluation of H1 (R7D-FINAL-2: 39 cases, 130 steps) and H2 (300 intakes).
- Every input hash matches the request.
- Mechanisms were reproduced read-only, in a new scratch directory, on the frozen bytes.

## Verdict: READY_WITH_CONDITIONS (domain side only)

There are no blocking findings: no SAFETY, SCIENTIFIC or GENERALIZATION blocker, and no UNSAFE step. There is no CORPUS_ERROR, and every registered coverage clause is met by valid cases.

**Rubric (39 cases):**
- BEST_SUPPORTED: 23.
- ACCEPTABLE_ALTERNATIVE: 14.
- SUBOPTIMAL: 2, H07 and H28. Both are attributed to AUTHORITY_SCOPE: the runtime applies a bound reading as written, and each is a disclosed residual. So neither blocks (§4.4).

## The 11 failed author expectations

None is a runtime failure.
- **H04 s2 e4: ACCEPTABLE_ALTERNATIVE.** The R7-A rule asks about a one-date schedule window instead of re-planning it. No dose changes.
- **H07 s2 e6 and e7: EXPECTATION_OUTSIDE_AUTHORITY** (F08).
  - "caring for my mother after her operation" is screened clinical, and R-F08-1 keeps every later decision with a human.
  - This is the disclosed free-text false positive. The step is SUBOPTIMAL (AUTHORITY_SCOPE).
- **H17 s4 e6: ACCEPTABLE_ALTERNATIVE.** The bodyweight substitution was already made at s2, so KEEP is right.
- **H20 s2 e3 and e4; H32 s2 e2, s5 e5 and e6; H34 s3 e3 and e4: ACCEPTABLE_ALTERNATIVE.** The reason screen asks about an ambiguous word in a nonclinical text: "back", "feet", "baby". These asks are fail-closed and can be answered, but the case never answered them.

## The Phase 4 blockers on the new cases

**SSCTR-P4-F01 holds.**
- H18 and H19 have no exercise record before a moderate break. They enter at 1 set at RIR 4 and take step 2 at 1 set at RIR 3 (CFD-1). They then rise one set per executed week, up to the normal count, with no block credited.
- Exercises with valid history keep it: H21, H23, H35 and H36 restore their known loads after the steps.
- Not reached: the exact mixed shape of F13, CFD-3 and CFD-4. These rest on T42–T44.

**QRE-P4-F01 holds.**
- H16 asks UNREPORTED_TRAINING in a CONSOLIDATION week, the low-dose phase of the Phase 4 defect. H15 and H17 ask too.
- Shorter silences are read as unknown, never as no training: H16 at s2, H10.

## Not-evaluable units

- **P06, P08 and P18:** the domain result is PASS for all 17 units (P06 14, P08 2, P18 1).
- **The nested P18 unit (H08):** the inner own return was recomputed from the case timeline. Breaks a and b form one 7-day SHORT stop. Strength re-enters through week 4, and running continues from that own return. Nothing is dropped or summed.
- **P03:** the domain reading of its 11 units is PASS.
- All 28 stay NOT_EVALUABLE in the automated tally.
- **P17:** there are 0 windows ended by row name, so no HARNESS_GAP follows.

## Tallies (never merged)

| Tally | Count |
|---|---|
| Real runtime failures | 0 (separately: 2 SUBOPTIMAL with AUTHORITY_SCOPE, non-blocking) |
| CORPUS_ERROR | 0 |
| Instrument gaps | HARNESS_GAP 0. Author-noted interface gaps 2/3, 7 and 9 affect H03 e3/e4, H28 e7, H17 e6, and the load magnitudes in H04 and H08 |
| NOT_EVALUABLE | H1: 28 units (P03 11, P06 14, P08 2, P18 1); H2: P06 47 units; P14 influence with consent not exercised |

## Conditions

- **CND5-1:** consumer conditions.
  - C2: a projection that needs reconciliation is never shown as a prescription.
  - C3 with R5: in H18 and H19, the reports sent under the clinical flag never reached the record.
  - The P12 same-turn confirmation.
  - G03 wording, including the HOLD reason in H05 s4, which is an internal exception text.
- **CND5-2:** the Quality judge rules on integrity, units and independence.
- **CND5-3:** routed, not fixed here:
  - O01: the free-text reason screen over-triggers;
  - O02: a race week that plans no strength re-enters strength (H28; BR-Q4.4 edge);
  - O03: when the return week is empty, the conditional next week carries the step;
  - O04: an onboarding pause under four weeks is not reduced (H2 G068, G123).
- **CND5-4:** the F13 mixed shape rests on tests, not on this holdout.
- **CND5-5:** no V1 authority, no validation, F08 stays open.

## Queue

HQ-R7D-SSCTR-P5-HOLDOUT-2-JUDGMENT is proposed only. The queue stays at 235.
