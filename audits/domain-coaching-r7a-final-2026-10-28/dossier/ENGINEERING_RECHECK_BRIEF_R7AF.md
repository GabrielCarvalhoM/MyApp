# R7-A Final Closure — engineering re-check brief

You are the **independent engineering judge** of the single freeze of DOMAIN_COACHING_R7-A Final Closure. You did not write this runtime; you change nothing under `CoachingCore/` and rule on no sporting dose (the SSCTR re-checks the same bytes in parallel, regression-only).

## The freeze

| | |
|---|---|
| Revision | **R7A-FINAL-FREEZE** (`CoachingCore/r7/final/RUNTIME_FREEZE_R7A_FINAL.json`) |
| Source digest | `ec2debe730df8931d1525f2b1a729ce3d808c08842fb75397d2fc91084294605` (canonical `hash()` of the `src/*.mjs` SHA-256 map, as in `CoachingCore/scripts/freeze-r7af.mjs`) |
| Policy | R6-POLICY-5 `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`, unchanged |
| Delta from R7A2-FREEZE-1 | changed `src/r6-adaptation.mjs`, `test/r7a1-composition.test.mjs`, `test/r7a2-interruption.test.mjs`; added `test/r7af-episode-identity.test.mjs`. Diff: `dossier/RUNTIME_DELTA_R7AF.diff`; byte-exact R7A2-FREEZE-1 copy: `freeze1-source/` |

Recompute the digest at the start and at the end of your review and record both.

## The question (Founder request §18)

> **Is there any normal V1 path on which two different interruptions share identity or state, or a correction of the same interruption is treated as a new episode?**

The Founder's decisions in §0 (0.1–0.8) are given; do not re-discuss their convenience. Judge whether the runtime implements them.

## Read first

1. `FOUNDER_REQUEST.md` §0, §1, §8–§14, §18 (verbatim).
2. `INTERRUPTION_EPISODE_CONTRACT.md`: the model (identity order, `executedStateAt`, same day, late evidence), the declared boundaries B1–B6 (§7) and the invariant map (§9).
3. `dossier/RUNTIME_DELTA_R7AF.diff` and `CoachingCore/src/r6-adaptation.mjs` (`episodesOf`, `interruptionEpisode`, `stateAtBreak`, `returnStrength`, `staleReturn`, `returnAfterPause`, and the one line in `evaluateProgram` that confirms late evidence first).
4. `CoachingCore/test/r7af-episode-identity.test.mjs`; the edited cases in `test/r7a2-interruption.test.mjs` and `test/r7a1-composition.test.mjs` (marked `R7-A final`).
5. The predecessor's re-check: `audits/domain-coaching-r7a2-2026-10-28/reviews/quality-engineering-r7a2-recheck.md` (QE-R7A2-01, 02, 03).

## Probes you must re-run at least (§18)

| §18 item | Probe |
|---|---|
| Second break, same week | `audits/domain-coaching-r7a2-2026-10-28/reviews/qe-r7a2-P17-…mjs` (L1–L4, C1, C2); P19 cells with B in the re-entry week |
| Second break, cross week | P19 cells with B in the next week (that week **unreviewed**: the earned-start rule, contract §4) and a reviewed variant of your own |
| P13/P14 or successors | `audits/domain-coaching-r7a1-2026-10-27/reviews/qe-a2-P13-…mjs`, `qe-a2-P14-…mjs`; P20 (QE-R7A1-10 through QE-R7A2-01) |
| P02 | `qe-a2-P02-…mjs` (an unnamed date-shifted correction is now **asked** at both clocks, Founder 0.4) and its named successor `probes/r7af-P02-named-correction.mjs` |
| P09 | `qe-a2-P09-…mjs`, SEED 7 and 1013, N 2500 |
| Late evidence | P18 (`qe-r7a2-P18-…mjs`) and your own: before the return, after it inside its re-entry week (asked, then confirmed), after its re-entry week (boundary B1), across a week boundary (boundary B2) |
| Same-day ambiguity | your own: date only (material: asked; immaterial: recorded), and a stated `startedAt` before/after the session |
| Duplicate identity | your own: the same event id twice; the same record with a new id; a duplicate of an earlier interruption after a later one |

The author's recorded outputs on the frozen bytes are in `probes/runs/` (`probes/EVIDENCE_RUNS_R7AF.json` binds each to the digest before and after the run) and are compared with their R7A2-FREEZE-1 outputs in `probes/COMPARE_R7AF.json` (differences named in `probes/COMPARE_R7AF_NAMED.json`). They are evidence to check, not a substitute for your own runs.

## Where to look hardest

The previous judge found QE-R7A2-01 by permuting report order and timing; nothing in that author's evidence made a report of a break after a later break began. Try orders and timings, not only dates:
- every report (first, correction, duplicate) moved before / during / after a later break and before / after that break's report;
- named (`interruption.episodeId`) and unnamed reports; an unknown name; a name of an earlier interruption; a name of one of its reports;
- a correction that moves the start or the end, or moves the interruption after its own first report;
- breaks whose dates touch, overlap or follow with no training between; training recorded only by a late log;
- the week boundary with the week before reviewed or not; three or more interruptions; short returns and their easy slots;
- equipment, fatigue or goal changes between interruptions; time zones (offsets in the intake).

## Rules

- Read-only use of the runtime; synthetic data; DEV_TEST_ONLY authority (`r6/fixtures/dev-authority.mjs`). Put your scripts and outputs in `audits/domain-coaching-r7a-final-2026-10-28/reviews/` (prefix `qe-r7af-`). The probe helpers in `audits/domain-coaching-r7a1-2026-10-27/reviews/qe-a2-lib.mjs` load the live runtime read-only (`QE_LIVE_ROOT` points them at a copy such as `freeze1-source/CoachingCore`).
- Never write under `CoachingCore/` or into another audit folder. Never run: `npm run verify` or `simulate`; any `verify-r*.mjs` with `--write`; any `freeze-*`, `prepare-*`, `queue-*` or `regress-*` script; any evidence runner (`run-evidence-*.mjs`, `ssctr-r7a2-run.mjs`); `ssctr-r7a2-build.mjs`. `node CoachingCore/scripts/verify-r7af.mjs` without `--write` is read-only and may be run; `node --test` in `CoachingCore` is read-only.
- No correction cycle follows your verdict (Founder §17): a material blocker closes the mission NOT_READY and returns to the Founder.

## What to write

`reviews/quality-engineering-r7af-recheck.md` (prose) and `reviews/quality-engineering-r7af-recheck.json`:

```json
{
 "revision": "R7AF-QE-r1",
 "reviewer": "fresh quality-reliability-engineer (model, effort)",
 "freezeReviewed": {"revision": "R7A-FINAL-FREEZE", "sourceDigest": "…", "fileSha256": "…"},
 "digestStart": "…", "digestEnd": "…",
 "verdict": "READY | NOT_READY",
 "answerToSection18": "…",
 "findings": [{"id": "QE-R7AF-NN", "severity": "HIGH|MEDIUM|LOW", "material": true, "what": "…", "reproduction": "reviews/…", "class": "same class | new class"}],
 "blockers": {"QE-R7A-01": "CLOSED|OPEN", "QE-R7A1-09": "…", "QE-R7A1-10": "…", "QE-R7A2-01": "…", "QE-R7A2-02": "…", "QE-R7A2-03": "…"},
 "recommendations": {"WEEK_COMPOSITION_INTEGRITY": "READY|NOT_READY", "STATE_PRESERVATION_INTEGRITY": "…", "EVENT_SUPERSESSION_INTEGRITY": "…", "EXERCISE_MERGE_INTEGRITY": "…", "RETURN_RECOVERY_CEILING_INTEGRITY_engineering": "…"},
 "boundaries": {"B1": "accepted|rejected: why", "B2": "…", "B3": "…", "B4": "…", "B5": "…", "B6": "…"},
 "probesRun": ["…"]
}
```

If NOT_READY, state for each material finding: the reproduction, whether it is the same class or a new one, why stable episode identity did not resolve it, and the smallest architectural decision it needs (Founder §23).
