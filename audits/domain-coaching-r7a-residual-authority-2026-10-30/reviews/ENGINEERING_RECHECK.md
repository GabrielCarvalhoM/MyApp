# QUALITY & RELIABILITY ENGINEERING — NARROW RECHECK — R7A-RESIDUAL-AUTHORITY-FREEZE-1

**Recheck:** R7ARA-QE-r1, 2026-10-31. Independent Quality & Reliability Engineering judge, in a new session; not the author. I made no runtime, frozen-test, freeze-record or evidence change, no fix and no freeze. I do not start R7-B0, run the SSCTR, or issue `R7A_EXIT_READINESS`.

**Scope** (Founder recheck request; brief [ENGINEERING_RECHECK_BRIEF.md](ENGINEERING_RECHECK_BRIEF.md)): the two root causes **QE-R7ADA-01** (A) and **QE-R7ADA-02** (B), **R7ARA-SELF-01**, the properties **A/B/E** they touch, and read-only **preservation** (F1–F4, D53, D56–D59, HOLD, MAINTAIN). Nothing else was reopened.

```
R7A_RESIDUAL_AUTHORITY_ENGINEERING_RECHECK = READY
RECHECK_INVALID = NO   (bytes equal to the freeze at the start and at the end of the recheck)
```

> **Is QE-R7ADA-01 closed as a material class?** Yes.
> - The same canonical facts now give the same factual truth through every decision entrypoint the runtime dispatches.
> - That covers 27 entrypoint variants of the 18 review kinds, 8 correction/retraction/conflict shapes and 4 arrival timings (Monday; the same day before a PM session; the week's last day; an AM session before noon).
> - Candidate: **0 of 856** cells violate. Predecessor: **433** on the same grid.
> - The confirmation rule is intact (D44 asks above the corrected row; D45 waits on an establishment), and no stale planned row resurrects retracted history (0 of 56 chains; predecessor 28).
>
> **Is QE-R7ADA-02 closed as a material class?** Yes.
> - No return starts above the running state or dose last executed and tolerated: walk/jog, the walk/jog exit, EASY long and easy runs, moderate `returnTo`, SHORT/MODERATE/LONG breaks, repeated pauses.
> - Candidate: **0 of 236** single-pause cells (predecessor 65), **0 of 18** repeated-pause cells (predecessor 8), Q06c **0 of 21** (predecessor 11).
>
> **R7ARA-SELF-01** reproduces on the superseded bytes (`259ab3ef…`: return step 1 at 30/30/45, no entry) and is absent on the freeze (15/15/20 entry, target 30/45 = executed since the entry). So is its adjacent restart-switch class.
>
> **No regression of A/B/E or of the preservation set is caused by this freeze.** Four observations are recorded as NONBLOCKING (§8). The nearest to the gate, **QE-R7ARA-OBS-1**, is a pre-existing residual at the accepted C1 noon boundary, identical on the predecessor for every entrypoint.

## 1. Integrity

| Check | Result |
|---|---|
| Branch | Recheck recorded on `review/r7ara-residual-authority-engineering`, created from the handoff `4917489364bb1138f8d82b46c20dd65d1bf693c7`. The baseline `claude/r7a-residual-authority-closure` is read-only here and was not pushed |
| Ancestry | `5434b32` (baseline) → … → `d95181a` → **`7d2da3603e224124696a2290766ec448080f3264` (freeze)** → **`4917489` (handoff)**. The predecessor freeze `d4631cd` is an ancestor |
| Freeze commit | All 86 bound files' git blobs at `7d2da36` equal the record. The freeze record at `7d2da36` equals the working tree |
| Handoff commit | `4917489` changes only `CURRENT_MISSION.md`, `MISSION_LEDGER.md` and `REVIEW_HANDOFF.md`. It touches no runtime, test, probe or evidence file. All 86 bound blobs at `4917489` equal the record |
| Source digest | **`e7172eb2e65bfb1da4c102a7efa2bae64bf1c70b06562fd3ce9896defd6dc17d`**, recomputed with my own canonical serializer in Python and in JS (not the runtime's), cross-checked with the runtime's `hash()`. Equal at the start and the end (`qe-r7ara-runs/integrity.start.out.json`, `integrity.end.out.json`) |
| Manifest | **`3d214fb53f62e45ca7d99f39f2c562d358719a2264c2de46098d39b318c85125`**: 86 of 86 match (43 `src`, 38 `test`, policy, 3 dev fixtures, `package.json`). None missing, unbound or stray |
| Policy | R6-POLICY-5, canonical hash **`18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`**, recomputed; file SHA-256 `a75be1aa…`, unchanged |
| Predecessor | R7A-DECISION-AUTHORITY-FREEZE-1, rebuilt by me from git `d4631cd` (`git archive`), not from the author's copy. Source `3a7166b2…` and manifest `a500cdd9…` recomputed. The embedded `decision-authority-freeze-source/` equals `d4631cd` byte for byte (85/85) |
| Superseded round | Rebuilt by me from git `b9fd42d` (`f373b6c` has the same source). Source digest **`259ab3ef…`**, equal to `SUPERSEDED_ROUND_R7ARA.json` |
| Runtime delta | Recomputed: `src/r6-adaptation.mjs`, `src/r6-program.mjs`, `test/r7ab-week-start-authority.test.mjs` (edited in place), `test/r7ara-residual-authority.test.mjs` (added) |
| `node --test` | **673 of 673**, Node **v24.19.0** (official build via nvm, checksum verified), `qe-r7ara-runs/node-test.out.txt`. The locked `ajv@8.20.0` was installed with `npm ci --ignore-scripts` into the git-ignored `node_modules/`, which is not a bound file |
| `node CoachingCore/scripts/verify-r7ara.mjs --tests` | **13 of 13** before any review file existed. My first attempt gave 12/13, with `suite` failing; the cause was environmental: `ajv` was not installed, so 8 test files could not load it. After `npm ci` the same command passed 13/13. At the end, 12 of 13: only `reviews-not-dispatched` fails, by design, because this recheck writes into `reviews/` (`qe-r7ara-runs/verify-r7ara.end.out.json`) |

**Not run:** any `--write`, `freeze-*`, `prepare-*`, `queue-*` or `regress-*` script. The author's evidence runner was not run either.

**How runs are bound:** every probe ran through `qe-r7ara-run.mjs`, which recomputes the tree's source digest before and after, and the candidate's too.
- 49 runs, all bound and all exit 0 (`qe-r7ara-runs/RUNS.json`).
- 22 kit re-runs, all bound (`qe-r7ara-runs/kit/KIT_RUNS.json`).

**Copies:** the prior Engineering probes were taken from `review/r7ada-decision-authority-engineering` (`17e7285`) with `git show`; git blob ids are equal to that branch's and to the author's copies. The SSCTR probes used are blob-equal to `review/r7ada-decision-authority-ssctr`.

## 2. What I ran

| Probe (reviewer-owned unless marked) | Class | Trees | Result |
|---|---|---|---|
| **Q01**, **Q01b** (my earlier probes, unchanged) | A, B | cand, pred | Q01 **0/78** (pred 14). Q01b **0/45** (pred 12). Also equal EARLY/LATE on cand: D44 questions and executed rows (pred: 21 and 42 differ) |
| **A01** entrypoint × shape × timing grid (new) | A, B | cand, pred | **0/856** on four timings (pred 433). Two classification timings: §3.3 |
| **A02** stale-planning resurrection chains (new) | A, B | cand, pred | **0/56** divergent, 0 resurrections (pred 28/28) |
| **A03** minimized AM-after-noon cell (new) | A, B | cand, pred | QE-R7ARA-OBS-1, identical on both trees |
| **Q06**, **Q06b**, **Q06c**, **Q06d** (my earlier probes, unchanged) | E | cand, pred | Q06c **0/21** (pred 11). Q06d `returnTo` = executed. Q06/Q06b: declared readings only (§4.1) |
| **E01** single-pause return ceiling grid (new) | E | cand, pred | **0/236** judged (pred 65); 100 cells had history released above the executed record |
| **E02** repeated-pause path (new) | E, SELF-01 | cand, pred, **sup** | cand **0/18**. pred 8. Superseded 2: R7ARA-SELF-01 and its restart-switch analog |
| **E03** "executed completely" boundary (new) | E | cand, pred | QE-R7ARA-OBS-4 |
| SSCTR continuous probe, walk/jog matrix (unchanged, blob-equal to the SSCTR branch) | E, F4, F4-X | cand, pred | Continuous: ladder **0**, duration **0** (pred 10, 4); weekly 3, byte-identical to the predecessor's cells. Matrix **0/99** on both |
| SSCTR R7ASC HOLD, MAINTAIN, easy return, walk/jog (unchanged) | preservation, E | cand, pred | HOLD/MAINTAIN/walk/jog identical but for the runtime label. Easy return 0 (pred 1) |
| SSCTR kit subset, 22 jobs (unchanged; compared with `kit-final` on the predecessor bytes) and my own direction check | preservation | cand | 13 byte-identical. 9 differ; **0 dose rises** (§6) |
| **Q04**, **Q05** (my earlier probes, unchanged) | C/D, only as far as the new dispatch stage could move them | cand, pred | Q04: identical summary on both trees. Q05: 58 cases, **0 diverging** on both |

## 3. QE-R7ADA-01 — canonical factual authority before every decision

### 3.1 Reproduction

| Probe | Candidate | Predecessor | Notes |
|---|---|---|---|
| Q01 (78 cells: 13 handler shapes × KNOWN_LOWER 22/24/26/28, FROM_LOG 20/24) | **0** | 14 | 0 errors, 0 non-identical facts on both. Candidate EARLY = predecessor EARLY in **78/78**: LATE converged to the already-correct EARLY, not the reverse |
| Q01b (45 cells: TOTAL back-squat retraction, wearable conflict, correction upward) | **0** | 12 | Candidate EARLY = predecessor EARLY in **45/45** |

**Confirmation semantics (§8 of the request, SSCTR D44/D45) are preserved on every cell:**
- Q01 KNOWN_LOWER, each load over all 13 handlers × EARLY/LATE (26 cells per load):
  - a log of 22 kg (one increment, target met) is adopted;
  - 24, 26 and 28 kg are asked (`LOGGED_LOAD_ABOVE_PLAN x/20`), and history keeps KNOWN 20.
- Q01b and A01 REMOVE: a removed exercise is established by effort again, and its first log waits for confirmation (`ESTABLISHMENT_LOG_UNCONFIRMED`).
- Nothing is adopted to remove a question.

### 3.2 Attack grid (A01): same canonical facts, different entrypoint

**Cells.** One cell = (timing, shape, logged load, entrypoint).
- EARLY delivers the late fact with week W−1's closing review. LATE delivers the same fact, with the same ids and `correctedAt`, with the entrypoint's event.
- Every week-W report is built once and sent identically. A cell counts only when the canonical facts are equal.
- Violation: the rows of the corrected exercise right after the event (the D44 reference), the closing review's questions, HistoricalState at W+1, or W+1's rows differ.

**Grid.**
- **27 entrypoints, all 18 review kinds:**
  - weekly review, recovered, partial session;
  - the four performance signals (with a target session);
  - local fatigue lower/upper, systemic fatigue;
  - schedule no-op / next week;
  - goal no-op / next week / an event set, event date change (an ASK), event-week conflict;
  - unavailable day (a later day / the exercise's own day), turn conflict to PM / to AM;
  - equipment no-op / added / permanent removal / temporary window;
  - missed session, short return report.
- **8 shape-loads:**
  - correction downward 24→20 (log 22, 24);
  - upward 20→24 (log 26, 28);
  - both logs retracted (log 24);
  - the last log retracted (log 24, 26);
  - a late wearable record quarantining an adoption (log 24).

| Timing | Cells | Candidate | Predecessor | Kinds diverging on the predecessor |
|---|---|---|---|---|
| MON: event Monday 07:00 | 208 | **0** | 89 | 11 (incl. systemic fatigue, event set, event-date ASK, turn to AM: not covered by Q01) |
| SAMEDAY: 07:00 on the day of the exercise's PM session, earlier sessions reported | 216 | **0** | 88 | 11 |
| LASTDAY: strength Wed/Sun, event Sunday 07:00 before Sunday's PM session | 216 | **0** | **168** | 21, the weekly review included (A3's last-day hole) |
| AM_BEFORE: strength AM, event 11:00, session run 11:30 | 216 | **0** | 88 | 11 |
| **Total** | **856** | **0** | **433** | |

**On the candidate:**
- every LATE event that would have been a KEEP is `REPLAN_FROM_EVIDENCE`;
- the event-date ASK stays ASK, with the re-plan proposed (A5.3);
- every handler's own proposal (reduce, rearrange, re-plan phases, reschedule, substitute, move, return) is built on the re-plan.

### 3.3 Classification timings: the C1 noon boundary

C1 (`WEEK_COMPOSITION_CONTRACT.md`, QE-R7A-23; accepted by the SSCTR in R7-A.1 as "an operational convention of a plan that knows only the chosen shift") defines an AM session as over at noon. A session not ahead keeps its row exactly. A5 reuses "the one C1 test" by contract (A5.2). Two timings sit on that boundary.

| Timing | Cells | Cells differing EARLY/LATE | Candidate = predecessor | Reading |
|---|---|---|---|---|
| AM_AFTER_A4: fact 13:00, AM session run 08:00 (before it) | 216 | 216 on both trees | 209/216 | **A4** (declared, SSCTR R4): judged against the row in force when executed. Expected |
| AM_AFTER_LATE: fact 13:00, AM session run 14:00 (after it) | 216 | 216 on both trees; history differs in 78 | 209/216 | **QE-R7ARA-OBS-1** (§8). The runtime does not tell this cell from the A4 one |

**The 7 cells where the candidate differs from the predecessor** are all `SYSTEMIC_FATIGUE`:
- 6 differ only in rows already identical in history.
- 1 (wearable conflict, log 24) adopts 24 on the candidate where the predecessor asked.
  - It was diagnosed on both trees with and without a late fact.
  - The predecessor asked only because, with a late fact, A3 ran inside `weeklyReview(signal)` and so persisted the `SYSTEMIC_SIGNAL`. Without a late fact, neither tree persists that signal.
  - The candidate gives the same systemic handling whatever the review carries (EARLY = LATE = no-fact baseline). That is QE-R7ARA-OBS-2, on top of OBS-1's boundary.
  - It is not a regression of A/B/E caused by the freeze: the stale reference is C1's (pre-existing on both trees), and the protection removed was an artifact.

### 3.4 Stale planning resurrection (A02)

**Setup.** Planned 24 kg; factual corrected 20 kg (DOWN), or the exercise retracted (REMOVE). The correction arrives LATE with the first event of week 2. Then a chain of handlers that do not carry it runs:

| Chain | Monday | Wednesday | Saturday | Week 3 Monday |
|---|---|---|---|---|
| A | schedule, next week | goal, next week | unavailable Sunday | equipment removal |
| B | unavailable Thursday | local fatigue | turn to AM | goal no-op |
| C | equipment window | missed Tuesday run | systemic fatigue | schedule no-op |
| D | weekly review | event set | partial session | recovered |

- Saturday is logged at 20, 22 or 24 kg, at 24 kg with the athlete's confirmation, or without the exercise.
- An ordinary week 3 follows, then a SHORT or MODERATE return.
- Every checkpoint is compared with the EARLY control on identical facts.

| | Candidate | Predecessor |
|---|---|---|
| Chains (DOWN 40, REMOVE 16) | 56 | 56 |
| Diverging after the fact arrived | **0** | 28 (chains A, B) |
| Resurrection (a row ahead at ≥ 24 kg, or HistoricalState KNOWN ≥ 24 without new valid evidence; REMOVE: a KNOWN row/state) | **0** | 28 |

**On the candidate:**
- **logged 24:** asked (`LOGGED_LOAD_ABOVE_PLAN 24/20`), history KNOWN 20, next step 22;
- **logged 22:** adopted;
- **the athlete's confirmation of 24:** still asked, because the adoption rule judges above-plan logs before a confirmation, on both trees;
- **REMOVE:** ESTABLISH/FROM_LOG, `ESTABLISHMENT_LOG_UNCONFIRMED`;
- **returns:** read the factual state (KNOWN 20/22 or FROM_LOG), never 24.

### 3.5 Code reading (supporting, INFERIDO)

- `evaluateProgram` computes `factualReplan(ctx)` once, after normalization, binding and the PlanningView. Every handler then runs on `factual.ctx` (`src/r6-adaptation.mjs:345–347`).
- Dropping `evidence:evidenceRule(ctx)` from A3's `composeWeeks` call is deliberate and correct:
  - in A3 it was inert, because `fromEvidence` requires `!ev.pending`;
  - in A5, on the last day, it would close the week, which A5.2 forbids.
- `factual.ask` arises only when re-applying a recorded adaptation conflicts (`reapply`: a race on an unavailable date). It then pre-empts the handler, including a return report's own screen. That is a C-class edge, NOT TESTADO, outside the gate.

## 4. QE-R7ADA-02 — return factual ceiling

### 4.1 Reproduction

| Probe | Candidate | Predecessor | Reading |
|---|---|---|---|
| Q06c (21: EASY SHORT 18, walk/jog exit SHORT 3) | **0** | 11 | As claimed |
| Q06d `returnTo.long`, k = 3/5/8 | **65 / 70 / 75**, the executed doses | 70 / 75 / 75 | Walk/jog exit moderate: walk/jog recipe on cand; pred targets EASY 25, never run |
| Q06 (28) | 3 | 6 | Cand flags: W-ADVERSE ×2 (OBS-2 of my earlier review, E1-B4, declared, SSCTR question); E-RELEASED 17 days: rows dated **inside** the pause (Dec 13 and 20 for a Dec 7–23 pause), checked against my own probe's selector, so a detector artifact. The predecessor's 3 extra flags (W-EXIT, E-RELEASED SHORT k=3/5) are the closed cells |
| Q06b | declared readings | — | Long flags k=4/8 after consolidation weeks resume a dose executed and tolerated earlier (E1-a, the largest executed since the entry; Q06c clean). Easy/quality flags: the eased first quality slot (D58) and the quality ladder (E1-B1), declared and not reopened. Exit flags 0 (pred 3) |

### 4.2 Attack grid (E01): single pause

**Factual record.** The probe's own: every run it reported executed completely with an ordinary response, read from what it sent, not from the runtime.

**Classes:**
- **EASY:** pause from week k = 2…9 (development, consolidation and event-phase weeks), on Monday or on Thursday after the week's Tuesday run. The week before the pause was fully executed, or its long run was missed, adverse or partial.
- **WALK_JOG:** after the week that ran step s = 1…8 (s = 8: the exit released, continuous never run), on Monday, or after the next step's (or the first continuous) session ran (execution promotes).

**Breaks:** SHORT 6 d, MODERATE 17 d, LONG 35 d.

**Checks**, on the return's entry and the re-entry week's rows:
- **mode:** no continuous run for a walk/jog athlete who never ran continuously;
- **step:** never above the step last run; recipe SHORT ≤ last, MODERATE ≤ last − 1, LONG = 0;
- **long/easy:** never above the largest executed and tolerated since the entry; MODERATE `returnTo` likewise.

| | Candidate | Predecessor |
|---|---|---|
| Judged cells | 236 | 236 |
| Cells where history at the pause held a released state above the executed record | 100 | 100 |
| Violations | **0** | **65** (EASY SHORT 37, EASY MODERATE 26, walk/jog exit SHORT 1, MODERATE 1) |

**The exit (s = 8):**

| Case | Candidate | Predecessor |
|---|---|---|
| SHORT | walk/jog step 8 ×3 | EASY 25 continuous |
| MODERATE | walk/jog step 7 | RETURN continuous 15 |
| After one executed continuous run (P4) | EASY / RETURN, allowed | the same |

**Not exercised here:**
- the LONG break at the exit falls beyond my 16-week horizon; the SSCTR continuous probe's LONG cells cover it (0 ladder, 0 duration);
- the LAST_ADVERSE walk/jog variant was not constructible: the HOLD repeats the step, 24 cells skipped. Adverse-then-pause is the declared OBS-2 (Q06 W-ADVERSE).

### 4.3 Repeated pause (E02) and R7ARA-SELF-01

**Paths:**
- **P1, EASY:** a MODERATE first break, then the second break at four stages:
  - S0: one re-entry run;
  - S1: step 0 executed, step 1 released;
  - S2: steps 0 and 1 executed, the completion released and never run;
  - S3: the completion's first week run.
- **P2:** a LONG first break; the restart run until the switch to easy running is released and never run.
- **P3, walk/jog:** a SHORT return at step 3, executed, then step 4 released.

Each path takes a second break of SHORT 4 d, MODERATE 14 d or LONG 33 d. The window is the probe's own record since the latest entry (the first return's report, E1.2).

| Tree | Cells | Violations |
|---|---|---|
| Candidate `e7172eb2…` | 18 (P2 LONG beyond the horizon) | **0** |
| Predecessor `3a7166b2…` | 18 | 8: SHORT resumes a released step, completion or switch; MODERATE targets 70, never executed |
| Superseded `259ab3ef…` | 18 | 2: **R7ARA-SELF-01** and its restart-switch analog |

**R7ARA-SELF-01 cell** (P1 S2, MODERATE second break):

| Tree | Entry | Re-entry rows | Target |
|---|---|---|---|
| Superseded | RETURN **step 1** | **30 / 30 / 45**: no entry (**reproduced**) | 40/65 |
| Predecessor | RETURN step 0 | 15 / 15 / 20 | **40/70** (70 never executed) |
| **Freeze** | RETURN **step 0** | **15 / 15 / 20** | **30/45** = the largest executed since the entry (**absent**) |

**Adjacent classes on the freeze:**
- **Restart switch released, MODERATE second break:** the superseded tree resumes restart minutes; the freeze re-enters at step 0 (15/15/20, target 25/40).
- **Completion released, SHORT:** resumes return step 1, the step last run.
- **LONG:** RESTART.
- **S0/S1, MODERATE:** re-entry at step 0.
- **S3 (completion run), SHORT:** EASY within the doses executed since the entry.
- **Walk/jog P3:** SHORT step 3, MODERATE step 2, LONG step 0.

### 4.4 Distinction kept (§12 of the request)

History may credit a released step while a return reads the last executed one (e.g. I5/P3 in `r7ab`, history step 1, return step 0). That is a divergence by design (E1-B5), not counted as a defect.

The probes judge only the return's prescription: its entry and its re-entry week. The following weeks' conditional projection advances only on execution, so it is not a baseline. My first E01 window included them and produced 27 false flags. I narrowed it and re-ran; only the corrected outputs are recorded.

## 5. Properties A / B / E

| Property | Verdict | Basis |
|---|---|---|
| **A**, factual authority: Planning does not become History without factual evidence | **Holds** | Q01/Q01b; A01 0/856; A02 0/56; D44 asks above the corrected row on every entrypoint and timing; D45 waits on establishment; a confirmation does not bypass D44 |
| **B**, correction/retraction consistency: a corrected or retracted value does not reappear through another consumer | **Holds** within A5's contracted trigger | A01: rows ahead, questions, history and next week identical EARLY/LATE across 27 entrypoints and 4 timings, the last day included; A02: no resurrection through later handlers, executions, adoptions or returns. Residual at the C1 noon boundary: QE-R7ARA-OBS-1, pre-existing, all entrypoints alike |
| **E**, return ≤ factual tolerated state/dose | **Holds** | Q06c 0/21; Q06d at executed; E01 0/236; E02 0/18; SSCTR continuous 0/0; walk/jog matrix 0/99; R7ASC easy return 0 and walk/jog 0/12. Reading at the 90 % completion rule: QE-R7ARA-OBS-4 |

## 6. Preservation (read-only)

| Item | Result |
|---|---|
| Frozen suite | 673/673. The named tests pass:<ul><li>F1 ×2, F2 ×2, F3 ×1, F4 ×6, F4-X ×1</li><li>D53 ×8, D56 ×2, D57 ×3, D58 ×2, D59 ×1</li><li>HOLD ×5, MAINTAIN ×6</li><li>QE-R7ASC-01…04 ×4/4/2/6, QE-R7ADA-01 ×3, QE-R7ADA-02 ×2, P1–P4</li></ul> |
| SSCTR kit subset: 22 jobs re-run on the candidate | Scope: the 8 the author names E1 and 14 jobs reported identical. Each job's script SHA-256 was checked against `kit-final`.<ul><li>**13 byte-identical** to the predecessor's recorded outputs, `regression` included (exit 1 on both: the R6-H35 runner error).</li><li>**9 differ:** `b-probe`, `changes`, `d58`, `f-probe`, `holdout-detail`, `probe`, `systemic`, `x-items`, and `trace-h25` (clock-only).</li></ul> |
| My direction check on those 9 (`qe-r7ara-kit-direction.mjs`, `kit/DIRECTION.json`) | Numeric dose readings: **117 fell, 0 rose**. Row strings: **182 fell, 0 rose**. 24 kind changes, all step-downs (`EASY 45 +strides → EASY 30`; `QUALITY THRESHOLD 34 → EASY 34`). 11 mode labels `EASY → RETURN` at return entry (E1's undo of a released, never-run completion). No dose rises |
| HOLD (R7ASC, 240 cases) | 0 load/reps/sets/tick up, 0 progression without evidence; identical to the predecessor but for the runtime label |
| MAINTAIN (R7ASC, 5 cells, 393 KNOWN rows) | 0 above range, 0 above the load last executed; identical but for the label. `setsAboveMax 99` is inherited O-1, identical |
| F4 / F4-X | Walk/jog matrix 0/99 on both. Continuous: ladder 0, duration 0 (pred 10, 4). R7ASC walk/jog 0/12 on both |
| C/D, only as far as the dispatch stage could move them | **Q04** T1–T6: the summary is identical on both trees (T1–T3 0/18; T4 same facts, gates, history and rows; T5 no violation; T6 HOLD). **Q05** (a goal, schedule, run-goal or event change at every instant, then no-op decisions in 9 orders): **58 cases, 0 diverging**, 0 with different facts, on both trees |

**Not re-run:** `r12-instrument` (it writes beside its script; 1 014 s), and the sharded grid/caps/first-week jobs (about 3 000 CPU-s). Their recorded outputs stand as the author's evidence, not mine.

## 7. Declared items, not reopened

| Item | Status |
|---|---|
| A5-B1 (R1, the standing projection after a correction past the week's last session) | Founder `R1_R7A_BLOCKER = NO`, `R1_PRE_TESTFLIGHT_GATE = YES`. Out of this recheck |
| E1-B1 (quality ladder, D58) | Q06b's quality/easy-slot flags belong here |
| E1-B2 (NF-R7ADA-2) | Not reopened |
| E1-B3 (restart long-run offset under a pause) | Not tested, as declared |
| E1-B4 (OBS-2, adverse single exposure) | Not reopened |
| E1-B5 (HistoricalState not redesigned) | Not reopened |

R1, repertoire, B0, pace, marathon, KMP, HealthKit, WorkoutKit, wearables beyond the synthetic record, UI/Figma and document drift: not reviewed.

## 8. Findings

**Within the gate: none blocking.** No material violation of root cause A or B, and no direct regression of A/B/E or of the preservation set, caused by this freeze.

**Observations (NONBLOCKING).**

### QE-R7ARA-OBS-1: LOW. Root cause A residual at the C1 noon boundary. Pre-existing, not introduced. BACKLOG (R7-B; the owner may rate it TESTFLIGHT)

**Minimized reproduction** (`qe-r7ara-A03-am-after-noon-minimal.mjs`):
1. Strength is AM. db-rdl is logged 24 kg in weeks 0–1, and both logs are corrected to 20 kg.
2. The correction arrives Saturday 13:00 with a plain WEEKLY_REVIEW. Any of the 27 entrypoints behaves the same.
3. The athlete runs Saturday's AM session at 14:00, after the fact arrived, at 24 kg 3×5 @ RIR 3.

| | Row in force | Question | HistoricalState | Week 3 |
|---|---|---|---|---|
| EARLY | KNOWN 20 | asked | KNOWN 20 | KNOWN 22 |
| LATE | **KNOWN 24** (not re-planned: not ahead by C1) | none | **KNOWN 24** | **KNOWN 24** |

**Path:** `aheadOf` (C1) → `factualReplan` keeps the past row (C1/I1) → `loggedLoadQuestions` / `loggedLoadDecision` judges against the row in force.

**Why it is nonblocking:**
- It is identical on the predecessor, for every entrypoint, the weekly review included, which A3 already covered.
- It is independent of the entrypoint, so it is not QE-R7ADA-01's class (entrypoint-dependent truth).
- It follows the accepted C1 convention, which A5 reuses by contract.
- The trigger is narrow: an AM-shift session, a post-noon correction the same day, and the session executed after it.
- The runtime does not distinguish this exposure from the A4 one (run 08:00, before the fact): both give the same result.

**Possible direction (not a fix):** judge an exposure *observed after* a correction's arrival against the corrected PlanningView. That would refine A4/C1 and is the owner's and the SSCTR's decision.

### QE-R7ARA-OBS-2: LOW. C-class, outside A/B/E. Pre-existing. BACKLOG

**What happens:** `SYSTEMIC_FATIGUE` with nothing left to reduce, mid-week, delegates to `weeklyReview(signal)`, which returns a KEEP without a proposal. So the `SYSTEMIC_SIGNAL` it builds is never recorded. The code comment says "recorded so that a later review of the week keeps it (R7-A.1 C4)".

**Evidence:** on both trees, with no late fact, the week's adaptations stay empty and the closing gate is ADVANCE.

**What the freeze changed:** the predecessor persisted the signal only when a correction rode along (A3 inside the handler). The freeze makes the systemic handling independent of the carried correction: EARLY = LATE = no-fact.

### QE-R7ARA-OBS-3: INFO. E1 ruling point for the SSCTR. NONBLOCKING

The moderate target after a second break depends on the state at the break:
- a RETURN state keeps its own target, 40/65 (the doses executed before the first break; E1.3);
- a released completion is capped at the doses executed since the first return's entry, 30/45.

So more executed evidence (S2) gives a lower target than less (S1). Both stay within doses actually executed and tolerated, so there is no factual-ceiling violation.

### QE-R7ARA-OBS-4: INFO. E1 reading at the completion rule. Pre-existing definition. NONBLOCKING

**What happens:** a run counts as executed completely when reported at ≥ 90 % of its row's minutes (`bindObservations`). E1 then credits the row's minutes.

**Evidence** (`qe-r7ara-E03-completion-boundary.mjs`):
- a 70-minute long run reported at 66 minutes: the SHORT return's entry state reads 70, and its first long row is 70;
- a 75-minute row reported at 71: the entry state reads 75; the first long row is 65, a reduced phase week;
- at 89 % (partial) the entry falls back to the largest complete long run (65, resp. 70);
- the excess of the entry over the minutes actually run is ≤ 10 % of the row;
- the predecessor's entry reads 75 in the first case.

The gates use the same definition. Whether E1 should read the reported minutes is a sports reading for the SSCTR.

## 9. Proven, inferred, not tested

**COMPROVADO** (every output bound to `e7172eb2…` in `qe-r7ara-runs/RUNS.json` and `kit/KIT_RUNS.json`):
- integrity of the freeze, the handoff and the three trees;
- 673/673; the verifier 13/13 at the start;
- QE-R7ADA-01 reproduced (Q01 14, Q01b 12) and closed (0/78, 0/45, A01 0/856, A02 0/56);
- QE-R7ADA-02 reproduced (Q06c 11, E01 65, E02 8) and closed (0/21, 0/236, 0/18, Q06d);
- R7ARA-SELF-01 and its restart analog reproduced on `259ab3ef…` and absent on the freeze;
- F4/F4-X, HOLD, MAINTAIN, and the kit subset's direction;
- OBS-1, OBS-2 and OBS-4.

**INFERIDO** (code reading):
- no decision path runs before `factualReplan` (one dispatch line);
- `factual.ask` can pre-empt a handler only when re-applying a recorded adaptation conflicts.

**NÃO TESTADO:**
- the restart long-run offset under a pause (E1-B3, declared);
- a LONG second break after a restart (beyond the horizon);
- the walk/jog exit under a LONG break in my profile (the SSCTR probe covers it);
- time zones other than 0;
- real devices, data or athletes;
- the kit's sharded and r12 jobs;
- mutants beyond the author's four;
- `factual.ask` pre-empting a clinical return screen.

## 10. Verdict

```
R7A_RESIDUAL_AUTHORITY_ENGINEERING_RECHECK = READY
```

| Gate condition (§18) | Met | Basis |
|---|---|---|
| QE-R7ADA-01 closed as a material class | **Yes** | §3. The C1 noon residual (OBS-1) is pre-existing and entrypoint-independent |
| QE-R7ADA-02 closed as a material class | **Yes** | §4 |
| A/B/E remain valid | **Yes** | §5 |
| No regression directly caused by the freeze within the gate | **Yes** | §3.3, §6 |

**Not issued:** `R7A_EXIT_READINESS` (the closure session decides it after both rechecks), R7-B0, any SSCTR ruling, any fix.

**Files written by this recheck**, all in this folder, on `review/r7ara-residual-authority-engineering`:
- `ENGINEERING_RECHECK.md` and `ENGINEERING_RECHECK.json`;
- probes `qe-r7ara-A01…A03`, `qe-r7ara-E01…E03`;
- instruments `qe-r7ara-integrity.mjs`, `qe-r7ara-run.mjs`, `qe-r7ara-kit.mjs`, `qe-r7ara-kit-direction.mjs`;
- copies of my earlier probes `qe-r7ada-*.mjs`, blob-equal to `17e7285`;
- `qe-r7ara-runs/`: every output, the run ledgers, integrity start/end, the test run and the end verification.
