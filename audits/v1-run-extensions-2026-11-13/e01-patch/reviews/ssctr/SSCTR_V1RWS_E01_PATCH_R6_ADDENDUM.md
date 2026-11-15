# SSCTR — adendo à R6 do patch do QRE-RWS-E-01: confirmação do registro habilitador de `V1X-RUN-NATIVE` — 2026-11-15

**Decisão: CONFIRMADO COM CONDIÇÕES**, para o candidato sintético `f8b08aaf4516f5376a31a67b43e72ec9a2d64f29`, com `APPROVE_WITH_CONDITIONS` e `SUPPORTED_WITH_LIMITS`.

- **Arquivo:** `audits/v1-run-extensions-2026-11-13/e01-patch/reviews/ssctr/SSCTR_V1RWS_E01_PATCH_RECORD_CONFIRMATION.json`. O sha256 está na mensagem ao coordenador, porque este adendo não pode conter o hash do arquivo que o nomeia sem mudar.
- **Registro confirmado:** `phase-a/reviews/ssctr/SSCTR_V1RWS_RUN_RECORDS.json`, sha256 `a5b915c66f942e17e5e3eb39ef187921e4e65684866c7687af4f6997d44cbf02`, conferido por mim. **Não foi editado.**
- **Autoria:** a mesma instância SSCTR da R6 (claude-opus-5-5, SSCTR-1.0.0, SSCTR-CONST-1.0.0, skill 1.0.0), sob PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. Não houve revisão humana, validação empírica nem juízo clínico.
- **A confirmação não é um freeze.** Não autoriza atleta real, integração nem produção.

## 1. O que conferi antes de emitir

- **Worktree.** HEAD `f8b08aaf…`. `git status --porcelain` mostra só `?? audits/v1-run-extensions-2026-11-13/e01-patch/reviews/`, e `git diff --stat HEAD` dá vazio: nenhum arquivo rastreado mudou.
- **Runtime e valores, nos bytes do worktree:**
  - `v1-run-format.mjs` `e8f364e3…`, `v1-run-history.mjs` `06deb84c…`;
  - `v1-run-format-index` `fd38ebb0…`, `v1-run-calibration` `0eae6521…`, `v1-run-index` `a86b6f1e…`, `v1-index` `8a9bdd50…`, `r6-adaptation` `6cedcb72…`, `r6-provenance` `2b9c5ccc…`;
  - `RUN_FORMATS_V1.json` `26c6e3fb…`.

  São os bytes que julguei na R6. Os hashes completos estão no registro de confirmação.
- **Os meus dois arquivos da R6** seguem com os hashes entregues: `.md` `88eb7dc4…`, `.json` `2b8e9321…`. Não os editei.
- **O parecer de Quality.** Li inteiros, eu mesmo, `QRE_V1RWS_E01_PATCH_R6.md` (`d430b578…`) e `.json` (`f4e457bc…`). Veredito `READY_WITH_CONDITIONS`, nenhum BLOCKING. QRE-RWS-E-01 CLOSED. Uma condição nova (F-01) e cinco notas (F-02 a F-06).
- **Execução minha nesta passagem:** `r6b-merge.mjs` (`ffdbfbf6…`), para o F-01 (seção 3).

## 2. Item 1: o pré-requisito está atendido

**Sim.** O pré-requisito era: Quality não pede mudança de runtime, nem mostra efeito esportivo que eu não tinha visto.

- **Mudança de runtime:** Quality não pede nenhuma para este patch. A opção (b) do F-01 é uma mudança fora do patch, e Quality a oferece como alternativa, não como pedido.
- **Nada antes retido passa a ser entregue.** Na diferencial estrita de Quality (2.133 chamadas por condutor, dois condutores, oráculo independente), R3 dá 0 entregas e 0 motivos mudados.
- **Dose, crédito e triagem não mudam.** R1 dá 0 diferenças na parte do motor em 1.454 respostas de plano. R2 dá 0 diferenças em triagem, perguntas, ofertas, pausa, histórico e status. As execuções só diferem em `paceWithheld` e `paceEvidence`.
- **O que eu não tinha visto:**
  - **S3 do longão:** a fonte passa de 360 para 365 s/km, e o longão segue em 16 km, com o mesmo teto CT-3. É a mesma regra da leitura 2, aplicada a um valor que não muda a expressão nem a dose.
  - **Linhas de formato:** mudam em 186 respostas, sempre junto com as sessões entregues. É consequência da leitura 2, não efeito novo.
  - **Custo medido (F-06):** a evidência de relógio OK ou só de minutos deixa de mover a faixa depois de uma correção do atleta. É o custo L1-f que já aceitei (leitura 6).
- **Leituras 1 e 2:** Quality as aceita nos mesmos termos. Na leitura 2 deixa a palavra esportiva para mim, e eu a dei na R6.

## 3. Item 2: QRE-RWS-F-01

**Reprodução minha.** `r6b-merge.mjs`: sessões de qualidade das semanas 3 a 6, relato do app com ritmo de trabalho 255 e esforço 7, importação do relógio com 9 km, fundidas pelo motor sem correção, semana 7. As saídas das duas árvores são iguais byte a byte (`1e44c5d8…`).

| Forma | Linha fundida | Limiar, fator |
|---|---|---|
| relógio OK, nada mais (evidência legítima) | OK | `[290,325]`, +0,03 |
| relógio POOR | POOR | `[300,335]`, 0 |
| atleta HEAT, relógio sem condição | HEAT | `[300,335]`, 0 |
| **atleta HEAT, relógio `conditions: ['RAIN']`** | **RAIN** | **`[290,325]`, +0,03** |
| **app `gpsQuality: OK`, relógio PARTIAL e POOR** | **OK** | **`[290,325]`, +0,03** |
| **atleta TREADMILL, relógio GPS OK** | **GPS** | **`[290,325]`, +0,03** |

**A minha palavra esportiva.**
- **É a mesma classe de L1.** Um fato que torna a observação não comparável é dito por um relato em vigor e se perde por um valor de outro locutor no mesmo campo. A corrida volta a ser evidência de ritmo, e a faixa de limiar fica 10 s/km mais rápida: direção de mais intensidade sobre comparabilidade incompleta. Não é o E-01, e o patch não o cria nem o piora.
- **Não pesa na confirmação para o candidato sintético.**
  - Já existia em `4b1622f`, cujo registro o meu papel emitiu.
  - É idêntico no congelado e no patch.
  - Pede uma integração que mande de um locutor o campo do outro.
  - Pelas condições da V1RC, o esforço governa toda faixa.
  - Os dados são sintéticos.

  É a mesma razão pela qual o E-01 não pesou na emissão.
- **O fechamento.** Aceito a opção **(a) como mínimo**, em duas condições:
  - o contrato do adaptador torna **disjuntos** os campos dos dois locutores para todo fato de comparabilidade. O relato do aparelho nunca leva `conditions`, pausas nem a superfície dita pelo atleta. O relato do atleta nunca leva `gpsQuality` nem medida de aparelho. A superfície dita pelo atleta viaja num campo que o aparelho nunca escreve;
  - um teste de resultado do adaptador mostra que cada um desses fatos, dito por qualquer dos dois locutores, deixa a corrida fora da evidência de ritmo comparável.

  Onde a disjunção não puder ser mostrada (por exemplo, um indicador de ambiente interno ou metadados de clima do aparelho no mesmo campo), a (a) não basta para aquele campo, e **exijo a (b)**: o Core guarda esses fatos por relato e a leitura não comparável vence. Isso é aplicar as exclusões já decididas (r3a A1 fato 3, as exclusões da V1RC e da S3), não um critério novo.
- **De quem é a decisão.** A (b) é mudança de runtime fora deste patch e desta missão. **Autorizá-la é decisão do Founder**, com revisão própria de SSCTR e de Quality. Não a tomo por ele.
- A condição F-02 da R6 (valor medido pelo aparelho só no relato do aparelho, com a qualidade dele) é a metade "aparelho" da mesma disjunção.

## 4. Condições da confirmação

Ficam as condições do registro de `phase-a/`, no texto dele. Mudam ou entram estas:

| Condição | Estado |
|---|---|
| Amarração | aos oito arquivos de runtime de `f8b08aa` e aos valores `26c6e3fb…` |
| QRE-RWS-E-01 | **cumprida no Core** em `f8b08aa`; a leitura esportiva fica a mesma; a consequência da leitura 2 é aceita expressamente |
| SSCTR-RWS-F-01 (com QRE-RWS-F-03) | antes da fase B: leitor novo recebe a leitura inteira, nunca `reportsVerdict` sozinho |
| SSCTR-RWS-F-02 | antes de integração: medida do aparelho só no relato do aparelho, com a qualidade dele |
| SSCTR-RWS-F-03 (com QRE-RWS-F-06) | antes de integração, parte da L1-f: contar à parte as retenções do patch e as quedas da fonte S3 |
| QRE-RWS-F-01 | antes de integração: (a) com disjunção e teste de resultado; senão (b), por decisão do Founder |
| Hard gate E-1 (L5) | **não atendido**, também na forma de um relato só |
| Freeze | a confirmação não é freeze; o V1RWS-1 amarra `4b1622f` e dá DRIFT aqui; um sucessor é registro do dono |

As notas de Quality F-02 (forma dos testes) e F-04 (frase do autor) não são esportivas e não entram como condição. A F-05 (amarração só por texto) entra na condição de amarração.

## 5. O que não verifiquei

- A diferencial, a tabela, a mutação, as suítes e o `--check`/`--preserved` de Quality: li os resultados, não os rodei.
- O F-01 com pausas para caminhar e na faixa leve observada: rodei HEAT contra RAIN, OK contra POOR e TREADMILL contra GPS, só na faixa de limiar.
- O S3 do longão (360 → 365): só pelo parecer de Quality.
- O comportamento real do HealthKit (indicador de ambiente interno, metadados de clima). Por isso a (b) fica condicional.
- As fontes citadas em `sourceIds`, que não reverifiquei. Nenhuma afirmação científica é nova.
- Custódia e origem pelo canal (Security).

**Fila humana, proposta e não anexada:** HQ-V1RWS-E01-SSCTR-R6, agora também sobre o fechamento do QRE-RWS-F-01.

**Contexto do host:** o mesmo declarado na R6. O MEMORY.md tem sha256 `e1b1cd9a…` e não foi usado como evidência.

Neste passe escrevi no worktree só o registro de confirmação e este adendo. Não usei nenhum git de escrita.
