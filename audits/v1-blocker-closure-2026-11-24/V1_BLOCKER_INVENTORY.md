# V1 CoachingCore blocker inventory (closed list)

**Mission:** REPMILE V1 COACHINGCORE BLOCKER CLOSURE (Founder, 2026-11-24).
**Base:** `ee256ae` (branch `claude/v1-cc-integration-foundation`), engine line COACHINGCORE-V1-CORE-SAFETY-FREEZE-7, boundary record V1INT-BOUNDARY-SUCCESSOR-1.
**Line:** branch `claude/v1-cc-blocker-closure`, worktree `.claude/worktrees/v1-cc-blocker-closure`.
**Sources reconciled before any code:**
- V1INT: `FINAL_REPORT`, `INTEGRATION_BOUNDARY_CONTRACT` §7, §9 and §10, `CYCLE1`, and the R2 records `SEC_INT_R2`, `QRE_INT_R2` and `SSCTR_INT_R2`;
- Safety Continuity: `FINAL_REPORT` and `SEC_SC_R1`;
- O-1: `FINAL_REPORT` and `SSCTR_O1_R1`/`R2`.

The **Evidence** column is filled at closure (see `FINAL_REPORT.md`). Allowed states: `FIXED_VERIFIED`, `BLOCKED`, `NATIVE_OBLIGATION`, `DEFERRED_NON_BLOCKING`, `DUPLICATE`, `NOT_REPRODUCED`, `ALREADY_CLOSED`.

**Reach** is whether the shape can be produced through the V1 entry point, the boundary (`createIntegration` + `api.mjs`), which is the only way the app reaches the engine. Engine-only shapes are judged on that basis.

## A. Runtime (engine)

| Id | Source | Reproduction on `ee256ae` | Subsystem | Real V1 impact / flow | Sev. | Owner | Decision | Closing criterion | State |
|---|---|---|---|---|---|---|---|---|---|
| **C-O1-3** | SSCTR_O1_R1 decision A; SC FINAL q3 | `adv2.mjs` (SSCTR O-1 probe): adverse count **0, 0, 1, 0** over four orders | `r6-adaptation.mjs` `kindOf` (weekly evidence, gates, recent) | Weekly-review gating: an athlete's ADVERSE/IMPAIRED on a disputed session reaches the protective readers only when the athlete spoke first | High (protective) | Core + QRE, SSCTR | Fix | Same count in all four orders and after a non-resolving correction; never credit | see report |
| **SEC-SC-02** | SEC_SC_R1 | `p3b.mjs` G2, G4: **DECLARED** where a later stop or "done" voice exists | `r6-provenance.mjs` `partOf`; `v1-f08.mjs` SB-1 | Restart after a readiness declaration: a stop kept as a voice on a row observed before the declaration does not raise the readiness question | Medium | Core + QRE, Security | Fix (as SEC_SC_R1 specifies) | G2 and G4 ASK; D3 and D4 stay DECLARED | see report |
| **SEC-SC-03** | SEC_SC_R1 | `p3b.mjs` G1: **NO_PAUSE** for a stop on the restart day | `v1-f08.mjs` restart pause | A stop on the restart day asks nothing | Low | Core + SSCTR | Fix: such a stop gives a 0-week pause with no declaration standing in, so the existing cause question asks | G1 ASK; nothing else in p3b moves | see report |
| **QRE-INT-02** | QRE_INT_R1/R2, SSCTR_INT_R2 item 4; Founder authorized the fix | QRE `p03b`: after ASK and re-send, `REPORT_NOT_CARRIED`, 2 report facts | `v1-run-format-index.mjs` (report facts) | Run calibration, forecast and pace insights: re-sent runs withheld from pace evidence for ever | Moderate (pace evidence) | Core + SSCTR, Security | Fix: a report the decision neither recorded nor refused keeps only its stop (SSCTR's separation of receipt and admission) | Re-sent run carried, 1 fact, stop still screened, no double credit | see report |

## B. Boundary integrity and limits

| Id | Source | Reproduction | Subsystem | Real V1 impact / flow | Sev. | Owner | Decision | Closing criterion | State |
|---|---|---|---|---|---|---|---|---|---|
| **SEC-INT-02R** | SEC_INT_R2 §2 | `p8-evolves-r2.mjs`: 6/6 forgeries **KEPT** | `custody.mjs` `evolves` | Defence in depth: a misbehaving engine's altered row would be stored | Medium | Engineering + QRE, Security | Fix SEC_INT_R2's four rules exactly | 6/6 refused; legitimate shapes (QRE p02, SSCTR r2b, journeys A–H) admitted | see report |
| **O-SC-1** / SEC-SC-O-3 | SEC_SC_R1, SC FINAL q5 | `p3b.mjs` J3: 2000 agreeing reports give 2000 parts (2.6 MB), **engine only** | `r6-provenance.mjs` merge | Through the boundary: athlete `ALREADY_REPORTED`/duplicate, device ≤ 4 activities per session (`v1int-limits` lim-2, lim-3) | Medium | Core | No engine cap. The boundary bound is the V1 bound, pinned by a test of the most parts reachable through it | Most parts a session can reach through the boundary is bounded and tested | see report |
| **SEC-INT-06** | SEC_INT_R1 | `p5-limits.mjs` (A): 480 unplanned reports dated across 60 past days, record 251 → 695 KB | `integration.mjs` admit | Abuse growth (the athlete's own record) | Low–Med | Engineering | Fix: a report dated before the record began (the enrollment day, in the plan's offset) is refused (`BEFORE_RECORD_START`, with `index`, `field`, `firstDay`). Prior training is the intake's (run history), and per-day limits then bound growth by the days the record has existed | p5 (A) refused, backfill within the plan admitted | see report |
| **SEC-INT-07** | SEC_INT_R1 | `p5-limits.mjs` (B): a 17th correction adding a stop, or a 9th report of a day, is refused | `integration.mjs` admit | A safety signal with no route past a limit | Low–Med | Engineering, SSCTR informed | Fix: past either limit, a report that states a stop, ADVERSE or IMPAIRED is admitted, at most 3 beyond the limit (the SEC-SC-01 pattern) | Stop past the limit recorded and screened; a 4th excess refused | see report |
| **SEC-O1-03** (umbrella) | SEC_O1_R1 | = O-SC-1 + SEC-INT-06 + SEC-INT-07 + size limit (closed in V1INT admission) | — | — | — | — | **DUPLICATE** of its parts | Closes with its parts | DUPLICATE |
| **SEC-INT-04** (rest) | SEC_INT_R2 p2 B | `eraseHealthFacts` under a clock behind the record: `CLOCK_BEHIND_RECORD` | `integration.mjs` | The athlete cannot erase health data with a wrong clock | Low | Engineering | Fix: erasure passes, as revocation does; the latest instant never moves back | Erasure under a behind clock succeeds; record `lastAt` unchanged | see report |
| **SSCTR-INT-R2-01** | SSCTR_INT_R2 | `r2e`: a duplicate-only answer says `warningSignScreen: null` while the screen is required | `integration.mjs` duplicate answer | The app could close the screen early | Low | Engineering | Fix: the duplicate-only answer carries the stored reading | Duplicate after a stop names the screen | see report |
| **SEC-INT-05** (rest) | SEC_INT_R2 p9 | Free-text keys inside intake anchors are kept (60 notes × 480 chars within the 64 KB bound) | intake / `r6-intake.mjs` | Minimisation of the athlete's own on-device data; no safety or dose effect | Low | Engineering/Core with the Swift onboarding schema | Defer: closing anchors needs the read vocabulary of five modules; a wrong list would refuse real onboarding | Before real athletes: anchors closed to the schema the app sends | DEFERRED_NON_BLOCKING |
| **SEC-INT-12** | SEC_INT_R2 | Unknown keys inside `actual` kept as sent | admission | Same class as SEC-INT-05; "no effect on the screen" (Security) | Low | Engineering/Core with the Swift form schema | Defer, as above | Before real athletes: `actual` closed per channel to the form schema | DEFERRED_NON_BLOCKING |
| **QRE-SC-04** | QRE_SC_R1 | A phantom identity from an integrity refusal stays one review in the quarantine list (reads CONFLICTED, errs low) | `r6-provenance.mjs` | Produced only by integrity refusals (an event id reused, an activity of another session); the boundary owns ids and refuses `ACTIVITY_LINKED_ELSEWHERE` | Low | Core | Not reachable through V1; errs low | Pinned by the boundary's id and link refusals | DEFERRED_NON_BLOCKING |
| **O-SC-S4** | SEC_SC_R1 | Integrity-flagged rows whose every voice says done read no occurrence | `v1-f08.mjs` | As QRE-SC-04: integrity flags are not producible through the boundary; errs long (a longer pause) | Low | Security + Core | As QRE-SC-04 | — | DEFERRED_NON_BLOCKING |
| **SEC-SC-O-1** | SEC_SC_R1 | First-claim integrity class | engine | Carried by SEC-CORE-03 / C-F01-2, closed at the portable layer (SEC_INT_R2) | — | — | — | — | ALREADY_CLOSED |
| **OOS-1/2**, **SEC-SC-O-2** | NCC, SEC_SC_R1 | Client-supplied `provenance`, `conflicted`, `context` labels | engine | The boundary refuses them (`BOUNDARY_OWNED`) | — | — | — | — | ALREADY_CLOSED |
| **SEC-NCC-03** | NCC | Records FREEZE-4 wrote stay unbound | engine | No such record exists: V1 starts from fresh records | — | — | — | — | DEFERRED_NON_BLOCKING |
| **C-F01-1 r2** | CF011 r2 | — | f08 | Closed by FREEZE-3 (memory, SC FINAL) | — | — | — | — | ALREADY_CLOSED |
| SEC-INT-01, -03, -09, -10, -11; QRE-INT-01, -03, -04, -05, -07, -08, -10 (boundary); SSCTR-INT-01, -04; SEC-SC-01; SEC-O1-01b/c; C-O1-2; SEC-O1-02/QRE-O1-02; C-R2-1 | V1INT R2, SC R2 | — | — | Closed by their judges | — | — | — | — | ALREADY_CLOSED |
| C-R2-2, C-O1-4, C-O1-R2-1 | records | — | — | Record wording only | — | — | — | — | ALREADY_CLOSED |
| QRE-SC-03, O-O1-1 | QRE_SC_R1, SSCTR_O1_R1 | Test-only gaps (two mutants; a suggested test) | tests | No behaviour | Low | Author | Defer | — | DEFERRED_NON_BLOCKING |

## C. Integration and platform decisions

| Id | Decision | Closing criterion | State |
|---|---|---|---|
| **SEC-INT-04 / D1** (clock set ahead) | No engine safety hold is released by elapsed time: a clinical hold ends only by a readiness declaration, a stop only by a screen answered after it, and a restart pause only lengthens with a later clock. A clock set ahead lets the athlete move through the plan's calendar faster (progression compressed in real time); setting it back then locks writes (`CLOCK_BEHIND_RECORD`). Activity time (`observedAt`) and operation time (`reportedAt`, custody `asOf`) are already distinct (C-NCC-3 b). | **Native:** the operation clock passed to `createIntegration({clock})` is the device clock bounded by a trusted reference (the last server time plus monotonic uptime). An operation whose device clock is more than 300 s ahead of that reference is refused before custody (as the engine's own `futureSkewSeconds`). Shown as "check date and time". Verified on iPhone. Until then no V1 flow is blocked: no engine window is satisfied by a later clock. | NATIVE_OBLIGATION |
| **G07** (erasure scope) | `eraseHealthFacts` erases the readings and the request record (V1INT cycle 1). This line also erases the athlete's stored screen (pain, injury and illness answers). With none stored, a delivery waits for a new one (`SCREEN_REQUIRED`, fail-closed). It keeps the stop facts of the record of formats, which carry no free text, as a **safety retention**: the warning-sign screen keeps asking until the athlete answers it after the stop. Account erasure removes everything. | Founder confirms the retention, or narrows it, before real athletes. The native layer erases files, `.tmp`/`.lock` and the Keychain key on account erasure (§9) | see report |
| **C-O1-5** (contest device data) | The engine already behaves safely: the athlete's "not done" or different amount against a device workout keeps the session CONFLICTED (no credit, errs low by one progression step, `dose6`). The athlete corrects only their own report. A device re-sync is the device's correction. A HealthKit deletion is not sent in V1 (§9.6). | **Native/UX:** offer the athlete's form as the route ("this workout is wrong / not done"). No engine change. Whether a HealthKit deletion should withdraw the device voice is a post-V1 engine decision (SSCTR). | NATIVE_OBLIGATION |
| **Native obligations** (§9: C-F01-2 native, SEC-CORE-03 native, SEC-INT-09, QRE-INT-05/06/09, SSCTR-INT-02/03/05/06, SEC-CORE-07, O-R2-1, the HealthKit linking rule of one workout per session) | Unchanged in substance; `NATIVE_OBLIGATIONS.md` lists them with their checks | Verified at the Mac/iPhone run | NATIVE_OBLIGATION |
| **IOS_REVALIDATION_PENDING** | Physical validation | Mac/iPhone run of the RC package | NATIVE_OBLIGATION |
| **Founder D2** (backup), **D3** (minimum iOS) | Platform decisions | Founder, before App Store submission | NATIVE_OBLIGATION |
| **R7-B0 record expiry** | The runtime's strength repertoire records (`SSCTR_RECHECK_B0.json`, 13 records) carry `review_by: 2027-04-30`. After that date the repertoire is invalid and strength planning stops. | Operational: an SSCTR renewal before 2027-04-30, plus an app-side warning. The bundled records file is part of the package. | NATIVE_OBLIGATION (release operations) |
| **C-NCC-3** (rest: the plan's fixed offset under DST or travel) | Engine policy, unchanged: the plan keeps the offset it was made with | Native sends instants with their offset (already enforced) | DEFERRED_NON_BLOCKING |

## D. Not in this inventory's sources

The conditions of the run-extension line (pace currency, simulation thresholds, V1X-PACE-REVISION off) and of the strength line (N1–N4) are carried as recorded by their own missions. They are not re-adjudicated here, and none was produced by this line.

## Count

| | Items |
|---|---|
| Listed in the mission (A1–A4, B1–B3, C1–C4) | 11 groups, 34 identifiers |
| Duplicate or already closed | 17 identifiers (SEC-O1-03 umbrella, and the closed and records rows) |
| To fix in runtime or boundary code | 9 (C-O1-3, SEC-SC-02, SEC-SC-03, QRE-INT-02, SEC-INT-02R, SEC-INT-06, SEC-INT-07, SEC-INT-04 rest, SSCTR-INT-R2-01), plus G07's screen erasure and the O-SC-1 test |
| Native or platform obligations | 7 rows |
| Deferred, not blocking | 8 |
