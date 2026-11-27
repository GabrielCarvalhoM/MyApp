# Rules for specs/v1/FIGMA_MATRIX.md: one entry per primary Figma frame (node id) -> (class, SwiftUI, contracts, divergences, conflict).
# Classes: M=MATCH (unused), P=PARTIAL, X=MISMATCH, N=NOT_IMPLEMENTED. App-only rows are in APP_ONLY (NO_FIGMA_REFERENCE).
# Paths are relative to ios/Packages/RepMileUI/Sources/RepMileUI/ on origin/claude/v1-ios-swiftui (856cdf00) unless stated.

P, X, N = "PARTIAL", "MISMATCH", "NOT_IMPLEMENTED"

# --- SwiftUI shorthands
def OB(step): return f"`OnboardingStepView` `.{step}` em `OnboardingFlow` (`OnboardingViewModel`)"
OBF = "`OnboardingFlow` (fase `.building`/`.outcome`)"
TODAY = "`Features/Today/TodayView.swift` + `TodayContent`, `WeekPanels`"
PLAN = "`Features/Plan/PlanScreen.swift` (`WeekSummary`, `DoubleLaneRing`, `DayRow`)"
MONTH = "`PlanScreen` · `MonthGrid` (`PlanMonth.swift`)"
PHASES = "`PlanScreen` · `PhasesChart` (`PlanPhases.swift`)"
UNAV = "`Features/Plan/UnavailableDaySheet.swift` · `UnavailableDayViewModel`"
SRUN = "`Features/Session/SessionDetailView.swift` + `SessionRunDetail`"
SSTR = "`SessionDetailView` + `SessionStrengthDetail`"
RUN = "`Features/Run/RunSessionScreen.swift` (`RunRecorder`)"
REP = "`Features/Run/RunReportView.swift` · `RunReportViewModel`"
STR = "`Features/Run/StrengthLogView.swift` · `StrengthLogViewModel`"
HIST = "`Features/History/HistoryScreen.swift`"
HDET = "`Features/History/HistoryDetail.swift` · `HistoryCorrectionViewModel`"
PROG = "`Features/Progress/ProgressScreen.swift`"
PROF = "`Features/Profile/Presentation/Views/ProfileScreen.swift` · `ProfileViewModel`"
HRZ = "`Features/Profile/Presentation/Views/HeartRateZonesScreen.swift` + `HeartRateProfileEditor` · `HeartRateZonesViewModel`"
NF = "`Features/Adapt/Presentation/Views/NotFeeling100Flow.swift` · `NotFeeling100ViewModel`"
RD = "`Features/Adapt/Presentation/Views/ReadinessFlow.swift` · `ReadinessViewModel`"
CHG = "`Features/Adapt/ActionSheets.swift` · `ChangesSheet`"
ADD = "`ActionSheets.swift` · `AddWorkoutSheet`"
STATE = "`Features/States/StateScreen.swift` (`RootRoute`)"
LOAD = "`StateScreen.swift` · `LoadingSkeleton`"
LAUNCH = "`App/RepMileLaunchScreen.swift` (integração: `ios/App/Composition/Launch.swift`, `LiveRoot.swift`)"
BANNER = "`TodayView` · `StateBanner` (`TodayContent.banners`)"
URG = "`Adapt/Presentation/Views/UrgentCareBanner.swift` em `TodayView`"
NONE = "— (nenhuma tela)"

# --- contract shorthands
C_ONB = "`CoachingWriting.onboard(OnboardingAnswers, Consents)` → `BoundaryAnswer.planOutcome`"
C_PLAN = "`CoachingReading.plan(week:)` (`PlanView`: `today`, `week.sessions`, `state`, `hold`), `allWeeks()`, `weekPlan()`, `loggedEntries()`, `startability(sessionId:)`"
C_TODAY = C_PLAN + ", `presentation()` (`readings.runCalibration`, `runForecast`), `pendingReports()`"
C_SESS = "`PresentationSnapshot.runSession(for:)` (etapas, esforço, ritmo), `PlannedSession.prescription`, `startability(sessionId:)`"
C_SSTR = "`PlannedSession.prescription.exercises` (séries, reps, RIR, descanso, `load` sem número sugerido), `loggedEntries()` (\"Anterior\")"
C_RUNREC = "`RunRecorder` (tempo, etapas de `runSession(for:)`, GPS local nunca enviado), `AppModel.runSafetyGate`"
C_REP = "`CoachingWriting.submit(ReviewRequest.sessionReports([AthleteObservation]))` (`PlannedRunActual`/`UnplannedRunActual`: completed, minutes, rpe, stop; `SessionResponse`), `EligibilityScreen`, `WriteOutcome.kept`"
C_STR = "`submit(sessionReports)` com `StrengthActual` (`LoggedSetEntry` reps, load KG, `rir` não enviado), `EligibilityScreen`, `WriteOutcome.kept`"
C_HIST = "`CoachingReading.loggedEntries()` (`LoggedEntry`: channels/voices, distances measured/declared/contested, `unplannedMerge`), `HealthIngestStatusSource.status()`"
C_CORR = "`submit(sessionReports)` com `correctionOf` + `actual.declared` (`ContestedDistance`), `EligibilityScreen`"
C_PROG = "`presentation().readings` (`runCalibration.estimates`, `runForecast`), `weekPlan()`, `loggedEntries()`"
C_HR = "`presentation().heartRateFiveZones` (`HeartRateFiveZones`), `setHeartRateProfile(_:)`, `eraseHeartRateProfile()`"
C_NF = "`warningSignSet(condition:)`, `submit(ReviewRequest.notFeeling100(WellbeingDeclaration))`, `EligibilityScreen`, `PlanView.hold.guidance`"
C_RD = "`warningSignSet(condition: READINESS)`, `submit(ReviewRequest.readiness(ReadinessDeclaration))`, `EligibilityScreen`"
C_UNAV = "`submit(ReviewRequest.unavailableDays)`, `presentation().pending`, `accept(decisionId:)` (`decline` não usado), `EligibilityScreen`"
C_PROF = "`setConsent(_:granted:)`, `eraseHealthFacts(eventIds:)`, `eraseAccount()`"
C_STATE = "`RootRoute.from(plan:)` (`BoundaryError.code`, `PlanView.state`)"
C_NO = "nenhum contrato no front C"
C_ACC = "nenhum (backend #28 inexistente)"
C_SUB = "nenhum (F13 não iniciado; StoreKit não integrado)"

FUT = "Frame `[FUTURO · fora da V1]`: a V1 não mostra; o addendum pede componente completo e oculto (`Availability.unsupported`), que não existe no app."

R = {}
def r(ids, cls, view, contracts, div, conflict=None):
    for i in ids.split():
        R[i] = (cls, view, contracts, div, conflict)

# ============ 10 · Onboarding (#101)
r("835:2069", X, OB("welcome"), C_NO,
  "Revisão #99: arte \"caderno\" no lugar da faixa da semana (pílulas tracejadas); sem wordmark REPMILE; título app \"Corrida e força num plano só.\" × Figma \"Corrida e força na mesma semana\"; corpo diferente (Figma: \"Algumas perguntas rápidas e o treinador monta o seu plano. Só o iPhone basta para começar.\"); botão \"Começar\" com chevron (Figma sem, 52 pt). \"Já tenho conta\" ausente: retenção documentada no #99 como \"diferença aceita\", **sem aprovação do fundador → pendente, não APPROVED_DEVIATION**.")
r("835:2114", N, NONE, "`OnboardingAnswers.athlete.goals` (sempre corrida **e** força)",
  "Pergunta \"O que você quer treinar?\" (Corrida e força / Só corrida / Só força) não existe; o app manda sempre os dois objetivos.",
  "O intake não tem campo de modalidades; o Figma tem plano só de força (20 `576:2773`, 30 `593:2974`) e só corrida. Como o motor recebe \"só força\"/\"só corrida\"?")
r("835:2188 838:853", X, OB("goals"), "`goals.run.kind` (RACE/PERFORMANCE/REGULAR/GENERAL), `goals.run.event.kind`",
  "App junta 03 + 04 + 06 numa tela (`.goals`); pergunta \"O que você quer da corrida?\" × \"O que você busca na corrida?\"; opções em lista (\"Correr uma prova\", \"Correr mais rápido\", \"Correr com regularidade\", \"Saúde e bem-estar\") × cartões \"Uma prova\" (com 5 km/10 km/meia/maratona) e \"Sem prova\" (Começar a correr, Regularidade…); sem cabeçalho \"Etapa 1 de 4 · Objetivo\" (app: \"Passo n de 8\" + barra).",
  "\"Começar a correr\" (Figma) não tem código próprio em `RunGoal.kind`; mapeamento pendente.")
r("835:2245 838:913", X, OB("goals") + " · `EventDateSheet`", "`goals.run.event.date`",
  "Data escolhida numa folha de calendário (\"Escolher\" → \"Usar esta data\") × seletor em roda dia/mês/ano na própria tela; sem a linha de semanas até a prova.")
r("838:3864", X, OBF + " `.outcome(.invalidInput)`", C_ONB + " (`INVALID_INPUT`, `event.withinHorizon`)",
  "Figma avisa na própria tela (prova além de 16 semanas); o app só descobre depois do envio e mostra a tela genérica \"Algumas respostas não combinam entre si\".",
  "O limite de 16 semanas é do motor; validar antes do envio pede o limite no Swift (regra esportiva fora do motor) ou um contrato de horizonte.")
r("835:2301", N, NONE, "`GoalEvent` (só `kind` e `date`)", "Pergunta opcional \"Tem um tempo em mente?\" ausente.",
  "Não há campo de meta de tempo em `GoalEvent`; o Figma mostra \"meta 44:30\" em Hoje, Progresso e Prova.")
r("835:2349", X, OB("goals"), "`goals.strength`",
  "Pergunta \"E da força?\" dentro de `.goals`; 5 opções (inclui \"Força para correr melhor\", ausente no Figma) × 4 (Hipertrofia, Força, Geral, Manutenção) com a linha explicativa por opção.")
r("835:2400", N, NONE, "—", "Pergunta \"Quando a semana apertar, quem vem primeiro?\" ausente.",
  "Não há campo de prioridade corrida/força no intake; o Perfil (70) também mostra \"Foco do treino · Corrida primeiro\".")
r("835:2475", N, NONE, "`OnboardingAnswers.weeks`, `startDate`",
  "Respiro \"Objetivo · etapa 1 de 4 concluída\" com a linha de semanas até a prova ausente; o app pergunta \"Duração do plano\" (4/8/12/16) em `.schedule`.",
  "O Figma deriva a duração da data da prova (\"8 semanas até os seus 10 km\"); o contrato exige `weeks` ∈ {4, 8, 12, 16} escolhido. Sem prova (Rafa, 12 semanas), quem escolhe?")
r("862:2271", X, OB("schedule"), "`schedule.runDays`, `strengthDays`, `runTurn`, `strengthTurn`",
  "App: uma tela \"Sua semana\" com chips de dias por modalidade, dia do longão, três steppers de minutos, turno por modalidade e duração do plano. Figma: uma pergunta por tela; dias com corrida/força no mesmo dia; turno Manhã/Tarde/Noite.",
  "Turno por dia e \"Tarde\" não existem no contrato (`runTurn`/`strengthTurn` globais, AM/PM).")
r("862:2544", N, NONE, "`runTurn`/`strengthTurn`", "Folha de turno por dia ausente.", "Turno por dia não existe no contrato.")
r("836:390", X, OB("schedule"), "`schedule.longRunDay`", "Dia do longão é uma fileira de chips dentro de \"Sua semana\" × tela própria \"Qual é o dia da corrida mais longa?\".")
r("836:546", X, OB("schedule"), "`schedule.runMinutes`, `longRunMinutes`, `strengthMinutes`", "Três steppers dentro de \"Sua semana\" × tela \"Quanto tempo cabe em cada treino?\" com valores grandes por modalidade.")
r("836:624", N, NONE, "`athlete.equipment` ([String])",
  "Presets \"Academia completa / Academia do prédio / Em casa / Só peso do corpo\" e a linha \"O plano conta com barra, rack…\" ausentes; no lugar há a tela inventada \"O que você tem para treinar força?\".",
  "Mapeamento preset → lista `equipment` não definido (ex.: o que \"Academia do prédio\" implica).")
r("867:2289", N, NONE, "`athlete.equipment`",
  "Revelação progressiva \"O que tem lá?\" sob o preset ausente; o app mostra 8 chips soltos (Halteres, Banco, Barra, Rack, Kettlebell, Máquinas, Elásticos, Barra fixa) sem o preset.")
r("836:741", N, NONE, "—", "Pergunta \"Onde você corre?\" (Rua, Esteira, Pista, Trilha) ausente.",
  "Sem campo no intake; esteira/pista só existem como `measurement` de âncora e relato.")
r("836:782", N, NONE, "—", "Pergunta \"Na corrida, você usa\" (Só o iPhone, Relógio, Cinta) ausente.",
  "Sem campo no intake; sensor só em `PerformanceAnchor.heartRate.sensor`.")
r("836:830", N, NONE, "`ReviewRequest.coach(profile:)` (só depois do cadastro)", "Pergunta \"Que treinador combina com você?\" (Conservador/Equilibrado/Exigente) ausente.",
  "O intake não tem perfil de treinador; o contrato tem `coach(profile:)` como revisão pós-cadastro. Enviar logo após `onboard` ou acrescentar ao intake?")
r("836:882", N, NONE, "—", "Respiro \"Rotina · etapa 2 de 4 concluída\" (resumo da semana) ausente.")
r("836:2567", N, NONE, "— (nome não existe em `AthleteIntake`)", "Pergunta \"Como podemos te chamar?\" ausente; o nome mostrado no app (iniciais \"LA\") vem fixo da composição de fixtures (`RepMileShell(scenario:)`, `athleteName: \"Lucas Andrade\"`).",
  "Nome sem campo no contrato: precisa de armazenamento local e regra de privacidade.")
r("836:2603", X, OB("age"), "`athlete.ageYears`",
  "Campo de texto numérico × roda de valores; título \"Quantos anos você tem?\" × \"Qual é a sua idade?\"; nota \"De 18 a 80 anos nesta versão.\" × \"Serve para ajustar o plano. Nesta versão, de 18…\".")
r("838:3819", X, OBF + " `.outcome`", C_ONB,
  "Figma avisa na tela de idade; o app só reage ao resultado do motor, e a copy de \"Plano indisponível\" (`ob.outsideScope.body.interim`) fala só de gestação e parto.",
  "Faixa 18–80 é regra do motor; aviso antes do envio pede a regra no Swift ou um contrato.")
r("836:2649", N, NONE, "— (sem campo)", "Tela \"Altura e peso\" (opcionais) ausente; o fundador decidiu (27/11) que fica na V1.",
  "Sem campo no contrato e sem uso esportivo: precisa de armazenamento local, unidades, edição e privacidade definidos (PRODUCT_SCOPE §4).")
r("836:2791", N, NONE, "`IntegrationContracts` / HealthKit (front B): autorização", "Tela \"Quer usar seus dados do Apple Saúde?\" com a lista do que é lido ausente.",
  "O Figma pré-preenche 21 e 25 com as últimas 4 semanas do Apple Saúde; não há contrato que leve dados do HealthKit para `RecentTraining`.")
r("836:2872 838:969", X, OB("experience"), "`athlete.recent` (runDaysPerWeek, runMinutesPerWeek, longestRunMinutes)",
  "Steppers dentro de \"Sua experiência\" × tela \"Suas corridas nas últimas 4 semanas\" com 3 valores grandes; sem a variante pré-preenchida \"Vieram do Apple Saúde\".")
r("838:1045", N, NONE, "`runTrainingMonths`, `recent`", "Pergunta \"Você já correu antes?\" (Nunca corri / Já corri e parei / Corro hoje) ausente.",
  "As categorias não têm valor de contrato definido (meses, recent) sem inventar número.")
r("838:1093", N, NONE, "`recent.runDaysPerWeek`", "Pergunta de dias de corrida recente (Nenhum / 1 / 2 / 3 ou mais) ausente.",
  "\"3 ou mais\" não é um inteiro; mapeamento pendente.")
r("836:2948", X, OB("experience"), "`athlete.runTrainingMonths` (Int)",
  "Stepper de meses × 3 faixas (Menos de 6 meses / 6 meses a 2 anos / Mais de 2 anos).", "Faixa → número de meses sem regra definida.")
r("836:2994 838:1143", X, OB("anchor"), "`athlete.performanceAnchors[]` (`PerformanceAnchor`)",
  "Toggle \"Tenho um resultado\" + chips + texto mm:ss + DatePicker × distância em chips, tempo em roda e a opção explícita \"Não tenho resultado recente\" com a linha sobre esforço.")
r("836:3049", N, NONE, "`PerformanceAnchor.kind`, `measurement`, `rpe`",
  "Tela \"Como foi esse 5 km?\" (quando, como foi medido: prova oficial/pista/teste, esforço) ausente; o app envia sempre `kind = RACE_RESULT` e `measurement = GPS` sem perguntar (valor não informado pelo atleta).")
r("836:3128 838:1187", X, OB("experience"), "`athlete.strengthTrainingMonths`, `recent.strengthDaysPerWeek`",
  "Steppers × 4 faixas (Nunca treinei … Mais de 2 anos) + dias por semana do Apple Saúde.", "Faixa → meses sem regra; pré-preenchimento do Apple Saúde sem contrato.")
r("838:1239", N, NONE, "`athlete.pause` (`IntakePause`: reasonCategory, nonclinical, weeks)",
  "Pergunta \"Por que você parou?\" (retomada) ausente; o app nunca envia `pause`.",
  "Motivos \"Doença\"/\"Lesão\" tornam a pausa clínica (`nonclinical=false`): roteamento a confirmar com SSCTR.")
r("836:3194", N, NONE, "— (sem campo)", "Tela \"Quais cargas você já conhece?\" ausente.",
  "O intake não tem cargas conhecidas de força (só âncoras de corrida); o Figma promete \"Suas cargas viram o ponto de partida\" (`838:1643`).")
r("836:3299 838:3616", X, OB("care") + " + `EligibilityForm` (`SafetyComponents.swift`)", "`athlete.specialPopulation`, `athlete.eligibility` (`EligibilityScreen`, 6 flags + `NONCLINICAL_CONFIRMED`)",
  "Figma: uma lista \"Algum destes vale para você hoje?\" com 7 itens marcáveis + \"Nenhum destes\". App: título \"Cuidados\", 3 opções (Gestação atual / Parto nos últimos 12 meses / Nenhum destes) e, abaixo, o formulário Sim/Não de 6 itens + \"Confirmo…\".",
  "Figma tem um item só \"Gestação atual ou parto nos últimos 12 meses\"; o contrato distingue `PREGNANCY` e `POSTPARTUM`. \"Nenhum destes\" valer como resposta explícita \"não\" a cada flag (nil ≠ false) precisa de decisão SSCTR.")
r("838:4148", N, NONE, "`EligibilityScreen`", "Folha \"confirmar a resposta\" ausente.")
r("836:3372", N, NONE, "—", "Respiro \"O plano parte do que você já faz\" ausente.")
r("837:999", X, OB("consents"), "`Consents` (coaching, healthSignals, learning)",
  "App: \"Seus consentimentos\" com Sim/Não por item. Figma: \"Como seus dados são usados\", alternadores e Treino marcado \"Necessário\"; textos diferentes.",
  "Figma trata Treino como necessário; o app permite \"Não\". O que acontece com `coaching=false`?")
r("837:1059", X, OBF + " `.building` · `PlanBuildingMark`", C_ONB,
  "App: marca animada + \"Montando o seu plano\" / \"Encaixando corrida e força nos seus dias.\". Figma: arte da semana, cabeçalho \"Etapa 4 de 4\" e lista de itens (Objetivo, …).")
r("837:1144", X, OBF + " `.outcome(.planCreated)`", C_ONB + "; depois `plan(week:)`, `weekPlan()`",
  "App: ícone check + \"Seu plano está pronto.\" + \"Ver o plano\". Figma: prévia com \"8 semanas até os 10 km, Lucas\", datas, fases e a semana.")
r("838:1296 838:1387 838:1478 838:1568 838:1643", N, OBF + " (um resultado genérico)", C_ONB + "; `weekPlan()`",
  "Variantes da prévia (começando do zero, só esforço, maratona com critérios, plano preparatório, corrida do zero + força experiente) não existem.",
  "\"Bloco de maratona · 6 de 6 critérios\" e \"Já atendidos · 2 de 6\" pedem os critérios de elegibilidade da maratona; o contrato não os expõe.")
r("837:1323", N, NONE, C_ACC, "Folha \"Salvar o plano\" (conta) ausente; o fundador decidiu (27/11) que entra; sem backend, nada pode simular conta remota.")
r("851:9600", N, NONE, C_SUB, "Tela \"Assinar · 7 dias grátis\" ausente; fundador (27/11): a UI entra, sem cobrança real e sem prometer oferta não aprovada.")
r("837:1239", N, NONE, "`plan(week:)`", "Tela \"Primeira semana\" com \"Três decisões do treinador\" ausente; o app vai direto para Hoje.",
  "As três decisões pedem motivos que o app só pode mostrar por copy por código (o texto inglês do motor nunca chega à tela).")
r("838:3689", X, OBF + " `.outcome(.clinicalHumanRequired)`", C_ONB,
  "App: ícone pausa + \"Antes, uma avaliação profissional\" (INTERIM). Figma: arte da semana, rótulo \"Retido por segurança\", \"Por enquanto, sem treinos prescritos\".")
r("838:3756", N, NONE, "`CoachingWriting.restart(_:)` (não usado)", "Não há fluxo de refazer o cadastro no app; o estado \"refazer o cadastro não libera\" não existe.")
r("838:4219", N, NONE, "—", "Folha \"Sair do cadastro\" ausente (o app não tem saída do cadastro).")
r("838:3918", N, NONE, "— (sem persistência de rascunho)", "\"Continue de onde parou\" ausente: as respostas não são salvas no iPhone.")
r("838:3972", X, OBF + " `.outcome(.failed)`", C_ONB,
  "App: \"Não deu certo agora\" + \"Tentar de novo\" (volta ao formulário). Figma: \"Não deu para montar agora\", \"Tentar de novo\" e \"Revisar respostas\".")
r("838:4011", X, OBF + " `.outcome(.needsInput)`", C_ONB + " (ASK)",
  "App: texto genérico \"Falta uma resposta para montar o plano…\" + Voltar. Figma: a própria pergunta que falta, com opções, e \"Montar meu plano\".",
  "Renderizar a pergunta pede o campo do ASK e as opções; o `BoundaryAnswer` só traz `error.fields` (o próprio código registra que `errors` não é decodificado).")
r("838:4053", X, OBF + " `.outcome(.outsideV1Scope)`", C_ONB + " (`OUTSIDE_V1_SCOPE`)",
  "App: cadeado + \"Plano indisponível\" / \"Sinal informado no cadastro\" + \"Revisar minhas respostas\". Figma: arte da semana, \"Esta versão ainda não monta um plano para você\", texto que cobre também idade fora de 18–80.")
r("1103:2299", N, BANNER + " (`.outsideV1Scope`)", "`Startability.notStartable(.outsideV1Scope)` persistente",
  "Sem fluxo de refazer o cadastro, a tela \"Esta versão não segue com o seu plano\" não existe; Hoje mostra só o banner \"Plano indisponível\" (sem \"Começar\").")

# ============ 20 · Hoje (#99)
TD_V1 = "Sono/VFC/clima omitidos (notInV1, sem WeatherKit)."
r("880:4257", X, TODAY, C_TODAY,
  "Revisão #99 (NOT_READY): H1 brilho cortado em linha reta (~y 252 pt); H2 tab bar flutua sobre o conteúdo e corta o card Prova (XXXL esconde \"Ver o treino\"); H3 faixa da semana não escala com Dynamic Type; anel do avatar < 44 pt. Por código: hero \"Hoje são dois.\" + frase-modelo × frase do treinador; sem \"Por que nessa ordem?\"; sem \"meta 44:30\" no card Prova; sem o cartão \"3ª semana seguida no plano\"; slot de clima omitido.",
  "O frame V1 ainda mostra clima (\"Sol entre nuvens 19°\") sem fonte; \"meta\" sem campo; sequência de semanas é regra de gamificação pendente (F14); a frase do treinador não vem do motor.")
r("880:4841", N, NONE, "— (sono fora da V1, #24)", "Variante \"só o sono chegou\" não existe; sono não é lido.",
  "O frame está numa fileira V1 sem tag, mas PRODUCT_SCOPE §2 põe sono/VFC fora da V1 (#24).")
for i, t in [("508:69", "\"Hoje são dois.\" × \"Força feita. Falta a corrida leve, à noite.\"; linha \"A ordem de hoje é força primeiro…\" ausente."),
             ("572:203", "Gêmeo de `880:4257` com sono/VFC; mesmas diferenças de hero e \"Por que nessa ordem?\"."),
             ("572:432", "\"Dia concluído.\" × \"Dia completo. Força e corrida feitas.\"; resumo do dia ausente."),
             ("572:675", "\"Hoje é dia de treino.\" × \"Hoje é o limiar. Três blocos fortes, à noite.\"; sem \"treino-chave\"."),
             ("572:909", "\"Hoje é dia de treino.\" × \"Semana nova. Inferior cedo, com agachamento a 92,5…\"."),
             ("572:1146", "\"Hoje é descanso.\" + próximo treino ✓; segunda frase do Figma (\"Faz parte do plano…\") ausente."),
             ("576:2102", "Mensagem \"Semana 3 fechada, completa\" ausente; o dia renderiza normal."),
             ("576:2363", "\"antes da semana 1\" e \"Seu plano começa…\" ✓; resumo da primeira semana ausente."),
             ("576:2580", "Cabeçalho \"bloco 2, semana 3\" × \"semana x de y\"; card Prova some ✓."),
             ("576:1288", "Card Prova e trilha de fases ✓; hero sem a narrativa de semana de prova.")]:
    r(i, P, TODAY, C_TODAY, t + " " + TD_V1)
r("576:2773", P, TODAY, C_TODAY, "Plano só de força depende da pergunta 02, que não existe; hero e cartões renderizam força. " + TD_V1,
  "Ver `835:2114`: sem campo de modalidades.")
r("572:1379", N, NONE, "—", FUT)
r("575:701", X, TODAY + " (`TodayContent.Mark.status`)", C_TODAY,
  "Sessão parcial (`completed=false` com minutos) aparece como \"Não feito\"; o Figma diz \"Corrida pela metade. Vale o que foi feito.\".")
r("575:942", N, NONE, "`ReviewRequest.missedSession` (existe, não usado)", "Pergunta \"você fez a corrida leve de ontem?\" ausente.")
r("575:1172", N, NONE, "`ReviewRequest.wellbeingCheck` (existe, não usado)", "Pergunta rápida antes do treino ausente (GAP-11; \"Mais pesadas\" `UNVERIFIED`).")
r("575:1424", N, NONE, "`HealthIngestStatusSource.status()`", "Aviso \"Sem dados do Apple Watch desde segunda\" ausente em Hoje.")
r("575:1671", X, BANNER + " (`.state(.pendingConfirmation)`)", "`PlanView.state`, `presentation().pending`, `accept`/`decline`",
  "Banner genérico \"Uma mudança aguarda você / Ver a proposta\" que abre \"Algo mudou na sua semana?\", não a proposta; Figma mostra a sugestão no hero e o cartão \"Sugestão · aguarda você\".")
r("575:1924", X, TODAY, C_TODAY, "Avulsa registrada não aparece no dia de descanso de Hoje (só no Histórico).")
r("575:2151", X, "`WeekPanels` (toque abre o treino)", C_TODAY, "Tocar num painel abre o treino; o Figma foca o dia escolhido em Hoje com \"Voltar para hoje\".")
r("576:1524", P, TODAY, C_TODAY, "Sessão de prova renderiza como treino; hero \"Hoje é a prova. Largada às 7h\" ausente.",
  "Hora da largada não está no contrato (`GoalEvent` só tem data).")
r("576:1737", N, NONE, "—", "Resultado de prova registrado (tempo, \"recorde pessoal\", diferença para a meta) ausente.",
  "Registro de resultado de prova pós-cadastro é `UNSUPPORTED_V1`; meta e recorde sem regra/contrato.")
r("576:1912", N, NONE, "`ReviewRequest.reportBreak(BreakReport)` (existe, não usado)", "\"Bom te ver de novo\" com motivo da pausa ausente; o banner \"De volta, com calma\" é outra coisa (depois da prontidão).")
r("576:2960", X, TODAY + " (`today.pending.reports`)", "`pendingReports()`", "Linha \"N registros ainda não enviados\" × faixa \"Sem conexão\" no topo.")
r("577:2000", P, LOAD, C_STATE, "Esqueleto genérico da raiz, sem a forma de Hoje (painéis, cartões).")
r("577:2074", X, STATE + " `.operationalError`", C_STATE,
  "Tela cheia \"Não deu certo agora\" sem abas × Hoje com \"Não deu para carregar o dia\", última atualização, \"Ver o plano salvo neste aparelho\".")
r("577:2163", X, STATE + " `.onboarding`", C_STATE, "\"Vamos montar seu plano / Começar o cadastro\" × \"Falta pouco… Paramos na parte 2 de 4\" com o resumo do que já se sabe.",
  "Retomar exige rascunho persistido (não existe).")
r("544:1797", X, ADD, "`AppModel.unplannedRunGate`",
  "Folha com \"Começar uma corrida agora\" e \"Registrar um treino já feito · Força\"; registrar corrida feita não é oferecido; layout e copy do Figma não verificados.")

# ============ 30 · Plano (#102)
r("509:115", P, PLAN, C_PLAN,
  "Estrutura do frame (segmentos, semana/fase, anel, corrida/força, tempo, dia a dia, dica, fases) ✓. Ausentes: selo \"Chave\", \"hoje soma 45 min\", cargas na linha do dia quando o motor as dá. Registro #14 sem captura (NO_ROUTE).")
r("592:109", X, PLAN, C_PLAN, "Estados parcial, movida e avulsa da linha do dia não existem (só feito/não feito/previsto).")
r("592:480 592:820 592:1176 592:1534 592:1873", P, PLAN, C_PLAN, "Semana renderiza com o mesmo componente; rótulos de estado da semana (provisória, fechada, prova) não conferidos com o frame.")
r("593:2431 593:2702", P, PLAN, C_PLAN, "Mesmo componente com outro perfil; não conferido com o frame.")
r("593:2974", P, PLAN, C_PLAN, "Plano só de força depende da pergunta 02 (ausente).", "Ver `835:2114`.")
r("596:1403", P, MONTH, C_PLAN, "Grade de mês com marcas ✓; cabeçalho e navegação do frame não conferidos.")
r("596:1812", X, MONTH, C_PLAN, "Não há navegação entre meses; o app mostra todas as semanas numa grade.")
r("596:2125", P, PHASES, "`weekPlan()`", "Barras espelhadas corrida/força e legenda \"Cheio é feito, suave é previsto.\" ✓; rótulos de fase sob as semanas a conferir.")
r("593:689", X, "`DayRow` (toque longo) → " + UNAV, C_UNAV,
  "Toque e segure abre \"Não posso neste dia\"; não há arrastar o treino para outro dia.",
  "O frame mostra o atleta arrastando para sexta (destino escolhido); a regra GAP-09 diz que o motor propõe e a UI nunca escolhe destino. O visual de arraste precisa de decisão.")
r("597:1909", X, UNAV, C_UNAV, "A proposta mostra só as corridas; o que muda na força não aparece.", "Diff de força da proposta não exposto (GAP-08, `pendingWeek` de A).")
r("597:2228", N, NONE, "—", "\"Mudar a agenda · o que mudou\" ausente.")
r("597:2556", X, UNAV, C_UNAV, "O app parte de um treino (\"Não posso neste dia\"), não de escolher o dia indisponível.")
r("597:1542", P, UNAV, C_UNAV, "Proposta + \"Confirmar a mudança\"/\"Decidir depois\" ✓; formulário de elegibilidade dentro da folha não está no frame.",
  "O motor exige `EligibilityScreen` atual nesta revisão (#72); o Figma não tem esse bloco.")
r("593:1025", X, BANNER, "`PlanView.state = pendingConfirmation`", "A semana do Plano não mostra a proposta pendente; só o banner de Hoje.")
r("593:1385", P, UNAV, C_UNAV, "\"Plano atualizado.\" ✓ dentro da folha; a semana atualizada não é mostrada como no frame.")
r("593:1729", N, NONE, "`CoachingWriting.decline(decisionId:)` (existe, não usado)", "Recusar a proposta não existe (\"Decidir depois\" só fecha).")
r("597:1642", N, NONE, "`ReviewRequest.missedSession`", "Oferta do treinador após longão não feito ausente.")
r("597:2854 597:1722", N, NONE, "— (`Changes` só tem `unavailableDates` e `coaching`)", "Trocar dias de treino a partir de uma semana ausente.",
  "Não há revisão de agenda no contrato; só `restart` (plano novo).")
r("597:1836", N, NONE, "—", "Proposta substituída pela revisão da semana ausente.")
r("598:2040", N, NONE, "`CoachingReading.history()`, `decision(id:)` (existem, não renderizados)", "Registro \"Mudanças no plano\" ausente.")
r("598:2161", N, NONE, "`ReviewRequest.preferences`, `coach(profile:)` (existem, não usados)", "\"Ajustes do plano\" ausente.")
r("593:2077", N, NONE, "—", "\"Versão salva, sem conexão\" ausente no Plano.")
r("598:2290", P, LOAD, C_STATE, "Só o esqueleto da raiz; a aba Plano não tem estado de carregamento próprio.")
r("598:2384", N, NONE, "—", "\"Plano sendo gerado\" na aba Plano ausente (só no cadastro).")
r("598:2467", X, STATE + " `.onboarding`", C_STATE, "Tela cheia sem abas × estado dentro da aba Plano.")
r("598:2533", X, STATE + " `.integrityFailure`", C_STATE, "Tela cheia \"Não conseguimos confirmar seu registro\" sem abas × estado dentro da aba Plano.")
r("598:2601", X, BANNER + " (`.state(.needsInput)`)", "`PlanView.state = needsInput`", "Banner em Hoje que abre \"Algo mudou?\"; a pergunta do treinador não é mostrada no Plano.",
  "Mostrar a pergunta pede o campo do ASK (ver `838:4011`).")
r("598:2705", X, PLAN + " (`WeekSummary.paused`)", "`PlanView.hold`", "Plano só esconde contagens sob pausa; o cartão \"Treino pausado por segurança\" do frame não existe na aba.")

# ============ 31 · Treino planejado (#102)
SR_DIV = "Grade de métricas, gráfico de estrutura, etapas, esforço e faixas de ritmo ✓. Ausentes: \"Por que este treino\" e \"Como fazer\" (esperam copy revisada), \"Coordenação com a força\", selo \"Treino-chave\", \"Mover de dia\" como seção."
SR_CONF = "\"Por que este treino\"/\"Como fazer\" vêm de texto inglês do motor (nunca exibido); \"Coordenação com a força\" não tem campo no contrato."
r("643:317", P, SRUN, C_SESS, SR_DIV + " Registro #14 sem captura (NO_ROUTE).", SR_CONF)
r("510:202 643:45 643:588 643:888 643:1155 643:1391", P, SRUN, C_SESS, SR_DIV, SR_CONF)
SS_DIV = "Exercícios, séries × reps, reserva, descanso e modo de carga ✓. Ausentes: gráfico de séries (principal/acessório), \"Séries por grupo\", \"Carga e progressão\", \"Sessão e equipamentos\", convenções por exercício como no frame."
r("644:247 644:545 644:843 644:1351", P, SSTR, C_SSTR, SS_DIV)
r("644:1095", P, SSTR, C_SSTR, SS_DIV + " \"carga a estabelecer\" aparece só como rótulo.")
r("645:1683 645:667", N, NONE, "`ReviewRequest.exerciseSubstitution` (existe, não usado)", "Trocar exercício e proposta de troca ausentes.")
r("645:475", N, NONE, "—", "Bloco \"ordem do dia\" do dia duplo ausente.", "A ordem só pode ser explicada com motivo do motor (copy por código).")
r("644:1531", X, "`SessionDetailView` (\"Já feito\")", C_SESS + ", `loggedEntries()`", "Mostra o rótulo \"Já feito\"; não leva ao resumo do treino (50), que não existe.")
r("644:1798", X, "`SessionDetailView`", "`loggedEntries()`", "Estado parcial (3 de 5) não existe no detalhe.")
r("645:807", X, "`SessionDetailView`", "`loggedEntries()`", "Estado \"não feito\" não é mostrado no detalhe (só em Hoje).")
r("645:1123", N, NONE, "—", "Estado \"movido\" ausente.")
r("645:749", P, "`SessionDetailView` (pausa: `UrgentCareBanner`/banner)", "`PlanView.hold`, `startability`", "Sem etapas, carga nem \"Começar\" ✓; layout e copy do frame não conferidos.")
r("645:1407", P, "`SessionDetailView`", "`Startability.notStartable(.projected)`", "\"Prévia: este treino ainda depende de uma resposta sua.\" ✓; a pergunta do treinador não aparece.")

# ============ 40 · Execução · corrida (#103)
RUN_DIV = "App: etapa n de m, tempo restante (distância restante em etapa por distância), faixa de ritmo prescrita como texto, tempo em movimento, distância local \"medido pelo iPhone · não usado pelo plano\", chip de localização, Pausar/Terminar. Ausentes: ritmo ao vivo, indicador \"Na faixa / mais lento / mais rápido\", \"A seguir\", Voz, Bloquear, Pular etapa, faixa de segmentos Aquec./Desaq."
RUN_CONF = "Comparar o ritmo do GPS com a faixa (\"Na faixa\") usa a medição do iPhone que o plano não usa (GAP-16); decidir se é só leitura local permitida."
r("660:503 660:662", N, NONE, C_RUNREC, "Tela \"pronto para começar\" ausente: \"Começar\" abre a corrida e a gravação começa ao aparecer.")
r("660:811", N, NONE, "— (Live Activity, F15)", "Pergunta sobre a tela bloqueada ausente.")
r("657:32 510:473 657:134 657:252 657:370 657:489 657:604 657:718 657:832", X, RUN, C_RUNREC,
  "Frame `[V1: usar variante sem FC ao vivo]`: a referência V1 é a fileira `879:3062`. " + RUN_DIV, RUN_CONF)
r("657:931 657:1037", X, RUN, C_RUNREC, RUN_DIV + " Caminhada/trote só como etapas por tempo.")
r("657:1144", P, RUN, C_RUNREC, "Frame `[V1: usar variante sem FC ao vivo]`. Chip \"Sem sinal de GPS: a corrida segue por tempo.\" ✓; resto como `879:2580`.")
r("657:1243", X, RUN, C_RUNREC, "Frame `[V1: usar variante sem FC ao vivo]`. Chip de precisão ruim ✓; o app nunca mostra ritmo ao vivo, então \"ritmo oculto\" vale sempre; resto como `879:2007`.")
r("657:1342", N, NONE, C_RUNREC, "Frame `[V1: usar variante sem FC ao vivo]`. Modo esteira (velocidade no lugar do ritmo) ausente.")
r("879:2007 879:2316", X, RUN, C_RUNREC, "Variante V1 de referência. " + RUN_DIV, RUN_CONF)
r("879:2580", P, RUN, C_RUNREC, "Variante V1 de referência (só o tempo). Tempo e etapa ✓; layout de duas/uma célula e copy do frame não conferidos.")
r("879:2844", X, RUN + " (`session == nil`)", C_RUNREC, "Variante V1 de referência. \"Corrida avulsa\" com tempo e distância local; sem configuração prévia, objetivo ou avisos de voz.")
r("659:335 661:1068", P, RUN, C_RUNREC, "Estado pausado com Continuar/Terminar ✓; copy e layout do frame não conferidos.")
r("659:424", N, NONE, C_RUNREC, "Frame `[V1: usar variante sem FC ao vivo]`. Pular etapa não existe (\"Próxima etapa\" só aparece em etapa por distância, sem confirmação).")
r("659:532", N, NONE, "—", "Frame `[V1: usar variante sem FC ao vivo]`. \"Opção prevista para hoje (encerrar os blocos)\" ausente.", "Pede a opção prevista pelo motor; não exposta em `runSession(for:)`.")
r("659:650 661:1145", P, RUN + " (`confirmationDialog`)", C_RUNREC, "\"Terminar a corrida?\" com Terminar / Descartar ✓; folha do frame × diálogo do sistema.")
r("659:732", N, NONE, C_NF, "Pergunta \"sentiu dor?\" durante a corrida ausente.")
r("659:834", X, RUN, C_RUNREC, "\"Descartar sem salvar\" é um item do diálogo de terminar, sem a confirmação destrutiva própria.")
r("659:914", X, "`AppTabs.onAppear` → `recorder.resumeIfNeeded()`", C_RUNREC, "A corrida volta direto à tela; sem a explicação \"retorno depois que o app fechou\".")
r("659:965", N, NONE, C_REP, "Estado \"salvando\" ausente (o relato abre direto).")
r("510:592 660:957 660:1021", N, NONE, "— (Live Activity / Dynamic Island, F15)", "Fora do app e barra de treino em andamento ausentes (a corrida é `fullScreenCover`).")
r("660:1229", X, REP, C_REP,
  "App: \"Como foi?\", Fiz o treino inteiro / Fiz só uma parte, minutos, esforço 0–10, \"Parei antes do fim\" + motivo, comparação com o previsto e o formulário de elegibilidade. Figma: escala 0–10 em pontos, \"Conseguiu fazer como planejado? Sim / Em parte / Não\", \"sentiu dor ou algo incomum?\", \"Condições (opcional)\".",
  "`conditions` existe no contrato e não é enviado; o motor exige `EligibilityScreen` atual em cada relato (#68) e o frame não tem esse bloco.")
r("660:1313", X, REP + " → " + NF, C_REP + ", " + C_NF, "Planejada: parar por sintoma → aviso de triagem; o encaminhamento do frame não é o mesmo.")
r("660:1400", X, REP + " (`report.saved`, `LocalSummary`)", C_REP, "\"Salvo no seu histórico.\" + resumo local na própria folha × tela de resumo salvo.")
r("660:1504", N, NONE, "`pendingReports()`", "Resumo sem conexão (envio pendente) ausente.")
r("660:1609", N, NONE, "`SessionResponse.nextDayFunction`, `wellbeingCheck` (não usados)", "\"Dia seguinte: como você está?\" ausente.")
r("661:833", N, NONE, C_RUNREC, "Configuração da avulsa (objetivo opcional, GPS pronto, avisos de voz) ausente: \"Começar uma corrida agora\" inicia direto.")
r("661:904 661:992", X, RUN + " (`session == nil`)", C_RUNREC, "Frame `[V1: usar variante sem FC ao vivo]`; referência `879:2844`.")
r("661:1215", P, REP + " (avulsa)", C_REP, "\"Parou ou sentiu algo fora do normal?\" obrigatória ✓ (texto igual); esforço; formulário de elegibilidade a mais.",
  "Elegibilidade exigida pelo motor (#68) sem bloco no Figma.")
r("661:1289", X, REP + " (avulsa)", C_REP, "Resumo e salvar na própria folha × tela de resumo do frame.")
r("661:1366", N, NONE, "`UnplannedRunActual.declaredDistanceKm`", "\"Corrigir dados (folha)\" da avulsa ausente.")
r("661:1454", P, REP + " (`report.leave.confirm`)", C_REP, "\"Sair sem salvar este registro? A gravação é descartada.\" ✓; diálogo do sistema × folha.")

# ============ 41 · Execução · força (#103)
r("665:40 668:700", N, NONE, C_STR, "Tela \"pronto para começar\" ausente: \"Começar\" abre o registro da força.")
r("665:127", X, STR, C_STR, "Registro em formulário único (minutos, \"Fiz como prescrito\", série a série, carga vazia) × visão da sessão em andamento com progresso e reordenação.")
r("511:446 665:420 665:562 668:774 668:866", N, NONE, C_STR, "Execução série a série (série atual, descanso, série abaixo do alvo) ausente.")
r("665:233", X, STR, C_STR, "Carga/reps digitadas no formulário × campo em edição do frame.")
r("665:832", N, NONE, "`LoggedSetEntry.rir` (existe, não enviado)", "Folha de repetições em reserva ausente: o app não pergunta reserva.")
r("665:996", N, NONE, C_STR, "Corrigir série ausente.")
r("665:486", N, NONE, "`prescription.load`", "\"Ajustar carga\" (sem número sugerido, GAP-10) ausente.")
r("665:734", N, NONE, C_SSTR, "Exercício opcional ausente.")
r("665:1079", N, NONE, "—", FUT)
r("666:332 666:507 666:677", N, NONE, "`ReviewRequest.exerciseSubstitution` (existe, não usado)", "Trocar exercício ausente.")
r("666:838", N, NONE, "`exerciseSubstitution.pain`, " + C_NF, "Troca com dor ausente.", "Dor na troca vira rota clínica; fluxo a definir com SSCTR.")
r("666:985 666:1104", N, NONE, "—", "Adicionar/remover exercício ausente.", "Adicionar exercício fora da prescrição não tem contrato de repertório no front C.")
r("666:1191 666:1262 666:1350 666:1495", N, NONE, C_STR, "Pausa, encerrar parcialmente, retomar e atividade ao vivo ausentes.")
r("666:1401 668:980", X, STR, C_STR, "\"Salvar o registro\" sem a confirmação de conclusão do frame.")
r("668:1105", X, STR + " (`session == nil`)", C_STR, "\"Força avulsa\" abre o mesmo formulário sem exercícios; o frame começa pela escolha de exercícios.",
  "Escolha por recentes/grupo/busca pede um catálogo de exercícios que o front C não lê.")
r("668:1182 668:1256 668:1364 668:1474 668:1602 668:1737", N, NONE, "—", "Seleção, busca, registro, ações e histórico do exercício na força avulsa ausentes.",
  "Catálogo de exercícios sem contrato no front C.")
r("668:1873", X, STR, C_STR + " (`observedAt`, `unplannedMerge`)", "Salvar sem a folha de conclusão do frame.")

# ============ 50 · Concluído (#103) e Histórico (#104)
DONE_RUN = "Não há tela de treino concluído: depois do relato fica \"Salvo no seu histórico.\" na folha, e o Histórico abre um detalhe com vozes, minutos, parada e distâncias. Ausentes: cabeçalho com mapa, grade de números, blocos, gráficos e leitura do treinador."
r("531:1630 531:1220 682:337 682:904 682:1464 880:19765 880:21503 945:14796 683:2230", X, HDET + " / " + REP, C_HIST, DONE_RUN)
r("880:20729", X, REP + " (`LocalSummary`)", C_HIST, "\"Medido pelo iPhone · não usado pelo plano\" ✓ no resumo local; resto como as outras telas de concluído.")
r("682:2528", X, HDET, C_HIST, "Avulsa no detalhe do Histórico; \"Corrigir dados / Compartilhar\" e o mapa local ausentes.")
r("683:1959", X, HDET, C_HIST, "Importada aparece como \"Corrida do relógio\"; sem o pé de fonte do frame.")
r("683:2087", X, HDET, C_HIST, "Registro manual sem distância: registrar corrida feita não existe (só força).")
r("530:1131 544:1329", N, NONE, "—", "Leituras recolhidas/ao toque dos gráficos ausentes (não há gráficos).")
r("683:721 684:3688", N, NONE, "—", "Folha de opções do treino (corrigir, compartilhar) ausente.")
r("683:1141", X, HDET + " (\"Distância parece errada?\")", C_CORR, "Só a distância pode ser corrigida, numa folha própria com elegibilidade; o frame corrige o registro.")
r("683:1555", P, HDET, C_CORR, "Após correção, a linha mostra \"você corrigiu para …\" ✓; layout não conferido.")
r("683:2360 684:4669 687:4651", N, NONE, "—", FUT + " Exclusão é V2 (GAP-13).")
DONE_STR = "Não há tela de força concluída; o detalhe do Histórico lista séries e cargas registradas. Ausentes: duração/séries/carga total/reserva/marcas, \"Planejado × feito\", evolução."
r("684:1208 684:1647 684:2169 684:2562 684:2695", X, HDET, C_HIST, DONE_STR)
r("684:2928", N, NONE, "—", "\"Carga a confirmar\" ausente.")
r("684:3337", N, NONE, C_CORR, "Corrigir série ausente (só distância de corrida).")
r("684:4050", N, NONE, "`pendingReports()`", "\"Salvo neste iPhone, envio pendente\" ausente.")
r("684:4381", X, HDET, C_HIST + ", `WriteOutcome.kept`", "Força avulsa no detalhe; sem a tela de concluído do frame.")
r("684:4890", X, HDET, C_HIST, "Importada aparece só com a duração (\"registrado no Apple Saúde · só a duração\") ✓ na lista; sem a tela do frame.")
r("687:2298", X, HIST, C_HIST,
  "App: título, status do Apple Saúde, linhas agrupadas por \"Semana n de m\". Ausentes: busca, filtros (Tudo/Corrida/Força/Planejada/Avulsa/Importada/Manual), destaques de carga, cartão \"Semanas completas\", resumo por semana.")
r("687:3098 687:3404 687:3535", N, NONE, C_HIST, "Filtros ausentes.")
r("687:3617", N, NONE, C_HIST, "\"Ir para uma data\" ausente.")
r("687:4438 687:4590", N, NONE, C_HIST, "Busca ausente.")
r("688:3330", X, HIST, C_HIST, "Semana fechada é só um rótulo de grupo; sem o resumo da semana.")
r("688:3666", P, HIST + " (`history.notDone`)", C_HIST, "\"Não feito\" na linha ✓; layout não conferido.")
r("688:3788", X, HIST + " (`history-empty`)", C_HIST, "Vazio com prancheta + \"Nada registrado ainda…\" × vazio de primeiro uso do frame.")
r("688:3900", N, NONE, "`submit(sessionReports)` (`unplannedRun`)", "Registrar corrida feita fora do app ausente.")
r("688:3977", X, STR + " (via +)", C_STR, "Registrar força feita existe pelo \"+\", não pelo Histórico, e com o formulário do registro.")
r("688:4096", N, NONE, "—", "\"Ignorar na análise\" para dado do relógio ausente; o app corrige só a distância do próprio relato.",
  "Ignorar dado importado na análise não tem contrato.")
r("688:4170", N, NONE, "—", "\"Treino indisponível · link antigo\" ausente.")
r("688:4238", P, LOAD, C_STATE, "Só o esqueleto da raiz; a aba não tem carregamento próprio.")
r("688:4344", N, NONE, "`pendingReports()`", "\"Sem conexão, treino ainda não enviado\" ausente no Histórico.")
r("688:4542", X, STATE + " `.operationalError`", C_STATE, "Tela cheia sem abas × estado dentro do Histórico.")
r("688:4621", X, HIST + " · `HealthStatusRow`", "`HealthIngestStatusSource.status()`", "Linha \"Nada recebido do Apple Saúde ainda…\" × cartão \"Apple Saúde não conectado / Permitir nos Ajustes\".")

# ============ 60 · Progresso (#104)
PG = "App: uma página com estimativas (faixa), \"Se você seguir o plano\", volume por semana, consistência, resultados e séries por músculo. Ausentes: segmentos Geral/Corrida/Força, períodos, cartões-resumo do frame, \"Ver os dados em tabela\", divisão do tempo, cargas principais."
r("728:68", X, PROG, C_PROG, PG, "\"meta 44:30\" no frame sem campo de meta.")
r("512:360", X, PROG, C_PROG, PG + " \"Mapa híbrido\" é FUTURO (GAP-25) e está oculto ✓.", "12 meses e \"+18% sobre o ano anterior\" pedem histórico além do plano.")
r("728:481 729:1204 730:1109", X, PROG, C_PROG, PG + " Período de 12 semanas e importados ausentes.")
r("728:1106", N, NONE, C_PROG, "Folha \"escolher período\" ausente.")
r("728:666", N, NONE, C_PROG, "Semana selecionada com dados em tabela ausente.")
r("729:478", X, PROG, C_PROG, "Estimativas em lista por distância × aba Corrida com faixa visual e meta.", "\"meta 44:30\" sem campo.")
r("729:1380 729:1517 729:839", N, NONE, "`loggedEntries()`", "Comparação de sessões (limiar bloco a bloco, longões, leitura ao toque) ausente.")
r("730:748 730:1241 730:1461 730:1696", N, NONE, "`loggedEntries()`", "Aba Força (cargas principais, exercício, sessões lado a lado) ausente; o app só tem \"Séries de força por músculo nesta semana\".")
r("730:1845", N, NONE, "—", "Folha \"escolher exercício\" ausente.")
r("731:1171 731:1434 731:1601 731:1737", X, PROG, C_PROG, "Outros perfis renderizam a mesma página; estados do frame (poucos dados, só esforço, teste oferecido, só força) não existem.")
r("731:1960", X, PROG, C_PROG, "Sem estado vazio próprio: os cartões somem quando não há dado.")
r("731:2039", P, LOAD, C_STATE, "Só o esqueleto da raiz.")
r("731:2088", X, STATE + " `.operationalError`", C_STATE, "Tela cheia × estado dentro do Progresso.")
r("731:2239", N, NONE, "—", "\"Sem conexão, mostrando o que estava salvo\" ausente.")
r("731:2618 880:9310", P, PROG, C_PROG, "Sem bloco de sinais do relógio ✓ (notInV1); resto como `728:68`.")
r("880:10566", N, NONE, "— (sono/repouso fora da V1, #24)", "Variante \"só sono e repouso\" não existe.", "Frame numa fileira V1 sem tag; sono/FC de repouso fora da V1 (#24).")

# ============ 70 · Perfil e ajustes (#105)
r("512:985", X, PROF, C_PROF,
  "App: Perfil com Treino (zonas de FC), Privacidade e dados (consentimentos, apagar dados de saúde, apagar a conta), Sobre (modo sintético, idioma). Figma: cabeçalho com nome/Premium/idade e medidas, totais, Foco do treino, Objetivos, Cuidados, Plano (rotina, treinador, volume, dificuldade), Você, Conta, App, Integrações, Assinatura, Ajuda.",
  "Foco do treino e objetivos editáveis sem contrato de prioridade/edição; medidas dependem de `836:2649`.")
r("751:77", N, NONE, "— (nome, idade, medidas sem edição no contrato)", "Editar perfil ausente.")
r("751:459", N, NONE, C_ACC, "Sair da conta ausente.")
r("841:971", N, NONE, "—", "\"Como o treinador coordena\" ausente.")
r("841:1051 841:1282 841:1383", N, NONE, "`ReviewRequest.coach(profile:)` (existe, não usado)", "Seu treinador e troca de perfil ausentes.")
r("841:1144 841:1483 841:1613 841:1739 841:1865 841:1991", N, NONE, "`ReviewRequest.preferences(volume:difficulty:)` (existe, não usado)", "Volume e dificuldade ausentes.")
r("842:1441", N, NONE, "—", "Objetivos e prioridade ausentes.", "Prioridade sem campo; mudar objetivo exige `restart`.")
r("754:1246", N, NONE, "`restart(_:)` (não usado)", "Trocar objetivo pedindo plano novo ausente.")
r("842:1538 842:1738", N, NONE, "— (`restart` só)", "Rotina e equipamentos ausentes.", "Mudar rotina sem plano novo não tem contrato (ver `597:2854`).")
r("754:995", N, NONE, "—", "Configurações (idioma, unidades, aparência, nível de detalhe, notificações) ausentes; o app só diz que o idioma segue o iPhone.",
  "Notificações sem decisão (PRODUCT_SCOPE §4); aparência depende do #94.")
r("842:1948", X, PROF + " (seção Privacidade e dados)", C_PROF, "Consentimentos como Dar/Retirar dentro do Perfil × tela \"Dados e privacidade\" com o que guardamos e para quê.")
r("754:1385", X, PROF, "`setConsent(.healthSignals, granted: false)`", "Retirar consentimento sem a folha explicativa do frame.")
r("754:1514", X, PROF + " (`confirmationDialog`)", "`eraseHealthFacts(eventIds:)`", "\"Apagar os dados de saúde?\" em diálogo do sistema × folha do frame.")
r("754:1638", N, NONE, "—", "Exportar dados ausente.")
r("842:2089 842:2149", N, NONE, "—", "Enviar feedback ausente.")
r("937:1833 937:2037 937:2246", N, NONE, C_SUB, "Etiqueta de assinatura no topo do Perfil ausente.")
r("944:1723 944:1858", N, NONE, "—", "Central de ajuda ausente.")
r("944:1939 944:2008 944:2141 944:2207 944:2326 944:2446", N, NONE, "—", "Termos, privacidade e aviso de saúde ausentes (textos à espera de revisão jurídica e clínica).")

# ============ 71 · Prova (#105)
HR_DIV = "Estrutura e copy do frame (kicker, título, chip, origem, divulgação, Z1–Z5 em bpm do motor, barras no eixo 90→máxima, \"Só para desacelerar\", \"Três leituras\", \"Funciona sem relógio\", informar máxima, personalizar) ✓ por código."
r("1102:4302 760:1484 1102:4428 760:1611 760:1693 845:4225", P, HRZ, C_HR, HR_DIV + " Entrada pelo Perfil, não pela página Prova.")
r("756:2 756:314 756:418 756:534 756:630 756:840 756:978 756:1045 756:1217 756:1306 756:1372 756:1428", N, NONE, "`presentation().readings.runCalibration` (paceBands, capacity)",
  "Tela \"Seus ritmos e esforço\" ausente (as faixas só aparecem no detalhe do treino).")
r("760:1838 760:1943 760:2050 760:2142 760:2205 760:2265", X, PROG + " (estimativas)", C_PROG, "Estimativas em lista no Progresso × tela \"Estimativas de prova\" (estimativa, meta, resultado, recorde separados).",
  "Meta e recorde sem contrato.")
r("760:2346 760:2451", N, NONE, "—", "Ponto de partida (Marina) ausente.")
r("845:3991 845:4074 778:1744 778:2443 778:2550 778:1853 778:1939 778:2012 778:2092 778:2259 778:2329 845:4158", N, NONE, "—",
  "Teste de campo ausente.", "Entrada de teste após o cadastro é `UNSUPPORTED_V1`; o Figma o mostra como fluxo V1.")
r("759:695", N, NONE, "`goals.run.event`", "Detalhe da prova ausente (o card Prova de Hoje não abre nada).", "Hora da largada e meta sem campo.")
r("759:1030 759:1106 759:1214 759:1345 759:1431 759:1490 759:1702", N, NONE, "`restart(_:)` (não usado)", "Nova prova, editar data e trocar distância ausentes.",
  "Editar a data sem plano novo não tem contrato de revisão.")
r("759:3925 759:4117", P, TODAY, C_TODAY, "Semana e dia de prova aparecem só em Hoje (ver `576:1288`, `576:1524`).")
r("759:4224 759:4314", N, NONE, "—", "Registrar resultado de prova ausente.", "Resultado pós-cadastro é `UNSUPPORTED_V1`.")
r("759:4473 759:4588", N, NONE, "—", "Próximo passo após o plano e volta pós-maratona ausentes.")

# ============ 72 · Adaptações (#102)
r("805:2", X, CHG, "`ChangesSheet` → " + C_NF,
  "App: \"Algo mudou na sua semana?\" com \"Não estou 100%\" e uma linha não tocável \"Não posso em um dia\" (\"Escolha o treino no Plano…\"); sob pausa, só \"Estou pronto para voltar\". Figma: data, 5 entradas (Não estou 100%, Dor ou lesão, Não posso treinar num dia, Mudar meus dias, Vou parar por um tempo) e \"O app não avalia sintomas…\".")
r("843:1631", X, NF, C_NF, "Condições com copy diferente (\"Cansaço fora do normal\" × \"Cansaço fora do comum\"; \"Incômodo no corpo\" × \"Desconforto pequeno\"), sem a linha de descrição; sem a saída \"Ir para Dor ou lesão\".")
r("843:1696", X, NF + " · `SignQuestionnaire`", C_NF, "Sinais todos numa lista Sim/Não × um sinal por tela (9 de 13).")
r("843:1751", P, NF + " · `SignQuestionnaire`", C_NF, "Lista com as respostas e \"Sem resposta não conta como não\" ✓; formulário de elegibilidade a mais.",
  "Elegibilidade exigida pelo motor (#72) sem bloco no Figma.")
r("805:354", X, NF + " (`nf.kept`)", C_NF, "Texto curto \"O plano continua como está…\" × tela com \"Seu plano segue como está\", aviso \"Não é uma avaliação de saúde\" e opções do dia.")
r("805:410", X, BANNER + " (`.state(.blocked)`)", C_NF + ", `PlanView.hold`",
  "Captura #14 × frame (revisão #99): \"Entendi\" deve ser a primária e a prontidão secundária neutra; título com a diretiva e \"O app não faz diagnóstico…\"; sessões retidas em pílulas cinza com pausa; linhas \"Corrida · retida / Força · retida\" com cadeado; banner sem vermelho; glow neutro; micro \"SINAL INFORMADO · data · hora\".")
r("805:492", X, URG, C_NF + ", `Guidance.level = URGENT_CARE_ADVISED`",
  "Captura #14 × frame (revisão #99, **blocker de segurança**): a única e mais destacada ação é \"Estou pronto para voltar\", contradizendo \"Pare agora…\"; o Figma põe \"Entendi\" primária e a prontidão secundária (`fundo/elevado-2`, 52 pt); manchete deve ser a instrução urgente; rótulo \"URGENTE\"; brilho corta o banner translúcido (H1).")
r("805:2090", N, NONE, "`WellbeingDeclaration.region`/`sports` (não usados)", "\"Dor ou lesão · informar\" ausente.", "Qual revisão leva \"dor ou lesão\" (condição, região) precisa de confirmação SSCTR.")
r("843:1856", X, RD, C_RD, "\"Estou pronto para voltar\" numa folha: sinais, recuperado, corrida e força juntos × 3 passos (por modalidade, sinais um por tela, conferir).")
r("843:1923", X, RD + " · `SignQuestionnaire`", C_RD, "15 sinais em lista × um por tela.")
r("843:1980", P, RD, C_RD, "Conferir e enviar ✓ no mesmo formulário; elegibilidade a mais.", "Elegibilidade sem bloco no Figma.")
r("843:2115", X, BANNER + " (`.state(.returning)`)", C_RD, "\"De volta, com calma\" genérico × resultado por modalidade (corrida volta, força retida, entrada mais leve, volta em 2 passos).")
r("805:2526", X, RD + " (`state.needsInput`)", C_RD, "Texto genérico \"Falta uma resposta sua\" × pergunta de restrição da força.")
r("805:2595", N, NONE, "`restart(_:)` (não usado)", "Bloqueio após cadastro refeito ausente (não há refazer cadastro).")
r("805:2648", X, STR + " / " + REP, C_STR, "Avulsa salva sob pausa mostra \"Salvo\" na folha; sem a tela \"o plano segue pausado\" com as linhas retidas.")
r("805:2723", N, NONE, "—", FUT)
r("806:708 806:869", N, NONE, "—", "Mudanças maiores (viagem, prova antecipada) ausentes.", "Prova antecipada sem contrato de edição.")
r("806:981 844:1825 806:1245", N, NONE, "`ReviewRequest.reportBreak(BreakReport)` (existe, não usado)", "Declarar pausa e retorno ausentes.")
r("844:1913", N, NONE, "`ReviewRequest.sessionReports` (WEEKLY_REVIEW), `history()`", "Revisão da semana ausente.")
r("806:3059", N, NONE, "`loggedEntries()`, `history()`", "Progressão pela regra (por que a carga subiu) ausente.", "\"Por que subiu\" depende de motivo do motor por copy.")
r("806:3137", X, TODAY, C_TODAY, "Sessão parcial aparece como \"Não feito\" (ver `575:701`).")
r("806:3176", N, NONE, "`ReviewRequest.missedSession`", "\"Sem registro · o que aconteceu?\" ausente.")
r("806:3252 806:3406 806:3483 806:3567", N, NONE, "—", FUT)
r("806:3345", N, NONE, "—", "\"Sinais do relógio · sem relógio\" (válido na V1) ausente.")

# ============ 80 · Conta, acesso e assinatura (#105)
ACC = "Camada de conta ausente; fundador (27/11): a experiência de conta do Figma faz parte do produto final, sem simular conta remota nem autenticação enquanto não houver backend (#28)."
SUB = "Paywall/assinatura ausentes; fundador (27/11): UI entra com ambiente de teste identificado, sem cobrança real (F13)."
# filled by row in matrix.py

# ============ 81 · Sistema, Apple Saúde e permissões (#105)
r("848:7", N, NONE, "—", "\"Permissões e conexões\" ausente.")
r("848:88 848:142", N, NONE, "`RunRecorder` (estado de localização)", "Telas de localização em Sistema ausentes (o estado só aparece como chip na corrida).")
r("848:190 848:241 848:860", N, NONE, "—", "Notificações ausentes.", "Notificações sem decisão do fundador (PRODUCT_SCOPE §4): sem notificações na V1 por padrão.")
r("848:290 848:383 848:433 848:554 848:584 848:659 848:741 880:25617 848:1012", N, NONE, "`HealthIngestStatusSource.status()`", "Tela Apple Saúde em Sistema ausente (só uma linha no Histórico).")
r("848:502 848:696", X, HIST + " · `HealthStatusRow`", "`HealthIngestStatusSource.status()`", "\"Nada recebido do Apple Saúde ainda. Confira em Ajustes › Saúde › Acesso a Dados…\" numa linha do Histórico × tela com passos e \"Abrir Ajustes\".")
r("849:811", N, NONE, "—", "Frame `[V1: oculto até prova A+B]`: oculto ✓ (não existe).")
r("849:975", N, NONE, "—", "Adicionar dado que faltou ao importado ausente.")
r("849:1066", N, NONE, "—", "Frame `[V1: oculto até OPEN-1]`: oculto ✓ (não existe).")
r("849:1153 849:3330", N, NONE, "—", FUT)
r("849:1239 849:1552 849:1872", X, RUN + " · `LocationChip`", "`RunRecorder` (LocationState)", "Contexto antes do pedido do iOS, \"procurando sinal\" e \"aproximada\" ausentes; só o chip da corrida.")
r("849:2194", N, NONE, "—", "Treino planejado aberto sem conexão ausente.")
r("849:2459 849:2631 849:2803 849:2975", N, NONE, "`RunRecorder.state`, `pendingReports()`", "Avisos de sessão em Hoje (em andamento, interrompida, não salva, salva) ausentes.")
r("849:3155", N, NONE, "—", "Erro parcial em Hoje ausente (o app publica tudo ou cai em erro de tela cheia).")
r("849:3601 849:3871", N, NONE, "`WriteOutcome`", "\"Não foi possível atualizar\" e \"Mudança não aplicada\" ausentes.")
r("849:3910", X, LAUNCH + " (`.failed`)", "`Launch` (abrir o host)", "\"Não deu certo agora\" + Tentar de novo × \"Não conseguimos carregar sua conta agora\" + Tentar de novo + Ajuda.")
r("849:3950", X, STATE + " `.unrecognized`", C_STATE, "\"Esta versão não reconhece o estado do plano / Atualize o app\" × \"Atualize o Repmile para continuar\" + \"Abrir a App Store\".")
r("849:3994", X, BANNER + " (gate clínico/fora de escopo)", "`Startability`, `PlanView.hold`", "Banner em Hoje × tela \"Sem plano · O plano não pôde ser montado\" com \"Declarar que posso treinar\".")
r("969:3138", X, LAUNCH + " (`.opening` → `LoadingSkeleton`)", "—", "Esqueleto pulsante no lugar do splash do frame (prioridade de motion 1).")

# ============ 82 · Compartilhar (#105) — artes and sheet filled by row in matrix.py
# ============ 83 · Idiomas, texto grande e stress (#105)
r("887:2 887:737", P, TODAY + " (pt-BR/en/es em `copy.psv`)", "`Localizable.strings` (en, es)", "Hoje traduzido existe (copy por código); textos do frame não conferidos.")
r("887:1459", X, SRUN, C_SESS, "Unidades em milhas: o app tem `session.pace.mi`, mas não há ajuste de unidades (Configurações ausente).")
r("887:2499", N, NONE, C_ACC, "Iniciar sesión ausente (conta).")
r("887:2721", N, NONE, "—", "Localização desativada em Sistema ausente.")
r("889:489", X, TODAY, C_TODAY, "Revisão #99 H3: a faixa da semana não escala com Dynamic Type; em XXXL a tab bar esconde \"Ver o treino\".")
r("889:1157", N, NONE, "—", "Onde treina força com equipamentos (ver `867:2289`) não existe.")
r("945:16719", X, RUN, C_RUNREC, "Texto grande na corrida não conferido; mesmas diferenças de `879:2007`.")
r("892:691 892:3532 892:5233", P, PLAN, C_PLAN, "Stress de nomes e semanas: componente existe; não testado com os valores do frame.")
r("892:1809", X, PROG, C_PROG, "Progresso de 12 meses não existe (ver `512:360`).")
r("892:6714", N, NONE, C_ACC, "E-mail longo (conta) ausente.")
r("893:1403", X, PHASES, "`weekPlan()`", "Fase feita recolhida em uma linha não existe.")
