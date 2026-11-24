# Handoff da missão C: app SwiftUI definitivo do RepMile V1

**Objetivo.** Construir o app SwiftUI **definitivo** do RepMile a partir das telas aprovadas no Figma:
- design system;
- navegação;
- as telas dos fluxos da V1, com todos os seus estados;
- o motion prioritário;
- componentes dirigidos pelos contratos compartilhados.

Enquanto as frentes A (CoachingHost) e B (HealthKit) são implementadas, C trabalha com fixtures fiéis ao motor congelado.

**O que esta missão não é:**
- não é um app descartável;
- não é um segundo produto;
- não implementa motor, prescrição, CoachingHost, HealthKit nem backend.

**Autoridades:**

| Assunto | Autoridade |
|---|---|
| Visual, hierarquia, fluxo e estados | o Figma `90oyvXHxxBQAvr1netov7S` (inventário em `figma-inventory/`) |
| Prescrição, decisões e estados | o CoachingCore congelado (`REPMILE-COACHINGCORE-V1-FINAL-RELEASE-FREEZE`), pelos tipos de `CoachingPresentation` |
| O que cada tela pode mostrar | `UI_CAPABILITY_TRACEABILITY.md`, `UI_DATA_STATES.md` e `UI_CONTRACT_GAPS.md` (esta pasta) |
| Divisão do trabalho | `PARALLEL_IMPLEMENTATION_CONTRACT.md`, com as emendas CHG-UI-4/6 |

## 1. Base e pré-requisitos (não começar sem eles)

| Pré-requisito | Onde | Estado nesta entrega |
|---|---|---|
| CHG-UI-1: pacote `ios/Packages/CoachingPresentation` incorporado à fundação | `FOUNDATION_CHANGE_PROPOSALS.md` | **proposta pronta e testada**, não incorporada |
| CHG-UI-4: ownership de C, sessão `swiftui` na trava, diretórios | idem | proposta, não incorporada |
| Nova base `v1-parallel-base-2-<data>` publicada pela missão de integração | idem, "Como incorporar" | pendente |
| Branch `claude/v1-ios-swiftui` e worktree `/Users/gabrieldecarvalhomaciel/.codex/worktrees/myapp-v1-ios-swiftui/MyApp`, criadas da nova base | idem | pendente (não criadas, para não antecipar a decisão) |

## 2. Primeiros comandos da sessão C (depois da incorporação)

```bash
cd /Users/gabrieldecarvalhomaciel/.codex/worktrees/myapp-v1-ios-swiftui/MyApp
git status --short                         # vazio
git describe --tags --exact-match          # v1-parallel-base-2-<data>
node CoachingCore/scripts/v1-final-release-freeze.mjs --check      # 87/87, exit 0
(cd ios/Packages/CoachingPresentation && swift test)               # verde
(cd ios/Packages/IntegrationContracts && swift test)               # verde
tools/device-lock/with-device.sh status
```

## 3. Leitura obrigatória (nesta ordem)

1. Esta pasta:
   - `UI_CONTRACT_GAPS.md` inteiro (o que não fazer e por quê);
   - `UI_DATA_STATES.md`;
   - `UI_CAPABILITY_TRACEABILITY.md`.
2. `audits/v1-final-physical-2026-11-24/SWIFTUI_BACKEND_HANDOFF.md`:
   - §1 (camadas);
   - §4 (operações);
   - §5 (formas dos formulários);
   - §7 (estados e erros);
   - §9 (apagar).
3. `audits/v1-parallel-foundation-2026-11-24/PARALLEL_IMPLEMENTATION_CONTRACT.md`: §2, §9, §10 e §11, com CHG-UI-4.
4. `ios/Packages/CoachingPresentation` (tipos e porta) e `probes/out/*.json` (as respostas reais).
5. **O Figma.**
   - **Quais páginas:** 00 e 99 primeiro; depois 01 e 02 (fundamentos e componentes); por último as páginas de fluxo.
   - **Como ler:** pelo MCP do Figma, só leitura; `get_design_context` só depois de carregar `figma:figma-design-to-code` e `figma:figma-swiftui`.
   - **Proibido:** editar o arquivo.

## 4. Inventário de fluxos da V1

| Fluxo (páginas) | Situação na V1 |
|---|---|
| Onboarding (10) | implementar inteiro, menos `19 Altura e peso` (GAP-36, salvo decisão); `27 Cuidados` com gestação mapeada (GAP-02) |
| Hoje (20) | implementar; ocultar sono/VFC (GAP-17) e `longão mantido após noite curta` (GAP-23); cópia da pergunta rápida ajustada (GAP-11) |
| Plano (30) | implementar; "mover" vira "não posso neste dia" (GAP-09); fases dependem de CHG-UI-2 (GAP-07) |
| Treino planejado (31) | implementar; "Trocar por leve" e "trocar só hoje" fora (sem operação) |
| Execução de corrida (40) | implementar com as variantes "sem FC ao vivo" como padrão (GAP-34); distância medida depende de CHG-UI-5 (GAP-16) |
| Execução de força (41) | implementar; sem carga sugerida e sem sugestão intra-sessão (GAP-10); força avulsa só confirma com a linha no registro (GAP-12) |
| Concluído e histórico (50) | implementar; números ricos dependem de `loggedEntries` (GAP-06); sem excluir (GAP-13); força importada depende de CHG-UI-3 (GAP-18) |
| Progresso (60) | implementar; "Mapa híbrido" e sinais do relógio ocultos (GAP-25, GAP-17) |
| Perfil e ajustes (70) | implementar; feedback e exportação remota dependem de backend |
| Prova (71) | implementar; zonas só laboratório ou cinta, com 3 zonas (GAP-37) |
| Adaptações e recuperação (72) | implementar; sinais por condição 9/13/15 (GAP-03); "Sinais do relógio" ocultos |
| Conta e assinatura (80) | telas completas sobre `AccountService` com fixtures; StoreKit 2 real com StoreKit Testing; nada de rede de conta (GAP-31/32) |
| Sistema, Apple Saúde e permissões (81) | implementar; "acesso negado" e "em parte" mapeados (GAP-19); outro aparelho oculto (GAP-33) |
| Compartilhar (82) | implementar, com as regras "nunca entram" do próprio 82 e DR-133 |
| Idiomas, texto grande e stress (83) | implementar PT-BR, EN e ES, Dynamic Type e os casos de stress (a página está "A aprovar": a baseline é a do arquivo) |
| Fluxos (90) e Motion (91) | navegação conforme 90; motion prioritário de 91; "Reduzir movimento" sem desenho, então só remover a cascata e manter as transições do sistema |

## 5. Mapeamento de componentes

**Fontes:** a página 01 (15 estilos de texto, 44 variáveis de cor, regras) e a página 02 (47 componentes).

| Figma | SwiftUI | Regra |
|---|---|---|
| Coleção de cor "Autoral" (modo A recomendado, claro e escuro) | `Color` tokens em `RepMileUI/DesignSystem/Colors`, um asset por variável | azul = corrida, laranja = força, branco = agora, champanhe = marco, lima = feito/melhora, vermelho = falta/queda. Nada fora do papel |
| Tipografia Unbounded (números e títulos) + Geist (texto e manchetes) | `Font` tokens com `relativeTo:` (Dynamic Type) | as fontes vão no bundle com a licença conferida (OFL) |
| Ícones (`Ícone/corrida`, `Ícone/forca`, `Ícone/hibrido` e os demais 26) | SF Symbols customizados (SVG → `.symbolset`) | corrida é linha, força é bloco |
| `Traço/*` (16 ilustrações) | assets vetoriais | — |
| Tab bar (Hoje, Plano, Histórico, Progresso) | `TabView` | — |
| Gramática espelhada: painéis da semana, pista de raia dupla, barras espelhadas, grade de consistência, arco de coordenação, escala de esforço | componentes próprios em `RepMileUI/Components` | cheio = feito, suave = previsto, tracejado = vem na semana |
| Mapa (pílula no canto) | `MapKit` (`Map`) | só com rota e rotas ligadas (GAP-29) |
| Dynamic Island e atividade ao vivo | `ActivityKit` | nunca dado de saúde |
| "Marca/Repmile" (5 componentes, página 03) | assets | nome e logo de 16 nov 2026 |

**Regra de componente:**
- cada componente recebe valores prontos (`DisplayValue`, ou os tipos de `CoachingPresentation` já mapeados) e nunca busca dado;
- todo componente com variantes de dados tem um preview por linha de `UI_DATA_STATES.md` §3.

## 6. Contratos de apresentação e dados necessários

**Leitura do motor:** pela porta `CoachingReading` (CHG-UI-1).

| Função | Devolve |
|---|---|
| `plan(week:)` | `PlanView` |
| `allWeeks()` | `[Week]` |
| `presentation()` | corridas como prescritas + leituras |
| `history()` | `HistoryView` |
| `decision(id:)` | `DecisionDetail` |
| `loggedEntries()` | relatos do atleta (CHG-UI-2) |
| `startability(sessionId:)` | se a sessão pode começar |
| `pendingReports()` | o que ainda não foi gravado |

**Escrita:**
- pela porta `CoachingWriting` que A publica com as structs fechadas (CHG-UI-1b);
- até lá, um dublê que só aceita as formas de HO §5.

**Regras da escrita:**
- **identidade:** a UI nunca define `clientRequestId`, `expectedVersion`, `actor` ou ids;
- **rascunho:** mantém o rascunho até `recorded`;
- **erro:** mostra o erro pela tabela HO §7.

**HealthKit:** pela porta `HealthIngestStatusSource` (CHG-UI-3).

**Plataforma:** C usa diretamente só:
- CoreLocation (através de `RunRecorder`);
- WeatherKit;
- StoreKit 2;
- UserNotifications;
- ActivityKit;
- MapKit;
- `UIActivityViewController`.

**Proibições:**
- nunca `HealthKit`, `JavaScriptCore`, `CryptoKit` ou `Security`;
- nunca importar `CoachingHost` ou `HealthKitIngest`.

**Mapeamento obrigatório:**
- `ClientState` e `error.code` → tela (HO §7), com `unrecognized` falhando fechado;
- `warningSignScreen.status == REQUIRED` → triagem antes de tudo;
- `hold` → só o caminho da prontidão;
- `projected` → nunca iniciável;
- `Startability` → o único critério do botão "Começar".

**Cópia:**
- tabela por código (`action`, `kind`, `role`, `turn`, `effortDomain`, `status`, `reason`), em PT-BR, EN e ES;
- nenhum texto do motor em inglês na tela (GAP-24);
- textos clínicos e jurídicos marcados `INTERIM` (GAP-05).

## 7. Dependências das frentes A e B

| C precisa de | De quem | Antes disso, C usa |
|---|---|---|
| `CoachingReading` real | A (item 9 + CHG-UI-2) | provedor de fixtures sobre `probes/out` |
| `CoachingWriting` real | A (structs fechadas) | dublê que valida a forma HO §5 |
| `startability` real (SEC-FPV-01, D1, R7-B0) | A | fixture por `NotStartableReason` |
| `HealthIngestStatusSource` real | B (CHG-UI-3) | fixtures dos 11 estados de 81 |
| Corrida gravada indo ao registro como medida | FDR + B (CHG-UI-5) | tempo e esforço apenas |
| Composição real | INT (`ios/App/Composition/**`) | composição de fixtures no app |

## 8. Estratégia de fixtures

**Origem única:** respostas do motor congelado geradas por script (`probes/capture-*.mjs`).
- Nunca JSON escrito à mão para estado de motor.
- Cada fixture nova nasce de um cenário sintético rodado no Node com o freeze verificado, e o script fica versionado junto.

**Lista existente e lista a gerar:** `UI_DATA_STATES.md` §4.

**Estados que não são do motor:**
- `Startability`, `PendingReports`, `HealthIngestStatus`, `AccountService` e StoreKit são fixtures Swift das portas;
- valores fora do vocabulário dos enums do contrato não podem existir.

**Personas do Figma:**
- Lucas, Marina, Rafa e "só força" viram cenários sintéticos;
- os números das telas do Figma não são copiados para as fixtures: os números vêm do motor para o cenário.

**Teste de fidelidade:** cada fixture do motor decodifica em `CoachingPresentation` (como na proposta); fixture que não decodifica é defeito.

## 9. Critérios de aceite visual

1. Cada tela implementada tem um snapshot por estado de `UI_DATA_STATES.md` §3, comparado lado a lado com o quadro do Figma (id no inventário). As diferenças ficam registradas no relatório.
2. **Variantes de dado:** as variantes de dado ausente fecham o espaço, sem traço e sem "indisponível". A grade 3 × 2 vira 2 × 2.
3. **Idiomas:** PT-BR, EN (milhas) e ES.
4. **Texto grande:** corpo +30% (83) sem truncar decisão, preço ou ação principal.
5. **Aparência:** modo claro e escuro do modo de cor A.
6. **Motion:** a cascata de 3 s e a tabela de tempos (91); com Reduzir movimento, sem cascata.
7. **Telas `FUTURE_ONLY`:** não aparecem em nenhum caminho da V1, mas o componente e o preview existem.

## 10. Critérios de aceite funcional

1. **Começar:** nenhum "Começar" habilitado fora de `Startability.startable`.
   - Fixtures: bloqueado, pergunta, projetado, apagado sem hold, sintoma pendente.
2. **Números:** nenhum número na tela sem `DisplayValue` de fonte declarada.
   - Teste: varrer as views com fixtures de dado ausente e conferir que não sobra nenhum zero nem "—".
3. **Prescrição:** nenhuma prescrição, carga sugerida, razão ou decisão calculada na UI (GAP-10, GAP-23).
4. **Sinais de alerta:** exatamente o conjunto da condição (GAP-03), e uma resposta faltando volta à pergunta.
5. **Formulários:**
   - os formulários produzem só as chaves de HO §5;
   - o dublê de escrita recusa qualquer outra, igual a `admission.mjs`;
   - teste com o JSON produzido pela UI.
6. **Estados e erros:** todos os estados e códigos de HO §7 chegam à tela certa; `unrecognized` falha fechado.
7. **HealthKit:** nenhum texto afirma negação de leitura do HealthKit (GAP-19).
8. **Rede:** nenhuma chamada de rede de conta ou sincronização no build da fase paralela.
9. **Dados de saúde fora do app:**
   - nenhum dado de saúde vai para log, analytics, notificação, Live Activity ou share;
   - share só com o que o 82 permite.
10. **Desempenho:** a UI nunca bloqueia a main thread (alvo do PF-0: stall < 16 ms, medido com fixtures maiores).
11. **Testes:**
    - `swift test` e os testes de UI no simulador, verdes;
    - no iPhone, só pela trava: `with-device.sh swiftui -- …`.

## 11. Limites antes do backend

| Funciona sem backend | Não funciona sem backend (telas prontas, ocultas ou com fixture) |
|---|---|
| todo o treino, registro, plano, histórico local, progresso e prova | conta (entrar, criar, códigos, aparelhos, sair) |
| apagar a conta localmente (`eraseAccount`) e retirar consentimento | assinatura ligada à conta |
| compra e entitlement pelo StoreKit 2 no aparelho | backup e restauração (D2) |
| — | outro aparelho e sincronização |
| — | relógio de servidor (D1 servidor) |
| — | checagem de versão |
| — | feedback |
| — | convite |

## 12. Ownership (com CHG-UI-4)

| Caminho | A | B | C | Integração |
|---|---|---|---|---|
| `ios/Packages/CoachingHost/**`, `ios/Labs/CoachingHostLab/**`, `audits/v1-ios-coachinghost-2026-11-24/**` | escreve | proibido | proibido | — |
| `ios/Packages/HealthKitIngest/**`, `ios/Labs/HealthKitLab/**`, `audits/v1-ios-healthkit-2026-11-24/**` | proibido | escreve | proibido | — |
| `ios/Packages/RepMileUI/**`, `ios/Packages/RunRecorder/**`, `ios/App/RepMile.xcodeproj`, `ios/App/RepMile/**`, `audits/v1-ios-swiftui-2026-11-24/**` | proibido | proibido | **escreve** | — |
| `ios/App/Composition/**`, `ios/*.xcworkspace` | proibido | proibido | proibido | escreve |
| `ios/Packages/IntegrationContracts/**`, `ios/Packages/CoachingPresentation/**`, `tools/device-lock/**`, `audits/v1-parallel-foundation-2026-11-24/**`, `audits/v1-ui-functional-reconciliation/**` | leitura | leitura | leitura | escreve |
| `CoachingCore/**` | proibido | proibido | proibido | só pela regra de exceção pós-freeze |
| `MISSION_LEDGER.md`, `CURRENT_MISSION.md`, `CLAUDE.md`, `canon/**`, `product/**`, `governance/**`, `.gitignore` | proibido | proibido | proibido | escreve |
| O arquivo do Figma | — | — | **só leitura**; correções viram proposta no relatório | Founder/Design |

**Recursos físicos:**
- iPhone só pela trava (`with-device.sh swiftui`);
- `-derivedDataPath <worktree>/ios/.build/DerivedData-C`;
- bundle de desenvolvimento `fit.vilumo.repmile.dev.app.$(DEVELOPMENT_TEAM)`;
- C não pede HealthKit e não usa o Keychain.

## 13. Proibido nesta missão

**No motor e nas outras frentes:**
- mudar `CoachingCore/**`, os contratos compartilhados ou os diretórios de A e B;
- importar HealthKit, JavaScriptCore, CryptoKit ou Security;
- calcular prescrição, carga sugerida, zona, estimativa, previsão ou decisão.

**No conteúdo:**
- mostrar texto do motor em inglês para PT-BR ou ES;
- inventar número de fixture;
- prometer sincronização.

**No Figma:** editar o arquivo.

**No Git:** merge, force-push ou merge automático.

## 14. Relatório final da missão C

`audits/v1-ios-swiftui-2026-11-24/FINAL_REPORT.md`, com:
- as telas implementadas por página;
- os estados cobertos;
- os snapshots e as diferenças visuais;
- os testes;
- os gaps encontrados (como propostas, sem editar contrato);
- o que depende de A, B, INT, FDR e backend;
- a tabela de prontidão.
