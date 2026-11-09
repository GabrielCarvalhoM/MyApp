# PCG-V1CP-F08-r1: authority form for F08 under the Founder's D2 (trigger T2)

**Date:** 2026-11-08
**Role:** Product Constitution & Governance, fresh instance. It rules on the authority form only:
- the sporting content belongs to the SSCTR;
- the data conditions belong to Security with G07;
- the clinical judgment belongs to a qualified human (G04, unavailable).

**Machine-readable record:** [PCG_V1CP_F08.json](PCG_V1CP_F08.json). Where the two differ, the JSON prevails.

**Outcome: AUTHORITY_FORM_DECIDED · DR-148 applied (r1 committed in `ecad12d`) · F08 = F08_OPEN until runtime and reviews**

**Revision r2 (2026-11-08)** applies the corrections of the independent fidelity check [PCG-V1CP-F08-FIDELITY-r1](../pcg-fidelity/PCG_V1CP_F08_FIDELITY.json): the required TC-1, -2, -3, -5, -6, -8, -9, -11 and -12, and the recommended TC-4, -7 and -10. The r2 rows and the exact changed lines are in the JSON (`revisionR2`); the r1 rows are kept.

## Rulings

| Q | Ruling | Form |
|---|---|---|
| **P1** | **YES: one DR, DR-148 (PDR-1.14), partly superseding DR-99.** | DR-135–147 are taken on the pinned wearable branch (PDR-1.13), so DR-148 is the next free number. Situation 1 belongs in it too: "mild illness" and its warning-sign screen touch DR-99 ("suspected illness"), SSCTR-05 and G04 triage. Readiness is per sport and answers any clinical hold, not only declared breaks. A new plan after a clinical hold needs readiness first; after a long nonclinical break it needs no doctrine change. |
| **P2** | **APPROVED, with the texts below applied.** | In AEC §7 the overlay replaces only "restrição clínica exige resolução competente". It restates that a correction never reclassifies a clinical cause, so R-F08-1 keeps its textual basis. The G04 row keeps its text and gains the DR-148 delta in columns 2 and 4. |
| **P3** | **ADMISSIBLE as a conservative boundary instrument. Its content is SSCTR nonclinical scope under DR-148, flagged for future G04 revalidation.** It is not limited to the existing eligibility flags. | Those flags cannot tell a mild illness from a relevant one: they would either force "illness: yes" (clinical) or force a false "no". Conditions RF-1 to RF-8 apply (JSON). In short: additive only; each item answered, unknown is ASK; any yes goes to the clinical hold; all-no is never a clearance or "safe". Narrowing or removing an item is a re-review trigger. |
| **P4** | **Exactly four edits in three files** (table below). Nothing else. | Proposed, not applied: a DR-148 pointer in SSCTR-05/06, and the AEOS/UXS/designer-context sync. They belong to the Chief and Product/UX at a sync. |
| **Q4** | **`MILD_ILLNESS` is a structured Situation 1 fact of its own, not a value of the eligibility flag `illness`.** | `illness: true` stays clinical at every decision. While a current Situation 1 report states MILD_ILLNESS with every warning sign no, the `illness` question asks about an illness other than, or worse than, the one reported. The athlete is never forced into "yes" for that cold, or into denying it. In the other direction: any sign, flag or worsening routes clinical; unknown is ASK; free text only raises; the two channels never convert into each other; no chaining past 14 days. The same form applies to MINOR_DISCOMFORT against `pain` (Q4-b) and to the readiness screen (Q4-c). At readiness, the scoping never covers a warning sign or a systemic sign: any warning sign answered yes routes the clinical hold for every sport (r2, TC-9). |
| **P-2 → r2** | **Yields for the readiness path only.** | A structured READINESS_DECLARATION opens S6, now a restart that is not a clearance. The declaration is bound to the hold, per sport, forward-only, with a current screen. Q-1 to Q-8 stay the form of any future professional clearance, which is not in V1. "I feel fine", a checkbox, a correction, an eligibility re-answer alone, elapsed time or training still open nothing. Q03 (relay) stays open. |
| **P-3 → r2** | **The new plan is a legitimate exit (Situation 3).** | After a clinical hold, only once readiness is declared. The plan carries the episode, the declaration and the restrictions, and it never omits or relabels the cause. The intake reads the declaration instead of re-routing the historic episode; any current sign still routes clinical. |
| **C01 → r2** | **Kept for S5 and for any clearance; its S6 part is superseded.** | The DR-148 inputs carry no issuer, no verification and no clearance value or label. `professionalSeen` has no consumer in this form, so PCG recommends leaving it out. Its existence is Security's call; if kept, the engine never reads it, never requires or verifies it, and never shows it as clearance. |
| **C02 → r2** | **No statement ends a clinical-cause episode's clinical status (R-F08-1).** | The READINESS_DECLARATION is the only act that opens S6. Every other item of C02, a Situation 1 report included, still opens nothing. |
| **C06 → r2** | **The consumer now offers the restart.** | From a clinical hold the consumer offers two things: the professional-assessment recommendation and the readiness path. "Change the reason" is never offered. "New plan" is offered only after readiness, or after a long nonclinical break. It never drops the continuation state, never shows a stale plan, and applies no growth pressure in S2w, S3 or S6. Recording continues and nothing is exposed socially. Copy: "you told us you are ready", never "cleared". |
| **Kept** | C07, R-F08-1, clinical-first, "never diagnose, never clear, never prescribe against a known restriction" | C07 also means the harness models the declaration as its own step, never as QUALIFIED_CLEARANCE. Once any report of a Situation 1 episode routes clinical, R-F08-1 applies to that episode. |

**Consequential supersessions** of PCG-R7D-F08-r1 (JSON `supersedes`):
- the S6 part of P-1;
- F08-BLOCK-G04, for the DR-148 paths;
- C05: F08 becomes resolvable after the runtime and its reviews (D2.5), and only when no common recovery situation remains in which the person cannot legitimately return to training (B6; r2, TC-11);
- C08: the SSCTR's Situation 2 content now binds, as nonclinical scope;
- Q05: answered by D2.5;
- T2: consumed;
- R-F08-R1/R2: mitigated, because an exit now exists.

## Deltas applied (working tree, uncommitted; the Chief commits)

| File | Where | Change | sha256 before → after |
|---|---|---|---|
| `product/PRODUCT_DECISION_REGISTER.md` | top, new block `F08_RECOVERY_RETURN` V1CP-F08-r1 | DR-148 / PDR-1.14 inserted (27 lines) | `7387a013…0a8f50` → `575f598d…b5136a` |
| same file | §5, row G04 | two DR-148 sentences appended (columns 2 and 4); original text kept | (same file) |
| `product/ADAPTIVE_ENGINE_CONTRACT.md` | §7.1, after the correction paragraph | marked overlay `F08_RECOVERY_RETURN_OVERLAY` (8 lines) | `68252a15…74a` → `29118f8b…67157` |
| `canon/CANONICAL_INDEX.md` | top, new pointer `F08_RECOVERY_RETURN_INDEX` | pointer to DR-148, qualifying the SSCTR-AUTH-r1 "clinical return" phrase for these paths (11 lines) | `c9e012a8…28cc` → `3454c37d…773d` |

**r2 (fidelity corrections, working tree, uncommitted):**

| File | Lines changed | sha256 r1 → r2 |
|---|---|---|
| `product/PRODUCT_DECISION_REGISTER.md` | the DR-148 row (TC-1, -2, -3, -4, -5), protection 3 (TC-8), the G04 row column 4 (TC-6) | `575f598d…b5136a` → see JSON `revisionR2` |
| `product/ADAPTIVE_ENGINE_CONTRACT.md` | overlay line 1 (TC-7), bullet 2 (TC-8) | `29118f8b…67157` → see JSON `revisionR2` |
| `canon/CANONICAL_INDEX.md` | none: the judge found the pointer faithful | `3454c37d…773d` (unchanged) |

The exact text is in the JSON `deltas` (r1) and `revisionR2.productLineChanges` (r2). Unchanged:
- the DR-99 row;
- AEOS (rule 4 included);
- the SSCTR constitution;
- UXS, CF, EM, the designer context and the thesis;
- the mission and the ledger;
- the queue;
- CoachingCore;
- every freeze, `final/` and `final2/`.

`verify-r7d-6` does not read product/ or canon/. The R7-D freeze scripts' "no product/canon change" refusal concerns R7-D only.

## Conditions on the runtime (summary; full text RC-01 to RC-18 in the JSON)

1. **Clinical first, every decision.** The screen runs before Situation 1/2/3 logic, profile, volume, difficulty and speed.
2. **No clearance anywhere.**
   - No such input, field, value, event or label.
   - No "cleared", "liberado", "approved" or "safe" in any output.
   - An S6 output never calls the cause nonclinical.
   - S6 is computed by the runtime from the declaration fact, never by a client dropping the continuation state.
3. **Situation 1.**
   - Every sign is answered no, and eligibility is current with the Q4 scoping.
   - The window is 3–14 days and forward-only.
   - It is never opened while a clinical hold has no readiness declaration.
   - Any sign goes to S3, and R-F08-1 then applies.
   - Free text only raises.
   - No chaining past 14 days without an SSCTR rule.
   - It is never converted to or from a declared ILLNESS break.
4. **Situation 2.**
   - The declaration is bound to the hold. Each item is actively answered: no single checkbox, no defaults.
   - It is per sport and forward-only, with a current screen (scoped, Q4-c). Unknown is ASK.
   - Restrictions come from the closed vocabulary only. They are hard caps above every choice and are never read from free text.
   - A restriction the vocabulary cannot express keeps the sports it may affect held.
   - A restriction ends only by the athlete's later structured statement, and the restricted scope then restarts by the restart rules.
   - Any new sign goes back to S3.
5. **Situation 3.**
   - Existing cold start plus the carried record.
   - After a clinical hold, only with readiness.
   - Restrictions carry over.
   - Prior capacity is context only.
6. **Speeds.** Restoration happens only through an existing recipe step conditioned on executed evidence, never by date alone and never above caps. The speed choice is never itself evidence for restoring prior loads or paces (B2), and the return is gradual at every speed (D2.1 row 1). Speeds stay separate from the profiles and end with the return. The SSCTR decides which speeds exist.
7. **Per sport, and the record.**
   - The software never infers that a sign spares a sport.
   - Everything is append-only: episodes, reports, declarations, restriction ends and decisions.
8. **Envelope and dependencies.**
   - No new number except an SSCTR NEW PARAMETER in a separate file.
   - Security/G07 conditions apply before real collection. No document upload.
   - Append-only INTERFACE/PREREG deltas supersede PREREG-6 Δ12 for this path (G9).

## Findings (non-blocking for the form)

- **PCG-V1CP-F01:** conflict between DR-99/SSCTR-05 ("suspected illness" is clinical) and B1 ("mild illness" in Situation 1). It is resolved by the Founder's later, specific decision, narrowly, as in Q4.
- **PCG-V1CP-F02:** B2's "never restoring prior loads or paces automatically" against the DESIGN's FASTER rows. PCG reads "automatically" as "by date or elapsed time alone". The speed choice is never itself evidence for restoring prior loads or paces (B2), and the return is gradual at every speed (D2.1 row 1). The SSCTR checks each speed. If the SSCTR keeps a FASTER row that reaches the full pre-window dose in one step, that row goes to the Founder: does "gradual" admit it?
- **PCG-V1CP-F03:** urgency wording for warning signs (for example chest pain) is G04 content, and no G04 owner exists. The interim wording must be conservative, non-diagnostic and never suggest waiting. Routed to the Founder; it blocks final copy, not the form.
- **PCG-V1CP-F04:** the playbook's standard gates are a Research check (DOCTRINE_EVIDENCE_REVIEWED) and a Product/UX check (DOCTRINE_INTERPRETABLE). The route names one fresh-PCG fidelity check. That is the Chief's gate choice; no READY is claimed here.
- **PCG-V1CP-F05:** the 2026-11-08 request is on disk as a summary, with B1–B6 now quoted verbatim in the task contract (r2). Clause (6) rests on D2.2 and B4, and clause (7) on D2.1 row 3 and B5. A verbatim difference elsewhere in the request is a re-review trigger.
- **Note for the SSCTR (r2, from TC-2):** the Founder's first intent is "reduzir a dificuldade" (D2.1). The SSCTR's mapping of that intent should reduce difficulty, not only volume, because D1.4 keeps difficulty as its own axis.

**Refused or routed, outside D2's coverage:** any medical-document upload (Founder), a relayed clearance (Q03, G04 + Security + G07), a pointer edit to the SSCTR constitution (Chief), the legal service model (Founder, D1.5).

**Status:** GOVERNANCE_READY_FOR_REVIEW / PRODUCT_CONSTITUTION_DRAFT. This record is not canonical and not runtime authority. V1_COACHING_AUTHORITY_READY = NO.
