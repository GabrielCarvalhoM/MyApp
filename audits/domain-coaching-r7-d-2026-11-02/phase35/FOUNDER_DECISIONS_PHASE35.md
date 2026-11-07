# Decisões do Founder na Fase 3.5 (2026-11-07)

**Registro:** Chief/Orchestrator, a partir da autorização da Fase 3.5. O registro reproduz a substância das decisões e não amplia nenhuma delas.

**Estado:**
- **Decisão do Founder registrada**, e não Product Truth publicada.
- Nada em `product/` ou `canon/` foi editado. O `R7D-FREEZE-5` recusa qualquer mudança nesses diretórios desde o R7D-FREEZE-4.
- A sincronização documental tem dono e missão próprios (ver D1.5 e D2.6).

---

## D1 — Posicionamento da V1 (estratégia semelhante à do FitFolio)

**D1.1 O que a V1 oferece:**
- sugestões de treino automatizadas e personalizadas;
- geradas pelo algoritmo do produto, construído com base em literatura científica do esporte.

**D1.2 O que a V1 não alega:**
- acompanhamento por profissional humano;
- validação humana ou empírica que ainda não ocorreu.

A revisão por IA (SSCTR) é autoridade interna provisória (DR-98, DR-99), nunca credencial humana.

**D1.3 Profissionalização:**
- A revisão profissional especializada fica para uma fase posterior, financiada pela receita.
- O desenvolvimento e a preparação da V1 não dependem de uma auditoria profissional paga.
- A fila de revalidação humana continua sendo o registro do que essa fase revisará. Ela não é pré-condição comercial da V1.

**D1.4 Natureza da decisão:**
- É decisão de posicionamento e documentação comercial.
- Não afeta a qualidade nem as capacidades do motor.
- **Regra absoluta: o produto não muda por causa do posicionamento.** Ficam preservados:
  - planos personalizados;
  - prescrição algorítmica de corrida e musculação;
  - progressão de carga, volume e intensidade;
  - histórico, recordes, experiência e capacidade demonstrada;
  - os três perfis de treinador;
  - os controles independentes de volume e de dificuldade;
  - planejamento híbrido e adaptação entre modalidades;
  - calendário, histórico, cards de treino e as demais telas;
  - tom de voz, identidade e personalidade dos treinadores;
  - a experiência visual e funcional do Figma.
- Termos naturais ficam: "seu treinador", "seu plano", "treino de hoje".
- Nenhum card ou tela vira aviso jurídico.
- Ajustes documentais descrevem fielmente o que o software faz.

Os detalhes dos três perfis e dos controles de volume e de dificuldade não estão especificados nas fontes desta branch. O `PROJECT_CONTEXT.md` os marca como "a recuperar". Este registro os preserva como capacidades da V1 nomeadas pelo Founder, sem inventar o comportamento deles.

**D1.5 Dependências (fora do motor; nenhuma bloqueia a Fase 3.5):**
- **Administrativa, separada:** verificar o enquadramento aplicável à comercialização. Dono: Founder, com apoio jurídico (G07, G10, G11). Não houve investigação jurídica extensa nesta missão.
- **Documental:** alinhar ao D1 os textos que descrevem a V1 (escopo, contexto de produto, copy comercial, C060/L023/G11 sobre alegações). Dono: PCG, com o Product/UX para a copy. Momento: a próxima missão documental autorizada, ou a missão F08 (D2.6).
- **Inalterados:**
  - `V1_COACHING_AUTHORITY_READY = NO`, que depende do holdout e da decisão de uso;
  - os gates técnicos G01–G04 e a fila.

Prontidão comercial, prontidão técnica e aprovação humana continuam estados distintos.

---

## D2 — F08: retomada inspirada nos padrões funcionais do Runna, adaptada ao plano híbrido

**D2.1 Experiência pretendida para a V1**

| Situação | O que o produto faz |
|---|---|
| **1. Indisposição leve, fadiga ou pequenos desconfortos** | O atleta diz que não está 100%. O produto oferece redução temporária por 3–14 dias: reduzir a dificuldade; só atividades leves compatíveis; reduzir bastante as sessões; ou descansar. Depois, a retomada é gradual, no ritmo conservador, equilibrado ou mais rápido, sempre dentro das regras de segurança do motor |
| **2. Doença ou lesão mais relevante** | O produto recomenda avaliação profissional, sem diagnosticar. Quando o atleta informa que se recuperou e está pronto, há um caminho utilizável de recomeço esportivo, sem upload universal de atestado. A declaração do atleta nunca é apresentada como liberação médica emitida pelo app. Restrições existentes e sinais relevantes não são ignorados |
| **3. Interrupção prolongada** | Novo plano, com avaliação atualizada de objetivos, experiência recente, capacidade e disponibilidade. Cargas e ritmos antigos não voltam sem evidência. Histórico, recordes e conquistas são preservados |

**D2.2 O diferencial híbrido:**
- corrida e força são consideradas juntas;
- uma modalidade pode ser reduzida sem suspender a outra;
- a preferência de velocidade de retomada não substitui os limites seguros do motor;
- os três perfis permanentes de treinador não são as três velocidades temporárias de retomada.

**D2.3 Fronteira de segurança:**
- nenhum diagnóstico;
- nenhuma liberação médica fictícia;
- nenhum exercício contrário a uma contraindicação conhecida.

O objetivo é uma retomada com baixo atrito e proteção proporcional, nem bloqueio permanente nem ausência de segurança.

**D2.4 Gatilho de governança:**
- Esta decisão é o gatilho **T2** do `PCG-R7D-F08-r1` (mudança de doutrina do Founder sobre DR-99/G04).
- Ela reabre a forma de autoridade do F08 para a parte do recomeço declarado pelo atleta.
- Não altera nada sozinha:
  - o G04 e a governança vigente continuam como estão até a alteração ser aprovada e implementada;
  - nesta fase nenhum byte do runtime clínico mudou.

**D2.5 Estado:**
- **F08 continua `F08_OPEN`** (BLOCKED_BY_AUTHORITY, F08-BLOCK-G04) até a mudança de autoridade ser aprovada e implementada.
- A V1 não é funcionalmente completa enquanto um atleta recuperado puder ficar permanentemente impedido de retomar qualquer treino sem saída legítima. Resolver isso é obrigatório antes do lançamento.
- Isso não contamina os testes nem o freeze da Fase 3.5.

**D2.6 Próximo passo:**
- A missão curta do F08 está em `phase35/f08/F08_MINIMAL_DELTA_AND_MISSION.md`.
- Ela traz o menor delta de contratos e governança e separa as proteções clínicas indispensáveis das restrições arquiteturais excessivas.
- Executá-la exige autorização própria, depois do fechamento técnico da Fase 3.5.
