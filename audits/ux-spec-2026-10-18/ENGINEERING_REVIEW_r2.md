# UX Specification — Engineering delta re-review r2

**PASS WITH NON-BLOCKING FINDINGS — ENGINEERING_CONTRACT_REVIEWED (documental) para UXS-1.0-r2.** Os oito findings de r1 foram resolvidos: UXS-ENG-01 a 05, 07 e 08 por completo, e UXS-ENG-06 no que cabe ao autor. O que falta em UXS-ENG-06 depende do Chief e do Founder e está registrado com owner e trigger. O delta trouxe dois novos findings NON_BLOCKING. Não há finding BLOCKING nem MATERIAL.

O [parecer r1](ENGINEERING_REVIEW_r1.md) (FAIL, SHA-256 `35d101aa…5926`) continua sendo o registro histórico da revisão r1; este parecer não o converte em PASS. Também não é ENGINEERING_ARCHITECTURE_READY nem prova executável, de device/provider, de implementação ou de release, e não substitui os pareceres Product/UX, Security ou AI.

## 1. Contrato, independência e método

| Campo | Registro |
|---|---|
| Task / contrato | UXSPEC-20261018 / UXSPEC-20261018-r1 · revalidação de delta, correction loop 1, tentativa 1 |
| Artefato | `product/UX_SPECIFICATION.md` · **UXS-1.0-r2** |
| SHA-256 recalculado (PowerShell `Get-FileHash`) | Início: `092ec0336ddaf6bee5257d3c45a5f34ad5ac232beb9cb26ee1a2604d4b410bec` (2026-10-19T11:07:43Z, retomado após HTTP 429 sem relatório parcial). Fim: ver §6. A cópia congelada `review-inputs-r2/UX_SPECIFICATION.md` tem o mesmo hash. |
| Inputs de apoio verificados | `review-inputs-r2/MANIFEST.json` `455df76d…8764`; `AUTHOR_RESPONSE_r1.md` `f819d69c…f58d` (igual ao MANIFEST); `DIFF_r1_r2.patch` `d4cac7a1…962f`, usado só como apoio informativo. PRE_REVIEW_VERIFICATION_r2: 293 passed / 0 failed / 2 warnings, segundo o MANIFEST; aceito como check objetivo do Chief, sem reexecução própria. A cópia congelada da r1 e o meu ENGINEERING_REVIEW_r1 seguem intactos (`35d101aa…5926`). |
| Avaliador / modo | Engineering / Systems Architect **1.3.0**, a mesma instância independente do r1. Não sou autor nem coautor da r2. Minha única escrita é este relatório. |
| Rubrica | ENGINEERING 1.1.0; CORE 1.4.0; verify-before-completion aplicado ao próprio parecer. |
| Método | Li a resposta do autor e, **no artefato congelado**, todas as linhas alteradas ou novas relevantes ao meu domínio: ST-DEC, ST-SES, ST-OBS, ST-CONN, NAV-02/07/11, ONB-05, HOJ-R7/R8, HOJ-S1/S2/S5, HOJ-C10/C20–C24, RUN-06/07/13, STR-06/11/13/14, CONF-02/07/09/14–17, ASK-03, AG-04, WEA-02–07/10/11, WEA-L0–LX, DEG-10/11/14/17/31/34/36/37, NOT-C, J-08/09/10/15/18/21, DEP-10, FOUNDER-DECISION-03, UPSTREAM-ISSUE-01/02/03 e INT-01/02/03/09. Conferi cada uma contra as mesmas cláusulas upstream de r1 (AEC §§4–5.4 e §7.1, AEOS §§3, 5, 8, 9, 13, 13.1, 14, PDM §5, PA AR-08/09, AESL S21/S29/S33/S45/S46/Q06/Q09). Também procurei regressões de máquina de estado nas partes novas. O conteúdo que passou em r1 e não mudou **não foi reaberto**. |
| Limites | Este parecer não julga UX estrutural, Crew/privacidade (SEC-) nem agente/LLM (AI-) além da derivabilidade. Nenhum código, harness, provider, pesquisa ou escolha de stack. |

## 2. Adjudicação dos findings r1

| Finding r1 | Veredito | Evidência r2 |
|---|---|---|
| **UXS-ENG-01** MATERIAL — revogação ou desconexão sem cópia despachada ou entregue | **RESOLVED** | WEA-07 (l. 586) separa os três casos: fila cancelada; despachado antes da revogação conserva o resultado real ou "pode ter chegado"; cópia entregue permanece e não pode ser cancelada sem escrita. Cita AEOS §13.1 e AESL S21/S46. WEA-LX (l. 614) repete os três casos e tem "nunca dizer" "Envio cancelado"/"removido do relógio" sem prova. DEG-14 (l. 732) e J-15 (l. 833) estão alinhados. WEA-10 (l. 589) define a composição nível de prova (L2–L5/LF/LU) × atualidade (vigente/LO/LR) × sobreposições (LH/LX/LP/LD): "uma sobreposição nunca apaga o fato de uma possível cópia remota". Atende AEC §5.3 (l. 134) e AEOS §13.1 (l. 274, 276). |
| **UXS-ENG-02** MATERIAL — semântica offline e sem resposta | **RESOLVED** | CONF-17 (l. 473), item por item: (1) ato vira intenção pendente "ainda não aplicado" e o vigente é a única revisão executável; (2) na reconexão a guarda decide APPLIED/STALE, sem herdar a confirmação para outro plano-base; (3) edição offline fica guardada como pedido, sem alcance inventado; (4) resposta de ASK offline é fato local pendente; (5) limitação declarada offline é gravada na hora, e a orientação preparada da sessão em curso ou iminente e das dependentes deixa de ser apresentada como válida, sem limiar; (6) repetir o mesmo ato resolve para a intenção original, conforme AEC §5.4; (7) STR-06 offline usa só alternativa preparada e válida, senão AG-05 (l. 379). ST-DEC (l. 221): `ACCEPTED` = "confirmação registrada, aplicação pendente — nunca exibida como aplicada antes do commit". Propagado a NAV-11, DEG-17, DEG-37, ASK-03, HOJ-R7 e J-08. Atende AEC §5.3 (l. 139: "sem ignorar restrição/hold novo"), AEOS §13.1 e AR-09. |
| **UXS-ENG-03** NB — saídas de LU e oferta de "enviar" | **RESOLVED** | WEA-11 (l. 590): reconciliação antes de LU quando a rota permite leitura; recibo tardio leva LU a L4/L5; erro posterior leva a LF; possível segunda cópia mostrada na linguagem de LP; "enviar" a mesma revisão e destino só a partir de LF/LU, como nova intenção com o risco explicado. WEA-LU referencia WEA-11. Atende AESL Q06. |
| **UXS-ENG-04** NB — qualificadores de derivabilidade | **RESOLVED** | (a) RUN-07 (l. 362): a revisão executada só é registrada quando a referência do export volta; senão fica desconhecida ou apenas proposta. (b) ST-SES (l. 225) e HOJ-C10 (l. 336): "aguardando dados" exige evidência — export em L3–L5, ingestão "aguardando/atrasada" ou declaração da pessoa; sem evidência, "sem registro"; DEG-10 alinhado. (c) DEG-14, NOT-C (l. 789) e ST-CONN (l. 241): revogação só quando a rota a expõe; leitura opaca segue WEA-05. (d) WEA-03 (l. 582): device/OS/firmware incluídos, com o estado "comprovada para a rota; seu relógio não verificado". |
| **UXS-ENG-05** NB — inconsistências pontuais | **RESOLVED** | (a) STR-11 (l. 384): "em aberto" fica visível até a pessoa fechar; o motor trata o restante como desconhecido; sem rótulo automático "parcial" nem prazo inventado. ST-SES tem gatilhos por evento (fim da janela/validade, início de outra sessão, saída explícita), sem limiar; DEG-36. (b) DEG-11 (l. 729): a provável duplicata não é somada e a decisão dependente fica limitada (AEC §4, HC04). (c) FLOW-08 (l. 139) e ST-OBS (l. 227): "são diferentes" vira `UNASSOCIATED` confirmado e o mesmo par não volta sem fato novo. |
| **UXS-ENG-06** NB — UPSTREAM-ISSUE-01 | **RESOLVED no que cabe ao autor; resíduo com owner** | UPSTREAM-ISSUE-01 (l. 868) foi reformulado em escopo (Founder via FOUNDER-DECISION-03), capacidade (Engineering, G06/O016 ou linha própria; "G09 sozinho não basta") e finalidade (**Security co-owner**, G07, PB-F-03). O trigger está correto: finalidade antes da copy de consentimento; capacidade antes do handoff de SURF-08 e de O014. RUN-13 (l. 368) cria a finalidade condicional de localização/sensores, com coleta só durante a execução, sem passar a Crew, share, aviso, tela bloqueada ou notas de export, e com dedupe por WEA-08. Também aparece em ONB-05 (l. 261), RUN-06 (l. 361, inclusive avisos em segundo plano) e DEP-10 (l. 856). **Resíduo:** o registro no PDR §5 é recomendado ao Founder no checkpoint, porque o PDR fica byte-idêntico nesta missão. Owner: Chief. É uma pendência legítima fora da autoridade do autor e não condiciona este gate documental. |
| **UXS-ENG-07** NB — INT-01/02 | **RESOLVED (resíduo com o owner do AEOS)** | INT-01 (l. 888) e UPSTREAM-ISSUE-03 (l. 872): plano-base "sem plano" + `APPLY_PLAN_CHANGE`; a escolha da `action_class` fica com o owner do AEOS, sem inventar classe. INT-02, CONF-15 (l. 471), HOJ-C21 e DEG-31: continuação apresentada antes do fim do horizonte, no máximo um NOT-A, e a sucessora de mesmo efeito semântico não gera aviso nem marca. Coerente com AEOS §13 ("comparar delta material") e §14/B6. |
| **UXS-ENG-08** NB — INT-09 por categoria | **RESOLVED** | AG-04 (l. 560) e INT-09 (l. 896): HC01–04, HC06 e HC08–09 bloqueiam a prescrição; HC05 causado pela própria edição vira atualização confirmada do contexto; pular, remover ou marcar indisponível nunca é bloqueado; HC07 é guarda de versão. A fronteira entre "não farei" (FLOW-04, futuro) e "não realizada" (FLOW-05, janela corrente ou passada) é derivável. |

## 3. Partes novas: derivabilidade e regressões

| Item novo ou alterado | Resultado | Nota |
|---|---|---|
| CONF-16 (iniciar com proposta pendente) | **PASS com nota** (UXS-ENG-r2-01) | Começar a sessão é um fato relevante para a guarda: as revisões de sessão, escolha e execução fazem parte do `CommitAuthorizationGuard`, e HC07 diz que "sessão iniciada conserva executado". Portanto `PRESENTED → STALE` com motivo factual é derivável a partir de AEOS §13 e §13.1, e iniciar não confirma (CONF-03). A regra "proposta para o restante só com fato material novo" precisa de registro explícito para ser implementável e auditável (ver o finding). |
| CONF-17, DEG-37, ST-DEC `ACCEPTED` | **PASS** | Ver §2. Nada prometido exige uma nova capacidade além de persistência local e da guarda já contratada. |
| Gatilhos de "em aberto" (ST-SES, NAV-02, DEG-36) e HOJ-R8 | **PASS** | Todos são eventos deriváveis do plano e do dispositivo, sem limiar fisiológico ou temporal inventado. Nota sem finding: entre o esquecimento e o fim da janela, a medição RUN-13 continua. Limitar isso com auto-pausa por inatividade exigiria um limiar, que é decisão de policy/G09; a minimização de localização é de Security. A pessoa corrige o resultado por FLOW-05. |
| WEA-10/11, WEA-L1 (campos transmitidos) | **PASS** | Os campos derivam do relatório de preflight (AEC §5.2). As exclusões de conteúdo pertencem à revisão de Security. Nota sem finding: a partir de L3/L4 sem prova de device, "enviar" a mesma revisão não é oferecido. Isso é conservador e coerente com AEC §5.4 (sem duplicata cega). A saída é substituir ou cancelar quando suportado, ou usar o app (PR-10). |
| HOJ-R7 / OBJ-08 (relato antes de iniciar) → HC03 → AM-11 | **PASS** | Online, a avaliação é normal; offline vale CONF-17(5). NAV-07 deixa P0 encerrar sem efeito apenas FLOW-02/04/06 e a ação preparada do FLOW-16, todos dependentes do escopo retido, e preserva o que a pessoa informou nos demais fluxos. Coerente com AR-05 e AEC §7.1. |
| STR-13 (realizado anterior) e STR-14 (ordem livre) | **PASS** | Derivam das próprias observações. Mudar a ordem sem mudar o conteúdo é realizado registrado (AEC §3.7), não uma `CHANGE_REMAINING_EXECUTION`. |
| HOJ-C23 / J-21 (retorno após `NO_DATA`, com opção de "pausa" retroativa) | **Finding NON_BLOCKING** (UXS-ENG-r2-02) | Regressão de semântica na máquina ST-CTN: ver abaixo. |
| RUN-13, ONB-05, DEP-10, FOUNDER-DECISION-03 | **PASS** | Finalidade condicional, sem presumir capacidade. A decisão de escopo cabe ao Founder; o ramo sem sensores já está completo. |
| CONF-14 (precedência CONF-10 > CONF-14), DEG-34 | **PASS** (engenharia) | Coerente com AEOS §12.3 e §16 ("KEEP último plano" não é fallback). A fidelidade da explicação pertence à revisão AI. |

## 4. Novos findings

### UXS-ENG-r2-01 · NON_BLOCKING · CONF-16: a supressão da proposta para o restante precisa de registro explícito

- **Local:** CONF-16 (l. 472). Afeta também J-09(d) e HOJ-C22.
- **Critério:** AEOS §14 (o `StabilityState` guarda o candidato aceito ou recusado, e uma proposta recusada só volta com fato, declaração ou policy material nova) e AEOS §13 (trace de "prévia/alcance/ato confirmado ou rejeitado").
- **Cenário e impacto:** uma proposta pendente vira `STALE` porque a pessoa inicia a sessão. A reavaliação seguinte, com o mesmo fato F, tende a gerar uma `CHANGE_REMAINING_EXECUTION`. CONF-16 a suprime, mas `STALE` não é `DECLINED`, e o mecanismo anti-flip-flop do AEOS não reconhece "iniciou com proposta pendente". Sem um registro explícito, a implementação ou reapresenta a proposta (contrariando CONF-16) ou a esconde fora do trace (perdendo auditabilidade). Há ainda o caso de uma proposta composta (REPLAN) que inclui a sessão iniciada: ela fica inteira `STALE` (sem aceite parcial, INT-10), e a sucessora para as **demais** sessões é legítima, porque o início é um fato novo para elas.
- **Resolução recomendada:**
  1. Registrar o início com proposta pendente como evento de agência no trace e no `StabilityState`, ligado aos reason refs da proposta `STALE`, para que a supressão seja derivável.
  2. Declarar que a supressão vale só para a execução iniciada.
  3. Declarar que, numa proposta composta, as demais sessões podem receber uma sucessora avaliada normalmente.
  4. Manter a exceção de safety, que já existe.
- **Owner:** autor (Product/UX). Pode ser tratado no próximo ciclo de edição; não condiciona este gate.

### UXS-ENG-r2-02 · NON_BLOCKING · HOJ-C23/J-21: "pausa" retroativa sem semântica definida em ST-CTN

- **Local:** HOJ-C23 (l. 349) e J-21 (l. 839), frente a ST-CTN, CTN-04/06 e J-07.
- **Critério:** AEOS §4 (`continuity_state` com `INTERRUPTED_DECLARED → RETURNING`; "interrupção encerra prescrição ativa, retorno usa contexto atual"), AEC §4 (interrupção declarada encerra o planejamento ativo; dado tardio readapta o futuro e preserva a decisão passada) e AEOS C10.
- **Cenário e impacto:** a pessoa volta depois de semanas em `NO_DATA` e marca o período como "pausa". A r2 não diz se isso:
  - (a) é apenas uma declaração histórica sobre o intervalo passado (desconhecido → pausa) e o plano corrente segue reavaliado, possivelmente produzindo RETURN pela policy C10; ou
  - (b) leva a continuidade a `RETURNING`, que exige uma proposta `RETURN` adotada antes de qualquer nova prescrição, como em J-07 e CTN-06.

  São duas máquinas diferentes para o mesmo estado. A implementação pode escolher qualquer uma, com efeito visível distinto: sessão prescrita imediatamente ou não.
- **Resolução recomendada:** declarar a semântica. A leitura mais coerente com AEC §4 é a (a): uma declaração retroativa sobre o intervalo é registrada como continuidade passada, sem `INTERRUPTED_DECLARED` corrente; o motor reavalia o horizonte e, se a policy C10 exigir rebase, a saída é a proposta RETURN normal (MAN-3). Em qualquer caso, nenhuma prescrição corrente é aplicada sem o ato exigido.
- **Owner:** autor (Product/UX). Não condiciona este gate.

## 5. Critérios da rubrica (delta)

| Critério | Resultado |
|---|---|
| Produto aprovado respeitado; nada removido por conveniência técnica | PASS. As correções acrescentam honestidade de estado; RUN-13 é condicional e não cria promessa. |
| Contratos, versões e dependências explícitos | PASS. AEC §4–5 e AEOS §13/§13.1 são consumidos sem alteração. UPSTREAM-ISSUE-01/03 são encaminhados aos owners corretos. |
| Reliability, sync, offline e idempotência verificáveis | PASS. CONF-17, WEA-07/10/11 e o trio LX/DEG-14/J-15 fecham as lacunas de r1. |
| Máquinas de estado coerentes | PASS com nota: UXS-ENG-r2-02 (ST-CTN) e UXS-ENG-r2-01 (estabilidade em CONF-16). |
| Omitir requisito por ser difícil / boundary sem análise de consumidores | Não constatado / N/A. |
| Migração, performance, runtime, release | N/A ao outcome documental; seguem com G06/G09. |

## 6. Gate e handoff

- **Veredito:** **PASS WITH NON-BLOCKING FINDINGS** — ENGINEERING_CONTRACT_REVIEWED documental para UXS-1.0-r2, SHA-256 `092ec0336ddaf6bee5257d3c45a5f34ad5ac232beb9cb26ee1a2604d4b410bec`.
- **Findings r1:** UXS-ENG-01 a 08 RESOLVED. Resíduos fora da autoridade do autor, com owner: registro de UPSTREAM-ISSUE-01 no PDR §5 (Chief, no checkpoint do Founder) e UPSTREAM-ISSUE-03 (owner do AEOS).
- **Novos:** UXS-ENG-r2-01 e UXS-ENG-r2-02, ambos NON_BLOCKING e com owner no autor.
- **Escopo:** o gate vale só para este hash e para o domínio de engenharia. Uma alteração material invalida apenas a cobertura dependente e exige revalidação de delta proporcional. Este parecer não substitui Product/UX, Security ou AI, nem aprovação do Founder.
- **Hash final do artefato (recalculado ao fim desta sessão):** `092ec0336ddaf6bee5257d3c45a5f34ad5ac232beb9cb26ee1a2604d4b410bec`.
- **STOP** após este relatório.
