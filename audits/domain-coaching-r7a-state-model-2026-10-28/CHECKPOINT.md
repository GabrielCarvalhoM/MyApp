# COACHING CORE — STATE MODEL CLOSURE — checkpoint

Read [TASK_CONTRACT.md](TASK_CONTRACT.md) first. Each resume point is appended; earlier ones are not edited.

## Resume point 1 — rehydrated, baseline reproduced and bound (2026-10-28)

- **Rehydrated:**
  - AGENTS.md, CLAUDE.md, CURRENT_MISSION.md (the State Evidence blocks), MISSION_LEDGER.md;
  - `CoachingCore/r7/state-evidence/FINAL_REPORT_R7ASE.md`, `audits/domain-coaching-r7a-state-evidence-2026-10-28/FINAL_DISPOSITION.json` (`notReadyRecord`), `TASK_CONTRACT.md`, `CHECKPOINT.md`, `STATE_EVIDENCE_CONTRACT.md`;
  - the engineering review R7ASE-QE-r1 with its probes P51d, P51c, P50, P52 and I02, and the SSCTR review R7ASE-SSCTR-r1 (SE-B, SE-D, NF-R7ASE-1 to 3, R41, R42);
  - the R7-A boundary SSCTR rulings S-A to S-F, the P5 tests (R7-A final, R7-A boundary);
  - the runtime: `src/r6-adaptation.mjs` (`historicalView`, `stateAtBreak`, `projectedBaseOf`, `evidenceStart`, `weeklyGates`, the handlers), `src/r6-program.mjs` (`advanceStrength`, `advanceRun`, `strengthAtBreak`, `strengthCandidate`, `needsReestablishment`, the start record) and `src/r6-composition.mjs` (`composeWeeks`, `weekAsPlanned`, `conditionalNext`, `moveCandidates`).
- **Baseline (§4, §5), before any edit:**
  - the STATE-EVIDENCE-FREEZE-1 digest recomputed `692483ce…` (0 of 82 drift, no unfrozen file; policy `18ec48f3…`);
  - `verify-r7ase.mjs` read-only 17/17; `node --test` 555/555;
  - the judge's P51d (`e0268648…`) and P50 (`2c4a48f7…`) byte-identical, and so are P51c, P52 and I02.

  Outputs are in `probes/baseline/`.
- **Bound:** `CoachingCore/scripts/prepare-r7asm.mjs` wrote `BASELINE.json` (3,513 files) and `state-evidence-freeze-source/` (82 files).
- **Mission files:** in-progress blocks appended to CURRENT_MISSION.md and MISSION_LEDGER.md. The first append lost its backticked words to shell interpolation; both files were restored to the exact baseline prefix (SHA-256 checked against BASELINE.json) and the blocks appended again from a script. No earlier byte changed.

**Next:** the evidence reducer and the planning view (contract §"The model"), then tests T1–T17 and P1–P7, the consumer audit, self-challenge, mutation, regression and evidence, then the single freeze.

## Resume point 2 — state model built in the runtime; earlier tests to re-express; not frozen (2026-10-28)

The session was interrupted twice by a platform safeguard (not by an instruction). On resuming, the working tree was checked against `state-evidence-freeze-source/`: only `src/r6-adaptation.mjs`, `src/r6-composition.mjs` and `src/r6-program.mjs` differ; no test file changed; no freeze exists. `node --test`: 545/555.

**In the runtime:**
- `r6-adaptation.mjs`: `evidenceState` (the evidence reducer; the only writer of history; never reads a stored start's values), `planningBase`/`planningExercise`/`HISTORY_ATOMS` (the PlanningView a decision plans from), `historicalStateOf` (public, read-only HistoricalState), `stateAtBreak` on the reducer with `historicalStrength` (T13). `historicalView`, `projectedBaseOf` and `atDose` are removed. `weeklyGates` and `loggedLoadQuestions` take the decision's base explicitly; `evidenceStart` takes its week and start explicitly.
- `r6-program.mjs`: `evidenceMode` in `advanceStrength` and `strengthAtBreak` (R42: a load only a row prescribed starts its tick at 0; the executed dose is recorded); `historicalStrength`; `anchoredStart` records no `projectedBase`.
- `r6-composition.mjs`: `weekAsPlanned` plans the decision's week from `ctx.base`; a later `fromWeek` chains from it; `moveCandidates` measures D52 from it; `withContextChange` keeps past contexts (the plan each past week was executed under).

**Found and fixed during the build (before any freeze):**
- a block-scoped name clash (`evidence`) in `advanceStrength`: the option is `evidenceMode`;
- "complete" now also requires a usable deciding log for each exercise (a load in an unknown unit is no evidence);
- a past week is judged under its own context, and dropped past contexts are now kept, so a later goal or event change never rewrites what an earlier week earned (found by R7-A.1 C5: `blocksDone` moved after a re-plan);
- each week's gates are read at that week's own clock (the closing decision's, else its last instant), with the decisions before it, so history does not move with time;
- the PlanningView is per atom (targets from the projection, history-defined atoms from the reducer, the load never above the evidence-gated load), because KEEP reviews leave the projection's rep target, which the review rule would replace (QE-R7AB-02 class).

**The ten earlier tests that fail, by cause (to edit in place, marked `State model`):**
- the first day's session order is now material under T13 (the return asks for `startedAt`): R7-A cycle 2, R7-A.1 C3, R7-A.2 I2, R7-A.2 I9;
- the removed `projectedBase` record, or "the plan keeps projecting 22": R7-A boundary I4, State evidence I9, State evidence §18 P40;
- a complete unreviewed week is applied by the review's rule (U equals its reviewed control; NF-R7AB-1's under-reading removed): R7-A boundary I5/P3 (lighter loads), §13 premise (reduced week);
- U lifted more than R (different facts; R's unexecuted released step is no longer its history): State evidence I2, I3.

**Next:** edit those ten tests; write `STATE_MODEL_CONTRACT.md` and the new suite (T1–T17, P1–P7); consumer audit; self-challenge; mutation; regression; evidence runs; then the single freeze and both reviews.

## Resume point 3 — build complete, pre-freeze gates run; the Founder's operational adjustment applies (2026-10-28)

**Founder adjustment received mid-session:** run every pre-freeze gate, make the single freeze, prove its integrity, prepare both reviewer packets, and **stop** — do not dispatch either reviewer, do not change the runtime after the freeze, do not issue the mission's READY/NOT_READY, do not start R7-B0.

**The ten earlier tests, re-expressed in place (each marked `State model`):**
- The first day's session order is now material under T13, so four reports state when their interruption began (`startedAt`): R7-A cycle 2, R7-A.1 C3, R7-A.2 I2 and I9. Verified as a genuine materiality: with that session counted the resumed load is 82.5 kg, without it 80 kg.
- The `projectedBase` record and the `rebuilt` flag are gone, so three assertions now read what the model records: State evidence §18 P40 and I9, R7-A boundary I4.
- A week executed as finally prescribed is evidence for its sport (the premise comparison is gone with the copying it served): R7-A boundary I5/P3 and §13 premise.
- Where the two cells' facts differ, the oracle bounds each cell by its own facts: State evidence I2, I3.

**Found and fixed during the build, each before any freeze:**
- `historicalStateOf` mixed "this week's start plus its facts" with "the next week's start", so the state jumped at a week boundary (found by self-challenge class C3). It now reports the reducer's own reading of the week the cut falls in.
- The tick rule applied only in the reducer, so the planner could still inherit a progression credit across a load change (found by analysing the regression's R6-H25 and the E2 probe). `earnedAt` now applies in both transitions.
- When an adoption raised the load, the repetition target was left from history's earlier load, pairing 22 kg with a 10-rep target (found by the regression's R6-H29 `db-row`, a genuine dose increase). The dose now moves as a unit: a new load takes the repetitions of the exposure executed at it.

**Pre-freeze evidence:**
- `node --test` **589/589** (555 before, 34 in `test/r7asm-state-model.test.mjs`).
- **T1/T2 discriminate:** `probes/t1t2-both-freezes.mjs` passes on the candidate and fails on STATE-EVIDENCE-FREEZE-1 (tick 1 → 0 and the step one exposure later; D52 measured from 2026-11-14 instead of the planned 2026-11-21).
- **Self-challenge:** 12 classes, **0 violations** live, **42** on the predecessor.
- **Consumer audit:** `dossier/CONSUMER_AUDIT_R7ASM.md`; `evidenceMode` at three call sites only; no `stateTrace` entry carries the executed doses.
- **Regression:** R5 24/24, profiles 16/16, simulations 12/14, R6 holdout 20/35; **every difference classified, 0 unclassified**; 113 dose fields fell, 3 rose and all three are repetition targets on rows the evidence turned into effort-guided establishments.
- **Evidence runs:** 29 runs, 0 failed, 0 unbound, each bound to one source digest, including the earlier judges' own probes (QE-R7ASE P51d/P51c/P51b/P50 ×3 zones/P52/I01/I02; QE-R7AB P40 family; QE-R7AF P30c/P31/P32/P37; R7-A.2 P17/P19; R7-A.1 P07).
- **The three target blockers on the judges' own scripts:** QE-R7ASE-01's named atoms no longer differ with identical ledgers and the rows after the break agree; QE-R7ASE-02's week now prescribes the D52 re-establishment in both cells; QE-R7AB-01's P40 family holds.
- **Mutation:** `probes/mutation-check-r7asm.mjs`, with survivors justified in `probes/MUTATION_SURVIVORS_R7ASM.json`.

**Artifacts written:** `STATE_MODEL_CONTRACT.md` (R7ASM-STATE-MODEL-1), `CoachingCore/test/r7asm-state-model.test.mjs`, `CoachingCore/scripts/{prepare,regress,freeze,verify}-r7asm.mjs`, `probes/` (self-challenge, T1/T2, mutation, classification, row probes, evidence runner and runs), `dossier/CONSUMER_AUDIT_R7ASM.md`, `reviews/ENGINEERING_REVIEW_BRIEF.md`, `reviews/SSCTR_REGRESSION_REVIEW_BRIEF.md`.

**Next:** the single freeze (`scripts/freeze-r7asm.mjs`), its read-only verification, `REVIEW_HANDOFF.md`, the mission and ledger blocks, then stop.

## Resume point 4 — frozen, integrity proven, reviewer packets prepared; stopped (2026-10-28)

**Freeze:** HISTORICAL-PROJECTION-FREEZE-1, source digest `0db72d0edd9fd7f1382e1ed8622d29e2ff3356699da18872b0670615956e2eb8`, manifest `CoachingCore/r7/state-model/RUNTIME_FREEZE_HISTORICAL_PROJECTION.json` (`39b326ac…`), 83 files, policy `18ec48f3…` unchanged, frozen 2026-10-29T02:32:19Z on Node v24.19.0.

**Integrity:** `verify-r7asm.mjs` **16/16**, read-only, then `--write` for `CoachingCore/r7/state-model/VERIFICATION_R7ASM.json`. Zero drift against the manifest, no unfrozen source or test file, exactly one freeze file, and the recomputed source digest equal to the recorded one. **The runtime was not edited after the freeze.**

**Final pre-freeze numbers:** 589/589 tests; T1–T17 and P1–P7; T1/T2 pass here and fail on STATE-EVIDENCE-FREEZE-1; self-challenge 12 classes, 0 violations against 42 on the predecessor; mutation 29 mutants, 20 caught, 0 unapplied, 9 justified survivors; 29 evidence runs, 0 failed, 0 unbound; regression R5 24/24, profiles 16/16, simulations 12/14, R6 holdout 20/35 with 0 unclassified differences, 113 dose fields fallen and 3 risen (all effort-guided establishment rows).

**Prepared, not executed:** `reviews/ENGINEERING_REVIEW_BRIEF.md` and `reviews/SSCTR_REGRESSION_REVIEW_BRIEF.md`, both pointing at this freeze, plus `REVIEW_HANDOFF.md` for two new sessions.

**Not done, by instruction:** no reviewer dispatched; no mission readiness verdict; no runtime change after the freeze; no queue append (the human queue is byte-identical to the baseline); no handoff `CoachingCore/r7/R7A_FINAL_HANDOFF.md`; DOMAIN_COACHING_R7-B0 not started.

**For the next session:** read `REVIEW_HANDOFF.md`, then dispatch the two reviews on exactly these bytes. Readiness is decided only after both are recorded.
