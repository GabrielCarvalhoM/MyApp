# SEC-SR2-R2: narrow Security recheck of SEC-SR2-01 on the one focal cycle

**Judge:** Security, Privacy & Abuse Architect. This is the same independent instance as SEC_SR2_R1, not the author. **Date:** 2026-11-19. Synthetic athletes only.
**Verdict:** **PASS** (SECURITY_READY for the synthetic successor freeze, within this line's scope).
- SEC-SR2-01 is closed.
- Moving the statement opens nothing new.
- The QE-R7C-10 clocks of admitted corrections and merges are unchanged.
- The only clocks that change are those a never-admitted report had pulled earlier on 4e8cffe. They now stay later, which is the direction where more is asked.
- The non-blocking items from SEC_SR2_R1 carry over unchanged:
  - F1, F2 and F3 bind before real athletes;
  - O-1 is carried in SEC-CORE-03;
  - SEC-SR2-02 is carried in C-F01-2;
  - C-F01-2 and SEC-CORE-03 stay open.

## What was judged

| Input | Identity |
|---|---|
| Cycle commit / runtime | `f62bae3d91fb0797cdb1b0e33efafdf1e87638bf` / `36ea26a` (no `CoachingCore/src` change from 36ea26a to f62bae3) |
| `git diff 4e8cffe 36ea26a -- CoachingCore/src` | one statement moved in `src/r6-provenance.mjs`: `setFirstRecorded(o, firstRecorded(o, old, …))` moved from right after the chain check to the first line of `admit()` |
| `CoachingCore/src/r6-provenance.mjs` @f62bae3 | sha256 `d2439377dce49b6e70f3d2db2c84281e940a7afd9b476964dcc9a60cb075fb3a` |
| `CoachingCore/src/v1-f08.mjs` @f62bae3 | sha256 `f1065bf1e8c29a4019cf5f8f1c72e9f50f38a11796bf126d39c52a6470e27d37` (unchanged) |
| `CoachingCore/test/v1core-secr2-correction-integrity.test.mjs` @f62bae3 | sha256 `ffbbf43d8d2b16bab3d83a62597fedf211d83fcac1354177609c8a19f52ab489` |
| Judge probes (new scratch `sec-sr2-r2-m8w3/probes/`; `git archive` extracts of 4e8cffe and 36ea26a `CoachingCore/src`) | `firstrec.mjs` `3f83b46f…`, `judge-firstrec-engine.test.mjs` `07340466…`, `fuzz.mjs` `07612433…`, `sb1.mjs` `52b1a885…`, `clockdiff.mjs` `ddce8c8b…`, `clockdiff3.mjs` `a2892aa8…` |

No commits, no verify scripts, no checkout/reset/stash, no deletion. This file is the only thing written in the repository.

## SEC-SR2-01: closed

- **Normalizer** (`firstrec.mjs` on 36ea26a): Y keeps `2026-11-06T20:00Z`, both when carried and in one batch. X is in force. The report is still a replay, as with the plain report. On 4e8cffe the same probe gives `2026-11-01T20:00Z`.
- **Engine** (`judge-firstrec-engine.test.mjs`, `V1CP_ROOT` = this worktree; the QRE-V1CP-04 shape): control **ASK**, crafted **ASK** (was KEEP on 4e8cffe). The adverse row's clock is its own arrival (`2026-11-27T10:00Z`), not the older row's (`2026-11-22T23:00Z`).
- **Author evidence, consistent with the above:**
  - the two SEC-SR2-01 tests fail on 4e8cffe (`evidence/red-cycle-on-4e8cffe.txt`);
  - M9 (the clock moved back before admission) is killed (`evidence/mutation-cycle1.txt`, 13/13).

## The move opens nothing new

**By construction.** The moved statement reads `o`'s own clock, `old`, `quarantined.has(identity)` and the `accepted` rows on the identity.
- Between the old and new positions, every path that changes `quarantined` or `accepted` ends in `continue`: the event-id, activity and duplicate-conflict checks.
- Nothing there reads or writes `o`'s clock except the replay branch.

So for every admitted correction the statement gets the same inputs and gives the same clock: accepted, merged into the row in force after admission, or resolving a conflict. Only the replay branch and the refusals see a different clock on `o`. A refused `o` never enters the record.

**Clock differential**, 4e8cffe vs 36ea26a:
- `recordArrival: true`, `incoming: true`, the same prior fed to both;
- seeds 31 and 4242, 4000 cases each, monotone and random arrival, 47,697 passes;
- about 19,800 admitted corrections, about 7,100 merges and about 2,450 replays of corrections into a row of the same execution in the measured passes.

Results:
- **47,287 passes are byte-identical.**
- Every other pass differs **only in `firstRecordedAt`**, and only when the pass holds a correction read as `EXACT_REPLAY`.
- The changed rows are either that replay's target (391) or a correction admitted later in the pass that corrects that target and inherits its clock (40).
- **In all 431 cases the new clock is later than 4e8cffe's; none is earlier.**
- Of the changed passes, 1 is a replay into a row of the same session, not another session. In that case the session's chain (M2 replaced by C) was first held at 01:00, C was evicted by F1 in the same pass, and the row in force is a plain report first held at 03:00. 4e8cffe gave that row 01:00; 36ea26a gives it its own 03:00.

That one case is not a regression:
- 03:00 is when the record first held that row's facts.
- A later clock can only make `unreadRunReports` (QE-R7C-10) and `adverseIn` treat a report as not yet read, so more is asked.
- It is reachable only together with F1, which already binds before real athletes.

## Regression checks on the cycle runtime

- **SEC-R2-03 invariants** (`fuzz.mjs`, seed 777, monotone and random arrival): the same as on 4e8cffe.
  - 0 orphans, 0 self-replacements, 0 second rows in force, 0 lost rows under monotone arrival.
  - 0 broken refusal no-ops in 753 checks, deterministic.
  - Random arrival loses 59 rows, the same F1 set as 4e8cffe.
- **`sb1.mjs`** (F1, F2, F3, O-1 and the f08 edge shapes): output byte-identical between 4e8cffe and 36ea26a. These findings are neither fixed nor worsened.
- **`v1core-freeze-4.mjs --preserved`:**
  - the freezes are as before: FREEZE-3 23/24, FREEZE-1 196/198, the others at their base bytes;
  - "nothing else changed since a6e10d0";
  - it names one untracked file, `reviews/ssctr/SSCTR_SR2_R2.md`, another judge's review written during this recheck. That is expected and not a runtime change.
- **Directed tests in the worktree:**
  - `v1core-secr2-correction-integrity.test.mjs`: **24/24** pass.
  - Together with the QE-R7C-10 clock tests (`r7c-phase7`, `v1core-successor-fix-forward`, `r7d-phase31`): **57/57** pass.

## Conditions

None for this mission. Carried unchanged from SEC_SR2_R1, all non-blocking here:
- **F1, F2 and F3** bind before real athletes (owners as stated there).
- **O-1** is carried in SEC-CORE-03.
- **SEC-SR2-02** is carried in C-F01-2.
- **C-F01-2 and SEC-CORE-03** stay open and bind before a real-athlete restart.

SEC-R2-03 and SEC-R2-04 are **CLOSED** for the synthetic successor freeze on `36ea26a` (records `f62bae3`).
