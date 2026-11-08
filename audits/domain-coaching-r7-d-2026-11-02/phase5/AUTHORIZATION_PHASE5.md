# R7-D Fase 5: autorização do Founder (resumo, 2026-11-08)

O Founder escolheu a **opção A** do `PHASE4_CHECKPOINT.md`: **um único ciclo corretivo**, o último dedicado ao R7-D. Este arquivo resume a autorização; não copia o pedido.

## O que está autorizado

1. **Corrigir os dois bloqueios reais** do holdout da Fase 4, no runtime, sem número novo:
   - **SSCTR-P4-F01:** exercícios de força planejados e nunca executados antes de uma pausa moderada ou longa seguem os limites de retorno que a D49 e o `strengthEntryWeek` já definem. Os testes reproduzem o F13 e a testemunha do SSCTR.
   - **QRE-P4-F01:** a pergunta `UNREPORTED_TRAINING` não depende indevidamente da fase ou da dose da semana planejada. Ausência de informação nunca vale como ausência comprovada de treino. Ficam preservados os casos em que não é preciso perguntar, sem perguntas repetitivas ou impossíveis de responder.
2. **K03:** tratar prospectivamente as lacunas de instrumento que o julgamento anterior comprovou (QRE-P4-H01, -H02, -H03), com revisão independente das alterações e pré-registro novo antes da autoria do próximo holdout. Isso **não** autoriza mudar resultados, avaliação ou critérios do holdout da Fase 4, nem converter casos não avaliáveis em aprovação.
3. **Autoria:** corrigir as instruções e interfaces que produziram referências a sessões inexistentes e tornar alcançável, pela interface pública, a cobertura obrigatória (semanas de prova, retornos, relatos tardios, carga conhecida, `CARRIER_HOLD`), sem dar ao autor resultados esperados do runtime e sem inventar sessões, cargas, respostas ou dados.
4. **Validação:** testes dirigidos dos dois defeitos e regressões; T39–T41 entram na suíte (K04), com a evidência de mutação preservada; determinismo, idempotência, correções retroativas, perguntas e progressão de corrida e força; suíte completa e validação de instrumentos.
5. **Revisão independente** do candidato e dos instrumentos afetados. Com aprovação, **freeze novo** (`R7D-FREEZE-6`); o `R7D-FREEZE-5` fica como registro histórico e sua designação nunca é reutilizada.
6. **Holdout novo e independente** depois do freeze: critérios registrados antes dos casos, autor novo restrito à interface pública, ao esquema e ao brief, corpus novo selado antes de executar, avaliação única pelo protocolo, sem tuning depois dos resultados, e dois julgamentos independentes (domínio esportivo e qualidade), com falhas reais, erros de corpus, lacunas de instrumento e não avaliáveis classificados separadamente.

## Limites

- Fora do escopo: F08, os três perfis de treinador, os controles de volume e dificuldade, Figma e telas, posicionamento comercial, catálogo sem necessidade comprovada, doses, limiares ou receitas novas, refatoração de partes estáveis, pesquisa competitiva, e reabrir decisões científicas encerradas sem evidência objetiva.
- O holdout da Fase 4 (`final/`), seus julgamentos, registros e freezes ficam intactos. `final/` nunca é avaliado de novo.
- Sem push, sem merge, sem exclusão recursiva.
- **Ciclo limitado:** se este ciclo não alcançar aprovação, o R7-D fecha `NOT_READY`, com os bloqueios registrados e encaminhados à próxima missão funcional. Nenhuma rodada R7-D nova se abre sozinha. Antes do freeze cabe no máximo um ajuste estreito, só de runtime ou instrumento, a um achado novo dos revisores; qualquer outra coisa fecha o ciclo.
- Um problema novo encontrado no holdout é classificado pela consequência real para o produto e não é corrigido em silêncio nem seguido de repetição do mesmo holdout.

## Ponto de partida verificado

- Branch `claude/domain-coaching-r7-d`, worktree `.claude/worktrees/domain-coaching-r7-d`, limpa em `cc0b56f` (checkpoint da Fase 4).
- `R7D-FREEZE-5`: registro `CoachingCore/r7/d/RUNTIME_FREEZE_R7D_5.json` (commit `20c099d`, vincula `7272e9a`). Os 57 arquivos de runtime vinculados conferem com o registro numa cópia de `cc0b56f`.
- Holdout da Fase 4: `final/` com `evaluationCount 1` nos dois manifestos.
