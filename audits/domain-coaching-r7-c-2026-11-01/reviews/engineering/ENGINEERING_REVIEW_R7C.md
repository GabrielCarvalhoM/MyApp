# R7-C Phase 5: Engineering review of R7C-FREEZE-1

Record `R7C-ENGINEERING-REVIEW-1`, dated 2026-11-02. The structured record is [ENGINEERING_REVIEW_R7C.json](ENGINEERING_REVIEW_R7C.json).

- **Judge:** `quality-reliability-engineer`, a fresh instance; model `claude-opus-5-5`, effort xhigh.
- **Independence:** I did not author the runtime, the fixes, the tests, the probes or the evidence. The SSCTR final recheck was committed as `747518b` during this review. That commit touches only `reviews/ssctr/`, and I did not read it before writing this verdict.

## Verdict

**NOT_READY.** Two blockers come directly from the R7-C delta.

In both, a projection stored while training was unknown is kept and validated as the plan in force after a known multi-week stop. That projection credits the unknown training. R7B2-FREEZE-1 gives the correct plan on the same timelines.

Both blockers qualify for the one narrow correction cycle.

| Id | Severity | DIRECT_R7C_DELTA | One line |
|---|---|---|---|
| QE-R7C-01 | BLOCKER | yes | An answer recorded by a decision that does not apply it (R4 HOLD, handler clinical route, clinical return) is never applied afterwards. The next decision keeps the stale projection as VALID, even with the answer re-sent as C3 prescribes. |
| QE-R7C-02 | BLOCKER | yes | R1 is not cured by "the first decision of the next week". When the answer week's review is skipped, the stale week b+1 becomes the current week as VALID, above the single-run ceiling. |
| QE-R7C-03 | MAJOR | yes | A held reactive signal is silently dropped when a change is kept beside the still-open question. |
| QE-R7C-04 | MINOR | yes | The held-signal week guard is reachable but untested: mutant QM-2 survives. |
| QE-R7C-05 | MINOR | yes | A partial executed answer followed by the rest gives a more conservative answer week than one batch. Both converge at the week review. |
| QE-R7C-06 | OBSERVATION | no | The freeze manifest does not bind `CoachingCore/package.json` or `package-lock.json` (R7B2-FREEZE-1 did). |

## Freeze identity

| Field | Value |
|---|---|
| Record | `CoachingCore/r7/c/RUNTIME_FREEZE_R7C_1.json`, sha256 `1b38a2b5c8c142c77ca178d4bdb6412fb227bf0c4771dc1748f4177735956747` |
| Commit | `1890f66356455112907d757032a8b1cd2de29c00` |
| Source digest | `29bf2532…4b6f` |
| Manifest digest | `0362faa7…813e` |
| Size | 138 files, 848 tests |
| Runtime | `r6-adaptation.mjs` `8b189617…1587` and `r6-composition.mjs` `2a4c47e8…b7ce`, unchanged since `e1a4ef4` (the SSCTR-SD-R7C-r2 bytes) |

Verifier runs, both `node CoachingCore/scripts/verify-r7c.mjs --suite`:
- **Before** (04:45:22Z): PASS 12/12, suite 848/848.
- **After** (05:08:15Z): PASS 12/12, suite 848/848.
- **Worktree HEAD:** `f96041f` at the start, `747518b` at the end. `git diff f96041f 747518b -- CoachingCore` is empty.

## QE-R7C-01: an answer recorded but not applied is never applied (BLOCKER)

**Root cause.** `gapAnsweredBy` (Phase 5) detects an answer only as a transition. On the review's carried record the window is unknown; with the same review's own reports it is known.

Some decisions record the review's reports without re-planning:
- the R4 HOLD, an exception in the last-week `SCHEDULE_CHANGE` handler;
- a handler clinical route: `EXERCISE_SUBSTITUTION` with pain, or a clinical `RETURN_AFTER_PAUSE`. Both record the evidence by B.2 design (QE-R7B1-04).

After such a decision the answer is already on the carried record. No later review sees the transition, so no decision ever re-plans the stored week. That week is the projection the question left, crediting the unknown training. `runGapInForce` is also null, so a mid-week KEEP validates it.

**Reproduction.**
- Command: `node audits/domain-coaching-r7-c-2026-11-01/reviews/engineering/probes/qe-e1-answer-in-carried-record.mjs`.
- Output: `probes/out/qe-e1.json`, deterministic over two runs.
- Predecessor: the same probe with `QE_CC=<git archive 1a1c728>/CoachingCore/`, output `probes/out/qe-e1.on-R7B2-FREEZE-1.json`.

| Case (known stop) | Next decision on R7-C | On time / R7B2-FREEZE-1 |
|---|---|---|
| R10K race week (the last week). The answer comes inside a SCHEDULE_CHANGE on day 2, which returns HOLD (R4) and records it. | Plain review on day 3, with or without the answer re-sent: **KEEP, VALID, RACE_TOUCH 25** + RACE 75 | EASY 15 + RACE 75 |
| GEN week 7. The answer comes inside a substitution with pain on day 2, which returns CLINICAL and records it. After clearance: | Plain review on day 3: **KEEP, VALID, QUALITY 34 / LONG 60**. The answer re-sent as C3 prescribes gives the same. SYSTEMIC_FATIGUE reduces from the stale week. | EASY 15 / LONG 15 |
| GEN week 7, clinical return report (illness) with the answer. After clearance: | **KEEP, VALID, QUALITY 34 / LONG 60** | EASY 15 / LONG 15 |
| Control: the answer sent under an eligibility clinical flag (R5, not recorded), re-sent after clearance | REPLAN_FROM_EVIDENCE, EASY 15 / LONG 15 | — |

The counts are 16 stale VALID cells on R7-C and 0 on R7B2-FREEZE-1.

**What this violates:**
- Projection vs fact.
- Deterministic answer processing: the same facts give different decisions depending on which decision recorded them.
- No stale dose in race week.
- SSCTR-SD-R7C-r2's own criterion: no VALID known-stop cell plans a run above the entry, or any quality or race touch.

**Inaccurate disclosures:**
- R4 says "recorded, not applied until the next review". The next review does not apply it either. In the last week no review ever does.
- R5/C3 say "re-sent after clearance". After a handler clinical route, re-sending changes nothing.
- The SD grid classifies the 24 R4 HOLD cells and `continue`s (`phase5-adversarial-sd.mjs:76`). It never looks at the decision after the HOLD.

**Smallest fix I see.**
- Make the trigger depend on state, not on a transition. Re-plan week w from the facts whenever its stored run doses were composed while the window was unknown and the canonical facts now make it known, whichever decision recorded the reports.
- For example: compare against the record as the decision that composed week w's run start saw it, not against the review's carried record. This needs a received-at reference per report or per composing decision.
- Directed tests: the R4 HOLD followed by a plain review; a clinical route followed by clearance, with and without the re-send; a clinical return followed by clearance.
- Policy, catalog and the clinical routes stay untouched.

## QE-R7C-02: R1 is not cured by the first decision of the next week (BLOCKER)

**Root cause.** The answer's factual re-plan re-projects week b+1 counting an answer-week session that elapsed before the answer, with no report, as executed at its stale prescription. This is R1.

If week b's own review is skipped, the first decision of week b+1 does not re-plan week b+1. The window is anchored by the entry runs executed after the answer, so `runGapInForce` is null, and the KEEP turns the projection into the current week. That KEEP mechanism is pre-existing; R7-C makes its input stale.

**Reproduction.**
- Command: `node audits/domain-coaching-r7-c-2026-11-01/reviews/engineering/probes/qe-e3b-r1-first-decision-next-week.mjs`.
- Output: `probes/out/qe-e3b.json`.
- Predecessor: `probes/out/qe-e3b.on-R7B2-FREEZE-1.json`.
- Companion: `qe-e3-r1-next-week-projection.mjs`, with the R1 magnitude and provenance.

**Timeline.** GEN, known stop. The answer comes on day 2 of week 7, after the day-1 EASY 50/55 has elapsed with no report. The day-3 run is reported executed on day 4. Week 7's review is skipped.

| Week 8 in force at the first decision of week 8 | R7-C | On time | R7B2-FREEZE-1 |
|---|---|---|---|
| Gap from week 0, RV | EASY 45 / 45 / LONG 55, **VALID** | 20 / 20 / 20 | 15 / 15 / 15 |
| Gap from week 0, NR | EASY 45 / 45 / LONG 60, **VALID** | 20 / 20 / 20 | 20 / 20 / 20 |
| Gap from week 2, RV | EASY 50 / QUALITY 34 / LONG 55, **VALID** | 20 / 20 / 20 | 20 / 20 / 20 |
| Gap from week 2, NR | EASY 50 / QUALITY 34 / LONG 60, **VALID** | 20 / 20 / 20 | 20 / 20 / 20 |

- Every first decision gives this: a plain review (KEEP), a plain review with the day-6 long run reported (KEEP), and a schedule change (MODIFY).
- The single-run ceiling for that week is the longest completed run in 30 days (15) + 5 = **20**.
- Only week 7's own review cures it.
- The counts are 12 stale cells on R7-C and 0 on R7B2-FREEZE-1.

**What this contradicts:**
- C9, which binds in the freeze record and the handoff: "the answer week's review, or the first decision of the next week".
- The premise of SSCTR-SD-R7C-r2's R1 ruling: "the next decision always cures it before any stale session is due … 0 ceiling breaches".
- The C7 magnitude, which says up to LONG 55. LONG 60 appears in NR.

**Smallest fix.**
- Bring C9's Engineering item into this cycle. When the answer's re-plan leaves answer-week sessions elapsed with no report, do not count them as executed when re-projecting later weeks.
- Alternatively, have the first decision of week b+1 re-plan a start that was projected over them.
- Add the C9 test pinning week b+1 after a day-2 known-stop answer, plus the case where week b's review is skipped.
- Without an engine change, C9 must be narrowed to "only the answer week's own review", and the SSCTR must re-dispose R1.

## QE-R7C-03: a held signal is dropped by a change kept beside the question (MAJOR)

**Root cause.** In `withReference`, the signal carry is gated on `pendingStatus` and excludes the `carried` path. That is the REQUIRES_RECONCILIATION change `heldByRunGap` keeps beside the question.

**Reproduction.** `qe-e2-held-signal-lifecycle.mjs` → `probes/out/qe-e2.json`.

1. Day 0: SYSTEMIC_FATIGUE is held.
2. Day 1: an UNAVAILABLE_DAY strength change is kept. The signal disappears from `referenceState.pending`.
3. Day 2: a plain review answers. The fatigue is never re-evaluated.

With executed facts, B keeps QUALITY 34 where the on-time plan removes it.

**Why the consumer cannot catch it.** The signal is gone before the answer, so C3's route never triggers. This is not the recorded SSCTR-SD5-02 path.

**Fix.** One condition: `if(pending&&(pendingStatus||carried)&&…)`.
- On an isolated copy, all 62 directed and clinical tests pass (QM-3).
- The case then equals the on-time plan for MISS and EXEC (`probes/out/qe-e2.on-QM-3-copy.json`).
- I recommend it in the same correction cycle. Otherwise extend C3/C8 to this path and disclose it.

## QE-R7C-04, QE-R7C-05, QE-R7C-06

- **QE-R7C-04 (MINOR).** Removing `s.weekIndex===w` from `heldSignal` (QM-2) survives all 62 directed and clinical tests.
  - The guard is reachable: under QM-2, a fatigue held at the end of week 7 is replayed by week 8's first plain review (`probes/out/qe-e2b.on-QM-2-copy.json`).
  - The freeze behaves correctly (`probes/out/qe-e2b.json`).
  - Fix: add that test.
- **QE-R7C-05 (MINOR).**
  - GEN, executed facts, gap from week 0. One batch on day 2 gives QUALITY 34 / LONG 60 ahead.
  - Half on day 0 anchors the window and re-plans from partial facts. The rest on day 2 arrives as late facts and gives KEEP, with EASY 45 / LONG 50 ahead.
  - The direction is conservative, and both paths converge at the week-7 review. Known-miss batches are independent.
  - Disclose under C7.
- **QE-R7C-06 (OBSERVATION).** Neither package file is bound in the freeze. Both are unchanged since `1a1c728`. Bind them in the next freeze.

## The Founder's list

| Item | Result | Basis |
|---|---|---|
| Current actionable horizon | FAIL | Direct answers pass: the 48-cell test and the SD grid of 1,200 cells, re-run byte-identically. QE-R7C-01 fails. |
| Projection vs fact (incl. R1) | FAIL | QE-R7C-01, QE-R7C-02 |
| Pending lifecycle | PARTIAL | Raised, verbatim (qe-e4), kept beside a change, partial, answered and consumed all pass. QE-R7C-03 fails; QE-R7C-04 is a test gap. |
| Replay | PASS, test gap | Once, by its own handler, on the factual ctx. The cross-week guard is untested (QE-R7C-04). |
| Deterministic answer processing | FAIL | The same review gives the same hash. Recorder-dependent outcomes (QE-R7C-01); conservative batch dependence (QE-R7C-05). |
| Plan validity | PASS (structural) | VALID exactly when pending is null, on every probe decision. Pending is null in the QE-R7C-01/02 states. |
| No stale dose after reconciliation | FAIL | Direct answers in the taper and race week pass. The race week through R4 fails (QE-R7C-01). |
| Evidence preservation | FAIL | The answer's own adverse evidence is applied. A held fatigue is dropped (QE-R7C-03). |
| Clinical priority | PASS | 72/72 grid cells (9 kinds × gap or held signal × with or without the answer × MISS/EXEC), plus code and suite |
| Consent and revocation | PASS | Gates in `learnedMaintenance`; revocation empties the model (`r6-learning.mjs:19`); G02 adversarial re-run identical |
| History immutability | PASS | `immutabilityErrors` on every proposal, the suite, SD grid H1 re-run |
| Tests | PASS | 848/848 twice. Each KNOWN_MISS variant of the legacy split keeps its original assertions verbatim, as SSCTR r2 authorized. |
| Mutation | PASS, gap | Committed sets read (17/18 + equivalent, 8/8, 6/6). Isolated copy: QM-1 (= SD-M1) killed, QM-4 killed, QM-2 survived. |

## Reproduced and not reproduced

**Re-run, identical except clock fields** (all committed probes that print to stdout):
- `phase5-adversarial-sd.mjs`
- `phase4-verify-sd01.mjs`
- `phase4-adversarial-g01.mjs`
- `phase3-adversarial-g02.mjs`

Outputs are in `probes/out/rerun-*`.

**Not re-run:**
- `phase5-run-evidence.mjs` and `phase5-mutation.mjs` (the rules forbid it);
- the b2-copy clinical probes, neighbors, differential, conformance and holdout (outputs read only).

**Caveats:**
- The runtime has no clinical-clearance API. The QE-R7C-01 clinical cases model clearance as the client continuing with the carried record and no clinical reference state. The R4 cases need no such assumption.
- The predecessor and mutant runs used `git archive` copies in the session scratchpad. The repository was edited only in this folder.

## Correction cycle and routing

- **Eligible:** QE-R7C-01 and QE-R7C-02 (DIRECT_R7C_DELTA, runtime only, inside the accepted semantics; no policy or catalog change).
- **Same cycle:** QE-R7C-03 (one line) and QE-R7C-04 (one test).
- **Disclose:** QE-R7C-05 and QE-R7C-06.
- **Then:**
  - directed tests;
  - the full suite;
  - `R7C-FREEZE-2`;
  - a narrow Engineering recheck of QE-R7C-01..04;
  - an SSCTR recheck of R1/C9, whose premise QE-R7C-02 falsifies, and of the answer path.
- **No escalation needed:** no product, policy or clinical decision.

R7C_ENGINEERING_GATE = NOT_READY
