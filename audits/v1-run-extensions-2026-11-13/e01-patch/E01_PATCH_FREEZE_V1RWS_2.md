# V1 Run Extensions — freeze aditivo sucessor V1RWS-2, com o patch do QRE-RWS-E-01 (2026-11-15)

Registro do freeze `COACHINGCORE-V1-RUN-FORMAT-FREEZE-2`. É o sucessor aditivo do V1RWS-1, que **não foi substituído, reescrito nem flexibilizado**: o registro dele tem os mesmos bytes (`a3ca14a5…`) e ele continua conferindo no seu próprio snapshot.

**É o freeze de um candidato sintético aprovado com condições.** Não autoriza atleta real, integração nem produção. O estado, os vereditos e as condições abertas estão em `E01_PATCH_CLOSURE.md`, nesta pasta.

## O freeze

| | |
|---|---|
| Revisão | `COACHINGCORE-V1-RUN-FORMAT-FREEZE-2` |
| Arquivo | `CoachingCore/v1/RUNTIME_FREEZE_V1RWS_2.json`, sha256 `a4d8b8900c18c34166230f41d1b0e478d7d7dca2422ec61169ad10b9d0f641ad` |
| Commit amarrado | `3ce14d41d83ec25b5a51982d2a0d9563fcd248a0` |
| Arquivos acrescentados amarrados | 98, digest `ea015957e52a31376d14087ad6f710e17807a3478e67f6b320b3d83d1046b5a8` |
| Ponto de entrada | `CoachingCore/src/v1-run-format-index.mjs` (sobre `v1-run-index`, sobre `v1-index`) |
| Valores | `CoachingCore/v1/RUN_FORMATS_V1.json`, sha256 `26c6e3fbfeee864376643c485d64a616f1cf13ea49d82b2cc223c02d7a06353c`, sem mudança |
| Fronteira ligada por registro independente | `V1X-RUN-NATIVE` |
| Registro habilitador | `phase-a/reviews/ssctr/SSCTR_V1RWS_RUN_RECORDS.json`, sha256 `a5b915c6…`, sem mudança |
| Confirmação do registro para os bytes do patch | `e01-patch/reviews/ssctr/SSCTR_V1RWS_E01_PATCH_RECORD_CONFIRMATION.json`, sha256 `1b55ca02528259a5c8c6555bde5c6cc23132f7dae911a9bb0b068f8f29ce4531`, emitida pelo juiz SSCTR |

O registro foi escrito pelo script do próprio V1RWS-1 (`scripts/v1rws-freeze.mjs --write 2`), sem editar o script: ele é o verificador de um freeze histórico.

## O que difere do V1RWS-1

Comparando as listas de arquivos dos dois registros, diferem exatamente três:

| Arquivo | V1RWS-1 | V1RWS-2 |
|---|---|---|
| `CoachingCore/src/v1-run-format.mjs` | `419cac2d…` | `e8f364e3…` |
| `CoachingCore/src/v1-run-history.mjs` | `50f178e2…` | `06deb84c…` |
| `CoachingCore/test/v1rws-e01.test.mjs` | não existia | `0fb768e7…` |

Os outros 95 arquivos, a autoridade amarrada, o arquivo emendado (`r6-adaptation.mjs`, `6cedcb72…`) e o diff autorizado dele são os mesmos.

**Limite do registro:** o script amarra por hash só os caminhos que ele já conhecia. A pasta `e01-patch/` (o registro do autor, os pareceres, a confirmação do SSCTR, o encerramento e este arquivo) fica amarrada pelo commit, não pela lista de arquivos.

## O runtime congelado é o julgado

O commit amarrado, `3ce14d4`, acrescenta ao candidato julgado só os pareceres, a confirmação do registro e o encerramento. `git diff --name-only f8b08aa 3ce14d4 -- CoachingCore` é vazio: `CoachingCore/` é byte a byte o de `f8b08aa`.

## Preservação dos freezes anteriores

Conferida pelo script, na escrita e no `--check`:

| Freeze anterior | Resultado |
|---|---|
| `COACHINGCORE-V1-FREEZE-1` | 197 de 197 arquivos byte a byte |
| O arquivo emendado, `CoachingCore/src/r6-adaptation.mjs` | a base é a que o freeze anterior gravou; os bytes são os autorizados; o diff é o autorizado, só o leitor, 22 linhas a mais e 10 a menos |
| `COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1` | 30 de 30 arquivos byte a byte |
| `COACHINGCORE-V1-RUN-FORMAT-FREEZE-1` (V1RWS-1) | `--check 1` **exit 0 no snapshot dele** (clone em `08d2dc8`): 97 arquivos conferem. Nesta árvore dá `DRIFT` e nomeia só os três arquivos da tabela acima: é o esperado, e mostra que ele não foi flexibilizado |

Nenhum registro, verificador ou teste de freeze anterior foi editado.

## Suítes, rodadas pelo script na escrita, com a fronteira ligada pelo registro

| Execução | Resultado |
|---|---|
| Conjunta | 1448 de 1449. **Uma falha**, pelo nome: `V1RC COACHINGCORE-V1-FREEZE-1 is preserved: every file it binds is byte-identical here`. É o verificador histórico da V1RC escrito como teste; acusa o arquivo emendado, por desenho, e não foi editado. **A suíte conjunta não é verde nesta linha** |
| Testes da extensão | 114 de 114, em 10 arquivos |

O script recusa escrever se a única falha da conjunta não for esse teste, ou se algum teste da extensão falhar.

## `--check`

`node scripts/v1rws-freeze.mjs --check 2`, exit 0:

```
COACHINGCORE-V1-RUN-FORMAT-FREEZE-2: 98 added files match; 1 amended file matches its recorded diff (22+/10-); COACHINGCORE-V1-FREEZE-1 preserved 197/197; COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1 preserved 30/30
```

## Commits desta missão (linha `claude/v1-run-extensions`, nada enviado)

| Commit | O quê |
|---|---|
| `f8b08aa` | O candidato julgado |
| `7ed0158` | Os pareceres e a confirmação do registro, como recebidos |
| `3ce14d4` | O encerramento; é o commit que o freeze amarra |
| (este) | O registro do freeze e este arquivo |

## O que o freeze não diz

- Não fecha nenhuma condição. As abertas estão no encerramento, seção 3: QRE-RWS-F-01, SSCTR-RWS-F-01 a F-03, o hard gate de integração E-1 (não atendido), as duas vozes e as de custódia e privacidade.
- Não inicia o Race Forecast. O contrato de entrada dele está no encerramento, seção 5.
- Um registro de freeze nunca é reescrito. Uma mudança de runtime pede nova revisão e um freeze novo (`--write 3`).
