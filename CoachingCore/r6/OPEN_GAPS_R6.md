# Open gaps — R6

R6 closes with an explicit blocker. The SSCTR refused FREEZE-2 in round 12, the last round the Founder allowed (`../../audits/domain-coaching-r6-2026-10-26/FOUNDER_LOOP_BOUND.md`). Scope: offline synthetic Node 24 reference only. Machine-readable version: `OPEN_GAPS_R6.json`.

## R7 entry

1. Fix **D53** for every state mode and **D54**, in the runtime, without a policy change.
2. A narrow SSCTR runtime check at hash 18ec48f3 (or a full delta review of a new hash if the policy changes).
3. FREEZE-2 or its R7 successor, then the independent engineering re-review.
4. R18 (with Product/Data) before any use beyond the offline reference.
5. A fresh unseen holdout for R7 evidence; the R6 corpus can only be challenge reuse.

R7 is not started by R6; it needs its own Founder-authorized mission definition.

## Blocker (R6 closes on it)

- **BLOCKER-D53** — D53, from-log path: sets after a re-establishment of a pending or unlogged exercise come back two at once *(required before: freeze)*. Owner: ENGINEERING (R7 runtime author) with the SSCTR.
  D53 (R6-LOAD-ESTABLISHMENT, shared with R6-PLANNED-PROGRESSION and R6-ROTATION; found in round 11; fixed in round 12 for a known-load state only) r6-program.mjs advanceStrength: the regain cap (regainCap) is set only in the branch that converts a known-load state (reestablishes(ex,u) requires ex.mode === 'KNOWN'). strengthDose prescribes the same "Not done for more than 28 days" row for a from-log state, that is an exercise whose establishment log is still pending confirmation or that was performed without a usable log, and that re-establishment starts no regain, so a block-boundary set comes back at once. Probe AI, noisy-log grid (192 timelines in which the establishment logs of exercises without a known dose alternate 20 and 40 kg, so they stay pending as D45 intends): 592 of 1,224 performed re-establishments start from a from-log state, and 48 next exposures exceed the allowance: 24 a… (full text in the JSON)
- **BLOCKER-D54** — D54: a re-establishment row ignores the taper, race-week and post-event strength doses *(required before: freeze)*. Owner: ENGINEERING (R7 runtime author) with the SSCTR.
  D54 (R6-EVENT-TRANSITION and R6-LOAD-ESTABLISHMENT; found in round 12; the row predates FREEZE-1 and became reachable in ordinary use with the D52 (B) fix) r6-program.mjs strengthDose: the re-establishment row of an exercise not performed for more than return.moderateMaxDays (min(goal sets, 2) sets at RIR >= 3, effort-guided under the earlier load) is returned before the phase reduction is computed, so it ignores the taper, race-week and post-event doses, while the first-establishment and "No usable load" rows take the reduced count. Probe AK (10K and half marathon in week 13 of 16; goals STRENGTH, RUNNING_SUPPORT and GENERAL; strength missed in the five weeks before each phase; compared with a twin executed throughout) finds 70 re-establishment rows above the phase dose of the same exercise on the same date: 18 in race week, 6 days before the race (main lifts at 2 sets at RIR 3 against … (full text in the JSON)
- **BLOCKER-FREEZE-2** — FREEZE-2 refused: the fixed runtime is not frozen *(required before: freeze)*. Owner: ENGINEERING with the SSCTR; the Founder bound (FOUNDER_LOOP_BOUND.md).
  SSCTR round 12 (R6-SSCTR-POLICY-r12) set freezeVerdict.runtimeMayBeFrozen=false with D53 and D54 blocking. It was the last round under the Founder bound, so R6 closes with this blocker. The SSCTR next step: "In R7: fix D53 for every state mode and D54 in the runtime, without a policy change, with the regression tests listed per item; then a narrow runtime delta check at hash 18ec48f3... (a policy text change would need a delta binding review of the new hash). FREEZE-2 cannot follow from this round."

## Steps not run (they need FREEZE-2)

- **NOT-RUN-POSTFIX** — Post-fix rerun of the sealed holdout *(required before: r7 evidence)*. Owner: R7.
  evaluate-holdout-r6-postfix.mjs runs only on FREEZE-2. The first evaluation (FREEZE-1) stays the only R6 holdout record.
- **NOT-RUN-ENGINEERING-REREVIEW** — Independent engineering re-review *(required before: r7 evidence)*. Owner: R7.
  The FREEZE-1 engineering review failed with 23 findings (QRE-R6-01…23). They are fixed in the unfrozen runtime and pinned by r6-engineering-fixes.test.mjs, but no independent re-review ran, because there is no FREEZE-2 to review.
- **NOT-RUN-R5-RECLASSIFICATION** — R5 regression reclassification *(required before: r7 evidence)*. Owner: R7.
  The official R5 replay and its independent classification are the FREEZE-1 ones. The development replay of the current runtime differs from them in 8 cases (H01, H07, H08, H10, H12, H14, H17, H22), only in the race-day warm-up line (SSCTR D43(c)); those cases are not reclassified.
- **NOT-RUN-OFFICIAL-OUTPUTS** — Official outputs of the current runtime *(required before: r7 evidence)*. Owner: R7.
  The official simulation, demonstration and R5 replay outputs stay FREEZE-1’s. The current runtime has development outputs only (*.dev.json, dev authority).

## SSCTR open items

- **SSCTR-R18** — R18: (owned gap, required before any use beyond the offline reference; not a FREEZE-2… *(required before: use beyond offline reference)*. Owner: ENGINEERING with PRODUCT/DATA (G03).
  R18 (owned gap, required before any use beyond the offline reference; not a FREEZE-2 blocker): a week that receives no gating review must never count as executed: no establishment, progression, block credit, achieved peak or resume-clock credit from it. Today the next review starts from the projection (probe AF: a back squat at 87.5 kg, 4x5, 49 days after 82.5 kg was last lifted). Engineering chooses the mechanism (catch-up from the completed-work ledger with unreported sessions as missed, refusing a review whose earlier weeks are unreviewed, or both), with Product/Data owning how the athlete is asked about an absence (G03).
- **SSCTR-R11** — R11: adopted in round 9 (round-8 lexical residuals). Still open, with Product/Data: ask… *(required before: use beyond offline reference)*. Owner: PRODUCT/DATA with the SSCTR.
  R11 adopted in round 9 (round-8 lexical residuals). Still open, with Product/Data: ask pregnancy and postpartum status again at reviews and returns in the structured intake design.
- **SSCTR-R15** — R15: (owned gap): the R11 damage verbs and body parts create conservative false positives… *(required before: use beyond offline reference)*. Owner: ENGINEERING with the SSCTR.
  R15 (owned gap): the R11 damage verbs and body parts create conservative false positives: "cut back"/"cut down" with back routes CLINICAL, and idioms with face or eye are asked. Treat "cut back" and "cut down" as nonclinical phrases and the idioms as phrases, before any use beyond the offline reference.
- **SSCTR-R14** — R14: (open gap tied to G03; dossier Q3): the race-week item can read "no continuous run yet"… *(required before: use beyond offline reference)*. Owner: ENGINEERING with the SSCTR.
  R14 (open gap tied to G03; dossier Q3): the race-week item can read "no continuous run yet" after executed restart runs when the only post-restart week is a re-entry week whose gate held (probe V). State the executed post-restart runs in that case; close it with the G03 classification of sessions inside a declared pause, before any use beyond the offline reference.
- **SSCTR-R1** — R1: (non-blocking, coaching quality): when a strength step holds only because RIR was not…. Owner: ENGINEERING with the SSCTR.
  R1 (non-blocking, coaching quality): when a strength step holds only because RIR was not logged, the next session should explicitly ask for reps in reserve on that exercise; a reviewed option is one ADVANCE after two consecutive exposures with target reps met at the planned load and no RIR, never EARNED.
- **SSCTR-R2** — R2: (non-blocking): collect the structured reasonCategory in the product; free text then only…. Owner: PRODUCT/DATA with the SSCTR.
  R2 (non-blocking): collect the structured reasonCategory in the product; free text then only adds CLINICAL or ASK. A FAMILY-category reason whose text says a relative was ill currently routes CLINICAL (conservative false positive).
- **SSCTR-R5** — R5: (non-blocking, open): ask the athlete to confirm a logged load far below the plan. The…. Owner: PRODUCT/DATA with the SSCTR.
  R5 (non-blocking, open): ask the athlete to confirm a logged load far below the plan. The numeric threshold is Data-owned.
- **SSCTR-R8** — R8: (non-blocking, open): when a completion race day applies, collect the athlete's…. Owner: ENGINEERING with the SSCTR.
  R8 (non-blocking, open): when a completion race day applies, collect the athlete's keep-or-change choice before the race window.
- **SSCTR-R9** — R9: (non-blocking, open): for EASY-class racers whose achieved long run is far below the…. Owner: ENGINEERING with the SSCTR.
  R9 (non-blocking, open): for EASY-class racers whose achieved long run is far below the race, default to completion pacing; for walk/jog- or restart-built racers, any exemption from the history-based completion must be keyed on executed continuous running relative to the event (for example the event's declared long-run target), declared in the policy and reviewed first (dossier Q5).
- **SSCTR-R16** — R16: (non-blocking, next policy revision with a full delta review; dossier Q4): keep the long… *(required before: next policy revision)*. Owner: ENGINEERING with the SSCTR.
  R16 (non-blocking, next policy revision with a full delta review; dossier Q4): keep the long run at least as long as the week's easy runs in consolidation weeks and in the first cold-start weeks (extending the R10 floor), and plan no new easy level and no walk conversion into a consolidation week, so that its total running falls.
- **SSCTR-R17** — R17: (non-blocking, next policy revision; amended in rounds 11 and 12): declare (a) the… *(required before: next policy revision)*. Owner: ENGINEERING with the SSCTR.
  R17 (non-blocking, next policy revision; amended in rounds 11 and 12): declare (a) the bodyweight case of strength.resumeAfterDays (today a bodyweight exercise not performed for more than return.moderateMaxDays resumes its earlier set count at RIR >= 3); (b) how an exercise first performed during a return is dosed (today the return-entry dose while any exercise in use is at the entry step, otherwise normal establishment and normal progression); (c) whether a development block whose only executed exposure of an exercise was its establishment or re-establishment earns a block-boundary set (today it does, by the final-exposure rule of setIncreaseAtBlockBoundary; probe AI: a first establishment of 1 set in a block-end consolidation week is followed by 3 sets in 24 of 2,688 cases); (d) whether the review of a re-establishment may also take a load or repetition step, and whether such a step ma… (full text in the JSON)
- **SSCTR-R19** — R19: (non-blocking, next runtime revision; dossier Q4; amended in round 12): in a week whose… *(required before: next runtime revision)*. Owner: ENGINEERING with the SSCTR.
  R19 (non-blocking, next runtime revision; dossier Q4; amended in round 12): in a week whose earlier session prescribes an exercise at its known load and a later one re-establishes it, word the later row so that it does not assert that the exercise was not done (for example "as of the last review"), and let the conversion at the review, and since the D53 fix the regain cap, follow the exposure that was executed rather than the last prescribed entry (probe AM: after a performed 3x10 at the known load and a missed later re-establishment the next week is 2x10).

## Owned gaps

- **CLINICAL-SCREEN** — The free-text interruption screen is a heuristic *(required before: use beyond offline reference)*. Owner: PRODUCT/DATA with the SSCTR.
  A lexicon screen that only adds CLINICAL or ASK outcomes. Re-review it with its regression battery and the structured intake design before production, KMP or real athletes: asking pregnancy and postpartum status again at reviews and returns (the rest of R11), and the conservative false positives of R15 ("cut back", "cut down", face and eye idioms).

## Coaching-quality judge findings

- **JUDGE-CQ-R6-01** — [HIGH] Cold-start evidence fusion between wearable history and self-report fails in both directions *(required before: kmp prep)*. Owner: COACHING (R7).
  R6-H01: FULL completeness with 8 declared weeks but rows covering 10 days is read as 77 min/week over 1.5 days for a 210-min runner. R6-H07: PARTIAL history (95-127 min) is overridden by the 200-min self-report while the uncertainty text claims the lower exposure is used. Counterfactual: H01 with 8 consistent weeks gives a sound program. Cases: R6-H01, R6-H07. Later change: OPEN: no documented change; a synthetic thin-history probe on the current unfrozen runtime reproduces the H01 reading (75 min/week, long 30, peak 40)..
- **JUDGE-CQ-R6-02** — [HIGH] Progression stalls: long-run and easy-run trajectories go flat or never build *(required before: kmp prep)*. Owner: COACHING (R7).
  R6-H01 easy 15 / long 30-35 for 14 weeks; R6-H34 HM long 80-85 and flat weekly volume for 14 weeks (engine's own horizon: peak 85 vs target 105); R6-H27 plateau at 105 min and a 45-min long run from week 7; R6-H09 long run cut below current and flat; R6-H03 no Sunday progression; R6-H04 long run flat at 105. Cases: R6-H01, R6-H34, R6-H27, R6-H09, R6-H03, R6-H04. Later change: PARTLY: D50 (share-cap holds no longer consume the week's increase; author probe S: 47 of 66 programs with 4+ flat build weeks to 0). Not verifiable on this holdout; the synthetic thin-history HM on the current runtime still peaks at 40 min..
- **JUDGE-CQ-R6-03** — [HIGH] DOUBLE_CONFLICT: a one-day turn conflict becomes a permanent same-turn stack and the conflict date is not resolved *(required before: kmp prep)*. Owner: COACHING (R7).
  R6-H23 S1 with changes {strengthTurn:AM, sameTurnConfirmed:false, from=to=one Tuesday}: the conflict evening keeps its strength session; every later Tuesday stacks strength and the run in the same morning; quality moves to Thursday. Reproduced by a synthetic probe on the FREEZE-1 reconstruction and on the current unfrozen runtime. Cases: R6-H23. Later change: OPEN: QRE-R6-08 adds schedule-change validation only..
- **JUDGE-CQ-R6-04** — [HIGH] Replan and rearrangement paths read unreviewed weeks as zero exposure and collapse running before a race (R18-conditioned) *(required before: kmp prep)*. Owner: COACHING (R7).
  R6-H25 S2: 15-25-min runs for the four weeks before a 10K; R6-H23 S1: 45-50 min/week for weeks 5-9. The projection assumes those weeks were executed (R18), the replan assumes nothing was. With the skipped weekly reviews supplied on the reconstruction neither collapse occurs. Cases: R6-H25, R6-H23. Later change: OPEN: R18 is an owned gap (Engineering with Product/Data); the QRE-R6-09 single-run ceiling change applies the 15-min entry in every projected week when the 30-day window is empty, which points the same way..
- **JUDGE-CQ-R6-05** — [HIGH] A program is PROPOSED although the engine records that it cannot prepare the goal, with no negotiation *(required before: kmp prep)*. Owner: COACHING (R7).
  R6-H01: LONG_RUN_PEAK_BELOW_TARGET (35 of 105, materialToGoal) and requestedScopeSatisfied=false, negotiation empty, then a 150-min race; R6-H03: '0 of 70' marked not material. Cases: R6-H01, R6-H03. Later change: PARTLY: D43/D47 build EVENT_AMBITIOUS_FOR_CURRENT_RUNNING with what the plan reaches (present in the synthetic current probe) but it stays non-blocking (R8 open)..
- **JUDGE-CQ-R6-06** — [HIGH] Race day prescribed at race effort with strides for athletes whose plan built only walk/jog or a restart (safety-relevant) *(required before: kmp prep)*. Owner: COACHING (R7).
  R6-H03 never-runner, longest continuous 20 min, races 10K at 7-8/10 with warm-up strides never trained; R6-H27 restart athlete likewise; both carry a 'completion with walk breaks' item that contradicts the prescription. Cases: R6-H03, R6-H27. Later change: ADDRESSED_PER_DOSSIER: D43(c) and D47 (race-day completion basis, strides only after executed strides). Cannot be verified on this holdout..
- **JUDGE-CQ-R6-07** — [MEDIUM] Load convention: a goblet squat reported as 20 kg TOTAL is prescribed as 20 kg PER_HAND; self-reported known loads are dropped when wearable strength rows exist. Owner: COACHING (R7).
  R6-H07 week 0 goblet-squat KNOWN 20 kg PER_HAND (self-report TOTAL); db-row and db-rdl re-established. A synthetic probe on both runtimes labels a goblet squat PER_HAND. Cases: R6-H07. Later change: UNCLEAR: QRE-R6-01 (R6-POLICY-3 item 4) refuses convention mismatches in logs; the intake merge and the goblet-squat convention are still PER_HAND on the current runtime (synthetic)..
- **JUDGE-CQ-R6-08** — [MEDIUM] Hybrid arrangement places loaded lower-body work just before the long run without disclosure. Owner: COACHING (R7).
  R6-H01 RDL and split squats every Saturday evening before the Sunday long run; R6-H16 heavy RDL 3x5 at 120 kg immediately before the Saturday long run in the same session (build weeks); R6-H22 S3 full-body RDL session moved onto the eve of the long run after a schedule change. Cases: R6-H01, R6-H16, R6-H22. Later change: OPEN: no documented change..
- **JUDGE-CQ-R6-09** — [MEDIUM] Known current doses are under-used at cold start. Owner: COACHING (R7).
  R6-H08 push-ups 2x8 against a current 3x20, RIR 3 throughout for experienced bodyweight hypertrophy; R6-H04 HM-specific work below the current 2x20 and one key session instead of two; R6-H02 walk/jog for a continuous 25-min jogger. Cases: R6-H08, R6-H04, R6-H02. Later change: OPEN: no documented change (D42 applies to non-novice walk/jog starts only)..
- **JUDGE-CQ-R6-10** — [MEDIUM] Availability treated as prescription for strength in a novice. Owner: COACHING (R7).
  R6-H05: four strength sessions plus three walk/jog sessions required, three double days, for a 52-year-old novice; run days were correctly reduced. Cases: R6-H05. Later change: OPEN..
- **JUDGE-CQ-R6-11** — [MEDIUM] Bodyweight repetitions collapse after a gated review. Owner: COACHING (R7).
  18 step proposals reduce bodyweight repetitions for the rest of the plan under ADVANCE gates (R6-H17 S2 push-up 3x14 to 3x6, dead-bug 14 to 6; R6-H22, R6-H24, R6-H26, R6-H31-35). Cases: R6-H17, R6-H19, R6-H20, R6-H22, R6-H23, R6-H24, R6-H25, R6-H26, R6-H31, R6-H32, R6-H33, R6-H34, R6-H35. Later change: PROBABLY (undocumented): a synthetic probe reproduces it on the FREEZE-1 reconstruction (dead-bug 1x12 to 1x6) but not on the current unfrozen runtime (1x12 kept), consistent with the D52 strength-state rework. No dossier names it; not verifiable on this holdout..
- **JUDGE-CQ-R6-12** — [MEDIUM] PULL pattern: the bodyweight pull option is never selected and the 'PULL unavailable' note is unreliable. Owner: COACHING (R7).
  R6-H06 12 weeks without any pull exercise (prone-row-practice is BODYWEIGHT); R6-H24 substitution window without pull; R6-H05 and R6-H08 show 'PULL unavailable' while db-row or band-row is programmed. Cases: R6-H06, R6-H24, R6-H05, R6-H08. Later change: OPEN: the synthetic kettlebell/bodyweight probe on the current runtime still programs no pull..
- **JUDGE-CQ-R6-13** — [MEDIUM] Correction chains and race records lose or downgrade executed work. Owner: COACHING (R7).
  R6-H32 S2 correction rejected as INVALID_CORRECTION_CHAIN; R6-H30 S5 an accepted correction is excluded and the race row disappears from the carried ledger; races finished faster than the planned duration are recorded PARTIAL and non-comparable (R6-H29, R6-H30; synthetic current probe still PARTIAL). Cases: R6-H32, R6-H30, R6-H29. Later change: Corrections: PLAUSIBLY by R6-POLICY-3 item 8 (QRE-R6-13/14: append-only record, a correction resolves a conflict), UNCLEAR. Race PARTIAL: OPEN..
- **JUDGE-CQ-R6-14** — [MEDIUM] Athlete Model is inert on the holdout. Owner: COACHING (R7).
  In all three consent cases no learned pattern changed a decision; R6-H34's three identical long-run responses produce gate holds and a regress but nothing athlete-specific; the model's pattern scope is arrangement only (FREEZE-1 r6-adaptation LEARNED_REARRANGEMENT). Cases: R6-H34, R6-H35, R6-H20. Later change: OPEN (design scope; QRE-R6-16 consent fix does not add learning)..
- **JUDGE-CQ-R6-15** — [MEDIUM] Two-goal, three-evening athlete gets unconfirmed stacking, JOINT priority and poor session order. Owner: COACHING (R7).
  R6-H16: run plus strength on all three evenings with a non-blocking order question, no explicit 10K priority until SPECIFIC, heavy hinge before the long run, heavy squat after quality, a working-load squat triple four days before the race. Cases: R6-H16. Later change: OPEN..
- **JUDGE-CQ-R6-16** — [LOW] No mid-week response or check-in to a third adverse key session with impaired next-day function. Owner: COACHING (R7).
  R6-H19 S4 KEEP; the counterfactual shows the skipped week-5 weekly review would have regressed quality (R18). Cases: R6-H19. Later change: OPEN (residual; R18)..
- **JUDGE-CQ-R6-17** — [LOW] Time-goal realism is never communicated. Owner: COACHING (R7).
  R6-H09 50:00 against an anchor predicting about 65; R6-H04 88:00; R6-H16 45:00: only 'time goal is context only'. Cases: R6-H09, R6-H04, R6-H16, R6-H26. Later change: OPEN..
- **JUDGE-CQ-R6-18** — [LOW] Stated emphasis preferences not carried into the dose. Owner: COACHING (R7).
  R6-H02 squat emphasis (squat once a week, hinge twice); R6-H08 upper emphasis (lower sets about equal). Cases: R6-H02, R6-H08. Later change: OPEN..
- **JUDGE-CQ-R6-19** — [LOW] Small communication and record defects. Owner: COACHING (R7).
  R6-H15 no trade-off or temporary-priority explanation; R6-H13 no obstetric routing in the UNSUPPORTED reason; R6-H22 S2 long-run hold after an executed (moved) long run; R6-H17 a missed session recorded with ledger status PARTIAL; R6-H21 S2 long run not reduced under systemic fatigue and no check-in. Cases: R6-H15, R6-H13, R6-H22, R6-H17, R6-H21. Later change: OPEN..

## Product and Data questions

- **G03** — G03: how sessions dated inside a declared pause count; whether missed sessions without a declared pause should prompt for a reason. Owner: PRODUCT/DATA.
  Owned by Product/Data. It also decides completion semantics for reports without details (dossier Q2) and the R18 mechanism.
- **ROTATION-CLOSE-VARIANTS** — Rotation of close variants of main lifts: the Founder’s OB-2 decision against the SSCTR condition that R6 does not rotate them. Owner: PRODUCT.
- **LEARNING-CONSENT-SCOPE** — The privacy scope of learning consent. Owner: DATA.
- **LOGGED-LOAD-PLAUSIBILITY** — Numeric plausibility of logged loads inside 0–500 kg (including a load far below the plan, R5). Owner: DATA.
- **POUND-DISPLAY** — Pound display and pound increments (product decision DR-114). Owner: PRODUCT.
- **KNOWN-DOSE-OBSERVED-AT** — observedAt of a known dose must be the date it was last performed, with the possible one-day timezone offset (dossier Q3). Owner: DATA.

## Known limits

- **D49-LIMITS** — D49 limits on sets after a return *(required before: next policy revision)*. Owner: COACHING/SSCTR.
  Sets come back one per executed unreduced week, and a block with any return exposure earns no set, so the boundary set can wait a block.

## Earlier findings

- **R5-FINDINGS** — R5 regression findings still open. Owner: COACHING.
  F-LEGACY-FLAT, F-H18, F-H21, F-H13, F-H16 and F-H06 from the independent R5 regression review (F-H24 is resolved by the append-only conflict record).
- **HOLDOUT-INTERFACE-GAPS** — The holdout author’s interface gaps. Owner: ENGINEERING with PRODUCT.
  Listed by the independent holdout author in the independence manifest; the coaching-quality judge marks the affected cases CORPUS_ERROR.
- **INTAKE-CONTRADICTIONS** — Intake contradictions accepted in the engineering judge’s fuzz. Owner: ENGINEERING with PRODUCT.
  For example longRunMinutes below runMinutes, or experience NONE with high volume; not changed in R6.
- **MOVED-SESSION-SKIPPED** — A moved missed session stays annotated SKIPPED in the past week. Owner: ENGINEERING.
  Its prescription is unchanged.

## Coaching gaps

- **HM-LONG-RUN-PEAK** — A half-marathon long-run peak can stay below target. Owner: COACHING.
  For example profile A peaks at 85 of 105 minutes; the program discloses it as LONG_RUN_PEAK_BELOW_TARGET.

## Scope and validation

- **NO-VALIDATION** — No human, empirical or clinical validation: every judgment is provisional AI review of a synthetic offline reference. Owner: —.
- **SCOPE-EXCLUSIONS** — Scope exclusions: adults 18+, recreational, nonclinical; 10K and half marathon only; no marathon, ultra, adolescents, hills or VO2max-calibrated work. Owner: —.
- **NO-WEARABLE-INGESTION** — Wearable ingestion is not implemented: the intake accepts wearable-like summaries only. Owner: —.
- **WEEKLY-REVIEW-CONTRACT** — Every SSCTR approval holds under the weekly-review contract (see SSCTR-R18). Owner: —.
