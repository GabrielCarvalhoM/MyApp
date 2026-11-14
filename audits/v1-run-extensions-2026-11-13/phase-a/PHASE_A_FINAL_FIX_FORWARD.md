# V1 Run Extensions — Fase A: fix-forward final de integração (2026-11-14)

Missão nova, autorizada pelo Founder em 2026-11-14, restrita aos bloqueios QRE-RWS-C-01 e QRE-RWS-C-05 de `PHASE_A_FIX_FORWARD_CLOSURE.md` e às condições de Security ligadas ao registro de fatos de relato. Parte de `9aed5e2` (runtime igual a `644cd8e`). Uma correção, testes, revisão independente. Este registro é do autor (Chief, Fable 5.2); os pareceres ficam em `reviews/`. Tudo aqui é afirmação a conferir, não evidência.

## 1. Reprodução antes de editar

Sondas do próprio juiz de Quality da rodada anterior, sem mudança, contra `9aed5e2`:

| Sonda | Antes | Depois |
|---|---|---|
| `p-merge-paths.mjs` (C-01): A1, A2, A3, B1, B2 | EASY `[345,575]`, `segments: []` na linha, nada retido | `[345,420]`, a linha guarda a lista do app, `SEVERAL_RECORDINGS` |
| `p-merge-paths.mjs` A4 (nativa) | `[345,420]`, mas a linha sai `partial: true` | `[345,420]`, `partial: false` |
| `p-inert.mjs` (C-05), revisão da fila depois do ASK | `REVIEW_BEFORE_THE_RECORD`, `CALIBRATED`, `[345,575]`, triagem ausente | `CALIBRATED`, `[345,420]`, triagem `REQUIRED` |
| `probe-a01-paths.mjs` (B-01, 12 cenários) | `[345,420]` | `[345,420]` |
| `p-off.mjs` (fronteira desligada) | passos idênticos | passos idênticos |

Os controles da sonda não mudaram: D0 (um relato só, 6,6 km nos minutos inteiros) segue `[345,575]`, D1 e C1 seguem `[345,420]`.

## 2. A causa e a correção

A regra: **o que uma fonte não diz nunca apaga o que outra disse**, e toda resposta lê o registro do mesmo jeito antes de responder.

### C-01

A fusão do motor (congelada) guarda um valor por campo: o da fonte melhor, ou o primeiro. Um valor vazio da fonte melhor substitui o valor cheio da outra. Duas camadas, as duas na fronteira aditiva:

1. **Na recepção.** Um campo de um relato novo de corrida do plano que não diz nada (lista vazia em `segments`, `steps` ou `conditions`; declaração vazia em `declared`; distância zero em `distanceKm` ou `manualDistanceKm`) não é entregue à fusão. A linha guarda o que o outro relato disse, então a corrida continua lida pela distância inteira para conclusão e histórico. Um relato sozinho lê igual com o campo vazio ou sem ele.
2. **Na proveniência.** Cada relato recebido deixa, como fato, o que ele mesmo diz e que retém a distância dos leitores de ritmo: que lista mais de um arquivo (`several`), que corrige com motivo listado (`corrected`) e o número do próprio atleta (`ownKm`), além da distância medida e da duração que já havia. `reportsVerdict` lê isso em todo relato que compôs a linha. Não depende do que a linha guardou depois.

Cada relato é lido sozinho pelo mesmo leitor da linha (`distanceFacts`). Os quatro motivos de retenção valem na linha e em cada relato dela.

### C-05

Toda resposta passa por uma leitura única do registro (`readingOf`): os fatos, o registro admitido, as paradas por sintoma sem triagem posterior e as linhas ilegíveis. Dela saem:

- a calibração: a do `v1-run-index.mjs` quando nada é retido (byte a byte), refeita sobre o registro admitido com os mesmos argumentos quando algo é retido, ou nenhuma;
- a triagem que o registro pede, nomeada também nas respostas que não entregam sessão;
- o que foi retido e o que não pôde ser lido.

Vale para revisão anterior ao registro, revisão recusada, formato desconhecido, formato perdido, erro da extensão e instante ilegível. Um só caminho de código (`heldAnswer`).

### Security

- **Fato ilegível falha fechado.** Uma linha do registro de relatos que não é formato nem fato íntegro pede a triagem com motivo próprio (`RUN_REPORT_UNREADABLE`), mantém as corridas por tempo e não entrega distância nenhuma a leitor de ritmo (`REPORTS_UNREADABLE`), enquanto estiver lá. Nunca é nomeada como sintoma e nunca é lida como nada.
- **Parada ilegível é parada.** `stop` presente que não é objeto (texto, `true`, número) é lido como parada sem motivo declarado, portanto `SYMPTOM` pela regra já existente. `null`, ausente e `false` seguem sendo sem parada.
- **Custo linear.** Os fatos são somados uma vez por relato e sessão quando o registro é lido; cada linha consulta cada relato uma vez (`sourcesOf` deduplicado).
- **Linha de fato fechada.** Exatamente sete chaves na linha, oito no relato, duas na parada. O nome da linha vem do conteúdo do relato; o selo cobre atleta, instante e relato.
- **Triagem datada depois da própria revisão** não libera a parada naquela revisão (SSCTR-RWS-C-02).

## 3. Leituras deste ciclo que pedem a palavra do juiz

Nenhuma muda dose, progressão, catálogo ou número esportivo. `RUN_FORMATS_V1.json` não mudou (`26c6e3fb…353c`). Cada uma só retira evidência de ritmo, mantém a triagem ou preserva o que um relato disse.

| # | Leitura | Dono |
|---|---|---|
| 1 | Campo vazio de relato novo não vai à fusão (lista vazia, declaração vazia, distância zero). A linha guardada difere do relato enviado só por não ter a chave vazia. O motor não lê nenhum desses campos; a V1RC lê `conditions` como lista e distância só a partir de 0,5 km. Vale para corridas do plano; corrida avulsa fica de fora, como já fica dos fatos de relato (SSCTR-RWS-C-04 segue aberta). | QRE, SSCTR |
| 2 | A disputa de distância passa a incluir o número do próprio atleta de cada relato. Com um ou dois relatos dá o mesmo que a linha já dava. Com três ou mais pode reter mais (dois números do atleta que divergem além de 0,91). Numa prova, o número digitado contra uma importação que mediu menos de 0,91 dele agora retém. | SSCTR |
| 3 | Linha que perdeu a lista num registro feito fora deste ponto de entrada, com o fato dizendo vários arquivos: o ritmo é retido; conclusão e histórico leem o que a linha tem (6,6 km). A lista não é reconstruída a partir do fato. | SSCTR |
| 4 | Linha de fato ilegível: triagem pedida, por tempo, sem distância para ritmo, até o registro voltar como foi guardado. A triagem respondida não libera. Conta qualquer linha do registro que não seja formato nem fato íntegro. | Security, SSCTR |
| 5 | `stop` que não é objeto é parada com motivo não declarado: `SYMPTOM`, `STOPPED`, não zera a contagem de pausa. | SSCTR, Security |
| 6 | `segments` presente que não é lista: um arquivo que ninguém lê. Vários arquivos, confiabilidade POOR, conclusão `UNKNOWN`. | SSCTR |
| 7 | Triagem com instante posterior ao da revisão que a traz não libera nela; libera numa revisão posterior. | SSCTR |
| 8 | **Muda uma leitura aceita no ciclo anterior.** Revisão anterior ao registro que o motor aceita: continua sem entregar sessão e sem gravar formato, mas os fatos dos relatos dela passam a ser gravados sob o instante que o motor aceitou. Motivo: o motor guarda as linhas dessa revisão; sem os fatos, uma linha ficava sem o que seus relatos disseram, e uma parada recusada por conflito sumia na revisão seguinte. Revisão que o motor recusa segue sem gravar nada. | QRE, SSCTR, Security |
| 9 | Relato de formato desconhecido: guarda só a parada, não a distância nem os outros fatos de um relato que não foi gravado. Vale no ASK e na rota clínica; sem parada, não deixa fato nenhum. | Security |
| 10 | Formato novo da linha de fato. Linhas do formato anterior ficam ilegíveis; não existe registro real. | Security |
| 11 | Palavras novas: motivo de retenção `REPORTS_UNREADABLE`; motivo de triagem e detalhe `RUN_REPORT_UNREADABLE`; calibração `UNAVAILABLE` / `RECORD_NOT_ADMITTED`. As respostas que não entregam sessão podem trazer `warningSignScreen`, `paceEvidenceWithheld` e `unreadableReports`. | QRE |
| 12 | O `runCalibrationOf` exportado admite o registro para qualquer plano que receba, também um que não confere com o próprio hash. | QRE |

## 4. O que fica fora, declarado

- **Valores que os dois relatos declaram** (distância, duração, `gpsQuality`, `measurement`, listas não vazias): resolvidos pela regra congelada do motor. Não é ausência apagando presença.
- **Fato que não está no registro.** Não se distingue de relato nunca enviado. Só a cadeia com chave da custódia resolve.
- **Registro iniciado com a fronteira desligada ou por outro ponto de entrada.** Suas linhas não têm fatos de relato e são lidas pelo que a linha diz.
- **Dois caminhos defensivos sem acesso por entrada JSON com plano válido:** a leitura do registro que lança (`ok: false`, calibração `RECORD_NOT_ADMITTED`) e `REVIEW_TIME_REQUIRED`. Usam o mesmo `heldAnswer` das outras respostas; não têm teste próprio.

## 5. Condições de integração (registradas, não concluídas)

Nada disto foi construído. Todas valem antes de qualquer uso real.

- Custódia com chave e gravação atômica dos três registros com o do motor (Security A-01, A-06).
- Relato do app e importação da mesma corrida em duas requisições: a custódia de hoje falha fechada (SEC-RWS-C-03, SSCTR-RWS-C-08).
- Inventário, apagamento, retenção e egress dos fatos de relato, que são dado derivado de saúde (SEC-RWS-C-04).
- Base legal e decisões de privacidade com o Founder (G07).
- SSCTR-RWS-C-03 (sessão sob ASK de elegibilidade diz `prescribed: true`), C-04 (parada em corrida avulsa), B-03, A-04; QRE-RWS-A-07.

## 6. Testes

Novo: `test/v1rws-final-fix.test.mjs`, 14 testes. Cada bloqueio é afirmado ao lado do defeito ainda visível no caminho cru (a fusão congelada sozinha, a calibração congelada sobre a linha sem a lista, o ponto de entrada congelado na mesma revisão).

| Pedido da missão | Onde |
|---|---|
| C-01 exato; app primeiro, importação primeiro, mesma revisão; `[]`, ausente, lista com dados | testes 1 a 3 (3 expressões × 3 ordens; dois relatos do app; lista de qualquer lado) |
| Correção tardia, duplicata, reconstrução histórica, registro serializado e restaurado, restart | teste 4 |
| O fato lido no relato quando a linha perdeu a lista; cada motivo por relato | teste 5 |
| Campo vazio de `steps`, `conditions`, `declared`; distância zero; lista que não é lista | teste 6 |
| C-05 exato; o mesmo relato sob rota clínica | teste 7 |
| Nove caminhos de resposta, cinco propriedades cada (calibração admitida, sinal, nada indevido, o que foi gravado, mesma resposta depois de ida e volta) | teste 8 |
| Revisão recusada com prova em dois arquivos; resultado declarado na calibração refeita (o mutante K32 da rodada anterior); erro da extensão | teste 9 |
| Revisão da fila que traz relatos | teste 10 |
| Fato ilegível falha fechado; ausente não é ilegível; não vira sintoma | teste 11 |
| Parada ilegível | teste 12 |
| Custo e limites; chaves e selo | teste 13 |
| Triagem depois da própria revisão, na mesma revisão e numa posterior; borda do mesmo instante (o mutante K14) | teste 14 |

### Testes do ciclo anterior que mudaram

Em `test/v1rws-fix-forward.test.mjs`, todos do próprio candidato:

| Trecho | O que mudou | Resultado esperado mudou? |
|---|---|---|
| Veredito dos relatos sozinho | o fato montado à mão ganhou os três campos novos; `appendReportFacts` recebe os valores | não |
| Fato de parada guardado | a lista de chaves do relato passou de cinco para oito | só a forma |
| Fato anexado à mão (`itsFact`) | assinatura nova | não |
| Integridade da linha de fato | o selo novo; "cinco campos" virou "os campos fechados" | não |
| `reportFactOf` de um número digitado | antes `null`; agora um fato com `ownKm` | **sim** (leitura 2) |
| Lista fechada `PACE_WITHHELD` | ganhou `REPORTS_UNREADABLE` | **sim** (leitura 4) |
| Revisão anterior ao registro com parada | antes o registro voltava igual; agora volta com o fato da parada | **sim** (leitura 8) |

Nenhum teste de `c8104c1` foi editado.

## 7. Suítes (três resultados, separados)

| O quê | Resultado |
|---|---|
| Testes da extensão, `test/v1rws-*.test.mjs` | 88 de 88 (74 anteriores + 14 novos) |
| Execução conjunta nesta linha | 1423 entradas, 1422 passam; a única falha é `V1RC COACHINGCORE-V1-FREEZE-1 is preserved`, o teste histórico |
| Verificação histórica | fica verde no snapshot dela, `c8104c1`; não rodada de novo pelo autor nesta missão |

`node scripts/v1rws-freeze.mjs --preserved`: 197 de 197 arquivos do primeiro freeze idênticos, 1 emendado com o hash e o diff autorizados (22+/10−), 30 de 30 do segundo. A suíte não é anunciada como verde.

## 8. Mutação do autor (apoio, não evidência independente)

Em cópias de rascunho, nunca no worktree. Cada mutante roda contra os dois arquivos de teste que cobrem o código alterado (`v1rws-final-fix` e `v1rws-fix-forward`), não contra a suíte inteira.

| Rodada | Sobre | Mutantes | Mortos | Sobraram |
|---|---|---|---|---|
| 1 | o código antes dos últimos acréscimos | 76 | 71 | 5: um equivalente (cláusula redundante, removida) e quatro sem teste (parada ilegível no histórico; triagem depois da própria revisão, por instante e por dia; resposta lida sem os fatos do pedido). Os quatro ganharam teste. |
| 2 | o código final: os quatro acima, 8 mutantes cujas linhas mudaram e 9 do que foi acrescentado depois | 21 | 20 | 1 (relato ilegível sem parada deixava fato). Ganhou teste; morto na repetição. |
| 3 | a lista da rodada 1, de novo, sobre o código final | 76 | 66 | 9 não se aplicam mais (as linhas mudaram; estão na rodada 2) e 1 vivo (o fato inteiro de outro relato num ASK). Ganhou teste; morto na repetição. |

Sobre o código final: 84 mutantes distintos, nenhum vivo depois dos dois testes acrescentados. Um equivalente declarado, o da rodada 1. Dois caminhos não têm mutante porque não têm acesso por teste (seção 4).

**Ensaio do freeze**, num clone de rascunho com um registro habilitador de teste que só existe lá: `--write 1` rodou a suíte ele mesmo com a fronteira ligada por padrão (conjunta 1422 de 1423, só a falha histórica; próprios 88 de 88) e gravou; `--check 1` passou; a regravação foi recusada. No worktree nada disso existe.

**Exploração adversarial do autor** (dez caminhos de fusão além dos testados: dois relatos do app em que o primeiro declara sem motivo; três relatos; longão; lista com lixo; importação parcial; `segments` falso ou nulo; importação sem duração): nenhum entrega distância parcial a leitor de ritmo.

## 9. O que não mudou

Dose, progressão, coordenação com força, holds, taper, catálogo, seletor, regra de conclusão por distância, L30, deduplicação, a distinção medida/corrigida/declarada, o formato fixo da semana, o registro de formatos entregues e o comportamento com a extensão desligada. `v1-run-calibration.mjs`, `v1-run-index.mjs` e `v1-index.mjs` estão como em `c8104c1`; `r6-adaptation.mjs` como em `d6381bb`. Nenhum freeze nem verificador histórico foi tocado.
