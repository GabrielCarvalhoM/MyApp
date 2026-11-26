# REPMILE — Engineering Workflow & Orchestration V1 — relatório final

**Data:** 2026-11-26 · Mac mini M4 (macOS 27.0, Xcode 27.2, Node 24.19). **Branch:** `claude/v1-engineering-orchestration`, criada da tag
`v1-abc-ready-2026-11-26` (`065178f`), worktree própria. **Commit de fechamento:** ver `git log -1` da branch (este arquivo).

## 1. Veredito

**READY_FOR_INCREMENTAL_DEVELOPMENT — com condições.** O fluxo funciona de ponta a ponta no GitHub real:
- o quadro **RepMile — Product & Engineering** (https://github.com/users/GabrielCarvalhoM/projects/1) tem 30 itens com campos;
- o CI `V1 CI` está verde no push e no PR;
- o draft PR [#30](https://github.com/GabrielCarvalhoM/MyApp/pull/30) usa o template;
- o comando diário `status.mjs` lê git, Issues, PRs, Actions e o quadro.

No primeiro uso real, o guard pegou um arquivo fora da coluna num commit local de C, que virou a tarefa [#31](https://github.com/GabrielCarvalhoM/MyApp/issues/31).

Condições, todas registradas no quadro:
1. Ruleset da branch de integração, com o check `CI` exigido e revisão de code owner, quando a branch existir (#15).
2. Identidade própria para os agentes, para a revisão de code owner valer (#29).
3. Ativar templates, CI e quadro na branch padrão (#21).

As três são decisão do fundador.

## 2. Critérios

| Critério | Resultado | Evidência |
|---|---|---|
| ISOLATED_ORCHESTRATION_BRANCH | **YES** | branch e worktree próprias, da tag; só caminhos de orquestração (`guard.mjs`: 0 proibidos) |
| EXISTING_WORKTREES_UNTOUCHED | **YES** | §6 |
| ISSUE_TEMPLATES_READY | **YES** | 4 formulários + config (YAML validado); ativos no GitHub quando chegarem à branch padrão (issue #21) |
| PR_TEMPLATE_READY | **YES** | `.github/pull_request_template.md`; usado no draft PR [#30](https://github.com/GabrielCarvalhoM/MyApp/pull/30) (base `claude/v1-abc-foundation-consolidation`, marcado "não fazer merge") |
| INITIAL_BACKLOG_CREATED | **YES** | 29 issues (#1–#29) no quadro com campos; idempotente (rerun: 29 existentes, 0 criadas); #31 descoberta pelo fluxo |
| CI_BASELINE_READY | **YES** | `.github/workflows/v1-ci.yml`; push e PR verdes em `9e0dc6c`; PR: [run 45858646649](https://github.com/GabrielCarvalhoM/MyApp/actions/runs/45858646649) (4/4 jobs); push: ver §5 |
| COACHINGCORE_TESTS_PRESERVED | **YES** | `npm test` 1952/1952/0, 53 históricos no ponto declarado (`evidence/baseline/npm-test.txt`); CoachingCore sem diff |
| SWIFT_CONTRACT_TESTS_PRESERVED | **YES** | IntegrationContracts 10/10, CoachingPresentation 29/29, 0 pulados |
| SIMULATOR_PIPELINE_PREPARED | **YES** | `sim.sh` validado no app shell real de C (`f2b5628`) e no P0DeviceHost (§4) |
| VISUAL_VALIDATION_PROCESS_READY | **YES** | `VISUAL_VALIDATION.md` + `visual.mjs` (provado com execução real e adulteração recusada) |
| INTEGRATION_PROTOCOL_READY | **YES** | `docs/engineering/INTEGRATION_PROTOCOL.md`; branch `claude/v1-ios-integration` definida (issue #15) |
| DAILY_STATUS_COMMAND_WORKING | **YES** | `node tools/orchestration/status.mjs` contra o GitHub real (§5) |
| INDEPENDENT_REVIEW_PASSED | **YES, com condições** | §7 |
| READY_FOR_INCREMENTAL_DEVELOPMENT | **YES, com condições** | §1 |

## 3. O que foi entregue

| Peça | Onde | Faz |
|---|---|---|
| Fluxo e estados | `docs/engineering/WORKFLOW.md` | Issue → … → Verified; READY; branches de incremento `<frente>-i<issue>-<slug>`; o que agentes fazem sozinhos |
| Quadro Product & Engineering | GitHub Projects [#1](https://github.com/users/GabrielCarvalhoM/projects/1) (privado) | Kanban central: Status, Tipo, Área, Prioridade, Frente, Release, Validação, Dependências, Evidências, datas; 7 visões |
| `board.mjs` | `tools/orchestration/` | interface dos agentes ao quadro: Status + rótulo espelho juntos; `needs:founder-approval` não sai de Backlog/Blocked; Verified exige validação e evidência; `create` recusa duplicata |
| `backlog.mjs` + `V1_INITIAL_BACKLOG.md` | `tools/orchestration/` | backlog inicial, rótulos (renomeia equivalentes), itens do quadro; idempotente |
| `guard.mjs` | `tools/orchestration/` | matriz de ownership do contrato §10 como regra executável; falha fechada |
| `status.mjs` | `tools/orchestration/` | "Qual é o estado da construção?" a partir de git + Issues + PRs + CI + quadro |
| CI `V1 CI` | `.github/workflows/v1-ci.yml` | integridade/ownership/segredos · `npm test` (clone completo) · contratos Swift (0 pulados) · check único `CI` |
| `swift-packages.sh` | `tools/orchestration/` | gate Swift; falha em teste pulado; pacotes só-iOS compilados com xcodebuild |
| `sim.sh` | `tools/orchestration/` | simulador: detectar → build → instalar → abrir → vivo? → log → screenshot → XCTest/XCUITest → manifest |
| `visual.mjs` | `tools/orchestration/` | registros Figma × app, capturas ligadas à execução real |
| Templates | `.github/ISSUE_TEMPLATE/*`, `pull_request_template.md`, `CODEOWNERS` | Feature, Bug, Technical Debt, Integration Task; PR curto |
| Proteção | rulesets do GitHub | `claude/v1-*` e tags `v1-*`: sem force-push e sem exclusão (reversível, sem checks exigidos) |
| Documentação | `docs/engineering/` | README (entrada), WORKFLOW, QUALITY_GATES, AGENT_HANDOFF, INTEGRATION_PROTOCOL, VISUAL_VALIDATION |

## 4. Pipeline do simulador — validação real

| Execução | Resultado |
|---|---|
| sem app shell (esta branch) | `WAITING_FOR_APP_SHELL`, exit 3, nada construído |
| **app shell RepMile de C** (`f2b5628`, worktree destacada temporária, removida) | scheme `RepMile` escolhido sozinho; build; bundle id lido do Info.plist (`fit.vilumo.repmile.dev.app.simulator`); app vivo; screenshot determinística (09:41, sem "◀ outro app"); XCUITest **1/1** (`evidence/sim-repmile-shell-f2b5628/`) |
| P0DeviceHost (projeto real existente) | build/instalar/abrir/screenshot ok; XCTest 22/29, 1 falha (`testConcurrentWriters`: proteção de arquivo `nil` — o Simulator não implementa Data Protection), 6 pulados: o pipeline reporta a falha com a mensagem (`evidence/sim-p0devicehost/`) |

Defeitos do próprio pipeline encontrados na validação e corrigidos: nome do simulador partido por espaço; falso "app morto" por SIGPIPE
com `pipefail` + `grep -q`; screenshot com "◀ P0DeviceHost" (app anterior em primeiro plano).

## 5. Estado da construção hoje (saída do `status.mjs`)

Saída de `node tools/orchestration/status.mjs` às 16:36 UTC (resumida):

- 1 PR aberto (#30) · 4 em andamento (#1–#4) · 1 bloqueada (#5, aguarda #3 e #4) · 1 pronta (#11 RunRecorder) · 23 no backlog · 8 aguardando decisão do fundador (#21, #23–#29).

| Frente | Último commit | À frente da base | Não publicado | CI | Ownership |
|---|---|---|---|---|---|
| A · CoachingHost | `df9b69b` | 6 | 0 | sem execução | ok (98) |
| B · HealthKit | `4cffa10` | 6 | 0 | sem execução | ok (37) |
| C · SwiftUI | local `a8aefa0` (remoto `065178f`) | 8 | **8** | sem execução | **1 proibido**: `ios/App/.DS_Store` → #31 |
| Figma | `26ec95f` | 1 | 0 | sem execução | ok (5) |
| Integração | ainda não existe | | | | |
| Orquestração | `9e0dc6c` | 7 | 0 | verde | ok (43) |

As frentes A, B e C mostram "sem execução" porque o workflow só existe nesta branch. Ele passa a rodar nelas quando entrar na base delas (#21) ou quando forem integradas (#15).

**CI real** (`.github/workflows/v1-ci.yml`):

| Run | Commit | Evento | Resultado |
|---|---|---|---|
| [45857170307](https://github.com/GabrielCarvalhoM/MyApp/actions/runs/45857170307) | `4da21ae` | push | repo ✓, swift ✓; cancelado pela concorrência quando `9e0dc6c` chegou (comportamento configurado) |
| [45858646649](https://github.com/GabrielCarvalhoM/MyApp/actions/runs/45858646649) | `9e0dc6c` | pull_request | **4/4 verdes**: guard 43 OK, gitleaks sem vazamento, `npm test` 1952/1952/0 + 53 históricos, IntegrationContracts 10/10, CoachingPresentation 29/29, 0 pulados, `WAITING_FOR_APP_SHELL` (notice) |
| [45858571575](https://github.com/GabrielCarvalhoM/MyApp/actions/runs/45858571575) | `9e0dc6c` | push | **4/4 verdes** |

**Ambiente do runner macOS:** imagem `macos-26-arm64`, Xcode 26.6 (17F113), Swift 6.3.3. O Mac mini tem Xcode 27.2 e Swift 6.4.2, então o CI prova portabilidade, não equivalência. O simulador e o iPhone continuam no Mac mini.

O PR rodou o guard do próprio PR porque a base ainda não o tem: aviso explícito no log. Depois que o guard estiver na base, ele passa a vir dela.

## 6. Worktrees existentes

Instantâneo às 10:50 e no fechamento: cada worktree de A, B, C, Figma e fundação continua na própria branch; A, B e C avançaram **só
pelos commits das próprias sessões** (nenhum desta missão); fundação inalterada em `065178f`. Leituras feitas aqui: `git status`,
`git log`, `git diff` (somente leitura). As sondas no app de C usaram uma worktree **destacada** temporária, removida em seguida.
O guard nas pontas das frentes no fechamento: A 98 caminhos e B 37, ambos na própria coluna; Figma 5. Em C, 214 caminhos, com 1 fora da coluna: `ios/App/.DS_Store`, no commit local `a8aefa0`, não publicado. Isso virou #31; a branch de C não foi tocada.

## 7. Revisão independente

Revisão independente das ferramentas, do CI e das permissões, feita por um agente sem o contexto da implementação.

| Rodada | Commit | Veredito | Desfecho |
|---|---|---|---|
| R1 | `8ac5d58` | NOT_READY | corrigido em `4a84a6f` |
| R2 | `4a84a6f` | READY_WITH_CONDITIONS | corrigido em `4da21ae`, exceto a condição (a) |

**R1** — falhas e correções:
- guard que falhava aberto e podia ser reescrito pelo próprio PR: passou a falhar fechado e a rodar a partir da base do PR, com o SHA do head;
- tag de base aceita sem verificação: agora vale só uma lista fixa de tags;
- diff com nomes ambíguos: passou a ser lido com `-z`;
- aprovação que sobrevivia a um push posterior: agora vale só no evento `labeled`;
- auditorias existentes graváveis: passaram a ser protegidas;
- além disso: CODEOWNERS criado, compilação dos pacotes só-iOS, teste de simulador estrito, exit codes e rótulos do quadro corrigidos, NOT_PLANNED deixou de satisfazer dependência, capturas visuais ligadas à execução.

Cada contorno foi reexecutado e recusado.

**R2** — o que foi corrigido:
- NEW-1: regressão em arquivos de topo de `audits/`;
- NEW-2: caminhos de agente passaram a ser governança, e branch sem papel só pode adicionar arquivo novo;
- NEW-3: PR de fork falha fechado;
- NEW-4: aprovação documentada;
- NEW-6: `build-for-testing`;
- NEW-7: `status.mjs` usa a base da lista fixa.

O que ficou pendente na R2:
- **Condição (a):** ruleset da branch de integração (check `CI` exigido, code owner, aprovações obsoletas descartadas). Depende de a branch existir (#15) e de o check já ter rodado. Não se exige check que não existe.
- **Condição (c):** os agentes usam a conta do fundador, então a revisão de code owner ainda não defende. Registrada como #29.

**Depois da R2, sem nova rodada de revisão**, entraram duas mudanças pequenas:
- `9e0dc6c`: a visão Roadmap recebe só o filtro, porque o GitHub recusa campos visíveis nesse layout;
- o alerta do `status.mjs` passou a nomear o caminho e a indicar a ponta que ele de fato avaliou.

Nenhuma das duas mexe em permissões, no guard ou no CI. Testes: 24/24.

## 8. Lacunas reais encontradas

1. **`swift test` sem Node termina com exit 0 e 2 testes de contrato pulados** (provado: `evidence/baseline/swift-without-node-skip-probe.txt`). O gate novo falha em qualquer skip.
2. **Não existe `main`**: a branch padrão é `r7/decision-authority-closure-base`, e o GitHub só usa templates de issue/PR da branch padrão (#21, decisão do fundador).
3. `tools/agent-runtime`: 74/75 na base ("a hook planted in the repository…"); fora do CI até #22.
4. A arquitetura global de agentes citada no `CLAUDE.md` (`C:/Users/carva/...`) não existe neste Mac; o fluxo usa só o repositório e o GitHub.
5. O repositório é **público**: runner self-hosted no Mac mini foi descartado (PR de fork executaria código ao lado do iPhone, do Keychain e de dados de saúde).
6. A API do GitHub não define agrupamento/ordenação de visões do Projects; as visões são criadas por script e o agrupamento é um clique cada (§3 do WORKFLOW).
7. O arquivo do workflow vem do próprio PR (GitHub): a defesa é a revisão exigida de code owner no ruleset da futura branch de integração.
8. As áreas ORCH (`.github/`, `docs/engineering/`, `tools/orchestration/`) e DESIGN (registro do Figma) não estão no §10 do contrato: proposta de ratificação na próxima missão de integração (contrato §11).
9. **Os agentes agem com a conta do fundador** no GitHub, então a revisão exigida de code owner não separa autor de revisor (#29).
10. O runner macOS do GitHub (Xcode 26.6) é mais antigo que o Mac mini (Xcode 27.2): o CI prova portabilidade, não o ambiente de entrega.
11. O quadro é **privado**, enquanto o repositório é público. Os agentes o acessam pelo token do fundador (escopo `project`).
12. A visão padrão do Projects (`View 1`) não pode ser apagada pela API. Foi renomeada para "Tudo (tabela)".

## 9. O que depende da frente C

O app shell já existe localmente em C (`f2b5628`; ponta local `a8aefa0`, 8 commits não publicados). Antes do push, C precisa resolver #31. Com o push de C: o CI compila `RepMileUI`, `sim.sh` roda no app de
C sem argumentos, e a validação visual começa pela versão nomeada do Figma (#3 → #5 → #14).

## 10. Comandos

```bash
node tools/orchestration/status.mjs                 # estado da construção
node tools/orchestration/guard.mjs                  # ownership do meu diff
node tools/orchestration/board.mjs set <n> --status "In Progress"
tools/orchestration/sim.sh all                      # simulador ponta a ponta
tools/orchestration/swift-packages.sh               # gate Swift
node tools/orchestration/visual.mjs verify --dir audits/v1-ios-swiftui-2026-11-26/visual
```

## 11. Próximo passo operacional

1. **Fundador, 2 minutos no quadro:** um clique por visão para agrupar, porque a API não permite:
   - Por Área → Área;
   - Por Tipo → Tipo;
   - Por Frente → Frente;
   - Bugs & Fixes → Status;
   - Roadmap → Release, com datas Início → Entrega alvo;
   - Bloqueios → Frente.
2. **Frente C:** resolver #31 antes de publicar. Depois, publicar o app shell (#4 → In Review). Isso destrava #5 (com #3) e a validação visual (#14).
3. **Fundador:** decidir #21 (ativar na branch padrão) e #29 (identidade dos agentes). Com isso, abrir #15, a branch `claude/v1-ios-integration`, e aplicar o ruleset da condição (a).
4. **Todo dia:** `node tools/orchestration/status.mjs` na worktree de orquestração (ou em qualquer checkout desta branch).
