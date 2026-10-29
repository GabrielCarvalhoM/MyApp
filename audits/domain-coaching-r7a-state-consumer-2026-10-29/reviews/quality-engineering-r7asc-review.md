# QUALITY & RELIABILITY ENGINEERING REVIEW — COACHING CORE: STATE MODEL CONSUMER CLOSURE

**Review:** R7ASC-QE-r1, 2026-10-29. Independent engineering judge in a new session. I am not the author. I made no runtime change, patch, correction cycle or freeze, and I issue no `R7A_EXIT_READINESS`.

**Freeze reviewed:** **STATE-MODEL-CONSUMER-FREEZE-1**
- Source digest: `adab37162d4f30d783faed2fe02fd44769a4be36be7bb1f6e8455a01b86235e5`. I recomputed it with my own canonical serializer at the start and at the end.
- Manifest digest: `4f11f4b48782a5f16dc6c9770a367d013564380aecc42d19be348d4ebc45cd1f`.
- Freeze record: `CoachingCore/r7/state-consumer/RUNTIME_FREEZE_STATE_MODEL_CONSUMER.json`, SHA-256 `5c8687755daa3294339150d35170178e033e12d552315ed92fb4cd668217f3b2`.

**Brief:** [ENGINEERING_REVIEW_BRIEF.md](ENGINEERING_REVIEW_BRIEF.md).

```
STATE_MODEL_CONSUMER_ENGINEERING_REVIEW = NOT_READY
REVIEW_INVALID = NO   (bytes equal to the freeze at the start and at the end)
```

> **Is there any material V1 path on which PlanningProjection, prescribed lines, retracted or superseded evidence, or future evidence can contaminate HistoricalState, or on which History + Projection composes a semantically incoherent prescription?**
>
> **Yes, on three of the four properties.** Property B holds.
>
> - **A (QE-R7ASC-01).** A KNOWN row planned from evidence that was later retracted is still the reference that a first establishment log is adopted against. This happens whenever history holds the exercise only as FROM_LOG (established by effort, no usable load).
>   - With an **identical record**, HistoricalState ends `KNOWN 24 kg, LOGGED_ACTUAL`, or `FROM_LOG, pending 24 kg, confirmation asked`.
>   - Which one depends only on whether the correction reached the plan before or after the rows were planned.
>   - This is the same class as QE-R7ASM-01: the fix covers only an exercise history does not hold at all.
> - **C (QE-R7ASC-04), a regression of this freeze.** After a goal change, two consumers resolve the same executed week under two different goals:
>   - the evidence reducer under the old goal;
>   - the closing review under the new goal.
>
>   The dose the athlete is prescribed then depends on whether an unrelated decision re-composes the week. With an identical record this happens in 18 of 20 goal pairs and 71 exercise rows. For example, back squat is 82.5 × 7 or 85 × 5. The same probe gives 0 pairs on STATE-EVIDENCE-FREEZE-1 and 1 pair on the predecessor.
> - **D (QE-R7ASC-03), pre-existing, new class.** In a moderate return (RETURN mode), every run role shares one gate, and a later role's ADVANCE overwrites an earlier role's HOLD.
>   - At Thursday 22:00 HistoricalState already reads the return week's runs as `COMPLETED_SESSIONS` and credits the return step. Sunday's long run is not yet due.
>   - A missed long run never holds the return. Next week's long run goes from 20 to 45 minutes.
> - **C (QE-R7ASC-02), declared boundary E10, pre-existing.** Outside RETURN/RESTART, the view takes the run's targets and unlock counters from the projection.
>   - Identical ledgers, identical history, and two unexecuted weeks still produce an unearned threshold or easy-run step, quality and strides unlocked a week early, or a walk/jog ladder step.
>   - In one case a walk/jog athlete is graduated to continuous running.

The four target findings reproduce as closed on their judges' own probes (§3). The earlier blockers stay closed. Property B holds on every reader I tried. Property D holds for strength and in a truncation test over 896 cuts.

## 1. Integrity

| Check | Result |
|---|---|
| Source digest | Recomputed with my own canonical serializer, independently of the runtime's `hash()`, and cross-checked against it. `adab3716…` at the start and at the end (`qe-r7asc-runs/integrity.start.out.json`, `qe-r7asc-runs/integrity.end.out.json`) |
| Manifest digest | `4f11f4b4…` recomputed: 84 files bound, 0 mismatched, 0 missing. No unfrozen or stray file under `src/` or `test/`. Exactly one `RUNTIME_FREEZE_*` file |
| Delta from the predecessor | Recomputed. Changed: `src/r6-adaptation.mjs`, `src/r6-program.mjs`, `test/r7asm-state-model.test.mjs`. Added: `test/r7asc-state-consumer.test.mjs`. Nothing removed. Equal to the recorded delta |
| Policy | R6-POLICY-5, canonical hash `18ec48f3…` recomputed, unchanged |
| Predecessor copy | `state-model-freeze-source/`: 83 of 83 match its MANIFEST. Its source digest recomputes to `0db72d0e…` |
| `node CoachingCore/scripts/verify-r7asc.mjs` (read-only) | 25/25 before I wrote anything into `reviews/` (`qe-r7asc-runs/verify-r7asc.read-only.out.json`). Its `reviews-not-dispatched` check fails from now on, by design: this review and the concurrent SSCTR review write into `reviews/` |
| `node --test` (Node v24.19.0) | 632/632 (`qe-r7asc-runs/node-test.out.txt`). No test or runtime file writes to disk; I checked before running |

**Not run:** `npm run verify`, `npm run simulate`, any `--write`, and any `freeze-*`, `prepare-*`, `queue-*` or `regress-*` script or evidence runner.

**Files touched:** only my own `qe-r7asc-*` files and `quality-engineering-r7asc-review.*`, in this folder. A concurrent SSCTR session is writing `ssctr-r7asc-*` here; I did not touch those files.

## 2. What I ran

Every probe is read-only and synthetic, with DEV_TEST_ONLY authority. Each one prints JSON. The scaffolding is `qe-r7asc-lib.mjs`, which has the same intake shape as the predecessor judge's library and reads history on the record **as evaluateProgram returns it**. `qe-r7asc-run-all.mjs` re-ran every probe on the final scaffolding and bound the batch to the digest before and after (`qe-r7asc-runs/RUNS.json`).

| Probe | Class attacked | Result |
|---|---|---|
| The 35 earlier judge probes, unmodified (`qe-r7asc-rerun-judges.mjs`). These are QE-R7ASM Q2–Q12, QE-R7ASE P50 (×3 time zones), P51b/c/d, P52, I01, I02; QE-R7AB P40 (×2), P40b, P40c, P41, P47b; QE-R7AF P30c, P31, P32, P37; R7-A.2 P17, P19; R7-A.1 P07 | Reproduce the target findings and the earlier blockers | **35 of 35 byte-identical** to the author's recorded runs; scripts unchanged (`qe-r7asc-runs/judge-reruns/SHA256_vs_author.json`). Against the previous judge's runs on the predecessor: 19 identical, 15 differ, 1 had no earlier run (`compare-prev-judge.out.json`). Of the 15, 9 are the QE-R7ASM Q probes, where the fixes act. The other 6 (P17, P40c, P30c, P37, P51c, P52) change only through the declared accessory repetition cut (7 → 6) or F2's held repetitions. Neither reopens their findings (§3) |
| `P01` stale KNOWN row, history holds FROM_LOG | A: a prescription planned from retracted evidence as the adoption reference | **QE-R7ASC-01** |
| `P01b` | P01 with week 3 never reviewed (no decision at all), and through a conflict (Q3b's trigger) | **QE-R7ASC-01** on both |
| `P02`, `P02b` run view outside re-entry (E10) | C: unearned run progression on identical ledgers. EASY and WALK_JOG, weeks 1–11 | **QE-R7ASC-02** (identical on the predecessor) |
| `P03` correction boundary, B1–B5 | B: 22 → 20; a chain X+2 → X+1 → X; the execution moved to Monday; a run correction; a correction that adds a load. Every reader against a control that reported the corrected facts | **Holds.** Every historical reader at every cut, the next rows and the internal reducer equal the control |
| `P03b` | The one decision-label difference in P03 | My probe's timing: a correction review on the week's last day closes the week early (E1). The programs are identical after the closing review |
| `P04` Thursday return, later session; truncation | D: SHORT, MODERATE and LONG returns reported Thursday 06:00, with the Saturday session executed or not; history on the whole record against the record cut at each instant (8 timelines, 896 cuts, time zone −180 included) | **Strength holds.** The two cells are equal at every cut up to the execution and differ only after it. Truncation: 0 violations. In the MODERATE week the **run** step is credited at Thursday 22:00, which led to P05 |
| `P05`, `P05b` re-entry run gate | D/C: RETURN and RESTART weeks with the long run executed, missed or pending, or the easy run missed; plus a control outside re-entry | **QE-R7ASC-03** (same decisions on the predecessor and STATE-EVIDENCE-FREEZE-1) |
| `P06` strength dose after a goal change | C: every ordered goal pair, ADV and HOLD weeks. Range, load against history, HOLD repeats | Range 0 and HOLD 0. Load: 4 rows above history without an earned step, all GENERAL → RUNNING_SUPPORT, which led to P07 |
| `P07` goal change, two readings | C: the same evidence resolved by the reducer (old goal) and by the closing review (new goal). An equipment statement that changes no exercise re-composes the week from the PlanningView | **QE-R7ASC-04**: 18 of 20 pairs. The same probe gives 1 pair on the predecessor and 0 on STATE-EVIDENCE-FREEZE-1 |

## 3. Target findings and predecessor blockers

| Finding | Status | Evidence |
|---|---|---|
| **QE-R7ASM-01** | **Closed on its reproduced scenarios; the class is not closed** | <ul><li>Q3, all four variants: `prescribedKnownLoadBecameHistory = false`, `sameRecordDifferentHistory = false`.</li><li>Q3b: identical record, identical history.</li><li>Q12a: no prescribed load reaches the facts-only reading.</li><li>The internal reducer agrees.</li><li>The adjacent state is still open: an exercise history holds as FROM_LOG, not absent. See **QE-R7ASC-01**.</li></ul> |
| **QE-R7ASM-02** | **Closed** | <ul><li>Q4, LONG: `planDiffersWithIdenticalLedgers = false`; plan and history are `RESTART 15` in both cells. The MODERATE control is clean.</li><li>Q4b: `historyAlwaysEqual = true`; rows equal in every week.</li><li>My walk/jog LONG return (P02 c) shows no divergence.</li><li>The run view outside re-entry is QE-R7ASC-02, which E10 declares.</li></ul> |
| **QE-R7ASM-03** | **Closed on its scenarios** | <ul><li>Q11c: `onlyU` and `onlyR` are empty; history equal.</li><li>Q12b, GENERAL and RUNNING_SUPPORT: no row differs.</li><li>The strength view is now history only.</li><li>A new strength class remains after a goal change: QE-R7ASC-04.</li></ul> |
| **QE-R7ASM-04** | **Closed** | <ul><li>Q2: the public reader and the internal reducer agree (`lastPerformedAt` 2026-11-14).</li><li>Q2b: `publicApiReadsRetractedLoad = false`; every reader says 20.</li><li>P03 B1–B5: every reader equals the control at every cut, including a cut before the correction's own time. That reading is declared in contract §4.</li></ul> |
| QE-R7ASE-01 | Stays closed | P51b and P51d are byte-identical to the previous judge's runs. P51c differs only in held repetitions (F2): `x5` and `x6` where the predecessor had `x3`; the tick is unchanged |
| QE-R7ASE-02 | Stays closed | P50 at three time zones is byte-identical to the previous judge's runs. P52 differs only by the accessory cut (7 → 6), the same in both cells |
| QE-R7AB-01 | Stays closed | P40 (×2), P40b, P41 and P47b are byte-identical. P40c differs only by the accessory cut, the same in both cells |
| QE-R7AF-01/02, QE-R7A-01, QE-R7A1-09/10, QE-R7A2-01/02/03 | Stay closed | P31, P32, P19 and P07 are byte-identical. P30c, P37 and P17 differ only by the accessory cut |
| Mutation survivor ("the view takes history's run only when history itself is in re-entry") | **Not refuted** | <ul><li>I found no V1 path where the projection is in RETURN/RESTART and history is not.</li><li>Reviews carry no clock-order guard (`previousValidity` checks only a supplied reference state).</li><li>Even with an out-of-order clock, history takes the latest return in force without a clock filter, so it would be in re-entry too.</li></ul> |

## 4. Findings

### QE-R7ASC-01 — MEDIUM, material, **blocking** (Property A, P5). Same class as QE-R7ASM-01

**Class.** A prescription read as evidence. It is the residual of QE-R7ASM-01 in the adjacent state: the exercise is held by history, but only as FROM_LOG.

**What the contract says.** §3: "a KNOWN row's load is not the exercise's load; it is not the reference a first log is judged against, so that log waits for confirmation (SSCTR D45)."

**What the code does.**
- `advanceStrength` converts the rows with `asEstablishment` only when the start does not hold the exercise:
  - `const list=assumeLogged||ss0.exercises[id]?rows:rows.map(asEstablishment)` (`src/r6-program.mjs:605`);
  - the load questions do the same (`u=state[id]?row0:asEstablishment(row0)`, `src/r6-adaptation.mjs:94`).
- History can hold an exercise as FROM_LOG without any usable load:
  - `strengthAtBreak`, the facts-only reading, sets up every performed fresh exercise, and leaves it unlogged when it was done without a usable load;
  - or the exercise was established by effort.
- In that state a stale KNOWN row keeps its value. `loggedLoadDecision` then takes `planned = u.value` (`src/r6-program.mjs:431`, called at `:619`), so a first log at most one increment above it is adopted. It skips the `ESTABLISHMENT_LOG_UNCONFIRMED` branch.

**Reproduction.** P01 uses Q3's shape, extended by one week. Every report is built once and sent identically to each cell, so **EARLY and LATE hold the same record**.
1. Weeks 0–1: `db-rdl` is logged at 20 kg and adopted.
2. Corrections remove `db-rdl` from both reports. EARLY receives them with week 1's review. LATE receives them on Monday 07:00 of week 2, a mid-week review that keeps the plan, so week 3 keeps its projected `KNOWN 22` row.
3. Week 2 is never closed. Its Saturday is executed without a usable load: no exercise details, sets and reps without load, or an unknown unit. History at week 3 is **identical in both cells**: `FROM_LOG`, unlogged, no load.
4. Week 3 Saturday: `db-rdl` is logged at 19 kg (or 24 kg) with the target met, and the week is closed.

| | EARLY (correction before planning) | LATE (correction after planning) |
|---|---|---|
| Week 3 Saturday row | `FROM_LOG 2x5` | `KNOWN 22 2x5`, a projected step from the retracted 20 kg |
| Closing review's load questions | `ESTABLISHMENT_LOG_UNCONFIRMED` (19 or 24 kg) | none |
| HistoricalState at week 4, public reader | `FROM_LOG`, `pendingLoad 19` (or 24) | **`KNOWN 19` (or 24), `LOGGED_ACTUAL`**, `lastExecutedLoad 19` (or 24) |
| Internal reducer (what-if return entry) | `FROM_LOG`, pending | `KNOWN`, `LOGGED_ACTUAL` |
| Week 4 rows | `FROM_LOG 4x5` | `KNOWN 19 4x5` (or `KNOWN 24 4x5`) |

**Robustness.**
- **P01b (i):** week 3 is never reviewed either. After week 1's review there is **no decision at all**, and the public reader alone gives `KNOWN 19` against `pending 19` on the identical record, through `COMPLETED_SESSIONS`.
- **P01b (ii):** the same happens through a conflict. A late wearable record quarantines the establishing session, which is Q3b's trigger.
- **Predecessor:** the decisions diverge the same way. Its public reader is confounded by QE-R7ASM-04.

**Why it is material.**
- **Ordinary V1 inputs:** a correction or a late wearable record that conflicts, a workout synced without a readable load, and a week not closed by a review.
- **Property A:** the stale prescribed line establishes a historical fact, an adopted known load. On the same facts that load would otherwise await the athlete's confirmation (D45).
- **P5:** with an identical record, HistoricalState depends on when the correction reached the plan.
- **Sports consequence:** in the 24 kg variant, a first log 20% above the retracted load becomes a known load of 4 × 5 the next week, without confirmation.
- **The adopted value is factual:** it was lifted. What the prescription supplies is the adoption, not the number.

**Invariants violated.** Founder Property A, "prescribed lines cannot establish historical facts". The predecessor judge's P5. Contract §3 as quoted.

### QE-R7ASC-04 — MEDIUM, material, **blocking** (Property C). New class, **regression introduced by this freeze**

**Class.** Two resolvers of EarnedProgress across a change of goal context. It is not an atom mixture inside one dose. The same evidence yields two different coherent doses, and which one is prescribed depends on which consumer last wrote the week.

**What the code does.**
- The evidence reducer judges week j under week j's own context: `const j=k-1,…,skj=skOf(j),skn=skj` (`src/r6-adaptation.mjs:707`). That is HistoricalState's EarnedProgress, which `resolveExercisePrescription` passes to every decision as the dose (`planningBase`).
- The closing weekly review applies **next** week's context to the same evidence: `skn=sk.at(w+1)` (`:374`), then `advanceStrength(skn,…)` in `evidenceStart` (`:256`). It writes next week's rows from that reading.
- After a goal change stated for next week, the two readings use different goals' progression rules. Any later decision that re-composes the week from the PlanningView re-doses it from the old-goal reading. One example is an equipment statement that changes no exercise: `composeWeeks(…{fromWeek:w,…})` at `:560`, recorded as `KEEP` with `instantiationOnly` at `:573`.

**Reproduction (P07).** For every ordered pair of strength goals:
1. Weeks 0–3 are trained and reviewed under G1.
2. A GOAL_CHANGE to G2 is reported on Monday of week 4 (in force from week 5).
3. Week 4 is executed as prescribed and reviewed.
4. In the EQUIP cell only, on Monday 06:00 of week 5 the athlete states one more equipment item. It changes no exercise; the decision is `KEEP`, `instantiationOnly`.

The records are identical in every pair.

| Pair | Exercise | Week 5, as the closing review wrote it | After the equipment statement (from the PlanningView) |
|---|---|---|---|
| STRENGTH → HYPERTROPHY | back-squat | `KNOWN 82.5 4x7` | `KNOWN 85 4x5` |
| STRENGTH → MAINTAIN | db-bench-press | `KNOWN 20 3x6` | `KNOWN 22 3x6` |
| GENERAL → RUNNING_SUPPORT | db-row | `KNOWN 24 3x6` | `KNOWN 22 3x10` |
| MAINTAIN → HYPERTROPHY | back-squat | `KNOWN 80 4x7` | `KNOWN 80 4x5` |
| RUNNING_SUPPORT → MAINTAIN | back-squat | `KNOWN 82.5 3x6` | `KNOWN 82.5 3x8` |

**Totals:** 18 of 20 pairs and 71 exercise rows. The same probe gives **0** pairs on STATE-EVIDENCE-FREEZE-1 and **1** pair (3 rows) on HISTORICAL-PROJECTION-FREEZE-1.

The regression comes from Front C. The view is now history judged under the old goal, while the closing review still judges under the new goal. Before, the view read the projection, so both paths agreed.

**Why it is material.**
- **The dose is not a function of the facts and the current goal.** Identical facts and an unrelated, ordinary V1 event change the prescribed load and repetitions for a week. The same happens with any other decision that re-composes the current week, such as a return report.
- **HistoricalState disagrees with the prescription.** It reports `stepEarned: true` for back-squat (85 under the STRENGTH rule) while the plan prescribes 82.5 × 7.
- **Founder §8:** "ONE place semantically responsible for resolving … as a coherent dose; do not spread resolution among consumers".
- **The §8 attack list:** "Goal change" and "differences must come from the policy, not from which state source was read".
- **The author's tests miss it.** S6 checks only the range, never that the two readings agree.

### QE-R7ASC-03 — MEDIUM, material, **blocking** (Property D; also C). New class, pre-existing

**Class.** The week's run credit is granted without the week's evidence. It was not reported by earlier judges, and this freeze did not introduce it.

**What the code does.**
- In RETURN and RESTART modes `weeklyGates` maps every run role to one key: `gateKey=…?'EASY':key` (`src/r6-adaptation.mjs:163`).
- It visits the roles in the order LONG, QUALITY, EASY, WALK_JOG. `setGate` overwrites (`:155`), so the last role's verdict wins (`:169`).
- The strength loop keeps an earlier HOLD (`:175`). The run loop does not.

**Reproduction (P05, P05b).** A moderate interruption (17 days) is reported on Thursday 06:00, with re-entry this week. The re-entry rows are Thursday `EASY 15` and Sunday `LONG 20`, both `RETURN_STEP=0`.

| Cell | Closing review | History next Monday | Next week's runs |
|---|---|---|---|
| Thursday and Sunday executed | `EASY: ADVANCE` | `RETURN`, step 1 | `EASY 30, EASY 30, LONG 45` |
| **Sunday's long run missed** | Reasons say `HOLD: LONG: not executed (NOT_REPORTED)`, yet the gate is **`EASY: ADVANCE`** | step 1 | **`EASY 30, EASY 30, LONG 45`** |
| Thursday's easy run missed, Sunday executed | `EASY: HOLD` | step 0 | `EASY 15, EASY 15, LONG 20` |

At **Thursday 22:00**, with Sunday's long run, which is after the return's point, not yet due, the public reader gives `basis.RUN = COMPLETED_SESSIONS` and `returnStep 1`. That contradicts the reducer's own definition at `:715`: "executed completely… a gate holds when any row of its role… was not executed".

- **RESTART:** not affected in this shape, because all restart runs carry the EASY role.
- **Predecessors:** the same decisions on STATE-EVIDENCE-FREEZE-1, and the same history on HISTORICAL-PROJECTION-FREEZE-1.

**Why it is material.**
- **Property D:** HistoricalState credits a week's return step before that week's sessions exist, and keeps it when one of them never happens.
- **Property C:** HOLD does not repeat the dose, and the result depends on the order in which roles are visited, not on policy.
- **Sports consequence:** shown, a return week whose long run was missed steps the next long run from 20 to 45 minutes. Inferred from the same mechanism, a second such week completes the return to the prior long run (70 minutes) with no long run executed since the break. This is the run counterpart of the step-skipping that F1/D53/D57 forbid for strength.

### QE-R7ASC-02 — MEDIUM, material (Property C). Declared boundary E10, pre-existing. **Blocking unless the Founder explicitly accepts E10's trade-off**

**What the code does.** Outside RETURN and RESTART, `planningBase` takes the run's targets and unlock counters from PlanningProjection, and only the capability atoms from history (`src/r6-adaptation.mjs:755`; contract E10).

**Reproduction (P02, P02b), EMPTY shape.**
- Weeks 0..k−1 are trained and reviewed. Weeks k and k+1 have nothing executed.
- U: week k is not reviewed. R: week k is reviewed.
- Ledgers are identical in every case. HistoricalState is identical in 21 of the 22 cases; the exception (EASY, k=2) is OBS-2 and is left out below.

Results:
- **EASY runner:** U's plan is ahead of its own history in 11 of 11 weeks. In the 10 weeks whose histories are identical, U's rows differ from R's in 6. Examples:
  - k=1: quality and strides unlocked a week early;
  - k=4: one threshold step more (step 2 against 1), long-run target 75 against 70;
  - k=6: easy runs 50 against 45 minutes, threshold step 4 against 3;
  - `easyWeeksDone` counts an unexecuted week, although the policy unlocks only on executed established easy weeks.
- **WALK_JOG athlete:** U is ahead in 9 of 11 weeks, with rows differing in 8. The ladder is one step ahead. At k=10 U **graduates the athlete to continuous running** (EASY 21 min, 25-minute target), while history and R keep walk/jog step 8.

The predecessor is identical.

**Assessment.**
- **Against the Founder's own Property C:** this is the run-side twin of QE-R7ASM-02/03, failing "projection above history does not anticipate unearned progression" and "HOLD … does not progress the dose".
- **What E10 rests on:** the previous Founder §14 ("the projection may freely contain the future; do not make the trainer excessively conservative"). §14 is about the projection's content.
- **What E10 conflicts with:**
  - the previous Founder §15: "the planner sees the last fact and the next target without turning one into the other";
  - this mission's §11: "differences must come from policy, not source".
- **Precedent:** the predecessor judge rejected a declared boundary on the same grounds (QE-R7ASM-03).
- **The trade-off is real:** reading the run from history's facts-only branch would hold executed dimensions of a partly executed, unreviewed week. Whether E10 stands is therefore Founder-owned. I do not accept the declaration as satisfying Property C.

### Observations (not blocking)

- **OBS-1. The predecessor's P01 numbers are confounded.** On HISTORICAL-PROJECTION-FREEZE-1 the public reader still had QE-R7ASM-04, so its P01 histories are not comparable. Its decisions are.
- **OBS-2. QE-R7ASM-05 reaches the run.** In P02b, EASY k=2 (EMPTY), the history of a reviewed empty week differs from an unreviewed one. This is the declared E1/E3 class (QE-R7ASM-05). I did not analyse it further.
- **OBS-3. The verifier's `reviews-not-dispatched` check now fails, by design** (§1).
- **QE-R7ASM-05, QE-R7ASM-06, QE-R7ASM-07, NF-R7ASM-2 and R41:** I found no evidence that promotes any of them under Founder §12.

## 5. The four properties

| Property | Verdict | Basis |
|---|---|---|
| **A**, factual history ingress | **Violated** | QE-R7ASC-01 (P01, P01b). Q3, Q3b, Q12a and Q6 hold |
| **B**, correction and retraction consistency | **Holds** | Q2 and Q2b. P03 B1–B5: every public reader at every cut, the next rows and the internal reducer equal a control that reported the corrected facts. This covers a correction chain, a moved execution, a run correction and a correction that adds a load |
| **C**, semantic prescription resolution | **Violated** | QE-R7ASC-04 (regression), QE-R7ASC-02 (E10). P06: no row above the current goal's range, and HOLD repeats the held dose in every goal pair |
| **D**, temporal evidence | **Violated** (run, RETURN mode) | QE-R7ASC-03. Holds for strength (P04 SHORT, MODERATE, LONG) and in the truncation test (8 timelines, 896 cuts, time zone −180, 0 violations) |

## 6. Consumers, as the brief asks

| Consumer | Wants | Gets | Can it promote a target to fact? | Future evidence? | Retracted rows? | Incoherent dose? |
|---|---|---|---|---|---|---|
| `setUp` / `advanceStrength` (evidence mode) | History | History, plus the week's rows as what was prescribed | **Yes**, a stale KNOWN row's value as the adoption reference when history holds FROM_LOG (QE-R7ASC-01) | No (P04) | No (P03) | — |
| `historicalStateOf` | History | `canonicalRecord`, then the reducer | Inherits QE-R7ASC-01 | Run in RETURN mode: the week credited early (QE-R7ASC-03) | No (Q2, Q2b, P03) | — |
| `planningBase` / `resolveExercisePrescription` | View | Strength: history only. Run: history in re-entry, otherwise the projection | Run outside re-entry: the projection's step (QE-R7ASC-02) | — | — | Goal change: old-goal EarnedProgress against the closing review's new-goal reading (QE-R7ASC-04) |
| Weekly review (`evidenceStart`) | View plus evidence, into next week's context | Same | Inherits QE-R7ASC-01 | — | — | QE-R7ASC-04, QE-R7ASC-03 |
| Return / restart (`stateAtBreak`) | History | History, resumable | No (`strengthAtBreak` adopts only on a KNOWN state) | No (P04) | No | — |
| Re-establishment (D52) | History | History (`lastPerformed` from executions only) | No | No | No | — |
| Goal change (`rebuild`) | View | A conditional start or the evidence start under the new context | — | — | — | QE-R7ASC-04 |

## 7. Proven, inferred, not tested

**Proven (run on these bytes):**
- QE-R7ASC-01: P01 (3 variants × 2 loads), P01b (no decision after week 1; conflict trigger). It shows the same divergence on the predecessor.
- QE-R7ASC-02: P02 and P02b, 22 EMPTY cases, identical ledgers and histories. Also on the predecessor.
- QE-R7ASC-03: P05 and P05b, plus the predecessor and STATE-EVIDENCE-FREEZE-1 for the decisions.
- QE-R7ASC-04: P07, 20 pairs, against the predecessor (1 pair) and STATE-EVIDENCE-FREEZE-1 (0).
- Property B: Q2, Q2b, P03.
- Property D for strength: P04 and the truncation test.
- The target findings' closure on their judges' probes: 35 of 35 byte-identical to the author's runs.
- 632/632 tests, `verify-r7asc` 25/25, and the digest equal at the start and at the end.

**Inferred (code reading, not run):**
- QE-R7ASC-04 also arises with any other decision that re-composes the current week from the view: a return report with re-entry this week, or a goal change that reaches this week.
- QE-R7ASC-03 reaches a RETURN week whose QUALITY run, rather than its long run, is missed or pending.
- QE-R7ASC-03: a second return week with its long run missed completes the return to the prior long run (70 minutes). The first step is proven (P05); the second follows the same gate.
- QE-R7ASC-01 also arises through a newer report of a break that moves an exercise's establishment inside the interruption.

**Not tested:**
- Real data or athletes; human or clinical validation; HealthKit, KMP, UI, production.
- My probes at time zones other than 0 and −180.
- The SSCTR's dose rulings: the accessory 7 → 6 cut, E9, and the return base.

## 8. Is the author's evidence adequate?

**The mechanical evidence is real.** 632/632, verify 25/25, and every judge probe reproduces byte for byte. The four target findings are closed on their scenarios.

**It misses the classes above:**
- **QE-R7ASC-01:** every QE-R7ASM-01 test, and the load-question test, uses an exercise history does **not** hold. None uses one held as FROM_LOG.
- **QE-R7ASC-04:** S6 checks only the range after a goal change. No test or self-challenge class compares the closing review's reading with the PlanningView's after a goal change. The regression is invisible to the C5–C9 classes because each reading is coherent on its own.
- **QE-R7ASC-03:** no test misses a long run in a RETURN week, or reads history mid-week in one.
- **QE-R7ASC-02:** the run outside re-entry is declared, not tested on identical ledgers.

## 9. Verdict

```
STATE_MODEL_CONSUMER_ENGINEERING_REVIEW = NOT_READY
```

| Finding | Severity | Property | Class | Introduced by this freeze | Status |
|---|---|---|---|---|---|
| **QE-R7ASC-01** | MEDIUM | A (P5) | Same class as QE-R7ASM-01 (residual, adjacent state) | No (the target's residual) | **Blocking** |
| **QE-R7ASC-04** | MEDIUM | C | New class (two resolvers across a goal context) | **Yes** (18 of 20 pairs; 1 on the predecessor; 0 on STATE-EVIDENCE-FREEZE-1) | **Blocking** |
| **QE-R7ASC-03** | MEDIUM | D, C | New class (re-entry run gate overwrites HOLD) | No (pre-existing) | **Blocking** |
| QE-R7ASC-02 | MEDIUM | C | Same class as QE-R7ASM-02/03 on the run outside re-entry, under declared E10 | No (pre-existing) | Blocking unless the Founder explicitly accepts E10 |

**Routing.** Founder §34: after the reviews, only a material violation of A–D or a direct sports regression blocks this foundation. QE-R7ASC-01, QE-R7ASC-03 and QE-R7ASC-04 are material violations of A, D and C. The closing record belongs to the closing session after the SSCTR regression review: `FINAL_DISPOSITION`, any `R7A_EXIT_READINESS`, and the next mission. **None is issued here.** No fix and no second freeze are requested by this review.

**Files written by this review**, all in this folder:
- `quality-engineering-r7asc-review.md` and `.json`;
- the probes `qe-r7asc-P01…P07*.mjs`, the library `qe-r7asc-lib.mjs`, and the instruments `qe-r7asc-integrity.mjs`, `qe-r7asc-rerun-judges.mjs`, `qe-r7asc-compare-prev-judge.mjs`, `qe-r7asc-deepdiff.mjs`, `qe-r7asc-flags.mjs` and `qe-r7asc-run-all.mjs`;
- `qe-r7asc-runs/`: the probe outputs, the final re-run (`final/`, `RUNS.json`), the judge re-runs, the integrity records, the read-only verification and the test run.
