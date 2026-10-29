# R7-A.1 — narrow engineering re-check brief (R7A1-FREEZE-A2)

**For:** the independent engineering judge of DOMAIN_COACHING_R7-A.1 (gate `R7A1_ENGINEERING_REVIEW`), single narrow re-check. You did not write this code; the runtime author never judges it.
**Binding:** R7A1-FREEZE-A2, `CoachingCore/r7/a1/RUNTIME_FREEZE_R7A1_FREEZE_A2.json`, source digest `71edc245cfe06a376732ec8054f2e09f277066f2ee4004f34827b2c90a1c4024`, policy R6-POLICY-5 `18ec48f3…` (unchanged).
**Your first review:** `reviews/quality-engineering-r7a1-review.{md,json}` (R7A1-QE-r1, NOT_READY on R7A1-FREEZE-A1, digest `2de8681f…`).
**Mission:** [FOUNDER_REQUEST.md](../FOUNDER_REQUEST.md) (§12), [TASK_CONTRACT.md](../TASK_CONTRACT.md). This is the single correction cycle's narrow re-check. There is no third cycle.

## Your remit (narrow, as you set it)

1. For each of your five material findings, QE-R7A1-01 to 05: is the required change made **by its mechanism**, and is there a test that fails on FREEZE-A1 and passes on FREEZE-A2?
2. Re-state the seven blockers. QE-R7A-01, 02 and 05 were open on FREEZE-A1 through those findings.
3. Re-run the probes you named against FREEZE-A2: P01, P01b, P02, P04, P06, P07, P10 and P09 (both seeds). Re-run nothing else unless the delta touches it.
   - The delta touches the composition module (C1 selectors, move eligibility, the D58 easy slot), the strength state machine (the D57 cap end), the adaptation handlers (review inputs, return correction, equipment record) and the merge.
   - Your P09 random search exercises all of these.
4. Recommend the five integrity verdicts in your scope and give your gate verdict.

The SSCTR re-checks D57 and D58 in parallel on the same freeze (sporting content). You may report a dose effect; you do not rule on it.

## Bounds (unchanged from your first review)

- **Read-only runtime.** Write only under `audits/domain-coaching-r7a1-2026-10-27/reviews/`.
- **Never run** `npm run verify`, `npm run simulate`, `npm run demonstrations:r6`, any `CoachingCore/scripts/verify-r*.mjs` other than `verify-r7a1.mjs` (never with `--write`), `regress-r7a.mjs`, `regress-r7a1.mjs`, `freeze-r7a1.mjs`, `prepare-r7a1.mjs` or `queue-r7a1.mjs`.
- `probes/ssctr-r12-instrument.mjs` and `probes/mutation-check-r7a1.mjs` write next to themselves: copy them into your folder before running (for the instrument, set `R7A_PROBE_OUT`; for the mutation check, set `MUT_OUT`).
- Synthetic data and the DEV_TEST_ONLY authority only. No commit and no network.
- Verify the binding at your start and end with `node CoachingCore/scripts/verify-r7a1.mjs`; its `freeze-current` check must pass. Recompute the digest yourself.

## What changed (FREEZE-A1 → FREEZE-A2)

- **Changed:** `src/r6-adaptation.mjs`, `src/r6-composition.mjs`, `src/r6-program.mjs` and `src/r6-provenance.mjs`.
- **Added:** `test/r7a1-correction.test.mjs` (10 tests).
- **Nothing else changed:** no other source or test file, the policy file, the fixtures.
- **Diffs:**
  - `dossier/RUNTIME_DELTA_R7A1_A1_TO_A2.diff` (this cycle);
  - `dossier/RUNTIME_DELTA_R7A1_A2.diff` (the whole delta from R7A-FREEZE-2).
- **Contract:** `WEEK_COMPOSITION_CONTRACT.md` R7A1-COMPOSITION-2. Every clause this cycle changed is marked *A2*.

## Your five findings: mechanism, test, your probe

Every test below is in `test/r7a1-correction.test.mjs`. All 10 tests fail on a byte-exact FREEZE-A1 copy and pass on FREEZE-A2 (`probes/r7a1-correction-tests.on-FREEZE-A1.out.txt`). Your probes, re-run by the author on the candidate: `probes/a1-judge-rerun/qe-a1-*.A2.out.json`.

| Finding | Mechanism now | Test | Your probe on the candidate |
|---|---|---|---|
| **QE-R7A1-01** (HIGH): moved content keeps the equipment of its history | One per-date reading of the equipment in force (`windowFor`, `sk.equipmentForDate`, `r6-program.mjs:829-831`). It is used by the templates, by every move (`moveCandidates` `fits`: a move never targets a date where its rows need equipment the athlete has not got) and by the final validation (C7 `equipmentUnavailable`, `r6-program.mjs:813`). An equipment statement with nothing to substitute is still recorded (KEEP with an instantiation-only proposal, `r6-adaptation.mjs:554`), so a later plan or move keeps it. A recorded move that can no longer be applied is dropped; the session stays missed, without debt. | `C2/C4 (QE-R7A1-01)`; for the guard, `C7 (QE-R7A1-01)` | P01: `barbellOnOrAfterChange` empty in the four cases (A1: two cases with barbell rows). P01b: the move into the window is refused (KEEP; A1: MOVE). |
| **QE-R7A1-02** (HIGH): next week's start re-derived without the review's inputs | One reading of the review's inputs for every handler that starts next week from the week's evidence: `systemicOf` (the determination, or a recorded `SYSTEMIC_SIGNAL`), `confirmationsOf` (every `LOAD_CONFIRMATIONS` recorded on the week) and `reviewGates` (`r6-adaptation.mjs:239-241`). Confirmations are recorded on the week when reported (`:324`). `evidenceStart`, `rebuild`, the weekly review and `loggedLoadQuestions` read them. | `C3 (QE-R7A1-02)` | P04: `dosesAboveHeld` empty on all eight paths (A1: 6 or 7 doses above the held start on each of the four SYSTEMIC_SIGNAL paths). P05: the learned-rearrangement review holds LONG and EASY as the plain review does. P10: confirmed loads stay KNOWN after an equipment swap and a schedule change (A1: back to FROM_LOG). |
| **QE-R7A1-03** (MEDIUM): a return correction made the next week does not supersede | The week of the break keeps the start it had before a return replaced it (`startBeforeReturn`). A newer report of the same break starts from it, whichever week the newer report comes in (`r6-adaptation.mjs:626`, `:651`). The earlier return's adaptations are removed from that week on. The composition keeps `startBeforeReturn` with the week. | `C5 (QE-R7A1-03)` | P02: the Monday-morning correction equals the corrected report alone (`sameFromWeek6` true; A1 false). |
| **QE-R7A1-04** (MEDIUM): two same-day definitions | Every adaptation selector (fatigue, unavailable day, event conflict, the slots a move may use) uses the one C1 test (`env.ahead`). An adaptation re-applied later uses its own clock: it records the sessions of its day already past at its report (`adaptation().past`, `aheadAt`). | `C1 (QE-R7A1-04)` | P06: an unavailable-today, systemic fatigue or event-conflict report reaches the same-day session still ahead (A1: KEEP or unchanged in those cases). |
| **QE-R7A1-05** (MEDIUM): an unreadable chosen load hides a known load | In the merge, "known" means readable: a load in a known unit (`kgOf`), a finite count (`r6-provenance.mjs:43`). A present but unreadable value is filled from the other report's same set and kept as provenance (`unreadable`). | `I4 (QE-R7A1-05)` | P07: the known load (80) is kept in both arrival orders for a missing unit and for LBS, with no load question and the next squat ticking (A1: null, `LOGGED_UNIT_OR_CONVENTION_UNKNOWN`). |

## The SSCTR's two findings (composition-relevant, ruled by the SSCTR)

- **D57: the return cap ends too early.**
  - At and after the end of the return steps, the cap rises one set per executed whole week (the D56 predicate).
  - It ends only after such a week, once it covers next week's count: the normal count plus the block-boundary set earned at that transition (`r6-program.mjs:514`).
  - Tests: `D57` (the SSCTR’s traced timeline), and `D57` for the whole-week rule: no return or regain cap rises or ends after a week whose last exposure was reduced or trimmed.
- **D58: the short return's easy slot stops at the re-entry week.**
  - The easy slot is recorded on the week re-entry starts.
  - The composition places it on the first quality slot still ahead of the report, in the week as it stands, in that week or a later one (`composeWeeks` carry, `shortReturnEasy`).
  - Once made easy it stays the slot. A later re-plan never makes a second one.
  - If a later change of the week skips it, it passes on at the next composition from a later week (the weekly review at the latest). A same-week change itself never alters another week (I2).
  - Tests: `C4/C5 (D58)`, and `C4 (D58)` for the week's other changes.

## Evidence on the candidate (equal to FREEZE-A2 by digest)

**Tests and grids:**
- **Tests:** `node --test` 505/505 (Node v24.19.0).
- **Composition probes:** 11/11 clean. All 11 are defective on FREEZE-2.
- **Monday grid:** 157 pairs, 0 defects, 0 errors, 7 expected, 18 representation-only. FREEZE-2 has 84 defects.
- **Evening grid** (Tuesday to Sunday): 1,188 pairs, 0 defects, 0 errors, 22 expected, 64 representation-only. FREEZE-2 has 384 defects.
  - The 6 expected pairs that are new since FREEZE-A1 are D58 order effects: a short return with systemic fatigue, an unavailable later day or an event conflict, on the race program's Tuesday and Wednesday evenings.
  - Each is checked against the restrictions of both adaptations, the planned doses and next week's start.
  - On FREEZE-A1 these pairs were "same" because both orders lost the easy slot. That is the both-orders-equal blind spot you named.
- **D58 combinations** (`probes/r7a1-d58-combinations.mjs`, new). It closes that blind spot for D58:
  - Setup: a short return with each same-week adaptation, in both orders and alone, on Monday morning and on every evening, then the weekly review.
  - Checks:
    - no quality run is left in the week;
    - at most one easy slot after the pair, and exactly one after the review;
    - the first quality slot run after the report is that easy slot.
  - Results: 0/136 defective. FREEZE-A1 has 68/136 (`.on-FREEZE-A1.out.json`) and FREEZE-2 has 103/136 (`.BEFORE.out.json`).
- **D56 grid:** 0/206 trimmed weeks with a cap rise or end. 0 capped jumps. The 30 uncovered jumps are the R23 class, equal on FREEZE-2.
- **Three-step search:** 172 sequences, 0 differences.

**Your probes and the remaining checks:**
- **Your probes:**
  - P03 (time zones): 2,844 comparisons, 0 differences.
  - P08 and P12 are unchanged from your FREEZE-A1 run. P12 is QE-R7A1-07: a fail-closed refusal, not changed.
  - P09 at N=2,500 per seed: 5,000 sequences and 14,943 steps, 0 errors. O1 to O7 have 0 violations (FREEZE-A1: O2 had 1, QE-R7A1-01). O9 has 6 refusals, all QE-R7A1-07, as on FREEZE-A1 (`probes/a1-judge-rerun/qe-a1-P09.seed{7,1013}.A2.out.json`).
  - P11 (your mutation spot-check): on the candidate, 5 of its 7 mutants no longer apply: their anchors are in code this cycle rewrote (the author’s C4, QE-05 and C5 reverts as you copied them, and your SYSTEMIC_SIGNAL and same-day fatigue mutants). The C7 survivor still survives (documented), and your missed-move mutant is caught. P11 runs three test files, not the new correction suite. The author’s mutation check re-anchors those reverts and adds the A2 ones (next item).
- **Mutation:** 89 single-fix reverts: the 73 of FREEZE-A1, re-anchored where this cycle moved their code, and 16 for this cycle.
  - The first full run on the candidate caught 86 (`probes/mutation-check-r7a1.A2-run1.out.json`). Its two undocumented survivors were the C7 equipment guard and the D57 whole-week end.
  - The author added the two tests named above. A targeted re-run of the three affected reverts caught all three.
  - The final full run on FREEZE-A2 writes `probes/mutation-check-r7a1.A2.out.json`. It was still running when this brief was written; the verifier's `mutation-check` reads it.
  - The R7-A survivor QE-R7A-22 is caught. The one documented survivor is the C7 duplicate-race guard, as on FREEZE-A1.
- **Regression against R7A-FREEZE-2:**
  - The same named differences as on FREEZE-A1: holdout 30/35 (H22, H24, H25, H26, H29), R5 24/24, profiles 16/16, simulations 12/14 (T05, T13).
  - Each is explained by its clause in `verify-r7a1.mjs`.
- **SSCTR instrument:** Equal to its R7-A CYCLE2 output up to its own path, except two named differences (verifier check `ssctr-instrument`). (1) S9, as on FREEZE-A1: after the event date is moved, the race statement reads the re-planned runs (25 -> 30 minutes). (2) D57, new: the return cap stays on until an executed whole week covers next week’s count, so three traces (`U_returnSets` traces 1 and 3, `X_D49extras` q4 trace 2) check one more climb week (2 -> 3, still no violation) and one return week’s rows (`AG` s5-d20, week 4) show their cap. No count changes. Output: `probes/ssctr-r12-instrument.A2.out.json` (log `.A2.log`).

## Known residuals (stated, not hidden)

1. **Your LOW items, unchanged:**
   - QE-R7A1-06: the C3 completeness on Sunday morning, with no row effect;
   - QE-R7A1-07: a fail-closed refusal of the QE-R7A-04 class, which predates R7-A.1;
   - QE-R7A1-08: a sporting reading, queued for the SSCTR.
   - Your C5 observation (a permanent equipment change also ends windows stated for future dates) is product semantics and is unchanged.
2. **Adaptation order with a short return.** Two same-week adaptations each apply to the week as it stands when reported (C4), so their order can decide which quality slot runs easy:
   - after a fatigue report that already eased this week's quality, the next week's runs easy;
   - after the short return, the fatigue report has nothing left to ease.

   In every order no quality run follows the short return in its week, and exactly one slot is easy after the review (the grids and the D58 probe).
3. **Shift granularity (QE-R7A-23) and week totals:** as in your first review.
4. **Context records (representation only):** as in your first review, with no row or state effect (grids, three-step search, P03).
5. **The R23 class:** sent to the SSCTR, unchanged from FREEZE-2.

## What to return

Write `audits/domain-coaching-r7a1-2026-10-27/reviews/quality-engineering-r7a1-recheck.md` and `quality-engineering-r7a1-recheck.json` with at least:

```json
{
  "revision": "R7A1-QE-r2",
  "reviewer": "quality-reliability-engineer (fresh instance)",
  "gate": "R7A1_ENGINEERING_REVIEW",
  "freezeReviewed": {"revision": "R7A1-FREEZE-A2", "file": "CoachingCore/r7/a1/RUNTIME_FREEZE_R7A1_FREEZE_A2.json", "sourceDigest": "<recomputed>", "policyHash": "<recomputed>"},
  "verdict": {"R7A1_ENGINEERING_REVIEW": "ACCEPT | NOT_READY", "reason": "..."},
  "findings": [{"id": "QE-R7A1-01", "status": "CLOSED | OPEN", "byMechanism": true, "test": "...", "evidence": "..."}],
  "blockers": [{"id": "QE-R7A-01", "status": "CLOSED | OPEN", "evidence": "..."}],
  "newFindings": [{"id": "QE-R7A1-09", "severity": "HIGH | MEDIUM | LOW", "material": true, "mechanism": "...", "reproduction": "..."}],
  "integrityRecommendations": {"WEEK_COMPOSITION_INTEGRITY": "...", "STATE_PRESERVATION_INTEGRITY": "...", "EVENT_SUPERSESSION_INTEGRITY": "...", "EXERCISE_MERGE_INTEGRITY": "...", "RETURN_RECOVERY_CEILING_INTEGRITY": "..."}
}
```

- Mark a finding `material: true` only if it blocks: a wrong prescription or state, lost or rewritten history, or a blocker not closed by its mechanism.
- This is the last review of the cycle. A NOT_READY verdict closes the mission as NOT_READY, with the blocker, its root cause and the smallest next mission. There is no further correction.
- State what you ran, and recompute the digest at your start and end.
