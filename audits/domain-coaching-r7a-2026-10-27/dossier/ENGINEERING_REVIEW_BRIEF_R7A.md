# R7-A independent engineering review — brief

You are the independent engineering judge of DOMAIN_COACHING_R7-A (`audits/domain-coaching-r7a-2026-10-27/TASK_CONTRACT.md`, Founder request in `FOUNDER_REQUEST.md`). You did not write this runtime and you do not fix it. Your job is to **try to break** the candidate, not to re-read the list of fixed bugs.

## Target

- Runtime frozen as **R7A-FREEZE-1**: `CoachingCore/r7/RUNTIME_FREEZE_R7A_1.json` (source digest `1f2bb1d8…`; every file with its SHA-256). Verify your reviewed files against it.
- Baseline (R6 closure runtime, byte-exact): `audits/domain-coaching-r7a-2026-10-27/pre-r7a-source/`. Delta: `dossier/RUNTIME_DELTA_R7A.diff` (5 files: `r6-program.mjs`, `r6-adaptation.mjs`, `r6-provenance.mjs`, `r6-intake.mjs`, `r6-prescription.mjs`).
- Offline synthetic Node 24 shadow reference. Public entry point `CoachingCore/src/r6-index.mjs` (`generateProgram`, `evaluateProgram`); interface notes in `CoachingCore/r6/holdout/INTERFACE_ONLY.md`. Use `CoachingCore/r6/fixtures/dev-authority.mjs` (`devAuthority()`, DEV_TEST_ONLY, bound to policy hash `18ec48f3…`).

## What R7-A claims (break these)

The headline is "the coach does not change meaning just because the same situation entered through another branch, state mode, phase or representation". Claimed structure and invariants:

1. **One composition point for strength doses.** Every row is a candidate (`strengthCandidate`) followed by one phase step (`phaseDose`); no row returns before it. Race week / post-event: main lifts only, 1 set, RIR ≥ 4; taper/specific RIR ≥ 3; every row ≤ the phase reduction of the count it states (`exposure.phaseBasis`). `validateWeeks` enforces it on every generated or proposed week.
2. **One reading of the week.** Each row carries `exposure {kind, phase, phaseBasis, baseSets, normalSets}`; reviews read it instead of re-deriving kinds from load modes. The first executed exposure decides the week's kind; the last executed one gives its counts. Rows without `exposure` (programs stored before R7-A) are classified by `exposureKindOf`.
3. **D53, every state mode:** after any performed re-establishment the count rises at most one set per executed unreduced week (regain cap), whatever the state's mode.
4. **Exercises not in use do not change current state** (return-entry week = an exercise in use at the entry step).
5. **Unknown stays unknown:** a set without reps is neither met nor missed (HOLD, no regression, no adoption of a missing value).
6. **Canonical input stability:** intake strength records merge independently of order and source, and an incomplete record never displaces a complete dose; a source label alone never changes a decision; an exact replay or an agreeing second report changes nothing; contradictory reports of one session are a conflict in either arrival order; a correction survives being carried into later reviews (normalization of the carried ledger is idempotent); a dated schedule change is never applied beyond its dates; a race finished faster than its window is complete.

Known and routed (not defects of this candidate unless you find them worse than recorded): C15 / SSCTR R18 (weeks without a review are credited by the projection and read as zero running by a replan; needs a review-continuity input and Product/Data G03, routed to R7-C); F-ACCESSORY-REPS (accessory reps depend on load mode under STRENGTH/MAINTAIN goals; undeclared policy, routed to R7-B); the regain base after a phase-reduced re-establishment is a sporting question put to the SSCTR (Q1 in `dossier/SSCTR_DOSSIER_R7A.md`).

## Look for

branch asymmetry; skipped modifiers; unexpected early returns; duplicated semantic logic (two definitions of one concept that can disagree); inconsistent state transitions; stale state (state that survives a change it should not); order dependence (input order, arrival order, session order); invalid state reconstruction (a review reading something other than what was prescribed or executed); provenance leaks (source labels or record order changing outcomes); hidden unit or convention conversion errors (TOTAL / PER_HAND / BODYWEIGHT, kg / lb). Also check that the new validation cannot reject legitimate proposals in ordinary use (false UNSUPPORTED), and that legacy programs without `exposure` still behave as before.

Existing evidence you may use or distrust: `CoachingCore/test/r7a-semantic-core.test.mjs`; `probes/r7a-class-probes.mjs` (+ BEFORE/AFTER outputs); `probes/mutation-check-r7a.out.json`; `CoachingCore/r7/REGRESSION_R7A.json`; the SSCTR round-12 instrument copy `probes/ssctr-r12-instrument.mjs`.

## Rules

- Do not edit anything under `CoachingCore/` or any R6/R5 file. Write only under `audits/domain-coaching-r7a-2026-10-27/reviews/` (your probe scripts and outputs); temporary copies only in the OS temp directory.
- Never run `npm run verify` or any `verify-r*` script (they rewrite closed missions' evidence). `node --test` in `CoachingCore` is fine.
- Output `reviews/quality-engineering-r7a-review.json` and `.md`: reviewer/instance, the freeze you reviewed (verify hashes), what you ran, each finding with id, severity (HIGH / MEDIUM / LOW), class, a minimal reproduction (script path + exact output), the claim it breaks and whether it is new / narrow / runtime-only; claims you tried to break and could not; and a verdict: `R7A_ENGINEERING_REVIEW` = READY / READY_WITH_EXPLICIT_NONBLOCKING_GAPS / NOT_READY, with the blocking list.
- **Cycle bound** (Founder's standing rule): this is the one review of the candidate; at most one narrow re-check follows, and only for blockers that are new, narrow and runtime-only. List every blocker you can find now.
