# SSCTR — reverificação do V1RWS (fase A), r2 — 2026-11-13

**Veredito: BLOCK.** O registro habilitador de `V1X-RUN-NATIVE` **não foi emitido.**

Falta fechar uma coisa antes de habilitar: **SSCTR-RWS-B-01**. Uma parada por sintoma some quando outro relato da mesma sessão conflita com ela. O caso comum é o relato no app mais a importação do relógio de uma corrida interrompida. É a mesma função de segurança que a revisão r1 exigiu antes de habilitar (A-01). O ciclo corretivo foi gasto, então a fase fecha bloqueada com este item nomeado.

- **Candidato:** `d6381bb`; o primeiro candidato foi `bcac30d`.
- **Hashes conferidos:**
  - r2 `daf3d7a2…2213`, r3 `6b96d769…08e2`, r3a `37047d21…d412`;
  - `RUN_FORMATS_V1.json` `26c6e3fb…353c`, igual a `FORMAT_VALUES_SHA256`.
- **Revisor:** instância SSCTR nova (claude-opus-5-5), PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, sem credencial humana. Não escreveu o candidato, o ciclo, as decisões nem a r1. Não houve revisão humana, validação empírica nem juízo clínico.

## Condições da r1

| id | estado | evidência |
|---|---|---|
| A-01 | **ABERTA** (B-01) | Num relato sem conflito, a parada é lida em toda expressão: por tempo (leve, longão, qualidade), D-5 e nativa. Vale para SYMPTOM, sem motivo, nulo, fora da lista e minúsculo. Resultado: triagem REQUIRED e tudo à frente por tempo (72 formas, 0 falhas). FATIGUE, PACING, CHOICE e TIME nunca a pedem. A linha do motor fica idêntica byte a byte (36/36). Um relato **em conflito** não é lido (abaixo). |
| A-02 | FECHADA | MANUAL, `manual` ou sem fonte vão para `manualDistanceKm` (12/12). Sem P1, sem faixa e semana 3 por tempo; a V1RC congelada leria 300. Seis relatos digitados a 3:20/km não aparecem na calibração. Digitado num nativo dá UNKNOWN DISTANCE_SOURCE_REQUIRED. GPS ou TRACK declarado, id de atividade ou qualidade WEARABLE seguem como medida. Condição de integração: B-03. |
| A-03 | FECHADA | Oráculo próprio da X-2 (r3 + r3a + regra da r1): 30.940 sequências, 0 divergências. A sessão por tempo abortada é lida como incompleta pelo motor. |
| A-04 | **ABERTA como condição do registro** (não pré-habilitação) | Passo planejado abaixo de 5 min: 5.760 formatos, 0 `true`. Mas a regra lê o passo planejado: na PIRÂMIDE os flancos chegam a 2,75 min com `paceEvidence` true (1.996 de 4.236). A perda de um nível do GPS não é levada. Sem leitor na fase A. |
| A-05 | FECHADA (conteúdo) | Linha de parar/caminhar e duração estimada em todas as repetições (189.000 seleções). A redação final é de Product (RWS2-G.6). |
| A-09 | FECHADA | O histórico mapeia motivo ausente ou fora da lista para SYMPTOM, como o leitor. |
| A-13 | FECHADA | A nota cita `v1rws-format.test.mjs`. |

## Decisões pedidas

- **2. Escopo da prova (RACE): CONFIRMADO.**
  - A prova é só por tempo; nenhum leitor por distância a toca.
  - A V1RC lê a prova pelas próprias camadas: MANUAL dá confiança LOW, margem 0,06 (OFFICIAL: HIGH, 0,025). Sem fonte, dá REJECTED MEASUREMENT_UNKNOWN.
  - A condição 4 da r3a A1 aceita exatamente essa marcação.
  - A P1 nunca lê prova.
  - A exceção vale só para RACE; RACE_TOUCH segue a regra.
- **5a. Vários arquivos: FIEL à r3a.**
  - O WE3A-10 marcado dá DISTANCE MEASURED, 16,1 km, referência 16,1, nível GPS.
  - Fica fora da P1 e do S3, como a corrida corrigida (WE3A-02); o S2 por 16,1 continua.
  - O `reliability: POOR` é marcador de engenharia. A falha do aparelho se lê em `deviceGpsQuality`.
- **5b. Janela 120–900 s/km: ACEITÁVEL como limite de engenharia; não precisa de decisão esportiva.**
  - É a janela da própria V1RC (QRE-V1RC-07).
  - A borda lenta fica a 1,8 × o ritmo de dimensionamento ou mais (225 casos).
  - Resíduo: B-04.
- **5c. Rota clínica e hold: ROTULAR é aceitável para o candidato sintético.**
  - A r2/r3 já mandam HOLD e CLINICAL para TIME, a dose canônica.
  - A V1RC, sob hold, também mantém só a orientação por esforço.
  - Condição para uso com atleta: uma sessão com `prescribed: false` nunca é oferecida como treino a fazer, iniciada ou contada como esperada (SSCTR-05). Product escolhe entre reter e mostrar como pausada.
- **5d. Formato da semana: FIEL à N10.**
  - 171 conferências no meio da semana (126 nativas): 0 mudanças.
  - As entradas ficam ancoradas no primeiro dia da semana; linha forjada nunca é entregue.
  - Resíduo: B-05.
- **6. Sem regressão esportiva.**
  - Mesmas entradas em `bcac30d` e `d6381bb`: 189.000 repetições e 95.040 contínuos, 0 diferenças de padrão, blocos, hash, estimativas ou dimensionamento.
  - Na leitura da execução, toda diferença vem de segmentos, da janela ou do limite de 5 min. Nenhuma dá mais crédito, mais evidência de ritmo ou referência maior.
  - Exemplos r2/r3/r3a: 10/10. F-1 como decidido: WE-17 = 1 × 2600 m + 1 × 15 min.

## Achados novos

| id | severidade | o quê | fecha com |
|---|---|---|---|
| SSCTR-RWS-B-01 | **BLOCKING** | O atleta para por sintoma e registra no app (`completed:false`, `stop`). A importação do relógio da mesma corrida vem com `completed:true`. O motor marca a linha CONFLICTED e põe o outro relato em quarentena. A extensão só lê linhas sem conflito: triagem não pedida e até 4 sessões nativas na semana seguinte. Se a importação chega antes, a parada não fica em linha nenhuma. O motor congelado não lê parada. Já existia em `bcac30d`. Sondas p1c, p1d, p1f, p1c-old. | Ler a parada declarada em todo relato recebido ou guardado, inclusive em linha em conflito ou relato em quarentena. Serve só para exigir a triagem: nunca crédito, X-2 ou dimensionamento. Teste dirigido nas três ordens e nas duas expressões. Ou um contrato de cliente verificado pelo QRE. Depois, reverificação estreita por SSCTR nova, que pode emitir o registro. |
| SSCTR-RWS-B-02 | CONDITION (antes de integração ou de atleta real) | Sob ASK por elegibilidade não avaliada, saem 11 de 12 sessões nativas com `prescribing: true`; a V1RC lê essa resposta como não prescritiva (R-02). | **Decisão desta revisão:** sob ASK cujas entradas faltantes incluem a elegibilidade atual, as corridas vão por tempo, e `prescribing` segue a leitura da V1RC. Outros ASK não mudam. Item de fila proposto: HQ-V1RWS-A-SSCTR-R2-ELIGIBILITY-ASK. |
| SSCTR-RWS-B-03 | CONDITION (integração; Data/iOS, QRE) | O ADF mapeia todo treino externo com distância como GPS, inclusive treino digitado no Saúde. Um relato só com `canonicalActivityId` mantém a distância, a V1RC a lê na P1 (faixa 300) e o leitor da extensão a lê como manual. | Mapear treino digitado como MANUAL e usar um teste único de "aparelho". |
| SSCTR-RWS-B-04 | NOTE | Uma corrida inteira acima de 900 s/km vira UNKNOWN e não conta para a X-2 (28 casos da varredura). É cauda. | Gatilho de revisão com dados reais. |
| SSCTR-RWS-B-05 | NOTE | Se a estrutura mantida deixa de passar com o mesmo hash, a troca é por uma nova seleção, não por TIME. Hoje não ocorre (0/171). | Fase B: banda de `BAND_OF` fixa na semana, ou TIME. |
| SSCTR-RWS-B-06 | NOTE | Fora do escopo da A-02: a recalibração da V1RC aceita ritmo de trabalho digitado. A fronteira não muda isso. | Dono da V1RC. |

## O que rodei

- `sha256sum` dos registros, dos valores e dos arquivos do host.
- `node --test test/v1rws-*.test.mjs`: 61/61; exemplos: 10/10.
- Sondas A, B, C e E da r1, como ferramenta: 0 divergências.
- Sondas próprias (p1–p5) em `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/2e948744-f019-40c7-9630-ece3b7d8a9e9/scratchpad/judges/ssctr-r2/`.
- Cópia de `bcac30d` via `git archive` na mesma pasta, só para a comparação.
- Não rodei `npm run verify`, `verify-r*`, `*-freeze`, `v1rc-journeys`, `v1rc-fuzz` nem `validate_records.py`.

## O que não revisei

- Itens do QRE: a emenda do motor além da identidade da linha, freezes, custódia.
- Security/Data; F-2 e F-3.
- Fase B, EQUIVALENT e a r1 das decisões.
- A redação final.
- Cobertura fora das grades.
- O hold F08 (lido no código, não executado).
- Literatura nova: WebSearch e WebFetch estavam disponíveis e não foram usados; nenhuma afirmação científica nova é feita.

**Contexto injetado pelo host (divulgado):**
- CLAUDE.md global (`c75718d0…09c6`).
- CLAUDE.md do projeto (`e657d059…22e6`).
- MEMORY.md (`0ca62e8b…b4fd`).

Lidos só como contexto; nada da memória serviu de evidência.
