# V1HR5R — Native validation report

All athletes and records are synthetic. Logs are in `results/mac/`. The UDID, team ID, Apple ID and personal paths are left out.

## 1. What ran

- **Bytes:**
  - the CoachingCore of the closing tree, after QRE rounds 1–2;
  - values `784ba7fe…` and the code bytes SSCTR-HR5R-RECHECK-r2 binds;
  - the amended bundle **`d087ad51b37dfc4e35bcca60cfba55ee5ad854cfb5a6e67ba0ef3e7411829d44`**: 50 modules (the profile module among them), 18 assets (the revision-2 values and the new enabling records among them), export gate 0 mismatches over 811 bindings.
- **Build:** [`native/build.sh`](native/build.sh), copied from V1HR5's.
  - The historical linker and oracles run unchanged under `native/redirect.mjs`, and write only into this mission's copy of the iOS package.
  - It checks that the historical package and V1HR5's evidence are untouched, that the bundled values equal the engine pin, and that the records are bundled.
  - It is deterministic: `--twice` leaves no diff.
- **Fixtures,** all regenerated over the corrected engine: `j5`, `p16`, `focal`, `core`, `int`, `final`, `hmac`, and `hr5.json`.
  - `hr5.json` now holds this mission's journeys (`mac/hr5r-oracle.mjs` and `hr5r-driver.js`): 14 journeys and 98 steps, production authority on.
  - It also holds its module-level unit input: 111 maxima (120–230), 63 ages, readings on and between the edges, custom limits, and the classifier (strap and optical, defaults and given limits).

## 2. Node × macOS JavaScriptCore

As before, a step is **IDENTICAL** when every digest equals Node's, and **EXPLAINED_LIBM** when only the Race Forecast's ULP noise (RFC-NUMERIC-1) differs while every other digest and the readable five- and three-zone summaries are equal. A step is **DIVERGED** otherwise, which fails the test.

| Fixture | Mac JSC | Frozen bundle (2026-11-24) |
|---|---|---|
| final, memory store (184 steps) | **0 DIVERGED**: 57 IDENTICAL, 127 EXPLAINED_LIBM | 57 / 127 / 0 (the same pattern) |
| final, native file store + Keychain anchor | the same; 66 anchor writes, 0 Keychain failures | the same |
| int (78 steps) | 0 DIVERGED: 22 IDENTICAL, 56 explained by their final replay, 0 unexplained | 56 explained |
| **hr5r, memory store (98 steps)** | **0 DIVERGED**: 14 IDENTICAL, 84 EXPLAINED_LIBM | — (new) |
| **hr5r, native file store + Keychain** | **0 DIVERGED**; 25 anchor writes, 0 Keychain failures | — |
| **five-zone module units** | **identical to Node**: 111 maxima; age 30 gives `123,153,169,184` | — |
| Core Safety & Lifecycle (171 steps) | 0 DIVERGED | the same |
| J5 / P16, restorations, tampered asset refused | pass | pass |

`P0Host` package: **29 tests, 0 failures, 6 phase tests skipped by design** (locked device, reinstall and process death run only as device phases). Log: [`results/mac/swift-test-mac.log`](results/mac/swift-test-mac.log); verdict counts: [`results/mac/verdicts.json`](results/mac/verdicts.json).

**The journeys the Mac replayed, each equal to Node:**

| Journey | Five zones |
|---|---|
| `hr5r-age30` (no device) | AGE_ESTIMATE 190: Z1 ≤123, Z2 124–153, Z3 154–169, Z4 170–184, Z5 ≥185. It survives a week and a reopen; a tampered cue (170 → 171) gives `INTEGRITY_FAILURE`. |
| `hr5r-declared` | declared 195 gives 126 / 157 / 173 / 189; custom limits 130 / 150 / 165 / 180 survive a reopen and a week; cleared, it is back to 190. A tampered override gives `INTEGRITY_FAILURE`. |
| `hr5r-strap-above` (40 y, strap 186) | OBSERVED_MAXIMUM 186: 120 / 150 / 165 / 180 |
| `hr5r-strap-below` (30 y, strap 186) | AGE_ESTIMATE 190; the strap value is shown and classified Z5 as a single value |
| `hr5r-lab` (25 y, lab 190) | LAB_MEASURED_MAXIMUM 190 |
| `hr5r-conflict` (40 y, strap 192, lab 180) | AGE_ESTIMATE 180; the conflict is shown |
| `hr5r-noage` | AGE_REQUIRED; then a declared 188 gives zones |
| `hr5r-hold` | CLINICAL_HUMAN_REQUIRED, withheld; a declaration during the hold is recorded and still withheld; the hold persists across a reopen |
| `hr5r-invalid` | four refusals, a replayed retry, `CONFLICT_IDEMPOTENCY_KEY` |
| `hr5r-restart` (age 31) | the declared maximum is kept, the age in force is 31 |
| `hr5r-optical` | AGE_ESTIMATE; the optical 176 is classified Z4 with the optical caveat |
| `hr5r-age18` / `-age80` | 202 / 140 |

## 3. iPhone: NOT RUN (blocked)

The physical device could not be used in this session.

- **The iPhone was unreachable.** `xcrun devicectl list devices` lists the iPhone 17 Pro Max (iPhone18,2, iOS 27.2.1) as `unavailable`, and `xctrace` lists it under "Devices Offline". This was checked three times, the last just before closing.
- **Signing failed.** `xcodebuild build-for-testing` (plan B host, Release) stopped at signing: `No Accounts: Add a new account in Accounts settings` and `No profiles for 'fit.vilumo.p0.devicehost.<TEAM>'`. Xcode has no signed-in account in this session, and the provisioning-profile folder is empty.

No device result is claimed. The bundle, fixtures and test sources the iPhone needs are committed. Section 4 gives the exact steps.

## 4. To run on the iPhone

The Founder needs to do two things on the Mac mini: sign in to Xcode (Settings → Accounts), and connect and unlock the iPhone (trusting the Mac). Then run, from `audits/v1-hr5-runna-parity-2026-11-25/native/ios/DeviceHost`:

```sh
TEAM=<team id>; DD=<scratch>/dd-device
tools/device-lock/with-device.sh integration --wait -- xcodebuild build-for-testing -scheme P0DeviceHost -configuration Release -destination 'generic/platform=iOS' -derivedDataPath $DD DEVELOPMENT_TEAM=$TEAM -allowProvisioningUpdates
for t in P0DeviceTests/EquivalenceTests P0DeviceTests/BoundaryTests P0DeviceTests/FocalTests/testCoreSafetyLifecycle; do
  tools/device-lock/with-device.sh integration --wait -- xcodebuild test-without-building -scheme P0DeviceHost -configuration Release -destination platform=iOS,id=<UDID> -derivedDataPath $DD DEVELOPMENT_TEAM=$TEAM "-only-testing:$t"
done
```

(`tools/` is relative to the repository root.)

`BoundaryTests` includes `testFiveZoneJourneys`, `testFiveZoneJourneysNativeStore` and `testFiveZoneModuleInJavaScriptCore`. Expect the same verdicts as the Mac: 0 DIVERGED, units identical, 111 maxima.

## 5. Verdict

- **MACOS_JSC_VALIDATED:** YES.
- **IPHONE_PHYSICAL_VALIDATED:** NO. Blocked by the device being offline and by signing; ready to run.
