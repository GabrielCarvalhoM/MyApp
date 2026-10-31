# R7-B — runtime binding of the V1 coaching repertoire

DOMAIN_COACHING_R7-B binds the B0 catalog **R7B0-CATALOG-2** (`ceee276a…`) to the Coaching Core runtime under the SSCTR r2 record conditions. Mission records: [`audits/domain-coaching-r7-b-2026-10-31/`](../../../audits/domain-coaching-r7-b-2026-10-31/). Reviews start at [R7B_REVIEW_HANDOFF.md](R7B_REVIEW_HANDOFF.md).

| File | What it is |
|---|---|
| [`../../src/r7b-repertoire.mjs`](../../src/r7b-repertoire.mjs) | The binding: catalog bytes check, per-record SSCTR authority, configurations, selection order, relations, ladders, rotation eligibility, conventions, thresholds (B0-F05), archetypes, the template builder |
| [F01_F09_R7B.md](F01_F09_R7B.md) | Disposition of B0-F01 … B0-F09 (baseline → target → change → test → status) |
| [CONFORMANCE_R7B.json](CONFORMANCE_R7B.json) | Catalog ↔ runtime matrix: every SSCTR r2 condition and every family, relation, placement rule, later-gate item, witness, reason, template, field and section, with status, runtime consumer and test |
| `CONFORMANCE_R7B.report.json`, `REGRESSION_R7B.json`, `MUTATION_R7B.json` | Evidence written by `scripts/conformance-r7b.mjs`, `scripts/regress-r7b.mjs`, `scripts/mutate-r7b.mjs` (each read-only unless `--write`) |
| `RUNTIME_FREEZE_R7B.json` | R7B-RUNTIME-REPERTOIRE-FREEZE-1, written once by `scripts/freeze-r7b.mjs`; verify with `node scripts/verify-r7b.mjs [--tests]` |
| [`fixtures/helpers.mjs`](fixtures/helpers.mjs) | Synthetic test fixtures of the R7-B suites |

Run from `CoachingCore/`: `npm ci`, then `node --test`. Never run `npm run verify` or a closed mission's `verify-r*` script (they rewrite closed evidence).
