# Increment 06 · Perfil e ajustes, zonas de FC

Base: increment 05 (`894c4fe`). Simulator `RepMile-C-SwiftUI`, PT-BR.

| Screen | Content | Contract |
|---|---|---|
| Zonas de FC (71) | Reference card by `reference.kind` / `provenance` (estimated by age, entered, lab, chest strap) with its disclosure (C3: size and direction of the age formula's error, "você pode informar a sua"), custom-limits chip, other references read and not used (C1). Z1–Z5 exactly `minBpm…maxBpm`; percentages only from the engine's `abovePercent`/`upToPercent` (none for custom limits); bars on the 90 → maximum axis; zone colours `zona/1…5`. Conflict shows both values (C2). Unavailable states by reason (AGE_REQUIRED, AGE_OUTSIDE_ESTIMATE_RANGE, HOLD_NO_PRESCRIPTION, REFERENCE_CONFLICT); absent key after an answered calibration = "não calculado". "Só para desacelerar" (C11), "Três leituras separadas", "Funciona sem relógio". Editors: maximum (120–230) and Z1–Z4 limits through `setHeartRateProfile`, validation from the engine's `fields`, CONSENT_REQUIRED copy; erase through `eraseHeartRateProfile`. Hidden under a hold. | `HeartRateFiveZones`, `HeartRateProfileRequest` |
| Perfil e ajustes (70) | Avatar and week; HR zones entry; Apple Saúde status; consents (COACHING, HEALTH_SIGNALS, LEARNING) as explicit give/withdraw acts; erase health data (never readiness); erase account → record (`eraseAccount`) + this front's run recordings and index (`RunRecorder.eraseAllRecordings`) → erased state; language follows the iPhone; synthetic-mode notice. Account, subscription, sync and feedback need the backend (handoff §11). | `CoachingWriting` |

11 zone scenarios (`zones-<fixture>`) replay every `hr5r-*-presentation` capture.

## Tests

XCUITest 27/27 ([log](results/inc06-profile-zones/xcuitest.txt)); new: age-estimate zones equal the fixture and no "limiar/anaeróbico" (C8); custom limits without percentages; conflict shows both values; no-age reason; declared maximum saved and out-of-order limits refused by the engine's `fields`; account erasure reaches the erased state. RepMileUI unit 12/12; RunRecorder 8/8.

Visual: [71 age estimate](results/inc06-profile-zones/71-estimada-pela-idade-11024302.png) against `1102:4302`: same structure, chip, copy, colours and bars. The motion twin `785:5837` (strap bar animation) is not reproduced yet.

**REAL_ATHLETE_READY = NO.**
