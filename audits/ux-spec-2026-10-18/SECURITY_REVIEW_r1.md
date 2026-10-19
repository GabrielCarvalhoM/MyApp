# Security, Privacy & Abuse — review independente r1 · UX Specification

**Veredito: PASS WITH NON-BLOCKING FINDINGS** — gate documental **PRIVACY_BOUNDARIES_REVIEWED** sobre `product/UX_SPECIFICATION.md` **UXS-1.0-r1** (SHA-256 `08ac2f964791f1b9903ca435174a4d660ad74d2abb9a55cd2e9e2df42afc5d8c`). **0 BLOCKING · 0 MATERIAL · 9 NON_BLOCKING** (UXS-SEC-01 a UXS-SEC-09). PB-F-02 e PB-F-03 estão qualificados no nível documental, sem anonimato prometido e sem correlação nova; os findings pedem precisão de divulgação, de gatilho e de exclusão antes do handoff ao Designer, sem reabrir upstream. Não é SECURITY_READY de sistema, parecer jurídico, threat model de implementação nem prova executável.

## 1. Contrato, independência e evidência

| Campo | Valor |
|---|---|
| Task / contrato / missão | UXSPEC-20261018 / **UXSPEC-20261018-r1** / MISSION-UXSPEC-1.0 |
| Artefato / revisão | `product/UX_SPECIFICATION.md` · **UXS-1.0-r1** · 160 846 bytes; cópia congelada `review-inputs-r1/UX_SPECIFICATION.md` (MANIFEST frozen_at 2026-10-19T01:42:52Z) |
| Hash recalculado | Início (sessão original, antes da interrupção por limite HTTP 429): `08AC2F96…5D8C` = esperado; cópia congelada idêntica. Retomada 2026-10-19T07:33:42-03:00: `08AC2F96…5D8C`, cópia congelada idêntica, relatório ainda inexistente. Fim: ver §10. `Get-FileHash -Algorithm SHA256`. |
| Avaliador / modo | Security, Privacy & Abuse Architect 1.1.0, instância fresca, **independent**. Não é autor nem coautor (autor: worker `product-ux-architect`). Chief coordena e consolida; não emite este gate. |
| Rubrica / protocolos | SECURITY rubric 1.1.0; constituição SECURITY_PRIVACY_ABUSE_ARCHITECT 1.1.0; CORE 1.4.0 (+ extensões até 1.5.0); EXECUTION_PROPORTIONALITY 1.5.0; HANDOFF 1.2.0. |
| Checks objetivos do Chief | `PRE_REVIEW_VERIFICATION.json` (SHA-256 `5a8e9791…7fe6`): 285 passed / 0 failed / 2 warnings (`percent-number` em NUT-07 e J-14, exemplos de pedido de dose recusado — sem efeito de privacidade). Limite declarado pelo próprio arquivo: não provam semântica. |
| Método | Leitura integral do artefato (§§0–26). Upstream nas seções pertinentes: PTC-3.0.0 (L009, L011–L014, L017, C005, C021, C022, C025, C032, C040, C041, §12); PDM-1.1 §§2–7 (I4–I10, W1–W3, inv. 6–9); PA-1.1 §§2–8 (AR-10–15); EM-1.1 §§3, 6; CF-1.1 F01, F04, F08–F10, S10–S13, S17; AEC-1.1 §§5.1, 5.2, 5.4, 7; AEOS-1.0-r2 §12.1; PDR-1.1 §5 (G07–G09) e §7 (condições SEC-J/SEC-J3); RS-1.1 §6; pré-UX `SECURITY_REVIEW_r1.md` (PB-F-01–03); AEOS `SECURITY_REVIEW_r1.md` (C10); snapshot PA-0.1 (`governance/snapshots/2026-10-14-pre-3.0.0`) somente para linhagem de SEC-J-03 (AR-32, AR-47). Percursos adversariais documentais (§7). Sem pesquisa nova, legado, execução, contas ou alvos reais. |
| Ambiente / autoridade | Permissões herdadas; leitura local; escrita somente deste arquivo. Sem delegação. Outros autores podem trabalhar no projeto; nada alheio foi alterado. |
| Escopo / STOP | Privacidade, consentimento, audiência, notificações, convites, share, export, agente e abuso na manifestação de UX. Parar após este relatório e o handoff. |

## 2. Threat model delimitado à manifestação de UX

| Ativos / atores / travessia | Ameaça material | Controle na UXS-1.0-r1 |
|---|---|---|
| Estado pessoal (HOLD/causa, limitação, recovery, Nutrition, motivos, modo, confiança, ausência) → Crew | Exposição direta ou inferência por estado, contagem, lembrete ou evento | CRW-09/12/17–20, AM-11, CTN-04/05, HOJ-S7, NAV-08; restante: UXS-SEC-01/02 |
| Participantes de Crew de duas / Crews sobrepostas (até 3) | Atribuição trivial, comparação entre Crews, vazamento do limite | CRW-07 (inferência residual divulgada), CRW-13, CRW-17–19; restante: UXS-SEC-01/03 |
| Convidante, candidato, estranho com link encaminhado/projetado, remetente bloqueado | Enumeração, causa de não aceite, personificação, assédio por convite | CRW-03–06/13, FLOW-11, SHR-03, ONB-03, DEG-24–26; restante: UXS-SEC-04 |
| Telefone: avisos, tela bloqueada, widgets, visão de execução (observador, aparelho compartilhado) | Dado sensível ou de terceiros sem ato | NOT-01–08, NUT-08, NOT-E genérico; restante: UXS-SEC-06 |
| Provider/relógio (export), destino externo (share) | Metadado sensível em título/notas, cópia viva, rastreio | WEA-02/L*, NUT-08, RUN-08, SHR-01–06; restante: UXS-SEC-07 |
| Agente/LLM (opcional) | Texto externo como instrução, conversa como verdade, novo destinatário de dados de terceiros | AGT-00–11, EXP-03/04; restante: UXS-SEC-08 |
| Consentimento/direitos/revogação | Bundling, revogação sem efeito, I10 ligado por padrão | ONB-02/05, FLOW-15, ST-CONS, SURF-13, WEA-06/07; restante: UXS-SEC-05/09 |

## 3. Critérios, evidência e resultado

PASS = coerência e limite contratual demonstrados no texto atual; nada aqui é teste do produto.

| ID | Critério / tema | Evidência (UXS-1.0-r1) | Resultado |
|---|---|---|---|
| SEC-UX-C01 | **PB-F-02 audiência** atual/futura, por papel | CRW-17 (participante, futuro, candidato, convidante, ex-participante, membro comum de outra Crew); CRW-07 (audiência atual e futura; futura vê nome/estado neutro a partir da entrada, nunca interações anteriores); CRW-15; SURF-10 "Não pode" | PASS; aviso de entrada → UXS-SEC-03 |
| SEC-UX-C02 | **Estado neutro** "Em pausa" | CRW-12 (sem motivo/horário/histórico/frequência; por Crew; interromper oferece pausa por Crew com padrão "não alterar"); CTN-04/05 (`NO_DATA` neutro, nada à Crew); HOJ-C14 | PASS |
| SEC-UX-C03 | **Crew de duas pessoas** | CRW-18: todo estado visível é atribuível e isso está no consentimento; check-in um-para-um; reconhecimento idêntico; produto nunca avisa pausa/saída/ausência/não adesão | PASS com UXS-SEC-01 (momento do ato via aviso; remoção/proposta atribuíveis) |
| SEC-UX-C04 | **Crews sobrepostas** (SEC-J3-09) | CRW-19 (estados por Crew; comparação legítima divulgada no consentimento e no momento de pausar; sem correlação; limite não revelado; check-in na Crew A não aparece na B; reconhecimento por Crew); CRW-13; CRW-17 última linha | PASS |
| SEC-UX-C05 | **Avisos de Crew** | CRW-20 (só itens próprios; nunca pausa/saída/ausência/silêncio de outro, lembrete citando alguém, contagem, "sua Crew espera"); NOT-E genérico, desligável por Crew; NOT-02 | PASS com UXS-SEC-01 |
| SEC-UX-C06 | **PB-F-03 / SEC-J3-05** telefone | NOT-05 (sem causa de HOLD, sinais, Nutrition, motivos); NOT-08 (L0 genérico padrão; L1 opt-in; exclusões em todos os níveis; visão de execução opt-in); NUT-08/11 | PASS documental com UXS-SEC-06; prova no aparelho DEFER G09 |
| SEC-UX-C07 | Consentimento/divulgação SEC-J-01, SEC-J3-06 | CRW-07 (o que cruza, audiência, por Crew, pausa sem custo, novo consentimento se escopo cresce, inferência residual, PT-BR/EN de mesmo alcance, idioma/versão); ONB-02; FLOW-15 (finalidade, destinatários, alcance, persistência, efeito da revogação, idioma/versão); NOT-07; EXP-06 | PASS; copy final DEFER G07/G08 |
| SEC-UX-C08 | Finalidades, I6/I10, revogação, direitos | ONB-05 (primário só; saúde/recovery, wearable e I10 no ponto de uso; I10 nasce desligado); §6.2; DEG-23 (recusa sem penalidade); RUN-08/AGT-10 (sem I10 sem opt-in); ST-CONS; SURF-13 (acessar, exportar, corrigir, eliminar, encerrar; sem terceiros no export) | PASS com UXS-SEC-05 (revogar Crew) e UXS-SEC-09 (autenticação/reautenticação) |
| SEC-UX-C09 | Wearable: permissões locais separadas, sem OAuth granular prometido, desconexão/revogação cessam filas | WEA-01/02 (aviso prévio de agrupamento externo; desconecta e explica), WEA-05 (vazio opaco ≠ negado), WEA-06/07, WEA-LX, J-15, DEG-14 | PASS |
| SEC-UX-C10 | Convites e entrada (SEC-J3-01/02/03, C025) | CRW-03–06, CRW-13, FLOW-11 (18+ → canal → confirmação → consentimento → vínculo), ONB-03, DEG-24–26, SURF-X-07, CRW-16 (sem agenda/discovery) | PASS com UXS-SEC-04 |
| SEC-UX-C11 | Share/projeção (SEC-J-11/12, I7–I9) | SHR-01–06 (prévia exata, cópia estática, sem link vivo, metadados de local/horário removidos, sem rastreio, aviso de irrecuperabilidade, convite opaco/não enumerável/revogável sem nomes nem nome da Crew, aceite via FLOW-11, registro em SURF-13); SURF-X-13 | PASS com UXS-SEC-07 (lista de exclusões) |
| SEC-UX-C12 | Não vazamento por canal (AEOS C10; AEC §5.2) | Matriz §4 | PASS com UXS-SEC-02/07 |
| SEC-UX-C13 | Agente (§17): fato candidato, conversa não é verdade, texto externo é dado, recipients/retention não presumidos | AGT-00 (condicionado a FOUNDER-DECISION-01 e gates AI/Security G07/G09), AGT-01, AGT-04, AGT-05 (sensível/material só após confirmação no objeto), AGT-06, AGT-07, AGT-10 (histórico não alimenta contexto nem I10); NAV-10; J-16 | PASS com UXS-SEC-08 |
| SEC-UX-C14 | Abuso: remover/silenciar/bloquear, remoção simétrica, reentrada, sem números inventados (G08) | CRW-06, CRW-10, CRW-14 (simétrica, sem motivo, mecanismo `[DEP-G08]`, reentrada por novo convite com confirmação de quem removeu), J-20, DEP-09; nenhum limite numérico novo além de C025 (3 / ~8) | PASS com UXS-SEC-01/04 |
| SEC-UX-C15 | Check-in sem dado de treino/motivo/origem/verificação/modo | CRW-09, PDM I4 refletido; INT-06 | PASS com UXS-SEC-01/02 |
| SEC-UX-C16 | Logs, retenção, recipients reais, autorização no servidor, rate limits | Fora da manifestação de UX; `[DEP-G07]`/`[DEP-G08]`/`[DEP-G09]` preservados (DEP-08/09/10) | NOT_APPLICABLE ao gate documental; DEFER G07–G09 |

## 4. Matriz de não vazamento por canal (AEOS C10)

| Categoria | Crew | Avisos / tela bloqueada / widget | Share | Export (título/notas) | Agente |
|---|---|---|---|---|---|
| HOLD / causa | CRW-17, AM-11 (sem evento social) | NOT-05/08 (causa excluída) — existência: UXS-SEC-06 | não listado explicitamente — UXS-SEC-07 | sem regra explícita — UXS-SEC-07 | AGT-02 só explica à própria pessoa |
| Limitação / dor relatada | CRW-17 | NOT-08 (L1) — UXS-SEC-06 | UXS-SEC-07 | UXS-SEC-07 | AGT-05 candidato confirmado |
| Recovery / sinais de saúde | CRW-17 | NOT-05/08 | SHR-01 | não explícito (AEC §5.2 cobre "motivo de saúde") — UXS-SEC-07 | AGT-10 |
| Nutrition | CRW-17, NUT-08 | NUT-08/11 | NUT-08, SHR-01 | NUT-08 | NUT-07 |
| Motivos | CRW-09/17 | NOT-05 | SHR-01 | RUN-08 | — |
| Modo M1/M2/M3 | CRW-09/17, NAV-08 | — | SHR-01 | UXS-SEC-07 | — |
| Confiança / fatores | CRW-17 (sem canal); PDM I4 | NOT-02 | UXS-SEC-07 | UXS-SEC-07 | EXP-03 |
| Ausência / silêncio | CRW-18/20, CTN-05 | CRW-20, NOT-02 | SHR-06 | — | — |
| Dados de terceiros | CRW-17 | NOT-08 | SHR-01 | — | AGT-04 ("expor") — leitura: UXS-SEC-08 |

Nenhuma célula contradiz o upstream; as lacunas são de explicitação para o handoff ao Designer.

## 5. Interpretações do autor

| INT | Disposição Security | Razão |
|---|---|---|
| **INT-04** adesão visível só à própria pessoa; estado do compromisso segue o tempo | **CONFIRMADA** | É a leitura mais protetora de PDM §5 "ativo por adesão": em Crew de duas, qualquer estado dependente de adesão revelaria a escolha da outra (AR-10, PDM inv. 6, L017). Ressalva registrada em UXS-SEC-01: propor um compromisso é ato visível e, em Crew de duas, revela a adesão inicial de quem propôs. |
| **INT-05** novo membro sem push por padrão | **CONDICIONADA** (UXS-SEC-03) | "Sem push" é aceito. Perceber só pela lista é mais fraco que a linhagem de SEC-J-03 ("participantes avisados quando alguém entra", resolvida por PA-0.1 AR-47 como "X entrou" no espaço da Crew). Exige indicação no espaço, sem quem convidou nem como. |
| **INT-06** check-in sem horário nem dia | **CONDICIONADA** (UXS-SEC-01) | O conteúdo sem horário/dia é confirmado (SEC-J-02, AR-12). A razão "reduz inferência de rotina" não se sustenta sozinha enquanto NOT-E entrega o aviso de interação em tempo real: o momento da chegada fica perceptível. Exige divulgação no consentimento e na prévia do envio. |
| **INT-08** L0 genérico por padrão, L1 opt-in, visão de execução opt-in | **CONFIRMADA com condição** (UXS-SEC-06) | Atende PB-F-03 "por padrão". Precisa fixar que o conteúdo renderizável na tela bloqueada é L0 para todas as classes e que a existência de HOLD/restrição/pergunta sobre limitação é tratada como sensível. |

## 6. Findings

Todos voltam ao autor (worker `product-ux-architect`, mesma instância) por REQUEST_CHANGES não bloqueante; nenhum foi corrigido por este judge. Severidade NON_BLOCKING: nenhum cria correlação, audiência ou canal novo nem contradiz autoridade upstream; todos devem ser resolvidos (CORRECT, ou REJECT/DEFER justificado) **antes do handoff ao Designer / Figma** das superfícies afetadas, com revalidação Security por delta.

### UXS-SEC-01 — NON_BLOCKING — Momento do ato e atribuibilidade em Crew de duas não qualificados

- **Local:** CRW-07, CRW-08, CRW-09, CRW-14, CRW-18, CRW-20, NOT-E, FLOW-12, INT-06.
- **Critério / upstream:** PB-F-02 (qualificar notificações em Crew de dois); SEC-J-01 (consentimento declara exatamente o que cruza); SEC-J-02 (granularidade sem horário nem dia visíveis); PA §6 ("Receber um check-in voluntário também é conhecido pelo destinatário"); L017.
- **Evidência:** NOT-E "Ligado" para interação recebida (CRW-20); FLOW-12 tem como entrada "após desfecho"; INT-06 justifica a ausência de horário/dia como redução de inferência de rotina; CRW-07 lista o que cruza sem dizer que a chegada é perceptível no momento do envio. CRW-14 diz "sem autoria", e CRW-18 não trata remoção nem proposta de compromisso.
- **Cenário / impacto:** Crew de duas (A, B). A envia check-in logo após cada treino, como a oferta pós-desfecho sugere; B recebe aviso em tempo real e reconstrói os dias e horários de treino de A ao longo do período, que é a grade que SEC-J-02 evita na exibição. O mesmo vale para gestos de apoio. Com parceiro coercitivo (SEC-J-09/SEC-J-15), vira canal de monitoramento sob pressão. Em Crew de duas, a remoção é trivialmente atribuível e propor um compromisso revela a adesão inicial de quem propõe. A inferência decorre de ato voluntário e não é correlação nova, mas a razão de INT-06 promete mais do que o comportamento entrega e a divulgação não a cobre.
- **Resolução exigida:** (1) CRW-07 e a prévia do FLOW-12 declaram que o destinatário percebe quando o check-in ou apoio chega (aviso ou app) e que quem envia escolhe o momento; (2) INT-06 reescrita sem alegar ocultar o momento; (3) CRW-18 inclui remoção e proposta de compromisso como atribuíveis em Crew de duas; CRW-14 passa a "sem autoria exibida". Mitigação adicional de entrega (aviso de interação não imediato ou agregado por padrão) é escolha opcional de Product/UX, não exigida.
- **Owner:** Product/UX worker; revalidação Security por delta.

### UXS-SEC-02 — NON_BLOCKING — Conteúdo do check-in e gatilhos da oferta não fechados

- **Local:** CRW-09, FLOW-12, CTN-06, J-06, J-07, AM-11.
- **Critério / upstream:** PA §6 e EM §6 (descanso, adaptação e retorno usam "a mesma mensagem mínima"; conteúdo comum a M2/M3); PDM I4; AEC §7.1 ("HOLD/retomada não produzem evento social"); PDR DR-04(b) (categoria do desfecho só por opt-in); SEC-J-07 residual; SEC-J2-07.
- **Evidência:** CRW-09 cita uma mensagem única, mas a lista de gatilhos (desfecho, descanso, adaptação, retorno) e CTN-06 "Compartilhar o retorno é opcional (CRW-09…)" admitem variantes por categoria ("voltei", "descansei"). Nenhuma regra impede oferecer check-in logo após HOLD, ASK sobre limitação ou declaração de interrupção.
- **Cenário / impacto:** A está "Em pausa" numa Crew de duas e, ao retomar, envia "voltei", revelando a interrupção; ou a oferta de check-in aparece logo após um HOLD por dor e acopla safety a um gesto social.
- **Resolução exigida:** CRW-09 fixa conteúdo estruturado único; se houver categorias, apenas por opt-in do remetente em cada envio, comuns aos modos, nunca derivadas de HOLD, causa ou modo. A oferta nunca acompanha HOLD, ASK, RECONCILE nem a tela de declaração de interrupção. CTN-06 alinhado.
- **Owner:** Product/UX worker.

### UXS-SEC-03 — NON_BLOCKING — INT-05 enfraquece o aviso de entrada da linhagem SEC-J-03

- **Local:** CRW-15, INT-05, CRW-07.
- **Critério / upstream:** PDR §7 SEC-J-03 ("participantes avisados quando alguém entra"), resolvida em CP-B por PA-0.1 AR-47 ("X entrou" no espaço da Crew, sem quem convidou nem como) e AR-32 (aviso de entrada no consentimento); SEC-J-01 (audiência futura). PA-1.1 é silente, não contrária.
- **Evidência:** CRW-15/INT-05: os atuais "percebem a mudança de audiência pela lista de participantes", sem push por padrão; nenhuma indicação no espaço.
- **Cenário / impacto:** Crew de duas passa a três; A, em pausa, não nota que C passou a ver seu nome e estado salvo se comparar o roster; reentrada de removido sem confirmação (quem removeu já saiu) passa despercebida.
- **Resolução exigida:** manter sem push por padrão; acrescentar indicação no espaço da Crew de que alguém entrou, sem quem convidou nem como; mencionar isso em CRW-07.
- **Owner:** Product/UX worker.

### UXS-SEC-04 — NON_BLOCKING — Convite e entrada: controles anti-abuso visíveis incompletos

- **Local:** CRW-03–06, CRW-10, FLOW-11, FLOW-13, SHR-03, ONB-03, DEG-24/25.
- **Critério / upstream:** C025; PA AR-13/AR-14; SEC-J-03; SEC-J3-01/02/03; SEC-J-15; rubrica SECURITY (abuso, enumeração, minimização).
- **Evidência e pontos:**
  - (a) A confirmação de aceite encaminhado/projetado mostra só o nome de exibição escolhido pelo candidato. Quem obtém o link pode se apresentar como "Ana". A confirmação deve dizer que o canal do convite não foi comprovado e que a identidade não é verificada.
  - (b) Convites de remetente bloqueado devem seguir o mesmo ciclo e tempo visíveis de um convite não respondido. Um "não aceito" instantâneo denunciaria o bloqueio, contra SEC-J3-03. O silenciamento de apoio também não avisa o silenciado (linhagem AR-51).
  - (c) Nenhum fluxo ou estado de convite revela se o contato já tem conta. Esse oráculo revelaria uso de app de saúde/treino.
  - (d) O canal do convidado é digitado, ou é um único contato do seletor do sistema. Serve só à entrega e à comprovação e é descartado conforme AR-13, sem agenda.
  - (e) Fixar o que o candidato vê antes do vínculo, isto é, o nome de exibição de quem convidou. É necessário para o consentimento informado e para "bloquear aquela pessoa".
  - (f) ONB-03 "sem perfil retido além do que a política exigir" deve alinhar a SEC-J3-02: guardar só o resultado e um fato mínimo de auditoria; falha não deixa perfil.
  - (g) Objeto de convite projetado com usos limitados às vagas e validade `[DEP-G08]`.
- **Cenário / impacto:** um estranho com link encaminhado passa pela confirmação por personificação e passa a ver nomes e estados da Crew. Um assediador bloqueado detecta o bloqueio pelo tempo da resposta. Um convidante sonda quais contatos usam o app.
- **Resolução exigida:** fixar (a)–(f) na manifestação; (g) e os limites numéricos ficam em G08, sem números inventados.
- **Owner:** Product/UX worker (manifestação); Security/Engineering em G08 (mecanismo/limites).

### UXS-SEC-05 — NON_BLOCKING — Revogar o consentimento de uma Crew sem efeito definido

- **Local:** SURF-13, FLOW-15, ST-CONS, AG-12, CRW-07, CRW-14.
- **Critério / upstream:** PDM §7 ("Revogar opt-in retira o que segue visível sob ele"); PA §8; EM §3 (revogação pode minimizar/encerrar a finalidade); L014.
- **Evidência:** SURF-13 lista consentimentos "inclusive por Crew"; FLOW-15 revoga por finalidade. Nenhum ID define o efeito de revogar o consentimento de uma Crew: encerrar o vínculo, retirar nome e estado, ou destino de check-ins já entregues.
- **Cenário / impacto:** a pessoa revoga em Você → Privacidade; uma implementação "para só os check-ins" deixa nome e "Em pausa" visíveis sem base consentida.
- **Resolução exigida:** definir que revogar o consentimento de uma Crew encerra o vínculo com os efeitos de CRW-14, ou declarar exatamente o que permanece e sob qual finalidade. Efeito mostrado antes do ato, sem afetar outras Crews.
- **Owner:** Product/UX worker.

### UXS-SEC-06 — NON_BLOCKING — Telefone: existência de retenção/limitação como dado sensível (PB-F-03, INT-08)

- **Local:** NOT-05, NOT-08, NOT-P0/B/D, INT-08.
- **Critério / upstream:** PB-F-03; SEC-J3-05; RS §6 G09; PDM inv. 9.
- **Evidência:** NOT-05 diz que o aviso "informa categoria e ação"; NOT-08 fixa L0 genérico por padrão. L1 exclui "causa de retenção", mas não a existência de retenção, restrição ou pergunta sobre limitação/recovery. A relação entre a "categoria" de NOT-05 e o L0 na tela bloqueada não está fixada.
- **Cenário / impacto:** aparelho visto por terceiro ou compartilhado; com L1 ativo, a tela mostra "sessão de amanhã retida por segurança" ou "precisamos saber da sua limitação", e o observador infere saúde.
- **Resolução exigida:** (1) o conteúdo padrão renderizável na tela bloqueada é L0 para todas as classes; a categoria de NOT-05 aparece só desbloqueado ou no app; (2) existência de HOLD/restrição/safety e de ASK sobre limitação/recovery tratada como sensível em todos os níveis, ou exposta em L1 só com divulgação explícita no opt-in; (3) widgets e visão de execução seguem o mesmo. Prova no aparelho em G09.
- **Owner:** Product/UX worker; prova Engineering/Security em G09.

### UXS-SEC-07 — NON_BLOCKING — Exclusões por canal incompletas para export e share

- **Local:** FLOW-06, WEA-L1, SHR-01, NUT-08, RUN-08.
- **Critério / upstream:** AEC §5.2 (sem Nutrition, motivo de saúde ou Crew em título/notas); AEOS Security C10; PDM I7; C021; CF F10.1.
- **Evidência:** há regra explícita só para Nutrition (NUT-08) e motivo (RUN-08). Não há regra única para título, notas e metadados do workout exportado quanto a HOLD/causa, limitação relatada, sinais de recovery, fatores/confiança da explicação, Crew e modo. SHR-01 não lista HOLD/causa, limitação nem confiança.
- **Cenário / impacto:** uma revisão adaptada por restrição é exportada com título ou notas derivados do propósito ou da explicação ("reduzida — joelho"). O provider (terceiro) recebe o dado e a tela do relógio o exibe.
- **Resolução exigida:** regra em FLOW-06/WEA-L1: o export leva só a estrutura da sessão e identificadores neutros, e a prévia mostra exatamente os campos transmitidos, com a lista de exclusões acima. SHR-01 acrescenta HOLD/causa, limitação e confiança/explicação.
- **Owner:** Product/UX worker.

### UXS-SEC-08 — NON_BLOCKING — Escopo de leitura do agente não exclui dados de Crew/terceiros

- **Local:** AGT-03(e), AGT-04, AGT-10, EXP-04.
- **Critério / upstream:** L014; C021; CRW-07 (o consentimento cobre participantes, não novos destinatários); AEC §7.2; AEOS §12.1 (JEV sem Crew); PDR G07/G09.
- **Evidência:** AGT-10 permite ler "objetos/finalidades autorizados à própria pessoa"; check-ins recebidos e nomes/estados de participantes são visíveis à pessoa. AGT-04 proíbe só "expor".
- **Cenário / impacto:** "o que a Ana me mandou esta semana?" envia nomes e check-ins de terceiros a um provider de LLM sem consentimento de Ana.
- **Resolução exigida:** AGT-10 exclui objetos de Crew e dados de terceiros do escopo legível do canal, que só pode indicar o destino Crews. Se agente ou LLM explicador for selecionado, o destinatário aparece em FLOW-15/SURF-13 conforme G07/G09.
- **Owner:** Product/UX worker com AI Systems; Security no gate G09 se o LLM for selecionado.

### UXS-SEC-09 — NON_BLOCKING — Identidade de conta, autenticação, recuperação e reautenticação ausentes e não registradas

- **Local:** FLOW-01/§6, SURF-05, SURF-13, NOT-G, §22, §24.3.
- **Critério / upstream:** constituição Security (auth/account/recovery é trigger obrigatório); SEC-J-09 (aparelho compartilhado/controle coercitivo); PDR G08/G09.
- **Evidência:** nenhum ID cobre entrar e sair da conta, sessões em vários aparelhos, recuperação de conta ou reautenticação antes de exportar dados, eliminar ou encerrar conta. NOT-G pressupõe "segurança da conta"; DEP-09 cita aparelho compartilhado só para NOT-08.
- **Cenário / impacto:** em Figma, o Designer inventa recuperação por SMS ou login social de terceiro, que é nova trust boundary sem Security; o export de dados de saúde é entregue por link em aviso ou e-mail.
- **Resolução exigida:** registrar explicitamente como fora do escopo desta especificação, com owner (Security/Engineering em G08/G09) e gatilho de retorno em §24.3. Fixar só que o export de dados próprios é entregue na superfície autenticada, nunca no conteúdo do aviso, e que ações destrutivas de direitos exigem confirmação explícita. Sem inventar método.
- **Owner:** Product/UX worker (registro); Security/Engineering (método).

## 7. Cenários negativos examinados

| # | Percurso | Resultado no texto atual |
|---|---|---|
| N1 | **Crew de duas**: A pausa | B vê só "Em pausa", sem motivo/horário/histórico, sem aviso (CRW-12/18/20); divulgado no consentimento (CRW-07). OK. |
| N2 | Crew de duas: A sai / A remove B | Lista muda; Crew em formação; compromisso cancelado sem fracasso; B removido vê resultado neutro (CRW-14, NAV-04, DEG-32). Autoria inferível não qualificada → UXS-SEC-01. |
| N3 | Crew de duas: A retira adesão ao compromisso | Estado visível não muda; reconhecimento idêntico (CRW-08/11, INT-04). OK; propor revela adesão inicial → UXS-SEC-01. |
| N4 | Crew de duas: check-ins logo após cada treino | Conteúdo sem dado, motivo, horário ou dia (CRW-09); aviso em tempo real revela o momento → UXS-SEC-01. |
| N5 | **P em 3 Crews** (X, Y, Z); M em X e Y; N em Y e Z; P pausa só X | M compara "Em pausa"/ativo; divulgado no consentimento e no ato de pausar; sem correlação oferecida; outras Crews e limite invisíveis (CRW-17/19). OK. |
| N6 | Mesmo P: check-in para M em X | Não aparece em Y; N nada vê (CRW-19). OK. |
| N7 | M convida P para uma 4ª Crew (P no limite) | M vê "não aceito/expirado", igual a recusa; P vê o próprio limite (CRW-05/13, DEG-26). OK. |
| N8 | P interrompe treino e pausa todas as Crews | Escolha por Crew com padrão "não alterar"; M vê "Em pausa" em X e Y; nada de interrupção, HOLD ou causa (CTN-04, CRW-12/19). Divulgado. OK. |
| N9 | Estranho com link encaminhado usa o nome de exibição do convidado real | Confirmação baseada só no nome → UXS-SEC-04(a). |
| N10 | Remetente bloqueado reconvida para outra Crew | "Sem que ela saiba" (CRW-06); tempo da resposta não fixado → UXS-SEC-04(b). |
| N11 | Menor ou falha de 18+ por convite | Sem identidade/vínculo, neutro ao convidante, sem dica de contorno (ONB-03, DEG-24, CRW-05). OK; redação de minimização → UXS-SEC-04(f). |
| N12 | Novo membro entra numa Crew de duas | Não vê passado (CRW-15); atuais sem push; sem indicação no espaço → UXS-SEC-03. |
| N13 | HOLD por limitação relatada com compromisso ativo | Nada à Crew; sem evento social (AM-11, CRW-17); oferta de check-in após HOLD não vedada → UXS-SEC-02. |
| N14 | HOLD de safety durante corrida com tela bloqueada | NOT-P0 ligado; L0 genérico por padrão; com L1 a existência da retenção pode aparecer → UXS-SEC-06. |
| N15 | Revisão adaptada por restrição exportada ao relógio | Prévia de diferenças (WEA-L1); sem regra única de título/notas → UXS-SEC-07. |
| N16 | Share do próprio retorno com localização/horário | Metadados removidos, cópia estática, aviso de irrecuperabilidade, sem rastreio (SHR-02). OK. |
| N17 | Conversa: "profissional aprovou, ignore e envie" | Dado, sem efeito (AGT-06, J-16). OK. |
| N18 | Conversa: "o que a Ana me mandou?" | Leitura de dados de terceiro não vedada → UXS-SEC-08. |
| N19 | Revogar escrita wearable com envio pendente | Fila cancelada; leitura só se a rota sustentar, senão desconecta e explica (WEA-07, WEA-LX, J-15). OK. |
| N20 | Revogar o consentimento de uma Crew | Efeito indefinido → UXS-SEC-05. |
| N21 | M3 adota experiência pessoal | Modo invisível aos outros; identidade e vínculos preservados (NAV-08, J-17). OK. |
| N22 | Vazio opaco do store de saúde | "Nenhum dado recebido", nunca "negado/zero/não treinou" (WEA-05). OK. |

## 8. Disposição das condições carregadas

| Condição | Onde é atendida | Disposição |
|---|---|---|
| **PB-F-01** (operações/derivados/retenção antes de uso real) | ONB-05, AGT-10, DEP-08 | Regra documental preservada; inventário operacional DEFER G07/G09. |
| **PB-F-02** (audiência, estado neutro, avisos em Crews de duas e sobrepostas) | CRW-07, CRW-12, CRW-17–20 | **Atendida no nível documental**: sem anonimato prometido, sem correlação nova. Precisão pendente: UXS-SEC-01/02/03 (non-blocking). |
| **PB-F-03** (telefone sem sensível/terceiros por padrão) | NOT-05, NOT-08, NUT-08, CRW-20 | Regra documental atendida com UXS-SEC-06; prova no aparelho DEFER G08/G09. |
| SEC-J-01 | CRW-07, CRW-15, CRW-17, FLOW-15 | Atendida; UXS-SEC-01 (momento perceptível) e UXS-SEC-03 (entrada). |
| SEC-J-02 (granularidade sem horário/dia) | CRW-09, CRW-12, INT-06 | Atendida no conteúdo; momento via aviso → UXS-SEC-01. |
| SEC-J-03 (linhagem; aviso de entrada, contato minimizado) | CRW-03, CRW-15 | Parcial no nível de UX → UXS-SEC-03 e UXS-SEC-04(d). |
| SEC-J-04 | CRW-10, CRW-14, J-20 | Atendida; atribuibilidade em Crew de duas → UXS-SEC-01; silenciado não avisado → UXS-SEC-04(b). Mecanismo DEFER G08. |
| SEC-J-06 | CRW-10, CRW-16 | Atendida (gestos estruturados; sem texto livre). |
| SEC-J-11 | SHR-02, SHR-04 | Atendida; prova de metadados/links DEFER G09. |
| SEC-J-12 | SHR-03, CRW-04 | Atendida, mais estrita que o upstream (sem nome da Crew). |
| SEC-J-13 | CRW-07, CRW-17, CRW-19 | Atendida. |
| SEC-J3-01 | CRW-05, CRW-13, DEG-25/26 | Atendida. |
| SEC-J3-02 | ONB-03, DEG-24 | Atendida no comportamento; redação → UXS-SEC-04(f); método DEFER G08. |
| SEC-J3-03 | CRW-06 | Atendida; tempo do bloqueio → UXS-SEC-04(b); limites DEFER G08. |
| SEC-J3-05 | NOT-05, NOT-08, CRW-20 | Atendida para a fase 8 documental com UXS-SEC-06; threat model e prova DEFER G08/G09. |
| SEC-J3-06 | ONB-02, CRW-07, NOT-07, EXP-06, FLOW-15 | Atendida; copy final DEFER G07. |
| SEC-J3-09 | CRW-13, CRW-17, CRW-19 | Atendida (percurso N5–N8). |
| AEOS Security C10 | §4 deste relatório | Preservada; explicitação para export/share → UXS-SEC-07. |
| SEC-J-09 / SEC-J-15 (aparelho compartilhado, vigilância por parceiro, testes negativos) | NOT-08, DEP-09/10 | DEFER G08/G09 (fase de implementação); UXS-SEC-01 e UXS-SEC-09 registram o que a UX deve explicitar. |

## 9. Limites

- Gate documental sobre UXS-1.0-r1 apenas. Não é SECURITY_READY, parecer jurídico, classificação de dados sensíveis (SEC-J-14), threat model de implementação, aprovação de copy, UX_SPEC aprovada, VISUAL_READY ou autorização de Figma.
- Nenhuma verificação executável: autorização no servidor, cross-account/cross-Crew, replay, rate limits, redaction de logs, criptografia, retenção e eliminação ficam em G07–G09 com prova na revisão real (SEC-J-15).
- O agente/LLM é condicional (FOUNDER-DECISION-01); se selecionado, exige gate AI/Security próprio sobre campos, destinatários, retenção, no-training e evals adversariais.
- Domínios alheios (estrutura Product/UX, explicação/JEV/LLM em AI Systems, estados wearable em Engineering) não foram julgados; nenhum PASS deles é inferido.
- Mudança material em audiência, avisos, consentimento, convite, share, export ou escopo do agente invalida este parecer para as partes afetadas e exige delta review.

## 10. Handoff e STOP

| Campo | Valor |
|---|---|
| Producer → consumer | Security judge independente (esta instância) → **Chief** (consolidação) → autor `product-ux-architect` (correções) |
| Task / contrato / revisão | UXSPEC-20261018 / UXSPEC-20261018-r1 / UXS-1.0-r1 |
| Hash avaliado | `08ac2f964791f1b9903ca435174a4d660ad74d2abb9a55cd2e9e2df42afc5d8c` (início, retomada e fim idênticos; fim registrado pelo Chief a partir do handoff) |
| Verdict | **PASS WITH NON-BLOCKING FINDINGS** · PRIVACY_BOUNDARIES_REVIEWED (documental) |
| Findings | UXS-SEC-01 a UXS-SEC-09, todos NON_BLOCKING; owner principal Product/UX worker; resolver antes do handoff ao Designer, com revalidação Security por delta |
| Invalidated dependents | Nenhum: nenhum arquivo além deste foi escrito |
| Próxima ação | Chief agrega com os demais gates; autor corrige ou justifica cada finding; delta review Security sobre a nova revisão |

**STOP:** parecer entregue; único arquivo escrito por esta instância: `audits/ux-spec-2026-10-18/SECURITY_REVIEW_r1.md`. Sem edição do artefato, de upstream, de estado global, sem ações externas e sem novos especialistas.
