# Relatório de testes

Mac mini M4, macOS 27.0, Node v24.19.0, Xcode/Swift 6. Tudo sintético. Logs em `evidence/`.

## 1. CoachingCore (nenhum byte mudou)

| Verificação | Antes (`237797c`) | Depois (fechamento) | Log |
|---|---|---|---|
| `git diff 237797c -- CoachingCore` | — | **0 linhas** | sessão |
| `npm test` (suíte ativa, política de testes históricos) | 1952 / 1952 / 0; 53 históricos no ponto declarado | **1952 / 1952 / 0; 53 históricos no ponto declarado**; 2 min 55 s | `baseline-npm-test.txt`, `final-npm-test.txt` |
| Cadeia HR5 (`v1hr5-five-zones`, `v1hr5r-boundary`, `v1hr5r-successors`) e `v1san-runtime-integrity` (runtime = AMENDMENT-2) | verdes | verdes (dentro da suíte) | idem |
| Verificador `v1-hr5-runna-amendment.mjs --check` | falha só no passo "nothing else changed" (9 arquivos do saneamento, declarado) | idem; nada desta linha sob `CoachingCore/` | sessão |
| JSC macOS / iPhone | não repetidos: nenhum byte nem comportamento nativo mudou (bundle `d087ad51…` intacto) | — | — |

## 2. Swift

| Pacote | Testes | Resultado | iOS genérico |
|---|---|---|---|
| `IntegrationContracts` | 10 (7 originais intactos + 3) | **10/10** | BUILD SUCCEEDED |
| `CoachingPresentation` | 29 | **29/29** | BUILD SUCCEEDED |

`CoachingPresentation` por suíte:

| Suíte | Testes | Cobre |
|---|---|---|
| `FrozenShapeDecodingTests` | 6 | as asserções originais de CHG-UI-1 sobre as fixtures **atuais**; estados desconhecidos falham fechado; `DisplayValue` |
| `FiveZoneDecodingTests` | 4 | Z1–Z5 sem relógio (30 anos: 123/153/169/184), medidas, informada/personalizada, sem idade, hold; compatibilidade congelado × rev. 1 × rev. 2 |
| `RequestSchemaTests` | 6 | enumerações e chaves contra os fontes congelados; `specialPopulation` sempre enviado; flags não respondidas omitidas; `OBSERVATION_KEYS.ATHLETE`; `CLIENT_REVIEW_FIELDS`; leitores F08 (inclui chaves aninhadas da prontidão); perfil FC |
| `EndToEndBoundaryTests` | 6 | Swift → fronteira real → motor → Swift: gestação/pós-parto bloqueiam; restart fora de escopo e restart clínico (portões); sinais (hold, ASK, saída por prontidão, prontidão com restrição); avulsas com/sem `observedAt`; parada por sintoma; perfil FC (definir, inválido, apagar) |
| `BlockedAndDescriptiveTests` | 5 | apresentação inteira sob hold; planos bloqueados sem prescrição nem passos; fora de escopo e sem dados nunca plano vazio; **todas as fixtures decodificam**; projeções (vozes, conflito, distâncias, mescla, histórico, fases, tempo em zona fechado) |
| `FixtureFreshnessTests` | 2 | recaptura byte a byte das fixtures pelo runtime atual; a suíte Node da fachada (`# fail 0`) |

## 3. Node (fachada e contratos)

`node --test 'ios/Packages/CoachingPresentation/Facade/test/*.test.mjs'`: **13/13** (`final-node-facade.txt`).

| Teste | Cobre |
|---|---|
| HR5 concorrência (5) | a corrida aceita reproduzida; o guarda (lock + CAS por bytes) a impede e o retry mantém as duas declarações; escritor tardio recusado pela âncora; rollback do blob à mesma versão; **persistência entre dois processos** (store em arquivo + âncora em arquivo) |
| Projeções (8) | sinais = `signsFor` congelado (9/13/15/15); `loggedEntries` sem chave reservada, correção, apagamento; vozes e fatos do atleta da voz do atleta; parada por sintoma contra corrida completa do aparelho visível; avulsas com/sem `observedAt` (inclusive na mesma requisição); `weekPlan` = documento; tempo em zona fechado (nem o chamador abre) e só pelo classificador do motor; `specialPopulation` no enroll e no restart |

## 4. Fixtures

- 99 capturas + `INDEX.json`, todas do runtime atual pelo `capture-fixtures.mjs`; recaptura num diretório temporário: `diff -r` **idêntico** (`final-fixture-determinism.txt`); o revisor QRE refez a captura nas duas rodadas e obteve o mesmo resultado.

## 5. Trava do aparelho

`with-device.sh` com `swiftui`: exclusão (75) nos dois sentidos, `--wait` após liberar, passagem do código de saída, sessão inválida (64), `status` (`device-lock-swiftui.txt`). As 9 situações da bateria original não mudaram (só a lista de sessões).

## 6. Não executado, e por quê

- iPhone: nenhuma mudança nativa ou de bundle; a validação física da HR5R continua descrevendo este runtime. Os testes físicos novos (persistência entre processos nativa, portões de A, GPS de C) são obrigações das frentes.
- `npm run test:historical`: a camada histórica não mudou (nenhum arquivo dela tocado); a suíte ativa confirma os 53 no ponto declarado.
