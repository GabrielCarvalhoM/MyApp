# Response to the SSCTR review of R6-POLICY-1

The runtime author's response to `reviews/ssctr-policy-review.json` (policy hash `81114d89…`). The reviewed policy is preserved as `PROGRAM_POLICY_R6.reviewed-81114d89.json` and the reviewed dossier outputs as `DEV_OUTPUTS.policy1-reviewed.json`. The policy is now **R6-POLICY-2**, canonical hash `1c5e3844b5e6dd8095b6d329d328d217a8633b0e4f7ca3660a96b6d50e745e8c` (amended once during the delta review, see "Amendment" below). Every record needs re-issue at this hash.

Evidence: the full suite passes 366/366 (`node --test` in `CoachingCore`); `test/r6-ssctr-revision.test.mjs` maps the remaining items to executable checks; your four probe scripts were re-run unchanged against the current runtime (copies with absolute imports, outputs in `revision-probes/*.rerun-policy2.out.json`; your own evidence files were not touched). `DEV_OUTPUTS.json` was regenerated at the new hash.

## Clinical boundary

| Item | Change | Where | Check |
|---|---|---|---|
| D08 | New shared screen `screenInterruptionReason`: structured `reasonCategory` first (clinical categories route regardless of flags); whole-word English and Portuguese clinical lexicon; explicit denials ("no pain or injury", "no clinical reason", "sem dor") are not mentions; ambiguous, unrecognized or missing reasons are ASK. Clinical routing runs before the authority check. | `src/r6-clinical.mjs`; `r6-adaptation.mjs` `returnAfterPause`; `r6-legacy.mjs` RETURN branch | P5: "Flu illness" and "Sick with a fever" (flagged nonclinical) → CLINICAL_HUMAN_REQUIRED; "Work travel, will resume" → REESTABLISH. Test "interruption reasons are screened…" |
| D22 | The intake pause uses the same screen (clinical → CLINICAL_HUMAN_REQUIRED; unclear → ASK `athlete.pause.reasonCategory`). A pause-driven restart needs R6-NONCLINICAL-RETURN. | `r6-intake.mjs` `canonicalizeIntake`; `r6-program.mjs` `assessCapability`, `generateProgram` | Probe-3 `INTAKE_PAUSE_NAMING_ILLNESS` → CLINICAL; probe-2 `RESTART_WITHOUT_RETURN_AUTHORITY` → UNSUPPORTED. Test D22. |
| C6 | Return eligibility must be assessed on or after the interruption end (default end: the day before the return review). | `returnAfterPause` | Test "return eligibility must postdate…" |

## Return

| Item | Change | Check |
|---|---|---|
| D09 | A demonstration counts only if it is a completed RUN of an EASY, LONG or RECOVERY_EASY family at conversational effort, with compatible response, ordinary function and NORMAL next-day function, observed after the interruption began and within the age limit. A valid demonstration is itself a completed run for the single-run ceiling. | P6: strength demonstration not used. Test D09. |
| D10 | Return step 2 prescribes the prior KNOWN load only after a post-interruption logged entry (`returnLogged`); otherwise FROM_LOG with the prior load as a ceiling. A return step advances only on executed, logged work. | P7: no KNOWN prior load before a post-interruption log, at 20 and 90 days. |
| D11 | EARNED is never issued in WALK_JOG, RESTART or RETURN modes; surplus counts only observations after the latest REESTABLISH decision. | Probe-2 `RETURN_WITH_EASIER_RESPONSES`: gates EASY ADVANCE, never EARNED. |

## Progression

| Item | Change | Check |
|---|---|---|
| D11/D12 | One step per dimension per week everywhere (`STEP.EARNED=1`); the two-iteration strength loop is gone; EARNED for a LOAD-mode lift releases the load tick, nothing more. | P4: walk/jog steps 1 per week. Test "repeated easier executions earn one step, never two". |
| D13 | Quality and strides unlock on `easyWeeksDone`, incremented only when the week's EASY and LONG gates are ADVANCE/EARNED outside establishment; stride repetitions grow with executed weeks. | P2: weeks 0–2 missed → no quality or strides in weeks 3–4. Test D13/D14. |
| D14 | Set increases at block boundaries are per exercise (`blocksDone`), counted only when that exercise's final block exposure was executed and gated ADVANCE/EARNED. | P3: no +1 set after five missed weeks. |
| D15 | Strength ADVANCE needs logged target reps with minimum logged RIR ≥ prescribed RIR − 1; EARNED needs ≥ prescribed RIR + 2 on two comparable exposures outside consolidation; unknown RIR holds. | P9: prescribed RIR 3, logged 1 → HOLD. |
| D16 | No KNOWN-load or bodyweight rep step without a logged set for that exercise in the gating week (`advanceStrength(…,{assumeLogged})`; only the conditional projection assumes planned logs). Missing logs hold, never regress. | P8: squat stays at 100 kg on completion flags. Test "completion flags alone never step strength". |
| D17 | Declared: `run.restart` (step 5, switch at 30, long offset 10, capped by the ceiling), `run.walkJogExit` (25 min, max 3 runs). | Test D17/D18 (restart trajectory within the ceiling). |
| D18 | Single-run ceiling (`run.singleRunCeiling`, 30 days, +5): every planned run except the race is capped at the longest completed run of the preceding 30 days plus one step. Reference = completed-work ledger (+ the intake-reported longest run while within 30 days, + a valid return demonstration); conditional projections count earlier projected weeks as executed; walk/jog counts jogging minutes; walks and walk/jog ladder sessions are not capped. With nothing completed in the window a reprojection starts from the reviewed entry. | Test D18 (entry when nothing completed); probe-2 restart trail. |
| D19 | The long-run share applies in every week with at least three running sessions; the long run is never reduced below the typical easy run (semantics declared in `run.longRunShareSemantics`). | P15 share ≤ 0.45 in every week of profile A. Test D19. |
| D20 | Declared `run.consolidationLongRunReductionSteps: 2`. | — |
| D21 | Week 1 reserves the familiar task's minutes inside the reported weekly running only when the task fits the week-1 ceiling (the longest current run); otherwise it waits a week. A final week-1 guard shortens easy runs, then holds the task, then keeps a walk. Week-1 rounding goes down; unknown exposure uses the reviewed entry for the long-run day as well. | Probe-2 `WEEK1_FAMILIAR_QUALITY`: profile E week 1 = 190 of 200; the 120-minute probe athlete now gets 120 in week 1 (it got 50 mid-revision before this fix). Test C5/C6/D21. |
| C8 | When the long run steps under a 50-minute reference, no other session grows that week, and the session says it is more than 10% above the longest recent run. | Test D19/C8. |

Also: after a familiar quality task the threshold ladder continues from the highest step the task covers (for example 4×5 → 5×5), instead of restarting at step 0.

## Run quality and event transition

| Item | Change | Check |
|---|---|---|
| D01 | Race-week touch requires R6-RUN-QUALITY and an executed quality session; shakeout strides require executed strides; otherwise easy. | P1: quality authority off → no touch or strides; probe-3 `TAPER_AFTER_ALL_QUALITY_MISSED` → easy-only taper and race week. |
| D02 | `reducedWork` works on total work minutes: fewer repetitions when that lands in 0.5–0.6, otherwise shorter repetitions; minimums declared (`event.reducedWorkMinimums`). 3×5 → 2×4 (0.53), 2×12 → 2×7 (0.58), 6×4 → 3×4 (0.50). Your P15 still reports a repetition ratio (0.67), which is no longer the governing quantity. | Test D01/D02/D03. |
| D03 | The run state records achieved (executed) peaks — long, easy, quality work, strides — updated only on ADVANCE/EARNED; taper and race week derive from them. | Probe-3 easy-only taper with zero executed quality. |
| D04 | A review on or after race day in RACE_WEEK or POST_EVENT, or before a NEXT_BLOCK week, needs eligibility dated on or after the race; otherwise ASK `eligibility.assessedOnOrAfterRace`. | P13 → ASK. Test D04. |
| D05 | The legacy path uses the athlete's event kind. | — |
| D06 | Legacy race-week quality becomes the event's `raceWeekTouch`, never more than the familiar task (`event.legacyRaceWeekQuality`). | — |
| D07 | Declared `event.nextBlock` (0.625 of achieved long, 0.7 of achieved easy, quality 3 steps back). | — |
| D31 | Strides are optional for EASY_LOW or novice runners, with the easy run as an equal alternative. | Test D31. |
| D32/D33 | Per-session semantics stated; race-day window and warm-up values, shakeout strides and kept-walk minutes declared. | — |

## Hybrid arrangement

| Item | Change | Check |
|---|---|---|
| D24 | An easy run within the same-session gap before MODERATE/HEAVY lower-body work costs strength LOW when strength has a development role (strength role not MAINTAIN). Equal options: least change, the athlete's template order, earliest quality day, then layout; options differing only in back-to-back order are marked `orderFlexible` ("either order") — no candidate identifier decides. | P11 now resolves by cost. Tests D24. |
| D25 | H1 is the sorted severity list (worst first); dominance and joint harm compare lists by leximax; counts are never used. Same-day pairs beyond the same-session gap are labelled "earlier the same day". The trace names the decisive comparison (C9): LOWEST_WORST_CASE_JOINT_HARM when joint harm removed options, PARETO_THEN_EQUIVALENT when only dominance did, EQUIVALENT_NO_TRADE_OFF only when nothing differed. | P12: the option without the moderate run cost is selected, basis LOWEST_WORST_CASE_JOINT_HARM. Test "severities compare worst first". |
| D26 | Legacy UNKNOWN_WITH_WEEKLY_TOLERANCE is admissible only with worst interference ≤ LOW and no same-day pairing (R5 inputs carry no routine, so any same-day pairing is treated as new). | Test D26 on R5-H21 (protect-strength inadmissible; protect-run kept). |
| C8 (cold start) | In the cold-start path every same-day pairing comes from the athlete's own chosen days and shifts; MODERATE+ costs are disclosed and ranked. Please say if you want the stricter rule there too. | — |

## Substitution, learning, rotation, establishment

| Item | Change | Check |
|---|---|---|
| D27 | An equipment change persists: permanent → athlete equipment and templates; temporary → a dated `equipmentWindows` entry used by every reprojection (`templatesForDate`). Only strength sessions from the review day on are re-projected; a new exercise starts with effort-guided establishment and is not progressed in its first exposure; after a window the originals return from their last logged load. | P10: dumbbells no longer return after the next review. Test D27. |
| D28 | Bound observations carry `mode` and `phaseClass`; RETURN/RESTART observations form their own class; gates pool by the week's class; surplus excludes consolidation weeks and counts from the last return; learned patterns and arrangement preference use build-class observations with the phase class in the query. | Tests (earned/learning). |
| D29 | Establishment instruction is an ascending ramp ("start with the lightest available load and add the smallest increment between preparatory sets while at least N reps stay in reserve…; the working load is the heaviest such load"); boundary claim reworded. | — |
| D23 | Without R6-LOAD-ESTABLISHMENT, templates use only exercises with a current known dose or bodyweight, and validation rejects any ESTABLISH or practice row. | Probe-2 `ESTABLISH_ROWS_WITHOUT_LOAD_AUTHORITY` → no ESTABLISH rows. |
| D30 | Rotation scope reconciled to accessories in the policy. An exercise unused for more than `return.moderateMaxDays` restarts effort-guided with its last load as a ceiling. | Test D30. |

## Other runtime changes since the first review

Recorded in `RUNTIME_BINDING.md` (change log). None alters a reviewed envelope value.

## Open question for the reviewer

None blocking. Two judgment calls are flagged for you: the cold-start reading of the unknown-arrangement rule (above) and treating unknown logged RIR as HOLD rather than ADVANCE.

## Amendment during the delta review (hash a7570f2e… → 1c5e3844…)

A coach's-eye pass over the generated programs showed the long-run share cap making the long run oscillate: when the ladder moves from a longer quality session (5×5, 48 min) to a shorter one (3×8, 43 min), weekly minutes fall and the cap shortened the long run (profile C: 70 → 65), and in profile A a consolidation week carried a longer long run than the build week before it because the state kept stepping behind the cap. Two changes:

- `run.longRunShareSemantics` now says the cap holds the long run and never shortens it: never below the typical easy run, nor below the long run of the last build week (consolidation skipped, reset across an event transition). The share can exceed 0.45 by the margin of a shorter quality session in such a week.
- When a cap (single-run ceiling or share) trimmed a week's run, the next step starts from what was prescribed, not from the untrimmed state (`advanceRun`, non-consolidation weeks only).

Profile A long runs are now 60, 60, 65, 65, (60), 70, 75, 75, (70), 75, 80, 80, 85, taper 55; profile C 50, 55, 60, (55), 65, 70, 70, (65), 70, 75, 75, (65). Test D19/C8 asserts both rules. Policy file SHA-256 `880d3869ce9b9c1a6e512709797b7000c6fa9099f152145600a77a4fb9fdf90c`; `DEV_OUTPUTS.json` and the probe reruns were regenerated.

## Further runtime-only fixes during the delta review (policy hash unchanged, `1c5e3844…`)

A randomized self-check (three seeds × 300 interface-shaped athletes, generation plus a simulated season each; script in the session scratchpad) found one defect: at the RESTART → EASY switch every chosen run day became a run at once (5 × 30 = 150 minutes after a 75-minute week). Now running days stay at the restart frequency (`establishment.maxWalkJogDaysPerWeek`), the other chosen days keep walks, and they return one at a time at block starts (`advanceRun` RESTART branch). Test D17 (restart to easy). The simulator's runaway-volume invariant now skips race week and the post-event week (they follow the event envelope) instead of misreading the race week as a drop. After both, the self-check reports no violation of week 1, single-run ceiling, one step per week or simulator invariants, and no crash.

## Round 2 response (hash 1c5e3844… → 983171ac…)

Policy canonical hash `983171acc6e99550bb9cfe2029c518b64913c21825bd2be545b812486a5c0a49`, file SHA-256 `fd8b85c092de2eb1f1f886e9425190f5670ee24526872bc69ff418ea9d73a5e6`. Suite 370/370. Your round-2 probes were re-run through copies; outputs `revision-probes/*.rerun-policy2r2.out.json` (your files untouched).

| Item | Change | Check |
|---|---|---|
| D34 | `src/r6-clinical.mjs`: free text is split into clauses at punctuation, dashes, slashes and but/however/although/mas/porém/entretanto/pero/aunque/sin embargo **before** normalizing; a denial covers the clinical words it governs and further ones only across or/nor (ou/nem, o/ni) — deliberately stricter than "and" absorption, so "no pain and injured knee" stays clinical. | Your SCREEN battery: every phrase naming a clinical cause → CLINICAL; "No pain or injury, work travel" and "Work travel, will resume Monday" → NONCLINICAL. INTAKE_E2E and the return end-to-end: clinical phrases → CLINICAL_HUMAN_REQUIRED. Test D34/D35. |
| D35 | Spanish clinical, ambiguous (body parts, fatigue, salud, personales) and nonclinical lists, including verb forms (lesioné, me torcí, me enfermé, me duele), plus "accident/acidente/accidente". `operational.return.reasonScreen` names English, Portuguese and Spanish and states the clause and denial rules. | Spanish phrases in your battery → CLINICAL; "Viaje de trabajo, sin dolor" → NONCLINICAL. |
| D36 | Bound observations carry `doseKey` (quality: family:ladder:step; other runs: family; strength: planned prescription hash). The `rebuild` arrangement-preference query uses sessionType, phaseClass and the current quality session's doseKey, and makes no query without a current quality dose. Policy `learning.pooling.arrangementPreferenceQuery` updated. | Test D36. |
| D37 | `arrangementDisclosures`: a selected arrangement keeping a MODERATE or higher cost adds an `ARRANGEMENT_COST_DISCLOSED` negotiation item naming the costs, with options keep / swap shifts / move one session to another chosen day — at cold start (`generateProgram`) and after any re-arrangement (`rebuild`, which also returns `disclosures` and replaces stale items for re-planned contexts). Policy `hybridSemantics.disclosure`. | Test D37 (AM heavy lower-body strength before PM key runs on every run day). |

Your recommendations R1–R3 are recorded as open items for the product: asking for reserve on an exercise whose RIR was not logged (and the optional ADVANCE after two such sessions, never EARNED), collecting the structured reason category in the product, and stricter free-text acceptance. "My mother was ill, I was caring for her" still routes to a human (a false positive in the safe direction).

## Round 3 response (hash 983171ac… → d766f0d9…)

Policy canonical hash `d766f0d95bf7982c1c128acddb79427ccb819a8f992bffbd64b4fbb3dbf4fcf8`, file SHA-256 `c965e2d2c482cd9e71707fc441b1a2ac62667a314c452248a237dc7d942d94c0`; only `operational.return.reasonScreen` changed. Runtime changes are confined to `src/r6-clinical.mjs` plus one line in `src/r6-legacy.mjs`. Suite 371/371.

| Item | Change | Check |
|---|---|---|
| D38 | A denial is honoured only while no earlier unconsumed negation or inability word in the same clause makes it an affirmation (not, no, never, cannot, can't, couldn't, didn't, unable, impossible; não, nunca, jamais, impossível; jamás, imposible, ni, nada…). A negation consumed as a denial does not block the next one ("no pain and no injury" stays a double denial). | Your round-3 battery: every double-negation phrase → CLINICAL with or without a TRAVEL category; end-to-end return and 2-week intake pause → CLINICAL_HUMAN_REQUIRED. Test D38/D39. |
| D39 | Falls are ambiguous in all three languages: fell, fall, tripped; caí, caiu, tombo, tropecei, levei um tombo, tive uma queda; me caí, caída, tropecé, tuve una caída. | "Caí na viagem", "Me caí en el viaje", "I fell on the trip" → ASK. |
| R3 (adopted) | Free text alone never confirms a nonclinical break: without a structured nonclinical category the screen asks for it (`CATEGORY_REQUIRED`); text can only add CLINICAL or ASK. In the legacy R5 contract the structured answer is `clinicalReason=false`, mapped to `OTHER_NONCLINICAL`, so R5 H16 still re-establishes while its free text is still screened. Fixtures and tests now give a structured category, as the product would collect it; the holdout interface says so. | Battery: legitimate denials → NONCLINICAL with a category, ASK without. |

Your `ssctr-probe-binding-2.mjs` now stops at RETURN_WITH_EASIER_RESPONSES because its return review gives free text only ("Work travel") and gets ASK, which is the R3 behaviour; a copy with `reasonCategory:'WORK'` added reproduces the intended trail (`revision-probes/ssctr-probe-binding-2.with-reason-category.rerun-policy2r3.out.json`). All other probes, including `ssctr-probe-delta-policy2-r3.mjs` (SCREEN_FAILURES empty), were re-run unchanged: `revision-probes/*.rerun-policy2r3.out.json`.

## Round 4 follow-up before freeze (hash d766f0d9… → f9f89b7f…)

You approved all ten at `d766f0d9…` and offered a quick check if D40 were applied before freezing; it is. Policy canonical hash `f9f89b7f6f49c4946332dc7447eeaea9477308a777cabfd7bab38f1627c977ac`, file SHA-256 `f4c7e05354b745c5f72b5a9e322b043e2bc235dfbe9e830f809fad6d9de6f030`; only `operational.return.reasonScreen` changed. Runtime change confined to `src/r6-clinical.mjs`. Suite 372/372.

| Item | Change | Check |
|---|---|---|
| D40 | A without/sem/sin denial counts only at the start of its clause; mid-clause it leaves an ambiguity marker and the screen asks ("It was hard to run without pain", "Struggled to run without pain on the trip", "Apenas conseguia correr sem dor", "Viagem de trabalho e sem dor"). | Your r4 RESIDUAL list now reads ASK for all three. Test D40/R4. |
| R4 | nothing/nada are negators: "nothing clinical, just a busy month" with a WORK category → NONCLINICAL. | Test D40/R4. |
| Negated perception or possession verbs | A negation followed by feel/have/get/notice (sentir, ter; sentir, tener) and a clinical word is a denial: "Didn't feel any pain", "Não senti dor nenhuma", "No tuve dolor, solo trabajo", "Never had any injury" → NONCLINICAL with a category. The affirmation pattern (negation or inability + an action verb + without/sem/sin) stays CLINICAL ("Didn't manage to run without pain"). "Didn't feel well", "Não me senti bem", "No me sentí bien" are ambiguous and asked. | Your r4 SCREEN_FAILURES lists only "Didn't feel any pain [WORK] -> NONCLINICAL": that is this deliberate change (your probe expected the earlier conservative CLINICAL). Test D40/R4. |

All earlier probes re-run unchanged (`revision-probes/*.rerun-policy2r4.out.json`; probe 2 through its with-category copy).

## Round 5 follow-up before freeze (hash f9f89b7f… → af2779fe…)

D41 applied: no denial counts in a clause that also carries a time or contrast condition (until, till, before, after, except, unless, only when; até, antes, depois, exceto, salvo, só quando; hasta, antes, después, excepto, salvo, solo cuando); the screen asks instead. "Didn't feel any pain until I tried to run", "Never had any injury before this trip", "Não senti dor até voltar a correr", "No tuve dolor hasta que corrí", "Didn't have pain except when running" → ASK; clause-initial denials with a category stay NONCLINICAL ("No pain, only work travel", "Sem dor, só trabalho", "Sin dolor, solo trabajo", "Without pain, just travel"). Policy canonical hash `af2779fe0fc0e0a52f4b6371d3b360996687e57931b9b3feb878e9652f464910`, file SHA-256 `c855cde0de47eaf3a7715705e592f802b3adafedde89b6f63a9989d2caa02998`; only `operational.return.reasonScreen` changed; runtime change confined to `src/r6-clinical.mjs`. Suite 373/373. All probes re-run (`revision-probes/*.rerun-policy2r5.out.json`). After this check the runtime is frozen; further lexical residuals of the free-text screen are recorded as open gaps, since the structured category and current eligibility answers are the primary defence.
