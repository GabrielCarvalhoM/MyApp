# R7-D public interface, version 7 (`R7D-INTERFACE-7`): delta to `R7D-INTERFACE-6`

Registered in Phase 3.5 (2026-11-07) with the Phase 3.5 addendum of `R7D-PREREG-6`. R7D-INTERFACE-7 is INTERFACE-1 with deltas 2 to 7; the newest delta prevails where they differ. It adds no length, count, percentage or threshold, and no input.

## 1. Training between separate breaks (adds to §1 of the version-6 delta)

**Adverse responses across sports hold a week in every sport, race weeks included.** Adverse responses that converge across sports hold the whole week, in every sport. This includes an adverse recovery on an optional session such as a shakeout, when another sport also reports one. Such a week re-enters neither sport, whether its runs are gated or are only the race touch, an optional shakeout and the race. One adverse session in one sport holds that sport's own gate only, as before.

## 2. Later decisions (adds to §2 of the version-6 delta)

**A newer report of the latest break** (its `episodeId`) may move that break's days. Planned sessions it uncovers between the breaks, with no report, are asked about first (`TRAINING_BETWEEN_BREAKS`), exactly as a first report with those dates would ask. The report it replaces is never read as days of the stop. The same newer report sent again changes nothing.

**Answering the start-time question** (`missingInputs: ['interruption.startedAt']`, `question.episodeId`). It is the same on every path:
- a first return;
- a newer report of the latest break;
- the check that follows a late report of training before a break.

**How to answer.** Report the named break again with its `episodeId` and its `startedAt`, every other fact as first reported:
- The coach reads it as that break's report. It is never a break of its own.
- In a return report or the week's review, a pending newer report of the latest break is applied in that same review.
- Sent with another kind of event, it is recorded, and the next return report or weekly review applies what is pending.

**What may follow.**
- After a late report, the coach may then ask the athlete to confirm the latest break again, before the return is read again, as it always has for a late fact.
- If the latest break is confirmed first, the start time is asked again until it is stated.
- A report of that break that changes any other fact is asked, as before (§2 of the version-6 delta).

## 3. The record

Unchanged. A restatement is recorded as a declared break, and the coach reads it as described above.
