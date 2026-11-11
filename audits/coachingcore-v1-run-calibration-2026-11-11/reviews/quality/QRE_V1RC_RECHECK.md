# QRE recheck of the V1RC fix cycle (commit 0098834)

**Verdict: READY_WITH_CONDITIONS** (QUALITY_READY_WITH_CONDITIONS). Nothing here needs to stop the freeze. The authoritative record is `QRE_V1RC_RECHECK.json`.

I am a fresh judge instance: I wrote neither the candidate, nor the fix cycle, nor the first review. I worked on the extract `v1rc-fix-0098834` in read-only mode. The first-round probes were copied and repointed, and every mutant went into my own copy. The host session injected CLAUDE.md and MEMORY.md (hashes are in the JSON). I judged only from the files and from what I ran.

## Baseline (measured)

| Check | Result |
|---|---|
| `node --test` | 1334 / 1334 |
| five `test/v1rc-*.test.mjs` | 75 / 75 |
| `scripts/v1rc-journeys.mjs` | 25 journeys, all identical to the frozen engine |
| `scripts/v1rc-fuzz.mjs` | 250 timelines, 1500 calibrations, 0 internal errors, 0 differences |
| `scripts/v1rc-freeze.mjs --preserved` | 198 / 198 |

## First-round findings

| Id | Status | Evidence |
|---|---|---|
| 01 | CLOSED_WITH_CONDITION | I tried 21 cases. Each one equals the frozen engine, or equals the engine under `withhold: ['MOVE']` exactly in the intended case. That held with the extension off, with a race or time trial naming the session, with refused, foreign, altered or late rows, with a test from another week, with a test naming an easy session or next week's session, with a test already on the record, and with caller `withhold` passed as an array or as a string. Residual: RC-01 |
| 02 | CLOSED | Backdated, replayed, offline, same-instant, 1 s earlier and no-reference cases all behave as claimed. ASK and CLINICAL record the declaration; HOLD records nothing. No conforming flow is wrongly refused. Test gap: RC-07 |
| 03 | CLOSED | A mid-week correction changes nothing in the week; it takes effect the next Monday |
| 04 | CLOSED | A 15 km result declared Wednesday opens nothing that week |
| 05 | CLOSED | Week 0 reads only what was on record before its first day; recency is counted from that day |
| 06 | CLOSED | No heart-rate zone from a maximum dated before a break or hold after return; supplied lab values follow the same floor |
| 07 | CLOSED_WITH_CONDITION | The glitched run is no longer an observation. The slow edge still rests on one run (SSCTR) |
| 08 | CLOSED | With the estimate boundary off, nothing estimate-derived is shown |
| 09 | CLOSED_WITH_CONDITION | Not changed. The integration must pass no options |
| 10 | CLOSED | With the extension off nothing is recorded, including a carried test row |
| 11, 12, 13 | CLOSED | Future anchors, reserved ids and junk carried rows behave as claimed |
| 14 | CLOSED_WITH_CONDITION | The fix cycle's additions are documented. The gaps left are listed in the JSON; RC-03 is the one that matters |
| 15 | CLOSED_WITH_CONDITION | 150,000 anchors work. RC-05 is the residual |
| 16 | CLOSED_WITH_CONDITION | 11 of the 12 first-round survivors are now killed. M06 survives and appears to be an equivalent mutant |

## Mutants

- **First-round survivors re-run (13, with M20 split into two):** 12 killed. M06 survives.
- **Fresh mutants on fix-cycle code (42):** 30 killed, 12 survive: F01, F03, F04, F07, F08, F09, F15, F21, F22, F37, F40, F42.
- **Survivors checked against the candidate:** my probes confirm the candidate behaves correctly for F01, F03, F07, F15 and F22. Run against the mutants, the same probes detect them.

## Regression of the fix cycle

- **Own differential:** 160 timelines, 2072 reviews, 0 differences in plans, decisions, proposals, ledger, reference state or restarts. Coverage includes missed sessions with tests, holds with readiness, breaks, the four event plans, and the extension both on and off.
- **Determinism:** holds across time zones, locale, a JSON round trip and key order. Reversing the record order changes only list order and the tie-break between equal maxima.
- **Hostile shapes:** 167 hostile-shape runs plus 360 invariant-checked reviews: no exception, no NaN, no inverted band, no broken clamp, no contradiction.

## New findings (all NON_BLOCKING)

- **RC-01:** the withhold is computed from the tentative record. So when a test declaration is refused as earlier than the record, the move is still withheld. This only happens when a client sends state from different versions, and the result is less load.
  - Reproduction: `r15-misc.mjs` rc01NoRef gives engine MOVE, extended KEEP.
- **RC-02:** a correction acts at once, outside the week fold. It lifts `warningSignScreen` and brings test offers back. It also restores, within the same week, a band that `TEST_ALREADY_DONE_THIS_WEEK` had removed. Routed to SSCTR.
- **RC-03:** the contract says the week "does not move inside the week" but does not name the immediate exceptions:
  - withdrawal;
  - the symptom flag;
  - `TEST_ALREADY_DONE_THIS_WEEK`;
  - corrections.

  It also omits the status `NOT_RAISED_BY_THIS_EXTENSION`.
- **RC-04:** a plan race logged with performance `UNDER` raises the warning-sign screen and ends test offers. Routed to SSCTR.
- **RC-05:** one argument spread is left at `selectReference` line 251. With many conflicting results, the calibration fails closed with `CALIBRATION_ERROR`.
- **RC-06:** when a review has no readable instant, its declarations are dropped without a named refusal.
- **RC-07:** the test gaps behind the 12 fresh survivors. Most important are F22 (a missing stop reason is read as a symptom) and F07 (a review is never recorded before the record's last instant).

## Freeze script

Unchanged since bc40218. It binds both new test files (once tracked) and the whole reviews folder. `--check` detects a changed added file or a changed FREEZE-1 file. Untracked files are invisible to it. I did not run it with `--write` or `--check`.

## Not verified

- `--write` and `--check` of the freeze script.
- Real data, devices or UI.
- Sporting values (SSCTR's).
- Whether M06 and F04 are truly equivalent mutants (reasoned, not proven).
