# R7-D · Fase 3 — checkpoint (2026-11-02)

**Autoridade.** Pedido direto do Founder (R7-D · FASE 3), resumido em `phase3/AUTHORIZATION_PHASE3.md`, não salvo verbatim.

**Roteamento:** T3 · R3 · L3.
- **Coordenador e worker de engenharia:** esta instância. Não dá nota.
- **F03-B (decisão de policy):** SSCTR, claude-opus-5-5 / xhigh, e PCG, claude-opus-5-5 / high, em paralelo.
- **Juízes frescos:** recheck SSCTR (outra instância, condição C8) e checagem de engenharia (quality-reliability-engineer), ambos claude-opus-5-5 / xhigh.
- **Dispensados:** Security (nenhuma fronteira de confiança muda; o consentimento vai para Security como condição) e Research.
- O helper Python do roteamento não existe nesta máquina: aplicou-se a matriz à mão.

## R7D_PHASE3_STATUS

**`READY_FOR_FINAL_HOLDOUT`.**
- DX-01, DX-02, F03 e F04 fechados.
- Lacunas do harness corrigidas.
- Testes dirigidos, mutantes e suíte verdes.
- Regressões sem bloqueio atribuível às correções.
- Recheck SSCTR e checagem de engenharia sem bloqueio.
- Freeze `R7D-FREEZE-1` criado.
- Holdout final inexistente.

**Antes de comissionar a Fase 4, ver EXACT_NEXT:** decisão do Founder sobre QE-R7D-P3-01 e itens pendentes da fila.

## BASELINE

- **Branch:** `claude/domain-coaching-r7-d`, worktree `.claude/worktrees/domain-coaching-r7-d`, a partir de `cdff248`.
- **Runtime de partida:** R7C-FREEZE-4 (`a9654c8`, registro `bf99c01b…`), não editado.
- **Intocados**, conferidos pelo freeze e pelo verificador:
  - policy (`a75be1aa…`, hash canônico `18ec48f3…`, os 10 limites R6 ativos);
  - catálogo (`ceee276a…`), registros B0 e R6;
  - fila (230);
  - `product/`, `canon/`;
  - o corpus diagnóstico, seus manifestos, sua avaliação e o PREREG-1.
- `CURRENT_MISSION.md` e `MISSION_LEDGER.md` só recebem acréscimo.

## DX01

- **Antes:** um relato com precisão de dia, com `reportedAt` no mesmo dia, era aceito e caía do registro na decisão seguinte (`REPORT_BEFORE_OBSERVATION`). Um adverso perdido trocava REGRESS por HOLD.
- **Causa:** `normalizeObservations` relia a linha carregada como horário EXATO, porque o instante sintético do fim do dia estava guardado em `observedAt`.
- **Correção** (`r6-provenance.mjs`): uma linha carregada com `timePrecision: 'DAY'` mantém o instante e o dia local com que foi aceita. Todas as triagens continuam a valer para ela, inclusive relato antes do fato (comparação por data local).
- **Testes:** 5 dirigidos.
  - Mesmo dia aceito e mantido em 3 decisões, com fatos e `firstRecordedAt` iguais.
  - Carregar é igual a reenviar.
  - Dois adversos dão REGRESS.
  - Dia seguinte, sem horário, horário exato e relato antes do fato ainda recusado (novo ou carregado).
  - Correção, reenvio exato e duplicata de segundo aparelho.
- **Resultado:** FECHADO. O P10 e o RESEND do diagnóstico dão 0 violação. A checagem de engenharia confirmou em UTC, UTC-5 e UTC+9.

## DX02

- **Antes:** uma pausa declarada numa WEEKLY_REVIEW sem pergunta pendente era ignorada. A decisão saía VALID com a dose antiga (D18 a6: longo 70; testemunha: 45/60), contra a reentrada de 15/20 pelo relato de retorno.
- **Causa:** só o handler RETURN_AFTER_PAUSE lia `interruption`. Nos outros tipos o campo era ignorado, sem pergunta.
- **Correção** (`r6-adaptation.mjs`):
  - A WEEKLY_REVIEW que declara pausa é decidida como o relato de retorno: mesmo handler, triagem clínica, identidade de episódio e reentrada. Nenhum protocolo novo.
  - Outro tipo de evento que declara pausa passa pela triagem clínica e depois pergunta (`interruption.reportedOnItsOwn`), sem aplicar a própria mudança nem o retorno.
  - Ordem: clínico → estado factual → retorno → adaptação.
- **Testes:** 6 dirigidos.
  - Equivalência byte a byte entre os portadores: semanas, estados de início e registro.
  - Nenhuma dose antiga e nenhuma qualidade na reentrada.
  - Pausa em curso perguntada.
  - Clínico primeiro em 4 tipos (flag e razão).
  - Outro evento pergunta.
  - Resposta à pergunta por revisão semanal.
- **Resultado:** FECHADO. D18 a6 reentra com longo 20. A SSCTR não achou bloqueio para pausas de 3 a 60 dias. A engenharia confirmou nos 19 tipos de evento.
- **Residual:** QE-R7D-P3-01 (ver REMAINING_NONBLOCKING).

## F03

- **Ida e volta (F03-A, `r6-prescription.mjs`):** a linha de máquina declara KG, a unidade do seu valor. `STACK_STEP` fica só como unidade do passo. O log escrito como prescrito é lido, registrado e consumido.
- **Decisão de policy (F03-B):**
  - SSCTR-R7D-F03B-r1 (`5eda3d81…`) escolheu B′ (`F03B-MACHINE-STEP-r1`, APPROVE_WITH_CONDITIONS C1–C9, SUPPORTED_WITH_LIMITS).
  - PCG-R7D-F03B-r1 (`5e25b158…`) decidiu a forma de autoridade: interpretação **I-1**, em que o incremento MACHINE_STACK é uma regulagem daquela máquina e nunca um quilo. Delta estreito admissível, **sem mudar bytes da policy nem do catálogo**, vinculado pelo freeze.
  - A opção C (incremento declarado) foi recusada nesta fase.
- **Implementação:**
  - **Nenhuma carga de máquina é computada:** `incrementFor(MACHINE_STACK)=0` em kg.
  - **Passo devido:** uma linha sem número (`load.nextSetting:{aboveKg,fallbackReps}`), "próxima regulagem acima de R".
  - **Regulagem mais pesada:** adotada só com ADVANCE mais verificação D45 (confirmação, ou o mesmo valor noutra exposição) e nunca acima de um teto. Até lá fica pendente, com uma pergunta, e nunca é declarada.
  - **R na reserva:** segura a dose anterior ao passo.
  - **REGRESS:** volta à regulagem adotada antes, ou baixa repetições.
  - **Modo LOAD:** coberto.
- **Resultado:** FECHADO.
  - A varredura em 5 objetivos × 4 comportamentos não mostrou nenhum valor de máquina não fornecido.
  - O atleta cuja máquina permite sobe pelas placas reais (140→150→160; 50→55→60→65). O que não cabe segura sem oscilar.
  - P16 diagnóstico com 790 unidades e 0 violação.

## F04

- **Causa:** `kindOf` devolvia CONFOUNDED antes de classificar, apagando recuperação ADVERSE e dia seguinte IMPAIRED. O longo avançava.
- **Correção** (`r6-adaptation.mjs`): com `confounded`, recuperação ADVERSE ou dia seguinte IMPAIRED → ADVERSE. Fora disso, CONFOUNDED: desempenho e esforço ilegíveis.
- **Matriz:** 16 células (confounded × desempenho × recuperação × dia seguinte).
  - HOLD exatamente quando há recuperação adversa, dia seguinte prejudicado ou UNDER sem confounded.
  - Nenhum avanço do longo depois de confounded adverso.
  - Dois confounded adversos em 14 dias dão REGRESS, como os sem confounded.
  - Força confounded com dia seguinte prejudicado segura.
- **Resultado:** FECHADO. No R7C-FREEZE-4 as 16 células confounded ficavam mascaradas (SSCTR, 32 células).

## HARNESS_REVISION

**`R7D-HARNESS-2`.** O R7D-HARNESS-1 (`8eec795`) fica como registro da Fase 2.

| Lacuna | Correção |
|---|---|
| HG-01 consentimento | O cliente carrega o consentimento atual em toda decisão |
| HG-02 prova | P07 segue a data adotada no plano; e (CF-5 da engenharia) acusa data de prova mudada sem pedido |
| HG-03 confounded | P09 separa desempenho e esforço de recuperação e dia seguinte |
| HG-04 expectativas | Semana do passo a partir da data do passo; papel ausente = 0 |
| HG-05 / P08 | Qualquer portador e qualquer decisão que registre retorno; tolerada = sem recuperação adversa e sem dia seguinte prejudicado |
| HG-06 carga | Confirmação com o kg devolvido e a convenção da linha |
| HG-07 | Intervalos de walk/jog exibidos e comparados |
| F03 | **P16 novo** (ida e volta; nenhum valor de máquina fabricado, em todo plano e na reserva da próxima regulagem) |
| CF-04 SSCTR | O pacote exibe a linha de próxima regulagem |

**Validação 2** (`harness/validation/HARNESS_VALIDATION_R7D_2.json`, 19 casos dev contaminados):
- sem falso bloqueio no candidato;
- sensibilidade 7/7: DX-01, DX-02, F03 e F04 detectados no R7C-FREEZE-4; QE-R7C-10, R7C-G01 e D54 nos seus runtimes; todos limpos no candidato;
- **cobertura P05:** CARRIER_CLINICAL 7, CARRIER_HOLD 1, RESEND 16;
- 33/33 testemunhas.

## PREREG_REVISION

**`R7D-PREREG-2`** (`PREREGISTRATION_R7D_2.md`, `b33a2302…`), registrado antes de existir o holdout. O PREREG-1 está intacto.

Delta Δ1–Δ12: P08 por qualquer portador; P09 confounded; P07; consentimento como CONSUMER_CONDITION; **P16**; cobertura crítica nova (§7, INVALID_HOLDOUT se faltar); rubrica (roteamento clínico julgado, classe por passo, premissa das VARIANT); envelopes F03-B; sensibilidade.

Nenhum critério de sucesso afrouxado:
- o Δ2 está rotulado **misto** (a semântica confounded do Founder);
- a sugestão "defeito só em testemunha = TEST_GAP" **não** foi adotada.

QE-R7D-P3-01 fica divulgado **sem envelope**.

Também registrados:
- `author/INTERFACE_DELTA_R7D_2.md` (R7D-INTERFACE-2);
- `author/AUTHOR_BRIEF_FINAL_R7D.md`, que exige as 7 coberturas do Founder. Não contém casos nem seed.

## DIRECTED_TESTS

`CoachingCore/test/r7d-phase3.test.mjs`: **23/23**.

| Grupo | Testes |
|---|---|
| DX-01 | 5 |
| DX-02 | 6 |
| F03-A | 1 |
| F03-B | 7 (T2 a T11) |
| F04 | 4 |

No R7C-FREEZE-4, 22 de 23 falham pela razão certa. O T9 passa nos dois: é caracterização (engenharia).

## MUTATION

`phase3/evidence/MUTATION_PHASE3.json`: **6/6 mortos, cada um pela sua testemunha**: DX01-M1, DX02-M1, F03-M1, F03-M2 (+1 kg computado), F03-M3 (adoção sem verificação), F04-M1.

Ressalvas:
- Uma testemunha com parênteses no padrão não selecionava teste nenhum. Foi corrigida, e o harness de mutação agora recusa padrão vazio.
- Dos 24 mutantes próprios da engenharia, **7 sobrevivem** à suíte inteira: QM10, 16, 18, 19, 21, 23 e 24. Ficam registrados como TEST_GAP (CF-4).

## FULL_SUITE

**907/907** no freeze: os 884 congelados mais os 23 dirigidos. Nenhum teste existente mudou. Conformance R7-B, R7-B.1 e R7-B.2: PASS.

## DIAGNOSTIC_REGRESSION

Só regressão: o corpus não é evidência nova (`phase3/regression/diagnostic/`).
- **Propriedades:** P01–P16 PASS, 0 violação (P10 11.103 unidades, P16 790, P08 5).
- **Relações:** 0 violação.
- **VARIANT:** 4 falhas, as mesmas já triadas na Fase 2 (D02, D06 e D16 por premissa; D14 por F11).
- **CORPUS_ERROR:** 1 (CE-01).
- **Diferencial contra o R7C-FREEZE-4**, 137 casos: 128 iguais e 9 diferentes, todos atribuídos às quatro correções; 0 inexplicado. A engenharia confirmou passo a passo.

## GENERATED_REGRESSION

100 intakes, só regressão: 0 violação. Determinismo 100/100, RENAME e CALENDAR 79, convenção de carga 7.

## CLINICAL_REGRESSION

- Os testes de precedência clínica da suíte passam.
- Dirigido: o clínico vem primeiro em todos os portadores.
- Diagnóstico: P01 15/0, P02 10/0.
- Engenharia: razão clínica roteia nos 19 tipos de evento.
- Nenhuma regressão.

## ENGINEERING_CHECK

**`R7D-ENGINEERING-PHASE3-CHECK-1`** (`ba6dbe21…`): **READY_WITH_CONDITIONS**, sem bloqueio.

Reproduziu de forma independente:
- 907/907;
- validação, regressões e diferencial idênticos;
- mutação 6/6.

| Classe | Achados |
|---|---|
| **MAJOR** | QE-R7D-P3-01 |
| MINOR | P3-02 (sobreviventes), P3-03, P3-04, P3-08 (backlog de engenharia), P3-05/06/07 (corrigidos antes do freeze: P16, P07, rótulo Δ2) |
| OBSERVATION | P3-09 a P3-14 |

Condições CF-1–CF-7: atendidas, ou registradas no freeze e abertas.

## SSCTR_RECHECK

**`SSCTR-R7D-P3-RECHECK-r1`** (`b8fd92f8…`, instância nova): **ACCEPT_WITH_CONDITIONS**, sem bloqueio em DX-02, F03-B e F04.
- Nenhuma autoridade prescritiva nova: nenhum número.
- Os comportamentos 3 e 4 do F03-B são leituras aceitáveis.
- Os comportamentos 1, 2 e 5 são residuais divulgados.

Condições:
- CF-01 a CF-06: no freeze;
- CF-04: feito;
- **CF-07: pendente** (itens da fila).

## NEW_RUNTIME_FREEZE

**`R7D-FREEZE-1`**:
- **Registro:** `CoachingCore/r7/d/RUNTIME_FREEZE_R7D_1.json`, sha256 `51dc4c71…`, commit do registro `6c03ca8`.
- **Bytes congelados:** commit `4cabd18`.
- **Fonte:** `d2afeb8d…1e64`. **Manifesto:** `b2b99cd0…f568`. 254 arquivos, 907/907.
- **Predecessor:** R7C-FREEZE-4, não editado. Seu verificador agora falha `files-current` de propósito.
- **Delta:** 6 arquivos de fonte e 1 teste novo.

**O registro vincula:**
- a evidência (`bb46c1ef…`, PASS);
- a decisão F03-B (SSCTR, PCG, I-1);
- as duas revisões e o que mudou depois do candidato (só harness, docs, probes e scripts; nenhum byte de fonte);
- os instrumentos da Fase 4 (HARNESS-2, PREREG-2, INTERFACE-2, brief final);
- divulgações, lacunas, encaminhamentos e condições abertas.

**Verificador** (só leitura; `--write` grava só `CoachingCore/r7/d/VERIFICATION_R7D_1.json`), **25/25 PASS**:
```
node CoachingCore/scripts/verify-r7d.mjs --suite
```

## FINAL_HOLDOUT_EXISTS

`NO`

## V1_COACHING_AUTHORITY_READY

`NO`

## REMAINING_NONBLOCKING

**QE-R7D-P3-01 (MAJOR, não bloqueante, PRE_EXISTING em substância, sem envelope).** Uma pausa declarada só fica retida pela decisão que a aplica.
- **(a)** Outro tipo de evento pergunta; uma revisão simples depois, sem a pausa, sai VALID com o plano antigo.
- **(b)** Pausa mais flag clínica, liberação e revisão simples: VALID com o plano antigo (longos de 70 e 75 contra 65 executados). É a família F08, cujo rótulo foi corrigido.
- **(c)** P3-F01: a resposta-pausa por rota clínica não é retida e pergunta de novo, em falha fechada.

Nenhum caminho fica pior que no FREEZE-4.
- **(c):** viola P05 se o holdout o exercitar.
- **(a) e (b):** nenhuma propriedade automática os mede (TEST_GAP declarado).
- **Condições G03:** pausa declarada uma vez; quando perguntada, vai sozinha; declarada de novo depois de liberação; nada de objeto de modelo.

**Outros:**
- **Pergunta de interpretação ao Founder** (SSCTR CF-05): nos outros tipos de evento, "factual independentemente do portador" foi implementado como triagem clínica mais pergunta, sem reter a pausa.
- **Resíduos F03-B:** R-01–R-10 (R-09 reescrito: concordâncias de máquina só por igualdade). Também:
  - O-1: verificação perdida numa semana KEEP incompleta;
  - O-2: um log em R é julgado pelas repetições do passo.
- **Resíduos DX-02** (R-DX02-2/3): reenviar uma pausa já aplicada reancora a reentrada; uma declaração tardia descarta tolerância demonstrada. Também O-6 (objeto só com nulos) e O-7.
- **Fila (SSCTR CF-07, pendente):** itens PROPOSED `HQ-R7D-SSCTR-F03B` e `HQ-R7D-SSCTR-P3-RECHECK`, nos registros. A fila (230) não muda nesta fase; o dono autorizado os acrescenta nomeando o R7D-FREEZE-1.
- **PCG:** entrada proposta para `canon/CANONICAL_INDEX.md` (I-1), só num canon sync autorizado. PCG-F03B-Q01 (passo declarado pelo equipamento) vai para Product/Data.
- **Security:** aceitar a condição de consumidor do consentimento (QE-R7D-P3-11).
- **Herdados, não absorvidos:** QE-R7C-08/12/13/15/16/18, F05–F13, HV-01.

## EXACT_NEXT

`R7-D Phase 4 — independent sealed fresh holdout + final gates`, com autorização própria do Founder.

**Antes de comissionar o autor:**
1. Decisão do Founder sobre QE-R7D-P3-01: corrigir, criar oráculo, criar envelope (PREREG-3 antes do holdout) ou aceitar a medição como registrada. O brief final provavelmente o exercita.
2. A pergunta de interpretação da SSCTR (CF-05).
3. O acréscimo dos itens da fila (CF-07) pelo dono autorizado.

**Então:**
- autor novo com o brief final e a INTERFACE-2;
- seed H2 = `sha256('R7D-SAMPLE|FINAL|' + b2b99cd0…f568)`;
- selo, avaliação única e juízes QRE e SSCTR em paralelo.

**STOP.**

## GIT_STATE

**Branch:** `claude/domain-coaching-r7-d`, sobre `cdff248`:

| Commit | Conteúdo |
|---|---|
| `9e1ecbf` | Runtime candidato e testes dirigidos (com a decisão F03-B e as probes) |
| `7039bc1` | HARNESS-2, PREREG-2, interface, brief e evidência |
| `7a5ca40` | Pedido de revisão |
| `d4725e6` | Resumo da autorização; scripts de freeze e verificação |
| `f283a47` | Registros das duas revisões |
| `4cabd18` | Condições pós-revisão (bytes congelados) |
| `6c03ca8` | Registro R7D-FREEZE-1 e verificação 25/25 |

Mais o commit deste checkpoint, com os acréscimos de missão e ledger.

**Sem push e sem merge.** O checkout principal e os outros worktrees estão intocados. `CoachingCore/node_modules` foi copiado do worktree R7-C (mesmo lockfile) e é ignorado pelo git.
