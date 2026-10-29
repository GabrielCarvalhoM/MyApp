# DOMAIN_COACHING_R7-A.1 — Relatório final

**Resultado:** `R7A_EXIT_READINESS = NOT_READY`, encerrada com blockers explícitos (Founder request §16).

| Item | Estado |
|---|---|
| Freeze final | R7A1-FREEZE-A2, digest de fonte `71edc245cfe06a376732ec8054f2e09f277066f2ee4004f34827b2c90a1c4024` |
| Política | R6-POLICY-5 `18ec48f3…`, inalterada |
| Testes | 505/505 (Node v24.19.0) |
| Mutação | 88/89 pegos; 1 sobrevivente documentado |
| Juízes no FREEZE-A2 | engenharia NOT_READY; SSCTR NOT_READY |
| Ciclo de correção | o único permitido foi usado; não há terceiro (§11) |
| Handoff | não criado |
| R7-B | não iniciada; a próxima decisão é do Founder |

Escopo: só a referência offline sintética em Node 24. Sem UI, Figma, KMP, HealthKit, Android, integrações, produção, efeito em plano real, commit, merge ou deploy.

## 1. A pergunta da missão

> “Existe agora uma única semântica confiável de composição e preservação da semana, independente do handler que causou a mudança?”

**Composição: sim.** Os dois juízes concordam, cada um no seu escopo.
- Uma só forma de replanejar semanas, de adaptar a semana corrente e de mudar o contexto.
- A única exceção é a ordem de duas adaptações da mesma semana, que decide qual slot leva um move, um skip ou o slot fácil. Essa exceção é nomeada e verificada.

**Preservação: não.** O ponto de partida de um retorno ainda perde estado em dois casos:
- uma segunda pausa, separada da primeira (QE-R7A1-09 e QE-R7A1-10);
- exercícios feitos pela primeira vez na semana da pausa (D59).

## 2. Estado inicial

- **Runtime:** R7A-FREEZE-2 (`f56ae974…`), 476/476 testes. A cópia byte a byte está em `audits/domain-coaching-r7a1-2026-10-27/freeze2-source/` e o baseline vincula 1.266 arquivos.
- **Os sete blockers da R7-A:** QE-R7A-01, 02, 03, 05, 12, 19 e D56, com D53. Antes de qualquer edição foram confirmados mais dez caminhos equivalentes da mesma classe.

## 3. Causa compartilhada e modelo

**Causa:** cada handler recompunha a semana do seu jeito. Variavam a leitura de "ainda à frente", o contexto de cada semana, o início da semana seguinte, as adaptações registradas, a supersessão de fatos e a leitura da dose executada.

**Modelo:** `WEEK_COMPOSITION_CONTRACT.md` (R7A1-COMPOSITION-2), implementado em `CoachingCore/src/r6-composition.mjs`. Cada cláusula é uma leitura única para todos os handlers.

| Cláusula | Regra |
|---|---|
| C1 | Um só teste de "ainda à frente". Uma sessão AM termina ao meio-dia; PM ou sem turno, ao fim do dia. |
| C2 | Contexto em vigor por semana. Uma leitura de equipamento por data. |
| C3 | Uma regra de início da semana seguinte, lida com as entradas da própria revisão semanal. |
| C4 | Adaptações registradas na semana e reaplicadas com o próprio relógio. |
| C5 | Supersessão: o fato mais novo vence. |
| C6 | Linhas de outros esportes intocadas. |
| C7 | Validação final completa, em fail-closed. |

## 4. O que mudou

- **Build (FREEZE-A1, `2de8681f…`):**
  - `src/r6-composition.mjs`, novo;
  - mudanças em `src/r6-adaptation.mjs`, `src/r6-program.mjs` e `src/r6-provenance.mjs`;
  - um cenário de `test/r7a-semantic-core.test.mjs` ajustado (C11);
  - `test/r7a1-composition.test.mjs`, com 19 testes.
- **Único ciclo de correção (FREEZE-A2):** os mesmos quatro módulos, mais `test/r7a1-correction.test.mjs` com 10 testes. Cada finding material das primeiras revisões ganhou mudança de mecanismo e um teste que falha numa cópia byte a byte do FREEZE-A1:
  - **QE-R7A1-01:** equipamento por data em templates, moves e validação final;
  - **QE-R7A1-02:** as entradas da revisão (sinal sistêmico, cargas confirmadas) valem em todo handler;
  - **QE-R7A1-03:** correção de retorno feita numa semana posterior;
  - **QE-R7A1-04:** C1 único nas adaptações do mesmo dia;
  - **QE-R7A1-05:** merge por valor legível;
  - **D57:** o teto de retorno só termina depois de uma semana inteira que cubra a contagem da semana seguinte;
  - **D58:** o slot fácil do retorno curto alcança a primeira qualidade à frente, nesta semana ou depois.
- **Diffs:** `audits/domain-coaching-r7a1-2026-10-27/dossier/RUNTIME_DELTA_R7A1_A1_TO_A2.diff` e `RUNTIME_DELTA_R7A1_A2.diff`.

## 5. Invariantes e prova

**Invariantes:** I1 a I7 do contrato (composição única, isolamento entre semanas, supersessão, merge, reconciliação, teto de restauração, adaptações).

**Testes estruturais:**
- testes metamórficos e de propriedade em `r7a1-composition` e `r7a1-correction`;
- grade de segunda: 157 pares;
- grade noturna: 1.188 pares, de terça a domingo;
- combinações D58: 136 casos;
- busca de três passos: 172 sequências;
- grade D56: 144 timelines.

Resultado no FREEZE-A2: 0 defeitos e 0 erros em todas. No FREEZE-2: segunda 84, noturna 384, combinações D58 103 de 136 e D56 54 de 70; a busca de três passos não tem base no FREEZE-2. As diferenças de ordem esperadas são nomeadas e checadas contra as restrições das duas adaptações.

**Mutação:**
- Cada mutante reverte uma correção; o conjunto passou de 73 para 89.
- A primeira rodada no candidato A2 pegou 86. Os dois sobreviventes sem documentação viraram dois testes antes do freeze.
- Rodada final: 88/89. O sobrevivente documentado é o guarda C7 contra corrida duplicada, um fail-closed para um estado que nenhum caminho produz.
- O sobrevivente da R7-A, QE-R7A-22, agora é pego.

## 6. Regressões

Contra o R7A-FREEZE-2:

| Corpus | Idênticos |
|---|---|
| R5 | 24/24 |
| Perfis | 16/16 |
| Holdout R6 | 30/35 (H22, H24, H25, H26, H29) |
| Simulações | 12/14 (T05, T13) |

Cada diferença está nomeada pela cláusula que a produz (`scripts/verify-r7a1.mjs`, checagem `regression`); nenhum status mudou.

O instrumento do SSCTR difere da saída R7-A CYCLE2 só nas diferenças nomeadas:
- **S9:** a declaração da prova passa de 25 para 30 minutos.
- **D57:** três traces checam uma semana de subida a mais, e uma semana de retorno mostra o próprio teto. Nenhuma contagem muda.

Uso: regressão e reuso de desafio, não evidência de generalização.

## 7. Revisões independentes

| Juiz | FREEZE-A1 | FREEZE-A2 (re-check estreito) |
|---|---|---|
| Engenharia (`quality-reliability-engineer`, instância nova) | NOT_READY: QE-R7A1-01 a 05 materiais | NOT_READY: 01 a 05 fechados pelo mecanismo; **QE-R7A1-09 HIGH**, **QE-R7A1-10 MEDIUM**, 11 LOW |
| SSCTR (fallback documentado) | NOT_READY: D57, D58 | NOT_READY: D56, D57 e D58 fechados; **D59 bloqueante**; D53 aberto |

**Re-check do juiz de engenharia:**
- Reexecutou as próprias sondas, com saídas byte a byte iguais às do autor.
- O P09 rodou 5.000 sequências sem nenhuma violação de oráculo.

**Re-check do SSCTR:**
- Reexecutou as grades: restauração B 0 (A1: 38), teto subindo ou terminando após semana não inteira 0 de 4.211 (A1: 806), short grid 0/315.
- Aceitou as três leituras de "primeira qualidade ainda à frente" e manteve S1 e S4 a S10.
- Revinculou os dez registros ao FREEZE-A2, com o D59 fora de toda aprovação.

## 8. Blockers (Founder request §13)

| Blocker | Estado |
|---|---|
| QE-R7A-01 | **OPEN**, pelo caminho do QE-R7A1-09 |
| QE-R7A-02 | CLOSED |
| QE-R7A-03 | CLOSED |
| QE-R7A-05 | CLOSED |
| QE-R7A-12 | CLOSED |
| QE-R7A-19 | CLOSED |
| D56 | CLOSED |
| D53 | **OPEN**: o D59 é um modo de estado equivalente conhecido (§10) |

Há também um HIGH novo da classe R7-A: QE-R7A1-09.

## 9. Registro NOT_READY (§16)

**Blockers:**
- **QE-R7A1-09 (HIGH, engenharia).** O caso: 16 dias parado, reentrada em 1x5 @RIR4, depois uma pausa separada de 5 dias. O efeito: o plano volta para 3x5 @RIR3 com a carga conhecida de antes da pausa e um longão de 70 a 75 minutos. Os passos de retorno e o modo RETURN da corrida se perdem.
- **QE-R7A1-10 (MEDIUM, engenharia).** Uma segunda pausa curta, separada, adota o slot fácil já executado da primeira. Por isso a primeira qualidade depois dela fica dura (THRESHOLD 41).
- **D59 (SSCTR).** O retorno parte do início da semana da pausa. Quando essa é a primeira semana com carga, todo exercício feito antes da pausa recomeça como primeiro estabelecimento. Em atletas NONE e FAMILIAR:
  - 672 de 672 exercícios ficam sem entrada de retorno;
  - 1.582 linhas ficam acima do teto declarado;
  - 226 contagens ficam duas séries acima da maior desde o retorno.

**Causa raiz:** o ponto de partida do retorno vem de fotografias de início de semana, não da própria pausa.
- A supersessão C5 não tem identidade de pausa. Um relato mais novo de uma pausa foi implementado como qualquer retorno numa semana já replanejada (`startBeforeReturn`), e como qualquer slot já facilitado (o texto da explicação).
- O estado de partida é o início da semana da pausa (`stateTrace[pauseWeek]`). Perde-se o que o atleta executou nela antes da pausa.

**Evidência:**
- `audits/domain-coaching-r7a1-2026-10-27/reviews/quality-engineering-r7a1-recheck.{md,json}`: P13 e P14 no A2, na cópia do FREEZE-A1, no FREEZE-2 e num mutante com a leitura do A1.
- `audits/domain-coaching-r7a1-2026-10-27/reviews/ssctr-r7a1-recheck.{md,json}`: grade de primeira semana com 306 casos, com contagens idênticas no FREEZE-2.

**Por que não fechou:** nem os testes e grades do autor nem as primeiras revisões exercitaram duas pausas separadas, ou exercícios feitos pela primeira vez na semana da pausa.
- A variante do QE-R7A1-09 dentro da mesma semana já existia no FREEZE-A1.
- A variante entre semanas veio da correção do QE-R7A1-03, feita como especificada, sem condição de mesma pausa.
- O D59 é anterior: já estava no R7A-FREEZE-2.
- O limite de ciclo (§11) não permite outra correção.

**Menor próxima missão (decisão do Founder):** corrigir só a base do retorno.
- **Correção:**
  - registrar a pausa que cada retorno relata;
  - partir do estado executado no início da pausa, isto é, o início da semana avançado pelas exposições feitas antes dela, inclusive as primeiras;
  - usar `startBeforeReturn` e o slot fácil anterior só para um relato mais novo da mesma pausa;
  - dar a uma pausa curta separada o próprio slot.
- **Testes:**
  - duas pausas separadas, na mesma semana e entre semanas;
  - duas pausas curtas separadas;
  - a primeira semana com carga com exercícios feitos antes da pausa;
  - os testes existentes.
- **Fechamento:** um freeze e um re-check estreito de cada juiz.
  - Engenharia: `qe-a2-P13`, `P14`, `P02` e `P09`.
  - SSCTR: a grade de primeira semana com E, O e B em 0, a de restauração e a de retorno curto.

## 10. Readiness

| Veredito | Valor |
|---|---|
| WEEK_COMPOSITION_INTEGRITY | READY |
| STATE_PRESERVATION_INTEGRITY | NOT_READY (QE-R7A1-09, QE-R7A1-10) |
| EVENT_SUPERSESSION_INTEGRITY | READY |
| EXERCISE_MERGE_INTEGRITY | READY |
| RETURN_RECOVERY_CEILING_INTEGRITY | NOT_READY (D59, D53, QE-R7A1-09) |
| R7A1_ENGINEERING_REVIEW | NOT_READY |
| R7A1_SCIENTIFIC_REVIEW | NOT_READY |
| R7A_EXIT_READINESS | NOT_READY |

`AUTONOMOUS_COACHING_READY` e `KMP_READY` não são emitidos. Detalhes em `CoachingCore/r7/a1/READINESS_R7A1.json`.

## 11. Fila humana

A fila foi integrada append-only, de 132 para 151 itens, com funding NOT_DECLARED. Os itens anteriores ficaram byte a byte idênticos (`audits/domain-coaching-r7a1-2026-10-27/QUEUE_INTEGRATION_R7A1.json`).
- Os nove itens do R7A1-SSCTR-r1 entraram vinculados ao FREEZE-A1.
- Depois deles entraram os dez do r2, vinculados ao FREEZE-A2. Nove revinculam as decisões do r1 e um é novo.
- O D59 não tem item: está fora de toda aprovação.

## Comprovado, inferido e não testado

- **Comprovado** (saídas registradas e verificador `CoachingCore/r7/a1/VERIFICATION_R7A1.json`):
  - os resultados das grades, testes, mutação e regressão acima;
  - os vínculos de freeze dos dois juízes;
  - a integração da fila.
- **Inferido:** que a correção da base do retorno descrita em §9 basta para os três blockers. Nenhum juiz viu essa correção.
- **Não testado:**
  - atletas reais e validação humana ou empírica;
  - dados não sintéticos;
  - a classe R23 (acessórios sem teto), encaminhada ao SSCTR;
  - os itens LOW (QE-R7A1-06, 07, 08 e 11), registrados sem correção.
