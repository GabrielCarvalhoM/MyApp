# V1 Run Extensions — patch pós-freeze do QRE-RWS-E-01: encerramento (2026-11-15)

**Estado final: `APPROVED_SYNTHETIC_CANDIDATE`, com condições. QRE-RWS-E-01: fechado.**

- Os dois juízes liberaram o candidato `f8b08aa`, com condições e sem bloqueio. A missão previa uma revisão; ela foi feita, e não houve correção depois dela.
- O registro habilitador de `V1X-RUN-NATIVE` foi **confirmado pelo SSCTR** para os bytes do patch, num registro novo. O de `phase-a/` não foi editado.
- O freeze sucessor `COACHINGCORE-V1-RUN-FORMAT-FREEZE-2` (V1RWS-2) é escrito a partir do commit que contém este arquivo. O registro dele fica em `E01_PATCH_FREEZE_V1RWS_2.md`, nesta pasta. O V1RWS-1 fica como está.
- **Isto é um candidato sintético aprovado.** Não autoriza atleta real, integração nem produção. O Race Forecast não foi iniciado. Nada foi enviado (push) nem mesclado.

## 1. Vereditos (como recebidos, em `reviews/`)

| Juiz | Veredito | Arquivo |
|---|---|---|
| Quality & Reliability | `READY_WITH_CONDITIONS`, nenhum BLOCKING. **QRE-RWS-E-01: CLOSED** | `qre/QRE_V1RWS_E01_PATCH_R6.md` e `.json` |
| SSCTR, focal | `ACCEPT_WITH_CONDITIONS`, nenhum bloqueio. A condição do registro: **cumprida no Core** | `ssctr/SSCTR_V1RWS_E01_PATCH_R6.md` e `.json`; adendo `ssctr/SSCTR_V1RWS_E01_PATCH_R6_ADDENDUM.md` |
| Security, focal | não pedida. O juiz de Quality conferiu que o diff não toca a fronteira de registros e disse que não é necessária (seção 8 do parecer dele) | — |

**Confirmação do registro habilitador:** `reviews/ssctr/SSCTR_V1RWS_E01_PATCH_RECORD_CONFIRMATION.json`, sha256 `1b55ca02528259a5c8c6555bde5c6cc23132f7dae911a9bb0b068f8f29ce4531`.

- `CONFIRMED_WITH_CONDITIONS`, `APPROVE_WITH_CONDITIONS`, `SUPPORTED_WITH_LIMITS`, revisão `SSCTR-V1RWS-E01-PATCH-R6`.
- Confirma o registro de `phase-a/` (`a5b915c6…`) para os oito arquivos de runtime de `f8b08aa` e os valores `26c6e3fb…`, hash por hash. 16 condições. A primeira: só dados sintéticos.
- Emitida pelo juiz SSCTR, só depois de ele ler inteiro o parecer de Quality. Não é um freeze.

Os dois juízes reproduziram o defeito no candidato anterior antes de julgar, com as sondas da R5 sem mudança, e conferiram por conta própria os bytes das duas árvores.

## 2. O que fechou (evidência executada pelos juízes em `f8b08aa`)

- **QRE-RWS-E-01: fechado.**
  - Sondas da R5, sem mudança: a correção que lista uma gravação dava nada retido e limiar `[290,325]`; no patch, 4× `REPORT_NOT_CARRIED` e `[300,335]`, o hash do controle.
  - A variante `CORRECTED_MEASUREMENT` pelo ponto de entrada, que a R5 só tinha mostrado em unidade: `[290,325]` e fração `+0,03` no anterior; retida e `[300,335]` no patch. Vale com relógio POOR, OK, PARTIAL ou só minutos, com voltas, com `work.distanceKm` e `seconds`, e com correção tardia (Quality).
  - Tabela do Quality, 96 combinações montadas à mão: mudam 40, exatamente as linhas sem distância com um dos quatro motivos de distância e um motivo de linha inteira. As linhas com distância não mudam.
- **Nada fora do escopo mudou.** Diferencial estrita do Quality com um oráculo escrito por ele, de outro mecanismo: 2.133 chamadas, o patch igual ao oráculo em 2.133. Motor, triagem, perguntas, ofertas e pausa iguais em todas. Nada retido passa a ser entregue; nenhum motivo muda. Fatos de relato e registros de histórico, de evidência e do motor iguais nas 1.454 respostas de plano.
- **Dose e decisões esportivas preservadas** (SSCTR): dose e progressão, coordenação corrida e força, conclusão e crédito, referência de histórico, L30, longão comparável e a calibração V1RC. Nenhuma tolerância, limiar ou critério novo. Com parada por sintoma, a triagem segue pedida, com 0 sessões nativas.
- **Suítes, formalmente** (Quality): conjunta 1.449 entradas, 1.448 passam, 1 falha, o teste histórico `V1RC COACHINGCORE-V1-FREEZE-1 is preserved…`, que acusa só `r6-adaptation.mjs`. Extensão 114 de 114. `--preserved` exit 0. `--check 1` exit 0 no snapshot do V1RWS-1, e `DRIFT` nesta árvore, nomeando só os três arquivos do patch. Nenhum teste ou verificador histórico foi editado. **A suíte conjunta não é verde nesta linha.**
- **Mutação do Quality:** 17 mutantes, 17 mortos, controle verde.

## 3. Condições abertas

Nenhuma bloqueia o candidato sintético. Todas estão no registro de confirmação.

| Id | Quando | O quê |
|---|---|---|
| **QRE-RWS-F-01** (nova; anterior ao patch, igual nas duas árvores) | antes de integração ou atleta real | A fusão do motor congelado guarda um valor por campo, e os fatos de relato não guardam `gpsQuality`, `conditions`, `walkBreaks` nem `measurement`. O atleta diz `HEAT` e o relógio diz `RAIN`; o app diz `gpsQuality: OK` diante de um relógio POOR; o atleta diz esteira e o relógio diz GPS: nos três a linha fica comparável e o limiar vai a `[290,325]`. **SSCTR:** é a mesma classe de L1. Fecha por (a), o contrato do adaptador tornar disjuntos os campos dos dois autores, com teste de resultado; onde a disjunção não puder ser mostrada, ele exige (b), o Core guardar esses fatos por relato. A (b) é mudança de runtime e **decisão do Founder** |
| SSCTR-RWS-F-01, com QRE-RWS-F-03 | antes de a fase B ou o Race Forecast lerem evidência de ritmo | Todo leitor novo recebe a leitura inteira, ou os campos já calculados; nunca a palavra de `reportsVerdict` sozinha. Teste de resultado numa linha sem distância mascarada |
| SSCTR-RWS-F-02 | antes de integração | Um valor medido pelo aparelho (ritmo de trabalho, voltas, distância) chega só no relato do aparelho, com a qualidade dele; nunca pré-preenchido no relato do atleta |
| SSCTR-RWS-F-03, com QRE-RWS-F-06 | antes de integração, parte da L1-f | A integração conta à parte as corridas retidas por este patch e as quedas da fonte S3 por retenção, com as sessões que passam de tempo a distância |
| **Hard gate E-1** (item L5) | antes de qualquer integração ou atleta real | **Não atendido.** Uma re-sincronização não pode apagar as respostas de esforço e recuperação do atleta. O patch não o toca |
| As duas vozes (QRE-RWS-E-02, SEC-RWS-E-01, SSCTR-RWS-E-01) | antes de integração | Sem mudança. Reunidas em `IOS_RUN_REPORT_INTEGRATION_CONTRACT.md` |
| As demais da fase A | — | Sem mudança: seção 3.4 de `phase-a/PHASE_A_LINEAGE_FIX_FORWARD_CLOSURE.md` |

**O custo L1-f aumentou, como o autor disse e os juízes mediram.** No corpus do Quality passam a ser retidos 27 clientes de qualidade, 4 de classe, 2 de prova e 1 de S3. Com relógio OK ou só de minutos, a faixa que se movia deixa de se mover depois de uma correção do próprio atleta. É o custo que o Founder e o SSCTR aceitaram para a correção simples.

**A consequência sensível à direção, aceita expressamente pelo SSCTR.** A corrida retida deixa de ser a fonte de dimensionamento S3. Num cenário, quatro corridas leves que o candidato anterior entregava por tempo saem por distância (11 e 9 km), na mesma dose em minutos e dentro de CT-1 a CT-3. Palavra do SSCTR: é o que a regra L1 manda, e uma regra de admissão não pode depender da direção para onde aponta a evidência inadmissível.

## 4. Adendo ao contrato de integração iOS

`IOS_RUN_REPORT_INTEGRATION_CONTRACT.md` fica como foi julgado. Os juízes o leram: não apresenta nada como feito e registra o hard gate E-1 como não atendido. Duas exigências deles entram aqui e valem junto com ele:

1. **Campos disjuntos por autor, para todo fato de comparabilidade** (QRE-RWS-F-01, fechamento (a)). O relato do aparelho nunca leva `conditions`, pausas para caminhar nem a superfície dita pelo atleta. O relato do atleta nunca leva `gpsQuality` nem `measurement` de aparelho. A superfície dita pelo atleta viaja num campo que o aparelho nunca escreve. Com teste de resultado do adaptador: cada um desses fatos, dito por qualquer dos dois, deixa a corrida fora da evidência de ritmo.
2. **Medida do aparelho só na voz do aparelho** (SSCTR-RWS-F-02). A tabela da seção 2 do contrato põe "ritmo de trabalho informado" e "voltas que o atleta confirmou" na voz do atleta: isso vale para o que o atleta declara. Um valor lido do `HKWorkout` nunca é pré-preenchido no relato do atleta; se for mostrado para ele confirmar, a qualidade do aparelho viaja com o valor.

O Quality anotou que a seção 3 do contrato se declara leitura vinculante de uma linha de `ATHLETE_DATA_FOUNDATION.md`, documento que não editei. Se essa leitura vale como autoridade é decisão do dono daquele contrato e do Founder.

## 5. Contrato de entrada do Race Forecast (fase B) sobre o V1RWS-2

O que a fase B pode ler, e como. Nada disto foi construído.

1. **Um ponto de entrada.** `CoachingCore/src/v1-run-format-index.mjs`, sobre um registro guardado por ele, com `V1X-RUN-NATIVE` ligada. A RFC compõe por cima, com chaves disjuntas.
2. **Calibração só pelo ponto de entrada.** `runCalibration` da resposta, ou `runCalibrationOf` exportado por ele com `runFormatRecord`. Nunca `v1-run-calibration.mjs` direto sobre o registro guardado: esse registro nunca é reescrito, e nele os defeitos D-01 e E-01 continuam visíveis, por desenho.
3. **Por sessão, `runSessions[id].execution`.** `paceEvidence === true` é a única afirmação positiva de evidência de ritmo. `paceWithheld !== null` tira a sessão de todo leitor de ritmo, capacidade, previsão, insight e revisão.
4. **Nunca a palavra única** (SSCTR-RWS-F-01, QRE-RWS-F-03). Quem precisar da linha passa a leitura inteira de `reportsReading`, ou lê o registro por `admitted` (exportado), onde a linha retida vem sem distância e marcada POOR. `reportsVerdict` não é critério de admissão.
5. **Adesão** pela execução (IC-1): status, base, conclusão lida pelo motor, pesos. `extentFraction` é descrição, nunca crédito nem conclusão (SSCTR-RWS-E-03). Antes de ler `paceEvidence`: SSCTR-RWS-A-04.
6. **Faixa, uma fonte** (SC-4, IC-2). O gancho `BAND_OF` segue inerte e `V1X-PACE-REVISION` desligado.
7. **Experiência desconhecida** usa o nível EXPERIENCED (`ATHLETE_DATA_FOUNDATION.md`, seção 6).
8. **Só dados sintéticos.** Qualquer mudança nos arquivos que o V1RWS-2 amarra pede nova revisão e novo freeze.

**Uma observação minha, feita depois da revisão e não julgada pelos juízes.** Numa sessão por tempo, `paceEvidence` é `null`, não `false`, mesmo quando `paceWithheld` diz que a linha está retida. O predicado SC-3 do preflight (`execution.paceEvidence !== false`), aplicado à linha crua do registro, admitiria essa sessão. Já era assim no V1RWS-1, e nenhum leitor do runtime faz isso hoje. Por isso o item 3 diz `paceWithheld !== null` primeiro, e o item 4 manda ler a linha por `admitted`. A fase B deve fixar isso em teste de resultado, e o SSCTR e o Quality devem julgá-lo lá.

## 6. Correções ao registro do autor (`E01_PATCH.md`)

O registro fica como foi julgado. Três pontos dele estavam inexatos:

1. **"Cada um [dos testes novos] falha [no congelado] na asserção do motivo mascarado ou da faixa movida": inexato para dois** (QRE-RWS-F-02). Os testes 2 e 5 caem primeiro numa asserção de forma, a chave `wholeRow` ausente. O mutante M01 do Quality (o leitor congelado com a chave presente) mostra que os seis caem também por comportamento.
2. **Uma asserção do teste 4 é condicional** (`if(format)`): se o formato não fosse achado, passaria calada. O Quality conferiu que é achado nas três sessões nativas. Não corrigi: o candidato julgado é o que se congela.
3. **"Nada muda no que é gravado" (seção 9) não é literal** (QRE-RWS-F-04). Quando a retenção muda a calibração ou a fonte S3, as sessões entregues mudam e as linhas de formato guardadas com elas também (186 respostas na diferencial do Quality, sempre junto com as sessões). A forma, o selo, a legibilidade, o autor e os fatos de relato não mudam, e nenhuma chave nova entra em registro.

O teste 6, de prova, mostra só a nomeação da linha: uma linha sem distância nunca foi resultado de prova. O título dele o diz.

## 7. Integração real: o que continua aberto

Registrado e não construído: o hard gate E-1; as duas vozes e os campos disjuntos (seção 4); a fração retida e o caminho de volta (L1-f, F-03); cadeia de custódia com chave; persistência atômica; identidade confiável das atividades do HealthKit; contrato de reenvio e correção entre fontes; reparo auditado de registros ilegíveis; apagamento e retenção de dados de saúde; privacidade e base legal. O comportamento real do HealthKit numa re-sincronização nunca foi medido.

O registro habilitador amarra o runtime por texto; a máquina confere só o hash dos valores (QRE-RWS-F-05). O runtime liga a fronteira com quaisquer bytes. A amarração aos bytes está na confirmação do SSCTR e no freeze.

## 8. Commits desta missão (linha `claude/v1-run-extensions`, nada enviado)

| Commit | O quê |
|---|---|
| `f8b08aa` | O candidato; é o commit julgado |
| `7ed0158` | Os pareceres e a confirmação do registro, como recebidos |
| (este) | Este encerramento. `CoachingCore/` é byte a byte o de `f8b08aa` |
| (o seguinte) | O registro do freeze V1RWS-2 e `E01_PATCH_FREEZE_V1RWS_2.md` |

Runtime: `v1-run-format.mjs` `e8f364e3…`, `v1-run-history.mjs` `06deb84c…`; os outros seis arquivos amarrados e os valores (`26c6e3fb…`) sem mudança.

## 9. O que fica para o Founder

1. **QRE-RWS-F-01, fechamento (b).** Se a integração não conseguir mostrar a disjunção dos campos, o SSCTR exige que o Core guarde os fatos de comparabilidade por relato. É mudança de runtime, com revisão e freeze próprios. A decisão é sua.
2. **O hard gate E-1.** A integração o atende, ou pede decisão sua sobre o motor.
3. **A leitura da seção 2.2 do contrato de dados** (seção 4 acima): se vale como está neste documento, ou se pede revisão de `ATHLETE_DATA_FOUNDATION.md` pelo dono dele.
4. **O Race Forecast**, que não foi iniciado. O contrato de entrada está na seção 5.
5. **Item de fila humana proposto pelo SSCTR, não anexado:** HQ-V1RWS-E01-SSCTR-R6, junto dos propostos nas rodadas anteriores.

`CURRENT_MISSION.md`, `MISSION_LEDGER.md` e a fila humana não foram alterados.
