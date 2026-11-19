# Normalization Consistency Closure (F1, F2, F3): candidate

**Line:** branch `claude/v1-core-normalization-consistency`, worktree `.claude/worktrees/v1-core-ncc`, from `e704180` (SEC-R2-03 + SEC-R2-04 final; `v1core-freeze-4.mjs --check` 40/40 there before any edit). Nothing pushed or merged. Synthetic athletes only.

**Runtime change:** one file, `CoachingCore/src/r6-provenance.mjs` (`normalizeObservations` and `partOf`). Round 1 `ef490bb` (runtime `07301f3`); cycle 1 `963547b` (`CYCLE1.md`). No sporting rule, threshold, progression, periodization, calibration, Race Forecast, Pace Insights, Strength rule or coach profile is touched. Pace Revision stays off. `v1-f08.mjs` is unchanged (FREEZE-4 bytes).

## A. Findings

### F1 (P0): a carried row in force was refused again by a late report with an earlier clock

**Reproduction.** On FREEZE-4 the SEC-R2 differential (same generator, seed 20261119, non-monotone arrival) loses 48 carried rows in force in 47 passes, and 0 under monotone arrival. Each is classified one by one in `evidence/f1-cases.json`:
- by refusal: 27 `ACTIVITY_BOUND_TO_TWO_SESSIONS`, 11 `INVALID_CORRECTION_CHAIN`, 9 `DUPLICATE_CONFLICT_QUARANTINED`, and 1 left as a replaced row whose replacement is not in force;
- **all 48 are lost identically on FREEZE-3** (`a6e10d0`). None is new in FREEZE-4.

Seeds 1 and 2 give 52 and 40, again all pre-existing in kind. Recounted in cycle 1 with a stricter check (a row reusing the id of a lost row no longer masks the loss), FREEZE-4 loses 210 on seed 20261119, all 210 identically on FREEZE-3 (§B).

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
- A correction made before the report it names was available is refused (`INVALID_CORRECTION_CHAIN`), whichever review brought that report. In one review FREEZE-4 already refused it, because it was read before the report. Without the rule it would be admitted when the original was carried and then lost again on a re-read.
  - **Corrected in cycle 1 (QRE C1/C5, SEC-NCC-01).** On `ef490bb` the rule read the clock of the row holding the named report. For a merged part that is the lead report's clock, so valid corrections were refused depending on the split (P1-S1, P1-S2/P2, P7, e5d), and one made before its part was reported was admitted when split (E5c). The split-independence claim made here for `ef490bb` is withdrawn.
  - On `963547b` the rule reads the named report's own clock: the row's when the row is that report, else the clock its part now keeps (`availableAt`). A part written before this line keeps none and is never refused by the rule (FREEZE-4 behaviour).
  - Those corrections now read as in one review (`CYCLE1.md`). What stays order-dependent is only what E-1 already makes so: which correction's event id holds the row.

**Invariant.** No carried row in force leaves the record because a report arrived later. A real conflict still changes admissibility: the carried row stays, flagged and out of dose and calibration, and the new report is refused.

### F2 (P1): a watch activity merged into another report's row was not bound in later reviews

**Reproduction.** On FREEZE-4 (and FREEZE-3), when the athlete's report is the row and the watch report merges into it, the activity id lived only in that review's index. A later review admitted another session carrying it, so one activity was in force on two sessions:
- 22, 22 and 38 passes on the three non-monotone seeds;
- 22, 27 and 33 monotone;
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

**Limitation.** A record FREEZE-4 or earlier wrote keeps no part activity, so its merged activities stay unbound when re-read. An F2 double it already holds stays (SEC-NCC-03). Every such record is synthetic, and there is no healing.

**Second limitation, records FREEZE-4 wrote (QRE C3).** A record FREEZE-4 wrote with event-id reuse can lose rows in force on its first read by this line:
- 17 rows on seed 20261119 and 11 on seed 1, non-monotone only, 0 monotone;
- one of them silently, as an `EXACT_REPLAY` of a history row.

The cause: FREEZE-4 admitted a report reusing an id because it read that report before the history row holding the id; history-first reading now meets the id. FREEZE-4's own re-read loses 0. Every such record is synthetic. Any future migration of stored records is routed to Core with custody (C-F01-2).

**Declared edge (QRE C4, not changed).** When a device correction moves a session to a new activity id (W@HK1 → W2@HK9) and a report of another session carrying HK1 arrives in the same review, the report is refused (as on FREEZE-4) and W2 is flagged conflicted although it no longer holds HK1. In a later review the same report is admitted, because history does not bind activities. This errs low and depends on the split. Unbinding an activity that a correction replaced is an identity-policy question, routed with O-1.

### F3 (P1): a carried correction in conflict lost its identity's quarantine when re-read

**Reproduction.** A correction in conflict with a part in force (`CORRECTION_CONFLICTS_WITH_A_REPORT_IN_FORCE`) has `quarantinedIdentities` `["session:sm"]` in its pass and `[]` on every re-read; a plain conflict keeps it. Then:
- a later agreeing plain report merged into the conflicted row;
- the weekly review read the session as PARTIAL or COMPLETED with nothing new (SSCTR f3/f3b).

**Cause.** On re-read, the correction's own carried `conflicted` flag put its identity in quarantine. Its admission step ("a correction resolves a conflict on its identity") then read that same flag as a conflict to resolve and deleted it.

**Fix.** Whether a correction resolves a conflict is read from the quarantine its identity held before it (`heldBefore`), never from its own flag. That is exactly what its first admission saw, since the flag came later. A valid correction still resolves a conflict, and one that resolves another row's conflict while itself in conflict keeps its own. No second conflict mechanism.

## B. Differential evidence (`evidence/differential.mjs`; cycle 1: `evidence/cycle1/*.json`; round 1: `evidence/differential-*.json`)

FREEZE-4 vs candidate. Each run is 3000 generated three-pass records, with the candidate's own output carried pass to pass. Configurations:
- seeds 20261119, 1 and 2;
- non-monotone (late reports and replays) and monotone;
- the original generator, and (cycle 1, QRE C2) the extended one, which adds corrections of merged parts and late device re-syncs (`EXT=1`).

The fate of every incoming report is accounted before any class (cycle 1). The tables of round 1 on `ef490bb` are superseded: their harness could absorb an unexplained refusal (QRE C2).

**Candidate `963547b`, invariants, all twelve runs: 0** for each of:
- rows in force lost;
- orphans;
- identities with two rows in force;
- activities in force on two identities;
- changes of the rows in force or their flags when the output is re-read with nothing new;
- differences between that re-read and the same after a JSON round trip;
- quarantine lost on re-read ("other");
- nondeterminism;
- unexplained incoming fates.

| Class | late 20261119 | mono 20261119 | late 1 | mono 1 | late 2 | mono 2 | ext late 20261119 | ext mono 20261119 | ext late 1 | ext mono 1 | ext late 2 | ext mono 2 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F1_LOSS | 209 | 0 | 215 | 0 | 206 | 0 | 252 | 0 | 235 | 0 | 229 | 0 |
| F1_ORDER | 206 | 0 | 176 | 0 | 158 | 0 | 460 | 0 | 472 | 0 | 511 | 0 |
| F1_CHAIN | 2 | 0 | 1 | 0 | 4 | 0 | 11 | 0 | 8 | 0 | 11 | 0 |
| F2_BIND | 25 | 26 | 27 | 32 | 41 | 34 | 34 | 26 | 32 | 29 | 33 | 32 |
| F2_FLAG_TARGET | 3 | 0 | 7 | 2 | 3 | 4 | 9 | 3 | 5 | 4 | 4 | 5 |
| F3_QUARANTINE | 132 | 84 | 163 | 80 | 135 | 90 | 148 | 109 | 143 | 117 | 134 | 104 |
| F3_RESOLUTION | 117 | 105 | 129 | 110 | 111 | 99 | 495 | 403 | 486 | 397 | 502 | 367 |
| PART_FIELDS (record bytes) | 1689 | 1798 | 1731 | 1782 | 1597 | 1833 | 1915 | 2341 | 1947 | 2359 | 1916 | 2271 |
| ORDER_ONLY | 146 | 0 | 173 | 1 | 169 | 1 | 114 | 0 | 112 | 1 | 111 | 0 |
| **UNEXPLAINED** | **0** | **0** | **0** | **0** | **0** | **0** | **0** | **0** | **0** | **0** | **0** | **0** |
| incoming fates changed, explained / unexplained | 211/0 | 54/0 | 194/0 | 58/0 | 205/0 | 60/0 | 421/0 | 165/0 | 413/0 | 184/0 | 444/0 | 163/0 |
| FREEZE-4 rows in force lost | 210 | 0 | 218 | 0 | 210 | 0 | 258 | 0 | 239 | 0 | 235 | 0 |

**The harness catches the defect it missed.** With `ef490bb` as the candidate on the extended generator (late 20261119), 42 passes are UNEXPLAINED, with 43 unexplained `INVALID_CORRECTION_CHAIN` refusals (`evidence/cycle1/ef490bb-as-candidate-ext-late-20261119.json`). The original generator reaches none.

**FREEZE-4's losses, recounted.** FREEZE-4 loses 210 rows in force on seed 20261119 (non-monotone), not the 48 of round 1. The check is stricter since cycle 1: a carried row is live only by a row of its own identity, and an incoming report reusing its event id for another execution no longer masks its loss.
- Per case (`evidence/cycle1/f1-cases.json`): all 210 are lost identically on FREEZE-3.
- On the candidate, 38 stay in force, 140 stay in force flagged conflicted, and 32 are replaced by a valid correction of the same review.
- The round-1 per-case file (`evidence/f1-cases.json`, 48) is kept as written.

**FREEZE-4 on the same passes** (round 1, original generator; `evidence/differential-*.json`):
- passes with one activity in force on two identities: 22 to 38;
- quarantine of a flagged row in force lost on re-read (F3): 627 to 710 per run.

**Quarantine-only re-read differences that remain, as on FREEZE-4.** These are not F3, but they are routed (§F):
- REFUSED_IDENTITY: a refused report's own identity is quarantined in its pass only;
- FLAGGED_LATER: a row flagged by event-id reuse is quarantined from the next review on.

FLAGGED_LATER rises on late runs because the carried rows a late report used to evict now stay and are flagged instead.

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
- **F2** (stated per SSCTR C-NCC-2): refusing the borrowed evidence lets the conflict rule put the merged execution d1 out of dose. The C-Q08-1 bound goes 49 → 40 min a week, restart running 45 → 40, and the easy runs counted toward the field assessment 2 → 1. It errs low, and it is the outcome FREEZE-4 already gives when the watch report holds the row. That a refused report can take an agreed run out of dose is folded into C-SR2-5 (conflict policy, non-binding).
- **Lineage scenario 21** (stated per SSCTR C-NCC-2): on EASY, the session's weekly status goes CONFLICTED → COMPLETED. The history reference becomes the re-synced device measurement, a distance the athlete's refused symptom-stop report disputes, as LONG already reads. The easy band, the calibration and the next long run are unchanged, and the run stays withheld from pace readers. The mechanism is SSCTR-NCC-01 (C-NCC-1), routed.
- **Cycle 1** (`963547b`): the five journeys above are byte-identical to `ef490bb` (`evidence/dose-963547b.json`). The cycle changes only the corrections `ef490bb` wrongly refused, and there it restores FREEZE-4's outcome:
  - P7: the device re-sync of d1 is in force, 43 min as on FREEZE-4;
  - engine-e5d: the athlete's symptom-stop correction is in force, conflicted, and no 40-min run-history fact comes from the watch.

## D. Tests

`CoachingCore/test/v1core-ncc-normalization-consistency.test.mjs` holds 21 tests (normalizer, engine and one successor):
- **F1:** the SSCTR f1 shape (a symptom stop kept, SB-1 still asks); the Security sb1 shapes; late agreeing merges; late reports of other sessions and strength; correction before its report in one or two reviews; correction at the very instant; chains with late replays; re-read ×3, a JSON round trip and a re-sent batch.
- **F2:** manual first, device first and strength; resync and replays; distinct twins; missing and empty ids; corrections of either part, with a round trip; the flag on the row in force.
- **F3:** re-read ×3 with a round trip and the control; a later agreeing report refused; resolution, still in conflict, refused correction; a hand-built record.
- **Engine:** F1, F2 (journey B) and F3 (weekly review CONFLICTED on a later review).
- The successor of the lineage matrix.
- **Cycle 1** (5 tests): C1/P1-S1, C1/P1-S2+P2, SEC-NCC-01 (e5d, E5a, E5c, a part without a clock), C1/P7 through the engine, and SEC-NCC-01 engine-e5d. All 5 fail on the exact `ef490bb` bytes (`evidence/red-cycle1-on-ef490bb.txt`).

**Cycle 1, `963547b`:**
- 26/26 tests pass.
- RED with `src/r6-provenance.mjs` at FREEZE-4 bytes: 8/26 pass (the controls, and the three cycle tests FREEZE-4 already passes) and 18 fail.
- Mutants 11/11 killed (`evidence/mutation-cycle1.txt`): the round-1 eight, plus the holder clock (`ef490bb`), parts without a clock, and QM12 (the rule only where the row is the named report).
- Full suite (`evidence/suite-963547b.txt`): **1801 / 1770 / 31**, the 31 failures at the same locations as on `ef490bb`.

Round 1, `ef490bb`:

- **On the candidate:** 21/21.
- **RED** (`evidence/mutate.mjs`, `evidence/mutation.txt`): with `src/r6-provenance.mjs` at FREEZE-4 bytes, 5/21 pass (the controls) and 16 fail.
- **Mutants:** 8/8 killed:
  - no record-first order;
  - carried first but history not first;
  - no correction-before-report rule;
  - parts keep no activity;
  - parts' activities not indexed;
  - flag on the history row;
  - own flag read as a conflict to resolve;
  - resolved quarantine not restored.
- **Directed regression:** the 23 earlier test files that exercise the normalizer. Their failures are the baseline's, at the same assertion locations, plus the one ledger entry.

**Full suite on `07301f3`** (`evidence/suite-07301f3.txt`): **1796 / 1765 / 31**. FREEZE-4's committed tree gave 1774 / 1745 / 29, and this line adds 22 tests, all passing.
- The 29 earlier failures fail at the same assertion locations as in `audits/v1-core-sec-r2-2026-11-19/evidence/suite-36ea26a.txt`. That run's 30th was an untracked-file artifact of `v1core-secr2-freeze.test.mjs`.
- `v1core-secr2-freeze.test.mjs:12` now fails by design: FREEZE-4's verifier names this line's files.
- `v1core-successor-lineage.test.mjs:205` now fails by design: scenario 21 EASY (F1).
- Both have successors in `SUCCESSOR_LEDGER.json`. No other test changes status.

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
| heap per normalization of the corrected history | allocated 1200 → 1335 KiB (short-lived: the timestamp the chain rule reads per correction); **retained after collection 215 → 215 KiB** (`bench/heap-retained.mjs`, `heap-retained.json`) |

A second bench run (5 rounds) gave the same picture: review ×0.975, corrected restart ×0.982, normalizer ×1.03 / ×1.03 / ×0.88, merged re-read ×1.04.

- No copy of the history; one sort key added.
- `accepted.includes` runs only when an incoming report's activity is already bound (a conflict or a re-sync). It is linear there, as `accepted.find` already is for corrections.
- No budget changed.

## F. Outside F1/F2/F3, routed, not fixed (each identical on FREEZE-4)

- **O-NCC-1, FLAGGED_LATER (Low; Core with QRE, with O-1).** A refused report reusing an event id flags the row holding that id, and quarantines the refused report's identity in that pass, not the flagged row's. The next review quarantines the flagged row's identity (from its flag). Dose readers read the flag, so this is weekly-review evidence only: CONFLICTED from the next review on.
- **O-NCC-2, REFUSED_IDENTITY (Low; conflict policy O-1).** A refused report's own identity is quarantined in its pass only. Nothing is flagged on it, so a re-read releases it.
- **Learning model (observation).** `updateLearningModel` carries only rows in force, so a carried correction finds no original there and is refused on each update. This is unchanged here and outside V1 gating.
- **Ties in one review (Security OOS-2).** Two reports of one batch at the same instant are still ordered by event id, and same id at the same instant by input order, as before.

**Raised by the R1 judges, routed, not this line's (each identical on FREEZE-4 unless stated):**
- **SSCTR-NCC-01 / C-NCC-1.** When two reports conflict head-on, the refused one leaves the record, so a later correction from the kept source can settle a dispute the refused report raised.
  - Binds before real-athlete weekly-review gating and run-history use.
  - Owner: the conflict-policy mission (Core with QRE and Security, then Product/UX and SSCTR).
- **SEC-NCC-02.** A report refused against a carried "not done" never reaches the record, so f08's readiness question does not hear its symptom stop; the run-format screen still asks. Binds before a real-athlete restart. Owner: Core + QRE within O-1.
- **SEC-NCC-03.** See §A, F2 limitation.
- **C-NCC-3 (integration).** The run-format record must be stored and sent with every review and restart, since it is how the symptom screen sees a refused athlete stop. `reportedAt` and `correctedAt` must come from one clock.
- **OOS-1 / O-QRE-NCC-A.** Incoming reports keep a client-supplied `conflicted` flag and `provenance.conflict`. Owner: Core with SEC-CORE-03 / O-1.
- **O-NCC-S1 (SSCTR observation, F08 owners).** A zero-minute symptom stop after a readiness declaration no longer re-asks the readiness question. FREEZE-4 asked only because it had lost the stop.
- **Test gap (QRE).** Binding a merged report's activity within one review was not pinned by its own test.

## G. Freezes

- FREEZE-1 to FREEZE-4 and every sporting freeze are untouched.
- `v1core-freeze-4.mjs --check` now names `src/r6-provenance.mjs` as drift, and `v1core-secr2-freeze.test.mjs` names this line's files, both by design (`SUCCESSOR_LEDGER.json`).
- Successor verifier: `CoachingCore/scripts/v1core-freeze-5.mjs` (`--preserved` passes on the committed tree), with test `v1core-ncc-freeze.test.mjs`.
- FREEZE-5 is written only if the three judges approve.

## H. Open, not this mission's

C-F01-2 (custody, with SEC-SR2-02), SEC-CORE-03 (correction author), O-1/B0-F05, the 28-day window contract, local custody decisions and iOS revalidation (`IOS_REVALIDATION_PENDING`) all stay open.
