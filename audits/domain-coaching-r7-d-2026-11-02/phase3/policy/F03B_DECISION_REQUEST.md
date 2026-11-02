# R7-D Phase 3 — F03-B narrow policy decision request (machine-load progression)

**Requested by:** the Phase 3 coordinator (Engineering worker; not a judge).
**Deciders, per the Founder's Phase 3 authorization:** SSCTR (domain rule) and Product Constitution & Governance (authority form). Each decides within its own ownership, independently, on this packet.
**Scope:** one question only. Not a general policy review.

## The Founder's question (verbatim intent)

> How should a machine load progress when the physically executable increments depend on the machine/equipment itself and there is no reliable universal step?

The Founder's limits:
- **Do not:** hardcode +2.5 kg or +5 kg; assume every machine uses the same stack; generate an impossible weight; create false precision.
- **Allowed (not presumed):** an explicitly known equipment increment; the next executable load reported by the athlete or equipment; maintenance until an executable value is known; another solution the authorities already support.
- **Outcomes:** a narrow policy change is authorized only if needed and approved by the owners. If no authorized answer exists: `F03_POLICY_BLOCKED`, and Phase 3 stops before its freeze.

## What the runtime does today (R7C-FREEZE-4, PRE_EXISTING since R6)

Witness: `../probes/f03-machine-witness.mjs`; output: `../probes/out/f03-machine-witness.R7C-FREEZE-4.txt`. Athlete: four familiar machine lifts (leg press 140 kg, chest press 50, lat pulldown 55, cable row 50), all logged exactly as performed.

1. **The row's unit is wrong.** A machine row prescribes `load:{mode:'KNOWN', value:140, unit:'STACK_STEP', convention:'MACHINE_STACK'}`. The value is kilograms (the intake accepts only KG or LB, and the policy says "Loads are kilograms inside the engine"). `STACK_STEP` comes from the runtime's `INCREMENT_UNITS` map (`src/r6-prescription.mjs`), which names the unit of the *increment* per convention (TOTAL→KG, MACHINE_STACK→STACK_STEP, BAND_TENSION→LEVEL) but is written as the load's unit.
2. **Logged as prescribed, it is refused.** The log reader accepts only KG or LB. Every machine log reads `LOGGED_UNIT_OR_CONVENTION_UNKNOWN`, is asked about every week, and no machine dose ever moves (D08: 9 weeks, 5 questions a week).
3. **Logged in KG, it steps +1 kg.** The engine adds `operational.strength.smallestIncrement.MACHINE_STACK = 1` to the kilogram value: 140 → 141 → 142 kg, 50 → 51 → 52. No ordinary stack can set that. REGRESS subtracts the same 1 kg.

**F03-A (the unit) is a runtime correction the Founder already made mandatory.** The row will state KG (the unit of its value), so a log written as prescribed is read. That does not need this decision. **F03-B is the step:** once logs are read, what does the engine prescribe when the progression rule calls for a heavier machine load?

## The authorities in force (read them at the paths given)

| Authority | What it says that bears on F03-B |
|---|---|
| `CoachingCore/r6/PROGRAM_POLICY_R6.json`, `operational.strength` (sha256 `a75be1aa…e100`) | `loadUnits`: loads are kg inside the engine; any other unit leaves a load unknown, asked, never adopted. `smallestIncrement`: TOTAL 2.5, PER_HAND 2, **MACHINE_STACK 1**, BODYWEIGHT 0 (no unit stated). `loggedLoadAdoption`: a logged load becomes the reference only within 0–500 kg and **at most 1 smallest increment above the load the plan stated for that exposure**; above it only when the exposure met ADVANCE; an establishment log becomes a number only on confirmation, a second agreeing log, or agreement with the athlete's hint. `goalDoses`: HYPERTROPHY, RUNNING_SUPPORT and GENERAL progress `REPS_THEN_LOAD` inside a rep range (reps first, then a load step with reps back to the bottom); STRENGTH progresses `LOAD` (a load step every second advancing week); MAINTAIN holds. `repStep` 2. |
| R6 SSCTR policy records `audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json` (closed R6 evidence) | 10 boundary records, each bound to the canonical policy hash `18ec48f3…6b4c`. `src/r6-authority.mjs` enables a boundary only when a record matches the exact hash. **Any change to the policy file's values changes the hash: all 10 boundaries fail closed and every decision becomes UNSUPPORTED** until every record is re-issued for the new hash. That record file is closed R6 evidence and is never rewritten. |
| B0 catalog `CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json` (R7B0-CATALOG-2, sha `ceee276a…`), bound by hash in code with `audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json` | Convention `MACHINE_STACK`: "Stack or plate setting of one machine; never comparable across machines." Ten machine configurations (leg press, chest press, cable row, lat pulldown as MAIN or ACCESSORY; leg curl, leg extension, hip abduction, seated calf, cable pushdown, face pull as ACCESSORY). |
| SSCTR record B0-C04, condition 4 | "SINGLE_IMPLEMENT progresses by the per-implement step … **or by repetitions when that implement step is unavailable, never a fabricated load** (B0-F07 made explicit in R7-B)." |
| `CoachingCore/r7/b0/GAP_CLOSURE_B0.md`, B0-F07 | "Available implement steps (kettlebell jumps, fixed dumbbell sets) are not collected; the policy per-implement increment is the default and **reps progress when the next step is unavailable, never a fabricated load**." Owner: Product/Data (equipment detail) and R7-B. |
| Founder (Phase 3) | The limits above. No universal step, no impossible weight, no false precision. |

What the engine knows about a machine: the kg value the athlete reported or logged, its convention, the exercise. It does **not** know the machine's stack, plate size or add-ons. The intake and the R7-D author interface have no field for them.

## Options the coordinator can see (none is presumed; another one may be better)

**A. Hold until an executable value is known (repetitions only).**
- The engine never computes a machine load, up or down.
- Repetitions progress inside the goal range by `repStep`. At the top of the range the dose holds. REGRESS lowers repetitions (the existing path when a step is 0).
- In LOAD mode (STRENGTH goal) no load tick applies to a machine, so a machine dose holds there.
- A heavier logged machine load is asked about, not adopted (the adoption rule as it stands, read with the 1 kg increment).
- Cost: a machine lift plateaus at the top of its range, and a STRENGTH-goal machine MAIN never progresses. The athlete's real heavier setting is asked about each week.

**B. The athlete's next setting, from executed evidence.**
- The engine never computes a machine load.
- When the progression rule calls for a load step (top of the range in REPS_THEN_LOAD, a due tick in LOAD), the next exposure is a numberless row: move to the next setting of this machine (or its smallest add-on), restart at the bottom of the range with the reserve shown, log the load used.
- That logged setting becomes the known load only on executed evidence, read as the policy's increment of one machine setting ("1 STACK_STEP", the unit the runtime already names), not one kilogram. Executed evidence means the exposure met ADVANCE, and possibly also the confirmation or second-log rule used for establishment loads.
- If no heavier setting fits, the athlete logs the same load and the dose holds at the top of the range.
- REGRESS returns to the previous known setting, or lowers repetitions.
- **Open:** whether "at most 1 smallest increment above the plan" read as one machine setting is within the existing policy text, or is a change to it. The engine cannot verify in kilograms that a logged value is exactly one setting.

**C. An equipment-declared increment.**
- The athlete or equipment states the machine's step, for example at intake. The engine steps by it; without a declaration, A or B applies.
- Needs a new input field (the interface has none), runtime work, and an override of `smallestIncrement.MACHINE_STACK`. This is likely more than narrow.

**Not available:** a fixed kg step for all machines, which the Founder excluded. Also a change to `PROGRAM_POLICY_R6.json`'s values, unless every R6 boundary record is re-issued for a new hash. That is not narrow, and the existing records are closed evidence.

## Questions

**To the SSCTR (domain owner of the rule), within the provisional nonclinical authority:**
1. Which rule, A, B, C or another, is the smallest scientifically supported, executable and safe progression for machine loads? Give each option ACCEPT, ACCEPT_WITH_CONDITIONS or REJECT, with reasons and evidence status.
2. For your chosen rule:
   - REGRESS: what replaces the −1 kg?
   - LOAD mode: is a STRENGTH-goal machine MAIN covered?
   - Must a heavier logged setting be confirmed (as establishment loads are), or is the ADVANCE exposure enough?
   - What bounds, if any, apply to a logged step, and are they existing ones?
3. Does the rule add any new prescriptive authority (a new dose, threshold or number)? It must not.
4. Is a residual (for example the plateau in A) acceptable as a disclosed, non-blocking limitation for this shadow reference runtime?

**To Product Constitution & Governance (authority form):**
1. For each option: is it within the existing authorities as an interpretation or application (the policy text, the B0-C04 condition 4 and B0-F07 principle, the runtime's own `STACK_STEP` increment unit)? Or does it change policy in substance?
2. If it changes policy, what is the narrowest admissible form that does not rewrite closed records or break the R6 hash-bound boundaries? Is it admissible in this phase under the Founder's "narrow policy change only if needed and approved by the owners"?
3. What record must bind it so later missions read it as authority and not as a silent runtime choice? In R7-C, SSCTR semantic dispositions were bound by the freeze record.
4. If no form is admissible: say so (`F03_POLICY_BLOCKED`).

## Decision rule the coordinator will apply

- **Decision:** the option the SSCTR accepts and the PCG finds admissible, with the conditions of both.
- **If they diverge:** the narrowest option both accept.
- **If none:** `F03_POLICY_BLOCKED`. F03-A (the unit) is still implemented and tested, and Phase 3 stops before the freeze.

The coordinator implements nothing for F03-B before both records exist. Both records are bound by the new freeze record.
