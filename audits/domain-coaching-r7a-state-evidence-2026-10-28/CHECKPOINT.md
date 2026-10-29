# COACHING CORE — STATE EVIDENCE MODEL — checkpoint

Read [TASK_CONTRACT.md](TASK_CONTRACT.md) first. Each resume point is appended; earlier ones are not edited.

## Resume point 1 — rehydrated, baseline reproduced and bound (2026-10-28)

- **Rehydrated:**
  - AGENTS.md, CLAUDE.md, CURRENT_MISSION.md (the R7-A boundary blocks), MISSION_LEDGER.md;
  - `CoachingCore/r7/boundary/FINAL_REPORT_R7AB.md`, `audits/domain-coaching-r7a-boundary-2026-10-28/FINAL_DISPOSITION.json` (`notReadyRecord`), `TASK_CONTRACT.md`, `CHECKPOINT.md`, `WEEK_START_AUTHORITY_CONTRACT.md`;
  - the engineering re-check R7AB-QE-r1 with its probes P40, P40b, P40c, P41 and P47b, and the SSCTR re-check R7AB-SSCTR-r1;
  - the R7-A final interruption contract §4;
  - the runtime: `src/r6-adaptation.mjs` (`historicalWeekStart`, `stateAtBreak`, `evidenceStart`, the handlers), `src/r6-composition.mjs` and `src/r6-program.mjs` (the state machines, `strengthAtBreak`, the start record).
- **Baseline (§4), before any edit:**
  - the R7A-BOUNDARY-FINAL-FREEZE digest recomputed `36a71ca8…` (0 of 81 drift; policy `18ec48f3…`);
  - `verify-r7ab.mjs` read-only 17/17; `node --test` 540/540;
  - the judge's P40 byte-identical (`b76b8259…`, the author's recorded reproduction), and so are P40b, P40c, P41 and P47b;
  - P40 on the R7A-FINAL-FREEZE copy gives the same values (only the `tz` field the judge added later differs).

  Outputs are in `probes/baseline/`.
- **Bound:** `CoachingCore/scripts/prepare-r7ase.mjs` wrote `BASELINE.json` (2,862 files) and `boundary-freeze-source/` (81 files).

## Resume point 2 — model built, tested and self-challenged; not frozen (2026-10-28)

**The design choice, and the one revision.** The first build made the weekly review build next week's start on the historical base ("the review builds on history"). The R6 holdout H35 then showed that this changes planning: after four unreported weeks, a review rebuilt the run from the intake and dropped the quality session the athlete had just executed. The Founder excludes that in §2, §15 and §16 (the planner may project freely; only history changes). So the planner was restored exactly, and history became value-scoped:
- the planner reads the stored start as before;
- history (`historicalView`) reads each value from its start only when the start holds it as evidence;
- a value that a `WEEK_EVIDENCE` start carried from a projection is rebuilt, by the same rule, on its historical value;
- the start records which values it carried (`projectedBase`).

Contract: [STATE_EVIDENCE_CONTRACT.md](STATE_EVIDENCE_CONTRACT.md).

**Found and fixed before the freeze (author self-attack, the self-challenge and the mutation rounds):**
- Per-exercise promotion of a partly executed week changed the state on one side of a week boundary (R7-A final P5) and contradicted SSCTR S-A. Promotion is now per sport, and each value still needs its own historical base.
- A lighter executed load alone did not satisfy family B (an executed projected 22 is history). A known load lifted is now the load, by the adoption rule.
- History rebuilt on facts carried a tick counted at an earlier load onto a lifted projected load (P41: 87.5 against the control's 85). A lifted projected dose now promotes that dose (load, repetitions, ticks).
- A calendar-count override broke "a break with nothing executed starts from the return's entry". Reverted.
- A rebuilt value counted as held, so a later verified projection could promote a value that a review had carried (two steps). Fixed (`held`), with test "I9 (two steps)" and self-challenge class C12.
- A load logged in an unknown unit verified a projection (inherited from the boundary freeze). An advancing gate with no usable log no longer verifies; test "family C unreviewed".

**Evidence so far (not yet on frozen bytes):**
- `node --test` 554/554: the 540 earlier tests (one test file edited in place and marked `State evidence`, three cases) and the new `test/r7ase-state-evidence.test.mjs` (14 tests, 9 of which fail on the boundary-freeze copy).
- Self-challenge `probes/r7ase-self-challenge.mjs`: 12 classes, 0 violations; 52 on the boundary-freeze copy.
- Regression `scripts/regress-r7ase.mjs`: R5 24/24, profiles 16/16, simulations 14/14 identical; R6 holdout 33/35, with H17 and H26 named in `probes/REGRESSION_R7ASE_NAMED.json` (return entries after unreported weeks).
- The judge's P40 family on the candidate: P40 U = R in both variants; P40c ceiling 20; P41 counts never executed gone; P47b equals its control.
- Mutation rounds 1 and 2: survivors became tests, and their fragments were corrected; round 3 running.

**Next:**
1. Mutation round 3.
2. Evidence runner and comparison on the final source.
3. The single freeze (`scripts/freeze-r7ase.mjs`) and the read-only verifier.
4. Both reviews in parallel on the same bytes.

## Resume point 3 — final source, evidence and the single freeze (2026-10-28)

**Found and fixed before the freeze** (the comparison of every probe with its R7A-BOUNDARY-FINAL-FREEZE output):
- **Exercise key order.** History's fact and rebuilt paths sorted the exercise keys, so the same state was a different record on either side of a week boundary. The values were identical and the runtime's `hash` is canonical, but three byte-level oracles failed: the R7-A final self-challenge C9 (2) and the R7-A boundary self-challenge C5. History now keeps the key order of the start it reads (`r6-adaptation.mjs`, `historicalView`).
- **Evidence runner job paths.** Its P30b/P30c jobs named scripts that do not exist. The R7-A boundary judge had recorded the R7-A final judge's scripts under those names, so the jobs now run those scripts.

**Declared before the freeze, contract §7 and §5:**
- **E6.** A handler that applies the weekly review's rule on the week's last day is that sport's review.
- **Reps unlogged.** A projected dose lifted with repetitions unlogged is still the load lifted; the repetitions stay the target.

**Consumer audit (§21):** [dossier/CONSUMER_AUDIT_R7ASE.md](dossier/CONSUMER_AUDIT_R7ASE.md).

**Evidence on the final source** (digest `692483ce…`):
- `node --test` 555/555.
- Mutation 23/23 caught, all applied.
- Regression: R5 24/24, profiles 16/16 and simulations 14/14 identical; R6 holdout 33/35, with H17 and H26 named.
- Evidence runner: 96 runs, 0 failed, each bound to the digest before and after.
- Comparison: 75 of 95 identical, and the 20 that differ are named in `probes/COMPARE_R7ASE_NAMED.json`. The self-challenge has 0 violations live and 52 on the boundary-freeze copy.

**Freeze:** STATE-EVIDENCE-FREEZE-1 (`CoachingCore/r7/state-evidence/RUNTIME_FREEZE_STATE_EVIDENCE.json`).
- Source digest `692483ce5147d90797441baf2ac73c9d433197bd40047f147202ca4e4bff2cc1`.
- File SHA-256 `a8683cbad60fd7f7b9da8b09e5c44bc74a55c6a2445e744606d37dbc6fde69f7`.
- Policy `18ec48f3…` unchanged.
- Read-only `verify-r7ase.mjs`: 15/17. Open: `independent-reviews`, `deliverables`.

**From here the runtime is not edited.**

**Next:** both reviews in parallel on these bytes, then closure (READY or NOT_READY). No correction cycle.

## Resume point 4 — both reviews recorded; closed NOT_READY (2026-10-28)

**Reviews on STATE-EVIDENCE-FREEZE-1** (`692483ce…`, unchanged at the start and end of both):
- **Engineering, R7ASE-QE-r1: NOT_READY.**
  - **QE-R7ASE-01** (MEDIUM, material): `atDose` promotes the projection's load tick together with the load the athlete lifted.
  - **QE-R7ASE-02** (MEDIUM, material): the planner's D52 predicate reads a projected last-performed date.
  - QE-R7ASE-03 and QE-R7ASE-04 are LOW and not material.
  - E1 is rejected in part; E2–E6 are accepted.
  - The Chief re-ran P51d and P50 read-only: both outputs are byte-identical to the judge's.
- **SSCTR, R7ASE-SSCTR-r1: ACCEPT.**
  - SE-A to SE-H approved, SE-B and SE-D with conditions.
  - D53 and D56–D59 hold.
  - NF-R7ASE-3 (the projected tick, not approved as history) is the same atom as QE-R7ASE-01.

**Closure** (no correction cycle; no runtime edit after the freeze):
- **Queue:** 187 → 199 (`QUEUE_INTEGRATION_R7ASE.json`).
- **Records:** `READINESS_R7ASE.json`, `FINAL_REPORT_R7ASE.md` and `FINAL_DISPOSITION.json` (with the §32 record per finding).
- **Mission files:** closed blocks appended in CURRENT_MISSION and the ledger.
- **Verifier:** `verify-r7ase.mjs --write` 17/17 (mechanical checks only).
- **Not done:** no handoff; R7-B0 not started.

**NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION.** Do not reopen this mission or freeze again.
