# RepMile V1: estados de dados dos componentes

**Data:** 2026-11-24.

**Fontes:**
- `UI_CAPABILITY_TRACEABILITY.md` (onde cada componente aparece);
- `UI_CONTRACT_GAPS.md` (por que algo não é suportado);
- a regra "Só o que chegou" do Figma (00 `897:2`, 99 `897:1109`), que este documento segue e não redesenha.

## 1. Contrato de apresentação

O contrato está na proposta **CHG-UI-1** (`proposals/CoachingPresentation`, com 6 testes passando contra as respostas reais da fronteira em `probes/out`).

### `DisplayValue<Value>`

Cada valor que um componente mostra é um `DisplayValue<Value>` com estes campos:

| Campo | Conteúdo |
|---|---|
| `availability` | estado do valor (tabela abaixo) |
| `value` | só presente quando `availability` tem valor; o inicializador recusa a combinação inválida |
| `unit` | `s/km`, `km`, `kg`, `min`, `bpm`… |
| `source` | `coachingCore`, `athleteReport`, `healthKit`, `liveSession`, `weatherKit`, `storeKit`, `backend` |
| `observedAt` | o instante da medição ou do relato |
| `window` | o período que o valor descreve (uma semana, uma sessão) |
| `quality` | o código de qualidade da própria fonte: `confidence`, `label ESTIMATED`, `gpsQuality`, `reliability`, `paceWithheld` |

### `Availability`

| Caso | Significado | Comportamento padrão |
|---|---|---|
| `available` | valor válido | mostra |
| `partial(missing:)` | parte de um composto chegou (duração sem distância) | mostra o que chegou e fecha o resto sem buraco |
| `missing(reason:)` | a capacidade existe, o dado não (ainda) | oculta a métrica opcional; mostra o estado nomeado quando o motor tem um (`reason`) |
| `stale(asOf:)` | o valor passou da validade da fonte (`validUntil`, `recency`) | mostra com a data, ou oculta, conforme o componente (seção 3) |
| `loading` | leitura em curso | esqueleto do próprio componente, sem número |
| `error(code:)` | a leitura falhou | mostra recuperação só se o atleta puder agir |
| `unsupported(reason:)` | não existe nesta versão ou neste aparelho (VFC, VO₂ máx, FC ao vivo na V1) | o componente mantém a variante futura no código, oculta |
| `disabledInApp` | o atleta desligou a fonte no app (ato explícito) | aviso curto com o caminho (99: "Permissão desligada") |

### Distinções obrigatórias

**Ausência ≠ negação.**
- Uma leitura vazia do HealthKit é `missing`, nunca "negado": o iOS não revela negação de leitura (GAP-19).
- `disabledInApp` só existe quando o atleta desligou a fonte dentro do Repmile.
- `error` é uma falha de leitura com código, que não equivale a "sem dados".
- Sensor inexistente: nada a avisar ("Sensor que não existe · Nada a avisar", 99 `897:1109`).

**Sem `hasWatch`.**
- Nenhum componente decide por "tem relógio".
- Cada célula decide pela `availability` do seu próprio valor. É o que faz a grade 3 × 2 virar 2 × 2 (99) sem uma regra global.

**Nenhum número sem fonte.**
- Um valor do motor chega como `coachingCore`, e só quando o `status` da leitura o permite: `AVAILABLE`, `SHOWN`, `CALIBRATED`.
- Outros status viram `missing(reason)` ou `unsupported`.
- Nunca se mostra um zero no lugar de ausente.

**Provedores futuros.**
- Um relógio novo entra como mais uma `source` para o mesmo componente; o componente não muda.
- No motor, a fonte nova continua sendo uma mudança revisada do canal DEVICE (HO §11), nunca do app.

## 2. Regras da UI, ligadas aos componentes

| Regra (missão §7) | Como se aplica |
|---|---|
| 1. Ocultar métricas opcionais ausentes | `missing` / `unsupported` → `EmptyView` no slot; o contêiner é auto-layout (`Grid`/`ViewThatFits`), sem posição fixa |
| 2. Reorganizar sem buracos | grades por contagem de células presentes (3 × 2 → 2 × 2 → 1 × n) |
| 3. Sem zeros fictícios | `DisplayValue` não aceita valor sem `availability` que o carregue; `0` só quando a fonte mediu zero |
| 4. Gráficos sem dados inventados | série com ponto ausente desenha lacuna; sem série, o gráfico some (99 "Gráficos ao longo da corrida") |
| 5. Sem placeholder permanente de sensor | `unsupported` nunca renderiza "—" ou "indisponível" |
| 6. Ação de recuperação só quando há o que fazer | `disabledInApp`, "não conectado", localização desligada, `error` recuperável |
| 7. Preservar as variantes futuras | as variantes ficam no código e nas fixtures (seção 4), atrás de `unsupported` |
| 8. Nunca esconder bloqueio ou erro crítico | `BLOCKED`, `INTEGRITY_FAILURE`, `RECORD_LOST`, `warningSignScreen REQUIRED`, `CLOCK_BEHIND_RECORD` nunca são ocultáveis e têm precedência sobre qualquer card |
| 9. Ausência de dado ≠ ausência de capacidade | `missing` × `unsupported` (seção 1) |
| 10. Não prejudicar as ações essenciais | registrar, iniciar e declarar continuam alcançáveis em todos os estados de dados (não nos de segurança, em que o motor manda) |

## 3. Variantes por componente

**Códigos das células:**
- **=** igual à completa;
- **OC** oculta e fecha;
- **EM** estado nomeado pelo motor;
- **AG** "ainda sem dados, não é o mesmo que não feito";
- **ER** erro com recuperação;
- **SK** esqueleto;
- **BL** bloqueado pelo CoachingCore: o bloqueio substitui o conteúdo de treino.

**Colunas:** "Sem relógio" significa só iPhone (cenário A); "Sem GPS" é o cenário D; "Antigas" são as medições `stale`; "Bloqueado" é o estado de bloqueio do CoachingCore.

| Componente (telas) | Completa | Parcial | Sem relógio | Sem Apple Saúde | Sem GPS | Sem histórico | Antigas | Erro | Carregando | Desligado no app | Não sincronizado | Bloqueado |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Card da sessão do dia (20, 30) | prescrição + faixa + estado | sem faixa: só esforço | = | = | = | = | NA | ER (20 `erro ao carregar`) | SK | = | "registro ainda não enviado" | BL: sem prescrição, só "Declarar prontidão" |
| Botão Começar (20, 31, 40, 41) | `startable` | NA | = | = | = | = | NA | oculto | oculto | = | = | oculto (`notStartable`, motivo visível) |
| Manchete e "por quê" do treinador (20, 30, 50) | cópia por código + botão "por quê" | sem razão do motor: o botão some | = | = | = | cópia de primeira semana | NA | OC | SK | = | = | texto do hold (`guidance.level`) |
| Card da prova, estimativa (20, 60, 71) | faixa + meta + base | sem meta: sem a linha da meta | = | = | = | EM "Indisponível, por enquanto" + teste oferecido | EM (`validUntil`, `recency`) | OC | SK | = | = | `HOLD_NO_PRESCRIPTION`: EM |
| Previsão "se seguir o plano" (71) | envelope + `conditionalOn` | só cenário do plano (observado `NOT_ENOUGH_HISTORY`) | = | = | = | EM | EM | OC | SK | = | = | OC |
| Faixas de ritmo (31, 71) | faixa + origem + confiança + validade | só a faixa leve observada | = | = | só esforço na execução; a faixa continua informativa | só esforço | EM (presumida, confiança baixa) | OC | SK | = | = | retida (EM) |
| Zonas de FC (71; 50) | laboratório, ou 3 zonas da máxima com cinta | NA | 71 "sem zonas" | idem | = | idem | EM (`recencyDaysMax`) | OC | SK | = | = | OC |
| Etapas em execução (40) | etapa, alvo, faixa, ritmo ao vivo, distância, tempo | GPS fraco: ritmo oculto, "≈" na distância | = (o iPhone tem GPS) | = | por tempo e esforço, só o tempo | = | NA | sessão interrompida: retomar | NA | localização desligada: por tempo | NA | sessão não iniciável |
| Totais ao vivo (40) | tempo · distância · FC | tempo · distância | tempo · distância (padrão da V1: "sem FC ao vivo") | = | tempo | = | NA | NA | NA | = | NA | NA |
| Registro de força (41) | séries com "Anterior" | sem "Anterior" (primeira vez) | = | = | = | sem "Anterior" | NA | rascunho mantido | NA | = | "salvo neste iPhone, envio pendente" | não iniciável |
| Resumo da corrida (50) | mapa, grade 3 × 2, blocos com FC, gráficos, parciais, leitura | grade 2 × 2; blocos só ritmo; gráficos só com série | tempo e esforço (sem a decisão de GAP-16); com a decisão: distância, ritmo, parciais, rota, elevação | = (o que o app registrou) | tempo e esforço, distância só se informada | = | NA | ER | SK | rota desligada: cabeçalho simples | "envio pendente" | NA |
| Pé do treino (50) | fonte e o que chegou, em uma linha | idem | "registrado no app" | idem | idem | = | NA | OC | SK | = | "aguardando" | NA |
| Importados (50, 60, 81) | corrida: números do HK; força: só a duração | campo a campo | = | OC (seção "Apple Saúde não conectado" com ação) | = | = | "leitura atrasada" | "a leitura falhou" | "primeira importação em andamento" | "uso desligado por você" | "sem dados desde X" (AG) | o importado é guardado; o plano segue bloqueado |
| Histórico, lista e filtros (50) | todas as linhas | linhas sem distância mostram duração | = | sem a origem "importada" | = | vazio · primeiro uso | NA | ER | SK | = | linha "não enviado" | linhas ficam visíveis |
| Progresso, blocos longitudinais (60) | todos | bloco a bloco | sem o bloco de sinais | idem | km só com distância registrada | "poucos dados": blocos com dados mínimos; os demais OC | "mostrando o que estava salvo" | ER | SK | = | = | = (fatos passados) |
| Sinais do relógio (20, 60, 72) | sono, VFC, repouso | só o que chegou (`880:4841`, `880:10566`) | OC ("Sem relógio, sem palpite") | "Não conectado" com ação | = | primeiras noites | EM com a data | OC | SK | aviso com caminho | "Sem dados do Apple Watch desde…" | = |
| Clima (20) | ícone + temperatura | NA | = | = | OC (sem localização) | = | último valor com hora, ou OC | OC | SK | OC | NA | = |
| Fases e volume (20, 30) | fases + minutos previstos e feitos | "cheio é feito, suave é previsto" | = | = | = | só previsto | NA | OC | SK | = | AG nos feitos | o gráfico fica; as sessões sem prescrição |
| Proposta pendente (20, 30, 70, 31) | razão + o que muda + aceitar/manter | sem diff da força: razão + corridas | = | = | = | = | NA | "mudança não aplicada" | SK | = | ação na fila (não aplicada) | BL: proposta suprimida (`suppressed`) |
| Triagem e sinais de alerta (72, 40) | um sinal por tela, 9/13/15 por condição | sem resposta: volta ao sinal | = | = | = | = | NA | rascunho mantido | NA | = | o relato na fila **não** libera treino | ela própria é o caminho de saída |
| Assinatura (80, 70) | etiqueta + estado | carência | = | = | = | = | NA | "planos indisponíveis" | "carregando os planos" | NA | "sem conexão, acesso mantido" | assinatura não remove hold |
| Compartilhar (82) | arte completa | Arte 9 · só a duração | arte sem FC (nunca entra) | = | Arte 2 · sem rota | NA | NA | "erro ao gerar a imagem" | gerando | rota desligada: sem rota | NA | NA |

## 4. Fixtures dos estados

Cada célula da tabela acima é alcançável por uma fixture. Os arquivos `probes/out/*.json`, gerados pelo motor congelado, são a base. C cria as demais a partir do motor, nunca à mão, com os mesmos scripts (`probes/capture-*.mjs`).

| Estado | Fixture real existente |
|---|---|
| Plano válido (semana 0, semana 1) | `02-plan-w0`, `13-plan-w1`, `03-sessions` |
| Pergunta (`NEEDS_INPUT`, `eligibility.currentAssessment`) | `14-setPreferences` |
| Bloqueado (hold clínico) | `16-notFeeling100-sign`, `17-plan-blocked`, `actions-F1/F3` |
| Retorno (prontidão) | `18-declareReadiness`, `19-plan-after-readiness` |
| Proposta pendente, aceita | `actions-B1`, `actions-B2`, `actions-B3`, `actions-A2b`, `actions-A2c` |
| Troca de exercício (ASK, válida, com dor) | `actions-A1`, `actions-A2`, `actions-A3` |
| Parada por sintoma (`warningSignScreen REQUIRED`) | `actions-C1`, `actions-C2` |
| Corrida parcial por tempo, sem distância | `actions-C3`, `actions-C4` |
| Não estou 100% sem sinal, e sem resposta | `actions-D1`, `actions-D2`, `actions-D3` |
| Pausa (ASK de datas) e pausa clínica | `actions-E1`, `actions-E2` |
| Conta apagada (`NO_DATA`/`GONE`) | `actions-F4`, `actions-F5`, `23-error-not-enrolled` |
| Erro de versão (`CONFLICT_STALE_VERSION`) | `22-error-stale-version` |
| Importação do aparelho, sem vínculo, antes do início | `06-import-device-run`, `24-import-unlinked`, `25-import-before-start` |
| Leituras completas (calibração, previsão, insights, exposição de força) | `12-presentation-after-w0`, `08-presentation-after-run` |
| Distância contestada (`POOR`, `CORRECTED_MEASUREMENT`) | `unplanned-5`, `unplanned-7` |
| Avulsa de corrida guardada; força avulsa sem linha | `unplanned-1`, `unplanned-8`, `trace-unplanned-strength.txt` |
| Histórico e decisão | `20-history`, `21-decision`, `26-history-final` |

**Fixtures a gerar pelo mesmo caminho** (lista de trabalho de C, ou de A quando a fixture exige uma projeção nova):
- plano só de força;
- Rafa sem âncora (estimativa `UNAVAILABLE`, `assessment` oferecido);
- Marina caminhada e trote (`effortOnly`);
- semana da prova;
- maratona elegível e não elegível;
- força retida com corrida liberada;
- `RECORD_LOST`;
- `INTEGRITY_FAILURE`;
- `CLOCK_BEHIND_RECORD`.

Os estados que dependem de A, B ou backend, e não do motor, são fixtures do lado Swift das portas. Eles usam os enums do contrato, nunca operações hipotéticas:
- `Startability`;
- `PendingReports`;
- `HealthIngestStatus`;
- `AccountService`;
- StoreKit Testing.
