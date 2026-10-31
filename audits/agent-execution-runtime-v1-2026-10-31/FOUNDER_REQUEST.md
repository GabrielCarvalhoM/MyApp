# AGENT_EXECUTION_RUNTIME_V1 — Founder request (verbatim)

Direct Founder request received in the session on 2026-10-31 (America/Sao_Paulo). Recorded verbatim below (byte copy of the pasted text); it is the authority for this infrastructure mission. Language: Portuguese, as given.

---

Você está trabalhando no repositório do projeto fitness/adaptive coaching.

## MISSÃO

Implementar uma infraestrutura pequena, robusta e verificável de execução longa de agentes para reduzir drasticamente consumo de contexto/tokens sem reduzir qualidade, evidência, gates ou rigor.

Nome sugerido da missão:

`AGENT_EXECUTION_RUNTIME_V1`

Branch sugerida:

`chore/agent-execution-runtime-v1`

Esta missão é **infraestrutura/processo**.

NÃO é uma missão de Coaching Core.

NÃO corrigir `QE-R7B1-04`.

NÃO iniciar R7-B.2.

NÃO iniciar R7-C.

NÃO alterar comportamento prescritivo, catálogo, runtime de treinamento, freezes ou authorities esportivas.

A R7-B.1 já foi formalmente encerrada como `CLOSED NOT_READY` com blocker único `QE-R7B1-04`. Preserve esse estado.

---

# CONTEXTO E MOTIVAÇÃO

Missões longas recentes passaram horas em uma única sessão Claude Code, acumulando contexto muito grande e gastando tokens inclusive após o trabalho autorizado já estar encerrado.

Queremos manter exatamente o mesmo nível de qualidade final, mas eliminar desperdício causado por:

- sessões excessivamente longas;
- reidratação repetida;
- outputs antigos permanecendo no contexto;
- testes/hashes/diffs sendo tratados como trabalho intelectual;
- reviews relendo escopo já provado;
- Founder tendo que manualmente:
  - interromper sessão;
  - pedir checkpoint;
  - abrir sessão nova;
  - reenviar prompt;
  - transportar contexto entre Claude e Codex.

A experiência desejada é:

```text
Founder inicia UMA missão
        ↓
Supervisor
        ↓
sessão Claude
        ↓
checkpoint validado
        ↓
nova sessão limpa automaticamente
        ↓
retomada automática
        ↓
Codex/local tooling quando apropriado
        ↓
...
        ↓
missão concluída
```

O Founder não deve atuar como gerente rotineiro de sessões/agentes.

---

# PRINCÍPIO CENTRAL

## Qualidade não pode cair.

A ordem de prioridade é:

1. correctness / safety;
2. evidência;
3. gates;
4. preservação de authorities;
5. eficiência de contexto;
6. economia de tokens.

Se uma decisão realmente exige contexto amplo ou Claude de alta capacidade, forneça esse contexto.

A economia deve vir de:

- eliminar redundância;
- persistir estado;
- carregar somente contexto relevante;
- usar ferramentas determinísticas;
- delegar trabalho adequado;
- trocar de sessão em fronteiras corretas.

Nunca economize removendo um gate necessário.

---

# EXECUTION PROPORTIONALITY

A infraestrutura deve ser a **menor solução suficiente**.

NÃO criar:

- plataforma distribuída;
- banco de dados desnecessário;
- servidor permanente;
- filas complexas;
- scheduler sofisticado;
- observability stack;
- abstrações sem consumidor;
- framework genérico de multi-agent sem necessidade atual.

Preferir:

```text
scripts pequenos
+
arquivos estruturados
+
hooks oficiais quando úteis
+
Git/worktrees
+
CLIs existentes
```

STOP_WHEN assim que o fluxo mínimo estiver comprovadamente funcional.

---

# FASE 0 — DISCOVERY REAL DO AMBIENTE

Antes de implementar, descubra o que realmente está disponível.

Inspecione, sem assumir:

- versão/capacidades do Claude Code instalado;
- `claude --help`;
- mecanismos de execução headless/programática disponíveis;
- hooks existentes;
- CLAUDE.md;
- AGENTS.md;
- scripts existentes;
- linguagem/tooling natural do repo;
- Codex CLI instalado ou não;
- `codex --help`, caso exista;
- possibilidade real de executar Claude/Codex não-interativamente;
- worktrees existentes;
- política Git atual.

Não use conhecimento presumido sobre flags.

Use o que a CLI instalada comprovar.

### REGRA IMPORTANTE

Se uma sessão Claude não puder, de maneira confiável, matar a si mesma e criar uma nova sessão independente:

**não simular isso.**

Nesse caso, implemente um **processo supervisor externo**, iniciado uma única vez pelo Founder, que seja o pai das sessões Claude e possa criar processos novos conforme necessário.

Essa arquitetura é preferível a uma solução frágil.

---

# ARQUITETURA DESEJADA

Conceitualmente:

```text
                  SESSION SUPERVISOR
                         │
             ┌───────────┼───────────┐
             │           │           │
          Claude       Codex      Local tools
             │           │           │
             └───────────┼───────────┘
                         │
                  repo/checkpoints
                         │
                    próxima fase
```

O supervisor deve ser predominantemente determinístico.

Ele não decide ciência esportiva.

Ele não decide readiness.

Ele não substitui Chief/SSCTR/Engineering.

Ele apenas controla ciclo de execução.

---

# 1. SESSION SUPERVISOR

Implementar o menor supervisor viável capaz de representar uma missão como estados, por exemplo:

```text
CREATED
RUNNING
CHECKPOINTING
READY_FOR_FRESH_SESSION
RUNNING
...
COMPLETED

ou

BLOCKED
FOUNDER_REQUIRED
FAILED
```

Os nomes podem variar se houver razão técnica melhor.

O supervisor deve saber:

- missão ativa;
- fase atual;
- último checkpoint válido;
- executor atual;
- branch/worktree;
- próximo passo;
- estado terminal ou não.

---

# 2. CHECKPOINT ESTRUTURADO

Checkpoint não é resumo narrativo livre.

Criar schema/versionamento simples.

Deve preservar no mínimo:

```text
mission_id
checkpoint_version
timestamp

mission_goal
mission_state
current_phase

baseline
branch
head_commit
freeze/digest quando aplicável

canonical_invariants
authorities_used

decisions_made
implemented_since_previous_checkpoint
files_changed

evidence
tests
probes
mutations
reviews

open_findings
closed_findings

do_not_reopen

next_exact_action

required_next_context
authorities_required_next

agent_outputs / handoffs relevantes

git_state

founder_action_required
```

Não precisa usar exatamente esses nomes caso um schema melhor seja justificado.

---

# 3. CHECKPOINT VALIDATOR

Uma sessão NÃO pode ser descartada apenas porque produziu um texto chamado checkpoint.

Antes de avançar, validar deterministicamente:

- campos obrigatórios;
- mission id correto;
- branch;
- commit;
- estado coerente;
- próximo passo;
- authorities necessárias;
- findings;
- Git state;
- ausência de inconsistências óbvias.

Se inválido:

```text
checkpoint rejected
→ agente recebe erros
→ corrige
→ valida novamente
```

Somente checkpoint válido permite fresh session.

---

# 4. FRESH SESSION BOOTSTRAP

A sessão seguinte deve receber automaticamente um bootstrap pequeno contendo:

- missão;
- checkpoint atual;
- caminho dos artifacts;
- authorities explicitamente necessárias;
- próximo passo;
- regras de não reabrir escopo resolvido.

Ela NÃO deve receber automaticamente:

- histórico inteiro;
- antigos audits superseded;
- transcripts;
- outputs gigantes de testes;
- contexto irrelevante.

A nova sessão deve reconstruir confiança pelo **repo**, não pela memória textual.

---

# 5. REHYDRATION POLICY

Default:

```text
checkpoint
+
current mission
+
current diff/state
+
explicitly required authorities
```

Somente ampliar contexto quando houver razão concreta.

Criar uma política simples:

```text
DO NOT READ EVERYTHING BY DEFAULT.
```

Se o agente precisar de informação ausente, ele busca o artifact específico.

---

# 6. QUANDO CRIAR CHECKPOINT

Usar primeiramente **fronteiras semânticas**, não apenas tamanho de contexto.

Exemplos:

```text
planning complete
implementation unit complete
freeze created
review complete
correction cycle complete
mission closure
```

Também pode existir proteção por tamanho/contexto **somente se houver sinal confiável disponível na ferramenta instalada**.

Não inventar porcentagem de contexto se não houver métrica confiável.

Nunca interromper operação atômica pela metade.

---

# 7. LOCAL-TOOL-FIRST

Antes de gastar outro agente com trabalho determinístico, preferir scripts existentes ou locais para:

- testes;
- hashes;
- manifests;
- diffs;
- validation;
- deterministic matrices;
- conformance checking;
- mutation runners;
- repo status;
- ancestry checks.

Claude não precisa raciocinar sobre cada linha de output.

Guardar output grande em artifact e retornar resumo estruturado.

---

# 8. CODEX COMO WORKER OPCIONAL

Codex NÃO é infraestrutura obrigatória.

Regra:

```text
Codex = opportunistic accelerator
Codex != required dependency
```

Se Codex CLI estiver instalado e operacional:

permitir delegação de tarefas delimitadas de engenharia, por exemplo:

- implementação determinística;
- geração de testes;
- criação de probes;
- investigação repetitiva;
- diffs;
- matrizes;
- refactors mecânicos.

Claude continua responsável por julgamento de alta ambiguidade quando necessário.

### Routing conceitual

```text
TIER 1
local tooling
determinístico

TIER 2
Codex
engenharia delimitada/verificável

TIER 3
Claude
semântica, arquitetura, safety,
science, ambiguous decisions,
readiness
```

Isso é orientação, não uma burocracia rígida.

---

# 9. CODEX QUOTA / FAILURE FALLBACK

A missão jamais pode depender da disponibilidade do Codex.

Se:

- Codex indisponível;
- autenticação ausente;
- quota/limite atingido;
- job falhar;
- CLI inexistente;

então:

```text
é determinístico?
→ local tooling

senão
→ Claude faz somente o trabalho necessário
```

Não bloquear missão simplesmente porque Codex não está disponível.

---

# 10. CODEX HANDOFF

Se Codex for usado, ele deve devolver artifacts estruturados, não uma conversa gigantesca.

Exemplo:

```text
CODEX_HANDOFF.md
EVIDENCE.json
diff/commit
```

Claude deve carregar apenas esses artifacts e os arquivos necessários para julgar.

---

# 11. WORKTREE / GIT ISOLATION

Não permitir Claude e Codex alterando simultaneamente a mesma working tree/branch.

Quando houver execução concorrente ou delegada:

- worktree isolado;
- branch clara;
- baseline explícita;
- commit;
- handoff;
- verificação de ancestry.

O Founder continua responsável apenas por operações destrutivas/de alta consequência já definidas pela governança.

NÃO:

- merge main automaticamente;
- force push;
- destructive reset;
- rewrite history;
- delete remote branches/tags;
- tocar credenciais.

---

# 12. STOP_WHEN

O runtime deve saber reconhecer estado terminal.

Se missão declarou:

```text
COMPLETE
CLOSED_READY
CLOSED_NOT_READY
BLOCKED
FOUNDER_REQUIRED
```

ou equivalente previsto pelo mission contract:

NÃO continuar rodando subagentes sem uma necessidade explícita.

Isso é particularmente importante porque a R7-B.1 já demonstrou trabalho de reviewer permanecendo ativo depois do fechamento.

Estado terminal deve impedir novas tarefas não autorizadas.

---

# 13. FOUNDER ESCALATION

Founder deve ser chamado somente quando necessário.

Exemplos:

- decisão de produto;
- conflito de authorities impossível de resolver;
- ação Git destrutiva;
- credencial/permissão;
- mudança de escopo;
- risco explicitamente reservado ao Founder;
- bloqueio real sem autoridade para prosseguir.

NÃO escalar:

- criação rotineira de checkpoint;
- mudança de sessão;
- execução de testes;
- Codex handoff;
- Git normal;
- retomada;
- leitura de artifact.

---

# 14. RECOVERY

Prever recuperação mínima de:

### processo Claude cai
→ último checkpoint válido permanece.

### supervisor cai
→ reiniciar lendo estado persistido.

### checkpoint incompleto
→ usar último checkpoint válido.

### Codex falha
→ fallback.

### dirty worktree inesperada
→ STOP e classificar origem; não destruir arquivo.

### remote/local divergem
→ STOP seguro e registrar.

Nunca apagar mudanças desconhecidas.

---

# 15. AUDITABILIDADE MÍNIMA

Registrar de forma compacta:

```text
mission
session number
executor
checkpoint
start/end state
commit
reason for transition
```

Não criar logs enormes contendo transcripts completos.

Precisamos saber:

> quem fez o quê, em qual estado e por quê?

Não precisamos armazenar cada token produzido.

---

# 16. TOKEN / CONTEXT EFFICIENCY

Criar métricas simples que sejam realmente mensuráveis.

Por exemplo:

```text
sessions_started
checkpoints_created
files_bootstrapped
authorities_loaded
codex_jobs
local_tool_jobs
claude_jobs
failed_jobs
```

Se a CLI expuser uso de tokens de forma confiável, registrar.

Se não expuser:

NÃO inventar estimativa.

A futura comparação R7-B vs R7-C pode usar o que estiver objetivamente disponível.

---

# 17. INTEGRAÇÃO COM AGENTS.md / CLAUDE.md

Atualizar apenas o necessário para tornar o protocolo persistente.

Registrar princípios como:

```text
Chief owns orchestration.

Use deterministic local tooling first.

Use Codex opportunistically for bounded engineering work.

Use Claude for high-judgment work.

Founder must not relay prompts between agents.

Long missions must persist validated checkpoints.

New sessions bootstrap from checkpoint + authoritative artifacts.

Do not rehydrate entire repo by default.

Terminal mission state stops further unauthorized work.

Optimization must never lower required quality/evidence/gates.
```

Não duplicar conteúdo que já existe.

Não transformar CLAUDE.md em um manual gigantesco.

---

# 18. ESTRUTURA DE ARQUIVOS

Escolha a estrutura mais natural ao repo depois de inspecioná-lo.

Algo deste tipo seria aceitável:

```text
tools/agent-runtime/
  supervisor.*
  checkpoint-validator.*
  routing.*
  schemas/
  README.md

.agent-runtime/
  missions/
  checkpoints/
  handoffs/
```

Mas NÃO force essa estrutura se o repo já possui uma convenção melhor.

Runtime ephemeral/local state que não deve ser versionado precisa entrar no `.gitignore`.

Schemas, scripts e documentação estável podem ser versionados.

---

# 19. NÃO CRIAR DEPENDÊNCIA PESADA

Preferir runtime já usado no repo.

Não adicionar pacote grande apenas para:

- validar JSON;
- executar subprocesso;
- escrever arquivo;
- ler Git.

Se a linguagem padrão tiver suporte suficiente, use-a.

---

# 20. TESTES

Precisamos validar o runtime sem gastar uma missão real de Claude/Codex.

Criar testes para:

- checkpoint válido;
- checkpoint inválido;
- terminal state;
- recovery;
- routing;
- Codex unavailable;
- dirty worktree protection;
- bootstrap generation;
- no continuation after terminal state.

Criar também uma simulação/dry-run de uma missão fictícia:

```text
phase 1
→ checkpoint

fresh session boundary

phase 2
→ Codex-like handoff simulado

phase 3
→ COMPLETE
```

Essa simulação deve usar fake executors/mocks ou equivalente.

NÃO consumir múltiplas sessões reais de Claude/Codex apenas para provar o state machine.

---

# 21. SMOKE TEST REAL

Depois dos testes determinísticos, faça no máximo o menor smoke test possível que prove integração com as CLIs instaladas.

Pode usar:

```text
--help
version
dry-run
capability detection
```

Não inicie uma missão real do Coaching Core.

Se uma chamada real paga/contabilizada não for necessária para provar a infraestrutura, não faça.

---

# 22. NÃO ALTERAR O COACHING CORE

Proibido nesta missão:

- corrigir QE-R7B1-04;
- mudar runtime de treino;
- mudar catálogo;
- mudar R7-A;
- mudar R7-B0;
- mudar freezes;
- mudar SSCTR authorities;
- criar R7-C;
- reinterpretar readiness.

Apenas infraestrutura de execução.

---

# 23. GIT

O agente deve cuidar do ciclo Git normal.

Antes de trabalhar:

- fetch;
- verificar branch;
- verificar working tree;
- descobrir baseline correta;
- não tocar arquivos pessoais/untracked desconhecidos.

Criar branch isolada.

Ao terminar:

- testes;
- commit;
- push;
- confirmar remote HEAD;
- working tree esperado/clean.

Não merge main.

---

# 24. ENTREGÁVEL FINAL

No fechamento, retornar de forma compacta:

```text
AGENT_EXECUTION_RUNTIME_STATUS =
READY | NOT_READY

AUTOMATIC_FRESH_SESSION =
SUPPORTED | PARTIAL | UNSUPPORTED

CODEX_DELEGATION =
SUPPORTED | PARTIAL | UNAVAILABLE

LOCAL_TOOL_FIRST =
READY | NOT_READY

CHECKPOINT_VALIDATION =
READY | NOT_READY

TERMINAL_STOP =
READY | NOT_READY

RECOVERY =
READY | NOT_READY
```

E informar:

- branch;
- commit;
- remote HEAD;
- arquivos principais criados;
- testes;
- limitações reais descobertas;
- como iniciar uma missão com UM único comando/entrada;
- se ainda existe algum passo manual entre sessões e por quê.

---

# 25. CRITÉRIO DE SUCESSO

Considerar READY somente se pudermos demonstrar que:

### A.
Uma missão longa pode persistir estado em checkpoint estruturado.

### B.
Checkpoint inválido não permite transição silenciosa.

### C.
Uma nova execução pode reconstruir o estado necessário sem transcript completo.

### D.
Estado terminal impede trabalho adicional não autorizado.

### E.
Codex pode ser usado quando disponível sem ser requisito.

### F.
Falha/limite do Codex não bloqueia a missão.

### G.
Git/worktree permanecem seguros.

### H.
Founder não precisa transportar prompts/manualmente contexto entre executores no fluxo normal.

### I.
Nenhum gate de produto/coaching foi enfraquecido.

### J.
Nenhuma mudança foi feita no Coaching Core nesta missão.

---

# 26. ANTI-OVERENGINEERING / STOP

Assim que A–J estiverem comprovados:

STOP.

Não adicionar:

- dashboard;
- UI;
- web service;
- banco;
- analytics sofisticado;
- scheduler genérico;
- plugin marketplace;
- agentes extras;
- abstrações futuras.

Precisamos de uma ferramenta interna pequena para este projeto, não de um produto novo.

---

# RESULTADO ESPERADO DESTA MISSÃO

Ao final, quero poder iniciar uma missão futura aproximadamente assim:

```text
execute DOMAIN_COACHING_R7-B.2
```

e o runtime cuidar de:

```text
bootstrap
→ execução
→ local tools/Codex quando adequado
→ checkpoint
→ fresh Claude context
→ retomada
→ novo checkpoint
→ closure
```

sem o Founder precisar ficar supervisionando sessões.

Não execute R7-B.2 nesta missão.

Construa e valide somente a infraestrutura necessária para que ela seja o primeiro piloto real depois.
