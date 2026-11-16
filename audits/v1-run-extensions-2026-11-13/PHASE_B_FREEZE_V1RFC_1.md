# V1 Run Extensions — freeze aditivo V1RFC-1: Race Forecast + Pace Insights (2026-11-16)

Registro do freeze `COACHINGCORE-V1-RACE-FORECAST-FREEZE-1`. É aditivo ao V1RWS-2: **não emenda nenhum arquivo** e não substitui, reescreve nem flexibiliza nenhum freeze anterior.

**É o freeze de um candidato sintético aprovado com condições**: a previsão de prova e os insights de ritmo, observacionais. Não autoriza atleta real, integração nem produção. O estado, os vereditos, as condições abertas e o contrato de dados do aplicativo estão em `phase-b/PHASE_B_CLOSURE.md`.

Este arquivo fica fora de `phase-b/` de propósito: o freeze amarra todo arquivo rastreado daquela pasta. **Nunca acrescentar nem editar um arquivo em `phase-b/`** (o `--check` acusaria `DRIFT`).

## O freeze

| | |
|---|---|
| Revisão | `COACHINGCORE-V1-RACE-FORECAST-FREEZE-1` |
| Arquivo | `CoachingCore/v1/RUNTIME_FREEZE_V1RFC_1.json`, sha256 `1ea971dc516014fd730975b0eddabf0cfa18173c826eac80b8dc39a69caeca3e` |
| Commit amarrado | `4f0561b4196c3afd618e5ca7fdb57f29c6296081` |
| Arquivos acrescentados amarrados | 163, digest `a9d985d040b8e717dce2b848e883539b2ca65491989271cefb5afceb3ebd9df6` |
| Arquivo emendado | nenhum |
| Ponto de entrada | `CoachingCore/src/v1-run-forecast-index.mjs` (sobre `v1-run-format-index`, sobre `v1-run-index`, sobre `v1-index`) |
| Valores | `CoachingCore/v1/RACE_FORECAST_EXTENSION_V1.json`, sha256 `eae0111744d904211963ecc76a964a59d214dd84c541c9ac799480fd3f3de840` (o objeto `values` da SSCTR-RFC-DECISION-r2) |
| Fronteiras ligadas por registro independente | `V1X-RUN-FORECAST`, `V1X-PACE-INSIGHTS` |
| Fronteira desligada | `V1X-PACE-REVISION` |
| Registros habilitadores | `phase-b/reviews/ssctr/SSCTR_V1RFC_RUN_RECORDS.json`, sha256 `a1274c5c0d83dd19ac40dfe35a059e2ccf803afdf9fdb4e6b080c701b673b8a6`, emitidos pelo juiz SSCTR |
| Aditivo a | `COACHINGCORE-V1-RUN-FORMAT-FREEZE-2` (`RUNTIME_FREEZE_V1RWS_2.json`, `a4d8b890…41ad`) |

Escrito por `scripts/v1rfc-freeze.mjs --write 1 --commit 4f0561b`, que roda as suítes por conta própria e recusa escrever se algo além do teste histórico falhar.

## O runtime congelado é o julgado

Os registros habilitadores amarram, por hash, os quatro arquivos de runtime como estão em `0d3015b`, o commit que os três juízes reverificaram. Entre `0d3015b` e o commit amarrado (`4f0561b`), em `CoachingCore/` mudou só `scripts/v1rfc-freeze.mjs` (o verificador, não o runtime): `git diff --name-only 0d3015b 4f0561b -- CoachingCore` dá esse arquivo e nenhum outro.

| Arquivo de runtime | sha256 |
|---|---|
| `src/v1-race-forecast.mjs` | `8ab1815b16e27092774a12d2666011d99cded5b1364db1fe57cda86e2bc4a92e` |
| `src/v1-pace-insights.mjs` | `9b18063c5b2b77511d677b2afcec4d37392e39b39067d5284b4b1fe553c0fd7b` |
| `src/v1-run-forecast-index.mjs` | `b57c1c16a380f3b22eb8ee01a9ce7dc3230ae232c93816a433e6d16f73f5c5bd` |
| `v1/RACE_FORECAST_EXTENSION_V1.json` | `eae0111744d904211963ecc76a964a59d214dd84c541c9ac799480fd3f3de840` |

**A guarda do verificador foi acrescentada depois da reverificação e não foi julgada de novo.** Os três juízes a pediram: o verificador recusa escrever e acusa `DRIFT` se o arquivo de registros tiver qualquer registro de `V1X-PACE-REVISION`.

## A revisão de ritmo dentro destes bytes

O registro do freeze diz, no campo `paceRevision`: `IMPLEMENTED_OFF_NOT_APPROVED`, `failsClosed: false`, `enablingRecord: NONE_VALID_OVER_THESE_BYTES`.

- O código da revisão de limiar confirmada pelo atleta está nos arquivos amarrados. Está desligado, **não está aprovado e não falha fechado**. "Desligado por padrão" não é uma afirmação de segurança.
- Nenhum registro habilitador de `V1X-PACE-REVISION` é válido sobre estes bytes.
- Fechar qualquer condição dela (lista em `phase-b/PHASE_B_CLOSURE.md`, seção 2) muda arquivos amarrados: pede código novo, nova revisão e **freeze sucessor** (`--write 2`).

## Preservação dos freezes anteriores

| Freeze anterior | Resultado |
|---|---|
| `COACHINGCORE-V1-RUN-FORMAT-FREEZE-2` | Pelo verificador dele, sem edição, rodado pelo verificador da fase B nesta árvore: 98 arquivos conferem; o arquivo emendado confere com o diff registrado (22+/10-). No snapshot dele (`f32a711`): `--check 2` exit 0 |
| `COACHINGCORE-V1-FREEZE-1` | 197 de 197 arquivos byte a byte (pelo verificador do V1RWS-2); 198 de 198 no snapshot `c8104c1` |
| `COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1` | 30 de 30 byte a byte; `--check 1` exit 0 no snapshot `c8104c1` |
| `COACHINGCORE-V1-RUN-FORMAT-FREEZE-1` (V1RWS-1) | `--check 1` exit 0 no snapshot dele (`08d2dc8`) |
| Fora da extensão | Nada em `CoachingCore/` (fonte, valores, testes, scripts) mudou desde o commit que o V1RWS-2 amarra, além dos arquivos da fase B |

Nenhum registro, verificador ou teste de freeze anterior foi editado.

## Suítes, rodadas pelo script na escrita, com as duas fronteiras ligadas pelos registros

| Execução | Resultado |
|---|---|
| Conjunta | 1534 de 1535. **Uma falha**, pelo nome: `V1RC COACHINGCORE-V1-FREEZE-1 is preserved: every file it binds is byte-identical here`. É o verificador histórico da V1RC escrito como teste; acusa o arquivo que a fase A emendou, por desenho, e não foi editado; é verde no snapshot dele (`c8104c1`). **A suíte conjunta não é verde nesta linha** |
| Testes da extensão | 85 de 85, em 6 arquivos |

## `--check`

`node scripts/v1rfc-freeze.mjs --check 1`, exit 0:

```
COACHINGCORE-V1-RACE-FORECAST-FREEZE-1: 163 added files match; no amended file; COACHINGCORE-V1-RUN-FORMAT-FREEZE-2 preserved (COACHINGCORE-V1-RUN-FORMAT-FREEZE-2: 98 added files match; 1 amended file matches its recorded diff (22+/10-); COACHINGCORE-V1-FREEZE-1 preserved 197/197; COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1 preserved 30/30)
```

**Limites do registro** (Quality, QRE-RFC-A-10): ele amarra a pasta `phase-b/` inteira e a de evidências da simulação; não enxerga arquivos não rastreados; e o runtime liga uma fronteira conferindo só o hash dos valores (a amarração aos bytes está nos registros do SSCTR e neste freeze).

## O que o freeze não diz

- Não fecha nenhuma condição. As abertas estão no encerramento, seções 2 e 3: a revisão de ritmo inteira; os limiares da simulação de sanidade **não atingidos**; QRE-RFC-B-02 (restart no mesmo dia); a frequência da retirada dentro da semana; custódia com chave (SEC-RFC-B-01, B-02); QRE-RWS-F-01; o hard gate E-1 (não atendido); as duas vozes.
- Não afirma cobertura nem acurácia de nenhuma faixa.
- Não inicia integração. O contrato de dados do aplicativo está no encerramento, seção 5.
- Um registro de freeze nunca é reescrito.
