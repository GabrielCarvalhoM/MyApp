# Workflow de entrega contínua (V1)

**Issue → Implementação → Testes → Pull Request → Revisão → Integração → Validação → Concluído.** Cada incremento é pequeno, verificável e
tem uma issue. Uma sessão pode entregar vários incrementos seguidos; cada um com seus commits, seu PR e seu relatório curto
([AGENT_HANDOFF.md](AGENT_HANDOFF.md)).

## 1. O quadro: Kanban central do produto

GitHub Projects **"RepMile — Product & Engineering"**, ligado ao repositório. Ele contém **todo** o trabalho do produto (funcionalidades
futuras, bugs, refatorações, testes, design, backend, CoachingCore, integrações), inclusive tarefas sem código nem PR. Não é um monitor
de CI: o CI aparece no PR; o quadro mostra o trabalho.

| Campo | Valores |
|---|---|
| Status | Backlog · Ready · In Progress · Blocked · In Review · Ready to Integrate · Integrated · Verified |
| Tipo | Feature · Bug Fix · Refactor · Optimization · Test · Design · Infrastructure · Research |
| Área | iOS Frontend · Backend · CoachingCore · HealthKit · RunRecorder · Strength · UX/UI · DevOps |
| Prioridade | P0 (bloqueia a V1) · P1 · P2 · P3 |
| Frente | A · B · C · Design · Integration |
| Release | V1 · V1.1 · V2 |
| Validação | Não validado · Simulador · iPhone · Dados reais |
| Dependências, Evidências | texto curto, com links (o detalhe fica na issue) |
| Início, Entrega alvo | datas (alimentam o Roadmap) |

Visões salvas: **Visão Geral** (quadro por Status), **Por Área**, **Por Tipo**, **Por Frente**, **Bugs & Fixes** (Tipo = Bug Fix),
**Roadmap** (datas, agrupado por Release), **Bloqueios** (Status = Blocked). Decisões pendentes do fundador: filtro
`label:needs:founder-approval`.

`Integrated` e `Validação` vão além da lista mínima de propósito: separam "código na branch de integração" de "funcionalidade
validada", que é a distinção que o quadro precisa preservar.

## 2. Estados

| Status | Quando | Quem move |
|---|---|---|
| Backlog | existe, ainda não está pronta para começar | qualquer agente (escopo novo: com `needs:founder-approval`) |
| Ready | cumpre os critérios da §4 | dono da frente / integração; **nunca** com `needs:founder-approval` |
| In Progress | alguém está implementando | a frente |
| Blocked | não avança; a issue diz o quê (Dependências) | quem encontrou o bloqueio |
| In Review | PR aberto (não rascunho) com `Issue: #n` | a frente, ao abrir o PR |
| Ready to Integrate | revisão independente passou, CI verde, `guard.mjs` limpo | o revisor |
| Integrated | está na branch de integração; **ainda não validado** | a integração |
| Verified | validado onde importa, com evidência; a issue é fechada como concluída | quem validou (o comando exige Validação ≠ "Não validado" e Evidências) |

Mude estado **só** por `node tools/orchestration/board.mjs set <issue> --status "<Status>"`. O comando escreve o campo e o rótulo
`status:*` espelho juntos (as listas do GitHub e o quadro nunca divergem) e aplica as regras acima. O resumo
`node tools/orchestration/status.mjs` lê o campo Status; sem acesso ao quadro, lê os rótulos.

## 3. O que os agentes podem fazer sozinhos

- **Criar tarefa descoberta**: `board.mjs create --title … --body-file … --type … --area … --front … --priority … --release …`.
  O comando recusa título parecido com uma issue existente (atualize a existente; `--force-new` só se for mesmo outra tarefa).
- **Escopo novo ou decisão de produto**: acrescente `--new-scope`. A tarefa nasce em Backlog com `needs:founder-approval`; nenhum comando
  a move para Ready até o fundador tirar o rótulo.
- **Atualizar estado e evidências**: `board.mjs set`, `board.mjs evidence <issue> "<link>" [--validation …]` (vira comentário na
  issue e entra no campo Evidências).
- **Não pode**: aprovar o próprio escopo, mudar contrato compartilhado, fechar uma issue sem a validação que ela pede.

## 4. Tarefa READY

Objetivo · frente responsável · contexto técnico · arquivos/módulos (na coluna da frente) · critérios de aceite verificáveis ·
dependências · testes necessários · restrições de segurança quando houver. Os formulários de issue (`.github/ISSUE_TEMPLATE/`: Feature,
Bug, Technical Debt, Integration Task) pedem exatamente isso. Tarefa pequena não precisa de documento: a issue basta.

## 5. Branches e PRs

- Incremento: `<branch-da-frente>-i<issue>-<slug>` (ex.: `claude/v1-ios-swiftui-i12-design-system`), criada da branch da frente.
  PR **para a branch da frente**, com o template. CI roda no push e no PR.
- A frente faz merge do próprio incremento na sua branch depois de CI verde e revisão (merge normal; nunca rebase de branch publicada,
  nunca force-push).
- A integração traz a branch da frente para `claude/v1-ios-integration` por PR ([INTEGRATION_PROTOCOL.md](INTEGRATION_PROTOCOL.md)).
- PR pequeno; nada de semanas num PR só. Falha de segurança nunca é "dívida técnica". CI verde não prova fidelidade visual.

## 6. Backlog inicial

`tools/orchestration/backlog/V1_INITIAL_BACKLOG.md` → `node tools/orchestration/backlog.mjs --apply` (idempotente pelo marcador
`backlog-key`). O trabalho que A, B e C já executavam tem uma issue de acompanhamento por frente; os próximos incrementos são issues
próprias.
