# QRE: reverificação do candidato V1RWS corrigido (fase A), R2

**Veredito: `NOT_READY`.** Há 1 achado BLOCKING: QRE-RWS-B-01. O QRE-RWS-A-01 continua aberto por outro caminho: um relato do app, na versão por tempo e com `segments`, fundido com a importação do primeiro arquivo, ainda leva a faixa EASY de `[345,420]` para `[345,575]`. O ciclo corretivo já foi gasto, então a fase fecha bloqueada com esse achado nomeado.

- **Juiz:** instância nova e independente de Quality & Reliability. Não escreveu o candidato, nem a R1, nem o ciclo. Escreveu no worktree só estes dois arquivos.
- **Data:** 2026-11-13.
- **Versões:** candidato corrigido `d6381bb`; primeiro candidato `bcac30d`; base congelada `c8104c1`.
- **Registro habilitador:** `reviews/ssctr/SSCTR_V1RWS_RUN_RECORDS.json` não existia em nenhuma das minhas execuções. Conferi antes e depois da suíte (02:27:57Z a 02:29:59Z) e no fim. A autoridade padrão da fronteira ficou desligada, e todos os probes usaram a autoridade de desenvolvimento (`DEV`) dos helpers.

## Suíte e freezes (executado em `d6381bb`)

| O quê | Comando | Resultado observado |
|---|---|---|
| Suíte inteira | `node --test` em `CoachingCore/` | **1396 entradas, 1395 pass, 1 fail.** A falha é só "V1RC COACHINGCORE-V1-FREEZE-1 is preserved", com `actual: ['CoachingCore/src/r6-adaptation.mjs']`. Confirma o que o autor declarou. |
| Testes antigos editados? | `git diff c8104c1 d6381bb --name-status -- CoachingCore` | Só `M src/r6-adaptation.mjs`; todo o resto é `A`. O ciclo editou três testes do próprio candidato (`v1rws-engine`, `-format`, `-ssctr-examples`), nenhum de `c8104c1`. |
| Verificador novo | `node scripts/v1rws-freeze.mjs --preserved` | "197/197 … its diff is the reader alone, 22+/10- … 30/30", exit 0. |
| Check V1RC | `node scripts/v1rc-freeze.mjs --check 1` | DRIFT, apontando só `(FREEZE-1) CoachingCore/src/r6-adaptation.mjs`, exit 1, como esperado. |
| Prova do "só o leitor" | `verifier-strength.mjs` na cópia git de `d6381bb` | Uma constante numa linha intocada e a linha de conclusão alterada foram recusadas (`--preserved` exit 1; I10 FAIL). **Uma linha nova que muda o comportamento sem leitor, mas cita `reads` num comentário, passa nos dois** (B-03). |

## Achados da R1

| Id | Estado | Probe e saída observada |
|---|---|---|
| A-01 (era BLOCKING) | **OPEN** | `probe-a01-paths.mjs`, leve de 11 km em 63 min:<br>• Um arquivo: `[345,420]`.<br>• Fecharam (em `bcac30d` todos davam `[345,575]`): dois arquivos (nativo, versão por tempo, sem formato), correção que acrescenta o arquivo (nativa e por tempo), linha carregada sem marca, e fusão com relato nativo (UNKNOWN `SEGMENTS_NOT_MARKED_POOR`). Todos dão `[345,420]`; o relato novo tem `gpsQuality:'POOR'` e `deviceGpsQuality:'OK'`.<br>• Continuam abertos: **fusão do relato do app (versão por tempo, com `segments`, sem distância) com a importação HealthKit do primeiro arquivo (6,6 km, GPS OK)**. Mesma revisão: `[345,575]`. App e depois importação: `[345,575]`. Importação e depois app: `[345,575]`. Nos três a linha fundida tem `distanceKm:6.6`, `gpsQuality:'OK'`, `segments:1` e `partial:false`. Ver B-01. |
| A-02 | CLOSED (leitura registrada) | `PHASE_A_CORRECTIVE_CYCLE.md` §2 registra a leitura do Chief sobre a regra do Founder e a deixa exposta ao Founder, sem tratá-la como decisão nova dele. É o que a R1 pediu, no limite do que um Chief pode dar. O `--write` grava `expectedFailures:[HISTORICAL]`, mas não consegue rodar (B-04). |
| A-03 / SEC-A-02 | CLOSED. O resíduo é o mesmo já registrado. | `old-probe-attack` "F3-fabricated-row": o que é exibido é `16000` m (antes, 1000). Com `probe-r2 forge`, sete distâncias forjadas (1 a 42,195 km) entregam 16 km, sem texto da linha. Resíduo: o relato de 1,1 km em 7 min que cita a linha forjada dá `partial:false`, DISTANCE/MEASURED e `paceEvidence:true`. É idêntico ao R1 e ao SEC-RWS-A-01, nada mais amplo. |
| A-04 | **OPEN (parcial)** | Fecharam com duração conhecida: o pico de 40 km em 60 min dá UNKNOWN `MEASUREMENT_IMPLAUSIBLE`, `paceEvidence:false`, histórico `null` e CT-3 máx. 18,084. As bordas 119/121/899/901 s/km dão UNKNOWN/DISTANCE/DISTANCE/UNKNOWN. **Sem duração, a janela não se aplica**: o mesmo pico sem `minutes` dá DISTANCE/MEASURED, `paceEvidence:true`, histórico 40 e CT-3 máx. **44**; uma linha de histórico da intake sem `durationMinutes` dá `ref:40`. Ver B-02. |
| A-05 | CLOSED | `probe-r2 refused`, com o registro antes em 29 linhas: HOLD (`observations:'x'`, outro atleta, versão inválida), UNSUPPORTED (hora inválida) e revisões retroativas, com ou sem `referenceState`. Todos dão `runSessions` vazio e registro com hash igual ao de entrada. Na stale replay da R1, 39 → 39 linhas. |
| A-06 | **OPEN** | Mutação (tabela abaixo): M03, M06, M08b, M17, M14 e M32 são mortos. **M04, M08a e M18 sobrevivem.** O teste do ciclo para M04 forja a primeira linha do longão, que é a versão **TIME**, então nunca exercita a guarda. Com a linha NATIVE forjada (`probe-m04-native`), o original dá `partial:true` e o mutante dá `partial:false`. Ver B-05. |
| A-07 | CLOSED (rotulagem). A decisão segue com Product/SSCTR. | Sob `CLINICAL_HUMAN_REQUIRED`: `runFormat.prescribing:false` e 12/12 sessões futuras com `prescribed:false`, TIME e `CLINICAL_ROUTE`, inclusive na continuação. Fora da rota: `prescribing:true`, 0 `prescribed:false`. Sob HOLD não se entrega nada. |
| A-08 | CLOSED (a cópia congelada continua opcional) | `reader-returns-DISTANCE-always` dá `easyPartial:true` (antes, false). `reader-throws` dá partial. `reader-mutates-row` ainda grava `minutes:1`: a cópia congelada não foi feita, e a integração não passa opções. |
| A-09 | CLOSED, com nota | `--preserved` agora compara os bytes presentes. O resíduo lexical está em B-03. |
| A-10 | CLOSED | `fail-optionsRunFormatsGarbage`: não lança, dá `DISABLED`. `old-probe-more failclosed`: 0 de 29 casos lançam. |
| A-11 | UNCHANGED_BY_DESIGN | `old-probe-custody`: com registros, 6/6 ok e `verify:null`; sem registros, 4 ASK e 10 linhas. É a mesma integração. |
| A-12 | UNCHANGED_BY_DESIGN | Composto 47 ms contra 24 ms; registro de formatos com 118 linhas e 208 KB (era 262 KB). |
| A-13 | CLOSED | M14 e M32 agora mortos (teste SEC-RWS-A-03). |

## Outras verificações pedidas

- **SEC-RWS-A-03 (custo), com `probe-r2 cost`:**
  - Uma linha com `repeat:2e6` dá 27 ms, `unreadable:1`; 50 linhas assim dão 30 ms. A linha de referência é de 28 ms.
  - `steps` com 1e5 itens: 973 ms no composto contra 922 ms no `v1-run-index`.
  - `segments` com 1e5 itens: 717 ms contra 650 ms.
  - O custo que sobra é o do motor congelado.
- **Motor congelado:**
  - `old-probe-identity` (J1 a J4) deu **194/194 hashes iguais** entre `c8104c1` e `d6381bb`.
  - `probe-identity2` deu **82/82 iguais**. Cobre distância digitada, dois arquivos, correção que acrescenta arquivo, parada por sintoma por tempo, fusão de duas fontes, hold clínico, relato tardio e `historicalStateOf`.
  - Sem leitor, `completionRead` devolve `null`, e a expressão reduz-se exatamente a `o.actual.completed===true&&minutesOk&&setsOk`.
- **10(a):** `probe-r2 compare`, jornada só com GPS (perdida, tardia, correção, rota clínica e continuação): **0 chaves do motor diferentes** em 10 passos. Com distância digitada e `segments`, diferem `actualLedger`, `runCalibration`, `inputHash` e `trace`, como previsto.
- **10(b):** `probe-custody2` (digitada, dois arquivos, correção): 6/6 submissões ok, `verify:null`, linhas guardadas 5/5, 9/10 (a anotação da correção), 16/16, 21/21 e 26/26. Nenhum "a stored row changed".
- **10(c):** com a mesma entrada, a saída é idêntica. No replay com os registros atualizados, `runSessions`, ledger e calibração são iguais. A `proposal` vira `null`, como no `v1-run-index` (`probe-replay-x`).
- **10(d):** com registros embaralhados, só `inputHash`, `trace` e a ordem de `runFormatRecord` diferem (o conteúdo é igual como conjunto). É o mesmo resultado da R1.
- **10(e):** 154 entradas malformadas (`probe-r2 throws`), 0 exceções.

## Mutantes (61 testes v1rws, cópia git de `d6381bb`, restaurada e conferida por sha)

| # | Mutação | Resultado |
|---|---|---|
| M03 | correção cumprida sem a marca POOR | morto |
| M04 | leitor ignora a igualdade de `plannedPrescriptionHash` | **sobrevive** (teste vazio) |
| M06 | PARTIAL curto conta para a pausa | morto |
| M08a | índice: em vigor só pela data | **sobrevive** |
| M08b | histórico: `recordedOn` ignorado | morto |
| M14 / M32 | `inputHash` / atleta da linha de formato | mortos |
| M17 | leitor que lança cai nos minutos | morto (teste semântico, não só o I10) |
| M18 | formato reselecionado dentro da semana | **sobrevive** |
| N01, N03, N04 | número digitado não movido; origem de aparelho ignorada; `segments` não marcado | mortos |
| N02 | exceção RACE removida | **sobrevive** |
| N05 a N08 | bordas da janela e o implausível na conclusão e no histórico | mortos |
| N09 | implausível ignorado em `paceEvidence` | sobrevive (quase equivalente nos contínuos) |
| N10 / N11 / N13 | vários arquivos em `clear`; recuperação no casamento; envelope via `r.ok` | sobrevivem: **equivalentes** (marca POOR; recuperação constante por entrada; `try/catch`). O N13c, fiel, é morto. |
| N12 | padrão fora da rotação | **sobrevive** |
| N14 / N16 | CT-2 / CT-1 da distância mantida | mortos |
| N15 | CT-3 da distância mantida | **sobrevive** (só linha forjada) |
| N17 / N18 | limites `repeat 60` / `400 etapas` | sobrevivem (um mascara o outro) |
| N19 a N29, N32, N33 | 24 blocos; HOLD; retroativa; `completed===true` no motor; reinício X-2; `prescribed`; `prescribing`; `shaped`; repetição curta; parada por tempo; `stopOf`; motivo no histórico; regra antiga de `segments` | mortos |
| N30 / N31 | 20 arquivos / 300 km | sobrevivem (um mascara o outro) |
| N34 | motivo `MEASUREMENT_IMPLAUSIBLE` da intake | sobrevive (só o relatório de ignorados) |
| N35 | normalização aplicada às linhas carregadas | **sobrevive**: nenhum teste prova a custódia byte a byte com digitada e `segments` |

## Achados novos

| Id | Sev. | Evidência | O que fecha |
|---|---|---|---|
| QRE-RWS-B-01 | **BLOCKING** | A marca POOR é aplicada por observação, antes da fusão do motor. Um relato do app na versão por tempo, com `segments` e sem distância, mais a importação do primeiro arquivo (GPS OK) da mesma sessão, viram uma linha canônica sem marca: `distanceKm` do primeiro arquivo, `segments`, `partial:false`. A V1RC lê 6,6 km sobre 63 min, e a faixa EASY exibida vai de `[345,420]` para **`[345,575]`**. Acontece na mesma revisão e nas duas ordens entre revisões (`probe-a01-paths`). É o fluxo D-1 de cliente conforme, sem forja. A afirmação do ciclo ("todo relato novo com `segments` é gravado POOR, na versão nativa e na por tempo") não vale para a linha fundida. | Nenhuma linha canônica com `segments` e distância, inclusive a fundida, chega à V1RC como evidência de ritmo. Precisa de teste nas três ordens, comparando a faixa com o controle de um arquivo. |
| QRE-RWS-B-02 | CONDITION | A janela de plausibilidade só se aplica quando há duração. Um relato nativo `completed:true` com 40 km por GPS e sem `minutes`/`seconds` dá DISTANCE/MEASURED, `paceEvidence:true` e histórico 40, e o CT-3 do longão seguinte vai a 44. Uma linha de histórico da intake sem `durationMinutes` dá `ref:40`. | Sem duração, nada de MEASURED, `paceEvidence` ou histórico (ou exigir a duração), com teste. |
| QRE-RWS-B-03 | NOTE | `readerAlone` (e o I10) aceitam qualquer linha `+` que contenha a palavra `reads`. A linha `if(s.sport==='RUN')o.actual.completed=true; // reads`, que muda o motor sem leitor, passa em `--preserved` (exit 0) e no I10. O `--check` posterior compara o sha do diff gravado. | Comparar as linhas acrescentadas com o texto exato esperado, ou com o diff gravado no `--write`. |
| QRE-RWS-B-04 | CONDITION | No ramo `--write` de `scripts/v1rws-freeze.mjs`, a linha 79 (`if(total-passed!==1)`) usa `passed`/`total`, que só são declarados por `const` na linha 82 do mesmo bloco. Com todas as outras checagens passando, isso dá `ReferenceError: Cannot access 'total' before initialization`, e o registro V1RWS-1 não pode ser gravado. A conclusão vem da leitura do código e da reprodução do padrão; não rodei `--write`, que é proibido. Além disso, "exatamente uma falha" é conferido sobre os números que o operador digita, sem verificar qual teste falhou. | Declarar antes de usar. Conferir a identidade da falha (por exemplo, rodando o teste histórico e exigindo que acuse só o arquivo emendado). |
| QRE-RWS-B-05 | CONDITION | Fecha a A-06 só em parte. O teste "QRE-RWS-A-06 (M04)" passa pela razão errada, porque forja a linha TIME. M08a (uso do índice para o `prior` de qualidade) e M18 (a fiação de `reselectRunSession` no índice) não têm teste pelo ponto de entrada. | Um teste que mate cada um destes três. |
| QRE-RWS-B-06 | NOTE | Lacunas de teste em linhas novas: N02 (exceção RACE), N35 (identidade das linhas carregadas), N12, N15, N34, e os pares mascarados N17/N18 e N30/N31. | Opcional, ou junto com a B-05. |
| QRE-RWS-B-07 | NOTE | Uma corrida contínua cumprida com muita caminhada, acima de 15:00/km (por exemplo, 15:30), dá UNKNOWN `MEASUREMENT_IMPLAUSIBLE` e pede "confirmar ou corrigir". Não é creditada e não conta para a pausa. A janela foi levada ao SSCTR pelo ciclo. | Leitura do SSCTR. |

## O que rodei

- A suíte inteira, `--preserved` e `v1rc-freeze --check 1` no worktree.
- Os probes da R1, copiados para o meu scratch: `p1control`, `attack`, `more`, `identity` (nos dois worktrees), `custody` e `m03`.
- Probes meus:
  - `probe-a01-paths`, também contra a cópia de `bcac30d` da R1, para comparar;
  - `probe-r2` (cost, plaus, refused, clinical, forge, replay, throws, compare);
  - `probe-replay-x`, `probe-identity2` (nos dois worktrees), `probe-custody2`, `probe-m04`/`-native` e `verifier-strength`;
  - `mutate-r2` (45 mutantes).
- Tudo está em `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/2e948744-f019-40c7-9630-ece3b7d8a9e9/scratchpad/judges/qre-r2/`.
- A cópia de mutação é um `git clone --no-checkout` do repositório, com checkout de `d6381bb` e `node_modules` copiado. Alguns arquivos de `audits/` que o runtime não lê não foram extraídos por caminho longo; ali os 61 testes v1rws dão 61/61. A cópia foi restaurada e conferida por sha.
- **Incidente, corrigido:** um redirecionamento meu criou por engano quatro arquivos de saída na raiz do worktree (`id-c8104c1.json` e `attack-d6381bb.json` vazios, `id-b.err` e `attack.err`, os dois com erros de "module not found"). Removi esses quatro por nome; `git status` ficou limpo em seguida e no fim.

## O que não verifiquei

- Valores esportivos: a janela 120–900, a exceção RACE e a mudança da entrada do exemplo WE3A-10. São do SSCTR.
- O comportamento com o registro habilitador presente.
- `--write`/`--check` do V1RWS, porque são proibidos e o registro não existe.
- As jornadas e o fuzz da V1RC.
- A suíte inteira sob cada mutante: rodei só os 61 testes v1rws.
- HealthKit real.
- Segurança da custódia.

## Contexto injetado pelo host

Nada disto foi usado como evidência.

| Arquivo | sha256 |
|---|---|
| CLAUDE.md global | `c75718d0d2fe2cce1332cf7240ef0b8013ca2901d52b4d6778480c1c333709c6` |
| CLAUDE.md do projeto | `e657d059e06fd1a21613250753a8c79ac605b69d955191d634966b3c8fc922e6` |
| MEMORY.md | `0ca62e8bd22cf8b3653c200906f59300d472af0bf7f7526e0e4b59b8adbbb4fd` |
