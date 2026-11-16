**Veredito: PASS_WITH_CONDITIONS.** Não há BLOCKING. Um freeze que fixe estes bytes com a forecast e os insights ligáveis e a `V1X-PACE-REVISION` desligada é aceitável do lado de Security, desde que o registro do freeze cumpra a SEC-RFC-B-03. Com a revisão desligada, A-01, A-02, A-03 e A-10 são inalcançáveis (q4), mas continuam reproduzindo com ela ligada.

# SEC-V1RFC-FOCAL-R2 — Security, Privacy & Abuse: reverificação única do ciclo corretivo da fase B

- **Escopo:** `git diff 400edb7 0d3015b -- CoachingCore`, lido em `0d3015b` com a árvore limpa. Mudaram `src/v1-run-forecast-index.mjs`, `src/v1-pace-insights.mjs` (uma linha) e os testes. Não reabri nada fora desse diff, e o meu R1 não foi editado.
- **Independência:** não escrevi o candidato nem o ciclo, e não corrijo nada.
- **Contexto do host:** recebi de novo o CLAUDE.md e o índice MEMORY.md. Usei os dois só para me orientar; nenhum dos dois é evidência aqui.
- **O que rodei:**
  - a suíte `node --test test/v1rfc-*.test.mjs`: 85 de 85;
  - as sondas do R1 (p1, p2 e p7) contra `0d3015b`.
- **O que não rodei:** `npm run verify`, os verificadores de freeze e as jornadas.
- **Sondas:** estão em `probes/r2/`, só com dados sintéticos. Importam o worktree por caminho absoluto (`base.mjs`).

## 1. Estado de cada achado do R1

| Id | Estado em `0d3015b` | Evidência |
|---|---|---|
| SEC-RFC-A-01 | **OPEN**: condição antes de qualquer registro da `V1X-PACE-REVISION` | `r1-rerun-at-0d3015b.out`. Com a revisão ligada: P1b1 (REVOKE ilegível) dá `ACTIVE`, formato `[305,340]`; P7 (linha de lixo futura) dá REVOKE recusado e `ACTIVE`; P1c ainda depende da ordem do array. Com a revisão desligada, nada disso é alcançável (q4). |
| SEC-RFC-A-02 | **OPEN**: idem | P2a.harder.w10 e P2a.adverse.w10 dão `ACTIVE`, formato `[305,340]`, `history: []`. |
| SEC-RFC-A-03 | **OPEN**: idem | P2b.symptom-stop.answered volta `ACTIVE`, `ends: []`. |
| SEC-RFC-A-04 | **OPEN** (integração), escopo **ampliado** por B-01 e B-02 | Ver seção 2. |
| SEC-RFC-A-05 | **OPEN** (integração), sem mudança | q4: um registro bound ao hash fixado liga a revisão e sai com o rótulo `CURRENT_INDEPENDENT_REVIEW`. |
| SEC-RFC-A-06, A-07 | **OPEN** (integração), sem mudança | Não estão no diff. |
| SEC-RFC-A-08 | **PARCIAL** (continua NOTE) | q1: o eco da resposta ilegível está fechado (`response: null`, e um `offerId` acima de 128 caracteres vira `null`). **Continuam:** o `eventId` de uma linha ilegível do registro de respostas volta inteiro (1 000 000 caracteres em `unreadableResponses`), e um REVOKE ainda grava texto livre no `offerId`. O REVOKE só é alcançável com a revisão ligada. O eco do `eventId` também aparece com ela ligada (`unreadableResponses` só é preenchido nesse caso). Fecha como no R1: a contagem ou um hash, em vez do valor. |
| SEC-RFC-A-09 | **CLOSED** | q1: as chaves no intake de `generateProgram` e no `intake` do `restartProgram` dão o mesmo hash de programa e de entrada que sem elas. |
| SEC-RFC-A-10 | **OPEN**: condição antes de qualquer registro da revisão | É leitura de código; o caminho de `again` só existe com a revisão ligada. |
| SEC-RFC-A-11 | **CLOSED** | q1: com a triagem pedida (linha ilegível no registro de relatos, ou parada SYMPTOM), `withdrawn: true`, `current: null`, nenhum `*Seconds`. |
| SEC-RFC-A-12 | NOTE, melhor que no R1 | Os insights não pedem mais a calibração de semanas passadas. O leitor novo do registro de formatos soma no máximo cerca de 30 % ao custo da camada de baixo sobre o mesmo registro hostil (q2b). Fora do diff: a camada de baixo leva cerca de 10 s com 20 000 linhas de formato de uma só sessão. É pré-existente, só fica registrado aqui. |

## 2. Os leitores novos, do lado do abuso

### (a) A faixa vem das linhas `RUN_FORMAT_EMITTED` do registro de formatos

Achado novo **SEC-RFC-B-01**:

- **O mecanismo:** forjar ali é a condição de custódia já conhecida (selos sem chave).
- **A superfície é nova:** a fase B lê "o último formato da sessão em registro até o dia da corrida", não o formato que a execução admitida cita.
- **O efeito:** uma linha a mais, resselada por inteiro, que a camada de baixo lê e não usa, passa a mudar o estado e a ação do insight. Antes da fase B, essa mesma linha não tinha efeito nenhum.
- **Os limites seguros:** uma linha só com o `inputHash` certo é ilegível para a camada de baixo, que pede a triagem, e tudo é retirado. Uma linha sem ritmo no trabalho não vota. Nenhum número da forecast lê essa faixa (`deliveredBand` só entra em `executionsOf`). A revisão também lê a faixa (`e.band`), mas está desligada.

### (b) A linha só vale dentro da semana da sessão e gravada depois de o plano existir

A regra só restringe, e erra para baixo. O dia de criação vem de `program.canonical.asOf` e o de gravação de `provenance.firstRecordedAt`, ambos campos levados pelo cliente. Falsificá-los (para fazer uma linha do plano antigo contar) é a condição de custódia já conhecida. Não achei caminho novo.

### (c) A retirada da semana por relato chegado depois e por pausa

Achado novo **SEC-RFC-B-02**, mas só da classe de custódia:

- **A garantia "nunca mostrada alterada" depende dos fatos `RUN_REPORT_RECEIVED` do registro levado.**
- **Truncar o registro desfaz a garantia.** Sem os fatos "antes" das sessões corrigidas, a semana aparece com número mudado e sem retirada.
- **Forjar só retira mais, sem esconder a triagem.** Uma pausa forjada só acrescenta retirada (lado seguro), e a triagem continua nomeada primeiro, à frente da pausa (q3iii).
- **Nenhum leitor novo esconde a triagem.** `withdrawalNow` mantém a ordem (hold, triagem, pausa), e a triagem vem da camada de baixo, sem mudança.

### (d) As semanas sob hold, pelos fatos F08 do motor

São lidas pelo próprio leitor do motor (`readableF08`, `standingHolds`). Uma semana de hold vale crédito zero, o lado conservador. Um hold forjado só zera crédito. Apagar o fato faz a semana contar: é a truncagem do registro do motor, pré-existente, e as decisões do próprio motor sofrem o mesmo. Não sondei isso, porque é da mesma classe que B-02.

### Custo dos leitores novos

O custo é linear. `changedSince` é O(F) por chamada, chamado poucas vezes. O mapa de formatos entregues é O(F log F). `underHold` é O(H) por semana. Medido em q2b: 0, 5 000 e 20 000 linhas, sempre abaixo de cerca de 1,3 vez a camada de baixo no mesmo registro.

## 3. Os quatro achados abertos e o freeze

Deixar A-01, A-02, A-03 e A-10 abertos é **aceitável** num freeze destes bytes com a `V1X-PACE-REVISION` desligada. q4 mostra, sob a forecast e os insights ligados e a revisão desligada:

- os quatro cenários do R1 dão `INERT` (o ACCEPT antedatado, o REVOKE danificado, a linha futura e a resposta enviada);
- a faixa e o formato ficam na faixa da V1RC `[310,345]`;
- `runSessions` são idênticas às do caso sem registro;
- nada é gravado.

Mas ligar a revisão sobre esses bytes **não pede código**: basta um registro bound ao hash dos `values` em `phase-b/reviews/ssctr/SSCTR_V1RFC_RUN_RECORDS.json` (ou em `options.runForecastRecords`). q4 mostra a revisão `OFFERED` assim. Daí a B-03.

## Achados novos

| Id | Severidade | Achado | Sonda e o que observei | O que fecha |
|---|---|---|---|---|
| **SEC-RFC-B-01** | **CONDITION_FOR_INTEGRATION** (dono: custódia; estende SEC-RFC-A-04 e SEC-RWS-A-01/A-06). Recomendação ao candidato: não é bloqueio (dono: autor da fase B; QRE informado) | **A faixa de um insight sai de uma segunda leitura do registro de formatos, sem vínculo com o formato que a execução cita.** Uma linha `RUN_FORMAT_EMITTED` a mais, legível e resselada (`formatHash`, `inputHash`, `eventId`), não muda a camada de baixo, mas muda o insight. | `q2-delivered-band.mjs`. No controle, `STABLE`, ação `NONE`, faixas `[310,330]`. Com seis linhas forjadas, faixa 40 s/km mais lenta: `IMPROVING`, `EXPLAIN_ONLY`. Com faixa 40 s/km mais rápida: `SLOWER_THAN_BAND`, `EFFORT_GOVERNS_SLOW_TO_CUE`. Nos dois casos `layerBelowSessionsSame: true`, `calibrationSame: true`, `citedFormatStillOriginal: true` e nenhuma triagem. Só o `inputHash`: triagem `REQUIRED`, insights retirados. Sem ritmo: `NO_BAND_IN_ITS_WEEK`. | **Integração:** o registro de formatos entra na cadeia com chave da custódia (já exigido). **Candidato (recomendado):** a faixa é a do formato que a execução admitida cita (`execution.formatHash`), resolvido pelo próprio `readFormatRecord` da camada de baixo, e, sem isso, nula. Assim uma linha a mais volta a ser inerte e as duas camadas leem um formato só. |
| **SEC-RFC-B-02** | **CONDITION_FOR_INTEGRATION** (dono: custódia; é a classe conhecida de truncagem, SEC-RWS-A-01/A-06/D-04) | **A retirada "nunca mostrada alterada" (fecho da QRE-RFC-A-01) só vale sob custódia.** Ela lê os fatos `RUN_REPORT_RECEIVED` levados pelo cliente, e apagar os fatos anteriores das sessões corrigidas faz a semana aparecer com outro número dentro da semana. O mesmo vale, por leitura, para os fatos F08 de hold e para as pausas no registro do motor. | `q3-withdrawals.mjs` q3i. Na segunda, `SHOWN`, observado `[2820,2940,3075]`, média 1. Na quinta honesta, `REPORTS_CHANGED_SINCE_THE_WEEK_STARTED`. Na quinta com os 10 fatos apagados: `SHOWN`, `[2910,3000,3075]`, média 0,20, sem triagem; a camada de baixo só retém o ritmo de 10 linhas. | Custódia com chave e gravação atômica dos registros (A-01, A-06). O registro do freeze diz que a garantia da QRE-RFC-A-01 vale sob essa custódia, não contra quem controla os registros. |
| **SEC-RFC-B-03** | **CONDITION_FOR_THE_CANDIDATE** (dono: quem prepara o freeze; Security confere o texto) | **Nos bytes deste freeze, a revisão fica a um arquivo de dados de ser ligada.** Um registro bound ao hash fixado, no arquivo de registros ou em `options`, liga a `V1X-PACE-REVISION`. A-01, A-02, A-03 e A-10 passam então a valer contra o atleta: faixa até 3 % mais rápida e REVOKE recusável. | q4: `boundaries.REVISION: true`, `OFFERED`, rótulo `CURRENT_INDEPENDENT_REVIEW`. | **O registro do freeze deve dizer:** (1) a revisão está implementada, desligada e **não aprovada**, e **não falha fechado**, com os abertos nomeados: SEC-RFC-A-01, A-02, A-03, A-10, mais os de QRE e SSCTR que o autor lista; (2) nenhum registro da `V1X-PACE-REVISION` é válido sobre estes bytes; ligá-la exige código novo, os achados fechados e reverificados, e um freeze novo; (3) nenhuma frase do freeze, do README ou dos cabeçalhos diz que "toda fronteira falha fechado" sem excluir a revisão, e "desligada por padrão" não é dito como "segura"; (4) a garantia da QRE-RFC-A-01 e a leitura de faixa ficam ditas como condicionadas à custódia (B-01, B-02). **O verificador do freeze deve:** falhar se o arquivo de registros tiver qualquer registro com `boundaryId: 'V1X-PACE-REVISION'`. A alternativa é desligar a revisão no código, mas isso muda os bytes antes do freeze. |

## O que encontrei sólido no diff

- **Chaves da revisão:** o intake do `generateProgram` e o do `restartProgram` não as levam mais ao motor (A-09).
- **Retiradas:** uma retirada não repete a estimativa (A-11).
- **Eco da resposta ilegível:** fechado (A-08, parte).
- **Forecast:** nenhum número dela lê os formatos entregues.
- **Leitores novos:** só podem *acrescentar* retiradas ou zerar créditos quando alguém forja, e só deixam de retirar quando alguém trunca. Os dois são de custódia.
- **Pausa forjada:** não passa à frente da triagem.
- **Linhas mal seladas no registro de formatos:** continuam pedindo a triagem pela camada de baixo.
- **Custo:** linear, e os insights ficaram mais baratos.
- **Revisão desligada:** com ela desligada, o registro de respostas é devolvido como veio, mas não é lido nem gravado (q4).

## O que não verifiquei

- Uma divergência honesta, sem forjar, entre o formato citado e o último formato do dia (B-01, parte de candidato). Ela é possível pela leitura (por exemplo, uma reemissão no mesmo dia depois da corrida), mas não a montei.
- O apagamento de fatos F08, que é só leitura de código.
- A suíte conjunta e o `--preserved`.

## Próxima ação

- **Quem prepara o freeze:** cumprir a B-03 no registro e no verificador.
- **Autor da fase B (opcional, recomendado):** fechar a parte de candidato da B-01. O QRE julga a correção.
- **Integração:** B-01 e B-02 entram nas condições de custódia junto com A-04 a A-07.
- **Nada pede decisão do Founder,** e nenhum arquivo congelado precisa mudar.
