# Provenance and time — R6

Observations are evidence about the past. R6 uses an observation only if it was observed and reported by the decision clock, keeps its source and precision, merges duplicates, quarantines contradictions and lets corrections supersede. It corrects the R5 adapter bug that invented a clock time after the review (H07, H08, H10, H11) and the stale-alternative poisoning in H24.

Scope: OFFLINE_SYNTHETIC_NODE24_REFERENCE; envelope R6-PARTIAL-NOISY-LEARNING. Evidence: `PROVENANCE_TIME_R6.json` (coverage of clock skew, timezone, out-of-order arrival, future observations, duplicates and stale events, each mapped to tests), trajectory T09.

## Rules (`src/r6-provenance.mjs` `normalizeObservations`)

- **Clock**: decision time must carry a timezone; all instants normalize to UTC and bind to the athlete's local day (program offset).
- **Day precision**: a date without a time gets the latest causal instant of that local day not after the decision clock — never an invented later time.
- **Future**: an observation after the clock is excluded (FUTURE_OBSERVATION), within five minutes it is quarantined as clock skew; a report made after the clock is not available even for an earlier execution.
- **Order**: rows are processed by availability time, so out-of-order arrival never changes the result.
- **Duplicates**: the same event replayed merges; phone and watch records of the same session merge when they agree physically and in response.
- **Conflicts (FREEZE-2, QRE-R6-13/14)**: the completed-work record is append-only. A report that contradicts an earlier one is excluded, and the earlier one stays in the record, flagged `conflicted` and quarantined. This covers the same event id with different facts, disagreeing duplicates, and one wearable activity attached to two sessions (a conflict on both). The session is CONFLICTED for gating, and the fact counts neither for capacity nor for learning until a correction resolves it.
- **Corrections**: a correction with a valid chain supersedes the original and resolves a conflict on its session.
- **Impossible provenance (QRE-R6-23)**: a report dated before the activity it reports is rejected. Exact times compare instants; day-precision facts compare local dates.
- **Determinism (QRE-R6-22)**: ties are ordered by code point, never by the host's collation locale.
- **Stale**: facts older than the learning window leave learning and gating but stay in the completed-work ledger.
- **Partial and unknown**: partial execution informs adherence only; missing effort or heart rate is unknown, never adverse.

## Holdout adapter

The R6 evaluator gives day-precision facts the latest causal instant of the session day not after the review clock, resolves sessions by week, sport, role preference list and day, records ambiguity, and never invents a clock time.

## Robustness (FREEZE-2)

A review whose observations or ledger are not lists, an entry that is not an object, or an impossible date gives HOLD or exclusion with a reason, never an exception (QRE-R6-10). On the engineering judge's fuzz, exceptions fell from 132 to 3, all values outside the JSON contract. The simulator now stamps reviews and observations at local clock times for the program's offset, so time zones east of UTC+3 no longer deadlock (QRE-R6-20).

## Limits

Synthetic timestamps; no real wearable integration; provider identity is a label.
