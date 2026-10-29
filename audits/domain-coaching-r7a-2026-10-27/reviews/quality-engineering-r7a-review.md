# R7-A independent engineering review (R7A-QE-r1)

**R7A_ENGINEERING_REVIEW = NOT_READY.** I found 12 blockers (4 HIGH, 8 MEDIUM) and 6 non-blocking LOW gaps. All 12 blockers are new to the recorded history, narrow and runtime-only, so the single narrow re-check allowed by the Founder's bound is admissible.

- **Reviewer:** Quality & Reliability Engineer (constitution 1.3.0). I am a fresh independent instance (claude-opus-5-5), not the runtime author. I did not fix anything.
- **Freeze reviewed:** R7A-FREEZE-1 (`CoachingCore/r7/RUNTIME_FREEZE_R7A_1.json`), policy `18ec48f3…`.
  - All 74 files match their SHA-256 hashes.
  - The source digest `1f2bb1d8…` recomputes exactly, using `hash()` over the `src/` entries as `scripts/freeze-r7a.mjs` defines it.
  - I verified this before and after all probes (`reviews/qe-verify-freeze.mjs` → `reviews/qe-verify-freeze.out.json`).
- **What I ran:**
  - `cd CoachingCore && node --test`: 460 tests, 460 pass, 0 fail (`reviews/qe-node-test.out.txt`).
  - 19 probe scripts under `reviews/qe-*`, all using the DEV_TEST_ONLY `devAuthority()`.
  - The pre-R7A runtime, rebuilt byte-exact from `pre-r7a-source/` in the OS temp directory (`qe-lib.mjs` `pre()`). Each finding says whether it also reproduces there.
  - I did not run `npm run verify` or any `verify-r*` script. Nothing under `CoachingCore/` or any R5/R6 path was edited.
- **Reproducing:** run from the repo root with `node audits/domain-coaching-r7a-2026-10-27/reviews/<script>`. Outputs were captured with `> reviews/<name>.out.json 2>&1`. Prefix `QE_RUNTIME=pre` to run a probe against the pre-R7A runtime (giving `*.PRE.out.json`). Machine-readable report: `quality-engineering-r7a-review.json`, built from the outputs by `qe-build-review.mjs`.

## Summary

The R7-A mechanisms hold where they were aimed:
- **D53:** no regain violation in a 192-timeline grid across every state mode.
- **D54:** composition holds; no phase-dose error in any single-branch program or proposal.
- **Unknown repetitions** are not treated as met or missed.
- **Legacy programs** handed over from the pre-R7A runtime behave as before.

The headline invariant ("the coach does not change meaning just because the same situation entered through another branch, state mode, phase or representation") fails through neighbouring branches:
- Same-week review order erases a return.
- The return-day boundary skips the entry dose.
- An event-date change leaves race-window days at build doses, and the new validation then rejects ordinary proposals.
- Canonical-input stability fails for complementary duplicates, rep/RIR contradictions, pound loads, carried corrections and cross-review replays.

STOP_WHEN ("no known HIGH structural failure of this phase stays open") is therefore not met.

Ten of the 12 blockers predate R7-A: they reproduce on the R6 closure runtime. **QE-R7A-04** was introduced by the R7-A validation. **QE-R7A-07** is a partial R7-A fix.

## Blocking list

| Id | Sev | Finding | New | Narrow | Runtime-only |
|---|---|---|---|---|---|
| QE-R7A-01 | HIGH | A return started next week is erased by any later review of the same week (arrival order) | yes | yes | yes |
| QE-R7A-02 | HIGH | A session later on the return-review day keeps its full pre-break dose and counts as the return entry | yes | yes | yes |
| QE-R7A-03 | HIGH | Event moved closer or added: this week's remaining race-window and taper days keep their BUILD doses; a postponed race keeps its old RACE session | yes | yes | yes |
| QE-R7A-04 | MEDIUM | R7-A phase-dose validation then rejects ordinary same-week proposals (40 of 102; all accepted before R7-A) | yes | yes | yes |
| QE-R7A-05 | HIGH | An agreeing second report replaces the whole exercise list (fewer exercises or no loads erase manual logs); a provider-label prefix alone decides it | yes | yes | yes |
| QE-R7A-06 | MEDIUM | Rep or RIR contradictions between two reports are merged by arrival order, not quarantined | yes | yes | yes |
| QE-R7A-07 | MEDIUM | The R7-A conflict check skips pound loads: 80 kg vs 100 lb merges and the squat drops to 45.5 kg | yes | yes | yes |
| QE-R7A-08 | MEDIUM | A correction of a merged duplicate's eventId is rejected once carried; the session loses every live fact | yes | yes | yes |
| QE-R7A-09 | MEDIUM | An exact replay in a later review of a merged report is quarantined as a conflict | yes | yes | yes |
| QE-R7A-10 | MEDIUM | A moved key session keeps the kind of its original date: KNOWN back squat 30 days after the last exposure | yes | yes | yes |
| QE-R7A-11 | MEDIUM | EQUIPMENT_CHANGE takes any from/to string; a malformed end date makes a temporary change permanent in effect | yes | yes | yes |
| QE-R7A-12 | MEDIUM | One set below target (3 of 5) gives HOLD, yet next week is 3x3, below the goal range [4, 6] | yes | yes | yes |

What the three labels mean:
- **New:** not in `OPEN_GAPS_R6` or the R7-A class table as found. Class C08 was recorded "not reproduced" by the author.
- **Narrow:** one code locus each, listed below.
- **Runtime-only:** the current policy text already states the required behaviour (D49 / strengthEntryWeek, proximitySemantics, learning.conflicts, principle 9, loadUnits, resumeAfterDays, gates HOLD), so no policy hash change is implied.

Two groups share a root and can share a fix: 03 and 04, and 05, 08 and 09 (the duplicate-merge path).

## Blocking findings

### QE-R7A-01 (HIGH): a return is erased by a later review of the same week
- **Class:** order dependence; invalid state reconstruction.
- **Mechanism:** with fewer than two sessions left, `returnAfterPause` re-plans from week w+1 and stores the return only in `stateTrace[w+1]`. `weeklyReview` (r6-adaptation.mjs:353) and `rebuild` with fromWeek w+1 (:450) then re-derive w+1 from `stateTrace[w]`, the pre-break state.
- **Reproduction:** `qe-probe-A-return-then-weekly.mjs` → `qe-probe-A.out.json`. Setup: a 16-day break, return reported on Sunday 20:00, weekly review at 21:00.
  - **Return review alone:** `week6FirstRow "back-squat 1x5@4 ESTABLISH kind=RETURN_ENTRY"`, run `["EASY:15","EASY:15","LONG:20"]`.
  - **Return then weekly:** `"MODIFY/GATED_NEXT_STEP"`, `runModeWeek6 "EASY"`, every `returnStep null`, `"back-squat 4x5@3 KNOWN 82.5 kind=KNOWN"`, run `["EASY:40","QUALITY:41","LONG:65"]`.
  - **Weekly then return (opposite order):** keeps the entry (`1x5@4 … RETURN_ENTRY`, mode `RETURN`).
  - **Same through SCHEDULE_CHANGE:** `"MODIFY/REARRANGE_FUTURE_WEEKS"`, `"back-squat 4x5@3 KNOWN 82.5"`.
  - **Pre-R7A runtime:** identical (`returnErasedByWeeklyReview: true`).
- **Claim broken:** headline and STATE_COMPOSITION_STABILITY.

### QE-R7A-02 (HIGH): the return-day session keeps its pre-break dose
- **Class:** event-day boundary; skipped modifier.
- **Mechanism:** `returnAfterPause` re-plans only `s.date > asOfLocal` (:611, :615).
- **Reproduction:** `qe-probe-A2-return-same-day.mjs` → `qe-probe-A2.out.json`. The return is reported at 07:00 on day 0, before the day-0 PM strength session.
  - The state at week start already has `back-squat` at `returnStep 0`, yet the same day prescribes `"2026-12-07 d0 w5-str-d0 back-squat 4x5@3 KNOWN 82.5 kind=KNOWN"`. The day-4 session is correctly `"db-rdl 1x5@4 ESTABLISH kind=RETURN_ENTRY"`.
  - After the weekly review, back squat is at `returnStep 1` and next week is `"back-squat 2x5@3 KNOWN 82.5 kind=RETURN_STEP"`: the full-dose session counted as the return entry and its load as the entry log.
  - Pre-R7A runtime: identical.
- **Claim broken:** strengthEntryWeek, strengthReturnSets and returnLoadCap.

### QE-R7A-03 (HIGH): an event change leaves the current week at old doses
- **Class:** skipped modifier through another branch; stale state across a skeleton change.
- **Mechanism:** `goalChange` → `rebuild` re-plans from w+1, while the merged phases change raceWeek, raceDay and taperStart. Week w is neither re-dosed nor validated (validation runs from fromWeek).
- **Reproduction (race moved earlier):** `qe-probe-B-event-date-current-week.mjs` → `qe-probe-B.out.json`. A 10K moved to 2026-12-21, 7 days after the review, leaves the rest of week 6 as follows:

  | Day (phase now) | Days to race | Kept dose |
  |---|---|---|
  | d1 (RACE_WEEK) | 6 | EASY 45 min |
  | d3 (RACE_WEEK) | 4 | THRESHOLD 43 min |
  | d3 (RACE_WEEK) | 4 | strength `db-rdl MAIN 4x5@3 KNOWN 24 rowPhase=BUILD`, … `db-split-squat ACCESSORY 3x6@3`, `dead-bug ACCESSORY 3x10@3` |
  | d6 (RACE_WEEK) | 1 | LONG 70 min |

  A twin program generated with the new date prescribes, for the same days: EASY 25, RACE_TOUCH 25, strength `db-rdl 1x@4, db-row 1x@4, db-bench-press 1x@4`, SHAKEOUT 15. The pre-R7A runtime keeps the same old doses.
- **Reproduction (race postponed):** `qe-probe-B3-race-postponed.mjs` → `qe-probe-B3.out.json`. Postponing the race a week during race week gives `raceSessionsInProposal ["w13 2027-02-07 w13-race","w14 2027-02-14 w14-race"]`: two races.
- **Claim broken:** claim 1 (every generated or proposed week) and proximitySemantics.

### QE-R7A-04 (MEDIUM, introduced by R7-A): false UNSUPPORTED after an event change
- **Class:** the new validation reads rows it did not write.
- **Reproduction (single case):** same probe as 03, after the event change.
  - UNAVAILABLE_DAY for the Tuesday run → `"UNSUPPORTED"`, errors `["w6-str-d0:phaseDose:back-squat:sets", …]`.
  - SYSTEMIC_FATIGUE → `"UNSUPPORTED"`: the athlete gets no reduction at all.
  - The pre-R7A runtime gives `MODIFY/RESCHEDULE_WITHIN_WEEK` and `MODIFY/REDUCE`.
- **Reproduction (grid):** `qe-probe-N2-after-event-change.mjs` → `qe-probe-N2.out.json`. `sameWeekProposalsAfterChange 102`, `rejectedWithPhaseDose_current 40`, `ofWhichAcceptedByPreR7A 40`, for example `"TEN_K:w11:SYSTEMIC_FATIGUE cur=UNSUPPORTED(5) pre=MODIFY"`.
- **Scope:** single-branch use is not affected (probe N: 467 branches, 0 phase-dose rejections).

### QE-R7A-05 (HIGH): an agreeing second report replaces the exercise list
- **Class:** unknown displaces known; provenance leak by label.
- **Mechanism:** a better-ranked duplicate merges with `previous.actual={...previous.actual,...o.actual}`, so `exercises` is replaced wholesale. The rank is WEARABLE_FULL when the provider starts with "WEARABLE" or an activityId is present (r6-provenance.mjs:14, :105-106).
- **Reproduction:** `qe-probe-CDEF-provenance.mjs` (C) → `qe-probe-CDEF.out.json`, and `qe-probe-C34-merge-label-and-drift.mjs` → `qe-probe-C34.out.json`.
  - **Watch report with only the squat:** `conflicts 0`, `SAME_EXECUTION_DIFFERENT_SOURCE`; gates move from all `ADVANCE` to `"db-bench-press":"HOLD","db-row":"HOLD","db-calf-raise":"HOLD","dead-bug":"HOLD"`; logs keep only `back-squat`; `decisionUnchanged false`.
  - **Watch report without loads:** every log `load null`, `decisionUnchanged false`.
  - **Label only (C3):** provider `'WEARABLE_WATCH'` changes the decision, `'SMARTWATCH'` does not (`a:false, b:true`).
  - **Twelve weeks (C4):** with manual full logs plus a watch report of the first exercise, `db-bench-press` is done twice a week but keeps `lastPerformed "2026-10-29"`, the intake date. From week 3 there are 17 rows such as `"2026-11-30 d0 w4-str-d0 db-bench-press 2x5@3 ESTABLISH kind=REESTABLISH"`, and every review is `MODIFY/GATED_NEXT_STEP`.
  - Pre-R7A runtime: same.
- **Claim broken:** claim 6 (an agreeing second report changes nothing; a source label alone changes nothing) and policy principle 9. HealthKit inbound is V1 scope, which makes this ordinary use.

### QE-R7A-06 (MEDIUM): contradictory reps or RIR are merged by arrival order
- **Reproduction:** `qe-probe-CDEF-provenance.mjs` (D). Two same-rank reports agree on sets and loads; the squat reps differ (3 vs 5 against a plan of 5).
  - Reps 3 arrives first: `conflicts 0`, gate `HOLD`, log reps 3.
  - Reps 5 arrives first: `conflicts 0`, gate `ADVANCE`, log reps 5.
  - `sameDecisionEitherOrder false`; the same holds for RIR 0 vs 3. Pre-R7A runtime: same.
- **Mechanism:** R7-A `physicalAgrees` compares per-exercise set counts and the heaviest load only.
- **Claim broken:** "contradictory reports … are a conflict in either arrival order" and learning.conflicts.

### QE-R7A-07 (MEDIUM, partial R7-A fix): pound loads skip the conflict check
- **Mechanism:** `exerciseFacts` (r6-provenance.mjs:52) reads only bare numbers or `unit KG`.
- **Reproduction:** `qe-probe-D2-lb-conflict.mjs` → `qe-probe-D2.out.json`. The manual report is 80 kg.
  - A watch report of 100 lb gives `conflicts []`, `SAME_EXECUTION_DIFFERENT_SOURCE`, `squatStateNextWeek 45.5`.
  - The same pair written in kilograms (45.5 kg) gives `CONFLICTING_PHYSICAL_OR_RESPONSE_REPORTS` and the state stays at 80.
  - The pre-R7A runtime merged both pairs.
- **Claim broken:** claim 6 and loadUnits.

### QE-R7A-08 (MEDIUM): a corrected duplicate loses its correction once carried
- **Reproduction:** `qe-probe-CDEF-provenance.mjs` (E). Manual run report M, an agreeing watch report W merged into M, then a correction C with `correctionOf` W.
  - First review: live `[["qe-e-C",55]]`.
  - Carried review: live `[]`, excluded `[["qe-e-C","INVALID_CORRECTION_CHAIN"]]`, `idempotent false`. End-to-end week-1 review: live `[]`. Pre-R7A runtime: same.
- **Mechanism:** the duplicate's eventId resolves only within the review that merged it.
- **Claim broken:** this is a residual of the claimed C10 fix.

### QE-R7A-09 (MEDIUM): an exact replay across reviews becomes a conflict
- **Reproduction:** `qe-probe-CDEF-provenance.mjs` (F). Review 1 merges M and W. Review 2 the same evening re-sends M unchanged.
  - Result: `EVENT_ID_REUSED_WITH_DIFFERENT_FACTS`, run row `CONFLICTED`, `"EASY":"HOLD"`, `replayChangesDecision true`. Without the replay the row is `COMPLETED` and the decision `KEEP/INSTANTIATE_LOGGED_LOADS`.
  - Pre-R7A runtime: same.
- **Claim broken:** an exact replay changes nothing.

### QE-R7A-10 (MEDIUM): a moved session keeps the kind of its original date
- **Mechanism:** `moveCandidates` clones the target rows (r6-adaptation.mjs:378). The R7-A guard checks the day phase but not the date-dependent re-establishment rule (r6-program.mjs:360).
- **Reproduction:** `qe-probe-G-move-reestablish.mjs` → `qe-probe-G.out.json`. The day-0 LOWER session (`back-squat 3x5@3 KNOWN 82.5 … daysSinceLast=28`) is moved to day 2 (`MOVE_TO_w5-str-d2:true`), giving `back-squat 3x5@3 KNOWN 82.5 kind=KNOWN daysSinceLast=30`. The policy re-establishes by effort beyond 28 days. Pre-R7A runtime: same.
- **Claim broken:** headline and resumeAfterDays / SSCTR D52.

### QE-R7A-11 (MEDIUM): equipment windows accept any date string
- **Mechanism:** `equipmentChange` takes from/to unchecked (:520), and `templatesForDate` compares dates as strings.
- **Reproduction:** `qe-probe-H-equipment-window-dates.mjs` → `qe-probe-H.out.json`.
  - A valid one-week window substitutes `w3` only.
  - `to:"soon"` substitutes `w3` through `w11` (the whole program) while being stored as a window.
  - `to:"2026-13-45"` substitutes `w3` through `w8`.
  - An inverted window gives `KEEP`.
  - SCHEDULE_CHANGE with the same dates answers `ASK` with `missingInputs ["changes.to"]`.
- **Claim broken:** a dated change is never applied beyond its dates.

### QE-R7A-12 (MEDIUM): HOLD does not hold after a known shortfall
- **Reproduction:** `qe-probe-R-unknown-reps.mjs` (R2) → `qe-probe-R.out.json`. One squat set at 3 of 5 reps gives gate `HOLD`, but week 1 prescribes `"back-squat 3x3@3 KNOWN 80"` with `goalRepRange [4,6]`. Pre-R7A runtime: same.
- **Mechanism:** adoption sets `ex.reps = log.reps` whatever the gate (r6-program.mjs:475).
- **Claim broken:** it violates the C12 invariant the R7-A test states ("reps never fall within one load mode") for a known shortfall.

## Non-blocking gaps (LOW)

- **QE-R7A-13: intake merge (`qe-probe-I-intake-merge.mjs`).**
  - On the same date the literal label decides: `SELF_REPORT` gives 20 kg, swapping the labels gives 24 kg, and `self_report` or `MANUAL` are not recognised.
  - `observedAt` is compared as a raw string: `2026-10-30T01:00:00+05:00` beats a later `2026-10-29T22:00:00Z`.
  - A later record without any load drops the load hint, so the first log becomes `pendingLoad 20` plus `ESTABLISHMENT_LOG_UNCONFIRMED` instead of `KNOWN 20`.
  - Non-blocking because the result is conservative and the disagreement is disclosed.
- **QE-R7A-14: a time-budget trim reads as a phase reduction (`qe-probe-J-budget-trim.mjs`, `qe-probe-M-legacy-representation.mjs`).**
  - `fitStrengthSession` lowers sets after `strengthDose`; the review compares row sets with `exposure.baseSets`, while the projection and the legacy fallback use the untrimmed plan.
  - Evidence: 58 trimmed rows in unreduced phases; the only cross-runtime difference is `db-bench-press` lastExecutedSets 3 vs 2; stripping `exposure` turns `db-calf-raise 2x10` into `1x10` (regain base).
  - Introduced by R7-A, and conservative. It is related to the routed Q1.
- **QE-R7A-15: two return-entry-week definitions disagree (`qe-probe-K-entry-week-definitions.mjs`).** With a 30-minute budget and a return plus a same-day move to machines, the new mains are prescribed `2x8@3 FIRST_ESTABLISH` while the transition places them at `returnStep 1`. With a 60-minute budget they get `1x8@4 RETURN_ENTRY`.
- **QE-R7A-16: a new observation flagged `superseded:true` vanishes (`qe-probe-OPQ-minor.mjs`, O).** It ends with accepted 0 and excluded 0, even for a future-dated fact.
- **QE-R7A-17: practice flag differs by reading (`qe-probe-OPQ-minor.mjs`, P).** The LUNGE practice row `split-squat-bodyweight` (catalogue role ACCESSORY) gets `lastExecutedSets 1` in the reviewed transition; `sit-to-stand` does not.
- **QE-R7A-18: the same exercise twice in one session (`qe-probe-OPQ-minor.mjs`, Q).** CORE-template rotation gives 36 sessions with the same exercise twice, for example `"w2-str-d4 STRENGTH_CORE [side-plank,standing-calf-raise,side-plank]"`. Pre-existing rotation.

## Claims I tried to break and could not

- **D53, every state mode (`qe-probe-L-d53-grid.mjs`).** 192 timelines covering KNOWN, pending, unlogged and twice-re-established states; mid, block-end, consolidation and late gaps; as-prescribed, one-set and no-detail execution; STRENGTH and GENERAL goals; two or three strength days (split week by date). Result: 1,092 performed re-establishments, 5,844 later rows, **0 violations** of "at most one set per week", and 0 phase-dose errors.
- **Phase dose in single-branch use (`qe-probe-N-false-unsupported-grid.mjs`).** 467 review branches across 10K, half-marathon and no-event programs: missed session, unavailable day, fatigue, temporary equipment change, schedule change, goal change, event later and earlier, and returns of 12, 20 and 40 days. Status counts are within one case of the pre-R7A runtime (KEEP 42/41, MODIFY 410/411, ASK 15/15), with 0 phase-dose rejections and 0 new UNSUPPORTED.
- **Unknown repetitions (`qe-probe-R-unknown-reps.mjs`).** All-unknown, mixed, string, negative and null reps all give `HOLD`, `repsMet null`, and no load, rep or tick change.
- **Legacy programs (`qe-probe-M-legacy-representation.mjs`, M2).** Pre-R7A programs reviewed by the current runtime from mid-horizon reach the same final week in all 5 scenarios.
- **Executed versus prescribed exposure (G2).** A session performed two days late is read as executed.
- **Previously verified paths.** C06 (labels on identical observations), C18 (race completion) and C16 on the schedule path hold, per the author tests and probe H.

## Not counted (known and routed)

C15 / SSCTR R18 (routed to R7-C), F-ACCESSORY-REPS (routed to R7-B), and the regain base after a phase-reduced re-establishment (SSCTR Q1).
