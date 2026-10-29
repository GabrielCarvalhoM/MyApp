# Athlete Response & Learning Model

Revision **ACF-1.0.0-r1 / ARM-1.0.0-r1** · 2026-10-23 · **CANDIDATE / NON-AUTHORITATIVE / AUTHOR_SUBMISSION**. Author `/root/coaching_systems_author`. One Athlete Context/AthleteState under PDM I1/I10–13 and AEOS §§3–4/10/14–15; no production model, clinical inference or online training. This is a qualitative auditable personal-response contract, not an assertion of calibrated individual causal prediction.

## ARM-01 — The loop and its distinct objects

`planned stimulus → actual stimulus → observed response → inferred response pattern → updated athlete model → future prescription`.

1. **Planned stimulus** references immutable original, adopted and actually executing target versions by step/set/repeat. The plan is intent, not dose actually received. Accepted in-session withdrawal changes only the prospective target map; the completed prefix preserves its executed version.
2. **Actual stimulus** is reconciled exposure by canonical fact/revision/segment. It includes known work and explicit unknown remainder, configuration, target method, effort, context and attribution. A provider completion flag, export receipt or absent upload does not establish exposure. Partial and above-target work remain factual observations without success/failure judgment.
3. **Observed response** records comparable performance, confirmed effort/local/systemic experience, recovery context and timing. Separate immediate session response, subsequent-session performance and longer-horizon trend. No causal interpretation is attached by ingestion. Soreness is not a diagnosis, effort is not pain and performance difference is not automatically adaptation.
4. **Inferred pattern** is a versioned hypothesis about a bounded task/context/outcome. It states supporting and opposing episodes, comparable opportunity coverage, confounders, current uncertainty and where it must not generalize. Example: a *synthetic* athlete repeatedly reports poorer threshold execution following a particular lower-body configuration in a particular schedule. That is not a rule that every lower session harms every threshold session.
5. **Athlete Model update** revises only supported projections and history under the permitted purpose. Learning can correctly update uncertainty while keeping the same plan revision. No updated model writes a prescription or registry approval.
6. **Future prescription** consumes an admissible hypothesis only through an approved policy and current snapshot. Reassess eligibility and plan adequacy; a valid adequate current week remains KEEP/learn-only. A later-cycle choice may prefer a supported alternative within an already reviewed option set. New dose ranges, thresholds or causal policies require independent review; a personal pattern never overrides HC, clinical restriction or the supported population boundary.

## ARM-02 — Five evidence classes; no numeric mixing rule

| Evidence class | Meaning | Permitted role |
|---|---|---|
| `POPULATION_PRIOR` | Reviewed literature/principle with explicit population, intervention, endpoint, horizon and limitations. | Supplies a bounded starting option set; does not predict the athlete's exact response. |
| `RECENT_OBSERVATION` | A particular reconciled exposure-response episode with context and known coverage. | Updates current uncertainty and primary-horizon evaluation; one noisy episode cannot become a stable personal trait. |
| `ATHLETE_SPECIFIC_EVIDENCE` | Multiple distinct comparable episodes for the same defined construct, including counterevidence. | Can qualify which supported options are more suitable for this athlete under a sufficiency rule. |
| `LONG_TERM_PATTERN` | A sufficiently stable scoped hypothesis spanning relevant opportunities and contexts without unresolved decisive contradiction. | Informs later decisions within approved bounds until invalidated, drifted or purpose-revoked. |
| `UNKNOWN` | Missing, incomparable, conflicting, insufficient or prohibited evidence. | Remains explicit; no zero response, normal recovery or negative adherence is imputed. |

These classes are roles in provenance, not a hierarchy that lets a personal anecdote defeat established constraints. As comparable within-athlete evidence becomes sufficient, a reviewed decision rule may give it precedence over a *nonbinding population default* when choosing among equally authorized alternatives. Record the displaced default, decisive evidence and retained limits. No arbitrary Bayesian weight, count threshold, percentage improvement or claim of individualized causal effect is supplied. If a numeric model is later proposed, its prediction target, measurement error, calibration, holdout and external validity need a separate gate.

## ARM-03 — Sufficiency predicate and hysteresis

A hypothesis is `SUPPORTED_FOR_BOUNDED_USE` only when **all** required predicates of a versioned per-construct sufficiency rule are resolved. This is a logical conjunction, not a summed confidence score:

- **Comparability:** explicit task/configuration, executed target, effort construct, measurement method, relevant environment/phase, timing and exposure coverage are adequate for the proposed comparison. Same family label alone fails this check.
- **Distinct repetition:** there are repeated independently occurring episodes rather than mirrored deliveries, segment copies, overlapping summaries or one event counted through multiple sensors. The author does not prescribe a universal observation count. If the recipe needs a count, its reviewed rule supplies and justifies it; otherwise the record explains qualitatively why replication spans relevant opportunities.
- **Convergence:** the direction and practical meaning recur across the decision-relevant observations or independent constructs without a decisive unresolved contradiction. Ten correlated device outputs from one sleep episode are not convergence across independent episodes.
- **Counterfactual opportunity:** the available contrasting episodes or prior comparable performances clarify what is actually being compared. Nonrandomized contrasting histories are labelled observational. Missing comparator prevents causal claims; a bounded association can still be useful if the approved rule permits it and alternatives remain supported.
- **Confounder review:** explicitly assess changed terrain/weather, task/calibration, training phase, total exposure/order, schedule, sleep/stress, equipment/technique and relevant confirmed context. Unknown material confounders limit the conclusion. Do not solicit an unrestricted medical narrative to improve confidence.
- **Coverage and selection:** record both successes and failures, known missed/partial opportunities and unknown periods. Device absence, voluntary logging or an athlete's selective symptom report can censor data; unknown episodes cannot be assigned a desired direction.
- **Hysteresis:** an existing scoped pattern is not reversed by a single contradictory noisy event. Accumulate comparable counterevidence under the same rule and distinguish a *suspension because applicability changed* from a *reversal because a competing pattern is supported*. A safety or authority invalidation takes effect immediately and does not wait for repetitions.
- **Relevance to action:** the proposed use changes an actual supported future candidate comparison, not a dashboard trait or gratuitous personal score. If both candidates remain equivalent, record no decision effect.

All predicate states are `SATISFIED / NOT_SATISFIED / UNKNOWN / NOT_APPLICABLE`, with references and reasons; NOT_APPLICABLE needs justification. Qualitative sufficiency does not mean any author can assert enough: the decision record must enumerate the distinct episodes, comparisons and counterevidence and name the reviewing policy. When materiality or sufficiency lacks an approved rule, store the observations and a candidate hypothesis; do not activate it through an LLM judgment.

## ARM-04 — Learning lifecycle and change points

`UNASSESSED → CANDIDATE → ACCUMULATING → SUPPORTED_FOR_BOUNDED_USE`. A single episode may create CANDIDATE with `NO_STABLE_INFERENCE`; it cannot jump to supported. Insufficient comparative coverage remains ACCUMULATING. Relevant opposed findings create `CONTESTED`; a decisive context change creates `SUSPENDED_CONTEXT_CHANGE`; invalid source/authority/purpose creates `INVALIDATED`; lack of permission creates `UNAVAILABLE_PURPOSE`. A reviewed competing pattern may create a successor `REVERSED` record, preserving the old rationale. Superseded records are history, not live inputs.

A change point is an explicitly documented candidate shift in the generating context: new phase, equipment/configuration, target calibration, altered schedule/exposure, materially changed performance baseline or confirmed pertinent restriction. No universal time-to-expiry or statistical drift threshold is invented. Suspend the dependent generalization, preserve observations in their original context and gather or review comparable current evidence. Returning to the former context may re-open review; it does not automatically reactivate the pattern. Numerical change-point detection remains future gated work.

Corrections, duplicate resolution and suppression rebuild affected episode sets from active revisions. A supported pattern losing decisive evidence returns to the warranted state, invalidates dependent *future* decisions/proposals and triggers re-evaluation. Historical applied decisions retain the facts frontier then known. Do not erase an actual workout, rewrite old advice as though corrected information was available then, or reingest deleted data to reconstruct a disallowed pattern. A new transport ID is not new evidence.

## ARM-05 — Learnable constructs and permitted consumers

| Construct | Scope of learned association | Consumer / boundary |
|---|---|---|
| Session-family tolerance | Concrete dose/method/configuration plus comparable response and horizon. | POL-01/02/03/16/17; no family-wide ceiling from one recipe. |
| Lower-before-run / run-before-strength | Exact sequence, real temporal gap, demands, later task and outcome. | HP/POL-07/08; choose supported schedule alternatives, not universal spacing. |
| Run volume / intensity / long / threshold response | Distinct constructs, calibrated method, environment and recent load context. | Run progression/regression and later planning; no km-to-strength conversion. |
| Strength progression response | Exercise/configuration, work sets/reps/load convention/effort/rest and performance context. | Strength earned progression and substitution; technique/competence unknown stays unknown. |
| Local muscle response | Confirmed region/function plus supported attribution from actual prescription. | POL-05 and session-specific readiness; never inferred tissue injury. |
| Systemic recovery / sleep sensitivity | Comparable within-person signals and subsequent task outcomes. | RRM/POL-06; no hours-slept-to-dose function or medical diagnosis. |
| Adherence / schedule pattern | Confirmed schedule/preferences and execution status under G03. | POL-04/15 and planning feasibility; no moral rating, motivation diagnosis or physiological inference from silence. |
| Performance trend / repeated success-failure | Task-specific target lineage, comparable exposure/effort and covered opportunities. | Later-cycle progression; excessive work receives no extra adherence credit. |

## ARM-06 — Purpose, synthetic demonstration and safeguards

AEOS §15 and PDM I10 govern purpose. Primary current-plan use can reconcile and interpret the current episode only under its own legitimate purpose/permission. Additional longitudinal personalization is a separate opt-in **OFF by default** with G07/legal/privacy gates; declining it must preserve primary coaching value. The existence of this learning specification does not broaden the primary purpose. Secondary revocation stops queued processing and use of its derived patterns and removes or ceases their use under applicable rules; a primary process cannot relabel them to keep using them. All references carry purpose/permission revisions, minimization and source lineage. No ML, reinforcement learning or cross-athlete transfer is authorized here.

The end-to-end fixture demonstrating a learned response may declare a set of independently labelled synthetic historical episodes, mixed/contrasting opportunities and an already reviewed *hypothetical* bounded-use pattern. The fixture must show why a later decision differs, which supported default it displaced and why a one-event counterexample would not reverse it. These are authored facts for testing contract behavior. They are never real athlete data, empirical efficacy evidence, minimum observation validation, a human review or evidence that an online system learned anything.

Acceptance oracles: duplicate delivery adds no episode; one noisy event creates no stable trait; corrected decisive evidence can downgrade a pattern; missing wearable does not erase confirmed experience; opted-out athlete uses population-supported coaching without hidden secondary learning; model update alone creates no plan revision; improved wearable score cannot erase a restriction; a supported pattern changes only a later admissible comparison, with current agency and SSCTR conditions preserved. `COACHING_CONTRACTS.json` supplies structured fields and lifecycle constraints. Sporting sufficiency claims require exact independent SSCTR disposition in the registry, and the author grants none.
