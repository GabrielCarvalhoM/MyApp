# Engenharia RepMile V1 — ponto de entrada para agentes

Leia isto em 2 minutos. O resto você abre quando precisar.

| Preciso de… | Onde está |
|---|---|
| **Specs, escopo, arquitetura, retomada** | [`specs/v1/INDEX.md`](../../specs/v1/INDEX.md) · checkpoint [`specs/v1/CONTINUITY.md`](../../specs/v1/CONTINUITY.md) · padrão iOS [`specs/v1/ARCHITECTURE.md`](../../specs/v1/ARCHITECTURE.md) |
| **Contratos** | `audits/v1-parallel-foundation-2026-11-24/PARALLEL_IMPLEMENTATION_CONTRACT.md` (rev. 2: §10 arquivos, §11 mudança de contrato, §12 pendências, §13 integração); tipos em `ios/Packages/IntegrationContracts` e `ios/Packages/CoachingPresentation` |
| **Handoff da minha frente** | `audits/v1-abc-foundation-consolidation-2026-11-26/{A_COACHINGHOST,B_HEALTHKIT,C_SWIFTUI}_HANDOFF.md`; ownership por tema: `OWNERSHIP_MATRIX.md` |
| **Backlog e estado** | Quadro do GitHub Projects "RepMile — Product & Engineering" (campo Status = verdade); `node tools/orchestration/status.mjs` resume tudo |
| **Branch certa** | `claude/v1-ios-coachinghost` (A) · `claude/v1-ios-healthkit` (B) · `claude/v1-ios-swiftui` (C) · `claude/v1-figma-final-alignment` (Figma) · `claude/v1-ios-integration` (integração, futura). Incremento: `<branch-da-frente>-i<issue>-<slug>` |
| **Testes** | [QUALITY_GATES.md](QUALITY_GATES.md). CoachingCore: `npm test` (nunca `node --test` bruto). Swift: `tools/orchestration/swift-packages.sh`. App: `tools/orchestration/sim.sh` |
| **Regras de integração** | [INTEGRATION_PROTOCOL.md](INTEGRATION_PROTOCOL.md) |
| **Como trabalhar e mudar estado** | [WORKFLOW.md](WORKFLOW.md) |
| **O que entregar ao fim de um incremento** | [AGENT_HANDOFF.md](AGENT_HANDOFF.md) |
| **Comparar com o Figma** | [VISUAL_VALIDATION.md](VISUAL_VALIDATION.md) |

## Cinco regras que não mudam

1. Você escreve só na coluna da sua frente (contrato §10). `node tools/orchestration/guard.mjs` diz se o seu diff está limpo; o CI roda o mesmo.
2. Contrato compartilhado, CoachingCore e governança não se editam: propõe-se (`CCP-<frente>-NN`, contrato §11).
3. Implementado ≠ validado. "Verified" no quadro exige o campo Validação (Simulador / iPhone / Dados reais) e evidência.
4. iPhone só pela trava: `tools/device-lock/with-device.sh <sessão> [--wait] -- <comando>`. Simulador e iPhone nunca se misturam num relatório.
5. Escopo novo ou decisão de produto: crie a tarefa com `--new-scope`; ela espera o fundador.

## Comandos

```bash
node tools/orchestration/status.mjs                      # estado da construção (git + Issues + PRs + CI + quadro)
node tools/orchestration/guard.mjs                       # meu diff respeita a matriz de ownership?
node tools/orchestration/board.mjs set 42 --status "In Progress"
node tools/orchestration/board.mjs evidence 42 "<link do run>" --validation Simulador
node tools/orchestration/board.mjs create --title "[C] …" --body-file nota.md --type Bug\ Fix --area "iOS Frontend" --front C --priority P1 --release V1
tools/orchestration/sim.sh all                           # build → simulador → screenshot → testes → manifest.json
node tools/orchestration/swift-size.mjs                  # limite de 350 linhas por arquivo Swift (legado inventariado só avisa)
tools/orchestration/viewer.sh                            # worktree de visualização do fundador = última integração validada (Xcode)
```
