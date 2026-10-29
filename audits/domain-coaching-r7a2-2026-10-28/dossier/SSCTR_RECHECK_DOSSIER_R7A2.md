# R7-A.2 — SSCTR re-check dossier (R7A2-FREEZE-1)

**For:** the Sports Science & Concurrent Training Reviewer (gate `R7A2_SCIENTIFIC_RECHECK`), the single re-check of the single freeze.
- This session exposes the native type `sports-science-concurrent-training-reviewer` (`.claude/agents/sports-science-concurrent-training-reviewer.md`); load `governance/agents/sports-science-reviewer/CONSTITUTION.md` and `.agents/skills/sports-science-review/SKILL.md` as it directs.
- Your authority is PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for bounded nonclinical internal sporting decisions only.

**Binding:** R7A2-FREEZE-1, `CoachingCore/r7/a2/RUNTIME_FREEZE_R7A2_FREEZE_1.json`, source digest `e0637ec2613acde1132d70fc64a5a6f0f1062b74d6c5cfafb6654dc1a54c7a28`. Policy R6-POLICY-5 `18ec48f3…` is **unchanged**: no policy text was edited and no sporting rule was added. The engineering judge re-checks the same bytes in parallel.

**Your previous re-check:** `audits/domain-coaching-r7a1-2026-10-27/reviews/ssctr-r7a1-recheck.{md,json}` (R7A1-SSCTR-r2). It closed D56, D57 and D58, found **D59** blocking (a return in the athlete's first loaded week restarts every pre-break exercise as a first establishment), kept **D53** open through it, and stated the required change: *"The return's start state keeps, for every exercise executed in the pause week before the break: that it was performed (in use, with its last performed date), and its last executed count outside a phase reduction (the ceiling). The progression those exposures earned stays unapplied, as now."*

**Mission:** [FOUNDER_REQUEST.md](../FOUNDER_REQUEST.md) (§13 is D59's criterion, §21 your remit), [TASK_CONTRACT.md](../TASK_CONTRACT.md), [INTERRUPTION_CONTRACT.md](../INTERRUPTION_CONTRACT.md). There is no correction cycle after this re-check.

## Your remit (Founder §21)

Only the sporting content this freeze touches: **D59; D53; the return entry; the recovery and restoration ceiling; the short-return easy slot; the D56, D57 and D58 regressions.** Re-run, as far as you need, the first-week grid, the restoration grid, the cap grid and the short-return grid. Do not reopen unaffected decisions.

D59 closes only if the first-week grid shows E = O = B = 0 for NONE and FAMILIAR and O = 0 for KNOWN, the return entry happens, the block in progress earns no set, the ceiling is the last pertinent count executed before the break, and no count rises more than the current rules allow (Founder §13).

## Bounds

- **Read-only runtime.** Write only under `audits/domain-coaching-r7a2-2026-10-28/reviews/`: your probes and outputs, `ssctr-r7a2-recheck.md` and `.json`, and a queue proposal if you approve anything prescriptive (proposal only; the Chief integrates it append-only).
- **Never run** `npm run verify`, `npm run simulate`, `npm run demonstrations:r6`, any `scripts/verify-r*.mjs` with `--write`, `regress-r7a*.mjs`, `freeze-r7a2.mjs`, `prepare-r7a2.mjs` or any `queue-*.mjs`. `node CoachingCore/scripts/verify-r7a2.mjs` without `--write` is read-only.
- Your R7-A.1 scripts in `audits/domain-coaching-r7a1-2026-10-27/reviews/` print only and load the live tree (their `"runtime"` label is fixed in them; check the bytes by digest). `RT=freeze2` there runs R7A-FREEZE-2; a byte-exact R7A1-FREEZE-A2 runtime is at `audits/domain-coaching-r7a2-2026-10-28/freezeA2-source/CoachingCore`.
- Synthetic data and the DEV_TEST_ONLY authority only. No clinical semantics; unknown eligibility is ASK.

## What changed (R7A1-FREEZE-A2 → R7A2-FREEZE-1)

- **Changed:** `src/r6-adaptation.mjs`, `src/r6-composition.mjs`, `src/r6-program.mjs`. **Added:** `test/r7a2-interruption.test.mjs`. Diff: `dossier/RUNTIME_DELTA_R7A2.diff`.
- **The return's starting point** is now the state the athlete had when the break began (`stateAtBreak`, `strengthAtBreak`): the start of the break's week (or the start an earlier return of that week set), plus the exposures executed before the break, as facts only. Your required change, item by item:
  - **in use:** an exercise first executed in the break's week is set up as a review sets it up;
  - **last performed date:** kept;
  - **the ceiling:** its last executed whole count after the time fit, outside a phase reduction, when its logged target was met (the gate is read as the weekly review reads the part of the week before the break);
  - **no progression:** no load adoption, no gate step, no cap rise or end, no return step, no block set.
  The recipe is unchanged: SHORT resumes that state; MODERATE and LONG start the return steps from it (`startStrengthReturn`), the entry at `strengthEntrySets` and RIR ≥ `strengthEntryMinimumRir`, the block in progress earning no set.
- **Break identity** (engineering's QE-R7A1-09 and 10): a separate later break starts from the re-entry the athlete was doing, never from before the first break; a newer report of the same break starts from what preceded it. A short return's easy slot belongs to its break.

## Items with a sporting reach (please rule)

| # | Behaviour now | Before (FREEZE-A2) |
|---|---|---|
| S-A | An exercise first executed in the break's week enters a moderate or long return at the entry, with its executed count as the ceiling | It restarted as a first establishment (D59) |
| S-B | After a **short** break, such an exercise (loaded) has no load reference (its first log is not adopted before a review), so it is established by effort again: UNLOGGED, at most `effortGuidedLoad.sets` (2), RIR ≥ 3, its executed repetitions. A bodyweight exercise set up before a short break continues at its normal count | FIRST_ESTABLISH again (2 sets); bodyweight capped at 2 |
| S-C | An exposure before the break whose logged target was missed is performed (in use) but gives no ceiling count; the ceiling falls back as declared (known count, else normal count) | Not in state |
| S-D | A re-establishment executed before a break is recorded: a moderate return's ceiling is the re-establishment count; after a short break the load is established by effort again (at most 2 sets, under the earlier load), then one set per executed week (D53) | A moderate return's ceiling was the count before the long gap; a short return re-established again |
| S-E | Two separate short breaks: each gets its own easy slot; if the first one's slot is still ahead when the second is reported, both slots run easy (your R7A1-r2 reading a: an eased run is no longer a quality slot) | The second break adopted the first one's executed slot (QE-R7A1-10) |
| S-F | A short break during the return steps resumes the step reached; a weekly review decided after the break began does not count (it was gated on a week the break interrupted) | Restored the pre-first-break dose (QE-R7A1-09) |
| S-G | The entry rep target of an exercise first executed before the break is the one it was executed at (an accessory's 7, not the goal's 5) | The goal's repetitions |
| S-H | A return reads the executions recorded by its report; an execution before the break logged after the return is read by a newer report of the same break, not retroactively | — |

## Evidence on the frozen bytes

All produced by `probes/run-evidence-r7a2.mjs` on R7A2-FREEZE-1 (`probes/EVIDENCE_RUNS_R7A2.json` binds each output to the source digest before and after its run). The scripts are your R7-A.1 instruments, unchanged.

| Your instrument | Result |
|---|---|
| First-week grid (`runs/ssctr-firstweek.out.json`), 306 cases | NONE 90 cases, 264 exercises: E 0, O 0, B 0. FAMILIAR 108 cases, 408 exercises: E 0, O 0, B 0. KNOWN 108 cases, 408 exercises: E 0, O 0, B 0 (FREEZE-A2: NONE E 264, O 561, B 109; FAMILIAR E 408, O 1,021, B 117; KNOWN O 72) |
| Restoration grid, 864 timelines (4 shards) | B 0, C 0; caps that rise or end after a non-whole week 0 (of 4,173; 4,211 before); caps held after a whole week below their ceiling 0; U 237, unchanged; long caps 677 → 683 |
| Cap causes, 864 timelines, and the NONE/NOVICE extension, 360 | Binding cap-weeks 9,912 → 9,499, unexplained 0; extension (360 timelines): unexplained 0, B 0; J 237, unchanged |
| Short-return grid, 315 cases | Byte-identical to its FREEZE-A2 output: 0 defects after the return and after the review |
| D58 readings and your probe (S1, S4–S10) | Byte-identical to their FREEZE-A2 outputs |
| Round-12 instrument (byte copy in `probes/`) | All 43 sections equal to the FREEZE-A2 output, up to the folder |
| Author self-challenge, first-week classes (NONE, FAMILIAR, KNOWN × 5, 10, 14, 35 days × two start days) and re-establishment before a break | 0 violations (E, O, B for moderate and long; no resume above the last executed count for short); 16 violations on FREEZE-A2 |

Grid count shifts you will see, all with 0 violations: the restoration grid's cap-week counts and the D56 grid's trimmed cap-weeks (206 → 200) move because return timelines whose break starts after executed sessions of the same week now read those counts as the ceiling.

## Your records and the queue

- Your twelve R7A1-SSCTR-r2 records bind R7A1-FREEZE-A2, with D59 excluded from every approval and R7A1-SSCTR-D59-PAUSE-WEEK-START a REVISE. Please do the delta check: does each bind R7A2-FREEZE-1, and does D59's record close?
- New prescriptive approvals (for example S-B, S-D or S-E, if you approve them) go in a proposal file (`HQ-R7A2-…` ids, QUEUED_FOR_FUNDED_HUMAN_REVALIDATION, funding NOT_DECLARED). The queue now holds 151 items.

## What to return

`reviews/ssctr-r7a2-recheck.md` and `.json`, with at least:

```json
{
  "revision": "R7A2-SSCTR-r1",
  "reviewer": "sports-science-concurrent-training-reviewer (native)",
  "gate": "R7A2_SCIENTIFIC_RECHECK",
  "freezeReviewed": {"revision": "R7A2-FREEZE-1", "file": "CoachingCore/r7/a2/RUNTIME_FREEZE_R7A2_FREEZE_1.json", "sourceDigest": "<recomputed>", "policyHash": "<recomputed>"},
  "verdict": {"R7A2_SCIENTIFIC_RECHECK": "ACCEPT | NOT_READY", "reason": "..."},
  "items": [{"id": "D59", "status": "CLOSED | OPEN", "blocking": false, "basis": "..."}],
  "d53": {"status": "CLOSED | OPEN", "basis": "..."},
  "regressions": {"D56": "...", "D57": "...", "D58": "..."},
  "rulings": [{"id": "S-A", "ruling": "..."}],
  "earlierRecords": [{"id": "R7A1-SSCTR-D56-FORMULATION", "bindsR7A2Freeze1": true, "basis": "..."}],
  "newFindings": [],
  "queueItemsFile": "<path, if any>"
}
```

Mark a finding blocking only if it is material in your scope. A NOT_READY verdict closes R7-A.2 as NOT_READY and returns to the Founder; there is no further correction. State what you ran, and recompute the digest at your start and end.
