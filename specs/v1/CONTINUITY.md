# Checkpoint de continuidade

Retomar com: **"Continue o desenvolvimento do RepMile de onde parou."** Leia isto, rode `node tools/orchestration/status.mjs`, siga
"Próxima ação". Não depende do histórico de conversas.

**Atualizado:** 2026-11-27 (sessão Engineering Orchestrator, worktree `~/.codex/worktrees/myapp-v1-engineering-orchestration/MyApp`).

## Pausa

Sem pausa ativa. Última pausa: 26/11 ~18:45 → retomada em 27/11 ~09:30 (checkpoint `76e14ce`). Na retomada: PR #67 com CI 4/4 → merge
`e593496`, viewer atualizado; #59 retomado do WIP `289811a`; #68 iniciado; worktrees temporárias removidas.

## Agora

| | |
|---|---|
| Integração `claude/v1-ios-integration` | `e593496` = orquestração + A (#50) + B (#51) + composição real (#60, #16) + C sync 1 (#67: MVVM #32, #37, #38, #41, #58, #59a, #61). Visualização em `e593496` |
| Em andamento | **#72** (P0, triagem em "Não estou 100%", prontidão, dia indisponível): worktree `myapp-v1-c-i72`, sim RepMile-C-2 · **#63** PR #75 (INT, sim 77/77, QRE aplicado): aguardando CI → merge · **#49** (condições de A): worktree `myapp-v1-int-i49`, só `swift test` no macOS |
| Frente C `claude/v1-ios-swiftui` | `fffefbb` = #59 (PR #69) + #68 (PR #71; XCUITest 43/43, unit 140/140; SSCTR APPROVE_WITH_CONDITIONS); seguimentos #70, #72, #73, #74 (decisão), #76 |
| Próximas | C → integração (sync 2, com #59 e #68) e teste com motor real na integração · **#66** (P0; aguarda o fundador) · #63 · #49 · #48 · #39 · #62 · CCP-C-05 (#20) |
| Decisões do fundador | #66 (princípio), #74 (triagem nos relatos), nome do serviço do Keychain (#63 P3-5), #47 (reconciliação), #55 (RIR), #21, #29, versão nomeada do Figma, modo claro, background delivery (mantido salvo objeção) |
| Simuladores | RepMile-C-2 (#72), RepMile-INT (livre), RepMile-C-3 (livre), RepMile-C-SwiftUI (livre); no máximo 2 suítes de UI ao mesmo tempo |

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
