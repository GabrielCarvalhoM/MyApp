# CURRENT_MISSION.md — Vilumo Fit PRE-IMPLEMENTATION

## Objective and authority

Take the new clean-room Vilumo Fit product from its Canon to `FIGMA_READY_TO_DEV` and `TECHNICAL_HANDOFF_READY`, then STOP before any implementation.
Product authority begins at `canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md`; `canon/CANONICAL_INDEX.md` records the approved sources. This mission specifies work and acceptance, not new product doctrine.
The Founder authorized this mission and retains strategic and subjective decisions reserved by the Canon and Agent Contracts. Do not silently change pillars, invariants, product identity or scope authority.

## Execution and boundaries

Use the globally installed architecture, not a methodology recreated in this repository. Claude entry: `C:/Users/carva/.claude/agent-system/README.md`. Codex entry: `C:/Users/carva/.codex/agent-system/README.md`.
The Chief / Orchestrator coordinates this mission, discovers available specialists and their Agent Contracts, and applies the installed routing, ownership, review, research, escalation and gate rules.
The Chief may compress, combine or mark phases `NOT_APPLICABLE` with a reason under the global proportional execution policy, without losing any necessary outcome or bypassing a required dependency or competent approval. Outcomes are coverage requirements, not a demand for one document or agent per phase.
Execution level applies per task, material decision, work unit or gate; the program has no inherited overall L4. Future Founder decisions raise only the actual reserved decision when needed. Each material Claude dispatch records execution level, owner/judges, model route/reason and effort under the global policy; already authorized decisions do not require renewed approval.
Keep decisions, handoffs, evidence and executed evaluations in this project/session. Create only necessary artifacts; maintain a clear canonical index and avoid competing sources of truth or empty folder structures.

Allowed: Canon ingestion; product/domain/experience/UX/brand/design work; necessary bounded research; Figma low/high fidelity design, components and prototypes; audits; documentation-only technical planning and handoff.
Prohibited: product implementation, application initialization, implementation repositories, scaffolding, Expo/React Native/Flutter setup, frontend, backend, databases, authentication, APIs, executable product components or design tokens in code.
Technical recommendations and conceptual contracts are specifications only. Neither a stack recommendation, approved design nor a completed handoff grants implementation authorization.
Do not recover, inspect, import, infer from or reuse previous Vilumo products, repositories, documentation, Figma, code, backlogs, contracts or historical decisions unless the Founder explicitly authorizes a specific artifact. Absence of information never permits legacy recovery.

## Starting and recording progress

Read this mission and the local canonical index, verify the contract exists, then read the contract in full before dependent decisions. A missing, ambiguous or conflicting Canon blocks dependent work; do not substitute an audit, READY report, draft or historical baseline.
Verify actual agent and tool availability, including Figma access before Figma work. Missing capability is a concrete blocker for dependent outcomes; continue authorized independent work and never declare Figma complete from written descriptions alone.
Record artifact revisions, owners, gate verdicts and current evidence in a necessary project artifact or existing record. Gates report `PASS`, `FAIL`, `BLOCKED` or justified `NOT_APPLICABLE`; unassessed gates are pending, never inferred PASS. Completion requires current evidence and the competent reviews required by the installed system.
The bootstrap files do not execute this mission or prove any downstream gate. Initial state: `MISSION_STATUS = NOT_STARTED`, `PRE_IMPLEMENTATION_COMPLETE = NO`, `IMPLEMENTATION_STARTED = NO`, `IMPLEMENTATION_AUTHORIZED = NO`.

## Required outcomes and gates

### 1. CANON INGESTION

Read the Product Thesis Contract in full. Operationalize Product Definition, Pillars, Invariants, Current Product Decisions, Design Spaces, Hypotheses, Open Questions, Non-goals, Anti-patterns, Privacy constraints, Incentive principles, Thesis Violation Criteria, Architectural implications and Product/UX implications.
Preserve clause identities, distinctions between obligations and hypotheses, and decision owners/triggers. Produce only the necessary translation artifact, suggested `PRODUCT TRUTH MAP`; it must trace back to the Canon and cannot become a competing thesis.
Gate: `CANON_INGESTED`.

### 2. PRODUCT DOMAIN MODEL

Define actors, participation modes, domains, boundaries, core entities, relationships, lifecycle/state, authority, conceptual permissions, information boundaries and cross-domain dependencies.
Represent Adaptive Performance and Social Continuity correctly as first-class pillars and define their relationship. Include Athlete Model, Adaptive Engine, Recovery, Nutrition Context, Training Context, Goals, Load, Schedule, Crew, Full Member and Crew Member when relevant.
Respect integrated product value, domain responsibilities, individual value and asymmetric participation; a named concept is not automatically a launch entity or feature.
Represent the minimum first-class sport set (C023): Running, Cycling, Swimming and Strength Training. Respect abstract Sport Depth (L023), additional sports as Design Space (D011), and separate release sequencing. Cover affected Athlete Model/sport boundaries and Recovery/Nutrition/multi-sport responsibilities without inventing detailed sport mechanics prematurely.
Gate: `DOMAIN_MODEL_APPROVED`.

### 3. PRODUCT DECISION GATE

Classify gaps as `AGENT-RESOLVABLE`, `EVIDENCE-REQUIRED`, `FOUNDER-DECISION` or `LATER DESIGN SPACE`, with dependency and decision owner. Do not ask the Founder questions competent specialists can resolve.
Use a Founder Gate only when necessary. Present the question, why a decision is needed now, alternatives, trade-offs, recommendation and consequences. Preserve later design space when it does not block the required outcomes; do not invent strategic decisions to close gaps.
Gate: `PRODUCT_DECISIONS_SUFFICIENT`.

### 4. PRODUCT ARCHITECTURE

Define topology, information architecture, navigation, object hierarchy, entry points, modes, surfaces, progressive disclosure and cross-pillar interactions, without final visual styling.
Cover states, errors, degraded confidence, interruption, adaptation, recovery, return and permission-sensitive behavior. Show how the integrated product works for individual value and social participation without forcing every concept into a separate destination.
Consider the Canon's transversal Shareability & Social Projection capability (C016–C022/D010). At the appropriate architecture stage, cover SHAREABLE OBJECT MODEL within the existing architecture: individual/collective, internal/external, exposure, consent, narrative, customization and format/destination implications. Preserve ontology and release scope as design space; do not create a mandatory catalogue of examples.
Gate: `PRODUCT_ARCHITECTURE_APPROVED`.

### 5. EXPERIENCE MODEL

Specify intent, trigger, action, feedback, adaptation, progress, interruption, return, uncertainty, social coordination and continuity.
Validate `SINGLE-PLAYER VALUE`, `MULTIPLAYER EXPANSION`, `ASYMMETRIC MULTIPLAYER`, `APPROPRIATE PROGRESS` and `RETURN`. Recovery, rest and adaptation can be appropriate progress; the social experience must respect the personal engine and consent.
Gate: `EXPERIENCE_MODEL_APPROVED`.

### 6. CORE FLOWS

Specify only flows necessary for the accepted product scope. Each applicable flow covers trigger, context, preconditions, primary/alternate paths, empty, failure, partial/degraded information, interruption, adaptation, recovery, return, feedback, permissions, privacy and cross-pillar behavior.
Trace flows to outcomes and decisions; expose unresolved dependencies instead of filling them with implementation assumptions.
Gate: `CORE_FLOWS_APPROVED`.

### 7. RELEASE SCOPE

Classify capabilities as `THESIS-CRITICAL`, `LAUNCH-CRITICAL`, `LATER DEPTH`, `EXPERIMENTAL` or `RESEARCH-DEPENDENT`. Separate approved concepts from mandatory launch features and resolve strategic priorities through their authorized owners.
Define what this design/handoff covers, what is deferred and why, and what requires evidence. Preserve both pillars and credible depth for any modality declared fully supported.
The four required sport domains define intended product scope, not simultaneous launch or identical launch depth. Determine minimum credible coverage, sequencing, dependency order and progressive depth per sport; preserve L023 and do not use placeholders/incidental tracking to erase C023. Additional sports remain Design Space. Route relevant flows, Figma states and future technical handoff only when those artifacts are produced or materially affected.
Gate: `RELEASE_SCOPE_APPROVED`.

### 8. UX SPECIFICATION

Define screen inventory, purpose, hierarchy, content requirements, actions, inputs/outputs, entry/exit, states, transitions, rules, validation, feedback, errors, permissions, privacy-sensitive presentation, accessibility and platform behavior.
The specification must give Engineering sufficient behavioral decisions for the accepted scope while leaving implementation choices to the proper owner.
Gate: `UX_SPEC_READY`.

### 9. LOW-FIDELITY FIGMA

Author the necessary low-fidelity Figma views and validate information architecture, hierarchy, navigation, relationships, density, flow, progressive disclosure and states. Visual references must not force architecture.
Product/UX Architect reviews the structural experience under the installed review rules. Retain Figma links/node references and applicable validation evidence.
Gate: `UX_STRUCTURE_VALIDATED`.

### 10. FOUNDER EXPERIENCE INTENT

Record this Founder intent before Visual Direction: modern, contemporary, refined, mature; pleasurable to use; perceived quality is a product requirement; dark-first, light-complete; minimalist, not simple; delight with purpose.
Avoid generic AI aesthetic, generic SaaS, dashboarditis, card excess/nested cards, gratuitous gradients/glass, artificial futurism, fitness cliché, generic wellness, childish gamification, administrative coldness and Dribbble decoration without a system.
Formalize: `Minimalism means disciplined hierarchy and purposeful reduction, not visual emptiness or lack of character.`
This intent guides the manifestation; it does not override product authority or structural UX decisions.

### 11. FOUNDER VISUAL INPUT GATE

Only after `UX_STRUCTURE_VALIDATED = PASS`, explicitly request/ingest Founder references as `EXPERIENCE REFERENCES`, `VISUAL REFERENCES`, `PRESERVATION REFERENCES`, `NEGATIVE REFERENCES`, `MOTION REFERENCES` or `BRAND REFERENCES`. Do not request this pack earlier or mine past products for it.
For every reference analyze `WHAT IS DESIRABLE`, `TRANSFERABLE PRINCIPLE`, `NON-TRANSFERABLE EXPRESSION`, `CONFLICTS WITH VILUMO`, `IMITATION RISK` and `VILUMO TRANSLATION`.
When provided: `Pierre Finance is a visual and experience reference, not a product template and not a replication target.` Separate `TAKE / DO NOT TAKE / TRANSLATE`; do not produce “Pierre Finance for fitness.”
Treat screenshots and fragments of a previous Design System as isolated inputs (`VR-001`, `VR-002`, etc.). Do not investigate their origin or automatically open the previous product/Figma. Visual reference != Product Truth.
Pending required Founder references mean `BLOCKED`; do not invent them or claim the gate passed. Continue only independent authorized work.
Gate: `FOUNDER_VISUAL_INPUT_INGESTED`.

### 12. BRAND & IDENTITY

Before freezing the complete visual language, sufficiently verify/resolve naming, logo, app icon, brand personality, identity and possible mascot/personification with appropriate installed agents. Material naming/identity choices remain Founder-owned.
Naming: naturalness, simplicity, pronunciation, memorability, coherence, internationalization, perceived artificiality, conflicts and apparent availability, with evidence limits explicit.
Logo: work small/large, monochrome, dark/light, app icon and wordmark; do not depend on mockups, effects, gradients or clichés.
Mascot/Character: include only for a clear function. Decide function, role, frequency, brand/interface relationship, speech, representation of the system, longevity and infantilization risk. Absence is a valid direction when justified.
Gate: `BRAND_DIRECTION_SUFFICIENT`.

### 13. VISUAL DIRECTION

UI & Experience Designer consumes Canon, Product Architecture, validated UX, Founder Experience Intent, Visual Reference Pack and Brand Direction. Offer genuinely distinct directions when a legitimate choice exists.
Cover Visual Thesis, Emotional Character, Typography, Color Logic, Dark/Light Expression, Surface System, Depth, Motion Language, Imagery/Illustration, Social Expression, Performance Expression, Accessibility, Longevity and Risks.
Use a Founder Visual Direction Gate for genuinely Founder-owned aesthetic preferences, with concrete reviewable choices and their implications.
When applicable to accepted scope, route SHAREABLE VISUAL SYSTEM to UI/Brand after its object/UX baseline: template potential, photo/no-photo, typography/brand/Crew identity, ratios/safe areas, customization, dark/light and useful preview/motion. No obligation to ship all variants; privacy and no-vanity-drift remain required.
Gate: `VISUAL_DIRECTION_APPROVED`.

### 14. DESIGN FOUNDATION

Define typography, spacing, grid/layout, color roles, semantic colors, dark/light mappings, surfaces, depth/elevation, radii, iconography, imagery, interaction states, motion primitives, accessibility rules, platform adaptation and responsive behavior.
Dark-first, light-complete: light is a first-class experience, not an automatic inversion. Author the foundation in Figma/specifications; do not generate design tokens in application code.
Gate: `DESIGN_FOUNDATION_APPROVED`.

### 15. COMPONENT SYSTEM

Build a Figma Design System from real patterns in the accepted experience. Relevant components include purpose, anatomy, variants, states, behavior, content constraints, accessibility, dark/light behavior and responsive/platform behavior.
Demonstrate coverage and reuse in actual screens; do not build speculative component inventories or code components.
Gate: `DESIGN_SYSTEM_READY`.

### 16. HIGH-FIDELITY PRODUCT

Cover, where relevant, first use, populated, empty, loading, error, partial data, degraded confidence, permission denied, interruption, adaptation, recovery, return, social participation, Crew states, privacy-sensitive states and success.
The result must be implementable, refined, coherent and desirable, rather than concept art. Connect actual Figma screens, approved components and behavioral specifications for the accepted scope, including dark/light coverage.
Gate: `HIGH_FIDELITY_COMPLETE`.

### 17. INTERACTION & MOTION

Use motion for causality, feedback, orientation, progress, continuity, state change, social presence and purposeful delight. Specify timing families, transition intent, gestures, interruption, reduced motion and platform-native behavior where necessary.
Provide prototypes where they resolve behavior or handoff uncertainty. Do not implement runtime animations or application components.
Gate: `INTERACTION_MODEL_COMPLETE`.

### 18. CONTENT & TERMINOLOGY

Define navigation labels, actions, adaptive coaching, recovery, nutrition, social, Crew, competition, return, privacy, errors, empty states and celebrations.
Avoid inappropriate medicalization, infantilization, blame or overly juvenile gamification. Keep uncertainty, consent and appropriate progress understandable and terminology coherent across pillars and states.
Gate: `CONTENT_SYSTEM_APPROVED`.

### 19. ACCESSIBILITY & PLATFORM REVIEW

Review contrast, text scaling, touch targets, semantics, screen readers, reduced motion, meaning beyond color, dark/light accessibility and iOS/Android conventions.
Record concrete design/specification evidence and unresolved requirements. This is pre-implementation review; do not claim verification of an implemented application.
Gate: `ACCESSIBILITY_REVIEW_PASSED`.

### 20. CROSS-AGENT PRODUCT AUDIT

PCG reviews thesis compliance, invariants, drift, anti-patterns and unauthorized strategic changes. Product/UX reviews information architecture, navigation, journeys, flows, states, mental models, cross-pillar coherence and completeness.
UI & Experience reviews visual/system coherence, component coverage, interaction, dark/light and polish. Research & Evidence participates only where claims, hypotheses or assumptions materially require it.
Resolve material findings by correction, acceptance by the correct authority, explicit deferral with owner/trigger or escalation. An unresolved required blocker cannot be deferred into a false PASS. Apply installed independence and review rules to current revisions.
Gate: `PRODUCT_AUDIT_PASSED`.

### 21. FIGMA READY TO DEV

Mark readiness YES only when Engineering does not need to invent fundamental Product, UX, UI or Brand decisions. Cover Product, UX, UI, Brand, Prototype where useful and developer Handoff for the accepted scope.
Produce `FIGMA_READY_TO_DEV_REPORT.md` with Figma file/node references, coverage, current gate evidence, decisions, states, design-system mappings and remaining limitations. Written plans or disconnected presentation screens are insufficient evidence of complete Figma.
Gate: `FIGMA_READY_TO_DEV`.

### 22. PRE-IMPLEMENTATION TECHNICAL HANDOFF

Engineering/Architecture may plan, without implementing: system context; application/domain boundaries; data responsibilities; conceptual schemas; API/interface contracts; event taxonomy; authentication/authorization requirements; privacy/security; offline/sync; integrations; observability; analytics/instrumentation; internationalization; unit-system requirements; platform constraints; performance expectations; technical risks; implementation sequencing; stack recommendation.
The Chief routes material trust/privacy boundaries to Security and other specialist concerns according to installed contracts. Recommendations remain documentation; do not provision services, create schemas in a database, initialize a stack or generate executable clients/components.
If a technical constraint requires a Product/UX change, return to the appropriate owner and revalidate affected dependent gates. Do not silently redesign product behavior in the technical handoff.
Gate: `TECHNICAL_HANDOFF_READY`.

## Hard stop

It is prohibited to start implementation in this mission. Do not create/initialize an application, additional implementation repository, scaffolding, frontend, backend, database, authentication, API, components in code or design tokens in code.
Stop when the required pre-implementation outcomes and current gates are satisfied. A concrete blocker pauses only dependent work and must be reported with its owner and next required input; it never permits bypassing a gate or beginning implementation.
Implementation may begin only in a future mission explicitly authorized by the Founder and reflected in `CURRENT_MISSION.md`. Do not automatically rewrite this mission into an implementation mission when design work completes.

## Final state and report

The successful target state below is not the current bootstrap state. Set YES only after the corresponding outcome is proved:

```text
PRE_IMPLEMENTATION_COMPLETE = YES
PRODUCT_CANON_READY = YES
PRODUCT_ARCHITECTURE_READY = YES
UX_READY = YES
FOUNDER_VISUAL_INPUT_INGESTED = YES
BRAND_DIRECTION_READY = YES
DESIGN_SYSTEM_READY = YES
FIGMA_READY_TO_DEV = YES
TECHNICAL_HANDOFF_READY = YES
IMPLEMENTATION_STARTED = NO
IMPLEMENTATION_AUTHORIZED = NO
```

If required Founder references are pending, record `FOUNDER_VISUAL_INPUT_INGESTED = BLOCKED` and `PRE_IMPLEMENTATION_COMPLETE = NO`; dependent readiness stays NO/BLOCKED. Report partial progress honestly. A justified `NOT_APPLICABLE` phase cannot erase a necessary outcome or fabricate an approval.
Produce `PRE_IMPLEMENTATION_COMPLETION_REPORT.md` covering CANON, PRODUCT, ADAPTIVE PERFORMANCE, SOCIAL CONTINUITY, UX, EXPERIENCE, BRAND, UI, AUDITS and TECHNICAL HANDOFF; include every gate's `PASS/FAIL/BLOCKED/NOT_APPLICABLE` verdict, reasons/evidence, owners, deferred items, blockers and explicit actual final state. A report issued while blocked must identify pending gates as BLOCKED, not PASS.
Keep approved Canon, Domain Model, Product Architecture, Release Scope, UX Specification, flows/states, Brand Direction, complete Figma, dark/light system, design foundation, component system, interaction/motion specifications, accessibility, developer handoff and technical architecture handoff identifiable by revision and approval, without requiring a separate file for every item.

## Success condition

A competent Engineering team receives the artifacts above and can conclude:
`Sabemos o que construir, como deve funcionar, como deve parecer e por quê. Não precisamos inventar Product, UX, UI ou identidade durante a implementação.`
When that condition and the applicable gates are satisfied, STOP. `IMPLEMENTATION_AUTHORIZED = NO` remains in force until a future explicit Founder-authorized mission.
