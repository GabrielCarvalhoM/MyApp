# Checkpoint de continuidade

Retomar com: **"Continue o desenvolvimento do RepMile de onde parou."** Leia isto, rode `node tools/orchestration/status.mjs`, siga
"Próxima ação". Não depende do histórico de conversas.

**Atualizado:** 2026-11-26 (sessão Engineering Orchestrator, worktree `~/.codex/worktrees/myapp-v1-engineering-orchestration/MyApp`).

## Pausa

**⏸ PAUSA ATIVA desde 2026-11-26 ~18:45 (BRT), pedida pelo fundador.** Protocolo: [WORKFLOW.md §7](../../docs/engineering/WORKFLOW.md#7-pausa-segura-e-retomada).

| Tarefa | Estado | Onde | Próximo passo |
|---|---|---|---|
| PR #67 C → integração | **aguardando CI** (GitHub) | `claude/v1-ios-integration-c-sync-1` @ `2ea4227` | suíte local válida em `bdec6fe`: `sim.sh` 59/59 + RepMileUI 121/121 (`audits/v1-ios-integration-2026-11-26/results/c-sync-1/`); o merge posterior só trouxe orquestração. Conferir `gh pr checks 67` → merge → `tools/orchestration/viewer.sh` |
| #59 correção no histórico | **incompleta** (WIP publicado) | `claude/v1-ios-swiftui-i59-correction-engine` @ `289811a`, worktree `myapp-v1-c-i59` | corrigir `testKeptCorrectionIsSaved` (`HistoryProgressTests.swift:78`, espera "Salvo no seu histórico."); `sim.sh all --sim RepMile-C-3`; guard e swift-size; commit final (rascunho em `results/i59-correction-engine/scratch/i59-commit.txt`); PR; revisão SSCTR + QRE. Unit 125/125 e replay ALL PASS já valem para `d5119fd` |
| #68 elegibilidade vazia nos relatos (P0, novo) | **não iniciada** | — | depois do #59 ou antes, porque sem ela o #59 nunca é oferecido com o motor real |
| #66 onboarding declarado (P0) | **aguardando o fundador** | issue #66 | confirmar o princípio e então implementar |
| Demais | nada em execução | — | ordem: #67 merge → #68 → #59 → #66 (se aprovado) → #63 → #49 → #48/#39/#62 |

Processos interrompidos: a suíte de UI do #59 (sim.sh/xcodebuild na RepMile-C-3, parcial, **não conta**). Nenhum agente ativo. Scripts de replay do motor guardados no repositório (`results/i59-correction-engine/scratch/`). Worktrees temporárias que podem ser removidas na retomada: `myapp-v1-c-i37`, `-i58`, `-i61`, `-i32d`, `-i32e`, `-i32c`, `myapp-v1-review-a`, `-review-b`, `myapp-v1-int-i16` (todas sem alterações).

## Agora

| | |
|---|---|
| Integração `claude/v1-ios-integration` | `7255221` = orquestração + A (#50) + B (#51) + C até `24c9096` (#42) + composição real (#60, #16). Visualização em `7255221` |
| Frente C `claude/v1-ios-swiftui` | `5a4872a`: #32.1–32.3, #32.5–32.8, #38, #41 (todos revisados); **à frente da integração**, falta o PR C → integração |
| Em merge | **#61** (PR #64): ponta mesclada `210d567` em teste (RepMile-INT); revisão QRE + verificação do #61b READY |
| Em verificação | **#58/#59** (PR #65, `a3c56f6`): verificação SSCTR + QRE do #59b em andamento |
| Aguardando | **#37** (PR #53, `3454551`): condições aplicadas; entra depois do #61, com nova suíte (o 35/36 era o teste instável de onboarding, corrigido no #61) |
| Próximas | PR C → integração (com #37/#58/#59/#61) e tirar o contorno `chip-12` do teste ao vivo · **#66** (P0, onboarding declarado; aguarda o fundador confirmar o princípio) · #63 (background delivery) · #49 (condições de A) · #48 (P3 de B) · #39 · #62 |
| Decisões do fundador | #66 (princípio), #47 (reconciliação), #55 (RIR), #21, #29, versão nomeada do Figma, modo claro, background delivery (mantido salvo objeção) |
| Simuladores | RepMile-INT (#61 merge/integração), RepMile-C-2 (livre), RepMile-C-3 (livre), RepMile-C-SwiftUI (livre); no máximo 2 suítes de UI ao mesmo tempo |

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
- [ ] HealthKit: autorização e leitura real com o build integrado; background delivery com o app fechado (B R2-03)
- [ ] CoachingHost no app integrado: aparelho bloqueado, reinstalação (já provados no lab de A; repetir no app)
- [ ] Desempenho de scroll e animação; Live Activity (#35)

## Bloqueios
- Integração A/B: aguarda as entregas finais revisadas das sessões A e B.
- Decisões do fundador: [PRODUCT_SCOPE §4](PRODUCT_SCOPE.md#4-decisões-pendentes-do-fundador).

## Próxima ação
Ver a seção "Agora". Comandos: `node tools/orchestration/status.mjs` · `node tools/orchestration/board.mjs show <n>`.
