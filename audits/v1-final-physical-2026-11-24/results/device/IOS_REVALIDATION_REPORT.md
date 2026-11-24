# iOS revalidation report: REPMILE CoachingCore V1 final physical validation (2026-11-24)

**Device:**
- iPhone 17 Pro Max (`iPhone18,2`), iOS 27.2.1, 11.7 GB RAM;
- Release configuration, no debugger attached;
- battery 60 % and charging, Low Power Mode off;
- thermal state `fair` at the start and `serious` during the performance run.

**Host:** Mac mini M4 (arm64), macOS 27.0 (26A428), Xcode 27.2 (27B52), Swift 6.4.2, Node v24.19.0.

**Bytes run:** CoachingCore as in commit `503945a` (unchanged since). Bundle `coachingcore-p0.js` sha256 `9cf3149b83540685b35c38a899805de1f37f04680afa972fd6cd70786bc14101`, 48 modules, 16 assets. Every test checked that the shipped bundle hashes to the build manifest.

**Harness:** plan B (`ios/DeviceHost`), `xcodebuild test-without-building`, logs in this folder. Team ID, UDID, Apple ID, device name and personal paths are removed.

| Criterion | Test (log) | Result | Decision |
|---|---|---|---|
| J5/P16 and restorations, asset tamper refused | `EquivalenceTests` (`equivalence.log`) | 5/5; 34 IDENTICAL + 4 EXPLAINED_LIBM; 0 DIVERGED | IOS_REVALIDATED |
| Core Safety & Lifecycle, five languages | `testCoreSafetyLifecycle` en/pt-BR/da/nb/cs (`core-*.log`) | 24 journeys, 171 steps, 0 DIVERGED, digest equal, anchors equal, `localeCompare` 0, in every language | IOS_REVALIDATED |
| Locale and sort coverage | `testLocaleAndSortCoverage` en (`focal-en.log`) | pass | IOS_REVALIDATED |
| libm bits | `testLibmBits` (`libm.log`) | 31 calls (exp 17, pow 14); differences only at RFC-NUMERIC-1 sites | IOS_REVALIDATED |
| Integration boundary (README §14 step 3) | `BoundaryTests/testIntegrationBoundary` (`boundary.log`) | int.json 78 steps, 0 DIVERGED; 56 steps whose stored bytes carry forecast readings explained by their final-driver replay | IOS_REVALIDATED |
| Journeys A–H, G07, SEC-BC-R2-01, D1, storage faults | `testFinalJourneys` | 184 steps, 0 DIVERGED (57 IDENTICAL, 127 EXPLAINED_LIBM); peak footprint 36.5 MB | IOS_REVALIDATED |
| The same over the native file store + Keychain anchor | `testFinalJourneysNativeStore` | 184 steps, 0 DIVERGED, the same EXPLAINED set; 46 Keychain anchor writes, 0 failures | IOS_REVALIDATED |
| CryptoKit HMAC equal to Node's | `testHmacVectors` | 40/40 direct, 40/40 through the JSContext; constant-time compare 3/3; key stored in the Keychain with class `cku` | IOS_REVALIDATED |
| One writer | `testConcurrentWriters` | 200 rounds: 200 wins, 200 refusals, 0 other; protection CompleteUntilFirstUserAuthentication | IOS_REVALIDATED |
| A failed write confirms nothing | `testWriteFailureConfirmsNothing` | `PERSISTENCE_FAILURE`, the earlier record unchanged, then recorded | IOS_REVALIDATED (simulated ENOSPC; no physically full disk) |
| Process death after the rename | `deathA1` then `recover` | stale `.lock` cleaned; record v2 verifies; retry `replayed` | IOS_REVALIDATED |
| Process death before the rename | `deathB1` then `recover` | `.tmp` and `.lock` cleaned; record v1 verifies; retry recorded (v2) | IOS_REVALIDATED |
| Device locked (after first unlock) | `testPhaseLockedDevice` (`locked.log`) | locked (a `.complete` canary unreadable); the boundary read and wrote over the native store; Keychain read/write OK | IOS_REVALIDATED |
| Reinstall | `reinstall1`, app deleted, `reinstall2` | **the file is gone, the Keychain items survive, read = `RECORD_LOST`** | IOS_REVALIDATED as behaviour; an app obligation follows (NATIVE 1.5) |
| Performance and memory (PF-0) | `PerformanceTests`, 10 × `ColdStartTests` (`device-budgets.txt`) | all PASS; see the table below | IOS_REVALIDATED (measured under `serious` thermal state while charging: errs high) |
| HealthKit background delivery, watch, a real synced week | — | **not run**: the harness has no HealthKit path | NOT_VALIDATED (app integration stage) |

**PF-0 results:**

| Measure | Result | Budget |
|---|---|---|
| Cold boot p95 | 47.4 ms | 1 s |
| Cold first plan p95 | 105.7 ms | 2 s |
| Review p95 | 285.4 ms | 1.5 s |
| Review worst case | 290.2 ms | 3 s |
| Footprint after GC | 13.2 MB | 150 MB |
| Lifetime peak footprint | 33.4 MB | 350 MB |
| Atomic write p95 | 3.3 ms | 50 ms |
| Max main-queue stall | 9 ms | 100 ms |

**Overall:** IOS_REVALIDATED for the engine, the integration boundary and the persistence contract the harness implements. HealthKit stays with the app.
