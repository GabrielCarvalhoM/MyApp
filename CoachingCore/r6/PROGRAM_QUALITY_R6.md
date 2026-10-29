# Program quality — R6

Independent whole-program classification of the programs generated in the single first evaluation of the sealed R6 holdout (FREEZE-1, policy R6-POLICY-2). Assessor: the coaching-quality judge, `audits/domain-coaching-r6-2026-10-26/reviews/coaching-quality-holdout-review.json`. There is no post-fix rerun: the SSCTR refused FREEZE-2, so the runtime changes made after FREEZE-1 are not reflected here. Machine-readable version: `PROGRAM_QUALITY_R6.json`.

## Distribution (30 programs)

| Class | Count | Cases |
|---|---|---|
| PROGRAM_BEST_SUPPORTED | 7 | H17, H22, H24, H26, H28, H30, H32 |
| PROGRAM_ACCEPTABLE | 13 | H02, H06, H15, H18, H19, H20, H21, H23, H25, H29, H31, H33, H35 |
| PROGRAM_SUBOPTIMAL | 8 | H04, H05, H07, H08, H09, H16, H27, H34 |
| PROGRAM_INCOMPLETE | 1 | H03 |
| PROGRAM_UNSUPPORTED | 1 | H01 |

All generated programs are structurally complete; the judge's notes on each are in the JSON.

## Findings that concern programs

- **CQ-R6-01** (HIGH) Cold-start evidence fusion between wearable history and self-report fails in both directions. Later change: OPEN: no documented change; a synthetic thin-history probe on the current unfrozen runtime reproduces the H01 reading (75 min/week, long 30, peak 40).
- **CQ-R6-02** (HIGH) Progression stalls: long-run and easy-run trajectories go flat or never build. Later change: PARTLY: D50 (share-cap holds no longer consume the week's increase; author probe S: 47 of 66 programs with 4+ flat build weeks to 0). Not verifiable on this holdout; the synthetic thin-history HM on the current runtime still peaks at 40 min.
- **CQ-R6-03** (HIGH) DOUBLE_CONFLICT: a one-day turn conflict becomes a permanent same-turn stack and the conflict date is not resolved. Later change: OPEN: QRE-R6-08 adds schedule-change validation only.
- **CQ-R6-04** (HIGH) Replan and rearrangement paths read unreviewed weeks as zero exposure and collapse running before a race (R18-conditioned). Later change: OPEN: R18 is an owned gap (Engineering with Product/Data); the QRE-R6-09 single-run ceiling change applies the 15-min entry in every projected week when the 30-day window is empty, which points the same way.
- **CQ-R6-05** (HIGH) A program is PROPOSED although the engine records that it cannot prepare the goal, with no negotiation. Later change: PARTLY: D43/D47 build EVENT_AMBITIOUS_FOR_CURRENT_RUNNING with what the plan reaches (present in the synthetic current probe) but it stays non-blocking (R8 open).
- **CQ-R6-06** (HIGH) Race day prescribed at race effort with strides for athletes whose plan built only walk/jog or a restart (safety-relevant). Later change: ADDRESSED_PER_DOSSIER: D43(c) and D47 (race-day completion basis, strides only after executed strides). Cannot be verified on this holdout.
- **CQ-R6-07** (MEDIUM) Load convention: a goblet squat reported as 20 kg TOTAL is prescribed as 20 kg PER_HAND; self-reported known loads are dropped when wearable strength rows exist (safety-relevant). Later change: UNCLEAR: QRE-R6-01 (R6-POLICY-3 item 4) refuses convention mismatches in logs; the intake merge and the goblet-squat convention are still PER_HAND on the current runtime (synthetic).
- **CQ-R6-08** (MEDIUM) Hybrid arrangement places loaded lower-body work just before the long run without disclosure. Later change: OPEN: no documented change.
- **CQ-R6-09** (MEDIUM) Known current doses are under-used at cold start. Later change: OPEN: no documented change (D42 applies to non-novice walk/jog starts only).
- **CQ-R6-10** (MEDIUM) Availability treated as prescription for strength in a novice. Later change: OPEN.
- **CQ-R6-11** (MEDIUM) Bodyweight repetitions collapse after a gated review. Later change: PROBABLY (undocumented): a synthetic probe reproduces it on the FREEZE-1 reconstruction (dead-bug 1x12 to 1x6) but not on the current unfrozen runtime (1x12 kept), consistent with the D52 strength-state rework. No dossier names it; not verifiable on this holdout.
- **CQ-R6-12** (MEDIUM) PULL pattern: the bodyweight pull option is never selected and the 'PULL unavailable' note is unreliable. Later change: OPEN: the synthetic kettlebell/bodyweight probe on the current runtime still programs no pull.
- **CQ-R6-13** (MEDIUM) Correction chains and race records lose or downgrade executed work. Later change: Corrections: PLAUSIBLY by R6-POLICY-3 item 8 (QRE-R6-13/14: append-only record, a correction resolves a conflict), UNCLEAR. Race PARTIAL: OPEN.
- **CQ-R6-14** (MEDIUM) Athlete Model is inert on the holdout. Later change: OPEN (design scope; QRE-R6-16 consent fix does not add learning).
- **CQ-R6-15** (MEDIUM) Two-goal, three-evening athlete gets unconfirmed stacking, JOINT priority and poor session order. Later change: OPEN.
- **CQ-R6-16** (LOW) No mid-week response or check-in to a third adverse key session with impaired next-day function. Later change: OPEN (residual; R18).
- **CQ-R6-17** (LOW) Time-goal realism is never communicated. Later change: OPEN.
- **CQ-R6-18** (LOW) Stated emphasis preferences not carried into the dose. Later change: OPEN.
- **CQ-R6-19** (LOW) Small communication and record defects. Later change: OPEN.

## Limits

- Synthetic offline reference; no human, empirical or clinical validation.
- One evaluation only, on FREEZE-1; nothing here verifies a later change.
