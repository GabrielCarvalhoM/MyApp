# Resposta do autor aos reviews r1 — UXS-1.0-r1 → UXS-1.0-r2

| Campo | Valor |
|---|---|
| Task / contrato | UXSPEC-20261018 / UXSPEC-20261018-r1 · correction loop 1, tentativa 1 de 2 |
| Autor | Product/UX Architect 1.2.0, worker autor único da especificação (não é judge) |
| Revisão avaliada | UXS-1.0-r1 · SHA-256 `08ac2f964791f1b9903ca435174a4d660ad74d2abb9a55cd2e9e2df42afc5d8c` (cópia congelada em `review-inputs-r1/`, intacta) |
| Revisão corrigida | `product/UX_SPECIFICATION.md` UXS-1.0-r2 · SHA-256 `092ec0336ddaf6bee5257d3c45a5f34ad5ac232beb9cb26ee1a2604d4b410bec` · 192 715 bytes |
| Reviews de entrada | UX_REVIEW_r1 (FAIL, 8 MATERIAL + 8 NB), AI_REVIEW_r1 (FAIL, 3 MATERIAL + 6 NB), ENGINEERING_REVIEW_r1 (FAIL, 2 MATERIAL + 6 NB), SECURITY_REVIEW_r1 (PASS com 9 NB); rastreabilidade em FOUNDER_REQUEST_2026-10-18 |
| Escopo da escrita | Somente a especificação r2 e este arquivo. Upstream, PDR, índice e reviews intactos. Este documento não é parecer: a revalidação de delta pertence aos mesmos judges. |

## 1. Contagem por disposição

**42 findings: 42 CORRECT · 0 ACCEPT · 0 DEFER · 0 REJECT · 0 ESCALATE** como disposição principal (13 MATERIAL, 29 NON_BLOCKING). Seis findings têm um componente residual fora da autoridade do autor, registrado com owner e trigger (§3); nenhum deles foi dado como resolvido.

Sobreposições tratadas uma vez, com os dois IDs citados: ENG-05b≈UX-12 (DEG-11); AI-07≈UX-14 (histórico de conversa); AI-09≈UX-10 (rótulos de FD-01); ENG-05a≈UX-03 (STR-11); ENG-04b≈UX-03 (“aguardando dados” só com evidência); ENG-06≈UX-08 (UPSTREAM-ISSUE-01); ENG-07≈UX-06 (continuação do horizonte sem lacuna nem aviso por regeneração); ENG-08≈UX-11 (pular/não realizada/categorias de INT-09); ENG-02≈UX-01 (relato antes da sessão, inclusive offline); SEC-01/02≈UX-15 (compromisso, check-in e momento em Crew de duas pessoas).

## 2. Finding → disposição → mudança

| Finding | Sev. | Disp. | Mudança feita | IDs alterados / novos |
|---|---|---|---|---|
| UXS-UX-01 | MATERIAL | CORRECT | Entrada não solicitante “como estou / limitação” no Hoje S2 e na preparação da Sessão; relato segue HC03 → AM-11 (S1/P0 no escopo); consentimento no primeiro uso; offline via CONF-17. | SURF-01, SURF-07, HOJ-S2, OBJ-08, FLOW-05, J-08 · **HOJ-R7** |
| UXS-UX-02 | MATERIAL | CORRECT | NAV-07 restrito: P0 encerra sem efeito só FLOW-02/04/06 e a ação preparada do FLOW-16; FLOW-05/08/09/10/12/15 preservam o informado; conflito de versão segue STALE. | NAV-07 |
| UXS-UX-03 | MATERIAL | CORRECT | Gatilhos de “em aberto” por evento (fim da janela/validade, outra sessão, saída explícita); NAV-02/S1 só antes disso; STR-11 alinhado (sem rótulo “parcial” automático); “aguardando dados” só com evidência; “iminente” e “recente” definidos; execução esquecida no catálogo. | ST-SES, NAV-02, STR-11, HOJ-S5, HOJ-C10, DEG-10 · **HOJ-R8, DEG-36** |
| UXS-UX-04 | MATERIAL | CORRECT | A Sessão sinaliza proposta/pergunta pendente; regra de iniciar com proposta pendente (iniciar não confirma; proposta → STALE com motivo; restante só com fato novo). | SURF-07, MAN-3, HOJ-C22, DEG-08, J-09 · **CONF-16** |
| UXS-UX-05 | MATERIAL | CORRECT | Caso e jornada de retorno após `NO_DATA`: decisão corrente reavaliada sem compensação, item único agregado sem contagem, pausa retroativa sem motivo, pergunta factual só se decisiva. | ST-CTN, CTN-05 · **HOJ-C23, J-21** |
| UXS-UX-06 | MATERIAL | CORRECT | Continuação apresentada como MAN-3 antes do fim do horizonte; no máximo um NOT-A; sucessora de mesmo efeito sem novo aviso; fim sem adoção é exceção; revisão da cadência quando G02 fixar. | CONF-15, HOJ-C21, DEG-31, INT-02 |
| UXS-UX-07 | MATERIAL | CORRECT | Profundidade por modalidade em Progresso (fatos realizados, sem recorde/total como mérito); realizado anterior do exercício como referência factual; marco próprio definido (classes, estados, espaço no Hoje). | SURF-01, SURF-03, SURF-09 · **OBJ-23, ST-MAR, HOJ-S8, STR-13** |
| UXS-UX-08 | MATERIAL | CORRECT | Finalidade própria e condicional de localização/sensores; UPSTREAM-ISSUE-01 reformulado em escopo/capacidade/finalidade, com Security co-owner e trigger; pergunta de escopo enquadrada para o Founder. | RUN-06, ONB-05, DEP-10, UPSTREAM-ISSUE-01 · **RUN-13, FOUNDER-DECISION-03** |
| UXS-UX-09 | NB | CORRECT | INT-04 reenquadrado como esclarecimento interino do PDM; pedido ao owner do PDM registrado. | INT-04 · **UPSTREAM-ISSUE-02** |
| UXS-UX-10 | NB | CORRECT | FD-01 com rótulos inequívocos EXCLUIR/INCLUIR/ADIAR; ALT-UX-08 mapeado a eles. | FOUNDER-DECISION-01, ALT-UX-08 |
| UXS-UX-11 | NB | CORRECT | Fronteira: futuro → “não farei” em FLOW-04 com prévia; janela corrente/passada → “não realizada” em FLOW-05. | AG-04, SURF-07, FLOW-05 |
| UXS-UX-12 | NB | CORRECT | DEG-11: provável duplicata não é somada; decisão dependente limitada. | DEG-11 |
| UXS-UX-13 | NB | CORRECT | Owner externo: mostra a evidência aceitável e o mecanismo pendente `[DEP-G04]`, nunca “em revisão”. | ST-HOLD, FLOW-09 |
| UXS-UX-14 | NB | CORRECT | Canal efêmero por padrão; retenção/histórico só após G07/G09; candidatos não persistem. | AGT-01 |
| UXS-UX-15 | NB | CORRECT | Um compromisso por Crew por vez; período fixado na proposta; retirada antes do início; um aviso por proposta; limites de abuso em G08. | CRW-08, CRW-20 · **CRW-21** |
| UXS-UX-16 | NB | CORRECT | (a) unidades com dono único em SURF-05; (b) faceta por momento Nutrition; (c) ordem dos exercícios; (d) segundo ato após ASK; (e) “microajuste” remetido a §10.3; (f) Hoje de conta sem modo ativo. | SURF-11, §6.2, NUT-01, AM-10, ASK-03, J-02, NOT-02 · **STR-14, HOJ-C24** |
| UXS-AI-01 | MATERIAL | CORRECT | Opção (a): AGT-03(d) só seleciona opção VALID ou abre FLOW-04 sem parâmetros preenchidos; disponibilidade/preferência segue fato candidato. Nenhuma operação nova de LLM. | AGT-03, AGT-08, FLOW-16, J-16 |
| UXS-AI-02 | MATERIAL | CORRECT | Estado de abstenção explícita; candidato pendente com regra de safety (não endossa a sessão dependente, oferece o relato direto, descarta ao fechar). | J-16 · **AGT-12, AGT-13** |
| UXS-AI-03 | MATERIAL | CORRECT | “Vigente permanece somente se ainda válido”; senão CONF-10/DEG-20; precedência CONF-10 > CONF-14; qualificador propagado. | CONF-14, DEG-34, CONF-09, DEG-08, HOJ-C22, J-09 |
| UXS-AI-04 | NB | CORRECT | Ordem/ênfase das alternativas só a partir do B0; INCOMPARABLE/UNKNOWN nunca ranqueados; pergunta só de `question_refs` oficiais. | **EXP-09** |
| UXS-AI-05 | NB | CORRECT | (a) fator principal do N1 determinístico; (b) números incluem deltas/alvos do `change_set` oficial e nada mais; (c) validador alinhado ao AEOS §16. | EXP-02, EXP-03, EXP-04, §7.1 |
| UXS-AI-06 | NB | CORRECT | Catálogo de templates de explicação inventariado com owners. | **DEP-13** |
| UXS-AI-07 | NB | CORRECT | Tratado com UXS-UX-14. | AGT-01 |
| UXS-AI-08 | NB | CORRECT | (a) confirmação sempre no objeto canônico, sensibilidade por catálogo; (b) esclarecimento mínimo limitado; (c) limiar/evidência em AGT-04; (d) títulos/metadata e textos próprios como dados; (e) sem iniciativa e sem espaço no Hoje; (f) referência à revisão canônica. | AGT-04, AGT-05, AGT-06, HOJ-R4 · **AGT-14** |
| UXS-AI-09 | NB | CORRECT | Rótulos de FD-01; escopo (LLM explicador é seleção separada); INCLUIR referencia AGT-01–14 corrigidos. | FOUNDER-DECISION-01, AGT-00, ALT-UX-08 |
| UXS-ENG-01 | MATERIAL | CORRECT | Revogação/desconexão: fila cancelada, despachado “pode ter chegado”, cópia entregue permanece; “nunca dizer” em LX; regra de composição dos estados do export. | WEA-07, WEA-LX, DEG-14, J-15 · **WEA-10** |
| UXS-ENG-02 | MATERIAL | CORRECT | Regra única para atos pendentes offline/sem resposta (intenção pendente, guarda na reconexão, edição sem alcance inventado, ASK local pendente, limitação offline vale na hora, idempotência do ato, substituição de Strength). | ST-DEC, NAV-11, DEG-17, STR-06, ASK-03, HOJ-R7, J-08 · **CONF-17, DEG-37** |
| UXS-ENG-03 | NB | CORRECT | Saídas de LU (reconciliação, recibo tardio, erro posterior), possível cópia duplicada e regra de oferta de “enviar”. | WEA-LU · **WEA-11** |
| UXS-ENG-04 | NB | CORRECT | (a) revisão executada só com referência de retorno; (b) com UXS-UX-03; (c) revogação só quando a rota expõe; (d) device/OS/firmware na capacidade. | RUN-07, §14.2, ST-SES, DEG-14, NOT-C, ST-CONN, WEA-03 |
| UXS-ENG-05 | NB | CORRECT | (a) com UXS-UX-03; (b) com UXS-UX-12; (c) “são diferentes” registrado e não reproposto sem fato novo. | STR-11, DEG-11, ST-OBS, FLOW-08 |
| UXS-ENG-06 | NB | CORRECT | Com UXS-UX-08: lar G06/O016 (não G09 sozinho), Security co-owner, trigger preciso. | UPSTREAM-ISSUE-01, DEP-10, RUN-13, ONB-05 |
| UXS-ENG-07 | NB | CORRECT | INT-01 com plano-base “sem plano” e `APPLY_PLAN_CHANGE` como nota ao owner do AEOS; INT-02 sem aviso por sucessora de mesmo efeito. | INT-01, INT-02, CONF-15 · **UPSTREAM-ISSUE-03** |
| UXS-ENG-08 | NB | CORRECT | Categorias de INT-09 (HC01–04/06/08–09 bloqueiam; HC05 da própria edição atualiza contexto; pular nunca bloqueado; HC07 é guarda). | AG-04, INT-09 |
| UXS-SEC-01 | NB | CORRECT | Momento perceptível declarado no consentimento e na prévia; INT-06 reescrita; remoção e proposta atribuíveis em Crew de duas; “sem autoria exibida”. | CRW-07, FLOW-12, INT-06, CRW-14, CRW-18 |
| UXS-SEC-02 | NB | CORRECT | Conteúdo único de check-in na V1 (sem categorias); oferta nunca junto de HOLD/ASK/RECONCILE/interrupção; sem status de lido; CTN-06 alinhado. | CRW-09, CTN-06 |
| UXS-SEC-03 | NB | CORRECT | Indicação de entrada no espaço da Crew (sem quem convidou nem como), sem push; citada no consentimento. | CRW-15, CRW-07, INT-05, SURF-10 |
| UXS-SEC-04 | NB | CORRECT | (a) aviso de canal não comprovado/identidade não verificada; (b) bloqueio indistinguível no tempo; silenciado não avisado; (c) sem oráculo de conta; (d) canal digitado/um contato; (e) candidato vê o nome de quem convidou; (f) ONB-03 minimizado; (g) usos e validade em G08. | ONB-03, FLOW-11 · **CRW-23** |
| UXS-SEC-05 | NB | CORRECT | Revogar o consentimento de uma Crew encerra o vínculo (efeitos de sair), com efeito mostrado antes. | AG-12, SURF-13 · **CRW-22** |
| UXS-SEC-06 | NB | CORRECT | L0 renderizável para todas as classes; categoria só desbloqueado; existência de retenção/restrição/safety e de pergunta sobre limitação/recovery sensível em todos os níveis. | NOT-05, NOT-08, INT-08 |
| UXS-SEC-07 | NB | CORRECT | Export só com estrutura e identificadores neutros; prévia mostra os campos transmitidos; lista de exclusões; SHR-01 ampliado. | WEA-L1, SHR-01 |
| UXS-SEC-08 | NB | CORRECT | Escopo legível do canal exclui objetos de Crew e dados de terceiros; destinatário de LLM aparece em FLOW-15/SURF-13 se selecionado. | AGT-10 |
| UXS-SEC-09 | NB | CORRECT | Identidade/autenticação/recuperação/reautenticação registradas como fora de escopo com owner e retorno; só fixado: export na superfície autenticada e ações destrutivas com confirmação. | SURF-13, §24.3 · **DEP-14** |

## 3. Componentes residuais fora da autoridade do autor (não resolvidos aqui)

| Finding | Componente | Owner / trigger |
|---|---|---|
| UXS-UX-08 / UXS-ENG-06 | Registro de UPSTREAM-ISSUE-01 no PDR §5; verificação de capacidade; decisão de escopo | Chief recomenda o registro ao Founder no checkpoint (PDR e índice byte-idênticos nesta missão); Engineering + Security; Founder em FOUNDER-DECISION-03 |
| UXS-UX-06 | Revisão do ônus de confirmação por horizonte | Autoridade de treino em G02, quando fixar a cadência |
| UXS-UX-09 | Esclarecimento de “ativo por adesão” no PDM | Owner do PDM, na próxima emenda (UPSTREAM-ISSUE-02); interino INT-04 |
| UXS-ENG-07 | Classe/representação do plano inicial no AEOS | Owner do AEOS (UPSTREAM-ISSUE-03) |
| UXS-AI-06 | Conteúdo e cobertura do catálogo de templates | G02/G04/G05 (claims), AI Systems em G09 (validador), FOUNDER-DECISION-02 (voz) |
| UXS-SEC-04(g) / UXS-SEC-09 | Números de usos/validade de convite; método de autenticação e recuperação | Security/Engineering em G08/G09 |

## 4. Novos itens de decisão e interpretação

- **UPSTREAM-ISSUE-01** reformulado (escopo, capacidade, finalidade). **Novos:** UPSTREAM-ISSUE-02 (PDM, adesão) e UPSTREAM-ISSUE-03 (AEOS, plano inicial).
- **FOUNDER-DECISION-01** com rótulos EXCLUIR/INCLUIR/ADIAR e escopo explícito; **FOUNDER-DECISION-02** com rótulos USAR PLACEHOLDERS / DECIDIR EM BRAND. **Novo:** FOUNDER-DECISION-03 (medição da corrida pelo telefone na promessa V1 sem relógio), com recomendação INCLUIR NA PROMESSA condicionada às provas de capacidade e de finalidade.
- **INT** alteradas: INT-01, INT-02, INT-04 (agora esclarecimento interino do PDM), INT-05, INT-06, INT-08, INT-09. Nenhuma INT nova.

## 5. Mudanças estruturais

Nenhum destino, hub ou superfície novos; nenhuma nova classe de decisão, limiar, dose ou copy. Acrescentados: um objeto (OBJ-23 marco próprio), uma família de estado (ST-MAR), um espaço P4 no fim da ordem do Hoje (HOJ-S8), duas regras de Hoje (HOJ-R7/R8), dois casos (HOJ-C23/C24), uma jornada (J-21), duas regras de confirmação (CONF-16/17), regras de agente (AGT-12–14), de export (WEA-10/11), de Running/Strength (RUN-13, STR-13/14), de Crew (CRW-21–23), uma regra de explicação (EXP-09), dois estados degradados (DEG-36/37), duas dependências (DEP-13/14) e a rastreabilidade do pedido literal do Founder (§25.5). IDs de r1 preservados.
