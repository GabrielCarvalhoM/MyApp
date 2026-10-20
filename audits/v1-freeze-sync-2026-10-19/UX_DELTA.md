# Targeted UX delta — V1 freeze → Visual/UI

Base UXS-1.0-r3 (`598b055d…`, closed) → active UXS-1.1-FREEZE-r2 (from the freeze patch, four PASS reviews on its hash). The freeze patch already contains the content delta. This record classifies it for Visual/UI. Claude added only a status line and two table-continuity fixes (ONB-17, FLOW-17 were split from their tables by a blank line). No rule was changed.

## Surface / flow classification

| Item | Class | Where |
|---|---|---|
| SURF-01 Hoje / Today | MINOR_UPDATE | Composition kept; first value ends in Today with the plan adopted (NAV-02/09). |
| SURF-02 Plano → presented as **Week** | MINOR_UPDATE | Trust surface: integrated timeline Run × Strength, rest as an item, factual diff and reason (§1.2, §10.5). |
| SURF-03 Progresso | MINOR_UPDATE | Progressive Depth L1/L2/L3; L2 Running · Strength · Overall; deep analytics kept. |
| SURF-04 Crews / SURF-10 Crew space | REMOVE_FROM_V1 | Deferred, not rejected; no tab, placeholder or CTA. |
| SURF-05 Você | MINOR_UPDATE | Adds subscription management; no social mode. |
| SURF-06 Decisão | UNCHANGED | What changed / why / what was preserved / alternatives. |
| SURF-07 Sessão | UNCHANGED | |
| SURF-08/09 Execução Run / Strength | UNCHANGED | Operational speed first. |
| SURF-11 Meu contexto | MINOR_UPDATE | Priority Run-first / Strength-first / Balanced is editable with preview. |
| SURF-12 Integrações | UNCHANGED | Ingest-first; no vendor hub. |
| SURF-13 Privacidade | MINOR_UPDATE | No Crew permissions; subscription ≠ consent / deletion. |
| SURF-14 Assinatura / Paywall | NEW_REQUIRED_SURFACE | Contextual after value; managed from Você; not a primary destination. |
| FLOW-01 Onboarding | MINOR_UPDATE | ONB-06/07 goal hierarchy; ONB-13/17 coordinated week as AHA; ONB-18 value before hard ask. |
| FLOW-10 Share | MINOR_UPDATE | External Shareability V1 (§16 SHR-01..08); no feed or gallery. |
| FLOW-11/12/13/16 | REMOVE_FROM_V1 | Crew / social / conversation deferred. |
| FLOW-17 Value → offer → adoption | NEW_REQUIRED_SURFACE | First-value → subscription → plan adoption. |
| §17 Agent / conversation | REMOVE_FROM_V1 | Direct controls remain (PR-06). |
| §15 Nutrition | UNCHANGED | Contextual only; SURF-X-01 still rejects a hub. |
| §14 Wearables | UNCHANGED | Provider-neutral; no extra UX. |
| Visual language, dark-first + light, motion, card system, Run vs Strength treatment, chart order, share templates, paywall copy and price | VISUAL_PHASE_ONLY | UXS §24 design space. |

## Navigation (V1)
Four stable references: **Today · Week (Plano) · Progress · You**. No Crew. Execution persists across destinations (NAV-06). Subscription, Decision and Session are object/flow surfaces, not tabs.

## Coverage of the Founder's expected impacts
Crew removed ✓ · shareability kept ✓ · navigation simplified ✓ · Run-first / Strength-first / Balanced ✓ (ONB-07) · first value = ready week ✓ (ONB-13/17) · simple Run × Strength coordination ✓ (§1.2, ONB-13) · Week as trust surface ✓ (§10.5) · stable by default ✓ (§10.5, §23.1) · explainable material changes ✓ (§11) · agency accept / keep / see why ✓ (AG-01..03) · progressive analytics ✓ (SURF-03) · paywall journey ✓ (SURF-14, FLOW-17) · share without hub ✓ (§16) · Nutrition not a module ✓ · wearables not expanded ✓.

No material conflict found. No review cycle opened, because no new rule was introduced.

**UX DELTA SYNCED FOR VISUAL/UI.**
