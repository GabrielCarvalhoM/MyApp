# UX_REVIEW_r1 — Architecture Eval independente da Detailed UX Specification

**Veredito: FAIL (REQUEST_CHANGES) · ARCHITECTURE_REJECTED para UXS-1.0-r1.** 0 BLOCKING · 8 MATERIAL · 8 NON_BLOCKING. O gate **UX_SPEC_STRUCTURAL_REVIEWED não é emitido**; VISUAL_READY não é emitido; `DETAILED_UX_READY_FOR_FIGMA` **não está estruturalmente sustentado nesta revisão**. Se uma revisão corrigida receber PASS deste gate, isso equivalerá a VISUAL_READY somente para aquela revisão avaliada; a entrega ao Designer/Figma continuará dependendo de aprovação separada do Founder e dos demais gates da missão.

## 1. Cabeçalho, independência e método

| Campo | Registro |
|---|---|
| Task / contrato / missão | UXSPEC-20261018 / UXSPEC-20261018-r1 / MISSION-UXSPEC-1.0 |
| Artefato avaliado | `product/UX_SPECIFICATION.md`, revisão **UXS-1.0-r1**, 160 846 bytes; cópia congelada `review-inputs-r1/UX_SPECIFICATION.md` |
| SHA-256 recalculado | `08ac2f964791f1b9903ca435174a4d660ad74d2abb9a55cd2e9e2df42afc5d8c` — no início (sessão de 2026-10-18, antes da interrupção por HTTP 429), na retomada (2026-10-19T07:33:41-03:00) e no fim da avaliação, antes de gravar este relatório (2026-10-19T07:40:51-03:00), com PowerShell `Get-FileHash -Algorithm SHA256`. Original e cópia congelada iguais nas três leituras; igual ao `MANIFEST.json`. |
| Avaliador / modo | Product/UX Architect 1.2.0, instância J-UX fresca, **modo independent** (MISSION_RECORD §3/CP3). Não é autor nem coautor da especificação, do upstream ou dos checks. Rota declarada pelo Chief: claude-opus-5-5 / max; modelo servido identificado pelo runtime como claude-opus-5-5. |
| Rubrica / skill / protocolos | PRODUCT_ARCHITECTURE 1.0.0 (extensão 1.2.0); skill verify-product-architecture 1.0.0; constituição PRODUCT_UX_ARCHITECT 1.2.0; CORE 1.4.0; EXECUTION_PROPORTIONALITY 1.5.0; evals/README 1.4.0; HANDOFF 1.2.0. |
| Critérios de aceitação | MISSION_RECORD §5 itens 1–22; 15 dimensões do Founder conforme o brief deste judge; verificações específicas do brief. |
| Evidência executada | Leitura integral do artefato (979 linhas, §0–§26). Upstream lido: PTC-3.0.0 integral (L003–L023, C023–C044, C025, §12), RS-1.1, PA-1.1, EM-1.1, CF-1.1, PDM-1.1, AEC-1.1, AEOS-1.0-r2 integral, AESL-1.0-r2 integral, PDR-1.1 §§1–6 (DR-55–71, G01–G11), `audits/pre-ux-2026-10-15/FINAL_READINESS_AUDIT.md`, PB-F-01–03 em `audits/pre-ux-2026-10-15/SECURITY_REVIEW_r1.md`, `audits/adaptive-engine-2026-10-15/PRODUCT_UX_REVIEW_r1.md`, decisão Founder de experiência híbrida (2026-10-11), CURRENT_MISSION e MISSION_RECORD (incluindo CP3b). Buscas textuais para confirmar presença/ausência de regras (contexto do dia, marco, recente, aguardando, em aberto, NO_DATA, localização/GPS/sensores, horizonte). `PRE_REVIEW_VERIFICATION.json` inspecionado (285/285; 172 preservação, 63 cobertura de termos, 28 links, 15 rastreabilidade; 2 warnings = citações intencionais do “+20%” em NUT-07/J-14); não reexecutado, pois prova apenas hash/escopo/links/termos. Cenários negativos analíticos em §7. |
| Escrita | Somente este arquivo. Nenhuma edição do artefato, upstream ou outros arquivos; nenhuma correção silenciosa. |

## 2. Síntese do julgamento

A especificação é sólida em grande parte do que mais importa ao produto: decisões estruturais com alternativas reais (ALT-UX-01–08), Hoje sem ownership (AR-01) e composição por prioridade, matriz de adaptação conservadora fiel a DR-63/AEC §3/AEOS `confirmation_scope`, níveis MAN-0–4 com regras anti-teatro, explicação vinculada ao trace oficial e template determinístico, confiança sem score, escada WEA-L com “nunca dizer”, Nutrition e Crew contidos, catálogo DEG extenso, marcadores DEP explícitos e handoff com fixo/design space/retorno.

O FAIL decorre de oito lacunas MATERIAL em áreas que o próprio §24.1 declara **fixas** para o Designer. Em cada uma, o Designer teria de inventar regra de produto: entrada do contexto do dia e da limitação pré-sessão (caminho de safety), regra de interrupção de fluxos que pode descartar registro, transições temporais sem gatilho, proposta pendente versus início da sessão, retorno após ausência não declarada, continuação do horizonte, profundidade por modalidade em Progresso/marcos, e finalidade de localização/sensores com enquadramento incompleto do UPSTREAM-ISSUE-01. Nenhuma é BLOCKING: não há ownership ambíguo, jornada sem saída ou violação inequívoca de invariante; há regras ausentes ou contraditórias que precisam de correção pelo autor e revalidação de delta.

## 3. Architecture Eval — critérios da rubrica

| Critério PRODUCT_ARCHITECTURE 1.0.0 | Resultado | Evidência |
|---|---|---|
| Necessidade/outcome | **FAIL** (parcial) | O problema reformulado (MISSION_RECORD §1) é atendido em quase todo o escopo (§1–§22). Não traduz o “histórico específico” de Running (RS §2) nem o “aprofundamento por Running/Strength” de Progresso (PA §2): **UXS-UX-07**. Benefício continua hipótese H008/H009, corretamente declarado. |
| Canonical ownership | **PASS** | §3/§5.1: cada objeto tem dono; Hoje, agente, avisos e export abrem a mesma referência (PR-02, NAV-04/05, HOJ-R6); HOLD na decisão/sessão, sem hub; export na sessão; consentimento único em SURF-13. Observações NON_BLOCKING: UXS-UX-09 (rastreabilidade de INT-04), UXS-UX-16a (unidades em dois lugares). |
| Arquitetura/navegação | **FAIL** | Destinos do PA preservados, 8 superfícies de detalhe com teste de necessidade, 16 fluxos, 14 rejeições, nenhum destino órfão ou hub disfarçado (§5.2 deste relatório). Falham a entrada declarada no PA §3 para o contexto do dia (**UXS-UX-01**) e a referência da sessão às propostas que a afetam (**UXS-UX-04**). |
| Jornada | **FAIL** | J-01–J-20 cobrem CF S01–S18 e AESL pertinentes. Faltam ou se contradizem: descarte de fluxos por P0 (**UXS-UX-02**), iniciar com proposta pendente (**UXS-UX-04**), retorno após NO_DATA (**UXS-UX-05**), continuação do horizonte (**UXS-UX-06**). |
| Hierarquia | **FAIL** (fronteira) | Ordem HOJ-S1–S7 fiel ao PA §4 e HOJ-R1 preserva registro. A fronteira de P0 depende de “iminente”, não definido, e NAV-07 classifica conflito de versão como P0: **UXS-UX-03**, **UXS-UX-02**. |
| Estados | **FAIL** | §5.2 e §18 cobrem famílias com saídas; confiança ≠ HOLD; transporte ≠ entrega ≠ execução. Faltam gatilhos de transição e um objeto sem definição: **UXS-UX-03**, **UXS-UX-07** (marco), **UXS-UX-04** (sessão sem sobreposição de proposta). |
| Terminologia/invariantes | **FAIL** | Enums AEOS preservados, sem limiar, dose, score ou copy inventados. O ramo de medição por sensores usa dado sem finalidade própria (PDM I6, L014): **UXS-UX-08**; NAV-07 torna ambígua a preservação de registro de AR-05: **UXS-UX-02**. NON_BLOCKING: UXS-UX-09, UXS-UX-12. |
| Alternativas/prova | **PASS** | ALT-UX-01–08 comparam candidatos reais, inclusive preservar a estrutura do PA; provas por jornadas analíticas são proporcionais à missão sem wireframe. |
| Handoff | **PASS** (estrutura) | §24 separa fixo, design space e retorno ao Architect; §22 mapeia G01–G11 sem criar owners; §23 explicita issue, decisões reservadas e INT. Correções de enquadramento em UXS-UX-08 e UXS-UX-10. |

Regra da rubrica: PASS exige todos os critérios aplicáveis atendidos; aqui há FAIL material em seis critérios. Resultado: **FAIL**.

## 4. Findings

### 4.1 MATERIAL

**UXS-UX-01 · MATERIAL · Entrada do contexto do dia e da limitação pré-sessão ausente no Hoje e na Sessão**
- **Local:** §3.1 SURF-01 (Seleciona; Ações primárias); §7.1–7.2 (HOJ-S1–S7, HOJ-R1–R6); §3.2 SURF-07 (Ações); §5.1 OBJ-08; §21 J-08; §24.1 (composição do Hoje fixada).
- **Critério:** Arquitetura/navegação (descoberta de entrada declarada upstream); Jornada (entrada do caminho de safety); “UI não precisará inventar regra de produto”.
- **Evidência upstream:** PA §3, linha “Recovery diário autodeclarado → Plano → contexto do dia”, com **Hoje** entre as outras entradas; EM §3 (registrar/corrigir fato próprio inclui contexto); AEC §2.1 e §7.1 (relato de limitação prevalece sobre sinal favorável; restrição tem precedência); CF S13 e RS S13; C034.
- **Evidência no artefato:** OBJ-08 vive em “SURF-02 → contexto do dia”. Nenhum espaço HOJ-S1–S7 nem ação de SURF-01 ou SURF-07 permite declarar contexto do dia ou limitação antes de iniciar. J-08 depende de “Relato (RUN-08/STR-05/contexto do dia)”, mas RUN-08 é pós-sessão e STR-05 ocorre durante Strength. Nenhuma ALT ou INT justifica o desvio da entrada do PA.
- **Cenário/impacto:** no dia do longão a pessoa acorda com dor no joelho; Hoje S2 oferece “iniciar”. O único caminho especificado para relatar antes da sessão é Plano → janela → contexto do dia (ou Você → Meu contexto, que é atualização de contexto estável). O caminho de safety mais sensível não tem entrada no ponto de decisão; como §24.1 fixa ordem e teste de relevância do Hoje, o Designer não pode acrescentá-la sem retorno ao Architect.
- **Resolução exigida:** incluir OBJ-08 na seleção do SURF-01 e em um espaço do Hoje (S2 ou S4) como entrada disponível e **não solicitante** — nunca pergunta, lembrete, checklist ou bateria diária (ASK-05, HOJ-R4); incluir na faceta de preparação de SURF-07 “relatar limitação/como estou antes de iniciar”; declarar que um relato de limitação por essa entrada segue HC03 → AM-11 (S1/P0 quando a sessão estiver no escopo) e que o consentimento é pedido no primeiro uso (§6.2). Se o autor sustentar outra solução, registrar a divergência com o PA como UPSTREAM-ISSUE.
- **Owner:** Product/UX Architect autor (worker UXSPEC). Reavaliação: delta por este judge.

**UXS-UX-02 · MATERIAL · NAV-07 descarta qualquer fluxo interrompido por “P0”, inclusive registro e contestação**
- **Local:** §4 NAV-07; conflita com HOJ-R1, CONF-07, DEG-30 e com FLOW-05/08/09/12/15.
- **Critério:** Jornada/Estados; invariante AR-05; definição de P0.
- **Evidência upstream:** PA §4 (P0 = execução em curso + condição material de segurança; AR-05 “preservando acesso ao registro/correção e funções não dependentes”); EM §4 (“risco material tem precedência, mas não apaga registro”); AEOS §13/§13.1 (STALE atinge efeitos não aplicados dependentes; fato comprometido é preservado).
- **Evidência no artefato:** NAV-07 diz que “fluxo interrompido por P0 (retenção nova, conflito de versão) é encerrado sem efeito”, sem restringir a quais fluxos, e classifica conflito de versão como P0.
- **Cenário/impacto:** a pessoa termina a corrida e está em FLOW-05 informando conclusão parcial e esforço; chega HOLD no escopo dessa sessão (P0 por HOJ-S1). Pela letra de NAV-07, o fluxo termina sem efeito e o registro digitado se perde; o mesmo ocorre com uma contestação em curso (FLOW-09) ou uma associação (FLOW-08). HOJ-R1/CONF-07 dizem o oposto, e o Designer precisa escolher.
- **Resolução exigida:** restringir NAV-07 aos fluxos cujo efeito depende do escopo alterado (FLOW-02, FLOW-04, FLOW-06 e a ação preparada em FLOW-16); declarar que FLOW-05/08/09/10/12/15 nunca são descartados por P0 (só a parte dependente pode ficar bloqueada; o conteúdo informado pela pessoa é preservado); tratar conflito de versão como STALE (CONF-02/CONF-12), não como P0.
- **Owner:** autor.

**UXS-UX-03 · MATERIAL · Transições temporais e de evidência sem gatilho no modelo de estados**
- **Local:** §5.2 ST-SES; NAV-02; HOJ-S1, AM-11 e NOT-P0 (“iminente”); HOJ-S5 (“recente”); HOJ-C09/C10; STR-11; DEG-09/DEG-10; WEA-04; J-05.
- **Critério:** Estados (“transições definidas; UI não precisará inventar regra”); Hierarquia (fronteira de P0).
- **Evidência upstream:** PDM §5 Sessão (não define “em aberto”); AEC §4 e §5.3 (desconhecido ≠ não realizado; atraso é estado da integração); C040 e PR-08 (nenhum estado alega prova inexistente); AESL S08/S09; PA §4.
- **Evidência no artefato:** (i) não há gatilho para sair de “em execução/pausada” quando a pessoa abandona a sessão sem encerrar — NAV-02 então leva toda abertura do app à faceta de execução e HOJ-S1 fica ocupado indefinidamente; (ii) STR-11 diz que a sessão não fechada “conta como parcial”, enquanto ST-SES e DEG-09 a mantêm “em aberto” até a pessoa fechar; (iii) HOJ-C10/J-05 exibem “aguardando dados de ‹fonte›” como distinto de “sem registro”, mas ST-SES dá a “sem registro” a saída “aguardar sync se houver conexão” e nenhum critério de evidência separa os dois; (iv) “recente” (S5) e “iminente” (S1, modal de HOJ-R2, NOT-P0) não têm definição.
- **Cenário/impacto:** corredor esquece de encerrar a corrida no app e, por dias, o app abre na execução com P0 no Hoje (com medição por sensores, o registro continuaria ativo); pessoa conectada que não treinou vê “aguardando dados do relógio” para ontem, sugerindo atividade inexistente; o Designer decide sozinho quando um HOLD vira modal e quantas sessões passadas S5 lista.
- **Resolução exigida:** definir gatilhos UX por evento/evidência, sem limiar fisiológico: (a) quando a execução não encerrada passa a “em aberto” (ex.: fim da validade/janela da revisão executada, início de outra sessão ou saída explícita) e que NAV-02/S1 só valem antes disso; (b) alinhar STR-11 a DEG-09 (o motor pode tratar o restante como desconhecido sem rótulo visível automático “parcial”); (c) “aguardando dados” somente com evidência da integração (ingestão atrasada em WEA-04 ou export em WEA-L3–L5 com retorno esperado), senão “sem registro”; (d) “recente” e “iminente” como regra UX explícita ou como slot `[DEP-G02]` com estado provisório definido.
- **Owner:** autor; Engineering confirma derivabilidade em seu gate.

**UXS-UX-04 · MATERIAL · Proposta pendente e início da sessão: a Sessão não mostra a proposta e a transição não está definida**
- **Local:** §3.2 SURF-07 (Seleciona: insight e decisão de origem; Estados: ST-SES/ST-EXP/ST-OBS/ST-NUT + HOLD); §10.3 MAN-3 (“SURF-06 + Hoje S3 …; senão só Plano”); CONF-03/07/09; HOJ-C22; J-09/J-10; DEG-08.
- **Critério:** Jornada (proposta → execução), Estados, agência informada.
- **Evidência upstream:** AEC §3.4 e §3.6; AEOS §5 (sessão iniciada fixa a revisão executada) e §13.1 (a guarda inclui estado da sessão; mudança → STALE); PA §3; C033/C034.
- **Cenário/impacto:** proposta “reduzir volume da corrida de hoje” em PRESENTED; a pessoa abre a sessão pelo Plano ou pelo aviso de envio e toca “iniciar”. SURF-07 não sinaliza a proposta. Ao iniciar, a proposta APPLY_PLAN_CHANGE fica inválida pela guarda, mas a especificação não diz se ela vira STALE em silêncio, se reaparece imediatamente como CHANGE_REMAINING_EXECUTION em S1 (pressão logo após uma recusa implícita) ou se o “iniciar” deve informar a existência da proposta. É o caminho mais comum de “ignorar” (DEG-08).
- **Resolução exigida:** acrescentar a SURF-07 a sobreposição de ST-DEC/ST-ASK pendentes que afetam a sessão (com acesso a FLOW-02/03); fixar a transição “iniciar com proposta pendente”: início não confirma (CONF-03); proposta → STALE com motivo factual; regra explícita de reapresentação para o restante (CONF-07) coerente com MAN-R4 e §10.5, sem transformar o início em decisão forçada.
- **Owner:** autor; AI Systems pode avaliar a manifestação em seu gate.

**UXS-UX-05 · MATERIAL · Retorno após ausência não declarada (`NO_DATA`) sem caso no Hoje nem jornada**
- **Local:** §7.3 (sem caso); ST-CTN; CTN-05; HOJ-S5; DEG-10; §21 (J-07 cobre só FLOW-14).
- **Critério:** Jornada (retorno e recuperação), Estados; pergunta 17.
- **Evidência upstream:** L013; EM §5 (sem dados, interrompido e retornando distintos; “recomeçar é parte do produto”); AEC §4 (falta de dado não é abandono; sem compensação); AEOS §4 `continuity_state`; AESL S08/S09 (ASK factual mínimo só se necessário; reavaliação futura sem reposição); RS §4 (ausência não vira abandono; retorno rebaseado).
- **Cenário/impacto:** a pessoa some por três semanas sem declarar interrupção e volta. Não está especificado se S5 lista cada janela “sem registro” (lista implícita de faltas, contrária a “cobrança repetida” em HOJ-S5 e a L016/L017), se S2 mostra a sessão do plano antigo como se nada tivesse ocorrido, se há pergunta mínima ou rebase. HOJ-C14/C15 e J-07 tratam só a interrupção declarada.
- **Resolução exigida:** acrescentar um caso HOJ e uma jornada J para retorno após NO_DATA: janelas desconhecidas agregadas em um único item opcional, sem contagem ou lista; S2 com a decisão vigente e limitação de confiança quando a lacuna afetar a ação; ASK factual mínimo só quando decisivo; manifestação da reavaliação do motor (rebase conforme AEOS/policy) sem compensação; opção de declarar interrupção retroativamente, sem motivo.
- **Owner:** autor.

**UXS-UX-06 · MATERIAL · Continuação do horizonte modelada depois do fim (INT-02): lacuna recorrente sem plano**
- **Local:** §5.2 ST-PLAN; SURF-02 Estados (“sem plano (… ou horizonte encerrado com continuação proposta)”); HOJ-C21; DEG-31; AM-08; CONF-15; INT-02; J-01.
- **Critério:** Jornada (continuidade semanal), Estados.
- **Evidência upstream:** C044 (Repeat) e C007; RS §1; DR-63 (confirmação); AEOS §13 (validade/expiração); PDM §5.
- **Evidência no artefato:** a continuação aparece apenas no estado “horizonte encerrado com continuação proposta”, tratado como “sem plano”; não há regra de apresentação antes do fim. A duração do horizonte é `[DEP-G02]` e pode ser curta.
- **Cenário/impacto:** horizonte de uma semana termina no domingo; a pessoa não abre o app; na segunda não há prescrição (DEG-31) e o Hoje mostra “revisar a continuação” (HOJ-C21). Isso se repete a cada horizonte: o loop semanal passa a ter um estado degradado embutido.
- **Resolução exigida:** especificar que a continuação é preparada e apresentada como MAN-3 **antes** do fim do horizonte (entra em S3 quando afetar a próxima sessão; no máximo um NOT-A), que o fim sem adoção é exceção (DEG-31) e não a cadência normal, e registrar que o ônus de confirmação recorrente será revisto quando G02 fixar a cadência.
- **Owner:** autor.

**UXS-UX-07 · MATERIAL · Progresso e profundidade por modalidade sub-especificados (histórico Running/Strength; marco próprio)**
- **Local:** §3.1 SURF-03 e SURF-01 (“marco próprio elegível”); §7.2 (nenhum espaço admite marco); SURF-08/09, STR-03; RUN-09; SHR-01; J-13; §25.3 Q3/Q4.
- **Critério:** Necessidade/outcome (cobertura de RS §2), Estados, Terminologia/invariantes.
- **Evidência upstream:** RS §2 Running (“histórico específico”); PA §2 Progresso (“aprofundamento por Running/Strength”); RS §4 Strength (“progressão/adaptação possíveis”); L023/C024/C031; PA §3 (“Histórico, marcos, trajetória → Progresso; Hoje seleciona marco próprio”); L019/L020, D007, O001/O008.
- **Evidência no artefato:** SURF-03 lista realizadas, descanso, interrupções, trajetória sob policy e histórico de decisões, mas não diz o que é a profundidade de Running e de Strength (ex.: realizado por etapa; histórico por exercício) nem se SURF-09 mostra o realizado anterior do exercício como referência factual. “Marco próprio” não tem definição, elegibilidade, estados ou espaço em §7.2, embora SURF-01 o selecione e SHR-01/J-13 o compartilhem.
- **Cenário/impacto:** o Designer decide sozinho se Progresso mostra recordes pessoais e totais por exercício ou grupo muscular (mérito vedado por STR-07 e SURF-03) ou omite a profundidade exigida por RS §2; inventa a mecânica de marcos (gamificação) num ponto regido por L019/L020.
- **Resolução exigida:** especificar em SURF-03 a profundidade por modalidade em fatos realizados na linguagem de cada modalidade, sem tendência/derivado sem policy `[DEP-G02/G03]` e sem recorde ou total como mérito; decidir se SURF-08/09 exibem o realizado anterior como referência factual; definir “marco próprio” em nível UX (classes elegíveis ligadas a continuidade apropriada — ex.: retorno, período concluído, adaptação/descanso honrados — nunca volume ou sequência), seus estados e seu espaço no Hoje (ou retirá-lo da seleção do Hoje), com conteúdo dependente marcado.
- **Owner:** autor.

**UXS-UX-08 · MATERIAL · UPSTREAM-ISSUE-01 incompleto: finalidade de localização/sensores ausente e pergunta de escopo não explicitada**
- **Local:** RUN-06; §23.1 UPSTREAM-ISSUE-01; DEP-10; ONB-05; WEA-02; FLOW-15; SURF-13; NOT-08 (visão de execução fora do app).
- **Critério:** Terminologia/invariantes (finalidade própria por uso de dado); Handoff (enquadramento de decisão reservada).
- **Evidência upstream:** PDM §4 I6 (finalidade e escopo próprios; dados sensíveis mínimos); L014; C021 (localização entre dados privados); PA §7/AR-15 (horário/localização sensíveis); RS §2 Running (“execução direta/observação”) e §4 Solo (“loop completo sem … relógio”); L023/C024/O014; PDR G07/G09; MISSION_RECORD §1 (escopo e prioridades de release reservados ao Founder).
- **Evidência no artefato:** o ramo “com ela” do RUN-06 descreve medição ao vivo por sensores do telefone — na prática, localização e movimento contínuos, inclusive em segundo plano —, mas as finalidades enumeradas (ONB-05: primário; sinais de saúde/recovery; leitura e escrita wearable; I10) não incluem essa coleta. UPSTREAM-ISSUE-01 trata o tema como capacidade técnica e leva ao Founder “somente se mudar a promessa”, sem formular a pergunta de escopo.
- **Cenário/impacto:** Engineering confirma GPS e execução em segundo plano; o Designer desenha a corrida medida pelo telefone sem consentimento próprio (ou inventa um). Se a capacidade não entrar, a corrida solo sem relógio fica guiada por tempo e distância manual, e a credibilidade de Running V1 no modo solo (RS §4 + L023) muda sem que alguém tenha decidido se a medição pelo telefone integra a promessa.
- **Resolução exigida:** (a) acrescentar finalidade própria e condicional “medição da corrida pelo telefone (localização/sensores)”: pedido no ponto de uso, recusa → ramo sem sensores sem penalidade, revogação com efeito explicado, exclusão de Crew/share/aviso/tela bloqueada, `[DEP-G07]`; (b) reformular UPSTREAM-ISSUE-01 em duas perguntas: escopo (a promessa de Running V1 em modo solo pressupõe medição pelo telefone? Product/UX propõe em RS; Founder decide se alterar promessa/escopo de release) e capacidade (Engineering, G09), com Security/G07 para a finalidade.
- **Owner:** autor; Chief registra o issue; Security avalia a finalidade em seu gate.

### 4.2 NON_BLOCKING

**UXS-UX-09 · NON_BLOCKING · INT-04 apresentado como “upstream silente”, mas PDM §5 fixa “Proposto → ativo por adesão”.** Local §23.3 INT-04, CRW-08. A semântica UX (adesão privada; estado compartilhado segue o tempo) é a leitura protetora correta em Crews de duas pessoas (AR-10, PB-F-02), mas o upstream não é silente. Risco: Engineering, lendo o PDM, implementar estado compartilhado dependente de adesão. Resolução: manter a semântica e registrá-la como pedido de esclarecimento ao owner do PDM para a próxima emenda. Owner: autor; Chief registra; Security confirma a privacidade.

**UXS-UX-10 · NON_BLOCKING · Letras de opção colidem entre ALT-UX-08 e FOUNDER-DECISION-01.** Em ALT-UX-08, A = canal contextual e C = nenhum agente; em FD-01, A = fora da V1 e C = decidir depois. “Completa sob C” e “Recomendação C” significam coisas diferentes. Risco de leitura errada na decisão do Founder. Resolução: nomear as opções de FD-01 (EXCLUIR/INCLUIR/ADIAR) ou alinhar as letras. Owner: autor; Chief no relatório ao Founder.

**UXS-UX-11 · NON_BLOCKING · “Pular” (AG-04, FLOW-04) versus “marcar como não realizada” (SURF-07, FLOW-05) sem fronteira.** Duas rotas para “não vou fazer esta sessão”, uma com prévia de alcance e outra como fato. Resolução: definir a fronteira (ex.: futuro → FLOW-04 com prévia; janela corrente/passada → FLOW-05 como fato) ou unificar. Owner: autor.

**UXS-UX-12 · NON_BLOCKING · DEG-11 “Risco de carga dupla até resolver” contradiz AEC §4/WEA-08.** AEC §4 proíbe soma duplicada do provável mesmo fato até resolução. Resolução: “provável duplicata não soma; decisão dependente fica limitada até resolver”. Owner: autor.

**UXS-UX-13 · NON_BLOCKING · `REVIEW_PENDING` “em revisão por ‹owner›” para owner externo.** FLOW-09/ST-HOLD: quando o owner é profissional externo ao produto (red flag, restrição — AEC §7.1) e o mecanismo de evidência de saída é `[DEP-G04]`, “em revisão” pode afirmar uma revisão que o produto não opera (PR-08). Resolução: distinguir owners internos (correção de dado, Engineering) de externos; para externos, mostrar que evidência seria aceita e que o mecanismo está pendente, nunca “em revisão”. Owner: autor.

**UXS-UX-14 · NON_BLOCKING · Histórico de conversa indefinido.** AGT-01 diz que o canal não tem estado próprio; AGT-10 menciona “histórico de conversa”. Persistência e visibilidade não estão definidas (condicional a FD-01). Resolução: declarar se a pessoa vê conversas passadas, onde (dono) ou se o canal é efêmero, com dependência G07/G09. Owner: autor; AI Systems/Security em seus gates.

**UXS-UX-15 · NON_BLOCKING · Compromisso leve sem cardinalidade, período e cancelamento definidos.** CRW-08 permite que qualquer participante proponha, mas não define compromissos simultâneos por Crew, quem fixa/edita o período nem se uma proposta pode ser retirada antes do início. Com NOT-E ligado por padrão, propostas repetidas viram canal de pressão (L017/L019). Resolução: uma proposta/compromisso por Crew por vez (ou alternativa justificada), regra de retirada e limite de avisos. Owner: autor; Security em pressão/abuso.

**UXS-UX-16 · NON_BLOCKING · Itens de clareza.** (a) “unidades” aparecem em SURF-05 e SURF-11; (b) NUT-02 cita momentos “durante” e “pós”, mas NUT-01 fixa o lugar na preparação — definir a faceta de cada momento; (c) Strength: definir se executar exercícios fora de ordem é liberdade de execução registrada (AG-05) ou mudança do restante (CONF-07); (d) J-02/ASK-04: explicitar o segundo ato (proposta a confirmar) após a resposta; (e) NOT-02 “microajuste”: remeter a §10.3 (sem limiar UX); (f) Hoje para conta sem modo ativo (consentimento primário recusado e sem Crew; DEG-23, PDM §2). Owner: autor.

## 5. Verificações específicas

### 5.1 Cobertura semântica de MISSION_RECORD §5

| Item | Resultado | Evidência / finding |
|---|---|---|
| 1 Status, autoridade, consumidores, leitura, IDs, DEP | Atendido | Cabeçalho, §0.1–0.5, §22. |
| 2 Arquitetura da experiência | Atendido | PR-01–12; §1.2 (seis pontos de coordenação visível); §1.3 loop. |
| 3 Inventário de superfícies e rejeitadas | Atendido com ressalva | SURF-01–13 com necessidade; FLOW-01–16; SURF-X-01–14 inclui todos os exemplos exigidos. Marco sem lugar: UXS-UX-07. |
| 4 Navegação | Parcial | NAV-01–12 consistentes com PA/C035. NAV-07: UXS-UX-02; NAV-02 sem gatilho de saída: UXS-UX-03. |
| 5 Objeto/ação/estado | Parcial | OBJ-01–22, ST- famílias mapeadas a PDM §5/AEOS §13. Gatilhos: UXS-UX-03; sessão sem sobreposição de proposta: UXS-UX-04. |
| 6 Onboarding / Athlete Model | Atendido | ONB-01–16 e §6.2; prioridade sem runner-first (ONB-07, ALT-UX-07); 18+ em toda identidade. Finalidade de sensores: UXS-UX-08. |
| 7 Hoje e casos | Parcial | HOJ-C01–C22 cobrem a lista exigida. Faltam entrada do contexto do dia (UXS-UX-01), retorno após NO_DATA (UXS-UX-05), início com proposta pendente (UXS-UX-04). |
| 8 Running | Parcial | RUN-01–12 e WEA-L. Histórico específico: UXS-UX-07; medição no app: UXS-UX-08. |
| 9 Strength | Parcial | STR-01–12 (construtos distintos, registro sem confirmação por série, substituição aprovada, UNCLASSIFIED). Histórico/realizado anterior: UXS-UX-07. |
| 10 Adaptation UX | Atendido com ressalvas | Matriz, AM-01–12, MAN-0–4, CONF-01–15, §10.5. UXS-UX-04, UXS-UX-06. |
| 11 Explicabilidade | Atendido | EXP-01–08, FAC-01–17; trace oficial; template; PT-BR/EN. |
| 12 Confiança | Atendido | CNF-01–11; flags simultâneas; sem score; opcional ausente não força ASK/HOLD. |
| 13 Agência | Atendido | AG-01–12 e tom. NON_BLOCKING UXS-UX-11. |
| 14 Wearables | Atendido com ressalva | WEA-01–09, WEA-L completo, finalidades locais sem prometer OAuth. “Aguardando”: UXS-UX-03. |
| 15 Nutrition | Atendido | NUT-01–11; classes por função; G05 provisório. NON_BLOCKING UXS-UX-16b. |
| 16 Crew Lite | Atendido | CRW-01–20, SHR-01–06; PB-F-02 em CRW-17–20; “Relay” excluído. NON_BLOCKING UXS-UX-09/15. |
| 17 Agente | Atendido | AGT-00–11, condicional a FD-01, paridade direta. NON_BLOCKING UXS-UX-14. |
| 18 Falhas/degradação | Atendido | DEG-01–35 incluem offline, LLM/motor indisponível, sem candidato, HOLD, consentimento, idade/convite/capacidade, share. NON_BLOCKING UXS-UX-12. |
| 19 Continuidade | Parcial | CTN-01–08. UXS-UX-05, UXS-UX-06. |
| 20 Notificações | Atendido | NOT-01–08, padrões e níveis de tela bloqueada; privacidade é gate Security. “Iminente” em UXS-UX-03. |
| 21 Jornadas | Parcial | J-01–J-20 mapeadas a CF S01–S18 e AESL. Falta jornada de retorno após NO_DATA (UXS-UX-05). |
| 22 Provisórios, handoff, rastreabilidade, self-eval | Atendido com ressalva | DEP-01–12, §24, §25, §26 identificado como self sem PASS. Enquadramento: UXS-UX-08, UXS-UX-10. |

A lista verbatim dos “16 estados” e das 15 dimensões do Founder não está registrada no repositório; usei o brief e o MISSION_RECORD. DEG-01–16 correspondem aos estados de falha usuais citados pelo pedido, e os acréscimos exigidos pelo item 18 estão presentes.

### 5.2 Superfícies, fluxos e rejeições

- **Necessidade:** cada SURF tem objeto canônico ou pergunta recorrente própria; SURF-08/09 são facetas, não destinos; SURF-11/12/13 são seções de Você conforme PA §2/§3. Nenhuma superfície por entidade do PDM.
- **Redundância:** nenhuma superfície redundante. FLOW-04 (compor a edição) e FLOW-02 (prévia/confirmação) são etapas distintas; FLOW-10 e FLOW-12 têm audiências distintas. Única duplicação: unidades (UXS-UX-16a).
- **Órfãs:** nenhuma; todas têm entradas e saídas. FLOW-16 é condicional a FD-01, sem ser requisito de caminho.
- **Hubs disfarçados:** SURF-06 é detalhe por decisão, não caixa de entrada; HOJ-S3 é seleção com teste de relevância e ordenação, sem ownership; SURF-X-02/03/10/11 rejeitam explicitamente central de HOLD, hub de relógio, central de decisões e visualizador de trace.
- **AR-01:** cumprido (SURF-01 “Possui: nenhum objeto”; HOJ-R6). Inconsistência: SURF-01 seleciona “marco próprio”, que nenhum espaço de §7.2 admite (UXS-UX-07).
- **Rejeitadas SURF-X-01–14:** completas e justificadas por cláusula; incluem Nutrition, HOLD, relógio, agente, recovery, feed, descoberta, ranking, hubs por esporte, central de avisos, trace, calendário paralelo, galeria e “Relay”.

### 5.3 Hoje: seis perguntas por caso

| Casos | As seis respostas derivam do especificado? | Observação |
|---|---|---|
| C01–C05 (Running, Strength, ambos, recuperação, descanso) | Sim | S2 + S4 + S6; C03 sem ordem inventada. Falta, em todos, a entrada do contexto do dia antes de iniciar (UXS-UX-01). |
| C06 alteração aplicada; C07 baixa confiança; C08 concluída | Sim | Marca HOJ-R5; limitação junto da ação (HOJ-R3). |
| C09 parcial/em aberto; C10 aguardando sync | Parcial | Gatilhos e rótulos indefinidos (UXS-UX-03). |
| C11 atraso; C12 conflito; C13 HOLD | Sim | C13: S2 sem prescrição no escopo retido é derivável de AM-11 e AESL S07; “iminente” indefinido (UXS-UX-03). |
| C14 interrupção; C15 retorno; C16 M3; C17 sem Crew; C18 primeiro dia | Sim | Só interrupção declarada; NO_DATA ausente (UXS-UX-05). |
| C19 execução; C20 offline | Sim | Abandono da execução sem gatilho (UXS-UX-03). |
| C21 sem plano; C22 proposta pendente | Parcial | C21 vira cadência a cada horizonte (UXS-UX-06); C22 não cobre iniciar com proposta pendente (UXS-UX-04). |
| Casos ausentes | — | Retorno após NO_DATA (UXS-UX-05); início com proposta pendente (UXS-UX-04); conta sem modo ativo (UXS-UX-16f). |

Estruturalmente, S2 sempre responde “o que faço hoje” e S1 trata P0. A rapidez real não é verificável sem teste de uso (H008). O número de itens em S5 não tem limite enquanto “recente” não for definido.

### 5.4 Adaptação

- **Matriz por classe:** fiel e conservadora. Nenhuma classe que altere plano/contexto ou o restante da execução é silenciosa; KEEP silencioso (MAN-0) ou mencionado no “por quê” (MAN-1); REPLAN como ato único (AEOS §8; AESL S47); ASK como ato de fato; HOLD imediato sem confirmação (AEC §7.1, AEOS §14); RECONCILE sem associação inventada. Coerente com DR-63, AEC §3.4–3.6 e `confirmation_scope`.
- **MAN-0–4:** separa materialidade de apresentação (Product/UX) da fisiológica (G02/B0) sem criar limiar; JEV sempre MAN-0 (AEOS §12.3).
- **Anti-teatro (MAN-R1–R5):** alinhado a AESL S32/S43 e Q04.
- **CONF-01–15:** prévia com `horizon_impact`/`intent_effects`; vínculo à versão (AEOS §13/§13.1); um ato por proposta; export separado; composto inteiro; alternativas só VALID; durante execução só o restante; falha de guarda; sem explicação fiel não há proposta. Fiel.
- **Recusa e ignorar:** CONF-09/11 e J-09 fiéis a AEOS §13 (`DECLINED`) e §14. Lacuna no ignorar-e-iniciar: UXS-UX-04.
- **Estabilidade (§10.5):** fiel a AEOS §14; safety vence estabilidade (CONF-10).
- **Continuação de horizonte:** UXS-UX-06.

### 5.5 Fluxos mortos, estados sem saída, ciclos e continuidade semanal

- **Fluxos mortos:** nenhum fluxo sem conclusão ou cancelamento. NAV-07 pode descartar registro (UXS-UX-02).
- **Estados sem saída:** todas as famílias de §5.2 têm saída. Execução abandonada não tem gatilho de saída automática (UXS-UX-03). HOLD clínico depende de G04 com funções não afetadas preservadas, limitação honesta já reconhecida pelo autor; a apresentação de `REVIEW_PENDING` para owner externo precisa de cuidado (UXS-UX-13).
- **Ciclos:** recusa → só volta com fato novo; ASK recusado → escopo indeterminado com caminho posterior por SURF-11/FLOW-05; undo → nova avaliação. Sem ciclos abertos.
- **Continuidade semanal:** CTN-01–08 fecham a cadeia do loop; lacunas em UXS-UX-05 e UXS-UX-06.

### 5.6 Dimensões do Founder

| Dimensão | Resultado neste gate | Evidência |
|---|---|---|
| 1 Coerência Product/UX | Atendida com desvios | Consumidor fiel de PA/EM/CF; desvio não justificado da entrada do PA §3 (UXS-UX-01); INT-04 (UXS-UX-09). |
| 2 Fidelidade AEC + AEOS (nível UX) | Atendida | §10–§12 e §14 fiéis; texto de DEG-11 (UXS-UX-12); transição de início com proposta não derivada (UXS-UX-04). |
| 3 Profundidade Running | Parcial | Estrutura, alvos, término/avanço, relógio e WEA-L fortes; histórico específico e medição no app abertos (UXS-UX-07, UXS-UX-08). |
| 4 Profundidade Strength | Parcial | Registro e construtos fortes; histórico/realizado anterior ausente (UXS-UX-07); ordem de exercícios (UXS-UX-16c). |
| 5 Manifestação do motor | Atendida | MAN-0–4, §1.2, J-02/J-03; sem selo de IA. |
| 6 Agência | Atendida com lacunas | AG-01–12; UXS-UX-04, UXS-UX-11. |
| 7 Explicabilidade (UX) | Atendida | EXP-01–08, FAC; fidelidade de LLM/JEV é gate AI. |
| 8 Baixa confiança | Atendida | CNF-01–11, HOJ-C07, CNF-10. |
| 9 Estados de wearable | Atendida com ressalva | WEA-L e WEA-01–09; “aguardando” sem evidência definida (UXS-UX-03); derivabilidade é gate Engineering. |
| 10 | Não atribuída a este judge pelo brief | Observação estrutural de privacidade em UXS-UX-08; gate Security próprio. |
| 11 Contenção de Crew | Atendida | CRW-16/17–20; NON_BLOCKING UXS-UX-09/15. |
| 12 Contenção de Nutrition | Atendida | NUT-01–11; UXS-UX-16b. |
| 13 Navegação/inchaço | Atendida | 5 destinos + 8 detalhes + 16 fluxos com necessidade; nenhum hub. |
| 14 Consistência entre fluxos | Falha | UXS-UX-02, UXS-UX-04; NON_BLOCKING UXS-UX-11. |
| 15 Implementabilidade para o Designer | Falha nesta revisão | UXS-UX-01, 03, 05, 06, 07, 08 exigiriam regra de produto inventada em áreas declaradas fixas. |

### 5.7 UPSTREAM-ISSUE-01, FD-01 e FD-02

- **UPSTREAM-ISSUE-01:** a identificação é correta e a estrutura de RUN-06 independe da capacidade, mas o enquadramento é incompleto: omite a finalidade de dado e não formula a pergunta de escopo que antecede a verificação técnica (UXS-UX-08).
- **FD-01 (agente na V1):** corretamente reservado ao Founder (MISSION_RECORD §1; RS §3 “não é requisito de release”). A especificação é completa sem o agente. Recomendação “decidir depois” é legítima como A1. Corrigir colisão de letras (UXS-UX-10).
- **FD-02 (naming/voz):** corretamente reservado (MISSION_RECORD §1; DR-26/DR-01). Usar nomes funcionais como placeholders marcados em Figma estrutural é adequado.
- **Algo decidido que pertencia ao Founder?** Não identificado: padrões de aviso, ordem do Hoje, opção “Os dois igualmente” e plano inicial como proposta estão dentro de D009/D010 e do design space de PA/EM. **Algo escalado que não precisava?** Não. A pergunta de escopo da medição pelo telefone é o único ponto que deveria ser explicitado como possível decisão Founder (UXS-UX-08).

## 6. Interpretações INT-01–INT-10

| INT | Parecer | Razão (lado UX) |
|---|---|---|
| INT-01 plano inicial como proposta adotada | **Confirmada** | DR-63, AEC §3.4, AEOS §13 (PRESENTED → ACCEPTED → APPLIED); sem adoção, registro/descanso/Crew funcionam. |
| INT-02 continuação de horizonte como REPLAN confirmado | **Condicionada** | Confirmação correta; a apresentação deve ocorrer antes do fim do horizonte para não embutir lacuna recorrente (UXS-UX-06). |
| INT-03 HOLD imediato sem confirmação | **Confirmada** | AEC §7.1; AEOS §9, §14 e HC10 (safety vence estabilidade). |
| INT-04 adesão privada; estado do compromisso segue o tempo | **Condicionada** | Semântica protetora correta (AR-10, PB-F-02); o upstream PDM §5 não é silente — registrar como esclarecimento ao owner do PDM (UXS-UX-09). Privacidade é gate Security. |
| INT-05 novo membro percebido pela lista, sem push | **Confirmada** | Exposição mínima coerente com SEC-J-01 e PDM §5; Security pode endurecer. |
| INT-06 check-in sem horário/dia | **Confirmada** | PDM I4, AR-12, L017. O momento de chegada do aviso ainda revela horário aproximado — matéria para Security. |
| INT-07 “silencioso” só quando o resultado oficial não muda | **Confirmada** | §0.4, DR-63, MAN-0. |
| INT-08 tela bloqueada L0 padrão, L1 opt-in, visão de execução opt-in | **Confirmada (UX)** | Leitura conservadora de PB-F-03; gate Security decide. |
| INT-09 edição que falha hard constraint não vira prescrição | **Confirmada** | AEOS HC07; AEC §7.1; AG-04/CONF-08 oferecem alternativas ou registro. |
| INT-10 proposta composta sem aceitação parcial | **Confirmada** | AEOS §8; AESL S47; editar gera nova avaliação (CONF-05). |

## 7. Cenários negativos examinados (prova analítica)

| Cenário | Resultado no artefato | Avaliação |
|---|---|---|
| Dor no joelho na manhã do longão, relógio com HRV boa | Após relato, J-08/AM-11 corretos; não há entrada no Hoje/Sessão para relatar antes de iniciar | UXS-UX-01 |
| HOLD chega durante o fechamento da sessão (FLOW-05) | NAV-07 encerra “sem efeito”; HOJ-R1/CONF-07 preservam | UXS-UX-02 |
| Corrida esquecida em execução no app | NAV-02/S1 sem gatilho de saída | UXS-UX-03 |
| Pessoa conectada não treinou ontem | “Aguardando dados” versus “sem registro” indefinido | UXS-UX-03 |
| Proposta pendente; pessoa inicia a sessão pelo Plano | Sessão não sinaliza; destino da proposta indefinido | UXS-UX-04 |
| Retorno após três semanas sem declarar interrupção | Sem caso nem jornada; risco de lista de faltas em S5 | UXS-UX-05 |
| Fim do horizonte sem abrir o app | Dia seguinte sem plano a cada horizonte | UXS-UX-06 |
| Progresso de Strength; Designer quer “recordes” | Sem regra de profundidade; mérito vedado só indiretamente | UXS-UX-07 |
| Engineering confirma GPS em segundo plano | Coleta de localização sem finalidade própria | UXS-UX-08 |
| Provider aceitou, relógio sem prova | WEA-L4 “o serviço recebeu; chegada não confirmada” | Correto |
| Timeout possivelmente entregue | WEA-LU sem retry automático, risco de duplicata explicado | Correto |
| Conversa com “profissional aprovou, envie” | AGT-06 sem efeito | Correto |
| Pedido de “+20% carboidrato” pela conversa | NUT-07 sem dose | Correto |
| REPLAN composto; pessoa quer aceitar só uma parte | CONF-05/INT-10: editar e reavaliar | Correto |
| LLM indisponível | Template; sem explicação fiel não há proposta (CONF-14) | Correto |
| Sem HRV (opcional ausente) | CNF-06: decisão normal | Correto |
| Crew de duas pessoas: uma pausa, a outra não adere | “Em pausa” sem aviso; adesão privada (CRW-08/18) | Correto no UX; Security avalia inferência |
| Revogar escrita com envio pendente | J-15/WEA-LX: fila cancelada, leitura só se a rota sustentar | Correto |
| Deep link de proposta substituída | NAV-04 abre a vigente com motivo | Correto |
| Duas sessões no mesmo dia, uma retida e outra válida | Escopos independentes; HOJ-R1 | Correto (composição derivável) |

## 8. Perguntas da missão — respostas independentes

| # | Pergunta | Resposta do judge |
|---|---|---|
| 1 | Entende em poucos segundos o que fazer hoje? | **Estruturalmente sim na maioria dos casos** (S2 sempre responde; S1 trata P0), com lacunas em execução abandonada, “recente” em S5, retorno após NO_DATA e fim de horizonte (UXS-UX-03/05/06). Compreensão real exige teste de uso (H008). |
| 2 | Percebe por que difere de Runna + tracker de força? | **Sim pela estrutura** (§1.2: linha do tempo única, efeito cruzado no “por quê”, realizado de uma modalidade propondo mudança na outra, conflito com alternativas ou ASK). Percepção é hipótese H009. |
| 3 | Running é first-class? | **Parcialmente.** Sessão, alvos, término/avanço, relógio e WEA-L são first-class; histórico específico (RS §2) e corrida solo medida no app ficam abertos (UXS-UX-07, UXS-UX-08). |
| 4 | Strength é first-class? | **Parcialmente.** Registro, construtos, correção, substituição e app-first são fortes; histórico por exercício e realizado anterior não estão especificados (UXS-UX-07). |
| 5 | O motor produz consequência visível? | **Sim.** MAN-3/MAN-4 no objeto e no Hoje; efeito cruzado em J-02/J-03; KEEP explicado sob demanda. |
| 6 | Adaptação útil ou gimmick de IA? | **Estruturalmente útil:** só aparece o que mudou a decisão oficial; MAN-R1–R5; fatores do trace B0/gate. Utilidade real depende de G02/G11. |
| 7 | Entende mudanças importantes? | **Sim no fluxo de proposta** (CONF-01, EXP-01); a sessão não mostra proposta pendente que a afeta (UXS-UX-04). |
| 8 | Mantém controle? | **Sim**, nada muda sem ato (CONF-03), com recusa, desfazer, edição e alternativas; pendências em UXS-UX-02 (descarte de registro) e UXS-UX-11. |
| 9 | Baixa confiança gera comportamento conservador? | **Sim**, no sentido do contrato (CNF-10: abster, manter vigente válido, perguntar o mínimo ou reter o dependente; nunca dose “conservadora”). |
| 10 | Status de wearable nunca promete mais do que sabemos? | **Sim na escada WEA-L**; exceção: “aguardando dados” sem evidência pode sugerir atividade inexistente (UXS-UX-03). |
| 11 | Nutrition é contextual? | **Sim** (NUT-01–11; sem ferramentas excluídas; G05 provisório). |
| 12 | Crew é Lite? | **Sim** (CRW-01–20; PB-F-02 especificado; “Relay” excluído). Ajustes NON_BLOCKING UXS-UX-09/15. |
| 13 | Agente reduz interface sem virar a interface? | **Sim estruturalmente** (canal sem destino, paridade AGT-08, confirmação no caminho canônico); histórico de conversa a definir (UXS-UX-14); inclusão é FD-01. |
| 14 | Há superfícies redundantes? | **Não material.** Só unidades em dois lugares (UXS-UX-16a). |
| 15 | Há fluxo morto? | **Não**; mas NAV-07 pode descartar fluxos de registro/contestação (UXS-UX-02). |
| 16 | Há estado sem saída? | **Não há estado sem nenhuma saída**; a execução abandonada não tem transição definida (UXS-UX-03) e o HOLD clínico depende de G04, como reconhecido. |
| 17 | Há continuidade ao longo da semana? | **Parcial:** cadeia do loop e linha do tempo sólidas; lacunas em retorno após NO_DATA e continuação do horizonte (UXS-UX-05/06). |
| 18 | O Designer começa Figma sem reinterpretar contratos? | **Ainda não nesta revisão.** Oito pontos em áreas declaradas fixas exigiriam regra de produto inventada. Após correção e revalidação de delta, a resposta pode ser sim, sujeita à aprovação do Founder. |

## 9. `DETAILED_UX_READY_FOR_FIGMA`

**Não sustentado estruturalmente em UXS-1.0-r1.** Condições para revisitar: nova revisão (UXS-1.0-r2) do mesmo autor com mapa finding → mudança para UXS-UX-01–08 (e tratamento declarado — CORRECT/ACCEPT/DEFER/REJECT — de UXS-UX-09–16), checks objetivos atualizados pelo Chief e revalidação de delta por este judge; gates Security, AI Systems e Engineering vigentes; aprovação separada do Founder. Mesmo com PASS futuro deste gate, VISUAL_READY vale só para a revisão avaliada e não autoriza Figma sem a decisão do Founder.

## 10. Limites deste parecer

Revisão documental e analítica de estrutura. Não é teste de uso, avaliação visual, prova de runtime, parecer jurídico, clínico, nutricional ou de privacidade. Não avalia os gates Security (PB-F-02/03, consentimento, audiência), AI Systems (O015, fidelidade de explicação, JEV/LLM) nem Engineering (derivabilidade técnica), e não emite gate desses domínios. Nenhuma pesquisa nova, nenhum legado consultado. A redação verbatim do pedido do Founder (15 dimensões, 16 estados, 18 perguntas) não está no repositório; usei o brief deste judge, MISSION_RECORD §5 e §25.3 do artefato. O check 285/285 do Chief foi inspecionado, não reexecutado, e não prova semântica.

## 11. Handoff

| Campo | Valor |
|---|---|
| Emissor → destinatário | J-UX (product-ux-architect, independent) → Chief (sessão principal) |
| Task / contrato / revisão | UXSPEC-20261018 / UXSPEC-20261018-r1 / UXS-1.0-r1, SHA-256 `08ac2f964791f1b9903ca435174a4d660ad74d2abb9a55cd2e9e2df42afc5d8c` |
| Estado | **FAIL (REQUEST_CHANGES) / ARCHITECTURE_REJECTED** para r1; 8 MATERIAL, 8 NON_BLOCKING, 0 BLOCKING |
| Responsável pela correção | Mesmo worker autor (Product/UX Architect da missão), conforme MISSION_RECORD §3 |
| Condição de reavaliação | Revisão nova com hash, mapa finding → mudança e checks atualizados; revalidação de delta por esta instância. Limite do loop: um finding MATERIAL que sobreviva a duas correções é reencaminhado por causa raiz. |
| Dependentes invalidados | Nenhum: upstream intacto; nenhum gate anterior desta missão existia |
| Próximo passo | Chief consolida com os demais pareceres e devolve findings ao autor. Este judge não corrige o artefato. |

**STOP deste judge após gravação e conferência deste relatório.**
