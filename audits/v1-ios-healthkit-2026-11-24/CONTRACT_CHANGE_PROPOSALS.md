# Front B (HealthKit): contract change proposals

Contract rev. 2 §11. Front B edited none of these files. Each proposal goes on with a local adapter inside `ios/Packages/HealthKitIngest`, so the interface the other fronts consume is unchanged. The integration mission decides.

## CCP-B-01: plan identity in `IngestContext`, so a session link survives a restart without guesswork

| | |
|---|---|
| **Reason** | `Ports.swift` says session ids repeat across plans ("never link across a restart by id alone"), but `IngestContext` and `PlannedRunSession` give B no plan identity. Contract §4.3 requires "no workout already delivered linked to that session", and B can only check that by id. |
| **Local adapter (in force)** | Conservative. A session id that B ever delivered a link to (in any plan) counts as taken for good (`HealthKitIngestor.linkTaken`). Effect: after a `restart` that reuses ids (`w0-run-d1` …), a new plan's session whose id was linked before gets **no** link. The workout goes unlinked: it is not lost and not double-counted, but it does not attach to the session. |
| **Exact diff** | `ios/Packages/IntegrationContracts/Sources/IntegrationContracts/Ports.swift`: add `public let programHash: String?` to `IngestContext` (A fills it with `view.programHash`; `init` gains `programHash: String? = nil`, so the change is source-compatible). B would store the `programHash` with each ledger link and compare `(programHash, sessionId)`. |
| **Impact** | A: one field in the context it already builds from the plan view. B: the ledger stores the hash, the link check compares pairs. C: none. |
| **Tests that change** | B: `QueueTests.testOneWorkoutPerSessionAndLinkKeptForever` gains a restart case. IntegrationContracts: `ContractConformanceTests` unchanged (additive). |

## CCP-B-02: a reason code for a series B refuses to build

| | |
|---|---|
| **Reason** | `HeartRateSeriesResult.unavailable(reason:)` documents NO_SAMPLES, NOT_A_WORKOUT_OF_THIS_RECORD, NOT_IN_V1 and PROTECTED_DATA_UNAVAILABLE. B's mapping can also refuse a series: more than 12 000 samples (it never thins), or a non-finite value. No documented code covers that. |
| **Local adapter (in force)** | `HeartRateSeriesMapping.series` returns `Result<HeartRateSeries, HeartRateSeries.Invalid>`. In V1 the provider always answers `NOT_IN_V1` (G-1/GAP-17), so no other code is emitted today. |
| **Exact diff** | In the comment of `HeartRateSeriesResult.unavailable` (`HealthIngest.swift`), add `SERIES_REFUSED (too many samples or an invalid value: B never repairs a series)`. Comment only, no type change. |
| **Impact** | A/C: a code to treat as "unavailable" (C: hide the component). Applies only once the heart-rate permission is decided. |
| **Tests that change** | None now. When the permission opens, B adds a provider test. |

## CCP-B-03 (minor): `ImportedWorkoutSummary: Codable`

| | |
|---|---|
| **Reason** | B persists the non-run summaries in its own file, and the shared type is not `Codable`. |
| **Local adapter (in force)** | `StoredSummary` (internal to B, never exposed) mirrors the five fields and converts to the shared type. |
| **Exact diff** | `HealthIngest.swift`: `public struct ImportedWorkoutSummary: Equatable, Sendable, Identifiable, Codable`. |
| **Impact** | None on A or C. B deletes `StoredSummary`. |
| **Tests that change** | None. |

No other shared type, port, fixture or the device lock needed a change.
