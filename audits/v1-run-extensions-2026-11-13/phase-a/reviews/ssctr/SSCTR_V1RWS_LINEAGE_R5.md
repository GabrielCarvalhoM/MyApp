# SSCTR — revisão r5 do fix-forward da linhagem de evidências (V1RWS, fase A) — 2026-11-15

**Veredito: ACCEPT_WITH_CONDITIONS.** O escopo é o candidato sintético `4b1622f`, sem atleta real e sem integração.

- **Achados bloqueantes:** nenhum.
- **L1 a L4:** implementados como decididos em `SSCTR_RWS_LINEAGE_ITEMS.md` r2. Cada condição foi conferida com execução minha (seção 3).
- **L5 (E-1):** segue como hard gate de integração **não atendido**. O registro e o teste o fixam assim, e nada o declara resolvido (seção 6).
- **Achados novos:** uma condição (E-01, o limite das duas vozes, que se junta ao hard gate) e quatro notas (E-02 a E-05).
- **Registro habilitador:** não foi emitido. Eu o emitiria para `4b1622f` se Quality e Security liberarem, com as condições da seção 7.

## 1. Revisor, autoridade e independência

- **Instância:** SSCTR nova (claude-opus-5-5), agente SSCTR-1.0.0, constituição SSCTR-CONST-1.0.0.
  - Autoridade: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, só para decisões esportivas internas, delimitadas e não clínicas. Não tenho credencial humana.
  - Não houve revisão humana, validação empírica nem juízo clínico. Não deleguei nada.
- **O que não escrevi:** o candidato, o contrato, o registro do autor, as sondas do diagnóstico e as do autor.
- **Independência:** não sou independente das decisões anteriores do mesmo papel. Os itens L1 a L5 (r1 e r2), a r4 e as r2, r3 e r3a são deste papel, escritos por outras instâncias. Aqui julgo se o candidato cumpre essas decisões. Não as reabro.
- **Runtime:** worktree `v1-run-extensions`, HEAD `4b1622f55e3d66e6e381bf33cc659fbed1f1713a`, árvore limpa no início. Antes de escrever estes dois arquivos, `git status --porcelain` estava vazio.
- **Literatura:** nenhuma afirmação científica nova. WebSearch e WebFetch existem como ferramentas adiadas e não foram carregados. Nada aqui pede evidência nova. São regras de admissão de evidência sobre valores já amarrados: 0,91, CT-3, a regra de histórico da r3a e as exclusões da V1RC congelada.

## 2. Reprodução em `a4a434f` e no candidato

**A cópia do autor.** Conferi `…/scratchpad/before-a4a434f/CoachingCore` contra `git show a4a434f`:
- os 63 arquivos de `src/` e `v1/` são iguais em sha256;
- só a pasta `test/` difere, porque a cópia é mínima.

Não escrevi nela.

**As sondas**, sem mudança, sobre as duas árvores. O candidato rodou direto do worktree. Saídas em `…/scratchpad/judges/ssctr/r5-1794748575/out/`.

| Sonda | `a4a434f` | `4b1622f` | Comparação |
|---|---|---|---|
| `judges/q4-corr.mjs` | depois da re-sincronização com esforço, a linha `dev-x-v2` vai sozinha, nada é retido, EASY **`[345,575]`** | `REPORT_NOT_CARRIED`, EASY `[345,420]`; LONG idem | antes = `probes/out` byte a byte; candidato = `fix-forward/probes/out` byte a byte |
| `judges/q4-corr-disputed.mjs` | disputa e sem duração: `[345,420]` retido; depois da correção, **`[345,575]`** | depois da correção: `[345,420]`, `REPORT_NOT_CARRIED` | idem |
| `judges/q4-corr-race.mjs` | entrada: `plan-race:dev-race-v2`, 6 km em 3000 s | entrada: `[]` (o congelado sobre o registro nu ainda dá 6 km) | idem |
| `d-other-statements.mjs` | HEAT e pausas, depois da re-sincronização: **`[345,575]`**, nada retido | `[345,420]`, `REPORT_NOT_CARRIED`; o controle também é retido (o custo) | idem |
| `judges/ssctr-m2-empty-merge.mjs` (URL `file:///`) | sobreposição: `extentKm` 22, CT-3 24,2 | `extentKm` 16, CT-3 18,084, próximo longão 16 km e 100 min, status DISTANCE/MEASURED como antes | candidato = `fix-forward/probes/out/ssctr-m2.json` byte a byte |

**As falhas anteriores ficam reproduzidas em `a4a434f` e fechadas no candidato pelo ponto de entrada.**

Rodei também, nas duas árvores:
- `d-matrix` EASY e LONG: `compare-matrix` do candidato dá 0 diferenças contra o oráculo;
- `d-engine-frozen` (igual byte a byte nas duas), `d-recompose`, `d-late-race` e `judges/sec-s1-signal`;
- a diferencial do autor, cuja saída é igual byte a byte à guardada: 102 clientes, 647 revisões, 110 `NEWLY_WITHHELD`, 34 `HISTORY_LOWER`, 241 `FOLLOWS`, **0 `UNEXPECTED`**.

**Testes da extensão no candidato:** `node --test test/v1rws-*.test.mjs` dá 108 de 108.

## 3. L1 a L4, condição por condição

Sondas minhas, todas só de leitura, em `…/r5-1794748575/`:
- `cmp-before-cand.mjs`: a matriz cenário a cenário;
- `r5-entry.mjs` com `cmp-entry.mjs` e `cmp-dose.mjs`: 18 cenários por família, só pelo ponto de entrada, com a execução, a triagem, as nativas, os longões à frente e a dose de cada sessão;
- `r5-dose.mjs` e `r5-engine-follow.mjs`;
- `r5-inforce.mjs`: os relatos em vigor pelo runtime;
- `r5-wholekm.mjs`;
- `r5-two-voices.mjs`.

| Condição | Atendida? | Evidência executada |
|---|---|---|
| **L1-a** só retém | **sim** | Matriz EASY e LONG em `a4a434f` e no candidato (`cmp-matrix-*.txt`): **0 violações**. Nada antes retido é entregue, nenhuma palavra muda onde já havia retenção, a linha viva é a mesma e a referência nunca sobe. `r5-entry` (36 casos): 0 violações. Nenhuma `paceEvidence` passa a verdadeira. Diferencial: 0 `UNEXPECTED`. |
| **L1-b** a retração deixa fato e substitui os relatos anteriores do próprio autor | **sim** | `r5-inforce`, cenário 16: em vigor `[app-x, dev-x-v2]`, com `dev-x` substituído por `dev-x-v2`. Cenário 17: em vigor `[app-x-v2, dev-x]`, com `app-x` substituído. Os dois saem `REPORT_NOT_CARRIED`, com histórico `null` e nada entregue. |
| **L1-c** o autor é gravado na recepção, de campos de origem | **sim** | Os fatos têm `speaker` dentro do selo (`ATHLETE`, `DEVICE:<32 hex>` ou `DEVICE_UNIDENTIFIED`). `r5-wholekm` mostra a tabela. `fromDevice` verdadeiro nunca dá `ATHLETE`. Um autor alterado depois quebra o selo (testes). |
| **L1-d** confiança no autor e guarda do fato novo | não se aplica a mim | É da Security. O registro a declara (seção 6, I-10). |
| **L1-e** três ordens em leve, longão, prova, e calor ou pausas | **sim** | Leve e longão: `d-matrix` e `r5-entry` (03 em três ordens; 08, 09 e 10). Calor e pausas: o teste do autor em três ordens está entre os 108; `d-other-statements` e o cliente `L-heat` da diferencial cobrem o longão. Prova: o teste por jornada inteira em três ordens está entre os 108, mais `q4-corr-race`. |
| **L1-f** a fração retida para sempre | condição de integração, registrada | Registro, seção 6. Na diferencial sintética são 110 respostas com retenção nova em 40 clientes. Isso não mede a fração com atleta real. |
| **L2** relato recusado fica em vigor, em linha nenhuma | **sim** | `r5-inforce`, cenário 18: `zz-app` em vigor e fora da linha. Cenário 19: `dev-x` em vigor e fora da linha. Os dois `REPORT_NOT_CARRIED`, com triagem igual à de antes. |
| **L3-a** não toca o `measuredKm` da conclusão | **sim** | `m2`: status e base iguais. Diferencial: a leitura das execuções (status, base, conclusão, `measuredKm`, minutos) é idêntica em 647 revisões, também na sobreposição, onde o histórico baixa de 15,4 para 11 e de 22,4 para 16. |
| **L3-b** nunca cria histórico | **sim** | Código: `historyReference` devolve `null` quando a linha não dá referência. Diferencial: nenhum `null → valor`. Matriz: 16 e 17 dão `null → null`. |
| **L3-c** não fecha a D-01 | **sim** | O registro deixa a D-01 e a B-03 abertas (I-3), na forma de 26 km e no lado do crédito. |
| **L3-d** grade `m2` | **sim** | Nas três ordens: sobreposição com `[]` e sem a chave, `extentKm` 22 → 16, CT-3 24,2 → 18,084, próximo longão 16 km e 100 min. `r3aEmptyList` fica em 16 e 18,084, e `watchWholeAlone` fica igual. |
| **L4-a** só valores utilizáveis | **sim** | `r5-wholekm`: medida POOR, sem duração ou implausível dá `wholeKm null`. |
| **L4-b** sem histórico da linha, nada | **sim** | Código, mais 16 e 17 `null` e a diferencial. |
| **L4-c** nunca uma gravação listada sozinha | **sim** | `r5-wholekm`: o app que só lista 4,4 km dá `wholeKm null`. Aparelho com 6 km e lista própria de 4 dá 10, o total medido. |
| **L4-d** só a referência | **sim**, com uma nota (E-03) | Status, base, conclusão, `measuredKm` e crédito iguais em `r5-entry` e na diferencial. A nota trata de `extentFraction`. |
| **L4-e** 03, 08, 09, 10, 18 e 19 em leve e longão | **sim** | `r5-entry`: leve 6,6 e longão 9,6 em 03, 09, 10 e 18. Em 08 e 19 o longão vai de 16 para 9,6 (o efeito decidido). O próximo longão sai por tempo, na mesma dose: `r5-dose`, 100 min antes e depois. Em leve, os longões à frente são os do controle. O teste L4-e do autor está entre os 108. |

**Os relatos em vigor pelo runtime** (`r5-inforce`) batem com a regra:
- 13 e 14, um autor: o relato anterior é substituído pela correção dele, e a linha é entregue;
- 21: a re-sincronização recusada no leve (`INVALID_CORRECTION_CHAIN`) não substitui nada;
- 22: a correção do próprio atleta substitui o relato com a parada, e a parada continua lida (nota E-05).

## 4. Os testes que mudaram de resultado esperado

- **Os dois casos `whole`** (`v1rws-fix-forward.test.mjs` e `v1rws-final-fix.test.mjs`) mudaram **nos termos que aceitei** na seção 3 de r2:
  - `withheld` passa a `[[id, REPORT_NOT_CARRIED]]`, `paceEvidence` a falso e `paceWithheld` à palavra nova;
  - `merged` (`SEVERAL_RECORDINGS`), `row.eventId` (`corr-easy`), status, base, conclusão, `measuredKm` 11 e as bordas ficam como antes;
  - as asserções de hash igual caem;
  - entram 08, 09 e 10 com a mesma `paceEvidence`, as mesmas bordas e `extentKm` 6,6. A palavra é a nova em 08 e `DISTANCE_DISPUTED` em 09 e 10.
- **O caso `late` do final-fix não mudou:** segue `SEVERAL_RECORDINGS` pela precedência. Em r2 eu disse que as duas palavras valiam.
- **As outras mudanças da seção 5 do autor** são consequência direta do contrato (todo relato deixa fato; forma nova do fato) ou de L1 e L2:
  - o fato `r3` fora da linha retém;
  - os relatos recusados nos caminhos "dois relatos que se contradizem" e "correção fora da janela" retêm a linha da própria sessão.

  Do lado esportivo, todas só retêm ou só mudam a forma do registro. Nenhuma muda status, crédito, triagem ou nativas dos caminhos: as asserções de `native` 0 e da triagem seguem nos mesmos testes.
- **Uma mudança só toca segurança:** um fato reselado sem parada e sem distância passou de ilegível a legível. Só um cliente que recalcula o selo chega a isso. Esse poder já existia: um fato reselado com outro motivo dá `NOT_RAISED` com 8 nativas em `a4a434f` e no candidato (`sec-s1-signal`, V3). Não é poder novo. É da Security (C-01, custódia).

## 5. Segurança e dose

- **A parada por sintoma fica fora da regra.** Em `r5-entry`, cenários 21, 22 e 23 nas duas famílias, a triagem é `REQUIRED` com 0 nativas, igual em `a4a434f`. `r5-inforce` mostra a parada em `stops` mesmo com o relato substituído (22) ou fora da linha (21). Na forma de um relato só, a parada do aparelho re-sincronizado sem ela segue `REQUIRED` com 0 nativas (`r5-two-voices`).
- **Nenhuma nativa sob triagem pedida.** Vale nos 36 casos de `r5-entry`. Em `sec-s1-signal`, toda forma de linha ilegível dá `REQUIRED` com 0 nativas, inclusive V10, o fato reetiquetado como formato: o SEC-RWS-D-01 está fechado. Os caminhos de hold e de rota clínica seguem nos testes que rodei (PATHS do final-fix): 0 nativas.
- **Dose.** `cmp-dose`: 912 sessões de 36 cenários, nas respostas da correção e da semana seguinte. **A dose é idêntica** em minutos canônicos, família, `prescribed` e hold ou rota clínica. Só a expressão muda (08 e 19 no longão: NATIVE 16 km → TIME, 100 min).
- **O que o motor faz depois.** Onde a diferencial acusa "the engine's answer differs" (LONG 08 e 19, revisões 5 e 6), `r5-engine-follow` mostra que a única diferença é o relato seguinte do atleta, enviado como a sessão foi prescrita (por tempo: 100 min em vez de 95). Plano, decisão e crédito não mudam. Intensidade, progressão e conclusão por distância também não.
- Os arquivos congelados (`r6-provenance`, `r6-adaptation`, `v1-run-calibration`, `v1-run-index`, `v1-index`, `v1/`) não têm diff entre `a4a434f` e `4b1622f`. `RUN_FORMATS_V1.json` tem o mesmo sha256 da r4.

## 6. As leituras do autor, o limite e o hard gate

**Leituras da seção 3 do registro dele:**

| # | Leitura | Posição | Por quê |
|---|---|---|---|
| 1 | a retenção vale para a linha inteira, também sem distância | **ACEITA** | O ritmo de trabalho de uma sessão forte, de uma linha que não carrega todos os relatos, não é observação comparável pela mesma razão que a distância. A regra não enumera. É só retenção: a dose e a conclusão não mudam. |
| 2 | relato não gravado não é relato em vigor; deixa só a parada | **ACEITA** | O motor não o guardou, e a revisão é pedida de novo. O relato reenviado é o que fica em vigor. A parada é mantida, que é o que a segurança exige. |
| 3 | relato que o motor nomeia sem fato fica em vigor | **ACEITA** | "O que não se mostra fica em vigor." O custo é só retenção. |
| 4 | provedor nomeado sem id não é o atleta | **ACEITA COM CONDIÇÃO** (I-8, nota E-04) | É conservadora: retém mais. Mas um app que rotule o relato do atleta com provedor faria toda autocorreção do atleta ficar retida para sempre. Entra na fração de L1-f. |
| 4b | longão por tempo depois de L4 | **ACEITA** | Executado: 9,6 em vez de 16 leva o próximo longão a TIME, na mesma dose (100 min). É subprogressão limitada de expressão, nunca dose a mais. É a mesma leitura que 09 e 10 já davam. |
| 5 a 8 | teto de 64, precedência, id longo, `formatsNotKept` | **ACEITAS** | Não são valores esportivos. Todas retêm. |

**O limite declarado (um relato só com duas vozes).** Reproduzi em `r5-two-voices` (nota E-01):
- um relato do aparelho que leva HEAT, pausas para caminhar ou ADVERSE, re-sincronizado sem isso, volta a dar `[345,575]` e `adverseSessions` 0;
- é **idêntico em `a4a434f`**: não é regressão, e o Core não tem como distinguir as duas vozes;
- a parada por sintoma, nessa forma, segue `REQUIRED`.

Do lado esportivo **não bloqueia o candidato sintético**. É condição de integração junto com L5: a mesma classe de perda, só que dentro de um relato só.

**O hard gate (E-1, L5).** Confirmei:
- `d-engine-frozen` é igual byte a byte nas duas árvores (ADVERSE → UNKNOWN, `adverseSessions` 1 → 0);
- o registro (seção 4) diz "E-1 não está resolvido", com o mínimo de L5 (ADVERSE, SYMPTOM, FATIGUE, HEAT; a leitura do que o atleta declarou por último; a triagem; as declarações em vigor);
- o cabeçalho do ponto de entrada diz "HARD GATE OF A REAL INTEGRATION, not met by anything here";
- o teste `HARD GATE OF A REAL INTEGRATION, NOT MET HERE` afirma o defeito como está.

Nada declara L5 resolvido porque a extensão agora retém a evidência de ritmo. **Isso não atende L5:** a extensão não devolve ao motor as respostas do atleta.

## 7. Registro habilitador de `V1X-RUN-NATIVE`

**Não emitido nesta passagem.** Eu o emitiria **para `4b1622f`, e só para ele**, se Quality e Security liberarem este candidato. Valeriam estas condições.

**Da r4, que seguem valendo:**
- antes de a fase B ler `paceEvidence`: SSCTR-RWS-A-04;
- antes de integração ou de atleta real: C-01 (o fato retirado), C-02 (o resíduo), C-03, C-04, B-03 com a D-01, D-02 e QRE-RWS-A-07;
- C-08: o composto não entra em custódia nem em integração enquanto faltar o que a r4 listou;
- Security: A-01, A-04, A-06 a A-08 e as condições focais que o juiz de Security mantiver.

**Desta rodada:**
- **Hard gate L5, antes de qualquer integração ou atleta real**, pelo mínimo de L5. Ele vale também na forma de um relato só (E-01): o teste de resultado inclui a re-sincronização de um relato do aparelho que levava o que o atleta acrescentou. A integração mostra que o acréscimo nunca é perdido (I-2, I-4), ou que ele viaja como relato próprio do atleta. Se o mínimo pedir mudança no motor, a decisão é do Founder.
- L1-d (Security) e L1-f (a fração retida, com o caminho de volta se for material). Também I-1, I-5, I-6 e I-8 (nota E-04).
- L3-c: a D-01 segue aberta, na forma de 26 km e no lado do crédito.
- Antes da fase B (junto da A-04): `extentFraction` é descrição, nunca crédito nem conclusão (nota E-03).

Se Quality ou Security pedirem mudança no runtime, o registro só vale para o commit que eu ou outra instância do papel julgar de novo.

## 8. Achados

| id | severidade | o quê | sonda e saída | fecha com |
|---|---|---|---|---|
| SSCTR-RWS-E-01 | **CONDITION** (integração; junto do hard gate L5) | Um relato só, com id de atividade, que leva a medida do aparelho e o que o atleta acrescentou (HEAT, pausas, ADVERSE), re-sincronizado sem o acréscimo: a corrida volta a ser evidência de ritmo e o motor perde a resposta. Igual em `a4a434f`. A parada por sintoma segue `REQUIRED` com 0 nativas. | `r5-two-voices.mjs` → `out/cand-two-voices2.json`: HEAT, pausas e ADVERSE dão `[345,575]`, `withheld []`, `adverse 0`; SYMPTOM dá `REQUIRED`, 0 nativas; `before-two-voices2.json` é igual | o teste de resultado de L5 também nessa forma; I-2 e I-4 |
| SSCTR-RWS-E-02 | NOTE | O custo de L1 e L4 na expressão. Em 08 e 19 no longão, dois longões à frente na própria resposta e o da semana seguinte saem por tempo (100 min), em vez de 16 km nativos. A dose é idêntica nas 912 sessões; o motor só difere no relato seguinte do atleta. | `r5-dose.mjs`, `cmp-dose.mjs` (0 diferenças de dose), `r5-engine-follow.mjs` | nada no Core; entra na fração de L1-f |
| SSCTR-RWS-E-03 | NOTE | `extentFraction` (descritivo, nos passos contínuos de uma execução PARTIAL) é calculado da referência de histórico, que L4 pode rebaixar. Nenhum consumidor em `src/`. | leitura de `executionOf` e grep em `src/` | antes da fase B: não ler `extentFraction` como crédito nem conclusão (L4-d) |
| SSCTR-RWS-E-04 | NOTE | Provedor nomeado sem id dá `DEVICE_UNIDENTIFIED` (leitura 4). É conservador, mas um app que rotule o relato do atleta com provedor deixaria toda autocorreção do atleta retida para sempre. | `r5-wholekm.mjs`: `provider APP, no id` dá `DEVICE_UNIDENT` | I-8, e a fração de L1-f |
| SSCTR-RWS-E-05 | NOTE | Cenário 22: o atleta relata uma parada por sintoma e depois corrige o próprio relato para "feita inteira". O relato com a parada sai de vigor (mesmo autor) e a corrida volta à evidência de ritmo. A parada segue lida, com triagem `REQUIRED` e 0 nativas. Igual em `a4a434f`; é o que a regra decidida dá. Não há juízo clínico aqui. | `r5-inforce.mjs` e `r5-entry.mjs`, cenário 22 nas duas famílias | nada no Core; o conteúdo clínico segue CLINICAL_HUMAN_REQUIRED |

## 9. O que não verifiquei

- A suíte inteira, a mutação do autor, `v1rws-freeze --preserved` e `--write`, `npm run verify`, `verify-r*`, `validate_records.py`, `v1rc-journeys` e `v1rc-fuzz`. Nenhum foi rodado.
- A prova de meia e de maratona por jornada inteira. A de 10 km rodou só pelos testes do autor.
- A forma C-05 da D-01 (26 km) e o lado do crédito da contagem dupla.
- A fração real retida (L1-f), o importador do HealthKit (id em re-sincronização, `correctionOf`) e se o app rotula provedor.
- Custódia, confiança no autor e guarda do fato novo (Security).
- O motor quando um plano novo reutiliza ids de sessão (o autor viu e não investigou).
- O espaço de entradas fora das grades e clientes listados.
- As três ordens de calor e pausas nas minhas sondas: rodei uma ordem, mais os testes do autor.

**Fila humana, itens propostos e não anexados:**
- os da r2, r3 e r4;
- HQ-V1RWS-A-SSCTR-LINEAGE-L1L2 e HQ-V1RWS-A-SSCTR-LINEAGE-L3L4;
- HQ-V1RWS-A-SSCTR-R5-TWO-VOICES, sobre o relato com duas vozes (E-01).

**Expiração.** Revejo esta decisão quando surgir qualquer um destes:
- mudança de runtime pedida por Quality ou Security;
- o contrato de dados (B-03);
- dados do importador ou da fração retida;
- decisão do Founder sobre o motor.

## 10. Contexto injetado pelo host

O host pôs no meu contexto:
- o CLAUDE.md global (`c75718d0d2fe2cce1332cf7240ef0b8013ca2901d52b4d6778480c1c333709c6`);
- o CLAUDE.md do projeto em `MyApp/` (`e657d059e06fd1a21613250753a8c79ac605b69d955191d634966b3c8fc922e6`);
- o MEMORY.md (`407dd7b73228e9b19d25a64bcf8349d6ab3057ef381b25883c137bc814004e09`).

Eles resumem rodadas anteriores e nomes de achados. Li-os só como contexto. Nada deles serviu de evidência.

Arquivos julgados (sha256):
- `src/v1-run-format-index.mjs` `fd38ebb0…`
- `src/v1-run-format.mjs` `419cac2d…`
- `src/v1-run-history.mjs` `50f178e2…`
- `test/v1rws-lineage.test.mjs` `2d0f294a…`
- registro do autor `165a313f…`
- itens L `6cb5d83c…`
- contrato `ce7217f8…`

Escrevi no worktree só estes dois arquivos. Não usei nenhum comando git de escrita.
