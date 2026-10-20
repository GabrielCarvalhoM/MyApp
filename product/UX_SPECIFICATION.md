# Vilumo Fit — Detailed UX Specification

**Estado: ACTIVE — integrada em MyApp/main em 2026-10-19 (sync V1 freeze, [registro](../audits/v1-freeze-sync-2026-10-19/INTEGRATION_RECORD.md)); delta UX dirigido em [UX_DELTA](../audits/v1-freeze-sync-2026-10-19/UX_DELTA.md). Insumo da fase Visual/UI.**

Revisão **UXS-1.1-FREEZE-r2** · 2026-10-19 · FREEZE-20261019-r1. Base: UXS-1.0-r3, SHA256 598b055d8df6cf67cafe0365e88d0ba694164d00c7ab6576fc2643eff5dcfcdb, recuperável no commit SIL 07a119b26f2008a9eaa2820d0300b98046952afe. Os pareceres/gate dessa base continuam somente sobre seus hashes; não se apresentam como reviews deste sync.

Autor do delta: Codex root; consumidor: Claude→Designer após gate atual e sync. Autoridade: [PTC-3.2.1](../canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md), [RS-1.3](V1_RELEASE_SCOPE.md), [AEC-1.3](ADAPTIVE_ENGINE_CONTRACT.md), [PDM-1.3](PRODUCT_DOMAIN_MODEL.md), [PA-1.3](PRODUCT_ARCHITECTURE.md), [EM-1.2](EXPERIENCE_MODEL.md), [CF-1.2](CORE_FLOWS.md), [AEOS-1.2-r2](ADAPTIVE_ENGINE_OPERATIONAL_SPEC.md), [SIS](SPORT_INTELLIGENCE_SPEC.md), [PDR-1.3](PRODUCT_DECISION_REGISTER.md). [Missão/impacto/pareceres](../audits/v1-freeze-2026-10-19/MISSION_RECORD.md).

Mudança delimitada: Crew/modes/fluxos sociais e conversa saem V1; external outputs próprios permanecem; goal hierarchy/first-value/subscription/progressive analytics e estabilidade entram pelos owners atuais. IDs de controle/execução preservados. Não redesenhar o motor, fazer pesquisa ou inventar thresholds. Nenhuma tela, layout, design system, código, billing ou integração foi criada aqui. Pedido Founder atual autoriza sync→Visual/UI **após** gate corrente, sem outra missão documental; não declara o gate Claude encerrado.

## 0. Guia de leitura, convenções e marcadores

**0.1 Leitura.** §1–2 fixam princípios e decisões estruturais com alternativas. §3–5 fixam superfícies, navegação e o modelo objeto/ação/estado. §6–17 detalham cada workstream. §18–20 cobrem degradação, continuidade e avisos. §21 prova por jornadas. §22–26 trazem dependências, issues/decisões reservadas, handoff, rastreabilidade e autoavaliação. Upstream é citado por seção/ID; regras não são copiadas quando a referência basta.

**0.2 Prefixos de ID estáveis.**

| Prefixo | Objeto | Prefixo | Objeto |
|---|---|---|---|
| PR- | princípio operacional | ALT-UX- | decisão estrutural com alternativas |
| SURF- / SURF-X- | superfície / superfície rejeitada | FLOW- | fluxo transitório sobre um destino |
| NAV- | navegação, retorno, deep link | OBJ- / ST- | objeto UX / família de estados |
| ONB- | onboarding / Athlete Model | HOJ- | composição e casos do Hoje |
| RUN- / STR- | Running / Strength | AM- / MAN- | classes de adaptação / níveis de manifestação |
| CONF- | prévia, confirmação, ciclo da proposta | EXP- / FAC- | explicação / fatores de influência |
| CNF- / ASK- | confiança / pergunta mínima | AG- | agência |
| WEA- | wearables, conexão, export | NUT- | Nutrition contextual |
| CRW- / SHR- | Social deferred / share próprio V1 | AGT- | conversa deferred |
| DEG- | falha/degradação | CTN- | continuidade |
| NOT- | notificações e superfícies do telefone | J- | jornada |
| DEP- | área dependente G01–G11 | INT- | interpretação adotada onde upstream é silente |

**0.3 Marcadores.** `[DEP-Gnn]` = a estrutura, o estado e o comportamento descritos são fixos; conteúdo, número, método, instrumento, catálogo ou copy dependentes permanecem **provisórios** até a prova registrada no [PDR §5](PRODUCT_DECISION_REGISTER.md) Gnn. Esta especificação nunca preenche um slot dependente com exemplo de conteúdo; slots aparecem como `‹conteúdo aprovado›`. Nenhum marcador é veto global à UX (RS §6). `INT-nn` (§23 (disposições atuais)) registra leitura adotada onde o upstream não decide, sempre na direção mais conservadora compatível com DR-63/AEC.

**0.4 Termos.** Nomes de destinos, estados e ações (Hoje, Plano, Progresso, Você, “proposta”, “retida” etc.) são **funcionais**, não rótulos finais (naming/voz pertencem ao Founder/brand, FOUNDER-DECISION-02). Enums em `MAIÚSCULAS` vêm do AEOS e permanecem em inglês. “Confirmar” = ato da pessoa sobre alcance/versão identificados (CF preâmbulo). “Silencioso” = sem manifestação ao usuário; nunca significa mudança de plano não confirmada.

**0.5 Força normativa.** DEVE / NÃO PODE / PODE expressam decisões de Product/UX dentro de D009/D010 e do design space de PA/EM, subordinadas ao upstream. Onde upstream já obriga, a frase cita a fonte.

## 1. Arquitetura da experiência

### 1.1 Princípios operacionais

| ID | Princípio | Consequência verificável | Fonte |
|---|---|---|---|
| PR-01 | Menos interface, mais decisão — sem esconder o que confiança e controle exigem. | Entrada mostra só o previsto, a próxima ação, mudanças relevantes e compromissos próprios; incerteza, erro de sync e retenção que afetam a ação nunca ficam atrás de um toque opcional. | C028/C029/C034 |
| PR-02 | Um atleta, um plano integrado, uma sessão canônica. | Hoje, Progresso, avisos, export e agente abrem a mesma referência/revisão; nenhuma superfície guarda cópia. | L003, PDM inv. 1, AR-01/03 |
| PR-03 | O motor recomenda; a pessoa aplica. | Toda mudança de plano/contexto ou do restante de uma execução passa por prévia + confirmação sobre a versão corrente; export é outra intenção explícita. | DR-63, AEC §3, AEOS §8 `confirmation_scope` |
| PR-04 | Só aparece como adaptação o que mudou uma decisão oficial. | Recalcular sem mudança não gera aviso, selo ou animação de “IA adaptou”. | §10, AEOS §14 |
| PR-05 | Incerteza ao lado da ação que ela afeta. | Limitação material aparece junto da recomendação, não em tela separada. | AEC §3.3, C012 |
| PR-06 | Execução direta sem conversa. | Iniciar, pausar, registrar, corrigir, concluir, confirmar descanso, ajustar disponibilidade, interromper/retomar e enviar workout têm caminho direto. | C030, AR-06 |
| PR-07 | Fazer certo vence fazer mais. | Reduzir, recuperar, descansar e retornar aparecem como progresso; nada premia volume ou pune ausência. | L005–L008, L013, L019/L020 |
| PR-08 | Honestidade de estado. | Fila ≠ transporte ≠ sistema ≠ device ≠ execução ≠ observação ≠ interpretação; nenhum estado alega prova que não existe. | C040, AR-09, AEC §5.3 |
| PR-09 | Privado por padrão; projeção externa só por ato/campos/destino explícitos. | Sem dados sensíveis, terceiros, localização/metadata oculta ou rede social na V1. | L014/C021/C054; PA§7 |
| PR-10 | Sem beco sem saída. | Todo estado tem próxima ação, ou explica quem resolve e o que a pessoa ainda pode fazer. | EM §5, rubrica PRODUCT_ARCHITECTURE |
| PR-11 | Referências estáveis. | Personalização muda prioridade e conteúdo, nunca lugar/rótulo das referências. | C035, AR-02 |
| PR-12 | Linguagem própria por modalidade no mesmo objeto. | Running fala de etapas/alvos/repetições; Strength de exercícios/séries/reps/carga/esforço; nenhuma unidade comum fictícia. | C031, AEC §4 |

| PR-13 | SMALL PRODUCT SURFACE, PREMIUM EXECUTION / anti-bloat. | Dark-first com light mode, premium, moderno, diferenciado, rápido/polido; motion útil; remover escopo aumenta qualidade, não outra feature. | C048 |
| PR-14 | Week é compromisso; Stable-by-default e Model Update ≠ Plan Mutation. | Adequacy/necessity e Change Cost no resultado oficial; Level0 antes de mudar, hysteresis/stickiness e menor mudança suficiente. | L024/C050; AEC§1.2 |
| PR-15 | PROGRESSIVE DEPTH — complexity available, not imposed. | Orientação clean → Progresso Run/Strength/Overall → deep dive contextual; saúde/carga/causa não fabricadas. | C051 |
| PR-16 | Primeiro valor coordenado; VALUE BEFORE HARD ASK. | Semana/proposta e explicação antes da oferta preferencial; pagar/consentir/adotar são atos distintos. | C052/C053 |

### 1.2 Como a coordenação Running × Strength fica visível

A diferença em relação a “app de corrida + tracker de força” não é um selo de IA: é estrutural e aparece em seis pontos fixados nesta especificação. Nenhum deles promete eficácia (H009).

| Momento | Dois apps justapostos | Vilumo (onde está fixado) |
|---|---|---|
| Ver a semana | Dois calendários independentes. | Uma linha do tempo do plano com sessões das duas modalidades, descanso/recuperação como itens de primeira classe e relações entre sessões (CTN-02, §19). |
| Entender uma decisão | Cada app justifica só a si. | Bloco “trade-off” mostra o efeito na outra modalidade sempre que a decisão envolve relação entre sessões (EXP-01 bloco 4; FAC-03). |
| Registrar força | Analytics isolados de força. | O realizado de força pode gerar proposta para a próxima corrida e vice-versa, pela mesma referência (J-03; CF S03/S04). |
| Conflito | A pessoa resolve sozinha entre apps. | Conflito detectado (AEOS C01/C02) vira alternativas válidas já verificadas ou pergunta mínima de prioridade (§10, ASK-01). |
| Mudar agenda | Editar dois planos. | Uma edição de disponibilidade reavalia o horizonte das duas modalidades e mostra o alcance antes de aplicar (FLOW-04). |
| Relógio | Um workout por app, sem vínculo com o outro domínio. | Export da sessão canônica; o retorno é reconciliado no mesmo plano e pode afetar a outra modalidade (WEA-L, J-04). |

### 1.3 O loop como continuidade

Decide → Prepare → Execute → Observe → Adapt → Share → Repeat é mapa de valor, não wizard (EM §1). Nesta especificação: **Decide** = decisão vigente e propostas no objeto Decisão (SURF-06); **Prepare** = preparação da Sessão (SURF-07) com insight elegível e export opcional; **Execute** = faceta de execução (SURF-08/09) ou descanso honrado; **Observe** = fechamento, registro, importação e reconciliação (FLOW-05/08); **Adapt** = avaliação de adequação/necessidade, normalmente aprendizado sem mudança se o plano segue adequado → manifestação conforme §10; **Share** = output próprio externo opcional (SHR-); check-in social/Crew diferidos; **Repeat** = Hoje seguinte e continuidade da semana (§19). Pular Share não reduz valor; descanso cumpre Execute; ausência de relógio não remove Observe (registro manual).

## 2. Decisões estruturais e alternativas

Decisões de alto impacto comparam alternativas reais, incluindo preservar a estrutura upstream. Prova por jornadas analíticas (§21), sem wireframe.

| ID | Questão | Alternativas consideradas | Escolha e razão | Prova |
|---|---|---|---|---|
| ALT-UX-01 | Conjunto de superfícies | **A** preservar os destinos lógicos do PA §2 + poucas superfícies de detalhe de objeto canônico + fluxos transitórios sobre o destino dono; **B** uma superfície por entidade do PDM (Recovery, Nutrition, HOLD, Trace, Export, Check-in…); **C** Hoje + conversa como interface principal; **D** hubs por esporte. | **A.** B duplica ownership e cria hubs rejeitados pelo PA §3/§5; C viola C028/C030/L022; D divide a coordenação (PA §2/§3, L003). A preserva AR-01–09 e cobre todas as jornadas sem destino novo. | J-01–J-21 sem destino adicional (§21); inventário e testes de necessidade §3. |
| ALT-UX-02 | Lógica de composição do Hoje | **A** composição por prioridade funcional (P0–P4 do PA §4) em espaços ordenados com teste de relevância; **B** feed cronológico de eventos/cartões; **C** painel do dia com todas as métricas e o plano completo; **D** Plano como entrada principal, sem Hoje. | **A.** B gera catálogo e “adaptive theater” e enterra a decisão; C recria o dashboard de recovery/readiness e sobrecarrega (PA §2/§4); D contraria C029. | HOJ-C01–C24 (§7.3); J-02/J-05/J-08. |
| ALT-UX-03 | Camadas de manifestação da adaptação | **A** níveis MAN-0…MAN-4 derivados exclusivamente do resultado oficial (B0/policy gate) e do alcance; **B** mostrar toda recomputação como adaptação; **C** aplicar mudanças com destaque mínimo e só sinalizar HOLD/erro. | **A.** B produz ruído, percepção de flip-flop e notificações de microajuste; C viola DR-63 (sem mutação silenciosa) e C034. | §10.3; J-02, J-09, AESL S32/Q04. |
| ALT-UX-04 | Modos de execução | **A** três caminhos sobre a mesma sessão/revisão: execução guiada no app, execução no relógio via export quando a rota estiver comprovada, e “registrar depois”; **B** somente app; **C** relógio primeiro, app só prepara. | **A.** B abandona o closed loop (C040); C torna valor dependente de wearable (L009, C028) e sem prova G06; Strength é app-first por contrato (RS §2). | J-01, J-03, J-04; RUN-06/07, STR-03. |
| ALT-UX-05 | Onde vive uma proposta/pergunta pendente | **A** no objeto Decisão (SURF-06), selecionada pelo Hoje e por aviso; **B** caixa de entrada/central de decisões como destino; **C** interrupção modal ao abrir o app. | **A.** B cria destino para objeto transitório (equivalente a hub HOLD); C só é admissível para P0 (segurança no escopo da sessão em curso/iminente, AR-05). | J-08, J-09; NAV-04. |
| ALT-UX-06 | Onboarding | **A** mínimo necessário para a primeira decisão + aprendizado progressivo; **B** questionário completo de entrada (anamnese); **C** sem onboarding, com defaults. | **A.** B coleta além do necessário (DR-32, AEC §2, G04); C exigiria defaults fisiológicos proibidos (AEOS §1/§6). | J-01; ONB-01–ONB-16. |
| ALT-UX-07 | Prioridade Run × Strength | Run-first, Strength-first ou Balanced/HYBRID declarados, objetivos concretos e trade-offs; unknown honesto. | C049/AEOS§6: Balanced tem coprioridades reais, sem dose igual/50-50; preferência decisiva ausente gera ASK, não runner-first. | ONB-06/07; FZ-S06 |
| ALT-UX-08 | Canal conversacional | Diferir conversa da primeira V1, sem tab/hub/agentes; explicação determinística e caminhos diretos. | C032/DR85: não deixar inclusão de chat bloquear UI. Contrato futuro permanece sob gates específicos. | F01–F07/F10/F11 funcionam sem conversa. |

## 3. Inventário de superfícies

Regras gerais: (a) uma superfície existe somente se possui um objeto canônico ou responde a uma pergunta recorrente que nenhum dono responde sozinho (teste de necessidade); (b) entidades do PDM **não** viram superfícies por existirem; (c) momentos transitórios são **fluxos** (FLOW-) sobre o destino dono — cancelar não tem efeito, concluir devolve ao ponto de origem com estado atualizado; (d) nenhuma superfície fixa layout, tabbar, número de telas ou componentes (PA §2, D009).

### 3.1 Destinos lógicos (PA §2)

**SURF-01 Hoje** — *Propósito:* responder em segundos às seis perguntas do §7.1. *Possui:* nenhum objeto (AR-01); nenhuma tarefa vive só aqui. *Seleciona:* sessão(ões) da janela atual/próxima; decisão vigente e propostas, ASK, HOLD ou RECONCILE que afetam a próxima ação; insight elegível e status de export da próxima sessão; registro do dia e **contexto do dia (OBJ-08) como entrada disponível**; sessão em execução; marco próprio elegível (OBJ-23). *Entradas:* abertura do app (padrão, salvo sessão em execução — NAV-02), retorno de outros destinos, aviso sem objeto específico. *Saídas:* cada item abre o objeto canônico ou um FLOW sobre ele. *Ações primárias:* iniciar a sessão do dia; relatar como está ou uma limitação antes de iniciar (HOJ-R7); abrir/confirmar proposta (FLOW-02); responder pergunta (FLOW-03); confirmar descanso; fechar sessão recente; registrar atividade não planejada; abrir “por quê”. *Estados:* HOJ-C01–C24. *Não pode:* copiar plano/contexto; virar feed ou catálogo; mostrar estado de outra pessoa; exibir métrica como mérito; exigir Crew, wearable ou conversa; esconder incerteza/erro que muda a ação; exibir checklist de incompletude. *Necessidade:* C029 exige entrada contextual; nenhum dono isolado responde às seis perguntas sem misturar objetos → existe sem ownership.

**SURF-02 Plano** — *Propósito:* o previsto e como preparo/executo; linha do tempo integrada do horizonte vigente com as duas modalidades, descanso/recuperação e revisões. *Possui:* plano/decisões/revisões, aplicabilidade/HOLD e projeção do trace (via SURF-06); sessão planejada (via SURF-07); registro do dia e contexto do dia (recovery autodeclarado);  interrupção/retorno (PA §3). *Seleciona:* insights de preparação e status de export, pela sessão. *Entradas:* referência estável; Hoje; aviso de decisão; Progresso (“ver no plano”); fim do onboarding. *Saídas:* SURF-06, SURF-07, FLOW-02/03/04/05/14. *Ações primárias:* ver semana/horizonte; abrir sessão; editar (FLOW-04); registrar contexto do dia; interromper/retomar; revisar propostas; adotar plano inicial ou continuação de horizonte (INT-02). *Estados:* vigente (inclusive com a continuação proposta antes do fim do horizonte, CONF-15); sem plano (antes da adoção, ou, como exceção DEG-31, horizonte encerrado sem continuação adotada); interrompido; retornando; com proposta pendente; com escopo retido; offline (estado guardado, marcado como possivelmente desatualizado). *Não pode:* manter um plano por modalidade; esconder revisões; aplicar mudança sem prévia; apresentar outra modalidade importada como esporte suportado (C042). *Necessidade:* dono canônico do plano (PA §3); colocá-lo no Hoje foi rejeitado (PA §2/§4).

**SURF-03 Progresso** — Dono do histórico, PR/marcos e analytics próprios. L1 Orientation no cotidiano mostra poucos sinais sustentados, sem dashboard; L2 aqui permite Running, Strength, Overall/Multisport; L3 deep dive descobre detalhes, comparabilidade, períodos/ciclos e fonte/limites. Running: volume/frequência/pace/RPE/FC/zonas/intensidade/longão/sessão-chave/aderência/capacidade/carga/tendências/histórico/resposta; Strength: séries/reps/carga/volume/RIR/RPE/PR/progressão/grupo muscular/frequência/exercício/tendência/recuperação/aderência/histórico; Overall: distribuição/consistência, exposição combinada sem unidade universal, relações/interferência e recuperação/aderência híbrida. Só quando dados/método sustentarem; unknown, estimativa e fato distintos, sem causalidade inferida. PR pode ser fato elegível, nunca mérito por volume. Entradas Hoje/Week/pós-treino; sessões/observações e correção mantêm mesma referência; share próprio por FLOW-10. Sem social, mais tabs secundárias ou dashboard imposto.

**SURF-04 Crews — DEFERRED, NOT REJECTED.** ID reservado à expansão futura. Não criar tab, entrada, estado vazio, CTA de convite ou rota social na V1.

**SURF-05 Você** — *Propósito:* meu contexto e minhas permissões. *Possui (por seção):* SURF-11, SURF-12, SURF-13; conta, idioma, unidades e preferências de aviso. *Entradas:* referência estável; atalhos “corrigir contexto/permissão” vindos de qualquer objeto (abrem o mesmo objeto). *Saídas:* FLOW-07, FLOW-15, direitos. *Ações primárias:* editar contexto; conectar/desconectar fontes; gerir consentimentos; exercer direitos; adotar/deixar experiência pessoal e gerir assinatura (SURF-14), sem modo social. *Não pode:* abrigar plano/sessões, dados de terceiros ou mover referências por personalização. *Necessidade:* dono de contexto, permissões e direitos (PA §3).

### 3.2 Superfícies de detalhe de objeto canônico

**SURF-06 Decisão** (Plano → detalhe da decisão) — *Propósito:* o que foi decidido, o que mudou, por quê, o que foi preservado, alternativas válidas, confiança/limites, retenções, perguntas, reconciliações e revisões anteriores. *Possui:* decisão/revisão do plano, aplicabilidade/HOLD (causa privada mínima, escopo, próximo passo, owner, evidência de saída) e projeção aprovada do trace (PA §3, AEOS §13). *Entradas:* Plano, Hoje, aviso. *Saídas:* FLOW-02, FLOW-03, FLOW-08, FLOW-09, SURF-07 (sessões afetadas), SURF-11 (corrigir contexto). *Ações:* confirmar, recusar/manter original, escolher alternativa válida, responder, reportar contexto incorreto, contestar, ver revisões. *Estados:* ST-DEC, ST-HOLD, ST-CNF, ST-ASK (§5). *Não pode:* mostrar ranking ou rota JEV, raciocínio interno, candidatos rejeitados com payload, diagnóstico; oferecer “liberar” retenção por aceite/override. *Necessidade:* explicação completa e ato de confirmação precisam de um lugar estável no objeto dono; Hoje só resume (EXP-02 nível N1).

**SURF-07 Sessão** (facetas planejada · preparação · envio/versões · realizado) — *Propósito:* intenção, estrutura e alvos; equipamento e insight elegível; modo de execução; realizado versus planejado com fontes e associação; versões e exports. *Possui:* referência única da sessão e revisões, export/diferenças/recibos, observações associadas (PA §3). *Seleciona:* insight da preparação, decisão de origem e propostas/perguntas pendentes que afetam esta sessão, com acesso a FLOW-02/03 (CONF-16). *Entradas:* Plano, Hoje, Progresso, aviso de export/associação. *Saídas:* SURF-08/09 (iniciar), FLOW-06 (enviar), FLOW-05 (registrar depois/corrigir), FLOW-08 (associar), SURF-06 (por quê). *Ações:* relatar como está ou uma limitação antes de iniciar (HOJ-R7); iniciar; enviar ao relógio; registrar depois; marcar como não realizada (janela corrente ou passada; para sessão futura, “não farei” é edição em FLOW-04 — AG-04); corrigir; repetir (só a partir do realizado, AR-04). *Estados:* ST-SES, ST-EXP, ST-OBS, ST-NUT e sobreposições de HOLD e de proposta/pergunta pendente. *Não pode:* misturar linguagens das modalidades; dizer “no relógio” sem prova de device; guiar revisão retida; reescrever o realizado quando o plano muda. *Necessidade:* objeto canônico da sessão; toda entrada aponta para ele.

**SURF-08 Execução Running** e **SURF-09 Execução Strength** (facetas de execução da Sessão) — *Propósito:* guiar e registrar a sessão em curso com controles próprios da modalidade (RUN-06, STR-03). *Possui:* nenhum objeto novo; grava observações da sessão com a revisão executada fixada (AEOS §5). *Entradas:* iniciar em SURF-07 ou Hoje; reabrir o app com sessão ativa (NAV-02). *Saídas:* conclusão → fechamento (FLOW-05) → faceta realizada; pausa; encerrar parcial. *Ações:* Running — iniciar, pausar/retomar, avançar etapa, encerrar; Strength — registrar série, corrigir, descanso entre séries, substituir por alternativa aprovada, executar exercícios em outra ordem (STR-14), ver o realizado anterior do exercício (STR-13), encerrar. *Estados:* pronta, em execução, pausada, concluída completa/parcial; “em aberto” pelos gatilhos de ST-SES; proposta de mudança do restante pendente (CONF-07); retenção nova no escopo (P0). *Não pode:* alterar o que já foi feito; trocar o restante sem aceite; exigir conversa; prometer medição sem capacidade técnica confirmada (`[DEP-G09]`, UPSTREAM-ISSUE-01). *Necessidade:* execução exige controles estáveis por toda a sessão (C030, PA §4 P0); não cabe em Hoje nem em fluxo transitório. São facetas, não destinos.

**SURF-10 Espaço da Crew — DEFERRED.** Nenhuma superfície V1; escopo anterior preservado no Git, sem placeholder visual.

**SURF-11 Meu contexto** (Você) — *Propósito:* objetivos e prioridade, trade-offs guardados, experiência, disponibilidade/agenda, equipamento, limitações voluntárias, preferências que afetam o plano (ordem preferida de sessões quando o plano permitir); unidades de exibição pertencem a SURF-05. *Possui:* Athlete Context declarado. *Entradas:* Você; atalhos “corrigir” de decisões/perguntas. *Saídas:* FLOW-02 quando a edição altera o plano (prévia de alcance). *Ações:* editar com confirmação; ver o que cada item influencia (FAC-); atualizar limitação — “foi registro incorreto” (correção) é distinto de “mudou” (atualização reavaliada por policy; restrição clínica exige resolução competente, AEC §7.1, `[DEP-G04]`). *Não pode:* anamnese/prontuário, campos obrigatórios além do mínimo, inferência sensível. *Necessidade:* dono do contexto estável.

**SURF-12 Integrações** (Você) — *Propósito:* conexões, finalidades locais separadas, capacidade por rota em nível de prova, estado de ingestão, janelas de histórico e lacunas, desconectar/revogar (WEA-). *Possui:* Wearable Connection, capacidades, permissões. *Entradas:* Você; aviso de falha material; sessão (enviar sem conexão); oferta opcional pós-onboarding. *Saídas:* FLOW-07, FLOW-15. *Não pode:* lista de workouts (hub de relógio), promessa de marca, “compatível” booleano. *Necessidade:* dono das conexões; export continua na sessão (PA §3).

**SURF-13 Privacidade** (Você) — Consentimentos/finalidades, read/write/sensores/share separados, I10 secundário OFF, projeções externas mínimas e direitos de acessar/exportar/corrigir/revogar/eliminar/encerrar. Histórico próprio, direitos e registro em curso independem de conversão/assinatura; ações destrutivas explícitas, método de identidade/reautenticação G08/G09. Nenhuma permissão por Crew na V1. Cancelar assinatura não equivale a apagar conta, nem apagar conta implica recall externo.

**SURF-14 Assinatura / Paywall** — Fluxo contextual após demonstração de valor e referência de gestão em Você; dono do estado comercial/entitlement/oferta, não novo destino primário. Trial/mensal/anual/price/timing slots testáveis. **Preço provisório (Founder, 2026-10-20):** anual R$ 199,90/ano (≈ R$ 16,66/mês) e mensal R$ 59,90/mês; duração do teste e texto de termos/renovação continuam slots; testes de preço seguem permitidos. Pendente/erro/restaurada/ativa/expirada/cancelada/unknown com prova e saída. Não adota plano, concede consentimento, limpa HOLD ou interrompe fechamento/registro de sessão em curso; não usa urgência clínica para vender.

### 3.3 Fluxos transitórios sobre destinos

Nenhum fluxo é destino: não tem referência estável própria, não possui objeto e termina devolvendo ao objeto dono. Teste de necessidade comum: “o momento precisa de foco, prévia ou consentimento próprios, mas o objeto já tem dono” → fluxo.

| ID | Fluxo | Sobre (dono) | Entradas | Conclusão / cancelar |
|---|---|---|---|---|
| FLOW-01 | Onboarding/Athlete Model/primeira semana | Entrada → Plano/Week → FLOW-17 → adoção → Hoje | primeira abertura/retomada | Objetivos/prioridade/experiência/agenda/equipamento/contexto mínimo; prévia de coordenação e limite; valor antes de hard ask. |
| FLOW-02 | Prévia e confirmação de alcance (CONF-) | SURF-06 | proposta no Hoje/Plano/aviso; edição manual; escolha de alternativa; desfazer | Confirmar aplica sobre a versão corrente; recusar mantém o vigente somente enquanto válido; obsolescência mostra a avaliação atual. Cancelar = sem efeito. |
| FLOW-03 | Pergunta mínima (ASK-) | SURF-06 (fato resultante vai para SURF-11 ou contexto do dia) | Hoje, decisão, aviso “precisa de você” | Resposta, “não sei” ou “prefiro não dizer” → reavaliação. Fechar sem responder = escopo segue indeterminado, sem nova insistência. |
| FLOW-04 | Edição manual do plano | SURF-02/SURF-07 | Plano, sessão, contexto do dia | Prévia avalia a edição pelos mesmos gates; confirma ou explica bloqueio e oferece alternativas válidas (AG-04). |
| FLOW-05 | Registrar e corrigir | SURF-07 / SURF-02 | fim de execução; “registrar depois”; atividade não planejada; confirmar descanso; contexto do dia ou limitação antes de iniciar (HOJ-R7); marcar não realizada na janela corrente/passada; corrigir série/resultado | Grava no objeto próprio; correção cria revisão rastreável e readapta derivados. Sem confirmação por série (EM §3). |
| FLOW-06 | Preflight e envio de workout (WEA-) | SURF-07 | ação “enviar”; substituição/cancelamento de cópia remota | Relatório de diferenças → envio explícito ou recusa com app. Cancelar = nada entra em fila. |
| FLOW-07 | Conectar e definir finalidades | SURF-12 | Você; oferta pós-onboarding; tentativa de enviar sem conexão | Conexão por finalidade com limite real da rota; recusar mantém app/registro manual sem penalidade. |
| FLOW-08 | Associar / reconciliar | SURF-07 (observação) | item “fechar o que aconteceu”; RECONCILE; Progresso | “Mesma atividade” / “atividades diferentes” / “não sei agora”. “Diferentes” fica registrado como `UNASSOCIATED` confirmado pela pessoa, e o mesmo par não é proposto de novo sem fato novo. Sem associação inventada; ambiguidade limita só o dependente. |
| FLOW-09 | Corrigir ou contestar retenção (HOLD) | SURF-06 | retenção no Hoje/decisão/sessão | Correção de dado incorreto ou pedido ao owner. Owner interno (correção pela própria pessoa, Engineering): estado de revisão real. Owner externo (profissional): mostra que evidência seria aceita e que o mecanismo está pendente `[DEP-G04]`, nunca “em revisão”. Nunca liberação por aceite/tempo/override (AEC §7.1). |
| FLOW-10 | Compor share próprio (SHR-) | objeto próprio de origem (Progresso/Sessão) | ação no próprio marco/resultado elegível | Prévia exata + aviso de cópia externa sem recall garantido → projetar ou cancelar sem efeito. Registro mínimo em SURF-13. |
| FLOW-11 | DEFERRED fora da V1 | — | Crew/entrada social/conversa futura | Não materializar fluxo ou placeholder. |
| FLOW-12 | DEFERRED fora da V1 | — | Crew/entrada social/conversa futura | Não materializar fluxo ou placeholder. |
| FLOW-13 | DEFERRED fora da V1 | — | Crew/entrada social/conversa futura | Não materializar fluxo ou placeholder. |
| FLOW-14 | Interromper/retomar | Plano/Hoje | escolha pessoal/período passado | Sem motivo ou ação social; RETURN rebaseado e confirmado. Pausa retroativa só anotação do passado, sem prescrever de volta ou apagar realizado. |
| FLOW-15 | Consentir / revogar por finalidade | SURF-13 (e ponto de uso) | primeiro uso pessoal, integração, share, I10 | Mostra finalidade, destinatários, alcance, persistência e efeito da revogação; registra idioma e versão do texto (SEC-J3-06). |
| FLOW-16 | DEFERRED fora da V1 | — | Crew/entrada social/conversa futura | Não materializar fluxo ou placeholder. |
| FLOW-17 | Valor → oferta/trial/assinatura → adoção/treino | Week/valor → SURF-14 → Plano/Hoje | primeiro valor ou gerir/restaurar | Oferta clara, estado real, atos separados; cancelar volta ao valor/contexto/dados, sem cobrar nesta fase documental. |

### 3.4 Superfícies rejeitadas

| ID | Superfície rejeitada | Razão | Onde a necessidade é atendida |
|---|---|---|---|
| SURF-X-01 | Aba/hub Nutrition, diário alimentar, galeria de dicas | C006/C039, AR-07, PA §3/§5 | Preparação da sessão e Hoje S4 (NUT-). |
| SURF-X-02 | Hub HOLD / central de segurança | PA §3/§5 (“sem destino HOLD”) | Retenção no objeto Decisão/Sessão (AG-09, FLOW-09). |
| SURF-X-03 | Hub de relógio/wearable com lista de workouts; destino por vendor | AR-08 | Conexão em SURF-12; export na sessão (WEA-). |
| SURF-X-04 | Home/aba do agente, chat como entrada principal | L022, C028/C030, PA §6/Scope §3 | Caminhos diretos e explicação no objeto; conversa inteira deferred na V1. |
| SURF-X-05 | Dashboard de recovery/readiness, score de prontidão | D003, AR-07, DR-31/66 | Recovery como fator da decisão e contexto do dia; tendência sob demanda em Progresso só com policy. |
| SURF-X-06 | Social/convites/placar interno OUT V1 | C041/Scope§3 | External Shareability própria sem rede; expansão privada futura só após validação. |
| SURF-X-07 | Social/convites/placar interno OUT V1 | C041/Scope§3 | External Shareability própria sem rede; expansão privada futura só após validação. |
| SURF-X-08 | Social/convites/placar interno OUT V1 | C041/Scope§3 | External Shareability própria sem rede; expansão privada futura só após validação. |
| SURF-X-09 | Hubs por esporte (Running / Strength) | PA §2/§3, L003 | Profundidade por modalidade na Sessão e em Progresso. |
| SURF-X-10 | Central de notificações / caixa de decisões como destino | ALT-UX-05 | Pendências no objeto e em Hoje S3; avisos com deep link (NOT-). |
| SURF-X-11 | Visualizador de trace/auditoria | AEOS §13 (trace é auditoria interna) | Projeção aprovada na decisão (EXP-02 N3). |
| SURF-X-12 | Calendário separado do Plano | Duplicaria plano/agenda | Janelas no Plano; disponibilidade em SURF-11. |
| SURF-X-13 | Galeria de shareables | AR-15 (share não é destino/feed/galeria) | Composição a partir do objeto de origem (FLOW-10). |
| SURF-X-14 | “Relay” (revezamento/sequência coletiva) ou qualquer conceito social fora de C041 | Não existe no Canon; C005 lista possibilidades futuras sem V1 | Nenhuma; escopo inteiro Crew deferred (Scope §3). |

## 4. Modelo de navegação

| ID | Regra | Fonte |
|---|---|---|
| NAV-01 | Referências estáveis Hoje/Plano/Progresso/Você, sem Crew. Lugar/rótulo não mudam por personalização; forma de navegação é design space. | PA§2; C035 |
| NAV-02 | **Entrada.** Abrir o app leva ao Hoje. Exceção P0: com sessão em execução ou pausada, enquanto não ocorre um gatilho de “em aberto” (ST-SES), abrir leva à faceta de execução, com o Hoje a um passo. Fim de onboarding leva ao Hoje com o plano adotado. | C029, PA §4 |
| NAV-03 | **Voltar.** Voltar restaura contexto da tarefa e estado persistido sem duplicar/reiniciar sessão; no fluxo, cancela o passo sem efeito. Sem histórico (deep link), volta ao destino dono (decisão/sessão → Plano; conexão/assinatura/privacidade → Você; marco → Progresso), nunca fecha o app no meio da tarefa. | EM §4; PA §2/3 |
| NAV-04 | **Deep link de aviso.** Abre objeto canônico (decisão, sessão, conexão), sem cópia. Proposta substituída/expirada abre decisão vigente com indicação de obsolescência; objeto removido ou acesso indisponível abre o destino dono com resultado neutro, sem resíduo privado. Não há link de Crew/convite/interação social V1. | AEC §3.5; PA §3/6 |
| NAV-05 | **Itens selecionados.** Itens do Hoje e do Progresso abrem o objeto no contexto do dono (a pessoa sabe que está “no Plano”); ações feitas ali refletem em todas as entradas imediatamente. | AR-03, C033 |
| NAV-06 | **Execução persistente.** Durante uma sessão, navegar para outros destinos não pausa nem encerra a sessão; há retorno persistente à execução (forma é design space) e nenhum registro se perde. Sair do app preserva o estado local. | C030, AR-09 |
| NAV-07 | **Fluxos.** Fluxos sobrepõem dono; concluir devolve origem atualizada; cancelar/fechar sem efeito. Retenção nova P0 encerra sem efeito somente fluxo dependente (FLOW-02/04/06); origem mostra estado. FLOW-05/08/09/10/15 preservam conteúdo informado, bloqueando somente parte dependente; FLOW-17 respeita fronteira comercial e não limpa HOLD. Conflito de versão segue STALE (CONF-02/12). FLOW-12/16 são deferred, sem entrada V1. | DR-63; AEOS §13/§13.1; AR-05 |
| NAV-08 | V1 pessoal; M2/M3/entrada social diferidos. Subscription/entitlement é estado comercial próprio, não modo fisiológico/social ou consentimento. Prévia de valor precede hard ask preferencial; direitos e registro em curso preservados. | C041/C053; PA§8 |
| NAV-09 | **Primeiro uso.** FLOW-01 → Hoje. Onboarding incompleto: Hoje mostra uma única ação “completar o mínimo para a primeira decisão” e permite registrar atividade; demais destinos acessíveis em estado vazio, sem rótulo de falha. | EM §5, F01 |
| NAV-10 | **Conversa — DEFERRED.** Contrato reservado à expansão futura; sem entrada contextual/global, ação preparada ou tarefa V1. Quando autorizada, segue fluxos/objetos/guardas canônicos e não altera consentimento. Controles diretos permanecem. | C032; Scope §3; CONF-13 |
| NAV-11 | **Offline.** Todos os destinos abrem com o último estado guardado; o que depende de dado remoto mostra o momento da última atualização conhecida e não parece atualizado; ações que exigem efeito remoto ficam pendentes e visíveis (DEG-17); atos que dependem de avaliação ou commit seguem CONF-17. | AR-09, EM §5, AEC §5.3 |
| NAV-12 | **Links entre domínios.** De um fator na explicação pode-se abrir o objeto que o originou (contexto, observação, sessão relacionada) para ver ou corrigir; o retorno volta à explicação. | C034, AG-07 |

## 5. Modelo objeto / ação / estado (nível UX)

### 5.1 Objetos, dono e ações

Os objetos são os do PDM §3/§5; esta tabela só fixa onde vivem na experiência e o que a pessoa pode fazer. Nenhum objeto ganha nova autoridade.

| ID | Objeto | Dono UX | Ações da pessoa | Estados | Upstream |
|---|---|---|---|---|---|
| OBJ-01 | Plano integrado / revisão | SURF-02 | ver horizonte; adotar plano inicial ou continuação; editar (FLOW-04); interromper/retomar | ST-PLAN | PDM §3/§5; AEOS §13 |
| OBJ-02 | Decisão / proposta | SURF-06 | confirmar; recusar/manter original; escolher alternativa válida; desfazer; ver revisões | ST-DEC | AEOS §8/§13; DR-63 |
| OBJ-03 | Retenção (HOLD) | SURF-06, sobreposta à sessão afetada | ver escopo, próximo passo e quem resolve; corrigir; contestar; registrar o que fez | ST-HOLD | AEC §7.1; AEOS §9 |
| OBJ-04 | Pergunta mínima (ASK) | SURF-06 | responder; “não sei”; “prefiro não dizer” | ST-ASK | AEOS §10; AEC §2.2 |
| OBJ-05 | Sessão (referência única) | SURF-07 | iniciar; enviar; registrar depois; marcar não realizada; corrigir; repetir a partir do realizado | ST-SES | PDM §5; AEOS §5 |
| OBJ-06 | Observação / associação | SURF-07 | confirmar ou rejeitar associação; corrigir; eliminar registro próprio | ST-OBS | PDM §5; AEOS §3 |
| OBJ-07 | Desfecho do dia / descanso | SURF-02 (janela) | confirmar descanso ou recuperação; registrar desfecho | ST-REST | PDM §5; I3 |
| OBJ-08 | Contexto do dia (recovery autodeclarado e limitação relatada) | SURF-02 → contexto do dia; entradas no Hoje S2 e na preparação da Sessão (HOJ-R7) | declarar, corrigir ou pular | ST-CNF (sinal) | PA §3; AEC §2/§7.1 |
| OBJ-09 | Athlete Context estável | SURF-11 | editar com prévia de alcance | revisões | PDM §3; AEOS §4/§6 |
| OBJ-10 | Insight Nutrition | SURF-07 (preparação) | ler; reconhecer; dispensar; dar contexto voluntário; recusar | ST-NUT | PDM §5; AEC §6 |
| OBJ-11 | Conexão wearable | SURF-12 | conectar; escolher finalidades; desconectar; revogar | ST-CONN | PDM §5; AEC §5.1 |
| OBJ-12 | Export (cópia/intenção) | SURF-07 → envio e versões | enviar; substituir; cancelar cópia remota; conferir | ST-EXP | PDM §5; AEC §5.3 |
| OBJ-13 | Continuidade / interrupção / retorno | SURF-02 | interromper; retomar | ST-CTN | AEOS §4; PDM §5 |
| OBJ-14 | Entidade social DEFERRED | Fora da V1 | Sem ações/telas/placeholder | — | C041; PDM§1/§5 |
| OBJ-15 | Entidade social DEFERRED | Fora da V1 | Sem ações/telas/placeholder | — | C041; PDM§1/§5 |
| OBJ-16 | Entidade social DEFERRED | Fora da V1 | Sem ações/telas/placeholder | — | C041; PDM§1/§5 |
| OBJ-17 | Entidade social DEFERRED | Fora da V1 | Sem ações/telas/placeholder | — | C041; PDM§1/§5 |
| OBJ-18 | Entidade social DEFERRED | Fora da V1 | Sem ações/telas/placeholder | — | C041; PDM§1/§5 |
| OBJ-19 | Entidade social DEFERRED | Fora da V1 | Sem ações/telas/placeholder | — | C041; PDM§1/§5 |
| OBJ-20 | Shareable | FLOW-10; registro em SURF-13 | preparar; projetar; cancelar; impedir futuras projeções | ST-SHR | PDM §5; AR-15 |
| OBJ-21 | Consentimento | SURF-13 | conceder; recusar; revogar | ST-CONS | PDM I6/I10 |
| OBJ-22 | Confiança (atributo da decisão) | SURF-06 | ver; corrigir a fonte | ST-CNF | AEC §2.1; AEOS §11 |
| OBJ-23 | Marco próprio | SURF-03; Hoje S8 quando elegível | ver; dispensar; compartilhar (FLOW-10) | ST-MAR | PA §3; C018; L019/L020 |

| OBJ-24 | Oferta/entitlement/subscription | SURF-14 / Você | ver oferta/assinar/cancelar/restaurar/gerir | ST-SUB | PDM I14 / C053 |

### 5.2 Famílias de estado e saídas

Toda linha tem saída (PR-10). Rótulos são funcionais.

**ST-DEC — decisão/proposta** (AEOS §13): `EVALUATING`/`PREPARED` — invisível; nenhum indicador de “IA pensando”, salvo quando a própria pessoa pediu uma prévia (edição) e aguarda o alcance. `PRESENTED` “proposta” — o vigente continua valendo; saídas: confirmar, recusar, escolher alternativa, ou não responder (CONF-09). `ACCEPTED` “confirmação registrada, aplicação pendente” — nunca exibida como aplicada antes do commit (CONF-17); se a guarda de autoridade falhar, vira `STALE` e a avaliação atual é mostrada sem efeito (AEOS §13.1). `APPLIED` “vigente, mudou em ‹momento›” — saídas: desfazer (AG-06), nova proposta. `STALE` “não vale mais” — mostra a avaliação atual e o motivo factual. `DECLINED` “recusada, plano mantido” — não reaparece sem fato material novo. `EXPIRED`/`CANCELLED` — histórico. `SUPERSEDED` “revisão anterior” — histórico com o que foi executado/exportado. `ASK`, `HOLD` e `RECONCILE` são resultados rastreáveis sem `APPLIED`.

**ST-PLAN — plano** (PDM §5): sem plano (antes da adoção; saída: FLOW-01/adotar) → vigente (revisões). Caminho normal: vigente com continuação proposta antes do fim do horizonte → nova revisão vigente ao ser adotada (CONF-15, INT-02). Exceção DEG-31: horizonte encerrado sem continuação adotada (saída: revisar/adotar; enquanto isso, registro e descanso seguem possíveis). Também: encerrado por interrupção (saída: retomar) → retornando (saída: proposta RETURN).

**ST-SES — sessão** (PDM §5, AEOS §5): planejada → pronta (revisão escolhida, preparação disponível) → em execução ↔ pausada → concluída completa | concluída parcial | **em aberto** (iniciada e não fechada; saída: fechar como parcial/completa ou retomar se a revisão ainda valer). **Gatilhos de “em aberto”** (eventos, sem limiar): fim da janela/validade da revisão executada, início de outra sessão, ou ato explícito de sair da execução sem encerrar (navegar para outro destino não conta, NAV-06); a partir daí NAV-02 e HOJ-S1 deixam de valer para ela, os registros feitos são preservados e qualquer medição em curso para (RUN-13). Também: não realizada (declarada; sem rótulo de falha), **aguardando dados de ‹fonte›** (somente com evidência da integração: export desta sessão em WEA-L3–L5, ingestão da rota “aguardando/atrasada” em WEA-04, ou declaração da pessoa de que executou no relógio; saídas: registrar manualmente, aguardar), **sem registro** (janela passou sem dado, evidência nem declaração = desconhecido, nunca “perdida”; saídas: registrar depois, marcar não realizada), não planejada (observada sem plano), **retida** (sobreposição HOLD; saídas em ST-HOLD), revisão anterior (substituída antes de executar). Comparação abaixo/igual/acima só com regra `[DEP-G03]`; sem regra, `UNCLASSIFIED` com realizado preservado.

**ST-OBS — observação** (AEOS §3): recebida/pendente → `MATCH_PROPOSED` “parece ser a sessão X” (saída: confirmar, “são diferentes”, “não sei agora”) → `CONFIRMED` | `UNASSOCIATED` (registro independente, válido; quando a pessoa disse “são diferentes”, o mesmo par não volta a ser proposto sem fato novo) | `AMBIGUOUS` (limita só o dependente; saída: FLOW-08). Duplicata reconhecida (uma carga, fontes visíveis no detalhe). Corrigida/suplantada (revisão rastreável). Suprimida/eliminada (não reaparece por reenvio; invisível). Conflito (privado; saída: FLOW-08 ou correção pela origem).

**ST-REST — descanso/recuperação** (PDM §5): honrado (confirmação ou evidência compatível) | desconhecido (sem confirmação; saída: confirmar quando quiser; nunca falha; confirmação tardia não envia check-in).

**ST-HOLD — retenção** (AEOS §9 `HoldRecord`): `ACTIVE` “retida” (escopo, categoria privada da causa, próximo passo, quem resolve, evidência de saída) → `REVIEW_PENDING` (owner interno: “em revisão”; owner externo profissional: “o que seria aceito como evidência” e mecanismo pendente `[DEP-G04]`, nunca “em revisão”) → `REEVALUATION_REQUIRED` “reavaliando com a informação nova” → `RELEASED` “nova decisão disponível” (somente por evidência aceita + reavaliação) | `SUPERSEDED`. Saídas permanentes: corrigir dado incorreto, contestar, registrar o que fez, usar funções não afetadas (AR-05).

**ST-ASK — pergunta** (AEOS §10): aberta → respondida | “não sei” | “prefiro não dizer” (ambas = desconhecido, sem pressão) | obsoleta (fato mudou; some sem efeito). Fechar sem responder mantém o escopo indeterminado, sem nova insistência (ASK-06).

**ST-CNF — confiança** (AEOS §11): flags simultâneas `SUFFICIENT`/`PARTIAL`/`CONFLICTING`/`STALE`/`ABSENT` por decisão/escopo + `comparison_status` `SUPPORTED`/`UNDERDETERMINED`/`NOT_EVALUABLE`. Apresentação em §12. Nunca vira score ou selo de segurança.

**ST-CTN — continuidade** (AEOS §4 `continuity_state`): `ACTIVE` | `NO_DATA` “sem dados recentes” (neutro, sem abandono inferido; saídas: registrar, conectar, registrar o período como pausa sem motivo, nada — retorno em HOJ-C23/J-21; o registro retroativo, feito em FLOW-14 no modo período passado sobre OBJ-13, só anota o intervalo como pausa declarada no histórico e no contexto do motor: não cria `INTERRUPTED_DECLARED` corrente, não encerra o vigente, não oferece pausa de Crew nem exige `RETURNING`; a reavaliação segue §10, com eventual RETURN/REPLAN como MAN-3, e decisões passadas não mudam — EXP-07) | `INTERRUPTED_DECLARED` “em pausa por escolha sua” (saída: retomar) | `RETURNING` (saída: primeira janela sob proposta RETURN).

**ST-NUT — insight** (PDM §5, AEC §6): provisório (conteúdo sem aprovação G05; não publicado à pessoa) | elegível → exibido → reconhecido | dispensado; contexto necessário (saída: responder, recusar = desconhecido); omitido (nada exibido); encaminhamento (somente com conteúdo aprovado `[DEP-G05]`); retido; obsoleto (demanda mudou; retirado com explicação curta quando já tinha sido exibido).

**ST-CONN — conexão** (PDM §5): não conectada | autorização parcial | ativa | indisponível (outage/atraso do provider) | permissão revogada (só quando a rota expõe a revogação; leitura opaca segue WEA-05) | desconectada; por finalidade local (WEA-02). Saídas: conectar, conceder/revogar finalidade, reconectar, desconectar.

**ST-EXP — export:** escada completa em WEA-L (§14.2).

**ST-SHR — output próprio externo:** elegível→prévia privada atual→ato explícito→cópia preparada/compartilhada ou cancelada/falha/unknown conforme prova. Abrir share sheet não prova post. Corrigir fonte invalida prévia; cópia antiga não tem recall garantido. ST-CRW/ST-VIN/ST-COMP/ST-INV/ST-CHK são DEFERRED, sem fluxo/estado V1.

**ST-CONS — consentimento** (PDM I6/I10): não solicitado | concedido (com idioma e versão do texto, SEC-J3-06) | recusado | revogado. Revogar mostra o efeito e cessa usos/filas futuros da finalidade (FLOW-15).

**ST-MAR — marcos/PR/evolução próprios:** elegíveis quando fato/critério/comparabilidade sustentarem C054; visto/dispensado/compartilhado só por ato. Treino, prova, PR, milestone, semana, evolução, streak pessoal ou recap não significam mérito por volume. Derivado/estimado tem método e limite; unknown não produz conquista. Descanso/adaptação honrados podem sustentar continuidade, sem revelar causa. Fonte corrigida invalida prévia dependente; não apaga histórico/cópia já externa. Critérios exatos G02/G03, sem impedir UI dos estados.

**ST-SUB — acesso comercial:** ausente/preview, oferta/trial disponível conforme definição, ato pendente, verificada ativa/expirada/cancelada/revogada/desconhecida, erro/restauração. Fonte/versão/momento de prova identificados, sem ativar por clique/timeout. Nova prescrição sob entitlement válido; offline só no limite autorizado comprovável. Registrar/corrigir/fechar execução em curso, histórico e direitos não são bloqueados. Estados comerciais não são HOLD médico.

## 6. Onboarding e Athlete Model (FLOW-01)

### 6.1 Regras

| ID | Regra | Fonte |
|---|---|---|
| ONB-01 | **ASK ONLY WHAT CHANGES THE PLAN. ASK IT AT THE CHEAPEST APPROPRIATE MOMENT** (Founder, 2026-10-20). Pedir somente o necessário para a **primeira decisão integrada**; cada campo obrigatório tem consumidor nomeado (Athlete Model, Run/Strength Intelligence, Adaptive Engine ou elegibilidade); o restante é aprendido quando muda uma decisão. Sem anamnese, diário, exames ou macros. Dados físicos básicos seguem ONB-20. | DR-32, AEC §2, F01.3, ALT-UX-06 |
| ONB-02 | Idioma (PT-BR/EN) e unidades vêm do locale do sistema; **não são passo do onboarding** (Founder, 2026-10-20) e mudam em Perfil/Configurações. A folha de consentimento mostra o idioma vigente com troca no próprio lugar; o registro do consentimento guarda idioma e versão do texto. Idioma é configuração de produto, não input de prescrição. | DR-47, SEC-J3-06 |
| ONB-03 | 18+ antes da identidade pessoal; é **controle de elegibilidade**, não idade do Athlete Model (ONB-20) nem personalização esportiva; método/dados mínimos/retention G08/G07, resultado neutro sem perfil indevido ou dica de contorno. Não há entrada Crew na V1. | PDM§2; F01 |
| ONB-04 | Adotar experiência pessoal; sem bifurcação M3/social. Pular wearable/share/conversa não é perfil incompleto. | DR76; F01 |
| ONB-05 | Consentimento por finalidade apenas para o que o caminho escolhido usa agora: processamento do contexto de treino para recomendação (primário). Sinais de saúde/recovery, leitura/escrita wearable, medição da corrida pelo telefone (localização/sensores, condicional — RUN-13) e aprendizado secundário I10 são finalidades próprias pedidas no ponto de uso; I10 nasce desligado. Texto final `[DEP-G07]`. | PDM I6/I10, AEC §4, L014 |
| ONB-06 | Objetivos por modalidade, com tipo e janela/evento opcional; data incerta fica incerta. Ausência de objetivo numa modalidade é declarada, nunca inferida; o efeito no plano é policy. Catálogo de tipos de objetivo `[DEP-G01]`. | AEOS §6, RS §2 |
| ONB-07 | Prioridade em linguagem natural: corrida principal, força principal ou desenvolvimento sério dos dois (Balanced/HYBRID). Balanced grava coprioridades; não confundir com UNKNOWN/sem resposta. Objetivos concretos por esporte preservados; trade-off decisivo não acordado → ASK mínimo, sem default/pesos ocultos. Edição posterior confirmada. | C049; AEOS§6 |
| ONB-08 | Experiência e prática recente por modalidade em categorias declaradas `[DEP-G01]` `[DEP-G02]`. **Anos de experiência ≠ nível atual** (Founder, 2026-10-20): anos é sinal de cold start; o mínimo inclui sinal comportamental recente — Run: frequência atual e volume semanal aproximado (prova/resultado recente opcional, depois); Strength: frequência atual e consistência recente. Cargas/RM só quando houver consumidor no motor, por progressive onboarding. Desconhecido não recebe default: limitação explícita, ASK se decisivo, retenção do dependente se a resposta for recusada e a policy exigir. | AEC §2, AEOS §4 |
| ONB-09 | Disponibilidade e fuso: necessários para janelas do plano. Por dia, **multi-select** de manhã/tarde/noite; mais de uma janela no mesmo dia é válida e visível como seleção múltipla (Founder, 2026-10-20). Janela marcada = possível, **não obrigação**: o plano escolhe a distribuição por objetivo, prioridade, recuperação, interferência, sessões-chave, ONB-21 e estabilidade. Duração típica por sessão é um valor único na V1, com ajuste fino por dia depois em Você › Disponibilidade (SURF-11). Sem disponibilidade não há plano de janelas; o fluxo pede o mínimo, sem inventar agenda. Fuso vem do sistema. | AEC §2 |
| ONB-10 | Equipamento para Strength (onde treina, o que há): define o repertório elegível `[DEP-G01]`. Desconhecido → repertório limitado explicitado ou ASK. | RS §2, AEOS HC05 |
| ONB-11 | **Limitação atual**: uma pergunta voluntária e mínima (“há algo limitando seu treino agora?”) com “não”, “sim” (região/efeito funcional, privado) e “prefiro não dizer”. Sem diagnóstico, medicação ou exames; consentimento explícito de finalidade no momento da pergunta `[DEP-G07]`. “Sim” segue HC03: esclarecimento só se necessário e retenção apenas do dependente. Instrumento e copy `[DEP-G04]`. Recusa é desconhecido — não prova ausência de restrição. | AEC §2/§7, EM §3, AESL S07 |
| ONB-12 | Fora da cobertura validada: limite honesto/next step/HOLD dependente; registro/histórico/direitos continuam. Não alegar inaptidão nem plano pronto inexistente. | AEC§7; G01/G04 |
| ONB-13 | Plano inicial é proposta de semana coordenada, com summary Run×Strength/objetivo protegido/confiança/limites. Explicação simples de relação entre sessões (não copiar espaçamento universal). Ver/ajustar prévia, demonstrar valor, oferta FLOW-17, adoção explícita/revisão atual quando entitlement aplicável. Assinar não adota plano. | C052/C053; AEOS§10.2 initial |
| ONB-14 | Wearable é oferecido depois da adoção ou quando agrega a uma ação (enviar, importar), nunca como passo obrigatório nem como “perfil incompleto”. | L009, F01, EM §3 |
| ONB-15 | Interrupção do onboarding guarda o que foi confirmado; retomar continua do ponto; nada é inferido do abandono. | EM §5 |
| ONB-16 | Entrada social/M3 DEFERRED; nenhum passo ou tela V1. | C041 |
| ONB-17 | First Value / AHA: perceber a semana coordenada, não duas fichas justapostas. Prévia e razão factualmente suportadas ou estado de limite quando falta autoridade; onboarding não termina só em boas-vindas. | C052 |
| ONB-18 | VALUE BEFORE HARD ASK. Demonstrar personalização/semana e benefício antes da oferta preferencial; testar trial/anual/mensal/preço/timing depois. Não cobrar/definir billing aqui. | C053; F11 |
| ONB-20 | **Sobre você** (Founder, 2026-10-20): data de nascimento (idade real), altura e peso, na unidade do locale. **PROFILE DATA INITIALIZES THE MODEL; BEHAVIORAL AND PERFORMANCE DATA PROGRESSIVELY DOMINATE IT.** Consumidor: `profile_context` do AthleteState como contexto de cold start (idade para elegibilidade de cobertura e moderação da progressão inicial; peso para carga relativa em exercícios de peso corporal e contexto de corrida; altura só como contexto do peso) — nunca determinante isolado, nunca fórmula idade+peso+altura=treino. Proibido derivar afirmações (“você se recupera devagar”, “impacto articular alto”) sem evidência própria (VIS-14). Peso não vira meta, IMC, comparação ou conteúdo compartilhável. Editável em Perfil; “prefiro não informar” peso/altura é desconhecido explícito e não bloqueia a primeira semana. | Founder 2026-10-20; AEOS §AthleteState; C012 |
| ONB-21 | **Duas sessões no mesmo dia é preferência separada da disponibilidade** (Founder, 2026-10-20): “Sim, quando melhorar a semana” / “Só em alguns dias” (escolher dias) / “Prefiro evitar”. Nunca deduzida de duas janelas marcadas. Consumida pela montagem semanal do Adaptive Engine e pela coordenação de interferência; não obriga double session. | HOJ-C03; AEOS HC05 |
| ONB-19 | Post-workout coleta mínimo sinal com consumidor real para Athlete Model; percepção/esforço opcionais com construto/âncoras aprovados, sem questionário longo ou promessa de mutar toda vez. | AEC§1.2; RUN/STR |

### 6.2 Necessário agora versus aprendido depois

| Item | Quando | Por que importa | Recusa / ausência |
|---|---|---|---|
| 18+, caminho | Agora | Elegibilidade/identidade/modo | Sem 18+ não há identidade |
| Idioma e unidades | Do locale, sem passo; mudam em Configurações | Apresentação/registro do consentimento | Locale do sistema |
| Data de nascimento, altura, peso (ONB-20) | Agora, uma tela | Contexto inicial do Athlete Model | Peso/altura: desconhecido explícito |
| Consentimento primário (M1) | Agora | Processar contexto para recomendar | Experiência pessoal dependente não inicia; direitos/dados próprios continuam (DEG-23) |
| Objetivos e prioridade | Agora | Decisão integrada (B1) | Unknown permitido; Balanced é decisão explícita; ASK antes de arbitragem dependente |
| Experiência + frequência/volume recentes por modalidade | Agora (mínimo) | Elegibilidade/dose `[DEP-G01/G02]` | Limitação explícita ou ASK; sem default |
| Disponibilidade multi-janela, duração típica, preferência de duas sessões no dia (ONB-21) e equipamento | Agora | Janelas, distribuição semanal e repertório | Pede o mínimo; repertório limitado explícito |
| Limitação atual | Agora (uma pergunta voluntária) | HC03 | Desconhecido; retenção só se policy exigir |
| Histórico detalhado | Depois, quando a decisão precisar ou importação trouxer | Trajetória, exposição | Desconhecido explícito, sem zero |
| Wearable (leitura/escrita) | Depois, opcional | Observe/Execute | App e registro manual completos |
| Contexto do dia (recovery percebido) | Depois, no dia, opcional; consentimento da finalidade no primeiro uso | Decisão do dia | Decisão segue com o que existe; opcional ausente não força ASK (CNF-06) |
| Contexto nutricional voluntário | Só quando muda a opção elegível de um insight | AEC §6 | Desconhecido; educação elegível ou omissão |
| Trade-offs guardados | Quando a pessoa responde um ASK de prioridade | AEOS §6 `acceptable_tradeoff_refs` | Pergunta volta só em trade-off decisivo novo |
| Preferências do plano (ordem preferida de sessões quando o plano permitir) e unidades (SURF-05) | Depois; unidades seguem idioma/região até a pessoa mudar | Escolha entre opções equivalentes (B5); apresentação | Sem preferência declarada, nenhuma é presumida |
| Aprendizado secundário I10 | Depois, opt-in explicado | Finalidade própria | Desligado; nenhum valor primário perdido |
| Share próprio/avisos | Depois, opcionais | Projeção de identidade/preferências, sem rede | Nada pendente; sem checklist |

## 7. Hoje — decisão corrente (SURF-01)

### 7.1 As seis respostas rápidas

| Pergunta | Fonte da resposta | Regra |
|---|---|---|
| O que faço hoje? | S2: comportamento apropriado da janela (sessão Running, sessão Strength, ambas, recuperação, descanso, nada prescrito) | Sempre presente quando há plano; sem plano, a ação que leva a ter um (adotar/retomar/completar mínimo). |
| Por quê? | Resumo N1 em S2 + acesso a SURF-06 | Um fator principal do trace oficial (FAC-), escolhido de forma determinística (EXP-02), nunca genérico de “IA”. |
| Mudou algo? | Marca de mudança em S2 e itens em S3 | Só mudanças oficiais aplicadas ou propostas (MAN-2/3/4); recomputação sem mudança não marca nada. |
| Preciso decidir algo? | S3 “precisa de você” | Somente itens que exigem a pessoa e afetam a próxima ação ou um efeito em andamento. |
| Como executo? | Ação primária em S2 + preparação em S4 | Iniciar no app, ver estado do envio ao relógio, ou registrar depois — na mesma sessão. |
| O que vem depois? | S6 | Próxima janela/sessão e acesso à semana (Plano). |

### 7.2 Composição por prioridade (ALT-UX-02)

O Hoje é uma sequência de espaços funcionais ordenados pela hierarquia do PA §4. A ordem é fixa; densidade, forma e agrupamento visual são design space. Um item só entra se passar no teste de relevância do espaço; tudo o mais permanece no objeto dono, alcançável pelas referências estáveis.

| Espaço | Prioridade | Entra quando | Nunca contém |
|---|---|---|---|
| HOJ-S1 Agora | P0 | Sessão em execução; ou retenção/condição de safety no escopo da sessão em curso ou iminente. | Explicação longa que impeça recuperar o registro; diagnóstico. |
| HOJ-S2 Hoje | P1 | Sempre: comportamento da janela, marca de mudança, limitação de confiança **quando afeta a ação**, acesso ao “por quê”, entrada não solicitante para relatar como está ou uma limitação (HOJ-R7). | Métricas de mérito, score, alternativas não pedidas, pergunta diária. |
| HOJ-S3 Precisa de você | P1 | Proposta (MAN-3) ou pergunta/retenção/reconciliação (MAN-4) que afeta a próxima ação, sessão escolhida/exportada, ou um export com resultado desconhecido/falha que muda o que a pessoa fará. Ordenação: safety → efeito em andamento → próxima sessão → demais. | Itens sem efeito próximo (ficam no Plano); repetição de proposta recusada; estados de terceiros. |
| HOJ-S4 Preparar | P1 | Preparação da próxima sessão: estrutura resumida, equipamento, insight elegível, status de envio (WEA-L) quando há export. | Conteúdo Nutrition provisório, omitido ou obsoleto; promessa de “pronto no relógio” sem prova. |
| HOJ-S5 Fechar o que aconteceu | P2 | O item mais recente a fechar (sessão em aberto, sem registro, parcial, descanso a confirmar, associação proposta/ambígua); os demais, se houver, num único acesso agregado, sem contagem nem lista (HOJ-R8). | Rótulo de falha; cobrança repetida; lista de faltas; inferência de não realização. |
| HOJ-S6 Depois | P2/P4 | Próxima janela/sessão e acesso à semana. | Plano inteiro; totais de volume. |
| HOJ-S8 Marco próprio | P4 | O marco próprio elegível mais recente (ST-MAR); permanece até a pessoa abri-lo ou dispensá-lo, ou até um marco mais novo substituí-lo (o anterior segue em Progresso); compartilhar é opcional. | Volume, sequência, contagem, recorde, comparação; insistência depois de dispensado. |

Regras transversais: **HOJ-R1** P0 tem precedência, mas não apaga o registro em curso nem bloqueia funções não afetadas (AR-05). **HOJ-R2** Somente a pessoa abre detalhes; o Hoje não abre modais por conta própria, exceto P0 em sessão em curso/iminente (ALT-UX-05). **HOJ-R3** Incerteza que muda a ação aparece em S2 junto da ação (PR-05); a que não muda fica no “por quê”. **HOJ-R4** Sem Crew ou sem relógio, os espaços ou itens correspondentes simplesmente não existem — nenhum espaço vazio pede completude (PA §4); conversa está deferred e não há espaço de agente no Hoje (Scope §3). **HOJ-R5** Marcas de mudança permanecem até a pessoa abrir a mudança ou a sessão afetada acontecer; nenhuma duração arbitrária. **HOJ-R6** Nada no Hoje é exclusivo: toda ação também existe no dono (AR-01). **HOJ-R7** Relato antes de iniciar: a entrada “como estou / limitação” do S2 e da preparação da Sessão é sempre disponível e nunca solicitante (sem pergunta, lembrete, checklist ou bateria — ASK-05); grava o fato em OBJ-08 com consentimento de finalidade no primeiro uso (§6.2); um relato de limitação segue HC03 → AM-11 (S1/P0 quando a sessão do dia estiver no escopo); offline, segue CONF-17. **HOJ-R8** Definições: “iminente” é a sessão da janela corrente ainda não concluída, ou aquela cuja preparação/execução está aberta agora (deixa de ser iminente quando a pessoa sai dela); “recente” em S5 é o item mais recente a fechar. Ambas são regras de apresentação, não limiares fisiológicos.

### 7.3 Casos

| ID | Situação | O que o Hoje mostra (espaços) | Regras e proibições |
|---|---|---|---|
| HOJ-C01 | Dia de Running | S2 sessão com intenção e forma de execução disponível (app, relógio se enviado, registrar depois); S4 estrutura resumida, insight elegível, status de envio. | Linguagem de corrida; alvo só com baseline/policy (RUN-03). Estado do relógio pela escada WEA-L. |
| HOJ-C02 | Dia de Strength | S2 sessão com intenção e grupos de demanda aprovados; S4 equipamento e exercícios resumidos. | App-first; relógio nunca substitui séries/reps/carga (STR-09). |
| HOJ-C03 | Running e Strength no mesmo dia | S2 as duas sessões como itens do mesmo dia, na ordem/janelas do plano; o “por quê” mostra a relação entre elas (FAC-03) quando ela pesou na decisão. | Sem ordem ou intervalo universal inventados; se o plano não fixa ordem, não afirmar uma. Cada sessão tem execução própria. |
| HOJ-C04 | Recuperação indicada | S2 recuperação como comportamento apropriado, com o que ela preserva; S5 confirmar quando feita. | Recuperar é progresso (L006); nenhuma recuperação ativa automática ou calendário fixo (AEC §2.2). |
| HOJ-C05 | Descanso | S2 descanso como item de primeira classe; confirmação opcional. | Sem confirmação = desconhecido, nunca falha; sem check-in automático (PDM §5). |
| HOJ-C06 | Alteração recente aplicada | S2 marca “mudou” na sessão afetada + resumo “o que mudou” (EXP-01 bloco 1) e acesso ao detalhe. | Só para mudança aplicada pela pessoa ou por ela confirmada; HOJ-R5. |
| HOJ-C07 | Baixa confiança | S2 a ação com a limitação ao lado (CNF-); se uma resposta resolve, S3 traz a pergunta mínima. | Sem precisão fabricada; sem “dose conservadora”; sem score (AEOS §11). |
| HOJ-C08 | Treino já executado | S2 a sessão como concluída com resumo do realizado e o próximo passo; S5 só se houver algo a fechar (associação, esforço percebido opcional). | Nada de mérito por volume; repetir/compartilhar opcionais e discretos. |
| HOJ-C09 | Parcial / em aberto | S5 “fechar como parcial ou completa” ou “retomar” (se a revisão ainda vale e nada a retém). | O que faltou não vira dívida nem compensação automática (AEC §4). |
| HOJ-C10 | Wearable aguardando sync | S5 a sessão como “aguardando dados de ‹fonte›” **somente com evidência da integração** (ST-SES); sem ela, “sem registro”. Ação “registrar manualmente” sempre disponível. | Atraso não é treino perdido nem HOLD (AESL S08); nenhuma penalidade; nunca sugerir atividade que não há evidência de existir. |
| HOJ-C11 | Atividade chegou tarde | Histórico atualizado; se a reconciliação mudar uma decisão futura, S3 traz a proposta (MAN-3); se não, nada além da sessão marcada como recebida. | Decisões passadas permanecem como foram tomadas “com os dados disponíveis” (EXP-07); sem falha retroativa. |
| HOJ-C12 | Conflito exige input | S3 a pergunta mínima de prioridade/trade-off com “não sei/prefiro não dizer” e o efeito de cada opção; S2 continua mostrando o vigente se ainda válido. | Escopos independentes seguem; sem insistência após recusa (AESL S03). |
| HOJ-C13 | HOLD ativo | S1 se afeta a sessão em curso/iminente; senão S3. Mostra o escopo retido, o que continua possível, próximo passo e quem resolve. | Sem diagnóstico, sem copy clínica improvisada `[DEP-G04]`; sem oferta de liberação por aceite; registro e funções não afetadas disponíveis (AR-05). |
| HOJ-C14 | Interrupção declarada | S2 estado “em pausa por escolha sua” sem prescrição; ação “retomar quando quiser”. | Sem lembretes de retorno, sem contagem de dias, sem aviso social (F07). |
| HOJ-C15 | Retorno | S3 proposta RETURN rebaseada (ou pergunta mínima de contexto atual); S2 a primeira janela quando adotada. | Sem reposição de volume/streak (AEC §4; AESL S28). |
| HOJ-C16 | M3/social | DEFERRED, sem estado/tela V1. | Não mostrar placeholder social. |
| HOJ-C17 | Experiência pessoal | Estado pleno sem referência Crew. | Sem convite/checklist social. |
| HOJ-C18 | Primeiro dia / sem histórico | S2 a primeira sessão do plano adotado ou a ação para completar o mínimo; limitações de dado declaradas uma vez no “por quê”. | Ausência de histórico não é falha (EM §5). |
| HOJ-C19 | Sessão em execução | S1 controles/retorno à execução; demais espaços abaixo. Proposta para o restante aparece em S1 como pendente de aceite (CONF-07). | Nada altera o feito; P0 nova no escopo interrompe só o dependente. |
| HOJ-C20 | Offline | Último estado guardado com indicação de que pode estar desatualizado onde importa; execução e registro locais disponíveis no limite ainda válido. | Sem spinner de sucesso; retenção conhecida não é ignorada (AEC §5.3, AR-09). |
| HOJ-C21 | Sem plano vigente | S2 a ação que leva ao plano: adotar o inicial, revisar a continuação do horizonte (INT-02) ou retomar após interrupção. A continuação é apresentada antes do fim do horizonte (CONF-15); chegar aqui por fim de horizonte é exceção, não cadência. | Registrar atividade e descansar continuam possíveis; nenhuma sessão prescrita sem adoção. |
| HOJ-C22 | Proposta pendente não respondida | S2 mantém o vigente enquanto válido (CONF-10); S3 mantém a proposta enquanto válida e relevante (CONF-09); a sessão afetada a sinaliza; iniciar assim mesmo segue CONF-16. | Sem reapresentação insistente, sem aviso repetido, sem punição. |
| HOJ-C23 | Retorno após ausência não declarada (`NO_DATA`) | S2 com a decisão corrente (resultado da reavaliação do motor, sem compensação) e limitação de confiança quando a lacuna afeta a ação; S5 agrega as janelas desconhecidas num único item opcional (“registrar o que fez, se quiser”), sem contagem nem lista; opção de registrar o período passado como pausa, sem motivo (anotação histórica, ST-CTN); pergunta factual mínima só se decisiva (AESL S08/S09). | Sem lista de faltas, cobrança, reposição de volume ou rótulo de abandono (L013, AEC §4). |
| HOJ-C24 | Contexto/consentimento primário ausente | Explicar limite, retomar contexto se desejar; conta/dados/direitos disponíveis. | Sem prescrição/compra/consentimento inferidos ou entrada M3. |

## 8. Running — first-class

| ID | Elemento | Comportamento fixado | Dependência / fonte |
|---|---|---|---|
| RUN-01 | Intenção | Cada sessão mostra seu propósito e o vínculo com os objetivos; “sessão-chave” só aparece quando a policy define criticality. | Catálogo de propósitos `[DEP-G01]`; criticality `[DEP-G02]`; AEOS §5 |
| RUN-02 | Estrutura | Etapas ordenadas: aquecimento, blocos de trabalho, **blocos de repetição com total de iterações explícito** (“N vezes”, com o conteúdo de cada iteração), recuperação entre esforços, desaquecimento; etapas abertas/manuais quando prescritas. Aninhamento só se a receita o definir. | AEC §5.2 Estrutura |
| RUN-03 | Alvos | Por etapa: métrica, faixa e unidade; atual versus média da volta quando relevante; absoluto/relativo/zona somente com baseline e versão autorizados. Sem HRmax/threshold default: sem baseline, a etapa não mostra alvo derivado (ou mostra alvo de esforço percebido somente se a policy o previr). Pace e velocidade preservam a ordem correta dos limites na unidade escolhida. | `[DEP-G02]`; AEC §5.2 Targets/Unidades |
| RUN-04 | Término, alvo e avanço | Três atributos distintos por etapa: **termina quando** (tempo, distância ou aberto/manual), **alvo** (intensidade) e **avança** (automático quando medido, ou manual). Pausa não conta como trabalho. | AEC §5.2 Completion/advance |
| RUN-05 | Alternativas | Alternativas de prescrição são somente candidatos válidos já preparados (SURF-06). Alternativas de execução: no app, no relógio (se enviada) ou registrar depois. A pessoa sempre pode fazer diferente e registrar (AG-05). | AEOS §8; ALT-UX-04 |
| RUN-06 | Execução guiada no app (SURF-08) | Estados pronta → em execução ↔ pausada → concluída completa/parcial. Controles: iniciar, pausar/retomar, avançar etapa, encerrar. Mostra etapa atual, critério de término, alvo e “repetição k de N”. Transições de etapa precisam ser perceptíveis sem olhar a tela (forma sensorial é design space). **Medição por sensores do smartphone é capacidade técnica a confirmar e finalidade própria (RUN-13):** com ela e com o consentimento, métricas ao vivo versus alvo e avanço automático por distância; sem ela ou sem consentimento, etapas por tempo avançam pelo relógio do aparelho, etapas por distância avançam manualmente com aviso honesto de que o app não está medindo distância, e o resultado é informado ao final ou importado. A estrutura não depende dessa capacidade; avisos de transição com o app em segundo plano dependem da mesma verificação. | `[DEP-G06]` `[DEP-G09]`, UPSTREAM-ISSUE-01, FOUNDER-DECISION-03; C030 |
| RUN-07 | Execução no relógio | Via export da sessão/revisão (FLOW-06, WEA-L). A sessão no app mostra o estado real do envio e mantém “executar no app” disponível enquanto a revisão for válida. Se a pessoa executar uma cópia antiga, o retorno registra a revisão realmente executada quando a referência do export volta com a atividade; sem ela, a revisão executada fica desconhecida ou apenas proposta (FLOW-08). | AEC §4/§5.3; F04.7 |
| RUN-08 | Conclusão | Fechar completa/parcial; esforço percebido da sessão opcional (escala/âncoras `[DEP-G02]`); relato de limitação local opcional, como construto separado (segue HC03); motivo opcional privado — nunca vai à Crew, a export ou ao aprendizado secundário sem opt-in. | AEC §2.1; PDM I10 |
| RUN-09 | Resultado e desvios | Planejado versus realizado por etapa quando há dado; abaixo/igual/acima somente com regra `[DEP-G03]`, senão `UNCLASSIFIED` com o realizado preservado. Sem mérito por exceder, sem falha por fazer menos. | AEOS §5/§15; AESL S10–S12/S41 |
| RUN-10 | Consequência adaptativa | Após reconciliação, nova avaliação; manifestação conforme §10 (proposta para Running e/ou Strength quando a decisão oficial muda; nada quando não muda). | AEC §4; CF F06 |
| RUN-11 | Corrida não planejada | Registrada ou importada como não planejada; entra no contexto; pode motivar reavaliação. | F03.1 |
| RUN-12 | Outro esporte importado | Aparece em Progresso como “atividade externa considerada como contexto”, sem analytics próprios, plano ou promessa de suporte; pode reduzir a confiança quando não interpretável. | C042, AEOS §5 `EXTERNAL_CONTEXT` |
| RUN-13 | Finalidade de medição pelo telefone | Condicional a UPSTREAM-ISSUE-01 e FOUNDER-DECISION-03. Localização/sensores durante a execução são finalidade própria, **limitada às métricas de execução da sessão** (distância, ritmo, avanço de etapa): o dado bruto não alimenta contexto do motor além dessas métricas, aprendizado secundário I10, agente/LLM (contrato futuro AEOS §16) nem outra finalidade sem consentimento próprio, e não serve para inferir locais frequentes. Na V1 não há rota ou mapa exibidos nem retenção do traçado bruto além do necessário à derivação; propor mapa ou rota seria finalidade nova, declarada e decidida em G07 com Security antes da copy de consentimento e de qualquer coleta. A finalidade é pedida no ponto de uso (primeira execução guiada que a usaria); recusa leva ao ramo sem sensores, sem penalidade; revogação com efeito explicado antes; coleta só em execução ativa — nunca no estado pausado, salvo necessidade técnica declarada `[DEP-G09]` — e para nos gatilhos de “em aberto” (ST-SES); nenhuma coleta antes de G07/G09; rota e localização nunca vão a Crew, share, aviso, tela bloqueada ou export de notas. A corrida medida no app é mais uma fonte de observação e entra no dedupe (WEA-08). | PDM I6; L014; C021; `[DEP-G07]` |

## 9. Strength — first-class e app-first

| ID | Elemento | Comportamento fixado | Dependência / fonte |
|---|---|---|---|
| STR-01 | Intenção e demanda local | Propósito da sessão e grupos de demanda local **aprovados** (rótulos como “membros inferiores intensa” só derivados de regra/repertório aprovados). | `[DEP-G01]` `[DEP-G02]`; AEOS §5 |
| STR-02 | Estrutura | Exercício do repertório, equipamento, séries, repetições (alvo ou faixa), carga conforme receita (absoluta ou relativa só com baseline aprovado; sem %1RM inventado), descanso, alvo de esforço por série (RIR ou RPE de série) somente se a policy definir; ordem; agrupamentos apenas se a receita os definir. | `[DEP-G01]` `[DEP-G02]`; AEC §5.2 Strength |
| STR-03 | Registro direto (SURF-09) | Cada série registra repetições, carga e esforço (quando pedido) por ação direta, **sem diálogo de confirmação por série**. “Registrar como planejado” é um ato explícito da pessoa; nada é registrado sem ato. Cronômetro de descanso acompanha o intervalo prescrito. | EM §3; C030 |
| STR-04 | Correção | Editar qualquer série durante ou depois, apagar série acidental, acrescentar série extra (registrada como tal), marcar série não feita. Correção atua no mesmo objeto com revisão e recalcula só os derivados afetados. | AEC §4; F03 |
| STR-05 | Construtos distintos | RIR/RPE de série ≠ RPE da sessão ≠ dor/limitação. Dor nunca é deduzida de RIR/RPE; relatar desconforto/limitação é ação separada e opcional que segue HC03. | AEOS §3; AEC §2.1 |
| STR-06 | Substituição | Somente alternativas aprovadas para o exercício e o equipamento disponível, já preparadas. Escolher uma durante a execução muda o restante → confirmação de alcance leve (CONF-07). Dor não é motivo de troca: leva ao relato de limitação. Sem alternativa válida: registrar o exercício como não feito; nada é inventado. Offline: só alternativa já preparada e ainda válida; fora disso é “fazer diferente” (AG-05), reconciliado depois (CONF-17). | AEC §2.2; AEOS §8/HC03 |
| STR-07 | Planejado versus realizado | Por exercício e série; abaixo/igual/acima com regra `[DEP-G03]`, senão `UNCLASSIFIED`. Sem mérito por mais carga/volume, sem falha por menos. | AEOS §15; AESL S10–S12 |
| STR-08 | Adaptação posterior | O realizado/corrigido entra no contexto comum e pode gerar proposta para a próxima corrida e para a próxima força; explicação mostra o efeito cruzado. | DR-56; CF S03 |
| STR-09 | Wearable como suplemento fiel | Sinais do relógio (tempo, FC quando consentida) anexados como observação suplementar; nunca substituem reps, carga ou esforço; Strength nunca vira intervalo temporizado. Export de Strength só se a representação for fiel no preflight; senão, recusa e app. | RS §2; AEC §5.2; AESL S20 |
| STR-10 | Força não planejada | Registro a partir do repertório; exercício fora dele fica como “outro exercício”, com interpretação limitada e sem prescrição. | F03.1; C042 analógico |
| STR-11 | Registro incompleto | Sessão iniciada e não fechada fica “em aberto” (gatilhos em ST-SES; HOJ-S5) e assim permanece visível até a pessoa fechar. Para a avaliação, o motor trata o restante como desconhecido (AEOS §4 `observed_exposure`), sem rótulo automático “parcial” e sem prazo inventado (gatilho de policy, se houver, `[DEP-G03]`); nunca “não realizada”. | PDM §5; AEC §4 |
| STR-12 | Unidades | Massa na unidade preferida, conversão exata sem mudar sentido. | AEC §5.2 |
| STR-13 | Realizado anterior como referência | Durante a execução, cada exercício pode mostrar o último realizado da própria pessoa naquele exercício (séries, reps, carga, esforço registrados) como fato, sem rótulo de comparação, sugestão de “superar” ou destaque de recorde; a prescrição continua sendo a do plano. | C031; L019/L020; RS §4 |
| STR-14 | Ordem dos exercícios | Executar exercícios em outra ordem é liberdade de execução registrada como realizada (AG-05), não mudança do restante (CONF-07), desde que o conteúdo prescrito não mude; se a receita marcar a ordem como essencial, isso aparece como informação `[DEP-G02]`, sem bloquear. | AEC §3.7; AEOS §5 |

## 10. Adaptation UX

### 10.1 Termos do Founder → classes do AEOS

| Termo do pedido | Classe / rota AEOS | Natureza |
|---|---|---|
| manter | `KEEP` | recomendação validada (passa os mesmos gates) |
| mover / reordenar | `MOVE` / `REORDER` | mudança de plano |
| reduzir volume | `REDUCE_VOLUME` | mudança de plano ou do restante da execução |
| reduzir intensidade | `REDUCE_INTENSITY` | idem; distinta de volume |
| substituir | `SUBSTITUTE` | idem; só repertório/equipamento aprovados |
| recuperar / descansar | `RECOVER` / `REST` | mudança de plano; cumprir é progresso |
| replanejar semana/horizonte | `REPLAN` | candidato composto do horizonte |
| retornar | `RETURN` | após interrupção declarada; rebaseado |
| deload | sem classe própria: `REDUCE_*`/`RECOVER` conforme receita `[DEP-G02]` | — |
| perguntar | `ASK` | rota de controle |
| não adaptar / segurar | `HOLD` | rota de controle |
| reconciliar | `RECONCILE` | rota de controle (integridade/associação) |
| “ESCALATE” | `HOLD` com causa que exige revisão profissional/encaminhamento (AEC §7.1 red flag, fora do domínio, restrição), owner competente | rota de controle; copy `[DEP-G04]` |

### 10.2 Comportamento por classe

“Prévia” = FLOW-02 com o conteúdo de CONF-01. “Confirmação” segue `confirmation_scope` (AEOS §8). Nenhuma classe que altere plano/contexto ou o restante de uma execução é silenciosa (DR-63).

**Matriz-resumo** (“apenas sugerida” = exibida sem exigir ato; a pessoa sempre pode fazer diferente e registrar, AG-05):

| Classe | Silenciosa | Apenas sugerida | Prévia | Confirmação | Não pode acontecer |
|---|---|---|---|---|---|
| `KEEP` | Sim, se nada muda (MAN-0) | Sim, com fator no “por quê” (MAN-1) | Não | Não | Quando o vigente é inválido |
| `MOVE`/`REORDER`, `REDUCE_VOLUME`, `REDUCE_INTENSITY`, `SUBSTITUTE`, `RECOVER`/`REST`, `RETURN` | Nunca | Nunca: é proposta | Sim | Sim (`APPLY_PLAN_CHANGE` ou `CHANGE_REMAINING_EXECUTION`) | Ver “Não pode” abaixo |
| `REPLAN` | Nunca | Nunca | Sim, do horizonte | Sim, um ato para o conjunto | Aceitação parcial |
| `ASK` | Nunca: é visível | — | Não | A resposta é o ato | Bateria diária; pedir aprovação profissional |
| `HOLD` | Nunca: é visível | — | Não | Não: imediato | Liberação por aceite/override/tempo/score |
| `RECONCILE` | Associação comprovada por referência aparece no detalhe, sem pedido | — | Não | Resolução pela pessoa quando ambígua | Associação inventada |

| ID | Classe | Manifestação e confirmação | Não pode | Explicação mínima e consequências | Desfazer e consistência |
|---|---|---|---|---|---|
| AM-01 | `KEEP` | Silenciosa (MAN-0) quando nada muda; MAN-1 no “por quê” quando um fator novo foi avaliado e a ação ficou igual. `NONE_FOR_READ_ONLY_RECOMMENDATION`. | Manter plano inválido por falta de alternativa (vira ASK/HOLD); tratar ausência de conflito como certificado de segurança. | “Continua aplicável” + fator considerado, se houver. | Nada a desfazer; nenhuma revisão nova por recomputação (AEOS §13 `EvaluationKey`). |
| AM-02 | `MOVE`/`REORDER` | MAN-3; prévia obrigatória com janelas afetadas nas duas modalidades e efeitos em insights/exports; `APPLY_PLAN_CHANGE`. | Mover sessão iniciada (só o restante, CONF-07); deslocar conflito para outra sessão-chave sem avaliação; intervalo universal; sair da disponibilidade. | Antes→depois, fator (FAC-03/07…), o que se preserva, trade-off na outra modalidade. | Antes de aplicar: cancelar. Depois: AG-06. Uma revisão integrada; export pendente afetado invalidado; enviado vira “revisão anterior” (WEA-L). |
| AM-03 | `REDUCE_VOLUME` | MAN-3; prévia na linguagem da modalidade (séries/reps/blocos/duração/distância) e propósito retido/modificado; `APPLY_PLAN_CHANGE` ou `CHANGE_REMAINING_EXECUTION`. | Percentual inventado; tom de punição; supor que manter intensidade é seguro. | Quanto muda, por quê, efeito futuro nas duas modalidades. | Idem AM-02. |
| AM-04 | `REDUCE_INTENSITY` | MAN-3; prévia separa pace/zona/carga relativa/esforço de volume; mesmos escopos. | Limite não aprovado `[DEP-G02]`; confundir com volume. | Alvo antes→depois na unidade da pessoa. | Idem AM-02. |
| AM-05 | `SUBSTITUTE` | MAN-3; prévia mostra o substituto, equipamento e propósito retido/perdido; mesmos escopos. | Esporte novo; equivalência calórica; contornar dor; inventar alternativa (sem válida → ASK/HOLD). | O que muda e o que se perde do propósito original. | Idem AM-02. |
| AM-06 | `RECOVER` | MAN-3 quando troca sessão planejada por recuperação; `APPLY_PLAN_CHANGE`. Aplicada, aparece como comportamento apropriado e pode ser honrada. | Calendário fixo; recuperação ativa automática; dívida social/física; confundir com HOLD. | Por que recuperar agora; o que preserva; que isso é progresso. | Idem AM-02; honrado só por confirmação/evidência (ST-REST). |
| AM-07 | `REST` | Igual a AM-06 para descanso. | Idem AM-06. | Idem. | Idem; sem confirmação = desconhecido. |
| AM-08 | `REPLAN` (semana/horizonte), inclusive continuação de horizonte (INT-02) | MAN-3; prévia do horizonte inteiro por modalidade; **um ato** para o conjunto; aceitação parcial não existe (candidato composto, AEOS §8) — mudar uma parte é editar (FLOW-04) e gerar nova avaliação. | Restaurar volume antigo; compensar perdas; aplicar fragmentos. | Sessões alteradas, efeitos cruzados, o que se preserva. | Antes: cancelar. Depois: AG-06 sobre o conjunto. |
| AM-09 | `RETURN` | MAN-3 depois de retomar (FLOW-14); pergunta mínima de contexto atual se necessária; `APPLY_PLAN_CHANGE`. | Reposição; exigir motivo; tratar retorno após dor/doença/lesão/restrição como sessão perdida (HOLD dependente + revisão qualificada `[DEP-G04]`). | Rebase pelo contexto atual; nada a compensar. | Idem AM-02. |
| AM-10 | `ASK` | MAN-4 quando bloqueia decisão próxima; senão no objeto. Sem confirmação de plano: a resposta é confirmação de fato no objeto canônico; se a reavaliação gerar proposta, ela exige seu próprio ato (MAN-3). | Bateria diária; repetir sem fato novo; pedir à pessoa “aprovação profissional” (isso é HOLD). | O que falta, por que importa, efeito de responder, de “não sei” e de “prefiro não dizer”. | Vigente continua se válido; escopos bloqueados ficam indeterminados; independentes seguem. |
| AM-11 | `HOLD` (inclui “ESCALATE”) | MAN-4 **imediato**, sem confirmação (safety vence estabilidade, AEOS §14); P0 se afeta sessão em curso/iminente. Mostra escopo, categoria privada da causa, próximo passo, quem resolve, evidência de saída. | Diagnóstico; liberar por aceite/score/tempo/override; reutilizar prescrição antiga como segura; evento social; copy clínica ou urgência improvisadas `[DEP-G04]`. | O que está retido e o que continua possível; quando há cópia no relógio, aviso de que ela pode continuar lá e não reflete a retenção, com cancelamento só se suportado (WEA-L). | Não há “desfazer”: correção de dado incorreto resolve a causa após validação; contestação vai ao owner (FLOW-09). Pendentes afetados cancelados. |
| AM-12 | `RECONCILE` | MAN-4 se afeta decisão próxima; senão MAN-2 na sessão. Associação sustentada por referência de export aparece como associada, sem pedir nada. | Associação inventada; somar provável duplicata; média de campos incompatíveis. | O que é ambíguo e o que fica limitado até resolver. | Resolver via FLOW-08; “não sei agora” mantém limitado só o dependente. |

### 10.3 Níveis de manifestação e materialidade

A **materialidade fisiológica** — se uma mudança de sinais justifica uma decisão diferente — pertence à policy `[DEP-G02]` e ao resultado oficial B0/policy gate (AEOS §10/§14). A UX **não** cria limiar. A **materialidade de apresentação** — o que vira adaptação visível, aviso, menção no “por quê” ou nada — é decisão de Product/UX e deriva apenas do tipo de resultado oficial e do alcance temporal:

| Nível | Quando | Onde aparece | Pode notificar? |
|---|---|---|---|
| MAN-0 nenhum | Resultado oficial igual ao vigente; duplicata reconhecida; ruído/repetição; qualquer saída JEV (sempre). | Nada. | Nunca. |
| MAN-1 menção | Decisão igual, mas fator novo foi avaliado (ex.: sinal isolado considerado e `KEEP`). | Só no “por quê” (SURF-06), sob demanda. | Nunca. |
| MAN-2 aviso no objeto | Sem mudança de plano, mas muda como a pessoa entende/executa: confiança reduzida que afeta a ação; dado tardio que mudou o histórico; insight retirado por obsolescência; estado de export relevante; mudança aplicada recentemente (marca). | Objeto dono; Hoje S2/S4/S5 se afetar a ação do dia. | Somente falha material de transporte (NOT-C). |
| MAN-3 proposta | `RECOMMEND` com `APPLY_PLAN_CHANGE` ou `CHANGE_REMAINING_EXECUTION`. | SURF-06, sinalizada na Sessão afetada (SURF-07), + Hoje S3 se afetar a próxima ação/sessão escolhida/exportada; senão só Plano. | Se afetar sessão próxima (NOT-A). |
| MAN-4 controle | `ASK`, `HOLD` ou `RECONCILE` que retém ou bloqueia escopo relevante. | SURF-06/SURF-07 + Hoje S1/S3. | HOLD de safety na sessão em curso/iminente (NOT-P0); retenção não clínica da próxima sessão (NOT-B); ASK que bloqueia a próxima sessão (NOT-D). |

Regras anti-“adaptive theater”: **MAN-R1** nenhum selo “a IA adaptou” em item inalterado; **MAN-R2** `KEEP` nunca é apresentado como adaptação; **MAN-R3** número de adaptações não é valor exibido; **MAN-R4** para o mesmo escopo, uma proposta só substitui outra quando há fato/declaração/policy material novo, e a substituição mostra o motivo factual (AEOS §14); **MAN-R5** a ordem de chegada de dados, a repetição de consultas ou a variação do JEV nunca mudam o que se vê (AESL S32/S43).

### 10.4 Prévia, confirmação e ciclo da proposta

| ID | Regra | Fonte |
|---|---|---|
| CONF-01 | **Conteúdo da prévia:** escopo (sessões/janelas afetadas por modalidade); antes→depois na linguagem de cada modalidade; efeitos em insights (reavaliados/retirados) e exports (pendentes invalidados; enviados viram revisão anterior; substituição/cancelamento remoto é intenção separada); o que é preservado; trade-off; confiança/limites materiais; o que invalidaria a proposta; alternativas válidas. | AEC §3.3–3.5; AEOS §8 `horizon_impact`, `intent_effects` |
| CONF-02 | **Vínculo à versão:** o ato confirma proposta + alcance + plano-base + contexto + policy + permissões + validade correntes. Se algo mudou, a proposta fica `STALE`, nada é aplicado e a avaliação atual aparece com o fato que mudou. | AEOS §13/§13.1; AESL S15/Q01 |
| CONF-03 | **Um ato explícito por proposta.** Abrir, rolar, iniciar sessão, tempo decorrido ou silêncio não confirmam. Não existe “aceitar todas”, aplicação em lote nem aceite automático. | DR-63; AEOS §13 |
| CONF-04 | **Export é outra intenção.** Confirmar mudança não envia workout; depois de aplicar, se havia cópia enviada, a sessão oferece substituir ou cancelar como ato separado, quando suportado (FLOW-06). Sem envio em lote automático. | AEC §5.1; AEOS §8 |
| CONF-05 | **Proposta composta** (REPLAN, combinação de ações) é aceita ou recusada inteira; para mudar uma parte, a pessoa edita (FLOW-04) e recebe nova avaliação. | AEOS §8; AESL S47 |
| CONF-06 | **Escolher alternativa:** somente candidatos `VALID` do conjunto corrente, cada um com prévia e confirmação próprias; nada é montado a partir de fragmentos. | AEOS §8/§10 |
| CONF-07 | **Durante a execução** (`CHANGE_REMAINING_EXECUTION`): a prévia mostra só o restante; o que foi feito fica intocado; recusar mantém a revisão em execução; retenção nova (P0) interrompe apenas o dependente, sem aceite, preservando o registro. | AEC §3.6; AEOS §5; AESL S29/S33 |
| CONF-08 | **Edição iniciada pela pessoa** usa a mesma prévia; se a edição exigir reavaliar o horizonte, os efeitos aparecem antes do ato. Edição que falha um hard constraint não é aplicada como prescrição: a prévia explica a categoria do bloqueio e oferece alternativas válidas ou registrar o que a pessoa fará (AG-04). | C033; AEOS §9 HC07 |
| CONF-09 | **Proposta não respondida:** o plano vigente permanece em vigor e executável enquanto válido (CONF-10); a proposta continua `PRESENTED` enquanto válida — em Hoje S3 apenas se afeta a próxima ação ou uma sessão escolhida/exportada, senão só no Plano; no máximo um aviso, se elegível (NOT-A); ao perder validade (janela passou, fato mudou) vai para o histórico; não é reapresentada sem fato material novo; sem punição, contagem ou tom de cobrança. | AEOS §13 `DECLINED`/§14 |
| CONF-10 | **Vigente inutilizável:** se restrição, HOLD, permissão revogada ou gate invalidar o vigente, o escopo afetado fica retido imediatamente, independentemente de resposta; a proposta válida, se existir, segue disponível; sem proposta válida, ASK/HOLD. Ignorar nunca reativa a sessão retida. | AEC §7.1; AEOS §9/§14; AESL S33 |
| CONF-11 | **Recusa** (`DECLINED`): registra “não aplicar”, sem falha moral; preferência só se declarada; motivo opcional e privado. | AEC §3; AEOS §13/§15 |
| CONF-12 | **Falha na guarda de aplicação:** se autoridade, retenção, permissão ou sessão mudou antes do ponto de commit, nada é aplicado; a pessoa vê que não foi possível aplicar porque ‹fato› mudou e a avaliação atual. | AEOS §13.1; AESL S45/S46 |
| CONF-13 | **Conversa — DEFERRED.** Quando autorizada em expansão, proposta preparada seguirá o fluxo no objeto canônico; não há ação conversacional V1. | AEC §7.2; AEOS §16; Scope §3 |
| CONF-14 | **Sem explicação fiel, sem proposta:** se nem template nem LLM validado produzem a explicação mínima, a proposta não é apresentada nem aplicada; o vigente permanece **somente se ainda válido**. Se estiver invalidado, valem CONF-10 e DEG-20: escopo retido, próximo passo operacional e EXP-05 sem copy clínica. Precedência: CONF-10 > CONF-14. | AEOS §12.3/§16; AEC §7.1; AESL S34 |
| CONF-15 | **Plano inicial e continuação de horizonte** são propostas com confirmação (INT-01, INT-02). A continuação é preparada e apresentada como MAN-3 **antes** do fim do horizonte: entra em S3 quando afetar a próxima sessão e gera no máximo um NOT-A. Uma avaliação sucessora com o mesmo efeito semântico (por exemplo, após expirar uma janela) não gera novo aviso nem nova marca de mudança. O fim do horizonte sem adoção é exceção (DEG-31). O ônus de confirmar a cada horizonte será revisto quando G02 fixar a cadência `[DEP-G02]`. | DR-63; AEOS §13/§14 |
| CONF-16 | **Iniciar com proposta pendente:** a Sessão sinaliza a proposta ou pergunta que a afeta, sem bloquear. Iniciar não confirma (CONF-03): executa a revisão vigente, se válida, e a proposta `APPLY_PLAN_CHANGE` que inclui a sessão passa a `STALE` com o motivo factual (“sessão iniciada com a versão vigente”); proposta composta vai inteira a `STALE` (INT-10). O motor registra o início com proposta pendente como evento de agência no trace e no estado de estabilidade, ligado às razões da proposta `STALE`. Para a execução iniciada, o resultado oficial de estabilidade (AEOS §14) não repropõe o restante (CONF-07) sem fato material novo surgido depois do início; a UX só manifesta esse resultado e não filtra resultado oficial (UPSTREAM-ISSUE-04). As demais sessões de uma proposta composta recebem avaliação sucessora normal, apresentada conforme MAN-R4 com motivo factual e sem novo NOT-A, salvo efeito materialmente diferente na próxima sessão. Retenção de safety continua imediata (CONF-10). | AEC §3.4/§3.6; AEOS §5/§13/§13.1/§14 |
| CONF-17 | **Atos pendentes (offline ou sem resposta):** (1) ato que depende de avaliação ou commit fica registrado como intenção pendente, visível como “ainda não aplicado”; o vigente continua sendo a única revisão executável; (2) na reconexão, a guarda decide `APPLIED` ou `STALE` (CONF-12), sem herdar a confirmação para outro plano-base; (3) edição offline não mostra alcance inventado: fica guardada como pedido que recebe prévia e confirmação depois da reconexão; (4) resposta de ASK offline é fato local pendente, sem efeito na decisão até a reavaliação; (5) limitação ou restrição declarada offline é guardada na hora, e daí em diante a orientação preparada da sessão em curso ou iminente e das que possam depender dela não é apresentada como válida (“precisa de reavaliação — sem conexão”); registro e funções não dependentes continuam, sem limiar inventado; (6) repetir o mesmo ato resolve para o resultado da intenção original; (7) substituição offline em Strength segue STR-06. | AEC §5.3/§5.4; AEOS §13.1/§14; AR-09 |

### 10.5 Estabilidade percebida

L024/AEC§1.2/AEOS§10 governam: atualizar evidência/modelo e checar semana não é mutar plano. Se válido/adequado, KEEP/learn only, sem nova revisão de conteúdo ou selo/aviso “IA otimizou”. Mudança discricionária precisa necessidade + benefício material após Change Cost; próxima sessão é sticky e ruído encontra hysteresis. Intervenção mínima suficiente, Level0 primeiro; significativo só por insuficiência sustentada das menores. A UI não inventa limiar ou filtra resultado oficial para parecer estável. Safety/invalidade/revogação continuam imediatos; CONF-16/17 preservados. Week mostra diferença factual e razão/objetivo protegido, sem tom promocional.

## 11. Explicabilidade

### 11.1 Estrutura

| ID | Regra | Fonte |
|---|---|---|
| EXP-01 | **Seis blocos** para toda decisão que muda algo ou retém escopo: (1) o que mudou; (2) por que mudou — fatores do trace oficial; (3) o que foi preservado; (4) trade-off, inclusive na outra modalidade; (5) qualidade da informação, quando material (CNF-); (6) o que a pessoa pode fazer (confirmar, manter original, alternativas, editar, reportar contexto incorreto, perguntar à conversa se incluída). `KEEP` usa só os blocos 2 e 6 quando houver fator relevante. Controles: ASK (o que falta, por que, efeito de cada resposta), HOLD (escopo, categoria privada, próximo passo, quem resolve, evidência de saída, o que continua possível), RECONCILE (o que é ambíguo, opções, o que fica limitado). | AEC §3, §7.1; AEOS §13/§16 |
| EXP-02 | **Profundidade:** N1 resumo de uma linha no Hoje (classe + fator principal, escolhido de forma determinística a partir do trace oficial: a causa do controle ou HC que falhou; senão o passo decisivo do comparador B1→B6; nunca por saliência escolhida pelo LLM); N2 detalhe em SURF-06 com os seis blocos; N3 projeção aprovada do trace sob demanda (fatos usados com fonte e momento observado/recebido, alternativas válidas consideradas, revisões). Candidatos rejeitados aparecem só como claim aprovado (ex.: por que não foi possível manter), nunca com payload. | AEOS §8/§13 |
| EXP-03 | **Vínculo ao trace oficial:** cada afirmação material liga-se a claims/reason refs do B0/policy gate. Nunca saída do JEV shadow, ranking, rota ou autoconfiança JEV; nunca chain-of-thought; nunca causalidade, fonte ou número inventados. Números só quando são fatos do trace exibíveis à própria pessoa (ex.: carga que ela registrou) ou deltas/alvos do `change_set` oficial do candidato apresentado (CONF-01), na unidade preferida; nada além disso. Incerteza em linguagem de possibilidade, nunca como probabilidade não calibrada. | AEOS §11/§12.2/§16; AESL S38 |
| EXP-04 | **Template determinístico primeiro:** toda classe/rota/fator tem template aprovado que sozinho produz explicação fiel; o LLM, se existir, só reescreve dentro dos claims e passa por validação conforme AEOS §16: vínculo a `decision_ref`/revisão, suporte de cada claim, números e causalidade, omissão material de limite/HOLD/desconhecido, contradição com o resultado, conteúdo fora de escopo (diagnóstico, Nutrition pessoal, novos efeitos) e locale. Falha → template. Sem template mínimo fiel → CONF-14. | AEOS §16; AESL S44 |
| EXP-05 | **Conteúdo profissional:** copy clínica, triagem, urgência e encaminhamento só com conteúdo aprovado `[DEP-G04]`; conteúdo Nutrition só aprovado `[DEP-G05]`. Sem template aprovado, o estado operacional informa escopo retido e o tipo de responsável, sem improvisar urgência. | AEC §6/§7; AEOS §16 |
| EXP-06 | **PT-BR ↔ EN equivalentes:** mesmo alcance, mesmos claims e limites nas duas línguas; resposta de LLM com locale não equivalente é rejeitada. | AEOS §16; SEC-J3-06 |
| EXP-07 | **Passado:** decisões antigas exibem o que se sabia no momento (“decidido com os dados disponíveis em ‹momento›”); dado tardio não reescreve causa nem mérito. | AEC §4; AEOS §14 |
| EXP-08 | **Proibido:** inferências apresentadas como fato sobre o estado da pessoa (“você está fatigado”), diagnóstico, culpa, motivação por volume, comparação com outras pessoas, menção a Crew como razão de carga. | C015, L008, HC08 |
| EXP-09 | **Ordem, ênfase e origem da pergunta:** a recomendação oficial vem primeiro; as demais alternativas válidas seguem ordem neutra e determinística (identidade canônica, AEOS §10 passo 4, ou a relação do comparador com sua razão). `INCOMPARABLE`/`UNKNOWN` nunca aparecem como ranqueadas, e não há linguagem de preferência além dos claims. A pergunta exibida vem só dos `question_refs` do resultado oficial; a rota do JEV nunca gera pergunta, HOLD ou revisão. | AEOS §10/§12.3; AESL S35/S43 |

### 11.2 Fatores de influência (vocabulário da projeção)

Rótulos funcionais da projeção aprovada de claims/reason refs **oficiais** (B0/policy gate). Coincidência de nome com reason codes do JEV (AEOS §12.2) não torna o JEV fonte. Um fator só aparece se estiver no trace da decisão exibida.

| ID | Fator | Base no trace |
|---|---|---|
| FAC-01 | Objetivo prioritário preservado / trade-off no secundário | `goal_state`, B1/B3 |
| FAC-02 | Sessão-chave protegida | criticality, B2 |
| FAC-03 | Relação entre sessões de corrida e força | `DemandRelation`, C01 |
| FAC-04 | Limitação ou fadiga local relatada | `local_state`, C04 (privado) |
| FAC-05 | Recuperação geral percebida/medida | `systemic_context`, C03 |
| FAC-06 | Treino realizado diferente do planejado | `observed_exposure`, C06 |
| FAC-07 | Disponibilidade, agenda ou equipamento | C05 |
| FAC-08 | Próximo evento/prova | goal event |
| FAC-09 | Informação insuficiente, ausente ou conflitante | `EvidenceAssessment`, C07 |
| FAC-10 | Dados de uma fonte ainda não chegaram | `SOURCE_DELAY`, C07 |
| FAC-11 | Uma mudança sua (edição, override, preferência) | C08 |
| FAC-12 | Interrupção ou retorno | C10 |
| FAC-13 | Menor mudança necessária entre opções equivalentes | B5 |
| FAC-14 | Fora do que o app pode recomendar hoje (regra/autoridade ausente) | C11, HC02 |
| FAC-15 | Restrição declarada / condição de segurança | C04, HC03 (privado) |
| FAC-16 | Preparação ou envio ligado a uma versão anterior | C09 |
| FAC-17 | Histórico recente de treino nas duas modalidades | `observed_exposure`/`planned_exposure` (AEC §2.1; sem ACWR ou equivalência km↔séries) |

## 12. Confiança e incerteza

Confiança qualifica a evidência **para uma decisão e escopo**, nunca a saúde da pessoa; é distinta de safety/aplicabilidade e de HOLD (AEC §2.1, AEOS §11). As flags podem coexistir.

| ID | Estado | Automação | Explicação | Pergunta | Mudar o plano | Retenção | Apresentação |
|---|---|---|---|---|---|---|---|
| CNF-01 | `SUFFICIENT` | Recomendações e propostas normais, sempre com confirmação para mudanças. | Padrão; confiança não é destacada. | Nenhuma. | Propostas permitidas. | Não decorre de confiança. | Sem indicador; ausência de indicador não é selo de segurança. |
| CNF-02 | `PARTIAL` | Proposta só quando a comparação está `SUPPORTED` no escopo; senão o vigente válido permanece ou há ASK. | Bloco 5 quando a lacuna limita a decisão. | Só se o faltante for decisivo e fornecível pela pessoa. | Sim, quando sustentado. | Só se o faltante for crítico e não fornecível (autoridade/safety). | Limitação ao lado da ação quando a afeta. |
| CNF-03 | `CONFLICTING` | Nenhuma proposta que dependa do insumo em conflito (`UNDERDETERMINED`); RECONCILE para integridade/associação. | Quais fontes divergem, em termos privados e factuais. | Se a pessoa puder resolver (ex.: qual atividade é a correta). | Não com base no insumo em conflito. | Do dependente, se dado crítico sustenta prescrição (HC04). | Indicação de divergência junto ao item afetado. |
| CNF-04 | `STALE` | Nada muda o plano com base em dado que a policy marcou como desatualizado para aquela decisão. | Momento da última informação conhecida, quando afeta. | Atualização mínima, se decisiva. | Não com base no desatualizado. | Não por si: degradação ordinária. | Nunca parecer atualizado (AR-09). |
| CNF-05 | `ABSENT` | Opcional ausente: nada muda (CNF-06). Crítico ausente: ASK se fornecível; HOLD se for autoridade/safety. | “Sem essa informação” apenas quando afeta. | Conforme a coluna de automação. | Só o que não depende do ausente. | Conforme causa tipada (AEOS §10). | Ausente ≠ zero ≠ não treinou ≠ permissão negada. |

| ID | Regra | Fonte |
|---|---|---|
| CNF-06 | Evidência opcional ausente com caminho independente aprovado **não** força ASK nem HOLD; pode aparecer só como limitação em N3. | AEOS §11; AESL S25 |
| CNF-07 | Flags simultâneas são preservadas; a apresentação prioriza a que mais afeta a ação; todas ficam acessíveis em N3. | AEOS §3 `EvidenceAssessment` |
| CNF-08 | Confiança ≠ HOLD: confiança favorável não libera retenção; retenção não é mostrada como “baixa confiança”. | AEC §2.1/§7.1 |
| CNF-09 | Sem score, percentual ou “probabilidade de segurança”. Probabilidade calibrada futura exigiria evento declarado e gates próprios. | AEOS §11 |
| CNF-10 | “Conservador” significa abster-se de mudança não sustentada, manter o vigente válido, perguntar o mínimo ou reter o dependente — nunca inventar dose “conservadora”. | AEC §2.2; AEOS §9 HC06 |
| CNF-11 | Mais fontes não significam mais confiança: duplicata ou fonte contraditória nunca aparece como reforço. | AEOS §11; AESL metamórficas |

### 12.1 Pergunta mínima (ASK)

| ID | Regra | Fonte |
|---|---|---|
| ASK-01 | Uma pergunta por vez por decisão: a menor informação que muda a decisão, sempre com “não sei” e “prefiro não dizer”. | AEC §2.2; AEOS §10 |
| ASK-02 | Mostra por que pergunta e o efeito de cada resposta, inclusive não responder. | AEOS §10 |
| ASK-03 | A resposta é fato confirmado no objeto canônico (contexto do dia, SURF-11 ou observação) e dispara reavaliação; não é aprovação de nada. Se a reavaliação gerar proposta, ela exige seu próprio ato (MAN-3); offline, a resposta fica pendente (CONF-17). | AEOS §13 |
| ASK-04 | Prioridade/trade-off: as opções são as alternativas válidas com o sacrifício de cada uma explícito, mais “não sei”. A pessoa escolhe “só desta vez” ou “guardar como preferência até eu mudar” (revisão confirmada do `GoalPriorityModel`, editável em SURF-11). | AEOS §6; AESL S01–S03 |
| ASK-05 | Sem bateria diária ou questionário recorrente; o contexto do dia é voluntário e não é ASK. | AEC §2.2; EM §3 |
| ASK-06 | Recusa/desconhecido mantém o escopo indeterminado, sem nova pergunta sem fato novo e sem inferir saúde do silêncio. | AEOS §6/§10 |
| ASK-07 | Nunca pedir à pessoa que supra autoridade profissional; responder uma pergunta não é evidência de saída de HOLD. Mecanismo de evidência de saída `[DEP-G04]`. | AEOS §6 regra 3, HC05 |
| ASK-08 | Texto, âncoras e instrumentos finais `[DEP-G02]` `[DEP-G04]`. | PDR G02/G04 |

## 13. Agência

| ID | Ação | O que acontece | Limites | Fonte |
|---|---|---|---|---|
| AG-01 | Aceitar | Confirma a proposta corrente (FLOW-02); aplica sobre a versão vigente. | Proposta obsoleta não aplica (CONF-02). | AEOS §13 |
| AG-02 | Recusar/manter vigente | DECLINED + AgencyConstraint da proposta/alcance; buscar solução dentro da escolha. Vigente só permanece executável se ainda válido. | Sem reaproposta por razões antigas, sem penalidade, safety imediato/sem clearance por recusa. | AEC§1.2; AEOS§6/§14 |
| AG-03 | Escolher alternativa | Prévia e confirmação de um candidato `VALID` já preparado. | Nada fora do conjunto válido; nada composto por fragmentos. | CONF-06 |
| AG-04 | Editar | Mover, pular (“não farei” para sessão futura, de janela ainda não iniciada), marcar indisponível, mudar disponibilidade/equipamento/objetivo (FLOW-04/SURF-11) com prévia de alcance. Na janela corrente ou passada, “não realizada” é fato registrado em FLOW-05, sem prévia. Edição confirmada é input do loop e é considerada nas próximas recomendações. | Edição que falha HC01–HC04, HC06 ou HC08–HC09 não vira prescrição: a prévia explica a categoria e oferece alternativas ou registrar o que fará. Falha de HC05 causada pela própria edição (ex.: um dia antes indisponível) é tratada como atualização confirmada do contexto e reavaliada. Pular, remover ou marcar indisponível nunca é bloqueado (no máximo trade-off/ASK). HC07 é guarda de versão (CONF-02), não bloqueio da intenção. | C033; PDM inv. 2; AEOS §9 |
| AG-05 | Fazer diferente (override) | A pessoa executa outra coisa e registra com veracidade; o produto registra agência e readapta o futuro sem punição nem prêmio. | Não remove safety, hard constraints, permissões, fronteiras profissionais nem policy gates; escopo retido segue retido e não é guiado/exportado. | AEC §3.7/§7.1; AESL S15 |
| AG-06 | Desfazer | Antes de aplicar: cancelar, sem efeito. Depois: pedir restauração → nova avaliação no contexto atual → proposta de restauração, se ainda aplicável, ou explicação + alternativa. | Sem “voltar no tempo”: execução, realizado e exports permanecem; cópia remota só por cancelamento/substituição suportados; sem undo remoto universal. | AEC §3 Reversão; DR-63 |
| AG-07 | Reportar contexto incorreto | Em qualquer fator, observação ou associação: abre a correção no objeto canônico → reavaliação. Pode resolver uma causa factual incorreta após validação. | Restrição clínica exige resolução competente `[DEP-G04]`. | AEC §7.1; NAV-12 |
| AG-08 | Corrigir registro | Séries, resultado, sessão, descanso: revisão rastreável; recalcula só derivados afetados. | Não apaga outro registro válido nem a decisão passada. | AEC §4 |
| AG-09 | Contestar retenção | FLOW-09: acrescentar contexto, corrigir dado, pedir revisão ao owner indicado. | Sem liberação por override, tempo, silêncio, score ou checkbox de risco. | AEC §7.1 |
| AG-10 | Responder ou recusar pergunta | ASK-01–08. | Recusa = desconhecido. | AEOS §10 |
| AG-11 | Controles sociais | DEFERRED; nenhum ato Crew na V1. | — | C041 |
| AG-12 | Revogar consentimento | FLOW-15, cessar finalidade/fila/derivados conforme contrato; outra finalidade só sob base própria válida. | Sem recall externo ou ampliação por assinatura. | PDM I6/I9/I10 |

**Tom (sem copy final):** limites são expressos como fronteira do que o app pode recomendar ou fazer, nunca como permissão sobre a pessoa; a escolha da pessoa é reconhecida sem julgamento; sempre se mostra o que continua possível; registrar o que realmente aconteceu é sempre bem-vindo; nenhuma linguagem de culpa, perda de sequência ou cobrança. Copy final pertence a missão de conteúdo/brand (FOUNDER-DECISION-02) e, quando clínica/nutricional, aos owners G04/G05.

## 14. Wearables — provider-neutral

Nenhuma marca, provider, intermediário ou device é prometido (PDR G06, DR-68). Nomes de provider aparecem apenas como identidade da fonte que a pessoa conectou, nunca como alegação de compatibilidade. A experiência funciona integralmente com capacidade degradada ou ausente: app + registro manual (L009, RS §2/§6 (caminho próprio)).

### 14.1 Conexão, finalidades e capacidade

| ID | Regra | Fonte |
|---|---|---|
| WEA-01 | **Conectar (FLOW-07):** a pessoa escolhe a fonte entre as rotas habilitadas `[DEP-G06]`, vê para que cada finalidade serve e concede somente as que quiser. Antes de conceder, aviso de que a plataforma externa pode agrupar ou revogar permissões de forma diferente e de que o app dirá quando uma escolha não puder ser respeitada. | AEC §5.1; PDM I6 |
| WEA-02 | **Finalidades locais separadas:** (a) leitura de atividades; (b) leitura de sinais de saúde/recovery; (c) escrita de workouts (envio). Conectar para ler não autoriza escrever; nenhuma finalidade autoriza share/Crew. Não se promete granularidade OAuth externa: se a rota não sustentar a escolha (ex.: revogar só leitura de saúde), o app desconecta a rota e explica o efeito. | AEC §5.1; PDM I6; CF §11 S07/S17 |
| WEA-03 | **Capacidade em nível de prova**, por rota/conta/tipo de workout: “disponível” (prova G06 para a rota e o tipo), “disponível com limites” (preflight declara perdas aceitáveis por componente), “não disponível para este destino” (não suportada), “não verificada” (tratada como indisponível; envio não é oferecido). Documentada publicamente, aprovada para a conta e comprovada no device são níveis distintos; disponibilidade no relógio é afirmada **por export**, pelo recibo, nunca por rota. A capacidade inclui device/OS/firmware: quando a rota não expõe o aparelho da pessoa, o estado é “comprovada para a rota; seu relógio não verificado”. | AEC §5.1; RS §4 |
| WEA-04 | **Ingestão:** estados ativa, aguardando/atrasada, indisponível (outage), lacuna irrecuperável explícita (janela/permissão de histórico). Atraso e outage são estados da integração: sem penalidade, sem HOLD médico, sem “treino perdido”. | AEC §5.3; AESL S08 |
| WEA-05 | **Vazio opaco** (ex.: store de saúde do sistema, como HealthKit, sem dados): “nenhum dado recebido desta fonte” — nunca “permissão negada”, “zero” ou “não treinou”; sugere conferir permissões no sistema sem afirmar a causa. | AEC §5.1; CF F05; AESL S25 |
| WEA-06 | **Desconectar:** cessam leitura e envio; filas canceladas; app e registro manual continuam; histórico recebido segue sua finalidade/retention `[DEP-G07]`; cópias já entregues no relógio não são recolhidas — dito antes de confirmar. | AEC §5.3; PDM I6 |
| WEA-07 | **Revogar uma finalidade:** cessa imediatamente usos, filas e retries dela; o efeito é mostrado antes; outra finalidade continua só se técnica e juridicamente sustentável na rota (WEA-02). Para exports, três casos distintos: o que estava na fila é cancelado; o que já foi despachado antes da revogação conserva o resultado real ou desconhecido (“pode ter chegado”); a cópia entregue permanece no relógio e não pode ser cancelada sem permissão de escrita. | AEC §5.3/§5.4; AEOS §13.1; AESL S21/S46 |
| WEA-08 | **Duplicata e multifonte:** a mesma atividade vinda de manual + provider + store vira um fato; as fontes aparecem no detalhe; duas sessões reais parecidas nunca são fundidas por proximidade (FLOW-08). | AEC §4; AESL S16/S22 |
| WEA-09 | **Strength:** app-first; relógio é suplemento fiel (STR-09). | RS §2 |
| WEA-10 | **Composição de estados do export:** cada cópia tem um nível de prova (L2–L5, LF, LU) × a atualidade da revisão (vigente, LO, LR) × sobreposições de controle (LH, LX, LP, LD). Uma sobreposição nunca apaga o fato de uma possível cópia remota; a forma de apresentar a combinação é design space. | AEC §5.3; AEOS §13.1 |
| WEA-11 | **Saídas de LU e oferta de “enviar”:** quando a rota permite leitura, o timeout é reconciliado antes de virar LU; recibo tardio leva LU a L4/L5; erro conhecido posterior leva a LF. Nova tentativa deliberada pode deixar duas cópias da mesma revisão, mostradas com a linguagem de LP. “Enviar” a mesma revisão ao mesmo destino só é oferecido a partir de LF ou LU, como nova intenção com o risco explicado. | AEC §5.3/§5.4; AESL Q06 |

### 14.2 Escada do export (WEA-L)

Planejado → enviado → aceito pelo provider → recebido no device (somente quando comprovável) → executado → retornado/importado → reconciliado. **Nunca “sincronizado no relógio” porque o provider aceitou** (AEC §5.3, PDM inv. 5).

| ID | Estado visível | Evidência exigida | O que a pessoa vê e pode fazer | Nunca dizer |
|---|---|---|---|---|
| WEA-L0 | Recusado na preparação | Preflight com perda que muda prescrição/safety ou imprevisível | Relatório de diferenças por componente; “execute no app”; alternativa só como outra revisão do motor, com confirmação própria. | “Simplificamos para caber.” |
| WEA-L1 | Pronto para enviar | Preflight aprovado | O que será enviado (exatamente os campos transmitidos: estrutura da sessão e identificadores neutros), destino, revisão e diferenças aceitáveis; ação “enviar” (ato explícito por sessão/revisão). Título, notas e metadados nunca levam HOLD/causa, limitação, sinais de recovery, fatores/confiança da explicação, Crew, modo, Nutrition ou motivos. | “No relógio.” |
| WEA-L2 | Na fila | Intenção registrada | Pendente e cancelável; app disponível. | “Enviado.” |
| WEA-L3 | Enviado | Transporte aceito | “Enviado; entrega não confirmada”; app disponível. | “Recebido”, “no relógio”. |
| WEA-L4 | Aceito por ‹destino› | Recibo do sistema externo | “O serviço recebeu; chegada ao relógio não confirmada”. | “No relógio.” |
| WEA-L5 | No relógio | Prova em nível de device | Único estado que afirma disponibilidade no device. | “Executado.” |
| WEA-L6 | Executado | Fato que ocorre no relógio, mas só se torna conhecido pela atividade retornada (L7/L8) | Nada é exibido por si: a sessão só passa a “realizada” quando a atividade importada é associada. | “Executado” com base em qualquer recibo. |
| WEA-L7 | Retornado/importado | Atividade recebida | Associação automática somente por referência do export; senão FLOW-08. | “Adaptação aplicada.” |
| WEA-L8 | Reconciliado | Associação + consequências avaliadas | Realizado na sessão; se a decisão oficial mudou, proposta (MAN-3). | — |
| WEA-LF | Falha conhecida | Erro conhecido | Motivo factual; app; nova tentativa deliberada como nova intenção. | “Tente de novo” automático em loop. |
| WEA-LU | Resultado desconhecido | Timeout possivelmente entregue, sem leitura/idempotência remota | “Pode ter chegado”; sem retry automático; conferir no relógio; app; nova tentativa deliberada explica risco de cópia duplicada; saídas em WEA-11. | “Falhou” ou “enviado com sucesso”. |
| WEA-LO | Obsoleto | Revisão mudou antes do envio | Pendente invalidado automaticamente; indica a revisão vigente; nada é reenviado sem ato. | — |
| WEA-LR | Versão anterior no relógio | Envio anterior à revisão atual | “O relógio pode ter a versão anterior”; substituir ou cancelar como intenção separada, se suportado; app com a versão vigente. | “Atualizado no relógio” sem prova. |
| WEA-LP | Substituição/cancelamento pendente ou parcial | Etapas sem prova; delete+create parcial | Estado de cada etapa; possível cópia residual ou ausência; sem substitutos repetidos; nunca apagar template de outro autor. | “Substituído”/“removido” sem prova. |
| WEA-LD | Discrepância | Aviso posterior do destino | Diferença registrada; não retroaprova; app. | “Pronto.” |
| WEA-LH | Retido | HOLD no escopo | Pendentes cancelados; cópia entregue sinalizada como possivelmente ainda no relógio, sem refletir a retenção; cancelamento só se suportado e autorizado. | “Removido do relógio” sem prova. |
| WEA-LX | Sem permissão / desconectado | Revogação/desconexão | Fila cancelada; o que foi despachado antes conserva resultado real ou “pode ter chegado”; a cópia entregue permanece e não pode ser cancelada sem permissão de escrita (WEA-07); nada reativa por retry; reconectar revalida. | “Envio cancelado” ou “removido do relógio” sem prova. |

Execução de cópia antiga: o retorno registra a revisão realmente executada quando a referência do export volta com a atividade (senão, desconhecida ou proposta — RUN-07); o realizado é preservado e o futuro readaptado (AEC §4/§5.3; F04.7). Reconexão revalida estado/autoridade e não reenvia tudo (AR-09).

## 15. Nutrition contextual

| ID | Regra | Fonte |
|---|---|---|
| NUT-01 | **Lugar:** insight vive na sessão/decisão correspondente e aparece em Hoje S4 quando pertinente à próxima demanda. Faceta por momento: pré-sessão, sessão longa, intervalo curto e evento → preparação (SURF-07); durante → faceta de execução (SURF-08/09), só com conteúdo aprovado; recuperação pós-sessão → fechamento e realizado (FLOW-05, SURF-07). Não existe aba, galeria, diário ou consulta avulsa. | AR-07; PA §3; SURF-X-01 |
| NUT-02 | **Momentos:** preparação pré-sessão, inclusive sessão longa (demanda futura conhecida e oportunidade); durante (somente conteúdo aprovado com contexto de tolerância/oportunidade; tempo decorrido não dispara lembrete); recuperação pós-sessão (somente após sessão realmente observada); intervalo curto entre sessões (próxima demanda/tempo conhecidos); evento/prova (preparação antecipada; nunca protocolo novo no dia). Evento ou sessão alterados invalidam o dependente. | AEC §6 Fases |
| NUT-03 | **Classe por função, não por rótulo:** educação geral (conceito revisado ligado à categoria da sessão); guidance contextual de performance (asset aprovado selecionado/enquadrado para sessão, fase e revisão); prescrição individual — **fora da V1**, nunca exibida. A apresentação não pode sugerir prescrição individual (quantidade, porção, timing pessoal, dieta). | AEC §6; DR-67 |
| NUT-04 | **Estados (ST-NUT):** provisório (sem aprovação G05: não publicado à pessoa); elegível → exibido → reconhecido/dispensado; contexto necessário (pergunta voluntária mínima); omitido (nada aparece, sem aviso de ausência); encaminhamento (só conteúdo aprovado); retido; obsoleto (retirado; se já exibido, nota curta de que não se aplica mais porque a sessão mudou). | PDM §5; AEC §6 |
| NUT-05 | **Contexto voluntário mínimo:** preparação, acesso, tolerância ou restrição — só quando muda a opção elegível; recusa = desconhecido; restrição mantida privada limita o dependente sem exigir diagnóstico. Nunca peso, calorias, macros, diário, exames. | AEC §6 Contexto mínimo |
| NUT-06 | **Nada é inferido:** refeição, ingestão, déficit, glicogênio ou disponibilidade energética nunca são deduzidos de agenda, wearable ou comportamento; reconhecer/dispensar um insight não é ingestão. | AEC §6; AESL S30 |
| NUT-07 | **Pedido de dose** (“+20% de carboidrato”, g/kg, mL/h, timing pessoal) — direto ou via conversa — não produz dose: educação elegível, omissão ou encaminhamento conforme policy. | DR-67; CF S14 |
| NUT-08 | **Privacidade:** contexto e insights Nutrition nunca cruzam para Crew, share, notas de workout exportado, conteúdo de aviso, tela bloqueada ou widget. | C021; PDM inv. 9; AEC §5.2 |
| NUT-09 | **Excluído:** contador de calorias, macros, diário alimentar, dieta, meal planner, receitas, leitor de código de barras, suplementos (produto ou dose), “comer de volta” calorias do relógio, lembretes de hidratação por tempo, pesagem para Nutrition. | C039; RS §2/§3 |
| NUT-10 | **Conteúdo e lógica** (textos, seleção, públicos, restrições, encaminhamento) `[DEP-G05]`; até a aprovação por asset/policy/versão, o Designer trabalha com slots `‹conteúdo aprovado›` e estados, sem texto real. | PDR G05 |
| NUT-11 | **Avisos:** nenhum aviso Nutrition por tempo decorrido ou proximidade de refeição; o insight aparece no Hoje/sessão. | AEC §6 Durante; L020 |

## 16. External Shareability — V1 sem social network

Crew, CRW-01–23, membership/convites e PB-F-02 social são DEFERRED, NOT REJECTED, não fluxos/telas V1. A tese/limites futuros continuam Canon§7. SOCIAL NETWORK ≠ EXTERNAL SHAREABILITY. Create socially expressive outputs without requiring a social network.

| ID | Contrato de output | Fonte |
|---|---|---|
| SHR-01 | Famílias prioritárias: completed workout, PR, race, milestone, weekly completion, meaningful evolution/força, personal streak, recap/performance e relevant multisport achievement; distância/volume próprios elegíveis. Não exigir nove templates/telas ou share após todo treino. | C054; Scope§5 |
| SHR-02 | Artefato premium, limpo, reconhecível/identidade Vilumo, narrativa de conquista/evolução/identidade; não screenshot cru de dashboard. Origem no objeto, não feed/galeria pública. | C017–20/C027 |
| SHR-03 | Convites/Crew/coletivo DEFERRED. Nenhuma ligação social/contact graph como requisito ou payload. | C041/C054 |
| SHR-04 | Selecionar campos próprios allowlisted PA§7; prévia exata por revisão e destino, cancelar sem efeito. PR/tendência/estimativa têm critério/origem/limite, sem precisão inventada. Corrigir fato invalida prévia dependente. | I7/I9; G02/G03 |
| SHR-05 | Confirmar ato/destino/formato; cópia só do visto. Native/OS share sheet e formatos para Stories/WhatsApp/TikTok quando pertinentes, sem API/social-login/upload/post automático ou prova fictícia de postagem. Falha/unknown honestos; sem recall externo prometido. | PA§7; F10 |
| SHR-06 | Excluir Health/FC/HRV/RPE/RIR/sono/recovery/Nutrition, causa/limitação, localização/rota/horário exato sensível, terceiros/Crew, IDs internos/token e metadata oculta inclusive título/alt-text/nome do arquivo. Nada de inferência de saúde no design. Prévia/inclusões reais, sem ampliar consentimento por assinatura ou ingestão. | C021/L014; PA§7 |
| SHR-07 | Semana/streak pessoal seguem continuidade apropriada com descanso/adaptação, não treinar todo dia ou volume como mérito. Unknown não declara conquista; confirmar evidência necessária ou omitir esse claim/resumir fatos conhecidos. Não pressionar compensação. | L006/L013/L019/L020 |
| SHR-08 | Share disponível por iniciativa em treino/Progresso/semana, sem dominar Hoje/fluxo. Registro mínimo da projeção, opt-out/impedir futuras; sem likes/alcance/audiência/atribuição individual importados. Word of mouth/orgânico é hipótese, não efeito provado. | C003/C022/C054; G07/G11 |

## 17. Agente/conversa — DEFERRED

AGT-00–14 e FLOW-16 ficam fora da primeira V1 para preservar foco; nenhum chat genérico, agente visível, hub/aba/placeholder. Contratos futuros de explainer/canal são os já publicados, sem novo modelo/tools/autoridade. Caminhos diretos/explicação por template aprovados fecham o loop. Escolha posterior de LLM permanece G07/G09/AI/Security; não é decisão pendente que bloqueia UI agora.

## 18. Falhas e estados degradados

Regra comum: nenhum estado termina sem saída; falha de integração nunca vira falha do atleta; nenhum erro vira sucesso silencioso; o que não depende da falha continua funcionando (PR-08/PR-10, AR-09).

| ID | Situação | O que aconteceu / impacto | Precisa agir? | Próxima ação / saída | Fonte |
|---|---|---|---|---|---|
| DEG-01 | Sem dados do wearable | Nada chega da fonte; decisões usam o que existe, com limitação se a fonte importava. | Não | Registrar manualmente; ver estado em Integrações. Nunca “não treinou”. | WEA-04/05 |
| DEG-02 | Dados desatualizados | Última informação antiga; nada muda o plano com base nela. | Opcional | Atualizar ou registrar; limitação ao lado da ação se afeta. | CNF-04 |
| DEG-03 | Provider fora do ar | Ingestão/envio indisponíveis; fila pendente visível. | Não | Executar no app; registrar; aguardar. Sem penalidade nem HOLD. | AEC §5.3 |
| DEG-04 | Atividade duplicada (manual + importada) | Uma carga; fontes visíveis no detalhe. | Só se ambíguo | FLOW-08: “mesma atividade” / “diferentes”. | WEA-08 |
| DEG-05 | Envio falhou (erro conhecido) | A sessão não está no relógio. | Se quiser o relógio | Motivo factual; executar no app; nova tentativa deliberada. | WEA-LF |
| DEG-06 | Entrega desconhecida | Pode ou não ter chegado ao relógio. | Opcional | Conferir no relógio; app; nova tentativa deliberada com aviso de possível cópia duplicada; sem retry automático. | WEA-LU |
| DEG-07 | Informações conflitantes | Fontes ou relato × relógio divergem; decisão dependente fica indeterminada; limitação relatada prevalece sobre sinal favorável. | Se puder resolver | FLOW-08 ou correção na origem; escopos independentes seguem. | CNF-03; AEC §2 |
| DEG-08 | Pessoa ignora a adaptação | Vigente permanece enquanto válido (CONF-10); iniciar a sessão assim mesmo segue CONF-16. | Não | Proposta disponível enquanto válida; depois histórico; sem cobrança. | CONF-09 |
| DEG-09 | Registro de Strength incompleto | Sessão em aberto; restante desconhecido. | Opcional | Fechar como parcial/completa; retomar se válido. Nunca “não realizada”. | STR-11 |
| DEG-10 | Corrida ausente/perdida | Realizado desconhecido, não falha; “aguardando dados” só com evidência da integração (ST-SES). | Opcional | Aguardar, se houver evidência; registrar; marcar não realizada; sem dado, segue desconhecido. | AESL S08/S09 |
| DEG-11 | Duplicata acidental (registrou duas vezes) | A provável duplicata não é somada; a decisão dependente fica limitada até resolver. | Sim | Apagar o registro próprio acidental ou associar (FLOW-08). | STR-04; AEC §4; HC04 |
| DEG-12 | Conflito de versão (edição concorrente, outro aparelho, proposta antiga) | Ato antigo não aplica. | Rever | Ver a avaliação atual e confirmar de novo, se quiser. | CONF-02/12 |
| DEG-13 | Sync tardio | Histórico atualizado; futuro pode receber proposta; passado preservado. | Só se houver proposta | Ver o que mudou; confirmar ou não. | HOJ-C11; EXP-07 |
| DEG-14 | Permissão revogada (sistema ou provider) | Só quando a rota expõe a revogação; em leitura opaca vale WEA-05, sem estado nem aviso de revogação. Finalidade cessada; filas canceladas; export despachado conserva “pode ter chegado” e cópia entregue permanece (WEA-07). | Opcional | Reconceder ou seguir com app; se a rota não sustenta outra finalidade, desconecta e explica. | WEA-05/07 |
| DEG-15 | Capacidade indisponível | Envio não oferecido ou recusado no preflight. | Não | Executar no app; ver limites em Integrações. | WEA-03/L0 |
| DEG-16 | Baixa confiança do sistema | Vigente válido mantido, pergunta mínima ou retenção do dependente. | Só se houver pergunta | Responder/recusar; usar caminhos não afetados. | CNF-01–11 |
| DEG-17 | Offline | Execução/registro locais no limite ainda válido; nada remoto parece atualizado; efeitos remotos pendentes. | Não | Continuar; reconexão revalida sem duplicar nem reenviar tudo; retenção nova recebida, ou limitação declarada no aparelho, vence o preparado; atos pendentes seguem CONF-17. | AR-09; AEC §5.3 |
| DEG-18 | Explainer opcional indisponível | Template fiel/caminhos diretos; conversa já é deferred. | Não | Nenhum downgrade de autoridade/safety ou bloqueio do loop. | AEOS§16 |
| DEG-19 | Motor sem candidato válido | ASK, RECONCILE ou HOLD conforme causa, só no escopo. | Conforme rota | Responder; resolver associação; ver quem resolve; funções não afetadas. | AEOS §10; AESL S27 |
| DEG-20 | Avaliação indisponível quando era necessária | Escopo que dependia da nova avaliação fica retido com aviso operacional; “manter o último plano” não é fallback automático. | Não | Execução de revisão ainda válida e não afetada continua; registro continua; próximo passo operacional indicado. | AEOS §12.3 |
| DEG-21 | JEV indisponível ou divergente | Nenhum efeito visível (SHADOW). | Não | — | AEOS §12.3; AESL S43 |
| DEG-22 | HOLD ativo | Escopo retido. | Ver | FLOW-09; funções não afetadas; cópia remota sinalizada (WEA-LH). | AM-11 |
| DEG-23 | Consentimento recusado | Primário dependente não inicia; direitos/registro/histórico próprios seguem. Opcional não usado, sem incompletude. | Não | Rever escolha em Privacidade quando desejar; sem alternativa social. | PDM I6/I10 |
| DEG-24 | Falha de idade | Nenhuma identidade/vínculo; resultado neutro; nada a terceiros. | — | Encerra, sem dica de contorno. | ONB-03 |
| DEG-27 | Erro de share | Nada projetado. | Opcional | Nova tentativa deliberada; origem intacta. | SHR-05 |
| DEG-28 | Atualização/cancelamento remoto parcial | Possível cópia antiga ou ausência no relógio. | Opcional | Conferir no relógio; app com a versão vigente. | WEA-LP |
| DEG-29 | Associação ambígua (duas sessões parecidas) | Decisão dependente limitada. | Opcional | FLOW-08 ou “não sei agora”. | AESL S16 |
| DEG-30 | Mudança durante a execução | Proposta para o restante; feito intocado. | Opcional; P0 se retenção | Aceitar/recusar; retenção interrompe só o dependente. | CONF-07 |
| DEG-31 | Horizonte encerrado sem continuação adotada | Exceção: a continuação foi apresentada antes do fim (CONF-15) e não foi adotada; nada prescrito além do horizonte. | Para seguir com plano | Revisar/adotar continuação; registrar e descansar seguem. | INT-02 |
| DEG-33 | Dado suprimido reenviado (replay/backfill) | Nada reaparece. | Não | — | AEC §4; AESL S23 |
| DEG-34 | Proposta sem explicação fiel possível | Proposta não apresentada. | Não | Vigente segue somente se ainda válido; senão CONF-10/DEG-20. | CONF-14 |
| DEG-35 | Cópia no relógio de sessão depois retida | A cópia pode continuar no relógio sem refletir a retenção. | Ver | Aviso na sessão; cancelamento remoto só se suportado/autorizado; registrar o que fizer. | WEA-LH; AEC §7.1 |
| DEG-36 | Execução esquecida (não encerrada) | Num gatilho de ST-SES a sessão passa a “em aberto”; registros preservados; medição para. | Opcional | Fechar como parcial/completa ou retomar se a revisão ainda valer. | ST-SES; STR-11 |
| DEG-37 | Ato pendente (offline ou sem resposta) | Confirmação, edição, resposta ou relato ainda não aplicados; vale o vigente. | Não | Aguardar reconexão: a guarda decide; repetir o ato não duplica. | CONF-17 |

| DEG-38 | Assinatura pendente/desconhecida/expirada | Estado comercial, não falha do atleta/hold médico. | Para novos efeitos pagos | Retomar/restaurar/ver oferta sem duplicar cobrança; registrar/fechar execução em curso, dados e direitos continuam. | ST-SUB; C053 |

## 19. Continuidade

**CTN-01 Cadeia do loop** — cada elo abre a mesma referência (AR-03):

| Elo | O que a pessoa vê | Onde | Estado |
|---|---|---|---|
| Plano → Hoje | A sessão (ou descanso/recuperação) da janela vira o item principal. | SURF-02 → SURF-01 S2 | Sessão pronta |
| Hoje → execução | Iniciar abre a faceta de execução com a revisão fixada; ou registrar depois; ou relógio. | SURF-08/09 | Em execução |
| Execução → resultado | Fechamento registra o realizado; resumo planejado × realizado. | FLOW-05 → SURF-07 | Concluída completa/parcial |
| Resultado → interpretação | Reconciliação de fontes; comparação com regra `[DEP-G03]` ou `UNCLASSIFIED`. | SURF-07 | Observação associada |
| Interpretação → adaptação | Nova avaliação; manifestação por nível MAN. | SURF-06; Hoje S3 | ST-DEC |
| Adaptação → próxima sessão | Proposta confirmada ou vigente mantido; S6 mostra a próxima. | Hoje / Plano | Revisão vigente |

| ID | Regra | Fonte |
|---|---|---|
| CTN-02 | **Semana/horizonte (Plano):** uma linha do tempo com as duas modalidades e descanso/recuperação como itens próprios; estados por item (feita, parcial, em aberto, sem registro, não realizada, retida, próxima); marca de revisão onde mudou; propostas pendentes; relações entre sessões sob demanda. Sem totais/streak como mérito; evolução/recap elegíveis e comparações sob demanda em Progresso, conforme dados/critério. | PA §2/§4; L020 |
| CTN-03 | **“Meu treinamento vive aqui”:** execução no app, atividade importada e registro manual convergem na mesma sessão e em Progresso; export nunca cria sessão paralela; outras modalidades importadas aparecem como contexto. | PDM inv. 1; RUN-12 |
| CTN-04 | Interromper prática sem motivo encerra treino ativo e novas prescrições, sem vínculo/ação social ou lembrete de culpa. Ato de período passado só anotação histórica, sem reescrever decisões. | F07; L013 |
| CTN-05 | **Sem dados ≠ interrompido ≠ descanso:** `NO_DATA` é neutro; o app não infere abandono, não envia aviso de “sumiço” e não expõe nada à Crew. A volta depois de uma ausência não declarada segue HOJ-C23/J-21. | L013; PDM §5 |
| CTN-06 | **Retorno:** retomar → contexto atual mínimo (disponibilidade, limitação) → proposta `RETURN` rebaseada → adoção → primeira janela. Sem compensação, restauração de volume ou streak; retorno após dor/doença/lesão/restrição mantém HOLD dependente e revisão qualificada `[DEP-G04]`. Saída do estado “retornando” conforme modelo `[DEP-G02]`. Compartilhar output próprio elegível é opcional (SHR-01), sem motivo de retorno/saúde ou check-in social. | AEC §4; CF F07; AESL S28 |
| CTN-07 | **Repetir sessão** a partir do realizado em Progresso prepara nova sessão sob a coordenação atual (proposta + confirmação); nunca reabre ou sobrescreve a realizada. | AR-04 |
| CTN-08 | **História preservada:** decisões, revisões, versões executadas/exportadas e realizado permanecem; correções rastreáveis; eliminação por direito exercido segue G07. | AEC §3; PDM §7 |

## 20. Notificações e superfícies do telefone

**NOT-01 Princípio.** Notificar apenas com valor claro: decisão exige a pessoa; treino relevante mudou ou ficou retido; sync/envio falhou de forma material; próxima sessão depende de contexto. Um aviso por mudança material de estado de um objeto; sem repetição sem fato novo. Nenhum microcopy final aqui.

| ID | Classe | Gatilho | Prioridade | Abre | Padrão |
|---|---|---|---|---|---|
| NOT-P0 | Segurança na sessão em curso/iminente | HOLD/restrição nova no escopo dessa sessão | P0 | SURF-06 ou execução | Ligado |
| NOT-A | Decisão para a próxima sessão | Proposta (MAN-3) que afeta sessão próxima, escolhida ou exportada | P1 | SURF-06 | Ligado |
| NOT-B | Sessão próxima invalidada | Fato externo à ação da pessoa (policy/autoridade expirada ou revogada, permissão revogada fora do app) torna a próxima sessão inutilizável sem ser safety | P1 | SURF-06/SURF-07 | Ligado |
| NOT-C | Falha material de integração | Envio falhou ou ficou desconhecido para sessão próxima; permissão revogada (só quando a rota a expõe; leitura opaca segue WEA-05); rota desconectada | P2 | SURF-07/SURF-12 | Ligado |
| NOT-D | Contexto necessário | Pergunta (ASK) que bloqueia a próxima sessão | P1 | SURF-06 | Ligado |
| NOT-F | Lembrete pessoal | Horário escolhido pela própria pessoa para a sua sessão | P4 | SURF-07 | **Desligado** (opt-in) |
| NOT-G | Transacional de conta | Confirmação de mudança de consentimento, exportação de dados pronta, segurança da conta | — | SURF-13 | Ligado |

| ID | Regra | Fonte |
|---|---|---|
| NOT-02 | **Nunca notificar:** recomputação sem mudança, `KEEP`, microajuste (resultado oficial que não muda a decisão — MAN-0/1, §10.3; sem limiar de UX), flutuação de confiança, sucesso de envio, sync rotineiro, insight Nutrition por tempo, lembrete de volume/sequência/engajamento, “você não treinou”, estado de outra pessoa, contagem social, proatividade da conversa. | L016/L020; RS §6 G09; MAN-0/1 |
| NOT-03 | Deep link sempre ao objeto canônico, com tratamento de alvo obsoleto/indisponível (NAV-04). | AR-03 |
| NOT-04 | Desligar uma classe não muda decisão nem retenção; o estado continua visível no app. Classes P0/A também aparecem no Hoje. | C034 |
| NOT-05 | Conteúdo do aviso informa categoria e ação, e a categoria aparece só com o aparelho desbloqueado ou no app (NOT-08); nunca dado sensível (causa de HOLD, sinais de saúde/recovery, Nutrition, motivos). A existência de retenção, restrição ou safety e de pergunta sobre limitação/recovery também é sensível. | PB-F-03; SEC-J3-05 |
| NOT-06 | Agrupamento, horários silenciosos e forma são design space, respeitando as configurações do sistema operacional. | D009 |
| NOT-07 | Avisos, consentimento e textos de divulgação no idioma escolhido, com alcance equivalente em PT-BR/EN; consentimento registra idioma e versão. | SEC-J3-06 |

**NOT-08 Tela bloqueada, widgets e visão de execução.** O conteúdo renderizável por padrão é **L0 genérico para todas as classes**: sem categoria, sem dado sensível, sem conteúdo de Crew, sem nome ou estado de outra pessoa. **L1 opcional** (opt-in da própria pessoa): conteúdo próprio não sensível de treino (ex.: que a sessão de amanhã tem uma proposta). Em **nenhum** nível: sinais de saúde/recovery (FC, HRV), existência ou causa de retenção, restrição ou safety, pergunta sobre limitação/recovery, Nutrition, motivos, conteúdo de Crew, nomes ou estados de terceiros. A visão de execução fora do app (etapa, iteração, tempo) é opt-in na primeira execução e segue as mesmas exclusões. Dispositivo compartilhado e controle coercitivo pertencem ao threat model `[DEP-G08]` `[DEP-G09]`. Fonte: PB-F-03, SEC-J3-05, RS §6 G09.

## 21. Jornadas

Provas analíticas: nenhuma jornada exige destino novo, conversa, Crew ou wearable para fechar; todas terminam em estado com saída. “→” indica transição de estado (§5). Não são testes de uso nem de runtime.

### 21.1 Primárias

| ID | Jornada | Sequência e transições | Fechamento / recuperação | Prova |
|---|---|---|---|---|
| J-01 | Primeiro uso solo e primeira semana | FLOW-01: 18+ → experiência pessoal → consentimento primário → mínimo (ONB-06–11) → semana/proposta inicial `PRESENTED` + explicação de coordenação → oferta de assinatura transparente (FLOW-17), após valor → adotar sob entitlement atual (`ACCEPTED`→`APPLIED`; ST-PLAN sem plano→vigente) → Hoje (HOJ-C18) → execução ou descanso → fechamento → Progresso. | Próximo passo entendido sem wearable/Crew/conversa. Contexto insuficiente → limitação/ASK; recusa de opcional sem incompletude. | CF F01→F02→F03/F07→F05/F06; CF §11 S01; AESL S25 |
| J-02 | Conflito Running × Strength | Fatos/modelo/adequacy: válido adequado → KEEP. Necessidade real → Run-first/Strength-first/Balanced declarado, menor alternativa eficaz e trade-off admissível → prévia → confirmar. Preferência material faltante → ASK mínimo. | Safety/authority vencem; recusa vira constraint, vigente só se válido. | AEC§1.2; AEOS§6/§10; FZ-S01–08 |
| J-03 | Força registrada e corrigida afeta a próxima corrida | SURF-09: séries registradas sem confirmação → correção de carga → fechar → observação → reavaliação → proposta para a corrida se o resultado oficial mudar; senão MAN-0/1. | Um fato, sem plano paralelo; sem regra G03, `UNCLASSIFIED`. | CF F03/F05/F06; CF §11 S03; AESL S10–S12/S41 |
| J-04 | Corrida pelo relógio (closed loop) | SURF-07 → FLOW-06 (WEA-L1) → envio (L2→L3→L4; L5 só com prova) → execução no relógio → importação (L7) → associação por referência do export → reconciliado (L8) → adaptação. Ramos: perda material → L0 + app; timeout → LU + conferir/app; revisão nova depois do envio → LR + substituição como intenção separada. | Estado honesto em cada nível; app sempre disponível enquanto válido. | CF F04/F05; CF §11 S06/S07/S15/S16; AESL S17–S21 |
| J-05 | Dado atrasado | Janela passa → HOJ-C10 “aguardando” → atividade chega depois → reconciliação → histórico atualizado → proposta para o futuro se a decisão mudar; passado preservado (EXP-07). | Sem falha retroativa; registro manual possível a qualquer momento. | CF F05/F06; CF §11 S04; AESL S08/S09/S22/Q02 |
| J-06 | Descanso e recuperação honrados | REST/RECOVER no plano → HOJ-C04/C05 → confirmar (honrado) ou não (desconhecido) → registro pessoal em Progresso; share próprio elegível opcional (FLOW-10). | Nunca falha; confirmação tardia não envia check-in. | CF F07/F10; CF §11 S05 |
| J-07 | Interrupção e retorno | FLOW-14 → `INTERRUPTED_DECLARED` → retomar → `RETURNING` → contexto mínimo → `RETURN` → adoção → primeira janela. | Sem compensação/streak; restrição → HOLD dependente. | CF F07; CF §11 S09; AESL S28 |
| J-08 | Limitação relatada com relógio favorável | Relato antes de iniciar (HOJ-R7, no Hoje ou na Sessão) ou durante/depois (RUN-08/STR-05) → HC03 → HOLD dependente (AM-11; P0 se sessão iminente) → registrar/corrigir/contestar (FLOW-09). Offline: o relato vale na hora para a orientação local (CONF-17). | HRV boa, override, tempo ou aceite não liberam; saída por evidência/owner `[DEP-G04]`; mesmo HOLD com qualquer prioridade. | CF F06/F07; CF §11 S13; AESL S07/S42 |
| J-09 | Proposta ignorada, recusada ou obsoleta | `PRESENTED` → (a) sem resposta: CONF-09 → `EXPIRED`; (b) recusa → `DECLINED`, sem reapresentação; (c) edição de agenda antes do aceite → `STALE` → nova avaliação; aceite antigo rejeitado; (d) iniciar a sessão com a proposta pendente → CONF-16. | Vigente executável enquanto válido (CONF-10); sem cobrança. | CF F06; AESL S15/S32/Q01/Q04 |
| J-10 | Mudança durante a execução | s1 em execução → fato novo → proposta do restante (CONF-07) → aceitar (restante s2) ou recusar (segue s1); HOLD novo → interrompe só o dependente (P0). | Feito intocado; revisão executada registrada. | CF F03; AESL S29/S33 |

### 21.2 Secundárias

| ID | Jornada | Sequência e transições | Fechamento / recuperação | Prova |
|---|---|---|---|---|
| J-13 | Share do próprio retorno ou marco | Progresso → FLOW-10 → prévia exata → confirmar → cópia estática; cancelar → nada. | Terceiros, Crew e coletivo não são opções. | CF F10; CF §11 S12 |
| J-14 | Nutrition contextual com mudança de demanda | Longão planejado → insight elegível em S4 → plano muda para descanso → insight obsoleto retirado + export pendente invalidado; pedido de “+20%” → sem dose. | Sem ingestão inferida; conteúdo `[DEP-G05]`. | CF F02/F06; CF §11 S06/S14; AESL S30 |
| J-15 | Revogar escrita com envio pendente | FLOW-15/WEA-07 → fila cancelada (WEA-LX); despachado antes conserva “pode ter chegado”; cópia entregue permanece e não pode ser cancelada sem escrita → leitura continua só se a rota sustentar; senão desconecta e explica. | Token válido não reativa; app disponível. | CF F04; CF §11 S17; AESL S21/S46 |
| J-18 | Execução offline e reconexão | Execução offline → registros locais → reconexão revalida → sem duplicar nem reenviar tudo; retenção recebida vale para o que ainda não foi executado. | Nenhum registro perdido. | AR-09; RS §2/§6 (caminho próprio) |
| J-19 | Duplicata e associação ambígua | Registro manual + importação + outra sessão parecida → `MATCH_PROPOSED` → FLOW-08 → um fato; sessões reais distintas preservadas; replay de suprimido sem efeito. | Ambiguidade limita só o dependente. | CF F05; CF §11 S08/S18; AESL S16/S22/S23 |
| J-21 | Retorno após ausência não declarada | `NO_DATA` por várias janelas → pessoa abre o app → HOJ-C23: decisão corrente reavaliada sem compensação, item único opcional para registrar o período ou marcá-lo como pausa (anotação histórica, sem efeito de interrupção corrente — ST-CTN), pergunta factual só se decisiva → próxima janela. | Sem lista de faltas, contagem ou rótulo de abandono. | CF F05/F07; CF §11 S09; AESL S08/S09 |

J-11/12/16/17/20 são DEFERRED com social/conversa; nenhuma tela ou estado vazio. J-22: prévia de semana coordenada → valor → oferta FLOW-17 → entitlement verificado → ato de adoção → Hoje/treino; cancelar volta à prévia/dados, expiração não impede registro/fechamento. J-23: sessão observada → modelo atualizado → semana válida/adequada preservada, sem adaptação/aviso; necessidade real → menor proposta eficaz e agência.

## 22. Áreas provisórias e dependências (G01–G11)

Inventário único de decisões residuais: [PDR §5](PRODUCT_DECISION_REGISTER.md); consumo por etapa: [RS §6](V1_RELEASE_SCOPE.md). Esta tabela só mapeia onde cada dependência toca a UX; não cria owner, prova ou decisão nova.

| ID | Área dependente | Gap | Estrutura já fixada aqui | Provisório até a prova | Onde |
|---|---|---|---|---|---|
| DEP-01 | Objetivos, propósitos de sessão, perfis cobertos, catálogo | G01 | Elegibilidade, limitação honesta, retenção “fora do domínio”, slots | Catálogo, exemplos prescritivos, claim de suporte pleno | ONB-06/12, RUN-01, STR-01 |
| DEP-02 | Repertório Strength e equipamento | G01 | Substituição só por alternativa aprovada; “outro exercício” limitado | Repertório e alternativas reais | STR-02/06/10 |
| DEP-03 | Sinais, instrumentos, escalas/âncoras (RPE/RIR, recovery percebido), alvos/baselines, criticality, materialidade, duração/continuação do horizonte, saída de “retornando” | G02 | Construtos distintos, estados, ASK, MAN derivado do resultado oficial | Perguntas, escalas, números, limites, horizonte | RUN-03/08, STR-05, ASK-08, §10.3, INT-02, CTN-06 |
| DEP-04 | Aderência abaixo/igual/acima, parcial, tolerância | G03 | `UNCLASSIFIED`, parcial/desconhecido/correção | Rótulos automáticos de aderência | RUN-09, STR-07 |
| DEP-05 | Limitação/restrição, red flags, urgência, encaminhamento, evidência de saída, retorno clínico | G04 | HOLD escopado, owner, contestação, funções preservadas | Triagem, copy clínica, liberação, retorno prescrito, mecanismo de evidência de saída | ONB-11/12, AM-09/11, ASK-07, EXP-05, CTN-06 |
| DEP-06 | Conteúdo e lógica Nutrition | G05 | Lugar, momentos, classes, estados, omissão, obsolescência, privacidade | Textos, seleção, públicos, encaminhamento | NUT-01–11 |
| DEP-07 | Rotas wearable habilitadas e nível de prova | G06 | Finalidades, escada WEA-L, fallback app, linguagem proibida | Quais rotas/destinos; capacidade por rota/tipo; prova de device | WEA-01/03 |
| DEP-08 | Dados/retention/recipients/consentimento e outputs externos | G07 | Finalidade e prévia/allowlist/direitos/I10 OFF | Copy final/prazos/destinatários reais | SURF-13/SHR-/RUN-13 |
| DEP-09 | 18+, conta/identidade/abuso | G08 | Entrada pessoal e direitos, notificações privadas | Método proporcional e prova antes de implementação; social deferred | ONB-03/NOT-08 |
| DEP-10 | Execução/entitlement/sensores/segundo plano e explainer futuro | G06/G07/G09 | Ramo tempo/manual e métricas quando capability/finalidade comprovadas; guardas de acesso distintas | Prova real antes de ativação/claim, sem escolher provider/LLM | RUN-06/13; ST-SUB; AEOS |
| DEP-11 | Oferta comercial exata | G10 | Subscription-first, value-before-hard-ask, trial/anual/mensal/timing testáveis | Preço/terms/oferta real antes de cobrar, sem bloquear visual | SURF-14/FLOW-17 |
| DEP-12 | Eficácia e claims | G11 | Nenhum claim de eficácia, prevenção ou segurança | Claims dependentes | §1.2, EXP-08 |
| DEP-13 | Catálogo de templates de explicação por classe, rota e fator (FAC), PT-BR/EN | G02 (claims de domínio; G04/G05 quando aplicável); G09 (validador e testes de cobertura, AI Systems, AESL S38/S44); voz em FOUNDER-DECISION-02 | Blocos EXP-01, vínculo EXP-03, template primeiro EXP-04; o Designer usa slots | Textos e cobertura do catálogo; sem ele, nenhuma proposta MAN-3 é apresentada (CONF-14) | EXP-04, CONF-14 |
| DEP-14 | Identidade de conta: entrar/sair, vários aparelhos, recuperação, reautenticação antes de exportar, eliminar ou encerrar | G08/G09 (Security/Engineering) | Fora desta especificação; só fixado: export dos próprios dados entregue na superfície autenticada e ações destrutivas com confirmação explícita (SURF-13) | Método, trust boundary e fluxos de conta | SURF-05/13, NOT-G, §24 (handoff atual) |
| DEP-15 | Construtos de fatos/sensibilidade e eventual extração futura | G02/G04/G07/G09 | Classificação determinística; conversa deferred, sem coleta nova | Catálogo/prova antes de uso dependente | AEC/AEOS; futuro AGT |

Nenhuma dependência bloqueia a estrutura de UX ou um futuro Figma estrutural (RS §6). Ela bloqueia somente o conteúdo, número, método ou claim indicado, que não pode ser preenchido por placeholder com aparência de final.

## 23. Disposição de issues/decisões anteriores para o freeze

| Registro da UX r3 | Disposição atual | Próximo passo real |
|---|---|---|
| UPSTREAM-ISSUE-01 / FD-03 telefone | Escopo V1 permite tempo/avanço/registro informado e métricas medidas somente com capability/finalidade comprovadas, sem mapa/traçado/coleta em pausa. PDR G06/G07/G09 agora registra essa dependência; não prometer sensor inexistente. | Engineering/Security provam rota/dispositivo/finalidade antes de ativação/claim. Desenhar os estados já definidos; nenhum blocker de UI. |
| UPSTREAM-ISSUE-02 compromisso | DEFERRED com Crew. Não implementar estado coletivo dependente de adesão na V1. | Retomar apenas em expansão autorizada, preservando limites de privacidade anteriores. |
| UPSTREAM-ISSUE-03 plano inicial/continuação | AEOS§10.2 define REPLAN sobre NONE explícito/scope INITIAL/APPLY_PLAN_CHANGE e continuação com ato atual. | Engineering prova guardas na implementação futura. Sem classe nova inventada na UX. |
| UPSTREAM-ISSUE-04 pendência ao iniciar | SIS§7/AEOS preservam evento agência trace/StabilityState, composto stale e nenhuma alteração ao restante sem fato pós-início; demais sessões/safety seguem. | Prova executável futura; nenhum filtro ou redesign UX. |
| FD-01 conversa | DEFERRED primeira V1; não aguardar decisão de inclusão para desenhar. | Futuro canal exige seleção/escopo/AI/Security próprios. |
| FD-02 naming/voz | Execução visual premium com linguagem funcional/slots; copy/voz podem ser refinadas na própria fase de design, sem nova missão documental ou blocker de produto. | Sem copiar referências ou improvisar copy clínica; conteúdo dependente respeita owner. |

INT-01/02/03/07/08/09/10 permanecem no significado de seus controles: adoção/continuação explícitas, safety imediato, silêncio sem mutação, lock screen privado, manual edit sem contornar HC e composto sem aceite parcial. INT-04/05/06 eram sociais e ficam deferred. Histórico integral de todas as interpretações/reviews está no baseline Git; não há decisão Founder de wedge, Crew, subscription ou estabilidade ainda necessária antes de Visual/UI.

### 23.1 Adendo de treinamento — implicação para UX

C057–C061/AEC§1.3 são direção aceita, sem nova escolha de produto. Evidence-informed training não é novelty: repetição intencional pode ser boa programação e personalização não exige instabilidade. Learning após sessão não significa mutação; alteração reativa na semana é excepcional/material, e evolução significativa prefere próximo ciclo. Progression earned, Programmed Variation com training purpose e Reactive Adaptation têm motivos distintos; não precisam nomes técnicos na UI. Mudança material deve explicar o que/por quê/evidência/princípio e objetivo protegido (EXP-); KEEP pode explicar plano ainda adequado sob demanda, sem cartão/aviso para cada recomputação. Não apresentar mudança como prova de inteligência nem usar claims de perfeição, garantia ótima ou validação clínica sem prova. Revisão humana futura desejável de domínio/claims é não bloqueante para Visual/UI; Claude não refaz pesquisa científica nem missão ampla.

## 24. Handoff ao Designer — freeze para sync

Após gate atual do Claude, integrar patch/inspecionar só conflitos materiais posteriores/executar checks mínimos/resolver conflitos reais e seguir **diretamente ao Visual/UI planejado**, por pedido Founder atual C056. Não redesenhar/redescobrir decisões, recriar pesquisa Run/Strength/engine, abrir outra missão documental ou large judge cycle sem conflito material. Esta entrega não inicia Figma/telas/código e não encerra o gate dele.

Fixo: wedge Run+Strength; Crew/social/conversa deferred; external share próprio; quatro referências funcionais; execução/estados/confirm/privacidade/agency existentes; prioridade declarada inclusive Balanced; primeiro valor semana coordenada; subscription/value-before-hard-ask; estabilidade/Level0/menor mudança; Progressive Depth/deep analytics; ingest-first/Nutrition leve. Mudança material pede tratamento só no owner afetado, não redescoberta geral.

Design space: linguagem visual premium/moderna/diferenciada, dark-first com light mode, personalidade, polimento, motion/microinterações úteis, clareza/baixa carga e velocidade operacional. Layout/componentes/navegação sensorial/ordem exata de gráficos/formatos/templates/copy são trabalho de design, sem corte de qualidade por pressa. Priorizar onboarding, Today, Week, execução, post-workout, Progress, shareable, settings mínimos e subscription; isso não impõe nove tabs/telas.

Volta pontual ao owner: conflito material pós-patch; mudança de autoridade/audiência/finalidade, dose/threshold/safety, scope ou monetização fundamental diferente da decidida. Preço exato/copy/quantidade de templates/provider completo/threshold ainda não validado não bloqueiam exploração visual honesta com estados/slots. Gates profissionais/segurança/billing/runtime continuam antes de ativação real.

### 24.1 Plataforma e contrato de entrega visual (Founder, 2026-10-19)

Decisão do Founder registrada na missão MISSION-VISUAL-1.0. Ela não reabre discovery, UX ou arquitetura.

| ID | Contrato | Consequência para design |
|---|---|---|
| VIS-01 | **V1 PRIMARY PRODUCT PLATFORM: MOBILE / IPHONE / IOS.** Mobile-first. Android segue no escopo de release (RS §Transversal) como adaptação. Tablet e web são futuros e não dirigem a arquitetura visual. | Frames-base de iPhone (393×852) com safe areas, status bar e home indicator. Padrões iOS de navegação, sheets e gestos. |
| VIS-02 | **Native-quality iOS experience + identidade visual Vilumo.** Não copiar o visual do iOS nem usar só componentes nativos sem identidade. | Tokens, tipografia e componentes próprios sobre a ergonomia e as convenções de iOS. |
| VIS-03 | **FIGMA IS THE DESIGN SOURCE OF TRUTH FOR VILUMO V1.** A fase Visual/UI nasce, evolui e termina no Figma, com arquivo organizado, editável, consistente e pronto para handoff de engenharia. HTML, screenshots, PNG, protótipos em código e texto ajudam a explorar, mas não substituem o Figma. | Estrutura (revista no hardening, 2026-10-20): 01 Foundations · 02 Components · 03 Final V1 Screens · 04 Flows / Prototype · 05 Shareable Outputs · 06 States / Edge Cases · 07 Archive / Deprecated. Arquivo e link registrados em CURRENT_MISSION. |
| VIS-04 | **Padrão de entrega profissional:** foundations (tipografia, spacing, grid, radius, elevation, opacity, iconografia, cores semânticas, tokens), componentes com variants e Auto Layout, estados (default, loading, empty, error, completed, adapted, disabled quando aplicável), fluxos/protótipo, telas finais, shareables e documentação suficiente para handoff. Sem frames soltos inconsistentes nem componentes duplicados. Ordem: exploração → seleção de direção → foundations → components → telas → estados → fluxos → refinamento → handoff. | Um Founder, um Product Designer ou um iOS Engineer consegue usar o arquivo sem reconstruir decisões escondidas em prompts. |
| VIS-05 | **Dark-first, light-ready.** Componentes só usam cores semânticas com modos Dark e Light. Light não precisa de todas as telas antes de validar o Dark. | Proibido hardcode de cor sem semântica nos componentes. |
| VIS-06 | **Ergonomia mobile:** uso com uma mão e thumb reach (ações primárias na metade inferior), safe areas, toque ≥44 pt, legibilidade em tela pequena, sheets e overlays apropriados, estados de teclado, acessibilidade (Dynamic Type, contraste AA, VoiceOver), consulta rápida em movimento. | Aplicado a todas as telas. |
| VIS-07 | **Execução de treino durante atividade real:** Run com leitura a distância (métrica principal grande, alto contraste, controles grandes e pausa sem precisão fina) antes, durante e depois da corrida. Strength com pouca fricção (registrar série em 1 toque quando o realizado = o previsto, steppers grandes, descanso automático, troca de exercício a 1 passo). Retorno persistente à execução (NAV-06). | Estados reais: em curso, pausa, descanso, série registrada, fim, sem GPS/sinal, sessão em segundo plano. |
| VIS-08 | **Analytics mobile com Progressive Depth:** L1 orientação, L2 Progress (Running · Strength · Overall), L3 deep dive. Nunca um dashboard desktop encolhido. Gráficos, filtros e detalhes desenhados para toque (scrub, segmentos, sheets de filtro). | Componentes de gráfico reutilizáveis com estados de loading, empty e dados limitados. |
| VIS-09 | **Run + Strength no mesmo produto:** um sistema visual só. A identidade da modalidade (acentos run/accent e strength/accent, atmosfera, ícone, rótulo) é camada de contexto; dentro de gráficos, a cor serve primeiro ao dado (VIS-12). "Run contínuo / Strength discreto" é hipótese de trabalho, não regra: o encoding nasce da pergunta. Nunca dois mini-apps. | Mesmos componentes-base, com variante por modalidade. |

### 24.2 Direção visual aprovada e regras de julgamento (Founder, 2026-10-20)

Direção aprovada: **S1.2 · Selective Maturity** no Figma (explorações hoje preservadas em 07 Archive / Deprecated), derivada da S1 Visual Synthesis. Tipografia de trabalho: Mona Sans (display/UI) + Barlow Semi Condensed (dados). Ainda não é Design System congelado. A passada S1.1 (austera) foi rejeitada e fica só como referência. Regra-mãe: **design with judgment, not by prohibition** — maturidade ≠ austeridade; profissional ≠ sem graça; remover arbitrariedade, não personalidade. Se uma simplificação deixar a superfície menos viva, reconhecível, premium ou intuitiva sem ganho funcional, preservar a S1.

| ID | Regra | Consequência para design |
|---|---|---|
| VIS-10 | **Calmo onde deve ser calmo, rico onde deve ser rico.** Hoje e execução priorizam foco e velocidade; Activity Detail, Progress, Deep Dive, treino concluído e PR podem ser mais expressivos. Nem toda seção disputa atenção. | Contraste deliberado entre áreas quietas e momentos expressivos. |
| VIS-11 | **Cards e gradientes com motivo.** Card quando melhora agrupamento, hierarquia, toque, comparação ou análise independente; sem card dentro de card genérico nem tudo na mesma caixa. Gradiente quando é atmosfera de contexto/modalidade, estado, escala contínua ou intensidade; sem gradiente em todo botão/container. **Atmosfera de modalidade é escopada ao contexto do esporte** (Founder, 2026-10-20): fundo só em telas dedicadas a uma modalidade (execução de força/corrida, deep dive, Activity Detail); em telas gerais (Hoje, Semana, Progresso) a cor fica só dentro do card escopado ao esporte (ex.: hero da corrida em Hoje). | Misturar cards, seções, linhas, listas, métricas inline e gráficos conforme a função. |
| VIS-12 | **Cor comunica.** Em gráficos, cor representa primeiro intensidade, zona, alvo, faixa, status, plano vs real, melhora ou categoria comparada; a cor do esporte é camada secundária. Gráfico monocromático por princípio é regressão, assim como cor sem semântica. | Zonas e status com escala consistente; acentos de modalidade quando a categoria comparada é a modalidade ou para contexto. |
| VIS-13 | **Visualização nasce da pergunta.** Pergunta → variável → encoding → cor → identidade. Unidades claras, escala comum quando há comparação, sem eixo duplo ambíguo, contagem discreta quando o dado é contável, estimativa com ≈ e faixa de incerteza visível, sem gráfico que só se entende lendo um parágrafo. | Aplicado a todos os componentes de gráfico (VIS-08). |
| VIS-14 | **Copy com evidência — sem falsa certeza.** Toda frase "inteligente" responde "como o Vilumo sabe disso?". Distinguir fato, inferência, estimativa, possibilidade e recomendação, na linguagem e no visual (OBSERVADO = linha cheia, LEITURA POSSÍVEL = linha tracejada, NO PLANO = regra do plano). Amostra pequena é declarada. Nenhum insight é melhor que um insight falso. | Vale para Hoje, Activity Detail, Progress, recuperação, explicações adaptativas e coordenação Run × Strength. |
| VIS-15 | **Barra anti-AI-slop:** o problema é o uso arbitrário — cards, pills, badges, glows, gradientes, insights ou micrográficos sem função, tudo arredondado igual, cada seção tentando ser especial. Teste final por tela: "parece decidido por um time sênior de produto ou adicionado porque era possível?". | Self-review obrigatória antes de cada entrega visual ao Founder. |

### 24.3 Hardening — direção travada (Founder, 2026-10-20)

| ID | Regra | Consequência para design |
|---|---|---|
| VIS-16 | **VISUAL DIRECTION IS LOCKED.** Mudanças melhoram o sistema atual, não o reinterpretam. Só um problema concreto de usabilidade, consistência, acessibilidade, implementação, semântica de dado ou legibilidade justifica alterar algo; paleta, identidade, superfícies, tipografia principal, navegação, dark-first, nível de riqueza e arquitetura Today/Week/Workout/Progress exigem aprovação do Founder. | Sem S2, "Direction B" ou nova exploração; candidatos antigos ficam em Archive. |
| VIS-17 | **Resiliência a dado real.** A UI não pode depender de dado perfeito: títulos longos, 2–9 sessões/semana, dias com duas sessões, números grandes, métrica ausente (FC, RIR), histórico curto, gráficos incompletos, mais de um objetivo. | Componentes com truncamento/quebra definidos, estados ausente/parcial/limitado e densidade testada. |
| VIS-18 | **Cenários de stress obrigatórios** antes de handoff: A runner iniciante (2R+2S); B balanced intermediário (4R+3S); C balanced avançado (5R+4S, duas sessões no dia); D strength-first (4S+2R); E dois treinos perdidos; F adaptação material; G semana estável; H PR; I intervalado parcialmente falho; J poucos dados históricos. | Página 06 States / Edge Cases do Figma. Não se redesenha por cenário; corrige-se o sistema. |
| VIS-19 | **Cor de esporte = orientação/identidade; cor de dado = semântica** (zonas, alvo, real, esforço, status, melhora, alerta, recuperação). Reforça VIS-12; gradiente contextual continua permitido quando dá atmosfera, orientação, estado ou profundidade. | Tokens `data/*` e `status/*` para dado; `run/*` e `strength/*` para contexto. |
| VIS-20 | **Seleção e motion explicam estado.** Seleção = mudança de superfície + marcador preenchido (check) + borda de hierarquia, não só borda e ponto brancos; escolha única inequívoca pode avançar sozinha; múltipla escolha sempre tem CTA. Motion só para mudança de estado, progresso, transição de etapa, série concluída, ajuste de plano, revelação do primeiro valor, transição de gráfico e sucesso; sem espetáculo. | Princípios e tokens de motion em 01 Foundations. |

## 25. Rastreabilidade do sync

Fonte única das novas decisões: PTC C047–56/L024 e DR76–85. Scope seleciona V1/V2; PDM possui objetos; AEC/AEOS possuem comportamento/necessidade/guarda; PA possui caminhos/share allowlist; esta UX traduz, não redefine. Seções de Running/Strength/explicação/confiança/agency/wearable/execução/retorno preservam o detalhamento r3 onde compatível. Seções sociais e matriz de perguntas da missão antiga são história recuperável no Git, não scope atual.

## 26. Verificação do delta, sem autoaprovação

Auditoria dirigida A–Y, checks existentes no baseline ativo e checks de preservação/coerência/links/IDs do delta, revisões independentes limitadas aos riscos materiais, por hashes em [registro](../audits/v1-freeze-2026-10-19/MISSION_RECORD.md). Nenhum PASS anterior ou self-check equivale a aprovação deste sync. Não há teste de uso, implementação, device, eficácia ou visual executado. Resultado de freeze/ready de produto pertence à consolidação documental atual, com integração posterior explícita; nenhum aceite do Claude é presumido.
