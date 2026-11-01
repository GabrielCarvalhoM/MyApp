# R7-C · Fase 1 — checkpoint (2026-11-01)

Autoridade: pedido direto do Founder de 2026-11-01 ([verbatim](FOUNDER_REQUEST_PHASE1.md)). Esta fase foi só de investigação: nenhum runtime, teste, policy, catálogo, freeze, fila, `product/` ou `canon/` foi alterado.

As sondas estão em [`probes/`](probes/). São instrumentos de engenharia somente leitura, com a autoridade de desenvolvimento dos helpers de teste da R7-B; não são evidência de gate.

## R7C_PHASE1_STATUS

`COMPLETE`. A Fase 2 depende de duas decisões do Founder: OPEN_AMBIGUITIES 1 e 2.

## CANONICAL_BASELINE

- **Branch:** `claude/domain-coaching-r7-b2`, no worktree `.claude/worktrees/domain-coaching-r7-b2`, limpo.
- **HEAD:** `baa2cb1eebba7d50c0a1d0cc1af74f35655a980c`, o fechamento da R7-B.2.
  - O remoto tem o mesmo SHA (`git ls-remote` pela URL SSH).
  - O ref local `origin/claude/domain-coaching-r7-b2` parou em `d1ec207`, porque os pushes usam a URL SSH explícita. Não é divergência.
- **Último closure:** DOMAIN_COACHING_R7-B.2, **CLOSED READY** em 2026-11-01. Registros: [FINAL_DISPOSITION](../domain-coaching-r7-b2-2026-10-31/FINAL_DISPOSITION.json) e [handoff](../../CoachingCore/r7/b2/R7B2_CLOSURE_HANDOFF.md), que é o último checkpoint relevante.
  - R7B_RUNTIME_REPERTOIRE_READY = READY, só para o runtime de referência shadow, sob as condições SSCTR C1–C4.
  - V1_COACHING_AUTHORITY_READY = NO; PRODUCTION_READY = NO.
- **Freeze relevante:** R7B2-FREEZE-1.
  - Commit `1a1c728`, com os bytes de `63fa602`.
  - Registro `RUNTIME_FREEZE_R7B2_1.json` (`8d51def5…`); source `57512322…`; manifest `f9c5bd5a…`.
  - 122 arquivos e 799 testes. Verificação: `node scripts/verify-r7b2.mjs [--tests]`, só leitura.
  - Confirmado nesta sessão: `git diff 1a1c728 baa2cb1` é vazio para `src/`, `test/`, `package*.json`, R6-POLICY-5 e o catálogo.
- **Inalterados:** R6-POLICY-5 (`18ec48f3…`), R7B0-CATALOG-2 (`ceee276a…`) e a fila humana (230 itens).
- **Esta fase:** branch `claude/domain-coaching-r7-c`, criada de `baa2cb1` no worktree `.claude/worktrees/domain-coaching-r7-c`. Sem merge e sem push.
- **Checkout principal:** está em `claude/domain-coaching-r7-b` (`4230034`), com `R7B2_REQUEST.md` não rastreado. Não é a baseline e não foi tocado.

## WHAT_R7C_IS

**R7-C — Longitudinal Coaching** é a terceira das quatro fases R7 planejadas pelo Founder ([pedido R7-A](../domain-coaching-r7a-2026-10-27/FOUNDER_REQUEST.md), linhas 20–25):

```text
R7-A semantic core → R7-B cold start & whole program → R7-C longitudinal coaching → R7-D fresh generalization gate
```

O mesmo pedido define a regra: "lacuna de competência longitudinal → registrar para R7-C". Nenhum pedido do Founder definiu ainda objetivo ou critério de saída próprios da R7-C. O que segue é derivado das autoridades.

**Objetivo derivado.** O runtime de referência deve conduzir o atleta corretamente ao longo de muitas semanas de evidência imperfeita: parcial, ruidosa, tardia, ausente ou sem revisão. O laço é `PLAN → EXECUTE → RECORD → LEARN → CHECK → PRESERVE IF ADEQUATE → PROGRESS NEXT CYCLE` (VFT-C058, VFT-L024, AEC §1.2–1.3, AEOS §10.3). Para isso:
- todo caminho de decisão lê o mesmo estado factual;
- o desconhecido não vira crédito nem zero;
- o Athlete Model é atualizado e só influencia decisões dentro do envelope aprovado;
- o aprendizado nunca vira autoridade de dose, alegação causal ou geração aberta.

**Entrada:** R7B2-FREEZE-1, os achados roteados e as condições C1–C4.

**Saída:** um freeze R7-C com os gates SSCTR e Engineering. A R7-C reavalia os vereditos R6 longitudinais que ainda estão NOT_READY:
- ATHLETE_LEARNING_MODEL (CQ-R6-14);
- HORIZON_COACHING e ADAPTIVE_COACHING (CQ-R6-04 e R18). O outro achado desses vereditos, CQ-R6-03, foi corrigido na R7-A (C16).

**Camadas.**
- **Foco:** evidence (ledger, provenance, state model) e bounded adaptation (decisões depois de lacunas; evidência aprendida entrando no plano do próximo bloco).
- **Só consumidas:** classification, repertoire/archetype e parameterization. Os bytes do catálogo e da policy não mudam.
- **Hybrid composition:** só consome a severidade aprendida que já existe (`r6-balanced`).
- O repertório validado continua sendo o limite: nada de geração aberta e nada de template rígido novo.

**Fora da R7-C:**
- expansão de repertório ou catálogo;
- cold start e whole program (R7-B);
- holdout novo (R7-D);
- ML, aprendizado estatístico ou JEV (AEOS §17, P4);
- histórico e Growth (DR-128);
- triagem clínica (PRE_TESTFLIGHT);
- KMP, iOS, HealthKit e backend;
- wearables diretos.

## AUTHORITIES

```text
pedido R7-A (2026-10-27)          → fases R7, regra de roteamento → verbatim → identidade da R7-C            [AUTHORITATIVE]
pedido R7-C Fase 1 (2026-11-01)   → limites desta fase → verbatim → Fase 1                                [AUTHORITATIVE]
Tese (canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT) → L024 locked, C058, C040, C009; H005 é hipótese → canon atual → doutrina   [AUTHORITATIVE]
AEC §1.2–1.3, §7.1                → learn ≠ mutation, cadência, HOLD escopado → atual (EXP-AUTH-r1) → G01, G02       [AUTHORITATIVE]
AEOS-1.2-r2 §4, §10, §11, §14, §15, §17 → desconhecido ≠ 0; ASK/HOLD sem default; mesmos fatos → mesmo resultado; evidência tardia só revisa o futuro; Outcome Learning; P0–P4; PS02/PS03/PS07 → atual → G01, G02   [AUTHORITATIVE]
PDR DR-87, DR-73, DR-117–123, DR-127/128 → cadência; V1 iOS com HealthKit inbound e inputs canônicos; G03 aberto → atual → G01, dependência G03   [AUTHORITATIVE]
V1_RELEASE_SCOPE §2               → stable adaptation; post-workout com consumidor; um Athlete Model → atual → limite de escopo   [AUTHORITATIVE]
R6-POLICY-5                       → envelopes PARTIAL-NOISY-LEARNING, NONCLINICAL-RETURN, PLANNED-PROGRESSION; operational.learning → 18ec48f3… (mudar um byte invalida as aprovações) → G01, G02   [AUTHORITATIVE]
SSCTR r12 (ssctr-policy-review.r12.json) → APPROVE_WITH_CONDITIONS dos envelopes; R18, R1, R2, R5, R14, R15 → r12 → G01 (R18) e backlog   [AUTHORITATIVE]
R7A_FINAL_HANDOFF                 → invariantes 1–6, stop rule → R7A-RESIDUAL-AUTHORITY-FREEZE-1 → DO_NOT_REOPEN   [AUTHORITATIVE]
B0-readiness CLAUDE_HANDOFF       → "R7-C: longitudinal learning, consent/use constraints, noisy partial/adherence response, causal/predictive claims" → baseline B0 → definição   [AUTHORITATIVE]
GAP_CLOSURE_B0 (R7B0-GAPS-1), B0_HANDOFF §5 → roteamento por item mais recente → closure B0 c66966e → CQ-R6-14 → R7-C; CQ-R6-16 → R7-B/R7-C   [AUTHORITATIVE; ver AMBIGUOUS]
handoffs e dispositions R7-B, B.1, B.2 → R18 como CONDITION; achados "next runtime mission"; C1–C4 → closure B.2 → backlog e safety   [AUTHORITATIVE]
CLASS_DISPOSITIONS_R7A.json       → 16 itens R7C_LONGITUDINAL, C15, resíduo de C16 → R7-A → só C15 continua útil ("Entry for R7-C: R18, probe C15, G03")   [SUPERSEDED em parte por GAP_CLOSURE_B0]
FINAL_REPORT_R7A.md §10           → roteamento do 1º fechamento da R7-A (NOT_READY) → 2026-10-27 → —   [STALE]
OPEN_GAPS_R6, READINESS_VERDICTS_R6 → definições CQ-R6-xx e vereditos → R6 → achados válidos; as disposições foram superadas   [AUTHORITATIVE como achado]
constituição e adapter do SSCTR   → PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY; clínico = CLINICAL_HUMAN_REQUIRED; elegibilidade desconhecida = ASK → atual → judge obrigatório   [AUTHORITATIVE]
FOUNDER_LOOP_BOUND (R6)           → uma review por gate, no máximo um recheck estreito → atual → todas as fases   [AUTHORITATIVE]
```

**AMBIGUOUS:** a posse de R18/C15/CQ-R6-04 (OPEN_AMBIGUITIES 1).

**Não é ambíguo:** SSCTR-R14. A R7-A e a B0 descrevem metades do mesmo registro r12: a frase da race week depois de um restart, e o G03.

## CURRENT_STATE

O que já existe e está fechado no R7B2-FREEZE-1:
- **Ledger:** append-only. Conflitos ficam em quarentena, duplicatas são fundidas, observações expiram em 56 dias e há guarda de clock skew.
- **State model da R7-A:**
  - HistoricalState ≠ PlanningProjection, e a projeção nunca vira história;
  - semana aberta não ganha nada;
  - A5: a correção factual canônica vem antes de todo handler;
  - E1: liberado não é executado.
- **Gating por observações comparáveis, por classe de fase:** emerging com 3 em 7 dias; strong com 4 em 14 dias; regressão depois de 2 adversas em 14 dias; progressão ganha em 3 sessões; hysteresis.
- **Interrupção e retorno da R7-A:** cada episódio tem uma identidade. O retorno parte do estado executado. A evidência tardia fica no ledger e passa pela pergunta de late evidence da R7-A.
- **Precedência clínica da R7-B.2:** a rota clínica vem antes das perguntas pré-handler.
- **Athlete Model** (`src/r6-learning.mjs`, inalterado desde a R6; último commit `ffc1136`, um sync):
  - exige consentimento, e a revogação remove a influência;
  - registra direção e confiança da evidência;
  - a severidade de interferência aprendida produz LEARNED_REARRANGEMENT, sempre com as mesmas doses;
  - a preferência de arranjo só desempata entre opções de dano igual;
  - nunca é causal e nunca é autoridade de dose.
- **Entre ciclos (R7-B):** reviews na fronteira de bloco, graduação B0-C01, troca de MAIN com motivo registrado e resumo do bloco.
- **Reviews no meio da semana:** existem e têm testes.
- **Força em semanas sem revisão: OK.** Sonda `r18-running-strength-probe`, sem relato no review da semana 7:
  - semanas nunca revisadas e semanas revisadas vazias dão saída idêntica;
  - não há crédito, e o back squat é re-estabelecido a partir do último 82,5 kg executado (`2x10 ESTABLISH`);
  - o formato AF do SSCTR R18 (87,5 kg 4x5 depois de 49 dias) não se reproduz.
- **Guardas de aprendizado:** cerca de 50 títulos de teste cobrem overfit, consentimento e revogação, duplicatas e conflitos, pooling por fase, ausência de alegação causal e "projeção nunca aprendida" (I11, I14).

## REAL_GAPS

### A. Blockers de um READY da R7-C

**R7C-G01 — semanas sem revisão ou sem relato.** Junta C15, o lado corrida do SSCTR-R18, CQ-R6-04 e QE-R7B-R2-05.

- **Evidência**, somente leitura, em R7B2-FREEZE-1:
  - **Sonda C15 da R7-A: REPRODUCED.** Semanas 3–6 ficam sem review e a semana 7 é relatada como executada. O weekly review faz KEEP dos níveis projetados para a semana 8 (EASY 45, QUALITY 38, LONG 70), creditando as semanas sem revisão. Uma SCHEDULE_CHANGE no mesmo ponto re-planeja a semana 8 para 15/15/15 e a semana 9 para 15/15/20.
  - **Sonda R18**, sem relato no review da semana 7: as semanas nunca revisadas e as revisadas vazias são tratadas igual, sem crédito. A corrida, porém, colapsa: a semana 8 fica com 15/15/15, contra 55/53/75 no controle executado. O desconhecido é lido como exposição zero.
  - **QE-R7B-R2-05:** o cap de novato não começa quando a semana 1 é pulada. É o caminho R18 registrado na R7-B; não foi re-sondado aqui.
- **Por que importa:** os mesmos fatos dão respostas diferentes conforme o caminho de decisão. O desconhecido é tratado como sucesso (crédito) e como falha (zero), e o zero colapsa a corrida antes da prova. HORIZON_COACHING e ADAPTIVE_COACHING estão NOT_READY desde a R6. O R18 é exigido antes de qualquer uso além da referência offline; a R7-B o registrou como CONDITION.
- **Authority:**
  - SSCTR r12 R18: o mecanismo é da Engineering, e a pergunta ao atleta é G03;
  - AEOS §4: carga desconhecida não vira zero;
  - AEOS §10.2: incerteza decisiva vai para ASK ou HOLD, sem default fisiológico;
  - AEOS §14: mesmos inputs, mesmo resultado;
  - C15: "Entry for R7-C".
- **Runtime impact:**
  - o KEEP do weekly review contra REARRANGE/rebuild (schedule change, dia indisponível, troca de objetivo);
  - o teto de corrida isolada, lido do ledger;
  - o início do cap (`strengthAtBreak`);
  - talvez um campo de continuidade de review. Hoje não existe: no `src`, `UNREVIEWED` é só uma classe de qualityAssessment.
- **Safety impact:** médio, não clínico. O crédito progride a corrida sem evidência; o zero colapsa a preparação. A dose depois da lacuna respeita E1 e as regras de retorno.
- **Dependências:**
  - SSCTR, obrigatório, para a semântica esportiva da prescrição depois da lacuna;
  - G03, de Product/Data: como perguntar sobre a ausência, se uma ausência não declarada pede motivo, e como contam as sessões dentro de uma pausa declarada. O runtime pode ficar neutro em relação ao G03 com um ASK ou HOLD tipado do escopo dependente;
  - os invariantes da R7-A.
- **Área de código:** `src/r6-adaptation.mjs`, `src/r6-program.mjs` e talvez `src/r6-provenance.mjs`. Os schemas, só se surgir um tipo novo de ASK ou um campo novo.
- **Evidência para fechar:**
  - uma regra única para todos os caminhos de decisão, provada por um diferencial de caminhos (mesmos fatos, com e sem semanas sem revisão, dão o mesmo estado factual);
  - nenhum crédito, seja na corrida, na força ou no cap de novato;
  - nenhum colapso silencioso;
  - comparação com uma pausa declarada de mesma duração;
  - o caso de aproximação da prova (CQ-R6-04);
  - aceite do SSCTR.

**R7C-G02 — o Athlete Model não muda nenhuma decisão realista.** Achado CQ-R6-14; veredito ATHLETE_LEARNING_MODEL_READINESS = NOT_READY.

- **Evidência:**
  - estrutural: o módulo está inalterado desde a R6, e o escopo aprendido se limita a arranjo e desempate;
  - o juiz da R6 encontrou 0 decisões alteradas em H34, H35 e H20;
  - a re-checagem comportamental no freeze atual não foi feita (D5).
- **Por que importa:** é a metade "learning" do coaching longitudinal (VFT-C058). Atualizar o Athlete Model ≠ mutar o plano. O gap é a evidência aprendida não chegar onde o envelope permite, isto é, à progressão entre ciclos "sob policy/resposta" (AEC §1.3). Não se trata de forçar mudanças.
- **Authority:**
  - AEC §1.3;
  - AEOS §15: LearningHypothesis, opt-in, nenhuma atualização automática de policy;
  - AEOS §17: P1 e P3;
  - o envelope R6-PARTIAL-NOISY-LEARNING: hold, advance, regress, rank.
- **Runtime impact:** `src/r6-learning.mjs`, os caminhos aprendidos de `src/r6-adaptation.mjs`, `src/r6-balanced.mjs` e o plano do próximo bloco em `src/r6-program.mjs` e `src/r7b-repertoire.mjs`.
- **Safety impact:** baixo a médio. Os riscos são overfit, alegação causal e dose fora do envelope.
- **Dependências:** a profundidade (OPEN_AMBIGUITIES 2). LEARNING-CONSENT-SCOPE (Data/G07) continua sendo só um input.
- **Evidência para fechar:**
  - H34, H35 e H20 como regressão;
  - sequências de 2 blocos ou mais, com consentimento ligado, desligado e revogado;
  - influência apenas onde o envelope permite;
  - sem consentimento, resultado idêntico ao caminho populacional;
  - um evento nunca vira regra;
  - nenhum texto causal;
  - aceite do SSCTR.

### D. Hipóteses: evidência primeiro, no início da Fase 2

- **D1. CQ-R6-16.** Uma terceira sessão-chave adversa, com função prejudicada no dia seguinte, fica sem resposta no meio da semana (formato H19). Talvez os eventos ADVERSE e PROGRESSION_NOT_TOLERATED já cubram isso. Se reproduzir, entra em G01 como adaptação excepcional dentro do ciclo; o check-in proativo é de Product/UX.
- **D2. Parte de registro de CQ-R6-19.** Um longão movido e executado gera hold (H22), e uma sessão perdida fica registrada como PARTIAL (H17). Se reproduzir, entra em G01 por fidelidade do registro.
- **D3. C11 e C14 das sondas de classe da R7-A** aparecem REPRODUCED no freeze atual (NOT_REPRODUCED no CYCLE2). O mais provável é que os predicados tenham envelhecido:
  - o de C11 casa com o texto "Return entry: choose…", que a R7-B introduziu;
  - o de C14 encontra a semântica posterior de evidência tardia, que revisa o futuro (AEOS §14).

  Não reabre nada: o gate da R7-A está fechado, e a R7-B.2 mostrou 29/29 em late evidence. Só caracterizar se a Fase 2 tocar retorno ou evidência tardia.
- **D4.** Quanto uma pausa declarada de mesma duração prescreve, para medir o tamanho do colapso de G01.
- **D5.** O status comportamental de CQ-R6-14 no R7B2-FREEZE-1.

## DO_NOT_REOPEN

- **R7-A** (READY; freeze `7d2da36`):
  - invariantes 1–6: HistoricalState ≠ PlanningProjection; evidência por valor; identidade da interrupção; prescrição nunca estabelece história; A5; E1 (o retorno nunca fica acima do executado e tolerado);
  - QE-R7ADA-01/02, F1–F4, F4-X, R7ARA-SELF-01, D53, D56–D59, HOLD e MAINTAIN.
- **R7-B0:** R7B0-CATALOG-2, com schema, foundation e os 13 registros r2. Os bytes são a especificação.
- **R7-B:** o binding e a conformance (301 entradas). Os blockers da R7-B fechados na B.1: OBS-04, R2-01..03 e os resíduos de QE-R7B-01/05.
- **R7-B.1:** QE-R7B1-01, QR7B1-01..05, a regra de semana de evento (F11) e a pergunta sem opção de skill menor.
- **R7-B.2:**
  - QE-R7B1-04 e CAND-01/02: o ponto de precedência clínica antes de `staleReturn`, `factual?.ask` e da pergunta de mesmo event id;
  - QE-R7B2-01 e QR7B2-01, aceitos: a rota clínica não propõe nada.
- **Bytes e fila:** os bytes da R6-POLICY-5. A fila só cresce por acréscimo (230); pins antigos são superados, nunca reescritos.
- **Processo:**
  - não rodar `npm run verify` nem o `verify-r*` de missão fechada com `--write`;
  - `mutate-r7b*.mjs` edita fontes no lugar: só rodar em cópia isolada;
  - limite de loop: uma review por gate e no máximo um recheck estreito.

## SAFETY_CRITICAL_ITEMS

- **S1. Precedência clínica.** Toda pergunta nova que a R7-C criar, como um ASK de semanas sem revisão, roda depois da rota clínica do próprio review. Pain, injury, illness, functionalLimitation ou clinicalConcern levam a CLINICAL_HUMAN_REQUIRED, sem proposta, re-plan ou dose (C2). Elegibilidade desconhecida é ASK, nunca liberação clínica.
- **S2. C4.** Enquanto o clínico estiver pendente, nenhuma sessão aparece como atual ou prescrita. A continuidade nunca atravessa nem credita semanas dentro de um hold clínico. Depois da resolução humana, um review admitido re-deriva o estado factual primeiro.
- **S3. Semanas sem revisão.** Não dão crédito de nenhum tipo: estabelecimento, progressão, crédito de bloco, pico ou resume-clock. Não há default fisiológico. A dose depois da lacuna fica no máximo no executado e tolerado (E1), passa pelo motor de retorno e pela sua triagem, e só vale com aprovação do SSCTR.
- **S4. Aprendizado.** Nunca é autoridade de dose nem dá um "porquê" causal. Um evento não vira regra, e ausente não é adverso. Depende de consentimento, e a revogação remove a influência. Nunca cruza fase, dose, família, modalidade ou equipamento. Taper, race, post-event e return nunca se misturam com build.
- **S5. Evidência tardia.** Só revisa o futuro. Duplicatas nunca adaptam duas vezes, e conflitos ficam em quarentena.
- **S6. Progressão.** Só por evidência comparável, com hysteresis. Nada é prescrito fora dos envelopes: sem geração aberta. As doses de taper, race week e post-event são respeitadas, e a regra de semana de evento continua (OBS-04, F11).
- **S7. Leituras clínicas conhecidas e incompletas** (QE-R7B2-02/03). Nenhum caminho novo pode depender delas.

## TEST_EVIDENCE_ALREADY_AVAILABLE

- **R7B2-FREEZE-1:** 799 testes em 47 arquivos. Incluem:
  - cerca de 50 testes de aprendizado, adversos, consentimento e guardas longitudinais (`r5-learning`, "Learning:" e "Adaptation:" em `r6-adaptation`, QRE-R6-14/16, I11 em `r7ase`, I14 em `r7asm`, QE-R7AF-01 em `r7ab`);
  - os testes de review no meio da semana;
  - as correções no meio da semana da R7-B.1;
  - os 13 de `r7b2-clinical-precedence`.
- **Pacotes herdados da R7-B.2:** diferencial de 848 linhas sem nenhuma diferença; adversarial com 3.228 checks; neighbors 32/32; conformance PASS; mutação 8/9 (M41 equivalente); verificação 35/35.
- **Sondas:**
  - classe da R7-A: `make-r7a-probe-copy.mjs` (C15 = REPRODUCED);
  - `r18-running-strength-probe.mjs`, determinística (re-executada, saída idêntica).
- **Holdout R6** (`CoachingCore/r6/holdout`), só como regressão: H34, H35, H20 (aprendizado) e H19, H22, H17, H21 (longitudinal).
- **Falta:**
  - diferencial de caminhos com semanas sem revisão;
  - comparação entre pausa declarada e lacuna não declarada;
  - sequências multi-bloco com consentimento ligado, desligado e revogado;
  - teste metamórfico "review vazio ≡ semana sem review";
  - teste positivo de influência aprendida.

## PHASE_2_EXACT_SCOPE

**Entra:**
1. Re-baseline com evidência primeiro: D1, D2, D4 e D5, no R7B2-FREEZE-1. Só entra o que reproduzir.
2. **R7C-G01:** uma leitura factual única das semanas decorridas, em todos os caminhos. Sem crédito; sem zero silencioso; um ASK ou HOLD tipado do escopo dependente, neutro em relação ao G03; coerente com a pausa declarada. Inclui R2-05 e CQ-R6-04.
3. **R7C-G02**, na profundidade decidida. A recomendação é a opção (a): dentro do envelope atual, sem regra nova de dose.
4. Testes de G01 e G02. Sem freeze e sem review na Fase 2.

**Corrida, força e híbrido:**
- **Corrida:** níveis de easy, long e quality depois de lacunas; o teto de corrida isolada; a aproximação da prova, com as doses de taper e race week (R6-EVENT-TRANSITION).
- **Força:** a re-estabilização já está OK; falta o cap de novato (R2-05).
- **Híbrido:** a severidade aprendida produz rearranjo com as mesmas doses, e os estímulos protegidos ficam (B1–B2). A prioridade é sempre derivada de objetivo, fase e proximidade do evento; nunca há default fixo run-first, strength-first ou balanced.

**Fica fora**, seja como residual roteado ou como melhoria:
- **Janelas de agenda temporárias multi-semana** e resolução automática de conflito de um dia (resíduo de C16 e CQ-R6-03). Hoje o comportamento é seguro: uma mudança datada nunca vale além das suas datas, e o caso de um dia pergunta.
- **Itens de comunicação e registro:**
  - a pergunta de RIR do SSCTR-R1;
  - o check-in proativo;
  - a comunicação de CQ-R6-19;
  - MOVED-SESSION-SKIPPED.
- **Minors de substituição, knock-on e disclosure:**
  - QE-R7B2-02..04 e QR7B2-03;
  - F12–F14;
  - QE-R7B1-02/03 e QR7B1-06;
  - QE-R7B-R2-04 e R2-OBS-01;
  - F6–F10, Q-R7B-* e OBS-*.
- **Triagem clínica** (R11, R15, QE-R7ARA-OBS-1): PRE_TESTFLIGHT.
- **Itens de Data:** LEARNING-CONSENT-SCOPE, LOGGED-LOAD-PLAUSIBILITY, R5, R2, KNOWN-DOSE-OBSERVED-AT.
- **Backlog de policy:** D49, R16, R17, R48, B0-F05, CEILING-UNITS e a dose de peso corporal.
- **Outros:**
  - SSCTR-R14;
  - SSCTR-R7B2-02 (modelo de serviço; Founder e Product);
  - SSCTR-R7B2-01/-03, a menos que G01 toque o re-plan depois do clínico. Nesse caso entram, sob C1, C2 e C4.

**Roteamento:**
- T3/R2.
- L3 no freeze:
  - o SSCTR é obrigatório pelo CLAUDE.md;
  - Engineering independente;
  - Quality só para propriedades descobertas;
  - sem Security, porque nenhuma trust boundary muda.
- L4 só para OPEN_AMBIGUITIES 1 e 2.

**Fases:** três, em vez de quatro.
- **Fase 2:** re-baseline, implementação e testes.
- **Fase 3:** freeze, evidência dirigida (diferenciais, adversarial, mutação), SSCTR e Engineering, e closure se estiver limpo.
- **Fase 4:** só se algum gate achar um blocker novo, estreito e só de runtime. Nesse caso: no máximo um ciclo de correção, um recheck estreito e a closure.

Se o Founder escolher a opção (b) de G02, antes de implementá-la vem um envelope de aprendizado com binding próprio, no padrão B0, com registros do SSCTR. A R6-POLICY-5 não é tocada.

## PHASE_2_FILES_LIKELY_TOUCHED

- `CoachingCore/src/r6-adaptation.mjs`: caminhos KEEP, REARRANGE/rebuild e schedule change; a rota tipada de incerteza.
- `CoachingCore/src/r6-program.mjs`: leitura do stateTrace e da projeção, o teto de corrida isolada e o início do cap de novato.
- `CoachingCore/src/r6-provenance.mjs`: leitura das semanas decorridas, se necessário.
- `CoachingCore/src/r6-learning.mjs`, `src/r6-balanced.mjs` e o plano do próximo bloco (`src/r7b-repertoire.mjs`): G02, só dentro do envelope.
- `CoachingCore/SHADOW_INPUT_SCHEMA.json` e `SHADOW_DECISION_SCHEMA.json`: só se houver tipo novo de ASK ou campo novo.
- `CoachingCore/test/r7c-*.test.mjs` (novos); `CoachingCore/r7/c/`; `audits/domain-coaching-r7-c-2026-11-01/`.
- `CURRENT_MISSION.md` e `MISSION_LEDGER.md`, só por inserção.
- **Não tocar:** `PROGRAM_POLICY_R6.json`, o catálogo, o schema e a foundation da B0, artefatos de missões fechadas, `product/` e `canon/`.

## LATER_EVIDENCE_REQUIRED

Antes da closure:
1. Reprodução de cada defeito em escopo no R7B2-FREEZE-1, antes da correção.
2. Testes unitários e de integração da regra nova:
   - diferencial de caminhos e teste metamórfico;
   - pausa declarada contra lacuna não declarada;
   - CQ-R6-04.
3. Precedência clínica preservada:
   - K6/K6b e CAND-01/02;
   - o diferencial de 848 linhas sem mudança clínica;
   - cada pergunta nova vindo depois da rota clínica;
   - adversarial com 3.228 checks e 0 falhas.
4. Regressão:
   - a suíte completa (799 testes e os novos);
   - o gate da R7-A, classes A–E, com F1–F4, D53, D56–D59, HOLD e MAINTAIN fora do delta declarado;
   - a conformance da R7-B;
   - as closures da B.1 e da B.2.
5. Aprendizado:
   - diferencial com consentimento ligado, desligado e revogado;
   - H34, H35 e H20 só como regressão;
   - nenhum texto causal;
   - um evento nunca vira regra.
6. Mutação da regra nova: toda sobrevivente é morta ou documentada como equivalente.
7. Freeze R7-C (registro, source digest e manifest), com script de verificação só de leitura.
8. Gates:
   - SSCTR: ACCEPT ou ACCEPT_WITH_CONDITIONS. Deve confirmar se as aprovações sob o contrato de weekly review continuam valendo;
   - Engineering: READY;
   - Quality, se necessário;
   - acréscimo à fila pelo script de integração, se surgirem novos itens prescritivos aprovados.
9. O status do G03 registrado, aberto ou decidido, e o ASK tipado documentado para Product/Data.

## OPEN_AMBIGUITIES

1. **Posse de R18, C15 e CQ-R6-04.** Três registros dizem coisas diferentes:
   - R7-A: R7-C ("Entry for R7-C");
   - B0: PRE_KMP, com Engineering e Product/Data, e "R7-B / PRE_KMP";
   - R7-B: CONDITION de contrato do cliente.

   Reconciliação proposta: o mecanismo de runtime fica na R7-C, que vem antes do KMP; a pergunta ao atleta fica com G03. **Confirmar com o Founder.**
2. **Profundidade de CQ-R6-14.** Isto define a personalização da V1 (AEOS §17, P1/P3, contra VFT-H005). **Decisão do Founder.**
   - (a) Dentro do envelope atual. **Recomendado.**
   - (b) Regras novas de resposta individual entre ciclos, por exemplo a taxa de progressão do longão depois de longões adversos repetidos (H34). Pede antes um envelope novo com binding próprio e registros do SSCTR.
3. **G03** é de Product/Data e está aberto. A Fase 2 pode seguir neutra em relação a ele. Resolvê-lo agora (Product/UX, Data e SSCTR) é uma escolha, não um pré-requisito.
4. **Achados roteados para a "next runtime mission".** A R7-C absorveria só os do caminho que ela toca: R2-05, e SSCTR-R7B2-01/-03 somente se o mecanismo tocar o re-plan depois do clínico. Os minors de substituição ficariam para outro follow-up de runtime. **Confirmar.**
5. **Itens sem dono.** A B0 roteou cerca de 20 itens de planner e cold start para a R7-B, como CQ-R6-01/02/05/09/13/15/17/18/19, R8, R9, R19, INTAKE-CONTRADICTIONS e MOVED-SESSION-SKIPPED. O contrato da R7-B se restringiu ao binding do catálogo, e nenhum registro R7-B, B.1 ou B.2 os dispõe por ID. Não são da R7-C, mas hoje não têm dono explícito. Só um aviso.

## RECOMMENDED_NEXT_PROMPT

- Autorizar a R7-C Fase 2 em `claude/domain-coaching-r7-c`, a partir de `baa2cb1` (R7B2-FREEZE-1), com IMPLEMENTATION_AUTHORIZED = SHADOW_REFERENCE_RUNTIME.
- Confirmar que o mecanismo de runtime de R18, C15 e CQ-R6-04 é da R7-C, com incerteza tipada e neutra em relação ao G03; a pergunta ao atleta continua com Product/Data.
- Decidir a profundidade de CQ-R6-14: (a), dentro de R6-PARTIAL-NOISY-LEARNING, ou (b), com um envelope novo revisado pelo SSCTR antes.
- Começar pelo re-baseline com evidência (D1, D2, D4, D5) e implementar só os defeitos longitudinais reproduzidos.
- Preservar a precedência clínica e todas as closures; não mudar bytes de policy nem de catálogo.
- Manter o limite de loop: SSCTR e Engineering, uma review por gate, no máximo um ciclo estreito.
- Parar a Fase 2 com o runtime implementado e testado, sem freeze e sem review. A Fase 3 faz o freeze, a evidência e os gates.
