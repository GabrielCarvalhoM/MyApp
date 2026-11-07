# R7-D Fase 3.4: checkpoint de fechamento (2026-11-07)

**DOMAIN_COACHING_R7-D, Fase 3.4: correção da retomada, alinhamento dos instrumentos e resolução controlada do F08.** A autorização do Founder está resumida em `phase34/AUTHORIZATION_PHASE34.md`.

## PHASE34_STATUS

**CLOSED_NOT_READY**, com três bloqueios explícitos e nenhum freeze novo. O único ciclo de correção foi usado.

- A direção A está implementada e aceita no domínio. As quatro falhas da primeira recheck do SSCTR e o bloqueio da primeira checagem de qualidade foram fechados no ciclo.
- As checagens estreitas do candidato corrigido `46934a0` acharam três defeitos novos. Dois foram introduzidos pelo próprio ciclo e um estava preexistente e mascarado. Com o ciclo usado, não houve freeze.

## BASELINE

| Item | Valor |
|---|---|
| Ramo / worktree | `claude/domain-coaching-r7-d` / `.claude/worktrees/domain-coaching-r7-d` |
| Ponto de partida | Fase 3.3 fechada em `3edf3c5` |
| R7D-FREEZE-4 | Registro `8bbbb8e`, arquivos vinculados `b242237`, runtime revisado `3228a70`. Source 754d42a4…ded8c, manifest e41418da…10ba, 423 arquivos, 952/952. Verificador 27/27 no início da fase |
| Fila de revalidação humana no início | 234 itens |

R7D-FREEZE-4 e todos os freezes anteriores ficam intactos.

## P33_F01_BEFORE_AFTER (direção A, variante γ)

| Caso | R7D-FREEZE-4 | Candidato `46934a0` |
|---|---|---|
| **Obrigatório do Founder:** feriado de 14 d; 2 semanas com toda corrida feita e uma força perdida por semana; viagem de 4 d | LONG 32, RESTART, corrida 15/20/20/20 | SHORT 4 (a viagem pelos próprios dias). Feriado `OWN_RETURN` (MODERATE/14, corrida reentrou em 30/11). Corrida retoma o executado: LONG 75, EASY 50/41, LONG 65 (= duas semanas completas). Força sem passo não ganho (ESTABLISH/FROM_LOG) |
| Força completa, corrida curta perdida por semana | LONG 32, RESTART | SHORT 4. Força retoma as doses executadas (2x8@85). Corrida RETURN a partir do retorno próprio: 20/30/30/45 |
| Três semanas com a força de sexta perdida | LONG 39, RESTART | SHORT 4, corrida reentrou |
| Uma semana (corridas feitas; ou completa sem RIR) | MODERATE 25 | SHORT 4, corrida reentrou |
| Forma tardia (semanas revisadas na hora) | LONG 34, RESTART | SHORT 4 |
| Correção da viagem depois desse retorno | SHORT 5 com o feriado descartado e força pré-pausa | SHORT 5 com o feriado lido como retorno próprio |
| Correção depois de uma leitura de continuidade | SHORT 5, feriado descartado, doses pré-pausa | MODERATE 22 atravessando o feriado |
| Controles: sessão isolada, X1, X2 (ambos parciais), E1 (semanas completas), revisões semanais, aplicado na hora, clínico | — | Inalterados |

Residual X2 divulgado: as duas modalidades parciais em todas as semanas ainda atravessam a parada, porque separá-las exigiria um limiar de adesão novo.

Nenhuma dose, porcentagem, teto ou limiar novo. A teste-testemunha está em `phase34/probes/p34-witness.mjs`, com saídas em `phase34/probes/out/`.

## REENTRY_WEEK_CONTRACT (SSCTR BR-Q4/BR-Q5; QE-R7D-P33-01)

**Contam:**
- corridas EASY, LONG, QUALITY e WALK_JOG;
- o toque de prova e a prova, feitos como prescritos e terminados (um toque feito pela metade não conta; uma prova terminada conta);
- toda sessão de força, com repetições, RIR e carga em unidade conhecida.

**Nunca decidem uma semana:** WALK, RECOVERY_EASY e SHAKEOUT opcionais, e strides opcionais.

**Regras de leitura:**
- **Por esporte:** a falta de dado de força segura só a força.
- **Mesmo dia:** uma sessão no primeiro dia da pausa posterior só conta com `startedAt` declarado e feita antes dele; sem hora, essa semana não conta.
- **Semana de prova só com toque, shakeout e prova:** conta para a corrida (SSCTR-P34R-F03). O sinal sistêmico nessa forma é o bloqueio aberto SSCTR-P34R2-F01.

**Alinhamento:**
- P18(a), `PREREGISTRATION_R7D_6.md` (Δ1, Δ14, Δ15) e `author/INTERFACE_DELTA_R7D_6.md` §1 leem o mesmo contrato.
- O P18(a) só conta relato não parcial e continua condição necessária.

## F08_COMPETITOR_BENCHMARK

`phase34/f08/F08_COMPETITOR_BENCHMARK.md`. Fontes:
- **Lidas:** Runna (2 artigos), TrainerRoad, Gentler Streak, manual Garmin;
- **Não lida:** FAQ Garmin (HTTP 403, não contornado);
- **Só resumo:** consenso do IOC 2022 sobre doença respiratória e consenso de Berna 2016. O texto completo foi bloqueado, sem contorno.

15 padrões, cada um com decisão:

| Decisão | Padrões |
|---|---|
| **ADOPT** (já implementado) | categoria de motivo; recomendação pausada e registro mantido; retorno escalonado; editar as datas da pausa; readaptação pelo treino recente; orientação médica; primeira semana limitada; treinos perdidos não acumulam |
| **ADAPT** | notificações (condição de consumidor); "parar, ver um profissional, novo plano quando pronto" como alvo do F08 sob G04; retomada manual só para pausa não clínica; vocabulário do contínuo participação → esporte → desempenho |
| **DEFER** | velocidade de retorno escolhida pelo usuário; reteste depois de mais de 14 dias; redução não clínica auto-gerida |
| **REJECT** | auto-redução para causa clínica; retomada manual como saída clínica |

Proposta: `phase34/f08/F08_RETURN_PROPOSAL.md`.

## F08_AUTHORITY_DECISION

**PCG-R7D-F08-r1** (`phase34/policy/PCG_F08_AUTHORITY_R7D.json`): **F08 BLOCKED_BY_AUTHORITY (F08-BLOCK-G04)**.
- A saída exige um fato de liberação (S5) e um quadro de retorno pós-liberação (S6). Os dois dependem de profissional qualificado G04, que o projeto não tem.
- Caminho de correção: **R-F08-1, RESTRICTION_REQUIRED, dentro da autoridade existente**.
- Condições: PCG-F08-C01 a C10. Não há entrada de liberação, S5 nem S6. Security e G07 vêm antes de qualquer entrada.
- No SSCTR: Q8 NEEDS_AUTHORITY (`SSCTR-R7D-P34-DECISION-r1`). A parte não clínica é só candidata, nada aprovado.

## F08_IMPLEMENTATION_STATUS

**F08_OPEN.** Só a R-F08-1 foi implementada (PCG-F08-C03):
- um relato com motivo clínico mantém o episódio clínico;
- um motivo não clínico reafirmado nunca encerra CLINICAL_HUMAN_REQUIRED, com ou sem liberação;
- os relatos ficam no registro, só por acréscimo.

Cobertura: testes T12 ×3 e P02 R-F08-1 (DEV-39/40). Detectado no R7D-FREEZE-4, limpo no candidato. A âncora de conformidade `const clinical=clinicalRoute(kind,review);` está intacta.

## TESTS_AND_REGRESSIONS (evidência `phase34/evidence/EVIDENCE_PHASE34.json`, PASS, sobre `46934a0`)

- **Suíte:** 992/992. Dirigidos: Fase 3.4 40/40, 3.3 14/14, 3.2 17/17, 3.1 14/14. Conformidade R7-B, R7-B.1 e R7-B.2 PASS.
- **RED:**
  - no R7D-FREEZE-4, 30/40 testes da Fase 3.4 falham;
  - numa cópia de `1978cc4`, falham exatamente T22 a T26, um por achado do ciclo. Os testes de adequação T27 a T30 passam.
  - As cinco asserções existentes atualizadas foram aceitas pelo SSCTR e pelo QRE.
- **Mutação:** 23/23 mortos, cada um pela própria testemunha (`MUTATION_PHASE34.json`).
- **Harness R7D-HARNESS-6 r2, validação 6** (`harness/validation/HARNESS_VALIDATION_R7D_6.json`):
  - 49 casos DEV, sem falso bloqueio;
  - 20/20 linhas de sensibilidade;
  - P17 com 163 unidades, P18 com 75;
  - 52/52 testemunhas.
- **Regressões:** corpus diagnóstico com 0 violações (VARIANT só nos 4 casos triados); amostra gerada com 0.
- **Diferencial contra o R7D-FREEZE-4:** 167 casos, 148 idênticos, 19 diferentes, 0 sem explicação.
- **Decomposição por runtime híbrido:**
  - 6 casos mudam só pelo teto, e nenhum aumenta dose;
  - 13 mudam só pela adaptação;
  - nenhum muda pelos dois.
- **Pré-registro:** `R7D-PREREG-6`, com adendo pós-revisão (Δ14–Δ20) e adendo de fechamento (Δ21–Δ25).
- **Interface:** R7D-INTERFACE-6. **Brief:** `author/AUTHOR_BRIEF_FINAL_R7D_5.md`.

## SSCTR_REVIEW

| Registro | Disposição | Conteúdo |
|---|---|---|
| SSCTR-R7D-P34-DECISION-r1 | ACCEPT_WITH_CONDITIONS | Direção A como γ; BR-Q1 a BR-Q6; CF-P34-01 a 11; P34-F01 (teto) e P34-F02 (correção) preexistentes, corrigidos no candidato |
| SSCTR-R7D-P34-RECHECK-r1, instância nova (`1978cc4`) | BLOCK | P34R-F01 (a guarda contava o próprio relato da pausa corrigida); F02 (toque parcial reentrava); F03 (semana de prova sem gate nunca reentrava); F04 (sessão de força no primeiro dia sem hora não era perguntada). Todos fechados no ciclo |
| SSCTR-R7D-P34-RECHECK-r2, segunda instância nova (`46934a0`) | **BLOCK** | Closures de F01–F04 conferidas, e leitura do QRE-P34-01 aceita. Novos: **SSCTR-P34R2-F01** e **SSCTR-P34R2-F02**. CFR2-07: sem freeze na fase |

- **SSCTR-P34R2-F01:** a correção do F03 deixou de ler o sinal sistêmico em semana de prova sem corrida com gate. Erro do lado agressivo.
- **SSCTR-P34R2-F02:** na releitura de uma correção, o relato substituído mascara os dias antigos e esconde sessões descobertas. O caso CU3 dá LONG 32 RESTART.

## PCG_G04_DECISION

PCG-R7D-F08-r1, já descrito acima. Nenhum responsável G04 existe; o gatilho de reabertura é o T1 (o Founder nomeia e financia um).

O item QRE-P34-07 foi encaminhado ao PCG: duas formas de revisão que não leem o registro devolvem a própria pergunta durante um episódio clínico. É idêntico no R7D-FREEZE-4.

## ENGINEERING_REVIEW

| Registro | Veredito | Conteúdo |
|---|---|---|
| QRE-R7D-PHASE34-CHECK-r1 (`1978cc4`) | NOT_READY | **QRE-P34-01:** uma correção sem o primeiro dia dava HOLD persistente. Fechado no ciclo. CQ-2 (lacunas de teste Q02, Q03, Q09, Q10, Q12) fechado com T27–T30. CQ-3 (P18(a) em cadeia aninhada, P02) corrigido no instrumento |
| QRE-R7D-PHASE34-CHECK-r2 (`46934a0`) | **NOT_READY** | **QRE2-P34-01 (HIGH):** introduzido pela correção do F04 |

Detalhe do QRE2-P34-01:
- a pergunta de hora de início levantada numa releitura de um retorno registrado (evidência tardia, correção) não pode ser respondida: o `recordedStop` não lê o `startedAt` reafirmado;
- toda revisão seguinte fica em ASK. Falha fechada, mas é regressão frente ao R7D-FREEZE-4.

Achados não bloqueantes:
- **QRE2-P34-02:** a guarda NESTED ainda dá falso bloqueio com uma pausa de segundo nível sobreposta (QH4);
- **QRE2-P34-03:** um mutante que descarta o segundo nível passa em tudo, com doses de força mais altas;
- **QRE2-P34-04:** os mutantes N01 e N05 sobrevivem.

## HUMAN_REVALIDATION_QUEUE

**234 → 235.** O item `HQ-R7D-SSCTR-P33-RECHECK` foi acrescentado pelo dono autorizado (Chief/Founder):
- nomeia o R7D-FREEZE-4, o freeze que o registro dele julgou;
- o conteúdo científico está inalterado, sem duplicação e só por acréscimo;
- registro: `phase34/QUEUE_INTEGRATION_R7D_P34.json`; sha256 da fila 3b459b95…4284, commit `23ec9e5`.

Ficam só propostos: `HQ-R7D-SSCTR-P34-DECISION` e `HQ-R7D-SSCTR-P34-RECHECK` (o r2 substitui o r1).

A revalidação provisória por IA não é validação humana financiada.

## NEW_RUNTIME_FREEZE

**Nenhum.** O R7D-FREEZE-5 não existe; o R7D-FREEZE-4 continua o último estado congelado.

O candidato `46934a0` está no ramo, não congelado:
- runtime de `77768e6`: `r6-adaptation.mjs` c98eb081…27ba, `r6-composition.mjs` 8aa5f950…18a8;
- instrumentos de `0b502b1`.

Os scripts `CoachingCore/scripts/freeze-r7d-5.mjs` e `verify-r7d-5.mjs` estão prontos e **não foram rodados**. O freeze recusaria hoje, porque os vereditos não são de aprovação.

## REMAINING_FINDINGS

**Bloqueantes** (antes de qualquer freeze; fechamento objetivo em PREREG-6 Δ22):
- **SSCTR-P34R2-F01:** SY1 = SY1g.
- **SSCTR-P34R2-F02:** CU3 = CU3f; também CU1, LC1 e CU2.
- **QRE2-P34-01:** R07 por reafirmação e por confirmação, e R04, saem do ASK. O lado de domínio vai ao SSCTR.

**Instrumento, antes de qualquer holdout** (PREREG-6 Δ23):
- **CFR2-04:** detectar SY1 e CU3;
- **CQ2-2:** sobreposição na cadeia aninhada;
- **CQ2-3:**
  - teste que fixe as doses da cadeia em dois níveis;
  - no Δ16, o juiz recomputa o retorno interno;
  - unidades NESTED listadas nos relatórios;
- **CQ2-4:** testes que matem N01 e N05.

**Resíduos divulgados, sem envelope:**
- **X2 (SSCTR-P34-F03):** ambos os esportes parciais e o acoplamento do gatilho.
- **F04:** substância completa, menos conservador para a corrida.
- **SSCTR P34:**
  - O-01, reentrada plena após semana de consolidação;
  - O-02, correção que nomeia a pausa anterior é perguntada.
- **QE-R7D-P33-03 e -04.**
- **SSCTR-P34R:**
  - O01, doses da semana 9 em semanas de prova sem reentrada, incluindo o toque pela metade, acima do R7D-FREEZE-4;
  - O02, a liberação de passo ignora o toque e a prova.
- **SSCTR-P34R2-O02:** esporte todo indisponível e o espelho.
- **Instrumentos:** o P18(c) é só suficiente; os gatilhos do diferencial são necessários; a decomposição é um caminho.
- **R-F08-1 R1/R2:** uma entrada clínica por engano, ou um falso positivo, prende o atleta até haver um responsável G04.
- **F08_OPEN.**

## FINAL_HOLDOUT_EXISTS

**NO.** Nenhum holdout, autor final ou seed final.

O harness tem como padrão `RUNTIME_FREEZE_R7D_5.json`, que não existe, então recusa.

## V1_COACHING_AUTHORITY_READY

**NO.**

## EXACT_NEXT

Uma **decisão do Founder** para autorizar uma Fase 3.5 estreita:
1. fechar SSCTR-P34R2-F01, SSCTR-P34R2-F02 e QRE2-P34-01, só no runtime e sobre `46934a0`, cada um com teste dirigido RED em `46934a0`, e nada mais muda (CFR2-03);
2. resolver os itens de instrumento do Δ23 por adendo só de acréscimo, sem afrouxar propriedade;
3. uma instância nova do SSCTR e uma checagem de qualidade independente nomeando o novo commit;
4. o freeze R7D-FREEZE-5, com os scripts preparados ajustados ao novo candidato e às revisões, e o verificador;
5. só então a Fase 4, por autorização própria.

A decisão sobre o resíduo X2 (Δ10/Δ19) continua com o Founder, se quiser outra leitura.

## GIT_STATE

- Ramo `claude/domain-coaching-r7-d`.
- Commits da fase, de `3edf3c5` (exclusivo) até o commit deste checkpoint: `661b05d` … `c3a9a00`, `1d63af4` (rechecks), `23ec9e5` (fila), seguidos do adendo e deste checkpoint.
- Nada foi enviado (push) nem mesclado (merge).
- Nada foi apagado. As reconstruções estão em diretórios novos e exclusivos sob o scratchpad da sessão.
- `product/`, `canon/`, a política, o catálogo e os registros R6/B0 estão inalterados.
- `CURRENT_MISSION.md` e `MISSION_LEDGER.md` receberam apenas blocos acrescentados.
