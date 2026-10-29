# R7-A Final Closure engineering re-check (R7AF-QE-r1)

**R7A_FINAL_ENGINEERING_RECHECK = NOT_READY on R7A-FINAL-FREEZE.** This is the single engineering re-check of the single freeze. No correction cycle follows it (Founder request §17).

**The answer to Founder §18 is yes, on the state side. It is no on the identity side.**
- **Identity holds.** I permuted reports in every order and timing, in 216 cells at four time zones and in three-break and short-return grids. In none of them did two different interruptions share an identity. In none of them was a correction of the same interruption (named, by report id, or a duplicate) recorded as a new episode.
- **State fails on one path.** After a return, a separate later interruption can start from the week start that the earlier return stored. That stored start includes return steps the athlete never executed. Founder 0.5 rules this out by name ("NÃO significa stateAtStartOfWeek nem stateStoredByPreviousReturn"). It takes one ordinary, unrelated review in the right window: an equipment statement, even one that changes nothing, or a systemic-fatigue report. This is **QE-R7AF-01** (MEDIUM, material, new class).

| | |
|---|---|
| Material finding | **QE-R7AF-01 (MEDIUM)**: the "earned week" rule of `executedStateAt` counts any decision as earning the week start. The second interruption then starts from the previous return's stored projection (Founder 0.5, §10, I5, P5, §13 cross-week) |
| Closed | QE-R7A2-01, QE-R7A2-02 (engineering), QE-R7A2-03, QE-R7A1-09, QE-R7A1-10, QE-R7A-01 (through its identity manifestations) |
| Not material | QE-R7AF-02 (MEDIUM): a named correction moves an interruption past its own executed re-entry. QE-R7AF-03 (LOW): a same-record duplicate with a new id restarts a completed return. QE-R7AF-04 (LOW): confirmation-first asks when a late fact moves only a last-performed date |
| Preserved | Week composition, event supersession and exercise merge (byte-identical preservation probes; P09 0 oracle violations in 5,000 sequences; 528/528 tests) |

**Who did this.** I am the Quality & Reliability Engineer (constitution 1.3.0), a fresh instance (claude-opus-5-5, effort xhigh). I did not write this runtime. I changed nothing under `CoachingCore/` and I rule on no sporting dose. Everything I wrote is in this folder with the prefix `qe-r7af-`.

## Freeze checked

R7A-FINAL-FREEZE: `CoachingCore/r7/final/RUNTIME_FREEZE_R7A_FINAL.json`.

| Check | Start (16:23 UTC) | End (16:52 UTC) |
|---|---|---|
| Source digest, recomputed (canonical `hash()` over the `src/*.mjs` SHA-256 map, as in `freeze-r7af.mjs`) | `ec2debe730df8931d1525f2b1a729ce3d808c08842fb75397d2fc91084294605` | `ec2debe730df8931d1525f2b1a729ce3d808c08842fb75397d2fc91084294605` |
| Freeze file SHA-256 | `a5f07a3f65e28fb924413ceb12ad43c124313b8ae152cbbe876f04584ad2b6f3` | same |
| Bound files that differ from the freeze (80 files: src, tests, policy, fixtures, package) | 0 | 0 |
| `node CoachingCore/scripts/verify-r7af.mjs` (no `--write`) | 16/18. Open: `independent-reviews` and `deliverables`, as expected before the re-checks | 17/18. Open: `deliverables`. `independent-reviews` passes once both re-check JSONs, this one included, are bound to the digest |
| `node --test` (CoachingCore) | 528/528 | not re-run |

Files: `qe-r7af-digest.mjs`, `qe-r7af-digest-start.out.json`, `qe-r7af-digest-end.out.json`, `qe-r7af-verify.{start,end}.out.json` and `qe-r7af-node-test.out.txt`.

## What I ran

Every script loads the runtime read-only, uses synthetic data and the DEV_TEST_ONLY authority, and prints only. Where a row says FREEZE-1, the same script also ran against the byte-exact `freeze1-source/` copy, pointed to by `QE_LIVE_ROOT`.

**Mandatory §18 probes, re-run unchanged**

| Probe | Result |
|---|---|
| P13 (`qe-a2-P13`) | Byte-identical to the author's run `bc5c8795…` |
| P14 (`qe-a2-P14`) | Byte-identical (`01ddd622…`) |
| P02 (`qe-a2-P02`) | Byte-identical (`51666e35…`). The unnamed date-shifted correction is asked at both clocks |
| P02 named (`probes/r7af-P02-named-correction.mjs`) | Byte-identical (`f4d3cf27…`). SAME_BREAK EXPLICIT, revision 2 |
| P17 (L1–L4, C1, C2) | Byte-identical (`79a1d15e…`). In every case B is NEW from A's first report (`RETURN/w5`), with 0 pre-break-dose rows and long runs of 20/45. L4's unnamed shifted A' is asked |
| P18 | Byte-identical (`3fedd524…`). (b) is asked at the late log (confirmation-first); (c) gives (a)'s rows |
| P19 (48 cells) | Byte-identical (`96ed6430…`). 0 cells read B as SAME_BREAK, 0 have the pre-break dose, 0 have a long run above 45 |
| P20 | Byte-identical (`4a1ee049…`). Week 4 Tuesday is `EASY 34`, eased for B |
| P21 | Byte-identical (`e4020fd8…`). B is NEW, TRAINING_BETWEEN, starting from A's late report |
| P09, SEED 7 and 1013, N = 2500 each | Byte-identical (`bb94153f…`, `81f1f00e…`). 5,000 sequences and 14,943 steps, 0 errors. O1, O2, O3, O4, O6 and O7: 0. O9: 6 refusals, all `phaseDose:glute-bridge:accessory` (QE-R7A1-07, pre-existing) |

**Preservation probes, re-run unchanged.** All are byte-identical to the author's runs on the frozen bytes:
- P01 `40455d17…` and P01b `b13e3834…`;
- P03 `5f283f9e…`: 2,844 of 2,844 comparisons equal across five zones;
- P04 `9b3b6afe…`, P05 `515ba090…`, P06 `c0157a12…` and P07 `66405732…`;
- P08 `75ba244a…`: D56 0/0 pure and legacy across 300 legacy rows;
- P10 `0a3a4af9…`, P15 `b05dc41a…` and P16 `87580a5e…`.

**My own probes**

| Probe | What it attacks | Result |
|---|---|---|
| `qe-r7af-P31-identity-order-grid` | A second report of A (DUP, NAMED, NAMED_BY_REPORT, NAMED_EARLIER, NAMED_SHORTER, UNNAMED_SHIFT) crossed with every clock relative to B: before B, B's first day at 06:00 and 20:00, during B, after B but before B's report, and after B's report. Three B placements (same week; next week unreviewed; next week reviewed), B unnamed or freshly named. 216 cells, at UTC, +9, −5 and −10 | Identity oracles: V1 (B never A) 0, V2 (a correction never NEW) 0, V4 (no pre-break dose, no long run above 45) 0, V5 (a report of A after B's report is asked) 0. All 216 cells are identical at the four offsets. The 28 cells flagged V3/V6 are explained below; none is an identity defect |
| `qe-r7af-P35-three-short` | Three short breaks with easy slots. B's duplicate or named correction at five clocks around C | 15 of 15 cells clean: C is NEW with its own slot, one slot per break, and B's report after C's report is asked |
| `qe-r7af-P32-late-evidence` | Late facts with the FAMILIAR and KNOWN first loaded week: synced before the return; after it inside the re-entry week (asked, then confirmed by the same dates or by name); a weekly review before confirming; after the re-entry week (B1); a week before the point, reviewed or not (B2); a late lift before a second break (L5) | 30 of 30 checks pass. The confirmed entry equals the in-time entry, and nothing loops after the confirmation. L5 shows QE-R7AF-04 |
| `qe-r7af-P33-same-day` | First-day lift: dates only; `startedAt` before or after the lift; `startedAt` with an offset or with Z; the question answered; a first-day run alone; the immaterial case. At UTC, +9 and −5 | 20 of 20 checks pass, with equal entries across time zones |
| `qe-r7af-P34-duplicates` (+FREEZE-1) | The same event id, with the same or other facts; the same record under a new id, at once and after the re-entry weeks; A's record after B; replays of A and of B; B's record under a new id | 9 of 9 checks pass. D4 is QE-R7AF-03 (also present on FREEZE-1) |
| `qe-r7af-P36-stale-false-positive` | The confirmation-first check, run before 102 ordinary reviews in re-entry weeks (R16; FW-NONE, FW-FAMILIAR and FW-KNOWN; S6) with no late evidence | 0 false confirmation questions |
| `qe-r7af-P37-explicit-names` | A's identity, or A's report id, on a later trip; a fresh name on A's days; a fresh name after re-entry; A's name after B; B corrected back across A's re-entry; a reused name | E3, E5 and E6 are asked, and E4 and E7 behave as the contract says. E1 and E2 are QE-R7AF-02 |
| `qe-r7af-P38-touching-breaks` | A break that starts on the earlier break's report day (with and without `startedAt`); touching dates with no re-entry; training recorded only by a late log | T3 is asked. In T5 the first report is asked, the late log is accepted, and B is then NEW (TRAINING_BETWEEN). T1/T2: see the B5 ruling |
| `qe-r7af-P30-earned-week`, `qe-r7af-P30b-earned-week-grid` (+FREEZE-1), `qe-r7af-P30c-reproduction` (+FREEZE-1) | The author's cross-week P5 case with one unrelated review before B | **QE-R7AF-01** |
| `qe-r7af-P30d-executed-adverse` | The "executed as planned" clause with adverse responses | No finding. A Sunday log of the whole week is a review, and the evidence rule holds the step |
| Scratch: `qe-r7af-scratch-l5diff`, `-p30rows`, `-p30cdiff` | Field-level diffs behind QE-R7AF-04 and QE-R7AF-01 | Quoted below |

**Not run:**
- `npm run verify` and `simulate`;
- any `verify-r*.mjs` with `--write`;
- any `freeze-*`, `prepare-*`, `queue-*` or `regress-*` script;
- the evidence runners (`run-evidence-*.mjs`, `ssctr-r7a2-run.mjs`) and `ssctr-r7a2-build.mjs`;
- the author's `mutation-check-r7af.mjs`, whose output I did not re-derive;
- the SSCTR grids and instrument, which are sporting content.

## QE-R7AF-01 (MEDIUM, material, new class): after a return, any decision "earns" the next week's planned start, so a separate later break starts from the start the earlier return stored

**What the freeze says it does.** Contract §4 and the code comment (`stateAtBreak`, `src/r6-adaptation.mjs:666–699`) say this: after an earlier interruption's return, a week's start is a state point only when it was earned. It is earned when that return set it, when "a decision re-planned it after the week before was over (the weekly review's rule)", or when the week before was executed as planned. Otherwise the point moves back to the return, and the executed facts are read forward from it. The contract claims that "the same history therefore gives the same state whichever side of a week boundary the interruption begins (P5)". F-B claims that, after an unreviewed and unfinished re-entry week, a later interruption "starts from the re-entry plus the executed facts, not from the week start that assumed the steps".

**What the code does** (`:674`):

```js
const earned=k=>!!R&&!late&&R.fromWeek===k||program.decisions.some(d=>d.fromWeek<=k&&localDate(d.asOf,tz)>=lastDay(k-1)&&Date.parse(d.asOf)<Date.parse(cut))||…
```

Any recorded decision with `fromWeek ≤ k`, dated on or after the last day of week k−1 and before the break, counts as earning week k's start. That includes:
- an equipment statement, which always records `fromWeek = w`, re-plans strength rows only and keeps the start (`:542`, `:554`/`:558`);
- an equipment statement for a window weeks away that changes nothing now (KEEP, still recorded);
- a systemic-fatigue REDUCE (`fromWeek = w`, `:417`).

None of these recomputes the start from the executed evidence. My field-level diff (`qe-r7af-scratch-p30cdiff.mjs`) shows the week-6 start before and after the equipment statement is identical: `storedVsWeek6AfterX = []`. The statement earned a start it never touched.

**Reproduction** (`qe-r7af-P30c-reproduction.mjs`; the grid is `qe-r7af-P30b-earned-week-grid.mjs`). Default synthetic profile. Every input is an ordinary review accepted through `evaluateProgram`.

1. **A:** a 16-day break (11-21 to 12-06), reported Monday 12-07 06:00. Re-entry starts this week. A's return also stores the conditional start of week 6, which is return step 1.
2. Tuesday's run and Wednesday's lift are executed and reported Wednesday 21:00. Thursday to Sunday are not executed, and week 5 is not reviewed.
3. **X**, Monday 12-14 06:00, one of:
   - nothing (the control);
   - an equipment statement for 12-28 to 12-31 (dumbbells and bench, a substitution there);
   - the same statement with the full kit (KEEP, recorded);
   - systemic fatigue (REDUCE).
4. **B:** a separate 2-day trip, Tuesday 12-15 to Wednesday 12-16, reported Thursday 12-17 06:00.

| X | B identity | B state point | B start = A's stored week-6 start? | Week 6 runs after B | Week 7 |
|---|---|---|---|---|---|
| none (control) | NEW, own episode | `RETURN/w5` (A) + executed facts | no: return step 0 | EASY 15, LONG 20 | `back-squat 1x5@4 ESTABLISH RETURN_ENTRY`, LONG 45 |
| equipment window | NEW, own episode | `WEEK_START/w6` | **yes** (every exercise and the run, last-performed dates aside) | EASY 30, LONG 45 | `back-squat 2x5@3 KNOWN 82.5`, return complete, LONG 60 |
| equipment, full kit (KEEP) | NEW, own episode | `WEEK_START/w6` | **yes** | EASY 30, LONG 45 | as above |
| systemic fatigue | NEW, own episode | `WEEK_START/w6` | **yes** | EASY 30, LONG 45 | as above |

In the Monday cells every strength exercise starts at return step 1, one step that was planned and never executed, and so does the run. The P30b grid widens this to three clocks (Sunday 06:00, Sunday 10:00, Monday 06:00) and five kinds of X:
- **13 of 15 cells** change B's start;
- **7** advance the run return step;
- the equipment statement does it at every clock, and systemic fatigue does it on Monday.

Some cells are earned on purpose and are not defects:
- schedule, goal and fatigue changes made on Sunday rebuild week 6 from the week's evidence;
- the Sunday weekly review is the declared earned case.

In both, the run stays at step 0 and only the exercises executed on Wednesday step. Reporting fatigue on Monday is the perverse case: it raises the dose B returns to.

**On the byte-exact FREEZE-1 copy** (`qe-r7af-P30b.FREEZE-1.out.json`, `qe-r7af-P30c.FREEZE-1.out.json`), every cell, including the control, gives step 1 with B's start equal to A's stored start. So:
- the sporting output in the X cells is R7-A.2's on this path, the output the SSCTR accepted for R7A2-FREEZE-1;
- the R7AF change (F-B) holds only when nothing else was decided. The author's test title says this: "…when nothing else was decided".

**Why it is material.**
- **Founder 0.5 names this failure.** The return start point "NÃO significa stateAtStartOfWeek nem stateStoredByPreviousReturn". In the X cells B's start is exactly both, field for field (`startEqualsStoredByA: true`).
- **Founder §10** excludes "progresso não conquistado" and "treino planejado mas não executado". Return step 1 was planned and not executed: Thursday's run, Saturday's lift and Sunday's long run were all missed.
- **§13 and §14 P5.** §13 asks that "Distinct episode — cross week" be "semanticamente equivalente". Here it is not equivalent once an unrelated equipment statement or fatigue report lands between the weeks. That is also a metamorphic failure: a no-op review changes a later interruption's state.
- **The §18 question asks about "state".** On a normal V1 path, a second interruption starts from the state the first interruption's return stored, not from its own executed state. That is two interruptions sharing state in the sense of Founder 0.1 ("uma fotografia reutilizada de outro retorno") and 0.5.

**Why MEDIUM, not HIGH:**
- identity is never wrong;
- the effect is one return step, within the prior-dose ceiling, and equal to the output R7-A.2 produced and the SSCTR accepted on this path;
- no row goes back to the pre-break dose after a 16-day break on this path.

The dose is the SSCTR's to rule on.

**Same class or new class.** New class. It is not identity: B is NEW with its own episode in every cell. It is the state-point mechanism. The mission rewrote that mechanism (the earned-week rule is new code), and the rule's predicate is broader than its contract text. Its consequence (a later separate break starts above what the athlete executed after a re-entry) is in the family of QE-R7A1-09's consequence, but it has a different cause and a bounded size.

**Why stable episode identity did not resolve it.** Identity decides which interruption a report is about, and which report of the earlier interruption was in force when B began. It is correct in every probe. Whether a week start between that report and B was earned is a separate predicate, and that predicate reads decision dates, not what the decision did to the start.

**The smallest architectural decision it needs** (Founder §23). Decide what makes a planned week start, after a return, an executed state point. Three options:
- **(a)** Only a decision that set that start from the executed evidence of the week before counts. That is the weekly review's rule, or any re-plan that applied it. Record on the week who set its start (RETURN, EVIDENCE or PLAN) and accept only RETURN or EVIDENCE. This is the contract's own wording, and the smallest change.
- **(b)** Never use a planned week start after a return: always read the facts forward from the return's entry.
- **(c)** Accept the plan's start after a return, as before any return (C3, B3), and withdraw F-B and P5 for that case. This goes against 0.5's text, so it is the Founder's call.

## Other findings (not material)

**QE-R7AF-02 (MEDIUM, not material): a named correction can move an interruption past its own executed re-entry, and that restores the pre-break dose.** Reproduction: `qe-r7af-P37-explicit-names.mjs`, E1 and E2.
1. A (16 days) is reported Monday. Tuesday's run and Wednesday's lift of the re-entry are executed.
2. A later Thursday–Friday trip is reported with A's `episodeId`, or with A's report id.

Under rule 1 this is an explicit correction of A:
- A's 16 days become a 2-day SHORT interruption;
- its point becomes `WEEK_START/w5`, the start from before A;
- the next day's plan is `back-squat 3x5@3 KNOWN 82.5` and LONG 70.

That is QE-R7A1-09's outcome. The executed re-entry is erased.

The contract guards against crossing the *previous* interruption's re-entry ("never back across the re-entry of the one before"). It has no guard against crossing the interruption's *own* re-entry, even though the record shows sessions of its own return executed before the corrected start. The author's test of this move ("A correction that moves the interruption after its own first report…") has no executed re-entry, and it checks only `stateAt.eventId`.

It is not material because explicit identity comes first in the Founder's order (0.4), and 0.2 lets a correction change start, end and duration. For the Founder: should an explicit correction whose new start lies after executions of its own return be asked (I9)? That would be the symmetric case of B4. A V1 "edit interruption" form makes this one user mistake away.

**QE-R7AF-03 (LOW, not material, pre-existing): a same-record duplicate under a new event id re-derives the return, and weeks later that restarts it.** Reproduction: `qe-r7af-P34-duplicates.mjs`, D4.
1. Weeks 5 and 6 are executed and reviewed, so the return is complete and week 7 is `QUALITY 34` / `back-squat 2x5@3 KNOWN`.
2. A's identical record is sent again under a new id in week 7.

The result is SAME_BREAK DUPLICATE (one episode, which is correct), but week 7 goes back to `RETURN_ENTRY 1x5@4` and runs of 15/15/20. This is identical on FREEZE-1, and it follows the accepted rule C5/QE-R7A1-03. Founder 0.4 says "DEDUPE". Only the same event id is deduplicated today. Deduplicating a newer report whose facts and re-derived start are unchanged (`inputHash` equal) would match the wording. That is a product decision.

**QE-R7AF-04 (LOW, not material): confirmation-first asks when a late fact moves only a last-performed date.** Reproduction: P32 L5 and `qe-r7af-scratch-l5diff.mjs`.

Saturday's lift of the re-entry week is synced after B's return. B's state changes only in `lastPerformed` (five exercises), yet every review is blocked until B is confirmed again. Contract §4 calls a date-only difference immaterial for the same day. §5 asks on any difference. This is conservative and not a defect of the §18 kind. It could be noisy for athletes who sync late.

## The 28 flagged P31 cells

These are oracle artefacts, not defects.
- **V3 (10 cells):** A2 is made on Sunday of week 5 (before B), re-plans from week 6 and sets week 6's start. B then starts from that start (`WEEK_START/w6`, earned by `R.fromWeek`). A2 was in force when B began.
- **V6 (18 cells):** with week 5 reviewed, a duplicate or named report of A made before or on B's first day re-derives A's return (C5). It drops the review's step gains, so B's start equals A2's entry rather than the control's. This is conservative, and the same rule as QE-R7AF-03.

## Blockers

| Id | Status | Evidence |
|---|---|---|
| QE-R7A-01 | **CLOSED** (through its current manifestations, Founder §6) | QE-R7A1-09 and QE-R7A1-10 no longer reproduce: P13, P14, P17, P19, P20, P31 (×4 time zones) and P35. QE-R7AF-01 is a different mechanism (the state point, not identity) |
| QE-R7A1-09 | **CLOSED** | No unnamed or freshly named report reads a separate later break as the earlier one, in any order or timing: P17 L1–L4, P19 0/48, P31 V1 0/216 ×4, P35 0/15. Through an explicit name, see QE-R7AF-02 |
| QE-R7A1-10 | **CLOSED** | Each break has its own slot, at most one: P14, P20 (`EASY 34`, eased for B), P35 15/15, test I8 |
| QE-R7A2-01 | **CLOSED** | P17 (B is NEW from A's first report), P19 0/48, P31 |
| QE-R7A2-02 | **CLOSED** (engineering) | A pre-break session logged after the return is asked (confirmation-first): P18 (b), P32 L2a/b/c (confirmed = in time, no loop). If it is never confirmed during the re-entry week, B1 applies. The dose under B1 is the SSCTR's |
| QE-R7A2-03 | **CLOSED** | P21: B is NEW (TRAINING_BETWEEN) from A's late report. Without training it is asked (test I9, P38 T5) |
| **QE-R7AF-01** | **OPEN (material)** | P30c, P30b (FREEZE-1 comparison included) |

## Rulings on the declared boundaries

| # | Ruling | Why |
|---|---|---|
| B1 | **Accepted** | P32 L3: after the re-entry week a late fact is not asked and nothing is replayed. Replay would be event sourcing (§7). The residual dose under late logging that is never confirmed is the SSCTR's |
| B2 | **Accepted** | P32 L4, reviewed and unreviewed: a late log of a week before the point is not asked and is read through that week's decision |
| B3 | **Accepted** as declared, before any return | It is the C3 rule of the closed WEEK_COMPOSITION gate. Note for the Founder: in the unreviewed case it is still "stateAtStartOfWeek" in 0.5's terms. After a return, its stricter replacement leaks through QE-R7AF-01 |
| B4 | **Accepted** | Every report of A after B's report is asked: P31 V5 0/216, P34 D5, P35, P37 E5 |
| B5 | **Accepted** | P19/P31: a report of A made on B's first day precedes B, so B starts from it. P33: a stated `startedAt` orders instants for state. Observation: identity reads only the day even when `startedAt` orders instants (P38 T1: B stated to start at 08:00 before A's 20:00 report is NEW AFTER_REENTRY, from A's entry). Conservative |
| B6 | **Accepted** | P21 and P38 T5: B is NEW (TRAINING_BETWEEN) from A's late report (`reportedAfterStart`). The sessions between A's end and its report stay in the plan before it. Conservative |

## Integrity recommendations (engineering scope)

| Verdict | Recommendation | Why |
|---|---|---|
| WEEK_COMPOSITION_INTEGRITY | **READY** | P09 O1–O7 are 0 in 5,000 sequences. The preservation probes are byte-identical to the author's runs (P01, P01b, P03, P04–P06, P10, P15, P16). 528/528 tests |
| STATE_PRESERVATION_INTEGRITY | **NOT_READY** | QE-R7AF-01: the state a later interruption starts from depends on an unrelated decision, and it can be the earlier return's stored projection |
| EVENT_SUPERSESSION_INTEGRITY | **READY** | P09 O6 0. P34 9/9: replay is KEEP, a reused id is asked, and duplicates stay one episode. P31: corrections are never NEW |
| EXERCISE_MERGE_INTEGRITY | **READY** | P07 is byte-identical to the author's run (`66405732…`) |
| RETURN_RECOVERY_CEILING_INTEGRITY (engineering) | **NOT_READY** | QE-R7AF-01: a SHORT return "resumes the last completed doses" from a step that was never completed (one return step for the run and every exercise; week 7 back at `KNOWN 82.5` without the steps). Ceilings hold: no unnamed path reaches the pre-break dose (P17, P19, P31 V4 0, P35), and D56 holds (P08). D53 and D59 are the SSCTR's |

## Is the evidence adequate?

Every author claim I re-ran matches byte for byte: the tests, P02, P13, P14, P17–P21, P09, the preservation probes and the verifier. The author's grids, self-challenge (C9, C12) and tests cover the cross-week case only "when nothing else was decided". C12 puts equipment and fatigue between the interruptions, but in the same week and with a dose oracle, so it cannot see QE-R7AF-01.

## Verdict and binding

**NOT_READY**, bound to R7A-FINAL-FREEZE:
- source digest `ec2debe730df8931d1525f2b1a729ce3d808c08842fb75397d2fc91084294605`, recomputed at start and end;
- freeze file `a5f07a3f…`;
- policy R6-POLICY-5 `18ec48f3…`, unchanged.

The material blocker is QE-R7AF-01. Following Founder §23, the next step is FOUNDER_ARCHITECTURAL_DECISION on the smallest decision stated above. QE-R7AF-02 and QE-R7AF-03 also carry a Founder decision each (explicit corrections across their own re-entry; DEDUPE of unchanged facts), but neither blocks.

Machine-readable version: `quality-engineering-r7af-recheck.json`.
