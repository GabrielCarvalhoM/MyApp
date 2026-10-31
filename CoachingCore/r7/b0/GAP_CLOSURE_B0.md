# R7-B0 gap closure matrix

Revision **R7B0-GAPS-1** · 2026-10-31 · for catalog `R7B0-CATALOG-1`. Every B0 gap of the [readiness pack](../../../audits/domain-coaching-r7-b0-readiness-2026-10-30/CLAUDE_HANDOFF.md) and every item of [R6 OPEN_GAPS](../../r6/OPEN_GAPS_R6.md) gets one disposition. `validate-b0.mjs` (V16) fails if an id is missing here.

Dispositions: **RESOLVED_IN_SPEC** (closed at specification level by the catalog; runtime binding is R7-B) · **RESOLVED_IN_SPEC_PENDING_SSCTR** (rests on a B0 candidate; its final state follows the B0 SSCTR record) · **CLOSED_EARLIER** (closed by an earlier authority; not reopened) · **LATER_GATE** (named owner and gate; not a B0 blocker) · **RETAINED_LIMIT** (a declared limit that stays).

## 1. Readiness pack B0 categories

| ID | Question (compressed) | Disposition | Where |
|---|---|---|---|
| R1 | Which run families and phase/event roles enter V1, with positive and negative eligibility | RESOLVED_IN_SPEC (B0-C01, B0-C02 pending SSCTR) | `run.families`, `run.modes`, witnesses WP-RUN-*, WN-01–08 |
| R2 | How establishment, easy/long, quality, event, return and maintenance reference exact methods and allowed parameters | RESOLVED_IN_SPEC | `run.intensityMethods`; every configuration parameter is a `policy:` path (V02) |
| S1 | Minimal configuration/metadata/substitution coverage across goals and equipment, incl. unavailable PULL and bodyweight | RESOLVED_IN_SPEC_PENDING_SSCTR (B0-C03, B0-C04, B0-C09) | `strength.configurations`, `equipmentProfiles`, `pullCoverage`; V05 coverage matrix |
| S2 | Configurations, contextual roles, close-variation relations, eligibility metadata and alternatives implementing DR-134 | RESOLVED_IN_SPEC_PENDING_SSCTR (B0-C05, B0-C06, B0-C07) | `templates`, `rotation`, `closeVariationRule`, `skillLadders`; V06–V08 |
| H1 | Admissibility relations that preserve essential stimuli under chosen days, dynamic priority and directional demand | RESOLVED_IN_SPEC (CMP.I11/P04 pending SSCTR, B0-C11) | `composition.interferenceRelations` (equal to the frozen runtime, V12), `protectedStimuli`, `placementRules` |
| H2 | Representation of infeasible or incomparable compositions without inventing days, load or equivalence | RESOLVED_IN_SPEC | `composition.infeasibleOrIncomparable`, GENUINE_TRADE_OFF ASK |
| A1 | Attributes that qualify each entry | RESOLVED_IN_SPEC | `classification.signals`, `runClasses` (equal to the runtime binding on 4,000 grid cases, V09), `strengthClasses`, `skillAdmissibility` |
| A2 | Which unknowns permit establishment, need ASK, can be learned, or are unsupported/clinical | RESOLVED_IN_SPEC | `classification.unknownCategories`, `statuses`, `safety.routes` |
| P1 | Versioned recipe refs, units/conventions, completion/repeats, bounds, progression knobs, missingness | RESOLVED_IN_SPEC | Schema `$defs` runDose, strengthRowDose, progressionState, quantity (instances validated, V01); `vocabulary.loadConvention` |
| P2 | Where calibrated pace and lb display/increments are unavailable rather than defaulted | RESOLVED_IN_SPEC | Pace: EFFORT_CUE default, FAMILIAR_FIELD_SESSION_TARGET only with SSCTR-R2-P14 inputs, de novo pace LATER_GATE. Pounds: canonical kg, boundary conversion (`policy:operational.strength.loadUnits`); display and pound increments stay POUND-DISPLAY (below) |
| B1 | Applicability, approval, withdrawal and fallback per entry and relation | RESOLVED_IN_SPEC | `authorityStatus` on every entry; `laterGate` fallbacks; `laterGatePolicy`; bindings to the approval records |
| B2 | Uncovered targets, return modes, clinical dependencies and uncertainty block only the dependent composition | RESOLVED_IN_SPEC | `safety.routes` (dependent scope, AEC 7.1), `trajectories.run` CLINICAL_HOLD / ASK_HOLD |
| T1 | Traceable acceptance witnesses: allowed/unsupported/ASK/HOLD, units/repeats/dedup, constraints, comparability, no unearned progression | RESOLVED_IN_SPEC | 31 positive and 25 negative witnesses; 17 validator checks; runtime acceptance tests belong to R7-B |
| T2 | Evidence binding of each entry to an exact reviewed envelope, without upgrading old holdouts | RESOLVED_IN_SPEC | `bindings`, envelope approvals checked against `ssctr-policy-review.r12.json` (V11); fresh unseen generalization stays R7-D |

## 2. R6 open gaps

| ID | Disposition | Owner / gate | Note |
|---|---|---|---|
| BLOCKER-D53 | CLOSED_EARLIER | R7-A | D53 VALID at the formal R7-A closure; not reopened. |
| BLOCKER-D54 | CLOSED_EARLIER | R7-A | Resolved in R7-A; not reopened. |
| BLOCKER-FREEZE-2 | CLOSED_EARLIER | R7-A | Superseded by R7A-RESIDUAL-AUTHORITY-FREEZE-1. |
| NOT-RUN-POSTFIX | CLOSED_EARLIER / LATER_GATE | R7-A, R7-D | R7-A regression runs on its own freezes; the R6 corpus is regression only; fresh holdout R7-D. |
| NOT-RUN-ENGINEERING-REREVIEW | CLOSED_EARLIER | R7-A | Independent engineering rechecks READY on the R7-A freeze. |
| NOT-RUN-R5-RECLASSIFICATION | CLOSED_EARLIER / LATER_GATE | R7-A, R7-D | As above. |
| NOT-RUN-OFFICIAL-OUTPUTS | CLOSED_EARLIER / LATER_GATE | R7-A, R7-D | As above. |
| SSCTR-R18 | LATER_GATE | Engineering with Product/Data, PRE_KMP | Weekly-review contract retained; the R7-A state model separates facts and projection. |
| SSCTR-R11 | LATER_GATE | Product/Data with SSCTR, PRE_TESTFLIGHT | Clinical screen design. |
| SSCTR-R15 | LATER_GATE | Engineering with SSCTR, PRE_TESTFLIGHT | Clinical screen false positives. |
| SSCTR-R14 | LATER_GATE | Engineering with SSCTR, R7-B | Race-week statement after a restart. |
| SSCTR-R1 | LATER_GATE | R7-B | Ask for RIR when missing; missing logs hold (WN-15). |
| SSCTR-R2 | LATER_GATE | Product/Data | Structured reason category in the product. |
| SSCTR-R5 | LATER_GATE | Data | Far-below-plan load confirmation threshold. |
| SSCTR-R8 | LATER_GATE | R7-B | Collect the completion-race choice before the race window. |
| SSCTR-R9 | LATER_GATE | R7-B / next policy revision | Completion pacing exemptions keyed on executed running. |
| SSCTR-R16 | LATER_GATE | Next policy revision | Long-run floor in consolidation and first weeks; no B0 policy change. |
| SSCTR-R17 | LATER_GATE | Next policy revision | Bodyweight resumption, return-first exercises, block credit after re-establishment. |
| SSCTR-R19 | LATER_GATE | Next runtime revision (R7-B) | Row wording and regain following the executed exposure. |
| CLINICAL-SCREEN | LATER_GATE | Product/Data with SSCTR, PRE_TESTFLIGHT | Referenced by `safety.routes`; unchanged. |
| G03 | LATER_GATE | Product/Data | Adherence and partial semantics; classes kept distinct in the schema. |
| D49-LIMITS | RETAINED_LIMIT | Next policy revision | Sets return one per executed week after a return. |
| ROTATION-CLOSE-VARIANTS | RESOLVED_IN_SPEC_PENDING_SSCTR | DR-134 + B0-C06 | Structure closed by DR-134; mapping in `strength.rotation` and `closeVariationRule`. |
| LEARNING-CONSENT-SCOPE | LATER_GATE | Data | `classification.signals.learningConsent` keeps the boundary. |
| LOGGED-LOAD-PLAUSIBILITY | LATER_GATE | Data | Unchanged. |
| POUND-DISPLAY | LATER_GATE | Product / iOS prep (DR-114) | Canonical kg and boundary conversion are specified; pound display and pound increments are not defaulted. Not a B0 blocker. |
| KNOWN-DOSE-OBSERVED-AT | LATER_GATE | Data | Resume clock semantics referenced in the strength trajectory. |
| R5-FINDINGS | LATER_GATE | R7-B | Regression findings of the legacy path. |
| HOLDOUT-INTERFACE-GAPS | LATER_GATE | Engineering with Product, R7-D | Corpus interface. |
| HM-LONG-RUN-PEAK | RETAINED_LIMIT | R7-B feasibility | Carried in `RUN.LONG.knownLimit` and LONG_RUN_PEAK_BELOW_TARGET. |
| INTAKE-CONTRADICTIONS | LATER_GATE | Engineering with Product, R7-B | Intake validation. |
| MOVED-SESSION-SKIPPED | LATER_GATE | Engineering, R7-B | Record annotation. |
| JUDGE-CQ-R6-01 | LATER_GATE | R7-B cold start | B0 fixes the signal semantics: wearable history is an exposure lower bound, never tolerance. |
| JUDGE-CQ-R6-02 | LATER_GATE | R7-B whole-program progression | B0 trajectories define the steps; stall handling is R7-B. |
| JUDGE-CQ-R6-03 | LATER_GATE | R7-B planner | Constraints in CMP.P01/P02. |
| JUDGE-CQ-R6-04 | LATER_GATE | R7-B / PRE_KMP with R18 | Unreviewed weeks. |
| JUDGE-CQ-R6-05 | LATER_GATE | R7-B feasibility negotiation | Representation listed in `infeasibleOrIncomparable`. |
| JUDGE-CQ-R6-06 | CLOSED_EARLIER | R6 policy D43/D47 | Represented by RUNCFG.RACE_COMPLETION and the strides-after-executed rule. |
| JUDGE-CQ-R6-07 | RESOLVED_IN_SPEC_PENDING_SSCTR | B0-C04, then R7-B | SINGLE_IMPLEMENT convention for goblet squats and other single-implement configurations; runtime unchanged. |
| JUDGE-CQ-R6-08 | RESOLVED_IN_SPEC_PENDING_SSCTR | B0-C11, then R7-B | CMP.I11 and CMP.P04 under SIS section 5. |
| JUDGE-CQ-R6-09 | LATER_GATE | R7-B cold start | KNOWN_LOAD continuation exists; under-use is planner quality. |
| JUDGE-CQ-R6-10 | RESOLVED_IN_SPEC_PENDING_SSCTR | B0-C08, then R7-B | Strength novice density. |
| JUDGE-CQ-R6-11 | LATER_GATE | R7-B regression | Not reproduced on the later runtime per R6; unverified. |
| JUDGE-CQ-R6-12 | RESOLVED_IN_SPEC_PENDING_SSCTR | B0-C09, then R7-B | PULL coverage and a disclosure computed from selected rows (V05). |
| JUDGE-CQ-R6-13 | LATER_GATE | R7-B / engineering | Corrections now flow through R7-A A5; race PARTIAL record open. |
| JUDGE-CQ-R6-14 | LATER_GATE | R7-C longitudinal | Athlete Model learning. |
| JUDGE-CQ-R6-15 | LATER_GATE | R7-B planner | B0 supplies same-shift confirmation, JOINT ASK and placement rules. |
| JUDGE-CQ-R6-16 | LATER_GATE | R7-B / R7-C | Mid-week check-in. |
| JUDGE-CQ-R6-17 | LATER_GATE | R7-B | Time-goal realism communication; the time goal stays context only. |
| JUDGE-CQ-R6-18 | LATER_GATE | R7-B | Emphasis reorders and chooses within goal doses (`templateRules.selection`); dose allocation is R7-B. |
| JUDGE-CQ-R6-19 | LATER_GATE | R7-B | Communication and record defects. |
| NO-VALIDATION | RETAINED_LIMIT | Funded human revalidation; R7-D | No human, empirical or clinical validation. |
| SCOPE-EXCLUSIONS | RETAINED_LIMIT | — | `scope.excluded`. |
| NO-WEARABLE-INGESTION | RETAINED_LIMIT | iOS prep | Canonical inputs only (DR-121, DR-123). |
| WEEKLY-REVIEW-CONTRACT | RETAINED_LIMIT | — | Approvals hold under the weekly-review contract. |

## 3. Findings raised by B0 (runtime unchanged; for R7-B or the named owner)

| ID | Finding | Owner / gate |
|---|---|---|
| B0-F01 | The R6 runtime derives load convention and loading from equipment: single-implement configurations read PER_HAND; band rows are established in kilograms; the pull-up reads EXTERNAL. The catalog states the correct representation (`r6Delta`). | R7-B runtime binding (B0-C04) |
| B0-F02 | Side plank and Pallof press are logged per side; the R6 catalogue marks them bilateral. | R7-B |
| B0-F03 | The R6 catalogue carries one fixed role per exercise; DR-134 requires slot-contextual roles. The catalog separates `roles` (admissible) from the slot role. | R7-B (B0-C05) |
| B0-F04 | The R6 rotation boundary (accessories only; main lifts and their close variants never change) is narrower than DR-134 + B0-C06. | R7-B after the SSCTR disposition |
| B0-F05 | Run-class thresholds (45 and 60 weekly minutes, 2 days) are runtime constants, not policy fields. | Next policy revision: declare without changing values |
| B0-F06 | Eccentric or new lower-body work before the long run (SIS section 5) is not encoded in the runtime interference costs. | R7-B (B0-C11) |
| B0-F07 | Available implement steps (kettlebell jumps, fixed dumbbell sets) are not collected; the policy per-implement increment is the default and reps progress when the next step is unavailable, never a fabricated load. | Product/Data (equipment detail) and R7-B |
| B0-F08 | More strength days add templates and weekly sets for a novice (DR-112: more days spread load). | R7-B (B0-C08) |

## 4. Deferred categories kept as they were

POST_B0 · R7-B_COLD_START_WHOLE_PROGRAM · R7-C_LONGITUDINAL · R7-D_FRESH_GENERALIZATION · KMP · IOS_IMPLEMENTATION_HEALTHKIT · PRE_TESTFLIGHT_R1 · TESTFLIGHT_REAL_USE_GATES · GROWTH_SEPARATE_MISSION · DESIGN_RECONCILIATION · POST_V1 · FUNDED_HUMAN_REVALIDATION. R7-A backlog (QE-R7ARA-OBS-1 PRE_TESTFLIGHT_REVIEW; NF-R7ARA-1 POLICY_BACKLOG; the rest as recorded in the R7-A handoff) is unchanged and is not a B0 blocker.
