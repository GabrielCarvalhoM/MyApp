# V1 Run Extensions — Fase A: fix-forward (2026-11-14)

Missão nova, autorizada pelo Founder em 2026-11-14, restrita aos dois bloqueios de `PHASE_A_CLOSURE.md` e às pendências de runtime da seção 2 daquele encerramento. Parte de `a8e9b05`. Um ciclo: correção, testes, revisão independente. Este registro é do autor (Chief, Fable 5.2); os pareceres independentes ficam em `reviews/`.

## 1. A causa e a correção

Os dois bloqueios tinham a mesma raiz: um fato do relato era lido **por observação, quando o relato chegava**, e o motor depois funde os relatos de uma mesma corrida numa linha só (ou recusa o relato que contradiz outro). A marca posta antes da fusão não sobrevivia a ela.

A correção troca a unidade de leitura. Duas regras:

1. **O que a linha canônica diz é lido da linha, na hora da leitura.** A confiabilidade de uma medida (`distanceFacts`) sai dos fatos que a linha tem agora, venha cada fato do relato que vier: vários arquivos, correção com motivo listado, sem duração, ou número do próprio atleta que a contradiz. Nada disso depende mais de uma marca gravada na chegada. O ponto de entrada não reescreve mais `gpsQuality` (a r3a, condição 1, já pedia a medida e a qualidade intactas); `deviceGpsQuality` deixou de existir.
2. **O que um relato disse e nenhuma linha guarda fica num fato da própria extensão.** Um relato de corrida recebido que declara uma parada, ou que mediu uma distância, deixa uma linha `RUN_REPORT_RECEIVED` no `runFormatRecord` (append-only, hash de conteúdo, cinco campos fechados, sem texto livre; o motivo é a palavra fechada como é lido). É lida antes de o motor fundir ou recusar o relato e gravada sob o instante que o motor aceitou. Um relato sem id, ou com id acima de 128 caracteres, é nomeado pelo conteúdo.

Com isso:

- **Evidência de ritmo (QRE-RWS-B-01).** A V1RC, congelada e intocada, passa a receber o registro **admitido** (`admitted`): a linha cuja distância não é uma medida inteira e conferida vai sem `distanceKm` e marcada POOR. Quando alguma linha é retida, a calibração é refeita sobre o registro admitido com os mesmos argumentos do `v1-run-index.mjs`; quando nenhuma é, a calibração devolvida é a do `v1-run-index.mjs`, byte a byte. Nenhuma linha guardada é reescrita. P1, S3, `paceEvidence` e o `runCalibrationOf` exportado leem a mesma admissão.
- **Sinal de segurança (SSCTR-RWS-B-01).** A parada por sintoma é lida em todo relato recebido (os fatos) e em toda linha do registro, inclusive em conflito ou substituída por correção. Pede a triagem até a triagem ser respondida **depois** dela. Não é crédito, não conta para a X-2 e não dimensiona nada. Nenhuma classificação clínica nova: é a triagem já existente (r3 C4).

## 2. Os dois bloqueios, antes e depois (sondas dos próprios juízes)

| Bloqueio | Sonda | Em `a8e9b05` | Agora |
|---|---|---|---|
| QRE-RWS-B-01 | `probe-a01-paths.mjs` (12 cenários) | 3 fusões davam EASY `[345,575]` | os 12 dão `[345,420]` |
| SSCTR-RWS-B-01 | `p1c-conflict-realistic.mjs` (18 casos) | 6 casos sem triagem, 1 a 4 sessões nativas | os 18 com triagem `REQUIRED` e 0 nativas |

Os testes novos (`test/v1rws-fix-forward.test.mjs`, 13) reproduzem os dois achados e mostram o defeito ainda visível para quem lê o registro cru (a V1RC congelada sobre a mesma linha dá `[345,575]`), ao lado do resultado pelo ponto de entrada.

Cobertura pedida na missão:

| Dimensão | Ritmo (B-01 QRE) | Sintoma (B-01 SSCTR) |
|---|---|---|
| Três ordens de chegada | 3 ordens × 3 expressões, contra o controle em um arquivo e contra os dois arquivos num relato só (hash da calibração igual) | 3 ordens × 2 expressões |
| Duplicata | reenvio dos dois relatos: nada muda, nenhum fato repetido | reenvio do relato da parada: nenhum fato novo |
| Correção tardia | acrescenta o segundo arquivo; e corrige a linha fundida para uma medida inteira (volta a ser evidência) | correção que retira a parada, e a que troca o motivo: a triagem continua pedida |
| Contradição de distância | número digitado, declaração sem motivo, telefone × relógio, dois aparelhos, importação sem duração | importação que diz "concluído" contra o app que diz "parei" |
| Releitura histórica | semanas seguintes, registro passado por JSON, `historicalStateOf`, restart | dias depois com a triagem antiga, registro por JSON, restart, registro sem os fatos |

## 3. Pendências de runtime

| Id | O que foi feito |
|---|---|
| QRE-RWS-B-04 (freeze) | `--write` roda a suíte ele mesmo, nunca aceita contagem digitada, e recusa se a única falha da execução conjunta não for, pelo nome, o teste histórico. Recusa também sem registro habilitador. |
| QRE-RWS-B-03 (nota) | A emenda de `r6-adaptation.mjs` é conferida por hash exato do arquivo e do diff (`6cedcb72…6e50`, `6675741d…e370`), no verificador e no teste I10. A checagem lexical saiu. |
| QRE-RWS-B-02 (plausibilidade) | Distância medida sem duração: nunca MEASURED (`UNKNOWN`, `DURATION_REQUIRED`), nunca `paceEvidence`, nunca histórico. Vale para o relato e para a linha de histórico do intake. |
| SSCTR-RWS-B-02 (ASK de elegibilidade) | Enquanto o motor pede a elegibilidade atual, toda corrida sai por tempo (`WARNING_SIGN_SCREEN_REQUIRED`, detalhe `ENGINE_ASKS_CURRENT_ELIGIBILITY`). `prescribing` segue a leitura da V1RC (falso sob qualquer ASK, hold ou rota clínica). Outro ASK não muda a expressão. |
| QRE-RWS-B-05 (testes fracos) | M04 agora forja a linha NATIVA. M18 tem teste pelo ponto de entrada (15,5 km guardados, onde uma seleção nova daria 16). M08a também: num plano de 16 semanas, a sessão de limiar da semana 13 muda de formato conforme o relato da semana 11 estava ou não no registro quando a semana começou. Nos planos de 12 semanas dos testes anteriores essa regra não tinha efeito visível, por isso o teste antigo passava sem exercitá-la. |
| QRE-RWS-B-06 (nota) | N02 (exceção da prova) e N35 (linha carregada nunca renormalizada) ganharam teste. |
| Registros (Security A-01, A-06) | O cabeçalho do ponto de entrada diz o contrato: os três registros sob a cadeia com chave da custódia, gravados no mesmo commit selado. **Essa integração não existe**; nada aqui a representa. |

## 4. Leituras deste ciclo que pedem a palavra do juiz

Cada uma só retira evidência de ritmo ou mantém a triagem; nenhuma muda dose, progressão, catálogo ou número esportivo. `RUN_FORMATS_V1.json` não mudou (`26c6e3fb…353c`).

1. **Tolerância de disputa: o 0,91 já amarrado** (`correctionFloorFraction`, r3a A1). Duas medidas, ou a medida e o número do atleta, mais distantes que isso: a distância não vai a leitor de ritmo. Nenhum número novo. (SSCTR)
2. **Prova (RACE) em vários arquivos ou corrigida**: a V1RC deixa de ler a distância do primeiro arquivo sobre o tempo inteiro como resultado de prova. Antes lia (um resultado mais lento que o real). O atleta declara o resultado pela via própria. (SSCTR)
3. **Fusão de vários arquivos por duas fontes**: lida como o mesmo relato em um envio só (WE3A-10: `DISTANCE`/`MEASURED`, nunca ritmo). No candidato anterior ficava `UNKNOWN` por falta da marca. O mesmo para a correção com motivo vinda de duas fontes (WE3A-02). (SSCTR)
4. **O sinal é monótono**: uma correção do relato não desdiz o sintoma; só a triagem respondida depois. É a letra da r3 C4 ("até ser respondida"). Sessões sob triagem pedida seguem por tempo e `prescribed: true`, como a r3 C4 manda; `prescribed: false` continua só para hold e rota clínica. (SSCTR)
5. **Relato com formato desconhecido (ASK)**: continua não gravado como execução; a parada que ele declara passa a ser guardada e nomeada na resposta. Numa revisão que o motor recusa, ou anterior ao registro, nada é gravado, e a parada é nomeada na resposta a partir do próprio pedido. (SSCTR, Security)
6. **Fatos de relato no `runFormatRecord`**: motivo de parada (palavra fechada) e distância medida por relato. Mesma classe dos dados que a Security A-07 já listou; sem registro novo. (Security)

## 5. Testes históricos (decisão de governança do Founder, 2026-11-14)

Três resultados, separados:

| O quê | Onde | Resultado |
|---|---|---|
| Verificação histórica | os testes e verificadores antigos, intactos, no snapshot que cada freeze amarra (`c8104c1`) | verdes lá: o teste histórico passa e `v1rc-freeze --check 1` dá 198 de 198 e 30 de 30 (rodado pelo autor no worktree `v1-run-calibration`; a confirmar pelo QRE) |
| Suíte nova | `test/v1rws-*.test.mjs` nesta linha | 74 de 74 |
| Execução conjunta | tudo nesta linha | 1409 entradas, 1408 passam; a única falha é `V1RC COACHINGCORE-V1-FREEZE-1 is preserved`, acusando só `src/r6-adaptation.mjs` |

Nenhum teste de `c8104c1` foi editado, excluído ou teve a expectativa mudada. A linha tem verificação própria: `scripts/v1rws-freeze.mjs` (197 de 197 arquivos do primeiro freeze idênticos, 1 emendado conferido por hash e diff autorizados, 30 de 30 do segundo).

### Apoio do autor (não é evidência independente)

- **Mutação**, em cópias de rascunho, nunca no worktree: 87 mutantes sobre as linhas deste ciclo e os que a R2 achou vivos (M04, M08a, M18, N02, N35). 81 são mortos. Os que sobreviveram à primeira passagem viraram asserção nova; 2 caíram com a linha (uma condição redundante que nenhum teste distinguia foi simplificada). Sobram 4, equivalentes:
  - o `hold` passado à calibração refeita: sob rota clínica o próprio motor grava `CLINICAL_HOLD` no registro, e a V1RC lê o hold de lá;
  - as duas cláusulas de `prescribing` copiadas da V1RC (triagem respondida, hold vigente): quando a resposta do motor é prescritiva, o portão de elegibilidade do motor já as garante;
  - "uma medida só já é disputa": com uma medida, a menor e a maior são a mesma.
- **Ensaio do verificador de freeze**, de ponta a ponta, num clone de rascunho de `8dc849c` com um registro habilitador de teste que só existe lá: recusa sem registro, recusa com árvore suja, roda a suíte ele mesmo (1407 de 1408 naquele commit, com a falha histórica pelo nome, também com a fronteira ligada por padrão), grava, `--check` passa, recusa regravar, acusa drift e acusa mudança no arquivo emendado.
- **Sondas da R2 reexecutadas**: 154 entradas malformadas, 0 exceções; jornada só com GPS, 0 chaves do motor diferentes do `v1-run-index.mjs`; revisões recusadas não mudam o registro.

## 6. Testes do próprio candidato que mudaram, e por quê

Quatro testes do ciclo anterior afirmavam a marca gravada (`gpsQuality: 'POOR'`, `deviceGpsQuality`) ou o bloqueio por falta dela (`SEGMENTS_NOT_MARKED_POOR`, `CORRECTION_NOT_MARKED_POOR`). Passaram a afirmar o mesmo resultado sobre os fatos: linha intacta, confiabilidade POOR na leitura, distância retida da calibração. Nos exemplos SSCTR, três entradas voltaram ao caso como o registro r3a o escreve (WE3A-02 e WE3A-04 com qualidade OK e motivo; WE3A-10 sem marca, como estava em `bcac30d`). Nenhum resultado esperado de exemplo mudou.

## 7. O que não mudou

Dose interna, progressão, coordenação com força, holds, taper, catálogo, regra de conclusão por distância, L30, deduplicação, a distinção medida/corrigida/declarada, o formato fixo da semana e o comportamento com a extensão desligada. `v1-run-calibration.mjs`, `v1-run-index.mjs` e `v1-index.mjs` estão byte a byte como em `c8104c1`; `r6-adaptation.mjs` está como em `d6381bb`.

## 8. Limite conhecido, não tratado aqui

SSCTR-RWS-B-03 (integração, Data/iOS): o teste de "aparelho" ainda difere entre o ponto de entrada e os leitores quando a importação não declara `measurement`. As importações deste registro declaram `GPS`, como o contrato ADF mapeia.
