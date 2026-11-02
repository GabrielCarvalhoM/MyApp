# R7-C Phase 5 — Engineering narrow recheck request (on R7C-FREEZE-2, after the single correction cycle)

You are a fresh, independent engineering judge (`quality-reliability-engineer`). You did not author this runtime, the correction cycle, its tests or its evidence. Your predecessor's review of R7C-FREEZE-1 is [ENGINEERING_REVIEW_R7C.md](ENGINEERING_REVIEW_R7C.md) (with its JSON): **NOT_READY**, blockers QE-R7C-01 and QE-R7C-02 (`DIRECT_R7C_DELTA`), QE-R7C-03 major, QE-R7C-04/05 minor, QE-R7C-06 observation.

The Founder allowed one narrow correction cycle after R7C-FREEZE-1: fix, directed tests, the full suite, `R7C-FREEZE-2`, and the affected recheck. This is that recheck. **There is no second cycle:** a blocker here closes R7-C as `CLOSED_NOT_READY`.

## Bytes to judge

- **R7C-FREEZE-2:** record `CoachingCore/r7/c/RUNTIME_FREEZE_R7C_2.json`, sha256 `457582a2094c3d1ed89067ee56caadcd8def58e94f6e68750e010624337bfa8d`.
  - Commit of the bound bytes: `a10cec04071be97e409f11a4f831f13eae0c9769`.
  - Source digest `9e424f702dbc2861f00d7ee0f2993172e74702afeb46767b7065eec6eaa63f35`; manifest digest `02c50ef3a98cf5770551934b116acb47aa3240fefc0a640d0639f2db5597efb9`; 150 files; the suite has 854 tests.
  - It binds `CoachingCore/package.json` and `package-lock.json` (QE-R7C-06) and your predecessor's probes (`reviews/engineering/probes/*.mjs`).
- **Identity:** `node CoachingCore/scripts/verify-r7c.mjs --revision 2` (read-only without `--write`; `--suite` also re-runs the suite). Run it yourself before and after your work.
- **Predecessor:** R7C-FREEZE-1, commit `1890f66356455112907d757032a8b1cd2de29c00`.
- **The cycle's delta:** `git diff 1890f66356455112907d757032a8b1cd2de29c00 a10cec04071be97e409f11a4f831f13eae0c9769 -- CoachingCore/src CoachingCore/test`.
  - `src/r6-composition.mjs`: `aboveFactsCeiling` (new); `declaredPauses` (extracted unchanged from `unknownRunWindow`, now shared); `composeWeeks` option `uncredited`.
  - `src/r6-adaptation.mjs`: `factualReplan` (the ceiling trigger, `uncredited`, `origin`, `CEILING_REPLAN`); the G01 guard right after the gap guard in `evaluateProgram` (a decision that ends with `UNREPORTED_TRAINING` is made again without the ceiling re-plan, through the module-private `NO_CEILING`); `withReference` (`carried`, QE-R7C-03).
  - Tests: `test/r7c-phase5-cc.test.mjs` (6 directed tests), and `test/r7a-cycle2.test.mjs:111` (classified EXPECTED_SEMANTIC_UPDATE, see below).

## What the cycle did, finding by finding

| Finding | Change on FREEZE-2 | Directed test | Mutant |
|---|---|---|---|
| QE-R7C-01 | **The ceiling re-plan.** A run dose still ahead in the decision's week that exceeds the single-run ceiling the record allows is re-planned from the facts, whichever decision recorded them. The ceiling is the longest completed run in the 30 days before the week plus the step, or the reviewed entry when there is none. The re-plan applies only when the window holds run sessions of this plan with no executed report outside a declared break: credit. **Scope:** easy running only, like `unknownRunWindow`; never a return report (it decides its own re-entry from the break it declares); never a return-entry week (its demonstration is not in the record); never while a question about unknown training stands (the G01 guard). | refusal (R4) and clinical carriers, with and without re-send; race week; after clearance | CC-M1 (trigger removed), CC-M5..M9 (scope) |
| QE-R7C-02 / C9 | A factual re-plan never credits the decision week's elapsed run sessions that have no report, in the weeks it projects (`uncredited`). | week b+1 equals on time after a day-2 known-stop answer, taper to race week included; the first decision of week b+1 with week b's review skipped | CC-M2 |
| QE-R7C-03 | A held reactive signal keeps travelling beside a change kept while the question stays open (your QM-3). | held fatigue, a kept change, then the answer, as on time | CC-M3 |
| QE-R7C-04 | — | a signal held at the end of its week is never replayed in the next | CC-M4 (your QM-2) |
| QE-R7C-05 | Not changed. Disclosed in the handoff (your E4: the same 2 checks). | — | — |
| QE-R7C-06 | `package.json` and `package-lock.json` are bound in FREEZE-2. | — | — |

**What the cycle caught in itself.** These were fixed before the freeze, and each is pinned by a directed test and a mutant:
- The first form of the trigger fired on week 0 for cold starts, trimming timely runs to the entry. It hit athletes of unknown weekly volume and starts on the intake day. Fix: the credited-session condition, since nothing precedes week 0. Mutant CC-M5.
- It also overrode a return's entry, which rests on a current demonstration not kept in the record (34 of 144 return configurations without the scope). It overrode return and restart weeks too. Fix: easy running only, and never a return-entry week. Mutants CC-M6 and CC-M7.
- The evidence run on `e7ddc38` found a G01 regression: P1 failed on three schedule changes that ask about the next week's window. The ASK carried the ceiling proposal with new run doses. Fix: the G01 guard. Mutant CC-M8. Those outputs were discarded.
- The evidence run on `3210b88` found that the trigger also fired inside a return report itself, before the return composes: the break it declares is not yet in the record, so its days read as credit. Prescriptions were unchanged (R7-B.2 differential: two more PRESERVE timelines differed only in the reason and decision record). Fix: a return report decides its own re-entry, as the gap guard already lets it. Mutant CC-M9. Those outputs were discarded.

**Reach beyond your findings (please judge it):**
- **The never-reported class.** Weeks were never reported, but the intake run is still in the window, so no question is asked. The stored doses credit the unreported weeks above the facts' ceiling, for example `E40/Q34/L60` against a ceiling of 55. They are now re-planned from the facts. This reaches `test/r7a-cycle2.test.mjs:111`, classified **EXPECTED_SEMANTIC_UPDATE**:
  - the dated equipment change is still asked and never applied (the barbell rows stay);
  - the factual re-plan of the credited run doses travels with the date question;
  - the original no-proposal reading is kept where nothing is credited.
- **The G01 grid's late schedule changes.** Six rows change in the MISS column. R7C-FREEZE-1 kept the credited week-b doses valid after the gap weeks were reported not done (for example `Q43/L75`). FREEZE-2 re-plans them from the facts (for example `Q34/L65`), inside the accepted residual R2. In three short-gap rows (an anchor run in the window, so no question is asked) the UNREP column changes identically, and still holds like the reviewed miss (OK_HOLD_LIKE_REVIEWED_MISS). Every verdict is unchanged.

## Evidence on FREEZE-2 (`../../probes/out/`, label `R7C-P5-963239b`)

Manifest `evidence.R7C-P5-963239b.json`; mutation `mutation.R7C-P5-963239b.json`; differential `cc-differential.R7C-P5-963239b.json`.

| Check | Result on FREEZE-2 | Against R7C-FREEZE-1 (`R7C-P5-f69ddbb`) |
|---|---|---|
| Suite (freeze record; verifier `--suite`) | 854/854, 0 failures | 848/848; +6 directed tests (`r7c-phase5-cc`) |
| Verifier `verify-r7c.mjs --revision 2` | 16/16 PASS with `--suite` ([report](../../../../CoachingCore/r7/c/VERIFICATION_R7C_2.json)): the R7C-FREEZE-1 checks, plus the predecessor record and reviews by SHA-256 and the correction-cycle mutants | — |
| SD answer grid | A: 1,200 cells, 0 violations (24 PREEXISTING_HOLD, 4 ELAPSED_HISTORY_QUESTION); C 9/0, S 6/0, I 4/0 | identical |
| G01 Phase 4 grids | grid A 148 (76/40/32), grid B 46/46, P1 165/0, 0 violations, 0 unnecessary asks | verdicts identical; 6 grid-A rows change: the late schedule changes, MISS column, and in 3 short-gap rows UNREP identically (see above) |
| G02 | byte-identical to Phase 4 (`R7C-P4-39115ed`) | identical |
| SD-01 check (`verify-sd01`) | answer week EASY 15 / LONG 15, VALID | identical |
| SSCTR SD7, SD8, SD9, SD1 probes | as on FREEZE-1 | identical |
| SSCTR R1 probes, re-run on FREEZE-2 bytes (not your folder; outputs available on request) | `r1-exposure`: 168 cells, 168 equal to on time, 0 breaches of the single-run ceiling. `r1-race-week`: race week right after a taper answer EASY 15 / EASY 15 / RACE 75 = on time; next decisions 8/8 equal | on `e1a4ef4`: 112/168 equal; race week EASY 20 / RACE_TOUCH 25 / RACE 75, next 7/8 |
| Engineering probes E1–E4 (bound), on FREEZE-2 bytes | E1: 0 stale VALID cells (16 on FREEZE-1); E3: week b+1 = on time 8/8 (2/8); E3b: none above the ceiling; E2(a): the held fatigue survives the kept change and is re-evaluated with the answer, as on time; E2b: no replay across weeks; E4: 81 checks, the same 2 batch checks (QE-R7C-05) | — |
| Holdout | as on FREEZE-1 | identical |
| Clinical | K6 1/1, K6b 1/1, CAND-01 / CAND-02 / ADJ PASS; inherited adversarial 3,228 checks, 0 failed | identical apart from labels |
| Conformance | R7-B PASS, R7-B.1 delta PASS, R7-B.2 delta PASS | identical |
| Neighbours, differential against R7B2-FREEZE-1 | neighbours as on FREEZE-1; differential against R7B2-FREEZE-1: the same 29 C15 relabels as on FREEZE-1 (PRESERVE 95/98, R7B1_PATH 20/20, B2_PATH 7/33 identical), substitution grid 184/0, clinical sweep 389/0, envelope findings 0 | identical apart from labels (exit codes as on FREEZE-1) |
| Differential against R7C-FREEZE-1 (`phase5-cc-differential.mjs`, 99 scenarios) | 97 identical. Identical: cold starts by class and intake date, timely execution, shorter executed runs, 48 returns with a demonstration. Differing: 2, both the never-reported class | — |
| Mutation | Phase 3 set 17/18 (G02-M4 equivalent, witness killed); Phase 4 rules 8/8; SD mutants 6/6 (fragments follow the new text); correction-cycle mutants CC-M1..M9 9/9 | the R7C-FREEZE-1 sets preserved; CC-M1..M9 new |

## Recheck (narrow)

1. **QE-R7C-01..04 closed on FREEZE-2.** Re-run your probes E1–E4 (bound in FREEZE-2), and judge the directed tests.
2. **No regression from the cycle.** Use the differential against R7C-FREEZE-1, the evidence above, the full suite, and anything you need to reproduce.
3. **The ceiling re-plan and the G01 guard.** Are they correct and minimal? Is there any path where the re-plan acts on facts the record does not keep, travels with a question about unknown training, or rewrites history?
4. **The `r7a-cycle2` classification.**
5. **Mutation:** CC-M1..M9 killed, and the earlier sets preserved.
6. **QE-R7C-05 and QE-R7C-06 dispositions.**

Mark any blocker `DIRECT_R7C_DELTA` or not; it ends R7-C as `CLOSED_NOT_READY` (no second cycle).

## Rules

- **Read-only on the repository.** Write only under `audits/domain-coaching-r7-c-2026-11-01/reviews/engineering/`: `ENGINEERING_RECHECK_R7C.json` and `ENGINEERING_RECHECK_R7C.md`, your probes in `probes/recheck/` and their outputs in `probes/recheck/out/`.
- **Probes and scripts:**
  - Run committed probes only if they print to stdout, or from copies in your folder.
  - Do not re-run `probes/phase5-run-evidence.mjs` or `probes/phase5-mutation.mjs` in place: the runner writes into `probes/out`.
  - For predecessor bytes, use `git archive` into a temporary directory.
- **Never run** `npm run verify`, any `verify-r*` script other than `verify-r7c.mjs` without `--write`, or any script with `--write`. `CoachingCore/node_modules` is installed; do not reinstall.
- **No commits** and no git operation that changes state. Do not edit `src/`, tests, evidence, freeze records, `CURRENT_MISSION.md`, `MISSION_LEDGER.md` or anything outside your folder. You fix nothing.

## Deliverables

- **`ENGINEERING_RECHECK_R7C.json`:**
  - the freeze identity, and the verifier result before and after;
  - the verdict;
  - per item, the answer with evidence;
  - findings (`QE-R7C-NN`, continuing the numbering) with severity, origin, `DIRECT_R7C_DELTA`, reproduction and the smallest fix;
  - the probes run.
- **`ENGINEERING_RECHECK_R7C.md`:** human-readable. Its last line is exactly `R7C_ENGINEERING_GATE = READY`, `R7C_ENGINEERING_GATE = READY_WITH_CONDITIONS` or `R7C_ENGINEERING_GATE = NOT_READY`.
