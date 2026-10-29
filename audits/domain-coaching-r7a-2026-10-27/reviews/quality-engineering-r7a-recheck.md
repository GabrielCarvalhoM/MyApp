# R7-A independent engineering re-check (R7A-QE-r2)

**R7A_ENGINEERING_REVIEW = NOT_READY on R7A-FREEZE-2.**

- **Fixed:** 11 of my 18 first-cycle findings.
- **Partly fixed:** 6. Five of them still block: 01, 02, 03, 05 and 12. Each has a residual in the same mechanism and claim.
- **New:** the second cycle introduced one new blocker, QE-R7A-19 (MEDIUM). I also found four new LOW gaps that do not block.
- **Close:** this was the single narrow re-check, so R7-A closes NOT_READY with the six blockers named below.

**Who did this.** I am the Quality & Reliability Engineer (constitution 1.3.0), a fresh independent instance (claude-opus-5-5). I did not write this runtime and I fixed nothing.

**Freeze checked.** R7A-FREEZE-2 (`CoachingCore/r7/RUNTIME_FREEZE_R7A_2.json`):
- All 75 files match their SHA-256 hashes.
- The source digest `f56ae974…f0f7821c` recomputes exactly. I used `hash()` over the `src/` entries, as `scripts/freeze-r7a.mjs` defines it.
- The policy `18ec48f3…` is unchanged from FREEZE-1.
- The delta from FREEZE-1 is exactly the 4 source files plus `test/r7a-cycle2.test.mjs`.
- I checked all of this before and after every probe (`reviews/qe-recheck-verify-freeze*.out.json`).

**What I ran:**
- `node --test`: 476 tests, 476 pass (`qe-recheck-node-test.out.txt`).
- `node scripts/verify-r7a.mjs` without `--write`: 8 of 11 checks pass. The 3 failures are closure items that have not been written yet.
- Every first-cycle probe of mine, rerun against FREEZE-2 (`qe-recheck-rerun-*.out.json`).
- Eight new probes, `qe-recheck-P1…P8`. For P1–P4 I also ran the R6 closure runtime (`QE_RUNTIME=pre`).
- One mutant, built in the OS temp directory only (`qe-recheck-lib.mjs`).

I used the DEV_TEST_ONLY `devAuthority()`, synthetic data and no network. I did not run `npm run verify`, any earlier `verify-r*` script, or `regress-r7a.mjs`, because it writes under `CoachingCore/`.

To reproduce a result, run this from the repository root:

```
node audits/domain-coaching-r7a-2026-10-27/reviews/<script>
```

## Per finding on FREEZE-2

| Id | Sev | Status | Evidence on FREEZE-2 |
|---|---|---|---|
| 01 | HIGH | **PARTIAL** | Weekly review and schedule change now keep a next-week return (rerun A). **Residual: an equipment change erases it** (P1 S1). |
| 02 | HIGH | **PARTIAL** | MODERATE: the same-day session gets the entry dose (rerun A2, P2). **Residual: the SHORT class keeps the same-day quality run** (P2). |
| 03 | HIGH | **PARTIAL** | Race moved closer: the remaining days match the twin program (rerun B). Postponed in race week: one race (rerun B3). **Residual: after a next-week return, a postponement leaves two races** (P1 S2). |
| 04 | MED | FIXED | N2: 0 of 102 same-week proposals rejected (FREEZE-1: 40). N: 467 reviews, 0 phase-dose rejections. |
| 05 | HIGH | **PARTIAL** | Subset report, no-load report, label prefix and the 12-week drift are fixed (CDEF C, C34). **Residual: the per-exercise merge drops a known load** (P4 4a, P5 5a). |
| 06 | MED | FIXED | Repetition and RIR contradictions are a conflict in either order (CDEF D). |
| 07 | MED | FIXED | 100 lb against 80 kg is a conflict; the state stays 80 (D2). |
| 08 | MED | FIXED | The carried correction stays live and the review is idempotent (CDEF E). |
| 09 | MED | FIXED | An exact replay changes nothing (CDEF F). |
| 10 | MED | FIXED | The 30-day squat move is not offered; the session is skipped with no debt (G). |
| 11 | MED | FIXED | Malformed, impossible or inverted windows get ASK (H). |
| 12 | MED | **PARTIAL** | At the planned load, HOLD keeps 3x5 (R2, P3). **Residual: a shortfall at a lighter load becomes the target** (P3). |
| 13 | LOW | PARTIAL | Labels, UTC instants and the hint are fixed (I). Residual: a date-only record ignores the athlete's time zone (P7 7a). Non-blocking. |
| 14 | LOW | FIXED | The ceiling reads the executed fitted count (rerun J). Projection and review agree on every count field: 0 differences in 180 comparisons (P6 6b). |
| 15 | LOW | FIXED | Both time budgets give RETURN_ENTRY, then RETURN_STEP (K). |
| 16 | LOW | FIXED | A new report flagged superseded is live; a future-dated one is excluded (OPQ O). |
| 17 | LOW | FIXED | The practice row is practice in the review too (OPQ P). |
| 18 | LOW | NOT_FIXED | Routed to R7-B by design; unchanged (OPQ Q). Non-blocking. |

## Blocking at close

### QE-R7A-01 residual (HIGH): an equipment change erases a next-week return

**Mechanism.** `equipmentChange` (r6-adaptation.mjs:540, :554):
- It projects weeks w and later from `stateTrace[w]`, the pre-break state.
- It then overwrites `stateTrace[i≥w].strength` with that projection.
- It never reads `rebasedNext`. The cycle-2 fix covered only `weeklyReview` and `rebuild`.

**Reproduction** (`qe-recheck-P1-same-week-composition.mjs` S1). Setup: a 16-day break, the return reported Sunday at 20:00, and an equipment change at 20:30 (dumbbells and bench, temporary or permanent).

| Order | Week-6 return steps | Example week-6 rows |
|---|---|---|
| Return only | all 0 | `db-bench-press 1x6@4 RETURN_ENTRY` |
| Return, then equipment change | all null (the run stays in RETURN mode) | `db-bench-press 4x6@3 KNOWN 22`, `db-row 4x5@3 KNOWN 24` |
| Equipment change, then return | all 0 | `goblet-squat 1x5@4 RETURN_ENTRY` |

So the first strength week after the break comes back above the pre-break dose. The R6 closure runtime gives the same result.

### QE-R7A-03 residual (HIGH): after a next-week return, a postponed race leaves two races

**Mechanism.**
- The return's `wait` (:640) keeps a RACE row that is still ahead this week.
- In `goalChange`, `reachesThisWeek` (:587) is forced to false by `!rebasedNext(program, w)`.
- So the rebuild starts next week and the old race stays.

**Reproduction** (P1 S2):
- The 10K is on 2027-02-07, and weeks 11–12 were not trained.
- The return is reported on the Saturday of race week, leaving only the race (re-entry in week 14).
- The race is then moved to 2027-02-14.
- **Return, then postponement:** races in `w13 2027-02-07` and `w14 2027-02-14`.
- **Postponement, then return:** one race, and the old race day becomes REST_BY_DESIGN.

The R6 closure kept the old race in both orders. FREEZE-2 fixes one order, and its own guard leaves the other.

### QE-R7A-02 residual (MEDIUM): a SHORT return on a quality morning keeps the quality run

**Mechanism.** The SHORT rule "the first run back is easy" (:644) still selects `s.date > asOfLocal` instead of using `aheadOf`.

**Reproduction** (`qe-recheck-P2-return-day-boundary.mjs`). A 5-day break ends on Wednesday:

| Return reported | Thursday run |
|---|---|
| Wednesday 21:00 | `d3 EASY 41` |
| Thursday 05:00 (run at 08:00) | `d3 QUALITY THRESHOLD 41` |

MODERATE gives the same answer at either time. On the R6 closure, the pre-break THRESHOLD 48 was kept.

### QE-R7A-05 residual (MEDIUM): the per-exercise merge drops a known load

**Mechanism.** For each exercise, `mergeActual` (r6-provenance.mjs:36–42) keeps one whole entry. It ranks entries by count of known values, then sets, then source rank, and does not merge fields.

**Example.** The two reports tie on 6 known values, and the device entry wins on rank:
- The manual entry has loads and reps but no RIR.
- The agreeing device entry has reps and RIR but no loads.

**Reproduction.**
- **One review (P4 4a):** the merged squat has no load and differs from the field union. Its week does not count as executed: loadTick is 0, not 1.
- **Ten weeks (`qe-recheck-P5-merge-timelines.mjs` 5a):** with the device report added, four exercises the athlete logged every week are never established.
- **Ten weeks, final loads:** squat and bench end at 80 / 18 kg. The field union ends at 90 / 26 kg, with all six exercises established.

The manual report alone establishes everything, so adding an agreeing report makes the result worse than either report alone. The R6 closure loses the load too.

### QE-R7A-12 residual (MEDIUM): a shortfall at a lighter load becomes the target

**Mechanism.**
- `advanceStrength` (r6-program.mjs:484) keeps the planned target only when the log "confirms" the known load, meaning exactly the same value.
- `loggedLoadDecision` adopts any lower load.
- So a known lift logged one increment lighter is treated as a newly established load and takes the logged repetitions, whatever the gate says.

**Reproduction** (`qe-recheck-P3-hold-lighter-load.mjs`). Planned: 3x5 at 80 kg, goal range [4, 6].

| Logged sets | Gate | Week-1 prescription |
|---|---|---|
| 77.5 kg × 5, 3, 5 | HOLD | 3x3 @ 77.5 |
| 75 kg × 4, 4, 2 | HOLD | 3x2 @ 75 |

The R6 closure gives the same result.

### QE-R7A-19 (MEDIUM, new in cycle 2): an event change that reaches this week erases earlier adaptations of that week

**Class:** order dependence. New, narrow and runtime-only.

**Mechanism.**
- The cycle-2 `rebuild` with `fromWeek = w` (:458–460) re-projects the remaining days from `stateTrace[w]`.
- Four handlers keep their changes only in week w's session rows: SYSTEMIC_FATIGUE, UNAVAILABLE_DAY, missed-session moves and EVENT_WEEK_CONFLICT.
- A later event change therefore silently undoes them.

**Reproduction** (P1 S3). A 10K program, on the Monday of week 6.

| Adaptation | Adaptation, then event change | Event change, then adaptation |
|---|---|---|
| Systemic fatigue | `d3 RACE_TOUCH 25`: the race-pace touch is back | `d3 EASY 25` |
| Thursday unavailable | `d3 RACE_TOUCH 25` plus Thursday strength: sessions on the unavailable day | Thursday SKIPPED, the touch moved to Tuesday |

The R6 closure gives the same result in either order, so the second cycle introduced this.

## Non-blocking (LOW)

- **QE-R7A-13 residual (P7 7a):** a date-only intake record is read at 23:59:59 UTC. At UTC+5, the earlier local day (24 kg) beats a later local-day timestamp (20 kg).
- **QE-R7A-20 (new in cycle 2; P4 4c):** a new report's own `provenance.mergedSourceIds` registers it under other event ids. A genuine report of another session is then absorbed as an EXACT_REPLAY, and the decision becomes GATED_NEXT_STEP with EASY HOLD.
- **QE-R7A-21 (P4 4b, P5 5b):** with three reports of one session, arrival order still decides.
  - The merged row keeps the first report's source quality, so the merged minutes are 36, 37 or 35 by order. The R6 closure gave 37 in every order. This reached no prescription in ten weeks.
  - Two contradicting reports merge when a middle report arrives first: COMPLETED/ADVANCE versus CONFLICTED/HOLD. This predates R7-A.
- **QE-R7A-22 (test adequacy; P6 6a):** the author documented the mutation survivor "Counts from the first executed exposure" as unreachable, but it is reachable.
  - Setup: a return, then a cap week with a mid-week systemic fatigue. db-row and db-bench-press are done 2x on day 0 and 1x on day 4.
  - FREEZE-2 holds setCap 2, as FR2 requires. The mutant releases the cap, in all three timelines I ran.
  - So a regression to the mutant would pass every test.
- **QE-R7A-23 (new in cycle 2; P8):** `aheadOf` ignores the time of day. An evening re-plan before a late report rewrites the record of morning and evening sessions that were already executed:
  - THRESHOLD 43 is recorded as 34.
  - Strength 4x@3 is recorded as 2x@3.
  - No decision difference was found.

## Checked and not broken

- **D53:** 192 timelines, 0 violations (L).
- **Single-branch phase dose:** 467 reviews, 0 rejections, statuses as on FREEZE-1 (N).
- **Unknown repetitions** (R).
- **Legacy hand-over** (M2).
- **One count in projection and review** (P6 6b).
- **Decisions after a late same-day report** (P8).

The regression filter drops the `entryWeek` and `inputHashes` keys, but it still compares every prescription and status. So it cannot hide a decision difference that the corpus exercises. It can only hide a latent state difference whose effect falls after a case ends.

## Observed, not counted (areas the delta did not touch)

- **Inconsistent day boundary.** Equipment change, fatigue, unavailable day, event-week conflict and moves still use `date > asOfLocal`, while return, goal change and immutability now use `aheadOf`. For example, after a morning move to machines, that day's PM session keeps its barbell rows. The equipment change's projected state then differs from the reviewed one (P7 7b). Listed for R7-B.
- **D55.** In P7 7b, machine exercises first set up in a return step week get `returnInBlock` and a regain cap. Ruling on the dose is the SSCTR's.

## Verdict and binding

**NOT_READY.** This verdict is bound to R7A-FREEZE-2, source digest `f56ae974762523b1efacd9ad7a9046cc7f6b7d33e42a7c2c955e758ef0f7821c`, policy `18ec48f3…`.

STOP_WHEN ("no known HIGH structural failure of this phase stays open") is not met.

There is no further cycle, so R7-A closes NOT_READY with these blockers named:

| Id | Sev | Blocker |
|---|---|---|
| QE-R7A-01 | HIGH | Equipment change erases a next-week return |
| QE-R7A-03 | HIGH | Two races after return plus postponement |
| QE-R7A-02 | MEDIUM | SHORT return keeps the same-day quality run |
| QE-R7A-05 | MEDIUM | Merge drops a known load |
| QE-R7A-12 | MEDIUM | Lighter-load shortfall becomes the target |
| QE-R7A-19 | MEDIUM | Event change erases earlier same-week adaptations (new) |

Each blocker is narrow and runtime-only, so each can be carried by name into the next mission.

Machine-readable version: `quality-engineering-r7a-recheck.json`.
