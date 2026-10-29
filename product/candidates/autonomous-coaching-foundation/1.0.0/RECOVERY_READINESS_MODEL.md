# Recovery & Readiness Model

Revision **ACF-1.0.0-r1 / RRM-1.0.0-r1** · 2026-10-23 · **CANDIDATE / NON-AUTHORITATIVE / AUTHOR_SUBMISSION**. Author `/root/coaching_systems_author`. Subordinate to PDM, AEC §§2/7, AEOS §§3–5/9–11 and SIS exposure invariants. Recovery/Load interprets the shared facts; Run and Strength assess requirements of a concrete session; AE owns adequacy, necessity and any plan decision. No numerical recovery score, clinical rule or production readiness model is created.

## RRM-01 — Three questions, three separate outputs

1. **Recovery state:** What do admissible current observations support about systemic context and, where defensible, local recovery? It is a scoped inference with source/protocol/baseline coverage and uncertainty. It is neither a medical assessment nor a training instruction.
2. **Readiness for the planned session:** Given that recovery assessment, actual planned task/configuration, target method, recent exposures, known restrictions and supported recipe criteria, what is known about meeting this session's demands? Readiness is session- and horizon-specific. It can differ between a familiar upper-body task and a run that shares the recently exposed region.
3. **Plan decision:** Does the currently adopted remaining plan remain applicable and adequate, and is a material change necessary under current rules? AE may KEEP, ASK, RECONCILE or HOLD; when required it compares concrete changes under MEC and current agency. A recovery or readiness state never writes a plan mutation.

Keep `RecoveryAssessment`, `SessionReadinessAssessment`, `PlanAdequacyAssessment`, `ChangeNecessityAssessment` and `DecisionRecord` separate in provenance. A favorable signal cannot compensate for a failed HC, restore an interrupted prescription or clear a clinical hold. A concerning optional signal cannot automatically cancel a valid plan. Lack of a numeric score is a supported state, not missing product functionality.

## RRM-02 — Inputs and evidence tiers

All inputs are `Signal` objects with construct, explicit scale/unit/method, observed/received timestamps, reference baseline when used, context, coverage, quality, comparability, freshness rule and source lineage. Unknown/declined/stale/conflicting stay distinct from measured zero. An integration outage describes data availability, not the athlete's physiology.

| Tier | Available evidence | Output allowed / required limits |
|---|---|---|
| `A_RICH_WEARABLE` | Comparable personal baseline and relevant wearable measures plus actual training history and optional confirmed self-report, where authorized. | Triangulated systemic context; session-specific interpretation only with appropriate recipe/response evidence. Richness is not automatic HIGH confidence. Device algorithms and correlated signals cannot be counted as independent replication. |
| `B_PARTIAL_WEARABLE` | Some usable wearable signals, incomplete protocols/baselines or temporal coverage, plus training history/self-report as available. | Use only comparable constructs. Explicitly mark unavailable dimensions and confounders. A noncomparable metric is excluded, not rescaled into an invented score. |
| `C_HISTORY_SELF_REPORT` | No wearable; reconciled training history and pertinent voluntarily confirmed experience/context. | Coaching under eligible no-wearable recipes remains possible. No mandatory sensor, lower confidence by stereotype or assumed low recovery. If a decision-critical history/report is unknown, ASK only if it can change the choice. |

Tier is an evidence-availability label, not an authority level, safety verdict, subscription tier or clinical class. Two athletes in tier C can have different decision confidence depending on task coverage; a tier A athlete may still have decisive unknown eligibility.

Potential constructs: sleep quantity and perceived quality; HRV relative to a method-compatible personal baseline; resting HR relative to a compatible baseline; stress and confirmed systemic fatigue; completed run and strength exposure; local muscle/pattern exposure where attribution is supported; session RPE, set RPE and RIR separately; comparable performance deviation; soreness/function self-report separately from pain; recent training density/order; response history; source quality. No metric is mandatory solely because it appears on this list.

For HRV preserve metric and protocol (for example RMSSD versus SDNN), acquisition method, measurement context, baseline construction and comparability. Baseline availability does not establish a dose rule. A single proprietary recovery score or isolated HRV change cannot choose a training reduction, demonstrate fatigue or confer readiness. Exact interpretation thresholds require their own supported method and review. Source freshness is assessed for the decision construct using material context changes and an approved validity rule, not a universal TTL. Historical training remains historical fact even when too old to represent current readiness.

## RRM-03 — Assessment states and confidence

Systemic assessment uses `NO_MATERIAL_CONCERN_SUPPORTED / MATERIAL_CONCERN_SUPPORTED / MIXED / UNDETERMINED`, each bound to observations and a current interpretation rule. `NO_MATERIAL_CONCERN_SUPPORTED` means no supported concern *in assessed dimensions under this rule*; it does not say recovered, safe, healthy or ready for all workloads. Without an approved interpretation rule return UNDETERMINED and preserve factual observations. Local assessments use the same epistemic states **only** for the named region/task/construct under defensible attribution. Otherwise omit the local inference with `LOCAL_STATE_NOT_DEFENSIBLE`; recording a soreness report does not require pretending to estimate muscle recovery.

Session readiness uses `REQUIREMENTS_SUPPORTED / REQUIREMENTS_NOT_SUPPORTED / UNDETERMINED / NOT_ASSESSABLE`, with specific requirement-level assessments. A task can have supported logistics and target calibration while systemic evidence is mixed. REQUIREMENTS_SUPPORTED is not a guarantee of completion or absence of risk. A clinical hold is recorded separately and dominates dependent recommendations regardless of readiness. NOT_ASSESSABLE identifies an absent approved criterion or incompatible task, rather than calling the athlete unready.

Confidence is a dimensioned assessment of data quality, comparability, coverage, interpretation applicability and action comparison: `LOW / MODERATE / HIGH / UNASSESSED`, each with reasons and material unknowns. Do not average these dimensions or produce a probability of safety. Comparison status is `SUPPORTED / UNDERDETERMINED / NOT_EVALUABLE`. A numeric prediction is prohibited until its event target, calibration, validation population and limitations are separately approved.

Converging comparable sources can support an assessment under a reviewed rule. Conflicting sources remain visible; more readings from the same episode cannot outweigh a material contradiction by count. Recent lower-body exposure is a fact about demand, not proof of fatigue or interference. A measured performance decrement needs comparable target/effort/environment and context; its cause remains uncertain unless separately established.

## RRM-04 — Session readiness and minimum useful ASK

The consumer supplies the *concrete planned revision*: essential stimulus, actual sets/intervals/targets, calibrated method, expected local/systemic demand dimensions, equipment and phase. Evaluate each required predicate against current permitted evidence. If a relevant limitation affects a particular run requirement but not an independently covered upper-body task, retain the scope boundary; do not issue a whole-account hold or prescribe the other task merely because it seems less affected.

`AskValueAssessment` is a structured branching test, not a numeric expected-value score:

1. Identify the unresolved fact/preference and the supported candidate decisions it separates.
2. Enumerate permitted answer classes, including UNKNOWN/DECLINED, and the resulting route for each. Do not ask if every answer yields the same legitimate action, unless the information is necessary to honor a right or confirmed user purpose.
3. Ask the smallest pertinent question when at least one truthful answer could change the supported action, authority or eligibility. Explain the direct decision consequence without requiring an intimate diagnosis or a daily battery of inputs.
4. Distinguish a missing preference/fact from missing scientific authority. The athlete can confirm actual activity, schedule, perceived effort or a voluntarily reported restriction. They cannot approve an unsupported return dose or clear a professional restriction by accepting risk.
5. UNKNOWN/DECLINED retains uncertainty and a scoped alternative or HOLD where required; it is not treated as denial of symptoms. No-wearable status itself produces no repeated sensor ASK.

Example branches, **normative contract witnesses only**: a delayed activity may have happened (RECONCILE/ask actual completion before calling it missed); a single low-quality HRV signal with otherwise sufficient independent current evidence does not compel a question or mutation; local soreness with unknown functional impact may make a narrowly phrased functional-context answer decision-relevant under a reviewed policy; persistent pain or illness-dependent return routes to E/HOLD rather than another score or generic easy session.

## RRM-05 — AE consumption, MEC and reevaluation

Pipeline: reconcile → recovery projection → session-specific requirements → HC → current-plan adequacy → necessity → concrete permitted candidates → MEC/B0 → agency → prospective effect. This assessment can be recomputed without a plan revision. Adequate valid plan yields KEEP/learn-only. An unresolved independent optional metric need not block an approved no-wearable path; a critical unknown cannot be cured by high confidence elsewhere. If inadequacy and necessary change are supported, candidate dose and its whole-horizon interaction require their own scientific support; readiness state does not supply them.

Next checks are event-based and recipe-specific: before the affected session or next evaluated horizon; on confirmed new material context, relevant corrected source, newly active restriction, changed prescription/target/calibration, updated authority or permission, or an observed comparable response. This defines reevaluation triggers, not a universal medical cadence or recovery duration. Resolved concern requires evidence and current gates under the applicable rule, never passage of time alone. Clinical restriction release remains with its competent owner.

Consumers are `POL-05` local fatigue, `POL-06` systemic fatigue, `POL-07/08` interaction and double session, `POL-16/17` tolerance, `POL-18/19/20` bounded or in-session adaptation, and hybrid initial planning where context materially affects eligibility. Exact scientific support is carried by `SCIENTIFIC_SYNTHESIS.md`, `LITERATURE_SNAPSHOT.json` and the independent item registry. Unsupported thresholds, local recovery mappings, exact return doses or automatic sensor-to-plan rules remain open; this author issues no sports approval or runtime gate.
