# R7-D public interface, version 5 (`R7D-INTERFACE-5`): delta to `R7D-INTERFACE-4`

`R7D-INTERFACE-5` is `INTERFACE_ONLY_R7D.md` (R7D-INTERFACE-1), read with `INTERFACE_DELTA_R7D_2.md`, `INTERFACE_DELTA_R7D_3.md`, `INTERFACE_DELTA_R7D_4.md` and then this delta. Where they differ, the newest file prevails. The case format (`R7D-CASE-1`, `CASE_SCHEMA_R7D.json`) and the structural checker do not change. This file describes only the public behaviour of the coach and the evaluation client; it does not describe how the coach is built.

## 1. Training between separate breaks (replaces the third bullet of "Separate breaks" in §1 of the version-4 delta)

Separate breaks stay two facts with their own identities, and their days are never added up. What counts as known training between them is now this:

- **Training between them re-enters the athlete only when a whole week of the plan between them was executed completely.** Every session that week plans falls after the earlier break's last day and before the later break's first day, every one was reported done as prescribed, and none had an adverse response (for example recovery adverse or next-day function impaired). That holds for both sports when the week plans both. The earlier break is then history, and the return is classed by the later break alone. It starts from what the athlete executed, including that week.
- **Training short of that is a fact of the stop, not a re-entry.** That covers one session of either sport, a partial or aborted session, several sessions in no whole week, and a week with a session missed, partial, conflicted or adverse. The stop runs through the earlier break as if nothing had been trained between them: from the first day of the earlier break to the last day of the later one. The return is the one that stop's length gives under the unchanged return classes. One isolated session is never taken as proof that the athlete's earlier capacity is restored.
- A week that a review closed (a review sent before the earlier break was declared) re-enters the athlete only by the same test: it must have been executed completely.
- Planned sessions between them **with no report at all** are still asked about first (`TRAINING_BETWEEN_BREAKS`), as before.

No length, count or threshold is added. The week is the plan's own week. The test is the one by which any executed week ever counts for the coach's history.

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
- When a return reads the stop through training (`TRAINING_NOT_REESTABLISHED`), tell the athlete in plain words that the earlier break still counts. When a week re-entered them (`TRAINING_AFTER`), say which week (`reentryWeek`). Add no number of your own.
