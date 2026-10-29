# G01/G02 provisional scientific pilot — SSCTR-PILOT-20261023-r1

**2026-10-23 · SSCTR-1.0.0 · PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY · NOT_PUBLISHED.**

The pilot has actually reviewed the G01 scope prompts, the controlled Run-first/Strength-first lower × intended-threshold pair and all five policy wordings. It accepts **nine bounded scope definitions and four policy wordings with conditions**, requests revisions/proofs for the rest, and **abstains from approving S01/S02 prescription or adaptation**. This is a useful scientific result: neither proximity nor priority establishes that a change is necessary. Missing athlete data remain missing; the absence of a hired human is no longer the administrative reason for an otherwise supportable nonclinical decision to stop.

Reviewer `/root/sports_science_pilot` is a software instance that explicitly loaded [constitution](../../../governance/agents/sports-science-reviewer/CONSTITUTION.md), [project skill](../../../.agents/skills/sports-science-review/SKILL.md), evidence protocol and decision schema. A new native agent type cannot be hot-loaded into this running chat: this initial mission uses the disclosed generic-instance constitution fallback. It claims no human degree, registration, professional licence, clinical competence, empirical testing or human validation. This instance authored the synthesis; an independent judge must assess it and the agent definition. A self-check is not that gate.

## Bound target, access and authority

Target **TDF-HR-0.2-r1** remains immutable. Exact per-item target hashes, agent/protocol versions, claims, source access, rationale, conditions, confidence and event-based expiry are in [decisions.json](decisions.json). Its 32 records cover 23 G01 prompts, two disambiguated boundary branches, two case decisions and five policy wordings. **13 approved-with-conditions records** (9 scope definitions + 4 wording records) are queued in [HUMAN_REVALIDATION_QUEUE.json](HUMAN_REVALIDATION_QUEUE.json); none is an executable dose approval. G01-08 equipment availability needs revision and is not an approval.

Authoritative targets are the candidate review questions, not new training policies. An approval here means *this candidate definition/wording is scientifically compatible within its stated guardrails*. It does not assert that conditions have been fulfilled for use, that product coverage exists, or that any person can be prescribed to. The original human forms remain unsigned. G01/G02 whole gates, G03/G04, Product/Domain Truth, S01/S02 PASS and runtime remain unchanged by this record. Existing promotion gates still require independent evidence/governance review and competent owners.

The [search log](SEARCH_LOG.md) records exact queries, negative/inaccessible results and exclusion reasons. The [literature snapshot](LITERATURE_SNAPSHOT.json) preserves nine references, read depth and claim IDs. Four source full-text pages were available; selected applicable sections were read, without reanalysis. The other sources are explicitly auxiliary abstract/record access. No abstract-only source independently supports a prescriptive rule. This focused review does not claim PRISMA completeness or a formal GRADE/AMSTAR score.

## Scientific claim map and counterevidence

| Claim | Evidence finding and permitted inference | Status / limit |
|---|---|---|
| CL1 | [Schumann 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC8891239/) bounds chronic CT by outcome; explosive-strength attenuation remains a material exception. | SUPPORTED_WITH_LIMITS. Chronic grouped results are not next-morning readiness. |
| CL2 | [de Carvalho e Silva 2022](https://link.springer.com/article/10.1186/s40798-022-00497-w) addresses acute strength→running responses. Protocol, outcome and timepoint differences matter. | SUPPORTED_WITH_LIMITS. No robust exact time-to-recovery curve for this lower/threshold pair. |
| CL3 | No admitted study validates a universal safe/ideal 12h, 24h, 36h or other spacing for the submitted case. | INSUFFICIENT_EVIDENCE for a numeric cutoff. These are schedule measurements, not recovery guarantees. |
| CL4 | [Nuuttila 2025](https://link.springer.com/article/10.1007/s00421-025-05748-8) provides a measurement counterexample to universal fixed effort anchors. It used Borg6–20, whereas the fixture uses unanchored0–10. | SUPPORTED_WITH_LIMITS as a broad caution only; no scale/numeric transfer or direct test of RPE6/10. RPE remains useful; no universal lab-test requirement. |
| CL5 | Healthy adult recreational training is a reviewable candidate population; the actual project coverage, profile eligibility and recipe adequacy remain unverified. | SUPPORTED_WITH_LIMITS as a bounded scope definition; not a safety/effectiveness claim. |
| CL6 | Priority/MEC/change cost are existing normative product criteria (**DECIDED**), not proven physiological laws. Literature constrains misuse; it does not validate the AE. | Wording compatibility review only. |
| CL7 | The supplied synthetic packet has unknown eligibility, goal/phase, essential stimuli, recovery, calibration, response comparability and change cost. | OBSERVED in project inputs / WELL_SUPPORTED as absence-of-input observation. |
| CL8 | A necessary/sufficient adaptation cannot be selected from those facts. | INFERRED / INSUFFICIENT_EVIDENCE. ASK/HOLD on dependent prescription. |
| CL9 | Human clinical review and unknown-only ASK are authorized boundaries, not medical diagnoses or a new screening algorithm. | DECIDED; clinical situations remain OUT_OF_SCOPE_CLINICAL. |
| CL10 | A universal “CT never attenuates lower maximal strength” rule fails against [Huiberts 2024](https://link.springer.com/article/10.1007/s40279-023-01943-9). | CONFLICTING_EVIDENCE for the universal claim; populations/design definitions differ, so no fabricated same-PICO contradiction. |

[Held 2026](https://link.springer.com/article/10.1007/s40279-026-02401-y) is current umbrella context, read as publisher abstract/refs only. Its aggregated compatibility does **not** erase SS2's explosive-strength endpoint or establish acute recovery. Newer is not automatically decisive; included syntheses overlap. Huiberts' subgroup findings cannot select an action from sex alone, and do not justify assuming the missing sex or training status of synthetic-A.

[ACSM 2026](https://pubmed.ncbi.nlm.nih.gov/41843416/) updates the 2009 strength stand; its healthy-adult outcome framework is auxiliary here, with access limits disclosed. [Campos 2022](https://pubmed.ncbi.nlm.nih.gov/34749417/) adds method caution; no 70/30 universal distribution is adopted. [Cowley 2026](https://pubmed.ncbi.nlm.nih.gov/42458937/) is a small acute crossover used only as auxiliary context; its six-set protocols do not quantify the fatigue cost of the exact squat/RDL/split prescription. [Riebe 2015](https://journals.lww.com/acsm-msse/fulltext/2015/11000/updating_acsm_s_recommendations_for_exercise.28.aspx) is screening-context support only; no medical-clearance algorithm is implemented.

An actual source-status check found [Zhao 2026](https://pubmed.ncbi.nlm.nih.gov/42732577/) has a linked correction. The correction body was inaccessible; it is excluded from decisive inference pending inspection. No admitted source had a notice observed on the accessed records; that is not an exhaustive retraction audit. All bibliographic identifiers/access depths remain inspectable in the snapshot.

## G01 — item dispositions

Each ID maps to `SSCTR-<ID>` in the registry. Every conditional approval is of the *definition*, with real eligibility and verified executable coverage still required. Confidence is MODERATE for these bounded definitions, HIGH that missing evidence prevents individual clearance; HIGH abstention confidence does not mean high training-efficacy confidence.

| ID | Disposition | Reviewed definition / smallest missing proof |
|---|---|---|
| G01-01 | APPROVE_WITH_CONDITIONS | Adult nonclinical recreational scope: general fitness, recreational running and general strength with current objective, relevant documented exposure/tolerance, task competence and compatible equipment. Age alone is insufficient. No arbitrary upper-age limit; materially different contexts need specific scope evidence. |
| G01-02 | APPROVE_WITH_CONDITIONS | Separate never-run, documented nonclinical return and current regular running by actual chronology/exposure/response. Years alone are not a tolerance classifier; ask pause reason. |
| G01-03 | APPROVE_WITH_CONDITIONS | Configuration-specific competence and understood effort instructions; preserve RIR uncertainty. Running experience does not establish strength skill. Need an accepted novice route when competence is absent. |
| G01-04 | APPROVE_WITH_CONDITIONS | First reviewable combined subset: documented regular recreational practice in both domains. Mixed levels need a verified novice subset in the novice domain. Dual novice/elite coverage is unverified, not declared inherently unsafe. |
| G01-05 | APPROVE_WITH_CONDITIONS | General fitness/general strength/recreational running as candidate objectives, with explicit primary outcome, secondary intent and phase. Hypertrophy emphasis needs its own coverage; specialized power/peak/taper are not approved. |
| G01-06 | APPROVE_WITH_CONDITIONS | Adult nonclinical boundary excludes minors and clinical rehabilitation/clearance here. Competitive peak/elite optimization requires separate evidence/coverage review; no blanket ineffective/unsafe claim. |
| G01-07 | APPROVE_WITH_CONDITIONS | Running-only, strength-only and balanced hybrid are reviewable modes, each with own coverage. Priority does not delete a modality or establish necessity. |
| G01-08 | REVISE | Requirements must be recipe-specific AND/OR from verified configurations. Missing one required item blocks that recipe until validated substitution; it does not exclude the entire person. No universal gym requirement or unverified equipment equivalence. |
| G01-09 | APPROVE_WITH_CONDITIONS | Boundary wording: unknown eligibility→ASK/HOLD; real clinical concern→qualified human. No contraindication rule, individual medical assessment or universal referral threshold approved. |
| G01-10 | APPROVE_WITH_CONDITIONS | Learning/technique gap→competent coaching or verified simpler route. Clinical concern→health professional. Missing history alone→ASK. No clinical triage algorithm or legal qualification approval. |
| G01-11 | REVISE | Strength counts do not prove goal-specific repertoire. Need verified configuration/dose/progression/substitution witnesses, including goal-relevant posterior/unilateral/calf/trunk coverage. Checklist is not a mandatory universal exercise battery. |
| G01-12 | REVISE | Running family names do not prove executable/calibrated recipes. Select goal/phase-relevant easy/endurance/progression and only warranted long/threshold/interval/hill/stride/taper routes; no runner must use all families. |
| G01-13 | ABSTAIN | Entire coverage not verified. Chief/curators need profile×mode×equipment×recipe map, progression/substitution witnesses, negative boundaries and G03/G04 dependencies. Legal service-model owner remains separate. |

The candidate definitions can guide the next review without hiring a human for every nonclinical item. They cannot be read as an accepted matrix of all exercise recipes. Source-specific limitations, outcome and confidence are attached to each record. No athlete or catalog was empirically tested.

## G01 — all ten eligibility examples

These are hypothetical boundary judgments, not observed participants. Unknown eligibility is not an automatic clinical referral. E8/E9 contain alternatives that require different routing, so explicit branch records prevent conflation.

| ID | Disposition / operational action | Finding |
|---|---|---|
| E1 | REVISE / ASK | Age34, reported years and 24km/2Strength do not establish eligibility. Obtain restriction/symptom information, goal/phase, competence/calibration and comparable tolerance. |
| E2 | REVISE / ASK | Candidate-positive if documented nonclinical eligibility, current goal, competence, compatible equipment and tolerance are actually present; product coverage still needs executable witnesses. “Assessment available” is not its verified conclusion. |
| E3 | REVISE / ASK | Dual novice/bodyweight+dumbbells: possible reviewed beginner route, but learning/repertoire/progression/eligibility not supplied; do not apply current barbell lower. |
| E4 | REVISE / ASK | Experienced runner remains strength novice; running-only and support-strength routes each need their own coverage. |
| E5 | REVISE / ASK | Experienced lifter remains running novice. Strength-first does not justify threshold exposure without a reviewed entry progression. |
| E6 | REVISE / ASK | Strength-only needs RT coverage; balanced adds running intensity/exposure, combined response and tradeoff semantics. No proof-target does not mean no objective/phase. |
| E7 | REVISE / HOLD | Specialized highly trained peak/power optimization outside pilot acceptance; separate evidence/coverage/coaching review, no invented contraindication. |
| E8 | OUT_OF_SCOPE / CLINICAL_HUMAN_REQUIRED for clinical branch | Clinical rehabilitation/return/clearance requires health professional. `G01-E8-MINOR` separately OUT_OF_SCOPE / NOT_APPLICABLE: minor is outside adult scope, not automatically ill or clinically referred. |
| E9 | OUT_OF_SCOPE / CLINICAL_HUMAN_REQUIRED for clinical signal | New clinically relevant pain/functional limitation→health professional, no replacement dose. `G01-E9-UNKNOWN` separately REVISE / ASK when only restrictions are unknown and no clinical signal is supplied. |
| E10 | REVISE / HOLD recipe | Missing required equipment/no validated substitute makes that recipe unavailable. Ask alternatives; do not exclude whole person. |

Positive/negative witnesses for accepted *definitions*, all explicitly hypothetical:

| Candidate route | Definition-positive witness | Definition-negative witness / retained condition |
|---|---|---|
| Regular recreational hybrid, Run-first/Strength-first/balanced | E2 **with** supplied nonclinical context, actual recent tolerance/competence, explicit dual goals/phase and verified compatible recipe/progression map. | E1 lacks those inputs; E10 lacks recipe equipment. Priority choice never repairs either gap. |
| Recreational running-only | E4 **with** documented running tolerance, eligibility, current goal and a verified running route; strength level not used to classify running. | E5's new runner cannot inherit lifter level or current threshold dose. |
| General strength-only | E6 **with** documented compatible competence/eligibility, goal and RT recipe/progression map; machine/free-weight routes individually reviewed. | E3 cannot be assigned a technically unverified barbell route from equipment availability alone. |
| Running with beginner support-strength / strength with beginner running | E4/E5 **after** distinct novice-domain assessment and accepted beginner route; conditional matrix definition only. | E4/E5 **without** that route retain ASK; no transposed domain level. |

These are logical eligibility examples, not positive performance results or claims that the recipe map exists. Whole G01 remains open for verified coverage and other existing dependencies.

## G02 — controlled Run-first/Strength-first review

All supplied facts are synthetic. Only `priority_mode` differs. `CASE_INPUTS.json` SHA-256 **ca24085d708ee9cadb975030a60a72b685971ddc29c01224619d02831e6c58d7**. Squat/RDL/split doses, RIR, intended-threshold 3×6min at unanchored RPE6, 37min total, 12h end→start/13h start→start spacing, later easy/upper sessions, missing recovery and all unknowns are identical. The reviewer did not import S05 fatigue, infer normality or fabricate availability from blank calendar space.

**S01 RUN_FIRST: ABSTAIN on prescriptive choice; ASK + HOLD dependent prescription. S02 STRENGTH_FIRST: same disposition/action.** Preserve the current candidate as the comparison baseline; that is not an instruction to perform it. Confidence HIGH in insufficiency/boundary, LOW in any particular adaptation's necessity/sufficiency. Neither KEEP nor MOVE/reduction is approved. No real clinical concern is inferred; clinical escalation only follows a real concern.

| Required packet question | Run-first answer | Strength-first answer |
|---|---|---|
| G02-S01-Q1 / G02-S02-Q1 — current adequacy | Unknown: goal/phase, eligibility and essential stimuli absent; general running priority is insufficient. | Same unknowns; general strength priority is insufficient. |
| G02-S01-Q2 / G02-S02-Q2 — material fact | No new fact showing lost adequacy; schedule proximity alone does not suffice. | Same; changing priority adds no physiological fact. |
| G02-S01-Q3 / G02-S02-Q3 — KEEP | Defensible comparator. Could become a plan option after verified eligibility, adequate stimuli and comparable tolerated response; not approved now. | Same criteria. It may be defensible under either priority. |
| G02-S01-Q4 / G02-S02-Q4 — minimum sufficient intervention | Cannot choose without defining problem and sufficient stimuli. ASK/HOLD is information handling, not a new training Change Level. | Same. |
| G02-S01-Q5 / G02-S02-Q5 — MOVE justification | Neither move justified by current facts. Must verify availability, essential stimulus and effects on easy/upper/horizon; no “more hours always better.” | Same; strength-first does not compel moving run. |
| G02-S01-Q6 / G02-S02-Q6 — reductions/micro | No quantified fatigue saving or minimum effective dose established for removing sq-3 or one run repetition. No smaller option shown insufficient. | Same; secondary running stimulus may not be silently sacrificed. |
| G02-S01-Q7 / G02-S02-Q7 — strength attributes | Configuration, dose, actual effort/familiarity/novelty, relevant eccentric/local/systemic demand and comparable response matter; identity/load kg alone is not fatigue. | Same physical reasoning. |
| G02-S01-Q8 / G02-S02-Q8 — threshold attributes | Intended outcome/domain, calibrated intensity method, rep duration/recovery, total work, terrain and capacity/response. RPE6 without anchors does not verify physiological threshold. | Same; strength priority does not fix the missing calibration. |
| G02-S01-Q9 / G02-S02-Q9 — spacing | Assess lower-end→run-start 12h (and start→start13h) relative to acute session quality, with actual sleep/recovery/history; chronic adaptation separately. No universal cutoff. | Same. |
| G02-S01-Q10 / G02-S02-Q10 — only priority reversed | If a genuine conflict is later demonstrated and valid options exist, protect running-essential stimulus first while preserving sufficient strength and progression. | Protect strength-essential stimulus first while preserving sufficient running and progression; no contrast mandated now. |
| G02-S01-Q11 / G02-S02-Q11 — unsafe generalization | No lower-name rule, universal hours, automatic MOVE, sex-only rule, “RPE6=threshold,” fixed reduction %, or inference that recreational CT findings prove elite/taper/clinical adequacy. | Same, including automatic cutting of secondary running. |
| G02-S01-Q12 / G02-S02-Q12 — additional data | Ask eligibility context; objective/phase/essential stimuli; recent comparable exposure and response; current recovery/novelty/competence; intensity anchors; actual horizon, commitments and move availability. | Same minimal facts. Priority may rank later compromises; it does not replace any required fact. |

Ten constitution AE questions are separately answered 1–10 for each case in the registry; question sets are not conflated. Goal alignment, progression, agency, stability, explainability and clinical boundaries are explicit. The explanation/JEV should say “not enough context to decide; these facts would change the answer,” never “12h causes interference” or “you are cleared.”

## G02 — all nine alternatives, same menu in both cases

Dispositions below apply separately to **S01 and S02**. For a currently undefined prescription option, REVISE means *not yet evaluable*, not proof the option is physiologically wrong. No alternative has been shown smaller-but-insufficient; the supplied rejected-smaller list was empty and remains so in the immutable input.

| Alternative | S01 Run-first | S02 Strength-first | Preserve / cost / smallest proof needed |
|---|---|---|---|
| K KEEP | ABSTAIN; analytical baseline only | ABSTAIN; analytical baseline only | Preserves candidate doses/agenda; actual adequacy/eligibility/comparable tolerance unknown. Neither unsafe nor safe is inferred. |
| M micro | REVISE; undefined | REVISE; undefined | Define executable delta/problem and demonstrate relevance; pause/order/density changes are not physiologically free. No invented tiny percentage. |
| V-L remove sq-3 | ABSTAIN | ABSTAIN | 3×5→2×5 at same load removes5 reps; remaining RDL/split/hours unchanged. No established sufficient strength stimulus or fatigue saving. Run priority alone cannot justify it. |
| V-R remove run rep | ABSTAIN | ABSTAIN | Work18→12min; derived active recipe29min, unresolved37min agenda. No proof of sufficient running stimulus; do not silently refill8min or move end-time. Strength priority alone cannot justify it. |
| I load/RIR/intensity/density | REVISE; undefined | REVISE; undefined | Define calibrated dose and essential stimulus; compare loss/benefit. Neither RIR3 nor an arbitrary intensity reduction proves readiness or sufficiency. |
| MV-L move lower to28Oct18h | ABSTAIN | ABSTAIN | Same nominal dose; order reverses and lower ends12h before listed easy. Availability, whole-horizon impact and recovery response absent; not automatic run protection. |
| MV-R move run to28Oct07h | ABSTAIN | ABSTAIN | Lower-end→run-start36h, then23h23min to easy. Clock arithmetic is valid, physiology/availability unproved; not automatic strength protection. |
| SUB substitute | REVISE; no valid relation | REVISE; no valid relation | Need configuration, dose, essential-stimulus equivalence and losses. Remada/row example cannot establish squat or threshold substitution. |
| PR partial replan | REVISE; undefined | REVISE; undefined | Bound multi-session deltas and verified need; compare smaller valid choices and commitment cost. No high level merely from number of MOVEs. |

Conditional change is allowed if later facts show genuine inadequacy. A repeatable loss of key-session quality after comparable exposure could justify reviewing scheduling or dose, but would still require matching the relevant endpoint/phase, lesser alternatives and agency. Conversely, verified current adequacy could justify KEEP. These are **hypothetical branches**, not new observations or automatically accepted recipes. Stable-by-default does not block a larger change when evidence supports it; no such necessity has been established here.

## G02 — five policy wordings

All are **wording reviews**, not registered runtime policies or dose approval. PC-LT-01/02/03/05 have APPROVE_WITH_CONDITIONS / MODERATE confidence / SUPPORTED_WITH_LIMITS; PC-LT-04 REVISE. Their 4 approved items enter the future-human queue because they could influence prescribed training later.

| ID | Reviewed wording / condition |
|---|---|
| PC-LT-01 | Overlap is shared demand, not proof of interference. Define endpoint/comparator/horizon and individual applicability. Chronic compatibility does not establish acute readiness; absence of significance is not equivalence. |
| PC-LT-02 | Priority ranks what to protect among warranted valid options; it cannot manufacture physiological necessity. This is **DECIDED normative AE control**, not scientific validation of an optimizer. Identical priority-test outcomes are allowed. |
| PC-LT-03 | Exercise class can suggest a demand hypothesis; identity alone cannot establish actual fatigue. Use configuration/dose/effort/familiarity/context and response when decision-relevant; do not demand every variable for every decision. |
| PC-LT-04 | REVISE to put eligibility, uncertainty and clinical boundary before necessity/sufficiency/cost. Smaller valid alternatives must be compared; low disruption cost never licenses inadequate or clinically inappropriate training. Stability is not an efficacy result. Product/UX + SSCTR review this exact revision before approval. |
| PC-LT-05 | Quantitative rules need applicable population/dose, endpoint/horizon, measurement, uncertainty and bounds. No universal spacing/HRV/volume threshold approved; specific numbers can be reviewed when evidence truly fits. |

For each, preserve athlete agency, goal hierarchy and progression; change only candidate interpretation. Must not publish as Product Truth, embed in runtime, infer prescription approval or fabricate a universal comparator. Ranges/categories also need support; replacing one invented number with an invented range is not evidence.

## Retained open work and revalidation

[COVERAGE_BACKLOG.md](COVERAGE_BACKLOG.md) owns the explicit remaining denominator and next inputs: G01 coverage/legal dependencies, G02 concrete recipes/necessity, G03 semantics, G04 nonclinical boundaries, other six QUESTIONABLE, C1–C6 and Golden/domain-open. They were not reviewed to closure in this pilot. No scenario count is treated as validated sporting behavior.

All 13 prescriptive-impact definition/wording approvals are immediately **QUEUED_FOR_FUNDED_HUMAN_REVALIDATION**; funding sufficient to hire a professional has **not** been declared. When Founder records that milestone, all applicable entries become HUMAN_REVALIDATION_REQUIRED. A real professional may maintain, modify or revoke, with evidence/identity/scope and rationale; this agent has no veto. Clinical needs never wait for that milestone.

No perpetual approval: every record expires for dependent use at a material literature/correction, population/objective/phase/library/data change, adverse event, runtime inconsistency, or funded-human review trigger. Current evidence and conditions must be rechecked before promotion or any real prescriptive use; this is governance expiry, not a claimed physiological time constant. Chief owns independent source/behavior/governance review and final integration disposition.
