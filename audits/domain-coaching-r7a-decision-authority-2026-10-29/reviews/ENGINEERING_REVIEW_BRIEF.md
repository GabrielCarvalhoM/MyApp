# Engineering review brief — R7A-DECISION-AUTHORITY-FREEZE-1

**For:** an independent Quality and Reliability Engineering judge, in a new session. The author does not review.
**Bytes under review:** `CoachingCore/r7/decision-authority/RUNTIME_FREEZE_R7A_DECISION_AUTHORITY.json`.
- Source digest `3a7166b25aaf550f7692cc058f0e582b42e9eb7f74b9e361f23733b5e74ab244`; the manifest digest and the 85 bound files are in the record.
- It is committed on branch `claude/trusting-euler-04la8t`. The commit is named in [REVIEW_HANDOFF.md](../REVIEW_HANDOFF.md).
- Predecessor: STATE-MODEL-CONSUMER-FREEZE-1 (`adab3716…`), byte-exact in `../state-consumer-freeze-source/`.

**Read first:**
- [DECISION_AUTHORITY_CONTRACT.md](../DECISION_AUTHORITY_CONTRACT.md): the rules and the declared boundaries R1–R5;
- [TASK_CONTRACT.md](../TASK_CONTRACT.md);
- [PRE_FREEZE_REPORT.md](../PRE_FREEZE_REPORT.md);
- your predecessor's review, [quality-engineering-r7asc-review.md](../../domain-coaching-r7a-state-consumer-2026-10-29/reviews/quality-engineering-r7asc-review.md).

## Central question (Founder request §41)

Is there any material V1 path that still violates factual authority, coherent decision context or evidence-based progression authority?

## Mandatory attacks

1. **QE-R7ASC-01 (factual authority).** Re-run P01, P01 at 24 kg, and P01b from your own folder:
   - `QE_ROOT=CoachingCore` for the candidate;
   - `QE_ROOT=audits/domain-coaching-r7a-decision-authority-2026-10-29/state-consumer-freeze-source/CoachingCore` for the predecessor.

   Then attack the class:
   - an exercise history holds without a known load (FROM_LOG, unlogged, pending, unreadable);
   - a KNOWN row planned before a correction, retraction or conflict, with the correction arriving before the row was planned, after it, or with the closing review (EARLY, LATE, AFTER);
   - a target changed with no new fact (P1).

   The rule is A1 (`heldKnownLoad`) plus A3 (re-plan on a moved view). A4 is declared: an exposure executed before its correction arrived keeps D44.
2. **QE-R7ASC-04 (coherent decision context).** Re-run P07 (20 goal pairs). Attack:
   - a goal, event or schedule change at every weekday;
   - a goal change stated after the closing review;
   - no-op handlers in every order;
   - a return's own week, closed or not, followed by a no-op.

   The rule is B1–B3: one PLAN reading per decision, transitions under the entered week's context, E7 for a return's own week, and a re-plan of this week read under its own new context.
3. **QE-R7ASC-02 (progression without execution).** Re-run P02 and P02b on both trees.
   - Your P02b literal criterion still flags one cell (EASY, k=1, NOLONG). There the unreviewed cell prescribes less (40/40) than the reviewed one (45/40).
   - Your `runOf` history projection omits `easyExtra` and `devCount`, on which the two histories differ (E1/E3, your OBS-2 class).
   - No cell has its plan ahead of its own history: 0 of 44, against 31 of 44 on the predecessor (`probes/runs/candidate/BLOCKERS.json`, `presentByMechanism`). Judge whether that cell is QE-R7ASC-02.

   Then attack:
   - threshold, QUALITY and strides unlock;
   - the walk/jog ladder and the walk/jog exit to continuous running;
   - long runs after one or two unexecuted weeks, reviewed or not.
4. **QE-R7ASC-03 (gate order, temporal credit).** Re-run P05 and P05b. Attack:
   - each run of a RETURN or RESTART week missed in turn;
   - a run not yet due;
   - a second re-entry week;
   - gate-key collisions in strength (C3: the most restrictive verdict stands for every key).
5. **Equivalence classes:** start from `probes/r7ada-self-challenge.mjs` (228 cases, 0 violations; 160 on the predecessor) and go beyond it.

## Declared, for your ruling (not fixed in this mission)

- **R1, the standing projection between re-plans.** A decision that re-plans nothing keeps the stored rows, so a week projected over an unreviewed, unexecuted week stays until a re-plan. It is identical on the predecessor (self-challenge `declared.C4c`).
  - A general fix was measured: 29 of 663 approved tests encode the current rule (R6 "mid-week reviews never gate", E1/E3).
  - Is this a decision path that grants progression without execution, or the planner's projection between decisions? The Founder owns a change.
- **R2, a mid-week return holds its first week** (E7 with C3).
- **R3, plan and history after a return week:** E7 for the planner, C5 for history.

## Rules for the review

- Read only these bytes. Run probes with `node` v24.19.0 from your own folder, writing outputs there; never edit the author's files.
- `node CoachingCore/scripts/verify-r7ada.mjs --tests` proves the chain, read-only. `reviews-not-dispatched` fails by design once your review exists.
- The stop condition is finite (§43). Only a material violation of these blocks:
  - A. factual authority;
  - B. correction/retraction factual consistency;
  - C. coherent decision resolution;
  - D. temporal/evidence-based progression;
  - E. return ≤ factual tolerated dose.

  Anything else goes to the backlog.
- **Verdict line:** `R7A_DECISION_AUTHORITY_ENGINEERING_REVIEW = READY | NOT_READY`.
