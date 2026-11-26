# Estratégia de branches e worktrees A · B · C

## 1. Base comum

- Branch da fundação: **`claude/v1-abc-foundation-consolidation`**, criada de `237797c` (suíte saneada), publicada no `origin`.
- Tag imutável da base: **`v1-abc-ready-2026-11-26`** (anotada), no commit de fechamento desta missão (o que acrescenta o `FINAL_REPORT.md`); `git rev-parse v1-abc-ready-2026-11-26^{commit}` dá o hash.
- A base descende de `237797c` → `90452b8` → `9a88521` (AMENDMENT-2) → `bec39c5` → `476b657` → `077f031`/`8d2a7c0` → `6482749` (freeze). Nenhum commit anterior foi reescrito.

## 2. As três frentes

| Frente | Branch | Worktree | Como chega à base |
|---|---|---|---|
| A · CoachingHost | `claude/v1-ios-coachinghost` | `~/.codex/worktrees/myapp-v1-ios-coachinghost/MyApp` | estava em `8d2a7c0`, limpa, sem commits próprios, ancestral da base → **`git merge --ff-only v1-abc-ready-2026-11-26`** (fast-forward puro; push sem force) |
| B · HealthKit | `claude/v1-ios-healthkit` | `~/.codex/worktrees/myapp-v1-ios-healthkit/MyApp` | idem |
| C · SwiftUI | `claude/v1-ios-swiftui` (nova) | `~/.codex/worktrees/myapp-v1-ios-swiftui/MyApp` (nova) | criada **na** tag; push |

Se uma frente já tivesse commits próprios, a regra seria um merge normal da base (caminhos disjuntos, §10), nunca rebase; não foi o caso.

## 3. Prova de isolamento (executada depois da tag; resultado no relato de fechamento da sessão e reproduzível pelos comandos abaixo)

```bash
for b in claude/v1-ios-coachinghost claude/v1-ios-healthkit claude/v1-ios-swiftui; do
  git rev-parse $b origin/$b                                  # local = remoto = a tag
  git merge-base --is-ancestor v1-abc-ready-2026-11-26 $b && echo "$b BASE_OK"
done
git -C <cada worktree> status --short                         # vazio
```

- Cada frente tem sua branch e sua worktree; nenhuma modificou arquivo de outra (todas estão exatamente na tag).
- Diretórios: contrato §10 (rev. 2).
- iPhone: `tools/device-lock/with-device.sh <coachinghost|healthkit|swiftui|integration>`, `flock` de kernel da máquina (exclusão mútua testada com `swiftui`).
- DerivedData por frente: `ios/.build/DerivedData-A|B|C|INT` dentro da própria worktree.

## 4. Regra de integração futura

1. Cada frente commita e faz push **só** da própria branch; nada de merge entre frentes.
2. Fim de cada frente: `git diff --name-only v1-abc-ready-2026-11-26..HEAD` só com caminhos da sua coluna (§10), `CoachingCore` e pacotes compartilhados com diff vazio.
3. Mudança de contrato: proposta → missão de integração → nova tag → cada frente traz a base por ff/merge (contrato §11).
4. A missão de integração faz o merge das três numa branch nova (nunca em `main` sem autorização), cria `ios/App/Composition/**`, troca os provedores de fixture de C pelos reais e roda o fim a fim no aparelho (contrato §13).
