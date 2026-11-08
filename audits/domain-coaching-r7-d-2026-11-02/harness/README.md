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

## R7D-HARNESS-6 (R7-D Phase 3.4: SSCTR-P33-F01 under direction A, QE-R7D-P33-01, R-F08-1)

R7D-HARNESS-5 is commit `3edf3c5`. R7D-HARNESS-6 is pre-registered as `R7D-PREREG-6` (`../PREREGISTRATION_R7D_6.md`). It reads the SSCTR decision `SSCTR-R7D-P34-DECISION-r1` and the PCG record `PCG-R7D-F08-r1` (`../phase34/policy/`).

| Change | Where |
|---|---|
| **P18(a), re-entry week contract (QE-R7D-P33-01).** Only the sessions the contract counts decide a week: EASY, LONG, QUALITY and WALK_JOG runs, the race touch and the race, and every strength session. Optional walks, recovery runs, shakeouts and strides never do. A session on the stop's first day counts as between when the stop states `startedAt` and it was done before it. The Phase 3.3 withdrawn claim holds again: P18(a) is a necessary condition of the runtime's rule (DEV-32/DEV-33, the QH-1/QH-2 forms, pass) | `lib/properties.mjs` (`counted`, `executedWeekBetween`) |
| **P18(a), own return.** A break listed `OWN_RETURN` is accounted for by a whole week executed in one sport between it and the stop, with the own return its record states. A break listed `WITHIN_OWN_RETURN` is accounted for by that own return's stop or by its own placement there | `lib/properties.mjs` (`sportWeekBetween`) |
| **P18(c) (new), the inverse direction.** A break listed with a continuity reading (`TRAINING_NOT_REESTABLISHED`, `NO_TRAINING_BETWEEN`) has no whole week between it and the next break that a client reads as executed as prescribed in one sport. Otherwise `SPORT_WEEK_READ_AS_STOP`. The reading is sufficient, so it never flags a week the runtime rightly read as incomplete: completed, no partial, conflicted or confounded report, every response nominal, minutes at least prescribed; strength sets, reps and reps in reserve at least prescribed, with the prescribed load (a bodyweight row logged as bodyweight) | `lib/properties.mjs` (`nominalSportWeekBetween`) |
| **P18(d) (new), correction.** A newer report of the latest break (`SAME_BREAK`) after a return that read separate breaks lists each earlier break again, or covers it. Otherwise `EARLIER_BREAK_DROPPED_BY_CORRECTION` | `lib/properties.mjs` |
| **P02, R-F08-1 (new).** After a break with a clinical category, no later decision applies a return of that episode, a report naming it is routed to a human, and no decision leaves the clinical route with a prescription, also after a clearance (`CLINICAL_EPISODE_RETURNED`, `_RESTATED_NOT_ROUTED`, `_LEFT_WITHOUT_CLEARANCE`). Steps with unknown eligibility stay P02's ASK | `lib/properties.mjs` |
| **P06(b) (new), the ceiling after a return that re-plans its own week (SSCTR-P34-F01).** The week after it never exceeds the longest run completed in the window, or the own week's runs from the return, plus the step. Otherwise `CEILING_AFTER_OWN_WEEK_RETURN` | `lib/properties.mjs` |
| **P08, stated start time.** A run on the break's first day done before its stated `startedAt` counts as executed before the break (BR-Q5). A run with no time on that day stays outside. The DEV-44 control found this gap; it was pre-existing and reached by no earlier case | `lib/properties.mjs` |
| Default freeze record `CoachingCore/r7/d/RUNTIME_FREEZE_R7D_5.json` | `r7d-harness.mjs` |

Validation 6: `validation/DEV_CASES_R7D_6.json` and `validation/HARNESS_VALIDATION_R7D_6.json`. The dev cases come from `build-dev-cases.mjs` and are contaminated by construction. DEV-32 to DEV-45 are added. DEV-31 changed in its assessment text only, and DEV-01 to DEV-30 are byte-identical to `DEV_CASES_R7D_5.json`.
```
node validation/run-validation.mjs --dev validation/DEV_CASES_R7D_6.json --out <file> --candidate <worktree root> --f4 $D/rt-f4 --f3 $D/rt-f3 --b2 $D/rt-b2 --prer7a $D/rt-prer7a --d1 $D/rt-d1 --d2 $D/rt-d2 --d3 $D/rt-d3 --d4 $D/rt-d4
```
`$D/rt-d4` is `git archive 3edf3c5 CoachingCore` (R7D-FREEZE-4's runtime) plus the R6 and B0 records, and the three R3/R4/R5 records for the whole suite, with `CoachingCore/node_modules` copied in. The other runtimes are as above. Rebuild every runtime into a new, empty, uniquely named directory; nothing needs deleting.

The new cases:
- DEV-32, DEV-33: optional walks unreported or not done in a re-entry week (QH-1, QH-2);
- DEV-34: the Founder's case (two weeks with every run done, the Friday strength missed each week);
- DEV-35: strength complete, an easy run missed each week;
- DEV-36: both sports partial (the disclosed X2 residual);
- DEV-37, DEV-38: a named correction of the trip after a continuity return and after an own return;
- DEV-39, DEV-40: a clinical-cause break restated as a holiday by name, after a clearance and while eligibility is asked;
- DEV-41: a return reported mid-week after elapsed runs not done;
- the false-block controls of SSCTR CF-P34-05:
  - DEV-42: a race week with its race touch missed;
  - DEV-43: strength logged without reps in reserve;
  - DEV-44, DEV-45 (S1, S2): a stated start on the Sunday, after or before the long run.

Results:
- no false block on the candidate (47 cases);
- 19/19 sensitivity rows. The new rows are all on R7D-FREEZE-4, each clean on the candidate:
  - SSCTR-P33-F01 by P18(c) (DEV-31, DEV-34, DEV-35, DEV-43);
  - the correction path, by P18(d) (DEV-37, DEV-38);
  - PCG-R7D-F08-F01 by P02 (DEV-39, DEV-40);
  - SSCTR-P34-F01 by P06(b) (DEV-41);
  - the race keys (SSCTR-P34-F05) by P18(a) (DEV-42).
  The SSCTR-P32-F01 row stays detected on R7D-FREEZE-3;
- coverage: CARRIER_CLINICAL 7, CARRIER_HOLD 1, RESEND 44, RESTATE 51 and INSERT_NEWER_BREAK 21 units; P17 147; P18 65;
- 50/50 witnesses. Added: W-P18d (correction), W-P18e (an own return with no complete week), W-P18f and W-P18g (each continuity label after run-complete weeks), W-P06b, W-P02e and W-P08c (a run after the stated start still binds).

**Residuals (instrument):**
- P18(c) is a sufficient reading, so it can miss an inverse defect on weeks it cannot read as nominal: unknown responses, a partial report, or a load the row does not state.
- The differential's triggers are necessary conditions. `../phase34/probes/phase34-decomposition.mjs` separates the two source changes through a hybrid runtime instead: 6 cases change by the ceiling fix alone and 11 by the adaptation change alone, with none changed by both.

**After the two reviews of `1978cc4` (R7D-HARNESS-6 r2, in the one bounded cycle; PREREG-6 addendum Δ15–Δ17):**
- **P18(a)** counts an executed report only under the existing completion rule, never partial (SSCTR CFR-05). It stays a necessary condition. DEV-46 (a run-only race week with its race touch done at half its minutes) is detected on R7D-FREEZE-4; witness W-P18h.
- **P18(a), two-level chains** (QRE-P34-02): a break listed `WITHIN_OWN_RETURN` with `stopInOwnReturn` = `WITHIN_OWN_RETURN` is NOT_EVALUABLE when the record lists the inner own return after it in the same chain; without one, it accounts for nothing. The record gives neither that inner own return's days nor the break's place in its stop (QRE-P34-03). DEV-47 (the QRE's QH1 chain) shows no false block, and R7D-FREEZE-4 is detected there by P18(c); witness W-P18i.
- **P02** opens no clinical episode from a review refused unread (QRE-P34-08), as P17 and P18 read it.
- **Validation 6** was re-run on the corrected runtime with 49 development cases.

## R7D-HARNESS-7 (Phase 3.5; R7D-PREREG-6 Δ26–Δ31)

- **P18(e)** (SSCTR-P34R2-F01): no sport re-enters, by `TRAINING_AFTER` or by a re-entered sport of an `OWN_RETURN`, through a week whose complete reports carry an adverse recovery in both sports or in three or more sessions, observed before the stop (`SYSTEMIC_WEEK_REENTERED`). The reading sits inside the runtime's systemic rule, so it is a necessary condition.
- **P18(f)** (SSCTR-P34R2-F02, R7-C G01): a break placed by the training after it (`OWN_RETURN`, `TRAINING_NOT_REESTABLISHED`, `NO_TRAINING_BETWEEN`) has no planned session without a report between it and the next break (`UNREPORTED_BETWEEN_BREAKS_APPLIED`). It is checked on every return applied with separate breaks, including corrections and confirmations. Another episode's recorded stop is a known stop; the superseded report of the same episode is not.
- **P18(c)** is a sufficient reading again. It never reads as executed as prescribed a week that the systemic rule may hold: one with UNDER, ADVERSE, HARDER or IMPAIRED in two sports or three sessions, or a recorded SYSTEMIC_SIGNAL. DEV-48 found the gap: an adverse optional shakeout was not counted.
- **NESTED guard:** "after it" is read by first days, so the overlapping two-level chain (QH4, DEV-50) is NOT_EVALUABLE rather than a false block.
- **Not evaluable never reads as a pass:** the run summary lists each property's not-evaluable units by case (`notEvaluableCases`), whatever the case result. `SUMMARY.md` lists them under "Units not evaluable". Each one goes to the domain judge, who for a nested own return recomputes the inner own return from the case timeline (Δ30).
- **Validation 7** (`validation/HARNESS_VALIDATION_R7D_7.json`, `DEV_CASES_R7D_7.json` with DEV-48 to DEV-52, 54 cases):
  - no false block on the candidate;
  - 22/22 sensitivity rows, including DEV-48 (P18(e)) and DEV-49 (P18(f)) on `46934a0`;
  - 55/55 witnesses (W-P18j, W-P18k and W-P17e added);
  - P17 has 202 units and P18 has 142.

To reproduce it from this worktree's root, add `rt-c46` (`git archive 46934a0 CoachingCore` plus the five review records, with `CoachingCore/node_modules` copied in) to the runtimes listed above. Rebuild every runtime into a new, uniquely named directory; nothing needs deleting.

```
node validation/build-dev-cases.mjs validation/DEV_CASES_R7D_7.json
node validation/run-validation.mjs --dev validation/DEV_CASES_R7D_7.json --out <file> --candidate <worktree root> --f4 $D/rt-f4 --f3 $D/rt-f3 --b2 $D/rt-b2 --prer7a $D/rt-prer7a --d1 $D/rt-d1 --d2 $D/rt-d2 --d3 $D/rt-d3 --d4 $D/rt-d4 --c46 $D/rt-c46
```
- **P17 and P08 read a restatement** (R7D-INTERFACE-7 §2; Δ32). A review whose break names an earlier break the latest applied return listed, stating its facts again apart from its name and start time, is that break's report. It opens no P17 window of its own, and P08 measures no return from it. A report that changes another fact still opens its own window (witness W-P17e). DEV-51 and DEV-52 (the R07 shape) are the false-block controls.

## R7D-HARNESS-7 r2 (the Phase 3.5 bounded cycle; R7D-PREREG-6 Δ35, Δ37)

Three harness-only fixes, as the first Phase 3.5 checks stated them:
- **P18(e)** (SSCTR-P35-F01 = QRE-P35-02): a report counts only when the reducer reads it ADVERSE given recovery ADVERSE. It must be complete and not partial, with performance other than OVER, or confounded (`kindOf`, `classify`). With performance OVER, recovery ADVERSE is CONFLICTING, and the systemic rule does not count it. P18(e) therefore counts a subset of what the systemic rule counts, which makes it a necessary condition. DEV-54 (the SYc1 shape) is its false-block control.
- **P17** (QRE-P35-03): a restatement ends only the window of an earlier report of the same break. The window of another break runs on past it: witness W-P17f, controls DEV-56 and DEV-57.
- **P18** (QRE-P35-04): a restatement of a listed break is not one of its open breaks (DEV-55).
- **Validation 7 r2:**
  - 59 cases, with DEV-53 to DEV-57 added;
  - no false block;
  - 23/23 sensitivity rows; the new row is DEV-53 (QRE-P35-01), detected by P18(d) on `8e78b8a` and clean on the candidate;
  - 56/56 witnesses;
  - P17 has 245 units and P18 has 170.

To reproduce it, also add `rt-c8e`, built the same way as `rt-c46` but from `git archive 8e78b8a`:

```
node validation/build-dev-cases.mjs validation/DEV_CASES_R7D_7.json
node validation/run-validation.mjs --dev validation/DEV_CASES_R7D_7.json --out <file> --candidate <worktree root> --f4 $D/rt-f4 --f3 $D/rt-f3 --b2 $D/rt-b2 --prer7a $D/rt-prer7a --d1 $D/rt-d1 --d2 $D/rt-d2 --d3 $D/rt-d3 --d4 $D/rt-d4 --c46 $D/rt-c46 --c8e $D/rt-c8e
```

## R7D-HARNESS-8 (Phase 4) and R7D-HARNESS-9 (Phase 5; R7D-PREREG-8 Δ48–Δ50)

R7D-HARNESS-8 is `r7d-harness-8.mjs` with `lib/properties-8.mjs` (R7D-PREREG-7 Δ38–Δ39), the harness of the Phase 4 holdout; it stays as that record.

R7D-HARNESS-9 adds new files only and is the harness of the Phase 5 holdout. Under the Founder's K03 decision it corrects, prospectively, the three gaps the Phase 4 quality judgment proved; the Phase 4 results are unchanged:

| Gap | Change | File |
|---|---|---|
| QRE-P4-H01 | P06 reads no intake longest run of 0 minutes as a run reference | `lib/properties-9.mjs` |
| QRE-P4-H02 | P03(d), and P06's check of the decision's own week (the same predicate), never read a session of the decision's own day that its record already reports as a dose ahead; when it is the week's only run left, the unit is NOT_EVALUABLE | `lib/properties-9.mjs` |
| QRE-P4-H03 | CARRIER_CLINICAL and CARRIER_HOLD compare at a probe one minute after the answer, in both runs, then at the author's later steps | `lib/metamorphic-9.mjs` |
| Authoring (R7D-INTERFACE-8 §2) | A substitution's `exerciseRef:{week, pattern}` with no day names the first session of that week that holds the pattern | `lib/client-9.mjs` |

`r7d-harness-9.mjs` reads those three modules and defaults to the R7D-FREEZE-6 record; `seal-final-2.mjs` (R7D-SEAL-FINAL-2) seals the Phase 5 holdout in `final2/`.

Validation 9: `validation/DEV_CASES_R7D_9.json` (from `validation/build-dev-cases-9.mjs`: DEV-63 to DEV-72 added) and `validation/HARNESS_VALIDATION_R7D_9.json` (from `validation/run-validation-9.mjs`). It shows the gaps removed (`instrumentFix9`), the new sensitivity row (QRE-P4-F01 on R7D-FREEZE-5, DEV-67), the reachability of the coverage the Phase 4 holdout lost (CARRIER_HOLD, the substitution by pattern, a race week of only touch, shakeout and race, optional walks in a re-entry week) and the witnesses. W-CARRIER is retired: the probe now carries the clearance, so its trigger no longer occurs; W-CARRIER9 and W-CARRIER9b replace it.

To reproduce it, rebuild every runtime of the validation 8 command into a new, uniquely named directory (`git archive` of each commit with the R6, B0, R3, R4 and R5 records, `CoachingCore/node_modules` copied in; the four mutants from R7D-FREEZE-5 with the exact edits of `phase35/reviews/engineering/probes/qre2-p35-mutants.mjs` and `probes2/qre3-p35-mutants.mjs`), add `rt-f5` (`git archive cc0b56f`, the R7D-FREEZE-5 bytes), and run:

```
node validation/build-dev-cases-9.mjs validation/DEV_CASES_R7D_8.json <new DEV file>
node validation/run-validation-9.mjs --dev validation/DEV_CASES_R7D_9.json --out <file> --candidate <worktree root> --f4 $D/rt-f4 --f3 $D/rt-f3 --b2 $D/rt-b2 --prer7a $D/rt-prer7a --d1 $D/rt-d1 --d2 $D/rt-d2 --d3 $D/rt-d3 --d4 $D/rt-d4 --c46 $D/rt-c46 --c8e $D/rt-c8e --qhdrop $D/rt-qhdrop --qf3 $D/rt-qf3 --qf6 $D/rt-qf6 --qf7 $D/rt-qf7 --f5 $D/rt-f5
```
