# R7-D — pré-registro do gate final (`R7D-PREREG-1`)

**Status:** pré-registro.
- Escrito na Fase 2, antes de qualquer holdout final.
- O SHA-256 deste arquivo fica no checkpoint da Fase 2. O gate final (Fase 4) usa exatamente estes bytes, ou uma versão nova registrada **antes** de o holdout final existir.

**Fontes:**
- PHASE1_CHECKPOINT (P01–P14, taxonomia, estratos);
- decisões do Founder na autorização da Fase 2 (critérios, diagnóstico, correção);
- Scenario Lab §2, §5, §6, §8;
- AEOS §9, §14;
- R7C_HANDOFF (condições e envelopes).

**Instrumentos vinculados:**

| Instrumento | Onde |
|---|---|
| Interface do autor `R7D-INTERFACE-1` | `author/` |
| Esquema `R7D-CASE-1` | `author/` |
| Harness `R7D-HARNESS-1` | `harness/`, com a validação em `harness/validation/` |
| Gerador `R7D-GENERATOR-1` | `harness/` |

O runtime avaliado é o freeze final que poderá chegar à produção (hoje R7C-FREEZE-4; um sucessor só com a Fase 3 autorizada).

## 1. Propriedades

Cada propriedade é uma relação sobre a saída do runtime, nunca "a saída foi X", e termina em PASS, FAIL ou NOT_EVALUABLE.
- **NOT_EVALUABLE** não vira PASS e fica no denominador.
- **Envelopes:** valem só os registrados (§6). Fora deles, um FAIL automático confirmado na triagem é violação. Dentro, é KNOWN_DISCLOSED_RESIDUAL ou CONSUMER_CONDITION.

| # | Propriedade (autoridade) | Tipo | Escopo do input | Observável e mecanismo | Classe de bloqueio |
|---|---|---|---|---|---|
| P01 | Clínico primeiro (R7B2-C2/C4; C3; AEOS HC03; G04) | AUTOMATED; a liberação aplicada sem reenvio entra pelo P05 | Rotas clínicas e decisões seguintes | **(a)** status CLINICAL_HUMAN_REQUIRED sem programa nem proposta, e REQUIRES_RECONCILIATION. **(b)** Rota clínica de pé: toda decisão até a liberação qualificada continua CLINICAL, sem proposta | SAFETY_BLOCKER |
| P02 | Elegibilidade e escopo (CLAUDE.md SSCTR; SCOPE-EXCLUSIONS; HC02) | AUTOMATED | Intake e elegibilidade de cada decisão; pausa clínica; substituição com dor | **Onboarding:** nada prescrito com elegibilidade desconhecida, sinal clínico ou fora do escopo; rota esperada CLINICAL, UNSUPPORTED ou ASK. **Decisões:** flag clínica → CLINICAL; desconhecida → nunca VALID nem CLINICAL; pausa clínica → CLINICAL | SAFETY_BLOCKER |
| P03 | Desconhecido ≠ executado ≠ zero (SSCTR-SD-R7C-r2; DR-118; AEOS §3–4) | AUTOMATED | Registro e decisões | **(a)** Toda linha do registro vem de um relato do cliente, com o mesmo `completed`. **(b)** Nenhuma revisão credita (ADVANCE/EARNED) um papel ou exercício sem relato na semana. **(c)** A pergunta UNREPORTED_TRAINING não pergunta por sessão relatada. **(d)** Nenhuma decisão VALID planeja dose de corrida sem corrida concluída na janela do teto enquanto há corridas vencidas sem relato fora de pausa declarada. Ficam fora as semanas WALK_JOG, RESTART e RETURN (receita própria; CC-F05) | GENERALIZATION_BLOCKER; SAFETY_BLOCKER se a dose sobe |
| P04 | Validade marcada (premissa da C2; QE-R7C-13) | AUTOMATED | Toda decisão | ASK, HOLD, UNSUPPORTED, CLINICAL, pergunta ou pendência → REQUIRES_RECONCILIATION | SAFETY_BLOCKER |
| P05 | Independência do portador (C3; QE-R7C-07/-10) | AUTOMATED (metamórfico) | Toda resposta a UNREPORTED_TRAINING; toda decisão com relatos registrados | Ver CARRIER_CLINICAL, CARRIER_HOLD e RESEND (§2) | GENERALIZATION_BLOCKER; SAFETY_BLOCKER acima do teto, ou com toque de prova ou qualidade no taper |
| P06 | Teto de corrida única D18 (policy `operational.run.singleRunCeiling`; C9; C11) | AUTOMATED | Decisões VALID e o onboarding | **Teto:** maior corrida concluída nos `windowDays` (30) antes da semana + `stepMinutes` (5).<br>**Referências:** registro, maior corrida do intake, corridas conhecidas, histórico e demonstração.<br>**Semanas checadas:** a semana atual, da data da decisão em diante, e a seguinte quando a revisão fecha a semana.<br>**Isentas:** prova, walk e walk/jog.<br>**Sem referência na janela:** NOT_EVALUABLE | SAFETY_BLOCKER |
| P07 | Fase perto da prova (pedido R7-A §17; D54; JUDGE-CQ-R6-06; policy `operational.event`) | AUTOMATED; prova de conclusão sem strides é DOMAIN_JUDGED | Planos com prova | **Semana da prova:** é RACE_WEEK, com a sessão RACE na data.<br>**Taper e pós-prova:** não são substituídos sem mudança de prova ou de objetivo.<br>**Força em RACE_WEEK e POST_EVENT:** ≤ `raceWeekStrengthSets`/`postEventStrengthSets` séries, RIR ≥ `raceWeekStrengthMinimumRir`, e na semana da prova pelo menos `raceWeekStrengthMinDaysBeforeRace` dias antes | SAFETY_BLOCKER |
| P08 | Retorno E1 (R7-A inv. 3 e 6; D17/D18) | AUTOMATED (corrida); força e identidade da interrupção são DOMAIN_JUDGED | RETURN_AFTER_PAUSE VALID adotado | As corridas da primeira semana do retorno não passam da maior corrida executada e tolerada antes da pausa (ou da demonstração) | SAFETY_BLOCKER |
| P09 | Progressão merecida (R7-A inv. 4; D53/D56; HC06) | AUTOMATED (evidência do gate); tamanho do passo é DOMAIN_JUDGED, e a corrida é limitada pelo P06 | Revisões semanais | Todo ADVANCE/EARNED com relato tem ao menos uma execução concluída sem resposta adversa nem UNDER | GENERALIZATION_BLOCKER |
| P10 | História (R7-A inv. 1, 2, 4, 5; AEOS §3, §14) | AUTOMATED | Decisões adotadas; registro | Sessões passadas e histórico de decisões intactos. Linhas anteriores do registro presentes e iguais. Supersessão só por correção enviada. `firstRecordedAt` nunca avança | GENERALIZATION_BLOCKER |
| P11 | Repertório (autoridade B0; HC02) | AUTOMATED | Todo plano em vigor | **Pertença:** família de corrida e exercício no R7B0-CATALOG-2.<br>**Equipamento:** disponível na data.<br>**Habilidade:** NONE/NOVICE → LOW; INTERMEDIATE/EXPERIENCED → até MODERATE; HIGH só familiar ou por degrau aceito | GENERALIZATION_BLOCKER; SAFETY_BLOCKER fora da elegibilidade |
| P12 | Composição híbrida (DR-112; UXS ONB-21) | AUTOMATED (dias, turnos); interferência CMP é DOMAIN_JUDGED | Todo plano em vigor | **Dias:** cada sessão num dia escolhido do seu esporte. Mudança de agenda vale a partir da semana seguinte; na semana da mudança, qualquer dos dois conjuntos. Movida para dia do outro esporte = OBSERVATION.<br>**Mesmo turno:** confirmado, ou com BACK_TO_BACK_CONFIRMATION pedida pelo plano para aquele dia (CONSUMER_CONDITION) | GENERALIZATION_BLOCKER |
| P13 | Determinismo e equivalências (AEOS §14, HC04, HC10; Scenario Lab §5; DR-123) | AUTOMATED (+ metamórfico) | Todos os casos | Toda linha do registro com `provenance.firstRecordedAt`. Integridade: input não mutado, `applied=false`, sem efeito oficial. Exceção do runtime = DIRECT_RUNTIME_DELTA. Ver também DETERMINISM, PERMUTE, DUPLICATE, RENAME e CONVENTION | GENERALIZATION_BLOCKER (DIRECT_RUNTIME_DELTA) |
| P14 | Aprendizado no envelope (R7-C G02; AEOS §15, §17) | AUTOMATED; influência com consentimento é DOMAIN_JUDGED | Casos com modelo | Sem consentimento: `purposeAllowed` falso e nenhum padrão aprendido. CONSENT_OFF em casos LEARNING_NOISE: decisões iguais | GENERALIZATION_BLOCKER |
| P15 | Translação de calendário | PROPOSED_ONLY | — | CALENDAR_SHIFT, diferenças reportadas | Nunca bloqueia nesta versão |

**CONSUMER_ONLY** (nunca falham o runtime):
- C2: apresentação com REQUIRES_RECONCILIATION;
- C3, parte de consumidor: carregar o registro como devolvido, o caminho de resposta, cadência e redação;
- C4: rótulo MISSED;
- C9 e C11: apresentação das semanas seguintes como provisórias;
- a confirmação de mesmo turno pedida pelo plano.

A R7-D falha o runtime quando a **premissa de runtime** dessas condições é falsa: P01, P04, P05, P06 e P13.

## 2. Relações metamórficas e determinismo

Aplicadas mecanicamente a todo caso elegível, derivadas das autoridades e não dos casos. As variantes ficam no mesmo split do caso.

| Relação | Propriedade | Comparação | Bloqueia |
|---|---|---|---|
| DETERMINISM | P13 | Duas execuções, saídas byte a byte iguais | Sim |
| PERMUTE_OBSERVATIONS | P13 | Relatos em ordem inversa em cada decisão: todas as decisões e planos iguais | Sim |
| DUPLICATE_SECOND_SOURCE | P13 | Cada relato concluído chega também de um segundo aparelho (mesmos valores, outro id): iguais | Sim |
| RENAME_OPAQUE_IDS | P13 | Ids de atleta, evento, relato e atividade e nomes de provider trocados: iguais, sem ids | Sim |
| LOAD_CONVENTION_EQUIVALENT | P13 | Carga conhecida de par de halteres em PER_HAND ↔ TOTAL (mesma massa): mesma massa inicial e decisões iguais, exceto os valores de carga posteriores do exercício trocado, que seguem o incremento da convenção declarada (policy `loadUnits` e `smallestIncrement`; HV-01) | Sim, no escopo |
| RESEND | P05 | Cada decisão reenvia os relatos que a anterior **registrou**: iguais | Sim |
| CARRIER_CLINICAL | P05, P01 | A resposta a UNREPORTED_TRAINING vai numa substituição com dor (CLINICAL), seguida de liberação qualificada. Na primeira decisão elegível e nas seguintes: plano, validade e pergunta iguais à resposta direta | Sim |
| CARRIER_HOLD | P05 | Resposta na última semana registrada por uma mudança de agenda recusada (HOLD): igual na decisão seguinte | Sim |
| CONSENT_OFF | P14 | Consentimento desligado: iguais nos casos LEARNING_NOISE; nos demais, a diferença vai ao juiz | Só LEARNING_NOISE |
| CLOCKLESS_CONTROL | C3 legado | O registro perde `firstRecordedAt`: as diferenças são a cláusula legada da C3 (CONSUMER_CONDITION). Controle pequeno, nunca gate | Não |
| CALENDAR_SHIFT | P15 | Todas as datas uma semana antes; comparação sem datas | Não |
| VARIANT (do autor) | Oráculo do autor | SAME_PLAN / NOT_HIGHER_RUN_LOAD / NOT_LOWER_RUN_LOAD no passo indicado | Oráculo de domínio: triado |

"Mesmos fatos → mesmo plano" entre linhas do tempo diferentes vale como P05 e P13. A divergência dentro dos envelopes (§6) não é violação.

## 3. Taxonomia de achados

Cada achado recebe:
- **uma classe:** GENERALIZATION_BLOCKER, DIRECT_RUNTIME_DELTA, SAFETY_BLOCKER, SCIENTIFIC_BLOCKER, CONSUMER_CONDITION, KNOWN_DISCLOSED_RESIDUAL, TEST_GAP, HARNESS_GAP, CORPUS_ERROR, POLICY_QUESTION ou OBSERVATION;
- **uma origem:** NEW, PRE_EXISTING ou KNOWN_R7C_RESIDUAL.

As definições e efeitos são os do PHASE1_CHECKPOINT (FAILURE_TAXONOMY), com dois acréscimos:
- **HARNESS_GAP:** defeito do próprio harness. Corrige-se o harness e o caso volta como não avaliado, nunca a favor do runtime.
- **INVALID_HOLDOUT** (§7): invalida o gate.

**Estrutural:** pelo menos 2 casos base independentes, ou 1 caso com o mecanismo reproduzido pelo juiz numa testemunha mínima.

## 4. Critérios de sucesso do holdout final (decisão do Founder)

A R7-D só fecha READY se **todos** valerem:

1. **Propriedades:** violações confirmadas de P01–P14 = 0.
2. **Metamórficas e determinismo:** violações = 0.
3. **Bloqueios:** SAFETY_BLOCKER = 0, SCIENTIFIC_BLOCKER = 0 e GENERALIZATION_BLOCKER = 0, e nenhum achado equivalente que torne o runtime inadequado na autoridade atual.
4. **Qualidade de domínio:** todo caso avaliável recebe BEST_SUPPORTED ou ACCEPTABLE_ALTERNATIVE.
   - SUBOPTIMAL ou pior bloqueia só se for, ao mesmo tempo, atribuível ao runtime, num caso válido, não mera ambiguidade do corpus e dentro da autoridade que o runtime deve cobrir.
   - **Não existe meta percentual de BEST_SUPPORTED.**
5. **CORPUS_ERROR:**
   - não é falha do runtime e o caso não conta como evidência;
   - se a perda comprometer cobertura crítica (§7), o holdout é INVALID_HOLDOUT e será substituído por um corpus novo e independente;
   - **nunca se corrige o runtime em resposta a um CORPUS_ERROR.**

**Estados:**
- READY, sem resíduo;
- READY_WITH_CONDITIONS: só condições não bloqueantes, como CONSUMER_CONDITION, KNOWN_DISCLOSED_RESIDUAL, POLICY_QUESTION não de segurança, TEST_GAP fora de segurança e OBSERVATION;
- NOT_READY;
- INVALID_HOLDOUT.

`V1_COACHING_AUTHORITY_READY` não muda por este gate.

## 5. Rubrica de domínio

O juiz de domínio (SSCTR, na autoridade provisória não clínica) dá a cada caso avaliável uma classe. A referência é a `independentAssessment` do autor, escrita antes de qualquer saída, lida contra as autoridades.

| Classe | Quando |
|---|---|
| BEST_SUPPORTED | A melhor conduta sustentada pela evidência e pela policy para este atleta |
| ACCEPTABLE_ALTERNATIVE | Diferente da preferida, mas defensável e segura |
| SUBOPTIMAL | Segura, mas pior que uma alternativa disponível na autoridade, por razão nomeada |
| INSUFFICIENT_INFORMATION | O juiz não consegue decidir com o que o caso traz |
| UNSUPPORTED | O caso pede competência fora da V1 e o runtime não roteou corretamente; ou o roteamento a UNSUPPORTED foi indevido |
| CLINICAL_OUT_OF_SCOPE | A adequação depende de juízo clínico; equivale a NOT_EVALUABLE_DOMAIN |
| UNSAFE | Recomendação insegura; marcada explicitamente; SAFETY_BLOCKER |
| CORPUS_ERROR | O caso é inválido pela interface, ou a expectativa contradiz a interface ou a autoridade |
| NOT_EVALUABLE_DOMAIN | Sem resposta de domínio afirmável; nunca libera nem bloqueia |

Para cada SUBOPTIMAL ou pior, o juiz registra:
- a causa;
- a atribuição: RUNTIME, CORPUS, AMBIGUITY ou AUTHORITY_SCOPE;
- se é estrutural.

Preferência subjetiva não vira asserção rígida. Uma expectativa HARD do autor que falha vai ao juiz e não bloqueia por si.

## 6. Envelopes registrados

Dentro destes envelopes um caso fresco é KNOWN_DISCLOSED_RESIDUAL ou CONSUMER_CONDITION. Fora deles, é achado novo.

| Item | Envelope |
|---|---|
| QE-R7C-08 / CC-F04 | Progressão creditada abaixo do teto em decisões fora da revisão, até a revisão da semana (C7) |
| QE-R7C-12, P7-F02 | Semana seguinte condicional até 1 passo ou 1 degrau acima da revisão; nunca na semana da resposta; nunca toque de prova (C9) |
| QE-R7C-13 | Re-plano ao lado de pergunta sobre semana posterior, sempre com REQUIRES_RECONCILIATION |
| QE-R7C-15, P7-F03 | Só no mundo sem relógio (C3 legado) |
| QE-R7C-16 | Relator atrasado de corridas curtas: aumentos de 3 a 5 min em semanas futuras, VALID até a revisão, nunca na semana atual (C11 b) |
| QE-R7C-18 | Correção registrada por rota clínica aplicada na revisão da semana (C3) |
| C8 / SD5-02 | Sinal retido descartado quando a resposta chega fora da revisão com VALID |
| C5 | Substituição não clínica com pergunta de corrida pendente |
| HOLD do R4 | Agenda na última semana → HOLD com REQUIRES_RECONCILIATION; a resposta vale na decisão seguinte |
| D1 | Terceira sessão-chave adversa no meio da semana: sem mudança até a revisão |
| P7-F04 / R3 | Resposta toda adversa: um passo acima da leitura revisada, abaixo do plano guardado e do EXEC |
| R1 (C9) | Recomposições de handler (EXERCISE_SUBSTITUTION, RETURN_AFTER_PAUSE curto, EVENT_DATE_CHANGE) mantêm a projeção de b+1 até a primeira decisão de b+1, que pergunta ou re-planeja dentro do teto |
| R2, B1, B2, CC-F05, P6-F03/F04, CC-F06 | Como em R7C_HANDOFF (C7) |
| P7-F06 | Qualidade se compara por degrau da escada, não por minutos |
| HV-01 | Progressão de carga declarada em TOTAL num par de halteres segue o incremento TOTAL (policy) |

## 7. CORPUS_ERROR e cobertura crítica

**Fontes de CORPUS_ERROR:**
- erro estrutural no checador (`check-corpus.mjs`);
- referência de sessão sem correspondência no plano;
- relógio fora do programa ou da janela;
- expectativa que contradiz a interface;
- caso que o juiz declara inválido.

O caso sai do numerador e fica no relatório.

**Cobertura crítica (INVALID_HOLDOUT se perdida):**
- todo estrato com propriedade de segurança (clínico e escopo, retorno, transição de prova, longitudinal com resposta) mantém pelo menos 2 casos base avaliáveis;
- nenhum dos estratos do H1 fica com zero caso avaliável.

## 8. Protocolo do holdout selado (Fase 4)

1. **Momento:** o holdout nasce só depois do último freeze que pode chegar à produção.
2. **Autoria:**
   - autor novo, instância nova, que não é o autor do runtime, nem do harness, nem de corpus anterior, nem juiz;
   - lê só a interface, o esquema e um brief FINAL derivado deste pré-registro;
   - recebe estratos, nunca achados nem casos.
3. **Composição:**
   - **H1:** 32 a 36 casos base, nos estratos do PHASE1_CHECKPOINT (SEALED_HOLDOUT), com `independentAssessment`.
   - **H1-M:** as relações do §2.
   - **H2:** 250 a 300 intakes gerados pelo `R7D-GENERATOR-1` com rótulo `FINAL` e seed `sha256('R7D-SAMPLE|FINAL|' + manifestDigest do freeze final)`.
4. **Manifesto de frescor:** `R7D-FRESHNESS-MANIFEST-1`, com:
   - autor e papel; protocolo; entradas permitidas e proibidas;
   - `authorStartedAt` depois do freeze; `sealedAt`;
   - digest do freeze; SHA-256 do corpus; contagem; tags; método; seed;
   - `evaluation.evaluationCount = 0`.
5. **Selo:** SHA-256 dos bytes do corpus e digest do manifesto (sem o bloco `evaluation`) em `SEAL.json`, num commit antes de qualquer execução.
6. **Avaliação única:** `r7d-harness.mjs --first-evaluation`, que exige `evaluationCount 0`, escreve num diretório novo e grava `evaluationCount 1`.
7. **Juízes em paralelo:**
   - QRE: integridade, harness e propriedades;
   - SSCTR: domínio, rubrica e bloqueio científico.

   O coordenador não dá nota.

## 9. Regra de não-tuning

Depois do selo e da avaliação do holdout final:
- não se corrige o runtime para reusar o mesmo holdout;
- não se transformam casos em testes de regressão antes da decisão;
- não se ajustam oráculos, envelopes, rubrica, limiares ou critérios.

Um bloqueio no holdout final dá `R7D_STATUS = NOT_READY`. Uma correção futura exige autorização nova, freeze novo e holdout novo e independente.

Mudanças no harness depois deste pré-registro exigem nova versão registrada **antes** de o holdout final existir, e nunca em resposta a uma saída do holdout final.

## 10. O que este pré-registro não contém

- Casos finais.
- A seed final: só a regra, porque ela depende do freeze final.
- A decisão sobre `V1_COACHING_AUTHORITY_READY`.
