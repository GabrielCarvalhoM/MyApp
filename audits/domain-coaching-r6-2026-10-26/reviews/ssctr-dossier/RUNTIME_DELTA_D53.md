# Runtime-only answer to SSCTR round 11: D53

**For:** the SSCTR, round 12: a narrow runtime delta check at the same policy hash.
**Author:** the runtime author (Claude Code continuation root, fourth session). This is author material, not evidence of quality.
**Date:** 2026-10-27.

## This is the last review round R6 allows

The Founder bounded the cycle after round 11 (`../../FOUNDER_LOOP_BOUND.md`). At most one more cycle is allowed, and only for a blocker that is new, narrow and runtime-only, which D53 is. If this round does not allow the freeze, R6 closes with an explicit blocker and DOMAIN_COACHING_R7 is the next step. There is no round 13.

Please apply your normal standard: the bound lowers nothing. Please also report **every** blocking item you find, so that R7 starts from a complete list.

## Why there is another check

Round 11 (`../ssctr-review.md`, `../ssctr-policy-review.json`, revision R6-SSCTR-POLICY-r11) did four things:
- resolved D52;
- accepted the conflict filter and ruled on the four questions;
- re-issued all ten records as APPROVE_WITH_CONDITIONS;
- said **freeze NO**, blocked by **D53**.

D53 belongs to LOAD-ESTABLISHMENT and is shared with PLANNED-PROGRESSION and ROTATION. After a performed re-establishment at 2 sets, the next exposure could be 4 sets: the block-boundary set came back at once, on top of the set regained through `priorSets`.

Your next step asked for three things:
1. Fix D53 in the runtime without a policy change.
2. Add probe AH as regression tests, for both cases: a block set earned before the gap, and one earned by the block whose only executed exposure was the re-establishment.
3. Request a narrow runtime check at `18ec48f3…`: probes AH, Z, Y2, U and X, the round-11 sections and the suite re-run, and the records re-issued with a new freeze verdict.

## What did not change

- **The policy:** canonical hash `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`, file sha256 `a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100`.
- **Every other file you recorded.** Of the 53 files in your round-11 `reviewedFiles`, only `CoachingCore/src/r6-program.mjs` differs (`8fdadf2f…` → `57973e97…`).
- **Tests.** One test file is new: `CoachingCore/test/r6-ssctr-r11-fixes.test.mjs` (`4d2e6114…`). No other test changed.
- **The reviewed round-11 runtime is preserved** in `reviewed-18ec48f3-r11-source/`. It was copied before any D53 edit; its 22 files that you listed match your record (`MANIFEST.json`). The unified diff against it is `RUNTIME_DELTA_D53.diff`: 12 changed lines in 4 hunks.

## The fix

It reuses the mechanism you accepted for returns in D49: a cap on the count before the phase reduction.

- **The cap starts at the re-establishment.** In `advanceStrength`, a performed re-establishment sets `regainCap` to the re-establishment count. This happens next to the existing QRE-R6-17 conversion, which only takes effect when the exposure was performed (D52).
- **It applies to the whole count.** In `strengthDose`, the count before the phase reduction is `min(normal, setCap, regainCap)`, where `normal` is the count the exercise would otherwise have, block-boundary set included. Phase reductions then apply on top.
- **It rises one set per executed week without a phase reduction.** In `advanceStrength`, the cap rises by one only in such a week. This is the same rule as the D49 return cap.
- **It ends once it can no longer bind.** That point is the larger of the goal's `maxSets`, the count being regained (`priorSets`) and the current count.
- **A return replaces it.** `startStrengthReturn` clears the cap, because the return steps then govern the sets (D49).
- **What stays the same:** the `priorSets` regain of the base count (QRE-R6-17), block-boundary credit and the D49 return cap.

So the prescribed count, block-boundary set included, comes back from the re-establishment count at most one set per executed week without a phase reduction, up to the count the exercise would otherwise have. Whether a block whose only executed exposure was the re-establishment should earn a set at all stays R17, as you ruled.

**Consequences, disclosed:**
- **What counts as executed.** The cap rises only in an executed week: an ADVANCE gate with logged evidence, as for every other step. A week performed without a usable log, or held, does not advance the regain.
- **Block sets in consolidation weeks.** The development blocks end in consolidation weeks (weeks 3, 7, 11 and 15 in the probe grid). A block set earned there therefore waits for the next week without a phase reduction while the cap still binds.

## Evidence the author ran

All of it uses the dev authority bound to `18ec48f3…`. None of it is independent.

- **Tests.** `node --test`: **443/443**. `r6-ssctr-r11-fixes.test.mjs` adds 5 tests:
  - a block set earned before the gap;
  - a block set earned by the re-establishment week;
  - a phase-reduced week after a re-establishment that does not advance the count;
  - the cap cleared by a return;
  - three further probe-AH timelines, where the earlier count comes back.

  The grid tests use 16 of your 72 probe-AH timelines (FIXED and EVERY_2_WEEKS × STRENGTH and HYPERTROPHY × from weeks 3 and 4 × 4 and 5 skipped weeks). They assert that the count before the phase reduction rises at most one set per later exposure week, and not after a phase-reduced week, until it reaches the count the exercise would otherwise have.
- **Mutation check.** `continuation/author-checks/mutation-check-r11.mjs` catches **5 of 5** mutations:
  - the cap not set;
  - the cap ignored;
  - the cap rising in reduced weeks;
  - the cap ending early;
  - the cap surviving a return.

  Sources were restored byte for byte, with sha256 checked.
- **Your round-11 probe, re-run unchanged** (`r11-author-reruns/README.md`): **31 of 35 sections byte-identical** to your own round-11 output, including Z, Y2, U and X.
  - **AH:** 0 of 584 next exposures more than one set above the re-establishment (round 11: 120), and none more than one set above the count before the gap.
  - **AB, AD and AF:** only the counts after a re-establishment differ, now held back one set per executed week.
  - **AF:** R18 is unchanged, since unreviewed weeks are not touched.
- **`author-check-resume-clock.mjs`** on this runtime (`continuation/author-checks/author-check-resume-clock.d53.out.json`): 0 violations over 160 timelines and 2,222 reviews. 22,410 issued rows were checked, against 22,397 on the D52 runtime: with smaller counts after a re-establishment, session fitting keeps 13 more exercise rows. Every other count is identical.
- **Development outputs.** Regenerated, with 0 semantic differences from the D52 runtime's:
  - the simulation: 14/14 invariants;
  - demonstrations A–M;
  - the R5 dev replay, whose 24 cases still differ from the judged FREEZE-1 replay in the same 8 cases, only in the race-day warm-up line.

## Not adopted, still open

- **R18** (weeks without a gating review). You marked it as not a FREEZE-2 blocker. Its mechanism needs Engineering together with Product/Data (G03), so it is not part of this delta. It stays an owned gap, carried into the FREEZE-2 record and the judge briefs as the weekly-review contract you stated.
- **R5, R8, R9, R11 (the rest), R14, R15, R16, R17 and R19** are unchanged.

## Scripts outside the runtime

None of these was run:
- `freeze-r6-2.mjs`: this dossier, the round-11 tests, the disclosure for rounds 7–11 and D42–D53, and the weekly-review contract (R18) as a field of the FREEZE-2 record;
- `finalize-r6.mjs`: index entries for this dossier and the round-11 tests.

## Disclosure

Unchanged from `RUNTIME_DELTA_D52.md`. The runtime author has never seen the holdout corpus, the first evaluation or any evaluation output.

## What is asked

The narrow runtime check at hash `18ec48f3…`, as your round-11 next step describes, with the records re-issued and a new freeze verdict. This is the last round R6 allows.
