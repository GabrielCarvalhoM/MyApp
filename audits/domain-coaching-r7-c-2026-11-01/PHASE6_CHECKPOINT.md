# R7-C · Fase 6 — checkpoint (2026-11-02)

**Autoridade.** Pedido direto do Founder (DOMAIN COACHING — R7-C · FASE 6), com um único objetivo: fechar o QE-R7C-07. A aplicação de uma resposta factual a `UNREPORTED_TRAINING` deve ser independente da decisão que a registrou. O pedido não prevê ciclo de correção: um bloqueio novo num gate fecha a fase.

**Base.** `claude/domain-coaching-r7-c`, a partir de `9863732` (documental) e de `R7C-FREEZE-2` (`a10cec0`, runtime). Commits da fase:
- `dca3f94`: pin de fixture de cinco testes de estado (classificado antes da edição);
- `397872a`: a correção e os testes dirigidos;
- `26f6046`: as grades dos testes dirigidos passam a ser compartilhadas;
- `9b3a9ae`: o runner de evidência e o harness de mutação;
- `1a237ad`: a testemunha de G01 tornada efetiva;
- `fb75d5b`: o gerador e o verificador do freeze;
- `08c6db3`: as evidências;
- `344ea61`: `R7C-FREEZE-3`, handoff e pedidos;
- `281d5cf`, `33bbb5f`: as revisões.

**Fora do escopo.** Ficaram intocados:
- policy, catálogo, envelope G02, dose nova, `product/`, `canon/`, a fila (230);
- os registros fechados, FREEZE-1 e FREEZE-2;
- Figma, iOS e Supabase.

O bug do R4 HOLD não foi corrigido. QE-R7C-08, -09, -05, C8, C5, C10, G03 e D1 não foram absorvidos. A R7-D não foi iniciada.

## R7C_PHASE6_STATUS

**`CLOSED_NOT_READY`.**
- **Engineering:** NOT_READY, com o bloqueio **QE-R7C-10** (BLOCKER, DIRECT_R7C_DELTA). O QE-R7C-07 fecha para respostas com corridas em dose cheia, mas não para respostas executadas e encurtadas.
- **SSCTR:** ACCEPT_WITH_CONDITIONS, sem bloqueio do SSCTR (SSCTR-P6-R7C-r5). O achado P6-F01 dele tem a mesma causa.

Pela regra do Founder (sem ciclo nesta fase), a fase fecha com o bloqueio explícito. `R7C-FREEZE-3` é o último estado congelado da R7-C, não um estado pronto.

## QE_R7C_07 (antes → depois)

**Antes, no FREEZE-2.** Uma resposta EXEC, MIXED ou ADVERSE registrada por um HOLD do R4 ou por uma rota clínica de handler nunca era aplicada. A projeção obsoleta ficava VALID em 72 de 160 células, por exemplo:
- RACE_TOUCH 25 na semana de prova;
- qualidade no taper;
- QUALITY 34 / LONG 60, onde a resposta adversa direta dá EASY 45 / LONG 35.

**Depois, no FREEZE-3: `answeredOnRecord`**, a forma por estado do `gapAnsweredBy`.
- **O teste.** Considera o registro sem os relatos de corrida que o plano guardado não leu: semanas só projetadas, ou fechadas por revisão com todos os gates de corrida em HOLD que agora leem como executados. Se nesse registro as doses à frente dependem de treino não relatado, e no registro atual não dependem, a semana da resposta é replanejada pelos fatos (C9) antes de qualquer handler.
- **Ordem:** clínico → reconciliação factual → adaptação comum. Vem depois do replanejamento pelo teto, que continua aplicando as paradas conhecidas.
- **G01:** nunca viaja ao lado de uma pergunta `UNREPORTED_TRAINING`.
- **Sem schema novo.** O redutor só expõe os gates que já calculava.

**Fechado para dose cheia:** 0 de 160 células e 0 de 1.536 trajetórias (Engineering).

**Não fechado:** a resposta executada mas encurtada (QE-R7C-10).
- A semana fechada pela revisão sem corrida relatada continua lida como HOLD, e por isso conta como já lida.
- Exemplo: GEN semana 7, corridas feitas a 60 %, rota clínica e liberação. A decisão seguinte dá KEEP, VALID, QUALITY 34 / LONG 60, contra EASY 44 / LONG 44 da resposta direta.

## RECORDER_INDEPENDENCE

| Grade | FREEZE-3 | FREEZE-2 | R7B2-FREEZE-1 |
|---|---|---|---|
| Grade da Engineering (`rc-p4`; EXEC, MIXED, ADVERSE, MISS, PARTIAL) | **0 / 160** | 72 / 160 | 0 |
| Trajetórias da Engineering, dose cheia (4 portadores, dias 1, 2 e 4) | **0 / 1.536** | — | — |
| Respostas encurtadas (Engineering, `p6-x5`) | **28 / 280** | 224 / 280 | 0 |
| Mistas, escopo do SSCTR (P6-F01) | 16 / 768 | igual | — |

## DIRECT_VS_R4_VS_CLINICAL

`DIRECT == R4_AFTER == CLINICAL_AFTER` em todas as 160 células da grade do recheck. Isso vale com e sem reenvio, e para EXEC, MIXED, ADVERSE, MISS e PARTIAL.

Exemplos:
- semana de prova depois de uma resposta mista: EASY 20 + RACE 75 (antes RACE_TOUCH 25);
- GEN depois de uma resposta adversa: EASY 45 / LONG 35 (antes QUALITY 34 / LONG 60).

Fora dessa grade, a igualdade falha para respostas encurtadas (QE-R7C-10) e para algumas mistas (P6-F01).

## PLAN_VALIDITY

- **Nunca VALID com a projeção obsoleta** nas células de dose cheia. A rota clínica de pé nunca prescreve (960/960) e uma resposta parcial continua ASK. Testes dirigidos e mutante P6-M4.
- **Falha no QE-R7C-10:** a projeção obsoleta é apresentada VALID, e nenhuma condição de consumidor a protege.

## DIRECTED_TESTS

`test/r7c-phase6.test.mjs`: **12/12**. Cobrem:
- EXEC, MIXED e ADVERSE em DIRECT, R4 e clínico;
- MISS sem mudança (continua pelo teto);
- PARTIAL continua ASK;
- a rota clínica bloqueia a prescrição, e a liberação aplica os fatos sem reenvio;
- validade;
- determinismo;
- histórico intacto;
- Property B (relato tardio isolado);
- o alcance (o histórico P51 original);
- a guarda G01.

**O que a fase pegou em si mesma.** A primeira rodada de mutação (em `9b3a9ae`) mostrou que a testemunha de G01 era vazia: na revisão de fim de semana não há sessão à frente. O P6-M6 só morria pelo teste D4. A testemunha foi refeita em `1a237ad` (mudança de agenda no dia 4), e as duas rodadas foram refeitas e as saídas antigas descartadas.

**O que ela não pegou:** todos os testes usam respostas em dose cheia (QE-R7C-14).

## FULL_SUITE

**866/866** (854 + 12), no registro do freeze, no verificador `--suite` e na evidência.

**Falhas classificadas antes de qualquer edição.**
- **Quais:** T1, T6, T6b e T7c (`r7asm`) e S3 (`r7asc`), com a mesma causa.
- **Causa:** o fixture P51 deixa o plano da semana 7 apoiado só em projeção (revisões KEEP, semanas não revisadas). Esse é o estado de uma resposta registrada por portador, e a primeira decisão o replaneja.
- **Classificação:** **EXPECTED_SEMANTIC_UPDATE só do fixture.**
- **O pin:** a revisão da semana 4 adota um agachamento registrado 2,5 kg acima, uma âncora de evidência. Nenhuma asserção mudou, e os testes passam também nos bytes do FREEZE-2 (77/77).
- **Os dois gates confirmam a classificação.**

## MUTATION

Em cópia isolada, com o repositório intacto ([saída](probes/out/mutation.R7C-P6-fb75d5b.json)).

| Conjunto | Resultado |
|---|---|
| Fase 3 | 17/18, G02-M4 equivalente, testemunha morta |
| Fase 4 | 8/8 |
| SD | 6/6 |
| Ciclo | 9/9 (fragmentos de CC-M2 e CC-M8 acompanham o texto novo, mesma mutação) |
| **Fase 6, P6-M1..M7** | **7/7 mortos** |

Os mutantes da Fase 6:
- M1: nunca reconcilia;
- M2: só MISS;
- M3: a liberação exige reenvio;
- M4: plano obsoleto VALID;
- M5: a identidade do portador entra;
- M6: viaja com a pergunta;
- M7: semana fechada sempre lida.

Mutantes próprios do juiz: 2 mortos, 3 equivalentes, 3 sobreviventes. Um sobrevivente tem testemunha: REGRESS fora de "executado" deixa uma resposta toda adversa obsoleta (QE-R7C-14).

## ADVERSARIAL

- **SD** (1.200 células, 0 violações), **SD-01** e **G02:** byte-idênticos ao FREEZE-2.
- **G01:** 0 violações, P1 165/0, grade B 46/46. A grade A muda **8 linhas** (MISS/UNREP), com **4 veredictos** de OK_INDEPENDENT para OK_HOLD_LIKE_REVIEWED_MISS: fatos tardios trazidos por uma mudança de agenda depois de semanas KEEP agora são aplicados. EXEC fica inalterado.
- **Diferencial contra o FREEZE-2:** 120/120 cenários idênticos (a família do ciclo, mais meio de semana sem relato, relato tardio isolado e revisão pulada).
- **Diferenciais contra o R7B2-FREEZE-1** (`regress`, `neighbors`): idênticos ao FREEZE-2.
- **Holdout:** idêntico, H19 incluído, D1 sem mudança.
- **Suplementar:**
  - `rc-p2` FREEZE-2 contra FREEZE-3: 540/540 decisões idênticas, a classe do QE-R7C-08 intacta;
  - `rc-p5`: leitura idêntica (QE-R7C-09).

## CLINICAL

- K6 1/1, K6b 1/1, CAND-01 / CAND-02 / ADJ PASS, adversarial herdado 3.228/0. Idênticos ao FREEZE-2 salvo rótulos.
- QE-R7B1-04 preservado (precedência clínica no teste `r7b2-clinical-precedence`).
- Rota clínica de pé: nada prescrito.
- Depois da liberação: fatos aplicados sem reenvio, exceto QE-R7C-10 e P6-F01.
- O flag clínico de elegibilidade continua sem registrar nada (R5).

## FREEZE

- **`R7C-FREEZE-3`** ([registro](../../CoachingCore/r7/c/RUNTIME_FREEZE_R7C_3.json), sha256 `e21da973…0f36`).
- **Bytes:** commit `08c6db3`, fonte `764ad023…4b38`, manifesto `ebc8af2f…bbaa`, 163 arquivos, 866/866.
- **Verificador:** `node CoachingCore/scripts/verify-r7c.mjs --revision 3 --suite`, **20/20 PASS** ([relatório](../../CoachingCore/r7/c/VERIFICATION_R7C_3.json)), só leitura. Os dois juízes o rodaram antes e depois: 20/20.
- **Supera o FREEZE-2.** O verificador do FREEZE-2 agora falha `files-current` por desenho; o FREEZE-2 não foi editado.

## ENGINEERING_GATE

**NOT_READY** ([registro](reviews/engineering/PHASE6_REVIEW_R7C.md); `quality-reliability-engineer` novo e independente, `claude-opus-5-5`, xhigh).

| Pergunta | Resposta |
|---|---|
| 1. QE-R7C-07 fechado para EXEC/MIXED/ADVERSE | parcialmente (dose cheia sim; encurtadas não) |
| 2. Independência 0/160 | sim (refeito) |
| 3. Validade nunca mascara projeção obsoleta | não, pelo QE-R7C-10 |
| 4. Clínico depois da liberação sem reenvio | sim, exceto encurtadas; nada prescrito enquanto a rota está de pé |
| 5. Histórico intacto | sim (111 replanejamentos, 0 violações) |
| 6. Identidade do portador fora da semântica | ainda não, para encurtadas |
| 7. QE-R7C-08/09 corretamente classificados | sim |

Sobre a pergunta 6, o juiz acrescenta:
- **O alcance:** é a consequência necessária sob as premissas (sem schema, liberação = sem estado clínico, registro sem carimbo de chegada), mas é mais largo que o declarado.
- **Os pins:** corretos.
- **A borda divulgada:** resíduo aceitável.

## SSCTR_GATE

**ACCEPT_WITH_CONDITIONS** ([registro](reviews/ssctr/SSCTR_PHASE6_RECHECK_R7C.md), SSCTR-P6-R7C-r5, `claude-opus-5-5`, xhigh).

**Itens:**
- nenhum efeito prescritivo novo (0/170 acima do FREEZE-2 ou do teto);
- adversas e mistas dentro das autoridades: parcialmente, com P6-F01;
- clínico primeiro;
- limites de taper e prova;
- G02 inalterado;
- C9 continua vinculante (handlers 66/66 iguais ao FREEZE-2);
- alcance e pins aceitos.

**Condições:**
- C2, C4, C5 e C8 inalteradas;
- C10 como na r4;
- C3: cláusula r5 substitui a r4 (adversas saem, mistas ficam);
- C7: r5;
- C9: nota r5;
- **C11 nova** (no caminho no prazo, a semana seguinte é provisória até a revisão).

**Conflito registrado, não resolvido aqui.** O SSCTR estreitou a C3. A Engineering diz que a cláusula r4 não deve ser estreitada enquanto o QE-R7C-10 existir, porque o texto r5 ("mistas") não cobre a resposta toda encurtada. Os dois registros ficam vinculados, e o texto da C3 é decisão do SSCTR na próxima missão. O runtime segue como referência sombra.

## REMAINING_NONBLOCKING_FINDINGS

- **QE-R7C-11** (menor, Fase 6): o alcance é mais largo que o pedido declarado.
  - Cobre quem nunca revisa, a partir da semana 5; janelas só com KEEP; quem relata sempre atrasado.
  - Muda o escopo da Property B de forma conservadora.
  - A contagem do G01 é 8 linhas e 4 veredictos.
  - O QE-R7C-05 agora passa (81/81).
- **QE-R7C-12** (menor, Fase 6): depois de uma resposta direta, o replanejamento dispara de novo na semana. Depois de uma parada conhecida pode levar as corridas fáceis VALID da semana seguinte de 15/15 a 20/20 (o teto), acima da revisão da própria semana, até essa revisão. Encaminhado ao SSCTR (C9).
- **QE-R7C-13** (observação): a borda (replanejamento factual ao lado de uma pergunta sobre a semana seguinte) também acontece pela origem MOVED, igual nos dois freezes. Nunca é VALID.
- **QE-R7C-14** (observação): adequação dos testes (só dose cheia; o sobrevivente REGRESS).
- **SSCTR:**
  - **P6-F01:** condição, mesma causa do QE-R7C-10;
  - **P6-F02:** C11;
  - **P6-F03 / F04:** divulgações de semanas nunca revisadas;
  - **P6-F07:** R3, pré-existente;
  - **P6-F08:** documental, o handoff exagerava; corrigido no fechamento.
- **Pré-existentes, inalterados, não absorvidos:**
  - QE-R7C-08 (menor, divulgação ou pergunta de policy ao SSCTR);
  - QE-R7C-09 (observação);
  - CC-F01 / R1 (C9, rotas de handler);
  - o HOLD do R4;
  - C8, C5, C10, G03.

## D1

**`ACCEPTABLE_RESIDUAL`**, inalterado (holdout H19 idêntico).

## V1_COACHING_AUTHORITY_READY

`NO`.

## GIT

- Branch `claude/domain-coaching-r7-c`, worktree `.claude/worktrees/domain-coaching-r7-c`.
- Commit local de fechamento sobre `33bbb5f`; o SHA está no `git log` da branch.
- **Sem push e sem merge.**

## NEXT

Uma missão de runtime seguinte precisa de autorização própria do Founder:
1. **QE-R7C-10 primeiro, que fecha também o P6-F01.** Decidir "a revisão não leu corrida" pelo registro, não pela classe do gate. Testes dirigidos para:
   - respostas encurtadas (60 %, 80 %, longões encurtados e o resto perdido), por portadores clínicos e não clínicos;
   - uma resposta toda adversa (QE-R7C-14).
2. Depois, o QE-R7C-13 e o CC-F01.
3. Por fim, a suíte completa, um novo freeze, o recheck do SSCTR (C3, Property B, C9) e o gate de Engineering.

A R7-D não foi iniciada.
