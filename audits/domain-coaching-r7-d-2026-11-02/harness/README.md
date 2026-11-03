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
git archive 08c6db3 CoachingCore audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json | tar -x -C $D/rt-f3
git archive 1a1c728 CoachingCore audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json | tar -x -C $D/rt-b2
cp -r audits/domain-coaching-r7a-2026-10-27/pre-r7a-source/CoachingCore $D/rt-prer7a/  (plus the R6 ssctr-policy-review.json at the same relative path)
node validation/run-validation.mjs --dev validation/DEV_CASES_R7D.json --out <file> --f4 <worktree root> --f3 $D/rt-f3 --b2 $D/rt-b2 --prer7a $D/rt-prer7a
```

**Harness-validation finding HV-01 (pre-existing; POLICY_QUESTION, not blocking).**
- A known dumbbell-pair load stated as 36 kg TOTAL instead of 18 kg PER_HAND starts the same mass. It then progresses by the TOTAL increment of 2.5 kg, so 38.5 kg total (19.25 kg per hand) where PER_HAND gives 40 (20 per hand).
- The policy authorizes this: `operational.strength.loadUnits` keeps a load as reported, and `smallestIncrement` differs by convention. So `LOAD_CONVENTION_EQUIVALENT` compares the starting mass and every decision except the later load values of the flipped exercises, and records the rest as a difference.
- Routed to the SSCTR with the PCG: should a dumbbell pair declared TOTAL progress in real dumbbell steps?

## R7D-HARNESS-2 (Phase 3)

R7D-HARNESS-1 is commit `8eec795`, kept as the record of the Phase 2 diagnostic. R7D-HARNESS-2 corrects the gaps the diagnostic found (pre-registered as `R7D-PREREG-2`, `../PREREGISTRATION_R7D_2.md`):

| Gap | Change |
|---|---|
| HG-01 | The client carries the athlete's current learning consent to every decision; P14 reads the consent in force |
| HG-02 | P07 follows the race date of the adopted plan (`goal.run.event.date`), never a refused change |
| HG-03 | P09: `confounded` makes only performance and effort unreadable; adverse recovery or an impaired next day stays unfavourable |
| HG-04 | Author expectations: own-week ROLE_ABSENT/PRESENT read sessions from the step date; ROLE_MINUTES_COMPARE counts an absent role as 0 |
| HG-05 | P08 applies to any declared break, whatever event carries it, and to any decision that records a return |
| HG-06 | Pending-load confirmations use the kilogram value the runtime returned and the planned row's convention |
| HG-07 | Walk/jog intervals in seconds are shown in the packet and compared in the canonical view |
| F03 | New P16: a load logged exactly as prescribed is read; no plan states a machine load the athlete did not supply, log or confirm |

The default freeze record is `CoachingCore/r7/d/RUNTIME_FREEZE_R7D_1.json`. Before it exists, a run names a record and passes `--allow-runtime-diff`; the report then lists the differing files and the evaluated bytes (`runtimeSource`). A first evaluation refuses `--allow-runtime-diff`.

Validation 2: `validation/DEV_CASES_R7D_2.json` (from `build-dev-cases.mjs`, contaminated by construction) and `validation/HARNESS_VALIDATION_R7D_2.json`:
```
node validation/run-validation.mjs --dev validation/DEV_CASES_R7D_2.json --out <file> --candidate <worktree root> --f4 $D/rt-f4 --f3 $D/rt-f3 --b2 $D/rt-b2 --prer7a $D/rt-prer7a
```
`$D/rt-f4` is `git archive a9654c8 CoachingCore audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json`, the other runtimes as above.

Results:
- no false block on the candidate;
- each of the seven sensitivity defects is detected on its own runtime and clean on the candidate:
  - on R7C-FREEZE-4: DX-01 (P10), DX-02 (P08), F03 (P16), F04 (P09);
  - QE-R7C-10, R7C-G01 and D54 on their earlier runtimes;
- P05 coverage: CARRIER_CLINICAL 7, CARRIER_HOLD 1 and RESEND 16 units;
- 33/33 witnesses fire, including the tightened P07 (a race date changed without a request) and P16 (a fabricated next-setting fallback), added after the engineering check (CF-5).

The validation also measures finding **P3-F01**: a declared-break answer recorded by a clinical route is not retained across qualified clearance. It is a true finding, not a false block. It already existed on R7C-FREEZE-4 in the return-report form.

## R7D-HARNESS-3 (Phase 3.1)

R7D-HARNESS-2 is commit `b77480f` (the R7D-FREEZE-1 instruments). R7D-HARNESS-3 measures the Phase 3.1 invariant (`R7D-PREREG-3`): a stated break is a fact that survives ASK, HOLD and CLINICAL_HUMAN_REQUIRED routing until a return applies it.

| Change | Where |
|---|---|
| **P17 (new):** (a) no VALID decision while a stated break is not applied, the applying decision excepted; (c) event separation (another event kind is never applied over the break, nor with its return) | `lib/properties.mjs` |
| **RESTATE_DECLARED_BREAK (new, P17(b)):** each stated break its own decision did not apply, stated again in every later review that states none, must change no decision | `lib/metamorphic.mjs` |
| P03 and P10 read the record's `INTERRUPTION_DECLARED` rows (each matches the review that stated it; never dropped or rewritten) | `lib/properties.mjs` |
| P11 and P12: a change request its own decision asked about or refused is not in force (PREREG-3 Δ5) | `lib/properties.mjs` |
| The domain packet shows a recorded break not applied yet (renderer only) | `lib/report.mjs` |
| Default freeze record `CoachingCore/r7/d/RUNTIME_FREEZE_R7D_2.json` | `r7d-harness.mjs` |

Validation 3: `validation/DEV_CASES_R7D_3.json` (from `build-dev-cases.mjs`: DEV-18 to DEV-21 added; contaminated by construction) and `validation/HARNESS_VALIDATION_R7D_3.json`:
```
node validation/run-validation.mjs --dev validation/DEV_CASES_R7D_3.json --out <file> --candidate <worktree root> --f4 $D/rt-f4 --f3 $D/rt-f3 --b2 $D/rt-b2 --prer7a $D/rt-prer7a --d1 $D/rt-d1
```
`$D/rt-d1` is `git archive 4cabd18 CoachingCore audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json` (R7D-FREEZE-1), with `CoachingCore/node_modules` copied in, as for the other runtimes.

Results: no false block on the candidate; 10/10 sensitivity rows detected on their own runtime and clean on the candidate (QE-R7D-P3-01(a) and (b) by P17 and RESTATE, P3-F01 by CARRIER_CLINICAL, all on R7D-FREEZE-1); coverage CARRIER_CLINICAL 7, CARRIER_HOLD 1, RESEND 20, RESTATE 4, P17 16 units; 37/37 witnesses fire. P3-F01 is no longer a finding: DEV-17 and DEV-17b are plain no-false-block cases.
