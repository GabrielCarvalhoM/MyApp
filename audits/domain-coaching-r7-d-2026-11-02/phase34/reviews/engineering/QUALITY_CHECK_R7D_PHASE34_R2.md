# QRE-R7D-PHASE34-CHECK-r2: narrow quality/reliability recheck of candidate 46934a0

- **Answers:** `phase34/reviews/REVIEW_REQUEST_PHASE34_R2.md` (quality/reliability, CQ-4).
- **Candidate:** `46934a0`. Runtime bytes are those of `77768e6`: `r6-adaptation.mjs` is `c98eb081…`, and `r6-composition.mjs` is `8aa5f950…`, unchanged since `1978cc4`.
- **HEAD during the check:** `c3a9a00`, which changes only `scripts/freeze-r7d-5.mjs`.
- **Reviewer:** an independent Quality & Reliability Engineer 1.3.0 instance (claude-opus-5-5, xhigh). It did not write the runtime, the tests, the harness, PREREG-6 or the evidence, and did not open `phase34/reviews/ssctr/`.
- **Execution:** scratch copies only, in `qre2-p34-20261107-121435-653`. Nothing was committed, staged, pushed or deleted.
- **Machine record:** `QUALITY_CHECK_R7D_PHASE34_R2.json`.

## Verdict: NOT_READY

One blocking defect was introduced by the bounded cycle (QRE2-P34-01). Phase 3.4 has no correction cycle left, so the phase closes with this blocker named and routed. `freeze-r7d-5.mjs` refuses on this verdict (line 91).

Everything else asked is correct on the evidence below:
- the CQ-1 fix and its test;
- the CQ-2 tests;
- the other four runtime changes on their own paths;
- the absence of any other runtime byte.

The instrument changes point the right way but leave one false block and one blind spot, both non-blocking.

## What was run (all on scratch copies)

- **Suite and directed files on 46934a0:**
  - suite 992/992;
  - directed 40/14/17/14.
- **RED on `1978cc4`:** exactly T22 to T26 fail; T27 to T30 pass.
- **RED on R7D-FREEZE-4:** 30 of 40 fail; T29 (characterization) passes.
- **Runtime probes** (`probes2/qre2-p34-runtime.mjs`) on six runtimes:
  - the candidate, `1978cc4` and R7D-FREEZE-4;
  - the candidate with only the F04 branch disabled (the author's M17);
  - the survivor mutants N01 and N05.
- **Mutation** (`probes2/qre2-p34-mutation.mjs`): 22 mutants, each in a new directory, run against the 85 directed tests.
  - 15 are killed.
  - The survivors are Q04, Q11, Q14, Q15, N01, N05 and N10.
  - N01 and N05 also survive the full suite (992/992).
- **Harness probes** (`probes2/qre2-p34-harness.mjs`): QH1, QH4, QH5, QH6, DEV-46 and DEV-47, run on the candidate and on a scratch mutant that drops breaks at the second level of a chain of own returns.
- **Partial flag** (`probes2/qre2-p34-partial-flag.mjs`): which `partial` flag P18(a) reads.
- **Not run:** the freeze, verify and queue scripts; `npm run verify`; validation 6 and the regression corpora (their records were read).

## Findings

### QRE2-P34-01 (HIGH, blocking): the F04 question cannot be answered when a re-read of a recorded return raises it

**The case.** The Founder's case is applied: the holiday is read as its own return, with running re-entered and strength not. Then the Monday lift on the holiday's first day is reported for the first time (late). The candidate's late-evidence check now asks F04: "report that break again with its episodeId and the time it began".

**What each answer gives on the candidate:**

| What the athlete sends | Candidate | R7D-FREEZE-4 |
|---|---|---|
| The holiday restated with its start time, as a declaration, inside a weekly review or as a return report (the instructed answer) | ASK "…ends before the one reported on 2026-12-18 began, or spans an earlier return: say when it started and ended, as one period" at every review, weeks 6 to 9 | The same holiday restatement also locks (pre-existing), but this runtime never asks for it |
| The trip confirmed again (I6's answer) | The same F04 ASK at every review, weeks 6 to 9 | REESTABLISH, then KEEP through week 9 |
| Nothing | ASK for the rest of week 6; it clears at week 7, when the late-evidence window ends | Its I6 question also clears at week 7 |

**Baselines and controls:**
- `1978cc4` keeps the plan without asking. It orders the lift after the start, which is the defect SSCTR-P34R-F04 named.
- The candidate with only the F04 branch disabled resolves by the trip confirmation. So the lock comes from the new F04 branch in `stopOf`, reached through `recordedStop`.
- Controls on the candidate:
  - T13's own late fact, answered by the confirmation, resolves.
  - A late lift that is not on the holiday's first day asks nothing.
  - On the separate-breaks path (`separateStop`), F04 is answered by restating the holiday. The result equals the same case with the start time stated from the outset (R02a and R02b; R03 asks about the right break).

**The correction path (R04).** A named correction of the trip that leaves strength with no whole week between the breaks asks F04.
- Unanswered, every later review repeats it.
- Answered by any channel, a different ASK follows through week 8.
- Only re-correcting the trip back to its first dates escapes.
- The same facts reported fresh resolve by the restatement. So the corrected path differs from the fresh read (CF-P34-02) in whether it can be answered.

**Cause.** `recordedStop` rebuilds each earlier break only from the declaration the recorded return listed (`decl.get(b.eventId)`, checked by `inputHash`). A restatement with the start time is therefore never read on that path.
- That restatement also becomes a new break ending before an applied return, which the existing rules ask about on every review.
- The named report of the trip stays on the record, so every later review re-enters `recordedStop` and F04 asks again.

**Detection.** No test, harness property, corpus case, differential or decomposition contains this shape. T25 covers only the separate-breaks path.

**Impact.** Fail-closed: no dose is raised, and the record and the plan in force are kept. But once the athlete does what the coach asks, there is no proposal, no step and no adaptation at any later review. It regresses R7D-FREEZE-4 on accepted inputs, in the phase's central case: the same class and standard as QRE-P34-01.

**Route.** Engineering, in a future authorized mission. The SSCTR confirms the domain side: which question a re-read asks first, and how an earlier break's start time is supplied once an applied return has read it.

### QRE2-P34-02 (MEDIUM, non-blocking; before any holdout): QH4 is still false-blocked

The NESTED guard requires the inner own return to start after the second-level break ends (`b.startDate>end`). A correct two-level chain in which z overlaps y (QH4) therefore still fails with P18(a) OLDER_BREAK_DROPPED.

Touching (QH6), continuity (QH5), QH1 and DEV-47 pass P18, with z routed to NOT_EVALUABLE. Δ16 covers only the guarded rows.

**Route:** instrument owner.

### QRE2-P34-03 (MEDIUM, non-blocking; before any holdout): NOT_EVALUABLE hides a dose-raising recursion defect

A scratch mutant drops a second-level break from the inner own return's stop. On QH1, QH5, QH6 and DEV-47 it gives:
- a byte-identical record and identical property results (P18 PASS with the same NESTED unit);
- higher strength doses ahead, for example back-squat 3x10 against the candidate's 1x7 on QH6.

It also passes 85/85 directed tests and 992/992 in the full suite.

So a runtime can pass every automated check through the rule, and only the Δ16 adjudication can catch it. The record does not give the inner own return's days (QRE-P34-03), so the judge must recompute it from the timeline.

Reporting: the case shows P18 PASS. The unit is visible only in `notEvaluable` (case packet and summary) and is not listed in HARNESS_VALIDATION_R7D_6.

The rule loses no detection P18(a) had before: r1 showed it false-blocked the correct runtime on this shape.

**Route:** instrument owner and engineering (a test); record content stays with the SSCTR (QRE-P34-03).

### QRE2-P34-04 (MEDIUM, non-blocking): two clauses of the cycle are unpinned

- **N01** (F03 without `required(x)`) survives all tests. In R08, running re-enters through a post-event week in which no run was done: TRAINING_AFTER with a 70-minute long run, where the candidate gives OWN_RETURN for strength only and a 20-minute long run.
- **N05** (F04 naming the own return's head instead of the break that starts its stop) survives all tests. In R03 the question names the wrong break, and its answer then leads to another question.
- **Other survivors:**
  - Q11, Q14 and Q15 are still untested.
  - Q04 is not reachable per the request; I did not verify that.
  - N10 is probably equivalent, since a race's minutes are exempt from the completion rule.

**Route:** engineering (tests).

## Answers to the questions

**CQ-1 fix and its test.** Correct. The fix is the one-token default `separateStop` already uses, and it is reached only when the length is known.
- T26 fails on `1978cc4` and passes now.
- Five more shapes (R01a to R01e) each equal the correction with its first day, with no HOLD. `1978cc4` HOLDs in three of them.
- The revert (M23) and an off-by-one variant (N08) are each killed by T26.

**CQ-2 tests.** Each test fails on its mutant, reproduced independently: M18 and M19 by T27, M20 by T28, M21 by T29, M22 by T30, M23 by T26. Each mutant fails exactly that one test. T27 to T30 pass on `1978cc4`.

**The five runtime changes:**

| Change | Judgement | Evidence |
|---|---|---|
| F01 | Correct | T22; N07 killed |
| F02 | Correct | T23, R05a; N09 killed |
| F03 | Correct | T24, R05c, R05d; N02 killed; the `required(x)` clause is unpinned (N01) |
| F04 | Correct on the separate-breaks path; defective on the re-read paths (QRE2-P34-01) | T25, R02, R03; N03, N04 and N06 killed; `startBreak` unpinned (N05) |
| QRE-P34-01 | Correct | as CQ-1 above |

No other runtime byte changed: `git diff 1978cc4 46934a0 -- CoachingCore/src` lists only `r6-adaptation.mjs`, +22/−9.

**CQ-3 instruments:**
- **The NOT_EVALUABLE rule** removes the QH1/DEV-47 false block and loses no prior detection. It misses the overlapping variant (QRE2-P34-02). A runtime can evade the automated check through it, so its soundness rests on the Δ16 adjudication (QRE2-P34-03).
- **The P02 change** is right: it uses the same `refusedUnread` as P17 and P18. One theoretical residual remains: the else-if branch still adds a refused step's id to a known episode.
- **P18(a) under the completion rule** is still a necessary condition. It reads the runtime's own `partial` flag (DEV-46's touch: `partial:true`, 13 of 25 minutes), and the runtime counts nothing partial.

**Evidence refresh.** Its claims are accurate for what it covers.
- Reproduced here: the suite, the directed files, both RED claims, the CQ-2 kills, and DEV-46 and DEV-47 through the harness.
- Read here: MUTATION (23 rows, internally consistent), validation 6, the regressions, the differential (167 cases, 148 same, 19 differing, 0 unexplained) and the decomposition (6, 13 and 0).
- No corpus or test holds the QRE2-P34-01 shapes.

**Freeze readiness.** Not ready (see the verdict).

## Conditions for freeze (for any later candidate; 46934a0 is not freezable)

1. **CQ2-1.** Fix QRE2-P34-01 in a future authorized mission. Add directed tests that fail on 46934a0: R07, answered both by the restatement and by the confirmation; and R04. Then a new independent check must name the new commit.
2. **CQ2-2.** Before any holdout, resolve QRE2-P34-02: extend the guard to overlapping or touching second-level breaks, or disclose it with its adjudication. Add a DEV case, and the sensitivity rows must still detect.
3. **CQ2-3.** Before any holdout, address QRE2-P34-03:
   - a directed test pinning a two-level chain's doses, which kills the depth-2 drop mutant;
   - Δ16 must state that the judge recomputes the inner own return from the timeline;
   - NESTED units must be listed in the validation and holdout reports even when P18 is PASS.
4. **CQ2-4.** Add tests that kill N01 (R08 shape) and N05 (R03 shape).
5. **CQ2-5.** Carry the routed items unchanged and keep the CQ-6 disclosures:
   - to the SSCTR: QRE-P34-03, -05 and -06, and QRE2-P34-01's domain side;
   - to PCG: QRE-P34-07.

## States

- QUALITY_BLOCKED for 46934a0.
- F08_OPEN (not judged).
- FINAL_HOLDOUT_EXISTS: NO.
- V1_COACHING_AUTHORITY_READY: NO.
