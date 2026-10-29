# DOMAIN CLOSURE R3

Read [FINAL_REPORT](FINAL_REPORT.md), [VERIFICATION](VERIFICATION.json), [INPUT_CONTRACT](INPUT_CONTRACT_R3.md) and [TRUE_COVERAGE_BASELINE](TRUE_COVERAGE_BASELINE_R3.json). Run from CoachingCore: `npm test`; `npm run simulate`; `npm run verify`. Canonical reference API: [r3-index.mjs](../src/r3-index.mjs); unchanged legacy/R2 API: `src/index.mjs`. No production integration.

The input contract describes pure source normalization and canonical validation. A separate [material consumption stage](../src/r3-consumption.mjs) checks request/family-specific leaf fields, nonempty dose/history structures and explicit unknown states before the [runtime consumer](../src/r3-runtime.mjs) can count semantic consumption. A malformed material representation is a software-contract ASK, excluded from useful ASK; passing this stage does not establish sporting sufficiency or dose readiness.
