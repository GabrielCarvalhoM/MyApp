# F08 — proposal: a legitimate exit after a clinical break (R7-D Phase 3.4)

**Status of this document:** PROPOSAL, coordinator-authored, for the SSCTR (sporting process) and PCG / G04 owners (authority form). It authorizes nothing and changes no runtime byte. Benchmark: [F08_COMPETITOR_BENCHMARK.md](F08_COMPETITOR_BENCHMARK.md).

## 1. Today (R7D-FREEZE-4)

- A clinical reason (illness, injury, pain, medical, …), a clinical flag in the eligibility, or pain with a substitution routes to `CLINICAL_HUMAN_REQUIRED`: no prescription, the record still accepts evidence (`r6-adaptation.mjs`: `interruptionScreen`, `clinicalRoute`, the eligibility gate).
- The route is sticky through the continuation state (`referenceState.pending`, `withReference`: "this reference cannot clear it").
- The interface's `clearance:'QUALIFIED_CLEARANCE'` step means a qualified human cleared the athlete; the client then drops the continuation state and keeps the record (INTERFACE_ONLY_R7D §4; INTERFACE-3).
- **F08:** a break whose **own reason is clinical** is a record fact (`INTERRUPTION_DECLARED`), so every later decision re-screens it as clinical, also after a qualified clearance (INTERFACE-4). The athlete is held indefinitely. Safe (fails closed), but there is no exit.
- One path exists that the Founder's request bears on: a report that **names the kept break and corrects its reason** to a nonclinical one is read as the corrected break (INTERFACE-4; free text still screened; current eligibility `NONCLINICAL_CONFIRMED` with every clinical flag false). It was accepted as the athlete's correction of a mistaken fact, not a clearance. The Founder now forbids resolving F08 by letting the athlete simply reclassify the original cause (open question P-4 below).

## 2. State machine (existing states reused; two new states proposed)

| # | State | Runtime today | Entered by | Left by |
|---|---|---|---|---|
| S1 | Normal training | plan `VALID_WITHIN_CURRENT_BOUNDED_SCOPE` | — | any event below |
| S2 | Nonclinical reduction | fatigue handlers; missed sessions; nonclinical declared break and its return (`REESTABLISH` SHORT / MODERATE / LONG) | nonclinical event | executed evidence (back to S1) |
| S3 | Clinical hold | `CLINICAL_HUMAN_REQUIRED`; prescription suspended; record kept | clinical reason, flag, pain report | **only** S5 (proposed); never a nonclinical event |
| S4 | Awaiting qualified assessment | same runtime state as S3 (consumer copy only) | S3 | S5 |
| S5 | **Clearance recorded** (new) | — | a `CLINICAL_CLEARANCE` fact meeting the G04 schema (§3) | S6 when valid; S3 when invalid or on a new clinical sign |
| S6 | **Sporting reassessment and progressive return** (new) | — | S5 + current eligibility | S7 by executed evidence; S3 on any clinical sign |
| S7 | Normal training restored | existing return completion (`returnTo`, restart switch) | S6 | — |

Vocabulary (BERN continuum, the Founder's distinction): **S5 = return to participation** (a qualified human allows training, with a scope); **S6 = return to sport/training** (the coach re-assesses and rebuilds from current capacity); **S7 = return to performance** (prior tolerated doses regained only by executed evidence).

## 3. The clearance fact (proposed contract; every field to be approved by G04 and Security)

```
{ fact: 'CLINICAL_CLEARANCE', athleteId, eventId, recordedAt,
  episodeId,                       // the clinical break it clears: required; a clearance names its episode
  issuer: { class, verification }, // class from a G04 list; verification: PROFESSIONAL_VERIFIED | ATHLETE_DECLARED
  issuedOn, reviewOn | validUntil,
  scope: { RUN, STRENGTH },        // each UNRESTRICTED | RESTRICTED | NOT_CLEARED
  restrictions: [ { code, … } ],   // a closed vocabulary approved by G04; never free text read by the engine
  stopSigns: [ code, … ],          // when to stop and seek a new assessment (G04)
  inputHash }
```

- Append-only, like `INTERRUPTION_DECLARED`; the clinical declaration and its reason are never edited, replaced or reclassified by it.
- **A statement is not a clearance.** An `ATHLETE_DECLARED` clearance is recorded but opens S6 only if G04 and Security approve that provenance level. "I feel fine", a format-valid form or a later nonclinical break never does.
- The engine never diagnoses, validates a medical document, infers a clearance or prescribes against a restriction.

## 4. Transitions and their checks (proposed)

| From → to | Condition | Otherwise |
|---|---|---|
| S3 → S5 | the clearance names a clinical episode of this athlete on record; issued on or after that episode began; not expired at the decision; scope covers at least one sport; issuer class and verification allowed by G04/Security | stays S3; the missing fact is asked |
| S5 → S6 | current eligibility `NONCLINICAL_CONFIRMED`, every flag false, dated on or after the clearance; no stop sign reported | stays S5 (ASK) |
| S5/S6 → S3 | any new pain, illness, injury, functional limitation or clinical flag; a reported stop sign; a contradicting or withdrawn clearance; a clearance of another athlete or episode | — |
| S6 → S7 | the return completes by executed evidence (the existing rules) | — |
| S3 → S3 | a later nonclinical break, named or not; a weekly review; any other event | never clears (existing: a newer nonclinical break never makes a kept clinical one nonclinical) |

In S6, per sport within the clearance's scope:
- the start is current capacity, never the pre-break plan: the entry the G04 owners approve (candidate: the existing nonclinical class by the clinical break's own length, never shorter, with a current demonstration where the recipe uses one);
- prior tolerated doses are a ceiling, never a target by date; restrictions are hard caps that coach, volume and difficulty profiles never override;
- a sport `NOT_CLEARED` stays held while the other proceeds; running and strength stay coordinated by the existing composition;
- the clearance transition is applied alone: no other event's change travels with it (the existing event-separation rule, `breakCarrierAsk`).

## 5. Invariants

The original clinical reason stays recorded; history is never erased; the old plan is never restored by the clearance; no calendar-only progression; no return above authorized capacity; a later nonclinical break never erases an earlier injury; reclassification is not an exit; privacy: health facts minimized, consented and retained under G07.

## 6. Authority each part needs

| Part | Owner | Available today |
|---|---|---|
| Clearance schema, issuer classes, restrictions vocabulary, stop signs, the post-clearance return rule | **G04: competent qualified professionals (a physician for clinical evaluation)** — PDR G04 row; DR-99 | **No** (no qualified owner exists in the project) |
| The sporting part of S6 inside a valid scope | SSCTR (nonclinical, after G04) | Partly: the SSCTR cannot approve a clinical return (SSCTR-02/06) |
| A clearance input in the runtime (a sensitive health claim; provenance and verification) | Security/Privacy | Not dispatched: no such input enters the runtime in this phase |
| The consumer flow and copy; data schema | Product/UX, Data (G03/G07) | Out of this mission (no UI/UX) |
| The product decision and the authority form | Founder / PCG | This phase (PCG record) |

## 7. Tests to write when authorized

Clinical condition active; no clearance; a valid clearance with sufficient scope; insufficient, contradicting, expired or other-athlete clearance; a restriction still active; a conservative return without the pre-injury plan; recurring symptoms on return; a trip or holiday trying to overwrite the clinical cause; history preserved; another event's change never applied with the clinical transition.

## 8. Open questions for PCG / G04 (P-1 … P-5)

- **P-1.** Does any current authority permit implementing S5/S6 now, in whole or in part?
- **P-2.** What makes a clearance qualified (issuer, verification, scope, date), and may an athlete-declared clearance ever open S6?
- **P-3.** Until G04 has an owner, is a documented interim exit acceptable — for example the competitor pattern of a new plan from a fresh onboarding after the professional's clearance (RN1) — or would it bypass the clinical boundary?
- **P-4.** Is the existing correction path (naming the kept clinical break and correcting its reason to nonclinical) compatible with the Founder's prohibition on reclassifying the original cause, or must it be restricted (and how, without trapping genuine data-entry mistakes)?
- **P-5.** The decision record: the exact blocker, its owner and the trigger that reopens F08.
