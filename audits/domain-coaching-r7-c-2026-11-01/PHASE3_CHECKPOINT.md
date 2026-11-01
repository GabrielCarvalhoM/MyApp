# R7-C · Fase 3 — checkpoint (2026-11-01)

Autoridade: pedido direto do Founder de 2026-11-01 para a Fase 3 (prova e fechamento). Base: `claude/domain-coaching-r7-c` em `f69abc1`, a Fase 2. Nenhum runtime, teste, policy, catálogo, fila, `product/` ou `canon/` foi alterado. As sondas e saídas estão em [`probes/`](probes/) e [`probes/out/`](probes/out/); são instrumentos de engenharia, não gate.

## R7C_PHASE3_STATUS

`CLOSED_NOT_READY`.

Os checks anteriores ao freeze não ficaram limpos:
- a suíte completa tem 4 falhas, classificadas, mas não dispostas;
- o adversarial achou dois blockers de G01, um deles safety-relevant e introduzido pela R7-C;
- a mutação deixou 4 sobreviventes.

Por isso não houve freeze e as reviews SSCTR e Engineering não rodaram (passos 9 a 11). Nenhuma solução foi inventada nesta fase.

## FULL_SUITE

[Registro](probes/out/full-suite.R7C-P3-f69abc1.json).

- **R7-C (`f69abc1`):** 815 testes, 811 passaram, **4 falharam**, 73,9 s.
- **Baseline R7B2-FREEZE-1, mesma máquina:** 799/799.
- **Ambiente:** a primeira rodada falhou o carregamento de 8 arquivos (`ERR_MODULE_NOT_FOUND ajv`), porque o worktree não tinha `node_modules`. Classificação: UNRELATED_PREEXISTING (ambiente), sem resultado de teste. O `node_modules` foi copiado do worktree B.2, com `package.json` e `package-lock.json` byte-idênticos (ajv 8.20.0, ignorado pelo git), e a suíte rodou de novo.

As 4 falhas são todas **EXPECTED_SEMANTIC_UPDATE**, com uma causa única: o fixture modela "perdida" como sessão sem relato nenhum, e a R7-C lê isso como desconhecido (ASK), não como zero. Em cada uma, o invariante próprio do teste se reproduz bit a bit, igual ao B.2, quando as mesmas faltas são conhecidas (relatadas como não feitas) — ver [dispositions](probes/out/suite-dispositions.R7C-P3-f69abc1.json):

| Teste | Sem relato (R7-C) | Faltas conhecidas (R7-C = B.2) |
|---|---|---|
| QRE-R6-04 (`r6-engineering-fixes:94`) | ASK desde a semana 4; o plano guardado mantém qualidade projetada sob `REQUIRES_RECONCILIATION` | sem qualidade nem strides; `easyWeeksDone` 0 |
| D18 (`r6-ssctr-revision:51`) | ASK tipado, sem proposta, inclusive com reviews vazios | semana 7 inteira na entrada (15) |
| SSCTR F3 / R6-H25 (`r7asc-state-consumer:232`) | o S2 pergunta | 30 linhas dentro do MAINTAIN, nunca acima de 70 |
| §19 (`r7b-hybrid-program:85`) | a semana 4 pergunta; sem block review | o block review retém long, easy e qualityStep |

Os testes não foram alterados. A R7-C muda a leitura que o SSCTR r12 aprovou ("with unreported sessions reviewed as missed") e o D18 para janelas sem relato. Dispor esses testes exige confirmação do SSCTR. Nenhuma closure anterior foi atualizada.

## HOLDOUT

Reuso do corpus selado, com o adaptador selado; não é evidência nova. Ver [holdout](probes/out/holdout.R7C-P3-f69abc1.json) e [expiry](probes/out/holdout-expiry.R7C-P3-f69abc1.json).

- **Idênticos entre B.2 e R7-C:** H34, H20, H19 e H17. H34 e H20 dão o mesmo resultado com consentimento ligado e desligado; nenhuma decisão aprendida aparece no corpus.
- **H22:** muda como declarado.
  - S2: o longão movido e executado fica ADVANCE, não HOLD (D2).
  - S4: relabel C15.
  - Consequência: +5 min no longão a partir do executado.
- **UNSUPPORTED_BY_EXISTING_EXPIRY:** H35, H21 e H23. Os 13 registros SSCTR da B0 vencem em `review_by` 2027-04-30, e os casos são de maio a outubro de 2027.
  - Nos dois runtimes o comportamento é idêntico.
  - Com um contrafactual de `review_by` estendido, os três passam a ser suportados e continuam idênticos entre os runtimes (H35 até o S1, porque depois o corpus não resolve uma sessão).
  - Não é falha da R7-C.

## DIFERENCIAL B.2 / CLÍNICO

Reuso das ferramentas da B.2 contra R7B2-FREEZE-1, só leitura.

- **Clínico:** K6 1/1, K6b 1/1 e inventário 3/3, idênticos ao B.2 a menos do rótulo.
  - Copiados verbatim para [`probes/b2-copy/`](probes/b2-copy/) (sha iguais), porque o original escreve na pasta da missão fechada.
  - Neighbors 32/32 com o resultado esperado. As 14 "falhas" do script são só o predicado `TO_CLINICAL`, que é FREEZE-2→B.2; contra o B.2 a relação é `SAME`.
- **Adversarial herdado da R7-B.1:** 3.228 checks, 0 falhas. A única diferença é `r18PathWeekUnreviewed.week2Capped` passar de false a true, o fix declarado do R2-05.
- **Timeline differential:** 151 timelines e 1.626 passos.
  - Nenhuma prescrição difere.
  - Sem mudança: grid de substituição (184), varredura clínica (389), estado de referência carregado, envelope e run rises.
  - Diferenças: 29 decisões relabeladas pelo C15 e 29 hashes de programa a jusante, que só mudam no registro da decisão.
- **Preservados:** clinical-first, QE-R7B1-04, CAND-01/02, hold clínico e estado clínico pendente.

## CONFORMANCE

- **R7-B:** PASS, 301 entradas, as mesmas contagens do B.2. Delta B.1: PASS (7). Delta B.2: PASS (1).
- **R7-A, sondas de classe** (cópia de scratch): todas as seções são idênticas ao B.2, menos a C15.
  - A C15 muda como declarado: o review vira MODIFY, não mais KEEP/instanciação, e a mudança de agenda vira ASK, não mais colapso.
  - O `reproduced:true` da C15 é um literal fixo da sonda, não um predicado.
- **Testes R7-A:** passam todos na suíte (r7a, r7ab, r7ada, r7af, r7ara, r7ase, r7asm).

## ADVERSARIAL

**G01** ([saída](probes/out/adversarial-g01.R7C-P3-f69abc1.json)): 148 casos com a propriedade metamórfica EXEC/MISS/UNREP.
- 84 retêm como uma falta revisada (r12);
- 22 perguntam corretamente;
- 30 têm dose independente da lacuna;
- **12 violações.**

P1: as 85 perguntas levantadas estão bem tipadas. Vizinhos:
- N1, uma corrida relatada no meio da lacuna: OK;
- N2, a resposta tardia: KEEP, história intacta;
- N3 e N4, pausa sobreposta e pausa corrigida: OK por uma corrida conhecida na janela;
- N9, clínico antes do ASK: OK em 6 tipos de decisão.

**G02** ([saída](probes/out/adversarial-g02.R7C-P3-f69abc1.json)): **PASS**. As propriedades L1–L7 valem em 16 variantes, e o determinismo vale com e sem modelo carregado. As variantes:
- 1 evento ou 2 adversos não bastam; 2 ciclos aprendem;
- MIXED não aprende;
- dose adversa no alvo: segura no executado;
- consentimento desligado, revogação e re-consentimento;
- duplicatas;
- pool igual aprende, pool novo não;
- semanas de evento;
- longão liberado e não relatado.

## MUTATION

[Saída](probes/out/mutation.R7C-P3-f69abc1.json). A mutação rodou em cópia isolada (git archive); o repositório ficou intacto e a baseline das cópias passou.

**18 mutantes, 14 mortos, 4 sobreviventes.** Os sobreviventes são alcançáveis, não equivalentes, e são lacunas de teste:

| Mutante | O que o mutante faz |
|---|---|
| G01-M5 | a pergunta atravessa uma pausa declarada; nenhum teste tem "sem corrida conhecida na janela, só sessões dentro da pausa" |
| G02-M3 | MIXED basta |
| G02-M4 | ignora a expiração |
| G02-M8 | ignora o pool de arranjo |

Mortos: crédito, zero ou remoção do ASK, proposta junto do ASK, inversão do clinical-first, evidência tardia reescrevendo a semana, rótulo C15, cap R2-05, not-done, movedTo, consentimento/revogação, 1 evento, dose nova, semanas de evento/retorno, autoridade causal.

## HISTORY_FINDING

**STALE_PROJECTION**, não autoritativo: registrar e manter. Ver [saída](probes/out/history-finding.R7C-P3-f69abc1.json).
- `historicalStateOf(...).state.run.long` vale 70 em semana nunca revisada e 65 em semana revisada vazia. É o estado do redutor, uma liberação mantida; os fatos (`run.mode`, `achieved`, `longestContinuous`) coincidem.
- Com fatos idênticos, as decisões são idênticas em todo caminho que planeja desse estado: ASK semanal, resposta "não feito", retornos LONG/MODERATE/SHORT, agenda, substituição, objetivo e reviews da semana 7 com os mesmos fatos (só EASY; EASY e LONG). O valor nunca chega a uma decisão: o ASK ou o teto de corrida isolada o mascara.
- As decisões que diferem diferem porque os planos guardados diferem. Isso é o R7C-P3-02, não este campo.

## D1_DISPOSITION

**RESIDUAL, não bloqueante para a R7-C como escopada.** A classificação formal do SSCTR fica pendente, porque o SSCTR não rodou.
- **Achado:** no H19 a terceira sessão-chave adversa no meio da semana não muda nada de imediato. É anterior à R7-C: H19 é idêntico entre B.2 e R7-C.
- **Exclusão:** o Founder excluiu D1 das Fases 2 e 3.
- **Sinal clínico:** continua indo para CLINICAL_HUMAN_REQUIRED.
- **Donos:** SSCTR, da regra de redução dentro do ciclo, sob envelope; Product/UX, do check-in proativo.

## FREEZE

Não criado: o pré-requisito "todos os checks anteriores limpos" falhou. `R7C-FREEZE-1` não existe. Nenhum `--write` foi usado sobre registros fechados.

## SSCTR_GATE

`NOT_RUN`: sem freeze. Ficam para a review do SSCTR:
- a semântica de G01 e a mudança no contrato de weekly review do r12 e no D18;
- G02, com os pontos O3 e O4;
- D1.

## ENGINEERING_GATE

`NOT_RUN`: sem freeze.

## CLOSED_FINDINGS

Nenhum finding foi fechado formalmente, porque não houve gates. Verificados nesta fase, aguardando gate:
- QE-R7B-R2-05 (início do cap);
- D2 (H22, H17);
- D4 (pausa declarada × lacuna);
- o rótulo C15 (com a ressalva P3-03);
- o envelope de G02 (L1–L7).

## OPEN_FINDINGS

Blockers da Fase 4, todos de runtime ou de teste; nenhum muda policy ou catálogo.

1. **R7C-P3-02 — crédito na semana corrente. SAFETY-RELEVANT, introduzido pela R7-C.** Ver [saída](probes/out/current-week-credit.R7C-P3-f69abc1.json).
   - O ASK não propõe nada, e o plano guardado fica com a projeção.
   - Um handler que mantém as doses da semana corrente (SCHEDULE_CHANGE, UNAVAILABLE_DAY, GOAL_CHANGE ou EQUIPMENT_CHANGE no dia 0, ou um review KEEP no meio da semana) devolve uma decisão VALID. Ela prescreve THRESHOLD 41 e LONG 65 depois de 7 semanas sem nenhuma corrida relatada. O B.2 dava 15/15/15.
   - O KEEP limpa o ASK pendente.
   - Viola G01, QRE-R6-04 e o S3 do SSCTR.
2. **R7C-P3-01 — zero na aproximação da prova.**
   - Quando nada foi relatado no programa, TAPER e RACE_WEEK derivam de um `achieved` vazio. O resultado é MODIFY só com EASY 15, sem touch e sem qualidade, e sem pergunta.
   - São 9 de 148 casos: 10K e meia maratona, semanal e mudança de agenda.
   - O `unknownRunWindow` só pergunta quando a entrada corta uma corrida.
3. **R7C-P3-03 — causa falsa no motivo do relabel C15.** Ver [saída](probes/out/relabel-reason.R7C-P3-f69abc1.json).
   - "weeks with no executed evidence" aparece mesmo quando todas as semanas foram executadas (`fatigue-missed`) ou quando só há pausa declarada. São 29 decisões no diferencial.
   - As doses são iguais às do B.2; é proveniência.
4. **R7C-P3-04 — disposição dos 4 testes EXPECTED_SEMANTIC_UPDATE.** Depende da confirmação do SSCTR sobre o contrato r12 e o D18.
5. **R7C-P3-05 — lacunas de teste.** Os 4 sobreviventes da mutação (G01-M5, G02-M3, G02-M4, G02-M8) precisam de testes dirigidos.

Observações não bloqueantes, para os juízes:
- **O1:** enquanto UNREPORTED_TRAINING está pendente, o plano guardado não é atual (uma condição de cliente, como a C4).
- **O2:** o simulador sinaliza `noRepeatedUnnecessaryAsk` para um atleta que não responde. É por desenho; a cadência é do G03.
- **O3:** G02 pode reter abaixo do HOLD populacional quando o longão liberado não foi relatado. Ele retém no último longão executado: coerente com E1, dentro do envelope.
- **O4:** o re-consentimento reconstrói o modelo a partir de todo o ledger, inclusive dos fatos registrados durante a revogação. É comportamento R6 anterior; LEARNING-CONSENT-SCOPE (G07) segue aberto.
- **O5:** HISTORY (acima).
- **O6:** D1 (acima).

## V1_COACHING_AUTHORITY_READY

`NO`.

## DO_NOT_REOPEN

- Unknown is neither success nor failure. A Fase 4 fecha P3-01 e P3-02 sob esse invariante e nunca o relaxa.
- Falta conhecida ≠ desconhecido. Com faltas relatadas, a R7-C reproduz o R7B2-FREEZE-1 bit a bit (os 4 fixtures).
- Clinical-first e as closures da B.2 ficam inalterados na R7-C (K6, K6b, inventário, neighbors, sweep, grid, adversarial 3.228/0).
- R7-B conformance 301/7/1 PASS; seções R7-A idênticas, salvo a C15 declarada.
- Propriedades L1–L7 do G02 e o contrato P1 do ASK tipado.
- H35, H21 e H23 = UNSUPPORTED_BY_EXISTING_EXPIRY.
- Os testes de closures anteriores só mudam com a confirmação do SSCTR.

## GIT

- Branch `claude/domain-coaching-r7-c`, worktree `.claude/worktrees/domain-coaching-r7-c`.
- Commit local desta fase sobre `f69abc1`, sem push e sem merge; o SHA está no `git log` da branch.
- `node_modules` restaurado no worktree, ignorado pelo git.

## NEXT

**Fase 4 (mínima)**, com autorização própria do Founder:
1. Corrigir R7C-P3-02: nenhuma decisão mantém, valida ou desmarca doses de corrida que dependam de semanas sem relato.
2. Corrigir R7C-P3-01: a aproximação da prova pergunta, em vez de derivar de um `achieved` vazio.
3. Corrigir R7C-P3-03: o motivo nomeia a causa real.
4. Adicionar testes dirigidos que matem os 4 sobreviventes e cubram P3-01/02/03.
5. Dispor os 4 testes, com o SSCTR.
6. Suíte completa, `R7C-FREEZE-1` e as primeiras reviews SSCTR e Engineering.

**Decisão do Founder:** como esses gates ainda não rodaram, decidir se a Fase 4 permite um ciclo de correção estreito depois deles. O limite atual prevê só um recheck. R7-D não foi iniciada.
