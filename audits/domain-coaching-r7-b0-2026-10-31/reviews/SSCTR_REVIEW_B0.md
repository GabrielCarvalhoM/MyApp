R7B0_SSCTR_GATE = REVISE

- **B0-FIDELITY** = REVISE (evidence SUPPORTED_WITH_LIMITS, confidence MODERATE). Smallest exact change: M1 CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json run.families[id=RUN.THRESHOLD].eligibility.positive: append "All quality gates of the frozen runtime (src/r6-program.mjs qualityAllowed): run goal RACE or PERFORMANCE (a supported event implies RACE), at least 3 chosen run days, phase context BUILD, DEVELOPMENT, SPECIFIC or NEXT_BLOCK (a consolidation week takes the context of the development phase before it, src/r6-program.mjs contextOf), and R6-RUN-QUALITY enabled." M2 same file, run.families[id=RUN.EVENT_SPECIFIC].eligibility.positive: append "All RUN.THRESHOLD quality gates (run goal, at least 3 chosen run days, R6-RUN-QUALITY)." M3 same file, run.families[id=RUN.FAMILIAR_REPEATED_BOUTS].eligibility.positive and classification.graduation.run: append "All RUN.THRESHOLD quality gates apply." M4 same file, strength.substitution.reasons[id=PROTECTED_RUN_STIMULUS_CONFLICT].authority: replace "R6-HYBRID-ARRANGEMENT" with "B0-C11 (SIS section 5 DR-112 paragraph; SSCTR OB-2 Q1 condition 3)". Binding conditions that hold after the change: (1) Every condition of the ten r12 records applies to the corresponding catalog entries, including the weekly-review contract (R18). (2) FAMILIAR_FIELD_SESSION_TARGET applies only to the exact familiar recipe at the familiar ladder step with all SSCTR-R2-P14 inputs; every other ladder step uses EFFORT_CUE and its first exposure is a calibration (R6-RUN-QUALITY C7). (3) Strides after walk/jog or restart exit equal the frozen runtime; their optionality is set by the B0-C01 record. (4) The narrow recheck covers only M1-M4 and confirms that no other catalog byte changed.
- **B0-C01** = APPROVE_WITH_CONDITIONS (evidence SUPPORTED_WITH_LIMITS, confidence LOW). Conditions: (1) Quality after graduation only under all R6 quality gates: run goal RACE or PERFORMANCE, at least 3 chosen run days, EASY mode, R6-RUN-QUALITY enabled, assessing block boundary in BUILD, DEVELOPMENT or NEXT_BLOCK (never SPECIFIC, TAPER, race window or post-event); one quality session per week, not the day before or after the long run when another chosen run day can hold it. (2) For athletes who started in WALK_JOG or RESTART mode, the two qualifying weeks must lie in a block executed entirely in EASY mode after exit: the first block boundary after exit is not an assessing boundary when that block began in WALK_JOG or RESTART mode. For EASY_LOW starters the rule applies as written. (3) Qualifying weeks count only executed non-establishment EASY-mode weeks whose EASY and LONG gates were ADVANCE or EARNED (policy activationCounts); running minutes are executed continuous-running minutes from the completed-work ledger (walks and walk breaks excluded); a week with a missing, partial-only, conflicted or adverse report, or without a gating weekly review (R18), does not qualify. (4) Entry only at threshold ladder step 0 with EFFORT_CUE (talk test, about 6-7 of 10); the first exposure is recorded as a calibration; no pace target; progression one ladder step per executed comparable session without an adverse signal. (5) In the week quality is introduced no other run dimension steps (easy and long run hold), and the single-run ceiling applies to the whole session including warm-up and cool-down. (6) The introduction is disclosed as a new harder session with an easy-run alternative that the athlete may keep without penalty or volume debt; declining keeps the easy plan and may be revisited at the next block boundary. (7) A single adverse response repeats the step; two comparable adverse responses within 14 days regress one step; pain, injury, illness or a functional limitation routes CLINICAL_HUMAN_REQUIRED with no substitute dose; missing current eligibility is ASK. (8) Graduation supersedes the NOVICE label for quality eligibility only: strides stay optional with an equal easy-only alternative for every WALK_JOG-, RESTART- or EASY_LOW-started athlete and for runExperience NONE or NOVICE (extends R6-RUN-QUALITY C9 to never-runners; the frozen runtime marks strides optional only for EASY_LOW or NOVICE, an R7-B binding item). (9) Graduation does not exempt the race-day completion rule for programmes with WALK_JOG or RESTART history (D47; SSCTR-R9 stays LATER_GATE) and does not by itself satisfy the RUN.EVENT_SPECIFIC prerequisite of executed threshold sessions. (10) Strides after walk/jog or restart exit follow the frozen runtime and R6-RUN-QUALITY C5, C9, C12 and C13 unchanged.
- **B0-C02** = APPROVE_WITH_CONDITIONS (evidence SUPPORTED_WITH_LIMITS, confidence MODERATE). Conditions: (1) Scope: only a task of the ACF-G05 VO2_STYLE category (minutes-long repeated harder aerobic bouts with recoveries) that is current by the R6 intake definition (flagged current, familiar and tolerated, observedAt within 28 days) and has every SSCTR-R2-P14 input (exact recipe identity, tolerance fact, target with method, construct and provenance, same-task dose and response history, comparable surface, grade and weather); familiar short-interval or speed, hill, time-trial or race-simulation tasks are not covered (LATER_GATE); an ambiguous category is ASK. (2) All R6 quality gates apply: run goal RACE or PERFORMANCE, at least 3 chosen run days, EASY mode, BUILD, DEVELOPMENT or NEXT_BLOCK only (week 1 only inside the reported weekly minutes per R6-COLD-START C7; never SPECIFIC, TAPER, race window or post-event); it is the week's single quality session and is not placed the day before or after the long run when another chosen run day can hold it. (3) The dose is held exactly: no added repetition, density, pace or duration; SSCTR-R2-P07 permits only fewer repetitions at the same target and recovery after repeated last-repetition degradation; otherwise fall back to the threshold ladder (new family: step 0 at effort cue, calibration) or to easy running, disclosed as a different stimulus. (4) The familiar target is a field-session task anchor only, never LT2, CS, MLSS, VO2max or race pace, with no transfer to another family, recipe or distance; the effort cue is co-primary; changed conditions or conflicting data invalidate target reuse (ASK or HOLD). (5) After a SHORT break the first quality slot runs easy; no quality in RETURN or RESTART mode; after a RESTART or any interruption the familiar status lapses until the task is current again under the intake definition. (6) It does not count as an executed threshold session for the RUN.EVENT_SPECIFIC prerequisite, nor as the achieved peak quality for taper doses, nor as executed comparable quality for the race-week touch. (7) Composition class KEY with recovery cost HIGH; CMP relations and the B0-C11 placement rules apply; explanations name it the athlete's familiar harder intervals, never VO2max training.
- **B0-C03** = APPROVE_WITH_CONDITIONS (evidence SUPPORTED_WITH_LIMITS, confidence MODERATE). Conditions: (1) Admission adds no dose: every B0 configuration takes the R6 goal dose for its contextual role and R6-LOAD-ESTABLISHMENT establishment (unloaded or light practice first for strength class NONE; at most 2 sets at RIR >= 3 with an ascending ramp from the lightest available load); no load derived from sex, body size, another exercise or implement; R6 progression gates. (2) Skill admissibility unchanged: novices LOW; others up to MODERATE; HIGH (front-squat, deadlift, barbell-overhead-press, chin-up) only when familiar or reached through a B0-C07 ladder under its conditions; equipment availability never implies competence. (3) HIGH-eccentric configurations (bulgarian-split-squat-db, single-leg-rdl-db) and every first or re-establishment lower-body exposure follow B0-C11 placement and are never used as content-reduction substitutes near a protected run. (4) DURABILITY_CAPACITY and RUNNING_SUPPORT are programming purposes only, never presented as injury prevention, rehabilitation or a remedy for pain (tibialis, hip abduction, calf and step-down included). (5) Hypertrophy isolation configurations enter only through B0-C05 goal-context accessory slots, replacing and never adding to the slot's sets. (6) Bodyweight configurations whose goal-range repetitions cannot approach the prescribed reserve are disclosed as a lower stimulus; added load stays LATER_GATE. (7) Pain, injury, illness or a functional limitation during any configuration routes CLINICAL_HUMAN_REQUIRED for the dependent scope; no safe-exercise substitution for pain.
- **B0-C04** = APPROVE_WITH_CONDITIONS (evidence SUPPORTED_WITH_LIMITS, confidence MODERATE). Conditions: (1) Demand classes, muscles and purposes are ordinal priors for comparing alternatives and placing sessions only, never a fatigue measurement, recovery timer, readiness or injury-risk score, and never summed. (2) The derived session recovery-cost class is explanatory and a tie-break only: it never adds a cost to a pair already costed by CMP.I01-CMP.I11 (no double counting, SIL-I4) and it follows the same phase and dose adjustment as the lower class, so an axial-HIGH row at a reduced phase dose does not by itself make a session HIGH. (3) Muscle counting is descriptive only: it may not set, gate or judge weekly volume adequacy until G02 adopts a reviewed method; evidence favouring fractional counting (indirect sets 0.5) is the re-review trigger. (4) SINGLE_IMPLEMENT progresses by the per-implement step policy:operational.strength.smallestIncrement.PER_HAND applied to the one implement, or by repetitions when that implement step is unavailable, never a fabricated load (B0-F07 made explicit in R7-B). (5) BAND_TENSION and ASSISTED_BODYWEIGHT never carry kilograms: they progress by repetitions inside the goal range; a level change is athlete-reported and confirmed (ASK), never inferred; a logged band or assistance value is never converted to a load. (6) Bent-knee calf configurations are labelled soleus emphasis (activation) without a hypertrophy or performance superiority claim; straight-knee remains the calf default. (7) The R6 runtime representation (PER_HAND single implements, band rows in kilograms, EXTERNAL pull-up, bilateral side plank and Pallof press) is not authority for these configurations; correcting it is an R7-B binding item (B0-F01, B0-F02). (8) Any change to a demand class, primary muscle or convention is a material change that invalidates this record for the affected configuration.
- **B0-C05** = APPROVE_WITH_CONDITIONS (evidence SUPPORTED_WITH_LIMITS, confidence MODERATE). Conditions: (1) Alternatives replace, never add to, the slot's sets; doses, rest and preparation remain the R6 goal doses by role; no new exercise in TAPER, RACE_WEEK or POST_EVENT. (2) Calf alternation keeps the straight-knee default whenever the week has a single calf exposure; with two or more calf exposures in the week at most half are bent-knee; bent-knee work is presented as variation, not superiority. (3) Within a week, goal-context alternatives are distributed across the listed patterns before any pattern repeats (planner quality, R7-B); the id tie-break decides only within a pattern. (4) Running-support alternatives (hip abduction, tibialis, calf) carry no injury-prevention or rehabilitation claim, and trunk work is never removed from the whole week. (5) Role admissibility only narrows R6 choices: PRACTICE configurations fill PRACTICE rows only, isolation configurations ACCESSORY slots only; a MAIN slot without a MAIN-admissible configuration follows B0-C09 (downgrade with disclosure), never an isolation exercise. (6) The selection order is an IMPLEMENTATION_CHOICE with no dose or admissibility effect; emphasis may reorder only within goal doses.
- **B0-C06** = APPROVE_WITH_CONDITIONS (evidence SUPPORTED_WITH_LIMITS, confidence MODERATE). Conditions: (1) Rotation is selection only, permitted never mandatory, systematic never random: an admissible alternative keeps the slot pattern and subpattern (or the LUNGE split-stance and step group), shares a primary muscle, stays within one step on lower, axial and eccentric class, fits equipment and skill, admits the slot role and does not worsen the week's arrangement cost. (2) Every newly rotated or re-introduced configuration is a calibration exposure: effort-guided establishment (at most 2 sets at RIR >= 3, ascending ramp), no load transferred, no progression step in its first exposure, earlier sets returning one per executed week (R6-ROTATION C7, C8, C10, C12); its first exposure follows B0-C11 placement away from the long run and the week's quality run. (3) No rotation in ESTABLISHMENT, SPECIFIC, TAPER, RACE_WEEK or POST_EVENT weeks, nor while any exercise in use is in return steps (R6-ROTATION C6, C11). (4) Under COACH_DECIDES and EVERY_6_WEEKS an accessory rotates only at the first block boundary on or after its policy cadence (everyWeeks 6), never at every 4-week boundary (R6-ROTATION C5). (5) A MAIN changes only at a block boundary, default keep, with a recorded reason: DELIBERATE_BLOCK_TRANSITION with a stated training purpose (phase, goal specificity, equipment or technique; never variety alone), SKILL_PROGRESSION through B0-C07 with agency, EQUIPMENT_CHANGE or ATHLETE_PREFERENCE; the new MAIN fills the same slot pattern, shares a primary muscle, is skill-admissible and is established by effort; for STRENGTH-goal athletes the change is disclosed with progress shown by block or effort because lift-specific load restarts. (6) Under FIXED every role is REASON_ONLY; DELIBERATE_BLOCK_TRANSITION and SKILL_PROGRESSION are offered only with explicit athlete opt-in, never applied by default. (7) Close variation is a ranking relation only; it grants no permission and cannot exempt a MAIN from block stability. (8) Reason-based substitution keeps precedence over cadence but passes the clinical screen first: pain, injury, illness or a functional limitation routes CLINICAL_HUMAN_REQUIRED for the dependent scope; ambiguous reports are ASK.
- **B0-C07** = APPROVE_WITH_CONDITIONS (evidence SUPPORTED_WITH_LIMITS, confidence LOW). Conditions: (1) A ladder step is offered, never automatic: only at a block boundary, after the earlier configuration's final exposures in the block were ADVANCE or EARNED, with explicit athlete opt-in; SKILL_MISMATCH regression along the chain is always available. (2) One ladder step per configuration per block boundary; no skipped chain step. (3) The new configuration starts with effort-guided establishment from the lightest available load (the empty bar for barbell lifts) with an ascending ramp and technique-first instruction: at most 2 sets at RIR >= 3, no load transferred, sets returning one per executed week. (4) Not offered in ESTABLISHMENT, SPECIFIC, TAPER, RACE_WEEK or POST_EVENT, during return steps, or under FIXED unless the athlete opts in. (5) Reaching a HIGH-skill configuration through a ladder makes only that configuration admissible; general skill admissibility is unchanged. (6) A link that changes subpattern (push-up to pike-push-up) is a variation rather than a progression of the same movement: it may fill a PUSH slot only while another PUSH slot in the same week keeps a horizontal push. (7) First exposures after a ladder step follow B0-C11 placement (away from the day before and the same day before the long run or quality run when days allow).
- **B0-C08** = APPROVE_WITH_CONDITIONS (evidence SUPPORTED_WITH_LIMITS, confidence MODERATE). Conditions: (1) Applies only to strength class NONE, from establishment until the first strength block boundary; FAMILIAR_UNKNOWN_LOAD and KNOWN_LOAD classes keep the R6 day-count templates. (2) Release at the first block boundary requires executed evidence: the loaded configurations established (FROM_LOG adopted or KNOWN) with final exposures ADVANCE or EARNED and no repeated adverse response; otherwise the cap continues and is re-assessed at the next boundary. (3) On release every configuration new to the athlete starts with effort-guided establishment; sets follow R6 rules; no catch-up of sets not done. (4) TPL.CORE days run at practice or accessory dose with the practice configuration first, never add lower-body MAIN work, and are disclosed as lighter by design with the non-blocking STRENGTH_DAYS_ABOVE_CURRENT_PRACTICE options (keep the days lighter or choose fewer); chosen days are never dropped (DR-112). (5) The cap is a reversible coaching choice, not a physiological limit or injury-prevention rule.
- **B0-C09** = APPROVE_WITH_CONDITIONS (evidence SUPPORTED_WITH_LIMITS, confidence MODERATE). Conditions: (1) The PULL_LIMITED_FOR_EQUIPMENT disclosure is computed from the rows actually selected and states that the selected pull is a lower, different stimulus than a loaded row or pull-down; it never claims equivalence. (2) A scapular pull-up requires that the athlete can hang from the bar; inability is SKILL_MISMATCH (regress to prone-row-practice or prone-ytw-raise), and pain routes to the clinical screen. (3) No improvised anchors or furniture (door, table or towel rows) are introduced; adding a band or bar is an option, never a requirement. (4) Band and assistance levels stay ordinal (B0-C04); a bodyweight-for-load swap is disclosed as a different stimulus (R6-SUBSTITUTION C6). (5) kb-row and one-arm rows are logged per side (SINGLE_IMPLEMENT, unilateral).
- **B0-C10** = APPROVE_WITH_CONDITIONS (evidence SUPPORTED_WITH_LIMITS, confidence MODERATE). Conditions: (1) A LATER_GATE or UNSUPPORTED_V1 item is never prescribed; its fallback is used and disclosed as a different stimulus, never as an equivalent (strides are not speed intervals; threshold intervals are not VO2 or steady work). (2) Declared hilly terrain is session context for easy and long runs at the effort cue only; it never generates a hill dose, hill intent or downhill emphasis. (3) 5K athletes receive a PERFORMANCE programme without event phases, and the absence of 5K taper and race-week rules is disclosed; marathon and ultra stay UNSUPPORTED at intake. (4) Promotion of any item needs its own envelope review (dose, population, progression, interference) and SSCTR approval, plus a Founder decision where V1 scope changes; candidates such as steady running, continuous tempo or plyometrics within a combined strength programme are not approved here. (5) Familiar VO2-style continuation is admissible only under B0-C02; familiar short-interval, hill or time-trial tasks remain LATER_GATE.
- **B0-C11** = APPROVE_WITH_CONDITIONS (evidence SUPPORTED_WITH_LIMITS, confidence MODERATE). Conditions: (1) CMP.I11 is an ordinal ranking cost: LOW, counted once per pair of strength session and protected run whatever the number of qualifying rows, never a prohibition or hour rule (POL-07; R6-HYBRID-ARRANGEMENT C10); athlete evidence may raise it for that athlete only. (2) It applies before RUN.LONG and the week's protected quality KEY run (threshold, event-specific or B0-C02 familiar bouts); race proximity stays under CMP.I01 and CMP.P06. (3) Arrangement first: within the chosen days and shifts (DR-112) prefer placements and orders that avoid the cost; content changes only when none exists. (4) Content reduction (CMP.P04, CMP.P05 and PROTECTED_RUN_STIMULUS_CONFLICT) uses only an established or familiar non-HIGH-eccentric configuration of the same pattern, or fewer sets of the current configuration under the R6 dose adjustment; it never introduces a first-exposure or HIGH-eccentric configuration on the day before or the same day before the protected run. (5) Under STRENGTH lead the long run's content may yield instead and a MAIN is not replaced for a run-protection reason; under JOINT a genuine equal-harm trade-off is asked once; under RUN lead strength keeps its essential stimulus (main lifts at goal or phase dose). (6) The axial tie-break is an IMPLEMENTATION_CHOICE (plausible, not evidence-based): it only decides which of otherwise equal rows is reduced or replaced first and never creates a cost or score. (7) Every kept MODERATE-or-higher cost and every content reduction is disclosed with its trade-off; a reduced lower-body dose is never presented as a recovery or injury-prevention measure. (8) PROTECTED_RUN_STIMULUS_CONFLICT is governed by this record, not by R6-HYBRID-ARRANGEMENT.
- **B0-C12** = APPROVE_WITH_CONDITIONS (evidence SUPPORTED_WITH_LIMITS, confidence MODERATE). Conditions: (1) Archetypes are labels of the R6 goal-model lead only; they add no dose, no static priority flag and no new protection rule. (2) A stated priority (ON-06 or temporary) resolves genuine trade-offs and same-shift order only; it never overrides event-phase leads or protections and is never required (DR-115). (3) Overlays (event preparation, novice, returning) keep their own trajectories and conditions (B0-C01, B0-C08, R6-NONCLINICAL-RETURN, R6-EVENT-TRANSITION) and never change the base lead. (4) Any change to the goal model, the lead derivation or the phase leads invalidates this record.

Review **R7B0-SSCTR-r1** · 2026-10-31 · independent SSCTR instance (native project agent type `sports-science-concurrent-training-reviewer`, model inherited; not the target author). Records: [`SSCTR_REVIEW_B0.json`](SSCTR_REVIEW_B0.json) (13 records, one per bounded decision). Target bytes verified equal to the request: catalog `db8a2533…c5fe`, schema `8b51b80b…ffd8`, foundation `1fb2eb4b…12b6`, gaps `0f43f09f…4b04`, validator `d757e55e…4d05`; R6-POLICY-5 file `a75be1aa…e100` equals the r12 `policySha256` (canonical `18ec48f3…`).

## Gate

**REVISE**, narrow. Twelve candidates are APPROVE_WITH_CONDITIONS. The fidelity check found two defects that are fixable in the specification (below); everything else the catalog marks APPROVED_ENVELOPE reproduces R6-POLICY-5, the r12 conditions and the frozen runtime, with every number by policy path and no added dose. After M1-M4 are applied and confirmed by the one narrow recheck, the expected gate is ACCEPT_WITH_CONDITIONS. Approvals here are provisional internal scientific decisions: `SPECIFICATION_CANDIDATE` stays, `RUNTIME_IMPLEMENTATION_READY = NO`, no gate is closed, nothing is published, and no human, empirical or clinical validation occurred.

## REVISE — exact changes (B0-FIDELITY)

- M1 CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json run.families[id=RUN.THRESHOLD].eligibility.positive: append "All quality gates of the frozen runtime (src/r6-program.mjs qualityAllowed): run goal RACE or PERFORMANCE (a supported event implies RACE), at least 3 chosen run days, phase context BUILD, DEVELOPMENT, SPECIFIC or NEXT_BLOCK (a consolidation week takes the context of the development phase before it, src/r6-program.mjs contextOf), and R6-RUN-QUALITY enabled."
- M2 same file, run.families[id=RUN.EVENT_SPECIFIC].eligibility.positive: append "All RUN.THRESHOLD quality gates (run goal, at least 3 chosen run days, R6-RUN-QUALITY)."
- M3 same file, run.families[id=RUN.FAMILIAR_REPEATED_BOUTS].eligibility.positive and classification.graduation.run: append "All RUN.THRESHOLD quality gates apply."
- M4 same file, strength.substitution.reasons[id=PROTECTED_RUN_STIMULUS_CONFLICT].authority: replace "R6-HYBRID-ARRANGEMENT" with "B0-C11 (SIS section 5 DR-112 paragraph; SSCTR OB-2 Q1 condition 3)".

Why: the frozen runtime allows quality only with run goal RACE or PERFORMANCE and at least three chosen run days (`src/r6-program.mjs` `qualityAllowed`, line 103); the catalog states neither anywhere, so an implementer reading the catalog would give quality to GENERAL/REGULAR goals and two-run-day weeks (with the long run, half or more of the running sessions would then be key sessions). M4: R6-HYBRID-ARRANGEMENT approved arrangement ranking, not exercise substitution; the protected-run substitution rests on SIS §5 / OB-2 Q1 condition 3 and is governed by the B0-C11 record. Recheck scope: these four strings plus confirmation that no other catalog byte changed. B0-C01 and B0-C02 already carry the same gates as conditions, so their approvals do not depend on the recheck.

## Funded-human queue entries required (proposed text only)

Append to `reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json` (currently 204 items, SHA-256 `95370383a7e14f7f14dce6e709c3a2d4c2024b485413c0871b55b9ef9e6cfd9c`, funding NOT_DECLARED), insert-only, with a supersession note. One entry per prescriptive approval (12); `conditions` are the record's `decision.conditions` verbatim, as `validate_records.py --queue` requires. B0-FIDELITY (REVISE) gets no entry. Linkage was checked in memory against a simulated append; the real queue was not modified.

| queue_id | decision_id | approved_scope |
|---|---|---|
| `HQ-R7B0-SSCTR-B0-C01` | `R7B0-SSCTR-B0-C01` | Nonclinical adults whose programme started in WALK_JOG, RESTART or EASY_LOW mode, with a RACE or PERFORMANCE run goal, at least three chosen run days and executed EASY-mode evidence; dose limited to the threshold-ladder entry step at effort cues. |
| `HQ-R7B0-SSCTR-B0-C02` | `R7B0-SSCTR-B0-C02` | Nonclinical adults with a current familiar VO2-style task meeting the R2-P14 inputs and the R6 quality gates; dose held at the familiar recipe. |
| `HQ-R7B0-SSCTR-B0-C03` | `R7B0-SSCTR-B0-C03` | Nonclinical adults within V1 equipment profiles; configurations enter only through the unchanged R6 skill, establishment, dose and progression envelopes. |
| `HQ-R7B0-SSCTR-B0-C04` | `R7B0-SSCTR-B0-C04` | Metadata used as ordinal priors and representation conventions for all 76 configurations; no dose, timer or score. |
| `HQ-R7B0-SSCTR-B0-C05` | `R7B0-SSCTR-B0-C05` | Accessory-slot selection within the unchanged R6 templates and goal doses for HYPERTROPHY, RUNNING_SUPPORT and event contexts. |
| `HQ-R7B0-SSCTR-B0-C06` | `R7B0-SSCTR-B0-C06` | Strength selection changes for nonclinical adults under the DR-134 structure and R6-ROTATION mechanics. |
| `HQ-R7B0-SSCTR-B0-C07` | `R7B0-SSCTR-B0-C07` | Nonclinical adults progressing between configurations of one pattern, offered at block boundaries with agency. |
| `HQ-R7B0-SSCTR-B0-C08` | `R7B0-SSCTR-B0-C08` | Strength class NONE (no current known dose, novice) from establishment until the first strength block boundary. |
| `HQ-R7B0-SSCTR-B0-C09` | `R7B0-SSCTR-B0-C09` | Nonclinical adults whose declared equipment limits pulling; coverage and honest disclosure, no dose change. |
| `HQ-R7B0-SSCTR-B0-C10` | `R7B0-SSCTR-B0-C10` | Classification of V1 repertoire boundaries and fallbacks; no dose is approved for any later-gate item. |
| `HQ-R7B0-SSCTR-B0-C11` | `R7B0-SSCTR-B0-C11` | Placement and ranking of lower-body strength relative to the long run and the week's quality run within chosen days and shifts (DR-112); ordinal costs only. |
| `HQ-R7B0-SSCTR-B0-C12` | `R7B0-SSCTR-B0-C12` | Lead derivation for arrangement ranking, protected stimuli, strength dose role and explanations; no dose. |

Common fields: `decision_revision` = `R7B0-SSCTR-r1`; `target` = {project `MyApp / Vilumo Fit`, artifact `CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json`, artifact_revision `R7B0-CATALOG-1`, sha256 `db8a253309a440ca6c9c2a53003e82e16e074aecfa1afae72bc59f35a440c5fe`, rule_ids = the record's `target.rule_ids`}; `approval_date` `2026-10-31`; `state` `QUEUED_FOR_FUNDED_HUMAN_REVALIDATION`; `owner` `Chief / Founder`; `human_review` null; `re_review_triggers` = the record's `expiry.triggers`. The complete entries are below for copying.

```json
[
 {
  "queue_id": "HQ-R7B0-SSCTR-B0-C01",
  "decision_id": "R7B0-SSCTR-B0-C01",
  "decision_revision": "R7B0-SSCTR-r1",
  "target": {
   "project": "MyApp / Vilumo Fit",
   "artifact": "CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json",
   "artifact_revision": "R7B0-CATALOG-1",
   "sha256": "db8a253309a440ca6c9c2a53003e82e16e074aecfa1afae72bc59f35a440c5fe",
   "rule_ids": [
    "classification.graduation.run",
    "run.families[RUN.STRIDES].eligibility.positive (B0-C01 clause)",
    "run.families[RUN.THRESHOLD].eligibility.positive (B0-C01 clause)",
    "trajectories.novice.run",
    "witnesses WP-RUN-17 and WN-25"
   ]
  },
  "approved_scope": "Nonclinical adults whose programme started in WALK_JOG, RESTART or EASY_LOW mode, with a RACE or PERFORMANCE run goal, at least three chosen run days and executed EASY-mode evidence; dose limited to the threshold-ladder entry step at effort cues.",
  "conditions": [
   "Quality after graduation only under all R6 quality gates: run goal RACE or PERFORMANCE, at least 3 chosen run days, EASY mode, R6-RUN-QUALITY enabled, assessing block boundary in BUILD, DEVELOPMENT or NEXT_BLOCK (never SPECIFIC, TAPER, race window or post-event); one quality session per week, not the day before or after the long run when another chosen run day can hold it.",
   "For athletes who started in WALK_JOG or RESTART mode, the two qualifying weeks must lie in a block executed entirely in EASY mode after exit: the first block boundary after exit is not an assessing boundary when that block began in WALK_JOG or RESTART mode. For EASY_LOW starters the rule applies as written.",
   "Qualifying weeks count only executed non-establishment EASY-mode weeks whose EASY and LONG gates were ADVANCE or EARNED (policy activationCounts); running minutes are executed continuous-running minutes from the completed-work ledger (walks and walk breaks excluded); a week with a missing, partial-only, conflicted or adverse report, or without a gating weekly review (R18), does not qualify.",
   "Entry only at threshold ladder step 0 with EFFORT_CUE (talk test, about 6-7 of 10); the first exposure is recorded as a calibration; no pace target; progression one ladder step per executed comparable session without an adverse signal.",
   "In the week quality is introduced no other run dimension steps (easy and long run hold), and the single-run ceiling applies to the whole session including warm-up and cool-down.",
   "The introduction is disclosed as a new harder session with an easy-run alternative that the athlete may keep without penalty or volume debt; declining keeps the easy plan and may be revisited at the next block boundary.",
   "A single adverse response repeats the step; two comparable adverse responses within 14 days regress one step; pain, injury, illness or a functional limitation routes CLINICAL_HUMAN_REQUIRED with no substitute dose; missing current eligibility is ASK.",
   "Graduation supersedes the NOVICE label for quality eligibility only: strides stay optional with an equal easy-only alternative for every WALK_JOG-, RESTART- or EASY_LOW-started athlete and for runExperience NONE or NOVICE (extends R6-RUN-QUALITY C9 to never-runners; the frozen runtime marks strides optional only for EASY_LOW or NOVICE, an R7-B binding item).",
   "Graduation does not exempt the race-day completion rule for programmes with WALK_JOG or RESTART history (D47; SSCTR-R9 stays LATER_GATE) and does not by itself satisfy the RUN.EVENT_SPECIFIC prerequisite of executed threshold sessions.",
   "Strides after walk/jog or restart exit follow the frozen runtime and R6-RUN-QUALITY C5, C9, C12 and C13 unchanged."
  ],
  "approval_date": "2026-10-31",
  "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
  "owner": "Chief / Founder",
  "human_review": null,
  "re_review_triggers": [
   "Any byte change to the target catalog, schema, foundation or gap files",
   "Any change to R6-POLICY-5 or to the r12 envelope records",
   "A relevant new systematic review or meta-analysis",
   "V1 population, objective or scope change",
   "Adverse event or runtime inconsistency observed in a later gate",
   "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
  ]
 },
 {
  "queue_id": "HQ-R7B0-SSCTR-B0-C02",
  "decision_id": "R7B0-SSCTR-B0-C02",
  "decision_revision": "R7B0-SSCTR-r1",
  "target": {
   "project": "MyApp / Vilumo Fit",
   "artifact": "CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json",
   "artifact_revision": "R7B0-CATALOG-1",
   "sha256": "db8a253309a440ca6c9c2a53003e82e16e074aecfa1afae72bc59f35a440c5fe",
   "rule_ids": [
    "run.families[RUN.FAMILIAR_REPEATED_BOUTS]",
    "RUNCFG.FAMILIAR_REPEATED_BOUTS",
    "run.intensityMethods FAMILIAR_FIELD_SESSION_TARGET",
    "witnesses WP-RUN-16 and WN-06",
    "laterGate LATER.RUN.VO2_DE_NOVO"
   ]
  },
  "approved_scope": "Nonclinical adults with a current familiar VO2-style task meeting the R2-P14 inputs and the R6 quality gates; dose held at the familiar recipe.",
  "conditions": [
   "Scope: only a task of the ACF-G05 VO2_STYLE category (minutes-long repeated harder aerobic bouts with recoveries) that is current by the R6 intake definition (flagged current, familiar and tolerated, observedAt within 28 days) and has every SSCTR-R2-P14 input (exact recipe identity, tolerance fact, target with method, construct and provenance, same-task dose and response history, comparable surface, grade and weather); familiar short-interval or speed, hill, time-trial or race-simulation tasks are not covered (LATER_GATE); an ambiguous category is ASK.",
   "All R6 quality gates apply: run goal RACE or PERFORMANCE, at least 3 chosen run days, EASY mode, BUILD, DEVELOPMENT or NEXT_BLOCK only (week 1 only inside the reported weekly minutes per R6-COLD-START C7; never SPECIFIC, TAPER, race window or post-event); it is the week's single quality session and is not placed the day before or after the long run when another chosen run day can hold it.",
   "The dose is held exactly: no added repetition, density, pace or duration; SSCTR-R2-P07 permits only fewer repetitions at the same target and recovery after repeated last-repetition degradation; otherwise fall back to the threshold ladder (new family: step 0 at effort cue, calibration) or to easy running, disclosed as a different stimulus.",
   "The familiar target is a field-session task anchor only, never LT2, CS, MLSS, VO2max or race pace, with no transfer to another family, recipe or distance; the effort cue is co-primary; changed conditions or conflicting data invalidate target reuse (ASK or HOLD).",
   "After a SHORT break the first quality slot runs easy; no quality in RETURN or RESTART mode; after a RESTART or any interruption the familiar status lapses until the task is current again under the intake definition.",
   "It does not count as an executed threshold session for the RUN.EVENT_SPECIFIC prerequisite, nor as the achieved peak quality for taper doses, nor as executed comparable quality for the race-week touch.",
   "Composition class KEY with recovery cost HIGH; CMP relations and the B0-C11 placement rules apply; explanations name it the athlete's familiar harder intervals, never VO2max training."
  ],
  "approval_date": "2026-10-31",
  "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
  "owner": "Chief / Founder",
  "human_review": null,
  "re_review_triggers": [
   "Any byte change to the target catalog, schema, foundation or gap files",
   "Any change to R6-POLICY-5 or to the r12 envelope records",
   "A relevant new systematic review or meta-analysis",
   "V1 population, objective or scope change",
   "Adverse event or runtime inconsistency observed in a later gate",
   "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
  ]
 },
 {
  "queue_id": "HQ-R7B0-SSCTR-B0-C03",
  "decision_id": "R7B0-SSCTR-B0-C03",
  "decision_revision": "R7B0-SSCTR-r1",
  "target": {
   "project": "MyApp / Vilumo Fit",
   "artifact": "CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json",
   "artifact_revision": "R7B0-CATALOG-1",
   "sha256": "db8a253309a440ca6c9c2a53003e82e16e074aecfa1afae72bc59f35a440c5fe",
   "rule_ids": [
    "strength.configurations with origin B0 (37): front-squat, deadlift, single-leg-rdl-db, back-extension, single-leg-glute-bridge, barbell-hip-thrust, reverse-lunge-db, bulgarian-split-squat-db, step-down, lateral-lunge, single-leg-calf-raise, bent-knee-calf-raise, seated-calf-raise-db, seated-calf-raise-machine, tibialis-raise, leg-curl-machine, leg-extension-machine, side-lying-hip-abduction, hip-abduction-machine, barbell-overhead-press, pike-push-up, cable-triceps-pushdown, db-overhead-triceps-extension, db-lateral-raise, kb-row, inverted-row, chin-up, band-assisted-pull-up, band-pulldown, scapular-pull-up, cable-face-pull, band-face-pull, prone-ytw-raise, db-biceps-curl, band-biceps-curl, front-plank, bird-dog"
   ]
  },
  "approved_scope": "Nonclinical adults within V1 equipment profiles; configurations enter only through the unchanged R6 skill, establishment, dose and progression envelopes.",
  "conditions": [
   "Admission adds no dose: every B0 configuration takes the R6 goal dose for its contextual role and R6-LOAD-ESTABLISHMENT establishment (unloaded or light practice first for strength class NONE; at most 2 sets at RIR >= 3 with an ascending ramp from the lightest available load); no load derived from sex, body size, another exercise or implement; R6 progression gates.",
   "Skill admissibility unchanged: novices LOW; others up to MODERATE; HIGH (front-squat, deadlift, barbell-overhead-press, chin-up) only when familiar or reached through a B0-C07 ladder under its conditions; equipment availability never implies competence.",
   "HIGH-eccentric configurations (bulgarian-split-squat-db, single-leg-rdl-db) and every first or re-establishment lower-body exposure follow B0-C11 placement and are never used as content-reduction substitutes near a protected run.",
   "DURABILITY_CAPACITY and RUNNING_SUPPORT are programming purposes only, never presented as injury prevention, rehabilitation or a remedy for pain (tibialis, hip abduction, calf and step-down included).",
   "Hypertrophy isolation configurations enter only through B0-C05 goal-context accessory slots, replacing and never adding to the slot's sets.",
   "Bodyweight configurations whose goal-range repetitions cannot approach the prescribed reserve are disclosed as a lower stimulus; added load stays LATER_GATE.",
   "Pain, injury, illness or a functional limitation during any configuration routes CLINICAL_HUMAN_REQUIRED for the dependent scope; no safe-exercise substitution for pain."
  ],
  "approval_date": "2026-10-31",
  "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
  "owner": "Chief / Founder",
  "human_review": null,
  "re_review_triggers": [
   "Any byte change to the target catalog, schema, foundation or gap files",
   "Any change to R6-POLICY-5 or to the r12 envelope records",
   "A relevant new systematic review or meta-analysis",
   "V1 population, objective or scope change",
   "Adverse event or runtime inconsistency observed in a later gate",
   "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
  ]
 },
 {
  "queue_id": "HQ-R7B0-SSCTR-B0-C04",
  "decision_id": "R7B0-SSCTR-B0-C04",
  "decision_revision": "R7B0-SSCTR-r1",
  "target": {
   "project": "MyApp / Vilumo Fit",
   "artifact": "CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json",
   "artifact_revision": "R7B0-CATALOG-1",
   "sha256": "db8a253309a440ca6c9c2a53003e82e16e074aecfa1afae72bc59f35a440c5fe",
   "rule_ids": [
    "strength.configurations fields skill, lower, axial, ecc, prim, sec, purposes, conv, lat, loading (76 entries)",
    "strength.demandSemantics (recoveryCostClass)",
    "strength.muscleCounting",
    "vocabulary.loadConvention SINGLE_IMPLEMENT, BAND_TENSION, ASSISTED_BODYWEIGHT",
    "r6Delta: goblet-squat, kb-goblet-squat, kb-deadlift, hip-thrust-db, one-arm-db-row, band-row, pull-up, side-plank, pallof-press"
   ]
  },
  "approved_scope": "Metadata used as ordinal priors and representation conventions for all 76 configurations; no dose, timer or score.",
  "conditions": [
   "Demand classes, muscles and purposes are ordinal priors for comparing alternatives and placing sessions only, never a fatigue measurement, recovery timer, readiness or injury-risk score, and never summed.",
   "The derived session recovery-cost class is explanatory and a tie-break only: it never adds a cost to a pair already costed by CMP.I01-CMP.I11 (no double counting, SIL-I4) and it follows the same phase and dose adjustment as the lower class, so an axial-HIGH row at a reduced phase dose does not by itself make a session HIGH.",
   "Muscle counting is descriptive only: it may not set, gate or judge weekly volume adequacy until G02 adopts a reviewed method; evidence favouring fractional counting (indirect sets 0.5) is the re-review trigger.",
   "SINGLE_IMPLEMENT progresses by the per-implement step policy:operational.strength.smallestIncrement.PER_HAND applied to the one implement, or by repetitions when that implement step is unavailable, never a fabricated load (B0-F07 made explicit in R7-B).",
   "BAND_TENSION and ASSISTED_BODYWEIGHT never carry kilograms: they progress by repetitions inside the goal range; a level change is athlete-reported and confirmed (ASK), never inferred; a logged band or assistance value is never converted to a load.",
   "Bent-knee calf configurations are labelled soleus emphasis (activation) without a hypertrophy or performance superiority claim; straight-knee remains the calf default.",
   "The R6 runtime representation (PER_HAND single implements, band rows in kilograms, EXTERNAL pull-up, bilateral side plank and Pallof press) is not authority for these configurations; correcting it is an R7-B binding item (B0-F01, B0-F02).",
   "Any change to a demand class, primary muscle or convention is a material change that invalidates this record for the affected configuration."
  ],
  "approval_date": "2026-10-31",
  "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
  "owner": "Chief / Founder",
  "human_review": null,
  "re_review_triggers": [
   "Any byte change to the target catalog, schema, foundation or gap files",
   "Any change to R6-POLICY-5 or to the r12 envelope records",
   "A relevant new systematic review or meta-analysis",
   "V1 population, objective or scope change",
   "Adverse event or runtime inconsistency observed in a later gate",
   "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
  ]
 },
 {
  "queue_id": "HQ-R7B0-SSCTR-B0-C05",
  "decision_id": "R7B0-SSCTR-B0-C05",
  "decision_revision": "R7B0-SSCTR-r1",
  "target": {
   "project": "MyApp / Vilumo Fit",
   "artifact": "CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json",
   "artifact_revision": "R7B0-CATALOG-1",
   "sha256": "db8a253309a440ca6c9c2a53003e82e16e074aecfa1afae72bc59f35a440c5fe",
   "rule_ids": [
    "strength.templates[*].slots[*].goalContext",
    "strength.templates subpattern constraints on MAIN slots",
    "strength.templateRules (slotRoleIsContextualRole, selection, selectionOrder, patternDefaultSubpattern, goalContextKeys)",
    "strength.configurations[*].roles"
   ]
  },
  "approved_scope": "Accessory-slot selection within the unchanged R6 templates and goal doses for HYPERTROPHY, RUNNING_SUPPORT and event contexts.",
  "conditions": [
   "Alternatives replace, never add to, the slot's sets; doses, rest and preparation remain the R6 goal doses by role; no new exercise in TAPER, RACE_WEEK or POST_EVENT.",
   "Calf alternation keeps the straight-knee default whenever the week has a single calf exposure; with two or more calf exposures in the week at most half are bent-knee; bent-knee work is presented as variation, not superiority.",
   "Within a week, goal-context alternatives are distributed across the listed patterns before any pattern repeats (planner quality, R7-B); the id tie-break decides only within a pattern.",
   "Running-support alternatives (hip abduction, tibialis, calf) carry no injury-prevention or rehabilitation claim, and trunk work is never removed from the whole week.",
   "Role admissibility only narrows R6 choices: PRACTICE configurations fill PRACTICE rows only, isolation configurations ACCESSORY slots only; a MAIN slot without a MAIN-admissible configuration follows B0-C09 (downgrade with disclosure), never an isolation exercise.",
   "The selection order is an IMPLEMENTATION_CHOICE with no dose or admissibility effect; emphasis may reorder only within goal doses."
  ],
  "approval_date": "2026-10-31",
  "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
  "owner": "Chief / Founder",
  "human_review": null,
  "re_review_triggers": [
   "Any byte change to the target catalog, schema, foundation or gap files",
   "Any change to R6-POLICY-5 or to the r12 envelope records",
   "A relevant new systematic review or meta-analysis",
   "V1 population, objective or scope change",
   "Adverse event or runtime inconsistency observed in a later gate",
   "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
  ]
 },
 {
  "queue_id": "HQ-R7B0-SSCTR-B0-C06",
  "decision_id": "R7B0-SSCTR-B0-C06",
  "decision_revision": "R7B0-SSCTR-r1",
  "target": {
   "project": "MyApp / Vilumo Fit",
   "artifact": "CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json",
   "artifact_revision": "R7B0-CATALOG-1",
   "sha256": "db8a253309a440ca6c9c2a53003e82e16e074aecfa1afae72bc59f35a440c5fe",
   "rule_ids": [
    "strength.rotation.preferenceToEligibility",
    "strength.rotation.admissibleAlternative",
    "strength.rotation.subpatternGroups LUNGE [SPLIT_STANCE, STEP]",
    "strength.rotation.deferredPhases",
    "strength.rotation.mainBlockBoundaryChange",
    "strength.closeVariationRule",
    "strength.substitution.reasons DELIBERATE_BLOCK_TRANSITION",
    "witnesses WP-STR-05 and WN-10 to WN-13"
   ]
  },
  "approved_scope": "Strength selection changes for nonclinical adults under the DR-134 structure and R6-ROTATION mechanics.",
  "conditions": [
   "Rotation is selection only, permitted never mandatory, systematic never random: an admissible alternative keeps the slot pattern and subpattern (or the LUNGE split-stance and step group), shares a primary muscle, stays within one step on lower, axial and eccentric class, fits equipment and skill, admits the slot role and does not worsen the week's arrangement cost.",
   "Every newly rotated or re-introduced configuration is a calibration exposure: effort-guided establishment (at most 2 sets at RIR >= 3, ascending ramp), no load transferred, no progression step in its first exposure, earlier sets returning one per executed week (R6-ROTATION C7, C8, C10, C12); its first exposure follows B0-C11 placement away from the long run and the week's quality run.",
   "No rotation in ESTABLISHMENT, SPECIFIC, TAPER, RACE_WEEK or POST_EVENT weeks, nor while any exercise in use is in return steps (R6-ROTATION C6, C11).",
   "Under COACH_DECIDES and EVERY_6_WEEKS an accessory rotates only at the first block boundary on or after its policy cadence (everyWeeks 6), never at every 4-week boundary (R6-ROTATION C5).",
   "A MAIN changes only at a block boundary, default keep, with a recorded reason: DELIBERATE_BLOCK_TRANSITION with a stated training purpose (phase, goal specificity, equipment or technique; never variety alone), SKILL_PROGRESSION through B0-C07 with agency, EQUIPMENT_CHANGE or ATHLETE_PREFERENCE; the new MAIN fills the same slot pattern, shares a primary muscle, is skill-admissible and is established by effort; for STRENGTH-goal athletes the change is disclosed with progress shown by block or effort because lift-specific load restarts.",
   "Under FIXED every role is REASON_ONLY; DELIBERATE_BLOCK_TRANSITION and SKILL_PROGRESSION are offered only with explicit athlete opt-in, never applied by default.",
   "Close variation is a ranking relation only; it grants no permission and cannot exempt a MAIN from block stability.",
   "Reason-based substitution keeps precedence over cadence but passes the clinical screen first: pain, injury, illness or a functional limitation routes CLINICAL_HUMAN_REQUIRED for the dependent scope; ambiguous reports are ASK."
  ],
  "approval_date": "2026-10-31",
  "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
  "owner": "Chief / Founder",
  "human_review": null,
  "re_review_triggers": [
   "Any byte change to the target catalog, schema, foundation or gap files",
   "Any change to R6-POLICY-5 or to the r12 envelope records",
   "A relevant new systematic review or meta-analysis",
   "V1 population, objective or scope change",
   "Adverse event or runtime inconsistency observed in a later gate",
   "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
  ]
 },
 {
  "queue_id": "HQ-R7B0-SSCTR-B0-C07",
  "decision_id": "R7B0-SSCTR-B0-C07",
  "decision_revision": "R7B0-SSCTR-r1",
  "target": {
   "project": "MyApp / Vilumo Fit",
   "artifact": "CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json",
   "artifact_revision": "R7B0-CATALOG-1",
   "sha256": "db8a253309a440ca6c9c2a53003e82e16e074aecfa1afae72bc59f35a440c5fe",
   "rule_ids": [
    "strength.skillLadders.practiceFor",
    "strength.skillLadders.progressionOf (20 chains)",
    "strength.skillLadders.rule",
    "classification.skillAdmissibility",
    "trajectories.novice.strength",
    "strength.substitution.reasons SKILL_MISMATCH",
    "witnesses WP-STR-11 and WN-09"
   ]
  },
  "approved_scope": "Nonclinical adults progressing between configurations of one pattern, offered at block boundaries with agency.",
  "conditions": [
   "A ladder step is offered, never automatic: only at a block boundary, after the earlier configuration's final exposures in the block were ADVANCE or EARNED, with explicit athlete opt-in; SKILL_MISMATCH regression along the chain is always available.",
   "One ladder step per configuration per block boundary; no skipped chain step.",
   "The new configuration starts with effort-guided establishment from the lightest available load (the empty bar for barbell lifts) with an ascending ramp and technique-first instruction: at most 2 sets at RIR >= 3, no load transferred, sets returning one per executed week.",
   "Not offered in ESTABLISHMENT, SPECIFIC, TAPER, RACE_WEEK or POST_EVENT, during return steps, or under FIXED unless the athlete opts in.",
   "Reaching a HIGH-skill configuration through a ladder makes only that configuration admissible; general skill admissibility is unchanged.",
   "A link that changes subpattern (push-up to pike-push-up) is a variation rather than a progression of the same movement: it may fill a PUSH slot only while another PUSH slot in the same week keeps a horizontal push.",
   "First exposures after a ladder step follow B0-C11 placement (away from the day before and the same day before the long run or quality run when days allow)."
  ],
  "approval_date": "2026-10-31",
  "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
  "owner": "Chief / Founder",
  "human_review": null,
  "re_review_triggers": [
   "Any byte change to the target catalog, schema, foundation or gap files",
   "Any change to R6-POLICY-5 or to the r12 envelope records",
   "A relevant new systematic review or meta-analysis",
   "V1 population, objective or scope change",
   "Adverse event or runtime inconsistency observed in a later gate",
   "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
  ]
 },
 {
  "queue_id": "HQ-R7B0-SSCTR-B0-C08",
  "decision_id": "R7B0-SSCTR-B0-C08",
  "decision_revision": "R7B0-SSCTR-r1",
  "target": {
   "project": "MyApp / Vilumo Fit",
   "artifact": "CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json",
   "artifact_revision": "R7B0-CATALOG-1",
   "sha256": "db8a253309a440ca6c9c2a53003e82e16e074aecfa1afae72bc59f35a440c5fe",
   "rule_ids": [
    "strength.noviceDensity",
    "composition.placementRules CMP.P09",
    "composition.infeasibleOrIncomparable STRENGTH_DAYS_ABOVE_CURRENT_PRACTICE",
    "witness WP-STR-10"
   ]
  },
  "approved_scope": "Strength class NONE (no current known dose, novice) from establishment until the first strength block boundary.",
  "conditions": [
   "Applies only to strength class NONE, from establishment until the first strength block boundary; FAMILIAR_UNKNOWN_LOAD and KNOWN_LOAD classes keep the R6 day-count templates.",
   "Release at the first block boundary requires executed evidence: the loaded configurations established (FROM_LOG adopted or KNOWN) with final exposures ADVANCE or EARNED and no repeated adverse response; otherwise the cap continues and is re-assessed at the next boundary.",
   "On release every configuration new to the athlete starts with effort-guided establishment; sets follow R6 rules; no catch-up of sets not done.",
   "TPL.CORE days run at practice or accessory dose with the practice configuration first, never add lower-body MAIN work, and are disclosed as lighter by design with the non-blocking STRENGTH_DAYS_ABOVE_CURRENT_PRACTICE options (keep the days lighter or choose fewer); chosen days are never dropped (DR-112).",
   "The cap is a reversible coaching choice, not a physiological limit or injury-prevention rule."
  ],
  "approval_date": "2026-10-31",
  "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
  "owner": "Chief / Founder",
  "human_review": null,
  "re_review_triggers": [
   "Any byte change to the target catalog, schema, foundation or gap files",
   "Any change to R6-POLICY-5 or to the r12 envelope records",
   "A relevant new systematic review or meta-analysis",
   "V1 population, objective or scope change",
   "Adverse event or runtime inconsistency observed in a later gate",
   "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
  ]
 },
 {
  "queue_id": "HQ-R7B0-SSCTR-B0-C09",
  "decision_id": "R7B0-SSCTR-B0-C09",
  "decision_revision": "R7B0-SSCTR-r1",
  "target": {
   "project": "MyApp / Vilumo Fit",
   "artifact": "CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json",
   "artifact_revision": "R7B0-CATALOG-1",
   "sha256": "db8a253309a440ca6c9c2a53003e82e16e074aecfa1afae72bc59f35a440c5fe",
   "rule_ids": [
    "strength.pullCoverage",
    "strength.equipmentProfiles",
    "configurations kb-row, inverted-row, band-row, band-pulldown, band-face-pull, scapular-pull-up, prone-ytw-raise",
    "composition.infeasibleOrIncomparable PULL_LIMITED_FOR_EQUIPMENT",
    "witnesses WP-STR-08 and WP-STR-09"
   ]
  },
  "approved_scope": "Nonclinical adults whose declared equipment limits pulling; coverage and honest disclosure, no dose change.",
  "conditions": [
   "The PULL_LIMITED_FOR_EQUIPMENT disclosure is computed from the rows actually selected and states that the selected pull is a lower, different stimulus than a loaded row or pull-down; it never claims equivalence.",
   "A scapular pull-up requires that the athlete can hang from the bar; inability is SKILL_MISMATCH (regress to prone-row-practice or prone-ytw-raise), and pain routes to the clinical screen.",
   "No improvised anchors or furniture (door, table or towel rows) are introduced; adding a band or bar is an option, never a requirement.",
   "Band and assistance levels stay ordinal (B0-C04); a bodyweight-for-load swap is disclosed as a different stimulus (R6-SUBSTITUTION C6).",
   "kb-row and one-arm rows are logged per side (SINGLE_IMPLEMENT, unilateral)."
  ],
  "approval_date": "2026-10-31",
  "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
  "owner": "Chief / Founder",
  "human_review": null,
  "re_review_triggers": [
   "Any byte change to the target catalog, schema, foundation or gap files",
   "Any change to R6-POLICY-5 or to the r12 envelope records",
   "A relevant new systematic review or meta-analysis",
   "V1 population, objective or scope change",
   "Adverse event or runtime inconsistency observed in a later gate",
   "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
  ]
 },
 {
  "queue_id": "HQ-R7B0-SSCTR-B0-C10",
  "decision_id": "R7B0-SSCTR-B0-C10",
  "decision_revision": "R7B0-SSCTR-r1",
  "target": {
   "project": "MyApp / Vilumo Fit",
   "artifact": "CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json",
   "artifact_revision": "R7B0-CATALOG-1",
   "sha256": "db8a253309a440ca6c9c2a53003e82e16e074aecfa1afae72bc59f35a440c5fe",
   "rule_ids": [
    "laterGate (20 items)",
    "laterGatePolicy",
    "run.intensityMethods PACE_FROM_GOAL_OR_EASY_PACE",
    "witnesses WN-05 to WN-08 and WN-23"
   ]
  },
  "approved_scope": "Classification of V1 repertoire boundaries and fallbacks; no dose is approved for any later-gate item.",
  "conditions": [
   "A LATER_GATE or UNSUPPORTED_V1 item is never prescribed; its fallback is used and disclosed as a different stimulus, never as an equivalent (strides are not speed intervals; threshold intervals are not VO2 or steady work).",
   "Declared hilly terrain is session context for easy and long runs at the effort cue only; it never generates a hill dose, hill intent or downhill emphasis.",
   "5K athletes receive a PERFORMANCE programme without event phases, and the absence of 5K taper and race-week rules is disclosed; marathon and ultra stay UNSUPPORTED at intake.",
   "Promotion of any item needs its own envelope review (dose, population, progression, interference) and SSCTR approval, plus a Founder decision where V1 scope changes; candidates such as steady running, continuous tempo or plyometrics within a combined strength programme are not approved here.",
   "Familiar VO2-style continuation is admissible only under B0-C02; familiar short-interval, hill or time-trial tasks remain LATER_GATE."
  ],
  "approval_date": "2026-10-31",
  "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
  "owner": "Chief / Founder",
  "human_review": null,
  "re_review_triggers": [
   "Any byte change to the target catalog, schema, foundation or gap files",
   "Any change to R6-POLICY-5 or to the r12 envelope records",
   "A relevant new systematic review or meta-analysis",
   "V1 population, objective or scope change",
   "Adverse event or runtime inconsistency observed in a later gate",
   "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
  ]
 },
 {
  "queue_id": "HQ-R7B0-SSCTR-B0-C11",
  "decision_id": "R7B0-SSCTR-B0-C11",
  "decision_revision": "R7B0-SSCTR-r1",
  "target": {
   "project": "MyApp / Vilumo Fit",
   "artifact": "CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json",
   "artifact_revision": "R7B0-CATALOG-1",
   "sha256": "db8a253309a440ca6c9c2a53003e82e16e074aecfa1afae72bc59f35a440c5fe",
   "rule_ids": [
    "composition.interferenceRelations CMP.I11",
    "composition.placementRules CMP.P04",
    "composition.placementRules CMP.P05 (axial tie-break)",
    "strength.substitution.reasons PROTECTED_RUN_STIMULUS_CONFLICT",
    "witness WP-STR-04"
   ]
  },
  "approved_scope": "Placement and ranking of lower-body strength relative to the long run and the week's quality run within chosen days and shifts (DR-112); ordinal costs only.",
  "conditions": [
   "CMP.I11 is an ordinal ranking cost: LOW, counted once per pair of strength session and protected run whatever the number of qualifying rows, never a prohibition or hour rule (POL-07; R6-HYBRID-ARRANGEMENT C10); athlete evidence may raise it for that athlete only.",
   "It applies before RUN.LONG and the week's protected quality KEY run (threshold, event-specific or B0-C02 familiar bouts); race proximity stays under CMP.I01 and CMP.P06.",
   "Arrangement first: within the chosen days and shifts (DR-112) prefer placements and orders that avoid the cost; content changes only when none exists.",
   "Content reduction (CMP.P04, CMP.P05 and PROTECTED_RUN_STIMULUS_CONFLICT) uses only an established or familiar non-HIGH-eccentric configuration of the same pattern, or fewer sets of the current configuration under the R6 dose adjustment; it never introduces a first-exposure or HIGH-eccentric configuration on the day before or the same day before the protected run.",
   "Under STRENGTH lead the long run's content may yield instead and a MAIN is not replaced for a run-protection reason; under JOINT a genuine equal-harm trade-off is asked once; under RUN lead strength keeps its essential stimulus (main lifts at goal or phase dose).",
   "The axial tie-break is an IMPLEMENTATION_CHOICE (plausible, not evidence-based): it only decides which of otherwise equal rows is reduced or replaced first and never creates a cost or score.",
   "Every kept MODERATE-or-higher cost and every content reduction is disclosed with its trade-off; a reduced lower-body dose is never presented as a recovery or injury-prevention measure.",
   "PROTECTED_RUN_STIMULUS_CONFLICT is governed by this record, not by R6-HYBRID-ARRANGEMENT."
  ],
  "approval_date": "2026-10-31",
  "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
  "owner": "Chief / Founder",
  "human_review": null,
  "re_review_triggers": [
   "Any byte change to the target catalog, schema, foundation or gap files",
   "Any change to R6-POLICY-5 or to the r12 envelope records",
   "A relevant new systematic review or meta-analysis",
   "V1 population, objective or scope change",
   "Adverse event or runtime inconsistency observed in a later gate",
   "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
  ]
 },
 {
  "queue_id": "HQ-R7B0-SSCTR-B0-C12",
  "decision_id": "R7B0-SSCTR-B0-C12",
  "decision_revision": "R7B0-SSCTR-r1",
  "target": {
   "project": "MyApp / Vilumo Fit",
   "artifact": "CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json",
   "artifact_revision": "R7B0-CATALOG-1",
   "sha256": "db8a253309a440ca6c9c2a53003e82e16e074aecfa1afae72bc59f35a440c5fe",
   "rule_ids": [
    "archetypes.items (5)",
    "archetypes.derivation",
    "archetypes.phaseLeads",
    "archetypes.overlaysNotArchetypes",
    "archetypes.temporaryPreference"
   ]
  },
  "approved_scope": "Lead derivation for arrangement ranking, protected stimuli, strength dose role and explanations; no dose.",
  "conditions": [
   "Archetypes are labels of the R6 goal-model lead only; they add no dose, no static priority flag and no new protection rule.",
   "A stated priority (ON-06 or temporary) resolves genuine trade-offs and same-shift order only; it never overrides event-phase leads or protections and is never required (DR-115).",
   "Overlays (event preparation, novice, returning) keep their own trajectories and conditions (B0-C01, B0-C08, R6-NONCLINICAL-RETURN, R6-EVENT-TRANSITION) and never change the base lead.",
   "Any change to the goal model, the lead derivation or the phase leads invalidates this record."
  ],
  "approval_date": "2026-10-31",
  "state": "QUEUED_FOR_FUNDED_HUMAN_REVALIDATION",
  "owner": "Chief / Founder",
  "human_review": null,
  "re_review_triggers": [
   "Any byte change to the target catalog, schema, foundation or gap files",
   "Any change to R6-POLICY-5 or to the r12 envelope records",
   "A relevant new systematic review or meta-analysis",
   "V1 population, objective or scope change",
   "Adverse event or runtime inconsistency observed in a later gate",
   "Funded qualified-human revalidation (may maintain, modify or revoke without AI veto)"
  ]
 }
]
```
## Narrow recheck (the one allowed)

Scope: B0-FIDELITY only. Confirm that M1-M4 appear exactly as specified in a new catalog revision, that no other catalog, schema, foundation or gap byte changed except the revision identifiers, and that the author validator still passes. No other decision is re-reviewed; all other records stand on this hash. If the recheck confirms M1-M4, the gate becomes ACCEPT_WITH_CONDITIONS. Note that every approval targets catalog hash `db8a2533…`; a revised catalog hash must be bound to these records and queue entries by the coordinator's closure record (the conditions are unchanged by M1-M4).

## Evidence access and limits

- **Access confirmed at start:** Europe PMC REST (search, core records, full-text XML) through Node 24 `fetch` worked; one 503 was caused by an unsupported `sort` parameter and disappeared without it. WebSearch and WebFetch were loaded but not needed. Queries, hit counts and use or exclusion are logged per record in `literature_snapshot.searches` (Q01-Q25 plus the R6 reuse and binding entries).
- **R6 evidence reused (request rule):** all 36 R6 full-text files re-verified by SHA-256 against `ssctr-evidence-manifest.r12.json` (36/36 match); the cited sections or abstracts were re-read this session; abstract-only R6 sources were re-read from the local abstracts files.
- **New full text read:** Ramskov 2018 Run Clever RCT (PMC5841490), Videbæk 2015 meta-analysis (PMC4473093), Lopes 2019 meta-analysis with its 2020 corrigendum (PMC6383082, PMC7485002), Haugen 2023 meta-analysis (PMC10426227), Kinoshita 2023 calf-raise study (PMC10753835; non-randomized within-subject design, recorded as OTHER_OBSERVATIONAL).
- **Abstract only, context, never decisive:** Ramskov 2018 (JOSPT), Fredette 2022 (full-text request failed, HTTP 500), Sabag 2018, Chang 2026 (retrieved, abstract read), Marcora & Bosio 2007, Pelland 2026, Mannarino 2021, Kassiano 2025 and 2026, Doma 2023, Tallis 2024, Bonilla 2022.
- **Excluded:** Barbalho 2020 (adding single-joint exercise) is retracted.
- **Null directed searches (logged, not proof of absence):** axial loading and subsequent running (Q22); introducing intensity to novice or walk/jog-graduated runners (Q23); strides in novices (Q24).
- **Dependent conclusions held to their evidence:** B0-C01 extrapolates from recreational runners with at least six months of running (confidence LOW); B0-C07 ladders have no direct evidence (confidence LOW); the CMP.P05 axial tie-break is an IMPLEMENTATION_CHOICE, not evidence; the muscle-counting convention stays descriptive. No GRADE rating was performed; this is a targeted appraisal. Downloaded files stayed in the session scratchpad; their SHA-256 values are in the source locators.

## Material findings outside the asked questions

1. **The B0-C01 comparator is inaccurate for strides.** The frozen runtime already makes strides eligible at walk/jog and restart exit (`src/r6-program.mjs` lines 206-207); only the quality graduation is new. The catalog's B0-C01 label on the strides half is harmless and is approved.
2. **Runtime residual for R7-B (R6 and R7-A not reopened):** optional strides apply only to class EASY_LOW or runExperience NOVICE (line 302), so a never-runner (experience NONE) who leaves walk/jog receives non-optional strides. B0-C01 condition 8 makes them optional; R7-B owns the binding.
3. **Bodyweight dose representation:** bodyweight configurations under LOAD-mode or low-repetition goals (for example the pull-up for a STRENGTH goal at 4-6 repetitions, or bodyweight calf and tibialis raises at 6-10 repetitions and RIR 3) cannot approach the prescribed reserve or progress inside the goal range while added load is LATER_GATE. B0-C03 condition 6 requires disclosure; suggested POLICY_BACKLOG item, not a B0 blocker.
4. **Minor metadata inconsistency:** the lateral deltoid is a primary muscle of `db-overhead-press` and a secondary muscle of `barbell-overhead-press`; no decision effect today. Optional fix at the next catalog revision.
5. **Navigation gap (non-scientific, coordinator-owned):** the B0 block of `CURRENT_MISSION.md` links `audits/domain-coaching-r7-b0-2026-10-31/CHECKPOINT.md`, which does not exist at this commit.

## Validation and record integrity

- Python is not installed, so `.agents/skills/sports-science-review/scripts/validate_records.py` **could not run**. Substitute, disclosed: Node 24 with the pinned `CoachingCore/node_modules/ajv/dist/2020.js` (draft 2020-12) against `governance/agents/sports-science-reviewer/decision.schema.json`, with `validateFormats: false` because `ajv-formats` is not installed, plus explicit date and URI checks; and a Node re-implementation of the helper's consistency checks (duplicate review, source and claim IDs; cross-record source identity; claim-to-source resolution; decisive claims backed by a verified, eligible full-text source and a strong evidence status; AE answers 1-10 exactly once; target file present with matching SHA-256; queue reference form). The 12 proposed queue entries were checked against a simulated in-memory append (decision ID and revision, target fields, verbatim conditions, state consistent with funding NOT_DECLARED, no ID collision with the 204 existing items). The helper's whole-queue check (every queue item linked to a record in the same file) is not meaningful for the shared 204-item queue and was not simulated.
- Result: 13 records, 0 errors. Negative controls: six invalid mutations (approval with a PLAUSIBLE status, approval without a queue reference, approval without an eligible full-text source, human credentials claimed, whole-gate closure, incomplete AE answers) were all rejected; the unmodified control was valid.
- The author validator was rerun read-only (no `--write`): 18/18. Record validation checks structure and links, not citation truth or scientific correctness.

## Boundaries and status

- Written: only this file and `SSCTR_REVIEW_B0.json`. No target, queue, policy, freeze, runtime, test, Figma or other file was edited; no `npm`, test or `verify-r*` script was run; `validate-b0.mjs` ran without `--write`. R6-POLICY-5 and the R7-A freeze are untouched and were not re-judged.
- Every record: gate status NOT_CLOSED_BY_THIS_RECORD, publication NOT_PUBLISHED, human validation, empirical product validation and clinical clearance false. Expiry 2027-04-30 or the first listed event trigger.
- Prescriptive approvals require the 12 queue entries above; funding is NOT_DECLARED, so their state is QUEUED_FOR_FUNDED_HUMAN_REVALIDATION. A future qualified human may maintain, modify or revoke any of them without AI veto. Pain, injury, illness, pathology and clearance stay CLINICAL_HUMAN_REQUIRED; unknown eligibility stays ASK.
- Reviewer: native project agent type `sports-science-concurrent-training-reviewer` (the instance prompt is the project adapter body, SHA-256 `021b5951…6c52d`), model inherited, no delegation, independent of the target author. Software reviewer only: no human credentials, clinical equivalence or runtime sovereignty.
