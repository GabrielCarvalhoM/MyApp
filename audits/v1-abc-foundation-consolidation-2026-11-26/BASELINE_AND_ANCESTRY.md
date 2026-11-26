# Baseline e ancestralidade — consolidação final da fundação A+B+C

**Data:** 2026-11-26 · Mac mini M4 · macOS 27.0 · Node v24.19.0 · Swift 6 (Xcode) · todos os atletas e registros sintéticos.

## 1. Sincronização

- `git fetch origin --prune --tags` executado antes de qualquer mudança.
- `git worktree list --porcelain`: 10 worktrees, todas **limpas** (`git status --short` vazio), stash vazio.

| Branch | Local | `origin` | Esperado pela missão | Ancestral de `claude/v1-test-suite-sanitization`? |
|---|---|---|---|---|
| `claude/v1-cc-final-physical` | `a7e2e24` | `a7e2e24` | `a7e2e24` | sim |
| `claude/v1-parallel-foundation` | `077f031` | `077f031` | `077f031` | sim |
| `claude/v1-ui-functional-reconciliation` | `476b657` | `476b657` | `476b657` | sim |
| `claude/v1-five-zone-heart-rate` | `4850560` | `4850560` | `4850560` | sim |
| `claude/v1-hr5-runna-parity` | `90452b8` | `90452b8` | `90452b8` | sim |
| `claude/v1-test-suite-sanitization` | `237797c` | `237797c` | `237797c` | — (é a base) |
| `claude/v1-ios-coachinghost` (A) | `8d2a7c0` | `8d2a7c0` | — | sim, sem commits próprios |
| `claude/v1-ios-healthkit` (B) | `8d2a7c0` | `8d2a7c0` | — | sim, sem commits próprios |
| `claude/v1-ios-swiftui` (C) | não existia | não existia | — | — |
| `claude/v1-abc-foundation-consolidation` | não existia | não existia | — | — |

Tag existente: `v1-parallel-base-2026-11-24` → `8d2a7c0`. Nenhuma tag `v1-abc-ready-*` existia.

**Linha da base:** `237797c` contém, por ancestralidade, a reconciliação de UI (`476b657`), a primeira HR5 (`4850560`, AMENDMENT-1 em `bec39c5`), a HR5 Runna (`9a88521` AMENDMENT-2, `465e7c8`, `90452b8` iPhone) e o saneamento (`2a865f8` SANITIZATION-2, `f586af0`, `237797c`). Os registros de emenda estão nos seus commits: `CoachingCore/v1/FINAL_RELEASE_FREEZE_V1.json` (`6482749`), `FIVE_ZONE_AMENDMENT_V1.json` (`bec39c5`), `HR5_RUNNA_AMENDMENT_V1.json` (`9a88521`), `audits/v1-test-suite-sanitization-2026-11-25/HISTORICAL_LAYER_RECORD.json` (`2a865f8`).

## 2. Isolamento

- Worktree nova: `~/.codex/worktrees/myapp-v1-abc-foundation/MyApp`, branch nova `claude/v1-abc-foundation-consolidation` criada de `237797c`.
- Nenhuma branch existente foi editada nesta fase; nenhum reset, rebase ou force-push.

## 3. Baseline executado antes de qualquer mudança

| Verificação | Resultado | Evidência |
|---|---|---|
| `cd CoachingCore && npm test` (suíte vigente, política de testes históricos) | **ACTIVE SUITE: 1952 ativos, 1952 passam, 0 falham. HISTORICAL: 53/53 falham no ponto declarado.** node reportou 2013 entradas (8 helpers). 2 min 56 s | `evidence/baseline-npm-test.txt` |
| `swift test` em `ios/Packages/IntegrationContracts` | **7 testes, 0 falhas** | `evidence/baseline-swift-integration-contracts.txt` |
| Cadeia HR5 | `v1hr5-five-zones`, `v1hr5r-boundary`, `v1hr5r-successors` e `v1san-runtime-integrity` dentro da suíte ativa, todos verdes; o runtime está preso aos bytes da AMENDMENT-2 | idem |
| Verificador `v1-hr5-runna-amendment.mjs --check` | falha **só** no passo "nothing else changed", nomeando só os 9 arquivos de infraestrutura de testes do saneamento — o comportamento declarado em `audits/v1-test-suite-sanitization-2026-11-25/FINAL_REPORT.md` §5 | saída na sessão |

**Critério de qualidade usado:** `npm test` (uma execução sem filtro, contabilizada por junit). A contagem bruta de `node --test` não foi usada como critério (política §1).

## 4. Estado das worktrees A e B

Ambas limpas, em `8d2a7c0` = `origin`, sem commits próprios, ancestrais da nova base: elegíveis para fast-forward puro (ver `PARALLEL_BRANCH_STRATEGY.md`).
