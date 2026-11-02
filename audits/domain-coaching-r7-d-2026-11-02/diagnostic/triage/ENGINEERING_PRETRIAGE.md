# R7-D diagnostic — engineering pre-triage of the first evaluation

**What this is.**
- Written by the coordinator, who is also the harness author, after the single first evaluation (`../evaluation/`, raw outputs committed in `46e26ba`).
- An engineering triage of the automated results. Not a gate and not a domain judgment.
- Domain significance is for the SSCTR's diagnostic triage.
- The corpus is open: it may be read and re-run, never as a first evaluation.

**Runtime:** R7C-FREEZE-4, 197/197 bytes equal to the record. Harness R7D-HARNESS-1 (`8eec795`); it was **not** changed after the evaluation.

## Runtime candidates

### DX-01 — a same-day report disappears from the record at the next decision

**Where seen:** R7D-D15 steps w1 → w2. Automated: P10 `RECORD_ROW_DROPPED`; RESEND (P05) changes the w2 plan.

**What happens:**
1. A day-precision report (occurrence date, no clock) whose `reportedAt` falls on the session's own day is accepted and recorded by its decision.
2. At the next decision the carried row is re-screened and excluded (`REPORT_BEFORE_OBSERVATION`), so it drops out of `actualLedger`.
3. Re-sending the report restores it and changes the plan.

**Mechanism** (`CoachingCore/src/r6-provenance.mjs`, `normalizeObservations`): the first normalization stores the synthetic end-of-day instant as `observedAt`. `effective()` then reads any carried row with an `observedAt` timestamp as EXACT, so a same-day `reportedAt` compares before 23:59:59.

**Witness:** `repro/witness-dx.mjs`, in UTC, independent of the case.
- Same-day `reportedAt` → dropped.
- Next-day `reportedAt`, or none → kept.

**Origin:** PRE_EXISTING. Identical on the pre-R7A source, R7B2-FREEZE-1, R7C-FREEZE-3 and R7C-FREEZE-4. Not disclosed anywhere.

**Engineering class:**
- DIRECT_RUNTIME_DELTA that touches the record and an actionable output;
- a P10 violation (history) plus P05 (re-send), so a GENERALIZATION_BLOCKER under the pre-registration;
- structural: one case, the mechanism reproduced in a minimal witness.

**Effect:** loss of reported executions. A run that was reported may later read as unreported, which lowers ceilings and can bring a question back.

**Owner:** Engineering.

**Smallest correction scope:**
- carried rows keep their original time precision for the report-before-observation screen (or are not re-screened);
- one directed test: a same-day report survives the next decision.

### DX-02 — a declared break inside a weekly review is not read

**Where seen:** R7D-D18 step a6. No automated oracle fired.

**What happens:**
1. With no question pending (the coach never asked), the athlete declares a 17-day full stop ("VACATION", nonclinical, "no training at all") as `interruption` on a mid-week WEEKLY_REVIEW.
2. The decision is KEEP / VALID. It leaves a 70-minute long run that same day, quality and a 65-minute long run the next week.
3. The same break as a RETURN_AFTER_PAUSE gives REESTABLISH: long 20 and easy 15 now; easy 30 and long 45, no quality, the next week.

**Witness:** `repro/witness-dx.mjs`. A 14-day declared stop gives easy 45 / long 60 (weekly review) against easy 15 / long 20 (return report).

**Mechanism:** the weekly-review handler reads `interruption` only as the answer to a pending UNREPORTED_TRAINING question. Otherwise the field is ignored, with no question and no disclosure.

**Origin:** PRE_EXISTING. Identical on pre-R7A, R7B2-FREEZE-1 and R7C-FREEZE-3; the long run is 60 on pre-R7A.

**Context:**
- The R7-D interface lists `interruption` on WEEKLY_REVIEW "to declare a break (as an answer)".
- The accepted R7-C semantics say "a declared break is a known stop with its return recipe".

**Engineering view:** a safety-relevant input is dropped while the decision returns VALID (fail-open).

**Candidate class:** SAFETY_BLOCKER, by P08 in substance (a return that starts above the executed and tolerated state). **Needs the SSCTR's domain judgment.**

**Owner:** Engineering, with the SSCTR (semantics) and G03 (the answer path).

**Smallest correction scope:**
- a declared nonclinical break in any review is read as the known stop it is (the return recipe), or the decision asks instead of returning VALID;
- one directed test.

## Harness findings (recorded; not fixed in this phase, per the Founder's "não corrigir")

| Id | Where | Finding | Effect on the run |
|---|---|---|---|
| HG-01 | D13, P14 at w8 | The client sent `learningConsent:false` only on the revocation step. The runtime reads consent per decision (`review.learningConsent ?? program.learningConsent`), so learning resumed at w8 | False P14 FAIL. Plus a CONSUMER_CONDITION: a client must send the current consent at every decision, or a revocation lapses |
| HG-02 | D14, P07 at w5/w6 | The race-date timeline followed the requested marathon date, although the runtime did not apply the goal change (ASK) | False P07 FAIL |
| HG-03 | D14, P09 at w1 | The only LONG report of week 1 was `confounded` / non-comparable (heat), and the oracle read its UNDER as unfavourable | False P09 FAIL. Whether progressing after a confounded run is acceptable is a domain question |
| HG-04 | D18 e07, e08; D10 e11 | The author-expectation evaluator counts elapsed sessions of the week for ROLE_ABSENT. It returns NOT_EVALUABLE for ROLE_MINUTES_COMPARE when a role is missing (the author assumed zero) | Author expectations; the judge decides |
| HG-05 | P08 | The automated return oracle covers RETURN_AFTER_PAUSE only, so it did not see DX-02 | Oracle gap |

## Test and coverage gaps

**TG-01 — the coach never asked UNREPORTED_TRAINING in this corpus.**
- The gaps were short and an executed run always anchored the 30-day window.
- So CARRIER_CLINICAL had 0 units, and P05 was exercised only by RESEND (14 units).
- The authors' answer steps hit `ANSWER_WITHOUT_PENDING_QUESTION`.
- **For the final brief:** long reporting silences (more than a month) and unsolicited break reports.

**Other thin coverage:** P08 automated had 3 units, P01 15 and P04 13.

## Corpus error and policy question

**CE-01 — R7D-D11, step `cl2`.** `substitution.exerciseRef` found no SQUAT exercise in week 2, day 4, so the case stopped after 3 steps. The author anticipated this (its interface gap 8). This is the only pain-with-one-exercise-then-clearance case; that coverage is partial.

**HV-01, reproduced.** LOAD_CONVENTION differences on D08, D10, D14 and the generated G022, G050, G079: a dumbbell pair declared TOTAL progresses by the TOTAL increment. POLICY_QUESTION, PRE_EXISTING, not blocking.

## Clean results

- **Relations with 0 violations:** determinism, permutation, second-device duplicate, renamed ids, calendar shift (P15, observation only), the convention relation within its policy scope, and the clockless control (0 differences).
- **Generated sample (100 intakes):** 0 violations.

## For the domain triage

- **Author expectations:** 30 FAIL (mostly "the coach should ask": D02, D06, D16, D18), 3 NOT_EVALUABLE, 64 JUDGED.
- **VARIANT violations:** D02 w9, D06 w5, D14 w2, D16 a2.
- **Domain significance** of DX-01 and DX-02 is open, as is the D14 g5 routing: a marathon request answered ASK ("outside this program horizon…") rather than UNSUPPORTED.
