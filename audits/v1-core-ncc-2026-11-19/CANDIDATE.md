# Normalization Consistency Closure (F1, F2, F3): candidate

**Line:** branch `claude/v1-core-normalization-consistency`, worktree `.claude/worktrees/v1-core-ncc`, from `e704180` (SEC-R2-03 + SEC-R2-04 final; `v1core-freeze-4.mjs --check` 40/40 there before any edit). Nothing pushed or merged. Synthetic athletes only.

**Runtime change:** one file, `CoachingCore/src/r6-provenance.mjs` (`normalizeObservations` and `partOf`). No sporting rule, threshold, progression, periodization, calibration, Race Forecast, Pace Insights, Strength rule or coach profile is touched. Pace Revision stays off. `v1-f08.mjs` is unchanged (FREEZE-4 bytes).

## A. Findings

### F1 (P0): a carried row in force was refused again by a late report with an earlier clock

**Reproduction.** On FREEZE-4 the SEC-R2 differential (same generator, seed 20261119, non-monotone arrival) loses 48 carried rows in force in 47 passes, and 0 under monotone arrival. Each is classified one by one in `evidence/f1-cases.json`:
- by refusal: 27 `ACTIVITY_BOUND_TO_TWO_SESSIONS`, 11 `INVALID_CORRECTION_CHAIN`, 9 `DUPLICATE_CONFLICT_QUARANTINED`, and 1 left as a replaced row whose replacement is not in force;
- **all 48 are lost identically on FREEZE-3** (`a6e10d0`). None is new in FREEZE-4.

Seeds 1 and 2 give 52 and 40, again all pre-existing in kind.

**Cause.** The normalizer sorted the carried record and the incoming reports together by availability (`correctedAt ?? reportedAt`). A late report dated earlier was read before the record it arrived after:
- it became the row of its execution, bound the activity, or took an event id;
- the carried row, read next, met it as a conflict, a second session or a broken chain, and was refused. It left the record entirely, not even as history.

A tie (two reports with no report time, both at the end of the run's day) was broken by event id with the same effect. That is the one frozen test that changes, lineage scenario 21; see the ledger.

**Fix.**
- The record is rebuilt before any incoming report is read: first its history (rows a correction replaced), then its rows in force, then the incoming reports, each group by availability as before. With a monotone clock this is the order FREEZE-4 already used. A late report is now read against the record as admitted:
  - an agreeing report merges into the carried row, which stays the row in force;
  - a conflicting one is refused and the carried row is flagged conflicted (QRE-R6-13/-14 unchanged);
  - a report reusing an id the record holds, history included, is the event-id conflict.
- History first: every carried correction finds the report it names on every re-read, also when the two share an instant.
- One rule keeps the outcome independent of how reports were split into reviews. A correction made before the report it names was available (`correctedAt` earlier than that report's own availability) is refused (`INVALID_CORRECTION_CHAIN`), whichever review brought that report. In one review FREEZE-4 already refused it, because it was read before the report. Without the rule it would be admitted when the original was carried and then lost again on a re-read.

**Invariant.** No carried row in force leaves the record because a report arrived later. A real conflict still changes admissibility: the carried row stays, flagged and out of dose and calibration, and the new report is refused.

### F2 (P1): a watch activity merged into another report's row was not bound in later reviews

**Reproduction.** On FREEZE-4 (and FREEZE-3), when the athlete's report is the row and the watch report merges into it, the activity id lived only in that review's index. A later review admitted another session carrying it, so one activity was in force on two sessions:
- 22, 22 and 38 passes on the three non-monotone seeds;
- 22, 27 and 38 monotone;
- SEC-R2 dose journey B: one HealthKit activity on runs d1 and d3, d3 upgraded to wearable evidence.

**Cause.**
- `partOf` kept no activity.
- `byActivity` was built from each row's own `source.activityId` / `canonicalActivityId`.
- The conflict for a bound activity was flagged on the object the index named. Once a correction had retired that row (the retired row object, after its history copy was taken), the flag reached no output row, and the row in force escaped it. This also happens on FREEZE-4 for a row's own activity.

**Fix.**
- A part keeps the activity its report carried (`activityId`, only when there is one: rows merging only manual reports are byte-identical).
- A row binds its own activity and every activity its parts carry.
- A report bound to an execution whose row a correction retired flags that execution's row in force.
- No new ledger, no new identity: the existing index, the existing rule (QRE-R6-13).
- Missing or empty activity ids still bind nothing.

**Limitation.** A record FREEZE-4 or earlier wrote keeps no part activity, so its merged activities stay unbound when re-read. Every such record is synthetic, and there is no healing.

### F3 (P1): a carried correction in conflict lost its identity's quarantine when re-read

**Reproduction.** A correction in conflict with a part in force (`CORRECTION_CONFLICTS_WITH_A_REPORT_IN_FORCE`) has `quarantinedIdentities` `["session:sm"]` in its pass and `[]` on every re-read; a plain conflict keeps it. Then:
- a later agreeing plain report merged into the conflicted row;
- the weekly review read the session as PARTIAL or COMPLETED with nothing new (SSCTR f3/f3b).

**Cause.** On re-read, the correction's own carried `conflicted` flag put its identity in quarantine. Its admission step ("a correction resolves a conflict on its identity") then read that same flag as a conflict to resolve and deleted it.

**Fix.** Whether a correction resolves a conflict is read from the quarantine its identity held before it (`heldBefore`), never from its own flag. That is exactly what its first admission saw, since the flag came later. A valid correction still resolves a conflict, and one that resolves another row's conflict while itself in conflict keeps its own. No second conflict mechanism.

## B. Differential evidence (`evidence/differential.mjs`, `evidence/differential-*.json`)

FREEZE-4 vs candidate, 3000 generated three-pass records per run, with the candidate's own output carried pass to pass. Seeds 20261119, 1 and 2, non-monotone (late reports and replays) and monotone.

**Candidate invariants, all runs:**
- 0 rows in force lost;
- 0 orphans;
- 0 identities with two rows in force;
- 0 activities in force on two identities;
- 0 changes of the rows in force or their flags when the output is re-read with nothing new;
- 0 differences between that re-read and the same after a JSON round trip;
- deterministic.

**Every pass that differs is classified.** UNEXPLAINED = 0 on all six runs:

| Class | late 20261119 | mono 20261119 | late 1 | mono 1 | late 2 | mono 2 |
|---|---|---|---|---|---|---|
| F1_LOSS (FREEZE-4 loses a carried row) | 47 | 0 | 52 | 0 | 40 | 0 |
| F1_ORDER (same reports, read in record order) | 362 | 0 | 343 | 0 | 321 | 0 |
| F1_CHAIN (correction before its report: refused by both) | 2 | 0 | 1 | 0 | 4 | 0 |
| F2_BIND (merged activity bound) | 25 | 26 | 28 | 32 | 41 | 34 |
| F2_FLAG_TARGET | see JSON | | | | | |
| F3_QUARANTINE (only the kept quarantine differs) | 132 | 84 | 163 | 80 | 135 | 90 |
| F3_RESOLUTION (a valid correction resolves a carried conflict) | 109 | 80 | 111 | 67 | 109 | 76 |
| PART_ACTIVITY (record bytes only) | 1462 | 1521 | 1500 | 1540 | 1379 | 1590 |
| ORDER_ONLY (list order) | 146 | 0 | 173 | 1 | 169 | 1 |

The table is filled from the final JSON files at commit.

**FREEZE-4 on the same passes:**
- rows in force lost: 48, 0, 52, 0, 40, 0;
- activities on two sessions: 22 to 38;
- re-read quarantine losses ("other", F3): about 630 to 710 per run.

**Quarantine-only re-read differences that remain, as on FREEZE-4.** These are not F3, but they are routed (§F):
- REFUSED_IDENTITY: a refused report's own identity is quarantined in its pass only;
- FLAGGED_LATER: a row flagged by event-id reuse is quarantined from the next review on.

## C. Sporting impact (`evidence/dose-impact.mjs`; `dose-e704180.json` vs `dose-candidate.json`)

Plan A, week 0 reported in full on its Sunday, run d1 reported by the athlete and the watch (merged). Running = EASY + LONG only (SSCTR C-SR2-1); optional walks and strength are listed apart. Restart at day 10:

| Journey | FREEZE-4 record | Candidate record | Restart week 0, running / walk / strength |
|---|---|---|---|
| control | d3 40 min | same | 15+15+20 / 20 / 27+27, both |
| F1: d3 corrected (−10 min), then a late watch sync of d3 (+15 min) reported before the correction | the athlete's correction lost; the late watch row (55) in force, conflicted | the correction (30) in force, conflicted; the late watch refused | 25+15 / 20+20 / 27+27, both: the session is out of dose either way, conflicted |
| F1a: as F1, the late sync agreeing | the watch row (30) holds the execution | the correction (30) holds it, the sync merged | 25+20 / 20+20 / 27+27, both |
| F2: a correction of d3 carrying d1's merged activity HK-D1 | admitted: d3 35 min with borrowed wearable evidence; HK-D1 on d1 and d3; 4 run-history facts | refused; d3 keeps its 40-min report; d1, the execution holding HK-D1, flagged conflicted (QRE-R6-13, as FREEZE-4 already does when the watch report is the row); 3 facts | 25+20 / 20+20 / 27+27 on FREEZE-4 → **25+15** / 20+20 / 27+27 on the candidate: **5 min less running** |
| F3: the athlete disputes their d1 part (half, recovery adverse) against the watch voice | the next review the same week reads d1 PARTIAL | reads d1 CONFLICTED (conflicted 1) | identical; the action is MODIFY/GATED_NEXT_STEP in both |

- No progression, threshold or rule changes.
- The F2 difference comes from refusing borrowed evidence: the conflict rule then puts the merged execution out of dose. It errs low, and it is the same outcome FREEZE-4 already gives when the watch report holds the row.
- Lineage scenario 21 (ledger): on EASY the re-synced device measurement becomes the history reference, as on LONG. The easy band and the calibration are unchanged.

## D. Tests

`CoachingCore/test/v1core-ncc-normalization-consistency.test.mjs` holds 21 tests (normalizer, engine and one successor):
- **F1:** the SSCTR f1 shape (a symptom stop kept, SB-1 still asks); the Security sb1 shapes; late agreeing merges; late reports of other sessions and strength; correction before its report in one or two reviews; correction at the very instant; chains with late replays; re-read ×3, a JSON round trip and a re-sent batch.
- **F2:** manual first, device first and strength; resync and replays; distinct twins; missing and empty ids; corrections of either part, with a round trip; the flag on the row in force.
- **F3:** re-read ×3 with a round trip and the control; a later agreeing report refused; resolution, still in conflict, refused correction; a hand-built record.
- **Engine:** F1, F2 (journey B) and F3 (weekly review CONFLICTED on a later review).
- The successor of the lineage matrix.

Mutation and RED (`evidence/mutate.mjs`, `evidence/mutation.txt`): see §D results at commit. Full suite: at commit.

## E. Performance (Node; `bench/bench.mjs`, `bench/bench-e704180-vs-candidate.json`; not an iPhone measurement)

| Measure | Ratio |
|---|---|
| review median | ×0.983 |
| restart from a corrected record, median | ×0.991 |
| record bytes (journey) | ×1.000 |
| normalizer, small batch | ×1.09 (sub-millisecond) |
| normalizer, corrected history | ×1.03 |
| normalizer, re-sync | ×0.875 |
| merged history (120 sessions × athlete + watch): merge | ×1.003 |
| merged history: re-read | ×1.09 (+0.9 ms on 240 reports) |
| merged history: late batch | ×0.96 |
| merged history: kept bytes | ×1.017 (the parts' activity ids) |

- No copy of the history; one sort key added.
- `accepted.includes` runs only when an incoming report's activity is already bound (a conflict or a re-sync). It is linear there, as `accepted.find` already is for corrections.
- No budget changed.

## F. Outside F1/F2/F3, routed, not fixed (each identical on FREEZE-4)

- **O-NCC-1, FLAGGED_LATER (Low; Core with QRE, with O-1).** A refused report reusing an event id flags the row holding that id, and quarantines the refused report's identity in that pass, not the flagged row's. The next review quarantines the flagged row's identity (from its flag). Dose readers read the flag, so this is weekly-review evidence only: CONFLICTED from the next review on.
- **O-NCC-2, REFUSED_IDENTITY (Low; conflict policy O-1).** A refused report's own identity is quarantined in its pass only. Nothing is flagged on it, so a re-read releases it.
- **Learning model (observation).** `updateLearningModel` carries only rows in force, so a carried correction finds no original there and is refused on each update. This is unchanged here and outside V1 gating.
- **Ties in one review.** Two reports of one batch at the same instant are still ordered by event id, as before.

## G. Freezes

- FREEZE-1 to FREEZE-4 and every sporting freeze are untouched.
- `v1core-freeze-4.mjs --check` now names `src/r6-provenance.mjs` as drift, and `v1core-secr2-freeze.test.mjs` names this line's files, both by design (`SUCCESSOR_LEDGER.json`).
- Successor verifier: `CoachingCore/scripts/v1core-freeze-5.mjs` (`--preserved` passes on the committed tree), with test `v1core-ncc-freeze.test.mjs`.
- FREEZE-5 is written only if the three judges approve.

## H. Open, not this mission's

C-F01-2 (custody, with SEC-SR2-02), SEC-CORE-03 (correction author), O-1/B0-F05, the 28-day window contract, local custody decisions and iOS revalidation (`IOS_REVALIDATION_PENDING`) all stay open.
