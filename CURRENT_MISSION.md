# CURRENT_MISSION — V1 Freeze Sync → Targeted UX Delta → Visual/UI Exploration

Revision **MISSION-VISUAL-1.0** · opened 2026-10-19 America/Sao_Paulo · Founder-authorised directly in the current Claude session. The previous mission (Detailed UX Specification, COMPLETE_DOCUMENTARY_SPECIFICATION) is preserved in commit `6d4a153` and in `audits/ux-spec-2026-10-18/`.

**IMPLEMENTATION_AUTHORIZED = NO (production) · VISUAL_DIRECTION_AUTHORIZED = YES · FIGMA_AUTHORIZED = YES (official deliverable) · PRODUCTION_CODE_AUTHORIZED = NO.**

**Official design deliverable (Founder addenda 2026-10-19, persisted in [UXS §24.1 VIS-01–09](product/UX_SPECIFICATION.md) and RS §Transversal):** V1 primary platform = MOBILE / IPHONE / IOS. Figma is the design source of truth: [Vilumo Fit — V1 Product Design](https://www.figma.com/design/NeaZKGCzHMy6IHc47cVEHs) (file key `NeaZKGCzHMy6IHc47cVEHs`). HTML in `explorations/visual-v1/` is internal exploration only and is not a deliverable.

**Approved visual direction (Founder, 2026-10-20):** S1.2 · Selective Maturity, with judgment rules persisted in [UXS §24.2 VIS-10–15](product/UX_SPECIFICATION.md). It is now locked (VIS-16). The explorations (S1 baseline, S1.1 rejected, S1.2 approved) and Candidate A are preserved in Figma page 07 Archive / Deprecated. Figma pages: 01 Foundations · 02 Components · 03 Final V1 Screens · 04 Flows / Prototype · 05 Shareable Outputs · 06 States / Edge Cases · 07 Archive / Deprecated.

**Hardening phase (Founder, 2026-10-20) — revision MISSION-VISUAL-1.1.** VISUAL DIRECTION IS LOCKED (S1.2 + approved onboarding r2). This phase allows only polish, consistency, real-data stress testing, edge states, component and design-system hardening, motion principles, prototype golden paths, iOS QA and handoff. Changes to the palette, identity, surface philosophy, main typography, navigation, dark-first direction, level of richness or Today/Week/Workout/Progress architecture need Founder approval. There is no new direction or exploration. Rules are in [UXS §24.3 VIS-16–20](product/UX_SPECIFICATION.md). Done when the hardening definition of done holds: consistent direction, polished onboarding, strong first value, consolidated components, edge states, stress scenarios A–J passing, prototype flows A–F, dark validated, light sufficient, minimum accessibility checks, organized Figma and implementable handoff.

## Objective
1. Integrate the Founder/Work V1 Product Freeze (`87537c8`, combined patch) without checkout or reset. Done in `32b7fb6`, see [integration record](audits/v1-freeze-sync-2026-10-19/INTEGRATION_RECORD.md).
2. Classify only the targeted UX delta. Done in [UX_DELTA](audits/v1-freeze-sync-2026-10-19/UX_DELTA.md).
3. Materialise the product visually **in Figma** (iPhone frames, dark-first/light-ready tokens, components with variants, states, flows): a first vertical slice (onboarding goal priority, first value, Today, Week, workout execution Run + Strength, Progress L1–L3, shareable output) that establishes visual language, hierarchy, navigation, density, typography, cards, motion principles, Run vs Strength treatment, analytics and plan trust.

## Inputs
Canon PTC-3.2.1 and the products listed in [CANONICAL_INDEX](canon/CANONICAL_INDEX.md); active UX [UXS-1.1-FREEZE-r2](product/UX_SPECIFICATION.md) §24 design space. Visual references are allowed only when the Founder explicitly provides them.

## Prohibited
Production app code, backend, billing integration, provider connections, new research or discovery, reopening frozen decisions, invented physiological thresholds or clinical claims presented as product truth (prototype values are illustrative), Crew/social hub, Nutrition module, legacy Vilumo material.

## Routing
Chief T2/R2/L2. UI & Experience Designer authors the exploration. Product/UX checks conformance to UXS only where the visuals touch structure. There is no large judge cycle. The Founder judges "is this what we want to build?".

## Completion and hard stop
Stop after the visual slice exists and is reported to the Founder. Implementation, design-system freeze and any build decision are separate Founder decisions.


<!-- TDF_HUMAN_REVIEW_START: TDF-HR-0.2-r1 -->
## Documentary follow-up — Training Domain Foundation 0.2 / 2026-10-22

Current direct Founder request authorizes candidate integration and a bounded G01/G02 human-review package. [Candidate 0.2](product/candidates/training-domain-foundation/0.2/README.md) is **CANDIDATE / NON-AUTHORITATIVE · READY WITH FIXES FOR DELIMITED HUMAN REVIEW · NOT PRODUCT/DOMAIN TRUTH**. [Start the human review](reviews/human-domain-review/training-domain-foundation-0.2/00_REVIEW_BRIEF.md); [provenance/audit](audits/training-domain-foundation-0.2/README.md). This appendix does not change the completed experience-decontamination decision above.

G01–G04 remain HUMAN_REVIEW_REQUIRED; S01/S02/S05/S12/S13/S14/S28/S29 remain QUESTIONABLE; C1–C6 remain sporting-open. Next owner: Founder allocates a qualified human training professional to review population/scope and the controlled lower × threshold pair. Item-level decisions must identify population, rule/version, rationale, conditions and reviewer credentials. No promotion, gate closure, runtime, Figma edit or change to Product Truth/AE/Run/Strength is authorized or inferred from preparing this packet. Status/evidence and final documentary disposition live in the linked audit; future sessions should read the review brief for this follow-up only.
<!-- TDF_HUMAN_REVIEW_END: TDF-HR-0.2-r1 -->
