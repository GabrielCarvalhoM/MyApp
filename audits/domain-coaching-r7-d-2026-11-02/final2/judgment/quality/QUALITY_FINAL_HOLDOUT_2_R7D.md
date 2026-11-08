# R7-D Phase 5 final holdout: quality and reliability judgment

**Record:** `QRE-R7D-FINAL-HOLDOUT-2-r1`, 2026-11-08. The full evidence is in `QUALITY_FINAL_HOLDOUT_2_R7D.json` beside this file.

**Judge:** a fresh instance of the Quality & Reliability Engineer.
- It did not write the runtime, the harness, the instruments or the corpus.
- It did not review the Phase 5 candidate, and it is not the domain judge.
- It did not read `final2/judgment/ssctr/` or the other judge's scratch directory.

**What was judged:** the single first evaluation of R7D-FREEZE-6 by R7D-HARNESS-9 under R7D-PREREG-8, on:
- H1 (R7D-FINAL-2: 39 cases, 130 steps);
- H1-M (the relations);
- H2 (300 intakes).

## Verdict: READY_WITH_CONDITIONS (quality side)

- **No blocking finding.**
  - No automated FAIL in H1, H1-M or H2.
  - No structural error, no CORPUS_ERROR, and no HARNESS_GAP that touches a unit.
- **The freeze is intact.**
  - 727/727 files equal the record, with no runtime difference.
  - `verify-r7d-6 --suite` passes 24 of 25 checks. Only `no-new-holdout` fails, by design.
  - The suite (1014 tests) and the three conformance checks pass.
- **The protocol is intact.**
  - The corpora, the manifests and the seals match, now and at the seal commit `56df0a1`.
  - The author started after the freeze and after the instrument commit.
  - The seal commit precedes the evaluation.
  - Each manifest records `evaluationCount 1` and its report hash, and each report was written once, into a new directory.
- **The instrument is reliable.**
  - R7D-HARNESS-9 differs from R7D-HARNESS-8 only as PREREG-8 Δ48 and Δ49 state.
  - The K03 changes return units as NOT_EVALUABLE, never as PASS. On the evaluated traces, 11 P06 units that HARNESS-8 counted as passes are now listed as not evaluable.
  - Validation 9 holds. Re-run here on the frozen bytes for DEV-9: no false block, and the same unit counts.
- **Reproduced in a fresh process:** all 39 H1 and 300 H2 step digests equal the sealed reports, and the H2 sample regenerates byte for byte.
- **Green results are not an approval by themselves.** The 28 H1 and 47 H2 NOT_EVALUABLE units belong to the domain judge. The final status counts them by the SSCTR's results, never as PASS.

## The required items

- **K-P5-2: 0.** No same-day reported session was dropped silently by the P06 twin. Two independent accountings on the evaluated traces agree.
  - The 11 listed same-day units are all the decision day's LONG run, already reported.
  - Every one is planned within the ceiling P06 would have used. They stay NOT_EVALUABLE.
- **Host-context disclosure: no effect on validity.**
  - The three files match the preface's hashes. None changed after `authorStartedAt`.
  - The memory index holds one-line summaries of earlier phases, with finding labels. It holds no case, no code and no runtime output.
  - What it says is already in the authorized brief, and it could only make the cases harder.
  - The letter of PREREG-1 §8.2 ("never findings") was passively not met. The holdout's validity is unaffected. A process condition is set for any future holdout.
- **Four tallies, kept separate:**
  - real runtime failures: 0;
  - CORPUS_ERROR: 0;
  - instrument gaps: 0 HARNESS_GAP units. The author noted 9 interface gaps, each attributed in the record, and none produced a lost or not-evaluable unit;
  - NOT_EVALUABLE: H1 28 units (P03 11, P06 14, P08 2, P18 1) in 10 cases, with the P08 case result NOT_EVALUABLE in R7D-H18 and R7D-H19; H2 47 P06 units.
- **Coverage:** every registered unit and case-level clause is met by valid, evaluable cases. The unit minima:
  - CARRIER_CLINICAL 3 and CARRIER_HOLD 2;
  - P08 53;
  - P17 112 and RESTATE_DECLARED_BREAK 41;
  - P18 70 and INSERT_NEWER_BREAK 7;
  - P18 15 in the PREREG-5 Δ3 cases, 28 in group (a) and 14 in group (b) of PREREG-6 Δ5.
- **One clause depends on a reading.** The clause is PREREG-6 Δ5: a return reported mid-week, after that week's sessions were not done.
  - It is met by R7D-H06, -H08 and -H11, if sessions inside the stated break count as not done. That is how the clause's source, SSCTR-P34-F01, defines the defect.
  - Under the narrower reading used in the Phase 4 record, only R7D-H06 counts. The holdout would then be INVALID_HOLDOUT on this clause.

## Non-blocking findings

- **QRE-P5H-F01 (OBSERVATION, pre-existing, structural): the reason-screen question does not lead to its own exit.**
  - Seen in R7D-H20, R7D-H32 and R7D-H34. Each break already carries a nonclinical category.
  - A word in its free text ("back", "feet", "a new baby") makes the screen ask for `interruption.reasonCategory`, which the athlete already gave. The result does not say which word caused the question.
  - The exit exists: the same break, re-sent by name with plain text or with no free text, applies (witnesses).
  - This mechanism accounts for 7 of the 11 failed author expectations, and the three returns are never applied in the holdout. It is fail-closed.
- **QRE-P5H-F02 (OBSERVATION): a dated double conflict is asked for undefined fields.** In R7D-H04 s2, the question asks for `changes.permanentFrom|sessionMove`, which neither the runtime nor the interface defines. Exits exist through documented events.
- **QRE-P5H-F03 (CONSUMER_CONDITION): a correction of a contradiction names the wrong report.**
  - In R7D-H38 s3, the correction names the report the record quarantined. It is excluded (`INVALID_CORRECTION_CHAIN`, disclosed in `provenance.excluded`).
  - The session stays conflicted and uncredited, which is the conservative direction.
- **QRE-P5H-F04 (KNOWN_DISCLOSED_RESIDUAL, the R4 HOLD envelope): the last-week HOLD is an internal error.**
  - In R7D-H05 s4, the last-week schedule change is held by an internal TypeError, reported as "Malformed review facts".
  - The same change one week earlier re-plans normally.
- **QRE-P5H-F05 (KNOWN_DISCLOSED_RESIDUAL, R-F08-1 R1/R2 and F08): a clinical false positive from free text.**
  - In R7D-H07, "my mother after her operation" routes the athlete's family break to a human. The episode then stays clinical.
  - This costs the (R) extra cases, but their clauses are still met (R7D-H09, R7D-H11).
- **Instrument notes, no unit affected:**
  - QRE-P5-F03 (0 occurrences here);
  - vacuous P03(d) not-evaluable listings (F07);
  - a latent client-9 corner (F08);
  - R7D-H03's load confirmation never delivered (F09);
  - conditional facts that found nothing, by design (F10).

## Conditions

- **K-QRE-P5H-01 to -03 (interface owner, with G03/PCG for the reason screen):** fix the three question and correction contracts above. Until then, consumers show the athlete the cause and the documented exit.
- **K-QRE-P5H-04 (instrument owner):** the QRE-P5-F03 listing fix and the P03(d) listing order, in the next registered harness.
- **K-QRE-P5H-05:** the carried K-P5-1 tests (J3, J1 and the T46 control).
- **K-QRE-P5H-06:** an explicit last-week rule in place of the R4 crash path.
- **K-QRE-P5H-07:** future holdout authors work without host-injected project memory, or record it with hashes.
- **K-QRE-P5H-08:** the NOT_EVALUABLE units count by the SSCTR's results, never as PASS.
- **K-QRE-P5H-09:** the binding consumer conditions (SSCTR r2 C1).

## Not done here

- Domain adequacy, the rubric, the DOMAIN_JUDGED parts of P07, P08, P09, P12 and P14, and every NOT_EVALUABLE result are the SSCTR's.
- So are the CFD-1 to CFD-5 and K-P5-3 shapes.
- The 28 sensitivity rows of validation 9 on superseded runtimes were taken from the record. Reproduced here: the no-false-block run and its counts.
- Nothing was written outside this folder. Nothing was deleted, and no git state was changed.
