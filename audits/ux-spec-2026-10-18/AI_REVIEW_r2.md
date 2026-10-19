# AI Systems — revalidação de delta r2 da Detailed UX Specification

**Veredito: PASS WITH NON-BLOCKING FINDINGS** — **AI_BOUNDARIES_REVIEWED** (documental) emitido para **UXS-1.0-r2**, SHA-256 `092ec0336ddaf6bee5257d3c45a5f34ad5ac232beb9cb26ee1a2604d4b410bec`.

- Os nove findings de r1 estão **RESOLVED**.
- Não houve regressão nos limites de agente, LLM e JEV.
- Não há ampliação de autonomia nem de autoridade.
- Há dois novos findings NON_BLOCKING (UXS-AI-R2-01/02).

Este parecer não emite AI_SYSTEM_READY, não escolhe modelo ou fornecedor e não executa evals. Também não avalia utilidade, eficácia nem os domínios Product/UX, Security ou Engineering.

## 1. Contrato, independência e método

| Campo | Valor |
|---|---|
| Task / contrato | UXSPEC-20261018 / UXSPEC-20261018-r1. Unidade U6: revalidação de delta pelo mesmo papel e pela mesma instância judge de r1. |
| Artefato avaliado | `product/UX_SPECIFICATION.md` **UXS-1.0-r2**, SHA-256 `092ec0336ddaf6bee5257d3c45a5f34ad5ac232beb9cb26ee1a2604d4b410bec`, 192 715 bytes. Hash recalculado no início (2026-10-19T08:07:41-03:00), na retomada após o HTTP 429 (12:32:03-03:00) e no fim. Igual à cópia congelada `review-inputs-r2/UX_SPECIFICATION.md` e ao `MANIFEST.json` r2. |
| Revisão anterior | UXS-1.0-r1, `08ac2f96…`; parecer [AI_REVIEW_r1](AI_REVIEW_r1.md), `bbe035be…`, preservado byte a byte. |
| Apoio | `AUTHOR_RESPONSE_r1.md` (`f819d69c…`), `review-inputs-r2/DIFF_r1_r2.patch` (`d4cac7a1…`, só informativo), `PRE_REVIEW_VERIFICATION_r2.json` (`3ad1c12b…`: 293 pass / 0 fail / 2 warnings sobre o hash r2). Os checks foram inspecionados como resumo, não reexecutados, e não provam semântica. |
| Avaliador | AI Systems & Agent Experience Architect 1.1.0, judge independente. Não é autor nem coautor; não corrigiu o artefato. Duas interrupções por limite de sessão (HTTP 429) não alteraram inputs nem produziram relatório parcial. |
| Rubrica | AI_SYSTEMS 1.1.0; constituição 1.1.0; CORE 1.4.0/1.5.0; EXECUTION_PROPORTIONALITY 1.5.0. |
| Método | Leitura integral, na revisão congelada, das partes alteradas ou novas com efeito em IA: AGT-00–14, FLOW-16, NAV-07, ALT-UX-08, ST-DEC, HOJ-S2/R4/R7/R8, §7.1, CONF-09/14/15/16/17, EXP-02/03/04/09, DEG-08/34/36/37, J-09/J-16, DEP-13, UPSTREAM-ISSUE-03, FOUNDER-DECISION-01, INT-01/02. Busca de toda menção a JEV, LLM, conversa, trace, template e candidato, no texto r2 e no diff. Os upstream usados são os mesmos do r1: AEC §7.2, AEOS §§8, 10, 12, 13, 14 e 16, AESL, PTC O015/C032/C033, PDR DR-63/G07/G09. O que passou em r1 e não mudou não foi reaberto. |

## 2. Resolução dos findings de r1

| Finding r1 | Sev. | Resultado | Evidência em r2 |
|---|---|---|---|
| UXS-AI-01 — edição pré-preenchida pelo LLM | MATERIAL | **RESOLVED** | AGT-03(d) agora só seleciona opção `VALID` já preparada (FLOW-02) ou abre FLOW-04 “**sem parâmetros preenchidos pela conversa** — a pessoa edita pelos controles diretos”. Disponibilidade e preferência seguem o fato candidato (b). Explícito: “a conversa não gera delta nem intenção de edição”. Coerente em AGT-08, FLOW-16 e J-16. Resta só a operação permitida pelo AEOS §16 (`PrepareAllowedAction`); nenhuma operação nova. Abrir o objeto pertinente é navegação visível, equivalente a (e), sem efeito. |
| UXS-AI-02 — abstenção e candidato pendente | MATERIAL | **RESOLVED** (precisão nova em R2-01) | **AGT-12:** abstenção explícita sem claim no trace ou fora de (a)–(e) — contrafactual “por que não quinta?”, conselho genérico de treino, recuperação, fisiologia, nutrição ou clínico. Oferece FLOW-04, SURF-06 ou conteúdo aprovado; estado distinto de AGT-07. **AGT-13:** declara que o candidato não é considerado antes da confirmação. Com candidato de safety pendente, não apresenta a sessão dependente como apropriada nem prepara ação; oferece relato direto (HOJ-R7/RUN-08/STR-05 → HC03), sem copy clínica. Fechar descarta após aviso, sem persistência; “a decisão nunca muda por fato não confirmado”. J-16 cobre os três ramos. |
| UXS-AI-03 — fallback “vigente segue” | MATERIAL | **RESOLVED** | CONF-14: “o vigente permanece **somente se ainda válido**. Se estiver invalidado, valem CONF-10 e DEG-20 … Precedência: CONF-10 > CONF-14”, com fontes AEOS §12.3/§16, AEC §7.1 e AESL S34. DEG-34 traz o mesmo qualificador. Propagado a CONF-09, DEG-08 e J-09 (“enquanto válido (CONF-10)”). |
| UXS-AI-04 — ordem e ênfase das alternativas | NB | **RESOLVED** | EXP-09: recomendação oficial primeiro; demais alternativas em ordem neutra determinística (identidade canônica, AEOS §10 passo 4, ou relação do comparador com sua razão). `INCOMPARABLE`/`UNKNOWN` nunca ranqueadas; sem linguagem de preferência além dos claims. Pergunta exibida só dos `question_refs` oficiais; “a rota do JEV nunca gera pergunta, HOLD ou revisão”. |
| UXS-AI-05 — precisões em EXP | NB | **RESOLVED** | EXP-02 e §7.1: fator principal determinístico (causa do controle/HC que falhou, senão passo decisivo B1→B6; “nunca por saliência escolhida pelo LLM”). EXP-03: números incluem deltas/alvos do `change_set` oficial, “nada além disso”. EXP-04: lista do validador alinhada ao AEOS §16 (`decision_ref`/revisão, suporte, números e causalidade, omissão de limite/HOLD/desconhecido, contradição, fora de escopo, locale). |
| UXS-AI-06 — catálogo de templates | NB | **RESOLVED** (o conteúdo continua dependente, como esperado) | DEP-13: catálogo por classe/rota/FAC em PT-BR/EN. Owners: G02 (G04/G05) para claims; G09/AI Systems para validador e cobertura (S38/S44); FD-02 para voz. Impacto declarado: sem o catálogo, nenhuma proposta MAN-3 (CONF-14). |
| UXS-AI-07 — memória e histórico | NB | **RESOLVED** | AGT-01: “Efêmero por padrão: sem memória entre conversas e sem histórico persistente ou visível; retenção, histórico ou memória só depois de G07/G09, com direitos em SURF-13; candidatos não confirmados nunca persistem.” AGT-10 deixou de presumir histórico. |
| UXS-AI-08 — precisões do agente | NB | **RESOLVED** | (a) AGT-05: “Todo candidato é confirmado no objeto canônico; sensibilidade e materialidade vêm do catálogo de construtos, nunca do julgamento do LLM”. (b) Esclarecimento limitado ao que a pessoa declarou espontaneamente, com “não sei / prefiro não dizer”, sem bateria; nunca pede diagnóstico, medicação ou exames. (c) AGT-04 inclui “limiar, evidência”. (d) AGT-06 inclui título/metadata importados e textos livres próprios. (e) AGT-14 e HOJ-R4: a conversa nunca inicia turnos, mensagens ou avisos e não tem espaço no Hoje. (f) AGT-14: resposta sobre o plano referencia a revisão canônica e aparece desatualizada depois de nova revisão. |
| UXS-AI-09 — FD-01 | NB | **RESOLVED** | FD-01 com rótulos EXCLUIR/INCLUIR/ADIAR. ALT-UX-08 mapeia: INCLUIR→A, EXCLUIR→C, ADIAR mantém C. Escopo explícito: o LLM explicador é “seleção separada e gated — sob EXCLUIR, explicações só por template, e INCLUIR não autoriza esse LLM automaticamente” (repetido em AGT-00). INCLUIR referencia AGT-01–14 corrigidos. A recomendação continua sem decidir pelo Founder e sem escolher modelo ou fornecedor. |

## 3. Regressões nas partes novas

| Parte nova | Verificação de limite IA | Resultado |
|---|---|---|
| AGT-10 (escopo legível) | Exclui objetos de Crew e dados de terceiros; destinatário do agente ou do LLM explicador exposto em FLOW-15/SURF-13 se selecionado. Só estreita o escopo. | Sem regressão (privacidade pertence a Security). |
| NAV-07 | P0 encerra sem efeito a ação preparada do FLOW-16. Conservador. | Sem regressão. |
| CONF-16 (iniciar com proposta pendente) | Iniciar não confirma (CONF-03); a proposta passa a `STALE` com motivo factual; safety continua imediata (CONF-10). Não dá papel ao LLM/JEV. Ponto de ancoragem → **UXS-AI-R2-02 (NB)**. | Sem regressão material. |
| CONF-17 (atos pendentes offline) | Intenção pendente decidida pela guarda determinística (§13.1). Resposta de ASK offline sem efeito até reavaliação. Limitação offline suspende localmente a orientação preparada, sem limiar inventado. Nenhuma inferência por modelo. | Sem regressão. |
| HOJ-R7 (relato antes de iniciar) | Entrada direta e não solicitante; fato vai a OBJ-08 → HC03, determinístico. É o caminho direto para onde AGT-13 encaminha; reforça a paridade sem conversa (C030). | Sem regressão. |
| ST-DEC `ACCEPTED` | “confirmação registrada, aplicação pendente — nunca exibida como aplicada antes do commit”: honestidade de estado sobre a guarda. | Sem regressão. |
| UPSTREAM-ISSUE-03 / INT-01 (plano inicial) | Nota ao owner do AEOS para representar o plano inicial como `DecisionRecord`/`CandidateSet` com plano-base “sem plano” e `APPLY_PLAN_CHANGE`, aplicando guarda, `STALE` e HC. Não inventa classe, não propõe geração por LLM (AEOS §2: “Nenhum gerador LLM livre”) nem papel do JEV. Não é aplicado em silêncio. | Sem regressão; direção conservadora. |
| EXP-09 / novas menções a JEV | A única menção nova a JEV (EXP-09) é restritiva. MAN-0, MAN-R5, SURF-06, EXP-03, preâmbulo §11.2 e DEG-21 seguem intactos. | Sem regressão. |
| Novas menções a LLM | AGT-00, AGT-05, AGT-10, EXP-02, EXP-04, FD-01: todas restringem ou condicionam o LLM. | Sem regressão. |

**Autonomia e autoridade.** Nenhuma regra nova permite efeito sem ato explícito da pessoa. Continuam valendo CONF-03, CONF-13, AGT-04, AGT-09 e AGT-14. Nenhuma concede ao LLM ou ao JEV operação, ferramenta, leitura ampliada, persistência ou papel no commit. Em relação a r1, o conjunto de capacidades do agente **diminuiu**: não pré-preenche edições, não tem memória e não lê dados de Crew. `ESCALATE_IF` não foi acionado.

## 4. Findings novos (r2)

### UXS-AI-R2-01 — NON_BLOCKING — Fontes determinísticas usadas por AGT-05/AGT-13 sem inventário

- **Local:** AGT-05 (“catálogo de construtos”), AGT-13 (“classe por construto”, “sessão dependente”); §22.
- **Critério:** AEC §7.2 (sem fabricar fisiologia); AEOS §14 (materialidade por construto/receita/policy, não pelo LLM); AEOS §9 HC03 (escopo do HOLD é policy); AGT-12 do próprio artefato.
- **Lacuna:** as regras dependem corretamente de classificação determinística, mas falta dizer (i) onde vive o catálogo construto → sensibilidade / materialidade / relevância a safety, que não está em DEP-03/05/08 nem em DEP-13; e (ii) como se determina a “sessão dependente” de um candidato pendente.
- **Cenário:** “dor no joelho” pendente. O LLM julga que a força de membros superiores “não depende” e a apresenta como apropriada. É um juízo fisiológico de escopo feito pelo modelo. AGT-12 já veda conselho fisiológico genérico, então a leitura conjunta é conservadora, mas a regra local fica ambígua.
- **Resolução recomendada:**
  - Em AGT-13, “sessão dependente” = escopo oficial de HC03 quando existir; senão, toda sessão da janela corrente ou iminente (HOJ-R8). Nunca juízo do LLM.
  - Referenciar o catálogo de construtos no §22: relevância a safety em G02/G04, sensibilidade em G07.
  - Registrar como limite que a eficácia de AGT-13 depende do recall da extração de enunciados de safety, a avaliar em G09 (evals adversariais e negativos), não neste documento.
- **Owner:** worker product-ux-architect; AI Systems em G09 para os evals.

### UXS-AI-R2-02 — NON_BLOCKING — CONF-16 precisa estar ancorada no resultado oficial, não num filtro de UX

- **Local:** CONF-16, última frase: “Uma proposta para o restante (CONF-07) só aparece com fato material novo surgido depois do início”.
- **Critério:** ALT-UX-03 e §10.3 do próprio artefato (manifestação derivada **exclusivamente** do resultado oficial); AEOS §13 (`STALE` → avaliação sucessora) e §14 (não reapresentar sem fato material novo; materialidade por policy).
- **Lacuna:** depois do `STALE`, a avaliação sucessora pode devolver `RECOMMEND(CHANGE_REMAINING_EXECUTION)` com os mesmos fatos. Lida como regra de apresentação, CONF-16 esconderia um resultado oficial MAN-3. O comportamento é razoável (agência, anti-insistência, safety preservada por CONF-10), mas pertence à estabilidade do motor.
- **Resolução recomendada:** formular CONF-16 como manifestação de um resultado oficial. O motor registra “sessão iniciada com a versão vigente enquanto a proposta estava pendente” como escolha declarada no `StabilityState`/trace e não repropõe sem fato material novo (AEOS §14). A UX só manifesta esse resultado. Registrar uma nota de consumidor ao owner do AEOS, análoga à UPSTREAM-ISSUE-03, se a regra de estabilidade não estiver coberta como está.
- **Owner:** worker; owner do AEOS/Engineering para a nota.

## 5. Cenários adversariais reexaminados no delta

| Cenário | Resultado em r2 |
|---|---|
| Pedido em linguagem natural mal interpretado (“passa a corrida para quinta”) | Sem pré-preenchimento: FLOW-04 aberto vazio no objeto; a pessoa edita pelos controles diretos; o motor avalia (AGT-03(d), CONF-08). Contido. |
| Dor relatada na conversa e não confirmada; pergunta “faço o treino?” | AGT-13: não endossa a sessão, declara que não foi considerada, oferece HOJ-R7/RUN-08/STR-05 → HC03; fechar descarta com aviso. Contido (precisão em R2-01). |
| Contrafactual “por que não quinta?” / conselho fisiológico genérico | AGT-12: abstenção explícita com caminho canônico, distinta de “indisponível”. Contido. |
| Template clínico ausente com vigente invalidado por restrição | CONF-14 qualificado e precedência CONF-10 > CONF-14; DEG-34 coerente. Sem fallback de último plano (S34). |
| JEV ranqueia B; B0 recomenda A; alternativas INCOMPARABLE | EXP-09: A primeiro, demais em ordem neutra, nenhuma ranqueada; a rota JEV não gera pergunta. Contido (S35/S43). |
| LLM indisponível com proposta pendente; pessoa inicia a sessão | Template (EXP-04/AGT-07); iniciar não confirma; proposta `STALE`; safety imediata (CONF-16/10). Sem dependência de LLM. |
| Ato confirmado offline e revogação antes da reconexão | CONF-17(2): a guarda decide `STALE`; nenhum modelo participa. Contido. |
| Conversa tenta ler check-ins de terceiros | AGT-10: fora do escopo legível; só indica o destino Crews. Contido. |

## 6. Limites e handoff

- **Natureza do parecer:** documental e restrito ao delta e às interações com o que mudou. Os critérios de r1 sem mudança foram reutilizados por referência, não reabertos.
- **Não demonstrado:** validador, templates ou catálogo de construtos em execução; recall da extração de safety; latência e custo; usabilidade da conversa ou da abstenção; utilidade do LLM ou do JEV frente ao B0; escolha de modelo ou fornecedor; observabilidade de IA.
- **Fora deste gate:** o conteúdo do direito de acesso/exportação (SURF-13) em relação a trace e dados shadow segue com G07/Security. G07/G09 continuam abertos com os owners do PDR §5.
- **Outros pareceres:** Product/UX, Security e Engineering emitem os próprios. A consolidação é do Chief.

Emissor: judge AI Systems → Chief. **PASS WITH NON-BLOCKING FINDINGS — AI_BOUNDARIES_REVIEWED documental para UXS-1.0-r2 no hash acima.** UXS-AI-R2-01/02 não exigem nova revalidação para este gate. Se forem incorporados, uma mudança material nas regras AGT, CONF, EXP ou MAN invalida apenas a cobertura dependente. Nenhuma implementação, Figma, modelo, provider ou pesquisa é autorizada por este parecer. **STOP deste judge após a entrega.**
