# Figma node changelog: final functional alignment V1

**File:** `90oyvXHxxBQAvr1netov7S` ([link](https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/Vilumo-%C2%B7-Hoje-e-Plano-%E2%80%94-estilo-Pierre--proposta-?node-id=835-2069)). Edited in place on 2026-11-26 through the Figma MCP (`use_figma`). Every ID below was returned by the write call that changed it. Nothing was created in another file and no page was duplicated.

**Legend**
- **TEXT**: the copy changed. The style is kept (insertion in the same range).
- **HIDE**: `visible = false`. The node still exists.
- **GEOM**: the bar path or position was recomputed from the engine's bpm values.
- **NEW**: a new frame, cloned from an approved frame on the same page.
- **TAG**: a suffix on the frame name (`[FUTURO · fora da V1]`, `[V1: …]`).
- **ANN**: a Dev Mode annotation with the contract mapping. It is not visible on the canvas.

"+twin" means the identical edit was applied to the copy in the Motion row.

## 71 · Prova (`551:14`): HR5, five zones

| Frame | Kind | Nodes | Why |
|---|---|---|---|
| `760:1484` Frequência cardíaca · máxima informada (Lucas) +twin `785:5601` | TEXT | `760:1517`, `760:1526`, `760:1528`, `760:1539`, `760:1541`, `760:1552`, `760:1554`, `760:1565`, `760:1567`, `760:1578`, `760:1580`, `760:1588`, `760:1593`, `760:1594`, `760:1606`, `760:1607` (twin: `785:5620`…`785:5708`) | The percentages were 60/70/80/90. The engine uses 65/81/89/97, so the 188 bpm example is now ≤122 · 123–152 · 153–167 · 168–182 · ≥183. The copy said "o app nunca cria zonas a partir da idade", which is now false. The lab row became "Personalizar os limites das zonas", because lab entry after onboarding is `UNSUPPORTED_V1` (FND-HR5-01). The cue names Z4/Z5 (SSCTR C4/C8). |
| same | GEOM | `760:1532`, `760:1545`, `760:1558`, `760:1571`, `760:1584` (twin: `785:5635`, `785:5648`, `785:5661`, `785:5674`, `785:5687`) | The zone bars sit at the real bpm positions on the 90–188 axis. |
| same | ANN | `760:1484` | `ATHLETE_DECLARED_MAXIMUM`, writes, SSCTR. |
| `760:1611` Máxima observada com cinta +twin `785:5837` | TEXT, structure | Zone list `760:1647`: the 3 rows Baixa/Moderada/Alta were removed (`760:1648`, `760:1660`, `760:1661`, `760:1673`, `760:1674`). 5 Z1–Z5 rows were cloned from the approved Lucas component (`1102:3667`…`1102:3730`). In the twin, `785:5859` got `1102:3731`…`1102:3830`. Also `760:1641`, `760:1644`, `760:1689`. | The three bands are **revoked**. The five engine zones for 186 bpm are ≤120 · 121–150 · 151–165 · 166–180 · ≥181. The copy now says the strap maximum applies only when it is above the age estimate and can be below the true maximum. The pill reads "Aproximadas". |
| same | ANN | `760:1611` | `OBSERVED_MAXIMUM`, `notUsed`, C1/C2. |
| `760:1693` Valores de laboratório +twin `785:6010` | TEXT, HIDE | `760:1726` (twin `785:6029`); actions `760:1757` hidden (twin `785:6060`) | Lab values do not become zones; a lab maximum does. "Corrigir/Remover valores" after onboarding is `UNSUPPORTED_V1`. |
| `845:4225` Sem zonas (Rafa) +twin `846:7540` | TEXT, HIDE, rename | `845:4251`, `845:4257`, `845:4258`, `845:4265`, `845:4266`, `845:4282`, `845:4283`; row `845:4271` and divider `845:4270` hidden (twin `846:7561`…`846:7587`) | Before, the screen said zones required a strap or a lab. Now it shows the real reasons: no valid age or maximum, or a hold. The exits are "informar FC máxima" and "personalizar limites". |
| **NEW** `1102:4302` Zonas estimadas pela idade, sem relógio (padrão da V1, 30 anos) | NEW, ANN | Clone of `760:1484` at x=5676 in the same row | This is the **V1 default state**, and it was missing. It shows `AGE_ESTIMATE` 30 years → 190 bpm (≤123 · 124–153 · 154–169 · 170–184 · ≥185), which matches the `hr5r-age30-presentation` fixture. It carries the C3 disclosure and "você pode informar a sua". |
| **NEW** `1102:4428` Limites personalizados pelo atleta (Lucas) | NEW, ANN | Clone of `760:1484` at x=6149; values aligned to `hr5r-custom-presentation` (130 · 150 · 165 · 180) | This shows the `ATHLETE_CUSTOM` state, with null percentages and "Voltar ao padrão". |

## 10 · Onboarding (`551:5`)

| Frame | Kind | Nodes | Why |
|---|---|---|---|
| `836:782` 14 O que você usa na corrida +twin `868:5788` | TEXT | `836:829`, `868:5813` | "Nunca a idade" is now false. The new copy says the zones are estimated from your age without a watch. |
| `838:4053` Fora do que esta versão atende +twin `839:14587` | TEXT, ANN | `838:4099`, `839:14621` | "nada foi enviado" was inaccurate, because `specialPopulation` is sent to the engine. |
| **NEW** `1103:2299` Fora do que esta versão atende · ao refazer o cadastro, com plano anterior | NEW, ANN | Clone of `838:4053`; `1103:2330`, `1103:2331`, `1103:2333` | **FND-ABC-04 (P0).** After a restart that declares pregnancy or postpartum, the earlier plan does not start. There is no "Começar". |
| `836:3299` 27 Cuidados | ANN | — | `specialPopulation` / `EligibilityScreen`. No answer is never `false`. |
| `836:2649` 19 Altura e peso | ANN | — | Pending decision GAP-36. |

## 20 · Hoje (`551:6`)

| Frame | Kind | Nodes | Why |
|---|---|---|---|
| `575:1172` Pergunta rápida +twin | TEXT, ANN | `575:1230`, `582:3654` | GAP-11. The question no longer promises the outcome. |
| `572:203`, `880:4257`, `880:4841` Dia duplo · manhã +twins | TEXT | `572:228`, `581:2618`, `880:4270`, `880:4430`, `880:4854`, `880:5014` | GAP-23. The sentence about leg readiness gave a reason the engine does not give. |
| "Hoje / Descanso planejado" +twin (frame ID not captured; the text nodes are) | TEXT | `572:1171`, `581:4368` | Same reason (GAP-23). |
| `572:1379` Longão mantido após noite curta | TAG, ANN | — | FUTURO: this state depends on sleep data. |
| `508:69`, `544:1797`, `572:203`, `572:432`, `572:675`, `575:1172`, `575:1671`, `575:701`, `576:2580`, `576:2773`, `576:2960`, `880:4841`, `880:4257` | ANN | — | Sleep and HRV are `notInV1`. "Por que nessa ordem?" appears only with an engine reason. |

## 30 · Plano (`551:7`)

| Frame | Kind | Nodes | Why |
|---|---|---|---|
| 9 frames + 9 twins (Semana, Mover, Mudar a agenda, Proposta recusada, Outro perfil) | TEXT | `519:1150`, `592:1791`, `593:1994`, `593:2667`, `593:3179`, `597:2104`, `597:2423`, `597:2751`, `597:3049`, `631:4459`, `631:5368`, `632:6369`, `632:6754`, `632:7133`, `632:9239`, `632:10168`, `633:4228`, `633:7893` | GAP-09: "Toque e segure para mudar o dia. O treinador encaixa o treino e você confirma antes de valer." |
| `593:689`, `597:1909`, `597:1542`, `596:2125` | ANN | — | `unavailableDays`, `pendingWeek` (A), `weekPlan` (closed). |

## 31 · Treino planejado (`551:8`)

16 frames got an ANN. `645:749` (sem prescrição por segurança) was **visually checked**: it shows no steps, load or "Começar". Its annotation covers FND-ABC-05. The other annotations cover `Startability` and `prescription.load`.

## 40 · Execução · corrida (`551:9`)

| Frame | Kind | Nodes | Why |
|---|---|---|---|
| `661:1215` Corrida avulsa · esforço percebido +twin | TEXT, ANN | `661:1268`, `662:7937` | SSCTR-ABC-S1 / FND-ABC-02: the question now reads "Parou ou sentiu algo fora do normal?". It is mandatory, and no answer is not "no". |
| `510:473`, `657:32`, `657:134`, `657:252`, `657:370`, `657:489`, `657:604`, `657:718`, `657:832`, `657:1144`, `657:1243`, `657:1342`, `659:424`, `659:532`, `661:904`, `661:992` | TAG `[V1: usar variante sem FC ao vivo]`, ANN | — | GAP-34. Each one checked: every frame shows a live bpm. |
| `660:503`, `660:662`, `661:1289`, `879:2580` | ANN | — | `Startability`, `runSession(for:)`, local GPS, `kept`. |

## 41 · Execução · força (`551:10`)

| Frame | Kind | Nodes | Why |
|---|---|---|---|
| `665:486` Ajuste de carga +twin | TEXT, ANN | `665:537`, `669:2306` | GAP-10: "Baixar para 70 kg" became "Ajustar carga", with no suggested number. |
| `665:1079` Sugestão do treinador durante a sessão | TAG FUTURO, ANN | — | The engine does not decide inside a session. |
| `668:1873` Força avulsa · concluir | ANN | — | `observedAt`, `WriteOutcome.kept`, `unplannedMerge`. |

## 50 · Concluído e histórico (`551:11`)

| Frame | Kind | Nodes | Why |
|---|---|---|---|
| `880:19765` limiar só com o iPhone, `880:20729` leve só com o iPhone +twins `880:20167`, `880:21027` | TEXT, ANN | `880:20127`, `880:20132`, `880:20529`, `880:20534`, `880:20751`, `880:20910`, `880:20970`, `880:20974`, `880:20989`, `880:20994`, `880:21049`, `880:21208`, `880:21268`, `880:21272`, `880:21287`, `880:21292` | GAP-16 / DR-121. The labels now read "Medido pelo iPhone, não usado pelo plano" and "iPhone, não usado pelo plano · salvo às …". The coach reading uses **time** and effort, not pace. |
| `682:2528`, `683:2360` Corrida avulsa +twins | TEXT | `682:2809`, `682:2895`, `683:2526`, `683:2559`, `691:10344`, `691:10377`, `691:11266`, `691:11299` | Distance and pace measured by the iPhone stay local. |
| 18 nodes in the limiar/leve/longão screens | TEXT | `530:1516`, `531:1605`, `531:1915`, `544:1691`, `682:699`, `682:1266`, `683:1084`, `683:1504`, `683:1917`, `691:4281`, `691:5035`, `691:5619`, `691:6218`, `691:6827`, `691:7268`, `691:7707`, `691:8288`, `691:8844` | "Registrado · ritmo, FC e esforço" became "ritmo e esforço": heart rate is never a plan input. |
| `531:1220` Tempo por zona +twin | TEXT | `531:2113`, `691:4907` | C10 copy: "com suas zonas atuais", plus the optical sensor caveat. |
| `530:1131`, `531:1220`, `531:1630`, `544:1329`, `682:1464`, `682:337`, `682:904`, `683:1141`, `683:1555`, `683:721` | ANN | — | Zonas and Tempo por zona are FUTURO (C10). Heart-rate series are `notInV1`. |
| `682:2528`, `684:4381` (avulsas), `683:721`, `684:3688` (opções) +twins | TEXT, HIDE | copy `682:3027`, `683:2568`, `684:4639`, `684:4874`, `691:10386`, `691:11308`, `691:16738`, `691:17142`; hidden "Excluir" `682:3025`, `683:1131`, `684:4040`, `684:4637`, `691:6868`, `691:10384`, `691:16070`, `691:16736` | GAP-13: there is no deletion in V1. Correction keeps the original. |
| `683:2360`, `684:4669`, `687:4651` | TAG FUTURO, ANN | — | Deletion confirmations and undo are preserved for V2. |
| `684:4381`, `684:4890` | ANN | — | GAP-12 `kept`; GAP-18 `ImportedWorkoutSummary`. |

## 60 · Progresso (`551:12`)

| Frame | Kind | Nodes | Why |
|---|---|---|---|
| 6 frames + 6 twins | TEXT | `520:1156`, `728:428`, `728:1053`, `728:1444`, `731:2576`, `880:10903`, `732:1976`, `732:2715`, `732:4117`, `732:4564`, `733:9857`, `880:11278` | GAP-23: "Só para você ver: estes sinais não entram no plano." |
| `512:360` (block `512:395` Mapa híbrido) | ANN | — | GAP-25: FUTURO. Also covers records. |

## 72 · Adaptações (`551:15`)

| Frame | Kind | Why |
|---|---|---|
| `843:1696`, `843:1751`, `843:1923`, `843:1980` | ANN | GAP-03: ask `warningSignSet(condition)`, which is 9, 13 or 15 signs. |
| `806:3252`, `806:3406`, `806:3483`, `806:3567`, `805:2723` | TAG FUTURO, ANN | Watch signals, the athlete's own sleep report, another device. |
| `806:3345` Sinais do relógio · sem relógio | ANN | Valid in V1 ("sem palpite"). It was briefly tagged FUTURO by mistake and the tag was reverted in the same session. |
| `805:410`, `805:492`, `805:2595`, `805:2648`, `806:981`, `843:2115` | ANN | BLOCKED, FND-ABC-04, `kept`, retroactive pause, HELD strength. |

## 81 · Sistema e Apple Saúde (`551:17`)

| Frame | Kind | Nodes | Why |
|---|---|---|---|
| `848:383` Conectado em parte +twin | TEXT, ANN | `848:410`, `849:11998`; status `848:432`, `849:12013` ("Sem permissão" became "Nada recebido") | GAP-19: iOS does not reveal a read denial. |
| `849:1153`, `849:3330` | TAG FUTURO, ANN | — | GAP-13, GAP-33. |
| `849:811` | TAG `[V1: oculto até prova A+B]`, ANN | — | GAP-14. |
| `849:1066` | TAG `[V1: oculto até OPEN-1]`, ANN | — | GAP-15. |
| `848:502`, `849:3950`, `849:3994`, `848:290`, `848:1012`, `880:25617` | ANN | — | Nothing received; `repertoireExpired`; clinical block; heart rate not requested in V1; DR-121. |

## 99 · Handoff and 00 · Guia

- `897:1232` (99): "frequência cardíaca sem permissão" became "nenhuma frequência cardíaca recebida".
- Guia `897:2`:
  - intro `897:6`: 591 frames, plus the 26 nov alignment note;
  - frame counts `897:59` (61) and `897:122` (52);
  - "O que mudou por último" column: `897:62`, `897:69`, `897:76`, `897:90`, `897:97`, `897:104`, `897:111`, `897:125`, `897:132`, `897:146`.

## Not touched

- Pages 01, 02, 03, 04, 05, 70, 80, 82, 83, 90, 91, ZZ.
- Global styles, variables, components and colors.
- Every motion keyframe. Twins got the same text; the five-zone rows of the strap twin were cloned from the Lucas twin.
