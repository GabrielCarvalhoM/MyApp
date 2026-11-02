# R7-C Phase 7: Engineering review of R7C-FREEZE-4 (QE-R7C-10)

Record `R7C-ENGINEERING-PHASE7-REVIEW-1`, dated 2026-11-02. The structured record is [PHASE7_REVIEW_R7C.json](PHASE7_REVIEW_R7C.json). The request is [PHASE7_REVIEW_REQUEST.md](PHASE7_REVIEW_REQUEST.md).

- **Judge:** `quality-reliability-engineer`, a fresh instance; model `claude-opus-5-5`, effort xhigh.
- **Independence:** I did not author the runtime, the Phase 7 fix, its tests, its evidence, its harnesses or the earlier reviews.
  - I did not open the authoring session's scratchpad.
  - My extracted revisions and mutation copy live in `C:\Users\carva\AppData\Local\Temp\qe-r7c-p7-judge\`, outside the repository.
  - The SSCTR narrow recheck wrote `reviews/ssctr/SSCTR_PHASE7_RECHECK_R7C.*` and `reviews/ssctr/probes/phase7/` during this review. I did not open them.
  - I did run two committed SSCTR probes from earlier phases (`reviews/ssctr/probes/phase6/p6-mixed-scope.mjs`, `reviews/ssctr/probes/cc/cc2-answer-after-refusal.mjs`), writing their output under my own folder.

## Verdict

**READY_WITH_CONDITIONS.** QE-R7C-10 is closed on R7C-FREEZE-4. Shortened answers are recorder-independent on every grid I reran and on four sibling shapes the phase did not test. The new metadata was necessary and meets the Founder's conditions. No new stale VALID appeared, and no blocker was found, so R7-C does not close `CLOSED_NOT_READY` on this gate.

The conditions are disclosure corrections and routed follow-ups, none blocking:
- **QE-R7C-15 (MINOR):** the backward behaviour is wider than disclosed. On a record without first-recorded clocks, the R7C-FREEZE-3 reading is not "sound for full-dose and adverse answers". When a week of the window was closed by a decision that records no gates (a nonclinical substitution), full-dose and adverse answers also stay stale and VALID.
- **QE-R7C-16 (MINOR):** a new behaviour the phase did not disclose. Phase 7 extends the reach and the QE-R7C-12 re-plan to habitual late reporters whose runs are shortened. With a mid-week decision, later weeks' conditional projections can rise above the week's own review (up to +5 min, VALID until that review). Executed weeks are unchanged.
- **QE-R7C-17 (OBSERVATION):** three rules of the new clock are not pinned by any test, although the runtime currently follows them.
- **QE-R7C-18 (OBSERVATION, not R7-C):** a correction of an on-time report, recorded by a clinical route, waits for the week's review. This is identical on R7B2-FREEZE-1.

What holds on FREEZE-4 (all rerun by me):

| Check | FREEZE-4 | FREEZE-3 | R7B2-FREEZE-1 |
|---|---|---|---|
| Shortened grid `p6-x5` (280 cells) | **0** | 28 | 0 |
| Recorder independence `rc-p4` (160) | **0** | 0 | — |
| Trajectories `p6-x1` (1,536): stale VALID | **0** (36 known conservative MISS/LONGONE, as on FREEZE-3) | 54 | — |
| SSCTR P6-F01 grid (768): carrier ≠ direct | **0** | 16 (SSCTR) | — |
| SSCTR CC2 (1,200): a carrier cell above the direct answer | **0** (every valid cell equals the direct answer) | 18 (SSCTR) | — |
| **New:** carriers CSUB, CRET, CHOICE × carrier days 1, 4, 5 × six answer shapes (648 trajectories, 3 steps) | **0** | 126 | — |
| **New:** gap week closed by a nonclinical substitution or a schedule change (224 cells) | **0** | 128 (EXEC and ADVERSE included) | 0 |
| **New:** re-sends with new ids and `reportedAt`, second-source duplicates, split answers, corrections (R1–R6, 108 cells) | **0** | 18 | — |
| Clinical: nothing prescribed while the route stands | 432/432 and 960/960 | — | — |
| History rewritten (`p6-x6`, 111 re-plans) | **0** | — | — |

| Id | Severity | DIRECT_R7C_DELTA | One line |
|---|---|---|---|
| QE-R7C-15 | MINOR | yes (Phase 7 disclosure; the reading kept is R7-C Phase 6's) | On a record without clocks the FREEZE-3 reading also fails full-dose and adverse answers when a gap week was closed by a decision that records no gates (128/224 stale VALID, EXEC 8, ADVERSE 20). The handoff, the freeze record and the source comment call that reading "sound for full-dose and adverse answers". |
| QE-R7C-16 | MINOR | yes (Phase 7) | Habitual late reporters with shortened runs now trigger the recorded re-plan mid-week. That gives 19 re-plans where FREEZE-3 keeps, and 16 same-role raises of later conditional weeks (+3 to +5 min), 14 above the week's own review, VALID until it. Executed weeks are identical to FREEZE-3, never above the timely path. The phase's differential has no mid-week decision and reports these reporters "identical". |
| QE-R7C-17 | OBSERVATION | yes (Phase 7) | Three judge mutants of the clock's rules survive the suite: a clockless row merged keeps a clock; a re-send that sorts first keeps its own later clock; `reportedAt` used as the stamp. The runtime does each correctly (p7-x6 10/10). |
| QE-R7C-18 | OBSERVATION | **no** (identical on R7B2-FREEZE-1) | A correction of an on-time report recorded by a clinical route (re-sent or not) is applied only at the week's review. This is R7-A's per-decision rule for corrections, not the QE-R7C-10 class. |

| Earlier finding | Now |
|---|---|
| QE-R7C-10 (BLOCKER) | **Closed** on R7C-FREEZE-4 (details below). |
| QE-R7C-07 (closed at full dose on FREEZE-3) | **Still closed, and more completely.** FREEZE-3 also failed full-dose and adverse answers when a gap week was closed by a gate-less decision (8 EXEC, 20 ADVERSE of 224), and all-adverse answers in GEN week 7 (9 trajectories). FREEZE-4 fails none of them. |
| QE-R7C-08 (MINOR) | Unchanged: `rc-p2` 540/540 decisions identical to FREEZE-3, the same 2 ceiling decisions. |
| QE-R7C-09 (OBSERVATION) | Unchanged: `rc-p5` gives the same premise hash (`01329b2b…`), still naming the uncredited session. |
| QE-R7C-11 (MINOR, reach) | Unchanged on its measured scope: `p6-x2` 45/45 scenarios identical, the same 72 recorded re-plans. **Extended** by Phase 7 to shortened habitual late reporters (QE-R7C-16). |
| QE-R7C-12 (MINOR) | Same class after a direct shortened answer (`p6-x7`): 6 extra re-plans, 2 cells changed, both more conservative, no raise above FREEZE-3. **Extended** to late reporters (QE-R7C-16). |
| QE-R7C-13 (OBSERVATION) | The edge decision is unchanged on every path (T, C, D, M). On path M only, the next day's decision now makes a QE-R7C-12-class re-plan: next week's long run goes 55 → 46, which is more conservative and equals the single-run ceiling. The classification stands. |
| QE-R7C-14 (OBSERVATION) | **Resolved for Phase 7's purpose:** all-adverse is witnessed (directed tests 10 and visibility 2; F7-M3 is killed by its own witness and by no other test). |

## Freeze identity and verifier

| Field | Value |
|---|---|
| Record | `CoachingCore/r7/c/RUNTIME_FREEZE_R7C_4.json`, sha256 `bf99c01bf791b832725bb0f4a83cab270378c1afc882b402b76916000eca2fc2` (recomputed) |
| Commit of the bound bytes | `a9654c8ea175611fbaae805ac6b0e8b928620dff` (worktree HEAD `3fe55ae`, unchanged from start to end) |
| Source / manifest digests | `16d0633e…69c1` / `61937f87…f6b8` (verifier `source-digest`, `manifest-digest` PASS) |
| Size | 197 files, 884 tests |
| Delta against R7C-FREEZE-3 (`08c6db3`) | `src/r6-provenance.mjs` (+19/−4), `src/r6-adaptation.mjs` (+48/−15), new `test/r7c-phase7.test.mjs` (18 tests). No other test or fixture changed (`git diff --stat`). The worktree's `src`, `test`, `r6`, `r7/b/fixtures`, `r7/b0` and `scripts` equal a `git archive` of `a9654c8` (`diff -rq`). |

Verifier runs (`node CoachingCore/scripts/verify-r7c.mjs --revision 4 --suite`, never `--write`):
- **Before:** 2026-11-02T17:37:39Z, PASS 27/27, suite 884/884 (`probes/phase7/out/verify-before.json`).
- **After:** 2026-11-02T18:16:11Z, PASS 27/27, suite 884/884 (`probes/phase7/out/verify-after.json`).

## QE-R7C-10: closed

**The mechanism, read on the bytes.** `unreadRunReports` replaces the gate-class test with one test per report. A run report of a week that a review closed (`WEEK_EVIDENCE`) is unread when its `provenance.firstRecordedAt` is after that review's `evidenceThrough`. A week the plan projected stays unread as a whole. Any other start stays read. `answeredOnRecord` then filters the record by report identity rather than by week. Its window guard, `runGapInForce` order, C9 and the G01 guard are unchanged. The `read.length===record.length` exit was dropped as redundant: `unread` is a subset of the record, so a non-empty `unread` already implies it.

**Evidence of closure (all rerun on the frozen bytes):**
- `p6-x5` (the predecessor's grid, 280 cells): FREEZE-4 0, FREEZE-3 28, R7B2-FREEZE-1 0. The FREEZE-4 cells are byte-identical to the authors' `recorder-independence-shortened` output.
- `p6-x1` (1,536 trajectories): 0 stale VALID. 36 failing trajectories (MISS 30, LONGONE 6), the same conservative set disclosed on FREEZE-3, never valid at the week's review. My output is byte-identical to the authors' (`b9118a82…`).
- `p7-x4` (new): six answer shapes (SHORT60, SHORT80, SHORT_ADVERSE, LONGSHORT_REST_MISS, MIX_SHORT_MISS, ADVERSE), through carriers CSUB, CRET (clinical return report) and CHOICE (a C2-conformant unapplied ASK), on carrier days 1, 4 and 5. Programs GEN weeks 7 and 9 and the R10K taper, gap from week 0 or 2, RV and NR. Three steps: next day, the week's review, next week's day 1.
  - FREEZE-4: 0 of 648 trajectories fail; 432/432 clinical-standing checks hold.
  - FREEZE-3: 126 fail. That includes 9 all-adverse trajectories, e.g. GEN week 7, g=2, RV: LONG 60 VALID where the facts give LONG 40.
- `p7-x3` (new): re-sends with new event ids and a later `reportedAt`, a carrier whose reports carry `reportedAt`, a second-source duplicate with a WATCH activity, a split answer (long runs by carrier, the rest directly), a correction of a direct answer recorded by a carrier, and a carrier answer corrected directly.
  - FREEZE-4: 0 of 108 cells fail (GEN week 7, R10K taper and race week with the R4 carrier).
  - FREEZE-3: 18 fail.
- `p7-x2` (new): a week of the gap closed at day 6 by a nonclinical exercise substitution (its decision records no gates) or a schedule change, instead of the weekly review.
  - FREEZE-4: 0 of 224.
  - FREEZE-3: 128, including full-dose EXEC (8) and ADVERSE (20), because its gate-class rule never unread a week whose closing decision recorded no gates.
  - R7B2-FREEZE-1: 0 (it asks no question there).

  The per-report clock covers this case with no special branch.

**Carrier independence is factual, not carrier-specific.** `unreadRunReports` reads only the record (the report's clock against the closing decision's clock) and the start provenance. No carrier, kind or reference state enters it, and the trigger and its order are unchanged. The F7-M5 and F7-M6 mutants (suppressing shortened or mixed reconciliation) are each killed by their own witness.

## The metadata decision (question 3)

**Was new metadata necessary? Yes.** I rebuilt the Founder's A/B on the frozen bytes (`p7-x0`). GEN, RV weeks, week j ∈ {2, 3}:
- **A:** the review of week j had no run report, and the very same observation objects arrived on day 2 of week 7 through a clinical substitution;
- **B:** the same observations were delivered on time with week j's review.

Results:
- The completed-work record is byte-identical between A and B apart from `provenance.firstRecordedAt`. That holds on FREEZE-3, which has no stamp, and on FREEZE-4 once the stamp is removed.
- Week j's closing decision has the same clock, action, gates (`LONG: HOLD`, `EASY: HOLD`) and start (`WEEK_EVIDENCE`, same `evidenceThrough`).
- The decision records differ only in the free text `reasons[].why`: "(NOT_REPORTED)" / "(MISSED,MISSED)" against "(PARTIAL)" / "(PARTIAL,PARTIAL)".
- The decision log holds only `eventId, asOf, action, fromWeek, gates, reasons, horizonsConsidered`. An ASK is never appended to it, and the reference state that carries a pending question is dropped at clinical clearance.

So no structured field records which reports a review had.

The two existing structures that could stand in are both inadequate:
- **The gate class.** It is wrong for shortened runs (QE-R7C-10) and, as `p7-x2` shows, blind to weeks closed by decisions that record no gates.
- **`reportedAt`.** It is optional and client-supplied.

A per-report arrival stamp is the direct encoding of the invariant. The alternatives I considered (a structured per-session status on the decision record, a "question stood" marker) are also new metadata and cover less.

**The Founder's conditions:**

| Condition | Judgment | Basis |
|---|---|---|
| No dose | Met | One read site: `r6-adaptation.mjs:1319`, inside `unreadRunReports`. It only decides whether a factual re-plan may fire; the doses come from the facts. Grep shows no other reader of `firstRecordedAt` in `src` apart from the merge helpers in `r6-provenance.mjs`. |
| No authority | Met | It is not part of any start authority, gate, policy or reference state. |
| Factual visibility only | Met | HistoricalState is identical with and without the clocks (directed test 14). The learning model keeps none (F7-M11; my J7 run). The evidence reducer does not read it. |
| Deterministic | Met | The stamp is the decision's own normalized clock. Merges take the earliest, or none if any part is clockless. `p7-x6`: 10/10 rules hold, including conflicts, a correction resolving a conflict, a superseded re-send, two sources in one decision, input-order permutations and a re-send that sorts before its carried row. Same-clock decisions are resolved deterministically as "read" (below). |
| Explicit backward behaviour | Met in substance, **disclosure inaccurate (QE-R7C-15)** | The FREEZE-3 reading stands for clockless rows, and the backward-behaviour test pins it (J7-M2 and J7-M3 are killed by it). Its stated scope is too narrow. |

**Edge cases of the clock:**
- **Same-clock decisions.** The runtime accepts a decision at the same clock as the previous one, and the tie reads as "read".
  - In `p7-x1` (GEN and R10K, weeks closed at j = 2 or 3, four answers), a carrier at exactly the closing clock and one a second later give identical results in 16/16 cells on every runtime.
  - Both equal the same reports delivered by a non-gating plain review the next morning (16/16), on R7B2-FREEZE-1, FREEZE-3 and FREEZE-4 alike.
  - A `WEEK_EVIDENCE` close implies a known window at its clock (otherwise the decision would have asked). So the tie cannot reach the unknown-window trigger in any shape I could build.
  - Not a finding. A later mission could make the tie explicit (a decision ordinal).
- **Trust.** A clock supplied in an observation is replaced. A clock in the carried `actualLedger` is trusted, as every carried fact is (`p7-x6` check 10).
  - A client that builds `actualLedger` rows itself, instead of passing observations, produces clockless rows. Those fall back to the FREEZE-3 reading, which carries QE-R7C-15's gaps.
  - Consumers must carry the runtime's own record (routing, below).
- **Corrections, merges and conflicts** keep the earliest clock of the execution, which is consistent with "a review that had any report of that execution read it". A late correction of an on-time report is not unread. That is consistent with the invariant, but see QE-R7C-18.

## QE-R7C-15: the backward behaviour is wider than disclosed (MINOR)

**What is stated.**
- Freeze record `phase7.metadata.backwardBehaviour` and handoff "Backward behaviour": "the R7C-FREEZE-3 reading stands (`legacyUnreadWeeks`, the gate-class rule: sound for full-dose and adverse answers; a shortened late answer on such a record reads as on R7C-FREEZE-3)".
- Handoff R5: only "a shortened answer such a route recorded keeps R7C-FREEZE-3's reading".
- Source comment: "sound but incomplete: a run done shorter than prescribed reads HOLD either way".

**What I measured.**
- `legacyUnreadWeeks` takes the recorded gates from the decision that closed the week (`decisions.get(a.eventId)?.gates`).
- A nonclinical exercise substitution at the end of a week closes it (`WEEK_EVIDENCE`, action `SUBSTITUTE_FOR_REASON`) with `gates: null`, so the legacy rule never reads that week as unread, whatever the answer.
- `p7-x2l` repeats `p7-x2` on FREEZE-4 with every first-recorded clock removed before the next decision, as the backward-behaviour test does: **128 of 224 cells stale and VALID**. That is the same set as on FREEZE-3: SHORT60 28, SHORT80 28, SHORT_ADVERSE 28, ADVERSE 20, LONGSHORT_REST_MISS 12, EXEC 8, MIX_SHORT_MISS 4; by closer SUB 84, SCH 44.

Examples (clockless record, clinical substitution on day 2, cleared, plain day 3):

| Cell | Next decision | Same answer, delivered directly |
|---|---|---|
| GEN week 7, g=0, week 3 closed by a substitution, every gap run adverse | KEEP, VALID, QUALITY 34 / LONG 60 | EASY 25 / LONG 35 |
| GEN week 7, g=2, same, adverse | KEEP, VALID, QUALITY 34 / LONG 60 | QUALITY 34 / LONG 40 |
| R10K taper, g=0, week 6 closed by a substitution, adverse | KEEP, VALID, QUALITY 25 / LONG 40, then a race touch | EASY 15 throughout to the race |

With clocks (records written by FREEZE-4) every one of these cells converges (0/224).

**Impact.** Only records written before R7C-FREEZE-4, or rows a client injects without passing them as observations. The runtime is a shadow reference (`V1_COACHING_AUTHORITY_READY = NO`), so no consumer acts on such a record today.

**Classification.** A disclosure inaccuracy, not a defect of the fix. The behaviour chosen (no migration, no invented arrivals) stands, but its disclosed scope must be widened.

**DIRECT_R7C_DELTA: yes.** It is the Phase 7 disclosure, and the reading it keeps is R7-C Phase 6's.

**Historical note.** The same cells show that on FREEZE-3 QE-R7C-07 was not closed at full dose for windows with a gate-less closing decision. The Phase 6 review did not test that shape. FREEZE-4 closes it for clocked records.

**Reproduction:** `probes/phase7/p7-x2-other-closers.mjs` and `p7-x2l-other-closers-legacy.mjs`, with `QE_ROOTS="B2=<archive 1a1c728>;F3=<archive 08c6db3>;F4=<worktree>"`.

## QE-R7C-16: the reach and the QE-R7C-12 re-plan now cover shortened habitual late reporters (MINOR)

**The case.** A habitual late reporter: strength reported on its day, each week reviewed on day 6, the week's runs reported on day 1 of the next week. I used the predecessor's `p6-x4` timeline with runs at 100 %, 80 % or 60 % of their minutes (`p7-x5`, `p7-x5b`).
- On FREEZE-3 a shortened late run reads HOLD either way, so it counts as read.
- On FREEZE-4 it is unread (first recorded after its week's review), as the Founder's invariant requires.

**At full dose** FREEZE-4 equals FREEZE-3 on every path (LATE, LATE_SAT).

**At 60 % and 80 %:**
- the weeks' run doses before each review are identical to FREEZE-3 and never above the timely path;
- but on the day-4 strength report, FREEZE-4 makes **19 recorded re-plans where FREEZE-3 keeps** (GEN and R10K, 4 paths), all VALID;
- they re-plan the following weeks' conditional projections, mostly downward (QUALITY → EASY; R10K taper EASY 30 → 15);
- they also make **16 same-role raises**: EASY 41 → 45 (GEN 60 %, weeks 6–9), EASY 46 → 50, EASY 30 → 35 (GEN week 11), LONG 62 → 65 and 67 → 70, LONG 40 → 45 (R10K 80 %);
- **14 of those are above what the week's own review then plans** for the same session. They are above FREEZE-3 at that moment and VALID from day 4 until that review.

**Mechanism.** It is QE-R7C-12's: C9 leaves the week's elapsed unreported runs uncredited, and the dose then comes from the single-run ceiling. It is now reached through QE-R7C-11's reach for a reporter class FREEZE-3 did not reach.

**Why the phase did not see it.** The authors' `phase7-differential` late-reporter timeline makes only two decisions per week: the day-1 delivery and the day-6 review. Its `lateReporterShort` family is "identical" there, and the handoff's "128/128 identical, the habitual late reporters (full dose and shortened) included" is accurate for that timeline only.

**Classification.** Same class as QE-R7C-12, conservative in executed doses and never an executed week above the timely facts. It is a necessary consequence of reading late reports as unread. Not blocking.

**Needs:**
- SSCTR: acceptance under C9/C11 presentation (the following weeks' plan is provisional until the week's review), or routing to the engine with QE-R7C-12;
- a corrected disclosure.

**DIRECT_R7C_DELTA: yes (Phase 7).**

**Reproduction:** `probes/phase7/p7-x5-late-short-reporter.mjs` and `p7-x5b-late-short-replans.mjs`, with `QE_ROOTS="F3=<archive 08c6db3>;F4=<worktree>"`.

## QE-R7C-17: three rules of the clock are not pinned (OBSERVATION)

I ran my own mutants on an isolated copy (`p7-m-mutants.mjs`, out/p7-m-mutants.json). Directed set: the six R7-C files, the two pinned state-model files and `r7b2-clinical-precedence`, 175 tests, baseline 175/175. Bytes were restored and checked by SHA-256 after each mutant.

| Mutant | Result |
|---|---|
| J7-M1 tie read as unread (`>=`) | killed (9 tests, incl. visibility 1, 2, 4) |
| J7-M2 clockless always read / J7-M3 clockless always unread | killed (backward behaviour) |
| J7-M5 EXACT_REPLAY takes the re-send's later clock | killed (record, visibility 3) |
| J7-M8 per week instead of per report | killed (visibility 4) |
| J7-M9 carried rows re-stamped | killed (12) |
| J7-M10 projected weeks no longer unread | killed (21) |
| J7-M11 `evidenceThrough` ignored | killed (17) |
| **J7-M4** a clockless row merged with a new report keeps the earliest known clock | **survives** (no test merges a clockless row) |
| **J7-M6** EXACT_REPLAY never merges clocks | **survives**; not equivalent: `p7-x6` check 9 (a re-send that sorts before its carried row) distinguishes it |
| **J7-M7** the report's own `reportedAt` used as the stamp | **survives** (no test supplies `reportedAt`; it would make the clock input-derived) |

The runtime follows each rule correctly today (`p7-x6` 10/10). Add directed tests in a later mission. **DIRECT_R7C_DELTA: yes (Phase 7).**

## QE-R7C-18: a correction recorded by a clinical route waits for the week's review (OBSERVATION, not R7-C)

The case (`p7-x3` R7, `p7-x3b`): a timely GEN athlete; on day 2 of week 6, a correction of week 5's on-time long run (to 60 %), recorded by a clinical substitution and cleared.
- The next decision keeps the plan built from the uncorrected run: QUALITY 43 / LONG 75, next week EASY 55, where the correction delivered directly plans QUALITY 48 and EASY 50.
- Re-sending the correction after clearance does not change that.
- The week's review then converges.
- It is identical on R7B2-FREEZE-1, FREEZE-3 and FREEZE-4.

**Mechanism.** `viewMovedBy` re-plans only from the corrections the deciding review itself carries (R7-A). Re-sent duplicates do not move the canonical view.

**Classification.** Outside QE-R7C-10, which concerns reports a review never had. Not absorbed. Routed to a later runtime mission, and to the SSCTR for C3's wording, which speaks of answers only. **DIRECT_R7C_DELTA: no.**

## Mutation and witness adequacy (Phase 7 mutants)

I re-applied the authors' F7-M1..M11 edits verbatim to my own isolated copy, with my own runner. Every failing test was kept, and each witness was rerun alone. Each witness pattern selects exactly one test on the unmutated file.

| Mutant | Directed set | Its own witness alone | Other tests killing it |
|---|---|---|---|
| F7-M1 gate class for every report | killed (11) | shortened (5): killed | visibility 3, 4; shortened 6, 8, 9; all-adverse; P6-F01; 12, 15, 16 |
| **F7-M2** HOLD never read | killed (3) | **visibility (1): killed** | visibility (4), backward behaviour (both are R7-C Phase 7 visibility tests, not unrelated) |
| **F7-M3** REGRESS never read | killed (1) | **visibility (2): killed** | **none**: it dies by its own witness only |
| F7-M4 observation time as arrival | killed (18) | visibility (3): killed | Phase 6 tests and most Phase 7 tests |
| F7-M5 shortened clinical answer never reconciled | killed (11) | (15): killed | — |
| F7-M6 mixed carrier answer never reconciled | killed (6) | P6-F01: killed | — |
| F7-M7 REGRESS dropped from the legacy reading | killed (1) | backward behaviour: killed | none |
| F7-M8..M11 the clock's rules | killed (1 each) | record: killed | none |

**Conclusion.** Each Phase 7 mutant dies by its own witness. F7-M2 and F7-M3 do not die only by unrelated tests. The predecessor's J-M2 (REGRESS not counted) now lives only in the legacy reading, as F7-M7, and is killed. I did not rerun the inherited Phase 3–6 sets; I read them in the authors' record (17/18 + witness, 8/8, 6/6, 9/9, 7/7).

## The mandatory questions

1. **Is QE-R7C-10 closed?** **Yes.** FREEZE-4 fails none of:
   - `p6-x5` (0/280; FREEZE-3 28);
   - `p6-x1` (0 stale VALID of 1,536);
   - my 648 trajectories over new carriers and days;
   - my 224 cells with gate-less closers;
   - my 108 re-send, duplicate, split and correction cells.

   Clinical standing holds throughout.
2. **Are shortened answers recorder-independent?** **Yes**, on every carrier (CSUB, CRET, CHOICE, R4), carrier day (1, 2, 4, 5) and next decision (next day, re-send, the week's review, next week) I ran, and on R1–R6 re-send shapes. The one carrier-dependent shape I found (QE-R7C-18) is a correction of a read report, identical on R7B2-FREEZE-1.
3. **Is visibility derived from the record and time, not the gate? Is the metadata necessary, and does it meet the conditions?** **Yes, yes, and yes with a disclosure correction.**
   - Visibility is the report's first-recorded clock against the closing decision's clock; no gate is read.
   - It is necessary: A and B are identical in every structured field (`p7-x0`).
   - It meets no dose, no authority, factual visibility only and determinism.
   - The backward behaviour is explicit and pinned, but disclosed too narrowly (QE-R7C-15).
4. **Is all-adverse covered (QE-R7C-14's witness)?** **Yes.**
   - Directed tests: (10) all-adverse, and visibility (2), timely REGRESS read.
   - F7-M3 is killed by its own witness alone.
   - On FREEZE-4: ADVERSE 0 in my trajectories and in the gate-less closer cells. FREEZE-3 failed 9 and 20 there.
5. **Does P6-F01 close by the same fix, without a special case?** **Yes.**
   - The SSCTR's grid: 768 cells, 0 where the carrier differs from the direct answer; byte-identical to the authors' output.
   - My MIX_SHORT_MISS and LONGSHORT_REST_MISS cells: 0 on FREEZE-4.
   - `unreadRunReports` has no mixed branch, and F7-M6 (a mixed-specific suppression) is killed by its witness.
6. **Is QE-R7C-07 still closed?** **Yes.** `rc-p4` 0/160; `p6-x1` 0 failures for EXEC, MIXED, ADVERSE, EASYONLY and PARTIAL. It is now also closed for gate-less closers, which FREEZE-3 had not closed.
7. **Has no new stale VALID appeared?** **Yes, none.** QE-R7C-16 is a re-plan from the facts, VALID above the week's review in later conditional weeks: QE-R7C-12's class, not a stale projection. QE-R7C-18 is pre-existing and identical on R7B2-FREEZE-1.
8. **Are QE-R7C-08, -09, -11, -12 and -13 still correctly classified, and not absorbed?** **Yes.**
   - **08:** 540/540 identical.
   - **09:** same premise.
   - **11:** 45/45 scenarios identical, 72 re-plans.
   - **12:** the direct-shortened refire is the same class (6 extra re-plans, 2 cells changed, conservative, none above FREEZE-3).
   - **13:** the edge decision is unchanged; path M's next day gains a conservative QE-R7C-12-class re-plan.
   - Phase 7 widened the scope of 11 and 12 to shortened late reporters (QE-R7C-16); it closes neither.
   - CC-F01, C8, C5, the R4 HOLD, C10, D1 and G03 are untouched. The handler re-compositions, SD, SD-01, G01 and G02 outputs are byte-identical to the committed Phase 7 outputs.

## Re-run and not re-run

**Re-run (outputs in `probes/phase7/out/`):**
- the verifier, before and after;
- the predecessor's `p6-x5` (B2, F3, F4), `p6-x1` (F4), `p6-x7`, `p6-x4`, `p6-x3` and `p6-x2` (F3 vs F4), and `p6-x6` (F4);
- `rc-p4`, `rc-p2` and `rc-p5` (F3 vs F4);
- the SSCTR's `p6-mixed-scope` and `cc2-answer-after-refusal` (F4): both byte-identical to the authors' committed outputs (`a7a95326…`, `85a3faf3…`);
- `phase4-adversarial-g01`, `phase5-adversarial-sd`, `phase4-verify-sd01` and `phase3-adversarial-g02`: byte-identical to the committed R7C-P7 outputs;
- my new probes `p7-x0` … `p7-x6`;
- the F7 and J7 mutants.

**Not re-run:**
- the authors' `phase7-run-evidence.mjs` and `phase7-mutation.mjs` (I re-applied the F7 edits myself instead), and the inherited Phase 3–6 mutant sets;
- `phase3-holdout`, the conformance scripts, `neighbors-r7b2`, `regress-r7b2` and its stamp-neutral form, and the b2-copy clinical probes. I read their hashes in the freeze record, and the verifier checks the stamp-neutral regress.
- `npm run verify`, other `verify-r*` scripts, and anything with `--write`.

The full suite ran only inside the verifier (884/884, twice).

## Caveats

- **Clearance** is modelled as the predecessor and the tests do: the client continues with the carried record and no clinical reference state. The CHOICE carrier assumes a C2-conformant client that does not apply a REQUIRES_RECONCILIATION proposal.
- **Isolated copies.** Revisions were extracted with `git archive` (CoachingCore plus the audit records the runtime reads; `node_modules` copied) into `C:\Users\carva\AppData\Local\Temp\qe-r7c-p7-judge\{b2,f3,f4,f4m}`. Mutants touched only `f4m`, and its `src` and `test` were checked equal to the worktree afterwards. The SSCTR probes extract their own temporary copies with `git archive` and remove them.
- **Mistakes in my own probes, corrected before use:**
  - the mutant runner's first pass misparsed the test summary (a regex escape) and refused to run;
  - its J7 witness patterns had lost an escape; fixed and checked against the witness baseline (each pattern selects one test);
  - `p7-x1`'s first reference re-gated the week; I added the non-gating reference that decides the classification;
  - `p7-x6` check 7's second session fell after the decision clock, so that check exercises the permutation of the merge only;
  - `p7-x4`'s failure list was capped, so the FREEZE-3 all-adverse cells were listed in a filtered rerun (`p7-x4-adverse-only.F3.json`);
  - the predecessor's `p6-x4` comparison block keys on runtime names `F2`/`F3`, so in my rerun it is empty; I compared its paths directly (FREEZE-3 LATE = FREEZE-4 LATE, LATE_SAT identical).
- **Repository writes:** only this file, its JSON and `probes/phase7/` (scripts and `out/`). No commits and no git state change; HEAD `3fe55ae` at start and end.

## Routing and conditions

- **Gate:** READY_WITH_CONDITIONS. No blocker, so R7-C need not close `CLOSED_NOT_READY` on this gate; the closure also depends on the SSCTR's narrow recheck, which I did not read.
- **Conditions before closure** (owner: the R7-C closing session, with the SSCTR for C3):
  - Correct the backward-behaviour disclosure (QE-R7C-15) in the handoff and the closure record (the freeze record is immutable). On a record without first-recorded clocks, the FREEZE-3 reading stands, and it fails shortened, adverse and full-dose answers alike when a week of the window was closed by a decision that records no gates.
  - The single final C3 text must not rest on "sound for full-dose and adverse".
  - Consumers carry the runtime's own completed-work record, never self-built rows.
  - Disclose QE-R7C-16 beside QE-R7C-11 and QE-R7C-12, and correct the "128/128 identical, shortened late reporters included" wording to its measured scope.
- **SSCTR:**
  - QE-R7C-16: accept under C9/C11 presentation (the following weeks' plan is provisional until the week's review), or route to the engine with QE-R7C-12;
  - QE-R7C-18 for C3's wording on corrections.
- **Later runtime mission** (its own Founder authorization):
  - QE-R7C-17 (directed tests for the clock's three unpinned rules);
  - QE-R7C-18 (corrections recorded by a clinical route);
  - optionally a decision ordinal for same-clock ties;
  - QE-R7C-12 and QE-R7C-16 if the SSCTR routes them to the engine.
- **No escalation:** no product, policy, catalog or clinical decision was needed to judge.

R7C_ENGINEERING_GATE = READY_WITH_CONDITIONS
