# Specs da V1 — índice

Ponto de entrada do desenvolvimento spec-driven. **Estado operacional = quadro do GitHub Projects**
(https://github.com/users/GabrielCarvalhoM/projects/1); este índice mapeia spec ↔ issue ↔ código ↔ evidência. Retomada de sessão:
[CONTINUITY.md](CONTINUITY.md).

| Documento | Para quê |
|---|---|
| [PRODUCT_SCOPE.md](PRODUCT_SCOPE.md) | escopo, exclusões, decisões pendentes do fundador |
| [ARCHITECTURE.md](ARCHITECTURE.md) | módulos reais, camadas, padrão MVVM alvo, composição |
| [ROADMAP.md](ROADMAP.md) | milestones e dependências |
| [CONTINUITY.md](CONTINUITY.md) | checkpoint: em andamento, próxima issue, bloqueios, próximo comando |
| [quality/](quality/) | código e arquitetura · testes e revisão · segurança e privacidade · UX (visual, a11y, desempenho, motion) |
| `docs/engineering/` | workflow, gates, handoff, integração, validação visual (procedimentos; não repetidos aqui) |

## Funcionalidades

Legenda: **INT** integrado em `claude/v1-ios-integration` (26/11, PR #42) · **IMPL** implementado (código na frente) · **PARC** parcial · **NI** não iniciado · **ANDA** em andamento noutra sessão.
Validação: S = simulador (sintético) · I = iPhone · R = dados reais · — = nenhuma.

| Spec | Issues | Frente | Estado | Val. | Código | Evidência principal |
|---|---|---|---|---|---|---|
| [F01 Raiz e estados](features/F01-root-navigation-states.md) | #4, #7 | C | INT | S | `App/RepMileShell.swift`, `Data/AppModel.swift`, `Features/States` | `results/navigation-xcuitest.txt` |
| [F02 Design system](features/F02-design-system.md) | #5 | C | INT | S | `DesignSystem/`, `Copy/` | `INCREMENT_02_*` |
| [F03 Onboarding](features/F03-onboarding.md) | #8, #17, #26 | C (+A) | INT | S | `Features/Onboarding` | `results/inc07-onboarding/` |
| [F04 Hoje](features/F04-today.md) | #9 | C | INT | S | `Features/Today` | `results/inc02-today/` |
| [F05 Plano e detalhe](features/F05-plan-session.md) | #10 | C | INT | S | `Features/Plan`, `Features/Session` | `results/inc03-plan-session/` |
| [F06 Corrida no iPhone](features/F06-run-execution.md) | #11, #12, #38, #39 | C | INT | S | `Packages/RunRecorder`, `Features/Run` | `results/inc04-run-safety/` |
| [F07 Força e avulsos](features/F07-strength-and-unplanned.md) | #12, #37 | C | INT | S | `Features/Run/StrengthLogView.swift` | `results/inc04-run-safety/` |
| [F08 Adaptação e segurança](features/F08-adaptation-safety.md) | #9, #12, #39, #40 | C | INT | S | `Features/Adapt` | `INDEPENDENT_REVIEW_R1.md` |
| [F09 Histórico e Progresso](features/F09-history-progress.md) | #13, #27 | C | INT | S | `Features/History`, `Features/Progress` | `results/inc05-history-progress/` |
| [F10 Perfil, privacidade, zonas](features/F10-profile-privacy-zones.md) | #13 | C (+A) | INT | S | `Features/Profile` | `results/inc06-profile-zones/` |
| [F11 CoachingHost](features/F11-coaching-host.md) | #1, #16, #17 | A | ANDA | S, I (lab) | `Packages/CoachingHost` | `audits/v1-ios-coachinghost-2026-11-24/` |
| [F12 Apple Saúde](features/F12-apple-health-ingest.md) | #2, #16, #25 | B | ANDA | S, I (lab) | `Packages/HealthKitIngest` | `audits/v1-ios-healthkit-2026-11-24/` |
| [F13 Paywall](features/F13-subscription-paywall.md) | #33, #28 | C | NI | — | — | — |
| [F14 Gamificação](features/F14-gamification-sharing.md) | #34 | C | NI | — | — | — |
| [F15 Live Activity, motion](features/F15-live-activity-notifications-motion.md) | #35, #36 | C | PARC | S | — | — |

Caminhos de código são relativos a `ios/Packages/RepMileUI/Sources/RepMileUI/` salvo indicação; evidência relativa a
`audits/v1-ios-swiftui-2026-11-26/` (branch `claude/v1-ios-swiftui`).

## Transversais

| Issue | Assunto |
|---|---|
| #14 | validação visual Figma × simulador de todas as telas |
| #15 | branch de integração, workspace e raiz de composição |
| #18, #19 | jornadas XCUITest e iPhone ponta a ponta |
| #20 | decidir CCPs e publicar nova base |
| #21, #29 | ativação na branch padrão; identidade dos agentes (fundador) |
| #22 | teste do agent-runtime 74/75 |
| #32, #41 | MVVM e limite de 350 linhas na C |
