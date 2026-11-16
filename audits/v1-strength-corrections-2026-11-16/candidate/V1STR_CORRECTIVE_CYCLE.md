# V1STR — o ciclo corretivo único (registro do autor)

Autor: Chief em Fable 5.2. Candidato julgado: `21838cb`. Revisões da rodada 1, como recebidas, no commit `4af0653`: QRE `NOT_READY` (um achado bloqueante) e SSCTR `BLOCK` em três fronteiras, com a exposição `ACCEPT_WITH_CONDITIONS`. Este é o único ciclo corretivo. O registro do candidato (`V1STR_CANDIDATE.md`) não foi editado: o que mudou está aqui.

Nada foi aprovado ainda. Não existe registro de habilitação nem freeze. A reverificação dos dois juízes vem depois deste commit.

## 1. Cada achado e o que foi feito

| Achado | Severidade | O que foi feito | Onde conferir |
|---|---|---|---|
| QRE-STR-A-01 | bloqueante | Num plano em curso, a âncora do slot (`planeAlternation.built`) passa a ser sempre a configuração com que o plano foi construído. O exercício que entra enquanto o equipamento falta nunca vira âncora. Quando o equipamento volta, o slot volta ao exercício original. | teste "SQ-4 c5 (QRE-STR-A-01)"; a probe do próprio juiz `qre-b2-anchor-variants.mjs` |
| SSCTR-STR-A-01 | bloqueante | O slot que pede o plano vertical não prefere uma configuração que uma sessão anterior da semana usa em outro papel. Assim o MAIN nunca herda o estado de dose de um acessório por causa desta regra. | teste "SQ-4 c6 (SSCTR-STR-A-01)", 288 perfis; a varredura do juiz `scan-roles.mjs` |
| SSCTR-STR-A-02 | bloqueante | Para um plano construído sob outras regras, a resposta clínica vem antes da recusa: sinal de alerta, dor com um exercício e hold já registrado recebem exatamente a resposta do ponto de entrada de baixo (`CLINICAL_HUMAN_REQUIRED`, sem proposta). Todo o resto continua `UNSUPPORTED`. | teste "SSCTR-STR-A-02" (sem regra, só a de isometria, outros bytes, só a exposição) |
| SSCTR-STR-A-04a, parte PLANE | condição, não aceita como estava | Um plano novo que abre com prática de movimento (classe de força NONE) não recebe a regra de planos. Era nesses planos que o segundo exercício de puxada estreava uma semana depois, com outra dose, e tirava a linha de tronco sob tempo curto. Ver D-13. | testes "SSCTR-STR-A-04a" (em `v1str-extension` e `v1str-time`) |
| SSCTR-STR-A-04a, parte HOLD | aceita como limitação declarada | A limitação está nos valores e em toda resposta de plano construído sob a regra (`TRUNK_ROW_LEFT_OUT_UNDER_A_TIGHT_SESSION_TIME`). Um teste fixa a contagem e exige que toda linha perdida fosse uma prancha. | `v1str-time.test.mjs` |
| SSCTR-STR-A-06 | condição | Testes acrescentados: ordem conjunta em quatro dias; os três perfis de equipamento do catálogo que faltavam (só kettlebell, elástico + barra fixa, só barra fixa) entram na varredura de todos os testes; orçamento de tempo de 30, 40 e 45 minutos. | `v1str-extension.test.mjs`, `v1str-helpers.mjs`, `v1str-time.test.mjs` |
| SSCTR-STR-A-08 e a leitura D-2 da QRE | observação | Depois de uma mudança de dias que troca os templates, o slot sem âncora prefere o plano vertical só entre exercícios que o plano já usa. Os exercícios verticais não saem mais do plano, e nenhum exercício novo entra. Ver D-15. | teste "SQ-4 c5 (SSCTR-STR-A-08)" |
| QRE-STR-A-02 | condição | Um slot de tronco que fica vazio depois de o atleta pôr um exercício de tronco de lado passa a ser declarado na resposta (`strengthExtension.disclosures`, `TRUNK_SLOT_UNFILLED`), enquanto durar. | teste "SQ-1 c3 (QRE-STR-A-02)" |
| QRE-STR-A-03 | condição | O verificador fixa por hash os quatro registros de freeze anteriores. Um registro editado falha em `--preserved`, `--write` e `--check`. | `scripts/v1str-freeze.mjs` (`PRIOR_SHA256`) |
| QRE-STR-A-06 | observação | As regras viajam na autoridade sob a chave `STRENGTH_RULES` (um Symbol), nunca sob um campo que um valor JSON carregue. Um campo `strength` numa autoridade passada por opção voltou a ser inerte em todos os pontos de entrada, como era em `2dfa216`. | teste "V-EXT-01 only this entry point turns a rule on" |
| QRE-STR-A-08 | condição | Testes novos para os mutantes que sobreviveram e guardavam comportamento declarado: R18, V05, V25, X03, X15, X19, X20, e também R01, X04, X09, X16, V19, V27 e V30. V17 ficou sem caminho: o conjunto de templates de iniciante só existe na classe NONE, que agora não tem slot pedindo plano num plano novo; um teste cobre a estabilidade desses planos. | os três arquivos de teste |
| QRE-STR-A-09 | observação | "Nada mais mudou" passou a cobrir todo arquivo rastreado de `CoachingCore/`, os três registros de revisão que o runtime lê e que nenhum freeze anterior vincula, e arquivos não rastreados em `src`, `v1`, `test` e `scripts`. | `scripts/v1str-freeze.mjs` |
| QRE-STR-A-10 | observação | O cabeçalho do verificador diz que o freeze vincula toda a pasta `candidate/`. O registro do freeze fica fora dela. | idem |
| QRE-STR-A-12 | observação | Um teste próprio roda `v1str-freeze --preserved` dentro da suíte, para que as checagens do teste histórico `I10, V6` continuem rodando nesta linha. Fora de um checkout git ele é pulado, nunca aprovado. | `v1str-freeze.test.mjs` |
| QRE-STR-A-13 | observação | Na exposição, só conta série com repetições inteiras e positivas, e só relato com o `athleteId` do plano. | teste "SQ-3 c2 (QRE-STR-A-13)" |
| QRE-STR-A-07 e SSCTR-STR-A-10 | observação | A consequência de dose de D-6 (puxada com 10 repetições em vez de 8, em 66 planos de iniciante) deixou de existir: vinha da regra de planos em planos que abrem com prática. O que N1 faz às séries e aos minutos da linha de tronco continua, e é do motor (a linha que substitui a prancha segue a regra de dose de sempre). | D-13; `qre-c2-dose-detail.mjs` do juiz |

**Correção ao meu registro (QRE-STR-A-11).** Nesta linha os verificadores antigos dizem mais do que eu escrevi: `v1rfc-freeze --check 1` nomeia o arquivo emendado, os arquivos novos desta extensão (como "fora da extensão dele") e o desvio aninhado do V1RWS; `v1rws-freeze --check 2` nomeia só `r7b-repertoire.mjs`; `v1rc-freeze --check 1` nomeia `r6-adaptation.mjs` e `r7b-repertoire.mjs`, e já falhava em `2dfa216`. Tudo por desenho. Em `2dfa216`, v1rfc e v1rws saem com 0.

## 2. O que fica aberto, com dono

Nenhum destes impede o registro sintético, segundo os próprios juízes. Todos têm de estar resolvidos antes de qualquer uso não sintético ou de qualquer integração.

- **SSCTR-STR-A-03:** a migração de um plano anterior às regras (SQ-1 c7) não existe. Ou todo plano do ambiente nasce sob a regra de isometria, ou a migração é implementada e revista pelo SSCTR.
- **SSCTR-STR-A-04b e QRE-STR-A-05:** um plano construído sob regras que mudaram só recebe a resposta clínica. Falta um caminho de continuação (revisar sob as regras gravadas, ou oferta de plano novo).
- **SSCTR-STR-A-05:** o runtime não lê a data de revisão do registro.
- **QRE-STR-A-04:** só o novo ponto de entrada faz valer o binding do plano. A integração tem de rotear por ele todo plano que carrega o binding; a custódia de referência ainda chama `v1-index.mjs`.
- **SSCTR-STR-A-11 (pré-existente, do motor congelado, não deste candidato):** o estado de dose compartilhado entre a linha MAIN e a linha acessória do mesmo exercício (avanço como MAIN com 3×7 em objetivo de força), e semanas sem nenhuma linha de tronco sob tempo curto. São duas perguntas próprias para o Founder encaminhar.

## 3. O que mudou de comportamento desde o candidato julgado

1. **Quem começa do zero não recebe mais a regra de planos.** Antes recebia a puxada vertical quando havia máquinas ou elástico. Duas expectativas de teste mudaram por causa disso ("SQ-4 c4" e "SQ-4 c9"), e a varredura de 120 perfis mostra a diferença: perfis sem puxar vertical eram 72 no candidato julgado e são 96 agora (120 no motor congelado). Não é ajuste de expectativa para esconder falha: é a regra que ficou mais estreita, e a decisão é do SSCTR (D-13).
2. O slot que pede o plano nunca prefere um exercício que a semana já usa em outro papel.
3. Num plano em curso a âncora é fixa. Quando ela não serve, o plano vertical só é preferido entre exercícios que o plano já usa (antes, nada era preferido).
4. Plano sob outras regras: a resposta clínica vem primeiro.
5. As regras viajam sob um Symbol.
6. A resposta declara duas limitações conhecidas e, quando existe, o slot de tronco vazio.
7. A exposição exige repetições inteiras e o `athleteId` do plano.
8. Os valores mudaram (duas limitações, três descrições da regra de planos). Novo sha: `15a51f55e847ad01d683912d50319629ead68a1cfa00d3c69c5061b3e596850f`. A emenda de `r7b-repertoire.mjs` passou a 43 linhas a mais e 11 a menos (arquivo `0a8d2013…7477`).

## 4. Leituras novas, para os juízes decidirem

**D-13. A regra de planos não vale para plano novo de classe NONE.** Classe NONE é a do próprio motor: experiência abaixo de intermediária e nenhum exercício nomeado. É o plano cuja primeira sessão da semana de estabelecimento é prática de movimento. Ali dois exercícios diferentes do mesmo padrão estreiam em semanas diferentes, o segundo com a dose de estreia de uma semana de desenvolvimento, e a sessão fica mais longa. Sem tocar em dose, o único jeito de não perder a linha de tronco é não diversificar nesses planos. **Custo:** a frase da SQ-4 c4 "eles recebem lat-pulldown ou band-pulldown" deixa de valer para quem começa do zero; continua valendo para o novato que nomeia um exercício (classe FAMILIAR_UNKNOWN_LOAD). Esses atletas passam a ter a alternância num plano novo, quando já não forem classe NONE. Num plano em curso a classe não é consultada: o slot guarda o que tem.

**D-14. "Outro papel" olha as sessões anteriores da semana.** Num plano novo o slot que pede o plano é sempre do último template com empurrar e puxar, então nenhuma sessão posterior pode usar o mesmo exercício como acessório. Num plano em curso a âncora prevalece: se uma mudança de dias fizer um acessório passar a usar o exercício da âncora, o MAIN fica onde está. O estado de dose é o que ele mesmo construiu como MAIN, então a faixa do objetivo não é violada.

**D-15. Depois de mudar os dias.** Quando os templates mudam (2 para 4 dias, por exemplo), o critério de continuidade do próprio motor põe primeiro num slot acessório aberto um exercício que o plano já usa. Com 2 → 4 dias os dois exercícios verticais viram acessórios da primeira sessão superior, e o segundo MAIN volta ao padrão, em vez de dividir o estado com esse acessório. Com 4 → 2, 2 → 3, 3 → 2 e 3 → 4 dias eles continuam MAIN. Em nenhum caso sai do plano um exercício vertical nem entra um exercício novo por causa da regra.

**D-16. No plano sob outras regras só a resposta clínica passa.** Qualquer outra revisão (semanal, fadiga, substituição) continua `UNSUPPORTED`. O caminho de continuação fica aberto (seção 2).

**D-17. A limitação de tronco sob tempo curto, em números.** Em 456 planos com 30, 40 ou 45 minutos por sessão, só com a regra de isometria: 85 semanas com menos linhas de tronco que o plano sem a regra, 32 delas sem nenhuma. Em todas, a linha que cabia antes era uma prancha em repetições. Com a regra de planos sozinha e com a de carga sozinha: zero. O motor congelado, sem regra nenhuma, já deixa mais de mil semanas desses planos sem linha de tronco.

## 5. Evidência deste ciclo (rodada pelo autor)

| Verificação | Resultado |
|---|---|
| Testes próprios (`test/v1str-*.test.mjs`, 5 arquivos) | 64 de 64 |
| Suíte conjunta | 1598 de 1600; as duas falhas são os dois testes históricos de freeze, pelo nome |
| `v1str-freeze --preserved` | 196/196, 30/30, 98/98, 163/163; os quatro registros são os bytes fixados; `r6-adaptation.mjs` autorizado; base, bytes e diff de `r7b-repertoire.mjs` conferem (43+/11-); nada mais mudou; nenhum arquivo não rastreado |
| Probe da fundação no ponto de entrada congelado | 37 de 37 (as lacunas continuam se reproduzindo lá) |
| `probes/probe-v1str.mjs` | 38 de 38 |
| Varredura, 120 perfis: sem empurrar vertical | 116 → 60 (os 60 são planos que abrem com prática) |
| Idem, sem puxar vertical | 120 → 96 (60 abrem com prática; 24 só com halteres; 12 sem equipamento) |
| Probe da QRE `qre-b2-anchor-variants.mjs` | nas três variantes o plano volta a lat-pulldown e db-overhead-press quando o equipamento volta, e a âncora não muda |
| Varredura do SSCTR `scan-roles.mjs` (1500 perfis), sobre este worktree | perfis com MAIN de carga externa fora da faixa do objetivo: 128 sem a regra, 128 com a regra de planos, 128 com todas (era 172 com a regra) |
| Probe do SSCTR `probe-time3.mjs` (600 planos, 30/40/45 min), sobre este worktree | semanas com menos tronco que o plano sem a regra: planos 0, carga 0, isometria 85 (32 sem nenhuma), todas 85 (32) |
| Probe do SSCTR `probe-binding.mjs`, sobre este worktree | plano sob outras regras: sinal de dor, sinal de lesão e dor com um exercício respondem `CLINICAL_HUMAN_REQUIRED` sem proposta; revisão semanal, fadiga sistêmica e semana adversa continuam `UNSUPPORTED` |

As três últimas linhas são os scripts dos próprios juízes, rodados pelo autor sem alteração sobre este worktree. A confirmação é deles, na reverificação.

## 6. Como conferir

Da pasta `CoachingCore/`:

```
node --test test/v1str-extension.test.mjs test/v1str-preservation.test.mjs test/v1str-exposure.test.mjs test/v1str-time.test.mjs test/v1str-freeze.test.mjs
node scripts/v1str-freeze.mjs --preserved
node ../audits/v1-strength-corrections-2026-11-16/candidate/probes/probe-v1str.mjs
```

Numa rodada de mutação do arquivo emendado, deixar `v1str-freeze.test.mjs` de fora: qualquer byte diferente o derruba, o que não diz nada sobre comportamento.
