# Fidelidade visual, acessibilidade, desempenho e motion

## 1. Fidelidade ao Figma
- Autoridade: Figma `90oyvXHxxBQAvr1netov7S` na versão nomeada do fundador ("V1 alinhamento funcional · 26 nov" — **ainda não salva**,
  ver PRODUCT_SCOPE §4). Mapa tela → nó → contrato → fixture: `audits/v1-figma-final-alignment-2026-11-26/SWIFTUI_VISUAL_HANDOFF_ADDENDUM.md`.
- Procedimento e ferramenta: [docs/engineering/VISUAL_VALIDATION.md](../../../docs/engineering/VISUAL_VALIDATION.md) (`visual.mjs`, `sim.sh`).
- Nenhuma tela é declarada fiel sem captura real comparada com o nó. Tags `[FUTURO]` e `[V1: oculto até …]` são respeitadas.

## 2. Acessibilidade (por tela)
- VoiceOver: rótulo em todo componente de dado (gráficos com resumo textual).
- Dynamic Type até `accessibility-large` sem corte (teste `testLargeDynamicType` como padrão).
- Contraste AA nos tokens da paleta escura (medição formal pendente; issue de C).
- Alvo de toque ≥ 44 pt; nada comunicado só por cor (azul corrida / laranja força sempre com rótulo).
- PT-BR, EN (milhas), ES.

## 3. Desempenho
- Sem I/O na main thread; listas longas com `LazyVStack`; gráficos sem recomputar em cada frame.
- Scroll e animações medidos no iPhone físico antes de `Verified` (pendente).

## 4. Motion (prioridade V1)
Feito: skeleton, construção do plano, barras de volume progressivas, feedback de salvar, toques.
Pendente, nesta ordem: splash · contadores (number roll-up) · gêmeo da barra de zonas `785:5837` · trajeto da corrida (só com dados reais
do RunRecorder) · conclusão do treino. Secundárias depois da validação da V1. `Reduce Motion` desliga toda animação não essencial.
