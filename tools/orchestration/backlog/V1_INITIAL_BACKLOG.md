# Backlog inicial da V1 (fonte do `tools/orchestration/backlog.mjs`)

Cada `## KEY · Título` vira uma issue (idempotente pelo marcador `backlog-key`) e um item do quadro. `fields:` preenche os campos do
quadro e os rótulos; `deps:` vira a seção "Dependências" com os números reais. Fontes: handoffs A/B/C, contrato paralelo rev. 2 §12–§15,
`FIGMA_FUNCTIONAL_ALIGNMENT.md` e `OPEN_PRODUCT_DECISIONS.md` (branch Figma). O trabalho que A e B já executam tem **uma** issue de
acompanhamento por frente, sem tarefas duplicadas.

## T-A · [A] CoachingHost — acompanhamento da frente
fields: type=Feature; area=CoachingCore; front=A; priority=P0; release=V1; status=In Progress
deps:

### Objetivo
Acompanhar a execução do handoff A (em andamento na worktree `claude/v1-ios-coachinghost`) sem interrompê-la: CoachingCore em JavaScriptCore, persistência selada, Keychain/CryptoKit, `Startability`, portas `CoachingReading`/`CoachingWriting`/`TimeInZoneClassifying`/`DeviceActivitySink`, HR5.

### Contexto técnico e requisitos
- Handoff: `audits/v1-abc-foundation-consolidation-2026-11-26/A_COACHINGHOST_HANDOFF.md` (§4 itens 1–18a, §7 testes, §9 gates).
- Caminhos de A (contrato §10): `ios/Packages/CoachingHost/**`, `ios/Labs/CoachingHostLab/**`, `audits/v1-ios-coachinghost-2026-11-24/**`.
- Novos incrementos descobertos pela frente viram issues próprias ligadas a esta.

### Critérios de aceite
- [ ] Bundle: manifesto AMENDMENT-2 + `app-projections.mjs`; equivalência `core`/`int`/`final`/`hr5r` com 0 DIVERGED (macOS JSC)
- [ ] `PORTS_IMPLEMENTED`: respostas decodificam nos tipos de `CoachingPresentation` e são byte-iguais às fixtures
- [ ] `FND_ABC_04_GATE`: após restart fora de escopo/clínico, nenhuma sessão `.startable` (inclusive após reabrir e reinstalar)
- [ ] `HR5_CROSS_PROCESS`: dois processos, 200 rodadas, nenhuma declaração perdida
- [ ] iPhone pela trava `coachinghost`: equivalência, persistência entre processos, aparelho bloqueado, PF-0
- [ ] `guard.mjs` limpo; `npm test` e os dois `swift test` verdes; revisão independente QRE/Security
- [ ] `FINAL_REPORT.md` e `CONTRACT_CHANGE_PROPOSALS.md` publicados; PR de integração aberto

### Testes necessários
Os da §7 do handoff A, com logs em `audits/v1-ios-coachinghost-2026-11-24/results/`.

## T-B · [B] HealthKitIngest — acompanhamento da frente
fields: type=Feature; area=HealthKit; front=B; priority=P0; release=V1; status=In Progress
deps:

### Objetivo
Acompanhar a execução do handoff B (em andamento na worktree `claude/v1-ios-healthkit`) sem interrompê-la: autorização, leitura, normalização com proveniência, fila persistente, dedupe, revogação, `HealthIngestStatusSource`.

### Contexto técnico e requisitos
- Handoff: `audits/v1-abc-foundation-consolidation-2026-11-26/B_HEALTHKIT_HANDOFF.md` (§4 itens 1–19, §7, §9).
- Caminhos de B: `ios/Packages/HealthKitIngest/**`, `ios/Labs/HealthKitLab/**`, `audits/v1-ios-healthkit-2026-11-24/**`.
- Não pedir permissão de FC, sono, VFC ou escrita no aparelho real nesta fase.

### Critérios de aceite
- [ ] `INGEST_STATUS_PORT`: `status()` nunca afirma negação; `purge` esvazia resumos e itens retidos
- [ ] `RECORDING_DEDUPE`: os seis casos pelo caminho real da fila (vinculado, de lado, em espera e redecidido)
- [ ] `HR_SERIES_MAPPING (SIMULATOR)`: ordem, limites, sensor `UNKNOWN`; JSON aceito por `classifySamples`
- [ ] Fila sobrevive à morte do processo, sem perda nem duplicação que vire crédito
- [ ] Canário: nenhum valor de saúde em log
- [ ] iPhone pela trava `healthkit`: autorização e leitura só com contagens; aparelho bloqueado
- [ ] `guard.mjs` limpo; `swift test` de IntegrationContracts verde; revisão independente

### Testes necessários
Os da §7 do handoff B, com logs em `audits/v1-ios-healthkit-2026-11-24/results/`.

## T-FIG · [Design] Alinhamento final do Figma — acompanhamento
fields: type=Design; area=UX/UI; front=Design; priority=P0; release=V1; status=In Progress
deps:

### Objetivo
Fechar o alinhamento visual e funcional do Figma que libera a frente C, sem editar o Figma fora daquela frente.

### Contexto técnico e requisitos
- Branch `claude/v1-figma-final-alignment`; registro em `audits/v1-figma-final-alignment-2026-11-26/`.
- Arquivo `90oyvXHxxBQAvr1netov7S`, nó de entrada `835-2069`; adendo `SWIFTUI_VISUAL_HANDOFF_ADDENDUM.md`.

### Critérios de aceite
- [x] Commit do alinhamento publicado em `origin` (`26ec95f`, 26/11)
- [ ] Versão nomeada salva no histórico do Figma ("V1 alinhamento funcional · 26 nov"), que C usa como referência
- [ ] Adendo visual entregue à frente C
- [ ] As 7 decisões de `OPEN_PRODUCT_DECISIONS.md` registradas como respondidas ou mantidas no default da V1

## C1 · [C] App shell do RepMile rodando no simulador
fields: type=Feature; area=iOS Frontend; front=C; priority=P0; release=V1; status=In Progress
deps:

> Em andamento na sessão C (commit local `f2b5628`, 26/11: shell e navegação verificada no simulador). Esta issue é o acompanhamento da frente C e o seu incremento atual; os próximos incrementos de C são as issues seguintes.

### Objetivo
Criar o primeiro app executável: `ios/App/RepMile.xcodeproj` + `ios/App/RepMile/**`, ligando `RepMileUI`, `RunRecorder`, os dois pacotes compartilhados e os provedores de fixture. Ativa o pipeline do simulador.

### Contexto técnico e requisitos
- `C_SWIFTUI_HANDOFF.md` §2, §6, §9; contrato §9 (bundle id `fit.vilumo.repmile.dev.app.$(DEVELOPMENT_TEAM)`, `DEVELOPMENT_TEAM` só na linha de comando, nunca no `project.pbxproj`).
- Um scheme de app (o pipeline escolhe sozinho quando há um só) e um alvo de UI tests.
- Sem `import HealthKit`, `JavaScriptCore`, `CryptoKit`, `Security`, `CoachingHost`, `HealthKitIngest`.

### Critérios de aceite
- [ ] `tools/orchestration/sim.sh detect` deixa de responder `WAITING_FOR_APP_SHELL`
- [ ] `tools/orchestration/sim.sh run` constrói, instala, abre e captura screenshot no simulador (manifest `result=ok`)
- [ ] `tools/orchestration/sim.sh test` roda ao menos um XCUITest de lançamento
- [ ] `guard.mjs` limpo; CI verde

### Testes necessários
`tools/orchestration/sim.sh all`; `tools/orchestration/swift-packages.sh`.

## C2 · [C] Design system e componentes base a partir do Figma
fields: type=Design; area=UX/UI; front=C; priority=P0; release=V1; status=Blocked
deps: T-FIG, C1

### Objetivo
Tokens (cor, tipografia, espaçamento, raio), modo claro/escuro do modo de cor A, componentes base de `SWIFTUI_IMPLEMENTATION_HANDOFF.md` §5 e o motion prioritário (cascata de 3 s, tabela 91, Reduzir movimento).

### Contexto técnico e requisitos
- Autoridade visual: versão nomeada do Figma (T-FIG). Sem redesenho.
- `ios/Packages/RepMileUI/**`; Dynamic Type, VoiceOver e contraste já nos componentes.

### Critérios de aceite
- [ ] Cada componente com preview em claro/escuro e texto grande (+30%)
- [ ] Primeira validação visual registrada por `tools/orchestration/visual.mjs` (componentes-chave × nó do Figma)

### Testes necessários
Previews/snapshots; `visual.mjs verify`.

## C3 · [C] Provedores de fixture e cobertura das 99 fixtures
fields: type=Feature; area=iOS Frontend; front=C; priority=P0; release=V1; status=Backlog
deps: C1

### Objetivo
Provedores de fixture para `CoachingReading`/`CoachingWriting` e dublê de `HealthIngestStatusSource`, que **apenas reproduzem** `ios/Packages/CoachingPresentation/Tests/CoachingPresentationTests/Fixtures/` (nunca JSON escrito à mão).

### Critérios de aceite
- [ ] Teste que percorre `INDEX.json` e renderiza cada fixture por ao menos uma tela ou preview sem crash (handoff C §8.1)
- [ ] O dublê de escrita recusa chaves fora dos requests fechados (igual a `admission.mjs`)

### Testes necessários
`swift test` de `RepMileUI`; XCUITest de cenário por fixture.

## C4 · [C] Navegação e telas de estado (bloqueado, pergunta, erro, sem dados)
fields: type=Feature; area=iOS Frontend; front=C; priority=P0; release=V1; status=Backlog
deps: C2, C3

### Objetivo
Shell de navegação (Hoje, Plano, Histórico, Progresso, Perfil) e uma tela para cada `ClientState`: `BLOCKED`, `NEEDS_INPUT`, `PENDING_CONFIRMATION`, `RETURNING`, `NO_DATA`, `OPERATIONAL_ERROR`, `INTEGRITY_FAILURE`, `unrecognized` (falha fechada).

### Critérios de aceite
- [ ] Nenhum estado mostra plano vazio ou "dia de descanso" (handoff C §8.3)
- [ ] Sob `17-plan-blocked` + `17b-presentation-blocked`: nenhum passo, carga ou alvo visível
- [ ] Variantes de dado ausente fecham o espaço (sem traço, sem zero)

## C5 · [C] Onboarding com Cuidados, elegibilidade e "fora do escopo"
fields: type=Feature; area=iOS Frontend; front=C; priority=P0; release=V1; status=Backlog
deps: C4

### Objetivo
Fluxo de cadastro que produz `OnboardingAnswers` com `specialPopulation` sempre presente (`[]` quando nenhum) e `EligibilityScreen` (sem resposta = nil, nunca `false`); tela 81 "Plano indisponível" para `planOutcome.outsideV1Scope`.

### Critérios de aceite
- [ ] O JSON produzido é igual ao dos tipos compartilhados (asserção sobre `encoded`)
- [ ] Gestação/pós-parto → tela de plano indisponível (fixtures `special-*`)
- [ ] Textos clínicos/jurídicos marcados `INTERIM`

## C6 · [C] Hoje e o "Começar" condicionado a Startability
fields: type=Feature; area=iOS Frontend; front=C; priority=P1; release=V1; status=Backlog
deps: C4

### Critérios de aceite
- [ ] "Começar" desligado para toda razão de `NotStartableReason` (handoff C §8.4)
- [ ] Sinais do relógio ocultos (`notInV1`); Apple Saúde só por `HealthIngestStatusSource`, nunca "negado"

## C7 · [C] Plano: semana, fases e mover treino por proposta
fields: type=Feature; area=iOS Frontend; front=C; priority=P1; release=V1; status=Backlog
deps: C4

### Critérios de aceite
- [ ] Semana/fases só de `weekPlan`
- [ ] Mover treino: gesto → `ReviewRequest.unavailableDays([origem])` → proposta → `accept`; a UI nunca escolhe o destino (GAP-09)

## C8 · [C] RunRecorder (gravador de corrida sem UI)
fields: type=Feature; area=RunRecorder; front=C; priority=P0; release=V1; status=Ready
deps:

### Objetivo
Pacote `ios/Packages/RunRecorder`: CoreLocation, cronômetro das etapas de `runSession(for:)`, pausa/retomada, background location, arquivo temporário seguro e retomada após a morte do processo. Não depende do Figma.

### Critérios de aceite
- [ ] Com localização simulada: segue as etapas; pausa/retoma; mata e retoma (handoff C §8.7)
- [ ] Ao terminar: relato `plannedRun`/`unplannedRun` com minutos, RPE, resposta, `observedAt` com offset, e `AppRecordedRunRef`
- [ ] Nenhuma distância, ritmo ou coordenada medida pelo iPhone chega a um relato ou sai do pacote
- [ ] Estados de localização (não pedida, negada, sem sinal, precisão ruim) visíveis e não bloqueiam a corrida por tempo

### Testes necessários
`swift test` do pacote (`swift-packages.sh --fronts=test`); GPS real só pela trava `swiftui`.

## C9 · [C] Execução da corrida e da musculação
fields: type=Feature; area=Strength; front=C; priority=P1; release=V1; status=Backlog
deps: C6, C8

### Critérios de aceite
- [ ] Passos de corrida só de `PresentationSnapshot.runSession(for:)`; sob hold, nenhum passo
- [ ] Força: carga só de `prescription.load`, sem número sugerido (GAP-10); "Anterior" de `loggedEntries`
- [ ] Corrida avulsa: pergunta obrigatória "Parou ou sentiu algo fora do normal?"; "sim" abre o fluxo 72 com `eligibility`
- [ ] "Salvo" só por `WriteOutcome.kept`

## C10 · [C] Histórico, Perfil e zonas de FC (HR5)
fields: type=Feature; area=iOS Frontend; front=C; priority=P1; release=V1; status=Backlog
deps: C4

### Critérios de aceite
- [ ] Histórico só de `loggedEntries`: medida × declarada × contestada separadas; todas as vozes em linha `conflicted`
- [ ] Z1–Z5 só de `heartRateFiveZones.zones`, com origem; telas de máxima informada e limites (validação = resposta do motor); SSCTR C1–C11
- [ ] "Tempo por zona" completo e oculto (`SERIES_CHANNEL_NOT_REVIEWED`)

## C11 · [C] Validação visual Figma × simulador das telas da V1
fields: type=Test; area=UX/UI; front=C; priority=P1; release=V1; status=Backlog
deps: C2

### Objetivo
Para cada tela implementada: registro em `audits/v1-ios-swiftui-2026-11-26/visual/` pelo procedimento `docs/engineering/VISUAL_VALIDATION.md` (nó do Figma, screenshot do simulador, PT-BR/EN/ES, claro/escuro, texto grande, diferenças).

### Critérios de aceite
- [ ] `node tools/orchestration/visual.mjs verify` sem pendências para as telas entregues
- [ ] Nenhuma tela declarada fiel sem screenshot do app rodando

## I1 · [Integração] Branch de integração, workspace e raiz de composição
fields: type=Infrastructure; area=DevOps; front=Integration; priority=P1; release=V1; status=Backlog
deps: C1

### Objetivo
Criar `claude/v1-ios-integration` a partir da base vigente, com `ios/RepMile.xcworkspace` e `ios/App/Composition/**`, e merge (sem rebase, sem force) das primeiras entregas prontas de A, B e C.

### Critérios de aceite
- [ ] Cada frente integrada passa `guard.mjs` na sua coluna
- [ ] Ruleset da branch: check `CI` obrigatório, PR obrigatório, sem force-push e sem exclusão; revisão de code owner e descarte de aprovações obsoletas assim que #29 decidir a identidade dos agentes

## I2 · [Integração] Portas reais no lugar dos provedores de fixture
fields: type=Feature; area=iOS Frontend; front=Integration; priority=P1; release=V1; status=Backlog
deps: I1, T-A, T-B

### Objetivo
Ligar `CoachingHost` como `CoachingReading`/`CoachingWriting`/`TimeInZoneClassifying`/`DeviceActivitySink` e `HealthKitIngest` como `DeviceQueueControl`/`HealthIngestStatusSource` (contrato §13.4).

### Critérios de aceite
- [ ] Build integrado verde no simulador
- [ ] Testes de contrato com as implementações reais (mesmas formas das fixtures)

## I3 · [Integração] Primeiro onboarding real com CoachingHost e persistência
fields: type=Test; area=CoachingCore; front=Integration; priority=P1; release=V1; status=Backlog
deps: I2, C5

### Critérios de aceite
- [ ] XCUITest: cadastro → plano criado pelo motor real → Hoje mostra a sessão
- [ ] Fechar e reabrir o app: o mesmo plano, sem perda (registro selado)
- [ ] Restart fora de escopo: nenhuma sessão `.startable` (FND-ABC-04) na UI integrada

## I4 · [Integração] Jornadas ponta a ponta em XCUITest
fields: type=Test; area=iOS Frontend; front=Integration; priority=P1; release=V1; status=Backlog
deps: I3, C9, C10

### Critérios de aceite
- [ ] Hoje → executar corrida (localização simulada) → relato → histórico
- [ ] Executar força → "salvo" por `kept` → "Anterior" na próxima sessão
- [ ] "Não estou 100%" com sinais da condição → bloqueio/liberação conforme o motor

## I5 · [Integração] Validação no iPhone pela trava (fim a fim)
fields: type=Test; area=HealthKit; front=Integration; priority=P1; release=V1; status=Backlog
deps: I2

### Objetivo
Contrato §13.5, sessão `integration` de `tools/device-lock/with-device.sh`: HealthKit ao registro, background delivery com o app fechado, extensão + lock entre processos (SEC-FPV-03), reconciliação de reinstalação, equivalência do bundle.

### Critérios de aceite
- [ ] Cada item com evidência marcada `target=device` (nunca misturada com simulador)
- [ ] Nenhum dado de saúde real em log ou no repositório

## I6 · [Integração] Decidir as propostas de contrato (CCP-*) e publicar nova base
fields: type=Infrastructure; area=DevOps; front=Integration; priority=P1; release=V1; status=Backlog
deps:

### Objetivo
Contrato §11: decidir as `CONTRACT_CHANGE_PROPOSALS.md` de A/B/C (já previstas: `pendingWeek`, sinais de check-in multi-condição), atualizar o contrato, subir `CoachingContract.version`, regenerar fixtures, publicar `v1-abc-base-<n>-<data>`.

### Critérios de aceite
- [ ] Os três `swift test` + `npm test` verdes na nova base
- [ ] Cada frente traz a base por ff/merge, nunca rebase

## O1 · [Integração] Ativar templates, CI e quadro na branch padrão
fields: type=Infrastructure; area=DevOps; front=Integration; priority=P1; release=V1; status=Backlog; approval=founder
deps:

### Objetivo
O GitHub só usa templates de issue/PR da **branch padrão** (`r7/decision-authority-closure-base`). Decidir como levar `.github/` até ela (ou trocar a branch padrão), sem merge não autorizado.

### Critérios de aceite
- [ ] Decisão do fundador registrada
- [ ] "New issue" mostra os quatro formulários; PR novo vem com o template

## O2 · [Integração] Teste do agent-runtime falhando na base (74/75)
fields: type=Bug Fix; area=DevOps; front=Integration; priority=P2; release=V1; status=Backlog
deps:

### O que acontece
`node --test tools/agent-runtime/tests/*.test.mjs` na tag `v1-abc-ready-2026-11-26`: 74/75; falha "a hook planted in the repository does not run when the supervisor creates a Codex worktree" (Mac mini, macOS 27.0). Por isso o suíte não é gate obrigatório do CI ainda.

### Critérios de aceite
- [ ] Causa identificada (ambiente × defeito de segurança); se for defeito de segurança, prioridade P0
- [ ] Suíte verde e incluído no CI

## D1 · [Decisão] DR-121: gravar a corrida do iPhone no Apple Saúde
fields: type=Research; area=HealthKit; front=B; priority=P2; release=V1.1; status=Backlog; approval=founder
deps:

### Objetivo
Decisão FDR + SEC (OPEN_PRODUCT_DECISIONS #1). Default da V1: não grava; "medido pelo iPhone · não usado pelo plano". Com (b), a distância do iPhone entra no plano pelo canal DEVICE.

## D2 · [Decisão] Sinais do relógio e FC do HealthKit (GAP-17, C10)
fields: type=Research; area=HealthKit; front=B; priority=P2; release=V1.1; status=Backlog; approval=founder
deps:

### Objetivo
Decisões FDR + SEC (+ SSCTR C10): sono/VFC/FC de repouso só exibição; permissão de FC para "Tempo por zona". OPEN_PRODUCT_DECISIONS #2 e #3. Default da V1: ocultos.

## D3 · [Decisão] FND-ABC-06: contagem dupla de corrida digitada × treino do relógio
fields: type=Bug Fix; area=CoachingCore; front=Integration; priority=P1; release=V1; status=Backlog; approval=founder
deps:

### Objetivo
Contrato §12: corrida avulsa digitada + treino do relógio no mesmo horário viram duas linhas no motor. Decisão Core + SSCTR + B (dedupe de relato manual, ou voz do aparelho). Mudança no motor só por emenda versionada.

## D4 · [Decisão] GAP-36: altura e peso no onboarding
fields: type=Design; area=UX/UI; front=Design; priority=P2; release=V1; status=Backlog; approval=founder
deps:

### Objetivo
OPEN_PRODUCT_DECISIONS #4 (FDR + SEC): retirar a tela por minimização ou manter como dado local. Tela inalterada até a decisão.

## D5 · [Decisão] GAP-13: excluir relato ou remover treino importado
fields: type=Feature; area=CoachingCore; front=A; priority=P3; release=V2; status=Backlog; approval=founder
deps:

### Objetivo
OPEN_PRODUCT_DECISIONS #6: hoje `[FUTURO]`; exige operação de fronteira revisada (A + Core). Ações "Excluir" ocultas na V1.

## D6 · [Decisão] Backend: conta, assinatura de servidor, sincronização e backup
fields: type=Feature; area=Backend; front=Integration; priority=P2; release=V2; status=Backlog; approval=founder
deps:

### Objetivo
Fora da V1 local (handoff C §9–§10; D1 servidor de tempo, D2 backup, OPEN-5 semana sincronizada). Escopo, fornecedor e privacidade são decisões do fundador.

## O3 · [Integração] Identidade própria para os agentes no GitHub
fields: type=Infrastructure; area=DevOps; front=Integration; priority=P1; release=V1; status=Backlog; approval=founder
deps:

### Objetivo
Hoje os agentes fazem push e abrem PRs com a conta do fundador. O GitHub não deixa o autor aprovar o próprio PR, então a revisão exigida de code owner (a defesa contra um PR que altere o próprio workflow ou o guard) ou fica impossível de cumprir ou precisa de um bypass que os agentes também teriam. Decidir: conta de máquina ou GitHub App para os agentes, com o fundador como code owner.

### Critérios de aceite
- [ ] Decisão do fundador registrada
- [ ] Agentes publicam com a identidade nova; o fundador aprova PRs de `.github/`, `tools/orchestration/`, contratos e CoachingCore
- [ ] Ruleset da branch de integração: check `CI`, PR, revisão de code owner, aprovações obsoletas descartadas
