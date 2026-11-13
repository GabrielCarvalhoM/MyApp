# V1 Run Extensions — ponto de partida do Fable 5.2 (2026-11-13)

**Autor:** Chief (Opus 5.5), preparação operacional. Nenhum código, freeze, verificador, decisão SSCTR ou Figma alterado.

## Ambiente
- Branch `claude/v1-run-extensions`, worktree `.claude/worktrees/v1-run-extensions`. Não fazer push nem merge.
- Base antes deste registro: `2818d5e` (Athlete Data Foundation, incorporado por `cherry-pick --ff` sobre `ce4f136`: mesmo commit, mesma procedência; o branch de origem não foi tocado).
- Strength Intelligence Foundation (`879f23f`) **não** está nesta linha: etapa própria depois das extensões de corrida.

## Baseline S1 (executado em 2026-11-13, Node v24.19.0)
| Verificação | Onde | Resultado |
|---|---|---|
| `node --test` em `CoachingCore/` | linha comum | **1334/1334** (0 fail, 0 skipped) |
| `v1fc-freeze.mjs --check 1` | worktree `v1-final-closure` (`981a8f6`, limpo) | COACHINGCORE-V1-FREEZE-1: 198 files match |
| `v1rc-freeze.mjs --check 1` e `--preserved` | worktree `v1-run-calibration` (`c8104c1`, limpo) | 30 added files match; V1-FREEZE-1 preservado 198/198 |
| `v1rc-freeze.mjs --check 1` | linha comum | idêntico (30/30, 198/198) |
| `CoachingCore/` vs `c8104c1`; handoffs vs `0010e7c`/`9ffe163` | linha comum | `git diff` vazio |
| `probe-athlete-data.mjs` (da raiz) | linha comum | 32/32 |

Ambiente: a primeira execução falhou em 4 arquivos (`r4-coaching`, `review-regressions`, `runtime`, `schema`) com `ERR_MODULE_NOT_FOUND: ajv`, porque o worktree não tinha `node_modules` (ignorado pelo Git). Como `package-lock.json` é byte a byte igual ao do snapshot, `node_modules` foi copiado do worktree `v1-run-calibration` (ajv 8.20.0). Nenhum arquivo versionado mudou. Nenhum teste ou verificador foi alterado.

## Ordem de leitura
1. `audits/v1-run-extensions-2026-11-13/PREFLIGHT_V1_RUN_EXTENSIONS.md` (§0, §1, §4, §7, §8).
2. `audits/v1-run-workout-structure-2026-11-13/HANDOFF_RUN_WORKOUT_STRUCTURE.md` (r3 + r3a) e `ssctr/SSCTR_RWS_*` (R2, R3, R3A).
3. `audits/v1-athlete-data-foundation-2026-11-13/ATHLETE_DATA_FOUNDATION.md` §6 (entra na fase A, depois do V2 e antes do freeze `V1RWS-1`).
4. Só na fase B: `audits/v1-race-forecast-2026-11-13/HANDOFF_RACE_FORECAST.md` e `ssctr/SSCTR_RFC_DECISION_R2.*`.

## Fase A = RWS §12 + Athlete Data Foundation §6
- Primeira alteração de código autorizada: RWS §12 passo 2, em arquivos novos (`src/v1-run-format.mjs`, `src/v1-run-format-index.mjs` com `safely`; T1, T2, T9 parcial). Logo depois, o T3 em código de teste, antes de qualquer emenda.
- Única emenda de arquivo existente: `src/r6-adaptation.mjs` (passo 3b, V1). O passo 1 da RWS (“worktree de c8104c1”) é cumprido por esta linha.
- Athlete Data Foundation na fase A: `src/v1-run-history.mjs`, `runHistoryRecord` append-only, L30 com distância e data, deduplicação `canonicalActivityId` → `source.activityId` → `mergedSourceIds` (a linha do motor vence), SC-6, seletor lendo L30/`comparableLongRun`, testes **H1–H6 e H8** e T3 estendido (`actual.sport`).
- O §6.5 do contrato diz “H1–H8”, mas a própria linha do H7 o marca como fase B: H7 e **H9** (experiência desconhecida → G de EXPERIENCED) ficam na fase B, sem implementação agora.

## Parada imediata
S1–S10 do preflight §7, em especial: S2 (T3 falha), S3/S4 (emenda além de `r6-adaptation.mjs` ou saída com flag desligada não idêntica), S7 (divergência de exemplo SSCTR é achado, nunca ajuste), S8 (editar `v1-index`, `v1-run-index`, `v1-run-calibration`, valores V1RC, freezes ou verificadores existentes). Também: `factsFromLedger` exigir arquivo congelado para obter o esporte (contrato §6, parada).

## Não bloqueiam a fase A
Persistência de `runEvidenceRecord`/`runFormatRecord`/`runHistoryRecord` na custódia (G7, Data + Security); adaptador iOS/HealthKit; copy e fluxos ASK (Product); PD-1..PD-3 do SSCTR; D1–D7 da RFC; condições V1RC e R-11; registros SSCTR habilitadores (vêm depois de cada revisão); fila em 235; V1 authority NO.
