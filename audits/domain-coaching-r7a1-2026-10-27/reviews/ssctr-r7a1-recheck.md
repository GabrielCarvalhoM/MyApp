# SSCTR narrow re-check of R7A1-FREEZE-A2

**Revision R7A1-SSCTR-r2, 2026-10-27.** Gate `R7A1_SCIENTIFIC_REVIEW`, the single narrow re-check of the single correction cycle.

- **Target:** runtime R7A1-FREEZE-A2 at the unchanged policy R6-POLICY-5 (`18ec48f3…`).
- **Closes against:** my first review, R7A1-SSCTR-r1 on FREEZE-A1.
- **Outputs, all in this folder:** the structured record `ssctr-r7a1-recheck.json` (12 decision records) and the queue proposal `ssctr-r7a1-recheck-queue-items.json`.

## At a glance

**Verdict: `R7A1_SCIENTIFIC_REVIEW` = NOT_READY**, on one blocking finding, D59. It is new in this re-check. It already existed on R7A-FREEZE-2 and lies outside the FREEZE-A1 → A2 delta.

**Both findings of my first review are closed.**
- **D57 = CLOSED.** No covered count comes back more than one set above the largest since the break. No cap rises or ends after a non-whole week.
- **D58 = CLOSED.** The easy slot reaches the first quality slot still ahead, this week or later, in every case.

**D56 = CLOSED. D53 = OPEN.**
- D59 is a known equivalent state mode of D53: a return whose pause week holds an exercise's first executed exposures bypasses the declared return recipe.
- Founder request §10 lets D53 close only if no such mode is known. §13 requires D53 CLOSED for READY.

| Item | Ruling | Status |
|---|---|---|
| D57 | Met: grid B 0, A 0, C 0; 0 unexplained binding cap-weeks | CLOSED |
| D58 | Met: short grid 0/315 after the return and after the review; author probe 0/136 | CLOSED |
| D59 (new) | A return in the athlete's first loaded week restarts every pre-break exercise as a first establishment | OPEN, blocking |
| S1 | D56 "last" unchanged; A 0 | Holds |
| S4–S10 | Probe equal to its FREEZE-A1 output except S6 (explained) and S10 (D58 fix) | Hold |
| Long caps (L) | No cap holds a count back without a declared reason | Ruled |
| Three readings of "first quality slot still ahead" | All accepted; two more ruled | Ruled |

**My ten earlier records all bind FREEZE-A2.** They are re-bound as R7A1-SSCTR-r2 revisions. Their D57 and D58 clauses are now met, and D59 is excluded from every approval.

## Reviewer, authority and target

**Reviewer.** The SSCTR as the **documented fallback**: the native SSCTR agent type is not exposed in this session.
- A fresh default Claude Code instance (`claude-opus-5-5`), not the instance of R7A1-SSCTR-r1.
- It loaded the adapter, the constitution SSCTR-CONST-1.0.0 and the skill, then the protocol, template, schema and escalation policy.
- My instructions are the Chief's dispatch prompt. No Agent tool was used.
- I did not author the policy, the runtime, the correction or the tests.

**Authority.** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for bounded nonclinical internal sporting decisions only. This is not human, empirical or clinical validation. It carries no runtime sovereignty and no Product Truth publication.

**Target: R7A1-FREEZE-A2, verified at the start and at the end** (`ssctr-r7a1-recheck-verify.mjs`).
- Freeze file `a8c5e409…`; all 78 bound files match.
- Source digest recomputed with `value.mjs`: `71edc245cfe06a376732ec8054f2e09f277066f2ee4004f34827b2c90a1c4024`, the same at both times.
- Policy canonical hash recomputed: `18ec48f3…`; policy file `a75be1aa…`.

**Delta from FREEZE-A1, by file.**
- Changed: `r6-adaptation.mjs`, `r6-composition.mjs`, `r6-program.mjs` and `r6-provenance.mjs`.
- Added: `test/r7a1-correction.test.mjs`.
- Unchanged: the policy and the fixtures.

## What I ran

| Check | Result |
|---|---|
| `node --test` in CoachingCore (Node 24.19.0) | 505/505 pass |
| My restoration grid `ssctr-r7a1-grid.mjs` (unchanged bytes), 864 timelines | B 0, C 0; A rise/end 0 of 4,211; A2 held 0; U 237; L 677. Equal to the author's A2 re-run on every count |
| My short grid `ssctr-r7a1-short.mjs`, 315 cases | 0 defects after the return and after the review. Equal to the author's A2 re-run |
| My probe `ssctr-r7a1-probe.mjs` | Four leaves differ from its FREEZE-A1 output: S6 (two) and S10 (two). Both explained below |
| My round-12 instrument, byte copy with `R7A_PROBE_OUT` | Equal to the author's A2 output up to its own path. Against my FREEZE-A1 output, only the named D57 differences: three traces check one more climb week with no violation, and AG s5-d20 week 4 states its cap with no count changed |
| New: `ssctr-r7a1-recheck-caps.mjs` (cause of every binding cap-week), plus a NONE/NOVICE extension | 9,912 binding cap-weeks, 0 unexplained; extension (360 timelines): B 0, 0 unexplained |
| New: `ssctr-r7a1-recheck-d58.mjs` | Readings E1–E5 |
| New: `ssctr-r7a1-recheck-firstweek.mjs`, on FREEZE-A2 and the FREEZE-2 snapshot | D59 |
| New: `ssctr-r7a1-recheck-trace.mjs` | Three traces |
| Author probes, re-run read-only | Composition, D56 grid and D58 combinations: byte-equal to their A2 outputs (11/11 clean; 0/136) |
| `verify-r7a1.mjs`, without `--write` | 14/17. Open: `mutation-check` (its A2 output is not there yet), `independent-reviews` and `deliverables`. `ssctr-instrument` passes |

**Not run.**
- `npm run verify`, `simulate`, `demonstrations:r6`.
- Any earlier `verify-r*.mjs`, `regress-r7a*.mjs`, `freeze-r7a1.mjs`, `prepare-r7a1.mjs`, `queue-r7a1.mjs` or `mutation-check-r7a1.mjs`.

**Read for provenance only, after my own finding.** The engineering judge's R7A1 lines on `pauseWeek` (QE-R7A1-03). Its findings were not otherwise read.

**Authority used.** DEV_TEST_ONLY `devAuthority()`, synthetic data, offline.

## D57: closed

**What the runtime does now.**
- The return cap rises and ends only after a week whose last executed exposure did its whole count after its time fit.
- It ends only when it covers next week's normal count plus the block set that transition earns.
- The regain cap ends only at the largest count the exercise can have.

**Grid on FREEZE-A2** (FREEZE-A1 in brackets):
- B: 0 counts more than one set above the largest since the break (38);
- caps that rise or end after a non-whole week: 0 of 4,211 (806);
- caps held after a whole week below their ceiling: 0;
- C: 0.

**Both author tests pass:** the traced db-row timeline and the whole-week rule.

**Observation N4 (non-blocking).** The end test reads next week's count as this week's normal count plus the block set.
- Two other sources can raise the normal count at a transition: the NONE-class first-block clamp and a `priorSets` regain.
- Neither was reached with a cap in force in 1,224 timelines (B 0).
- Computing next week's count directly would remove the dependency.

### The long caps (the dossier's question)

**Ruling: no long cap holds a count back without a declared reason.**

My cap diagnostic gives the cause of every one of the 9,912 binding cap-weeks:

| Cause | Cap-weeks | Reading |
|---|---|---|
| At the return ceiling | 4,969 | The declared ceiling (`strengthReturnSets`; R20 reads it after the time fit) |
| First week after the steps or the re-establishment | 2,112 | Start of the cap |
| Held after a phase-reduced last exposure | 1,103 | D56 "last" |
| Held after a time-trimmed last exposure | 884 | D56 "last" (R30) |
| Rising one set | 838 | One set per whole week |
| Held after a week it was not executed | 6 | No executed week |
| **Unexplained** | **0** | |

**At the horizon,** 1,244 caps are still on and 1,200 of them bind. Their last cause:
- 773 at the ceiling;
- 267 still rising;
- 152 held after a trimmed last exposure;
- 6 binding only from week 15 (the D57 end test covering a block set);
- 2 not executed.

**Why L grows from 517 to 677.** The end of the return cap now waits for a whole week that covers next week's count. That is D57 itself.

**Cost to declare (R34, new, non-blocking).** A ceiling set by a pre-break count fitted to a short budget binds for many weeks once the budget rises (773 caps at the horizon). This is declared and conservative. The next policy revision can decide whether such a ceiling follows the count before the fit, still one set per whole week.

## D58: closed

**What the runtime does now.**
- The return records the easy-slot fact on the week re-entry starts.
- The composition gives it to the first quality slot still ahead in the week as it stands, or carries it to the next week placed.
- Exactly one slot changes.

**Evidence on FREEZE-A2.**
- Short grid: 0 defects after the return and after the review; 0 without a slot, 0 extra, 0 history changed (FREEZE-A1: 96 and 96).
- The author's combination probe: 0 of 136.
- My probe S10: a short return reported the evening of a missed last quality slot now makes next week's first quality slot easy, in both orders.

### The readings of "the first quality slot still ahead"

My probe uses a Tuesday quality run, a Thursday easy run and a Sunday long run, with a break from Friday to Sunday reported on Monday. The last executed quality was THRESHOLD 34; the planned quality was 41.

| Reading | Ruling | What my probe shows |
|---|---|---|
| (a) Systemic fatigue eased this week's quality before the return | **Accepted.** An eased run is no longer a quality slot | Fatigue first: next week's Tuesday is the easy slot (EASY 41). Return first: this week's Tuesday is the slot, and next week's Tuesday is THRESHOLD 41, held by the systemic signal. No quality run follows the fatigue report in either order |
| (b) The quality day was unavailable before the return | **Accepted.** A skipped session is not a slot; a moved one is | Tuesday skipped, not moved in this layout: next week's Tuesday is the easy slot. The author's layout moves it to Thursday, which is then the slot |
| (c) The easy slot is reported unavailable after the return | **Accepted, under the weekly-review condition** | Next week shows THRESHOLD 48 until the weekly review, then EASY 41. Without that review, a report made next week does not carry it (R18, already a condition of every record) |
| (d) Not named: the easy slot is not done (missed, or unreported) | **Accepted, non-blocking** | No slot passes on. Next week is THRESHOLD 41, the same as when the slot was done (41) and as a missed quality without a break (41). That is the declared missed-session rule (R33) |
| (e) Not named: no quality slot before a race | **Accepted, non-blocking** | Taper week (reported after its quality) or race week: the race touch and the race keep their doses, as condition 7 reads QUALITY only, unchanged since R6. The first next-block threshold after the post-event week runs easy (EASY 48, week 15) (R32) |

**What they cost.** Every reading keeps each dose at or below the planned and held doses. They are conservative. The order of reports, or a race, decides at most one quality session.

**Evidence.** Maintained intensity matters when volume falls (R6-S14, full text), which supports changing exactly one slot. Short-break detraining evidence is abstract-level only.

## The changed files and their sporting reach

| Change | Ruling |
|---|---|
| The review's inputs (systemic determination, confirmed loads) start next week for every handler (QE-R7A1-02) | Approved. Consistent with S6 and S10 |
| A return correction made in a later week supersedes the earlier report (QE-R7A1-03) | Approved. Consistent with S5. The same line still re-bases on `stateTrace[pauseWeek]`, the root of D59, which the fix does not touch |
| Same-day adaptations reach exactly the sessions still ahead (C1) in fatigue, unavailable-day and event-conflict handling (QE-R7A1-04) | Approved: my accepted C1 reading. A 06:00 systemic report now reduces that afternoon's strength |
| Moves never use a date without the session's equipment; validation refuses such a row; an equipment statement with nothing to substitute is recorded (QE-R7A1-01) | Approved. It extends my S6 complete-week hold to this handler: 82.5/20 after the statement, 85/22 after the review, equal to review-first |
| An unreadable load is filled from the other report's readable one (QE-R7A1-05) | No sporting rule. It feeds S4 the known load |

## S1 and S4–S10 still hold

- **S1:** "the last executed exposure" is unchanged in code. My grid gives A 0. The author's D56 grid output is byte-equal to its A2 output.
- **S4, S5, S7, S8, S9:** my probe sections equal their FREEZE-A1 outputs. The instrument's V_D47reviews is as on FREEZE-A1.
- **S6:** differs only by the equipment hold above.
- **S10:** differs only by the D58 fix. No quality run follows a systemic fatigue report, and no move uses a slot marked unavailable.

## D59 (new, blocking): a return in the first loaded week bypasses the return recipe

**What happens.**
- `returnAfterPause` starts the return from `program.stateTrace[pauseWeek]`, the strength state at the **start** of the break's own week.
- An exercise whose first executed exposures fall in that week, before the break, therefore has no state at the return.
- When the pause week is the athlete's first loaded week, no exercise is in use at the entry step, and no week is an entry week.
- Every exercise executed before the break then restarts as a first establishment: up to 2 sets at RIR 3, with no return step and no regain cap. It also earns the block set of the block in progress.

**Traces.**
- **NONE, STRENGTH goal, one 30-minute day.** Goblet squat 2x5 @RIR3 on Monday of week 1, then a 16-day break from Saturday. Week 4: 1x5 @RIR3 first establishment (a consolidation week). Week 5: **3x5** (1 to 3).
- **FAMILIAR (intermediate, no known loads), break from Saturday of week 0.** Re-entry 2x5 @RIR3, then 2x5, then **4x5** at 40 minutes (2 to 4).
- **The declared recipe instead:** 1 set @RIR4, step 2, then at most one set per whole week up to the ceiling of 2, which only a later completed development block lifts.

**First-week grid.** 306 cases: a 14- or 21-day break starting on Tuesday, Friday or Saturday of the first loaded week; three goals; one or two days; 20–40 minutes.
- E: the first exposure after the return is not a RETURN_ENTRY of 1 set @RIR ≥ 4.
- O: a count above the declared ceiling before a later completed block.
- B: a count more than one set above the largest since the return.

| Class | Cases | Pre-break exercises | E | O | B |
|---|---|---|---|---|---|
| NONE | 90 | 264 | 264 | 561 | 109 |
| FAMILIAR | 108 | 408 | 408 | 1,021 | 117 |
| KNOWN (control) | 108 | 408 | 0 | 72 | 0 |

**On FREEZE-2.** The R7A-FREEZE-2 snapshot gives the same NONE and FAMILIAR counts (KNOWN O 73), so D59 already existed there.

**The KNOWN control.** The entry is respected. But an exercise first done in the pause week loses its pre-break count, so its ceiling falls back to the normal count, one set too high.

**What it contradicts.** `strengthReturnSets`:
- the entry is `strengthEntrySets` at `strengthEntryMinimumRir` or more;
- the ceiling is "the last set count executed before the break";
- "the block in progress at the break earns no set".

It also contradicts the D53 restoration rule ("never at once") and Founder I6.

**Not the R23 class.** R23 covers exercises no ceiling covers. These exercises were executed before the break, so the declared text gives them a ceiling.

**Provenance.**
- R6 round 11 accepted "sessions performed in the pause week before the pause starts are not applied at the return" because they "only lengthen the clock".
- The R6 disclosure noted that no timeline had produced the branch where every exercise restarts with a normal establishment row.
- The premise does not hold for an exercise whose first executed exposure is in that week. I narrow that acceptance: it stands for exercises already in state at the start of the pause week, and is withdrawn for the others.

**Sporting weight: modest in physiology, blocking in class.**
- Moderating: one pre-break week leaves repeated-bout protection. R6-S48 (full text) finds it at 3–6 weeks; R7A1-S05 (abstract) at 6–9 weeks in untrained adults. The loads are effort-chosen at RIR 3 or more, and the counts stay within the position stand's range (R6-S01).
- Counterevidence: what is done between bouts can remove the protection (R7A1-S06, abstract).
- Why it still blocks: the jumps (1 to 3, 2 to 4) and the bypassed entry are exactly the class that blocked D53, D55, D56 and D57.
- The configuration is ordinary: a new user who takes a two-to-three-week break after the first week.

**Required change (runtime only, no policy text, no new rule).**
- The return's start state keeps, for every exercise executed in the pause week before the break: that it was performed (in use, with its last performed date), and its last executed count outside a phase reduction (the ceiling).
- The progression those exposures earned stays unapplied, as now.
- Such an exercise then enters the return steps; the block in progress earns no set; and no count exceeds the largest since the return by more than one set.

**Regression.**
- `ssctr-r7a1-recheck-firstweek.mjs` at E = O = B = 0 for NONE and FAMILIAR, and O = 0 for KNOWN;
- my restoration, cap and short grids unchanged.

**Smallest next mission (the Founder's to authorize).** A bounded runtime-only correction of D59 in `returnAfterPause`, with this regression, one freeze, and one narrow SSCTR and engineering re-check. Founder §11 allows no third cycle in R7-A.1.

## My earlier records on FREEZE-A2 (the delta check)

| Record | Binds FREEZE-A2? | Basis |
|---|---|---|
| R7A1-SSCTR-D56-FORMULATION | Yes, re-bound | D57 met; D59 excluded |
| R7A1-SSCTR-RESTORATION-SCOPE | Yes, unchanged (abstention) | U 237, the same exercises; D59 distinguished from R23 |
| R7A1-SSCTR-SAME-DAY | Yes, re-bound | D58 met; C1 in every same-day handler; readings by reference; D59 excluded |
| R7A1-SSCTR-DOSE-READING | Yes, unchanged | S4 equal; provenance change consistent |
| R7A1-SSCTR-COMPOSITION | Yes, re-bound | S5 later-week correction; S6 equipment handler; S10 D58 cases; D59 excluded |
| R7A1-SSCTR-REGAIN-BASE | Yes, re-bound | Condition 9 met for the end of the return cap |
| R7A1-SSCTR-REESTABLISH-PHASE | Yes, unchanged | C 0; AK equal |
| R7A1-SSCTR-SPLIT-WEEK | Yes, unchanged | A 0; R20 unchanged |
| R7A1-SSCTR-ITEMS-5-8 | Yes, unchanged | D55 met; D59 is a different state mode |
| R7A1-SSCTR-CYCLE2-COMPOSITIONS | Yes, re-bound | Conditions 5 (D58) and 9 (D57) met; readings by reference |

## Non-blocking recommendations

| Id | Owner | Recommendation |
|---|---|---|
| R32 (new) | Runtime author with Product Constitution & Governance | Declare whether a quality run eased by another adaptation, a race touch or a race discharges the short return's easy slot |
| R33 (new) | Product/UX with Data (G03), then the policy revision | Declare whether a slot made easy and not done owes its easy run |
| R34 (new) | Runtime author with Product Constitution & Governance | Decide whether a ceiling set by a time-fitted pre-break count follows the count before the fit once the budget rises |
| N4 (new) | Runtime author | Compute next week's normal count directly in the return-cap end test |
| R30, R31, R23, R26, R21, R17(b), R22, SHIFT-CLOCK, F-ACCESSORY-REPS, R18 | As in R7A1-SSCTR-r1 | Retained, unchanged |

## Records and queue

**Twelve records, revision R7A1-SSCTR-r2, all bound to R7A1-FREEZE-A2.**
- **New: R7A1-SSCTR-QUALITY-SLOT-READINGS**, APPROVE_WITH_CONDITIONS. Prescriptive, so it has a queue item.
- **New: R7A1-SSCTR-D59-PAUSE-WEEK-START**, REVISE (MODIFY_CANDIDATE). Not an approval, so no queue item. It narrows the R6 round-11 acceptance.
- **Re-bound: the ten R7A1-SSCTR-r1 records**, each superseding its r1 revision.

**Queue proposal R7A1-SSCTR-QUEUE-PROPOSAL-r2.**
- Ten items, `HQ-R7A1-SSCTR-R2-*`, each bound to FREEZE-A2, all QUEUED_FOR_FUNDED_HUMAN_REVALIDATION, funding NOT_DECLARED.
- One item is a new decision. Nine refine the `HQ-R7A1-SSCTR-*` items by re-binding the same decisions, without replacing them.
- It is a proposal only. I did not edit the queue file; the Chief integrates the items append-only.

## Literature access

**Tools.** Node `fetch` to PubMed E-utilities (esearch, esummary and efetch, all HTTP 200).

**Searches.** One directed search: repeated-bout duration in untrained or briefly trained people, 14 hits.

**Abstracts read.** Cleary 2002 (R7A1-S05) and Margaritelis 2015 (R7A1-S06).

**No new full text was read.** R6-S01, R6-S14 and R6-S48 (full text) and R7A-S03 to S06 (abstracts) are reused verbatim.

**Basis of the rulings.** D57, D58 and D59 rest on the declared rules, my earlier conditions and the Founder's D53 criterion. The abstracts only calibrate D59's physiological size; no ruling rests on them alone.

## Validation

**Gap.** Python and `jsonschema` are not installed, so `validate_records.py` did not run.

**Declared substitute.** My unchanged R7A1-SSCTR-r1 Node validator `ssctr-r7a1-validate.mjs`: ajv 8.20.0 against `decision.schema.json`, with the helper's cross-checks ported.

**Result.** The 12 records and the 10 queue items pass: 0 errors.

**Negative control.** A copy with a stale target hash, an altered approval condition and a missing AE answer fails with 6 errors. All three defects are caught.

This certifies record consistency only.

## Escalation and routing

**No escalation is needed for the ruling.**
- No policy text change, no clinical semantics and no Founder decision.
- The binding did not drift: the digest was `71edc245…` at the start and at the end.

**Routing.**
- **Chief:** close R7-A.1 as NOT_READY with the single blocker D59 (Founder §11: no third cycle), and integrate the queue proposal append-only.
- **Founder:** the next mission (the smallest one is above).
- **Engineering judge:** D59 is outside its reviewed findings. A future re-check should cover it.

## Housekeeping

One of my background runs, the FREEZE-2 first-week grid, started in the parent folder because of a shell grouping error. It left three of my files there: an error log, an empty output and a one-line log. I moved them to my scratchpad, deleted nothing, and reran the grid in this folder.

## Files

All in `audits/domain-coaching-r7a1-2026-10-27/reviews/`. Their hashes are in the JSON (`myOutputs`).

**Outputs:**
- `ssctr-r7a1-recheck.md` (this file)
- `ssctr-r7a1-recheck.json`
- `ssctr-r7a1-recheck-queue-items.json`

**Instruments and outputs:**
- `ssctr-r7a1-recheck-verify.mjs` with `.start` and `.end` outputs
- `ssctr-r7a1-recheck-grid.A2.*`, `-short.A2.*`, `-probe.A2.*`, `-instrument.A2.*`, `-node-test.out.txt`
- `ssctr-r7a1-recheck-caps.mjs`, `-caps*.out.json`
- `ssctr-r7a1-recheck-d58.mjs`, `-d58.A2.out.json`
- `ssctr-r7a1-recheck-firstweek.mjs` with `.A2` and `.F2` outputs
- `ssctr-r7a1-recheck-trace.mjs`, `-trace.*.out.txt`
- `ssctr-r7a1-recheck-rerun-*.A2.out.json`, `-verify-r7a1.out.json`
- `ssctr-r7a1-recheck-literature.mjs`, `-literature.out.json`, `-abstracts.out.txt`
- `ssctr-r7a1-recheck-merge.mjs`, `-build.mjs`, `-top.json`
- `ssctr-r7a1-recheck-validate.out.json`, `-validate.negative-control.out.json`

Nothing was edited under `CoachingCore/`, in the mission files, the queue file, `product/`, `canon/`, the dossier or the earlier audits.
