# SEC-R2-R2: narrow Security recheck of the C-F01-1 r2 focal cycle

**Judge:** Security, Privacy & Abuse Architect (the same independent instance as SEC_R2_R1; not the author). **Date:** 2026-11-18.
**Verdict:** **PASS_WITH_CONDITIONS**. SEC-R2-02 is closed. SEC-R2-01 is closed for the two shapes it was raised on. One narrower variant remains (SEC-R2-04). It does not block the synthetic successor freeze, and it binds before a real-athlete restart.

## What was judged

| Input | Identity |
|---|---|
| Runtime | `37c0f6f2927e6e4ad68d18dd5ff6bad995d318bf` (no `CoachingCore/src` change through records `2819e6a17c3af9bd3149e13b1dc45cd93202450e`) |
| `CoachingCore/src/v1-f08.mjs` @37c0f6f | sha256 `a3ca21ae3f645ad74b6c13bfa26d2d8fdb1c90d82e85a011988271a520b5cc10` |
| `git diff 3f0b04f 37c0f6f -- CoachingCore/src` | sha256 `b2d72875b347e8c210f97b47a22a44564306b4e8f13313353cd3559e5a5caade` |
| `CoachingCore/test/v1core-cf011r2-restart-evidence.test.mjs` @37c0f6f | sha256 `6844a9c2e5e3591750ec2414c5e682e994760d07d21e2541e27ff09ed18e035a` (36/36 pass, run once) |
| `CYCLE1.md` / `DECISION.md` | sha256 `5278bc47…2644b` / `f1184e0a…2924` |
| Probe (scratch) | `sec-r2-probe-7f3a/probe3.mjs` sha256 `b60c8cdb…a30a` |

No commits and no verify scripts. Nothing outside this file was written in the repository.

## Results

| Question | Result |
|---|---|
| **SEC-R2-01 closed?** | **Closed for session-bound rows and activity-bound rows.** These are the eventId collision and the activity rebinding, the two cases written through the normalizer; tests SEC-R2-01 and D9 are now inverted. The controls hold: a legitimate "not done" lets the declaration answer, and a chain of corrections is history. **Not closed for rows with neither a `sessionId` nor an activity id** (SEC-R2-04). |
| **SEC-R2-02 closed?** | **Closed.** `wellFormed` applies to each voice the same checks `validPart` applies to `actual`: a boolean completion, and finite, non-negative measures. `claimsDone` still hears every voice, which can only add a question. |
| **New bypass?** | None. `claimsDoneIn` is read only by `trainedAfter`, so it can only remove `readinessDeclared`, which means asking more. To hide an orphan, an attacker has to forge its replacement row, and that is the same power as forging a "not done" correction (custody, SEC-CORE-03). |
| **Admits anything for dose?** | No. `executed`, `once`, the bound and its amount are unchanged. `occurred` is stricter. No dose reader reads orphaned rows. |

## Condition

**SEC-R2-04 (NOT BLOCKING for the synthetic successor freeze; BINDING before a real-athlete restart; owner: the next Core mission, together with SEC-R2-03)**

*The gap.* When the orphan has no `sessionId`, `replacedBy` compares `activityOf(r) === activityOf(o)`. For a manual row with no activity id this is `null === null`, which is true for any row whose `eventId` equals `supersededBy`.

*Reproduction.* `probe3.mjs`, through the normalizer:
- Two manual rows with no session: Y is before the declaration, X after it.
- X's correction reuses Y's id, and the normalizer excludes it (`EVENT_ID_REUSED_WITH_DIFFERENT_FACTS`).
- X stays `superseded` with `supersededBy: "Y"`.
- The restart returns `readinessDeclared: true`, so the reason is not screened.

*Minimal rule.* Treat the orphan as replaced only when both rows have the same non-null `sessionId`, or the same non-null activity id, or the same normalizer identity (`provider@observedAt`). Otherwise it keeps its voice. Alternatively, closing SEC-R2-03 in the normalizer removes the cause.

*Closing evidence.* The probe3 shape, written through the normalizer, gives ASK through `restartProgram`, and the existing controls stay green.

C-F01-2 custody and SEC-CORE-03 stay open and bind before a real-athlete restart, unchanged.
