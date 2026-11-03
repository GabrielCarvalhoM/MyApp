# R7-D public interface, version 4 (`R7D-INTERFACE-4`): delta to `R7D-INTERFACE-3`

`R7D-INTERFACE-4` is `INTERFACE_ONLY_R7D.md` (R7D-INTERFACE-1), read with `INTERFACE_DELTA_R7D_2.md`, then `INTERFACE_DELTA_R7D_3.md`, then this delta. Where they differ, the newest file prevails. The case format (`R7D-CASE-1`, `CASE_SCHEMA_R7D.json`) and the structural checker do not change. This file describes only the public behaviour of the coach and the evaluation client; it does not describe how the coach is built.

## 1. Several stated breaks before a return (replaces "Replacing and correcting" in §1 of the version-3 delta)

A stated break the coach keeps is a fact. **A newer stated break never erases it on its own.**

**Identity.** Every stated break has an identity: the `episodeId` the athlete gave it, or else the event id of the review that first stated it. In the evaluation client a review's event id is `<caseId>-<stepId>`, so a break can be named by the step that first stated it.

**How a newer break relates to a kept one:**
- **It names the kept break** (`interruption.episodeId` set to that break's identity): it is a **correction**. Its facts become the break and the earlier facts stay in the record, unused. Send the whole corrected break, because separate fields are not merged.
- **It states exactly the same facts again** (apart from `episodeId`): it is the **same declaration**. Nothing new is applied, and the same review sent again (same event id, same facts) records nothing at all.
- **Anything else**, whatever its dates (touching, overlapping, days apart) and however few fields it fills: the relation is **not established**. Both breaks stay facts, neither is joined to the other, and the coach **asks** before any return: `question.kind: 'INTERRUPTION_RELATION'`, `missingInputs: ['interruption.episodeId']`. The question lists each break (`episodeId`, `reportedOn`, `startDate`, `endDate`) and which ones are unresolved. No plan is valid and no return dose is chosen until it is answered. The athlete does not state the earlier break again.

**Answering the relation question.** Send the newer break again with an `episodeId`:
- the earlier break's identity: the newer break **corrects** it, and its facts replace the earlier ones;
- its own identity (or a new name): it is a **separate** break.

A break that already carried its own `episodeId` when first stated is already separate.

**Separate breaks** stay two facts with their own identities, and their days are never added up. A return reads them together:
- days that touch or overlap form one continuous stop, from the first day of the earlier break to the last day of the later one;
- with days between them, the stop also runs through those days when nothing was trained there: every planned session between them is reported as not done, or none was planned;
- training recorded between them ends the stop there. That is any planned session of either sport reported completed, or with any minutes, even a short or aborted one. The earlier break then has no effect on the return: the return is classed by the later break alone and starts from the doses executed before the earlier break and since (a disclosed residual, SSCTR-P32-F01; how much training between two breaks should count is the Founder's open decision);
- planned sessions between them **with no report at all** are asked about: `question.kind: 'TRAINING_BETWEEN_BREAKS'`, `missingInputs: ['observations.unreportedSessions']`, `question.unreported: {from, through, sessionIds}`. Unreported training counts neither as done nor as not done. Answer it as the unreported-training question is answered: report each listed session, done or not done.

**Clinical first is unchanged and comes before all of this.** If any kept break has a clinical reason, or the review has a clinical flag, a substitution with pain or a clinical route still in force, the decision goes to a qualified human. No relation question is asked and no dose is planned.

A newer nonclinical break that names none never makes a kept clinical one nonclinical. A break whose stated reason is clinical still goes to a human at every later decision, also after a qualified clearance. That is a known fail-closed boundary (F08): no nonclinical return is planned for a clinical cause.

The one exception is a report that names the kept break and corrects its reason to a nonclinical one. That is the athlete's correction of the facts, not a clearance. It is read as the corrected break, as before this version: its free text is still screened, and current eligibility must be `NONCLINICAL_CONFIRMED` with every clinical flag false.

**A correction of an applied break while another break is kept.** A review that corrects a break a return already applied (its `episodeId`), while a newer break is kept and not applied, is asked. The kept break is applied first: a weekly review or a return report applies it, with no need to state it again. A correction of the earlier break across it is then asked, as any correction across a later break is. A kept correction that is not sent again is not read: when the kept break's return is decided, it is listed in `notApplied` and **not asked about again unless it is sent again**.

**Once applied** (unchanged): a break is corrected as any return is, stated again with its `episodeId`. Stated again with a new event id and no `episodeId`, an applied break is applied again, and its re-entry starts over.

## 2. The record

A return (`REESTABLISH`) records its interruption as before. When it read several breaks, the interruption also lists them in `separateBreaks`. Each entry gives `episode` (its identity), `eventId` and `declaredAt` of its report in force, `startDate`, `endDate`, `days`, and `stop`, which is one of:
- `LATEST`: the break the return reads;
- `OVERLAPS` or `TOUCHES`: its days reach the stop;
- `NO_TRAINING_BETWEEN`: the days between are known to have no training;
- `TRAINING_AFTER`: training is recorded after it, so it is history.

The interruption's own `startDate`, `endDate`, `days` and `class` are those of the stop the return read. A kept correction of an applied break that the return did not read is listed in `notApplied`.

## 3. What a client does (adds to §2a of the version-3 delta)

- Name a correction: set `episodeId` to the identity of the break it corrects. A corrected break re-sent without it is asked about, never used as a replacement.
- **Never generate `episodeId` values automatically.** A name is the athlete's statement that a break is that interruption.
- Answer `INTERRUPTION_RELATION` by sending the newer break again with the `episodeId` the athlete chooses: the earlier break's, or its own.
- Answer `TRAINING_BETWEEN_BREAKS` with the listed sessions, done or not done.
- Never require the athlete to state a kept break again.
- Present INTERRUPTION_RELATION in plain words ("the same break, corrected" or "another break"), with no default answer, and answer it under a **new** report id.
- **Never re-send a report id with other facts.** The new facts would be read over the kept ones without being recorded.
- State a break's dates. Two breaks stated with the same facts and no dates are one declaration, even on different days.
- Answer a conflicted session listed by TRAINING_BETWEEN_BREAKS with a correction of the conflicting report (`correctionOf`). A plain new report of it is refused while it conflicts.
- To correct one break of a return that read separate breaks, restate the whole stop under that return's episode. The earlier break's own identity is not addressable after its return.
- While a relation or between-breaks question stands, do not present the stale plan as current.

## 4. What the evaluation adds (to §3 of the version-3 delta)

Besides the earlier variants, the evaluation re-runs each case once per review that applied a return reading a kept break. In that re-run the review also states a newer break that names none: seven days ending the day before, a work trip. That review must then apply no return and leave the plan not valid. A case author does not write this variant.
