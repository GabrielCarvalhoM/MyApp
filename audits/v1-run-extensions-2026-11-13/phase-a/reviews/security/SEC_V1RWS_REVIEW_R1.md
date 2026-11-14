**Veredito: PASS_WITH_CONDITIONS** (candidato sintético, sem integração real). Escopo: só o que `bcac30d` acrescenta sobre `c8104c1`.

# SEC-V1RWS-R1 — Security, Privacy & Data, juiz independente da Fase A (V1RWS)

- **Juiz:** Security, Privacy & Abuse Architect 1.1.0, uma instância que não escreveu o candidato. Avaliei e listei condições. Não corrigi nada.
- **Candidato:** worktree `v1-run-extensions`, branch `claude/v1-run-extensions`, commit `bcac30d` (HEAD conferido, árvore limpa).
- **Data:** 2026-11-13.
- **Contexto injetado pelo host:** o host me passou o CLAUDE.md global, o CLAUDE.md do projeto e o índice MEMORY.md. Não usei nenhuma entrada de memória como evidência. Toda a evidência abaixo vem do código, dos testes e das sondas desta sessão.

## Resumo

Nenhum achado bloqueia o candidato. Fora da custódia, o cliente já controla `actualLedger`, as observações e o próprio programa (`program.hash` é hash de conteúdo, sem chave: `r6-program.mjs:13`). Nesse modelo:

- cada efeito de crédito, carga ou expressão que um cliente obtém pelos registros novos ele já obtinha antes;
- a rota clínica do motor continua vindo primeiro;
- nenhuma proteção que já existia ficou mais fraca.

Os riscos reais aparecem quando o Core vira o motor da custódia. Todos eles são condições de integração. Três deles têm uma redução barata no próprio Core e convém fazê-la no ciclo corretivo: A-02, A-03 e A-05.

## Achados

| id | severidade | o quê | evidência | o que fecha |
|---|---|---|---|---|
| SEC-RWS-A-01 | CONDITION_FOR_INTEGRATION | **F-3 confirmado.** Uma linha de formato fabricada e coerente (alvo de 1 km, citada por um relato de 8 min do longão de 100 min) é lida como alvo cumprido e creditada. | Sonda P1: `partial=false`, `weekEvidence=COMPLETED`, `DISTANCE/MEASURED`. O mesmo relato por tempo sai parcial (A). Pelo modelo atual, `completed:true` sem minutos já é creditado (B), com a **mesma ação, os mesmos gates e o mesmo próximo longão**. | `runFormatRecord` e `runHistoryRecord` guardados no documento selado da custódia, linha a linha sob a cadeia HMAC, como registros do motor. Nunca em `CLIENT_REVIEW_FIELDS`. O Core compõe a entrada a partir da cópia guardada. O hash de conteúdo continua sendo só integridade de payload (C5). |
| SEC-RWS-A-02 | CONDITION_FOR_INTEGRATION | **Linha `settled` forjada é reentregue como prescrição da sessão.** Ela passa por fora do envelope (E1–E3, CT-1..CT-3) e da verificação de texto E5. O texto livre vem do cliente. | Sonda P2: um alvo de 42 195 m com a instrução `<img src=x onerror=…>` sai em `runSessions[long]`. A dose do motor não muda. É equivalente a forjar o programa fora da custódia. | Custódia (A-01). Redução barata no Core: ao ler uma linha `settled`, refazer `textsPass` e os limites estruturais (rede de distâncias, `repeat`, número de etapas) e conferir o envelope gravado; uma linha que falha vira ilegível. Toda superfície que exibir `instructions` deve tratá-las como texto puro. |
| SEC-RWS-A-03 | CONDITION_FOR_INTEGRATION | **Amplificação (DoS) por formato patológico.** `readableFormat` não limita `blocks[].repeat`, e `flatSteps` expande cada repetição. | Sonda D: uma linha de 986 bytes com `repeat=2e6`, citada por um relato, leva 13 s e cerca de 1 GB de heap. Com `1e5` são 0,8 s. Com `2e7` tende a esgotar a memória. | No Core: limitar `repeat`, o número de etapas e os metros em `readableFormat`. Fora disso a linha fica ilegível. Na fronteira: esquema fechado para os campos novos de `actual.*` (`steps`, `segments`, `stop`, `declared`, `conditions`, `formatHash`, `sport`, `deviceGpsQuality`), com tamanho de array limitado, limites numéricos e sem texto livre. Hoje `stop.reason` e `declared.reason` ficam gravados como chegam (teste T3). Incluir `runExpression` em `CLIENT_REVIEW_FIELDS` só como enum fechado. Pôr limites de tamanho e de taxa nos registros e nas requisições. |
| SEC-RWS-A-04 | CONDITION_FOR_INTEGRATION | **Chave `READS_COMPLETION` nos pontos de entrada antigos.** Quem chama `v1-index`, `v1-run-index` ou o `historicalStateOf` congelado pode passar uma função leitora. | Sonda P3: no `v1-index`, `completed:false` com `()=>'DISTANCE'` é lido como completo. Mas a chave é um `Symbol` e não atravessa JSON (P3: `false`). Só código no mesmo processo consegue passá-la, a mesma classe de `options.runCalibration`, `options.runFormats` e `BAND_OF`. A custódia só passa `{withhold:[…]}`, constante (`custody.mjs:189`). | A integração não passa opções derivadas da requisição a nenhum ponto de entrada. O invólucro do motor da custódia não espalha dados do cliente em `options`. Um teste de fronteira prova isso. Não criar caminho privilegiado novo. |
| SEC-RWS-A-05 | CONDITION_FOR_INTEGRATION (rotear ao SSCTR) | **A triagem de sinais após parada por SYMPTOM depende da expressão.** Ela não sobe para um relato com formato desconhecido (ASK, nada gravado). Também não sobe quando o relato volta "como a versão por tempo", que é o caminho que o próprio ASK oferece: a parada fica gravada e nenhuma triagem é levantada. | Sondas S1 e timestop: com formato conhecido, `REQUIRED`; com formato desconhecido, `ASK` e nenhuma triagem; reenviado por tempo, `NOT_RAISED` com `actual.stop.reason=SYMPTOM` gravado. Não enfraquece proteção existente: o motor congelado nunca leu `actual.stop` (S1 frozen: `MODIFY`). Elegibilidade e bem-estar com sinal "sim" continuam indo primeiro para `CLINICAL_HUMAN_REQUIRED` (S2b e o teste "clinical signal still routes first"). | O SSCTR decide o escopo da R3 C4: se toda parada SYMPTOM em corrida, nativa ou por tempo, leva à triagem. Redução barata: calcular `symptomStops` sobre o `actual.stop` cru de toda linha viva de corrida, e nomear a parada no shell do ASK. Integração: a triagem exigida fica durável (guardada na custódia) e é apresentada pelo app, porque hoje só existe em `runFormat`. |
| SEC-RWS-A-06 | CONDITION_FOR_INTEGRATION | **Os shells ASK e HOLD descartam a revisão inteira, salvo rota clínica.** Somem os outros relatos e as declarações da mesma revisão. Um registro de formatos perdido ou dessincronizado deixa toda revisão futura em HOLD. | `v1-run-format-index.mjs:190-197`. Sonda S2: bem-estar com um relato de formato desconhecido dá `ASK`, nenhuma linha e nenhuma proposta. Não demonstrei perda de um efeito F08 não clínico: a declaração sozinha deu `KEEP` neste cenário. | Persistir o registro de formatos, o de histórico e o `actualLedger` no mesmo commit selado. Uma exclusão, como `eraseHealthFacts`, nunca remove o formato citado por uma linha que continua. O app reenvia a revisão depois do ASK, e o resultado não pode depender disso para a segurança. |
| SEC-RWS-A-07 | CONDITION_FOR_INTEGRATION (+ escalonamento legal) | **Dados de saúde novos fora do inventário, do apagamento e do consentimento.** `actual.stop.reason` SYMPTOM ou FATIGUE numa linha de sessão é dado derivado de saúde. O mesmo vale para `runFormat.warningSignScreen` (`RUN_STOPPED_FOR_A_SYMPTOM`), `offers` (`SYSTEMIC_FATIGUE_REVIEW`) e `runSessions[].unavailable.native` (`CLINICAL_ROUTE`, `WARNING_SIGN_SCREEN_REQUIRED`). | `eraseHealthFacts` só alcança linhas F08 e as que as referenciam (`custody.mjs:286-293`): **uma parada SYMPTOM numa linha de sessão não é alcançada**, só pelo apagamento da conta. A custódia aceita essa parada só com o consentimento COACHING. `inventory.mjs` classifica `observations.actual` como TRAINING. `NEVER_OUTBOUND` não cobre SYMPTOM nem WARNING_SIGN (S5). | Inventário: esses campos entram como HEALTH_DERIVED, com egress NONE. O canário ganha SYMPTOM, WARNING_SIGN e SYSTEMIC_FATIGUE. O apagamento de fatos de saúde passa a alcançar o motivo de parada por anotação ou redação, preservando a cadeia. Definir o propósito: HEALTH_SIGNALS ou COACHING. **Escalonamento ao Founder/G07:** base legal e classificação (LGPD art. 5º II e art. 11) de motivos de parada e de treinos importados do Apple Saúde. Não decido isso aqui. |
| SEC-RWS-A-08 | CONDITION_FOR_INTEGRATION | **`runHistoryRecord` guarda dados de origem HealthKit.** São o UUID do HKWorkout (identificador estável, pseudônimo e ligável do ecossistema do aparelho), datas, distâncias, minutos, qualidade, condições e a distância declarada no intake. | `v1-run-history.mjs:62,80,85`. A linha é devolvida ao chamador inteira. | Mesma classe e mesma custódia de `runEvidenceRecord` (A-01). Egress NONE; o UUID nunca vai para logs ou telemetria. O apagamento da conta alcança o registro. Revogar a leitura do Apple Saúde permite apagar o histórico importado. Respeitar os termos do HealthKit (sem uso para publicidade e sem cessão a terceiros). Com o write-back, aplicar o G8. |
| SEC-RWS-A-09 | NOTE | **Inflar o histórico ou a declaração só muda a expressão.** | `sizeContinuous`: D·P_size ≤ min(M, minutos disponíveis) (CT-1) e D·P_typ ≥ 0,9·M (CT-2). S2/S3 só tornam P_size mais lento, e P_typ vem de V1RC e do ledger. Sonda P5: uma corrida forjada de 60 km não muda nenhuma sessão, a ação ou a proposta (CT-1 já limita), e toda estimativa alta nativa fica ≤ minutos planejados. Teste T13 WE3A-07. DECLARED e CONFIRMED_CORRECTION nunca são `paceEvidence`. Deduplicação: L30 é um máximo e o longão comparável é o mais recente, então nenhuma soma é inflada; duas atividades com um id só reduzem o histórico. Um histórico forjado pode **liberar a elegibilidade** (`DISTANCE_HISTORY_UNKNOWN`, `LONG_HISTORY_NOT_COMPARABLE`), o que equivale a forjar o ledger. | Nada no candidato. Fecha com a custódia (A-01). |

## Respostas 1–7

**1. Fronteiras de confiança.**

| Entrada | O que pode influenciar | Ganho sobre o controle atual de `actualLedger` e observações |
|---|---|---|
| `runFormatRecord` e `actual.formatHash` | a leitura de conclusão e, por ela, os gates de progressão | Nenhum: `completed:true` sem minutos já basta (A-01). |
| `runFormatRecord` (linhas `settled`) | a forma entregue da sessão, inclusive o texto | Equivale a forjar o programa (A-02). |
| `runHistoryRecord`, `athlete.recentLongestRun`, `segments`, `declared` | só L30, o longão comparável, a elegibilidade e a expressão (A-09) | Nenhum. A chave sai antes do motor (o I1 prova o motor igual). |
| `runExpression` | só pode suprimir o nativo | Nenhum. |
| `steps`, `stop` | o status da execução, a pausa X-2 e a triagem da extensão | Nenhum. |
| `deviceGpsQuality` | só pode marcar como POOR | Nenhum. |
| `sport` | só a leitura de histórico | Nenhum. |

Nenhuma dessas entradas chega a minutos, carga, calibração por evidência medida ou rota clínica.

**2. F-3.** Demonstrado (P1). O Core não consegue provar a autoria de um registro carregado pelo cliente, porque um hash sem chave é só payload. O que fecha é guardar os registros na custódia (A-01). O que reduz barato, sem fingir que fecha:

- revalidar linhas `settled` e citadas contra o envelope gravado e o E5;
- limitar a estrutura em `readableFormat` (A-02, A-03).

**3. Chave do leitor.** Não é um caminho privilegiado novo. É um Symbol só no processo, a mesma classe das opções de desenvolvimento. A custódia não carrega essa chave. A integração precisa garantir que nenhuma opção derive da requisição (A-04).

**4. Roteamento de segurança.**

- O ASK de formato desconhecido e o HOLD de formato perdido avaliam o motor primeiro e devolvem a rota clínica quando ela existe (teste e S2b). Nenhuma entrada da extensão suprime ou adia uma rota clínica do motor.
- A triagem pós-SYMPTOM é proteção nova e só da extensão. O cliente pode "limpá-la" com uma elegibilidade avaliada depois da parada (S3). Também pode trocar o motivo para FATIGUE (S4) ou reenviar o relato por tempo. É o mesmo poder que já tem sobre a elegibilidade do motor.
- A lacuna real é de desenho (A-05), não de abuso.

**5. Abuso.**

- Inflar histórico ou declaração não muda minutos, carga nem crédito (A-09).
- Declarado e corrigido nunca viram evidência de ritmo nem recorde (`paceEvidence`; SC-3 e H8 nos testes).
- Duplicidade só torna o histórico mais conservador.
- O DoS por tamanho é real (A-03).

**6. Dados.**

- `runFormatRecord` é TRAINING: sessão, hashes, alvos e estimativas.
- `runHistoryRecord` é TRAINING com proveniência HealthKit, e o UUID é um identificador ligável (A-08).
- Os motivos de parada SYMPTOM e FATIGUE, as linhas `declared` e `stop` e os marcadores de triagem são HEALTH_DERIVED. `eraseHealthFacts` **não** alcança a parada SYMPTOM numa linha de sessão; só `eraseAccount` alcança.
- Os propósitos e o apagamento precisam ser estendidos (A-07). A base legal fica escalonada ao G07.

**7. Saída e logs.** O resultado carrega as palavras SYMPTOM, WARNING_SIGN_SCREEN_REQUIRED e RUN_STOPPED_FOR_A_SYMPTOM (S5), mais o UUID do HKWorkout e os `eventId`. Tudo isso deve ficar no egress NONE, só nas visões do atleta. `telemetryOf` hoje não lê `runFormat` nem `runSessions` e não vaza nada. A condição vale para qualquer consumidor futuro: compartilhamento, relógio, notificação, analytics (A-07).

## O que executei

- `node --test test/v1rws-*.test.mjs` em `CoachingCore/`: **49/49**.
- Sondas, só leitura, importando por URL de arquivo, em `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/2e948744-f019-40c7-9630-ece3b7d8a9e9/scratchpad/judges/security/`:
  - `probe-f3.mjs`: P1, A, B, P2, P3, P5;
  - `probe-safety.mjs safety`: S1–S5;
  - `probe-safety.mjs 100000` e `probe-safety.mjs 2000000`: DoS;
  - `probe-wellbeing.mjs` e `probe-wellbeing-rest.mjs`: S2;
  - `probe-timestop.mjs`: parada SYMPTOM por tempo.
- Leitura de código: `v1-run-format-index.mjs`, `v1-run-format.mjs`, `v1-run-history.mjs`, `git diff c8104c1 bcac30d -- CoachingCore/src/r6-adaptation.mjs`, `boundary/custody.mjs`, `boundary/inventory.mjs`, `r6-program.mjs:13`, os testes `v1rws-engine` e `v1rws-helpers`, e `PHASE_A_CANDIDATE.md` com `ATHLETE_DATA_FOUNDATION.md` §3–4 e §6.
- Não executei `npm run verify`, `verify-r*`, `*-freeze.mjs`, `v1rc-journeys` nem `v1rc-fuzz`. Não alterei nenhum arquivo fora deste.

## O que não revisei

- `boundary/api.mjs`, `views.mjs`, `store.mjs`.
- `v1-run-calibration.mjs` por dentro (confiei em SC-3/H8 pelos testes).
- A correção esportiva de envelopes e valores (é do SSCTR).
- A qualidade e o replay (são do QRE).
- O adaptador iOS, a autenticação, a gestão de chaves, a retenção e a base legal (G07).
- A Fase B (RFC).
- Não demonstrei a perda de um efeito F08 não clínico no shell ASK (A-06 fica por leitura de código).
