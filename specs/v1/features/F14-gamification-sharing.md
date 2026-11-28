# F14 · Gamificação e compartilhamento

**Situação:** NÃO INICIADO. Issue: #34.

**Objetivo.** Conquistas e cartões compartilháveis previstos no Figma (82 shareables) que reforçam consistência sem pressionar o atleta
contra a segurança (nada recompensa treinar sob bloqueio ou ignorar sintomas).

**Comportamento esperado.** Cartão de treino concluído (tempo, esforço; distância só "medido pelo iPhone"); rota oculta por padrão; primeiros
e últimos 200 m sempre ocultos; compartilhamento por `ShareLink` com imagem gerada localmente (`ImageRenderer`); nada de dado de saúde sensível
no cartão sem escolha explícita.

**Dependências.** Regras de conquistas precisam de definição de produto (quais marcos; sem streak que incentive treinar doente) → decisão do
fundador antes de implementar a lógica; o cartão de compartilhamento pode começar antes.

**Testes.** Snapshot do cartão; teste de que a rota oculta os 200 m iniciais/finais; XCUITest do ShareLink. **Figma.** 82.
