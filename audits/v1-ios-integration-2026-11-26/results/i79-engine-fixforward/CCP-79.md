# CCP-79 — fix-forward controlado do CoachingCore (#79)

**Autorização:** decisão do fundador na #79, **APROVADO — Opção A** (comentário 7227351995, 27/11/2026), registrada pelo orquestrador
(7227433698). O item 5 foi acrescentado pelo fundador na #74 (comentário 7227437457) e registrado na #79 (7227493672).

**Escopo:** exclusivamente os cinco itens abaixo. Nada mais muda no motor: sem um sinal ou um flag respondido "sim", toda resposta é a
congelada (a suíte ativa inteira passa sem alteração de nenhum teste de comportamento).

**Não libera REAL_ATHLETE_READY e não substitui a revisão clínica humana (#87).**

## 1. Nova base validada

| | |
|---|---|
| Revisão | **REPMILE-COACHINGCORE-V1-CCP79-AMENDMENT-3** |
| Registro | `CoachingCore/v1/CCP79_SAFETY_AMENDMENT_V1.json` (escrito uma vez, commit `e7c35b6`) |
| Commit do runtime | `59bb66d` (base `6bc4362`) |
| Sucede | REPMILE-COACHINGCORE-V1-FIVE-ZONE-AMENDMENT-2 (`HR5_RUNNA_AMENDMENT_V1.json`, intacto em `9a88521`) |
| Cadeia preservada | FINAL-RELEASE-FREEZE (`6482749`), FIVE-ZONE-AMENDMENT-1 (`bec39c5`), FIVE-ZONE-AMENDMENT-2 (`9a88521`): os três registros byte a byte nos seus commits; nenhum reescrito |
| Arquivos lidos pelo runtime | os mesmos 91 que a emenda 2 vincula (nenhum acrescentado, nenhum removido); 87/87 idênticos, 4 emendados com o diff gravado |
| Verificador | `node CoachingCore/scripts/v1-ccp79-amendment.mjs --check` → `91/91 consumed files byte-identical` (`amendment-3-check.txt`) |
| Bundle de produção (frente A) | `ios/Packages/CoachingHost/Sources/CoachingHost/Resources/coachinghost.js` sha256 `cdd812dc46aa837041ea1b68f964e150436abe225c480159d156612b0769d28a`, 50 módulos (47 do CoachingCore), 18 assets, export gate 805/0; fixado em `BundlePin.swift` |
| Camada histórica | **REPMILE-COACHINGCORE-V1-TEST-SUITE-SANITIZATION-3** (`HISTORICAL_LAYER_RECORD_3.json`, escrito sozinho no commit `4dc3dd9`); a -2 continua intacta como histórico |

### Como o mecanismo de congelamento foi seguido

- O CoachingCore registra cada linha como um registro versionado ao lado dos anteriores (`CoachingCore/v1/*.json`), cada um com o seu
  verificador `--write/--check`. Este CCP segue o padrão da emenda 2 (`scripts/v1-hr5-runna-amendment.mjs`): `scripts/v1-ccp79-amendment.mjs`
  prova a cadeia intacta, os quatro arquivos emendados e os seus diffs, que nada mais mudou desde a base, e o bundle.
- `HISTORICAL_TEST_POLICY.md` §4 regra 1: `v1san-runtime-integrity.test.mjs` é o gate que diz "houve mudança de runtime". Ele foi
  **reapontado** para o novo registro, mantendo as checagens por classe; os verificadores anteriores podem falhar só no que as emendas
  posteriores declaram e em infraestrutura de teste.
- §4 regra 2: como um arquivo da camada mudou (o teste de integridade, os títulos dos sucessores no manifesto e `suite-manifest.mjs`), a camada
  ganhou um **novo registro** (SANITIZATION-3), escrito por `write_layer_record_3.py` (cópia do escritor da -2, só com saída e revisão novas)
  e commitado sozinho, uma única vez.
- **Nenhum teste anterior de comportamento falha** com esta emenda. Por isso o manifesto histórico mantém as 53 entradas; só os títulos dos
  sucessores reapontados mudaram (19 referências). `npm run test:historical` foi rodado porque o manifesto mudou (seção 4).

### Commits

| Commit | Conteúdo |
|---|---|
| `59bb66d` | runtime (4 arquivos), `test/v1ccp79-safety-routes.test.mjs`, o verificador, o bundle do CoachingHost religado (`build/link.mjs`) e o `BundlePin.swift`; o replay e as entradas narrativas |
| `e7c35b6` | o registro REPMILE-COACHINGCORE-V1-CCP79-AMENDMENT-3 (`--write --commit 59bb66d`) |
| `ae96e84` | teste de integridade reapontado, títulos no manifesto, `suite-manifest.mjs` → SANITIZATION-3, `check-manifest.mjs`/`build.sh` do CoachingHost lendo a emenda em vigor |
| `4dc3dd9` | o registro da camada histórica SANITIZATION-3, sozinho |
| seguinte | este CCP e a evidência |

## 2. Os cinco problemas

Reprodução: `replay/ccp79-replay.mjs` pela fronteira real (`createIntegration` → custody → motor), atletas sintéticos, store em memória, como o
app envia. Na base congelada: **7 passam, 26 falham** (`replay-base.txt`). Na emenda: **33 passam, 0 falham** (`replay-amended.txt`).

### Item 1 — sinal de alerta preso atrás da triagem

- **Reprodução:** "Não estou 100%" com dor no peito (ou qualquer sinal "sim") e sem triagem → `ASK eligibility.currentAssessment`, plano
  `NEEDS_INPUT`, sem rota clínica nem nível. Igual com triagem de 20 dias. Durante uma retenção, a mesma resposta virava
  CLINICAL/PROFESSIONAL (o estado de referência "grudento" convertia o ASK), nunca URGENT; idem numa declaração de prontidão com desmaio "sim".
- **Causa:** `r6-adaptation.mjs:559` (base) devolvia ASK por triagem ausente antes de qualquer leitura dos sinais; a leitura dos sinais só
  acontecia depois (no guard da retenção, l. 568, e nos handlers), contrariando o "clinical first" do próprio motor (`readWellbeing`, RC-01).
- **Mudança:** antes do gate de elegibilidade o motor lê os sinais e itens de resposta ao exercício respondidos "sim" em `wellbeing`,
  `wellbeingCheck` e `readiness` (o mesmo `signsYesIn` do guard). Com um sinal "sim", a triagem ausente, vencida ou anterior ao dia da prova
  leva à rota clínica do sinal (`signRoute`: retenção, nível pelo maior item "sim", sinais nomeados), não ao ASK. **Sem sinal "sim", o ASK
  continua igual.**

### Item 2 — urgência rebaixada por um "sim" na triagem

- **Reprodução:** dor no peito "sim" + qualquer flag da triagem "sim" (dor, dor persistente, lesão, doença, limitação, outra preocupação) →
  CLINICAL com **PROFESSIONAL_ASSESSMENT**, e a retenção herdava esse nível.
- **Causa:** `r6-adaptation.mjs:555` (base): o flag "sim" devolvia a rota clínica sem ler os sinais; o `guided` dava o nível padrão
  PROFESSIONAL_ASSESSMENT.
- **Mudança:** a rota do flag carrega o nível e os sinais do `signRoute` quando há sinal "sim" (o maior nível entre os itens "sim"). Um flag
  sozinho continua PROFESSIONAL_ASSESSMENT.
- **#124** ("um sinal urgente vence a triagem") é este mesmo defeito. A matriz dele virou teste de regressão:
  `test/v1ccp79-i124-matrix.test.mjs`. São 4 fluxos (notFeeling100, declareReadiness, wellbeingCheck, weeklyCheckIn com check) × 3 triagens
  (tudo não / um sim / vários sim) × 7 sinais (nenhum, W7, W2, W3, W4, W5, X1), ou seja, 84 células:
  - triagem "sim" + sinal urgente → URGENT_CARE_ADVISED com o sinal nomeado (40 células);
  - triagem "sim" + W7 → PROFESSIONAL_ASSESSMENT com o motivo do sinal (8 células);
  - sem sinal ou triagem toda "não" → resposta inteira byte a byte igual à da base (36 células, digests em `test/v1ccp79-i124-base-digests.json`).

  Na base congelada, as 48 células corrigidas falham (`failing-first-i124-base.txt`).
- **Notas (fora do escopo, não mudadas):**
  - declareReadiness com X1 e triagem toda "não" pede `readiness.unrecognized`: X1 não está em `READINESS_SIGNS`, e o app nunca o envia ali.
  - weeklyCheckIn ignora o check fora de um episódio (KEEP); o app nunca chama weeklyCheckIn.

### Item 3 — nível da retenção rebaixado por decisão posterior

- **Reprodução:** retenção urgente; depois um relato de corrida comum, uma febre "sim" ou uma triagem com dor "sim" → `hold.guidance` vira
  PROFESSIONAL_ASSESSMENT e o Hoje mostra "Procure uma avaliação profissional".
- **Causa:** `views.mjs:58` (base): o nível da retenção era o da decisão **mais recente** que tinha nível.
- **Mudança (regra provisória do SSCTR):** `holdGuidance` — o nível de uma retenção em vigor é o **maior** entre as decisões desde
  `hold.since` (a linha de retenção mais antiga ainda em vigor), e nunca menor que o da última decisão com nível (o que a visão congelada lia).
  Nenhuma decisão posterior o abaixa, tenha ou não voltado a perguntar os sinais. Só uma declaração de prontidão que libera a retenção o
  encerra; uma retenção nova começa das próprias decisões. Cada decisão continua com o **seu** nível no registro (`decision.guidance`).

### Item 4 — limite de correções recusa um "sim" antes da triagem

- **Reprodução:** 17ª correção de um relato com a triagem "dor: sim" → `LIMIT_EXCEEDED correctionsPerReport`; nada segue para a rota clínica.
- **Causa:** `integration.mjs:248` (base) aplica o limite na admissão, antes do motor; a exceção de segurança (`admission.mjs:91`,
  `statesSafetySignal`) contava só parada, recuperação adversa e dia seguinte prejudicado.
- **Mudança:** `statesSafetySignal(observação, triagem)` conta também um flag clínico "sim" na triagem **do próprio pedido do atleta**
  (`screenStatesFlag`, lido exatamente como o gate do motor lê: as seis chaves com `isYes`, ou status `CLINICAL`/`PAIN_OR_INJURY`). Vale para
  `correctionsPerReport` e `reportsPerDayPerChannel`: admitido no máximo `safetyExcess` (3) além do limite e depois recusado (o registro
  continua limitado). Sem flag, o limite é o mesmo. O canal do dispositivo não muda.

### Item 5 — um "sim" descarta os fatos da sessão

- **Reprodução:** relato de corrida (ou de força, ou uma correção) com a triagem "dor: sim" → CLINICAL, `recorded=0`: o relato some.
- **Causa:** `r6-adaptation.mjs:555` (base) devolvia `keep({})`, que guarda só a pausa declarada; o registro dos relatos sob rota clínica
  (CF-OBS-1, PCG-V1CPFF-CFOBS1-r1 Q3) existia só no guard de uma retenção já em vigor (l. 571).
- **Mudança:** o registro do guard virou `recordedFacts()` (mesmo código, agora compartilhado) e é usado também na rota do flag e na nova
  rota do item 1: os relatos são normalizados, vinculados e gravados; nada é planejado. Um pedido sem triagem e sem sinal "sim" continua ASK e
  não grava nada.

## 3. Evidência de regressão

| Gate | Resultado | Arquivo |
|---|---|---|
| Testes novos, primeiro falhando | `test/v1ccp79-safety-routes.test.mjs` na base congelada: **0 passam, 7 falham** nas asserções do defeito | `failing-first-base.txt` |
| Matriz do #124, primeiro falhando | `test/v1ccp79-i124-matrix.test.mjs` na base: os testes das 40 + 8 células corrigidas falham; os das 36 inalteradas passam | `failing-first-i124-base.txt` |
| `npm test` (suíte ativa oficial), base `6bc4362` | 1952 ativos, 1952 passam; 53/53 históricos falham onde declarado | `suite-base.txt` |
| `npm test` no HEAD | **1963 ativos, 1963 passam, 0 falham** (os 1952 + 7 do CCP-79 + 4 da matriz do #124); 53/53 históricos falham onde declarado; nada pulado | `suite-final.txt` |
| `npm run test:historical` | **53/53** passam no commit a que pertencem (16 commits) | `historical-run.txt` |
| Replay pela fronteira | base 7/33; emenda 33/33 | `replay-base.txt`, `replay-amended.txt` |
| Verificador da emenda 3 | 91/91, bundle como registrado (em `4dc3dd9`). Depois, os dois arquivos de teste do #124 aparecem no passo "nothing else changed" como infraestrutura de teste não declarada. O registro é escrito uma vez, e o teste de integridade aceita exatamente essa classe (HISTORICAL_TEST_POLICY §4 regra 3). | `amendment-3-check.txt` |
| CoachingHost `build.sh --twice` | determinístico; manifesto checado contra a emenda 3; 98/98 fixtures compartilhadas iguais; `facade-calls.json` inalterado | `coachinghost-build.txt` |
| CoachingHost `swift test` (macOS, keychain de arquivo de teste, nunca o login keychain) | **69 testes, 0 falhas**, 1 pulado (o teste opt-in do Keychain real, por desenho) | `coachinghost-swift-test.txt` |
| IntegrationContracts / CoachingPresentation `swift test` | 10/10 e 29/29, 0 pulados | — |
| guard / swift-size | 10 caminhos do CoachingCore exigem `governance:approved` (esperado); 0 acima de 350 linhas | `guard-swift-size.txt` |

As fixtures de equivalência do HR5R (`core`, `int`, `final`, `hr5`) e as 98 fixtures compartilhadas do CoachingPresentation são reproduzidas
sem diferença: nenhum dos seus passos tem sinal ou flag "sim" sem triagem, nem retenção rebaixada.

## 4. O que continua clínico e humano (CLINICAL_HUMAN_REQUIRED)

- **Persistência ou decaimento do nível urgente durante uma retenção** (#87). O motor aplica o provisório conservador do SSCTR (o maior nível
  desde `hold.since`); se o revisor clínico decidir que um "não" explícito aos sinais urgentes baixa o nível, isso é uma nova emenda.
- **O texto da orientação** (`wordingStatus: INTERIM_PENDING_G04`).
- **Dor muscular normal pós-treino × dor clínica** na pergunta "Dor" (#74 item 3, #87).
- **Toda liberação clínica.** O motor nunca libera uma retenção; só a declaração de prontidão do atleta abre o retorno esportivo.

## 5. Pendências e efeitos para as frentes

- Revisões independentes **SSCTR** e **QRE** (o orquestrador encaminha). Uma mudança de runtime pedida por elas é um novo registro
  versionado, nunca edição deste.
- O fundador aplica `governance:approved` depois das revisões e do último commit. O guard lista 10 caminhos do CoachingCore que exigem o rótulo.
- **Frente C, depois do merge:** o "nível que só sobe" provisório da tela (SSCTR C4.3, #73) deve ser alinhado com esta regra ou removido; as
  compensações do #72 (triagem logo depois dos sinais) e do #96 (rota clínica no LIMIT_EXCEEDED) podem ser revistas. Um relato reenviado
  depois de uma rota clínica agora é duplicata (já foi gravado).
- **Frente A:** workouts do HealthKit enviados com a última triagem do atleta com flag "sim" agora são gravados sob a rota clínica (antes,
  descartados). Os limites do canal do dispositivo não mudam.
- Fora do escopo do fundador e não feito: sinais de alerta "sim" (não flags) acima do limite de correções; o canal do dispositivo.
- **REAL_ATHLETE_READY = NO.**
