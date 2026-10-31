# R7-B0 HANDOFF — V1 Coaching Repertoire Foundation → next gate

```
R7B0_STATUS                    = CLOSED
SPECIFICATION_READY            = YES_WITH_CONDITIONS
RUNTIME_IMPLEMENTATION_READY   = NO
V1_COACHING_AUTHORITY_READY    = NO
PRODUCTION_READY               = NO
R7B0_SSCTR_GATE                = ACCEPT_WITH_CONDITIONS (R7B0-SSCTR-r2)
FOUNDER_BLOCKER                = NONE
R7A                            = CLOSED, NOT REOPENED; freeze and R6-POLICY-5 byte-identical
```

2026-10-31 · branch `claude/domain-coaching-r7-b0` from `baseline/r7-b0` (`373a2d682a18d4f02be57299d6ab4c1493aee36f`); reviewed-candidate commit `caab54e`; closure commit recorded in [FINAL_DISPOSITION.json](../../../audits/domain-coaching-r7-b0-2026-10-31/FINAL_DISPOSITION.json) (resolve with `git log -1 --format=%H -- CoachingCore/r7/b0/B0_HANDOFF.md`). Nothing merged.

## 1. What exists now

| Artifact | Revision / SHA-256 | Authority |
|---|---|---|
| [REPERTOIRE_CATALOG_B0.json](REPERTOIRE_CATALOG_B0.json) | R7B0-CATALOG-2 `ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9` | Specification candidate; every entry has an authority status |
| [REPERTOIRE_CATALOG_B0.schema.json](REPERTOIRE_CATALOG_B0.schema.json) | `8b51b80b5861cea189489db28f2c15125269f4d3a4eb1c937a30590184dcffd8` | Catalog schema + DOSE / PROGRESSION_STATE contracts |
| [REPERTOIRE_FOUNDATION_B0.md](REPERTOIRE_FOUNDATION_B0.md) | R7B0-SPEC-2 `96fdefadba7a1de5b156c6324c6103c2ee57909cfeb5b4af59fd786147d7906a` | Overview; the catalog and the SSCTR records govern |
| [GAP_CLOSURE_B0.md](GAP_CLOSURE_B0.md) | R7B0-GAPS-1 `0f43f09fb3ccbe4ab2f4f71c03c82f7ea09a588a43358bd149cf64b5e4fa2b04` | Disposition of 14 readiness and 55 R6 gap ids |
| SSCTR records [r1](../../../audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_REVIEW_B0.json) → [r2](../../../audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json) | 13 records r2, each superseding its r1 | **The record conditions bind the catalog and prevail where stricter** |

Content: 10 run families (9 approved-envelope materializations, 1 familiar-only VO2-style path), 76 strength configurations (39 R6 preserved, 37 new), 7 templates with contextual roles, rotation/close-variation/skill-ladder relations, a hybrid composition matrix equal to the frozen runtime plus one approved extension, 5 archetypes, run/event/strength state machines, safety routes, 20 later-gate items with fallbacks, 31 positive and 25 negative witnesses.

## 2. Gate

| Decision | r1 (R7B0-CATALOG-1) | r2 (R7B0-CATALOG-2) | Confidence |
|---|---|---|---|
| B0-FIDELITY | REVISE (M1–M4) | APPROVE_WITH_CONDITIONS | MODERATE |
| B0-C01 run novice graduation | APPROVE_WITH_CONDITIONS | carried over | LOW |
| B0-C02 familiar repeated bouts | APPROVE_WITH_CONDITIONS | carried over | MODERATE |
| B0-C03 37 new strength configurations | APPROVE_WITH_CONDITIONS | carried over | MODERATE |
| B0-C04 metadata, load conventions | APPROVE_WITH_CONDITIONS | carried over | MODERATE |
| B0-C05 roles, goal-context accessories | APPROVE_WITH_CONDITIONS | carried over | MODERATE |
| B0-C06 rotation, close variation, MAIN at block boundary | APPROVE_WITH_CONDITIONS | carried over | MODERATE |
| B0-C07 skill ladders | APPROVE_WITH_CONDITIONS | carried over | LOW |
| B0-C08 strength novice density | APPROVE_WITH_CONDITIONS | carried over | MODERATE |
| B0-C09 PULL coverage | APPROVE_WITH_CONDITIONS | carried over | MODERATE |
| B0-C10 later-gate classifications | APPROVE_WITH_CONDITIONS | carried over | MODERATE |
| B0-C11 eccentric/new leg work before key runs | APPROVE_WITH_CONDITIONS | carried over | MODERATE |
| B0-C12 archetypes | APPROVE_WITH_CONDITIONS | carried over | MODERATE |

M1–M3 state on the quality families what the frozen runtime requires (`qualityAllowed`: run goal RACE or PERFORMANCE, at least three chosen run days, BUILD/DEVELOPMENT/SPECIFIC/NEXT_BLOCK context, R6-RUN-QUALITY); M4 points the protected-run substitution to B0-C11. One review plus one narrow recheck, as bounded. Evidence: SUPPORTED_WITH_LIMITS throughout; the R6 evidence base was re-verified and five new full texts were read; no human, empirical or clinical validation. Human revalidation queue **204 → 217** (append-only, funding NOT_DECLARED; [integration](../../../audits/domain-coaching-r7-b0-2026-10-31/QUEUE_INTEGRATION_R7B0.json)).

## 3. Readiness by area

| Area | State | Note |
|---|---|---|
| Running repertoire | SPECIFICATION_READY | Approved envelopes + quality gates; steady, continuous tempo, de novo VO2, hills, speed, tests, 5K: LATER_GATE |
| Strength repertoire | SPECIFICATION_READY_WITH_CONDITIONS | 37 new configurations, conventions and roles approved with conditions; runtime binding pending |
| Hybrid composition | SPECIFICATION_READY_WITH_CONDITIONS | CMP.I01–I10 equal to the runtime; CMP.I11 approved as a ranking cost only |
| Beginner paths | SPECIFICATION_READY_WITH_CONDITIONS | Run graduation and skill ladders at LOW confidence: reversible, disclosed, opt-in |
| Return / recovery | SPECIFICATION_READY | R6-NONCLINICAL-RETURN + R7-A invariants, unchanged |
| Taper (10K / half marathon, combined) | SPECIFICATION_READY | One taper week; multi-week taper LATER_GATE |
| Classification / eligibility | SPECIFICATION_READY | Predicates equal to the runtime on 4,000 cases; thresholds to be declared in the policy (B0-F05) |
| Parameterization | SPECIFICATION_READY | Schema with validated run-dose, strength-row and progression-state instances |
| Safety / boundaries | SPECIFICATION_READY | Nonclinical routes; clinical-screen items stay PRE_TESTFLIGHT |
| Validation | PASS 18/18 | [VALIDATION_B0.json](../../../audits/domain-coaching-r7-b0-2026-10-31/VALIDATION_B0.json) |
| Freeze integrity | INTACT | [VERIFICATION.json](../../../audits/domain-coaching-r7-b0-2026-10-31/VERIFICATION.json) |

`SPECIFICATION_READY` means the repertoire is explicit, bound, reviewed and implementable. It does not mean the runtime implements it, that the Core may prescribe autonomously, that G01–G04 are closed, or that training efficacy is proven.

## 4. What R7-B must bind (runtime unchanged in B0)

1. The SSCTR r2 record conditions, especially: strides optional for every WALK_JOG-, RESTART- or EASY_LOW-started athlete and run experience NONE/NOVICE (the runtime marks only EASY_LOW/NOVICE); quality graduation only from a block executed entirely in EASY mode; a straight-knee calf exposure every week; accessories rotate no faster than the preference cadence; no first-exposure or HIGH-eccentric configuration as a substitute before a protected run; ladder steps opt-in, one per block boundary, from an empty-bar ramp; bodyweight-for-load and bodyweight-limited doses disclosed as lower stimuli.
2. Findings B0-F01–F08 in [GAP_CLOSURE_B0.md](GAP_CLOSURE_B0.md) §3: load conventions (SINGLE_IMPLEMENT, BAND_TENSION, ASSISTED_BODYWEIGHT, pull-up loading), per-side laterality, slot-contextual roles, DR-134 rotation beyond accessories, CMP.I11, implement steps, novice density.
3. B0-F09 (SSCTR, minor): lateral deltoid is primary for `db-overhead-press` and secondary for `barbell-overhead-press`; align at the next catalog revision. No decision effect.
4. Policy backlog for the next policy revision (no B0 change): declare the run-class thresholds (B0-F05); SSCTR R16, R17, D49 limits; a bodyweight dose representation item (bodyweight configurations under LOAD or low-repetition goals cannot approach the prescribed reserve while added load is later-gated).

## 5. Remaining gaps (not B0 blockers)

R7-B: cold-start fusion, whole-program progression and stalls, goal feasibility negotiation, planner quality (JUDGE-CQ-R6-01–05, 09, 11, 13, 15–19). R7-C: longitudinal learning (CQ-14). R7-D: fresh unseen generalization. PRE_KMP: R18. PRE_TESTFLIGHT: clinical screen (R11, R15), QE-R7ARA-OBS-1, R1 standing projection. Product/Data: G03, pound display (DR-114), logged-load plausibility, learning-consent scope, observedAt, equipment implement detail. Funded human revalidation of the 217-item queue under its existing trigger.

## 6. Founder decisions

**None required to advance.** Optional strategic scope questions for later, each needing its own envelope review if pursued: 5K event support; hill sessions; de novo VO2 work; plyometric, Nordic or Copenhagen work; weighted bodyweight. None is decided here.

## 7. Next gate recommended

**DOMAIN_COACHING_R7-B** (planner, cold start, whole-program progression), starting with the runtime binding of R7B0-CATALOG-2 under the SSCTR r2 conditions: a new freeze, an SSCTR runtime-binding check, and independent engineering and quality judges. KMP, iOS/HealthKit/WorkoutKit, UI and TestFlight stay behind their own gates.

## Minimum rehydration

This file → the SSCTR r2 summary (`audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.md`) and r1 conditions (`SSCTR_REVIEW_B0.md`) → the catalog. Do not reopen R7-A or B0 without a concrete contradiction; do not load the B0 review transcripts.
