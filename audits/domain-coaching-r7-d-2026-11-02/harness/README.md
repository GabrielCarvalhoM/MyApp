# R7-D harness (`R7D-HARNESS-1`)

Fresh-generalization harness for the R7 reference runtime. It sits outside `CoachingCore/` and has no `*.test.*` file, so `node --test CoachingCore` never sees it (884 frozen tests untouched). It never writes inside `CoachingCore/` or into a corpus file. The pre-registered rules it implements are in `../PREREGISTRATION_R7D.md`; the author-facing contract is `../author/`.

## Run

```
node r7d-harness.mjs --corpus <corpus.json> --out <new dir> [--manifest <manifest.json> --seal <seal.json> --first-evaluation]
                     [--runtime-root <dir holding CoachingCore>] [--freeze-record <record.json>] [--cases A,B] [--relations X,Y]
```

1. It hashes every runtime file bound by the freeze record (default R7C-FREEZE-4) and refuses on any runtime difference.
2. It checks the corpus bytes, the seal and the freshness manifest.
3. It checks every case's structure (`../author/check-corpus.mjs`); a structural error is a corpus error.
4. It runs each case through the C3 client (`lib/client.mjs`). The client carries the record as returned, adopts proposals, never invents a fact, and models qualified clearance only where a step says so.
5. It applies P01–P14 (`lib/properties.mjs`), the metamorphic relations (`lib/metamorphic.mjs`, including determinism) and the author's expectations (`lib/expectations.mjs`).
6. It writes four reports: `RUN_REPORT.json`, `DOMAIN_PACKET.{json,md}` (for the domain judge) and `SUMMARY.md`.

With `--first-evaluation`:
- the output directory must be new;
- the manifest must show `evaluationCount: 0`;
- afterwards only the manifest's `evaluation` block is written (`evaluationCount: 1`, `firstEvaluationAt`, report hash). The seal digest excludes that block.

`generate-sample.mjs` draws onboarding-only intakes from the interface vocabulary. Its seed is `sha256('R7D-SAMPLE|'+label+'|'+manifestDigest)` of the evaluated freeze.

## Validation (`validation/`)

Development cases only (`DEV_CASES_R7D.json`, from `build-dev-cases.mjs`): written by the harness author, contaminated by construction, never evidence. `run-validation.mjs` produced `HARNESS_VALIDATION_R7D.json`:

- **No false block on R7C-FREEZE-4** (12 dev cases): PASS. The one non-blocking difference is HV-01 below.
- **Sensitivity.** Each documented defect is detected on its own runtime and is clean on FREEZE-4:

  | Defect | Runtime | Detected by |
  |---|---|---|
  | QE-R7C-10 | R7C-FREEZE-3 | CARRIER_CLINICAL (P05) |
  | R7C-G01 (unknown training planned at the entry dose without a question) | R7B2-FREEZE-1 | P03(d) |
  | D54 | pre-R7A source | P07 race-window strength dose |
- **Witnesses:** 27 of 27 fire, one or more for every automated check and relation. Each is a constructed output violation or a wrapped runtime.

To rebuild the superseded runtimes outside the repository (from this worktree's root, into an empty directory `$D`):

```
git archive 08c6db3 CoachingCore audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json | tar -x -C $D/rt-f3
git archive 1a1c728 CoachingCore audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json | tar -x -C $D/rt-b2
cp -r audits/domain-coaching-r7a-2026-10-27/pre-r7a-source/CoachingCore $D/rt-prer7a/  (plus the R6 ssctr-policy-review.json at the same relative path)
node validation/run-validation.mjs --dev validation/DEV_CASES_R7D.json --out <file> --f4 <worktree root> --f3 $D/rt-f3 --b2 $D/rt-b2 --prer7a $D/rt-prer7a
```

**Harness-validation finding HV-01 (pre-existing; POLICY_QUESTION, not blocking).**
- A known dumbbell-pair load stated as 36 kg TOTAL instead of 18 kg PER_HAND starts the same mass. It then progresses by the TOTAL increment of 2.5 kg, so 38.5 kg total (19.25 kg per hand) where PER_HAND gives 40 (20 per hand).
- The policy authorizes this: `operational.strength.loadUnits` keeps a load as reported, and `smallestIncrement` differs by convention. So `LOAD_CONVENTION_EQUIVALENT` compares the starting mass and every decision except the later load values of the flipped exercises, and records the rest as a difference.
- Routed to the SSCTR with the PCG: should a dumbbell pair declared TOTAL progress in real dumbbell steps?
