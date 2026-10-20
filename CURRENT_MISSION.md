# CURRENT_MISSION — V1 Freeze Sync → Targeted UX Delta → Visual/UI Exploration

Revision **MISSION-VISUAL-1.0** · opened 2026-10-19 America/Sao_Paulo · Founder-authorised directly in the current Claude session. The previous mission (Detailed UX Specification, COMPLETE_DOCUMENTARY_SPECIFICATION) is preserved in commit `6d4a153` and in `audits/ux-spec-2026-10-18/`.

**IMPLEMENTATION_AUTHORIZED = NO (production) · VISUAL_DIRECTION_AUTHORIZED = YES · FIGMA_AUTHORIZED = YES (official deliverable) · PRODUCTION_CODE_AUTHORIZED = NO.**

**Official design deliverable (Founder addenda 2026-10-19, persisted in [UXS §24.1 VIS-01–09](product/UX_SPECIFICATION.md) and RS §Transversal):** V1 primary platform = MOBILE / IPHONE / IOS. Figma is the design source of truth: [Vilumo Fit — V1 Product Design](https://www.figma.com/design/NeaZKGCzHMy6IHc47cVEHs) (file key `NeaZKGCzHMy6IHc47cVEHs`). HTML in `explorations/visual-v1/` is internal exploration only and is not a deliverable.

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
