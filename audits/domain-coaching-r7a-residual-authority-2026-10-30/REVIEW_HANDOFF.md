# REVIEW HANDOFF — R7A-RESIDUAL-AUTHORITY-FREEZE-1

`CURRENT_MISSION = R7A_RESIDUAL_AUTHORITY_FROZEN` · `NEXT_STEP = NARROW_RECHECKS`

This session froze the runtime and stopped (Founder request §32). No reviewer was run.
- Two new, independent sessions recheck exactly these bytes, each on its narrow scope (§33, §34).
- `R7A_EXIT_READINESS` is not declared here; it is decided only after both rechecks.

## The bytes

| | |
|---|---|
| Freeze | R7A-RESIDUAL-AUTHORITY-FREEZE-1, record `CoachingCore/r7/residual-authority/RUNTIME_FREEZE_R7A_RESIDUAL_AUTHORITY.json` |
| Source digest | `e7172eb2e65bfb1da4c102a7efa2bae64bf1c70b06562fd3ce9896defd6dc17d` |
| Manifest digest | `3d214fb53f62e45ca7d99f39f2c562d358719a2264c2de46098d39b318c85125` (86 files: runtime, tests, policy, dev fixtures, `package.json`) |
| Policy | R6-POLICY-5, `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`, unchanged |
| Branch | `claude/r7a-residual-authority-closure` (pushed), created from the baseline `claude/trusting-euler-04la8t` at `5434b3265f5634d1e7c796426cd9d8415b3b1af2`. The baseline is unchanged and not merged |
| Freeze commit | `7d2da3603e224124696a2290766ec448080f3264`. It adds the freeze record and the evidence, and every bound byte in it matches the record. This handoff is in the commit after it, which changes no runtime, test or evidence file |
| Predecessor | R7A-DECISION-AUTHORITY-FREEZE-1 (`3a7166b2…`, `a500cdd9…`; freeze commit `d4631cd`, handoff `5434b32`), byte-exact in `decision-authority-freeze-source/`. Its NOT_READY reviews are on `review/r7ada-decision-authority-engineering` (`17e7285`) and `review/r7ada-decision-authority-ssctr` (`6f5d40c`), read and not merged |
| Runtime delta | `src/r6-adaptation.mjs`, `src/r6-program.mjs`. Added: `test/r7ara-residual-authority.test.mjs`. Edited in place (marked `Residual authority closure`): `test/r7ab-week-start-authority.test.mjs` (I5/P3, §13 premise, I6) |

To check the chain read-only, on Node v24.19.0 (`package.json` engines `>=24`):

```bash
node CoachingCore/scripts/verify-r7ara.mjs --tests
```

- Expected: 13 of 13 checks pass.
- `reviews-not-dispatched` fails by design once a recheck adds its file to `reviews/`.

## What the freeze claims

The rules are in [RESIDUAL_AUTHORITY_CONTRACT.md](RESIDUAL_AUTHORITY_CONTRACT.md). The evidence is item by item in [PRE_FREEZE_REPORT.md](PRE_FREEZE_REPORT.md).

- **A5, the canonical factual state before every decision (QE-R7ADA-01).**
  - A correction, retraction or newly quarantined conflict that moved this week's PlanningView re-plans the sessions still ahead, before any review kind decides. It happens once, in `evaluateProgram`.
  - A week counts as under way while a session is still ahead, by a later date or later today.
  - Confirmation semantics are kept: a log above the corrected row is asked (D44), and an establishment log waits for confirmation (D45).
- **E1, a return never starts above the running state or dose last executed (QE-R7ADA-02, F4-X, the EASY return).**
  - Released is not executed.
  - On a ladder, the cap is the step last run. In easy running, it is the largest long and easy runs executed and tolerated since the entry.
  - A released mode that no run has used is undone wherever the recipe reads the state last run:
    - a short break undoes every such release;
    - a moderate or long break undoes only the walk/jog exit. For a continuous runner, the moderate recipe re-enters from the entry and the long recipe restarts.
- **Found and corrected before the freeze: R7ARA-SELF-01.** On the first evidence round, the direction check of the named differences found that a moderate break after a return's completion (released, never run) resumed return step 1 without the 15-minute entry. The round's record: [probes/SUPERSEDED_ROUND_R7ARA.json](probes/SUPERSEDED_ROUND_R7ARA.json).

**Results on these bytes:**

| Finding | Status | Evidence (predecessor in brackets) |
|---|---|---|
| QE-R7ADA-01 | Absent on the engineering probes | Q01 0/78 [14], Q01b 0/45 [12] |
| QE-R7ADA-02 | Absent on the engineering probes | Q06c 0/21 [11]; Q06d `returnTo` is the executed dose |
| F4-X | Absent on the SSCTR probe | Continuous: ladder 0 [10], duration 0 [4] |
| EASY return factual ceiling | Holds | Q06c clean; the R7ASC easy return 0/4 [1]; self-challenge easy classes 0 violations |
| F4 (ladder) | Holds | Walk/jog matrix 0/99 |

**Tests, checks and preservation:**

| Check | Result |
|---|---|
| Tests | 673/673. On the predecessor, 12 of the 22 tests in the two mission files fail. P4 (preservation) passes on both |
| Self-challenge | 112 cases, 0 violations [71] |
| Mutation | 4 of 4 killed |
| Regression against the predecessor | R6 holdout 35/35, R5 24/24, profiles 16/16 and simulations 14/14, all identical. R6-H35 is the runner error on both |
| Earlier judges | 35 probes: 22 identical, 13 named E1 |
| QE-R7ASC P01–P07 | 10 differ in labels or clocks only; P03 and P05 are named E1 |
| SSCTR kit (F1–F4, D53/D56–D59, HOLD, MAINTAIN) | 43 jobs: 34 identical, 1 clock-only, 8 named E1 |
| Differences | Every one is named by ablation (32 E1, 2 A5), and none raises a dose |

## Declared, for the rechecks (not changed)

- **A5-B1.** A correction can arrive after the week's last session with a review that does not close the week. Next week's projected rows then stand until a closing review. This is R1 (`R1_R7A_BLOCKER = NO`, `R1_PRE_TESTFLIGHT_GATE = YES`).
- **E1-B1.** The quality ladder after a short break: D58 governs it.
- **E1-B2.** RETURN walk days, NF-R7ADA-2: backlog.
- **E1-B3.** The restart switch's long-run offset: bounded by the single-run ceiling. NOT TESTED under a pause after an easy run of the new mode.
- **E1-B4.** OBS-2, W2's reading.
- **E1-B5.** HistoricalState is not redesigned.

## The two rechecks

1. **Engineering** (an independent Quality & Reliability Engineering judge):
   - brief: [reviews/ENGINEERING_RECHECK_BRIEF.md](reviews/ENGINEERING_RECHECK_BRIEF.md);
   - verdict line: `R7A_RESIDUAL_AUTHORITY_ENGINEERING_RECHECK = READY | NOT_READY`.
2. **SSCTR** (`.claude/agents/sports-science-concurrent-training-reviewer.md`, regression only):
   - brief: [reviews/SSCTR_RECHECK_BRIEF.md](reviews/SSCTR_RECHECK_BRIEF.md);
   - verdict line: `R7A_RESIDUAL_AUTHORITY_SSCTR_RECHECK = ACCEPT | NOT_READY`;
   - its brief lists the ruling points E1-a to E1-f this change creates.

Each recheck writes only into `reviews/`, on its own review branch, and never edits the author's files, the baseline or earlier review branches.
- **The stop condition is finite (§35).** Only these block:
  - a material violation of the two root causes;
  - a direct regression of the A, B or E properties, of F1–F4, D53/D56–D59, HOLD or MAINTAIN, caused by this freeze.
- Anything else goes to the backlog and does not reopen phase A.

## Not done in this session (by the request)

- No reviewer run.
- No R7-B0, general R1 solution, NF-R7ADA-2, new science, pace, marathon, KMP, HealthKit, UI, Figma, production or real athletes.
- `audits/growth-layer-2026-10-29/PENDING_CANON_SYNC.patch` is **not applied**.
- No merge into `claude/trusting-euler-04la8t`, `r7/decision-authority-closure-base` or `main`. Earlier review branches are unchanged.
