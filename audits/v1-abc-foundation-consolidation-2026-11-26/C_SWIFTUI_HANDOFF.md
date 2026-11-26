# Handoff C — SwiftUI (V1, base `v1-abc-ready-2026-11-26`)

## 1. Missão e objetivo

Implementar o aplicativo iPhone definitivo do **RepMile** a partir do Figma aprovado, **sem redesenho**: navegação, design system, componentes, todas as telas e estados, onboarding, Hoje, Plano, Histórico, Progresso, Perfil e ajustes, gamificação V1 aprovada, shareables, paywall (StoreKit 2 local), notificações, Live Activity, motion prioritário e a sessão de corrida no iPhone, mais o gravador da corrida (`RunRecorder`, sem UI). Na fase paralela, tudo roda sobre **provedores de fixture** que implementam as portas compartilhadas. C não implementa CoachingHost, HealthKit nem regra esportiva.

## 2. Branch, diretório, baseline

| Item | Valor |
|---|---|
| Branch | `claude/v1-ios-swiftui` (criada na tag nesta missão) |
| Worktree | `/Users/gabrieldecarvalhomaciel/.codex/worktrees/myapp-v1-ios-swiftui/MyApp` |
| Base | tag `v1-abc-ready-2026-11-26` |
| Trava | sessão `swiftui`; `-derivedDataPath <worktree>/ios/.build/DerivedData-C` |
| Bundle id | `fit.vilumo.repmile.dev.app.$(DEVELOPMENT_TEAM)` (o da loja é decisão do FDR); `DEVELOPMENT_TEAM` só na linha de comando |
| Figma | `90oyvXHxxBQAvr1netov7S`, node de entrada `835-2069` (nome histórico do arquivo; o produto é RepMile) |

Primeiro passo:

```bash
cd /Users/gabrieldecarvalhomaciel/.codex/worktrees/myapp-v1-ios-swiftui/MyApp
git status --short && git merge-base --is-ancestor v1-abc-ready-2026-11-26 HEAD && echo BASE_OK
(cd ios/Packages/IntegrationContracts && swift test)                 # 10, 0 falhas
(cd ios/Packages/CoachingPresentation && swift test)                 # 29, 0 falhas (inclui frescor das fixtures)
ls ios/Packages/CoachingPresentation/Tests/CoachingPresentationTests/Fixtures | wc -l   # 100 (99 capturas + INDEX.json)
```

## 3. Autoridade (nesta ordem)

1. Contrato paralelo **rev. 2** §2 (dependências), §10 (diretórios), §11 (mudança de contrato), §14–§15.
2. Este diretório: `SHARED_CONTRACTS_REPORT.md`, `OWNERSHIP_MATRIX.md`, `FIGMA_FUNCTIONAL_ALIGNMENT.md`, `SECURITY_SCHEMA_VALIDATION.md`, `HR5_INTEGRATION_REPORT.md` §2, `INDEPENDENT_REVIEW.md` (condições SSCTR-ABC-S1..S5).
3. `ios/Packages/CoachingPresentation/**` e `ios/Packages/IntegrationContracts/**`: os únicos tipos que você consome.
4. `audits/v1-ui-functional-reconciliation/SWIFTUI_IMPLEMENTATION_HANDOFF.md` §4 (fluxos), §5 (componentes), §8 (fixtures), §9 (aceite visual), §10 (aceite funcional), §11 (limites sem backend), §13 (proibições): **continuam valendo**; §1, §2, §6, §7, §12 são substituídos por este documento.
5. `UI_CAPABILITY_TRACEABILITY.md`, `UI_DATA_STATES.md`, `UI_CONTRACT_GAPS.md` (com os estados novos de `FIGMA_FUNCTIONAL_ALIGNMENT.md` §1), `figma-inventory/`.
6. `audits/v1-hr5-runna-parity-2026-11-25/CONTRACT_DELTA.md` §3 linha "UI (C)": condições SSCTR C1–C11 das zonas.

## 4. Escopo e regras de dados

| Tema | Regra |
|---|---|
| Leituras | só `CoachingReading` (fixture provider na fase paralela). O provedor de fixture **apenas reproduz** arquivos de `Fixtures/` (pode combiná-los por cenário); nunca escreve JSON de resposta à mão |
| Escritas | só `CoachingWriting` com os requests fechados (`OnboardingAnswers`, `ReviewRequest`, `HeartRateProfileRequest`); o dublê de escrita devolve fixtures. A UI nunca define id, versão ou ator |
| "Começar" | só `Startability == .startable` (inclui SEC-FPV-01, triagem pendente, relógio, R7-B0, `outsideV1Scope`, `clinicalHumanRequired`) |
| Passos de corrida | só `PresentationSnapshot.runSession(for:)` (FND-ABC-05); sob hold, nenhum passo |
| Estados | `ClientState` e `error.code` → tela (handoff HO §7); `unrecognized` falha fechada; `planOutcome.outsideV1Scope` → 81 "Plano indisponível · sinal informado no cadastro" (cadastro **e** restart) |
| Onboarding · Cuidados | "Gestação atual ou parto nos últimos 12 meses" → `specialPopulation` (obrigatório: `[]` quando nenhum); as seis flags → `EligibilityScreen` (sem resposta = nil, nunca `false`) |
| Sinais de alerta | pedir `warningSignSet(condition:)` e perguntar **exatamente** aqueles (9/13/15); `SignAnswers` recusa sinal não perguntado; "Sem resposta não conta como não" |
| Corrida avulsa (SSCTR-ABC-S1) | pergunta obrigatória "Parou ou sentiu algo fora do normal?" (sem resposta ≠ não); "sim" abre na hora o fluxo 72 "Não estou 100%" com `eligibility` junto; o relato da corrida é salvo à parte; se o atleta sair sem responder, A bloqueia a próxima sessão (`screenRequired`). Não pedir ao atleta que chame o sintoma de "leve"; nunca dizer que está liberado para treinar |
| Histórico | só `loggedEntries`: distâncias medida × declarada × contestada separadas; linha `conflicted` (ou com mais de uma voz do atleta) mostra **todas as vozes** (cada uma com feito, minutos e parada; o topo da linha traz só a primeira voz do atleta); `unplannedMerge` → "não foi salvo como sessão separada", com reenvio no próprio horário; "salvo" só por `WriteOutcome.kept` |
| Zonas de FC | Z1–Z5 só de `heartRateFiveZones.zones` (`minBpm…maxBpm`), com a origem (estimada/informada/medida) e "você pode informar a sua"; telas reais de máxima informada e de limites (validação = resposta do motor, `fields`); SSCTR C1–C11; nomes neutros, nunca "Limiar/Anaeróbico" |
| Tempo por zona | componente completo e **oculto** (`Availability.unsupported("SERIES_CHANNEL_NOT_REVIEWED")`); quando aberto, rótulo "com suas zonas atuais", aviso óptico e sensor sempre visíveis, sem gráfico parcial |
| Força | carga só de `prescription.load` (KNOWN / FROM_LOG / ESTABLISH / BODYWEIGHT / RETURN), sem número sugerido na sessão (GAP-10); "Anterior" de `loggedEntries` |
| Mover treino | gesto → `ReviewRequest.unavailableDays([origem])` → proposta → `accept`; nunca destino escolhido pela UI (GAP-09) |
| Apple Saúde | estado e importados só por `HealthIngestStatusSource` (de B, dublê na fase paralela); nunca "negado"; força importada "só a duração" |
| Sinais do relógio (sono, VFC, FC repouso) | ocultos (`HealthSignalAvailability.notInV1`) |
| Textos | tabela de cópia por código em PT-BR, EN, ES; texto do motor em inglês nunca na tela; clínicos/jurídicos marcados `INTERIM` |

## 5. `RunRecorder` (pacote sem UI, de C)

- CoreLocation + cronômetro das etapas de `runSession(for:)` (tempo/distância como o motor prescreve; nunca converter um no outro), pausa e retomada, background location, Live Activity sem dado de saúde.
- Estados de localização: não pedida, negada pelo sistema, sem sinal, precisão ruim (todos visíveis e não bloqueiam a corrida por tempo).
- Arquivo temporário seguro (`completeUntilFirstUserAuthentication`, escrita atômica) e **retomada depois da morte do processo**.
- Ao terminar: o relato do atleta (`plannedRun`/`unplannedRun` com minutos, RPE, resposta; `observedAt` = fim, com offset) e um `AppRecordedRunRef` em `AppRecordingIndex`.
- Distância, ritmo, parciais e rota medidos pelo iPhone ficam **locais**: resumo "medido pelo iPhone · não usado pelo plano", mapa e compartilhamento (rota oculta por padrão, GAP-29); **nunca** em `declaredDistanceKm`; nenhuma coordenada sai do pacote; tudo apagado com a conta.
- Sem HealthKit, sem JavaScriptCore.

## 6. Entregáveis

`ios/Packages/RepMileUI/**`, `ios/Packages/RunRecorder/**`, `ios/App/RepMile.xcodeproj` + `ios/App/RepMile/**`, `audits/v1-ios-swiftui-2026-11-26/{FINAL_REPORT.md,results/,CONTRACT_CHANGE_PROPOSALS.md}`.

## 7. Dependências

- **De A e B: nenhuma para começar.** Os provedores de fixture e os dublês ficam em `RepMileUI` (ou num alvo de previews), atrás das portas.
- Falta tipo, estado ou fixture: proposta `CCP-C-NN` (contrato §11); adaptador local enquanto isso; nunca tipo paralelo. Itens já previstos para A: `pendingWeek` (força da proposta), conjunto de sinais de check-in multi-condição.

## 8. Testes obrigatórios

1. Cada fixture renderizada por ao menos uma tela ou preview sem crash (teste que percorre `INDEX.json`).
2. Snapshot/preview por linha de `UI_DATA_STATES.md` §3 (disponível, parcial, sem dados, indisponível, oculto, bloqueado).
3. Estados `BLOCKED`, `NEEDS_INPUT`, `PENDING_CONFIRMATION`, `RETURNING`, `NO_DATA`, `OPERATIONAL_ERROR`, `INTEGRITY_FAILURE`, `unrecognized`: cada um com sua tela; nenhum mostra plano vazio ou "dia de descanso".
4. "Começar" desligado para toda razão de `NotStartableReason`.
5. Sob `17-plan-blocked` + `17b-presentation-blocked`: nenhum passo, nenhuma carga, nenhum alvo visível.
6. Formulários: o JSON produzido pelos fluxos de onboarding, avulsa, "Não estou 100%", prontidão e perfil de FC é igual ao dos tipos compartilhados (asserção sobre `encoded`), com `specialPopulation` sempre presente.
7. `RunRecorder` com localização simulada: segue as etapas; pausa/retoma; mata e retoma; nenhuma distância medida chega a um relato.
8. Acessibilidade: Dynamic Type, VoiceOver nos componentes de dados, contraste do design system; PT-BR, EN, ES.
9. `swift test` dos dois pacotes compartilhados verde; `git diff --stat v1-abc-ready-2026-11-26 -- CoachingCore ios/Packages/IntegrationContracts ios/Packages/CoachingPresentation` vazio.

**iPhone** (trava `swiftui --wait`): instalação do app de desenvolvimento, sessão de corrida com GPS real (sem enviar nada ao motor), Live Activity, performance de rolagem e animações prioritárias.

## 9. Restrições

- Sem `import HealthKit`, `JavaScriptCore`, `CryptoKit`, `Security`, `CoachingHost`, `HealthKitIngest`; `CoreLocation` só em `RunRecorder`.
- Sem cálculo de zona, sinal, carga, ritmo-alvo, estimativa ou regra; sem segunda cópia do registro (G07).
- Sem backend, sem conta real, sem compra em produção; sem editar o Figma.
- Proibidos os caminhos de A, B, integração e governança (contrato §10).

## 10. Quality gates, encerramento e integração

- Encerramento: §8 com logs em `results/`; diff só em caminhos de C; greps de imports proibidos vazios; revisão independente (QRE + Product/UX; SSCTR para as cópias de FC, sinais e avulsa).
- **Físico nesta frente:** app no aparelho, GPS real, Live Activity.
- **Só na integração final:** dados reais de A e B no lugar das fixtures, HealthKit fim a fim, dedupe com B, assinatura com servidor, conta e sincronização (backend), textos clínicos/jurídicos finais.
- **REAL_ATHLETE_READY = NO.**
