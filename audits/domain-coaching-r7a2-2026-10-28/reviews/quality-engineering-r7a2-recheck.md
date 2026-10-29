# R7-A.2 engineering re-check (R7A2-QE-r1)

**R7A2_ENGINEERING_RECHECK = NOT_READY on R7A2-FREEZE-1.** This is the single re-check of the single freeze, and no correction cycle follows it (Founder request §19).

**The answer to Founder §20 is yes.** Suppose the athlete reports the first break again after a second, separate break began, and before reporting that second break. The runtime then reads the second break as the same break:
- it supersedes the first one, and the first break's re-entry is erased;
- when the second break starts in the week the first return re-planned, the plan goes back to the dose from before the first break: `back-squat 3x5 @RIR3 KNOWN 82.5` and a 70-minute long run after a 16-day break, three days of re-entry and a 4-day trip;
- on the same path, a second short break gets no easy slot of its own (week 4 Tuesday `QUALITY THRESHOLD 41`).

Those are the outcomes of QE-R7A1-09 and QE-R7A1-10, so both stay open, and QE-R7A-01 with them.

| | |
|---|---|
| Material finding | **QE-R7A2-01 (HIGH)**: same class as QE-R7A1-09/10, a residual path of the new identity model |
| Closed | The predecessor's paths: P13 (X, X2, S), P14 and P02 |
| Preserved | Week composition, event supersession and exercise merge |
| Not material for this gate | QE-R7A2-02 (MEDIUM): declared boundary 1 has a dose effect in the D59 setting, which is the SSCTR's to rule. QE-R7A2-03 (LOW): a second, less likely source of the QE-R7A2-01 window |

**Who did this.** I am the Quality & Reliability Engineer (constitution 1.3.0), a fresh instance (claude-opus-5-5). I did not write this runtime, I changed nothing under `CoachingCore/`, and I rule on no sporting dose.

## Freeze checked

R7A2-FREEZE-1 (`CoachingCore/r7/a2/RUNTIME_FREEZE_R7A2_FREEZE_1.json`, file SHA-256 `14fd8efe…`).

| Check | Start (13:33 UTC) | End (13:50 UTC) |
|---|---|---|
| Source digest, recomputed (`hash()` over the `src/*.mjs` SHA-256 map, as in `freeze-r7a2.mjs`) | `e0637ec2613acde1132d70fc64a5a6f0f1062b74d6c5cfafb6654dc1a54c7a28` | `e0637ec2613acde1132d70fc64a5a6f0f1062b74d6c5cfafb6654dc1a54c7a28` |
| Policy | R6-POLICY-5 `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c` | same |
| Bound files that differ from their recorded SHA-256 | 0 of 79 | 0 of 79 |
| `node CoachingCore/scripts/verify-r7a2.mjs` (no `--write`) | 17/19 (open: `independent-reviews`, `deliverables`) | 17/19, same |

Files: `qe-r7a2-digest.mjs`, `qe-r7a2-digest.{start,end}.out.json`, `qe-r7a2-verify.{start,end}.out.json`.

## What I ran

All my scripts are in this folder. They print only, load the runtime read-only, and use synthetic data with the DEV_TEST_ONLY authority.

| Run | Result |
|---|---|
| `node --test` (CoachingCore) | 519/519 |
| **P13** (QE-R7A1-09) | X, X2 and S keep the re-entry. 0 rows above what was executed since the first return, and 0 above the re-entry plan. Byte-identical to the author's run |
| **P14** (QE-R7A1-10) | Both breaks: week 4 Tuesday `EASY 34`, the second break's own slot (`easedFor`). One slot per break. Byte-identical to the author's run |
| **P02** (same-break correction across the week boundary) | Byte-identical to the author's run and to FREEZE-A2 |
| **P09**, seeds 7 and 1013, N = 2,500 each | 5,000 sequences, 14,943 steps, 0 errors. O1, O2, O3, O4, O6 and O7: 0. O9: 6 refusals, all `phaseDose:glute-bridge:accessory` (QE-R7A1-07). Both byte-identical to the author's runs and to FREEZE-A2 |
| P01, P01b, P03, P04, P05, P07, P08, P10, P15, P16 | Byte-identical to the author's runs and to FREEZE-A2 |
| P06 | Byte-identical to the author's run. It differs from FREEZE-A2 in one row only: the declared entry rep target (`db-calf-raise` and `dead-bug` at 1x7@4, were 1x5@4; S-G, the SSCTR's) |
| **P17** (new): a report of the first break made after a separate break, then that break's report | **QE-R7A2-01.** Same rows on the byte-exact FREEZE-A2 copy |
| **P19** (new): 48-cell interleaving grid | Bounds QE-R7A2-01 to one timing class (below) |
| **P20** (new): P14 with the same late report | QE-R7A1-10's outcome comes back |
| **P21** (new): a late first report whose stated end is before its report day | The same window from its other source (QE-R7A2-03) |
| **P18** (new): declared boundary 1, NONE, FAMILIAR and KNOWN | QE-R7A2-02 |
| One scratch mutant (session scratchpad): the relation fixed alone | Still starts the later break from before the first one, so the state point is implicated too |

The predecessor probes ran unchanged from `audits/domain-coaching-r7a1-2026-10-27/reviews/`. The byte comparison is in `qe-r7a2-preservation.compare.txt`.

**Not run:**
- `npm run verify`, `simulate` and `demonstrations:r6`;
- any `verify-r*.mjs` with `--write`, and `verify-r7a1.mjs`;
- `regress-r7a*.mjs`, `freeze-r7a2.mjs`, `prepare-r7a2.mjs` and any `queue-*.mjs`;
- the author's `mutation-check-r7a2.mjs` and the SSCTR instrument. The evidence record covers them;
- the SSCTR grids (first-week, restoration, cap, short). They are sporting content, and the SSCTR re-checks them in parallel.

## The three blockers

| Id | Status | Why |
|---|---|---|
| QE-R7A1-09 (HIGH) | **OPEN** | Its reproductions (P13 X, X2, S) are closed. Its statement still holds on a normal path: "a separate, later break is read as a correction of the earlier one, and the re-entry is erased" (QE-R7A2-01: P17 L1–L4, and 12 of 12 P19 cells in that timing) |
| QE-R7A1-10 (MEDIUM) | **OPEN** | P14 is closed. Through QE-R7A2-01, the second short break is read as the first, finds the first break's slot already run and records none. Week 4 Tuesday runs `QUALITY THRESHOLD 41` (P20), which is the FREEZE-A2 output of P14 |
| QE-R7A-01 (HIGH) | **OPEN** | Through the two above: a later report destroys valid future state (the executed re-entry, a break's own slot) |

## QE-R7A2-01 (HIGH, material): a report of the first break made after a separate break began turns that separate break into the first one

**Class.** This is the Founder's I1, I3 and I9 class, and that of QE-R7A1-09 and QE-R7A1-10. It is also P6: moving only the time of the first break's report changes which entity the second break is.

**Mechanism.** One cause in two readings, plus the slot rule that follows from them.

1. **The relation** (`interruptionEpisode`, `src/r6-adaptation.mjs:615-620`).
   - A report is NEW only if its break begins on or after the report day of the latest live return (`start >= last.day`, :617). Otherwise it is SAME_BREAK when it does not end before that break began (:618).
   - A newer report A' of the same break keeps the break's dates but has a later report day. So the SAME_BREAK window `[A.start, A'.day)` now covers the re-entry the athlete executed after A's first report.
   - Any separate break that began before A' was made falls in that window.
2. **The state point** (`stateAtBreak`, :632-648).
   - A return is a point only if it is live now (`liveReturns`, :600) and was reported in the break's week on or before the break's first day (:635-638).
   - The report whose re-entry the athlete executed (A) is superseded by A'. A' was made after the break began.
   - So no point covers the re-entry, and the point falls back to `startBeforeReturn`, the start from before A.
   - My scratch mutant reads B as NEW and still starts it from `WEEK_START/w5`, with six pre-break-dose rows and a 70-minute long run. Fixing the relation alone is not enough.
3. **The easy slot** (`slotRun`, :707). With the relation wrong, the second short break carries the first break's identity, finds that break's eased slot already run and records none (I9 broken through I1).

Both readings decide against the record's current supersession and the latest report's clock. Neither reads the record as it stood when the break began. So a report made after a break began reaches back and changes which break that is, and what was in force when it began. This is I4 and I6 applied to the record of reports, not only to the executed exposures.

**Reproduction** (`qe-r7a2-P17-late-correction-then-separate-break.mjs`). Default synthetic profile: runs Tue/Thu/Sun, strength Wed/Sat. Weeks 0–2 are trained and reviewed; weeks 3–4 are not trained.
1. **A:** a 16-day break (2026-11-21 to 12-06), reported Monday 2026-12-07 06:00. MODERATE, so re-entry starts this week: `back-squat 1x5@4 ESTABLISH`, runs 15/15/20.
2. Monday to Wednesday are executed and reported.
3. **B:** a separate trip, Thursday 12-10 to Sunday 12-13 (4 days, SHORT).
4. **A':** Monday 12-14 06:00, A reported again. Correctly recorded as SAME_BREAK of A. The variants:
   - same dates with another reason text (L1);
   - week 5 reviewed on Sunday (L2);
   - A' made on Friday, during B (L3);
   - A's first day moved one day earlier (L4).
5. **B reported:** Monday 12-14 07:00.

| Case | B is recorded as | Week 6 after B | Week 7 start |
|---|---|---|---|
| L1, L2, L3, L4 | `SAME_BREAK` of A', episode A, `stateAt WEEK_START/w5`; B is the only live return | `back-squat 3x5@3 KNOWN 82.5`, `db-bench-press 3x6@3 KNOWN 20`, `db-row 3x5@3 KNOWN 22` (6 rows at the pre-break dose); long run **70** | `KNOWN 85`, no return step; run EASY 45/75 |
| C1: B reported before A' | `NEW`, `stateAt RETURN` (A); A' is **ASK** | `1x5@4` re-entry; long run 20 | return step 1; run RETURN |
| C2: B alone | `NEW`, `stateAt RETURN` (A) | as C1 | as C1 |

Every input is a valid synthetic review through `evaluateProgram`, and every status is MODIFY. On the byte-exact FREEZE-A2 copy, L1–L4 give the same rows, and C2 fails there too (the original QE-R7A1-09). So R7A2-FREEZE-1 closed C2 and the P13 paths, but not this ordering.

**The class, bounded** (`qe-r7a2-P19-identity-interleaving-grid.mjs`, 48 cells). The grid crosses:
- when A' is made: before B, on B's first day, after B ended, or after B's report;
- what A' states: the same dates, an earlier first day, or a later last day;
- where B starts: in week 5 or week 6;
- B's length: 2 or 4 days.

| When A' is made | B read as SAME_BREAK | Rows at the pre-break dose |
|---|---|---|
| Before B began, or on B's first day | 0 of 24 | 0 |
| After B began (the day after it ended), before B's report | **12 of 12** | **6 of 6** with B in A's re-entry week. With B in the next week, the rows equal the B-first control (long 45/60) and only the identity is wrong |
| After B's report | 0 of 12 (A' is ASK) | 0 |

P17 L3 places A' on a later day of B (Friday), which falls in the same class. My long-run oracle (45 minutes) flagged the week-6 cells. Those were false positives: their 45/60 equals the control's, which is the declared conditional start (boundary 3).

**The easy slot** (`qe-r7a2-P20-late-correction-easy-slot.mjs`). P14 with A' made on Saturday 06:00, after the second short break ended, and B on Saturday 07:00. B is SAME_BREAK of A and records no slot, and week 4 Tuesday runs `QUALITY THRESHOLD 41`. With B before A', or B alone, week 4 Tuesday runs `EASY 34` (`easedFor` B).

**Why nothing caught it.**
- **The tests** (`r7a2-interruption.test.mjs`) and the author's self-challenge always make a same-break report before the next break begins. Self-challenge C4 corrects A before B; C3 corrects B before D.
- **P09** always ends a break the day before its report, so the window never opens.
- **The mutation check** cannot measure a condition that was never written.

**Is it a normal V1 path?** Yes:
- Each step is an ordinary athlete action that the runtime accepts without a question: a return after a trip, re-entry sessions, a second trip, then on coming back, editing the first trip's report before reporting the second one.
- Founder §10 requires both a correction in a later week and a distinct break across the week boundary, and §18 names a corrected break followed by a new one, late reports and timestamp order.
- The two orders of the same two reports give different entities and different doses.

## Other findings

**QE-R7A2-02 (MEDIUM, not material for this gate): the consequence of declared boundary 1 is larger than the brief states.**

`qe-r7a2-P18-record-as-reported.mjs` uses the first loaded week (strength Monday/Thursday) and a 14-day break from Saturday, in three orders:
- (a) the sessions before the break are logged before the return;
- (b) they are logged the same morning, one hour after the return;
- (c) as (b), then the same break is reported again.

Over five weeks of rows from the return:

| Profile | Rows where (b) prescribes more than (a) | Example |
|---|---|---|
| NONE | 30 of 40 | `goblet-squat 2x5@3 ESTABLISH` against the entry `1x5@4` |
| FAMILIAR | 36 of 40 | the same pattern |
| KNOWN | 9 of 40 | the same pattern |

(c) gives (a)'s rows exactly (0 of 40 differ).

The brief says the two orders give equal rows and differ only in last performed dates. That is true for the R7-A.1 evening-grid pair. In the D59 setting it is not: logging after the return bypasses the entry for first exposures.
- **Engineering side:** this follows the runtime's no-replay rule, so it is not a blocker of this gate.
- **The SSCTR** rules whether that dose is acceptable (D59 E under late logging).
- **Product/Founder:** decide whether a late fact of a break's week should re-derive that return, or prompt a same-break report (the runtime supports the latter).

**QE-R7A2-03 (LOW, not material): the window's second source.** `qe-r7a2-P21-gap-before-late-report.mjs`:
1. Wednesday is trained.
2. A (Monday–Tuesday) is reported late, on Saturday, with its dates stated.
3. B (Thursday–Friday) is reported on Sunday. It is SAME_BREAK of A and supersedes it.

This order is less likely, because the athlete knew of B when reporting A. A fix of QE-R7A2-01 should cover it.

## Rulings on the declared boundaries

| # | Boundary | Ruling | Why |
|---|---|---|---|
| 1 | The record as reported | **Accepted** as an engineering rule; **not** a regression of WEEK_COMPOSITION_INTEGRITY | No replay is the rule for every transition, and a same-break report re-reads the record. Composition rows are not involved. Its consequence is understated: QE-R7A2-02 (dose for the SSCTR) |
| 2 | ASK for a report ending before the latest break began, or spanning an earlier re-entry | **Accepted** | Asked as declared (test; 12 of 12 P19 cells; P17 C1). The defect is the complementary SAME_BREAK window (QE-R7A2-01), not this ASK |
| 3 | The point is the plan's start of the week | **Accepted** | Consistent with C3 for every week. Observation: an unreviewed week counts as executed as planned (P19 week-6 cells). Pre-existing |
| 4 | The plan before a return | **Accepted** | C5, tested. Observation, not probed further: `beforeReturn` judges a same-day session at the report clock without the ledger (pre-existing), so a session of the report day logged before the report counts as after it. In reading, the effect is limited to last performed dates |
| 5 | A break's first day is a whole day | **Accepted** | Consistent with I6. P5 and P6 hold for report time. A session executed on the stated first day leaves the state, as a late log does (QE-R7A2-02 effect when nothing else is in the return) |
| 6 | The two pre-freeze refinements | **Accepted** | Correct for a true same-break report and for QRE-R6-14. The slot rule is the step through which QE-R7A2-01 reproduces QE-R7A1-10's outcome; the defect is the relation, not the refinement |

## Integrity recommendations (engineering scope)

| Verdict | Recommendation | Why |
|---|---|---|
| WEEK_COMPOSITION_INTEGRITY | **READY** (engineering) | Composition is unaffected: the preservation probes are byte-identical (P06: the declared row), P09 O1–O7 are 0 in 5,000 sequences, and the tests pass 519/519 |
| STATE_PRESERVATION_INTEGRITY | **NOT_READY** | QE-R7A2-01; QE-R7A1-09, QE-R7A1-10 and QE-R7A-01 stay open through it |
| EVENT_SUPERSESSION_INTEGRITY | **READY** (engineering) | Not touched by the delta. P09 O6 is 0 in 5,000 sequences |
| EXERCISE_MERGE_INTEGRITY | **READY** | P07 is byte-identical to FREEZE-A2 |
| RETURN_RECOVERY_CEILING_INTEGRITY | **NOT_READY** (engineering side) | QE-R7A2-01 bypasses the return steps after a 16-day break. D56 holds (P08 0/0). D59 and D53 are the SSCTR's; QE-R7A2-02 reports a D59 dose effect under late logging |

## Is the evidence adequate?

Every claim of the brief that I re-ran matches: the tests, P13, P14, P02, P09, the preservation probes and the verifier. The evidence has one gap: no test, self-challenge case, mutant, grid or random sequence makes a report of a break after a later break began. That is the window QE-R7A2-01 uses.

## Verdict, binding and what NOT_READY records

**NOT_READY**, bound to R7A2-FREEZE-1: source digest `e0637ec2613acde1132d70fc64a5a6f0f1062b74d6c5cfafb6654dc1a54c7a28`, policy `18ec48f3…`, recomputed at start and end.

- **Blocker:** QE-R7A2-01 (HIGH). QE-R7A1-09, QE-R7A1-10 and QE-R7A-01 stay OPEN through it.
- **Root cause:** a report's break and its starting point are read from the record's current supersession (the latest live report and its clock), not from the record as it stood when the break began.
  - A report of an earlier break, made after a later break began, moves the latest report clock past that later break.
  - It also removes from the returns in force the report whose re-entry the athlete executed.
- **Reproduction:** `qe-r7a2-P17-…mjs` (L1–L4 against the controls C1 and C2), `qe-r7a2-P19-…mjs` and `qe-r7a2-P20-…mjs`, all in this folder.
- **Same architecture or a new class:** the same class (break identity), in the same architecture. R7-A.2 added an identity and a state at the break, but it decides both against the latest report. So an interleaving it did not anticipate reproduces both earlier outcomes.
- **The smallest architectural decision** (for the Founder; no cycle follows this freeze). Decide a report's break and its starting point from the record as it stood on the break's first day:
  1. **The relation.** A report is the same break only when its stated days overlap or adjoin the days that episode states, or it begins before the episode's first report (its re-entry). A break that begins after an episode's re-entry and after its stated days is a new break, whenever a later report of the earlier one was made. A narrower variant asks instead of deciding NEW.
  2. **The state point.** It is the return in force on the break's first day by report time, including a report that a later same-break report superseded after the break began.

  Both parts are needed: the scratch mutant shows that fixing the relation alone still starts the later break from before the first one.

Machine-readable version: `quality-engineering-r7a2-recheck.json`.
