# CoachingCore V1 Final Closure — registro de encerramento (2026-11-11)

**V1_SCOPED_COACHING_CORE_READY = YES**, com condições nomeadas. A aprovação vale para o CoachingCore no recorte V1, em dados sintéticos. Não vale para produção, backend, segurança operacional nem aplicativo publicado, e não autoriza atletas reais.

Flags normativas inalteradas: V1_COACHING_AUTHORITY_READY = NO, INTEGRATION_READY = NO, F08 = F08_OPEN, fila humana em 235. Nada foi enviado ao remoto nem mesclado. Nenhum Figma foi tocado.

## 1. Origem e commits

- Origem: `3b14804` (branch `claude/v1-integration-boundary`), o candidato da missão interrompida. O worktree dela ficou intacto; os cinco arquivos pendentes foram copiados byte a byte (`290cf09`).
- Branch desta missão: `claude/coachingcore-v1-final-closure`, worktree `.claude/worktrees/v1-final-closure`.

| Commit | Conteúdo |
|---|---|
| `9d41d00` | Segurança (SEC-V1CIB-01 a 04), autoridade das alterações, corte V1 de F08 |
| `2d089c0` | Candidato revisado: 5 km e maratona, condições do SSCTR, jornadas |
| `06bbc7f` | O ciclo corretivo único |
| `438443b` | Rechecagens, registros de evento, migração de quatro testes |
| `a23460b` | Resíduo do SEC-V1FC-01, por autorização do Founder (exceção estreita ao limite de ciclos) |

## 2. Correções implementadas

- **Segurança herdada (SEC-V1CIB-01 a 04):** uma alteração pendente é fechada, com a causa, por exclusão de dados, revogação de consentimento, novo plano ou revisão posterior, e nunca é adotada sobre um hold. O reinício exige o consentimento COACHING e usa o consentimento de aprendizado que a custódia guarda. Os digests da cadeia são com chave.
- **Autoridade das alterações (PCG-V1CIB-F01):** mover uma sessão perdida (MOVE) e rearranjar dias por padrão aprendido (LEARNED_REARRANGEMENT) viraram ofertas. A mesma revisão é decidida sem a alteração, essa decisão é aplicada, e a alteração espera o atleta aceitar ou recusar. Uma recusa vale: o mesmo padrão não é oferecido de novo.
- **Corte de F08 no runtime:** a Situação 1 (redução temporária, com janelas, degraus, checagens, escadas de retorno e cadeias) não existe na V1. O ponto de entrada da V1 é `src/v1-index.mjs`, usado pela custódia.
- **5 km e maratona:** extensão `V1X-EVENTS` (`src/v1-events.mjs`, `v1/EVENT_EXTENSION_V1.json`), com valores decididos pelo SSCTR (decisão e duas emendas) e habilitada por registro de um revisor independente, por evento.
- **Achados da rodada de revisão:** três de Segurança, dois do SSCTR e dois do QRE bloqueavam; todos fechados. Detalhe por achado em `FIX_CYCLE_V1FC.md`.

## 3. Capacidades suportadas na V1

Ver o contrato na seção 11.

## 4. Capacidades excluídas ou simplificadas

- **Redução temporária por indisposição (F08 Situação 1): fora.** O relato "não estou 100%" continua sendo triado: qualquer sinal de alerta respondido sim abre o hold clínico; sinal sem resposta é perguntado. Com todos os sinais em não, o plano é mantido e a resposta traz a indisponibilidade tipada. O atleta pula a sessão (nunca é reposta) ou declara uma pausa.
- **Retornos clínicos, lesões, doenças:** fora. O hold fica no registro e só a declaração de prontidão do atleta o libera, por modalidade. Novo plano, novo onboarding ou omissão de estado nunca liberam.
- **Maratona para quem não é elegível:** não recebe bloco de maratona; recebe o plano preparatório, que diz o que falta.
- **Fora de qualquer forma:** ultra, ritmo ou previsão de tempo, zonas, prescrição de nutrição, hidratação ou calor.

## 5. Evidências de treino normal e coordenação híbrida

`evidence/JOURNEYS_V1FC.txt` (e `.json`): 16 atletas simulados semana a semana e 2 jornadas pela fronteira do app. Cobrem iniciante nas duas modalidades, experiência desigual, híbrido equilibrado, prioridade corrida, prioridade força, 5 km, 10 km, meia, maratona, sessão perdida, sessão parcial, semana difícil, poucos dados, mudança de disponibilidade, dado ausente, hold, reinício do servidor. Os invariantes do simulador valem em todas. O SSCTR julgou as jornadas normais coerentes: progressão por sessão executada, sem dívida após falta, cada modalidade mantendo seu estímulo.

## 6. Testes

- Suíte completa: **1258 de 1258** em `a23460b` (1213 herdados + 45 novos).
- Arquivos novos: `v1fc-boundary`, `v1fc-scope`, `v1fc-events`, `v1fc-review-fixes`, `v1fc-review-fixes-qre`.
- Diferencial do QRE contra `3b14804`: 990 linhas de digest idênticas byte a byte (10 km, meia e planos sem prova, com suas revisões). O que existia não mudou.
- Quatro testes antigos que afirmavam o padrão anterior aos registros (5 km como performance, maratona não suportada) passaram a declarar "extensão desligada"; o comportamento afirmado é o mesmo.

## 7. Pareceres independentes (todos em `reviews/`)

| Papel | Rodada em `2d089c0` | Rechecagem em `06bbc7f` | Final |
|---|---|---|---|
| SSCTR | NOT_READY pela maratona | READY_WITH_CONDITIONS; 5 km e maratona aprovados | READY_WITH_CONDITIONS |
| QRE | NOT_READY | READY_WITH_CONDITIONS | READY_WITH_CONDITIONS |
| Segurança | FAIL | FAIL por um resíduo do SEC-V1FC-01 | PASS_WITH_CONDITIONS em `a23460b` |

A decisão esportiva (`ssctr-decision/`) foi escrita por uma instância do SSCTR e julgada por outra.

## 8. Pendências

**Antes de qualquer texto visível ao atleta (Product):**
- SSCTR RC-01: a nota de prova de conclusão da maratona abre com uma frase que se contradiz.
- Redação de urgência continua INTERIM_PENDING_G04.

**Condições de integração (INTEGRATION_READY continua NO):**
- QRE-V1FC-03: o mesmo relato de sessão reenviado com outro id de requisição devolve erro de contrato em vez de resposta tipada.
- QRE-V1FC-05: a integração não passa opções ao ponto de entrada.
- Partes operacionais ainda por construir: autenticação, gestão de chaves, banco de produção, backups que respeitem a exclusão, monitoramento, limites de taxa e de tamanho, fixação dos arquivos de autoridade (inclusive o de registros de evento).

**Antes de dados reais:**
- SEC-V1FC-04: após uma exclusão, o plano armazenado ainda guarda entradas de planejamento derivadas de saúde dos eventos apagados.
- SEC-V1FC-09 (informativo): dois campos da cadeia aceitam uma forma equivalente sem efeito.
- O modelo de aprendizado após revogação do consentimento.
- G07 (base legal, textos, prazos), do Founder com assessoria jurídica.

**Governança, a cargo do Founder ou do Chief:**
- Entradas propostas para a fila de revalidação humana (HQ-V1FC-SSCTR-A, B1, B2, B3, C); não foram anexadas.
- Registro da decisão de produto do recorte V1 no PDR (PCG).
- Dois pontos que o SSCTR sinalizou como escolha do Founder: o iniciante de 5 km sem a escada específica, e a segunda semana após a maratona só com corridas leves.
- A decisão do SSCTR expira em 2027-05-11.

## 9. Estado de prontidão

| Dimensão | Estado |
|---|---|
| V1_SCOPED_COACHING_CORE_READY | **YES**, com as condições acima |
| Recorte V1 imposto no runtime | Sim |
| 5 km e maratona | Ligados por registro independente |
| F08 | Situação 1 fora da V1; F08_OPEN inalterado |
| Custódia | Implementação de referência, só sintética |
| INTEGRATION_READY | NO |
| Atletas reais | NÃO AUTORIZADO |

## 10. Freeze

`COACHINGCORE-V1-FREEZE-1`, em `CoachingCore/v1/RUNTIME_FREEZE_V1_1.json` (commit vinculado e digests no próprio registro; conferir com `node scripts/v1fc-freeze.mjs --check 1`). Os freezes anteriores não foram tocados; R7D-FREEZE-6 é citado como referência.

## 11. Contrato de capacidades para a reconciliação com o Figma

O app mostra estados e sessões; não recalcula nenhuma regra.

**Quem é atendido.** Adultos recreativos não clínicos, de iniciante absoluto a experiente, em corrida, força ou as duas.

**Objetivos de corrida.**
| Objetivo | O que o motor entrega |
|---|---|
| Começar a correr | Caminhada/corrida em escada, até 3 exposições por semana |
| Regularidade, condicionamento | Corridas leves e longão, progressão por tempo |
| Performance | Idem, mais uma sessão de qualidade (limiar) quando há 3 dias de corrida |
| 5 km, 10 km, meia | Fases de prova: específico, taper de 1 semana, semana da prova, pós-prova. No 5 km, a escada de esforço de 5 km só para quem tem base (intermediário ou experiente, 6+ meses quando conhecido); os demais mantêm limiar |
| Maratona, atleta elegível | Bloco de 6 semanas específicas, taper de 2 semanas, janela de prova de 360 min; 7 dias sem correr depois, e só corridas leves até o dia 14 |
| Maratona, atleta não elegível | Plano preparatório, sem fase de prova e sem sessão de prova; lista cada critério não atendido com o valor do atleta |

**Elegibilidade da maratona (todas).** Corrida contínua e atual; longão recente de 90 min ou mais; 180 min semanais ou mais; 4 dias de corrida ou mais; 150 min disponíveis no dia do longão; prova a 12 semanas ou mais e dentro do plano de 16; intermediário ou experiente; e a projeção do próprio bloco alcançar longão de 150 min antes do taper. Na prática entra quem já faz por volta de 130 min de longão e 300 min semanais em 5 dias.

**Dia de prova.** Sempre por esforço, sem tempo prometido. Vira "conclusão" (esforço de conversa, com caminhadas) para quem está em caminhada/corrida ou retorno, e na maratona quando o maior longão executado entre 7 e 3 semanas antes da prova fica abaixo de 150 min. Nesse caso o app oferece primeiro uma prova posterior ou mais curta; manter a prova continua sendo escolha do atleta.

**Força.** Hipertrofia, força, geral e manutenção; seleção por equipamento, substituição, progressão por série registrada; cargas nunca inventadas.

**Híbrido.** Prioridade corrida, força ou equilíbrio; dias duplos com ordem; força reduzida perto de prova; preferências de treinador, volume e dificuldade.

**Adaptações que o app pode oferecer.**
| Ação do atleta | Resposta |
|---|---|
| Registrar sessão feita ou parcial | Progride ou mantém pela evidência |
| Registrar sessão não feita | Zero, sem reposição; para sessão-chave pode vir uma oferta de mover, que espera confirmação |
| Mudar disponibilidade, equipamento, objetivo, preferências | Proposta que espera confirmação |
| Mudar a data de uma maratona, ou trocar para 5 km ou maratona no meio do plano | Pede um novo plano |
| Declarar pausa | Retorno conservador a partir do executado |
| "Não estou 100%" | Triagem de sinais; sem sinal, plano mantido com aviso de que esta versão não ajusta sozinha |
| Sinal de alerta ou dor | Hold: nenhuma prescrição até a declaração de prontidão, por modalidade |

**Estados que a tela precisa tratar.** VALID_PLAN, PENDING_CONFIRMATION, NEEDS_INPUT, RETURNING, BLOCKED, INTEGRITY_FAILURE, OPERATIONAL_ERROR, NO_DATA, e NOT_SYNCED (do próprio app). REDUCED não é produzido na V1.

**O que o Figma não deve prometer.** Fluxo de redução temporária com janelas e escada de retorno; liberação de hold por outro meio que não a declaração de prontidão; ritmo, zonas ou previsão de tempo; nutrição; ultra; bloco de maratona para iniciante.
