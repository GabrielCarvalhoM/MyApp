# SSCTR re-check of R7A2-FREEZE-1

**Revision R7A2-SSCTR-r1, 2026-10-28.** Gate `R7A2_SCIENTIFIC_RECHECK`, the single re-check of the single freeze. No correction cycle follows it.

- **Target:** runtime R7A2-FREEZE-1 at the unchanged policy R6-POLICY-5 (`18ec48f3…`).
- **Closes against:** my R7-A.1 re-check, R7A1-SSCTR-r2 on R7A1-FREEZE-A2 (D59 blocking, D53 open).
- **Outputs, all in this folder:**
  - the structured record `ssctr-r7a2-recheck.json` (13 decision records);
  - the queue proposal `ssctr-r7a2-recheck-queue-items.json` (12 items).

## At a glance

**Verdict: `R7A2_SCIENTIFIC_RECHECK` = ACCEPT.** I found no blocking finding in my scope.

| Item | Status | Basis, in one line |
|---|---|---|
| **D59** | **CLOSED** | First-week grid E = O = B = 0 in every class; the entry happens; no block set; the ceiling equals the last executed whole count; no rise above the rules |
| **D53** | **CLOSED** | D59 was the last known equivalent state mode; I found no other in my remit |
| D56 | Holds | No cap rises or ends after a non-whole week (0 of 4,173) |
| D57 | Holds | Restoration grid B 0, C 0; 0 unexplained binding cap-weeks |
| D58 | Holds | Short grid 0/315, byte-identical to FREEZE-A2; each short break now owns its slot |
| S-A to S-H | Approved | S-C, S-D and S-H carry recorded costs or boundaries |

**Five non-blocking findings are routed.**
- **NF-1:** a session on a break's stated first day is not part of the state at the break.
- **R35:** an establishment-capped count can become the return ceiling.
- **R36:** met and missed targets give different ceilings.
- **NF-4:** a copy nit on the UNLOGGED row after a short break.
- **NF-5:** an observation outside the delta.

**One new recommendation:** R37, a prompt for executions logged after a return.

## Reviewer, authority and target

**Reviewer.** A fresh instance launched with the project adapter `.claude/agents/sports-science-concurrent-training-reviewer.md` as its system instructions.
- This is consistent with native dispatch of that type.
- The model is inherited (`claude-opus-5-5`).
- I have no Agent tool, as the adapter disallows it.
- I loaded the constitution SSCTR-CONST-1.0.0, the skill 1.0.0, the decision schema and my earlier records.
- I did not author the policy, the runtime, the interruption contract or the tests.
- I am not the instance of R7A1-SSCTR-r1 or -r2.

**Authority.** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for bounded nonclinical internal sporting decisions only.
- It is not human, empirical or clinical validation.
- It carries no runtime sovereignty and publishes no Product Truth.

**Target: R7A2-FREEZE-1, recomputed by my own probe (`ssctr-r7a2-digest.mjs`) at the start and at the end.**
- All 79 bound files match the freeze manifest.
- Source digest: `e0637ec2613acde1132d70fc64a5a6f0f1062b74d6c5cfafb6654dc1a54c7a28`.
- Policy canonical hash: `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`.
- Every job of my runner also recorded the digest before and after it; all were `e0637ec2…`.

**Delta from R7A1-FREEZE-A2.**
- Changed: `r6-adaptation.mjs`, `r6-composition.mjs`, `r6-program.mjs`.
- Added: `test/r7a2-interruption.test.mjs`.
- The policy and the fixtures are unchanged.
- I read the whole diff and the interruption contract (R7A2-COMPOSITION-3).

## What I ran

All runs are on the frozen bytes, through my runner `ssctr-r7a2-run.mjs`. Outputs and their digests are in `runs/` (`runs/RUNS.json`).

| Check | Result |
|---|---|
| `node --test` in CoachingCore (Node 24.19.0) | 519/519 pass, including the 14 R7-A.2 tests |
| My first-week grid `ssctr-r7a1-recheck-firstweek.mjs` (unchanged bytes) | 306 cases: E = O = B = 0 for NONE, FAMILIAR and KNOWN. Byte-identical to the author's run |
| My restoration grid (4 shards), cap diagnostic (4) and NONE/NOVICE extension (2) | B 0, C 0, A 0 of 4,173, held 0, U 237, L 683; caps 9,499 binding, 0 unexplained; extension 0 unexplained, B 0, uncovered jumps 186 → 98. Byte-identical to the author's runs |
| My short grid, D58 readings probe, S1/S4–S10 probe | Byte-identical to my own R7A1-FREEZE-A2 outputs |
| New: `ssctr-r7a2-firstweek-ext.mjs` (8 shards, 1,377 cases) | Moderate 14/21/28, long 29/42, missed-target, short 4/7/10. 0 on every check (details below) |
| New: `ssctr-r7a2-ceiling.mjs` (216 later-week return timelines) | 1,090 exercises at the entry, 0 ceiling disagreements |
| New: `ssctr-r7a2-items.mjs`, with traces `-trace-sd.mjs` and `-trace-rot.mjs` | S-D, S-E, S-F, S-H |
| New: `ssctr-r7a2-sameday.mjs` (72 cases) | NF-1 |
| New: `ssctr-r7a2-rotation.mjs` (24 cases) | Rotated-in exercises |
| My round-12 instrument (byte copy `ssctr-r7a2-r12-instrument.mjs`) | All 43 sections equal to my FREEZE-A2 output after folder paths are normalized (`ssctr-r7a2-r12-compare.mjs`) |
| Author outputs re-read | D56 grid: trimmed cap-weeks 206 → 200, 0 rises or ends after them. D58 combinations: 0/136 |

**Not run.**
- `npm run verify`, `simulate`, `demonstrations:r6`.
- Any `verify-r*.mjs` with `--write`, `regress-r7a*.mjs`, `freeze-r7a2.mjs`, `prepare-r7a2.mjs`, any `queue-*.mjs`.
- The author's mutation check, self-challenge and evidence runner.

**Not read.** The engineering judge's R7-A.2 files share this folder (`qe-r7a2-*`, `quality-engineering-r7a2-recheck.*`). I saw their names in a directory listing only.

**Authority used.** DEV_TEST_ONLY `devAuthority()`, synthetic data, offline.

## D59: closed

**What the runtime does now.**
- A return starts from the state at the break (`stateAtBreak`). That is the start of the break's week, or the start a return still in force set, plus the exposures executed before the break's first day, kept as facts only (`strengthAtBreak`).
- Every exercise executed before the break is in use, with:
  - its last performed date;
  - outside a return step and a phase reduction, its last executed whole count after the time fit (target met) as the ceiling.
- Nothing a review would decide is applied.
- Moderate and long returns then run `startStrengthReturn` unchanged.

**Founder §13, criterion by criterion.**

| Criterion | Evidence | Result |
|---|---|---|
| NONE and FAMILIAR: E = O = B = 0 | First-week grid: NONE 90 cases / 264 exercises; FAMILIAR 108 / 408 | 0, 0, 0 (FREEZE-A2: E 264/408, O 561/1,021, B 109/117) |
| KNOWN: O = 0 | 108 cases / 408 exercises | O 0 (FREEZE-A2: 72); E 0, B 0 |
| The return entry happens | Extended grid: every executed pre-break exercise at the entry step | E 0, not at the entry 0 |
| The block in progress earns no set | Block set earned by the end of the re-entry block | 0; O 0 up to the end of the following block |
| The ceiling is the last pertinent count executed before the break | 3,240 first-week exercises (moderate, long, 28/29-day, missed) and 1,090 later-week exercises | 0 disagreements (missed targets: the declared fallback) |
| No count rises more than the rules allow | All families; restoration grid; caps | B 0; A 0; C 0; 0 unexplained |

**The extended grid** has the same factors as the first-week grid (3 classes × 3 goals × 1–2 days × 20–40 minutes × break from Tuesday, Friday or Saturday). It adds:

| Family | Cases | Exercises | E | O | B | Ceiling ≠ | Not at entry | Block set |
|---|---|---|---|---|---|---|---|---|
| Moderate 14, 21, 28 days | 459 | 1,620 | 0 | 0 | 0 | 0 | 0 | 0 |
| Long 29, 42 days | 306 | 1,080 | 0 | 0 | 0 | 0 | 0 | 0 |
| 21 days, every pre-break target missed | 153 | 540 | 0 | 0* | 0 | 0* | 0 | 0 |

\* Against the declared fallback (an earlier executed count, else the known count).

**Later weeks.**
- `ssctr-r7a2-ceiling.mjs` runs my restoration grid's three return timelines: Monday, Thursday and 24-day returns.
- 1,090 exercises enter at the entry with 0 ceiling disagreements.
- 635 ceilings come from counts executed in the break's week.
- 28 ceilings are above the week-start value. Each comes from an executed whole count before the break, for example 4 sets executed after a block boundary.

**My R7A1-SSCTR-r2 required change is implemented as stated.**
- Facts kept: in use, last performed date, last executed count.
- Progression not applied.
- The R6 round-11 narrowing is now real: the break week's progression stays unapplied for every exercise, and its facts are kept for every exercise.

## D53: closed

D59 was the known equivalent state mode that kept D53 open (Founder R7-A.1 §10).

**Other modes I looked for in my remit.** None lets a known count come back faster than declared.

| Case | What happens |
|---|---|
| Later-week returns | Ceiling equality, as above |
| Rotated-in exercises (24 cases) | In the start state at the entry, ceiling = executed count. Two later come back by the declared D51/D52 path: rotation pauses during the return, they leave the steps with the others, and more than 28 days later they are re-established by effort at 1@3, then gain one set per week. No O, no B |
| Re-establishment before a break | Moderate: the re-establishment count is the ceiling. Short: effort-guided again, then one set per executed whole week |
| Short break during the return steps | The step reached resumes |
| Separate breaks | Each starts from its own re-entry (engineering's QE-R7A1-09) |

**Two boundaries are not restoration modes.** In both, the return holds no pre-break count for the exercise, so no declared ceiling is bypassed. The dose is the policy's untrained establishment: 2 sets or fewer at RIR 3 or more. A newer report of the same break restores the entry and the ceiling.

| Boundary | Basis | Measured | Routed as |
|---|---|---|---|
| A session executed on the break's **stated first day** | The day is a whole day of the break (contract §5, Founder I4, I6, P4) | 72 cases. First report: NONE E 51 of 51, O 140, B 16; FAMILIAR E 60 of 72, O 188; KNOWN O 16. Corrected report (start the next day): SAME_BREAK, entry with ceiling for 195 of 195 exercises, E = O = B = 0 | NF-1 |
| Pre-break sessions **logged after** the return | The return reads the record as reported (append-only, no replay) | Probe SH: FIRST_ESTABLISH 2@3, then the normal count. Reported again: entry, ceiling 2, E = O = B = 0 | R37 |

**NF-1 is the closest residual to the D59 pattern, so I state why it does not block.**
- It follows the Founder's own temporal invariants applied to the athlete's stated dates.
- It gives the untrained dose, not a restored count.
- It has a correction path.
- From a sporting view, a break's stated first day that holds an executed session is better asked (ASK) or started after that session. That is a Product/UX and Data decision (G03, joint), not a runtime correction for this mission.

## D56, D57 and D58

**D56 holds.**
- The "last executed exposure" reading is the same code, now shared (`countsOf`, `wholeCounts`).
- Restoration grid: A 0 of 4,173, held 0.
- Author D56 grid: trimmed cap-weeks 206 → 200, 0 rises or ends after them.
- L 677 → 683 and the cap-week shifts come from returns whose break starts after executed sessions of its week. Those returns now read the executed counts as the ceiling.

**D57 holds.**
- Restoration grid B 0, C 0.
- Caps: 9,499 binding cap-weeks, 0 unexplained.
- Extension: 0 unexplained, B 0.
- The extension's uncovered jumps fall 186 → 98, because the early return's first-week exercises are now covered. The remaining jumps are accessories first set up after the return (R23 class).

**D58 holds.**
- Short grid 0/315 after the return and after the review, byte-identical to FREEZE-A2.
- D58 readings E1–E5 identical; author combinations 0/136.

## Rulings S-A to S-H

| # | Ruling | Evidence |
|---|---|---|
| S-A | **Approved** | Extended grid: E, O, B, ceiling 0 in every class and length; rotation likewise |
| S-B | **Approved** | 1,620 short-return exercises. First exposure UNLOGGED (or KNOWN for known-state exercises), never above max(last executed, 2), never below RIR 3, at the executed repetitions; never above the no-break twin's week. Bodyweight first counts are equal to or below pre-break. NF-4: the row's note misstates that no load was logged |
| S-C | **Approved as declared** | Missed family 0 on every check; rises are still one set per whole week. R36 records that a missed target can leave a higher ceiling than a met one |
| S-D | **Approved** | Moderate: ceiling = re-establishment count 2, entry 1@4, held at 2. Short: UNLOGGED 2@3 under the earlier load, then one set per whole week, never above the no-break week. R35 records the cost |
| S-E | **Approved** | Two separate short breaks: Tuesday of weeks 5 and 6 eased, each with its break's identity; next quality held at 41. Same-break correction: one slot |
| S-F | **Approved** | Break before the re-entry week's review: the entry repeats, runs stay RETURN. Break after it: step 2 resumes. Never the pre-first-break dose |
| S-G | **Approved** | 0 rep mismatches for first-executed exercises. NF-5: a known exercise clamped by the goal range enters at its known reps (outside the delta, no action) |
| S-H | **Approved as a boundary** | As in D53; R37 |

**The sporting weight of the costs.** All of them are conservative: slower restoration, one repeated entry, one more eased quality session per reported break.
- A lower set count costs adaptation if it persists: R6-S52 (full text); R7A2-S01 and R7A2-S02 (abstracts, calibration only).
- That makes R35 a real but non-safety cost of the literal policy text, for its next revision.
- Repeated-bout protection over weeks (R6-S48, full text) and the position stand's range (R6-S01) support every dose given.

## My earlier records (the delta check)

All twelve R7A1-SSCTR-r2 records bind R7A2-FREEZE-1, re-bound as R7A2-SSCTR-r1 revisions. In each one:
- the binding condition names R7A2-FREEZE-1;
- the "D59 (open, blocking)" exclusion is replaced by D59's closure;
- a condition names R7A2-SSCTR-INTERRUPTION-STATE for the start state of a return.

| Record | Binds R7A2-FREEZE-1? | Basis |
|---|---|---|
| R7A1-SSCTR-QUALITY-SLOT-READINGS | Yes, re-bound | Readings unchanged; reading (a) covers a second separate break (S-E) |
| **R7A1-SSCTR-D59-PAUSE-WEEK-START** | **Closes** | New revision APPROVE_WITH_CONDITIONS (was REVISE); first queue item for it |
| R7A1-SSCTR-D56-FORMULATION | Yes, re-bound | A 0; D56 grid holds |
| R7A1-SSCTR-RESTORATION-SCOPE | Yes, unchanged (abstention) | U 237; the NF-1 and S-H boundaries join the R23 class |
| R7A1-SSCTR-SAME-DAY | Yes, re-bound | Outside the delta; short grid identical |
| R7A1-SSCTR-DOSE-READING | Yes, unchanged | S4 identical |
| R7A1-SSCTR-COMPOSITION | Yes, re-bound | S4–S10 identical; S5 read through the break identity |
| R7A1-SSCTR-REGAIN-BASE | Yes, re-bound | Condition 9 met; regain after S-D short as declared |
| R7A1-SSCTR-REESTABLISH-PHASE | Yes, unchanged | C 0; round-12 instrument |
| R7A1-SSCTR-SPLIT-WEEK | Yes, re-bound | R20 also reads the break week's ceiling |
| R7A1-SSCTR-ITEMS-5-8 | Yes, unchanged | D55 met; shared `setUp` |
| R7A1-SSCTR-CYCLE2-COMPOSITIONS | Yes, re-bound | Conditions 5 and 9 met |

**New: R7A2-SSCTR-INTERRUPTION-STATE**, APPROVE_WITH_CONDITIONS, covering S-A to S-H.

## Non-blocking findings and recommendations

| Id | Owner | Finding and recommendation |
|---|---|---|
| NF-1 (new) | Product/UX with Data (G03), then the runtime author | A session on a break's stated first day is read as after the break began. Ask whether the break began after it, or derive the start from the last executed session; never resolve it silently |
| R35 (new) | Runtime author with Product Constitution & Governance | An establishment-capped count (2 sets) as the ceiling holds the count there until a completed development block. Decide whether it, or the regain target, bounds the ceiling (still one set per whole week) |
| R36 (new) | Next policy revision | A missed target can leave a higher ceiling than a met one. Decide whether a performed count bounds the ceiling |
| NF-4 (new) | Product/UX (copy) | The UNLOGGED note after a short break should say the load logged before the break is not yet confirmed |
| NF-5 (new) | None now | Known-exercise entry repetitions (outside the delta): no action |
| R37 (new) | Product/UX with Data, runtime author | Prompt a newer report of the same break when a pre-break session is logged after the return |
| R32, R33, R34, N4, R30, R31, R23, R26, R21, R17(b), R22, SHIFT-CLOCK, F-ACCESSORY-REPS, R18 | As in R7A1-SSCTR-r2 | Retained, unchanged |

## Records and queue

**Thirteen records, revision R7A2-SSCTR-r1, all bound to R7A2-FREEZE-1.**
- Eleven re-bound records.
- D59's record, now closed.
- One new record, R7A2-SSCTR-INTERRUPTION-STATE.

**Queue proposal R7A2-SSCTR-QUEUE-PROPOSAL-r1.**
- Twelve items `HQ-R7A2-SSCTR-*`, all QUEUED_FOR_FUNDED_HUMAN_REVALIDATION, funding NOT_DECLARED.
- Two are new decisions: D59 and INTERRUPTION-STATE.
- Ten refine the `HQ-R7A1-SSCTR-R2-*` items by re-binding them, without replacing them.
- The abstention has no item.
- It is a proposal only. I did not edit the queue file; the Chief integrates the items append-only.

## Literature access

**Tools.** Node `fetch` to PubMed E-utilities: esearch, esummary and efetch, all HTTP 200.

**Searches.** Two directed searches.
- Minimal effective strength dose: 18 hits.
- Training cessation: 11 hits.
- All hits are listed in `runs/literature-search.out.json`.

**Abstracts read.**
- R7A2-S01: Androulakis-Korakakis 2020, meta-analysis.
- R7A2-S02: Nuzzo 2024, overview; the authors state a conflict of interest.
- R7A2-S03: Bosquet 2013, meta-analysis.

**No new full text was read.** R6-S01, R6-S14, R6-S48 and R6-S52 (full text) are reused verbatim.

**Basis of the rulings.** The rulings rest on the declared rules (strengthReturnSets, D49, D52, D53, D55, D58/R27), the Founder's §13 criterion and the full-text sources. The abstracts only calibrate the costs; no ruling rests on them.

## Validation

**Gap.** Python and `jsonschema` are not installed, so `validate_records.py` did not run.

**Declared substitute.** My unchanged R7A1-SSCTR-r1 Node validator `ssctr-r7a1-validate.mjs`: ajv 8.20.0 against `decision.schema.json`, with the helper's cross-checks ported.

**Result.** The 13 records and the 12 queue items pass: 0 errors (`ssctr-r7a2-recheck-validate.out.json`).

**Negative control.** A copy (in my scratchpad) with a stale target hash, an altered approval condition and a missing AE answer fails with 6 errors. All three defects are caught.

This certifies record consistency only, not citation truth or sporting safety.

## Escalation and routing

**No escalation is needed for the ruling.**
- No policy text change, no clinical semantics and no Founder decision.
- The binding did not drift: the digest was `e0637ec2…` at the start and at the end.

**Routing.**
- **Chief:** record `R7A2_SCIENTIFIC_RECHECK` = ACCEPT with the engineering re-check, and integrate the queue proposal append-only.
- **Product/UX with Data:** NF-1 and R37.
- **Next policy revision:** R35 and R36.

## Files

All in `audits/domain-coaching-r7a2-2026-10-28/reviews/`. Hashes are in the JSON (`myOutputs`).

**Deliverables:**
- `ssctr-r7a2-recheck.md` (this file)
- `ssctr-r7a2-recheck.json`
- `ssctr-r7a2-recheck-queue-items.json`

**Instruments:**
- `ssctr-r7a2-digest.mjs` (`.start`/`.end` outputs) and `ssctr-r7a2-run.mjs` (`runs/RUNS.json`)
- `ssctr-r7a2-firstweek-ext.mjs`, `-ceiling.mjs`, `-items.mjs`, `-sameday.mjs`, `-rotation.mjs`
- `-trace-sd.mjs`, `-trace-rot.mjs`
- `-r12-instrument.mjs` (byte copy) and `-r12-compare.mjs`
- `-literature.mjs`, `-build.mjs`, `-top.json`

**Outputs:**
- `runs/*.out.json` and `runs/node-test.out.txt`
- Validation outputs `ssctr-r7a2-recheck-validate*.out.json`

Nothing was edited under `CoachingCore/`, in the mission files, the queue file, `product/`, `canon/`, the dossier or earlier audits.
