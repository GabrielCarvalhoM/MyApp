# R7-A DECISION AUTHORITY — pre-review report (Founder request §47)

**Freeze:** R7A-DECISION-AUTHORITY-FREEZE-1. Record: `CoachingCore/r7/decision-authority/RUNTIME_FREEZE_R7A_DECISION_AUTHORITY.json`.
**Labels:** COMPROVADO means proven by a run recorded on the frozen bytes; INFERIDO means inferred by reading or by argument; NÃO TESTADO means not tested.
Every run named here is in `probes/EVIDENCE_RUNS_R7ADA.json` or `probes/kit-final/RUNS.json`, bound to source digest `3a7166b2…`.

| # | Item | COMPROVADO | INFERIDO | NÃO TESTADO |
|---|---|---|---|---|
| 1 | Cloud baseline | `CLOUD_BASELINE.md` read. Branch `claude/trusting-euler-04la8t` at `ffc1136643d51390199b57c23700eb652f40265b`, clean, the same commit as `r7/decision-authority-closure-base`. 4,477 files bound before the first edit ([BASELINE.json](BASELINE.json)) | — | — |
| 2 | Branch | The work, the freeze and the commits are on `claude/trusting-euler-04la8t`. The request names `cloud/trusting-euler-041a8t`; the infrastructure created `claude/…` from the same commit. Nothing is merged into the base branch or `main` | — | — |
| 3 | Predecessor freeze | STATE-MODEL-CONSUMER-FREEZE-1 is intact: 84 of 84 files match its manifest; digest `adab3716…`, manifest `4f11f4b4…`, freeze file `5c868775…`. It is copied byte-exact to `state-consumer-freeze-source/`, and the freeze re-checks it | — | — |
| 4 | Five blockers | All five reproduce on the predecessor with the reviewers' own probes. 10 of 10 outputs match the runs the reviewers cited, the machine path aside (`runs/baseline-predecessor/BLOCKERS.json`) | — | — |
| 5 | Root-cause clusters | Three contracts plus the walk/jog ceiling. Ablation restores each regression difference by reverting the named change ([TASK_CONTRACT.md](TASK_CONTRACT.md), causes table) | That each finding has one root per contract (code reading) | — |
| 6 | Factual authority | QE-R7ASC-01 absent on P01, P01 at 24 kg and P01b. Self-challenge A1–A6: 53 cases, 0 violations (36 on the predecessor). Mutants F1–F5 killed | That no other reader adopts a planned load (consumer audit, by reading) | Real wearable payloads |
| 7 | Decision context | QE-R7ASC-04 absent: P07, 0 of 20 pairs diverge. C1–C5: 77 cases, 0 violations (52). Mutants C1–C4 killed | — | Goal changes on every weekday of every phase (Monday and Sunday tested) |
| 8 | Progression and gate authority | QE-R7ASC-03 absent (P05, P05b). QE-R7ASC-02 absent by its mechanism: 0 of 44 P02b cells with the plan ahead of history (31 on the predecessor). Its literal sweep flags 1 cell, where the unreviewed plan is *lower* (E1/E3). D1–D3: 70 cases, 0 violations (50). Mutants P1–P5 killed | That the flagged cell is the reviewer's OBS-2 class (the probe's history projection omits `easyExtra` and `devCount`) | — |
| 9 | Walk/jog ceiling | F4 absent: 0 of 12 SSCTR cells above the recipe (10 of 12 on the predecessor). E1–E2: 28 cases, 0 violations (22). The F4 tests (5 cells), P6 and P7 pass. Mutants W1, W2 killed | — | The transition to continuous running after a pause (the walk/jog exit tested only without a pause) |
| 10 | HOLD | The Founder example 82.5 × 3 on the line 82.5 × 5 (range 4–6) gives 82.5 × 5 with no progression credit, on both trees. The SSCTR's `reps` and `tick` probes are byte-identical | — | — |
| 11 | MAINTAIN | The Founder example 70 × 10, projection 70 × 12, MAINTAIN 8 gives 70 × 8, on both trees. SSCTR F3 test (R6-H25) passes; `trace-h25` is identical except its clock | — | — |
| 12 | F1–F4 | F1 (restoration and caps grids, `trace-b`, `trace-b2`), F2 (`reps`, `tick`) and F3 (`trace-h25`) are identical on the SSCTR's own kit. F4 is closed (item 9) | That the five named kit differences are within policy (named in `probes/NAMED_DIFFERENCES_R7ADA.json`) | The SSCTR's rulings R2 and R3 |
| 13 | D53–D59 | The instruments the SSCTR used for each item are byte-identical to the predecessor's run: D53 restoration `grid` shards 0–3; D56 and D57 `caps` shards 0–3 and `caps-ext`; D58 `short` and `d58`; D59 the first-week grids (`firstweek`, `x-firstweek` shards 0–7) and same-day (`f-sameday`, `x-sameday`). `r12-instrument` (D53) and `changes` (D56) differ, and are named. The D53/D56/D57/D58/D59 tests pass | That the `changes` difference keeps D56 (its caps persist longer: conservative) | — |
| 14 | Tests | 663 of 663 on the frozen bytes. Of the 100 tests in the four mission files, 34 fail on the predecessor: every finding regression, P1 and P3–P7, and the re-expressed I5/P3 and I7/I10 (`runs/tests-on-predecessor.out.json`). The preservation tests (P2 review closure, HOLD, MAINTAIN) pass on both | — | — |
| 15 | Properties | P1–P7 are tests in `test/r7ada-decision-authority.test.mjs`. Each guards a finding and fails on the predecessor, except P2 review closure, which preserves an approved property | — | — |
| 16 | Consumer audit | 8 consumers × 5 questions ([dossier/CONSUMER_AUDIT.md](dossier/CONSUMER_AUDIT.md)), each answer with its test, class or mutant | The answers drawn from code reading | — |
| 17 | Self-challenge | 16 classes, 228 cases, 0 violations (160 on the predecessor) (`runs/self-challenge.*.out.json`). Declared, not counted: C4c (standing projection, R1) and A2 (D44) | — | Classes beyond the 16 |
| 18 | Mutation | 16 bounded mutants of the new contracts, 16 killed by genuine tests: 14 by the mission's test file, 2 by the full suite. Copy-environment failures are subtracted (`runs/mutation.out.json`) | — | Mutants outside the new contracts |
| 19 | Regressions | Against the predecessor: R5 24/24, profiles 16/16, simulations 13/14 (T05: decision label only), R6 holdout 20/35. Every difference is named by ablation, 0 unclassified. No strength dose rose; all 58 run fields that rose are read against the ladders. R6-H35 is a recorded runner error (quality not unlocked by unreported weeks). Earlier judges: 35 probes, 20 identical, 11 path-only, 4 named, 0 failing. SSCTR kit: 43, of which 37 are identical, 1 differs in its clock only, and 5 are named | That R6 holdout and corpus inputs are regression evidence, never generalization | Fresh, unseen cases |
| 20 | Freeze identity | R7A-DECISION-AUTHORITY-FREEZE-1, source digest `3a7166b25aaf550f7692cc058f0e582b42e9eb7f74b9e361f23733b5e74ab244`, manifest digest `a500cdd94b8a4994a718029d4ee6efdc703e4f54de59d0855b5598c0d1afb224`, 85 files, policy `18ec48f3…`. `verify-r7ada.mjs --tests`: 14/14 read-only (`CoachingCore/r7/decision-authority/VERIFICATION_R7ADA.json`) | — | — |
| 21 | Freeze commit | On `claude/trusting-euler-04la8t`, pushed; the SHA is in [REVIEW_HANDOFF.md](REVIEW_HANDOFF.md) | — | — |
| 22 | Reviewer entry points | [REVIEW_HANDOFF.md](REVIEW_HANDOFF.md), [reviews/ENGINEERING_REVIEW_BRIEF.md](reviews/ENGINEERING_REVIEW_BRIEF.md) and [reviews/SSCTR_REGRESSION_REVIEW_BRIEF.md](reviews/SSCTR_REGRESSION_REVIEW_BRIEF.md), all pointing at the same freeze | — | — |

## Open for the Founder and the SSCTR (declared, not fixed)

- **R1, the standing projection between re-plans.** It is pre-existing and identical on the predecessor. A general fix fails 29 approved tests, because it changes what an unreviewed week means. Founder-owned.
- **R2, a mid-week return holds its first week** (E7 resolved most-restrictive-first). SSCTR ruling.
- **R3, plan versus history after a return week** (E7 versus C5). SSCTR ruling.
- O-1 and R41 are outside this gate.

No reviewer was run in this session. `R7A_EXIT_READINESS` is not declared. The Growth Layer patch is not applied.
