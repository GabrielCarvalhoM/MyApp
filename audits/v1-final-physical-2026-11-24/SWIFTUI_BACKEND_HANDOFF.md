# RepMile V1: SwiftUI + backend implementation contract over the frozen CoachingCore

**For:** the first implementation mission after `REPMILE-COACHINGCORE-V1-FINAL-RELEASE-FREEZE`.
**Source of truth for the bytes:** `CoachingCore/v1/FINAL_RELEASE_FREEZE_V1.json`, verified by `node CoachingCore/scripts/v1-final-release-freeze.mjs --check`.
**Built on, not replacing:**
- `audits/v1-integration-boundary-2026-11-23/INTEGRATION_BOUNDARY_CONTRACT.md` (operations, custody unit, authorship, formats and time, limits);
- `audits/v1-final-physical-2026-11-24/NATIVE_OBLIGATIONS_FINAL.md` (what the app must implement and prove).

**Scope of this document:**
- It states what each layer owns and the exact shapes that cross the layers.
- It designs no screen, adds no sporting rule, and changes no engine behaviour. The new independent Figma decides how each state looks.
- Everything here is synthetic-validated. Real athletes wait for the gates in §12.

## 1. Layers and who owns what

```
SwiftUI (screens, copy, navigation, drafts)
   │  Swift values only; never JSON documents, never a prescription computed in Swift
Integration layer (Swift: "CoachingHost")
   │  one serial queue · JSContext · crypto host · store · anchor · trusted clock · HealthKit queue
CoachingCore bundle (JavaScriptCore): createIntegration + api.mjs createBoundary over the frozen engine
   │  store adapter {load, commit, remove, tombstone, tombstoneOf, raw}
Persistence (on-device file + Keychain)  ──(D2, later)──  Backend (backup / server time / account)
```

| Concern | SwiftUI | Integration layer | CoachingCore | Persistence / backend |
|---|---|---|---|---|
| Prescription, holds, readiness, return, dose | shows views only | never computes | **owns** | stores the sealed record |
| Authorship (athlete vs device) | athlete forms only | `submit` from UI, `importActivities` only from HealthKit code | refuses cross-author and boundary-owned fields | — |
| Identity (`eventId`, `athleteId`, ids) | never sets | sets the actor; fresh `clientRequestId` per user action | **assigns** | — |
| Integrity (HMAC chain, seals, anchor) | — | provides HMAC/compare (CryptoKit), the Keychain key and anchor | **computes and verifies** | keeps bytes as given |
| Time | shows `today` from the view | passes a trusted clock (§8) | refuses future/behind clocks per policy | server time reference (D1) |
| Drafts and offline queue | keeps drafts until `recorded` | the queue and retries | idempotency by `clientRequestId` | — |
| Erasure | the screens and confirmation | file, `.tmp`/`.lock`, anchor and key removal | erases health facts in the record | backup deletion (D2) |
| Logs and telemetry | none with health content | only `telemetryOf` output | `inventory.mjs` defines what is allowed | no payload content |

## 2. What the app consumes

| Item | Value |
|---|---|
| Freeze commit | the `commit` field of `CoachingCore/v1/FINAL_RELEASE_FREEZE_V1.json` |
| Runtime sources | the 87 files the record binds (`CoachingCore/src/**`, plus the 16 data files read by URL) |
| Entry points | engine `CoachingCore/src/v1-safety-index.mjs`; boundary `createIntegration` (`src/boundary/integration.mjs`) under `createBoundary` (`src/boundary/api.mjs`) |
| Validated bundle | `audits/v1-aif-p0-jsc-2026-11-17/ios/Sources/P0Host/Resources/coachingcore-p0.js`, 48 modules, sha256 in the record (`bundle.sha256`), assets listed by `assets-manifest.json` |
| Bundle floor | iOS 16 (the bundle uses `Array.prototype.toSorted`); the device tests ran on iOS 27.2.1 (D3 decides the minimum) |

**The production bundle (first task of the implementation mission):**
- The validated bundle publishes the P0 harness facade (`CoachingCoreP0`) and carries the boundary modules. The app needs its own thin facade.
- That facade is a JavaScript entry exporting JSON-string functions over `createBoundary({custody: createIntegration({...})})`.
- It is linked with the same `build/link.mjs`.
- It is application code, not engine code.

**Acceptance rules for that bundle:**
1. Its `build-manifest.json` lists every `CoachingCore/src/*` module with the sha256 the freeze binds, and nothing else of CoachingCore.
2. The linker's export gate reports 0 mismatches.
3. `core.json`, `int.json` and `final.json` replay on the device with 0 DIVERGED, by the rule of §10.

A bundle that fails any of these is not the frozen engine.

## 3. The JavaScriptCore host (already proven on iPhone 17 Pro Max)

The host installs one global, `__p0host`, before evaluating the bundle. Rename it in the app's facade if wished; keep the semantics.

| Function | Contract | Proven by |
|---|---|---|
| `readAsset(key) -> string\|null` | the bundled data files, SHA-256-verified against the manifest before boot; a changed asset refuses to boot | EquivalenceTests (tamper) |
| `existsAsset(key) -> bool` | — | — |
| `sha256(text) -> hex` | CryptoKit SHA256 over UTF-8 | all fixtures |
| `now() -> ms` | monotonic, timing only (never a decision clock) | — |
| `hmacSHA256(keyRef, text) -> hex` | CryptoKit `HMAC<SHA256>` over UTF-8; **the host resolves `keyRef` to the key bytes from the Keychain**; the key never crosses into JS; unknown ref → `""` (the bundle refuses loudly) | `testHmacVectors` 40/40; int/final `stored` digests |
| `constantTimeEqual(a, b) -> bool` | equal UTF-8 length and bytes, time independent of the position of a difference | `testHmacVectors` |

The other runtime rules:
- **One `JSVirtualMachine` and one `JSContext`**, confined to one serial queue off the main thread.
- **Every boundary call is on that queue.** This covers `submit` and `importActivities` (they share it: NATIVE 3.1), background delivery and app extensions. A second process (an extension) must take the store's lock (§6).
- **Only small JSON strings cross the bridge.** The custody document never crosses into Swift, except through the store adapter.

## 4. Operations the SwiftUI layer drives (through the facade)

**Every mutating call carries:**
- `actor: {athleteId}` (authenticated);
- `clientRequestId`: a fresh UUID per user action, reused only to retry that same action (NATIVE 7.7);
- `expectedVersion`: the `version` of the last answer or view.

**Answers:**
- success: `{ok:true, version, status?, action?, decisionId?, recorded, notRecorded, warningSignScreen, duplicates?, activities?, view}`;
- failure: `{ok:false, error:{code, message, ...}, state}`.

| User intent | `api.mjs` call | Notes |
|---|---|---|
| Onboarding / first plan | `onboard({actor, intake, consents, clientRequestId})` | intake schema §5.1; `consents` `{COACHING, HEALTH_SIGNALS, LEARNING}` explicit booleans |
| See the plan | `plan({actor, week?})`, `sessions({actor})`, `status({actor})` | read-only; the view is the only source of what is executable (§7) |
| Log a run | `logRun({...observation, eligibility?})` | **only** completed/minutes/response; a run with a stop, effort details or conditions goes through `submit` (NATIVE 7.3) |
| Log strength | `logStrength({sessionId, occurredOn, completed, minutes?, exercises, response, eligibility?})` | sets: `{reps, load:{value, unit, convention}, rir}` |
| Weekly check-in | `weeklyCheckIn({reports, check?, eligibility?})` | — |
| "Not 100%" | `notFeeling100({wellbeing, reports?, eligibility})` | §5.4 |
| Wellbeing check | `wellbeingCheck({check, reports?})` | — |
| Readiness after a hold | `declareReadiness({readiness, reports?, eligibility})` | the **only** way a clinical hold ends |
| A break | `reportBreak({interruption})` | a clinical reason routes to a human |
| Availability | `updateAvailability({changes}\|{unavailableDates})` | — |
| Preferences / coach | `setPreferences({volume?, difficulty?})`, `setCoach({profile})` | from next week |
| A change waiting | `accept`/`decline({decisionId, expectedVersion})` | a hold refuses adoption (`CHANGE_NOT_ADOPTABLE`) |
| Why it changed | `decision({decisionId})`, `history({actor})` | — |
| New plan / restart | `restart({intake, expectedVersion})` | the record is carried whole; may answer `ASK` |
| Consent | `setConsent({purpose, granted, expectedVersion})` | revocation always passes, even under a behind clock |
| Erase health facts | `eraseHealthFacts({eventIds, expectedVersion})` | §9 |
| Erase account | `eraseAccount({actor})` | §9 |
| HealthKit | integration `importActivities({actor, clientRequestId, expectedVersion, activities})` | device channel only, §11 |
| Record lost | integration `acknowledgeRecordLoss({actor})` | reachable only from the `RECORD_LOST`/`RECORD_ROLLED_BACK` screen |

## 5. Input schemas (SEC-INT-05 rest, SEC-INT-12)

**How the two findings close:**
- **SEC-INT-05 rest closes** when the onboarding form sends exactly the intake keys below and nothing else, and a schema test shows the admission accepts every shape the forms produce.
- **SEC-INT-12 closes** when the run and strength forms send exactly the `actual` keys below per channel, under the same kind of test.

What is decided:
- The keys and enumerations below are the ones the engine reads (from `r6-provenance.mjs`, `v1-f08.mjs`, `v1-run-calibration.mjs`, `admission.mjs` and the synthetic athlete of `test/v1int-helpers.mjs`).
- Free text goes nowhere except where a field says so. In V1 no form needs free text.
- Before real athletes, the boundary will refuse keys outside these lists (a later, reviewed boundary change), so the app must never send them.

### 5.1 Intake (`onboard`, `restart`)

```
{ version, synthetic:false, purpose, asOf: "YYYY-MM-DD", startDate: "YYYY-MM-DD", weeks: int, timezoneOffsetMinutes: int, learningConsent: bool,
  athlete: { id, ageYears, strengthTrainingMonths, runTrainingMonths, exerciseRotationPreference,
             eligibility: { status, assessedAt: "YYYY-MM-DD", pain, persistentPain, injury, illness, functionalLimitation, clinicalConcern },   // booleans
             goals: { run: { kind, event?: { kind, date } }, strength },
             equipment: [string],
             recent: { strengthDaysPerWeek, runDaysPerWeek, runMinutesPerWeek, longestRunMinutes },
             performanceAnchors: [ { kind, distance, seconds, date, measurement, rpe, tolerated } ],   // the run history at onboarding (SEC-INT-06)
             pause?: { reasonCategory, nonclinical: bool, weeks } },                                    // restart only
  schedule: { strengthDays:[0-6], strengthMinutes, runDays:[0-6], runMinutes, longRunMinutes, longRunDay, runTurn, strengthTurn } }
```

**Limits:** 64 KiB and arrays ≤ 512 (`LIMITS.intakeBytes`, `intakeArrayLength`). Workouts from before enrolment go only into `performanceAnchors`.

### 5.2 Athlete observation (ATHLETE channel; `submit`, and the `api.mjs` forms)

Allowed keys: `sessionId, occurrenceDate ("YYYY-MM-DD"), observedAt? (ISO with offset), actual, response, correctionOf?` (`OBSERVATION_KEYS.ATHLETE`).
- `actual.completed`: boolean, required.
- `actual` for a **run**:
  - `minutes`, `seconds?`, `distanceKm?`, `rpe?` (0–10);
  - `stop?: {reason}`, with reason one of `SYMPTOM | PACING | CONDITIONS | TIME | OTHER`;
  - `conditions?`, `walkBreaks?`.
- `actual` for **strength**: `minutes?` and `exercises: [{id, sets: [{reps, load: {value, unit: KG|LB, convention}, rir}]}]`.
- `response` enumerations (`r6-provenance.mjs RESPONSE`):

  | Field | Values |
  |---|---|
  | `performance` | `COMPATIBLE`, `UNDER`, `OVER`, `UNKNOWN` |
  | `recovery` | `COMPATIBLE`, `ADVERSE`, `UNKNOWN` |
  | `effort` | `ON_TARGET`, `EASIER`, `HARDER`, `UNKNOWN` |
  | `nextDayFunction` | `NORMAL`, `IMPAIRED`, `UNKNOWN` |

  Unknown is `UNKNOWN`, never omitted when the form asked.
- **Never sent** (`BOUNDARY_OWNED`): `eventId`, `athleteId`, `reportedAt`, `correctedAt`, `source`, `provider`, `canonicalActivityId`, `provenance`, `context`, `superseded*`, `conflicted`, `stale`, `sourceHash`, `localDate`, `fact`.
- A correction sends the report in force with `correctionOf` = the `eventId` the server assigned.

### 5.3 Device observation (DEVICE channel; `importActivities` only)

Allowed keys: `activityId (HKWorkout.uuid), activityType: 'RUN', sessionId?, observedAt (endDate, ISO with offset), actual, sourceQuality?` (`WEARABLE_FULL | WEARABLE_PARTIAL`).
- `actual` holds only what the device measured: `completed`, `minutes`, `distanceKm`, `measurement` (e.g. `GPS`), `gpsQuality?`, `heartRate?`.
- Nothing the athlete states (rpe, stop, response) goes on this channel.

### 5.4 F08 forms (wellbeing, check, readiness) and the screen

- **`eligibility`** (the warning-sign / eligibility screen):
  - `{status, assessedAt, pain, persistentPain, injury, illness, functionalLimitation, clinicalConcern}`;
  - status as the synthetic athlete sends it (`NONCLINICAL_CONFIRMED`); an unknown answer is a question again, never a guess.
- **`wellbeing`**:
  - `condition`, one of `MILD_INDISPOSITION | UNUSUAL_FATIGUE | MILD_ILLNESS | MINOR_DISCOMFORT | NEED_REST`;
  - `intent`, one of `REDUCE_LIGHT | REDUCE_SUBSTANTIAL | LIGHT_ACTIVITY_ONLY | REST`;
  - `days`;
  - `warningSigns`: the 15 booleans of `v1-f08.mjs WARNING_SIGNS` (`feverOrChills, chestPainPressureOrTightness, breathlessAtRest, palpitationsAtRest, faintingOrDizziness, painThatChangesMovement, swelling, injuryFromFallOrImpact, gettingWorse, bodyWideAches, exhaustionAtRest, vomitingDiarrhoeaNauseaOrAbdominalPain, moderateOrSevereCough, severeHeadache, severeNoseOrThroat`).
- **`readiness`**: `{declaredRecovered: bool, warningSigns: {15 booleans}, sports: {RUN: {ready}, STRENGTH: {ready, restrictions: []}}}`.
- **The warning-sign screen:** show it whenever an answer carries `warningSignScreen`, whatever the status (NATIVE 7.1). `presentation.readings` is the source between answers.

### 5.5 Admission limits the queue must respect (`admission.mjs LIMITS`)

| Limit | Value |
|---|---|
| Observation | 16 KiB |
| Request | 128 KiB |
| Observations per request (HealthKit chunk size) | 32 |
| Depth | 8 |
| Array | 64 |
| Keys per object | 32 |
| String | 512 |
| Id | 128 |
| Corrections per report | 16 |
| Device activities per session | 4 |
| Reports per day per channel | 8 |
| Past a limit, a report stating a stop, ADVERSE or IMPAIRED (`safetyExcess`) | 3 more |

A refusal is whole: nothing is recorded, and the answer says what to fix.

## 6. Persistence, anchor and key (proven on the device in the harness: `NativeCustody.swift`)

| Rule | Proof on iPhone 17 Pro Max |
|---|---|
| One file per athlete in Application Support, `tmp + fsync + rename + dir fsync`; success only after the rename | process killed after the rename: the retry answers `replayed`; killed before it: the earlier record, then recorded anew |
| File protection `completeUntilFirstUserAuthentication` | read **and** written while the device was locked |
| One writer: an `O_EXCL` lock per commit, compare-and-swap by version; leftover `.tmp`/`.lock` removed at start | 200 rounds of two writers: 200 wins, 200 refusals; stale lock cleaned after death |
| Anchor `{version, docMac}` per athlete in the Keychain, written after each commit; the integrity key in the Keychain, `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly` (`cku`) | readable while locked; survives process death |
| A failed write confirms nothing | `PERSISTENCE_FAILURE`, the earlier record unchanged |
| Reinstall | **the record file is deleted with the app, the Keychain items survive**, and the boundary answers `RECORD_LOST`. The app must handle this on first launch (§6.1) |

### 6.1 First launch after an install (an app obligation, physically confirmed)

On first launch, detected by a marker in the app container (never in the Keychain), the app must:
- **If a backup exists (D2):** restore it, then verify it against the anchor.
- **If no backup exists:** remove this app's leftover Keychain items (the anchors and the key) and start as a new install.

The athlete must never meet a `RECORD_LOST` that only a reinstall caused, unless the Founder's D2 decision wants that screen.

### 6.2 What the backend owns (none of it built here)

- A trusted server time (D1).
- Backup and restore of the sealed record (D2; the record is opaque bytes plus its anchor).
- Account erasure of any backup.

The backend never recomputes a prescription and never edits a record. Serving `RECORD_ROLLED_BACK` against the anchor is the app's job.

## 7. Views and states the screens render

`plan` returns `view`: `{state, version, programHash, today, weekIndex, weeks, sports{RUN,STRENGTH}, hold, pending, question, week{index, startDate, sessions[]}, lastDecision}`.
- A session carries: `{id, date, sport, role, turn, optional, status, executable, projected, prescription|null, explanation|null}`.
- **Only `executable: true` sessions may be started.**
- While `state === BLOCKED`, every prescription is `null` and `hold = {clinical, since, guidance:{level, wordingStatus}, exit:'READINESS_DECLARATION'}`.

| `state` | Meaning | Screen obligation |
|---|---|---|
| `VALID_PLAN` | plan in force | show the week |
| `PENDING_CONFIRMATION` | a change waits | accept/decline |
| `NEEDS_INPUT` | a question (`question.missingInputs`) | ask exactly that; later weeks are projections |
| `RETURNING` | a return/restart ramp | show as the view gives it |
| `BLOCKED` | a clinical hold (or an erasure that removed the evidence) | no training; the readiness path only |
| `INTEGRITY_FAILURE` | the record failed its seal | never an empty plan, never a rest day |
| `OPERATIONAL_ERROR` | technical failure (including `RECORD_LOST`, `RECORD_ROLLED_BACK`, `CLOCK_BEHIND_RECORD`) | the specific recovery screen by `error.code` |
| `NO_DATA` | `NOT_ENROLLED` / `GONE` | onboarding or account erased |
| `NOT_SYNCED` | the app's own queue | the app's own state; the server never returns it |

`REDUCED` exists in the vocabulary but V1 never returns it.

| `error.code` | What the app does |
|---|---|
| `CONFLICT_STALE_VERSION` | refresh the view, rebuild the request on the new version, resend with a **new** `clientRequestId` |
| `BUSY` | retry the same request (same id) after a short delay |
| `CONFLICT_IDEMPOTENCY_KEY` | a bug in the app (id reused for another request); never retry |
| `PERSISTENCE_FAILURE` | keep the draft; retry the same request; never show it as saved |
| `CLOCK_BEHIND_RECORD` | the "check date and time" screen; revocation and erasure still work |
| `BEFORE_RECORD_START` | set the item aside (HealthKit) or keep the draft and say the day is before the plan |
| `SCREEN_REQUIRED` | HealthKit waits; ask the athlete for the screen |
| `LIMIT_EXCEEDED`, `INVALID_*`, `UNKNOWN_FIELD`, `BOUNDARY_OWNED_FIELD` | an app bug (wrong shape); log the code only; keep the draft |
| `CORRECTION_TARGET_NOT_FOUND`, `CROSS_AUTHOR_CORRECTION`, `ALREADY_REPORTED` | offer the right path (correct own report; contest a device workout by the athlete's form, NATIVE 7.5) |
| `RECORD_LOST`, `RECORD_ROLLED_BACK` | the record-loss screen; `acknowledgeRecordLoss` only from there |
| `INTEGRITY_FAILURE`, `ENGINE_CONTRACT_VIOLATION`, `FORBIDDEN` | integrity screen; never plan over it; report the code |
| `CONSENT_REQUIRED`, `GONE`, `NOT_ENROLLED`, `CONFLICT_ALREADY_ENROLLED` | consent, account, onboarding, or read the plan that exists |

**Loading:**
- Every call is asynchronous on the engine queue.
- PF-0 p95 on device: full-plan review 285 ms, first plan 106 ms cold, boot 47 ms cold.
- The UI never blocks the main thread (max main-queue stall measured 9 ms).

## 8. Time (D1)

**The clock passed to `createIntegration({clock})`** is the device clock bounded by one of two references (Security SEC_FPV_R1 C3):
- **(i) A server reference.** The instant in an authenticated response from a server the project operates.
  - It exists only if V1 has such a server, which is a Founder decision. Apple's NTP and third parties' HTTP `Date` headers are not trusted references.
  - It is extended by a monotonic clock that counts sleep (`mach_continuous_time`), and invalidated at reboot.
- **(ii) A local reference.** The record's `lastAt` plus the monotonic time elapsed since that write, in the same boot session.

**An operation more than 300 s ahead** of the reference is refused before custody, with nothing written, and shown as "check date and time".
- **What was measured:**
  - the engine's own tolerance on observations: 299 s ahead → quarantined, 301 s → refused;
  - the boundary itself accepts an operation clock a day ahead, which is why the native bound is required (NATIVE 5.1).
- **With no reference yet,** the first server contact sets it.
- No trusted time source is invented on the device.

## 9. Erasure (G07)

- **`eraseHealthFacts({eventIds})`** erases the named F08 facts, the readings, the request record and the stored screen.
  - An erased hold leaves an erasure marker that **holds**: the view stays `BLOCKED` until a valid readiness declaration, whatever the clock (SEC-BC-R2-01 closed).
  - Deliveries wait for a new screen (`SCREEN_REQUIRED`).
  - **An erasure is never read as recovery or readiness.** This holds for every hold.
  - **One residual (SEC-FPV-01, before real athletes):** erasing a "not 100%" report that opened no hold (its warning signs not yet answered) drops its question with no marker, and the view shows the plan executable again. Writes and deliveries still need a new screen.
  - **Until a boundary state closes SEC-FPV-01,** the app shows no session as startable after any `eraseHealthFacts` until the athlete has answered a new screen.
- **The stop facts of the record of formats are kept as a safety retention** (session, report id, speaker and reason; no free text).
  - **Legal and Founder validation is required before real athletes.** The legal basis for keeping that retention after an erasure request is not presumed.
- **`eraseAccount`** plus the native side removes the store file, its `.tmp`/`.lock`, the anchor and the key, and (D2) any backup.

## 10. Equivalence rule for every future bundle or host change

| Verdict | Condition |
|---|---|
| IDENTICAL | every digest equal to the Node oracle |
| EXPLAINED_LIBM (RFC-NUMERIC-1) | only the Race Forecast's unrounded numbers differ; the canonical record (stored document without `carried`/`carriedMac`), the answers and the stored document without any `runForecast`/`carriedMac`, and the forecasts at 9 significant digits are all equal |
| DIVERGED | anything else; fails |

**On iPhone 17 Pro Max at the freeze:** every fixture had 0 DIVERGED, with the same EXPLAINED_LIBM step sets as JavaScriptCore on the Mac.

**Note:** the boundary keeps the last answer's forecast readings in `carried.presentation.readings` (a projection for the app). The stored bytes and `carriedMac` of a record written on the iPhone therefore differ from Node's in the last bit of a forecast number. A backend must never re-derive or compare those bytes across runtimes; it stores and returns them as opaque.

## 11. HealthKit and future wearables

- **Read only in V1:**
  - permissions: `HKWorkoutType`, `distanceWalkingRunning`, and `heartRate` only if a reviewed rule reads it;
  - `HKObserverQuery` + `HKAnchoredObjectQuery` with background delivery;
  - the anchor starts at the enrolment day.
- **Mapping:**
  - `uuid` → `activityId`, `endDate` → `observedAt` (with offset);
  - running only;
  - only device-recorded workouts (`HKMetadataKeyWasUserEntered` and other apps' writes are the athlete's statement, if at all);
  - deletions are not sent in V1.
- **The queue keys off `activities[{index, activityId, outcome, eventId, reason?}]`:**
  - a workout leaves the queue only on `RECORDED`/`DUPLICATE`;
  - one refused at admission is set aside and the rest of its chunk is re-sent;
  - a refused link is re-sent unlinked;
  - `ASK` waits for the athlete's next screen and goes with it;
  - nothing is ever retried forever;
  - at most one workout is linked per session, only when unambiguous.
- **Not validated here, and validated only in the app's integration stage:** background delivery with the app closed, watch observations and a real synced week. The harness has no HealthKit path, so nothing here claims them.
- **Future wearables** enter only through the DEVICE channel with the same shape. A new source or metric is a reviewed boundary change, not an app change.

## 12. What still blocks real athletes and the App Store (not the freeze)

See `NATIVE_OBLIGATIONS_FINAL.md` (status R and S) and `FINAL_REPORT.md` §10:
- the Founder's G07 retention confirmation and legal validation;
- D1 implemented and verified on the device;
- D2 backup;
- D3 minimum iOS;
- the SEC-INT-05/-12 schema tests;
- SSCTR-BC-01 (re-send with the screen);
- the C-BC-3 / SSCTR-BC-05 copy;
- background delivery and a real synced week;
- privacy of logs and crash reports;
- the R7-B0 records renewal before **2027-04-30**.
