# Testes e revisão independente

Gates e comandos: [docs/engineering/QUALITY_GATES.md](../../../docs/engineering/QUALITY_GATES.md) (fonte única; este arquivo não os repete).

## 1. Proporcionalidade

| Incremento | Mínimo |
|---|---|
| Lógica pura (mapeamento, formatação, estado de ViewModel) | teste unitário |
| Tela ou fluxo | unitário do ViewModel + XCUITest do caminho principal e do caminho bloqueado + screenshot no simulador |
| Escrita no motor | teste de formato do pedido (`RequestShapeTests`) + caminho de erro + sem duplo envio |
| Persistência / gravação | teste de retomada após morte do processo, de exclusão e de arquivo corrompido |
| Concorrência | teste com chamadas concorrentes / reentrância |
| Contrato compartilhado | os três `swift test` + `npm test`, 0 pulados |
| Hardware (GPS, HealthKit, bloqueio do aparelho) | iPhone pela trava (`with-device.sh`), evidência `target: device` |

## 2. Regras
- Teste pulado não é teste aprovado. Build não é validação funcional. Simulador não é iPhone. Sintético não é dado real.
- Screenshot antigo não vale depois de mudar a tela.
- Nunca alterar fixture de referência ou asserção congelada para fazer um teste passar.
- Jornada sintética é rotulada como sintética.

## 3. Revisão independente (obrigatória para incremento funcional)
- Revisor em contexto separado, **somente leitura**, recebe diff, spec, contratos e critérios — **não** a conclusão do implementador.
- Procura defeitos reais: bugs, edge cases, segurança, privacidade, concorrência, retain cycles, persistência, estados inconsistentes,
  MVVM/Clean, navegação, duplicação, testes ausentes ou errados, acessibilidade, divergência do Figma.
- Achado: severidade (P0–P3) · arquivo:linha · comportamento · reprodução/evidência · correção sugerida.
- P0/P1 → corrigir + teste de regressão + **nova verificação independente** das correções. Nada é "validado" com P0/P1 aberto.
- P2/P3 podem virar issue se não comprometerem segurança nem critério de aceite.
- Mudança de regra esportiva, gate, recuperação, carga, substituição → revisão SSCTR
  (`.claude/agents/sports-science-concurrent-training-reviewer.md`). Não chamar SSCTR para pixels.
- Registro da revisão: comentário no PR (tabela de achados e disposição). Relatório extenso só no fechamento de uma frente.

**Limitação registrada (#29):** os agentes usam a mesma identidade GitHub do fundador. Revisão de agente com contexto independente
**não** equivale a aprovação de code owner nem a revisão humana independente.
