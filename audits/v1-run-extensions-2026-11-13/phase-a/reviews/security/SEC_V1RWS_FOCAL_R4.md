**Veredito: PASS_WITH_CONDITIONS.** O candidato é sintético e não tem integração real. Nenhum achado é BLOCKING e nenhuma condição pesa sobre o candidato sintético. As condições que restam são todas de integração: as anteriores que seguem abertas, e duas novas (E-01, E-04). O SEC-RWS-D-01 está **CLOSED** no Core, com evidência executada na revisão seguinte e no reinício.

# SEC-V1RWS-FOCAL-R4 — Security, Privacy & Abuse, juiz independente do fix-forward da linhagem de evidências (Fase A)

- **Juiz:** Security, Privacy & Abuse Architect 1.1.0. Esta instância não escreveu o candidato, o contrato nem o registro do autor. Avaliei e não corrigi nada.
- **Candidato:** worktree `v1-run-extensions`, branch `claude/v1-run-extensions`. Conferi o HEAD `4b1622f55e3d66e6e381bf33cc659fbed1f1713a` e a árvore limpa antes e depois dos testes (`git status --short` vazio). Base: `a4a434f`.
- **Data:** 2026-11-15. É a única rodada que a missão permite.
- **Escopo focal:** só o meu domínio em `git diff a4a434f 4b1622f -- CoachingCore/src`: a falha fechada dos sinais de segurança, a autoria, a integridade dos fatos, o poder de quem forja, o custo, o dado novo guardado e as dependências de integração.
- **Contexto injetado pelo host.** Recebi o conteúdo destes arquivos e não usei nada deles como evidência. O MEMORY.md resume rodadas anteriores e nomeia achados.

| Arquivo | sha256 |
|---|---|
| CLAUDE.md global | `c75718d0d2fe2cce1332cf7240ef0b8013ca2901d52b4d6778480c1c333709c6` |
| CLAUDE.md do projeto (`MyApp/CLAUDE.md`) | `e657d059e06fd1a21613250753a8c79ac605b69d955191d634966b3c8fc922e6` |
| MEMORY.md | `407dd7b73228e9b19d25a64bcf8349d6ab3057ef381b25883c137bc814004e09` |

## Resumo

- **O SEC-RWS-D-01 fechou.** Uma linha que não é formato legível nem fato legível agora falha fechado, qualquer que seja a etiqueta. Uma linha etiquetada como formato também. A triagem é pedida com `RUN_REPORT_UNREADABLE`, as sessões saem por tempo e toda linha é retida. Uma triagem respondida depois não limpa nada. Dado provadamente inválido continua distinto de dado ausente.
- **O Core não se tranca sozinho.** Rodei 1259 revisões aleatórias, mas legítimas, em cinco planos. Nenhuma linha ficou ilegível, nem depois de JSON e embaralhamento, e nenhum formato ficou sem ser guardado.
- **Forjar não dá poder novo.** Um cliente que forja menos do que apaga. Apagar só o fato já não tira o relato de vigor, porque o registro do motor ainda o nomeia. Para apagar o sinal é preciso mexer nos dois registros, e esse é o limite já declarado. Nada no candidato se apresenta como autenticação.
- **O custo é linear.** O teto de 64 contém a sessão hostil.
- **A autoria tem uma lacuna de integração (E-01).** Quem falou sai de campos de origem que o próprio cliente afirma.
  - Um aparelho que não manda nenhum campo de origem é lido como o atleta.
  - Um relato do atleta que leva o id da atividade é lido como o aparelho.
  - Nas duas formas, honestas mas descuidadas, a re-sincronização devolve a corrida à evidência de ritmo, e o defeito D-01 do QRE volta: EASY `[345,575]`.
  - O sinal de sintoma não é afetado.
  - O Core não tem como distinguir esses casos sozinho. Só a custódia ou o adaptador fecham, ao gravar a origem pelo canal de entrada. Os requisitos I-1, I-2 e I-8 já registram isso.
- **O dado novo guardado amplia a SEC-RWS-C-04.** O derivado do id da atividade é um pseudônimo estável e sem chave (E-04).

## 1. Reprodução antes de julgar

Conferi a cópia do autor `scratchpad/before-a4a434f/CoachingCore`. Os 54 arquivos de `src/` são byte a byte os de `git archive a4a434f`, e os de `test/` e `v1/` presentes também. Não escrevi nada nela.

Rodei a sonda `evidence-lineage/probes/judges/sec-s1-signal.mjs` sem mudar nada (sha256 `f4cad302…33cf`) nas duas árvores. Resumo de `out/s1-summary.txt`: "sem triagem" é a revisão seguinte com triagem anterior à parada; "triagem depois" é com triagem respondida depois da parada.

| Variante | `a4a434f` | `4b1622f` |
|---|---|---|
| V10: fato reetiquetado `RUN_FORMAT_EMITTED` (a D-01) | sem triagem: `NOT_RAISED`, **8 nativas**, `unreadableReports` 0, `unreadableFormats` 9. Triagem depois: igual | sem triagem: `REQUIRED(RUN_REPORT_UNREADABLE)`, **0 nativas**, 12 retidas `REPORTS_UNREADABLE`, `unreadableReports` 9. Triagem depois: **igual, não limpa** |
| V10b: fatos apagados e uma linha-lixo etiquetada como formato | `NOT_RAISED`, 8 nativas | `REQUIRED(RUN_REPORT_UNREADABLE)`, 0 nativas, 12 retidas |
| V2, V4–V9, V11–V14 (alteração, chave a mais, outro atleta, tipo `X`, não-linha, sem `fact`, forma de `644cd8e`, instante não canônico) | `REQUIRED(RUN_REPORT_UNREADABLE)` ou parada lida, 0 nativas | igual. Onde a parada continua legível (V11), o motivo é o sintoma, e depois da triagem passa a `RUN_REPORT_UNREADABLE` |
| V1 apagado; V3 e V4b ressignados de forma coerente | `NOT_RAISED`, 8 nativas | `NOT_RAISED`, 8 nativas: o limite declarado (D-04) |
| V15 e V15b: registro que não é lista ou ausente | HOLD, nada entregue | igual |
| W1: linha ilegível levada adiante | carregada, `REQUIRED` | carregada, `REQUIRED` |

Vi a D-01 falhar em `a4a434f` e fechar em `4b1622f`. No reinício (`probes/e-restart.mjs`, a nova sonda do plano a partir dos registros guardados), o fato reetiquetado dá `PROPOSED`, `REQUIRED(RUN_REPORT_UNREADABLE)`, 0 nativas e 9 ilegíveis no candidato. Em `a4a434f` dava `NOT_RAISED` com 2 nativas. Guardado como está, e apagado, os dois dão `NOT_RAISED` (a triagem da nova admissão é posterior à parada).

## 2. SEC-RWS-D-01: estado CLOSED no Core

- **Causa removida.** `readReportFacts` (`src/v1-run-format.mjs:552`) agora manda para `unreadable` toda linha etiquetada como formato que `readableFormat` recusa. Toda outra linha que não é fato legível também vai para lá (`:553`). A cobertura é de qualquer etiqueta:
  - `RUN_FORMAT_EMITTED` ilegível (V10, V10b);
  - outro valor de `fact` (V9);
  - sem `fact` (V12);
  - não-objeto (V11 a V11d);
  - formato alterado ou de outro atleta: teste do autor `SEC-RWS-D-01 closed`, que passa.
- **Dita à parte de um sintoma.** `screenOf` dá `RUN_REPORT_UNREADABLE` com `sessionIds: []`. Só uma parada legível nomeia `RUN_STOPPED_FOR_A_SYMPTOM`.
- **Inválido continua distinto de ausente.** Apagado dá `NOT_RAISED` (V1), e o que foi alterado dá `REQUIRED(RUN_REPORT_UNREADABLE)`. Há também uma melhora: apagar só o fato de um relato que uma linha do registro do motor nomeia não o tira de vigor, e a corrida segue retida (`e-forge` F1, abaixo).

## 3. O Core não pode bloquear registro válido

O estado de linha ilegível é permanente no Core, e agora uma linha de formato também o provoca. Procurei uma entrada legítima que levasse o ponto de entrada a escrever uma linha que ele mesmo recusa.

- **`probes/e-selfread.mjs`**, com as sementes 11, 22, 33 e 44, 30 clientes cada (`out/e-selfread-seed*.json`).
  - **Planos:** experiente de 16 km, 10 km, novato, maratona de 16 semanas, 5 km. O de meia maratona não gerou plano e ficou de fora.
  - **Relatos variados:**
    - ids de 1 a 140 caracteres, com `|`, espaço, acentos e `✓`;
    - distâncias 0,01, 299,99, 300 e 300,01;
    - fontes medidas e manuais em vários formatos de escrita;
    - 0, 1, 2 e 21 gravações, e `segments` que não é lista;
    - `declared` com e sem motivo;
    - `gpsQuality`;
    - 14 formas de `stop`, incluindo `'x'`, `true`, `1`, `[]` e `{reason:null}`;
    - `seconds` no lugar de `minutes`;
    - `manualDistanceKm` 301;
    - 11 formas de `source`, com id numérico, id vazio, `APP`, `MANUAL` e sem id.
  - **Outras entradas:**
    - importações do aparelho na mesma revisão;
    - correções e re-sincronizações no meio da semana seguinte, nomeando a linha ou um id fundido;
    - replay da revisão inteira;
    - `asOf` com `.123`, `.5` e `+05:30`.
- **Resultado:** 1259 revisões, 4370 linhas de fato, 5959 linhas de formato, **0** `unreadableReports`, **0** `unreadableFormats`, **0** `formatsNotKept`, **0** ilegíveis depois de JSON e embaralhamento (fatos e formatos), **0** exceções.
- **Testes do autor:** o teste `an honest record never locks itself`, com seis jornadas, restart e JSON, passa.
- **`appendFormats` guarda a linha antes de escrevê-la** (`:426-433`). O caminho `formatsNotKept` não foi alcançado por nenhuma entrada minha, como o autor declara.
- **`appendReportFacts` não confere a própria linha.** Mas cada campo que `reportFactOf` escreve está dentro da forma que `readableReport` exige:
  - a distância é limitada por `num`;
  - `ownKm` vem de valores limitados;
  - `wholeKm` é o menor entre dois limitados;
  - `corrected` implica `ownKm`;
  - o speaker é uma das três formas;
  - `reportId` tem até 128 caracteres ou é nomeado pelo conteúdo;
  - `recordedAt` é a saída de `utcTimestamp`.

  `probes/e-integrity.mjs` confirma que a linha escrita pelo módulo é lida, também depois de JSON.
- **Limite:** um fato da forma de `a4a434f` (sem speaker) fica ilegível e tranca o registro. Isso está no teste do autor e é a leitura 10 aceita para o sintético. É migração, e fica na D-02.

## 4. Autoria

`speakerOf` (`src/v1-run-format.mjs:217-223`) grava quem falou a partir de `source.activityId`, `canonicalActivityId`, `source.quality` e `source.provider`, que o cliente afirma. Rodei `probes/e-speaker.mjs` pelo ponto de entrada, na forma do QRE-RWS-D-01: o app lista o 2º arquivo, a importação traz o 1º, e depois a importação se re-sincroniza como correção. Saída em `out/e-speaker-r2.json`.

| Forma | Speakers gravados | Em vigor | Palavra | EASY seguinte |
|---|---|---|---|---|
| Controle: um relato inteiro do app | `ATHLETE` | app-x | admitida | `[345,420]` |
| A1 honesta (HealthKit, id `hk-1`); A2 a re-sincronização nomeia o id da linha | atleta; `DEVICE:2ef791…` ×2 | app-x, dev-x-v2 | `REPORT_NOT_CARRIED` | `[345,420]` |
| **B1 importação e re-sincronização sem nenhum campo de origem** | **`ATHLETE` ×3** | dev-x-v2 | **admitida** | **`[345,575]`** |
| B1s: o mesmo, com parada por sintoma no relato do app | `ATHLETE` ×3 | dev-x-v2 | admitida | `[345,575]`; triagem **`REQUIRED(RUN_STOPPED_FOR_A_SYMPTOM)`** |
| B2 só a re-sincronização sem campos | atleta, `DEVICE`, **`ATHLETE`** | dev-x, dev-x-v2 (**app-x substituído pela correção do aparelho**) | `REPORT_NOT_CARRIED` (só porque dev-x continua) | `[345,420]` |
| B3 provedor nomeado sem id; B5 dois ids; B6 id numérico; B7 `quality: MANUAL` com id | … `DEVICE_UNIDENTIFIED` | os três | `REPORT_NOT_CARRIED` | `[345,420]` |
| B4 re-sincronização com outro id (`hk-2`) | dois `DEVICE:` diferentes | os três | `REPORT_NOT_CARRIED` | `[345,420]` |
| B8 `provider: MANUAL`, com id, sem `quality` | **`DEVICE:2ef791…`** | app-x, dev-x-v2 | `REPORT_NOT_CARRIED` | `[345,420]` |
| **C1 o relato do app leva `canonicalActivityId: hk-1`**; C2 `source:{provider:'APP',activityId:'hk-1'}` | **`DEVICE:2ef791…` ×3** | dev-x-v2 | **admitida** | **`[345,575]`** |
| C1s: o mesmo, com parada por sintoma | ×3 | dev-x-v2 | admitida | `[345,575]`; triagem `REQUIRED(RUN_STOPPED_FOR_A_SYMPTOM)` |
| C3 o app diz `provider: APP` sem id | `DEVICE_UNIDENTIFIED` | app-x, dev-x-v2 | `REPORT_NOT_CARRIED` | `[345,420]` |
| D1 o mesmo id de relato sob dois autores (a importação reusa `app-x`) | `app-x=ATHLETE`, `app-x=DEVICE` | app-x (sem autor mostrado), dev-x-v2; nada substituído | `REPORT_NOT_CARRIED` | `[345,420]` |
| D2 o atleta corrige nomeando o id do relato do aparelho | atleta, `DEVICE`, atleta | app-x-v2, dev-x | `REPORT_NOT_CARRIED` | `[345,420]` |

Leitura das formas:

- **O que um cliente consegue afirmar.** Qualquer uma das três formas, para qualquer relato. Nada as autentica, e o cabeçalho de `speakerOf` diz isso: "nothing here authenticates them".
- **Um relato do atleta substituído pela correção de um aparelho.**
  - Forma hostil, ou honesta e descuidada, em que o relato do atleta leva o id da atividade (C1, C2): sim. É o limite das "duas vozes" que o autor declarou e fixou em teste (I-2).
  - Forma em que a re-sincronização chega sem campos (B2): o relato do atleta sai de vigor por uma correção que na realidade é do aparelho. Aqui o resultado ainda retém, mas só porque o relato anterior do aparelho segue em vigor.
- **O contrário: um relato do aparelho substituído por uma correção do atleta.** Só quando o aparelho não diz nada de si (B1, lido como `ATHLETE`) ou quando a correção do atleta leva o id do aparelho (a mesma classe de C1).
- **Um aparelho sem identificação suficiente adquire identidade presumida?** Quando nomeia provedor, qualidade de relógio ou ids (B3, B5, B6, B7), não: fica `DEVICE_UNIDENTIFIED`, que não substitui nem é substituído, e o resultado é mais retenção. **Quando não diz nada, sim: vira `ATHLETE` (B1)**, e a re-sincronização devolve a corrida à evidência de ritmo com o EASY `[345,575]`. É o defeito do QRE-RWS-D-01 numa integração descuidada. Ver E-01.
- **Identidade do evento confundida com a do autor?** Não. A2 e D2 mostram que o id que a correção nomeia não decide quem é substituído.
- **O mesmo id sob dois autores** fica sem autor mostrado (D1): segue em vigor, e nenhuma correção dele substitui nada.
- **O sinal de sintoma** fica fora da regra em todas as formas: B1s e C1s pedem a triagem.

## 5. O que forjar dá

Sonda `probes/e-forge.mjs`, saída em `out/e-forge.txt`. Ponto de partida: a forma D-01 depois da re-sincronização honesta, que dá `REPORT_NOT_CARRIED`. Na revisão seguinte o cliente manda os registros alterados, com e sem parada por sintoma no relato do app.

| # | Alteração do cliente (sem chave) | O motor aceita | Palavra | EASY | Triagem (com parada) |
|---|---|---|---|---|---|
| F0 | nenhuma | KEEP | `REPORT_NOT_CARRIED` | `[345,420]` | `REQUIRED(SYMPTOM)` |
| F1 | apaga o fato do app | KEEP | **`REPORT_NOT_CARRIED`** (o motor ainda o nomeia) | `[345,420]` | `REQUIRED(SYMPTOM)` |
| F2 | apaga o fato **e** a linha fundida aposentada do registro do motor | MODIFY | admitida | `[345,420]` | **`NOT_RAISED`, 2 nativas** |
| F3 | forja uma correção: fato `ATHLETE` ressignado mais uma linha aposentada que nomeia o app | KEEP | **`REPORT_NOT_CARRIED`** (a correção forjada também fica em vigor e fora da linha) | `[345,420]` | `REQUIRED(SYMPTOM)` |
| F4 | ressigna o fato do app com `standing:false` | KEEP | `REPORT_NOT_CARRIED` | `[345,420]` | `REQUIRED(SYMPTOM)` |
| F5 | ressigna o fato do app com o speaker do aparelho | KEEP | **admitida** | **`[345,575]`** | `REQUIRED(SYMPTOM)` |
| F6 | F3 com `DEVICE_UNIDENTIFIED` | KEEP | `REPORT_NOT_CARRIED` | `[345,420]` | `REQUIRED(SYMPTOM)` |
| F7 | F3 com a linha forjada não aposentada | KEEP | `SEVERAL_RECORDINGS` | `[345,420]` | `REQUIRED(SYMPTOM)` |

- **Não há poder novo.**
  - Com uma ressignatura (F5), o cliente tira a corrida da retenção, mas não a parada. É a mesma classe de V3 e V4b, que já é o limite D-04.
  - Uma correção forjada completa (F3) não basta: a própria correção vira relato em vigor e fora da linha.
  - Apagar os dois registros (F2) tira até a parada. Esse é o poder maior, e já está declarado como da custódia (A-01, A-06).
  - Portanto forjar dá menos do que apagar.
  - O único caso que só o candidato abre é a ressignatura do speaker, e o efeito dela se limita à evidência de ritmo do próprio atleta.
- **Nada se apresenta como autenticação.**
  - O cabeçalho de `speakerOf` diz "nothing here authenticates them".
  - O de `appendFormats` diz que o reparo é "until the custody repairs it" (no futuro).
  - O cabeçalho do ponto de entrada diz que a integração "does not exist yet and nothing here stands for it".
  - O registro do autor, na seção 2, diz "Nada disso é autenticação. O selo continua sendo hash sem chave."

## 6. Integridade do fato

Sonda `probes/e-integrity.mjs`, saída em `out/e-integrity.txt`. Toda linha foi ressignada como faria um cliente com o selo sem chave.

- **Lidas:** a forma escrita; `DEVICE_UNIDENTIFIED`; `DEVICE:` com 32 hex minúsculos; a linha só de parada (`standing:false`, com parada e o resto nulo), que conta a parada e **não** fica em vigor; `wholeKm` 300; o relato que não diz nada (agora legítimo, em vigor e sem parada).
- **Ilegíveis, e falham fechado:**
  - speaker em minúsculas, com 31 hex, com HEX maiúsculo, com 32 hex mais um caractere, com o id cru (`DEVICE:hk-1`), em texto livre ou marcação, nulo ou ausente;
  - `standing` em texto ou ausente;
  - `standing:false` sem parada, com distância ou com `wholeKm`;
  - `wholeKm` 300,01, 0, −1, em texto ou ausente;
  - `reportId` com 129 caracteres ou vazio.
- **Fato da forma anterior** (sem speaker, `standing` e `wholeKm`): ilegível, e falha fechado. Está no teste do autor, que passa.
- **Não há texto livre novo.** O speaker é uma forma fechada, conferida por regex.
- **Resíduo, para a nota D-03:** `reportId` segue como texto livre de até 128 caracteres.
- **Limite:** um cliente que ressigna pode baixar `wholeKm` e, com isso, a referência de histórico (L4 só baixa). Não há efeito sobre segurança, triagem nem crédito.

## 7. Custo

Sonda `probes/e-cost.mjs`, saída em `out/e-cost.txt`. Mede `readReportFacts` mais `inForce` mais `admitted`, sem o motor.

| Forma | Linhas (fatos / motor) | Tamanho | Leitura |
|---|---|---|---|
| `wide`: 10 000 sessões honestas | 30 000 / 20 000 | 19 MB | 0,48 s |
| `wide`: 50 000 sessões | 150 000 / 100 000 | 96 MB | 2,29 s |
| `inbound`: sessões logo abaixo do teto (64 fatos, 64 linhas que nomeiam 127 ids cada, 64 correções em ciclo), 400 sessões | 25 600 / 25 600 | 50 MB | 0,37 s |
| `outbound`: uma sessão com 2 000 linhas × 1 000 ids | 100 / 2 000 | 14 MB | 0,18 s |
| `outbound`: 20 000 linhas × 200 ids | 100 / 20 000 | 31 MB | 0,29 s |

- A leitura é de uma passada.
- A caminhada da linhagem não repete linha: o ciclo em `supersededBy` termina.
- O teto de 64 (`LINEAGE_MAX`) contém uma sessão hostil. Acima dele nada é lido como substituído, e a linha é retida.
- O pior caso dentro do teto custa cerca de 1 ms por sessão.
- O custo do motor congelado com muitas linhas por sessão segue a nota D-05, sem mudança.

## 8. Dado novo guardado

- **Todo relato de corrida agora deixa fato**, inclusive o que não diz nada de distância nem de parada. Isso é dado de saúde e de atividade a mais por atleta.
- **O fato guarda `speaker`.** É `DEVICE:` mais os primeiros 128 bits de um SHA-256 **sem chave** do id da atividade.
  - Não é anonimização. É um identificador pseudônimo, estável e ligável a toda cópia do registro e a quem conheça o id.
  - Com id de baixa entropia (um inteiro de provedor, por exemplo), é reversível por enumeração.
  - "Nunca o id cru" é verdade, mas não reduz a classificação do dado.
- **O fato também guarda `standing` e `wholeKm`**, uma distância.
- **Apagamento e redação no lugar continuam tornando a linha ilegível** e trancam o registro (D-02). Agora uma linha de formato danificada também tranca.
- **Nada no diff trata inventário, apagamento ou retenção.** O registro do autor (I-10) e o contrato (seção 6, passo 3) dão isso como da custódia. Ver E-04.

## 9. Dependências de integração

Confirmei por leitura do diff, dos cabeçalhos, do registro do autor (seção 6), do contrato (seções 6 e 8) e por grep no diff (`authentic|custody|atomic|keyed|signature|HealthKit|erasure|retention|repair`). **Nenhuma destas é apresentada como implementada**, em código, teste ou registro:

- cadeia de custódia com chave;
- persistência atômica;
- identidade confiável das atividades do HealthKit (I-1);
- contrato de reenvio e correção entre fontes (I-5);
- reparo auditado de linha ilegível (I-9; a seção 6 do contrato só descreve);
- apagamento e retenção de dado de saúde (I-10);
- privacidade e base legal (I-11, G07).

Os testes do autor usam HealthKit só como valor sintético de `provider`.

## 10. Hard gate de integração (achado E-1)

Ele está registrado como **não atendido** em três lugares:

- no cabeçalho do ponto de entrada: "HARD GATE OF A REAL INTEGRATION, not met by anything here";
- na seção 4 do registro do autor: "E-1 não está resolvido";
- no teste `HARD GATE OF A REAL INTEGRATION, NOT MET HERE`, que passa afirmando o defeito como ele está: `['dev-x-v2','UNKNOWN','UNKNOWN',0]`, com `adverseSessions` 1 → 0.

A extensão só retém a evidência de ritmo e não devolve nada ao motor. Não é apresentado como fechado.

## Achados

| Id | Severidade | O quê | Sonda e saída | O que fecha |
|---|---|---|---|---|
| SEC-RWS-E-01 | **CONDITION_FOR_INTEGRATION** (dono: engenharia de integração e custódia; Security revisa; SSCTR informado) | **Quem falou sai de campos que o cliente afirma, e duas formas honestas mas descuidadas trazem de volta o defeito D-01.** (a) Uma importação de aparelho sem nenhum campo de origem é lida como `ATHLETE`. Com isso a re-sincronização substitui o relato do atleta e a corrida volta a ritmo. (b) Um relato do atleta que leva o id da atividade é lido como o aparelho, com o mesmo efeito. (c) Uma re-sincronização sem campos tira o relato do atleta de vigor; o resultado só retém porque o relato anterior do aparelho segue em vigor. Em nenhuma forma o sinal de sintoma se perde. O Core não tem como distinguir esses casos, e o autor declarou os requisitos I-1, I-2 e I-8. O que falta deixar dito é que **a ausência de campos é lida como o atleta**, o lado que permite substituir. Não bloqueia o sintético. | `e-speaker.mjs` B1: `ATHLETE`×3, admitida, EASY **`[345,575]`**. B1s: o mesmo, com triagem `REQUIRED`. C1 e C2: `DEVICE`×3, admitida, `[345,575]`. B2: app-x substituído por dev-x-v2. | Antes de atleta real: (1) a custódia ou o adaptador grava `source` pelo canal de entrada (importação do HealthKit ou edição no app), nunca pelo que o corpo do relato diz; (2) toda importação chega com o id da atividade (I-1); (3) uma edição do atleta nunca leva id de atividade (I-2); (4) um teste de resultado da integração mostra B1, B2 e C1 retidos ou recusados. |
| SEC-RWS-E-02 | NOTE | **O registro e o código divergem num caso.** O registro do autor diz que um "id num relato que diz fonte manual" é `DEVICE_UNIDENTIFIED`. No código isso só vale para `source.quality: 'MANUAL'`: com `provider: 'MANUAL'`, id e sem `quality`, sai `DEVICE:` (o provedor é ignorado quando há id). Está dentro da I-2 e não muda nenhum veredito. | `e-speaker.mjs` B8: `DEVICE:2ef791…`. B7 (`quality: MANUAL`): `DEVICE_UNIDENTIFIED`. | O registro diz "qualidade manual", ou a integração trata como edição do atleta todo relato com `provider` manual (I-2). |
| SEC-RWS-E-03 | NOTE | **O que forjar dá, medido.** Não há poder novo. Uma ressignatura do speaker tira a corrida da retenção, mas não a parada. Uma correção forjada não basta. Apagar só o fato não tira o relato de vigor. Apagar os dois registros tira até a parada, e esse é o limite já declarado (D-04). | `e-forge.mjs`: F1 e F3 `REPORT_NOT_CARRIED`; F5 admitida `[345,575]` com triagem `REQUIRED`; F2 `NOT_RAISED`. | Custódia com chave e gravação atômica dos registros (A-01, A-06). |
| SEC-RWS-E-04 | **CONDITION_FOR_INTEGRATION** (dono: custódia e privacidade; Security revisa; amplia a SEC-RWS-C-04) | **O fato guarda um pseudônimo estável e sem chave do id da atividade**, e agora todo relato de corrida deixa fato com `wholeKm`. Não é anonimização: o pseudônimo é ligável e, para id de baixa entropia, reversível. | Leitura de `speakerOf` (`hash(id).slice(0,32)`, `value.mjs` SHA-256 sem chave). `e-selfread`: 4370 fatos em 1259 revisões. | No inventário de dados de saúde, `speaker` entra como dado pessoal derivado de identificador de aparelho; o apagamento e a retenção da C-04 cobrem o fato inteiro pelo caminho de reparo da D-02; antes de dado real, a custódia decide se o derivado passa a ser chaveado (por exemplo, HMAC com chave da custódia). |

## Condições anteriores que o diff toca

| Id | Estado | Evidência executada |
|---|---|---|
| SEC-RWS-D-01 | **CLOSED** no Core | Seções 1 e 2: V10 e V10b em `a4a434f` e no candidato; reinício (`e-restart`); teste `SEC-RWS-D-01 closed` passa. |
| SEC-RWS-C-06 | **CLOSED** no Core (era PARTIAL; o resto aberto era a D-01) | `s1`: toda variante alterada dá `REQUIRED(RUN_REPORT_UNREADABLE)`, e a triagem respondida depois não limpa. Os limites V1, V3 e V4b ficam na D-04. |
| SEC-RWS-D-02 | **OPEN** (integração), escopo **ampliado** | O estado continua permanente: W1 e o teste do autor. Agora uma linha de formato danificada também o provoca, e um fato da forma anterior também (migração). Não achei caminho em que o próprio Core o provoque (seção 3). A seção 6 do contrato descreve o reparo (troca por uma parada sem motivo sob o instante do reparo, auditada), mas não o implementa. O app segue precisando tratar `RUN_REPORT_UNREADABLE` como dado em reparo, e não como triagem a repetir. |
| SEC-RWS-C-04 | **OPEN** (integração), escopo **ampliado** | Seção 8 e E-04. |
| SEC-RWS-C-05 | **CLOSED**, mantida com os campos novos | Seção 6, `e-integrity`. |
| SEC-RWS-C-02 | **CLOSED**, mantida | Seção 7, `e-cost`: linear, e o teto contém a sessão hostil. |
| SEC-RWS-D-03 | NOTE, sem mudança de natureza | `unreadableReports` agora também lista `eventId` de linhas de formato, e `paceEvidenceWithheld` também lista linhas sem distância. Só sai o que veio no próprio pedido. |
| SEC-RWS-D-04 | NOTE (limite declarado) | V1, V3 e V4b reproduzidos no candidato. Mais o F5 (ressignatura do speaker), da mesma classe. |
| SEC-RWS-D-05 | NOTE (motor congelado) | Não está no diff. Não medi de novo. |
| SEC-RWS-A-01, A-06, C-03 | **OPEN** (integração), sem mudança | `custody.mjs` não está no diff, e os cabeçalhos seguem dizendo que a integração não existe. Não rodei de novo as sondas de custódia da R2. |
| SEC-RWS-A-02, A-03, A-05, C-07 | **Mantidas** | Os testes que as fixam passam (108 de 108). `readingOf.answeredAfter` e `screenOf` não mudaram de regra. |

## O que executei e onde estão as sondas

Meu diretório de rascunho, novo e de nome único, é `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/1b05889e-fc1c-402a-93ef-5134acd2c65e/scratchpad/judges/security/sec-r4-20261115101710/`. Conteúdo:

- `ref-a4a434f/`: o `git archive` de `src`, `test` e `v1`, usado para conferir a cópia do autor.
- `ref-src.sha` e `ref-tv.sha`.
- `sec-s1-signal.copy.mjs` e `summ-s1.mjs`.
- `probes/`: `e-speaker.mjs`, `e-forge.mjs`, `e-selfread.mjs`, `e-cost.mjs`, `e-integrity.mjs`, `e-restart.mjs`.
- `out/`: todas as saídas, incluindo `tests-v1rws.txt`.

Execuções:

- **Em `a4a434f`** (a cópia do autor, conferida): `sec-s1-signal.mjs` e `e-restart.mjs`.
- **No candidato** (o worktree, sem escrever nele):
  - `sec-s1-signal.mjs`, `e-speaker.mjs`, `e-forge.mjs`, `e-integrity.mjs`, `e-cost.mjs` (sete formas) e `e-restart.mjs`;
  - `e-selfread.mjs` com quatro sementes;
  - `node --test test/v1rws-*.test.mjs`: **108 de 108**, uma execução, 39 s, sem falha por limite de tempo.
- **Leitura:**
  - o diff inteiro de `src/`;
  - `readableFormat`, `readFormatRecord`, `appendFormats`, `readableReport`, `appendReportFacts`, `readReportFacts`, `reportsReading`, `speakerOf`, `distanceFacts` e `historyReference`;
  - `readingOf`, `screenOf`, `heldAnswer`, `admitted`, `evaluateProgram` e `restartProgram` (cabeçalho);
  - `value.mjs` (`canonical`, `hash`) e `utcTimestamp`;
  - os testes da linhagem: D-01, registro honesto, custo, hard gate e duas vozes;
  - o contrato, nas seções 3, 6 e 8;
  - o registro do autor, inteiro.

Não rodei `npm run verify`, nenhum `verify-r*`, nem `v1rc-journeys` ou `v1rc-fuzz`. Não escrevi nada no worktree além deste arquivo. Não usei nenhum comando git de escrita. Não apaguei nem sobrescrevi nada.

## O que não verifiquei

- **O reinício na minha sonda aleatória.** A chamada de `restartProgram` em `e-selfread` usou a assinatura errada e caiu em `DISABLED`; não conta como evidência. O reinício está coberto só por `e-restart.mjs` e pelos testes do autor.
- **A suíte inteira, a mutação do autor, a diferencial (647 revisões) e `--preserved`.** São do QRE.
- **Os valores esportivos, L3, L4, a matriz de aceitação e as leituras 1 a 8 do autor.** Fora deste parecer de segurança, são do SSCTR e do QRE.
- **O caminho `formatsNotKept` na resposta.** Não foi alcançado por nenhuma entrada minha.
- **Planos de meia maratona.** A entrada que escrevi para meia maratona não gerou plano.
- **As sondas de custódia da R2** (`custody-merge`, `custody-stop`), que não rodei de novo porque `custody.mjs` não está no diff.
- **A custódia real**: autenticação, chaves, gravação atômica, retenção, apagamento e G07.
- **O adaptador iOS e o HealthKit real**, inclusive se a re-sincronização mantém o id da atividade.
- **A fase B.**
