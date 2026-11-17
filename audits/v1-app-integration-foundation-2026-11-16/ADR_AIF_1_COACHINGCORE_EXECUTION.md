# ADR AIF-1 — Onde o CoachingCore executa na V1 mobile

**Status:** RECOMENDADO pelo Chief, com evidência de laboratório. **Não é decisão final.** Depende de uma prova no aparelho (P0, §6) e de duas decisões do Founder (§7).
**Data:** 2026-11-16. **Missão:** Application Integration Foundation (pedido do Founder de 2026-11-16).
**Linha avaliada:** `claude/v1-strength-corrections` em `c39d18a`, que contém `claude/v1-run-extensions` em `2dfa216` (merge-base conferido). Ponto de entrada: `CoachingCore/src/v1-strength-index.mjs`, sem opções.
**Evidência:** `results/surface.json`, `results/portable.json`, `results/perf.json`, `results/journey.json` (todos reproduzíveis, ver o relatório de prontidão §8).

## 1. Decisão recomendada

**A: o motor executa no iPhone, dentro do JavaScriptCore**, empacotado com os seus valores e registros de habilitação, atrás de uma camada de domínio local. Essa camada é o cliente headless desta missão, mais a custódia V1CIB reutilizada. Na V1, o caminho de treino não depende de servidor.

- O Swift nunca reimplementa nem lê regra esportiva. Ele envia fatos do atleta e recebe projeções pequenas (APP-VIEW-0).
- O registro canônico fica no aparelho, gravado de forma atômica e com proteção de dados do iOS.
- Backup e sincronização entre aparelhos ficam fora do caminho de treino. A política é decisão do Founder (§7, D2).
- Não adotar agora: servidor executando o motor (B), arquitetura híbrida (C) e reescrita em Swift (D2).
- WKWebView (D1) fica como **plano de contingência**, só se P0 mostrar o JavaScriptCore fora do orçamento.

## 2. O que a investigação encontrou (medido, não suposto)

| Pergunta | Resultado | Fonte |
|---|---|---|
| Dependências Node reais do motor | Só `node:fs` (`readFileSync`, `existsSync`) e `node:crypto` (`createHash('sha256')`). Nenhum pacote: o `ajv` não está no grafo do ponto de entrada. 36 módulos, 1,34 MB (425 KB gzip) | `surface.json` |
| O que o motor lê | 20 arquivos JSON nomeados por URL no código: valores, catálogo e os registros SSCTR de habilitação, 833 KB. Doze são lidos ao carregar; as políticas R5/R6 e a revisão SSCTR delas são relidas **a cada chamada** | `surface.json`, `portable.json` |
| Dependência escondida de Buffer | Sim: o motor chama `bytes.toString('utf8')` sobre o que lê. O host precisa devolver um objeto de bytes com esse método | `portable/host-fs.mjs` |
| Roda fora do Node? | **Sim, em laboratório.** Com `fs` e `crypto` trocados, só para os módulos do motor, por um host mínimo (assets empacotados, bytes do host, SHA-256 hex), as 5 respostas e o envelope final saem **byte-idênticos** ao Node, inclusive em modo só interpretador. Zero assets ausentes, zero chamadas não fornecidas | `portable.json` |
| Custo de hash | Uma revisão faz cerca de 800 SHA-256 sobre cerca de 3,4 MB; a jornada de prova, 3.187 chamadas sobre 12,4 milhões de caracteres. **O SHA-256 tem de ser nativo** (CryptoKit, por uma função do host), nunca SHA-256 em JS interpretado | `surface.json`, `portable.json` |
| Penalidade sem JIT (o JavaScriptCore embutido num app iOS roda sem JIT) | V8 só interpretador (`--jitless`), como aproximação: revisão mediana de 200 ms (p95 301 ms) contra 145 ms (p95 217 ms) com JIT. Cerca de 1,4×, porque o custo está em builtins nativos (JSON, hash) | `perf.json` |
| Memória | Heap retido depois de GC, com o registro de um plano inteiro de 16 semanas: 21 a 26 MB. Pico transitório observado durante revisões: cerca de 150 MB | `perf.json` |
| Fronteira existente | A custódia V1CIB (`src/boundary/`) existe, testada, e aceita o motor injetado. Mas **não guarda** os registros das extensões de corrida e **não aceita** resultado de prova declarado (`runEvidence`) | `journey.json` passo 15 |

Esses números são de um Ryzen 7 5700X com Node 24. **Não são números de iPhone** e não podem ser lidos como tal.

## 3. Alternativas comparadas

Escala por critério: ● favorável · ◐ aceitável com custo · ○ desfavorável.

| # | Critério (vinculante) | A. Local (JavaScriptCore) | B. Remoto (servidor) | C. Híbrido | D1. Local (WKWebView, com JIT) | D2. Port para Swift |
|---|---|---|---|---|---|---|
| 1 | Performance em aparelho modesto | ◐ pendente de P0; laboratório 0,2–0,3 s por revisão sem JIT | ◐ rede + servidor; payload de 0,2–1,2 MB por resposta | ◐ | ● JIT; IPC assíncrono | ● |
| 2 | Responsividade percebida | ● leitura local imediata; revisão fora da main thread | ○ toda mudança espera a rede | ◐ | ◐ processo web pode ser encerrado em background | ● |
| 3 | Offline | ● completo | ○ sem rede, sem decisão | ◐ | ● | ● |
| 4 | Confiabilidade e determinismo | ● os mesmos bytes congelados; prova byte-idêntica | ● | ○ dois ambientes para manter idênticos | ● | ○ dois motores, deriva garantida |
| 5 | Privacidade e segurança | ● dado de saúde não sai do aparelho; ◐ custódia contra adulteração pelo dono do aparelho é mais fraca (§5) | ◐ base de dados de saúde no servidor, deveres de controlador (G07) | ◐ | ● como A | ● como A |
| 6 | Bateria | ● só calcula quando o atleta age | ◐ rádio a cada ação | ◐ | ◐ processo web | ● |
| 7 | Memória | ◐ cerca de 150 MB de pico transitório (laboratório) | ● | ◐ | ○ processo web a mais | ● |
| 8 | Custo operacional | ● zero por usuário | ◐ autenticação, KMS, banco, backup, monitoração (todos PENDING na V1CIB) | ○ | ● | ● |
| 9 | Manutenção | ● um motor; ponte pequena | ◐ infraestrutura e operação | ○ | ◐ ciclo de vida do WebView | ○ dois motores |
| 10 | Evolução e atualização do motor | ◐ só por versão do app: o freeze vira a versão, o que é auditável | ● implantação a qualquer momento | ○ | ◐ como A | ○ |
| 11 | Compatibilidade iOS | ● JavaScriptCore é framework do sistema; nenhuma dependência nova | ● | ◐ | ● | ● |
| 12 | Expansão Android | ● o mesmo pacote JS roda num engine JS do Android | ● | ◐ | ● | ○ precisaria de Kotlin também |
| 13 | Velocidade de entrega da V1 | ● ponte pequena; sem infraestrutura | ○ infraestrutura inteira antes do primeiro atleta | ○ | ◐ | ○ meses |
| 14 | Risco de regressão esportiva | ● o motor congelado roda sem mudança | ● | ◐ | ● | ○ máximo |

**Por que não B agora.** Calcular no servidor custaria pouco por usuário. O caro é tudo o que tem de existir antes do primeiro atleta: autenticação, gestão de chaves, banco com backup, monitoração e base legal de dado de saúde guardado por terceiro (G07). Tudo isso está PENDING na V1CIB. Além disso, cada ação do atleta esperaria a rede, e uma resposta do motor tem de 0,2 a 1,2 MB, cara em rede móvel ruim. Para um fundador solo validando o produto, B adia a entrega e aumenta a superfície de risco sem benefício esportivo.

**Por que não C.** O benefício seria offline mais backup. Backup não exige um segundo motor: basta guardar o envelope (§7, D2). Dois ambientes de decisão exigiriam provar que dão o mesmo resultado, o que tem custo permanente.

**Por que não D2.** Reescrever 1,3 MB de regras congeladas e revisadas apaga o valor de cada freeze e de cada juiz. O motor não é o gargalo medido.

**D1 como contingência.** O WKWebView tem JIT, mas roda em outro processo. Ele cobra memória a mais, comunicação assíncrona e serializada, e pode ser encerrado pelo sistema. Só compensa se P0 mostrar o JavaScriptCore fora do orçamento no aparelho de entrada.

## 4. Forma da arquitetura A

```
SwiftUI (apresentação, navegação, captura)
   │  comandos: fatos do atleta          ▲  projeções APP-VIEW-0 (0,5–2 KB cada)
   ▼                                     │
Ponte (uma fila serial, fora da main thread)
   │
JavaScriptCore: camada de domínio
   ├─ cliente headless (harness/lib.mjs) e projeções
   ├─ custódia V1CIB reutilizada (ids, relógio, reconciliação do registro, hold duas vezes, idempotência)
   └─ motor: v1-strength-index.mjs, sem opções, com os 20 assets empacotados
   │
Host (Swift): readAsset(url), existsAsset(url), sha256(text|bytes)→hex,
              hmacSHA256(key,text) para a custódia, gravação atômica, chave no Keychain
```

Regras de desempenho da ponte:
- O envelope (0,4 a 1,2 MB) e as respostas (0,2 a 1,2 MB) **nunca atravessam a ponte inteiros**. As projeções são calculadas dentro do JavaScriptCore e só elas chegam ao Swift.
- O primeiro quadro e a primeira tela útil vêm de um cache de views pequeno, gravado pelo Swift. O contexto JS é criado depois do primeiro quadro, em background.
- Uma fila serial por atleta. Requisições obsoletas são canceladas antes de chegar ao motor; uma revisão em curso nunca é cancelada pela metade.

## 5. O que muda na segurança (para revisão de Security, não decidido aqui)

A condição RECORD-CUSTODY (Security C2/C7, PCG-V1CPFF-CFOBS1) foi escrita para um servidor. O cliente não pode reselar o registro nem derrubar um hold, porque a chave HMAC fica onde o app não chega.

Na arquitetura A, a custódia roda no mesmo processo que o app. A proteção continua valendo:
- contra erro da camada de UI, porque o Swift não monta campo do motor;
- contra corrupção do armazenamento;
- contra outros apps.

Ela deixa de valer contra o dono de um aparelho adulterado: com jailbreak ou app modificado, o atleta poderia remover o próprio hold clínico. Aceitar isso numa V1 sintética ou piloto é escolha de risco do Founder com Security (§7, D1). Não é decisão técnica.

A custódia no aparelho também precisa de HMAC-SHA256 e de comparação de tempo constante no host. Isso **não** entrou na prova portátil, que cobriu só o motor.

## 6. Prova P0 (a menor prova que falta)

Num aparelho de entrada da matriz (ver `PERFORMANCE_FOUNDATION.md`), com um alvo de app mínimo e **sem tela de produto**:
1. empacotar o grafo do ponto de entrada num único script, com os 20 assets;
2. carregar no `JSContext` com as três funções do host;
3. rodar a mesma jornada de `portable/proof.mjs`;
4. conferir as 5 respostas byte-idênticas aos digests do laboratório;
5. medir no Instruments (Time Profiler, Allocations) a criação do contexto, a primeira geração, a revisão mediana, o p95 e o pior caso com o registro de um plano inteiro, e o pico de memória.

**Critério de aceitação:** respostas idênticas e orçamentos provisórios de `PERFORMANCE_FOUNDATION.md` §3 atendidos.
**Falha de orçamento:** repetir a mesma prova no WKWebView (D1) antes de qualquer outra opção.
**Falha de identidade das respostas:** é bloqueio, não ajuste.

## 7. Decisões do Founder

- **D1. Custódia no aparelho.** Aceitar o modelo de ameaça da §5 para a V1. A alternativa é manter a custódia num servidor, e então a arquitetura vira B na parte do registro. Recomendação: aceitar na V1 sintética e piloto, com Security revisando o desenho local, e reabrir antes de uso amplo.
- **D2. Backup e troca de aparelho.**
  - Opções: (a) nenhum, só a migração local de aparelho para aparelho; (b) backup do envelope cifrado ponta a ponta, num servidor próprio que só guarda o blob cifrado; (c) iCloud.
  - A Apple restringe guardar informação pessoal de saúde no iCloud (Guidelines 5.1.3). **Conferir o texto vigente antes de decidir (c).**
  - Recomendação: (a) na V1 sintética; (b) quando houver atletas reais.
- **D3. Versão mínima do iOS.** Ver `PERFORMANCE_FOUNDATION.md` §2.

## 8. Consequências

- Uma versão do app carrega exatamente um freeze. Atualizar regra, valor ou registro de habilitação é publicar uma versão do app. **Sem download de código ou de regra.**
- **Os registros de habilitação expiram e o motor falha fechado.** Os registros R7-B0 têm `review_by: 2027-04-30`; depois dessa data, toda revisão responde `UNSUPPORTED` (observado, `journey.json`, gate AUTHORITY_EXPIRY). Registros renovados por revisão independente têm de chegar numa versão do app **antes** da data. O app precisa de um estado explícito para isso, nunca mostrado como descanso.
- A camada de domínio JS passa a fazer parte do produto. O cliente desta missão é a referência, não a versão de produção.
- **Ganhos possíveis no motor** (cada um seria um freeze sucessor, decisão do Founder, **fora desta missão**): ler as políticas R5/R6 uma vez por carga, reduzir o hash repetido de estruturas iguais e reduzir o tamanho das respostas.
