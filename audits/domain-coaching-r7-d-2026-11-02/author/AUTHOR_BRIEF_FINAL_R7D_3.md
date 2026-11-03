# R7-D final holdout — brief for the independent case author (`R7D-AUTHOR-BRIEF-FINAL-3`)

> **Not in use yet.** This brief is registered with `R7D-PREREG-4` in Phase 3.2 and replaces `R7D-AUTHOR-BRIEF-FINAL-2` (`AUTHOR_BRIEF_FINAL_R7D_2.md`, the Phase 3.1 record; `-1` is the Phase 3 record). It is handed to a fresh author only in Phase 4, after the final runtime freeze, with that phase's authorization. No final case, corpus or seed exists when this brief is written.

You are the independent author of the **R7-D final holdout** (H1) for the Vilumo Fit coaching core: an offline, synthetic, shadow-only reference coach for running and strength. You did not write the coach and you must not see it. Your corpus is sealed before anyone runs it, run exactly once, and judged by a domain judge and an engineering judge who are not you. A coach that only looks right on easy paths should fail on your cases.

## 1. What you may read (nothing else)

All paths are under the worktree the coordinator gives you:

1. `audits/domain-coaching-r7-d-2026-11-02/author/INTERFACE_ONLY_R7D.md` (R7D-INTERFACE-1), then `author/INTERFACE_DELTA_R7D_2.md`, then `author/INTERFACE_DELTA_R7D_3.md`, then `author/INTERFACE_DELTA_R7D_4.md`. Together they are R7D-INTERFACE-4; the newest delta prevails where they differ. Read all four completely first.
2. `audits/domain-coaching-r7-d-2026-11-02/author/CASE_SCHEMA_R7D.json`: the machine shape of a corpus.
3. This brief.

You may run, but need not read, `author/check-corpus.mjs` (`node <path>/check-corpus.mjs <your corpus.json>`). It checks shapes, vocabularies, dates and references, and never runs the coach.

**Do not open, list, grep or import anything else:**
- not `CoachingCore/`;
- not the R7-D `harness/`, `diagnostic/`, `phase3/`, `phase31/` or `phase32/` folders;
- not the pre-registrations, checkpoints, other `audits/` or `reviews/`, `product/` or `canon/`;
- not git history or other agents' outputs.

Do not run the coach or the harness. Your own builder script may only construct and check JSON (plain Node, no imports from the repository).

**The freeze you write against:** `R7D-FREEZE-3`. The coordinator gives you its creation time and manifest digest when you are commissioned (metadata only). Your `authorStartedAt` must be later than that creation time.

## 2. What to write

Write only in `audits/domain-coaching-r7-d-2026-11-02/final/` (create it):
1. `build-final-corpus.mjs` (recommended): your builder.
2. `R7D_FINAL_HOLDOUT.json`: `{corpusRevision:'R7D-FINAL-1', cases:[...]}` in the `R7D-CASE-1` shape, with case ids `R7D-F01`, `R7D-F02`, …. It must pass `check-corpus.mjs` with no errors.
3. `FRESHNESS_MANIFEST.json`, written last, in the `R7D-FRESHNESS-MANIFEST-1` shape of the diagnostic brief. The differences:
   - `corpus:'FINAL'`;
   - `authoringProtocol:'R7D-AUTHOR-BRIEF-FINAL-3'`;
   - `runtimeFreeze:'R7D-FREEZE-3'` and its digest;
   - `corpusPath:'R7D_FINAL_HOLDOUT.json'`;
   - the six `…Inspected…`/`…Executed…` flags false;
   - `assessmentsAuthoredBeforeRuntimeOutput:true`;
   - `seed:null`;
   - `evaluation:{evaluationCount:0, firstEvaluationAt:null}`.

After sealing, change nothing and stop.

## 3. The corpus

**Size:** 32 to 36 base cases, 70 to 100 decision steps in all. Longitudinal timelines carry most of the weight.

**Minimum strata** (base cases; a case may count for more than one):

| Stratum | Min. |
|---|---|
| Cold start: run-first half marathon over 12–16 weeks; a close 10K (≤ 8 weeks); strength-first; balanced hybrid with shared days and turns; a 4-week general block; absolute beginner; experienced in both; bodyweight-only or kettlebell-only; a partial wearable history with strength known only by type and duration; more chosen days than current capacity | 10 |
| Built only from walk/jog or a restart, toward a race | 1 |
| Safety and scope: unknown eligibility; pain; a break with a clinical cause; an out-of-scope request | 4 |
| Longitudinal: weeks with no reports and a late answer; runs done shorter, mixed or adverse; an athlete who always reports late; skipped or empty reviews | 6 |
| Events: schedule (including in the last week); unavailable day; double conflict; equipment or travel; substitution without and with pain, then clearance; goal or race-date change; local or systemic fatigue, alone or repeated | 6 |
| Nonclinical return: short, moderate and long | 2 |
| Build → taper → race → after the race, in 10K and half marathon, with a response during the taper | 2 |
| Data: phone + watch duplicate; a contradiction; a correction; out-of-order arrival; a clock in the future; time zones | 2 |
| Learning: a consented pattern versus noise; no consent | 1 |

**Required coverage.** Each item needs **at least two independent base cases**, except the confounded item and the clinical-cause break of item 9, which need at least one each. A holdout without all of them is invalid and replaced (R7D-PREREG-2 Δ9, R7D-PREREG-3 Δ6, R7D-PREREG-4 Δ5):
1. **A long reporting silence:** more than a month with no reported run, so that the coach asks about the unreported sessions. Then:
   - the athlete's **direct answer** in the next step (reports per session, or a declared break with its reason);
   - in some case, the question and its answer in the program's **last week** (the client then also sends the answer through a refused schedule change);
   - in some case, an answer the client also sends through a pain substitution followed by **qualified clearance**.
2. **A break declared without any pending question**, in a weekly review, with its dates and nonclinical reason. Include at least one break still under way and at least one finished.
3. **Same-day reports with day precision:** a session reported on its own day with only a date (`occurrenceDate`, no `observedAt`) and a `reportedAt` earlier that day, followed by later decisions.
4. **Machine exercises with known loads, logged over several weeks:**
   - some sessions logged exactly as prescribed;
   - on a row that asks for the machine's next heavier setting, the athlete's own setting (`exercises` with explicit loads, or `loadsByPattern`);
   - a confirmation, a second equal log, and a setting that does not fit.
5. **A confounded run (heat, terrain) with an adverse recovery or an impaired next day.** Add a confounded run that went fine as a control.
6. **Corrections and duplicates:** an in-time correction, a late correction, a phone + watch duplicate, and an exact re-send.
7. **Clinical carrier after unanswered training:** covered by item 1's clearance case. Write its answer so it is meaningful both directly and after clearance.
8. **A break stated together with another kind of event** (a schedule change, a fatigue report, a missed session, a goal or equipment change), followed by **later reviews that do not state the break again**. Include at least one where another event of a different kind comes before the next weekly review, and send the original event again after the return.
9. **A break stated while a clinical route applies** (a clinical flag in the eligibility, or a substitution with pain), then a **qualified clearance**, then **reviews that do not state the break again**. Add at least one break whose own reason is clinical (illness or injury), then a clearance.
10. **Two or more breaks stated before the coach has applied the first one**, followed by a review that states none. Include:
   - at least one where the later break is shorter than the earlier one and begins the day after it ends, or overlaps it, so that together they are a much longer stop than the later one alone;
   - at least one with days between the two breaks;
   - at least one where the athlete, asked, says the later break is a separate break, and at least one where the athlete says it corrects the earlier one;
   - at least one with planned sessions between two separate breaks that are reported only when asked;
   - at least one where the earlier break has a clinical reason and the later one does not.

Also vary everything the diagnostic brief listed:
- athletes, goals, horizons (4 to 16 weeks), frequency;
- equipment and data;
- calendars (not always Monday, several time zones);
- breaks and returns, schedule changes, the race window, learning.

**For every case**, as in the diagnostic brief:
- `authorIntent`, `coverageTags` and the main `oracleClass`;
- an `independentAssessment` written before any output exists, covering:
  - the best-supported behaviour;
  - acceptable alternatives;
  - a bad answer;
  - when asking, or routing to a clinician, is right;
- `expectedDomainProperties` about properties, never exact doses unless the question truly has one answer.

Clinical adequacy is `NOT_EVALUABLE_DOMAIN`. The **routing** of a clinical case is judged.

**Independence.** Invent your own athletes. Do not reproduce any known test, fixture or published case. Do not guess the coach's internal thresholds; write what a competent hybrid coach would accept.

## 4. Report back

When sealed, reply with:
- the case list (id, main stratum, one line each);
- the corpus SHA-256, `authorStartedAt` and `sealedAt`;
- the `check-corpus.mjs` result;
- how each required coverage item is met (case ids);
- any interface gap you noticed.

Do not speculate about the runtime.
