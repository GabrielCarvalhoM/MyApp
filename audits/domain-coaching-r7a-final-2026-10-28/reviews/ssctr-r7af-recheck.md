# SSCTR regression re-check of R7A-FINAL-FREEZE

**Revision R7AF-SSCTR-r1, 2026-10-28.** Gate `R7A_FINAL_SCIENTIFIC_RECHECK`. This is the single regression-only re-check of the single freeze (Founder request §17, §19), and no correction cycle follows it.

- **Target:** runtime R7A-FINAL-FREEZE at the unchanged policy R6-POLICY-5 (`18ec48f3…`).
- **Closes against:** my R7-A.2 re-check, R7A2-SSCTR-r1 on R7A2-FREEZE-1 (ACCEPT; D59 closed; NF-1 and R37 routed).
- **Outputs, all in this folder:**
  - the structured record `ssctr-r7af-recheck.json` (13 decision records);
  - the queue proposal `ssctr-r7af-recheck-queue-items.json` (12 items).

## At a glance

**Verdict: `R7A_FINAL_SCIENTIFIC_RECHECK` = ACCEPT.** I found no blocking finding in my scope.

| Item | Status | Basis, in one line |
|---|---|---|
| **D53** | **CLOSED** | D59 holds, and the QE-R7A2-01 separate-break mode no longer restores the pre-break dose. I found no other mode in my remit |
| D56 | Closed, holds | 0 cap rises or ends after a non-whole week (0 of 4,173); byte-identical |
| D57 | Closed, holds | Restoration grid B 0, C 0; caps 0 unexplained; byte-identical |
| D58 | Closed, holds | Short grid 0/315; D58 readings and combinations byte-identical; one easy slot per break |
| **D59** | **CLOSED** | First-week grid E = O = B = 0 for every class; byte-identical |
| Return entry, recovery ceiling, restoration, short return | No regression | Every grid of my remit is byte-identical to R7A2-FREEZE-1 |
| F-A to F-F | Approved | F-D and F-F carry one non-blocking cost each |

**What the delta does, in sporting terms.** It does one of two things on every changed path:
- it moves the starting point of a return back to the earlier re-entry (F-A, F-B, F-E); or
- it replaces a silent reading with a question (F-C, F-D, F-F).

It adds no dose rule. The return recipe (`startStrengthReturn`), the ceilings and the easy slot are byte-identical code.

**Two non-blocking findings are routed.**
- **NF-R7AF-1 (F-D):** a pending confirmation holds back protective decisions in the re-entry week. Recommendation R38.
- **NF-R7AF-2 (F-F):** an unnamed correction that lengthens a break keeps the shorter break's resume while it is asked. Recommendation R39.

## Reviewer, authority and target

**Reviewer.** A fresh instance dispatched by the Chief as the project agent type `sports-science-concurrent-training-reviewer`.
- The model is inherited (`claude-opus-5-5`).
- I used no delegation.
- I loaded the constitution SSCTR-CONST-1.0.0, the skill 1.0.0, the decision schema and my R7-A.2 records.
- I did not author the policy, the runtime, the episode contract or the tests.
- I am not the instance of R7A2-SSCTR-r1 or of any earlier round.

**Authority.** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for bounded nonclinical internal sporting decisions only.
- It is not human, empirical or clinical validation.
- It carries no runtime sovereignty and publishes no Product Truth.

**Target: R7A-FINAL-FREEZE, recomputed by my own probe (`ssctr-r7af-digest.mjs`).**

| Check | Start (16:23:02Z) | End (16:48:02Z) |
|---|---|---|
| Source digest (canonical `hash()` over `src/*.mjs`, 43 files) | `ec2debe730df8931d1525f2b1a729ce3d808c08842fb75397d2fc91084294605` | the same |
| Freeze file `CoachingCore/r7/final/RUNTIME_FREEZE_R7A_FINAL.json` | `a5f07a3f…`; 0 of 80 bound files drift | the same |
| Policy canonical hash (recomputed) | `18ec48f3…` | the same |

Every job of my runner recorded the digest before and after it: all 33 jobs show `ec2debe7…`.

**Delta from R7A2-FREEZE-1.**
- Changed: `src/r6-adaptation.mjs`, `test/r7a1-composition.test.mjs`, `test/r7a2-interruption.test.mjs`.
- Added: `test/r7af-episode-identity.test.mjs`.
- Byte-identical to the freeze I accepted: `r6-program.mjs` (`strengthAtBreak`, `startStrengthReturn`) and `r6-composition.mjs`.
- I read the whole diff and INTERRUPTION_EPISODE_CONTRACT §2–§8.

## What I ran

All runs are on the frozen bytes, through my runner `ssctr-r7af-run.mjs`. Outputs and their digests are in `ssctr-r7af-runs/` (`RUNS.json`).

| Check | Result |
|---|---|
| `node --test` in CoachingCore (Node 24.19.0) | 528/528 pass |
| My R7-A.1 and R7-A.2 instruments, unchanged bytes, re-run here | 25 outputs byte-identical to my own R7A2-FREEZE-1 outputs (`ssctr-r7af-compare.mjs`). Three differ, each on a named path: probe S5, items SE, the same-day grid |
| My round-12 instrument (byte copy `ssctr-r7af-r12-instrument.mjs`) | All 43 sections equal; the stdout differs only by the folder it runs from |
| The author's evidence runs on this freeze | Every output byte-equal to mine, except the round-12 stdout (folder name) |
| Author outputs re-hashed, not re-run | D56 grid, D58 combinations, three-step, P01, P10, P13, P14 byte-identical to their R7A2-FREEZE-1 references |
| New: `ssctr-r7af-probe.mjs`, on this freeze and on the byte-exact R7A2-FREEZE-1 copy | F-A (4 cases), F-B (3 layouts), F-C (immaterial case), F-D (short and two moderate layouts; fatigue and review while pending), F-E (2), F-F (6, with a clinical-reason check) |
| New: `ssctr-r7af-sameday.mjs`, on both freezes | My 72 same-day cases × dates only, start before the session, start after it |

**Not run.**
- `npm run verify`, `simulate`, `demonstrations:r6`.
- Any `verify-r*.mjs` (`verify-r7af.mjs` included).
- Any `regress-`, `freeze-`, `prepare-` or `queue-` script.
- Any evidence runner: `run-evidence-r7af.mjs`, and my `ssctr-r7a2-run.mjs`.
- My `ssctr-r7a2-build.mjs`.
- The author's mutation check and self-challenge.

**Not read.** The engineering judge's `qe-r7af-*` files share this folder; I saw their names in a directory listing only.

**Authority used.** DEV_TEST_ONLY `devAuthority()`, synthetic data, offline.

## D59 and D53: closed

**D59 holds, byte for byte.**

| Instrument | Result on R7A-FINAL-FREEZE |
|---|---|
| First-week grid, 306 cases | NONE, FAMILIAR and KNOWN: E 0, O 0, B 0 |
| Extended first-week grid, 1,377 cases | E, O, B, ceiling disagreements, not-at-entry and block set all 0 |
| Ceiling equality, 1,090 exercises | 0 disagreements |
| Rotation, 24 cases | Unchanged |

**What changed next to D59 is the first day of a break (F-C, my R7-A.2 NF-1).**

| Report | Result (72 cases, 195 exercises executed only that day) |
|---|---|
| Dates only | 72 of 72 ask for the start time. R7A2-FREEZE-1 read all 72 silently as after the start |
| Start time after the session | 195 of 195 at the entry with that day's count as the ceiling; E = O = B = 0 |
| Start time before the session | The R7-A.2 NF-1 numbers exactly: the untrained establishment, first exposure at most 2 sets at RIR 3 or more |

**D53 closes.** D59 was the equivalent state mode R7-A.2 closed. After that, the engineering judge's QE-R7A2-01 showed a second one: a separate break read as the first one, restoring the pre-break dose. This freeze closes it in my scope. My F-A probe covers:
- a 16-day break;
- re-entry from Monday to Wednesday;
- a later report of the first break, either an unnamed duplicate or a named correction, made on Wednesday 22:00 or on the next Monday 06:00;
- then a Thursday-to-Sunday trip.

| | R7A2-FREEZE-1 (report after the trip began) | R7A-FINAL-FREEZE (all 4 cases) |
|---|---|---|
| The trip | Read as the first break | NEW (AFTER_REENTRY), from the first return |
| Rows at the pre-break dose | 6 (`back-squat 3x5@3 KNOWN 82.5`) | 0 |
| Ceilings | Not those of the first return | Equal to the first return's |
| Long run in the re-entry week | 70 | 20, then 45/50/55/60 |
| Over five weeks | — | O 0, J 0 |

**Why no other mode appears in my remit.**
- F-B and F-E only move a start back to the re-entry.
- The new multi-week facts loop of `stateAtBreak` reuses `strengthAtBreak`, which never updates a ceiling inside a return step.
- The one residual that lets a step come early (NF-R7AF-1) is not a state mode. It is the unreviewed-week boundary B3, already accepted, reached through an unanswered question.

## D56, D57, D58 and the rest of my remit: no regression

| Remit | Evidence on R7A-FINAL-FREEZE |
|---|---|
| D56 | Restoration grid: 0 cap rises or ends after a non-whole week (of 4,173), held 0. Caps: 9,499 binding, 0 unexplained. Author D56 grid byte-identical |
| D57 | B 0, C 0. Extension: 5,200 binding, 0 unexplained, uncovered jumps 98 (R23 class, unchanged) |
| D58 | Short grid 0/315 after the return and after the review. D58 readings and the author's combinations byte-identical. S-E unchanged (two separate short breaks, each its own slot, next quality held at 41) |
| Return entry | `returnStrength` is the R7-A.2 recipe moved into one function: SHORT resumes, MODERATE and LONG start the steps. Every probed moderate return enters at 1 set with 4 reps in reserve. 0 executed exercises not at the entry |
| Recovery ceiling | Ceiling equality 0 disagreements. F-A ceilings equal the first return's. With a stated start time after a first-day session, the ceiling is that day's count |
| Restoration | Grids, caps, extension, rotation and round-12 instrument byte-identical. F-A and F-B follow-ups: O 0, J 0 |
| Short return | Short grid byte-identical. A named shortening correction resumes the pre-break doses as R7A2-FREEZE-1 did. A same-break correction keeps one slot |

## Rulings F-A to F-F

| # | Ruling | Evidence (this freeze against R7A2-FREEZE-1) |
|---|---|---|
| F-A | **Approved** | As above: my S-F reading ("never the pre-first-break dose") is restored on the QE-R7A2-01 path |
| F-B | **Approved** | A break on the Monday after an unreviewed, unfinished re-entry week gets the same entry as the same break on the Thursday before (byte-equal; P5). Runs repeat the entry (15 and 20, then 30/30/45) where R7A2-FREEZE-1 resumed the assumed step (30 and 45, then 34/45/60, with `back-squat 2x5@3 KNOWN 82.5`). The cost is one repeated entry, within S-F. A reviewed re-entry week's decided start is used, byte-equal to R7A2-FREEZE-1 |
| F-C | **Approved; resolves NF-1** | As above. When only a last performed date differs, the earlier date is kept without asking; the other reading is equal except in dates. That reading is the conservative one: an earlier date can only bring a re-establishment threshold closer |
| F-D | **Approved; implements R37** | Monday's lifting synced after the return: the review asks to confirm. Confirmed with the same dates, the entry equals the one read in time. Cost: NF-R7AF-1 |
| F-E | **Approved** | A break first reported after a later one began is the later one's starting point. The facts executed between them are not added, which can only keep the state lower. The next week's rows equal R7A2-FREEZE-1's. Without training between them the report is asked, and the week's review still gates the next week |
| F-F | **Approved as the Founder's ASK (0.4)** | A named correction re-derives exactly as before. The same days without a name are a duplicate. A clinical reason routes to qualified assessment before identity (6 of 6). Cost: NF-R7AF-2 |

## Non-blocking findings and recommendations

**NF-R7AF-1 (F-D), recommendation R38.**
- **Owner:** the runtime author with Product/UX and Data (G03).
- **Finding:** while a confirmation-first question is pending, `staleReturn` asks on every other report in the re-entry week:
  - a systemic or local fatigue report: on R7A2-FREEZE-1 it shortened the next strength session from 30 to 15 minutes;
  - the re-entry week's own review.
- **If the question is never answered and the re-entry week is missed,** the next week keeps the step composed at the return instead of the review's hold:

| Case | Unanswered | Confirmed, or R7A2-FREEZE-1 |
|---|---|---|
| Short break | `3x5@3 FROM_LOG` | `2x5@3` |
| 16-day moderate break | Runs 30/30/45 (return step 1) | Runs 15/15/20 (step 0) |

- **Why it does not block:**
  - The runtime decides no dose here: it asks, and marks the plan as requiring reconciliation.
  - The question appears at the late log itself and is answered in one step.
  - The window is one re-entry week, and it needs a late pre-break log that changes the return.
  - The outputs equal those of an unreviewed week (boundary B3, accepted in R7-A.2).
  - The cost is nonclinical, and clinical flags are screened before this point.
- **R38:** a pending confirmation should not hold back a protective decision. A fatigue reduction, or the hold of a step whose week was not executed, should apply alongside the question; only decisions that raise the dose should wait.

**NF-R7AF-2 (F-F), recommendation R39.**
- **Owner:** Product/UX with the runtime author.
- **Finding:** an unnamed correction that lengthens a break (5 to 14 days, same end) is asked. Until it is answered, the 5-day resume stays in force:

| | Plan |
|---|---|
| While asked (the 5-day resume) | `back-squat 3x5@3 KNOWN 82.5`, runs 41/45/70 |
| The named correction (the moderate entry) | `1x5@4`, runs 15/15/20 |

- In the shortening direction, the plan left in force is the more conservative one.
- **Why it does not block:** the ASK is the Founder's decision (0.4, I9); the runtime prescribes nothing new; the question comes at the report, before any session; the cost is nonclinical.
- **R39:** present the question before the next session; Product/UX may show the more conservative entry until it is answered (still an ASK, never a silent merge).

**Earlier findings.**

| Id | Status |
|---|---|
| NF-1 | Resolved by F-C |
| R37 | Implemented by F-D (residual R38) |
| R35, R36, NF-4, NF-5 and the R7A1-SSCTR-r2 list | Retained, unchanged |

## My earlier records (the delta check)

All thirteen R7A2-SSCTR-r1 records bind R7A-FINAL-FREEZE. I re-bound them as R7AF-SSCTR-r1 revisions. In each one:
- the binding condition names R7A-FINAL-FREEZE;
- the start-state condition now cites the episode identity;
- the NF-1 and R37 boundary conditions are replaced by F-C and F-D.

| Record | Binds R7A-FINAL-FREEZE? | Basis |
|---|---|---|
| R7A1-SSCTR-QUALITY-SLOT-READINGS | Yes, re-bound | Short grid and D58 probe identical; one slot per interruption |
| R7A1-SSCTR-D59-PAUSE-WEEK-START | Yes, re-bound, closed | Grids identical; NF-1 replaced by F-C |
| R7A1-SSCTR-D56-FORMULATION | Yes, re-bound | Grids and D56 author grid identical |
| R7A1-SSCTR-RESTORATION-SCOPE | Yes, unchanged (abstention) | U 237, the same exercises |
| R7A1-SSCTR-SAME-DAY | Yes, re-bound | Outside the delta |
| R7A1-SSCTR-DOSE-READING | Yes, unchanged | S4 identical |
| R7A1-SSCTR-COMPOSITION | Yes, re-bound | S5's unnamed correction is asked; corrections are named or repeat the same days |
| R7A1-SSCTR-REGAIN-BASE | Yes, re-bound | Grid and SD traces identical |
| R7A1-SSCTR-REESTABLISH-PHASE | Yes, unchanged | C 0; round-12 instrument equal |
| R7A1-SSCTR-SPLIT-WEEK | Yes, re-bound | Ceiling equality identical |
| R7A1-SSCTR-ITEMS-5-8 | Yes, unchanged | `r6-program.mjs` identical |
| R7A1-SSCTR-CYCLE2-COMPOSITIONS | Yes, re-bound | Conditions 5 and 9 met |
| **R7A2-SSCTR-INTERRUPTION-STATE** | **Yes, re-bound and extended** | F-A to F-F added; S-H superseded by F-D; new claims IS-7 and IS-8 |

**Queue proposal R7AF-SSCTR-QUEUE-PROPOSAL-r1.**
- Twelve items `HQ-R7AF-SSCTR-*`, all QUEUED_FOR_FUNDED_HUMAN_REVALIDATION, funding NOT_DECLARED.
- Each refines its `HQ-R7A2-SSCTR-*` item by re-binding the same decision to R7A-FINAL-FREEZE, without replacing it. INTERRUPTION-STATE also extends its scope to F-A to F-F.
- The abstention has no item.
- It is a proposal only. I did not edit the queue file; the Chief integrates the items append-only (the queue holds 163 items now).

## Literature access

**Tools.** Node `fetch` to PubMed E-utilities: esearch and esummary, all HTTP 200 (`ssctr-r7af-literature.mjs`).

**Searches.** Two searches for 2025–2026 syntheses, as a currency check for re-review triggers:
- training cessation or detraining: 12 hits;
- retraining or return to training: 9 hits.

**What I read.** Titles only. No abstract or full text was read, and no ruling rests on them.

**Titles noted for the next policy revision of the return recipe.**
- PMID 41783454: athletes' fitness after the COVID-19 lockdown (Biol Sport 2026).
- PMID 39764712: training cessation in older adults (Scand J Med Sci Sports 2025; a population outside V1's core).

**Reused verbatim from earlier rounds.**
- Full text: R6-S01, R6-S14, R6-S48, R6-S52.
- Abstracts: R7A1-S05, R7A2-S01, R7A2-S02, R7A2-S03.

**Basis of the rulings.** The declared rules and the regression evidence. Repeated-bout duration (R6-S48) supports the repeated entry (IS-7). The Bosquet abstract (R7A2-S03) only calibrates the size of the pending-question costs (IS-8, PLAUSIBLE_BUT_UNCERTAIN).

## Validation

**Gap.** Python and `jsonschema` are not installed, so `validate_records.py` did not run.

**Declared substitute.** My unchanged Node validator `audits/domain-coaching-r7a1-2026-10-27/reviews/ssctr-r7a1-validate.mjs`: ajv 8.20.0 against `decision.schema.json`, with the helper's cross-checks ported. It prints only.

**Result.** The 13 records and the 12 queue items pass: 0 errors (`ssctr-r7af-recheck-validate.out.json`).

**Negative control.** A copy (in my scratchpad) with a stale target hash, an altered approval condition and a missing AE answer fails with 6 errors. All three defects are caught.

This certifies record consistency only, not citation truth or sporting safety.

## Escalation and routing

**No escalation is needed for the ruling.**
- No policy text change, no clinical dependency (clinical reasons route before identity) and no Founder decision.
- The binding did not drift: the digest was `ec2debe7…` at the start, at the end and around every job.

**Routing.**
- **Chief:** record `R7A_FINAL_SCIENTIFIC_RECHECK` = ACCEPT on R7A-FINAL-FREEZE together with the engineering re-check, and integrate the queue proposal append-only.
- **Runtime author with Product/UX and Data:** NF-R7AF-1 and NF-R7AF-2 (R38, R39), for a later mission.
- **Next policy revision:** R35 and R36.

## Files

All in `audits/domain-coaching-r7a-final-2026-10-28/reviews/`. Hashes are in the JSON (`myOutputs`).

**Deliverables:**
- `ssctr-r7af-recheck.md` (this file)
- `ssctr-r7af-recheck.json`
- `ssctr-r7af-recheck-queue-items.json`

**Instruments:**
- `ssctr-r7af-digest.mjs` (`.start`, `.start2` and `.end` outputs)
- `ssctr-r7af-run.mjs` (`ssctr-r7af-runs/RUNS.json`)
- `ssctr-r7af-probe.mjs`, `ssctr-r7af-sameday.mjs`, `ssctr-r7af-compare.mjs`, `ssctr-r7af-literature.mjs`
- `ssctr-r7af-r12-instrument.mjs` (byte copy)
- `ssctr-r7af-build.mjs` and `ssctr-r7af-top.json`

**Outputs:**
- `ssctr-r7af-runs/*`
- Validation outputs `ssctr-r7af-recheck-validate*.out.json`

Nothing was edited under `CoachingCore/`, in the mission files, the queue file, `product/`, `canon/`, the dossier or earlier audits.
