# COACHING CORE — STATE MODEL CONSUMER CLOSURE — checkpoint

Read [TASK_CONTRACT.md](TASK_CONTRACT.md) first. Each resume point is appended; earlier ones are not edited.

## Resume point 1 — rehydrated, predecessor closed, baseline reproduced and bound (2026-10-29)

- **Rehydrated:** AGENTS.md, CLAUDE.md, CURRENT_MISSION.md and MISSION_LEDGER.md (the State Model blocks); `audits/domain-coaching-r7a-state-model-2026-10-28/REVIEW_HANDOFF.md`, `STATE_MODEL_CONTRACT.md`, `TASK_CONTRACT.md`, `CHECKPOINT.md`, the freeze manifest; both independent reviews (R7ASM-QE-r1, R7ASM-SSCTR-r1) with their probes and outputs; the runtime (`src/r6-adaptation.mjs`, `src/r6-program.mjs`, `src/r6-composition.mjs`, `src/r6-provenance.mjs`) and the policy entries F1–F3 consume (`operational.strength.goalDoses`, `loggedLoadAdoption`, `operational.return`).
- **Predecessor closed:** the State Model Closure had both reviews recorded and no closure record. Its closure is recorded as decided by the Founder's request of 2026-10-29 (§0): `STATE_MODEL_CLOSURE = NOT_READY`, routed to this mission, `R7A_EXIT_READINESS` not issued, the SSCTR's 8 queue proposals not integrated (they only re-bind approvals already queued to a NOT_READY freeze; the queue stays at 199). `audits/domain-coaching-r7a-state-model-2026-10-28/FINAL_DISPOSITION.json`, and one closed block each in CURRENT_MISSION.md and MISSION_LEDGER.md (insert-only, prefix verified byte for byte, no CR appended).
- **Bound:** `CoachingCore/scripts/prepare-r7asc.mjs` wrote `BASELINE.json` (3,851 files) and `state-model-freeze-source/` (83 files, own MANIFEST), after checking that every file HISTORICAL-PROJECTION-FREEZE-1 binds still matches it.
- **Baseline (§3), before any edit:** see the task contract's table. The digest `0db72d0e…` holds; `verify-r7asm.mjs` read-only 15/16 before this mission added a file, 14/16 after (the added prepare script is the only cause); `node --test` 589/589; every reviewer probe for QE-R7ASM-01..04 and F1–F3 reproduces byte for byte (trace-h25 differs only in its own `at` clock). The SSCTR grids give B = 2 in each, as recorded.

**Next:** the four fronts in the runtime (ingress, correction boundary, the resolved prescription, temporal credit), then the tests (the seven findings, H1–H5, S1–S6, T1–T5, P1–P7), the audits, self-challenge, mutation and regression, then the single freeze.

## Resume point 2 — the four fronts built; three further defects found and fixed; not frozen (2026-10-29)

**In the runtime** (`src/r6-program.mjs`, `src/r6-adaptation.mjs`; `src/r6-composition.mjs` unchanged):
- **A, history ingress (QE-R7ASM-01):** `asEstablishment`. Read as executed evidence (the evidence reducer, a review's transition, the facts-only reading, the load questions), an exposure of an exercise the start does not hold is an effort-guided establishment, whatever its row prescribed. A KNOWN row's load is never the exercise's load nor the adoption reference.
- **B, correction boundary (QE-R7ASM-04):** `canonicalRecord`. `historicalStateOf` normalizes and binds the carried record with the runtime's own `normalizeObservations` and `bindObservations`, at the record's own clock, so superseded and retracted rows are inert history there too.
- **C, the resolved prescription (QE-R7ASM-03, F2, F3):**
  - `resolveExercisePrescription` is the one place a decision's exercise dose is resolved: HistoricalState's exercise as one unit (EarnedProgress: load, repetitions and tick together), never a projected atom. `planningExercise` and `HISTORY_ATOMS` are removed.
  - `earnedAt` takes the gate's repetitions (HOLD and REGRESS the row's target, ADVANCE the logged repetitions), and resets the credit whenever the adopted load is above the load history held, whoever set it.
  - `strengthCandidate` caps the repetition target of every row of a known dose at the current goal's range (`inRange`).
  - `planningBase` takes history's whole run while either reading is in RETURN or RESTART.
- **D, temporal evidence (F1):**
  - A return step moves from the dose the week's exposures were prescribed at, never above the state (`doseStep`), so an exposure that repeated the entry completes the entry only. The run side does the same: the return step, restart minutes and walk/jog step move from what the week's runs prescribed (`plannedOf` states the re-entry dose).
  - The evidence reducer reads a return's own week with the summary of the sessions after the return's point (NF-R7ASM-1).

**Found and fixed during the build, each before any freeze:**
- **The run side of F1.** A return reported on Friday, with the earlier easy run of that week missed, credited return step 2 for runs that repeated the entry (the MODERATE return skipped its middle step). Reading the RESTART run from history would also have inherited history's restart minutes, 20 → 25 → EASY, while the athlete ran 15, 20, 25. Probe `probes/r7asc-run-reentry-step.mjs`. It is now identical to STATE-EVIDENCE-FREEZE-1.
- **A gate counting later logs (Property D).** `weeklyGates` counted strength logs inside the look-back window with no upper time bound. So when the reducer re-read an earlier week at its own clock, logs executed weeks later made it REGRESS, and could have made it EARNED. Found through the T04 simulation's dead bug, 16 → 8 repetitions on both freezes; the old view hid it by reading the projection. Logs now count only up to the gate's clock.
- **The public reader threw.** It failed for a cut in a program's last week while a return was in force (`inWeek` past the last week). It now answers.

**Tests:**
- `node --test` 628/628.
- `test/r7asc-state-consumer.test.mjs`: 38 tests (the seven findings on the judges' own scenarios, H1–H5, S1–S6, T1–T5, P1–P7, and the three defects).
- T15 and P7 in `test/r7asm-state-model.test.mjs` are re-expressed on the real correction path (`correctionOf`), marked `State consumer`, plus T15c, the conflict case.
- On the HISTORICAL-PROJECTION-FREEZE-1 copy (`probes/tests-on-predecessor.mjs`), every finding regression fails, as do H1, H4, H5, S5, P2, P7, the last-week reader, NF-R7ASM-1, the gate-window test and the re-expressed T15 and P7.

**Judges' probes on this runtime:**
- QE: Q2, Q2b, Q3 (4 variants), Q3b, Q4, Q4b, Q11c and Q12 all show the findings closed.
- SSCTR: the reps probe (HOLD 82.5 × 5, 0 rows out of range); trace-h25 (2 × 8, never above 70); trace-b and trace-b2 (lockstep, B empty); trace-d47 (20/20, not 45/50); the restoration and caps grids gave B = 0 on the first version of D. The full kit is re-run on the final runtime.

**Regression against the predecessor:**
- 80 of 89 cases are identical once the re-entry dose summary is set aside. No decision status changed in the corpus; one simulation decision did (T05).
- 60 dose fields rose (all in T04 and T13, restored to the SSCTR-approved STATE-EVIDENCE-FREEZE-1 rows) and 82 fell.
- Named classes: EARNED_REPETITIONS (R6-H22, H24, H33), GOAL_RANGE_CUT (R6-H18, H25, T08), HOLD_REPEATS_DOSE (T04, T13), RETURN_WEEK_SUMMARY (T05), PLANNED_SUMMARY_BOOKKEEPING (the rest).

**Concurrent work:** a Claude session recorded the Growth Layer product decision (PDR-1.10, DR-124–132). It appended insert-only blocks after this mission's in-progress blocks; this mission's prefix was verified intact with no CR. It holds an additive product/canon patch (`audits/growth-layer-2026-10-29/PENDING_CANON_SYNC.patch`) until this mission's closure. This mission does not touch product/ or canon/ and does not apply that patch; the closing session must know it waits.

**Next:** STATE_CONSUMER_CONTRACT.md, the consumer and test-quality audits, the self-challenge, mutation, the evidence runs and the regression record, then the single freeze, its verification, the handoff and the two briefs.

## Resume point 3 — every pre-freeze gate run on the final runtime (2026-10-29)

**The final runtime** has source digest `adab3716…`. After resume point 2 it changed only by one comment in `strengthCandidate`, which says which rows keep the goal's establishment target. No behaviour changed.

**Correction to resume point 2:** "60 dose fields rose (all in T04 and T13…)" should read 56 in T04 and T13 plus 4 in R6-H22.
- The 56 are the rows restored to STATE-EVIDENCE-FREEZE-1; T04 and T13 are now identical to it.
- The 4 are R6-H22's cycle points one step behind the projected steps: 29 × 10 where the predecessor had 31.5 × 6.

**The SSCTR kit on the final runtime** (`probes/kit-final/`; 43 jobs, all bound, 0 failed). The r12 instrument's data path is fixed in `run-ssctr-kit.mjs`: it is given relative to the instrument's folder.

Every difference from the SSCTR's accepted run on STATE-EVIDENCE-FREEZE-1 is read and named:
- **Restoration grid, row by row** (`grid-signature-r7asc.mjs`, `grid-explain-r7asc.mjs`; the caps grid reads the same timelines): 159 of 864 timelines differ, 0 unexplained.
  - 1,464 rows are the return base the SSCTR approved on the predecessor.
  - 132 rows are the goal range cut. Accessory return rows under STRENGTH go 7 → 6; this also happens without a goal change, following the KNOWN rows' existing cut.
  - 60 rows are F1 restorations at the predecessor's executed target.
- **x-items:** only accessory 7 → 6 cuts.
- **x-firstweek:** only the REPS_ROW tally, 108 → 0.
- **x-trace-sd:** identical to the predecessor.
- **Round-12 sections:** identical to the predecessor except section V (NF-R7ASM-1), which is back to the accepted reading.
- **The other probes:** sorted by shape (`kit-explain-r7asc.mjs`).

**Self-challenge.** Class C16 is added: Property D over the simulation corpus.
- At every week start, history read with the whole record must equal the cut-only reading.
- The target recorded for each exercise's last executed exposure must be the target its row carried.
- C16 catches the gate-window class on the predecessor, with 34 violations, all T04.
- Result: 16 classes, 1,376 cases, **0 violations**; 84 on the predecessor.

**Mutation check** (`probes/mutation-check-r7asc.mjs`: the Founder's §25 list, then the pieces the fronts rest on; 26 mutants). The first run caught 21. Of the five survivors, four were material and got a test, each failing on its mutant:
- the load questions (D45);
- the walk/jog step after a short return;
- R42 across a heavier load the athlete chose;
- REGRESS at a projected load under REPS_THEN_LOAD (STATE-EVIDENCE-FREEZE-1 gives 18 × 8; the predecessor gave 18 × 7 and 18 × 6, below the range).

The fifth, the view taking history's run only when history is in re-entry, is equivalent on a 112-timeline battery whose positive control is caught. It is documented in `probes/MUTATION_SURVIVORS_R7ASC.json`. The check is re-run on the frozen test files (its record binds the source digest and the test files' hashes).

**Tests:** 632/632. 27 of the 77 tests in the two consumer suites fail on HISTORICAL-PROJECTION-FREEZE-1, every finding regression among them.

**Evidence:** `probes/EVIDENCE_RUNS_R7ASC.json`, 62 runs, 0 failed, 0 skipped, 0 unbound. On their own probes:
- QE-R7ASM-01 to 04 are closed;
- QE-R7ASM-05 is unchanged: Q10 gives the same 10 cells, declared E1/E3, in the backlog with a ruling requested;
- the earlier blockers stay closed.

**Regression against the predecessor:**
- R5 24/24, profiles 12/16, simulations 10/14, R6 holdout 25/35; no corpus status change;
- one simulation decision changes action (T05);
- 0 unclassified (`REGRESSION_R7ASC_NAMED.json`).

**Non-blocking findings:**
- NF-R7ASM-3 is closed collaterally: the SSCTR's change probe, part D, shows no stall at 80.
- NF-R7ASM-2, R41 and QE-R7ASM-06 are unchanged and in the backlog.

**Next:** the mutation check's record on the frozen test files, then the single freeze, its read-only verification, the mission and ledger blocks, and stop.

## Resume point 4 — frozen; handoff and both briefs prepared; stopped (2026-10-29)

- **The mutation check, re-run on the frozen test files:** 26 mutants, 25 caught, 0 unapplied, 1 survivor documented. Its record binds source digest `adab3716…` and the test files' hashes.
- **The single freeze,** `scripts/freeze-r7asc.mjs`: STATE-MODEL-CONSUMER-FREEZE-1, recorded in `CoachingCore/r7/state-consumer/RUNTIME_FREEZE_STATE_MODEL_CONSUMER.json`.
  - Source digest `adab3716…`, manifest `4f11f4b4…`, 84 files, frozen at 2026-10-29T14:19:24Z.
  - The suite ran inside the freeze: 632/632.
  - It binds by SHA-256 the evidence runs (62), the SSCTR kit runs (43), the mutation record and its survivors document, the regression and its named classes, each checked against the digest.
  - A second freeze is refused.
- **Verification,** `scripts/verify-r7asc.mjs`: 25/25 read-only, then written once (`VERIFICATION_R7ASC.json`).
  - One verifier defect was found and fixed before the record was written: it parsed every kit output as JSON, and `x-trace-rot` prints text. The verifier is not a bound file. `x-trace-rot` is byte-identical in full to the SSCTR's runs.
- **Prepared and not executed:** `REVIEW_HANDOFF.md`, `reviews/ENGINEERING_REVIEW_BRIEF.md` and `reviews/SSCTR_REGRESSION_REVIEW_BRIEF.md`, all pointing at this freeze.
- **The mission files,** appended insert-only with the prefix verified and no CR:
  - `CURRENT_MISSION.md` has block `DCR7ASC-20261029-frozen-r1`: `CURRENT_MISSION = STATE_MODEL_CONSUMER_CLOSURE_FROZEN`, `NEXT_STEP = INDEPENDENT_REVIEWS`, `STATE_MODEL_CONSUMER_FREEZE_READY_FOR_INDEPENDENT_REVIEW = YES`.
  - `MISSION_LEDGER.md` has the matching entry.
  - `R7A_EXIT_READINESS` is not emitted.
- **The runtime was not changed after the freeze.** No reviewer was dispatched, and R7-B0 is not started.
- **Held for the closing session:** the Growth Layer's `audits/growth-layer-2026-10-29/PENDING_CANON_SYNC.patch` is applied at this mission's closure, before any later baseline binds `product/` or `canon/`.

**Next:** two new, independent sessions: engineering, and SSCTR regression-only. Then the closing session.
