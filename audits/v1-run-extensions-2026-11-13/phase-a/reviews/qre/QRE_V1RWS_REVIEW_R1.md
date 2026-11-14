# QRE — revisão independente do candidato V1RWS (fase A), R1

**Veredito: `NOT_READY`** — 1 achado BLOCKING (QRE-RWS-A-01), 6 CONDITION, 6 NOTE.

- **Juiz:** Quality & Reliability Engineer, instância independente. Não escreveu o candidato e não editou nenhum arquivo do worktree além destes dois.
- **Data:** 2026-11-13.
- **Candidato:** `bcac30d` (`claude/v1-run-extensions`). **Base congelada:** `c8104c1` (worktree `v1-run-calibration`).
- **Contexto injetado pelo host:** CLAUDE.md global (`c75718d0…09c6`), CLAUDE.md do projeto (`e657d059…22e6`), MEMORY.md (`0ca62e8b…b4fd`). Nada disso foi usado como evidência.

## Suíte e freezes (executado)

| O quê | Comando | Resultado observado |
|---|---|---|
| Suíte do candidato | `node --test` em `CoachingCore/` | 1384 entradas, 1383 pass, 1 fail. A falha é `test/v1rc-calibration.test.mjs:325` "V1RC COACHINGCORE-V1-FREEZE-1 is preserved", com `actual: ['CoachingCore/src/r6-adaptation.mjs']`. As 1384 entradas são 1334 antigas, 49 novas e a entrada de arquivo `test/v1rws-helpers.mjs`. |
| Testes antigos editados? | `git diff c8104c1 bcac30d --name-status -- CoachingCore` | Só `M src/r6-adaptation.mjs`. Os outros arquivos são `A`, e em `test/` só há `v1rws-*` adicionados. |
| Snapshot congelado | `node --test` em `v1-run-calibration/CoachingCore` | 1334/1334. `git status` vazio antes e depois. |
| Check V1RC no snapshot | `node scripts/v1rc-freeze.mjs --check 1` (em `c8104c1`) | "30 added files match; COACHINGCORE-V1-FREEZE-1 preserved 198/198", exit 0. |
| Check V1RC na linha | `node scripts/v1rc-freeze.mjs --check 1` (em `bcac30d`) | DRIFT, apontando só `(FREEZE-1) CoachingCore/src/r6-adaptation.mjs`, exit 1 (esperado pela V6). |
| Verificador novo | `node scripts/v1rws-freeze.mjs --preserved` | "197/197 files byte-identical, 1 amended (its base is the recorded bytes); …V1RC 30/30", exit 0. |

## Achados

| Id | Sev. | O quê | Probe e saída observada | O que fecha |
|---|---|---|---|---|
| QRE-RWS-A-01 | **BLOCKING** | Uma corrida MEASURED feita em dois arquivos (`actual.segments[]`, contrato D-6) entra na V1RC como observação de ritmo leve, com a distância **só do primeiro arquivo** sobre os minutos **totais**. Isso move a faixa EASY exibida ao atleta e o P1 que dimensiona os contínuos. A extensão a lê como DISTANCE/MEASURED com `paceEvidence:true`. A V1RC congelada lê `actual.distanceKm`, que a extensão nunca reescreve, e o ponto de entrada não marca a linha (como faz com a correção). | `probe-p1control.mjs`: leve de 11 km em 63 min. Em um arquivo, a faixa EASY da semana 5 é `[345,420]`. Em dois arquivos (6,6 + 4,4 GPS OK), é **`[345,575]`**: 63 min / 6,6 km = 573 s/km, contra o ritmo real de 344. Marcando POOR, dá UNKNOWN e `[345,420]`. | Uma linha com `segments` nunca pode chegar à V1RC como evidência de ritmo com a distância parcial (por exemplo, marcá-la `POOR` no ponto de entrada, como na correção, ou outra regra que o SSCTR aceite), com um teste que compare a faixa com a do controle em um arquivo. |
| QRE-RWS-A-02 | CONDITION | F-2: o critério 11.1 ("suíte inteira verde") não pode ser cumprido ao pé da letra na linha comum sem editar um teste antigo, o que é proibido. | Ver suíte acima e a leitura de F-2 abaixo. | Uma decisão registrada (Founder/Chief, no registro `V1RWS-1`): 11.1 na linha = verde, exceto `v1rc-calibration.test.mjs:325`, que deve acusar **só** `r6-adaptation.mjs`; o I10 é o invariante vivo e o teste histórico fica verde em `c8104c1`. |
| QRE-RWS-A-03 | CONDITION | F-3 confirmado: uma linha de formato fabricada e coerente (hashes recalculados) é lida e vira o formato **assentado**. Ela é então reentregue ao atleta e dá crédito. O Core não tem como detectá-la. | `probe-attack.mjs` "F3-fabricated-row": longão de 16 km trocado por `STEADY 1000 m`. `resolves:true`, `settledIsFabricated:true`, `runSessions` mostra `1000` m. O relato de 1,1 km em 7 min dá `partial:false`, DISTANCE/MEASURED, `paceEvidence:true`. | Integração: os três registros sob a cadeia com chave da custódia (G7). Recomendado: o Core reconfere E1–E3/CT-1..3 de um formato assentado antes de reentregá-lo. |
| QRE-RWS-A-04 | CONDITION | Distância implausível aceita como medição. Um pico de GPS (40 km num leve de cerca de 60 min) vira DISTANCE/MEASURED com `paceEvidence:true` e `extentKm:40`, e o L30 afrouxa o CT-3 para 44 km por 30 dias. A soma de `segments` não tem limite. A V1RC já recusa ritmos fora de 120–900 s/km (QRE-V1RC-07); a extensão não. | `probe-more.mjs spike`: `easyExec {DISTANCE, paceEvidence:true, extentKm:40}`; longão da semana 3 com `CT-3 {value:16,max:44}`. `probe-attack.mjs` "segments-huge": 300 × 300 km dá `extentKm:90001`, DISTANCE. | Uma janela de plausibilidade (km × minutos) antes de MEASURED, `paceEvidence` e o histórico, com teste. A fase B (SC-3) não pode herdar `paceEvidence:true` de uma medição implausível. |
| QRE-RWS-A-05 | CONDITION | O registro de formatos ganha linhas em revisões que o motor recusa ou que são retroativas. A V1RC, no mesmo caso, não registra nada (QRE-V1RC-02). | `probe-attack.mjs` "stale-replay": a revisão da semana 1 reenviada depois da semana 2 dá `HOLD` ("Reference state integrity…"), e o `runFormatRecord` passa de 39 para **51** linhas, com `recordedAt` da revisão velha. `observations:'x'` também dá HOLD e 16 sessões emitidas. | Não anexar em `HOLD`/`INVALID_INPUT`/`UNSUPPORTED` nem com `asOf` anterior ao registro, com teste. |
| QRE-RWS-A-06 | CONDITION | Adequação dos testes: sobrevivem mutantes em regras que importam (tabela abaixo). M03 tem consequência verificada: sem a guarda `markedPoor`, a fusão (relato do app com `declared` + importação curta com GPS OK) vira CONFIRMED_CORRECTION com GPS OK, que a V1RC leria como ritmo. Sem teste também: M04 (D-5, hash da dose), M06 (X-2, PARTIAL neutro), M08a/M08b (corte `recordedOn`, a metade "corte" do I9), M17 (leitor que falha = UNKNOWN, a garantia de falha fechada do comentário do motor) e M18 (D-4, formato fixo na semana). | `mutate.mjs` sobre a cópia `copy-bcac30d` (os 49 testes novos). `probe-m03.mjs`: original `UNKNOWN`, partial; mutado `DISTANCE/CONFIRMED_CORRECTION`, `gpsQuality:'OK'`, `v1rcWouldReadAsComparable:true`. | Um teste que mate cada um desses mutantes. |
| QRE-RWS-A-07 | CONDITION | Sob `CLINICAL_HUMAN_REQUIRED`/`HOLD`, `runSessions` traz as prescrições canônicas inteiras em etapas TIME (`unavailable.native:'CLINICAL_ROUTE'`), enquanto o motor diz "no dependent prescription" e a V1RC retém a orientação (`WITHHELD_HOLD`). Segue a letra do handoff §6 ("sempre TIME"), mas um consumidor pode exibir treinos durante a rota clínica. | `probe-more.mjs clinical`: `sessionsUnderClinical:20`, 12 futuras com `CLINICAL_ROUTE`. | Uma leitura de Product/SSCTR: reter ou rotular as sessões como não prescritas sob rota clínica/hold. Escalado; não é decisão do QRE. |
| QRE-RWS-A-08 | NOTE | D-1: a chave exportada aceita qualquer função em **qualquer** ponto de entrada. O motor dá DISTANCE por cima de `completed:false`, passa a linha mutável ao leitor e lê lixo como "sem leitura" (regra dos minutos). O leitor composto é puro e nunca dá DISTANCE com `completed:false`. | `probe-attack.mjs` "reader-*", via `v1-index` com a chave: `returns-DISTANCE-always` dá a corrida não feita `easyPartial:false`; `mutates-row` grava `minutes:1`; `throws` dá partial (fechado); string ou objeto de lixo dá o mesmo que sem leitor. | Defesa em profundidade (opcional): exigir `actual.completed===true` para DISTANCE e entregar ao leitor uma cópia congelada. A integração não passa opções. |
| QRE-RWS-A-09 | NOTE | `--preserved` não olha os bytes atuais do arquivo emendado: só confere que o blob em `c8104c1` tem o hash registrado. Uma mudança não declarada em `r6-adaptation.mjs` passa por ele; só `--check` (depois do `--write`) compara o novo sha e o diff. Os JSON de registro são lidos do worktree sem hash próprio (inalterados pelo git). | Leitura de `scripts/v1rws-freeze.mjs` (`preserved()` exclui `AMENDED`; `baseOk` usa `blob(rc.commit)`). O I10 cobre o diff de forma textual, com regex permissiva para linhas `+`. | Na `--write`/`--check`, provar o "só o leitor" (hoje só no I10). |
| QRE-RWS-A-10 | NOTE | Uma autoridade de desenvolvimento malformada (`options.runFormats` com `values:{}`) faz `evaluateProgram` **lançar** (linha 175, fora do `try`). | `probe-more.mjs failclosed`, "optionsRunFormatsGarbage": `TypeError … reading 'declaredFailureReasons'`. Os outros 27 casos malformados não lançam e não dão formato nativo com programa recusado. | Ler a autoridade dentro do `try` ou validar `values`. Só desenvolvimento. |
| QRE-RWS-A-11 | NOTE | Sob custódia sem os registros da extensão ao lado, toda revisão com relato nativo vira ASK, e a revisão **inteira** (força e corridas por tempo) não é gravada. Falha fechada, mas perde a semana. | `probe-custody.mjs`: com registros, 6/6 ok, `verify:null`, 30 linhas, nenhuma "stored row changed". Sem registros, 4 de 6 revisões ASK e 10 linhas gravadas. | O mesmo do A-03 (persistência na custódia). |
| QRE-RWS-A-12 | NOTE | Custo e tamanho. | `probe-more.mjs perf` (12 semanas): composto 67 ms contra `v1-run-index` 32 ms; `runFormatRecord` com 118 linhas e 262 KB (2,7× o ledger de 96 KB), reenviado a cada revisão. | Nada para a fase A; considerar compactação na integração. |
| QRE-RWS-A-13 | NOTE | Mutantes sobreviventes de baixo risco: M14 (`inputHash` do formato) e M32 (atleta da linha de formato). M26/M26b são equivalentes (checagem CT-3 redundante com o início do laço); o M26c não equivalente é morto. | `mutate.mjs`. | Opcional. |

## Leitura de F-2

É uma **diferença esperada e declarada**, não uma regressão nem, por si, um bloqueio de comportamento.

Evidência:
- O teste falha só porque é um verificador de freeze escrito como teste e acusa exatamente `r6-adaptation.mjs`.
- Sem leitor, `v1-index` e `v1-run-index` dão saídas byte-idênticas às de `c8104c1` em 194 saídas de 4 jornadas minhas (ver T16).
- O snapshot fica 1334/1334 e `v1rc-freeze --check 1` fica verde nele.
- `--preserved` dá 197/197 e 30/30.
- O I10 mantém o alarme: falha se um segundo arquivo congelado mudar.

O critério 11.1, porém, não se cumpre como está escrito, e editar o teste é proibido. Por isso é CONDITION (A-02), e o que a resolve é uma decisão registrada de governança, não uma mudança de código.

## Leitura de D-1

**Aceito o desvio.** Ele mantém as garantias do §5 e é superior ao desenho do handoff no caso da fusão:
- Nenhum `completionRead` do cliente é lido em lugar nenhum: o motor nunca lê o campo.
- Os pontos de entrada antigos ficam inalterados.
- A leitura é recalculada em toda avaliação, sobre a linha canônica.
- O `historicalStateOf` reproduz a avaliação ao vivo (T19).
- A identidade de replay não muda (o R2 do preflight deixa de existir).

Verifiquei a fusão: o relato do app (cita `formatHash`, sem distância) e a importação (16,05 km, sem `formatHash`) dão uma linha, `partial:false` e DISTANCE/MEASURED, nas duas ordens e também em duas revisões (a primeira dá UNKNOWN ou TIME; a segunda, DISTANCE). O leitor é chamado uma vez na linha fundida (`calls:[{eventId:'app-long',km:16.05,fh:true}]`).

Riscos novos, nenhum bloqueante:
- A capacidade exportada vale em todo ponto de entrada (A-08).
- O motor confia no DISTANCE do leitor acima de `completed:false` e entrega a linha mutável.
- A falha fechada (exceção dá UNKNOWN) funciona (`reader-throws` dá partial), mas não tem teste (M17).
- Não há não-determinismo com o leitor composto (`repeat:true`).

## Mutantes (49 testes novos, cópia em scratch; o I10 é excluído porque a cópia não é repositório git)

| # | Linha mutada | Mutação | Resultado |
|---|---|---|---|
| M01 | E2, referência do flanco | flanco usa a repetição do passo | morto (T12, T13 R2, T4) |
| M02 | piso 0,91 | 0,85 | morto (T7/T20, T13 R3A) |
| M03 | `markedPoor` exigido na correção | removido | **sobrevive** (consequência verificada) |
| M04 | igualdade `plannedPrescriptionHash` no leitor | removida | **sobrevive** |
| M05 | fase antes da experiência (contínuos) | experiência real na fase | morto (T9, T4…) |
| M06 | X-2, PARTIAL neutro | conta para a pausa | **sobrevive** |
| M07 | dedup por id de atividade (histórico) | removido | morto (H2) |
| M08a | `inForce` do índice (`recordedOn`) | só data | **sobrevive** |
| M08b | `inForce` do histórico (`recordedOn`) | só data | **sobrevive** |
| M09 | precedência STOPPED | desligada | morto (T16, T18…) |
| M10 | motor: lê completed/minutos antes do leitor | `…||read==='DISTANCE'` | morto (T16, T7…) |
| M10b | motor: ignora o leitor | sem leitor | morto (T6, T16…) |
| M11 | POOR na correção (tidy) | não marca | morto (I7/T3, T7) |
| M12 | tira `completionRead` (tidy) | não tira | morto (T18, T3 custódia) |
| M14 | `inputHash` da linha de formato | sem checagem | sobrevive |
| M15 | formato desconhecido novo vira ASK | gravado | morto |
| M16 | histórico = menor dos fatos | maior | morto (T7, H6…) |
| M17 | motor: leitor que lança vira UNKNOWN | vira null (minutos) | **sobrevive** |
| M18 | D-4, formato assentado reentregue | sempre reseleciona | **sobrevive** |
| M21 | triagem depois da parada por sintoma | qualquer triagem limpa | morto (T14 R3 C4) |
| M22 | motor: `canonicalRecord` com leitor | sem leitor | morto (I2/T19) |
| M23 | motor: vinculação sob hold clínico | sem leitor | morto (I2/T19) |
| M24 | motor: `ctx.reads` (viewMovedBy, gapAnsweredBy) | sem leitor | morto (I2/T19) |
| M25 | E1, borda baixa | removida | morto (T5, T12) |
| M26 / M26b | CT-3, só a checagem ou só o início do laço | removida | sobrevive: **equivalente** |
| M26c | CT-3 inteiro | removido | morto (T12, T13 R3A) |
| M27 | DECLARED só sem medição | com medição curta | morto |
| M28 | `paceEvidence` exige `clear` | ignora | morto (T13 R3) |
| M29 | SC-1: `execution.completed` pela linha do motor | pelo campo cru | morto (T16, I6) |
| M30 | registro sem formato dá HOLD | ignorado | morto |
| M31 | parada sem motivo = SYMPTOM | OTHER | morto |
| M32 | atleta da linha de formato | sem checagem | sobrevive |
| M33 | atleta da linha de histórico | sem checagem | morto (T15) |

## O que rodei

- A suíte inteira nos dois worktrees.
- `v1rc-freeze --check 1` nos dois e `v1rws-freeze --preserved`.
- `probe-identity.mjs`: 4 jornadas minhas, com correção, relato tardio, hold clínico e sua continuação, sessão perdida, retorno de pausa, replay, fusão de duas fontes, ledger invertido, `completionRead` forjado e restart, mais o `historicalStateOf` por semana. Rodei pelos dois worktrees: **194/194 hashes iguais**.
- `probe-attack.mjs`, `probe-more.mjs` (order, p1, spike, failclosed com 28 casos, clinical, horizon, perf), `probe-clinobs.mjs`, `probe-p1control.mjs`, `probe-custody.mjs`, `probe-m03.mjs` e `mutate.mjs` com 33 mutantes.
- Todos os probes estão em `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/2e948744-f019-40c7-9630-ece3b7d8a9e9/scratchpad/judges/qre/`. As mutações foram feitas só na cópia `copy-bcac30d`, restaurada byte a byte (sha conferido).

Outras observações confirmadas:
- **Determinismo:** a mesma entrada dá a mesma saída. Com registros embaralhados, `runSessions` e os registros como conjunto são iguais; só `inputHash`, `trace` (do próprio motor, igual em `v1-run-index`) e a ordem das linhas carregadas mudam.
- **D-3:** nada exibido fica fora do registro (0 em 3 revisões).
- **D-4:** o formato da semana é igual nos dias 0 e 3 e depois de um resultado de prova. Um formato provisório citado depois da virada resolve, sem ASK.
- **Clínico primeiro:** formato desconhecido ou registro sem formatos, junto com dor, dão `CLINICAL_HUMAN_REQUIRED`. O motor não tem rota clínica dentro de uma observação (resposta ADVERSE e campos de dor dão MODIFY no motor), então o ASK ou HOLD da extensão não antecipa nenhuma rota clínica.
- **Atividade vinculada e solta ao mesmo tempo:** conflito `ACTIVITY_BOUND_TO_TWO_SESSIONS`, nada concluído.
- **`completed:false` com a distância cumprida:** PARTIAL.
- **Relato que cita o hash da versão por tempo:** lido pelos minutos.

## O que não verifiquei

- A fidelidade esportiva do catálogo, dos valores e dos exemplos (F-1, WE-17): é do SSCTR.
- Segurança e Data da custódia com os três registros.
- O comportamento num cliente iOS real ou com HealthKit real; todos os dados são sintéticos.
- As 25 jornadas e o fuzz da V1RC pelo ponto de entrada composto: não rodei `v1rc-journeys`/`v1rc-fuzz`, que são proibidos. Usei o I1 do autor e as minhas 4 jornadas.
- `v1fc-freeze --check 1` no worktree V1FC.
- `v1rws-freeze --check`, porque ainda não existe registro `V1RWS-1`.
- Se o `wellbeing` com sinais de alerta que usei é a forma completa F08; o motor sozinho não o roteou (KEEP).
