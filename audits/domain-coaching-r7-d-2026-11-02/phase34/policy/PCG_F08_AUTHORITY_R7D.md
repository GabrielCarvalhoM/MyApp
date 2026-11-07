# PCG-R7D-F08-r1: authority form for F08 (no exit after a clinical-cause break)

**Date:** 2026-11-07
**Role:** Product Constitution & Governance, a fresh and independent instance. It decides the authority form only. The sporting process is the SSCTR's (Part 1 Q8, not read here). The clinical judgment belongs to a qualified human.
**Machine-readable record:** [PCG_F08_AUTHORITY_R7D.json](PCG_F08_AUTHORITY_R7D.json). Where the two differ, the JSON prevails.

**Outcome: AUTHORITY_FORM_DECIDED · F08 = BLOCKED_BY_AUTHORITY · correction path = RESTRICTION_REQUIRED (R-F08-1)**

## What the runtime does today (R7D-FREEZE-4, own read-only probe)

- A clinical-cause break routes to `CLINICAL_HUMAN_REQUIRED` at every decision, also after a clearance (F08). It fails closed.
- **Exception:** a later report that names the break and restates its reason as nonclinical is screened alone. The episode then re-enters by the nonclinical recipe:
  - **P1:** with no clearance at all, when the stating review only asked for eligibility;
  - **P3:** after a clearance, including a correction sent while the clinical route stood;
  - **T5:** the same path, in `r7d-phase32`.
- The runtime has no clearance fact. `QUALIFIED_CLEARANCE` is a client act (dropping the continuation state), and the runtime cannot verify it (P4).

## Rulings

| Q | Ruling | Form / reason |
|---|---|---|
| **P-1**: S5/S6 now? | **NOT_IMPLEMENTABLE_UNDER_CURRENT_AUTHORITY**, in whole and in part, including an inert, record-only clearance fact | S5's content is G04's (`liberação`, classes, restrictions). S6 is a return after a clinical cause: G04, DR-99 and SSCTR-05 rule it out. No G04 owner exists. Even recording a clearance is collecting a clinical fact across a new trust boundary (G04, G07, Security). **Implementable now:** S3 hardening (R-F08-1), S3 characterization tests with no clearance input, and disclosures. The proposal and the SSCTR's Q8 answer are offline proposals only. |
| **P-2**: qualified clearance | **Form decided (Q-1 to Q-8); content BLOCKED on G04.** An athlete-issued clearance never opens S6. A relayed professional clearance is not admissible now. | **Q-1 to Q-8:** a real professional of a G04-approved class (a physician for clinical evaluation); verification approved by G04 with Security/G07; bound to this athlete's named episode; per-sport scope with a closed restriction vocabulary; valid forward only; G04 stop signs; an append-only fact of its own; current eligibility necessary, never sufficient. "I feel fine", RECOVERED, a checkbox or a correction is a confirmation: G04, AEC §7, AEOS rule 4 and PS04 exclude it. A relay is a G04 + Security + G07 question (Q03). |
| **P-3**: interim exit (fresh onboarding) | **NOT_ADMISSIBLE**: it bypasses the boundary. There is no interim exit. | Told honestly, the onboarding routes clinical at intake. It produces a plan only if the athlete omits or relabels the cause, or if the new program ignores the kept episode. Both are forbidden by the Founder. A plan after the hold is `liberar hold / prescrever retorno` (G04). A competitor feature is not authority. **Interim state is S3/S4:** no plan; recording continues; no stale plan shown; no growth pressure (DR-125); routing only under G04 copy. |
| **P-4**: correction path | **INCOMPATIBLE** (PCG-F08-F01). **R-F08-1 is REQUIRED and WITHIN_EXISTING_AUTHORITY.** | Source A is a general correction rule whose clinical consequence was disclosed, never approved (PREREG-4 Δ12, SSCTR-P32-F02). Source B is the Founder's Phase 3.4 prohibition, G04, AEC §7 ("restrição clínica exige resolução competente") and DR-99. The later, specific decision prevails. **Owners:** PCG (form), the Engineering worker (implementation), SSCTR and Quality (narrow checks), G04 (whether a retraction can ever count; unavailable). |
| **P-5**: record | **BLOCKED_BY_AUTHORITY (F08-BLOCK-G04)**. F08 is never declared resolved. | Blocker, owner and triggers below. |
| Security | **REQUIRED**, with G07, before *any* clearance input, inert included | Not dispatched in this phase because no input enters. **Dispatch trigger:** any S5 design or any consumer path that drops the continuation state. |

## R-F08-1 (MUST, outcome only)

> The clinical status of a declared break belongs to its episode, not to the report in force. If any report of an episode on record was classified CLINICAL by the existing interruption screen (category, flag or mention), the episode stays a clinical-cause episode at every later decision. A named correction is still recorded append-only and still corrects dates, length, start time and text. Its nonclinical reason is kept as the athlete's statement and never removes `CLINICAL_HUMAN_REQUIRED`, opens a nonclinical return or sets a return class. This holds before, during or after a clinical route or a client clearance, on every path that reads the episode. Reasons screened only ASK or NONCLINICAL are unaffected.

**Residuals (disclosed):**
- **R1:** a mistaken clinical entry holds the athlete with no exit in the product until G04 exists.
- **R2:** a free-text false positive becomes permanent too (G04 question Q02).
- **Mitigation:** consumer design space only, for example confirming a clinical entry before it is sent. The cost is the Founder's to weigh against trigger T1.

## Blocker, owner, reopening

- **Blocker:** S5 and S6 need the G04 competent qualified professionals to approve the clearance contract and the return framework. Security/Privacy, G07 and the legal service model are also needed. No G04 owner exists. Until then the athlete stays in S3/S4, and R-F08-1 does not resolve F08.
- **Owner:** G04, unavailable. **Smallest missing decision:** the Founder appoints and funds a real qualified G04 owner (identity, verified qualifications, scope).
- **Triggers:**
  - **T1 (primary):** that appointment is recorded.
  - **T2:** a Founder doctrine change to DR-99/G04.
  - **T3:** funded human revalidation.
  - **T4:** a legal or service-model change.
  - **T5 (at once, no G04 wait):** any path leaves the clinical route without a clearance, shows the stale plan or loses the record.
  - **T6:** a change to the interface clearance or to the screens.
- **Not triggers:** competitor features, athlete statements, elapsed time, executed weeks, tests, an SSCTR record alone, an LLM output.

## Conditions (summary)

| Id | Condition |
|---|---|
| C01 | No S5/S6 in the runtime: no clearance input, field, flag, event kind or relied-on convention, inert or not. |
| C02 | No athlete statement, onboarding, later break, time or training ends a clinical-cause episode. |
| C03 | If R-F08-1 is implemented now: RED on FREEZE-4 (P1, P3, T5), then GREEN; no new number or input; T5's assertion changes only as a marked update both narrow checks accept; append-only INTERFACE/PREREG deltas supersede INTERFACE-4's exception and PREREG-4 Δ12 before any holdout; SSCTR and Quality checks; residuals disclosed. |
| C04 | If R-F08-1 is not implemented before the next freeze: PCG-F08-F01 is carried as an open DOWNSTREAM_VIOLATION, F08 is never called plain fail-closed, and no consumer exposes the reason correction. |
| C05 | F08_OPEN in every case. `KNOWN_FAIL_CLOSED_AUTHORITY_BOUNDARY` stays, qualified. |
| C06 | Consumer: never drop the clinical continuation state; no stale plan; no growth pressure; no "new plan" or "change the reason" exit; G04 copy only; recording continues. |
| C07 | `QUALIFIED_CLEARANCE` stays an evaluation-only convention, never a product mechanism (I-F08-2). |
| C08 | The SSCTR's Q8 answer is a proposal for a future joint G04/SSCTR review. A conflict with this record returns to PCG and the Chief. |
| C09 | No product/, canon/, mission, ledger or queue edit. The canon note in the JSON is a proposal only. |
| C10 | Re-review triggers: T1 to T6, a change to the screens or the episode semantics, a change to G04, DR-99, AEC §7 or AEOS. |

**Unchanged:**
- every runtime byte (R7D-FREEZE-4);
- product/ and canon/;
- the SSCTR constitution;
- the mission, the ledger and the queue;
- INTERFACE-1 to -5 and PREREG-1 to -5;
- clinical first, I9 and the correction rule for every nonclinical fact;
- fronts A and B.

**Independence:**
- I am a fresh instance and authored nothing I evaluated.
- I did not open `phase34/policy/SSCTR_*`, the parallel SSCTR folder or any `phase34/reviews/`.
- The probe is my own, run read-only on FREEZE-4 in scratch.
- No delegation.

**Status:**
- GOVERNANCE_READY_FOR_REVIEW for the authority form; F08 itself is GOVERNANCE_BLOCKED.
- Not canonical, not Product Truth, not V1 coaching authority.
