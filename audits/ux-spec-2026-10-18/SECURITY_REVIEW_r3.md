# Security, Privacy & Abuse: revalidação limitada de delta r3 · UX Specification

**Veredito: PASS.** Gate documental **PRIVACY_BOUNDARIES_REVIEWED** sobre `review-inputs-r3/UX_SPECIFICATION.md` **UXS-1.0-r3** (SHA-256 `598b055d8df6cf67cafe0365e88d0ba694164d00c7ab6576fc2643eff5dcfcdb`).

| Contagem | Resultado |
|---|---|
| BLOCKING / MATERIAL / NON_BLOCKING (novos) | **0 / 0 / 0** |
| Findings do r2 | UXS-SEC-10 **RESOLVED** · UXS-SEC-11 **RESOLVED** |
| Regressões r2→r3 (privacidade, consentimento, audiência, avisos; PB-F-02/03) | **Nenhuma** |

Este parecer não é SECURITY_READY de sistema, parecer jurídico, threat model de implementação nem prova executável. Os arquivos r1 e r2 continuam preservados sem alteração.

## 1. Contrato e evidência

| Campo | Valor |
|---|---|
| Task / decisão | UXSPEC-20261018 · revalidação limitada de delta r3 (Chief D-UXS-06) |
| Avaliador | Security, Privacy & Abuse Architect 1.1.0, judge **independente** (J-SEC). Esta é uma instância nova que substitui a do r2, perdida por limite de cota; não houve nova auditoria. Nunca foi autor ou coautor. O autor é o worker `product-ux-architect`. |
| Hash | Recalculado com `Get-FileHash -Algorithm SHA256` sobre a cópia congelada: `598b055d…dcfcdb`, igual ao esperado e ao declarado em `AUTHOR_RESPONSE_r2.md`. |
| Insumos (somente estes) | `SECURITY_REVIEW_r2.md` (UXS-SEC-10/11); `AUTHOR_RESPONSE_r2.md` (declaração do autor, não evidência); `review-inputs-r3/DIFF_r2_r3.patch` (informativo); cópia congelada r3, lida só nas linhas tocadas pelo diff e nos IDs citados por elas (RUN-13, AGT-00/01/10/13, CRW-04/23, tabela de visibilidade da Crew, NAV-10, FLOW-14/15, ST-CTN, UPSTREAM-ISSUE-01, FOUNDER-DECISION-03). |
| Escopo | Disposição de UXS-SEC-10/11 e regressões dentro do diff. Nada fora do diff foi reaberto. |

## 2. Disposição dos findings do r2

| Finding r2 | Disposição | Evidência na r3 (cópia congelada) |
|---|---|---|
| **UXS-SEC-10**: localização (RUN-13) sem limitação de finalidade nem minimização do traçado | **RESOLVED** | Os quatro itens exigidos foram atendidos. **(1) Finalidade:** RUN-13 diz que a finalidade é "limitada às métricas de execução da sessão (distância, ritmo, avanço de etapa)". O dado bruto não alimenta o contexto do motor além disso, nem I10, nem agente/LLM, nem "outra finalidade sem consentimento próprio", e "não serve para inferir locais frequentes". AGT-10 exclui "dados brutos de localização/sensores (RUN-13)". **(2) Traçado:** na V1 não há rota ou mapa exibidos nem retenção do traçado bruto além do necessário à derivação. Propor mapa ou rota vira finalidade nova, decidida em G07 com Security "antes da copy de consentimento e de qualquer coleta". **(3) Pausa:** a coleta acontece só em execução ativa, "nunca no estado pausado, salvo necessidade técnica declarada `[DEP-G09]`". **(4) Critério de aceite:** UPSTREAM-ISSUE-01 inclui a minimização ("só métricas de execução, sem traçado retido, sem mapa na V1, sem coleta em pausa"). Também atende à ressalva do r2 sobre o momento: "nenhuma coleta antes de G07/G09". A opção INCLUIR da FOUNDER-DECISION-03 fica limitada a métricas de execução, sem mapa ou rota. |
| **UXS-SEC-11**: "efêmero" e "sem persistência" prometendo além do produto | **RESOLVED** | Os quatro itens exigidos foram atendidos. **(1) Delimitação:** AGT-01 diz "Efêmero por padrão **no produto**… candidatos não confirmados nunca persistem no produto". AGT-13 diz "descarta o candidato no produto… sem persistência no produto (o provedor do modelo segue AGT-01)". **(2) Promessa:** "Nenhuma superfície promete não retenção pelo provedor do modelo, a menos que G07/G09 a contratem e verifiquem." **(3) Divulgação:** "destinatário e retenção reais aparecem em FLOW-15/SURF-13 antes do primeiro uso" (AGT-01, AGT-10). FLOW-15 já mostra destinatários e persistência. **(4) Ausência de seleção:** AGT-00 não mudou; o canal é condicional e gated, e o LLM explicador é seleção separada. |

**Observação para G09, não é finding:** a exceção "salvo necessidade técnica declarada" para a pausa continua sujeita à limitação de finalidade de RUN-13, que vale para todo dado de localização coletado. A declaração dessa necessidade deve chegar a G07/G09 com Security junto com a prova de capacidade (UPSTREAM-ISSUE-01).

## 3. Regressões no diff r2→r3

| Alteração (no diff) | Superfície de privacidade | Resultado |
|---|---|---|
| CRW-04 e linha "Candidato antes do vínculo" da tabela de visibilidade: o candidato vê o nome de exibição de quem convidou | Audiência pré-vínculo (PB-F-02) | Sem regressão. As duas passagens só repetem CRW-23(e), que não mudou e foi aprovada no r2 como mínimo necessário ao consentimento e ao bloqueio. "nunca nome da Crew, **demais** participantes" mantém fechada a exposição do restante da Crew. O caso de convite encaminhado continua coberto por CRW-23(a). |
| NAV-10: a conversa "só localiza SURF-13; não abre FLOW-15 nem altera consentimento (AGT-04)" | Consentimento | Endurecimento: remove a conversa como caminho de mudança de consentimento, o que reduz o risco de injeção. |
| AGT-01/10/13 | Destinatário, retenção e escopo de leitura | Somente reduções e explicitações (§2). |
| RUN-13, UPSTREAM-ISSUE-01, FOUNDER-DECISION-03 | Finalidade e coleta de localização | Somente reduções (§2). As exclusões de saída (Crew, share, aviso, tela bloqueada, export de notas) continuam intactas, e PB-F-03 se mantém. |
| ST-CTN, FLOW-14, HOJ-C23, J-21: pausa retroativa como anotação histórica | Audiência de Crew e avisos | Sem regressão. "não oferece pausa de Crew", não cria `INTERRUPTED_DECLARED` corrente e fica sem motivo. Não cria estado visível a terceiros nem aviso. |
| ST-MAR e HOJ-S8: elegibilidade por fato registrado; o marco permanece até ser aberto, dispensado ou substituído | Audiência e avisos | Sem regressão. O marco continua só da própria pessoa, sem aviso e com compartilhamento só por FLOW-10, com as exclusões de SHR-01. A permanência no Hoje é dentro do app, e o aparelho compartilhado segue em DEP-14/G09. |
| CONF-16 e UPSTREAM-ISSUE-04: evento de agência no trace e no estado de estabilidade | Dados próprios e avisos | Sem regressão. É dado próprio no trace oficial, sem novo destinatário. "sem novo NOT-A salvo efeito materialmente diferente" reduz avisos, e a safety continua imediata. |
| AGT-05, AGT-13, DEP-15: catálogo de construtos, com sensibilidade em G07 | Classificação de dado sensível | Melhora a minimização: a sensibilidade é determinística por construto e nunca vem do julgamento do LLM. O comportamento de safety e o recall pertencem aos judges AI e Engineering e não foram julgados aqui. |
| SURF-02, ST-PLAN, HOJ-R8, cabeçalho, §24, §26 | Nenhuma | Fora do domínio; sem efeito de privacidade. |

**Conclusão:** nenhuma alteração da r3 amplia a audiência, cria canal para terceiros, acrescenta classe ou conteúdo de aviso, afrouxa um default de consentimento ou amplia uma finalidade. PB-F-02 e PB-F-03 seguem atendidas no nível documental, como no r2.

## 4. Limites

- Este gate é documental, limitado à UXS-1.0-r3 e ao diff r2→r3. O que passou no r1 e no r2 sem mudança não foi reaberto.
- Nada foi verificado de forma executável. A coleta de localização, a retenção do provedor, a autorização no servidor e a proteção local continuam em DEFER G07–G09, com owner.
- Product/UX, AI Systems e Engineering não foram julgados, e nenhum PASS deles é inferido daqui.
- Uma mudança material em finalidade, destinatário, retenção, audiência, avisos ou escopo do agente invalida este parecer para as partes afetadas.

## 5. Handoff e STOP

| Campo | Valor |
|---|---|
| Producer → consumer | J-SEC (judge independente) → **Chief** (consolidação) |
| Revisão e hash avaliados | UXS-1.0-r3 · `598b055d8df6cf67cafe0365e88d0ba694164d00c7ab6576fc2643eff5dcfcdb` |
| Verdict | **PASS** · PRIVACY_BOUNDARIES_REVIEWED (documental) · 0 BLOCKING / 0 MATERIAL / 0 NON_BLOCKING |
| Findings | UXS-SEC-10 RESOLVED; UXS-SEC-11 RESOLVED; nenhum novo |
| Dependentes invalidados | Nenhum |
| Próxima ação | O Chief agrega este resultado com os demais gates r3. A observação de §2 segue para G09 junto com UPSTREAM-ISSUE-01. |

**STOP:** o único arquivo escrito por esta instância é `audits/ux-spec-2026-10-18/SECURITY_REVIEW_r3.md`. Não editei o artefato, o r1, o r2, o upstream nem o estado global, e não acionei especialistas.
