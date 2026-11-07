# R7-D public interface, version 5 (`R7D-INTERFACE-5`): delta to `R7D-INTERFACE-4`

`R7D-INTERFACE-5` is `INTERFACE_ONLY_R7D.md` (R7D-INTERFACE-1), read with `INTERFACE_DELTA_R7D_2.md`, `INTERFACE_DELTA_R7D_3.md`, `INTERFACE_DELTA_R7D_4.md` and then this delta. Where they differ, the newest file prevails. The case format (`R7D-CASE-1`, `CASE_SCHEMA_R7D.json`) and the structural checker do not change. This file describes only the public behaviour of the coach and the evaluation client; it does not describe how the coach is built.

## 1. Training between separate breaks (replaces the third bullet of "Separate breaks" in §1 of the version-4 delta)

Separate breaks stay two facts with their own identities, and their days are never added up. What counts as known training between them is now this:

- **Training between them re-enters the athlete only when a whole week of the plan between them was executed completely.** Every session that week plans falls after the earlier break's last day and before the later break's first day. Every session the coach's weekly review checks was reported done as prescribed, with reps and reps in reserve logged for every strength exercise, and none had an adverse response (for example recovery adverse or next-day function impaired). That holds for both sports when the week plans both. The earlier break is then history, and the return is classed by the later break alone. It starts from what the athlete executed, including that week.
  - **Open before any holdout** (QE-R7D-P33-01, R7D-PREREG-5 Δ9): the coach's check reads the runs of its gated roles and every strength exercise. It does not read optional walks, recovery runs, shakeouts, race touches or races. Which sessions a re-entry week needs will be settled, and this text with it, before any final holdout is written.
- **Training short of that is a fact of the stop, not a re-entry.** That covers one session of either sport, a partial or aborted session, several sessions in no whole week, and a week with a session missed, partial, conflicted or adverse. The stop runs through the earlier break as if nothing had been trained between them: from the first day of the earlier break to the last day of the later one. The return is the one that stop's length gives under the unchanged return classes. One isolated session is never taken as proof that the athlete's earlier capacity is restored.
  - Because the stop then runs from the first day of the earlier break, the training days between are counted in its length. Weeks of training that never complete a plan week can therefore make the stop long enough for the long-break return, a restart. That is a disclosed residual (SSCTR-P33-F01, R7D-PREREG-5 Δ7). A single break reported late already ignores the training after it.
- A week that a review closed (a review sent before the earlier break was declared) re-enters the athlete only by the same test: it must have been executed completely.
- Planned sessions between them **with no report at all** are still asked about first (`TRAINING_BETWEEN_BREAKS`), as before.

No length, count or threshold is added. The week is the plan's own week. The test is the coach's existing rule by which an executed week that no review closed releases a step (a week a review closed counts here only by the same test).

Clinical first, the relation question and F08 are unchanged.

## 2. The record (adds to §2 of the version-4 delta)

In `separateBreaks`, `stop` is now one of:
- `LATEST`, `OVERLAPS`, `TOUCHES`: unchanged;
- `NO_TRAINING_BETWEEN`: the days between are known to have no training (every planned session there reported not done, or none planned), so the stop runs through them;
- `TRAINING_NOT_REESTABLISHED` (new): training is recorded between them, but it completed no whole week of the plan, so the stop runs through them;
- `TRAINING_AFTER`: a whole week of the plan executed completely after it re-entered the athlete, so it is history. The entry also gives `reentryWeek`, the first day of that week.

## 3. What a client does (adds to §3 of the version-4 delta)

- Report every planned session between two breaks, done or not done. A re-entry is read from whole weeks only.
- Never present one session, or a few, as proof that the athlete has resumed.
- When a return reads the stop through training (`TRAINING_NOT_REESTABLISHED`), tell the athlete in plain words that the earlier break still counts. When a week re-entered them (`TRAINING_AFTER`), say which week (`reentryWeek`), as "training resumed at the doses you executed", never as restored fitness. Add no number of your own. With three or more breaks, read `reentryWeek` as "after the latest earlier break" (QE-R7D-P33-04).
- Let the week's review apply a declared break. Never leave one unapplied across weeks of training. After a bulk sync of past weeks, send the plain review that applies kept breaks before adding a newer break.
- Invite the athlete to state a break when it happens, not weeks later.
- Capture reps and reps in reserve for every strength exercise. Without them a whole week never re-enters the athlete, for running too.
- A newer break with a stated start time on a day the athlete trained may keep that day's week from counting as a re-entry week (QE-R7D-P33-02).
