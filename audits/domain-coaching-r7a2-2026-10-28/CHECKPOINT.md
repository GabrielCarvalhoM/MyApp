# DOMAIN_COACHING_R7-A.2 — checkpoint

Read [TASK_CONTRACT.md](TASK_CONTRACT.md) first. Each resume point is appended; earlier ones are not edited.

## Resume point 1 — rehydrated, baseline reproduced (2026-10-28)

- **Rehydrated:** AGENTS.md, CLAUDE.md, CURRENT_MISSION.md (R7-A.1 closure block), MISSION_LEDGER.md; `CoachingCore/r7/a1/FINAL_REPORT_R7A1.md`, `READINESS_R7A1.json`, `audits/domain-coaching-r7a1-2026-10-27/FINAL_DISPOSITION.json`, `CHECKPOINT.md`, `TASK_CONTRACT.md`, `WEEK_COMPOSITION_CONTRACT.md` (R7A1-COMPOSITION-2); both R7-A.1 re-checks; the judges' P13, P14 and the SSCTR first-week grid; policy `operational.return` (`strengthReturnSets`). Runtime read: `returnAfterPause`, the composition module, the strength state machine.
- **Baseline (§3):** FREEZE-A2 digest recomputed `71edc245…` (0 of 78 files drift); `verify-r7a1.mjs` read-only 17/17; `node --test` 505/505; P13, P14 and the first-week grid byte-identical to the recorded re-check outputs. Copies in `probes/baseline/`.
- **Bound:** `scripts/prepare-r7a2.mjs` wrote `BASELINE.json` (1,674 files) and `freezeA2-source/` (78 files).
- **Root cause confirmed:** one cause (no break identity, no state at the break's start), three blockers.

## Resume point 2 — build and candidate evidence complete, before the freeze (2026-10-28)

- **Runtime delta** against `freezeA2-source/`: `src/r6-adaptation.mjs` (the break a return reports: `liveReturns`, `breakOf`, `interruptionEpisode`; the state at the break: `stateAtBreak`; `returnAfterPause` reads both and records the break), `src/r6-program.mjs` (shared readings of a week's executed exposures, `strengthAtBreak`; `advanceStrength` uses the shared readings, behaviour unchanged), `src/r6-composition.mjs` (easy-slot ownership, per-break carry). Added `test/r7a2-interruption.test.mjs` (14 tests). Policy `18ec48f3…` unchanged.
- **Contract:** [INTERRUPTION_CONTRACT.md](INTERRUPTION_CONTRACT.md), R7A2-COMPOSITION-3, successor of the C5 return clauses of the R7-A.1 composition contract.
- **Author self-challenge** (`probes/r7a2-self-challenge.mjs`, 42 cases): 0 violations on the candidate, 16 on FREEZE-A2. Its first runs found two oracle over-reaches (short-return weeks following the plan's own block set; the D53 regain of one set per week), tightened to the declared rules, both identical on FREEZE-A2.
- **Mutation** (`probes/mutation-check-r7a2.mjs`, new invariants only): first run 11/15 caught. The four survivors led to one code change and three tests before the freeze:
  - the window followed planned dates; it now follows the recorded execution date (a session planned on the break's first day but done the day before counts; an unexecuted one on that day does not);
  - the explicit exclusion of the superseded report was redundant with the date rule (equivalent mutant) and was removed;
  - tests added: a report spanning an earlier re-entry is asked; an earlier break's easy slot still ahead stays its own; a session of the plan before a return is never a fact of a later break.
  Final run: 17/17 caught.
- **Named consequences (not defects), for the judges:** P06 and the Monday grid's expected pair keep an accessory's executed rep target at the entry (7, was 5); the evening grid's two pairs of a return and a report of the week's earlier sessions differ only in what that return read (rows equal; INTERRUPTION_CONTRACT §5); D56 and restoration grids shift cap-week counts with 0 violations; R6-H17 differs in state facts only.

**Next:** wait for the full evidence run on the final candidate (`probes/run-evidence-r7a2.mjs`); if it shows no blocker, `node CoachingCore/scripts/freeze-r7a2.mjs` (the single freeze), then `node CoachingCore/scripts/verify-r7a2.mjs`, the dossiers, and both re-checks in parallel on the same bytes. No runtime edit after the freeze; no correction cycle.

## Resume point 3 — two more classes closed before the freeze; evidence re-run (2026-10-28)

- **Continued self-challenge found two more paths of the class**, both closed before the freeze:
  - a newer report of the same short break made in a later week, after the break's easy slot was run, eased a second slot (inherited from FREEZE-A2; it contradicts I2 and I9). Now a newer report whose break's slot is already history keeps that slot and records none (`returnAfterPause`, `slotRun`);
  - a conflicted report of a session planned on the break's first day could pull that session into the week before the break and turn its exercises' gates to HOLD. A conflicted report now executes nothing until it is corrected (QRE-R6-14).
- **Tests:** 14 in `test/r7a2-interruption.test.mjs` (the later-week correction and the conflict added to existing tests); `node --test` 519/519; all 14 fail on the FREEZE-A2 copy.
- **Mutation:** 19 mutants of the new invariants, 19 caught.
- **Regression unchanged:** R5 24/24, profiles 16/16, simulations 14/14, R6 holdout 34/35 (R6-H17, state facts only).
- The first evidence run was stopped (its digest predates these changes) and restarted on the final candidate.

**Next:** when `probes/EVIDENCE_RUNS_R7A2.json` is written and shows no blocker: freeze, verify, fill the briefs, dispatch both re-checks in parallel.

## Resume point 4 — R7A2-FREEZE-1 frozen, both re-checks dispatched (2026-10-28)

- **Evidence on the final candidate** (`probes/run-evidence-r7a2.mjs`, 38 runs, 0 failures, source digest `e0637ec2…` before and after every run): P13 X, X2 and S keep the re-entry; P14 gives the second short break its own slot; first-week grid E = O = B = 0 for NONE, FAMILIAR and KNOWN; P09 5,000 sequences with O1–O7 at 0; self-challenge 0 of 42; SSCTR grids with 0 violations and no unexplained cap.
- **Freeze:** `CoachingCore/r7/a2/RUNTIME_FREEZE_R7A2_FREEZE_1.json`, source digest `e0637ec2613acde1132d70fc64a5a6f0f1062b74d6c5cfafb6654dc1a54c7a28`, freeze file `14fd8efe…`, 79 files, policy `18ec48f3…` unchanged. Delta from FREEZE-A2: `src/r6-adaptation.mjs`, `src/r6-composition.mjs`, `src/r6-program.mjs`; added `test/r7a2-interruption.test.mjs`.
- **Verifier** (`node CoachingCore/scripts/verify-r7a2.mjs`): 17/19; open only `independent-reviews` and `deliverables`, as expected before the re-checks and closure.
- **Dispatched in parallel on R7A2-FREEZE-1** (claude-opus-5-5, effort xhigh): a fresh `quality-reliability-engineer` with `dossier/ENGINEERING_RECHECK_BRIEF_R7A2.md`, and the native `sports-science-concurrent-training-reviewer` with `dossier/SSCTR_RECHECK_DOSSIER_R7A2.md`. Outputs: `reviews/quality-engineering-r7a2-recheck.{md,json}` and `reviews/ssctr-r7a2-recheck.{md,json}`.
- **Rule:** no runtime or test edit from now on. No correction cycle (Founder §19): a material blocker from either judge closes R7-A.2 NOT_READY with `NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION`.

**Next:** read both re-checks; READY only if both accept R7A2-FREEZE-1. Then closure: readiness, report, disposition, queue append if any, the insert-only mission and ledger blocks, `verify-r7a2 --write`, and the handoff only if READY.

## Resume point 5 — engineering re-check NOT_READY received and reproduced; SSCTR pending (2026-10-28)

- **Engineering (R7A2-QE-r1, fresh `quality-reliability-engineer`): NOT_READY on R7A2-FREEZE-1** (digest recomputed at start and end, 0 of 79 files drift).
  - **QE-R7A2-01 (HIGH, material):** a report of the first break (A) made after a separate break (B) began — the same dates again, or a corrected first day — turns B into SAME_BREAK of A; B's return starts from the week start before A (six strength rows at the pre-break dose, a 70-minute long run). Reproduction `reviews/qe-r7a2-P17-late-correction-then-separate-break.mjs` (L1–L4; controls C1 and C2 correct), grid `qe-r7a2-P19-…` (12/12 cells where the re-report falls after B ended and before B's report), and `qe-r7a2-P20-…` (QE-R7A1-10's outcome returns: week 4 Tuesday QUALITY THRESHOLD 41). Inherited from FREEZE-A2. Reproduced by the author byte for byte.
  - **Root cause:** identity (`interruptionEpisode`) and the starting point (`stateAtBreak`) are decided against the record's current supersession — the latest live report and its clock — not against the record as it stood on the break's first day. Same architecture, same class as QE-R7A1-09/10.
  - QE-R7A2-02 (MEDIUM, not material: late logs of the break week's sessions change rows in the first-week setting; the SSCTR's call) and QE-R7A2-03 (LOW, a variant of 01).
  - Blockers: QE-R7A1-09, QE-R7A1-10 and QE-R7A-01 OPEN. Boundaries 1–6 accepted. Recommends WEEK_COMPOSITION, EVENT_SUPERSESSION and EXERCISE_MERGE READY; STATE_PRESERVATION and RETURN_RECOVERY_CEILING (engineering side) NOT_READY.
- **Consequence (Founder §19, §26):** R7-A.2 closes NOT_READY whatever the SSCTR rules. No correction after the freeze, no FREEZE-2, no A.2.1, no third judge. `NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION`.

**Next:** record the SSCTR re-check when it arrives (its rulings and records still bind the closure and the queue), then closure.

## Resume point 6 — closed NOT_READY (2026-10-28)

- **SSCTR (R7A2-SSCTR-r1, native): ACCEPT** on R7A2-FREEZE-1 (digest at start and end, 79 of 79 files).
  - D59 closed on its Founder §13 criterion; D56, D57 and D58 hold; S-A to S-H approved.
  - 13 records validated (0 errors; the negative control caught with 6 errors). Non-blocking NF-1, R35, R36, NF-4, NF-5 and R37 routed.
  - Queue 151 → 163: 12 HQ-R7A2-SSCTR-* items, append-only, funding NOT_DECLARED (`QUEUE_INTEGRATION_R7A2.json`).
- **Consolidated:** R7A_EXIT_READINESS = NOT_READY (`CoachingCore/r7/a2/READINESS_R7A2.json`, `FINAL_DISPOSITION.json`).
  - QE-R7A1-09, QE-R7A1-10 and QE-R7A-01 OPEN through QE-R7A2-01; D59 CLOSED.
  - D53 OPEN in the consolidated record: the QE-R7A2-01 path restores the pre-break dose at once, and §22 closes D53 only as a consequence of QE-R7A1-09.
- **Closure written:**
  - `CoachingCore/r7/a2/FINAL_REPORT_R7A2.md` (Portuguese, §1–13, proven / inferred / untested);
  - the insert-only blocks `DCR7A2-20261028-closed-r1` in `CURRENT_MISSION.md` and `MISSION_LEDGER.md`;
  - `verify-r7a2.mjs --write`: 19/19 (`CoachingCore/r7/a2/VERIFICATION_R7A2.json`): 519/519 tests, both re-checks bound to `e0637ec2…`, no handoff.
  - The readiness `generatedAt` and the disposition `date` were set to their real write times (14:07Z, 14:08Z); they had a declared 14:20Z.
- **Not done, by rule:**
  - no runtime or test edit after the freeze;
  - no FREEZE-2, no A.2.1, no third judge;
  - no handoff (`CoachingCore/r7/R7A_FINAL_HANDOFF.md` not written);
  - R7-B0 and R7-B not started.

**Next:** `NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION`, the Founder's to take; not started. Start from `CoachingCore/r7/a2/FINAL_REPORT_R7A2.md` §13 and `FINAL_DISPOSITION.json` `notReadyRecord`.
