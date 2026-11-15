# V1 Run Extensions — Fase A: freeze aditivo V1RWS-1 (2026-11-15)

Registro do freeze `COACHINGCORE-V1-RUN-FORMAT-FREEZE-1`. Fica fora de `phase-a/` porque o freeze amarra todo arquivo daquela pasta: um arquivo novo lá daria deriva no `--check`.

**É o freeze de um candidato sintético aprovado com condições.** Não autoriza atleta real, integração nem produção. O estado, os vereditos e as condições abertas estão em `phase-a/PHASE_A_LINEAGE_FIX_FORWARD_CLOSURE.md`.

## O freeze

| | |
|---|---|
| Revisão | `COACHINGCORE-V1-RUN-FORMAT-FREEZE-1` |
| Arquivo | `CoachingCore/v1/RUNTIME_FREEZE_V1RWS_1.json`, sha256 `a3ca14a520491c47cbc75a28664da5aa94b7e357ba0192edd08920605a8821d1` |
| Commit amarrado | `f1177c8950d495dd46469eb56a9f34061e1aff65` |
| Arquivos acrescentados amarrados | 97, digest `d48c6bcc0534a8c122ea0ef61a1c9def495bac1ec622713bd3359ecf5e869661` |
| Ponto de entrada | `CoachingCore/src/v1-run-format-index.mjs` (sobre `v1-run-index`, sobre `v1-index`) |
| Valores | `CoachingCore/v1/RUN_FORMATS_V1.json`, sha256 `26c6e3fbfeee864376643c485d64a616f1cf13ea49d82b2cc223c02d7a06353c` |
| Fronteira ligada por registro independente | `V1X-RUN-NATIVE` |
| Registro habilitador | `phase-a/reviews/ssctr/SSCTR_V1RWS_RUN_RECORDS.json`, sha256 `a5b915c66f942e17e5e3eb39ef187921e4e65684866c7687af4f6997d44cbf02`, emitido pelo juiz SSCTR |

## O runtime congelado é o julgado

O commit amarrado, `f1177c8`, acrescenta ao candidato julgado só pareceres, o registro habilitador e o encerramento. `git diff --name-only 4b1622f f1177c8 -- CoachingCore` é vazio: `CoachingCore/` é byte a byte o de `4b1622f`.

## Preservação dos freezes anteriores

Conferida pelo próprio script, na escrita e no `--check`:

| Freeze anterior | Resultado |
|---|---|
| `COACHINGCORE-V1-FREEZE-1` | 197 de 197 arquivos byte a byte |
| O arquivo emendado, `CoachingCore/src/r6-adaptation.mjs` | a base é a que o freeze anterior gravou; os bytes são os autorizados (`6cedcb72…6e50`); o diff é o autorizado, só o leitor, 22 linhas a mais e 10 a menos |
| `COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1` | 30 de 30 arquivos byte a byte |

Nenhum registro, verificador ou teste de freeze anterior foi editado.

## Suítes, rodadas pelo script na escrita, com a fronteira ligada pelo registro

| Execução | Resultado |
|---|---|
| Conjunta | 1442 de 1443. **Uma falha**, pelo nome: `V1RC COACHINGCORE-V1-FREEZE-1 is preserved: every file it binds is byte-identical here`. É o verificador histórico da V1RC escrito como teste; acusa o arquivo emendado, por desenho, e não foi editado. Ele passa 30 de 30 no seu snapshot `c8104c1`. **A suíte conjunta não é verde nesta linha** |
| Testes da extensão | 108 de 108, em 9 arquivos |

O script recusa escrever se a única falha da conjunta não for esse teste, ou se algum teste da extensão falhar.

## `--check`

`node scripts/v1rws-freeze.mjs --check 1`, exit 0, depois do commit deste arquivo e do registro do freeze:

```
COACHINGCORE-V1-RUN-FORMAT-FREEZE-1: 97 added files match; 1 amended file matches its recorded diff (22+/10-); COACHINGCORE-V1-FREEZE-1 preserved 197/197; COACHINGCORE-V1-RUN-CALIBRATION-FREEZE-1 preserved 30/30
```

## Commits desta missão (linha `claude/v1-run-extensions`, nada enviado)

| Commit | O quê |
|---|---|
| `5bd8c2d` | O diagnóstico de linhagem, incorporado por fast-forward |
| `4b1622f` | O candidato julgado |
| `b624189` | Os três pareceres, como recebidos |
| `f1177c8` | O registro habilitador, o adendo do SSCTR e o encerramento; é o commit que o freeze amarra |
| (este) | O registro do freeze e este arquivo |

## O que o freeze não diz

- Não fecha nenhuma condição. As abertas estão no encerramento, seção 3: QRE-RWS-E-01 (no Core), o hard gate de integração E-1 (não atendido), as duas vozes lidas como um autor, e as de custódia e privacidade.
- Uma correção do QRE-RWS-E-01 muda o runtime julgado: pede nova revisão e um freeze novo (`--write 2`). Um registro de freeze nunca é reescrito.
- O registro habilitador vale para os bytes de `4b1622f`. Uma mudança de runtime pede que o SSCTR o confirme ou o retire.
