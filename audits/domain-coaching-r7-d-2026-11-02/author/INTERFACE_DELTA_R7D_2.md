# R7-D public interface, version 2 (`R7D-INTERFACE-2`): delta to `R7D-INTERFACE-1`

`R7D-INTERFACE-2` is `INTERFACE_ONLY_R7D.md` (R7D-INTERFACE-1) read with this delta. Where they differ, this file prevails. The case format (`R7D-CASE-1`, `CASE_SCHEMA_R7D.json`) and the structural checker do not change. This file describes only the public behaviour of the coach and the evaluation client; it does not describe how the coach is built.

## 1. A declared break, whatever event carries it (§5, §6)

- A break declared in a `WEEKLY_REVIEW` (`event.interruption`, or `answer.declareBreak`) is read as the return report of that break, **whether or not a question is pending**. It gives the same decision a `RETURN_AFTER_PAUSE` with the same facts gives. The two differ only in the event label.
- A break whose end is after the review day (still under way) is asked about, not applied.
- A break declared in **any other event kind** (a schedule change, a fatigue report, a substitution, a missed session…) is screened clinically first. Otherwise it is asked about (`missingInputs: ['interruption.reportedOnItsOwn']`): send the break on its own (a weekly review or a return report), then the other event again.
- Clinical first, always: a clinical flag in the eligibility, or a clinical reason for the break, routes to a qualified human before anything else.

## 2. Same-day reports with day precision (§7, facts)

A report with only a date (`occurrenceDate`, no `observedAt`) and a `reportedAt` earlier that same day is a valid report. Once a decision records it, it stays in the record at every later decision, unless a correction replaces it.

## 3. Machine loads (§3, §4, §7)

- A machine exercise (convention `MACHINE_STACK`) with a known load is prescribed in kilograms (`load:{mode:'KNOWN', value, unit:'KG', convention:'MACHINE_STACK'}`). A log written exactly as the row states it is read.
- **The coach never computes a machine setting.** When a heavier setting is due, the row states no number: `load:{mode:'FROM_LOG', unit:'KG', convention:'MACHINE_STACK', nextSetting:{aboveKg, fallbackReps}}`. It asks for the next heavier setting that machine allows above `aboveKg`, at the row's repetitions. If no heavier setting fits, the athlete keeps `aboveKg` at `fallbackReps`.
- A heavier setting the athlete logs becomes the reference only when that session met its target with the reserve shown, and:
  - the athlete confirms it (`loadConfirmations`), or
  - the same value is logged again at another session.
  
  Until then the coach asks one question and keeps the earlier setting.
- To state what the athlete lifts on a numberless row, use `exercises` with explicit loads, or `loadsByPattern` (kilograms in the row's convention).

## 4. Confounded executions (§7, facts)

`confounded:true` says the conditions of that execution (heat or terrain, for example) make its **performance and effort** hard to read. It does **not** make an adverse recovery or an impaired next day unknown: those stay adverse.

## 5. Learning consent (§5)

The evaluation client sends the athlete's current learning consent with every decision. A step with `learningConsent:false` (or `true`) changes it from that step on, until another step changes it again.

## 6. Author expectations, precise readings (§7)

- `ROLE_ABSENT` / `ROLE_PRESENT`: in the week of the step itself, only sessions on or after the step's date count (earlier sessions of that week are history). Other weeks count whole.
- `ROLE_MINUTES_COMPARE`: a week the plan has, with no live session of the role, counts **0 minutes**. A week the plan does not have is not evaluable.
- `VARIANT` `expect` (`NOT_HIGHER_RUN_LOAD` / `NOT_LOWER_RUN_LOAD`) describes the variant's plan relative to the base case's plan, at `compareAtStep`.

## 7. The two carriers the evaluation exercises (§5, §7)

The client does this automatically from a case's answer steps, when the coach has asked an `UNREPORTED_TRAINING` question:
- **Clinical carrier:** the same answer sent inside an exercise substitution with pain, followed by a qualified clearance on the next step.
- **Refusal carrier:** the same answer sent with a schedule change in the program's **last week**, which the coach refuses (HOLD).

These carriers only get exercised when the coach actually asks, which needs a **long reporting silence** (more than a month without any reported run), and only when the answer comes in the step after the question. The refusal carrier also needs the question and its answer in the program's last week.
