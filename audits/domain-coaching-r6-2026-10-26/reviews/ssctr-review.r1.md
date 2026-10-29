# SSCTR review of the R6 coaching envelopes

**Date:** 2026-10-26.

**Reviewer:** the native project agent type `sports-science-concurrent-training-reviewer`, running SSCTR-1.0.0 with constitution SSCTR-CONST-1.0.0 and protocol SSCTR-EP-1.0.0. This is the native type, not a fallback instance.

**Authority:** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. This reviewer:
- holds no human credentials;
- has no clinical equivalence;
- has no runtime sovereignty;
- did not author the R6 policy or runtime.

Nothing here is human, empirical or clinical validation.

**Target:** `CoachingCore/r6/PROGRAM_POLICY_R6.json`, revision R6-POLICY-1.
- Canonical hash, recomputed with `value.mjs` `hash(policy)`: `81114d89c2a855294bbea3a677eddd336a364c7a9cf9b04a5401d06a9f2de6c3`. It matches the dispatch value.
- File SHA-256: `0be56df9f6d3c7dbb1c16c47901dfe125c6c7d1644c67c15ab5e555d092b80bb`.

The runtime changed twice during the review; the policy hash did not. I regenerated `DEV_OUTPUTS.json` and re-ran every probe on the current runtime. All findings below hold on that runtime. `ssctr-policy-review.json` lists the hashes of the runtime files and probe outputs I reviewed.

## Outcome

Three boundaries are enabled and seven are held for revision.

| Boundary | Disposition | Evidence | Binding |
|---|---|---|---|
| R6-COLD-START | REVISE | SUPPORTED_WITH_LIMITS | Blocking defects |
| R6-LOAD-ESTABLISHMENT | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS | Changes required before freeze |
| R6-PLANNED-PROGRESSION | REVISE | SUPPORTED_WITH_LIMITS | Blocking defects |
| R6-RUN-QUALITY | REVISE | SUPPORTED_WITH_LIMITS | Blocking defects |
| R6-HYBRID-ARRANGEMENT | REVISE | SUPPORTED_WITH_LIMITS | Blocking defects |
| R6-SUBSTITUTION | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS | Changes required before freeze |
| R6-NONCLINICAL-RETURN | REVISE | SUPPORTED_WITH_LIMITS | Blocking defects, including a clinical-boundary breach |
| R6-EVENT-TRANSITION | REVISE | SUPPORTED_WITH_LIMITS | Blocking defects |
| R6-PARTIAL-NOISY-LEARNING | REVISE | SUPPORTED_WITH_LIMITS | Blocking defects |
| R6-ROTATION | APPROVE_WITH_CONDITIONS | SUPPORTED_WITH_LIMITS | No blocking defect found |

**Decision rule.** I used REVISE in two cases:
- the current binding, once enabled, would emit prescriptions outside the boundary's own stated limits;
- the policy text itself must change.

REVISE does not mean the science is weak. All ten envelopes are scientifically defensible with limits.

I used APPROVE_WITH_CONDITIONS where the current binding stays inside the envelope and the required changes are functional or fail-closed fixes.

**Runtime effect, checked with the real authority loader:**
- Only R6-LOAD-ESTABLISHMENT, R6-SUBSTITUTION and R6-ROTATION are enabled.
- Cold-start generation returns UNSUPPORTED because R6-COLD-START and R6-PLANNED-PROGRESSION are not enabled.
- This is intended. The fixes below add policy declarations, so the hash will change and all ten records must be re-issued at the new hash.

The three approvals are proposed for the single funded-human queue in `ssctr-proposed-queue-items.json`. I did not edit the queue file. Funding is NOT_DECLARED.

## Answers to the points I was asked to examine

**1. Asymmetric residual interference and the gap thresholds.** The asymmetry is supported with limits, and the gap thresholds are acceptable as ranking bands only.

Evidence for the asymmetry:
- A heavy lower-body session raised the cost of submaximal running for up to about 48 h. This was in resistance-untrained men (Doma 2019, full text).
- Repeated bouts attenuate this effect (Assumpção 2013, narrative review; Doma 2017, abstract only).
- Running before strength causes small acute strength losses, smaller than cycling (Markov 2022).
- When sessions are at least 3 h apart, maximal strength and hypertrophy are not attenuated over time (Schumann 2022). Lee 2020 found no strength difference by order at 3 h separation.

Counterevidence: type I fiber hypertrophy may be attenuated with running (Lundberg 2022). No blanket "no interference" claim holds.

The 6/30/54/48/72 h thresholds are operational bands that rank options. They are not evidence-derived minimum gaps.

**Quality-run-first for an equal-standing athlete.** This is a defensible default, not a hidden Run-first, when the alternative puts heavy lower-body work within about a day before the key run. Three conditions apply:
- the choice must be disclosed as reversible and overridable by the athlete;
- the athlete's own repeated comparable evidence can override it;
- for lifters already used to the work the asymmetry is weaker, and the runtime must say so.

An ASK is needed only when the costs are genuinely equal and opposed.

**2. Planned progression magnitudes.** The envelope is defensible with limits:
- Response-gated progression with periodic lighter weeks is supported (Nuuttila 2022 RCT; ACSM 2026 position stand).
- Rep progression is as effective as load progression (Plotkin 2022 RCT).
- A graded "10% rule" programme did not prevent injury in novices (Buist 2008, abstract only). No universal weekly percentage applies.

The new decisive counterevidence is Frandsen 2025 (BJSM, 5205 runners). Single runs more than 10% above the longest run of the last 30 days were associated with more overuse injuries (HRR 1.5 to 2.3). It is observational, and the authors decline a causal rule. What it means for R6:
- A +5 min step on long runs under 50 min exceeds 10%. I allow it only when it is disclosed and gated on response.
- Doubled EARNED steps and the RESTART-to-EASY jump (25 to 40 min) are not acceptable.
- Steps must be referenced to completed runs, not planned ones. The single-run ceiling is one step above the longest completed run of the last 30 days.

Three strength-side magnitudes need gates:
- +2 reps per week needs logged reserve no more than one rep below the prescription (Halperin 2022, abstract: RIR error about one rep).
- +1 set per block must depend on the block being executed.
- Consolidation every 4th week is an operational choice.

**3. Threshold work introduced by effort after two observed easy weeks, without pace.** Supported with limits:
- Recreational runners improve when quality work is added to an aerobic base (Festa 2020, García-Pinillos 2017, Nuuttila 2022).
- The talk test tracks physiological intensity (Kwon 2023, small sample).

The runtime defect is that "observed" is implemented as calendar weeks.

There is no direct evidence on strides for novices. They should be optional for EASY_LOW and NOVICE runners.

**4. Taper and race-week fractions, and stopping strength at least 3 days before the race.** Supported with limits:
- Wang 2023 (trained endurance athletes): a progressive 41–60% volume cut, with intensity and frequency kept, over 7 to 21 days.
- Smyth 2021 (recreational marathoners, observational): disciplined tapers were associated with better times.
- One set at RIR ≥4 stopped at least 72 h before the race is conservative, given residual impairment up to 48 h (Doma 2019).
- Strength maintenance needs little volume if relative load is kept (Spiering 2021, abstract only).
- After a simulated half-marathon, recreational runners recovered most functions within 1–2 days (Wang 2025). That supports the 2-day no-run floor before optional easy runs, provided function is checked.

The exact fractions are not validated for recreational 10K/HM hybrid athletes.

**5. Staged return by interruption length, and reuse of a current demonstration.** Supported with limits. Fitness declines more with longer stops (Zheng 2022 meta-analysis; Bosquet 2013, abstract only). The length classes are operational. Reusing a current demonstration is acceptable only if it was a completed easy run with compatible function, observed after the interruption began.

**6. Treating build-phase labels as comparable for identical prescriptions.** Acceptable with conditions. Pooling requires the same prescription hash and the same arrangement, and it serves only ranking and holds. Consolidation weeks have lower surrounding load and can bias responses toward "surplus", so they must not feed EARNED. Taper, event, post-event and return-period observations must never pool with build observations.

**7. An arrangement admissible when its own recovery is unknown but whole-week tolerance is reported.** Acceptable only if all of these hold:
- the task set and frequency match the tolerated week;
- the worst severity at the session horizon is LOW or less;
- the arrangement adds no same-day pairing the athlete has not reported.

Otherwise the arrangement needs its own evidence or an ASK.

## Binding defects and required changes

All of these were reproduced by probes on the current runtime unless marked "inspection". Raw outputs are in the `ssctr-probe-*.out.json` files.

### Clinical boundary

**D08 — illness can receive a nonclinical return.** In `r6-adaptation.mjs` `returnAfterPause`:
- "Flu illness" with `nonclinical:true` got REESTABLISH.
- "Sick with a fever" with `clinicalReason:false` got REESTABLISH.
- "Work travel, will resume" was routed to clinical, because the word "will" contains "ill".

Required:
- use a structured reason category plus whole-word matching against a clinical word list;
- route any clinical match to CLINICAL_HUMAN_REQUIRED, whatever the flags say;
- treat an ambiguous reason as ASK.

The legacy RETURN branch in `r6-legacy.mjs` (`selectLegacyAction`) checks only `clinicalReason`. It needs the same change (inspection).

**D22 — illness-named pause produces a restart; restart runs without return authority.** In `r6-program.mjs` `generateProgram` and the `r6-intake.mjs` pause handling:
- An intake pause reason of "Pneumonia, recovered now" produced a RESTART programme.
- RESTART programmes are generated even when R6-NONCLINICAL-RETURN is disabled.

Required: apply the same clinical check to the intake pause, and require R6-NONCLINICAL-RETURN for the restart class.

### Progression

**D11 / D12 — EARNED doubles steps.** In `r6-program.mjs` `advanceRun` and `advanceStrength`, EARNED doubles every step:
- walk/jog ladder steps 1→3→5→7 in three weeks;
- threshold ladder steps skipped;
- long run +10 min;
- restart +10 min;
- a return jumps from entry to the prior dose in one week, using surplus responses from before the pause.

Required:
- at most one step per dimension per week;
- EARNED counts as ADVANCE in WALK_JOG, RESTART and RETURN modes;
- surplus is counted only after the return starts.

**D13 — quality and strides start by calendar.** In `r6-program.mjs` `initialRunState`, `runRow` and `advanceRun`, quality and strides start by week number. Threshold 3×5 plus strides appeared in week 3 after weeks 0–2 were entirely missed. Required: count executed easy weeks instead.

**D14 — set increases by calendar.** In `r6-program.mjs` `advanceStrength`, the block-boundary set increase is calendar-based: +1 set appeared after five missed weeks. Required: increase sets only after the block was executed.

**D15 — strength advances on too little reserve.** In `r6-adaptation.mjs` `weeklyGates`, the athlete was prescribed RIR 3, logged RIR 1, and still got ADVANCE (+2 reps). Required: ADVANCE needs logged RIR at or above the prescribed RIR minus 1; EARNED needs the prescribed RIR plus 2.

**D16 — loads rise without any log.** In `weeklyGates` and `advanceStrength`, the squat went from 100 to 102.5 to 105 kg with no exercise logs. Required: a known-load rep or load step needs a logged set at the current load.

**D17 — restart and walk/jog transitions use hard-coded values.** In `r6-program.mjs` `advanceRun`, these values are not in the policy:
- restart steps of +5 and +10 min;
- the 30-minute switch point;
- long run = restart + 10 on switching (25-minute runs were followed by a 40-minute long run);
- walk/jog exit at 25 minutes.

Required: declare these values in the policy and cap each transition with the single-run ceiling.

**D18 — the ceiling uses planned runs.** In `reproject` and `advanceRun`, the single-run ceiling must be checked against completed runs in the ledger, not planned runs.

**D19 — long-run share cap not enforced.** In `advanceRun` and `distributeRun`, `longRunShareOfWeeklyMinutesMax` (0.45) is applied only in week 1. It reached 0.49. Required: enforce it in every week, or amend the policy so it applies to week 1 only.

**D20 — consolidation reduction is hard-coded.** In `runRow`, the consolidation long-run reduction (2 × step) must be declared in the policy.

### Cold start and load establishment

**D21 — week 1 exceeds reported running.** In `r6-program.mjs` `initialRunState` and `distributeRun`, a familiar quality task in week 1 produced 140 min against 120 reported. Required: rebalance the easy runs so week 1 stays at or below current exposure, or defer the quality task.

**D23 — establishment rows when the boundary is off.** In `generateProgram`, ESTABLISH rows were emitted while R6-LOAD-ESTABLISHMENT was disabled. Required: make this path fail closed.

**D29 — establishment wording.** In `r6-prescription.mjs` `exerciseRow`, "lightest available load that leaves N in reserve" literally prescribes the lightest implement. Required: replace it with an ascending-ramp instruction.

### Event transition

**D01 — new intensity in race week.** In `r6-program.mjs` `eventWeekSessions`, the race-effort touch and the shakeout strides are triggered by run class alone. They appeared:
- with R6-RUN-QUALITY disabled;
- for a 2-day runner who had no quality work in the build.

Required: gate both on the authority and on executed comparable work.

**D02 — taper quality too high.** In `r6-prescription.mjs` `reducedWork`, a 3-rep peak still becomes 2 reps, which is 0.67 of the work and outside the 0.5–0.6 range. Required: reduce total work minutes into the range.

**D03 — taper built from planned work.** `peakOf` and the taper use planned weeks. After zero executed quality sessions, the taper still contained threshold 2×5 and race week still had a race-effort touch. Required: derive the taper from executed sessions.

**D04 — redevelopment without a post-race check.** In `r6-adaptation.mjs` `evaluateProgram`, a review after the race kept the plan with an eligibility assessment dated before the race. Required: require an assessment on or after the race date before redevelopment.

**D05 — legacy event kind hard-coded.** In `r6-legacy.mjs` `generateLegacyProgram`, `eventKind` is fixed to HALF_MARATHON (inspection). Required: pass the athlete's actual event.

**D06 — undeclared race-week fraction.** `eventTransform` uses a race-week quality fraction of 0.4 that is not in the policy (inspection).

**D07 — undeclared redevelopment values.** At NEXT_BLOCK, `advanceRun` reuses the taper fractions and `qualityStep − 3` without policy declaration.

### Hybrid arrangement

**D24 — hidden Run-first in shared sessions.** In `r6-balanced.mjs` `interferenceCosts`, an easy run before heavy lower-body work in the same session has no cost. The tie is then broken by identifier order, which picks run-first. Required:
- add a strength cost when strength has a development role (Eddens 2018: strength-first gives +6.9% lower-body dynamic strength);
- stop breaking ties by identifier.

**D25 — costs are counted.** In `horizonCosts` and `jointKey`, H1 counts cost occurrences, which breaks the "ordinal only, never summed" rule.
- In the probe, this count chose a MODERATE cost to the key run over a LOW strength cost, against the asymmetry.
- The trace labelled the decision "equivalent".
- An 11-hour same-day pair is still labelled "the day before".

Required: compare candidates by worst severity first, then the next worst; report the decisive basis.

**D26 — unknown-arrangement admissibility.** In `r6-legacy.mjs` `legacyCandidates`, apply the admissibility rule from point 7 above.

### Substitution

**D27 — substitutions are lost.** In `r6-adaptation.mjs` `equipmentChange`, after a permanent switch to bodyweight only, the next weekly review rebuilt the plan with dumbbell exercises again. Required:
- persist the equipment window so later weeks keep the substitutes;
- pause progression on the substituted exercises.

### Learning

**D28 — return periods pool with build.** In `r6-adaptation.mjs` `bindObservations`, observations carry no mode or phase-class marker, so return and restart sessions pool with build sessions. The arrangement-preference query pools all phases and doses. Required:
- add `mode` and `phaseClass` to each observation;
- exclude return periods and non-build phases from build pools;
- add a dose key to the arrangement-preference query.

### Hygiene

These do not block enabling:
- **D30** — reconcile the rotation scope: the policy says accessories and close variants; the code rotates accessories only.
- **D31** — make strides optional for novices.
- **D32** — state that the taper and race-week fractions are per session, not per week.
- **D33** — declare the race-day window and warm-up values in the policy.

## Retained gaps

- No human, empirical or clinical validation has occurred.
- Exact operational magnitudes have no direct comparative evidence.
- The single-session injury evidence is observational and measured in distance.
- Taper evidence for recreational and combined run-plus-strength athletes is indirect.
- There is no direct evidence on strides for novices or on RIR accuracy in complete beginners.
- Pooling across build labels is an assumption.
- D05, D06 and the legacy part of D08 come from code inspection, not executed probes.
- I did not run `npm run verify` or any `verify-r*` script. I did not re-run the test suite; the coordinator reports 349/349.
- Hills, VO2max-calibrated work, marathon and ultra, adolescents, pregnancy and postpartum, elite athletes and clinical return remain out of scope.

## Literature access

**Method.** I used the Europe PMC REST search API and the Europe PMC full-text XML endpoint, called from Node 24.
- 20 full texts were retrieved in this session.
- I re-checked 7 earlier retrievals against their recorded hashes; all match.
- 8 sources were available as abstracts only. They are labelled ABSTRACT_ONLY and never serve as decisive support.

**Failures and exclusions:**
- My first search set was too broad and returned unrelated papers. It stays in the log as a failed search.
- Two full-text fetches by the earlier fallback reviewer had failed (HTTP 500).
- WebSearch and WebFetch were available but not needed.

**Validation.** All ten records validate against `decision.schema.json` with the project validator (jsonschema 4.26.0 and Python 3.12.14 from a bundled runtime). The queue proposal is consistent with the records. This certifies record consistency only.

## Escalation

There is one escalation: the clinical-boundary binding defect (D08 / D22). Illness-named interruptions can receive a nonclinical return or restart recipe in the cold-start, intake and legacy paths. No clinical judgment is being requested. The runtime must route these cases to CLINICAL_HUMAN_REQUIRED before R6-NONCLINICAL-RETURN or R6-COLD-START can be enabled.

Nothing needs Founder action. After the changes land, the author requests a delta review of the new policy hash and the corrected runtime.
