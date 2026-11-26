# Alinhamento funcional com o Figma aprovado

**Arquivo:** `90oyvXHxxBQAvr1netov7S` (nome histórico "Vilumo · Hoje e Plano — estilo Pierre (proposta)"; produto **RepMile**), node de entrada `835-2069`. **Não redesenhar.**

**Edição do Figma nesta missão: nenhuma.** A sessão não tem acesso de edição autenticado ao arquivo, e nada abaixo exige mudança de composição. Os ajustes de texto/estado ficam registrados com o node exato para a frente C aplicar no código (e, se o Founder quiser, no Figma depois). A base é a rastreabilidade já feita (`audits/v1-ui-functional-reconciliation/UI_CAPABILITY_TRACEABILITY.md`, 154 linhas, 588 telas; `UI_CONTRACT_GAPS.md`, 37 gaps); este documento registra **o que mudou** com esta consolidação e com as cinco zonas.

## 1. Gaps cujo estado mudou

| Gap | Antes (2026-11-24) | Agora | Contrato / ação de C |
|---|---|---|---|
| **GAP-37** zonas de FC | 3 zonas, só cinta/lab; Figma Z1–Z5 e "máxima informada" ocultos | **SUPORTADO**: Z1–Z5 para toda idade válida sem relógio (HR5R), máxima informada e limites personalizados reais | `HeartRateFiveZones`; telas 71 (`… zonas aproximadas pela máxima informada`, `… cinta`, `… laboratório`, `… sem zonas`) usam a variante pelo `reference.kind`/`status`. **A proposta antiga "trocar Z1–Z5 por baixa·moderada·alta" está REVOGADA.** Condições SSCTR C1–C11 na cópia |
| GAP-37 · 50 "Tempo por zona" | FUTURE_ONLY | **FUTURE_ONLY, contrato pronto**: série de B + classificador do motor, portão `SERIES_CHANNEL_NOT_REVIEWED` | componente completo e oculto (`Availability.unsupported`) até C10 |
| **GAP-02** gestação/parto | perdido pela lista fechada | **FECHADO** no contrato (chave obrigatória, provada ponta a ponta) | 10 · 27 Cuidados `836:3299` → `specialPopulation`; resposta → 81 "Plano indisponível · sinal informado no cadastro". No `restart`: FND-ABC-04, a mesma tela + nada iniciável |
| **GAP-03** sinais 9/13/15 | dependia de projeção de A | **FECHADO**: `warningSignSet(condition)` | 72 `843:1751` / `843:1980`: as três contagens são variantes do mesmo componente; nunca enviar sinal não perguntado |
| **GAP-06** histórico pobre | dependia de projeção | **FECHADO**: `loggedEntries` | 50, 60, 82: séries, cargas, distâncias (medida × declarada), vozes; "Anterior" em 41 vem daí |
| **GAP-07** fases e volume | dependia de projeção | **FECHADO**: `weekPlan` | 30 `596:2125` "Fases até a prova · minutos por semana" com os números do motor |
| GAP-08 força da proposta | dependia de `pendingWeek` | **A FAZER (A)**; corridas da proposta já em `presentation().pending` | 30 `597:1542`, `597:1909`: sem a projeção, a folha mostra só a razão e as corridas |
| **GAP-12** força avulsa | `UNVERIFIED` | **SUPORTADO com regra**: `observedAt` obrigatório; "salvo" só por `WriteOutcome.kept` | 41 "Força avulsa", 50 `684:4381`, 72 "treino avulso salvo" |
| **GAP-16** corrida só com iPhone | sem dono | **dono definido** (C, `RunRecorder`); distância do iPhone **não** vai ao registro até DR-121 | 40 (GPS ao vivo ok), 50 `880:20729` "leve, só com o iPhone": o resumo mostra o medido localmente com o rótulo "medido pelo iPhone · não usado pelo plano"; mapa/compartilhar com a rota local (GAP-29) |
| GAP-18 força importada | dependia de CHG-UI-3 | **FECHADO** no contrato (`ImportedWorkoutSummary`) | 50 `684:4890`, 60 `730:1109`: "registrado no Apple Saúde · só a duração" |
| GAP-04 "Começar" | `startability` proposta | **contrato pronto**; A implementa as regras (SEC-FPV-01, triagem, D1, R7-B0, **fora de escopo**) | 20, 31, 40/41 |
| FND-ABC-05 (novo) | — | passos de corrida só por `runSession(for:)` | 31/40 sob hold: nenhum passo, nenhum alvo |
| FND-HR5-01 | — | evidência declarada depois do cadastro não entra | 71 "registrar resultado de prova/teste" fora do cadastro → `UNSUPPORTED_V1` (oculto); no cadastro, via `performanceAnchors` |
| FND-ABC-02 (novo) | — | corrida avulsa não leva parada | 40 "corrida avulsa · parar por sintoma": abrir o fluxo 72 "Não estou 100%" com os sinais do motor |

## 2. Verificação pedida pela missão

| Tema | Estado na V1 | Origem |
|---|---|---|
| Campos que o motor não fornece | ocultos, nunca inventados (`Availability.unsupported/missing`) | `UI_DATA_STATES.md` |
| Métricas dependentes de HealthKit | distância medida e treinos importados: sim; FC repouso/VFC/sono: `notInV1` até FDR + SEC | `HealthSignalSource` |
| Métricas dependentes de GPS | ao vivo e no resumo local; não no registro | `RunRecorder` |
| Sem wearable | plano, execução, força, histórico, zonas estimadas, progressão por ritmo/duração/esforço | `OWNERSHIP_MATRIX.md` §3 |
| Sem histórico | estados vazios do motor (`NOT_ENOUGH_HISTORY`, `Indisponível, por enquanto`) | fixtures `12-…` |
| Bloqueios clínicos | `BLOCKED` sem prescrição nem passos; só a prontidão | fixtures `17*`, `actions-E2`, `actions-F3` |
| Zonas estimadas e personalizadas | Z1–Z5 do motor | §1 |
| Detalhes de atividades | `loggedEntries` + `execution` + `RunRecorder` local | `OWNERSHIP_MATRIX.md` §2 |
| Gráficos | só números do motor ou do registro; nada calculado como regra | GAP-27/28 (APP_IMPLEMENTATION: contagens e recordes do registro) |
| Calendário, mover/reagendar | "não posso neste dia" → proposta → confirmar (GAP-09); destino escolhido = V2 | `ReviewRequest.unavailableDays` |
| Prescrição de cargas | só `prescription.load` (KNOWN/FROM_LOG/ESTABLISH/BODYWEIGHT/RETURN); sem número sugerido na sessão (GAP-10) | `PrescribedLoad` |
| Indicadores preditivos | `runForecast` (cenário do plano), estimativas faixa-primeiro; projeção UNAVAILABLE | `Readings` |
| Dependentes de backend | conta, login, assinatura de servidor, sincronização, backup (GAP-31/32/33): fora da fase paralela | — |

## 3. Ajustes de texto para C (não aplicados no Figma)

Os de `FINAL_RECONCILIATION_REPORT.md` §7 continuam valendo (GAP-23, 11, 10, 9, 19, 24, 05), **exceto GAP-37 "baixa · moderada · alta", revogado**. Novos:

| Tela / node | Ajuste |
|---|---|
| 50 `880:20729` "só com o iPhone" | rótulo das métricas do iPhone: "medido pelo iPhone · não usado pelo plano" (até DR-121) |
| 71 zonas | a origem da referência sempre visível (estimada pela idade / informada / medida) e "você pode informar a sua" (SSCTR C3) |
| 81 plano indisponível | variante também para o `restart` com gestação/pós-parto (FND-ABC-04) |
| 41/50 avulsa | "salvo" só depois de `kept`; se `notKept`, manter o rascunho e oferecer reenviar |

Nenhum destes ajustes exige nova exploração visual; nenhum muda composição, tipografia, cor, hierarquia ou componente.
