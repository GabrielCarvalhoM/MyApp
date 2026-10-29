# R7-A.1 — SSCTR narrow re-check dossier (R7A1-FREEZE-A2)

**For:** the Sports Science & Concurrent Training Reviewer (gate `R7A1_SCIENTIFIC_REVIEW`), single narrow re-check.
- This session has no native SSCTR agent type. You run as the documented fallback: a fresh default instance that loads the adapter `.claude/agents/sports-science-concurrent-training-reviewer.md`, `governance/agents/sports-science-reviewer/CONSTITUTION.md` and `.agents/skills/sports-science-review/SKILL.md`.
- Your authority is PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for bounded nonclinical internal sporting decisions only.

**Binding:** R7A1-FREEZE-A2, `CoachingCore/r7/a1/RUNTIME_FREEZE_R7A1_FREEZE_A2.json`, source digest `71edc245cfe06a376732ec8054f2e09f277066f2ee4004f34827b2c90a1c4024`. Policy R6-POLICY-5 `18ec48f3…` is **unchanged**: no policy text was edited and no sporting rule was added.

**Your first review:** `reviews/ssctr-r7a1-review.{md,json}` (R7A1-SSCTR-r1). It found FREEZE-A1 (`2de8681f…`) NOT_READY on D57 and D58, and approved or ruled S2 and S4–S10 and the D56 formulation ("last").

**Mission:** [FOUNDER_REQUEST.md](../FOUNDER_REQUEST.md), [TASK_CONTRACT.md](../TASK_CONTRACT.md). This is the single correction cycle's narrow re-check. There is no third cycle.

## Your remit (as you set it)

1. **D57 and D58**, with your grids.
2. **The changed files** at `18ec48f3…`: the delta check that binds your records to FREEZE-A2.
3. **That S1 and S4–S10 still hold.**

Out of scope: the engineering findings QE-R7A1-01 to 05 (the engineering judge re-checks them in parallel on the same freeze) and the report merge (pure provenance).

## Bounds (unchanged)

- **Read-only runtime.** Write only under `audits/domain-coaching-r7a1-2026-10-27/reviews/`:
  - your probes and their outputs;
  - `ssctr-r7a1-recheck.md` and `ssctr-r7a1-recheck.json`;
  - a queue proposal, if you have new or refined items (proposal only; the Chief integrates it append-only).
- **Never run** `npm run verify`, `npm run simulate`, `npm run demonstrations:r6`, any earlier `scripts/verify-r*.mjs`, `regress-r7a*.mjs`, `freeze-r7a1.mjs`, `prepare-r7a1.mjs` or `queue-r7a1.mjs`.
- `node CoachingCore/scripts/verify-r7a1.mjs` without `--write` is read-only.
- The `probes/r7a1-*.mjs` scripts print only. `probes/ssctr-r12-instrument.mjs` writes next to itself: copy it into your folder and set `R7A_PROBE_OUT`.
- Your scripts print `"runtime":"R7A1-FREEZE-A1"` for the live tree because that label is fixed in them. The live tree is FREEZE-A2 now; check it by digest.
- Synthetic data and the DEV_TEST_ONLY authority only. No clinical semantics. Unknown eligibility is ASK.

## What changed (FREEZE-A1 → FREEZE-A2)

- **Changed:** `src/r6-adaptation.mjs`, `src/r6-composition.mjs`, `src/r6-program.mjs` and `src/r6-provenance.mjs`.
- **Added:** `test/r7a1-correction.test.mjs`.
- **Unchanged:** the policy file and the fixtures.
- **Diffs:** `dossier/RUNTIME_DELTA_R7A1_A1_TO_A2.diff` (this cycle) and `dossier/RUNTIME_DELTA_R7A1_A2.diff` (from R7A-FREEZE-2).
- **Engineering changes with a sporting reach.** Name any you see; they are fixes of the engineering judge's findings:
  - the review's own inputs (systemic determination, confirmed loads) now start next week for every handler;
  - a return correction made in a later week supersedes the earlier report;
  - same-day adaptations reach exactly the sessions still ahead (C1);
  - a moved session never uses a date where its equipment is missing.

## D57: the return cap ends too early

**Your required change:**
- The return cap (and the regain cap, by the same rule) ends only after a week whose last executed exposure did its whole count after its time fit.
- It ends only when the cap is at or above the count the exercise would otherwise have next week: its normal count, including any block-boundary set earned at that transition, with phase reductions on top.
- No count after a re-establishment or a return may exceed the largest count executed since then by more than one set.

**What the runtime now does** (`r6-program.mjs:507-516`):
- **Return cap.** At and after the end of the return steps, the cap rises one set per executed whole week (the D56 predicate, unchanged). It ends only after such a week, and only when it covers next week's normal count plus the block-boundary set that transition earns. Phase reductions still apply after the cap.
- **Regain cap.** It rises only after an executed whole week (unchanged). It ends once it reaches the largest count the exercise can have (the goal's maximum sets, the prior count, the current count). That already covers next week's count, block set included, so no change was needed.

**Evidence:**
- **Test** `R7-A.1 D57`: your traced timeline (RUNNING_SUPPORT, a 20-minute strength day, a 16-day return, the budget raised to 75 minutes later). With one and with two strength days, no count comes back more than one set above the largest executed since the return. It fails on FREEZE-A1.
- **Test** `R7-A.1 D57`, the whole-week rule: your grid timeline sg-ret16mon-STRENGTH-N-1-30-none. No return or regain cap rises or ends after a week whose last exposure was reduced or trimmed. It fails on FREEZE-A1: in week 8, the goblet squat did 2 of 3 sets and its cap of 3 ended.
- **Your restoration grid** (`ssctr-r7a1-grid.mjs`, 864 timelines, 0 skipped), re-run by the author on the candidate (`probes/ssctr-rerun/ssctr-r7a1-grid.A2.out.json`):

| | FREEZE-A1 | Candidate (= FREEZE-A2) |
|---|---|---|
| B: counts more than one set above the largest executed since | 38 | **0** |
| C | 0 | 0 |
| A: cap rise or end after a week whose last exposure was not whole | 806 (786 phase, 20 time fit) | **0** |
| A2: held weeks below the return ceiling | 0 | 0 |
| U: uncovered jumps (R23 class) | 237 | 237 (unchanged, same exercises) |
| L: cap weeks at the horizon | 517 (66 ended, 451 still on) | 677 (87 ended, 590 still on) |

- L grows because the caps now last until the conditions above hold. Please rule whether any of those long caps holds a count back without reason.

## D58: the short return's easy slot stops at this week

**Your required change:**
- The easy slot is the first quality slot still ahead of the return report (C1), in the week re-entry starts or a later week.
- It runs easy and is recorded as the adaptation of the week that holds it, so later re-plans and the weekly review keep it.
- Exactly one slot changes.

**What the runtime now does** (`r6-composition.mjs` `shortReturnEasy` and the `composeWeeks` carry; `r6-adaptation.mjs` `returnAfterPause`):
- The return records the easy-slot fact on the week re-entry starts.
- The composition looks for the first quality slot still ahead of the report, in the week as it stands. If that week holds none, the fact moves on to the next week placed, where it is recorded.
- **Once made easy it stays the slot.** A later re-plan of that week, before or after the slot is history, never makes a second one.
- **A slot made easy and later skipped** (the athlete reports that date unavailable, or an event-period conflict) is not a run. The fact passes on to the first quality slot of the next week placed, at the next composition from a later week: the weekly review at the latest. The same-week report itself changes only its week (I2).

**Evidence:**
- **Test** `R7-A.1 C4/C5 (D58)`, your case: the week's quality run is Tuesday, and a 6-day break is reported Wednesday morning.
  - Next week's Tuesday quality slot runs easy, also after the weekly review, and only that one.
  - A pre-break quality run missed and reported after the return is not moved into the re-entry.
- **Test** `R7-A.1 C4 (D58)`, the week's other changes:
  - a strength-only change after the slot is history, then the review, gives no second slot;
  - the Tuesday quality day unavailable and a short return on the same Monday, in both orders, leave no quality run in the week and exactly one easy slot after the review.
- **Your short-return grid** (`ssctr-r7a1-short.mjs`, 315 cases), re-run on the candidate (`probes/ssctr-rerun/ssctr-r7a1-short.A2.out.json`):
  - after the return: **0 defects**, 0 without a slot, 0 extra, 0 history changed (FREEZE-A1: 96);
  - after the review: **0 defects**, 0 without a slot, 0 extra (FREEZE-A1: 96).
- **The short return with the week's other adaptations** (`probes/r7a1-d58-combinations.mjs`, author probe, new):
  - Setup: each same-week adaptation (systemic or local fatigue, a later unavailable day, a missed key session, an event conflict), in both orders and alone, on Monday morning and on every evening, then the weekly review.
  - Checks:
    - no quality run is left in the week after the report;
    - exactly one easy slot after the review;
    - the first quality slot run after the report is that slot.
  - Results: **0 of 136** defective on the candidate. FREEZE-A1: 68. FREEZE-2: 103.

**Please rule on three readings of "the first quality slot still ahead"** (composition order; no new rule was written):

| Case | What the runtime does |
|---|---|
| A systemic fatigue report eased this week's quality run before the short return | That run is no longer a quality slot, so next week's first quality slot runs easy. Reported in the other order, the return's easy slot is this week's, and fatigue has nothing more to ease. Both orders stay at or below the planned dose. |
| The quality day was reported unavailable before the return | A skipped session is not a slot. The easy slot is the moved quality run, if the move rule moved it, or else the next week's. |
| The easy slot is reported unavailable after the return | It passes on to the next week's first quality slot at the weekly review, not at the report. Until that review, next week shows its planned quality run. |

## S1 and S4–S10 still hold

**Unchanged:**
- **S1, the D56 formulation:** the last executed exposure. D56 grid: 0 rises or ends after a trimmed week (0/206), 0 capped jumps, and the R23 uncovered jumps equal FREEZE-2.
- **S4 to S9:** the composition probes (11/11 clean), the Monday grid (0 defects, 157 pairs) and the evening grid (0 defects, 1,188 pairs).
- **The regression against R7A-FREEZE-2:** the same named differences as on FREEZE-A1.

**S10, adaptations that meet in one week:**
- The pairs whose order now decides which quality slot runs easy are listed as expected in both grids. Each is checked against the restrictions of both adaptations and the planned doses.
- Your S10 conditions hold: no quality run follows a systemic fatigue report in either order, and no move uses a slot marked unavailable.

**Your round-12 instrument:** Equal to its R7-A CYCLE2 output up to its own path, except two named differences (verifier check `ssctr-instrument`). (1) S9, as on FREEZE-A1: after the event date is moved, the race statement reads the re-planned runs (25 -> 30 minutes). (2) D57, new: the return cap stays on until an executed whole week covers next week’s count, so three traces (`U_returnSets` traces 1 and 3, `X_D49extras` q4 trace 2) check one more climb week (2 -> 3, still no violation) and one return week’s rows (`AG` s5-d20, week 4) show their cap. No count changes. Output: `probes/ssctr-r12-instrument.A2.out.json` (log `.A2.log`).

## Your earlier records and the queue

**Records:**
- Ten records were bound to FREEZE-A1: R7A1-SSCTR-D56-FORMULATION, RESTORATION-SCOPE, SAME-DAY, DOSE-READING, COMPOSITION, REGAIN-BASE, REESTABLISH-PHASE, SPLIT-WEEK, ITEMS-5-8 and CYCLE2-COMPOSITIONS.
- Please do the delta check and say whether each binds FREEZE-A2. Their unmet clauses were D57 and D58.

**Queue:**
- Your nine items `HQ-R7A1-SSCTR-*` (`reviews/ssctr-r7a1-queue-items.json`) are integrated append-only at closure, whatever the verdict.
- Refine or add items in a new proposal file (`HQ-R7A1-…` ids).

## What to return

Write `audits/domain-coaching-r7a1-2026-10-27/reviews/ssctr-r7a1-recheck.md` and `ssctr-r7a1-recheck.json` with at least:

```json
{
  "revision": "R7A1-SSCTR-r2",
  "reviewer": "SSCTR via documented fallback (fresh default instance loading adapter, constitution 1.0.0 and skill)",
  "gate": "R7A1_SCIENTIFIC_REVIEW",
  "freezeReviewed": {"revision": "R7A1-FREEZE-A2", "file": "CoachingCore/r7/a1/RUNTIME_FREEZE_R7A1_FREEZE_A2.json", "sourceDigest": "<recomputed>", "policyHash": "<recomputed>"},
  "verdict": {"R7A1_SCIENTIFIC_REVIEW": "ACCEPT | NOT_READY", "reason": "..."},
  "items": [{"id": "D57", "status": "CLOSED | OPEN", "blocking": false, "basis": "..."}, {"id": "D58", "status": "CLOSED | OPEN", "blocking": false, "basis": "..."}],
  "d53": {"status": "CLOSED | OPEN", "basis": "..."},
  "d56": {"status": "CLOSED | OPEN", "basis": "..."},
  "earlierRecords": [{"id": "R7A1-SSCTR-D56-FORMULATION", "bindsFreezeA2": true, "basis": "..."}],
  "newFindings": [],
  "queueItemsFile": "<path, if any new proposal>"
}
```

- Mark a finding blocking only if it is material in your scope.
- This is the last review of the cycle. A NOT_READY verdict closes the mission as NOT_READY, with the blocker and the smallest next mission. There is no further correction.
- State what you ran, and recompute the digest at your start and end.
