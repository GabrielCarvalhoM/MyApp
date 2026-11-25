# REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-2

A versioned amendment, the successor of REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-1. It is recorded **beside** both earlier records and rewrites neither; it is not a new freeze cycle.

- **Record:** `CoachingCore/v1/HR5_RUNNA_AMENDMENT_V1.json`
- **Verifier:** `node CoachingCore/scripts/v1-hr5-runna-amendment.mjs --check`
- **Narrative inputs:** [AMENDMENT_INPUTS.json](AMENDMENT_INPUTS.json)

## What it binds and proves

1. **The two earlier records are untouched:**
   - `FINAL_RELEASE_FREEZE_V1.json` is byte-identical to its commit `6482749`;
   - `FIVE_ZONE_AMENDMENT_V1.json` is byte-identical to its commit `bec39c5`.
2. **Of the files amendment-1 binds,** every one is byte-identical except the five declared amended files. For each of those, the diff from the bound bytes is the recorded one:
   - `src/v1-heart-rate-zones.mjs` (revision 2);
   - `src/v1-safety-index.mjs` (the profile in the composed entry);
   - `src/boundary/integration.mjs` (the carried profile record, sequence, the two operations, and the review fixes);
   - `src/boundary/api.mjs`;
   - `src/boundary/inventory.mjs`.
3. **`src/v1-run-calibration.mjs` is byte-identical** to the bytes amendment-1 binds, so the three-zone `heartRateZones` and every session's guidance are unchanged.
4. **The files the runtime now reads besides them** are present and bound:
   - `src/v1-heart-rate-profile.mjs`;
   - `v1/HEART_RATE_FIVE_ZONE_V2.json`;
   - `audits/v1-hr5-runna-parity-2026-11-25/reviews/ssctr/SSCTR_HR5R_RECORDS.json`.

   The two files it no longer reads, the revision-1 values and SSCTR_HR5_RECORDS, are kept byte-identical as history.
5. **Nothing else in CoachingCore changed** since `4850560` except the declared files:
   - the amended ones above;
   - the rewritten `test/v1hr5-five-zones.test.mjs`;
   - the added ones: profile module, V2 values, this verifier, `test/v1hr5r-boundary.test.mjs`, `test/v1hr5r-successors.test.mjs`;
   - the record itself.

   No file is untracked.
6. **The amended JavaScriptCore bundle,** `audits/v1-hr5-runna-parity-2026-11-25/native/ios/Sources/P0Host/Resources` (the bundle that ran on the Mac):
   - its sha256 is its manifest's;
   - every CoachingCore module it lists is the bound source;
   - every asset is the bound data file it copies.
7. **The values** are the pinned bytes. The enabling state is the recorded one: V1X-RUN-HR-FIVE-ZONE is enabled by SSCTR-HR5R-RECHECK-r2.

## The earlier verifiers on this line

`v1-final-release-freeze.mjs --check` and `v1-five-zone-amendment.mjs --check` fail **by design**, and only on files these amendments declare. `test/v1hr5r-successors.test.mjs` proves it, as amendment-1's own successor test did for the original freeze.
