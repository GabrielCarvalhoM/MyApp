# R7-D final holdout: quality and reliability judgment

**Record:** `QRE-R7D-FINAL-HOLDOUT-r1`, 2026-11-08. The full evidence is in `QUALITY_FINAL_HOLDOUT_R7D.json` beside this file.

**Judge:** a fresh instance of the Quality & Reliability Engineer. It did not write the runtime, the harness, the instruments or the corpus, and it did not read `final/judgment/ssctr/`.

**What was judged:** R7D-FREEZE-5, evaluated once by R7D-HARNESS-8 under R7D-PREREG-7, on H1 (35 cases), H1-M (the relations) and H2 (300 intakes).

## Verdict: INVALID_HOLDOUT

- **Freeze and protocol are intact, and the instrument is reliable.**
- **Registered critical coverage is missing.** Each missing clause names INVALID_HOLDOUT as its consequence.
- **The invalidity hides one confirmed blocker on a valid case:** QRE-P4-F01. So the valid evidence already rules out READY.

## Blocking findings

- **QRE-P4-F01: GENERALIZATION_BLOCKER, structural, PRE_EXISTING.**
  - What happens: R7D-F13 s1 is an empty weekly review after seven unreported weeks. The coach trims the next weeks to the entry dose (EASY 20/20/LONG 15 becomes 15/15/15) and marks the plan VALID. It asks no `UNREPORTED_TRAINING` question. This violates P03(d).
  - Witnesses: the same thing happens on R7D-F25's intake, and whenever the first planned week is a low-dose CONSOLIDATION week. The same athlete is asked the question before a DEVELOPMENT week.
  - It behaves identically on R7D-FREEZE-4 and R7C-FREEZE-4. No registered envelope covers it.
  - It is not a SAFETY_BLOCKER: the doses fall and never rise.
- **QRE-P4-I01: INVALID_HOLDOUT.** These coverage items are missing without ambiguity:
  - CARRIER_HOLD > 0: 0 units (PREREG-2 Δ9);
  - a directly answered `UNREPORTED_TRAINING` question: 1 case of the 2 required (PREREG-2 Δ9);
  - a break under a clinical flag or a pain substitution, then clearance: 1 case of 2, because R7D-F22 was lost to a CORPUS_ERROR (PREREG-3 Δ6);
  - a whole plan week executed in full between two breaks: 0 cases, because the strength rows reach the coach without loads (PREREG-5 Δ3);
  - a re-entry week with optional sessions left undone: 0 cases (PREREG-6 Δ5);
  - a race week whose runs are only the race touch, an optional shakeout and the race: 0 cases (PREREG-6 Δ18);
  - a race week with no gated run where strength and shakeout report adverse recovery: 0 cases (PREREG-6 Δ29).

## Conditions

- **K01: a new, independent holdout** that meets every coverage clause. The Founder decides.
- **K02: a fix for QRE-P4-F01.** It needs a new authorization, a new freeze and a new holdout.
- **K03: the three HARNESS_GAP corrections, in a newly registered harness version.**
  - PREREG-1 §3 asks for the correction; §9 forbids a harness change made in response to a final-holdout output.
  - The Founder decides whether the corrections may be carried into the replacement holdout's harness.
- **K04: CQ4-1 carried.** Tests T39 to T41 move into the CoachingCore suite at the next authorized candidate.

## Residual limitations

- The author's reading behaviour is self-reported.
- Commit times come from the committer's clock; ancestry confirms the order.
- Validation 8's sensitivity rows on older runtimes were taken from the record. The three new mutant rows were reproduced.
- The root cause of F01 in the code was not located.
- H2 tests the intake only.
- The harness runs no relation on a case with a CORPUS_ERROR.
- The start-time question path (QRE2-P34-01) was never raised in H1.
- The domain items belong to the SSCTR judge.

## Integrity

- **Freeze: PASS.**
  - Both RUN_REPORTs show 649/649 files equal to the record and an empty `runtimeDiff`.
  - `verify-r7d-5.mjs --suite` passes 33 of 34 checks. Only `no-final-holdout` fails, by design. The suite of 1005 tests and the three conformance checks pass.
- **Protocol: PASS.**
  - The corpus bytes and the manifest seal digests match both seals, now and at `14c7ec8`.
  - `authorStartedAt` is 88 s after the instrument commit `58d6766`.
  - The seal commit precedes both evaluations.
  - Both manifests show `evaluationCount 1` and name the hash of their report.
  - The evaluation files appear in one commit only.
  - The harness and PREREG-7 files equal those committed in `58d6766`.
  - The H2 seed rule holds.
- **Instrument: reliable, with three harness gaps.**
  - HARNESS-8 differs from HARNESS-7 r2 only as Δ38 and Δ39 state.
  - Validation 8 is confirmed: no false block, 27/27 sensitivity rows, 56/56 witnesses. A rerun here reproduced it on the 64 DEV cases, and QF3, QF6 and QF7 were each detected.
  - CQ4-1 is reproduced: QF3 fails only T39, QF7 only T40, QF6 only T41.
  - All 35 H1 and 300 H2 step digests recompute identically.

## Automated FAIL units

| Unit | Ruling | Mechanism |
|---|---|---|
| P03 in R7D-F13, s1 | Runtime violation (QRE-P4-F01) | The entry dose trims the plan, VALID, with no question |
| P03 in R7D-F21, s3 | HARNESS_GAP (QRE-P4-H02) | The only unit counted is a session dated that day, which this same review reports as done. The re-plan starts at week 6 and passes |
| P05 and CARRIER_CLINICAL in R7D-F12 | HARNESS_GAP (QRE-P4-H03) | The variant drops the week-4 review, lets week 5 run under a different plan in force, and replays facts written relative to the plan. In the probe form the carried and direct runs are identical |
| P06 in R7D-F07 (4 units) | HARNESS_GAP (QRE-P4-H01) | The intake's `longestRunMinutes 0` is read as a run reference, giving a ceiling of 5 min, below the 15-min minimum. With the field absent, the output is identical and the result is NOT_EVALUABLE. The substance of the s1 unit is the CC-F05 envelope (QRE-P4-R01) |

H2 has no violation. H1 has no property observation of any kind, including no `WINDOW_ENDED_BY_ROW_NAME`.

## Corpus errors

All four are CORPUS_ERROR: in each, the client resolved the reference correctly against the plan in force.

- **R7D-F22, s1:** the substitution names a SQUAT in an upper-body session. Only the program's generation stays evaluable.
- **R7D-F32, s3, and R7D-F33, s3:** the author reports a run on a day the adopted return had made a rest day. The generation, s1 and s2 stay evaluable, including the return.
- **R7D-F34, s4:** the author reports a strength day that was never prescribed. The generation and s1 to s3 stay evaluable.

That is 4 of 35 cases (11.4 %), above the 10 % ceiling the Phase 1 taxonomy proposes. The verdict does not rest on that number, because the ceiling is marked as a proposal.

## Escalations

The following go to the coordinator and then to the Founder. Nothing has been done about them:
- the fix for F01;
- the replacement holdout;
- whether the harness corrections may be carried forward, given PREREG-1 §9.
