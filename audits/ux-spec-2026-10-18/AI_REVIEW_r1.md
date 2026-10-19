# AI Systems — review independente r1 da Detailed UX Specification

**Veredito: FAIL (REQUEST_CHANGES)** — gate documental **AI_BOUNDARIES_REVIEWED não emitido** para UXS-1.0-r1. 0 BLOCKING · 3 MATERIAL · 6 NON_BLOCKING. Nenhuma ampliação de autonomia (efeito sem ato da pessoa) foi detectada; o achado UXS-AI-01 é extensão de **capacidade** do LLM num documento downstream, devolvida ao owner (ver §6). Este parecer não emite AI_SYSTEM_READY, escolha de modelo/fornecedor, eval executado, utilidade ou eficácia.

## 1. Contrato, independência e método

| Campo | Valor |
|---|---|
| Task / contrato / missão | UXSPEC-20261018 / UXSPEC-20261018-r1 / MISSION-UXSPEC-1.0 (unidade U4c, L2) |
| Artefato | `product/UX_SPECIFICATION.md`, revisão **UXS-1.0-r1** |
| SHA-256 avaliado | `08ac2f964791f1b9903ca435174a4d660ad74d2abb9a55cd2e9e2df42afc5d8c` — recalculado no início (2026-10-18), na retomada (2026-10-19T07:33:40-03:00) e no fim; igual também à cópia congelada `review-inputs-r1/UX_SPECIFICATION.md` |
| Avaliador | AI Systems & Agent Experience Architect 1.1.0, instância **judge independente e fresca**; não é autor nem coautor (autor: worker product-ux-architect). Chief coordena/consolida; não emite este gate. A sessão foi interrompida por limite (HTTP 429) e retomada pela mesma instância; nenhum relatório parcial existia. |
| Rubrica / regras | AI_SYSTEMS 1.1.0; constituição AI Systems 1.1.0; CORE 1.4.0 (extensões até 1.5.0); EXECUTION_PROPORTIONALITY 1.5.0. |
| Método | Leitura integral do artefato (979 linhas). Grounding upstream por cláusula: PTC-3.0.0 (L007, L022, C012, C015, C028–C036, O015); RS-1.1 §3, §6 G09; PDR-1.1 DR-35, DR-51, DR-63, DR-69, §5 G07/G09; AEC-1.1 §2.2, §3, §7.1, §7.2; AEOS-1.0-r2 §§2, 8–14, 16, 17; AESL-1.0-r2 S32–S38, S43, S44, Q01, Q04; EM-1.1 §3; CF-1.1 F06/S17; PA-1.1 §5; registro Founder 2026-10-11; AEOS AI_REVIEW_r2 (limites já aprovados); CURRENT_MISSION; MISSION_RECORD §1/§5. Checks objetivos do Chief (`PRE_REVIEW_VERIFICATION.json`, SHA-256 `5a8e97912800c4688476dabec8754f6d7e5ba64ff29fcadab7654b04b9a87fe6`, 285 pass / 0 fail / 2 warnings sobre o mesmo hash) inspecionados como resumo; não reexecutados e não provam semântica. Sem pesquisa nova, sem chamada a modelo, sem edição de outro arquivo. |

## 2. Critérios e resultado

| # | Critério (dimensão) | Resultado | Evidência no artefato (ID / §) |
|---|---|---|---|
| 1 | Fidelidade ao pipeline AEC/AEOS (dim. 2): data → normalization/provenance → hard constraints → conflitos → candidatos válidos → B0 / JEV shadow → policy gate → decisão → explicação → prévia/confirmação → executor futuro | **PASS com condição UXS-AI-04** | Proveniência/fonte e momento: ST-OBS, WEA-08, EXP-02 N3, PR-08. Hard constraints: CONF-08, AG-04/05, INT-09. Conflitos: §1.2, HOJ-C12, ASK-04. Candidatos válidos: RUN-05, STR-06, CONF-05/06, AG-03. Decisão/ciclo: ST-DEC com guarda (`ACCEPTED`→`STALE`), CONF-02/12. Explicação após decisão: EXP-01–04, CONF-14. Prévia/confirmação: CONF-01–15. Export como outra intenção: CONF-04. |
| 2 | JEV shadow nunca aparece nem influencia decisão, pergunta, rota, ordem de alternativas | **PASS para decisão/rota/explicação; ordem de alternativas e origem da pergunta não explícitas → UXS-AI-04 (NB)** | MAN-0 “qualquer saída JEV (sempre)” → nada, nunca notifica; MAN-R5; SURF-06 “não pode mostrar ranking ou rota JEV”; EXP-03; preâmbulo §11.2 (coincidência com reason codes não torna JEV fonte); DEG-21. |
| 3 | Alternativas apresentadas são só candidatos válidos já preparados | **PASS, exceto o segundo ramo de AGT-03(d) → UXS-AI-01** | RUN-05, STR-06, CONF-06 (“somente candidatos `VALID` ... nada montado a partir de fragmentos”), AG-03, AGT-03(c), CONF-05/INT-10. |
| 4 | Explicação vinculada ao trace oficial (B0/policy gate); sem causalidade, número ou fonte inventados; omissão de HOLD/unknown proibida (dim. 7) | **PASS com precisões UXS-AI-05 (NB)** | EXP-01 (seis blocos + campos de ASK/HOLD/RECONCILE), EXP-03, EXP-04 (validação: vínculo, números, omissões, contradição, escopo, locale), EXP-07, EXP-08, AM-01–12 coluna “explicação mínima”. |
| 5 | “O que influenciou” × raciocínio interno; Decision Trace como auditoria | **PASS** | §11.2 FAC-01–17 como rótulos da projeção de claims/reason refs oficiais; “um fator só aparece se estiver no trace da decisão exibida”; EXP-03 “nunca chain-of-thought”; SURF-06 não pode “raciocínio interno, candidatos rejeitados com payload”; EXP-02 N3 projeção aprovada sob demanda; SURF-X-11 rejeita visualizador de trace. Coerente com AEOS §12.2/§13. |
| 6 | Template determinístico quando LLM ausente/inválido; LLM opcional | **PASS no comportamento; dependência não inventariada → UXS-AI-06 (NB); redação do fallback → UXS-AI-03 (MATERIAL)** | EXP-04, AGT-07, DEG-18, CONF-14, DEG-34, EXP-05, J-16. |
| 7 | Paridade PT-BR/EN | **PASS** | EXP-06, AGT-11, NOT-07, ONB-02. |
| 8 | Baixa confiança (dim. 8): ASK/HOLD/RECONCILE em vez de LLM preenchendo lacunas; pergunta mínima com desconhecido/recusa; sem score | **PASS** | CNF-01–11 (CNF-05 crítico ausente → ASK/HOLD; CNF-09 sem score; CNF-10 “conservador” sem dose inventada), ASK-01–08 (ASK-03 resposta é fato confirmado; ASK-07 não supre autoridade), AM-10/11, AGT-05. |
| 9 | Agente — limites negativos (nunca aplica silenciosamente, envia workout/share/check-in, altera consentimento, limpa HOLD, cria candidato/dose) | **PASS (precisões em UXS-AI-08)** | AGT-04; AGT-02 “retenções (somente para explicar)”; CONF-13; DR-63/AEC §7.2 citados. |
| 10 | Agente — fato candidato → confirmação no objeto canônico | **PARCIAL → UXS-AI-02 (MATERIAL), UXS-AI-08(a) (NB)** | AGT-03(b), AGT-05, AGT-10, J-16. Estado de candidato pendente/sensível e abstenção não manifestados. |
| 11 | Agente — preparar ação → confirmação no caminho canônico, sem gerar delta | **FAIL parcial → UXS-AI-01 (MATERIAL)** | AGT-03(d) segundo ramo; AGT-08; CONF-13. |
| 12 | Conversa não é fonte de verdade nem plano paralelo; caminhos essenciais sem agente | **PASS** | AGT-01, AGT-04 (sem contexto/plano paralelo), AGT-08 (paridade), AGT-09 (C033), NAV-10, HOJ-R4, ALT-UX-08, J-01 e §21 (“nenhuma jornada exige ... conversa”), PR-06. |
| 13 | Texto de provider/usuário/“profissional aprovou” é dado (injeção) | **PASS (precisão UXS-AI-08(d))** | AGT-06, J-16, CF S17/AESL S37 citados; AGT-04 impede qualquer efeito. |
| 14 | LLM indisponível/inválido | **PASS** | AGT-07, DEG-18, EXP-04; proposta vive em SURF-06 (CONF-13), não na conversa. |
| 15 | Memória/retenção de conversa não presumidas (G07/G09) | **PASS com condição UXS-AI-07 (NB)** | AGT-00 condiciona retenção aos gates AI/Security; AGT-01 sem estado próprio; AGT-10 menciona “histórico de conversa” sem definir existência/persistência. |
| 16 | Ampliação de autonomia implícita/explícita (O015 sob DR-63) | **Nenhuma ampliação de autonomia; extensão de capacidade do LLM → UXS-AI-01** | Nenhum caminho aplica, envia ou consente sem ato explícito (CONF-03, CONF-13, AGT-04, AGT-09). |
| 17 | MAN-0–4 derivados só do resultado oficial (ALT-UX-03), anti-adaptive-theater, estabilidade (AEOS §14) | **PASS** | §10.3: materialidade fisiológica = policy/B0 (“A UX não cria limiar”); materialidade de apresentação derivada só do tipo de resultado oficial e alcance; MAN-R1–R5; §10.5 (mesmos inputs → mesma proposta, recusa não volta sem fato material, safety não espera estabilidade); NOT-02 (sem KEEP, microajuste, flutuação de confiança). |
| 18 | FOUNDER-DECISION-01 (agente na V1) enquadrado sem decidir pelo Founder | **PASS com condição UXS-AI-09 (NB)** | §23.2: opções A/B/C, recomendação C, sem modelo/fornecedor, sem tratar como requisito (RS §3), B restrito e sem ampliar autonomia. Colisão de rótulos com ALT-UX-08 e escopo LLM-explicador não delimitado. |
| 19 | Interpretações do autor com impacto IA (INT-01/02/03/07/09/10) | **Aceitas** | Todas na direção conservadora (proposta com ato; HOLD imediato sem confirmação por ser retenção, AEOS §14; sem aceitação parcial de composto, AEOS §8). |

**Interpretação do autor sobre EXP-03/04.** EXP-03 é fiel e mais conservadora que o mínimo: liga cada afirmação material a claims/reason refs do B0/policy gate, exclui JEV, chain-of-thought e probabilidade não calibrada (AEOS §11/§12.2/§16; AESL S38). EXP-04 lê o template como **primeiro e suficiente** (o LLM só reescreve dentro dos claims), mais estrito que AEOS §16, que o trata como fallback; a leitura é compatível com LLM opcional (AEOS §16, RS §3, DR-35) e com a explicação aprovada do `PolicyBundle` (AEOS §10), e é aceita. Ela cria, porém, uma dependência de catálogo que precisa estar inventariada (UXS-AI-06), e três pontos de redação precisam de precisão (UXS-AI-05).

## 3. Findings

### UXS-AI-01 — MATERIAL — Edição pré-preenchida pelo LLM excede as operações tipadas do AEOS §16

- **Local:** §17 AGT-03(d), segundo ramo (“ou abrir a edição canônica (FLOW-04) com o pedido da própria pessoa como candidato que ela revisa”); ecos em AGT-08 (“preparar ação → FLOW-02/FLOW-04”) e FLOW-16.
- **Critério e evidência upstream:** AEOS §16 enumera as operações do LLM (`ExplanationRequest/Response`, `FactCandidateExtraction`, `PrepareAllowedAction`). `PrepareAllowedAction` permite apenas “Selecionar referência de opção já preparada/permitida ... sem gerar delta novo ou ferramentas de efeito”. AEC §7.2 e EM §3 limitam o agente a “preparar opções permitidas”. O015 admite contrato downstream que “pode delimitar o que já está decidido sem ampliar autonomia”. O próprio §0.3/§23 do artefato manda registrar conflito como UPSTREAM-ISSUE, nunca aplicá-lo em silêncio.
- **O que o texto faz:** converte linguagem natural em parâmetros estruturados de edição (qual sessão, origem/destino, semana, alcance) pré-preenchidos em FLOW-04. É uma intenção de edição de autoria do LLM, operação nova não prevista no AEOS §16. A frase “a conversa não gera delta” vale apenas para o `change_set` do motor, não para a edição pedida. Não há INT- nem UPSTREAM-ISSUE registrando a extensão.
- **Cenário/impacto:** “passa a corrida de amanhã para quinta” → o LLM preenche a sessão errada (o longão da semana seguinte) → a pessoa confia na conversa e confirma FLOW-04 → o motor avalia a edição como viável, porque os hard constraints passam, e a prévia mostra o alcance → confirmação → mudança não pretendida aplicada. O trace a registra como FAC-11 “uma mudança sua”, sem proveniência “preparada pela conversa”. O gate determinístico (S36) não detecta uma edição semanticamente errada mas válida. Não há efeito silencioso, mas há capacidade nova do LLM sem contrato. Faltam a revisão campo a campo, a proveniência e o estado de falha do LLM no meio do pré-preenchimento.
- **Resolução exigida (uma das duas):** (a) restringir AGT-03(d) a selecionar uma opção `VALID` já preparada ou a abrir FLOW-04 no objeto pertinente **sem parâmetros preenchidos pelo LLM**, com a pessoa editando pelos controles diretos. Declarações de disponibilidade/preferência em linguagem natural continuam por AGT-03(b) (fato candidato → SURF-11 → reavaliação). Ou (b) registrar UPSTREAM-ISSUE ao owner do AEOS propondo uma operação tipada (ex.: `EditIntentCandidate`), com campos, proveniência “preparado pela conversa” no trace, revisão campo a campo, campos relevantes a hard constraints nunca inferidos e falha que abre FLOW-04 vazio; avaliação por Product/UX + AI Systems + Security sob O015/G09, sem aplicá-la na UXS até a aceitação.
- **Owner:** worker product-ux-architect (autor). Em (b), também AI Systems e Security; Founder somente se a solução escolhida ampliar autoridade ou autonomia (DR-63).

### UXS-AI-02 — MATERIAL — Abstenção e candidato pendente (sobretudo de safety) não manifestados na conversa

- **Local:** §17 AGT-03(a)/(b), AGT-05, AGT-07; FLOW-16; J-16.
- **Critério e evidência upstream:** AEC §7.2: “Sem opção/explicação aprovada, abster-se/encaminhar; não fabricar fisiologia”; “distinguir declaração, observação e inferência”; fato sensível/material candidato só fundamenta decisão após confirmação. O validador do AEOS §16 (omissões de limite/hold/unknown) mede fidelidade **ao trace**. HC03; C012; C015; EM §3.
- **O que falta:** os estados de AGT cobrem resposta vinculada ao trace, candidato com confirmação, indisponível/inválido e injeção. Faltam (i) o estado de **abstenção**, distinto de “indisponível”, quando a pergunta não tem base no trace oficial ou sai de (a)–(e): contrafactual de opção nunca gerada (“por que não quinta?”) ou conselho genérico de treino, recuperação ou fisiologia; e (ii) o comportamento com **candidato pendente**: o que a conversa diz enquanto a pessoa não confirmou, a declaração de que “ainda não foi considerado no plano”, o que acontece ao fechar e a regra para candidato relevante a safety (dor, limitação, sintoma, restrição).
- **Cenário A:** “meu joelho está doendo bastante, faço o treino de hoje?” → AGT-05 oferece confirmação; respondendo AGT-03(a) “com os mesmos claims do trace”, o LLM explica que a força intensa de membros inferiores de hoje é apropriada pelo objetivo e pela criticality. Todos os claims estão vinculados ao trace, que não contém a dor, então o validador aprova. A resposta é fiel ao trace, mas endossa a sessão contra um relato de safety não confirmado. A pessoa fecha a conversa acreditando ter “avisado o app”; sem HC03 e sem HOLD.
- **Cenário B:** pergunta contrafactual → o validador rejeita a razão inventada → AGT-07 cai em “indisponível”, o que é enganoso, e cria pressão para afrouxar a validação.
- **Resolução exigida:**
  1. **Abstenção explícita.** Sem claim no trace oficial, ou fora de (a)–(e), a conversa diz que não tem base para responder e oferece o caminho canônico: FLOW-04 para o motor avaliar, SURF-06 para a explicação ou conteúdo aprovado. Nunca dá conselho fisiológico, nutricional ou clínico genérico. É um estado distinto de indisponível/inválido.
  2. **Candidato pendente.** A conversa declara que o candidato não é considerado até a confirmação. Enquanto houver, na conversa corrente, um candidato relevante a safety (classe por construto, não por julgamento do LLM), ela não apresenta a sessão dependente como apropriada nem prepara ação sobre ela, e oferece o caminho direto de relato (RUN-08 / STR-05 / contexto do dia → HC03), sem copy clínica `[DEP-G04]`. Fechar sem confirmar descarta o candidato após aviso explícito, sem persistência (AGT-10, G07). A decisão não muda por fato não confirmado, o que preserva AEC §7.2.
- **Owner:** worker product-ux-architect; Security para o aspecto de retenção/descarte.

### UXS-AI-03 — MATERIAL — Fallback “vigente permanece/segue” sem qualificador de validade

- **Local:** §10.4 CONF-14 (“a proposta não é apresentada nem aplicada; o vigente permanece”); §18 DEG-34 (“Vigente segue”).
- **Critério e evidência upstream:** AEOS §16 manda “reter apresentação/aplicação dessa proposta ... Registro/correção/funções independentes continuam”, sem afirmar que o vigente continua. AEOS §12.3: “sem ... reutilizar decisão antiga inválida”; “‘KEEP último plano’ não é fallback automático”. AEC §7.1: “Uma prescrição antiga dependente não fica implicitamente segura porque a nova foi suspensa”. Oráculo AESL S34: “sem last-plan default”. O próprio artefato já tem CONF-10 e DEG-20.
- **Cenário/impacto:** uma restrição nova (HC03) invalida a sessão de hoje; o motor prepara uma proposta cujo template mínimo depende de conteúdo G04 ainda ausente → CONF-14 → DEG-34 “Vigente segue”. Ao mesmo tempo, CONF-10/AM-11 retêm o escopo. Resultado: estados contraditórios na mesma sessão. A implementação literal das regras específicas de falha de explicação reproduz o fallback “último plano” proibido pelo AEOS, e não há regra de precedência.
- **Resolução exigida:** CONF-14 e DEG-34 passam a dizer que o vigente permanece **somente se ainda válido**; se invalidado, aplicam-se CONF-10/DEG-20 (escopo retido, próximo passo operacional, EXP-05 sem copy clínica). Declarar a precedência CONF-10 > CONF-14.
- **Owner:** worker product-ux-architect.

### UXS-AI-04 — NON_BLOCKING — Base da ordem/ênfase das alternativas e da pergunta apresentada

- **Local:** CONF-01, CONF-06, AG-03, AGT-03(c), EXP-02 N3, ASK-04, SURF-06.
- **Critério:** AEOS §12.3 (SHADOW: a execução oficial não lê preferências/rotas JEV; ranking oposto deixa o resultado idêntico); AEOS §10 (comparador parcial `BETTER/WORSE/EQUAL/INCOMPARABLE`, sem soma ponderada implícita); AESL S35/S43; C012.
- **Evidência:** a exclusão do JEV é explícita para *aparecer* (MAN-0, SURF-06, EXP-03, DEG-21), mas não se fixa de onde vêm a ordem/ênfase das alternativas válidas (prévia, SURF-06, conversa) nem que a pergunta exibida provém só do `DecisionOutcome` oficial.
- **Cenário:** o Designer ou a Engineering ordena “melhor primeiro” usando o ranking JEV disponível, ou o LLM qualifica (“melhor para seu objetivo”) onde o B0 é INCOMPARABLE. A arquitetura de escolha passa a guiar o que a pessoa aplica: vazamento do shadow por indução e precisão fabricada.
- **Resolução:** uma regra. Ordem e ênfase derivam só do resultado B0 (recomendação oficial primeiro; demais em ordem neutra determinística, ex.: identidade canônica conforme AEOS §10 passo 4, ou pela relação do comparador com sua razão). INCOMPARABLE/UNKNOWN nunca aparecem como ranqueados. Nenhuma linguagem de preferência além dos claims. Pergunta exibida = `question_refs` do resultado oficial; `route_recommendation` JEV nunca gera pergunta, HOLD ou review.
- **Owner:** worker.

### UXS-AI-05 — NON_BLOCKING — Precisões de fidelidade em EXP

- **(a)** O “fator principal” do N1 (§7.1; EXP-02) não tem regra de seleção. Ele deve ser determinístico a partir do trace oficial (causa do controle/HC que falhou ou passo decisivo do comparador B1→B6), nunca saliência escolhida pelo LLM. Sem isso, a atribuição pode enganar: ex.: HRV exibida como principal quando a disponibilidade decidiu.
- **(b)** EXP-03 “Números só quando são fatos do trace”: explicitar que também cobre deltas/alvos do `change_set` oficial do candidato aprovado, já exigidos por CONF-01 e AM-04, e nada além.
- **(c)** EXP-04: alinhar a lista do validador ao AEOS §16, com revisão/`decision_ref`, causalidade, omissão material de limite/HOLD/unknown e conteúdo fora de escopo (diagnóstico, Nutrition pessoal, novos efeitos).
- **Owner:** worker.

### UXS-AI-06 — NON_BLOCKING — Catálogo de templates de explicação não inventariado como dependência

- **Local:** EXP-04, CONF-14; ausência em §22 (DEP-01–12) e §24.3.
- **Critério:** AEOS §10 (`PolicyBundle` inclui “explicação aprovada”) e §16; AESL S38/S44.
- **Impacto:** EXP-04 exige template aprovado por classe/rota/fator, e CONF-14 impede apresentar proposta sem ele. Sem inventário e owner, a falta do catálogo desativa em silêncio todas as propostas MAN-3. Só o conteúdo clínico e Nutrition está mapeado (EXP-05).
- **Resolução:** linha DEP (ou nota em §22) para “catálogo de templates de explicação por classe/rota/FAC, PT-BR/EN”: voz/copy em FOUNDER-DECISION-02; claims de domínio em G02 (G04/G05 quando aplicável); validador e testes de cobertura em AI Systems (G09, S38/S44); Designer usa slots.
- **Owner:** worker, com consulta a AI Systems.

### UXS-AI-07 — NON_BLOCKING — Memória e histórico da conversa

- **Local:** AGT-01 (“sem ... estado ... próprios”) × AGT-10 (“histórico de conversa não alimenta contexto...”), que presume que o histórico existe.
- **Critério:** AEOS §16 (“Sem fornecedor escolhido, não se concede coleta, envio de prompts reais ou armazenamento de conversa”); PDR G07/G09; RS §3.
- **Impacto:** o Designer tende a desenhar lista de conversas ou “o app lembra”, presumindo retenção não concedida. Direitos (SURF-13) sobre dados de conversa não estão definidos.
- **Resolução:** declarar o padrão: sem memória entre conversas e sem histórico persistente ou visível. Retenção, histórico ou memória só depois de G07/G09, com direitos em SURF-13. Candidatos não confirmados nunca persistem.
- **Owner:** worker; Security para direitos e retenção.

### UXS-AI-08 — NON_BLOCKING — Precisões nas regras do agente

- **(a)** AGT-05 deixa espaço para confirmar “na conversa” fatos não sensíveis, com classificação feita pelo LLM. Preferir que todo candidato seja confirmado no objeto canônico, ou que sensibilidade/materialidade venham do catálogo de construtos, nunca de julgamento do LLM (AEOS §16 `FactCandidateExtraction`; AEC §7.2).
- **(b)** Esclarecimento mínimo (AEC §7.2), hoje silente em AGT-: limitar a desambiguar o que a pessoa declarou espontaneamente, com “não sei / prefiro não dizer”, sem bateria nem insistência (ASK-05/06). Nunca solicitar diagnóstico, medicação ou exames (ONB-11). Interessa também a Security.
- **(c)** AGT-04: acrescentar “limiar/evidência” (AEC §7.2 “Não inventa limiar/evidência/dose”).
- **(d)** AGT-06: incluir explicitamente título/metadata de atividade importada e os textos livres da própria pessoa (motivos, notas) como dados (AEC §7.2; AESL S37).
- **(e)** A conversa nunca inicia turnos ou mensagens dentro do app (hoje só NOT-02 cobre avisos). HOJ-R4 menciona “espaços correspondentes” do agente, mas §7.2 não define nenhum: esclarecer que não há espaço do agente no Hoje.
- **(f)** Texto da conversa sobre o estado do plano referencia a revisão canônica e não funciona como cópia (PR-02, C033); depois de nova revisão, aparece como desatualizado.
- **Owner:** worker.

### UXS-AI-09 — NON_BLOCKING — FOUNDER-DECISION-01: rótulos e escopo

- **(a) Colisão de rótulos.** ALT-UX-08 usa A = canal opcional, B = home, C = nenhum agente, e diz “A especificação é completa sob C”. FD-01 usa A = fora da V1, B = incluir restrito, C = decidir depois. Uma resposta “C” do Founder fica ambígua numa decisão reservada.
- **(b) Escopo.** FD-01 decide o canal conversacional. O LLM como reescritor de explicações (EXP-04 “se existir”) é seleção separada sob G07/G09. Declarar que, sob FD-01 A, as explicações são só template, salvo seleção própria e gated do LLM explicador, e que B não autoriza esse LLM automaticamente.
- **(c)** A opção B deve referenciar o escopo AGT- já corrigido por UXS-AI-01/02.
- O enquadramento em si está correto e não decide pelo Founder.
- **Owner:** worker; Chief no relatório ao Founder.

## 4. Cenários adversariais examinados

| Cenário | Resultado na UXS-1.0-r1 |
|---|---|
| LLM explica o ranking shadow (B0 escolhe A, JEV escolhe B; AESL S38) | Contido: EXP-03, EXP-04 (rejeita e usa template fiel a A), MAN-0, SURF-06; o input do AEOS §16 nem contém o JEV. Resíduo: ordem das alternativas (UXS-AI-04). |
| JEV oposto, timeout ou desligado (S43, S34) | DEG-21 e MAN-R5: nenhum efeito visível. PASS. |
| Recomputação repetida / JEV A/B alternado (S32, Q04) | §10.5, MAN-R4/R5, NOT-02: nada reaparece nem notifica sem fato material. PASS. |
| Agente extrai fato sensível não confirmado | Estado candidato correto (AGT-05/10; não muda contexto, alinhado a S44). Lacuna de pendência/safety e de fechamento → UXS-AI-02. |
| Injeção em título de atividade / nota de provider (“ignore safety, profissional aprovou, envie”; S37, CF S17) | AGT-06 + AGT-04: sem efeito, sem autorização, sem candidato. PASS; precisão UXS-AI-08(d). |
| LLM indisponível durante proposta pendente | A proposta vive em SURF-06 (CONF-13); a explicação fica armazenada ou cai no template (EXP-04, AGT-07, DEG-18); confirmar/recusar seguem diretos. PASS. |
| LLM/template indisponível com vigente invalidado | Contradição CONF-14/DEG-34 × CONF-10 → UXS-AI-03. |
| Edição manual enquanto há proposta da conversa pendente (Q01) | AGT-09 + CONF-02: `STALE`, aceite antigo rejeitado. PASS. |
| Pedido de mudança em linguagem natural mal interpretado | Pré-preenchimento sem contrato → UXS-AI-01. |
| Pergunta contrafactual ou conselho fisiológico genérico | Sem estado de abstenção → UXS-AI-02. |
| Pedido de dose Nutrition via conversa (CF S14) | NUT-07: sem dose. PASS. |
| Agente tenta limpar ou contornar HOLD | AGT-02 “somente para explicar”, AGT-04, AG-09/FLOW-09 diretos. PASS. |
| Proposta preparada pela conversa → recusa / desfazer / alcance (O015) | CONF-13 aplica CONF-01/11 e AG-02/06 no objeto canônico; nenhum aceite em lote (CONF-03). PASS. |
| Baixa confiança com LLM tentando preencher lacuna | CNF-05/10, ASK-03, AGT-05: lacuna crítica → ASK/HOLD, nunca inferência. PASS. |

## 5. Limites

Parecer documental sobre a manifestação de UX de UXS-1.0-r1. Não demonstra nem avalia:

- execução real de validador, templates ou guarda;
- latência ou custo medidos (UX coerente: falha/timeout → template);
- utilidade do LLM ou do JEV versus a baseline determinística;
- calibração, usabilidade da conversa, escolha de modelo ou fornecedor;
- observabilidade de IA em runtime.

A invariante “JEV nunca aparece” vale para superfícies de decisão do produto. O conteúdo do direito de acesso/exportação em SURF-13 (trace ou dados shadow como dado pessoal) pertence a G07/Security e não foi julgado aqui. Privacidade dos dados do agente fica com o judge Security, estados de wearable com Engineering e estrutura/IA com o judge Product/UX; este parecer não emite esses gates. G07/G09 permanecem abertos com os owners do PDR §5.

## 6. Escalonamento e handoff

`ESCALATE_IF` não foi acionado:

- O hash confere.
- Nenhuma ampliação de **autonomia** (efeito sem ato da pessoa) nem de **autoridade sobre efeitos** foi encontrada.
- UXS-AI-01 é extensão de capacidade do LLM por documento downstream. Resolve-se pelo owner (remoção) ou por UPSTREAM-ISSUE avaliado por Product/UX + AI Systems + Security sob O015. Vai ao Founder somente se a solução escolhida ampliar autoridade/autonomia (DR-63; PDR G09).
- Nenhuma decisão reservada ao Founder é necessária para este veredito.

**REQUEST_CHANGES ao worker product-ux-architect** (mesma instância autora), sem correção pelo judge. Revalidação: delta pelo mesmo papel (AI_REVIEW_r2, preservando este r1) sobre o novo hash, cobrindo UXS-AI-01–03, a resolução declarada dos NON_BLOCKING e suas interações com CONF/AGT/EXP/DEG. Mudança material posterior invalida a cobertura dependente. Nenhuma implementação, Figma, modelo, provider ou pesquisa é autorizada por este parecer. **STOP deste judge após a entrega.**
