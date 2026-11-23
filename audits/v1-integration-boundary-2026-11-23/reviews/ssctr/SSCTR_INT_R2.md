# SSCTR narrow recheck: V1INT cycle 1, R2 (2026-11-23)

**Verdict on `d310fafbdb09b1d82f1ebe557259ac8fc5442f73`: ACCEPT_WITH_CONDITIONS. Nothing blocks the synthetic candidate.**
- **SSCTR-INT-01 is closed.**
- **SSCTR-INT-04 is closed on its boundary part.**
- The tightened `evolves` has no dose effect of its own.
- **QRE-INT-02 is a sporting concern of moderate severity.** It is about the completeness of pace evidence, not dose or safety. It binds before any real athlete sees a pace reading.
- One new low-severity finding: SSCTR-INT-R2-01.

SSCTR_INT_R1 otherwise stands. Its conditions SSCTR-INT-02, -03, -05 and -06 are now native obligations in contract §9, which I have not rechecked here.

## Reviewer, bytes, method

**Reviewer:**
- Role: SSCTR (SSCTR-1.0.0 / SSCTR-CONST-1.0.0), claude-opus-5-5, the same instance as R1.
- Authority: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical only.
- No human review took place, no clinical judgment was made, nothing was delegated and no native dispatch is claimed.
- No literature was needed: these are rules about admission and custody. The one sporting judgment (item 4) is labelled below.
- I did not read the Security or QRE reviews. I read CYCLE1.md and the source diff `a52db2b..d310faf` for `integration.mjs`, `admission.mjs` and `custody.mjs`.

**Bytes (SHA-256 prefixes at d310faf):**
- `integration.mjs`: `c2097750…`
- `admission.mjs`: `92631d69…`
- `custody.mjs`: `a3e604f6…`
- `CYCLE1.md`: `448be30e…`

**Commands, run from `CoachingCore/`:**
- `node --test` on `v1int-cycle1`, `-authorship`, `-custody`, `-journeys` and `-limits`: **54/54 pass**.
- I did not run `npm run verify` or the full suite.

**Probes:** in `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/a7b949d0-1d77-4bd5-b113-46af6e45887a/scratchpad/ssctr-int-r2/`:
- `r2a.mjs` to `r2e.mjs`, new for this round;
- my R1 `probe1`, `probe8` and `probe9`, re-run on d310faf with only the device `eligibility` argument removed, which the device channel now refuses.

## Item rulings

### 1. SSCTR-INT-01: an identical athlete report is a duplicate and the rest of the request goes on: **CONFIRMED, closed**

Results (r2a):
- **R1 reproduction, now fixed:** a `NOT_FEELING_100` with a warning sign plus the same run report already logged gives `OK`, `duplicates [0]`, `CLINICAL_HUMAN_REQUIRED`.
- **Merged voice:** the same holds when the athlete's report is a voice merged into a device row.
- **Clinical flag in a new screen:** a weekly review that re-sends the identical report together with a new screen carrying `pain: true` reaches the engine, and the answer is `CLINICAL_HUMAN_REQUIRED`. The duplicate does not swallow a new screen.
- **Changed report:** a report that differs (next-day function IMPAIRED added) is still `ALREADY_REPORTED`. Its refusal names `kind:NOT_FEELING_100`, `wellbeing`, `eligibility` and `response.nextDayFunction`, so the app knows to send it as a correction.
- **Comparison:** the duplicate test is against the report **in force** of the athlete's chain, using the boundary's facts digest (session, times, actual, response). A report that differs in any of these is not a duplicate.
- **No regression:** R1's correction-versus-original parity (probe1, probe9) and its merge and dispute paths (probe8) give the same results on d310faf.

**SSCTR-INT-R2-01 (new, Low, not blocking; owner Engineering for the boundary, Product/UX for the app):**
- A duplicate-only answer, which never consults the engine, now states `warningSignScreen: null` even while the screen is still required (r2e).
  - Reproduction: record a symptom stop, then send the identical report again. The answer has `warningSignScreen: null`, while `presentation().readings.warningSignScreen` is still `RUN_STOPPED_FOR_A_SYMPTOM`.
- An app that reads that `null` as "no screen needed" would close the screen early.
- Fix: the duplicate-only answer should omit the field, or return the stored reading. Until then, the app must take the screen only from answers the engine decided, or from `presentation`.
- This joins SSCTR-INT-05.

### 2. SSCTR-INT-04 / SEC-INT-01: the device carries only the athlete's own last screen: **CONFIRMED, closed on the boundary part**

- `importActivities` refuses any field besides the workouts (`INVALID_REQUEST`).
- A delivery carries the athlete's last screen byte for byte: the one from the onboarding or restart intake, or from the athlete's last review. tm-5 pins the onboarding screen.
- With no screen on record, the answer is `SCREEN_REQUIRED` and nothing is recorded.
- **After a symptom stop, a workout delivery does not answer the screen** (cycle-1 test; r2a 2a: the delivery on d3 is recorded and the screen is still asked).
- Only the athlete's own later screen, dated after the stop, ends it (r2a 2b). That is the engine's `answeredAfter` rule, unchanged.
- A screen that has gone stale (40 days in tm-5) is the engine's to judge: it gives ASK. That is the right owner.
- The native half of R1 SSCTR-INT-04 stays a §9 obligation: queued workouts go with, or just before, the review that carries a new screen. In R1's probes, the order made no difference to credit.

### 3. The tightened `evolves`: **ACCEPT. No dose effect.**

- `evolves` now checks a change against exactly two shapes and computes nothing:
  - **kept voice:** the amount, the response and the merged ids are byte-equal, and the row is flagged;
  - **merge:** each value comes from the row, from a new voice, or is the lower of two numbers. A stated value is never dropped, and a known response is never changed.
- In both shapes, each new voice's completion, stop, recovery and next-day function must equal the incoming report's. That protects the safety facts directly.
- The stored row is still exactly what the engine returned. The "lower of two numbers" is a check on the engine's own merge, not a value custody chooses.
- **No legitimate engine shape I know of is now refused.** On d310faf all of these are admitted, with results identical to R1:
  - watch then form, and form then watch;
  - a correction of a merged voice carrying stop, ADVERSE or IMPAIRED;
  - a dispute, then its resolution by either voice (probe8 R1–R3);
  - 2 or 3 device fragments on one session, with and without the athlete's form (r2b; my 4-fragment case failed only on a malformed time I wrote).
- If a future engine wrote a third shape, the whole review would be refused loudly. That is a re-review trigger, not a silent loss.

**Observation (pre-existing, engine, not caused by this line; for Core and the native linking rule):**
- The engine reads several device workouts linked to one session as **voices of one execution, not parts to add up**.
  - Two 15-minute fragments make a 15-minute row, not 30.
  - The athlete's 45 minutes beside them make the row CONFLICTED, which trains nothing (r2b).
- So a run split across workouts is credited low, never high. That is conservative.
- This corrects R1's rationale for the 4-activities bound, which assumed split recordings add up. The bound itself is unaffected.
- Until Core decides how fragments add up, the HealthKit layer's linking rule (R1 SSCTR-INT-03 (c)) should link at most one workout per session.

### 4. QRE-INT-02: an ASKed report leaves `RUN_REPORT_RECEIVED`, and the re-sent workout is withheld from pace evidence: **a sporting concern, Moderate.** Binding before real athletes see any pace reading; not blocking the synthetic line.

Measured (r2c, r2d). A week-3 run block was delivered after the onboarding screen had gone stale (ASK, nothing recorded). The athlete then answered a screen, and the same workouts were re-sent. The comparison is with the screen answered first.

- **Dose and safety: unaffected.** In both cases:
  - 4 workouts are credited;
  - the Sunday status (MODIFY) is the same;
  - the program is identical.
  
  Device facts carry no stop, so no safety statement is involved.
- **Pace evidence: lost.** All 4 re-sent workouts carry `paceWithheld: REPORT_NOT_CARRIED` in the run calibration, against none when the screen came first. There are 8 report facts against 4.
  - In this synthetic plan the calibration, forecast and pace insights did not change, because they rest on an official 10 km anchor.
  - So the probe shows the evidence is withheld. It does not show a changed estimate.

**Why it matters (PLAUSIBLE_BUT_UNCERTAIN, no literature needed for the direction):**
- The trigger is systematic, not exotic. It fires for the athlete who keeps running with the watch but does not open the app until the screen is stale.
- That athlete's recent runs are the most current evidence of their capacity on return.
- Withholding them can only leave pace readings on older evidence or make them fall back. It cannot add a faster estimate.
- But within the currency window, older and faster evidence can then stand for an athlete whose current runs show lower capacity. That is not the conservative direction for intensity.

**Urgency and owner:**
- Owner: Core + SSCTR, then a Founder decision for the engine change.
- It must be decided before any real athlete sees pace bands, estimates, a forecast or pace insights.
- It does not need to precede the synthetic freeze.

**Constraint for the fix (SSCTR):**
- The report fact of a report the decision did not record must not count as a report in force for the pace lineage.
- But a stop stated on an athlete form that got ASK must still reach the warning-sign screen, as it does now (R1 item 7).
- So the fix must separate the two. Pace lineage reads only recorded reports; the screen keeps reading stated stops whether or not they were recorded.
- Deleting the fact outright would reopen the R1 item 7 gap.

## Status fields

- **Dispositions:**
  - SSCTR-INT-01: closed.
  - SSCTR-INT-04: closed on the boundary part; the native ordering obligation stays in §9.
  - Tightened `evolves`: ACCEPT.
  - QRE-INT-02: a sporting concern, routed as above.
  - SSCTR-INT-R2-01: a new condition.
  - Overall: ACCEPT_WITH_CONDITIONS.
- **Evidence status:**
  - The record-fidelity claims are SUPPORTED_WITH_LIMITS: synthetic athletes, one engine version, probes with matched comparators.
  - The direction of the QRE-INT-02 effect is PLAUSIBLE_BUT_UNCERTAIN.
- **Confidence:** MODERATE.
- **Proposed AE action:** NOT_APPLICABLE.
- **Gate status:** NOT_CLOSED_BY_THIS_RECORD.
- **Publication:** NOT_PUBLISHED.
- **Validation:** human validation false, empirical product validation false, clinical clearance false.
- **Human revalidation queue:** no item proposed, because no prescriptive decision is approved. Nothing is appended.
- **Re-review triggers:**
  - any change to the duplicate rule, `safetyFieldsOf`, the device screen rule, `evolves` or `reconcile`;
  - an engine merge shape outside the two above;
  - the Core decision on QRE-INT-02 or on how device fragments add up;
  - the native linking rule;
  - the first real-athlete integration.
- **Supersedes:** nothing. SSCTR_INT_R1 stands except where this record closes a condition or corrects the 4-activities rationale.
