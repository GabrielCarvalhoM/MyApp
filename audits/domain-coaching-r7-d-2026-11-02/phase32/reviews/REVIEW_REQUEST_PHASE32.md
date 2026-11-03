# R7-D Phase 3.2 — request for the narrow SSCTR recheck and the narrow engineering check

**Candidate:** branch `claude/domain-coaching-r7-d`, runtime bytes of commit `dfd8779` (`CoachingCore/src/r6-adaptation.mjs` sha256 `faa3bc12…`).
- **Runtime delta from R7D-FREEZE-2** (bound files `88d2495`): one source file, `r6-adaptation.mjs`. See `git diff 88d2495 dfd8779 -- CoachingCore/src`.
- **New test file:** `CoachingCore/test/r7d-phase32.test.mjs` (17 tests).
- **Two existing assertions updated** (disclosed below): `test/r7d-phase31.test.mjs` T6 and `test/r7a1-composition.test.mjs` C4/C5.
- No policy, catalog, record, queue, `product/` or `canon/` byte changed.

**Authority:** `../AUTHORIZATION_PHASE32.md` (the Founder's Phase 3.2 decision, summarized). The rule:
- a newer interruption declaration replaces an older unresolved one only when it explicitly identifies itself as its correction (the existing `episodeId` mechanism);
- otherwise the older one stays a fact: no last-write-wins, no merge, no inference from dates (I9 preserved);
- the relation (correction or separate) is asked before any dependent return;
- separate breaks stay separate facts, read by factual continuity;
- clinical first is unchanged;
- F08 is `KNOWN_FAIL_CLOSED_AUTHORITY_BOUNDARY`, outside this phase.

There is no correction loop after these reviews. A blocker means no freeze: the phase closes with that blocker named.

**The defect being corrected:** SSCTR-P31-F02 (`../../phase31/reviews/ssctr/SSCTR_PHASE31_RECHECK_R7D.md`; probes `p4-newer-replaces.mjs`, `p4b-correction-ends-kept.mjs`).

**The witness** (`../probes/f02-witness.mjs`, outputs in `../probes/out/`):
- **On R7D-FREEZE-2 (RED, recorded before the change):**
  - W1 (holiday kept, trip by a carrier, plain review) and W2 (the trip stated by the weekly review) both re-enter SHORT 7 days: EASY 45/34, LONG 65, THRESHOLD 41.
  - W3, the 21-day comparator declared once, is MODERATE: EASY 15/15, LONG 20.
  - W4 (the p4b correction) loses the kept break.
- **On the candidate:** W1 and W2 ask INTERRUPTION_RELATION (plan not valid), W3 is unchanged, and W4 asks the correction first, then applies the kept break.

## The rule (runtime, `r6-adaptation.mjs`)

- **`keptBreaks`** (replaces Phase 3.1's `retainedBreak`) reads the breaks on record that no return has applied, plus the one this review states, as interruptions. Two reports are one interruption only when:
  - one names the other (`episodeId` = the other's name or the event id that stated it), or
  - they state the same facts apart from the name (an exact replay).

  Dates never join two reports. Each interruption has:
  - an identity: its latest name, else its first report's event id;
  - its reports in order, and the one in force (the latest);
  - `named`;
  - `applied`: its name is a recorded return's (a correction of an applied break), or it is a replay of an applied report.
- **One interruption:** exactly Phase 3.1 (the latest report is read as if stated; the review's own break is read as itself).
- **Several:**
  1. **Clinical first.** If any one's report in force screens clinical, the review reads it, so `clinicalRoute` (the anchored line, unchanged) routes to a human. Eligibility flags, the standing route and substitution pain still come earlier, unchanged.
  2. **The relation question.** Any later interruption that is not named gets INTERRUPTION_RELATION (`missingInputs ['interruption.episodeId']`) first in `decide`, before the carrier ask, stale return or handler. A kept correction of an applied break counts as an earlier break here.
  3. **A correction of an applied break stated while a break not applied is on record** is asked (B4 read over declarations). A kept one is not read when the other break's return is decided: `notApplied`.
  4. **Two or more not-applied interruptions, each later one named, are separate.** The review reads the one ending latest, and the return calls `separateStop`:
     - every break is screened and read as the return reads its own;
     - the stop runs back from the latest end through each earlier break whose days reach or touch it, or with nothing trained between (every planned session between reported not done, or none planned);
     - recorded training between them ends the stop;
     - unreported planned sessions between them get TRAINING_BETWEEN_BREAKS (`unreported.sessionIds`).

     The return records the stop's dates, days and class, and `separateBreaks` (each break's identity, dates and place: LATEST, OVERLAPS, TOUCHES, NO_TRAINING_BETWEEN or TRAINING_AFTER). The recipe is the unchanged R6-NONCLINICAL-RETURN. The entry is read at the stop's start.
- **Refactor, behaviour-preserving:** `readBreak` is the return handler's own fact validation, extracted; the single-break path is byte-identical in behaviour. The `again` replay check also accepts the facts of any break listed in `separateBreaks`, so replaying the answering review is a KEEP.

## Directed tests (`r7d-phase32.test.mjs`, 17/17)

The 20-item matrix maps as follows.

| Matrix items | Test |
|---|---|
| 3, 7, 8, 9 (F02 witness; contiguous, overlapping and disjoint; plain review, weekly review, return report) | T1 (F02 witness) |
| 10 (partial newer) | T1 partial |
| 1 | T2 (explicit correction) |
| 15 (correction after the relation question) | T2 (correction after the question) |
| 2 and 14 (replay; relation resolution then replay) | T3 (two tests) |
| 5, 7, 9, 16 (touching and overlapping as one continuous stop, equal to the once-declared 21-day stop) | T4 (touching / overlapping) |
| 4 and 5 (training known or none between) | T4 (between) |
| 6 (unknown between: asked; answer decides) | T4 (unreported) |
| 16 and 20 (return report applies both; order invariant) | T4 (return report, either order) |
| 11 and 12 (clinical older or newer) | T5 (clinical first) |
| 13 (flag, substitution or standing route while the relation is unresolved) | T5 (while unresolved) |
| F08 characterization | T5 (F08) |
| 17 (applied break then a new one; p4b) | T6 (two tests, both orders) |
| 18 (event separation) | T7 |
| 19 and 20 (determinism, append-only, history) | T8 |

**On R7D-FREEZE-2**, the F02 tests fail. Characterization tests (explicit correction, exact replay, clinical flag, F08, determinism) pass on both runtimes; see the evidence `red.directedOnFreeze2`.

## Existing assertions updated (please judge)

1. **`r7d-phase31.test.mjs` T6** ("a newer declaration of the break replaces a recorded one not applied yet"). It asserted that an unnamed newer declaration (the second week of a kept 14-day break) replaces the kept one: the F02 behaviour.
   - Now the plain review asks INTERRUPTION_RELATION.
   - The same correction, naming the kept break's report, replaces it (SHORT, 7 days).
   - Title extended: "… when it names it (R7-D Phase 3.2: unnamed, it is asked)".
2. **`r7a1-composition.test.mjs` C4/C5** ("a waiting or event-conflict day … in either order"). Its corrected return report (the same 16-day break plus `startedAt`) did not name the break it corrected. Now it names it (`episodeId` = the first report's event id). Unnamed, the relation would be asked.

Each assertion as it stood at R7D-FREEZE-2 fails on the candidate. T6 as updated fails on R7D-FREEZE-2. C4/C5 as updated passes on both (a named correction behaves as in R7D-FREEZE-2). Evidence: `red.updatedAssertions`, `red.assertionsAsAtFreeze2`.

## Instruments (registered before any holdout exists)

| Instrument | What changed |
|---|---|
| `../../harness/` R7D-HARNESS-4 | **P18** (a) every open break accounted for at a return, (b) the relation stated; **INSERT_NEWER_BREAK** (a newer unnamed break in a review that applied a kept one: no return, not VALID); RENAME also renames `interruption.episodeId`, which fixes a false FAIL on DEV-23; the client answers TRAINING_BETWEEN_BREAKS like UNREPORTED_TRAINING; the packet lists every kept break; P18 skips exact replays |
| `../../PREREGISTRATION_R7D_4.md` | Δ1–Δ8 (Portuguese, like the PREREG series) |
| `../../author/INTERFACE_DELTA_R7D_4.md` | The public rule |
| `../../author/AUTHOR_BRIEF_FINAL_R7D_3.md` | Freeze 3, interface 4, coverage item 10 (multiple breaks, able to expose the old F02) |

## Evidence (on these runtime bytes; `../evidence/EVIDENCE_PHASE32.json`)

- **Tests:**
  - suite 938/938;
  - Phase 3.2 directed 17/17, Phase 3.1 directed 14/14;
  - conformance R7-B, R7-B.1 and R7-B.2 PASS.
- **Mutation** (`../evidence/MUTATION_PHASE32.json`): 8/8 killed, each by its own witness:
  - last-write-wins;
  - automatic merge (the relation never asked);
  - partial newer drops the older;
  - "separate" with the older ignored;
  - unknown between read as no training;
  - unknown between read as resumed training;
  - clinical bypassed by the relation question;
  - the p4b correction applied across a kept break.
- **Harness validation 4** (`../../harness/validation/HARNESS_VALIDATION_R7D_4.json`):
  - no false block;
  - 13/13 sensitivity rows, including F02 by P18 (DEV-22/23/24) and by INSERT_NEWER_BREAK (DEV-18/20), and the F03 relabel path by P18 (DEV-25), all on R7D-FREEZE-2 and clean on the candidate;
  - coverage: P18 6 units, INSERT 4, P17 39, RESTATE 13, CARRIER_CLINICAL 7, CARRIER_HOLD 1, RESEND 24;
  - 42/42 witnesses.
- **Regressions** (`../regression/`), regression only:
  - diagnostic corpus: P01–P18 with 0 violations; VARIANT 4, the triaged set; CE-01;
  - generated sample: 0 violations.
- **Differential against R7D-FREEZE-2** (`../evidence/DIFFERENTIAL_VS_R7D_FREEZE_2.json`): 145 cases, 141 identical.
  - The 4 differing cases are DEV-22 to DEV-25, each from the review that states a second break while one is open. 0 unexplained.
  - R7D-D10 meets the trigger (three unnamed reports of the same flu break) and is identical: clinical first, then F08.

## Questions

**SSCTR (narrow). Judge only:**
1. **F02 factual preservation.** No older open break leaves factual authority (W1, W2, W4; T1; P18).
2. **Separate versus corrected episodes.**
   - Is the answer protocol right: the newer break re-sent with the earlier break's `episodeId` (correction) or its own (separate)?
   - Is "the same facts apart from the name are one declaration" acceptable as the exact-replay rule?
3. **Whether any new dose or clinical authority was accidentally introduced.** The return is the unchanged recipe, classed by the stop the facts establish.
4. **Return conservatism.** The touching/overlapping stop equals the once-declared stop (T4). With recorded training between, the later break alone, from what was actually done. Please judge two cases:
   - **Rest days only between two breaks** count as no training. This is the conservative side: a longer stop, a more conservative class. The model's training is plan sessions (Founder 0.3).
   - **A conflicted report between** is treated as unreported (asked).
5. **Clinical first** (T5; DEV-25; R7D-D10).
6. **The relationship with I9.** Dates never join; equal dates with different facts are asked, unlike rule 3 (DUPLICATE) for applied returns, which is unchanged.
7. **Unknown training between interruptions** (T4 unreported; TRAINING_BETWEEN_BREAKS is always asked when a planned session between them has no report).
8. **F08 unchanged.** A clinical-cause kept break stays clinical. A newer unnamed nonclinical break no longer replaces it (it did on R7D-FREEZE-2: the F03 relabel path, now closed). A named correction that changes the reason is read as on R7D-FREEZE-2 (T5 characterization). Is that acceptable inside `KNOWN_FAIL_CLOSED_AUTHORITY_BOUNDARY`, or must it be disclosed differently?

Also the two updated assertions, from the domain side.

**Engineering (narrow). Judge only:**
- append-only provenance;
- multiple unresolved interruption facts (grouping, identity, `applied`);
- correction and replay semantics;
- relation ASK propagation (every event kind, clinical precedence, `decide` order, `heldByRunGap` pass-through);
- no last-write-wins;
- no double application;
- determinism;
- differential containment;
- test, property and mutation adequacy (P18 and INSERT, including whether they could block a correct holdout);
- no regression of Phase 3.1 (P17, RESTATE, the single-break path);
- the two updated assertions;
- freeze readiness (`CoachingCore/scripts/freeze-r7d-3.mjs`, `verify-r7d-3.mjs`, not run yet).

**Known usability cost.** A corrected re-send without `episodeId` (after a question about a break's reason or dates) gets one extra question, the relation. That is the Founder's rule; the interface asks the consumer to name corrections.

## Independence and outputs

- Neither of you wrote the runtime, the tests, the harness, PREREG-4 or the evidence. Do not open the other review's folder.
- Write only in your own folder:
  - SSCTR: `ssctr/SSCTR_PHASE32_RECHECK_R7D.{json,md}` and `ssctr/probes/`;
  - engineering: `engineering/ENGINEERING_CHECK_R7D_PHASE32.{json,md}` and `engineering/probes/`.
- Run probes only on scratch copies, never on the repository.
- The JSON is the structured record. It must carry `recordId`, `disposition` (SSCTR: ACCEPT, ACCEPT_WITH_CONDITIONS or BLOCK) or `verdict` (engineering: READY, READY_WITH_CONDITIONS or NOT_READY), `findings` and `conditionsForFreeze`.
- If you propose a human-revalidation item, put it under `proposedHumanRevalidation.item`, in the queue's item shape, without appending it. This phase has no queue authorization.
