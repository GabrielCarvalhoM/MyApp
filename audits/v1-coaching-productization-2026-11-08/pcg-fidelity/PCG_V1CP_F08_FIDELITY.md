# PCG-V1CP-F08-FIDELITY-r1: fidelity check of PCG-V1CP-F08-r1 (commit ecad12d, base 4c3f6dc)

**Date:** 2026-11-08
**Judge:** a fresh PCG instance. It authored nothing it reviews, edits nothing outside this folder and delegates nothing.
**Machine-readable record:** [PCG_V1CP_F08_FIDELITY.json](PCG_V1CP_F08_FIDELITY.json). Where the two differ, the JSON prevails. The JSON also holds the exact Founder text for every verdict.

**Overall: FAITHFUL_WITH_CONDITIONS.** Nine required text corrections go back to the PCG author. After that, one narrow re-check of the changed lines only. Nothing needs to escalate.

## Deltas

| Delta | Verdict | Why |
|---|---|---|
| D-1 DR-148 (PDR block) | FAITHFUL_WITH_CONDITIONS | Clauses (1), (3) and (4) are faithful. Clause (6), "judged separately", is **UNFAITHFUL** in wording, because D2.2 says "consideradas juntas" (TC-1). Corrections needed elsewhere: the intent names in (2) (TC-2), "conquistas" in (7) (TC-5), the precision of the supersession (TC-3) and "structured" in protection 3 (TC-8). |
| D-2 G04 row | FAITHFUL_WITH_CONDITIONS | It follows G4. Column 4's exception names only the restart, so the Situation 1 screen stays gated on G04 (TC-6). |
| D-3 AEC §7.1 overlay | FAITHFUL_WITH_CONDITIONS | It follows G2 and loses no protection. It needs "structured" (TC-8). Scoping the replacement to the DR-148 paths is recommended (TC-7). |
| D-4 index pointer | FAITHFUL | It is scoped to the DR-148 paths and leaves the SSCTR-AUTH-r1 text unchanged. It becomes canonical only after the Chief's gate. |

## Flagged points

| Point | Verdict | Ruling in short |
|---|---|---|
| 1 · Q4: mild illness vs `illness` | FAITHFUL_WITH_CONDITIONS | B1 says "Doença leve" and prevails narrowly. The scoping is a Founder-decided narrowing of the question, so RF-1's "not a relaxation" must be reworded (TC-10). |
| 1 · Q4-b: discomfort vs `pain` | FAITHFUL_WITH_CONDITIONS | This is the author's extension, from B1's "Pequenos desconfortos". `persistentPain` is never scoped. A discomfort that persists or recurs is asked again, never given a new window. |
| 1 · Q4-c: readiness screen | FAITHFUL_WITH_CONDITIONS | As written, it could scope away a warning sign that the declaration "carries". TC-9 (required) says warning-sign and systemic items are never scoped. |
| 2 · A restriction ends by a structured statement | FAITHFUL_WITH_CONDITIONS | The source is §1 of the minimal delta ("até o atleta informar que acabou"), which D2.6 adopts, bounded by D2.3 and B3. The normative texts need "structured" (TC-8) and an explicit supersession (TC-3). The Founder should see this rule; it is not blocking. |
| 3 · G4 transfer, its Situation 1 extension, RF-1 to RF-8 | FAITHFUL_WITH_CONDITIONS | G4 covers the readiness path. The extension follows necessarily from B1, B3 and B6 and is INFERRED, not the Founder's wording. RF-1 to RF-8 are admissible. TC-6 and TC-10 apply. Urgency wording (F03) stays with the Founder. T2's "with legal review" is routed to D1.5. |
| 4 · F02: "automatically" | FAITHFUL_WITH_CONDITIONS | The text supports "without evidence", because D2.1 row 3 says "não voltam sem evidência". "Never in one step" is not in B2, but D2.1 row 1 makes the return "gradual" at every speed. TC-12: the choice of speed is never evidence, and the return is gradual. A Founder clarification is needed only if the SSCTR keeps a FASTER row that returns to the full pre-window dose in one step. |
| 5 · P-1 S6 part | FAITHFUL | D2.4 reopens the declared restart. S5 stays. |
| 5 · F08-BLOCK-G04 | FAITHFUL_WITH_CONDITIONS | It takes effect only when the change is approved (D2.5). Until then, F08 stays BLOCKED_BY_AUTHORITY. |
| 5 · C05 | FAITHFUL_WITH_CONDITIONS | The criterion for resolving F08 must include B6 (TC-11). |
| 5 · C08 | FAITHFUL_WITH_CONDITIONS | It binds only through a current SSCTR decision (G6), never by retroactively promoting the Q8 answer. The conflict clause stays. |
| 5 · Q05 | FAITHFUL_WITH_CONDITIONS | In V1, the return is the declared-readiness restart. That does not rule out a future professional clearance (T1). |
| 5 · T2 consumed | FAITHFUL | D2.4 says so literally. T1 and T3 to T6 stay live. |
| 5 · R-F08-R1/R2 mitigated | FAITHFUL | They are mitigated, not resolved: the clinical label stays (R-F08-1). |
| P-2, P-3, C01 (S6 part), C02, C06 | FAITHFUL | G5. |

## Unchanged (verified)

- The DR-99 row, AEOS (rule 4, HC03 and PS04) and the SSCTR constitution have no diff from 32b5ce3 to ecad12d.
- CoachingCore and the R7-D records are unchanged in ecad12d.
- R-F08-1, C07, clinical-first and "never diagnose / never clear / never prescribe against a known restriction" are all kept. The added applications are stricter.
- **Removable overlays:**
  - D-1, D-3 and D-4 sit between HTML markers;
  - D-2 is labelled inline;
  - removing all four reproduces the 4c3f6dc bytes of the three files (independent scratch check);
  - the hashes match the author's record;
  - DR-148 does not collide with any other number.

## Required corrections (author's text)

TC-1, TC-2, TC-3, TC-5, TC-6, TC-8, TC-9, TC-11 and TC-12 are required. TC-4, TC-7 and TC-10 are recommended. The exact wording is in the JSON `corrections`.

## Back to the Founder

- The F02 clarification, only under the condition in point 4.
- Interim urgency wording (F03), already routed.
- For visibility: the athlete's structured statement ends a restriction.
- B4 and B5 are not quoted on disk.
- D1.5, the legal service model.

**Status:** fidelity verdict only. It claims no PRODUCT_CONSTITUTION_READY and no canonization. F08 stays F08_OPEN, and V1_COACHING_AUTHORITY_READY = NO.
