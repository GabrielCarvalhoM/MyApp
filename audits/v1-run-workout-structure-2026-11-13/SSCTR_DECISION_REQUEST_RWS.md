# SSCTR decision request — Run Workout Structure (RWS), 2026-11-13

Requester: Chief (author of the handoff). The proposals below are the author's; they are not decisions. The SSCTR decides each item under its constitution, with sources, conditions and confidence, or abstains. No number in this request is a recommendation unless marked "author proposal"; where the author has no supported number it says so.

Context: `HANDOFF_RUN_WORKOUT_STRUCTURE.md` (this folder), sections 1–6. The canonical dose stays in minutes (frozen engine); distance is a re-expression of each time-defined work repetition, computed from the week's pace band of the repetition's effort domain (V1RC, `SSCTR-V1RC-DECISION-r1` Q4/Q8/Q9). Bands are today guidance bound to effort (`effortGoverns: true`).

| Q | Question | Author proposal |
|---|---|---|
| RWS-Q1 | May a time-defined work repetition of THRESHOLD, FIVE_K_SPECIFIC, TEN_K_SPECIFIC, HALF_MARATHON_SPECIFIC, MARATHON_SPECIFIC and RACE_TOUCH be offered as an equivalent distance computed from the week's band of its domain, with effort still governing (end the hard part early if effort exceeds the cue)? Does using the band to define a distance exceed what V1RC Q4 approved the band for? | Yes, as an equivalent of the same time dose, never a separate dose. |
| RWS-Q2 | Which band edge converts minutes to metres, the rounding unit and direction, and the largest shortfall versus the time dose below which the session stays in time. | Slow edge (the distance never takes longer than the time dose at the slowest in-band pace), round down to a fixed unit. Unit and tolerance: no supported author number; SSCTR to set or abstain. |
| RWS-Q3 | Minimum repetition distance when measured by GPS (short-repetition distance error), and whether a TRACK / measured course allows shorter repetitions. | No supported author number. If the SSCTR abstains, the author proposes distance only for repetitions whose time dose is ≥ the V1RC Q8 bout (5 min), which excludes the short 5K/10K repetitions. |
| RWS-Q4 | Recoveries between repetitions stay in time (walk or easy jog), never a distance. | Yes. |
| RWS-Q5 | Warm-up and cool-down stay in time; strides stay in seconds, optional, by feel. | Yes. |
| RWS-Q6 | EASY, LONG, RECOVERY_EASY, SHAKEOUT (including the marathon long run) get no distance target in V1: time governs; an approximate km range is informational only. | Yes (easy bands are ceilings; a distance target lengthens the session for a slower athlete and rewards speed). |
| RWS-Q7 | Cases with no distance (time only): band unavailable; first exposure to a ladder (`firstExposure`); WALK_JOG / RESTART / RETURN modes; hold, clinical route, warning-sign screen required; harder session after a field test in the same week (V1RC R-12); completion race day; FAMILIAR_REPEATED_BOUTS; race day itself. Add or remove? | As listed. |
| RWS-Q8 | The distance of the same time dose follows the band at each week boundary (up to V1RC's +4.5% recalibration plus rounding). Is that acceptable as not being a progression step (dose key unchanged)? | Yes. |
| RWS-Q9 | V1 needs no new session family; VO2 de novo, hills, fartlek, progression runs and long run with marathon-effort finish stay out. | Yes. |
| RWS-Q10 | (Optional, may be deferred) A familiar quality task reported by distance with the athlete's own stated pace may be normalized to minutes (distance × stated pace) for B0-C02 intake. | Defer to a later mission unless the SSCTR sees it as trivially safe. |
| RWS-Q11 | Planned weekly km is informational only and never feeds a gate, cap, progression or taper. | Yes. |

Requested output: `ssctr/SSCTR_RWS_DECISION.md` (+ `.json` with `values` the runtime needs and `workedExamples` with input band, time dose and expected metres), each item APPROVE / APPROVE_WITH_CONDITIONS / REJECT / ABSTAIN / EVIDENCE_REQUIRED, with sources and applicability limits.
