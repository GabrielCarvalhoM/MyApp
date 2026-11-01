# R7-B.2 Engineering review — R7B2-ENG-r1 (the one review, on R7B2-FREEZE-1)

| | |
|---|---|
| Freeze | R7B2-FREEZE-1. Record `CoachingCore/r7/b2/RUNTIME_FREEZE_R7B2_1.json`, sha256 `8d51def5…fee` (checked). Freeze commit `1a1c728`, bytes of `63fa602`. |
| Source / manifest | `57512322…ecbd` / `f9c5bd5a…ceca`; 122 files, 799 tests |
| Identity | `node CoachingCore/scripts/verify-r7b2.mjs --tests`: **35/35 PASS before, 35/35 PASS after** (after every probe and the cleanup). Worktree HEAD `0c73605`; since the freeze only `r7/b2/VERIFICATION_R7B2_1.json` was added. |
| Predecessor | R7B1-FREEZE-2 (`146ebb8`) extracted with `git archive` into a temporary directory outside the repository. All 114 files of its freeze record match. Deleted afterwards. |
| Judge | A fresh, independent `quality-reliability-engineer`, `claude-opus-5-5` / `xhigh`. I fixed nothing and wrote only in this folder. I judged the routing, not the clinical content. |
| Record | [ENGINEERING_REVIEW_R7B2.json](ENGINEERING_REVIEW_R7B2.json); probes in [probes/](probes/), their outputs in `probes/out/` and `probes/r7b1/out/` |

## Verdict: READY, and the §5 condition is reopened

**QE-R7B1-04 is closed correctly.** On the frozen bytes:
- once a review is admitted, the clinical route its own handler's screen would take is the decision. It comes before R7-A's late-evidence question, the factual re-plan's question, the block-choice questions and the return's report-identity question;
- the route is exactly the handler's own;
- the late evidence is still recorded, and a later review still asks about it;
- every review that carries no clinical signal decides exactly as it did on R7B1-FREEZE-2;
- no R7-B.1 closure regresses;
- no new route bypasses the clinical screen, and I found no false clinical route.

No runtime change is requested.

**But the contract §5 condition does not hold on my evidence (QE-R7B2-01).** Take a return report resent under the event id of a recorded return, giving a clinical reason, in a review that also corrects last week's reports:
- FREEZE-2 answered with the report-identity question and attached the factual re-plan proposal to it;
- R7-B.2 routes to CLINICAL_HUMAN_REQUIRED with no proposal;
- once each result is applied, the prescriptions of weeks 5–11 differ.

R7-B.2's output is the correct one: a clinical route proposes nothing (QE-R7B1-01; QE-R7ADA-01). But this is not "a nonclinical question replaced by CLINICAL_HUMAN_REQUIRED, with no proposal on either side", and a prescription differs. **Under contract §5 and §7 G4, the SSCTR review is now required, and Quality needs one narrow independent review.** This Engineering READY does not stand in for either of them.

## Q1. Does clinical screening now reliably precede the late-evidence question? Yes.

**K6 and K6b**, verbatim copies (the sha256 values match the R7-B.1 originals):
- On FREEZE-2 both FAIL as recorded:
  - substitution pain, pain with a ladder step, and pain with an unrecognised choice each get ASK;
  - K6b's pain-only step gets ASK.
- On R7-B.2 both PASS. Every one of those rows is:
  - CLINICAL_HUMAN_REQUIRED with no proposal;
  - pending CLINICAL_HUMAN_REQUIRED;
  - given the handler's reason ("Pain, injury, illness or a functional limitation with db-rdl…").
- The controls are identical on both runtimes.

**The `q1q2-matrix.mjs` matrix, one review.** It crosses 12 substitution signals with 9 choice shapes, and adds 5 return signals with 3 choice shapes, 123 cases in all:
- **Substitution signals:**
  - `pain:true`, `injury:true`;
  - pain as `'yes'`, `'SIM'`, `1` or `' Yes '`, and injury as `'Y'`;
  - three clinical free texts, in English and Portuguese;
  - pain with no reason given, and pain with `nonclinicalConfirmed`.
- **Choice shapes:** none, an empty list, a ladder step, a declined graduation, an accepted graduation, a main change, an unrecognised choice, a null entry, a string entry.
- **Return signals:** illness, the INJURY category, `clinicalReason` as `true` or `'yes'`, and the alias kind `RETURN`.

All 123 cases pass, each with:
- CLINICAL_HUMAN_REQUIRED, no proposal, no missing inputs;
- pending CLINICAL_HUMAN_REQUIRED with the same reason;
- the reason and the counterfactuals of the same review without the late report, which is the handler's own route and is the same on both runtimes;
- the late report recorded in `actualLedger`.

On FREEZE-2, all 108 substitution cases returned ASK. The 15 return cases were already clinical there, because the return handler screens first.

**The matrix, two steps.** Covered: pain, injury, pain `'yes'`, a clinical text, an illness return and an injury return. Each is tried alone, carrying the first step's reference state (pending ASK), and with a ladder choice. All 6 are CLINICAL on every variant, and the late report is still recorded.

**Scope.** The route's scope (`{exerciseId}`) is not part of the output, so it was checked two ways:
- by reading: it comes from the same function the handler calls;
- by the witness below: every route is deep-equal to the handler's own result.

## Q2. Is legitimate R7-A late-evidence behaviour preserved? Yes.

**A late report with no clinical signal: 29 reviews, all 29 identical to FREEZE-2 in every output field.** The fields compared are status, action, reason, missing inputs, question, proposal, disclosures, offers, counterfactuals, gates, horizons, load questions, the ledger hash, the pending state and the reference-state hash. None of the 29 is clinical. They cover:
- **Weekly:** a plain weekly review.
- **Substitutions without a clinical signal:**
  - pain as `false`, `'no'`, `'nao'`, `'maybe'`, `null` or `0`;
  - a skill mismatch;
  - a dislike, confirmed and not confirmed;
  - an ambiguous text, a denial text, "pain free".
- **OBS-01**, and a weekly review carrying a substitution.
- **Every other review kind:** equipment, schedule, missed, partial, local and systemic fatigue, underperformance, goal change, recovered, unavailable day, event-week conflict, a nonclinical return.
- **Choices only:** a ladder choice, an unrecognised choice.

**After the clinical route** (the pain review with the late report, applied):
- A later review with no signal and no reference state gets R7-A's question (`interruption.episodeId`), identical to FREEZE-2, and the late report is still in `actualLedger`.
- Carrying the clinical reference state, it stays CLINICAL_HUMAN_REQUIRED: the sticky rule is unchanged.
- Confirming the interruption again re-establishes identically on both runtimes.

**Neighbor D.** The nonclinical corrections with the late report, the corrections alone, and a skill substitution with both are all identical to FREEZE-2. None is clinical, and the correction and the late report are both recorded.

**Other checks:**
- the mutant that suppresses `staleReturn` (QM8) is killed by the B.2 tests;
- `neighbors-r7b2.mjs`, rerun read-only: 32/32 PASS.

## Q3. Did the fix regress any R7-B.1 closure? No.

**The R7-B.1 Engineering recheck probes.** I ran 36 verbatim copies on both runtimes, with `run-differential.mjs`. All 95 results are identical except K6 and K6b, which go from FAIL to PASS. They cover:
- taper, race and post-event substitution, and the event-week guard: `k2`, `j5`, `j8`;
- reconstructed novice-template persistence: `j2`, `j2f`, `j2g`, `n7`;
- a factual correction with a block choice: `j1`, `j1u`, `r-regression`;
- the SKILL_MISMATCH fallback: `j3`, `j3b`;
- the no-lower-skill question: `j3d`;
- clinical before the block choice, QE-R7B1-01: `j1b`;
- substitution and rotation: `a3`, `a4`, `k3`.

The rows that FAIL fail identically on FREEZE-2: they are routed items or older expectations.

**The R7-B.1 adversarial probes** (copy), including the QE-R7B-01 and QE-R7B-05 residual grid: 3,228 checks, 0 failed, on both runtimes.

**G4, rerun read-only:**
- **`regress-r7b2.mjs`:** PASS. 151 timelines and 1,626 steps; 98/98 corpus and other-kind timelines and 20/20 R7-B.1 blocker paths identical step by step; the 14 B.2-path changes are clinical only; the 184-decision grid and the 389-decision sweep are unchanged. Equal to the recorded report.
- **`regress-r7b.mjs --base 146ebb8`:** 83/83 intake programs identical.
- **Conformance:** `conformance-r7b`, `-r7b1` and `-r7b2` all PASS.

**The full suite:** 799/799.

The one behaviour change outside the clinical routes is QE-R7B2-01. It is not a regression: the FREEZE-2 output there was the defective one.

## Q4. Is there a new route that bypasses the required safety handling? No.

**The inventory is complete for the decision step.** After admission, only four exits can come before a handler's clinical screen:
- `staleReturn`, inside `decide`;
- `factual?.ask`, from `factualReplan` and `graduationWithdrawal`;
- the block-choice questions;
- the return's report-identity question.

All four now yield to the precedence point (`src/r6-adaptation.mjs:368`, `:371–372`). Everything before it is admission or a safety requirement:
- integrity, authority and catalog;
- the contract and chronology HOLD;
- the eligibility clinical flag, which comes first;
- the eligibility ASK and the post-race check;
- `previousValidity`, with the sticky clinical state first;
- malformed lists and athlete model;
- exceptions, caught as HOLD.

After the decision, only two steps remain:
- the "could not be applied" question, which skips clinical decisions;
- proposal validation, which a clinical route never reaches because it proposes nothing.

Other checks:
- Only `substitutionClinical` and `interruptionScreen` produce CLINICAL_HUMAN_REQUIRED after admission, and no imported callee does.
- No kind alias maps to EXERCISE_SUBSTITUTION. The alias `RETURN` is covered and tested.

**Shared screens.** `clinicalRoute` calls the handlers' own functions on the same `review` object, and nothing replaces `review` in the factual contexts. The `q4-screen-fuzz.mjs` grid has 155 substitution payloads and 133 interruption payloads:
- **Substitution payloads:**
  - flag spellings, including objects, arrays, `'n'` and `'nao'`;
  - 15 free texts;
  - exercise ids as a string, `''`, a number, `null` or missing;
  - substitutions that are not objects.
- **Interruption payloads:**
  - 13 categories × 8 clinical-flag values;
  - 9 reasons × 3 `nonclinical` values;
  - interruptions that are not objects.

The results:
- In the fresh state the results are identical to FREEZE-2: the screens were moved verbatim.
- In the late-evidence and same-id states, a result is clinical exactly when the fresh handler result is clinical, with the same reason. Otherwise it is identical to FREEZE-2.
- 288/288 consistent.

**No false route, and no route before admission:**
- 13 reviews that carry a clinical substitution but stop before the decision step are identical to FREEZE-2. Twelve fail admission; the thirteenth takes the eligibility clinical flag's route, which comes first. The fourteenth row of that grid is admitted: a valid reference state pending ASK. It changes from ASK to CLINICAL, as intended.
- An instrumented temporary copy ran the full suite (799/799) and the judge probes. Across 7,555 decision steps:
  - each of the 649 precedence routes was deep-equal to what the review's own handler returns when run directly with a fresh event id (W2 = 0);
  - no handler returned a clinical result that the point missed (W1 = 0).

**CAND-01 is correct.** On the hash-valid built state, pain or an illness return gets CLINICAL with no proposal, and without a clinical signal the factual question is asked as before. The mutant QM3 (the point placed after the factual question) is killed.

**CAND-02 is correct:**
- the same id with an illness, INJURY or a clinical flag → CLINICAL;
- the same id with the same facts → KEEP;
- the same id with other nonclinical facts → the id question;
- a new id with an illness → CLINICAL;
- the mutant QM4 (the point limited to substitution) is killed.

Its combination with a factual re-plan is QE-R7B2-01.

**The M41 equivalence argument holds.**
- **By reading:** a handler returns CLINICAL_HUMAN_REQUIRED only through the two shared screens, which the point evaluates on the same review.
- **By the witness:** zero handler-only clinical results.
- **QM9 (= M41)** survives.

The guard is now dead code. It is harmless, but it is not a safeguard against the K6 class for a future handler (QE-R7B2-04).

**R7B2-OBS-01 is correctly classified (c).** It is pre-existing and outside the QE-R7B1-04 class, and it is not a safety bypass of clinical-screen-first:
- no clinical route that the handler takes is replaced;
- the handler's screen is scoped to the named exercise (B0-C06 condition 8: "for the dependent scope");
- the review proposes nothing.

It is unchanged on the frozen bytes, and recorded for its remaining risk as QE-R7B2-02.

## Findings

| ID | Severity | Origin | Bypass of clinical-screen-first | Owner |
|---|---|---|---|---|
| QE-R7B2-01 | MAJOR | Introduced by the B.2 change (CAND-02 precedence; the G4 grid did not cover it) | No | Chief / U4: SSCTR and narrow Quality per §5; the U3 evidence owner records it |
| QE-R7B2-02 | MINOR | Pre-existing (R7-B `exerciseSubstitution`) | No | Next runtime mission, with SSCTR and Product/UX |
| QE-R7B2-03 | MINOR | Pre-existing (R6/R7-B input reading) | No | SSCTR, with the next runtime mission and Product/UX |
| QE-R7B2-04 | OBSERVATION | Introduced by the B.2 change (the structure) | No | Next runtime mission (Engineering) |

### QE-R7B2-01 — MAJOR: the §5 routing condition does not hold

- **Reproduction:** `probes/s5-factual-proposal.mjs` (rows S5R2 and S5R8; controls S5R1 and S5R3–S5R7) and `probes/s5-downstream.mjs`. Run with `NOW_ROOT=<worktree> PRED_ROOT=<temporary git archive of 146ebb8>`.
- **Setup:**
  - a program is reviewed for 3 weeks;
  - a WORK return is reported on day 3 of week 3;
  - weeks 3 and 4 are reviewed;
  - on day 0 of week 5, the return report is resent under its own event id with the reason "Flu illness", in a review that corrects week 4's strength reports.
- **Expected** (§5, §7 G4): only a nonclinical question replaced by CLINICAL_HUMAN_REQUIRED, with no proposal on either side, and no prescription differs. Otherwise SSCTR and Quality are required.
- **Actual:**
  - **FREEZE-2:** ASK, "This report id already belongs to a different interruption report…; meanwhile evidence about an earlier week changed what this week starts from…", **with the proposal `439a61ba…`** (the factual re-plan) and pending ASK.
  - **R7-B.2:** the handler's illness route, CLINICAL_HUMAN_REQUIRED with no proposal and pending CLINICAL_HUMAN_REQUIRED.
  - **With a ladder choice (S5R8):** the same shape, through the block-choice question.
  - **Applied:** weeks 5–11 differ, and still differ after the next full-week review.
  - **Controls, identical on both runtimes:**
    - the same report under a new id (S5R4) → CLINICAL, no proposal;
    - a substitution pain report with the same correction (S5R5) → CLINICAL, no proposal;
    - the same id with other nonclinical facts (S5R6) → asked, with the proposal;
    - the same facts (S5R7) → re-planned.
- **Judgement:**
  - R7-B.2 is right, and no runtime change is needed.
  - The U3 "G4 reading" (and the freeze's `routing.conditionHolds = true`) overstates what the grid shows.
- **Next action:**
  - dispatch the SSCTR review and one narrow independent Quality review, as contract §5 requires, before G8/G9;
  - record the reopening in a new record, never by editing the freeze, and add this case to the differential.
- **Not found:** the same shape on the late-evidence path. In rows S5a–S5i, no correction in the re-entry week produced a factual proposal on FREEZE-2. Impossibility is not claimed.

### QE-R7B2-02 — MINOR: a substitution report with pain and no named exercise (R7B2-OBS-01)

- **Reproduction:** `probes/b2-inventory.mjs` (row ADJ) and `probes/q1q2-matrix.mjs`.
- **Actual:**
  - ASK, "Say which exercise should change and why", missing `substitution.exerciseId` and `substitution.reason`, although the reason was given;
  - pending ASK. The pain is neither routed nor carried to later reviews;
  - in the re-entry week, R7-A's question instead.
- **Expected:** the pain report is acknowledged and its clinical dependency is not lost.
- **Next action:** the next runtime mission decides an unscoped route or an acknowledged question, with the SSCTR and Product/UX. It does not block (contract §10).

### QE-R7B2-03 — MINOR: clinical signals the decision step does not read

- **Reproduction:** `probes/obs-structured-flags.mjs`.
- **Actual:**
  - A substitution report with `illness`, `functionalLimitation`, `clinicalConcern` or `persistentPain` set to true gets **MODIFY**: goblet-squat is replaced by box-squat-bodyweight.
  - The free text "I have the flu", and `pain:true`, get CLINICAL.
  - A WEEKLY_REVIEW carrying `substitution.pain` gets KEEP.
  - The alias SUBSTITUTION_NEED (which maps to EQUIPMENT_CHANGE) with `substitution.pain` gets KEEP, or MODIFY with substitutes.
- **Context:**
  - Each of these reviews' eligibility block asserts NONCLINICAL_CONFIRMED with those flags false, so the input contradicts itself.
  - B0-C06 condition 8 names illness and functional limitation.
- **Classification:**
  - It is not the precedence invariant: the screen does run first.
  - Reading these keys would be a new clinical reading, which B.2 may not add (§2.3, §4, §10).
- **Next action:** the SSCTR decides the reading; the next runtime mission asks or routes contradictory clinical keys in the input contract. It does not block.

### QE-R7B2-04 — OBSERVATION: nothing pins the precedence point's coverage

- **Reproduction:** `probes/mutants-temp.mjs`, run on a temporary copy only.
- **The gaps:**
  - The mutant QM7, where the point routes a report that names no exercise ("…with undefined routes…"), survives the whole suite (799/799). Only the neighbor script's OBS-01 case would catch it.
  - The M41 guard is dead code and cannot be killed.
  - The point is complete only while `clinicalRoute`'s hand-kept list of kinds matches the handlers' clinical exits. If a future handler's screen is not registered there, the QE-R7B1-04 class would reopen silently.
- **Next action:** the next runtime mission adds two tests:
  - one pinning OBS-01 as unchanged;
  - an invariant test: a handler returning CLINICAL_HUMAN_REQUIRED implies `clinicalRoute !== null`, as `probes/m41-witness-instrument.mjs` checks.

## Negative controls (mine, on a temporary copy of `1a1c728`, restored after each mutant)

Each mutant was run against the B.2 test file and the two R7-B.1 test files (66 tests; the unmutated copy passes 66/66).

**Killed:**
- QM1, the point removed;
- QM2, the point moved after `staleReturn`;
- QM3, the point after the factual question;
- QM4, the point for substitution only;
- QM5, the point reading pain only;
- QM6, the point skipped when the review has block choices;
- QM8, `staleReturn` suppressed;
- QM10, the clinical route given the factual proposal.

**Survived:**
- QM7, a false route without the exercise (QE-R7B2-04);
- QM9 (= M41), equivalent.

## Rules kept

- **Read-only on the repository** outside this folder:
  - no commit and no state-changing git operation;
  - nothing in `src/`, the tests, the evidence, the freeze records, `CURRENT_MISSION.md` or `MISSION_LEDGER.md` was edited or read whole.
- **Scripts:**
  - `verify-r7b2.mjs` was run only without `--write`, and `npm run verify` never;
  - `mutate-r7b2.mjs` was not run, because it edits `src` in place.
- **Copies:**
  - mutants and instrumentation ran only on temporary copies outside the repository;
  - closed-mission probes ran only from copies in this folder.
- **Cleanup:** the three temporary trees were deleted. No background command is left running.

R7B2_ENGINEERING_GATE = READY
