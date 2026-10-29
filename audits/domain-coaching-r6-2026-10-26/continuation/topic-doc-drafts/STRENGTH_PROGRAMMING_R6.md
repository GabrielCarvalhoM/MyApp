# Strength programming — R6

Strength sessions come from templates, filled with catalogue exercises the athlete can do with the equipment they have. Doses start from known current loads or from effort-guided establishment. They progress only on logged sets.

Scope: OFFLINE_SYNTHETIC_NODE24_REFERENCE; envelopes R6-LOAD-ESTABLISHMENT, R6-PLANNED-PROGRESSION and R6-ROTATION. Evidence: `STRENGTH_PROGRAMMING_R6.json`, including the SSCTR round-8 tests D48 and D49, the round-9 tests D51 and the round-10 tests D52.

**Status at R6 closure (2026-10-27).** This describes the R6 runtime after FREEZE-1, which is **not frozen**: the SSCTR refused FREEZE-2 in round 12, and under the Founder's bound R6 closes with an explicit blocker. The official evidence (the first evaluation, the simulations, the demonstrations and the R5 replay) stays bound to FREEZE-1. See `OPEN_GAPS_R6.md`. **Open for R7:** (1) **D53 on the from-log path.** The regain cap starts only when a known load is re-established, so after the re-establishment of an exercise whose establishment log is pending or unlogged, the block-boundary set can come back at once (2 → 4 sets). (2) **D54.** A re-establishment row ignores the taper, race-week and post-event doses.

## Templates and exercises

- **Templates.** One to four strength days map to full-body, lower/upper or lower/upper/full templates; a fifth day is trunk and calf work.
- **Slots.** Each slot names a movement pattern: squat, hinge, lunge, calf, push, pull or trunk. The exercise is the most familiar competent option the equipment allows. Running support prefers running-relevant accessories.
- **Fitting.** A session is fitted to the athlete's chosen time: accessories go before main lifts lose sets.

## Load modes

- **KNOWN**: a current, familiar dose the athlete reported: sets, reps, load and convention, and reserve. A reported dose above six sets is kept as history, and the plan starts at six.
- **ESTABLISH**: the load is unknown. It is chosen in the session by an ascending ramp, up to the heaviest load that keeps the target reserve with steady technique. At most two sets at RIR ≥ 3.
- **FROM_LOG**: use the logged load under the stated rule. A FROM_LOG row exists only for an exercise with a logged load, adopted or waiting for confirmation (SSCTR D52). When the logged load still waits for confirmation, the row carries no number and its instructions describe effort-guided selection only, as at establishment: ramp up in the smallest increments and stop at the reserve shown. It never points at the logged value (SSCTR D48). In a conditional projection, the weeks after the next review assume the planned logs.
- **BODYWEIGHT**: reps and reserve only.

Novices practise unloaded first. No kilogram is derived from sex, body mass, another exercise or another implement. An older or differently configured load is only a hint or a ceiling.

## Establishment follows executed work (SSCTR D52)

- **A prescription that was not executed establishes nothing.** An exercise gets its state only when a review sees it performed: in a completed or partial execution report that lists it with a set, or in a completed report without exercise details. A loaded exercise also needs a logged load, adopted or waiting for confirmation. A missed session, a session dated inside a declared pause, a pending session or a conflicted report performs nothing.
- **So the next exposure of a never-performed exercise is the establishment row again:** at most two sets at RIR ≥ 3, the ramp-up, no load and no progression rule. This covers a missed first session of a cold start, a newly rotated accessory and an unfamiliar substitute in an equipment window. It also covers, after a return, an exercise first prescribed in a session dated inside the pause. A bodyweight exercise starts again at its first-exposure dose, at most two sets.
- **Later sessions of the same week repeat the establishment.** An exercise first set up earlier in the week is not established for its later sessions, because no review has seen it performed. Two establishment logs of the same week that agree within one increment confirm each other (SSCTR D45). In a return-entry week such an exercise keeps the entry dose for the rest of the week.
- **No logged load, no FROM_LOG row.** An exposure performed without a usable logged load (no load, an unknown unit, an implausible value) leaves the next one chosen by effort again: an establishment row, with the earlier ceiling when there is one.
- **A conflicted report** neither sets nor confirms a load until it is corrected (QRE-R6-14; author-found with D52).
- **Reviews are weekly (the SSCTR's weekly-review contract).** These rules hold when every elapsed week receives a gating weekly review, in order and after its last session, with unreported sessions reviewed as missed. A week whose review is skipped keeps the projection's assumption that it was executed and logged. That path is outside the approval and is an owned gap (SSCTR R18).

## Units and logged loads (FREEZE-2)

- **Units.** Loads are kilograms inside the engine. A pound value, at intake or in a log, is converted to the nearest 0.5 kg and kept as reported. Any other unit, or a logged convention that differs from the planned one, leaves the load unknown: it is never adopted, and the athlete is asked.
- **Bounds.** A logged load becomes the reference only inside 0–500 kg, and at most one smallest increment above the load the plan stated (QRE-R6-02).
- **Above the plan (SSCTR D44).** A load above the stated one is adopted only when that exposure met the ADVANCE criterion: target reps met, minimum logged reserve at or above the prescription minus one, and no adverse response. Otherwise the planned load stays and the athlete is asked.
- **A first establishment log is not a number (SSCTR D45).** The next exposure stays FROM_LOG with no number, and the athlete is asked. The log becomes the reference only when one of these happens:
  - the athlete confirms it. The review field `loadConfirmations` carries the exercise, the value, the unit (kg or lb) and the planned convention;
  - a second log agrees within one increment. That log can come from a later exposure, or from the same exercise earlier in the same week;
  - it is within one increment of the athlete's own load hint, in the same convention.
- **Confirmations.** A confirmation replaces the logged value but never bypasses the other rules.
- **Ceilings.** A logged load is never adopted above a re-establishment ceiling, nor, during a return, above the load before the break. It is capped there, and the athlete is asked.
- **Questions.** Every load that is not adopted appears in `loadQuestions`, which follow the gates the decision applied. A known planned load replaced by a different executed load is a modification (`ADOPT_LOGGED_LOADS`).
- **Data's gap.** Numeric plausibility inside 0–500 kg belongs to Data and is an open gap, including a load logged far below the plan (SSCTR R5).

## Progression

- **Goal doses:**
  - strength: 5 reps, load progression;
  - hypertrophy: 8–12 reps, then load;
  - running support: 6–10 reps;
  - general: 8–12 reps;
  - maintain: hold.
- **What a step needs:** a logged set at the current load in the gating week, target reps met, and minimum logged reserve at or above the prescribed RIR minus one.
- **What holds:** missing logs or missing reserve hold the dose; they never regress it. A week with no executed session of an exercise holds it.
- **Regression:** two missed-rep or adverse exposures within 14 days regress one step. The next adverse response at the new dose holds (hysteresis).
- **EARNED:** reserve at or above the prescription plus two, twice, outside consolidation and near-event weeks. It releases a held load tick, never a second step.
- **Block boundaries:** one set is added per exercise, only when that exercise's final block exposures were executed, and never for a block in which the exercise had a return-entry or return-step exposure (SSCTR D49).
- **Event phases** keep strength at a reduced dose:
  - specific weeks: one set fewer, at RIR ≥ 3;
  - taper days: about half the sets;
  - race window: no strength in the last 3 days, and at most one short light session;
  - post-event: one light session.

## Rotation, resumption and return

- **Rotation.** Accessories rotate on the athlete's cadence (coach decides: 6 weeks). They never rotate in establishment, specific, taper, race or post-event weeks. Main lifts stay, and fixed never rotates. A new exercise starts with establishment and no transferred load.
- **Resumption.** An exercise not performed for more than 28 days restarts effort-guided, with its last load as a ceiling. Its earlier set count comes back one set per executed week, never at once (QRE-R6-17).
  - **The clock (SSCTR D52).** Calendar days from its last executed exposure, from the completed-work ledger, to the session date. A missed or skipped session never moves it, so it keeps growing through rotation away, a substitution window, skipped weeks and a return. A known dose from the intake counts from the day it was observed.
  - **Each session is judged on its own date.** The plan never counts unexecuted work in the same week. An exercise last performed early in a week can therefore re-establish at a later session of a week four weeks on, even after an earlier session that week at its known load.
  - **A missed re-establishment re-establishes nothing,** so the next exposure re-establishes again.
  - **The set count after a re-establishment (SSCTR D53).** The prescribed count, block-boundary set included, starts again from the re-establishment count (`regainCap`). It rises at most one set per executed week without a phase reduction, up to the count the exercise would otherwise have, and phase reductions apply on top. A block set earned before the gap, or by the re-establishment week itself, therefore returns one set at a time. A return clears the cap, and the return steps then govern. Whether a block whose only executed exposure was the re-establishment should earn a set is open (SSCTR R17).
  - **Bodyweight exercises** keep their dose after a long absence; how they resume is open (SSCTR R17).
- **Return after a moderate or long break (SSCTR D49):**
  - **The ceiling.** The ceiling is the last set count executed before the break, outside a return step and outside a phase reduction (`lastExecutedSets`). Without one it is the known count, and without that the normal count. A block bonus earned but never executed is not part of it.
  - **The entry week.** Every strength exposure is at the entry dose: 1 set at RIR ≥ 4. That includes a later exposure in the same week of an exercise first set up in it.
  - **Return step 2.** One set above the entry, and at least one below the ceiling: max(1, min(ceiling − 1, 2)) sets at RIR 3. It is never computed from the base count. An exercise first set up in the entry week follows these steps too.
  - **After the steps.** The count comes back at most one set per executed week without a phase reduction, up to the ceiling. A step 2 reduced by its phase is followed by the step-2 count itself. The count goes above the ceiling only through a development block completed with no return-step exposure of that exercise: each such block lifts the ceiling by one, still one set per executed week.
  - **Phase reductions** (consolidation, specific, taper, race week, post-event) apply on top, in the return steps too. So a return step in the race window is the light session: 1 set at RIR ≥ 4, main lifts only.
  - **Block credit.** Return-entry and return-step weeks never earn a block-boundary set, and the block in progress at the break earns none.
  - **The load cap.** During the steps a logged load is capped at the current return reference: the load before the break until an entry log is adopted, then the adopted entry load. The prior known load is prescribed only after a logged entry supports it.
  - **The end of the return (SSCTR D51).** The return ends with the exercises in use. An exercise not used during it, such as an accessory rotated out before the break, carries no return step once those exercises complete theirs. Rotation then resumes on its calendar cadence, and a rotated-back exercise not done for more than 28 days re-establishes by effort. Later new exercises start with normal establishment, not the return-entry dose.
  - **Exercises not performed during the return (SSCTR D52).** One never performed, including one first prescribed in a session dated inside the pause, is established by effort when it reappears. One last performed more than 28 days earlier is re-established by effort. Both count from executed exposures only.
  See `RETURN_ENGINE_R6.md`.

## Limits

- Reps in reserve are approximate, with about one rep of error; technique and comfort govern.
- The catalogue is small, bounded to common gym, dumbbell, kettlebell, band and bodyweight movements.
- Pound display and pound increments are a product decision (DR-114) and an open gap.
