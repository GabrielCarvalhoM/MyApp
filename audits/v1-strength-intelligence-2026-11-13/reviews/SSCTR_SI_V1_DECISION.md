# SSCTR decision: V1 Strength Intelligence Foundation, SQ-1 to SQ-4

**Records:** `SI-V1-SSCTR-SQ-1` to `SQ-4`, revision `SI-V1-SSCTR-r1`, 2026-11-13. The structured version is in `SSCTR_SI_V1_DECISION.json`.

**Reviewer:** SSCTR-1.0.0, constitution SSCTR-CONST-1.0.0, protocol SSCTR-EP-1.0.0.
- This is a subagent instance. The Chief launched it with the project SSCTR adapter text as its system prompt.
- The model is inherited (claude-opus-5-5). The instance did not verify the dispatch mechanism itself.
- The instance did not author the target. It is a software provisional reviewer with no human credentials. This record is not human, empirical or clinical validation.

**Target:** `STRENGTH_INTELLIGENCE_FOUNDATION.md`, sha256 `50e6a5ed49dab57e13ba2e6fe85a1c58ef89cde1eb0f3c6d2a3e47c8f5d08da9`. The relevant sections are 0, A.2, B.2, C.4–C.6, 5 and 8.

Related bytes read:
| File | sha256 |
|---|---|
| exemplar | `fdc7a055…6649` |
| probe | `fd6f2e78…7649` |
| sweep | `18371a6d…02ee` |
| catalog R7B0-CATALOG-2 | `ceee276a…92f9` |
| R6-POLICY-5 | `a75be1aa…e100` |
| `r7b-repertoire.mjs` | `8bdd5d5d…a483` |

**Evidence run (read-only):**
- `probe-strength.mjs --verbose`: 37/37.
- `sweep-planes.mjs`: completed. 116 of 120 profiles report a missing vertical plane. Vertical pull is never selected. The dumbbell-only and dumbbell-and-bench profiles admit no vertical-pull configuration at all.

**Literature access:**
- The first source was the project manifest r12, read through the B0 records: R6-S01, R6-S25, R6-S34, R6-S26/S27 and N-PELLAND.
- Europe PMC REST access was confirmed. Three directed queries were run:
  1. push-up vs bench press: 12 hits. Kikuchi 2017 (PMID 29541130) and Calatayud 2015 (PMID 24983847) were read at record or summary level, not full text.
  2. longitudinal vertical vs horizontal pull/press, narrow form: 0 hits.
  3. the same, broad form: 179 hits, none applicable on page 1. This null result is logged; it does not prove absence.
- No search was made for an isometric time dose, because option SQ-1(b) is not decided here.

| Question | Disposition | Evidence | Basis | Confidence | Review by |
|---|---|---|---|---|---|
| SQ-1 holds | APPROVE_WITH_CONDITIONS option (a); option (b) ABSTAIN | SUPPORTED_WITH_LIMITS | technical consensus (representation) | MODERATE | 2027-04-30 |
| SQ-2 upper loading under RUNNING_SUPPORT | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS | product heuristic with scientific support | MODERATE | 2027-04-30 |
| SQ-3 hypertrophy volume/claims | APPROVE_WITH_CONDITIONS (confirm) | SUPPORTED_WITH_LIMITS | scientific evidence for claim limits; product deferral to G02 | HIGH | 2027-04-30 |
| SQ-4 plane alternation | APPROVE_WITH_CONDITIONS (with a loading-class guard) | SUPPORTED_WITH_LIMITS (admissibility); benefit PLAUSIBLE_BUT_UNCERTAIN, not claimable | technical consensus + Founder product request | MODERATE | 2027-04-30 |

## SQ-1: Isometric holds

"1×12 reps @RIR3" for a plank is a representation defect, not a dose. A hold has no repetitions and no meaningful reps in reserve. Option (a) adds no dose. It keeps the trunk covered by configurations that are already approved (dead-bug, bird-dog, pallof-press). Option (b) would require a new dose number outside R6-POLICY-5 and the manifest, so this record abstains on it. Conditions:

1. `doseUnit: HOLD_SECONDS` applies to exactly front-plank **and side-plank**. The exemplar currently lists only front-plank.
2. No HOLD configuration may appear in any of these places: a slot, a rotation alternative, a substitution or fallback target, a goal-context alternative, a PRACTICE row, or a ladder offer.
   - The dead-bug → front-plank offer is suppressed.
   - Declared familiarity or a stated preference does not make a HOLD configuration selectable.
   - Test: the inverted probe plus the sweep show zero HOLD rows.
3. Every TRUNK slot is filled by another admissible TRUNK configuration, including in BODYWEIGHT_ONLY. Trunk work never leaves the week (B0-C05). A slot with no admissible configuration is declared under B0-C09.
4. No duration, seconds value, reps-to-seconds conversion or hold progression appears anywhere, including copy.
5. The loss of anti-lateral-flexion coverage is recorded as a known limitation. No copy claims that the remaining trunk work is equivalent.
6. Without the extension, behaviour is byte-identical to today (V-EXT-01). With it, only TRUNK accessory rows that held a HOLD configuration change, and no MAIN row changes.
7. In an existing program, a plank row is replaced from the next built week. The change is a recorded, disclosed accessory change.
8. Reversal to option (b) requires a separate SSCTR decision on a concrete time-dose proposal: duration range, per-side handling, stopping criterion, progression and phase reductions.

## SQ-2: Loaded upper body under RUNNING_SUPPORT

The upper body creates no run-axis cost (catalog `interferenceNotes`). Ranking the RUNNING_SUPPORT tag first therefore buys no compatibility. It does cost the ability to reach and progress the goal dose by load (R6-S01).

The counterevidence is that push-ups match bench press when load or effort is matched (Kikuchi 2017; Calatayud 2015). V1 cannot match it for stronger athletes, because added load on bodyweight exercises is LATER_GATE. Conditions:

1. **Scope.** The change applies only to UPPER-region slots where RUNNING_SUPPORT is a matching purpose: goal RUNNING_SUPPORT, or the EVENT context for accessory slots. Lower, calf and trunk running-support selection is unchanged.
2. **Order.** Only the relative order of two criteria changes: familiar → established → **external loading → purpose** → the rest, unchanged.
3. **Admissibility is unchanged.** NONE and NOVICE athletes get LOW-skill configurations only. HIGH bench-press, barbell-row and barbell-OHP require familiarity or a reached ladder step. Test: an unfamiliar athlete with a full gym never gets barbell-row or bench-press.
4. **Dose is unchanged.** The RUNNING_SUPPORT goal dose applies. A new loaded row starts with effort-guided establishment, and nothing is converted from push-up or band-row.
5. **No external option.** Where no external-load upper option exists, the selection is byte-identical to today.
6. **Existing programs.** MAIN changes only at a block boundary, with a recorded reason and the athlete's agency.
7. **Copy.** No claim that loaded upper work improves running or prevents injury.
8. **Joint test with N4.** A joint test covers the combined order from SQ4 condition 2.

## SQ-3: Hypertrophy volume and claims

R6-S01 links at least 10 sets per muscle per week to enhanced hypertrophy. That is a group-level finding from a mostly novice evidence base. The probe shows a 2×40 min athlete at 3 quadriceps sets and 6 pectoral sets per week. V1 therefore cannot claim volume-optimised hypertrophy. Fractional counting fits the evidence better than primary-only counting (N-PELLAND, abstract only), so the count must stay descriptive. Conditions:

1. N3 counts each working set once per primary muscle.
   - Secondary muscles are not counted, summed or shown as fractions.
   - A unilateral set counts once.
   - Warm-up, preparation and PRACTICE rows never count.
2. Planned and executed exposure are separate, labelled quantities. Executed counts come only from logged sets, with no imputation. The Data / G03 semantics are a dependency.
3. Nothing consumes the exposure: not dose, progression, time fit, selection, rotation, adaptation, readiness, notifications or recommendations (V-INT-01 spy test).
4. The display says "working sets where the muscle is a primary mover" and labels the number as descriptive. It shows no target line, range, colour, score or threshold comparison.
5. **V1 copy and claims MUST NOT:**
   - call the hypertrophy volume optimal, maximal, evidence-optimised or "science-based";
   - show "10 sets" or any sets-per-muscle target or range;
   - say "enough / not enough / below / above recommended";
   - call muscles under-trained, neglected or balanced;
   - predict or promise muscle growth, size change or rate;
   - claim per-muscle programming, targeting or specialization;
   - recommend more sets or sessions based on the exposure;
   - say that running does not affect hypertrophy, or that the plan neutralizes interference;
   - present a time-limited plan as equivalent to a higher-volume hypertrophy programme.
6. **V1 MAY say** that the plan follows a hypertrophy-oriented prescription within the chosen days and time: 8–12 reps, progression by reps then load, guided by reps in reserve. It may also say that weekly work per muscle depends on the days and time available. Product/UX owns the wording.
7. Any target, threshold, volume auto-increase, fractional count or specialization enters only through G02, with its own SSCTR review.

## SQ-4: Vertical/horizontal plane alternation

Every vertical configuration is already admitted. None carries lower-body demand. The dose is unchanged, and MAIN stays stable within the block. No outcome evidence shows that plane coverage matters: R6-S01 finds the data on varied selection insufficient, and the new search returned a null result. The approval therefore rests on admissibility, stability and the Founder's explicit request, not on a benefit. Conditions:

1. **Trigger.** The rule applies only with 2 or more same-pattern PUSH or PULL MAIN slots that admit both planes.
   - Slots are ordered by template order in the week, then slot index.
   - They alternate H, V, H. At most half prefer vertical, and a single slot keeps the horizontal default.
2. **Order in a vertical-preferring slot.**
   - First, the slot's own established configuration in the block.
   - Second, the vertical plane, subject to the loading guard in condition 3.
   - Third, the existing criteria, with N2 if it is active.
   - A configuration that is familiar or established in the *other* same-pattern slot must not defeat the plane preference.
   - Test: an INTERMEDIATE athlete with a full gym who is familiar with the bench gets bench-press in slot 1 and db-overhead-press in slot 2.
3. **Loading-class guard.** Vertical never downgrades a slot from EXTERNAL to BODYWEIGHT, ASSISTED or BAND. With dumbbells and bands, the slot keeps db-row rather than band-pulldown. When no option has external load, the preference applies.
4. **Admissibility is unchanged.**
   - NONE and NOVICE athletes have no admissible vertical push, so their push slots stay horizontal. They do get lat-pulldown or band-pulldown.
   - HIGH vertical configurations require familiarity or a reached ladder step.
   - PRACTICE rows are unchanged.
5. **Stability.** The configuration is fixed per slot for the block. Reason-based directives, set-asides and SKILL_MISMATCH take precedence. Existing programs adopt N4 at the next block boundary, with a recorded reason.
6. **Phases.** N4 never introduces a new exercise in TAPER, RACE_WEEK or POST_EVENT. Rotation deferral, dose, establishment and CMP placement are unchanged.
7. **Equipment gaps.** No new disclosure is needed where the equipment admits no vertical option. No copy may claim balanced or complete plane coverage where it was not achieved.
8. **Copy.** No claim that vertical work or alternation improves strength, hypertrophy, posture, shoulder health, injury risk or running. Permitted: "the week includes horizontal and vertical pushing and pulling when equipment and skill allow".
9. **Tests.**
   - V-EXT-05.
   - A sweep rerun with the extension shows:
     - vertical pull in profiles with MACHINES or BANDS and an equal-or-better-loaded vertical option;
     - vertical push in INTERMEDIATE or EXPERIENCED dumbbell profiles with 2 or more days;
     - dumbbell-only pull unchanged.
   - Block-level slot identity holds.
   - V-EXT-01.

## Governance, scope and what is still open

- **Gates and publication.** No gate is closed and nothing is published. These are decisions on a specification. The SSCTR review of the implemented candidate (Fable) is separate and still required.
- **Human revalidation.** Each record has prescriptive impact and needs a `QUEUED_FOR_FUNDED_HUMAN_REVALIDATION` entry: HQ-SI-V1-SSCTR-SQ-1 to SQ-4. This instance was not authorized to edit the human queue, so the entries are **proposed for the Chief to append**.
- **Escalation.** None was needed: no new dose number, clinical judgment or decisive new literature. SQ-1(b) would require escalation and is left open.
- **Validator.** `validate_records.py` was not run. Queue correspondence cannot pass until the Chief appends the entries.
- **Expiry triggers.** Each record expires on any byte change to its target sections, the catalog, R6-POLICY-5 or the extension file. It also expires on a relevant new systematic review or meta-analysis, a V1 scope change, an adverse event or runtime inconsistency, or funded human revalidation (no AI veto).
