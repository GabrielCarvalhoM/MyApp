# R7-A RESIDUAL AUTHORITY — pre-freeze report (Founder request §29)

**Freeze:** R7A-RESIDUAL-AUTHORITY-FREEZE-1. Record: `CoachingCore/r7/residual-authority/RUNTIME_FREEZE_R7A_RESIDUAL_AUTHORITY.json`.

**Labels:** COMPROVADO means proven by a run recorded on the frozen bytes; INFERIDO means inferred by reading or by argument; NÃO TESTADO means not tested.

Every run named here is in `probes/EVIDENCE_RUNS_R7ARA.json`: 146 runs, each bound to source digest `e7172eb2…` at its start and its end. Outputs are in `probes/runs/`. The only failing run is the SSCTR kit's `regression` instrument, with the R6-H35 runner error, identical on the predecessor (EXPECTED_CORRECTION, §3).

**One evidence round was superseded (R7ARA-SELF-01).** The first complete round ran on source digest `259ab3ef…`.
- This mission's direction check found a dose rise in one named difference, in the SSCTR kit's `changes` probe, case A_E6:
  - a moderate break followed a return's completion, released and never run;
  - the return resumed return step 1 (30/30/45 min) instead of re-entering from the 15-minute entry.
- The runtime was corrected (contract E1.3), and the round ran again on the corrected bytes. Its record: [probes/SUPERSEDED_ROUND_R7ARA.json](probes/SUPERSEDED_ROUND_R7ARA.json).

| # | Item | COMPROVADO | INFERIDO | NÃO TESTADO |
|---|---|---|---|---|
| 1 | Baseline and branch | `claude/trusting-euler-04la8t` at `5434b32`, clean. The session branch `claude/r7a-residual-authority-closure` was created there. 4,745 files bound before the first edit ([BASELINE.json](BASELINE.json)) | — | — |
| 2 | Predecessor | R7A-DECISION-AUTHORITY-FREEZE-1 is intact: 85 of 85 files match its record (`3a7166b2…`, `a500cdd9…`). It is copied byte-exact to `decision-authority-freeze-source/`, and the freeze re-checks it | — | — |
| 3 | Reviewers' probes | Copied byte-exact into `probes/judges/`. Every git blob id equals the review branch's (table below). Run unchanged | — | — |
| 4 | Findings on the predecessor | QE-R7ADA-01: Q01 14 of 78 cells, Q01b 12 of 45. QE-R7ADA-02: Q06c 11 of 21. F4-X: continuous probe, ladder 10 and duration 4 of 34 cells. All as the reviewers reported, and again on this round | — | — |
| 5 | Root cause A (QE-R7ADA-01) | **Engineering probes:** Q01 0 of 78 (predecessor 14); Q01b 0 of 45 (12). Q04: T1–T3 0 of 18, T4 the same, T5 no violation (equal on both). Q05: 58 cases, 0 diverging (C preserved). **Self-challenge:** A5 delivery day and kind, 32 cases, 0 violations (24 on the predecessor); A5 last day, 14 cases, 0 (12 on the predecessor). **Tests:** the three QE-R7ADA-01 tests, P1 and P2 pass here and fail on the predecessor. **Mutation:** M1 and M2 are killed. **Ablation:** reverting A5 alone restores the predecessor's Q01 and Q01b, and nothing else differs because of it | That no other entry point decides before `factualReplan` (reading: one dispatch line in `evaluateProgram`) | Real wearable payloads |
| 6 | Root cause B (QE-R7ADA-02, EASY ceiling) | **Q06c:** 0 of 21 (predecessor 11). **Q06d:** `returnTo` is the executed dose (k=3 long 65, k=5 70, k=8 75; the predecessor 70, 75, 75). **Q06:** 3 of 28 flags, both declared readings: W-ADVERSE ×2 is OBS-2 (E1-B4); E-RELEASED 17 days is a row inside the pause, and the rows after the report are return step 0. The predecessor has 6. **Q06b:** long flags k=4 and k=8, after consolidation weeks (E1-a: the 65 and 75 resumed had been executed, and Q06c is clean); easy flags k=5, 6, 8, the eased first quality slot (D58); quality flags 5, the quality ladder, as on the predecessor (E1-B1); exit flags 0 (predecessor 3). **Easy return (SSCTR R7ASC):** 0 of 4 cells above the longest executed (predecessor 1). **Self-challenge:** easy short 27 cases, 0 violations (18 on the predecessor); easy moderate 9, 0 (5); repeated pause 4, 0 (2); return completion 4, 0 (4); restart switch 2, 0 (2). **Tests:** QE-R7ADA-02 and the moderate repeated pause (R7ARA-SELF-01) fail on the predecessor. **Mutation:** M3 and M4 are killed | — | The restart switch's long-run offset after one easy run of the new mode (E1-B3) |
| 7 | F4-X | **SSCTR continuous probe, 34 cells:** ladder 0 and duration 0 (predecessor 10 and 4). The weekly view flags 3 cells (predecessor 7): TOP5 EXIT_HELD/SHORT and ONE_CONTINUOUS_RUN/MODERATE on both athletes. These are byte-identical to the predecessor's cells, which your item 18 ruled correct; their weekly view counts the exit planned after the re-entry week, and RETURN walk days (NF-R7ADA-2). **Test** `SSCTR F4-X`: SHORT step 8, MODERATE step 7, LONG step 0 | — | — |
| 8 | F4 ladder | **SSCTR walk/jog matrix:** 0 of 99 above. **R7ASC walk/jog probe:** 0 of 12 cells above the recipe after a second return. **Self-challenge** walk/jog ladder and exit: 20 cases, 0 violations (4 on the predecessor). Tests `SSCTR F4` and `P6 walk/jog ceiling` pass | — | — |
| 9 | Properties P1–P4 | Tests in `test/r7ara-residual-authority.test.mjs`. P1, P2 and P3 fail on the predecessor. P4 (preservation) passes on both | — | — |
| 10 | HOLD and MAINTAIN | **HOLD (SSCTR R7ASC probe):** 240 cases; no load, reps, sets or tick up; no progression without evidence. **MAINTAIN:** 5 cells, 393 KNOWN rows, none above range or above the load last executed. Both outputs differ from the predecessor's in labels or clocks only. The tests `HOLD (Founder 1.3)` and `MAINTAIN (Founder §23)` pass | — | — |
| 11 | F1–F3, D53/D56–D59 | **The SSCTR kit (43 jobs, as the decision authority closure ran them):** 34 identical; 1 differs in its clock only (`trace-h25`); 8 differ, each named E1 by ablation (`b-probe`, `changes`, `d58`, `f-probe`, `holdout-detail`, `probe`, `systemic`, `x-items`). The R6-H35 `regression` run is identical to the predecessor's. **Direction:** no dose rises in any of them. In `changes`, a quality session after a short break runs easy at lower totals (A_E6 SHORT, a step down). `d58` differs only in run doses after returns, which are lower | That the strength-side outputs are untouched by E1 (`changes` and `d58` strength rows are identical) | — |
| 12 | Tests | **673 of 673** pass on these bytes. On the predecessor, 12 of the 22 tests in the two mission files fail: the 9 finding regressions and properties, and the 3 `r7ab` tests re-expressed in place. P4 and the `r7ab` P4 pass there | — | — |
| 13 | Self-challenge | **112 cases, 0 violations** (71 on the predecessor) in 8 classes: A5 delivery day and kind; A5 last day; walk/jog ladder and exit; easy short; easy moderate; repeated pause; return completion; restart switch. The last two run a short and a moderate second pause | — | Classes beyond the request's list (§25) |
| 14 | Mutation | **4 of 4 killed.** M1 bypasses the correction (4 tests fail); M2 resurrects the stale planned load (5); M3 uses the walk/jog projected exit as baseline (2); M4 uses the EASY projected dose as baseline (2) | — | Mutants outside the four named (§26) |
| 15 | Regressions | **Against the predecessor freeze:** R6 holdout 35/35, R5 corpus 24/24, profiles 16/16 and simulations 14/14, all identical. No dose rose. R6-H35 is the runner error on both. **Against STATE-EVIDENCE-FREEZE-1 (informational):** R6 16/35, R5 24/24, profiles 12/16 and simulations 13/14 identical, as on the predecessor | That R6 holdout and corpus inputs are regression evidence, never generalization | Fresh, unseen cases (§28) |
| 16 | Earlier judges | **35 earlier judge probes:** 22 identical; 13 differ, each named E1 by ablation, with no dose rising. **QE-R7ASC P01–P07, 12 jobs:** 10 differ in labels or clocks only; P03 and P05 are named E1 | — | — |
| 17 | Every difference named | **Comparison** (`COMPARISON_R7ARA.json`): 34 outputs differ from the predecessor. **Ablation** (`runs/ablation.out.json`): each one is restored by reverting one root cause, 32 by E1 and 2 by A5 (Q01, Q01b); none needs both. **Named** (`NAMED_DIFFERENCES_R7ARA.json`): 0 unnamed. **Direction** (`DIRECTION_R7ARA.json`): 456 changed dose readings, 422 lower. Each of the 34 that rose is explained: 30 walk/jog or easy sessions stepping down in kind, and 4 LATE readings that now equal EARLY (a correction upward). 0 rises remain | — | — |
| 18 | Freeze identity | The record binds the 86 files (source `e7172eb2…`, manifest `3d214fb5…`), the evidence, comparison, named differences, direction, mutation and regression files, and the git state; the commit is in [REVIEW_HANDOFF.md](REVIEW_HANDOFF.md) | — | — |

## Reviewer probes copied (git blob ids, equal to the review branches')

| File | Blob |
|---|---|
| `judges/qe/qe-r7ada-lib.mjs` | `e4704bfc2c639eea49f675dad79dfee7e8a9c2b1` |
| `judges/qe/qe-r7ada-Q01-correction-via-handlers.mjs` | `b45ff45ae20f7125038f602663ecebddfdaeac5d` |
| `judges/qe/qe-r7ada-Q01b-correction-via-handlers-robustness.mjs` | `0344c5aaf7ea660295650a601a7c50658cda45f8` |
| `judges/qe/qe-r7ada-Q04-temporal-and-order.mjs` | `8d5346559ff3e84bfba031be85c6ccdc9d755e4d` |
| `judges/qe/qe-r7ada-Q05-decision-context.mjs` | `65cebe0e905d608e7d3a8945db211710f96a8c8e` |
| `judges/qe/qe-r7ada-Q06-return-ceiling.mjs` | `61929d61d8153dc1bb8f7bd489b2af99af187461` |
| `judges/qe/qe-r7ada-Q06b-short-return-entry.mjs` | `5b8827aca636fc0c260cf40940b8f061caa03415` |
| `judges/qe/qe-r7ada-Q06c-return-base-run.mjs` | `1774c90d613598a5e25405696f351ce46717e915` |
| `judges/qe/qe-r7ada-Q06d-moderate-return-target.mjs` | `d858d0aea54f095cb15e8c7058fbebee3f78b5f7` |
| `judges/ssctr/ssctr-r7ada-lib.mjs` | `53bdebfd711ae01ec0be8491ff68a2644958654e` |
| `judges/ssctr/ssctr-r7ada-continuous-probe.mjs` | `c0b136fa0f28bfde1251d3db4c5b02a41e536554` |
| `judges/ssctr/ssctr-r7ada-walkjog-matrix-probe.mjs` | `cdae8b68ea40b3ee875e251f3e9eaa2a8c046936` |
| `judges/ssctr/ssctr-r7ada-progression-probe.mjs` | `09447b77250114326ff22971de79204535a9f28e` |
| `judges/ssctr/ssctr-r7ada-returnwalks-probe.mjs` | `2bf92b529a3e34abf440d5ad91d1a3bab75070c0` |
| `judges/ssctr/ssctr-r7ada-h25run-probe.mjs` | `b142bee3f28deaf89323d7235ba5baf0cebb09a3` |
