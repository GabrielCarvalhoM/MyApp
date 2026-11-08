# R7-D final holdout: domain judgment (SSCTR)

**Record:** SSCTR-R7D-P4-FINAL-HOLDOUT-r1, 2026-11-08. A fresh SSCTR instance under PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY (nonclinical). It makes no claim of human, clinical or empirical validation and adds no number. The full record is in `SSCTR_FINAL_HOLDOUT_R7D.json` beside this file.

**What was judged:** R7D-FREEZE-5 under R7D-PREREG-7, the H1 and H2 first evaluations. All input hashes match the request.

## Verdict: INVALID_HOLDOUT

Nine registered coverage items have no valid, evaluable case once the four corpus errors (F22, F32, F33, F34) are removed. Each clause makes that INVALID_HOLDOUT, to be replaced by a new and independent corpus. The missing items:

- **PREREG-2 Δ9:**
  - CARRIER_HOLD > 0: zero units. F11's final-week review asked nothing.
  - UNREPORTED_TRAINING answered directly: one case (F12).
- **PREREG-3 Δ6:** a break with a clinical flag or a pain substitution, then clearance, then a plain review: one case (F21). F22 is a corpus error.
- **PREREG-5 Δ3:** a whole week executed in every sport between two breaks: none. F29's strength rows carried no load (BR-Q4.3).
- **PREREG-6 Δ5:**
  - a race week between two breaks with the race touch or the race missed: only corpus-error cases;
  - optional sessions not done in a re-entry week: none planned.
- **PREREG-6 Δ18:**
  - a race week of only the touch, a shakeout and the race: none;
  - a race touch done at half its minutes: only F32, a corpus error.
- **PREREG-6 Δ29:** a race week with no gated run, whose strength and shakeout report adverse recovery: none.

## Blocking finding on the valid cases

The invalidity does not hide it: had the holdout been valid, the domain side would be NOT_READY.

**SSCTR-P4-F01 (GENERALIZATION_BLOCKER, PRE_EXISTING, structural).**
- **Defect:** after a moderate or long return, strength exercises the athlete never executed before the break skip the SSCTR D49 return.
- **F13:**
  - the return-entry week is at RIR3, where the entry requires RIR ≥ 4;
  - the next week is at 3x10, 3x10 and 2x10, where step 2 allows 2, 2 and 1 sets.
- **Witness W-D49-A (a different athlete):** step 2 rises to 4x8.
- **Control W-D49-B:** the same athlete with week 0 executed follows D49 exactly.
- **Origin:** identical on R7D-FREEZE-4.
- **Rubric:** SUBOPTIMAL, not UNSAFE: bodyweight and dumbbell work at RIR3.

There is no SCIENTIFIC_BLOCKER and no UNSAFE step.

## Rubric

- **Cases:** 35 in total, 31 evaluable.
  - BEST_SUPPORTED: 15.
  - ACCEPTABLE_ALTERNATIVE: 15.
  - SUBOPTIMAL: 1 (F13).
  - CORPUS_ERROR: 4.
- **Clinical content:** CLINICAL_OUT_OF_SCOPE in F09, F21 and F23. Their routing is correct.
- **EXPECTATION_OUTSIDE_AUTHORITY:** none.

## Domain readings of the automated FAILs

These go to the Quality judge, who rules on criterion 1.

- **F07, P06:** the four units read an intake longest run of 0 minutes as a completed run. Read as no reference, the week-0 dose is the approved RESTART entry, and the week-1 unit falls under CC-F05. Proposed: HARNESS_GAP.
- **F12, CARRIER_CLINICAL:** the two arms receive different facts at s3. The bulk "as prescribed" facts resolve against different week-5 plans. With identical facts the carried arm is slightly more conservative (LONG 50 against 51). Proposed: HARNESS_GAP.
- **F13, P03(d):** no question after seven silent weeks, but the dose is at the entry floor. The impact on the dose is nil. Recorded as POLICY_QUESTION SSCTR-P4-O03.
- **F21, P03 and P06:** the unit's session is the one this same review reports as executed. The re-asked week-2 runs fall under R5 and C3.

## Domain units, the CFP35R2-03 ruling, and binding readings

- **Domain units:**
  - P07: the completion races in F07 and F18 pass.
  - P08: the strength and break-identity units pass. F13's D49 deviation is recorded under SSCTR-P4-F01.
  - P09: fails only on F13 s3.
  - P12: passes.
  - P14: influence with consent is not exercised.
  - P06 units not evaluable in H1: F13 passes; F21 stays not evaluable.
  - P08 unit not evaluable in F21: passes.
  - NESTED_OWN_RETURN_RECORD: no units.
- **CFP35R2-03:** the reading is accepted. There are zero WINDOW_ENDED_BY_ROW_NAME observations, which confirms the coordinator's count, so no HARNESS_GAP follows from it.
- **Binding readings:**
  - X2 appears only in corpus-error cases, read as continuity.
  - F08: no step depends on it, and routing is correct.
  - O-P35-01's two-break shape does not occur.

## Conditions and residuals

- **Conditions:**
  - a new, independent corpus that makes the nine items reachable;
  - a runtime fix for SSCTR-P4-F01 under its own authorization;
  - the Quality rulings on the automated FAILs;
  - consumer conditions C2, C3 with R5, the P12 same-turn confirmation, and G03 wording.
- **Residuals:**
  - no human or empirical validation;
  - H1 says nothing on all-sport re-entry, race-week re-entry rules, CARRIER_HOLD, consented learning or dumbbell load progression;
  - F30's intended mechanisms were never exercised;
  - two of the three literature sources were read as abstracts only.

## Queue

HQ-R7D-SSCTR-P4-HOLDOUT-JUDGMENT is **proposed only**. The queue stays at 235.
