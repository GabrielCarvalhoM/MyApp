# V1 Run Extensions — Fase A: encerramento (2026-11-14)

**Estado final: `BLOCKED`.** Não é `APPROVED_SYNTHETIC_CANDIDATE`.

- O ciclo corretivo único foi gasto (`84bc985`). A reverificação estreita em `d6381bb` encontrou dois bloqueios. Pela regra S10 do preflight, a fase fecha com eles nomeados, sem segundo ciclo.
- **Não existe** freeze `COACHINGCORE-V1-RUN-FORMAT-FREEZE-1`.
- **Não existe** registro habilitador. `V1X-RUN-NATIVE` continua desligado por padrão: toda sessão sai na expressão por tempo, o comportamento congelado.
- A fase B não foi iniciada. Nada foi enviado (push) nem mesclado.

## 1. Os dois bloqueios

| Id | O que acontece | O que fecha (palavras do juiz) |
|---|---|---|
| **QRE-RWS-B-01** | A marca POOR de uma corrida em vários arquivos é posta por observação, **antes** de o motor fundir as fontes. Quando o relato do app (versão por tempo, com `segments`, sem distância) se funde com a importação do primeiro arquivo, a linha fundida fica sem marca, e a V1RC lê 6,6 km sobre 63 min. A faixa EASY vai de `[345,420]` para `[345,575]`, nas três ordens de chegada. | Nenhuma linha canônica com `segments` e distância, fundidas inclusive, chega à V1RC como evidência de ritmo; teste nas três ordens contra o controle em um arquivo. |
| **SSCTR-RWS-B-01** | O atleta para por sintoma e registra no app (`completed:false`, `stop`); a importação do relógio da mesma corrida chega com `completed:true`. O motor marca a linha como conflitante e põe o outro relato em quarentena. A extensão lê só linhas sem conflito: nenhuma triagem sobe, e até 4 sessões saem nativas na semana seguinte. Já existia em `bcac30d`. | Ler a parada em todo relato de corrida recebido ou guardado, inclusive linhas conflitantes e relatos em quarentena, só para a triagem (nunca crédito, X-2 ou dimensionamento); teste nas três ordens e nas duas expressões; reverificação por instância SSCTR nova, que pode então emitir o registro. |

Os dois têm a mesma raiz: um fato do relato é lido por observação, ou só em linhas sem conflito, e não em toda linha canônica e em todo relato recebido.

## 2. Condições abertas, não bloqueantes

| Id | O quê |
|---|---|
| QRE-RWS-B-02 | A janela de plausibilidade não se aplica quando falta a duração (relato ou linha de histórico do intake). |
| QRE-RWS-B-04 | O `--write` de `scripts/v1rws-freeze.mjs` usa `passed`/`total` antes de declará-los e lança erro; e confia na contagem digitada, sem conferir qual teste falhou. Sem efeito agora, porque nenhum freeze é escrito. |
| QRE-RWS-B-05 | O teste do mutante M04 passa pelo motivo errado (forja a linha TIME); M08a e M18 não têm teste pelo ponto de entrada. |
| QRE-RWS-B-03, B-06 (notas) | A prova "só o leitor" é lexical; lacunas de teste em linhas do ciclo. |
| SSCTR-RWS-B-02 | Sob ASK de elegibilidade, a extensão ainda entrega formatos nativos com `prescribing: true`. Decisão do SSCTR: as corridas vão por tempo e `prescribing` segue a leitura da V1RC. Antes de integração. |
| SSCTR-RWS-B-03 | Um treino digitado no app Saúde chega como distância de aparelho (contrato Data/iOS). |
| SSCTR-RWS-A-04 | `paceEvidence` lê o passo planejado; flancos de pirâmide abaixo de 5 min ficam com `true`. Condição do registro, antes de a fase B ler o campo. |
| QRE-RWS-A-07 | Sob rota clínica as sessões são rotuladas `prescribed: false`. O SSCTR aceita a rotulagem para o candidato sintético; antes de uso com atleta, uma sessão assim nunca pode ser oferecida como treino. A apresentação é de Product. |
| Security A-01, A-04, A-06 a A-08 | Integração: os três registros sob a cadeia com chave da custódia, persistência atômica, apagamento coordenado; base legal dos motivos de parada e dos UUID do HealthKit (Founder/G07). |

## 3. O que ficou verificado (evidência executada pelos juízes em `d6381bb`)

- **Suíte:** 1396 entradas, 1395 passam. A única falha é o teste histórico `v1rc-calibration.test.mjs` "COACHINGCORE-V1-FREEZE-1 is preserved", acusando só `CoachingCore/src/r6-adaptation.mjs`. Nenhum teste de `c8104c1` foi editado.
- **Motor congelado:** sem leitor, `v1-index` e `v1-run-index` são byte a byte iguais a `c8104c1` (194/194 e 82/82 saídas).
- **Freezes históricos:** verdes nos seus snapshots (198/198; 30/30). Na linha, 197/197 + 1 arquivo emendado cujo diff é só o leitor (22+/10−); 30/30.
- **Fidelidade esportiva nos relatos nativos:** oráculos independentes do SSCTR, sem divergência (189.000 seleções de repetições, 95.040 de contínuos; X-2 em 30.940 sequências). Os exemplos r2, r3 e r3a reproduzem. F-1 decidido: vale a ordem escrita (WE-17 = 1 × 2600 m + 1 × 15 min).
- **Fechados na reverificação:** SSCTR A-02, A-03, A-05, A-09, A-13; QRE A-03, A-05, A-07, A-08, A-09, A-10; Security A-02, A-03. Decisões do SSCTR: escopo da prova (RACE) confirmado; vários arquivos fiel à r3a; janela de plausibilidade aceita como limite de engenharia; formato da semana fiel à N10.
- **Athlete Data Foundation:** H1–H6 e H8 corretos (SSCTR, primeira revisão).

## 4. Commits desta fase (linha `claude/v1-run-extensions`)

| Commit | O quê |
|---|---|
| `bcac30d` | Candidato |
| `f9e1220` | Rodada independente, como recebida |
| `84bc985` | Ciclo corretivo único |
| `d6381bb` | Teste de autoridade independente do registro habilitador |
| (este) | Reverificações como recebidas e este encerramento |

Valores: `CoachingCore/v1/RUN_FORMATS_V1.json`, sha256 `26c6e3fbfeee864376643c485d64a616f1cf13ea49d82b2cc223c02d7a06353c`.

## 5. Próximo passo (não iniciado)

Um fix-forward da fase A, autorizado pelo Founder, restrito aos dois bloqueios e às condições da seção 2 que tocam o runtime, com reverificação por instâncias novas de SSCTR e QRE. Só depois: registro habilitador, freeze `V1RWS-1` e fase B.

Itens de fila humana propostos pelos juízes, **não anexados** (fila em 235): HQ-V1RWS-A-SSCTR-F1-MIXED-ORDER, HQ-V1RWS-A-SSCTR-R2-ELIGIBILITY-ASK.

`CURRENT_MISSION.md` e `MISSION_LEDGER.md` não foram alterados nesta fase.
