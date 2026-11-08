# R7-D Fase 5: checkpoint de fechamento (2026-11-08)

**DOMAIN_COACHING_R7-D, ciclo corretivo final pós-Fase 4 (R7-D-D).** O Founder escolheu a opção A do `PHASE4_CHECKPOINT.md`: um único ciclo corretivo, o último dedicado ao R7-D, sem abrir uma cadeia de fases. A autorização está resumida em `phase5/AUTHORIZATION_PHASE5.md` (`094732d`). O protocolo é o do `PREREGISTRATION_R7D.md` §8, completado pelo `PREREGISTRATION_R7D_8.md` (Δ47–Δ58).

**Resultado: R7D_FINAL_STATUS = READY_WITH_CONDITIONS**, compilado mecanicamente dos dois julgamentos independentes. O R7-D fecha. `V1_COACHING_AUTHORITY_READY` continua NO, e o F08 continua aberto. Testes verdes não são aprovação esportiva: a aprovação de domínio vem da leitura passo a passo do SSCTR sobre o holdout novo. Fechar o R7-D não é prontidão do treinador V1.

## 1. Estado inicial e freeze de referência

- **Estado de partida:** `cc0b56f`, o fechamento da Fase 4.
  - A Fase 4 terminou NOT_READY, com o holdout INVALID_HOLDOUT por cobertura.
  - Os dois bloqueios eram SSCTR-P4-F01 (D49) e QRE-P4-F01 (P03(d)), ambos estruturais e preexistentes.
- **Freeze de referência:** R7D-FREEZE-5, com registro em `20c099d` e bytes de `7272e9a`. É contra ele que as correções foram mostradas RED.
- **Preservado sem mudança:**
  - o holdout da Fase 4 (`final/`), que nunca foi reavaliado nem escrito, com seus julgamentos e relatórios;
  - os freezes 1 a 5 e seus registros;
  - os pré-registros 1 a 7.
- **Fila:** 235 itens, sem acréscimo.

## 2. Correção do F01 (SSCTR-P4-F01) e evidência

**Defeito:** depois de um retorno moderado ou longo, um exercício de força planejado e nunca executado antes da pausa pulava os limites de retorno da D49.

**Correção (`240f151`, com ajuste em `dc6fe1d` pela evidência de mutação; PREREG-8 Δ47).**
- Um retorno moderado ou longo marca que a semana de entrada está à frente (`returnEntry`).
- A marca termina quando a transição de uma semana deixa um exercício em uso com estado. A leitura de fatos numa pausa posterior nunca a encerra.
- O exercício nunca executado entra na dose de `strengthEntryWeek` e segue os passos da D49 (`strengthReturnSets`). A contagem normal é o teto, e nenhum bloco é creditado por semana não executada.
- Nenhum número novo foi criado.
- **No caminho da correção apareceu o R7D-FC-01:** os registros de elástico e assistidos passam a ser evidência, como o peso corporal. O defeito era preexistente no FREEZE-5 e está divulgado no Δ56 (a).
- **Uma asserção legada foi emendada:** `test/r6-adaptation.test.mjs` exigia o próprio defeito. Está divulgado no Δ56 (b), conforme a CND-2.

**Evidência.**
- T42 (forma do F13), T43 (testemunha W-D49-A e controle W-D49-B) e T44 (FC-01): RED no R7D-FREEZE-5, verdes no candidato.
- Os mutantes P5-M1 a M6, M9 e M10 foram todos mortos pela suíte.
- **No holdout novo, o SSCTR julga que a correção vale:**
  - H18 e H19, sem registro de exercício antes de uma pausa moderada, entram com 1 série a RIR 4;
  - o passo 2 é 1 série a RIR 3 (CFD-1); depois sobe uma série por semana executada até a contagem normal, sem bloco creditado;
  - exercícios com histórico o mantêm (H21, H23, H35, H36).
- **Limite:** a forma mista exata do F13 (uns exercícios com histórico, outros nunca feitos), CFD-3 e CFD-4 não aparecem no H1. Eles se apoiam só nos testes T42–T44 (CND5-4).

## 3. Correção do F02 (QRE-P4-F01) e evidência

**Defeito:** depois de mais de um mês sem relatos, uma revisão vazia antes de uma semana CONSOLIDATION de dose baixa voltava válida e reduzia a dose sem perguntar `UNREPORTED_TRAINING`. Lia ausência de informação como prova de que não houve treino.

**Correção (`240f151`; Δ47).**
- A pergunta passa a ler também o crédito de um início projetado. Quando a semana, planejada contando as corridas não relatadas como feitas, planeja mais que a leitura zero, a dose depende do que o atleta fez.
- Isso vale em qualquer fase, sem depender da fase nem da dose.
- Um início ancorado em evidência nunca é lido como crédito: cadastro, semana revisada ou entrada de retorno.

**Evidência.**
- T45 (forma do F13 e grade de testemunhas do juiz: CONSOLIDATION igual a DEVELOPMENT): RED no FREEZE-5, verde no candidato.
- T46: os controles; o que é conhecido não é perguntado.
- T47: determinismo e idempotência.
- Os mutantes P5-M7 e P5-M8 foram mortos.
- Validação 9: linha de sensibilidade DEV-67 (P03(d)) no FREEZE-5.
- **No holdout novo, o SSCTR julga que a correção vale:**
  - H16 pergunta numa semana CONSOLIDATION, a fase do defeito original;
  - H15 e H17 também perguntam;
  - silêncios mais curtos são lidos como desconhecidos, nunca como "não treinou" (H16 s2, H10).
- **Do lado de qualidade:** nenhuma violação de P03. As 11 unidades P03 não avaliáveis são sessões do próprio dia já relatadas pela decisão. Elas têm leitura de domínio PASS e continuam não avaliáveis na contagem.

## 4. Lacunas de instrumento e K03

- O H1 da Fase 4 continua **INVALID_HOLDOUT**. A leitura de desenvolvimento das três unidades (`phase5/evidence/K03_PHASE4_UNITS.json`) não reclassifica nada daquela fase.
- **K03, tratado de forma prospectiva no R7D-HARNESS-9** (só arquivos novos; Δ48):
  - **QRE-P4-H01:** o P06 não lê como corrida um `longestRunMinutes` 0 do cadastro;
  - **QRE-P4-H02:** o P03(d), e o gêmeo no P06, não leem como dose à frente uma sessão do dia da decisão que o registro dela já relata;
  - **QRE-P4-H03:** o CARRIER_CLINICAL e o CARRIER_HOLD comparam numa sonda inserida um minuto depois da resposta.
- **Interfaces de autoria que produziam referências a sessões inexistentes:**
  - `lib/client-9.mjs` resolve a substituição por `{week, pattern}`, sem dia (Δ49). Esse era o CORPUS_ERROR do F22;
  - a R7D-INTERFACE-8 diz como escrever fatos que resolvem (Δ51): referência por papel sem dia ou em lote depois de replanejar, `loadsByPattern`, semana executada por inteiro, regras públicas de composição e quando a pergunta sai;
  - o brief 8 manda um caso a mais em cada item (R) (Δ52);
  - o `check-corpus-8.mjs` só dá avisos.
- **Cobertura crítica alcançável sem entregar ao autor resultados do runtime.**
  - A alcançabilidade foi conferida pelo dono do instrumento na validação 9, nunca pelo autor.
  - Nenhuma sessão, carga ou resposta foi inventada.
- **Validação 9:**
  - 74 casos DEV e nenhum falso bloqueio;
  - FALSE_BLOCKS_REMOVED;
  - 28/28 linhas de sensibilidade;
  - alcançabilidade REACHED: CARRIER_HOLD, substituição por padrão, semana de prova só com toque, shakeout e prova, e caminhada opcional numa semana de reentrada;
  - 60/60 testemunhas.
- **Revisão independente das mudanças:** pelo QRE e pelo SSCTR da Fase 5 (seção 6).
- **Pré-registro novo:** PREREG-8, commitado em `c7c72e5`, antes da autoria.
- **Nenhum caso não avaliável virou aprovação.** O juiz de qualidade confirmou nos traços avaliados: 11 unidades P06 que o HARNESS-8 contava como aprovação agora voltam NOT_EVALUABLE.

## 5. Testes e regressões

Evidência `phase5/evidence/EVIDENCE_PHASE5.json`, PASS.
- **Suíte:** 1014/1014.
- **Testes dirigidos:** T42–T47, 6/6. No R7D-FREEZE-5, falham exatamente T42–T45.
- **T39–T41 dentro da suíte** (QRE-P4-K04): os quatro mutantes CQ4-1 (QF0, QF3, QF6, QF7) foram mortos cada um pelo teste esperado.
- **Mutação:** 10/10 mutantes da fase mortos; bytes originais restaurados e conferidos por hash.
- **Diferencial contra o FREEZE-5:** 192 casos, 184 iguais e 8 diferentes, todos explicados:
  - F02: DEV-67 e DEV-68;
  - F01: DEV-72;
  - FC-01: D08, D12, D15, D16 e DEV-69.
- **Conformidade:** R7-B, R7-B.1 e R7-B.2 PASS.
- **Nenhum parâmetro numérico novo.**

## 6. Revisões independentes

Do candidato `c7c72e5`, gravadas em `d569ef2`.
- **SSCTR:** r1, depois r2, ACCEPT_WITH_CONDITIONS, sem achado bloqueante.
  - O r2 julgou que os caminhos P8 (sessão de entrada pulada) e P9 (linha com carga feita sem carga utilizável) ficam dentro de `strengthEntryWeek`, D52 e D55. Não houve ajuste estreito.
  - Condições do freeze: CF1 e as divulgações de cobertura CFD-1 a CFD-5.
  - Outras condições: C1 a C4. A C1 traz as condições de consumidor da CND-4 da Fase 4.
- **Qualidade:** READY_WITH_CONDITIONS, achados F01 a F05, nenhum bloqueante.
  - A K-P5-F1 foi atendida pelo r2 do SSCTR.
  - A K-P5-F2 pede que o freeze vincule a pasta como ficou.
  - Ficaram para depois: K-P5-1 (os testes J3, J1 e o controle do T46), K-P5-2 (a contagem do gêmeo do P06 no julgamento) e K-P5-3 (as formas P8 e P9 lidas como o SSCTR decidiu).

## 7. Novo freeze e verificação

- **R7D-FREEZE-6** (`40daadd`), uma designação nova; o FREEZE-5 não foi reutilizado.
  - Vincula `d569ef2`: 727 arquivos.
  - `sourceDigest` f601f16b…d1c1, `manifestDigest` be0765b6…e928, registro 48536551…e9a5.
  - Criado em 2026-11-08T14:03:19.912Z.
  - As condições das revisões vão no registro palavra por palavra.
- **Verificação** (`aedcd5c`): `verify-r7d-6 --suite`, 25/25 PASS, antes de o autor começar.
- **No julgamento:**
  - o QRE rodou de novo só para leitura: 24/25. Só `no-new-holdout` falha, por desenho, porque `final2/` agora existe;
  - o runtime avaliado confere 727/727 e `runtimeDiff` está vazio.

## 8. Validade, cobertura e resultados do novo holdout

**Protocolo.**
- **Critérios registrados antes dos casos:** PREREG-8, em `c7c72e5`.
- **Autor:** uma instância nova.
  - Leu só o brief 8, a interface 8 e o esquema, e rodou os checadores sem lê-los.
  - Escreveu só em `final2/`. Começou às 14:05:56Z, depois do freeze, e selou às 15:48:13Z.
- **Corpus H1** (R7D-FINAL-2):
  - 39 casos e 130 passos;
  - `check-corpus` com 0 erros e 0 avisos;
  - 15 avisos do checador 8 mantidos com o motivo nas notas;
  - o builder reproduz o corpus byte a byte.
- **Divulgação do autor:** o host colocou no contexto dele os dois `CLAUDE.md` e o índice de memória, com resumos de uma linha das fases anteriores e nomes de achados.
  - O QRE julgou que isso não afeta a validade: os arquivos não trazem caso, código nem saída, e o brief já apontava as mesmas áreas.
  - A letra do PREREG-1 §8.2 ("nunca achados") não foi cumprida de forma passiva.
  - Daí a condição de processo K-QRE-P5H-07.
- **Selo** (`56df0a1`, R7D-SEAL-FINAL-2), antes de qualquer execução. O H2 tem 300 cadastros, com seed tirada do digest do freeze.
- **Avaliação única** (`0ab7bc4`): `--first-evaluation`, em diretórios novos, sem `--allow-runtime-diff`, `evaluationCount 1`, sem ajuste.

**Resultados.**
- **H1:**
  - 39/39 avaliados;
  - 0 erros de corpus e 0 erros do harness;
  - nenhuma violação de propriedade ou de relação;
  - expectativas do autor: 191 PASS, 11 FAIL e 70 JUDGED, todas classificadas pelo SSCTR (seção 9).
- **H2:** 300/300, sem violação.

**As quatro contagens, separadas** (as mesmas nos dois juízes):

| Contagem | Resultado |
|---|---|
| Falhas reais do runtime | **0** (à parte: 2 SUBOPTIMAL atribuídos ao escopo de autoridade, não bloqueantes) |
| CORPUS_ERROR | **0** |
| Lacunas de instrumento | **0** unidades HARNESS_GAP. 9 lacunas de interface anotadas pelo autor, nenhuma tirou unidade |
| NOT_EVALUABLE (nunca aprovação) | **H1: 28 unidades em 10 casos** (P03 11, P06 14, P08 2, P18 1; resultado de caso do P08 NOT_EVALUABLE em H18 e H19). **H2: 47** unidades P06. P14 com consentimento não exercido. O SSCTR leu o domínio de todas como PASS, mas elas continuam não avaliáveis |

**Cobertura: atendida nos dois julgamentos**, por casos válidos e avaliáveis.
- **Unidades contadas:**
  - CARRIER_CLINICAL 3 e CARRIER_HOLD 2;
  - P08 53;
  - P17 112, com RESTATE_DECLARED_BREAK 41;
  - P18 70, com INSERT_NEWER_BREAK 7;
  - P18 nos casos do PREREG-5 Δ3: 15;
  - grupos (a) e (b) do PREREG-6 Δ5: 28 e 14.
- **Mecanismos que se perderam:** cinco casos não exercitaram o que o autor pretendia. Outros casos cobrem cada item afetado.
  - H07, pela trava clínica;
  - H20, H32 e H34, pela triagem do motivo;
  - H28, cuja semana de prova não planejou força.
- **Uma cláusula depende de leitura: PREREG-6 Δ5 (c),** "retorno relatado no meio da semana depois de sessões dessa semana não feitas".
  - Os dois juízes, cada um por conta própria, contam H06, H08 e H11, lendo como não feitas as sessões de dentro da pausa declarada. É a leitura do brief e da fonte da cláusula (SSCTR-P34-F01).
  - Na leitura mais estreita que o juiz de qualidade da Fase 4 usou, só H06 conta, e o holdout seria INVALID_HOLDOUT. O SSCTR da Fase 4 deu a mesma cláusula como atendida "pela letra".

## 9. Julgamento científico

SSCTR-R7D-FINAL-HOLDOUT-2-r1: **READY_WITH_CONDITIONS** (lado de domínio), sem achado bloqueante. Não há SAFETY, SCIENTIFIC nem GENERALIZATION blocker, nenhum passo UNSAFE e nenhum CORPUS_ERROR.

**Rubrica: 23 BEST_SUPPORTED, 14 ACCEPTABLE_ALTERNATIVE e 2 SUBOPTIMAL.** Os dois SUBOPTIMAL são atribuídos ao escopo de autoridade, então não bloqueiam (§4.4):
- **H07:** "cuidando da minha mãe depois da operação" é triado como clínico, e a R-F08-1 prende a rota. É o falso positivo de texto livre divulgado.
- **H28:** a semana de prova não planeja força e mesmo assim conta como reentrada de força só pela corrida. É a BR-Q4.4 lida ao pé da letra, uma questão de política e não de segurança (O02).

**As 11 expectativas que falharam:** nenhuma é falha do runtime.
- Nove são ACCEPTABLE_ALTERNATIVE:
  - H04: pergunta, em vez de replanejar, uma janela de uma data;
  - H17: KEEP está certo, porque a substituição já tinha sido feita;
  - H20, H32 e H34: a triagem pergunta por uma palavra ambígua ("back", "feet", "baby"), e o caso nunca responde.
- Duas são EXPECTATION_OUTSIDE_AUTHORITY (H07, F08).

**Perguntas do Founder:**
- **Progressão de corrida:** coerente.
- **Progressão de força:** coerente onde a carga é conhecida. As cargas de halteres registradas por padrão não são avaliáveis.
- **Interferência:** tratada dentro dos dias escolhidos.
- **Fadiga e recuperação:** respostas proporcionais.
- **Capacidade demonstrada:** preservada.
- **Retorno depois de pausas:** seguro em todo caso válido.
- **Progressão sem evidência:** não houve.
- **Autoridades existentes:** compatível com a política R6, o catálogo B0, a F03B-MACHINE-STEP-r1 e as leituras BR-Q, com a borda da BR-Q4.4 encaminhada.

**Condições:**
- **CND5-1:** condições de consumidor:
  - uma projeção REQUIRES_RECONCILIATION nunca é mostrada como prescrição;
  - relatos enviados sob sinal clínico são reenviados depois da liberação (H18 e H19 perderam os seus);
  - a confirmação no mesmo turno;
  - o texto da pergunta de motivo e do HOLD da última semana.
- **CND5-2:** integridade é do QRE.
- **CND5-3:** os achados O01 a O04, encaminhados.
- **CND5-4:** a forma mista do F13 fica nos testes.
- **CND5-5:** sem autoridade V1, sem validação, F08 aberto.

O item de fila HQ-R7D-SSCTR-P5-HOLDOUT-2-JUDGMENT foi só proposto. A literatura usada (duas fontes) foi lida no nível do resumo.

## 10. Julgamento de qualidade

QRE-R7D-FINAL-HOLDOUT-2-r1: **READY_WITH_CONDITIONS** (lado de qualidade), sem achado bloqueante.
- **Integridade do freeze:** PASS.
- **Integridade do protocolo:** PASS.
  - Os selos, os manifestos e os bytes conferem no commit do selo.
  - O autor começou depois do freeze e dos instrumentos. O selo veio antes da avaliação, e a avaliação foi única.
  - A cadeia de commits de `c7c72e5` a `79d7652` é linear.
- **Instrumento confiável:**
  - o HARNESS-9 difere do 8 só como o Δ48 e o Δ49 dizem;
  - o K03 nunca vira PASS;
  - a validação 9 foi refeita nos bytes congelados.
- **K-P5-2:** 0.
- **Determinismo:** os 39 + 300 digests foram recalculados num processo novo.

**Achados não bloqueantes:**
- **QRE-P5H-F01** (OBSERVATION, preexistente): a pergunta da triagem de motivo não leva à própria saída.
  - Ela pede `reasonCategory`, que o atleta já deu.
  - A saída existe: reenviar a pausa com texto simples.
  - Explica 7 das 11 expectativas que falharam.
- **QRE-P5H-F02** (OBSERVATION): um conflito duplo datado pede campos que nada define.
- **QRE-P5H-F03** (CONSUMER_CONDITION): no H38, a correção de uma contradição nomeia o relato que o registro deixou em quarentena. A sessão continua em conflito e sem crédito.
- **QRE-P5H-F04** (resíduo registrado do envelope R4 HOLD): no H05 s4, o HOLD da última semana sai de um TypeError interno, relatado como "Malformed review facts".
- **QRE-P5H-F05** (resíduo R-F08-1/F08): o falso positivo clínico do H07.

**Condições:**
- K-QRE-P5H-01 a -03: contratos de pergunta e de correção, para o dono da interface com G03/PCG;
- -04: listagem do harness;
- -05: os testes K-P5-1;
- -06: uma regra explícita de última semana no lugar do caminho de erro;
- -07: processo dos próximos autores;
- -08: não avaliável conta pelo SSCTR;
- -09: condições de consumidor.

## 11. Estado final do R7-D

**R7D_FINAL_STATUS = READY_WITH_CONDITIONS**, compilado dos dois registros (PREREG-1 §4; PREREG-8 Δ55):

| Critério | Resultado |
|---|---|
| 1. Violações confirmadas de P01–P14 = 0 | passa |
| 2. Relações e determinismo = 0 | passa |
| 3. SAFETY, SCIENTIFIC e GENERALIZATION blockers = 0 | passa |
| 4. Todo caso avaliável BEST_SUPPORTED ou ACCEPTABLE_ALTERNATIVE, ou SUBOPTIMAL que não bloqueia (§4.4) | passa: 37 + 2 SUBOPTIMAL atribuídos ao escopo de autoridade |
| 5. CORPUS_ERROR e cobertura crítica | passa: 0 erros, cobertura atendida (com a leitura da seção 8) |
| §9. Nenhum bloqueio no holdout final | passa |

As condições são todas de classes não bloqueantes: CONSUMER_CONDITION, KNOWN_DISCLOSED_RESIDUAL, POLICY_QUESTION fora de segurança, TEST_GAP fora de segurança e OBSERVATION.

**Os quatro estados, separados:**

| Estado | Situação |
|---|---|
| 1. R7-D concluído | **Sim**, READY_WITH_CONDITIONS. Nenhuma rodada R7-D nova (Δ57) |
| 2. Runtime validado no escopo do R7-D | **Sim, com condições**, como referência sombra sintética, sob autoridade interna provisória, sem validação humana ou empírica |
| 3. Capacidades adicionais da V1 pendentes | **Sim** (seção 13) |
| 4. App pronto para usuários reais | **Não** |

- **R7D-FREEZE-6 é o estado congelado final do R7-D.**
- `V1_COACHING_AUTHORITY_READY` = **NO**; este gate não a muda.
- F08 = **F08_OPEN**: a direção D2 do Founder está registrada e não implementada.

## 12. Limitações residuais

- **A cobertura depende de uma leitura** (seção 8). Se o Founder adotar a leitura mais estreita do PREREG-6 Δ5 (c), o holdout é INVALID_HOLDOUT e o R7-D fecha NOT_READY, sem nova rodada (Δ57).
- **Fica só nos testes:** a forma mista do F13, CFD-3 e CFD-4 (T42–T44), não no holdout.
- **Não exercido ou só no H2:**
  - P14 com consentimento não foi exercido;
  - LOAD_CONVENTION_EQUIVALENT só tem evidência no H2;
  - as cargas de halteres registradas por padrão não são avaliáveis (lacuna de interface 2).
- **Respostas sem evidência no holdout além das testemunhas dos juízes:**
  - a triagem de motivo deixou três retornos sem aplicar;
  - o reenvio com texto simples que sai da pergunta;
  - a confirmação de carga do F03-B (H03).
- **Resíduos do runtime, encaminhados e não bloqueantes:**
  - o HOLD da última semana por erro interno (H05);
  - o contrato de correção de contradição (H38);
  - campos indefinidos no conflito duplo (H04);
  - O02, a força depois de uma semana de prova sem força;
  - O03, o passo na semana seguinte a um retorno vazio;
  - O04, uma pausa de cadastro abaixo de quatro semanas que não é reduzida.
- **Independência do autor:** é declarada pelo próprio autor, com a exposição passiva ao contexto do host já divulgada.
- **Autoridade:** julgamentos internos provisórios, sem validação humana, clínica ou empírica, sobre um runtime sintético usado só como referência sombra.

## 13. Próximo passo exato

**Decisão do Founder sobre a próxima missão funcional.** O R7-D está fechado e nada se abre sozinho.

O que segue com o fechamento, como entrada dessa missão:
- **Condições de consumidor:** valem para qualquer consumidor do runtime (SSCTR r2 C1, CND5-1, K-QRE-P5H-09).
- **Contratos de pergunta e de correção:** K-QRE-P5H-01 a -03 e O01, para o dono da interface com G03/PCG. A K-QRE-P5H-06 pede a regra explícita da última semana.
- **Testes e harness:** os testes K-P5-1 e a listagem K-QRE-P5H-04, no próximo harness registrado. A K-QRE-P5H-07 vale para o próximo autor de holdout.
- **Política:** O02 a O04, para o SSCTR e o dono da política.
- **Missões separadas, fora desta:**
  - o F08, na missão já preparada (`phase35/f08/F08_MINIMAL_DELTA_AND_MISSION.md`);
  - os três perfis de treinador e os controles de volume e dificuldade;
  - a apresentação do plano e a auditoria Figma × Motor, com o Figma ainda não aprovado;
  - o enquadramento comercial.
- **Push da branch:** só com autorização do Founder.

## 14. Estado do Git

- Branch `claude/domain-coaching-r7-d`, **sem push e sem merge**.
- Nada foi apagado. Worktrees, freezes e registros históricos estão intactos.

**Commits da fase:**
- `094732d`: resumo da autorização;
- `240f151`: runtime, F01, FC-01 e F02, com os testes T42–T47 e T39–T41 na suíte;
- `dc6fe1d`: ajuste de runtime pela evidência de mutação;
- `c7c72e5`: candidato e instrumentos (HARNESS-9, validação 9, INTERFACE-8, brief 8, checador 8, selo 2, PREREG-8, freeze-r7d-6 e verify-r7d-6), mais a evidência da fase;
- `d569ef2`: as revisões independentes do candidato;
- `40daadd`: R7D-FREEZE-6;
- `aedcd5c`: verificação 25/25;
- `56df0a1`: selo do H1 e do H2, com o relatório do autor;
- `0ab7bc4`: a avaliação única;
- `79d7652`: o pedido de julgamento;
- `1958005`: os dois julgamentos;
- o commit deste checkpoint, com o acréscimo em CURRENT_MISSION e MISSION_LEDGER, só de inserção.

**Arquivos principais:**
- runtime: `CoachingCore/src/r6-adaptation.mjs`, `r6-program.mjs` e `r6-composition.mjs`;
- testes: `CoachingCore/test/r7d-phase5.test.mjs`;
- freeze: `CoachingCore/r7/d/RUNTIME_FREEZE_R7D_6.json` e `VERIFICATION_R7D_6.json`;
- harness: os arquivos novos `harness/r7d-harness-9.mjs`, `lib/client-9.mjs`, `lib/properties-9.mjs`, `lib/metamorphic-9.mjs`, `seal-final-2.mjs` e `validation/*_9`;
- autoria: `author/INTERFACE_DELTA_R7D_8.md`, `AUTHOR_BRIEF_FINAL_R7D_8.md` e `check-corpus-8.mjs`;
- `PREREGISTRATION_R7D_8.md`;
- `phase5/`: autorização, pedidos, evidência, revisões e relatório do autor;
- `final2/`: corpus, manifestos, selos, avaliação e julgamentos;
- este checkpoint.
