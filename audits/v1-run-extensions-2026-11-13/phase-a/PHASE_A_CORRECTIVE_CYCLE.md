# V1 Run Extensions — Fase A: o ciclo corretivo único (2026-11-13)

**Sobre:** a rodada independente em `bcac30d` (commit `f9e1220`, relatórios em `reviews/`).
**Resultado da rodada:** SSCTR `ACCEPT_WITH_CONDITIONS`; QRE `NOT_READY` (1 bloqueio); Security/Data `PASS_WITH_CONDITIONS`.
**Regra:** um ciclo só (preflight S10). Nenhum número esportivo foi alterado. Nenhum teste antigo, freeze ou verificador existente foi editado.
**Valores:** `RUN_FORMATS_V1.json` mudou (três limites de engenharia, um valor já vinculado da r2 e dois textos); sha256 novo `26c6e3fb…353c`.
**Suíte na linha depois do ciclo:** 1396 entradas, 1395 passam, 1 falha (o teste histórico declarado, F-2).

## 1. O que cada achado recebeu

| Achado | Correção | Teste (`test/v1rws-review-fixes.test.mjs`, salvo indicação) |
|---|---|---|
| **QRE A-01 (bloqueio)**: corrida em dois arquivos chegava à V1RC com a distância do primeiro sobre os minutos totais | Todo relato novo com `segments` é gravado com `gpsQuality: 'POOR'` (a marca do aparelho fica em `deviceGpsQuality`), na versão nativa e na por tempo. O leitor só soma arquivos numa linha assim marcada. | "QRE-RWS-A-01": as faixas têm as mesmas bordas do controle em um arquivo |
| **QRE A-03 / SEC A-02**: linha assentada fabricada era reentregue como prescrição | Nada da linha guardada é entregue. O formato da semana é **reconstruído pela estrutura** e só vale se ainda for um candidato do catálogo que passa E1–E3 ou CT-1..CT-3 com a faixa e o registro de hoje; senão, seleção nova. As linhas do registro guardam só estrutura, sem texto. | "QRE-RWS-A-03, SEC-RWS-A-02" |
| **SEC A-03**: linha de 986 bytes custava 13 s | Blocos são uma estrutura fechada e limitada (até 24 blocos, repetição até 60, 4 etapas por bloco, 400 etapas ao todo); listas do relato limitadas (`steps` 400, `segments` 20). | "SEC-RWS-A-03" |
| **QRE A-04**: pico de GPS virava medição | Janela de plausibilidade da própria V1RC (2:00 a 15:00 por km): fora dela a medição é falha, não distância, não ritmo, não histórico. Soma de arquivos limitada a 300 km. | "QRE-RWS-A-04" |
| **QRE A-05**: registro crescia em revisão recusada | Revisão que o motor recusa (`HOLD`, `INVALID_INPUT`, `UNSUPPORTED`) ou anterior ao registro não entrega nem grava nada. | "QRE-RWS-A-05" |
| **QRE A-06**: sete mutantes vivos | Um teste para cada: M03, M04, M06, M08a/M08b (um só predicado agora), M17, M18; e M14, M32. | "QRE-RWS-A-06 (M03, M04)", "(M08, M17)", "SSCTR-RWS-A-03 … (M06)", "SEC-RWS-A-03" |
| **QRE A-07** (escalado): sessões inteiras sob rota clínica | Rotuladas: `prescribed: false` em cada sessão e `runFormat.prescribing: false`. **A decisão entre rotular e reter é de Product/SSCTR e continua aberta.** | "QRE-RWS-A-07, A-10" |
| **QRE A-08**: leitor podia concluir relato `completed:false` | A emenda do motor exige `actual.completed === true` também com o leitor. | "QRE-RWS-A-06 (M08, M17), A-08" |
| **QRE A-09**: `--preserved` não olhava os bytes atuais | O verificador prova "só o leitor" nos bytes presentes, no `--preserved`, no `--write` e no `--check`. | `v1rws-freeze --preserved`; I10 |
| **QRE A-10**: autoridade de desenvolvimento malformada lançava | Valores sem a forma dos valores desligam a fronteira. | "QRE-RWS-A-07, A-10" |
| **SSCTR A-01 / SEC A-05**: parada por sintoma fora do relato nativo sumia | `actual.stop` é lido em todo relato de corrida, qualquer que seja a expressão. A leitura do motor de uma sessão por tempo não muda (linha byte-idêntica). | "SSCTR-RWS-A-01, SEC-RWS-A-05" |
| **SSCTR A-02**: distância digitada virava P1 | Em relato novo de corrida do plano (exceto prova), o número digitado sai de `distanceKm` e fica em `manualDistanceKm`: nunca medição. | "SSCTR-RWS-A-02" |
| **SSCTR A-03**: sessão por tempo abortada reiniciava a X-2 | Só reinicia a sessão por tempo que o motor lê como concluída e sem parada. | "SSCTR-RWS-A-03 …" |
| **SSCTR A-04**: `paceEvidence` em repetições curtas | Falso quando a repetição planejada tem menos de 5 min (valor vinculado da r2). | "SSCTR-RWS-A-04, A-05, A-09" |
| **SSCTR A-05**: textos das repetições | Acrescentados "parar e caminhar" e a duração estimada em texto. A redação final é de Product. | idem |
| **SSCTR A-09**: motivo de parada no histórico | Alinhado ao leitor. | idem |
| **SSCTR A-13**: nota dos valores citava teste inexistente | Corrigida. | — |
| **F-1** | Decidido pelo SSCTR: vale a ordem escrita. Nada mudou no código. | `v1rws-ssctr-examples` (T13) |

## 2. Leituras que o Chief registra e leva ao Founder

**F-2 / QRE A-02.** Na linha comum, o critério 11.1 do handoff lê-se assim: suíte verde, exceto `test/v1rc-calibration.test.mjs` "COACHINGCORE-V1-FREEZE-1 is preserved", que deve falhar acusando **só** `CoachingCore/src/r6-adaptation.mjs`.
- Base: a regra de governança do Founder de 2026-11-13 (nenhum verificador histórico é editado; a verificação histórica roda no snapshot).
- O invariante vivo é o teste I10 e o verificador `v1rws-freeze`, que agora recusam qualquer mudança da emenda além do leitor.
- O `--write` do freeze exige exatamente uma falha e grava qual é.
- Isto é a leitura do Chief sobre uma regra do Founder. Fica exposta ao Founder; não é decisão nova dele.

**Escopo da regra do número digitado (SSCTR A-02).** A prova (`RACE`) fica de fora: o resultado de prova tem regra própria de evidência na V1RC, que já rebaixa a medição manual. O SSCTR confirma ou corrige na reverificação.

**Janela de plausibilidade (QRE A-04).** O intervalo 120–900 s/km vem do código da V1RC (QRE-V1RC-07). É limite de falha de medição, não valor esportivo. O SSCTR confirma ou corrige na reverificação.

## 3. O que mudou em relação ao documento do candidato

- **D-4** agora é: a *estrutura* entregue na semana é mantida enquanto passar com as entradas de hoje; as estimativas e a faixa mostrada são as de hoje.
- **D-6** ganhou: número digitado em `manualDistanceKm`; `segments` marcado POOR; janela de plausibilidade.
- **D-3** ganhou: revisão recusada não entrega sessões.
- Tamanho do registro de formatos: as linhas assentadas deixaram de guardar a sessão inteira.

## 4. O que não foi feito, de propósito

- Condições de integração de Security (A-01, A-04, A-06, A-07, A-08): custódia com chave para os três registros, persistência atômica, apagamento coordenado, inventário e base legal dos motivos de parada e dos UUID do HealthKit. São de integração e, na parte legal, do Founder/G07.
- QRE A-11 e A-12 (comportamento sob custódia sem os registros; tamanho): mesma integração.
- Nenhum registro habilitador foi emitido pelo autor.
