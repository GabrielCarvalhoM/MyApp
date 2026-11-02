# R7-D · Fase 1 — checkpoint (2026-11-02)

**Autoridade.** Pedido direto do Founder (DOMAIN COACHING — R7-D · FASE 1): só investigação, delimitação e plano de validação.
- Nada foi tocado: runtime, teste, policy, catálogo, canon, produto, fixture, freeze, fila e gates.
- Nenhum agente ou reviewer foi iniciado.
- O pedido não foi salvo verbatim (regra do Founder desde a R7-C Fase 2).
- **Roteamento:** T1 · R0 · L2, instância atual. Sem judge: isto é registro de escopo, não gate.

## R7D_PHASE1_STATUS

**`READY_FOR_EXECUTION`.**
- Nenhum conflito de autoridade bloqueia. Os três registrados abaixo se resolvem pelas regras do projeto.
- Nenhuma autoridade definiu objetivo, saída ou critério de saída próprios da R7-D: só a identidade, a regra de roteamento e "holdout novo e não visto". O contrato abaixo é derivado das autoridades e dos precedentes R4–R6, como a R7-C Fase 1 fez para a R7-C.
- **Três escolhas são do Founder e entram na autorização da Fase 2:**
  - os critérios de SUCCESS_CRITERIA;
  - a rodada diagnóstica (recomendada);
  - se pode existir uma fase de correção (só com bloqueio e autorização própria).

## BASELINE

- **Closure:** `claude/domain-coaching-r7-c` em `0e6dfd8e1e704d76590194b9225fde26a1c1731b`, worktree `.claude/worktrees/domain-coaching-r7-c`, limpo. R7C_STATUS = CLOSED_READY.
- **Runtime:** `R7C-FREEZE-4`.
  - Commit `a9654c8ea175611fbaae805ac6b0e8b928620dff`; registro sha256 `bf99c01b…2fc2`; source `16d0633e…69c1`; manifest `61937f87…f6b8`.
  - 197 arquivos; 884/884.
  - Conferido nesta fase, só leitura (hash de cada arquivo contra o registro, sem `verify-r*`): **197/197 iguais** em `0e6dfd8`.
- **Inalterados, conferidos:**
  - R6-POLICY-5 (`18ec48f3…`; o arquivo vinculado pelo freeze confere);
  - R7B0-CATALOG-2 (`ceee276a…`);
  - a fila humana: 230 itens, `95ea4b92…`.
- `V1_COACHING_AUTHORITY_READY = NO`.
- **Esta fase:** branch nova `claude/domain-coaching-r7-d`, criada de `0e6dfd8`, no worktree `.claude/worktrees/domain-coaching-r7-d`.
- **Não tocados:** o checkout principal (`claude/domain-coaching-r7-b`, com `R7B2_REQUEST.md` não rastreado) e o worktree da R7-C.

## R7D_AUTHORITATIVE_DEFINITION

| Fonte | O que diz | Status |
|---|---|---|
| [Pedido R7-A](../domain-coaching-r7a-2026-10-27/FOUNDER_REQUEST.md) (verbatim), l. 20–29, §4, §13, §15 | Quatro fases; "R7-D — Fresh Generalization Gate"; "Se precisar de generalização: registrar para R7-D"; "Casos R6 agora são REGRESSION, não fresh generalization"; "Novo unseen holdout pertence à R7-D"; probes novos "NÃO devem ser apresentados como independent generalization evidence" | AUTHORITATIVE: identidade e regras |
| [OPEN_GAPS_R6](../../CoachingCore/r6/OPEN_GAPS_R6.md), "R7 entry" 5 | "A fresh unseen holdout for R7 evidence; the R6 corpus can only be challenge reuse" | AUTHORITATIVE como achado |
| [GAP_CLOSURE_B0](../../CoachingCore/r7/b0/GAP_CLOSURE_B0.md) (R7B0-GAPS-1) | T2: "fresh unseen generalization stays R7-D". NOT-RUN-POSTFIX, -R5-RECLASSIFICATION, -OFFICIAL-OUTPUTS: "the R6 corpus is regression only; fresh holdout R7-D". HOLDOUT-INTERFACE-GAPS: Engineering com Product, R7-D, "corpus interface". NO-VALIDATION: RETAINED_LIMIT. Categorias diferidas depois da R7-D | AUTHORITATIVE: roteamento mais recente |
| [CLASS_DISPOSITIONS_R7A](../../CoachingCore/r7/CLASS_DISPOSITIONS_R7A.json) | Três itens `R7D_GENERALIZATION`. JUDGE-CQ-R6-06: "Holdout re-verification belongs to R7-D" | SUPERSEDED em parte pelo B0; o JUDGE-CQ-R6-06 vale |
| [B0-readiness CLAUDE_HANDOFF](../domain-coaching-r7-b0-readiness-2026-10-30/CLAUDE_HANDOFF.md), l. 84, 92 | "R7-D: new unseen generalization gate; old corpora are regression only"; "fresh holdout execution remains R7-D" | AUTHORITATIVE |
| [Pedido decision-authority](../domain-coaching-r7a-decision-authority-2026-10-29/FOUNDER_REQUEST.md) §35 | "Corpora conhecidos continuam sendo REGRESSION evidence, nunca fresh generalization" | AUTHORITATIVE |
| Pedidos R7-B §30 e R7-B.1 §9; [R7C_HANDOFF](../../CoachingCore/r7/c/R7C_HANDOFF.md); PHASE7_CHECKPOINT; CURRENT_MISSION | "R7-C/R7-D e gates posteriores ainda existem"; R7-D "with its own Founder authorization; not started" | AUTHORITATIVE: status |
| FINAL_REPORT_R7A §10 | "um holdout novo e não visto; lacunas de interface do autor do holdout" | STALE, consistente |

**Método.** Estas autoridades não nomeiam a R7-D, mas regem o como:
- **Protocolo de holdout independente R4–R6:** [INTERFACE_ONLY](../../CoachingCore/r6/holdout/INTERFACE_ONLY.md), [INDEPENDENCE_MANIFEST](../../CoachingCore/r6/holdout/INDEPENDENCE_MANIFEST.json) e o [prompt do autor](../domain-coaching-r6-2026-10-26/continuation/holdout-author-prompt.md); uma primeira avaliação; juiz independente com rubrica.
- **[Scenario Lab](../../product/ADAPTIVE_ENGINE_SCENARIO_LAB.md):**
  - §2: classes de oráculo; variantes de um caso no mesmo split;
  - §5: relações metamórficas obrigatórias;
  - §6: três invariantes iguais a zero;
  - §8: "Freeze de inputs/gold/versões precede avaliação".
- **[AEOS](../../product/ADAPTIVE_ENGINE_OPERATIONAL_SPEC.md):** §9 (HC01–HC10) e §14 (estabilidade).

**As nove perguntas.**
1. **Definição autoritativa prévia?** Só identidade, regra de roteamento e "holdout novo e não visto". Nenhum objetivo, critério ou gate próprio.
2. **Documentos:** a tabela acima.
3. **Objetivo:** derivado (EXACT_OBJECTIVE).
4. **Entrada:** o runtime final das R7, R7C-FREEZE-4, com R6-POLICY-5 e R7B0-CATALOG-2.
5. **Saída:** derivada do precedente. Um holdout novo selado, uma primeira avaliação, gates independentes, uma disposição e um handoff.
6. **Gate de sucesso:** não definido; há uma proposta em SUCCESS_CRITERIA.
7. **Runtime:** nenhuma autoridade autoriza mudança. A R7-D é um gate, avaliativa por definição. Correção só com bloqueio e autorização própria.
8. **Pertence:**
   - o holdout novo e não visto;
   - a evidência de generalização roteada pela regra do pedido R7-A;
   - a interface do autor (HOLDOUT-INTERFACE-GAPS);
   - a re-verificação do JUDGE-CQ-R6-06 num caso fresh.
9. **Não pertence:**
   - reclassificar as primeiras avaliações R5/R6;
   - corpora conhecidos ou probes como evidência fresh;
   - validação humana, empírica ou clínica (NO-VALIDATION continua);
   - policy, catálogo ou nova competência;
   - reabrir R7-A, B ou C.

**Conflitos.** Nenhum pede decisão do Founder.
- **NOT-RUN-POSTFIX.**
  - OPEN_GAPS_R6 pede a reexecução do holdout R6 selado antes da evidência R7.
  - O B0 a fecha: o corpus R6 é só regressão, e o holdout fresh é da R7-D.
  - Vence a rota mais recente, como a R7-C Fase 1 já registrou. Rodar o R6 no FREEZE-4 é diagnóstico; a primeira avaliação R6 continua a única.
- **Nomes iguais.** As C1–C4 da R7-B.2 (SSCTR-R7B2) não são as C2–C11 da R7-C. Aqui elas se chamam R7B2-C1..C4 e C2..C11.
- **Interface defasada.**
  - O `INTERFACE_ONLY.md` é do R6-FREEZE-1. Depois dele o runtime ganhou a pergunta `UNREPORTED_TRAINING`, o caminho de resposta, o `planValidity` e o relógio do registro; o intake mudou só 16 linhas.
  - É a lacuna HOLDOUT-INTERFACE-GAPS, não um conflito de autoridade. Fecha-se por documentação na Fase 2.

## EXACT_OBJECTIVE

Provar, com um holdout novo, escrito por autor independente, selado antes de qualquer execução e avaliado uma única vez sobre o freeze final, que o runtime de referência R7 (R7C-FREEZE-4 ou sucessor autorizado):
- preserva, em atletas e situações não vistos, as propriedades de segurança e de semântica fixadas em R7-A..R7-C;
- dá coaching que o domínio julga ao menos aceitável.

Dentro do escopo V1, de inputs canônicos sintéticos e de revisão provisória de IA, sem mudar o runtime e sem declarar autoridade V1.

## IN_SCOPE

- **Interface pública para o autor (documento):**
  - a do R6;
  - o caminho de resposta da R7-C;
  - as regras de carregar o registro (C3);
  - os 9 itens do HOLDOUT-INTERFACE-GAPS que a documentação resolve.
- **Harness de avaliação fora de `CoachingCore/`,** sem nada que `node --test` descubra: runner, oráculos, relações metamórficas, dupla execução, cobertura e classificação.
- **Pre-registro com hash antes de o holdout existir:** propriedades, envelopes divulgados, taxonomia, matriz de cobertura, critérios e regra de seed.
- **Corpus diagnóstico independente e amostra gerada,** ambos abertos.
- **Holdout final selado,** escrito depois do freeze final, e a amostra com seed derivada desse freeze; uma única avaliação.
- **Corpora conhecidos** (R5, R6, fixtures, grades R7): só para validar o harness e como regressão.
- **Gates independentes:** QRE (Engineering/Quality) e SSCTR (domínio e rubrica).
- **Re-verificação do JUDGE-CQ-R6-06** num caso fresh: o dia de prova de quem só construiu walk/jog ou restart.
- **Mundo do gate:** registros com relógio, como o runtime devolve.

## OUT_OF_SCOPE

- **Mudanças** em `CoachingCore/src`, testes, policy, catálogo, canon, produto e fixtures fechados, salvo numa fase de correção autorizada.
- **Achados herdados:** corrigir ou absorver (ver LEGACY_FINDINGS_CLASSIFICATION).
- **Corpora antigos:** reclassificar as primeiras avaliações R5/R6, ou usar corpora conhecidos, probes e grades como evidência fresh.
- **Mundo sem relógio:** medir de novo, porque já está medido e divulgado (QE-R7C-15; P7-F03).
- **Validação e claims:** validação humana, empírica ou clínica; claims (G11); apêndices à fila (só no fechamento competente).
- **Decisões de outros owners:** G03 (resposta, cadência, wording, apresentação), G01, G02, G04, G07 e G09.
- **Plataforma e produto:** KMP, iOS, HealthKit, WorkoutKit, backend, Figma, Growth e vendors.
- **Status:** mudar `V1_COACHING_AUTHORITY_READY`; R7-E não existe no repo.
- **Escopo excluído** (maratona, ultra, adolescentes, hills, VO2): entra só para testar o roteamento a UNSUPPORTED, nunca como nova competência.

## GENERALIZATION_PROPERTIES

**Mundo do gate e registros sem relógio.**
- **A V1 real é o mundo com relógio.**
  - Hoje não existe registro V1: o runtime é shadow, sem usuário e sem port.
  - Todo registro V1 será escrito por um runtime com a semântica do FREEZE-4 (este ou o port KMP), com `provenance.firstRecordedAt` desde o primeiro dia.
- **O mundo sem relógio é compatibilidade histórica do runtime offline.**
  - São os registros anteriores ao FREEZE-4 e as linhas que um cliente montaria, o que a C3 proíbe.
  - Já está medido e divulgado (QE-R7C-15: 128/224; P7-F03: 23/200) e coberto pela cláusula retroativa da C3.
- **Quando um caso sem relógio bloqueia:** só se for o runtime a gravar a linha sem relógio (P13, DIRECT_RUNTIME_DELTA bloqueante). Fora disso é CONSUMER_CONDITION (C3).
- **O harness é um cliente conforme à C3:** carrega o registro como devolvido, manda relatos só como observações e nunca monta linhas nem mexe no relógio.
- **Clientes V1 fazerem o mesmo** é obrigação de consumidor (C3; G03, Engineering e Data). A R7-D não verifica isso, porque não há cliente. O port terá de provar as três regras do relógio (QE-R7C-17).

**Propriedades do gate.**
- São relações sobre a saída do runtime, nunca "a saída foi X".
- Cada uma termina em PASS, FAIL ou NOT_EVALUABLE.
- NOT_EVALUABLE não vira PASS nem sai do denominador (Scenario Lab §2).

| # | Propriedade | Autoridade | Por que importa | Teste observável | Falha |
|---|---|---|---|---|---|
| P01 | **Clínico primeiro.** Com rota clínica ou CLINICAL_HUMAN_REQUIRED de pé, nenhuma sessão atual ou prescrita, e nenhuma dose ou re-plano junto. Depois da liberação qualificada, os fatos registrados são aplicados sem reenvio | R7B2-C2 e C4; R7C_HANDOFF ("Order kept"); C3; AEOS HC03; G04 | O clínico é humano | Rota clínica → proposta sem prescrição. Liberação modelada como nos testes (registro carregado, sem estado clínico) → igual à resposta direta | SAFETY_BLOCKER |
| P02 | **Elegibilidade e escopo.** Elegibilidade desconhecida → ASK, nunca liberação nem doença presumida. Sinal clínico → rota humana. Fora do escopo → UNSUPPORTED | CLAUDE.md (SSCTR); SCOPE-EXCLUSIONS; AEOS HC02 | Segurança | Status de cada caso | SAFETY_BLOCKER |
| P03 | **Desconhecido ≠ executado ≠ zero.** Sessão sem relato é desconhecida. Dose de corrida que depende dela → ASK `UNREPORTED_TRAINING`, nem crédito nem zero. Resposta parcial continua ASK. "Sem relato" ≠ "relatado não feito" no registro | SSCTR-SD-R7C-r2; DR-118; AEOS §3–4; R7-A inv. 2 e 4; premissa da C4 | Núcleo da R7-C, medido só em dois atletas | Lacunas de relato em atletas novos: nenhum crédito nem progressão de semana sem relato; a dose dependente vira ASK | GENERALIZATION_BLOCKER; SAFETY se a dose sobe |
| P04 | **Validade marcada.** Pergunta pendente, HOLD (R4) ou dependência clínica → `planValidity = REQUIRES_RECONCILIATION`, nunca VALID | Premissa da C2; QE-R7C-13 | A C2 só protege se o runtime marca | Campo em toda decisão | SAFETY_BLOCKER |
| P05 | **Independência do portador.** A mesma resposta, direta ou registrada por outra decisão (HOLD do R4, rota clínica e liberação, ASK não aplicado), dá o mesmo plano na primeira decisão elegível. Reenviar não muda nada. Depois dessa decisão, nenhum plano VALID sobre a projeção obsoleta | C3 final ("every answer shape measured"); QE-R7C-07 e -10 | Medido só em GEN e R10K | Relação portador × direto em cada resposta fresh | GENERALIZATION_BLOCKER; SAFETY se acima do teto, ou com toque de prova ou qualidade no taper |
| P06 | **Teto de corrida única (D18).** Numa decisão VALID, nenhuma corrida da semana atual ou da semana da resposta passa do teto do registro, exceto a prova. Semanas seguintes são projeção condicional (C11), avaliadas na decisão que fecha a semana anterior. Isso cobre a premissa do R1 da C7 e do CC-F01: a 1ª decisão da semana b+1 pergunta ou re-planeja dentro do teto | D18; ceiling re-plan (SSCTR-CC-R7C-r4); nota de bloqueios SSCTR-P7; C9; C11 | Carga | Teto calculado do ledger devolvido × doses VALID | SAFETY_BLOCKER |
| P07 | **Fase.** Taper, semana de prova e pós-prova não são pulados por estabelecimento, re-estabelecimento ou retorno (D54). Nenhum toque de prova nem qualidade no taper além da leitura direta dos fatos. Quem só construiu walk/jog ou restart tem prova de conclusão, sem strides (D43(c)/D47) | Pedido R7-A §17; SSCTR-P7; JUDGE-CQ-R6-06 | Perto da prova | Dose da linha ≤ dose de fase na data; qualidade e toque × leitura direta; dia de prova | SAFETY_BLOCKER |
| P08 | **Retorno (E1).** Nunca começa acima do estado ou da dose executados e tolerados; liberado ≠ executado; uma interrupção é uma identidade através das correções; reentrada (restart, walk/jog: D17) dentro do teto | R7-A inv. 3 e 6; R7A_FINAL_HANDOFF (0/416); premissa D17/D18 do R2 (C7) | Segurança | Dose de retorno ≤ máximo executado e tolerado | SAFETY_BLOCKER |
| P09 | **Progressão merecida e limitada.** Só com evidência executada e comparável. Semana aberta não ganha nada. HOLD repete a dose; MAINTAIN fica na faixa ou na última carga. Um passo por revisão, sem salto de séries (D53/D56) | R7-A inv. 4 e §6; D53/D56; R6-POLICY-5; AEOS HC06 | Progressão em perfis e horizontes novos (R7-B) | Todo aumento com razão de gate apoiada em execução; deltas ≤ passo | GENERALIZATION_BLOCKER; SAFETY se houver pico |
| P10 | **História.** Só evidência factual escreve história; projeção nunca vira história. Evidência tardia revisa só o futuro. Correção válida substitui a anterior (A5). Nenhuma decisão reescreve o feito ou decisões anteriores | R7-A inv. 1, 2, 4, 5; AEOS §3, §14; premissa do QE-R7C-11 | Auditabilidade | Diff do passado entre passos: muda só por correção factual | GENERALIZATION_BLOCKER |
| P11 | **Repertório.** Toda sessão e configuração prescrita está no R7B0-CATALOG-2, dentro da elegibilidade e do equipamento. Fora do envelope falha fechado (UNSUPPORTED ou ASK), nunca com receita inventada | Divisão de autoridade B0; conformidade R7-B; AEOS §8, HC02 | "No illegal novelty" | Pertença ao catálogo; os verificadores de conformidade são reusados como oráculo, não como casos | GENERALIZATION_BLOCKER; SAFETY fora da elegibilidade |
| P12 | **Composição híbrida.** Dias escolhidos são restrição dura (DR-112). Mesmo turno só com confirmação. Relações de interferência do catálogo respeitadas | DR-112; UXS ONB-21; CMP.* do B0 | Híbrido com prioridades novas | Dias, turnos e relações CMP por semana | GENERALIZATION_BLOCKER |
| P13 | **Determinismo e equivalências.** Mesmos inputs e relógios → saída idêntica. Mesma decisão com: observações permutadas numa revisão; duplicata de segunda fonte; provider ou ids opacos renomeados; TOTAL ↔ PER_HAND da mesma carga. Toda linha gravada tem `provenance.firstRecordedAt` | AEOS §14, HC04, HC10; Scenario Lab §5; pedido R7-A §9; DR-123; R7C_HANDOFF (formato do registro) | "Mesmos fatos" | Dupla execução com hash; variantes pré-registradas | GENERALIZATION_BLOCKER (DIRECT_RUNTIME_DELTA) |
| P14 | **Aprendizado no envelope.** O Athlete Model só influencia com consentimento, dentro de R6-PARTIAL-NOISY-LEARNING. Revogar remove. Ruído não muda decisão. Nunca vira autoridade de dose | R7-C G02; AEOS §15, §17 | O G02 só foi testado em dev | Consentimento ligado × desligado; padrão × ruído | GENERALIZATION_BLOCKER |
| P15 | **(PROPOSTA) Translação de calendário.** O mesmo caso deslocado por semanas inteiras, ou com outro dia de início, dá as mesmas decisões, a menos das datas | Sem autoridade explícita; deriva de "Day 0 = dia da semana do startDate" e de AEOS §14 | O dev começa quase sempre numa segunda (2026-11-02) | Variante metamórfica | OBSERVATION até o SSCTR ou o Founder aceitar |

**"Mesmos fatos → mesmo plano" tem escopo.** A regra vale como P05 e P13. Linhas do tempo diferentes dos mesmos fatos podem divergir dentro dos resíduos aceitos (R2 e R3 da C7, QE-R7C-05, QE-R7C-16, C11) e convergem na revisão da semana. Só a divergência fora desses envelopes é finding.

**Camada de domínio, não invariante.**
- O SSCTR dá a cada caso uma nota da rubrica R5/R6: BEST_SUPPORTED, ACCEPTABLE_ALTERNATIVE, SUBOPTIMAL, INSUFFICIENT_INFORMATION, UNSUPPORTED, CLINICAL_OUT_OF_SCOPE ou CORPUS_ERROR. UNSAFE é marcado explicitamente.
- A referência é a `independentAssessment` do autor.
- O clínico fica NOT_EVALUABLE_DOMAIN (Scenario Lab §2).

## FRESHNESS_MODEL

**Fresh = as cinco condições:**
1. **Autoria.** O autor não escreveu o runtime. Não leu `src/`, `test/`, fixtures, probes e saídas, reviews, checkpoints, handoffs, holdouts anteriores nem o git log. Leu só a interface R7-D e os metadados do freeze, com `inspectedFiles` no manifesto (precedente R4–R6).
2. **Tempo.**
   - `authorStartedAt` é posterior ao `frozenAt` do freeze avaliado.
   - O SHA-256 dos bytes é selado antes de qualquer execução.
   - O runtime não muda entre selo e avaliação.
3. **Conteúdo.** Depois de canonizar (sem ids nem nomes; datas como semana e dia da semana), nenhum caso é igual a um caso de desenvolvimento.
   - Igualdade = contaminado: por exemplo, GEN com outro id.
   - Proximidade alta é sinalizada ao QRE.
   - Mesmos valores com outra seed também é contaminado: as grades R7 são enumerações determinísticas sobre GEN e R10K.
4. **Expectativa.** A `independentAssessment` é escrita antes de qualquer saída e nunca chega ao runtime.
5. **Uso único.** A primeira avaliação é a única evidência fresh; reexecutar depois de mudar o runtime é regressão (pedido R7-A §13).

**Geração independente:**
- **(a) Autor independente à mão:** a base.
- **(b) Relações metamórficas pré-registradas,** aplicadas mecanicamente a cada caso base. Vêm da autoridade, não dos casos, e as variantes ficam no mesmo split do caso (Scenario Lab §2).
- **(c) Amostra gerada, só para propriedades de intake.**
  - A distribuição vem do vocabulário da interface e do escopo V1, e é pré-registrada.
  - O QRE confere a neutralidade.
  - A seed vem do digest do freeze avaliado.

**Blindagem contra tuning ao holdout:**
- **O holdout final não existe enquanto o runtime pode mudar:** é escrito depois do freeze final. Não há segredo a guardar nem divisão simultânea ao diagnóstico.
- **Hashes prévios:** o pre-registro recebe hash antes do holdout, e a seed final é função do digest do freeze final.
- **Bloqueio no selado fecha NOT_READY, sem correção sobre ele.** Corrigir o contaminaria; uma missão posterior precisa de holdout novo.
- **Worker ≠ judge:** o autor do holdout ≠ o autor do runtime e do harness ≠ os juízes. O coordenador não dá nota.

## DEVELOPMENT_CORPUS

**Contaminado: regressão ou diagnóstico, nunca evidência fresh.**

| Corpus | Por quê |
|---|---|
| Holdout R5 (24) e holdout R6 (35 casos, 53 passos) | Rodam dentro da suíte (`r6-r5-regression`, `r6-holdout-runner`). A R7-C leu e explicou as saídas (H19, H22, H35, H21, H23) |
| Fixtures R6: PROFILES A–H, EDGE_PROFILES (8), TRAJECTORIES (14) | Usados em 25 arquivos de teste e em cerca de 90 probes R7 |
| Atletas dos testes R7-C: `GEN` (= `BASE`) e `R10K` | São dois conjuntos de valores, com outro id a cada fase. As grades dos gates R7-C (160, 280, 768, 1.200, 1.536, 648, 224, 108, 960) variam tempo, formato da resposta e portador sobre eles |
| Grades e probes da Engineering e do SSCTR; sondas R7-A (AI, AK, AM; 3.360 linhas); adversarial clínico (3.228); testemunhas B0 (31+/25−); grade V09 (4.000); diferencial R7-B.2 (848) | Construídos olhando o runtime |
| Cenários do Scenario Lab (S01–S47, Q01–Q09) | São autoridade de oráculo, não casos |

**Concentração medida** (667 arquivos de teste e probe). O corpus fresh deve pesar onde o dev é fino:
- o início é quase sempre 2026-11-02, uma segunda;
- os horizontes são de 12 e 16 semanas; 4 e 8 são raros;
- os dias de corrida são `[1,3,6]` e `[1,3,5,6]`;
- há muito mais 10K que meia;
- os corredores são NOVICE ou INTERMEDIATE; EXPERIENCED é raro;
- só 5 arquivos têm histórico de wearable;
- domina DUMBBELLS + BENCH.

**Uso permitido.** Validar o harness, em dois sentidos:
- **Sem falso bloqueio no FREEZE-4:** tudo cai num envelope divulgado ou vira finding real, triado.
- **Sensibilidade nos freezes superados.** O harness acusa os defeitos documentados:
  - R7C-FREEZE-3 `08c6db3`: QE-R7C-10;
  - R7B2-FREEZE-1 `1a1c728`: crédito de semana sem relato (R7C-G01);
  - fonte pré-R7A: D54.

  Oráculo sem testemunha conhecida = TEST_GAP.

**Diagnóstico fresh, aberto:**
- cerca de 16 casos de autor independente, nos mesmos estratos, com metade da densidade;
- 100 a 150 intakes, com seed do digest do FREEZE-4.

Pode guiar correção. Nunca conta como evidência final.

## SEALED_HOLDOUT

**Composição pré-registrada:**
- **H1:** autor independente novo, depois do freeze final; 32 a 36 casos base e 70 a 100 passos, com `independentAssessment`.
- **H1-M:** variantes metamórficas de cada passo elegível. São os portadores de P05, reenvio, duplicata, permutação, provider renomeado, TOTAL ↔ PER_HAND e dupla execução: 400 a 800 checagens mecânicas.
- **H2:** 250 a 300 intakes gerados, com seed do digest do freeze final. Só propriedades estruturais de cold start: P02, P07, P09, P11, P12 e P13.

**Estratos mínimos de H1.** O autor recebe estratos, nunca achados nem casos dev.

| Estrato | Mín. | Autoridade |
|---|---|---|
| Cold start: run-first meia, 12–16 semanas; 10K perto (≤ 8 semanas); strength-first; híbrido balanceado com dias e turnos compartilhados; geral de 4 semanas; iniciante absoluto; experiente nos dois; só peso corporal ou kettlebell; wearable parcial e força só com tipo e duração (DR-118); dias demais para a capacidade | 10 | Pedido R7-B §29; DR-112; DR-118; prompt do autor R6 |
| Construído só com walk/jog ou restart, com prova | 1 | JUDGE-CQ-R6-06 |
| Segurança e escopo: elegibilidade UNKNOWN; dor; pausa de causa clínica; fora do escopo | 4 | P01, P02 |
| Longitudinal: semanas sem relato e resposta tardia; corrida mais curta, mista ou adversa; relator sempre atrasado; revisões puladas ou vazias | 6 | R7-C |
| Eventos: agenda (inclusive última semana); dia indisponível; conflito duplo; equipamento ou viagem; substituição sem e com dor, depois liberação; objetivo ou data de prova; fadiga local ou sistêmica, isolada ou repetida | 6 | R7-A; tipos de evento R6 |
| Retorno não clínico curto, moderado e longo | 2 | R7-A E1 |
| Transição build → taper → prova → pós, em 10K e meia, com resposta no taper | 2 | D54, P07 |
| Dados: duplicata telefone + relógio; contradição; correção; fora de ordem; relógio adiantado; fuso | 2 | Pedido R7-A §3; AEOS §14 |
| Aprendizado: padrão consentido × ruído; sem consentimento | 1 | R7-C G02 |

Total: cerca de 34 casos. Os estratos com propriedade de segurança têm pelo menos 2 casos base: é o mínimo para o critério estrutural.

**Hipóteses do pedido, confrontadas:**
- **Sustentadas e cobertas pelos estratos:** atletas novos, experiência, horizonte, distribuição corrida/força, prova ou não, frequência, disponibilidade, pausas, evidência tardia ou parcial, agenda, taper, substituição e execução mista.
- **"Avançado":** a interface usa NONE, NOVICE, INTERMEDIATE e EXPERIENCED.
- **Portadores distintos:** são relação metamórfica (P05), não dimensão do corpus.
- **Ordem temporal dos mesmos fatos:** a invariância vale dentro de uma revisão. Entre linhas do tempo, vale o escopo descrito em GENERALIZATION_PROPERTIES.

**Por que basta:**
- 35 casos R6 acharam 19 classes CQ;
- as propriedades multiplicam cada caso a custo de máquina;
- H2 cobre o espaço de intake;
- dois casos por estrato de segurança dão a replicação mínima.

Aqui se para: o ganho marginal cai e a rubrica é a parte cara. Nada se acrescenta depois do selo, e NOT_EVALUABLE fica no denominador.

**Oculto até o gate final:** H1 e H2 inteiros. H1 só passa a existir depois do freeze final, e a seed de H2 depende desse freeze.

## LEGACY_FINDINGS_CLASSIFICATION

- **A:** o gate testa uma premissa da aceitação do item. Uma violação fresh bloqueia, mas o item não é alvo de correção.
- **B:** o item pode aparecer em casos fresh.
  - Dentro do envelope divulgado, é KNOWN_DISCLOSED_RESIDUAL ou CONSUMER_CONDITION.
  - Fora do envelope, é finding novo, classificado pela taxonomia.
- **C:** fora da R7-D.

| Item | Classe | Envelope ou razão |
|---|---|---|
| QE-R7C-08 | B | Fácil nunca relatada: progressão creditada abaixo do teto fora da revisão, até a revisão da semana (C7). Acima do teto, ou depois da revisão → novo |
| QE-R7C-09 | C | Premissa no trace que nenhuma decisão lê. Uma decisão fresh que a lesse seria P10 |
| QE-R7C-11 | A | Aceito porque "nunca acima do FREEZE-2 nem do teto; não reescreve história" → P06, P10 |
| QE-R7C-12 | B | C9 r6: semana seguinte condicional até 1 passo ou 1 degrau acima da revisão; nunca na semana da resposta; nunca toque de prova |
| QE-R7C-13 | B | Re-plano ao lado de pergunta sobre semana posterior. A premissa REQUIRES_RECONCILIATION é P04 |
| QE-R7C-15 | B (só legado) | Mundo sem relógio. P13 confere que o runtime não grava linha sem relógio |
| QE-R7C-16 | B | C11 (b): relator atrasado de corridas curtas; aumentos de 3 a 5 min em semanas futuras, VALID até a revisão, nunca na semana atual |
| QE-R7C-17 | C | Higiene de teste: as três regras do relógio. Fica para missão posterior e para a paridade do port |
| QE-R7C-18 | B | Correção no prazo registrada por rota clínica: aplicada só na revisão da semana (C3) |
| CC-F01 | A | Premissa da C9 e do R1 da C7: a 1ª decisão de b+1 pergunta ou re-planeja dentro do teto (P06). Até lá, a projeção é CONSUMER_CONDITION (C9) |
| C8 | B | Sinal retido descartado quando a resposta chega fora da revisão com VALID (SD5-02; C3) |
| C5 | B | Substituição não clínica com pergunta de corrida pendente; melhoria posterior, sem premissa de segurança |
| HOLD do R4 | B | Agenda na última semana → HOLD com REQUIRES_RECONCILIATION; a resposta vale na decisão seguinte. Outro throw → DIRECT_RUNTIME_DELTA |
| C10 | C | Pergunta de policy (R2). A premissa "dentro de D17/D18" é testada em P08 |
| D1 | B | Terceira sessão-chave adversa no meio da semana não muda nada até a revisão; a rota clínica fica intacta |
| G03 | C | Produto e Dados (C3, C4, C11). O harness só age como cliente conforme |
| J-M3 | C | Mutante sem testemunha (exclusão do relato de retorno). O comportamento entra em P05 |
| J-M5 | C | Idem, para o início substituído por retorno |
| P7-F02 | B | Mesma classe do QE-R7C-12, depois de resposta direta encurtada |
| P7-F03 | B (só legado) | O mesmo que o QE-R7C-15 |
| P7-F04 | B | R3 da C7: com toda corrida adversa, um passo acima da leitura revisada, abaixo do plano guardado e do EXEC |
| P7-F05 | C | Documental, corrigido no fechamento da R7-C |
| P7-F06 | B | Vira regra de oráculo: a qualidade se compara por degrau da escada, não por minutos (5x5 < 3x8) |

Nenhum item A ou B entra na implementação da R7-D, salvo se um caso fresh o mostrar fora do envelope como bloqueio estrutural. Mesmo então, a correção exige autorização própria.

## FAILURE_TAXONOMY

| Classe | Definição | Efeito |
|---|---|---|
| SAFETY_BLOCKER | Violação de P01, P02, P04, P06, P07 ou P08, ou recomendação UNSAFE, fora de envelope | **Bloqueia.** Uma basta (Scenario Lab §6) |
| GENERALIZATION_BLOCKER | Violação de P03, P05 ou P09–P14, ou padrão SUBOPTIMAL/UNSUPPORTED, fora de envelope e estrutural. Estrutural: aparece em pelo menos 2 casos base independentes, ou em 1 caso com o mecanismo reproduzido pelo juiz numa testemunha mínima | **Bloqueia** |
| SCIENTIFIC_BLOCKER | O SSCTR, na sua autoridade provisória não clínica, marca a saída como bloqueante | **Bloqueia** |
| INTEGRITY_BLOCKER | Independência ou selo quebrados; bytes do runtime mudados; harness não conforme à C3; CORPUS_ERROR acima do teto (proposta: 10 %); estrato de segurança sem caso avaliável | **Invalida o gate** |
| DIRECT_RUNTIME_DELTA | Defeito determinístico sem juízo esportivo: throw fora do R4, não determinismo, linha sem relógio, saída malformada | **Bloqueia** se toca determinismo, registro ou saída acionável. Senão, condição |
| CONSUMER_CONDITION | Saída correta só sob condição vinculante de consumidor: C2, C3, C4, C9, C11 ou R7B2-C4 | Divulgação |
| KNOWN_DISCLOSED_RESIDUAL | Dentro de envelope divulgado (C7; itens B) | Divulgação |
| NEW_RESIDUAL | Desvio novo, sem segurança e não estrutural | READY_WITH_CONDITIONS; roteado |
| TEST_GAP | Propriedade não avaliável em caso fresh: oráculo ausente ou ambíguo, denominador zero, ou oráculo sem testemunha | **Bloqueia** se a propriedade é de segurança. Senão, condição |
| FIXTURE_GAP / CORPUS_ERROR | Caso inválido pela interface | Fica fora do numerador e no relatório. Acima do teto → INTEGRITY |
| INTERFACE_GAP | A interface não expressa um cenário essencial | Condição; Engineering com Product |
| POLICY_QUESTION | A policy não decide o caso, ou o domínio discorda | Roteada ao SSCTR e ao PCG. Bloqueia só se o SSCTR a marcar de segurança |
| PRODUCT_QUESTION | Depende do G03 ou de outro owner de produto | Roteada |
| NOT_EVALUABLE_DOMAIN | A adequação depende de juízo clínico | CLINICAL_HUMAN_REQUIRED. Nunca libera nem bloqueia |
| OBSERVATION | Informativo | Nenhum |

**Status final:**
- Qualquer classe que bloqueia → `R7D_FRESH_GENERALIZATION = NOT_READY`, fechamento CLOSED_NOT_READY com bloqueio explícito.
- Sem bloqueio → READY_WITH_CONDITIONS se restar NEW_RESIDUAL, TEST_GAP fora de segurança, INTERFACE_GAP, POLICY_QUESTION ou DIRECT_RUNTIME_DELTA menor; senão READY.

**Divulgação:** CONSUMER_CONDITION, KNOWN_DISCLOSED_RESIDUAL e OBSERVATION.

**Roteamento:**

| Classe | Destino |
|---|---|
| NEW_RESIDUAL, DIRECT_RUNTIME_DELTA menor | Missão de runtime posterior |
| POLICY_QUESTION | SSCTR e PCG |
| PRODUCT_QUESTION | G03 |
| INTERFACE_GAP | Engineering com Product |
| NOT_EVALUABLE_DOMAIN | Humano qualificado |

**Condições do SSCTR.**
- A R7-D nunca falha o runtime por responsabilidade só de consumidor.
- Ela falha o runtime quando é falsa a premissa de runtime de que o consumidor depende: P01, P04, P05, P06 ou P13.

| Condição (R7-C, final) | Binding registrado | Natureza na R7-D |
|---|---|---|
| C2 | CONSUMER_CONDITION_FOR_ACCEPTANCE | Consumidor. A premissa de runtime é P04 |
| C3 | G03_CONDITION_FOR_USE_BEYOND_OFFLINE_REFERENCE | Consumidor e produto/dados. As afirmações medidas (todos os formatos de resposta; reenvio) são invariante de runtime (P05); o relógio é P13 |
| C4 | G03_DATA_CONDITION | Produto e dados (apresentação). Premissa: o registro distingue os dois casos (P03) |
| C5 | NON_BLOCKING_NEXT_RUNTIME_REVISION | Follow-up de engenharia |
| C7 | DISCLOSURE | É o registro dos envelopes |
| C8 | Consumidor (via C3) e motor não bloqueante | Consumidor e follow-up de engenharia |
| C9 | Consumidor e ENGINEERING_BEFORE_ANY_USE_BEYOND_THE_OFFLINE_REFERENCE | Consumidor e obrigação de engenharia pré-uso (CC-F01, QE-R7C-12/16). A premissa de segurança é P06 |
| C10 | ROUTING_TO_POLICY_OWNER | Follow-up de policy (SSCTR com PCG) |
| C11 | DISCLOSURE; G03_PRESENTATION_NOTE | Divulgação e apresentação. Define "semana atual" para P06 |

**R7B2-C1..C4:**
- C1 (SSCTR-R7B2-01): obrigação de motor antes do uso.
- C2: invariante de runtime (P01).
- C3: as condições da B.1 continuam com seus owners.
- C4: consumidor, com premissa P01.

**Restrição científica transversal:** autoridade provisória de IA, sem validação humana, empírica nem clínica; o clínico é humano.

## PROPOSED_EXECUTION

| Fase | Conteúdo | Saída | Juízes |
|---|---|---|---|
| 1 (esta) | Escopo, autoridade e desenho do corpus | Este checkpoint | — |
| 2 | Interface R7-D; harness; rascunho do pre-registro; validação no dev (FREEZE-4 sem falso bloqueio; freezes superados acusados); autor independente do diagnóstico; amostra com seed do FREEZE-4; execução diagnóstica; triagem | Checkpoint com `DIAGNOSTIC_RESULT`; pre-registro final com hash | Nenhum gate. Consulta estreita ao SSCTR só se a triagem precisar de juízo esportivo |
| 3 (condicional) | Correção, só com bloqueio na Fase 2 e autorização do Founder. Um ciclo, testes dirigidos, `R7D-FREEZE-1` | Novo freeze | Engineering e SSCTR estreitos sobre o delta |
| 4 | Holdout selado (autor novo, depois do freeze final); amostra com seed do freeze final; avaliação única; gates; fechamento | Registros, gates, handoff, missão e ledger | QRE (harness, independência, propriedades, estrutural) ∥ SSCTR (domínio, rubrica, bloqueio científico) |

- **Fases 2 e 3 do pedido viram uma só.** Com o harness validado, a execução diagnóstica é um comando; separá-la custaria uma sessão sem informação nova.
- **Diagnóstico e holdout não se juntam.** O selado só fica limpo se não existir enquanto o runtime pode mudar. Uma autoria dividida em metades aberta e selada deixaria a selada legível durante a correção.
- **Alternativa mínima, se o Founder preferir:** pular o diagnóstico. O harness fica na Fase 2 e o gate selado vira a Fase 3. Economiza uma autoria, mas qualquer bloqueio fecha NOT_READY e a próxima tentativa precisa de holdout novo.
- **Recomendação: manter o diagnóstico.** A evidência da R7-C repousa em dois atletas, e o cold start foi a família mais fraca do R6.
- **Ciclos:** no máximo uma correção, só no diagnóstico. O gate selado não tem laço.

## SUCCESS_CRITERIA

Proposta. O Founder confirma na autorização da Fase 2, e os critérios ficam no pre-registro com hash antes de o holdout existir. A R7-D fecha READY ou READY_WITH_CONDITIONS se, e somente se:

1. **Integridade.** O QRE verifica o manifesto:
   - só leituras permitidas;
   - `authorStartedAt` > `frozenAt`;
   - selo antes da execução;
   - bytes do freeze final iguais ao registro;
   - avaliação única;
   - harness conforme à C3.

   Além disso, CORPUS_ERROR fica no teto ou abaixo, e todo estrato de segurança tem caso avaliável.
2. **Zero SAFETY_BLOCKER em H1, H1-M e H2:** as três taxas do Scenario Lab §6 são zero, sem nenhuma violação individual.
3. **Zero outros bloqueios:** nenhum GENERALIZATION_BLOCKER, nenhum INTEGRITY_BLOCKER e nenhum DIRECT_RUNTIME_DELTA bloqueante.
4. **SSCTR:** ACCEPT ou ACCEPT_WITH_CONDITIONS, sem SCIENTIFIC_BLOCKER.
   - Nenhum caso UNSAFE.
   - Todo SUBOPTIMAL ou UNSUPPORTED com causa nomeada, e nenhum estrutural.
   - ASK, CLINICAL e UNSUPPORTED onde devidos.
5. **QRE:** READY ou READY_WITH_CONDITIONS.
6. **Cobertura de segurança:** toda propriedade de segurança avaliada em casos fresh, com oráculo de testemunha conhecida; todo NOT_EVALUABLE listado com owner.
7. **Handoff:** resíduos novos, condições e perguntas roteados.

**Estados finais:**

| Estado | Valores |
|---|---|
| `R7D_FRESH_GENERALIZATION` | READY, READY_WITH_CONDITIONS ou NOT_READY |
| `R7D_ENGINEERING_GATE` | o veredito do QRE |
| `R7D_SSCTR_GATE` | o veredito do SSCTR |
| `R7D_STATUS` | CLOSED_READY ou CLOSED_NOT_READY |
| `V1_COACHING_AUTHORITY_READY` | NO |

As autoridades não fixam meta numérica de qualidade (por exemplo, % de BEST_SUPPORTED): o Scenario Lab §6 só fixa os três zeros. Se o Founder quiser uma meta, ela entra no pre-registro antes da Fase 4.

## V1_AUTHORITY_IMPLICATION

1. **É o último gate do Coaching Core?** É a última das quatro fases R7 do pedido R7-A, e o repo não define R7-E nem outra etapa de Coaching Core. Não é o último gate antes da V1.
2. **O que vem depois.** Não existe R7-E. Seguem:
   - a missão de runtime posterior, com o backlog roteado;
   - as categorias diferidas do B0: KMP, IOS_IMPLEMENTATION_HEALTHKIT, PRE_TESTFLIGHT_R1, TESTFLIGHT_REAL_USE_GATES, FUNDED_HUMAN_REVALIDATION e DESIGN_RECONCILIATION.
3. **O que ainda falta depois de uma R7-D READY:**
   - **Obrigações "antes de qualquer uso além da referência offline":**
     - a parte de engenharia da C9 nas rotas de handler (CC-F01) e QE-R7C-12/16;
     - R7B2-C1 (SSCTR-R7B2-01);
     - a revisão de produção da triagem clínica (R11, R15; PRE_TESTFLIGHT);
     - a projeção permanente R1 da R7-A (A5-B1; PRE_TESTFLIGHT);
     - QE-R7ARA-OBS-1.
   - **G03:** C3, C4 e C11.
   - **Gates de produto e validação:**
     - G01 e G02 além da autoridade provisória do SSCTR, que não fecha G01–G04 em bloco;
     - G04, clínico e humano;
     - G07, G09, G06 (leitura do HealthKit) e G11 (claims).
   - **Revalidação humana financiada** da fila (230), no gatilho existente.
   - **Paridade do port,** inclusive as regras do relógio (QE-R7C-17).
4. **Quem muda a flag:** só o Founder, por decisão explícita.
   - A flag nasceu no pedido R7-B0 (§22), e todo pedido seguinte a reservou ("não declarar automaticamente").
   - Nenhum gate tem essa autoridade, e o SSCTR não tem soberania de runtime.
5. **Evidência necessária.** O repo não define critério de YES. A definição é do Founder; o mínimo derivado é:
   - R7-D READY;
   - as obrigações pré-uso fechadas ou atribuídas;
   - as decisões G03;
   - a revisão de produção da triagem clínica;
   - o aceite explícito de que a revisão de domínio é provisória: não humana, não empírica.

**Fechar a R7-D READY faria:**
- entregar a evidência fresh que todo registro R7 manda para a R7-D;
- fechar a sequência R7 do runtime de referência;
- tirar "R7-D" das pendências da autoridade V1.

**Não faria:**
- mudar a flag;
- validar com humano, dados reais ou clínica (NO-VALIDATION continua);
- fechar G01–G11;
- autorizar KMP, iOS ou uso real.

## INVARIANTS_TO_PRESERVE

- **Bytes do R7C-FREEZE-4** (manifest `61937f87…f6b8`). Conferir por hash contra o registro, ou com `verify-r7c.mjs --revision 4` só leitura. Nunca usar `--write`, `npm run verify` nem outro `verify-r*`.
- **Nada descobrível por `node --test` dentro de `CoachingCore/`.** O verificador congelado exige 884 com `--suite`, e o harness fica em `audits/domain-coaching-r7-d-2026-11-02/`.
- **Intocados:** R6-POLICY-5, R7B0-CATALOG-2, a fila (230), `product/`, `canon/`, freezes e registros fechados.
- **CURRENT_MISSION e MISSION_LEDGER, só por acréscimo:**
  - HEAD continua prefixo de bytes;
  - as 2 linhas CRLF de cada arquivo são preservadas.
- **Corpora conhecidos são regressão.** As primeiras avaliações R5/R6 nunca são reclassificadas.
- **Worker ≠ judge.** O autor do holdout ≠ o autor do runtime e do harness ≠ os juízes.
- **Semântica:** invariantes R7-A 1–6; desconhecido ≠ executado ≠ zero; clínico primeiro; reconciliação factual antes da adaptação ordinária; C3.
- **Status:** `V1_COACHING_AUTHORITY_READY = NO`; sem push nem merge sem o Founder.
- **Ciclos:** no máximo uma correção, só no diagnóstico. O selado nunca vira conjunto de tuning.

## DO_NOT_REOPEN

**Fatos fechados da R7-C:**
- `UNREPORTED ≠ KNOWN_MISS`; clínico primeiro; reconciliação factual antes da adaptação ordinária;
- QE-R7C-07 e QE-R7C-10 fechados; P6-F01 fechado no domínio do SSCTR;
- números de independência:
  - original 0/160;
  - encurtadas 0/280;
  - misto do SSCTR 0/768;
  - CC2 0/1.200;
  - 1.536 trajetórias sem VALID obsoleto;
- testes e mutação: Fase 7 18/18; suíte 884/884; F7-M1..M11 11/11, cada um pela própria testemunha;
- K6, K6b, CAND e o adversarial clínico;
- R7C-FREEZE-4, com Engineering READY_WITH_CONDITIONS e SSCTR ACCEPT_WITH_CONDITIONS;
- a C3 final única e a C11 generalizada;
- os FREEZE-1/2/3 da R7-C.

**Antes da R7-C:** R6, com o holdout e a primeira avaliação; R7-A e sua closure formal; B0; R7-B; R7-B.1; R7-B.2 e o R7B2-FREEZE-1.

**Resíduos e condições do R7C_HANDOFF:** só como envelopes.

## EXACT_NEXT_PHASE

```text
DOMAIN_COACHING_R7-D · FASE 2 — interface, harness e diagnóstico

Baseline: branch claude/domain-coaching-r7-d (worktree .claude/worktrees/domain-coaching-r7-d),
no commit da Fase 1. Runtime R7C-FREEZE-4 (a9654c8), sem mudança.
Ler primeiro: audits/domain-coaching-r7-d-2026-11-02/PHASE1_CHECKPOINT.md.

Autorizado:
1. Re-baseline: provar por hash os 197 arquivos do FREEZE-4, só leitura.
2. audits/domain-coaching-r7-d-2026-11-02/INTERFACE_ONLY_R7D.md: a interface R6, mais
   - o caminho de resposta (UNREPORTED_TRAINING, REQUIRES_RECONCILIATION, RECOVERED);
   - as regras de carregar o registro (C3);
   - a liberação clínica como os testes a modelam;
   - os itens do HOLDOUT-INTERFACE-GAPS que a documentação resolve.
   Sem implementação, policy, saída esperada nem caso dev.
3. Harness em audits/domain-coaching-r7-d-2026-11-02/harness/: fora de CoachingCore,
   nada que node --test descubra. Contém runner (base: evaluate-holdout-r6.mjs),
   oráculos P01–P14, relações metamórficas, dupla execução, cobertura e taxonomia.
4. Rascunho do pre-registro: propriedades, envelopes, taxonomia, cobertura, os critérios
   confirmados pelo Founder, a especificação da amostra e a regra de seed.
5. Validação do harness:
   - no FREEZE-4, sobre R5, R6, fixtures R6 e GEN/R10K: 0 falso bloqueio;
   - sensibilidade em git archive de 08c6db3 (QE-R7C-10), 1a1c728 (R7C-G01) e da
     fonte pré-R7A (D54);
   - oráculo sem testemunha = TEST_GAP.
6. Autor independente do diagnóstico:
   - instância general-purpose nova, com envelope <task-route>, claude-opus-5-5, xhigh;
   - lê só a interface R7-D e os metadados do freeze; recebe estratos, nunca achados;
   - escreve ~16 casos com independentAssessment, builder e manifesto, e sela.
7. Amostra diagnóstica: 100–150 intakes, seed do digest do FREEZE-4.
8. Execução diagnóstica no FREEZE-4 e triagem pela taxonomia.

Proibido: src, test, policy, catálogo, canon, produto, fixtures, fila; freeze; gates formais;
holdout final; push e merge; a flag V1; reabrir R7-A, B ou C; npm run verify; verify-r* --write.

Saída: checkpoint curto com
- DIAGNOSTIC_RESULT = NO_BLOCKER | BLOCKERS_FOUND (ids e classes);
- hashes da interface, do harness e do pre-registro final;
- recomendação: correção (Fase 3, com autorização própria) ou gate selado (Fase 4).
STOP.
```

## FILES_NEXT_SESSION_NEEDS

1. **Este checkpoint:** `audits/domain-coaching-r7-d-2026-11-02/PHASE1_CHECKPOINT.md`.
2. **Condições e envelopes:** `CoachingCore/r7/c/R7C_HANDOFF.md`.
3. **Bytes a conferir:** `CoachingCore/r7/c/RUNTIME_FREEZE_R7C_4.json`.
4. **Binding das condições e gatilhos de expiração:** `audits/domain-coaching-r7-c-2026-11-01/reviews/ssctr/SSCTR_PHASE7_RECHECK_R7C.json`.
5. **Interface R6 e lacunas** (`interfaceGapsNoted`): `CoachingCore/r6/holdout/INTERFACE_ONLY.md` e `INDEPENDENCE_MANIFEST.json`.
6. **Precedente do autor:** `audits/domain-coaching-r6-2026-10-26/continuation/holdout-author-prompt.md`.
7. **Base do runner:** `CoachingCore/scripts/evaluate-holdout-r6.mjs`.
8. **Oráculos e estabilidade:** `product/ADAPTIVE_ENGINE_SCENARIO_LAB.md` (§2, §5–§8) e `product/ADAPTIVE_ENGINE_OPERATIONAL_SPEC.md` (§9, §14).
9. **Invariantes e condições R7B2-C1..C4:** `CoachingCore/r7/R7A_FINAL_HANDOFF.md` e `CoachingCore/r7/b2/R7B2_CLOSURE_HANDOFF.md`.
10. **Oráculo de catálogo:** `CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json` e `CoachingCore/scripts/conformance-r7b2.mjs`.

## GIT_STATE

- **Branch:** `claude/domain-coaching-r7-d`, no worktree `.claude/worktrees/domain-coaching-r7-d`, criada de `0e6dfd8`.
- **Commit da fase:** um commit de documentação sobre `0e6dfd8`, com este checkpoint e os blocos de acréscimo de `CURRENT_MISSION.md` e `MISSION_LEDGER.md`. O SHA está no `git log` da branch.
- **Sem push e sem merge.**
- **Intocados:**
  - `claude/domain-coaching-r7-c`, em `0e6dfd8` e limpo;
  - o checkout principal, em `claude/domain-coaching-r7-b`, com `R7B2_REQUEST.md` não rastreado.
