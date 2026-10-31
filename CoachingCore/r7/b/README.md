# R7-B — runtime binding of the V1 coaching repertoire

DOMAIN_COACHING_R7-B binds the B0 catalog **R7B0-CATALOG-2** (`ceee276a…`) to the Coaching Core runtime under the SSCTR r2 record conditions. It is **CLOSED NOT_READY with explicit blockers** (2026-10-31): start at [R7B_CLOSURE_HANDOFF.md](R7B_CLOSURE_HANDOFF.md). Mission records: [`audits/domain-coaching-r7-b-2026-10-31/`](../../../audits/domain-coaching-r7-b-2026-10-31/).

| File | What it is |
|---|---|
| [R7B_CLOSURE_HANDOFF.md](R7B_CLOSURE_HANDOFF.md) | The closure: gates, the explicit blockers with their required changes, what holds, the next mission |
| [`../../src/r7b-repertoire.mjs`](../../src/r7b-repertoire.mjs) | The binding: catalog bytes check, per-record SSCTR authority, configurations, selection order, relations, ladders, rotation eligibility, conventions, thresholds (B0-F05), archetypes, the template builder |
| [F01_F09_R7B.md](F01_F09_R7B.md) | Disposition of B0-F01 … B0-F09 (baseline → target → change → test → status) |
| [CONFORMANCE_R7B.json](CONFORMANCE_R7B.json) | Catalog ↔ runtime matrix (revision R7B-CONFORMANCE-2): every SSCTR r2 condition and every family, relation, placement rule, later-gate item, witness, reason, template, field and section, with status, runtime consumer and test; `fixCycle` lists every review finding's disposition and owner |
| [R7B_REVIEW_HANDOFF.md](R7B_REVIEW_HANDOFF.md) | Input to the first reviews (FREEZE-1), with the declared items R7B-DECL-01 … 12 |
| [R7B_RECHECK_HANDOFF.md](R7B_RECHECK_HANDOFF.md) | Input to the one narrow recheck (FREEZE-2): the change per finding, the revised and new declared items |
| `RUNTIME_FREEZE_R7B_2.json`, `VERIFICATION_R7B_2.json` | **R7B-RUNTIME-REPERTOIRE-FREEZE-2** (the final R7-B runtime), written once by `scripts/freeze-r7b-2.mjs`; verify with `node scripts/verify-r7b.mjs --freeze 2 [--tests]` |
| `CONFORMANCE_R7B_2.report.json`, `REGRESSION_R7B_2.json`, `REGRESSION_R7B_2_VS_FREEZE1.json`, `MUTATION_R7B_2.json` | FREEZE-2 evidence (`scripts/conformance-r7b.mjs`, `regress-r7b.mjs` against R7-A and against FREEZE-1, `mutate-r7b.mjs`; each read-only unless `--write`, with `--out`) |
| `RUNTIME_FREEZE_R7B.json`, `VERIFICATION_R7B.json`, `CONFORMANCE_R7B.report.json`, `REGRESSION_R7B.json`, `MUTATION_R7B.json` | R7B-RUNTIME-REPERTOIRE-FREEZE-1 and its evidence, superseded; they verify at commit `4995d58` |
| [`fixtures/helpers.mjs`](fixtures/helpers.mjs) | Synthetic test fixtures of the R7-B suites |

Run from `CoachingCore/`: `npm ci`, then `node --test`. Never run `npm run verify` or a closed mission's `verify-r*` script (they rewrite closed evidence), and never `scripts/mutate-r7b.mjs` while another process reads the sources (it edits them in place and restores them).
