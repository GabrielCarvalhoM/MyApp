# CoachingCore/r7 — DOMAIN_COACHING_R7-A artifacts

R7-A (semantic core hardening and state-composition stability) is the first of four planned R7 phases. It changes the meaning-preserving structure of the existing offline synthetic Node 24 reference; it adds no capability. Mission audit: `../../audits/domain-coaching-r7a-2026-10-27/`.

| File | What it is |
|---|---|
| `RUNTIME_FREEZE_R7A_<n>.json` | The candidate runtime the judges reviewed: every source and test file with its SHA-256, the policy hash (unchanged `18ec48f3…`), and the delta from the R6 closure runtime |
| `REGRESSION_R7A.json` | The R5 corpus, the R6 fresh holdout, the R6 development profiles and simulations replayed through the R6 closure runtime and the R7-A runtime, with every semantic difference. **Regression / challenge reuse only, never generalization evidence** |
| `REGRESSION_R7A_FREEZE1.json` | The same replay on R7A-FREEZE-1, kept as the judges' first round saw it |
| `CLASS_DISPOSITIONS_R7A.json` | Every inconsistency class investigated (proven or refuted, before and after) and every R6 item it touches, with its disposition |
| `READINESS_R7A.json` | The seven R7-A verdicts only |
| `FINAL_REPORT_R7A.md` | The final report (Portuguese) |
| `R7A_FINAL_HANDOFF.md` | The short handoff for a fresh R7-B session (only when R7-A exits READY) |
| `VERIFICATION_R7A.json` | Objective verification, written by `node scripts/verify-r7a.mjs --write` |

## Regression differences and their causes

Every difference between the R6 closure runtime and the current R7-A runtime, named by the fix that makes it (the same map is checked by `scripts/verify-r7a.mjs`, `EXPLAINED`). Ignored as byte-level only: the rows' `exposure` field, hashes and digests, the re-establishment note's "as of the last review", the week's recorded entry-week flag and the per-report input hashes of a carried fact.

| Input | Difference | Cause |
|---|---|---|
| R6 holdout H07 | Intake records of one exercise merged by content (a complete self-reported dose is kept; the incomplete record does not displace it) | C07 |
| R6 holdout H23 | A one-day schedule conflict asks instead of rearranging every later week — the only status change | C16 |
| R6 holdout H25 | The regain starts after the re-establishment of a not-known-load exercise | D53 |
| R6 holdout H26, H35 | Rows state the post-return set cap (same visible dose), so counterfactuals count more changed sessions; H26 also: the return-day threshold run without a report becomes the return's easy run | D53/D54; QE-R7A-02 |
| R6 holdout H29, H30 | A race finished faster than its window is complete, not partial | C18 |
| R6 holdout H32 | The carried record keeps the corrected fact | C10 |
| R6 holdout H17 | The return-day strength session without a report is re-planned from the reviewed state (2x6, an unlogged exercise re-established by effort) | QE-R7A-02 |
| R6 holdout H18 | HOLD keeps the repetition target (state only; the rows are the same) | QE-R7A-12 |
| R6 holdout H05, profile WALK_JOG_FIVE_DAYS | A projected return ceiling after a week whose every exposure was fitted to the athlete's time reads the fitted count (state only) | QE-R7A-14 |
| Simulations T04, T13 | Repetition targets no longer fall to a short set after HOLD or REGRESS | QE-R7A-12 |
| Simulations T05, T08 | The session on the return day without a report takes the return dose | QE-R7A-02 |

Every other input is identical: the R5 corpus (24/24), the other 15 profiles and the other simulation trajectories.

Commands (run from `CoachingCore/`): `node --test`; `node scripts/regress-r7a.mjs` (writes only `r7/REGRESSION_R7A.json`); `node scripts/queue-r7a.mjs` (once: appends the SSCTR's R7-A items to the human revalidation queue and writes `QUEUE_INTEGRATION_R7A.json` in the audit); `node scripts/verify-r7a.mjs` (read-only; `--write` writes only `r7/VERIFICATION_R7A.json`). Do **not** run `npm run verify`, `npm run simulate`, `npm run demonstrations:r6` or any `scripts/verify-r*.mjs` of an earlier mission: they read or write closed missions' evidence.
