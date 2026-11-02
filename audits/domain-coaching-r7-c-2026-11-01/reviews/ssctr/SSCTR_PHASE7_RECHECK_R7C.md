# SSCTR narrow recheck of R7-C Phase 7 on R7C-FREEZE-4 (QE-R7C-10, P6-F01)

Record `SSCTR-P7-R7C-r6`, dated 2026-11-02. The structured record is [SSCTR_PHASE7_RECHECK_R7C.json](SSCTR_PHASE7_RECHECK_R7C.json). The request is [PHASE7_RECHECK_REQUEST.md](PHASE7_RECHECK_REQUEST.md); my previous record is [SSCTR-P6-R7C-r5](SSCTR_PHASE6_RECHECK_R7C.md).

## Decision

**Gate: ACCEPT_WITH_CONDITIONS. No SSCTR blocker.**

- **What Phase 7 fixed:**
  - An answer that a refusal or a handler clinical route recorded is now applied as the same answer delivered directly, for every answer shape I measured. That includes runs done shorter than prescribed (QE-R7C-10) and P6-F01's mixed patterns. It also covers an all-adverse shape that R7C-FREEZE-3 still missed and that I had not measured in r5.
  - My grids found 0 recorder-dependent cells: 960 of my own (shortened, adverse and mixed), 768 in the mixed-scope re-run (16 on R7C-FREEZE-3) and 1,200 in the CC2 re-run (18). The two re-runs are byte-identical to the coordinator's bound outputs.
  - The plan applied stays inside the authorities:
    - 0 runs above the single-run ceiling. On R7C-FREEZE-3, 60 stale cells were above it, by up to 28 minutes (LONG 75 where the record allows 47).
    - 0 race touches and 0 taper quality sessions beyond the direct answer (16 on R7C-FREEZE-3).
    - No step that a short run did not earn.
  - Clinical-first is unchanged. C11 is unchanged.
- **Why the gate is not READY:**
  - **Records without the new clock keep the old reading (P7-F03).** A run report recorded before R7C-FREEZE-4 carries no first-recorded clock, and the old reading applies to it. In my legacy cells, an answer recorded that way by a clinical route stays unapplied after clearance in 23 of 200 cells, with the stale doses VALID: up to LONG 65 where the record allows 41, and a taper quality session.
    - This covers more than the freeze record's statement, which names shortened answers only. All-adverse answers and alternating mixed answers are affected too.
    - Records whose weeks were written before R7C-FREEZE-4 but whose answer arrived after it are fixed: 0 of 200 cells.
    - The new clause in C3 carries this, together with a clock-integrity obligation for consumers.
  - **Phase 7 widens QE-R7C-12 slightly (P7-F02).** After an answer with shortened runs delivered directly, a later decision in the answer week can re-plan the following week's VALID easy runs upward: 41/41 to 45/45 in GEN b=5. That is above R7C-FREEZE-3 and above the week's own review, which plans 41.
    - It lasts until that review. It stays within the projection's ceiling and never touches the answer week, quality or race.
    - It contradicts the handoff, which says no dose rose above R7C-FREEZE-3.
    - C9's consumer part already covers this cell. I extend it to every answer (C9, r6).
  - **The consumer conditions C2, C3, C8, C9 and C11 remain obligations.** C9's Engineering part for the handler re-compositions is still owed. No frozen byte discharges these.
- **For the closure:** in my domain, QE-R7C-10 and P6-F01 are closed for records written on R7C-FREEZE-4. Whether QE-R7C-10 counts as closed is the Engineering gate's call.

This is a narrow recheck within SSCTR-SD-R7C-r2, not a new disposition.

| # | Item | Result |
|---|---|---|
| 1 | Shortened execution semantics | **CONFIRMED.** Applied as delivered directly in 960 of 960 cells, re-send or not. Within the ceiling, and no step a short run did not earn. On these bytes the answer week of the direct path is identical to R7C-FREEZE-3 (240 of 240 cells). |
| 2 | Mixed and adverse answers (E1, M2) | **CONFIRMED.** P6-F01's patterns, all-adverse, shortened with adverse responses, and shortened with misses: 0 recorder-dependent cells. E1 and M2 hold. The only flags are on the direct path and identical to R7C-FREEZE-3: a quality ladder artifact and R3. |
| 3 | Clinical-first | **CONFIRMED** |
| 4 | Taper and race-week bounds | **CONFIRMED** |
| 5 | C11 | **UNCHANGED** (525 timely cells identical to R7C-FREEZE-3) |
| 6 | C3 | **One final text** (below). It replaces the r2 text as carried and the r4 and r5 clauses. |
| — | C7 R4 and R5; the QE-R7C-14 disclosure | **All three change** (texts below). |

## Why

**1. Shortened execution semantics.**
- **Grid (my P7-SH probe, 960 cells):**
  - Programs: GEN weeks 5, 7 and 9; R10K build, taper and race week.
  - Gap from week 0 or 2. Gap weeks reviewed with strength only (RV) or not reviewed (NR).
  - Ten answers: EXEC, SHORT60, SHORT80, LONG_SHORT, EASY_SHORT, SHORT_NOT, SHORT_ADV, SHORT_MIX, ALL_ADV, MIX_ALT.
  - Recorders: a substitution with pain, a clinical return report, R4.
  - Next decision: plain, or the answer re-sent.
- **Recorder independence:** the recorded path equals the direct answer (D) in 960 of 960 cells, with the answer re-sent or not.
  - On R7C-FREEZE-3: 92 stale VALID cells, all RV and behind a clinical route. SHORT60 24, SHORT80 24, SHORT_ADV 24, MIX_ALT 12, ALL_ADV 4, SHORT_NOT 4.
- **Ceiling:** 0 runs ahead in the answer week above the single-run ceiling. I compute the ceiling from the ledger by the policy formula, not from the engine. D itself: 0 above the ceiling.
- **No unearned step.** For every shortened shape the plan is never longer than the review's reading of the same facts (A) in any slot, and adds no intense role A lacks. One flag only:
  - GEN week 7, gap from week 2, LONG_SHORT: quality 5x5 (48 minutes) against A's 3x8 (43).
  - On the threshold ladder 5x5 is the rung below 3x8, so this is a minute-count artifact and more conservative.
  - The quality sessions were done in full and earn their steps. The long run sits at the ceiling (55, as in A).
  - Shortened plans are never above the stored plan, except quality earned by sessions done in full.
- **The reference D is unchanged** (P7-DP, 240 cells against R7C-FREEZE-3):
  - The answer week is identical at every decision in 240 of 240 cells.
  - The plan after the week's review is identical too.
  - Only 13 cells differ, all at the day-5 decision and only in the following week's conditional projection (P7-F02, C9).

**2. Mixed and adverse answers.**
- **P6-F01 is closed.** The mixed-scope re-run shows 0 of 768 cells differing from D: MIXED_ALT 12 → 0, MIXED_ALT1 4 → 0. In the CC2 re-run, MIXED is equal to D in 228 of 228 VALID cells (210 on R7C-FREEZE-3), with 0 above D (18) and 0 intense roles (4).
- **All adverse:** 0 of 96. R7C-FREEZE-3 kept QUALITY 34 / LONG 60 in GEN week 7 (gap from week 2, RV) where the answer plans LONG 40. My r5 had not measured this shape.
- **Shortened with adverse responses:** 0 of 96 (24 on R7C-FREEZE-3).
- **Shortened with misses:** SHORT_NOT 0 of 96 (4 on R7C-FREEZE-3), SHORT_MIX 0 of 96.
- **E1 (adverse responses change the plan and never lengthen the long run):**
  - Adverse is never above the same runs without adverse: SHORT_ADV against SHORT60, ALL_ADV against EXEC, 0 flags.
  - The mixed-scope ADVERSE flags (8 cells) are P6-F07: the direct path itself in GEN b=5, gap from week 2, as in r5.
- **M2 (mixed evidence never leaves a run longer than the on-time plan's):**
  - Holds for easy and long runs.
  - The 8 mixed-scope flags are on the direct path and identical on R7C-FREEZE-2, -3 and -4. They are quality sessions of 48 minutes (5x5) against 43 (3x8): the lower ladder rung, longer in minutes only because of the recoveries.
- **New disclosure (P7-F04, R3).** With every run adverse, D sits one step (5 minutes) above A on the easy and long runs, for example EASY 25 / LONG 45 against 20 / 40.
  - This is still far below the stored plan (EASY 45 / LONG 65) and below the executed answer's plan.
  - Identical on R7C-FREEZE-3.
- **Causation:** the re-plan's reason names facts only. The clock is evidence visibility: no gate, dose or learned pattern reads it.

**3. Clinical-first.**
- **Code order, read:** the eligibility clinical flag, `previousValidity` with its sticky clinical reference, `clinicalRoute` deciding alone, and `withFactualReplan` returning a clinical decision unchanged. The delta does not touch any of them. Its only change in `evaluateProgram` is the `recordArrival` option of normalization.
- **Recorder statuses:** identical to R7C-FREEZE-3 in my CC2 re-run (SUB_PAIN, RET_ILL and ELIG: CLINICAL_HUMAN_REQUIRED, REQUIRES_RECONCILIATION).
- **Clinical copies:** my verbatim copies of K6, K6b, the inventory and the inherited adversarial probe (3,228 checks, 0 failed) are equal to my Phase 6 outputs and to the coordinator's R7C-P7 outputs, after labels.
- No clinical judgment is made here. Clearance stays CLINICAL_HUMAN_REQUIRED.

**4. Taper and race week.**
- 0 race touches and 0 taper or race-week quality sessions beyond D and A: 960 cells, and 0 in the 768 mixed-scope cells.
- On R7C-FREEZE-3 there were 16, for example R10K taper QUALITY 28 where the answer plans EASY 30.
- After a taper answer delivered directly, the refire adds nothing to race week (EASY 20/20 and the race).

**5. C11.**
- 525 timely cells are identical to R7C-FREEZE-3 at the mid-week decision and after the review:
  - the P6-T grid (210 cells, with the same 24 mid-week holds);
  - runs done at 70 % on time (105);
  - long runs adverse on time (105);
  - a long run reported the day after its week's review (105).
- The last three show 0 recorded re-plans.
- C11 is carried with its r5 text.

**6. C3.** QE-R7C-10 and P6-F01 are what the r4 and r5 clauses waited on. On records written on R7C-FREEZE-4 both are fixed, so the "until an engine fix" consumer clauses retire. What remains on these bytes are two things:
- a clock that consumers must carry intact;
- the old reading for records without the clock (P7-F03).

The final text below states both.

## Conditions the closure carries

> **Superseded in part by the [addendum after the Engineering review](#addendum-after-the-engineering-review).** It replaces C3 and C11 and extends C7 and C9. The JSON `conditions` hold only the final text of each condition. The first r6 C3 text below is kept for the record and is not in force.

- **C2, C4, C5, C8:** unchanged. The texts in the freeze record and the handoff govern.
- **C10:** carried as in r4, including CC-F06.
- **C11:** carried with its r5 text, unchanged on R7C-FREEZE-4.
- **C3 (first r6 text, replaced by the addendum; not in force):**

  > The answer path is low-friction and factual: done or not done per session, or a declared break with its reason, screened clinically. HealthKit evidence is used before asking where available. Non-response never falls back silently to credit or zero. While referenceState.pending.signal is present, the answer is delivered as a plain review of that week or as the pending event kind with its signals. An answer inside another event kind is followed by the held signal re-submitted before the plan is presented. A RECOVERED event does not carry the answer (it stays ASK). An answer to UNREPORTED_TRAINING that a decision recorded without applying it (a refusal such as the R4 HOLD; a handler clinical route: a substitution with pain or a clinical return report; an ASK whose proposal the client did not apply under C2) is applied by the first eligible decision after it, with no re-send, as the same answer delivered directly, and after a clinical route only after qualified clearance, which the runtime cannot give. On R7C-FREEZE-4 this holds for every answer shape measured: known stops, runs done in full, runs done shorter than prescribed (at 60 % or 80 %, the long run only, with the other runs not done), adverse responses, mixed answers and their combinations; re-sending such an answer changes nothing. An eligibility clinical flag returns before any report is read and records nothing, so after qualified clearance its answer is re-sent or asked again (R5). This rests on the record: whether an earlier review read a run report is taken from the clock at which the completed-work record first held it (provenance.firstRecordedAt, written only by the runtime), never from the gate that review gave. Consumers carry the record exactly as the runtime returns it and never drop, set or rewrite that clock. A report without it (a record written before R7C-FREEZE-4, or a clock lost) is read as on R7C-FREEZE-3: an answer recorded that way with runs done short, every run adverse, or runs alternately done and not done can stay unapplied after clearance, re-send included, with the stored doses VALID (measured: a long run of 65 minutes where the record allows 41; a taper quality session where the direct answer plans easy running). No such record is carried into any use beyond the offline reference; if one is, after a decision that recorded an answer on it without applying it, the run doses remaining in that week are not presented as a prescription: the qualified human's clearance and the week's own review decide, and that review re-plans the following week from the facts. Cadence and wording belong to G03.

- **C7 (disclosure): the r5 text, with these r6 changes.**
  - **R1:** add "unchanged on R7C-FREEZE-4; the non-handler one-step differences at the first decision of week b+1 are now 0 (16 on R7C-FREEZE-3)".
  - **R3:** add "with every run adverse the answer path holds the easy and long runs one step (5 minutes) above the same facts read by the review before the answer week (for example EASY 25 / LONG 45 against 20 / 40), still below the stored plan and the executed answer's plan (E1 holds); identical on R7C-FREEZE-3".
  - **R4 (replaces the r5 R4 text):**

    > A SCHEDULE_CHANGE in the program's last week throws and returns HOLD, and the HOLD remains (Engineering). An answer it records is applied by the next decision as delivered directly: a known stop by the ceiling re-plan; runs done in full, shorter than prescribed, adverse or mixed by the recorded-answer re-plan (no residual measured). On a record without first-recorded clocks, see C3.

  - **R5 (replaces the r5 R5 text):**

    > An eligibility clinical flag returns before the reports are read and records nothing, so the answer is re-sent or asked again after qualified clearance (C3). A handler clinical route records the answer, and nothing is prescribed while it stands. After qualified clearance the first eligible decision applies it with no re-send for every answer shape measured on R7C-FREEZE-4 (known stops; runs done in full, shorter than prescribed, adverse or mixed, P6-F01's patterns included), and re-sending changes nothing. On a record whose answer rows carry no first-recorded clock, a shortened, all-adverse or mixed answer such a route recorded keeps R7C-FREEZE-3's reading (C3).

  - **The reach:** add "since R7C-FREEZE-4 the reports a review did not read are decided per report from the clock at which the record first held them, so late reports of runs done short or adverse count as unread, as late full-dose reports do".
  - **QE-R7C-14 (replaces the handoff's text):**

    > On R7C-FREEZE-3 the directed tests used full-dose answers only, and the Engineering review recorded three surviving mutants of answeredOnRecord's guards: J-M2 (REGRESS not counted as executed; witnessed), J-M3 (the return-report exclusion removed) and J-M5 (the return-replaced start ignored), the last two not witnessed. Phase 7's directed tests cover shortened, all-adverse and mixed answers, timely reviews that gave HOLD or REGRESS on reports they had, and present and late reports of one week; each Phase 7 mutant (F7-M1..M11) is killed by its own witness, and J-M2 survives only in the reading kept for records without clocks, as F7-M7, killed by the backward-behaviour test. Phase 7 names neither J-M3 nor J-M5; both guards are present in R7C-FREEZE-4, and whether a test now kills them is for the Engineering gate.

  - **Corrections:**
    - The handoff's backward-behaviour sentence, "sound for full-dose and adverse answers; a shortened late answer ...", becomes C3's legacy clause. The freeze record carries the same sentence; it stays unedited, and the closure records the correction.
    - The handoff's QE-R7C-12 sentence, "no dose raised ... above R7C-FREEZE-3", is corrected by C9 (r6).
- **C9:** the r2 text verbatim, including the taper-to-race-week case, and the r4 and r5 status notes. Add this r6 note:

  > R7C-FREEZE-4 does not change the handler re-compositions (my CC3 re-run: EXERCISE_SUBSTITUTION 44, RETURN_SHORT 14, EVENT_DATE_CHANGE 8, identical to R7C-FREEZE-3; the non-handler one-step differences fall from 16 to 0). The Engineering part is still owed for those routes. QE-R7C-12 (routed to the SSCTR): after an answer delivered directly, a later decision of the answer week can re-plan the following week again with more elapsed run sessions uncredited, and that VALID conditional projection can sit above what the week's own review then plans, by one single-run step on easy runs or one quality rung (a known stop: EASY 20/20 against 15/15; since R7C-FREEZE-4 also after a shortened answer: GEN EASY 45/45 against 41/41, where R7C-FREEZE-3 kept 41/41), never in the answer week, never as a race touch, until the week's review or the first decision of the next week. The consumer part therefore applies after every answer to UNREPORTED_TRAINING, delivered directly or recorded, whether or not a session of the answer week had elapsed before it: the following week's plan is provisional and is not presented or delivered as a prescription until the answer week's review or the first decision of the next week (on the timely path, C11). Engineering, a later runtime mission (not blocking): a later decision never plans the following week above what the same facts give with the elapsed sessions credited (unknown never plans more than known), or the projection is disclosed as conditional.

## Findings (one line each)

- **P7-F01** (positive; closes P6-F01 in my domain): on records written on R7C-FREEZE-4 a recorded answer is applied as the direct answer for every shape measured.
  - My cells: 960 + 768 + 1,200, with 0 recorder-dependent.
  - On R7C-FREEZE-3 there were 92, 16 and 18, and the stale doses reached 28 minutes above the single-run ceiling.
- **P7-F02** (condition, C9; `DIRECT_R7C_DELTA` for Phase 7; the QE-R7C-12 class): after a direct shortened answer, a later decision raises the following week's VALID easy runs above R7C-FREEZE-3 and above the week's review.
  - **Where:** GEN b=5, gap from week 0, RV; SHORT60, SHORT_NOT, SHORT_ADV, SHORT_MIX; days 4 to 5, until the review.
  - **What:** 41/41 → 45/45.
  - The coordinator's direct-refire grid did not contain this cell.
- **P7-F03** (condition, C3's legacy clause): a report recorded without the first-recorded clock keeps R7C-FREEZE-3's reading.
  - **Measured:** 23 of 200 legacy cells stale VALID: shortened, all-adverse and alternating mixed answers, up to LONG 65 against an allowed 41, and taper QUALITY 28.
  - Records whose answer arrived on R7C-FREEZE-4 are clean: 0 of 200.
- **P7-F04** (disclosure, R3): with every run adverse, the answer path holds easy and long runs one step above the reviewed reading of the same facts. Identical on R7C-FREEZE-3.
- **P7-F05** (documentary): three statements need correcting at closure.
  - QE-R7C-14 omits J-M3 and J-M5.
  - The QE-R7C-12 sentence on R7C-FREEZE-4.
  - The backward-behaviour sentence.
- **P7-F06** (observation, direct path, identical on R7C-FREEZE-2 to -4): M2's minute flags on quality sessions are ladder structure (5x5 against 3x8), not a harder session.

## What I ran, and what I did not

**Run:**
- **Bytes:**
  - The freeze record's sha256 equals `bf99c01b…2fc2`.
  - `git diff a9654c8 HEAD -- CoachingCore/src CoachingCore/test` is empty.
  - The working delta files equal the record.
- **Verifier:** `verify-r7c.mjs --revision 4 --suite` without `--write`: 27 of 27 PASS, 884 of 884.
- **My own probes** (in [probes/phase7/](probes/phase7/), all read-only; R7C-FREEZE-3 bytes extracted by `git archive`, with `node_modules` copied, into my own temporary folders outside the repository, removed after use):
  - shortened answers (P7-SH);
  - the direct path (P7-DP);
  - direct refire (P7-DR);
  - the refire cell (P7-RC);
  - timely mid-week (P7-T).
- **Re-runs on R7C-FREEZE-4:**
  - my mixed scope, CC2 and CC3;
  - the clinical copies.
- **Literature:** WebSearch works (checked 2026-11-02). The screen found no new systematic review and I make no new claim.
- **Unchanged inputs:** the policy, the catalog and the queue (230 items, funding NOT_DECLARED).

**Read, not re-run:**
- the mutation evidence: Phase 7 11 of 11, each killed by its own witness;
- the coordinator's shortened grid, including the CHOICE carrier;
- the trajectories, the differential, the reach, the late reporter and the history outputs.

**Not opened:**
- the authoring session's scratchpad. My own session scratchpad lies inside it, so I used none;
- the untracked `reviews/engineering/probes/phase7/` (the concurrent Engineering review).

**Not verified:**
- **Schema validation:** Python is unavailable.
- **Clinical clearance:** modelled as the tests model it.
- **Strength-side recorder independence.**
- **The skipped-review path after P7-F02.**
- **Real-user behaviour and consumer compliance.**
- **Native dispatch:** cannot be observed.

**Authority:**
- PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY.
- No human, empirical or clinical validation; no publication; V1 authority stays NO.
- Nothing was appended to the queue.

**Re-review:** on any of these:
- any change to a file bound by R7C-FREEZE-4 (manifest `61937f87…f6b8`);
- any change to `unreadRunReports`, `answeredOnRecord` or the first-recorded clock;
- any migration or consumer handling of records without the clock;
- an engine change for QE-R7C-12;
- C9's handler routes, C8, C5 or R4;
- a G03 cadence decision;
- a relevant policy change, new V1 data, or a relevant systematic review.

At the latest 2027-04-30. Owner: Chief.

## Addendum after the Engineering review

The coordinator asked for this after the Engineering gate on R7C-FREEZE-4 finished: classify the three items that gate routed to me.
- **Bytes:** the same frozen bytes. HEAD moved from 3fe55ae to aea6fa2, which adds only the Engineering review and its probes; `git diff 3fe55ae aea6fa2 -- CoachingCore` is empty.
- **Engineering record:** [PHASE7_REVIEW_R7C.md](../engineering/PHASE7_REVIEW_R7C.md) (sha256 `82eaa6d8…495d`), READY_WITH_CONDITIONS, QE-R7C-10 closed, no blocker. I read its QE-R7C-15 to -18, its routing and conditions, and the outputs of `p7-x2l`, `p7-x5b` and `p7-x3b`. I did not re-run its probes, which need archive roots; I wrote two reproductions of my own instead.

**Gate: ACCEPT_WITH_CONDITIONS, unchanged. No blocker.**

| Item | Classification |
|---|---|
| QE-R7C-16 (habitual late reporter with runs done short) | **Accepted under the presentation rule.** C11 is replaced so that it covers this case literally. The engine item stays with QE-R7C-12 for a later runtime mission and is not blocking. **Not a blocker.** |
| QE-R7C-15 (records without clocks, gate-less closers) | **C3 needs one change:** the legacy sentence. |
| QE-R7C-18 (a correction recorded by a clinical route) | **C3 words it now** as a consumer guard, plus a C7 disclosure. The engine fix goes to a later runtime mission. |

**QE-R7C-16.**
- **Reproduction:** my own probe ([p7-late-short-reporter.mjs](probes/phase7/p7-late-short-reporter.mjs)), not the Engineering one.
  - Programs: GEN and R10K, runs done at 60 % and 80 %.
  - Timeline: strength reported on its day, weekly review on day 6, runs reported on day 1 of the next week.
- **Result:**
  - 19 recorded re-plans where R7C-FREEZE-3 keeps the plan.
  - 16 same-role raises of at most 5 minutes, 14 of them above what the week's own review then plans.
  - 0 raises in the current week.
  - The executed weeks are identical to R7C-FREEZE-3 in all four timelines.
- **Mechanism:** the same as P7-F02 and QE-R7C-12, reached for a new reporter class.
  - The week's elapsed unreported runs are left uncredited, so the dose comes from the projection's single-run ceiling.
  - That ceiling credits the current week's sessions still ahead. So 13 of the 16 raises sit above what the record allows at that moment: EASY 45 against 41; LONG 65 and 70 against 57.
  - R7C-FREEZE-3's own projection was already above that ceiling for those long runs (62 and 67).
- **Sporting reading:** for a habitual 60 % runner such a raise is not a step the record earned, so it must never be a prescription. But it lasts two days, the week's own review replaces it before any of those weeks starts, and nothing executed changes. So it is a presentation condition, not a blocker.
- **Why C11 changes:** my r6 C9 note and the r5 C11 did not literally cover this case. No question is answered, and this is not the timely path. C11 is replaced by a rule for every week after the current one. C9's engine item now names QE-R7C-16.

**QE-R7C-15.**
- **Reproduction:** my own probe ([p7-gateless-closer.mjs](probes/phase7/p7-gateless-closer.mjs)).
  - Programs: GEN week 7 and the R10K taper week, gap from week 0 or 2.
  - One gap week is closed at day 6 by a nonclinical substitution or a schedule change.
  - A clinical substitution carries the answer and is then cleared.
- **With clocks:** 0 of 24 cells differ from the direct answer.
- **With every clock removed:** 13 of 24 cells stay stale and VALID. This includes full-dose answers (GEN, gap from week 2: QUALITY 34 where the answer plans 43, here more conservative) and adverse answers:
  - GEN, gap from week 0: QUALITY 34 / LONG 60 where the answer plans EASY 25 / LONG 35.
  - R10K taper, gap from week 0: QUALITY 25 / LONG 40 and a race touch, where the answer plans EASY 15 throughout.
- **Why C3 changes:** the first r6 C3 already bound consumers for any answer on a record without clocks. But its list of shapes read as exhaustive, and the list was wrong. The one change rewrites that sentence:
  - it covers any answer;
  - it names the gate-less closer;
  - it adds rows a client builds itself, which carry no clock;
  - it requires new reports to go in only as observations.

**QE-R7C-18.**
- **Evidence:** from the Engineering output (`p7-x3b`); I did not re-run it.
  - Case: a correction of week 5's on-time long run to 60 %, recorded by a clinical substitution and then cleared, with or without a re-send.
  - After clearance the plan built from the uncorrected run stays VALID: QUALITY 43 (3x8) / LONG 75, and EASY 55 next week.
  - The correction delivered directly plans QUALITY 48 (5x5, the lower rung) / LONG 75 / EASY 50.
  - The week's own review then converges.
  - This is identical on R7B2-FREEZE-1, so it is not an R7-C defect.
- **Magnitude:** one ladder rung and 5 minutes, within the ceiling.
- **Why a disclosure alone does not suffice:**
  - Only one shape was measured.
  - My first r6 C3 says a recorded answer is applied with no re-send, and a consumer could read that as covering corrections.
  - So C3 now states the difference and applies the same guard it uses for records without clocks.
- No clinical judgment is involved. Clearance stays CLINICAL_HUMAN_REQUIRED.

### Changed condition texts (final; the JSON `conditions` hold exactly these)

**C3 (replaces the first r6 text; the single C3 in force after the closure):**

> The answer path is low-friction and factual: done or not done per session, or a declared break with its reason, screened clinically. HealthKit evidence is used before asking where available. Non-response never falls back silently to credit or zero. While referenceState.pending.signal is present, the answer is delivered as a plain review of that week or as the pending event kind with its signals. An answer inside another event kind is followed by the held signal re-submitted before the plan is presented. A RECOVERED event does not carry the answer (it stays ASK). An answer to UNREPORTED_TRAINING that a decision recorded without applying it (a refusal such as the R4 HOLD; a handler clinical route: a substitution with pain or a clinical return report; an ASK whose proposal the client did not apply under C2) is applied by the first eligible decision after it, with no re-send, as the same answer delivered directly, and after a clinical route only after qualified clearance, which the runtime cannot give. On R7C-FREEZE-4 this holds for every answer shape measured: known stops, runs done in full, runs done shorter than prescribed (at 60 % or 80 %, the long run only, with the other runs not done), adverse responses, mixed answers and their combinations; re-sending such an answer changes nothing. An eligibility clinical flag returns before any report is read and records nothing, so after qualified clearance its answer is re-sent or asked again (R5). A correction of an earlier report is different: one that a decision recorded without applying it (measured: a clinical substitution, then cleared) is applied only by the week's own review, re-send included, and until then the plan built from the uncorrected report stays VALID; so after such a decision the run doses remaining in that week are not presented as a prescription until that review. This rests on the record: whether an earlier review read a run report is taken from the clock at which the completed-work record first held it (provenance.firstRecordedAt, written only by the runtime), never from the gate that review gave. Consumers carry the record exactly as the runtime returns it, send new reports only as observations, and never add rows of their own or drop, set or rewrite that clock. A report without it (a record written before R7C-FREEZE-4, a row a client built itself, or a clock lost) is read as on R7C-FREEZE-3, and any answer recorded that way can stay unapplied after clearance, re-send included, with the stored doses VALID: runs done short, adverse or mixed, and also runs done in full or adverse when a week of the window was closed by a decision that records no gates, such as a nonclinical exercise substitution (measured: a long run of 65 minutes where the record allows 41; QUALITY 34 / LONG 60 where an all-adverse answer plans EASY 25 / LONG 35; a taper quality session and a race touch where the direct answer plans easy running). No such record is carried into any use beyond the offline reference; if one is, after a decision that recorded an answer on it without applying it, the run doses remaining in that week are not presented as a prescription: the qualified human's clearance and the week's own review decide, and that review re-plans the following week from the facts. Cadence and wording belong to G03.

**C11 (replaces the r5 text):**

> Later weeks are provisional. The run doses of any week after the current one are a conditional projection: consumers present them as provisional, never as a prescription, until the decision that closes the week before them (that week's own review, or the first decision of the following week when the review does not happen) has re-planned them, and a change a decision makes to them before then is not surfaced as a coaching change; cadence and wording belong to G03. Measured on R7C-FREEZE-4: (a) on the timely, weekly-reviewed path (since R7C-FREEZE-3, unchanged), a decision made before the week's review while a run session of the week has elapsed with no report re-plans the following week without crediting it: it holds the quality step (GEN THRESHOLD 3x10 back to the week's 4x8; R10K 5x4 back to 6x3; taper 3x4 to 3x3), and the week's review restores the progression once the reports arrive (24 of 210 measured cells change mid-week, 0 after the review); (b) for a habitual late reporter whose runs are done short, the runs of each week reported after that week's review (QE-R7C-16, since R7C-FREEZE-4), a decision before the week's review re-plans later weeks from the facts, mostly down (quality to easy running, taper easy runs 30 to 15, a race-week race touch to easy running) but with same-role raises of 3 to 5 minutes up to six weeks ahead (EASY 41 to 45, 46 to 50, 30 to 35; LONG 62 to 65, 67 to 70, 40 to 45: 16 raises in 19 re-plans, 14 above what the week's own review then plans), VALID until that review, never in the current week, while the executed weeks stay identical to R7C-FREEZE-3 and never above the timely path; (c) after an answer to UNREPORTED_TRAINING, see C9 (QE-R7C-12). This is the accepted unknown semantics, not a new dose.

**C9, r6 note, two phrases replaced:**
- "(on the timely path, C11)" becomes "(and C11 for every week after the current one, QE-R7C-16 included)".
- The engine item becomes:

  > Engineering, a later runtime mission (not blocking), for QE-R7C-12 and QE-R7C-16 alike: a later decision never plans a later week above what the same facts give with the elapsed sessions credited (unknown never plans more than known), or the projection is disclosed as conditional.

**C7, additions to the r6 text:**
- **R5's last sentence becomes:** "On a record whose answer rows carry no first-recorded clock, any answer such a route recorded can keep R7C-FREEZE-3's reading (C3, QE-R7C-15)."
- **After "QE-R7C-12: see C9 (r6).", add:**

  > QE-R7C-15: on a record without first-recorded clocks the R7C-FREEZE-3 reading also leaves full-dose and adverse answers unapplied when a week of the window was closed by a decision that records no gates (a nonclinical exercise substitution, a schedule change): 128 of 224 Engineering cells and 13 of 24 SSCTR cells stale and VALID; with clocks all converge (C3). QE-R7C-16: see C11 (b). QE-R7C-18 (pre-existing since R7B2-FREEZE-1, not R7-C): a correction of an on-time report that a clinical route recorded is applied only at the week's own review, re-send included; meanwhile the plan built from the uncorrected report stays VALID (measured: quality one ladder rung ahead, 3x8 against 5x5, and the following week's easy run 55 against 50); consumer guard in C3; the engine fix belongs to a later runtime mission.

- **The corrections are widened:**
  - The backward-behaviour sentence is replaced by C3's legacy clause: "any answer can keep the old reading: shortened, adverse and mixed answers, and full-dose and adverse ones where a week of the window was closed by a decision that records no gates; QE-R7C-15".
  - The differential's "habitual late reporters (full dose and shortened) included" holds only for its timeline of two decisions a week (QE-R7C-16, C11).

**Unchanged:** C2, C4, C5, C8 and C10.

**Not done in this addendum:**
- I re-ran no Engineering probe, and did not re-run the verifier, because the bytes are unchanged.
- I did not judge QE-R7C-17 (test adequacy belongs to Engineering).
- I did not reproduce QE-R7C-18; Engineering measured one correction shape only.
- Nothing was appended to the queue. No commit.

**New probes:** [p7-late-short-reporter.mjs](probes/phase7/p7-late-short-reporter.mjs) and [p7-gateless-closer.mjs](probes/phase7/p7-gateless-closer.mjs), with outputs in `probes/phase7/out/`. Their sha256 values are in the JSON `addendum`.
