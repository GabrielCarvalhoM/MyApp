# R7-C Phase 5 — SSCTR semantic re-disposition request (before the freeze)

You are the project's sports-science reviewer: `sports-science-concurrent-training-reviewer`, PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY for bounded nonclinical internal sporting decisions. Clinical judgment stays CLINICAL_HUMAN_REQUIRED.

Read first your constitution `governance/agents/sports-science-reviewer/CONSTITUTION.md` and your skill `.agents/skills/sports-science-review/SKILL.md`. You did not author this runtime, its fix, its tests or its probes. Your own earlier record is [SSCTR_SEMANTIC_DISPOSITION_R7C.md](SSCTR_SEMANTIC_DISPOSITION_R7C.md) (`SSCTR-SD-R7C-r1`, NOT_READY on SSCTR-SD-01), with its JSON.

This is the re-presentation your condition C1 asked for. It is not the final gate: a narrow recheck on frozen bytes comes later. Do not change policy, catalog, canon, product, runtime or tests; do not append to the human queue (list proposed items in your record).

## The question (the Founder's, verbatim)

> Com o runtime agora reconciliando a semana corrente quando a lacuna deixa de ser unknown, a semântica `unreported = unknown` / `explicit not-done = known miss` está pronta para substituir o comportamento legado dentro da authority vigente?

Result: `SEMANTIC_DISPOSITION = ACCEPT_R7C_UNKNOWN_SEMANTICS | NOT_READY`. Returning to `unreported = missed` is no longer an option: you rejected it on the merits in r1, and nothing here reopens it.

- **NOT_READY:** the Founder's rule is STOP. No legacy test is edited, no freeze, no Engineering; Phase 5 closes CLOSED_NOT_READY with your blockers.
- **ACCEPT:** also rule on the legacy split your C6 described: each of QRE-R6-04, D18, SSCTR F3/R6-H25 and §19, and the fifth fixture `test/r6-adaptation.test.mjs:140`, into UNREPORTED (ASK where the dose depends on it), KNOWN_MISS (the original invariant) and ANSWERED_KNOWN_STOP (the answer resolves the dependency and recomposes the actionable horizon from the facts). Say what each variant must assert.

## Bytes

- Branch `claude/domain-coaching-r7-c`, worktree `.claude/worktrees/domain-coaching-r7-c`. Phase 5 commits on top of the Phase 4 closure `6240080` (runtime `39115ed`):
  - `66c0e7a` the fix and `test/r7c-phase5.test.mjs`; `87be24b` keeps the clinical precedence point as its own statement (the R7-B.2 conformance anchor for B0-C06 c8; no behaviour change); `e1a4ef4` words a held signal's reason as re-evaluated, not applied (its handler may change nothing);
  - `0d03133`, `0897261` probes only (the SD grid, the evidence runner, the mutation set).
- Runtime: only `src/r6-adaptation.mjs` changed in Phase 5 (sha256 `8b189617…1587` at `e1a4ef4`); `src/r6-composition.mjs` is unchanged since `39115ed` (`2a4c47e8…b7ce`). Run `git diff 6240080 e1a4ef4 -- CoachingCore/src`.
- Unchanged since the R7-B.2 closure `baa2cb1`: R6-POLICY-5, R7B0-CATALOG-2 and every file under `CoachingCore/r5`, `r6`, `r7` and `scripts`; `product/`; `canon/`; the human queue (230 items, `95ea4b92…99c8`). The four legacy tests and the fifth fixture are not edited.

## The fix

**SSCTR-SD-01 (blocking in r1).** `gapAnsweredBy` and `factualReplan` in `r6-adaptation.mjs`. The answer is part of the canonical factual state, before any handler decides (the same place a correction already re-plans):
1. On the record as the review received it (the carried record, read canonically, as `viewMovedBy` reads it) the run doses still ahead in this week depend on unreported training (`runGapInForce` asks). With the review's own reports they no longer do: the window is known (sessions reported not done, sessions reported done, or a run that anchors it).
2. Then this week's sessions still ahead are re-planned from the facts (`composeWeeks` from this week, from its PlanningView), and the handler of the review, whatever its kind, decides on that program. History keeps its rows; later weeks are re-projected; the decision is REPLAN_FROM_EVIDENCE with a reason that names the answer.
3. A partial answer answers nothing yet: the question stays, about the sessions still unknown. A declared interruption keeps its own authority (`returnAfterPause`, the declared days are a known stop). Only reports of sessions dated before the week can answer it.
4. Policy is untouched: the re-plan uses the same entry, ceiling, peaks and return rules every decision uses.

**SSCTR-SD-02.** The answer week is tested explicitly (below).

**SSCTR-SD-03 (non-blocking in r1, covered by C3).** Two parts, no new fatigue rule:
- (a) the answer's own event signals (SYSTEMIC_FATIGUE, LOCAL_FATIGUE, a performance report, adverse responses in the reports) apply through their normal handler on the re-planned facts, never on the stale projection;
- (b) C3's "or by the engine carrying them": a reactive signal (fatigue or performance) that the question held, with nothing applied or recorded (an ASK with no proposal), travels with the pending question in the reference state through its own week. A plain weekly review of that week that answers re-evaluates it with its own handler, once. A week's signal acts on that week only; a clinical route takes over from it; an answer sent through another event kind does not re-evaluate it (G03 then re-submits the pending event kind, as C3 says).

## What to check (the Founder's list)

Your earlier record; SSCTR-SD-01; the fix; SD-02; SD-03; the tests; the metamorphic equivalence; G01; G02; the clinical regression.

### Tests: `CoachingCore/test/r7c-phase5.test.mjs`, 16 tests (with r7c-longitudinal and r7c-phase4: 49/49)

The metamorphic core uses three timelines with the same program: **A\*** reports each gap week at its own review (strictly on time); **A** has the gap's facts at the review before the answer week; **B** gets the same facts in the answer week, after the question.
- A\* shares B's factual history only for a known stop: nothing was executed, so nothing depended on what was prescribed (for runs; the strength the fixtures execute follows each path's own prescriptions).
- A shares it always.

| Test | What it asserts |
|---|---|
| metamorphic core | GEN and R10K, gap from the start or after two executed weeks, reviewed or not, MISS and EXEC, answer on day 0, 2 or 5 (48 cells): B leaves A's plan in force from the answer on (week b, plus week b+1 when nothing of week b had elapsed), and A\*'s run doses in the answer week for a known stop; history intact; no question; pending cleared; VALID; after a known stop no dose above the entry and no quality or touch |
| convergence | after a later-week answer, the same week facts give the same next week at the week's review |
| decision kinds | weekly review, schedule change, systemic and local fatigue, unavailable long-run and strength day, equipment change, goal change, day 0 and 2: A and B leave the same plan, validity and question |
| key session, long run, taper, race week | answered on day 2 (quality on day 3) and day 5 (long run on day 6), in the R10K taper and race week: the remaining sessions follow the facts, the race stays once, a known stop plans the entry |
| mixed evidence | the answer week follows the canonical factual state, never longer than A's run in the same session; later in the week, the same sessions ahead |
| partial answer | asks only about what stays unknown, plans nothing; the rest of the answer then reconciles the week |
| declared interruption | a mid-week break declaration re-enters by its recipe; no question; nothing stored kept |
| SD-02 (`:85` fixture) | the Phase 4 test's own fixture: the answer week (week 7), not only week 8 |
| SD-02, question in the answer week | a strength change kept beside the question (REQUIRES_RECONCILIATION), then the answer: the rest of the week reconciled, the change kept, VALID only now |
| SD-02, question raised earlier | asked at weeks 6 and 7, answered on day 2 of week 8: week 8 follows the facts, as A and A\* |
| SD-02, end-of-week answer | answered at the week's review: next week as on time |
| SD-03 adverse | the adverse responses change the plan and the long run does not progress |
| SD-03 held fatigue | held on day 0, answered by a plain review on day 2: applied, the same plan as on time, consumed; a review without the answer keeps it waiting |
| SD-03 held performance | held at the end of the week, answered an hour later: next week as the report decided on time; the signal never crosses its week |
| SD-03 clinical | a pain flag wins over the answer and over a held signal (nothing proposed, nothing carried); a substitution with pain routes clinically and still records the answer |
| determinism | same facts, same decision (hash) |

### Evidence on `e1a4ef4` (outputs in `../../probes/out/`, labelled `R7C-P5-e1a4ef4`; manifest `evidence.R7C-P5-e1a4ef4.json`, made by `probes/phase5-run-evidence.mjs`)

| Check | Result | Against Phase 4 (`39115ed`) |
|---|---|---|
| SD-01 reproduction (`probes/phase4-verify-sd01.mjs`) | g=0 and g=2: the mid-week answer gives MODIFY / REPLAN_FROM_EVIDENCE, VALID, week 7 ahead EASY 15 / LONG 15 = the on-time path | was KEEP, VALID, QUALITY 34 / LONG 60 |
| Your SD7 grid, re-run unchanged (`ssctr-sd7-answer-midweek.*`) | day 0, weekly review and schedule change (16 rows): MODIFY, VALID, runs ahead at the entry. Day 2 weekly review (8): MODIFY, VALID, runs ahead at the entry; your classifier calls them OTHER only because the elapsed day-1 session is history. Day 2 schedule change (8): ASK about that elapsed day-1 session alone (the change plans week 8, whose window holds it), runs ahead at the entry | was 24 credited, 8 asked |
| Your SD8 | C1 and the mid-week C2: entry, VALID; the week-b review plans the entry; C3 unchanged | C1/C2 were credited |
| Your SD9 (`:85` fixture) | MISS: week 7 ahead 15/15/15 = the timely path; EXEC: EASY 55 / QUALITY 43 / LONG 60 against on time 55/43/65, because the athlete executed the held prescriptions (a different factual history) | both kept the stale week |
| Your SD1 | the plain-review answer now equals the re-submitted one (REDUCE from the facts) for GEN and R10K, EXEC and MISS | plain review was KEEP with the stale week; re-submitted reduced the stale week |
| SD answer grid (`probes/phase5-adversarial-sd.mjs`) | A: 1,200 cells (5 answers × kinds × days × weeks), 0 violations; classified apart 24 PREEXISTING_HOLD (R4) and 4 ELAPSED_HISTORY_QUESTION (R1). C (clinical) 9/0, S (signals) 6/0, I (interruption) 4/0 | new |
| G01 Phase 4 grids (`probes/phase4-adversarial-g01.mjs`) | grid A 148 (76 hold like a reviewed miss / 40 ask / 32 independent), 0 violations; grid B 46/46 ask; P1 165 questions, 0 failures; neighbours unchanged. Five grid-A rows changed, all the unreviewed path with a known stop reported in a schedule change: week b now plans the entry (it kept the stored projection: SD-01 there) | verdict counts identical |
| G02 (`probes/phase3-adversarial-g02.mjs`) | PASS | byte-identical |
| Holdout (`probes/phase3-holdout.mjs`) | identical except H19 S2's reason, which names the held underperformance; every step's status, action and plan unchanged, S2–S4 still equal B.2 | D1 unchanged |
| Clinical | K6 1/1, K6b 1/1, inventory 3/3 (CAND-01, CAND-02, ADJ), the inherited R7-B.1 adversarial unchanged; neighbours as in Phase 4 (32 cases; the 14 flagged are the TO_CLINICAL predicate artifact against a B.2 base); differential against R7B2-FREEZE-1: 151 timelines, 1,626 steps, the same 29 C15 relabels, substitution grid 184/0, clinical sweep 389/0, envelope 0, no run rise | identical |
| Conformance | R7-B PASS (301 entries), R7-B.1 delta PASS, R7-B.2 delta PASS | identical |
| Full suite | 848 tests, 844 pass, 4 fail: QRE-R6-04, D18, F3/H25 and §19, with the same failure messages as in Phase 4 | was 832/828/4 |
| Mutation (`probes/phase5-mutation.mjs` → `mutation.R7C-P5-0897261.json`, isolated copy, repository untouched) | the Phase 3 set 17/18 (G02-M4 equivalent, its witness killed); the Phase 4 rules 8/8; the SD mutants 6/6 killed: SD-M1 the answer clears the question without re-planning, SD-M2 it re-plans later weeks but not the answer week, SD-M3a a held signal is not re-evaluated, SD-M3b the answer event's own signal is dropped, SD-M3c the held signal does not travel, SD-M4 a known miss re-plans strength only (stale run doses stay). Run on `0897261`, whose runtime and tests differ from `e1a4ef4` only by the held-signal reason wording and its two regexes | same, plus the six new |

## Disclosed residuals (please rule on each)

- **R1, next-week projection after a later-week answer.** A session of the answer week that elapsed before the answer stays history with the prescription stored then (never rewritten), and the conditional projection of the following week counts it as prescribed, as A counts its own. The following week can differ until the answer week's review; with the same week facts they converge (tested). While unreported, that session is itself asked about where it decides a dose (4 cells of the SD grid: an R10K taper schedule change asks about it).
- **R2, re-entry pace after an answered known stop.** The PlanningView holds a missed week at the dose that week prescribed. B's missed weeks keep the projection stored before the question, so the run state B carries out of the answer week can stand above the strictly on-time path's, whose reviews re-planned each missed week at the entry and, outside consolidation weeks, trimmed the state to it. Doses are bounded by the approved single-run ceiling (D17/D18: the entry, then at most 5 minutes above the longest completed run in 30 days, response-gated). Observed (`GEN`, every session executed after the answer): with a gap from the program start B's long run goes 15 → 20 → 25 → 30 with a threshold session in the fourth week counting the answer week; A\* stays at 15–20 with no quality through week 11. With two executed weeks before the gap, B equals A\* through week 11 (reviewed and unreviewed gaps). In D18's own fixture the answered known stop equals the known stop reported at that review in weeks 7 and 8 (the entry). The answer week itself equals A\* in every case.
- **R3, mixed or adverse evidence in a week whose review asked.** A past week is closed only by its own review. When the facts arrive after it, the evidence reducer reads that week as every decision reads an unclosed week: held unless executed completely. A review that had the facts would have applied the week's own gates (an executed long run advances; an adverse response steps back). Bounds: with mixed evidence B never plans longer than A; with adverse evidence B holds the long run where A steps it back one step, and the next weekly review's windows still see the adverse responses (the D1 class). Closing past weeks at the answer would rewrite how history is read (each deferred week's start record); not done.
- **R4, pre-existing (identical on R7B2-FREEZE-1):** a SCHEDULE_CHANGE in the program's last week throws inside its handler and returns HOLD. An answer it carries is recorded but not applied until the next review; the stored doses are never VALID meanwhile (24 cells of the SD grid).
- **R5, pre-existing:** an eligibility clinical flag returns before the review's reports are read, so an answer sent with it is not recorded; it must be sent again after clinical clearance. A handler's own clinical route (a substitution with pain) does record it.

## Output

Write only under `audits/domain-coaching-r7-c-2026-11-01/reviews/ssctr/`; your probes go in `probes/sd5/`.
- **`SSCTR_SEMANTIC_REDISPOSITION_R7C.json`**: `revision`, `reviewer` (instance, model, effort, dispatch), `authority`, `bytes` (HEAD and the two source sha256), `semanticDisposition`, `sd01`, `sd02`, `sd03` (each CLOSED or OPEN with the reason), `residuals` (R1–R5, each ACCEPTABLE_RESIDUAL, CONDITION or BLOCKER), `legacyTests[]` (id, file, authorized, the three variants and what each asserts, including the fifth fixture), `conditions[]` (carried from r1 or new), `findings[]`, `proposedQueueItems[]`, `humanRevalidation`, `couldNotVerify`.
- **`SSCTR_SEMANTIC_REDISPOSITION_R7C.md`**: short, decision first.

State plainly what you could and could not verify.
