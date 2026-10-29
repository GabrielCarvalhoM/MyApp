# R6 holdout: coaching-quality review of the first evaluation

**Judge:** an independent Quality & Reliability Engineer instance, acting as an adversarial hybrid running and strength coach. It wrote neither the runtime, nor the corpus, nor the SSCTR records.
**Record:** `coaching-quality-holdout-review.json`. The scripts and raw outputs are in `coaching-quality/`.
**What was judged:** `FIRST_EVALUATION.json` (R6-HOLDOUT-FIRST-1) on FREEZE-1. It is the only R6 evaluation: there is no FREEZE-2 and no post-fix rerun. This review informs the readiness verdicts; it does not set them. It makes no claim of human, empirical or clinical validation.

## Integrity: everything matches

| Check | Value | Result |
|---|---|---|
| Corpus sha256 | `49a85b8c…` = the manifest's `corpusSha256` | Match |
| First evaluation sha256 | `b3d155b6…` = the expected value | Match |
| Hashes the first evaluation carries | Corpus `49a85b8c…`; FREEZE-1 digest `507f35fc…` | Match |
| Policy in each step trace | `af2779fe…` | Match |
| Evaluation rows | 35, with 0 errors | Complete |

I also built a judge-only reconstruction of FREEZE-1 (`build-freeze1-reconstruction.mjs`) to run counterfactuals:
- It verifies 52 of 52 frozen code and policy files.
- The SSCTR records file cannot be byte-verified. I used the archived r6 copy, which yields the same authority: 10 boundaries at `af2779fe…`.
- As controls, the reconstruction reproduced the recorded results of H01, H19, H23 and H25 exactly.
- I deleted the reconstruction after use. The script recreates it.

## Distributions

**Cases (35):**

| Class | Count |
|---|---|
| BEST_SUPPORTED | 4 |
| ACCEPTABLE_ALTERNATIVE | 14 |
| SUBOPTIMAL | 9 |
| INSUFFICIENT_INFORMATION | 1 |
| UNSUPPORTED | 4 |
| CLINICAL_OUT_OF_SCOPE | 2 |
| CORPUS_ERROR | 1 |

- 21 of 35 are good outcomes or correct routing.
- The R18-adjusted view moves H25 from UNSUPPORTED to ACCEPTABLE_ALTERNATIVE.
- The dedicated COLD_START family is the weakest: 2 acceptable, 5 suboptimal and 2 unsupported out of 9.

**Programs (30 generated):**

| Class | Count |
|---|---|
| PROGRAM_BEST_SUPPORTED | 7 |
| PROGRAM_ACCEPTABLE | 13 |
| PROGRAM_SUBOPTIMAL | 8 |
| PROGRAM_INCOMPLETE | 1 (H03) |
| PROGRAM_UNSUPPORTED | 1 (H01) |

- Every program is structurally complete: phases, taper, race week and post-event weeks.
- All 7 best-supported programs share one profile: an intermediate runner with self-reported data, 4 run days, training for a half marathon.

**Cold start (the 17 GENERATE cases):**

| Outcome | Count | Acceptable or better |
|---|---|---|
| Complete programs | 5 | 2 |
| Establishment required | 5 | 1 |
| Legitimate ASK (H10, H14) | 2 | — |
| Correct scope or clinical routing | 3 | — |
| Incomplete or unsupported (H01, H03) | 2 | — |

**Adaptation (53 steps):**

| Category | Count | Steps |
|---|---|---|
| Appropriate KEEP | 25 | |
| Appropriate MODIFY | 20 | |
| Unnecessary mutation | 1 | H22 S2 |
| Insufficient mutation | 2 | H19 S4, R18-conditioned; H22 S3 |
| Excessive mutation | 2 | H23 S1; H25 S2, R18-conditioned |
| ASK or clinical routing | 2 | H28 |
| Corpus error | 1 | H20 S3 |

Separately, 18 step proposals carry a collapse in bodyweight repetitions, for example push-ups going from 3×14 to 3×6 for the rest of the plan.

**Learning:**

| Category | Count |
|---|---|
| Valid update | 9 |
| Ignored relevant history | 5 (H34 S3, H32 S2, H30 S5, H29 S3, H30 S3) |
| Overfit | 0 |
| Duplicate contamination | 0 |
| False causal hardening | 0 |

No learned pattern changed any decision.

## Findings, ranked by severity

"Addressed" below means only that a documented later change appears to address the finding. None of this can be verified on this holdout.

| ID | Sev. | Finding | Later change |
|---|---|---|---|
| CQ-01 | HIGH | Cold-start fusion of wearable and self-report data fails both ways (see below) | **Open.** A synthetic probe on the current unfrozen runtime reproduces H01 |
| CQ-02 | HIGH | Progression stalls (see below) | **Partly.** D50 |
| CQ-03 | HIGH | DOUBLE_CONFLICT: a one-day conflict becomes a permanent same-morning stack (see below) | **Open.** Reproduces on the current runtime |
| CQ-04 | HIGH, R18-conditioned | Replans and rearrangements read unreviewed weeks as zero exposure, so running collapses to 15–25 min before a race (H25 S2, H23 S1). Supplying the weekly reviews on the reconstruction removes both collapses | **Open.** R18 |
| CQ-05 | HIGH | PROPOSED although the engine itself flags that the plan cannot prepare the goal, with no negotiation (H01, H03) | **Partly.** D43/D47 add a non-blocking item |
| CQ-06 | HIGH, safety-relevant | Race-effort race day with strides after walk/jog or restart preparation (H03, H27) | **Addressed per dossier.** D43(c), D47 |
| CQ-07 | MEDIUM, safety-relevant | A goblet squat logged as 20 kg TOTAL is prescribed as 20 kg PER_HAND; self-reported known loads are dropped (H07) | **Unclear.** The current runtime still labels the goblet squat PER_HAND |
| CQ-08 | MEDIUM | Loaded lower-body work placed just before the long run with no disclosure (H01, H16 same session, H22 S3) | **Open** |
| CQ-09 | MEDIUM | Current doses under-used: H08 push-ups 2×8 against a current 3×20; H04 one key session, with specific work below what he does now; H02 walk/jog for an athlete who jogs 25 min continuously | **Open** |
| CQ-10 | MEDIUM | Strength days filled for a novice: 7 required sessions and 3 double days (H05) | **Open** |
| CQ-11 | MEDIUM | Bodyweight repetitions collapse after gated reviews (18 proposals) | **Probably.** Undocumented; it does not reproduce on the current runtime |
| CQ-12 | MEDIUM | The bodyweight pull option is never used and "PULL unavailable" notes are unreliable (H06, H24, H05, H08) | **Open** |
| CQ-13 | MEDIUM | Corrections rejected or later dropped; races finished faster than planned are recorded PARTIAL (H32, H30, H29) | **Corrections plausibly** (R6-POLICY-3 item 8). **Race PARTIAL open** |
| CQ-14 | MEDIUM | The Athlete Model is inert on the holdout (H34, H35) | **Open** |
| CQ-15 | MEDIUM | H16: stacking without confirmation, JOINT priority, heavy hinge before the long run | **Open** |
| CQ-16 to CQ-19 | LOW | No mid-week check-in (H19); time-goal realism never communicated; emphasis preferences ignored; small communication and record defects | **Open** |

**CQ-01 in detail.**
- H01: an intermediate runner doing 210 min a week. A FULL wearable declares 8 weeks of history, but its rows cover only the last 10 days. The engine read 77 min a week and built a 16-week plan with 15-min easy runs and a 35-min long-run peak, then a 150-min race.
- H07: the engine took the self-report of 200 min at face value over a partial watch showing 95–127 min, while its own uncertainty note says it used the lower figure.
- Counterfactual: H01 with 8 consistent weeks of history produces a sound program.

**CQ-02 in detail.**
- H01: the long run stays at 30–35 min for 14 weeks.
- H34: a half marathon with the long run at 80–85 min and a flat week for 14 weeks.
- H27: a plateau at 105 min a week with a 45-min long run.
- H09, H03 and H04 show the same pattern.

**CQ-03 in detail.**
- The conflict date itself is left unresolved.
- From the next week, strength is stacked with the run in the same morning, against `sameTurnConfirmed:false`.
- This reproduces on both the reconstruction and the current runtime.

## Is there a fundamental hole?

- **Architecture: no.** Every family is handled by an identifiable mechanism. Clinical and scope routing is entirely correct. 47 of 52 assessable steps are appropriate.
- **Core semantics: yes.** The leading defects are not edge coverage. They sit in paths every V1 athlete goes through:
  - cold-start evidence fusion;
  - progression;
  - the state used for unreviewed weeks (R18);
  - conflict semantics;
  - learning that is inert.

  Each is local to a rule set and fixable without re-architecture.

## KMP_PRODUCTION_CORE_PREP criteria (from this evidence only)

| Criterion | Assessment | Key cases |
|---|---|---|
| Cold start works for core V1 profiles | PARTLY_MET | Works for the standard intermediate runner (17 of 18 sequence generations); 7 of 9 dedicated profiles fail or are suboptimal: H01, H03, H04, H05, H07, H08, H09 |
| Whole-program generation works end-to-end | PARTLY_MET | 30 of 30 structurally complete; 20 of 30 acceptable or better |
| Balanced has no structural suboptimal behaviour | PARTLY_MET | H15 correct; H16 not |
| Run, strength and hybrid trajectories materially complete | PARTLY_MET | Standard HM/10K complete; stalls, novice builds, bodyweight dose and pull are not |
| Normal nonclinical return works | MET | H17, H26, H27, H28, with caveats |
| Event profiles include the race-week transition | PARTLY_MET | Structure sound throughout; race-day effort for completion athletes; race recorded PARTIAL |
| Substitution works | PARTLY_MET | H24 works, except the pull pattern; H06 |
| The Athlete Model changes future decisions without overfit | NOT_MET | No overfit, but no learned change (H34, H35; H20 is a corpus error) |
| The holdout reveals no fundamental architecture or domain hole | PARTLY_MET | No architecture hole; core-semantics defects |
| Remaining gaps are bounded edge coverage | NOT_MET | CQ-01 to CQ-05 are core semantics |

## Verdict input

| Field | Value |
|---|---|
| Quality status | QUALITY_BLOCKED |
| Fundamental architecture hole | No |
| Core-semantics defects | Yes |
| Recommended COACHING_DECISION_QUALITY | NOT_READY |
| Recommended WHOLE_PROGRAM_QUALITY | NOT_READY |

COACHING_DECISION_QUALITY is NOT_READY because the adaptation core is close, but cold start and two event types are not at coach quality.

## Limitations

- The judge is an AI coaching judge, with no human, empirical or clinical validation.
- The families are small.
- Outcomes from steps after weeks the holdout left unreviewed are flagged R18-conditioned. The counterfactuals ran only on the FREEZE-1 reconstruction.
- Synthetic probes on the current unfrozen runtime are informational. They are not a holdout rerun, and they verify no later change.
- The topic docs were not read.
- Envelopes and SSCTR conditions were not re-decided.
