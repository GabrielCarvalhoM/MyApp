# R7-D Phase 5: SSCTR domain review of the candidate

**Record:** SSCTR-R7D-P5-REVIEW-r1, 2026-11-08. This is a fresh SSCTR instance (PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical). The record makes no claim of human, clinical or empirical validation and adds no number. The full record is in `SSCTR_PHASE5_REVIEW_R7D.json`, and the probes and their outputs are in `probes/`.

**Judged:** the candidate `c7c72e5` (HEAD), against R7D-FREEZE-5 (`cc0b56f`). The policy and the catalog are unchanged.

## Disposition: ACCEPT_WITH_CONDITIONS

There is no blocking finding, no SCIENTIFIC_BLOCKER and no UNSAFE step. No narrow adjustment is requested.

## What I verified myself

- **Tests:**
  - Directed tests: 6/6 on the candidate.
  - On a copy of `cc0b56f`, exactly T42–T45 fail.
  - Suite: 1014/1014.
- **SSCTR-P4-F01 is closed.**
  - F13: week 8 at 1x10 RIR4 (entry); week 9 at 1x10 RIR3 (step 2); then 2 sets, never above the normal count, with no block credited.
  - W-D49-A: step 2 is at most 2 sets (it was up to 4x8).
  - Two further shapes behave the same: a break after a practice-only week, and an entry week whose strength was not done, where the entry repeats.
- **Valid history is unchanged.** These are byte-identical to FREEZE-5:
  - W-D49-B, which is itself a mixed case;
  - a known-load intermediate.
- **Run side:** the run rows are identical in every strength scenario, and the strength fix cannot add interference.
- **FC-01:**
  - band and assisted rows now progress by repetitions;
  - they are capped at the top of the goal range and never read as a load;
  - after a return they take the return steps.
- **QRE-P4-F01:** the question now comes when the credit and zero readings differ. That is the R7-C semantics: no silent default to credit or to zero, and ask where the dose depends.

## Disclosure rulings

1. **Step-2 arithmetic:** accepted. The ceiling is the normal count, which gives 1 set for F13. The Phase 4 illustration (2, 2 and 1) used unexecuted credit and is superseded.
2. **Executed at the entry without a usable load:** inside D52/D55, an ACCEPTABLE_ALTERNATIVE (SSCTR-P5-O01). The exposure gets the approved effort-guided establishment, at most 2 sets at RIR ≥ 3. That is at most one accessory set above step 2 for one week, after an entry bout.
3. **FC-01:** inside B0-C04 and the F01 mandate.
4. **The question asks more often:** accepted. Every question it adds can be answered, and it closes once answered. SSCTR-P4-O03 stays open.
5. **The legacy amendment:** accepted. It keeps "never KNOWN" and adds the entry dose.
6. **The P06 twin:** the domain reading is correct and inside K03. Quality confirms the date scope of its predicate (SSCTR-P5-O04).
7. **W-CARRIER retired:** no domain objection, since the clinical-carrier witnesses fire.
8. **Interface 8:** true to the domain and to the event policy, with no leak. The §5 re-entry clause rests on the disclosed CC-F05.

## Observations (non-blocking)

- **O02:** when loaded rows are done without loads and nothing is set up, the entry repeats with no load question. This was already the case on FREEZE-5 for exercises with history. It goes to G03, Product and the next mission.
- **O03:** never-executed accessory rows enter at 8 reps rather than 10.
- **O05:** the policy question on screening the reason for a long silence is carried forward.

## Conditions

- **For the freeze:**
  - **CF1:** FREEZE-6 binds exactly the reviewed runtime bytes. Any runtime change voids this review for the changed path.
  - **CF2:** the disclosure-2 and disclosure-1 rulings go into the freeze record, or PREREG-8 Δ56, before the seal.
- **Carried:**
  - **C1:** the consumer conditions C2, C3 with R5, P12 and the G03 wording.
  - **C2:** O02 and O05 are routed onward and are not new holdout failures.
  - **C3:** this record is domain-only; Quality rules on the instruments.
  - **C4:** no V1 authority and no G01–G04 closure.

## Literature

Read through Europe PMC (abstracts) and PMC (full text):
- Chen, Nosaka and Chen 2012 (abstract): the repeated-bout effect from one low-intensity bout.
- Spiering et al. 2021 (abstract): minimal dose and intensity.
- Lopes et al. 2019 (full text): elastic and conventional resistance give similar strength gains.
- Bosquet et al. 2007 (abstract, as cited in Phase 4).

None of them is the basis of a rule. The skill's `validate_records.py` was not run because Python is not installed here.

## Queue

HQ-R7D-SSCTR-P5-REVIEW is **proposed only**. The queue is unchanged.
