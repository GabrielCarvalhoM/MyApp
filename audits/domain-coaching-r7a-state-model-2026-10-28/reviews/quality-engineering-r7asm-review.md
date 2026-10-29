# QUALITY & RELIABILITY ENGINEERING REVIEW — COACHING CORE: STATE MODEL CLOSURE

**Review:** R7ASM-QE-r1, 2026-10-29. An independent engineering judge in a new session. I am not the author. I made no runtime change, patch, correction cycle or freeze.
**Freeze reviewed:** **HISTORICAL-PROJECTION-FREEZE-1**.
- Source digest: `0db72d0edd9fd7f1382e1ed8622d29e2ff3356699da18872b0670615956e2eb8`, recomputed at the start and at the end.
- Manifest: `CoachingCore/r7/state-model/RUNTIME_FREEZE_HISTORICAL_PROJECTION.json`, SHA-256 `39b326ac11b2faa3c316fefeeb1d332cc5043d2f552067151e336a4fb6ca41a4`.

**Brief:** [ENGINEERING_REVIEW_BRIEF.md](ENGINEERING_REVIEW_BRIEF.md). Its central question (Founder §29) is answered below.

```
STATE_MODEL_ENGINEERING_REVIEW = NOT_READY
REVIEW_INVALID = NO   (bytes match the freeze, before and after)
```

> **Is there any material V1 path on which PlanningProjection can alter HistoricalState without passing through factual evidence?**
>
> **Yes.** The path runs through the **prescription rows**, not the stored starts.
>
> The evidence reducer builds the history of an exercise it does not hold from the row that prescribed it, including a KNOWN row's load. This happens when:
> - the evidence that established the exercise is retracted after its KNOWN rows were planned (a valid correction, or a conflict quarantine); and
> - the next exposure is executed without a readable load.
>
> HistoricalState then holds the exercise at the prescribed load, although the record holds no usable load for it. With an **identical record**, history differs only in whether the correction reached the plan before or after the rows were planned. A return resumes that load (**QE-R7ASM-01**).

The separation does hold for the channel it was built against. I rewrote every value of every stored start on six program states, and HistoricalState did not move at any of the 76 cuts, nor did the return entries (Q6). QE-R7ASE-01, QE-R7ASE-02 and QE-R7AB-01 are closed on their judges' own probes.

There are three more material findings:
- **QE-R7ASM-02:** inside a LONG return, the PlanningView takes the run from the projection.
- **QE-R7ASM-03:** in REPS_THEN_LOAD goals, the PlanningView takes the repetition progression from the projection.
- **QE-R7ASM-04:** the public HistoricalState reader ignores corrections (new class).

QE-R7ASM-02 and QE-R7ASM-03 are planning-side equivalents of QE-R7ASE-02.

## 1. Freeze checked

| Check | Result |
|---|---|
| Manifest SHA-256 | `39b326ac…a41a4`, as REVIEW_HANDOFF states |
| Source digest | Recomputed with my own canonical serializer, not the runtime's `hash()`: `0db72d0e…2eb8`. Equal at the start and at the end (`qe-r7asm-runs/integrity.during.out.json`) |
| Bound files | 83 of 83 match. Drift 0, missing 0. Unbound `src/*.mjs` or `test/*.mjs`: 0. Exactly one freeze file in `r7/state-model/` |
| Policy | R6-POLICY-5, canonical hash `18ec48f3…` recomputed, unchanged |
| Runtime inputs outside the manifest | The R6 SSCTR policy review JSON, `fixtures/authority-bundle.json` and `SHADOW_INPUT_SCHEMA.json` are unchanged since BASELINE.json. Of BASELINE's 3,513 entries, only these differ: the 3 runtime files, the 5 edited tests, CURRENT_MISSION.md and MISSION_LEDGER.md (the mission's declared delta) |
| Predecessor copy | `state-evidence-freeze-source/`: 82 of 82 match its own MANIFEST |
| `node CoachingCore/scripts/verify-r7asm.mjs` (read-only) | 16/16 (`qe-r7asm-runs/verify-r7asm.read-only.out.json`) |
| `node --test` (Node v24.19.0) | 589/589 (`qe-r7asm-runs/node-test.out.txt`). No test file writes to disk; I checked before running |

Commands not run: `npm run verify`, `npm run simulate`, any `--write`, and any `freeze-*`, `prepare-*`, `queue-*`, `regress-*` script or evidence runner. I edited no file outside `reviews/qe-r7asm-*`. A concurrent SSCTR session is writing `ssctr-r7asm-*`; I did not touch those files.

## 2. What I ran

Every probe is read-only and synthetic, with DEV_TEST_ONLY authority. Each one prints JSON to stdout, and its output is in `qe-r7asm-runs/`. The scaffolding is `qe-r7asm-lib.mjs`.

| Probe | Class attacked | Result |
|---|---|---|
| `qe-r7asm-Q2-correction` | Historical correction through the public reader: a real `correctionOf` chain, and the author's `supersedes:` form | **QE-R7ASM-04**, **QE-R7ASM-07** |
| `qe-r7asm-Q2b-correction-load` | Q2 with a corrected load (22 kg, corrected to 20 kg) | **QE-R7ASM-04**: the public reader reports the retracted 22 |
| `qe-r7asm-Q3-known-row-setup` | Partial evidence, a correction and a fresh exercise. Cells EARLY, LATE and NOCORR with an **identical record**. Variants: no details, sets/reps without load, unknown unit, 18 kg logged | **QE-R7ASM-01** |
| `qe-r7asm-Q3b-known-row-conflict` | The same mechanism through a conflict: a late wearable record that disagrees with the manual log. Identical record. Also run on STATE-EVIDENCE-FREEZE-1 | **QE-R7ASM-01** (live). On the prior freeze the same outcome came through the stored start |
| `qe-r7asm-Q12-robustness` (a) | QE-R7ASM-01 through the facts-only reading (week never reviewed) | **QE-R7ASM-01** |
| `qe-r7asm-Q4-restart-view`, `Q4b-restart-rows` | Return and week boundary in the run: LONG return (RESTART) against MODERATE. U and C cells with identical ledgers | **QE-R7ASM-02** (LONG). MODERATE is clean |
| `qe-r7asm-Q11c-reps-identical`, `Q12-robustness` (b) | Progression in REPS_THEN_LOAD goals (HYPERTROPHY, GENERAL, RUNNING_SUPPORT). U and R cells with identical ledgers | **QE-R7ASM-03** |
| `qe-r7asm-Q6-perturb-projection` | Metamorphic test. Every value of every stored start `stateTrace[k≥1]` is rewritten: loads +10, tick 5, reps +3, sets +2, `lastPerformed` 2099, return steps, caps, run targets, achieved peaks, modes, plus a phantom exercise. Only the declared `planned` summary and start provenance are kept. Six states: P40, P51, short, moderate and long return, corrected-and-conflicted | **Invariant**: 76 cuts, plus the what-if return `stateAt` and entry |
| `qe-r7asm-Q10-noop-sweep` | No-op handlers (equipment, schedule, goal, fatigue, unavailable, recovered, empty review) at three clocks of an incomplete week | **QE-R7ASM-05**: 10 of 21 cells, all on the week's last day |
| `qe-r7asm-Q9-executed-atoms` | Founder I5 on the public `lastExecuted*` atoms | **QE-R7ASM-06** |
| `qe-r7asm-Q11-misc` | (a) Week-0 re-plans rewrite `stateTrace[0]`, the intake. (b) Late evidence for a week a review closed. (c) First cut of the reps class | (a) history unchanged. (b) history follows the fact. (c) superseded by Q11c |
| `qe-r7asm-Q7-p41-facts` | Classifies the U/R entry difference P41 shows on this freeze | Different **executed** loads. `lastExecutedSets` equals the executed maxima |
| Earlier judges' probes, unmodified, on the live freeze | QE-R7ASE: P51d (×3 time zones), P51c, P51b, P50 (×3), P52, I02. QE-R7AB: P40 (×2), P40b, P40c, P41, P47b. QE-R7AF: P30c, P31, P32, P37. R7-A.2: P17, P19. R7-A.1: P07 | All **byte-identical** to the author's recorded runs. P51d at 540 and −600 has no author run to compare; its content equals the 0 run. Hashes in `qe-r7asm-runs/judge-reruns/SHA256_vs_author.txt` |

## 3. Target blockers and predecessors

| Blocker | Status | Evidence |
|---|---|---|
| **QE-R7ASE-01** | **CLOSED on its mechanism** | <ul><li>P51d at three time zones, with ledgers equal: `db-rdl` and `db-split-squat` agree between U and R6 (KNOWN22 tick 1).</li><li>No projected tick reaches history, whatever the stored ticks (Q6).</li><li>Residual: P51d's general oracle ("identical facts give the identical history at B") still fails on `back-squat` and `db-calf-raise` (U tick 0, R6 tick 1). That is the conservative direction, caused by E1/E3, not by a projection. See QE-R7ASM-05.</li></ul> |
| **QE-R7ASE-02** | **CLOSED** | <ul><li>P50 at three time zones: on 2026-12-19 both cells prescribe the D52 re-establishment (`ESTABLISH kind=REESTABLISH`).</li><li>The planning view reads `lastPerformed` 2026-11-14 in both cells.</li><li>Only week 3 differs: the plan made before the facts (accepted E1).</li><li>P52 is byte-identical to the author's run.</li></ul> |
| **QE-R7AB-01** | **CLOSED** | <ul><li>P40 (×2 time zones): entries equal. The rows after B differ only in an episode id.</li><li>P40b, P40c: entries equal.</li><li>P41: the U/R difference (`db-bench-press` 22 against 20, `db-row` 24 against 22) is loads U actually lifted on 2026-12-16 (Q7). `lastExecutedSets` is 3 and 2, the executed maxima, where the boundary judge found 4 and 3.</li><li>P47b: equal.</li></ul> |
| QE-R7AF-01, QE-R7AF-02, QE-R7A-01, QE-R7A1-09, QE-R7A1-10, QE-R7A2-01, QE-R7A2-02, QE-R7A2-03 | **Stay closed** on their probes | <ul><li>P30c, P31, P32, P37, P17, P19 and P07 are byte-identical to the author's runs.</li><li>P31's 18 V6 cells are the conservative class the R7AF judge recorded (QE-R7AF-03's rule). Its 10 V3 cells are now 0.</li></ul> |
| D53, D56–D59 | Not contradicted by anything I ran | The SSCTR confirms them |

## 4. Findings

### QE-R7ASM-01 — MEDIUM, material, **blocking**

**Class.** Same class as QE-R7ASE-01 and QE-R7AB-01: a projection consumed as history. It arrives through a **new channel**: the prescription rows read as state.

**What the contract says.**
- §4: "an exercise the evidence never established — absent from the view — a prescription establishes nothing (SSCTR D52)".
- §5: "a known load lifted is the load … an effort-guided row adopts nothing".
- §3: the reducer reads the week's rows only as "what was prescribed".

**What the code does.**
- `setUp(u)` (`src/r6-program.mjs:456`) builds a fresh exercise's state from its row. For a KNOWN row that includes `load:u.value` (with `reps:u.reps` and `sets:u.sets`), with source `PLANNED_ESTABLISHMENT`.
- `advanceStrength` sets the exercise up (`:569`). It drops an unlogged fresh exercise only when its mode is FROM_LOG (`:576`), so a fresh KNOWN exercise is kept with no log at all.
- `strengthAtBreak`, the facts-only reading, sets up every performed fresh exercise unconditionally (`:505`).
- The reducer calls both with the week's rows (`src/r6-adaptation.mjs:717`, `used = usedInWeek(wk)`).
- `loggedLoadDecision` takes a KNOWN row's value as the adoption reference (`src/r6-program.mjs:406`).

**When it happens.** A KNOWN row for an exercise history does not hold appears whenever the evidence that established the exercise is retracted after those rows were planned.

**Reproduction.** Default synthetic profile. Every input is an ordinary review that `evaluateProgram` accepts.

Q3, correction trigger:
1. Weeks 0 and 1 are trained and reviewed. `db-rdl` is logged at 20 kg both times and adopted, so week 2's Saturday row is `KNOWN 20`.
2. Corrections arrive (`correctionOf`, same session, same `correctedAt`). They remove `db-rdl` from both reports ("I did not do the RDLs").
   - EARLY cell: the corrections come with week 1's review.
   - LATE cell: the corrections come on Monday 07:00 of week 2, in a mid-week review that keeps the plan.
3. Week 2's reports are built once and sent identically to every cell. Saturday is executed with `db-rdl`'s load unknown.

| Variant | Record EARLY = LATE | Usable `db-rdl` load logs | LATE: HistoricalState | LATE: return entry | EARLY |
|---|---|---|---|---|---|
| completed, no exercise details | **identical** | 0 | `KNOWN 20`, `PLANNED_ESTABLISHMENT`, lastExecutedLoad null | `KNOWN 20` | not held, so `FIRST_ESTABLISH` |
| sets/reps, no load (Founder I7 verbatim) | **identical** | 0 | `KNOWN 20` | `KNOWN 20` | not held |
| load in an unknown unit | **identical** | 0 | `KNOWN 20` | `KNOWN 20` | not held |
| 18 kg logged | **identical** | 1 (18) | `KNOWN 18`, adopted at once against the retracted row's 20 | `KNOWN 18` | `FROM_LOG`, pending 18: the athlete must confirm (SSCTR D45) |

Q3b, conflict trigger:
- Week 0's Saturday establishes `db-rdl` at 20 kg with the athlete's confirmation (D45).
- A wearable record of that session (a different duration) arrives on Monday of week 1. The session is quarantined (QRE-R6-14).
- Week 1's Saturday is synced without exercise details.
- Result: the identical record gives LATE `KNOWN 20 PLANNED_ESTABLISHMENT`, with return entry `KNOWN 20`. The ORDERED cell does not hold the exercise.
- On STATE-EVIDENCE-FREEZE-1 the LATE cell already resumed `KNOWN 20`, as `LOGGED_ACTUAL`, through the copied start. This freeze removed that channel; the row channel reproduces the outcome.

Q12a: the same result when week 2 is never reviewed (the facts-only path).

**Why it is material.**
- Both triggers are ordinary V1 paths:
  - Corrections: I12, T15, P7.
  - Conflict quarantine: HealthKit inbound is in V1 scope, and a late wearable record can disagree with the manual log.
- So are executions without a readable load: a workout record with no exercise details, sets/reps without load, a unit the record cannot read.
- The consequences reach all three readers:
  - HistoricalState declares an established known load no evidence supports.
  - Every return resumes it (I13).
  - The plan keeps prescribing and progressing KNOWN rows instead of establishing by effort (D52, D45).

**Invariants violated.**
- **I1**: history receives a value only because it was planned.
- **I7**: sets and reps known, load filled with the target.
- **I13**: the return reads a history that holds a prescription.
- **P5**: the order of the plan and the correction changes HistoricalState on an identical record.
- Contract §4 and §5 as quoted above.
- In the 18 kg variant, a prescription made from retracted evidence acts as the evidence that lets a first, unconfirmed log be adopted. That is planner metadata inherited as evidence (D45 bypassed).

### QE-R7ASM-02 — MEDIUM, material

**Class.** Same class as QE-R7ASE-02: a planner rule defined on executed history reads the projection after the facts arrived. It is a run-side, planning-side finding. **HistoricalState is not contaminated.**

**What the contract says.** §4: "Run: the whole state while it is in a return — HistoricalState — a return's steps follow the weeks the athlete executed (I13)". E2: "its rules defined on executed history read history".

**What the code does.** `planningBase` takes the run from history only when `H.run.mode === 'RETURN'` (`src/r6-adaptation.mjs:746`). That is the moderate return. A LONG return puts the run in `RESTART`, so the PlanningView takes the restart minutes and the switch to EASY from PlanningProjection.

**Reproduction (Q4 and Q4b).**
- Weeks 0–2 trained and reviewed. Then a 35-day nonclinical interruption is reported, with re-entry in week 8 (`RESTART`, 15 min).
- Nothing is executed in week 8 or week 9.
  - U: week 8 is not reviewed.
  - C: week 8 is reviewed.
  - Both review week 9.
- Ledgers are identical.

Results:
- **Week 10:**
  - U's plan holds `restart 20`.
  - C's plan holds `restart 15`.
  - History holds 15 in both cells.
- **Weeks 10–11:** both cells execute every run as prescribed and review each week. The ledgers stay identical.
- **Week 12:** U's plan leaves the restart a step early (`EASY:25 EASY:25 LONG:25`, a long run in EASY mode). C and history are still in the restart (`EASY:25 ×3`).
- **Week 14:** U's plan unlocks QUALITY (`QUALITY:34`) a week before C.

The MODERATE control (RETURN mode) shows plan = history in both cells.

**Not run.** A walk/jog athlete's return never enters mode RETURN, so it takes the same branch (inferred).

### QE-R7ASM-03 — MEDIUM, material

**Class.** Same class as QE-R7ASE-01's planning consequence: the projection's progression credit reaches decisions (R42). It is planning-side. **HistoricalState is not contaminated.**

**Status in the contract.** Declared in contract §4, row 2: repetition targets come from the projection. My ruling: rejected for REPS_THEN_LOAD goals.

**What the code does.**
- `planningExercise` caps only the load at history's. It lowers the repetition target only when it lowers the load (`src/r6-adaptation.mjs:773`).
- In REPS_THEN_LOAD goals the progression is the repetition count itself (`src/r6-program.mjs:619`: +2 reps per set up to the range, then a load step). These are HYPERTROPHY, RUNNING_SUPPORT and GENERAL, three of the five strength goals.
- For these goals, `reps` is both the plan's target and the earned progression: the single ambiguous field Founder §6 and §22 forbid.
- So R42 ("every decision steps a load on EARNED_PROGRESS", §7) is implemented for the load tick only.

**Reproduction (Q11c and Q12b).**
- Weeks 0–3 trained and reviewed. Weeks 4 and 5: nothing executed.
  - U: week 4 not reviewed, week 5 reviewed.
  - R: both reviewed.
- Ledgers are identical.
- History is equal in both cells (e.g., `db-bench-press KNOWN20 x8`).
- The decision at week 5's review knew both weeks were empty. U prescribes week 6 at **+2 reps per set**; R prescribes the last executed counts:

| Goal | Exercises with a different repetition count | Example (U against R) |
|---|---|---|
| HYPERTROPHY | 4 (6 rows) | `KNOWN20 x10` against `x8` |
| GENERAL | 7 rows | `KNOWN22 x12` against `x10` |
| RUNNING_SUPPORT | 8 rows | `back-squat KNOWN82.5 x8` against `x6` |

A dose increase that no exposure earned reaches a prescription made after the facts. The LOAD goal's cap prevents exactly this for loads.

### QE-R7ASM-04 — MEDIUM, material for HISTORICAL_STATE_INTEGRITY

**Class.** New: retracted evidence read as live. It is **not** projection → history.

**What the code does.**
- `historicalStateOf`, the public, read-only HistoricalState, reads `actualLedger` "as evaluateProgram returns it" (`src/r6-adaptation.mjs:792`). Each evaluation appends the superseded rows at the end of that record (`:328`).
- The reducer never filters `superseded` (`:678`), and `weekEvidence` takes the last row of each session (`:130`). The retracted row therefore wins.
- The internal reducer is correct, because `evaluateProgram` passes it the normalized ledger.

**Reproduction.**
- Q2: a session reported done on 2026-12-05, then corrected (`correctionOf`) to not done. The public HistoricalState reports `lastPerformedAt` **2026-12-05**. The record without the superseded row, and the internal reducer, both say 2026-11-14.
- Q2b: a lift reported at 22 kg, corrected to 20 kg. The public HistoricalState reports `lastExecutedLoad`, `liftedLoad` and the state load all at **22**. The record without the superseded row and the return entry say 20.

**Scope.** Inside CoachingCore there is no consumer today; I grepped `src/` and `scripts/`. But this is the mission's HistoricalState interface and the author's test oracle.

**Invariant violated.** I12 (T15, P7). A correction is a fact that "replaces what it corrects at every later read" (contract §5).

### QE-R7ASM-05 — LOW–MEDIUM, non-blocking for the reviewed class

**Class.** A consequence of declared E1 and E3. A Founder or SSCTR ruling is recommended.

**What happens.** HistoricalState's EARNED_PROGRESS depends on whether a decision closed an incomplete week, on identical facts.

**Reproduction (Q10).** P51's history: weeks 5 and 6 executed except Saturday's lift, never reviewed.
- Mid-week: no handler changes history.
- On the week's last day (10:00 and 22:00), 10 of 21 cells credit `back-squat` and `db-calf-raise` with +1 tick. The handlers that do it:
  - an equipment statement whose action is `KEEP`;
  - a schedule change for *next* week;
  - a local-fatigue report;
  - RECOVERED;
  - a review with no facts.

The P51d residual (§3) is the same mechanism.

**Assessment.**
- Every credited exposure was executed with its target met. No unexecuted value enters, so this is not projection → history.
- Even so, history is not a function of evidence alone. It breaks the letter of Founder §2 ("only authorized factual evidence alters HistoricalState") and of P1.
- The author's P1 test runs on Monday and never meets this.

### QE-R7ASM-06 — LOW, representational

**What happens.** The public atoms `lastExecutedLoad` and `lastExecutedReps` hold the reference dose the adoption rule settled, not the last execution. The execution is in `liftedLoad` and `liftedReps`.

**Reproduction (Q9).** The row prescribes KNOWN 20×5:

| Logged | `lastExecuted*` | `lifted*` |
|---|---|---|
| 22×3 | 20×5 | 22×3 |
| 24×5 | 20×5 | 24×5 |
| 20×3 | 20×5 | 20×3 |

**Assessment.**
- No unexecuted value is invented: 20×5 was executed earlier.
- But the name the Founder used for I5 ("target 22, executed 21 → historical 21") carries another meaning.

### QE-R7ASM-07 — LOW, evidence

**What happens.** T15, P7 and the self-challenge's correction class build their correction with `supersedes:`. The normalizer recognises only `correctionOf` (`src/r6-provenance.mjs:100`). These cases therefore produce a **conflict** (`CONFLICTING_PHYSICAL_OR_RESPONSE_REPORTS`, Q2), and they pass because a quarantined session counts nothing.

**Consequence.** The Founder's T15 and P7 are not demonstrated by the state-model suite. This is how QE-R7ASM-04 escaped.

**Other cases no test reaches:**
- a fresh exercise prescribed by a KNOWN row;
- the view in a RESTART return;
- any REPS_THEN_LOAD goal (every T test uses STRENGTH, a LOAD goal);
- a no-op handler on the week's last day.

## 5. What holds (proven)

- **Stored-start values never reach history.** In Q6, six states were checked: 76 `historicalStateOf` cuts, plus the what-if return's `stateAt` and entry. All were invariant under a full rewrite of `stateTrace[k≥1]`, including a phantom exercise. The atoms rewritten: load, tick, reps, sets, `lastPerformed`, return step, caps, `ceiling`, `pendingLoad`, `unlogged`, mode, and the run's targets, achieved peaks, longest continuous run and mode.
- **The intake is stable** under week-0 re-plans that rewrite `stateTrace[0]` (Q11a).
- **Late evidence for a week a review closed** is read as fact: load, date and R42 tick (Q11b).
- **Cross-sport and cross-exercise isolation**: T16 and T17 pass within the 589. Run atoms perturbed in the projection moved no strength value, and the phantom exercise never entered history (Q6).
- **Write ownership as declared.**
  - `evidenceMode` is passed only inside the reducer and the history readers.
  - Planning transitions drop `facts`.
  - `historicalStateOf` returns a frozen value.
  - No `stateTrace` entry carries `facts`.
  - The view's load never exceeds history's load (Q6, and the T13b/T13d rows in the 589).

## 6. Rulings on the declared boundaries

| # | Ruling |
|---|---|
| E1 | Accepted as a planning rule. Its effect on history is QE-R7ASM-05; a ruling is requested |
| E2 | Accepted in principle. Violated by `planningBase` in LONG returns (QE-R7ASM-02) and by the repetition target of REPS_THEN_LOAD goals (QE-R7ASM-03) |
| E3 | Accepted. Combined with E1, it makes history depend on whether a decision occurred (QE-R7ASM-05) |
| E4 | Accepted. I found no reading at a later cut that changes an earlier week |
| E5 | Accepted for stored values (Q6). The facts-only reading still sets up a fresh exercise from a KNOWN row (QE-R7ASM-01, Q12a) |
| E6 | Engineering-neutral. It is a regression question for the SSCTR |
| §4, "load and repetition targets from the projection" | Accepted for LOAD goals, where the cap applies. **Rejected** for REPS_THEN_LOAD goals (QE-R7ASM-03) |
| §4, "run: the whole state while in a return from history" | Implemented for mode `RETURN` only (QE-R7ASM-02) |
| §4, "an exercise the evidence never established is absent from the view" | Holds for the view. Fails one level down, in the reducer (QE-R7ASM-01) |

## 7. Founder §33: what the record must document (engineering input; the decision is the Founder's)

1. **Which projection contaminated history.**
   - In history: the prescribed KNOWN load of a row planned from evidence later retracted, together with that row's repetitions and sets.
   - In the view: the projected restart minutes of a LONG return, and the projected repetition steps of REPS_THEN_LOAD goals.
2. **Through which API or path.**
   - `evidenceState` → `advanceStrength(evidenceMode)` (`r6-program.mjs:569/:576`) or `strengthAtBreak(evidenceMode)` (`:505`) → `setUp(u)` (`:456`). From there it reaches:
     - `historicalStateOf`;
     - `stateAtBreak`, and through it every return entry;
     - `planningBase`, and through it every decision.
   - The view: `planningBase` (`r6-adaptation.mjs:746`) and `planningExercise` (`:773`).
   - The public reader's record handling: `historicalStateOf` (`:792`).
3. **Was the structural separation incomplete?** **Yes**, at a boundary the contract lists as permitted: "the reducer reads the week's rows (what was prescribed)".
   - Reading what was prescribed to interpret evidence is necessary: which exercises a completed session held, the exposure kind, the counts.
   - Reading prescribed *values* as the state of an exercise history does not hold is projection → history.
   - The channel the contract targeted, a stored start's values, is closed (Q6).
4. **Must the mixed legacy state be replaced entirely?**
   - The engineering evidence does not show that.
   - The stored-start channel is closed, and the open defects are enumerable:
     - one reducer channel (rows as state for fresh exercises);
     - two view atoms (the RESTART run, REPS_THEN_LOAD repetitions);
     - one reader filter (superseded rows).
   - Whether to close them in a new mission or to redesign is the Founder's decision.

## 8. Gate inputs (engineering scope; not mission readiness)

| Gate | Engineering input |
|---|---|
| HISTORICAL_STATE_INTEGRITY | **NOT_READY**: QE-R7ASM-01, QE-R7ASM-04 |
| PLANNING_PROJECTION_INTEGRITY | **NOT_READY**: QE-R7ASM-02, QE-R7ASM-03. The planner keeps projecting freely, but history-defined progression is read from the projection after the facts |
| FACT_PROJECTION_SEPARATION | **NOT_READY**: QE-R7ASM-01 (reducer), QE-R7ASM-02 and QE-R7ASM-03 (view) |
| VALUE_SCOPED_EVIDENCE_AUTHORITY | **NOT_READY**: QE-R7ASM-01. A prescribed load stands as an exercise's load, and as its adoption reference, without evidence of that load |
| WEEK_START_STATE_AUTHORITY | **READY on its own path**: stored starts' values are never read (Q6), and the P40 family holds. The closing dependency (QE-R7ASM-05) is for the Founder or SSCTR to rule on |
| STATE_PRESERVATION_INTEGRITY | **READY within what I checked**: BASELINE drift is limited to the declared delta, the predecessor copy is intact, and the earlier probes are byte-identical. I did not verify that the mission files are append-only |
| RETURN_RECOVERY_CEILING_INTEGRITY | **NOT_READY**: a return resumes a load never evidenced (QE-R7ASM-01), and the run's LONG-return progression comes from the projection (QE-R7ASM-02) |
| STATE_MODEL_ENGINEERING_REVIEW | **NOT_READY** |
| STATE_MODEL_SCIENTIFIC_REGRESSION | Not mine (SSCTR) |

## 9. Proven, inferred, not tested

**Proven (run on these bytes):**
- QE-R7ASM-01, through:
  - Q3: 4 variants, identical records;
  - Q3b: conflict, identical record, plus the predecessor comparison;
  - Q12a: facts-only path.
- QE-R7ASM-02: Q4 and Q4b, identical ledgers.
- QE-R7ASM-03: Q11c and Q12b, three goals, identical ledgers.
- QE-R7ASM-04: Q2 and Q2b.
- QE-R7ASM-05: Q10, plus the P51d residual at three time zones.
- QE-R7ASM-06: Q9.
- QE-R7ASM-07: Q2, plus a read of the tests.
- The closure of QE-R7ASE-01 (mechanism), QE-R7ASE-02 and QE-R7AB-01 on the judges' probes, and the byte-identity of 23 reruns.
- Q6 invariance; Q11a and Q11b; 589/589; verify 16/16; digest equal at the start and at the end.

**Inferred (code reading, not run):**
- QE-R7ASM-02 also reaches a walk/jog athlete's return (same `mode === 'RETURN'` test).
- QE-R7ASM-01 can also be triggered by a newer report of the same break that moves an exercise's establishment inside the interruption.
- QE-R7ASM-01 to -03 do not depend on the time zone: the mechanisms read no clock.

**Not tested:**
- My own probes at other time zones.
- Real data or athletes; human or clinical validation.
- HealthKit, KMP, UI, production.
- The SSCTR's dose claims: "113 dose fields fell, 3 rose" and `allRisenAreEffortGuided`.

## 10. Is the author's evidence adequate?

The mechanical evidence is real and reproducible:
- 589/589 tests pass.
- T1 and T2 discriminate the two freezes.
- Every earlier judge probe reruns byte-identically.
- The stored-start channel is genuinely closed (my Q6 confirms it independently).

It does not reach the classes above, for four reasons:
- The self-challenge's "late correction" class and the suite's T15 and P7 never build a correction (QE-R7ASM-07).
- No test or mutant targets the row → state channel, i.e. a fresh exercise prescribed by a KNOWN row.
- The P1 test avoids the week's last day.
- Every test uses a LOAD goal and, for returns, a moderate return.

The handoff's QE-R7ASE-01 claim is worded for the named atoms. P51d's general oracle does not hold, in the conservative direction (QE-R7ASM-05).

## 11. Verdict

```
STATE_MODEL_ENGINEERING_REVIEW = NOT_READY
```

| Finding | Severity | Class | HistoricalState | Status |
|---|---|---|---|---|
| **QE-R7ASM-01** | MEDIUM | Same as QE-R7ASE-01 / QE-R7AB-01, through a new channel (prescription rows → reducer) | **Contaminated** | **Blocking** |
| QE-R7ASM-02 | MEDIUM | Same as QE-R7ASE-02 (LONG-return run read from the projection) | Clean | Material |
| QE-R7ASM-03 | MEDIUM | Same as QE-R7ASE-01's planning consequence / R42 (REPS_THEN_LOAD repetitions from the projection) | Clean | Material |
| QE-R7ASM-04 | MEDIUM | New: retracted evidence read as live by the public reader | Public reader wrong | Material for HISTORICAL_STATE_INTEGRITY |
| QE-R7ASM-05 | LOW–MEDIUM | Declared E1/E3 consequence | Earned credit depends on whether a decision closed the week | Non-blocking for the reviewed class; ruling requested |
| QE-R7ASM-06 | LOW | Representational | — | Non-blocking |
| QE-R7ASM-07 | LOW | Evidence | — | Non-blocking |

Under Founder §28 and §33, a material projection → history case found after the freeze routes the mission to `STATE_MODEL_CLOSURE = NOT_READY` and `NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION`. That record, and any R7A exit readiness, belong to the closing session after the SSCTR regression review. I do not issue them.

**Files written by this review**, all in this folder:
- `quality-engineering-r7asm-review.md` and `.json`;
- the probes `qe-r7asm-*.mjs` and the library `qe-r7asm-lib.mjs`;
- the outputs in `qe-r7asm-runs/` (my probes, the judge reruns with their hash comparison, the read-only verification and the test run).
