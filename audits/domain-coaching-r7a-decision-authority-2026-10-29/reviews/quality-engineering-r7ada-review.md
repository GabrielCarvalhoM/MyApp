# QUALITY & RELIABILITY ENGINEERING REVIEW — R7-A DECISION AUTHORITY

**Review:** R7ADA-QE-r1, 2026-10-29. Independent Quality & Reliability Engineering judge, in a new session. I am not the author. I made no runtime or test change, no fix, no correction cycle and no freeze. I do not start R7-B0 and I issue no `R7A_EXIT_READINESS`.

**Freeze reviewed:** **R7A-DECISION-AUTHORITY-FREEZE-1**, record `CoachingCore/r7/decision-authority/RUNTIME_FREEZE_R7A_DECISION_AUTHORITY.json` (SHA-256 `8d5c7146…`).
- Source digest `3a7166b25aaf550f7692cc058f0e582b42e9eb7f74b9e361f23733b5e74ab244`, recomputed with my own canonical serializer at the start and at the end.
- Manifest digest `a500cdd94b8a4994a718029d4ee6efdc703e4f54de59d0855b5598c0d1afb224` (85 files). Policy R6-POLICY-5 `18ec48f3…`, unchanged.
- Freeze commit `d4631cd03fb27bbc1857532500748476ab764987`; handoff commit `5434b3265f5634d1e7c796426cd9d8415b3b1af2`.

**Brief:** [ENGINEERING_REVIEW_BRIEF.md](ENGINEERING_REVIEW_BRIEF.md), with the Founder's review request of this session (the five classes A–E, the finite stop condition).

**Where this review is recorded:** branch `review/r7ada-decision-authority-engineering`, created from `5434b32` at the Founder's instruction. The baseline branch `claude/trusting-euler-04la8t` is not changed.

```
R7A_DECISION_AUTHORITY_ENGINEERING_REVIEW = NOT_READY
REVIEW_INVALID = NO   (bytes equal to the freeze at the start and at the end)
```

> **Is there any material normal V1 path that still violates factual authority, correction/retraction consistency, coherent decision resolution, evidence-based progression, or the return ceiling?**
>
> **Yes, on two of the five classes.** C and D hold on every path I tried.
>
> - **A/B (QE-R7ADA-01), the class of QE-R7ASC-01.** Contract A3 re-plans after a correction only inside `weeklyReview`.
>   - A correction, or a late wearable record that quarantines a session, can arrive with any other review kind that does not re-plan the current week: an unavailable day, a schedule or goal change (a no-op, or one effective next week), local fatigue that reduces, or a turn conflict.
>   - In that case the week keeps its rows planned from the retracted fact.
>   - Suppose history still holds the exercise as KNOWN at the lower, factual load. The stale row is then the D44 reference, and a log within one increment of it is adopted silently.
>   - The same facts delivered with the closing review are asked about (`LOGGED_LOAD_ABOVE_PLAN`).
>   - Identical facts therefore give HistoricalState `KNOWN 24` or `KNOWN 20`, and next week `KNOWN 24` or `KNOWN 22`.
> - **E (QE-R7ADA-02), the class of F4.** A SHORT return resumes the run state history carries. Only walk/jog *steps* are capped at the step last run.
>   - After the ladder's last step (step 8, a 20-minute continuous jog), a short break resumes 25-minute continuous runs the athlete never ran.
>   - For an EASY runner, a short break resumes long-run and easy-run steps that were released but never executed.
>   - Both contradict R6-NONCLINICAL-RETURN condition 7: "resume the last executed doses … the next step waits for executed sessions".
>
> QE-R7ASC-02, QE-R7ASC-03 and QE-R7ASC-04 are closed on their classes.
> - QE-R7ASC-01 is closed on its reproductions, and in the FROM_LOG state through every review kind.
> - F4 is closed on its cells.
> - The earlier blockers stay closed.

## 1. Integrity

| Check | Result |
|---|---|
| Branch, HEAD | Reviewed on `review/r7ada-decision-authority-engineering` = `5434b32` (child of `d4631cd`). `claude/trusting-euler-04la8t` = `5434b32`, unchanged |
| Source digest | `3a7166b2…`, recomputed independently and cross-checked with the runtime's `hash()`. Equal to the record and to the value in the request, at the start and at the end (`qe-r7ada-runs/integrity.start.out.json`, `integrity.end.out.json`) |
| Manifest | `a500cdd9…`: 85 of 85 bound files match. None missing, unfrozen or stray under `src/` or `test/`. One `RUNTIME_FREEZE_*` file |
| Freeze commit | All 85 bound files' git blobs at `d4631cd` equal the record. The freeze record at `d4631cd` equals the working tree |
| Handoff commit | `5434b32` changes only `CURRENT_MISSION.md`, `MISSION_LEDGER.md` and `REVIEW_HANDOFF.md`. All 85 bound blobs at `5434b32` equal the record. The runtime under review is byte-identical to the freeze commit's |
| Policy | R6-POLICY-5, canonical hash `18ec48f3…`, recomputed, unchanged |
| Delta from the predecessor | Recomputed and equal to the recorded delta. Changed: `src/r6-adaptation.mjs`, `src/r6-program.mjs` and three tests. Added: `test/r7ada-decision-authority.test.mjs` |
| Predecessor copy | `state-consumer-freeze-source/`: 84 of 84 match its MANIFEST. Source `adab3716…` and manifest `4f11f4b4…` recomputed. The original freeze file is unchanged |
| `node --test` (Node v24.19.0, official build, checksum verified) | 663 of 663 (`qe-r7ada-runs/node-test.out.txt`). No test writes to disk (checked first). The locked `ajv` was installed with `npm ci` into the git-ignored `node_modules/`, which is not a bound file |
| `node CoachingCore/scripts/verify-r7ada.mjs --tests` (read-only) | 13 of 14. Only `reviews-not-dispatched` fails, by design, because this review writes into `reviews/` (`qe-r7ada-runs/verify-r7ada.read-only.out.json`) |

**Not run:** any `--write`, `freeze-*`, `prepare-*`, `queue-*` or `regress-*` script, and any author evidence runner other than the self-challenge, which was re-run to stdout only.
- Every probe ran from my own folder, wrote only into `qe-r7ada-runs/`, and is bound with its output's SHA-256 to the digest in `qe-r7ada-runs/RUNS.json`.

**Diagnostics outside the repository.** To locate one mechanism (OBS-1), I instrumented a scratch copy of the runtime outside the repository. Every conclusion stated here was then re-measured on the frozen bytes.

## 2. What I ran

| Probe | Class | Result |
|---|---|---|
| The predecessor judge's P01, P01 at 24 kg, P01b, P02, P02b, P03, P03b, P04, P05, P05b, P06, P07, unmodified, on both trees (`qe-r7ada-rerun-predecessor-probes.mjs`) | Reproduce QE-R7ASC-01..04 | Predecessor: 12 of 12 byte-identical to the cited runs, root aside, so all four reproduce. Candidate: identical to the author's runs, and all four closed on these probes (§3) |
| The 35 earlier judge probes (QE-R7ASM, QE-R7ASE, QE-R7AB, QE-R7AF, R7-A.1, R7-A.2), unmodified, on the candidate (`qe-r7ada-rerun-earlier-judges.mjs`) | Earlier blockers stay closed | 35 of 35 byte-identical to the author's re-run, scripts unchanged. Against the predecessor: 20 identical, 11 path-only, and 4 differ (P40b, I01, Q12, Q3), each in the direction of A1/A3/C1/C2. Their findings' criteria hold (§3) |
| The author's self-challenge, re-run to stdout | Cross-check | Byte-identical to the recorded run: 228 cases, 0 violations. My violating classes lie outside its 16 classes |
| **Q01** correction through every review kind (13 handlers × 2 histories × loads, 78 cells) | A, B | **QE-R7ADA-01**: 14 cells on the candidate, 22 on the predecessor. The FROM_LOG state has 0 on both |
| **Q01b** robustness (45 cells): back-squat (TOTAL, Wednesday), a conflict that quarantines a log, a correction upward | A, B | **QE-R7ADA-01**: 12 cells on the candidate, 15 on the predecessor. The conflict to FROM_LOG has 0 |
| **Q02** R1: the standing projection after an unreviewed, unexecuted week, executed or left open (EASY and WALK_JOG, k = 1..11) | D | Not consumed as earned. The standing rows release unearned stimuli (§4) |
| **Q03** R6-H35, as in the corpus and with weeks 0–3 reported | D | Expected difference (§4) |
| **Q04** temporal credit (EASY, WALK_JOG, strength; time zones 0 and −180); one set of facts in three arrival orders; strength and RETURN gate collisions | C, D | 0 violations on the candidate. The predecessor reproduces the RETURN last-writer case |
| **Q05** a goal, schedule, run-goal or event change at every instant of week 4, then no-op decisions in 9 orders (106 scenarios) | C | 0 diverging on the candidate. 48 of 58 diverge on the predecessor |
| **Q06**, **Q06b**, **Q06c**, **Q06d** walk/jog F4 structure and the return ceiling: SHORT and MODERATE pauses; released, adverse, HOLD, repeated, exit and EASY shapes | E | F4 closed on its cells. **QE-R7ADA-02** on the walk/jog exit and EASY-mode SHORT returns, identical on the predecessor |
| **Q07** the one cell P02b's literal criterion flags | D | Conservative difference, not QE-R7ASC-02 (§3) |

## 3. Target findings and predecessor blockers

| Finding | Status | Evidence |
|---|---|---|
| **QE-R7ASC-01** | **Closed on its reproductions; class not closed** | <ul><li>P01 (3 variants, 19 and 24 kg) and P01b (no decision after week 1; conflict trigger): the EARLY and LATE records are identical and HistoricalState is identical in 8 of 8 comparisons, against 0 of 8 on the predecessor. LATE is now `REPLAN_FROM_EVIDENCE`.</li><li>A1 guards the FROM_LOG state in every reader I tried. That includes a stale KNOWN row left in place by 7 handler kinds (Q01, Q01b: 0 violations).</li><li>The KNOWN-held state through those handlers is open: **QE-R7ADA-01**, same class.</li></ul> |
| **QE-R7ASC-02** | **Closed** | <ul><li>P02 a/b/c: identical rows and history.</li><li>P02b: 0 of 22 EASY cells have U's plan ahead of its own history; the predecessor has 22 of 22.</li><li>The WALK_JOG U cells do not hold identical ledgers: the probe sends Sunday's report on Saturday and it is rejected as future. They are not comparable on either tree.</li><li>The literal cell (EASY, k = 1, NOLONG) has identical facts (Q07). The full histories differ only in `easyExtra` (U 0, R 1) and `devCount` (U 1, R 2): the reviewed cell credits the executed easy runs, and the open week earns nothing (C2). U prescribes 135 run minutes against R's 140. This is the conservative direction, the declared E1/E3 class.</li><li>Class (Q02): the decisions' PlanningView and HistoricalState never take a target, counter or step from the projection. This covers threshold, QUALITY, strides, long run, walk/jog, continuous running, and one or two open weeks.</li></ul> |
| **QE-R7ASC-03** | **Closed** | <ul><li>P05: a missed long run holds the return (MODERATE, LONG). Nothing is credited at Thursday 22:00. P05b: `RETURN_ENTRY`, step 0, while Sunday is pending and after it is missed. P04: only the RETURN step at Thursday–Saturday changes (1 → 0). Truncation: 8 timelines, 0 violations.</li><li>Q04 T1–T3: no credit before a session is due in EASY, WALK_JOG or strength, at tz 0 and −180 (0 of 18).</li><li>Q04 T4: the same facts day by day, all at close in reverse order, or in two interleaved reviews give identical gates, history and rows.</li><li>Q04 T5: a strength exercise holding on Wednesday or on Saturday resolves HOLD either way, with the same dose.</li><li>Q04 T6: a RETURN week with an adverse Thursday or Sunday run gives HOLD whichever is read first. The predecessor gives ADVANCE and step 1 when the adverse run is read first.</li></ul> |
| **QE-R7ASC-04** | **Closed** | <ul><li>P07: 0 of 20 pairs, against 18 on the predecessor.</li><li>Q05: 12 strength-goal pairs × 8 instants (Monday–Sunday before the closing review, Sunday after it), a schedule change at 8 instants, a run-goal change and an event set mid-program. Each is followed by an extra equipment item, a restated schedule and an empty review, in 9 orders. 106 scenarios, 0 with any strength or run row of weeks 5–6 different.</li><li>P06's 4 rows above HistoricalState (GENERAL → RUNNING_SUPPORT) are week 5 entered under the new goal's rule (B1, by design). The executed ADV week earns them, and they are byte-identical on both trees.</li></ul> |
| **SSCTR F4** (engineering side) | **Closed on its cells; class not closed** | <ul><li>Q06 W-RELEASED (step B released, never run), W-REPEAT (a second pause after a return) and W-HOLD all hold on the candidate. A SHORT return enters at most at the step last run, a MODERATE one a step below. The predecessor enters one above.</li><li>The ladder's exit is open: **QE-R7ADA-02**.</li></ul> |
| QE-R7ASM-01..04 | Stay closed | Q3 (4 variants): `prescribedKnownLoadBecameHistory = false`, `sameRecordDifferentHistory = false`. Q3b: no divergence. Q2b: `publicApiReadsRetractedLoad = false`. Q4: `planDiffersWithIdenticalLedgers = false`. Q11c, Q12: `historyEqual` |
| QE-R7ASE-01/02, QE-R7AB-01, QE-R7AF-01/02, QE-R7A-01, QE-R7A1-09/10, QE-R7A2-01/02/03 | Stay closed | Their probes are byte-identical to the predecessor or path-only. P40b and I01 differ by named C1/C2 causes. P40b's entry differences are byte-identical to the predecessor's, which its judge accepted |

## 4. Declared items, ruled

| Item | Ruling | Evidence |
|---|---|---|
| **R1**, the standing projection between re-plans | **Not consumed as earned capability. Not a D blocker for this gate; a TESTFLIGHT gate, Founder-owned** | <ul><li>Q02: after an unreviewed, unexecuted week the next week's rows stay as projected. In 7 of 11 EASY cells and 8 of 11 WALK_JOG cells they are ahead of the re-planned rows.</li><li>After the athlete executes them, HistoricalState credits only what was executed (k = 1: the executed quality session and strides; k = 2: the longer long run that was executed). Every later decision's view steps from that earned state, never from the projection's counters. The only "plan ahead of history" values (EASY k = 7, 11) are counters in a `stateTrace` that a KEEP left in place. No decision reads them (OBS-1).</li><li>The standing rows still release stimuli nobody earned. They include QUALITY and strides before the unlock (k = 1), a threshold, long-run or easy step, and a walk/jog step.</li><li>Two open weeks can release two threshold steps (k = 4: step 3 against an earned step 1). A walk/jog athlete at step 7 can be graduated to continuous running (k = 9).</li><li>The approved policy names this path itself: "a week that receives no gating review keeps the projection's assumption that it was executed … outside this approval and must be closed before any use beyond the offline reference (R18)" (R6-NONCLINICAL-RETURN condition 22; R6-PLANNED-PROGRESSION).</li></ul> |
| **R2**, a mid-week return holds its first week | Conservative; SSCTR's ruling; not a blocker | P05 MODERATE with every session run: the planner holds step 0 and history credits step 1. Q04 T6 BOTH_FINE: HOLD. The plan stays at or below history |
| **R3**, plan and history after a return week | Not a blocker | Every cell I read has the plan at or below history (P05, Q06d) |
| **R6-H35** | **Expected difference, not a blocker** | <ul><li>Q03: with weeks 0–3 never reported, week 4's closing review credits the executed QUALITY session, but `easyWeeksDone` stays 0, below `qualityNeeds` 2. Week 5 has no QUALITY, so the fixture's week-5 fact matches no session.</li><li>With weeks 0–3 reported as executed, the candidate is step for step identical to the predecessor.</li><li>Unreported weeks earn no unlock. That follows from C1/C2 and from R6-PLANNED-PROGRESSION ("quality/strides activation … count executed weeks, never calendar weeks").</li></ul> |
| R4 (D44 for an exposure executed before its correction), R5 (O-1, R41) | Not reviewed | Declared and approved, or outside the gate |

## 5. Findings

### QE-R7ADA-01 — MEDIUM, material, **blocking** (Properties A and B). Same class as QE-R7ASC-01, new manifestation

**Class.** A prescription planned from retracted evidence stays the reference a later log is judged against. QE-R7ASC-01 showed it in the FROM_LOG state, and A1 closes that state. Here it appears in the KNOWN-held state, through review kinds that do not apply A3.

**What the contract says.** A3: "A review under way whose evidence about an earlier week moves this week's PlanningView re-plans the sessions still ahead … A row planned from a retracted fact is therefore never the reference a later log is judged against, whether the correction arrived before or after the row was planned (EARLY = LATE = AFTER)."

**What the code does.**
- `evaluateProgram` binds a review's observations for every kind, so a correction or a conflicting record can arrive with any review.
- A3 runs only in `weeklyReview`'s branch for a week under way: `viewMovedBy` → `REPLAN_FROM_EVIDENCE` (`src/r6-adaptation.mjs:379`). The kinds routed to it are covered.
- Other handlers keep this week's rows:
  - `scheduleChange`: KEEP when the schedule matches (`:534`), or `rebuild` from next week (`:539`; `rebuild` defaults to `fromWeek = ctx.w + 1`, `:476`);
  - `goalChange`: KEEP when the goal matches (`:620`), or `rebuild` from next week (`:633`);
  - `unavailableDay` and `fatigue` with a reduction: they adapt the week as it stands (`adaptThisWeek`, `src/r6-composition.mjs:138`; `:547`, `:444`);
  - `doubleConflict` with a turn: routed to `scheduleChange`.
- With history holding a factual known load, `heldKnownLoad` is true (`src/r6-program.mjs:500`). `advanceStrength` then keeps the KNOWN row (`:621`), and `loggedLoadDecision` takes its value as `planned` (`:434`). A log up to one increment above the stale row is adopted without the D44 question.

**Reproduction (Q01).**
1. db-rdl is established at 24 kg in weeks 0–1.
2. Both logs are corrected to 20 kg. History after the correction holds `KNOWN 20`.
3. EARLY delivers the corrections with week 1's closing review. LATE delivers the same corrections, with the same ids and `correctedAt`, on Monday 07:00 of week 2, together with that cell's event. Both cells carry the same Monday event.
4. Week 2 is reported day by day, from reports built once. Saturday's db-rdl is logged at 24 kg, 3 × 5 at RIR 3 (target met). The week is closed on Sunday.

The facts are identical in every cell (`sameFacts`).

| Monday event (both cells) | EARLY | LATE |
|---|---|---|
| Example: `UNAVAILABLE_DAY` (Thursday), decision `RESCHEDULE_WITHIN_WEEK` | Saturday row `KNOWN 20 3x5`. Closing review asks `LOGGED_LOAD_ABOVE_PLAN 24/20`. HistoricalState week 3: **`KNOWN 20`**. Week 3: `KNOWN 22 2x5` | Saturday row **`KNOWN 24 3x5`**, planned from the retracted logs. No question. HistoricalState week 3: **`KNOWN 24, LOGGED_ACTUAL`**. Week 3: **`KNOWN 24 2x5`** |

| Shape (Q01, Q01b) | Handlers that diverge on the candidate | Same facts → |
|---|---|---|
| db-rdl 24 → 20 kg, logged 24 or 26 | schedule (no-op, next week), goal (no-op, next week), unavailable day, local fatigue that reduces, turn conflict: 7 shapes × 2 loads = 14 cells | `KNOWN 24/26` instead of `KNOWN 20` + question |
| back-squat (TOTAL, Wednesday), week 1's log removed, logged 85 | schedule (no-op, next week), goal next week, unavailable day: 4 cells | `KNOWN 85` and next week `KNOWN 85 2x5`, instead of `KNOWN 80` + question and `82.5 2x5` |
| A wearable record quarantines week 2's 22 kg session; history `KNOWN 20`; logged 24 | the same 4 handlers: 4 cells | `KNOWN 24` and next week `KNOWN 24 4x5`, instead of `KNOWN 20` + question and `20 4x5` |
| Correction upward, 20 → 24 kg (mirror) | the same 4 handlers: 4 cells | Conservative direction (`KNOWN 24` + question instead of `KNOWN 26`), still EARLY ≠ LATE |

- **Delivered with a weekly review** (`WEEKLY_REVIEW`, `RECOVERED`, `LOCAL_FATIGUE` with nothing to reduce, `MISSED_SESSION` without a move): EARLY = LATE in every cell on the candidate. On the predecessor these diverge as well. The freeze closed that path.
- **Delivered with an equipment statement**: EARLY = LATE, on both trees. An equipment statement re-composes strength from the corrected view.
- **FROM_LOG state** (db-rdl removed by the correction): history never diverges, because A1 converts the stale row. The athlete is still prescribed `KNOWN 20 3x5` for the rest of the week, for an exercise the corrected record says was never performed.

**Why it is material.**
- **Ordinary V1 inputs:**
  - a corrected load, or a late wearable record that conflicts;
  - carried by the review of an ordinary event: a day unavailable, a schedule or goal change from next week, local fatigue, a turn change.
- **The athlete does what was prescribed:** 24 kg on the stale row.
- **Property A:** the prescription built from retracted facts supplies the adoption. A log two increments above the factual load becomes a known load without the confirmation D44 requires, and the next week is dosed from it.
- **Property B:** the retracted logs keep acting through the planner's rows after the correction arrived. HistoricalState depends on which review kind carried the correction, against A3's own "EARLY = LATE".
- **Not A4:** A4 concerns an exposure executed before its correction arrived. Here the correction arrives on Monday and the exposure is on Saturday.
- **Not in the author's evidence:** the self-challenge's A2 class sends LATE only through a Monday `WEEKLY_REVIEW`, and the consumer audit does not cover these handlers (OBS-3).
- **Pre-existing**, not introduced: the predecessor diverges on more handlers.

### QE-R7ADA-02 — MEDIUM, material, **blocking** (Property E). Same class as SSCTR F4, new manifestation

**Class.** A return treats a step the evidence released, but the athlete never executed, as tolerated. F4 showed this inside the walk/jog ladder, and W2 closes it there. Here it appears at the ladder's exit and in EASY mode.

**What the policy says.**
- R6-NONCLINICAL-RETURN condition 7 (`r6/RETURN_ENGINE_R6.json`): "SHORT (<= shortMaxDays): resume the last executed doses; the first quality slot runs easy; the next step waits for executed sessions."
- The SSCTR's approved return base: "the last executed dose, never one not executed."
- The decision's own reason: "short nonclinical interruption: resume the last completed doses; no step until execution is observed".

**What the code does.**
- A SHORT return starts from `runState = clone(prior.run)` (`src/r6-adaptation.mjs:973`). `prior.run` is `historicalRun(H.state.run, lastStepRun)` (`:903`).
- `historicalRun` caps only `mode === 'WALK_JOG'` steps (`src/r6-program.mjs:598`).
- HistoricalState's run otherwise holds every step the evidence released: the long-run and easy targets `advanceRun` stepped, and the EASY mode the last ladder week graduated to.
- Strength differs: `historicalStrength` undoes a released step until it is executed.

**Reproduction (Q06c; Q06, Q06b).**
- A SHORT pause (3, 6 or 10 days) starts on a Monday and is reported the day after it ends.
- Compared: the largest dose executed before the pause against the first prescription after the return.

| Shape | Executed before the pause | First prescriptions after the SHORT return | Cells |
|---|---|---|---|
| Walk/jog: step 8 (one 20-minute continuous jog) executed and closed. The state graduates to EASY 25 | Longest continuous run: 20 min | **EASY 25 min continuous**, 2–3 per week | 3 of 3 |
| EASY runner, k = 5 | Longest long run 70 | Long run **75** | |
| EASY runner, k = 3 | Longest long run 65 | Long run **70** | |
| EASY runner, k = 2 | Easy runs 40 | Easy run **45** | 8 of 18 EASY cells in all |

- **Identical on the predecessor:** pre-existing, not introduced.
- **No violation:**
  - MODERATE returns (Q06d): the single-run ceiling caps the long run at 50–55, and easy runs stay at or below the prior executed dose;
  - walk/jog steps inside the ladder (W2);
  - the first quality slot (D58: it runs easy).

**Why it is material.**
- **The walk/jog exit** is F4's structure and population:
  - step A (8) executed, step B (the exit) released but never run, a pause, and B treated as earned;
  - after a break of 3–10 days a novice who has never run longer than 20 minutes continuously gets 25-minute continuous runs, 25% above the factual tolerated dose, against condition 7;
  - the author declared this transition NÃO TESTADO;
  - the SSCTR and the Founder treated F4's one-step excess as blocking.

  This manifestation alone is the blocking basis.
- **The EASY-mode part** is the same mechanism and violates condition 7 literally. The single-run ceiling (R6-PLANNED-PROGRESSION) bounds it to one step: 5 minutes, or one easy step. Whether that excess is material for an intermediate runner is a sports ruling, which I leave to the SSCTR. If the SSCTR rules it within policy, that part drops to NONBLOCKING, and the walk/jog exit remains.

## 6. Observations (not blocking)

- **OBS-1, BACKLOG.** When a closing review's evidence-based start produces the same rows as the stored plan, it returns KEEP with no proposal, and the old projected `stateTrace` stays.
  - Its run counters can sit above history: Q02 EASY k = 7 and 11, with `easyWeeksDone`, `qualityDone` and `stridesDone` one ahead.
  - No decision reads them: `planningBase` takes only `planned` and `modeHistory` from it.
  - `modeOf()` does read `stateTrace[w].run.mode` to classify observations (phase class), and the stored rows of later weeks come from it until a re-plan (R1).
  - `stateTrace` is therefore not a faithful record of the PlanningView after a KEEP. I found this in a scratch copy and re-measured it on the frozen bytes.
- **OBS-2, SSCTR question.** A walk/jog step executed once with an adverse response, then a SHORT break, resumes at that step (Q06 W-ADVERSE). This is consistent with HOLD, which repeats the line after one adverse signal. Whether a single adverse exposure is "tolerated" for a return is a sports ruling.
- **OBS-3.** `dossier/CONSUMER_AUDIT.md` covers 8 consumers.
  - It does not cover corrections through the schedule, goal, unavailable-day, fatigue or turn-conflict handlers (QE-R7ADA-01).
  - Its answer "No" to question 5 for the return path does not hold for the walk/jog exit or EASY-mode SHORT returns (QE-R7ADA-02).
- **OBS-4.** My first Q04 detector read `basis` as a credit, and my first T5 detector compared loads naively. Both were false positives:
  - the reported basis carries an earlier transition (a KEEP leaves no WEEK_EVIDENCE anchor);
  - 18 → 20 kg was the adoption of the executed 20 kg row.

  I corrected both detectors and re-ran them; the outputs recorded are the corrected ones.

## 7. The five classes

| Class | Verdict | Basis |
|---|---|---|
| **A**, factual authority | **Violated** | QE-R7ADA-01: a stale prescription supplies a historical known load's adoption. A1 holds in the FROM_LOG state (Q01, Q01b, P01, P01b) |
| **B**, correction/retraction consistency | **Violated** | QE-R7ADA-01: retracted logs keep acting through this week's rows after the correction arrived, unless the carrier is a weekly review. P03 (B1–B5) and Q2/Q2b still hold: every public reader and the internal reducer equal the corrected control |
| **C**, coherent decision resolution | **Holds** | P07 0/20. Q05: 106 scenarios × 9 orders, 0 divergent. Q04 T4–T6: the same facts in any order give the same gates and dose |
| **D**, evidence-based / temporal progression | **Holds** | P02/P02b and Q07. Q02: no projection consumed as earned. Q04 T1–T3: no credit before due, at tz 0 and −180. P05/P05b. R6-H35 is the expected consequence. R1 is a TESTFLIGHT gate (R18) |
| **E**, return ≤ factual tolerated dose | **Violated** | QE-R7ADA-02: the walk/jog exit, and EASY-mode SHORT returns. F4's cells, MODERATE returns and strength returns hold |

## 8. Proven, inferred, not tested

**Proven** (run on these bytes; every output bound to `3a7166b2…` in `qe-r7ada-runs/RUNS.json`):
- the integrity of the freeze and both commits;
- 663/663 tests, and `verify-r7ada` 13/14 (one failure by design);
- the 4 target findings and F4 reproduced on the predecessor with their judges' own probes;
- their closure on the candidate;
- 35 earlier judge probes;
- QE-R7ADA-01: 26 cells, 3 independent shapes;
- QE-R7ADA-02: 11 cells;
- R1, R6-H35 and the P02b literal cell;
- C and D on the classes listed.

**Inferred** (code reading, not run):
- QE-R7ADA-01 also arises with `EVENT_DATE_CHANGE` and `EVENT_WEEK_CONFLICT` reviews that do not re-plan this week, and with a missed session that is moved (`MISSED_SESSION` → MOVE through `adaptThisWeek`). In my run the missed easy run was not moved.
- A KEEP's stale `stateTrace` mode can misclassify an observation's phase class (OBS-1).

**Not tested:**
- real data, devices or athletes; HealthKit, KMP, UI, production;
- time zones other than 0 and −180;
- the SSCTR's sports rulings: R2, R3, the materiality of QE-R7ADA-02's EASY-mode part, and OBS-2.

## 9. Verdict

```
R7A_DECISION_AUTHORITY_ENGINEERING_REVIEW = NOT_READY
```

| Finding | Severity | Class | Same class or new | Introduced by this freeze | Status |
|---|---|---|---|---|---|
| **QE-R7ADA-01** | MEDIUM | A, B | Same class as QE-R7ASC-01 (KNOWN-held state, non-weekly carriers of a correction or conflict) | No (the predecessor also fails through the weekly review, which this freeze fixed) | **Blocking** |
| **QE-R7ADA-02** | MEDIUM (walk/jog exit); LOW for the EASY-mode part, SSCTR to rule | E | Same class as F4 (the ladder's exit; EASY-mode SHORT returns) | No (identical on the predecessor) | **Blocking** (the walk/jog exit) |
| R1 | — | D boundary | Declared | No | Not consumed as earned; **TESTFLIGHT** gate (R18), Founder-owned |
| OBS-1 | LOW | — | — | No | BACKLOG |
| OBS-2 | — | E question | — | No | SSCTR |

**Routing.** The finite stop condition applies: only material violations of A–E block, and QE-R7ADA-01 (A, B) and QE-R7ADA-02 (E) are such violations.
- The closing session owns the final disposition, after the SSCTR regression review.
- **Not issued here:** a fix, a second freeze, `R7A_EXIT_READINESS` and R7-B0.

**Files written by this review**, all in this folder and on `review/r7ada-decision-authority-engineering`:
- `quality-engineering-r7ada-review.md` and `.json`;
- probes `qe-r7ada-Q01…Q07*.mjs` and library `qe-r7ada-lib.mjs`;
- instruments `qe-r7ada-integrity.mjs`, `qe-r7ada-rerun-predecessor-probes.mjs`, `qe-r7ada-rerun-earlier-judges.mjs`, `qe-r7ada-bind-runs.mjs`;
- `qe-r7ada-runs/`: every output, the predecessor-probe and earlier-judge re-runs, integrity at the start and end, the test run, the read-only verification, the self-challenge re-run, and `RUNS.json`.
