# Contrato de integração iOS: relatos de corrida de uma execução (orientação vinculante, 2026-11-15)

**O que é:** a regra que o adaptador iOS (HealthKit e app) terá de cumprir ao enviar relatos de corrida ao CoachingCore.
**O que não é:** uma integração. Nada aqui foi implementado, nenhum HealthKit foi lido, nenhum teste de adaptador existe. Os dois hard gates da seção 6 seguem **não atendidos**.

Origem: missão do Founder de 2026-11-15 (patch do QRE-RWS-E-01, item 6). Reúne e fixa o que os juízes da fase A deixaram para a integração: QRE-RWS-E-02, SEC-RWS-E-01, SSCTR-RWS-E-01, itens I-1, I-2, I-4, I-5 e I-8, e o achado E-1 (item L5 do SSCTR).

## 1. Por que

O Core decide quem falou pelos campos de origem do relato (`speakerOf`): o atleta, uma atividade de aparelho identificada, ou um aparelho não identificado. Um relato fica em vigor até uma correção aplicada **do mesmo autor** o substituir, e uma linha só vai a leitor de ritmo, capacidade ou prova quando carrega todos os relatos em vigor.

Essa regra só protege o atleta se cada relato tiver um autor só. Hoje o contrato de dados deixa o cliente mandar uma observação que mistura a medida do aparelho com o que o atleta disse. Nas quatro formas que os juízes mediram, a re-sincronização do aparelho devolve a corrida à evidência de ritmo (leve `[345,575]`), porque o Core lê um autor substituindo o próprio relato.

## 2. A regra: dois relatos por execução, um por autor

Uma execução que o aparelho mediu e o atleta comentou chega ao Core como **dois relatos**, cada um com o seu id, ligados pela identidade da execução.

| | Relato do aparelho (medição) | Relato do atleta (declaração) |
|---|---|---|
| Quem fala | uma atividade do HealthKit | o atleta, pelo app |
| Identidade de quem fala | `canonicalActivityId` e `source.activityId` = UUID do `HKWorkout`, **o mesmo em toda re-sincronização** (I-1) | nenhum id de atividade, em nenhum campo (I-2) |
| Origem | `source.provider: 'HEALTHKIT'`, `source.quality` de aparelho | sem `source`, ou `provider` `MANUAL` / `SELF_REPORT` e nada além (I-8) |
| O que leva | o que o aparelho mediu: duração, distância, `measurement`, `gpsQuality`, as gravações do próprio aparelho | o que o atleta disse: esforço (`rpe`), resposta (`performance`, `recovery`, `effort`, `nextDayFunction`), parada e o motivo, sintomas, condições, pausas para caminhar, distância declarada e motivo de falha, ritmo de trabalho informado, gravação que o atleta acrescentou, o formato citado e as voltas que o atleta confirmou |
| O que nunca leva | nada do que o atleta disse; `response` vai como desconhecida | medida nenhuma apresentada como do aparelho; nenhum id de atividade |
| Correção | a re-sincronização corrige **só** o relato do aparelho e repete tudo o que o aparelho diz (I-4) | a edição do atleta corrige **só** o relato do atleta e repete tudo o que o atleta diz (I-4) |

**Vínculo pela identidade da execução.** Os dois relatos nomeiam a mesma execução: o `sessionId` da sessão do plano (ou, numa corrida fora do plano, a identidade da atividade no relato do aparelho). O adaptador guarda no seu próprio armazenamento qual atividade está ligada a qual sessão. O vínculo **nunca** é feito pondo o id da atividade no relato do atleta, nem pondo campos do atleta no relato do aparelho.

**A origem vem do canal, não do corpo.** Quem grava `source` é o adaptador ou a custódia, pelo canal por onde o dado entrou (consulta ao HealthKit, ou formulário do app). O que o corpo do relato afirma sobre a própria origem não é lido como prova (SEC-RWS-E-01).

## 3. Reconciliação com `ATHLETE_DATA_FOUNDATION.md`, seção 2.2

A linha "Sessão do plano feita (app ou Apple Saúde)" da seção 2.2 descreve **uma** observação com `source{provider, activityId}` que também leva campos do atleta (`steps`, `declared`). É a forma que o QRE-RWS-E-02 mostrou insegura (caso K1) e que conflita com a I-2.

Para a integração, essa linha passa a ser lida assim:

| Seção 2.2, como está | Como a integração a cumpre |
|---|---|
| Uma observação por sessão feita, com origem de aparelho e campos RWS do atleta | Até dois relatos por execução, um por autor (seção 2). A observação com `source.activityId` é só a medição. Os campos do atleta vão no relato do atleta, sem id de atividade |
| "Uma sessão recebe, no máximo, um treino importado" | Sem mudança |
| "O treino vinculado nunca é reenviado solto" | Sem mudança |
| Correção por `correctionOf`, `supersedes`, `declared` | Sem mudança de forma; cada correção é do seu autor e repete tudo o que ele diz (I-4) |

A seção 3.2 (mapa HealthKit → campo canônico) e as regras de vínculo 1 a 5 ficam como estão: o vínculo é o `sessionId`.

`ATHLETE_DATA_FOUNDATION.md` **não foi editado**: é autoridade amarrada por hash no freeze V1RWS-1. Este documento é a leitura vinculante da linha citada para quem construir o adaptador. Se o Founder quiser a seção reescrita, é uma revisão daquele documento, com o seu dono.

## 4. Registros já guardados: a autoria não muda

- O autor de um relato é gravado no fato quando o relato é recebido e fica sob o selo do fato. Nenhuma migração, reparo ou re-sincronização reescreve o autor de um fato guardado, nem "reparte" depois um relato antigo em dois.
- Um relato antigo que misturou as duas vozes sob um id de atividade continua sendo, para o Core, da atividade. Vale a leitura conservadora da seção 5 para o que vier depois dele.
- A separação da seção 2 vale para relatos novos, a partir de quando o adaptador a adotar. A data de adoção fica registrada pela integração.

## 5. Quando a origem não pode ser demonstrada

O adaptador nunca atribui um autor para tornar uma evidência admissível. Vale o que o Core já faz, e o adaptador não o contorna:

| Situação | Leitura do Core | Efeito |
|---|---|---|
| Importação sem id de atividade, com dois ids diferentes, ou com id ilegível | aparelho não identificado | não substitui nada e nada o substitui; depois de qualquer correção a corrida fica fora da evidência de ritmo |
| Provedor nomeado sem id de atividade | aparelho não identificado | idem |
| Relato que o registro do motor nomeia e que não tem fato | em vigor, de autor não mostrado | idem |
| Origem que o canal não sabe dizer | o adaptador envia como aparelho não identificado, nunca como atleta | idem |

A parada por sintoma fica fora de tudo isto: nenhuma dessas leituras a remove; só a triagem respondida depois.

## 6. Hard gates de uma integração real: não atendidos

**E-1 (achado do motor, item L5 do SSCTR). Uma re-sincronização não pode apagar as respostas de esforço e de recuperação do atleta.**

- O defeito está no motor congelado e continua: uma correção aposenta a linha inteira. Se a re-sincronização do aparelho chega como `correctionOf`, a linha viva perde o que o atleta respondeu (recuperação `ADVERSE` → `UNKNOWN`, `adverseSessions` 1 → 0).
- A separação da seção 2 **não resolve o E-1 sozinha**: com dois relatos, a correção do aparelho ainda aposenta a linha fundida inteira. A extensão só retém a evidência de ritmo dessa corrida; não devolve as respostas ao motor.
- Antes de qualquer integração ou atleta real, a integração mostra por teste de resultado, nos casos ADVERSE, SYMPTOM, FATIGUE e HEAT, nas duas formas de envio:
  1. a revisão que aplica a re-sincronização lê o que o atleta declarou por último (recuperação, esforço, função no dia seguinte, parada, dor, condições, pausas);
  2. a triagem segue pedida para a parada por sintoma;
  3. as declarações do atleta seguem em vigor.
- Reapresentar o relato do atleta depois não basta: a revisão do meio não pode entregar prescrição calculada sem as respostas do atleta (SSCTR, L5).
- Se isso pedir mudança no motor congelado, a decisão é do Founder.

**As duas vozes (QRE-RWS-E-02, SEC-RWS-E-01, SSCTR-RWS-E-01).** O adaptador mostra, por teste de resultado, que nenhuma das quatro formas chega ao Core:

| Forma | Teste do adaptador |
|---|---|
| Um relato só, com a medida do aparelho e o acréscimo do atleta | K1 |
| Importação sem nenhum campo de origem | K4 |
| Relato do app que leva o id da atividade | K5 |
| `provider: 'MANUAL'` com id de atividade | o quarto caso do parecer de Security (SEC-RWS-E-02) |

## 7. O que continua aberto e não é deste documento

- A fração de corridas que fica fora da evidência de ritmo para sempre, e o caminho de volta se for material (L1-f, SSCTR-RWS-E-04). O patch do QRE-RWS-E-01 a aumenta: ver `E01_PATCH.md`, seção 7.
- Custódia com chave, gravação atômica, `asOf` do servidor, reparo auditado de registro ilegível, apagamento e retenção de dado de saúde, base legal (I-6, I-7, I-9 a I-11; Security A-01, A-04, A-06 a A-08, C-03, C-04, D-02).
- O comportamento real do HealthKit numa re-sincronização. Ninguém o mediu.
