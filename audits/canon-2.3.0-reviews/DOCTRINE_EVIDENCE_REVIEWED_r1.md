# DOCTRINE_EVIDENCE_REVIEWED — VILUMO-PTC-2.3.0 draft, audit round 1

| Field | Value |
| --- | --- |
| Gate | DOCTRINE_EVIDENCE_REVIEWED (PRODUCT_GOVERNANCE rubric 1.2.0, Research auditor); evidence_policy = doctrine_audit |
| Artifact | Draft `13f3116d494b7885d2877118210312bf6af10cf942c8ce06cac288ac974fd65f`; delta `74384a80…4177`; snapshot `5c780fdc…` (= canon 2.2.0); Founder record `1db720f2…ef27` |
| Verdict | **PASS, no condition.** 4 non-blocking findings (RA3-01 to RA3-04). Not EVIDENCE_SUFFICIENT; H008 remains unvalidated |
| Auditor | The same independent research-evidence-strategist instance as for 2.2.0. It is not the PCG author and wrote no files. It disclosed that it judges resolutions of its own RA2 findings |
| Route | claude-opus-5-5 / xhigh. Interrupted by HTTP 429 at about 09:54 before starting; resumed 14:31 |
| Integrity | 37/37 protected lines identical (L001–L023, C016–C027, D010, D011). Only O014 changed among existing defining lines and rows. 91 unique IDs = 79 earlier + C028–C037, H008, O015. No LOCKED ID added. The name Pierre does not appear. All 10 diff hunks map to CH-01..19 |
| Date | 2026-10-11 |

## Fidelity per item (auditor's verdicts)
- **C028:** OK. The text is the Founder's verbatim. "Home" → "experiência inicial" is faithful: it is the Founder's own term for the entry in principle 1, it obeys "não fixa … nomes de destinos", and it is not weaker.
- **C029:** OK.
- **C030:** OK. The five tasks become members of a class, following the Founder's instruction to separate principles from examples. "Frequentes" is his own word (principle 6). The D004 qualifier for food logging is correct.
- **C031:** OK. It adds only language and controls per sport. Applying it "conforme o Release Scope a inclui" harmonizes it with C024, which is also a Founder clause.
- **C032:** the role statement is OK, and its limits are derivable. The wording of "contratos existentes" has an issue (RA3-01). The L022 argument is sound at product level (see RA3-02).
- **C033:** OK. It uses the Founder's exact verbs.
- **C034 and C035:** OK.
- **C036:** OK. The "reencontrar" guard is faithful.
- **C037:** the clause is OK, and keeping the name out of the Canon is defensible. The reading's generalization has an issue (RA3-04).
- **H008:** a correct HYPOTHESIS (ASSUMED). The Founder decided a goal, not the effect; this follows the C016→H007 pattern.
- **O015:** the class is correct, because the missing decision is real (2.2.0 has no agent, autonomy or confirmation doctrine). The premise and the Founder trigger have issues (RA3-01).
- **Incorporation instructions:** met.
- **RA2-01 to RA2-04:** resolved (RA2-03 in the delta only). **DI3-02 and DI3-03:** resolved. **DI3-01:** partly resolved (RA3-03).
- **The new rules:** the §2 "pode" scoping, the end-state rule, doubtful-case routing and PCG as classifier are all derivable, not invented strategy.

## New findings (all non-blocking)

| ID | Item | Issue | Resolution | Owner |
| --- | --- | --- | --- | --- |
| **RA3-01** | C032, O015 | The Founder wrote "Respeite os contratos *existentes* de confirmação e autonomia" (plural, already existing). C032 points only to the future O015, so a Phase 4 reader could think existing rules do not bind the agent yet. Rules covering part of the intent already exist: L014/C021 consent per purpose and destination, L007 engine authority, and PDR R-DR-10 person's agency and I5. Only the agent-specific confirmation, undo and autonomy rules are missing (OBSERVED gap). O015's Founder trigger is narrower than §2 | (a) C032: "respeita os contratos existentes de confirmação e autonomia (VFT-L007, VFT-L014, VFT-C021); a especificação própria do agente é VFT-O015". (b) Align the O015 Founder trigger with §2. (c) The delta records that the Founder's premise was only partly met, and the Chief tells the Founder at READY, as information, not as a request for a decision | PCG (a, b); Chief (c) |
| RA3-02 | §31 new row 2, C032 reading | The row cites L022 for behaviours that are only CURRENT obligations (a single task depending on conversation, lost stable references, a hidden error), which pushes CURRENT up to LOCKED authority. The reading also misquotes "camada de IA"; L022 says "soma de produtos com uma camada de IA ou social" | Cite L022 only for dependence at product level; quote L022 accurately | PCG |
| RA3-03 | §13 DI3-01 paragraph | (a) The role-neutral "mechanics" category is open-ended. Conditions that materially shape entry friction (C004) or acquisition (C003) are Founder matters (§2; R-O005). (b) The Founder chose 5(b) and accepted its costs, so never offering the projectable invite object as product policy would in effect select the rejected option | (a) Limit the mechanics category to abuse prevention and security; route conditions that materially shape participation or acquisition to the Founder. (b) Never offering the invite object, as opposed to deciding when to offer it, needs a Founder decision | PCG |
| RA3-04 | C037 reading | "outras referências … não autorizam copiar interface" is categorical, but the project rule is "treat them only as the type of reference explicitly provided", and the Founder may provide Design System fragments | "não autorizam, por si, copiar interface; vale apenas o tipo de uso explicitamente indicado pelo Founder" | PCG |

Limitations (auditor): single pass; fidelity and epistemic status only. The PDM and current PDR were not read; R-DR-10 is cited from the 2.2.0-audit reading of PDR §6. The author's check script was not run; the auditor ran its own diff and line-hash checks. The role ID in `registry/routing.json` was not verified.
