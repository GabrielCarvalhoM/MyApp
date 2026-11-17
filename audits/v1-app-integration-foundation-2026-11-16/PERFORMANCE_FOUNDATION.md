# Performance Foundation — MyApp V1 (PF-0)

**Diretriz do Founder:** performance é requisito de primeira classe, com o peso de confiabilidade, segurança, privacidade e qualidade funcional. Vale para o app inteiro, desde a arquitetura.

**Status:** metas **provisórias**. Nada aqui foi medido em iPhone; os únicos números medidos são de laboratório (§4), marcados como tal. **Performance não está aprovada:** só passa com medição no aparelho (§6).

## 1. Princípios (verificáveis)

1. **Nada de motor no caminho do primeiro quadro.**
   - O primeiro quadro e a primeira tela útil vêm de um cache de views pequeno (APP-VIEW-0, poucos KB), lido pelo Swift.
   - O contexto JavaScript e o envelope carregam depois, em background.
   - Verifica: Instruments App Launch, sem `JSContext` antes do primeiro quadro.
2. **Nada pesado na main thread.**
   - Motor, persistência e parse do envelope rodam numa fila serial fora da main thread.
   - A main thread só aplica projeções prontas.
   - Verifica: Time Profiler sem amostras do motor na main thread; Hangs em zero.
3. **O que é local e válido aparece já.**
   - Um relato é salvo e confirmado na hora ("salvo"). A decisão do treinador chega quando a revisão termina, com o próprio estado.
   - Nunca animação para esconder espera.
   - Nunca dado antigo como atual: toda projeção leva `asOf`.
4. **Só o necessário atravessa a ponte.**
   - Envelope (0,4–1,2 MB) e respostas (0,2–1,2 MB) ficam no JavaScriptCore; o Swift recebe projeções de 0,5 a 2 KB.
   - Verifica: bytes por chamada da ponte, registrados em signpost.
5. **Invalidação explícita.**
   - Uma resposta nova troca as projeções afetadas inteiras, com identidade estável (`session.id`, `program.hash`).
   - Sem recomputar views sem mudança de dado. Sem polling.
6. **O motor só roda quando há motivo:**
   - um fato do atleta;
   - o primeiro acesso de uma semana nova (L-APP-05);
   - um reinício.
   - Sem trabalho em background na V1. A entrega do HealthKit fica para a missão dele.
7. **Cancelamento.** Uma requisição obsoleta é descartada antes de chegar ao motor. Uma revisão já começada termina e é gravada inteira, nunca pela metade.
8. **A identidade visual se mantém.**
   - Dark-first, cores de contexto e movimento de qualidade continuam.
   - Efeito caro sem benefício troca por equivalente de mesma qualidade, por exemplo: material pré-renderizado em vez de blur ao vivo em lista longa; animação de transform e opacity em vez de relayout.
   - Respeitar Reduce Motion e Reduce Transparency.

## 2. Matriz de dispositivos (proposta; decisão D3 do Founder)

**Política recomendada:** suportar a versão atual do iOS e a anterior (N-1) no lançamento. A versão mínima é a anterior à vigente quando o app sair.

| Papel | Proposta | Por quê |
|---|---|---|
| Entrada (o orçamento é medido aqui) | iPhone SE (2ª geração) ou iPhone 11: A13, 3–4 GB | O mais antigo que a versão mínima provável ainda suporta; tela pequena (SE) e pouca memória |
| Intermediário | iPhone 13: A15, 4 GB | Muito comum na base instalada; referência de "experiência típica" |
| Recente | iPhone 16/17 | Teto de qualidade (ProMotion, 120 Hz nos modelos Pro) |

**Conferir antes de fixar:**
- a lista oficial de aparelhos da versão mínima escolhida;
- a adoção dela no público-alvo (Brasil), porque aparelhos antigos pesam mais nesse mercado.

Se a versão mínima excluir uma fatia material do público, a troca é uma versão mínima mais baixa contra mais custo de manutenção (APIs de interface por disponibilidade). Isso é decisão do Founder. O Mac M4 e os simuladores **não** contam como medição.

## 3. Orçamentos provisórios (medidos no aparelho de entrada, build Release)

| Área | Métrica | Meta provisória | Como medir |
|---|---|---|---|
| Startup | primeiro quadro, frio / quente | ≤ 400 ms p50 / ≤ 200 ms p50 (referência de lançamento da Apple) | Instruments App Launch; MetricKit `MXAppLaunchMetric` |
| Startup | primeira tela útil (Hoje com o plano em cache) | ≤ 1,0 s p95 frio | signpost do início do processo à primeira projeção visível |
| Navegação | toque → resposta visual | ≤ 100 ms p95 | signpost do evento ao commit; Hitches |
| Rendering | taxa de hitch (rolagem, transições, gráficos) | < 5 ms/s em todas as telas, mirando a faixa "boa" do Xcode | Instruments Animation Hitches; XCTest `XCTOSSignpostMetric` |
| Motor | criação do contexto e carga do pacote | ≤ 1,0 s p95 (em background) | signpost em volta da avaliação do pacote |
| Motor | primeiro plano (`generateProgram`) | ≤ 2,0 s p95 | signpost; Time Profiler |
| Motor | revisão (`evaluateProgram`) com o registro de um plano inteiro | ≤ 1,5 s p95; pior caso ≤ 3 s | signpost; 30 repetições sobre o envelope fixo da jornada |
| Memória | footprint estável / pico durante revisão | ≤ 150 MB / ≤ 350 MB | Allocations, VM Tracker; `MXMemoryMetric` |
| Persistência | gravação atômica do envelope (1,1 MB) | ≤ 50 ms p95, fora da main thread | signpost |
| Energia | trabalho em background na V1 | nenhum; CPU ociosa com o app em primeiro plano parado | Energy Log; `MXCPUMetric` |
| Tamanho | motor + assets no pacote | ≤ 3 MB descomprimido (medido: 1,34 MB de JS + 0,83 MB de assets) | relatório de tamanho do App Store Connect |
| Tamanho | download do app | ≤ 50 MB, provisório: o orçamento real é de mídia e fontes | idem |
| Rede | dependência para mostrar plano válido e registrar treino | nenhuma | teste em modo avião |

**De onde vêm as metas do motor.** O laboratório sem JIT dá p95 de 0,30 s na revisão (§4). A razão entre um A13 e o desktop medido **não foi medida**. As metas deixam folga para várias vezes mais lento e ainda cabem numa decisão que chega depois de um "salvo" imediato.

Se P0 mostrar folga grande, as metas apertam. Se mostrar falta, vale a contingência do ADR (WKWebView) ou o trabalho no motor (ADR §8). **Nunca afrouxar uma meta para aprovar.**

## 4. Medido em laboratório (Node 24, Ryzen 7 5700X; não é iPhone)

Fonte: `results/perf.json`. Modo `--jitless`, a aproximação de um JavaScriptCore sem JIT; entre parênteses, com JIT.

| Medida | Mediana | p95 | Máximo |
|---|---|---|---|
| Carga do motor (import) | 79 ms (75) | 80 | 80 |
| Primeira geração de plano | 85 ms (77) | 86 | 86 |
| Primeira revisão (processo frio) | 138 ms (113) | 140 | 140 |
| Revisão, 0 a 60 linhas | 135 ms (101) | 190 | 249 |
| Revisão, 60 a 150 linhas | 292 ms (209) | 303 | 304 |
| Revisão fixa repetida, plano inteiro carregado | 211 ms (149) | 214 | 214 |
| Projeções (Hoje + Semana + Insights) | 0,1–0,9 ms | — | — |
| Stringify e parse do envelope de 1,1 MB | 4 ms cada | — | 6 |

**Memória:** heap retido depois de GC, com o plano inteiro, de 21 a 26 MB. Pico de heap observado durante revisões: cerca de 150 MB. RSS de pico do processo Node: 250 a 275 MB (inclui o próprio Node).

**Tamanhos:** entrada de uma revisão, 0,55 MB mediana e 0,80 MB máximo. Resposta, 0,74 MB mediana e 1,24 MB máximo. Envelope, 1,17 MB ao fim de um plano de 16 semanas (95 linhas).

**Crescimento:** o custo de revisão sobe com o registro, de cerca de 100 a cerca de 210 ms com JIT, entre 0 e 95 linhas, dentro de um plano. **Não foi possível medir o crescimento entre vários planos:**
- o gate RESTART impede o registro de crescer depois de um reinício;
- a expiração dos registros R7-B0 (2027-04-30) fecha o motor no meio do segundo plano da jornada longa.

As 19 revisões `UNSUPPORTED` da jornada foram tiradas das latências e estão contadas em `history.excludedFromLatency`.

**Operações com potencial de travar uma interface** (por isso nunca na main thread):
- toda revisão, porque cada uma relê e interpreta as políticas R5/R6 e calcula cerca de 800 SHA-256 sobre cerca de 3,4 MB;
- a geração;
- o reinício;
- o parse do envelope.

## 5. Diretrizes SwiftUI para a implementação futura

**Interface:**
- Estado observável fino: `@Observable` por projeção, nunca um objeto raiz do app inteiro. Uma resposta nova troca só as projeções afetadas.
- Identidade estável nas listas (`id` da sessão); nada de `AnyView` em listas; hierarquia rasa nas células.
- Listas longas (histórico) em `List` ou `LazyVStack`, carregadas por página a partir da camada de domínio.
- Gráficos: Swift Charts com o número de pontos que a tela mostra, nunca a série inteira.
- Efeitos: material e blur só fora de listas em rolagem; sombras pré-calculadas; animações de transform e opacity.

**Dados:**
- Uma fila serial para o motor; `Task` cancelável na UI; requisições duplicadas descartadas pela chave de idempotência do V1CIB.
- O histórico carrega progressivamente; a projeção de Hoje nunca espera o histórico.

**Experiência:**
- Estados de vazio, indisponível, sem sincronizar (`NOT_SYNCED`) e erro definidos para cada view, a partir dos estados do cliente do V1CIB.
- Ao voltar do background, mostrar o cache e revalidar em background.
- A persistência nunca bloqueia um toque.

## 6. Plano de profiling e critérios de aceitação futuros

1. **P0** (ADR §6): o motor no `JSContext` do aparelho de entrada, sem telas de produto. Mede as linhas "Motor" e "Memória" do §3. **Fecha a decisão arquitetural.**
2. **Primeira tela real:** App Launch, Hitches, Time Profiler e Allocations em cada tela nova, nos três aparelhos da matriz, build Release.
3. **Regressão automática:** testes XCTest de performance com métricas de signpost para geração, revisão, restauração e primeira tela, com baseline gravado por aparelho. Uma regressão acima do limite falha o build.
4. **Campo, quando houver piloto autorizado:** MetricKit (lançamento, hangs, memória, CPU, disco), sem dado de saúde e com o inventário V1CIB.

**Critério para declarar performance aprovada numa tela:** os orçamentos do §3 medidos no aparelho de entrada, com mediana, p95 e pior caso registrados. **Sem medição, o estado é "não medido", nunca "aprovado".**
