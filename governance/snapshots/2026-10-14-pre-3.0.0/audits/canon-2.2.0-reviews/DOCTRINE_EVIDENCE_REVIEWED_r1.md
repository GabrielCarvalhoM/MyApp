# DOCTRINE_EVIDENCE_REVIEWED — VILUMO-PTC-2.2.0 draft, audit round 1

| Field | Value |
| --- | --- |
| Gate | DOCTRINE_EVIDENCE_REVIEWED (PRODUCT_GOVERNANCE rubric 1.2.0, Research auditor); evidence_policy = doctrine_audit |
| Artifact | Draft `7059b5f833e1c674cd8ed45e81462bc034c48d6a1391081032f4a85829c8f3e4`; delta `c5563dc4…38b9`; snapshot/canon `4d4ccb65…`; PDR `18be6924…` |
| Verdict | **PASS, with one condition before READY/publication (RA-01)**; 10 non-blocking findings. Fidelity and epistemic status only: not EVIDENCE_SUFFICIENT, no market validation |
| Auditor | A fresh research-evidence-strategist instance, not the author or co-author of the draft, delta, PDR rulings, PCG-J, SEC-J or DI review. Zero file writes |
| Route | claude-opus-5-5 / xhigh. The pass was interrupted by HTTP 429 at about 11:39 and resumed at 16:03 |
| Date | 2026-10-10 |

## Summary of the auditor's verdicts
- **Per-change fidelity:** CH-01 to CH-26 are all OK. Every one of the 22 diff hunks maps to a CH entry; there are no unrecorded changes. Findings are attached where noted below.
- **LOCKED integrity:** PASS. L001–L023 are 23/23 identical by line hash; C016–C023, D010 and D011 are 10/10 identical. The reading of L023's "declarar" as representation by any means is **faithful** to the Founder's "Any sport represented … as fully supported". It restores the breadth that "declare" narrowed and keeps the "plenamente suportada" threshold. One precision gap remains (RA-03).
- **New IDs:** PASS.
  - C024, C026 and C027 trace to Founder text, are CURRENT and not LOCKED.
  - H007 is correctly a HYPOTHESIS.
  - C025 is faithful to Package A. Keeping the numbers out of the Canon is correct: the Founder framed them as revisable, §3 keeps operational parameters out, it preserves a single source of truth, and authority stays with the Founder. Its PDR pointer is currently untrue (RA-01).
- **DI-02:** derivable; no Founder decision needed.
  - The Founder decides strategic launch priorities, which follows from §2.
  - Product/UX proposes, following "Produto" in O011 and the Canon's existing "X propõe; Founder decide" pattern (O001, O004, O005, O012).
  - The delegation sentence recognizes only a delegation the Founder makes.
  - Corroborated by the FG-3 framing the Founder accepted. The ruling's medium confidence is not recorded (RA-05).
- **DI-05:** faithful.
  - C021's "agregados e/ou consentidos" and Founder principle 5 ("sem consentimento apropriado") both admit showing a consenting member.
  - The FG-2 accepted cost corroborates the reading.
  - The non-participation protection follows from "qualquer dado privado", L017 and §15.
  - A possible narrowing remains (RA-08).
- **DI-04:** preserved; nothing weakened or extended.
- **No promotion:** PASS. Caveats in RA-04 and RA-05.
- **Recoverable history:** PASS. The snapshot is byte-identical. One stale statement (RA-11).

## Findings (all non-blocking; RA-10 was merged into RA-05(b))

| ID | Change | Issue | Resolution | Owner |
| --- | --- | --- | --- | --- |
| **RA-01** (condition before publication) | CH-07 / CH-23 | C025 says the values are "registrados no Product Decision Register". That is false at PDR `18be6924…`, which has no Package A or RESOLVED entry for FG-2 | The PDR records "RESOLVED — Package A" with the values as presented ("até 3"; "até cerca de 8") and a reference to `founder-gate-phase3-decisions.md`, before READY or publication | Product/UX via the Chief; PCG confirms the pointer |
| RA-02 | CH-02 × C025, CH-18 | The new §2 "pode" rule does not separate the system's own discretion from a right a decision grants to people. This could demote the Founder's FG-2 creation right and multi-Crew participation. The §31 row protects size and cap, but not the creation right | Limit the "pode" rule to discretion, or state that a permission granted to people by a decision binds the product not to deny it. Optionally add the creation right to the §31 row | PCG |
| RA-03 | CH-03 / CH-06 (L023) | "tem esse alcance" sits next to examples (placeholder, announcement) of support at any level. A D011 placeholder could be read as an L023 violation, but the Founder's placeholder ban belongs to the four sports' phasing (C024) | State that the breadth concerns the means of representation, and that L023 is triggered only by representation as fully supported | PCG |
| RA-04 | CH-06 (§7.1 opening) | §7.1 says it reads L023, C023, C024 and D011, but its Release Scope and decision-rights text reads O011, §2, D002, D010, C019 and O012. A reader could give LOCKED authority to an INFERRED allocation of decision rights | List O011 and §2 among the clauses read, or state that the paragraph carries O011 and §2 authority | PCG |
| RA-05 | Delta CH-06 / CH-12 / CH-24 | (a) The ruling confidences are not carried over: R-DR-45 medium; R-DR-43 medium-high for C023. (b) SEC-J-10 is labelled as authority, but it is a Security position "for PCG to decide". (c) Corroborations are not cited: the FG-3 framing and the FG-2 accepted cost | Record these in the delta; no Canon text change | PCG |
| RA-06 | CH-06 / CH-20 | R-DR-43 condition 3 says keeping a C023 sport at context level "sem prazo" needs a Founder decision. The draft softens this to "como estado final, sem sequenciamento" without recording the change | Align the wording, or record the deliberate difference and why | PCG |
| RA-07 | CH-10 | "é apropriado quando [three conditions]" reads as a sufficient standard, which closes the Founder's open term | Frame the three as necessary minimum conditions, with concrete criteria left to C026 | PCG |
| RA-08 | CH-12 (C021 reading) | The per-member framing could let a consenting member lose protection against inference of other private data | Tie the consent to the specific data, purpose and destination | PCG; Security confirms when closing SEC-J-10 |
| RA-09 | CH-07 | (a) The basis for the contact-book exclusion drops SEC-J-03 and claims LOCKED authority. (b) H006 is attached to both values, but the record ties it only to size | Classify the exclusions as INFERRED from L012/L014 via SEC-J-03 and accepted in FG-2; scope H006 to size | PCG |
| RA-11 | Delta §11 | The delta says the minimum age is "still pending the Founder", but the record already holds "18+, como Runna (Recomendado)" | Update the line; there is no Canon impact | PCG |

## Limitations (auditor)
- **Scope:** a single auditor in a single pass. Fidelity and epistemic status only.
- **Beyond the dispatched PDR scope:** the auditor also read the PDR §3 FG-2 entry and searched for FG-2 / Package A, to verify the O006 link and the C025 pointer.
- **Not read:** PTM, PDM, UX-J and the 2.0.0 history. DI-02 derivability was judged from §2, the O011 text, the Canon's existing pattern and the corroborating records.
- **Checks:** the auditor ran its own diff and line-hash checks, not the author's script.
- **Timestamps:** the Founder record's times are approximate.
- **Overlap:** RA-02, RA-03, RA-04 and RA-07 overlap DOCTRINE_INTERPRETABLE and are raised for their effect on fidelity only.

---

# Round 2 — delta re-audit after PCG correction round 1 (2026-10-10, same auditor instance)

| Field | Value |
| --- | --- |
| Inputs | Draft `724834fbe39cd1467a5e61fd54d9aae3e025e4afffbcb0945a9db49027ae810e`; delta `d86d8c93…5878`; snapshot/canon `4d4ccb65…`; PDR-0.4.1 `51271643…79ca`; Founder record `bd1758a6…` (all verified) |
| Verdict | **PASS.** RA-01 is CLOSED. RA-02 to RA-09 and RA-11 are resolved faithfully. 4 new non-blocking findings, RA2-01 to RA2-04, all owned by PCG. No LOCKED meaning changed; no Founder decision invented; no promotion. O013 and O014 leave their substance undecided. Not EVIDENCE_SUFFICIENT |
| Integrity | Auditor's own line-hash check: 33/33 identical (L001–L023, C016–C023, D010, D011). 79 unique IDs = the 72 earlier ones + C024–C027, H007, O013, O014. No LOCKED ID added |
| Route | resumed instance, claude-opus-5-5 / xhigh; 0 file writes |

## Checks of the new content
- **RA-01:** the PDR now holds "FG-2 — Fronteira da Crew (O006) · RESOLVIDO (Founder, 2026-10-10)". It quotes "Pacote A (Recomendado)"; rows 1–5 match the record ("Até 3"; "até cerca de 8 … H006"; either role may create; nominal invite plus the inviter's confirmation; the invite object enrolls no one); it lists the exclusions and the reference. The new §3 subsection matches the record for market, languages, platforms and 18+. The C025 pointer is now true.
- **O013:** correctly an OPEN QUESTION, with the substance undecided. Founder ownership follows from L023, C023, C024, the O011 split and §28. Side effect: until it is decided, no Release Scope or architecture may adopt a limited representation, though design exploration stays open (§32).
- **O014:** correctly left open; Founder ownership invents no authority. It partly overlaps C024 (RA2-01).
- **§2 "pode" scope:** faithful. The only affirmative "pode" uses that grant something to people are §6, the L008 test in §11, L010 and C025, so nothing new becomes binding.
- **End-state rule:** derivable from C023's "sem nova decisão explícita do Founder", the Founder's phasing permission and R-DR-43(3). The order "the Founder decides, then PCG records the C023 revision" is acceptable.
- **Unclear-case rule:** derivable. It routes decisions; it does not hand anyone decision power. It matches R-DR-11 (high confidence).
- **PCG as classifier of C025 changes:** derivable from §2. Observation, not a defect: C025 and C023 word their timing differently.
- **R1-08 correction:** the auditor confirms CH-06 is derivable from L003, L004, C012, the §7 sentence and C023 with the phasing permission. In round 1 it had said that only for the DI-02 split.

## New findings (all non-blocking, owner PCG)
- **RA2-01** · O014 against C024. The Founder's sports record, carried in C024, already places the minimum-credible-coverage determination inside Release Scope. Fix: frame O014 inside C024. What is genuinely open is who sets the criteria within the Release Scope split, and who verifies before a full-support declaration.
- **RA2-02** · §7.1 opening sentence. The "somente" list of clauses read omits L023 and C023, which the "Limites do Release Scope" paragraph applies. Read as exhaustive, it would downgrade an application of L023. Fix: add L023 and C023 for that paragraph, or add "e as cláusulas que cada frase cita".
- **RA2-03** · Delta basis for R1-03. R-DR-43(4) only calls ignoring an activity "desfavorecido". The stronger rule rests on L003, L004, C012 and the §7 sentence. Fix: correct the basis in the delta; no Canon change.
- **RA2-04** · "Aprovar um Release Scope não equivale a essa decisão". Read categorically, it would refuse an explicit Founder end-state statement made inside a Release Scope approval. Fix: "Aprovar um Release Scope, sem decisão explícita sobre aquela modalidade, não equivale…".

Limitations: no mechanical round-0 to round-1 diff, because the round-0 draft was overwritten. The auditor checked the declared scope against the before/after quotes in §14, its own round-0 reading, and spot checks of hunks outside that scope. The PDR read was limited to DR-22, §3 FG-2 and the new §3 subsection. Fidelity only.
