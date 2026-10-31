# R7-B engineering recheck (the one narrow recheck), R7B-ENG-r2-RECHECK

| | |
|---|---|
| Freeze | R7B-RUNTIME-REPERTOIRE-FREEZE-2, record `CoachingCore/r7/b/RUNTIME_FREEZE_R7B_2.json`, commit `10b26d6` (bytes of `d03025b`) |
| Source / manifest | `d2c730140973c9037de8729387012f830204072053729fbf9bdebf1bc5fe7241` / `d509452e4ad2aa98bce2889bd723c0faa22d2394aa5630d9f5a56588c9e6c23a` |
| Identity | `node scripts/verify-r7b.mjs --freeze 2`: 19/19 PASS before; with `--tests`: 20/20 PASS after; no tracked file changed |
| Scope | QE-R7B-01…12 of R7B-ENG-r1 (committed at `0fb1339`, unchanged) and the delta `git diff 4995d58 d03025b -- CoachingCore/src CoachingCore/test` |
| Record | [ENGINEERING_RECHECK_R7B.json](ENGINEERING_RECHECK_R7B.json) |

## Verdict

**NOT_READY.**

- **Most findings are fixed.** Ten of the twelve findings are resolved, and so are the substitution case that blocked at FREEZE-1 and the ladder/rotation, graduation, density-from-evidence and conflicting-choice findings.
- **Two findings are not resolved.**
  - QE-R7B-01 (BLOCKER), the substitution case, still fails on paths beyond the one I reproduced at FREEZE-1. The main cause is that stored programs do not keep the novice (capped) templates. As a result, a capped novice's substitution is undone at the next weekly review, and the exercise reported as not doable with steady technique comes back.
  - QE-R7B-05 (MAJOR): the same cause undoes the density-cap fix at the next weekly review.
- **The delta adds one MAJOR regression.** It drops the R7-A A5 factual re-plan on the new block-choice question path.
- **The new replay fallback leaves one more MAJOR.** After a skill mismatch, the next rung returns once the substitute stops fitting.

The Founder loop bound allows no further cycle, so R7-B closes NOT_READY with the blockers below.

## Status of the FREEZE-1 findings

| Id | Status | Evidence (re-run copies in `recheck/probes/`) |
|---|---|---|
| QE-R7B-01 (BLOCKER) | **NOT_RESOLVED** | The direct path is fixed: `a10-repro` passes, and the FREEZE-1 grid drops from 19 to 2 inconsistent cases out of 46. Three paths still fail: QE-R7B-R2-01, -03 and -04. |
| QE-R7B-02 | RESOLVED | `a4-rotation` A12: the step holds from its own week, and the replaced rung never returns. |
| QE-R7B-03 | RESOLVED | A3 and A3b: correction, substitution and equipment change are all capped, and planner and history agree. The schedule change plans week 6, capped. The regression on the new path is QE-R7B-R2-02. |
| QE-R7B-04 | RESOLVED | A1 and A1b: the graduation is withdrawn, with no quality in weeks 4–6. N4: no false withdrawal. |
| QE-R7B-05 | **NOT_RESOLVED** | The fix holds only in the change's own proposal. After the next weekly reviews, weeks 2–4 get the full split while the state reads `{capped:true}` (N7a, via QE-R7B-R2-01; see also QE-R7B-R2-05). |
| QE-R7B-06 | RESOLVED | A8 and A8b: a second change of the same exercise is asked in either order, and no unexecuted ladder step is recorded as reached. |
| QE-R7B-07 | RESOLVED | A7. |
| QE-R7B-08 | RESOLVED | A9 and C6. QE-R7B-R2-OBS-01 remains as an observation. |
| QE-R7B-09 | RESOLVED | B4: the review-by date is read on the UTC clock. |
| QE-R7B-10 | RESOLVED | C1c: a rejecting record disables its candidate (temp copy). |
| QE-R7B-11 | RESOLVED | C2. |
| QE-R7B-12 | RESOLVED (as stated) | Matrix R7B-CONFORMANCE-2 passes. The entries for B0-C06#c8, B0-C07#c1 and B0-C08#c1 are still contradicted on the R2-01 and R2-03 paths. |

## New findings

| Id | Severity | Origin | Finding |
|---|---|---|---|
| QE-R7B-R2-01 | BLOCKER | Pre-existing (identical on FREEZE-1; my r1 reproductions did not cover it) | Rebuilt novice templates are never stored. `rebuild` (`src/r6-adaptation.mjs:653`), `finishProposal` (`:265-269`) and the equipment change (`:746,:750`) all omit `noviceTemplates`, so later decisions compose capped weeks from the intake's templates. Three effects follow: <br>• A SKILL_MISMATCH substitution of goblet-squat is reverted to goblet-squat MAIN in weeks 3 and 4 after the next weekly review (N7d; N7b for a preference). <br>• A cap started by a schedule change is lost (N7a). <br>• A switch to kettlebell only makes the next weekly review UNSUPPORTED with `equipmentUnavailable` (N7c). |
| QE-R7B-R2-02 | MAJOR | Introduced (FREEZE-1 still proposed the re-plan) | The block-choice ASK (`:357`, `:359`) carries no factual re-plan. The correction is recorded but nothing ahead is re-planned, and later reviews of that week do not recover it. Week 5 ahead stays `LOWER_B,UPPER,UPPER_B` (released) while history reads `{capped:true}`; the control without the choice is capped (N1). A graduation withdrawal on this path is also deferred to the next review (N1b). |
| QE-R7B-R2-03 | MAJOR | Residual of -01 in the new replay | `db-rdl` is set aside for SKILL_MISMATCH and replaced by `kb-deadlift`. Once the kettlebell goes (permanently, or in a one-week window), the fallback (`src/r7b-repertoire.mjs:293`) prescribes `single-leg-rdl-db`, the next rung above `db-rdl`, in weeks 4–6 (N3). |
| QE-R7B-R2-04 | MINOR | Residual of -01 | The guard checks the whole plan (`:553`). In 8 of 138 substitutions the selection was already used in the same session, so the replaced slot got another exercise; one case jumped two rungs, from `incline-push-up` to `pike-push-up` (N5). |
| QE-R7B-R2-05 | MINOR | Introduced with the lazy cap start | When week 1 is skipped, a decision in week 2 plans that week uncapped (`strengthAtBreak` never starts the cap) (N2). |
| QE-R7B-R2-OBS-01 | OBSERVATION | Residual of -08 | A DECLINE sent at a complete review that is not at a block boundary is accepted silently (N6). |

Carried forward, not counted: QE-R7B-OBS-04 still reproduces (A13: `kb-goblet-squat` is new in TAPER and RACE_WEEK) and is with the SSCTR recheck. OBS-01…03 are routed to the next runtime mission.

## Reproduce

Run these from `audits/domain-coaching-r7-b-2026-10-31/reviews/engineering/recheck/probes/`:

- **FREEZE-2 findings:** `node n7-novice-templates.mjs` (N7a–c), `node n8-labels.mjs` (N1, N7d), `node n-delta.mjs` (N1, N1b, N2–N6).
- **FREEZE-1 labels:** `node at-commit.mjs 4995d58 n7-novice-templates.mjs FREEZE-1` and `node at-commit.mjs 4995d58 n8-labels.mjs FREEZE-1`. These run on a `git archive` copy in the OS temp directory, which is removed afterwards.
- **r1 reproductions:** the copied r1 probes keep their names.

Outputs go to `recheck/probes/out/`. Expected and actual values per finding are in the JSON record.

## What holds

- **R7-A invariants:** HOLD, D52/E1 and no load transfer hold on the new paths.
- **Determinism:** repeat runs, input order and observation order are deterministic.
- **Catalog and records:** catalog and record mutations fail closed, and the per-record veto works.
- **Catalog membership:** plans conform to the catalog in one-day and minimal-equipment programs.
- **Impossible inputs:** they are asked or routed.
- **Kilograms:** none reach bands or assistance.
- **Quality gates:** quality closes when its gates close.
- **Familiar bouts:** lapse and withdrawal persist.
- **Graduation withdrawal:** there are no false positives.

R7B_ENGINEERING_GATE = NOT_READY
