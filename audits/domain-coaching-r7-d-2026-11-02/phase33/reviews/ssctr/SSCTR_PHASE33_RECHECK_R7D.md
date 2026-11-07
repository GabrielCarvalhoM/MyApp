# R7-D Phase 3.3: narrow SSCTR recheck (`SSCTR-R7D-P33-RECHECK-r1`)

**Disposition: ACCEPT_WITH_CONDITIONS.** 2026-11-06. No BLOCK.

**Who.** A fresh SSCTR instance (AI agent, claude-opus-5-5, xhigh) under PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY: nonclinical sporting judgment only. No human review, and no clinical, human or empirical validation.
- It did not write the runtime, the tests, the witness, the harness, PREREG-5, the interface delta or the evidence.
- It did not open `phase33/reviews/engineering/`.
- Whether this was a native adapter dispatch was not verified.
- The structured record is [SSCTR_PHASE33_RECHECK_R7D.json](SSCTR_PHASE33_RECHECK_R7D.json). Where the two differ, the JSON prevails.

**What was judged.**
- **Candidate:** the runtime bytes of `3228a70`, `r6-adaptation.mjs` sha256 `15e4279b…`. HEAD `f74bb82` has the same `src` and `test` bytes.
- **Baseline:** R7D-FREEZE-3 (`faa3bc12…`), from my own copy of the coordinator's rebuild.

**What I ran** (scratch copies only; my rebuild came from the committed bytes):
- **Suite:** 952/952.
- **The witness:** `f01-witness.mjs`. My rerun is byte-identical to the committed candidate output.
- **My own probes:** four, each run on both runtimes. They are in [probes/](probes/), with outputs in `probes/out/`.

**Literature.** I used Europe PMC abstracts and one WebSearch; no full text. The sources are Hickson 1981, Spiering 2021, Mujika & Padilla 2000 I/II, Zheng 2022 (MA), Barbieri 2023, Houston 1979, Bosquet 2013 (MA), Bickel 2011 and Nielsen 2014. They support direction only. No number is taken from them.

## Answers

| # | Question | Verdict |
|---|---|---|
| 1 | F01 closure | **Closed on every path probed.** See below. |
| 2 | Direction B fidelity and authority | **Existing authority; no new number. Not a blocker.** See below. |
| 3 | The inverse defect | **Recognized where proven; one narrower residual (P33-F01).** See below. |
| 4 | Incomplete, unconfirmed, conflicting or adverse | **Correct direction.** See below. |
| 5 | Clinical first and F08 | **Intact.** See below. |
| 6 | I9, identities and causal relations | **Preserved.** See below. |
| 7 | Unknown training between | **Accepted.** See below. |
| 8 | The two updated assertions | **Both accepted.** See below. |
| 9 | The queue item | **No objection.** See below. |

**1. F01 closure.**
- No isolated execution erases the earlier break: one run, one strength session, every gap session, an aborted or partial run, or 30 days with one run (witness F1–F6).
- I also tried:
  - 7 complete sessions over 10 days in no whole plan week;
  - a chain of three breaks with one run between each;
  - a complete week, then one run, then a third break;
  - a later break that holds the rest of the week;
  - unknown sessions answered done.
- Each gives the stop declared once. R7D-FREEZE-3 gave SHORT with threshold work ahead on all of them.
- On the F01 forms, the doses equal the stop declared once and the holiday applied when stated: EASY 15, LONG 20, then 30/30/45, no quality.
- The continuous span is the right conservative reading for isolated training (SUPPORTED_WITH_LIMITS). It is not right for weeks of imperfect training: see P33-F01.

**2. Direction B fidelity and authority.**
- The test reuses the reducer's own `complete(sport)`, on the plan's own week. That is the rule by which an unreviewed week releases a step.
- ADVANCE is not phase-dependent, so taper and deload weeks can count.
- An unmoved SKIPPED session keeps its MISSED row, so a skip cannot complete a week.
- "Every sport" follows the accepted precedent NF-R7AB-1 / R40.
- No threshold, count, length, clinical criterion or dose is added. Two wordings overstate it (P33-F03).

**3. The inverse defect.**
- **Recognized:** E1, E2, E3, I3, the I5 control and both declaration orders give SHORT 4 from the executed doses. The doses equal R7D-FREEZE-3's (LONG 75, EASY 50/41).
- **Re-entry means tolerated dose, not restored capacity.** In Houston 1979, performance was still 9% below after 15 days of retraining.
- **Residuals:**
  - **Plan-week alignment:** acceptable and conservative.
  - **Every sport:** acceptable, with precedent. It is a progression cost, with no physiological basis for running.
  - **Reviewed week alone:** acceptable. HOLD gates mean the week was not executed as planned.
  - **Long imperfect adherence:** the inverse defect on a narrow path. This is **P33-F01**.

**4. Incomplete, unconfirmed, conflicting or adverse.**
- These re-enter nothing: a missed or partial session, break days in the week, unreported sessions (asked), conflicted reports (asked, then corrected), recovery ADVERSE, next-day function IMPAIRED.
- An adverse training response is not a clinical route, which is right.

**5. Clinical first and F08.** Each of these goes to a human with no proposal, on both runtimes:
- a clinical earlier break with a complete week between (F08: still clinical);
- a clinical later break;
- a pain flag at the review;
- T7.

**6. I9.**
- No break is joined and no declared days are summed. Records stay append-only.
- Either declaration order gives the same result, and a replay changes nothing.
- "Factual continuity, no duration added" is exact only for isolated training.

**7. Unknown training between.**
- It is asked even where no whole week fits. There the answer cannot change the class (MODERATE 21 either way), and a partial answer is asked again.
- That is conservative over-asking (O-01).

**8. The two updated assertions.**
- **The first:** a Monday strength session and a Tuesday run in 3 days are not a resumption. MODERATE 21 equals the stop declared once and the holiday applied when stated.
- **The second:** MODERATE either way is the correct consequence. The question still fixes the record, and it decides the class whenever a whole week fits.

**9. The queue item.**
- Append `HQ-R7D-SSCTR-P32-RECHECK` unchanged, naming R7D-FREEZE-3.
- Its trigger "a Founder decision on F01" has fired. That is recorded in my proposed item's links, not by editing the P32 item.

## Findings

| Id | Class | Finding | Reproduction |
|---|---|---|---|
| P33-F01 | **Domain residual, inverse direction, material, not blocking** | With an earlier break still unapplied, training between that completes no plan week in every sport counts as stop days, so the class rises with the training span. **Example:** a 14-day holiday, then two weeks with every run executed (long and quality included) and one strength session missed each week, then a 4-day trip. The candidate gives **LONG 32 RESTART** (EASY 15/20). The existing episode rule gives SHORT 4 at LONG 45; R7D-FREEZE-3 gave SHORT 4 at LONG 75. **Weekly reviews avoid it:** the first one applies the holiday. A single break applied late already ignores training after it (pre-existing, both runtimes) | `s2-inverse-defect.mjs` V1, V2, V3, V5; `s2b-single-break-baseline.mjs` B1–B5; V4 is the control |
| P33-F02 | **Consumer condition** (G03, Data) | A week executed in full whose strength sets lack reps in reserve never re-enters the athlete, for running too: MODERATE 25/27 instead of SHORT 4 | `s1-isolated-paths.mjs` I4, I5 against the I5 control |
| P33-F03 | **Disclosure correction** | Three wordings understate or overstate the rule:<br>• PREREG-5 Δ6 understates the long-adherence residual and calls it the existing no-step rule;<br>• INTERFACE-5 and the code say "the one rule by which training ever becomes history" (it is the rule by which an unreviewed week releases a step);<br>• "no duration added" is exact only for isolated training | Wording |

**Why P33-F01 does not block:**
- It is conservative and nonclinical.
- It needs three conditions together: an earlier break left unapplied across weeks, no complete plan week in every sport, and a later break.
- Δ6 discloses it, though it understates it.
- Every remedy needs authority the Founder has not given: per-sport re-entry (R40), a partial-adherence criterion, or a combination rule.
- Blocking would keep R7D-FREEZE-3's F01, which errs on the riskier side.

**Options for the Founder** (not decided here; no number):
- (a) on the non-re-entry branch, read the later break from the state the earlier break's own return would have set;
- (b) per-sport re-entry (R40);
- (c) accept the restart as the authorized conservative behaviour.

## Conditions for the freeze

| Id | Condition |
|---|---|
| CF-P33-01 | Bind this record by sha256 in R7D-FREEZE-4. It accepts only:<br>• the runtime bytes of `3228a70` (`15e4279b…`, every other source file equal to R7D-FREEZE-3);<br>• `r7d-phase33.test.mjs` (`99865332…`);<br>• the two T4 assertions in `r7d-phase32.test.mjs` (`2f4cdc44…`).<br>Any runtime byte change needs a new recheck. |
| CF-P33-02 | Disclose P33-F01 with no envelope in the freeze record, the handoff and a PREREG-5 post-review addendum:<br>• the quantified example;<br>• the class grows with the training span;<br>• the pre-existing single-break behaviour.<br>Correct the P33-F03 wordings. |
| CF-P33-03 | Before the holdout is commissioned, tell the Founder:<br>• F01 is closed on every path probed;<br>• P33-F01 exists, and no instrument detects it;<br>• the Founder should decide beforehand whether a restart on that path counts as a domain failure;<br>• its remedy needs the Founder's authority. |
| CF-P33-04 | Consumer conditions (G03 with Data):<br>• let the week's review apply a declared break; after a bulk sync, run the plain review before a newer break is added;<br>• invite the athlete to state breaks when they happen;<br>• capture reps and reps in reserve for every strength exercise;<br>• present `reentryWeek` as resumed executed doses, never as restored fitness;<br>• explain `TRAINING_NOT_REESTABLISHED` in plain words, with no number. |
| CF-P33-05 | State that this phase adds no new dose, threshold, count, length, increment, tolerance, cadence, recipe or clinical authority. Shadow reference only; V1 authority stays NO. |
| CF-P33-06 | Queue:<br>• in this phase, append only `HQ-R7D-SSCTR-P32-RECHECK`, unchanged, naming R7D-FREEZE-3, by its owner;<br>• the item proposed below waits for its own authorization. Never this instance. |
| CF-P33-07 | Route:<br>• P33-F01, with B1–B4, to the Founder/PCG before the holdout;<br>• P33-F02 to G03 and Data;<br>• P33-F03 to the freeze record and the interface owner.<br>P32-F02, F03 and F04 and F08 stay routed as before. |

## Funded-human revalidation

**Proposed only:** `HQ-R7D-SSCTR-P33-RECHECK`, QUEUED_FOR_FUNDED_HUMAN_REVALIDATION, owner Chief / Founder, naming R7D-FREEZE-4.
- Linked to the P32, P31, P3 and F03B items.
- The queue was not touched (233 items).

## Status

- **Gate:** not closed by this record.
- **Publication:** not published; not Product Truth.
- **Clinical:** no clinical judgment was made.
- **`validate_records.py`:** not run, because Python is not installed here.
- **Scratch:** I extracted one read-only copy, `cand-r6.mjs`, into the scratchpad root before creating my own directory. Nothing was deleted.
- **Review by 2027-05-06,** or earlier on any of:
  - a runtime byte change;
  - a decision on P33-F01, F08, G03 or per-sport re-entry;
  - a holdout result touching P18, TRAINING_BETWEEN_BREAKS, TRAINING_NOT_REESTABLISHED or P08;
  - a new SR/MA;
  - an adverse event;
  - human revalidation.
