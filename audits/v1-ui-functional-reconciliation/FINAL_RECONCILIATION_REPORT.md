# RepMile V1: relatório final da reconciliação funcional (Figma × CoachingCore × iPhone)

**Data:** 2026-11-24 · **Branch:** `claude/v1-ui-functional-reconciliation`, criada de `claude/v1-parallel-foundation` em `077f031`, com worktree própria em `/Users/gabrieldecarvalhomaciel/.codex/worktrees/myapp-v1-ui-reconciliation/MyApp`.

**Estado: CONCLUÍDA como reconciliação documental e arquitetural.**
- Nenhuma tela SwiftUI, CoachingHost, HealthKit ou backend foi implementada.
- O Figma não foi editado.
- O CoachingCore não mudou: `--check` 87/87, exit 0 (`results/freeze-check.txt`); diff de `CoachingCore/` contra `077f031` = 0.

**O que continua sendo NO:** **REAL_ATHLETE_READY = NO** e **APPLICATION_READY_FOR_RELEASE = NO**, como no freeze.

## 0. Estado Git verificado

**Antes de criar qualquer coisa:**
- a branch `claude/v1-ui-functional-reconciliation` não existia, nem local nem no remoto;
- a worktree nova não colidia com nenhuma existente.

**A e B ficaram intactas** (`results/git-state.txt`):

| Ref | Commit | Estado |
|---|---|---|
| `claude/v1-ios-coachinghost` | `8d2a7c0` | limpa, igual ao remoto |
| `claude/v1-ios-healthkit` | `8d2a7c0` | limpa, igual ao remoto |
| tag `v1-parallel-base-2026-11-24` | `8d2a7c0` | — |
| `claude/v1-parallel-foundation` | `077f031` | limpa |
| `claude/v1-cc-final-physical` | `a7e2e24` | — |

**Contratos compartilhados:** `ios/`, `tools/` e `audits/v1-parallel-foundation-2026-11-24/` têm diff 0 contra `077f031`.

**Análise anterior:** a "análise documental inicial" citada na missão não existe como arquivo no repositório. As descobertas foram tomadas da própria missão e aprofundadas (§6).

## 1. Cobertura por fluxo

**Fonte:** `figma-inventory/`, um dump somente leitura das 25 páginas, sem falha de leitura.

| Fluxo | Telas | Estado no Figma | Cobertura na matriz |
|---|---|---|---|
| 10 Onboarding | 60 | Aprovado | §1 da matriz |
| 20 Hoje | 29 | Aprovado (+2 "ainda não vistas") | §2 |
| 30 Plano | 34 | Aprovado | §3 |
| 31 Treino planejado | 21 | Aprovado | §3 |
| 40 Execução corrida | 46 | Aprovado (+4 "ainda não vistas") | §4 |
| 41 Execução força | 34 | Aprovado | §5 |
| 50 Concluído e histórico | 50 | Aprovado | §6 |
| 60 Progresso | 27 | Aprovado | §7 |
| 70 Perfil e ajustes | 35 | Aprovado | §8 |
| 71 Prova | 50 | Aprovado | §8 |
| 72 Adaptações e recuperação | 30 | Aprovado | §8 |
| 80 Conta, acesso e assinatura | 86 (78 + 8 e-mails) | Aprovado | §9 |
| 81 Sistema, Apple Saúde e permissões | 37 | Aprovado (+1 e splash "ainda não vistas") | §9 |
| 82 Compartilhar | 35 (11 + 24 artes) | Aprovado | §9 |
| 83 Idiomas, texto grande e stress | 14 | **A aprovar** | §9 |
| 90 Fluxos, 91 Motion | — | — | §9 (motion); 90 usado na navegação |
| 00 Guia, 99 Handoff | transcritas na íntegra | — | regras aplicadas em todo o documento |
| 01, 02, 03 | fundamentos, componentes, marca | — | handoff C §5 |
| 04, 05 | landing e Instagram de pré-lançamento | fora do app | não reconciliadas (fora do escopo do app) |
| ZZ Legado | só nomes | sem autoridade | não usada |

**Total:** 588 telas de fluxo, número que bate com o Guia (`897:2`).

**Não inspecionado, declarado:**
- camadas ocultas (o 99 cita dois nós de texto ocultos na página 80);
- qual opção está selecionada em pílulas e checkboxes;
- linhas repetidas "Não/Sim" dentro de um mesmo quadro;
- o conteúdo de 04 e 05.

## 2. Componentes e capacidades examinados

**Matriz:** 154 linhas em `UI_CAPABILITY_TRACEABILITY.md`, uma por componente ou comportamento distinto, com todas as telas onde aparece.

**Base funcional:** cada linha suportada cita código congelado ou uma resposta real da fronteira.
- **Respostas capturadas:** 59 arquivos em `probes/out/`, gerados por 3 scripts de captura e 1 traço, com o freeze verificado.
- **Determinismo:** duas execuções completas deram os mesmos bytes (`results/probe-determinism.txt`).
- **Fixtures:** essas mesmas respostas são as fixtures iniciais da frente C.

## 3. Capacidades confirmadas para a V1

**SUPPORTED_CORE, com probe:**

*Plano*
- cadastro e primeiro plano;
- semana, mês, todas as semanas e sessões projetadas;
- iniciar só o que é executável.

*Registro*
- registro de corrida por tempo e esforço;
- registro de força com séries, reps, carga e RIR;
- parcial;
- sessão perdida sem dívida;
- correção com histórico;
- contestação de distância medida (`declared` → `POOR` / `CORRECTED_MEASUREMENT`);
- corrida avulsa;
- importação de corrida do HealthKit, vinculada e sem vínculo, e recusa antes do início do registro.

*Mudanças no plano*
- dia indisponível → proposta → confirmar ou recusar;
- preferências e perfil do treinador → proposta;
- troca de exercício por preferência ou técnica → proposta; com dor → humano;
- pausa clínica e não clínica.

*Segurança*
- "não estou 100%" com o conjunto de sinais por condição (9/13/15) → mantém o plano ou retém;
- prontidão por modalidade com `returnSpeed` → retorno;
- parada por sintoma → triagem obrigatória;
- apagar fatos de saúde; apagar a conta;
- todos os estados de cliente e erros principais (`VALID_PLAN`, `PENDING_CONFIRMATION`, `NEEDS_INPUT`, `RETURNING`, `BLOCKED`, `OPERATIONAL_ERROR`, `NO_DATA`).

*Leituras*
- calibração: capacidade, faixas, estimativas faixa-primeiro, maratona indisponível sem meia, projeção indisponível;
- previsão "se seguir o plano";
- insights de ritmo (informativos);
- exposição de força (descritiva);
- recordes de corrida.

**SUPPORTED_IOS:**
- localização e GPS ao vivo (só exibição);
- StoreKit 2 no aparelho;
- notificações;
- Live Activity;
- MapKit;
- WeatherKit (só contexto);
- compartilhamento do sistema.

**SUPPORTED_APP_LAYER:**
- conversão da esteira;
- contagens e consistência;
- tonelagem e recordes de força a partir do registro;
- navegação, motion, idiomas e Dynamic Type.

## 4. Capacidades condicionadas à disponibilidade dos dados

Regra comum: o componente existe com todas as variantes; o que não chegou fecha o espaço (`UI_DATA_STATES.md`).

**Dependem do histórico e da âncora do atleta:**
- faixa de ritmo calibrada × só esforço;
- estimativa × "Indisponível, por enquanto";
- teste de campo oferecido;
- zonas de FC só com laboratório ou máxima medida com cinta (3 zonas);
- previsão observada só com histórico (`NOT_ENOUGH_HISTORY`).

**Dependem de permissão e sinal:**
- distância e ritmo ao vivo só com GPS;
- mapa só com rota e rotas ligadas.

**Dependem de projeções de A (CHG-UI-2):**
- histórico rico, "Anterior", evolução e Progresso longitudinal (GAP-06);
- fases e volume previsto (GAP-07);
- detalhe da proposta na força (GAP-08).

**Dependem da porta B → C (CHG-UI-3):**
- força importada só com a duração (GAP-18);
- estado do Apple Saúde e atraso de sincronização.

## 5. Funcionalidades destinadas à V2 ou futuras (estrutura preservada, oculta na V1)

**Relógio e sinais fisiológicos:**
- FC ao vivo (GAP-34);
- sinais do relógio: sono, VFC, FC de repouso, VO₂ máx, cadência, elevação, séries de FC (GAP-17, salvo decisão de leitura só para exibição);
- relato de sono do atleta (GAP-35);
- zonas Z1–Z5 e tempo por zona (GAP-37).

**Plano e treino:**
- "Mapa híbrido" e zona da meta (GAP-25);
- sugestão do treinador e carga sugerida dentro da sessão de força (GAP-10);
- mover para um dia escolhido (GAP-09);
- excluir e remover treinos (GAP-13).

**Conta e dados:**
- outro aparelho e sincronização (GAP-33);
- altura, peso e força relativa (GAP-36).

**Fora da V1 pela decisão de produto:** Garmin, COROS e Polar diretos, envio ao relógio e WorkoutKit (DR-117/122). O próprio Figma já os retirou.

## 6. Incompatibilidades encontradas

**Total:** 37 em `UI_CONTRACT_GAPS.md`.

| Classe | Itens |
|---|---|
| `SAFETY_BLOCKER` | 5 |
| `CORE_CONTRACT_GAP` | 11 |
| `DATA_SOURCE` | 3 |
| `STATE_MAPPING` | 4 |
| `COPY_ONLY` | 3 |
| `APP_IMPLEMENTATION` | 5 |
| `BACKEND_REQUIRED` | 3 |
| `FUTURE_ONLY` | 3 |

**Descobertas novas desta missão** (além das já conhecidas):
1. **13 × 15 sinais de alerta: não é erro do Figma.**
   - O motor pergunta por condição (`signsFor`): 9, 13 ou 15.
   - Os 13 da tela são exatamente o conjunto de "cansaço fora do comum", na mesma ordem; a prontidão usa os 15.
   - O risco real é a UI completar ou replicar a tabela. A solução é a fachada reexportar a função congelada (GAP-03).
2. **Gestação ou parto recente:** perguntado no cadastro, lido pelo motor (`specialPopulation`), mas **ausente da lista fechada de chaves do intake** (SEC-INT-05). Se as structs de A seguirem a lista, a resposta se perde (GAP-02, segurança).
3. **Histórico congelado mínimo:** o histórico congelado só tem data, feito/não feito e minutos de sessões vinculadas; o resto (50, 60, 82) depende de uma projeção de A (GAP-06).
4. **Força avulsa:** a força avulsa responde `recorded` e não fica no registro (GAP-12, a investigar por A antes de a tela dizer "salvo").
5. **Corrida só com o iPhone:** a distância, o ritmo, a rota e as parciais da corrida medidas pelo app não têm caminho honesto até o registro sem decisão de gravação no HealthKit (GAP-16). Ninguém é dono do gravador da corrida hoje (CHG-UI-5).
6. **Zonas de FC:** o motor tem três zonas, de laboratório ou máxima com cinta; o Figma mostra cinco zonas e uma "máxima informada" (GAP-37).
7. **Lista de chaves incompleta:** a lista de chaves de SEC-INT-12 não tem `actual.sport` (avulsa) nem `actual.declared` (contestar distância), que o motor lê.

## 7. Correções de texto e de estado necessárias

Todas são propostas, com o nó do Figma. Nada foi editado.

**Cópia:**

| Gap | Tela | Correção |
|---|---|---|
| GAP-23 | 20 `572:203` | "Por que nessa ordem?" só com razão do motor |
| GAP-23 | 20 `572:1379` | sai da V1 (decisão por sono) |
| GAP-23 | 60 | "Contexto para o plano" → "não entram no plano" |
| GAP-11 | 20 `575:1172` | a pergunta rápida não promete o desfecho |
| GAP-10 | 41 `665:486` | sem "Baixar para 70 kg" |
| GAP-09 | 30 `593:689` / `597:1909` | "Toque e segure para mudar o dia…" |
| GAP-19 | 81 `848:383` | "FC sem permissão" → "nenhuma FC recebida" |
| GAP-37 | 71 | zonas "baixa · moderada · alta" |
| GAP-24 | geral | textos do motor em inglês nunca na tela; cópia por código |
| GAP-05 | geral | textos clínicos e jurídicos marcados `INTERIM` |

**Estado:**

| Gap | Mapeamento |
|---|---|
| GAP-19 | "acesso negado" → "nada recebido" |
| GAP-20 | ações que pedem a triagem atual |
| GAP-21 | "atualização necessária" → validade R7-B0 |
| GAP-22 | tabela completa de estados e erros, com falha fechada para estado desconhecido |
| GAP-04 | "Começar" só por `startability` |

## 8. Bloqueios reais

**Antes de atletas reais** (não impedem implementar):
- GAP-01 `syntheticOnly` (FDR);
- GAP-02 gestação no schema (A);
- GAP-03 sinais por condição (A, C);
- GAP-04 SEC-FPV-01 e a triagem pendente (A, C);
- GAP-05 textos clínicos e jurídicos (FDR, JUR, SSCTR);
- os do freeze: SEC-FPV-01/02/03, G07, D1/D2/D3, SEC-INT-05/12, SSCTR-BC-01, C-BC-3, HealthKit real com o app fechado, semana sincronizada real, logs sem dados de saúde;
- renovação R7-B0 até **2027-04-30**.

**Decisões do Founder que mudam o escopo da V1 sem relógio:**
- GAP-16: gravar a corrida do app no HealthKit;
- GAP-17: ler sinais do relógio só para exibição;
- OPEN-1: fontes de terceiros;
- GAP-36: altura e peso.

**Para começar a frente C:** CHG-UI-1 + CHG-UI-4 (§10).

## 9. Contrato compartilhado final

**O que vale hoje, sem mudança:**
- `IntegrationContracts` (A ↔ B);
- o contrato paralelo;
- os handoffs A e B (todos em `8d2a7c0`).

**O que esta missão propõe** (`FOUNDATION_CHANGE_PROPOSALS.md`, nenhuma aplicada):

| Proposta | Conteúdo | Estado |
|---|---|---|
| CHG-UI-1 | pacote `CoachingPresentation` (A → C): tipos das views, leituras e respostas, porta `CoachingReading`, `Startability`, `DisplayValue`/`Availability` | pronta e testada: 6/6 contra as respostas reais (`results/swift-test-coaching-presentation-proposal.txt`) |
| CHG-UI-2 | projeções da fachada de A e correções da lista de schema | escopo de A, sem tocar o motor |
| CHG-UI-3 | porta B → C de estado da ingestão e importados não-corrida, aditiva em `IntegrationContracts` | proposta |
| CHG-UI-4 | ownership de C, sessão `swiftui` na trava, diretórios | proposta |
| CHG-UI-5 | gravador da corrida e decisão de gravação no HealthKit | proposta |
| CHG-UI-6 | emendas de texto | proposta |

**Procedimento de incorporação:** fast-forward de A e B, sem reescrita (`FOUNDATION_CHANGE_PROPOSALS.md`, "Como incorporar").

## 10. Prontidão para a implementação SwiftUI e recomendação

**A e B podem começar com os contratos atuais? Sim.**
- **B:** pode começar já em `8d2a7c0`, sem mudança. CHG-UI-3 é aditiva e pode chegar depois.
- **A:** pode começar já, pelos itens 1 a 8 do handoff (bundle de produção, runtime, host, store, lock, D1).
- **Antes de A fechar as structs (item 9),** A precisa receber:
  - CHG-UI-2 itens 2.7 e 2.8, as correções de schema, uma delas de segurança;
  - CHG-UI-1, para não criar tipos de view paralelos.

**A frente C pode começar? Ainda não.**
- O contrato §10 não lhe dá diretório e reserva `ios/App/**` e as telas à integração.
- Não existe o pacote de tipos contra o qual C programaria.
- Com CHG-UI-1 + CHG-UI-4 incorporados, numa base nova publicada pela integração, C começa no mesmo dia. A proposta do pacote já existe e passa nos testes.

**Existe incompatibilidade que precisa ser corrigida antes de começar? Para A e B, não.**
- Para C, só a incorporação de CHG-UI-1 e CHG-UI-4.
- Nenhuma incompatibilidade exige mudar o CoachingCore.

| Critério | Estado |
|---|---|
| FIGMA_VISUAL_BASELINE_PRESERVED | YES |
| CORE_CONTRACT_RECONCILED | YES |
| IOS_DATA_SOURCES_MAPPED | YES |
| WATCHLESS_V1_SUPPORTED | YES |
| PARTIAL_DATA_STATES_DEFINED | YES |
| FUTURE_WEARABLE_UI_PRESERVED | YES |
| UI_TRACEABILITY_COMPLETE | YES |
| SWIFTUI_HANDOFF_READY | YES |
| PARALLEL_A_B_C_READY | NO |

**Escopo de cada resposta:**

**FIGMA_VISUAL_BASELINE_PRESERVED**
- Nada foi editado. As correções propostas não mudam layout, só cópia ou estado.

**CORE_CONTRACT_RECONCILED**
- Cada ação dependente do motor tem operação identificada, ou gap registrado com solução sem mudar o motor.

**IOS_DATA_SOURCES_MAPPED**
- HealthKit, GPS, MapKit, WeatherKit, StoreKit, notificações, ActivityKit e backend foram mapeados, com o que cada um pode e não pode afirmar.

**WATCHLESS_V1_SUPPORTED**
- **Funciona sem relógio:** treino completo de corrida e força: plano, execução por tempo e esforço, força com séries e cargas, registro manual, histórico, progresso e adaptações.
- **Depende de GAP-16:** a distância medida pelo iPhone chegar ao registro.

**PARTIAL_DATA_STATES_DEFINED**
- `UI_DATA_STATES.md`.

**FUTURE_WEARABLE_UI_PRESERVED**
- As variantes ficam no código, ocultas por `unsupported`, com fixtures.

**UI_TRACEABILITY_COMPLETE**
- 588 telas cobertas.
- **Ressalvas:** 83 "A aprovar", telas "ainda não vistas" e camadas ocultas não inspecionadas.

**SWIFTUI_HANDOFF_READY**
- Pronto como documento.
- **Primeiro passo:** a incorporação de CHG-UI-1 e CHG-UI-4.

**PARALLEL_A_B_C_READY**
- **Bloqueio:** a incorporação de CHG-UI-1 e CHG-UI-4, uma ação pequena da missão de integração com OK do Founder.
- **Escopo do bloqueio:** só a frente C.
- **Quem avança independentemente:** A (itens 1 a 8) e B (inteira).

## 11. Arquivos desta missão

`audits/v1-ui-functional-reconciliation/`:
- `UI_CAPABILITY_TRACEABILITY.md`
- `UI_DATA_STATES.md`
- `UI_CONTRACT_GAPS.md`
- `SWIFTUI_IMPLEMENTATION_HANDOFF.md`
- `FOUNDATION_CHANGE_PROPOSALS.md`
- `FINAL_RECONCILIATION_REPORT.md`
- `figma-inventory/` (25 páginas, `pages.md`)
- `probes/` (scripts e `out/`)
- `proposals/CoachingPresentation/`
- `results/`

Fora desta pasta, só uma entrada insert-only em `MISSION_LEDGER.md`.
