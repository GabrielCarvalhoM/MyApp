# R7-B.1 closure handoff — CLOSED NOT_READY with one explicit blocker (2026-10-31)

DOMAIN_COACHING_R7-B.1 closed the four blockers of the R7-B closure and the residuals of QE-R7B-01 and -05, then ran the one correction cycle request §17 allows, which was opened by the reviews of R7B1-FREEZE-1. It closes **NOT_READY**. The one recheck of the corrected freeze found a pre-existing clinical-first gap on R7-A's late-evidence path, and the bound allows no further cycle. Start any follow-up here. Disposition: [`FINAL_DISPOSITION.json`](../../../audits/domain-coaching-r7-b1-2026-10-31/FINAL_DISPOSITION.json).

```text
R7B_RUNTIME_REPERTOIRE_READY = NO
R7B1_SSCTR_GATE              = ACCEPT_WITH_CONDITIONS  (R7B1-SSCTR-r2; F12 decision half, F13 narrowed, F14 routed)
R7B1_ENGINEERING_GATE        = NOT_READY               (QE-R7B1-04, MAJOR, pre-existing)
R7B1_QUALITY_GATE            = READY
V1_COACHING_AUTHORITY_READY  = NO (not declared)
CORRECTION CYCLES CONSUMED   = 1 of 1
```

## Runtime to start from

**R7B1-FREEZE-2**:
- Record [RUNTIME_FREEZE_R7B1_2.json](RUNTIME_FREEZE_R7B1_2.json) (sha256 `e75a2799ae1b9387e7c8831646cb877967262c19aa11c18c8d54c2a7b94f27d5`).
- Commit `146ebb8` (bytes of `f6525e7`).
- Source `f54e5c0345aa9c1dbd9743a78127b59720b3cf4d68c1b53ed11bfdbf40ed1612`, manifest `980d830106f3c75722126a8c0bffb5e5aafa9a261b411c30a4779d6d3e08fae8`.
- 114 files, 786 tests.
- Verify with `node scripts/verify-r7b1.mjs [--tests]`, which is read-only. FREEZE-2 is the default and verified 25/25 in [VERIFICATION_R7B1_2.json](VERIFICATION_R7B1_2.json).

R7B1-FREEZE-1 (`d41df8b`) is superseded and verifies only at its own commit (`--freeze 1`). R6-POLICY-5, R7B0-CATALOG-2, its schema and foundation, and the 13 B0 SSCTR r2 records are unchanged. R7-B.1 adds no dose: the SSCTR found it removes or keeps out first exposures and never adds sets.

## Explicit blocker (first in the next mission)

| # | Id | Gate | Required change (from the judge) | Evidence |
|---|---|---|---|---|
| 1 | QE-R7B1-04 | Engineering (MAJOR; pre-existing: the R7-A residual authority change `ecd623b` with R7-B's substitution screen `8d32f7d`, identical on R7-B FREEZE-2 and R7B1-FREEZE-1) | See below. | `audits/domain-coaching-r7-b1-2026-10-31/reviews/engineering/recheck/probes/k6-stale-return-clinical.mjs`, `k6b-stale-return-two-step.mjs` (reproduced by the author from a mirror of the FREEZE-2 bytes) |

What QE-R7B1-04 does, and the change it needs:
- **Behaviour.** In a return's re-entry week, once a late report of training before the break is recorded, `decide()` asks R7-A's late-evidence question (`staleReturn`, `src/r6-adaptation.mjs:359`) before the handler runs. A review reporting pain with an exercise then gets "confirm that interruption" with a pending ASK, and the clinical flag is lost. With a block choice in the same review, the block-choice question comes back instead.
- **Required change.** The handler's clinical screen comes before R7-A's late-evidence confirmation, as R7-B.1 already made it come before the block-choice question. A pain, injury or illness report routes `CLINICAL_HUMAN_REQUIRED` with no proposal whatever else the review carries. This is B0-C06 condition 8 and D08.

## Routed, with owners (not blocking)

| Id | Severity | What | Owner |
|---|---|---|---|
| R7B1-SSCTR-F12 (decision half) | MINOR | A substitute planned before the event weeks is disclosed only when a review keeps it out; the deciding decision says nothing about the condition (68 decisions in s01) | Next runtime mission (Engineering), Product/UX for presentation, SSCTR re-review |
| R7B1-SSCTR-F13 (narrowed) | MINOR | The question when every candidate is already in the session never offers leaving the slot out; after a SKILL_MISMATCH, keeping the exercise is offered alone when nothing else fits | Next runtime mission, Product/UX; the SSCTR decides the resolution |
| R7B1-SSCTR-F14 | MINOR, new | In 6 of 18 confirmed permanent losses (2-day programs) no pull exercise remains in weeks 4–7; the confirmed disclosure does not name the lost stimulus (R6-SUBSTITUTION C8) | Next runtime mission, Product/UX |
| QE-R7B1-02 | MINOR, pre-existing | A short return in the capped period re-plans the rest of that week uncapped | Next runtime mission (Engineering) |
| QE-R7B1-03 | MINOR, pre-existing | A knock-on slot moves to pike-push-up without a disclosure (64 of 160 knock-on rows) | Next runtime mission; suitability is the SSCTR's |
| QR7B1-06 | MINOR, pre-existing | Knock-on changes are not listed in `substitutions`; event-week knock-ons are now disclosed | Next runtime mission |
| Engineering observations | — | A capped novice's day layout after a substitution. A one-arm-db-row mismatch landing on band-face-pull (SSCTR). One lost item with two gaps names only the first (recheck OBS-03). The keep-only question asks for nothing, and a later RECOVERED review asks again (recheck OBS-04). | Next runtime mission |
| Quality observation | — | Under EVERY_2_WEEKS the selected exercise alternates after the event (the rotation's own cadence) | Next runtime mission |

Carried from R7-B, still not pulled: QE-R7B-R2-05 (the R18 path), QE-R7B-R2-OBS-01, QE-R7B-OBS-01 to -03, F6, F7, F8 and F10, R18, the running-ceiling units, and the rest of the R7-B backlog. They are listed in [`../b/R7B_CLOSURE_HANDOFF.md`](../b/R7B_CLOSURE_HANDOFF.md).

## What holds (judged)

- **R7-B blockers closed.**
  - QE-R7B-OBS-04: SSCTR met on FREEZE-1, extended to every row on FREEZE-2.
  - QE-R7B-R2-01, -R2-02 and -R2-03: Engineering resolved on FREEZE-1.
  - QE-R7B-01 residual (R2-04): Engineering 0 inconsistent decisions on FREEZE-1; Quality 0 rotation slots not taken on FREEZE-2.
  - QE-R7B-05 residual on the R2-01 path. R2-05 stays recorded as the R18 path.
- **Correction cycle (C1–C6 in [BLOCKER_CLOSURE_R7B1.md](BLOCKER_CLOSURE_R7B1.md)).**
  - QE-R7B1-01: the clinical screen before any block-choice question. Engineering 16/16; SSCTR 70/70.
  - QR7B1-01: the no-lower-skill question acts. Quality 93/93; SSCTR 36/36; leaving the slot out after a SKILL_MISMATCH is allowed.
  - QR7B1-02, with SSCTR F11: the event-week rule for every row. SSCTR s02 never-performed event-day rows 94 → 0; Quality q01 24 → 0.
  - QR7B1-03, -04 (with the review half of F12) and -05.
- **Quality READY.** No new finding.
- **SSCTR r2.** All seven records APPROVE_WITH_CONDITIONS, bound to FREEZE-2 and queued for funded human revalidation (queue 223 → 230, append-only).
  - The SSCTR corrected its earlier TAPER statement: FREEZE-1 did not meet "no new exercise in a planned taper" on the wider intake grid (222 first exposures in 144 of 2,560 programs with short sessions); FREEZE-2 does.
- **Evidence on FREEZE-2.**
  - Intake differential against R7-B FREEZE-2: 83/83 identical.
  - Timeline differential: PRESERVE 98/98 identical.
  - Adversarial probes: 3,228 checks, 0 failed.
  - Mutation: 32/32 for R7-B.1, 24/25 for R7-B (M13 equivalent).

## Next mission

A narrow runtime mission on R7B1-FREEZE-2 (proposed name DOMAIN_COACHING_R7-B.2): blocker 1 first, then the owned minors, a new freeze, and one review per gate. It needs its own Founder authorization. Accepting the QE-R7B1-04 risk instead is the Founder's decision. R7-C is not started.
