# R7-B checkpoint

2026-10-31 · branch `claude/domain-coaching-r7-b` (from the B0 closure `c66966e`). Status: **IN PROGRESS — implementation**.

## Baseline

- HEAD = `c66966e` at start; working tree clean; `node --test` 673/673 (≈40 s, Node 24.19.0).
- Catalog R7B0-CATALOG-2 `ceee276a…`; SSCTR r2 records (13, all APPROVE_WITH_CONDITIONS, SUPPORTED_WITH_LIMITS, bound to the catalog hash); policy R6-POLICY-5 `18ec48f3…`.

## Plan (increments)

1. Binding module `src/r7b-repertoire.mjs`; catalogue from the catalog; conventions, laterality, contextual roles; strength templates (selection order, admissibility, goal context, calf rule, PULL coverage). Run the suite; record every superseded-representation test change.
2. Rotation (B0-C06), novice density (B0-C08), CMP.I11 + content stage (B0-C11), strides optionality (B0-C01 c8), archetype (B0-C12), thresholds trace (B0-F05), 5K fallback + later-gate disclosures (B0-C10), bodyweight disclosures, runtime guards.
3. Familiar repeated bouts (B0-C02), graduation (B0-C01), block-boundary review (ladder offers B0-C07, MAIN change with reason B0-C06, novice release, block summary), reason-based substitution, feasibility trace, program progression summary.
4. R7-B tests, conformance matrix, F01–F09 matrix, bounded mutation probes, regression evidence, freeze + read-only verification.
5. Independent gates (SSCTR, Engineering, Quality) on the frozen bytes; closure records.

## Rules for any later session

Never run `npm run verify` or any closed `verify-r*` script. Never edit the policy, the B0 catalog/schema/foundation, or closed evidence. Mission/ledger are insert-only (use an append script that checks the prefix).
