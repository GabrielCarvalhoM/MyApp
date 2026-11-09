# V1 Coaching Productization: design proposal for the independent decisions (V1CP-DESIGN-r1)

**Mission:** `V1_COACHING_PRODUCTIZATION` (Founder request of 2026-11-08), independent of the closed DOMAIN_COACHING_R7-D. Branch `claude/v1-coaching-productization` from `32b5ce3`; R7D-FREEZE-6 (record `48536551…e9a5`, bytes of `d569ef2`) is the untouched reference. Read-only `verify-r7d-6`: 20/21, only `no-new-holdout` failing by design.

**Status of this document:** Chief/Orchestrator proposal. It decides nothing. Each section names the owner that decides it. The runtime changes it proposes are implemented only as the owners rule; items they reject stay PENDING.

**Envelope rule for everything below:** no new dose, threshold, count, length, increment, cadence or percentage unless an owner explicitly approves it here as a new parameter (marked **NEW PARAMETER**). Every new behaviour passes through the unchanged R6 policy (`CoachingCore/r6/PROGRAM_POLICY_R6.json`, hash-bound by `r6Authority`), the B0 catalog, the gates (`weeklyGates`, `src/r6-adaptation.mjs:210`), the caps (single-run ceiling, long-run share, availability), the return recipes and the clinical screen. New parameters live in a separate file with its own decision record, never in the R6 policy (changing that file's hash would fail closed).

---

## Block 1: residual defects and the experience/records audit

### A1. Free-text reason screen (QRE-P5H-F01, SSCTR-P5H-O01; H07, H20, H32, H34)

**Reproduced.**
- `screenInterruptionReason` (`src/r6-clinical.mjs:147`) returns ASK `AMBIGUOUS_REASON` for any body-part word, even with a structured nonclinical category. Examples: "back" in "back from the trip" and "feet" in "on my feet all day".
- The three ASK sites (`src/r6-adaptation.mjs` in `recordedStop`, `separateStop` and `returnAfterPause`) all ask `missingInputs:['interruption.reasonCategory']`. That is a field the athlete already gave. The text also says "confirm it involved no pain, injury or illness", but no field can carry that confirmation. The only way out is to resend the break with different text: a question that never leads to its own exit.
- A clinical word about another person is read as the athlete's clinical mention ("cuidando da minha mãe depois da operação" → CLINICAL; H07). Under R-F08-1 that false positive is then permanent for the episode.

**Proposal (screen semantics; SSCTR decides).**
- **(a) Ask only what is missing.**
  - No category: ask `interruption.reasonCategory`.
  - A structured nonclinical category, but free text that is ambiguous or mentions someone else: ask one yes/no confirmation, `interruption.clinicalReason` ("Did this break involve your own pain, injury, illness or a medical reason?").
  - An explicit `clinicalReason` that means no (`isNo`), together with a structured nonclinical category, resolves an ambiguity to NONCLINICAL.
  - That answer never overrides a clinical category, a clinical flag, a current eligibility flag or a clinical mention the screen attributes to the athlete. `clinicalReason` yes stays CLINICAL.
- **(b) Who has the problem.**
  - Some clauses name another person with a possessive or article: a family member, partner, child, friend or pet ("my mother", "minha mãe", "mi hijo", "da minha mãe"). If such a clause holds no first-person marker, its clinical words, phrases and damage mentions are read as **about someone else**. First-person markers are: I, me, myself, eu, yo, a first-person clinical verb, or "my/meu/minha/mi" with a body part.
  - A mention about someone else is an ambiguity (asked once, as in (a)), never the athlete's clinical mention.
  - A clause that mixes both ("my son had the flu and I caught it") stays clinical.
- **(c) Body words that are not about the body.**
  - "back" used as an adverb ("back from", "came/got/went/flew/drove back", "back home", "back to", "be back") is not a body mention.
  - The idiom "on my/our/his/her feet" is not a body mention either.
  - "baby" stays ambiguous: postpartum is a clinical category for the person who gave birth. It is asked once, as in (a).
- **(d) Unchanged:**
  - clinical categories and flags;
  - self-attributed clinical mentions;
  - denials and conditions (D40, D41);
  - damage plus body part (QRE-R6-07);
  - R-F08-1 (an episode with any report screened CLINICAL stays a clinical-cause episode);
  - clinical-first precedence;
  - `operational.return.reasonScreen` ("free text alone never confirms a nonclinical break"). The confirmation is a structured answer, not free text.

### A2. Last-week HOLD from an internal TypeError (QRE-P5H-F04, K-QRE-P5H-06; H05 s4)

**Reproduced.**
- A `SCHEDULE_CHANGE` with no `from`, sent in the last week (week 3 of 4), returns HOLD "Malformed review facts: Cannot read properties of undefined (reading 'sessions')".
- **Cause:** `scheduleChange` (`src/r6-adaptation.mjs:1117`) sets `start = w+1`, which is one past the horizon in the last week. It guards only `start<0`, so `rebuild` reads `weeks[4]`.

**Explicit rule (Engineering, inside existing semantics).**
- A change with no week left in the program is KEEP, with the reason the handler already uses for a change dated after the program ("the current weeks keep their days and shifts").
- It adds that a session this week can be moved by reporting its day unavailable (`UNAVAILABLE_DAY`).
- A regression test runs every review kind in the last week and requires that none reaches the error path.

### A3. Strength re-entry through a week that plans no strength (SSCTR-P5H-O02, BR-Q4.4; H28)

**Reproduced (H28 s4).**
- The race week (01-06 to 01-12) plans runs only: touch, shakeout and race.
- `reentryBetween` (`src/r6-adaptation.mjs:1754`) gives `full` = the race week, because the week is complete "in every sport it plans". `stopOf` reads it as TRAINING_AFTER for the whole athlete.
- The return therefore reads only the 4-day inventory break (SHORT) for both sports, although no strength was trained from 12-28 to 01-20 (about 22 days).
- `reentryBetween` already computes `sport.STRENGTH = null`.

**Smallest adjustment coherent with the existing rules (SSCTR decides; option B keeps the disclosed residual).**
- The existing continuity rule already says the stop runs back through an earlier break when nothing was trained between them "or none planned" (`separateStop` comment).
- **Option A** applies that rule per sport. For a sport that no week between the two breaks plans (no live session of it there), the stop runs through the earlier break.
- That sport's return class comes from its own stop length, under the existing classes (`shortMaxDays` 10, `moderateMaxDays` 28) and recipes (`strengthEntryWeek`, D49). The other sport keeps today's reading.
- In H28, strength's stop is 2026-12-30 to 2027-01-16 (18 days, MODERATE: entry 1 set at RIR ≥ 4, then D49). Running's stop is 4 days (SHORT).
- No new dose and no new number.

### E. Experience and records: data-path audit (Founder synthetic athlete)

**The athlete, built only from the stated facts:**
- 30 years old, M, 170 cm, 70 kg;
- 10 months of running and strength;
- runs Tue/Thu/Sat and strength Mon/Wed/Fri, in the evening (PM);
- PERFORMANCE and HYPERTROPHY goals;
- 45 and 60 minutes;
- long run on Saturday;
- 5 km in 30:36 and 10 km in 1:18:00;
- squat 20 kg and bench 15 kg in the convention "plates";
- screening clear; plan starts Monday.

**Result on the R7-D runtime:**
- Experience goes in as nothing, because the intake has no months field. It becomes NOVICE (`r6-intake.mjs` EXPERIENCE map; default 'NOVICE').
- **Running: `WALK_JOG`**, 3 × 30 s jog in 20 min, by the rule "NOVICE with weekly minutes unknown" (`assessCapability`, `src/r6-program.mjs:32`).
- Strength: bodyweight only. Equipment was not stated, so it defaults to BODYWEIGHT, and the known back-squat and bench-press need BARBELL+RACK(+BENCH).
- The two loads are dropped silently: `PLATES` is not a load convention (`LOAD_CONVENTIONS`).
- **The race records (`performanceAnchors`) are cloned into the canonical intake and read by nothing.** Nothing reads `recentStrength.daysPerWeek` either.
- Age, height, weight and sex: age is used for eligibility; the others are never used for a dose, by design (`profileContextUsedForDose:false`, R6-LOAD-ESTABLISHMENT).

**Sensitivity runs (not regression cases; labelled assumptions):**
- With INTERMEDIATE declared, running becomes `EASY_UNKNOWN`: easy entry at 20 min (`unknownExposureEasyMinutes`).
- With gym equipment and a TOTAL convention, back-squat and bench-press are planned, established by effort, with the reported load shown as "a starting hint only".

**Proposals:**
- **E1 (SSCTR decides the mapping).**
  - The intake accepts, per sport, `trainingMonths` (months of regular training) when the category is absent.
  - Proposed mapping, both sports: 0 → NONE; 1–5 → NOVICE; 6–23 → INTERMEDIATE; ≥24 → EXPERIENCED.
  - Basis for strength: ACSM 2009 progression models (novice ≈ untrained or no recent RT; intermediate ≈ 6 months of consistent RT; advanced = years). Running has no equivalent standard: the SSCTR decides whether the same bands hold or which apply.
  - An explicit category always wins.
  - The derived category never sets current capacity: weekly minutes, longest run and loads stay their own facts, and unknown stays unknown.
  - A long stop is still the existing pause fact (RESTART).
- **E2 (SSCTR decides).**
  - A race result with distance, time and date, current under the intake's existing 28-day window (`currentFamiliar`), counts as one completed continuous run of its duration. When `recent.longestRunMinutes` is not reported, it is the lower bound of that fact (classification, first-week long run).
  - It is never a pace, effort zone, intensity, weekly volume or prediction.
  - An older or undated result is history (personal record) only.
  - The alternative is that records are history only, with no engine use.
- **E3 (Engineering, no dose effect).** Two new uncertainty items instead of silence:
  - a known exercise that the declared equipment cannot program;
  - a load in an unsupported convention (e.g. `PLATES`).
  - `PLATES` itself is an interface decision (Product + SSCTR) and stays PENDING. Prescribing in plates-only numbers would be comparable for the same bar, but it is not decided here.

---

## Block 2: F08 (Founder D2, the T2 trigger of PCG-R7D-F08-r1)

**Sources:**
- `audits/domain-coaching-r7-d-2026-11-02/phase35/FOUNDER_DECISIONS_PHASE35.md` (D2);
- `phase35/f08/F08_MINIMAL_DELTA_AND_MISSION.md` (G1–G9);
- `phase34/policy/PCG_F08_AUTHORITY_R7D.md` (R-F08-1, C01–C10);
- `phase34/f08/F08_RETURN_PROPOSAL.md` (S1–S7).

**What is new in this mission's request (B1):** "mild illness" sits in the low-friction path (Situation 1). Situation 2 remains "relevant illness or injury".

### F08 states (S1–S7 of the Phase 3.4 proposal, with D2 replacing the S5 clearance)

| State | Meaning | Entered by | Left by |
|---|---|---|---|
| S1 | Normal training | — | any event below |
| S2w | **Temporary reduction (Situation 1), new.** A window of 3–14 days with an intent per affected sport | a structured "not 100%" check-in with every red flag answered no | the window's end, then return at the chosen speed (to S1); any red flag or clinical sign (to S3) |
| S3 | Clinical hold (`CLINICAL_HUMAN_REQUIRED`): professional assessment recommended, no prescription for the held scope, recording continues | a clinical reason, flag or mention; a red flag | only S6 by readiness (no reclassification exit; R-F08-1) |
| S6 | **Sporting restart after the athlete's readiness declaration (Situation 2).** Not a clearance: per sport, by the episode's own length, with restrictions as hard caps | `READINESS_DECLARATION` (below) on a clinical-cause episode | executed evidence (S7); any new sign (S3) |
| S8 | **New plan (Situation 3).** A new program from an updated intake, history preserved | a long interruption, or the athlete's request after S3/S6 | — |

### Inputs (draft; Security reviews minimisation, purpose, consent and retention)

**`NOT_FEELING_100` (Situation 1)**
- `wellbeing.condition`: one of `MILD_INDISPOSITION | UNUSUAL_FATIGUE | MILD_ILLNESS | MINOR_DISCOMFORT | NEED_REST`.
- `wellbeing.scope`: one of `WHOLE_BODY | RUN | STRENGTH | UPPER_BODY | LOWER_BODY`. Systemic conditions (the first three) always affect both programmed sports, whatever the scope says.
- `wellbeing.redFlags`: closed booleans, each answered (unknown is ASK):
  - `fever`;
  - `chestPainOrPressure`;
  - `breathlessnessOrPalpitations`;
  - `faintingOrDizziness`;
  - `painThatChangesMovementOrSwelling`;
  - `injuryFromFallOrImpact`;
  - `worsening`.
  - Any yes routes to S3 with the professional-assessment recommendation.
- Current eligibility flags stay what they are: any yes is clinical.
- `wellbeing.intent`: one of `REDUCE_LIGHT | REDUCE_SUBSTANTIAL | LIGHT_ACTIVITY_ONLY | REST`.
- Window: `days` 3–14, or `startDate` and `endDate`. The start is today unless stated otherwise, and never in the past beyond the decision.
- `returnSpeed`: one of `CONSERVATIVE | BALANCED | FASTER`. Default BALANCED; it can be changed until the window ends.
- Optional free `text`: never a classifier. It is screened only for red-flag terms, and a contradiction is asked.

**`READINESS_DECLARATION` (Situation 2)**
- `episodeId`: the clinical episode on record.
- `declaredRecovered`: true.
- Per sport, `{ready: true|false, restrictions: []}`, with restrictions from the closed vocabulary `AVOID_LOWER_BODY_STRENGTH | AVOID_UPPER_BODY_STRENGTH`.
- A current eligibility, every flag false, dated on or after the episode's last day.
- `professionalSeen`: optional and informational. Never verified, never required, never shown as clearance.
- It never edits or reclassifies the episode's reason (R-F08-1). It is an append-only fact of its own.

**`RESTART_PLAN` (Situation 3)**
- An updated intake (goals, availability, recent exposure, equipment, preferences) plus the carried record.
- A clinical-cause episode still in S3 needs its readiness declaration first.

### Proposed sporting mapping (SSCTR decides; conditional on the PCG form)

**Situation 1 intents.** These are operations on existing doses, for sessions of affected sports dated inside the window.

| Intent | Running | Strength | Gates of the window's weeks for affected sports |
|---|---|---|---|
| REDUCE_LIGHT | The CONSOLIDATION dose (long run −`consolidationLongRunReductionSteps`; strides kept optional) | The CONSOLIDATION dose (`consolidationSetReduction` 1) | HOLD (no step from a reduced week; the state is held) |
| REDUCE_SUBSTANTIAL | Easy only. Quality and long become easy at the week's easy duration (the systemic-fatigue reduction "remove the remaining hard suffix; keep easy participation") | The return-entry dose (`strengthEntrySets` 1 at RIR ≥ `strengthEntryMinimumRir` 4) | HOLD |
| LIGHT_ACTIVITY_ONLY | An optional walk (`walkSessionMinutes`[0] = 20) | Rest (REST_BY_DESIGN, no debt) | no gate (not trained) |
| REST | Rest (REST_BY_DESIGN, no debt) | Rest | no gate |

**Return speeds after the window.** Principle: FASTER is the fastest the existing recipes allow; BALANCED and CONSERVATIVE add existing hold steps. None restores prior doses by date, and none passes a cap.

| Window was | FASTER | BALANCED (default) | CONSERVATIVE |
|---|---|---|---|
| REST or LIGHT_ACTIVITY_ONLY for D days: a nonclinical stop of D days for the affected sports | The existing recipe for class(D): SHORT ≤ 10 means resume the last completed doses, no step until execution is observed; MODERATE 11–14 means entry, then `moderateStepsToPrior` 2 | class(D) recipe, with its first step held one more executed week (`return.shortHoldWeeks` 1) | The next class's recipe (SHORT treated as MODERATE; MODERATE as LONG: restart from current capacity, prior doses only a ceiling) |
| REDUCE_LIGHT or REDUCE_SUBSTANTIAL (trained at a reduced dose) | Resume the held state: the pre-window doses, which were tolerated before the window, as after a consolidation week | One executed week at the REDUCE_LIGHT dose with no step, then resume | One executed week at the window's own dose, then one at the REDUCE_LIGHT dose, then resume |

**Situation 2 (S6).**
- Per sport with `ready:true`: the existing nonclinical return recipe by the episode's own length (days from its first day to the declaration), never shorter than its own class. There is no current-demonstration entry, and speed choice is limited to CONSERVATIVE or BALANCED.
- Restrictions are hard caps: AVOID_LOWER removes lower-region strength rows, AVOID_UPPER removes upper-region ones. Neither is replaced by a load from another exercise.
- A sport with `ready:false` stays held, and the other proceeds with the existing composition.
- Back to S3 on any new clinical sign: an eligibility flag, a clinical reason or mention, pain with a substitution, a red flag, or the athlete reporting the symptoms returned.

**Situation 3 (S8).**
- The new program comes from the existing cold start (`generateProgram`). The pause is computed from the record: weeks since the last executed session of each sport.
- The existing RESTART rules apply: a run restart at ≥ `longPauseWeeksAtLeast`, and strength known doses ignored on a long pause.
- Prior history and records are preserved as context (`priorCapacity`), never as dose.

### PCG questions (authority form under T2; PCG decides)

- **P1.** Does D2 (with this mission's B1 and B6) formalize as one new PDR DR that partly supersedes DR-99?
  - Clinical judgment (diagnosis, clearance, clinical restriction) stays outside the software.
  - The athlete's structured "not 100%" report with every red flag no opens a temporary reduction (Situation 1).
  - The athlete's readiness declaration with a current clear screen opens a conservative sporting restart (Situation 2), which is not clearance.
  - The new plan (Situation 3) is admissible once readiness is declared.
- **P2.** The AEC §7 and PDR §5 G04-row deltas (F08 minimal delta G2 and G4), and the re-ruling of P-2, P-3, C01, C02 and C06 for these paths (G5), with C07 and R-F08-1 kept.
- **P3.** Is the red-flag list above an admissible conservative boundary instrument under the new form, with its content flagged for future G04 revalidation? Or must it reuse only the existing eligibility flags?
- **P4.** Which product/ and canon/ texts change, exactly, with what text. Nothing outside D2's coverage.

### Security questions (Security decides conditions)

- The health facts above:
  - minimisation (closed enums, booleans, no diagnosis field, no documents);
  - purpose limitation (training adaptation only);
  - consent (sensitive personal data under LGPD art. 11);
  - retention;
  - free text;
  - logs;
  - exports;
  - who can read them.
- No upload of any medical document in V1.
- `professionalSeen` is informational. Should it exist at all?

---

## Blocks 3 and 4: coach profiles, volume and difficulty

### Axes and ownership of levers (each lever belongs to exactly one axis, so nothing multiplies)

**Coach profile** = the adaptive philosophy: how evidence becomes progression.
- Values: `CONSERVATIVE | BALANCED (default) | DEMANDING`, one per athlete.

**Volume** = quantity ceilings.
- Values: `LOWER | STANDARD (default) | HIGHER`, per sport or one value for both.

**Difficulty** = the relative challenge of sessions (intensity and proximity to limits).
- Values: `LOWER | STANDARD (default) | HIGHER`, per sport or one value for both.

**Defaults:** BALANCED, STANDARD and STANDARD are byte-identical to R7D-FREEZE-6 behaviour. The default path carries no new key, so every R7-D regression and conformance result stands for it.

| Axis | Lever (runtime point) | CONSERVATIVE / LOWER | BALANCED / STANDARD | DEMANDING / HIGHER | Basis |
|---|---|---|---|---|---|
| Profile | P1. EARNED early release (`weeklyGates` EARNED, run and strength) | EARNED counts as ADVANCE: cadence only | as today | as today | Holding is always inside the envelope |
| Profile | P2. A run step after a completed run with no response reported (`classify` → COMPLETED_NO_RESPONSE, today ADVANCE) | HOLD (no regression; unknown is never adverse) | as today | as today | R6-PARTIAL-NOISY-LEARNING limit "missing effort or heart rate is unknown, not adverse"; a HOLD is not an adverse reading |
| Profile | P3. A strength step's reserve tolerance (`gates.advanceMinimumLoggedRirBelowPrescribed` 1) | 0: the logged reserve must meet the prescribed RIR | as today (1) | as today | A tightening inside the existing gate |
| Profile | P4. Recommendation shown with a graduation offer (`RUN_QUALITY_GRADUATION`) | recommends keep building | neutral | recommends accept | Advisory only; the athlete decides |
| Profile | P5. **NEW PARAMETER:** easy-run step cadence (`easyStepEveryDevelopmentWeeks` 2) | as today | as today | every development week, under the unchanged single-run ceiling (+5 min over the 30-day longest), long-run share and availability | SSCTR decides or rejects |
| Volume | V1. Strength exercises per session (`maxExercises`) | `MAIN_ONLY_BUDGET` 3 | `DEFAULT` 5 | `DEFAULT` 5 | Existing values |
| Volume | V2. Block-boundary set addition (`addSetAtBlockBoundary`) | none (base sets) | as today | as today (`maxSets` cap) | Existing rule |
| Volume | V3. Taper and race-week run volume fractions (`taperWeekRunVolumeRange`, `raceWeekRunVolumeRange`, `taperWeekLongRunRange`) | lower bound | as today (midpoints; 10K taper upper) | upper bound | Inside SSCTR-approved ranges |
| Volume | V4. **NEW PARAMETER:** running quantity for LOWER | one chosen easy-run day a week planned as optional (never long, quality, touch or race) | as today | as today | SSCTR decides or rejects |
| Difficulty | D1. Strength rep/load progression threshold (`targetRir` in the FROM_LOG rule) | `startRir` (3) as the threshold, so sets stay further from failure | as today | **NEW PARAMETER:** `targetRir` − 1 (RIR 1) for HYPERTROPHY and GENERAL accessory rows, INTERMEDIATE or EXPERIENCED lifters only, never in ESTABLISHMENT, RETURN, RESTART, SPECIFIC, TAPER, RACE_WEEK or POST_EVENT | Existing range; HIGHER needs SSCTR |
| Difficulty | D2. Optional strides (EASY_LOW/NOVICE "equal alternative") | omitted | as today | included in the easy run | Existing equal alternative |
| Difficulty | D3. Taper quality work fraction (`taperQualityWorkRange`) | lower bound | as today | upper bound | Inside the approved range |

### Interaction rules (the answer to "profile × volume × difficulty")

1. **One axis per lever.** No lever is moved by two axes, so the three choices never multiply into a larger dose.
2. **The envelope comes last and is the same for all.** Missed, partial, adverse or conflicting evidence holds or regresses whatever the choices. Caps, return recipes, event phase doses (`phaseDose`, `phaseMinimumRir`), the clinical screen and the cold-start establishment are unchanged.
3. **The profile never overrides a volume or difficulty choice.** DEMANDING with LOWER difficulty keeps the LOWER threshold; the profile only changes how evidence moves the athlete inside it.
4. **HIGHER difficulty is never a bypass.** It never applies to novices, to establishment, return, restart or event phases, or to any gate or ceiling.
5. **HIGHER volume never exceeds the athlete's chosen days and minutes.** Where today's plan already uses them as capacity allows, HIGHER equals STANDARD and the output says so.
6. **Changing a choice** is a `PREFERENCE_CHANGE` review event.
   - It is recorded as a decision and re-plans only the weeks after this one, from the current state.
   - The executed history and this week's sessions are unchanged.
   - In the last week it is KEEP, recorded for the next program (see A2).
   - Repeating the same choice changes nothing.

### SSCTR questions (sporting decisions; SSCTR decides)

1. A1 (a)–(c): screen semantics.
2. A3: option A or B.
3. E1: the training-age mapping, per sport.
4. E2: race results, or history only.
5. F08 Situation 1: the intent table.
6. F08 return speeds.
7. F08 Situation 2: per-sport entry and triggers, conditional on the PCG form.
8. F08 Situation 3: existing cold start and restart.
9. The profile levers P1–P4, and the new parameter P5.
10. The volume levers V1–V3, and the new parameter V4.
11. The difficulty levers D1 (LOWER, and the HIGHER new parameter), D2 and D3.
12. The interaction rules 1–6.

For each item: APPROVE, APPROVE_WITH_CONDITIONS, MODIFY (state the change), REJECT or ABSTAIN, with an evidence status. A rejected or abstained item stays PENDING, with an explicit disclosure.
