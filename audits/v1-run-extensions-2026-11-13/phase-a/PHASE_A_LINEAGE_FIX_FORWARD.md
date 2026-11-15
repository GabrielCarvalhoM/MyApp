# V1 Run Extensions — Fase A: fix-forward da linhagem de evidências (2026-11-15)

Registro do autor (Fable 5.2, Chief). Fecha o QRE-RWS-D-01 pela classe, implementa os itens L1 a L4 do SSCTR e fecha o SEC-RWS-D-01 no Core. É o que os juízes leem para saber o que procurar; não é parecer.

- Missão do Founder de 2026-11-15, que autoriza implementar o contrato de linhagem e L1 a L4, com o fechamento focal do SEC-RWS-D-01, e aceita provisoriamente o custo dito na seção 4.
- Contrato: `evidence-lineage/EVIDENCE_LINEAGE_CONTRACT.md` e `evidence-lineage/SSCTR_RWS_LINEAGE_ITEMS.md` (r2).
- Linha `claude/v1-run-extensions`. Partida conferida: HEAD `a4a434f`, árvore limpa.
- O commit documental do diagnóstico, `5bd8c2d` (branch `claude/v1-rws-evidence-lineage`), entrou por fast-forward: o mesmo commit, com o mesmo hash, é agora ancestral desta linha. Ele só toca `phase-a/evidence-lineage/`; não houve conflito. O branch de origem continua onde estava.

## 1. Reprodução antes de editar

Sobre `a4a434f`, sem mudar sonda nenhuma. Saídas comparadas byte a byte com as guardadas em `evidence-lineage/probes/out/`.

| Sonda | Resultado em `a4a434f` | Igual à saída guardada |
|---|---|---|
| `judges/q4-corr.mjs` (QRE) | depois da re-sincronização com esforço: linha `dev-x-v2` sozinha, nada retido, EASY **`[345,575]`** | sim |
| `judges/q4-corr-disputed.mjs` (QRE) | disputa e sem duração: `[345,420]` retido; depois da correção da importação **`[345,575]`** | sim |
| `judges/q4-corr-race.mjs` (QRE) | depois da correção: **`plan-race:dev-race-v2`, 6 km em 3000 s** lido como prova | sim |
| `d-matrix.mjs` EASY e LONG | 27 cenários por família | sim |
| `d-other-statements.mjs`, `d-late-race.mjs`, `d-engine-frozen.mjs`, `d-recompose.mjs` | calor e pausas: `[345,575]` depois da re-sincronização; E-1: `adverseSessions` 1 → 0 | sim |
| `judges/ssctr-m2-empty-merge.mjs` | sobreposição: `extentKm` 22, teto CT-3 24,2 | sim |
| `judges/sec-s1-signal.mjs`, V10 | fato reetiquetado como formato: triagem não pedida, 8 nativas | sim (comparado com o extrato) |
| `d-formats-selfread.mjs` | 20 revisões, 76 linhas de formato, nenhuma ilegível | sim |

Testes da extensão em `a4a434f`: 88 de 88.

O estado-base ficou em testes reproduzíveis: cada teste novo que fecha um caminho mostra antes o defeito no registro nu, pela calibração congelada (`[345,575]`; a prova de 6 km em 3000 s).

## 2. O que foi implementado

A regra, como o SSCTR a decidiu (L1, L2):

1. Todo relato de corrida recebido deixa um fato com quem falou.
2. Um relato vale até que uma correção **aplicada** do **mesmo autor** o substitua. Ninguém substitui o que outro autor disse.
3. Uma linha só vai a um leitor de ritmo, de capacidade ou de prova quando carrega todos os relatos em vigor da sessão. Senão é retida com a palavra nova `REPORT_NOT_CARRIED`. Nada do que o relato de fora disse é enumerado.
4. Na linha que carrega todos, a leitura é a de antes, sem mudança.

A linhagem só retém. A distância de uma linha é sempre a da própria linha.

### Arquivos

| Arquivo | Mudança |
|---|---|
| `src/v1-run-format.mjs` | `speakerOf` (quem falou, forma fechada); `reportFactOf` deixa fato para todo relato, com `speaker`, `standing` e `wholeKm`; `readableReport` com a forma nova sob o selo; `readReportFacts` recebe o registro do motor, indexa por sessão, calcula os relatos em vigor (`inForce`) e fecha o SEC-RWS-D-01; `reportsReading` (a palavra, mais o que L3 e L4 leem); `reportsVerdict` segue devolvendo só a palavra; `appendFormats` nunca escreve uma linha que ele mesmo não lê |
| `src/v1-run-history.mjs` | `PACE_WITHHELD` com a palavra nova; `WHOLE_ROW_WITHHELD`; `distanceFacts` aceita a leitura inteira; `historyReference` aplica L3 e L4 |
| `src/v1-run-format-index.mjs` | `readingOf` e `runCalibrationOf` passam o registro do motor; `admitted` retém a linha inteira; `finish` entrega a leitura aos leitores de execução e de histórico; cabeçalho com a regra, o custo e o hard gate |

Nenhum outro arquivo de `src/` mudou. `r6-provenance.mjs`, `r6-adaptation.mjs`, `v1-run-calibration.mjs`, `v1-run-index.mjs`, `v1-index.mjs` e `v1/RUN_FORMATS_V1.json` estão byte a byte como em `a4a434f`.

### Quem falou (L1-c)

Gravado na recepção, dentro do selo, a partir dos campos de origem do próprio relato. Três formas, sem texto livre:

| Forma | Quando |
|---|---|
| `ATHLETE` | não nomeia atividade de aparelho, nem fonte de relógio, nem provedor além de `MANUAL` ou `SELF_REPORT` |
| `DEVICE:<32 hex>` | nomeia **uma** atividade (um derivado fixo do id, nunca o id) e diz fonte de relógio, ou nenhuma |
| `DEVICE_UNIDENTIFIED` | fonte de relógio sem id; provedor nomeado sem id; dois ids diferentes; id que não é texto ou é vazio; id num relato que diz fonte manual |

`DEVICE_UNIDENTIFIED` não é o mesmo autor de nada, nem de si mesmo: não substitui e não é substituído.

O id que uma correção nomeia é o da linha que o cliente viu. Não entra na identidade do autor: uma correção enviada pelo aparelho que nomeia o relato do atleta é do aparelho.

### Relatos em vigor

Lidos uma vez por sessão, dos dois registros:

- **Correção aplicada:** alguma linha que o registro do motor guarda como substituída a nomeia em `supersededBy`.
- **Substitui:** os relatos do mesmo autor que estão na linhagem dela (os relatos das linhas que ela aposentou, e os das linhas que as correções entre eles aposentaram), ou que o registro de relatos guardou num instante **anterior** ao dela.
- **Não substitui nada:** correção que o motor recusou; correção sem fato legível; autor não identificado; o mesmo id de relato sob dois autores; sem o registro do motor.
- **Fica em vigor, sem autor mostrado:** um relato que uma linha do registro do motor nomeia e de que o registro de relatos não tem fato.

### L3 e L4

Só a referência de histórico (`extentKm`, L30, longão comparável). Só baixam.

- **L3:** a lista de gravações soma ao menor entre a primeira distância que a linha guarda e a que o próprio relato que listou disse para si. O `measuredKm` que a conclusão lê não muda.
- **L4:** o menor entre isso e o menor valor que um relato em vigor declarou para a corrida inteira, quando esse relato está fora da linha, ou quando os relatos da própria linha disputam. O valor de um relato (`wholeKm`) é a sua medida utilizável com a própria lista, o número do atleta, ou o menor dos dois; nunca uma gravação listada sozinha, uma medida POOR do aparelho, sem duração ou com falha.

### SEC-RWS-D-01

`readReportFacts` deixou de pular toda linha etiquetada `RUN_FORMAT_EMITTED`. A que não é formato legível entra em `unreadable`: a triagem é pedida com o motivo `RUN_REPORT_UNREADABLE`, as sessões saem por tempo e nenhuma linha vai a leitor de ritmo.

Para um registro honesto nunca se trancar por uma linha própria, `appendFormats` não escreve formato que `readableFormat` recuse; o que não foi guardado é nomeado (`formatsNotKept`).

Nada disso é autenticação. O selo continua sendo hash sem chave.

## 3. Leituras do autor que pedem a palavra do juiz

O contrato não decide estes pontos. Decidi cada um pelo lado de reter, e os digo aqui para não serem descobertos.

| # | Leitura | Por quê |
|---|---|---|
| 1 | **A retenção é da linha inteira, não só da distância.** `REPORT_NOT_CARRIED` e `REPORTS_UNREADABLE` valem também numa linha sem distância: ela é marcada POOR para a calibração e sai com `paceEvidence` falso | A calibração congelada lê o ritmo de trabalho (`work.paceSecondsPerKm`) de uma sessão forte sem precisar da distância da linha. O atleta relata o ritmo de trabalho; a importação marca o GPS como POOR; o atleta corrige o próprio relato: a linha viva é a correção sozinha, sem distância e sem a marca. Sem esta leitura ela voltaria a ser sessão comparável. **Muda um comportamento aceito:** com o registro ilegível, as linhas sem distância agora também entram em `paceEvidenceWithheld` |
| 2 | **Relato não gravado não é relato em vigor** (`standing: false`). Do relato que cita um formato que o registro não tem (a revisão é pedida de novo), só a parada é guardada, como antes; ele não retém a linha que depois chegar | A parada fica fora da regra. Contar esse relato reteria a corrida de um cliente honesto que reenvia sob outro id, e mudaria um resultado aceito (`final-fix`, revisão da fila) |
| 3 | **Relato que o registro do motor nomeia e que não tem fato fica em vigor.** Cobre registro feito com a fronteira desligada e fato apagado de um relato que o motor ainda nomeia | "O que não se consegue mostrar fica em vigor." Custo: uma correção sobre linha gravada antes de a fronteira ligar retém a corrida |
| 4 | **Provedor nomeado sem id de atividade não é o atleta.** Um relato do app que diga `provider: 'APP'` seria `DEVICE_UNIDENTIFIED`, e as correções do atleta deixariam de substituir | Uma importação sem id lida como atleta poderia ser substituída por uma correção do atleta. Vira requisito de integração (seção 6, I-8) |
| 5 | **Teto de custo:** 64 relatos, 64 linhas e 64 relatos por linha, por sessão. Acima disso nada é lido como substituído e a linha é retida | Não é valor esportivo. Uma sessão honesta tem poucos relatos |
| 6 | **Precedência:** os motivos da própria linha, depois `REPORT_NOT_CARRIED`, depois `REPORTS_UNREADABLE` | A do contrato (seção 4.1). O caso `late` de `v1rws-final-fix` não mudou |
| 7 | **Relato de id longo ou sem id** é nomeado pelo conteúdo, como antes; nenhuma linha é feita dele por esse nome, então ele retém a linha | Cliente conforme manda id de até 128 caracteres |
| 8 | **`formatsNotKept`** não é alcançado por entrada nenhuma. A guarda em `appendFormats` tem teste direto; a linha que a mostra na resposta, não | Caminho defensivo declarado |

## 4. O custo, e o que isto não fecha

**Custo aceito pelo Founder nesta missão e pelo SSCTR (L1-f).** Com o motor como está congelado, depois que uma fonte corrige uma corrida que a outra também relatou, essa corrida sai da evidência de ritmo e não volta. Na diferencial (seção 7), 110 respostas passam a reter uma corrida que antes entregavam. Conclusão, crédito, carga e dose não mudam.

Um autor sozinho tem caminho de volta: a correção seguinte que o motor aplicar substitui o que ele disse antes, inclusive uma correção recusada (cenários 22 e 23).

### HARD GATE DE INTEGRAÇÃO REAL — não atendido aqui (achado E-1, item L5)

> **Uma re-sincronização do HealthKit de uma execução que o atleta também relatou não pode apagar as respostas do atleta no CoachingCore.**

- **O defeito continua.** O motor congelado troca a linha inteira numa correção. Se a correção vem do aparelho, a linha viva perde recuperação, esforço, função no dia seguinte, condições e pausas do atleta. No teste: recuperação `ADVERSE` → `UNKNOWN`, `adverseSessions` 1 → 0.
- **O que esta extensão faz, e só isto:** retém a evidência de ritmo dessa corrida. Não devolve nada ao motor. **E-1 não está resolvido.**
- **O que a integração precisa mostrar antes de qualquer atleta real**, por teste de resultado, nos casos ADVERSE, SYMPTOM, FATIGUE e HEAT (item L5):
  1. a revisão que aplica a re-sincronização lê o que o atleta declarou por último;
  2. a triagem segue pedida para a parada por sintoma;
  3. as declarações do atleta seguem em vigor.
- Se o mínimo pedir mudança no motor congelado, a decisão é do Founder.
- Vale nas duas formas de envio: dois relatos (o do atleta e a importação), ou um relato só que leva a medida do aparelho e o que o atleta acrescentou.

Fixado em teste, para ninguém o ler como fechado: `HARD GATE OF A REAL INTEGRATION, NOT MET HERE` em `test/v1rws-lineage.test.mjs`. O teste afirma o defeito como ele está.

### Limite da regra do autor: um relato com duas vozes

O contrato de dados deixa o app mandar **uma** observação para uma sessão feita com atividade vinculada: a medida do aparelho e o que o atleta acrescentou. Para o Core isso é um relato de um autor, a atividade. Se a re-sincronização não repete o que o atleta acrescentou (por exemplo, o segundo arquivo), é o mesmo autor substituindo o próprio relato, e a corrida volta a ser evidência: EASY `[345,575]`.

O Core não distingue duas vozes dentro de um relato, e o oráculo do contrato dá o mesmo resultado. Fecha na integração: I-2 e I-4, e o hard gate acima. Fixado em teste: `the limit of the rule of the speaker, stated`.

## 5. Testes

### Arquivo novo: `test/v1rws-lineage.test.mjs` (20 testes)

Pelo ponto de entrada composto, salvo onde diz que monta ou altera um registro.

| Teste | O que cobre |
|---|---|
| Matriz, EASY e LONG (2 testes, 31 cenários cada) | A matriz da seção 5 do contrato, mais quatro cenários. Em cada um: a palavra do ponto de entrada; os relatos em vigor pelo runtime e por um oráculo escrito fora dele; o que antes era retido continua retido (L1-a); a faixa leve igual à do controle; com nada retido, a calibração congelada byte a byte; a referência de histórico; a mesma leitura por JSON e com os registros embaralhados; a calibração exportada; nada reescrito |
| QRE-RWS-D-01 reproduzido e fechado | Os cenários 03 a 07, com o defeito mostrado no registro nu; disputa; sem duração; releitura duas semanas depois |
| Re-sincronização tardia | No meio da semana seguinte |
| Resposta que não entrega sessão | Revisão da fila, anterior ao registro, que traz a re-sincronização: retida na própria resposta, com a calibração sobre o registro admitido |
| Calor e pausas (L1-e) | Três ordens; o controle que mostra o custo |
| Prova (L1-e) | Pelo motor numa jornada inteira até a semana da prova, três ordens; e as linhas da sonda do juiz |
| A regra do autor | Registros montados à mão: um e dois autores, correção recusada, correção sem fato, relato sem fato, sem o registro do motor, linha aposentada perdida, outra atividade, aparelho sem id, id sob dois autores, instante anterior, igual e posterior, outra sessão, outro atleta, ciclo em `supersededBy`, acima do teto |
| Quem falou | A tabela de `speakerOf`; o fato de todo relato; autor trocado depois quebra o selo |
| L3 e L4 | Só baixam; nunca criam; `measuredKm` da conclusão intocado; o que é e o que não é valor de um relato |
| L3-d | A grade `m2`: mesma dose e expressão do próximo longão (16 km, 100 min); teto de 24,2 para 18,084 |
| L4-e | 03, 08, 09, 10, 18 e 19 em leve e longão, com a referência e o próximo longão |
| A linha inteira | Linha com ritmo de trabalho e sem distância; voltas de uma sessão nativa |
| Parada por sintoma | Fora da regra: conflito, correção do próprio atleta, correção do aparelho; a triagem respondida depois limpa como antes |
| SEC-RWS-D-01 | Sete formas de linha ilegível, a triagem que não a limpa, e o limite do fato apagado |
| Registro honesto nunca se tranca | Seis jornadas, restart, JSON; `appendFormats` |
| Registros guardados, histórico reconstruído, restart, fronteira desligada | Mesma leitura; perder linhagem só retém mais (V11) |
| Custo | 4.000 sessões (16.000 fatos, 12.000 linhas); uma sessão hostil de 3.000 correções |
| Hard gate E-1; limite das duas vozes | Seção 4 |

**Ordem de chegada.** Não afirmo independência da ordem. O que os testes afirmam: em nenhuma ordem uma linha que deveria ser retida é entregue. As mesmas afirmações em três ordens (08, 09, 10) são todas retidas, com a mesma referência de histórico; a palavra difere (`REPORT_NOT_CARRIED` em 08, `DISTANCE_DISPUTED` em 09 e 10).

### Testes existentes que mudaram de resultado esperado

Nenhum teste foi removido. Cada mudança está comentada no próprio teste.

**Aceitas pelo SSCTR (seção 3 do registro dele):**

| Onde | Antes | Agora |
|---|---|---|
| `v1rws-fix-forward.test.mjs`, caso `whole` | nada retido; `paceEvidence` verdadeiro; hash igual ao da calibração congelada | retido `REPORT_NOT_CARRIED`; `paceEvidence` falso; a asserção de hash cai; entram 08, 09 e 10 retidos, com as mesmas bordas e a referência de 6,6 km. `merged`, `row.eventId`, status, base, conclusão e bordas como antes |
| `v1rws-final-fix.test.mjs`, caso `whole` | idem | idem |

**Consequência direta do contrato (seções 1 e 4.1: todo relato deixa fato; forma nova do fato):**

| Onde | Antes | Agora |
|---|---|---|
| `fix-forward`, `final-fix`: fatos montados à mão (4 ajudantes) | forma antiga | forma nova (`speaker`, `standing`, `wholeKm`) |
| `fix-forward`, `final-fix`: lista de chaves do fato; fatos comparados inteiros (5 asserções) | 8 chaves | 11 chaves |
| `fix-forward`: `reportFactOf` de um relato que não diz nada | `null` | um fato que não diz nada |
| `final-fix`: `said({segments: []})`, `said({declared: {}})` | `null` | um fato que não diz nada |
| `fix-forward`, `final-fix`: fato refeito sem parada e sem distância | ilegível | legível (cai a exigência de o fato dizer alguma coisa) |
| `final-fix`, respostas que entregam sessão: linhas acrescentadas ao registro | só formatos | formatos, mais um fato por relato recebido |
| `fix-forward`, `final-fix`: `PACE_WITHHELD` | 5 palavras | 6 |

**Consequência direta de L1 e L2 (um relato em vigor que a linha não carrega):**

| Onde | Antes | Agora |
|---|---|---|
| `fix-forward`, `final-fix`: veredito à mão com um fato `r3` da mesma sessão fora da linha | `null` | `REPORT_NOT_CARRIED` |
| `final-fix`, respostas: "dois relatos que se contradizem" e "correção fora da janela" | retido só `SEVERAL_RECORDINGS` | também a linha da sessão cujo relato o motor recusou, `REPORT_NOT_CARRIED` |

**Acréscimos, sem mudar resultado:** em `fix-forward` e `final-fix`, casos novos de linha de fato alterada (autor em texto livre, autor de outra forma, sem autor, `standing` que não é booleano, linha só de parada com distância, `wholeKm` fora do limite).

O caso `late` de `v1rws-final-fix` não mudou, como o contrato previa.

## 6. Dependências de integração (registradas, nenhuma construída)

Nada aqui as substitui, e nenhum teste as apresenta como feitas.

| # | O quê |
|---|---|
| Hard gate | A re-sincronização não apaga as respostas do atleta no motor (seção 4) |
| I-1 | Toda importação traz o id da atividade, o mesmo em toda re-sincronização. Identidade confiável das atividades do HealthKit |
| I-2 | Uma edição do atleta nunca é enviada sob o id de uma atividade de aparelho |
| I-3 | Uma gravação por relato, cada uma com a sua identidade (SSCTR-RWS-D-01 e B-03 seguem abertas: L3 não as fecha, na forma de 26 km nem no lado do crédito) |
| I-4 | Uma correção repete tudo o que o seu autor diz da execução |
| I-5 | Contrato de reenvio e correção entre fontes |
| I-6 | O registro do motor é guardado com as linhas substituídas |
| I-7 | Cadeia de custódia com chave; gravação atômica dos registros; `asOf` do servidor |
| I-8 (nova) | O relato do próprio atleta não nomeia provedor além de `MANUAL` ou `SELF_REPORT` |
| I-9 | Reparo auditado de linha ilegível, na custódia (SEC-RWS-D-02, SSCTR-RWS-D-02). O estado continua permanente no Core, e agora também uma linha de formato ilegível o provoca |
| I-10 | Apagamento e retenção de dado de saúde; o fato agora guarda também o autor (derivado do id), `standing` e `wholeKm`, e todo relato deixa fato (SEC-RWS-C-04 cresce) |
| I-11 | Base legal e decisões de privacidade (G07) |
| L1-f | Antes de atleta real, a integração declara que fração das corridas fica retida para sempre; se for material, dá o caminho de volta |

## 7. Verificações diferenciais

`evidence-lineage/fix-forward/probes/differential.mjs`: os mesmos clientes conformes pelo ponto de entrada de `a4a434f` e pelo deste candidato, revisão a revisão. Saída em `probes/out/differential.txt`.

- 102 clientes, 647 revisões.
- 62 clientes idênticos em tudo o que o script compara: seis jornadas inteiras (até 12 semanas, por tempo, prova, faltas e paradas, duas fontes concordando, maratona) e os cenários de fusão sem correção nem conflito.
- 40 clientes diferem, todos nos sentidos permitidos. **Nenhuma diferença inesperada.**

| O que foi comparado | Resultado |
|---|---|
| Resposta inteira do motor (plano, decisão, registro, crédito, carga, holds, triagem clínica) | idêntica em toda revisão em que o cliente ainda não tinha recebido nada diferente |
| Seleção das sessões (expressão, padrão, blocos, dose, estimativa, instruções) | idêntica, salvo depois de uma retenção nova ou de um histórico menor |
| Leitura das execuções (status, base, conclusão, `measuredKm`, minutos, voltas) | idêntica |
| Triagem, perguntas, ofertas, pausa de classe | idênticas |
| Linhas de formato do registro; registro de histórico | idênticos |
| Retenção | 110 respostas com retenção nova, todas `REPORT_NOT_CARRIED`. Nenhuma corrida antes retida passou a ser entregue; nenhuma mudou de motivo |
| Referência de histórico | 34 ocorrências, todas para baixo: 11 → 6,6 e 16 → 9,6 (L4); 15,4 → 11 e 22,4 → 16 (L3) |

**Diferenças de comportamento esperadas, ditas expressamente:**

1. **L1 e L2.** Corrida corrigida por uma fonte depois de a outra também a relatar, relato recusado em conflito, correção recusada, retração por uma das fontes: a linha deixa de ir a ritmo, capacidade e prova. A faixa leve deixa de se alargar (`[345,575]` → `[345,420]`); sessões seguintes saem com a faixa certa.
2. **L4 no longão.** Com a referência do longão em 9,6 km em vez de 16, o longão seguinte sai **por tempo**, na mesma dose (100 min), em vez de 16 km nativos. É o que 09 e 10 já davam; agora 08, 11, 12 e 19 dão o mesmo. O cliente conforme então relata esse longão por tempo.
3. **L3.** Duas fontes que mediram a corrida inteira, uma delas listando outra gravação: a referência cai de 22,4 para 16 (longão) e o teto CT-3 do longão seguinte de 24,2 para 18,084. A distância do longão seguinte não muda (16 km).
4. **Linha sem distância.** Passa a aparecer em `paceEvidenceWithheld` quando não carrega um relato em vigor ou quando o registro é ilegível.
5. **Registro de formatos.** Uma linha de fato por relato de corrida recebido, também o que não diz nada de distância nem de parada; três chaves novas no fato.

## 8. Suítes (três resultados, separados)

Rodadas pelo autor sobre o estado deste commit.

| Execução | Resultado |
|---|---|
| Suíte conjunta (`node --test` em `CoachingCore/`) | 1443 entradas, 1442 passam, **1 falha**: `V1RC COACHINGCORE-V1-FREEZE-1 is preserved: every file it binds is byte-identical here`. É a falha histórica conhecida, por desenho: o teste é um verificador do freeze da V1RC e acusa o arquivo emendado `src/r6-adaptation.mjs`. Não foi editado. **A suíte não é verde nesta linha** |
| Testes da extensão (`test/v1rws-*.test.mjs`) | 108 de 108: os 88 anteriores, com as expectativas da seção 5, e 20 novos |
| O teste histórico no seu snapshot | Extraí `c8104c1` para um diretório de rascunho e rodei `test/v1rc-calibration.test.mjs` lá, sem edição: 30 de 30. O arquivo do teste é byte a byte o mesmo nesta linha, onde dá 29 de 30 |
| Freezes anteriores nesta linha | `node scripts/v1rws-freeze.mjs --preserved`, exit 0: `COACHINGCORE-V1-FREEZE-1` 197 de 197 byte a byte, mais o arquivo emendado com a base e o diff autorizados; `COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1` 30 de 30 |

**Volume.** Leitura de fatos e admissão sobre 4.000 sessões com 16.000 fatos e 12.000 linhas, e sobre uma sessão hostil de 3.000 correções encadeadas com uma linha que nomeia 3.000 relatos: cada uma abaixo do limite de 6 s do teste (o teste inteiro, com a montagem dos registros, levou cerca de 0,6 s). O teste anterior de 30.000 fatos sob um nome pelo ponto de entrada continua abaixo de 8 s.

**Registro honesto.** 74 revisões em seis jornadas, 490 linhas de formato e 260 fatos: nenhuma linha ilegível, nenhum formato não guardado. Nas 647 revisões da diferencial, `unreadableFormats` e `unreadableReports` são iguais aos de `a4a434f`.

## 9. Mutação do autor (apoio, não evidência independente)

`evidence-lineage/fix-forward/probes/mutation.mjs`, saída em `probes/out/mutation.json`. 53 mutantes, um por guarda nova, aplicados numa cópia de rascunho, com os 108 testes da extensão.

- **53 de 53 mortos**, cada um por um teste que a cópia sem mutação passa.
- O controle: na cópia de rascunho falha só `I10, V6`, que lê o repositório inteiro contra os freezes e não tem como rodar numa cópia mínima. Essa falha não conta como morte.

**A primeira passada estava errada, e digo como.** O script contava como morto qualquer mutante com alguma falha, e o controle já falhava em `I10`: deu 53 de 53 sem provar nada. Relendo contra o controle eram 49 mortos e 4 sobreviventes:

| Sobrevivente | O que mostrou | O que fiz |
|---|---|---|
| L3 desligado | Nos meus testes de L3 o L4 cobria o mesmo caso: L3 nunca agia sozinho | Teste novo em que as duas medidas concordam dentro da tolerância (15 e 16 km) e só L3 baixa a soma |
| A palavra da linhagem antes dos motivos da própria linha | Nenhum teste tinha os dois ao mesmo tempo | Teste novo |
| Linha com `supersededBy` mas sem `superseded` lida como substituída | Sem teste | Teste novo |
| Checagem do número de relatos de uma linha | Redundante: as outras duas checagens do teto já a implicam | Removi a checagem; o teste do teto ficou mais preciso (64 passa, 65 não) |

**Cobertura fina, dita:** 24 dos 53 mutantes morrem por um teste só. São os de `speakerOf` (M01 a M04), a regra do instante e da autocorreção (M10, M11), o teto e a forma das linhas do motor (M14 a M17), a parada de relato não gravado (M18), a precedência (M22), a disputa e os valores de L4 (M26 a M30), o L3 (M31, H01 a H03), o L4 que sobe (H06), o SEC-RWS-D-01 (M32) e a guarda de `appendFormats` (M38). Um teste a menos em qualquer desses pontos e a guarda fica sem prova.

**Exploração do autor além dos testes** (não é evidência independente): relato novo do atleta depois da re-sincronização, com id novo e com o id antigo; correção do atleta nomeando a linha da importação; três autores; importação nova que não é correção; registro feito com a fronteira desligada e depois ligado. Em todos a linha fica retida ou carrega todos os relatos. O caminho que não fecha é o da seção 4 (um relato com duas vozes).

## 10. O que não verifiquei

- Nenhum juiz viu este candidato ainda. Tudo acima é do autor.
- Se o HealthKit re-sincroniza com o mesmo id de atividade, e se o adaptador mandaria a re-sincronização como `correctionOf`. Não existe adaptador.
- Com que frequência uma correção cruzada acontece com atletas reais (L1-f).
- Um caso em que o achado E-1 muda a decisão do motor. Não procurei; o gate vale independentemente disso.
- O comportamento do motor congelado quando um plano novo reutiliza ids de sessão do plano anterior com o registro carregado. Vi, sem investigar, que o motor trata o id de sessão como a identidade da execução entre planos. A linhagem usa a mesma identidade que o motor; não avaliei esse comportamento.
- A prova pelo motor em jornada inteira foi feita para a prova de 10 km; não para meia nem maratona.
- A diferencial cobre os clientes listados no script, não todo o espaço de entradas.
- `scripts/v1rws-freeze.mjs --write` não foi executado neste ciclo: depende do registro habilitador, que só o SSCTR emite.

## 11. O que não mudou

- Motor, calibração, valores, doses, progressão, conclusão por distância, holds e triagem.
- O histórico prescrito e o `formatHash`.
- Os verificadores e testes dos freezes históricos. O teste histórico da V1RC continua falhando nesta linha por desenho e não foi editado.
- `CURRENT_MISSION.md`, `MISSION_LEDGER.md` e a fila humana.
