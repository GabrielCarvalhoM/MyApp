# SSCTR — revisão do candidato V1RWS (fase A), r1 — 2026-11-13

**Veredito: ACCEPT_WITH_CONDITIONS.** O registro habilitador de `V1X-RUN-NATIVE` não foi emitido. Nestes bytes eu não o emitiria. Eu o emitiria nos bytes finais com A-01, A-02 e A-03 fechados, cada um com teste dirigido e com reverificação por instância SSCTR nova. A-04 e A-05 seguiriam como condições do registro.

- **Candidato:** `bcac30d` (`claude/v1-run-extensions`). Valores `RUN_FORMATS_V1.json` sha256 `5ca33b9b…a60d`.
- **Decisões verificadas por hash:** r2 `daf3d7a2…2213`, r3 `6b96d769…08e2`, r3a `37047d21…d412`.
- **Revisor:** instância SSCTR nova (claude-opus-5-5), PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, sem credencial humana. Não escreveu o candidato, o handoff nem as decisões. Não houve revisão humana nem validação empírica.

## Achados

| id | severidade | o quê | evidência | o que fecha |
|---|---|---|---|---|
| A-01 | CONDITION (antes de habilitar) | Parada por sintoma (ou sem motivo) só é lida em relato que cita formato NATIVO com hash de dose igual. Na versão por tempo, ou sob D-5, a execução vira TIME: a parada some, não há triagem e as sessões seguintes podem sair nativas. | `v1-run-format.mjs:432`; `v1-run-format-index.mjs:96`, `:105`; sonda D casos 2–4 (por tempo: `NOT_RAISED_BY_THIS_EXTENSION` e longão da semana 2 NATIVE; nativo: REQUIRED e tudo TIME) | Ler `actual.stop` em todo relato de corrida, qualquer que seja a expressão e o D-5, para exigir a triagem. Ou um contrato Product/Data, verificado pelo QRE, de que sintoma na versão por tempo vai sempre à triagem existente. Teste dirigido. |
| A-02 | CONDITION (antes de habilitar) | Distância digitada em `actual.distanceKm` (MANUAL ou sem fonte) na versão por tempo de uma corrida leve vira observação P1 na V1RC, que segue inalterada e só exclui TREADMILL. Essa P1 dimensiona os contínuos nativos (D-7). Distância declarada chega a um consumidor de calibração como medida (r3a `paceUse`). | Sonda E: GPS, MANUAL e sem fonte dão a mesma faixa 365–395; digitada a 5:00 dá 300–330; `declared` dá UNAVAILABLE. `v1-run-calibration.mjs:150`, `:165` | O ponto de entrada aplica a regra do D-6 (a) a todo relato novo de corrida, sem tocar a V1RC. Ou QRE/Data verificam um contrato do cliente que torne isso impossível. Teste: P1 nunca conta distância digitada. |
| A-03 | CONDITION (antes de habilitar) | X-2: uma sessão por tempo da classe não concluída (5 de 50 min, sem parada) reinicia a contagem. Duas corridas acima do estimado em volta dela nunca pausam a classe. | `v1-run-format.mjs:452`; sonda D caso 5 | Decisão desta revisão: reinicia só a sessão por tempo que o motor lê como concluída e sem parada; a não concluída nem conta nem reinicia. Teste dirigido. |
| A-04 | CONDITION (antes de qualquer leitor de `execution`, fase B) | `paceEvidence` é verdadeiro para repetições por volta de qualquer duração (6 × 800 m dá true). As regras V1RC mantidas pela r2 dizem que repetições abaixo de 5 min nunca recalibram e que GPS perde um nível. Nenhum consumidor existe hoje. | `v1-run-format.mjs:436`; sonda C | `paceEvidence` falso abaixo de 5 min ou fora da Q8 e nível levado junto. Ou renomear o campo. Julgar na fase B. |
| A-05 | CONDITION (Product) | O texto das repetições nativas não traz "parar e caminhar é sempre permitido e fica registrado como feito" (RWS3-G.3) e não mostra a duração estimada (ela existe só nos dados). Os contínuos trazem todo o conteúdo exigido. | `v1-run-format.mjs:280-281`; sonda D (textos) | Revisão de copy de Product (RWS2-G.6). |
| A-06 | NOTE | F-1 decidido: vale a ordem escrita (abaixo). O candidato já a implementa. | — | Nada; o T13 cita esta revisão. |
| A-07 | NOTE | WE-25 / D-2: TIME no lugar de EQUIVALENT, aceito. É a dose canônica, sem nada novo. | `v1-run-format.mjs:329` | — |
| A-08 | NOTE | P1, L30, longão comparável e S3 são lidos no início da semana. X-2, triagem, hold e rota clínica valem na hora (sonda D caso 1). Fiel ao formato fixo na semana e à convenção da V1RC. Não é a "janela maior" abstida pela r3a. | `v1-run-format-index.mjs:121-123`; `v1-run-calibration.mjs:406-408` | Declarar a âncora no contrato de dados. |
| A-09 | NOTE | O histórico mapeia para SYMPTOM só o motivo ausente; o leitor mapeia qualquer motivo fora da lista. Uma parada lida como SYMPTOM pode entrar no S3. O S3 só deixa mais lento, então não é inseguro. | `v1-run-history.mjs:116`; `v1-run-format.mjs:395` | Alinhar. |
| A-10 | NOTE | `completed:false` com medição ≥ alvo dá PARTIAL e conta para X-2. É mais estrito, aceitável. | `v1-run-format.mjs:401` | O cliente não manda false para corrida concluída. |
| A-11 | NOTE | O D-6 (a) é protetor: sem ele, um número manual num relato nativo chegaria à V1RC como medido. | sonda C | — |
| A-12 | NOTE | O taper só mantém a distância de pico se o pico foi feito em repetições iguais. Conservador. | `v1-run-format-index.mjs:130` | — |
| A-13 | NOTE | A nota do `RUN_FORMATS_V1.json` cita `test/v1rws-values.test.mjs`, que não existe; o teste de valores está em `v1rws-format.test.mjs`. | `RUN_FORMATS_V1.json:11` | Corrigir na próxima revisão dos valores. |
| A-14 | NOTE | Importação sem id pode contar duas vezes, sem efeito: L30 é um máximo e o comparável é o mais recente. Nada é fundido por data. | `v1-run-history.mjs:79` | — |

Nenhum achado BLOCKING. Nos relatos nativos o candidato só prescreve e lê o que as decisões permitem. As três condições pré-habilitação são caminhos fora do relato nativo que deixam passar um fato (sintoma, distância digitada, reinício da X-2).

## Decisão sobre F-1

**Vale a ordem escrita.** O WE-17 deve ser lido como **1 × 2600 m + 1 × 15 min**: trabalho 28,87–29,30 min, duração 46,66–47,30 min (canônica 48).

**A ordem:** para as floor(n/2) repetições por distância do misto, as unidades 1000, 400, 200, 100 e 50 m, nessa ordem; dentro de cada unidade, os múltiplos da grade do mais longo ao mais curto. O formato é a primeira distância com que a sessão passa E1–E3 e E5.

**Por quê:**
- A regra (`values.candidateOrder`) é a camada normativa. Os exemplos são cálculo ilustrativo de script avulso. Os números do WE-17 (29,4–29,85 e 47,19–47,85) são exatamente os de 2700 m, então o exemplo usou outra ordem.
- As duas distâncias passam o envelope. A r2 diz que o envelope é o único controle de carga e que as unidades não carregam dose; nenhuma evidência distingue 2600 de 2700 m.
- A ordem escrita é a das repetições iguais e da pirâmide.
- As duas ordens divergem muito (7.348 casos da varredura), então vale uma regra declarada, não um exemplo.

Nenhum outro exemplo distingue as ordens. O WE-16 é o único outro misto, e lá só 1500 m passa.

Item de fila humana proposto, não anexado: HQ-V1RWS-A-SSCTR-F1-MIXED-ORDER.

## Respostas 1–10

1. **Valores:** todos conferem com r2 ← r3 ← r3a. Não há 0,97, teto de tempo nem RECOVERY_EASY/SHAKEOUT nativos. EQUIVALENT ausente por desenho.
2. **Catálogo e seletor:** oráculo próprio, escrito a partir do texto da r2, sobre 159.600 seleções (6 famílias, 25 passos, faixas 200–470 s/km, 9 fases, 4 experiências, semanas). 0 divergências e 0 formatos fora de E1–E3 ou da elegibilidade. E4 não é aplicado. A ordem dos 22 motivos foi conferida. A volta a iguais deu 4.082 de 4.082.
3. **F-1:** ordem escrita (acima).
4. **Contínuos:**
   - Oráculo próprio de P_typ, P_size (S1–S4) e CT-1..3 sobre 54.432 seleções com strides: 0 divergências.
   - D-7 é aceitável: a chamada "nua" retira as três fontes de evidência, e sem referência a faixa EASY da V1RC é a própria P1 (`v1-run-calibration.mjs:190-196`, `:371`).
   - Corte semanal fiel (A-08). A dose nunca muda.
5. **Conclusão:**
   - Tabela r3a própria sobre 660 combinações: 0 diferenças. Nada abaixo do alvo sem declaração vira DISTANCE, e o valor medido nunca muda. Os exemplos r3a e r3 passam.
   - D-6 (a) é mais estrito e protetor; (b) é fiel (o handoff exige POOR); (c) é mais estrito e aceitável.
   - (d)/D-5 é fiel como regra de crédito, mas não pode esconder uma parada (A-01).
6. **Exposição:** a marca de exposição começa em 1,015 × a estimativa alta. X-1 entra como S3. X-2 vale na hora; o PARTIAL ≥ 0,91 é neutro. Há uma lacuna de reinício (A-03). FATIGUE só oferece a revisão existente.
7. **O que nunca pode acontecer:** sem contraexemplo nos relatos nativos, nem formato nativo sob hold, rota clínica, WALK_JOG/RESTART/RETURN, passo 0, ESTABLISHMENT ou POST_EVENT. Fora deles: A-02 e A-04.
8. **Textos:** os contínuos estão completos. Nas repetições falta parar/registrado e a duração estimada (A-05). Nada está escrito como progressão.
9. **Escopo:** sem objeção esportiva a D-2 (TIME é a dose) nem a D-3.
10. **ADF:** H1–H6 e H8 corretos.
    - Deduplicação só por identidade.
    - Esporte obrigatório para corrida fora do plano.
    - Esteira entra no L30 sem ritmo.
    - POOR sozinha não dá referência.
    - A declaração do intake não chega ao motor nem serve de longão comparável.
    - A declaração vale só para adesão nos relatos nativos (A-02 na versão por tempo).

## O que rodei

- sha256 dos três registros e dos valores.
- `node --test test/v1rws-*.test.mjs`: 49/49.
- Sondas somente leitura em `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/2e948744-f019-40c7-9630-ece3b7d8a9e9/scratchpad/judges/ssctr/`:
  - A: oráculo de repetições e ordem do misto.
  - B: oráculo de contínuos e supressões.
  - C: tabela de conclusão r3a.
  - D: pelo motor (X-2 no meio da semana, sintoma por tempo e nativo, D-5, reinício da X-2, volta a iguais, textos).
  - E: P1 com distância digitada.
  - WE-16 e WE-17 nas duas ordens.

## O que não revisei

- A emenda de `r6-adaptation.mjs`, os freezes, o replay e a custódia (QRE); só rodei os testes.
- F-2 e F-3.
- A fase B (H7, H9, previsão, I8).
- O modo EQUIVALENT e a r1.
- A redação final (Product).
- Cobertura fora das grades sintéticas.
- O ADF fora das seções 3, 5.2 e 6, e o CURRENT_MISSION além da última seção.
- Literatura nova: nenhuma afirmação científica nova é feita aqui. WebSearch e WebFetch estavam disponíveis e não foram usados. As fontes das r2/r3/r3a não foram reverificadas.

**Contexto injetado pelo host (divulgado):**
- CLAUDE.md global (`c75718d0…09c6`).
- CLAUDE.md do projeto (`e657d059…22e6`).
- Índice MEMORY.md (`0ca62e8b…b4fd`).

Lidos só como contexto; nenhuma entrada de memória sobre missões anteriores foi usada como evidência.
