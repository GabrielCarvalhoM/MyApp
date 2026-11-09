# QRE judgment of the V1CP implementation candidate (QRE-V1CP-IMPL-r1, 2026-11-09)

The machine-readable record is `QRE_V1CP_IMPL.json`, beside this file. Where the two differ, the JSON prevails.

**Verdict: NOT_READY** (quality gate QUALITY_BLOCKED) for commit `fa3985b` as an executable reference runtime. This is not V1 authority.

**Judge:** an independent Quality & Reliability Engineer instance. It wrote none of the candidate, edited no code or tests, and committed nothing. Mutations ran only in new scratch copies outside the repository.

## What was rerun

| Check | Result |
|---|---|
| `node --test` in CoachingCore | 1058/1058 pass |
| Shipped differential (summary per step) | H1: 13 of 130 steps differ. H2: 300/300 identical. Matches the request. |
| Full-result differential (every field hashed) | 116/130 H1 steps byte-identical; 39/39 generations and 300/300 H2 intakes identical. The 14th step, H05 s5, differs only in `inputHash` and `trace`. |
| Randomized fuzz (400 seeds, 9,684 steps, F08 mixed with other events) | 0 exceptions, 0 caught TypeErrors, 0 non-determinism, 0 replay changes, 0 clearance words |
| Targeted mutants (54, against the five v1cp test files) | 43 caught, 11 survive. 9 survivors shown non-equivalent, 1 likely equivalent, 1 undetermined. |

Of the 13 differing steps, 12 are approved Block 1 decisions (A1, A2, A3). R7D-H20 s1–s2 is not: it rests on "back on Wednesday", which is outside the collocations Q01(c) approves.

## Findings

| Id | Severity | In one line |
|---|---|---|
| QRE-V1CP-01 | BLOCKING | The A1 lexicon is wider than the approved list. On the default path, "banged my head into the door frame" (category WORK) now gets a nonclinical return with no question; FREEZE-6 asked. |
| QRE-V1CP-02 | BLOCKING | `endF08Marks` leaves a superseded Situation 1 episode open in its week. After a fever hold and a readiness declaration, answering the S1 check replaces the MODERATE-floor restart with the S1 ladder from pre-window doses (week 3: 35/35/35 min instead of 15/15/20). |
| QRE-V1CP-03 | MAJOR | The S3 hold from Situation 1 lives only in the client's `referenceState`. `restartProgram` given only the record returns a plan; a sign-yes entry records no fact at all. Route to Security. |
| QRE-V1CP-04 | MAJOR | An adverse session reported after a check, but dated before it, is never asked (C-Q05-4). |
| QRE-V1CP-05 | MAJOR | D49 is broken at the ladder exit. With 5-set held rows, sets go 1 → 2 → 3 on the ladder, then 5 in the first normal week. |
| QRE-V1CP-06 | MAJOR | S3: a stated pause shorter than the record overrides it, so strength starts at 2 sets instead of the 1-set return entry. |
| QRE-V1CP-07 | MAJOR | A race after the window stays live while every other session waits for the window-end check. Route to SSCTR (I-17). |
| QRE-V1CP-08 | MAJOR | S3: the new plan re-routes the historic clinical episode at its first review, so a second declaration is needed. Route to PCG and SSCTR. |
| QRE-V1CP-09 | MAJOR | Test adequacy. The D49 cap (M01) and the R4 reserve clamp (M07) survive, with the C-Q12-2 assertion vacuous because it logs no loads. So do `endF08Marks`, `ownStart`, C-Q06-2, I-04, I-06, I-16 and the R2 quality conversion. |
| QRE-V1CP-10 | MINOR | Situation 1 state is split between the program and the record. A record without the F08 facts leaves a wait the check cannot end. |
| QRE-V1CP-11 | MINOR | The A2 amendment weakens three legacy R7-C assertions to "not HOLD". |
| QRE-V1CP-12 | MINOR | The shipped differential compares a summary, not the result. |
| QRE-V1CP-13 | MINOR | The declaration's `hold` reference is never checked against the holds on record. Route to Security. |

Of the seven mutations the caller named, five are caught: drop the WAIT, accept an unanswered sign, skip the shift on a missed rung, drop the MODERATE floor, drop the region limit. Two survive: drop the D49 cap, drop the R4 reserve clamp.

## Conditions for a re-review

1. QRE-V1CP-01: the lexicon is limited to the approved list, or extended by an SSCTR record, with negative directed tests.
2. QRE-V1CP-02: the superseded episode no longer opens in its week; tests cover the readiness and declared-break callers.
3. QRE-V1CP-03 to -08 and -13: each is fixed with a test, or carried as a named blocker with its owner.
4. New tests kill M01, M07, M11, M12, M26, M33, M37, M51 and M54.
5. The suite and the full-result differential are rerun on the fixed revision, followed by one narrow QRE re-review.

Both BLOCKING findings are narrow and runtime-only, so they fit the task contract's single bounded fix cycle. Whether the MAJOR findings ride that cycle is the Chief's decision.
