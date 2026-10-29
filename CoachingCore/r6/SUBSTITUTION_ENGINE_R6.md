# Substitution engine — R6

When equipment changes, R6 keeps the movement intent and the session, replaces only what cannot be done, and makes the change last as long as the athlete said it would. It corrects the R5 root cause in H19 (supplied substitutes were never considered).

Scope: OFFLINE_SYNTHETIC_NODE24_REFERENCE; envelope R6-SUBSTITUTION (with R6-LOAD-ESTABLISHMENT for unfamiliar substitutes). Evidence: `SUBSTITUTION_ENGINE_R6.json`, demonstration J, tests labelled substitution and D27.

## Behaviour (`src/r6-adaptation.mjs` `equipmentChange`)

- **Persistence**: a permanent change becomes the athlete's equipment and templates; a temporary one becomes a dated window (`canonical.equipmentWindows`) that every later reprojection reads (`templatesForDate`). Strength sessions from the review day on are re-projected; running and past sessions do not change.
- **Selection**: the same template logic as cold start, per slot pattern, with the equipment in force on that date: familiar exercises first, then competent ones, pattern first and variant family second.
- **Dose**: an unfamiliar substitute starts with effort-guided establishment (at most two sets, RIR ≥ 3); a familiar one with a current known dose uses it. No load is converted between implements. No progression step on a substitute in its first exposure.
- **Disclosure**: each swap names the pattern, whether establishment is needed, and when bodyweight replaces a loaded movement that it is a different stimulus, not an equivalent load. A pattern with no substitute is left out and disclosed.
- **After a temporary window** the original exercises return from their last logged loads; an exercise unused for more than 28 days restarts effort-guided with the old load as a ceiling.
- **Legacy path**: supplied admissible substitutes for an unavailable window enter the candidate set and are disclosed (R5 H19).

## Limits

The catalogue is bounded; substitutes are same-intent options, not equivalence claims. Without R6-SUBSTITUTION authority an equipment change returns UNSUPPORTED.

## After FREEZE-1 (SSCTR rounds 7–12; not frozen)

This describes the R6 runtime after FREEZE-1, which is **not frozen**: the SSCTR refused FREEZE-2 in round 12, and under the Founder's bound R6 closes with an explicit blocker (`OPEN_GAPS_R6.md`). The official evidence stays bound to FREEZE-1. Every rule below holds under the SSCTR's weekly-review contract: every elapsed week receives a gating weekly review, with unreported sessions reviewed as missed (a week without one keeps the projection's assumption; owned gap R18).

- **An unfamiliar substitute whose first session was missed** establishes nothing, so its next exposure is again the effort-guided establishment row (SSCTR D52).
- **"Not performed for more than 28 days"** is counted in calendar days from the last executed exposure (the completed-work ledger) to the session date. An original that resumes after a temporary window is re-established by effort when its last performance is more than 28 days back, with its last logged load as a ceiling (SSCTR D52).
- **Open for R7 (D53, D54):** after a re-establishment of an exercise whose establishment log is pending or unlogged, the block-boundary set can come back at once; a re-establishment row ignores the taper, race-week and post-event doses.
