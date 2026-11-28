# F-ONBOARDING-FIGMA · Onboarding fiel ao Figma (#101)

**Situação:** spec de entrada (QUALITY_GATES §2b) escrita pela frente C em 27/11/2026, antes do código. Vive em
`audits/v1-ios-swiftui-2026-11-26/results/i101-onboarding/` porque `specs/` pertence à orquestração na matriz do guard; o orquestrador
decide se a promove para `specs/v1/features/`.

**Fonte de UI/UX:** Figma `90oyvXHxxBQAvr1netov7S`, página `10 · Onboarding` (`551:5`), versão aprovada "V1 alinhamento funcional · 26 nov".
Lido em 27/11/2026 pelo MCP (somente leitura: `create_session`, `get_metadata`, `get_screenshot`, `get_design_context`; nunca `use_figma`).
Capturas de referência baixadas na sessão (não versionadas: o Figma é a referência, não a cópia).

**Autoridade esportiva:** CoachingCore congelado (`CoachingCore/src/r6-intake.mjs`, `v1-run-calibration.mjs`, `v1-coaching.mjs`,
`v1/EVENT_EXTENSION_V1.json`). **Contrato Swift:** `CoachingPresentation/Requests/Intake.swift` (`OnboardingAnswers` → `IntakeRequest`, A)
e `CoachingWriting.onboard(_:consents:)`. Ambos só leitura (CCP).

**Regras desta spec.** Nenhuma tela, pergunta, opção, texto ou passo fora do Figma. A tela inventada "O que você tem para treinar força?"
(`ob.equipment.title`) sai. Onde o Figma e o contrato não se encaixam, a linha diz **decisão pendente (Dnn)** e a lista do §6 traz opções e
impacto; nada é resolvido criando tela. Fail closed: nil ≠ false, nada pré-respondido, sem resposta não continua.

**O que os frames mostram e o que não mostram.** Os frames desenham o estado *respondido* (chip branco, toggle ligado, roda parada num valor).
O estado inicial implementado é o não respondido: nenhum chip escolhido, nenhum toggle ligado, botão principal no estado desabilitado que o
próprio Figma desenha (`838:3819`, `838:3864`, `838:4011`: fundo `fundo/elevado`, texto terciário). Rodas e contadores: ver D17.

---

## 1. Estrutura e navegação

Quatro etapas, barra "Progresso em quatro etapas" (4 segmentos; o segmento da etapa atual enche conforme o passo dentro dela), voltar pelo
botão `chevron-esquerda` de 36 pt. Cada respiro fecha uma etapa ("<Etapa> · etapa N de 4 concluída") e não tem pergunta.

```
01 Abertura
 └ Etapa 1 · Objetivo:  02 O que treinar → [corrida] 03 Objetivo na corrida → [prova] 04 Data da prova → 05 Meta de tempo
                        → [força] 06 Objetivo na força → [os dois] 07 Prioridade → 08 Respiro · objetivo definido
 └ Etapa 2 · Rotina:    09 Sua semana (+09b Turno por dia, folha) → [corrida] 10 Dia do longão → 11 Duração → [força] 12 Onde treina força
                        → [corrida] 13 Onde corre → [corrida] 14 O que você usa na corrida → 15 Treinador → 16 Respiro · rotina definida
 └ Etapa 3 · Você:      17 Nome → 18 Idade → 19 Altura e peso → 20 Apple Saúde → [corrida] 21 Corrida até aqui → 22 Tempo de corrida
                        → 23 Resultado recente (→ 24 Como foi o resultado) → [força] 25 Força até aqui → 26 Cargas conhecidas
                        → 27 Cuidados (+27b confirmar, folha) → 28 Respiro · ponto de partida
 └ Etapa 4 · Seu plano: 29 Seus dados → 30 Montando o plano → 31 Plano pronto → 32 Salvar o plano (folha) → 33 Assinar (= página 80)
                        → 34 Primeira semana → Hoje (20)
```

Ramos condicionais pelos dados do Figma: "Só corrida" pula 06, 07, 12, 25, 26; "Só força" pula 03–05, 07, 10, 13, 14, 21–24.
Os ramos de iniciante (21 Marina, 21b, 25 Marina, 25b) e o ponto exato em que entram estão em D12/D13.

**Sair e retomar.** `838:4219` "Sair do cadastro?" (folha) e `838:3918` "Retomar o cadastro": as respostas ficam neste iPhone (rascunho local,
§5) e o cadastro reabre na etapa em que parou. O gatilho da folha "Sair" não está desenhado (D21).

---

## 2. Tela a tela

Colunas: nó · cópia PT exata (Figma 27/11) · opções/variantes · campo do contrato (`OnboardingAnswers`/`IntakeRequest` → campo do motor em
`r6-intake.mjs`) · estados. EN/ES: o Figma não traz o onboarding em inglês nem espanhol (página 83 só traduz Hoje, Treino planejado, Entrar e
Localização); as chaves novas ficam **PENDING_TRANSLATION** no `copy.psv` (colunas en/es repetem o pt-BR, marcadas), nada inventado.

### Etapa 1 · Objetivo

| Nó | Cópia | Opções e variantes | Campo | Estados |
|---|---|---|---|---|
| `835:2069` 01 Abertura | "Corrida e força na mesma semana" · "Algumas perguntas rápidas e o treinador monta o seu plano. Só o iPhone basta para começar." · botão "Começar" · link "Já tenho conta" · arte "a semana com os dois" (dias S T Q Q S S D) · marca Repmile | — | nenhum | "Já tenho conta" depende de conta (#28): D18 |
| `835:2114` 02 O que treinar | "Etapa 1 de 4 · Objetivo" · "O que você quer treinar?" · "Corrida e força" / "Na mesma semana, um em função do outro." · "Só corrida" / "A força pode entrar depois." · "Só força" / "A corrida pode entrar depois." · "Continuar" | cartões com ícone (híbrido, corrida, força) e marcador | decide se `goals.run`/`goals.strength` são perguntados; o lado não escolhido vai como `NONE` (vocabulário do motor) | sem escolha: Continuar desabilitado. "Só força"/"Só corrida": D05 |
| `835:2188` 03 Objetivo na corrida · `838:853` (Rafa, sem prova) | "O que você busca na corrida?" · "Uma prova": "5 km", "10 km", "Meia maratona", "Maratona" · "Sem prova": "Começar a correr", "Regularidade", "Performance" | pílulas, uma escolha | prova → `goals.run.kind = RACE`, `event.kind` = `5K`/`10K`/`HALF_MARATHON`/`MARATHON`. Sem prova: "Regularidade" → `REGULAR`, "Performance" → `PERFORMANCE`, "Começar a correr" → D06 | — |
| `835:2245` 04 Data da prova · `838:913` (maratona, 16 semanas) · `838:3864` (além de 16 semanas) | "Quando é a prova?" · leitura "Domingo, 20 de dezembro" / "8 semanas até lá" (maratona: "16 semanas até a maratona") · nota "Esta versão monta planos de até 16 semanas." (maratona: "Para um bloco de maratona, o treinador confere experiência, maior corrida recente, minutos e dias por semana, tempo para o longão e semanas até a prova.") · erro: "Esta versão monta planos de até 16 semanas" / "Escolha uma data até 14 de fevereiro de 2027 ou siga sem prova por enquanto." · link "Seguir sem prova por enquanto" | roda dia/mês/ano | `event.date` (dia local do aparelho, #61b). `weeks` derivado da data: D03 | além do horizonte: Continuar desabilitado + caixa de erro (desenhada). Prova a menos de 7 dias: o motor recusa (`event.withinHorizonAndNotImmediate`); sem estado no Figma: D04 |
| `835:2301` 05 Meta de tempo | "Tem um tempo em mente?" · "É opcional." · roda min/s · "A meta é sua: o treino segue o esforço e o seu resultado recente, nunca o tempo da meta." · "Continuar" · "Seguir sem meta" | — | motor: `event.timeGoalMinutes` (contexto, nunca intensidade). `GoalEvent` Swift não tem o campo: D07 | opcional |
| `835:2349` 06 Objetivo na força | "E na força?" · "Hipertrofia", "Força", "Geral", "Manutenção" · nota por opção ("Força: poucas repetições, sempre sobrando algumas.") | pílulas | `goals.strength` = `HYPERTROPHY`/`STRENGTH`/`GENERAL`/`MAINTAIN` | notas das outras três opções não estão no Figma: só a de "Força" aparece (D22) |
| `835:2400` 07 Prioridade | "Quando a semana apertar, quem vem primeiro?" · "Quase sempre cabe tudo. Dá para mudar quando quiser." · "Corrida primeiro" / "A corrida fica protegida; a força se encaixa em volta." · "Equilíbrio" / "Os dois avançam juntos; quando aperta, cada um cede um pouco." · "Força primeiro" / "A força fica protegida; a corrida se encaixa em volta." | cartões | motor: `schedule.temporaryPreference` (`RUN`/`STRENGTH`, nenhum = equilíbrio). `TrainingSchedule` Swift não tem o campo: D08 | só quando treina os dois |
| `835:2475` 08 Respiro · objetivo definido | "8" "semanas" · "hoje · sáb 24 out" / "prova · dom 20 dez" · "Objetivo · etapa 1 de 4 concluída" · "8 semanas até os seus 10 km" · "Prova no domingo, 20 de dezembro. O primeiro treino pode ser já na segunda, 26 de outubro." · "Agora, a sua rotina" | linha do tempo em semanas | nenhum (resumo). Início = próxima segunda (já é a regra do app, `startDate`) | respiro sem prova não desenhado: D09 |

### Etapa 2 · Rotina

| Nó | Cópia | Opções e variantes | Campo | Estados |
|---|---|---|---|---|
| `862:2271` 09 Sua semana | "Etapa 2 de 4 · Rotina" · "Em quais dias você treina?" · "Pode marcar corrida e força no mesmo dia." · "Corrida" + turnos "Manhã"/"Tarde"/"Noite" · grade S T Q Q S S D (corrida acima da linha, força abaixo) · "Força" + turnos · resumo "4 corridas e 3 de força" / "Quinta: força de manhã, corrida à noite." · "Sáb e dom: corrida de manhã" · "Ajustar um dia" | dias por modalidade; turno por modalidade | `schedule.runDays`, `schedule.strengthDays` (0 = segunda, como hoje); turno: `runTurn`/`strengthTurn` `AM`/`PM` (Manhã → AM; Tarde e Noite → PM). Turno opcional no Figma (página 99) e por dia (09b): D10 | sem dia da modalidade escolhida: Continuar desabilitado |
| `862:2544` 09b Turno por dia (folha) | "Turno por dia" · "Corrida à noite e força de manhã. Mude só o dia que foge disso." · linhas "Segunda força Manhã", …, "Sábado corrida mais longa" · "Concluir" | turno por dia | sem campo (o contrato tem um turno por modalidade): D10 | — |
| `836:390` 10 Dia do longão | "Qual é o dia da corrida mais longa?" · pílulas com os dias de corrida escolhidos ("Ter", "Qui", "Sáb", "Dom") · "É um dos seus dias de corrida." | um dos `runDays` | `schedule.longRunDay` | só com corrida |
| `836:546` 11 Duração | "Quanto tempo cabe em cada treino?" · "Corrida" / "Cada corrida da semana" · "Longão" / "<dia do longão>" · "Força" / "Cada sessão" · "min" · "É o máximo de cada dia, com aquecimento. O plano começa abaixo disso e sobe com o que você registrar." | contadores −/+ | `schedule.runMinutes`, `longRunMinutes`, `strengthMinutes` (motor: 10–240) | linhas só da modalidade escolhida; valor inicial: D17; modalidade não escolhida e contrato obrigatório: D05 |
| `836:624` 12 Onde treina força · `867:2289` (prédio ou casa) | "Onde você treina força?" · "Academia completa", "Academia do prédio", "Em casa", "Só peso do corpo" · completa: "O plano conta com barra, rack, banco, halteres e máquinas." · prédio/casa: "O que tem lá?" / "Só entra no plano o que você tem à mão." / "Barra e anilhas", "Rack", "Banco", "Halteres", "Máquinas", "Barra fixa", "Elásticos" / "Não sabe tudo? Você confirma no primeiro treino." | preset + chips | `athlete.equipment` (códigos do catálogo `r7b-repertoire`): completa = `BARBELL, RACK, BENCH, DUMBBELLS, MACHINES` (suposição declarada pelo próprio texto do Figma); prédio/casa = o que o atleta marcar (Barra e anilhas `BARBELL`, Rack `RACK`, Banco `BENCH`, Halteres `DUMBBELLS`, Máquinas `MACHINES`, Barra fixa `PULL_UP_BAR`, Elásticos `BANDS`); só peso do corpo = `BODYWEIGHT`. `KETTLEBELL` nunca é enviado (o Figma não oferece) | prédio/casa sem nenhum chip: D14 |
| `836:741` 13 Onde corre | "Onde você corre?" · "Pode marcar mais de um." · "Rua", "Esteira", "Pista", "Trilha" | vários | sem campo no contrato: perfil local (§5) | — |
| `836:782` 14 O que você usa na corrida | "Na corrida, você usa" · "Só o iPhone", "Relógio no pulso", "Cinta peitoral" · "Sem relógio, as zonas de frequência cardíaca são estimadas pela sua idade. Você pode informar a sua máxima depois." | uma | sem campo no contrato: perfil local (§5). O texto bate com o motor (220 − idade sem medida) | — |
| `836:830` 15 Treinador | "Que treinador combina com você?" · "Muda como o plano avança. A segurança é a mesma nos três." · "Conservador" / "Espera mais registros antes de avançar." · "Equilibrado" / "Avança quando você cumpre o combinado." · "Exigente" / "Recomenda a opção mais difícil quando houver." · "Volume e dificuldade começam no padrão. O ajuste fino fica em Perfil › Volume e dificuldade." | uma | motor: `athlete.coaching.profile` `CONSERVATIVE`/`BALANCED`/`DEMANDING`; `AthleteIntake` Swift não tem o campo e não há porta `setCoach`: D11 | — |
| `836:882` 16 Respiro · rotina definida | arte da semana · "Rotina · etapa 2 de 4 concluída" · "Sua semana: 7 sessões em 6 dias" · "4 corridas e 3 de força. Quinta com os dois, em turnos diferentes. Sexta livre." · "Agora, sobre você" | — | resumo dos `runDays`/`strengthDays` | — |

### Etapa 3 · Você

| Nó | Cópia | Opções e variantes | Campo | Estados |
|---|---|---|---|---|
| `836:2567` 17 Nome | "Etapa 3 de 4 · Você" · "Como podemos te chamar?" · "Nome" · "Opcional, para o treinador falar com você." | campo de texto, teclado aberto | não vai ao motor: perfil local (§5) | opcional |
| `836:2603` 18 Idade · `838:3819` (fora do que a versão atende) | "Qual é a sua idade?" · roda "anos" · "Serve para ajustar o plano. Nesta versão, de 18 a 80 anos." (cadeado) · erro: "Nesta versão, o Repmile atende de 18 a 80 anos." (×) | roda | `athlete.ageYears` | fora de 18–80: erro inline + Continuar desabilitado (desenhado) — verificação local duplica a faixa do motor: D16 |
| `836:2649` 19 Altura e peso | "Altura e peso" · "Altura" "m" · "Peso" "kg" · "Opcionais. Não definem cargas nem ritmos." · "Continuar" · "Pular" | réguas | não vai ao motor (o motor aceita `profileContext.heightCm/weightKg` com `doseConsumer:false`, mas o contrato Swift não tem o campo): perfil local (§5), decisão do fundador de 27/11 | opcional ("Pular") |
| `836:2791` 20 Apple Saúde | "Quer usar seus dados do Apple Saúde?" · "O treinador vê o que você já fez e pergunta menos." · "O que o app lê · últimas 4 semanas" · "Corridas e caminhadas" / "Data, duração e distância" · "Treinos de força" / "Data e duração" · "Frequência cardíaca" / "Só dos treinos" · "Peso e altura" / "Só se faltarem no seu perfil" · "Você escolhe cada item na tela do iPhone e muda quando quiser. Nesta versão, nenhum treino vai para o relógio." · "Conectar o Apple Saúde" · "Agora não" | — | nenhum campo do intake; pedido de permissão é de B. Não há porta C → B para pedir autorização nem resumo de 4 semanas: D15 | indisponível: D15 |
| `836:2872` 21 Corrida até aqui (com Apple Saúde) · `838:969` (sem Apple Saúde) | com: "Suas corridas nas últimas 4 semanas" / "Vieram do Apple Saúde. Corrija se algo estiver diferente." / "O plano usa o menor valor entre o que você informar e o do Apple Saúde." · sem: "Como está a sua corrida hoje?" / "Pense nas últimas 4 semanas." / "A primeira semana parte do que você já faz." · linhas "Dias por semana" (dias), "Minutos por semana" (min), "Maior corrida" (min) | contadores | `athlete.recent.runDaysPerWeek`, `runMinutesPerWeek`, `longestRunMinutes` | só a variante "sem Apple Saúde" é alcançável enquanto D15 estiver aberta; valor inicial: D17 |
| `838:1045` 21 Corrida até aqui · iniciante (Marina) | "Você já correu antes?" · "Nunca corri", "Já corri e parei", "Corro hoje" · "Tudo bem começar do zero: as primeiras semanas alternam caminhada e trote, pelo esforço." | uma | "Nunca corri" → `runTrainingMonths = 0` e `recent.run* = 0`; as outras duas: D12 | quando aparece: D12 |
| `838:1093` 21b Corrida recente · iniciante (Marina) | "Nas últimas 4 semanas, em quantos dias você correu?" · "Nenhum", "1 por semana", "2 por semana", "3 ou mais" | uma | `recent.runDaysPerWeek` 0/1/2/3 ("3 ou mais" → 3, limite inferior); minutos e maior corrida não são perguntados: D12 | — |
| `836:2948` 22 Tempo de corrida | "Há quanto tempo você corre com regularidade?" · "Menos de 6 meses", "6 meses a 2 anos", "Mais de 2 anos" | uma | `athlete.runTrainingMonths` (Int). As faixas coincidem com os cortes do motor (1–5 NOVICE, 6–23 INTERMEDIATE, ≥24 EXPERIENCED; limiar de 6 meses do 5K e da maratona). Valor enviado = limite inferior da faixa: 1, 6, 24 (D13 confirma) | — |
| `836:2994` 23 Resultado recente · `838:1143` (não tenho) | "Tem um resultado recente?" · "Com ele, o plano já começa com faixas de ritmo ao lado do esforço." · "5 km", "10 km", "Meia maratona", "Maratona" · roda min/s · "Continuar" · "Não tenho resultado recente" · variante: "Não tenho resultado recente", "Adicionar um resultado", "Tudo bem: a corrida começa guiada pelo esforço, e isso não faz de ninguém iniciante. Se fizer uma prova ou um teste depois, é só registrar." | distância + tempo | `athlete.performanceAnchors[]`: `distance` `5K`/`10K`/`HALF_MARATHON`/`MARATHON`, `seconds` | "não tenho": `performanceAnchors = []`. Meia e maratona precisam de horas na roda (o Figma só desenha min/s): D19 |
| `836:3049` 24 Como foi o resultado | "Como foi esse 5 km?" · "Quando" (data, "Domingo, 18 de outubro") · "Como foi medido": "Prova oficial", "Pista", "Teste" · "Esforço" pontos 1–10, "9 de 10" · "Terminou bem, sem dor?": "Sim", "Não" · "Condições": "Normais", "Calor ou subida" · "Vale prova, pista ou teste feito no esforço e sem dor. Treino comum não conta como resultado." | segmentados | `date`, `kind`+`measurement` (D20), `rpe`, `tolerated` (Sim → true, Não → false). "Condições" não tem campo no `PerformanceAnchor` Swift (o motor lê `conditions`, ex. `HEAT`, `HILLY`): D20 | — |
| `836:3128` 25 Força até aqui · `838:1187` (iniciante, Marina) · `838:1239` 25b (retomada depois de uma pausa) | "Há quanto tempo você treina força?" · "Nunca treinei", "Menos de 6 meses", "6 meses a 2 anos", "Mais de 2 anos" · "Dias por semana" / "Do Apple Saúde · últimas 4 semanas" / "dias" · Marina: "Sem carga conhecida, a primeira semana é uma sessão curta de prática com o peso do corpo. As cargas vêm na semana seguinte." · 25b: "Por que você parou?" · linha do tempo "ago 2025 · 1 ano, 3 vezes por semana" / "pausa de 3 meses · hoje" · "Viagem", "Trabalho", "Família", "Doença", "Lesão", "Outro" · "3 meses parado contam: o plano recomeça abaixo do que você fazia e sobe com o que você registrar. Doença ou lesão abre as perguntas de cuidados antes de seguir." | uma + contador | `athlete.strengthTrainingMonths` (Nunca 0; demais como D13); `recent.strengthDaysPerWeek`. 25b → `athlete.pause` (`IntakePause`: `reasonCategory`, `nonclinical`, `weeks`) | subtítulo "Do Apple Saúde" sem Apple Saúde e quando 25b aparece: D12/D15 |
| `836:3194` 26 Cargas conhecidas | "Quais cargas você já conhece?" · linhas "Agachamento livre 4 × 5 · sobravam 3 90 kg", "Stiff com barra", "Supino", "Remada curvada", "Desenvolvimento", "Puxada alta", "Leg press" · "Adicionar exercício" · "Entram como ponto de partida. Sem carga conhecida, o exercício fica a estabelecer na primeira semana." · "Continuar" · "Não sei minhas cargas" | lista editável | motor: `athlete.knownExercises[{id, sets, reps, rir, load}]`. `AthleteIntake` Swift **não tem** `knownExercises`: D01 | sem o campo, o texto "Entram como ponto de partida" seria falso: tela bloqueada por D01 |
| `836:3299` 27 Cuidados · `838:3616` (um sinal marcado) | "Algum destes vale para você hoje?" · "Dor hoje ao se movimentar ou treinar" · "Dor que dura semanas ou piora com o esforço" · "Lesão, ou recuperação de lesão ou cirurgia" · "Doença agora, como febre ou infecção" · "Limitação física que atrapalha o dia a dia" · "Um profissional de saúde pediu para evitar exercício, ou algo te preocupa" · "Gestação atual ou parto nos últimos 12 meses" · "Nenhum destes" · "Não é avaliação médica: serve para o treinador saber quando não deve prescrever. Fica só na sua conta." | caixas + "Nenhum destes" (exclusivo) | itens 1–6 → `eligibility.pain`, `persistentPain`, `injury`, `illness`, `functionalLimitation`, `clinicalConcern` = true; item 7 → `specialPopulation` (D02); "Nenhum destes" → os seis `false` + `status NONCLINICAL_CONFIRMED` + `specialPopulation []`. Com algum item marcado, os não marcados vão **nil** (omitidos): nada é inferido como "não" | sem escolha: Continuar desabilitado. Textos clínicos INTERIM |
| `838:4148` 27b Confirmar a resposta (folha) | "Confirma esta resposta?" · "Você marcou dor que dura semanas ou piora com o esforço. Com isso, nenhum treino é prescrito até você declarar que pode treinar. Se tocou por engano, revise agora." · "Confirmar resposta" · "Revisar respostas" | — | nenhum (confirmação) | aparece ao continuar com um sinal clínico marcado; a frase cita o item marcado (D22 para o texto dos outros itens) |
| `836:3372` 28 Respiro · ponto de partida | "Você · etapa 3 de 4 concluída" · "O plano parte do que você já faz" · "Corrida hoje" "4 dias por semana" "200 min" · "Resultado recente" "5 km · prova oficial · 18 out" "21:48" · "Força" "3 dias por semana" "7 cargas" · "Ver meu plano" | — | resumo das respostas | linhas condicionais ao que foi respondido |

### Etapa 4 · Seu plano

| Nó | Cópia | Opções e variantes | Campo | Estados |
|---|---|---|---|---|
| `837:999` 29 Seus dados | "Etapa 4 de 4 · Seu plano" · "Como seus dados são usados" · "Escolha o que permitir. Dá para mudar quando quiser." · "Treino" / "Respostas e registros, para montar e ajustar o plano." / "Necessário" · "Sinais de saúde" / "Dor, doença ou sintomas que você informar, para o treinador segurar o plano quando preciso." · "Aprendizado" / "Como você responde aos treinos, para ajustar o plano com o tempo." · "Nenhum dado de saúde aparece em notificações nem na tela bloqueada. Você pode exportar ou apagar tudo depois." · "Montar meu plano" | dois toggles | `Consents`: `COACHING = true` (necessário; enviado ao tocar "Montar meu plano"), `HEALTH_SIGNALS` e `LEARNING` = estado dos toggles, **desligados no início** (LGPD/consentimento explícito; o frame mostra o estado escolhido) | envio idempotente: um toque, botão desabilitado durante o envio |
| `837:1059` 30 Montando o plano | arte da semana · "Montando seu plano" · "Objetivo" / "10 km em 20 dez e força, com a corrida primeiro" · "Ponto de partida" / "5 km em 21:48 e 7 cargas conhecidas" · "Seus dias" / "Corrida ter, qui, sáb e dom; força seg, qua e qui" · "Coordenando os dois" / "Quinta: força de manhã, corrida à noite" · "Leva alguns segundos. Se você sair do app, a montagem continua." | lista que se completa | `CoachingWriting.onboard(answers, consents)` | Reduce Motion: sem animação. "a montagem continua" fora do app: D23 |
| `838:3972` 30 Montagem · não deu para montar | "Não deu para montar agora" · "Foi uma falha de conexão do nosso lado. Suas respostas estão salvas: nada se perdeu. Nenhum treino aparece até o plano ser montado." · "Tentar de novo" · "Revisar respostas" | — | `planOutcome .failed/.unrecognized` (erro operacional do motor/host) | "falha de conexão" quando o motor é local: D23 |
| `838:4011` 30 Montagem · falta uma resposta | "Falta uma resposta" · pergunta (desenhada: "Na quinta, corrida e força vão em turnos diferentes ou um depois do outro?" / "Força de manhã, corrida à noite" / "Os dois no mesmo turno, um depois do outro") · "O treinador só pergunta o que falta. O resto das suas respostas continua igual." · "Montar meu plano" (desabilitado até responder) | — | `planOutcome .needsInput` (motor ASK). A pergunta desenhada é a negociação `SHARED_DAY_TURN_UNKNOWN` / `sameTurnConfirmed`, sem campo no contrato: D10 | — |
| `838:4053` Fora do que esta versão atende · `1103:2299` (ao refazer, com plano anterior) | "Esta versão ainda não monta um plano para você" · "Você informou gestação atual ou parto nos últimos 12 meses. O Repmile ainda não tem base para prescrever com segurança nessa fase. Não é sobre a sua capacidade." · "Vale o mesmo para idade fora de 18 a 80 anos. Nenhum plano foi montado." · "Entendi" · "Revisar resposta" · refazer: "Esta versão não segue com o seu plano" / "O plano anterior fica guardado, mas nenhum treino dele pode ser começado. Seus registros continuam no Histórico." | — | `planOutcome .outsideV1Scope` (motor UNSUPPORTED) | "Entendi" sem destino desenhado (fica no estado; D24) |
| `838:3689` Cuidados · sem treinos prescritos, retido por segurança · `838:3756` refazer o cadastro não libera | "Retido por segurança" · "Por enquanto, sem treinos prescritos" · "Você informou um sinal que pede avaliação de um profissional de saúde. Não é diagnóstico: é o limite do que um app faz com segurança." · passos 1–3 ("Procure um profissional de saúde." / "Quando puder treinar, declare isso no app, para cada modalidade." / "O plano recomeça de forma conservadora, a partir da sua declaração.") · "Entendi" · "Já posso treinar · declarar" · refazer: "Sua conta tem uma restrição de segurança registrada." / "Refazer o cadastro não muda a restrição" / "Entrar em outro aparelho ou começar um treino avulso também não libera os treinos. A saída é declarar que você pode treinar, para cada modalidade." / "Declarar que posso treinar" | — | `planOutcome .clinicalHumanRequired` | textos clínicos INTERIM; "declarar" abre a declaração de prontidão existente (72) quando o plano retido existe; no cadastro sem registro: D24 |
| `837:1144` 31 Plano pronto · prévia (Lucas) e variantes `838:1296` (Marina), `838:1387` (Rafa), `838:1478` (maratona, critérios atendidos), `838:1568` (maratona sem base, preparatório), `838:1643` (corrida do zero e força experiente) | "Seu plano está montado" · título por caso ("8 semanas até os 10 km, Lucas", "12 semanas para correr melhor, Rafa", "16 semanas até a maratona", "Plano preparatório para a maratona", "Cada modalidade parte do seu nível", "8 semanas para começar a correr, Marina") · período e fases ("De seg, 26 out a dom, 20 dez: construção, específico, polimento e a prova.") · semana 1 desenhada · "Semana 1: 4 corridas e 3 de força. Começa na segunda, 26 de outubro." · cartões ("Ritmos calibrados", "Capacidade atual nos 10 km" + "É estimativa, não promessa.", "Força com as suas cargas", "Corrida pelo esforço", "Faixas de ritmo e estimativas" / "Indisponíveis", critérios do bloco de maratona) · "Salvar meu plano" · "Ver o plano inteiro" | por caso | leitura depois do `onboard`: `plan(week:)` (semana 1, `weeks`), `weekPlan()` (fases), `presentation().readings.runCalibration` (`paceBands`, `estimates`, `capacity`). Critérios de maratona atendidos/não atendidos (`contextEvent.unmet`) não chegam por nenhuma porta: D25. Comparação "Sua meta de 44:30 está dentro": D07 | cartão só com dado do motor; sem leitura → nada inventado |
| `837:1323` 32 Salvar o plano (folha de conta) | "Salve o seu plano" · "Ele acabou de ser montado e ainda está só neste iPhone. Com a conta, fica guardado e o treinador acompanha os seus treinos." · "Continuar com a Apple" · "Continuar com o Google" · "Continuar com e-mail" · "Ao continuar, você aceita os Termos de uso e a Política de privacidade." · "Já tenho conta · Entrar" | — | nenhum; backend #28 ausente | sem conta real: D18 |
| `851:9600` 33 Assinar · 7 dias grátis (= página 80) | "Assinatura" · "Seu plano está pronto" · "8 semanas até os seus 10 km" · "Semana 1: 4 corridas e 3 de força. Prova em 20 de dezembro." · "Melhor valor" "72% menos que o mensal" · "Anual" "Dá R$ 16,66 por mês" "R$ 199,90" "por ano" · "Mensal" "R$ 59,90" "por mês" · "hoje · acesso completo, sem cobrança" / "31 out · primeira cobrança" · "Começar 7 dias grátis" · texto legal · "Restaurar compras" · "Termos de uso" · "Privacidade" | anual/mensal | nenhum (StoreKit) | preço e oferta não aprovados; ambiente de teste sem cópia no Figma: D18 |
| `837:1239` 34 Primeira semana | "Semana 1 · 26 out a 1 nov" · "Sua primeira semana está montada" · "Três decisões do treinador" · 1–3 (ex. "Corridas leves na semana 1" / "O limiar entra na semana 3.") · "Ir para Hoje" · "Mudar dias ou horários" | — | semana 1 do `plan(week:)`; as "decisões" não têm fonte no contrato (o motor só tem `explanation` em inglês por sessão): D26 | — |

---

## 3. Estados do fluxo (resumo)

| Estado | Origem | Tela |
|---|---|---|
| editando | ViewModel `.form(step)` | 01–29 |
| enviando | `.building` (um envio por vez; segundo toque ignorado) | 30 |
| plano criado | `planOutcome .planCreated` | 31 → 32/33 → 34 → Hoje |
| fora do escopo | `.outsideV1Scope` | `838:4053` (no reinício `1103:2299`) |
| retido por segurança | `.clinicalHumanRequired` | `838:3689` (no reinício `838:3756`) |
| falta uma resposta | `.needsInput` | `838:4011` |
| respostas que não combinam | `.invalidInput` (#61) | **sem frame no Figma** — hoje existe um estado inventado ("Algumas respostas não combinam entre si"): D27 |
| falha | `.failed`, `.unrecognized` | `838:3972` |
| carregando | antes da primeira leitura | esqueleto existente (F01) |
| vazio | — | não se aplica (cada passo pergunta) |
| bloqueado | idade fora / prova além de 16 semanas | erros inline desenhados (`838:3819`, `838:3864`) |

---

## 4. Ligação com o motor (resumo do envio)

`OnboardingAnswers` hoje exige: `ageYears`, `runTrainingMonths`, `strengthTrainingMonths`, `exerciseRotationPreference` (`COACH_DECIDES`, o padrão
do motor; o Figma não pergunta), `goals.run.kind` (+ `event{kind,date}`), `goals.strength`, `equipment`, `recent{4 inteiros}`,
`performanceAnchors`, `eligibility`, `specialPopulation`; `schedule{strengthDays, strengthMinutes, runDays, runMinutes, longRunMinutes,
longRunDay, runTurn, strengthTurn}` (todos obrigatórios); `weeks` (4/8/12/16); `startDate`. A prova (`IntakeRequest`) é feita por replay no motor real
(`results/i101-onboarding/engine-replay.*`) para Lucas, Marina, Rafa e as duas maratonas.

---

## 5. Dados coletados que o motor não usa (perfil local)

Nome (17), altura e peso (19), onde corre (13), o que usa na corrida (14), e — enquanto D07/D08/D11/D01/D20 estiverem abertas — meta de tempo,
prioridade, treinador, cargas conhecidas e condições do resultado.

- **Armazenamento:** arquivo local do app (`Application Support/RepMile/Onboarding/onboarding.json`, proteção `completeUnlessOpen`, fora do backup; no modo fixture, uma pasta temporária por execução de teste), nunca enviado
  ao motor, a B, a log, a analytics ou a rede. Nenhum uso esportivo inventado (altura e peso: "Não definem cargas nem ritmos.").
- **Rascunho do cadastro:** o mesmo armazenamento guarda as respostas ainda não enviadas ("Suas respostas ficam neste iPhone"), para
  `838:3918` Retomar; apagado ao "Recomeçar" e depois de um envio aceito (as respostas enviadas vivem no registro do motor).
- **Edição:** o perfil local é editável (Perfil, F10, quando a tela existir; até lá o cadastro é a única entrada) — pendente na F10.
- **Exclusão:** apagado junto com a conta (`eraseAccount` → `accountErased`) e no estado `GONE`, como as gravações (G07).
- **Unidades:** altura em metros com vírgula (pt-BR), peso em kg; em `en_US` o Figma não define milhas/libras para o onboarding (D19).

---

## 6. Decisões pendentes (Figma × motor/contrato)

| # | Conflito | Opções | Impacto |
|---|---|---|---|
| D01 | 26 Cargas conhecidas: `AthleteIntake` não tem `knownExercises`; o texto diz "Entram como ponto de partida" | (a) CCP acrescenta `knownExercises` (id do catálogo, séries, reps, RIR, carga+unidade+convenção, `observedAt`) — o motor já lê; (b) tela fica fora até a CCP; (c) guardar local e não prometer (exige outro texto: não permitido) | Sem (a), a prévia 31 "Força com as suas cargas" e o respiro 28 "7 cargas" não podem ser verdadeiros. Implementação: a tela não entra até decidir |
| D02 | 27 "Gestação atual ou parto nos últimos 12 meses" é um item; o motor tem `PREGNANCY` e `POSTPARTUM` | **Decidido (fundador, #110):** o item fica único como no Figma e NUNCA é codificado como `PREGNANCY` nem `POSTPARTUM` (registro falso); a condição combinada ou não especificada entra na CCP-ONB-1 (#109) | Até a CCP: o item aparece e o envio fica retido para essa resposta (`BuildHold.pregnancyCode`) |
| D03 | O Figma não pergunta a duração do plano; o contrato exige `weeks` | Com prova: menor de 4/8/12/16 que cobre a data (é o que o Figma escreve: "8 semanas até lá", "16 semanas até a maratona"). Sem prova (Rafa "12 semanas", Marina "8 semanas"): (a) CCP torna `weeks` opcional (o motor assume 12); (b) valor fixo por objetivo (inventado); (c) perguntar (tela nova: proibido) | Sem prova, nenhum valor pode ser enviado sem decisão. Com prova: implementado como derivação |
| D04 | Prova a menos de 7 dias do início: o motor recusa; o Figma não desenha | (a) mesmo erro inline de 04 com outra frase (texto novo); (b) deixar o motor responder `INVALID_INPUT` → D27 | — |
| D05 | "Só força"/"Só corrida": o contrato exige `runMinutes`, `longRunMinutes`, `longRunDay`, `runTurn` (ou os de força) mesmo sem dias da modalidade; o motor rejeita `longRunDay` fora dos `runDays` | (a) CCP torna os campos da modalidade não escolhida opcionais; (b) enviar valores sentinela (inventado; e `longRunDay` dá erro) | "Só força" nunca gera plano hoje. Implementação: as duas opções aparecem; o envio fica bloqueado até a decisão |
| D06 | "Começar a correr" (03) não tem palavra no motor (`RUN_GOALS`: RACE, PERFORMANCE, REGULAR, GENERAL) | (a) `GENERAL`; (b) `REGULAR`; (c) SSCTR decide | Muda o tipo de plano de corrida |
| D07 | 05 Meta de tempo: `GoalEvent` Swift não tem `timeGoalMinutes`; 31 "Sua meta de 44:30 está dentro" compara meta com a estimativa | (a) CCP acrescenta `timeGoalMinutes` (o motor lê como contexto); (b) meta só local, e a frase de 31 fica sem a comparação (texto do Figma alterado: não permitido) | A comparação na UI seria regra de apresentação sobre dado do motor; com (a) ainda falta o motor dizer "dentro" |
| D08 | 07 Prioridade: `schedule.temporaryPreference` (RUN/STRENGTH) existe no motor e não no `TrainingSchedule` Swift | (a) CCP; (b) guardar local | O plano ignora a prioridade escolhida |
| D09 | Respiro 08 só está desenhado com prova | (a) desenho do respiro sem prova; (b) pular o respiro sem prova | — |
| D10 | Turnos: Figma tem Manhã/Tarde/Noite, turno opcional, turno por dia (09b) e a pergunta "falta uma resposta" do dia compartilhado; o contrato tem um `runTurn`/`strengthTurn` AM/PM obrigatório e não tem `sameTurnConfirmed` | (a) CCP: turnos opcionais + `sameTurnConfirmed` (o motor já lê); turno por dia exige mudança de motor; (b) Manhã → AM, Tarde/Noite → PM, turno obrigatório por modalidade, 09b só ajusta… nada (sem campo) | Implementado agora: Manhã → AM, Tarde/Noite → PM, turno obrigatório; 09b e `838:4011` aguardam |
| D11 | 15 Treinador: `athlete.coaching.profile` existe no motor; não existe no `AthleteIntake` nem há porta `setCoach` | (a) CCP acrescenta `coaching`; (b) guardar local | Escolha sem efeito no plano até (a) |
| D12 | Ramos de iniciante: quando aparecem 21 Marina, 21b e 25b; o que "Já corri e parei" e "Corro hoje" enviam; 21b não pergunta minutos nem maior corrida, mas `RecentTraining` exige os quatro inteiros | (a) CCP torna `recent.*` opcionais (o motor já trata ausente como estabelecimento conservador); (b) enviar 0 (falso para quem corre 1–3 dias) | "Nunca corri" → zeros é verdadeiro e implementado; o resto aguarda |
| D13 | Faixas de tempo (22, 25) → meses inteiros | Limite inferior (1, 6, 24) — idêntico para o motor, que só usa as categorias e o limiar de 6 | Proposta implementada; SSCTR confirma |
| D14 | 12 prédio/casa sem nenhum equipamento marcado | (a) Continuar desabilitado; (b) enviar `BODYWEIGHT` | — |
| D15 | 20 Apple Saúde: não há porta C → B para pedir autorização nem resumo das 4 semanas (21 "Vieram do Apple Saúde", 25 "Do Apple Saúde") | (a) contrato B/C novo (#B); (b) "Conectar" indisponível até lá | Implementado: só as variantes sem Apple Saúde; "Conectar" sem efeito real não é mostrado como conectado. Precisa de estado "indisponível" ou decisão |
| D16 | 18 Idade: a verificação 18–80 do frame `838:3819` repete uma faixa do motor na UI (CODE_AND_ARCHITECTURE §1 proíbe validação de faixa fora do motor) | (a) exceção registrada: a UI mostra o erro com a faixa publicada pelo motor; (b) só o motor decide → `838:4053` | Implementado (b) até decidir; `838:3819` inalcançável |
| D17 | Valores iniciais de rodas e contadores (idade, data, meta, durações, corrida recente, dias de força, altura, peso, resultado) | (a) controle começa sem valor ("—") e só vale depois de tocado; (b) começa num valor e exige um toque; (c) valor do Figma pré-preenchido (proibido: pré-resposta) | Implementado (a) |
| D18 | Conta (32, "Já tenho conta") e assinatura (33) sem backend (#28) e sem preço aprovado | Conta: botões sem efeito ou estado "indisponível" (não desenhado no onboarding; página 80 só tem "Sem conexão…", que seria falso). Assinatura: StoreKit local de teste com selo de teste (texto não desenhado) ou "Os planos não carregaram" (`820:708`, verdadeiro só se a App Store não respondeu) | Implementado: UI exata; toque não simula conta nem cobra; o que mostrar no toque aguarda decisão |
| D19 | Meia e maratona em 23 exigem horas (roda h:min:s não desenhada); unidades imperiais no onboarding não desenhadas | (a) acrescentar coluna de horas à roda; (b) só min/s (limita a 59:59) | Implementado: min/s, como o Figma |
| D20 | 24 "Como foi medido" e "Condições" → `kind`/`measurement`/`conditions` | Prova oficial → `RACE_RESULT`/`OFFICIAL`; Pista → `TIME_TRIAL`/`TRACK`; Teste → `TIME_TRIAL`/? (`GPS`/`MANUAL`); "Calor ou subida" → `HEAT` ou `HILLY` (um só item para dois códigos) e `conditions` não existe no `PerformanceAnchor` Swift | Implementado: Prova oficial e Pista; Teste e Condições aguardam |
| D21 | Gatilho da folha "Sair do cadastro" | (a) voltar na primeira pergunta; (b) gesto de fechar; (c) só ao fechar o app (não interceptável no iOS) | — |
| D22 | Textos por item que o Figma desenha para um só caso (nota de 06 para Hipertrofia/Geral/Manutenção; frase de 27b para os outros cinco sinais; títulos de 31/34 por objetivo) | Texto do designer para cada caso | Sem o texto, a nota/frase não aparece para os outros casos |
| D23 | 30 "Se você sair do app, a montagem continua." e `838:3972` "Foi uma falha de conexão do nosso lado." com motor local | Confirmar com A se é verdadeiro | — |
| D24 | Destino de "Entendi" em `838:4053`/`838:3689` e "Já posso treinar · declarar" sem plano registrado | — | — |
| D25 | 31 critérios do bloco de maratona (6 de 6, "O bloco pede 90 min") não chegam por nenhuma porta | CCP de leitura do `contextEvent.unmet` | Variantes `838:1478`/`838:1568` só com os cartões que têm fonte |
| D26 | 34 "Três decisões do treinador" sem fonte em PT | CCP/porta de explicação | Tela 34 sem a lista |
| D27 | `INVALID_INPUT` (#61) não tem frame | Desenho ou mapear para `838:4011`/`838:3972` | Hoje há tela inventada; mantida só até decidir |

---

## 7. Decisões recebidas em 27/11 e como foram aplicadas

**Engenharia (coordenador):** D16 o motor decide a faixa de idade (roda de 10 a 100; `838:3819` inalcançável; `838:4053` mostra só a frase
de idade quando não há gestação marcada) · D17 rodas, réguas e contadores começam em "—" e só valem depois de tocados · D13 limite inferior
· D23 frases impossíveis com o motor local não aparecem ("Foi uma falha de conexão do nosso lado.", "Se você sair do app, a montagem
continua.") — não aplicabilidade técnica, não redesenho · D27/D04 `INVALID_INPUT` e falhas → `838:3972`; resposta que falta → `838:4011`
(a pergunta de dia compartilhado segue retida, D10); prova a menos de 7 dias: o motor recusa (`INVALID_INPUT`, provado no replay) →
`838:3972` · D10 Manhã → AM, Tarde/Noite → PM, turno exigido só em 09; 09b retida ("Ajustar um dia" desabilitado) · D03 com prova as
semanas vêm da data; sem prova o envio fica retido · D05 opções visíveis, envio retido · D01/D07/D08/D11/D20/D25/D26/D15: tela cuja cópia
seria falsa fica fora (07 Prioridade, 15 Treinador, 26 Cargas, linha de veredito de 31, "Três decisões" de 34, efeito de "Conectar o Apple
Saúde"); 05 Meta e 24 Condições guardadas só localmente (a cópia não promete efeito) · D18 UI de 32 desenhada, ações retidas e
desabilitadas; 33 Assinar fora (sem preço aprovado, sem cobrança) · EN/ES PENDING_TRANSLATION.

**SSCTR (27/11):** D06 "Começar a correr" → `GENERAL` · D12 "Nunca corri" = zeros e meses 0, dias de força vêm de 25; "Já corri e parei"
= meses 0, dias de 21b, minutos/maior corrida 0 só com "Nenhum", 1–3 dias retém o envio (sem zero inventado); "Corro hoje" = contadores de
21 e 22 · D13 1/6/24 é código de faixa, nunca mostrado · D14 prédio/casa sem item: Continuar desabilitado; o texto de academia completa fica
visível antes de Continuar · D02 decidido pelo fundador (#110): item único, nunca `PREGNANCY`/`POSTPARTUM`; envio retido para essa resposta até a CCP-ONB-1 (#109).

**CCP-ONB-1 (#109) aprovada pelo fundador (27/11):** outro incremento acrescenta os campos ao contrato; as telas que dependem dela seguem
retidas até lá. **Ainda pendentes (fundador/CCP):** D01, D03 (sem prova), D04-cópia, D05, D07, D08, D09, D10 (turno opcional/por dia), D11, D15, D18
(cópia de "indisponível"/ambiente de teste), D19, D20 ("Teste", Condições), D21, D22, D24, D25, D26.

---

## 8. Desvios temporários e correções das revisões de #119 (27/11)

**Desvios temporários de cópia** (frases do Figma que o motor contradiz hoje; seguem no `copy.psv` e voltam trocando um interruptor em
`OBCopyDeviation`, `Presentation/State/OnboardingCopyDeviations.swift`; o texto final é decisão do fundador):

| Tela | Frase do Figma | Interruptor | Por quê |
|---|---|---|---|
| 12 `867:2289` | "Não sabe tudo? Você confirma no primeiro treino." | `showConfirmInFirstWorkout = false` | não há confirmação de equipamento no primeiro treino |
| 25 `838:1187` | "Sem carga conhecida, a primeira semana é uma sessão curta de prática com o peso do corpo. As cargas vêm na semana seguinte." | `showPracticeNoteAlways = false` | só é verdade com exatamente 1 dia de força e equipamento externo (matriz do replay, SSCTR C1); mostrada nesse caso |
| 27 `836:3299` | "Fica só na sua conta." (chave `ob.care.note.account`) | `showOnlyInYourAccount = false` | não há conta na V1 (#28) |
| 23 `836:2994` | "Com ele, o plano já começa com faixas de ritmo ao lado do esforço." | `showPaceBandPromiseForTest = false` | um "Teste" sem método de medida não calibra (SSCTR, CCP-ONB-1); escondida só quando "Teste" foi escolhido |

**Correções** (QRE READY_WITH_CONDITIONS, SSCTR APPROVE_WITH_CONDITIONS, revisão visual NOT_READY):
- SSCTR C4: depois de CLINICAL_HUMAN_REQUIRED o rascunho fica marcado (`heldForSafety`), retoma em "Retido por segurança", não tem revisão
  e nunca é reenviado (o replay mostra que o motor matricularia um reenvio com "Nenhum destes"). A saída é a declaração de prontidão (D24).
- SSCTR C6: "Semana 1: N corridas" conta por papel; uma caminhada opcional (`WALK`) não é corrida.
- QRE P2-3: apagamento durável do perfil local (marcador pendente; nada é lido nem gravado até a pasta sumir); 31–34 nunca ficam sobre a
  conta apagada.
- QRE P3: respiros no "Retomar" pela etapa seguinte; rascunho enviado limpo antes da espera de "Montando"; "Montar meu plano" só com pedido
  completo; fora do escopo pelo código do motor (idade → 18, população → 27, distância → 03); "Não tenho resultado" limpa o resultado.
- Visual: folhas 27b e 32 com rolagem e altura pelo conteúdo, véu atrás; 30, Retomar e 32 rolam em texto grande; data de 24 numa folha com
  "Concluir" (botão de 09b) aberta no dia escolhido; linhas de 27 no ritmo do Figma; interruptor de 29 como no Figma (desligado por padrão);
  alvos de 44 pt; P3 (ponto de hoje em 01, segundos de 10 em 10 em 05 — em 23 o resultado mantém segundo a segundo, porque é medida do
  atleta —, "anos" junto do número, barras sólidas em 28, Rafa "Regularidade", datas "sáb 24 out", barra do esporte e coluna do dia com os
  dois em 09). 31–34 nas capturas leem o registro real de Lucas (`Captures/lucas-*`, datas do Figma: 26 out a 20 dez).

---

## 9. #113 promovido ao Figma canônico (27/11) e como foi implementado

| Decisão | Nó | Implementação |
|---|---|---|
| D04 A | `1491:8266` | 04 bloqueia prova antes do início ou a menos de 7 dias dele (5 km, 10 km, meia); maratona é exceção (plano preparatório). Aviso, Continuar desabilitado, "Seguir sem prova por enquanto". **Aberto:** a nota do frame pede que as datas mínima e máxima venham do motor ou do host; até essa porta existir, o Swift repete as duas (7 dias, 16 semanas) |
| D09 A | `1491:8326`, `1491:8385` | 08 sempre fecha a etapa 1; sem prova: rótulos de 03 e 06, "sem data de prova", sem número de semanas |
| D19 A | `1491:8444` | 23 com coluna de horas na meia e na maratona; 10 km com minutos acima de 59; trocar a distância limpa a roda; envio em segundos |
| D21 A | × em 02–29, `838:4011` | × vai direto a `838:3918` (Retomar) com as respostas guardadas; sem folha de confirmação (nada se perde); `838:4219` não é usada |
| D22 A | notas de `835:2349` e `838:4148`; `1491:8511`, `1491:8556` | uma linha por objetivo de força; replay §6 (`engine-replay.txt`) confere as três novas no motor: Hipertrofia tem mais séries semanais que Geral e Manutenção e RIR 3 em todas; Geral cobre membros inferiores, tronco e superiores; Manutenção é HOLD e nunca passa o volume de Geral. Para o SSCTR: contra Força o total é igual e as séries extras vão a músculos menores; 27b com a frase do sinal (1), dos dois (2) ou a contagem (3+), INTERIM (#87) |
| D24 A | `1491:8646` | **Bloqueado.** O motor responde CLINICAL_HUMAN_REQUIRED no cadastro com `enrolled: false` e não guarda registro (replay: um reenvio com "Nenhum destes" seria matriculado). Sem registro retido, "Hoje · retido" e "Declarar" não têm o que ler nem onde declarar, e a frase "Refazer o cadastro… ou trocar de aparelho não muda este estado" seria falsa com uma marca só local. "Entendi" e "Declarar" seguem desabilitados até o host persistir a retenção (CCP) |
| D14 B | `867:2288` | "O plano conta com barra e anilhas, rack, banco, halteres e máquinas." |
| D18 conta B | `1491:8743` | sem serviço de conta (`OBBuild.accountAvailable = false`), 32 é a variante alpha local: "Continuar neste iPhone" → 33 |
| D18 assinatura A | `1491:8865` | 33 build de teste: selo, "a definir", nenhuma oferta, nada comprado; "Continuar no teste, sem cobrança" ou × → 34. "Termos de uso" e "Privacidade" sem link (não há documento) |
