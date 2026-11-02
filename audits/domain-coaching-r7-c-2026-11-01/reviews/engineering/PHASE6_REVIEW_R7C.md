# R7-C Phase 6: Engineering review of R7C-FREEZE-3 (QE-R7C-07)

Record `R7C-ENGINEERING-PHASE6-REVIEW-1`, dated 2026-11-02. The structured record is [PHASE6_REVIEW_R7C.json](PHASE6_REVIEW_R7C.json). The request is [PHASE6_REVIEW_REQUEST.md](PHASE6_REVIEW_REQUEST.md).

- **Judge:** `quality-reliability-engineer`, a fresh instance; model `claude-opus-5-5`, effort xhigh.
- **Independence:** I did not author the runtime, the Phase 6 fix, its tests, its evidence, the earlier reviews or their probes.
  - The authoring session's scratchpad named in the request is the parent folder of my own session scratchpad. I did not use either; my extracted revisions and helper scripts live in a separate folder outside the repository.
  - Untracked SSCTR Phase 6 work appeared during the review (`reviews/ssctr/probes/phase6/`, then `SSCTR_PHASE6_RECHECK_R7C.*`). I did not open it.

## Verdict

**NOT_READY.** The fix closes QE-R7C-07 for the answer shapes it reproduced, and nothing else regressed. But the same defect class survives for answers that report runs done but shorter than prescribed (**QE-R7C-10, BLOCKER, `DIRECT_R7C_DELTA`**). There is no correction loop in this phase, so R7-C closes as `CLOSED_NOT_READY`.

What holds on FREEZE-3:
- recorder independence on the predecessor's 160-cell grid: 0 failures, against 72 on FREEZE-2;
- recorder independence on my 1,536 longer trajectories for every answer with full-dose runs;
- clinical routes: nothing prescribed while the route stands (960 of 960 checks);
- no history rewritten (111 recorded re-plans checked);
- QE-R7C-08 and QE-R7C-09 unchanged;
- every committed probe I reran is byte-identical to its committed output.

What does not hold: an answer whose runs were all done but shortened, recorded by a clinical route (or left in an ASK that a C2-conformant client does not apply), in weeks that a review closed while no run was reported. There the next decision presents the stale projection as **VALID**. It includes:
- a quality session the answer rules out (in the GEN development week and in the taper);
- a long run 16 minutes above what the facts allow.

The same answer delivered directly is applied, and R7B2-FREEZE-1 is recorder-independent on all 280 cells of that grid.

| Id | Severity | DIRECT_R7C_DELTA | One line |
|---|---|---|---|
| QE-R7C-10 | BLOCKER | yes (R7-C; not introduced by Phase 6, which does not reach it) | QE-R7C-07 stays open for shortened executed answers. Weeks that a review closed while no run was reported, whose runs later arrive shortened, still read as HOLD, so the recorded-answer re-plan treats those late runs as already read and does not fire. The stale projection stays VALID in 28 of 280 cells (FREEZE-2: 224; R7B2-FREEZE-1: 0). |
| QE-R7C-11 | MINOR | yes (Phase 6) | The reach is wider than the request states, and it changes Property B's scope (SSCTR acceptance needed). It covers never-reviewed reporters from week 5, windows of KEEP-only reviews, and habitual late reporters. The G01 grid changes 8 rows, not 4. QE-R7C-05 is now passing but still disclosed as open. |
| QE-R7C-12 | MINOR | yes (Phase 6) | After a direct answer, the recorded-answer re-plan fires again later in the answer week. It can raise next week's VALID conditional doses above FREEZE-2's and above the week's own review: EASY 20/20 against 15/15 after a known stop, within the single-run ceiling, until the review. |
| QE-R7C-13 | OBSERVATION | yes (R7-C); not Phase 6 | The disclosed edge also arises through the MOVED origin (a correction inside the same change), identically on FREEZE-2 and FREEZE-3. The disclosure names only the transition path. |
| QE-R7C-14 | OBSERVATION | yes (Phase 6) | Test adequacy of `answeredOnRecord`. Of my 8 mutants, 2 are killed, 3 are equivalent and 3 survive. One survivor is witnessed: REGRESS removed leaves an all-adverse answer stale and VALID. The directed tests use full-dose answers only. |

| Earlier finding | Now |
|---|---|
| QE-R7C-07 (BLOCKER) | **Partially closed:** 72 → 0 of 160 grid cells, and 0 failing trajectories for every full-dose answer shape I added. Still open for shortened answers, as QE-R7C-10. |
| QE-R7C-08 (MINOR) | Unchanged, correctly classified and disclosed (rc-p2: 540 of 540 decisions identical to FREEZE-2) |
| QE-R7C-09 (OBSERVATION) | Unchanged, correctly classified and disclosed (rc-p5: identical reading) |
| QE-R7C-05 (MINOR, disclosed) | Now passes qe-e4's two batch checks on FREEZE-3 (81/81; FREEZE-2: 79/81). The handoff residual is out of date (part of QE-R7C-11). |

## Freeze identity and verifier

| Field | Value |
|---|---|
| Record | `CoachingCore/r7/c/RUNTIME_FREEZE_R7C_3.json`, sha256 `e21da973…0f36` |
| Commit of the bound bytes | `08c6db352d102e2b33ed7e834cff980248b90299` (worktree HEAD `344ea61`, unchanged from start to end) |
| Source / manifest digests | `764ad023…4b38` / `ebc8af2f…bbaa` |
| Size | 163 files, 866 tests |
| Delta against R7C-FREEZE-2 (`a10cec0`) | `src/r6-adaptation.mjs` only, plus `test/r7c-phase6.test.mjs` and the two pinned fixtures (checked: the worktree's `src`, `test`, `r6` and `r7/b/fixtures` equal a `git archive` of `08c6db3`) |

Verifier runs (`node CoachingCore/scripts/verify-r7c.mjs --revision 3 --suite`, never `--write`):
- **Before:** 2026-11-02T14:29:59Z, PASS 20/20, suite 866/866;
- **After:** 2026-11-02T15:14:40Z, PASS 20/20, suite 866/866.

## QE-R7C-10: shortened executed answers are still recorder-dependent (BLOCKER)

**Root cause.** `unreadRunWeeks` treats a week that a review closed (`WEEK_EVIDENCE`) as unread only under two conditions:
- every run gate the review recorded is non-executed;
- the evidence reducer now reads at least one run gate of that week as executed (`ADVANCE`, `EARNED` or `REGRESS`).

Runs reported done but shorter than prescribed read as `HOLD`. So, in the RV setting (the weeks' reviews ran while no run was reported):
- the week stays "read";
- its late runs stay in the record that `answeredOnRecord` treats as already read;
- the window guard then returns false ("a run the stored plan read in the window"), and nothing re-plans.

The ceiling re-plan does not catch it either. Every session in the window now has an executed report, so `aboveFactsCeiling` finds nothing credited.

The instrumented isolated copy shows the mechanism on one cell (out/p6-i-cell.SHORT60.txt). GEN week 7; the answer is every gap run done at 60 % of its minutes:
- the reviews of weeks 0–3 recorded `LONG: HOLD, EASY: HOLD`, and the reducer reads them the same now;
- `unread` = [4, 5, 6], while the runs of 2026-11-22 to 11-29 (arrived on day 2 of week 7) are counted as read in the window;
- the result is KEEP, VALID, `QUALITY:34/LONG:60`.

With the same runs at full dose (out/p6-i-cell.EXEC.txt) the reducer reads `ADVANCE`, `unread` = [0..6], and the re-plan fires.

**Reproduction** (`probes/phase6/p6-x5-short-answer.mjs`, with `QE_ROOTS="B2=<archive 1a1c728>;F2=<archive a10cec0>;F3=<worktree>"`; output `out/p6-x5.B2-F2-F3.json`).

The flow, on each runtime:
1. Program GEN or R10K (taper, race week). Gap from week 0 or 2. Weeks reviewed with strength only (RV) or not reviewed (NR). The review closing week b−1 asks `UNREPORTED_TRAINING`.
2. Day 2: the answer is recorded by a carrier that does not apply it:
   - a substitution with pain (handler clinical route), then qualified clearance as modelled by the predecessor and by `test/r7c-phase6`;
   - a plain review with an unrecognised block choice, whose ASK proposal a C2-conformant client does not apply;
   - in race week, R4.
3. Day 3: a plain review, with and without the re-send.

Reference: the same answer as a plain review on day 2.

| Cell (FREEZE-3) | Next decision, day 3 (with or without re-send) | Same answer, delivered directly |
|---|---|---|
| GEN week 7, g=0, RV, every gap run done at 60 %, clinical substitution then clearance | **KEEP, VALID, QUALITY 34 / LONG 60** | EASY 44 / LONG 44, VALID |
| Same at 80 % | **KEEP, VALID, QUALITY 34 / LONG 60** | EASY 45 / LONG 50 |
| GEN week 7, g=2, RV, 60 % | **KEEP, VALID, QUALITY 34 / LONG 60** | QUALITY 34 / LONG 44 |
| R10K taper, g=2, RV, 60 % or 80 %, clinical or choice-ASK carrier | **KEEP, VALID, QUALITY 28 / LONG 45** | EASY 30 / LONG 40 |
| R10K taper, g=2, RV, long runs at 60 % and the rest not done | **KEEP, VALID, QUALITY 28 / LONG 45** | EASY 30 / LONG 40 |

| Failing cells (all stale and VALID) | Cells | Fail | By answer | By carrier |
|---|---|---|---|---|
| R7B2-FREEZE-1 | 280 | **0** | — | — |
| R7C-FREEZE-2 | 280 | 224 | SHORT60 56, SHORT80 56, LONGSHORT_REST_EXEC 56, LONGSHORT_REST_MISS 40, EXEC 16 | CSUB 96, CHOICE 96, R4 32 |
| R7C-FREEZE-3 | 280 | **28** | SHORT60 12, SHORT80 12, LONGSHORT_REST_MISS 4 | CSUB 14, CHOICE 14 (RV only; R4 0) |

The trajectory probe (`p6-x1`, below) finds the same thing on the return-report clinical carrier:
- 54 trajectories show the stale projection VALID at the next decision, 18 per carrier;
- the exposure lasts the rest of the answer week (the day-6 long run at 60 where the direct answer gives 44);
- the week's own review then plans the next week as the direct path does.

**What this violates.**
- Phase 6's own contract (handoff): "Same answer + same record + same clock + same safety state = same plan".
- The predecessor's QE-R7C-07 expectation: once the facts make the window known, the doses ahead follow them, whichever decision carried the reports.
- Request question 3: no stale projection presented as valid.

**Consumer shield.** None for most cells.
- The plan is VALID, so C2 does not apply.
- C3's r4 clause stands until the SSCTR narrows it. It covers "an adverse or mixed answer recorded by a handler clinical route", which could cover the 4 cells where the long runs were shortened and the rest not done. It does not cover:
  - an answer with every run done but shortened;
  - the non-clinical choice-ASK carrier.

**Inaccurate disclosures on FREEZE-3** (handoff):
- R5: "after qualified clearance the first eligible decision applies it with no re-send, whatever the answer reports";
- C3: "applies an executed, mixed or adverse answer the handler clinical route recorded".

Both are false for shortened answers.

**DIRECT_R7C_DELTA: yes.** R7B2-FREEZE-1 is recorder-independent on all 280 cells. FREEZE-2 already failed these cells (they are inside its 224), so Phase 6 did not introduce them. Its fix does not reach them.

**Why the phase's evidence did not see it:**
- the directed tests use the predecessor's grid answers only, all full-dose: EXEC, MIXED, ADVERSE, MISS and PARTIAL;
- the Phase 6 mutants test the trigger on that grid only.

**Smallest fix** (direction only, for a later runtime mission): in a week a review closed, decide "the review read no run" from the record, not from the gate class. For example, the week counts as unread when its review counted no executed run session and the record now holds a completed run report of that week. Add directed tests for:
- shortened answers (60 %, 80 %, long runs shortened with the rest missed) through clinical and non-clinical carriers, RV;
- an all-adverse answer (QE-R7C-14).

Policy, catalog and the clinical routes stay untouched. No product, policy, catalog or clinical decision is needed.

## QE-R7C-11: the reach is wider than stated (MINOR)

I measured the reach outside the answer class:
- `p6-x2-reach.mjs`, FREEZE-2 against FREEZE-3: 45 scenarios, every session reported on its day;
- `p6-x2b-reviewed-reference.mjs`: the same never-reviewed facts against the reviewed path, GEN with a missed easy run each week (out/p6-x2b.F2-vs-F3.txt);
- `p6-x4-late-reporter.mjs`: a habitual late reporter;
- `p6-x6-history.mjs`: history.

- **Timely reviewed paths: untouched.** 15 of 15 scenarios are identical, with no recorded re-plan (P51, GEN, R10K × no deviation, missed Saturday lift, long run at 70 %, missed easy run, loads above plan).
- **Never-reviewed reporters:** once the intake run leaves the 30-day window (week 5 in every probe), each week's first decision re-plans from the facts. This happens even with no deviation, where it only turns placeholder loads into the loads the athlete logged. With deviations it is more conservative than FREEZE-2 and than the reviewed path, for example LONG 60 where the reviewed path gives 70.
- **KEEP-only windows behave as never-reviewed.** The request's "does not fire: a skipped single review after reviewed weeks" holds only when those reviews anchored the week (a MODIFY). After KEEP reviews it fires; the P51 history is that case. The handoff wording ("including on-time reports under KEEP reviews or none") is accurate; the request's bullet is not.
- **Habitual late reporters** (every run reported on day 1 of the next week, after the week's review): from week 5, FREEZE-3 plans more than FREEZE-2, which holds every run gate because no review ever sees a run.
  - It never goes beyond the same facts reported on time: R10K equals the timely path from week 7; GEN stays one quality-ladder step behind it.
  - A Saturday-only late reporter is identical on both freezes (Property B kept).
- **Direction and history:**
  - No recorded re-plan rewrote history (111 checked, below).
  - Same-role raises against the replaced plan: 1, a week-9 long run 60 → 65. It is a conditional week and stays below FREEZE-2 (75) and the reviewed path (70).
  - Role changes: 41, all quality → easy.
- **G01 grid A changes 8 rows, not 4.** The 4 verdict changes (OK_INDEPENDENT → OK_HOLD_LIKE_REVIEWED_MISS) are as stated. 4 more rows change their MISS/UNREP plans with the same verdict; e.g. the RHM taper at g=6 goes from QUALITY 37 half-marathon-specific / LONG 55 to QUALITY 27 threshold / LONG 45.
- **QE-R7C-05 now passes** qe-e4's two batch-independence checks (FREEZE-3 81/81, FREEZE-2 79/81). The handoff still lists it as an open residual.

Classification: a deterministic, conservative semantic change of Property B's scope, not a safety defect. It needs SSCTR acceptance and a corrected disclosure. It is not blocking.

## QE-R7C-12: the recorded re-plan fires again after a direct answer (MINOR)

`p6-x7-direct-refire.mjs` covers 224 cells. Each is a direct answer on day 1 or 2, then plain reviews each later day and the week's review, on FREEZE-2 against FREEZE-3.
- On FREEZE-3 the recorded re-plan fires 130 more times than on FREEZE-2. Each time, more of the answer week's runs have elapsed with no report, so C9's uncredited set grows. 64 cells differ.
- In 20 cells, next week's conditional doses rise above FREEZE-2's:
  - **full-dose answers:** quality 43 → 48 or 38 → 41. The week's review then confirms them.
  - **known stops:** EASY 15/15 → 20/20, the single-run ceiling. In 6 cells this is above what the week's review then plans (15/15/15), and it is VALID from day 4 until that review.
- Uncrediting the elapsed easy runs gives a higher dose than crediting them at 15, because the dose then comes from the ceiling.
- C9's consumer condition does not literally apply: it covers an answer that leaves answer-week sessions elapsed before it, and the 07:00 answer left none.

It is bounded by the ceiling, corrected by the review and never rewrites history. Routing: SSCTR (C9 semantics) and disclosure.

## The disclosed edge, and QE-R7C-13

`p6-x3-edge.mjs` reproduces the edge exactly as disclosed, on both freezes. GEN week 7, the answer LONGONE. Each path is followed by plain reviews on day 5, the week's review and week 8.

| Path | Edge decision | Day 5 on FREEZE-2 | Day 5 on FREEZE-3 |
|---|---|---|---|
| T: the answer inside a day-4 schedule change | ASK `UNREPORTED_TRAINING` about week 8 (w7 runs d1, d3 unreported), REQUIRES_RECONCILIATION, with the ANSWERED proposal (w7 LONG 50; w8 EASY 45/45/LONG 55, conditional) | client applies: LONG 50 VALID; client does not: **LONG 60 VALID (stale, QE-R7C-07 class)** | LONG 50 VALID either way |
| C: recorded by a clinical route, cleared, then the same change | ASK, no proposal (the G01 guard) | **LONG 60 VALID (stale)** | LONG 50 VALID (recorded re-plan) |
| M: direct answer on day 2, then a correction of the long run inside the day-4 change | ASK with the MOVED proposal beside the same week-8 question | LONG 41 VALID | LONG 41 VALID |

On every path the week's review and week 8's first decision ask.

**Classification of the disclosed edge:** an acceptable disclosed residual.
- It is pre-existing and unchanged (FREEZE-2 equals FREEZE-3 at the edge decision).
- It is never valid at the edge (REQUIRES_RECONCILIATION).
- On FREEZE-3 the transition and recorded paths converge at the next decision.

It is `DIRECT_R7C_DELTA` for R7-C (the question and SD-01 are R7-C), not for Phase 6.

**QE-R7C-13 (OBSERVATION):** the same shape arises through the MOVED origin, which the handoff's disclosure does not name. Extend the disclosure, or extend the G01 guard to every factual origin, in a later mission.

## QE-R7C-14: test adequacy of the recorded-answer re-plan (OBSERVATION)

My own mutants, one at a time on an isolated `git archive` copy (`p6-m-mutants.mjs`, out/p6-m-mutants.json). Tests: the five R7-C files and the two pinned files, 144 tests, baseline 144/144. Bytes restored and checked by SHA-256.

| Mutant | Result |
|---|---|
| J-M6: C9 dropped for the recorded re-plan | killed (2 tests) |
| J-M7: projected weeks never unread | killed (7) |
| J-M1: the window guard removed | survives, **equivalent** (it repeats `unknownRunWindow`'s first test on the same runs) |
| J-M4: the open-gap exit removed | survives, equivalent in effect (the G01 guard re-decides the same ASK) |
| J-M8: the recorded re-plan before the ceiling re-plan | survives, equivalent in the suite's cells. The recorded re-plan never qualifies where the ceiling re-plan fires (witness: known stops in RV and NR give CEILING either way), so the MISS test's ordering assertion cannot fail there. |
| J-M2: REGRESS not counted as executed | **survives, not equivalent.** Witness (`p6-m-witness.mjs`): every gap run done with an adverse response, RV, clinical, cleared. FREEZE-3 gives the direct answer's EASY 25 / LONG 35; the mutant keeps QUALITY 34 / LONG 60 VALID. |
| J-M3: return-report exclusion removed; J-M5: return-replaced start ignored | survive, not witnessed by any test |

The committed P6-M1..M7 record (7/7 killed) is consistent with this. Those mutants change the trigger as a whole, and my survivors are its guards.

## The mandatory questions

1. **Is QE-R7C-07 closed for EXEC, MIXED and ADVERSE answers?** For those answers at full dose, yes:
   - rc-p4: 0/160;
   - `p6-x1`: 0 failing trajectories for EXEC, MIXED, ADVERSE, EASYONLY and PARTIAL over 1,536 trajectories. That covers four carriers (including a clinical return report and a C2-conformant choice ASK), carrier days 1, 2 and 4, and continuation to week b+2.

   The class is not closed: shortened executed answers (QE-R7C-10). So the answer is **partially**.
2. **Recorder independence 0/160?** Yes, rerun: FREEZE-3 0/160, FREEZE-2 72/160 (out/rc-p4.F2-vs-F3.json, sha256 `15057ad7…`).
3. **Plan validity never presents a stale projection as valid?** **No.** The QE-R7C-10 cells are KEEP and VALID on the stale projection: a quality session the answer rules out, and a long run 16 minutes above what the facts allow. QE-R7C-12 is a separate, minor case: a next-week conditional projection above the week's own review, within the ceiling.
4. **Clinical carrier after clearance without re-send; nothing prescribed while the route stands?**
   - While the route stands: yes. 960/960 checks, substitution and return report: CLINICAL_HUMAN_REQUIRED, no proposal, never valid.
   - After clearance: yes for every full-dose answer and for known stops (`p6-x1`); **no** for shortened answers in RV weeks (QE-R7C-10).
5. **No past history rewritten?** Yes. `p6-x6-history.mjs` checked 111 recorded re-plans across answer grids and the reach. In each:
   - earlier weeks' sessions, start traces and start authorities are byte-identical;
   - no elapsed session changed;
   - the decision log is append-only;
   - HistoricalState is identical before and after.

   0 violations, 0 UNSUPPORTED.
6. **Does the carrier's identity never alter the factual semantics?** Not yet: it does for shortened answers (QE-R7C-10).
   - **The reach:** it is the necessary consequence of carrier independence on state, under three premises:
     - no new schema;
     - qualified clearance modelled as dropping the clinical reference state;
     - a record without a runtime arrival stamp (`reportedAt` is optional and client-supplied).

     Under those premises the cleared clinical carrier and the P51 history hold the same program and record. Any carrier-independent rule must then treat them alike. It is not necessary in absolute terms: a persistent "question stood" marker, or a mandatory arrival time, could tell them apart. Its actual scope is wider than the request says (QE-R7C-11, QE-R7C-12).
   - **The fixture pins:** the classification is right.
     - On FREEZE-3 with the FREEZE-2 fixtures, the 5 tests fail only on premise assertions: "the projection is ahead", or "the load lifted is 24", which the projected row would have prescribed. The lines are `r7asc` 337 and `r7asm` 63, 113, 189 and 237. No invariant assertion fails (out/pin-oldfixture-on-F3.txt: 72/77).
     - The pinned fixtures pass on FREEZE-2 bytes (77/77, out/pin-newfixture-on-F2.txt).
     - The diff changes only fixture lines and comments; no assertion changed.
     - The new behaviour of the old P51 history is pinned by the `reach` test.
     - So: EXPECTED_SEMANTIC_UPDATE of the fixture only, provided the SSCTR accepts the reach.
7. **QE-R7C-08 and QE-R7C-09?** Still correctly classified, neither hidden nor absorbed:
   - rc-p2: 540/540 decisions identical between FREEZE-2 and FREEZE-3, with the same 2 ceiling decisions;
   - rc-p5: the same premise hashes (`01329b2b…`, which still names the uncredited session);
   - both are disclosed in the handoff.

   QE-R7C-05 is now passing (QE-R7C-11).

## Re-run and not re-run

**Re-run:**
- the verifier, before and after;
- rc-p4 on FREEZE-2 and FREEZE-3;
- rc-p2, rc-p5 and rc-p1 on FREEZE-2 and FREEZE-3: 540/540 identical, identical, 60/60 identical;
- qe-e1 to qe-e4 on FREEZE-3 against their recheck outputs: e1, e2, e2b and e3 identical; e3b same doses, with an extra recorded re-plan; e4 81/81, where it was 79/81;
- phase4-adversarial-g01, phase5-adversarial-sd, phase4-verify-sd01 and phase3-adversarial-g02: byte-identical to the committed R7C-P6 outputs, and those equal the R7C-P5 outputs for SD, SD-01 and G02;
- phase6-differential: identical apart from the head field, 120/120;
- the two pinned test files on FREEZE-3 with the old fixtures, and on FREEZE-2 with the new ones;
- new probes p6-x1 to p6-x7, the instrumented cell, the judge mutants and the witness.

All outputs are in `probes/phase6/out/`.

**Not re-run:**
- phase6-run-evidence, phase6-mutation and the committed P6-M1..M7 (I read the record and ran my own mutants instead);
- phase3-holdout, conformance-r7b/b1/b2, neighbors, regress-r7b2 and the b2-copy clinical probes;
- `npm run verify`, any other `verify-r*` script, and anything with `--write`.

The full suite ran only inside the verifier (866/866, twice).

**Caveats:**
- **Clearance:** modelled as the predecessor and `test/r7c-phase6` do: the client continues with the carried record and no clinical reference state.
- **The choice-ASK carrier:** assumes a client that, per C2, does not apply a REQUIRES_RECONCILIATION result's proposal. QE-R7C-10 stands on the clinical carriers alone.
- **Isolated copies:** revisions were extracted with `git archive` (plus the audit records the runtime reads, and `node_modules` copied) into `C:\Users\carva\AppData\Local\Temp\qe-r7c-p6-judge\`, outside the repository and outside the authoring scratchpad. The mutants and the instrumentation touched only those copies.
- **Mistakes this review made in its own probes, all corrected and rerun:**
  - p6-x1's first pass compared statuses too strictly;
  - p6-x4's first pass delivered late runs before day 0's report;
  - the mutant runner's first pass misread the test summary.
- **Repository writes:** only this file, its JSON and `probes/phase6/`. No commits, no git state change; HEAD `344ea61` at start and end.

## Routing

- **Closure:** QE-R7C-10 is a blocker and `DIRECT_R7C_DELTA`, and Phase 6 has no correction loop, so R7-C closes `CLOSED_NOT_READY`.
- **Next runtime mission** (its own Founder authorization):
  - QE-R7C-10, as the smallest fix describes;
  - the directed tests named under QE-R7C-14;
  - QE-R7C-13's disclosure or guard.
- **SSCTR:**
  - the reach and Property B's scope (QE-R7C-11);
  - C9 under the direct path's repeated re-plan (QE-R7C-12);
  - the r4 clause of C3, which must not be narrowed while QE-R7C-10 stands;
  - the stale disclosures: R5, C3, QE-R7C-05 and the G01 row count.
- **No escalation needed:** no product, policy, catalog or clinical decision was needed to judge.

R7C_ENGINEERING_GATE = NOT_READY
