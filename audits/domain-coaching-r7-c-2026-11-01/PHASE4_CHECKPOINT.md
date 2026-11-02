# R7-C · Fase 4 — checkpoint (2026-11-01)

**Autoridade.** Pedido direto do Founder de 2026-11-01 para a Fase 4, a fase final de correção da R7-C.

**Base.** `claude/domain-coaching-r7-c` em `5ba8738`. Commits da fase:
- `ec2c1e4`: correções de P3-01, P3-02 e P3-03, mais os testes de P3-05;
- `39115ed`: os caminhos de sessão perdida e de desempenho, mais as sondas da Fase 4;
- `f6c688c`: o pedido ao SSCTR e as evidências da Etapa E.

**Fora do escopo.** Nenhuma policy, catálogo, `product/`, `canon/`, fila, closure anterior ou teste legado foi alterado. R7-D não foi iniciada.

## R7C_PHASE4_STATUS

`CLOSED_NOT_READY`.

O SSCTR devolveu `SEMANTIC_DISPOSITION = NOT_READY` na Etapa F ([registro](reviews/ssctr/SSCTR_SEMANTIC_DISPOSITION_R7C.md), SSCTR-SD-R7C-r1). Pela regra do Founder:
- os quatro testes não foram editados;
- não houve freeze;
- o conflito está registrado abaixo;
- a fase parou.

Nenhuma outra semântica foi improvisada.

## FIXES

Implementados em `src/r6-composition.mjs` e `src/r6-adaptation.mjs`. A disposição do SSCTR alcançou só os três primeiros.

- **P3-02, crédito na semana corrente.** Enquanto as doses de corrida ainda à frente dependem de treino sem relato (`runGapInForce`), nenhuma decisão as mantém, valida ou replaneja (`heldByRunGap`, depois da triagem clínica).
  - Um KEEP ou um replanejamento devolvem a mesma pergunta `UNREPORTED_TRAINING` desta semana, sem proposta.
  - Uma mudança que não planeja dose de corrida conserva a mudança, com a pergunta pendente (`REQUIRES_RECONCILIATION`). Isso vale para mudança só de força, ou para pular e mover sessões na semana com as doses guardadas.
  - A sonda achou e fechou mais dois caminhos que engoliam a pergunta num KEEP: sessão perdida e desempenho isolado.
  - **Não fechado:** SSCTR-SD-01 (em OPEN_FINDINGS).
- **P3-01, taper e race week.** Quando as sessões sem relato da janela decidiriam doses derivadas dos picos executados, a decisão pergunta (`peaksDecide`).
  - Perguntam a ausência total e a lacuna longa.
  - Ficam com a dose da autoridade de evento, sem pergunta e sem colapso:
    - a falta conhecida (entrada revisada);
    - a lacuna curta (picos executados);
    - um fato na janela;
    - a pausa declarada (receita de retorno).
  - A rota clínica vem antes.
- **P3-03, motivo do C15.** O motivo nomeia só fatos estruturados: o que difere, as sessões sem relato nas semanas que a projeção supôs e a pausa declarada (`rebaseReason`).
  - Nos 29 rerotulamentos do corpus B.2, nenhum motivo afirma treino sem relato: 55 são neutros e 3 nomeiam a pausa.

**Testes novos.** `CoachingCore/test/r7c-phase4.test.mjs`, 17 testes. Junto com `r7c-longitudinal`: **33/33**.

## MUTATION

[Saída](probes/out/mutation.R7C-P4-39115ed.json), em cópia isolada; repositório intacto.

- **Os 18 da Fase 3:** 17 mortos.
  - **G02-M4 é equivalente.** O modelo descarta observações acima de `maximumAgeDays` no relógio da decisão (`r6-provenance.mjs:90`, via `updateLearningModel`), então a janela da consulta nunca exclui nada que ele guarde.
  - A testemunha G02-M4b, que tira a expiração inteira, é morta pelo teste de expiração.
- **Mutantes das regras da Fase 4,** relatados à parte: 8/8 mortos.

## SEMANTIC_DISPOSITION

**`NOT_READY`** (SSCTR-SD-R7C-r1, `claude-opus-5-5`, xhigh, independente).

- **Princípio: SIM.** A autoridade longitudinal da V1 deve distinguir falta conhecida de sessão sem relato. Base: AEOS §15, AEC §1.2, §2.1 e §4, e DR-118.
- **`KEEP_R12_UNREPORTED_AS_MISSED`:** rejeitado no mérito.
- **NOT_READY** por um bloqueio do mecanismo, SSCTR-SD-01.
- **Fronteiras:**
  - B1 aceitável;
  - B2 resíduo aceitável;
  - B3 aceitável com a condição C5;
  - B4 correto;
  - B5 aceitável com as condições C2 e C3.

## LEGACY_TEST_DISPOSITION

**Não editados** (QRE-R6-04, D18, SSCTR F3/R6-H25, §19): o SSCTR não os autorizou em `39115ed`.

Para a próxima disposição:
- **C6:** cada fixture se divide em UNREPORTED, KNOWN_MISS e ANSWERED_KNOWN_STOP.
- **SD-06:** um quinto fixture, `test/r6-adaptation.test.mjs:140`, alterado na Fase 2, ainda não foi ratificado.

## FULL_SUITE

[Registro](probes/out/full-suite.R7C-P4-f6c688c.json), `CoachingCore` idêntico a `39115ed`.

**832 testes, 828 passam, 4 falham.** As falhas são só os quatro legados, não editados. O SSCTR reproduziu o mesmo número. Na Fase 3 eram 815/811/4.

## ADVERSARIAL

- **G01** ([saída](probes/out/adversarial-g01.R7C-P4-39115ed.json)):
  - grade A, 148 células: 76 retêm como falta revisada, 40 perguntam, 32 independentes, 0 violações;
  - grade B, os tipos de decisão do P3-02 com EXEC/MISS/UNKNOWN estrito: 46/46 perguntam;
  - P1: 165 perguntas, 0 falhas;
  - vizinhos N1–N4 e N9 OK.
  - **Lacuna das grades:** elas não cobriram a resposta no meio da semana com parada conhecida. É o SD-01.
- **G02:** PASS, idêntico à Fase 3 ([saída](probes/out/adversarial-g02.R7C-P4-39115ed.json)). O SSCTR o confirmou dentro do envelope.

**Regressão em `39115ed`**, idêntica à Fase 3 salvo o declarado:
- **Clínico:** K6 1/1, K6b 1/1, inventário 3/3, adversarial herdado 3.228/0, varredura de 389 decisões sem mudança.
- **Diferencial contra R7B2-FREEZE-1:** nenhuma prescrição difere; só o texto dos motivos C15.
- **Conformance:** 301/7/1 PASS.
- **Sondas R7-A:** 0 diferenças.
- **Holdout:** H19 S1 e H17 S1 agora perguntam, porque o corpus não traz fatos das semanas anteriores; H22 S1 conserva a mudança com a pergunta pendente.

## FREEZE

Não criado: a regra do Founder para NOT_READY na Etapa F. `R7C-FREEZE-1` não existe.

## SSCTR_GATE

- **Disposição semântica:** NOT_READY.
- **Recheck final:** `NOT_RUN`, porque não há freeze.

## ENGINEERING_GATE

`NOT_RUN`: não há freeze.

## CORRECTION_CYCLE

`NOT_USED`. O ciclo autorizado vale só para bloqueios do recheck final do SSCTR ou da Engineering sobre o freeze. Para NOT_READY na Etapa F, a regra é STOP.

## CLOSED_FINDINGS

Nenhum foi fechado formalmente, porque não houve gate de freeze. Verificados por evidência nesta fase:
- P3-01;
- P3-03;
- P3-05 (três sobreviventes mortos, o quarto com equivalência provada);
- os sub-caminhos de P3-02 enquanto a pergunta está aberta, inclusive sessão perdida e desempenho.

D1 e G02 foram dispostos pelo SSCTR (abaixo).

## OPEN_FINDINGS

1. **SSCTR-SD-01. BLOQUEANTE, relevante para segurança, do mecanismo da R7-C.**
   - **O defeito.** A pergunta é respondida antes da próxima revisão semanal com uma parada conhecida: todas as corridas da lacuna relatadas como não feitas. A decisão então mantém e valida a projeção guardada no resto da semana.
   - **Reprodução independente** ([sonda](probes/phase4-verify-sd01.mjs), [saída](probes/out/verify-sd01.R7C-P4-f6c688c.json)): KEEP VALID com QUALITY 34 / LONG 60 à frente na semana 7. As mesmas faltas relatadas no prazo dão EASY 15 / LONG 15.
   - **Causa.** A semana corrente só é replanejada em correções ou retratações. A resposta tira o desconhecido, e a guarda sai de cena.
   - **Correção mínima do SSCTR.** Só runtime, sem policy: quando os fatos de uma decisão tornam a janela conhecida, planejar pelos fatos as doses de corrida ainda à frente na semana, antes de qualquer decisão mantê-las, validá-las ou reduzi-las. Testes dirigidos: a grade SD7, o fixture `r7c-phase4:85` afirmando a semana da resposta, respostas mistas e um mutante.
2. **SSCTR-SD-02, lacuna de teste.** O teste de resposta tardia não confere a semana da resposta.
3. **SSCTR-SD-03, não bloqueante (G03/Engineering).** Um sinal de fadiga enviado com a pergunta se perde se a resposta vier por uma revisão simples.
4. **Condições para uma aceitação futura:**
   - **C1:** corrigir o SD-01 e reapresentar a disposição;
   - **C2:** O1 vinculante: com a pergunta pendente, nenhum consumidor mostra as doses guardadas como prescrição;
   - **C3:** G03 resolve a resposta com pouca fricção, consulta o HealthKit antes de perguntar e reavalia o sinal do evento pendente;
   - **C4:** o rótulo MISSED nunca aparece como "não feito";
   - **C5:** substituição não clínica só de força, não bloqueante;
   - **C6:** o desmembramento dos fixtures (acima);
   - **C7:** divulgar D1, B2, a observação B1 e o quinto fixture.
5. **Anteriores à R7-C (UNRELATED_PREEXISTING):**
   - uma SCHEDULE_CHANGE na última semana do programa dá HOLD por exceção dentro do handler, igual no B.2;
   - sessão perdida e desempenho ainda transformam em KEEP outras perguntas da revisão de portão, como no B.2.
6. **Observações mantidas:**
   - HISTORY = STALE_PROJECTION: só mudou a semana da pergunta na mudança de agenda, que agora é a desta semana;
   - O1–O4 da Fase 3.

## D1_DISPOSITION

**`ACCEPTABLE_RESIDUAL`** (SSCTR).
- Anterior à R7-C: H19 S2 a S4 são idênticos ao B.2, e S4 continua KEEP.
- A rota clínica está intacta.
- Uma regra de redução dentro do ciclo seria policy nova, com o SSCTR e a Product Constitution & Governance; o SSCTR se absteve sobre ela.
- Divulgar na closure da R7-C.

## V1_COACHING_AUTHORITY_READY

`NO`.

## GIT

- Branch `claude/domain-coaching-r7-c`, worktree `.claude/worktrees/domain-coaching-r7-c`.
- Commit local de fechamento sobre `f6c688c`; o SHA está no `git log` da branch.
- Sem push e sem merge.

## NEXT

Uma fase estreita seguinte precisa de autorização própria do Founder, com o SD-01 primeiro:
1. a correção mínima do SSCTR e os testes dirigidos;
2. a reapresentação da disposição semântica ao SSCTR;
3. só se aceita: o desmembramento C6 dos testes legados, inclusive o quinto, a suíte completa, `R7C-FREEZE-1` e os gates SSCTR e Engineering.

R7-D não foi iniciada.
