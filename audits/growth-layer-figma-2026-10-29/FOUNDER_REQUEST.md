# Founder request — Growth Layer UX/Figma integration · 2026-10-29

Current direct Founder request, given in a Claude Code session on 2026-10-29, while the COACHING CORE State Model Consumer Closure (`audits/domain-coaching-r7a-state-consumer-2026-10-29/`) was open. It names the new Figma `TYR10AIrquCpKvKL3eyXyO` as the baseline and authorizes this design mission to run in parallel with that closure.
- **Decisor:** Founder.
- **Mission kind:** UX/Figma delta + refinement. **FIGMA_EDITS_AUTHORIZED = YES for `TYR10AIrquCpKvKL3eyXyO` only · IMPLEMENTATION_AUTHORIZED = NO · no product/canon edit · `PENDING_CANON_SYNC.patch` not applied.**
- **Authority read:** Growth Layer DR-124–132 and Map Share Privacy DR-133, carried by the GRW blocks of `CURRENT_MISSION.md`, the ledger and [the GRW record](../growth-layer-2026-10-29/RECORD.md) while the canonical sync stays held.

Figma link supplied with the request: `https://www.figma.com/design/TYR10AIrquCpKvKL3eyXyO/Sem-t%C3%ADtulo?timeline=keyframe&node-id=0-1&p=f&t=2CNHqqGPcv3rqhvL-0`

The request is recorded verbatim below.

---

Quero executar uma missão específica de UX/Figma para integrar a Growth Layer da V1 ao produto existente.

Esta missão pode rodar em paralelo com a State Model Consumer Closure.

IMPORTANTE: esta NÃO é uma missão de redesign geral do produto.

O objetivo é incorporar de forma cirúrgica as novas capacidades de Growth à UX/Figma já aprovada, preservando a arquitetura, identidade visual, navegação e direção de produto existentes.

## REIDRATAÇÃO OBRIGATÓRIA

Antes de modificar qualquer coisa:

1. Reidrate-se pelas autoridades atuais do projeto.
2. Leia especialmente:
   - CURRENT_MISSION.md
   - MISSION_LEDGER.md
   - PRODUCT_TRUTH_MAP.md
   - PRODUCT_ARCHITECTURE.md
   - PRODUCT_DECISION_REGISTER.md
   - V1 Release Scope vigente
   - Designer Context vigente
   - arquivos relevantes de UX/UI
   - audits/growth-layer-2026-10-29/RECORD.md
   - FOUNDER_REQUEST_R2.md
   - qualquer autoridade apontada por esses documentos.

3. Entenda que:
   - Growth Layer está DECIDED / CURRENT_PRODUCT_DECISION;
   - PDR-1.10 / DR-124–132 definem a Growth Layer;
   - PDR-1.11 / DR-133 define Map Share Privacy;
   - o sync de product/canon ainda está deliberadamente retido enquanto a State Model Consumer Closure estiver aberta;
   - NÃO aplique PENDING_CANON_SYNC.patch;
   - NÃO altere o baseline da missão concorrente;
   - NÃO altere qualquer freeze, blocker, readiness ou autoridade do Adaptive Engine.

Use CURRENT_MISSION, MISSION_LEDGER e audits/growth-layer-2026-10-29 como contexto vigente enquanto o sync canônico estiver retido.

---

# OBJETIVO

Integrar à UX/Figma atual apenas as superfícies necessárias para:

1. shareability;
2. pós-treino;
3. histórico/progresso;
4. consistência/aderência;
5. referral mínimo;
6. pequenos reflexos necessários na Home.

Growth NÃO é:

- uma aba;
- um destino principal;
- um novo pilar de navegação;
- uma rede social;
- um motivo para redesenhar o aplicativo.

Princípio obrigatório:

"Growth is embedded in the experience, not a destination."

---

# BASELINE VISUAL

Use como baseline o Figma atual aprovado pelo Founder.

Preserve:

- arquitetura de informação;
- navegação principal;
- identidade visual;
- Design System;
- hierarquia;
- linguagem visual;
- direção dark-first;
- uso funcional e moderado de cores/gradientes;
- maturidade visual;
- continuidade da experiência.

Não criar uma nova direção visual.

Não explorar três novas Homes.

Não reiniciar o projeto.

Não voltar para versões anteriores de UI.

Esta missão é DELTA + REFINEMENT.

---

# 1. POST-WORKOUT EXPERIENCE

Revisar ou criar o estado pós-treino necessário para conectar:

Workout
→ Result
→ Progress
→ Share.

O pós-treino deve:

- mostrar o que realmente importa daquela sessão;
- destacar PR/milestone somente quando houver evidência real;
- permitir acessar detalhes;
- permitir compartilhar;
- evitar linguagem exagerada ou falsa certeza;
- evitar gamificação infantil.

Corrida e força podem ter nuances visuais diferentes, preservando coerência global.

Não inventar conclusões do Adaptive Engine.

---

# 2. SHAREABILITY SYSTEM — V1

Shareables são agora uma capacidade estratégica de aquisição.

Projetar um sistema reutilizável, não uma coleção aleatória de cards.

Prever pelo menos:

## Formats

- Map:
  mapa real + rota protegida.

- Route:
  traçado da rota sem mapa de fundo.

- Photo:
  foto + dados.

- Overlay:
  dados sem fundo para uso sobre foto.

- Stats:
  artefato visual sem rota.

## Contextos

- corrida concluída;
- treino de força concluído;
- PR/milestone;
- resumo semanal;
- evolução quando houver dados suficientes.

## Formatos externos

Considerar especialmente:

- Instagram Stories;
- compartilhamento genérico;
- WhatsApp/messages;
- exportação de imagem.

Não criar integração social interna.

---

# 3. MAP SHARE PRIVACY

DR-133 é autoridade vigente.

Map background está permitido em shareables externos de atividade concluída.

A experiência deve seguir:

raw GPS
→ privacy filtering
→ share-safe geometry
→ map rendering
→ share artifact.

Regras:

- nunca localização ao vivo;
- somente atividade concluída;
- compartilhamento sempre iniciado pelo usuário;
- início e fim da rota protegidos por padrão;
- baseline atual: 200 m no início + 200 m no fim;
- preview deve mostrar exatamente o artefato final;
- opção de não mostrar rota;
- opção Route sem mapa;
- opção Map com mapa;
- nenhuma coordenada/endereço/nome de local/horário sensível deve aparecer como metadata no share;
- raw GPS não é exportado pelo mecanismo visual de compartilhamento.

No preview, apresentar indicação discreta semelhante a:

"Start & finish protected"

com possibilidade de edição quando aplicável.

Não usar modal alarmista.

A proteção deve parecer parte natural do produto.

## NÃO DECIDIR NESTA MISSÃO

Os seguintes pontos permanecem dependentes de Product/UX + Security/Engineering:

- se proteção pode ser reduzida até zero;
- distância mínima configurável;
- mitigação contra inferência por múltiplos shares;
- regras finais de Privacy Zones persistentes;
- implementação/provedor de mapa;
- política exata de tiles/network requests.

Você pode projetar affordances e estados necessários, mas não inventar as regras finais.

Marque dependências explicitamente.

---

# 4. HISTORY / PROGRESS

A área de histórico não deve funcionar somente como arquivo.

Ela deve responder visualmente:

"Estou melhor do que antes?"

Preservar os requisitos já existentes de:

- calendário;
- semana/mês;
- histórico de treinos;
- detalhe do treino.

Adicionar somente o necessário para suportar progressão longitudinal.

Pode incluir, quando sustentado pelos dados:

- pace;
- tempos;
- volume;
- cargas;
- repetições;
- frequência;
- PRs;
- consistência;
- comparação entre períodos/ciclos.

Evitar dashboards redundantes.

Evitar métricas decorativas.

Não atribuir causalidade ao Adaptive Engine sem suporte do modelo e dos dados.

---

# 5. CONSISTENCY

A UX deve representar consistência de treinamento, não streak diário ingênuo.

PROIBIDO:

- punir descanso planejado;
- pressionar usuário a treinar contra recomendação;
- usar linguagem que trate todos os dias sem treino como falha.

Pode explorar representações como:

- semanas consistentes;
- sessões planejadas × concluídas;
- sequência de semanas aderentes;
- progress indicators.

"91% adherence" ou percentuais equivalentes dependem do fechamento de G03/allowlist.

Não utilizar esse valor em shareables enquanto não estiver autorizado.

---

# 6. HOME

Não redesenhar a Home.

Auditar somente se alguma informação mínima de:

- consistência;
- progresso;
- milestone;
- resumo recente

merece aparecer dentro da estrutura atual.

Qualquer inclusão deve competir por espaço com o conteúdo existente.

Se não houver benefício claro, não adicionar.

---

# 7. REFERRAL MÍNIMO

Referral não merece nova arquitetura.

Projetar apenas o ponto mínimo de entrada e fluxo.

Possíveis locais:

- Profile/Settings;
- paywall/PRO;
- contextual moment apropriado.

Não definir reward final.

Reward continua aberto.

Não criar:

- wallet;
- afiliados;
- marketplace;
- ranking de convites;
- estrutura financeira.

---

# 8. FORA DE ESCOPO

Não reintroduzir:

- Crew;
- feed;
- clubes;
- DMs;
- chat social;
- social graph;
- ranking público;
- eventos;
- marketplace;
- nutrição;
- sistema completo de afiliados.

Crew/social continua fora da V1.

---

# 9. STATE MODEL / ADAPTIVE ENGINE BOUNDARY

Outra missão está fechando o State Model em paralelo.

Esta missão NÃO tem autoridade para definir a semântica do treinador.

Não inventar:

- estados fisiológicos;
- causas de adaptação;
- explicações prescritivas;
- confidence scores;
- readiness;
- fadiga específica;
- alterações de treino;
- motivos de alteração;
- mensagens que dependam do State Model ainda não fechado.

Quando a interface depender de semântica que ainda não está autorizada:

1. desenhe apenas a estrutura visual necessária;
2. marque a dependência;
3. use conteúdo semanticamente neutro ou placeholder explicitamente não autoritativo;
4. registre para a futura reconciliation pass.

Não contamine UX com supostas capacidades que o runtime ainda não garante.

---

# 10. DESIGN QUALITY

Aplicar o nível de qualidade esperado do produto:

- aparência profissional e madura;
- evitar IA slop;
- hierarquia forte;
- poucos cards quando não necessários;
- cor com função;
- gráficos legíveis e significativos;
- tipografia sans-serif;
- continuidade visual;
- microinterações úteis;
- responsividade;
- accessibility;
- estados loading/empty/error quando relevantes;
- componentes reutilizáveis.

Shareables podem ser mais expressivos do que a UI principal, mas devem parecer parte da mesma marca.

---

# 11. EXECUTION PROPORTIONALITY

Antes de criar uma nova tela, pergunte:

"Esta capacidade pode ser resolvida dentro de uma superfície existente?"

Prefira:

existing surface + small delta

a:

new destination + new navigation.

Não criar artefatos ou telas sem consumidor.

---

# ENTREGÁVEIS

Ao final:

1. liste as telas alteradas;
2. liste telas novas, se houver;
3. explique por que cada tela nova era necessária;
4. mostre quais componentes novos entraram no Design System;
5. liste dependências ainda abertas;
6. liste qualquer assumption dependente do State Model;
7. confirme explicitamente que nenhuma semântica do Adaptive Engine foi inventada;
8. confirme que Crew/social continua fora da V1;
9. confirme que a arquitetura/navegação principal foi preservada;
10. confirme que Growth não virou aba/destino;
11. entregue um delta claro do antes → depois;
12. registre qualquer ponto que precise ser reconciliado na futura Final Product Reconciliation & Refinement.

STOP_WHEN:

Pare quando a Growth Layer estiver corretamente integrada às superfícies mínimas necessárias do Figma atual, com qualidade suficiente para implementação futura, sem iniciar um redesign geral e sem antecipar decisões ainda pertencentes ao Adaptive Engine, Security ou Engineering.
