# R7-D · Fase 2 — checkpoint (2026-11-02)

**Autoridade.** Pedido direto do Founder (R7-D · FASE 2), não salvo verbatim. Ele autoriza:
- interface, harness, pré-registro, um corpus diagnóstico independente e a primeira avaliação diagnóstica com triagem;
- nenhuma correção, nenhum holdout final, nenhum freeze.

**Roteamento:** T2 · L3.
- Autor independente: instância general-purpose nova, claude-opus-5-5 / xhigh.
- Juiz de domínio diagnóstico: SSCTR, claude-opus-5-5 / xhigh.
- Coordenador: também autor do harness; não dá nota.

## R7D_PHASE2_STATUS

**`DIAGNOSTIC_BLOCKED`.**
- O diagnóstico achou bloqueios no runtime. São quatro, todos PRE_EXISTING e nunca divulgados (FINDINGS).
- Dois são lacunas de teste de segurança que bloqueariam um gate final até cobertas.
- A infraestrutura funciona e a rubrica foi validada, com correções sugeridas.

## BASELINE

- **Branch:** `claude/domain-coaching-r7-d`, no worktree `.claude/worktrees/domain-coaching-r7-d`. A fase vai de `c45087a` aos commits listados em GIT_STATE.
- **Runtime:** R7C-FREEZE-4.
  - Commit `a9654c8`; registro `bf99c01b…2fc2`; manifest `61937f87…f6b8`.
  - **197/197 iguais ao registro** em cada execução (o harness confere antes de rodar) e de novo no fim.
- **Intocados:**
  - policy (`a75be1aa…`), catálogo (`ceee276a…`), fila (230, `95ea4b92…`), `product/`, `canon/`;
  - os 884 testes congelados;
  - nada fora de `audits/domain-coaching-r7-d-2026-11-02/`, exceto os blocos de acréscimo em CURRENT_MISSION e MISSION_LEDGER.

## AUTHOR_INTERFACE

Em `author/`, commit `a940266`; o autor leu exatamente estes bytes, os hashes conferem:

| Arquivo | SHA-256 |
|---|---|
| `INTERFACE_ONLY_R7D.md` (R7D-INTERFACE-1) | `728d6496…64ef` |
| `CASE_SCHEMA_R7D.json` (R7D-CASE-1) | `2d5d64be…1940` |
| `AUTHOR_BRIEF_DIAGNOSTIC.md` | `d9f5bc12…9ff2` |
| `check-corpus.mjs` (checador estrutural; o autor só o executa) | `306cd546…e8ed` |

**Revela só o contrato público:**
- escopo V1 e fronteira clínica;
- desconhecido ≠ executado ≠ zero; semanas futuras provisórias;
- janela de datas;
- intake e eventos;
- campos de saída observáveis, incluindo UNREPORTED_TRAINING, planValidity, offers e loadQuestions;
- protocolo do cliente C3 (registro como devolvido; liberação qualificada como nos testes);
- formato de caso, expectativas por propriedade, classes de oráculo e relações.

**Não revela:** implementação, limiares internos (30 dias, +5 min, 14 dias), testes, fixtures, grades, GEN/R10K, holdouts anteriores, achados QE.

O autor registrou 12 lacunas (no manifesto) que vão para a versão final da interface.

## HARNESS

`harness/`, `R7D-HARNESS-1`:
- código em `a940266`; passo de selo em `8eec795`;
- fora de `CoachingCore`, sem arquivo `*.test.*`: `node --test CoachingCore` continua com 884;
- não muda depois da avaliação.

| Peça | O que faz |
|---|---|
| `lib/client.mjs` | Cliente C3: carrega registro e plano **por referência** (uma cópia JSON quebrava o hash do programa), adota propostas, nunca inventa fato |
| `lib/properties.mjs` | P01–P14 |
| `lib/metamorphic.mjs` | 12 relações |
| `lib/expectations.mjs` | Expectativas do autor |
| `lib/report.mjs` | Pacote de domínio |
| `generate-sample.mjs` | Amostra com seed do digest do freeze |
| `seal-corpus.mjs` | Selo |
| `r7d-harness.mjs` | Confere bytes do runtime, manifesto e selo. Exige `evaluationCount 0` para a primeira avaliação, escreve em diretório novo, grava `1` e recusa uma segunda (provado em ensaio) |

**Validação, só com casos dev contaminados (`harness/validation/`):**
- 0 falso bloqueio no FREEZE-4;
- sensibilidade: QE-R7C-10 no R7C-FREEZE-3, R7C-G01 no R7B2-FREEZE-1 e D54 na fonte pré-R7A, cada um detectado e limpo no FREEZE-4;
- 27/27 testemunhas sintéticas disparam;
- **HV-01** (policy autoriza incremento por convenção num par de halteres declarado TOTAL) registrado como POLICY_QUESTION.

## PREREGISTRATION

**Arquivo:** `PREREGISTRATION_R7D.md` (R7D-PREREG-1), sha256 `fefb532a…47c6`, commit `628fb63`, antes de o corpus existir.

**Contém:**
- P01–P14 com tipo, escopo, observável, mecanismo e classe; P15 PROPOSED_ONLY;
- relações; taxonomia;
- os critérios do Founder: zero violação, zero bloqueio, todo caso avaliável BEST_SUPPORTED ou ACCEPTABLE_ALTERNATIVE, SUBOPTIMAL bloqueia só nas quatro condições, sem meta percentual;
- rubrica; envelopes; CORPUS_ERROR e INVALID_HOLDOUT;
- protocolo selado; regra de não-tuning.

**Não contém:** casos finais nem seed final (só a regra).

**Status:** registrado. Precisa da versão 2 antes da Fase 4, com as correções do harness e da rubrica deste diagnóstico (EXACT_NEXT).

## DIAGNOSTIC_MANIFEST

| | Corpus do autor | Amostra gerada |
|---|---|---|
| Arquivo | `diagnostic/R7D_DIAGNOSTIC_CORPUS.json` (R7D-DIAGNOSTIC-1) | `diagnostic/generated/R7D_GENERATED_DIAGNOSTIC.json` |
| SHA-256 | `44fca381…0957` (432.753 bytes) | `449b7d91…1fb3` |
| Digest do manifesto (selo) | `5fe46a4a…1483` | `f62c343b…0be8` |
| Conteúdo | 18 casos, 158 passos, 205 expectativas | 100 intakes, seed `3b2c3707…6f5a` = sha256('R7D-SAMPLE\|DIAGNOSTIC\|'+manifest do FREEZE-4) |
| Selo | `854ae7e`, `evaluationCount 0` | `854ae7e`, `evaluationCount 0` |
| Primeira avaliação | **`evaluationCount 1`**, 2026-11-02T20:53:11.946Z, relatório `3f0fbdcb…e219` (`46e26ba`) | **1**, 20:53:55Z, relatório `26307457…5f4b` |

## DIAGNOSTIC_CORPUS

18 casos cobrem:
- **cold start:**
  - walk/jog de zero até 10K em 16 semanas;
  - meia com build, taper, prova e pós-prova;
  - força primeiro só com kettlebell;
  - híbrido balanceado com dias e turnos compartilhados e conflito duplo;
  - só corrida 5×/semana com histórico de relógio;
  - só força, 63 anos, iniciante;
  - dias demais para a capacidade em 4 semanas;
  - restart após 22 semanas;
- **segurança e escopo:** elegibilidade desconhecida; dor no onboarding; 16 anos pedindo meia; pausa talvez clínica (gripe) com liberação; dor num exercício com liberação; adverso repetido seguido de dor;
- **longitudinal:** relator atrasado e corridas encurtadas; execução mista; revisão vazia e pulada; respostas parciais e tardias; duas pausas, uma só descoberta perguntando;
- **eventos:** mudança de agenda, viagem com fuso, fadiga local e sistêmica, mudança de objetivo e de data de prova, maratona fora do escopo;
- **dados:** duplicata telefone + relógio, carimbo UTC em outro dia local, fora de ordem, correções no prazo e atrasada, relógio adiantado;
- **aprendizado:** padrão com consentimento revogado; ruído sem consentimento;
- **calendário:** 16 de 18 casos não começam na segunda; 15 com fuso.

A amostra gerada (100) cobre intakes estruturais.

## FRESHNESS_CHECK

O corpus é independente porque:
- **Autor:** instância nova que não escreveu runtime nem harness.
- **Leituras:** só os três arquivos do autor, com hashes iguais aos bytes commitados; executou o checador sem lê-lo.
- **Nunca abriu:** runtime, harness, testes, fixtures, outros audits ou git.
- **Tempo:** `authorStartedAt` 20:07:01Z, depois do freeze (17:32Z); `sealedAt` 20:51:22Z.
- **Commit antes de executar:** `854ae7e`.
- **Expectativas:** escritas antes de qualquer saída.
- **Builder:** importa só `node:fs`.
- **Amostra:** mecânica, do vocabulário da interface, com seed fixada pelo freeze.

Desde a avaliação o corpus diagnóstico está aberto: **não serve como evidência final**.

## AUTOMATED_PROPERTIES

Primeira avaliação, corpus do autor; a amostra gerada teve 0 violação.

| Prop. | Unid. | Resultado bruto | Depois da triagem |
|---|---|---|---|
| P01 | 15 | PASS | PASS |
| P02 | 10 | PASS | PASS |
| P03 | 7.873 | PASS | PASS |
| P04 | 13 | PASS | PASS |
| P05 | 14 | FAIL (RESEND, D15) | **Violação real**: efeito do DX-01 |
| P06 | 338 | PASS | PASS (D18 a6 dentro do teto: o DX-02 escapa do D18) |
| P07 | 191 | FAIL (D14) | Falso: HG-02 |
| P08 | 3 | PASS | PASS, mas **cego ao DX-02** (HG-05) |
| P09 | 843 | FAIL (D14 w1) | Falso: HG-03 (o domínio aceita o caso) |
| P10 | 11.056 | FAIL (D15) | **Violação real**: DX-01 |
| P11 | 29.162 | PASS | PASS |
| P12 | 5.001 | PASS | PASS |
| P13 | 3.582 | PASS | PASS |
| P14 | 138 | FAIL (D13 w8) | Falso: HG-01 |

## METAMORPHIC

| Relação | Unidades e resultado |
|---|---|
| PERMUTE | 14, 0 violação |
| DUPLICATE_SECOND_SOURCE | 14, 0 violação |
| RENAME | 14 + 79, 0 violação |
| CALENDAR_SHIFT (P15) | 14 + 79, 0 diferença |
| CLOCKLESS_CONTROL | 14, 0 diferença |
| LOAD_CONVENTION | 3 + 7, 0 violação; diferenças = HV-01 |
| RESEND | 14, **1 violação** (DX-01) |
| CARRIER_CLINICAL e CARRIER_HOLD | **0 unidade**: o coach não perguntou UNREPORTED_TRAINING em nenhum caso (TG-01) |
| CONSENT_OFF | 0 unidade de ruído |
| VARIANT do autor | 12 unidades, 4 falhas. D02, D06 e D16: CORPUS_ERROR (a base nunca entregou os fatos). D14: diferença conservadora real (F11) |

## DETERMINISM

17/17 casos do autor e 100/100 intakes gerados, byte a byte idênticos em duas execuções.

## DOMAIN_TRIAGE

**SSCTR-R7D-DIAG-TRIAGE-r1** (`diagnostic/triage/`): diagnóstica, sem veredito sobre a R7-D, sem freeze, sem fila.

| Classe | Casos |
|---|---|
| BEST_SUPPORTED (8) | D03, D04, D05, D09, D10, D13, D15, D17 |
| ACCEPTABLE_ALTERNATIVE (5) | D02, D06, D07, D14, D16 |
| SUBOPTIMAL (3) | D08 (RUNTIME, estrutural: F03); D01 e D12 (AUTHORITY_SCOPE, não bloqueiam) |
| UNSAFE (1) | D18 a6 (DX-02) |
| CORPUS_ERROR (1) | D11 |

**Rubrica:** funcionou: avaliação independente prévia, classe de rubrica separada da taxonomia, campo de atribuição. Correções sugeridas, não aplicadas:
- julgar o roteamento nos casos clínicos; sem isso o estrato clínico nunca é avaliável e todo holdout fica INVALID pelo §7;
- renomear a classe UNSUPPORTED;
- classe por passo, com o caso herdando o pior passo;
- classe de expectativa fora da autoridade;
- premissa nas VARIANT;
- P08 sobre qualquer pausa declarada;
- P09: confounded neutraliza só desempenho e esforço;
- defeito visto só na testemunha do juiz = TEST_GAP até um caso mostrá-lo.

**Ressalvas do juiz:**
- literatura só por resumos (BJSM/PMC bloqueados);
- rodou um `git status` só leitura apesar da instrução; não mudou nada.

## FINDINGS

| Id | Classe | Origem | Visto | O quê | Dono | Menor escopo de correção |
|---|---|---|---|---|---|---|
| **DX-02** | **SAFETY_BLOCKER** | PRE_EXISTING (pré-R7A → FREEZE-4) | D18 a6; testemunha mínima | Pausa não clínica declarada numa revisão semanal, sem pergunta pendente, não é lida. A decisão sai VALID: long 70 no mesmo dia (acima dos 65 executados antes) e qualidade na semana seguinte, contra re-entrada 20/15 sem qualidade se a mesma pausa vier como retorno | Engineering, com SSCTR (semântica) e G03 (caminho da resposta) | Em qualquer tipo de decisão, a pausa declarada vira a mesma receita de retorno, ou a decisão pergunta (REQUIRES_RECONCILIATION). Teste: mesma pausa por revisão ou retorno dá o mesmo plano, sem corrida acima do máximo executado. `r6-adaptation.mjs` |
| **DX-01** | **GENERALIZATION_BLOCKER** (DIRECT_RUNTIME_DELTA, registro) | PRE_EXISTING (pré-R7A → FREEZE-4) | D15 w2; testemunha mínima; testemunha do juiz | Relato com precisão de dia e `reportedAt` no mesmo dia é registrado e cai do registro na decisão seguinte (`REPORT_BEFORE_OBSERVATION`). O juiz mostrou que um relato adverso perdido troca o recuo obrigatório por HOLD (+5 min no longo seguinte) | Engineering | `r6-provenance.mjs`: linha carregada mantém a precisão original na triagem de relato antes da observação (ou não é retriada). Testes: relato do mesmo dia sobrevive; dois adversos dão o mesmo REGRESS |
| **F03** | **GENERALIZATION_BLOCKER** + DIRECT_RUNTIME_DELTA | PRE_EXISTING (unidades R6) | D08, D14, D18 (estrutural) | O runtime prescreve máquina como `STACK_STEP` e recusa essa unidade de volta (`LOGGED_UNIT_OR_CONVENTION_UNKNOWN`). As cargas de máquina nunca progridem (D08: 9 semanas paradas, 5 perguntas por semana). Lidas em KG, sobem +1 kg, inexequível numa pilha | Engineering (unidade); SSCTR com PCG (passo da pilha, **decisão de policy**) | Unidade KG para carga conhecida de máquina, ou o leitor aceita a unidade prescrita. O passo executável (placa declarada ou progressão por repetições) é decisão de policy. Teste: carga logada como prescrita é adotada |
| **F04** | GENERALIZATION_BLOCKER, **latente** | PRE_EXISTING | Mecanismo em D14 w1 (inofensivo); forma nociva só na testemunha do juiz | `confounded` mascara recuperação ADVERSE e dia seguinte IMPAIRED, e o longo avança | Engineering, com SSCTR | Confounded neutraliza só desempenho e esforço. Teste ADVERSE/IMPAIRED × COMPATIBLE/NORMAL. **Pela regra estrutural pré-registrada é bloqueio; pela sugestão do próprio juiz seria TEST_GAP.** O Founder escolhe se entra na Fase 3 |
| TG-01, HG-05 | TEST_GAP (segurança) | NEW | Corpus | O coach nunca perguntou UNREPORTED_TRAINING, então os portadores do P05 tiveram 0 unidade; o P08 só vê RETURN_AFTER_PAUSE | Harness e brief final | Brief final com silêncios de mais de um mês e pausas declaradas sem pergunta; P08 sobre qualquer pausa declarada |
| F05, F06, F07, F08, F09, F13 | POLICY_QUESTION | PRE_EXISTING (F07: família do resíduo R7-C) | D01, D12, D18 s6, D10, D08, testemunha | F05 preparo de prova do walk/jog; F06 adversos em papéis diferentes; **F07 silêncio de 17 dias com teto ancorado numa corrida de 28 dias (relevante para segurança)**; F08 sem volta ao plano após liberação clínica; F09 conflito de um dia; F13 adverso em semana de consolidação | SSCTR com PCG | — |
| F10, F11, F12 | OBSERVATION | PRE_EXISTING | D14, D14, D07 | Maratona no meio do programa → ASK (horizonte), não UNSUPPORTED; relato não comparável ainda conta UNDER; passos de kettlebell assumem implementos | — | — |
| HV-01 | KNOWN_DISCLOSED_RESIDUAL (POLICY_QUESTION) | PRE_EXISTING | D08, D10, D14; G022, G050, G079 | Incremento por convenção num par de halteres declarado TOTAL | SSCTR com PCG | — |
| CE-01; família ASK; VARIANT D02/D06/D16 | CORPUS_ERROR | NEW | D11 cl2; expectativas "o coach deve perguntar"; VARIANT | Referência de substituição sem exercício de agachamento; expectativas além da regra R7-C de perguntar; variantes cuja base nunca entregou os fatos | — | Nunca corrigir runtime por isso |

Nenhum caso exigiu juízo clínico além do roteamento. Não houve SCIENTIFIC_BLOCKER separado: o DX-02 é UNSAFE pela regra registrada.

## INHERITED_FINDINGS

Nenhum foi absorvido.
- **QE-R7C-08 / CC-F04 (B):** reproduzido dentro do envelope em D18, semanas 4–6: projeção creditada abaixo do teto em decisões fora da revisão. O DX-02 está **fora** desse envelope: a pausa foi declarada.
- **JUDGE-CQ-R6-06:** reverificado em caso fresco, D01. Quem construiu só com walk/jog tem prova de conclusão (`completion:true`), sem strides. Dado diagnóstico, não evidência final.
- **QE-R7C-15 / P7-F03 (só legado):** o controle sem relógio deu 0 diferença; não havia resposta não aplicada para medir.
- **Não exercitados**, porque não houve pergunta UNREPORTED_TRAINING: QE-R7C-12/-16 (C9, C11 b), QE-R7C-13, QE-R7C-18, C8, C5, o HOLD do R4.
- **HV-01** (validação do harness) reproduzido; não bloqueia.

## HARNESS_FINDINGS

**Na construção, corrigidos antes do selo (validação dev):**
- cópia JSON do plano quebrava o hash (`Infinity`);
- portador comparava rótulos KEEP/MODIFY em vez do plano;
- reenvio de relatos que o runtime nunca registrou;
- massa por convenção;
- confirmação de mesmo turno pedida pelo plano;
- P03(d) acrescentado (o R7C-G01 escapava);
- P07 dose de força da semana da prova acrescentada (o D54 escapava);
- base dos caminhos de registros antigos.

**No diagnóstico, registrados e não corrigidos** ("não corrigir"):

| Id | Lacuna |
|---|---|
| HG-01 | O cliente não carrega o consentimento atual. O runtime lê consentimento por decisão; há também uma CONSUMER_CONDITION: revogação caduca se o cliente não reenviar |
| HG-02 | Linha da data da prova seguia mudança de objetivo recusada |
| HG-03 | Confounded lido como adverso |
| HG-04 | ROLE_ABSENT conta sessões passadas; ROLE_MINUTES_COMPARE sem papel |
| HG-05 | P08 só em RETURN_AFTER_PAUSE |
| HG-06 | O cliente nunca envia confirmação de carga: lê `logged.value`, mas o runtime devolve um número |
| HG-07 | O pacote mostra intervalos de walk/jog como `undefined` |

## RUNTIME_CHANGED

`NO`

## FROZEN_TESTS_CHANGED

`NO`

## FINAL_HOLDOUT_READY

`NO`

## PHASE3_REQUIRED

**`YES`.** Menor escopo, um ciclo, testes dirigidos, novo freeze `R7D-FREEZE-1`:
1. **DX-02:** pausa declarada lida em qualquer decisão (receita de retorno) ou pergunta.
2. **DX-01:** precisão original das linhas carregadas na triagem.
3. **F03:** unidade da carga de máquina legível de volta.
   - O passo executável da pilha é **decisão de policy** (SSCTR com PCG). Sem ela, a correção fica só na unidade.
4. **F04:** só se o Founder o tratar como bloqueio; senão, TEST_GAP coberto no brief final.

**Antes da Fase 4, sem runtime:**
- harness `R7D-HARNESS-1.1` (HG-01..HG-07);
- pré-registro v2: rubrica e escopo do P08;
- interface e brief finais: silêncios longos, pausas sem pergunta, máquinas, confounded com resposta adversa, as 12 lacunas do autor.

## EXACT_NEXT

`R7-D Phase 3 — narrow correction`, com autorização própria do Founder:
- DX-02, DX-01, a parte de unidade do F03 e, se autorizado, o F04;
- testes dirigidos e `R7D-FREEZE-1`;
- a decisão de policy do passo de máquina roteada a SSCTR com PCG;
- a revisão do harness e o pré-registro v2 antes de nascer o holdout final.

Depois: `R7-D Phase 4 — sealed fresh holdout + final gates`. **STOP.**

## GIT_STATE

**Branch:** `claude/domain-coaching-r7-d`, sobre `c45087a`:
- `a940266` — interface, esquema, brief e harness com validação;
- `628fb63` — pré-registro;
- `8eec795` — passo de selo;
- `854ae7e` — corpus selado, `evaluationCount 0`;
- `46e26ba` — primeira avaliação bruta, `evaluationCount 1`;
- `ff72797` — pré-triagem de engenharia e testemunhas;
- `6cd7d21` — triagem SSCTR;
- e o commit deste checkpoint, com os acréscimos de missão e ledger.

**Sem push e sem merge.** Checkout principal e outros worktrees intocados.

**Fora do repo (scratchpad da sessão), recriáveis pelo `harness/README.md`:** os runtimes superados usados na validação.
