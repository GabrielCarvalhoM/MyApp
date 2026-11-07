# QRE-R7D-PHASE34-CHECK-r1: narrow quality/reliability check of the R7-D Phase 3.4 candidate

**What this is:** the independent quality/reliability check the review request asks for, on candidate **`1978cc4`** (runtime bytes of `7cadcd8`). [The JSON record](QUALITY_CHECK_R7D_PHASE34.json) prevails over this summary.

**Verdict: NOT_READY.** There is one blocking engineering defect, in the new correction re-read (QRE-P34-01):
- A named correction of the latest break that omits its first day throws an exception inside the new re-read (`recordedStop`).
- Every later review then stays in `HOLD`.
- R7D-FREEZE-4 applied the same input.

It fails closed: no prescription is made and the record is kept. The fix is a one-token default that `separateStop` already applies. I checked it in scratch only; it is not applied to the repository.

Everything else I judged is correct on the evidence below. The other seven findings are non-blocking: tests, the instrument, or items routed to their owners. The one bounded runtime-only cycle can close QRE-P34-01. The corrected candidate then needs a narrow independent re-check that names its commit (CQ-4).

**Reviewer:** Quality & Reliability Engineer 1.3.0, claude-opus-5-5, effort xhigh.

**Independence:**
- I am a fresh instance. I wrote none of the runtime, tests, harness, PREREG-6, INTERFACE-6 or evidence.
- I did not open `phase34/reviews/ssctr/`, and I delegated nothing.
- I wrote only in this folder. Nothing was committed, staged, pushed or deleted.
- Every run used copies in new, uniquely named scratch directories. The author's rebuilt runtimes were not used.

## What I ran

| Check | Result |
|---|---|
| Full suite on a `git archive` of 1978cc4 | **983/983** (node v24.19.0) |
| Phase 3.4 directed tests on R7D-FREEZE-4 source | 22 fail, 9 pass (reproduced) |
| The five updated assertions, both directions | Exactly those five fail on the other runtime, both ways (reproduced) |
| My runtime probes (`probes/qre-p34-runtime.mjs`, `qre-p34-q01.mjs`) | QRE-P34-01, plus the edge cases below |
| My harness probes (`probes/qre-p34-harness.mjs`): my own cases through the harness client and properties | QRE-P34-02 |
| 17 targeted mutants complementing P34-M1..M13 (`probes/qre-p34-mutation.mjs`; Phase 3.1–3.4 directed tests, 76) | 3 killed, 14 survived; triaged under QRE-P34-04 |
| Full suite on the three observable survivors (Q02, Q09, Q12) | 983/983 each: no test kills them |
| Ceiling monotonicity on all 165 corpus cases, R7D-FREEZE-4 against my own ceiling-only hybrid (`probes/qre-p34-ceiling-monotone.mjs`) | 6 cases differ (the decomposition's set); **0 run doses raised**, 0 strength rows changed |
| Time-zone metamorphic check (`probes/qre-p34-tz.mjs`): 21 multi-break DEV cases at UTC, UTC−3 and UTC+9 | 21/21 identical |
| Scratch-only check of the QRE-P34-01 fix | 76/76 directed; the correction applies and equals the same correction with its first day |
| Queue script preconditions, read-only (the script was not run) | All hold: 234 items, exact round-trip, no duplicate, funding `NOT_DECLARED` |

Not run:
- `freeze-r7d-5.mjs`, `verify-r7d-5.mjs`, `integrate-queue-r7d-p33.mjs` and `npm run verify`;
- a re-execution of harness validation 6 (its record was read; my probes use the same client and properties).

## Findings

| Id | Severity | Blocking | Route | Finding |
|---|---|---|---|---|
| **QRE-P34-01** | HIGH | **yes** | Engineering | A named correction of the latest break that states its length and last day but not its first day throws `RangeError` in `recordedStop`. The result is `HOLD` "Malformed review facts: Invalid time value", and every later review HOLDs until the break is restated with a start date |
| QRE-P34-02 | MEDIUM | no | Instrument owner (Chief) | P18(a) false-blocks a correct runtime on a two-level own-return chain (four separate unapplied breaks) |
| QRE-P34-03 | LOW | no | SSCTR / Chief | Nested own returns leave only a bare label in the record, and no test pins that label (`stopInOwnReturn`), which P18(a) reads |
| QRE-P34-04 | MEDIUM | no | Engineering (tests) | Several contract edges are implemented correctly but pinned by no test: an adverse or conflicting race, a same-day session without `startedAt`, a correction sent with a partial record, ceiling shapes |
| QRE-P34-05 | LOW | no | SSCTR | A week whose strength sessions were all skipped (unavailable days) is a full re-entry week, so strength reads its executed history. Pre-existing |
| QRE-P34-06 | LOW | no | SSCTR | A post-event week with only optional recovery runs can never be a full re-entry week while it plans running |
| QRE-P34-07 | LOW | no | PCG | Two pre-existing review shapes that do not read the record return their own question, not the clinical route, while a clinical-cause episode is kept |
| QRE-P34-08 | LOW | no | Instrument owner | P02's new R-F08-1 block does not skip steps the runtime refused unread (P17 and P18 do). Theoretical |

### QRE-P34-01 (blocking)

**Reproduction** (`probes/qre-p34-q01.mjs`, `qre-p34-runtime.mjs` Q01):
1. The Founder's case runs to its return: the holiday is `OWN_RETURN`, the trip is SHORT 4.
2. A `RETURN_AFTER_PAUSE` then names the trip with `{endDate, days: 5, reasonCategory, reason, nonclinical}` and no `startDate`.

**Results:**

| Runtime | First correction | Later reviews |
|---|---|---|
| Candidate | `HOLD`, `errors: ['malformed:RangeError']`. A correction that states only its length HOLDs too | The next plain review and the week's review HOLD as well. The record is kept |
| R7D-FREEZE-4 | `REESTABLISH` (dropping the holiday: the F02 defect this phase fixes) | `KEEP` |

Control: the same correction after a single-break return is identical on both runtimes.

**Cause:**
- `readBreak` returns `start: null` when a report gives no first day. The interface accepts this, and `returnAfterPause` handles it.
- `recordedStop` builds its head as `{start: head.start, …}`, and `stopOf` calls `onDate(null, -1)`, which throws.
- `separateStop` already uses `head.start ?? onDate(head.end, -(head.days-1))`.

**Scratch-only fix check:** with that default, the correction applies, equals the same correction with its first day, never HOLDs again, and 76/76 directed tests pass.

**Impact:** CF-P34-02 ("the corrected return equals the fresh re-read") fails for this accepted input. No harness property sees it, because no return is applied.

### QRE-P34-02

**Case** (QH1): four separate unapplied breaks, z (wk2), y (wk4), x (wk6) and H (wk8 Mon–Thu), each with a run-complete week before the next.

**What the runtime does** is correct under BR-Q1.3 recursion:
- x is `OWN_RETURN`;
- y is `WITHIN_OWN_RETURN` with `stopInOwnReturn: OWN_RETURN`;
- z is `WITHIN_OWN_RETURN` with `stopInOwnReturn: WITHIN_OWN_RETURN`.

**What P18 does:** it fails with `OLDER_BREAK_DROPPED` for z, because `withinOwn` accepts only coverage by the top-level own return's dates, or a `TRAINING_AFTER` or `OWN_RETURN` label. The one-level controls QH2 and QH3 pass.

P18 is a BLOCKER with no envelope, and no DEV case of validation 6 has a `WITHIN_OWN_RETURN` row. So to the request's question "could any check block a correct holdout?" the answer is **yes**.

### QRE-P34-04: mutation triage (my 17 mutants)

| Mutant | Outcome |
|---|---|
| Q01 applied-return guard; Q08 own-return point; Q13 same-day `material` | **Killed** (T20, T1, T21) |
| **Q02** an adverse or conflicting race still re-enters running | **Observable survivor:** the candidate gives `OWN_RETURN`, strength only, running RETURN; the mutant gives `TRAINING_AFTER`, running EASY. Survives the full suite |
| **Q09** a correction re-read silently drops a break whose declaration is missing from the record sent | **Observable survivor:** the candidate asks; the mutant applies the return without the holiday. Survives the full suite |
| **Q12** a session on the later break's first day counts without `startedAt` | **Observable survivor:** the candidate gives continuity MODERATE 24 (BR-Q5); the mutant gives `OWN_RETURN` SHORT 4. Survives the full suite |
| Q03, Q04 race reported after the stop began, or conflicted | Untested |
| Q10 `stopInOwnReturn` lost | Untested (see QRE-P34-03) |
| Q11 the own-return days not declared to the composition; Q14, Q15 ceiling shapes | Untested; observability not established |
| Q05, Q06 R-F08-1 branches in `recordedStop` and `separateStop` | Unreachable defence in depth: `keptBreaks` reads any clinical-cause group, and the clinical route decides before any handler runs |
| Q07 | Reason text only |
| Q16, Q17 time-zone handling | No effect under the time-zone metamorphic check |

## Answers to the request

**Correctness:**
- **`reentryBetween`** is correct against BR-Q4 and BR-Q5:
  - counted runs are the gated roles, and completion needs at least one gate key, so nothing completes vacuously;
  - the race touch and the race must be finished, not adverse or conflicting, and reported before the cut;
  - every strength exercise needs ADVANCE or EARNED and a log;
  - optional walks, recovery runs, shakeouts and strides never decide a week;
  - a session on the later break's first day counts only with `startedAt` and a report before it;
  - a report with only a day gets the end of that local day, so it never counts before a later start time.
- **`ownReturnOf`** is correct against BR-Q1.3:
  - its stop is read recursively, and its class comes from its own stop's days (QH3: merged with a touching break, MODERATE 14);
  - it uses the unchanged recipe with no demonstration;
  - its point is local midnight after the break's last day;
  - it is a reading only, never recorded as a fact.
- **`stateForStop`** is correct per sport (BR-Q3). `stateAtBreak` chooses the return in force by end date, so the appended position of the reconstructed return does not mislead it.
- **`recordedStop`** has the QRE-P34-01 defect. Otherwise it re-reads every recorded break by `stopOf`, and asks when a declaration is missing or changed (untested: Q09).
- **`stopOf`** places breaks in the BR-Q1 order: full re-entry, then unreported sessions asked first, then own return under the guard, then continuity. Its record rows and its `declared` list are correct, and its sort is deterministic.
- **`appliedBetween`** is correct. The guard always ends in the existing question, because the continuity stop then spans the applied return.
- **The `returnEntry`/`returnClass` refactor** preserves behaviour: the old branches are verbatim and in order, and no single-break case changed.
- **The `staleReturn` rebuild** is correct. There is no spurious question (T10), and genuine late evidence is asked: T13, and my Q04 (both long runs corrected to not done gives `ASK`, where the fresh read is LONG 32 RESTART).
- **The `EPISODE_CLINICAL` path** is correct. The symbol is never serialized, the same review twice is byte-identical, `inputHash` hashes the input, and the conformance anchor is untouched (Q07).
- **The `composeWeeks` ceiling change** is correct. It can only remove references from a maximum, and it never raised a dose in 165 cases.

**Edge cases:**
- **Three or more breaks:** T8 covers three. My one-level `WITHIN_OWN_RETURN` cases QH2 and QH3 are correct; the two-level case is QRE-P34-02 and -03.
- **A sport with no counted session in a week:** nothing completes vacuously (QRE-P34-06 is routed).
- **SKIPPED sessions:** see QRE-P34-05 (routed).
- **Late or conflicted reports:** late corrections are asked, and conflicted reports are asked as unreported. Race variants are untested.
- **`startedAt` without observed times:** correct, but the no-`startedAt` case is untested (Q12).
- **Run-only and strength-only plans:** correct (T19).
- **Corrections that touch, overlap or move weeks:** correct (T21), except a correction without its first day (QRE-P34-01).
- **Replays:** correct (T10).

**Determinism and append-only:**
- T11 and Q07 hold.
- The QRE-P34-01 `HOLD` keeps the record.
- The reconstruction never becomes a fact.
- A break carried by another event is still kept separate (T12).

**Containment.** By code reading, only five situations can change anything:
- separate unapplied breaks;
- a named report of a separate-breaks return;
- a late-evidence check of an own-return return;
- a kept clinical-cause episode;
- a re-planned week that holds the latest return (the ceiling).

The refactor is inert. The differential and its decomposition are sound for what they claim: the triggers are necessary conditions, and the decomposition follows one path (R7D-FREEZE-4 → hybrid → candidate). The hybrid is a fair separation, because the composition change uses only `beforeReturn` and `returned`, both already in R7D-FREEZE-4.

**The harness revision:**
- **P18(a)** is again a sound necessary condition for `TRAINING_AFTER`, `OWN_RETURN` and one level of nesting, but not for two (QRE-P34-02).
- **P18(c)** is a sound sufficient reading by construction: stricter than the gates, and strict on the next break's first day. Its residual is disclosed.
- **The P08 alignment** is correct and narrow; it mirrors BR-Q5 and does not weaken the oracle (W-P08c).
- **P06(b)** is necessary: what it allows is a superset of what the runtime credits.
- **P18(d)** cannot false-block the re-read design.
- **DEV-42 to DEV-45** are adequate for what they target. Missing controls: two-level own returns, an adverse or conflicting race, a same day without `startedAt`, a post-event recovery week, a skipped-sport week.

**Adequacy:**
- The 31 directed tests are strong on the main shapes; the gaps are listed under QRE-P34-04.
- **The five updated assertions are accepted.** Each encodes the new reading and adds checks without dropping any, and each is RED both ways. Phase 3.2 T5 is the marked R-F08-1 change that PCG-F08-C03(c) requires.

**New numbers (engineering view).** The diff adds no policy constant: its new literals are date arithmetic and one structural row count. CF-P34-09 itself is the SSCTR's to judge.

**Freeze readiness:**
- `freeze-r7d-5.mjs` (read at HEAD `3f876a0`, where only a header comment differs from 1978cc4) refuses correctly. It will not freeze on this record, and it writes one record with `wx`.
- `verify-r7d-5.mjs` is read-only unless `--write`.
- `integrate-queue-r7d-p33.mjs` checks before it writes, and every check holds today.
- One note: the queue script rewrites the queue whole and checks append-only afterwards. If that post-check ever failed, the queue would be left changed with no integration record, and the freeze would then refuse.
- **No script of this phase deletes anything.**

## Conditions for freeze

| Id | Owner | Condition |
|---|---|---|
| **CQ-1** | Engineering worker | Fix QRE-P34-01: give `recordedStop`'s head the same default for its first day that `separateStop` uses. Add a directed test, RED on 1978cc4: a correction without its first day (and one with only its length) gives what the same correction with its first day gives, and no later review HOLDs. One narrow runtime-only change |
| **CQ-2** | Engineering worker | Add directed tests that kill Q02, Q03 or Q04, Q09, Q12 and Q10, each RED on its mutant. Then refresh EVIDENCE and MUTATION on the corrected bytes |
| **CQ-3** | Chief / instrument owner | Before any holdout exists, resolve QRE-P34-02 one of two ways: correct P18(a) for nested chains (with a DEV case of at least two levels, and no weakening of the oracle) under an append-only PREREG-6 addendum, **or** disclose it as a known instrument false block, with QH1 as the witness and an adjudication rule. Treat QRE-P34-08 the same way |
| **CQ-4** | Chief | This record judges 1978cc4 only. The corrected candidate gets a narrow independent quality/reliability re-check that names the new commit, which `freeze-r7d-5.mjs` requires |
| **CQ-5** | Chief | Record QRE-P34-03, -05 and -06 (to the SSCTR) and QRE-P34-07 (to PCG) in the freeze record as routed. None blocks the runtime by this record |
| **CQ-6** | Chief | Keep disclosed without envelope: P18(c) is sufficient only; the differential's triggers are necessary conditions; the decomposition follows one path |

## Limits

- These are synthetic fixtures and the existing corpora: engineering evidence only, never gate, generalization or human validation evidence.
- The mutants ran on the four directed test files; only the three observable survivors were rerun on the full suite.
- The observability of Q11, Q14 and Q15 is not established.
- No domain or clinical decision is made here.

**States:**
- QUALITY_BLOCKED for 1978cc4;
- `F08_OPEN` (not judged);
- `FINAL_HOLDOUT_EXISTS = NO`;
- `V1_COACHING_AUTHORITY_READY = NO`.
