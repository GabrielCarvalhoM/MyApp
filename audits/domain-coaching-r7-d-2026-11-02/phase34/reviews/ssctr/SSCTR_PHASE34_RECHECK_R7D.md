# SSCTR fresh recheck, R7-D Phase 3.4 (`SSCTR-R7D-P34-RECHECK-r1`)

**Candidate:** `1978cc4`. Runtime bytes of `7cadcd8`:
- `r6-adaptation.mjs` `1163e105…`;
- `r6-composition.mjs` `8aa5f950…`.

**Judged against:** `SSCTR-R7D-P34-DECISION-r1` (CF-P34-08), plus R-F08-1 of `PCG-R7D-F08-r1`.

**Disposition: BLOCK.** This blocks freezing `1978cc4` as it stands. It does not block direction A.

The structured record is `SSCTR_PHASE34_RECHECK_R7D.json`. It is the reference; this page summarizes it.

## Who and how

- **Instance.** A fresh SSCTR instance (claude-opus-5-5, xhigh). It did not write the decision, the runtime, the tests, the harness, PREREG-6, INTERFACE-6 or the evidence, and it did not open `reviews/engineering/`.
- **Dispatch and review.** Native adapter dispatch versus default-instance fallback is not verified. No human review occurred.
- **Literature.** None was searched: this recheck makes no new scientific claim. The decision's claims CL1–CL7 are relied on as that record states them.
- **Rebuilds.** Own scratch rebuilds (new directory `ssctr-recheck-p34-20261107-111301-4970`): `git archive` of `1978cc4` and of `3edf3c5` (R7D-FREEZE-4), with the five SSCTR authority records. Nothing was deleted, and the coordinator's rebuilds were not touched.
- **Predecessor probes.**
  - On R7D-FREEZE-4 they give outputs byte-identical to the recorded ones.
  - On the candidate they match the request's summary: W1–W4 equal PROTO-γ-raceKeys, S1/S2 equal PROTO-γ-sameDay, R1/R1b equal the episode rule, G1–G4 are equal, and C1/C2 keep the holiday.
- **Directed tests.** `r7d-phase34.test.mjs` passes 31/31 on my rebuild.

## Blocking findings

All four are runtime-only and use existing authority. None needs a new number.

| ID | What happens on `1978cc4` | Should be (closure) |
|---|---|---|
| **SSCTR-P34R-F01** (HIGH) | **The Founder's case** returns SHORT 4, with the holiday as `OWN_RETURN`.<br>A named correction then moves the trip from Mon–Thu to Tue–Fri. The return becomes **LONG 33 RESTART**, `TRAINING_NOT_REESTABLISHED`.<br>A fresh report of the same corrected trip gives SHORT 4 `OWN_RETURN`, with EASY 50/41 and LONG 65 (C5 vs C5f).<br>**Cause:** `appliedBetween` counts the corrected break's own earlier report as "an applied return between". | Only a return of **another** episode triggers the guard.<br>Expected: C5 = C5f, and T20's guard case unchanged (CF-P34-02, BR-Q1.2(f)). |
| **SSCTR-P34R-F02** (MODERATE) | **A race touch completed at half its minutes** (PARTIAL by the existing completion rule) re-enters running.<br>Run-only plan: TRAINING_AFTER SHORT 4, EASY 48/25 and LONG 55. With the touch missed: MODERATE 25, 15/15/20.<br>P18(a) does not see it. | The touch and the race count only under the existing completion rule (BR-Q4.1: "the same report test").<br>Expected: RT1o = RT2o, and RT1 = the W2 reading. |
| **SSCTR-P34R-F03** (MODERATE) | **A race week whose runs are touch, optional shakeout and race,** with no gated run, never re-enters running, because the reducer's `complete('RUN')` needs a gate key.<br>Run-only plan: the stop runs through the holiday (MODERATE 25).<br>Hybrid plan: running reads the holiday's own return.<br>The registered **P18(c) flags** the run-only form (SPORT_WEEK_READ_AS_STOP). | In the re-entry predicate only: a sport re-enters through any week holding at least one required session, all of them done as prescribed (BR-Q4.4; INTERFACE-6 §1).<br>Expected: RWo and RW give TRAINING_AFTER SHORT 4.<br>Weakening P18(c) instead is excluded. |
| **SSCTR-P34R-F04** (MODERATE) | **Under `OWN_RETURN`, with strength read from the earlier break's own return:** a lift logged on that break's first day, with no start time, is ordered by default without the 0.8 question.<br>The two readings differ: back-squat 1x7 versus 1x9; db lifts 1x12 versus 1x8.<br>The same lift on the single-break path, and on R7D-FREEZE-4, is asked. | When strength reads from x's own return and x's state is `material`, ask x's `startedAt` (BR-Q1.3: "a decision met inside it is returned").<br>Expected: SD1 gives ASK; SD2 and SD3 unchanged. |

## Answers to the eight questions

1. **Fidelity.** The runtime is faithful to BR-Q1 to BR-Q6 and γ on every probed shape except F01–F04. The order of BR-Q1.2, the recursion (X9), the record fields and the per-sport reading are all right. There is no `P34_*`, ANY or M path.
2. **CF-P34-02, -03 and -04.**
   - **CF-P34-02** is met for the T21, T10, C1 and C2 shapes, but **not** for a correction that moves the start later (F01).
   - **CF-P34-03** is met:
     - G1–G4 are equal;
     - R1 and R1b equal the episode rule;
     - executed runs of the return's own week still count (G6).
   - **CF-P34-04** is met: there is no spurious question (T10), and genuine late evidence is still asked (T13).
3. **CF-P34-05 and -06 (coverage).** The instruments and tests cover the required list. Shapes are missing: C5, RT1 and RT1o, RW and RWo, and SD1 to SD3. P18(a) has a detection gap for F02 (CFR-05).
4. **Disclosures (CF-P34-07).** F03, F04, O-01, the guard and O-02 are disclosed, and the consumer conditions are right. Two gaps (CFR-03):
   - the F04 bullet omits that, for running, the reading is less conservative than the de facto lapse (peaks are kept and quality can return);
   - Δ10 gives only part of the holdout-scoring recommendation.
5. **The five updated assertions** are accepted from the domain side.
6. **R-F08-1** holds on every path probed:
   - T12;
   - an injury restated by name with a run-complete week between (F1);
   - a clinical restatement of a consumed break after an own return, then a correction and a review (F2, F2b, F2c).

   The nonclinical control is unaffected (T12 control, F3). F08 is not decided.
7. **New numbers:** none, in the candidate or in the closures this record asks for.
8. **The queue:** no domain objection to appending `HQ-R7D-SSCTR-P33-RECHECK` against R7D-FREEZE-4 with its content unchanged. Recommended: note outside the item that its trigger fired with direction A, and that its direction-B scope is superseded for the one-sport case.

## Observations (non-blocking)

- **O01.** On race weeks where running is not re-entered (W2–W4, RT3), week 9 is EASY 35/35 and LONG 45. That is above W1 (35/34/40) and above R7D-FREEZE-4.
  - It equals the existing episode rule (EPW1/EPW3).
  - It stays within the ceiling and the prior doses.
  - The cause is an interaction between the return ladder and the post-event block, not this candidate's logic.
  - Disclose it, and route it only if the post-event rules should bound a return ladder.
- **O02.** The reducer's step release ignores the race keys. This is pre-existing and correctly unchanged.
- **O03 to O05.** P18(a) can be tightened after F02 is fixed. The phase32 T5 title is cosmetic. X9, G6, F1–F3 and C1/C2 pass and are worth keeping.

## Conditions for freeze

- **CFR-01.** Close F01–F04 in the one bounded cycle:
  - with one directed test per finding, RED on `1978cc4` and GREEN after;
  - nothing else changes.
- **CFR-02.** Closure is objective: the stated probe expectations hold. If they all hold and nothing else changed, Quality and Chief verify it, and the domain position becomes ACCEPT_WITH_CONDITIONS.
  - Any deviation goes to a fresh SSCTR, for these items only.
  - If the cycle does not close all four: no freeze.
- **CFR-03.** Disclose F04's substance, the full holdout-scoring recommendation, and O01/O02.
- **CFR-04.** State in the freeze record:
  - no new numbers; shadow reference only;
  - V1 authority NO; no human or empirical validation;
  - F08_OPEN and BLOCKED_BY_AUTHORITY;
  - R-F08-1 checked.
- **CFR-05.** Before any final holdout (not before the freeze): P18(a) applies the completion rule to the touch and the race, through an append-only PREREG addendum.
- **CFR-06.** The P33 queue append as planned. The Phase 3.4 items stay proposed.

**Proposed human revalidation:** `HQ-R7D-SSCTR-P34-RECHECK` is proposed only and not appended (queue unchanged at 234). It can be appended only after a freeze binds this record with F01–F04 closed.

## Files

- `ssctr/SSCTR_PHASE34_RECHECK_R7D.json`, the structured record.
- `ssctr/probes/p34-recheck.mjs` and `ssctr/probes/p34-recheck-detectors.mjs`.
- `ssctr/probes/out/`, which holds:
  - `p34-recheck.CANDIDATE-1978cc4.json`;
  - `p34-recheck.R7D-FREEZE-4.json`;
  - `p34-recheck-detectors.CANDIDATE-1978cc4.json`;
  - `p34-ssctr.CANDIDATE-1978cc4.json`;
  - `p34-ceiling.CANDIDATE-1978cc4.json`.
