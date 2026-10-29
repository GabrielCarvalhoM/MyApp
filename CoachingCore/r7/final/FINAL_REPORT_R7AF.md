# DOMAIN_COACHING_R7-A — Fechamento final — Relatório

**Resultado:** `R7A_EXIT_READINESS = NOT_READY`, encerrado com blocker explícito (Founder §17, §23).
- **Identidade de interrupção:** resolvida. O juiz de engenharia não achou caminho em que duas interrupções diferentes dividam identidade, nem em que uma correção vire episódio novo.
- **Blockers nomeados pela missão:** todos fechados (QE-R7A-01, QE-R7A1-09, QE-R7A1-10, D53, D56, D57, D58, D59).
- **O que segura o NOT_READY:** o juiz achou um blocker material novo no lado do estado, QE-R7AF-01.
- **SSCTR:** ACCEPT.

Não há ciclo de correção depois do freeze: a decisão volta ao Founder.

| Item | Estado |
|---|---|
| Freeze único | R7A-FINAL-FREEZE, digest de fonte `ec2debe730df8931d1525f2b1a729ce3d808c08842fb75397d2fc91084294605` (arquivo `CoachingCore/r7/final/RUNTIME_FREEZE_R7A_FINAL.json`, `a5f07a3f…`, 80 arquivos) |
| Delta do R7A2-FREEZE-1 | mudou `src/r6-adaptation.mjs` (só esse arquivo de runtime), `test/r7a1-composition.test.mjs` e `test/r7a2-interruption.test.mjs`; novo `test/r7af-episode-identity.test.mjs` |
| Política | R6-POLICY-5 `18ec48f3…`, inalterada |
| Testes | 528/528 (519 anteriores, 9 novos; Node v24.19.0) |
| Mutação (só as invariantes novas) | 21/21 pegos |
| Self-challenge | 43 casos em 16 classes: 0 violações no freeze, 51 no R7A2-FREEZE-1 |
| Regressão contra o R7A2-FREEZE-1 | R6 holdout 35/35, R5 24/24, perfis 16/16, simulações 14/14 idênticos |
| Evidência no freeze | 59 execuções, 0 falhas, digest igual antes e depois de cada uma: 41 saídas byte a byte iguais às do R7A2-FREEZE-1, 16 com diferença nomeada, 0 sem nome |
| Juízes no R7A-FINAL-FREEZE | engenharia **NOT_READY** (QE-R7AF-01, MEDIUM, material); SSCTR **ACCEPT** |
| Fila humana | 163 → 175 (12 itens HQ-R7AF-SSCTR-*, append-only, funding NOT_DECLARED) |
| Próxima missão | `FOUNDER_ARCHITECTURAL_DECISION` (não iniciada) |

Escopo: só a referência offline sintética em Node 24. Sem UI, Figma, KMP, HealthKit, Android, integrações, produção, efeito em plano real, commit, merge ou deploy. Não declarado: coach autônomo pronto, qualidade de decisão global, KMP, produção, validação humana ou clínica.

## 1. Baseline

Antes de qualquer edição, sobre o R7A2-FREEZE-1:
- digest recalculado `e0637ec2…`, com 0 de 79 arquivos divergentes; política `18ec48f3…`;
- `verify-r7a2.mjs` em modo leitura deu 19/19, e `node --test` deu 519/519;
- o blocker foi reproduzido byte a byte contra as saídas do juiz (`audits/domain-coaching-r7a-final-2026-10-28/probes/baseline/`):
  - **mesma semana** (P17 L1–L4 e as células do P19 com B na semana da reentrada): B lido como SAME_BREAK de A, seis linhas na dose pré-pausa (`back-squat 3x5@3 KNOWN 82.5`) e longão de 70 minutos;
  - **semana seguinte** (as células do P19 com B na semana 6): B lido como SAME_BREAK de A;
  - P20 (terça da semana 4 em `QUALITY THRESHOLD 41`) e P21 (B fundida em A).

O `BASELINE.json` vincula 1.952 arquivos, e `freeze1-source/` guarda o runtime do R7A2-FREEZE-1 byte a byte.

## 2. Modelo de identidade (InterruptionEpisode)

Cada relato de retorno que replaneja registra a sua interrupção:
- `episode` (a identidade);
- `startDate` e, quando dado, `startedAt`;
- `endDate`, `days` e `class`;
- `relation` (NEW ou SAME_BREAK), `revision` e `supersedes`;
- `basis` (por que é essa interrupção) e `inputHash`;
- `stateAt` (o ponto de partida do estado) e `entry` (o início que ele fixou).

A hora do relato é o `asOf`. Contrato: `audits/domain-coaching-r7a-final-2026-10-28/INTERRUPTION_EPISODE_CONTRACT.md` (R7AF-INTERRUPTION-1).

`isSameInterruption` decide nesta ordem (Founder 0.4):
1. **Identidade explícita.** `interruption.episodeId` nomeia a interrupção, pela identidade ou por um dos seus relatos: é uma correção da mesma (EXPLICIT). Um nome que o registro não tem abre uma interrupção nova com essa identidade.
2. **O mesmo relato de novo** (o mesmo event id, os mesmos fatos): KEEP, nada muda. O mesmo id com outros fatos: ASK.
3. **Duplicata demonstrável** (sem nome): os mesmos dias da última interrupção são a mesma (DUPLICATE).
4. **Interrupção nova depois de reentrada ou treino:** NEW (AFTER_REENTRY ou TRAINING_BETWEEN), qualquer que seja a data ou o relógio de outro relato.
5. **Todo o resto: ASK.** Datas que encostam ou se sobrepõem nunca bastam sozinhas.

**Input legado sem nome (§9):** valem só as regras 2–5. Os retornos já gravados mantêm a identidade gravada; não há migração.

## 3. Modelo de estado temporal (executedStateAt)

**O ponto.** O ponto é o início fixado pela última decisão **em vigor no início da interrupção**, pela hora do relato:
- **Relato em vigor.** Conta o relato da interrupção anterior que estava em vigor naquele momento, mesmo que um relato posterior dela tenha vindo depois. É isso que fecha o QE-R7A2-01.
- **Relato tardio.** Uma interrupção relatada só depois de esta começar ainda é a última antes dela: o ponto é o início que o seu relato fixou (0.7).
- **Depois de um retorno**, o início de uma semana só é ponto quando foi conquistado. Senão o ponto recua até o próprio retorno, e as execuções dessas semanas entram como fatos (P5). **É aqui que está o QE-R7AF-01** (§10 abaixo).
- **Antes de qualquer retorno**, o início da semana é o do plano: C3, fronteira 3 da R7-A.2, mantida.

**Os fatos.** Sobre o ponto entram, só como fatos, as exposições executadas depois dele e antes do início:
- o exercício em uso;
- a data da última execução;
- o teto, quando o alvo foi cumprido.

Não entram adoção de carga, passo nem set de bloco. Nada a partir do início conta (I7).

**Mesmo dia (0.8).**
- **Com `startedAt`:** a sessão é ordenada pelo instante.
- **Só com a data:** a sessão do primeiro dia é lida como depois do início, e a outra leitura é calculada.
  - Se as duas diferem num fato de que o retorno parte (exercício em uso, teto, carga não registrada), pergunta-se o horário.
  - Se diferem só na data de última execução, a data basta e a outra leitura fica gravada. A data mais antiga é a leitura conservadora.
- **Pré-freeze.** A primeira versão julgava a materialidade pelas linhas planejadas. Isso fazia o resultado depender da ordem de duas mudanças no mesmo dia: a grade noturna da R7-A.1 o mostrou em três pares. A versão congelada julga pelo estado, e os três pares sumiram.

## 4. Correções

Uma correção nomeia a interrupção que corrige, mantém a identidade, recebe a revisão seguinte e substitui o relato em vigor (I1, I3, P2). O seu estado é `executedStateAt` no seu próprio início, nunca a fotografia do relato anterior (0.6).

Corrigir uma interrupção anterior depois que uma posterior fixou o plano é perguntado (fronteira B4). Sem nome, uma data deslocada é perguntada (Founder 0.4); antes, era lida como a mesma pausa.

## 5. Pausas distintas

Uma interrupção que começa depois da reentrada da anterior, ou depois de treino registrado, é nova (I2). Ela parte da reentrada em vigor quando começou (I4), e um relato posterior da anterior não a alcança. O easy slot de um retorno curto pertence à sua interrupção (I8).

## 6. Evidência histórica tardia

A execução é situada pela hora em que foi executada, nunca pela hora em que foi relatada (I6).

Quando o log chega depois do retorno, e enquanto esse retorno ainda fixa o plano (até o fim da semana de reentrada), toda revisão recalcula `executedStateAt`:
- se o início do retorno mudaria, a revisão pergunta (confirmation-first): grava os fatos, não muda mais nada, e o novo relato da mesma interrupção lê o registro inteiro;
- depois da semana de reentrada, um fato tardio é lido como todo fato tardio (fronteira B1).

## 7. Ambiguidade

Perguntado, nunca adivinhado (I9):
- relato sem nome que se sobrepõe à última interrupção;
- nome novo nos dias de outra;
- correção de uma interrupção anterior;
- relato que atravessa uma reentrada;
- mesmo event id com outros fatos;
- sessão de primeiro dia material, sem horário;
- evidência tardia que muda o estado do retorno em vigor.

## 8. Regressões

**Contra o R7A2-FREEZE-1** (`CoachingCore/r7/final/REGRESSION_R7AF.json`): R6 holdout 35/35, R5 24/24, perfis 16/16 e simulações 14/14, todos idênticos.

**Evidência no freeze** (`probes/EVIDENCE_RUNS_R7AF.json`, `probes/COMPARE_R7AF.json`): 41 saídas byte a byte iguais às do R7A2-FREEZE-1, entre elas:
- a grade de primeira semana (D59), as de restauração, de caps e curta;
- as leituras D58, a extensão de primeira semana, rotação, teto, traços, grade D56, três passos e combinações D58;
- P13, P14, P01–P08, P10, P15 e P16.

O instrumento do round 12 tem as 43 seções iguais. As 16 diferenças estão nomeadas em `probes/COMPARE_R7AF_NAMED.json`:
- **o blocker fechado:** P17, P19, P20, P21;
- **o log tardio agora perguntado:** P18;
- **correção sem nome perguntada:** P02, cujo sucessor com nome dá SAME_BREAK nos dois relógios; também a seção S5 da sonda do SSCTR, o item SE e as grades de handlers;
- **dia mesmo perguntado:** a grade de primeiro dia do SSCTR (72 de 72) e a composição E14;
- **P09:** contagem de passos ±3, com O1–O7 = 0 e 0 erros em 5.000 sequências.

## 9. Mutação

Foram 21 mutantes, só das invariantes novas: os seis do §16 e as peças em que eles se apoiam. Os 21 foram pegos.

A primeira rodada pegou 15 de 20. Os cinco sobreviventes eram cantos sem teste e viraram testes antes do freeze:
- reentrada lida do relato mais recente, sem treino entre;
- correção nomeada de uma interrupção anterior que passa da posterior ou atravessa a reentrada;
- correção movida para depois do próprio relato;
- log tardio de primeiro dia.

## 10. Revisão de engenharia (R7AF-QE-r1)

Juiz: `quality-reliability-engineer` em instância nova (claude-opus-5-5, xhigh). Digest `ec2debe7…` no início e no fim, com 0 de 80 arquivos divergentes.

**Veredito: NOT_READY.** A resposta ao §18:

**Identidade: não.** Em 216 células de ordem e relógio, em quatro fusos, duas interrupções diferentes nunca dividiram identidade, e uma correção nunca virou episódio novo. A cobertura incluiu:
- grades curtas de três pausas;
- duplicatas;
- nomes: com o relato, desconhecidos e reusados.

**Estado: sim, num caminho (QE-R7AF-01, MEDIUM, material, classe nova).**
- **O caminho:** depois de um retorno cuja semana de reentrada não terminou nem foi revisada, uma decisão qualquer, datada depois dessa semana e antes de uma pausa separada, faz o teste de semana conquistada aceitar o início de semana que o retorno guardou.
  - Exemplos: uma declaração de equipamento (mesmo uma que não muda nada) ou um relato de fadiga sistêmica.
  - O início aceito inclui um passo de retorno nunca executado.
- **Efeito no P30c:**
  - semana 6 com corridas de 30 e 45 minutos, em vez de 15 e 20;
  - semana 7 com `back-squat 2x5@3 KNOWN 82.5`, em vez da entrada `1x5@4`, e longão de 60 em vez de 45.
- **Alcance:** no P30b, 13 de 15 células mudam o início de B.
- **Causa:** o predicado `earned` (`src/r6-adaptation.mjs:674`) conta qualquer decisão com `fromWeek ≤ k`, feita do último dia da semana anterior em diante. Mas uma decisão da semana seguinte só mantém aquele início; não o recalcula da evidência da semana.
- **No R7A2-FREEZE-1**, toda célula dá o mesmo passo 1. A saída esportiva iguala a da R7-A.2, que o SSCTR aceitou. Mas a regra desta missão (P5, §10, Founder 0.5) só vale "quando nada mais foi decidido".
- **Reprodução:** `audits/domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-P30c-reproduction.mjs` e a grade `qe-r7af-P30b-earned-week-grid.mjs`, com execuções no R7A2-FREEZE-1. O autor reproduziu o P30c byte a byte (`8dfa53db…`).

**Não materiais:**
- **QE-R7AF-02 (MEDIUM):** uma correção nomeada pode levar a interrupção para depois da própria reentrada executada, o que restaura a dose pré-pausa. É uma decisão do Founder, porque o 0.4 põe a identidade explícita primeiro.
- **QE-R7AF-03 (LOW):** o mesmo registro reenviado com outro event id, semanas depois, reinicia um retorno concluído. Já acontecia no R7A2-FREEZE-1.
- **QE-R7AF-04 (LOW):** um fato tardio que só move datas de última execução ainda pergunta.

**Fronteiras e recomendações:**
- Fronteiras B1–B6: aceitas, com notas em B3 e B5.
- WEEK_COMPOSITION, EVENT_SUPERSESSION e EXERCISE_MERGE: READY.
- STATE_PRESERVATION e o lado de engenharia de RETURN_RECOVERY_CEILING: NOT_READY.

## 11. Revisão de regressão do SSCTR (R7AF-SSCTR-r1)

Juiz: `sports-science-concurrent-training-reviewer` nativo (claude-opus-5-5, xhigh). Digest `ec2debe7…` no início e no fim, com 0 de 80 arquivos; 33 execuções próprias vinculadas.

**Veredito: ACCEPT**, sem achado bloqueante.

| Item | Estado | Base |
|---|---|---|
| D53 | CLOSED | Nos casos F-A, a segunda pausa parte da primeira reentrada, com 0 linhas na dose pré-pausa e longão de 20 |
| D56 | Mantido | 0 subidas ou fins de cap depois de semana não inteira |
| D57 | Mantido | B 0, C 0 |
| D58 | Mantido | Grade curta 0/315; um slot por pausa |
| D59 | Mantido | Grade de primeira semana E = O = B = 0 em NONE, FAMILIAR e KNOWN |

As grades são byte a byte iguais às do R7A2-FREEZE-1.

**Regras F-A a F-F aprovadas:**
- F-C resolve o NF-1. Com só a data, 72 de 72 casos perguntam. Com horário depois da sessão, 195 de 195 exercícios entram na entrada com o teto do dia.
- F-D implementa o R37.
- F-F é o ASK do Founder (0.4).

**Rota clínica:** antes da identidade (6 de 6).

**Não bloqueantes:**
- **NF-R7AF-1 → R38:** com a confirmação pendente, toda outra revisão da semana de reentrada também pergunta. Se nunca for respondida e a semana for perdida, a semana seguinte guarda o passo planejado; são as saídas de uma semana não revisada (B3).
- **NF-R7AF-2 → R39:** uma correção sem nome que alonga a pausa (de 5 para 14 dias) é perguntada. Enquanto isso, a retomada curta segue em vigor.

**Registros e fila:**
- Os 13 registros foram revinculados como R7AF-SSCTR-r1. O validador Node deu 0 erros, e o controle negativo foi pego.
- 12 itens HQ-R7AF-SSCTR-* foram integrados à fila: 163 → 175, append-only (`audits/domain-coaching-r7a-final-2026-10-28/QUEUE_INTEGRATION_R7AF.json`).

## 12. Readiness

| Veredito | Valor |
|---|---|
| WEEK_COMPOSITION_INTEGRITY | READY |
| STATE_PRESERVATION_INTEGRITY | NOT_READY (QE-R7AF-01) |
| EVENT_SUPERSESSION_INTEGRITY | READY |
| EXERCISE_MERGE_INTEGRITY | READY |
| RETURN_RECOVERY_CEILING_INTEGRITY | NOT_READY (lado de engenharia, QE-R7AF-01; lado esportivo ACCEPT) |
| R7A_FINAL_ENGINEERING_RECHECK | NOT_READY |
| R7A_FINAL_SCIENTIFIC_RECHECK | READY (ACCEPT) |
| R7A_EXIT_READINESS | **NOT_READY** |

Blockers: QE-R7A-01, QE-R7A1-09, QE-R7A1-10, QE-R7A2-01, 02 e 03, D53, D56, D57, D58 e D59 estão **CLOSED**; QE-R7AF-01 está **OPEN**. Detalhes em `CoachingCore/r7/final/READINESS_R7AF.json`.

## 13. Próximo passo exato

`NEXT_MISSION = FOUNDER_ARCHITECTURAL_DECISION`. Nada foi iniciado:
- nem essa missão, nem R7-B0, nem R7-B;
- não há handoff (`CoachingCore/r7/R7A_FINAL_HANDOFF.md` não foi escrito);
- não há segundo freeze, ciclo de correção, A.3.1 nem terceiro juiz.

**Registro do NOT_READY (§23):**

**Achado:** QE-R7AF-01. **Reprodução:** P30c e P30b, acima.

**Mesma classe ou classe nova?** O juiz o classifica como classe nova: o predicado desta missão, não a identidade. Leitura do autor, separada do juiz: é o resíduo da fronteira 3 da R7-A.2 (o início condicional de uma semana não revisada) na forma estreitada por esta missão. A saída esportiva é a mesma da R7-A.2 naquele caminho.

**Por que a identidade estável não resolveu?** A identidade está certa: B é episódio novo, com identidade própria, e ninguém a reivindica. O defeito é qual início de semana conta como estado executado. Isso é estado temporal, não identidade.

**Decisão arquitetural necessária.** A menor, apontada pelo juiz: depois de um retorno, aceitar o início planejado de uma semana só quando ele foi fixado a partir da evidência da semana anterior (a revisão daquela semana, ou a semana executada como planejada).

Uma variante mais ampla, também do Founder, porque toca a fronteira 3 antes de qualquer retorno: o estado executado nunca lê um início de semana planejado e não decidido. Isso mudaria saídas da era R6 em programas sem registro.

**Decisões relacionadas do mesmo registro:**
- **QE-R7AF-02:** uma correção nomeada que leva a interrupção para depois da própria reentrada executada deve ser perguntada?
- **QE-R7AF-03:** o mesmo registro com outro event id deve ser KEEP quando os fatos e o início recalculado não mudam?
- **QE-R7AF-04:** um fato tardio que só move datas de última execução deve deixar de perguntar?
- **R38 e R39 do SSCTR.**

Ponto de retomada: `audits/domain-coaching-r7a-final-2026-10-28/CHECKPOINT.md` e `FINAL_DISPOSITION.json` (`notReadyRecord`).

## Comprovado, inferido e não testado

**Comprovado:** saídas registradas e ligadas ao digest, conferidas por `CoachingCore/scripts/verify-r7af.mjs` (`CoachingCore/r7/final/VERIFICATION_R7AF.json`).
- o baseline e o blocker reproduzidos antes da edição;
- o caminho QE-R7A2-01 fechado (P17, P19, P20 e P21) e a identidade sem falha nas grades do juiz;
- D59 e as grades esportivas iguais byte a byte;
- testes 528/528, com 8 dos 9 novos falhando no R7A2-FREEZE-1 (o de P3 passa lá também);
- mutação 21/21, self-challenge 0/43 e 51/43 no R7A2-FREEZE-1, regressão idêntica;
- os dois vereditos ligados ao freeze;
- o QE-R7AF-01 reproduzido pelo autor byte a byte.

**Inferido:** que a regra "início conquistado só pela evidência da semana anterior" fecha o QE-R7AF-01. Nenhuma correção foi escrita nem vista por um juiz.

**Não testado:**
- atletas reais e validação humana, empírica ou clínica;
- dados não sintéticos;
- a leitura de fatos tardios de semanas antes do ponto (fronteira B2);
- avaliação fora de ordem dos relógios dos relatos.
