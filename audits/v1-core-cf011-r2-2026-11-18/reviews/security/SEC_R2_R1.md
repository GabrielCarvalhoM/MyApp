# SEC-R2-R1: Security / Privacy / Abuse review of C-F01-1 r2 (SB-1, execution provenance)

**Judge:** Security, Privacy & Abuse Architect (independent instance, not the author). **Date:** 2026-11-18.
**Verdict:** **PASS_WITH_CONDITIONS**. One condition (SEC-R2-01) blocks the successor freeze.

## What was judged

| Input | Identity |
|---|---|
| Candidate | `3f0b04f780708299131289f8f84da482c39dddcc` |
| Base (FREEZE-2 line) | `4b6e1ea580171177754e7e66108f31551470aa79` |
| Records | `7dc0ee5b642143236c2376ea0881c7b0b390840c` |
| `CoachingCore/src/v1-f08.mjs` @3f0b04f | sha256 `41cdbb3d85e7efc12197c3b073998dc9fde1f6932b9054f8f3122aec7e5abb55` |
| `CoachingCore/src/v1-f08.mjs` @4b6e1ea | sha256 `a06c580c2d4f9c64287af3105c4cb471913b66cbd38605c0b7d24cc5bdd4d68b` |
| Runtime diff (`git diff 4b6e1ea 3f0b04f -- CoachingCore/src/v1-f08.mjs`) | sha256 `82664512d274f1434200ba8862e409fb634c53b146e46bbc97038fd91a27443d` |
| `CoachingCore/src/r6-provenance.mjs` (unchanged) | sha256 `d701d1208b10fed1836891bf82f432442ab5620228376410b65290b1a58af00d` |
| `CoachingCore/src/r6-intake.mjs` (consumer of `readinessDeclared`, unchanged) | sha256 `aa35e295e1b58031daeb27e039bf32e8e7f7c29dc37df6f8023483bd39ecbb09` |
| `CoachingCore/test/v1core-cf011r2-restart-evidence.test.mjs` | sha256 `a74adc52a34aff8eedbb2788b0cfd47ee80d08baf818765dbb1c0fbef42e2bc2` (31/31 pass, run once in the worktree) |
| `DECISION.md` / `CANDIDATE.md` | sha256 `cc58a76a…1c0854` / `4edc59ff…a3247e` |
| Probes (scratch, outside the repo) | `sec-r2-probe-7f3a/probe.mjs` `7b7b5cb5…0c4f9c`, `probe2.mjs` `f6ab81c6…d119` |

No `npm run verify` and no `verify-r*` script was run. No runtime, test, queue or canon file was edited.

## Items

| # | Item | Result | Basis |
|---|---|---|---|
| 1 | SB-1 trigger (`claimsDone`, `else if(readiness)`) | **PASS** | `claimsDone` ⊇ `executed`, and it is read only by `trainedAfter`. It can only remove `readinessDeclared`, and the intake then screens a stated reason or asks (`r6-intake.mjs:217`). `facts.restart` (MODERATE floor, restrictions, sports not ready) still comes from the declaration whatever `trainedAfter` says, so asking more never drops a restriction. The `else if` fix closes the `weeks:0` stand-in (D3-D4, D6 e2e ASK). A row with nothing in force behind it is covered under item 6. |
| 2 | Trust in "the execution happened" | **PASS** | Probe: a forged `CORRECTION_CONFLICTS…` row with two "done" parts gives the same pause and last day as a forged plain execution. Its amount is 0 (900 forged minutes counted nothing), so the bound only falls. A row that contradicts itself (row not done, parts done), a single part, parts that are not objects, an array of parts, `fact` set, `superseded`, or another kind of conflict is read as no occurrence. Foreign rows and rows dated after the restart still HOLD. Parts that are not well formed (no `completed` boolean, `minutes:"5"`) are still counted as voices. That gives no more than a plain forged row gives, so it is hardening only (SEC-R2-02). No screen is bypassed beyond what a plain row already allows. |
| 3 | Temporal facts vs amount | **PASS** | When a session took place (`occurred`) sets the pause and the last day. How much was done (`executed`, `once`) sets the bound. Any report in the window only opens the bound, and the bound only lowers. `factsFromLedger` reads no conflicted row (B3). |
| 4 | Clinical and HOLD paths | **PASS** | The diff hunks start after the CLINICAL_HUMAN_REQUIRED return. The HOLD and clinical lines are byte-identical and run first (D8). |
| 5 | Persistence | **PASS** | JSON restore (A3, B), a carried re-normalization (B persistence) and an A→B→C chain (D7) pass. `provenance.parts`, `conflicted` and `superseded` survive a carried normalization. If parts are stripped from an `incoming` re-send, `claimsDone` still reads `actual`, so SB-1 is still asked. |
| 6 | Residual D9 | **FAIL as stated: fix here** | The premise "only custody can produce it" is false. The engine's own normalizer writes an orphaned `superseded` mark. `retire()` runs before two later rejections of the same correction: `EVENT_ID_REUSED_WITH_DIFFERENT_FACTS` (the correction's `eventId` collides with another event) and `ACTIVITY_BOUND_TO_TWO_SESSIONS` (the correction carries another session's activity). The correction is excluded, and the original stays `superseded` with nothing in force. This persists through a later review. In the probe the athlete trained 5 days after the declaration, and the restart returned `readinessDeclared:true`, so the reason was not screened. This was already reachable on FREEZE-2. |

## Conditions

**SEC-R2-01 (BLOCKING before the successor freeze; owner: the C-F01-1 r2 author, in `restartIntake` only; one focal cycle)**

*Minimal rule.* For SB-1 only (`claimsDone` / `trainedAfter`), a row marked `superseded` counts as a voice unless the record holds the row that replaced it. That row must have `eventId === supersededBy` and the same normalizer identity: `sessionId`, else the activity id. The rule does not change `executed`, `occurred` or the bound.

*Closing evidence:*
- New tests in which the engine writes the record through `normalizeObservations`, for (a) the eventId collision and (b) the activity rebinding, after a declaration. Each must give `readinessDeclared` absent and, through `restartProgram`, ASK.
- D9 inverted: the forged orphan also asks.
- D2 unchanged: a legitimate "not done" correction still lets the declaration answer.
- D1-D8 and the existing suites still green.

The probe in `probe2.mjs` already shows this rule gives (a) true, (b) true and the legitimate "not done" correction false.

**SEC-R2-03 (NOT BLOCKING; owner: QRE; routed)**

*Root cause.* The normalizer retires the original before a correction is accepted. It should reject a correction's eventId collision or activity rebinding before `retire()`, so that no orphan is written. Until then every V1 reader that drops superseded rows also hides that session, which affects dose as well, for QRE and SSCTR to weigh.

*Closing evidence:* a normalizer test showing that the rejected correction leaves the original in force.

**SEC-R2-02 (NOT BLOCKING; hardening; owner: author or QRE)**

`occurred` should count a part only if it passes the normalizer's `validPart`. Same SEC-CORE-14 rule.

*Closing evidence:* B7 extended with malformed parts, each read as no occurrence.

**Observation (no condition; already present on FREEZE-2).** `trainedAfter` reads `observedAt`, while the pause reads `localDate`. A row with no `observedAt`, or with `observedAt` before the declaration but a later `localDate`, keeps `readinessDeclared`. The engine always writes these two fields consistently, so this falls under C-F01-2 custody, together with SEC-CORE-03 (who authored a correction is not checked).

**Unchanged residuals.** C-F01-2 custody (the restart must receive the record exactly as the engine returned it) and SEC-CORE-03 stay open and bind before a real-athlete restart.
