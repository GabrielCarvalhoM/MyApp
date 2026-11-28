# Handoff de incremento

O estado mora no GitHub, não na conversa. O fundador nunca copia relatórios entre sessões.

## Ao começar

```bash
git fetch origin --prune --tags
node tools/orchestration/status.mjs          # o que está em andamento, bloqueado, pronto
node tools/orchestration/board.mjs show <issue>
node tools/orchestration/board.mjs set <issue> --status "In Progress"
```

## Ao terminar um incremento

1. Testes da issue + `guard.mjs` + os gates da [QUALITY_GATES.md](QUALITY_GATES.md) que tocam o seu código.
2. Commit, push da branch do incremento, PR com o template (`Issue: #n`).
3. `board.mjs set <issue> --status "In Review"` e `board.mjs evidence <issue> "<link>"` (run do CI, manifest, screenshot).
4. Responda na conversa (e como comentário no PR) **só** com o relatório abaixo. Links, não logs.

```markdown
**Incremento** #<issue> · `<branch>` @ `<commit>` · PR #<n>
- Implementado: <1–3 linhas>
- Testes: <comando → resultado>, … (CI: <link>)
- Build/simulador: <sim.sh … → manifest> · iPhone: <não se aplica | with-device … → resultado>
- Validação: Não validado | Simulador | iPhone | Dados reais
- Bloqueios: <nenhum | #n / decisão>
- Próximo incremento sugerido: #<n> <título>
```

## Tarefas descobertas

Encontrou trabalho fora do escopo do incremento? Não o faça escondido no mesmo PR: `board.mjs create …` (com `--new-scope` se for
escopo novo ou decisão de produto) e cite a issue no relatório.
