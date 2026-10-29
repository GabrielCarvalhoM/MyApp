# Balanced hybrid arrangement — R6

How R6 chooses a weekly arrangement when running and strength compete for the same days. It corrects the R5 root causes (candidate order decided H03/H11/H20; initial generation was not fixed in H20; unknown combined recovery refused generation in H21).

Scope: OFFLINE_SYNTHETIC_NODE24_REFERENCE; envelope R6-HYBRID-ARRANGEMENT. Evidence: `BALANCED_HYBRID_R6.json`, demonstrations C, D and M, tests labelled Balanced and D24/D25/D26.

## Decision procedure (`src/r6-balanced.mjs` `chooseBalanced`)

1. **Costs** (`interferenceCosts`): ordinal severities NONE, LOW, MODERATE, HIGH on a run axis and a strength axis, from direction and gap; same-session, earlier-the-same-day and day-before pairs are labelled as such. Athlete evidence can raise a cause's severity for that athlete only.
2. **Horizons** (`horizonCosts`): H0 session (worst), H1 week (sorted severity list, worst first), H2 block (shifted by the phase lead and maintain roles), H3 goal or event (shifted by development and event proximity).
3. **Pareto**: options no worse on every horizon and axis and better on one dominate; dominated options leave.
4. **Lowest worst-case joint harm**: compare by leximax, worst first, under the phase lead (JOINT weighs both axes together). Counts and sums are never used.
5. **Equal remaining options**: least change, the athlete's template order, the earliest quality day; options differing only in back-to-back order are disclosed as "either order". No candidate identifier or input order decides.
6. **Genuine trade-off**: equal worst-case harm with opposing costs is asked once ("which session should stay freshest this block?"); a temporary preference or strong repeated athlete evidence resolves it.

The trace names the decisive comparison: PARETO, LOWEST_WORST_CASE_JOINT_HARM, PARETO_THEN_EQUIVALENT, EQUIVALENT_NO_TRADE_OFF, TEMPORARY_PREFERENCE, ATHLETE_EVIDENCE, KEEP_CURRENT or GENUINE_TRADE_OFF.

## Defaults the review accepted with conditions

- Quality-run-first for an equal-standing athlete when the alternative puts moderate or heavy lower-body work within about a day before the key run: disclosed, reversible, overridable by the athlete and by repeated comparable evidence.
- An easy run right before moderate or heavy lower-body work carries a strength cost when strength develops, so strength-first wins when nothing else differs.

## Learning

Repeated comparable adverse key runs after one preceding-session cause, with compatible key runs without it, raise that cause's severity for the athlete and can change future arrangements at the same doses (association, never causation). See `ATHLETE_MODEL_R6.md`.

## Limits

Gap bands rank options; they never forbid a feasible arrangement on their own. Unknown arrangement response in the legacy path is admissible only with worst interference LOW and no same-day pairing.
