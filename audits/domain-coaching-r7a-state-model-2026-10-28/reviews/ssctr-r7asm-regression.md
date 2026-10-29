# SSCTR regression review of HISTORICAL-PROJECTION-FREEZE-1

**Revision R7ASM-SSCTR-r1, 2026-10-29.** Gate `STATE_MODEL_SCIENTIFIC_REGRESSION`. This is the single regression-only review of the single freeze (Founder request §26). No correction cycle follows it.

- **Target:** runtime HISTORICAL-PROJECTION-FREEZE-1 at the unchanged policy R6-POLICY-5 (`18ec48f3…`).
- **Closes against:** my previous record, R7ASE-SSCTR-r1 on STATE-EVIDENCE-FREEZE-1. That record was ACCEPT: D53 closed, D56–D59 held, NF-R7ASE-1 to NF-R7ASE-3 non-blocking, R41 and R42 routed.
- **Outputs, all in this folder:**
  - `ssctr-r7asm-regression.json`: the ruling plus 14 decision records (13 re-bound, 1 new);
  - `ssctr-r7asm-regression-queue-items.json`: a proposal of 8 queue items.

## At a glance

**Verdict: `STATE_MODEL_SCIENTIFIC_REGRESSION = NOT_READY`.**

READY would have meant only one thing: the separation demonstrably moved no prescription outside the approved recipes. It does move some, in three places. Each one is reproduced on my own probe on both runtimes, and two also appear in my unchanged grids or in the corpus. Most of my remit holds:
- E6;
- the return base;
- the R42 credit;
- run capability read from history;
- D56, D58 and D59;
- the S-F checks.

This verdict says nothing about whether the whole coach is ready, and I do not declare `R7A_EXIT_READINESS`.

| Item | Ruling | Basis, in one line |
|---|---|---|
| E6 (contract §10.1) | Approved outside the return's own week | Executed reduced weeks are credited by the review's own rule: U = R in 7 of 8 cells. In the eighth, an unavailable day dropped a session and the week stays facts only, the approved E3 boundary. After a fatigue-reduced week the cap is 2, against 3 after a whole week. In the return's own week, see F1 |
| Return base (§10.2, T13) | Approved | A return resumes 82.5 kg, the last lifted, not the 85 kg never lifted. Ceilings are never above the last executed load. The entry cap holds 18 kg, not 20 |
| R42, credit part (§10.3) | Approved | The step comes one exposure later, then progression continues (85 → 87.5 → 90) |
| R42, repetition part | **Not approved: F2** | HOLD no longer repeats the dose: 82.5 kg × 3 for a 4–6 range, or 5 → 6 repetitions on a HOLD |
| Run capability from history | Approved as the declared rule | R6-H30 is identical when the record is complete. A completion race day carries its negotiation. Exception: NF-R7ASM-1 |
| **F1** | **BLOCKING** | A return-covered accessory comes back from 1 to 3 sets at once. Restoration grid B = 2, against 0 before |
| **F2** | **BLOCKING** | See the R42 repetition part above |
| **F3** | **BLOCKING** | After a goal change to maintenance: 70 kg × 12 at RIR 3 (range 8–8) after 70 kg × 10 was executed, for 9 weeks |
| D53 | **Does not hold** | F1 |
| D56 | Holds | 0 cap rises or ends after a non-whole week |
| D57 | **Does not hold** | F1, on my restoration grid |
| D58 | Holds | Short grid 0/315; readings byte-identical |
| D59 | Holds | First-week grids E = O = B = 0 for every class |

## Reviewer, authority, freeze

**Reviewer.** I am a fresh default Claude Code session (`claude-opus-5-5`), started directly by the Founder for this review.
- I act in the project role by loading:
  - the constitution SSCTR-CONST-1.0.0;
  - the skill 1.0.0;
  - the registry;
  - the decision schema;
  - the Claude adapter.
- This is not a native dispatch of the project agent type. The registry allows that when it is labelled, as here. I used no delegation.
- I did not author the policy, the runtime, the contract or the tests.

**Authority.** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for bounded nonclinical internal decisions only. It is not human, empirical or clinical validation, and it publishes nothing.

**Freeze.** Recomputed by my own probe, at the start (`ssctr-r7asm-digest.start.out.json`) and at the end (`…end.out.json`):

| | Value |
|---|---|
| Manifest | `39b326ac11b2faa3c316fefeeb1d332cc5043d2f552067151e336a4fb6ca41a4` |
| Source digest | `0db72d0edd9fd7f1382e1ed8622d29e2ff3356699da18872b0670615956e2eb8` (recomputed; the hash is re-implemented, not imported) |
| Bound files | 83 match; 0 unfrozen, 0 missing; exactly one freeze file |
| Policy | `18ec48f3…` recomputed |
| Changes after the freeze | None: every runner job recorded `0db72d0e…` before and after it |
| Predecessor copy | `state-evidence-freeze-source/` has 0 of 82 files drifted, digest `692483ce…` |

I read the whole delta of the three runtime files. Every other runtime file is byte-identical to the predecessor.

## What I ran

All outputs are in `ssctr-r7asm-runs/`, bound to both digests in `RUNS.json`.

| Check | Result |
|---|---|
| `node --test` | 589/589 |
| `verify-r7asm.mjs`, read-only | 15/16. The failing check is `reviews-not-dispatched`, as expected now that reviews exist |
| My earlier instruments, re-run unchanged | Byte-identical to my STATE-EVIDENCE-FREEZE-1 outputs: the first-week, short, D58, same-day, ceiling and rotation grids. Different: the restoration and caps grids, my probes, x-items, x-trace-sd and 6 of 43 round-12 sections. Each one is read below |
| The same probes on the predecessor copy | They reproduce my R7ASE outputs exactly, 6 of 6, apart from the runtime label |
| New: my regression probe | It compares the return entry, exposure kinds, adaptations, `facts` and `contextBefore`. It also tallies dose session by session |
| New: full-record control | Every differing holdout case, with all weeks before its first step executed and reviewed |
| New: change probe | E6, return base, R42, view below history |
| New: repetition probe | |
| New: traces | Of F1, F3 and the D47 statement |

## Blocking findings

### F1: a return-covered count comes back two sets at once (D53, D57)

**Where.** My restoration grid finds B = 2, and my caps grid finds B = 2 with 2 covered jumps; both were 0 on the predecessor. Both instruments hit the same two timelines, `sg-ret16thu-{STRENGTH,HYPERTROPHY}-K-3-20-after3`:
- a 16-day break, reported on the Thursday of week 6;
- 20-minute strength sessions;
- a raise to 75 minutes after week 9.

**Mechanism** (`ssctr-r7asm-trace-b.mjs`, `ssctr-r7asm-trace-b2.mjs`):
1. **Week 7.**
   - The planner re-bases week 7 as the entry week for every exercise (return step 0).
   - HistoricalState instead credits the Friday entry exposures of week 6 as executed return steps (barbell-rdl, db-bench-press, db-row at step 1).
   - The week-7 review reads the view, so those three finish their return steps a week early.
2. **Week 8.**
   - The 19-minute Wednesday session now holds 2 sets each of db-bench-press and db-row.
   - It drops `db-overhead-press`, which the predecessor schedules for its return step 2 (2 sets).
3. **End of week 8.** D51 removes the overhead press's return step and ceiling, and gives it no cap.
4. **Week 10.** After the budget raise, it is prescribed 3 sets. The largest count executed since the break is 1.

**On the predecessor** the same exercise comes back 1 → 2 → 3.

**Why it blocks.** This is the question D53 was closed on: does any known state mode let a count the return recipe covers come back faster than the recipe allows? On this freeze it does. The physiological size is small: an accessory, at a load the athlete chose, at RIR 2–3. The departure from the declared rule is not small.

### F2: on the R42 path, HOLD no longer repeats the dose

**Where.** `ssctr-r7asm-reps-probe.mjs`. Before the reviewed week:
- an unreviewed week was lifted one increment light, so history holds 80 kg while the plan steps to 82.5 kg;
- the athlete then lifts 82.5 kg in a reviewed week.

**What happens.**

| Logged at 82.5 kg | Gate | This freeze | Predecessor |
|---|---|---|---|
| 3 of 5 repetitions, prescribed reserve | HOLD | 82.5 × 3, 82.5 × 3, then 85 × 3: below the STRENGTH range 4–6, and the load keeps progressing | Holds × 5 |
| 8 repetitions at reserve 0 | HOLD | The target rises to 6 | Holds × 5 |

My tick probe shows the same class: 3 × 3 and 4 × 3 at 22–26 kg.

**Cause.** `earnedAt` (`r6-program.mjs`) copies the logged repetitions into the target whatever the gate. It runs before the HOLD rule that keeps "the planned target".

**Why it blocks.** This contradicts my DOSE-READING approval and cycle-2 S2. It also reintroduces the exact defect my claim DR-1 named: "the short set walked the target below the range (3x2 and 3x3 for 4-6)".

**Scope.** It does not occur when every week is reviewed. It needs a load the plan stepped above history, which follows a light or unreviewed week, and a missed or low-reserve set.

### F3: after a goal change to maintenance, prescriptions leave the goal dose (R6-H25)

**Where.** `ssctr-r7asm-trace-h25.mjs`. It reproduces in the corpus case and also with my full record of the weeks before the first step.

**What happens.** The case has a goal change to MAINTAIN (8 repetitions, range 8–8), then the week-6 event-date re-plan.
- From week 7 to week 15, the bench press is prescribed as a from-log row: 2 × 12 at RIR 3, "use the load you logged last time", ceiling 70 kg.
- The lat pulldown is prescribed 2 × 10 the same way.
- HistoricalState holds the bench press last executed at 70 kg × 10.
- The predecessor prescribes 70 kg × 8.

That makes 20 rows outside the goal range on this freeze only.

**Why it blocks.** The rows are outside the current goal's declared dose, and 2 repetitions above the last executed set at the same load and reserve. It lasts for the rest of the program.

## Non-blocking findings

**NF-R7ASM-1: the D47 statement after a restart** (round-12 section V; `ssctr-r7asm-trace-d47.mjs`).
- **What.** After a 30-day break reported mid-week, the race statement says the athlete's longest continuous run is 45 and 50 minutes. Since the restart they have run at most 20 and 15. The predecessor says 20 and 15.
- **Cause.** In the restart week, the reducer applies the stored whole-week planned summary as executed. That summary includes a 45/50-minute run dated inside the pause, never executed.
- **Why non-blocking for my gate.** No dose or calibration changes in any of the 8 restart timelines. But it is a planned value reaching HistoricalState: **route it to the engineering judge**. Correct it before any athlete-facing use.

**NF-R7ASM-2: a partially reported return week sends the return back to its entry** (R6-H26, also with a full record).
- **What.** The case reports none of week 8's post-return sessions and 3 of week 9's 6. History holds the entry, so the week-9 review holds there. Week 10 prescribes the entry again: 15-minute runs and a 20-minute long run. That comes right after the athlete reported a 65-minute long run and step-1 strength. The predecessor holds step 1.
- **Why non-blocking.** It lowers the dose only, and the record is incomplete. This is the E5 class, now with a wider reach.

**NF-R7ASM-3: the view below history stalls progression** (change probe, part D).
- **What.** In an executed but unreviewed week, the athlete lifts 82.5 kg against an 80 kg row (D44, target met). Every later week is executed and reviewed. The plan still stays at 80 kg for four weeks, then remains one step behind. The view takes the projection's lower load and resets the credit each week, while history holds the higher load.
- **Why non-blocking.** It lowers the dose only. But earned progression is withheld.

**E5 reach (R41).**
- The R6-H30 change disappears when the record is complete (12 of 12 programs identical): a taper long run turned into an easy run, and a completion race day.
- With the weeks unreported, it is the declared rule applied to an empty record:
  - `achievedPeakBasis`;
  - `raceDayCompletion` (SSCTR D43, R9);
  - with the race negotiation present.
- R6-H18's KEEP is the holdout's preferred behaviour, and it too disappears with a complete record.

**R42 scope (pre-existing).** Both runtimes still carry an earlier credit across an athlete-initiated heavier lift (D44): 80 → 82.5 lifted → 85 kg the next week. The contract's §7 wording claims more than the code does.

## What the brief asked me to confirm

| Item | Ruling |
|---|---|
| **E6** | U equals its reviewed control in 7 of 8 cells (exact, systemic fatigue, unavailable day, equipment window; SHORT and MODERATE). A reduced week earns no cap set. The predecessor did not credit the systemic-fatigue week. Two exceptions. First, where the unavailable day dropped the strength session (SHORT), the week stays facts only and U trails R on both runtimes. That is the approved E3/S-A boundary, conservative and unchanged, but narrower than the contract's E6 example. Second, the return's own week: F1 |
| **Return base** | Within the recipe and more faithful to S-G: the entry repetitions are now the executed ones. One trivial case: the "one step short" credit carries to a lighter entry load the athlete chose |
| **R42** | The credit part is met. The repetition clause added with it is F2 |
| **Run capability** | As above, with NF-R7ASM-1 |
| **R6-H18 status change** | No regression: KEEP is the preferred behaviour |
| **R6-H26 status change** | No regression in the review itself; the later return shows NF-R7ASM-2 |
| **Risen fields** | The author's three check out: two effort-guided re-establishment rows and one from-log row with no known load, all inside their range. My session-level tally finds 73 risen fields (the author's count is path-based and misses from-log rows). Most are effort-guided rows, the last executed dose resumed (S-G, T13), or run doses that follow the credited week 5 (R41 b/c direction). The exceptions are F3 and, within E5 only, 3 R6-H18 rows |
| **S-F checks** | 0 on 22 paths |
| **State-evidence probe** | No cell ahead of its control |

## R40, R41, R42

| Item | Status |
|---|---|
| **R40** | Resolved, still applied per sport |
| **R41** | Retained non-blocking. (b) and (c) are partly reached by E6. (a) is extended: ask about unreported weeks before a return, before re-entering one, and before the taper and race week. I did not turn it into a blocker |
| **R42** | The credit part is met. The repetition part is a new regression (F2), proven by new evidence, not by promoting R42 |
| **R43 (new, for the runtime author)** | F1's correction: keep the return steps the planner re-based in step with history. Alternatively, never let D51 remove the coverage of an exercise in use at the entry because a time fit dropped it; give it a cap instead |

## Records and queue

**Records** (`ssctr-r7asm-regression.json`):

| Group | Records | Disposition |
|---|---|---|
| Re-bound, carried | QUALITY-SLOT-READINGS, D59, D56, SAME-DAY, REESTABLISH-PHASE, SPLIT-WEEK, ITEMS-5-8, INTERRUPTION-STATE | APPROVE_WITH_CONDITIONS |
| Re-bound, abstention | RESTORATION-SCOPE | ABSTAIN, unchanged |
| Re-bound, do not carry | DOSE-READING (F2), CYCLE2-COMPOSITIONS (F1, F2), REGAIN-BASE (F1), COMPOSITION (F3) | REVISE: the approved readings stand, this freeze does not implement them |
| New | R7ASM-SSCTR-STATE-MODEL | REVISE |

**Queue proposal.** 8 items `HQ-R7ASM-SSCTR-*`, one per carried approval, funding NOT_DECLARED.
- They re-bind to a freeze that is NOT_READY. The Chief decides whether to integrate them append-only or to leave the R7ASE items.
- I did not edit the queue file.

## Literature

| | |
|---|---|
| Access | PubMed E-utilities, HTTP 200 |
| Searches | The same two synthesis searches as earlier rounds |
| Result | 12 and 9 hits, the same PMIDs as R7ASE: no new synthesis, so no re-review trigger. Titles only |
| Research opened | None (Founder §26) |
| Basis of the findings | Rule conformance against approved recipes, with sources reused from earlier rounds: R6-S01, R6-S14, R6-S48, R6-S52 |

## Validation

| | |
|---|---|
| Gap | Python and `jsonschema` are not installed, so `validate_records.py` did not run |
| Substitute | My declared Node + ajv validator, with the helper's cross-checks |
| Result | 14 records and 8 queue items, 0 errors |
| Negative control | A copy with three defects (stale target hash, altered condition, missing AE answer) fails with 6 errors; every defect is caught |

This checks record consistency only.

## Not run, not read

**Not run:**
- `npm run verify`;
- any `--write`;
- any `freeze-`, `prepare-`, `queue-` or `regress-` script;
- the author's evidence runner and mutation check;
- any earlier `ssctr-*-run.mjs`.

**Not read:**
- **The engineering judge's review.** Its file names (`qe-r7asm-*`, `quality-engineering-r7asm-review.*`) appeared during my run; I saw them in a listing only. After this review was final, a shared session-memory note showed me that review's finding IDs and one-line summaries. I changed nothing because of it.
- **The author's evidence.** I read only:
  - the handoff, the brief, the contract and the checkpoint;
  - `REGRESSION_R7ASM*.json`;
  - `rows-h24-h29.out.json`.

**Nothing edited** under `CoachingCore/`, in the mission files, in the queue, in `product/`, in `canon/` or in earlier audits.

## Escalation and routing

| To | What |
|---|---|
| **Chief** | Record `STATE_MODEL_SCIENTIFIC_REGRESSION = NOT_READY` (F1, F2, F3), together with the engineering review |
| **Founder** | The next step. F1–F3 need runtime corrections inside the existing policy, then a new freeze and this regression check again. This mission allows no correction cycle |
| **Engineering judge** | NF-R7ASM-1 (a planned value reaching HistoricalState) |
| **Runtime author, with Product/UX and Data** | R41 (extended), R43, NF-R7ASM-2, NF-R7ASM-3 |
| **Clinical** | No clinical dependency |

## Files

**Deliverables:**
- `ssctr-r7asm-regression.md`
- `ssctr-r7asm-regression.json`
- `ssctr-r7asm-regression-queue-items.json`

**Instruments:**
- `ssctr-r7asm-run.mjs`, `-compare.mjs`, `-build.mjs`
- `-digest.mjs`, `-copydigest.mjs`
- `-r12-instrument.mjs` (byte copy)
- `-regression-probe.mjs`, `-holdout-detail.mjs`
- `-changes-probe.mjs`, `-reps-probe.mjs`
- `-trace-b.mjs`, `-trace-b2.mjs`, `-trace-d47.mjs`, `-trace-h25.mjs`
- `-literature.mjs`

**Outputs:**
- `ssctr-r7asm-runs/*`
- the digest and validation outputs

Hashes are in the JSON (`myOutputs`).
