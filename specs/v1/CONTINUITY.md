# Checkpoint de continuidade

Retomar com: **"Continue o desenvolvimento do RepMile de onde parou."** Leia isto, rode `node tools/orchestration/status.mjs`, siga
"Próxima ação". Não depende do histórico de conversas.

**Atualizado:** 2026-11-27 (tarde) (sessão Engineering Orchestrator, worktree `~/.codex/worktrees/myapp-v1-engineering-orchestration/MyApp`).

## Pausa

Sem pausa ativa. Última pausa: 26/11 ~18:45 → retomada em 27/11 ~09:30 (checkpoint `76e14ce`). Na retomada: PR #67 com CI 4/4 → merge
`e593496`, viewer atualizado; #59 retomado do WIP `289811a`; #68 iniciado; worktrees temporárias removidas.

## Pendências exatas para a próxima sessão (limite de uso atingido em 27/11, ~20:40 UTC)

1. **Quadro (API do GitHub voltou):** mover #110→Ready, #111→In Review, #21→Ready, #29→Ready, #55→Ready (tirar `needs:founder-approval` antes; as decisões já estão registradas nas issues). Registrar com `decisions.mjs record` as respostas do fundador em #47 (7227432034, B como objetivo, A na alpha), #66 (7227422748, B: aberta até o #101 validado), #74 (7227437457, A). Depois, `decisions.mjs check`.
2. **PRs #100 (#98) e #115 (#99):** o QRE deu READY_WITH_CONDITIONS nos dois.
   - **#100:** P2-1 (as rotas de folha precisam das mesmas condições do toque) e P2-2 (teste do `run` com `-scenario clock`).
   - **#115:** P1-1 (EN/ES inventados → PENDING_TRANSLATION, também nos 5 textos clínicos) e P2-1 (restyle do urgente fora do Hoje; precisa de visual + clínico).
   - **Visual:** READY_WITH_CONDITIONS no Hoje e NOT_READY no Plano (Dynamic Type P1 → passar ao #102).
   - **Founder Decision a abrir:** "Entendi" no Hoje, borda de rolagem da tab bar, frase do sinal removida (#87), rótulo "Pausado", relocação da arte de retenção.
   - Mandar as correções ao agente do #98/#99 (worktree `myapp-v1-c-i99`).
3. **Agentes que talvez ainda estejam rodando:** #101 onboarding (`myapp-v1-c-i101`), #102 Plano (`myapp-v1-c-i102`, C-3), #79 motor (`myapp-v1-int-i79`), #83 (PR #95, correções do QRE). Ver commits e PRs nas branches antes de relançar.
4. **Aprovados, ainda sem começar:** #109 CCP-ONB-1, #21 branch padrão (verificar antes), #29 GitHub App (preparar e documentar), #55 RIR (conferir o Figma 41 primeiro), #47 exploração da opção B.
5. **Governança:** PR #80 (o fundador confere e rotula; nenhum commit novo) e PR #116 (#112, empilhado sobre o #80).
6. **Eficiência:** o `board.mjs set` relê o quadro inteiro a cada chamada e causou o limite secundário do GitHub; cachear.

## Agora

| | |
|---|---|
| **Founder Decision** | Coluna no quadro, visão "Founder Decision", rótulo `status:founder-decision`. Processo: [WORKFLOW §8](../../docs/engineering/WORKFLOW.md). **Na retomada e entre lotes: `node tools/orchestration/decisions.mjs check`** (comentários do fundador depois do marcador de abertura; `record` grava na própria issue, de forma idempotente). Na fila: #21, #29, #47, #55, #66, #74, #79, #87, #109 (CCP-ONB-1), #110 (Cuidados), #111 (rótulo do PR #80), #112 (CURRENT_MISSION). Teste ponta a ponta: #108 (fechada), evidência em `audits/v1-engineering-orchestration-2026-11-26/results/founder-decision-queue/E2E.txt` |
| Explorações no Figma | Em produção por uma sessão nova com `ui-design-explorer` (a definição nova só aparece em sessão nova): `EXPLORAÇÃO — #101 — Lacunas do onboarding`, `#14 — Estados de segurança sem frame`, `#107 — Contraste no modo claro`. Quando prontas → cards Founder Decision com links |
| Reconciliação P0 | Matriz `specs/v1/FIGMA_MATRIX.md` (607 linhas; 0 MATCH) · causas em `specs/v1/quality/FIGMA_DIVERGENCE_CAUSES.md` · gate QUALITY_GATES §2b · #14 é o marco central; subtarefas #101 (onboarding, em implementação), #99 (Hoje), #102–#105 |
| Em andamento | **#101** onboarding (`ios-engineer`, `myapp-v1-c-i101`; decisões SSCTR D06/D12/D13/D14 aplicadas; partes que dependem de CCP ou de lacuna de design ficam retidas) · **#98/#99** (INT) · **#83** PR #95 (correções do QRE, C-2) |
| Integração / frente C | integração `6bc43620`; frente C `7932c133` (#70, #92, #94 à frente da integração) → C sync 4 quando #98/#99 entrarem |
| Simuladores | INT (#98/#99), C-2 (#83, depois #101), C-3 livre, **RepMile-Fundador só do fundador** |

## Branches e worktrees

| Frente | Branch | Worktree | Dono | Estado |
|---|---|---|---|---|
| A | `claude/v1-ios-coachinghost` | `myapp-v1-ios-coachinghost` | sessão A (ativa) | publicado `df9b69b`; trabalho local não commitado (exclusão, CCP-A-04). **Não tocar** |
| B | `claude/v1-ios-healthkit` | `myapp-v1-ios-healthkit` | sessão B (ativa) | publicado `3af17d4` (OPEN-1 política 2). **Não tocar** |
| C | `claude/v1-ios-swiftui` | `myapp-v1-ios-swiftui` (sessão C encerrada; não usar; ref local parada em `a8aefa0`) | orquestrador via `myapp-v1-c-closure` (frente) e `myapp-v1-c-i32` (incremento #32.1) | `origin` em `0a05d95` (inc. 01–10b, correção CI `24c9096`, #31, #32.1, #32.2) |
| Design | `claude/v1-figma-final-alignment` | `myapp-v1-figma-final-alignment` | — | `26ec95f` |
| Orquestração | `claude/v1-engineering-orchestration` | esta | orquestrador | PR #30 draft (não fazer merge) |
| Integração | `claude/v1-ios-integration` | scratchpad (efêmera) | orquestrador | `cbf051f` = orquestração + C (PR #42); ruleset PR + `CI` |

Outras worktrees (`myapp-p0-ios`, `myapp-v1-abc-foundation`, `myapp-v1-final`, `-five-zone`, `-foundation`, `-hr5-runna`,
`-test-sanitization`, `-ui-reconciliation`) são de missões anteriores: leitura apenas.

## Testes conhecidos

| Alvo | Resultado | Onde |
|---|---|---|
| C @ `ea2f44e` | XCUITest 34/34, RepMileUI unit 23/23, RunRecorder 10/10, contratos 29/29 + 10/10, 0 pulados | `audits/v1-ios-swiftui-2026-11-26/results/inc10-screen-required/` |
| #32.1 @ `b0f5f71` | unit 29/29, XCUITest 34/34 | `results/i32-1-onboarding-viewmodel/` + `ios/.build/sim-runs/20261126T174417Z` |
| CI PR #42 @ `24c9096` | 4/4 verdes (repo, npm test 1952, Swift packages com RepMileUI no Xcode 26.6) | run 45875414156 |
| #32.2 @ `fd4ef37` | unit 35/35, XCUITest 34/34 | `results/i32-2-run-report-viewmodel/` |
| `tools/orchestration` | 28/28 | `node --test tools/orchestration/tests/*.test.mjs` |
| swift-size | 0 acima do limite fora do baseline em C, A, B | `node tools/orchestration/swift-size.mjs --ref <tip>` |

## Revisões

| Alvo | Revisor | Veredito | Disposição |
|---|---|---|---|
| C inc. 08 (`c36532c..a8aefa0`) | QRE independente | NOT_READY (N1 P1 fail-open na recarga) | N1, N2, N5, N7, revalidação do gate da avulsa: corrigidos no fechamento; P2/P3 → #37, #38, #39; N2 SSCTR → #40 |
| C inc. 08 | SSCTR independente | READY_WITH_CONDITIONS; gate da avulsa = decisão provisória do fundador | condições → #37, #38, #40; textos clínicos INTERIM |
| C inc. 09 | verificação independente | NOT_READY (P1 nova: triagem REQUIRED com relato não guardado) | corrigido no inc. 10 |
| C inc. 10 | verificação independente | READY_WITH_CONDITIONS (F1 banner persistente, F2 teste) | F1/F2/F3 aplicados em `f8ed507` |
| #32.1 | revisão independente | READY (só P3: curva de animação, Task da View) | P3 anotados |
| #32.2 | revisão independente | READY (só P3: animação, 4 testes extras de VM) | P3 anotados |

## Visualização do fundador (Xcode)
Simulador **`RepMile-Fundador`** (iPhone 17 Pro, iOS 27.2) é **só do fundador**: nenhum agente usa. O Xcode do fundador compila no DerivedData padrão do Xcode, separado do `ios/.build/DerivedData-*` dos agentes.
Worktree só de leitura `~/.codex/worktrees/myapp-v1-viewer/MyApp` (destacada, nunca usada por agentes). Abrir
`~/.codex/worktrees/myapp-v1-viewer/MyApp/ios/App/RepMile.xcodeproj`. Atualizar com `tools/orchestration/viewer.sh` **depois** de cada
integração validada (CI verde e suíte do simulador no mesmo conteúdo). A worktree original da sessão C (`myapp-v1-ios-swiftui`) está
parada em `a8aefa0` e não deve ser usada para ver o app.

## Checkpoint de hardware (iPhone, agrupado; pedir ao fundador só quando a lista estiver pronta)
- [ ] Corrida real com GPS (RunRecorder), pausa, morte do processo e retomada; #38 retomada sob bloqueio (#19)
- [ ] HealthKit: autorização e leitura real com o build integrado
- [ ] #63 background delivery: app suspenso e encerrado pelo seletor → treino no relógio/iPhone → log sem cena: `hki.started` → `hki.backgroundDelivery code=REGISTERED` → `hki.observerFired`; enfileirado sem abrir o app, entregue quando A abrir
- [ ] #63 antes do primeiro desbloqueio: reiniciar, gravar treino, desbloquear → composição abre sozinha, raiz não fica no erro operacional
- [ ] #63 tempo: launch em background → `hki.observerFired` com `CoachingHost.open` no caminho; completion handler chamado antes da suspensão (B R2-03, #48)
- [ ] #48 R2-03: gravar treino com o app suspenso → log `hki.observerFired`, `hki.backgroundWindow code=GRANTED`, entrega, `code=ENDED` (`performExpiringActivity` em background não provado no Mac)
- [ ] #85: reenvio após falha longa (difícil no aparelho; o essencial está provado contra o motor real em Node) — opcional
- [ ] #76: tela de identidade danificada e erasure no aparelho (build de desenvolvimento)
- [ ] #63 Release no aparelho: sem `-scenario`, sem `Fixtures/`, abertura ao vivo
- [ ] #63 exclusão no aparelho: gravar e relatar corrida → excluir conta → relançar → onboarding sem gravação/relato de volta → novo cadastro
- [ ] #63 identidade danificada (build de desenvolvimento): `athlete-identity.json` corrompido → erro operacional, log `ACCOUNT_IDENTITY_DAMAGED`, arquivo nunca substituído
- [ ] CoachingHost no app integrado: aparelho bloqueado, reinstalação (já provados no lab de A; repetir no app)
- [ ] Desempenho de scroll e animação; Live Activity (#35)

## Bloqueios
- Integração A/B: aguarda as entregas finais revisadas das sessões A e B.
- Decisões do fundador: [PRODUCT_SCOPE §4](PRODUCT_SCOPE.md#4-decisões-pendentes-do-fundador).

## Próxima ação
Ver a seção "Agora". Comandos: `node tools/orchestration/status.mjs` · `node tools/orchestration/board.mjs show <n>`.
