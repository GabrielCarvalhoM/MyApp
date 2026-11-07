# R7-D public interface, version 6 (`R7D-INTERFACE-6`): delta to `R7D-INTERFACE-5`

`R7D-INTERFACE-6` is `INTERFACE_ONLY_R7D.md` (R7D-INTERFACE-1), read with `INTERFACE_DELTA_R7D_2.md` to `INTERFACE_DELTA_R7D_5.md` and then this delta. Where they differ, the newest file prevails. The case format (`R7D-CASE-1`, `CASE_SCHEMA_R7D.json`) and the structural checker do not change. This file describes only the public behaviour of the coach and the evaluation client; it does not describe how the coach is built.

## 1. Training between separate breaks (replaces §1 of the version-5 delta)

Separate breaks stay two facts with their own identities, and their days are never added up. The training between them is read by whole weeks of the plan, **per sport**.

**A week counts for a sport** when it lies wholly between the two breaks and the athlete did, as prescribed, every session of that sport the coach counts, with no adverse or conflicting response (recovery adverse, next-day function impaired):

| Session | Counts for the week |
|---|---|
| Easy runs, long runs, quality sessions, walk/jog steps | yes |
| The race touch and the race of a race week | yes: done and finished |
| Every strength exercise | yes, logged with reps, reps in reserve and a load in a known unit |
| Optional brisk walks, recovery runs, shakeouts, optional strides | **no**: done or not, they never decide a week |

A sport counts a week only through a week that holds at least one of its counted sessions. A session on the later break's first day counts as between when that break states its start time and the session was reported done before it; otherwise its week does not count.

Then:
- **A week that counts in every sport it plans re-enters the athlete** (unchanged): the earlier break is history (`TRAINING_AFTER`, with `reentryWeek`) and the return is classed by the later break alone, from what was executed.
- **A week that counts in one sport only** (new): those weeks are training, never days of the stop. The earlier break is read as **its own return**, as if it had been applied the day after it ended (`OWN_RETURN`): its class from its own days, the unchanged return recipe, no current demonstration. The later break is classed by its own days.
  - The sport that has its own counting week resumes what it executed there.
  - The other sport continues from the earlier break's own return, and gets no step it did not earn. A missing strength log or a missed lift holds strength only, never running.
- **Training in no counting week** (one session of either sport, a partial or aborted session, sessions in no whole week, weeks with both sports short) is a fact of the stop, as before: the stop runs through the earlier break (`TRAINING_NOT_REESTABLISHED`). One isolated session is never taken as proof that capacity is restored, and it never shortens a long stop.
  - Weeks with **both** sports short are read the same way, so they can still make the stop long enough for the long-break return. That is a disclosed residual: no authorized adherence criterion separates them from isolated training.
- If a return was already applied between the two breaks, the earlier break is never read as its own return across it; the existing questions stand.
- Planned sessions between them with no report at all are still asked about first (`TRAINING_BETWEEN_BREAKS`).

No length, count, percentage or threshold is added.

## 2. Later decisions (new)

- **A newer report of the latest break** (its `episodeId`), after a return that read separate breaks, reads those breaks again as that return did, with the newer report's own facts. A correction never drops an earlier break.
- **A later review** after such a return is not asked to confirm the break again because of it. A genuine late fact about the training before the break (a correction, a report that arrives late) is still asked, as before.
- **A return reported in the middle of its week** plans the weeks after it from the runs the athlete completed. Sessions of that week dated before the report that were not done, or that fell inside the break, never count as done for the longest-run limit.

## 3. Clinical-cause breaks (replaces the "one exception" of §1 of the version-4 delta; PCG-R7D-F08-r1, R-F08-1)

- **A break reported with a clinical reason stays clinical for its whole episode.** A later report that names it may still correct its dates, length, start time and text, and it is recorded as the athlete's statement. Its restated nonclinical reason never ends the clinical route, never opens a nonclinical return and never sets a return class. This holds before, during and after a clinical route, and after a qualified clearance.
- A mistaken clinical entry therefore holds the athlete until a qualified human can resolve it. That is a disclosed residual: the coach has no input for a qualified clearance.
- **F08 is unchanged and open:** the coach plans no return after a clinical cause. A qualified clearance in an evaluation case (`clearance:'QUALIFIED_CLEARANCE'`) still drops only the continuation state; it is an evaluation convention, never a product mechanism.

## 4. The record (adds to §2 of the version-5 delta)

In `separateBreaks`, `stop` is one of `LATEST`, `OVERLAPS`, `TOUCHES`, `NO_TRAINING_BETWEEN`, `TRAINING_NOT_REESTABLISHED`, `TRAINING_AFTER` (with `reentryWeek`), and now:
- `OWN_RETURN`: the earlier break read as its own return. `ownReturn` gives its `class`, `days`, `startDate`, `endDate`, `returnDay` (the day after it ended) and `reentered` per sport (`RUN`, `STRENGTH`: the first day of that sport's counting week, or null);
- `WITHIN_OWN_RETURN`: a break before an `OWN_RETURN` one, read inside that own return's stop. `ownReturnOf` names it and `stopInOwnReturn` gives its place there.

A clinical route that comes from an episode's earlier clinical report carries `episode` (`episodeId`, `clinicalReportedOn`, `restatedNonclinical`).

## 5. What a client does (adds to §3 of the version-5 delta)

- Report every planned session between two breaks, done or not done. A re-entry, and an own return, are read from whole weeks, per sport.
- Present `OWN_RETURN` in plain words: the earlier break counts as its own break, and the weeks after it count as training. Say which sport resumed what it executed and which continues its return. Never present it as restored fitness. Add no number of your own.
- Never offer "change the reason" or "start a new plan" as a way out of a clinical route. Never drop the clinical continuation state, and never show the stale plan under it.
