# HR5 (cinco zonas, Runna) — contratos para o CoachingHost

Fonte: `audits/v1-hr5-runna-parity-2026-11-25/CONTRACT_DELTA.md` (autoritativo) e o código em vigor (`CoachingCore/src/boundary/integration.mjs:372–395`, `api.mjs`, `v1-heart-rate-profile.mjs`, `v1-heart-rate-zones.mjs`). A definição das zonas é do motor; nenhuma tela recalcula percentual.

## 1. As duas operações

| | `setHeartRateProfile` | `eraseHeartRateProfile` |
|---|---|---|
| Chamada (A, via `api.mjs`) | `{actor, clientRequestId, expectedVersion, heartRateProfile}` | `{actor, clientRequestId, expectedVersion}` |
| Swift (C → A) | `CoachingWriting.setHeartRateProfile(HeartRateProfileRequest)` | `CoachingWriting.eraseHeartRateProfile()` |
| Entrada | `maxHeartRateBpm`: inteiro 120–230 ou `null` (limpa); `zoneUpperBpm`: 4 inteiros 60–230 estritamente crescentes (limites superiores de Z1..Z4) ou `null`; campo omitido = mantido | nenhuma |
| Resposta | `{ok, version, heartRateProfile:{added, unchanged}, fiveZones:{status, reason}, replayed?, view}` → `HeartRateProfileAnswer` | `{ok, version, erased:[eventId], fiveZones, view}` |
| Consentimento | **COACHING** obrigatório (`CONSENT_REQUIRED`, `purpose: COACHING`) | nunca retido por consentimento nem por relógio atrás |
| Erros tipados | `INVALID_REQUEST` (`fields`, ex. `zoneUpperBpm.strictlyIncreasing`), `CONFLICT_STALE_VERSION` (`version`), `CONFLICT_IDEMPOTENCY_KEY`, `CONSENT_REQUIRED`, `OPERATIONAL_ERROR`, `PERSISTENCE_FAILURE`, erros de leitura (`NOT_ENROLLED`, `RECORD_LOST`, `RECORD_ROLLED_BACK`, `INTEGRITY_FAILURE`) | os mesmos, menos consentimento |
| Efeito | nenhuma chamada ao motor, nenhuma decisão, nenhum plano muda; **a versão da custódia não muda**; o registro carregado ganha uma linha e `carried.seq + 1`; a leitura das cinco zonas é refeita pelo motor | apaga **todas** as declarações do atleta (histórico incluído); a idade do intake fica (dado de cadastro, apagado com a conta) |
| Idempotência | por `clientRequestId` (`replayed:true`); mesmo id com outro perfil → `CONFLICT_IDEMPOTENCY_KEY` | idem |
| Fixtures | `hr5r-declared-answer`, `-replay`, `-invalid-answer`, `-stale-answer`, `-reuse-answer`, `-set-without-consent`, `-custom-presentation`, `-carried` | `hr5r-erase-answer`, `-erase-without-consent`, `-after-erase-presentation` |

## 2. O que o Swift recebe (`HeartRateFiveZones`)

- **FC máxima estimada:** `reference.kind = AGE_ESTIMATE`, `formula 220_MINUS_AGE`, `ageYears` (18–80; fora → `AGE_OUTSIDE_ESTIMATE_RANGE`; sem idade → `AGE_REQUIRED`), `provenance ESTIMATED`, confiança LOW. **Sem relógio, sem cinta, sem laboratório.**
- **FC máxima informada:** `ATHLETE_DECLARED_MAXIMUM`, `DECLARED`, `UNVERIFIED`.
- **Limites personalizados:** `boundarySource ATHLETE_CUSTOM` (percentuais nulos; nunca recalculados de uma nova máxima).
- **Medidas:** `LAB_MEASURED_MAXIMUM` (MODERATE), `OBSERVED_MAXIMUM` (cinta, só acima da estimativa), conflito → nenhuma das duas, ambas mostradas; tudo o que não foi usado em `notUsed` com o motivo.
- **Faixas:** `zones[].minBpm…maxBpm` inteiros inclusivos do motor (30 anos: ≤123 · 124–153 · 154–169 · 170–184 · ≥185).
- **Disponibilidade:** `AVAILABLE` ou `UNAVAILABLE` com `HOLD_NO_PRESCRIPTION`, `EXTENSION_NOT_ENABLED`, `AGE_REQUIRED`, `AGE_OUTSIDE_ESTIMATE_RANGE`, `REFERENCE_CONFLICT`, `ZONE_BOUNDARIES_DEGENERATE`, `FIVE_ZONE_ERROR`. `sessionDistribution` e `liveHeartRate` sempre `UNAVAILABLE` na V1.
- **Versões:** `model V1X-HR-FIVE-ZONE-2`, `version V1X-HR-FIVE-ZONE-STATE-2`, valores `HEART_RATE_FIVE_ZONE_V2.json` (`784ba7fe…`); a linha do registro é o fato `V1HR5R-HEART-RATE-PROFILE-DECLARED`.
- A cópia segue as condições SSCTR C1–C11 (handoff C §FC).

## 3. Persistência, apagamento, recuperação

| Tema | Contrato |
|---|---|
| Onde fica | `heartRateProfileRecord` é um dos `CARRIED_RECORDS`: no mesmo documento, sob o mesmo selo (`carriedMac`), no mesmo commit atômico. A não guarda cópia em outro lugar |
| Compactação | 128 linhas |
| Âncora | `{version, docMac, carriedSeq}`; o `carriedSeq` detecta um blob carregado mais antigo **na mesma versão** (`RECORD_ROLLED_BACK`). Uma porta nativa que guarde só `{version, docMac}` está errada |
| Reinicialização do processo | o perfil é relido do store + âncora (prova Node entre processos em `Facade/test/hr5-concurrency.test.mjs`; a prova nativa é de A) |
| Mudança de plano | o perfil sobrevive a reabrir, revisar, `restart` e `accept` (QRE-HR5R-02/05); um intake com registro carregado é recusado; `heartRateProfile` no intake é anexado como linha |
| Apagamento de fatos de saúde | leituras nulas ficam nulas depois de uma escrita de FC (QRE-HR5R-01) |
| Apagamento da conta | o registro inteiro vai junto; A remove store, âncora e chave |

## 4. Concorrência — o que A implementa

O risco aceito do V1HR5R ("dois processos, mesmo store, commit carregado à mesma versão") foi **reproduzido** e o contrato de proteção foi **modelado** em `ios/Packages/CoachingPresentation/Facade/test/hr5-concurrency.test.mjs` (Node, 5/5):

1. **A corrida existe:** dois escritores que leram antes de qualquer commit, à mesma versão; o CAS por versão deixa o segundo sobrescrever e a âncora (`carriedSeq` igual) não vê: a máxima 195 some sem aviso.
2. **Já protegido:** um escritor que lê **depois** do commit do outro é recusado pela âncora (`RECORD_ROLLED_BACK`).
3. **O guarda exigido:** lock por atleta do load ao commit + commit que compara os **bytes** carregados → o escritor atrasado recebe `CONFLICT_STALE_VERSION`, nada se perde; o retry com leitura nova mantém as duas declarações; o mesmo id → `replayed`.

**Obrigações de A** (handoff A §HR5):

| Proteção | Implementação exigida |
|---|---|
| Serialização por atleta | uma fila serial do motor no processo **e** `flock`/`fcntl` no arquivo do atleta, mantido do `load` ao `commit` da operação inteira (vale entre processos: app + extensão futura) |
| Gravação atômica | tmp + fsync + rename + fsync do diretório; sucesso só depois do rename |
| Controle de versão | o commit do store compara o digest dos bytes lidos (ou `carried.seq` + `docMac`), não só `version`; diferente → `{ok:false, conflict:true}` |
| Recuperação após falha | `.tmp`/`.lock` limpos na partida; morto depois do rename → retry com o mesmo id responde `replayed`; antes → o registro anterior, regravado; âncora por `SecItemUpdate`, nunca apagar antes de adicionar |
| Duplicatas | idempotência por `clientRequestId`; reuso com outro conteúdo → `CONFLICT_IDEMPOTENCY_KEY` (bug do app, nunca retry) |
| Não sobrescrever registro recente | o guarda acima + o retry do handoff §7 (reler, refazer, **novo** id) |

**Testes obrigatórios de A:** (a) dois processos macOS disputando `setHeartRateProfile` no mesmo store nativo: nenhuma declaração perdida em 200 rodadas; (b) **persistência entre processos** (pendência da validação física): processo 1 grava o perfil no store nativo + âncora no Keychain e termina; processo 2 novo lê `presentation()` e vê `ATHLETE_DECLARED_MAXIMUM` 195; repetir no iPhone pela trava; (c) rollback do blob carregado à mesma versão → `RECORD_ROLLED_BACK` com a âncora nativa.

## 5. Estado

| Item | Estado |
|---|---|
| Contratos das duas operações prontos para A e C | **SIM** (tipos Swift, fixtures reais, e2e na fronteira real) |
| Zonas só do motor | **SIM** (nenhum percentual em Swift/JS desta linha; `timeInZones` usa as zonas e o classificador do motor) |
| Proteção de concorrência definida e modelada | **SIM**; implementação nativa = A |
| Persistência entre processos | **provada em Node**; prova nativa = obrigação de A |
