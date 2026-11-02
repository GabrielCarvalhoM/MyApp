# R7-D diagnostic corpus — brief for the independent case author

You are the independent author of the **R7-D diagnostic corpus** for the Vilumo Fit coaching core: an offline, synthetic, shadow-only reference coach for running and strength. You did not write the coach and you must not see it. Your cases will be run once by someone else, and a domain judge will compare what the coach did with your independent assessment.

**What this corpus is for.** It is a diagnostic round before the final gate:
- After its single first evaluation it will be opened, and what it reveals may guide a correction.
- It is not the final holdout, which a different author writes later.
- Write it as carefully as if it were final: realistic athletes, honest coaching expectations, cases that would expose a coach that only looks right on easy paths.

## 1. What you may read (nothing else)

All paths are under `C:/Users/carva/Desktop/myApp/MyApp/.claude/worktrees/domain-coaching-r7-d/`:

1. `audits/domain-coaching-r7-d-2026-11-02/author/INTERFACE_ONLY_R7D.md`: the full public interface. Read it completely first.
2. `audits/domain-coaching-r7-d-2026-11-02/author/CASE_SCHEMA_R7D.json`: the machine shape of a corpus.
3. This brief.

You may run, but need not read, `audits/domain-coaching-r7-d-2026-11-02/author/check-corpus.mjs`: `node <path>/check-corpus.mjs <your corpus.json>`. It checks shapes, vocabularies, dates and references. It never runs the coach.

**Do not open, list, grep or import anything else** in the repository or on disk:
- not `CoachingCore/` (source, tests, fixtures, scripts, records);
- not the R7-D `harness/` folder;
- not other `audits/` or `reviews/` folders, `product/` or `canon/`;
- not earlier holdouts or development cases, git history, or other agents' outputs.

**Do not run the coach or the harness.** You may write and run your own builder script that only constructs and checks JSON (plain Node, no imports from the repository).

**The freeze you write against** (metadata only, nothing to open):
- `R7C-FREEZE-4`, created `2026-11-02T17:32:39.186Z`;
- manifest digest `61937f87bf8ecffa950fb7825b4656ab8da0b04413bca9f3d95c06dbecd3f6b8`.

## 2. What to write

Write only in `audits/domain-coaching-r7-d-2026-11-02/diagnostic/` (create it):

1. `build-diagnostic-corpus.mjs` (optional but recommended): your builder. It writes the corpus and checks your own invariants.
2. `R7D_DIAGNOSTIC_CORPUS.json`: `{corpusRevision:'R7D-DIAGNOSTIC-1', cases:[...]}` in the `R7D-CASE-1` shape, with case ids `R7D-D01`, `R7D-D02`, …. It must pass `check-corpus.mjs` with no errors.
3. `FRESHNESS_MANIFEST.json`, written last, with:

```
{manifest:'R7D-FRESHNESS-MANIFEST-1', corpus:'DIAGNOSTIC',
 author:{role:'independent diagnostic case author (fresh general-purpose instance)', identity:<your agent/model id>,
         runtimeInspectedBeforeSeal:false, outputsInspectedBeforeSeal:false, runtimeImportedOrExecutedByAuthor:false,
         developmentCorpusInspected:false, earlierHoldoutsInspected:false, harnessInspected:false, engineImplementationByAuthor:false,
         assessmentsAuthoredBeforeRuntimeOutput:true},
 authoringProtocol:'R7D-AUTHOR-BRIEF-DIAGNOSTIC (this brief)',
 allowedInputs:[the three files above, with sha256], forbiddenInputs:[a short list in your words],
 inspectedFiles:[{path, scope, sha256}], commandsRun:[...],
 authorStartedAt:<ISO UTC, taken right after reading the interface, before drafting>, sealedAt:<ISO UTC, after the corpus is final>,
 runtimeFreeze:'R7C-FREEZE-4', runtimeFreezeDigest:'61937f87bf8ecffa950fb7825b4656ab8da0b04413bca9f3d95c06dbecd3f6b8',
 corpusPath:'R7D_DIAGNOSTIC_CORPUS.json', corpusSha256:<SHA-256 of the exact file bytes>, hashMode:'sha256 over file bytes',
 bytes, caseCount, steps, coverageTags:{tag:count}, generationMethod:'INDEPENDENT_AUTHOR', seed:null,
 interfaceGapsNoted:[...],
 evaluation:{evaluationCount:0, firstEvaluationAt:null}}
```

Get clock times with `node -e "console.log(new Date().toISOString())"`. After sealing, do not change any file. Stop there.

## 3. The corpus

**Size.** About 16 cases. Fewer, better cases beat many thin ones; 12–20 is fine if that covers the dimensions better. Mix:
- short cases (onboarding, sometimes plus one or two decisions);
- longitudinal timelines of several weeks.

Longitudinal cases are where coaches usually break, so put real effort there.

**Cover these dimensions** (as many as fit, within V1 scope):
- **Athletes:** different running and strength experience (`NONE` to `EXPERIENCED`, sometimes very different between the two sports), ages and available time.
- **Goals:** 10K and half marathon races, non-race running, strength-first, run-first, balanced hybrid, run-only and strength-only.
- **Horizons:** include 4- and 8-week programs as well as 12 and 16.
- **Frequency and availability:** low and high frequency; more chosen days than the athlete's current capacity; shared days; both sports in the same turn (confirmed and not); an unavailable day; a double conflict.
- **Equipment and data:** bodyweight-only, kettlebell-only, machines, full gym; a partial wearable history; low data.
- **Calendar:** start dates on different weekdays (not always Monday) and different time zones.
- **Unknown, late and partial facts:**
  - weeks with no reports;
  - an answer that arrives late or covers only part of what was asked;
  - runs done shorter than prescribed;
  - mixed execution (some done, some not);
  - adverse responses, alone and repeated;
  - an athlete who habitually reports late;
  - a skipped or empty weekly review.
- **Breaks and returns:** short, moderate and long nonclinical breaks; a break whose reason may be clinical; a restart from little running; a walk/jog beginner who builds to a race.
- **Schedule and context changes:** a schedule change, equipment change or travel, a goal change, an event date change.
- **Race window:** build → taper → race week → race → after the race; a question answered during the taper.
- **Safety and scope:**
  - unknown eligibility;
  - a pain or injury flag at onboarding and later;
  - pain with one exercise followed by qualified clearance;
  - an out-of-scope request.
- **Same facts, different routes:** the same execution reported on time versus late, or answered directly versus inside an event that routes to a clinician and is then cleared. Use a `VARIANT` relation or the mechanical relations.
- **Data quality:** the same session reported by phone and watch, a correction, out-of-order arrival, a clock in the future.
- **Learning:** a repeated personal response pattern with consent, noise that should change nothing, and no consent.

**Independence.** Invent your own athletes and situations from coaching experience. Do not try to reproduce any known test, fixture or published case. Do not try to guess the coach's internal thresholds; write what a competent hybrid coach would accept.

**For every case:**
- `authorIntent`: what the case probes.
- `coverageTags`: from the interface list.
- The case's main `oracleClass`.
- `independentAssessment`, written now, from your own judgment and before any output exists:
  - the best-supported behavior;
  - acceptable alternatives;
  - what would be a bad answer;
  - when asking the athlete, or routing to a clinician, is the right answer.
- Expectations (`expectedDomainProperties`) about **properties**:
  - status classes, validity, questions, roles present or absent in a week, phases, relations between weeks;
  - `JUDGED` statements for what only a domain judge can assess.

  Avoid exact doses unless the coaching question truly has one answer. Mark clinical adequacy as `NOT_EVALUABLE_DOMAIN`.
- Session references the coach's plan will contain: chosen days, the long run on the stated `longRunDay`, the race on its date, or the bulk form. Use the `answer` shorthand to answer a question about unreported sessions.

## 4. Report back

When sealed, reply with:
- the case list: id, the main dimension, one line each;
- the corpus SHA-256, `authorStartedAt` and `sealedAt`;
- the `check-corpus.mjs` result;
- any interface gap you noticed: a scenario you could not express, or an ambiguity you resolved and how.

Do not include runtime speculation; you have none.
