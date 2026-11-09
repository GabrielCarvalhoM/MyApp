# QRE recheck of the V1CP bounded fix cycle (QRE-V1CP-RECHECK-r1, 2026-11-09)

The machine-readable record is `QRE_V1CP_RECHECK.json`, beside this file. Where the two differ, the JSON prevails.

**Verdict: NOT_READY** (quality gate QUALITY_BLOCKED) for `5ee9dec` as an executable reference runtime. This is not V1 authority.

**Judge:** a fresh, independent Quality & Reliability Engineer instance. It wrote none of the candidate or the cycle, edited no code or tests, and committed nothing. Mutations and probes ran only in scratch copies outside the repository.

## Regressions rerun

| Check | Result |
|---|---|
| `node --test` in CoachingCore | 1080/1080 pass, exit 0 |
| Differential (full results) | H1: 13 of 130 steps differ in summary; 104/130 byte-identical. Generations 39/39 and H2 300/300 identical. Matches the cycle's claim. |
| `full-diff-keys.mjs` | Byte-identical to the shipped key file |
| Claim: the 13 new differences are only CLINICAL_HOLD rows | **Confirmed.** With the rows removed, only `inputHash` and `trace.reviewHash` (digests of the carried record) differ. With the rows stripped before each step, all 13 match FREEZE-6. |
| Fuzz, 1,000 seeds, 13,699 steps (random and Situation 1 profiles) | 0 exceptions, 0 caught TypeErrors, 0 non-determinism, 0 JSON round-trip changes |

## Rulings on QRE-V1CP-01 to -13

- **Closed (6):** 01 (the lexicon is the approved list), 04, 06, 08, 12.
- **Closed with conditions (4):** 02, 03, 05, 07. The original scenarios are fixed; residues are listed below.
- **Open (4):** 09, 10, 11, 13.
- **-10** is acceptable as a named blocker. It still fails closed, with an owner and a trigger, but it blocks any real collection.
- **-11** is acceptable as carried. Measured at those assertions, the R4 carrier returns only REPLAN_FROM_EVIDENCE or KEEP. An owner and stop are set here (C7).

## Survivor mutants

- **Caught now (8):** M01, M07, M11, M26, M33, M37, M51, M54.
- **M12 survives**, contrary to the cycle's claim. Its test runs on the declared-break path, where the guard became redundant. On the readiness path the guard still changes the restart's execution facts, and no test pins that.
- **M29 is now determinable** and survives. New lower-body rows after a lifted restriction enter at 2 sets RIR 3 instead of the entry dose.
- **On the cycle's own code, 20 of 24 mutants are caught.** The survivors are N11, N14, N18 and N19. N14 restores the exact AF-01 defect undetected.

## New findings

| Id | Severity | In one line |
|---|---|---|
| QRE-V1CPR-01 | MAJOR | SSCTR-V1CPI-03 (I-15) is not fixed for a single declared break. The SSCTR's own scenario still resumes the last doses after 21 days off. The test is vacuous. |
| QRE-V1CPR-02 | MAJOR | Regression introduced by the cycle: `readableF08` drops every S6 check. An answered adverse check is asked again before every later decision, and replays duplicate it. |
| QRE-V1CPR-03 | MAJOR | The restart drops a hold it cannot read (another athlete id, or an intake dated before the hold) and returns a plan. Route: Security. |
| QRE-V1CPR-04 | MAJOR | D49: after a missed ladder or d49 week, strength rises 2 sets over the last executed week. Route: SSCTR to confirm. |
| QRE-V1CPR-05 | MAJOR | C-2 is checked only at the window's opening and end. A race moved into a window or ladder, or a ladder shifted onto a race, keeps race effort in R0–R3. Route: SSCTR. |
| QRE-V1CPR-06 | MAJOR | Test adequacy: M12, M29, N11, N14, N18 and N19 survive. |
| QRE-V1CPR-07 | MINOR | The named-hold check matches undefined to undefined, so partial references are accepted. Route: Security. |
| QRE-V1CPR-08 | MINOR | A hold on record cannot be released once the reference state is gone, so a new plan is blocked for good. |
| QRE-V1CPR-09 | MINOR | A strength-only return waits for a running race. Route: SSCTR. |
| QRE-V1CPR-10 | MINOR | The chained 14-day bound can ask "choose at most 0 days". |

The narrow regression probes (holds, restart facts, `d49Hold` termination, the episode-filtered `endF08Marks`, the supersede, the early end, the race question) are in `regressionProbes`. Pre-existing replay behaviour and remaining FREEZE-6 copy are observations only.

## Why NOT_READY

Both BLOCKING findings are closed. But several fix claims do not hold (QRE-V1CPR-01, M12, SEC-V1CPI-10 on the S6 path, the named-hold check). The cycle introduced a regression on the S6 path (-02). The hold boundary still fails open on inconsistent restart inputs (-03), and D49 and C-2 fail on reachable routes (-04, -05).

The bounded cycle is spent. These close as explicit blockers (conditions C1 to C10) for the Chief to route to the next mission, not as another loop here.
