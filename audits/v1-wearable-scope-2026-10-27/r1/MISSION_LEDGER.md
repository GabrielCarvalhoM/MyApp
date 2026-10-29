# Vilumo Fit — Mission Ledger (PRE-IMPLEMENTATION)

Working record of the active mission (`CURRENT_MISSION.md`). Not Product Truth: authority remains `canon/` via `canon/CANONICAL_INDEX.md`. Controlled by the Chief / Orchestrator (current Claude session acting as control plane, constitution 1.5.0).

## Task Contract — VF-PREIMPL / rev 2 (2026-10-10)

- **Outcome:** take Vilumo Fit from Canon to `FIGMA_READY_TO_DEV` and `TECHNICAL_HANDOFF_READY`, then STOP. No implementation.
- **Sources:** `CURRENT_MISSION.md`; `canon/CANONICAL_INDEX.md`; `canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md` VILUMO-PTC-2.1.0, SHA-256 `4d4ccb65b341efc45b88bbf5aa173bb34c2f39452e5f6b85dd3beb6b8ee6dbd1` (Founder-authorized delta; index/review evidence synchronized at publication).
- **Agent system:** `C:/Users/carva/.claude/agent-system` v1.5.0; 12 roles available as native agent types in this session.
- **Tools verified:** Figma MCP (`plugin:design:figma`) authenticated, Pro plan, Full seat, Figma AI enabled (2026-10-09). Asana MCP failed to connect (not required).
- **Authority / autonomy:** Founder-authorized mission → A4 for allowed work; A5 (Founder) reserved for strategy, identity, pillars/invariants, naming/brand, aesthetic preferences, monetization, release priorities.
- **Mode:** productization. **EXECUTION_LEVEL_SCOPE:** per task / material decision / work unit / gate. **PROGRAM_EXECUTION_LEVEL:** NOT_APPLICABLE (container, not a task). Future Founder gates do not raise independent work; the phase table is a planning envelope, each actual task is classified separately.
- **MODEL_ROUTE / EFFORT:** per unit under global MODEL_ROUTING_POLICY; material UX/UI workers and quality judges = claude-opus-5-5/max. Mechanical metadata/copy/recording follows qualified dynamic routing, irrespective of owner. Separate reason/route/effort at each native dispatch; no program max default.
- **Program context (not inherited task risk):** doctrine-bound product, pre-implementation documents/Figma, open questions O001–O012 and outcome dependencies. Each task evaluates its own qualitative Impact / Irreversibility / Uncertainty / Dependencies; context does not impose a mission L.
- **Prohibited:** app init, scaffolding, frontend/backend/DB/auth/API, code components or tokens in code; legacy Vilumo recovery.
- **STOP_WHEN:** all gates PASS/justified N/A with current evidence → reports issued; or blocker with owner/next input.
- **ESCALATE_IF:** thesis conflict (→ PCG/Founder), Founder-owned choice, trust/privacy boundary (→ Security), technical constraint changing UX (→ Product/UX).

## Routing (phase graph)

| Phase | Owner (worker) | Independent judge(s) | Level |
| --- | --- | --- | --- |
| 1 Canon ingestion | product-ux-architect | product-constitution-governance (fidelity, no competing thesis) | L2 |
| 2 Domain model | product-ux-architect | PCG (thesis compliance) + security-privacy-abuse-architect (information boundaries / conceptual permissions, L014/O005) | L3 |
| 3 Decision gate | product-ux-architect classifies; Chief consolidates | Founder only for reserved items | L4 if Founder items |
| 4–8 Architecture → UX spec | product-ux-architect (+ data-analytics for O001/O008 if metrics/incentives specified) | fresh product-ux-architect + PCG; Security where boundaries; **AI Systems & Agent Experience Architect for in-product agent placement, scope and confirmation rules (from Phase 4, added 2026-10-11, hybrid experience decision)** | L2–L3 |
| 9 Low-fi Figma | product-ux-architect | fresh product-ux-architect | L2 |
| 10–11 Founder intent / visual input | Chief records approved intent/input L0; Founder supplies when needed | — | L4 only for actual reserved input/decision; recording L0 |
| 12–18 Brand, visual, foundation, components, hi-fi, motion, content | ui-experience-designer (research-evidence for naming checks) | fresh ui-experience-designer; Founder for reserved choices | L2–L4 |
| 19–21 Accessibility, audit, ready-to-dev | ui-experience-designer / PCG / product-ux-architect | fresh instances per rubric | L2–L3 |
| 22 Technical handoff | engineering-systems-architect | security-privacy-abuse-architect; data/AI if material | L3 |

Excluded until needed: product-engineer, quality-reliability-engineer, integration-release-engineer (implementation prohibited); AI architect only if adaptive engine needs AI-behavior specification at handoff.

## Gate state

| # | Gate | Verdict | Revision / evidence | Owner |
| --- | --- | --- | --- | --- |
| G1 | DOCTRINE_EVIDENCE_REVIEWED | PASS | PTC-2.1.0 `4d4ccb65…`; `audits/claude-canon-update-2026-10-10/reviews/doctrine-fidelity.json` | independent auditor (Codex session) |
| G2 | DOCTRINE_INTERPRETABLE | PASS (2026-10-10 06:00); 7 non-blocking findings DI-01–DI-07 deferred to PCG | PTC-2.1.0 `4d4ccb65…`; fresh product-ux-architect, observed claude-opus-5-5/max 20/20 turns, 0 file writes; `reviews/doctrine-interpretability.json` (prior BLOCKED kept in history) | product-ux-architect (reviewer) |
| G3 | PRODUCT_CONSTITUTION_READY | 2.1.0: PASS (06:02) → published `VF-PTC-2.1.0-…` (superseded). **2.2.0: PASS (16:36) → published `VF-PTC-2.2.0-CANONICAL-20261010-001`, sha256 `5c780fdc…`**; handoff to Product/UX emitted, acceptance pending the Phase 4 unit | `audits/canon-2.2.0-reviews/canon-gate-2.2.0.json`, `publication-event-2.2.0.json`, `canon/CANONICAL_INDEX.md` | Chief consolidated (not author, auditor or reviewer) |
| G4 | PRODUCT_CONSTITUTION_READY (2.3.0: hybrid experience + deferred 2.2.0 findings) | **PASS → PUBLISHED 2026-10-11 14:40, `dc0c5c53…`, event `VF-PTC-2.3.0-CANONICAL-20261011-001`**; 8 non-blocking findings deferred | `audits/canon-2.3.0-reviews/` | PCG author · R&E auditor · UX reviewer · Chief consolidated |
| 1 | CANON_INGESTED | **PASS** on PTM-0.4 `fe954fd9…` (J1′, delta re-review); history: PASS on 0.3 | `audits/phase-1-3-reviews/PCG-J_canon-ingestion-domain-decisions.md` | product-ux-architect (worker) · PCG judge |
| 2 | DOMAIN_MODEL_APPROVED | **PASS on PDM-0.5 `6a5ace35…` / PDR-0.5 `dec6fab3…` under Canon 2.2.0 (2026-10-11 ~10:05)**: UX structural PASS + PCG J2‴ PASS + SECURITY_READY_WITH_CONDITIONS (SEC-J3-01 to 09 carried; SEC-J3-01 and 08 close before PRODUCT_ARCHITECTURE_APPROVED). PDM-0.6 (agent channel, UX-J3-01/05) needs a delta review with PA-0.1. History: **PASS** on PDM-0.4 `20e9e630…` (2026-10-10): UX structural PASS + PCG J2′ PASS + SECURITY_READY_WITH_CONDITIONS (no blocking). History: FAIL on 0.3 → correction loop 1 (attempt 1). Carried non-blocking conditions: SEC-J (13), SEC-J2-01–10, PCG-J2-01–06, UX-J2-01–07. **Due before PRODUCT_ARCHITECTURE_APPROVED:** SEC-J-03, SEC-J-10, SEC-J2-03, SEC-J2-08 (legal). **Due before Phase 5 eligibility:** UX-J2-02 | `audits/phase-1-3-reviews/UX-J_…md`, `SEC-J_…md`, `PCG-J_…md` (incl. delta sections) | product-ux-architect (worker) · UX, PCG and SEC judges |
| 3 | PRODUCT_DECISIONS_SUFFICIENT | **PASS (2026-10-10 ~11:35).**<br>J3′ classification PASS. Founder decisions: FG-2 = Package A; FG-3 = confirm A; market Brazil, PT-BR + EN; platforms iOS + Android; minimum age 18+ (like Runna, after the peer divergence was presented).<br>Deferred with owner and trigger: FG-4, DR-45, DR-46 and the final FG-3 shape → Release Priorities gate before Phase 6.<br>Requested input: a legal memo (non-blocking), due before PRODUCT_ARCHITECTURE_APPROVED, otherwise that approval reopens (SEC-J2-08).<br>Capability gap DR-17 (physiological-safety authority): Chief to route before Phase 22 | `audits/phase-1-3-reviews/founder-gate-phase3-decisions.md`; PDR-0.4 §3, §5 | Chief consolidated · Founder decided |
| 4 | PRODUCT_ARCHITECTURE_APPROVED | IN_REVIEW: PA-0.1 `1e62be94…` + PDM-0.6 + PDR-0.6; judges UX, PCG, SEC and AI Systems (resumed 21:23 after quota) | `product/PRODUCT_ARCHITECTURE.md` | product-ux-architect (worker) · 4 judges |
| 5 | EXPERIENCE_MODEL_APPROVED | PENDING | — | product-ux-architect |
| 6 | CORE_FLOWS_APPROVED | PENDING | — | product-ux-architect |
| 7 | RELEASE_SCOPE_APPROVED | PENDING | — | Founder / product-ux-architect |
| 8 | UX_SPEC_READY | PENDING | — | product-ux-architect |
| 9 | UX_STRUCTURE_VALIDATED | PENDING | — | product-ux-architect |
| 11 | FOUNDER_VISUAL_INPUT_INGESTED | PENDING (not requested before gate 9) | — | Founder |
| 12 | BRAND_DIRECTION_SUFFICIENT | PENDING | — | ui-experience-designer / Founder |
| 13 | VISUAL_DIRECTION_APPROVED | PENDING | — | ui-experience-designer / Founder |
| 14 | DESIGN_FOUNDATION_APPROVED | PENDING | — | ui-experience-designer |
| 15 | DESIGN_SYSTEM_READY | PENDING | — | ui-experience-designer |
| 16 | HIGH_FIDELITY_COMPLETE | PENDING | — | ui-experience-designer |
| 17 | INTERACTION_MODEL_COMPLETE | PENDING | — | ui-experience-designer |
| 18 | CONTENT_SYSTEM_APPROVED | PENDING | — | ui-experience-designer / product-ux-architect |
| 19 | ACCESSIBILITY_REVIEW_PASSED | PENDING | — | ui-experience-designer |
| 20 | PRODUCT_AUDIT_PASSED | PENDING | — | PCG + product-ux-architect + ui-experience-designer |
| 21 | FIGMA_READY_TO_DEV | PENDING | — | Chief consolidates |
| 22 | TECHNICAL_HANDOFF_READY | PENDING | — | engineering-systems-architect |

## Mission state

```text
MISSION_STATUS = IN_PROGRESS (gates 1–3 PASS on 2026-10-10; Canon 2.2.0 editorial + O006 draft in progress; next: Phase 4 Product Architecture)
PRE_IMPLEMENTATION_COMPLETE = NO
IMPLEMENTATION_STARTED = NO
IMPLEMENTATION_AUTHORIZED = NO
```

## Founder Experience Intent (Phase 10, recorded from CURRENT_MISSION.md §10)

Guides manifestation only; does not override Canon or validated structural UX.
- Modern, contemporary, refined, mature; pleasurable to use; perceived quality is a product requirement.
- Dark-first, light-complete; minimalist, not simple; delight with purpose.
- Avoid: generic AI aesthetic, generic SaaS, dashboarditis, card excess / nested cards, gratuitous gradients/glass, artificial futurism, fitness cliché, generic wellness, childish gamification, administrative coldness, Dribbble decoration without a system.
- Formal principle: *Minimalism means disciplined hierarchy and purposeful reduction, not visual emptiness or lack of character.*
- **2026-10-11 Founder decision, hybrid experience** (authority: `audits/founder-decisions/2026-10-11_hybrid-experience-founder-decision.md`; canonical formalization in progress as PTC-2.3.0).
  - It is product doctrine, not only intent: simple contextual entry, direct execution, accessible depth.
  - Its principle 9 (simplicity coexists with visual personality, motion, feedback and finish) is consistent with this intent.
  - **Pierre** is designated by the Founder as an *experience reference for contextual simplicity*. Under CURRENT_MISSION §11 it is not a template and not a replication target, its interface is not copied, and it is not inspected now. Formal reference analysis (TAKE / DO NOT TAKE / TRANSLATE) follows Phase 11.

## Event log

- 2026-10-09 · Chief · INTAKE → GROUNDED → CONTRACT_READY. Canon hash verified; Figma access verified. Phase 1 dispatched to product-ux-architect.

## Canon delta and localized reconciliation — 2026-10-10

Founder decisions already authorized: C016–C022/D010 Shareability & Social Projection;
C023 minimum first-class Running/Cycling/Swimming/Strength, L023 abstract Sport Depth,
D011 additional sports. Two pillars unchanged. No renewed approval of the sport set.
Release sequencing/credible coverage remains separate; no placeholders or generic
tracking used to erase the minimum. Privacy/consent/no vanity drift remain binding.

At initial audit phase-1 output had not arrived. During this update the existing
Architect produced PTM/PDM/PDR 0.1. Their localized source/constraint/registry delta
was aligned to 0.2; the Architect has since produced current 0.3 revisions using Canon 2.1.0. Original drafts are preserved in session work/before/new-downstream. FG-1's
sport-set question is RESOLVED by C023; remaining Founder entries are not decided.
No completed Product Architecture, UX spec, visual/Figma or technical handoff existed
on disk at reconciliation. Obligations for absent artifacts are routed in DR-38–DR-41
and CURRENT_MISSION phases 2/4/7/13, rather than creating speculative new artifacts.

**CORRECTION-01:** affected PTM/PDM/PDR source and sport-set conflict → FIX (localized
canonical transcription; no new design choice). Constraints corrected, ownership and
pending gates retained. **Architect source reconciliation OBSERVED in PTM/PDM/PDR0.3; Chief/gate acceptance PENDING:** inspect current outputs and independent reviews before CANON_INGESTED/DOMAIN_MODEL_APPROVED or any later affected gate. Native worker remains running; do not kill, restart, discard, or assume
that background output has accepted the new Canon. If it overwrites the delta, reapply
only affected clauses after it finishes. Require current independent review for each
material gate. No downstream PASS is claimed from this source synchronization.

Future actual units record EXECUTION_LEVEL / RISK_PROFILE / OWNER / JUDGES /
MODEL_ROUTE / MODEL_ROUTE_REASON / EFFORT / ARTIFACTS_REQUIRED / STOP_WHEN /
ESCALATE_IF concisely; trivial L0 runs directly. Non-fork Agent uses task-route metadata
and version-bound aliases; unsupported route uses exact CLI handoff. Active session
must reread policies/check hook loading. Root/main-session switching, semantic
classification and provider caps are not universally runtime-enforced.

MISSION_RESTARTED = NO; IMPLEMENTATION_STARTED = NO; IMPLEMENTATION_AUTHORIZED = NO.

## Health check — phase 1–3 Architect unit (2026-10-10 00:18)

- **Verdict:** PROGRESSING, not looping. The unit was not interrupted. 41 tool calls; no repeated identical reads (max 3 reads of `CURRENT_MISSION.md`, after it changed on disk). Six writes, each a new revision: PTM/PDM/PDR 0.1 (≈23:52–23:56), then PTM/PDM/PDR 0.3 (00:12–00:17), which reconcile Canon 2.1.0 and CORRECTION-01.
- **Cost signal:** about 37 min of front-loaded reasoning before the first write. Roughly 455k output tokens and about 530k peak context. Full-file rewrites instead of Edits. This is over-analysis risk, not a correction loop. The scope extension was caused by the Canon changing mid-task (legitimate), not by scope creep.
- **Deterministic check:** PTM-0.3 covers 72/72 PTC-2.1.0 IDs. C011/C013/C014 appear only as numbering-gap notes.
- **Gap fixed:** the dispatch had no explicit STOP_WHEN for re-revision. Sent this bounded delta: one check pass, Edit-only fixes, no 0.4, return the handoff, report residuals as findings.
- **Concurrency hazard:** another session edited `product/*.md` and this ledger while the worker was running. The worker merged CORRECTION-01. This session will not touch `product/` until the handoff.
- **[RESOLVED 2026-10-10 00:23:40 — index now declares PTC-2.1.0 / `4d4ccb65…`, verified at post-Codex sync]** **FINDING CANON-INDEX-01 (blocks CANON_INGESTED):** `canon/CANONICAL_INDEX.md` still declares PTC-2.0.0 / `9782e5f0…`, but the contract on disk is 2.1.0 / `4d4ccb65…`. This contradicts rev 2 "index synchronized". Owner: Chief/PCG, with the Founder publication evidence for 2.1.0. Next input: that evidence → index update.

## Architecture and Founder delta completion record — 2026-10-10

Claude architecture 1.5.0: installation PASS, policy 192/192, execution 80/80;
independent engineering judge PASS. Requested native model/effort observed: Sonnet5.5
parent low → Opus5.5 child max; mechanical Designer metadata stays Sonnet/low.
Universal runtime enforcement is NO (documented coverage/caps/semantic/main-session
limits), with verified native Agent request guard. No .codex methodology edits.

Founder decisions are transcribed in current Canon 2.1.0 and working artifacts, with
DOCTRINE_EVIDENCE_REVIEWED PASS. **DOCTRINE_INTERPRETABLE / PRODUCT_CONSTITUTION_READY
= BLOCKED by actual Claude usage_limit_reached**, reset reported 04:00 São Paulo.
No final interpretability verdict exists; do not infer PASS from reads, max effort,
fidelity or the engineering review. No new Founder approval is required. Formal
canonical publication/handoff completion is not claimed. Source index records this
state and current authorized input. Independent work may continue; dependent gate
must await current Opus5.5/max interpretability review and Chief consolidation.

Architect reconciliation has arrived as PTM/PDM/PDR0.3. Their product gates remain
pending and are not approved by this correction task. Current next sync must consume
0.3 (or a newer competent revision), DR-38–DR-46 and existing independent findings;
do not overwrite the Architect's valid changes with 0.2. No mission restart or app
implementation; no automatic commit.

Report/evidence: audits/CLAUDE_CANON_UPDATE_2026-10-10.md and
audits/claude-canon-update-2026-10-10/. Sync prompt: see Codex session outputs.

## Post-Codex sync — Claude Chief session (2026-10-10 ~05:40)

Authorities reread from disk: CLAUDE.md, CURRENT_MISSION.md, CANONICAL_INDEX, PTC-2.1.0 (read in full), agent-system 1.5.0 (CHIEF, CORE, EXECUTION_PROPORTIONALITY, TASK_CONTRACT, MODEL_ROUTING_POLICY, ROUTING, README, model-runtime, guard), PCG constitution, playbook and rubric, and the Architect and Security constitutions. ESCALATION, STATUS and HANDOFF are unchanged since the session start (mtime check).

- **Authority coherence:** contract, index, ledger, publication-state and reviews all cite PTC-2.1.0 / `4d4ccb65…`. CANON-INDEX-01 is resolved. Formal CANONICAL publication is still not claimed.
- **Runtime:** CLI 2.1.296. The PreToolUse guard is registered and fired in this session (additional context observed on dispatch). Env bindings: opus→claude-opus-5-5, sonnet→claude-sonnet-5-5. No FORCE or EFFORT override. A dry run of the guard accepted the dispatch envelope. Universal enforcement remains NO; this main session's direct work is limited to coordination and bookkeeping.
- **Delta audit:**
  - VALID: PTC-2.1.0, the index, CURRENT_MISSION, PTM-0.3 `d1be5cdd…`, PDM-0.3 `9ec7fd63…`, PDR-0.3 `925f68c4…` (hashes equal to the Architect handoff and to final-state-verification), G1 PASS, Founder Experience Intent.
  - LOCAL_UPDATE_REQUIRED: this ledger only (done here).
  - SUPERSEDED: rev 1 "Overall L4" and the statement "native worker remains running" (the worker completed).
  - BLOCKED: G3 awaits G2.
- **Architect phase 1–3 unit:** COMPLETED within the injected STOP_WHEN (one check pass, two targeted Edits, no 0.4). Handoff consumed. No residual delta for that worker.
- **Founder-owned items** are queued for the Phase 3 gate, not asked yet: FG-2 (Crew boundary, O006) and FG-3 (Social launch shape, O011/O012). FG-4 (O009) is deferrable to phase 7.
- **Capability and scope gaps** to route later: DR-17 (no physiological-safety / sports-science authority, before phase 22); R6 (market, locale and platform targets absent from the Canon, before phases 8/18/22).
- **Current unit:** G2 review.
  - EXECUTION_LEVEL L2.
  - OWNER: fresh product-ux-architect reviewer.
  - JUDGES: none (the Chief consolidates G3).
  - MODEL_ROUTE claude-opus-5-5, EFFORT max. MODEL_ROUTE_REASON: Founder floor for Product/UX judges.
  - ARTIFACTS_REQUIRED: [] (the Chief records the verdict).
  - STOP_WHEN: a single-pass verdict with clause-level findings.
  - ESCALATE_IF: hash mismatch or a missing Founder decision.
- **After G2:**
  - If PASS: G3 consolidation by the Chief, then the publication event and handoff record. Then dispatch the independent phase 1–2 judges in parallel (read-only, distinct concerns): PCG for CANON_INGESTED and thesis compliance of PDM/PDR; Security for PDM §8 information boundaries; a fresh Product/UX judge for PDM structure.
  - If FAIL: REQUEST_CHANGES to PCG, then a localized correction loop.

## Governance gate closed — 2026-10-10 06:02

- G2 PASS. The C1–C5 criteria all PASS.
  - Q1 (engine context of a sport below launch depth) and Q2 (C016 is not a launch obligation) are resolved by the text. Q3 (Release Scope decider) is ambiguous and filed as DI-02.
  - All seven findings are non-blocking PCG editorial items. They are DEFERRED with an owner and trigger: the next Canon revision, batched with any formalization of the Phase 3 Founder decisions (for example O006). The latest point is before Phase 4 translation of sport domains, shareables or SOM, and before Phase 7 Release Scope.
  - Interim rule: the PCG phase-1/2 judge rules DR-43 and DR-45 consistently with the DI-01/DI-02 analysis. No downstream artifact resolves them unilaterally.
- G3 PASS. The Chief consolidated it from: the same sha256 across draft, audit and interpretability; two current independent PASS verdicts; no blocking finding; distinct actors; and the Founder authority records.
- Publication event `VF-PTC-2.1.0-CANONICAL-20261010-001` was recorded, and the index was updated.
- The Product/UX handoff was ACCEPTED: PTM/PDM/PDR-0.3 consumed this exact hash with no DOCTRINE_BLOCKED.
- Revalidation rule: any Canon edit invalidates both doctrine reviews for the edited scope.

### Phase 1–2 judge units (dispatched in parallel; read-only; distinct concerns; Chief consolidates)

Common inputs:
- PTC-2.1.0 `4d4ccb65…`; PTM-0.3 `d1be5cdd…`; PDM-0.3 `9ec7fd63…`; PDR-0.3 `925f68c4…`.
- Worker: product-ux-architect, a Claude instance that has completed. Co-author of the 0.2 deltas: Codex /root.
- All judges are fresh instances.

| Unit | Owner (judge) | Level | Route / effort | Reason | STOP_WHEN |
| --- | --- | --- | --- | --- | --- |
| J-PCG: CANON_INGESTED (PTM), thesis compliance (PDM), authority classification (PDR), rulings on DR-43/DR-45/DR-10/DR-11/O005/D011/A8 | product-constitution-governance | L2 | claude-opus-5-5 / xhigh | Doctrine fidelity across about 145 KB with subtle rulings; stronger model materially better; non-UI, so no max floor | Single-pass verdicts and findings returned |
| J-SEC: PDM §8 information boundaries and conceptual permissions, plus related PDR entries | security-privacy-abuse-architect | L3 | claude-opus-5-5 / high | Privacy and abuse reasoning in small private groups; bounded conceptual scope | SECURITY_READY / WITH_CONDITIONS / BLOCKED, with conditions owned and triggered |
| J-UX: PDM structural soundness; structural soundness and necessity of PDR Founder Gate entries | product-ux-architect | L2 | claude-opus-5-5 / max | Founder floor for material IA / mental-model judges | Single-pass verdict and findings returned |

ARTIFACTS_REQUIRED: [] (judges write nothing; the Chief records the verdicts). ESCALATE_IF: THESIS_CONFLICT, a missing Founder decision, a hash mismatch, or a blocking trust boundary.

**J-SEC returned 2026-10-10 (about 3.5 min):** SECURITY_READY_WITH_CONDITIONS for the domain-model boundary scope. No boundary defect requires REQUEST_CHANGES now.
- 15 conditions SEC-J-01 to SEC-J-15, each with an owner and trigger, all non-blocking for DOMAIN_MODEL_APPROVED.
- SEC-J-03 (invite ≠ membership), SEC-J-05 (§8.3 retention rule defect: "deixam de identificá-la" fails in small Crews) and SEC-J-10 (collective shareables in Crews of ≤8) **must close before Phase 4 architecture approval**.
- SEC-J-14 (regulatory classification of health-adjacent data, data-subject rights) is Founder-owned, with legal input, by Phase 4.
- SEC-J-06 escalates to the Founder only if free-text support needs moderation capacity.
- Security position on DI-05 forwarded to PCG.
- Route observed claude-opus-5-5/high; 0 writes.
- Evidence: `audits/phase-1-3-reviews/SEC-J_domain-model-boundaries.md`.

**J-PCG returned 2026-10-10 (about 11.7 min):** J1 CANON_INGESTED PASS · J2 PDM thesis compliance PASS (no DOWNSTREAM_VIOLATION) · J3 PDR authority classification PASS · no THESIS_CONFLICT.
- 12 non-blocking findings PCG-J-01 to PCG-J-12, all Architect corrections.
  - J-01 (the §21.1 "deve transformar" sentence is missing, and the C016 "camada forte" obligation is weakened) **blocks Phase 4 if not fixed before DR-38**.
  - J-02 must be fixed before FG-4 is presented. J-08 and J-11 affect the framing of the FG-2 and FG-3 entries. J-03 and J-04 must be fixed before Phase 5. J-12 overlaps SEC-J-05.
- Rulings (interim governance interpretations until the next Canon revision):
  - **R-DR-43:** context use is allowed under 4 conditions. For a C023 sport the context level is transitional.
  - **R-DR-45:** Product/UX proposes and the Founder decides sport sequencing and launch depth. The timing needs a choice: pull the decision forward, or keep Core Flows sport-agnostic until Phase 7.
  - **R-DR-10:** honouring an indicated recovery ranks strictly above an upward deviation.
  - **R-DR-11:** O012 is Product/UX translation. FG-3 is a Founder decision under O011.
  - **R-O005:** the split is accepted.
  - **R-D011:** three decision tiers.
  - **R-A8:** I9 is one-way, and an invite is not public enrolment.
- Route observed claude-opus-5-5/xhigh; 0 writes.
- Evidence: `audits/phase-1-3-reviews/PCG-J_canon-ingestion-domain-decisions.md`.

**J-UX returned 2026-10-10 (about 18.5 min):** structural **FAIL** on PDM-0.3/PDR-0.3.
- Blocking findings (all localized Architect corrections; no Founder decision, doctrine change or re-architecture; no invariant violated):
  - UX-J-01: the closed I1–I9 set misses flows the model itself needs (outcomes→engine, sport implications, an owner for the prescription/plan, availability vs interruption).
  - UX-J-02: the continuity state machine cannot represent combined conditions, the unlogged-rest rule, or a Crew Member leaving Retornando.
  - UX-J-03: the Crew Member's declared intent has no owner.
  - UX-J-04: pause, departure and closure lifecycles; one pause can demote a 2-person Crew.
- 8 non-blocking findings: UX-J-05 to UX-J-12.
- FG assessment:
  - FG-2 is partly needed before Phase 4: Crews per person and size order shape the IA.
  - FG-3 does not block Phase 4.
  - FG-4 is not needed before Phase 4.
- Route observed claude-opus-5-5/max; 0 writes.
- Evidence: `audits/phase-1-3-reviews/UX-J_domain-model-structure.md`.

### Consolidation (Chief, 2026-10-10)

- CANON_INGESTED = PASS (PTM-0.3).
- DOMAIN_MODEL_APPROVED = FAIL → REQUEST_CHANGES to the Architect. **Correction loop 1** (attempt 1 of 2 before a root-cause reroute).
- PRODUCT_DECISIONS_SUFFICIENT = PENDING (correction, then the Founder Gate).
- Overlaps merged:
  - PCG-J-12 = SEC-J-05 (retention after exit).
  - UX-J-10 ≈ SEC-J-10 (collective shareables in small Crews).
  - UX-J-09 is resolved by the PCG-J-03 labelling principle; no separate PCG ruling is needed.
  - Authority conflict on Crew creation rights: UX suggested DR-33; PCG (owner of authority classification) rules FG-2 (Founder). **PCG prevails**: FG-2 decides who may create a Crew; DR-33 holds the procedure.

**Chief coordination decisions** (within Chief authority: gate composition, phase ordering, defaults that are not reserved):
- **D-CHIEF-01 — Phase 3 Founder Gate composition:**
  - FG-2 Crew boundary (decision): Crews per person, size order, creation rights, real-relationship criteria and discovery within the closed model.
  - FG-3: a non-blocking early confirmation of option A as the working baseline. The final launch shape goes to the release-priorities gate.
  - Launch platforms and market: these shape the Phase 4 surfaces and entry points and the Phase 8/18/22 requirements.
  - FG-4 is deferred.
- **D-CHIEF-02 — DR-45 timing (per R-DR-45):**
  - Phases 4–5 stay structurally sport-capability-based, with no per-sport flow detail.
  - A **Release Priorities Founder Gate** is pulled forward to before Phase 6 Core Flows. It bundles DR-45 (sport sequencing and launch depth), the final FG-3 shape, FG-4 and DR-46.
  - It is based on a Product/UX proposal plus Research credibility criteria (DR-20), prepared during Phases 4–5.
- **D-CHIEF-03 — Regulatory baseline (SEC-J-14):**
  - Until a Founder-provided legal classification exists, Phase 4+ design treats Recovery, Nutrition and body-composition data as sensitive personal data, with explicit, specific, per-purpose consent and minimization.
  - This is the privacy-protective default (L014), within Product/UX and Security authority.
  - The Founder's legal memo is requested as non-blocking input before Phase 22.

### Correction loop 1 — unit CL1-ARCH

- EXECUTION_LEVEL L2. OWNER: product-ux-architect (a fresh worker instance, which becomes co-author of 0.4; the judges stay independent).
- JUDGES: the same three judge instances, re-review of the delta only.
- MODEL_ROUTE claude-opus-5-5, EFFORT max. Reason: material UX/IA correction; Founder floor.
- ARTIFACTS_REQUIRED: PTM/PDM/PDR → 0.4 by targeted edits. No new files.
- STOP_WHEN: every listed finding has a recorded resolution (CORRECT, DEFER with owner/trigger, or REJECT with reason) and the deterministic checks pass. Single pass; no 0.5; no Phase 4 work.
- ESCALATE_IF: a fix needs a Founder decision or a doctrine change, or the hashes changed concurrently.
- Scope:
  - Blocking: UX-J-01 to UX-J-04 and PCG-J-01.
  - Batched now: UX-J-05 to UX-J-09, UX-J-11, UX-J-12; PCG-J-02 to PCG-J-12.
  - Security: SEC-J-05 (replace the §8.3 rule) and SEC-J-07 (§8.1 rows); the remaining SEC-J conditions recorded as carried conditions with owner and trigger.
  - Structural states from UX-J-10.
  - Record the PCG rulings and D-CHIEF-01 to D-CHIEF-03 in the PDR.

**CL1-ARCH interruption and resume (2026-10-10):**
- The worker ran from 06:29 to 06:56 local (claude-opus-5-5/max observed), made 70 targeted Edits, then stopped on HTTP 429 (session limit, reset 10:30 São Paulo).
- State at the interruption:
  - PDM: 0.4 edits complete (`20e9e630…`).
  - PDR: partial up to the FG-2 rewrite (`1cc733d2…`).
  - PTM: untouched (0.3, `d1be5cdd…`).
  - No concurrent modification.
- Classified as a capability/quota gap, **not** a failed correction: the correction-loop counter stays at attempt 1.
- 10:55 local: the **same worker was resumed** (no duplicate agent) with the remaining delta only: FG-3, FG-4, PDR additions, PTM-0.4, checks and hand-back. Same STOP_WHEN. Observed after resume: claude-opus-5-5/max.

**CL1-ARCH completed (2026-10-10 ~11:03 local).** Single pass; deterministic checks pass.
- Output: PTM-0.4 `fe954fd9…a5045`, PDM-0.4 `20e9e630…cdedc`, PDR-0.4 `18be6924…3cf93`. Canon unchanged.
- Independent Chief check: hashes match the report; PTM-0.4 maps 72/72 Canon IDs; the 39 finding IDs are in the PDR §8 resolution table (26 CORRECT, 13 DEFER, all SEC-J conditions carried in PDR §7 with owner, trigger and evidence; 0 REJECT).
- Recorded in PDR: D-CHIEF-01 to D-CHIEF-03 (§5); PCG rulings as interim LD (§6).
- Worker-declared residuals:
  - two stale informational PTM pointers (N8; the §6 "Fase" column for O006/O009/O011);
  - the UX-J-09 vs PCG-J-03 divergence, resolved in favour of PCG.

**Delta re-reviews dispatched in parallel** (SendMessage to the same independent judge instances; observed routes unchanged: UX claude-opus-5-5/max, PCG claude-opus-5-5/xhigh, SEC claude-opus-5-5/high):
- UX: UX-J-01 to UX-J-12 resolutions; scenarios X1, X3, X5, S9, S4, S7; FG presentation readiness.
- PCG: J1′/J2′/J3′ on 0.4; D-CHIEF authority; stale pointers.
- SEC: boundary impact of I4, I6–I10, §6.2, §6.3, §6.9 and §8; SEC-J-05 and SEC-J-07; §7 carried table; D-CHIEF-03.

**SEC delta re-review returned (about 2 min):** SECURITY_READY_WITH_CONDITIONS on PDM-0.4. SEC-J-05 PASS; SEC-J-07 PASS; I10 private PASS; no default exposure added.
- 10 new non-blocking findings, SEC-J2-01 to SEC-J2-10:
  - SEC-J2-03 closes with SEC-J-10 before PRODUCT_ARCHITECTURE_APPROVED.
  - SEC-J2-08 (minors or age; data-subject rights as Phase 4 requirements; legal findings must arrive before PRODUCT_ARCHITECTURE_APPROVED, or that approval reopens) involves the Founder.
  - SEC-J2-09 is an editorial inconsistency in PDM §8.4.
- Evidence appended to `audits/phase-1-3-reviews/SEC-J_domain-model-boundaries.md`.

**PCG delta re-review returned:** J1′ CANON_INGESTED (PTM-0.4) PASS · J2′ PDM-0.4 compliance PASS · J3′ PDR-0.4 PASS.
- PCG-J-01 to PCG-J-12 resolved.
- D-CHIEF-01 to D-CHIEF-03 confirmed within Chief/specialist authority. D-CHIEF-03 is a reversible design posture, not a legal determination.
- The UX-J-09 vs PCG-J-03 divergence is confirmed as LD.
- 6 new non-blocking findings, PCG-J2-01 to PCG-J2-06. PCG-J2-01 overlaps SEC-J2-02; both concern consent for I10's secondary purpose.
- Evidence appended to `audits/phase-1-3-reviews/PCG-J_canon-ingestion-domain-decisions.md`.

### Canon 2.2.0 editorial draft — unit PCG-REV-2.2.0 (dispatched 2026-10-10 ~11:15, during the Founder Gate)

- EXECUTION_LEVEL L3. OWNER: fresh product-constitution-governance worker. MODEL_ROUTE claude-opus-5-5, EFFORT xhigh.
- Scope:
  - DI-01 to DI-07, as editorial clarification with the PCG rulings and the Security position on DI-05 as basis.
  - The O006 formalization of the Founder's FG-2 Package A, added by message after the Founder answered.
- The draft lives only in `governance/drafts/VILUMO-PTC-2.2.0/`, with a 2.1.0 snapshot and a delta record. `canon/` stays 2.1.0 until READY plus publication.
- JUDGES afterwards: a fresh research-evidence-strategist (DOCTRINE_EVIDENCE_REVIEWED) and a fresh product-ux-architect (DOCTRINE_INTERPRETABLE, Opus max).
- STOP_WHEN: the draft and delta record are complete and the checks pass (L001–L023 text unchanged).

**PCG-REV-2.2.0 draft delivered (~11:34 local):** `governance/drafts/VILUMO-PTC-2.2.0/`.
- Draft `7059b5f8…f3e4` ("DRAFT, não canônico"); delta record `c5563dc4…38b9` (CH-01 to CH-26); 2.1.0 snapshot `4d4ccb65…`.
- New IDs: C024 (phasing), C025 (Crew boundary, O006 resolved from FG-2 Package A; the numbers stay in the PDR), C026 (SOM), C027 (SVS), H007 (Shareability effects). DI-01 to DI-07 resolved editorially.
- Worker checks 25/25. Independent Chief check: L001–L023 lines identical, only the expected new IDs, `canon/` and `product/` untouched.
- Preconditions flagged by the author:
  - OI-1: the PDR must record the Package A values. Satisfied by the Founder authority record plus the Architect integration pass immediately after publication.
  - OI-2: publication changes only the DRAFT marker. Diff and both hashes to be recorded.
- **Doctrine reviews dispatched in parallel (~11:36):**
  - DOCTRINE_EVIDENCE_REVIEWED: fresh research-evidence-strategist, observed claude-opus-5-5/xhigh.
  - DOCTRINE_INTERPRETABLE: the same independent Product/UX reviewer that raised DI-01 to DI-07, resumed, observed claude-opus-5-5/max.
  - Both are independent of the PCG author and of the Chief. The Chief then consolidates PRODUCT_CONSTITUTION_READY for 2.2.0.

**Doctrine reviews interrupted and resumed:**
- Both reviewers stopped on HTTP 429 (session limit) at about 11:39 and 11:50 local, mid-pass, with 0 writes.
- At 16:03 local, after the 15:50 reset, both **same instances were resumed** with the same STOP_WHEN. The inputs were verified unchanged: draft `7059b5f8…`, delta `c5563dc4…`, canon `4d4ccb65…`.
- Classified as a capability/quota gap, not a correction attempt.
- Note: this is the second quota interruption in the session. Keep critical-path units first. Defer non-critical research (DR-20) until the critical path is waiting on a long unit.

**DOCTRINE_INTERPRETABLE r1 on draft 2.2.0 (`7059b5f8…`): FAIL / REQUEST_CHANGES** (~16:10).
- DI-01 to DI-07 all resolved. Nothing DOCTRINE_BLOCKED; no Founder decision is needed now.
- Blocking, both PCG editorial:
  - **DI2-01:** the status of *limited* support representations below minimum credible coverage (for example "analytics now, plans later", a beta listing, or a support announcement) is undeterminable; three readings fit the text. Fix: clarify the reach of "esse alcance" and record the status as an OPEN QUESTION, owned by the Founder under the Release Scope split, triggered before any Release Scope or architecture adopts such a representation. PCG does not decide the substance.
  - **DI2-02:** C025's "pode" phrasing, under the new §2 rule that "pode" is a permission, lets the Founder-decided creation right (either role) and multi-Crew participation be narrowed unnoticed. Fix: make them decided content in the §13 "decide" sentence and the §31 row; point O005 to C025.
- Non-blocking: DI2-03 (D011 activity: the choice is how it is used, not whether it informs load); DI2-04 (end-state test and authority wording); DI2-05 (non-strategic decider, coverage-criteria owner, delegation record); DI2-06 (C025 parameter bounds and who classifies a change).
- Evidence: `audits/canon-2.2.0-reviews/DOCTRINE_INTERPRETABLE_r1.md`.
- Waiting for the R&E fidelity audit, so a single REQUEST_CHANGES (correction loop, attempt 1) goes to the PCG author.

**DOCTRINE_EVIDENCE_REVIEWED r1 on draft 2.2.0: PASS, with condition RA-01** (~16:20).
- No LOCKED meaning changed; no Founder decision invented; no promotion.
- The L023 "represented" reading is faithful; the DI-02 split is derivable from §2 and O011; C025 is faithful, and keeping the numbers out of the Canon is correct.
- **RA-01:** the C025 pointer to PDR values is untrue until the PDR records FG-2. This must be fixed before READY or publication.
- 9 non-blocking findings: RA-02 to RA-09 and RA-11.
- Evidence: `audits/canon-2.2.0-reviews/DOCTRINE_EVIDENCE_REVIEWED_r1.md`.

**Consolidation:** PRODUCT_CONSTITUTION_READY (2.2.0) = NOT READY (DOCTRINE_INTERPRETABLE FAIL). Two units dispatched in parallel (different files):
- **CORR-PTC-2.2.0 attempt 1:** REQUEST_CHANGES to the same PCG author by message. Covers DI2-01 and DI2-02 (blocking), DI2-03 to DI2-06, RA-02 to RA-09, RA-11 and the DI-04 residual. DI2-01 becomes a new Founder-owned OPEN QUESTION on limited support representations; the substance is not decided. Attempt 1 of 2.
- **REC-PDR-0.4.1:** product-ux-architect records the Founder Phase 3 decisions verbatim (FG-2 RESOLVED Package A with values; FG-3 confirmed A; market, languages, platforms, 18+). It closes RA-01.
  - L1, work_kind mechanical, route claude-sonnet-5-5/medium. Bookkeeping, so the UX floor does not apply.
  - The diff is confined to PDR header, §1, §2.3 and §3.

Then: the two reviewers re-check only the delta. RA-01 is verified against the PDR. Then Chief READY consolidation and publication (marker-only diff, both hashes).

**REC-PDR-0.4.1 done (~16:25, about 48 s, observed claude-sonnet-5-5/medium):** PDR-0.4.1 `51271643…79ca`.
- FG-2 RESOLVED, Package A, with the five values, the exclusions and a pointer to C025 (draft).
- FG-3 CONFIRMED A.
- New §3 subsection records market, languages, platforms and 18+ verbatim, with references. The original options are kept as history.
- The diff is confined to the header, §1, §2.3 and §3; tables are intact. Chief verification: PDM, PTM and canon hashes are unchanged.
- **RA-01 precondition met** at the PDR level. The reviewers confirm the pointer in the delta re-check.
- Residual: header prose at PDR line 14 still calls the gate pending. Fix in the Phase 4 Architect pass (editorial).

**CORR-PTC-2.2.0 attempt 1 done (~16:35):** draft `724834fb…810e`, delta `d86d8c93…5878` (new §14, R1-01 to R1-13; §1–§13 preserved). Author checks 26/26.
- Independent Chief check: L001–L023 identical; C016–C023, D010 and D011 identical; canon, PDM and PTM unchanged.
- New IDs in total: C024–C027, H007, **O013** and **O014**.
  - O013: may a sport below minimum credible coverage get a limited or partial support representation? Founder-owned; trigger before a Release Scope or architecture adopts one.
  - O014: who sets and verifies the minimum-credible-coverage criteria? Founder decides the allocation; trigger before the first full declaration of a sport.
  - Both are expected to surface at the Release Priorities gate. They do not block READY (§32).
- Delta re-reviews dispatched in parallel, same independent reviewer and auditor (SendMessage):
  - DOCTRINE_INTERPRETABLE: DI2-01 to DI2-06 resolution, new ambiguity, regression.
  - DOCTRINE_EVIDENCE_REVIEWED: RA-01 closure against PDR-0.4.1; fidelity of RA resolutions and of O013, O014, the §2 "pode" scope and the end-state and unclear-case rules.

**Canon 2.2.0 READY and PUBLISHED (2026-10-10 16:36 local / 19:36Z).**
- **Round 2 verdicts on draft `724834fb…`:** DOCTRINE_EVIDENCE_REVIEWED PASS (RA-01 closed; non-blocking RA2-01 to RA2-04). DOCTRINE_INTERPRETABLE PASS (DI2-01 to DI2-06 resolved; non-blocking DI3-01 to DI3-03).
- **PRODUCT_CONSTITUTION_READY PASS,** consolidated by the Chief: same sha256 in both reviews, no blocker, distinct actors, Founder refs.
- **Publication:** canon is now **VILUMO-PTC-2.2.0 `5c780fdc…5601`**. The marker-only diff (line 5) was verified by script. 2.1.0 is preserved as a byte-identical snapshot. Event `VF-PTC-2.2.0-CANONICAL-20261010-001`; index updated.
- **Records:** `audits/canon-2.2.0-reviews/` (canon-gate-2.2.0.json, publication-event-2.2.0.json, both review files with round 2).
- **Deferred to PCG:** the 7 non-blocking findings, for the next Canon revision (at the latest before Phase 6). Interim: the contract's doubt rule.
- **Handoff** to Product/UX emitted; acceptance is pending the Phase 4 unit.
- **Correction-loop outcome:** CORR-PTC-2.2.0 closed at attempt 1.

### Phase 4 — PRODUCT ARCHITECTURE: unit P4-ARCH (dispatched 2026-10-10 ~16:40 local)

- **Worker:** a fresh product-ux-architect. EXECUTION_LEVEL L2; MODEL_ROUTE claude-opus-5-5, EFFORT max (Founder floor, material IA).
- **Two checkpoints, same worker:**
  - **CP-A:** accept the Canon 2.2.0 handoff (or return DOCTRINE_BLOCKED); sync PTM/PDM/PDR to 0.5 (79 IDs); integrate the Founder Phase 3 decisions (Package A, creation as a person-level permission, BR / PT-BR + EN, iOS + Android, 18+ age verification); carried corrections PCG-J2-01 to 06, UX-J2-01 to 07, SEC-J2-02/04/05/06/07/09; record the CP-B scope. STOP and hand back.
  - **CP-B (on resume):** `product/PRODUCT_ARCHITECTURE.md`. It covers topology, IA, navigation, object hierarchy, entry points, modes, surfaces, progressive disclosure, cross-pillar interactions and states, plus the SOM (DR-38) and the Security conditions due before approval: SEC-J-03, SEC-J-10, SEC-J2-03, SEC-J2-08 (data-subject rights; legal memo is Founder input), with SEC-J-01, 04, 06, 11, 12, 13 and SEC-J2-01.
- **JUDGES:** UX (Architecture Eval), PCG and Security, on CP-A delta and then on the CP-B architecture. Pipelined: judges review CP-A while CP-B is authored.
- **Deferred off the critical path:** DR-20 research (credible-depth criteria per sport) for the Release Priorities gate, started once CP-A is stable (quota prudence).
- **CP-A interruption and resume:**
  - HTTP 429 (session limit) at about 16:55 local, after the inputs were read; reset 21:00.
  - State: 0 artifact edits; the only write was a scratch check script. Artifacts verified unchanged at 21:05.
  - The **same worker was resumed** with the same checklist and STOP_WHEN. Capability/quota gap; not a correction attempt.
  - This is the third quota interruption today. Keep strict critical-path priority and do not run optional units in parallel.
- **CP-A done (~21:30 local; about 25 min of runtime after resume):**
  - Artifacts: PTM-0.5 `24404ad0…6ef7`, PDM-0.5 `6a5ace35…23a3`, PDR-0.5 `dec6fab3…5498`. Only these 3 files changed.
  - **Canon 2.2.0 handoff ACCEPTED** (PDR §9). Recorded by the Chief in `canon/CANONICAL_INDEX.md` and `publication-event-2.2.0.json`.
  - Resolution: 36 items, 31 CORRECT, 2 mixed, 3 deferred to CP-B, 0 REJECT. CPB-01 to CPB-11 recorded in PDR §10; CPB-11 is age verification at every entry point.
  - New register items: DR-47 (launch constraints, resolved), DR-48 (O013) and DR-49 (O014).
  - Chief independent verification: 79/79 IDs mapped; the worker script re-run gives 51 PASS / 0 FAIL; canon unchanged.
  - Worker judgment calls flagged for the judges:
    - a deviation to more volume is ineligible as a Contribution source;
    - the C025 creation right extends to people with no active mode [P];
    - catalog state renamed "não declarada (só contexto do motor)";
    - I10's secondary purpose is behind its own off-by-default consent (A11).
- **D-CHIEF-02 amended:** the Release Priorities gate also carries DR-48 (O013) and DR-49 (O014). DR-45 cannot declare full support for any sport until O014 is decided.
- **Dispatched in parallel (~21:35):**
  - delta re-reviews of 0.5 by the same UX, PCG and SEC judge instances, against PTC-2.2.0;
  - the same worker resumed for **CP-B**, PA-0.1 `product/PRODUCT_ARCHITECTURE.md`, with the SOM and the Security conditions due before PRODUCT_ARCHITECTURE_APPROVED. Findings on 0.5 are folded into CP-B by message.

### Founder decision intake — hybrid experience (2026-10-11 ~09:30 local)

- **Quota:** a fourth interruption hit all four running units at about 22:00 (reset 02:00). They were resumed at about 09:45 with inputs verified unchanged.
- **Re-grounding done:** Canon 2.2.0 reread in full; DR-35 and §4 routing; AI Systems & Agent Experience Architect constitution. `.claude` unchanged since 10-09 23:52.
- **Canonical placement (Chief):** CURRENT PRODUCT DECISION(s) in the Canon §30 Product/UX implications area (PCG decides IDs and wording). No UI, navigation, destinations or scope are fixed (§3, D009, §30).
- **Durable records written now:**
  - the authority record `audits/founder-decisions/2026-10-11_hybrid-experience-founder-decision.md`;
  - a "Founder decision pending formalization" pointer in `canon/CANONICAL_INDEX.md`;
  - the Founder Experience Intent entry (above), including the Pierre designation.
- **Compatibility:** no THESIS_CONFLICT found.
  - L022 (no chatbot identity) is reinforced by the direct-execution and social-access principles.
  - L007 (the engine decides) holds: the agent coordinates and prepares adjustments.
  - Also compatible with C012 (uncertainty visible), L003/L023/C023/C024 (depth per modality) and L002/C016–C022/C025 (social).
- **Concrete gaps and conflicts:**
  - (1) There is **no in-product agent confirmation/undo/autonomy contract** yet. The decision says "existing contracts"; what exists is authority, agency and consent only. Owner: Product/UX with AI Systems (+ Security). Trigger: product-level rules before PRODUCT_ARCHITECTURE_APPROVED; the full contract in Phase 5. Not invented by PCG.
  - (2) PDR DR-35 and the §4 routing engaged AI Systems only at Phase 22 "if the engine or explanations use AI". This is **superseded**: AI Systems joins from the Phase 4 review. The PDR is adjusted by the Architect; the ledger routing is updated.
  - (3) The CP-B brief predates the decision. The worker received the delta by message.
- **Units dispatched or resumed in parallel (~09:45):**
  - **PCG-REV-2.3.0:** same PCG author, claude-opus-5-5/xhigh. Formalizes the hybrid experience and batches the 7 deferred non-blocking findings (RA2-01 to RA2-04, DI3-01 to DI3-03). Draft in `governance/drafts/VILUMO-PTC-2.3.0/`. Reviews afterwards: the same R&E auditor and UX interpretability reviewer.
  - **P4-ARCH CP-B:** same worker, claude-opus-5-5/max. Folds the decision into PA-0.1, with a minimal PDM-0.6 (agent as an interaction channel, no new authority, no shadow state) and PDR-0.6 (DR-50; DR-35 and §4 rerouted; the gap recorded).
  - **The 0.5 delta reviews (UX, PCG, SEC) resumed.** The hybrid decision is out of their scope; it will be reviewed with PDM-0.6 and PA-0.1.
- **Unchanged on purpose:** CURRENT_MISSION.md (Founder-owned work definition; the Canon carries doctrine); `.claude` (no product state in globals); PTM (synced after 2.3.0 publication).
- **SEC delta re-review of 0.5 under PTC-2.2.0 returned (~09:47):** SECURITY_READY_WITH_CONDITIONS. All SEC-J2 resolutions PASS. 9 new non-blocking conditions, SEC-J3-01 to SEC-J3-09.
  - SEC-J3-01 (invite outcome states indistinguishable; I9 carve-out for C025 confirmation) and SEC-J3-08 (C021 data scope in consent) close with SEC-J-03 and SEC-J-10 **before PRODUCT_ARCHITECTURE_APPROVED**.
  - Forwarded to the CP-B worker: SEC-J3-01, 02, 03, 04 (consent part), 07, 08 and 09 (Security review added to CPB-07).
  - SEC-J3-05 and SEC-J3-06 are recorded for Phase 8.
  - The hybrid-agent boundaries need their own Security review with PDM-0.6.
  - Evidence appended to `audits/phase-1-3-reviews/SEC-J_domain-model-boundaries.md`.
- **PCG delta re-review of 0.5 against Canon 2.2.0 returned (~09:55):** J1‴ CANON_INGESTED (PTM-0.5) PASS · J2‴ PDM-0.5 compliance PASS · J3‴ PDR-0.5 PASS.
  - PCG-J2-01 to PCG-J2-06 resolved.
  - The worker's judgment calls were confirmed compatible: the creation-right extension, the eligibility rule, the I10 consent, context-level sports and the catalog state.
  - 1 non-blocking finding, **PCG-J3-01** (the T19/V9 qualifier "a partir do primeiro Release Scope"), forwarded to the CP-B worker.
  - Evidence appended to `audits/phase-1-3-reviews/PCG-J_canon-ingestion-domain-decisions.md`.
  - **CANON_INGESTED re-confirmed PASS on PTM-0.5 for Canon 2.2.0.** DOMAIN_MODEL_APPROVED on 0.5 is pending the UX structural delta.
- **UX structural delta re-review of 0.5 returned (~10:05):** **PASS.**
  - UX-J2-01 to UX-J2-07 resolved; all 4 judgment calls accepted, 3 with conditions.
  - Founder decisions structurally sound. Scenarios X1, X5, X7 to X11 and S9 supported.
  - 5 non-blocking findings:
    - UX-J3-01 (creator consent; disposition when leaving the personal experience) and UX-J3-05 (I9 wording): into PDM-0.6.
    - UX-J3-02 (CP-B must cover mission §4 plus DR-31, DR-32, DR-34, §6.7 and the surfaces pointer, with added negative cases): forwarded to the CP-B worker. My CP-B brief already required mission §4 coverage; the extra items and cases were sent by message.
    - UX-J3-03 and UX-J3-04: carried to Phase 5.
  - Evidence appended to `audits/phase-1-3-reviews/UX-J_domain-model-structure.md`.
- **Consolidation (Chief):** **DOMAIN_MODEL_APPROVED = PASS on PDM-0.5 (`6a5ace35…`) / PDR-0.5 (`dec6fab3…`) under Canon 2.2.0**, from UX structural PASS + PCG J2‴ PASS + SECURITY_READY_WITH_CONDITIONS. The carried conditions keep their owners and triggers.
  - PDM-0.6, in progress in CP-B (agent channel, UX-J3-01/05), will need a delta review together with PA-0.1.
  - Canon 2.3.0 will require a new handoff and a re-check of the edited scope.

### Canon 2.3.0 draft and quota interruption #5 (2026-10-11)

- **PCG-REV-2.3.0 draft delivered (~09:47):** draft `13f3116d…fd65f`, delta `74384a80…4177`, 2.2.0 snapshot `5c780fdc…`. Author checks 30/30.
  - The hybrid experience is formalized as C028 (decision and goal) and C029–C036 (principles 1–8) in a new §30.2; C037 (principle 9) in §30.1.
  - Also new: H008 (the hybrid experience reduces effort, as a hypothesis) and **O015** (the agent's confirmation, undo and autonomy contract; owners Product/UX + AI Systems, plus Security; not invented).
  - Two new §31 rows. Pierre is not named in the Canon.
  - The deferred RA2-01 to RA2-04 and DI3-01 to DI3-03 are resolved; only O014 changed among existing lines.
  - Chief independent check: L001–L023 and Founder lines C016–C025, D010, D011 identical; new IDs exactly C028–C037, H008, O015; none removed.
- **Reviews dispatched (~09:50), same R&E auditor and UX interpretability reviewer:** both were cut by the session limit before starting.
- **Quota interruption #5 (~09:54; reset 14:30).** CP-B state at the interruption:
  - PDM-0.6 `af369260…` complete;
  - PTM-0.5.1 `5048e0a0…` with the PCG-J3-01 fix;
  - PA-0.1 `ec1d18c6…` partial or complete (to be checked);
  - PDR-0.6 updates pending.
- **14:31: all three resumed** (same instances, same STOP_WHEN, inputs verified unchanged).
- **DOCTRINE_EVIDENCE_REVIEWED r1 on 2.3.0 draft `13f3116d…`: PASS, no condition** (~14:50).
  - 37/37 protected lines identical; 91 IDs; Pierre not named.
  - All new IDs faithful ("home" → "experiência inicial" judged faithful). H008 is a correct hypothesis. O015 is the correct class.
  - 4 non-blocking findings:
    - **RA3-01:** C032 must say the agent respects the *existing* contracts (L007, L014, C021), with O015 only for the agent-specific part; O015's Founder trigger aligned with §2. **Chief to inform the Founder at READY** that the "existing contracts" premise was only partly met.
    - RA3-02: the §31 row cites L022 only at product level; quote L022 accurately.
    - RA3-03: the role-neutral mechanics category is limited to abuse prevention and security; never offering the invite object needs the Founder.
    - RA3-04: the C037 reading is softened per the reference-type rule.
  - Evidence: `audits/canon-2.3.0-reviews/DOCTRINE_EVIDENCE_REVIEWED_r1.md`.
  - Pending: DOCTRINE_INTERPRETABLE r1.

### Canon 2.3.0 published, Phase 4 CP-B done, architecture reviews (2026-10-11)

- **DOCTRINE_INTERPRETABLE r1 on 2.3.0: PASS** (~14:55). Every scenario converges.
  - DI3-01 to DI3-03 resolved.
  - 4 non-blocking findings:
    - DI4-01: the O015 trigger "prepara ou aplica", plus Chief-in-doubt routing;
    - DI4-02: the line between a simple task and coordination, for the Phase 4 gate;
    - DI4-03: "experiência inicial" vs onboarding;
    - DI4-04: what stable references cover, for the Phase 4 gate.
  - Evidence: `audits/canon-2.3.0-reviews/DOCTRINE_INTERPRETABLE_r1.md`.
- **PRODUCT_CONSTITUTION_READY (2.3.0) PASS → PUBLISHED** (14:40 local / 17:41Z).
  - canon **VILUMO-PTC-2.3.0 `dc0c5c53…cfd0b`**; marker-only diff verified by script; event `VF-PTC-2.3.0-CANONICAL-20261011-001`.
  - The 2.2.0 snapshot is preserved. Index updated: the hybrid decision is marked **formalized** (C028–C037, H008, O015).
  - Records: `audits/canon-2.3.0-reviews/canon-gate-2.3.0.json`, `publication-event-2.3.0.json`.
  - **8 non-blocking findings deferred** (RA3-01 to 04, DI4-01, DI4-03 to PCG; DI4-02 and DI4-04 to the Phase 4 gate). Trigger: next Canon revision, at the latest before Phase 5 O015 specification or the Release Priorities gate.
  - **Interim RA3-01:** the agent is bound now by L007, L014 and C021, plus O015.
  - **Founder informed** that the "existing confirmation/autonomy contracts" premise was only partly met (RA3-01(c)).
  - Handoff to Product/UX emitted; acceptance is pending the Architect's ID sync after the PA reviews.
- **CP-B done (~14:45):**
  - Artifacts: PA-0.1 `1e62be94…0d3d` (new), PDR-0.6 `f63e3866…7f45`, PDM-0.6 `af369260…416c`, PTM-0.5.1 `5048e0a0…`. Worker checks 63/63, re-run by the Chief.
  - **Navigation:** "Hoje" as contextual entry over 4 stable destinations (Plano, Progresso, Crews, Você). The agent is a channel on Adaptive Performance surfaces only: confirmation for everything, no autonomy, undo through the direct path, the conversation never a source of truth.
  - **Social:** one space per Crew. Channel-bound nominal invites. Standing per-Crew consent preferences, off by default.
  - **Sessions and rights:** one Session surface with per-sport depth. Data-subject rights as AR-69.
  - **Register:** CPB-01 to 11 resolved (CPB-09 N/A). DR-50 (hybrid decision); DR-51 (agent-contract gap, cf. O015); DR-52 to DR-54. The hybrid principles are mapped in PA §1.
- **PA-0.1 reviews dispatched (~14:42), in parallel:**
  - UX Architecture Eval (resumed judge, max);
  - PCG thesis compliance vs 2.3.0 (resumed, xhigh);
  - Security, including the agent boundary and the PDM-0.6 delta (resumed, high);
  - **AI Systems & Agent Experience Architect** (fresh, opus/high, material_other).
  - The first AI Systems dispatch was **denied by the PreToolUse guard (missing task-route envelope)**; it was redispatched correctly. Guard enforcement observed.
- **Quota interruption #6 (~14:43; reset 19:30):** all four judges stopped at their start, with 0 writes. **Resumed at 21:23**, inputs verified unchanged.

### Founder Gate phase 3 — answers recorded (2026-10-10 ~11:20)

- FG-2 = Package A → O006 formalization by PCG (Canon draft); the parameters go into PDM/PDR at the next Architect pass.
- FG-3 = A confirmed as the Phase 4–6 working baseline. The final launch shape goes to the Release Priorities gate.
- Market: Brazil; languages PT-BR + EN. Phases 4, 8, 18 and 22 need i18n and two-language content.
- Platforms: iOS + Android smartphone. Wearables and other apps only as data sources through integrations; the integration strategy is decided later.
- Minimum age: the Founder instructed "replicate peers". Chief verification from primary sources: GymRats >13; Strava ≥13 with guardian permission below contract age; Garmin Connect 16+ outside the US; Runna 18+, with a training-safety rationale. **They diverge**, so a follow-up Founder choice is needed. It does not block the Phase 4 start; it is due before PRODUCT_ARCHITECTURE_APPROVED (SEC-J2-08).

Planned consolidation:
- DOMAIN_MODEL_APPROVED = J-PCG compliance PASS + J-SEC READY (or non-blocking conditions) + J-UX PASS.
- PRODUCT_DECISIONS_SUFFICIENT follows the PDR verdicts. Then comes the Founder Gate (FG-2, FG-3) as the only L4 unit.


### Controlled canonical rebaseline 3.0.0 — 2026-10-14 (documentação concluída)

- Founder autorizou Running × Strength first-class V1; Adaptive Engine núcleo/diferencial; Nutrition contextual performance insights; Wearables ingestão + structured export quando suportado; Crew Lite básico sem chat/discovery público/communities/marketplace. Cycling/Swimming/outros esportes são possibilidades futuras sem dívida V1. Inovação/coordenação e loop governam inclusão, não parity ou completude.
- Chief da sessão coordenou PCG worker, Product/UX worker, Research judge, Product/UX judge fresco, Security judge e Engineering judge. Somente papéis necessários; nenhum Designer, implementação ou Figma.
- PTC-3.0.0, PTM-1.0, PDR/PDM/PA/RS/AEC/EM/CF-1.0 e missão/índice sincronizados. 91 IDs anteriores migrados; L002/D004 explicitamente superados, 22 invariantes vigentes preservados. Snapshot pre-3.0.0 de 49 arquivos, sem excluir histórico.
- Pareceres atuais: fidelidade PASS, interpretabilidade PASS, Product/UX r2 PASS, Privacy r2 PASS, closed loop PASS. FAILs r1 preservados; correction pass único fechado por judges. Engenharia retomou do checkpoint após limite de uso, sem reabrir etapas aprovadas, e não exigiu novas correções.
- Publicação: `VF-PTC-3.0.0-CANONICAL-20261014-001`, evidência/allowlist/hashes em `audits/rebaseline-3.0.0/PUBLICATION_EVENT.json`; corpo sem mudança substantiva após reviews. Handoff ACCEPTED pelo consumidor Product/UX na versão publicada; Claude não teve aceite presumido.
- CURRENT_MISSION = COMPLETE_DOCUMENTATION_ONLY; IMPLEMENTATION_AUTHORIZED = NO; IMPLEMENTATION_STARTED = NO; FIGMA_AUTHORIZED_IN_THIS_MISSION = NO. Verificação final em `audits/rebaseline-3.0.0/FINAL_VERIFICATION.json`; registros/raw evidence em REBASELINE_RECORD. Publicação documental não declara release/technical/UI readiness ou hipótese validada.
- Handoff sexta 2026-10-16: ler índice/tese/mapa/registro/missão/Scope/AEC e consumidores; fechar policies/evidência e viabilidade técnica antes de UX Spec dependente. Nenhuma obrigação de quatro esportes, módulo alimentar ou social avançado sobrevive na V1.

## 2026-10-15 — PREUX documentary closure / VF-PREUX-20261015-001

Founder-authorised pre-UX dependency closure, resumed from the exact interrupted checkpoint; Rebaseline3.0.0 not reopened. Six consumer authorities 1.1, PDR-1.1 DR-66–71 and G01–G11, CI-3.0.1 published. Four supporting evidence/test packs; no new product authority. Independent Research/Engineering r2/Security/Product-UX documentary PASS, 355/355 pre-review checks. Engineering r1 FAIL and exact inputs preserved; ENG-PREUX-01 fixed/revalidated only in AEC/PDM/CF. PTC/PTM/AGENTS/CLAUDE and all prior history preserved. Actual Product/UX input acceptance, no presumed Claude acceptance. Evidence: audits/pre-ux-2026-10-15/PUBLICATION_EVENT.json, FINAL_READINESS_AUDIT.md and FINAL_VERIFICATION.json. G01–G11 retain external/professional/legal/access/spike/Founder/runtime gates. Detailed UX can begin under next authorised mission; Figma/implementation not begun. Stop after A–M report.

## 2026-10-15 — Adaptive Engine operational pre-implementation / AEOS-20261015

Founder directly authorised the new local mission in the current session, downstream of published AEC-1.1. Chief native /root/chief 1.4.0: T3/R3/L3, durable documentary contracts, A2/A3; model inherited from session, no role override/resolved identifier fabricated. Previous COMPLETE PREUX mission snapshot preserved with SHA-256 7336e90487ae1b3e48f964a7059d83b260f5896639e3c3582421cb692f9d90c6. Baseline manifest covers 150 preexisting files. Canon 3.0.0 and published VF-PREUX-20261015-001 stay byte-identical, including index/PDR and consumers 1.1. New artifacts are AEOS and Scenario Lab with distinct future implementation/harness consumers; no duplicate doctrine/policy registry. Root authors; Chief owns lifecycle/audit; independent AI, Engineering, Product/UX and Security documentary reviews follow objective checks. No Research unless a newly decisive gap cannot be answered by existing approved evidence; no UI/Designer, code/ML/providers/Figma/screens, Data experiment or Release. Mission record: audits/adaptive-engine-2026-10-15/MISSION_RECORD.md. JEV required in future SHADOW MODE, subordinate to deterministic hard constraints/policy; LLM explains recorded decisions without execution authority. IN_PROGRESS_DOCUMENTATION_ONLY, no domain gate yet; hard stop after spec/evals/reviews/report.

## 2026-10-18 — AEOS documentary publication / VF-AEOS-20261018-001

Task AEOS-20261015 / contract AEOS-20261015-r1 resumed exactly from CP6 under the Founder's closure/report A-S request. Authorship revisions/date 2026-10-15 preserved; no new agent, review, research or spec/upstream change on resumption. Published downstream AEOS-1.0-r2 (c5fbc252bf8ef65bae8577f3f430ee85835e583df07d52dd1c9b442d1a1a1f77) and AESL-1.0-r2 (99b42085eda2eab9f52704bbd1646fd82875c798141b8820a8f54da74530fa85). Four current independent documentary PASSs accepted: AI r2, Engineering r2, Product/UX r1, Security r1. ENG-AEOS-01/02 ACCEPT/RESOLVED by Engineering r2 after one correction; r1 FAIL, original inputs/check and earlier verifications remain preserved. Current final pre-closure check 350/350 exit0, 2026-10-18 local, SHA256 2f8668456bf701a829fa10dba37aa3a5c5dd3e49976d4f0f90478c76c908724f. Canon3.0.0 and VF-PREUX-20261015-001 fully unchanged: 148 protected originals, prior mission snapshot and original ledger prefix equal. 47 scenarios/9 sequences specified and approved documentarily, never executed. Publication/accepted hashes/confirmation map in audits/adaptive-engine-2026-10-15/PUBLICATION_EVENT.json and FINAL_CONSOLIDATION.md. CURRENT_MISSION COMPLETE_DOCUMENTARY_SPECIFICATION; IMPLEMENTATION_AUTHORIZED=NO, IMPLEMENTATION_STARTED=NO, FIGMA_AUTHORIZED=NO. No Engine/harness/production code/ML/provider/device/spike/Figma/UI/screens or global state. PDR G01-G11 and future professional/legal/provider/real-data/runtime proofs remain at their triggers. Chief /root/chief consolidates only; root performs administrative post-publication verification and delivers final A-S report, then HARD STOP. No next product mission automatically authorised.

## 2026-10-18 — Detailed UX Specification / UXSPEC-20261018

Founder directly authorised the new local mission in the current Claude session after AEOS publication VF-AEOS-20261018-001 (post-publication check 390/390 verified in audits/adaptive-engine-2026-10-15/FINAL_VERIFICATION.json). Chief = current Claude main session (CHIEF 1.5.0), direct work limited to routing, lifecycle, objective checks, consolidation and bookkeeping. Routing T3/R3/L3, documentary productization, A2/A3. Author: fresh native product-ux-architect worker on claude-opus-5-5/max (Founder floor). Independent fresh judges: Product/UX (opus/max), Security (PB-F-02/03; opus/high), AI Systems (O015, explanation, JEV shadow, LLM; opus/high), Engineering (wearable/sync/version states, implementability; opus/high). Research, PCG, Designer, Data, Quality, Release and Product Engineer dispensed with reasons in the mission record. Python helper unavailable (no Python 3.11+); routing matrix applied manually.

Single new product artifact product/UX_SPECIFICATION.md, downstream of PA/EM/CF-1.1 under Canon 3.0.0, RS/AEC/PDM-1.1, PDR-1.1, AEOS-1.0-r2 and AESL-1.0-r2; no new authority. Canon, index CI-3.0.1, PTM/PDR and all 1.1 consumers, AEOS and Lab stay byte-identical; index update recommended only after Founder approval. Baseline: 174 files in audits/ux-spec-2026-10-18/BASELINE_MANIFEST.json; AEOS mission snapshot aa31d509599972d160fdaa7d7fbb07b152a7485ec8ef820eff36dd4747b842ad; ledger pre-edit 63457 bytes e9f1a60103baaca9cf028369a06123c933aff99cc51177f0c3d89502054e66c1. Mission record: audits/ux-spec-2026-10-18/MISSION_RECORD.md. IN_PROGRESS_DOCUMENTATION_ONLY; IMPLEMENTATION_AUTHORIZED=NO, FIGMA_AUTHORIZED=NO, VISUAL_DIRECTION_AUTHORIZED=NO. HARD STOP after specification, reviews, verification and Founder report A-R with DETAILED_UX_READY_FOR_FIGMA.

## 2026-10-19 — Detailed UX Specification closed / UXSPEC-20261018

Closure resumed in a new Claude session after the previous one ended at its usage limit during the r3 revalidation; no work was redone. The previous judge instances could not be resumed, so four fresh judges (UX opus/max, Security/AI/Engineering opus/high) revalidated only their own r2 findings and the r2→r3 diff (D-UXS-06). All four returned PASS 0 BLOCKING / 0 MATERIAL / 0 NON_BLOCKING on UXS-1.0-r3 598b055d8df6cf67cafe0365e88d0ba694164d00c7ab6576fc2643eff5dcfcdb (UX c33eb0b0…, SEC 43bc25d8…, AI 99df7507…, ENG faceedbb…). Gates: UX_SPEC_STRUCTURAL_REVIEWED/VISUAL_READY, AI_BOUNDARIES_REVIEWED, ENGINEERING_CONTRACT_REVIEWED, Security documentary PB-F-02/03. Final-mode verification 334/334, exit 0, 2 intentional warnings (audits/ux-spec-2026-10-18/FINAL_VERIFICATION.json). Consolidation and A–R report: audits/ux-spec-2026-10-18/FINAL_CONSOLIDATION.md. DETAILED_UX_READY_FOR_FIGMA = YES (documentary). Canon, index and published consumers byte-identical. CURRENT_MISSION = COMPLETE_DOCUMENTARY_SPECIFICATION. HARD STOP: no Figma, no visual direction, no implementation, no next mission opened. Founder/Work Product Freeze sync is a separate future step.

## 2026-10-19 — V1 Freeze sync → targeted UX delta → Visual/UI opened / MISSION-VISUAL-1.0

Founder authorised in the current Claude session. Combined SIL + freeze + training addendum patch (sha256 28e0a78e…84d3; freeze commit 87537c8) applied onto 6d4a153 without checkout/reset → integration commit 32b7fb6. 16/16 frozen artifact hashes match V1_FREEZE_VERIFICATION.json. The legacy UXSPEC preservation verifier returns 306/27/2, and all 27 failures are intended freeze changes (classified in audits/v1-freeze-sync-2026-10-19/INTEGRATION_RECORD.md). The 334/0 pre-sync baseline and UXS-1.0-r3 598b055d… stay traceable. Targeted UX delta classified in audits/v1-freeze-sync-2026-10-19/UX_DELTA.md. Spec edits are limited to the status line and two table-continuity fixes. No material conflict; no judge cycle. UX DELTA SYNCED FOR VISUAL/UI. CURRENT_MISSION = MISSION-VISUAL-1.0 (visual exploration authorised; production code not).

## 2026-10-19 — Visual/UI delivery contract persisted / MISSION-VISUAL-1.0

Founder addenda: Figma is the official design deliverable and source of truth; V1 primary platform is mobile/iPhone/iOS; dark-first and light-ready; professional delivery standard; mobile ergonomics for workout execution and analytics. Persisted in UXS §24.1 (VIS-01–09) and the V1_RELEASE_SCOPE Transversal row (Android stays in release scope as an adaptation), and CURRENT_MISSION records the Figma file NeaZKGCzHMy6IHc47cVEHs. Figma write capability was verified before materialisation (Full seat, variables/styles/components created). Earlier HTML exploration is downgraded to internal-only.

## 2026-10-20 — Visual direction approved: S1.2 Selective Maturity / MISSION-VISUAL-1.0

Founder rejected Direction A (Calm Precision, kept as CANDIDATE A on Figma page 04). The S1 Visual Synthesis (current clarity + legacy richness, legacy inspected read-only under Founder authorisation) was approved as the base. A first maturity pass, S1.1, was rejected as too austere and kept only as a reference. The selective refinement S1.2 was approved "por enquanto" (for now), and work continues from it. S1.2 keeps the S1 richness and corrects only arbitrary or false-certainty elements: evidence-aware copy, plan vs actual and dual-axis readability, countable coordination proof with sample size, estimates with uncertainty, a shared strength scale and consistent session times. The judgment rules are persisted in UXS §24.2 (VIS-10–15), and VIS-09 now treats sport colour as a contextual layer rather than a chart rule. No production code. Design-system freeze is still a separate Founder decision.

## 2026-10-20 — Foundations and components rebuilt from S1.2 / MISSION-VISUAL-1.0

Figma file NeaZKGCzHMy6IHc47cVEHs. Page 01 Foundations: the existing variables and styles were reconciled to S1.2 rather than recreated. Changes:
- Updated: the dark tonal palette, and 18 text styles moved to Mona Sans + Barlow Semi Condensed.
- New variables: zones Z1–Z5 (dark and light), light accents, target band, plan block, chart grid and quaternary text.
- New styles: 10 gradient styles (contextual atmospheres and data ramps).
- New specimen board, which includes the evidence language.

Page 02 Components: the Candidate A components moved to 07 Archive without deletion, and the page 04 instances stay linked. The new component sets were extracted from the approved S1.2 screens and bound to variables and styles: navigation and controls, session and plan, strength execution, data and analytics, Evidence Block, and Chart Container (Default, Loading, Empty, Limited). Light mode is not yet validated. Text style coverage is partial, because S1.2 uses a few sizes outside the current type scale. No design-system freeze and no production code.

## 2026-10-20 — Type scale completed; V1 final screens assembled from components / MISSION-VISUAL-1.0

The type scale now has 25 roles taken from the sizes S1.2 actually uses: Data/11–34, Label XS/L/XL, Overline/S, Tag, Nav, Control and Body Medium. With them, all 396 component texts are bound to a style. On page 04 V1 Final Screens, the six S1.2 screens (Hoje, Execução de Força, Semana, Activity Detail, Progresso, Deep Dive) are rebuilt from instances of the page 02 components, 75 instances in total, and are visually identical to S1.2. The Candidate A screens moved to 07 Archive without deletion. Still open: states (loading/empty/error/adapted) applied on screens, flows/prototype, light mode validation, and the sport variants not yet designed (easy/long run profiles, strength-day hero). No design-system freeze and no production code.

## 2026-10-20 — Sport-scoped atmosphere; variants and states / MISSION-VISUAL-1.0

Founder decision: the sport atmosphere gradient is scoped to the sport's context. It appears only on sport-dedicated screens or inside a card scoped to one sport, never in the background of Hoje, Semana or Progresso. The Founder removed those glows directly in Figma; the rule is persisted in VIS-11, in the paint style descriptions and in the Foundations specimen.

New Figma components, all built from tokens:
- Session Profile variants (Intervals, Easy, Long progression) and Session Structure · Strength.
- Session Hero variants Run, Strength and Rest.
- Week Rhythm variants by day.
- Change Proposal (Presented, Applied, Stale), following CONF-01: scope, kept items, Observed fact, plan rule and trade-off, one explicit act.
- Rest Timer, Status Banner (Offline, Sync error, Changed) and Skeleton.

Page 04 V1 · Estados has seven state screens built from instances: Hoje on a strength day, on a rest day, with a pending proposal, offline and loading; Execução de Força during rest; and Progresso with limited data.

## 2026-10-20 — Run execution, same-day double sessions, flows and prototype / MISSION-VISUAL-1.0

Run Execution screens were added on page 04, in two states: interval in progress and paused. They follow VIS-07: a main metric readable at a distance, a target status, a session position marker and large controls. These are run-dedicated screens, so they carry the run atmosphere.

Same-day double sessions follow HOJ-C03: the sessions appear in the plan's order, each with its own execution, and the relationship between them is stated as a plan fact. New components: Session Compact Card (Run/Strength × Planned/Done) and the Week Day Row variant Type=Double. Two new Hoje states show a day with two sessions, morning and afternoon (strength done). Also added: a "proposta confirmada" Hoje state and the tokens run/muted and strength/muted (reduced tones without relying on paint opacity).

Page 05 Flows/Prototype has five flows with 24 hotspots and 5 starting points:
1. Run: Hoje → execute → pause → conclude → Activity.
2. Strength: series → rest → series.
3. Proposal: confirm, keep or undo.
4. Navigation: tabs → Análise (L3) → back.
5. Two sessions in the same day.

Tall frames scroll as whole frames in the prototype; fixed tab bars are not yet configured.

## 2026-10-20 — Slice completed: onboarding, first value, strength completed, shareable / MISSION-VISUAL-1.0

New components: Choice Card, Onboarding Progress, Effort Chip and Share Field Toggle.

New screens on page 04:
- **Onboarding · prioridade** (ONB-07). Balanced ("os dois a sério") is offered as a real option.
- **Primeiro valor** (ONB-13/17/18). A proposed coordinated week with a summary, the rhythm, the sessions, the plan rule and an honest limit; adopting it comes before any offer.
- **Força concluída**. Facts per exercise, an Observed comparison and an optional effort signal (ONB-19).
- **Compartilhar · prévia** (SHR-04/06). Allowlisted fields only; heart rate, exact time, location and health data are never offered.

Page 06 has the shareable card in Stories 1080×1920 and Square 1080×1080.

Page 05 adds flows 6 (onboarding → first value → Hoje) and 7 (strength completed → share), for 7 flows in total. Onboarding steps 1–2 and 4–6, the paywall (FLOW-17) and light-mode validation are still open.

## 2026-10-20 — Full onboarding and subscription screen / MISSION-VISUAL-1.0

Page 04 now has the complete onboarding:
1. Language and 18+ (ONB-02/03).
2. Goals per modality, with "no goal" declared rather than inferred (ONB-06).
3. Consent sheet, purpose-scoped to recommendation only; the final legal text is a slot (ONB-05, DEP-G07).
4. Priority, including Balanced (ONB-07).
5. Experience and recent practice in categories, with "não sei" (ONB-08).
6. Availability windows and time zone (ONB-09).
7. Equipment and a voluntary limitation question with no diagnosis (ONB-10/11).

It is followed by first value and then the subscription screen (SURF-14 / ONB-18). The subscription screen comes after value, keeps prices and terms as testable slots, has no urgency, offers "Agora não", and states that subscribing does not adopt a plan.

New components: Plan Option. Effort Chip was renamed Option Chip and its sizing fixed.

Page 05 flow 6 is now the full path: onboarding → first value → subscription → Hoje. The prototype has 7 flows and 33 hotspots. Still open: paywall states (pending, error, active, restore), light-mode validation, and a fixed tab bar in the prototype.

## 2026-10-20 — Subscription states, adoption order and WCAG contrast / MISSION-VISUAL-1.0

Subscription states (SURF-14): confirming with the store (nothing is charged or activated before the store confirms), error ("nothing was charged"), active (the store confirmation date is shown and the week is not yet adopted), and unknown (treated as neither active nor cancelled; logging and history keep working; Restore is available).

Adoption order fixed per ONB-13 / SURF-14: first value "Quero esta semana" → subscription → active → "Adotar minha semana" (a separate act) → Hoje. Prototype flow 6 is updated to match.

WCAG AA audit of the semantic text-on-background pairs, both modes. Primitive changes:

| Primitive | Old | New | Reason |
|---|---|---|---|
| neutral/400 (dark text/tertiary) | #6E737D | #82878F | was 3.6–4.1 on surfaces |
| zone/1-dark | #59606E | #686E7B | was 2.9 on surface |
| orange/700 (light run/accent) | #C94A12 | #B74310 | was 4.0–4.3 as text |
| zone/4-light | #B7791F | #AE731D | low margin for graphics |

Results after the change: text pairs ≥4.6 and graphics ≥3.3 in both modes. text/quaternary stays at about 2:1 and is documented as disabled/future content only (exempt under WCAG 1.4.3).

## 2026-10-20 — Onboarding r2, token binding, light-mode check, prototype scroll and handoff / MISSION-VISUAL-1.0

Founder request: a localized fix to the onboarding, then close the V1. It does not reopen UX, architecture or visual direction.

**Onboarding r2.** The principle is ASK ONLY WHAT CHANGES THE PLAN, AT THE CHEAPEST APPROPRIATE MOMENT. Changes:
- Language is no longer a step. It and units come from the system locale and can be changed in Profile.
- 18+ is an eligibility check on the welcome screen. It is not the athlete's age.
- New "Sobre você" step: date of birth, height and weight. Weight and height can be skipped.
- Experience now asks for recent frequency and approximate run volume, not only years.
- Availability is a multi-select of morning, afternoon and evening per day, using the new Window Toggle component (checkbox semantics). A typical session length is asked once and can be fine-tuned later.
- New step for running and strength on the same day: yes / some days (only days with two marked windows) / avoid. It is separate from availability.
- Equipment now covers specific home equipment.

The flow has 7 steps plus welcome and consent, and still ends at first value. Retired r1 screens are in 07 Archive as deprecated.

**Docs synced (minimal).** UXS ONB-01/02/03/08/09 and §6.2 are updated, and ONB-20 (profile data) and ONB-21 (same-day preference) are new. In AEOS AthleteState, `profile_context` is new and `practice_context` is extended. Profile data only initializes the model as context. It is never an isolated determinant and never produces a physiological claim without evidence.

**Figma.**
- New components: Window Toggle and Profile Field. Onboarding Progress now has 7 segments.
- Bound paints are now created with resolved raw colors. Paints created with black raw values rendered dark.
- Fixed colors were bound to semantic tokens: 183 paints on 04, 181 on 05 and 1 on 06. No raw solid colors remain in screens. This also moved 29 stale #6E737D texts to text/tertiary, applying the contrast fix.
- New alpha-carrying tokens: data/run-dim, data/run-strong, data/strength-dim, data/neutral-dim and overlay/scrim. Layer opacity on bound paints is avoided.
- Light mode was checked on clones of Hoje, Execução de Força, Activity Detail, Progresso and the onboarding. It is coherent. Dark was re-checked with no regression.

**Prototype.** Flow 6 was rebuilt with the 9 r2 screens. There are 36 hotspots and no broken links. The 20 tall frames now scroll inside 852 with a fixed status bar and a fixed tab bar or CTA.

**Handoff.** The Cover page has the index, conventions, the onboarding input→consumer map and known gaps.

Not done: design-system freeze, Profile/Settings screens, final legal and price copy. V1 visual is closed for Founder review.

## 2026-10-20 — Você (profile and settings) and provisional prices / MISSION-VISUAL-1.0

The Founder asked for the profile and settings area to be designed and set provisional prices.

**Prices (provisional).**
- Annual: R$ 199,90/ano, shown as equivalent to R$ 16,66 per month.
- Monthly: R$ 59,90/mês.

The trial length and the terms text remain slots. The prices are recorded in UXS SURF-14 and applied to the paywall, the "confirming" state, the prototype and the Plan Option component.

**Você (SURF-05/11–14).** Page 04 has seven new screens:
- Overview: profile; Meu contexto summary; subscription; connections; preferences; privacy; sign out.
- Sobre você (edit): saving does not change the week, and a proposal appears first if it matters. Includes "apagar peso e altura".
- Disponibilidade (edit): multi-window days, typical duration, per-day exceptions and the same-day preference. Leads to "Ver efeito na semana" (FLOW-02).
- Idioma, unidades e avisos: language and units start from the iPhone. Changing units changes display only. There are three notification switches.
- Assinatura: active status confirmed by the App Store, switching to monthly, manage in App Store, restore. Cancelling does not delete data.
- Conexões: Apple Saúde and Apple Watch, with one switch per purpose. Recovery signals are their own purpose and are off by default. Disconnecting keeps history.
- Privacidade e dados: three purposes (secondary learning off by default), the consent record (language and text version) and rights (export, correct, shares made, delete account).

New components: List Row (Chevron / Switch / None, with label, detail, value, icon and divider) and Switch. UXS ONB-09 now places the per-day duration fine-tuning in Você › Disponibilidade, and the onboarding hint is updated to match.

**Prototype.**
- New flow 8: Você → each sub-screen → back.
- The "Você" tab on the flow 4 screens now leads to it.
- Flow 6 has its name back; it had been reset to "Flow 1".
- Totals: 8 flows, 53 hotspots, no broken links.

Light mode was checked on Você, Assinatura and Preferências. The Cover handoff is updated.

## 2026-10-20 — Product design hardening (direction locked) / MISSION-VISUAL-1.1

The Founder opened the hardening phase. VISUAL DIRECTION IS LOCKED. Only polish, consistency, stress tests, edge states, components, prototype, QA and handoff are allowed. The rules are in UXS §24.3 VIS-16–20, and CURRENT_MISSION is revised to 1.1.

**Figma structure.**
- Pages: 01 Foundations · 02 Components · 03 Final V1 Screens · 04 Flows / Prototype · 05 Shareable Outputs · 06 States / Edge Cases · 07 Archive / Deprecated.
- The explorations (S1, S1.1, S1.2) were moved into Archive.
- The states sections and the subscription states now live on 06.

**Selection.** Choice Card, Plan Option and Window Toggle now use one language: raised surface, border/strong and a filled check badge (checkbox for multi-select). This replaces the white border with a white dot.

**Onboarding polish.**
- Single-choice priority advances on tap, with no CTA.
- Shorter microcopy.
- "Cerca de 3 minutos" is restored.

**First value.**
- Title is now "Sua semana está pronta.", with the goal in the overline.
- Three specific plan facts.
- An honest question: the long run (~1h40) exceeds the declared 60 min.

**Component hardening.**
- Week Day Row: titles and details truncate. New states: Missed (no make-up), Changed (MUDOU tag + before→after), Done Run/Double, and Today for Run/Strength/Double.
- Week Stat: one segment per planned session (up to 9), using the sport/muted token.
- Set Row: Warm-up and Skipped states.
- Exercise Header: long names wrap to 2 lines.

**Stress test on page 06 (VIS-18).**
- A–G weeks; H PR; I partly failed intervals; J limited data; K no HR; M manual log; L plateau/deload/missing RIR; N strength under stress; O–Q run steps.
- Fixed along the way:
  - Green was used for stable/0%/deload and for "no target"; these are now neutral.
  - Sessions without HR or without splits no longer claim HR, laps or map data.
  - A single-step run no longer offers "pular etapa".
  - Scenario F now uses the same change reason as the Change Proposal.

**New surfaces** (needed for the golden paths):
- Sessão (planned facet, SURF-07).
- Mudança aplicada (SURF-06).
- Deep Dive de corrida (SURF-03 L3).

**Prototype.** Flows A–F are named (onboarding→Hoje; strength→post-workout; run→Activity; week→session/change; progress→run deep dive; progress→strength deep dive), plus flows 3, 4, 5, 7 and 8. There are 61 hotspots and no broken links.

**Foundations.**
- New Motion variable collection: durations, stagger, reduce-motion rule.
- Specs for selection, data-colour semantics and motion.

**QA.**
- iOS picker sheet state for profile edits.
- Light mode checked on the new pieces; dark checked throughout.

**Real pending items:**
- Week Rhythm, strength-lift bars and small multiples are illustrative drawings that engineering must render from data.
- Dynamic Type at AX sizes is validated in code.
- Motion and haptics are specified, not animated.
- Legal text and trial length are still slots; the price is provisional.

## 2026-10-22 — Experience authority decontamination / MISSION-EXPERIENCE-1.0

**Decision provenance:** current direct Founder request, preserved in `audits/experience-decontamination-2026-10-22/FOUNDER_REQUEST.md`; imported ChatGPT preview is context only. Contract `EXP-20261022-r1`; artifact `EXP-AUTH-r1`; inputs = pre-mission bodies/snapshot + current request. PCG is the documentation worker; Chief coordinates independent Research fidelity and Product/UX interpretability review. T3/R1/L2, A4 authorized; evidence_policy=doctrine_audit. No validation of physiology, market or implemented capability is claimed.

**Current → target:** MISSION-VISUAL-1.0 plus 1.1/1.2 and old final-source/locked-design instructions are superseded as active experience authority. Product identity, all invariants, domain intelligence, valid behavioral principles, evidence, privacy/security and business constraints remain. Old mission exact bytes—including uncommitted addenda—are in `governance/snapshots/2026-10-22-pre-experience-decontamination/CURRENT_MISSION.md`, SHA-256 `341da57ad9aa06c8c469177d1ff837bbe381c0c51192035ab1aa35af1fdc84a9`. All preexisting product/canon text is retained in place with scoped overlays; this ledger is append-only. The freeze integration at `32b7fb6` is acknowledged without transferring historical gates.

**Delta:** entry files select a clean rehydration route; CI-3.3.0 applies A product/domain / B independent behavioral principles / C legacy experience at responsibility level; PDR-1.4 DR-93–97 and PTM-1.3 S10 record authority, supersession and impacts. Each mixed/standalone canonical consumer has an EXP-AUTH-r1 filter so old placement text cannot revive IA/style through file rank. The single derived `product/DESIGNER_PRODUCT_CONTEXT.md` explains actual specified product depth, data/states and claim limits, subordinate to existing authorities; it is not a parallel contract.

**Design status:** old file `NeaZKGCzHMy6IHc47cVEHs` = LEGACY / SUPERSEDED AS ACTIVE UX AUTHORITY. Independent new Figma = NEW EXPERIENCE CANDIDATE / ACTIVE DESIGN EXPLORATION; identity/link not supplied. No final Experience/Design Source of Truth designated before intellectual reconciliation, claims audit and explicit promotion. No Figma file has been read, compared or edited in this mission; no visual/structural solution is imposed.

**Preserved semantics:** Inspect≠Execute; progressive disclosure; agency and current version before material mutation; model learning≠plan mutation; no false insight/evidence-aware copy; historical continuity and planned/chosen/executing/observed distinctions; external own share V1; current route/photo explicit-choice privacy limits (DR-91); DR-92 history/session/rescheduling/block continuity without inherited placement; primary mobile/iPhone/iOS; provisional prices and still-open trial/legal text. G01–G11 remain unchanged as the single approval-gap inventory. Claims review covers readiness/regional scores/interference/e1RM/volume/progress/recovery/learning without inventing instruments or proving implementation.

**PCG self-check (author, not approval):** current human authority and recoverable history identified; no invariant/domain body removed; two epistemic/normative axes explicit in PDR; A/B/C split and design space distinguishable; material overrides scoped with IDs/sources/dependents; no layout requirement added; snapshot and append-only history retained; open candidate identity and existing G01–G11 assigned to their owners/triggers. Deterministic proof and independent reviews/consolidation are recorded by Chief in the mission audit at the evaluated revisions.

**Author handoff:** GOVERNANCE_READY_FOR_REVIEW. Consumers: Chief → fresh independent fidelity/interpretability reviewers → Chief consolidation; after accepted documentary handoff, future designer reads entry → index current filter → derived context → optional narrow domain sections. Prior visual/UX gate coverage no longer grants active experience authority; prior domain reviews remain historical evidence only for their hashes. No PRODUCT_CONSTITUTION_READY, final design promotion, consumer acceptance, implementation or release approval is self-declared here. Stop after the current documentary gates/disposition; no design continuation is authorized by this entry.

<!-- EXP_CLOSURE_METADATA_START: EXP-CLOSE-r1 -->
## 2026-10-22 — Chief consolidation and documentary closure / EXP-CLOSE-r1

**COMPLETE_DOCUMENTARY_DECONTAMINATION.** Chief /root consolidated PRODUCT_CONSTITUTION_READY for EXP-AUTH-r1 documentary authority formalization only. Fresh fidelity and interpretability reviewers both returned PASS with zero findings; 118 objective checks passed. Publication EXP-PUBLISH-20261022-001 applies the authorized documentary classification in the live index and consumers. [Final disposition](audits/experience-decontamination-2026-10-22/FINAL_DISPOSITION.md) retains the frozen package/review hashes, final closure-only proof, remaining inventory gaps and future approval triggers. This appendix records completion and handoff emitted through the live entry path; it changes no domain/experience scope and does not claim future designer acceptance or final design promotion. No Figma edits, new visual solution, product implementation, commit or branch change. STOP.
<!-- EXP_CLOSURE_METADATA_END: EXP-CLOSE-r1 -->


## 2026-10-22 — Training Domain Foundation 0.2 candidate + bounded human G01/G02 review / TDF-HR-0.2-r1

Direct Founder request: preserve supplied 0.2 and audit, integrate candidate and prepare scope/population plus lower × threshold for a real qualified professional. [Candidate](product/candidates/training-domain-foundation/0.2/README.md) = CANDIDATE / NON-AUTHORITATIVE; READY WITH FIXES FOR DELIMITED HUMAN REVIEW; NOT PRODUCT/DOMAIN TRUTH. [Review brief](reviews/human-domain-review/training-domain-foundation-0.2/00_REVIEW_BRIEF.md) leads to G01, two controlled priority cases, policy candidates, blank decision form, bounded evidence and traceability. [Audit/provenance](audits/training-domain-foundation-0.2/README.md) preserves both input ZIPs and closure r4 separately, SHA-256 and preexisting repository state.

Routing T2/R1/L2; current instance authors, one fresh Research/Evidence judge checks documentary fidelity after deterministic checks; no physiological approval. The original 15 foundation files stay byte-identical. CURRENT_MISSION receives an additive locator; active canon and Product Truth, PDR, AE/Run/Strength, runtime and Figma are untouched. Preexisting changes are preserved and excluded from this mission's commit. Next gate: human G01 scope and G02 rule/case decisions by artifact/version with credentials, rationale and conditions. G01–G04 = HUMAN_REVIEW_REQUIRED; eight QUESTIONABLE (S01/S02/S05/S12/S13/S14/S28/S29) unchanged; C1–C6 sporting-open. No new r5, catalog expansion, runtime or automatic promotion. Completion proof and documentary review are recorded in the audit; preparing review is not approval.


## 2026-10-23 — Provisional scientific domain reviewer / SSCTR-AUTH-r1

Direct [Founder authorization](audits/sports-science-agent-2026-10-23/FOUNDER_REQUEST.md), not imported conversation authority. Current→target: the existing blank human packet/Foundation candidate stay intact; human-only administrative review eligibility is superseded for bounded evidence-supported nonclinical internal sporting items by a permanent project **PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY**. No human credentials, clinical/legal equivalence, empirical validation or runtime sovereignty. Clinical dependencies remain human-only. PDR DR-98–102 records the authority delta; current mission and canonical index hold narrow pointers, not policy promotion.

PCG created [constitution/role registry](governance/agents/sports-science-reviewer/CONSTITUTION.md), versioned scientific protocol, project skill/native thin adapters, template/decision schema, escalation and future human revalidation rules. Routing T3/R2/L3/A4; [Task Contract](audits/sports-science-agent-2026-10-23/TASK_CONTRACT.md). Six edited entry/PDR/ledger files retain exact preexisting dirty bytes in [before snapshot](audits/sports-science-agent-2026-10-23/before/MANIFEST.json); original human/Foundation and Product Truth/AE/Run/Strength bodies remain protected. No Figma/runtime/global-state work.

Author handoff **GOVERNANCE_READY_FOR_REVIEW**, not self-approved. Chief owns deterministic and behavioral validation, distinct scientific pilot, fresh Research fidelity/ProductUX interpretability review and final consolidation/publication evidence for current revisions. Scientific pilot evidence sufficiency is separate from doctrine_audit; cases/claims may remain open. Every approved prescriptive decision must link a future funded-human queue item; no AI veto over later qualified human review. Completion and actual pilot dispositions are recorded separately by Chief, never inferred from this author log.


<!-- SDC_LEDGER: SDC-20261023-r1 -->
## 2026-10-23 — Sports Domain Closure Round

Direct Founder authorization executed as offline provisional internal review, with separate authors, SSCTR source/policy judge and governance consistency judge. Mission completed with explicit retained gaps; SPORTS_DOMAIN_READINESS=NOT_READY and AE_RUNTIME_IMPLEMENTATION_READINESS=NO_GO. 48 independent scientific dispositions (31 conditional approvals); 13 prior queue entries preserved, 33 new entries, 46 total; funding not declared. Strict 89/890 audit remains62PASS/19ACCEPTABLE/8QUESTIONABLE; 43 new sporting variants and29 semantic witnesses have distinct denominators. No runtime/Figma/Truth/clinical/human validation. Report and current proofs: [SDC](reviews/sports-domain-closure/2026-10-23/SPORTS_DOMAIN_CLOSURE_REPORT.md), [audit](audits/sports-domain-closure-2026-10-23/TASK_CONTRACT.md). Earlier mission states and working-tree changes are preserved.


## 2026-10-23 — ACF-1.0.0-r1 — candidate foundation delivered with retained blockers

Direct Founder mission produced7pillars,16Run/8Strength recipes,20consumed policies,9synthetic athletes/weeks,4week block and24documentary E2E scenarios. Separate authors/synthesis/SSCTR adversarial/governance;57scientific records(42conditional approvals/15limited); queue46+42=88 with funding NOT_DECLARED. Candidate/non-authoritative only. Four full-target verdicts NOT_READY/NOT_READY/NO_GO/NO_GO; bounded-contract supplemental readiness separate. Full autonomous-coaching definition of done not met while essential positive gaps remain. See product/candidates/autonomous-coaching-foundation/1.0.0/FINAL_REPORT.md and GATE_DISPOSITION.json; provenance/baseline in audits/autonomous-coaching-foundation-2026-10-23. No runtime/UI/Figma/Truth promotion;0.2and historical89/890/eightQUESTIONABLE unchanged. Current mission entry links the authorized next owners; no automatic implementation authorization.


<!-- NFV1_LEDGER: NFV1-20261023-r1 -->
## 2026-10-24 — New Figma V1 completion / NFV1-20261023-r1

Direct [Founder request](audits/new-figma-v1-completion-2026-10-23/FOUNDER_REQUEST.md): complete the independent new Figma `TYR10AIrquCpKvKL3eyXyO` as the sole experience authority. Delivered pages 1–9 (all V1 flows, adaptations, recovery, sharing, settings, race, states, languages, stress, navigation map and adversarial audit) with truth corrections to pre-existing screens. Figma-only; no runtime, legacy Figma untouched, no Product Truth promotion. Open items (ES scope delta, G10/G07 subscription, ACF-G04 taper, RRM-03 personal ranges, G06 integrations, deletion timelines, "Rotas no app" default) are recorded in the [delivery report](audits/new-figma-v1-completion-2026-10-23/DELIVERY_REPORT.md).


## 2026-10-24 — BSR-0.1.0 first executable bounded shadow core

Direct Founder implementation mission authorizes a pure offline synthetic core and current conformance/simulation/review only. New module lives in CoachingCore; existing dirty documentary sources and88-item human queue remain protected. T3/R2/L2: root authors/integrates, a disjoint semantics worker implements G03/G04, fresh independent SSCTR fallback and Quality judges review current hashes. No UI/Figma/release/real-user/official-plan effect or Product Truth promotion. Exact supported future proposals, KEEP/control branches and failure-closed gaps are measured separately. See CoachingCore/artifacts/FINAL_REPORT.md, VERIFICATION.json and audits/bounded-shadow-runtime-2026-10-24 for final current evidence and retained blockers; this entry is a mission locator, not self-approval.


<!-- NFV1_LEDGER: NFV1-GATES-r1 -->
## 2026-10-24 — New Figma V1 gate decisions / NFV1-GATES-r1

Direct [Founder decisions](audits/new-figma-v1-completion-2026-10-23/FOUNDER_DECISIONS_2026-10-24.md) closed the seven NFV1 open items: ES joins the V1 languages; displayed prices are provisional and post-expiry access stays open (G10); taper and race week only under approved policy (ACF-G04); no sleep/HRV personal-range claims without an approved rule (RRM-03); integrations follow product authority (Garmin, COROS and Polar as candidate routes under G06); deletion legal parts stay G07; route display and sharing off by default, separate from GPS permission. Formalized as PDR DR-103–109 with scope, index, designer-context and language-list sync. Minimal edits applied in the new Figma TYR10AIrquCpKvKL3eyXyO (no visual redesign, legacy Figma untouched, no runtime); see the [gate closure](audits/new-figma-v1-completion-2026-10-23/GATE_CLOSURE_2026-10-24.md). Promotion to final Experience/Design Source of Truth and UI implementation remain Founder acts.


<!-- DOMAIN_CLOSURE_R2_LEDGER: DCR2-20261024-r1 -->
## 2026-10-24 — DOMAIN CLOSURE R2 positive prescription expansion

Direct Founder request authorizes bounded offline Node reference expansion of ACF-G01–G05, without UI/Figma/KMP/production/real-athlete effects or Truth promotion. Root authors/integrates; separate scientific synthesis, representative corpus, adversarial SSCTR, runtime Quality and governance instances provide independent evidence. Fifteen policy requests yield12 exact conditional approvals and3 taper abstentions; all approved prescriptions have runtime bindings, development fixtures/tests/traces and new entries in the single future-human queue (88preserved+12=100). Independent corpus42 remains separate from development:1 positive,6 substantiveASK,33 unsupported,2 clinical; transport failures do not become usefulASK. Full V1readiness remains NOT_READY; next engineering step DOMAIN_CLOSURE_R3. See [current report](CoachingCore/r2/FINAL_REPORT.md) and [verification](CoachingCore/r2/VERIFICATION.json). This locator records the bounded mission, not real-person efficacy or runtime activation.


<!-- NFV1_LEDGER: IDV-1 -->
## 2026-10-24 — New Figma identity refinement pass / IDV-1

Direct [Founder request](audits/new-figma-identity-pass-2026-10-24/FOUNDER_REQUEST.md): raise identity, life and personality with maturity, preserving the experience. The critical reading and three real variants (A Instrumento, B Editorial, C Assinatura) were built on the same surfaces; the Founder rejected serif and chose C. Applied across the new Figma TYR10AIrquCpKvKL3eyXyO: Sofia Sans Semi Condensed brand voice for titles, numbers and eyebrows; Inter for reading; sport light only in sport-scoped contexts; a day marker. These are systemized as text styles, paint styles, tokens and the components Marcador do dia and Luz de esporte. Visual only (T2/R1/L2); no structure, content, state, runtime or legacy-Figma change. An independent UI judge (Opus 5.5 max, read-only) gave PASS WITH CONDITIONS (contrast MUST on lit labels plus four SHOULDs), then PASS / UI_READY after fixes; its six COULD polish items were applied. See the [identity pass record](audits/new-figma-identity-pass-2026-10-24/IDENTITY_PASS.md).


<!-- NFV1_LEDGER: NFV1-ACCESS-r2 -->
## 2026-10-25 — New Figma account access completed for Founder review / NFV1-ACCESS-r2

Direct [Founder request](audits/new-figma-account-access-2026-10-24/FOUNDER_REQUEST.md): V1 account access offers Apple, Google and e-mail + password. The work resumed from the persisted [checkpoint](audits/new-figma-account-access-2026-10-24/CHECKPOINT.md) after a Founder pause, and no decision was reopened.

Scope: Figma `TYR10AIrquCpKvKL3eyXyO` only. The legacy Figma is untouched. No runtime, no Product Truth promotion.

The current instance owned the design as UI & Experience Designer on Opus 5.5 at max effort. Fresh read-only instances judged it:
- **Security**, until PASS for the design;
- **UI**, until UI_READY in round 4.

A **Product/UX Architect** instance (ARCH-ACX-r1) decided the Apple/Google branches:
- Apple/Google with no account creates one only by explicit choice, with the terms, through AC-04f;
- signing in to an existing account lands where the account is (AC-11 → Hoje), never back in onboarding;
- AC-04g is reserved for G08 item 5.

The Chief accepted 18+ before any identity (ON-01b; option 8B) as conformance with ONB-03, DEG-24 and DR-53. That closes the design side of Security item 8; the alternative 8A would need a Founder/legal decision.

Delivered in the Figma:
- AC-01–11 with their states;
- ON-01b, the neutral ON-V6, AC-04f and ON-02b;
- CF-17–19 with CF-18b/c;
- the account e-mails (a)–(g) in PT-BR (section 2.5); their PT-BR/EN/ES copy is in [ACCOUNT_EMAILS](audits/new-figma-account-access-2026-10-24/ACCOUNT_EMAILS.md).
- A shared Apple/Google provider button, wordmark and field components, and a `texto/placeholder` token.
- A file-wide fix of in-field label contrast, from 4.40:1 to at least 5.02:1.

Still open:
- G08/G09 security parameters and the G07 legal parts;
- Founder/legal item 9 (deletion after an account takeover);
- PDR DR-110, written in the checkpoint but not applied while DOMAIN CLOSURE R3 runs R2's verifier, which hashes the PDR.

Promotion and implementation still need explicit Founder authorization.


## 2026-10-25 — DOMAIN CLOSURE R3 / DCR3-CLOSE-20261025-r1

Closed bounded offline reference mission with retained V1 gaps. [Report](CoachingCore/r3/FINAL_REPORT.md) · [verification](CoachingCore/r3/VERIFICATION.json) · [gate consolidation](audits/domain-closure-r3-2026-10-24/FINAL_DISPOSITION.json).42 frozen logical cases,42schema-valid,40normal material-consumable,2positive/2KEEP/15usefulASK/2correctHOLD/16domain/3science/2clinical.209/209tests;13/13checks;365exact historical unique-input replays;84scripted canonical multiweek rows. Independent current Quality=QUALITY_READY; SSCTR=PASS_BOUNDED_SCIENTIFIC_BINDING (126/126probes); one new conditional steady approval, strides ABSTAIN, queue100preserved+1=101, fundingNOT_DECLARED. Source facts/expectations and legacy/R2 runtime/scientific source bytes preserved. Historical R2 verifier hash staleness is explicit; fresh R3 gates supersede only the reviewed descendant scope. Full V1 coverage/autonomy staysNOT_READY/NO_GO. Next stepDOMAIN_CLOSURE_R4; no KMP/UI/production/real effects or Product Truth promotion. Other concurrent mission state remains its own authority.

## DCR4-20261025-r1 — 2026-10-25

Founder-authorized offline Node24 Coaching Intelligence mission. Reusable envelopes replace exact-dose paper matching within approved scientific boundaries. R3 frozen40 unchanged; independent holdout and scientific/coaching-quality review required. See audits/domain-closure-r4-2026-10-25/TASK_CONTRACT.md and CoachingCore/r4/FINAL_REPORT.md. No UI/Figma/KMP/production/real-user effect or Product Truth promotion. Status initially IN_PROGRESS; final closure is recorded in the linked verification/report, not inferred from this append.

## DCR4-CLOSE-20261025-r1 — 2026-10-25

DOMAIN CLOSURE R4 delivered with retained V1 capability gaps. Coaching Intelligence/envelopes/ordinal selection and bounded athlete evidence implemented offline in Node24; original frozen40 and sealed independent24 preserved. Current independent scientific/Quality gates and final13-check verification are linked by CoachingCore/r4/FINAL_REPORT.md. 239tests pass;365historical inputs replay exactly. Raw frozen positives2→18, domain gaps16→0, but all18 frozen positives are only ACCEPTABLE_ALTERNATIVE; holdout has7BEST_SUPPORTED and1ACCEPTABLE positive. No autonomous/quality/coverage readiness inflation. Human queue101+9=110, no per-workout queue explosion. NextDOMAIN_COACHING_R5 under separate authorization. No UI/Figma/KMP/production/real-user or Truth mutation. Historical dirty checkout preserved.


<!-- DCR5-DELIVERY-20261026-r1 -->
2026-10-26 · DOMAIN_COACHING_R5: local offline Node24 reference and required evaluation artifacts delivered with retained capability gaps. Full autonomous Definition of Done=false; coaching QUALITY_BLOCKED/NOT_READY.280tests;14/14 objective checks; fresh24 first raw preserved;4BEST/4ACCEPTABLE/3SUBOPTIMAL/6INSUFFICIENT/7UNSUPPORTED. Next DOMAIN_COACHING_R6, not started. [Disposition](audits/domain-coaching-r5-2026-10-25/FINAL_DISPOSITION.json). No UI/Figma/KMP/production/real-plan effect or commit/merge/deploy.

## OB2-20261025-r1 — 2026-10-25/26

Founder-requested onboarding, account and paywall revision on the new Figma `TYR10AIrquCpKvKL3eyXyO`, with documentary sync. Decisions in PDR-1.7 (DR-110–116):
- DR-111: the questionnaire comes before the account and stays on the device until then; the pending DR-110 was applied with it.
- DR-112: the chosen training days and shift for each sport are binding, and the long run falls on one of the run days.
- DR-113: a strength exercise-rotation preference; load keeps progressing on the exercises that stay.
- DR-114: optional sex and a units switch.
- DR-115: "Recomendado" only where it comes from the person's answers.
- DR-116: the annual plan is emphasized on the paywall.

Gates for the Figma revision of 2026-10-26:
- Product/UX: Architecture Eval PASS, with VISUAL_READY;
- UI_READY;
- Security PASS (SECURITY_READY_WITH_CONDITIONS);
- SSCTR binding Q1–Q5 BOUND.

SSCTR and Security reviewed before drawing. The four judges then ran round 1, a re-check and a spot check.

Thirteen product/canon files were synced on 2026-10-25. The pre-change copies are in the audit, and R4's historical verifier reports these files as changed, as expected. DOMAIN_COACHING_R6 opened on 2026-10-26 at 10:08 and binds every product/ and canon/ file, so two things wait:
- the 34 round-2 doc corrections, held in PENDING_DOC_CORRECTIONS_R2.json (r2), with an apply script that refuses while R6 is open;
- three SSCTR queue items in QUEUE_ADDITIONS_PROPOSED.json, because verify-r5 asserts 114 items.

Open:
- what "A cada 2 semanas" rotates (Founder);
- where a return after illness goes (G04 + Product/UX);
- the DR-112–114 mapping into CoachingCore, for the next coaching mission that takes it;
- G07, G08, G09 and G10.

No runtime change, no promotion. [Checkpoint](audits/new-figma-onboarding-v2-2026-10-25/CHECKPOINT.md).

<!-- OB2-ROTATION-20261026 -->
2026-10-26 · OB-2: the Founder decided that "A cada 2 semanas" keeps the main exercises and rotates only the accessories and close variants of the main lifts (SSCTR Q3 option a). The ON-14b helper and notes were updated, and SSCTR checked the change as BOUND. Four ops were added to the held doc corrections, now r3 with 38 ops (ops 1–34 unchanged); they are still held while DOMAIN_COACHING_R6 is open. Which exercises count as main ones and what counts as a close variant stays with the rotation recipe (training policy + SSCTR).

<!-- DCR6-CLOSE-20261027-r1 -->
2026-10-27 · DOMAIN_COACHING_R6: closed with an explicit blocker under the Founder bound (SSCTR round 12 refused FREEZE-2 on D53, from-log path, and D54; runtime not frozen). Coaching QUALITY_BLOCKED/NOT_READY; first evaluation 4BEST/14ACCEPTABLE/9SUBOPTIMAL/1INSUFFICIENT/4UNSUPPORTED/2CLINICAL/1CORPUS_ERROR of 35; 443 tests; queue 114→127. Next DOMAIN_COACHING_R7, not started. [Disposition](audits/domain-coaching-r6-2026-10-26/FINAL_DISPOSITION.json). No UI/Figma/KMP/production/real-plan effect or commit/merge/deploy.

<!-- VWS-20261027-r1 -->
2026-10-27 · V1 wearable scope (post-R6 product scope supersession, direct Founder request). PDR-1.8 DR-117–119 records three decisions:
- Apple Health/HealthKit (iOS, read-only) is the only V1 external layer;
- direct Garmin/COROS/Polar, vendor OAuth, FIT ingestion and watch outbound are V2/POST_V1 and never a V1 blocker;
- generic external-data semantics are preserved, and the Coaching Core stays vendor-agnostic.

Overlays in index, thesis, RS, AEC §5, PDM, UXS, PTM and the designer context; pre-change copies are in the audit. R6 is untouched (606 files hash-verified). Open: OPEN_PRODUCT_PLATFORM_DECISION-01 (Android); the OB-2 held corrections need their owner's re-check. Next coaching mission: rehydrate from RECORD §6. No implementation, Figma or R7 start. [Record](audits/v1-wearable-scope-2026-10-27/RECORD.md).
