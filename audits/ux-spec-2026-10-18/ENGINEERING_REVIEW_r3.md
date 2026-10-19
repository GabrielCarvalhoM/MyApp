# UX Specification — Engineering delta re-review r3

**PASS — ENGINEERING_CONTRACT_REVIEWED (documental) para UXS-1.0-r3.** UXS-ENG-r2-01 e UXS-ENG-r2-02 estão RESOLVED. O diff r2→r3 não traz regressão de estado, sync ou derivabilidade de versão. UPSTREAM-ISSUE-04 está corretamente enquadrado como nota de consumidor ao owner do AEOS. **Contagem: 0 BLOCKING · 0 MATERIAL · 0 NON_BLOCKING.**

Este parecer não é ENGINEERING_ARCHITECTURE_READY nem prova executável, de device/provider, de implementação ou de release. Também não substitui os pareceres Product/UX, Security ou AI. Os pareceres [r1](ENGINEERING_REVIEW_r1.md) e [r2](ENGINEERING_REVIEW_r2.md) continuam sendo registros históricos das revisões deles.

## 1. Contrato, independência e método

| Campo | Registro |
|---|---|
| Task / contrato | UXSPEC-20261018 / UXSPEC-20261018-r1 · revalidação de delta r3, limitada pela decisão D-UXS-06 |
| Artefato | `review-inputs-r3/UX_SPECIFICATION.md` · **UXS-1.0-r3** |
| SHA-256 (recalculado com `sha256sum` no início e no fim) | `598b055d8df6cf67cafe0365e88d0ba694164d00c7ab6576fc2643eff5dcfcdb`, igual ao MANIFEST r3 (artefato e cópia congelada) |
| Inputs de apoio | `DIFF_r2_r3.patch` `cc6c6e9a…645d` e `AUTHOR_RESPONSE_r2.md` `3e729465…a159`, ambos iguais ao MANIFEST. O diff serve apenas de apoio; a autoridade é a cópia congelada. PRE_REVIEW_VERIFICATION_r3 (301 passed / 0 failed / 2 warnings, segundo o MANIFEST) foi aceito como check do Chief, sem reexecução própria. |
| Avaliador | Engineering / Systems Architect 1.3.0, em **instância nova e independente**. Ela substitui a instância de r2, perdida por limite de uso; trata-se de lacuna de quota, não de uma nova auditoria. Não sou autor nem coautor da r3. Minha única escrita é este relatório. |
| Método | Li os findings r2 e a disposição do autor. Na cópia congelada, li somente as linhas que o diff toca: SURF-02, FLOW-14, NAV-10, ST-PLAN, ST-CTN, ST-MAR, HOJ-S8, HOJ-R8, HOJ-C23, RUN-13, CONF-16, CRW-04/17, AGT-01/05/10/13, J-21, DEP-15, UPSTREAM-ISSUE-01/04, FOUNDER-DECISION-03 e §24/§26. Para checar coerência, consultei ST-DEC, CONF-03/07/10, MAN-R4 e INT-10, sem alteração em nenhum deles. Os critérios upstream são os mesmos de r2 (AEOS §4, §13, §13.1, §14; AEC §4). Nada fora do diff foi reaberto. |

## 2. Adjudicação dos findings r2

| Finding r2 | Veredito | Evidência r3 |
|---|---|---|
| **UXS-ENG-r2-01** NB · CONF-16: a supressão da proposta para o restante precisa de registro explícito | **RESOLVED** (resíduo com o owner do AEOS via UPSTREAM-ISSUE-04) | CONF-16 (l. 472) cobre os quatro pontos recomendados. (1) "O motor registra o início com proposta pendente como evento de agência no trace e no estado de estabilidade, ligado às razões da proposta `STALE`". (2) A supressão vale "para a execução iniciada" e cai diante de fato material novo surgido depois do início, o que se deriva comparando o momento do fato com o evento. (3) A proposta composta vai inteira a `STALE` (INT-10, l. 900), e as demais sessões recebem "avaliação sucessora normal" (MAN-R4, l. 451), sem novo NOT-A salvo efeito materialmente diferente, de forma coerente com CONF-15. (4) A retenção de safety continua imediata (CONF-10). O risco central de r2, esconder a proposta fora do trace, foi eliminado: "a UX só manifesta esse resultado e não filtra resultado oficial". Assim, a não reproposição é saída do motor (AEOS §14), auditável no trace, e não um filtro de apresentação. |
| **UXS-ENG-r2-02** NB · HOJ-C23/J-21: "pausa" retroativa sem semântica em ST-CTN | **RESOLVED** | A semântica (a) foi adotada em ST-CTN (l. 237): o registro retroativo em FLOW-14, no modo período passado, sobre OBJ-13 "só anota o intervalo como pausa declarada no histórico e no contexto do motor". Ele "não cria `INTERRUPTED_DECLARED` corrente, não encerra o vigente, não oferece pausa de Crew nem exige `RETURNING`". A reavaliação segue §10, com eventual RETURN/REPLAN como MAN-3, ou seja, com o ato exigido antes de qualquer prescrição nova. As decisões passadas não mudam (EXP-07). A mesma semântica aparece em FLOW-14 (l. 145), HOJ-C23 (l. 349) e J-21 (l. 839). Fica uma única máquina, coerente com AEC §4 e AEOS §4/C10. |

## 3. Regressões no diff r2→r3 (estado, sync, versão)

**Nenhuma regressão encontrada.** A tabela abaixo cobre só os itens do diff com efeito no domínio de engenharia.

| Item | Resultado | Nota |
|---|---|---|
| ST-PLAN, SURF-02 (continuação como caminho normal; DEG-31 como exceção) | PASS | A transição vigente → continuação proposta → nova revisão vigente ao ser adotada é coerente com CONF-15 e INT-02. O horizonte encerrado sem adoção vira exceção explícita. A linhagem de revisões continua derivável. |
| ST-MAR, HOJ-S8 (elegibilidade por fato registrado; estado `visto`; substituição pelo mais novo) | PASS | A elegibilidade vem de observações e registros, sem classificação de aderência `[DEP-G03]`, o que a torna mais derivável que em r2. Dado tardio pode tornar um marco elegível depois; isso é uma consequência derivável, não uma regressão. Nota sem finding: o `visto` é estado do produto por pessoa e deve ser sincronizado entre aparelhos (DEP-14 já cobre vários aparelhos). |
| HOJ-R8 ("iminente" = preparação/execução aberta agora, até a pessoa sair) | PASS | A regra é por evento, sem limiar, e é consumida de forma determinística por CONF-17(5) e AGT-13. |
| RUN-13 (minimização; sem coleta em pausa salvo `[DEP-G09]`; sem traçado retido além da derivação) | PASS | Não exige capacidade nova. Parar a coleta na pausa reduz o escopo, e as métricas derivadas bastam para o dedupe de WEA-08. A capacidade continua em UPSTREAM-ISSUE-01, cujo critério de aceite de minimização foi corretamente endereçado a Engineering + Security. |
| AGT-13, AGT-05, DEP-15 (escopo de HC03 ou janela corrente/iminente; catálogo determinístico) | PASS (engenharia) | O fallback é determinístico e não depende do LLM. O recall da extração fica com G09. A fidelidade do agente pertence à revisão AI. |
| NAV-10, CRW-04/17, AGT-01/10, FOUNDER-DECISION-03, §24/§26 | Sem efeito de estado ou sync | São roteamento, privacidade e bookkeeping. §24.3 passou a incluir UPSTREAM-ISSUE-04 como gatilho de volta ao Architect, o que está correto. |

Observação sem finding, fora do delta: quando há observação tardia (por exemplo, um import do relógio) dentro de um intervalo anotado como pausa retroativa, a observação e a declaração coexistem como fatos. Esse conflito já existia em r2. Ele é tratado pelas regras gerais vigentes (observação preservada, passado intacto, futuro readaptado), e o tratamento no contexto do motor cabe ao owner do AEOS.

## 4. UPSTREAM-ISSUE-04: enquadramento

**Correto como nota upstream.** Os quatro elementos estão presentes:

- **Lacuna:** a l. 875 identifica com precisão a lacuna do contrato do motor. O `StabilityState` (AEOS §14) só reconhece aceito/recusado, e "iniciou com proposta pendente" não é `DECLINED`.
- **Pedido:** o pedido ao motor é aditivo (um evento de agência nomeado, ligado às razões `STALE`) e não contradiz AEOS §13, §13.1 ou §14.
- **Owner:** owner do AEOS com Engineering.
- **Impacto na UX:** não bloqueia a UX. Até a resolução, CONF-16 descreve o resultado esperado sem filtro de apresentação. Assim, a lacuna fica visível do lado do motor em vez de ser mascarada na UX.

O formato é o mesmo de UPSTREAM-ISSUE-03, que foi aceito em r2. Nota ao Chief, sem finding: ao registrar a nota com o owner do AEOS, fixe o trigger como "antes do contrato de implementação do motor / G09 que cubra CONF-16".

## 5. Gate e handoff

- **Veredito:** **PASS**, ENGINEERING_CONTRACT_REVIEWED documental para UXS-1.0-r3, SHA-256 `598b055d8df6cf67cafe0365e88d0ba694164d00c7ab6576fc2643eff5dcfcdb`.
- **Contagem:** 0 BLOCKING · 0 MATERIAL · 0 NON_BLOCKING. UXS-ENG-r2-01 e UXS-ENG-r2-02 estão RESOLVED.
- **Resíduos fora da autoridade do autor, com owner:** UPSTREAM-ISSUE-04 (owner do AEOS + Engineering; trigger a fixar pelo Chief). Continuam como estavam em r2: UPSTREAM-ISSUE-01 no PDR §5 (Chief, no checkpoint do Founder) e UPSTREAM-ISSUE-03 (owner do AEOS).
- **Escopo:** o gate vale só para este hash e para o domínio de engenharia, nos limites do diff r2→r3. Qualquer alteração material invalida a cobertura dependente.
- **STOP** após este relatório.
