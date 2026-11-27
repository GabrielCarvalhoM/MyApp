# Agentes especializados do RepMile

As definições ficam versionadas em [`.claude/agents/`](../../.claude/agents/), no próprio repositório, e funcionam em qualquer worktree
que as tenha no checkout. O sistema global do Windows citado em registros antigos não existe neste Mac e deixou de ser dependência.
O orquestrador é a sessão principal: escolhe o especialista, escreve o briefing (issue, worktree, simulador, critério de pronto) e
integra o resultado. Quem implementa nunca aprova a própria entrega; quem revisa não edita o que avalia.

| Agente | Papel | Escreve? | Quando |
|---|---|---|---|
| `ios-engineer` | implementação SwiftUI, MVVM + Clean, ViewModels, casos de uso, repositórios, serviços, injeção de dependência; os testes do próprio incremento | sim | todo incremento de código iOS (frente C, ou A/B quando a issue for de A/B) |
| `ios-test-engineer` | XCTest, XCUITest, fixtures, mocks, jornadas no simulador, testes contra o motor real | sim (só testes e fixtures) | jornadas ponta a ponta (#18), testes instáveis, cobertura que falta |
| `integration-engineer` | contratos A/B/C, composição, merges, PRs, CI, validação ponta a ponta | sim | sync entre frentes, composição (`ios/App/Composition`), CI |
| `quality-reliability-engineer` (QRE) | revisão independente: bugs, concorrência, persistência, segurança, privacidade, regressões, mapeamento de segurança falha fechada na UI | **não**¹ | todo incremento funcional, antes do merge |
| `ios-architecture-reviewer` | camadas, modularidade, testabilidade, limite de 350 linhas | **não**¹ | refatorações, módulos novos ou mudanças de estrutura; dispensável em correção pequena |
| `visual-ux-reviewer` | Figma × screenshots reais do simulador, acessibilidade, fidelidade | **não**¹ (Figma só leitura) | telas novas ou alteradas |
| `sports-science-concurrent-training-reviewer` (SSCTR) | ciência do treino; autoridade provisória e limites em `governance/agents/sports-science-reviewer/` | só os próprios registros de revisão; ferramentas herdadas pela constituição; nunca edita o que revisa | qualquer regra que mude o treino prescrito, prontidão, carga, recuperação ou progressão. Clínico continua CLINICAL_HUMAN_REQUIRED |

¹ Os revisores têm lista fechada de ferramentas (Read, Grep, Glob, Bash; o visual também tem leitura do Figma), sem Edit/Write nem MCP
de escrita. O Bash é o resíduo: serve só para ler e rodar checagens, por instrução. Depois de cada revisão o orquestrador confere
`git status --porcelain` limpo e HEAD inalterado na worktree revisada. Estados do quadro (por exemplo "Ready to Integrate") são aplicados
pelo orquestrador, não pelo revisor.

## Regras que todos seguem (fontes, não cópias)

1. **CoachingCore congelado;** IntegrationContracts, CoachingPresentation e `tools/device-lock` só mudam pelo processo CCP. O guard faz
   valer: `node tools/orchestration/guard.mjs`.
2. **Specs e aceite:** `specs/v1/` ([INDEX](../../specs/v1/INDEX.md)); a issue é o escopo.
3. **Ownership de branches e worktrees:** [WORKFLOW.md](WORKFLOW.md), [INTEGRATION_PROTOCOL.md](INTEGRATION_PROTOCOL.md). Trabalhar só na
   worktree e no simulador do briefing; sem force push, sem amend de commit publicado, sem merge.
4. **Arquitetura e tamanho:** [CODE_AND_ARCHITECTURE.md](../../specs/v1/quality/CODE_AND_ARCHITECTURE.md); 350 linhas por arquivo Swift
   (aviso em 300), `node tools/orchestration/swift-size.mjs`.
5. **Testes e revisão:** [TESTING_AND_REVIEW.md](../../specs/v1/quality/TESTING_AND_REVIEW.md), [QUALITY_GATES.md](QUALITY_GATES.md).
   Simulador por padrão; iPhone só nos checkpoints de hardware. Teste não executado nunca conta como aprovado.
   **Um simulador por agente** (o orquestrador atribui; o `sim.sh` encerra os outros apps do simulador, inclusive o runner de outra
   suíte) e no máximo duas suítes de UI ao mesmo tempo no Mac (`pgrep -fl "xcodebuild.*test"` antes de começar).
6. **Segurança esportiva falha fechada:** nil ≠ false, nada pré-respondido, ASK quando falta dado. Nunca inventar métricas, limites ou
   prescrições: elas vêm do motor ou de decisão registrada.
7. **Privacidade:** [SECURITY_PRIVACY.md](../../specs/v1/quality/SECURITY_PRIVACY.md). Repositório público: nada de segredo nem de dado
   real de saúde em código, fixture, log ou screenshot.
8. **Pausa e retomada:** [WORKFLOW.md §7](WORKFLOW.md#7-pausa-segura-e-retomada). Ao ouvir "PAUSAR", parar num ponto seguro e fazer
   commit de WIP publicado.
9. **Independência ≠ aprovação humana:** os agentes usam a identidade GitHub do fundador (#29). A revisão de um agente é revisão de
   contexto independente, nunca aprovação humana ou de code owner.

## Verificar que os agentes estão disponíveis

```bash
node tools/orchestration/agents.mjs              # frontmatter válido, nome = arquivo, revisores com lista fechada de leitura, registro, sem caminho de máquina
node tools/orchestration/agents.mjs --discover   # abre uma sessão nova do Claude Code neste checkout e confere que ela descobre todos
```

O teste estático também roda no CI (`tools/orchestration/tests/agents.test.mjs`). Uma sessão só enxerga as definições do próprio
checkout, lidas quando a sessão começa: depois de criar ou mudar uma definição, **abra uma sessão nova** antes de confiar nela (uma
sessão longa pode continuar com a versão antiga, inclusive as ferramentas de um revisor).
Adaptador do Codex (`.codex/agents/`) existe só para o SSCTR; os demais papéis são do Claude Code.
