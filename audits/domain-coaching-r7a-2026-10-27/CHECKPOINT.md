# DOMAIN_COACHING_R7-A — checkpoint

Read [TASK_CONTRACT.md](TASK_CONTRACT.md) first. Each resume point is appended; earlier ones are not edited.

## Resume point 1 — rehydrated, baseline captured, contract written (2026-10-27)

- **Rehydrated:** AGENTS.md, CLAUDE.md, CURRENT_MISSION.md, MISSION_LEDGER.md; R6 FINAL_REPORT, OPEN_GAPS_R6 (R7 entry and the 55 items), FINAL_DISPOSITION, FOUNDER_LOOP_BOUND, TASK_CONTRACT and CHECKPOINT resume points 18–20; SSCTR round-12 review (D53 from-log path, D54); VWS RECORD §6; PDR DR-117–123. Current runtime sources read: `r6-program.mjs` (strength state machine, `strengthDose`, `advanceStrength`, `buildWeek`, `projectWeeks`), `r6-adaptation.mjs` (weekly review, rebuild, schedule/conflict/equipment/return handlers), `r6-provenance.mjs`, `r6-intake.mjs`, `r6-catalogue.mjs`.
- **No concurrent mission:** no file in the tree was newer than the VWS verification (2026-10-27 09:31 −03:00) when R7-A started.
- **Baseline:** `node --test` in CoachingCore → **443/443 pass** (Node v24.19.0, about 11 s). `BASELINE.json` binds 1,007 files; `pre-r7a-source/` holds 73 files (src, tests, package.json, R6 policy, R6 dev fixtures) with `r6-program.mjs` `57973e97…`, the source SSCTR round 12 reviewed. Policy hash `18ec48f3…` (file sha `a75be1aa…`).
- **Routing:** T3/R2/L3/A4; the route-work helper could not run (no Python), matrix applied by hand. Judges: native SSCTR (dose-changing deltas only) and a fresh quality-reliability-engineer. Review-cycle bound set at the start (one review + at most one narrow re-check per judge).

**Next:** the class probes (BEFORE) on the pre-R7A runtime, then the structural fixes.

## Resume point 2 — class probes BEFORE (pre-R7A runtime)

Two instruments, both run on the unchanged runtime, outputs in `probes/`:
- **`ssctr-r12-instrument.mjs`**: a copy of the SSCTR round-12 probe with only its paths changed. On the unchanged runtime it reproduces **all 43 sections byte-identical** to the official `ssctr-probe-runtime-d53-r12.out.json` (determinism check). BEFORE: AI noisy-log grid 48 violations in 1,224 re-establishments (D53 from-log path); AK 70 rows above the phase dose (D54).
- **`r7a-class-probes.mjs`** (`R7A_RUNTIME=pre` runs the `pre-r7a-source` copy): output `r7a-class-probes.BEFORE.out.json`.

| Class | BEFORE | Mechanism found |
|---|---|---|
| C01 D53 | reproduced (SSCTR AI/AJ) | `strengthDose` decides "re-establishment" for any state with a >28-day gap; `advanceStrength` recognises one only when `ex.mode === 'KNOWN'` (`reestablishes`) |
| C02 D54 | reproduced (AK 70; C03 grid 120 race-window/post-event rows at 2×5 @RIR3 against 1 set @RIR≥4) | the re-establishment row returns before `phased()` |
| C03 early returns skipping the phase modifier | 3 early returns bypass `phased()`: re-establishment (violates), return entry for a new exercise and return step 0 (value-compliant today: 1 set @RIR4) | branch-local composition |
| C04 executed exposure (R19) | reproduced: 3×10 at the known load executed, later re-establishment row missed → next week 2 sets with a regain cap | the transition uses the last *prescribed* entry per exercise (`Map` overwrite), not the executed one |
| C05 TOTAL × PER_HAND | no engine conversion; the H07 relabelling comes from C07; a missing convention means the planned convention for logs and for intake records alike (consistent); single-implement exercises (goblet squats) carry PER_HAND in the catalogue | catalogue data |
| C06 source label | **not reproduced** (5 labels, 1 decision; intake exposure identical across 3 labels) | — |
| C07 unknown displaces known / order | reproduced: a wearable record without RIR replaces a complete self-reported dose (dose null); duplicate self-reports are order-dependent | last-wins `Map` merge in `canonicalizeIntake` |
| C08 duplicates | **not reproduced** (exact replay and an agreeing second source are invariant) | — |
| C09 contradictory reports | reproduced: two reports of one session with the same completion and minutes but loads 20 vs 40 kg merge silently; the pending loads depend on which arrives first | `physicalAgrees` ignores exercise logs |
| C10 corrections | reproduced: a correction accepted in one review is rejected (`INVALID_CORRECTION_CHAIN`) when the carried ledger is normalized again; the session loses its execution | superseded rows are dropped from the carried ledger (not append-only) |
| C11 inactive exercises | reproduced: in return step 2 a substitute gets the return-entry dose because rotated-out exercises stay at return step 0 | "entry week" scans every exercise in the state, not those in use |
| C12 unknown reps | reproduced: sets logged without reps are read as 0 reps → bodyweight reps regress (16 → 8); a known-load lifter's reviews fail (UNSUPPORTED) | `strengthLogs` maps a missing rep count to 0 |
| C14 stale/late report | **not reproduced** (decision unchanged) | — |
| C15 unreviewed weeks | reproduced: weekly review credits the projection (long 70), a schedule change at the same point plans 15-min runs | R18 (projection credit) composed with the ledger-based single-run ceiling (zero reading) |
| C16 scoped schedule change | reproduced: a one-day turn change (`from = to`) becomes permanent; the conflict day itself is unchanged | `scheduleChange` ignores the declared `changes.from/to` |
| C17 validation | `validateWeeks` has no phase-dose check, so the D54 rows pass validation | — |
| C18 race completion | reproduced: a 10K finished in 52 min against its 75-min window is PARTIAL and non-comparable | completeness compares minutes with the race window as if it were a target |

**Next:** structural fixes in `r6-program.mjs` (one composition point for every strength row; transition keyed on the executed exposure's kind), then the evidence-integrity fixes (C07, C09, C10, C12, C16, C18) and C11; C15 is routed (needs a review-continuity input and G03).

## Resume point 3 — structural fixes, invariant tests, R7A-FREEZE-1 (2026-10-27)

**Runtime changes** (5 files; diff `dossier/RUNTIME_DELTA_R7A.diff` against `pre-r7a-source`; policy `18ec48f3…` unchanged):
- `r6-program.mjs`:
  - `strengthDose` = `strengthCandidate` (kind, the count the phase applies to, row cap, reserve floor) → **one** `phaseDose` step for every row → `exposure` stamped on the row. No row returns before the phase step (D54; C03).
  - `advanceStrength` groups each exercise's exposures in the week: the **first executed** exposure decides the kind (R19), the **last executed** one gives the counts ("the last executed count"); the regain starts at every performed `REESTABLISH`, whatever the state's mode, from the count before its phase reduction (D53). Legacy rows without `exposure` are classified by `exposureKindOf` with the rules that wrote them.
  - Return-entry week = an exercise **in use** this week at the entry step (C11). `dayPhaseOf` is the single day-phase definition. `validateWeeks` checks every strength row against its day's phase dose (C17).
- `r6-prescription.mjs`: rows carry `exposure {kind, phase, phaseBasis, baseSets, normalSets}`.
- `r6-adaptation.mjs`: `usedInWeek` reads each row's exposure and session; `performedInWeek` returns `{date, sessions}`; a set without reps is unknown (`repsMet` null → HOLD, never REGRESS; C12); a race is complete whatever its time (C18); a dated schedule change is never applied beyond its dates (`to` → ASK; `from` → first week on or after it; C16); moves never cross a day phase; the carried ledger includes superseded facts.
- `r6-provenance.mjs`: superseded facts carried and found by later chains (C10); two reports of one strength session that disagree on an exercise's sets or load (beyond one smallest increment) are a conflict, in either arrival order (C09).
- `r6-intake.mjs`: order-independent merge of strength records; a record without a complete current dose never displaces one with it; complete doses that disagree → the latest leads, disclosed (C07).

**Tests:** `test/r7a-semantic-core.test.mjs` (17). Suite **460/460**. `probes/mutation-check-r7a.mjs`: **13/13** single-fix reverts caught (two test gaps found and closed first).

**Freeze:** `CoachingCore/r7/RUNTIME_FREEZE_R7A_1.json` — R7A-FREEZE-1, source digest `1f2bb1d8…`. No runtime edit while the judges review it.

**Evidence on the freeze:**
- Class probes AFTER: every class cleared except **C15** (routed: R18 + G03).
- `CoachingCore/r7/REGRESSION_R7A.json` (`scripts/regress-r7a.mjs`, both runtimes): R5 corpus 24/24 identical; dev profiles 16/16; simulations identical; R6 fresh holdout (regression only) 27/35 identical, 8 explained (H07 C07; H23 C16, the only disposition change: REARRANGE → ASK; H25 D53 from-log regain; H29/H30 C18; H32 C10 carried history; H26/H35 rows whose stated basis now reflects the post-return set cap, same visible dose).
- **Open question for the SSCTR (Q1):** the round-12 instrument's AI audit flags 370 (as prescribed) and 146 (noisy) weeks. All are one pattern: a re-establishment its phase reduced (consolidation: 1 set instead of 2), followed by the unreduced re-establishment count (2), as D49 prescribes for a phase-reduced return step 2. The audit predates D54 and measures from the reduced count.
- **Finding F-ACCESSORY-REPS** (routed to R7-B, not changed): under STRENGTH and MAINTAIN goals an accessory's rep target depends on its load mode (establishment and from-log rows: goal reps + 2; known rows: clamped to the goal's range), so reps fall 7→6 or 10→8 when the load becomes known. Neither rule is declared in the policy.

**Next:** SSCTR narrow review (dossier in `dossier/`), the independent engineering review in parallel, then closure. Cycle bound: one review + at most one narrow re-check per judge.

## Resume point 4 — judges dispatched on R7A-FREEZE-1 (2026-10-27 ~11:05 −03:00)

- **Independent engineering judge:** fresh `quality-reliability-engineer` (opus, xhigh), brief `dossier/ENGINEERING_REVIEW_BRIEF_R7A.md`, outputs `reviews/quality-engineering-r7a-review.{json,md}`.
- **SSCTR:** native `sports-science-concurrent-training-reviewer` (opus, xhigh), dossier `dossier/SSCTR_DOSSIER_R7A.md` (items 1–8, Q1–Q4), outputs `reviews/ssctr-r7a-review.{json,md}`.
- **Instrument AFTER** (`probes/ssctr-r12-instrument.AFTER.out.json`): AK 70 → 0; AI noisy next-exposure jumps 48 → 0; AH 0/584; every other difference explained in the dossier (Q1 pattern; R19; item 2b; `normalSets` metadata; the instrument's round-11 scaffolding cannot build with five changed files).
- **CQ-R6-06** (`probes/r7a-cq06-probe.mjs`): not reproduced on either runtime.
- **Mission snapshots:** `snapshots/CURRENT_MISSION.before-r7a-entry.md` and `snapshots/MISSION_LEDGER.before-r7a-entry.md`, reconstructed by removing only the R7-A blocks; their SHA-256 equal BASELINE.

**Rule while they run:** no runtime, test or policy edit. A fix after the reviews needs R7A-FREEZE-2 and at most one narrow re-check per judge (cycle bound).

**Next:** read both reviews; apply the cycle bound; class dispositions, readiness, handoff, final report, verifier, insert-only mission/ledger closure.

## Resume point 5 — second cycle applied, before R7A-FREEZE-2 (2026-10-27 ~13:00 −03:00)

**Judges' first round (on R7A-FREEZE-1):** SSCTR `reviews/ssctr-r7a-review.{md,json}` — runtime not accepted, one blocker **D55** (new, narrow, runtime-only); D53 and D54 RESOLVED; Q1 option A decided, Q2–Q4 confirmed; four proposed queue items (queue not edited). Engineering `reviews/quality-engineering-r7a-review.{md,json}` — NOT_READY, blockers QE-R7A-01…12 (all new, narrow, runtime-only), LOW 13–18. Cycle bound: the second cycle is admitted; at most one narrow re-check per judge follows, no further cycle.

**Second cycle (runtime):** one patch, `cycle2-patch.mjs` in the session scratchpad (46 exact single-occurrence replacements on the four FREEZE-1 files `r6-program`, `r6-adaptation`, `r6-provenance`, `r6-intake`); diff `dossier/RUNTIME_DELTA_R7A_CYCLE2.diff`. Covers QE-R7A-01…17 and D55; QE-18 routed to R7-B; the SSCTR's R20 adopted inside QE-14. Found and fixed by the author before the freeze: a fatigue-reduced week read as unreduced (first QE-14 version; the SSCTR's FR2 showed it) and a goal change effective next week re-planning this week for a phase rename (first QE-03 version; holdout H25).

**Tests:** `test/r7a-cycle2.test.mjs` (15). Suite **475/475**. The FREEZE-1 sources of the four files were recovered by reversing the patch and match `RUNTIME_FREEZE_R7A_1.json` byte for byte.

**Evidence on the candidate:** the engineering judge's own probes (re-run in an isolated copy): every QE-01…17 indicator moves from failing to fixed; the SSCTR's RS2 shows D55 fixed (+1 set at most, no block set) and FR2 unchanged; class probes `probes/r7a-class-probes.CYCLE2.out.json` as on FREEZE-1 (only C15, routed). Regression `CoachingCore/r7/REGRESSION_R7A.json` (FREEZE-1's kept as `REGRESSION_R7A_FREEZE1.json`): R5 24/24, profiles 15/16, simulations differ in T04/T13 (QE-12) and T05/T08 (QE-02), holdout 24/35 with every difference named in `scripts/verify-r7a.mjs` `EXPLAINED`, the only status change still H23. Two bookkeeping fields are ignored as byte-level in the regression (the recorded entry-week flag, per-report input hashes).

**Verifier:** `scripts/verify-r7a.mjs` now reads each freeze's own instrument outputs (`*.CYCLE2` for FREEZE-2), binds each judge's review to the freeze it reviewed (FREEZE-1 reviews; FREEZE-2 re-checks), accepts the queue only as a proven append (`QUEUE_INTEGRATION_R7A.json`), and explains every regression difference.

**Next:** mutation check and round-12 instrument on the candidate; `node scripts/freeze-r7a.mjs R7A-FREEZE-2`; fill the FREEZE-2 identity into `dossier/SSCTR_RECHECK_R7A.md` and `dossier/ENGINEERING_RECHECK_BRIEF_R7A.md`; dispatch the single narrow re-check to both judges; integrate the SSCTR queue items append-only; closure.

## Resume point 6 — R7A-FREEZE-2 frozen, single narrow re-check dispatched (2026-10-27 ~13:30 −03:00)

**Freeze:** `CoachingCore/r7/RUNTIME_FREEZE_R7A_2.json` — R7A-FREEZE-2, source digest `f56ae974762523b1efacd9ad7a9046cc7f6b7d33e42a7c2c955e758ef0f7821c`, 75 files, policy `18ec48f3…` unchanged; file SHA-256 `15be6a40875a8ce5ba833db542ee85a7e227736ed0997b0c3cf1072485189d07`. No runtime, test or policy edit from here on.

**Before freezing (author, after resume point 5):** a third author-found defect fixed — the first QE-12 version also applied when adopting a newly established load, so a re-establishment by effort (2x8 at 18 kg) kept the old 10-rep target (the SSCTR's SW `secondOnly`); now a log that confirms the known load leaves the target to the gate and a newly established load comes with its logged reps. The return ceiling follows the SSCTR's R20 (largest whole count executed outside a phase reduction, after the time fit).

**Evidence on FREEZE-2:** suite 476/476 (`test/r7a-cycle2.test.mjs`: 16); mutation check 33/34 caught, one documented survivor ("counts from the first executed exposure": no reachable case, `probes/r7a-mutant-reach-search.out.json` A = 0 in 30 timelines; B = 50 mid-week cases pin QE-04); class probes `*.CYCLE2` (only C15, routed); instrument `*.CYCLE2`: AK 0, AI noisy jumps 0, AH 0, differences from FREEZE-1 only QE-02 (AF, AG, AL return, Y, Y2) and the derived COMPARE; regression as in resume point 5 (every difference named). `node scripts/verify-r7a.mjs`: 8/11 (failing only the re-check reviews, the queue integration and the deliverables).

**Dispatched:** fresh `quality-reliability-engineer` (brief `dossier/ENGINEERING_RECHECK_BRIEF_R7A.md`, outputs `reviews/quality-engineering-r7a-recheck.{md,json}`) and native `sports-science-concurrent-training-reviewer` (dossier `dossier/SSCTR_RECHECK_R7A.md`, outputs `reviews/ssctr-r7a-recheck.{md,json}` and `reviews/ssctr-r7a-recheck-queue-items.json`), both opus / xhigh, in parallel. This is the single narrow re-check; there is no further cycle.

**Next:** read both re-checks. If a blocker remains: close NOT_READY with it named (no fix). Either way: integrate the SSCTR's queue items (`node scripts/queue-r7a.mjs`), update dispositions (scratchpad `update-dispositions.mjs`), readiness, final disposition, report, handoff (only if EXIT READY), `verify-r7a --write`, insert-only mission/ledger closure blocks, memory.

## Resume point 7 — R7-A CLOSED WITH AN EXPLICIT BLOCKER (2026-10-27 ~14:30 −03:00)

**Outcome:** R7A_EXIT_READINESS = **NOT_READY**; all seven R7-A verdicts NOT_READY (`CoachingCore/r7/READINESS_R7A.json`; `FINAL_DISPOSITION.json` here). No handoff (§22 requires READY); the unfinished handoff draft was removed. R7-B **not started**.

**Single re-checks on R7A-FREEZE-2:**
- Engineering `reviews/quality-engineering-r7a-recheck.{md,json}` (R7A-QE-r2): NOT_READY — 11 of 18 fixed; 01 (HIGH), 02, 03 (HIGH), 05, 12 partly fixed and blocking; new QE-R7A-19 (MEDIUM, blocking, from the second cycle); 13 partial and 20–23 new, all LOW non-blocking; 22 shows my "unreachable" mutation survivor is reachable (a test gap; the mutation record and the report were corrected).
- SSCTR `reviews/ssctr-r7a-recheck.{md,json}` (R7A-SSCTR-r2): runtime not accepted — D55 resolved; S2–S5, S7 hold; S6 in part; new D56 (time-fitted weeks raise or end the regain cap; from the second cycle; under §16 it keeps D53 from closing); four FREEZE-1 decisions re-bound and one new record; O-1/R28 and R25–R27 non-blocking.
- I reproduced QE-R7A-01, 03, 19 (judge probe P1) and D56 (SSCTR probe section D56) in an isolated copy: identical outputs.

**Closure records:** queue 127 → 132 append-only (`QUEUE_INTEGRATION_R7A.json`; supersedes the R6 verifier pin, which is not rewritten); `CoachingCore/r7/CLASS_DISPOSITIONS_R7A.json` R7A-DISPOSITIONS-2 (closure.blockers: QE-R7A-01, 02, 03, 05, 12, 19, D56; D53 and the R6 FREEZE-2 item reopened as OPEN_R7A_BLOCKER); `CoachingCore/r7/FINAL_REPORT_R7A.md` complete; `node scripts/verify-r7a.mjs --write` 11/11 (`r7/VERIFICATION_R7A.json`); insert-only closure blocks `DCR7A-20261027-closed-r1` in `CURRENT_MISSION.md` and `MISSION_LEDGER.md` (CR count unchanged at 2 each).

**Next (Founder decision, not started):** the report's §12 recommends a bounded follow-up for the seven blockers before R7-B — one same-week composition model (equipmentChange, rebuild from the current week, goalChange guard), the fit-aware whole-count test for the caps (D56), field-by-field merge (QE-05), the lighter-load shortfall (QE-12) and the SHORT return rule (QE-02) — then a new freeze and a narrow re-check by both judges. Do not reopen R7-A or R6 without a Founder mission.
