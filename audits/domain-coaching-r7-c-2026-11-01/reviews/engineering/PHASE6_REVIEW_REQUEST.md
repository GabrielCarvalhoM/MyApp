# R7-C Phase 6 — Engineering review request (on R7C-FREEZE-3, QE-R7C-07)

You are a fresh, independent engineering judge (`quality-reliability-engineer`). You did not author this runtime, its Phase 6 fix, its tests or its evidence. Your predecessor's recheck of R7C-FREEZE-2 is [ENGINEERING_RECHECK_R7C.md](ENGINEERING_RECHECK_R7C.md) (with its JSON): **NOT_READY** on **QE-R7C-07** (BLOCKER, `DIRECT_R7C_DELTA`), with QE-R7C-08 (minor, pre-existing) and QE-R7C-09 (observation).

The Founder's Phase 6 has one objective: close QE-R7C-07. **There is no correction loop in this phase:** a new blocker from this review closes R7-C as `CLOSED_NOT_READY`. You are the phase's main gate.

## Rules

- Write only under `audits/domain-coaching-r7-c-2026-11-01/reviews/engineering/`: your deliverables `PHASE6_REVIEW_R7C.md` and `PHASE6_REVIEW_R7C.json`, and any probes under `probes/phase6/`. No commits, no git state changes, no edits to `CoachingCore/`.
- Run `node CoachingCore/scripts/verify-r7c.mjs --revision 3` (add `--suite` to re-run the suite) before and after your work; never with `--write`. Never run `npm run verify` or any other `verify-r*` script.
- Other revisions' bytes: extract them with `git archive` into a folder of your own outside the repository (copy `CoachingCore/node_modules`). Do not open the authoring session's scratchpad (`C:\Users\carva\AppData\Local\Temp\claude\C--Users-carva-Desktop-myApp-MyApp\a9736ead-4ba9-4430-b704-18f03e641f9c\`).
- No product, policy, catalog or clinical decision is yours or needed; name one if you find it.

## Bytes to judge

- **R7C-FREEZE-3:** record `CoachingCore/r7/c/RUNTIME_FREEZE_R7C_3.json`, sha256 `e21da973802483f215622b88433b980e4f2241a07097ef777196c3794eae0f36`.
  - Commit of the bound bytes: `08c6db352d102e2b33ed7e834cff980248b90299`.
  - Source digest `764ad023d1f7dc0bf0b74dedccdc5f54a1dc5300770e125327889cc1b0284b38`; manifest digest `ebc8af2f578047c7fb3487ec398d1fe79ec8d0f7aff1e4437d5c153e5212bbaa`; 163 files; 866 tests.
  - Verifier `--revision 3 --suite`: 20/20 PASS ([report](../../../../CoachingCore/r7/c/VERIFICATION_R7C_3.json)). Handoff: [R7C_HANDOFF.md](../../../../CoachingCore/r7/c/R7C_HANDOFF.md).
- **Predecessor:** R7C-FREEZE-2, commit `a10cec04071be97e409f11a4f831f13eae0c9769` (its own verifier now fails `files-current` by design: superseded, not edited).
- **Delta:** `git diff a10cec04071be97e409f11a4f831f13eae0c9769 08c6db352d102e2b33ed7e834cff980248b90299 -- CoachingCore/src CoachingCore/test`.
  - `src/r6-adaptation.mjs` only:
    - `answeredOnRecord` and `unreadRunWeeks` (new);
    - `factualReplan`: the origin `RECORDED`, ordered after the ceiling re-plan, with C9's `uncredited` and the reason `RECORDED_REPLAN`;
    - the G01 guard in `evaluateProgram` now covers `RECORDED` as well as `CEILING`;
    - `evidenceState` exposes the gates it already read each week with (`gates`).
  - Tests: `test/r7c-phase6.test.mjs` (12 directed tests, new) and two classified fixture pins (below).

## The fix

QE-R7C-07's mechanism (your predecessor): `gapAnsweredBy` detects an answer only as a transition (the carried record against the same review's reports), and the ceiling re-plan only catches doses above the facts' single-run ceiling. An executed, mixed or adverse answer lifts that ceiling above the stale doses, so after a carrier recorded it nothing re-plans.

**`answeredOnRecord`** is the state-based form of `gapAnsweredBy`. Instead of "the record before this review's reports", it reads **the record without the run reports the stored plan did not read**:
- a week the plan only projected (the next week's RUN start is `CONDITIONAL_PLAN`) read none of its facts;
- a week a review closed (`WEEK_EVIDENCE`) read its runs as that review's recorded gates say. When every run gate it recorded holds and the evidence reducer, on the record as it stands, now reads a run of that week as executed (`ADVANCE`, `EARNED` or `REGRESS`), the review read no executed run there;
- any other start (intake, a return's entry, a review that read an executed run or recorded no gates) read the week.

If, on that record, the doses ahead depend on unreported training (`runGapInForce` asks), and on the record as it stands they do not, the stored doses were stored while the window was unknown and the facts now make it known. The answer week is then re-planned from the facts, as the direct answer does, before any handler decides. A clinical route still decides alone while it stands; a partial answer still asks.

**No new schema.** The inference uses the program's own start provenance, the closing decisions' recorded gates and the canonical record. The reducer only exposes the gates it already computed.

**Reach, and why it is forced.** The probe's clinical carrier models clearance as "the client continues with the carried record and no clinical reference state". After it, the persistent state is the program plus the canonical record. That is exactly the state of a path where the same facts arrived on time and the reviews left no trace (`KEEP`, or no review). So any carrier-independent rule must treat those states alike. Concretely:
- **Fires:** a stored plan that rests on projection over its whole run window (no evidence anchor in the window read an executed run) follows the record of that window at the first decision whose factual plan differs. Example: the R7-A judge's P51 history (KEEP reviews in weeks 2–4, weeks 5–6 reported day by day and never reviewed) now re-plans at week 7, and the Saturday-only lifts follow history (22 kg instead of the projected 24). Pinned by the `reach` test.
- **Does not fire (Property B kept):** a late report in a week whose review read an executed run; a skipped single review after reviewed weeks; never-reported weeks with the intake run in the window (QE-R7C-08's class); any return report.

**Classified test updates** (made after classification, no assertion changed): `test/r7asm-state-model.test.mjs` T1, T6, T6b, T7c and `test/r7asc-state-consumer.test.mjs` S3 failed on the fix, all from that P51 premise. Classification: **EXPECTED_SEMANTIC_UPDATE of the fixture only**.
- The fixture pin (commit `dca3f94`): week 4's review adopts a back squat logged 2.5 kg above the plan. That is an evidence anchor that read the week's runs, so the plan still runs ahead at week 7 and every assertion holds.
- The back squat is not one of the Saturday-only exercises these tests read.
- The pinned tests pass on R7C-FREEZE-2 bytes too (77/77 in the two files).

## Evidence (`../../probes/out/`, label `R7C-P6-fb75d5b`: the same src and test bytes as `08c6db3`)

Manifest `evidence.R7C-P6-fb75d5b.json`; mutation `mutation.R7C-P6-fb75d5b.json`. The freeze record's `evidence` block holds every output's SHA-256.
- **Supplementary:**
  - your predecessor's reach grid `rc-p2`, run with `QE_ROOTS` F1 = R7C-FREEZE-2 bytes and F2 = this runtime: 540/540 decisions identical, so QE-R7C-08's class is untouched;
  - `rc-p5`: this runtime's reading is identical to the recorded one (QE-R7C-09);
  - files `rc-p2-reach-R7C-FREEZE-2-vs-R7C-P6.R7C-P6-fb75d5b.json` and `rc-p5-uncredited-premise.R7C-P6-fb75d5b.json`.
- **What the phase caught in itself:** a first evidence and mutation run (on `9b3a9ae`) showed the G01 witness test vacuous. P6-M6 was killed only by the D4 test, because the end-of-week review has no session ahead. The test was fixed in `1a237ad`, both runs were redone, and the first run's outputs were discarded.

In short:

| Check | On FREEZE-3 | On FREEZE-2 |
|---|---|---|
| Recorder independence (your predecessor's `rc-p4`, 160 cells) | **0 / 160** (EXEC 0, MIXED 0, ADVERSE 0, MISS 0, PARTIAL 0) | 72 / 160 |
| Directed tests `r7c-phase6` | 12 / 12 | — |
| Full suite | 866 / 866 | 854 / 854 |
| Differential against FREEZE-2 (`phase6-differential.mjs`: the cycle's 99 scenarios plus mid-week unreported, late single report, skipped review) | 120 / 120 identical | — |
| SD grid, SD-01 check, G02 | byte-identical to FREEZE-2 | — |
| G01 | 0 violations, P1 165/0, grid B 46/46. Grid A: 4 rows move from OK_INDEPENDENT to OK_HOLD_LIKE_REVIEWED_MISS (late facts carried by a schedule change after KEEP weeks are now applied; EXEC unchanged) | 0 violations |
| Clinical (K6, K6b, CAND-01/02, inherited adversarial), conformance R7-B / R7-B.1 / R7-B.2 | in the manifest | PASS |
| Mutation (isolated copy; repository untouched) | Phase 3 set 17/18 + G02-M4 equivalent (witness killed); Phase 4 rules 8/8; SD 6/6; correction cycle 9/9 (CC-M2 and CC-M8 fragments follow the new text, same mutations); **P6-M1..M7 7/7** | the same earlier sets |

## Questions (mandatory)

1. Is QE-R7C-07 closed for EXEC, MIXED and ADVERSE answers?
2. Is recorder independence 0/160 (rerun the grid yourself)?
3. Does plan validity never present a stale projection as valid?
4. Does the clinical carrier work after clearance without a re-send, and is nothing prescribed while the route stands?
5. Is no past history rewritten?
6. Does the carrier's identity never alter the factual semantics? Please judge the reach above: is it the necessary consequence of carrier independence on state, and is the fixture-pin classification right?
7. Are QE-R7C-08 and QE-R7C-09 still correctly classified, neither hidden nor absorbed?

**Known edge, pre-existing and unchanged, to classify.** The transition path (`gapAnsweredBy`, accepted SD-01) lets its re-plan travel beside an `UNREPORTED_TRAINING` question about a later week.
- **Reproduction:** GEN week 7; the answer has only the oldest in-window long run done and the rest not done; it is delivered inside a day-4 schedule change whose re-plan from next week asks about next week's window.
- **Result:** ASK with a proposal. The same answer recorded by a clinical route and then the same change gives ASK with no proposal: the new path's G01 guard, killed as P6-M6.
- **Same on R7C-FREEZE-2 bytes**, both ways. Either way the result is `REQUIRES_RECONCILIATION`, never valid (C2). Phase 6 did not touch the transition path.

## Deliverable

Gate: `READY`, `READY_WITH_CONDITIONS` or `NOT_READY`, with findings (id `QE-R7C-1x`, severity, `DIRECT_R7C_DELTA` yes/no, reproduction), what you re-ran and what you did not.
