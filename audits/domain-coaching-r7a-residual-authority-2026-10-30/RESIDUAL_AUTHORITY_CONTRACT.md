# R7-A RESIDUAL AUTHORITY CLOSURE — contract

**Revision:** R7ARA-CONTRACT-1, 2026-10-30. **Authority:** the Founder request of 2026-10-30, verbatim in [FOUNDER_REQUEST.md](FOUNDER_REQUEST.md).

**Supersedes nothing.** [DECISION_AUTHORITY_CONTRACT.md](../domain-coaching-r7a-decision-authority-2026-10-29/DECISION_AUTHORITY_CONTRACT.md) (A1–A4, B1–B3, C1–C5, W1–W2) stays in force. This contract generalizes two of its rules:
- A3, the factual re-plan of the weekly review, becomes A5, applied before every decision;
- W2, the walk/jog ceiling of a return, becomes E1, applied to every supported running state.

**Architecture unchanged (§7).** HistoricalState, PlanningProjection, PlanningView, the canonical record and the evidence reducer are read as they are. There is no new state model, provenance framework or event sourcing.

| Contract | Findings | Runtime change |
|---|---|---|
| A5. The canonical factual state comes before every decision | QE-R7ADA-01 | `factualReplan` and `withFactualReplan`, called once in `evaluateProgram` before dispatch (r6-adaptation). The weekly review's mid-week A3 branch moves there; it is not duplicated |
| E1. A return never starts above the running state or dose last executed | QE-R7ADA-02, SSCTR F4-X | `historicalRun` generalized (r6-program). `stateAtBreak` passes it the record of the runs executed since the latest entry, and the releases the return's class undoes (r6-adaptation) |

## A5. The canonical factual state before every decision (QE-R7ADA-01)

**A5.1 Order (§6).** The order is:
1. raw evidence;
2. dedupe, corrections, retractions and conflicts (`normalizeObservations`, unchanged);
3. the canonical factual state (the PlanningView from the evidence reducer, unchanged);
4. when the review's evidence about an earlier week moved this week's PlanningView, the factual re-plan of the sessions still ahead (`viewMovedBy`, the trigger A3 already used);
5. the handler, whatever its kind, deciding on that program.

There is no reconciliation after the handler.

**A5.2 One place (§7).** `factualReplan` runs before the handler is chosen, so no handler carries its own patch.
- It is A3's rule: the same trigger (`viewMovedBy`) and the same re-plan of the sessions still ahead (`composeWeeks` from this week).
- It now applies before every handler. The weekly review keeps only its "the week continues as planned" answer while the week is under way.
- **The week is under way while any session is still ahead by the one C1 test:** a later date, or later today.
  - A3 tested only for a later date. So a correction on the week's last day, before that day's session, left that row planned from the retracted fact, through every review kind, the weekly review included. A self-challenge probe of this mission found it.
- The re-plan projects the weeks after this one from the same view and never closes the week. Only a review of the complete week applies its evidence, as before.

**A5.3 Composition with the handler.** The handler receives the re-planned program and the PlanningView read on it.

| What the handler returns | Result |
|---|---|
| Its own proposal (a reschedule, a reduction, a re-plan from next week, a move, a substitution, a return) | That proposal, which is built on the re-plan. Both decisions are recorded: REPLAN_FROM_EVIDENCE, then the handler's |
| KEEP | The re-plan is the proposal (REPLAN_FROM_EVIDENCE) |
| ASK or UNSUPPORTED | Still asked or refused, with the re-plan proposed: the facts it follows stand |
| CLINICAL_HUMAN_REQUIRED | No proposal (no dependent prescription) |

A proposal that contains the re-plan is validated from this week.

**A5.4 Confirmation semantics (§11).** The re-planned row is the reference a log is judged against (SSCTR D44):
- a log above it by more than the adoption rule allows is asked (`LOGGED_LOAD_ABOVE_PLAN`);
- an establishment log waits for confirmation (SSCTR D45).

Nothing is adopted to avoid a question. Example: after 24 → 20 kg, a logged 24 is asked and history keeps KNOWN 20 under every review kind; a logged 22 (one increment, target met) is adopted.

**Properties.**
- **P1, factual correction globality:** the same corrected evidence through every review kind gives the same rows ahead for the corrected exercise, the same question and the same HistoricalState.
- **P2, a retracted target cannot resurrect:**
  - no row still ahead prescribes the retracted load;
  - a removed exercise is established by effort again;
  - history moves only on a new execution the adoption rule accepts.

**A5-B1, declared boundary (not changed).** The trigger is `viewMovedBy`, for a week with a session still ahead (A5.2).
- A correction can arrive after the week's last session, with a review that does not close the week. Next week's rows then stay as projected until a closing review re-plans next week from the corrected evidence, as every closing review does.
- That is the standing projection between re-plans, R1. The Founder rules R1 `R1_R7A_BLOCKER = NO` and `R1_PRE_TESTFLIGHT_GATE = YES` (§3); it is not generalized here.
- NOT TESTED beyond this statement.

## E1. A return never starts above the running state or dose last executed (QE-R7ADA-02, SSCTR F4-X)

**E1.1 Released is not executed (§16).** The return reads `historicalRun`: HistoricalState's run at the interruption's point, with every release that no executed run has used undone.
- The approved policy (R6-NONCLINICAL-RETURN): "SHORT: resume the last executed doses; … the next step waits for executed sessions"; MODERATE: "conditional steps to the prior executed dose"; "historical maxima are ceilings, not current proof".
- No new rule is added.

**E1.2 The record read.** The runs executed completely (neither partial nor conflicted):
- since the state's latest entry: the report of the latest return in force at the interruption, else the intake. Runs before that report belong to the plan before its break (C5), and the return's entry already read them;
- and before this interruption began.

Each run carries its row's role, progression dimension and value, minutes and week.

**E1.3 Mode.** Some modes are released by the evidence: the walk/jog exit to continuous running, the restart's switch to easy running, a return's completion.
- Such a mode that no executed run has used yet is undone where the return's recipe reads the state last run. The state becomes the one that prescribed the last executed run (HistoricalState at the start of its week).
  - **SHORT** resumes the last executed doses, so every such release is undone.
  - **MODERATE and LONG** undo only the walk/jog exit: a walk/jog athlete's recipes are the ladder's own (one step back, step 0; SSCTR R46).
  - For a continuous runner, the moderate recipe re-enters from a current demonstration or the 15-minute entry, and the long one restarts. Both read the released easy state with its doses capped at the executed ones (E1.4), so a released step is never their target.
  - Undoing a return's completion or a restart's switch there would resume a return step or restart minutes after up to 28 days, without the entry. The moderate recipe keeps a RETURN or RESTART state as it is (R7ARA-SELF-01 below).
- The records the evidence accumulated are kept: `achieved`, `longestContinuous`, `longByWeek`, `modeHistory`, `resumed`.
- A run's mode is read from its progression dimension. Quality steps exist only in easy running. A walk, the race or an event-window run states no mode.

**E1.4 Doses within the mode.**

| Mode | Never above |
|---|---|
| Walk/jog | The step last run (W2, unchanged in effect) |
| Restart | The restart minutes last run |
| Return | The return step last run |
| Easy | The largest long run, and the largest easy run, executed and tolerated (no adverse or conflicting response) since the entry. The rotating extra step waits too, and an eased quality slot (D58) is no easy-run dose |

The two kinds of rule differ because the rows differ.
- On a ladder, a consolidation or HOLD week repeats the step, so the step last run is the step reached.
- Easy running is phase-modulated from an unchanged state: a consolidation or event week runs shorter rows. A planned reduction is no lower tolerance, so the dose reached is the largest one tolerated. The return week's own phase then reduces its rows again.
- A first cut capped easy running at the last run. In engineering Q06d k=8 it brought a moderate return back to 65 minutes, although the athlete ran 75 two weeks earlier and nothing above 75 was released: an under-dose. It was corrected before the freeze.

**E1.5 Nothing run since the entry.** Without a run of a dimension on the record since the entry, that dimension stands: the intake's reported state, or the return's entry.

**E1.6 Recipes unchanged.** The return recipes apply on that state:
- SHORT resumes it;
- MODERATE steps to it (`returnTo` is the executed dose); a walk/jog athlete steps back one step;
- LONG restarts: a walk/jog athlete at step 0, a runner with restart minutes.

**Coverage (§15).**
- Walk/jog to walk/jog, and walk/jog to continuous running (F4-X).
- Easy to easy, and the long run.
- Short and moderate returns.
- A repeated pause, including a pause inside or right after a return's steps, and after a restart's switch, short and moderate.

**R7ARA-SELF-01, found and corrected before the freeze.** The first complete evidence round ran on source digest `259ab3ef…`. Its record is [probes/SUPERSEDED_ROUND_R7ARA.json](probes/SUPERSEDED_ROUND_R7ARA.json); the round's outputs are not kept.
- How it was found: this mission's direction check of the named differences (`probes/direction-r7ara.mjs`) found a dose rise in the SSCTR kit's `changes` probe, case A_E6.
- The case: a moderate first break; return steps 0 and 1 executed; the evidence completes the return; then a 14-day break before any run of the completed state.
- The defect: that first cut undid the completion for every break class. The return resumed step 1 (30/30/45 min) instead of re-entering from the 15-minute entry (15/15/20) as the predecessor did. The same happened after a restart's switch: the restart minutes resumed.
- Why it mattered: it stayed under the ceiling, since 30/45 had been executed, but it broke the approved moderate recipe.
- The fix: the class rule of E1.3.
- Now: the moderate return re-enters at 15/15/20 and steps to the 30/45 executed since the first return's entry. The predecessor stepped to the first return's target, 40/70, released and never run since.
- Pinned by: the test `QE-R7ADA-02 repeated pause, moderate`, the self-challenge classes `E1.return-completion` and `E1.restart-switch` (now with a moderate second pause), and the freeze gates REPEATED_PAUSE_RECIPES and direction.

**Properties.**
- **P3, return factual ceiling:** a released or projected run state above the factual one is never the baseline.
- **P4, execution promotes:** once the athlete runs the next state or dose, that is what a later return reads.

**Declared, not changed:**

| Id | What | Why |
|---|---|---|
| E1-B1 | The quality ladder: threshold and specific steps, strides | Outside the bounded list (§15: not the whole running catalogue). D58 governs quality after a short break: the first quality slot runs easy, and the next quality session follows the evidence's step, as D58 was approved and stays VALID |
| E1-B2 | Walk days and frequency in RETURN weeks | NF-R7ADA-2, backlog (§21) |
| E1-B3 | The long-run offset that the restart's switch to easy running creates, once an easy run of the new mode was executed | Bounded by the policy's single-run ceiling, which applies explicitly to the RESTART→EASY transition (`restart.longRunCappedBySingleRunCeiling`): one step above the longest run executed. NOT TESTED under a pause |
| E1-B4 | OBS-2: a walk/jog step executed once with an adverse response, then a short break, resumes that step | W2's reading (any complete execution) is kept. It is consistent with HOLD and is the SSCTR's question |
| E1-B5 | `historicalStateOf().state.run` | It stays HistoricalState's run, the evidence's releases included. The ceiling applies where a return reads it (`stateAtBreak`). HistoricalState is not redesigned (§7) |

**Earlier tests re-expressed in place**, marked `Residual authority closure`. Their earlier bytes are in `decision-authority-freeze-source/`. In `test/r7ab-week-start-authority.test.mjs`:
- I5/P3, §13 premise and I6: a short trip after an executed MODERATE re-entry week now resumes return step 0, the step last run, not step 1.
- History still credits step 1, and the tests assert it.
