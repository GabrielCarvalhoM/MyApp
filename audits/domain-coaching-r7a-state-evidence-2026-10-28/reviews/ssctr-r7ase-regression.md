# SSCTR regression check of STATE-EVIDENCE-FREEZE-1

**Revision R7ASE-SSCTR-r1, 2026-10-28.** Gate `STATE_EVIDENCE_SCIENTIFIC_REGRESSION`. This is the single regression-only check of the single freeze (Founder request §25), and no correction cycle follows it (§27).

- **Target:** runtime STATE-EVIDENCE-FREEZE-1 at the unchanged policy R6-POLICY-5 (`18ec48f3…`).
- **Closes against:** my previous check, R7AB-SSCTR-r1 on R7A-BOUNDARY-FINAL-FREEZE (ACCEPT; D53 closed; D56–D59 hold; NF-R7AB-1 routed as R40).
- **Outputs, all in this folder:**
  - the structured record `ssctr-r7ase-regression.json` (13 decision records);
  - the queue proposal `ssctr-r7ase-regression-queue-items.json` (12 items).

## At a glance

**Verdict: `STATE_EVIDENCE_SCIENTIFIC_REGRESSION` = ACCEPT.** I found no blocking finding in my sporting remit.

The change did not unduly alter any of these:
- prescriptions;
- the return entry;
- restoration;
- progression rules;
- ceilings;
- phase behaviour.

The following code is byte-identical:
- the planner;
- the return recipe;
- the easy slot;
- the composition rules;
- `startStrengthReturn`, `advanceStrength`, `advanceRun` and `loggedLoadDecision`.

Every grid of my remit is byte-identical to the boundary freeze. My own regression comparison does not ignore the return entry, and it differs only in two returns that follow unreported weeks.

| Item | Ruling | Basis, in one line |
|---|---|---|
| SE-A | Approved | R5 24/24, profiles 16/16 and simulations 14/14 are identical, and so are 33 of 35 R6 holdout cases. Nothing differs outside a return. No status changed |
| SE-B | Approved with conditions (NF-R7ASE-1) | Strength returns from what was lifted (P40: 20 kg; P40c: ceiling 20). After unreported weeks, the run starts from its last evidence-anchored value, below what the athlete ran |
| SE-C | Approved | A lifted known load is the load, by the review's own D44 rule (21 after 21; 24 within one increment). 26 kg, 40 kg and a missed target are not adopted. Effort-guided rows adopt nothing |
| SE-D | Approved with conditions (NF-R7ASE-3) | The load lifted and its repetition target are history, with no step, also with repetitions unlogged. **Not approved:** a stored load tick that only the projection counted |
| SE-E | Approved; R40 applied | Per sport. NF-R7AB-1 is resolved: SD held now gives 60/60/60/65 (was 20/45/50/55), and SB continues the run's executed return step |
| SE-F | Approved | A review's carried values are rebuilt by its own rule. A Sunday handler reviews its sport (E6) and equals the Sunday-review cell |
| SE-G | Approved | Last performed is the execution date, the right input for a days-since-exposure threshold |
| SE-H | Approved as declared boundaries | E1–E6. NF-R7ASE-2 is recorded for E2 (unchanged); E5 carries NF-R7ASE-1 |
| **D53** | **CLOSED, holds** | The S-F checks are 0 on 22 paths. Loads never lifted: 0 (6 on the boundary freeze) |
| D56 | Holds | 0 cap rises or ends after a non-whole week (of 4,173); byte-identical |
| D57 | Holds | Restoration grid B 0, C 0; caps 0 unexplained; byte-identical |
| D58 | Holds | Short grid 0/315; D58 readings byte-identical |
| **D59** | **CLOSED, holds** | First-week grid E = O = B = 0 for every class; byte-identical |

**For the Chief: one exception is a state-evidence question, not a sporting block (NF-R7ASE-3).**

When a lift promotes a projected dose, history takes the stored start's load tick. That tick can count an exposure that the projection assumed and the athlete never executed. My case, for the back squat:
- Week 2's row was 82.5 kg. The athlete lifted 80 kg, and the week was never reviewed.
- Week 3 lifted 82.5 kg, with its target missed.
- History now holds 82.5 kg at tick 1 (the boundary freeze held tick 0).
- After a short break, the load therefore steps to 85 kg one successful exposure earlier.

Why it does not block my gate:
- The sporting reach is one smallest increment, after an exposure that met its RIR-gated target.
- It is exactly what the unchanged planner prescribes for the same history with no break.

It is still a value that only a projection made, reaching history. Under Founder §27, whether that is material is the engineering judge's call. I do not certify the tick.

## Reviewer, authority and target

**Reviewer.** A fresh instance, dispatched by the Chief as the project agent type `sports-science-concurrent-training-reviewer`.
- The model is inherited (`claude-opus-5-5`), and I used no delegation.
- I loaded the constitution SSCTR-CONST-1.0.0, the skill 1.0.0, the decision schema and my R7AB records.
- I did not author the policy, the runtime, the state evidence contract or the tests.

**Authority.** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for bounded nonclinical internal sporting decisions only. It is not human, empirical or clinical validation. It carries no runtime sovereignty and publishes no Product Truth.

**Target, recomputed by my own probe (`ssctr-r7ase-digest.mjs`, at the start and at the end):**
- Source digest `692483ce5147d90797441baf2ac73c9d433197bd40047f147202ca4e4bff2cc1`. It is the same by listing and by the freeze's entries.
- Freeze file `a8683cba…`; all 82 bound files match; 0 unfrozen.
- Policy `18ec48f3…`, recomputed.
- Every job of my runner records `692483ce…` before and after it.

**Comparison copy.** `boundary-freeze-source/CoachingCore` matches all 81 entries of the R7A-BOUNDARY-FINAL-FREEZE record, and its digest is `36a71ca8…`. My probes on that copy reproduce my R7AB outputs (b-probe, f-probe, f-sameday), apart from the printed runtime label.

I read the whole diff (`dossier/RUNTIME_DELTA_R7ASE.diff`) and STATE_EVIDENCE_CONTRACT §1–§9.

## What I ran

All runs are on the frozen bytes, through `ssctr-r7ase-run.mjs`. Outputs and their hashes are in `ssctr-r7ase-runs/` (`RUNS.json`).

| Check | Result |
|---|---|
| `node --test` (Node 24.19.0) | 555/555 pass |
| `verify-r7ase.mjs`, read-only | 15/17. Open: `independent-reviews`, `deliverables` |
| My R7-A.1 and R7-A.2 instruments, R7-A final probes and R7-A boundary probe, unchanged | 29 outputs byte-identical to my R7AB outputs. Three differ, each on a named path (below) |
| My round-12 instrument (byte copy) | 43 of 43 data sections equal. The printed output differs only by folder and instrument names |
| `x-items` | Differs only in the new `stateAt.values` record |
| b-probe | Differs in SA (Sunday equipment), SB (lighter 20 kg) and SD (held, full): the SE-E and SE-F paths |
| New: `ssctr-r7ase-regression-probe.mjs` | My own regression comparison, with the entry, break dates, exposure, adaptations, `startBeforeReturn` and `easedFor` compared |
| New: `ssctr-r7ase-probe.mjs` | SE-B to SE-D: 8 week-3 variants × SHORT/MODERATE, each unreviewed cell against its reviewed control |
| New: `ssctr-r7ase-systemic-probe.mjs` | SE-E under a strength-only systemic report |
| New: `ssctr-r7ase-tick-probe.mjs` | SE-D ticks: 8 db-rdl cells, the back-squat cells, a fully reviewed reference and the no-break planner path |
| New: `ssctr-r7ase-holdout-detail.mjs` | R6-H17 and R6-H26 in sporting detail, on both runtimes |

**Not run:**
- `npm run verify`, `simulate`, `demonstrations:r6`;
- any `verify-r*.mjs --write`;
- any `regress-`, `freeze-`, `prepare-` or `queue-` script;
- any evidence runner, my earlier `ssctr-*-run.mjs` included;
- `mutation-check-*.mjs`;
- any build script writing into an earlier audit folder.

**Not read:**
- The engineering judge's `qe-r7ase-*` files appeared in this folder during my run. I saw their names in a listing and read none of them.
- Of the author's evidence, I read:
  - `REGRESSION_R7ASE.json`, with `REGRESSION_R7ASE_NAMED.json` and `COMPARE_R7ASE_NAMED.json`;
  - the consumer audit and the checkpoint;
  - the judge's P40b outputs on both runtimes.

**Authority used.** DEV_TEST_ONLY `devAuthority()`, synthetic data, offline.

## Rulings SE-A to SE-H

### SE-A: approved

My comparison ignores less than the author's: only hashes, per-report input hashes and the authority records. It still gives the same picture:

| Corpus | Identical | Notes |
|---|---|---|
| R6 fresh holdout | 33/35 | H17 and H26 differ, only in the return step and after |
| R5 corpus | 24/24 | |
| Profiles | 16/16 | |
| Simulations | 14/14 | Three of them contain interruptions |

The planning state before any return is identical. No status or action changed.

### SE-B: approved with conditions

**Strength.** A return starts from the loads and counts the athlete executed:
- P40: db-rdl and db-split-squat at the 20 kg last lifted (the plan still projects 22). The unreviewed cell equals its reviewed control.
- P40c: the MODERATE ceiling is 20.
- In my P40 cells: 0 states ahead of the reviewed control, and 0 entry loads never lifted or reported. The boundary freeze had 6: db-rdl at 22 kg after 24, 26 or 40 kg was logged.

**The run after unreported weeks (E5).** The run starts from its last evidence-anchored value, which can sit below what reported weeks executed. See NF-R7ASE-1.

| Case | State evidence | Boundary freeze |
|---|---|---|
| R6-H17, 5-day break: long runs, weeks 6–8 | 85/90/95 (the athlete ran 95 in week 4) | 95/100/100 |
| R6-H26, 17-day break: long run, week 9 | 50 (the athlete ran 100 in week 5) | 65 |

Both are inside the approved recipe and at or below the boundary freeze.

### SE-C: approved

The P40 history, with each week-3 Saturday variant of db-rdl, unreviewed (U) against its Sunday-reviewed control (R):

| Saturday db-rdl in week 3 | History (U), SHORT and MODERATE |
|---|---|
| Lifted lighter (21) | 21 = R |
| Lifted 24, target met (one increment, D44) | 24 = R |
| Lifted 24 with the target missed, 26 (two increments) or 40 | 20, the last known = R |

On every cell: O, J and L (a known load above the heaviest lifted) are 0 in the follow-ups.

U has 18 rows above R's, and they are a strict subset of the boundary freeze's 19. Every one is a MODERATE effort-guided entry or step row at one more repetition (7 against 6), where R added a block set (3 sets against 2). None is a load, set or RIR above R.

An effort-guided row adopts nothing (b-probe SA and SB, as my R7AB S-B approved).

### SE-D: approved with conditions (NF-R7ASE-3)

**Approved:** the load lifted and its repetition target are history, with no step.
- Exact 22 kg: 22 kg at tick 0, equal to R.
- Repetitions unlogged: 22 kg at the target of 5, no step, equal to R.
- P41: back squat 85 kg with its own tick.

**Not approved as history:** a stored load tick that counts an exposure the projection assumed. Here is the back-squat case in full:

| | State evidence | Boundary freeze |
|---|---|---|
| History (U and R alike) | 82.5 kg, tick 1 | U tick 0, R tick 1 |
| U after a SHORT return | 82.5, then 85 | 82.5, 82.5, then 85 |

- With the week-3 target met, the counts coincide (tick 1 either way).
- The unchanged planner with no break gives 82.5, then 85, reviewed or not.
- In the 8 db-rdl cells the stored tick was 0, and U equals R.

### SE-E: approved, R40 applied

- **SB, lighter 20 kg:** the run holds its completed sessions (return step 1). B's runs are 30/45, then 34/45/60; the boundary freeze gave 15/20, then 30/30/45. Strength goes back to the re-entry.
- **SD held:** 60/60/60/65, equal to week 6 executed in full and to week 5 consolidated by its own review. O 0, J 0.
- **The §13 systemic case:** U's run return step (1) equals the Sunday-reviewed control's (the boundary freeze gave 0). The run rows equal R's, and strength trails R.

### SE-F: approved

- **SA, a Sunday 06:00 equipment statement:** B's strength is the Sunday review's (back squat at the 20 kg executed on its effort-guided entry row, step 1). The run is the no-handler control's. The Sunday-review cell is byte-identical on both freezes.
- **SD held:** the Saturday-only lifts stay at step 0. Wednesday's lifts, reviewed in week 6, keep step 1, and the break's point is week 7.
- **S-F checks, across 22 paths:**
  - run steps above the executed one: 0;
  - ceilings above the first return's: 0;
  - rows above a ceiling: 0.
- Rows at 3 sets or more at a known load appear only where the recipe gives them. SD full now has 1 such row (6 on the boundary freeze).

### SE-G: approved

A last performed date in history is the execution date (test "§8 last performed date" passes). A re-establishment threshold read from history therefore uses the actual exposure. The planner's own D52 threshold stays on the planning view (E1). Every grid is unchanged.

### SE-H: approved as declared boundaries

| Boundary | Ruling |
|---|---|
| E1 | The planner is unchanged |
| E2 | Unchanged since the boundary freeze: NF-R7ASE-2 |
| E3 | My S-A |
| E4 | No objection |
| E5 | The cost is NF-R7ASE-1 |
| E6 | Per sport, and consistent with the Sunday-review cell |

None of them lets a projected value reach a return's load or count.

## Non-blocking findings and recommendations

**NF-R7ASE-1 (SE-B, E5) → R41.** After weeks never reported, the run value is promoted only in two ways:
- by a review's rule on a historical base;
- by completed sessions on a historical base.

The two holdout cases show the cost:

| Case | What the record holds | What history gives |
|---|---|---|
| R6-H17 | Weeks 0–3 unreported. Week 4 reviewed: its quality run missed, its long run of 95 executed | The return resumes a long run of 85, the quality ladder at step 0, strides uncounted. The holdout allows a 10–15% lighter first week |
| R6-H26 | Weeks 0–4 unreported. Week 5 executed in full (long run 100), but its review was KEEP, which records no evidence start | The run regains toward the intake's 80, with a 50-minute long run in the second return week (65 on the boundary freeze). The holdout prefers about 70–80% of the last long run |

Why it does not block:
- No dose rises, and no declared rule breaks.
- It needs weeks left unreported, which the Founder rules are not history.
- The cost is progression, not safety (R6-S52).

**R41** (owner: the runtime author with Product/UX and Data; a Founder decision if it is judged a state-model change):
- (a) Before a return that follows unreported weeks, ask the athlete what those weeks contained.
- (b) Make a KEEP review of a complete week record its evidence, as a MODIFY review does.
- (c) Consider value-scoped promotion of the run from completed executions in a reviewed week, bounded by the review's one-step rule. This changes a return's dose, so it needs an SSCTR review first.

**NF-R7ASE-2 (E2, unchanged, not a regression).**
- **Finding:** a run value read through an unreviewed week keeps that week's evidence start. A missed long run in that week therefore does not hold the target as a review would. In P40b cells 6–8, U keeps a long run of 70 against R's 65.
- **Why it does not block:** the value was earned by an earlier review on executed work; every other run counter now trails R.
- **Action:** record only, for the next run-state mission.

**NF-R7ASE-3 (SE-D) → R42.** Described above.
- It is non-blocking for this sporting gate, because its reach equals the unchanged planner's no-break progression.
- It is a state-evidence question for the Chief and the engineering judge (Founder §27, §28).

**R42:** when a lift promotes a projected dose, take its tick from history, not from the stored start:
- tick 0 at a load history had not reached;
- the historical tick when the historical value already held that load.

Reword contract §5 to match. R42 lowers no load and changes no ceiling: it can only delay a step by one successful exposure. It belongs in a later mission, never as a correction of this freeze.

**Earlier findings.**

| Id | Status |
|---|---|
| NF-R7AB-1 (R40) | Resolved (SE-E) |
| NF-R7AF-1 (R38), NF-R7AF-2 (R39) | Retained; F-D and F-F byte-identical |
| R35, R36 | Retained for the next policy revision |
| IS-7 cost bound | Restated: at most the progress executed since the return in force, per sport |

## My earlier records (the delta check)

All thirteen R7AB-SSCTR-r1 records bound R7A-BOUNDARY-FINAL-FREEZE. I re-bound them as R7ASE-SSCTR-r1 revisions to STATE-EVIDENCE-FREEZE-1 (`supersedes`: the R7AB revision). In each one:
- the binding condition names this freeze;
- the start-state condition now cites STATE_EVIDENCE_CONTRACT R7ASE-STATE-EVIDENCE-1, value by value;
- the D56–D59 "met at" conditions add this freeze.

Two conditions gained more:
- **The D59 condition** adds the load fact and excludes the projected tick.
- **The S-F condition** records that the reading is per value and per sport (R40 applied).

Each record carries for these reasons:

| Records | Basis |
|---|---|
| D56, D57, regain base, split week, cycle 2, items 5–8 | Grids byte-identical |
| Quality slot, same day, composition | Short, same-day and S1–S10 outputs byte-identical |
| Dose reading | History now applies the same `loggedLoadDecision` |
| Re-establishment phase | 43/43 round-12 sections equal; SE-G noted |
| Restoration scope | Unchanged abstention (U 237, the same exercises) |
| R7A2-SSCTR-INTERRUPTION-STATE | Extended: SE-A to SE-H, claims IS-13 to IS-17, and the conditions listed below |

The new interruption-state conditions:
- **SE-A to SE-H.** SE-E and SE-F supersede the whole-start reading of my R7AB S-B and S-D where they differ.
- **SE-D** excludes a tick that only the projection counted.

## Queue proposal

R7ASE-SSCTR-QUEUE-PROPOSAL-r1 (`ssctr-r7ase-regression-queue-items.json`):
- 12 items `HQ-R7ASE-SSCTR-*`, all QUEUED_FOR_FUNDED_HUMAN_REVALIDATION, with funding NOT_DECLARED.
- Each refines its `HQ-R7AB-SSCTR-*` item by re-binding the same decision to this freeze, without replacing it.
- INTERRUPTION-STATE also extends its scope to SE-A to SE-H.
- The abstention has no item.
- It is a proposal only. I did not edit the queue file; the Chief integrates the items append-only.

## Literature access

**Tools.** Node `fetch` to PubMed E-utilities, esearch and esummary: all HTTP 200 (`ssctr-r7ase-literature.mjs`).

**Searches.** The same two synthesis searches as R7AF and R7AB (detraining; retraining and return to training). They returned 12 and 9 hits, the same PMIDs as R7AB earlier today. There is no new synthesis, so there is no re-review trigger.

**What I read.** Titles only. No ruling rests on them, and per Founder §25 no new research was opened.

**Reused verbatim from earlier rounds.**
- Full text: R6-S01, R6-S14, R6-S48, R6-S52.
- Abstracts: R7A1-S05, R7A2-S01, R7A2-S02, R7A2-S03.

## Validation

**Gap.** Python and `jsonschema` are not installed, so `validate_records.py` did not run.

**Declared substitute.** My unchanged Node validator (`audits/domain-coaching-r7a1-2026-10-27/reviews/ssctr-r7a1-validate.mjs`, ajv 8.20.0, with the helper's cross-checks).

**Result.** The 13 records and the 12 queue items pass with 0 errors (`ssctr-r7ase-regression-validate.out.json`).

**Negative control.** A copy (in my scratchpad) with three defects fails with 6 errors, and each defect is caught:
- a stale target hash;
- an altered approval condition;
- a missing AE answer.

This certifies record consistency only, not citation truth or sporting safety.

## Escalation and routing

**No escalation is needed for my ruling.** It requires no policy text change, no clinical semantics, no new research and no Founder decision. The binding did not drift: the digest was `692483ce…` at the start, at the end and around every job.

**Routing.**
- **Chief:** record STATE_EVIDENCE_SCIENTIFIC_REGRESSION = ACCEPT (READY) together with the engineering review, and integrate the queue proposal append-only.
- **Chief with the engineering judge:** weigh NF-R7ASE-3, a projection-made tick in history, under Founder §27.
- **Runtime author with Product/UX and Data:** R41.
- **Record only:** NF-R7ASE-2.
- **Still routed:** R38, R39.
- **Next policy revision:** R35, R36.

## Files

All in `audits/domain-coaching-r7a-state-evidence-2026-10-28/reviews/`. Hashes are in the JSON (`myOutputs`).

**Deliverables:**
- `ssctr-r7ase-regression.md` (this file)
- `ssctr-r7ase-regression.json`
- `ssctr-r7ase-regression-queue-items.json`

**Instruments:**
- `ssctr-r7ase-digest.mjs`, `ssctr-r7ase-copydigest.mjs`
- `ssctr-r7ase-run.mjs`, `ssctr-r7ase-compare.mjs`, `ssctr-r7ase-build.mjs`
- `ssctr-r7ase-r12-instrument.mjs` (byte copy)
- `ssctr-r7ase-regression-probe.mjs`, `ssctr-r7ase-probe.mjs`, `ssctr-r7ase-systemic-probe.mjs`, `ssctr-r7ase-tick-probe.mjs`, `ssctr-r7ase-holdout-detail.mjs`
- `ssctr-r7ase-literature.mjs`

**Outputs:**
- `ssctr-r7ase-runs/*`
- the digest outputs `ssctr-r7ase-digest.{start,end,boundarycopy}.out.json`
- the run logs
- the validation outputs

Nothing was edited under `CoachingCore/`, in the mission files, the queue file, `product/`, `canon/`, the dossier or earlier audits.
