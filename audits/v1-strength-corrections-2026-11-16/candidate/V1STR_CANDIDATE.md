# V1STR — Strength Intelligence: as quatro correções aprovadas (registro do autor)

Missão do Founder de 2026-11-16. Autor: Chief em Fable 5.2. Este é o registro do autor sobre o candidato; não é aprovação. A revisão independente (QRE e SSCTR) fica em `reviews/`, como recebida.

- **Base:** `2dfa216` (`claude/v1-run-extensions`, `COACHINGCORE-V1-RACE-FORECAST-FREEZE-1`), verificada antes de qualquer mudança: suíte conjunta 1534 de 1535 (a única falha é o teste histórico de freeze já conhecido), `v1rfc-freeze --check 1` com saída 0, probe da fundação 37/37.
- **Linha própria:** branch `claude/v1-strength-corrections`, worktree `.claude/worktrees/v1-strength-corrections`. A linha congelada não foi tocada. Nada foi enviado nem mesclado.
- **Autoridade:** `audits/v1-strength-intelligence-2026-11-13/STRENGTH_INTELLIGENCE_FOUNDATION.md` e `reviews/SSCTR_SI_V1_DECISION.{md,json}` (SI-V1-SSCTR-SQ-1 a SQ-4), trazidos por cópia dos bytes de `879f23f` no commit `87df347`.

## 1. O que mudou

| Arquivo | Papel |
|---|---|
| `CoachingCore/src/r7b-repertoire.mjs` | **O único arquivo congelado alterado** (36 linhas a mais, 10 a menos). Lê as regras de força que viajam na autoridade do repertório. Sem elas, tudo é como antes. |
| `CoachingCore/v1/STRENGTH_EXTENSION_V1.json` | Valores da extensão (sha `e375a8be…cacb`). Nenhum número esportivo. Vincula o catálogo `R7B0-CATALOG-2` e a decisão SSCTR por hash. |
| `CoachingCore/src/v1-strength.mjs` | Autoridade por fronteira (fail closed), as regras como dado simples, e a exposição semanal descritiva (N3). Não importa o motor. |
| `CoachingCore/src/v1-strength-index.mjs` | Ponto de entrada composto sobre `v1-run-forecast-index.mjs`, que não muda. |
| `CoachingCore/scripts/v1str-freeze.mjs` | Verificador próprio, com a emenda autorizada por hash do arquivo e do diff. Nenhum verificador antigo foi editado. |
| `CoachingCore/test/v1str-*.test.mjs` + `v1str-helpers.mjs` | 47 testes dirigidos. |
| `probes/probe-v1str.mjs` | A probe da fundação refeita no novo ponto de entrada, com as checagens GAP-S2, S5, S6 e S8 invertidas, e a varredura de 120 perfis antes e depois. |

Quatro fronteiras, cada uma ligada só por registro SSCTR independente vinculado ao sha dos valores: `V1X-STRENGTH-HOLD-DOSE` (N1), `V1X-STRENGTH-UPPER-LOADING` (N2), `V1X-STRENGTH-PLANE` (N4), `V1X-STRENGTH-EXPOSURE` (N3). Hoje não existe registro: **por padrão a extensão está desligada**, e os testes rodam sob autoridade de desenvolvimento.

## 2. Como cada correção funciona

**N1 — isometria (SQ-1).** `front-plank` e `side-plank` deixam de ser admitidos (`admitted`), que é o ponto por onde passam slot, alternativa de rotação, substituição, fallback, alternativa de contexto, oferta de escada e validação do plano. Nenhuma dose de tempo foi criada. O tronco continua com `dead-bug`, `bird-dog` e `pallof-press`.

**N2 — MAIN superior em RUNNING_SUPPORT (SQ-2).** Em slot de região UPPER em que RUNNING_SUPPORT é propósito correspondente, a ordem passa a ser familiar → estabelecido → carga externa → propósito → resto. Filtros de equipamento, habilidade e papel não mudam.

**N4 — planos (SQ-4).** Com dois slots MAIN de PUSH (ou PULL) que admitem os dois planos, o segundo na ordem dos templates pede o plano vertical ao construir um plano novo, antes da familiaridade e dentro da guarda de carga. Num plano em curso, o slot guarda a configuração com que foi construído.

**N3 — volume por músculo (SQ-3).** `weeklyStrengthExposure` devolve, para uma semana, as séries de trabalho por músculo primário: planejadas (da prescrição) e executadas (só de séries registradas), separadas. Nada no CoachingCore lê esse valor.

## 3. Leituras do autor que os revisores precisam julgar

Cada item é uma decisão minha de implementação ou um limite conhecido. Peço disposição explícita.

**D-1. Plano preso às regras com que foi construído; sem migração.** O plano grava as fronteiras de seleção sob as quais nasceu (`program.repertoire.strengthExtension`). Um plano construído sem as regras é revisado sem elas, exatamente como o ponto de entrada de baixo o revisa, e nunca adota uma regra no caminho. **Consequência:** as condições sobre "programas existentes" (SQ-1 c7, SQ-2 c6, SQ-4 c5) não têm implementação aqui. Um plano anterior às regras mantém a prancha em repetições até virar um plano novo. Motivo: a troca automática num plano em curso exigiria alterar `r6-adaptation.mjs` (o arquivo já emendado pelo V1RWS, com diff autorizado por hash), e hoje não existe plano real anterior às regras. Para SQ-2 c6 e SQ-4 c5 a leitura é mais estrita que a condição. Para SQ-1 c7 é menos protetora: fica a lacuna, declarada.

**D-2. N4 num plano em curso só conserva.** Numa revisão, o slot que pede o plano vertical mantém a configuração com que foi construído enquanto ela servir. Se ela deixa de servir, valem os critérios de sempre, sem preferência de plano. Assim a regra nunca troca um MAIN nem traz exercício novo para um plano em curso, em fase nenhuma (SQ-4 c5 e c6 por construção). Custo: um plano cujo segundo slot ficou horizontal por falta de opção não passa a vertical quando o equipamento chega, e um slot novo criado por mudança de agenda não recebe a preferência. A adoção fica para um plano novo, ou para a troca de MAIN na virada de bloco que o atleta já pode pedir (B0-C06). Não há adoção automática na virada de bloco.

**D-3. Guarda de carga relativa à escolha do slot sem a regra.** Se o slot, sem a regra, ficaria com uma configuração de carga externa, só um vertical de carga externa é preferido. Se ficaria com peso corporal ou elástico, qualquer vertical é preferido. Exemplos testados: halteres + elástico mantém `db-row` (não entra `band-pulldown`); só elástico recebe `band-pulldown`; só peso corporal recebe `pike-push-up`.

**D-4. Alternância literal.** O primeiro slot segue os critérios de sempre. Se um exercício vertical familiar ganha o primeiro slot por familiaridade (por exemplo `pull-up` ou `barbell-overhead-press` declarados), o segundo slot também fica vertical, e a semana fica sem o plano horizontal daquele padrão. É o mesmo resultado de hoje, sem a regra. Não implementei "o segundo pede o plano oposto ao primeiro", porque isso faria a regra vencer a familiaridade na outra direção, o que a SQ-4 não aprovou.

**D-5. Alcance de N2 nos acessórios.** A regra vale para todo slot superior em que RUNNING_SUPPORT está entre os propósitos: MAIN e acessório sob objetivo RUNNING_SUPPORT, e acessório sob contexto EVENT com outro objetivo. Quando há mais de um propósito, o critério "propósito" inteiro desce para depois de "carga externa" (leitura literal da condição 2). Efeito visível: com academia completa e RUNNING_SUPPORT, `push-up` e `band-row` saem também dos acessórios superiores. Um acessório pode trocar de exercício por consequência (uma configuração é usada uma vez por sessão); nenhum template fica com menos linhas superiores de carga externa do que antes.

**D-6. Dose de quem começa do zero.** A regra de dose não foi tocada. Mas com dois exercícios de puxada diferentes na semana, o segundo tem a primeira exposição uma semana depois do primeiro, e o motor o estabelece pela regra que já aplica a qualquer exercício que estreia fora da semana de estabelecimento. Num iniciante com máquinas isso aparece como `seated-cable-row` com 10 repetições onde o plano sem a regra mostrava 8.

**D-7. Leitura do executado em N3.** Conta só uma série registrada com repetições finitas e positivas, do relato mais recente de cada sessão da semana que não esteja substituído nem em conflito e cuja data local caia na semana. Um exercício registrado só é atribuído se for linha contada daquela sessão. Sessão marcada como concluída sem séries não conta nada. Uma sessão executada em outra semana fica fora (subcontagem, nunca imputação). A semântica de dados (G03) continua sendo dependência.

**D-8. Sem data de validade no runtime.** Como nas extensões de corrida, a fronteira liga pelo registro vinculado ao sha e desliga pela retirada do registro. O "review by 2027-04-30" não é lido pelo código (os registros do catálogo B0 são).

**D-9. Regras que mudaram entre plano e revisão.** Um plano construído sob regras que não são as vigentes (outros bytes, outras fronteiras, ou nenhuma) não é revisado: o motor responde `UNSUPPORTED`, como faz com um plano de outro catálogo. Um hold clínico já registrado responde antes disso.

**D-10. Dois testes históricos falham nesta linha, por desenho.** Ambos nomeiam o arquivo emendado e ficam verdes no próprio snapshot: `V1RC COACHINGCORE-V1-FREEZE-1 is preserved…` (já falhava; agora nomeia dois arquivos) e `I10, V6: every file the two earlier freezes bind…` (novo nesta linha). Nenhum foi editado. Nunca anunciar suíte toda verde nesta linha.

**D-11. Integração não feita.** A custódia de referência (`src/boundary/custody.mjs`) continua chamando `v1-index.mjs`. O novo ponto de entrada não é alcançado por nenhum app. Ligar isso é trabalho de integração, fora desta missão.

**D-12. Autoridade de desenvolvimento.** Este ponto de entrada retira regras que o próprio chamador tente passar. Os pontos de entrada congelados aceitam, como sempre aceitaram, uma autoridade inteira passada por opção (uso de desenvolvimento e teste); uma integração não passa opções.

## 4. Evidência (rodada pelo autor)

| Verificação | Resultado |
|---|---|
| Testes próprios (`test/v1str-*.test.mjs`) | 47 de 47 |
| Suíte conjunta | 1581 de 1583; as duas falhas são os testes históricos de D-10, pelo nome |
| Probe da fundação no ponto de entrada congelado (as lacunas se reproduzem) | 37 de 37 |
| `probes/probe-v1str.mjs` (correções ligadas) | 37 de 37 |
| Varredura, 120 perfis × 12 semanas: perfis sem empurrar vertical | 116 → 60 (os 60 são iniciantes: nenhum vertical admissível em habilidade LOW) |
| Idem, sem puxar vertical | 120 → 72 (48 só com halteres: o catálogo não tem puxada vertical para halteres; 24 sem equipamento) |
| Idem, planos horizontais | iguais (0 e 12) |
| Perfis com prancha em qualquer semana | 0 |
| N1 isolado contra o plano sem a regra, 864 pares de planos | nenhuma linha fora do tronco muda |
| `v1str-freeze --preserved` | 196/196, 30/30, 98/98 e 163/163 arquivos dos quatro freezes idênticos; `r6-adaptation.mjs` são os bytes autorizados pelo V1RWS-2; base e diff de `r7b-repertoire.mjs` conferem; nada mais mudou desde `4f0561b` |
| `v1rfc-freeze --check 1` no snapshot próprio (`2dfa216`) | saída 0 |
| O mesmo nesta linha | DRIFT nomeando `r7b-repertoire.mjs`, por desenho |

Cobertura dos testes pedidos pela missão: iniciantes, intermediários e experientes (NONE, NOVICE, INTERMEDIATE, EXPERIENCED); hipertrofia e suporte à corrida (e geral e força); equipamento limitado (nove perfis, de peso corporal a academia completa); exercícios desconhecidos e familiaridade (experiência sem exercício nomeado, carga antiga, nome fora do repertório); simulação de várias semanas dos doze atletas sintéticos do projeto pelo novo ponto de entrada, com sessões perdidas e resposta adversa.

## 5. O que não foi feito

- Pergunta de familiaridade no onboarding (S0) e nomes em pt-BR (S1): fora desta missão.
- Dose por tempo para isometria (SQ-1 opção b), meta de volume por músculo (G02), previsão de hipertrofia: não existem e não foram criadas.
- Fila humana: os itens HQ-SI-V1-SSCTR-SQ-1 a SQ-4 continuam apenas propostos.
- Figma, HealthKit, onboarding visual, Race Forecast e Run Workout Structure: não tocados.

## 6. Como conferir

Da pasta `CoachingCore/`:

```
node --test test/v1str-extension.test.mjs test/v1str-preservation.test.mjs test/v1str-exposure.test.mjs
node scripts/v1str-freeze.mjs --preserved
node ../audits/v1-strength-corrections-2026-11-16/candidate/probes/probe-v1str.mjs
node ../audits/v1-strength-intelligence-2026-11-13/probe-strength.mjs
```

A suíte conjunta (`node --test`, cerca de cinco minutos) deve falhar só nos dois testes de D-10. Não rodar `npm run verify` nem scripts `verify-r*` (reescrevem evidência de missões fechadas).
