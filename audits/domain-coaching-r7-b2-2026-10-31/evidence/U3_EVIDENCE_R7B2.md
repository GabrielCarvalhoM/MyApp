# R7-B.2 — U3 evidence and the freeze R7B2-FREEZE-1

**Freeze:** [`CoachingCore/r7/b2/RUNTIME_FREEZE_R7B2_1.json`](../../../CoachingCore/r7/b2/RUNTIME_FREEZE_R7B2_1.json), committed at `1a1c728`.
- Record sha256: `8d51def5…fee`.
- Bytes of `63fa602`:
  - source digest `57512322…ecbd`, manifest digest `f9c5bd5a…ceca`;
  - 122 files;
  - 799 tests, 799 pass (786 + 13).
- Runtime delta from R7B1-FREEZE-2 (`146ebb8`): `src/r6-adaptation.mjs` changed, `test/r7b2-clinical-precedence.test.mjs` added, nothing removed. This is the U2 fix of `f1259d3`, unchanged.

**Verifier:** `node CoachingCore/scripts/verify-r7b2.mjs --tests` gives 35/35 PASS, recorded in `CoachingCore/r7/b2/VERIFICATION_R7B2_1.json`.

## Gates on the frozen bytes

| Gate | Result | Report (`CoachingCore/r7/b2/`) |
|---|---|---|
| G3: adversarial neighbors | 32/32 PASS. Each case is checked on R7-B.2 for its expected outcome and against R7B1-FREEZE-2 for its relation (SAME, or TO_CLINICAL). The cases: A (4), B (2), C (9, including K6's rows and K6b), after the clinical route (2), D (1), E (2), F (2), CAND-01 (2 clinical, 2 nonclinical), CAND-02 (3 clinical, 2 nonclinical), OBS-01 (1, unchanged) | `NEIGHBORS_R7B2.json` (`scripts/neighbors-r7b2.mjs`) |
| G3: K6, K6b, inventory | K6, K6b, CAND-01 and CAND-02 PASS (label `R7B2-FREEZE-1`). The copies equal the R7-B.1 originals; the freeze checks this | `audits/…/probes/out/*-R7B2-FREEZE-1.json` |
| Inherited R7-B.1 adversarial probes | 3,228 checks, 0 failed, the same count as on R7B1-FREEZE-2. Run from a verbatim copy, because the original writes into the closed mission's `out/` | `audits/…/probes/out/adversarial-R7B2-FREEZE-1.json` |
| G4: intake differential | 83/83 programs identical, 0 status differences, 0 dose findings. `scripts/regress-r7b.mjs --base 146ebb8` was run read-only; its stdout is the report | `REGRESSION_INTAKE_R7B2_VS_R7B1_FREEZE2.json` |
| G4: timeline differential | PASS. 151 timelines, 1,626 steps. 98 corpus and other-kind timelines and 20 R7-B.1 blocker-path timelines are identical step by step. Of 33 B.2-path timelines, 19 are identical and 14 change only one way: a nonclinical question becomes the clinical route. The substitution grid (184 decisions), the clinical sweep (389 decisions on every corpus program) and the carried-state check (4 rows) are unchanged. 0 envelope findings, 0 run rises | `REGRESSION_R7B2.json` (`scripts/regress-r7b2.mjs`) |
| G5: mutation | 9 mutants, 8 killed. The 7 precedence mutants M58–M64 are killed by the R7-B.2 tests. R7-B.1's M26 overlaps the diff; rerun as M26b, it is killed. R7-B.1's M41 also overlaps; rerun, it survives and is documented as equivalent (below). Every other R7-B.1 and R7-B mutant result is inherited: no other fragment overlaps the diff | `MUTATION_R7B2.json` (`scripts/mutate-r7b2.mjs`) |
| G6: inherited conformance | `conformance-r7b.mjs` PASS (301 entries) and `conformance-r7b1.mjs` PASS (7 entries), both run read-only | `CONFORMANCE_R7B_ON_R7B2.report.json`, `CONFORMANCE_R7B1_DELTA_ON_R7B2.report.json` |
| G6: B.2 delta | One entry, `SSCTR:B0-C06#c8`, mapped to D08. It closes QE-R7B1-04, R7B2-CAND-01 and R7B2-CAND-02; every consumer and test it lists exists | `CONFORMANCE_R7B2_DELTA.json`, `.report.json` (`scripts/conformance-r7b2.mjs`) |
| G7: supersession | `verify-r7b1.mjs`, run read-only on these bytes, fails exactly `files` (`src/r6-adaptation.mjs`), `sourceDigest` and `manifestDigest`. This is by design and recorded, never rewritten | `SUPERSESSION_VERIFY_R7B1_ON_R7B2.json` |

The test-change record is [`TEST_CHANGES_R7B2.md`](../TEST_CHANGES_R7B2.md): no existing test was changed.

## G4 reading: the contract §5 routing condition holds

The 14 changed decisions are listed in `REGRESSION_R7B2.json` (`allowedChanges.rows`). They are:
- the K6 rows: pain, injury, `pain:'yes'`, clinical text, and pain with a ladder step, a decline or an unrecognised choice;
- K6b's pain-only step;
- the three CAND-02 resends;
- the three CAND-01 clinical reviews.

The script checks every one of them for all of the following:
- the review carries a clinical signal of its own;
- on R7B1-FREEZE-2 the decision is ASK, a nonclinical question with no proposal;
- on R7-B.2 it is CLINICAL_HUMAN_REQUIRED, with no proposal and the pending state CLINICAL_HUMAN_REQUIRED;
- the program hash and the ledger hash after the step are the same on both runtimes;
- no week's prescriptions differ.

No other decision differs: neither on any step without a clinical signal, nor on any step of the R7-B.1 blocker paths, the corpus or the grid. These clinical-signal reviews are identical:
- the illness and injury returns in the re-entry week (the return handler already screened first);
- the event-week pain reviews;
- R7-B.1's pain with a block choice (QE-R7B1-01);
- the 389-decision clinical sweep.

**The carried reference state.** The regress driver does not carry `referenceState` between reviews. The R7-B.1 design does not carry it either. Carried, it would make the next review differ downstream: a later weekly review in the re-entry timeline stays CLINICAL_HUMAN_REQUIRED instead of KEEP with a proposal. This comes from the unchanged sticky rule (`withReference`; binding invariant 2) applied to a state that is now correctly clinical. It is not a different decision for the same input. To show that, the carried-state check gives each runtime's state to both runtimes. For the same input the two runtimes decide alike in all 4 rows:
- with the FREEZE-2 state (pending ASK): ASK, then KEEP with a proposal, on both;
- with the R7-B.2 state (pending CLINICAL_HUMAN_REQUIRED): CLINICAL_HUMAN_REQUIRED, with no proposal, on both.

**Routing.** The freeze computes `routing.conditionHolds = true`. Under contract §5:
- the SSCTR is not called;
- Quality is inherited from R7-B.1's READY, with this differential recorded;
- the Engineering judge (U4) is the only gate to run.

## M41: equivalent on these bytes

R7-B.1's M41 removes the guard `handled.status==='CLINICAL_HUMAN_REQUIRED'?handled:` from the decision line. That guard makes a clinical handler result outrank the block-choice question (QE-R7B1-01). Rerun on the new bytes, M41 survives every R7-B.1 and R7-B.2 test.

It is equivalent, for these reasons:
- After admission, a handler returns CLINICAL_HUMAN_REQUIRED only through its own screen:
  - `exerciseSubstitution` through `substitutionClinical`;
  - `returnAfterPause` through `interruptionScreen`.

  No other handler or callee in `src/r6-adaptation.mjs` or its imports returns that status after admission.
- `clinicalRoute(kind,review)` calls the same function on the same review. The factual re-plan context spreads `ctx`, and nothing in the module replaces `review`.
- So `handled.status==='CLINICAL_HUMAN_REQUIRED'` implies `clinical!==null`, and `decision0` is `clinical` before the guarded fragment is read.

QE-R7B1-01's behaviour stays covered: by the R7-B.1 tests, which pass on these bytes; by neighbor E; and by the R7-B.1 timeline `R7B1:QE-R7B1-01:clinical+choice`, which is identical.

The guard is now redundant, but it is left in place: the change stays minimal, and U3 makes no runtime change. **For U4:** the judge may weigh whether this redundancy matters. It is not a defect.

## For U4

- **Route.** One fresh independent `quality-reliability-engineer`, `claude-opus-5-5` / `xhigh`, mode `productization`, with the `<task-route>` envelope.
- **Request file.** Bound to R7B2-FREEZE-1: record sha256 `8d51def5…fee`, freeze commit `1a1c728`.
- **Contents of the request:**
  - contract Q1–Q4;
  - probes K6 and K6b;
  - the R7-B.1 Engineering recheck record;
  - the task contract;
  - `CoachingCore/r7/b2/BLOCKER_CLOSURE_R7B2.md`;
  - this note.
- **Outputs** go under `audits/domain-coaching-r7-b2-2026-10-31/reviews/`.
- **SSCTR and Quality** are not dispatched, because the §5 condition holds.
