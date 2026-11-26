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

## CCP-B-04: two rules for the A ↔ B ports (no new type)

| | |
|---|---|
| **Reason** | Independent review R2 (QRE-B-R2-01, R2-02 a). (1) B calls `DeviceActivitySink.ingestContext()` / `deliver()` from inside its actor. If A awaits `DeviceQueueControl` while one of those calls is pending (for example, a serial queue on A's side held across the await), the two sides can wait on each other. B no longer waits on a running read for A's signals, but the rule belongs to the contract. (2) `purge(_:)` throws when B's file exists but cannot be read yet (before the first unlock) or cannot be written. G07 then depends on A trying again. |
| **Local adapter (in force)** | (1) `deliveryConditionsChanged()` and `readNow()` never wait for a read that is running; only the observer's completion waits (test `testASignalFromInsideTheHostNeverDeadlocks`). (2) A purge whose write fails fails closed: memory is already purged, nothing is read or sent, and every trigger retries the write. A purge that cannot read a locked file throws and writes nothing. |
| **Exact diff** | `Ports.swift`, doc comments only: on `DeviceQueueControl`, "A never awaits a `DeviceQueueControl` call while a `DeviceActivitySink` call from B is pending on A's side"; on `purge`, "If it throws (protected data unavailable, write failure), A keeps a durable purge intent and calls `purge` again at the next protected-data-available or launch, until it returns." |
| **Impact** | A: its purge after `eraseAccount` / `acknowledgeRecordLoss` / first-launch reconciliation needs a retry intent (A already keeps durable signals of this kind, e.g. SEC-FPV-01). B: none. C: none. |
| **Tests that change** | A: a test that a failed `purge` is retried. B: none (in place). |

## CCP-B-05 (OPEN-1 policy 2): one record per imported run, for C

| | |
|---|---|
| **Reason** | The Founder's decision of 2026-11-26 (`OPEN1_THIRD_PARTY_POLICY.md`) asks C to show, per run: imported from Apple Health, its origin (Garmin, Strava, other, unknown), consolidated duplicate, awaiting reconciliation, imported but not yet counted, partial data. `HealthIngestStatus` only has counts, and `ImportedWorkoutSummary` is for non-run workouts. No shared type carries a run's provenance or its state between Apple Health and the engine. |
| **Local adapter (in force)** | `HealthKitIngestor.importedRuns(since:) -> [ImportedRunRecord]` with `ImportedRunOrigin` and `ImportedRunStatus`, all in `HealthKitIngest/SameRunRule.swift`. C does not consume them until the integration adopts this proposal. |
| **Exact diff** | `HealthIngest.swift`: move `ImportedRunOrigin`, `ImportedRunStatus` and `ImportedRunRecord` there unchanged (public, `Equatable, Sendable`, the two enums `Codable`). On `HealthIngestStatusSource`, add `func importedRuns(since: Date) async -> [ImportedRunRecord]`, with an extension default returning `[]` so existing conformers still compile. B deletes its local copies. |
| **Impact** | C: a history and import list per run (no route, heart rate, pace or split field is promised). A: none (nothing reaches the engine). B: rename only. |
| **Tests that change** | IntegrationContracts: a conformance test that every `ImportedRunStatus` raw value is stable. B: none (the `ThirdPartyImportTests` already cover the states). |

## CCP-B-06 (OPEN-1 policy 2): the text of the authorities that still say "Apple sources only"

| | |
|---|---|
| **Reason** | Four texts still say third-party writes stay outside the DEVICE channel, which the Founder's decision changes. They are outside B's column: `PARALLEL_IMPLEMENTATION_CONTRACT.md` §4.1 item 4 and §4.4 OPEN-1, `NATIVE_OBLIGATIONS.md` 3.2, and `INTEGRATION_BOUNDARY_CONTRACT.md` §9.9 ("HealthKit sources"). |
| **Local adapter (in force)** | B implements policy 2 (`OPEN1_THIRD_PARTY_POLICY.md` §3–4). |
| **Exact diff** | (1) §4.4, OPEN-1 row: "RESOLVED (Founder, 2026-11-26): any app's measured run that reaches Apple Health enters the DEVICE channel; user-entered runs (`HKMetadataKeyWasUserEntered`) stay out; the same physical run is delivered once (B's `SameRunRule`); provenance is kept by B, `source.provider = HEALTHKIT` is the channel. Security acceptance of the residual risk: pending." (2) §4.1 item 4, last sentence → "Only measured workouts enter (user-entered ones are the athlete's statement); the app that recorded them is provenance, not a filter (OPEN-1 policy 2)." (3) NATIVE 3.2 and boundary §9.9, the same wording. |
| **Impact** | Documentation and Security sign-off only. No code in A, C or CoachingCore. |
| **Tests that change** | None. |

## CCP-B-07 (OPEN-1 policy 2): a reconciliation action

| | |
|---|---|
| **Reason** | Runs left in `AWAITING_RECONCILIATION` (`RECONCILE_PARTIAL_OVERLAP`, `RECONCILE_MEASUREMENTS_DISAGREE`, `RECONCILE_SEVERAL_RUNS`) only move when Apple Health changes (a deletion or a new version). The athlete has no way to say "this one is my run". |
| **Local adapter (in force)** | None. The state is kept and exposed (`reconciliationGroup`, `statusCode`), but nothing in B lets anyone choose. The runs are never lost and never double-counted; they just do not reach the engine. |
| **Exact diff (proposal)** | A port implemented by B and called by C: `func resolveReconciliation(group: String, keep activityIds: Set<String>) async throws`. B refuses a set in which two runs overlap by more than `SameRunRule.touchingTolerance`, since two of them would count the same minutes twice. The kept runs are delivered by the normal rules. The others become `CONSOLIDATED_DUPLICATE` of the kept run they overlap most, recorded as the athlete's choice. This covers "this one is my run" (one id) and, for a `RECONCILE_SEVERAL_RUNS` group, "these are distinct runs; the long one is a copy" (QRE-B-O1-03). "Keep two runs that overlap" is left out on purpose: overlapping minutes are one person's one run (G-3, Core + SSCTR). The group id is resolved against the current state; a group that changed since C read it is refused (`RECONCILIATION_STALE`). |
| **Impact** | C: a screen (Product/UX). B: the action, stored in its file and erased by `purge`. A: none. |
| **Tests that change** | B: a resolution test through the Node boundary (one row). |

No change to `CoachingCore` is proposed: the boundary admits every DEVICE run B now sends, and the original app stays in B's file (a `source.origin` field on the boundary row would be a CoachingCore change, and V1 does not need it).

No other shared type, port, fixture or the device lock needed a change.
