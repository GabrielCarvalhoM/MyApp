# SSCTR regression re-check of R7A-BOUNDARY-FINAL-FREEZE

**Revision R7AB-SSCTR-r1, 2026-10-28.** Gate `R7A_FINAL_SCIENTIFIC_RECHECK`. This is the single regression-only re-check of the single freeze (Founder request §21), and no correction cycle follows it (§22).

- **Target:** runtime R7A-BOUNDARY-FINAL-FREEZE at the unchanged policy R6-POLICY-5 (`18ec48f3…`).
- **Closes against:** my previous re-check, R7AF-SSCTR-r1 on R7A-FINAL-FREEZE (ACCEPT; D53 closed; NF-R7AF-1 and NF-R7AF-2 routed).
- **Outputs, all in this folder:**
  - the structured record `ssctr-r7ab-recheck.json` (13 decision records);
  - the queue proposal `ssctr-r7ab-recheck-queue-items.json` (12 items).

## At a glance

**Verdict: `R7A_FINAL_SCIENTIFIC_RECHECK` = ACCEPT.** I found no blocking finding in my scope.

| Item | Status | Basis, in one line |
|---|---|---|
| **D53** | **CLOSED** | Stays closed. The delta removes the remaining projected-start modes (S-A to S-E), and the S-F checks are 0 on all 22 paths I probed |
| D56 | Closed, holds | 0 cap rises or ends after a non-whole week (of 4,173); byte-identical |
| D57 | Closed, holds | Restoration grid B 0, C 0; caps 0 unexplained; byte-identical |
| D58 | Closed, holds | Short grid 0/315; D58 readings byte-identical; one easy slot per break |
| **D59** | **CLOSED** | First-week grid E = O = B = 0 for every class; byte-identical |
| Return entry, recovery ceilings, restoration, short return | No regression | Every grid of my remit, and my R7-A final probes (F-A to F-F), are byte-identical to R7A-FINAL-FREEZE |
| S-A to S-F | Approved | S-B and S-D carry one non-blocking cost (NF-R7AB-1) |

**What the delta does, in sporting terms.** A return now starts only from a state the athlete executed or reported:
- the intake;
- a return's entry;
- the weekly review's rule on a complete week;
- or a projection the week before executed exactly as it assumed, loads included.

Otherwise it goes back to the last such start, and the sessions executed since count as facts. The return recipe, ceilings and easy slot are byte-identical code. No dose rule is added.

The R7A-FINAL-FREEZE outputs it replaces included:
- a known load the athlete had not lifted (82.5 kg after 20 kg);
- counts recorded as executed that never were;
- an unexecuted run step;
- a pre-break dose restored by a correction that contradicts the executed re-entry.

**One non-blocking finding is routed.** NF-R7AB-1: on an unconsolidated re-entry week, a strength-only shortfall also repeats the run's executed return steps. Recommendation R40.

## Reviewer, authority and target

**Reviewer.** A fresh instance dispatched by the Chief as the project agent type `sports-science-concurrent-training-reviewer`.
- The model is inherited (`claude-opus-5-5`).
- I used no delegation.
- I loaded the constitution SSCTR-CONST-1.0.0, the skill 1.0.0, the decision schema and my R7AF records.
- I did not author the policy, the runtime, the week-start contract or the tests.
- I am not the instance of R7AF-SSCTR-r1 or of any earlier round.

**Authority.** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for bounded nonclinical internal sporting decisions only.
- It is not human, empirical or clinical validation.
- It carries no runtime sovereignty and publishes no Product Truth.

**Target: R7A-BOUNDARY-FINAL-FREEZE, recomputed by my own probe (`ssctr-r7ab-digest.mjs`).**

| Check | Start (18:35:36Z) | End |
|---|---|---|
| Source digest (canonical `hash()` over `src/*.mjs`, 43 files; by listing and by the freeze's entries) | `36a71ca84fb87789d8623e2050ac9e308a963400af86a3ba73a373043bbf186c` | the same (see the JSON, `freezeReviewed.end`) |
| Freeze file `CoachingCore/r7/boundary/RUNTIME_FREEZE_R7A_BOUNDARY.json` | `3ebc9b02…`; 0 of 81 bound files drift; 0 unfrozen | the same |
| Policy canonical hash (recomputed) | `18ec48f3…` | the same |

Every job of my runner recorded the digest before and after it: all 35 jobs show `36a71ca8…`.

**The comparison copy.** The byte-exact R7A-FINAL-FREEZE copy `final-freeze-source/CoachingCore` matches 80 of 80 manifest entries, and its digest is `ec2debe7…`.

**The delta, checked independently against the copy.**
- Changed: `src/r6-adaptation.mjs`, `src/r6-composition.mjs`, `src/r6-program.mjs` and `test/r6-adaptation.test.mjs`.
- Added: `test/r7ab-week-start-authority.test.mjs`.
- Byte-identical code: `strengthAtBreak`, `startStrengthReturn`, `advanceStrength`, `advanceRun`, `projectWeeks` and `loggedLoadDecision`.
- I read the whole diff and WEEK_START_AUTHORITY_CONTRACT §1 to §9.

## What I ran

All runs are on the frozen bytes, through my runner `ssctr-r7ab-run.mjs`. Outputs and their digests are in `ssctr-r7ab-runs/` (`RUNS.json`).

| Check | Result |
|---|---|
| `node --test` in CoachingCore (Node 24.19.0) | 540/540 pass |
| My R7-A.1 and R7-A.2 instruments and my R7-A final probes, unchanged bytes, re-run here | 29 outputs byte-identical to my own R7A-FINAL-FREEZE outputs (`ssctr-r7ab-compare.mjs`). Two differ, each on a named path: `x-items` (only the new `stateAt.authority` field) and the round-12 instrument |
| My round-12 instrument (byte copy `ssctr-r7ab-r12-instrument.mjs`) | 40 of 43 sections equal, with folder names normalised. `O_returnStrength` differs in `pauseInWeek3_14d` only (S-C). The two COMPARE sections only follow it |
| My R7-A final probes on the R7A-FINAL-FREEZE copy | They reproduce my R7AF outputs, except the runtime label they print |
| The author's evidence runs on this freeze | Every output byte-equal to mine, except the round-12 stdout (folder name). The round-12 data sections are equal |
| New: `ssctr-r7ab-probe.mjs`, on this freeze and on the copy | S-A (control, 6 triggers, 3 Sunday cells, follow-ups), S-B (3), S-C (7), S-D (held, full, an isolation case, follow-ups), S-E (4), and the S-F checks across 22 paths |

**Not run.**
- `npm run verify`, `simulate`, `demonstrations:r6`.
- Any `verify-r*.mjs` (`verify-r7ab.mjs` included, although read-only is allowed).
- Any `regress-`, `freeze-`, `prepare-` or `queue-` script.
- Any evidence runner: `run-evidence-r7ab.mjs`, and my `ssctr-r7af-run.mjs`.
- My R7AF builder, and the author's mutation check and self-challenge.

**Not read.**
- The engineering judge's `qe-r7ab-*` files share this folder. I saw their names in a file listing only.
- Of the author's evidence, I hashed the outputs of my own instruments and read only `COMPARE_R7AB_NAMED.json`.

**Authority used.** DEV_TEST_ONLY `devAuthority()`, synthetic data, offline.

## D53 and D59: closed

**D59 holds, byte for byte.**

| Instrument | Result on R7A-BOUNDARY-FINAL-FREEZE |
|---|---|
| First-week grid, 306 cases | NONE, FAMILIAR and KNOWN: E 0, O 0, B 0 |
| Extended first-week grid, 1,377 cases | E, O, B, ceiling disagreements, not-at-entry and block set all 0 |
| Ceiling equality, 1,090 exercises | 0 disagreements |
| Same-day grid, 72 cases | Unchanged |

On a never-logged program the point is now the intake. An exercise never performed therefore enters the way the NONE class does: by the establishment, never as a return of a count it did not execute.

**D53 stays closed, and the delta removes the projected-start modes that remained.** D59 holds, and the QE-R7A2-01 path stays closed: my F-A probe is byte-identical. The remaining modes, each probed on both freezes:

| Mode | R7A-FINAL-FREEZE | R7A-BOUNDARY-FINAL-FREEZE |
|---|---|---|
| S-A: an unexecuted run step read as history | Week 6 runs 30/45, then `back-squat 2x5@3 KNOWN 82.5` | Entry: 15/20, then `1x5@4 ESTABLISH` |
| S-B: a load the athlete had not lifted | `2x5@3 KNOWN 82.5` after 20 kg was lifted | Effort-guided `1x5@4`; 82.5 kg only a ceiling |
| S-C: counts recorded as executed that never were | `ESTABLISHED` with `lastExecutedSets` 2 or 3 | Establishment from the intake |
| S-D: a never-executed value held at step 1 | Step 1 | Step 0 |
| S-E: a correction contradicting the executed re-entry | Applied; restored `3x5@3 KNOWN 82.5` | Asked |

**The S-F checks, across 22 paths.**
- 0 run steps above the executed one.
- 0 ceilings above the first return's.
- 0 rows above a ceiling.
- 0 pre-break rows in a moderate re-entry.

On R7A-FINAL-FREEZE, 5 of these paths put an unexecuted run step into the next start.

I found no mode in my remit that lets a known count or load come back faster than declared. NF-R7AB-1 runs in the opposite direction: it is an under-reading.

## D56, D57, D58 and the rest of my remit: no regression

| Remit | Evidence on R7A-BOUNDARY-FINAL-FREEZE |
|---|---|
| D56 | Restoration grid (864 timelines): 0 cap rises or ends after a non-whole week (of 4,173), held 0. Caps 9,499 binding, 0 unexplained |
| D57 | B 0, C 0. Extension: 5,200 binding, 0 unexplained, uncovered jumps 98 (R23 class, unchanged) |
| D58 | Short grid 0/315 after the return and after the review. D58 readings and my S1–S10 probe byte-identical |
| Return entry | The recipe code is byte-identical. Every probed moderate re-entry of an executed or reported exercise enters at 1 set with RIR 4 or more (round-12 `entryRowsNotAtEntryDose` is empty). An exercise never performed enters by the declared establishment (D51, D52), the program's own week-0 entry |
| Recovery ceilings | Ceiling equality: 0 disagreements. On the changed paths the ceilings equal the first return's or the reported intake (squat 80 kg, not 82.5). A 100 kg log is capped and asked |
| Restoration | Grids, caps, extension, rotation, traces and 40 of 43 round-12 sections byte-identical. Follow-ups on the changed paths: O 0, J 0 |
| Short return | Short grid byte-identical. Before any return, a half-executed unreviewed week now resumes its executed dose (`3x5@3`), not the projected one (`4x5@3`) |

## Rulings S-A to S-F

### S-A: approved

QE-R7AF-01 is closed in my scope. The scenario: a 16-day break, then a re-entry week with only Tuesday's run and Wednesday's lift executed, neither finished nor reviewed. A decision follows on Monday of week 6, then a separate 2-day trip.

| | R7A-FINAL-FREEZE | R7A-BOUNDARY-FINAL-FREEZE |
|---|---|---|
| Triggers that move the start | Equipment window, full-kit statement (KEEP), systemic and local fatigue | None. Every trigger gives the control's start, as do schedule and goal changes |
| Run return step at the trip | 1 (never executed) | 0 |
| Week 6 runs | 30/45 | EASY 15 / LONG 20 |
| Projected week 7 | `back-squat 2x5@3 KNOWN 82.5`, LONG 60 | `back-squat 1x5@4 ESTABLISH RETURN_ENTRY`, LONG 45 |
| Long runs, weeks 6–9, executed and reviewed | 45/45/50/55 | 20/20/25/30; O 0, J 0 |

**On Sunday of week 5 the week is complete.** A review, or a schedule change applying its rule, steps only what was executed: back-squat and calf raise, at the 20 kg lifted. The run holds, because Thursday's run was missed. This is byte-equal to R7A-FINAL-FREEZE.

**A strength-only change at Sunday 06:00** keeps the run start projected, so the trip starts from the re-entry.

### S-B: approved, with NF-R7AB-1

The re-entry week is executed in full, with Sunday's run reported on Monday, and never reviewed.

| How the week was lifted | R7A-FINAL-FREEZE, week 7 | R7A-BOUNDARY-FINAL-FREEZE, week 7 |
|---|---|---|
| At the loads the projection kept | `2x5@3 KNOWN 82.5` | The same (COMPLETED_SESSIONS) |
| 20 kg under the 82.5 kg ceiling | `2x5@3 KNOWN 82.5`, a load the athlete had not lifted | `1x5@4 ESTABLISH`, with 82.5 kg only a ceiling |
| 20 kg, reviewed on Sunday | `2x5@3 KNOWN 20` | The same (the review adopts 20 kg) |

**Cost.** In the lighter week every run was executed, yet the run repeats its entry: 15/20, then 30/30/45, against 30/45, then 34/45/60. See NF-R7AB-1.

### S-C: approved

A first break after an unconsolidated week goes back to the last evidence-anchored start. On a never-logged program that is the intake, which is the only evidence there is.

**Profile A, never logged, 18-day break at the end of week 5.**

| | R7A-FINAL-FREEZE | R7A-BOUNDARY-FINAL-FREEZE |
|---|---|---|
| Point | Week 3's projected start | The intake (week 0) |
| Entry-week runs | EASY 15/15, LONG 15 | The same |
| Return target, long run | 70 (the plan's, never run) | 60 (the reported longest run) |
| Strength entry | Every exercise `ESTABLISHED`, with counts and ceilings never executed; then `1x8@4 ESTABLISH RETURN_ENTRY` | `2x8@3 FIRST_ESTABLISH`, bodyweight `1x10@3`: the program's own week-0 entry (accessories rotated, D51) |

**Why the establishment is acceptable.** It is one set more and one rep in reserve fewer than the old entry. But it is the policy's approved entry for adults of unknown capacity (D52, `effortGuidedLoad`), and my R7AF F-C ruling already applied it to the untrained case. No executed count or load is exceeded, because none exists.

**Known back-squat at 80 kg, never logged, 14 days.**
- The squat returns at the reported 80 kg, not the plan's 82.5.
- Accessories enter at the base 5 reps, not the plan's 7 or 10.
- Every entry row stays at 1 set, RIR 4.

**The controls.**
- After three executed and reviewed weeks, the entry is 1 set at RIR 4 (byte-equal).
- Family G, before any return: a half-executed, unreviewed week resumes its executed dose (`3x5@3`) instead of the projected one (`4x5@3`).

### S-D: approved, with NF-R7AB-1

The Saturday-only exercises (`db-rdl`, `db-split-squat`) were never executed since the return. They now re-enter at step 0; R7A-FINAL-FREEZE used step 1, which was never executed.

**Cost.** The next trip starts from the re-entry as a whole, so the run also goes back to step 0, although every run of weeks 5 and 6 was executed and week 6 was reviewed.

| Case | Long runs, weeks 7–10 |
|---|---|
| R7A-BOUNDARY-FINAL-FREEZE, held case | 20, then 45/50/55 |
| R7A-FINAL-FREEZE, held case | 60/60/60/65 |
| Isolation: week 5 consolidated by its own review | 60/60/60/65 (byte-equal to R7A-FINAL-FREEZE) |
| Week 6 executed in full | 60/60/60/65 (byte-equal to R7A-FINAL-FREEZE) |

O and J are 0 in all of them.

### S-E: approved as the Founder's ASK (§11)

A named correction of the first break is asked (`interruption.startDate`, `interruption.endDate`) when it:
- moves the break after its own re-entry, by episode or by report id;
- or ends it over the executed Tuesday run.

While it is asked, the plan in force keeps the re-entry. R7A-FINAL-FREEZE applied the move and restored the pre-break dose: `back-squat 3x5@3 KNOWN 82.5`, long run 70. A consistent correction (earlier days) applies as before, byte-equal.

### S-F: approved

On my 22 paths, no unexecuted return step, load or whole count reaches a ceiling or a resumed dose through a stored start (D49, D53, D56).

Rows at 3 sets or more at a known load appear only where the approved recipe gives them: a short resume before any return, or after a week executed in full. They never appear in a moderate re-entry.

## Non-blocking finding and recommendation

**NF-R7AB-1 (S-B, S-D; declared boundary B8), recommendation R40.**
- **Owner:** the runtime author with Product/UX and Data. It becomes a Founder decision if per-sport authority is judged a state-model change.
- **Finding:** `historicalWeekStart` holds a start as history only when both sports' parts hold. Inside a return, "executed in full" is per week, across sports. So on a re-entry week left without its own review (here, its Sunday session reported on Monday), a strength-only shortfall also returns the run to the entry. A lighter effort-guided load or a missed lift is enough, though every run was executed.

| Case | Cost |
|---|---|
| S-B, lighter loads | The run repeats its entry. The controlled pair differs only in the strength loads |
| S-D, held values | Two weeks of executed return steps are lost, for both sports |

The dossier's S-B and S-D rows do not mention the run.

**Why it does not block.**
- It raises no dose and breaks no declared rule. Every output is the approved entry, steps and ceilings, from a state the athlete executed (O 0, J 0).
- It is nonclinical, and it never reaches back before the return in force.
- It needs three conditions together: an unconsolidated re-entry week, a shortfall in it, and another break inside the same return. With the re-entry week reviewed, nothing changes (the isolation case).
- It is declared boundary B8, and the alternative needs per-sport or per-exercise authority, which the contract calls a new state model.
- The cost is progression, not safety: a lower dose that persists costs adaptation (R6-S52).

**R40.**
- Walk the state point back per sport: the run's point from the run part's authority, and strength's from strength's.
- Count "executed in full" per sport inside a return, so a strength shortfall cannot discard executed run steps, nor the reverse.
- Product/UX and Data should make sure the re-entry week is consolidated by its own review when its last session is logged late, for example a week-end consolidation that reads late logs.
- Until then, keep the conservative reading.

**Earlier findings.**

| Id | Status |
|---|---|
| NF-R7AF-1 (R38), NF-R7AF-2 (R39) | Retained; F-D and F-F byte-identical |
| IS-7 cost bound ("at most one week of slower restoration") | Restated: at most the progress executed since the return in force |
| R35, R36 and the R7AF-SSCTR-r1 list | Retained, unchanged |

## My earlier records (the delta check)

All thirteen R7AF-SSCTR-r1 records bind R7A-BOUNDARY-FINAL-FREEZE. I re-bound them as R7AB-SSCTR-r1 revisions. In each one:
- the binding condition names R7A-BOUNDARY-FINAL-FREEZE;
- the start-state condition now cites WEEK_START_AUTHORITY_CONTRACT R7AB-WEEKSTART-1;
- the R7-A.2 S-F condition is restated: the step reached is the evidence-anchored one.

| Record | Binds R7A-BOUNDARY-FINAL-FREEZE? | Basis |
|---|---|---|
| R7A1-SSCTR-QUALITY-SLOT-READINGS | Yes, re-bound | Short grid, D58 readings and my S1–S10 probe identical |
| R7A1-SSCTR-D59-PAUSE-WEEK-START | Yes, re-bound, closed | Grids identical; S-C added as a fact |
| R7A1-SSCTR-D56-FORMULATION | Yes, re-bound | Grids identical |
| R7A1-SSCTR-RESTORATION-SCOPE | Yes, unchanged (abstention) | U 237, the same exercises |
| R7A1-SSCTR-SAME-DAY | Yes, re-bound | Outside the delta |
| R7A1-SSCTR-DOSE-READING | Yes, unchanged | S4 identical; `loggedLoadDecision` identical code |
| R7A1-SSCTR-COMPOSITION | Yes, re-bound | S1–S10 identical; the §11 contradiction is asked |
| R7A1-SSCTR-REGAIN-BASE | Yes, re-bound | Grid and SD traces identical |
| R7A1-SSCTR-REESTABLISH-PHASE | Yes, unchanged | C 0; the one changed round-12 section is S-C |
| R7A1-SSCTR-SPLIT-WEEK | Yes, re-bound | Ceiling equality identical; the facts loop is the same `strengthAtBreak` |
| R7A1-SSCTR-ITEMS-5-8 | Yes, unchanged | D55 met; the return functions are identical code |
| R7A1-SSCTR-CYCLE2-COMPOSITIONS | Yes, re-bound | Conditions 5 and 9 met |
| **R7A2-SSCTR-INTERRUPTION-STATE** | **Yes, re-bound and extended** | S-A to S-F added; F-A to F-F identical; new claims IS-9 to IS-12 |

**Queue proposal R7AB-SSCTR-QUEUE-PROPOSAL-r1** (`ssctr-r7ab-recheck-queue-items.json`).
- Twelve items `HQ-R7AB-SSCTR-*`, all QUEUED_FOR_FUNDED_HUMAN_REVALIDATION, funding NOT_DECLARED.
- Each refines its `HQ-R7AF-SSCTR-*` item by re-binding the same decision to R7A-BOUNDARY-FINAL-FREEZE, without replacing it. INTERRUPTION-STATE also extends its scope to S-A to S-F.
- The abstention has no item.
- It is a proposal only. I did not edit the queue file (175 items); the Chief integrates the items append-only.

## Literature access

**Tools.** Node `fetch` to PubMed E-utilities, esearch and esummary: all HTTP 200 (`ssctr-r7ab-literature.mjs`).

**Searches.** The same two 2025–2026 synthesis searches as R7AF-SSCTR-r1 (training cessation and detraining; retraining and return to training). They returned 12 and 9 hits, the same PMIDs as earlier the same day, so there is no new synthesis and no re-review trigger.

**What I read.** Titles only. No abstract or full text was read, and no ruling rests on them. Per Founder §21 the literature is not reopened.

**Reused verbatim from earlier rounds.**
- Full text: R6-S01, R6-S14, R6-S48, R6-S52.
- Abstracts: R7A1-S05, R7A2-S01, R7A2-S02, R7A2-S03.

**Basis of the rulings.** The declared rules and the regression evidence. The new claims cite only these sources: IS-9 (R6-S48, R6-S01), IS-10 (R6-S01) and IS-12 (R6-S52, R6-S48).

## Validation

**Gap.** Python and `jsonschema` are not installed, so `validate_records.py` did not run.

**Declared substitute.** My unchanged Node validator `audits/domain-coaching-r7a1-2026-10-27/reviews/ssctr-r7a1-validate.mjs`: ajv 8.20.0 against `decision.schema.json`, with the helper's cross-checks ported. It prints only.

**Result.** The 13 records and the 12 queue items pass: 0 errors (`ssctr-r7ab-recheck-validate.out.json`).

**Negative control.** A copy (in my scratchpad) with a stale target hash, an altered approval condition and a missing AE answer fails with 6 errors. All three defects are caught.

This certifies record consistency only, not citation truth or sporting safety.

## Escalation and routing

**No escalation is needed for the ruling.**
- No policy text change, no clinical dependency (clinical reasons still route before identity) and no Founder decision needed to accept.
- The binding did not drift: the digest was `36a71ca8…` at the start, at the end and around every job.

**Routing.**
- **Chief:** record `R7A_FINAL_SCIENTIFIC_RECHECK` = ACCEPT on R7A-BOUNDARY-FINAL-FREEZE together with the engineering re-check, and integrate the queue proposal append-only.
- **Runtime author with Product/UX and Data:** NF-R7AB-1 (R40), for a later mission. If per-sport authority is judged a state-model change, it is a Founder architectural decision, not a correction of this freeze.
- **Still routed:** NF-R7AF-1 and NF-R7AF-2 (R38, R39).
- **Next policy revision:** R35 and R36.

## Files

All in `audits/domain-coaching-r7a-boundary-2026-10-28/reviews/`. Hashes are in the JSON (`myOutputs`).

**Deliverables:**
- `ssctr-r7ab-recheck.md` (this file)
- `ssctr-r7ab-recheck.json`
- `ssctr-r7ab-recheck-queue-items.json`

**Instruments:**
- `ssctr-r7ab-digest.mjs` (`.start`, `.finalcopy` and `.end` outputs)
- `ssctr-r7ab-run.mjs` (`ssctr-r7ab-runs/RUNS.json`)
- `ssctr-r7ab-probe.mjs`, `ssctr-r7ab-compare.mjs`, `ssctr-r7ab-literature.mjs`
- `ssctr-r7ab-r12-instrument.mjs` (byte copy)
- `ssctr-r7ab-build.mjs` and `ssctr-r7ab-top.json`

**Outputs:**
- `ssctr-r7ab-runs/*`
- Validation outputs `ssctr-r7ab-recheck-validate*.out.json`

Nothing was edited under `CoachingCore/`, in the mission files, the queue file, `product/`, `canon/`, the dossier or earlier audits.
