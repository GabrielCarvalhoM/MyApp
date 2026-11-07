# SSCTR-R7D-P34-DECISION-r1: direction A, the re-entry week, F08 (R7-D Phase 3.4, Part 1)

**What this is:** the domain rule the implemented candidate will be rechecked against. [The JSON record](SSCTR_P34_DECISION_R7D.json) prevails over this summary.

**Overall: ACCEPT_WITH_CONDITIONS.** No blocker against direction A as a domain reading. Two pre-existing runtime defects are preconditions for the freeze (F01 and F02 below). F08 is **NEEDS_AUTHORITY**.

**Reviewer:** SSCTR-1.0.0, PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY (nonclinical only; no credentials; no human or empirical validation). Model claude-opus-5-5, effort xhigh.
- **Instance:** fresh and independent. It did not write the prototype, the request, the F08 proposal or the benchmark. It did not open `PCG_*` or any `phase34/reviews/`.
- **Native adapter dispatch:** not verified.

## Dispositions

| Q | Disposition | Ruling in one line |
|---|---|---|
| Q1 | ACCEPT_WITH_CONDITIONS | x read as its own return is correct under existing authority. Its point is **the day after x ended**, not the report that kept it and not the first executed session. |
| Q2 | ACCEPT_WITH_CONDITIONS | The trigger is "a plan week wholly between, re-entry-complete in ≥ 1 sport". **ANY is rejected** (X1). X2 stays on continuity as a disclosed, authority-limited residual. |
| Q3 | ACCEPT_WITH_CONDITIONS | **γ is accepted, M rejected.** A strength data gap or a missed lift holds only strength. No coupling except systemic, clinical and the shared class. |
| Q4 | ACCEPT_WITH_CONDITIONS | Required: gated runs, **RACE_TOUCH and RACE**, and every strength exercise logged with reps and RIR. Not required: optional WALK, RECOVERY_EASY, SHAKEOUT, strides. |
| Q5 | ACCEPT | A session on the later break's first day counts when it was executed before the stated start (EXP-1). |
| Q6 | ACCEPT | The reducer's adverse reading is the right input. An adverse run holds running; a systemic signal holds both. Clinical routing comes first. |
| Q7 | ACCEPT_WITH_CONDITIONS | The invariants hold, except two pre-existing defects (F01, F02). A named correction **must** re-read the separate breaks. |
| Q8 | NEEDS_AUTHORITY | Nothing is approved. The line between clinical and nonclinical is drawn below. F08 stays open. |

## Binding readings (short form; the full text is in the JSON, BR-Q1 to BR-Q6)

**BR-Q1: direction A.** For each earlier unapplied break x, in order:
1. **Full re-entry, unchanged.** A plan week wholly between x and the current stop S is re-entry-complete in every sport it plans. Then x is `TRAINING_AFTER`.
2. Otherwise, unreported sessions between them are asked first.
3. **OWN_RETURN.** Otherwise, if no applied return lies between them and some week is re-entry-complete in at least one sport, x is `OWN_RETURN`:
   - x's own stop is read recursively, and its class comes from x's own days;
   - its entry follows the unchanged R6 recipe from the state at x's start, with **no demonstration**;
   - its point is **the day after x's last day**, read by the reducer as a return in force there, with C5 applying to that week;
   - the later stop's class comes from **its own days**.
4. **Continuity, unchanged.** Otherwise the stop runs through x.
5. **Guard.** If an applied return lies between them, nothing is reconstructed.

The reconstruction is never recorded as a fact. The record shows `OWN_RETURN` and `ownReturn` {class, days, start, end, reentered per sport}.

**BR-Q3: per sport.** A sport with its own re-entry-complete week reads the executed history, as in full re-entry. The other sport reads x's return, then the reducer: a closed or complete week steps, anything else is a fact, adverse responses hold, executed doses cap. The combined load never exceeds the executed combination.

**BR-Q4: the re-entry week contract.** One contract serves full re-entry and the trigger. It binds the runtime, P18(a), PREREG and INTERFACE.

| Session | Re-entry |
|---|---|
| EASY, LONG, QUALITY, WALK_JOG (gated; the optional post-event walk/jog included, as gated) | required: executed as prescribed, gate ADVANCE or EARNED |
| RACE_TOUCH, RACE | **required** (a runtime change: today they are ungated). The race must be finished. Neither may have an adverse or conflicting response. |
| WALK (optional brisk), RECOVERY_EASY, SHAKEOUT, optional strides | not required: never block, never count. An adverse response on them counts only via the systemic rule. |
| Every strength exercise | required: gate ADVANCE or EARNED, and reps, RIR and a known-unit load logged. A gap holds **strength only**. |

A sport re-enters only through a week that holds at least one of its required sessions.

**BR-Q5: same day.** A session on S counts as before the stop only if S has a stated start time and the session's executed report is observed before it. Otherwise its week is not complete.

## Findings

- **SSCTR-P34-F01 (pre-existing, aggressive, safety-relevant).** When a return is re-planned from its own week, the single-run ceiling credits that week's elapsed unexecuted runs: unreported, not done, or inside the stop.
  - Single break on FREEZE-4: a Monday report gives 15/20/25. A Wednesday or Friday report gives 30/30/45, then THRESHOLD 34 and LONG 55.
  - Direction A reaches it on R1 (strength done, running lapsed about 45 days): LONG 60 by week 9, where FREEZE-4 gives a restart.
  - **Fix before freezing direction A.**
- **SSCTR-P34-F02 (pre-existing, F01 direction).** This is the coordinator's addendum fact 2. A named correction of the latest break drops the separate breaks its return read.
  - C1: MODERATE 21, then SHORT 5 with THRESHOLD 41 and LONG 70.
  - Ruling: re-read them by the same rules. This is existing authority and in scope of front A.
  - **Fix before freeze.**
- **SSCTR-P34-F03 (residual).** Two parts:
  - X2 (both sports partial in every week) restarts. This has no scientific justification, but a partial-adherence criterion would be a new threshold.
  - The trigger couples the sports: V2 gives running RETURN, while X2 gives RESTART on identical running.
  - **Holdout recommendation for the Founder:** a restart on X2's exact path is not a domain failure. A restart when some sport had a re-entry-complete week between is a failure.
- **SSCTR-P34-F04 (residual).** A sport with no training between, under the other sport's trigger, is read as missed sessions after x's return. This is the existing episode rule.
  - It is less conservative for running than physiology suggests (strength does not maintain running).
  - It is bounded by the ceiling only once F01 is fixed.
- **SSCTR-P34-F05.** The contract and the instrument disagree with BR-Q4. Today a race week with the race and the touch missed re-enters running on one 25-minute run. Align the runtime, P18(a), PREREG and INTERFACE, keeping the F01 detectors and adding:
  - an inverse-defect detector;
  - false-block controls.

**Observations O-01 to O-06:**
- Full re-entry after a low-load week resumes pre-break doses within the ceiling.
- A correction naming a consumed break is asked.
- The staleReturn fix is accepted, but genuine late evidence must still be asked.
- M's odd quality output on X8.
- The current review's eligibility is the only one used.
- On X5, strength starts the return at 82.5 kg, not the 85 kg executed.

## Q8: where the nonclinical line falls

**Clinical (CLINICAL_HUMAN_REQUIRED, G04):**
- whether the athlete may train, in which sport, with which restrictions, and for how long;
- what a qualified clearance is;
- the stop signs;
- whether the nonclinical recipe is adequate for this condition at all;
- cross-sport safety;
- any reading of a symptom, including whether an adverse response after clearance is a symptom.

**Nonclinical candidate (only after G04, PCG and Security):**
- dose mechanics inside the cleared scope, using only existing rules: start from current capacity; class by the clinical break's own days, never shortened; the demonstration as a dose input only; prior doses as a ceiling; progression gated by evidence;
- an uncleared sport stays held;
- restrictions as hard caps, applied only through G04's closed vocabulary, otherwise ASK.

**Sent back to assessment:** the existing clinical flags, reasons and mentions, and listed stop signs. Until G04 rules, an adverse response during this phase is asked and routed, never only held.

Runna's three return speeds are rejected as dose options. **Blocker:** G04 owner, the PCG/Founder authority form, and Security.

## Conditions (CF-P34-01 to 11, in brief)

- **01** Implement BR exactly; commit no switch.
- **02** Fix F02 before freeze.
- **03** Fix F01 before freeze; otherwise no freeze.
- **04** staleReturn fix with the I6 test.
- **05** One aligned contract and instrument, with the inverse-defect detector and false-block controls.
- **06** Directed tests.
- **07** Disclose F03, F04, O-01 and the guard; consumer copy per sport.
- **08** Fresh SSCTR recheck plus the QRE check.
- **09** No new number; V1 authority NO.
- **10** F08_OPEN; Security before any clearance input.
- **11** Queue item proposed only.

## Literature (direction only; abstracts via Europe PMC; no full text)

| Topic | Sources |
|---|---|
| Reduced training maintains | Hickson 1981; Spiering 2021; Mujika & Padilla 2000 I and II |
| Cessation detrains | Zheng 2022; Feely 2022 |
| A whole week shows tolerated dose, not restored capacity | Houston 1979 |
| Strength cessation and concurrent compatibility | Bosquet 2013; Schumann 2022 |
| Strength and injury prevention (counter-evidence, chronic) | Lauersen 2018 |
| Taper structure | Bosquet 2007 |
| Clinical return boundary | Bern 2016; IOC 2022 (abstract only); Rambaud 2018 |

WebSearch found no recent systematic review on resuming running after an interruption.

## Reproduce

Probes are in `ssctr-probes/` (`p34-ssctr.mjs`, `p34-ceiling.mjs`), with outputs in `ssctr-probes/out/`, labelled by runtime: R7D-FREEZE-4, γ, γ with race keys, γ same-day, and M.

Run on a scratch root:

```
node ssctr-probes/<probe>.mjs <root> --label <name>
```

Prototype variants are selected with the `P34_*` environment switches.

**Proposed queue item (not appended):** `HQ-R7D-SSCTR-P34-DECISION`. The queue was not touched (234 items).
