# R7-A Final Closure — SSCTR regression re-check dossier (R7A-FINAL-FREEZE)

**For:** the Sports Science & Concurrent Training Reviewer (gate `R7A_FINAL_SCIENTIFIC_RECHECK`), the single regression re-check of the single freeze.
- This session exposes the native type `sports-science-concurrent-training-reviewer` (`.claude/agents/sports-science-concurrent-training-reviewer.md`); load `governance/agents/sports-science-reviewer/CONSTITUTION.md` and `.agents/skills/sports-science-review/SKILL.md` as it directs.
- Your authority is PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for bounded nonclinical internal sporting decisions only.

**Binding:** R7A-FINAL-FREEZE, `CoachingCore/r7/final/RUNTIME_FREEZE_R7A_FINAL.json`, source digest `ec2debe730df8931d1525f2b1a729ce3d808c08842fb75397d2fc91084294605`. Policy R6-POLICY-5 `18ec48f3…` is **unchanged**: no policy text was edited and no sporting rule was added. The engineering judge re-checks the same bytes in parallel.

**Your previous re-check:** `audits/domain-coaching-r7a2-2026-10-28/reviews/ssctr-r7a2-recheck.{md,json}` (R7A2-SSCTR-r1, ACCEPT on R7A2-FREEZE-1): D59 closed; D56, D57, D58 hold; S-A to S-H approved; non-blocking NF-1, R35, R36, NF-4, NF-5, R37.

**Mission:** [FOUNDER_REQUEST.md](../FOUNDER_REQUEST.md) (the Founder's §0 decisions; §19 is your remit), [TASK_CONTRACT.md](../TASK_CONTRACT.md), [INTERRUPTION_EPISODE_CONTRACT.md](../INTERRUPTION_EPISODE_CONTRACT.md). There is no correction cycle after this re-check.

## Your remit (Founder §19): regression only

Do not reopen the science. Check that the identity and state change did not break **D53, D56, D57, D58, D59, the return entry, the recovery ceiling, restoration, or the short-return semantics**. If the approved sporting outputs stay within the rules, accept the regression.

## Bounds

- **Read-only runtime.** Write only under `audits/domain-coaching-r7a-final-2026-10-28/reviews/` (prefix `ssctr-r7af-`): your probes and outputs, `ssctr-r7af-recheck.md` and `.json`, and a queue proposal only if you approve something prescriptive (proposal only; the Chief integrates it append-only).
- **Never run** `npm run verify`, `simulate` or `demonstrations:r6`; any `scripts/verify-r*.mjs` with `--write`; any `regress-*`, `freeze-*`, `prepare-*` or `queue-*` script; any evidence runner (`run-evidence-*.mjs`, your `ssctr-r7a2-run.mjs`); your `ssctr-r7a2-build.mjs` (it writes into the R7-A.2 folder). `node CoachingCore/scripts/verify-r7af.mjs` without `--write` is read-only.
- Your R7-A.1 and R7-A.2 instruments in `audits/domain-coaching-r7a1-2026-10-27/reviews/` and `audits/domain-coaching-r7a2-2026-10-28/reviews/` print only and load the live tree. A byte-exact R7A2-FREEZE-1 runtime is at `audits/domain-coaching-r7a-final-2026-10-28/freeze1-source/CoachingCore`.
- Synthetic data and the DEV_TEST_ONLY authority only. No clinical semantics; unknown eligibility is ASK.

## What changed (R7A2-FREEZE-1 → R7A-FINAL-FREEZE)

- **Changed:** `src/r6-adaptation.mjs` only (and three test files). Diff: `dossier/RUNTIME_DELTA_R7AF.diff`. `r6-program.mjs` (`strengthAtBreak`, `startStrengthReturn`) and `r6-composition.mjs` (the easy slot) are byte-identical to the freeze you accepted.
- **Identity** (Founder 0.2–0.4): a correction names its interruption (`interruption.episodeId`) and keeps its identity; the same days again are a duplicate of it; a break after a re-entry (or after training) is new; anything else is asked. Dates alone never merge two reports.
- **The state at the break** (0.5–0.8): the start set by the report in force when the break began (a later report of an earlier break no longer reaches back); after an earlier break's return, a re-entry week that was neither reviewed nor finished is not a point (its assumed steps are not counted); a first-day session is asked when its order changes the plan; training logged after a return is confirmed before anything else is planned.
- **The return recipe is unchanged**: SHORT resumes the state; MODERATE and LONG start the return steps (`startStrengthReturn`), the last executed count the ceiling (D49), the block in progress earning no set.

## Items with a sporting reach (please rule; contract §8)

| # | Behaviour now | On R7A2-FREEZE-1 |
|---|---|---|
| F-A | A separate break after a re-entry starts from that re-entry, whatever reports came later | QE-R7A2-01: a report of the first break made after the second began made the second start from before the first: six rows at the pre-break dose (`back-squat 3x5@3 KNOWN 82.5`) and a 70-minute long run after a 16-day break, three re-entry days and a 4-day trip |
| F-B | After an unreviewed, unfinished re-entry week, a break beginning the next Monday starts from the re-entry plus what was executed; a reviewed week's decided start is used as before (your S-F) | The next week's planned start (return step assumed) was resumed: long 45/60 against 20/45 for the same break on the Thursday before |
| F-C | A first-day strength session without a stated start time is asked when its order changes a fact the return starts from (in use, ceiling, unlogged load); a last-performed-date difference alone is not asked (the earlier date is kept, the conservative reading); with a start time it is ordered (your NF-1) | Read as after the break, silently |
| F-D | A pre-break session logged after the return is confirmed first: every review in the return's re-entry week asks until the break is reported again; the newer report reads it (your R37) | Recorded, but the return was never re-read unless the athlete re-reported |
| F-E | A break first reported after a later break began is that later break's point (its return's start) | The later break was merged into it (QE-R7A2-03) |
| F-F | A date-shifted correction without the break's name is asked; a named one re-derives exactly as before | Any overlapping report was the same break |

None of F-A to F-F adds or changes a dose rule; F-A, F-B and F-E change which state a return starts from on the paths named; F-C, F-D and F-F replace a silent reading with a question.

## Evidence on the frozen bytes

All produced by `probes/run-evidence-r7af.mjs` on R7A-FINAL-FREEZE (`probes/EVIDENCE_RUNS_R7AF.json` binds each output to the source digest before and after its run) and compared with your outputs on R7A2-FREEZE-1 in `probes/COMPARE_R7AF.json`:

| Instrument (yours unless noted) | Result on R7A-FINAL-FREEZE |
|---|---|
| First-week grid D59 (`runs/ssctr-firstweek.out.json`), 306 cases | **Byte-identical** to your R7A2-FREEZE-1 output: NONE E 0, O 0, B 0; FAMILIAR E 0, O 0, B 0; KNOWN E 0, O 0, B 0 |
| Restoration grid, 864 timelines (4 shards) | **Byte-identical** |
| Cap causes (864) and the NONE/NOVICE extension (360) | **Byte-identical** |
| Short-return grid (315) and D58 readings | **Byte-identical** |
| First-week extension (8 shards), rotation, ceiling equality, traces SD and ROT | **Byte-identical** |
| Round-12 instrument (byte copy in `probes/`) | All 43 sections equal (stdout equal up to the folder name) |
| Your probe S1-S10 | Identical except **S5**: the unnamed 16 -> 5-day correction is asked (F-F); the 16-day re-entry stands (entry 1x@RIR4, long 20) instead of the 5-day resume |
| Your items | Identical except **SE.sameBreakCorrection**: the unnamed one-day-earlier correction of the first short break is asked (F-F); one break, one slot |
| Your same-day probe (NF-1, 72 cases) | **All 72 ask for the start time** (F-C); the 9 without an exercise only on the first day are skipped as before |
| R7-A.1 author probes | D56 grid, three-step and D58 combinations byte-identical; composition probe E14 asks (its break’s first day holds an executed establishment session, F-C); the Monday and evening handler grids differ only by unnamed overlapping MODERATE/SHORT reports (asked, F-F) and the two evening pairs R7-A.2 already named |
| Engineering judge probes P17, P19, P20, P21 | QE-R7A2-01 path closed: in every case B is new and starts from A’s re-entry; 0 rows at the pre-break dose; 0 long runs above 45 in P19’s 48 cells; P20 B keeps its own slot (F-A, F-B, F-E) |
| Regression (R6 holdout 35, R5 24, profiles 16, simulations 14) | **Identical** to R7A2-FREEZE-1 |
| Author self-challenge (43 cases, 16 classes) | 0 violations; 51 on R7A2-FREEZE-1 |

## Your records and the queue

- Your thirteen R7A2-SSCTR-r1 records bind R7A2-FREEZE-1. Please do the delta check: does each still hold on R7A-FINAL-FREEZE (re-bind) or not?
- New prescriptive approvals (if any) go in a proposal file (`HQ-R7AF-…` ids, QUEUED_FOR_FUNDED_HUMAN_REVALIDATION, funding NOT_DECLARED). The queue now holds 163 items.

## What to return

`reviews/ssctr-r7af-recheck.md` and `.json`, with at least:

```json
{
  "revision": "R7AF-SSCTR-r1",
  "reviewer": "sports-science-concurrent-training-reviewer (native)",
  "gate": "R7A_FINAL_SCIENTIFIC_RECHECK",
  "freezeReviewed": {"revision": "R7A-FINAL-FREEZE", "file": "CoachingCore/r7/final/RUNTIME_FREEZE_R7A_FINAL.json", "sourceDigest": "<recomputed>", "policyHash": "<recomputed>"},
  "verdict": "ACCEPT | NOT_READY",
  "reason": "...",
  "items": [{"id": "D53", "status": "CLOSED | OPEN", "basis": "..."}, {"id": "D59", "status": "..."}],
  "regressions": {"D56": "...", "D57": "...", "D58": "...", "returnEntry": "...", "recoveryCeiling": "...", "restoration": "...", "shortReturn": "..."},
  "rulings": [{"id": "F-A", "ruling": "..."}],
  "earlierRecords": [{"id": "...", "bindsR7AFinalFreeze": true, "basis": "..."}],
  "newFindings": [],
  "queueItemsFile": "<path, if any>"
}
```

Mark a finding blocking only if it is material in your scope. A NOT_READY verdict closes R7-A as NOT_READY and returns to the Founder; there is no further correction. State what you ran, and recompute the digest at your start and end.
