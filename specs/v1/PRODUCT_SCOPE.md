# Escopo da V1 do RepMile

**Autoridade:** pedido direto do fundador de 26/11/2026 ("Autonomous Engineering System V1"), que autoriza a implementação iOS da V1
nos limites abaixo. Produto, domínio esportivo, privacidade e negócio continuam regidos por `canon/CANONICAL_INDEX.md`. O CoachingCore
congelado é a autoridade esportiva. Visual: Figma `90oyvXHxxBQAvr1netov7S` (reconciliação funcional e adendo de 26/11).

**Três autoridades (fundador, 27/11 — reconciliação Figma × SwiftUI, P0).**
- **Figma** (versão aprovada "V1 alinhamento funcional · 26 nov") é a **especificação de UI/UX**: telas, variantes, sequência, navegação,
  copy, perguntas, componentes, estados, layout, tipografia, cores, interações e animações. Não é moodboard nem biblioteca de tokens.
- **CoachingCore** congelado é a autoridade **esportiva**: prescrição, adaptação, segurança, elegibilidade, zonas, progressão, dados
  necessários. Não muda para acomodar interface; nenhum valor esportivo é inventado para satisfazer contrato.
- **`specs/v1/`** documentam como a experiência aprovada se liga aos contratos reais. Conflito Figma × motor: identificar, checar os
  contratos, buscar solução que preserve a experiência, registrar proposta e impacto, pedir decisão quando preciso. **Nenhum agente
  resolve conflito de produto criando uma tela diferente.**
- **Regra permanente:** a ausência de um campo, endpoint, contrato, dado ou serviço não autoriza redesenhar uma tela aprovada. Separe a
  implementação visual da capacidade funcional, não simule comportamento real de forma enganosa e não esconda uma incapacidade atrás de
  uma interface aparentemente pronta. Fiel ao Figma **e** tecnicamente verdadeiro.

**Produto.** App iOS nativo (SwiftUI) de treinamento híbrido: corrida e musculação coordenadas, execução, adaptação segura, histórico e
evolução. Dark-first; azul = corrida, laranja = força. Idiomas: PT-BR, EN, ES.

## 1. Dentro da V1

| Área | Spec | Situação (26/11) |
|---|---|---|
| Raiz, navegação, estados | [F01](features/F01-root-navigation-states.md) | implementado (C) |
| Design system | [F02](features/F02-design-system.md) | implementado (C) |
| Onboarding completo | [F03](features/F03-onboarding.md) | implementado com fixtures; motor real pendente |
| Hoje | [F04](features/F04-today.md) | implementado (C) |
| Plano e detalhe do treino | [F05](features/F05-plan-session.md) | implementado (C) |
| Execução de corrida com iPhone | [F06](features/F06-run-execution.md) | implementado; iPhone pendente |
| Musculação e treinos avulsos | [F07](features/F07-strength-and-unplanned.md) | implementado; #37 aberto |
| Adaptação e segurança | [F08](features/F08-adaptation-safety.md) | implementado; textos clínicos INTERIM |
| Histórico e Progresso | [F09](features/F09-history-progress.md) | implementado com fixtures |
| Perfil, consentimentos, privacidade, zonas de FC | [F10](features/F10-profile-privacy-zones.md) | implementado com fixtures |
| CoachingCore no iPhone (CoachingHost) | [F11](features/F11-coaching-host.md) | frente A em andamento |
| Apple Saúde (canal único de ingestão) | [F12](features/F12-apple-health-ingest.md) | frente B em andamento |
| Paywall e assinatura | [F13](features/F13-subscription-paywall.md) | não iniciado; depende de #28 |
| Gamificação e compartilhamento | [F14](features/F14-gamification-sharing.md) | não iniciado |
| Live Activity, notificações, motion | [F15](features/F15-live-activity-notifications-motion.md) | motion parcial |
| Qualidade, observabilidade, testes | [quality/](quality/) | contínuo |

## 2. Fora da V1
Integração direta com Garmin, COROS ou Polar · Crew social complexo · qualquer capacidade sem contrato ou fonte de dados viável ·
"Tempo por zona" (C10), FC ao vivo (GAP-34), sono/VFC/FC de repouso (#24, padrão), mapa híbrido (GAP-25), excluir relato/remover importado
(#27, padrão V2), evidência pós-onboarding (`UNSUPPORTED_V1`). Componentes `[FUTURO]` do Figma ficam completos e ocultos.

## 3. Limites permanentes
`REAL_ATHLETE_READY = NO` · nenhuma regra esportiva em Swift · nenhum dado pessoal no repositório público · simulador ≠ iPhone ≠ dado real.

## 4. Decisões pendentes do fundador

| # | Decisão | Bloqueia | Padrão aplicado enquanto isso |
|---|---|---|---|
| PR #30 / #21 | Ativar templates, CI e quadro na branch padrão (`r7/decision-authority-closure-base`) | templates de issue/PR no GitHub | CI roda nas branches `claude/v1-*` e na branch de integração |
| #29 | Identidade GitHub própria para os agentes | revisão de code owner real | revisão de agente em contexto independente, registrada como não-humana |
| #28 | Backend: conta, assinatura de servidor, sync, backup | F13, telas de conta | nada de backend |
| — | Preços e política comercial | F13 | **telas de assinatura, paywall e "7 dias grátis" do Figma entram no produto** (fundador, 27/11), mas isso não aprova preço, oferta nem teste grátis definitivos: UI com ambiente de teste claramente identificado, **sem cobrança real** e sem prometer oferta não aprovada |
| — | ~~Altura e peso no onboarding (#26)~~ | — | **Decidido (fundador, 27/11): ficam no onboarding da V1**, conforme o Figma, com armazenamento, unidades, edição e privacidade definidos; se o motor não usar, nenhum uso esportivo é inventado |
| — | ~~Conta e "Salvar o plano"~~ | — | **Decidido (fundador, 27/11): a experiência de conta e salvamento do Figma é parte do produto final.** Sem backend (#28), nada simula conta remota nem salvamento em nuvem quando só há persistência local; nada de autenticação ou recuperação inventadas |
| — | ~~Treinador, objetivos, preferências e horários~~ | — | **Decidido (fundador, 27/11): seguir o Figma.** Reconciliar com os contratos reais; nenhum valor padrão inventado; incompatibilidade vira decisão pendente registrada |
| — | Alpha local | — | **Decidido (fundador, 27/11):** um percurso técnico temporário sem backend é aceitável, registrado como dependência ou configuração de desenvolvimento; **não redefine o design da V1** nem conta como jornada aprovada |
| — | Regras das conquistas (F14) | lógica de gamificação | só cartão de compartilhamento |
| — | Notificações (frequência, opt-in) | F15 notificações | sem notificações |
| #23 | DR-121: gravar corrida do iPhone no Apple Saúde | distância do iPhone no plano | não grava; "medido pelo iPhone, não usado pelo plano" |
| #24 | Sono, VFC, FC de repouso / FC do HealthKit | sinais em Hoje | fora da V1 |
| #25 | Contagem dupla: corrida digitada × treino do relógio | dedupe B | ver F12 |
| #26 | Altura e peso no onboarding | 1 etapa do onboarding | tela mantida, anotada |
| #27 | Excluir relato / remover importado | ações em 50/81 | V2 |
| Figma | ~~Salvar a versão nomeada~~ **Decidido (fundador, 27/11):** a versão "V1 alinhamento funcional · 26 nov" é a referência visual aprovada da V1 | validação visual formal (#14) liberada | a comparação usa o arquivo pelo MCP (estado atual), com a data da captura em cada registro; editar o Figma durante a validação exige avisar |
| — | ~~Modo claro na V1?~~ **Decidido (fundador, 27/11): a V1 tem modo claro**, com valores "A · Claro" do Figma e seguindo a aparência do sistema | F01/F02 | implementação no #94; validação visual (#14) em claro e escuro |
| QRE P1-11 | Corrida avulsa sob gate | — | **decidido provisoriamente pelo fundador (26/11)**: não inicia sob bloqueio clínico, fora do escopo ou triagem pendente; SSCTR confirmou a implementação |
