# R7-D Phase 3.1 — request for the narrow SSCTR recheck and the narrow engineering check

**Candidate:** branch `claude/domain-coaching-r7-d`, runtime bytes of commit `1357638`.
- **Runtime delta from R7D-FREEZE-1** (`4cabd18`): one source file, `CoachingCore/src/r6-adaptation.mjs`. See `git diff 4cabd18 1357638 -- CoachingCore/src`.
- **New test file:** `CoachingCore/test/r7d-phase31.test.mjs` (14 tests).
- **Two existing assertions updated** (disclosed below): `test/r7a1-composition.test.mjs` and `test/r7c-phase5-cc.test.mjs`.
- No policy, catalog, record, queue, `product/` or `canon/` byte changed.

**Authority:** `../AUTHORIZATION_PHASE31.md` (Founder D1–D4, summarized).
- D1: correct QE-R7D-P3-01, narrowly; no envelope; no consumer requirement that the athlete repeat the break.
- D2: a declared interruption is a fact whatever event carried it. **Fact retention ≠ decision application.**
- D3: clinical first, unchanged.

There is no correction loop after these reviews. A blocker means no freeze: the phase closes with that blocker named.

**The finding being corrected:** QE-R7D-P3-01 (a), (b) and P3-F01, as `../../phase3/reviews/engineering/ENGINEERING_CHECK_R7D_PHASE3.md` and `../../phase3/reviews/ssctr/SSCTR_PHASE3_RECHECK_R7D.md` describe them (flagged behaviours 1, 2 and 5).

## The rule (runtime, `r6-adaptation.mjs`)

- **Recording.** A review that states a break records it in the completed-work record as a row `{fact:'INTERRUPTION_DECLARED', eventId, eventKind, athleteId, declaredAt, interruption, inputHash, provenance}`, whatever it decides (`newDeclaration`; `keep` on the early returns).
  - "States a break" means an `interruption` object with at least one field with a value, whose stated start is not after the review.
  - This includes the early returns: a clinical eligibility flag, an eligibility to assess, a post-race check, a standing clinical route or a generic RECOVERED question.
  - Not on integrity refusals.
  - A replay of the same event id adds nothing.
- **Retention** (`retainedBreak`). The latest well-formed declaration made by the decision clock stays in force until a return (REESTABLISH) is decided at or after it. A newer declaration replaces an older one. A row that is another athlete's, has no clock, or whose facts no longer match its own hash is carried but never read.
- **Reading.** A review that states no break reads the retained one as if it stated it (`review = {...input, interruption}`). So, through the existing code paths:
  - a WEEKLY_REVIEW or RETURN_AFTER_PAUSE applies it by the existing return handler: same screens, same class, same re-entry;
  - another event kind gets the DX-02 question and nothing of the event is applied. Its message now says the break is recorded and need not be stated again; the missing input is still `interruption.reportedOnItsOwn`;
  - clinical first is untouched: the eligibility and standing-route returns come before any of this, and a break with a clinical reason is screened clinical at every decision (F08).
- **Identity.** The return that applies a kept break records `declaredBy` and is named, as an episode, by the report that first stated it. A correction can therefore name it with `episodeId`.
- **The record.** Execution normalization, binding, learning and `historicalStateOf` never see these rows.

## Directed tests (`r7d-phase31.test.mjs`, 14/14)

| Test | Founder item |
|---|---|
| T1 (2 tests): another event carries the break; the next plain review re-enters exactly as the break stated there; later other-kind events are asked | Case A, T1 |
| T2 (3 tests): clinical flag (4 flags × 4 kinds), pain substitution, clinical-reason break (F08) | Case B, T2 |
| T3: P3-F01 through a pain substitution, clearance, first review; equal interruption facts, class, entry and sessions ahead to the direct answer | Case C, T3 |
| T4: sibling event (schedule, goal, equipment) never applied with the break; sent again after the return, applied | Case D, T4 |
| T5: replay, re-send while kept, no double return | T5 |
| T6 (2 tests): newer declaration replaces; applied break corrected by `episodeId` = first report | T6 |
| T7 (2 tests): later flag, pain substitution, standing route, unknown eligibility; all 19 kinds | T7 |
| Record (2 tests): row shape, append-only, never an execution report, tamper-ignored; future-start and template not recorded; determinism | §4 |

On R7D-FREEZE-1, 13 of the 14 fail for the retention reason. The 14th (future start, template, determinism) behaves the same on both.

## Existing assertions updated (please judge)

1. **`r7a1-composition.test.mjs` "R7-A.1 C4/C5 … in either order".**
   - In its UNAVAILABLE_DAY pair, the 16-day return asks `interruption.startedAt` (a strength session on the break's first day).
   - On R7D-FREEZE-1 the break was then dropped, and the unavailable day was applied VALID on the plan that ignored it. Commutativity held only because both orders dropped the break.
   - Now the day sent after the asking return is asked (`interruption.reportedOnItsOwn`). The test supplies the start time in both orders, re-sends the day where it was asked, and asserts the same week and the same next start, which holds.
2. **`r7c-phase5-cc.test.mjs` "QE-R7C-01 …", last block.**
   - An illness RETURN_AFTER_PAUSE carrying an answer, then clearance. It asserted VALID at the next plain review (R7D-FREEZE-1 dropped the illness break).
   - Now the kept illness break routes clinically again: CLINICAL_HUMAN_REQUIRED, no proposal, answer and break still recorded. This is the same as stating that break again (SSCTR D10-cl6; F08).

Both fail on R7D-FREEZE-1 and pass on the candidate (evidence `red.updatedAssertions`).

## Instruments (registered before any holdout exists)

| Instrument | What changed |
|---|---|
| `../../harness/` R7D-HARNESS-3 | P17 (a, c); RESTATE_DECLARED_BREAK (b); P03/P10 for the new row; P11/P12 ignore a change request its own decision asked about or refused (Δ5, precision); packet renders a kept break |
| `../../PREREGISTRATION_R7D_3.md` | Δ1–Δ9 |
| `../../author/INTERFACE_DELTA_R7D_3.md` | The public rule |
| `../../author/AUTHOR_BRIEF_FINAL_R7D_2.md` | Freeze 2, interface 3, coverage items 8–9 |

## Evidence (on these runtime bytes; `../evidence/EVIDENCE_PHASE31.json`)

- **Tests:** suite 921/921; directed 14/14; conformance R7-B, R7-B.1 and R7-B.2 PASS.
- **Mutation** (`../evidence/MUTATION_PHASE31.json`): 6/6 killed, each by its own witness:
  - lost after ASK;
  - lost at clearance;
  - the P3-F01 answer dropped;
  - the sibling applied;
  - applied twice;
  - a newer declaration ignored.
- **Harness validation 3** (`../../harness/validation/HARNESS_VALIDATION_R7D_3.json`):
  - no false block;
  - 10/10 sensitivity defects detected, including QE-R7D-P3-01 (a) and (b) by P17/RESTATE and P3-F01 by CARRIER_CLINICAL on R7D-FREEZE-1, each clean on the candidate;
  - coverage: P17 16 units, RESTATE 4, CARRIER_CLINICAL 7, CARRIER_HOLD 1, RESEND 20;
  - 37/37 witnesses.
- **Regressions** (`../regression/`), regression only:
  - diagnostic corpus: P01–P17 with 0 violations (P17 9 units, RESTATE 3); VARIANT 4, the triaged set; CE-01;
  - generated sample: 0 violations.
- **Differential against R7D-FREEZE-1** (`../evidence/DIFFERENTIAL_VS_R7D_FREEZE_1.json`): 141 cases, 137 identical. The 4 differing cases are DEV-18–21, each after an unapplied stated break. 0 unexplained; no diagnostic or generated case differs.

## Questions

**SSCTR (narrow; the Founder's question).** Does retaining an already-declared interruption across ASK and clinical routing, without applying a prescription until authority permits it, preserve the approved return/re-entry and clinical-first semantics? Please cover:
1. **The re-entry from a kept break** (T1, T2, T3) is the existing R6-NONCLINICAL-RETURN recipe at the first eligible review, as if the break were stated there. It adds no number. A break with no end date ends the day before that review, so held days count as break.
2. **A break whose own reason is clinical** routes to a human at every later decision, also after qualified clearance. Previously a plain review after clearance was VALID on the pre-break plan. Acceptable under F08?
3. **While a break is kept**, any other event kind (a fatigue report included) is asked and not applied until a return report or weekly review applies the break. Is that safe, or is an event's own signal lost in a way that matters?
4. **A newer declaration replaces an older unapplied one** even with different dates. The older break's days then count as silence (UNREPORTED_TRAINING and the D18 ceiling still apply).
5. **What is not kept:** a break that begins after its review, a template, the declaring review's current demonstration. The last one makes the entry more conservative.
6. **The two updated assertions above**, from the domain side.

**Engineering (narrow).** Review:
- factual persistence: the record row, append-only, the integrity filter;
- no stale-plan resurrection;
- event separation;
- duplicate, replay and correction semantics;
- the new property and oracle (P17, RESTATE), including whether Δ5 (P11/P12) weakens anything and whether P03/P10 cover the new row;
- the regression and differential, including whether any difference falls outside the family;
- the two updated assertions;
- freeze readiness (`CoachingCore/scripts/freeze-r7d-2.mjs`, `verify-r7d-2.mjs`, not run yet).

Also say whether keeping the declared break's free-text `reason` in the carried record is a data-minimization matter for Security (it is what the consumer sent; no new recipient).

## Independence and outputs

- Neither of you wrote the runtime, the tests, the harness, PREREG-3 or the evidence. Do not open the other review's folder.
- Write only in your own folder:
  - SSCTR: `ssctr/SSCTR_PHASE31_RECHECK_R7D.{json,md}` and `ssctr/probes/`;
  - engineering: `engineering/ENGINEERING_CHECK_R7D_PHASE31.{json,md}` and `engineering/probes/`.
- Run probes only on scratch copies, never on the repository.
- The JSON is the structured record. It must carry `recordId`, `disposition` (SSCTR: ACCEPT, ACCEPT_WITH_CONDITIONS or BLOCK) or `verdict` (engineering: READY, READY_WITH_CONDITIONS or NOT_READY), `findings` and `conditionsForFreeze`.
- If you propose a human-revalidation item, put it under `proposedHumanRevalidation.item`, in the queue's item shape, without appending it.
