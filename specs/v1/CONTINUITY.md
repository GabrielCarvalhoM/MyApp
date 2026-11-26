# Checkpoint de continuidade

Retomar com: **"Continue o desenvolvimento do RepMile de onde parou."** Leia isto, rode `node tools/orchestration/status.mjs`, siga
"Próxima ação". Não depende do histórico de conversas.

**Atualizado:** 2026-11-26 (sessão Engineering Orchestrator, worktree `~/.codex/worktrees/myapp-v1-engineering-orchestration/MyApp`).

## Agora

| | |
|---|---|
| Concluídas | #31 Verified · frente C integrada em `claude/v1-ios-integration` (`cbf051f`, PR #42; #4–#13 = Integrated, validação simulador/sintético) · #32.1 (PR #43) e #32.2 (PR #44) na frente C (`0a05d95`) · specs/v1 · gate de 350 linhas · ruleset da integração (PR + `CI`) |
| Em andamento | nada em execução |
| Próxima pronta | **#32.3** ViewModels de segurança (`NotFeeling100ViewModel`, `ReadinessViewModel`, ARCHITECTURE §4 #3) — absorve QRE N8 (duplo envio na prontidão) e SSCTR N5/N6 de #39 · depois **#38** (regra SSCTR registrada na issue) |
| Depois | PR C → integração com #32.1/#32.2 (C está à frente da integração) · #41 · #39 · #37 (precisa da escolha de UX "fiz como prescrito") |
| Regra nova | `claude/v1-ios-integration` só por PR com `CI` verde (inclusive a orquestração) |

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

## Bloqueios
- Integração A/B: aguarda as entregas finais revisadas das sessões A e B.
- Decisões do fundador: [PRODUCT_SCOPE §4](PRODUCT_SCOPE.md#4-decisões-pendentes-do-fundador).

## Próxima ação
Ver a seção "Agora". Comandos: `node tools/orchestration/status.mjs` · `node tools/orchestration/board.mjs show <n>`.
