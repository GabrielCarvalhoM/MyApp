# CURRENT_MISSION — Detailed UX Specification

Revision **MISSION-UXSPEC-1.0** · authored 2026-10-18 America/Sao_Paulo · State **COMPLETE_DOCUMENTARY_SPECIFICATION** · closed 2026-10-19 America/Sao_Paulo. Result: UXS-1.0-r3 `598b055d…`, four independent r3 PASS 0/0/0; see [final consolidation](audits/ux-spec-2026-10-18/FINAL_CONSOLIDATION.md). No next mission is open.
Task **UXSPEC-20261018** / contract **UXSPEC-20261018-r1**. The Founder directly authorised this new local mission in the current Claude session. The completed AEOS mission is preserved byte-identical at [baseline](audits/ux-spec-2026-10-18/baseline/CURRENT_MISSION.AEOS_COMPLETE.md) (SHA-256 `aa31d509599972d160fdaa7d7fbb07b152a7485ec8ef820eff36dd4747b842ad`); its publication `VF-AEOS-20261018-001` and the earlier `VF-PREUX-20261015-001` remain valid for their published inputs.

**IMPLEMENTATION_AUTHORIZED = NO · IMPLEMENTATION_STARTED = NO · FIGMA_AUTHORIZED_IN_THIS_MISSION = NO · VISUAL_DIRECTION_AUTHORIZED = NO · PRODUCTION_CODE_AUTHORIZED = NO.**

## Objective

Transform the approved product and engine contracts into one **Detailed UX Specification** at `product/UX_SPECIFICATION.md`: what the person sees, can do, when, what happens next, states, transitions, what is automatic, what requires confirmation, what can be undone, how errors and uncertainty appear and how continuity is kept. The specification must be complete enough for independent structural review and, only after a separate Founder approval checkpoint, to serve as Figma input without reinterpreting contracts.

It is a downstream consumer, not a new authority. It details [PA-1.1](product/PRODUCT_ARCHITECTURE.md), [EM-1.1](product/EXPERIENCE_MODEL.md) and [CF-1.1](product/CORE_FLOWS.md) under [Canon 3.0.0](canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md), [RS-1.1](product/V1_RELEASE_SCOPE.md), [AEC-1.1](product/ADAPTIVE_ENGINE_CONTRACT.md), [PDM-1.1](product/PRODUCT_DOMAIN_MODEL.md), [PDR-1.1](product/PRODUCT_DECISION_REGISTER.md) §§1–6, [AEOS-1.0-r2](product/ADAPTIVE_ENGINE_OPERATIONAL_SPEC.md) and [AESL-1.0-r2](product/ADAPTIVE_ENGINE_SCENARIO_LAB.md). A detail that would require changing an upstream authority is recorded and returned to its owner; it is never applied silently.

## Scope

Seventeen workstreams from the Founder request: information architecture; onboarding/Athlete Model; Today/current decision; Running; Strength; adaptation UX; why/explainability; confidence/uncertainty; user agency; wearables; Nutrition context; Crew Lite; agent/conversational experience; failure/degraded states; continuity; notifications; open dependencies. Required content and acceptance are in the [mission record](audits/ux-spec-2026-10-18/MISSION_RECORD.md).

Not reopened: Running × Strength first-class, Adaptive Engine as core, Nutrition contextual, bidirectional wearable closed loop when technically supported, Crew Lite, one system coordinating the athlete. The engine pipeline (data → normalization/provenance → hard constraints → conflicts → valid candidates → B0 baseline / JEV shadow → policy gate → decision → explanation → preview/confirmation → future executor), JEV in SHADOW and the LLM as optional faithful explainer are consumed as published.

## Prohibited

Visual design of any kind (colour, typography, illustration, design system, composition, pixel layout, visual direction), Figma, screens or wireframes, code, engine/JEV implementation, provider connections or spikes, new market research, rebaseline, thesis changes, invented physiological thresholds, Nutrition doses or clinical copy, invented metrics/targets, and any write to global agent folders. Dependency-bound content stays provisional under [PDR §5 G01–G11](product/PRODUCT_DECISION_REGISTER.md).

## Routing, gates and completion

Chief routing **T3/R3/L3**, documentary productization, autonomy A2/A3 within this scope. Fresh Product/UX Architect worker authors the specification (Opus 5.5 max floor). Independent fresh judges: Product/UX (structure and the 15 requested dimensions), Security (privacy, consent, audience/notifications per PB-F-02/03), AI Systems (agent, explanation, LLM/JEV manifestation per O015/AEOS) and Engineering (wearable/sync/version states and conceptual implementability). Worker ≠ judge; deterministic checks precede reviews; Chief consolidates without issuing another domain's verdict. Research, PCG, Designer, Data, Quality and Release are dispensed with recorded reasons.

Completion: specification + objective preservation/coverage checks + current independent reviews with real findings corrected and revalidated + consolidation + short Founder report (A–R and `DETAILED_UX_READY_FOR_FIGMA = YES/NO`). Canon, the canonical index and all published consumers stay byte-identical; MISSION_LEDGER is append-only.

**HARD STOP:** after the specification, reviews, verification and Founder report. Do not open Figma or begin visual direction even if the answer is YES. Founder approval of the specification and any visual/Figma mission are separate decisions.
