# CoachingCore Integration Boundary: contract (V1INT-1)

**Mission:** CoachingCore Integration Boundary & Custody Foundation (Founder, 2026-11-23). **Line:** `claude/v1-cc-integration-foundation`, worktree `.claude/worktrees/v1-cc-integration`, from `e44d855` (COACHINGCORE-V1-CORE-SAFETY-FREEZE-7, binds `0c989da`, `--check` 49/49). Synthetic athletes only. Nothing pushed or merged.

## 1. What the boundary is

```
native layer (SwiftUI forms · HealthKit delivery · Keychain · file store)
   │  one serial queue; each call names its entry point = its channel
   ▼
integration.mjs  ── admission.mjs (shape, size, identifiers, boundary-owned fields)
   │                 authorship (channel, origins, correction chains), one clock, per-session/day bounds
   ▼
custody.mjs (V1CIB-CUSTODY-3, amended in reconcile only): ids, clock, athlete binding, seal + keyed chain, holds twice, idempotency, consent, erasure
   ▼
v1-safety-index.mjs (FREEZE-7, unchanged): every prescription, hold, question and record
   │
   ▼  canonical answer → custody document + carried records (one atomic write) → projections for the app
```

- **CoachingCore** decides: what is admitted as evidence, every prescription, adaptation, hold, question, pause and restart. Nothing here changes a rule.
- **The app** collects, identifies the athlete and the channel, keeps the store and the anchor, and shows what the engine answered.
- **The boundary** checks origin and structure, binds authorship, keeps the record exactly as the engine returned it, hands it back, and reports every refusal. It never invents an execution, recomputes a prescription, or lifts a hold.

Files: `CoachingCore/src/boundary/integration.mjs`, `CoachingCore/src/boundary/admission.mjs` (new); `CoachingCore/src/boundary/custody.mjs` (one delimited amendment, §6). `api.mjs`, `store.mjs`, `views.mjs`, `inventory.mjs` and `report-voices.mjs` are unchanged and reused.

## 2. Operations

`createIntegration({store, key, clock, anchor?, engine?})` returns a custody-compatible service. The frozen `api.mjs` `createBoundary({custody: integration})` works over it unchanged (`logRun`, `logStrength`, `weeklyCheckIn`, `notFeeling100`, `wellbeingCheck`, `declareReadiness`, `reportBreak`, `updateAvailability`, `setPreferences`, `setCoach`, `accept`, `decline`, `restart`, `setConsent`, `eraseHealthFacts`, `eraseAccount`, `plan`, `sessions`, `history`, `status`, `decision`).

| Operation | Channel | What it does |
|---|---|---|
| `enroll({actor, intake, consents})` | — | First plan. The carried records the engine returns are kept with it. |
| `submit({actor, clientRequestId, expectedVersion, review})` | **ATHLETE** | Every athlete form (all of `api.mjs`). |
| `importActivities({actor, clientRequestId, expectedVersion, activities})` | **DEVICE** | HealthKit workouts: `{activityId, activityType:'RUN', sessionId?, observedAt (with offset), actual, sourceQuality?}`. Nothing else: a delivery carries the athlete's **own last screen**, byte for byte, and states none of its own (cycle 1, SEC-INT-01). No screen yet: `SCREEN_REQUIRED`. Empty: `NOTHING_TO_IMPORT`. |
| `restart({actor, intake, expectedVersion})` | — | A new plan from the record custody holds, with every carried record. |
| `accept` / `decline` / `setConsent` / `eraseHealthFacts` / `eraseAccount` | — | Custody's, with the carried records carried forward. |
| `acknowledgeRecordLoss({actor})` | — | The athlete's explicit act after `RECORD_LOST` / `RECORD_ROLLED_BACK`. |
| `read`, `carried`, `presentation` | — | The verified document; the carried records; the run sessions as prescribed (plan in force and pending change) and the last answer's readings. |

A review answer is custody's (`decisionId`, `version`, `status`, `action`, `decision`, `observationIds`, …) plus:
- `recorded`: the report ids the decision put on record;
- `notRecorded`: `[{eventId, reason}]`, the engine's refusal reason (for example `FUTURE_OBSERVATION`) or `NOT_RECORDED_BY_THIS_DECISION` (for example an ASK for the screen). **The HealthKit queue keeps a workout until it is in `recorded`.**
- `warningSignScreen`: the engine's `runFormat.warningSignScreen`. Custody's answer never carried it, so before this boundary the app could not learn that the engine asked for the warning-sign screen.
- `duplicates`: the indexes of reports already on record exactly. An athlete's report in force sent again unchanged is a duplicate too (cycle 1, SSCTR-INT-01).
- `activities` (device): `[{index, activityId, outcome: RECORDED|NOT_RECORDED|DUPLICATE, eventId, reason?}]`. **The HealthKit queue keys off this** (cycle 1, QRE-INT-05).
- `anchorStale: true` when the record was kept but its anchor could not be written; the native layer writes the anchor again (QRE-INT-08).

## 3. C-F01-2: the unit of custody

**The unit** is what the composed entry reads and returns:
- `program`;
- the ledger (custody rows);
- `referenceState`, `athleteModel`;
- `runFormatRecord`, `runHistoryRecord` and `runEvidenceRecord` (the AIF client's and the Mac core-driver's `CARRIED`).

`paceRevisionRecord` is not carried, because Pace Revision is off and not approved.

**Stored document:** custody's sealed document plus `carried = {schema, records, origins, presentation, requests, lastAt}` and `carriedMac = HMAC(key, schema | athleteId | version | docMac | canonical(carried))`.
- It is written in the **same** `store.commit` as custody's.
- The MAC is bound to custody's own seal and version, so carried records cannot be edited, removed, or spliced from another version or athlete.

**Invariants (tested):**
1. After every operation the stored ledger is, as a set, the engine's last returned ledger, and each carried record is exactly the engine's last returned one (`v1int-custody`, "after every operation").
2. The next engine call, a restart included, is handed exactly that unit. Replaced rows travel as history, and conflicts and kept voices stay (journey F, the restart part of the same test).
3. The record survives a process restart (a file store reopened by a new instance). Another key reads it as `INTEGRITY_FAILURE`.
4. A failed write confirms nothing (`PERSISTENCE_FAILURE`, bytes unchanged). A write that landed before the store threw is replayed on retry, never doubled.
5. Partial corruption is never planned on (`INTEGRITY_FAILURE`, part `carried`): edited or emptied formats, edited origins, splices from another version, truncated text, or a document without carried records. A restart is refused alike: no estimate replaces the record.
6. Another athlete's document is `FORBIDDEN`, even when copied under this athlete's id.
7. **With an anchor** (`{version, docMac}` kept apart from the store):
   - a missing record is `RECORD_LOST` and an older one is `RECORD_ROLLED_BACK`;
   - neither becomes a new athlete or an older plan;
   - only `acknowledgeRecordLoss` starts over, from a new intake.
   
   **Without one**, a lost record reads `NOT_ENROLLED`, which is pinned by a test as the reason the native anchor is required.
8. A report id that custody would derive again is refused as `REQUEST_ID_REUSED` (custody derives ids from the request id, and it forgets request ids after 500 requests).

**The C-F01-2 HOLD question** ("should `restartIntake` HOLD a self-contradicting record?"): through this boundary no such record can reach the engine.
- `reconcile` refuses a duplicate identity.
- The seal refuses a union of stored snapshots.
- Rows are never rebuilt from views.

An engine-level HOLD stays an optional Core hardening and is not needed for this path.

## 4. SEC-CORE-03: authorship

**Who speaks is the entry point native code calls.** `submit` is the athlete (ATHLETE) and `importActivities` is HealthKit (DEVICE). The boundary builds each report's `source` from its channel: ATHLETE has none, which is MANUAL to the engine; DEVICE is `{provider:'HEALTHKIT', activityId, quality}` plus `canonicalActivityId`.

The following are **boundary-owned** and refused when sent:
- `eventId`, `athleteId`;
- `reportedAt`, `correctedAt`;
- `source`, `provider`, `canonicalActivityId`, `provenance`, `context`;
- the supersession and conflict flags, `localDate`, `fact`.

After building, the frozen voice guard `checkReportVoice` applies: a device report states no `rpe`, stop, conditions or response, and a form states no `measurement` or `gpsQuality`.

**Origins**, sealed with the record: `{channel, sessionId, activityId, correctionOf, day, at, digest}` for every report the engine admitted (a row, a merged id or a kept voice).

| Case | Result |
|---|---|
| Athlete corrects own report | admitted; original kept as history (1) |
| Athlete contests an imported workout | the correction of the device report is `CROSS_AUTHOR_CORRECTION`; the athlete's own account of the session is admitted as their voice, and the engine reads the dispute (O-1) (2) |
| Correction of an event that does not exist, or of another athlete's | `CORRECTION_TARGET_NOT_FOUND`, the same code for both (3, 4) |
| `eventId` sent | `BOUNDARY_OWNED_FIELD`; a re-derived id is `REQUEST_ID_REUSED` (5) |
| `activityId` again | identical: a duplicate, no new version; other values: the device's own correction, bound by the activity; another session: `ACTIVITY_LINKED_ELSEWHERE`; from a form: `UNKNOWN_FIELD` (6) |
| Origin missing or misdeclared | `INVALID_IDENTIFIER`, `BOUNDARY_OWNED_FIELD`, `REPORT_VOICE_MIXED` (7, 8) |
| Forged provenance, another session, another workout | `BOUNDARY_OWNED_FIELD`, `CORRECTION_SESSION_MISMATCH`, `CORRECTION_ACTIVITY_MISMATCH` (9) |
| Correction replayed | the same request: its stored answer; sent again as new: `CORRECTION_OF_REPLACED` with the id in force (10) |
| Correction after a restore | bound the same way (11) |
| Workout linked correctly | one row with two voices, credited once (12) |
| Workout linked to another sport, or to no session the plan holds | `SPORT_MISMATCH`, `UNKNOWN_SESSION` (13) |

**Trust per origin:**

| Origin | Trusted | Not trusted |
|---|---|---|
| Athlete's form | that the athlete stated it, as far as the native layer keeps `submit` reachable only from the athlete's own UI | its source fields, ids and clocks (boundary-owned) |
| Athlete's correction | the same, plus a binding to the athlete's own report in force | a target of another author or chain |
| HealthKit import / re-sync | that HealthKit delivered it, as far as `importActivities` is reachable only from the HealthKit delivery path | athlete-only facts; a link to another session |
| Restored data | what the seal, chain and carried MAC verify with the device key | anything that fails them |
| Invalid / unknown origin | nothing; refused | — |

**The screen** (cycle 1): only the athlete states one, at onboarding or in their own review. The boundary keeps the last one under the carried MAC and sends it, unchanged, with every delivery. The engine judges whether it is current. A delivery can never answer the warning-sign screen.

**Not closed by these tests** (pinned by "scope, stated"): a caller that reaches `importActivities` *is* the device for this boundary. Whether the channel really comes from HealthKit, and how the key and entry points are protected, is a native obligation (§9). Founder D1 (the device-custody threat model) also still applies: an owner of a modified device is out of scope.

## 5. C-NCC-3: formats and time

**(a) The record of formats.** It is kept and handed back on every review and restart (§3). It is never rebuilt from labels and never defaulted. Through the frozen custody, a kept symptom stop stopped asking for the screen at the next review. Through this boundary it asks at every later review, and the answer names it (`warningSignScreen`).

**(b) One clock.** Each operation reads the clock once, to the second, and that instant is:
- custody's `asOf` for the engine;
- `reportedAt` for every report;
- `correctedAt` for every correction.

| Time | Source | Kept as |
|---|---|---|
| when the activity happened | `occurrenceDate` (form) / `observedAt` = workout end (HealthKit) | sent |
| device observation | HealthKit `observedAt` | sent (any offset: the same instant, the same plan-local day) |
| manual report | the operation clock | `reportedAt` |
| correction | the operation clock | `correctedAt` |
| review instant / reference | the operation clock (custody's `asOf`, in the plan's fixed offset) | engine |

- **A clock behind the record** (`lastAt`) is `CLOCK_BEHIND_RECORD`: refused, never moved forward. Reads still work.
- **A workout dated in the future** is refused by the engine (`FUTURE_OBSERVATION`) and named in `notRecorded`.
- **A workout without the athlete's screen** gets ASK and is not recorded (`NOT_RECORDED_BY_THIS_DECISION`); it is sent again with the screen.
- **Tested:** a workout imported days later, a retroactive form, a late correction, a repeated review, an offset change, the app closed for days, a restore, a clock behind the record, run and strength on one day.

**Open (not decided here):**
- a clock set **ahead** cannot be detected offline;
- the plan's offset is fixed, so local days in a DST region or while travelling are read in the plan's offset (the engine's policy, unchanged).

## 6. The custody amendment (indispensable, delimited, pending authority)

- **Necessity, reproduced on the frozen custody alone** (no integration code; `evidence/red-on-base-custody.txt`): a second voice arriving in a later review is refused whole (`ENGINE_CONTRACT_VIOLATION`, "a stored row changed"). This covers a watch workout followed by the athlete's form, either order, and a dispute kept as a voice.
  - The engine (E-1 parts, O-1 voices; FREEZE-4..7) evolves the row in force in place.
  - V1CIB's `reconcile` (FREEZE-1) predates that and admitted only supersession annotations.
  - So the core V1 run journey (watch in the morning, effort in the evening) could not be recorded at all.
  - 13 of the 41 new tests fail on the base custody.
- **Change (as tightened in cycle 1, SEC-INT-02/QRE-INT-04):** `reconcile` also admits `evolves(x, y, incoming)`, and only in the two shapes `r6-provenance.mjs` writes (CYCLE1.md has the full rule), as the same append-only annotation entry. The conditions are:
  - every field but `actual`, `response`, `provenance` and `conflicted` is byte-equal;
  - in `provenance`, everything but `parts`, `mergedSourceIds`, `inputHashes` and `conflict` is byte-equal;
  - every earlier part and input hash is kept byte-equal;
  - every new part, merged id and input hash is a report of this review (or the row's own id on its first merge);
  - the row's own voice is unchanged;
  - a conflict flag is never cleared in place;
  - at least one new voice exists.
  
  Everything else is still refused: the "what is not the engine's evolution" test covers 9 forged shapes.
- **What it does not change:** any engine file, any decision, the seal, chain or schema, or any earlier custody test (§8).
- **Authority:** Security and QRE (custody owners per C-F01-2). A successor record for `custody.mjs` against COACHINGCORE-V1-FREEZE-1 is registered **only if they approve** (§10). This is not an engine freeze.

## 7. SEC-O1-03: limits at the boundary

`admission.mjs` `LIMITS` are multiples of measured legitimate shapes: 112 run and 54 strength reports over three synthetic plans. A run report measured 300 B at depth 2; a strength report 1,434 B at depth 7, with arrays of 5 and 6 keys per object. A week held at most 6 sessions.

| Limit | Value | Basis |
|---|---|---|
| observation bytes | 16,384 | about 11× the largest strength report |
| request bytes | 131,072 | |
| observations per request | 32 | about 5× a week; a HealthKit backfill is chunked |
| depth / array / keys / string | 8 / 64 / 32 / 512 | measured 7 / 5 / 6 |
| identifier | 128 | the engine's own report-id ceiling |
| corrections per report chain | 16 | |
| device activities per session | 4 | |
| new reports per channel per local day | 8 | |

- **Intake** (cycle 1, SEC-INT-05): `enroll` and `restart` intakes are bounded by `intakeBytes` 65,536 and `intakeArrayLength` 512 (measured: 1,128 B, depth 5, arrays of 8 over ten profiles; a run history may be long). Depth, keys and strings are bounded as for reports.
- **Behaviour:** the whole request is refused with `{code, index, limit|field, at}`, and nothing is recorded or truncated. A refusal names the safety fields the request carried (`safetyFields`: names only, no values), so the app keeps the athlete's draft. No hold or clinical state is invented: the stop is recorded when it is sent in an admissible request, and the engine then asks.
- **Athlete channel:** a second new report of a session is `ALREADY_REPORTED`, with the id to correct. That bounds the O-SC-1 agreeing growth from that channel.
- **Abuse shapes (tested):**
  - 2,000 reports in one request: refused;
  - 2,000 agreeing athlete reports: one kept, record bytes unchanged;
  - 2,000 workouts on one session: 4 kept;
  - 2,000 identical re-syncs: no new version;
  - 17 corrections: the 17th refused;
  - 9 unplanned workouts in one day: the 9th refused;
  - 16 malformed shapes;
  - the review's own fields are bounded too.
- **Normal and high batches (tested):** a full week, and a 32-workout backfill.
- **Cost:** a refused request costs one verification of the sealed document, about 10 ms in Node on this machine (2,000 refusals took 20 s). It writes nothing.
- **Still open:** the engine's own bound on agreeing merges for records that do not come through this boundary (O-SC-1, Core). Bounds per channel, not per author, are only as good as §4's channel binding. **SEC-O1-03 is not declared closed.**

## 8. Regression

- **Suite:** see `evidence/suite-candidate.txt` and the final report.
- **Earlier custody, boundary, F08, V1FC and Core tests:** unchanged and passing as on the base, except the preservation tests of freezes that bind `custody.mjs`, which name it by design.
- **Earlier freezes (corrected in cycle 1, QRE-INT-07 / SEC-INT-10):**
  - FREEZE-7's 49 bound files are byte-identical, **by a direct hash check** against `RUNTIME_FREEZE_V1CORE_7.json`;
  - `node CoachingCore/scripts/v1core-freeze-7.mjs --check` **exits 1 on this line by design**: its preservation step names `custody.mjs` (bound by COACHINGCORE-V1-FREEZE-1) and this line's added files, as each predecessor verifier does on its successor line;
  - a successor record and verifier for `custody.mjs` are issued only if the R2 rechecks approve the amendment.
- No engine file changed.

## 9. Native obligations (before any real athlete)

1. **Channel integrity:** `importActivities` is reachable only from the HealthKit delivery code, and `submit` only from the athlete's own UI. Both run on one serial queue.
2. **Key:** a per-install random key in the Keychain (`kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`), never in the UI layer, never logged.
3. **Store:** one file per athlete in Application Support, written by `write tmp + fsync + rename`. It returns success only after the rename. File protection: `completeUntilFirstUserAuthentication` (HealthKit background delivery must be able to write). Backup policy is Founder D2.
4. **Anchor:** a separate Keychain item `{version, docMac}` per athlete, written after each commit. `RECORD_LOST` / `RECORD_ROLLED_BACK` are shown as such, never as an empty plan, and starting over is the athlete's explicit act.
5. **Request ids:** a fresh UUID per user action, reused only for a retry of that same action.
6. **HealthKit:**
   - `HKWorkout.uuid` → `activityId`; the end date → `observedAt` (ISO with offset); running only.
   - Distance, duration and route presence → `actual` and `sourceQuality`; nothing the athlete states.
   - Workouts are queued until each is in `recorded`; deletions (`HKDeletedObject`) are not sent (open: what a withdrawn device voice means, with C-O1-5).
   - Re-delivery of the same workout is harmless: duplicate, or the device's own correction.
7. **Crypto host functions in JavaScriptCore:** `createHmac('sha256', key).update(text).digest('hex')` and `timingSafeEqual` / `Buffer.from` for custody (the P0 prelude marks them unsupported today). `integration.mjs` and `admission.mjs` themselves need neither `Buffer` nor `TextEncoder`.
8. **Clock:** the device clock; `CLOCK_BEHIND_RECORD` is shown as "check date and time", with a recovery screen. A revocation always passes. A clock set **ahead** is open (SEC-INT-04, Founder D1).
9. **Added after R1 (SEC-INT-09, QRE-INT-05/06/09, SSCTR-INT-02/03/05/06):**
   - **HealthKit sources:** only workouts recorded by a device count as the device. A user-entered workout (`HKMetadataKeyWasUserEntered`) or another app's write is the athlete's statement and goes through the form, if at all.
   - **No screen on the device route:** never build one there.
   - **One writer:** across the app, its extensions and background delivery, under a file lock with compare-and-swap. A stale lock is recovered after the writer is known dead. Leftover `.tmp` and `.lock` files are cleaned at start.
   - **Logs:** no payload content in logs or crash reports (inventory egress rule).
   - **Keychain:** items can survive a reinstall. On reinstall, check the anchor against the store before `RECORD_LOST` is shown.
   - **`acknowledgeRecordLoss`:** reachable only from the RECORD_LOST / ROLLED_BACK screen.
   - **The queue:**
     - a workout leaves it only on RECORDED or DUPLICATE;
     - one refused at admission (the refusal names its index) is set aside, and the rest of its chunk is re-sent;
     - a refused link (UNKNOWN_SESSION after a restart, SPORT_MISMATCH) is re-sent **unlinked**;
     - link a workout to a session only when the match is unambiguous;
     - never retry forever.
   - **Enroll retry:** `CONFLICT_ALREADY_ENROLLED` after a write that landed means the plan exists; read it.
   - **Athlete drafts:** keep them until their id is in `recorded`. Build every correction from the report in force. A refusal that names safety fields is never discarded.
   - **Warning-sign screen:** show it whenever the answer carries one, whatever the status.
   - **Run forms:** forms with a stop, effort or conditions go through `submit`; the frozen `api.mjs` `logRun` cannot carry them (SSCTR-INT-06).
   - **Rule expiry:** the app shows sessions only through views that honour the authority-expiry state (SEC-CORE-07).

## 10. Open gates (unchanged by this mission)

- C-O1-3 (adverse recovery order);
- SEC-SC-02, SEC-SC-03;
- QRE-SC-04;
- C-O1-5;
- O-SC-S4;
- SEC-NCC-03, OOS-1/2;
- C-F01-1 r2;
- the expiry of the R7-B0 records;
- Founder D1/D2/D3;
- **IOS_REVALIDATION_PENDING**.

**Routed in cycle 1 (CYCLE1.md):**
- QRE-INT-02 (core): the engine keeps a report fact for a report an ASK did not record, and the re-sent workout is then withheld from pace evidence. Owners Core + SSCTR + Founder; blocks real athletes.
- SEC-INT-04 (clock ahead, D1), SEC-INT-06 (overall growth), SEC-INT-07 (no route past the limits), SEC-INT-08 (G07 erasure scope).

**New observations:**
- `runFormatRecord` and `origins` hold health-derived stop facts that `eraseHealthFacts` does not erase (Security / G07).
- Custody's report ids omit the athlete: one key across athletes would give equal id values. On a device the key is per install, and ids are scoped to the athlete's record.
- A HealthKit-import ASK leaves a `RUN_REPORT_RECEIVED` fact in the record of formats for a report not recorded (engine, pre-existing).
