# UX Specification — Engineering review r1

**FAIL (REQUEST_CHANGES) — gate documental ENGINEERING_CONTRACT_REVIEWED não emitido para UXS-1.0-r1.** Encontrei dois findings MATERIAL. Ambos são omissões localizadas e corrigíveis no próprio artefato. Nenhum deles é BLOCKING: nenhum estado visível contradiz frontalmente AEC/AEOS, nenhuma capacidade é prometida sem evidência e não há lacuna que exija decisão do Founder. Também registrei seis findings NON_BLOCKING e confirmei as interpretações INT-01/02/03/09/10, três delas com condição.

Este parecer avalia apenas se a experiência pode ser derivada tecnicamente dos contratos aprovados. Ele **não** é ENGINEERING_ARCHITECTURE_READY nem prova executável, de device/provider, de implementação ou de release, e não substitui os pareceres Product/UX, Security ou AI.

## 1. Contrato, independência e método

| Campo | Registro |
|---|---|
| Task / contrato | UXSPEC-20261018 / UXSPEC-20261018-r1 (MISSION-UXSPEC-1.0, unidade U4d) |
| Artefato | `product/UX_SPECIFICATION.md` · **UXS-1.0-r1** |
| SHA-256 recalculado (PowerShell `Get-FileHash`) | Início da sessão: `08ac2f964791f1b9903ca435174a4d660ad74d2abb9a55cd2e9e2df42afc5d8c`. Retomada após interrupção (HTTP 429, sem relatório parcial), 2026-10-19T10:33:39Z: idêntico. Valor final na §8. A cópia congelada `review-inputs-r1/UX_SPECIFICATION.md` tem o mesmo hash. MANIFEST: `PRE_REVIEW_VERIFICATION.json` `5a8e9791…7fe6` (285 passed / 0 failed / 2 warnings, ambos "percent-number" em NUT-07/J-14 dentro de exemplos proibidos e fora deste domínio). |
| Avaliador / modo | Engineering / Systems Architect **1.3.0**, instância fresca, **independent**. Não sou autor nem coautor: o autor é o worker product-ux-architect e o Chief coordena. Minha única escrita nesta rodada é este relatório. |
| Rubrica / protocolos | ENGINEERING 1.1.0; CORE 1.4.0; EXECUTION_PROPORTIONALITY (política vigente); verify-before-completion aplicado ao próprio parecer. |
| Routing | L2 · material_other · claude-opus-5-5 / high, conforme o envelope do despacho. O modelo e o esforço efetivamente servidos não são expostos pelo runtime, então não alego nada além disso. |
| Fontes lidas | CLAUDE.md, CURRENT_MISSION.md e MISSION_RECORD §§1, 3–5. O artefato **integral** (linhas 1–980). PTC-3.0.0: C012, C034, C040, L023, O014, O016. AEC-1.1: §§2–5 integrais e §7. PDM-1.1: §§3–6. PA-1.1: §§3, 5 e 8. CF-1.1: F03–F06 e S01–S18. AEOS-1.0-r2: §§1–14 e §16. AESL-1.0-r2: S15–S47 e Q01–Q09. RS-1.1: §§2–4. PDR §5: G06 e G09. AEOS `ENGINEERING_REVIEW_r2.md`. WEA-1.0: somente a linha da matriz HealthKit/WorkoutKit, para confirmar que a negação de leitura é opaca ("read-denial opaco"). |
| Método | Leitura comparativa por cláusula. Cada estado ou aviso visível foi mapeado à evidência que AEC §5.3/§5.4, PDM §5 e AEOS §13/§13.1 permitem obter. Cenários negativos foram percorridos analiticamente (§6). Nenhum código, harness, provider, pesquisa ou escolha de stack. Python não está disponível neste ambiente, então os hashes vieram só do PowerShell. |
| Limites | Este parecer não julga UX estrutural, privacidade nem AI. Onde um ponto toca outro domínio, eu o registro como nota, sem emitir veredito alheio. Não editei o artefato nem outros arquivos, e não reverti alterações de terceiros. |

## 2. Veredito por tema

| Tema | Resultado | Evidência principal |
|---|---|---|
| Escada de export WEA-L: fila, transporte, sistema e device | **PASS** | WEA-L2/L3/L4/L5 (l. 585–588) separam intenção, transporte aceito, recibo do sistema e prova de device, nos termos de AEC §5.3 (l. 127–130) e PDM §5. A coluna "nunca dizer" proíbe "no relógio" sem prova de device. HOJ-S4 (l. 311) e RUN-07 (l. 355) seguem a mesma regra. Atende C040 e PR-08. |
| Executado, observado e associado como fatos separados | **PASS com nota** (UXS-ENG-04a) | WEA-L6 não é exibido por si; a sessão só vira "realizada" quando a atividade importada é associada (l. 589). L7 só associa automaticamente pela referência do export (l. 590), conforme AEC §4 e AEOS §3. RUN-07, porém, afirma que "a revisão realmente executada" sempre será conhecida, e isso só é derivável quando a referência retorna. |
| Resultado desconhecido e ausência de retry cego | **PASS com condição** (UXS-ENG-03) | WEA-LU e DEG-06 (l. 593, 703) seguem AEC §5.4, linha "Publicar". Faltam as transições de saída de LU: recibo tardio, reconciliação quando a rota permite leitura e possível cópia duplicada após uma nova tentativa deliberada (Q06). |
| Replace via delete+create com falha parcial | **PASS** | WEA-LP e DEG-28 (l. 596, 725) registram o estado de cada etapa, a possível cópia residual ou ausência, a ausência de substitutos repetidos e a proibição de apagar template de outro autor. Atendem AEC §5.4 ("Atualizar / substituir") e AESL S19. |
| Revogação e desconexão cessando filas | **FINDING MATERIAL** (UXS-ENG-01) | WEA-07, WEA-LX, DEG-14 e J-15 cessam filas e retries corretamente. Porém omitem a cópia já entregue ou despachada antes da revogação, exigida por AEOS §13.1 (l. 274, 276) e AEC §5.3 (l. 134). |
| Outage e lag como estado de integração | **PASS** | WEA-04, DEG-03 e HOJ-C10 (l. 570, 700, 331) tratam o caso sem penalidade e sem HOLD médico, conforme AEC §5.3 (l. 139) e AESL S08. |
| HealthKit vazio de forma opaca | **PASS com nota** (UXS-ENG-04c) | WEA-05 (l. 571) segue AEC §5.1 (l. 104) e a matriz WEA ("read-denial opaco"). DEG-14 e NOT-C, no entanto, falam de "permissão revogada (sistema…)" sem restringir isso às rotas que de fato expõem a revogação. |
| Duplicata, atraso, conflito e supressão | **PASS com nota** (UXS-ENG-05b/c) | WEA-08, ST-OBS, DEG-04/07/13/29/33, J-05 e J-19 seguem AEC §4, AEOS §3 e AESL S16/S22/S23. Duas notas: DEG-11 fala em "risco de carga dupla até resolver", o que contradiz a regra de não somar; e a recusa "são diferentes" no FLOW-08 não fica registrada contra nova proposta. |
| Capacidade documentada / aprovada / comprovada / não suportada / não verificada | **PASS com nota** (UXS-ENG-04d) | WEA-03 (l. 569) mantém os níveis distintos, trata "não verificada" como indisponível e afirma o relógio por export e recibo, nunca pela rota. Falta a dimensão device/OS/firmware de AEC §5.1 (l. 100). |
| Preflight: relatório de perdas, recusa e app | **PASS** | WEA-L0/L1, FLOW-06, STR-09 e DEG-15 seguem AEC §5.2 (l. 121) e AESL S15/S20: confirmar não torna a perda equivalente, e a alternativa só nasce como nova revisão do motor. |
| Offline (AEC §5.3 último parágrafo, PA AR-09) | **FINDING MATERIAL** (UXS-ENG-02) | NAV-11, HOJ-C20, DEG-17 e J-18 cobrem leitura, execução, registro e reconexão. Não definem o que acontece com atos locais que dependem de avaliação ou da guarda de commit: confirmar, editar, responder ASK, desfazer, substituir durante a execução e, principalmente, relatar limitação/restrição offline. AEC exige "sem ignorar restrição/hold novo". |
| Conflito de versão e proposta obsoleta (AEOS §13, §13.1) | **PASS** (com a dependência offline de UXS-ENG-02) | ST-DEC (l. 219) e CONF-02/12 (l. 448, 458) vinculam o ato a hash, alcance, plano-base, contexto, policy, permissões e validade. Uma guarda divergente produz `STALE` com efeito zero e o fato que mudou. NAV-04/07, DEG-12, J-09 e AGT-09 são coerentes com S15, S45/S46, Q01 e Q09. |
| Idempotência visível | **PASS com condição** (UXS-ENG-03, UXS-ENG-02) | CONF-03, SHR-05, NAV-03 e J-18 proíbem efeito duplicado. Não está explícito que repetir o mesmo ato (duplo toque ou retry após timeout de confirmação) resolve para o resultado da intenção original, e não para uma falha. Também não está explícito se "enviar" continua oferecido enquanto existe intenção L2–L5 para a mesma revisão. |
| Triggers de notificação | **PASS com nota** | NOT-P0/A/B/D/E/F/G derivam de estados oficiais (MAN-3/4, HoldRecord, ASK, itens de Crew). NOT-02 exclui KEEP, recomputação e microajuste. A nota sobre NOT-C "permissão revogada" está em UXS-ENG-04c, e a notificação de continuação de horizonte regenerada está na condição de INT-02 (UXS-ENG-07). |
| Múltiplos dispositivos e sessões | **PASS limitado** | Tratados apenas por DEG-12 ("outro aparelho") e NAV-06. Uma execução iniciada offline num aparelho fica invisível nos demais até sincronizar. A reconciliação posterior está coberta por AEC §4 e §5.3 (revisão executada preservada, futuro readaptado). AEC e AESL não exigem mais que isso. Registro o ponto como item para o handoff técnico futuro, sem finding. |
| Máquinas de estado (dimensão 14) | **PASS com nota** (UXS-ENG-05a) | ST-DEC = AEOS §13. ST-HOLD = `HoldRecord`. ST-CTN = `continuity_state`. ST-OBS e ST-CONN = PDM §5. ST-SES estende o PDM sem conflito: "em aberto" e "sem registro" são estados desconhecidos e honestos. CONF-01–15 são coerentes entre si. A exceção é STR-11, que introduz a transição "conta como parcial" sem gatilho. |
| Execução em curso | **PASS** | SURF-08/09, CONF-07, HOJ-C19, DEG-30 e J-10 fixam a revisão executada (AEOS §5, l. 81; AESL S29). O restante só muda com proposta e aceite atuais, e HOLD novo retém apenas o que depende dele. |
| Estabilidade / anti-flip-flop (AEOS §14) | **PASS** | MAN-R1–R5 (l. 441), §10.5, CONF-09/11, `DECLINED` sem nova apresentação e CONF-10 (safety vence estabilidade sem cooldown) correspondem a AEOS §14 (l. 286–291) e AESL S32/S33/Q04/Q07. |
| UPSTREAM-ISSUE-01 | **Lacuna real; owner e trigger precisam de ajuste** (UXS-ENG-06) | Ver §4. |
| INT-01 / 02 / 03 / 09 / 10 | **03 e 10 confirmadas. 01, 02 e 09 confirmadas com condição** (UXS-ENG-07/08) | Ver §5. |

## 3. Findings

### UXS-ENG-01 · MATERIAL · Revogação ou desconexão omitem a cópia já despachada ou entregue

- **Local:** WEA-07 (l. 573), WEA-LX (l. 599), DEG-14 (l. 711), J-15 (l. 810), §24.1 (fixa WEA-L para o Designer). WEA-06 (l. 572, desconexão completa) está correto. O problema está na revogação de uma finalidade e na tabela WEA-L.
- **Critério upstream:** AEOS §13.1, l. 276: "Se comando remoto já foi autorizado/despachado antes da revogação e pode ter sido entregue, conservar resultado real/UNKNOWN e possível cópia residual…". l. 274 diz o mesmo para "commit válido antes, autoridade muda depois". AEC §5.3, l. 134: "dados/cópias já entregues têm limites explícitos". PDM I6. AESL S21, S46 e Q09.
- **Cenário e impacto:** com WEA-L3 (transporte aceito), LU (timeout) ou L5 (prova de device), a pessoa revoga a escrita. WEA-LX mostra apenas "Fila cancelada; nada reativa por retry" e não tem item em "nunca dizer". O Designer recebe essa linha como fixa e tende a mostrar "envio cancelado", enquanto o workout pode estar ou chegar no relógio. Com revogação não há como cancelar remotamente, porque a permissão de escrita já não existe. O estado alega mais do que se sabe, o que viola PR-08 e C040. A tabela WEA-L também não diz como os estados se combinam, então o mesmo risco aparece em outras sobreposições (LR, LH, LX) com um nível de prova.
- **Resolução exigida:**
  1. Em WEA-07, WEA-LX, DEG-14 e J-15, distinguir três casos: o que estava na fila e foi cancelado; o que foi despachado antes da revogação (resultado real ou desconhecido, "pode ter chegado"); e a cópia entregue, que permanece e não pode ser cancelada sem permissão de escrita. Acrescentar "envio cancelado" / "removido do relógio" sem prova na coluna "nunca dizer" de LX.
  2. Declarar uma regra de composição: cada export tem **nível de prova** (L2–L5/LF/LU) × **atualidade da revisão** (vigente/LO/LR) × **sobreposições de controle** (LH/LX/LP/LD). Uma sobreposição nunca apaga o fato de possível cópia remota. A forma de apresentar essa combinação continua design space.
- **Owner:** Product/UX Architect (autor). Basta revalidação delta por Engineering.

### UXS-ENG-02 · MATERIAL · Semântica offline indefinida para atos que dependem de avaliação ou commit

- **Local:** NAV-11 (l. 181), HOJ-C20 (l. 341), DEG-17 (l. 714), J-18 (l. 813). Atos sem regra offline: FLOW-02/CONF-02 (confirmar), FLOW-04/CONF-08 (editar com prévia), ASK-03 (resposta dispara reavaliação), AG-06 (desfazer), STR-06/CONF-07 (substituir durante a execução) e relatos RUN-08/STR-05/ONB-11 (limitação → HC03). ST-DEC (l. 219) chama `ACCEPTED` de "confirmada — transitório".
- **Critério upstream:** AEC §5.3, l. 139: "Offline, execução/registro local continuam somente no limite preparado **ainda válido**, sem ignorar restrição/hold novo. Nova prescrição dependente de dado remoto indisponível não recebe precisão inventada." AEOS §13.1: um ponto lógico de commit por efeito, com guarda das revisões correntes de hold, permissão e policy; "Se o mecanismo futuro não puder provar essa guarda, não comprometer o efeito dependente". PA AR-09: "novo HOLD/restrição não é ignorado". AEOS §14: safety sem atraso. Nenhum cenário AESL cobre atos locais offline, portanto cabe a este consumidor fixar o comportamento.
- **Cenários e impacto:**
  - (a) A pessoa confirma uma proposta offline. A guarda não pode ser verificada. O estado "confirmada" tende a ser exibido como aplicado, e a pessoa pode executar offline a revisão proposta, que não foi comprometida. Na reconexão, a guarda pode falhar (plano revisto no servidor ou em outro aparelho, hold novo) e a execução fica sem revisão vigente.
  - (b) Edição offline: FLOW-04 exige prévia "pelos mesmos gates", que não existe sem avaliação. Também não está definido se a edição fica bloqueada ou guardada como intenção pendente, avaliada na reconexão contra o plano-base atual (p2).
  - (c) A pessoa relata dor ou limitação offline, durante ou depois de uma sessão. A spec só reconhece "retenção nova **recebida**" (DEG-17, J-18). Uma restrição declarada localmente é conhecida e nova, mas a próxima sessão preparada continua sendo apresentada como válida e guiável até a reconexão. Isso contradiz AEC §5.3 e AR-09, e tem relevância de safety.
  - (d) A confirmação online perde a resposta (timeout). O retry com a mesma intenção pode ser exibido como falha (CONF-12) em vez de mostrar o resultado original (AEC §5.4: "Retry reapresenta a mesma intenção").
- **Resolução exigida:** acrescentar uma regra única para atos que dependem de avaliação ou commit ainda não confirmado (offline ou sem resposta):
  1. O ato fica registrado como **intenção pendente**, visivelmente "não aplicada ainda". O vigente continua sendo a única revisão executável. Alternativa admissível: não oferecer o ato offline, com explicação.
  2. Na reconexão, a guarda decide entre `APPLIED` e `STALE` (CONF-12), sem herdar a confirmação para outro plano-base.
  3. A edição não mostra alcance inventado. Ou fica indisponível offline com explicação, ou é guardada como pedido que recebe prévia e confirmação após a reconexão.
  4. Uma resposta de ASK offline é um fato local pendente, sem efeito na decisão até a reavaliação.
  5. Limitação ou restrição declarada offline: o fato é guardado localmente na hora. Daí em diante, a orientação preparada que dependa dele não é apresentada como válida (no máximo "precisa de reavaliação — sem conexão"). Registro e funções não dependentes continuam. Nenhum limiar é inventado.
  6. Repetir o mesmo ato resolve para o resultado da intenção original.
  7. Mencionar a substituição de Strength offline durante a execução: só por alternativa já preparada e ainda válida; senão é tratada como "fazer diferente" (AG-05) e reconciliada depois.
- **Owner:** Product/UX Architect (autor). Engineering revalida. Nota para Security e AI: nenhuma.

### UXS-ENG-03 · NON_BLOCKING · Transições de saída de WEA-LU e disponibilidade de "enviar"

- **Local:** WEA-LU (l. 593), DEG-06, WEA-L1/L3/L4.
- **Critério:** AEC §5.3 ("Antes de reenviar, reconciliar o estado quando possível"); AEC §5.4 ("Publicar"); AESL Q06 ("callback tardio de nível sistema").
- **Impacto:** a spec não diz que LU sai para L4/L5 quando chega um recibo tardio, nem para LF diante de um erro conhecido posterior. Também não diz que, quando a rota permite leitura, o timeout é reconciliado antes de cair em LU, nem que uma nova tentativa deliberada pode deixar **duas cópias** da mesma revisão quando o primeiro envio também chegou. Por fim, não está fixado se "enviar" continua oferecido enquanto existe intenção L2–L5 para a mesma sessão, revisão e destino.
- **Resolução recomendada:** acrescentar essas transições; o estado "possível cópia duplicada" pode reaproveitar a linguagem de LP. Regra: "enviar" para a mesma revisão e destino só é oferecido a partir de LF ou LU, como nova intenção com o risco explicado.
- **Owner:** autor.

### UXS-ENG-04 · NON_BLOCKING · Qualificadores de derivabilidade em quatro afirmações visíveis

- (a) **RUN-07 (l. 355) e §14.2 (l. 601):** "o retorno registra a revisão realmente executada" só é derivável quando a referência do export retorna com a atividade (AEC §4, l. 86; AEC §5.2). Sem referência, a revisão executada é desconhecida ou apenas proposta.
- (b) **HOJ-C10 (l. 331):** "aguardando dados de ‹fonte›" afirma que existe uma atividade a caminho. Só deve aparecer com evidência positiva: export da sessão em L3 ou acima, estado de ingestão "aguardando/atrasada" da rota (WEA-04) ou declaração da pessoa de que executou no relógio. Sem essa evidência, a sessão fica "sem registro", com a opção "aguardar sync" (ST-SES).
- (c) **DEG-14 (l. 711), NOT-C (l. 766), ST-CONN:** "permissão revogada (sistema…)" só é detectável quando a rota expõe o estado de autorização ou um evento de desautorização. Em leituras opacas (WEA-05; matriz WEA HealthKit "read-denial opaco"), vale WEA-05, sem estado nem aviso de revogação.
- (d) **WEA-03 (l. 569):** a tupla de capacidade de AEC §5.1 inclui device/OS/firmware. Quando a rota não expõe o device da pessoa, o rótulo deve dizer "comprovada para a rota; seu relógio não verificado". Isso é coerente com a regra, já presente, de afirmar o relógio por export.
- **Owner:** autor. Correção textual de qualificadores, sem mudança estrutural.

### UXS-ENG-05 · NON_BLOCKING · Três inconsistências pontuais de máquina de estado

- (a) **STR-11 (l. 376):** "se não for fechada, conta como parcial" introduz uma transição sem gatilho e entra em tensão com ST-SES "em aberto" (l. 223). Recomendo: o estado visível permanece "em aberto"; para a avaliação, o motor consome o caso como parcial com restante desconhecido (AEOS §4 `observed_exposure`); nenhum timeout é inventado. Se houver gatilho, ele pertence à policy `[DEP-G03]`.
- (b) **DEG-11 (l. 708):** "Risco de carga dupla até resolver" contradiz AEC §4 ("sem soma duplicada do provável mesmo fato até resolução") e HC04. O texto correto é "decisão dependente limitada até resolver; nada é somado duas vezes".
- (c) **ST-OBS e FLOW-08 (l. 225, 138):** "são diferentes" deve ficar registrado como `UNASSOCIATED` confirmado pela pessoa, e o mesmo par não deve voltar a ser proposto sem fato novo (AEOS §14; coerente com ASK-06 e HOJ-S5 "cobrança repetida").
- **Owner:** autor.

### UXS-ENG-06 · NON_BLOCKING · UPSTREAM-ISSUE-01: owner e trigger a ajustar

A avaliação completa está na §4. Em resumo, a lacuna é real e não muda a estrutura, mas faltam Security como co-owner, a finalidade condicional de localização/movimento e um trigger preciso. Owner: Chief (registro) e autor (texto de §23.1 e ONB-05/WEA-02).

### UXS-ENG-07 · NON_BLOCKING · Condições de INT-01 e INT-02

Ver §5. Owner: autor; registrar como nota de consumidor para o owner do AEOS.

### UXS-ENG-08 · NON_BLOCKING · Condição de INT-09 (categorias de hard constraint em edição manual)

Ver §5. Owner: autor.

## 4. UPSTREAM-ISSUE-01 — avaliação

- **É uma lacuna real?** Sim, mas delimitada.
  - RS §2 promete Running com "execução direta/observação". RS §4 Solo exige o loop sem relógio, mas aceita registro manual, então o RS **não** exige GPS.
  - SURF-08/RUN-06 especificam execução guiada no app. As capacidades do aparelho que isso pressupõe não estão inventariadas em nenhum lugar: localização/GPS, sensores de movimento, execução em segundo plano com tela bloqueada, sinais de áudio e háptica fora do app, visão de execução na tela bloqueada. G06 e O016 cobrem providers e relógios. G09 é a realização de contratos já especificados, não um inventário de capacidades.
  - O impacto vai além da credibilidade de Running (L023, O014). O próprio fallback de RUN-06 ("etapas por tempo avançam pelo relógio do aparelho"; "transições perceptíveis sem olhar a tela") depende de execução em segundo plano. A duração pode ser derivada por timestamps sem segundo plano; o aviso de transição não. O mesmo vale para NAV-06 ("sair do app preserva o estado"), para o cronômetro de descanso de STR-03 e para a visão de execução de NOT-08.
- **Afeta a estrutura?** Não nas superfícies, fluxos ou estados: RUN-06 já se bifurca de forma honesta. Afeta, porém, o **modelo de finalidades**:
  - Medir distância ou rota pelo telefone é uma finalidade local nova (localização/movimento) e um dado pessoal sensível. Hoje ela não aparece em ONB-05 nem em WEA-02, cujas finalidades são apenas leitura de atividades, leitura de saúde e escrita de workouts. SHR-01 já exclui rota e localização do share.
  - Uma corrida medida no app é mais uma fonte de observação, que entra no dedupe quando há gravação simultânea no relógio. A regra genérica de WEA-08 já cobre esse caso.
- **Owner e trigger:**
  - O registro pelo Chief no PDR §5 está correto. O lar natural é o inventário de capacidades (G06/O016, com o telefone tratado como dispositivo de execução e medição) ou uma linha própria. G09 sozinho é inadequado.
  - Engineering deve ser o owner da verificação de capacidade e das restrições de plataforma (segundo plano, localização).
  - **Security** precisa ser incluída como co-owner: finalidade e consentimento de localização, G07 (retenção) e exposição na tela bloqueada (PB-F-03).
  - Product/UX reavalia se o resultado mudar o comportamento; o Founder entra só se a promessa de Running mudar.
  - Trigger: antes do handoff de implementação de SURF-08 e antes de qualquer verificação de cobertura plena de Running (O014). A finalidade condicional deve ser declarada **antes** da revisão do copy de consentimento (G07). Não bloqueia um Figma estrutural, porque o Designer pode desenhar os dois ramos.
- **Resolução recomendada:** em §23.1, acrescentar Security e a finalidade condicional; em ONB-05/WEA-02, inserir o slot "localização/sensores durante a execução — condicional a UPSTREAM-ISSUE-01".

## 5. Interpretações do autor

| INT | Veredito | Base e condição |
|---|---|---|
| **INT-01** Plano inicial como proposta adotada por ato explícito | **CONFIRMADA com condição** (UXS-ENG-07) | Criar plano a partir de "sem plano" é mutação de plano. AEC §3.4 e DR-63 exigem confirmação; AEOS §13 dá o ciclo `PRESENTED→ACCEPTED→APPLIED`. **Condição:** o plano inicial precisa ser produzido como `DecisionRecord`/`CandidateSet` com `plan_base_ref` explícito de "sem plano" e `confirmation_scope = APPLY_PLAN_CHANGE`, para que a guarda §13.1, o `STALE` (ONB-13 "Ajustar") e os HCs se apliquem igualmente. O enum `action_class` do AEOS §8 não tem classe "inicial". A escolha entre REPLAN sobre base vazia e uma classe própria pertence ao owner do motor; registrar como nota de consumidor, sem inventar classe aqui. |
| **INT-02** Continuar além do horizonte = REPLAN com confirmação | **CONFIRMADA com condição** (UXS-ENG-07) | Coerente com AEOS §8 (REPLAN composto, sem restaurar volume) e DR-63. DEG-31 (nada prescrito além do horizonte) é conservador e derivável. **Condição:** a expiração de janelas de uma proposta de continuação não respondida gera avaliação sucessora (AEOS §13, "expiração relevante é fato de avaliação"). A sucessora de mesmo efeito semântico não pode gerar novo aviso NOT-A nem nova marca de mudança (AEOS §13 "comparar delta material", §14, B6; NOT-01; CONF-09 "no máximo um aviso"). Caso contrário, quem não adota recebe avisos repetidos. |
| **INT-03** HOLD aparece de imediato, sem confirmação | **CONFIRMADA** | AEC §7.1: HOLD suspende saídas dependentes, não é mutação de plano. AEOS §14: sem cooldown para hold, restrição ou permissão; AESL S33. "Imediato" significa assim que o cliente conhece o hold. O caso offline e o caso da restrição declarada localmente ficam cobertos por UXS-ENG-02 (c). |
| **INT-09** Edição manual que viola hard constraint não vira prescrição | **CONFIRMADA com condição** (UXS-ENG-08) | AEOS §9 ("nenhuma agregação compensa FAIL") e AEC §7.1 (override não limpa controle nem obriga a gerar prescrição proibida). **Condição:** distinguir as categorias. Vale para falhas de HC01–HC04, HC06 e HC08–HC09 (identidade/finalidade, autoridade, restrição/hold, integridade, dose/interação, escopo, fidelidade de export). Falhas de **HC05** causadas pela própria edição, como mover para um dia antes indisponível, devem ser tratadas como atualização confirmada do contexto (disponibilidade/equipamento) e reavaliadas, em respeito a PDM inv. 2 e C033. Pular, remover ou marcar indisponível nunca é bloqueado como prescrição: no máximo gera trade-off/ASK. HC07 é a guarda de versão, não uma categoria de bloqueio da intenção da pessoa. |
| **INT-10** Proposta composta sem aceite parcial | **CONFIRMADA** | AEOS §8 (l. 135, candidato composto com validação conjunta, sem montar fragmentos); AESL S47/F-COMPOSITE; CONF-05/06 coerentes (mudar uma parte = editar e reavaliar). |

## 6. Cenários negativos examinados (analíticos, não executados)

| Cenário | Resultado |
|---|---|
| Timeout de publish sem leitura nem idempotência remotas | LU e DEG-06 corretos: "pode ter chegado", sem retry automático, nova tentativa deliberada com o risco explicado. Transições tardias ausentes (UXS-ENG-03). |
| Replace delete+create com delete efetivo e create falho | LP e DEG-28 corretos: estado por etapa, possível ausência ou cópia residual, sem substitutos repetidos. |
| Revogação de escrita com intenção em L2, despachada (L3) ou entregue (L5) | L2: fila cancelada, correto. L3/L5: a spec não mantém o fato remoto (**UXS-ENG-01**). |
| Hold novo com cópia já entregue no relógio | LH, AM-11 e DEG-35 corretos: pendentes cancelados, a cópia pode continuar lá, cancelamento só se suportado e autorizado. |
| Atividade da cópia antiga chegando depois | RUN-07, §14.2 e AEC §5.3 corretos (realizado preservado, futuro readaptado), condicionados a haver referência de retorno (UXS-ENG-04a). |
| Edição offline com plano revisto no servidor ou em outro aparelho | Não especificado: prévia impossível e destino do ato indefinido (**UXS-ENG-02 b**). Aceite de proposta antiga online: STALE correto (CONF-02/12, J-09, Q01). |
| Limitação relatada offline e próxima sessão preparada | Orientação dependente segue como válida (**UXS-ENG-02 c**). |
| Proposta aceita e hold inserido antes do commit (AESL S45) | CONF-12 e ST-DEC: zero efeito, avaliação atual exibida. Correto. |
| Commit válido seguido de revogação, com despacho pendente (S46) | Plano: fato preservado, coerente. Export: lacuna de UXS-ENG-01. |
| Recomputação com entregas reordenadas e JEV alternando (S32/S43/Q04) | MAN-0, MAN-R5 e DEG-21: nada visível. Correto. |
| HealthKit vazio | WEA-05 correto. DEG-14 precisa do qualificador (UXS-ENG-04c). |
| Manual + provider + store para a mesma atividade, depois replay de fato suprimido | WEA-08, DEG-04 e DEG-33 corretos. DEG-11 com texto incorreto (UXS-ENG-05b). |
| Proposta composta X/Y/XY (S47) | CONF-05/06 e AM-08: sem fragmentos. Correto. |
| Duplo toque em confirmar ou "enviar" | Não explícito (UXS-ENG-02 d, UXS-ENG-03). |

## 7. Critérios da rubrica ENGINEERING 1.1.0

| Critério | Resultado | Razão |
|---|---|---|
| Produto aprovado respeitado; feature não escolhida por conveniência técnica | PASS | Nenhum finding propõe remover um comportamento. As correções acrescentam honestidade de estado. |
| Boundaries, contratos, versões e dependências explícitos | PASS com condições | Consome AEC §4–5 e AEOS §13 sem alterá-los. As lacunas estão em UXS-ENG-01/02. |
| Reliability, sync, compatibility e offline verificáveis | **FAIL documental** | UXS-ENG-01 (estado remoto na revogação) e UXS-ENG-02 (atos offline). |
| Omitir requisito por ser difícil = FAIL | Não constatado | As omissões não parecem deliberadas, mas correspondem a cláusulas upstream explícitas (AEC §5.3 offline, AEOS §13.1), por isso são MATERIAL. |
| Boundary novo sem análise de consumidores | N/A | Não cria boundary técnico. UPSTREAM-ISSUE-01 é encaminhada (UXS-ENG-06). |
| Migração, performance/SLO, runtime, release | N/A ao outcome documental | Permanecem com G06/G09 e as missões futuras. |

## 8. Handoff ao Chief

- **Veredito:** FAIL (REQUEST_CHANGES). Dois findings MATERIAL (UXS-ENG-01, UXS-ENG-02) e seis NON_BLOCKING (UXS-ENG-03 a 08). Nenhum BLOCKING; nenhuma decisão do Founder necessária.
- **Escopo do gate:** vale somente para UXS-1.0-r1 com hash `08ac2f96…5d8c`. Qualquer alteração exige revalidação delta, que pode se limitar a §§5.2, 10.4, 14, 18–19, 21, 23 e aos IDs tocados, mais as interações com ST-DEC e WEA-L.
- **Próxima ação:** o autor corrige ou responde cada finding (CORRECT/ACCEPT/DEFER/REJECT/ESCALATE). O Chief roda os checks objetivos. Este judge, ou outra instância independente de Engineering, faz a revalidação delta. UXS-ENG-06 exige registro do Chief no PDR §5 e a inclusão de Security como co-owner.
- **Hash final do artefato (recalculado ao fim desta sessão):** `08ac2f964791f1b9903ca435174a4d660ad74d2abb9a55cd2e9e2df42afc5d8c`.
- **STOP** após este relatório.
