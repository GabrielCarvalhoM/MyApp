# Por que o SwiftUI divergiu do Figma (causas demonstráveis e prevenção)

Investigação pedida pelo fundador em 27/11. Fontes: `audits/v1-ui-functional-reconciliation/SWIFTUI_IMPLEMENTATION_HANDOFF.md` (24/11),
o adendo visual de 26/11 na branch `claude/v1-figma-final-alignment`, os relatórios de incremento da frente C
(`audits/v1-ios-swiftui-2026-11-26/`), os briefs do orquestrador e a matriz [FIGMA_MATRIX.md](../FIGMA_MATRIX.md).

## O que já estava certo

- **O handoff tratava o Figma como especificação, não como referência.** A tabela de autoridades diz: "Visual, hierarquia, fluxo e estados
  → o Figma"; e "Onboarding (10): implementar inteiro, menos 19 Altura e peso (GAP-36) …". Os critérios de aceite visual (§9) pediam um
  snapshot por estado comparado lado a lado com o quadro, idiomas, texto grande, claro e escuro, e motion.
- **Os conflitos reais com o motor estavam mapeados desde 24/11** (`UI_CONTRACT_GAPS.md`, `UI_CAPABILITY_TRACEABILITY.md`).

## Causas

| # | Causa | Tipo | Evidência |
|---|---|---|---|
| 1 | A frente C montou várias telas a partir do contrato do motor (o que o `IntakeRequest` precisa), não dos frames. Exemplo: "O que você tem para treinar força?" é o campo `equipment` em chips; o onboarding virou 8 passos genéricos em vez das 4 etapas e ~34 telas do Figma. | **Falha de implementação** | INCREMENT_07 descreve a sequência a partir dos campos; a matriz classifica 28 MISMATCH e 34 NOT_IMPLEMENTED no onboarding; A1–A4 em §4 |
| 2 | A copy foi escrita pela implementação (PT/EN/ES) em vez de transcrita dos frames. | **Falha de implementação** | os textos do app diferem dos nomes das camadas de texto do Figma em quase todas as telas (matriz §3) |
| 3 | O critério §9 ("snapshot por estado comparado lado a lado") nunca virou gate. Cada incremento declarou "comparado com o Figma" com uma screenshot por tela, só em PT-BR, sem registro de diferenças por estado e sem revisor. | **Falha de processo** | FINAL_REPORT da C ("compared with the Figma"); não existia `audits/.../visual/` até o piloto do #14 |
| 4 | O mapa tela → nó do adendo de 26/11 cobria só parte das telas (no onboarding, só Cuidados e fora do escopo), e o adendo remetia a anotações de Dev Mode que a implementação não consultou. | **Lacuna de handoff** | adendo §2 (linhas 31–33); a página 10 tem 66 frames |
| 5 | O orquestrador (esta sessão) priorizou nos briefs o motor, MVVM e segurança, e aceitou incrementos com testes funcionais, revisão QRE e SSCTR. Nenhum desses revisores avaliava fidelidade visual. O #14 ficou no backlog esperando a versão nomeada do Figma. | **Falha de processo (orquestração)** | briefs do #32, #37, #59, #68, #72 e #73; o `visual-ux-reviewer` só passou a existir em 27/11 |
| 6 | Telas de segurança exigidas pelo motor não têm frame no Figma (triagem nos relatos, banners de estado). A implementação criou essas telas sem levar a lacuna ao fundador. | **Incompatibilidade real + falha de processo** | matriz §4 (A5–A11, A14) e §7 (K27) |
| 7 | Campos que o Figma pergunta não passam pelo contrato congelado (cargas conhecidas, meta de tempo, prioridade, turno por dia, treinador…), e há o inverso (semanas obrigatórias sem prova). | **Incompatibilidade real de produto** | #101 §6 (D01–D27); Founder Decision #109 |

## Por que testes e revisões não pegaram

- **Testes unitários e de UI** provavam o comportamento contra o motor (o que é sentado, enviado, bloqueado), não a forma. Um XCUITest acha
  o botão pelo identificador, não pelo desenho.
- **QRE e SSCTR** revisaram corretude, segurança e regra esportiva, que era o escopo deles. Fidelidade não era escopo de ninguém.
- **"Implementado" e "integrado" eram tratados como "pronto".** O quadro não tinha campo de fidelidade.

## Prevenção (já em vigor)

1. **Três autoridades e a regra "falta de campo não autoriza redesenho"**: [PRODUCT_SCOPE](../PRODUCT_SCOPE.md).
2. **Gate visual obrigatório**: [QUALITY_GATES §2b](../../../docs/engineering/QUALITY_GATES.md).
   - Tarefa visual só fica Ready com nó, variante, spec, contratos, critérios e estados.
   - A tela só fecha com captura real, comparação e revisão do `visual-ux-reviewer`.
   - O campo **Figma** no quadro, e o `board.mjs` recusa Verified sem MATCH ou desvio aprovado.
3. **Matriz única** Figma × SwiftUI, com telas inventadas e telas ausentes listadas: [FIGMA_MATRIX](../FIGMA_MATRIX.md).
4. **Conflito vira exploração + Founder Decision**, nunca tela improvisada: [WORKFLOW §8](../../../docs/engineering/WORKFLOW.md).
5. **Briefs de tela** citam o nó exato e proíbem tela, pergunta ou copy fora do Figma (`docs/engineering/AGENTS.md` regra 6).
6. **Copy vem do Figma.** EN e ES que o Figma não tem ficam marcados PENDING_TRANSLATION, nunca inventados como finais.
