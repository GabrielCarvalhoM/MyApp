# Two-week exercise rotation — Founder proposal

Revision TWR-1 · 2026-10-30 · **PROPOSAL / NON-CANONICAL / NO RUNTIME AUTHORITY**.

**Recommendation:** retain the exact main exercises within a six-week block; use the two-week preference to offer systematic changes to eligible accessory slots, including complementary close variations. A close variation never replaces a protected main exercise merely because two weeks elapsed. Review the whole selection at the six-week boundary; retaining it is a valid outcome. Necessary reason-based substitutions can override every nominal cadence, subject to coverage and athlete agency.

**Outcome: READY_FOR_FOUNDER_DECISION.** This means the product semantics can be decided now, not that a repertoire, prescription, scientific efficacy claim or B0 is approved. The requested decision is acceptance of this operational interpretation and its limits. No canonical file is changed by this proposal.

## 1. Mandate, authority and remaining decision

This mission starts at readiness-pack commit `f82b7f6917e695b5fb8f277e3b6ea39737e19c35`, on isolated branch `chore/two-week-rotation-policy`. It creates only this audit/proposal. The original readiness and review branches are inputs, never merged or edited. Managed-worktree creation rejected the nested repository as outside the chat's declared source roots; a native Git worktree was used in `work/MyApp-two-week-rotation-policy` instead.

Routing: **T2 / R1 / L2, with the final adoption reserved to Founder (L4)**; documentary proposal, low irreversibility, bounded medium semantic uncertainty/dependencies. Current root owns authorship/coordination; a fresh default instance explicitly loads local SSCTR-1.0.0 for independent proposal review because the native SSCTR agent type is unavailable. Local `AGENTS.md` requires this sporting review. No new doctrine, executable schema, technical boundary, trust/privacy behavior, visual surface or clinical protocol is introduced. PCG publication, Security, runtime QA and Figma gates are not triggered by these artifacts. Re-review before any future prescriptive adoption remains required. Stop after documentation, current integrity evidence, review, commit and push.

### Authority correction discovered during this mission

The readiness pack's drift item **D04** and live **DR-113** still describe the broad scope as Founder-open. However, [OB-2 CHECKPOINT](../new-figma-onboarding-v2-2026-10-25/CHECKPOINT.md), Done/next step 4, records the Founder's **2026-10-26 choice of option (a)**: main exercises stay; accessories and close variations may rotate. [SSCTR_ROTATION_CHECK](../new-figma-onboarding-v2-2026-10-25/reviews/SSCTR_ROTATION_CHECK.md), r4, independently binds that choice and identifies exactly two remaining definitions: main exercises and close variations. The matching edits are **held**, not applied, in `PENDING_DOC_CORRECTIONS_R2.json` ops 35–38. A held edit is not an applied canonical correction, but these records are evidence of the existing Founder direction, also expressly repeated in this mission's direct instruction.

Therefore **do not ask Founder to choose full rotation again**. The operational definitions and conditional extension beyond the current R6 accessory-only implementation are the proposal. Frozen [R6 policy](../../CoachingCore/r6/PROGRAM_POLICY_R6.json) has a broad `boundaries.R6-ROTATION.claim` mentioning close variations, but `operational.rotation` explicitly excludes them; [OPEN_GAPS_R6](../../CoachingCore/r6/OPEN_GAPS_R6.md) names `ROTATION-CLOSE-VARIANTS`. The broad boundary claim alone does not approve that operational extension. This audit records the mismatch without applying held patches or revising D04/DR-113/frozen policy.

| Status | Meaning / source |
|---|---|
| REPOSITORY-DERIVED | Four preferences concern exercise selection only; progression is separately earned; preserve essential stimulus; new exercise establishes load by approved effort guidance; no cross-exercise load transfer; fixed still allows eligible agency-confirmed substitutions. STIL §4, DR-113, OB-2 Q3. |
| REPOSITORY-DERIVED | Main exercises stay under option (a); exact operational main/close definitions remain open. OB-2 checkpoint and SSCTR rotation check, not a new finding of physiological superiority. |
| REPOSITORY-DERIVED | Stability/MEC, goal-specific selection, skill, equipment/configuration, directional demand, missingness and athlete agency constrain changes. Thesis L024/C057–60; STIL §§1–7; SIS §§4–7; AEC §§1.2–1.3/7. |
| REPOSITORY-DERIVED | Current R6 defers rotation in establishment, SPECIFIC, TAPER, RACE_WEEK and POST_EVENT; main lifts stay; FIXED never performs scheduled rotation. Later R7 factual/earned-state amendments still apply. |
| PROPOSED OPERATIONAL DETAIL | Contextual role assignment; complementary meaning of close variation; three eligibility values; opportunity rather than replacement quota; per-slot anti-churn; six-week whole-block review with possible retention. |
| STILL OPEN FOR LATER WORK | Exact eligible configurations, directed replacement pairs, parameters, competency/establishment methods and coverage bindings. Those belong to an authorized repertoire/policy mission, not this proposal. |

The six-week broader review is the current mission's requested policy direction, consistent with STIL block review and R6 six-week selection cadence. It is not a scientifically optimal block length or authority to change dose.

## 2. Minimum taxonomy: reuse three roles, separate purpose and relations

Reuse the existing catalogue vocabulary **MAIN / ACCESSORY / PRACTICE**. `ANCHOR` is a prose synonym for effective `MAIN`, not a fourth enum. These are roles in a particular prescription/block, not immutable anatomical properties of an exercise.

| Effective role | Operational definition | Default eligibility before preference/context overlays |
|---|---|---|
| MAIN | Exact configuration retained as a block's goal-specific reference, essential primary task or intentional skill/progression anchor. Can be a barbell, machine, dumbbell or bodyweight task; compound status, exercise order and load size alone do not decide it. | BLOCK_BOUNDARY_ELIGIBLE: no scheduled within-block replacement. |
| ACCESSORY | Complementary task whose essential contribution can be preserved by a reviewed alternative without removing the block's main reference. Isolation, unilateral or runner support can fit here; none is automatically interchangeable. | TWO_WEEK_ELIGIBLE only when all eligibility conditions below pass. |
| PRACTICE | Task currently serving technique acquisition/competency rather than variety. Existing catalogue practice tasks and STIL/TDF technique semantics justify this third category. It can also describe a temporary learning purpose; a main lift being learned remains protected MAIN. | REASON_ONLY until a deliberate reviewed role/context transition; not automatic graduation after elapsed weeks. |

**Close variation is a directed relation, not an additional role.** It requires an explicit source/target configuration, same relevant task/pattern purpose and target contribution, acceptable ROM/support/grip/laterality/skill/resistance changes, and a reviewed dose/demand comparison in the actual context. `variantOf` is a family hint, not proof of closeness, equivalence, transitivity or transferable load. A supporting close variation is ACCESSORY; if it is itself the selected main task, it is MAIN and stays. The anchor and a supplementary close variation must be distinguishable in the block; never relabel the anchor ACCESSORY at a fortnight to evade stability. Permission to vary does not require adding a supplementary slot, exercise or volume just to create variety.

**Running-specific strengthening is purpose**, reusing `runningSupport` and objective/SessionIntent refs; no `RUN_SPECIFIC`, `SPORT_SPECIFIC` or `REHAB_LIKE` role is added. Running support can be a stable MAIN or a rotatable ACCESSORY. Transfer and injury prevention are not implied. Laterality, pattern, muscles, loading and technique remain existing independent attributes. TDF's equipment term `anchor` means a physical attachment, not this programming role.

## 3. Eligibility and operational cadence

Three values suffice; all admit a separately justified substitution path:

- **REASON_ONLY:** no scheduled selection change; changes require a material reason, coverage and agency. FIXED and current PRACTICE use this behavior.
- **BLOCK_BOUNDARY_ELIGIBLE:** selection review at a deliberate block transition, nominally six weeks here; keeping the exact task is allowed and often preserves task specificity. Before the boundary, reason-based changes remain possible.
- **TWO_WEEK_ELIGIBLE:** selection may change at the fortnight review or block boundary if the athlete chose that preference and the directed alternative passes all gates. Eligibility never guarantees that a candidate exists or requires replacement.

**All conditions must pass:** current eligibility/authority and complete configuration; known relevant equipment and competence; explicit purpose/stimulus preserved; actual exposure and establishment/confirmation sufficient under the applicable method; no unresolved learning or comparable-data requirement; accepted phase permits novelty; alternative's dose, local/axial/eccentric/systemic demands and recovery cost are supportable in the joint Run × Strength horizon; chosen days, turns, session time and unilateral/bilateral needs remain feasible; no simultaneous progression step on the new exercise; athlete's valid agency covers the change. Missing critical facts → ASK/HOLD only the dependent change. KEEP is an option only if the existing prescription remains valid and adequate.

**Proposed cadence semantics:** review opportunities follow the accepted block, ordinarily before weeks 3 and 5, with the broader review after week 6/before week 7. They concern future unstarted sessions only. Plan revisions supply the schedule and last accepted selection change; elapsed time supplies no execution credit. A delayed/missed review creates no replacement debt, batch catch-up or shortened exposure window. A reason-based replacement starts that slot's new selection period; do not rotate it again at the next global tick unless its own accepted two-week period and all gates are satisfied. Do not reset other slots or infer that two calendar weeks establish skill. Current protected phases/establishment/return gating can defer several opportunities; reconsider at the next admissible review, without automatic post-event novelty.

Two weeks is therefore **a preferred opportunity to review eligible selection**, not a promise of a wholly different workout every fourteen days. When no jointly valid alternative exists, explain the retained selection or resolve the dependent inadequacy. No numerical change quota, percentage of exercises, exposure-count threshold, fatigue score or new recovery timer is proposed. Routine changes are planned/systematic and explained; random shuffle is excluded. Existing accepted A/B session variants may recur without a fresh mutation on every exposure.

## 4. Decision matrix

Machine companion: [DECISION_MATRIX.json](DECISION_MATRIX.json), a reviewable rule table and synthetic witnesses, **not a runtime policy or formal schema**. Rules compose: coverage/clinical gates → material reason → phase/learning/context veto → role × preference → directed-candidate validation → agency/adoption. A clinical/coverage restriction can never be bypassed by a reason or preference. A reason bypasses nominal cadence, not validity.

| Role / currently valid context | FIXED | EVERY_2_WEEKS | EVERY_6_WEEKS | COACH_DECIDES |
|---|---|---|---|---|
| MAIN, goal/reference/skill stable | Retain; reason path only | Retain within block; review at six-week transition | Review at six-week transition; no compulsory swap | Retain within block; review at transition or stated material purpose |
| ACCESSORY, established/competent, admissible directed alternative | Retain; reason path only | Eligible at fortnight; keep when no admissible alternative | Eligible at six-week review | Retain within block; eligible at block review or stated material purpose |
| PRACTICE / unresolved learning task | Retain valid task; reason path | No calendar swap; resolve learning/role at deliberate review | No calendar graduation | Same; no forced novice override or automatic progression |

| Athlete/context overlay (all preferences) | Allowed behavior / implication |
|---|---|
| Beginner or new to the exact task | Preserve learning and effort establishment. No blanket cancellation of the chosen preference: established simple accessories can still be eligible; explain task-specific deferral. Global experience is not task competence. |
| Intermediate/advanced, specific lift goal | Preserve exact main configuration for specificity and comparable tracking, including beyond six weeks if still purposeful. Experience does not make every alternative eligible. |
| General fitness/hypertrophy, established task | A machine or compound can be ACCESSORY if the main reference and essential contribution survive. Objective alone does not prove substitution equivalence. |
| Strength 2×/week | Use actual exposures per slot; twice-weekly strength does not mean twice-weekly exposure to every movement. Preserve needed practice/comparability; no inferred minimum count. |
| Strength 3–4×/week | Stable different-day references can coexist. More days neither accelerate the calendar cadence nor multiply total weekly load. |
| Hybrid with important run session | Protect that explicitly contextual priority; keep familiar work if novelty threatens it. Compare smaller covered content/dose/order changes before substitution. No secret runner-first or universal hour rule. |
| SPECIFIC/TAPER/RACE_WEEK/POST_EVENT, current R6 scope | Defer elective changes, including at a block boundary; necessary covered substitution/hold is separate. Do not introduce novelty because the taper just ended. |
| Establishment / current return or re-establishment dependencies | Defer elective change while dependent task is unresolved; use factual exposure/confirmation and latest R7 rules. Calendar labels earn nothing. |
| Fixed-equipment or no reviewed alternative | Keep adequate familiar selection, explain limited variation. If equipment removes current feasibility, use reason path or ASK/HOLD, never invent a machine substitute. |
| Missing critical skill, dose, recovery or coverage evidence | Ask the minimum decisive question or retain dependent uncertainty. Missing data is neither intolerance nor clearance. |
| Essential unilateral/bilateral, ROM or contraction requirement | Preserve that requirement or declare the loss and obtain a separately justified change. Same muscle/pattern is insufficient. |

## 5. Concrete scope checks — conditional examples, not approved pairs

These are semantic walkthroughs under hypothetical adequate eligibility and covered doses unless explicitly unsupported. Names appearing in the R6 catalogue prove identity availability only, not universal prescription or pair approval. No actual plan, archetype, loading recipe or new exercise entry is created.

| Movement / use | Effective role and fortnight behavior | Failure the rule prevents |
|---|---|---|
| Back squat or leg press as principal squat task | MAIN; retain exact configuration. Review at block boundary. Squat → leg press is not automatically a close substitute. | Rotating an improving main task or moving its load/PR across machines. |
| Goblet squat complementary to a separate squat anchor | ACCESSORY/close relation only if its distinct contribution and replacement are reviewed; eligible at fortnight. If it is the beginner's main squat, retain as MAIN. | Defining role by barbell versus dumbbell. |
| Conventional deadlift / barbell or DB RDL | MAIN when the target hinge/reference; remain stable. A complementary RDL may be ACCESSORY. Conventional deadlift is not an exact R6 catalogue entry; no V1 recipe approval inferred. | Automatic deadlift ↔ RDL equivalence or novelty-driven eccentric demand near a key run. |
| Bench press / complementary pressing variation | MAIN bench remains; a supporting configuration may rotate conditionally. Grip/angle/equipment change is a new comparability assessment, not free load carry-over. | Calling an anchor's replacement a harmless variation. |
| Row / pulldown | MAIN if selected pull reference. A supplementary pull can be ACCESSORY; horizontal row ↔ vertical pulldown needs task-specific review and may fail the required purpose. | Equating all pulling or reusing stack weights. |
| Split squat / step-up / reverse lunge | Often ACCESSORY in R6; conditionally eligible when competent and laterality, support, ROM, dose and demand survive. MAIN if essential unilateral reference; new balance/skill demand defers rotation. | “Unilateral means accessory” and assuming symmetric/single-leg equivalence. |
| Hip thrust / bridge | ACCESSORY when complementary; eligible only with reviewed configuration/intent. MAIN if the block intentionally tracks it as primary task. RDL is not an automatic substitute. | Treating every posterior-chain movement as the same stimulus. |
| Hamstring curl | ACCESSORY can be eligible, or protected MAIN for a specific tracked task. Not an R6 catalogue entry; exact V1 coverage/pair approval is absent. | Replacing knee-flexion intent with an RDL or introducing Nordic work from its name. |
| Calf raise, standing/seated/supported | MAIN if a protected calf-strength reference; otherwise ACCESSORY may vary. Knee position, loading/support, ROM and laterality require separate configuration review. Current catalogue has standing/DB/supported, not blanket seated coverage. | Swapping soleus/gastrocnemius emphasis or support requirements without validation. |
| Foot/ankle or tibialis work | No blanket fortnight permission from anatomical label. Tibialis/foot-specific recipes not in R6 catalogue; defer exact coverage to B0. If later covered, assign by purpose like other tasks. | Inventing preventive/rehabilitative protocols or rotating away a needed contribution. |
| Plank / side plank / dead bug / Pallof | ACCESSORY may vary only if the defined trunk purpose and completion/contraction remain supported. Core has no blanket rotation exemption. Side plank/dead bug/Pallof exist in R6; generic plank configuration needs coverage. | Treating anti-extension, anti-lateral and anti-rotation tasks or timed holds/reps as interchangeable. |
| Copenhagen/adductor work | No exact R6 coverage found; candidate ontology says lateral-hip/adductor coverage is open. No pairing or dose proposed. | Promoting a requested example into approved V1 or a groin rehabilitation routine. |
| Runner-specific unilateral strength | Running purpose does not change the role rule: stable MAIN if task-critical; eligible ACCESSORY only with familiar admissible alternatives and protected run stimulus. | Assuming all runner support is expendable or lower cost. |
| Plyometric-strength/hopping/bounding | No exact reviewed R6 catalogue/recipe found; TDF explicitly leaves plyometric coverage open. OUTSIDE_CURRENT_REVIEWED_COVERAGE for this policy's examples; do not introduce via rotation. | Inferring jump prescription/safety/skill or run transfer from literature/family name alone. |
| Technique practice / regression | PRACTICE; no scheduled change while technique purpose unresolved. Material mismatch can require a covered simpler task or ASK/HOLD; no invented coaching/clinical technique protocol. | Changing the movement just as learning starts, or retaining an unsuitable task for stability. |

### Cross-context witnesses

1. **Beginner, 2× strength, two-week preference:** main goblet squat stays; learning split squat is deferred; an already competent eligible accessory may change. Explain partial variation without overriding the preference globally.
2. **Intermediate, 2× strength:** main bench/row/hinge stay; an accessory encountered only once weekly is evaluated on its real record, not four assumed exposures. Low frequency is not an automatic veto or entitlement.
3. **Advanced, 4× strength, exact squat goal:** separate stable day-specific references stay; eligible complementary selection may change after its own two-week period. Extra days add no load by themselves.
4. **Hybrid, 3× strength, protected threshold/long run:** a proposed unfamiliar eccentric/unilateral change fails the joint demand check if unsupported; retain adequate familiar selection or address the actual conflict with a smaller covered intervention. Priority is derived, not a permanent athlete label.
5. **One fixed machine / limited home equipment:** no admissible alternative means no compulsory fortnight swap. Unavailable current equipment takes the reason path; no cross-machine kilogram mapping.
6. **FIXED with unavailable bench:** the preference does not veto a necessary valid substitution; obtain agency and establish the substitute. If no covered alternative, ASK/HOLD dependent prescription, not automatic KEEP or REST.
7. **Fortnight due in taper or after missed establishment:** defer. Neither the tick, released plan nor calendar absence proves readiness or establishment; no catch-up churn later.
8. **Calf or hip thrust is the primary tracked task:** preserve as MAIN despite default catalogue ACCESSORY; the future contextual assignment needs explicit purpose/provenance, not a permanent relabel of the catalogue.
9. **Plateau label after one non-PR session:** insufficient reason. Inspect comparable opportunity, actual dose/effort, constraints and response; do not promise that exercise rotation fixes stagnation.
10. **Discomfort with persistent pain/new functional limitation:** cadence and preference are irrelevant to the clinical boundary; withhold dependent prescriptive judgment and route to a qualified human. This proposal supplies no “safe alternative.”

## 6. Exceptions: ordered screening, not a mechanical medical ranking

Coverage, policy validity, factual reconciliation and clinical restrictions are outer gates. Within them, evaluate all material reasons together; if two compete, protect safety/validity first, then essential stimulus and contextual priority/MEC, then preference/cadence. The numbered hierarchy does not assert comparative medical severity.

| Order / reason | Required response |
|---|---|
| 1. Pain/discomfort/restriction | Do not treat pain as effort or infer a diagnosis. Clarify material symptoms/restriction. Persistent pain, new functional limitation, injury/illness/pathology or clearance dependence → CLINICAL_HUMAN_REQUIRED. Nonclinical discomfort permits only an already covered, admissible agency-confirmed alternative; otherwise ASK/HOLD dependent judgment. |
| 2. Equipment unavailable or clear task/skill mismatch | Resolve practical feasibility/competence now, even for MAIN/FIXED. Use a covered familiar alternative preserving intent, or a covered establishment/practice route; no eligibility by equipment presence or invented technique standard. |
| 3. Clear intolerance/recovery inadequacy | Require material contextual evidence, not a fixed fatigue band, isolated bad session or inferred mechanism. Compare KEEP if adequate and smaller covered changes before replacing. Clinical indicators route to row 1. |
| 4. Interference with protected run (or strength) stimulus | Inspect dose, timing, novelty, local/axial/eccentric burden, recovery and priorities jointly. Overlap alone proves neither harm nor required change. Use covered MEC; negotiate a real trade-off when necessary. |
| 5. Plateau/stagnation | Requires relevant comparable evidence under an applicable method; absence of PR is insufficient. Examine inadequate opportunity/effort/data/goal and smaller changes before selection. No newly invented plateau threshold or automatic deload. |
| 6. Deliberate block/goal transition | Reassess main references and supporting contribution prospectively; can change them with purpose/coverage/agency. Six weeks never proves failure or makes a new selection obligatory. |
| 7. Preferred scheduled variation | Only the remaining eligible slots and accepted systematic choice. Always subordinate to the above gates/reasons. |

A necessary reason can override both a protected anchor's within-block retention and FIXED. It cannot override clinical limits, missing sporting authority, invalid dose or athlete agency. Rejection of a proposal never authorizes maintaining invalid work. Record reason, affected scope, alternatives, preservation/loss and review condition in existing DecisionTrace; preserve completed work/history. A new configuration gets its own comparable baseline and approved effort-guided establishment, with no formula translating the old load and no coincident progression step. A previously used exercise retains history, but resumption uses current applicable recency/return/confirmation rules, not automatic restoration. This proposal changes no R6 numeric rule or R7 factual amendment.

## 7. B0 metadata implications — design inputs only

No repertoire/archetype, storage schema, validator, catalogue entry or runtime field is implemented. [STIL](../../product/STRENGTH_INTELLIGENCE_SPEC.md) §§2/5–7 already requires most of the representation. TDF 0.2 data/ontology are **candidate reference**, not adopted schema or exercise approval.

| Existing carrier | Reuse / minimum proposed clarification |
|---|---|
| Stable exercise/configuration ID + revision, equipment AND-set, load convention/increments, resistance mode, laterality, ROM/skill | Already required. Preserve exact configuration for anchor tracking and establishment; do not create rotation-specific exercise copies. |
| Catalogue `role`, STIL prescription intent, TDF `session role / criticality` | Keep static hint; derive effective MAIN/ACCESSORY/PRACTICE per block/slot from purpose and context. **Clarify contextual assignment**, not a global role migration; material assignment needs reason and trace. |
| `variantOf`, patterns, muscles and directed `SubstitutionRelation` candidate | Family hint is insufficient. Reuse directed from/to configuration refs, preserved/changed/lost dimensions, purpose, conditions, dose/comparability and authority refs to express close variation. No `isCloseVariation` boolean on every exercise. |
| `runningSupport`, objective tags / SessionIntent | Reuse intended running purpose, separate from role, proof of transfer and admissibility. No generic new-sport or rehab role. |
| Existing demand/athlete/recovery/skill/exposure assessments | Reuse dose/configuration/athlete-specific local, axial, eccentric and systemic demand with provenance/unknowns. No fixed exercise recovery score or universal `rotationSafe` flag. |
| Existing practice-context rotation preference | Reuse COACH_DECIDES / EVERY_6_WEEKS / EVERY_2_WEEKS / FIXED. Preference never rewrites goals, frequency, planned dose or authority. |
| Existing block/plan revisions, factual execution, progression and DecisionTrace | Derive next review window, last adopted selection change, actual exposure/establishment, deferral reason and exception. No second ledger, clock service or exposure counter. History is retained across selection changes. |
| Existing policy/method/authority refs and validity | Reuse exact reviewed population/task/conditions/version; no approval inferred from this proposal, family name or seed presence. |
| **Only potentially new concept: derived rotation eligibility** | Three-value result REASON_ONLY / BLOCK_BOUNDARY_ELIGIBLE / TWO_WEEK_ELIGIBLE, with existing rule/context refs and reason. It may be computed within selection assessment/DecisionTrace; do not add a persisted field unless B0 demonstrates an unmet representation need. Unknown assessment is existing missingness, not a fourth enum. |

**Future repertoire/archetype interaction:** an authorized foundation should bind stable task slots/intent and permissible configuration relations to exact reviewed envelopes. A block's main assignment constrains composition; accessory alternatives fill a slot without deleting its contribution. Different eligible slot options do not require an archetype for every combination or a complete all-pairs substitution graph. Composition still validates aggregate stimulus/demand, equipment/time, agency and joint horizon; slot-level eligibility alone cannot certify a valid week. This mission supplies these questions/constraints only. No slot catalogue or archetype is instantiated, and no B0 phase/gate is opened.

## 8. External evidence: narrow guardrails, not repository decisions

Decision questions: does available evidence establish a universal two-week exercise-selection optimum or override task-specific stability? Does a running-support label establish interchangeable stimulus or readiness for novel plyometrics? Search on 2026-10-30 used PubMed/PMC/publisher records for exercise-variation reviews, the current ACSM review and runners' economy. Stop at applicability/cadence limits; no dose, recovery interval, rehabilitation or exercise-pair recipe was researched. Queries/access and source hashes are in [SOURCES.json](SOURCES.json).

- **E1 — Currier et al., ACSM 2026, overview of reviews**, DOI 10.1249/MSS.0000000000003897. [Full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/), methods, discussion and specificity/individualization/variation sections inspected. Healthy adults; diverse RT comparisons; review-level heterogeneity and indirectness to exact lift selection, advanced hybrid athletes and fortnight cadence. Supports goal/context individualization; variation/periodization findings do not establish this exact cadence. **SUPPORTED_WITH_LIMITS; moderate confidence** for rejecting claims of a universal optimal schedule. Counterpoint: specificity does not mean fixed selection is universally superior. **Recommendation/inference:** protect task-specific reference work while allowing purposeful alternatives; the paper does not validate this proposal's taxonomy or algorithm.
- **E2 — Kassiano et al., 2022, systematic review**, DOI 10.1519/JSC.0000000000004258. [PubMed abstract](https://pubmed.ncbi.nlm.nih.gov/35438660/) inspected; eight studies/241 young men. Suggests systematic variation may help some regional outcomes and warns against excessive/random variation. **ABSTRACT_ONLY / auxiliary**, no full-paper bias appraisal or prescription approval. Counterevidence to permanent all-exercise rigidity; does not establish two weeks, six weeks or universal benefits. **INSUFFICIENT_EVIDENCE** as standalone support for a cadence; no dependent prescriptive rule relies on it.
- **E3 — Llanos-Lagos et al., 2024, systematic review/meta-analysis**, DOI 10.1007/s40279-023-01978-y. [Full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC11052887/), eligibility, results, certainty and limitations inspected. Middle/long-distance runners; strength-method comparisons and running economy, not selection cadence or clinical safety. Certainty moderate/low; economy assessment and method heterogeneity limit generalization; overall and speed-dependent plyometric results differ. **SUPPORTED_WITH_LIMITS; moderate confidence** for treating running transfer as method/context dependent. **Recommendation/inference:** no interchangeability/individual transfer guarantee and no plyometric coverage expansion from a sport tag. No new dose or rotation interval follows.

**Evidence boundary:** no accessed source establishes the proposed exact fortnight rule for all groups; that remains a product preference with conditional conservative implementation. No claims of avoiding plateaus, preventing injuries, muscle confusion or superior gains are made. External evidence does not overrule repository authority or approve a specific pair. The independent reviewer evaluates proposal coherence separately; no sporting gate/queue or canonical policy is closed here. All real prescriptive adoption remains subject to competent review and the existing funded-human revalidation process.

## 9. UI-copy implication and Founder choice

**“A cada 2 semanas” remains a usable short preference label only with qualifying text.** Alone it suggests guaranteed broad replacement. Proposed helper: **“Revisamos acessórios e variações próximas; os principais ficam.”** Supporting line: **“A troca depende do seu momento e do equipamento. Cada exercício novo começa com um ajuste de carga.”** Existing acceptable helper recorded by SSCTR r4 is “Os principais ficam; trocam os acessórios e as variações deles”; the proposal tightens both scope and conditionality. If shown without the supporting line, include the load-adjustment meaning nearby. Never promise uninterrupted load progression across different tasks. This is a copy recommendation only; no Figma inspection/edit or new UI surface happened.

**Preferred policy:** conditional fortnight opportunities for ACCESSORY, including reviewed complementary close variants; exact MAIN stable within block; PRACTICE protected; six-week broader review; necessary substitutions independent of cadence. This fulfills the prior Founder scope without classifying all runner work or all compound lifts identically.

| Alternative briefly rejected | Trade-off |
|---|---|
| Full exercise replacement every two weeks | Conflicts with the existing Founder choice, loses stable task references and can repeatedly force establishment. Block progress alone does not solve task-specific comparability. |
| R6 accessory-only forever, excluding all close variations | Valid current bounded runtime limit; retain until separately authorized adoption. Insufficient as the final product interpretation of the already chosen complementary-variation scope. |
| Permanent fixed catalogue whitelist of “main lifts” | Simple but misclassifies machine anchors, goal-specific calf/hip-thrust work and beginner tasks. Contextual assignment is necessary. |
| Mandatory percentage/count of replacements | Creates churn or invalid options when coverage, learning, equipment or running context constrain selection; no supported universal quota. |
| Add SPORT_SPECIFIC/REHAB/CLOSE_VARIATION exclusive roles | Confounds purpose/relation/clinical scope with task role, duplicates existing metadata and expands taxonomy without need. |

**Unresolved questions / owners:** Founder accepts or revises this proposed meaning and conditional UI promise. Later authorized Product/UX + Strength/SSCTR decide exact contextual assignment and directed configuration coverage; B0 may resolve representation details only when separately started. No exact close-pair coverage, universal minimum exposures or automatic plateau criterion is claimed. Copenhagen/tibialis/plyometric and absent machine/configuration recipes remain unsupported until reviewed; they do not block this semantic decision. A future canonical sync must reconcile held OB-2 ops, DR-113, D04 and R6 limits in its own authorized mission; do not apply patches wholesale.

**Completion boundary:** consult [VERIFICATION.json](VERIFICATION.json) and [INDEPENDENT_REVIEW.md](INDEPENDENT_REVIEW.md) for exact checks, artifact hashes and review limitations. B0 is not started; no repertoire/archetype or actual training plan is created. Current R7-A exit status/rechecks are not changed. Stop at proposal delivery; Founder approval and later policy publication/implementation are separate acts.
