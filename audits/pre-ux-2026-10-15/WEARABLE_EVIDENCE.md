# Wearables e closed loop — evidência e propostas C/D

**WEA-1.0 / PREUX-20261015-r1** · consulta **2026-10-15**, America/Sao_Paulo. Autoria: Engineering / Systems Architect, worker `/root/wearable_contracts`. **Supporting evidence + amendment proposals; não canônico; aguardando judges independentes.** Consumidores: AEC, Product Domain Model, Product Architecture, Release Scope e Core Flows existentes. Não é Technical Handoff, escolha de stack, contrato comercial, parecer jurídico ou prova de integração executada.

Inputs: AGENTS.md, CLAUDE.md, CURRENT_MISSION MISSION-PREUX-1.0, CI-3.0.0, PTC-3.0.0, PDM/PA/AEC/RS/CF-1.0 e pedido bruto no MISSION_RECORD. Rebaseline 3.0.0 permanece aprovado. Ownership exclusivo deste arquivo; outros autores integram as propostas nos documentos autoritativos. Ferramentas disponíveis e usadas: leitura local, web e GET público de documentação oficial; nenhum login, API de conta, MCP externo, inscrição de parceiro, gasto, device ou spike foi executado. Skills aplicadas: evidence-synthesis 1.1.0 e verify-before-completion 1.3.0; CORE/HANDOFF/ENGINEERING e proporcionalidade vigentes.

## 1. Conclusão técnica delimitada

- Há caminhos **publicamente documentados** de Running estruturado para Garmin, COROS e Apple Watch. Acesso do Vilumo, representação exata e execução em hardware permanecem provas distintas. Nenhum provider está aprovado ou implementado pelo projeto.
- HealthKit é health data store; **WorkoutKit** é a capacidade separada de preparação/scheduling no Workout do Apple Watch. Health Connect tem planned exercise records, mas gravar esse registro **não comprova entrega nem execução em relógio**.
- Polar AccessLink v3/v4 sustenta ingestão. O v4 publica schemas de training targets, porém seus endpoints/scopes publicados são de leitura. **Outbound direto do Vilumo para Polar não está demonstrado**; tratar como ingestão + execução no app. A ponte TrainingPeaks existe, com limitações próprias, mas não é dependência V1 nem substitui prova da cadeia inteira.
- Strength permanece **app-first**, com exercícios, séries, reps, carga, intervalos e contexto específicos. Wearable suplementa o que preservar significado. Não trocar conjuntos de força por intervalos temporizados para caber no destino.
- Terra é candidato a acelerador/adaptador, sujeito a custo, acesso e fidelidade. Seus documentos revelam coerções, defaults e sucesso de operações sem efeito remoto; usar o schema Terra como domínio Vilumo ou aceitar sucesso HTTP como entrega seria incorreto.
- Atualizar o plano no Vilumo **não envia automaticamente** sua revisão. Mantém-se AEC-1.0 §3/§5: a pessoa confirma a revisão e a ação de envio/substituição. Recálculo de recomendação, aplicação no plano e efeito externo têm autoridades distintas.
- A recomendação de sequência está fechada em §4; a seleção/contratação final depende de gates concretos em §9. Não há blocker documental C/D identificado para especificar UX/Figma dos estados genéricos; suporte de marca/dispositivo e prescrição real continuam condicionados.

## 2. Evidence ledger oficial

Classificação: **OBSERVED** = conteúdo oficial público lido; **INFERRED** = consequência técnica explicitada; **PROPOSED** = contrato recomendado ao owner, sem autoaprovação. Confiança alta significa suporte documental direto à afirmação limitada, nunca eficácia fisiológica, aprovação comercial ou comportamento de hardware. Todas as fontes abaixo foram recuperadas em **2026-10-15**. Documentação viva sem versão publicada usa URL + data, sem inventar versão. Páginas Apple/Terra que não renderizaram no web reader foram lidas por seu Markdown oficial público; nenhum acesso protegido foi contornado.

| ID / classificação | Afirmação sustentada e fontes oficiais | Limite / contraevidência / confiança |
|---|---|---|
| **WEA-001 OBSERVED** | Garmin [Activity API](https://developer.garmin.com/gc-developer-program/activity-api/) publica atividades detalhadas, inclusive Running/Strength, arquivos FIT/GPX/TCX, push ou ping/pull, backfill e ambiente de avaliação após aprovação. Dados ficam acessíveis após sync do dispositivo ao Connect. [Health API](https://developer.garmin.com/gc-developer-program/health-api/) lista HR, sono, stress, Body Battery e outros dados disponíveis conforme feed/dispositivo. | Não é streaming universal; métrica presente na UI do relógio não implica exposição da API. Backfill, permissões, campos e limites exatos exigem documentação/acesso aprovado. Alta para capacidades anunciadas. |
| **WEA-002 OBSERVED** | Garmin [Training API](https://developer.garmin.com/gc-developer-program/training-api/) publica workouts/planos no calendário Connect; usuário sincroniza dispositivo compatível e segue passos. Teste pós-aprovação ocorre em **produção com throttling**, distinto da avaliação Activity/Health. [FAQ](https://developer.garmin.com/gc-developer-program/program-faq/) informa uso empresarial/OAuth 2.0, acesso ao programa sem taxa de licença/manutenção, com possíveis taxas de métricas ou mínimo de dispositivos. | Não comprova admissão atual, elegibilidade Vilumo, SLA, direito a todos feeds ou gratuidade de qualquer uso comercial. FAQ anuncia tempos típicos, não cronograma contratado. Update/delete/receipts da integração direta precisam do contrato aprovado. Alta no escopo público; acesso específico aberto. |
| **WEA-003 OBSERVED** | O [FIT Workout File](https://developer.garmin.com/fit/articles/file-types/workout.html) documenta steps, time/distance/open, targets, repeats e representação de força. [FIT protocol](https://developer.garmin.com/fit/protocol/) separa arquivos Activity e Workout. | Prova expressividade do formato, **não** aceitação de todo campo pela Training API ou cada relógio. Não assumir que um FIT válido torna qualquer Garmin executável. Alta para formato; adapter/device pendentes. |
| **WEA-004 OBSERVED** | COROS [Partner API Access](https://support.coros.com/hc/en-us/articles/53181766856724-Partner-API-Access) publica OAuth multiusuário, atividade/health, FIT, push de planos/workouts, delete por ID, webhook de resumo em cerca de 5 minutos e referência de histórico: consultas de até 30 dias, lookback de 3 meses. Requer plataforma estabelecida, empresa/representante, segurança e aceite de termos. | Tempo aproximado após disponibilidade na fonte, não SLA desde término do treino. Documento público de capacidades não concede credenciais nem prova schema detalhado/update em lugar/revocação granular. Preço e acesso de teste não publicados nessa fonte; confirmar antes de compromisso. Alta. |
| **WEA-005 OBSERVED** | COROS [Build on MCP](https://support.coros.com/hc/en-us/articles/53181619102996-Build-on-COROS-MCP) publica alternativa OAuth por usuário, sem aplicação, leitura/write de planos, sem webhooks nem two-way activity sync de Partner API. O [guia ao usuário](https://support.coros.com/hc/en-us/articles/50841795180948-Connect-Your-COROS-to-AI) limita criação atual a road/trail running e cycling e informa que exclusão via AI não está disponível. [Repositório oficial](https://github.com/coroslab/COROS-MCP), ligado pela própria COROS, confirma o projeto. | MCP pessoal não é substituto comprovado do contrato de integração comercial/produção multiusuário. Nenhum MCP foi conectado. Documentos mais amplos não autorizam inferir Strength/write/delete nesta rota específica. Alta. |
| **WEA-006 OBSERVED** | COROS [builder](https://support.coros.com/hc/en-us/articles/47285577958932-Create-Custom-Workouts-in-Your-COROS-App) documenta Running time/distance/open, pace/HR, conjuntos repetidos; Strength reps/time/open e peso/bodyweight. [Execução estruturada](https://support.coros.com/hc/en-us/articles/360044426251-How-to-Follow-Structured-Workouts-on-COROS-Watches) tem avanço automático ou Back/Lap e distingue fim de último passo de término da atividade. | Prova funções de produto/dispositivo, não campo da API Partner. Kiprun 500/900 não suportam Strength e alguns targets. Datas de calendário e modo/firmware importam; testar o conjunto concreto. Alta. |
| **WEA-007 OBSERVED** | Polar [AccessLink v3](https://www.polar.com/accesslink-api/) publica exercício/FIT/TCX, atividade, sono, HR e outros dados, OAuth/read_all, webhooks e deregistration. Nos endpoints de exercícios v3, só retornam uploads dos últimos 30 dias e posteriores ao registro do usuário no client. [Dynamic API v4](https://www.polar.com/polar-api-v4/) publica reads de sessões, Nightly Recharge, sono, continuous samples e targets; `training_targets:read` e GET de calendar-targets não oferecem write. | Schema contém campos de fases/repeats/versões e comentários de update; isso **não** prova endpoint/scopo de escrita. v3 e v4 têm regras diferentes: não transferir limite histórico de v3 para todo v4, nem prometer backfill ilimitado v4 sem confirmação. Alta para leitura; outbound não demonstrado. |
| **WEA-008 OBSERVED** | Polar [Flow × TrainingPeaks](https://support.polar.com/us-en/support/how_can_i_automatically_sync_my_data_from_polar_flow_to_trainingpeaks) documenta targets de TP chegando ao Flow/relógio, sync diário ou refresh, até 20 fases únicas, remapeamento de zonas e apenas **Old Strength Builder**, não New Strength Builder. Targets importados só são editáveis no TP. | Essa é uma rota indireta específica, não write AccessLink. Acesso Vilumo→TP, representabilidade, direitos, refresh/update/delete e conta elegível ainda não comprovados. Não adicionar TP apenas para rotular Polar como bidirecional. Alta. |
| **WEA-009 OBSERVED** | Apple [autorização HealthKit](https://developer.apple.com/documentation/healthkit/authorizing-access-to-health-data) exige leitura/escrita por tipo; app não distingue read negado de ausência de dados, e pode haver janela histórica limitada. [sourceRevision](https://developer.apple.com/documentation/healthkit/hkobject/sourcerevision) identifica app/device escritor; [anchored query](https://developer.apple.com/documentation/healthkit/hkanchoredobjectquery) recupera novos objetos e exclusões. | Fonte imediata pode ser outro app que importou de relógio; preservar origem real quando exposta. Não apresentar “você negou” por resposta vazia; não presumir histórico total. HealthKit não é API cloud nem publisher de treino no relógio. Alta. |
| **WEA-010 OBSERVED** | Apple [WorkoutKit](https://developer.apple.com/documentation/workoutkit) cria/prevê/sincroniza workouts no Workout do Watch. [WorkoutScheduler](https://developer.apple.com/documentation/workoutkit/workoutscheduler) expõe suporte, autorização própria, workouts do app, máximo consultável e remoção. [WWDC23](https://developer.apple.com/videos/play/wwdc2023/10016/) demonstra steps time/distance/open, open de avanço manual, um alerta/step e repeats; estatísticas reais vêm de HealthKit. [WorkoutAlert](https://developer.apple.com/documentation/workoutkit/workoutalert) documenta alertas HR/speed condicionados ao suporte. | WorkoutKit disponível desde iOS 17/watchOS 10; disponibilidade de cada função/atividade deve ser verificada, sem congelar limite de 2023 como regra universal em 2026. Scheduler/completion não fornece sozinho todo dado realizado. Não prova reps/carga/nome de exercício. Alta. |
| **WEA-011 OBSERVED** | Google [training plans](https://developer.android.com/health-and-fitness/health-connect/features/training-plans) separa app que escreve planned exercise e app que executa/lê e registra realizado; usa permissões próprias e checagem `FEATURE_PLANNED_EXERCISE`. [PlannedExerciseStep](https://developer.android.com/reference/androidx/health/connect/client/records/PlannedExerciseStep), [Block](https://developer.android.com/reference/androidx/health/connect/client/records/PlannedExerciseBlock), [RepetitionsGoal](https://developer.android.com/reference/androidx/health/connect/client/records/ExerciseCompletionGoal.RepetitionsGoal) e [PerformanceTarget](https://developer.android.com/reference/androidx/health/connect/client/records/ExercisePerformanceTarget) documentam steps, blocos/reps, HR/speed/weight targets e metadados de exercício. | É armazenamento/intercâmbio local. Não é contrato de delivery/executor Wear OS/Garmin/COROS/Polar; manual/auto dependem do executor. API Jetpack 1.1.0 e feature/OS precisam ser conferidos no device, sem transformar guia alpha em garantia de instalação. Alta para store. |
| **WEA-012 OBSERVED** | Google [read data](https://developer.android.com/health-and-fitness/health-connect/read-data) limita histórico padrão a 30 dias antes da primeira permissão, ampliável por permissão própria. [Sync](https://developer.android.com/health-and-fitness/health-connect/sync-data) usa changes de upsert/delete, tokens que expiram em 30 dias sem uso e acesso background próprio. [Write](https://developer.android.com/health-and-fitness/health-connect/write-data) define IDs/revisões de client, origem/recording method e orienta não regravar dados lidos do próprio Health Connect. | Sem webhook cloud Health Connect ou garantia de delivery imediato. Não confundir ausência/off-body com zero. Leituras e writes precisam rechecagem de permissão. Dados persistidos/localmente disponíveis ainda podem estar incompletos. Alta. |
| **WEA-013 OBSERVED** | Terra [compatibility](https://docs.tryterra.co/planned-workouts-api/provider-compatibility.md) publica create/update/delete para Garmin/COROS/Apple; COROS update é delete+create; Garmin retrieve só itens criados pelas credenciais do app. Para Apple a entrega usa SDK/WorkoutKit, sem retrieve server-side, sem reps/nomes de exercício: Strength vira intervalos temporizados. Time/distance, repeats e pace/HR aparecem na matriz, com diferenças por provider. | Success pode ocorrer em operação não suportada; delete pode remover só cópia Terra. Isso não é prova do efeito em relógio ou da integração direta. Mesmo capacidade publicada exige entitlement/adapter/hardware. Alta para contrato Terra divulgado. |
| **WEA-014 OBSERVED** | Terra [coercion warnings](https://docs.tryterra.co/planned-workouts-api/coercion-warnings.md) retorna perdas/alterações em `warnings`, inclusive target ignorado, default de parâmetro do atleta, exercício descartado e block completion alterado. [Overview](https://docs.tryterra.co/planned-workouts-api/overview.md) distingue template de planned workout e alerta que apagar template pode cascatear todos os agendamentos associados. | Não seguir sugestão genérica de ignorar warning para targets/safety. Não usar defaults fisiológicos Terra como evidência Vilumo. Alteração de data não deve ser tomada como atualização do conteúdo. Alta. |
| **WEA-015 OBSERVED** | Terra [push-to-watch](https://docs.tryterra.co/help-center/help-topics/data-api-sdk/extra-features-scores-graphs-teams-nutrition-cgm/planned-workout-push-to-watch.md) informa que cada schedule cria novo workout e **não há idempotency key**. Apple requer SDK, permissão scheduling separada e iPhone pareado. [424/retries](https://docs.tryterra.co/help-center/help-topics/data-api-sdk/extra-features-scores-graphs-teams-nutrition-cgm/planned-workout-424-and-retries.md) diz que Terra não faz fila/retry nesse erro; falha geral pode já ter alcançado o destino. | Não prometer exatamente uma cópia remota mediante retry cego. Packages SDK têm diferenças de sync; checar o escolhido na futura implementação, sem escolher stack aqui. Alta. |
| **WEA-016 OBSERVED** | Terra [webhooks](https://docs.tryterra.co/unified-api/integration-setup/setting-up-data-destinations/webhooks.md) documenta assinatura, retry/backoff, timeout e perda após orçamento esgotado. [COROS latency](https://docs.tryterra.co/help-center/help-topics/data-api-sdk/webhooks-dedup-and-sync-reliability/coros-polling-latency-no-webhooks.md) descreve sua rota polled (~15 min), summary inicial e posterior com detalhes. [COROS history](https://docs.tryterra.co/help-center/help-topics/no-data/historical-backfill-returns-nothing/coros-limited-history-and-native-only.md) delimita histórico/consentimento e atividades nativas. | Fonte COROS direta WEA-004 agora anuncia webhook de parceiro; **não resolver essa diferença inferindo igualdade entre rotas**. Confirmar modalidade Terra contratada/versão. Risco real de atraso, duplicata e lacuna permanece; números de docs não são SLA Vilumo. Alta na existência dos limites; reconciliação comercial aberta. |
| **WEA-017 OBSERVED** | Terra [pricing](https://tryterra.co/pricing) publica Unified desde US$499/mês mensal ou US$399/mês faturado anualmente. [Unified pricing](https://docs.tryterra.co/unified-api/pricing.md): 100 mil créditos/mês, 200 por conexão ativa, 400 eventos/conexão incluídos, excedente 0,5 crédito/evento. [Planned pricing](https://docs.tryterra.co/planned-workouts-api/pricing.md): add-on US$99/mês, 20 mil créditos, push 10/pull 1, excedente US$0,005/crédito. | Conexão não é pessoa. Pools/base/add-on são distintos; mais de uma fonte por atleta muda custo. Não converter USD/BRL nem fixar custo líquido sem câmbio, impostos, quote/termos atuais. Enterprise é cotação. Alta para oferta pública recuperada. |
| **WEA-018 OBSERVED** | Terra [test tooling](https://docs.tryterra.co/help-center/help-topics/data-api-sdk/account-config-environments-and-going-live/test-tooling-and-sandbox.md) oferece testing environment/Data Generator. [Go live](https://docs.tryterra.co/help-center/help-topics/data-api-sdk/account-config-environments-and-going-live/go-live-no-approval-needed.md) diz não exigir aprovação adicional **da Terra** para produção. [Sources](https://docs.tryterra.co/unified-api/integration-setup/setting-up-data-sources.md) distingue cloud de Apple Health/Health Connect mobile-only. | Gerador não comprova provider/hardware. Não estender ausência de gate Terra a aprovação de vendor, loja, contrato, finalidade ou Vilumo. Produção requer entitlement/credenciais adequados. Alta. |
| **WEA-019 OBSERVED** | Strava [API Agreement](https://www.strava.com/legal/api) e [Policy](https://www.strava.com/legal/api_policy), vigentes 2026-06-01, restringem exibição, uso, derivados, analytics/combinação e AI; Policy §5.3 inclui operação/context window/RAG/evals, §5.4 analytics/combinação, §5.16 intermediários/MCP terceiro. §3.5 limita o MCP próprio a uso pessoal. | Integração do Engine/Crew fundada em Strava seria incompatível com essas restrições documentadas. Não concluir exceção comercial por consentimento do atleta ou lista de providers Terra. API pode tecnicamente ler atividade; isso não cria direito de usá-la no loop. Alta no texto; interpretação jurídica definitiva externa. |
| **WEA-020 OBSERVED → INFERRED** | Apple [HRV SDNN](https://developer.apple.com/documentation/healthkit/hkquantitytypeidentifier/heartratevariabilitysdnn) e Google [records](https://developer.android.com/reference/androidx/health/connect/client/records/package-summary) identificam SDNN e RMSSD respectivamente. | Consequência técnica: unidade ms igual não torna métodos equivalentes. Preservar método/janela/origem; sem conversão ou baseline cruzado silencioso. Não determina eficácia/limiar. Alta. |

## 3. Matriz de capacidades por rota

Legenda: **P** documentado publicamente; **A** requer admissão/contrato/entitlement; **D** requer prova de modelo/OS/firmware/sync real; **S** schema/store/formato somente, não executor; **ND** não demonstrado nas fontes oficiais desta rota; **—** não é função dessa rota. `P+A+D` não é ready. Todos têm fallback do app, observado e export distintos, e autorização vigente no efeito. Matrizes usam os IDs de evidência acima; não inferem write de read.

### 3.1 Ingestão, envio e ciclo de vida

| Rota / evidência | Completed + health/recovery | Structured outbound Running | Update/replace e delete | Read/write, desconexão e acesso |
|---|---|---|---|---|
| **Garmin direto** WEA-001–003 | P+A+D, feeds distintos | P+A+D via Training→Connect→device | Detalhe direto ND público; FIT não prova operação REST | OAuth 2.0/consent; scopes/granularidade exatos A. Disconnect cessa usos autorizados; não recolhe relógio. |
| **COROS Partner** WEA-004/006 | P+A+D, FIT/daily | P+A+D | Delete P+A; update em lugar ND público; estratégia da rota precisa confirmação | Multiusuário A, termos/segurança. Deauth público como categoria; revogar read/write separadamente na plataforma não é garantido. |
| **COROS MCP** WEA-005 | Reads pessoais P; não equivale ingestão Partner | P para modalidades declaradas | Edit P; delete por AI indisponível segundo guia ao usuário | Sem webhook, per-user; nenhuma integração ou recomendação de uso comercial nesta missão. |
| **Polar AccessLink direto** WEA-007 | P, v3/v4 com escopos/limites distintos | ND, **degraded ingestão + app** | ND para workout remoto; delete de webhook/user não é delete de treino | Leitura OAuth; v3 read_all/v4 scopes próprios. Revogar/deregister cessa acesso; não apaga Flow/device. |
| **Apple HealthKit + WorkoutKit** WEA-009/010 | HealthKit P+D conforme tipos/fontes | WorkoutKit P+D; permissão scheduling própria | Scheduler remove P; substituição planejar/remove com revisão e prova; não presumir atomicidade/remoção imediata em watch offline | Reads/writes por tipo; read-denial opaco. WorkoutKit é autorização distinta. Cópia externa pode persistir. |
| **Health Connect** WEA-011/012 | Store P+D conforme escritores/permissões | Planned store P+S; **watch delivery ND** | CRUD do próprio record não prova substituição no executor | Por tipo/purpose + history/background; não implica API cloud. Conexão indisponível não é zero atividade. |
| **Terra por provider** WEA-013–018 | P+A+D para fontes habilitadas, sem universalidade de campos | Garmin/COROS cloud; Apple SDK, conforme capacidade | Garmin P; COROS delete+create; Apple SDK; remote effect só no limite provado | Contrato/add-on, scopes e mobile SDK quando necessário. Deauth Terra não garante apagar cópias vendor/device. |

### 3.2 Representação e execução

| Rota | Time / distance | Repeats | Manual / auto advance | Pace / HR targets | Strength |
|---|---|---|---|---|---|
| Garmin direto | FIT P+S; adapter A+D | FIT P+S; adapter A+D | Open/formato P+S; controle do modelo D | FIT P+S; baseline/targets/device A+D | Formato/atividade P; catálogo/sets/reps/load por adapter D; app preserva domínio |
| COROS Partner | Builder P+D; API mapping A | Builder P+D; mapping A | Watch tem ambos P+D; campo API A | Builder P+D; representação Partner A | Builder/watch P+D, exceções de modelo; API mapping A |
| COROS MCP | Running documentado P; schema específico necessário | Não assumir toda estrutura Partner | Controles do watch não demonstram controle MCP | Não inferir todos targets do builder para MCP | Criação Strength não está na lista atual desta rota |
| Polar direto | Schema P+S, sem publisher | Schema P+S, sem publisher | Schema/Flow não criam write | Schema P+S, sem publisher | Import pode informar contexto; outbound ND |
| Apple WorkoutKit | P+D por activity/goal | P+D, contagem de bloco | Open manual; goals time/distance avançam conforme composição P+D | Um alerta/step P+D; suporte por activity | Sem prova de reps/load/exercise equivalentes; app-first |
| Health Connect | Planned goals P+S | Blocks/reps P+S | Sem executor garantido | Targets P+S; sem guidance watch provado | Store admite detalhes/reps; execução/catálogo não garantidos |
| Terra | P por provider, ver WEA-013 | P, com diferenças | Não presumir identidade de controles entre adapters/dispositivos | Preflight obrigatório; coerções/defaults não são policy | Garmin/COROS conforme adapter; Apple temporizado não equivale ao modelo de força |

**ND tem motivo e destino:** detalhes diretos Garmin/COROS exigem contrato/API de parceiro, não mais uma busca genérica; device execution e offline exigem teste real; Polar precisa nova evidência oficial de write ou cadeia indireta comprovada. A falta é da rota e operação especificadas, não um claim de impossibilidade permanente do hardware.

### 3.3 Transporte, histórico e degradação

| Rota | Notificação / latência | Histórico | Offline / outage / limite a mostrar |
|---|---|---|---|
| Garmin | Push/ping-pull depois de Connect sync; sem SLA público suficiente | Backfill P; profundidade/feeds A | Disponibilidade Connect ≠ relógio sincronizado. Não dizer atualizado offline sem prova. |
| COROS Partner | Webhook ~5 min documentado, não SLA | Janela de consulta/lookback WEA-004 | Resultado detalhado pode chegar depois; não descartar nova revisão por já haver resumo. |
| COROS MCP | Poll pessoal; sem webhook Partner | Consulta histórica não garante todo corpus | Não é mecanismo escolhido para o closed loop Vilumo. |
| Polar | Webhooks v3 e reads conforme versão; sem tempo universal | v3 exercícios: limite explícito; v4 regras próprias ainda a confirmar | Ingestão indisponível mantém observação desconhecida; app executa. |
| Apple | Queries/background sujeitos ao sistema; scheduling local | Dados/tipos/janelas autorizados disponíveis | Sem webhook cloud nativo; app/Watch pareado e OS importam. Persistência local não prova sync. |
| Health Connect | Changes/reads foreground ou background autorizado | 30 dias por padrão; history próprio; tokens expirados exigem reread/dedupe | Falha de feature/store ou escritor sem sync preserva incerteza. Nenhum relógio prometido. |
| Terra | Webhook retry limitado, gaps recuperáveis só se fonte permitir; COROS rota descrita como polling | Respeita fonte/consentimento, não cria histórico perdido | Sem garantia de todos eventos; outage pode exigir backfill/reconciliação. App continua com versão preparada válida. |

## 4. Recomendação técnica condicional e sequência

**PROPOSED, não Product Truth nem autorização de contratação.** Escolher o primeiro caminho de closed loop por representabilidade + acesso + custo + população de dispositivos pretendida, preservando iOS/Android do Scope. A ordem evita dependência de decisões de layout/stack:

1. **Manter o domínio e o workout neutros (CTRL-001/002).** Concluir UX dos estados sem marca; não amarrar linguagem de força, confirmação ou confiança ao payload de intermediário.
2. **Candidato mais direto sem admissão cloud de parceiro: Apple HealthKit + WorkoutKit**, se o recorte inicial de teste incluir Apple Watch pareado. Fornece caminho oficial distinto para observado e planejado; não fecha sozinho a promessa multiplataforma nem requer app próprio Vilumo no Watch. Entitlements, permissões, OS e teste físico ainda necessários; não escolher iOS-only como produto.
3. **Garmin direto** é candidato de cobertura Running se admissão/termos vigentes forem obtidos. O público já demonstra a capacidade, mas não garante entrada do Vilumo nem os detalhes de update/delete. **Terra para Garmin** é alternativa de aceleração se fornecer acesso comercial explícito, fidelidade dos workouts necessários e orçamento aceitável; não aguardar acesso direto indefinidamente por suposição de gratuidade. Nenhum contato foi feito.
4. **COROS Partner direto** é candidato adicional real; aplicação e contrato são gates. Comparar com **Terra-COROS** apenas sobre a rota efetivamente oferecida: docs publicam latências/webhooks diferentes. MCP pessoal não resolve silenciosamente esse gate.
5. **Health Connect para ingestão Android** onde autorizado e presente; planned-record support permanece capacidade de intercâmbio até haver executor confirmado. **Polar inicialmente leitura/app**; não criar ponte TP como dependência só para anunciar mais marcas. TP só volta se houver demanda concreta por Polar outbound e prova Vilumo→TP→Flow→device com suas perdas/consentimentos/custos.
6. Antes de prometer launch: selecionar **ao menos um** caminho ingestão + outbound Running e provar a cadeia inteira, incluindo versão antiga, reenvio incerto, revogação e retorno do realizado. Se nenhuma opção conseguir, retornar ao Founder o impacto real na promessa; não alterar Scope por conveniência.

| Critério | Direto | Terra | Decisão delimitada |
|---|---|---|---|
| Acesso | Apple/Google locais com capabilities/permissões/review; Garmin/COROS cloud sujeitos a admissão e contrato; Polar read público | Habilitação/base/add-on; vendors e SDK ainda impõem limites | Credenciais/documentação pública não são acesso aprovado. Não criar contas nesta missão. |
| Custo | Sem preço universal: trabalho de adapters/operação; possíveis licenças/métricas/lojas/contrato | Oferta pública WEA-017 + uso/conexões, câmbio/impostos; Enterprise quote | Comparar custo total por **conexão**, pushes/revisões e fonte necessária; sem preço oficial Vilumo. |
| Velocidade | Mais controle, mais adapters e acesso variável | Menos integrações separadas; já normaliza/cloud+SDK | Ganho de tempo é hipótese até teste; “30 minutos” de marketing não cobre closed loop confiável. |
| Fidelidade | Acesso nativo pode preservar detalhes, sujeito ao provider/device | Coerções/defaults/warnings e diferenças de SDK exigem controles próprios | Não aceitar menor denominador nem defaults de fisiologia; CTRL-002 pode recusar export. |
| Lock-in | Dependência do vendor, mudanças de schema/termos e acesso | Acrescenta intermediário, identidade, custos, coercions e migração/reautorização | Neutro interno, refs de origem e capability por adapter; não prometer migração sem esforço. |
| Teste/produção | Garmin Training test throttled em produção; Activity/Health avaliação; COROS ambiente a confirmar | Testing/Data Generator e produção separados; aprovação adicional Terra não exigida segundo docs | Dados sintéticos provam parser/estados, nunca relógio, permissões efetivas ou garantia comercial. |

**Strava:** sem caso necessário/compatível para o Engine ou Crew nesta missão (WEA-019). Não encaminhar Strava Data por Terra/LLM para contornar termos. Futuro caso específico exige validação jurídica/provider atual e mínimo de dados; não é blocker do loop independente dessas fontes.

## 5. Contratos conceituais propostos aos owners

Tudo nesta seção é **PROPOSED**. A fonte comportamental final deve ser o AEC e consumidores existentes após integração e review. Campos abaixo fixam significado e verificabilidade, não storage, endpoint Vilumo, classe de código ou schema de banco. Nomes indicativos podem ser traduzidos sem perder semântica.

### CTRL-001 — Workout neutro e versões

Fluxo de responsabilidade: **domínio Vilumo → representação neutra da sessão → adapter de capacidade → provider externo**. O provider recebe cópia; não vira dono do plano ou da adequação.

| Parte | Semântica mínima |
|---|---|
| Identidade | Referência estável da sessão/workout; revisão imutável; pessoa; modalidade Running ou Strength; referência/revisão do plano e decisão que prepararam o workout. Plano pode mudar sem mudar sessão; sessão alterada exige nova revisão. |
| Validade | Janela/intenção de execução, data/hora/timezone quando significativos, contexto/policy aplicáveis, preparação e expiração. Data de calendário não é momento real do treino. |
| Versões de contrato | Revisão do formato neutro, da regra de transformação e do adapter/capability consultados. Não usar vendor ID como sessão canônica. |
| Estrutura | Sequência ordenada de steps e repeat blocks com IDs estáveis locais, fase warmup/work/recovery/rest/cooldown e número **total de iterações** explícito. Distinguir repeat block de reps de exercício. Sem loops infinitos ou nested structure presumida no destino. |
| Completion | Tipo explícito: elapsed time, distância, contagem de reps ou open/manual; valor/unidade quando pertinente. Completion não é target de intensidade. Pausas e descanso não contam silenciosamente como trabalho. |
| Advance | Condição que fecha step e modo de avanço manual/automático representados separadamente. Se o relógio só suporta um controle global, o adapter informa diferença; não deduzir do nome do step. |
| Targets | Métrica, faixa/valor, unidade, semântica current/lap-average quando relevante, zona ou absoluto/relativo com baseline autorizado e versão. RPE/RIR são dimensões específicas, nunca HR disfarçado. |
| Unidades | Distância m, duração s, massa kg, HR bpm, HRV ms **com método**, pace s/km ou unidade explícita original. Adapter converte formato/unidade sem alterar significado; pace e velocidade têm ordem inversa dos limites. Sem default HRmax/threshold/FTP nem conversão empírica inventada. |
| Strength | Exercício/repertório versionado, equipamento, sets/reps/carga/descanso e alvo de esforço quando policy permitir; dados de execução/correção próprios. Descrição textual não é substituto suficiente de reps/carga/critério. |
| Instruções e limites | Explicação de execução e constraints relevantes, versão de conteúdo/evidência; informação sensível não necessária ao relógio não integra export. Sem motivo de saúde/Nutrition/Crew no título/notes por conveniência. |
| Estimado vs prescrito vs realizado | Estimativas rotuladas, sem criar goal/dose; prescrição é a revisão; realizado é observação independente. Provider estimates não substituem a decisão do Engine. |
| Associação externa | Export ID/intent, connection/route, provider ID quando existir, revisão enviada, representação efetiva, diferenças e evidência de transporte. Uma sessão pode ter várias tentativas/cópias; continua uma sessão, não soma carga. |

### CTRL-002 — Capabilities e transformação sem perda oculta

Cada rota declara: operações read/publish/update-in-place/replace/delete/revoke; tipos de dado; modalidade; completion/targets/repeats/nesting/advance; limites de contagem/tamanho/calendário; features de device/OS; obtenção de status e nível de prova; granularidade de permissão; histórico; retenção/deletion-event quando disponível. **Supported, unsupported e unverified** não são boolean único de marca. Capacidade é versionada, com fonte/data/condições, e revalidada após mudança material/provider.

Antes do efeito externo, comparar a revisão neutra à representação **que será enviada**. Produzir loss report por caminho/campo, transformação, motivo e efeito semântico. Conversão exata de unidade ou expansão finita de repeat é admissível somente se provar equivalência e limites. Não converter RIR/reps em tempo, trocar HR threshold por HRmax, inventar faixa/default ou descartar target crítico. Se diferença mudar prescrição/segurança ou não puder ser antecipada com confiança: **recusar export dessa revisão** e oferecer execução no app; eventual alternativa deve nascer do Engine/policy, aparecer como revisão distinta e receber confirmação própria.

Warnings posteriores do provider não retrovalidam a prévia. Registrar discrepância, não mostrar equivalência/ready; reconciliar/cancelar/substituir apenas se autorizado e suportado, avisando possível cópia divergente. Terra success e template deletion exigem escopo preciso; nunca apagar template compartilhado para cancelar um único agendamento. Rejeitar saída incompatível não degrada domínio nem avalia esforço do atleta.

### CTRL-003 — Provenance e freshness

Cada observação/sinal deve referir pessoa e atividade/metric, origem imediata (manual/app/device/store/aggregator), provider e originador quando exposto, IDs no namespace da fonte, intervalo ocorrido/medido e timezone, recebido/emendado, qualidade/frescor e disponibilidade de sync. Desconhecido fica desconhecido, sem usar recebido como occurred. Registrar método/unidade/janela e contexto de medição que altere comparabilidade; WEA-020 impede intercâmbio SDNN/RMSSD.

Separar **raw observation**, correção declarada, inferência e derivado. Derivado aponta aos inputs/revisões e versão da transformação/regra; origem Terra não apaga Garmin/COROS real. Referência/hash/recibo de fonte não obriga guardar payload sensível integral para sempre; minimização/retenção são contrato Security. Correção/supressão não deve manter derivado inelegível como sinal ativo. Ausência de dado, limitação de permissão opaca, histórico indisponível, outage e zero observado são estados diferentes.

Freshness é relativa ao tipo de sinal e à decisão/janela; sem TTL universal numérico. Policy competente define utilidade por caso. Doc/provider timestamp e recebimento demonstram idade, não validade fisiológica. Histórico tardio pode ser válido para trajetória e insuficiente para prescrever hoje.

### CTRL-004 — Confidence utilizável

| Classe mínima | Significado e consequência |
|---|---|
| **sufficient / suficiente** | Inputs relevantes para **esta decisão e seu domínio validado**, íntegros/atuais o bastante e sem conflito crítico; não significa atleta totalmente conhecido nem wearable obrigatório. Pode oferecer ação admissível com limites. |
| **partial / parcial** | Lacuna não crítica delimitada; limitar detalhe/alcance ou pedir dado que alteraria decisão. Não fabricar número nem converter parcial em seguro por score agregado. |
| **conflicting / conflitante** | Fontes/declarações incompatíveis para o efeito pretendido. Preservar alternativas/provenance e esclarecer; conflito crítico suspende efeito dependente. Não “mais recente ganhou” ou média arbitrária. |
| **stale / desatualizada** | Idade/contexto torna sinal insuficiente para uso atual segundo policy; obter contexto atual ou limitar a recomendação. Continua história, sem prova de recuperação/condição de hoje. |
| **absent / ausente** | Sem evidência acessível; não é sedentário, falha, não treinou, negou consentimento ou zero. Caminho solo/autodeclaração pode ser suficiente se policy o permitir. |

Aplicar por sinal e por decisão, guardando razões/limites e flags simultâneas quando houver conflito + idade. Classe resumida não elimina provenance nem decide segurança por si. Mudança material de confidence invalida proposta dependente, não reescreve o passado.

### CTRL-005 — Adaptation trace

Toda adaptação material referencia: decisão/operation ID; plano anterior/revisão e workout(s)/revisões; contexto conhecido no cálculo e intervalo de validade; sinais disparadores por ID/revisão/provenance (inclusive ausentes/conflitantes); regras/policy e evidence IDs/revisões realmente usadas; classe de decisão e alternativas elegíveis/rejeitadas; confidence/limitações; sessões afetadas e impacto em insights/exports; requisito de confirmação, ação da pessoa e revisão aceita; plano/resultados/revisões produzidos; estado de efeito; rejeição/override/correção/undo e relação com trace anterior; provenance da explicação.

Classe de decisão descreve manter, mover, reduzir volume, reduzir intensidade, substituir, recuperar/descansar, pedir contexto ou HOLD conforme autoridade A/B; este pacote não inventa condições fisiológicas. Trace inclui “não aplicar” quando houve proposta material recusada, sem tratar a recusa como falha. Uma explicação gerada resume o trace; não inventa regra/evidência nem vira causa retroativa. Identificador de evidência não implica permissão para enviar dados pessoais ao modelo.

### CTRL-006 — Agência, confirmação, override e undo

Rejeitar sugestão preserva o estado anterior coerente. Corrigir contexto mostra os objetos/consequências que mudam; desvio registrado não é punido. Override registra escolha real sem chamar carga maior de melhor, sem forçar motivo. **Não** habilita prescrição fora do domínio validado, bypass de HOLD ou envio/publicação ocultos.

Confirmar exige revisão/contexto atuais e alcance explícito. Readaptação pode recalcular/apresentar; aplicação que modifica escolha/plano/contexto e troca de sessão escolhida/exportada seguem confirmação do AEC. Operação externa exige a ação de envio correspondente. Confirmar ajuste não consente ler mais dados, compartilhar ou usar finalidade secundária.

Undo é nova transição sob contexto atual: desfaz efeito local reversível quando coerente e autorizado; restaura informação/seleção sem apagar realizado/trace. Se contexto mudou, mostrar conflito e preparar alternativa. Não promete desfazer efeito fisiológico, registro já executado ou cópia remota. Reversão externa exige suporte/autoridade própria, com estado pendente/unknown até prova.

### CTRL-007 — Boundary do LLM

Se houver LLM, ele pode coletar/interpretar linguagem de contexto, **propor extração** para o objeto autoritativo, explicar trace e oferecer opções previamente admissíveis da policy. Informação material extraída precisa ficar verificável/corrigível no contexto; conversa não mantém objetivo ou plano paralelo. Inputs externos, notes e texto do provider são dados, não instruções ao motor.

LLM não fixa fisiologia/thresholds/doses, diagnostica, prescreve dieta irrestrita, interpreta corrupção como dado confiável, remove HOLD, altera objetivo silenciosamente ou ignora confirmação. Não exerce consentimento/share, aciona Crew ou envia workout por frase ambígua. Efeitos usam os mesmos contratos/validações do caminho direto; proposta fora de whitelist ou sem provenance é recusada. Recovery/Nutrition/motivo privado não entram em Crew/share/telemetria de engajamento; nenhum conteúdo Strava contorna WEA-019. Modelo, prompt, retenção, tool schema e eval runtime ficam para missão autorizada própria.

### CTRL-008 — Idempotência lógica e retries

Exigir **um efeito lógico por intenção autorizada**, sem prometer exactly-once externo onde o provider não oferece a capacidade. Identidade da operação contém pessoa/connection/finalidade, tipo, objeto/revisão e intent estável; retry reapresenta a mesma intenção. Nova revisão ou novo ato deliberado é nova operação. Mesmo identificador com payload diferente é conflito, não overwrite silencioso.

| Operação | Comportamento exigido |
|---|---|
| **Webhook** | Verificar autenticidade/escopo e associar conta; dedupe delivery e recurso/revisão separadamente. Reentrega não normaliza/adapta duas vezes; atualização posterior legítima do mesmo recurso não é descartada como duplicata. Acknowledge é recibo de ingestão, não de processamento/decisão concluídos. |
| **Publish** | Registrar intenção/revisão/destino e resultado/evidência. Antes de retry: consultar/reconciliar quando possível. Se timeout/424 pode ter chegado e não há read/idempotency remoto, manter **resultado desconhecido**, impedir retry automático cego, informar possível cópia e orientar conferência/app. Nova tentativa deliberada reconhece risco residual. |
| **Update/replace** | Fixar cópia/revisão remota alvo e nova revisão, com confirmação atual. Se delete+create, rastrear ambos e falhas parciais; uma operação não é atomicamente atualizada por definição. Não criar repetidamente substitutos nem tocar workout de outro autor. |
| **Delete/revoke** | Repetir intenção não altera escopo. “Já ausente” só é sucesso se a rota identifica aquela cópia com prova; “unsupported” não vira apagada. Revogação impede novos efeitos/filas daquela finalidade; remoção de cópia externa não é presumida. |
| **Normalization** | Mesma observação/revisão/versão de transformação dá um resultado lógico; correção/new transform gera derivado sucessor com lineage, não atividade/carga adicional. Dados inválidos vão a resolução, sem zero/default fisiológico. |
| **Adaptation** | Mesmo conjunto relevante de inputs/revisões + policy + plano base não reaplica mutação/reenvia. Mudança de inputs é nova avaliação; concorrência ou plano-base antigo invalida proposta. Reexecução não multiplica sessões, compensações ou check-ins. |

Fila/retry revalida **antes do efeito**: pessoa/conta/connection, finalidade e permissões atuais, capability, objeto/revisão, validade temporal, HOLD/restrições e confirmação ainda aplicável. Revogação/desconexão/eliminação vence trabalho pendente; um token válido não prova autorização de finalidade atual. Read/write independentes no Vilumo não prometem OAuth granular: adapter declara limite real; preservar outra finalidade só se tecnicamente e juridicamente sustentável, senão desconectar e explicar. Backoff/retry budget específicos são implementação futura, sem números arbitrários aqui. Recovery nunca reativa intenção vencida automaticamente.

### CTRL-009 — Eventual consistency e status honesto

Manter separados: preparação/intenção local; em fila; transporte aceito; disponibilizado no **sistema externo**; disponibilidade no **device** quando comprovável; sessão executada; atividade recebida; normalizada/associada; interpretação/adaptação aplicada. **Sent ≠ received; received ≠ executed.** Evidência traz nível/horário/limite do recibo. Onde só Connect/Terra/scheduler é observável, “confirmada” limita-se àquele nível, sem afirmar pronta no relógio.

Plan/workout revision invalida export ainda não efetivado; cópia enviada antiga fica identificada até prova de substituição/cancelamento. Com outage/lag, conservar versão preparada e realizado local; nenhuma prescrição nova com precisão fabricada. Outage de transporte não é HOLD médico nem inadequação do atleta. History/backfill retomam somente intervalos permitidos e marcam lacunas que não podem ser recuperadas. Reconnect exige revalidação; não reenvia tudo.

Falha, indisponibilidade, pending e unknown têm causas/recuperações distintas. Falta de evento de delete do provider não prova inexistência de delete; reconciliar no limite da rota, sem prometer espelhamento perfeito. Limiares operacionais de alerta, métricas de atraso/gap e política de retry devem ser definidos/testados na implementação, sem criar SLO público agora.

### CTRL-010 — Identidade, dedupe e conflito multisource

ID externo é namespaceado por provider/rota/conta; trocar conta ou reautorizar não mistura pessoas nem reatribui passado. Preservar ID de origem quando fonte expuser; Terra/HealthKit/Health Connect podem entregar a mesma atividade nativa por rotas diferentes. ID de delivery não é ID de fato.

Correções de um recurso suplantam aquela revisão, não outra sessão; source revision/version têm prioridade sobre simples ordem de chegada. Mesmo treino com timestamps deslocados de timezone não deve duplicar por comparação textual. Equivalência entre fontes pode usar origem/IDs e metadados confiáveis; similaridade de hora/duração/modalidade é **candidata**, não prova universal. Sem identidade suficiente, manter ambiguidade privada, impedir soma duplicada do que se suspeita ser o mesmo fato e pedir resolução se material. Não apagar observação legítima para esconder incerteza.

Uma pessoa pode realizar duas sessões parecidas; não fazer merge por proximidade ou usar tolerância inventada. Não fundir campos incompatíveis para criar “superatividade” aparentemente medida. Escolha/correção de campo guarda origem e razão; conflito crítico limita a decisão. Correção manual de contexto não transforma sensor em autodeclaração, nem vice-versa. Histórico é pessoal; nenhuma disputa de fonte se torna selo público de performance.

### CTRL-011 — Planned vs performed, atraso e contexto sobrescrito

Associar com base em referência de export/workout quando retornada; na falta, usar evidência de contexto e confirmação quando ambíguo. Separar **proposta de associação**, associação confirmada e não associada; não inventar que toda atividade foi o workout mais recente. Se o atleta executou versão antiga, registrar versão antiga; não comparar aderência à versão futura. Plano existente não prova realizado; recibo de completion sem detalhes suficientes não vira séries/intervalos/volume exatos.

Unplanned entra como fato sem prescrição retroativa. Partial fica partial; missing activity continua desconhecida até dado/declaração. Dado tardio ou correção afeta derivados e **futuro**, preservando inputs conhecidos e decisão executada no tempo correto. Contexto editado enquanto adaptação roda invalida proposta; não sobrescrever override com cálculo atrasado. Adaptação depois de retorno usa contexto atual; nenhuma compensação automática ou penalidade por falha de sync.

### CTRL-012 — Safety HOLD por classe, sem diagnóstico

HOLD suspende prescrição/adaptação/export **dependentes** enquanto faltar autoridade/evidência segura; não é diagnóstico, castigo ou bloqueio de registrar o que aconteceu. Escopo (sessão/modalidade/efeito/decisão) e motivo privado/ação de saída precisam ficar claros. Histórico, direitos, correção e caminhos não dependentes continuam. Não afirmar poder cancelar treino já no relógio ou impedir a pessoa de se exercitar fisicamente.

| Classe abstrata | Resposta e condição de saída |
|---|---|
| **Red flags / sinais de risco** | Não emitir prescrição específica dependente; informação não diagnóstica e encaminhamento aprovado pela policy/profissional. Critérios de detecção/urgência/conteúdo são owner Training/saúde, não LLM. Saída por condição competente documentada, não “tente de novo”. |
| **População/condição não suportada** | Explicitar limite do domínio validado e não personalizar além dele. Reclassificação/encaminhamento pela autoridade competente; consentimento ou override não tornam população suportada. |
| **Restrição de profissional assistente** | Respeitar restrição declarada relevante e não recomendar em sentido contrário. Esclarecer escopo/validade mínimos; liberar apenas por atualização válida/avaliação competente, sem pedir prontuário indiscriminado. |
| **Dado crítico corrupto/conflitante** | Suspender efeito que depende do dado; pedir correção/resolução/material atual, manter provenance. Reavaliar após resolução; dado novo não apaga trace do erro. |
| **Falha de adaptação persistente/repetida** | Interromper aplicação automática da operação problemática; explicitar limitação e preservar último estado **ainda válido**, sem chamá-lo seguro se contexto mudou. Diagnóstico técnico/policy e revalidação necessários; não recircular a mesma proposta. Sem contador universal inventado. |
| **Decisão fora do domínio validado** | Recusar decisão/alternativa; pedir contexto ou rota profissional apropriada. Nenhum fallback quantitativo arbitrário. Só revisão autorizada do domínio/policy habilita essa decisão. |

Dados apenas ausentes não exigem HOLD total por padrão: se contexto solo suficiente permitir, usar opção validada menos específica. Restrição safety prevalece sobre compromisso Crew, streak, receita e engajamento. HOLD/reason/confidence não cruzam para Crew/share; a pessoa pode escolher o desfecho próprio genérico já permitido. Conteúdo/thresholds profissionais ficam nas dependências A/B e Security, sem inventar avaliação médica.

## 6. Casos negativos e evidência futura necessária

**CTRL-013 — critérios conceituais**, a integrar em CF/AEC e testar na implementação. Estes são critérios de aceitação, **não testes executados**.

| Caso | Resultado exigido |
|---|---|
| N01 Mesmo webhook reenviado; depois chega detalhe/correção legítima | Um fato lógico; nova revisão aceita; carga/normalization/adaptation não duplicadas. |
| N02 Garmin direto + mesma atividade via store/Terra | Origem e associação resolvidas ou ambiguidade explícita; não duas cargas; duas sessões reais não são mescladas só por horário. |
| N03 Timeout/424 no publish sem idempotency/read remoto | Unknown, sem retry automático cego/sucesso fictício; cópia possível e caminho no app claros. |
| N04 Delete local/Terra retorna sucesso, vendor não suporta | Não chamar remoto apagado; versão velha possível, estado/ação recuperáveis. |
| N05 Update COROS apaga antiga, create falha; ou create efetiva e resposta perde | Falha parcial/unknown rastreável, sem revisão nova anunciada no device nem ciclo duplicador. |
| N06 Novo plano/override/consentimento durante queue/retry | Revalidação no efeito invalida operação antiga; não aplicar confirmação passada sobre revisão nova. |
| N07 Revogar write mantendo read e vice-versa | Cessa finalidade/pendências afetadas; mantém outra só onde exequível/autorizada; não promete scopes OAuth independentes. |
| N08 App offline, relógio conserva workout antigo | Registro local preservado; cópia antiga identificável; nenhum update remoto fictício. |
| N09 Atividade tardia executou revisão anterior | Preserva revisão/decisão conhecida, reconcilia futuro; sem falha retroativa ou compensação. |
| N10 Atividade não chega ou HealthKit retorna vazio | Desconhecido/limite de fonte; não não treinou/zero/consentimento negado. |
| N11 HRV SDNN vs RMSSD, faixa pace invertida, baseline relativo ausente | Não intercambiar/misturar; transformação correta ou export/decisão dependente recusados. |
| N12 Terra ignora alvo, inventa default, remove exercício ou muda repeat | Loss report/preflight recusa quando sem equivalência; warning posterior abre discrepância, não aprovação. |
| N13 Strength com RIR/reps/load para destino apenas temporizado | App mantém semântica completa; relógio recusado/suplementar explícito, sem reduzir domínio. |
| N14 Red flag/restrição/proposta LLM fora da whitelist | HOLD/recusa no escopo; nenhuma dose/diagnóstico/bypass/objetivo oculto ou leak social. |
| N15 User corrige contexto enquanto adaptação finaliza; pede undo depois de treino | Não sobrescrever override; nova avaliação; preservar realizado; nenhum undo remoto/fisiológico universal. |
| N16 Provider outage e backfill além da janela/permissão | Gap honesto, reconciliação permitida/limitada, sem inventar histórico; plano preparado só continua se ainda válido. |
| N17 Grava planned record Health Connect ou recebe scheduler receipt Apple | Status no nível provado; não concluir ready no watch/executado/detalhes observados. |
| N18 LLM recebe notes externas com instrução de ignorar safety ou Strava Data | Texto tratado como dado, ignorar instrução; origem/termos bloqueiam uso indevido; nenhum efeito privilegiado. |

## 7. Cobertura explícita dos 32 itens C

Fechado documentalmente significa semântica/capacidade conhecida ou gap exato registrado; não significa runtime pronto.

| Item do pedido | Local de resposta | Situação |
|---|---|---|
| 1 Model neutro | CTRL-001/002 | Proposta fechada para integração/review; sem schema de implementação. |
| 2 Matriz provider | §2/§3 | Pública por rota; acesso/device separados. |
| 3 Completed import | WEA-001/004/007/009/011 | Documentado; credenciais/consent/teste pendentes. |
| 4 Health/recovery ingestion | Mesmos + WEA-020/CTRL-003/004 | Tipos/métodos preservados; nenhuma autoridade fisiológica automática. |
| 5 Structured publish | WEA-002/004/010/013 | Candidatos reais; Polar direto não demonstrado. |
| 6 Update/replace | §3, CTRL-008/009 | Rota e falha parcial explícitas; direto parceiro exige contrato. |
| 7 Delete/revoke | §3, CTRL-008 | Cópia/local/remoto/finalidade distintos. |
| 8 Time | §3.2/CTRL-001 | Capacidade documentada ou store/formato rotulados. |
| 9 Distance | §3.2/CTRL-001 | Mesma distinção; atividade precisa suportar distância. |
| 10 Repeats | §3.2/CTRL-001/002 | Contagem total, representação e limites explícitos. |
| 11 Manual/auto | WEA-006/010, §3.2 | Executor/adapter separados. |
| 12 Pace | §3.2/CTRL-001/002 | Faixa/unidade/semântica, sem conversão oculta. |
| 13 HR | §3.2/CTRL-001/002 | Baseline/zone versionados; sem defaults. |
| 14 Strength | §1/3.2/CTRL-001/002 | App-first; suplementar fiel por capacidade. |
| 15 Webhooks/latency | §3.3/WEA-016 | Sem SLA universal; divergência de rota COROS registrada. |
| 16 Offline/degraded | CTRL-009/N08/N16 | Versão válida e registros preservados. |
| 17 Provider/device limits | §2/3/9 | Fonte pública vs parceiro/device/spike. |
| 18 Provenance | CTRL-003 | Campos/lineage conceituais definidos. |
| 19 Dedup | CTRL-008/010 | Delivery/recurso/fato distintos. |
| 20 Sync status | CTRL-009 | Nível de prova/status sem sucesso fictício. |
| 21 Read/write consent | CTRL-008 e §3.1 | Finalidades independentes; OAuth real qualificado. |
| 22 Disconnect | CTRL-008/009 | Cessa uso/filas afetados; remoto não prometido. |
| 23 History | §3.3/WEA-007/012/016 | Janela/provedor/consentimento, gaps não inventados. |
| 24 Workout version | CTRL-001/005 | Revisão imutável e cópia externa separada. |
| 25 Plan version | CTRL-001/005 | Plano-base/resultante rastreáveis. |
| 26 Planned/performed | CTRL-011 | Associação/evidência/revisão antiga preservadas. |
| 27 Delay | CTRL-003/009/011 | Occurred/received e futuro readaptado. |
| 28 Duplicate | CTRL-010/N01/02 | Um fato ou ambiguidade, sem soma dupla. |
| 29 Missing | CTRL-004/011/N10 | Desconhecido, não falha. |
| 30 Outage | CTRL-009/N16 | Degradação e revalidação, sem precisão fabricada. |
| 31 Unsupported step | CTRL-002/N12/13 | Equivalência provada ou recusa/fallback app explícito. |
| 32 Multisource conflict | CTRL-003/004/010 | Provenance/limite/resolução, sem preferência arbitrária. |

## 8. Mapa preciso de amendments para os existentes

Owner Product/UX integra comportamento; Engineering/Security verificam delta. Não reescrever tese/PTM nem criar arquivo normativo concorrente. Rever apenas os consumidores materialmente alterados.

| Documento / seção atual | Amendment proposto / referências | Consumidor e invalidação delimitada |
|---|---|---|
| **AEC §2–4** | Incorporar CTRL-003/004/005/006/010/011: provenance, confiança por decisão, trace, race de contexto, associação e undo coerente. | CF F02/F03/F05/F06 e Domain; review novo cobre delta, não reabre a tese. |
| **AEC §5.1–5.2** | Incorporar CTRL-001/002/008/009, distinguindo formato neutro/adapter, perda semântica, provas de sistema/device, idempotência local/unknown, update composto e OAuth granular real. Citar §2/3 como evidência de capacidade, sem fixar vendor como verdade. | F04/F05, Domain W1–W3, Architecture AR-08/09; novo parecer técnico/privacidade. |
| **AEC §7/8** | CTRL-007/012: whitelist LLM, contexto material verificável, HOLD por classe/escopo/saída e limites de autoridade. Policy profissional segue A/B; abertos técnicos concretos em §9. | F02/F06/F07 e experiência da incerteza; sem escolher modelo. |
| **PDM §3–5, I1/I2/I6/I10 e W1–W3** | Acrescentar relações/revisões de observation→derived→trace; aplicação/confirm intent; capability por rota e nível de recibo; HOLD e association ambiguity. Reusar entidades existentes, sem novo domínio ou tabela técnica. | Architecture/AEC/CF; preservar um plano/atleta e social sem autoridade. |
| **PA §3/§4/§5, AR-03/05/08/09 e §8** | Delimitar domínio→neutro→adapter→provider, prévia de diferença, status/provenance/hold na mesma referência da sessão/decisão/conexão. Sem novo hub/watch tab nem design visual. | UX detalhada precisa ações/estados, não endpoints. AR-11 de reconhecimento Crew permanece intacta. |
| **RS §2/4/6** | Strength app-first; Running step-by-step quando provado; prova completa de ao menos um caminho. Reclassificar matriz/public facts resolvidos e separar acesso/hardware/policy/contratação pendentes por etapa §9. | Não declarar launch coverage ou reduzir requisitos; pricing não bloqueia UX/Figma. |
| **CF F02–F06/F07 e cenários S03/04/06/07/08** | Incorporar CTRL-013 N01–N18 nos caminhos correspondentes: unknown/retry, versão antiga, perda, store≠executor, override, source conflict e HOLD. Evitar repetir schema/evidence ledger nos flows. | Mesmos objetos e entry points; nenhum flow de chat, novo esporte ou Figma. |

## 9. Gaps exatos, owners e bloqueio por etapa

UX/Figma podem especificar comportamento condicionado com dados de exemplo rotulados, sem prometer marca/modelo, thresholds ou dose. **Bloqueia** abaixo significa impede somente a etapa/declaração dependente; não exige parar a missão inteira. Figma permanece fora desta missão.

| Gap / tipo | Decisão/prova mínima necessária / owner | UX detalhada | Figma | Implementação | Release/promise |
|---|---|---|---|---|---|
| **G-W01 Acesso cloud/comercial** | Escolher candidato; obter admissão/entitlement/documentação e termos vigentes para Garmin/COROS direto ou Terra/provider. Owner Engineering + Founder (compromisso/spend) + Security/Legal. Nenhuma inscrição autorizada agora. | Não bloqueia estados genéricos; bloqueia copy de marca suportada | Igual | Bloqueia integração real afetada, não contratos neutros | Bloqueia anúncio da rota |
| **G-W02 Representação/hardware** | Workout golden cases: time/distance/open/repeats/pace/HR/versão; update/delete/unknown/offline e realizado retornando, por modelo/OS/firmware. Owner Engineering/Quality, autoridade de treino avalia fidelidade semântica. | Não bloqueia estados/fallback; impossível fechar interação específica de device não validado | Igual | Spike autorizado futuro antes de adapter final | Bloqueia declaração supported/closed loop |
| **G-W03 Terra contra direto/quote** | Confirmar oferta para o Vilumo, bases/add-on, conexão/dados, production entitlements, COROS push vs polling, update conteúdo vs reschedule, migração/retention e termos provider. Owner Engineering + Security + Founder comercial. | Não bloqueia comportamento neutro | Não bloqueia | Bloqueia escolha/integração Terra definitiva | Bloqueia contratação/promessa/custo líquido |
| **G-W04 Polar/TP opcional** | Write oficial direto novo, ou demanda justificada + prova/acesso de toda ponte TP e diferenças de zona/fase/força. Owner Engineering; Founder só se nova dependência comercial/escopo. | Não bloqueia V1; descrever ingestão/app | Não bloqueia | Bloqueia apenas outbound Polar reivindicado | Polar outbound não pode ser anunciado |
| **G-W05 Privacidade e revogação operacional** | Propósitos/minimização/retention/deletion/backups, permissões reais e prova de cessar retries/derivados por finalidade. Owner Security/Legal + Engineering; especificar antes de coletar. | Security fecha semântica nesta missão; sem dados extras por conveniência | Sem visual/conteúdo que presuma consentimento amplo | Bloqueia coleta/efeitos reais dependentes | Bloqueia release dependente |
| **G-W06 Safety policy/validação profissional** | Critérios/populações/thresholds/saída HOLD, opções de treino/Nutrition e prescrição admissível. Owner profissional competente + A/B Research/Product, não provider/LLM. | Não bloqueia estrutura de HOLD; bloqueia copy/prescrição específica sem validação | Mesma delimitação | Bloqueia motor/prescrição dependentes | Bloqueia uso real/claims |
| **G-W07 Controle executável** | Provar CTRL-008–013 com concorrência, duplicação, atraso, drift, auth revogada, fontes distintas, perda/unknown e undo; logs/trace mínimos sem dado sensível extra. Owner Engineering/Quality/Security. Sem DB/API/stack escolhidos aqui. | Não bloqueia contrato conceitual | Não bloqueia | Obrigatório antes de declarar controles implementados; mecanismo pertence à etapa | Bloqueia readiness do loop |
| **G-W08 LLM opcional** | Se selecionado: modelo/contratos/tools, dados autorizados, retenção/fallback/evals de boundary e injection. Owner AI Systems/Security/Engineering em missão futura. | Não bloqueia core direto; não criar dependência conversacional | Não bloqueia | Bloqueia somente feature LLM real | Feature só entra com gates próprios |

## 10. Handoff ao Chief e integração

Estado de autoria: **evidência/propostas C/D prontas para integração e review independente**, sem `ENGINEERING_ARCHITECTURE_READY` ou aprovação de produto/runtime emitida pelo autor. Acesso público às capacidades e semântica dos controles foram fechados; approval privado, device/spike, jurisdição e parâmetros profissionais não foram fabricados. Não há commit, código, API Vilumo, banco, scaffold, Figma ou conta externa criada.

Próxima ação: Product/UX integra somente amendments necessários nos consumidores existentes; Chief preserva findings/versões e envia o pacote atual + deltas a Engineering/Security judges frescos. Judge verifica suporte das fontes, independência de vendor, authority/confirmation/retry e os 32 itens. Findings voltam aos autores; este arquivo não se torna outra fonte de verdade por receber PASS. STOP_WHEN C/D: consumers inequívocos + evidência pública delimitada + gaps externos exatos + pareceres correntes; não pesquisar mais marcas nem executar spike sem autorização.
