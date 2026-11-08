# R7-D public interface, version 8 (`R7D-INTERFACE-8`): delta to `R7D-INTERFACE-7`

Registered in Phase 5 (2026-11-08) with `R7D-PREREG-8`. `R7D-INTERFACE-8` is `INTERFACE_ONLY_R7D.md` (R7D-INTERFACE-1) read with `INTERFACE_DELTA_R7D_2.md` to `INTERFACE_DELTA_R7D_7.md` and then this delta; the newest file prevails where they differ. It describes the plan as an athlete sees it, how to write facts that the evaluation client can deliver, and what the evaluation adds. It describes no implementation, gives no runtime output and adds no input to the coach.

## 1. Fields and forms (completes interface 1)

- A `RETURN_AFTER_PAUSE`, a weekly review's `interruption` and an `answer.declareBreak` take, besides the fields of interface 1, `episodeId` (deltas 3 to 7) and `startedAt`: a timestamp with its offset, the time the break began on its first day (deltas 6 and 7).
- The `answer` shorthand (interface 1 §7) also answers `TRAINING_BETWEEN_BREAKS`: `report` goes to every session that question lists, `overrides` to the sessions they reference.

## 2. Referring to sessions in a plan a decision re-planned

The client resolves every reference against the plan in force at that step. Every decision whose proposal is adopted can change the days, roles and exercises of the weeks it plans: a return (from its own week when two or more sessions of that week are still ahead, otherwise from the next week), a schedule, equipment or goal change, a substitution, and every review that plans the next week.

- **In a week an adopted decision may have re-planned, refer to a session by sport and role, without a day:** `{week, sport, role}` names the first live session of that role in that week; `role` may be a preference list. Give a `day` only where the athlete's own chosen days fix it in a week no adopted decision has re-planned (before any return, for example).
- **Use the bulk form for every session the coach composes** (the race touch, a shakeout, optional walks, recovery runs) and whenever you are not sure a session exists: `{each:{weeks, sport, roles?}, ...fact}` expands to the live sessions the plan in force holds, and to nothing for a role it does not hold. A single reference that matches no session is a corpus error; the bulk form never is.
- **A substitution may name its exercise by pattern only:** `substitution.exerciseRef:{week, pattern}`, with no day, names the first live strength session of that week, in day order, that holds an exercise of that pattern. With a day, the exercise must be in that day's session.
- `targetRef` follows the same rule as a fact's `ref`.
- You never need the coach's session ids.

## 3. Strength reports and loads

- `asPrescribed:true` on a strength session reports every planned set at its planned repetitions and reps in reserve. Its load:
  - a `KNOWN` row: the load as prescribed;
  - a bodyweight, band or assistance row: no kilogram, and none is needed (its repetitions and reserve are its evidence);
  - an `ESTABLISH` or `FROM_LOG` row: the load the athlete chose, which only you can state, with `loadsByPattern` (kilograms in that row's own convention) or explicit `exercises`. Without it that exercise's load is unknown.
- **A strength week counts as executed in full** (a re-entry week between two breaks, a whole week of the plan in every sport) only when every exercise is logged with repetitions, reps in reserve and, for a loaded exercise, a load in a known unit (delta 6 §1). Report such a week with `asPrescribed:true` and a `loadsByPattern` that covers every loaded pattern the athlete's sessions can hold (for example `{SQUAT, HINGE, LUNGE, CALF, PUSH, PULL}` for a dumbbell athlete). A pattern the week does not hold is ignored.
- A load you state is a fact about the athlete you invented. State a plausible one for that athlete and that exercise's convention.

## 4. What the coach plans in a week (public composition rules)

Which doses come is the coach's decision. These rules say which kinds of sessions a week holds, as the athlete sees them in the plan.

**Optional sessions.** Some sessions are marked optional. Done or not, they never decide a week (delta 6 §1). They appear:
- as brisk walks on chosen run days beyond what the athlete's current running supports:
  - for a walk/jog athlete, on the run days beyond the walk/jog sessions;
  - after a long break (a restart), on the run days beyond the restart's runs, until easy runs are observed: with four chosen run days, for example;
  - for an easy runner whose chosen run days exceed what the reported weekly running supports;
- on the day before a race, as a short shakeout (an easy walk for a walk/jog athlete);
- after the race, in race week and the post-event week, as rest or easy recovery running;
- as strides on an easy run, for some athletes.

**Race week.** On the athlete's chosen run days the coach plans:
- the race on its date (the athlete's own date, even outside the run days);
- on the day before the race, when it is a run day, an optional shakeout;
- on the run day closest to the race that is at least three days before it, a race touch (a short sharpening session), only for an athlete who has done harder running sessions in this program and reported them done;
- on the other run days before the race, short easy runs;
- after the race, rest or optional easy running.

Strength in race week is at most one short light session, on a strength day at least three days before the race; the later strength days are rest by design.

So a race week whose runs are **only the race touch, the optional shakeout and the race** needs a runner whose program holds harder sessions (a 10K or half-marathon goal, run experience at least intermediate, three chosen run days) and who reported them done, the race on one of those run days, and exactly two other run days in that week: the day before the race and one day three or more days before it. Report the race touch and the shakeout with the bulk form (§2).

**Returns.** A return re-plans its weeks by the unchanged recipe of its class (short, moderate or long; a long one restarts running). Strength comes back at a light entry and returns gradually (deltas 2 to 7).

## 5. The unreported-training question

- The coach asks `UNREPORTED_TRAINING` when it must plan run doses and no run was reported done in the 30 days before the first week it plans, while planned runs in that window elapsed with no report at all (not reported as not done, not inside a stated break), and the doses depend on what was done. A silence of more than a month, with runs elapsing unreported, is what raises it. An empty review (a weekly review with no reports) is a natural place for it.
- It is not asked when nothing is left to plan (after the program's last run), when the window's sessions are reported (done or not done) or lie inside a stated break, or while running follows a re-entry recipe (walk/jog, restart, return).
- **The question and its answer in the program's last week** (the refusal carrier, delta 2 §7) need the silence to end with a decision early in that week, while its runs are still ahead (its first evening, for example); the answer in the next step, the same day or the next, before the remaining runs; and at least one more decision after it (the last week's review).
- **The clinical carrier** needs a strength session on or after the answer day: the evaluation substitutes one of its exercises.

## 6. What the evaluation adds (to delta 3 §3 and delta 4 §4)

- Both carriers are compared at a probe decision the evaluation inserts one minute after the answer, in both runs, and then at your later steps. You never write it. It needs your next step to come more than a minute after the answer.
- A run that a decision's own record reports on that decision's day is history to that decision, never a dose it plans.

## 7. Unchanged

The case format (`R7D-CASE-1`, `CASE_SCHEMA_R7D.json`) and the structural checker (`check-corpus.mjs`) are unchanged. `check-corpus-8.mjs` runs the same checker and adds warnings about references that may not resolve (§2); a warning is advice, never an error.
