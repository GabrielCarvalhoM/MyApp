# V1 Coaching Integration Boundary: the contract the iOS app consumes

**Status: DERIVED INTEGRATION HANDOFF, not canonical** (V1CIB, 2026-11-09, branch `claude/v1-integration-boundary`). Product, domain and experience authority stay where `canon/CANONICAL_INDEX.md` puts them. This page describes what the boundary implemented in `CoachingCore/src/boundary/` accepts and returns over the shadow engine. Nothing here authorizes real data: the boundary refuses non-synthetic input (`SYNTHETIC_ONLY`). The readiness states are in section 12.

**Layout-free.** No screen, copy, color or component is set here. The design source is the new visual exploration (Figma `kV3YfW4HdYTFGAu7yndYRL`, candidate in progress, not promoted, not opened by this mission); the Pierre (`90oyvX…`) and TYR10AI files are historical references of features only. The app maps each state below to whatever the approved design decides.

Supersedes, for any real integration, the "client is the store" rule of `INTEGRATION_CONTRACT_V1CP.md` §1: the app never holds, sends, re-seals or drops the record, the reference state, the program or the learning model.

## 1. Shape

```
iOS app ──(typed requests: what the athlete did or said)──▶ boundary API (api.mjs)
                                                             │
                                          custody (custody.mjs, store.mjs): ids, clock, binding, HMAC chain, adoption, consents, erasure
                                                             │
                                          engine (r6-index.mjs): every sporting decision
```

The app never reproduces a prescription rule. It shows the states and sessions the boundary returns, and sends the athlete's own facts.

## 2. Operations

Every mutating call carries `actor` (from authentication, PENDING), `clientRequestId` (idempotency key, 1–128 characters), `expectedVersion` (the record version the app last saw) and, for reviews, `eligibility` (the athlete's six-flag screen, see §6).

| Operation | Request (besides the common fields) | Engine event |
|---|---|---|
| `onboard` | `intake` (R6-INTAKE-1: athlete, goals, experience, recent training, history, equipment, schedule, coaching choices), `consents` {COACHING, HEALTH_SIGNALS, LEARNING} | first plan |
| `plan` | `week?` | — (read) |
| `sessions` | — | — (read, every week) |
| `logRun` | `sessionId`, `occurredOn`, `completed`, `minutes`, `response` {performance, recovery, effort, nextDayFunction}; optional `correctionOf` + `correctedAt` | WEEKLY_REVIEW (or MISSED_SESSION when `completed:false`) with one report |
| `logStrength` | as `logRun`, plus `exercises` [{id, sets [{reps, load {value, unit, convention}, rir}]}] | same |
| `weeklyCheckIn` | `reports[]`, optional `check` (inside a Situation 1 episode) | WEEKLY_REVIEW |
| `notFeeling100` | `wellbeing` (F08 Situation 1 fields) | NOT_FEELING_100 |
| `wellbeingCheck` | `check` | WELLBEING_CHECK |
| `declareReadiness` | `readiness` (F08 Situation 2 fields), optional `reports` | READINESS_DECLARATION |
| `reportBreak` | `interruption` {startDate, endDate or days, reasonCategory, reason?} | RETURN_AFTER_PAUSE |
| `updateAvailability` | `changes` (run/strength days, shifts, minutes) or `unavailableDates` | SCHEDULE_CHANGE / UNAVAILABLE_DAY |
| `setPreferences` | `volume`, `difficulty` (LOWER, STANDARD, HIGHER; per sport or both) | PREFERENCE_CHANGE |
| `setCoach` | `profile` (CONSERVATIVE, BALANCED, DEMANDING) | PREFERENCE_CHANGE |
| `accept` / `decline` | `decisionId` | — (adoption) |
| `decision` | `decisionId` | — (why the plan changed: reason, missing inputs, guidance level) |
| `history` | — | — (sessions executed, facts by type, decisions with reasons) |
| `status` | — | — (state, per-sport states, hold, question, pending change) |
| `restart` | `intake` (updated facts) | new plan (F08 Situation 3), record carried |
| `setConsent` | `purpose`, `granted` | — |
| `eraseHealthFacts` | `eventIds` | — (§9) |
| `eraseAccount` | — | — (§9) |

The field vocabularies (conditions, warning signs W1–W15, exercise-response items X1–X4, intents, speeds, restrictions, levels) are the engine's, listed in `INTEGRATION_CONTRACT_V1CP.md` §3–§4 and §10; every F08 item starts unanswered and is answered one by one (SEC-V1CP-03).

**Response.** Success: `{ok:true, decisionId, eventId, version, status, action, adoption, held, suppressed, observationIds, decision, view}`. Failure: `{ok:false, error:{code, message}, state}`. A retry with the same `clientRequestId` and request returns the stored response with `replayed:true`.

## 3. Client states

| State | Meaning | The app |
|---|---|---|
| `VALID_PLAN` | The plan in force is valid. | Shows the sessions; `executable` ones can be started. |
| `PENDING_CONFIRMATION` | A change the athlete asked for waits for their confirmation (§5). | Shows the plan in force and the change; `accept` or `decline`. |
| `NEEDS_INPUT` | The coach needs an answer (`question.missingInputs`). | Asks exactly that; sessions ahead are `projected`, none `executable`. |
| `REDUCED` | A Situation 1 window or the wait for its check holds a sport. | Shows the reduced sessions and the check when due. |
| `RETURNING` | A sport is in a return (ladder, recipe or readiness restart). | Shows the return sessions. |
| `BLOCKED` | A clinical hold stands on the record. | Shows no prescription at all (`prescription:null`), the guidance level, and the only exit: the readiness declaration. |
| `INTEGRITY_FAILURE` | The stored record failed its integrity check, or the engine broke the record contract. | Shows no plan and no rest day; asks to try later / contact support. |
| `OPERATIONAL_ERROR` | A conflict, a busy store, an engine error. | Refreshes (`CONFLICT_STALE_VERSION`) or retries; never shows rest. |
| `NO_DATA` | Not enrolled, or the account was erased. | Onboarding (or nothing for an erased account). |
| `NOT_SYNCED` | The app's own state: reports in its offline queue. The server never returns it. | Marks the session "not sent yet"; sends with its `clientRequestId`; on `CONFLICT_STALE_VERSION` refreshes and resends. |

Per sport (`view.sports.RUN|STRENGTH.state`): `ACTIVE`, `REDUCED`, `RETURNING`, `HELD` (not declared ready; exit: a readiness declaration), `BLOCKED`, `NOT_PROGRAMMED`; strength may carry `restricted` regions.

**Sessions** (`view.week.sessions[]`): `{id, date, sport, role, turn, optional, status, executable, projected, prescription, explanation, ownEvent?, coachRecommendation?}`. A technical failure never produces sessions. A projected week after a question or a hold is never executable. A race inside a reduction, return or restart is the athlete's own event with the coach's recommendation (`NO_SESSION`, `OPTIONAL_WALK`, `EASY_RUN`; Founder D3), never "cleared" or "safe to race".

## 4. Error codes

`UNAUTHENTICATED`, `FORBIDDEN` (another athlete's record), `NOT_ENROLLED`, `GONE` (erased), `INVALID_REQUEST` (a server-owned field, an unknown field, a bad id, a screen in the future; refused fields are never echoed), `CONFLICT_STALE_VERSION`, `CONFLICT_IDEMPOTENCY_KEY`, `CONFLICT_ALREADY_ENROLLED`, `BUSY`, `CONSENT_REQUIRED` (with `purpose`), `SYNTHETIC_ONLY`, `NOT_PENDING`, `NOT_FOUND`, `INTEGRITY_FAILURE` (with the failing part), `ENGINE_CONTRACT_VIOLATION`, `OPERATIONAL_ERROR`.

## 5. Adoption (AEC §2, §3.4–3.5)

- A change the athlete applies to their own context or plan waits for confirmation: SCHEDULE_CHANGE, UNAVAILABLE_DAY, DOUBLE_CONFLICT, PREFERENCE_CHANGE, GOAL_CHANGE, EQUIPMENT_CHANGE, EVENT_DATE_CHANGE, EVENT_WEEK_CONFLICT, EXERCISE_SUBSTITUTION (`custody.CONFIRMATION_KINDS`). `decline` keeps the plan in force; a later review supersedes the pending change.
- A change that follows a fact the athlete recorded (a Situation 1 report or check, a readiness declaration, a declared break) is applied with it (`adoption: APPLIED_WITH_ITS_FACT`): keeping the old plan would contradict their own report.
- A change that follows the evidence (the week's gates, a re-plan from reports, a reduction after a reported fatigue) is a recalculated recommendation, applied with its decision and shown with its reason (`APPLIED_WITH_ITS_EVIDENCE`).

This list is the boundary's reading of the AEC; Product/UX may change it without any engine change.

## 6. Ids, clocks and the screen

- Event ids (`ev_…`), report ids (`ob_…`) and decision ids (`dc_…`) are opaque and server-assigned; report ids are stable for a retried request. A correction names the server id of the report it corrects.
- The decision clock is the server's, in the plan's fixed offset. The app never sends `asOf`, `weekIndex`, `event`, `actualLedger`, `referenceState`, `athleteModel`, `officialPlanState`, `learningConsent` or `athleteId` (refused).
- `eligibility.assessedAt` is a local date or an instant; an instant is read in the plan's offset by custody, and a screen in the future is refused. F08 entries need a screen dated that day; a readiness declaration's screen must come after the hold it answers.

## 7. What custody guarantees (implemented and tested)

- The athlete is bound by the server; another athlete's record is never read or written (`FORBIDDEN`).
- Every record row is kept under an HMAC chain keyed by the server (`seq`, time, digest, link); the document is sealed (version, program, reference, model, consents, chain head, decisions, idempotency). An edited, re-sealed (keyless `rowHash` recomputed), removed, reordered or truncated row, an edited program, or a re-sealed reference is an `INTEGRITY_FAILURE`, never planned on (C5, C7).
- The engine's record must keep every stored row: unchanged, or a report annotated by a correction (an append-only annotation entry). Anything else is `ENGINE_CONTRACT_VIOLATION` and nothing is kept. An absent `actualLedger` is the record unchanged (OBS-FFC-01).
- Retries are idempotent; concurrent writes from two devices are refused by version (`CONFLICT_STALE_VERSION`); a commit takes an exclusive lock in the file store.
- The hold is enforced twice (CF-OBS-1's two layers): the engine reads it from the record on every review kind, and custody delivers no prescription while the record holds a standing hold, whatever the engine returned (`suppressed: HOLD_ON_RECORD`).
- The state survives a server restart (file store reopened by a new process: the same verified view, and the next review continues).
- The same journey decided through custody (arrival order) and by the conforming client (the engine's own order) gives the same decisions and sessions.

**PENDING (operational, not built here):** authentication and session issuance; key management (KMS, rotation, per-environment keys); the production database with transactions and backups; an external monotonic version against a whole-document rollback by an operator (a sealed earlier snapshot verifies: shown by a test); monitoring and rate limits; the legal basis, texts and periods of consents and retention (G07).

## 8. Data protection (Security C4–C8)

- **Inventory** (`inventory.DATA_INVENTORY`): every field classed HEALTH, HEALTH_DERIVED, TRAINING, PERSONAL, INTEGRITY or OPERATIONAL. Health and health-derived fields have no egress: they stay in custody and the athlete's own views.
- **Telemetry** (`telemetryOf`): a neutral operation class (`review`, `read`, `adoption`, `consent`, `erasure`, `restart`, `onboard`), a status category (a hold reads as any change of plan), an error code, opaque ids and the version. A canary test checks that no health word or field reaches it.
- **Push and lock screen** (`pushTextOf`): neutral text, the same for a hold as for any change (SEC-V1CP-17).
- **C5:** `inputHash`, `rowHash` and the reference digest are payload, never proof; the custody HMAC is the integrity mechanism.
- **C8:** a warning sign answered during a hold is kept in the custody decision log as the closed sign names, the guidance level, the event id and the time, with no free text.
- **Consents:** COACHING for any review; HEALTH_SIGNALS for "not 100%", checks and readiness (revoking it stops new entries; training reports go on); LEARNING feeds the engine's consent. Mechanism only; purposes and texts are G07's.

## 9. Erasure and retention

- **Health facts** (`eraseHealthFacts`, SEC-V1CPI-06, C6): the named F08 facts and every F08 row that references them (episodes, checks, chains, carried conditions, the hold a declaration names) lose their content; each slot keeps its digest, so the chain still verifies; one `ERASED_F08` marker is appended. The engine reads the marker as a clinical hold of unknown cause until a later readiness declaration (never as absent). Derived plan markers stay until a new plan; whether they must go is G07's.
- **Account** (`eraseAccount`): the document is removed; a tombstone (a keyed digest of the athlete id, the time, the scope; no id in clear) refuses every later write for that athlete, so a device that synchronises old data cannot bring it back.
- **Retention** (`custody.RETENTION`): the record and the decision log while the account exists; 500 idempotency entries; periods and legal basis PENDING G07.

## 10. Engine deltas the app consumes (V1CIB)

- A clinical hold on the record keeps every review kind but the readiness declaration clinical, whatever reference is sent (CF-OBS-1). The readiness declaration releases it sport by sport; a sport not declared ready stays `HELD`.
- A plan older than a readiness declaration on record is refused (`HOLD`, `program.behindRecord`).
- A declaration under an id that already names another fact or a session report is asked for its own id; an earlier declaration replayed after a new hold never releases it.
- A readiness restart that follows a break kept during the hold is recorded as that break's return (applied once).
- Days without training are read from the executed history in Situation 1 chains and before declared breaks; strength sets come back at most one per executed week across chains, waits and mid-week windows (SSCTR-FFC-01, -02, QRE-FFC-01).
- Programs, records and reference states hash the same before and after JSON storage (QRE-FF-06).

## 11. Known limitations (state them, never present them as done)

- The DEMANDING coach prescribes exactly what BALANCED prescribes (Founder D6 limitation): only its advice and disclosure differ. Never present it as a distinct prescriptive coach.
- Warning-sign wording is interim (INTERIM_PENDING_G04); F08 stays F08_OPEN.
- No Garmin, COROS, Polar or structured Apple Watch delivery in V1; Apple Health comes in its own mission (DR-117–123).
- The engine is the shadow reference (`mode: SHADOW`); V1_COACHING_AUTHORITY_READY = NO.

## 12. Readiness (at the candidate; the closing checkpoint holds the final values)

INTEGRATION_READY is decided at closure from the independent review. Real collection stays not authorized whatever it says: it needs the PENDING operational parts of §7, G07 and the human revalidation.

## 13. Synthetic fixtures

`CoachingCore/fixtures/v1cib-ios/`: 21 JSON files, one per flow or client state (onboarding, the week, logging a run and a strength session, the weekly check-in, a pending change and its acceptance, preferences, coach, a question, "not 100%", the check and the return, a warning sign and the hold, the readiness restart, a decision's explanation, history, a stale-version conflict, an integrity failure, no data), each with its request and response. Regenerate with `node scripts/v1cib-ios-fixtures.mjs`; `test/v1cib-fixtures.test.mjs` checks they are byte-identical to a fresh run and cover every server state.
