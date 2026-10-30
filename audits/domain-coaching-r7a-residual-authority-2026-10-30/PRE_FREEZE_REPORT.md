# R7-A RESIDUAL AUTHORITY — pre-freeze report (Founder request §29)

**Freeze:** R7A-RESIDUAL-AUTHORITY-FREEZE-1. Record: `CoachingCore/r7/residual-authority/RUNTIME_FREEZE_R7A_RESIDUAL_AUTHORITY.json`.

**Labels:** COMPROVADO means proven by a run recorded on the frozen bytes; INFERIDO means inferred by reading or by argument; NÃO TESTADO means not tested.

Every run named here is in `probes/EVIDENCE_RUNS_R7ARA.json`, bound to source digest `cd7e60b1…` at its start and its end. Outputs are in `probes/runs/`.

| # | Item | COMPROVADO | INFERIDO | NÃO TESTADO |
|---|---|---|---|---|
| 1 | Baseline and branch | `claude/trusting-euler-04la8t` at `5434b32`, clean. The session branch `claude/r7a-residual-authority-closure` was created there. 4,745 files bound before the first edit ([BASELINE.json](BASELINE.json)) | — | — |
| 2 | Predecessor | R7A-DECISION-AUTHORITY-FREEZE-1 is intact: 85 of 85 files match its record (`3a7166b2…`, `a500cdd9…`). It is copied byte-exact to `decision-authority-freeze-source/`, and the freeze re-checks it | — | — |
| 3 | Reviewers' probes | Copied byte-exact into `probes/judges/`. Every git blob id equals the review branch's (table below). Run unchanged | — | — |
| 4 | Findings on the predecessor | QE-R7ADA-01: Q01 14 of 78 cells, Q01b 12 of 45. QE-R7ADA-02: Q06c 11 of 21. F4-X: continuous probe, ladder 10 and duration 4 of 34 cells. All as the reviewers reported | — | — |
| 5 | Root cause A (QE-R7ADA-01) | _[round]_ | That no other entry point decides before `factualReplan` (reading: one dispatch line in `evaluateProgram`) | Real wearable payloads |
| 6 | Root cause B (QE-R7ADA-02, EASY ceiling) | _[round]_ | — | The restart switch's long-run offset after one easy run of the new mode (E1-B3) |
| 7 | F4-X | _[round]_ | — | — |
| 8 | F4 ladder | _[round]_ | — | — |
| 9 | Properties P1–P4 | Tests in `test/r7ara-residual-authority.test.mjs`. P1–P3 fail on the predecessor; P4 (preservation) passes on both | — | — |
| 10 | HOLD and MAINTAIN | _[round]_ | — | — |
| 11 | F1–F3, D53/D56–D59 | _[round]_ | — | — |
| 12 | Tests | _[round]_ | — | — |
| 13 | Self-challenge | _[round]_ | — | Classes beyond the request's list (§25) |
| 14 | Mutation | _[round]_ | — | Mutants outside the four named (§26) |
| 15 | Regressions | _[round]_ | That R6 holdout and corpus inputs are regression evidence, never generalization | Fresh, unseen cases (§28) |
| 16 | Earlier judges | _[round]_ | — | — |
| 17 | Freeze identity | _[freeze]_ | — | — |

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
