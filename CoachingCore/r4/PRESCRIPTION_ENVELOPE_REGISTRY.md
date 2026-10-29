# Prescription envelopes R4

Nine reusable candidate envelopes; current scientific activation is in the independent SSCTR record, not the candidate status label. Numeric values are reviewable operational choices inside bounded contexts. No universal physiological dose law or ten-percent progression rule.

## R4-ESTABLISHMENT

Purpose: Productive first familiarization without perfect product history. Population: Explicitly eligible nonclinical adult recreational novice/intermediate hybrid athlete within V1; no clinical clearance or elite, pregnancy/postpartum, frailty-specific extrapolation.

Essential stimulus: Comfortable aerobic participation and controlled practice of demonstrated movement patterns.

- Structures: Walk/jog entry using walk exposure and conversational effort; walking is a valid alternative when running not yet tolerated; Unloaded demonstrated sit-to-stand/supported movement practice; do not assign an unknown external load; Initial week must specify every proposed task and fit all chosen windows; no full-week success for a partial subtask.
- Dose/transform bounds: {"entryTotalMinutes":20,"entryJogRepetitions":3,"entryJogSeconds":30,"entryWalkRecoveryMinutes":2,"entryStrengthSets":1,"entryStrengthReps":5,"minimumRir":3}.
- Progression: After observed compatible execution/effort/next-day function, consider one smallest meaningful dimension.
- Regression: Walk rather than jog; fewer practice repetitions; stop on abnormal response.
- Substitution: Only available competent movement patterns; unfamiliar loaded task requires establishment.
- Schedule: Respect actual minutes, days, equipment and priority; never silently replace existing essential run work.
- Other modality: Retain familiar primary work; new secondary skill practice carries low demand.
- Required input, evidence, uncertainty and exit triggers: see exact JSON envelope.

## R4-FAMILIAR-RUN

Purpose: Reuse/compose personally calibrated run work and earn one-dimensional progression. Population: Explicitly eligible nonclinical adult recreational novice/intermediate hybrid athlete within V1; no clinical clearance or elite, pregnancy/postpartum, frailty-specific extrapolation.

Essential stimulus: Requested easy, steady, long or controlled cruise stimulus using personal effort/exposure.

- Structures: Familiar easy/steady full session with pace subordinate to current effort; Cruise repetitions at familiar controlled-hard cue with easy self-paced preparation/cooldown; Relaxed familiar strides only with independently approved session completion; never all-out extrapolation.
- Dose/transform bounds: {"preparationMinutes":10,"cooldownMinutes":5,"requirePreviouslyToleratedProgression":true}.
- Progression: Choose a supplied previously tolerated next dose when comparable responses and future week support it; Keep intensity stable while changing duration/reps; no universal ten-percent rule.
- Regression: Retain prior dose; reduce work when effort diverges; terminate hard work if response incompatible.
- Substitution: Walking/easy exit for incompatible response, not a falsely equivalent threshold dose.
- Schedule: Duration includes preparation/recovery/cooldown; protect future essential work and available window.
- Other modality: No simultaneous unreviewed strength escalation; key stimulus and priority used before progression.
- Required input, evidence, uncertainty and exit triggers: see exact JSON envelope.

## R4-STRENGTH-ADAPTATION

Purpose: Progress or regress a familiar task from actual comparable execution. Population: Explicitly eligible nonclinical adult recreational novice/intermediate hybrid athlete within V1; no clinical clearance or elite, pregnancy/postpartum, frailty-specific extrapolation.

Essential stimulus: Maintain target movement/role and appropriate effort with smallest sufficient change.

- Structures: Same movement/equipment/range/role; keep rest and sets stable when changing repetitions/load; Select only complete supplied familiar candidate or smallest actually available supported increment.
- Dose/transform bounds: {"oneDimensionOnly":true,"requireComparableResponse":true}.
- Progression: Repeated comparable easier-than-target execution plus compatible recovery permits a small single-dimension progression.
- Regression: Repeated incompatible effort or rep loss favors supplied lower familiar load; One noisy isolated bad session normally KEEP unless material current response requires action.
- Substitution: No barbell-to-dumbbell kilogram equivalence.
- Schedule: Account for next important run, local demand and current block; do not worsen secondary cost unnecessarily.
- Other modality: Priority chooses among admissible options; priority alone never establishes need to change.
- Required input, evidence, uncertainty and exit triggers: see exact JSON envelope.

## R4-LOCAL-FATIGUE

Purpose: Remove unnecessary local demand while preserving essential training. Population: Explicitly eligible nonclinical adult recreational novice/intermediate hybrid athlete within V1; no clinical clearance or elite, pregnancy/postpartum, frailty-specific extrapolation.

Essential stimulus: Preserve compatible essential work; reduce optional local work only.

- Structures: Omit unperformed optional accessory when local concern and explicit current evidence show core work remains compatible.
- Dose/transform bounds: {"optionalOnly":true}.
- Progression: No progression from optional omission.
- Regression: If essential work is also affected, reassess beyond this envelope.
- Substitution: Optional omission is not an equivalent replacement for essential work.
- Schedule: Modify remaining work only; completed work retained.
- Other modality: Protect imminent goal-critical stimulus; no broad cancellation from muscle overlap alone.
- Required input, evidence, uncertainty and exit triggers: see exact JSON envelope.

## R4-SYSTEMIC-SUFFIX

Purpose: Respond to converging systemic signals and impaired current work. Population: Explicitly eligible nonclinical adult recreational novice/intermediate hybrid athlete within V1; no clinical clearance or elite, pregnancy/postpartum, frailty-specific extrapolation.

Essential stimulus: Protect future development and recovery rather than completion at any cost.

- Structures: After converging poor recovery and early-ended hard repetition, remove remaining hard suffix; Offer brief easy exit only if current easy effort remains comfortable; stopping is always allowed.
- Dose/transform bounds: {"noFurtherHardWorkAfterEarlyTermination":true,"easyExitMinutes":5}.
- Progression: No same-session escalation after material mismatch.
- Regression: End remaining hard work; no invented extra partial hard repetition.
- Substitution: Optional easy exit is not counted as equivalent cruise work.
- Schedule: Completed actual work immutable; no retrospective editing or moving completed dose.
- Other modality: Prioritize next key stimulus and avoid unearned recovery cost.
- Required input, evidence, uncertainty and exit triggers: see exact JSON envelope.

## R4-SCHEDULE

Purpose: Resolve actual conflicts among familiar same-dose arrangements. Population: Explicitly eligible nonclinical adult recreational novice/intermediate hybrid athlete within V1; no clinical clearance or elite, pregnancy/postpartum, frailty-specific extrapolation.

Essential stimulus: Preserve both essential intents with feasible placement and least disruption.

- Structures: Move only one familiar session into actual available window; retain dose and local clock constraints; Among feasible options prefer protecting primary/key placement, then response evidence, then smaller change.
- Dose/transform bounds: {"sameDoseOnly":true,"preserveKeyPlacement":true}.
- Progression: No progression as a side effect of moving.
- Regression: If no arrangement preserves essentials, request the missing horizon/agency or expose compromise.
- Substitution: No stacking or merging missed load by default.
- Schedule: Check duration/window fit and overlap in local time; no invented timezone or universal spacing hours.
- Other modality: Run-first protects key run when alternatives otherwise comparable; Strength-first protects key strength; Balanced uses essential role and comparable response.
- Required input, evidence, uncertainty and exit triggers: see exact JSON envelope.

## R4-OBSERVATIONAL-RANKING

Purpose: Use comparable athlete observations to rank existing admissible schedules. Population: Explicitly eligible nonclinical adult recreational novice/intermediate hybrid athlete within V1; no clinical clearance or elite, pregnancy/postpartum, frailty-specific extrapolation.

Essential stimulus: Same-dose familiar work with lower observed cost for the athlete goal.

- Structures: Rank existing independently bounded options only; Associations can change preference but cannot establish causality/new contraindication.
- Dose/transform bounds: {"sameDoseOnly":true,"causalClaims":false}.
- Progression: Repeated consistent comparable observations strengthen a soft preference; no universal sample-count threshold.
- Regression: Contradictory/new-context observations weaken preference and restore prior/KEEP.
- Substitution: Cannot invent dose, novel option or causal fatigue rule.
- Schedule: Require actual scheduling admissibility separately; symbolic arrangement alone may still leave feasibility unknown.
- Other modality: Prefer a configuration associated with compatible goal-critical work when comparison is sufficiently comparable.
- Required input, evidence, uncertainty and exit triggers: see exact JSON envelope.

## R4-RETURN

Purpose: Re-establish nonclinical participation after known logistics interruption. Population: Explicitly eligible nonclinical adult recreational novice/intermediate hybrid athlete within V1; no clinical clearance or elite, pregnancy/postpartum, frailty-specific extrapolation.

Essential stimulus: Low-demand effort-governed entry with response review, not restored former capacity.

- Structures: Known nonclinical interruption/exposure and ordinary function plus no clinical flags permit a reversible easy entry; Strength entry uses an explicitly familiar low-demand configuration; never former load by elapsed days; Return week is staged: first entry and conditional later tasks, not automatic old-week restoration.
- Dose/transform bounds: {"entryRunMinutes":15,"entryStrengthSets":1,"minimumRir":4,"restorationAutomatic":false,"allowCurrentDemonstrationReuse":true}.
- Progression: Only after actual execution/effort/function; historical dose is a prior, not current proof.
- Regression: Walk/stop if effort mismatches; fewer familiar sets; do not resume former hard work after early-ended entry.
- Substitution: No injury/illness rehabilitation or clearance.
- Schedule: Fit available time; future choices conditional on same/next-day observation.
- Other modality: Maintain goal continuity with reduced demand, preserving uncertainty across modalities.
- Required input, evidence, uncertainty and exit triggers: see exact JSON envelope.

## R4-SUBSTITUTION

Purpose: Preserve task intent with a known complete alternative. Population: Explicitly eligible nonclinical adult recreational novice/intermediate hybrid athlete within V1; no clinical clearance or elite, pregnancy/postpartum, frailty-specific extrapolation.

Essential stimulus: Comparable movement goal with appropriate competence and equipment.

- Structures: Use separately familiar complete alternative with own load basis, sets,reps,effort and rest; If unknown, ask only essential competence/configuration facts or offer an approved establishment path.
- Dose/transform bounds: {"requireFamiliarCompleteAlternative":true}.
- Progression: Do not progress while changing equipment/task.
- Regression: Reduce demand or wait for equipment when alternative competence missing.
- Substitution: Never infer per-hand load from total barbell kilograms.
- Schedule: Respect actual session window and remaining work.
- Other modality: Choose option preserving primary stimulus with least novelty and local cost.
- Required input, evidence, uncertainty and exit triggers: see exact JSON envelope.

## Current external scientific authority

Candidate/offline status is separate from reviewed scientific admissibility. Nine current conditional internal approvals are recorded in ../../audits/domain-closure-r4-2026-10-25/reviews/ssctr-envelope-review.json (path relative to project root: audits/domain-closure-r4-2026-10-25/reviews/ssctr-envelope-review.json). Each canonical envelope hash must match. Evidence snapshot, claim map and search log are under that audit evidence/ directory. Concrete output instances require traceable envelope binding, not a separate paper or queue item.

| Envelope | Review | Sources |
|---|---|---|
| R4-ESTABLISHMENT | R4-SSCTR-ESTABLISHMENT | R4-S01, R4-S08, R4-S09 |
| R4-FAMILIAR-RUN | R4-SSCTR-FAMILIAR-RUN | R4-S04, R4-S08, R4-S09 |
| R4-STRENGTH-ADAPTATION | R4-SSCTR-STRENGTH-ADAPTATION | R4-S01, R4-S05, R4-S06 |
| R4-LOCAL-FATIGUE | R4-SSCTR-LOCAL-FATIGUE | R4-S01, R4-S02, R4-S06 |
| R4-SYSTEMIC-SUFFIX | R4-SSCTR-SYSTEMIC-SUFFIX | R4-S06, R4-S04, R4-S05 |
| R4-SCHEDULE | R4-SSCTR-SCHEDULE | R4-S02, R4-S03, R4-S01 |
| R4-OBSERVATIONAL-RANKING | R4-SSCTR-OBSERVATIONAL-RANKING | R4-S05, R4-S06, R4-S02 |
| R4-RETURN | R4-SSCTR-RETURN | R4-S01, R4-S08, R4-S06 |
| R4-SUBSTITUTION | R4-SSCTR-SUBSTITUTION | R4-S01, R4-S05 |

Strength preparation/rest/time-per-repetition scheduling reservations are explicit operational estimates reviewed in the implementation binding. They do not force cadence or represent universal physiological safety thresholds. Actual technique/effort and elapsed-time cap govern; tight uncertainty can require a targeted question.
