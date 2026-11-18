# CORE-C2-F01 restart sizing fix: final report

**State: CLOSED, freeze emitted.** The freeze is **COACHINGCORE-V1-CORE-SAFETY-FREEZE-2** (`CoachingCore/v1/RUNTIME_FREEZE_V1CORE_2.json`):
- it binds 15 files at `00e922a`, with filesDigest `8f32feae…`;
- the candidate is `576e40c`;
- `node CoachingCore/scripts/v1core-freeze-2.mjs --check` gives 15/15.

It is additive. FREEZE-1 and the five earlier records are the bytes of `d92aa88`, and FREEZE-1's 47 bound files are unchanged (47/47).

**Line:** branch `claude/v1-core-c2-f01`, from `d92aa88`:
`576e40c` candidate → `f46ee7c` record → `be2ea69` reviews → `00e922a` cycle 1 → `6491ac2` freeze → this report.
**Nothing pushed or merged.**

## 1. The fix

There is one runtime change, in `CoachingCore/src/v1-f08.mjs` (`restartIntake`):
- a row a correction replaced (`superseded:true`) is no longer an execution, for C-Q08-1, the pause or `trainedAfter`;
- in the 28-day window, an event held twice counts once.

The replaced rows stay in the returned record. No dose table, progression, periodization or calibration changed.

| Scenario | Before | After = in-force control |
|---|---|---|
| Closure-2 probe (runner rw-16) | easy runs 60/60/60, long run 100 | 50/50/50, long run 100 |
| AIF athlete, 12 runs corrected | record 292 min/week, stated 200 not bounded; runs 40/40/40, long run 80 | record 146; runs 25/25/25, long run 60 |

The cause: the replaced rows were counted a second time.

## 2. Tests and regression

- **New tests:** 21 in `v1core-c2f01-restart-sizing.test.mjs`. They cover the 12 mission cases, QRE-F01-01 and -04, and the SSCTR addendum. The 18 original tests were 14 RED / 18 GREEN; the three added in the cycle are RED on `d92aa88` too. `v1core-c2f01-freeze.test.mjs` is the successor of closure-2's preservation test.
- **Full suite on `576e40c`:** 1709 / 1685 / 24.
  - 23 of the failures are closure-2's ledgered historical tests.
  - The 24th is `v1core-freeze.test.mjs:11`, by design: its base is `16577b6`. Its successor passes (`F01_SUCCESSOR_LEDGER.json`).
  - The cycle changed no runtime.
- **J5/P16:** byte-identical.
- **`core.json`:** the eight earlier journeys are identical. `restart-f01` and its control are added.
- **`vm-check`:** ok, with JIT and with `--jitless`.
- **Bench:** review ×1.009; restart from a corrected record +1.4 ms (×1.047); record ×1.000. Not material.

## 3. Reviews (`reviews/`)

- **QRE_F01_R1: READY_WITH_CONDITIONS.** C1–C4 were met in cycle 1 without a runtime change (`CYCLE1.md`). C5, the iOS revalidation, is carried.
- **SSCTR_F01_R1 + ADDENDUM: ACCEPT_WITH_CONDITIONS.** CORE-C2-F01 and C2-C1 are closed for synthetic use and for the integration gate.
- **Security:** not requested. The change adds no input, trust rule, custody or authorship, so the mission's "only if material" applies. SSCTR routes C-F01-1 r2 (ii) to Security because SB-1 is theirs.
- **Correction cycle:** the one allowed was used, with no runtime change.

## 4. Still open

- **C-F01-1 r2 (SSCTR).** It binds before any real-athlete use of `restartProgram` and is an open blocker in the integration readiness report. It covers two cases:
  - A record that holds execution reports but none in force (all corrected to "not done", or a correction that conflicts with the watch). The C-Q08-1 gate (`rows.some(executed)`) does not apply, so the stated exposure is unbounded. `d92aa88` bounded it only through the replaced row.
  - A disputed amount, read as no session for the pause, `trainedAfter` and the SB-1 question after readiness.

  Both predate this line for direct conflicts. They are pinned by tests labelled "open". Owner: the next Core mission, then SSCTR and Security.
- **C-F01-2.** The restart receives the record exactly as the engine returned it. QRE and Security decide whether a self-contradicting record should HOLD. Three residuals sit under it, each at or below `d92aa88`:
  - QRE-F01-02: order dependence on a reused `eventId`;
  - QRE-F01-03: an unmarked original or a stale part copy;
  - R-F01-2: an `eventId` shared between sports.
- **C-F01-3:** re-read with SEC-CORE-03 and C2-C2.
- **Carried from FREEZE-1, unchanged:** C2-C2, C2-C3, C-C3/4/5, A-C1/2/3/5, D-C1/D-C2, C-INT, SEC-CORE-03/06/07/10/16, and Founder D1, SEC-CORE-08, G07/SEC-CORE-09, D2.
- **Queue items, proposed and not appended:** HQ-CORE-F01-SSCTR-A and HQ-CORE-F01-SSCTR-B.
- **IOS_REVALIDATION_PENDING:** the Mac run in `audits/v1-core-safety-lifecycle-2026-11-18/mac/README.md` §8. The Swift was not compiled, and there is no approval on the iPhone without a physical measurement.

## 5. Next minimal step

1. The Founder authorizes the push of `claude/v1-core-c2-f01`.
2. The Mac/iPhone run, README §2–§3 and §8.
3. Before any real-athlete restart: a narrow Core mission for C-F01-1 r2, with SSCTR and Security review.
