# R7-D final holdout — brief for the independent case author (`R7D-AUTHOR-BRIEF-FINAL-8`)

> **In use (R7-D Phase 5).** This brief is registered with `R7D-PREREG-8` and replaces `R7D-AUTHOR-BRIEF-FINAL-7` (the Phase 4 record). It differs from version 7 in: the interface you read (delta 8 added); the freeze you write against and the folder you write in; the corpus size; how to refer to sessions and report strength loads; the construction notes that make each required item reachable through the interface; and one more case for the items marked **(R)**. No final case or corpus of this phase exists when this brief is written.

You are the independent author of the **R7-D final holdout** (H1) for the Vilumo Fit coaching core: an offline, synthetic, shadow-only reference coach for running and strength. You did not write the coach and you must not see it. Your corpus is sealed before anyone runs it, run exactly once, and judged by a domain judge and an engineering judge who are not you. A coach that only looks right on easy paths should fail on your cases.

## 1. What you may read (nothing else)

All paths are under the worktree the coordinator gives you:

1. `audits/domain-coaching-r7-d-2026-11-02/author/INTERFACE_ONLY_R7D.md` (R7D-INTERFACE-1), then `author/INTERFACE_DELTA_R7D_2.md` to `author/INTERFACE_DELTA_R7D_8.md`, in order. Together they are R7D-INTERFACE-8; the newest delta prevails where they differ. Read all eight files completely first. Delta 8 says how to refer to sessions, how to report strength loads, which sessions a week holds, and when the coach asks about unreported training.
2. `audits/domain-coaching-r7-d-2026-11-02/author/CASE_SCHEMA_R7D.json`: the machine shape of a corpus.
3. This brief.

You may run, but need not read, `author/check-corpus.mjs` and `author/check-corpus-8.mjs` (`node <path> <your corpus.json>`). The first checks shapes, vocabularies, dates and references; the second adds warnings about references that may not resolve after a re-plan. Neither runs the coach. Your corpus must have no errors. Resolve every warning, or keep it only where the day is truly fixed (and say so in `domainNotes`).

**Do not open, list, grep or import anything else:**
- not `CoachingCore/`;
- not the R7-D `harness/`, `diagnostic/`, `final/` (an earlier holdout), `phase3/` to `phase5/` folders;
- not the pre-registrations, checkpoints, other `audits/` or `reviews/`, `product/` or `canon/`;
- not git history or other agents' outputs.

Do not run the coach or the harness. Your own builder script may only construct and check JSON (plain Node, no imports from the repository).

**The freeze you write against:** `R7D-FREEZE-6`. The coordinator gives you its creation time and manifest digest when you are commissioned (metadata only). Your `authorStartedAt` must be later than that creation time.

## 2. What to write

Write only in `audits/domain-coaching-r7-d-2026-11-02/final2/` (create it):
1. `build-final-corpus.mjs` (recommended): your builder.
2. `R7D_FINAL_HOLDOUT_2.json`: `{corpusRevision:'R7D-FINAL-2', cases:[...]}` in the `R7D-CASE-1` shape, with case ids `R7D-H01`, `R7D-H02`, …. It must pass `check-corpus.mjs` with no errors.
3. `FRESHNESS_MANIFEST.json`, written last, in the `R7D-FRESHNESS-MANIFEST-1` shape:
   - `manifest:'R7D-FRESHNESS-MANIFEST-1'`, `corpus:'FINAL'`;
   - `authoringProtocol:'R7D-AUTHOR-BRIEF-FINAL-8'`;
   - `runtimeFreeze:'R7D-FREEZE-6'` and `runtimeFreezeDigest` (its manifest digest);
   - `corpusPath:'R7D_FINAL_HOLDOUT_2.json'`, `corpusSha256` (SHA-256 of the file bytes), `hashMode:'sha256 over file bytes'`, `bytes`, `caseCount`;
   - `author:{role, identity, runtimeInspectedBeforeSeal:false, outputsInspectedBeforeSeal:false, runtimeImportedOrExecutedByAuthor:false, developmentCorpusInspected:false, earlierHoldoutsInspected:false, harnessInspected:false, assessmentsAuthoredBeforeRuntimeOutput:true}`;
   - `allowedInputs` (the files of §1, each `{path, sha256}`), `forbiddenInputs` and `inspectedFiles`;
   - `authorStartedAt`, `sealedAt`;
   - `steps` (the decision steps in all), `builder` (`{path, sha256}`);
   - `coverageTags` (counts), `generationMethod:'INDEPENDENT_AUTHOR'`, `seed:null`;
   - `commandsRun` (every command you ran);
   - `interfaceGapsNoted` (a list);
   - `evaluation:{evaluationCount:0, firstEvaluationAt:null}`.

After sealing, change nothing and stop.

## 3. The corpus

**Size:** 34 to 40 base cases, 80 to 130 decision steps in all. Longitudinal timelines carry most of the weight.

**Minimum strata** (base cases; a case may count for more than one):

| Stratum | Min. |
|---|---|
| Cold start: run-first half marathon over 12–16 weeks; a close 10K (≤ 8 weeks); strength-first; balanced hybrid with shared days and turns; a 4-week general block; absolute beginner; experienced in both; bodyweight-only or kettlebell-only; a partial wearable history with strength known only by type and duration; more chosen days than current capacity | 10 |
| Built only from walk/jog or a restart, toward a race | 1 |
| Safety and scope: unknown eligibility; pain; a break with a clinical cause; an out-of-scope request | 4 |
| Longitudinal: weeks with no reports and a late answer; runs done shorter, mixed or adverse; an athlete who always reports late; skipped or empty reviews | 6 |
| Events: schedule (including in the last week); unavailable day; double conflict; equipment or travel; substitution without and with pain, then clearance; goal or race-date change; local or systemic fatigue, alone or repeated | 6 |
| Nonclinical return: short, moderate and long, at least one reported mid-week | 2 |
| Build → taper → race → after the race, in 10K and half marathon, with a response during the taper | 2 |
| Data: phone + watch duplicate; a contradiction; a correction; out-of-order arrival; a clock in the future; time zones | 2 |
| Learning: a consented pattern versus noise; no consent | 1 |

**Athlete levels (the Founder, Phase 4).** At least two independent base cases with a beginner (running or strength experience NONE or NOVICE) and at least two with an intermediate athlete must fall in the longitudinal, break, return, correction or race-week material (items 1, 2 and 10 to 15 below, the nonclinical-return stratum or the taper stratum). Running and strength trained together carry most of the longitudinal weight.

**Writing facts that resolve** (delta 8 §2, §3):
- After a stated break, a return, or a schedule, equipment or goal change, refer to sessions by `{week, sport, role}` without a day, or with the bulk form. Use the bulk form for every session the coach composes (race touch, shakeout, optional walks, recovery runs).
- A substitution names its exercise by `{week, pattern}` without a day unless you know that day's session holds the pattern.
- When a week must count as **executed in full** (items 11 and 15, re-entry weeks), report every session of it: runs `asPrescribed:true`; strength `asPrescribed:true` with a `loadsByPattern` covering every loaded pattern the athlete's equipment allows; no adverse response. Bodyweight and band rows need no load.
- Never assume a session exists that the plan may not hold. Never invent a session, load, answer or fact to make a case work; a fact is what your athlete did and said.

**Required coverage.** Each item needs **at least two independent base cases**, except the confounded item and the clinical-cause break of item 9, which need at least one each. A holdout without all of them is invalid and replaced (R7D-PREREG-2 Δ9, R7D-PREREG-3 Δ6, R7D-PREREG-4 Δ5, R7D-PREREG-5 Δ3, R7D-PREREG-6 Δ5, Δ18 and Δ29, R7D-PREREG-7 Δ44, R7D-PREREG-8 Δ53). For every item marked **(R)**, write **one more independent case than its minimum**: whether those items are exercised depends on what the coach composes or asks, so one corpus error must not lose them.

1. **A long reporting silence:** more than a month with no reported run, while planned runs elapse with no report at all (not reported as not done, not inside a stated break), so that the coach asks about the unreported sessions (delta 8 §5). Then:
   - **(R)** the athlete's **direct answer** in the next step (reports per session with the `answer` shorthand, or a declared break with its reason);
   - **(R)** in some cases, the question and its answer in the program's **last week**: end the silence with a decision on the last week's first evening, while its runs are still ahead; answer in the next step, the same day or the next, before the remaining runs; then the last week's review. The client also sends that answer through a refused schedule change;
   - **(R)** in some cases, an answer that the client also sends through a pain substitution followed by qualified clearance: the answer day must have a strength session on or after it.
2. **A break declared without any pending question**, in a weekly review, with its dates and nonclinical reason. Include at least one break still under way and at least one finished.
3. **Same-day reports with day precision:** a session reported on its own day with only a date (`occurrenceDate`, no `observedAt`) and a `reportedAt` earlier that day, followed by later decisions.
4. **Machine exercises with known loads, logged over several weeks:**
   - some sessions logged exactly as prescribed;
   - on a row that asks for the machine's next heavier setting, the athlete's own setting (`exercises` with explicit loads, or `loadsByPattern`);
   - a confirmation, a second equal log, and a setting that does not fit.
5. **A confounded run (heat, terrain) with an adverse recovery or an impaired next day.** Add a confounded run that went fine as a control.
6. **Corrections and duplicates:** an in-time correction, a late correction, a phone + watch duplicate, and an exact re-send.
7. **Clinical carrier after unanswered training:** covered by item 1's clearance cases. Write the answer so it is meaningful both directly and after clearance.
8. **A break stated together with another kind of event** (a schedule change, a fatigue report, a missed session, a goal or equipment change), followed by **later reviews that do not state the break again**. Include at least one where another event of a different kind comes before the next weekly review, and send the original event again after the return.
9. **(R) A break stated while a clinical route applies**, then a **qualified clearance**, then **reviews that do not state the break again**. Use a clinical flag in the step's eligibility for at least two cases, or a pain substitution named by pattern (delta 8 §2). Add at least one break whose own reason is clinical (illness or injury), then a clearance, and in at least one case **the same break later restated by name with a nonclinical reason**.
10. **Two or more breaks stated before the coach has applied the first one**, followed by a review that states none. Include:
    - at least one where the later break is shorter than the earlier one and begins the day after it ends, or overlaps it, so that together they are a much longer stop than the later one alone;
    - at least one with days between the two breaks;
    - at least one where the athlete, asked, says the later break is a separate break, and at least one where the athlete says it corrects the earlier one;
    - at least one with planned sessions between two separate breaks that are reported only when asked;
    - at least one where the earlier break has a clinical reason and the later one does not.
11. **Two separate breaks with training reported between them.** Include:
    - at least one with isolated training between them: one session or a few, with no whole week of the plan executed;
    - **(R)** at least one with a whole week of the plan executed in full between them, in every sport, every session done as prescribed and well tolerated, strength with loads (see "Writing facts that resolve");
    - at least one where a whole week was executed in full **in one sport only**: every run of the week done, a strength session missed (or the reverse);
    - **(R)** at least one whose week between them holds **optional sessions** left undone (delta 8 §4: a walk/jog athlete with run days beyond its walk/jog sessions, a restart with four run days, or an easy runner with more run days than current running supports), and at least one whose week between them is a **race week** with its race touch or race missed;
    - at least one whose week between them has its strength **logged without reps in reserve**, and at least one where the later break **states a start time** (`startedAt`) on the day of that week's last session;
    - **(R)** at least one whose race week between them holds only the **race touch, an optional shakeout and the race** (delta 8 §4 gives the conditions), and at least one with the **race touch done at half its minutes** (bulk form with `fraction:0.5`);
    - at least one with a **strength session on the earlier break's first day**, reported without a start time, where the athlete then misses strength between the breaks;
    - **(R)** at least one race week between them whose runs are only the **race touch, an optional shakeout and the race**, where the **strength session and the shakeout report an adverse recovery** and the touch and race go well.
12. **A correction of the later break by name** (its `episodeId`, other dates), after the coach returned the athlete from two separate breaks. Include at least one that **moves its start later**, at least one that gives **only its length and last day**, and at least one whose new dates **uncover a planned session between the breaks that was never reported** (left unreported until the coach asks).
13. **A return reported in the middle of its week** (Wednesday or later), after sessions of that week dated before the report that were not done.
14. **A late report of a strength session on the earlier break's first day**, without a start time, after the coach returned the athlete from two separate breaks while strength missed sessions between them; then the athlete's answers to what the coach asks, by different channels across cases (a return report, the week's review, another kind of event), in some case confirming the later break first.
15. **Three or four separate breaks in a chain**, with a week between each pair where only one sport is done in full, and in at least one case **the first two breaks overlapping or touching**.

Also vary everything the diagnostic brief listed:
- athletes, goals, horizons (4 to 16 weeks), frequency;
- equipment and data;
- calendars (not always Monday, several time zones);
- breaks and returns, schedule changes, the race window, learning.

**For every case:**
- `authorIntent`, `coverageTags` and the main `oracleClass`;
- an `independentAssessment` written before any output exists, covering the best-supported behaviour, acceptable alternatives, a bad answer, and when asking or routing to a clinician is right;
- `expectedDomainProperties` about properties, never exact doses unless the question truly has one answer.

Clinical adequacy is `NOT_EVALUABLE_DOMAIN`. The **routing** of a clinical case is judged.

**Independence.** Invent your own athletes. Do not reproduce any known test, fixture or published case. Do not guess the coach's internal thresholds; write what a competent hybrid coach would accept.

## 4. Report back

When sealed, reply with:
- the case list (id, main stratum, one line each);
- the corpus SHA-256, `authorStartedAt` and `sealedAt`;
- the `check-corpus.mjs` result and the warnings of `check-corpus-8.mjs` you kept, with why;
- how each required coverage item is met (case ids), marking the **(R)** items' extra case;
- any interface gap you noticed.

Do not speculate about the runtime.
