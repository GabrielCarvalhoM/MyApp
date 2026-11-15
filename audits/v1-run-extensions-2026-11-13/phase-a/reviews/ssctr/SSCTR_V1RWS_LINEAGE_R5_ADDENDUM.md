# SSCTR — adendo à r5 da linhagem: emissão do registro habilitador de `V1X-RUN-NATIVE` — 2026-11-15

**Decisão: EMITIDO**, para o candidato sintético `4b1622f`, com `APPROVE_WITH_CONDITIONS` e `SUPPORTED_WITH_LIMITS`.

- **Arquivo:** `audits/v1-run-extensions-2026-11-13/phase-a/reviews/ssctr/SSCTR_V1RWS_RUN_RECORDS.json`.
- **sha256 do registro:** `a5b915c66f942e17e5e3eb39ef187921e4e65684866c7687af4f6997d44cbf02`.
- **Autoria:** mesma instância SSCTR da r5 (claude-opus-5-5, SSCTR-1.0.0, SSCTR-CONST-1.0.0), sob PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. Não houve revisão humana, validação empírica nem juízo clínico.

## 1. O que conferi antes de emitir

- **Worktree.** HEAD `b624189`. `git diff --name-only 4b1622f b624189 -- CoachingCore` dá vazio. O sha256 de cada arquivo de runtime amarrado no registro é igual em `git show 4b1622f:` e no worktree. A r5 commitada é byte a byte a que escrevi (`44f511c4…`).
- **Valores.** `FORMAT_VALUES_SHA256` é `26c6e3fb…`. Ele bate com o sha256 dos bytes de `CoachingCore/v1/RUN_FORMATS_V1.json`, também num processo novo.
- **Os dois pareceres.** Li inteiros, eu mesmo, `QRE_V1RWS_LINEAGE_R5.md` e `SEC_V1RWS_FOCAL_R4.md`.
  - **Quality:** `READY_WITH_CONDITIONS`, nenhum BLOCKING, QRE-RWS-D-01 CLOSED.
  - **Security:** `PASS_WITH_CONDITIONS`, nenhum BLOCKING, SEC-RWS-D-01 CLOSED no Core.
  - Nas três revisões, nenhuma condição pesa sobre o candidato sintético.
- **A sonda de QRE-RWS-E-01.** Rodei `qre/r5-1794748569/q5-workpace2.mjs` (sha256 `8467d915…`) sem mudar nada, nas duas árvores. Saída em `ssctr/r5-1794748575/out/addendum-*-workpace2.json`. Reproduzi o achado:
  - fundida: `THRESHOLD_CONTROLLED [300,335]` nas duas;
  - correção simples: `[290,325]` em `a4a434f`, e `[300,335]` com 4× `REPORT_NOT_CARRIED` no candidato;
  - correção que lista uma gravação: `[290,325]` nas duas, nada retido.
- **O runtime lê o registro.** Num processo novo, `runFormatAuthority()` dá `approved["V1X-RUN-NATIVE"] === true`, `source: CURRENT_INDEPENDENT_REVIEW`, um registro com 14 condições, e `allowsFormat` é verdadeiro. `node --test test/v1rws-format.test.mjs` dá 7 de 7: o teste de autoridade confere o hash e `independent`. Não rodei mais nenhum teste.

## 2. As duas perguntas

**QRE-RWS-E-01. Não pesa na emissão para o candidato sintético. É condição antes de integração ou de atleta real, e a correção é no Core.**

- **Minha leitura esportiva.** O ritmo de trabalho de uma linha sem distância está **dentro** da regra de L1. Não o declaro fora.
  - L1 é sobre a linha ir a um leitor de ritmo ou de capacidade sem carregar todos os relatos em vigor. Na r5 aceitei a leitura 1 do autor, da retenção da linha inteira, por esse motivo.
  - Aqui a linha perdeu a marca POOR do aparelho, e a faixa de limiar derivada da capacidade fica 10 s/km mais rápida. Isso é direção de mais intensidade sobre evidência de proveniência incompleta.
- **Por que não bloqueia o sintético.**
  - O defeito já existia em `a4a434f`, e o candidato fecha a metade da correção simples.
  - Ele pede uma combinação específica: sessão de qualidade, relógio POOR e uma correção do próprio atleta que liste uma gravação ou declare falha.
  - Com a fronteira desligada, a calibração congelada lê a mesma linha do mesmo jeito. O registro não cria o vazamento.
  - Pelas condições da V1RC, o esforço governa toda faixa e o atleta desacelera quando faixa e esforço discordam.
  - Os dados são sintéticos.
- **A condição, no registro.** Numa linha sem distância, um motivo de linha inteira retém mesmo quando a própria linha tem um motivo só de distância, com teste de resultado da sessão de qualidade. Não peço decisão do Founder para isso.

**QRE-RWS-E-03. Vale a L4 como decidi.**

- Um relato que o motor recusou continua em vigor. O contrato diz isso na seção 3.2 e na própria linha 16 da matriz ("em vigor: tudo, e ela também"). Na L2 escrevi: "o motor recusar um relato não torna falso o que ele disse".
- A L4 se aplica a todo relato em vigor fora da linha, desde que o valor seja utilizável (L4-a) e a linha dê histórico (L4-b).
- A célula "histórico: o mesmo" da linha 16 fica superada pela L4. Deve ler-se "o mesmo, ou menor pela L4". A correção documental é do dono do contrato.
- O efeito só baixa a referência: um D nativo menor, ou TIME na mesma dose. No longão, 16 vai para 9,6, e o próximo longão sai por tempo em 100 min. Nunca há dose a mais.

## 3. O que o registro amarra

O registro é para o commit `4b1622f` e os bytes de runtime que julguei:
- os três `src/` da extensão;
- `v1-run-calibration`, `v1-run-index`, `v1-index`, `r6-adaptation` e `r6-provenance`;
- os valores `26c6e3fb…`.

Qualquer mudança neles pede nova verificação SSCTR independente.

As condições são:
- todas as da r5, seção 7;
- QRE-RWS-E-01 nos termos acima;
- as condições de integração que Quality mantém (E-02: I-1, I-2, I-4 e I-8 verificáveis, os testes K1, K4 e K5, e a reconciliação do contrato de dados com I-2 e I-4);
- as que Security mantém (SEC-RWS-E-01: a origem gravada pelo canal de entrada, os testes B1, B2 e C1; SEC-RWS-E-04 e a C-04 ampliada; a D-02 ampliada; A-01, A-04, A-06 a A-08 e C-03).

O hard gate L5, inclusive na forma de um relato só, fica como gate **não atendido**, antes de qualquer integração ou atleta real.

`sourceIds` são os das decisões SSCTR RWS r1 a r3a, verificados naquelas decisões. Nenhuma afirmação científica é nova. Não refiz a verificação das fontes nesta passagem.

## 4. O que não verifiquei

- A suíte inteira e `v1rws-freeze` (`--preserved` e `--write`); o efeito de o registro existir sobre outros testes além de `v1rws-format`. O coordenador roda a suíte.
- QRE-RWS-E-01 pela variante `CORRECTED_MEASUREMENT` no ponto de entrada. Reproduzi só a que lista uma gravação, como o QRE.
- As sondas de Security (`e-speaker`, `e-forge`, `e-selfread`) e as demais do QRE: li as saídas relatadas, não as rodei.
- As fontes citadas em `sourceIds`, que não reverifiquei.
- A fração real retida (L1-f), o importador do HealthKit e a custódia.

**Fila humana, só proposta e não anexada:** os itens da r5.

**Contexto do host:** o mesmo declarado na r5. O MEMORY.md tem sha256 `407dd7b7…` e não foi usado como evidência.

Neste passe escrevi no worktree só o registro e este adendo. Não usei nenhum git de escrita.
