# RepMile V1: rastreabilidade funcional das telas aprovadas

**Data:** 2026-11-24 · **Branch:** `claude/v1-ui-functional-reconciliation`.

**Cobertura do inventário do Figma** (`figma-inventory/`, somente leitura, arquivo `90oyvXHxxBQAvr1netov7S`):
- **Páginas:** 25 lidas, nenhuma com falha.
- **Telas de fluxo:** 588, das páginas 10 a 83, cada uma com o seu motion. Isso bate com o "Guia e status" (`897:2`).
- **Transcritas na íntegra:** 00 · Guia e status e 99 · Handoff V1.
- **Páginas 04 e 05:** landing page e Instagram de pré-lançamento, fora do app. Só os nomes dos quadros.
- **Página ZZ · Legado:** só nomes de quadros, sem autoridade.

**Limites declarados da leitura:**
- camadas ocultas (o 99 cita dois nós de texto ocultos na página 80);
- qual opção está selecionada em pílulas e checkboxes;
- linhas "Não/Sim" repetidas dentro de um mesmo quadro.

**Estado das páginas:** a 83 está marcada "A aprovar". As telas marcadas "ainda não vistas" (20 sem relógio, 40 sem FC ao vivo, 81 "o que está chegando" e splash) entram aqui como baseline do arquivo, com essa ressalva.

**Como ler:**
- Cada linha é um componente ou comportamento funcionalmente distinto, com todas as telas onde aparece. Instâncias visuais repetidas não viram linhas novas.
- "Evidência" aponta para código congelado (`src/…`), um probe de resposta real (`P:<arquivo>` em `probes/out/`), um contrato (`HO §` = `audits/v1-final-physical-2026-11-24/SWIFTUI_BACKEND_HANDOFF.md`; `PIC §` = contrato paralelo) ou um gap (`GAP-nn` em `UI_CONTRACT_GAPS.md`).

**Códigos usados nas colunas de comportamento:**
- **IG:** igual, não depende de relógio nem do Apple Saúde.
- **OC:** oculta a célula ou o bloco e fecha o espaço, sem traço e sem "indisponível" (regra do 99).
- **EM:** mostra o estado que o motor nomeia (`status`/`reason`), por cópia localizada.
- **AG:** "Ainda sem dados. Não é o mesmo que não feito" (20 `575:1424`).
- **NA:** não se aplica.
- **FX:** teste com fixture real de `probes/out`.
- **UI:** teste de UI (snapshot ou XCUITest).
- **INT:** teste de integração A+B+C.

**Classificação:**
- `SUPPORTED_CORE`
- `SUPPORTED_IOS`
- `SUPPORTED_HEALTHKIT`
- `SUPPORTED_MANUAL`
- `SUPPORTED_APP_LAYER`
- `BACKEND_DEPENDENT`
- `FUTURE_INTEGRATION`
- `UNVERIFIED`
- `UNSUPPORTED_V1`

Cada linha suportada cita evidência. `UNVERIFIED` significa que existe um caminho plausível ainda não provado.

---

## 1. Onboarding (10) e criação do plano

| Tela | Componente | Origem | Contrato | Evidência | V1 | Dependências | Sem relógio | Parciais | Ausentes | Atrasados | Ação | Teste |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 10 · 02–08 (O que treinar, objetivos, prova, meta, prioridade) | Objetivos e prova | manual → CoachingCore | `onboard({intake.athlete.goals})` HO §5.1 | `test/v1int-helpers` athleteA; P:01-onboard | SUPPORTED_CORE | nenhuma | IG | meta de tempo opcional | sem prova: plano sem fase de prova (71 Rafa) | NA | responder; voltar | FX 01 + teste de schema SEC-INT-05 (A) |
| 10 · 09–16 (Sua semana, longão, duração, onde treina, equipamentos, treinador) | Rotina e coach | manual | `intake.schedule`, `equipment`, `setCoach` (`CONSERVATIVE / BALANCED / DEMANDING`) | `v1-coaching.mjs COACH_PROFILES`; HO §5.1 | SUPPORTED_CORE | nenhuma | IG | turno opcional (99: pergunta na montagem) | NA | NA | escolher dias e turnos | teste de schema |
| 10 · 17 Nome, 18 Idade | Perfil | manual | `athlete.ageYears` (o nome não vai ao motor) | HO §5.1 | SUPPORTED_MANUAL | nenhuma | IG | NA | o motor pergunta | NA | responder | teste de schema |
| 10 · 19 Altura e peso (`836:2649`) | Perfil físico | manual / HealthKit | **nenhum** no intake | GAP-36 | UNSUPPORTED_V1 | — | — | — | — | — | sai do fluxo salvo decisão | o intake não contém altura nem peso |
| 10 · 20 Apple Saúde | Pedido de permissão | HealthKit | `requestAuthorization` (só leitura) | HO §11; B handoff | SUPPORTED_HEALTHKIT | permissão | o iPhone tem Saúde mesmo sem relógio | o resultado não revela negação (GAP-19) | segue sem importar | NA | permitir ou pular | UI + B |
| 10 · 21–24 Corrida até aqui, tempo, resultado recente | Histórico de corrida e âncoras | manual (+ resumo do Apple Saúde: "Data e duração", `836:2791`) | `intake.athlete.recent`, `performanceAnchors[{kind, distance, seconds, date, measurement, rpe, tolerated}]` | HO §5.1; P:12 `runCalibration.capacity` | SUPPORTED_CORE | nenhuma | IG | resultado sem RPE: o motor pergunta | sem resultado: sem estimativa, teste oferecido (60/71 Rafa) | resumo HK antigo: não é âncora sem resultado | informar resultado | FX 12 (calibrado por `RACE_RESULT`) |
| 10 · 25–26 Força até aqui, cargas conhecidas | Experiência de força | manual | `strengthTrainingMonths`; cargas conhecidas → `load.mode: KNOWN` | `r6-program.mjs` mode KNOWN; P:03 | SUPPORTED_CORE | nenhuma | IG | "Não sei minhas cargas" → `ESTABLISH` | idem | NA | informar ou pular | FX 03 (`ESTABLISH` sem número) |
| 10 · 27 Cuidados (`836:3299`) | Triagem inicial | manual → CoachingCore | `athlete.eligibility.{6 booleanos}` + **`specialPopulation`** | `r6-intake.mjs:91`; GAP-02 | SUPPORTED_CORE com correção de schema | nenhuma | IG | "Nenhum destes" explícito | sem resposta = pergunta | NA | marcar ou "Nenhum" | teste de schema com gestação (GAP-02) |
| 10 · plano bloqueado por sinal; 81 · `Plano indisponível · sinal informado no cadastro` | Plano retido no cadastro | CoachingCore | `enroll` → `CLINICAL_HUMAN_REQUIRED` / fora de escopo | P:actions-E2 (padrão clínico) | SUPPORTED_CORE | nenhuma | IG | NA | NA | NA | ler a orientação; nunca treinar | FX |
| 10 · Seu plano (prévia, maratona elegível ou não, Marina, Rafa) | Prévia da semana e do plano | CoachingCore | `onboard` → `view` + `sessions()` + `presentation()` | P:01–04 | SUPPORTED_CORE (o motor roda no aparelho antes da conta) | `syntheticOnly` (GAP-01) | IG | NA | NA | NA | ver; "salvar o plano" = conta | FX 02/03 |
| 10 · paywall, entrar | Oferta e conta | StoreKit / backend | GAP-31, GAP-32 | — | SUPPORTED_IOS (compra) / BACKEND_DEPENDENT (conta) | rede, App Store | IG | NA | planos indisponíveis (80) | NA | assinar, restaurar, agora não | StoreKit Testing |
| 10 · consentimentos | Consentimentos explícitos | manual | `consents {COACHING, HEALTH_SIGNALS, LEARNING}` | HO §4 | SUPPORTED_CORE | nenhuma | IG | cada um explícito | NA | NA | aceitar ou recusar cada um | FX |

## 2. Hoje (20)

| Tela | Componente | Origem | Contrato | Evidência | V1 | Dependências | Sem relógio | Parciais | Ausentes | Atrasados | Ação | Teste |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 20 · todos (`572:203` e outros) | Sessões do dia e ordem (dia duplo, turno) | CoachingCore | `plan().view.week.sessions[]` por `date == view.today`, `turn` | P:02 | SUPPORTED_CORE | nenhuma | IG | NA | dia sem sessão: "Descanso planejado" (`status: REST`) | NA | abrir o treino | FX 02 |
| 20 · botões "Começar …" | Iniciar sessão | CoachingCore + A | `executable` + `startability()` | GAP-04; P:17 | SUPPORTED_CORE | relógio confiável (D1) | IG | NA | não iniciável: o botão some e o motivo aparece | NA | começar | FX 02 (iniciável), 17 (bloqueado), C1 (triagem) |
| 20 · manchete do treinador ("Hoje são dois…", "Por que nessa ordem?") | Texto do treinador | CoachingCore (códigos) | `role`, `turn`, `explanation`, `lastDecision.action` | GAP-23, GAP-24 | SUPPORTED_CORE (por código); razões sem fonte: UNSUPPORTED_V1 | nenhuma | IG | sem `explanation`: o botão "por quê" some | idem | NA | ler | teste de cobertura da tabela de cópia |
| 20 · "Sono 7h10 · VFC 58 ms" | Sinais do dia | HealthKit | nenhum | GAP-17 | FUTURE_INTEGRATION | Apple Watch e permissões | OC (`880:4257`) | só sono (`880:4841`) | OC | OC | nenhuma | UI |
| 20 · clima | Clima | WeatherKit | WeatherKit | GAP-30 | SUPPORTED_IOS | localização, rede | IG | NA | OC | último valor com hora, ou OC | nenhuma | UI |
| 20 · `longão mantido após noite curta` (`572:1379`) | Decisão por sono | — | nenhum (o motor não lê sono) | GAP-23 | UNSUPPORTED_V1 | — | — | — | — | — | — | não renderiza na V1 |
| 20 · card da prova ("43:30–48:45 · capacidade atual estimada · meta 44:30") | Estimativa e meta | CoachingCore | `presentation().readings.runCalibration.estimates[evento]` (faixa primeiro), `goal`, `runForecast.planScenario.goalRelation` | P:12 | SUPPORTED_CORE | âncora de corrida | IG | sem meta: sem a linha da meta | `status UNAVAILABLE`: EM ("Indisponível, por enquanto", 60 `731:1601`) | `validUntil` vencido: EM pelo motor | ver detalhe (71) | FX 12; teste "central nunca sozinho" |
| 20 · trilha de fases ("Construção → Específico → Polimento", "sobe até a semana 6") | Fases do plano | CoachingCore | **projeção** `weekPlan()` | GAP-07 | UNVERIFIED (depende de CHG-UI-2) | — | IG | NA | sem projeção: OC | NA | ver Plano/Fases | FX da projeção |
| 20 · "3 de 7 sessões feitas", "19 de 19" | Contagem semanal | CoachingCore + registro | `week.sessions[].status` + `history()` | P:13, P:20 | SUPPORTED_APP_LAYER | nenhuma | IG | parcial conta como parcial | AG para o que aguarda sincronizar | "2 aguardando o relógio sincronizar" (`575:1424`) | ver Plano | FX |
| 20 · `Registro · sessão parcial`, `treino de ontem sem registro` | Pedir o relato | manual → CoachingCore | `logRun` / `logStrength` / `submit` (`completed:false` = perdida) | P:10, P:actions-C3 | SUPPORTED_CORE | nenhuma | IG | parcial (minutos menores) aceito | não registrado ≠ não feito: o motor não infere | relato atrasado aceito com `occurredOn` | registrar, ou "não fiz" | FX 10, C3 |
| 20 · `Pergunta rápida antes do treino` (`575:1172`) | Pergunta antes da sessão | manual | parcial | GAP-11 | UNVERIFIED ("Com dor" = SUPPORTED_CORE) | nenhuma | IG | "Prefiro não responder" não envia | NA | NA | responder | FX A3 (dor) |
| 20 · `Sem dados recentes do relógio` (`575:1424`) | Atraso de sincronização | B (fila e última leitura) | porta `HealthIngestStatus` (CHG-UI-3) | PIC §4; GAP-18 | SUPPORTED_HEALTHKIT (via B) | Apple Saúde | não aparece sem relógio conhecido | NA | NA | aviso + "Registrar à mão" | abrir o Apple Saúde, registrar à mão | INT |
| 20 · `Sugestão de mudança aguardando você` | Proposta pendente | CoachingCore | `view.pending` + `accept` / `decline` | P:actions-B1/B2, A2b/A2c | SUPPORTED_CORE | nenhuma | IG | detalhe da força: GAP-08 | NA | NA | aceitar, manter | FX B1→B2 |
| 20 · `Avulsa registrada em dia de descanso`, botão + | Treino avulso | manual → CoachingCore | `submit` com observação sem `sessionId` e `actual.sport` | P:unplanned-8; GAP-12 | corrida SUPPORTED_CORE; força UNVERIFIED | nenhuma | IG | NA | NA | NA | iniciar ou registrar avulso | FX unplanned-* |
| 20 · `Prova · semana de prova`, `dia da prova`, `resultado registrado` | Prova | CoachingCore | `prescription.event`, `runForecast.raceWeek`, relato do resultado (`logRun` / `submit`) | P:03 (event), P:12 (raceWeek) | SUPPORTED_CORE | nenhuma | IG | NA | NA | NA | correr por esforço; registrar o resultado | FX |
| 20 · `Volta depois de uma pausa` | Retorno | CoachingCore | `state: RETURNING`, `explanation` "Return step 1…" | P:19 | SUPPORTED_CORE | nenhuma | IG | uma modalidade ainda retida (`HELD`) | NA | NA | seguir o retorno | FX 19 |
| 20 · `Segunda · semana anterior fechada` | Revisão da semana | CoachingCore | `lastDecision` (`WEEKLY_REVIEW`, `GATED_NEXT_STEP`) | P:13 | SUPPORTED_CORE | nenhuma | IG | NA | NA | NA | ver o porquê (`decision()`) | FX 13/21 |
| 20 · `Outro perfil · plano só de força`, `sem prova, objetivo de constância` | Variantes de perfil | CoachingCore | `sports.RUN.programmed = false` | `views.mjs sportState` | SUPPORTED_CORE | nenhuma | IG | NA | bloco de corrida OC | NA | — | fixture só força (C cria pelo motor) |
| 20 · `Sistema · sem conexão`, `carregando`, `erro ao carregar`, `sem plano` | Estados técnicos | A | `ClientState`, `PendingReports` (`NOT_SYNCED`) | HO §7; P:22, P:23 | SUPPORTED_CORE / APP_LAYER | nenhuma | IG | NA | `NO_DATA` → onboarding | `NOT_SYNCED`: "registro ainda não enviado" | tentar de novo | FX 22/23 |

## 3. Plano (30) e Treino planejado (31)

| Tela | Componente | Origem | Contrato | Evidência | V1 | Dependências | Sem relógio | Parciais | Ausentes | Atrasados | Ação | Teste |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 30 · Semana (todas as variantes) | Semana e dia a dia | CoachingCore | `plan({week})`, `sessions()` | P:02, P:03, P:13 | SUPPORTED_CORE | nenhuma | IG | parcial, não feita, movida, avulsa: por `status` e relato | sem registro: AG | NA | abrir a sessão | FX 02/03/13 |
| 30 · próxima semana provisória | Semanas projetadas | CoachingCore | `projected: true` (depois de uma pergunta) | P:14 | SUPPORTED_CORE | nenhuma | IG | NA | NA | NA | nunca iniciável | FX 14 |
| 30 · resumo da semana ("Corrida 34 de 199 min", "Força 3 de 3", "2h34 de 5h19") | Totais previstos e feitos | CoachingCore + registro | soma de `durationMinutes` + `history().minutes`; oficial: `weekPlan().plannedRunMinutes` | P:03, GAP-07 | SUPPORTED_APP_LAYER (soma) / UNVERIFIED (número do motor) | nenhuma | IG | feito parcial | NA | AG | — | FX |
| 30 · `Fases · plano inteiro` (`596:2125`), gráfico de minutos por semana | Fases e volume | CoachingCore | `weekPlan()` (CHG-UI-2) | GAP-07 | UNVERIFIED | — | IG | "Cheio é feito, suave é previsto" | OC sem projeção | NA | — | FX da projeção |
| 30 · Mês | Calendário | CoachingCore | `sessions()` | P:03 | SUPPORTED_CORE | nenhuma | IG | NA | NA | NA | navegar | FX 03 |
| 30 · `Mover · arrastando` (`593:689`) | Mover para o dia escolhido | — | **nenhum** | GAP-09 | UNSUPPORTED_V1 → vira "não posso neste dia" | — | — | — | — | — | marcar o dia indisponível | FX B1 |
| 30 · `Mudar a agenda · dia indisponível`, `Proposta · aguardando confirmação (sábado indisponível)` (`597:1542`) | Dia indisponível | CoachingCore | `updateAvailability({unavailableDates})` → `RESCHEDULE_WITHIN_WEEK`, `PENDING_CONFIRMATION` | P:actions-B1/B2 | SUPPORTED_CORE | triagem atual (GAP-20) | IG | NA | NA | NA | confirmar ou recusar | FX B1→B2 |
| 30 · `Mudar a agenda · o que mudou` | Mudança de rotina | CoachingCore | `updateAvailability({changes})` (`SCHEDULE_CHANGE`) | `api.mjs` | SUPPORTED_CORE (não exercitado no probe) | triagem atual | IG | NA | NA | NA | confirmar | FX a criar (C ou A) |
| 30 · propostas (pendente, aceita, recusada, oferta, substituída) e histórico de mudanças | Ciclo da proposta | CoachingCore | `pending`, `accept`, `decline`, `decision()`, `history().decisions` | P:actions-*, P:20/21 | SUPPORTED_CORE | nenhuma | IG | diff da força: GAP-08 | NA | NA | aceitar ou recusar | FX |
| 30 · estados (sem conexão, gerando, integridade, pausa por segurança) | Estados do plano | CoachingCore + A | `INTEGRITY_FAILURE`, `BLOCKED` (`hold.exit = READINESS_DECLARATION`), `OPERATIONAL_ERROR` | P:17; HO §7 | SUPPORTED_CORE | nenhuma | IG | NA | nunca um plano vazio | NA | declarar prontidão (só no bloqueio) | FX 17 |
| 31 · corridas (limiar 3×5, leve, longão, toque de prova, soltura, caminhada e trote, só esforço) | Etapas prescritas | CoachingCore | `presentation().inForce[].blocks[].steps[]` (`TIME`/`DISTANCE`, `effortDomain`, `rpe`, `pace`) + `prescription.work` / `strides` | P:12, P:03 | SUPPORTED_CORE | nenhuma | IG | só esforço: sem faixa (`pace` ausente) | NA | NA | iniciar se iniciável | FX 12 |
| 31 · faixa de ritmo ("6:15–7:10 /km") | Faixa de ritmo | CoachingCore | `step.intensity.pace` / `runCalibration.paceBands` (`label ESTIMATED`, `effortGoverns`, `ceilingOnly`) | P:12 | SUPPORTED_CORE | âncora ou corridas leves observadas | IG | parcial: só a faixa leve observada (71 Rafa) | `UNAVAILABLE`: só esforço | `validUntil`: EM | ver origem e validade (71) | FX 12 |
| 31 · força (inferior, superior, corpo inteiro, primeira semana, manutenção) | Exercícios, séries, reps, RIR, descanso, carga | CoachingCore | `prescription.exercises[]` (`sets`, `reps`, `rir`, `restSeconds`, `load.mode/value/rule`) | P:03 | SUPPORTED_CORE | nenhuma | IG | `ESTABLISH`: "carga a estabelecer" | NA | NA | iniciar | FX 03 |
| 31 · "92,5 kg" (carga prescrita) e "sobe de regulagem" | Carga prescrita × regra | CoachingCore | `load.value` só com `KNOWN`; `FROM_LOG` = "a carga registrada da última vez" (GAP-06) | P:03 | SUPPORTED_CORE (`KNOWN`) / depende de GAP-06 (`FROM_LOG`) | histórico | IG | NA | sem histórico: a instrução sem número | NA | — | FX 03 |
| 31 · `trocar exercício (folha)` (`645:1683`), `proposta de troca, aguardando` | Troca de exercício | CoachingCore | `submit({kind: EXERCISE_SUBSTITUTION, substitution: {exerciseId, reason, nonclinicalConfirmed}})` | P:actions-A1/A2/A2b/A2c/A3 | SUPPORTED_CORE (via `submit`; sem formulário em `api.mjs`) | triagem atual | IG | sem motivo válido → ASK | com dor → clínico | NA | trocar e confirmar | FX A2→A2c; A3 |
| 31 · ações "Trocar por leve", "Mover de dia", "Não posso neste dia" | Ações da sessão | CoachingCore | "não posso" = `UNAVAILABLE_DAY`; "mover" = GAP-09; "trocar por leve": **nenhum** | GAP-09 | parcial: "Trocar por leve" UNSUPPORTED_V1 | — | IG | — | — | — | só "não posso neste dia" | FX B1 |
| 31 · estados (feita, parcial, não feita, movida, provisória) | Estado da sessão | CoachingCore | `status`, `projected`, `execution.status` | P:12, P:13 | SUPPORTED_CORE | nenhuma | IG | `PARTIAL` / `STOPPED` | NA | AG | — | FX |
| 31 · "Zonas de FC indisponíveis" (removida, 99) | — | — | — | 99 `934:37` | — | — | — | — | — | — | — | — |

## 4. Execução de corrida (40)

| Tela | Componente | Origem | Contrato | Evidência | V1 | Dependências | Sem relógio | Parciais | Ausentes | Atrasados | Ação | Teste |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 40 · pronto para começar, etapas, bloco, mudança de etapa, trote entre blocos | Condução das etapas | CoachingCore (prescrição) + app (cronômetro) | `blocks[].steps[]` com `target.seconds` / `metres` | P:12 | SUPPORTED_APP_LAYER sobre SUPPORTED_CORE | gravador da sessão (GAP-16, CHG-UI-5) | IG | NA | NA | NA | iniciar, pular etapa, pausar, encerrar | UI + fixture da prescrição |
| 40 · ritmo ao vivo, "na faixa" ou "fora da faixa" | Ritmo ao vivo | iPhone GPS (CoreLocation) | só exibição ao vivo; não vai ao registro sem a decisão de GAP-16 | GAP-16 | SUPPORTED_IOS (exibição) | localização "ao usar" e precisa | IG | GPS fraco: "ritmo oculto" (`657:1243`) | sem GPS: por tempo e esforço (`657:1144`) | NA | seguir o esforço (`effortGoverns`) | UI com localização simulada |
| 40 · distância ao vivo, tempo total | Totais ao vivo | iPhone GPS / cronômetro | idem | GAP-16 | SUPPORTED_IOS | idem | IG | ≈ distância com GPS fraco | só tempo | NA | — | UI |
| 40 · FC ao vivo ("158 bpm") | FC ao vivo | relógio | nenhum | GAP-34 | FUTURE_INTEGRATION | app de relógio (V2) | variantes "sem FC ao vivo" (`879:2007` e mais três) = padrão da V1 | NA | OC | NA | — | UI: nunca célula de FC |
| 40 · esteira (`657:1342`) | Velocidade da esteira | CoachingCore + conversão | faixa → km/h | GAP-26 | SUPPORTED_APP_LAYER | nenhuma | IG | NA | sem faixa: só esforço | NA | marcar esteira (medição `TREADMILL`) | teste da conversão |
| 40 · pausada, retorno depois que o app fechou, salvando | Ciclo da sessão | app | estado local do gravador | CHG-UI-5 | SUPPORTED_IOS (sem dono atribuído) | background location / tempo | IG | sessão interrompida retomável | NA | NA | retomar, salvar, descartar | UI com morte do processo |
| 40 · Dynamic Island, atividade ao vivo, barra nas abas | Live Activity | ActivityKit | nenhum dado de saúde (o próprio Figma diz "Nunca dados de saúde") | Figma 40 | SUPPORTED_IOS | permissão de Live Activity | IG | NA | NA | NA | — | UI |
| 40 · opção prevista ("encerrar os blocos após o 2º") | Opção da sessão | CoachingCore | `prescription` (`optionalByDesign`) e relato parcial | P:03 | SUPPORTED_CORE (relato parcial) | nenhuma | IG | parcial aceito | NA | NA | encerrar antes | FX C3 |
| 40 · `sentiu dor?`, `registro: algo incomum leva à triagem` (`660:1313`) | Triagem pós-corrida | CoachingCore | `submit` com `actual.stop{reason: SYMPTOM}` → `warningSignScreen REQUIRED` | P:actions-C1 | SUPPORTED_CORE | nenhuma | IG | parada sem motivo = sintoma | NA | NA | responder os sinais antes de salvar | FX C1 |
| 40 · `registro: esforço e como foi`, `dia seguinte: como você está?` | Relato do atleta | manual → CoachingCore | `actual.rpe`, `response.{performance, recovery, effort, nextDayFunction}` | HO §5.2 | SUPPORTED_CORE | nenhuma | IG | `UNKNOWN` quando perguntado e não respondido | NA | relato no dia seguinte aceito | responder | teste de schema SEC-INT-12 |
| 40 · `resumo salvo`, `resumo sem conexão (envio pendente)` (`660:1504`) | Resumo e fila | A (fila) | `recorded` + `PendingReports` | HO §4, §7 | SUPPORTED_CORE / APP_LAYER | nenhuma | IG | resumo mostra só o que o registro guardou (GAP-16) | NA | "envio pendente" até `recorded` | — | FX + morte do processo |
| 40 · corrida avulsa (configurar, com e sem GPS, salvar) | Corrida fora do plano | manual / iPhone | `submit` sem `sessionId`, com `actual.sport: RUN` | P:unplanned-8 | SUPPORTED_CORE (tempo e esforço) | GAP-16 para a distância | IG | NA | NA | NA | iniciar, registrar | FX unplanned-1 |
| 40 · `primeira vez: mostrar o treino na tela bloqueada?` | Consentimento da tela bloqueada | app | preferência local | — | SUPPORTED_APP_LAYER | nenhuma | IG | NA | NA | NA | permitir ou não | UI |

## 5. Execução de força (41)

| Tela | Componente | Origem | Contrato | Evidência | V1 | Dependências | Sem relógio | Parciais | Ausentes | Atrasados | Ação | Teste |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 41 · visão da sessão (`665:127`), série 2 de 4, teclado, RIR, descanso | Registro de séries | manual → CoachingCore | `logStrength({exercises: [{id, sets: [{reps, load: {value, unit, convention}, rir}]}]})` | P:09 | SUPPORTED_CORE | nenhuma | IG | série pulada não entra | NA | NA | registrar série, pular, descansar | FX 09 |
| 41 · coluna "Anterior" | Comparação com a última vez | registro | `loggedEntries()` (CHG-UI-2) | GAP-06 | UNVERIFIED | histórico | IG | NA | primeira vez: "—" proibido → OC | NA | — | FX da projeção |
| 41 · meta "4 × 5 · 3 em reserva · descanso de 2:30" | Prescrição | CoachingCore | `sets`, `reps`, `rir`, `restSeconds` | P:03 | SUPPORTED_CORE | nenhuma | IG | NA | NA | NA | — | FX 03 |
| 41 · `ajuste de carga` (`665:486`), `série abaixo do alvo` (`665:562`), "Usar 8 kg", "Revisar cargas" | Carga sugerida na sessão | — | **nenhum** | GAP-10 | UNSUPPORTED_V1 (o número); editar a carga = SUPPORTED_MANUAL | — | — | — | — | — | o atleta edita a própria carga | UI: nenhum número sem fonte |
| 41 · `sugestão do treinador durante a sessão` (`665:1079`) | Adaptação intra-sessão | — | **nenhum** | GAP-10 | UNSUPPORTED_V1 (FUTURE) | — | — | — | — | — | — | não renderiza |
| 41 · `corrigir série (folha)` | Corrigir antes de enviar | manual | edição local da série até enviar | — | SUPPORTED_APP_LAYER | nenhuma | IG | NA | NA | NA | corrigir | UI |
| 41 · `exercício opcional`, `adicionar exercício`, `remover exercício` | Mudar o conteúdo da sessão | manual | opcional: pular = não registrado; **adicionar**: exercício fora da prescrição no relato (não verificado); **remover**: pular | `api.mjs logStrength` | opcional SUPPORTED_CORE; adicionar UNVERIFIED | nenhuma | IG | NA | NA | NA | pular; adicionar sob verificação | FX a criar (A) |
| 41 · trocar exercício: motivo, alternativas, confirmar no plano, "Trocar só hoje" | Troca | CoachingCore | `EXERCISE_SUBSTITUTION` (no plano, à espera de confirmação); "só hoje": **nenhum** | P:actions-A2 | no plano SUPPORTED_CORE; "só hoje" UNSUPPORTED_V1 | triagem atual | IG | NA | NA | NA | trocar no plano | FX A2→A2c |
| 41 · `trocar exercício: com dor`, "Sinto dor… triagem" | Rota clínica | CoachingCore | `substitution.pain: true` → `CLINICAL_HUMAN_REQUIRED` | P:actions-A3 | SUPPORTED_CORE | nenhuma | IG | NA | NA | NA | ir à triagem | FX A3 |
| 41 · "Carga a estabelecer" (4 telas) | Estabelecer carga | CoachingCore | `load.mode: ESTABLISH`, instruções de rampa | P:03 | SUPPORTED_CORE | nenhuma | IG | NA | sem número (correto) | NA | registrar a carga encontrada | FX 03 |
| 41 · Força avulsa (8 telas) | Força fora do plano | manual | `submit` sem `sessionId` | GAP-12 | UNVERIFIED | — | IG | — | — | — | registrar | trace-unplanned-strength |

## 6. Concluído e histórico (50)

| Tela | Componente | Origem | Contrato | Evidência | V1 | Dependências | Sem relógio | Parciais | Ausentes | Atrasados | Ação | Teste |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 50 · Corrida concluída (tempo, distância, ritmo médio) | Números da corrida | registro | `presentation().inForce[].execution` (`actualMinutes`, `measuredKm`, `declaredKm`, `extentKm`, `reliability`, `paceWithheld`) + `loggedEntries()` | P:08, P:unplanned-7 | SUPPORTED_CORE (plano em vigor) / UNVERIFIED (histórico, GAP-06) | HK ou declarado | só iPhone: tempo e esforço sem a decisão de GAP-16 | duração sem distância (Marina `registro manual, sem distância`) | OC | AG | corrigir registro | FX 08, C4 |
| 50 · mapa da corrida, "Rota oculta" | Mapa e rota | HealthKit / app | GAP-29 | — | UNVERIFIED (depende de GAP-16 e CHG-UI-3) | permissão de rota (DR-109) | sem rota: cabeçalho simples | "Rota oculta" só por escolha do atleta | OC | NA | ligar ou desligar rotas | UI |
| 50 · números do treino: FC média e máxima, cadência, elevação | Grade 3 × 2 | HealthKit | nenhum | GAP-17 | FUTURE_INTEGRATION | Apple Watch | grade 2 × 2 (regra do 99) | célula a célula | OC | NA | — | UI |
| 50 · "Blocos · ritmo e FC", gráficos ao longo da corrida, parciais por km | Séries temporais | HealthKit / app | nenhum | GAP-17, GAP-16 | FUTURE_INTEGRATION | séries | "Blocos · ritmo" sem a coluna FC | gráfico a gráfico | OC | NA | — | UI |
| 50 · Zonas (Z1–Z5, "Tempo por zona") | Zonas | CoachingCore | `heartRateZones` (3 zonas) | GAP-37 | UNSUPPORTED_V1 (Z1–Z5) | — | OC | — | OC | — | — | UI |
| 50 · "Leitura do treinador" ("cita só o que usou") | Leitura do treino | CoachingCore | `decision.reason` / `action` da revisão que incluiu a sessão | P:06/07 | SUPPORTED_CORE (por código) | nenhuma | cita tempo e esforço | idem | sem razão: OC | NA | ver o porquê | teste da tabela de cópia |
| 50 · "Pé do treino" (fonte e o que chegou) | Proveniência | registro | `LoggedEntry.channel` / `measurement` | GAP-06 | UNVERIFIED (CHG-UI-2) | — | "registrado no app" | "veio do Apple Saúde: tempo, distância" | NA | NA | — | FX |
| 50 · `limiar parcial (2 de 3 blocos)`, `Força · parcial (3 de 5)` | Parcial | CoachingCore | `execution.status: PARTIAL`, séries registradas | P:actions-C3 | SUPPORTED_CORE | nenhuma | IG | parcial | NA | NA | — | FX C3 |
| 50 · `Corrida · importada do Apple Saúde`, `veio por outro relógio (tempo, distância e FC média)` | Corrida importada | HealthKit → CoachingCore | canal DEVICE (`importActivities`) | P:06, P:24 | SUPPORTED_HEALTHKIT | permissão | NA | FC média: OC (G-1) | NA | entra quando sincroniza | adicionar o que faltou (o esforço) pelo formulário | FX 06/24 + INT |
| 50 · `Força · importada do Apple Saúde` (`684:4890`), "Ocultar do Repmile" | Força importada | HealthKit (só exibição) | porta B→C (CHG-UI-3) | GAP-18 | SUPPORTED_HEALTHKIT (informativo, depende de CHG-UI-3); "Ocultar" UNSUPPORTED_V1 (GAP-13) | permissão | NA | só a duração | NA | NA | nenhuma | FX de B |
| 50 · `Prova de 5 km · referência dos ritmos` | Resultado como referência | CoachingCore | `runCalibration.capacity.reference`, `actualResults` | P:12 | SUPPORTED_CORE | nenhuma | IG | NA | NA | NA | — | FX 12 |
| 50 · `corrigir registro (folha)`, `registro corrigido`, `Força · corrigir série` | Correção | manual → CoachingCore | `submit` com `correctionOf` (o original fica como histórico) | journey D (`v1int-journeys`); HO §5.2 | SUPPORTED_CORE | nenhuma | IG | NA | NA | NA | corrigir | FX (journey D) |
| 50 · `Distância parece errada?` (`688:4096`) | Contestar a distância medida | manual → CoachingCore | `actual.declared {distanceKm, reason}` | P:unplanned-7 (`POOR`, `CORRECTED_MEASUREMENT`) | SUPPORTED_CORE | nenhuma | NA | NA | NA | NA | informar a distância real e o motivo | FX unplanned-5/7 |
| 50 · `Força · carga a confirmar`, "Manter 92,5 kg no registro" | Confirmar a carga registrada | manual | edição do próprio relato antes de enviar, ou correção | — | SUPPORTED_MANUAL | nenhuma | IG | NA | NA | NA | confirmar ou corrigir | UI |
| 50 · `Força · Inferior, com evolução do agachamento`, `comparar semana a semana` | Evolução do exercício | registro | `loggedEntries()` | GAP-06 | UNVERIFIED | histórico | IG | NA | primeira vez: OC | NA | — | FX da projeção |
| 50 · `Força · salvo neste iPhone, envio pendente` | Fila | A | `PendingReports` | HO §7 | SUPPORTED_APP_LAYER | nenhuma | IG | NA | NA | pendente | — | FX |
| 50 · `Corrida avulsa / Força avulsa · excluir` (`683:2360`), desfazer | Exclusão | — | nenhum | GAP-13 | UNSUPPORTED_V1 | — | — | — | — | — | — | não alcançável |
| 50 · Histórico: lista, filtros (origem, avulsas), busca, ir para data, semana fechada, treino não feito | Histórico | registro | `history()` + `loggedEntries()` | P:20, P:26; GAP-06 | SUPPORTED_CORE (data, feito, minutos) / UNVERIFIED (o resto) | nenhuma | IG | NA | vazio: primeiro uso (`Histórico / Vazio`) | AG | filtrar, buscar | FX 26 |
| 50 · `Registrar treino · corrida feita fora do app` / `força feita fora do app` | Registro manual | manual → CoachingCore | `submit` (sessão do plano ou avulsa) | P:unplanned-1 | corrida SUPPORTED_MANUAL; força avulsa UNVERIFIED | nenhuma | IG | duração sem distância | NA | data passada aceita | registrar | FX |
| 50 · estados (carregando, sem conexão, erro, Apple Saúde não conectado) | Estados | A / B | `ClientState`, `HealthIngestStatus` | HO §7 | SUPPORTED_CORE / HEALTHKIT | — | IG | NA | NA | NA | tentar de novo, conectar | FX |
| 50 · "Compartilhar semana" | Share | app | 82 | GAP-28/29 | SUPPORTED_APP_LAYER | — | — | — | — | — | compartilhar | UI |

## 7. Progresso (60)

| Tela | Componente | Origem | Contrato | Evidência | V1 | Dependências | Sem relógio | Parciais | Ausentes | Atrasados | Ação | Teste |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 60 · Geral: km, sessões, "+18% sobre o ano anterior" | Totais longitudinais | registro | `loggedEntries()` | GAP-06 | UNVERIFIED | histórico | km só com distância registrada | período parcial rotulado | poucos dados (Marina): OC por bloco | AG | escolher o período | FX da projeção |
| 60 · "Plano atual · 19 de 19 sessões feitas" | Aderência ao plano | CoachingCore + registro | `sessions()` + `history()` | P:03, P:20 | SUPPORTED_APP_LAYER | nenhuma | IG | parcial conta como parcial | NA | AG | — | FX |
| 60 · Mapa híbrido, VO₂ máx, "zona da meta" | Composto híbrido | — | nenhum | GAP-25 | UNSUPPORTED_V1 | — | — | — | — | — | — | não renderiza |
| 60 · volume semanal (corrida em km, força em sessões, descarga) | Volume | registro + CoachingCore | `loggedEntries()` + `weekPlan()` | GAP-06/07 | UNVERIFIED | — | força: sessões | NA | OC | AG | — | FX |
| 60 · divisão do tempo ("Corrida 59% · 3h05") | Tempo por modalidade | registro | minutos de `history()` + esporte do plano | P:20 | SUPPORTED_APP_LAYER (só sessões vinculadas) | nenhuma | IG | NA | NA | NA | — | FX 20 |
| 60 · Consistência ("44 de 52 semanas") | Constância | registro | GAP-28 | — | SUPPORTED_APP_LAYER (G03 para os rótulos) | — | IG | NA | NA | NA | — | FX |
| 60 · Sinais do relógio (VFC, sono, FC de repouso) | Sinais | HealthKit | nenhum | GAP-17 | FUTURE_INTEGRATION | Apple Watch | sem o bloco (`880:9310`) | só sono e repouso (`880:10566`) | OC | NA | "Não conectado": conectar | UI |
| 60 · Marcos (5 km 21:48, agachamento 92,5 kg, maior longão) | Recordes | CoachingCore (corrida) + registro (força) | `actualResults` / `historicalBest`; maior carga registrada | P:12; GAP-27 | corrida SUPPORTED_CORE; força UNVERIFIED | — | IG | NA | OC | NA | compartilhar (82) | FX |
| 60 · Corrida · plano atual, capacidade e ritmos (`729:478`) | Capacidade e faixas | CoachingCore | `runCalibration.capacity` / `paceBands` / `estimates` | P:12 | SUPPORTED_CORE | âncora | IG | faixa leve observada | "Indisponível, por enquanto" + teste oferecido (`731:1601`) | `validUntil` | ver o teste (71) | FX 12 |
| 60 · Corrida · Limiar bloco a bloco, Longões, leitura ao toque nas comparáveis | Comparação de sessões comparáveis | CoachingCore | `paceInsights.domains[]` (`INFORMATIVE_ONLY`) + `execution` | P:12 | SUPPORTED_CORE (`INSUFFICIENT_DATA` no probe) | 3+ sessões comparáveis | IG | `INSUFFICIENT_DATA`: EM | OC | NA | — | FX 12 |
| 60 · Força · cargas e séries, exercício, Inferior lado a lado | Exposição e evolução | CoachingCore + registro | `strengthExposure` (descritivo) + `loggedEntries()` | P:12; GAP-06 | exposição SUPPORTED_CORE; evolução UNVERIFIED | — | IG | NA | OC | NA | escolher o exercício | FX 12 |
| 60 · "tonelagem 13,8 t" | Tonelagem | registro | soma de reps × carga | GAP-06 | SUPPORTED_APP_LAYER (depende de GAP-06) | — | IG | carga sem convenção: fora da soma | OC | NA | — | FX |
| 60 · Força · 12 semanas, importados só com duração (`730:1109`) | Importados na força | HealthKit | CHG-UI-3 | GAP-18 | SUPPORTED_HEALTHKIT (informativo) | permissão | NA | só a duração | NA | NA | — | FX de B |
| 60 · estados (vazio, carregando, erro, sem conexão) | Estados | A | `ClientState` | HO §7 | SUPPORTED_CORE | — | IG | NA | NA | "mostrando o que estava salvo" | — | FX |

## 8. Perfil e ajustes (70), Prova (71), Adaptações (72)

| Tela | Componente | Origem | Contrato | Evidência | V1 | Dependências | Sem relógio | Parciais | Ausentes | Atrasados | Ação | Teste |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 70 · Seu treinador (Conservador/Exigente, proposta) | Perfil do treinador | CoachingCore | `setCoach({profile})` → proposta | `v1-coaching.mjs`; P:22 (envelope) | SUPPORTED_CORE | triagem atual | IG | NA | NA | NA | trocar e confirmar | FX |
| 70 · Volume e dificuldade (proposta, "o que muda") | Preferências | CoachingCore | `setPreferences({volume, difficulty})`: `LOWER`/`STANDARD`/`HIGHER`, a partir da próxima semana | P:actions-B3 | SUPPORTED_CORE | triagem atual (GAP-20) | IG | NA | NA | NA | confirmar | FX B3 |
| 70 · Objetivos ("trocar para 5 km pede um novo plano"), Rotina e equipamentos | Objetivo, equipamento, nova prova | CoachingCore | `restart({intake})` / `GOAL_CHANGE`, `EQUIPMENT_CHANGE` via `submit` | `api.mjs restart`; `custody CONFIRMATION_KINDS` | SUPPORTED_CORE (`restart` exercitado no journey F) | triagem atual | IG | NA | NA | "mudança pendente de envio" = fila | confirmar o novo plano | FX (journey F) |
| 70 · Como o treinador coordena (só leitura), Central de ajuda | Conteúdo estático | app | cópia | — | SUPPORTED_APP_LAYER | — | IG | — | — | — | ler | — |
| 70 · Dados e privacidade: retirar consentimento | Consentimento | CoachingCore | `setConsent({purpose, granted:false})` (revogar sempre passa) | HO §4 | SUPPORTED_CORE | nenhuma | IG | NA | NA | NA | retirar | FX |
| 70 · apagar relatos de saúde | Apagar fatos F08 | CoachingCore | `eraseHealthFacts` | P:actions-F2/F3 | SUPPORTED_CORE (+ SEC-FPV-01, GAP-04) | nenhuma | IG | NA | NA | NA | apagar | FX F2/F3 |
| 70 · exportar dados | Exportação | A | projeção local (CHG-UI-2, opcional) | GAP-31 | UNVERIFIED | — | — | — | — | — | exportar | — |
| 70 · Topo: etiqueta Premium (paga, teste, nenhuma) | Entitlement | StoreKit | `Transaction.currentEntitlements` | GAP-32 | SUPPORTED_IOS | App Store | IG | NA | "sem conexão, acesso mantido" (80) | NA | gerir | StoreKit Testing |
| 70 · Termos, Privacidade, Aviso de saúde | Textos legais e clínicos | app | tabela de cópia `INTERIM` | GAP-05 | SUPPORTED_APP_LAYER (texto provisório) | JUR, G04 | IG | — | — | — | ler | snapshot |
| 70 · Enviar feedback | Feedback | backend | nenhum | GAP-31 | BACKEND_DEPENDENT | rede | — | — | — | — | — | — |
| 71 · Ritmos e esforço (calibrada, detalhe, min/milha, ajustada pelo treino, só esforço, parcial observada, presumida com confiança baixa, contraditórios, retirada após pausa, retida por bloqueio, fora do alcance do modelo) | Faixas de ritmo | CoachingCore | `runCalibration.paceBands[]` (`status`, `confidence`, `confidenceCauses`, `label`, `validUntil`, `reason`); retida = `HOLD_NO_PRESCRIPTION` | P:12; `v1-run-calibration.mjs` | SUPPORTED_CORE (calibrada verificada; demais variantes por `status`/`reason`, não exercitadas) | âncora ou corridas observadas | IG | parcial: só a faixa leve | só esforço | `validUntil` | ver origem | FX 12 + fixtures adicionais (A/C) |
| 71 · Frequência cardíaca (máxima informada, máxima com cinta, laboratório, sem zonas) | Zonas | CoachingCore | `heartRateZones` | GAP-37 | laboratório e cinta SUPPORTED_CORE (entradas fora do §5.1); máxima informada UNSUPPORTED_V1 | cinta ou laboratório | sem zonas | NA | `UNAVAILABLE` | NA | — | FX a criar |
| 71 · Estimativas (estimativa, meta, resultado, recorde, maratona elegível ou não, só 10 km, > 6 h, sem estimativa) | Estimativas | CoachingCore | `estimates[]` (`RANGE_FIRST_CENTRAL_NEVER_ALONE`, `promise:false`), `MARATHON` com `reason` | P:12 | SUPPORTED_CORE | âncora | IG | maratona `UNAVAILABLE` com `reason` | "Ainda sem estimativas" | `validUntil` | — | FX 12 |
| 71 · "Projeção até a prova · Não calculada" | Projeção futura | CoachingCore | `runCalibration.projection` `UNAVAILABLE` (`NO_VALIDATED_PROJECTION_MODEL`) | P:12 | SUPPORTED_CORE (como indisponível) | — | IG | — | EM | — | — | FX 12 |
| 71 · previsão "se seguir o plano" (central 45:45, semana da prova 42:00–50:15) | Previsão da prova | CoachingCore | `runForecast.planScenario` (`PLAUSIBILITY_ENVELOPE`, `conditionalOn: PLAN_FOLLOWED_FROM_NOW`), `observedForecast` (`NOT_ENOUGH_HISTORY`) | P:12 | SUPPORTED_CORE | prova marcada | IG | só cenário do plano | EM | NA | — | FX 12; teste "central nunca sozinho" |
| 71 · Ponto de partida, Teste de campo (oferta, 3 ou 5 km, aquecimento, em andamento, concluído, interrompido, ainda não vale, em vigor, não oferecido) | Teste de campo | CoachingCore | `runCalibration.assessment` + sessão de teste prescrita + relato (`stop.reason`, `tolerated`) | P:12 (`NOT_NEEDED`) | UNVERIFIED (só `NOT_NEEDED` exercitado) | — | IG | interrompido: motivo e tolerância obrigatórios | não oferecido: EM | "vale a partir de seg" = `validFrom` do motor | fazer ou recusar | fixture Rafa (A/C) |
| 71 · Nova prova, editar data, trocar distância (pede plano novo), proposta de nova data | Prova | CoachingCore | `EVENT_DATE_CHANGE` / `GOAL_CHANGE` via `submit`; nova distância = `restart` | `custody CONFIRMATION_KINDS` | SUPPORTED_CORE (não exercitado) | triagem atual | IG | NA | NA | NA | confirmar | FX a criar |
| 71 · Semana da prova, Dia da prova (por esforço), Registrar resultado, 44:21, Próximo passo, Depois da maratona | Prova e resultado | CoachingCore | `raceWeek`, sessão `RACE`, relato, `restart` ao concluir | P:12 | SUPPORTED_CORE | nenhuma | IG | NA | NA | NA | registrar o resultado | FX |
| 72 · Algo mudou? (entrada) | Entrada das adaptações | app | navegação | — | SUPPORTED_APP_LAYER | — | IG | — | — | — | escolher | — |
| 72 · Não estou 100% (condição; sinais um por tela 9/13/15; conferir; nenhum sinal, plano mantido; algum sinal, sem treino; sinal urgente) | F08 Situação 1 | CoachingCore | `notFeeling100({wellbeing: {condition, intent, days, warningSigns}})`; conjunto por condição | P:16, P:actions-D1/D3; GAP-03 | SUPPORTED_CORE | nenhuma | IG | sinal sem resposta = pergunta | NA | NA | responder; procurar atendimento | FX D1/D3/16 |
| 72 · Dor ou lesão · informar | Rota clínica | CoachingCore | `notFeeling100` / `EXERCISE_SUBSTITUTION` com dor / `reportBreak` clínico → `CLINICAL_HUMAN_REQUIRED` | P:actions-A3, E2 | SUPPORTED_CORE | nenhuma | IG | NA | NA | NA | informar | FX A3/E2 |
| 72 · Declaração de prontidão (passos 1–3, por modalidade, 15 sinais, "Padrão / Com mais cautela", força com restrição) | F08 Situação 2 | CoachingCore | `declareReadiness({readiness: {declaredRecovered, warningSigns, sports, returnSpeed}})`; restrições `AVOID_LOWER/UPPER_BODY_STRENGTH` | P:18/19; `v1-f08.mjs:31,42` | SUPPORTED_CORE | nenhuma | IG | "falta uma resposta" = ASK | NA | NA | declarar | FX 18/19 |
| 72 · Declaração enviada (corrida volta, força retida) | Retorno por modalidade | CoachingCore | `sports.STRENGTH.state: HELD` | `views.mjs sportState` | SUPPORTED_CORE | nenhuma | IG | NA | NA | NA | — | FX a criar (corrida sim, força não) |
| 72 · Bloqueio que persiste (cadastro refeito, treino avulso salvo, outro aparelho) | Bloqueio persistente | CoachingCore | hold sobrevive ao `restart` e aos relatos; outro aparelho = backend | P:17; GAP-33 | SUPPORTED_CORE (aparelho único); outro aparelho BACKEND_DEPENDENT | — | IG | NA | NA | NA | declarar prontidão | FX 17 |
| 72 · Mudança maior (viagem 208→118 min; prova antecipada) | Reprogramação | CoachingCore | `UNAVAILABLE_DAY` / `EVENT_DATE_CHANGE` → proposta | P:actions-B1 | SUPPORTED_CORE | triagem atual | IG | NA | NA | NA | confirmar | FX B1 |
| 72 · Pausa (declarar datas e motivo; 14 dias em dois passos; 10 dias retoma doses) | Pausa e retorno | CoachingCore | `reportBreak({interruption: {startDate, endDate, reasonCategory, nonclinical}})`, sempre já terminada | P:actions-E1/E2; GAP-20 | SUPPORTED_CORE | nenhuma | IG | datas incoerentes → ASK | NA | NA | declarar | FX E1 (corrigida) |
| 72 · Revisão da semana 2, Progressão pela regra (agachamento 90→92,5) | Revisão e progressão | CoachingCore | `WEEKLY_REVIEW` → `lastDecision`; próxima carga em `prescription` | P:11/13 | SUPPORTED_CORE | relatos | IG | NA | NA | NA | ver o porquê | FX 11/13 |
| 72 · Sessão parcial (30 de 45 min), Sem registro (longão, "o que aconteceu?") | Relatos de exceção | CoachingCore | `logRun` parcial / `completed:false` | P:10, P:actions-C3 | SUPPORTED_CORE | nenhuma | IG | parcial | sem registro ≠ não feito | NA | contar o que houve | FX |
| 72 · Sinais do relógio (completos, sem relógio, parciais, relato diferente, primeiras noites) | Sinais | HealthKit | nenhum | GAP-17, GAP-35 | FUTURE_INTEGRATION | Apple Watch | "Sem relógio, sem palpite" (`806:3345`) | parciais (`806:3483`) | OC | NA | — | UI |

## 9. Conta e assinatura (80), Sistema (81), Compartilhar (82), Idiomas (83)

| Tela | Componente | Origem | Contrato | Evidência | V1 | Dependências | Sem relógio | Parciais | Ausentes | Atrasados | Ação | Teste |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 80 · Assinar, planos, carregando, indisponíveis; Compra (aguardando, aprovada, cancelada, não concluída, aguardando aprovação); Restaurar; Assinatura (ativa, trocar, gerenciar, cancelada, expirada, carência, suspensa, sem conexão, teste) | Comércio | StoreKit 2 | `Product`, `purchase()`, `Transaction.updates`, `currentEntitlements`, `AppStore.sync()` | GAP-32 | SUPPORTED_IOS | App Store, rede | IG | NA | "planos indisponíveis" | "sem conexão, acesso mantido" | assinar, restaurar, gerir | StoreKit Testing (`.storekit`) |
| 80 · "já assina, usar nesta conta", "assinatura em outra conta do Repmile" | Assinatura × conta | backend | — | GAP-32 | BACKEND_DEPENDENT | — | — | — | — | — | — | — |
| 80 · Hoje sem assinatura; plano pronto sem assinatura; "agora não, o plano fica salvo"; "Plano · faz parte da assinatura" | Gate comercial | StoreKit + app | entitlement decide o alcance; não adota plano nem remove hold (DPC) | DPC "assinatura" | SUPPORTED_IOS | — | IG | NA | NA | NA | assinar | StoreKit Testing |
| 80 · Entrar, criar conta, e-mail, códigos, senha, redefinir, identidade, aparelhos, sair, excluir conta, 8 e-mails | Conta | backend | — | GAP-31 | BACKEND_DEPENDENT ("Excluir conta" local = `eraseAccount` SUPPORTED_CORE) | rede | — | — | — | — | — | fixtures de `AccountService` |
| 81 · Permissões e conexões; Localização (ativa, desligada, primeira corrida, procurando sinal, aproximada) | Localização | CoreLocation | `CLLocationManager` (`whenInUse`, `temporaryFullAccuracy`) | — | SUPPORTED_IOS | permissão | IG | aproximada: ritmo oculto | desligada: corrida por tempo e esforço | NA | abrir Ajustes | UI |
| 81 · Notificações (desligadas, não pedidas, pedido com valor) | Lembretes | UserNotifications | locais | — | SUPPORTED_IOS | permissão | IG | NA | NA | NA | permitir | UI |
| 81 · Apple Saúde (conectado, em parte, não conectado, negado, desligado por você, leitura falhou, atrasada, nada recebido, primeira importação, parar de usar, o que está chegando) | Estado da integração | B | porta `HealthIngestStatus` (CHG-UI-3); negação não observável | GAP-19 | SUPPORTED_HEALTHKIT (negado e em parte → STATE_MAPPING) | permissão | "nada recebido" | "o que está chegando" | "nada recebido" | "leitura atrasada" | conectar, parar de usar (`disabledInApp`) | FX de B |
| 81 · Importado: era o treino do plano?, adicionar dado que faltou, possível duplicata, remover do Repmile | Gestão do importado | B / CoachingCore | vínculo: GAP-14; o que faltou (esforço) = formulário do atleta; duplicata: GAP-15; remover: GAP-13 | GAP-13/14/15 | adicionar o que faltou SUPPORTED_CORE; demais UNVERIFIED ou UNSUPPORTED_V1 | — | NA | — | — | — | adicionar o esforço | FX |
| 81 · Sem conexão (treino aberto), Sessão (em andamento, interrompida, não salva, salva), Erro parcial | Estados do app | A / app | `PendingReports`, gravador | HO §7 | SUPPORTED_APP_LAYER | — | IG | erro parcial: só o bloco falha | NA | NA | tentar de novo | UI |
| 81 · Plano mudou em outro aparelho; não foi possível atualizar | Sincronização | backend | — | GAP-33 | BACKEND_DEPENDENT | — | — | — | — | — | — | — |
| 81 · Mudança não aplicada · a semana continua | Recusa da fronteira | CoachingCore | `ok:false` (`CONFLICT_STALE_VERSION`, `PERSISTENCE_FAILURE`…): nada gravado | P:22 | SUPPORTED_CORE | nenhuma | IG | NA | NA | NA | tentar de novo | FX 22 |
| 81 · Primeira carga · não foi possível carregar a conta | Falha no início | A | `RECORD_LOST`, `INTEGRITY_FAILURE`, `SYNTHETIC_ONLY` | HO §6.1, §7; GAP-01 | SUPPORTED_CORE | — | IG | NA | NA | NA | tela de perda do registro (`acknowledgeRecordLoss`) | FX (A) |
| 81 · Atualização necessária | Versão e repertório | A | R7-B0 (GAP-21) | GAP-21 | SUPPORTED_CORE (R7-B0) / BACKEND (versão) | — | IG | — | — | — | atualizar | relógio após 2027-04-30 |
| 81 · Splash | Abertura | app | — | — | SUPPORTED_APP_LAYER | — | — | — | — | — | — | UI |
| 82 · Artes 1–9 (rota, sem rota, evolução, prova, força, recorde, constância, sem fundo, só duração) e fluxo de compartilhar (prévia, o que entra, privacidade da rota, erro, concluído, cancelado) | Shareables | registro + app | dados do registro (GAP-06), rota (GAP-29), nunca FC, esforço, sinais ou tonelagem (o próprio 82) | GAP-27/28/29 | SUPPORTED_APP_LAYER (dependências citadas) | `UIActivityViewController` | IG | "dados insuficientes, registrado à mão": Arte 9 | sem rota: Arte 2 | NA | compartilhar ou cancelar | UI + prévia exata |
| 83 · EN (milhas), ES, texto grande +30%, stress (nomes longos, números extremos, 10 e 2 sessões, maratona de 24 semanas) | Localização e acessibilidade | app | cópia por código (GAP-24); unidades | — | SUPPORTED_APP_LAYER (página "A aprovar") | — | IG | NA | NA | NA | — | snapshot por idioma e Dynamic Type |
| 91 · Motion (cascata de 3 s, tabela de tempos) | Motion | app | — | Figma 91 | SUPPORTED_APP_LAYER; "Reduzir movimento" **não desenhado** | — | — | — | — | — | — | UI com Reduce Motion |

---

## Totais

Contados por script sobre a coluna "V1" deste arquivo. Uma linha com duas classes conta nas duas; uma linha só registra a remoção de "Zonas de FC" em 31.

| Classe | Linhas |
|---|---|
| SUPPORTED_CORE | 85 |
| SUPPORTED_IOS | 11 |
| SUPPORTED_HEALTHKIT | 6 |
| SUPPORTED_MANUAL | 4 |
| SUPPORTED_APP_LAYER | 20 |
| BACKEND_DEPENDENT | 6 |
| FUTURE_INTEGRATION | 6 |
| UNVERIFIED | 21 |
| UNSUPPORTED_V1 | 14 |

**Componentes e capacidades examinados:** 154 linhas sobre as 588 telas de fluxo.

**Linhas UNVERIFIED que dependem só da projeção CHG-UI-2 de A** (sem decisão nova): 9.
- histórico rico;
- "Anterior";
- fases;
- evolução;
- volume;
- totais longitudinais;
- marcos de força;
- pé do treino;
- exportar.

**Linhas UNVERIFIED que pedem prova nova:**
- força avulsa;
- adicionar exercício;
- teste de campo;
- vínculo pelo atleta;
- "mais pesadas".
