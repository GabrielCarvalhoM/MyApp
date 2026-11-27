# Workflow de entrega contínua (V1)

**Issue → Spec → Implementação → Build → Testes → Revisão independente → Correções → Nova verificação → PR → Integração → Validação → Verified.**
A spec de cada funcionalidade está em `specs/v1/features/` (índice: `specs/v1/INDEX.md`); critérios de revisão em `specs/v1/quality/`. Cada incremento é pequeno, verificável e
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
| Ready to Integrate | revisão independente passou, CI verde, `guard.mjs` limpo | o orquestrador, com o veredito do revisor |
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

## 7. Pausa segura e retomada

Comandos do fundador. O estado nunca depende da conversa: vive no Git, no GitHub e em [`specs/v1/CONTINUITY.md`](../../specs/v1/CONTINUITY.md).
Sem daemon, sem nada em execução depois da confirmação.

### "PAUSAR REPMILE"

1. **Parar de iniciar:** nenhuma issue, agente, build ou teste novo a partir desse momento.
2. **Inventariar o que roda:** `tools/orchestration/pause-check.sh` (processos de build/teste/git/simulador, worktrees sujas, commits em nenhuma branch remota) e a lista de agentes em background da sessão.
3. **Encerrar no ponto seguro:**
   - deixar terminar só o que é curto e atômico (um `git commit`/`merge`/`push` em curso, uma escrita de arquivo);
   - interromper builds, suítes de simulador e CI locais longos: o resultado parcial não conta como evidência e o teste é refeito na retomada;
   - pedir aos agentes implementadores que parem e commitem;
   - interromper os revisores, cuja revisão é refeita.
4. **Checkpoint no Git:**
   - alteração incompleta vira commit `WIP checkpoint (pausa): <o que falta>` na própria branch de incremento, e o push vai para essa branch;
   - nunca na branch da frente ou na de integração, nunca force push, nunca PR marcado como pronto;
   - o PR existente recebe um comentário dizendo que o topo é WIP;
   - um arquivo que não deve ser commitado fica listado no checkpoint com o caminho.
5. **Registrar cada tarefa** com um destes estados: concluída · incompleta (o que falta) · aguardando revisão · aguardando CI · aguardando o fundador.
6. **Atualizar `specs/v1/CONTINUITY.md`:**
   - na seção "Pausa": data e hora, commits, branches, worktrees, PRs, issues, últimos testes válidos (comando, resultado, commit), decisões, processos interrompidos e o **próximo passo exato**;
   - fazer commit e push na branch de orquestração. O PR para a integração fica para a retomada, porque a integração exige CI.
7. **Quadro:** um comentário de pausa nas issues em andamento (`board.mjs evidence` ou `gh issue comment`). O status real é mantido: nunca Verified ou Blocked por causa da pausa.
8. **Verificar:** `pause-check.sh` precisa dizer `PAUSE_CHECK: SAFE`. Commits locais que estão no disco não impedem o desligamento, mas ficam registrados.
9. **Responder só então:** **"REPMILE PAUSADO — SEGURO PARA DESLIGAR"**. Nada é retomado automaticamente.

### "RETOMAR REPMILE"

1. Ler `specs/v1/CONTINUITY.md` (seção "Pausa" primeiro) e só as specs/issues citadas no próximo passo.
2. `git fetch --prune` · `node tools/orchestration/status.mjs` · `git worktree list` · `gh pr list` · CI dos PRs abertos.
3. Comparar com o checkpoint: commits novos, PRs mesclados, CI que terminou, decisões do fundador nas issues.
4. **Reaproveitar**:
   - revisões concluídas e testes registrados no checkpoint continuam válidos para o mesmo commit;
   - refazer só o que foi interrompido, ou o que mudou de commit.
5. **Retomar as tarefas incompletas** a partir do commit WIP, com um agente novo que recebe só: a issue, a branch, o commit WIP, o que falta e os comandos de teste.
6. Voltar ao ciclo autônomo (§1–§5) a partir do próximo passo registrado.
