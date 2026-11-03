# R7-D public interface, version 3 (`R7D-INTERFACE-3`): delta to `R7D-INTERFACE-2`

`R7D-INTERFACE-3` is `INTERFACE_ONLY_R7D.md` (R7D-INTERFACE-1), read with `INTERFACE_DELTA_R7D_2.md` and then with this delta. Where they differ, the newest file prevails. The case format (`R7D-CASE-1`, `CASE_SCHEMA_R7D.json`) and the structural checker do not change. This file describes only the public behaviour of the coach and the evaluation client; it does not describe how the coach is built.

## 1. A stated break is a fact the coach keeps (replaces the last two bullets of §1 of the version-2 delta)

**What counts as stating a break.** Any review whose `interruption` is an object with at least one field that has a value (`event.interruption`, or `answer.declareBreak`) states a break, whatever the event kind, **as long as the break begins on or before that review** (its `startDate`, or its `startedAt`, is not later than the review).
- An `interruption` whose fields are all empty states nothing. It is still asked about by its own review, and nothing is kept.
- A break that begins after the review is a plan, not a fact. Its own review asks about it, and nothing is kept.

**The coach keeps a stated break until a return applies it.** The athlete never has to state it again, whatever the review that stated it decided:
- a question (`ASK`), for instance because the break came with another kind of event, or because one of its facts was missing;
- a refusal (`HOLD`);
- a route to a qualified human (`CLINICAL_HUMAN_REQUIRED`), for instance because of a clinical flag or a substitution with pain.

**While a kept break is not applied:**
- **No plan is valid.**
- **Another kind of event** (a schedule change, a fatigue report, a missed session, a goal or equipment change, and so on) is asked about, and nothing of it is applied: `missingInputs: ['interruption.reportedOnItsOwn']`. The coach's message says the break is recorded. Send a weekly review or a return report, without stating the break again, and then send the event again. The event that came **with** the break is never applied with it either; it is sent again after the return.
- **A weekly review or a return report** that states no break of its own applies the kept break: the same decision as the same break stated in that review, including any question that break would raise there (a fact still missing, an eligibility assessed before the break ended).
- **Clinical first, unchanged:** a clinical flag in the eligibility, a substitution with pain, or a clinical route still in force goes to a qualified human first. The kept break is not applied, and no dose is planned.
- **After a qualified clearance** of such a route, the next weekly review applies the kept break. The plan from before the break is never valid again just because the clearance did not mention the break.
- **A break whose own reason is clinical** (illness, injury, pain…) goes to a qualified human at every later decision, also after a qualified clearance, exactly as stating it again would. No nonclinical return is planned for a clinical cause.

**Replacing and correcting:**
- A newer stated break replaces an older one not applied yet. To correct the dates of a kept break, state the corrected break; send the whole break, since separate fields are not merged into the kept one.
- Once applied, a break is corrected as any return is: state it again with `episodeId` set to the event id of the review that **first** stated it.
- Sending the same review again (same event id, same facts) records nothing new and applies nothing twice.

## 2. The record

The completed-work record the coach returns (`actualLedger`) may now hold, besides execution reports, one row per stated break: `{fact:'INTERRUPTION_DECLARED', eventId, eventKind, athleteId, declaredAt, interruption, inputHash, provenance}`. It is the break exactly as the review stated it, the review's event id and kind, and the review's clock.
- Carry the record exactly as returned (unchanged rule). Never edit, drop or reorder these rows.
- A qualified clearance drops only the clinical continuation state (`referenceState`). It keeps the record, and so the kept break.

## 3. What the evaluation adds (to §7 of the version-2 delta)

Besides the two carriers, the evaluation re-runs each case once per stated break that its own review did not apply. In that re-run, the break is stated again in every later review that states none, until a return is applied. Nothing may change. A case author does not write this variant.
