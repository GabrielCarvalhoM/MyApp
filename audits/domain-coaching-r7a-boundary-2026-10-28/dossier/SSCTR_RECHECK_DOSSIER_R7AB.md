# R7-A Final Boundary Closure — SSCTR regression re-check dossier (R7A-BOUNDARY-FINAL-FREEZE)

**For:** the Sports Science & Concurrent Training Reviewer (gate `R7A_FINAL_SCIENTIFIC_RECHECK`), the single regression re-check of the single freeze.
- This session exposes the native type `sports-science-concurrent-training-reviewer` (`.claude/agents/sports-science-concurrent-training-reviewer.md`). Load `governance/agents/sports-science-reviewer/CONSTITUTION.md` and `.agents/skills/sports-science-review/SKILL.md` as it directs.
- Your authority is PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for bounded nonclinical internal sporting decisions only.

**Binding:**
- R7A-BOUNDARY-FINAL-FREEZE, `CoachingCore/r7/boundary/RUNTIME_FREEZE_R7A_BOUNDARY.json` (file `3ebc9b02…`), source digest `36a71ca84fb87789d8623e2050ac9e308a963400af86a3ba73a373043bbf186c`.
- Policy R6-POLICY-5 `18ec48f3…` is **unchanged**: no policy text was edited and no sporting rule was added.
- The engineering judge re-checks the same bytes in parallel.

**Your previous re-check:** `audits/domain-coaching-r7a-final-2026-10-28/reviews/ssctr-r7af-recheck.{md,json}` (R7AF-SSCTR-r1, ACCEPT on R7A-FINAL-FREEZE `ec2debe7…`):
- D53 closed; D56–D59 hold;
- F-A to F-F approved;
- non-blocking NF-R7AF-1 (R38) and NF-R7AF-2 (R39).

**Mission:** [FOUNDER_REQUEST.md](../FOUNDER_REQUEST.md) (§21 is your remit), [TASK_CONTRACT.md](../TASK_CONTRACT.md), [WEEK_START_AUTHORITY_CONTRACT.md](../WEEK_START_AUTHORITY_CONTRACT.md). There is no correction cycle after this re-check.

## Your remit (Founder §21): regression only

Do not reopen the literature or the domain. Confirm that no week-start authority change broke **D53, D56, D57, D58, D59, the return entry, the recovery ceilings or the restoration semantics**. If the sporting outputs stay within the approved rules: ACCEPT.

## Bounds

- **Read-only runtime.** Write only under `audits/domain-coaching-r7a-boundary-2026-10-28/reviews/` (prefix `ssctr-r7ab-`):
  - your probes and outputs;
  - `ssctr-r7ab-recheck.md` and `.json`;
  - a queue proposal, only if you approve something prescriptive (a proposal only; the Chief integrates it append-only).
- **Never run:**
  - `npm run verify`, `simulate` or `demonstrations:r6`;
  - any `scripts/verify-r*.mjs` with `--write`;
  - any `regress-*`, `freeze-*`, `prepare-*` or `queue-*` script;
  - any evidence runner (`run-evidence-*.mjs`, your `ssctr-r7af-run.mjs`);
  - any build script that writes into an earlier audit folder.

  `node CoachingCore/scripts/verify-r7ab.mjs` without `--write` is read-only.
- **Your instruments:**
  - your R7-A.1, R7-A.2 and R7-A final instruments print only and load the live tree;
  - your R7-A final probes accept `SSCTR_CC` to point at a copy;
  - a byte-exact R7A-FINAL-FREEZE runtime is at `audits/domain-coaching-r7a-boundary-2026-10-28/final-freeze-source/CoachingCore`.
- Synthetic data and the DEV_TEST_ONLY authority only. No clinical semantics; unknown eligibility is ASK.

## What changed (R7A-FINAL-FREEZE → R7A-BOUNDARY-FINAL-FREEZE)

**The rule (Founder 0.1).** A week's start now records why it holds its state: the intake, a return's entry, the weekly review's rule on the complete week before, or a projection of the plan. When a return reads the state the athlete had executed at an interruption, it reuses a week start only when that start is evidence-anchored:
- a review set it, a return set it, or it is the intake;
- or it is a projection the week before executed exactly as it assumed: every session done, every review gate ADVANCE or EARNED, no lighter load, no later adaptation.

Otherwise it goes back to the last evidence-anchored start, and the executed sessions are read as facts, as your D59 reading already does. This now applies before any return too: R7-A.2 boundary 3 (the plan's start of an unreviewed week) is superseded.

**The correction rule (Founder §11).** A named correction that puts the interruption on or after training executed after its own return began is asked.

**Unchanged:** the return recipe (SHORT resumes; MODERATE and LONG start the return steps, the last executed count the ceiling, D49), `strengthAtBreak`, `startStrengthReturn`, `advanceStrength`, the composition rules and the easy slot. In `r6-program.mjs` only the record helpers and `generateProgram`'s authorities were added. Diff: `dossier/RUNTIME_DELTA_R7AB.diff`.

## Items with a sporting reach (please rule; contract §7)

| # | Behaviour now | On R7A-FINAL-FREEZE |
|---|---|---|
| S-A | After an unfinished, unreviewed re-entry week, a later break starts from the re-entry plus what was executed, whatever was decided meanwhile (QE-R7AF-01). The judge's P30c (16-day break, Tue run and Wed lift executed, then an equipment statement or a fatigue report, then a 2-day trip): week 6 runs EASY 15 / LONG 20; week 7 `back-squat 1x5@4 ESTABLISH RETURN_ENTRY`, LONG 45. A review on the complete week may still step the exercises executed in it; the run holds (Thursday's run was missed) | Week 6 runs 30 / 45; week 7 `back-squat 2x5@3 KNOWN 82.5` and LONG 60: one return step that was never executed |
| S-B | Completed sessions anchor a projected start only when the week executed exactly as it assumed, including loads. During a return, lighter effort-guided loads than the known load kept as the ceiling leave the start to a review (which adopts them), or to the re-entry plus facts | The week counted as "executed as planned" whenever every session had any report |
| S-C | A first break after an unconsolidated week goes back to the last historical start. On a never-logged program this is the intake: runs from the intake capacity, and an exercise never performed enters as the approved first exposure of an unknown load (D52), not as a return step of a load or count only the plan assumed. Examples follow this table | The plan's start of the break's week, with the progression of weeks that were never logged |
| S-D | Inside a return, a value a review held from a projected start (an exercise never executed since the return) is not history until a week is executed in full: B resumes it at step 0 | It resumed at the projected step 1 |
| S-E | A named correction contradicting its own executed re-entry is asked (QE-R7AF-02). The judge's P37 E1, E2 (A's name or report id on a later trip) and E7 (B's name reused) are asked | Applied: E1 and E2 restored the pre-break dose (`back-squat 3x5@3 KNOWN 82.5`, six rows) after a 16-day break |
| S-F | No unexecuted return step, load or whole count reaches a ceiling or a resumed dose through a stored start (D49, D53, D56) | Through the paths of S-A to S-D |

**S-C examples:**
- **`test/r6-adaptation.test.mjs`,** an 18-day break reported in week 5 of a never-logged program, entry week:
  - EASY 15 runs, LONG 15, return target long 60 (was 70);
  - `goblet-squat`, `db-bench-press`, `db-row` 2x8@3 FIRST_ESTABLISH by effort, and `standing-calf-raise` / `side-plank` 1x10@3 BODYWEIGHT (rotation applies, D51, as no exercise is in return steps).

  Before: every exercise `1x8@4 ESTABLISH RETURN_ENTRY`, as if it had been established. The same program with three executed and reviewed weeks still gets 1 set at RIR 4.
- **Your round-12 instrument,** `O_returnStrength` / `pauseInWeek3_14d`:
  - the squat carries the reported 80 kg, not the plan's 82.5 kg step;
  - accessories never performed enter at the base 5 repetitions, not the plan's progressed 7 or 10;
  - every entry row stays 1 set at RIR 4 or more;
  - log80 is now KEEP.

None of S-A to S-F adds or changes a dose rule. S-A to S-D change which state a return starts from, always to one the athlete executed or reported. S-E replaces a silent re-derivation with a question.

## Evidence on the frozen bytes

All of it was produced by `probes/run-evidence-r7ab.mjs` on R7A-BOUNDARY-FINAL-FREEZE (`probes/EVIDENCE_RUNS_R7AB.json`, 78 runs, every one on `36a71ca8…`) and compared with the same outputs on R7A-FINAL-FREEZE in `probes/COMPARE_R7AB.json`. Differences are named in `probes/COMPARE_R7AB_NAMED.json`.

| Instrument (yours unless noted) | Result |
|---|---|
| First-week grid D59, 306 cases | **Byte-identical**: NONE, FAMILIAR, KNOWN all E 0, O 0, B 0 |
| Restoration grid (4 shards), cap causes (4) and the extension (2), short-return grid, D58 readings, your R7-A.1 probe | **Byte-identical** |
| First-week extension (8 shards), same day, traces SD and ROT, rotation, ceiling equality | **Byte-identical** |
| Your R7-A.2 items | Identical except the new `stateAt.authority` field printed in SF (RETURN_ENTRY, WEEK_EVIDENCE); every dose and row identical |
| Your R7-A final probe (F-A to F-F) and same-day probe | **Byte-identical** |
| Round-12 instrument (byte copy in `probes/`) | 37 of 43 sections identical. `O_returnStrength` differs in `pauseInWeek3_14d` only (S-C, above). AJ, AM, AHb differ only in the instrument's folder name in an error trace. The two COMPARE sections follow O |
| R7-A.1 author probes (composition, both handler grids, D56 grid, three-step, D58 combinations) | **Byte-identical** |
| Engineering judges' P13, P14, P17–P21, P31 (four zones), P33–P36, P38, P09 (5,000 sequences, O1–O7 = 0) | **Byte-identical** |
| Engineering judge P30, P30b, P30c (QE-R7AF-01), P32 (the unreviewed L4 variant: the point is the intake, so a late log of week 0 is confirmed first), P37 (S-E) | Differ as named |
| Regression (R6 holdout 35, R5 24, profiles 16, simulations 14) | **Identical** to R7A-FINAL-FREEZE |
| Author self-challenge (9 classes) | 0 violations; 56 on R7A-FINAL-FREEZE |

## Your records and the queue

- Your thirteen R7AF-SSCTR-r1 records (`ssctr-r7af-recheck.json`, `records`) bind R7A-FINAL-FREEZE. Please do the delta check: does each still hold on R7A-BOUNDARY-FINAL-FREEZE (re-bind) or not?
- New prescriptive approvals, if any, go in a proposal file: `HQ-R7AB-…` ids, QUEUED_FOR_FUNDED_HUMAN_REVALIDATION, funding NOT_DECLARED. The queue holds 175 items (revision `SSCTR-HRQ-20261028-R7AF-r1`).

## What to return

`reviews/ssctr-r7ab-recheck.md` and `.json`, with at least:

```json
{
  "revision": "R7AB-SSCTR-r1",
  "reviewer": "sports-science-concurrent-training-reviewer (native)",
  "gate": "R7A_FINAL_SCIENTIFIC_RECHECK",
  "freezeReviewed": {"revision": "R7A-BOUNDARY-FINAL-FREEZE", "file": "CoachingCore/r7/boundary/RUNTIME_FREEZE_R7A_BOUNDARY.json", "sourceDigest": "<recomputed>", "policyHash": "<recomputed>"},
  "verdict": "ACCEPT | NOT_READY",
  "reason": "...",
  "items": [{"id": "D53", "status": "CLOSED | OPEN", "basis": "..."}, {"id": "D56"}, {"id": "D57"}, {"id": "D58"}, {"id": "D59"}],
  "regressions": {"returnEntry": "...", "recoveryCeilings": "...", "restoration": "...", "shortReturn": "..."},
  "rulings": [{"id": "S-A", "ruling": "..."}],
  "earlierRecords": [{"id": "...", "bindsR7ABoundaryFreeze": true, "basis": "..."}],
  "newFindings": [],
  "queueItemsFile": "<path, if any>"
}
```

Mark a finding blocking only if it is material in your scope. A NOT_READY verdict closes R7-A as NOT_READY and returns to the Founder; there is no further correction. State what you ran, and recompute the digest at your start and end.
