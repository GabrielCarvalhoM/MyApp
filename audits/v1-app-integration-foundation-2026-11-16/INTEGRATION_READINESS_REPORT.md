# Integration Readiness Report — Application Integration Foundation (2026-11-16)

**Missão do Founder de 2026-11-16.** Chief em Opus 5.5, effort high.

**Branch e worktree:** `claude/v1-app-integration-foundation`, em `.claude/worktrees/v1-app-integration-foundation`, a partir de `c39d18a`. Nada enviado, nada mesclado.

**Estado:** `FOUNDATION_DELIVERED_WITH_OPEN_GATES`.
- Decisão arquitetural recomendada, com evidência de laboratório.
- Contratos mínimos.
- Requisitos de performance verificáveis.
- Fluxo headless executável sobre o motor real.
- **Não está pronto** para integrar o SwiftUI com atleta real nem para um piloto.

## 1. As seis perguntas da missão

1. **Como o CoachingCore executa no mobile, e por quê?**
   - No iPhone, dentro do JavaScriptCore, empacotado com os 20 assets que lê, atrás de uma camada de domínio local (ADR AIF-1).
   - Por quê: funciona offline, não tem custo por usuário, o dado de saúde fica no aparelho, e roda os mesmos bytes congelados sem reescrita. A dependência real do motor é mínima: três funções de host, provadas byte-idênticas em laboratório.
   - Pendente: a prova P0 no aparelho de entrada e as decisões D1 a D3 do Founder.
2. **Como o app consome as decisões sem duplicar lógica?**
   - O app envia só fatos do atleta e recebe projeções APP-VIEW-0 de 0,5 a 2 KB.
   - As projeções reformatam respostas do motor e reaproveitam a `planView` do V1CIB. Nenhuma regra esportiva fica no app (`APP_DATA_CONTRACTS.md` §1, §4).
3. **Como o estado é persistido, reconstruído e versionado?**
   - Um envelope versionado (`VF-APP-RECORD-ENVELOPE-0`), gravado de forma atômica com digest, que guarda tudo o que o motor devolve.
   - Um processo novo restaura e dá a mesma próxima resposta.
   - Envelope de outro motor → recusado; plano de outras regras → o motor responde (`APP_DATA_CONTRACTS.md` §3, §5).
4. **Como validar uma jornada híbrida antes do SwiftUI?** Pela jornada headless: 30 verificações sobre `v1-strength-index.mjs` sem opções (§3 abaixo).
5. **Quais requisitos e mecanismos garantem um app rápido em iPhones modestos?**
   - Os princípios, a matriz de aparelhos, os orçamentos provisórios e o plano de profiling de `PERFORMANCE_FOUNDATION.md`.
   - Os três mecanismos decisivos:
     - nada de motor no caminho do primeiro quadro;
     - nada de dado grande na ponte;
     - SHA-256 nativo.
6. **O que falta antes do primeiro atleta real?** O §5 abaixo.

## 2. Pronto (existia e foi confirmado nesta linha)

- A linha integrada: `c39d18a` contém `2dfa216`, confirmado pelo merge-base.
- Os cinco freezes preservados (`v1str-freeze --check 1` sai com 0; 196/196, 30/30, 98/98, 163/163; 121 arquivos acrescentados e 1 emendado conferem).
- A suíte de força: 67 de 67 nesta worktree.
- Sem opções, toda fronteira aprovada lê ligada e a revisão de ritmo fica `INERT`.
- A custódia V1CIB, as operações do app, os estados do cliente e as fixtures iOS: existem e foram reutilizados, não refeitos.

## 3. Demonstrado de forma executável nesta missão

| Item da missão (§6) | Onde | Resultado |
|---|---|---|
| 1–3 Atleta sintético, onboarding normalizado, plano híbrido | journey passos 1–3 | `PROPOSED`. Intake incompleto → `INVALID_INPUT` com `missingInputs` |
| 4–5 Hoje, semana, detalhe de corrida e de força | passos 4–5 | projeções de 0,46 a 3,3 KB, contra 346 KB da resposta inteira |
| 6–9 Execução, envio, revisão, mudanças do plano | passos 6–8 | o relato fica no registro; a revisão decide com status e motivo; a proposta é adotada como o motor a aplicou |
| 10 Previsão, Pace Insights, Strength Exposure | passo 10 | cada um com status; faixa só por `shown`; revisão de ritmo `INERT`; exposição só descritiva |
| 11 Persistência e restauração | passo 11 | processo novo: mesma próxima resposta e mesmo envelope; corrupção e outra versão são recusadas |
| 12 Correção tardia e deduplicação | passo 12 | o mesmo relato não duplica a linha; a correção marca o original como `superseded` |
| 13 Indisponibilidade e holds | passo 13 | sinal de alerta → `CLINICAL_HUMAN_REQUIRED`, `BLOCKED`, nenhuma prescrição; previsão `UNAVAILABLE/HOLD`; prontidão libera (`RETURNING`) |
| Reinício e continuidade de versão | passos 13b, 14 | reinício `PROPOSED` sob as regras de força; plano sem as regras é revisado sem elas |
| Fronteira existente | passo 15 | a custódia V1CIB aceita o motor injetado, mas não guarda os registros das extensões nem aceita `runEvidence` |
| Execução fora do Node | `portable/proof.mjs` | 5 respostas e o envelope byte-idênticos sobre um host de três funções, com JIT e sem JIT |
| Superfície do host | `surface.mjs` | `node:fs` e `node:crypto`, mais nada; 36 módulos (1,34 MB); 20 assets (833 KB) |

## 4. Só projetado, ainda não executado

- O motor dentro do JavaScriptCore num iPhone (P0).
- A ponte Swift e o cache de views.
- A custódia rodando no aparelho, com HMAC do host e chave no Keychain.
- Backup e sincronização.
- O adaptador HealthKit e as duas vozes.
- Toda meta de `PERFORMANCE_FOUNDATION.md` §3.

## 5. Bloqueios

**Para integrar o SwiftUI, mesmo com dados sintéticos:**
1. **P0** no aparelho de entrada (ADR §6). Fecha a escolha JavaScriptCore × WKWebView.
2. **D1** (custódia no aparelho) e **D3** (iOS mínimo), do Founder; **D2** (backup) pode vir depois do sintético.
3. **L-APP-01 e L-APP-02:** a custódia precisa guardar os três registros das extensões, aceitar `runEvidence` e usar `v1-strength-index.mjs`. Mexer em `src/boundary/` é decisão do Founder sobre freeze.
4. **L-APP-05:** decidir a revisão do primeiro acesso da semana.

**Para qualquer atleta real** (nada disto foi resolvido por documento):
- **RESTART (L-APP-06), reproduzido aqui de duas formas.** O plano novo reusa ids de sessão:
  - pelo cliente headless, o relato do plano novo não ganha linha e a linha do plano antigo vira `conflicted`;
  - **pela custódia V1CIB, o primeiro relato depois do reinício é recusado inteiro** (`ENGINE_CONTRACT_VIOLATION`, QRE-AIF-02).
  - É mudança no motor congelado e decisão do Founder com o SSCTR. Até lá o app não oferece reinício. Junto com ele, QRE-RFC-B-02, a corrida da manhã creditada num restart no mesmo dia.
- **E-1:** a re-sincronização apaga respostas de esforço e recuperação (contrato iOS §6).
- **QRE-RWS-F-01:** fontes conflitantes na calibração.
- **HealthKit:** identidade, proveniência, correções, separação medição × relato (contrato iOS).
- **Custódia:**
  - integridade autenticada no desenho escolhido (D1);
  - gravação atômica e reparo auditado;
  - apagamento e retenção (G07).
- **Força:** migração de planos anteriores às regras e caminho de continuação de outras versões.
- **Segurança:** revisão focal da integração escolhida, incluindo a mudança de modelo de ameaça do ADR §5.
- **Race Forecast:** cobertura da simulação abaixo do limiar (63,8 % contra 80 %) e nenhuma validação externa de acurácia.
- **Pace Revision:** implementada, não aprovada, desligada.
- **AUTHORITY_EXPIRY (L-APP-08), reproduzido aqui, com efeito de segurança (QRE-AIF-01).** Depois de 2027-04-30 (dia UTC), sem registros R7-B0 renovados:
  - o motor recusa toda revisão e todo plano novo;
  - **um sinal de alerta dá `UNSUPPORTED` em vez de `CLINICAL_HUMAN_REQUIRED`.**
  - **Pergunta ao Founder e ao SSCTR:** a rota clínica deve vir antes da checagem de autoridade? É mudança no motor congelado.
- Os textos de produto ainda abertos (E3, E4, RC-01, a palavra de urgência G04) e a revisão de dados G03 da exposição antes de qualquer tela.

## 6. Performance medida (laboratório: Node 24, Ryzen 7 5700X; **não é iPhone**)

Só interpretador (`--jitless`), entre parênteses com JIT:
- revisão mediana de 200 ms, p95 de 301 ms, máximo de 304 ms (145 / 217 / 219);
- primeira geração de 85 ms; carga do motor de 79 ms;
- heap retido de 21 a 26 MB com um plano inteiro, pico observado de cerca de 150 MB;
- envelope de 1,17 MB depois de 16 semanas.

Cada revisão relê as políticas R5/R6 e faz centenas de SHA-256 sobre milhões de caracteres (em média, cerca de 714 sobre 2,7 milhões por chamada do motor): ganhos possíveis num freeze sucessor, fora desta missão. A penalidade de 1,4× sem JIT é explicada por hipótese (builtins nativos), sem profile (QRE-AIF-08). Detalhes e limites (o crescimento entre planos não foi medido) em `PERFORMANCE_FOUNDATION.md` §4.

## 7. Revisão independente

Um juiz QRE independente, uma rodada, sobre `e4a2b80` (`reviews/qre/QRE_AIF_R1.md`). **Veredito: `READY_WITH_CONDITIONS`.**

**O que o juiz confirmou por execução:**
- o motor é o real, sem opções, e o harness não repete regra esportiva;
- 30/30 verificações;
- restauração a frio idêntica;
- a prova portátil usa de fato os shims;
- as estatísticas estão corretas;
- os freezes estão preservados;
- os dois gates são comportamento do motor, não do harness.

**O que mudou no único ciclo de correção** (sem nova revisão, como manda o limite de ciclos):

| Achado | Gravidade | Tratamento |
|---|---|---|
| QRE-AIF-01: depois da expiração, um sinal de alerta dá `UNSUPPORTED`; plano novo e reinício também são recusados | MAJOR | Escrito no ADR §8, em L-APP-08 e no §5 acima. **Levado ao Founder e ao SSCTR como pergunta de motor.** A jornada agora observa o par antes e depois da data no mesmo plano |
| QRE-AIF-02: pela custódia, o primeiro relato depois do reinício é recusado inteiro | MAJOR | Escrito no ADR §8, em L-APP-06 e no §5. A jornada agora observa isso pela custódia (gate RESTART_THROUGH_CUSTODY) |
| QRE-AIF-03: a sonda de expiração não tinha controle | MINOR | Corrigido: par antes e depois da data, num plano que cobre a data |
| QRE-AIF-04: a prova portátil passaria sem os hooks | MINOR | Corrigido: só passa se os shims foram chamados |
| QRE-AIF-05: verificações mais fracas que o rótulo | MINOR | Corrigido nos passos 4, 11, 12, 13 e 15 |
| QRE-AIF-06: limites estatísticos de `perf.json` | MINOR | Declarados em PERFORMANCE_FOUNDATION §4 (os números não foram recalculados) |
| QRE-AIF-07: números divergentes nos documentos | MINOR | Corrigidos a partir dos resultados |
| QRE-AIF-08: a explicação da penalidade sem JIT não foi medida | MINOR | Marcada como hipótese; fica para P0 |
| QRE-AIF-09: o cliente adota toda proposta | MINOR | Declarado como L-APP-09 |
| QRE-AIF-10 a -12 | NOTE | Anotados. Rodar o harness reescreve `results/` (só os tempos mudam) |

Nenhuma correção tocou o motor.

## 8. Reproduzir

Da raiz da worktree, com `CoachingCore/node_modules` presente (copiado da worktree de força, como de costume):

```
node audits/v1-app-integration-foundation-2026-11-16/harness/journey.mjs          # 30 verificações; results/journey.json
node audits/v1-app-integration-foundation-2026-11-16/harness/portable/proof.mjs   # results/portable.json
node audits/v1-app-integration-foundation-2026-11-16/harness/surface.mjs          # results/surface.json
node audits/v1-app-integration-foundation-2026-11-16/harness/perf.mjs             # cerca de 3 min; results/perf.json
node CoachingCore/scripts/v1str-freeze.mjs --check 1                              # freezes preservados
```

`results/work/` são envelopes de rascunho de execuções antigas e não estão no Git. As novas vão para um diretório temporário do sistema.

## 9. Próxima tarefa técnica mínima

**P0:** um alvo iOS mínimo, sem telas de produto, que carregue o pacote do motor num `JSContext` com as três funções do host (SHA-256 pelo CryptoKit). Ele roda a jornada de `portable/proof.mjs`, confere os 5 digests e mede no Instruments as linhas "Motor" e "Memória" de `PERFORMANCE_FOUNDATION.md` §3 no aparelho de entrada.

Ela precisa de um Mac com Xcode e de um aparelho físico. **Não foi feita aqui.** Em paralelo, e só com decisão do Founder: a correção do gate RESTART num freeze sucessor.

## 10. Não foi tocado

CoachingCore, freezes, testes, verificadores, Figma, HealthKit, `canon/`, `product/`, `CURRENT_MISSION.md`, `MISSION_LEDGER.md` e a fila humana (continua em 235). Nenhuma infraestrutura paga foi criada, nenhuma tela foi construída.
