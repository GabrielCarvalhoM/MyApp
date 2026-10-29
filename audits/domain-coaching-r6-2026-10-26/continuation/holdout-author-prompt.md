<task-route>{"execution_level":"L3","work_kind":"material_other","model":"claude-opus-5-5","effort":"xhigh","reason":"Fresh unseen R6 holdout authored without runtime access after the runtime freeze; it is the primary readiness evidence and must be independent of the runtime author","mode":"productization","owner":"general-purpose","judges":["quality-reliability-engineer"],"artifacts_required":["CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json","CoachingCore/r6/holdout/INDEPENDENCE_MANIFEST.json","CoachingCore/r6/holdout/build-independent-holdout.mjs"],"stop_when":"The corpus is written, validated against the interface by your own builder, hashed and sealed in the manifest","escalate_if":"The interface cannot express a scenario you consider essential, or you are asked to read or run anything outside the permitted list"}</task-route>

You are the independent holdout author for DOMAIN_COACHING_R6 of the Vilumo Fit coaching core (an offline, synthetic, shadow-only reference coach for running + strength, Node 24). You did not write the runtime, and you must not see it. Your corpus is the primary evidence for whether the coach is ready, so it should probe real coaching quality, not formatting.

## Permitted reads (nothing else)

- `C:/Users/carva/Desktop/myApp/MyApp/CoachingCore/r6/holdout/INTERFACE_ONLY.md` — the full public interface. Read it completely first.
- `C:/Users/carva/Desktop/myApp/MyApp/CoachingCore/r6/RUNTIME_FREEZE_R6.json` — metadata only (its `frozenAt` and `sourceDigest`); do not open any file it lists.

Do not open, list, grep or import anything else in the repository: not `CoachingCore/src`, `test`, `scripts`, `r5`, `r6` (other than the two files above), fixtures, demonstrations, simulation results, `audits/`, `reviews/`, `product/`, `canon/`, earlier holdouts, git history, or other agents' outputs. Do not run the runtime or the evaluator. You may write and run your own builder script that only constructs and validates JSON.

## What to write

1. `CoachingCore/r6/holdout/build-independent-holdout.mjs` — your builder (plain Node, no imports from the repository). It writes the corpus and checks your own invariants (dates, week indices, interface shapes).
2. `CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json` — `{revision:'R6-HOLDOUT-1', cases:[...]}` in the interface's corpus shape.
3. `CoachingCore/r6/holdout/INDEPENDENCE_MANIFEST.json` with at least: `revision`, `author` (your role), `authorStartedAt` (ISO UTC, recorded right after reading the interface and before drafting — it must be later than the freeze's `frozenAt`), `sealedAt` (ISO UTC, after the corpus is final), `freezeDigest` (the freeze `sourceDigest`), `corpusSha256` (SHA-256 over the exact file bytes), `hashMode`, `bytes`, `cases`, `engineImplementationByAuthor:false`, `runtimeInspectedBeforeSeal:false`, `outputsInspectedBeforeSeal:false`, `runtimeImportedOrExecutedByAuthor:false`, `developmentFixturesInspected:false`, `earlierHoldoutsInspected:false`, `assessmentsAuthoredBeforeRuntimeOutput:true`, `firstEvaluationExecutedByAuthor:false`, and `inspectedFiles` (path, scope, sha256). Get clock times with `node -e "console.log(new Date().toISOString())"`.

After sealing, do not change the corpus. Stop there; someone else runs the single first evaluation.

## Corpus design

About 30 cases (quality over quantity), each with `caseId` `R6-H01`…, a `family`, a plain-language `scenario`, `operation` `GENERATE` or `SEQUENCE`, the `intake`, `steps` for sequences, and an `independentAssessment` you write now, from your own coaching judgment: `rationale`, `preferredCoachingBehavior`, `acceptableAlternatives`, `concerns` (what would be a bad answer). Be specific enough that a judge can tell a best-supported answer from a merely safe one, and say when asking the athlete or routing to a clinician is the right answer.

Think like an experienced hybrid running/strength coach designing adversarial but realistic athletes for a V1 product (adults, 10K and half-marathon events, general fitness and strength goals, four to sixteen week horizons). Cover, at least:

- Cold start from onboarding-like answers for distinct athletes: run-first half marathon (12–16 weeks), strength-first with some running, balanced hybrid with no stated priority, novice runner who is an experienced lifter, experienced runner new to strength, general fitness, low data / no wearable, partial wearable history, too many chosen days for current capacity, equipment-limited or bodyweight-only, short (4-week) and 8-week horizons, a 10K closer than ideal.
- Missing or unsafe facts: unknown eligibility, pain or injury flags, out-of-scope events or populations, contradictory schedule facts — where the right answer is to ask or route, not to prescribe.
- Balanced conflicts: shared days and shifts where running and strength genuinely compete; cases where one arrangement is clearly better and cases where the athlete should be asked.
- Adaptation sequences over several weeks (adopt proposals when a real athlete would follow them): missed key run in a build and near an event, missed key strength session, partial session, one bad session vs a repeated pattern, repeated easier-than-planned sessions, local and systemic fatigue, schedule change, unavailable day, double conflict, equipment change or travel, goal change, event date change, event-week conflict.
- Return after short, moderate and long nonclinical pauses, and a pause whose cause may be clinical.
- Event transition: build → taper → race week → race → post-event for a 10K and a half marathon.
- Imperfect data: duplicates from phone and watch, contradictory reports, a correction, out-of-order arrival, a future timestamp or clock skew, timezone offsets, stale sync, missing effort, partial wearable detail.
- Athlete learning: a repeated athlete-specific response pattern that should change a future decision, and noise that should not.

Use only the interface. Sessions are referenced by week, sport, day and role; the program decides which day carries which role and when roles appear, so prefer `sport` + one of the athlete's chosen `day`s, use `role:'LONG'` with a stated `longRunDay`, and give role preference lists where a scenario needs a specific key session. Weekly reviews belong after the week's last session (asOf with a timezone, inside that week). Use `AS_PRESCRIBED` when the athlete did what was planned, explicit minutes or sets when not, and leave unknowns unknown. Dates are synthetic; choose a 2027 calendar and keep it internally consistent.

Report back: the case list (id, family, one line each), the manifest hash and timestamps, and any interface gap you noticed.
