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

Results: no false block on the candidate; 10/10 sensitivity rows detected on their own runtime and clean on the candidate (QE-R7D-P3-01(a) and (b) by P17 and RESTATE, P3-F01 by CARRIER_CLINICAL, all on R7D-FREEZE-1); coverage CARRIER_CLINICAL 7, CARRIER_HOLD 1, RESEND 20, RESTATE 4, P17 19 units; 39/39 witnesses fire (after the Phase 3.1 checks; 16 units and 37 witnesses before them). P3-F01 is no longer a finding: DEV-17 and DEV-17b are plain no-false-block cases.

**Rebuilding a runtime for the whole suite** (after the Phase 3.1 checks, QE-R7D-P31-13 and SSCTR CF-P31-08). The harness and its validation need only the R6 and B0 records listed above. The whole `node --test` suite also has legacy-path tests that read three more authority records. Without them a rebuilt runtime gives 908/921. Add them to the `git archive` list:
- `audits/domain-closure-r3-2026-10-24/reviews/ssctr-records.json`
- `audits/domain-closure-r4-2026-10-25/reviews/ssctr-envelope-review.json`
- `audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json`

**After the Phase 3.1 checks (instrument text and oracles only, no runtime byte):**
- P17 opens no window for a review refused before it was read (HOLD with no record returned);
- P17 also checks that a stated break is applied once;
- P03 checks a declared-break row's athlete, clock and facts hash.

The validation adds the witnesses W-P17d and W-P03c.

## R7D-HARNESS-4 (Phase 3.2)

R7D-HARNESS-3 is commit `747eab2` (the R7D-FREEZE-2 instruments). R7D-HARNESS-4 measures the Phase 3.2 invariant (`R7D-PREREG-4`, SSCTR-P31-F02): a newer stated break never replaces, joins or outranks an older one that is still open unless it names it; separate breaks stay separate facts.

| Change | Where |
|---|---|
| **P18 (new):** at every return applied while two or more stated breaks are open, (a) each one is accounted for (the stop covers its days; listed as a separate break with recorded training after it; or listed as not read because it corrects an applied break), (b) every open break after the first carries a name (the relation was stated) | `lib/properties.mjs` |
| **INSERT_NEWER_BREAK (new, P18 metamorphic):** each review that applied a return reading a kept break, sent again with a newer break that names none: no return, not VALID | `lib/metamorphic.mjs` |
| RENAME_OPAQUE_IDS also renames `interruption.episodeId` (an opaque identity, like `correctionOf`); HARNESS-3 broke a named correction's reference in the variant | `lib/metamorphic.mjs` |
| The C3 client answers TRAINING_BETWEEN_BREAKS as UNREPORTED_TRAINING (the listed sessions) | `lib/client.mjs` |
| The domain packet shows every recorded break not applied yet, not only the latest | `lib/report.mjs` |
| Default freeze record `CoachingCore/r7/d/RUNTIME_FREEZE_R7D_3.json` | `r7d-harness.mjs` |

Validation 4: `validation/DEV_CASES_R7D_4.json` (from `build-dev-cases.mjs`: DEV-22 to DEV-25 added; contaminated by construction) and `validation/HARNESS_VALIDATION_R7D_4.json`:
```
node validation/run-validation.mjs --dev validation/DEV_CASES_R7D_4.json --out <file> --candidate <worktree root> --f4 $D/rt-f4 --f3 $D/rt-f3 --b2 $D/rt-b2 --prer7a $D/rt-prer7a --d1 $D/rt-d1 --d2 $D/rt-d2
```
`$D/rt-d2` is `git archive 93f3a38 CoachingCore audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json` (R7D-FREEZE-2; add the three R3/R4/R5 records above for the whole suite), with `CoachingCore/node_modules` copied in.

Results: no false block on the candidate; 13/13 sensitivity rows detected on their own runtime and clean on the candidate (SSCTR-P31-F02 by P18 on DEV-22/23/24 and by INSERT_NEWER_BREAK on DEV-18/20, and the SSCTR-P31-F03 relabel path by P18 on DEV-25, all on R7D-FREEZE-2); coverage CARRIER_CLINICAL 7, CARRIER_HOLD 1, RESEND 24, RESTATE 13, INSERT_NEWER_BREAK 4, P17 39, P18 6 units; 42/42 witnesses fire (W-P18a, W-P18b, W-INSERT added).

**After the Phase 3.2 checks** (instrument text and oracles only, no runtime byte; R7D-PREREG-4 addendum Δ9–Δ10):
- RESTATE_DECLARED_BREAK does not restate a stated correction of an applied break when another break is stated in its window. Under B4, kept, it is not read (`notApplied`); stated again, it is asked. Excluded units are listed (`B4_CORRECTION_ACROSS_KEPT_BREAK`), and P18 measures that path (QE-R7D-P32-01).
- DEV-26 (the QE-FB-2 form: a correction of an applied holiday while a trip is kept) is added to `DEV_CASES_R7D_4.json`, and validation 4 is re-run with it. It is also a sensitivity case for the p4b path on R7D-FREEZE-2.
- The P17 and RESTATE comments no longer say that a newer stated break replaces an older one (QE-R7D-P32-08).

Validation 4, re-run:
- no false block;
- 13/13 sensitivity rows, with F02 by P18 now on DEV-22/23/24/26;
- coverage: RESTATE 14 units (1 excluded under B4: DEV-26@w7d1), INSERT_NEWER_BREAK 5, P17 44, P18 9;
- 42/42 witnesses.

## R7D-HARNESS-5 (R7-D Phase 3.3, SSCTR-P32-F01)

R7D-HARNESS-4 is commit `9042ed0`. R7D-HARNESS-5 changes one check, pre-registered as `R7D-PREREG-5` (`../PREREGISTRATION_R7D_5.md`):

| Change | Where |
|---|---|
| **P18(a), re-entry week:** a separate break listed `TRAINING_AFTER` is accounted for only when a whole week of the plan between its last day and the stop's first day was executed: every live session of that week falls between them and has an executed report (completed, not conflicted, not superseded). One run, an aborted run, or sessions in no such week account for nothing: the stop must cover the break (`OLDER_BREAK_DROPPED` otherwise). Under R7D-HARNESS-4 any executed report between them was enough, so nothing detected F01 | `lib/properties.mjs` (`executedWeekBetween`) |
| The runtime's own rule is stricter (every gate ADVANCE or EARNED, no adverse response). This check is the part a client can read from the plan and the record, so it never blocks a runtime that applies the stricter rule | `lib/properties.mjs` |
| Default freeze record `CoachingCore/r7/d/RUNTIME_FREEZE_R7D_4.json` | `r7d-harness.mjs` |

Validation 5: `validation/DEV_CASES_R7D_5.json` (from `build-dev-cases.mjs`: DEV-27 to DEV-31 added; DEV-01 to DEV-26 byte-identical to `DEV_CASES_R7D_4.json`; contaminated by construction) and `validation/HARNESS_VALIDATION_R7D_5.json`:
```
node validation/run-validation.mjs --dev validation/DEV_CASES_R7D_5.json --out <file> --candidate <worktree root> --f4 $D/rt-f4 --f3 $D/rt-f3 --b2 $D/rt-b2 --prer7a $D/rt-prer7a --d1 $D/rt-d1 --d2 $D/rt-d2 --d3 $D/rt-d3
```
`$D/rt-d3` is `git archive 9042ed0 CoachingCore` plus the R6 and B0 records (and the three R3/R4/R5 records for the whole suite), with `CoachingCore/node_modules` copied in. Rebuild every runtime into a new, empty directory; nothing needs deleting.

The new cases:
- DEV-27, DEV-28, DEV-29: a kept holiday, then one easy run, one 5-minute aborted run, or (after 30 days) one run, then a separate four-day trip;
- DEV-30: a whole week executed in full between the holiday and the trip (the no-false-block control for a real re-entry);
- DEV-31: the same week with its Friday strength session missed.

Results:
- no false block on the candidate;
- 14/14 sensitivity rows. The new row, SSCTR-P32-F01, is detected by P18 on DEV-27, DEV-28, DEV-29 and DEV-31 on R7D-FREEZE-3, and is clean on the candidate. DEV-30 passes on both runtimes;
- coverage: P18 24 units, P17 74, RESTATE 24, INSERT_NEWER_BREAK 10;
- 43/43 witnesses (W-P18c added: the candidate's DEV-27 return rewritten to the trip alone with the holiday `TRAINING_AFTER`).

**After the Phase 3.3 checks** (instrument text only; `lib/`, `r7d-harness.mjs` and the scripts unchanged; R7D-PREREG-5 addendum Δ7–Δ13):
- **Withdrawn claim (QE-R7D-P33-01, open, binding before any final holdout, author or seed):** "this check never blocks a runtime that applies the stricter rule" (above, and in the `lib/properties.mjs` comment) does not hold for sessions the runtime's weekly gates do not read. Those are optional WALK, RECOVERY_EASY and SHAKEOUT, and race-week RACE_TOUCH and RACE. For them the runtime's rule is not stricter: a re-entry week with optional walks not done is `TRAINING_AFTER` on the runtime, and P18(a) reports `OLDER_BREAK_DROPPED` (the check's probes QH-1 and QH-2).
- **Not reached by validation 5:** no development case has optional or race-week sessions in a re-entry week.
- **Resolution, before Phase 4:** the SSCTR judges which sessions a re-entry week needs, then Chief/Founder chooses an instrument revision (P18(a) restricted to the sessions that count, with a QH-1-style development case) or a runtime change in a new authorized mission.
