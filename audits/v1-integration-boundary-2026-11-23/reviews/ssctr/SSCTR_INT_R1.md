# SSCTR narrow consultation: CoachingCore Integration Boundary V1INT-1, R1 (2026-11-23)

**Verdict on candidate `a52db2bb5e3beed2de08c3e7b888f143dcc27b54` (base `e44d855`, FREEZE-7): ACCEPT_WITH_CONDITIONS.**

- None of the seven admission rules changes what the engine recognises as executed.
- None of them silently loses a stop, an ADVERSE response or impaired next-day function.
- Every refusal is explicit. A refused request records nothing and names the safety fields it carried.
- Two paths, however, rely on the app to re-send a refused safety signal, and §9 does not yet oblige the app to do so (SSCTR-INT-01, -02). Three more native obligations are needed (SSCTR-INT-03, -04, -05).
- One pre-existing gap sits outside the boundary: `api.mjs` cannot carry a stop at all (SSCTR-INT-06).
- **Nothing here blocks the synthetic candidate.** The conditions bind before any real athlete.

## Reviewer, bytes, method

**Reviewer:**
- Role: SSCTR (agent SSCTR-1.0.0, constitution SSCTR-CONST-1.0.0, skill sports-science-review 1.0.0), model claude-opus-5-5, a fresh instance.
- This instance did not author the boundary, the amendment or any rule under review.
- Authority: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical only.
- No human review took place, no clinical judgment was made, nothing was delegated and no native dispatch is claimed.
- I did not read the Security or QRE reviews in `reviews/`.

**Literature:**
- WebSearch and WebFetch were present as deferred tools. I did not use them.
- The questions ask whether admission and custody keep what the engine decides. They do not ask what training works, and no ruling approves a dose, a threshold or a recipe.
- The only sporting judgments are about whether the bounds are plausible (§5). Those are operational ceilings, not prescriptions. They are labelled PLAUSIBLE_BUT_UNCERTAIN and are not used as evidence for any rule.

**Bytes read (SHA-256 at the candidate commit):**
- `integration.mjs`: `2d91cee3…d70b`
- `admission.mjs`: `825726d2…18e1`
- `custody.mjs`: `5bac8558…f237`, with the `evolves` diff against e44d855 read in full
- `api.mjs`: `b7c16af2…75e2`, unchanged
- `INTEGRATION_BOUNDARY_CONTRACT.md`: `42f67011…20ec`, §1–§10 read

I also read REVIEW_REQUEST.md, the four `v1int-*` test files, the helpers and `evidence/red-on-base-custody.txt`. From the engine I read only the readings I needed: the screen logic in `v1-run-format-index.mjs` (`readingOf`, `screenOf`) and how `r6-adaptation.mjs` treats a conflicted row.

**Commands, run from `CoachingCore/`:**
- `node --test` on `v1int-journeys`, `-authorship`, `-limits` and `-custody`: **42/42 pass**.
- I did not run `npm run verify`, the full suite or any `verify-r*`.
- **Observation for QRE (not sporting):** `node scripts/v1core-freeze-7.mjs --check` exited **1** here. It printed only the COACHINGCORE-V1-FREEZE-1 line ("195/198 … NOT preserved: custody.mjs" and "CHANGED and not declared: …") and never printed a 49/49 count. The contract says "stays 49/49", which was not reproduced as a passing exit in this worktree. Whether that is the expected chained precondition is for QRE to say.

**Probes:** nine scripts in `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/a7b949d0-1d77-4bd5-b113-46af6e45887a/scratchpad/ssctr-int/` (`probe1.mjs`–`probe9.mjs`; probe2 was broken by a later in-place edit and its results come from the earlier runs). Synthetic athletes only, through the real composed engine and the candidate boundary. Their results are cited per item below.

## Item rulings

### 1. One live athlete report per session; a second one is `ALREADY_REPORTED` and must be sent as a correction: **ACCEPT_WITH_CONDITIONS** (SSCTR-INT-01, -02)

**The correction path carries every safety signal the original would** (probe1, probe2, probe9). For a run, I compared each signal stated in the original report with the same signal sent the next morning as a correction of a clean report:
- Signals tested: stop for SYMPTOM, recovery ADVERSE, next-day function IMPAIRED.
- With no device voice, the two orders give the same in-force row, the same Sunday decision, the same program, the same pending change, the same reference state and the same athlete model.
- A stop sent as a correction raises the warning-sign screen exactly as an original does.
- With a device voice merged into the row, the athlete correcting their own merged voice works. ADVERSE and IMPAIRED end up in the row in force (only the key order differs). A stop makes the row CONFLICTED and raises the screen.
- Journey G and probe8 R1 show the stop is still heard after the athlete corrects it away (SB-1).

This matters because next-day function is reported the next day by nature, so this path is the normal one for it, not an edge case.

**Execution is not lost.**
- The rule applies only to a report with a `sessionId`, and only after an athlete report on that session has been admitted.
- A report the engine refused or did not record (ASK) leaves no origin, so it never blocks a later report.
- A device voice never blocks the athlete's first report.

**What the rule shifts to the app, which is not yet a native obligation:**
- **(a) SSCTR-INT-01.** The whole request is refused, including the safety content that rides with the report. Reproduction (probe4 A):
  1. Log `w0-run-d1`.
  2. Next morning, send `NOT_FEELING_100` with a warning sign and attach the same run report.
  3. The answer is `ALREADY_REPORTED` with `safetyFields: ["eligibility","wellbeing"]`, and nothing is recorded.
  4. Sent again without the report, the same wellbeing gives `CLINICAL_HUMAN_REQUIRED`.
  
  So a clinical routing is held back until the app splits the request. The same applies to a weekly check-in that re-lists sessions already logged. The refusal is explicit, not silent, which is why this is a condition and not a block.
- **(b) SSCTR-INT-02.** A correction replaces the report it names. If the app builds it from an empty draft (`actual.completed` is required) instead of from the report in force, it would record "not done" over an executed session.

### 2. The athlete cannot correct a HealthKit report; their own account is admitted beside it and the engine reads the dispute: **ACCEPT** (interim, until C-O1-5)

- The athlete's contest becomes a voice of the session's row, and the row is flagged `conflicted` (authorship case 2; probes 1 and 8).
- The engine reads a conflicted row as **no evidence**: the session status is CONFLICTED, it "trains nothing" and it disqualifies the week's progression (`r6-adaptation.mjs`, the `!o.conflicted` filters and lines 789/2153).
- A stop stated in the contest still raises the warning-sign screen.
- So a disputed workout is neither credited as dose nor allowed to silence a safety statement. That is the conservative direction: it costs progression credit and adds no load.
- The dispute can be resolved by the athlete correcting their own voice, or by the device re-syncing (probe8 R1, R2). Each resolution happens through a new row, never by clearing the flag in place.
- Letting the athlete overwrite the device would instead erase the measured voice and let a stated amount replace a measured one. That would be a larger change than O-1 allows.
- **Residual, folded into C-O1-5 (Product/UX):**
  - A workout linked to the wrong session cannot be moved by either voice (`ACTIVITY_LINKED_ELSEWHERE`, cross-author). The athlete can only dispute it, which leaves the session uncredited for as long as the dispute stands.
  - A workout that is not the athlete's at all ("not my run") has no act to withdraw it.
  - Both stay conservative (no credit) but need an athlete act. See SSCTR-INT-03 (c) for the interim linking rule.

### 3. A HealthKit re-sync with other values is bound as the device's own correction: **ACCEPT**

- The binding is by the activity, never by an id the HealthKit layer sends.
- An identical re-sync is a duplicate and creates no new version.
- A changed one supersedes the device's earlier report, which stays as history, and the athlete's merged voice is kept (authorship case 6; probe8 R2, R3).
- This matches the usual reasons a workout comes back with other values: post-processing, or an edit in another app. The latest device statement replaces the earlier one, and the athlete's own voice is untouched.
- Corrections do not count toward the day bound, so repeated re-syncs cannot crowd out new reports.
- A changed link (another session) is refused. See item 2's residual.

### 4. A workout dated in the future, or sent without a current screen, is not recorded and the app is told; it is sent again later: **ACCEPT_WITH_CONDITIONS** (SSCTR-INT-02, -04)

- **The delay does not change recognition** (probe4 C, probe5). Week-0 runs were imported in three ways:
  - directly with a screen;
  - first without a screen (ASK), then again on Sunday with one;
  - first dated in the future, then again later.
  
  The last two give the same Sunday status, the same in-force rows, the same athlete model and the same program. The only difference from the direct import is `decisions[0].asOf`, the time of the decision.
- The extra `RUN_REPORT_RECEIVED` facts that the ASK attempts leave in the record of formats (contract §10, pre-existing) had no effect on the program in this probe.
- **Safety is not delayed.**
  - A stop on an athlete form sent without a screen is not recorded, but it is kept in the record of formats and raises the screen at that answer and at every later review (probe4 B, probe6; see item 7).
  - Device reports carry no stop, by the voice guard, so nothing safety-bearing waits in the HealthKit queue.
- **Conditions:**
  - The re-send must carry the athlete's own last screen, unchanged (SSCTR-INT-04). The engine's "answered after the stop" test depends on the screen's real assessment date.
  - The re-send should not come after a review that would read those sessions as missed (SSCTR-INT-04).
  - Athlete forms named in `notRecorded` must be kept and re-sent like HealthKit workouts (SSCTR-INT-02). §9 states this only for HealthKit.

### 5. The bounds (4 device activities per session, 16 corrections per chain, 8 new reports per channel per day, 32 per request; a refusal records nothing and names the safety fields): **ACCEPT_WITH_CONDITIONS** (SSCTR-INT-01, -03)

- **Plausibility** (PLAUSIBLE_BUT_UNCERTAIN, used only as operational ceilings):
  - Eight new sessions a day per channel is well beyond double or triple days.
  - Four workouts linked to one session covers a run split by a pause, a battery or separate warm-up, main and cool-down recordings.
  - Sixteen corrections of one session is far more than honest editing.
  - Thirty-two reports per request is about five weeks of sessions, and a backfill is chunked.
- None of the bounds truncates anything, and none invents a hold or a clinical state.
- **What they can withhold:**
  - **(a)** A safety signal in a refused request. `safetyFieldsOf` names the observation stop, ADVERSE and IMPAIRED, and the review's `wellbeing`, `wellbeingCheck`, `readiness`, `interruption` and `eligibility`. The clinical flags live in `eligibility`, so that name covers them.
    - It does not name a reactive review `kind` (`SYSTEMIC_FATIGUE`, `LOCAL_FATIGUE`, `PROGRESSION_NOT_TOLERATED`). Those are nonclinical adaptation signals, but they should be kept like the rest (SSCTR-INT-01 (c)).
    - After 16 corrections, a later next-day IMPAIRED for that session can no longer reach it. For a warning sign, the session-free `notFeeling100` route remains (edge case; SSCTR-INT-01).
  - **(b)** Executed training in a refused device chunk. One workout over `deviceActivitiesPerSession`, or with `SPORT_MISMATCH`, `UNKNOWN_SESSION` or `ACTIVITY_LINKED_ELSEWHERE`, refuses the whole chunk of up to 32 (`index` is named). A queue that keeps every workout "until it is in `recorded`" would then retry that chunk forever and leave the other 31 uncredited (SSCTR-INT-03).

### 6. The custody `evolves` amendment: **ACCEPT**. No dose effect beyond the engine's own decisions.

- `evolves` admits only an in-place change of the row in force that meets all of these:
  - its identity and every field except `actual`, `response`, `provenance` and `conflicted` are byte-equal;
  - in its provenance, earlier parts and input hashes are kept byte-equal;
  - each new part, merged id or input hash is a report of **this** review;
  - the row's own voice is unchanged;
  - a conflict flag is never cleared in place.
- **It writes nothing of its own. Its only effect is that custody now stores the ledger the engine returned** (invariant 1, tested after every operation) instead of refusing the review whole.
- Before the amendment, the core run journey (watch, then form) and a contest kept as a voice could not be recorded at all (13 of 41 tests RED on the base custody). That was a recognition and safety loss, because the second voice and any stop in it were refused. The amendment removes that loss and adds no reading.
- The amended `actual`/`response` is the engine's own merge, which the engine already uses for dose. Custody does not recompute it.
- The engine's real resolutions fit the rule (probe8): a dispute resolved by either voice arrives as a new row with the old one superseded, never as a flag cleared in place.
- If a future engine evolved a row outside these shapes, custody would refuse the review whole and record nothing. That is a loud, conservative failure, and it is a re-review trigger.
- Which voice fills a conflicted row's `actual` depends on arrival order (probe9: device first, then the athlete's stop, versus the athlete's form, then their own correction to a stop). That is O-1 engine behaviour, pre-existing, and the amendment neither creates nor changes it. Both orders are CONFLICTED, train nothing, raise the screen and give the same program.

### 7. The run-format record is carried; a refused symptom stop keeps asking for the screen: **ACCEPT**. This matches the engine's intended behaviour.

- The engine asks for the warning-sign screen for a SYMPTOM stop found either in the record of formats or in a row, until an eligibility screen that is `NONCLINICAL_CONFIRMED`, has every sign false and was assessed after the stop is answered (`v1-run-format-index.mjs` `readingOf`/`answeredAfter`).
- Through the boundary (probe6), a stop refused for lack of a screen:
  - asks at the same answer, at a later review the same evening and on the next day;
  - still asks with a screen dated the stop's own day;
  - stops asking only with a screen dated after the stop.
- Through the frozen custody alone (probe7), the engine is handed an empty record of formats. With a screen dated the stop day it no longer asks. That is the gap C-NCC-3 (a) named, and the boundary closes it.
- In the probe the status was KEEP while the screen was REQUIRED. The screen is a reading beside the status, so the app must show it whatever the status is (SSCTR-INT-05).

## Findings and conditions

None of these blocks the synthetic candidate or its freeze. **All of them bind before any real athlete.** None changes a prescription, and none needs clinical judgment.

| Id | Severity | Owner | Finding / condition | Reproduction |
|---|---|---|---|---|
| **SSCTR-INT-01** | Moderate | Engineering (boundary) with QRE/Security; Product/UX for the app | Safety content in a request refused for a report-level reason is held back until the app re-sends it. **(a) Preferred:** treat an athlete report identical to the one in force as a **duplicate** (as the device channel does) and let the rest of the request (wellbeing, readiness, check, eligibility) proceed. **(b) Required in any case:** a §9 obligation that a refusal carrying `safetyFields` is never discarded. The app re-sends the safety part without the refused report, or as a correction, and routes a warning sign past an exhausted correction chain to `notFeeling100`. **(c)** Add the reactive review kinds to `safetyFieldsOf`, or keep every athlete draft regardless of the names. | probe4 A: `NOT_FEELING_100` with a sign plus an already-logged run → `ALREADY_REPORTED`, `safetyFields [eligibility, wellbeing]`, nothing recorded. Without the report → `CLINICAL_HUMAN_REQUIRED`. |
| **SSCTR-INT-02** | Moderate | Product/UX + Engineering (native) | Athlete drafts follow the HealthKit queue rule: kept until their id is in `recorded` (a `notRecorded` entry or any failure code means keep). A correction is built from the report in force and changes only what the athlete changes, never from an empty form. | probe4 B (an athlete stop without a screen → ASK, not recorded, recorded only when re-sent); the shape of the correction in item 1. |
| **SSCTR-INT-03** | Moderate | Engineering (native) + QRE | **(a)** A permanently refused workout (any of the four codes in §5 (b)) is set aside, visible to the athlete, and the rest of the chunk is re-sent; never retried forever. **(b)** A refused link is re-sent unlinked (no `sessionId`) rather than dropped, so executed running is still on record. **(c)** Until C-O1-5 gives the athlete an act, the HealthKit layer links a workout to a session only when the match is unambiguous (same plan-local day, RUN, one candidate session); otherwise it sends it unlinked. | Code path of `admit` (whole-request refusal with `index`); `v1int-limits` "2000 workouts on one session"; authorship case 6 (`ACTIVITY_LINKED_ELSEWHERE`). |
| **SSCTR-INT-04** | Moderate | Engineering (native) + Security | The `eligibility` sent with `importActivities` is the athlete's own last answer, byte for byte. It is never re-dated or synthesised, because a re-dated screen would satisfy "answered after the stop" and refresh eligibility without the athlete. When the athlete answers a new screen, queued workouts are sent in, or immediately before, the review that carries it. | `readingOf` `answeredAfter`; probe6 (a screen dated after the stop silences the screen; one dated the stop day does not). |
| **SSCTR-INT-05** | Low | Product/UX | `warningSignScreen` REQUIRED is shown and leads to the existing screen whatever the answer's `status` (KEEP included). | probe6: "screen dated the stop day: KEEP, RUN_STOPPED_FOR_A_SYMPTOM". |
| **SSCTR-INT-06** | Moderate, pre-existing (not introduced by this candidate) | Engineering + Product/UX | The frozen `api.mjs` `observation()` carries only `completed`, `minutes`, `exercises` and `response`. It has no `actual.stop`, `rpe`, `conditions` or `walkBreaks`, so through `logRun`/`weeklyCheckIn` a run stopped for a symptom cannot be stated at all. The tests reach stops only through `submit` directly. Before real athletes, the app's run form needs a path that carries the stop to the engine. | `grep -c stop CoachingCore/src/boundary/api.mjs` → 0; api.mjs lines 9–12. |

**Observations (no new condition):**
- Freeze-7 exits 1 at the FREEZE-1 line (see Method). That is for QRE.
- The order-dependence of a conflicted row's `actual` (item 6) is engine O-1, pre-existing. C-O1-2, C-O1-3 and C-O1-5 are unchanged by this candidate and still bind as recorded.
- The repeated `RUN_REPORT_RECEIVED` facts after an ASK (contract §10) showed no dose effect in probe4 C/probe5. They remain the engine's to tidy.

## Status fields

- **Dispositions:** items 2, 3, 6 and 7 ACCEPT; items 1, 4 and 5 ACCEPT_WITH_CONDITIONS; overall ACCEPT_WITH_CONDITIONS.
- **Evidence status:**
  - The record-fidelity claims (items 1–4, 6, 7) are SUPPORTED_WITH_LIMITS. They are supported by tests and probes on synthetic athletes and one composed engine version, not by empirical product data.
  - The plausibility of the bounds (item 5) is PLAUSIBLE_BUT_UNCERTAIN and supports no prescription.
- **Confidence:** MODERATE. Each claim was probed directly with matched comparators. The scenarios are synthetic and cover week 0 of one plan shape.
- **Proposed AE action:** NOT_APPLICABLE. No adaptive decision is reviewed, and the engine's KEEP/ASK/HOLD/CLINICAL routes are unchanged. The ten AE questions are not applicable to an admission rule.
- **Gate status:** NOT_CLOSED_BY_THIS_RECORD. It closes no G01–G04 scope, and it does not close SEC-CORE-03, SEC-O1-03, C-F01-2, C-NCC-3, C-O1-3 or C-O1-5.
- **Publication:** NOT_PUBLISHED. Chief consolidates.
- **Validation:** human validation false, empirical product validation false, clinical clearance false.
- **Human revalidation queue:** **no item proposed.** Nothing here approves a prescriptive decision (a dose, a threshold, a progression or a recipe). These rulings are about the fidelity of the record. Nothing is appended.
- **Re-review triggers** (owner Chief, routed to SSCTR):
  - any change to `admit`, `LIMITS`, `safetyFieldsOf`, `evolves` or `reconcile`;
  - any engine change to merge, conflict or voice handling (O-1/E-1) or to the screen reading;
  - the decision on C-O1-5;
  - the native HealthKit linking rule;
  - the closure of SSCTR-INT-01 to -06;
  - the first real-athlete integration.
- **Expiry:** at the first of those events.
- **Supersedes:** nothing. Dependent items invalidated: none.
