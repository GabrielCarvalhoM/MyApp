# Revisão DELTA independente — Running — Foundation 0.2

Data: 22/10/2026. Revisão por autor independente da correção. Escopo: resolver os findings RUN da 0.1 e julgar o handoff para **revisão humana delimitada**; não aprovar domínio, doses, software ou promover cenários/gates. Pacote inspecionado: `outputs/foundation-audit/v1-training-domain-foundation-0.2`.

## Parecer

**READY WITH FIXES para revisão humana delimitada** é suportado. Não é Product/Domain Truth nem autorização prescritiva. A 0.2 substitui as principais ambiguidades da 0.1 por contratos conceituais tipados e exemplos sintéticos inspecionáveis. Não há P0/P1 impeditivo para iniciar revisão de estrutura, escopo, metadados e exemplos desse subconjunto. Há uma correção P2 concreta no par S13/S14 antes de alegar que o contrafactual original foi materializado.

Os limites C4(5/6), C5/taper, população/receitas, anchors, comparabilidade e restrições estão declarados como trabalho a realizar pelos owners competentes. A ausência de aprovação nesses pontos impede adoção autoritativa/prescrição, mas não é uma deficiência escondida do handoff nem motivo para inventar regras profissionais.

## Identidade e prova realmente verificadas

Foi lido `review-input-manifest-0.2.json`, revisão `TDF-0.2-review-input`, e recalculado SHA-256 e tamanho de cada arquivo no disco: **15/15 hashes e tamanhos coincidem**, inclusive os arquivos fora do recorte semântico Running. O manifest contém 15 arquivos; seu inventário não foi presumido correto apenas por existir.

Hashes de entradas centrais desta revisão:

| Arquivo | SHA-256 conferido |
|---|---|
| DATA_MODEL_CONTRACTS.md | ad9008a8b35cefd748a148c6cc17dc5aa7551973e9d250e8c8bfd7e6ac8d6bec |
| DOMAIN_REVIEW_FIXTURES.json | 69d4ce4783c52e0cf342bae45c3e3e775290c1aa6307acf443555ae8048cfab3 |
| RUN_SESSION_ONTOLOGY.md | 6d39a17723b11043ed0cf491a9e8c40676112deea495fd73eacef2c50ea13763 |
| SCENARIO_DOMAIN_MAPPING.md | 36987fc5938fad7befe26f4507c0703004048255c0927e72bd79bebf2f29cd93 |
| SEED_DATASET_RUN.json | fcdd5b026f44772b993479e99af62bdfaaa2e50ecca51440771a4d6fc8fcabb8 |
| G01_G04_REVIEW_PREP.md | 267c62319a818182ce1366de5506c26a134485d8793f16c7ef22dd4c1227770b |

`checks-0.2.json` declara **40 checks, zero falhas**, com escopo explicitamente documental/sintético. Esta revisão leu seus resultados, mas não afirma ter reexecutado os 40. Independente do autor, foram recalculados do JSON:

| Verificação própria | Resultado |
|---|---|
| Target metrics dos 17 seeds | Zero métricas fora de RPE/HR/pace/power; time/secondary/optional/relative não ficaram como métricas |
| Demanda por arquétipo | 17/17 UNKNOWN com null; não há bandas substitutas inventadas |
| threshold-example | 2.220 s total = 1.080 s trabalho + 240 s recuperação + 900 s warm-up/cooldown |
| easy-example | 1.800 s total e trabalho; zero recuperação prescrita, não inferência de carga fisiológica zero |
| hills-context-example | 1.320 s total = 60 s trabalho + 360 s recuperação + 900 s warm-up/cooldown |
| Execução parcial | 600 + 360 + 120 + 180 = 1.260 s observados; + 960 s futuros condicionais = 2.220 s; refs de target correspondem à revisão executada |
| S29 | new_material_fact.known_at 18:18 é posterior a started_at 18:00; prefixo concluído separado do restante |
| S13/S14 | session_refs diferentes: run-tue versus run-thu; contrafactual original não preservado |

Nos exemplos de repeat, as contagens de recuperação foram recalculadas usando `iterations_total - 1` porque `recovery_after_last=false`. A rotina independente verificou quantidades positivas com unidade `s` no subconjunto fornecido; não é um validador geral nem prova de runtime.

## Disposição dos findings RUN da 0.1

| Finding | Disposição na 0.2 | Evidência e limite |
|---|---|---|
| RUN-01 blocos/repeats/recovery | CORRECTED para handoff conceitual | União step/sequence/repeat, iterações totais e recovery_after_last explícitos; recovery com modo, alvo, quantidade e advance; warm-up/cooldown entram no total. Três exemplos são coerentes. Manual/open/distance/nesting não foram testados e o pacote declara esse limite. |
| RUN-02 intensidade | CORRECTED para handoff | Métrica/role/optional/reference_kind separados nos 17 seeds; RunIntensityReference inclui construto/método/unidade/validade/aplicabilidade/approval. RPE6 é explicitamente **intenção sintética, não limiar medido**. Referências reais/precedência/anchors continuam G02. |
| RUN-03 bandas por arquétipo | CORRECTED | 17 bandas removidas e UNKNOWN explícito. Não se criou ranking alternativo. Shared cost não é Change Cost, e perfis não ancorados não podem ser consumidos. A revisão humana pode deixar dimensões desconhecidas em vez de fabricar uma escala universal. |
| RUN-04 evento/taper/criticality | CORRECTED para estrutura; sporting effect aberto | Taper é phase-template; referências/owners upstream são reutilizados. C5 possui evento sintético com data/distância/status/prioridade e sessões, deixando receita coordenada e counterfactual effects abertos. Não houve invenção de dose de taper. Ver RUN-DELTA-01 sobre S13/S14. |
| RUN-05 execução/envelope/S29 | CORRECTED para handoff | RunExecution e projeção ExposureContribution preservam revisão/segmento/unknown; exemplo parcial soma corretamente. S29 tem novo fato após início e escopo remaining_work_only. C6 tem envelope 4–6 reps, 60kg total, sets/executing prescription/revisão e binding apenas no ramo sintético; aprovação real null. |
| RUN-06 eixos da taxonomia | ACCEPT WITH EXPLICIT LIMIT | 16 famílias + phase-template, sem catálogo inchado. Tempo/threshold e short intervals mantêm ambiguidades rotuladas para decisão profissional. Não há custo/eligibilidade extraído dessas ambiguidades, portanto não bloqueiam revisar o repertório. |
| RUN-07 terreno/novidade | CORRECTED para forma | Hills contém trabalho +5% e recovery -5% com unidades/roles distintos. Nenhuma banda excêntrica/impacto é inferida. O último recovery é omitido explicitamente; isto verifica estrutura, não valida percurso/geografia/dose. |
| RUN-08 claims/preparação | CORRECTED para handoff | Validação distingue parsing/refs/totais de efeitos fisiológicos, schema geral e software. Prep agora fornece protocolo de resposta, perguntas positivas/negativas, escopo, identidade/competência/approval, limites e fontes. Não promete resolver G01–G04 com assinatura genérica do ZIP. |

## RUN-DELTA-01 — P2 — S13/S14 mudam a sessão além de criticality

**Local:** `DOMAIN_REVIEW_FIXTURES.json`, scenarios[id=S13].overrides.session_ref versus scenarios[id=S14].overrides.session_ref; linhas S13/S14 de `SCENARIO_DOMAIN_MAPPING.md`.

S13 aponta `run-tue`/`threshold-example` (3×6min); S14 aponta `run-thu`/`easy-example` (30min), com outro horário/horizonte e outra intenção. O original Scenario Lab descreve S14 como o mesmo S13 com criticality LOW. A mudança dupla impede atribuir uma diferença ao papel da criticality. Isto não invalida os dois prompts como sessões independentes de revisão nem bloqueia a revisão humana delimitada; invalida dizer que o par original foi convertido num contrafactual controlado.

**Menor correção recomendada:** usar a mesma sessão/dose/contexto em S14 e aplicar um override sintético de criticality LOW ao SessionIntent associado, preservando revisão e escopo do ramo; não alterar o objeto global da sessão. Atualizar mapping. Alternativamente, declarar estes dois como prompts adicionais e manter o par original explicitamente sem materialização. Não fornecer expected_action nem regra de criticality.

## Limites que devem acompanhar o handoff

- **C4:** níveis 0–4 são hints/deltas candidatos; classe e efeito ainda exigem julgamento. Níveis 5/6 continuam NO_SUFFICIENT_WITNESS, sem obrigação de fabricar um caso só para preencher a série.
- **C5:** há evento e vínculo a sessões, não há receita coordenada de taper. Os counterfactuals são nomes de ramos a desenvolver; não devem ser apresentados como cenários completamente executados.
- **C6:** as classes inside/outside são controles sintéticos de intervalo de repetições; não comprovam esforço/RIR, dose aceitável ou direito a progresso. O pacote mantém approval null e progression not awarded.
- **S29:** a nova condição de equipamento posterior ao início é representada; a alternativa do restante continua indeterminada e não houve aplicação real. A guarda de agência upstream permanece necessária.
- **Coverage:** os oito QUESTIONABLE e C1–C6 continuam sem conclusão esportiva. O annex não substitui as 20 Golden fixtures nem migra as dez domain-open. Escopo de tarefa/população e receitas aprovadas continuam ausentes.
- **Implementação:** normalização conceitual não é formal schema completo. Os limites de amount/open, targets, nested repeats, medição/estimativa e reconciliação precisam ser preservados quando houver missão futura autorizada, mas não é necessário implementá-los para esta revisão humana.

Nenhuma pesquisa científica nova foi necessária neste DELTA: não foi introduzida política de treino, banda fisiológica nem alegação de eficácia a verificar. O julgamento é de fidelidade/representação do subconjunto atual.

## Encaminhamento

Pode seguir para profissional competente com a etiqueta **READY WITH FIXES — scoped human domain review**, acompanhado do fix/limite S13/S14. Não requer reescrever a foundation nem regenerar os 17 seeds novamente. Alteração material após os hashes acima invalida apenas a cobertura afetada e deve receber rechecagem DELTA, preservando este parecer como histórico.

## Adendo vigente — submissão r2, 22/10/2026

Rechecagem **somente do delta de quatro arquivos** sob `TDF-0.2-review-input-r2`. A submissão anterior/manifest/checks permanecem preservados como histórico. Este adendo substitui a pendência RUN-DELTA-01 acima; não afirma reauditoria integral nem aprovação esportiva.

Os manifests de submissão 1 e r2 diferem exatamente em CHANGELOG, DOMAIN_REVIEW_FIXTURES, G01_G04_REVIEW_PREP e SCENARIO_DOMAIN_MAPPING. Foram recalculados os hashes/tamanhos reais dos quatro: **4/4 coincidem com r2**.

| Arquivo | Bytes | SHA-256 r2 conferido |
|---|---:|---|
| CHANGELOG.md | 2035 | 7bb11187f169c460f12cae78b5657dbe955f314d282513abf9b3ec1a0f0e3228 |
| DOMAIN_REVIEW_FIXTURES.json | 79264 | 25afe0a483caacc2931bb09d5925ee319ab552302d79acf879318e5056153adb |
| G01_G04_REVIEW_PREP.md | 6752 | 5d1b2a8ec49b86a90463c7b09eba6fab61d9b23f3f21cf572b4f775332c31bc4 |
| SCENARIO_DOMAIN_MAPPING.md | 4696 | 3a29f4facf670676bbce83af735062eafad4ecb87eff9339307af2a4f0f13fdc |

**RUN-DELTA-01: CORRECTED / VERIFIED.** S13 e S14 agora usam a mesma `session_ref=run-tue`, a mesma dose, horário e prioridade herdados e `event_ref=null`. Os objetos `overrides` ficam literalmente iguais após normalizar LOW para HIGH, inclusive o override de SessionIntent. A diferença de criticality está confinada ao ramo, sem alteração da sessão global nem de demanda física. O mapping e as perguntas G02 descrevem corretamente o contrafactual.

Também verificados, sem expandir o escopo:

- Cronologia base recalculada: **46.800 s/13h start-to-start**, **43.200 s/12h end-to-start**. JSON/mapping/prep agora distinguem os construtos e não criam limiar fisiológico.
- MOVE S01 contém new_start/new_end de 18:00–19:00, preservando **3.600 s** de ocupação base; MOVE S02 contém 07:00–07:37, preservando **2.220 s**. Estas são janelas logísticas, sem certificação de suficiência fisiológica.
- `fixture_composition.c2` e mapping tornam explícito que double **substitui** a colocação horária dos mesmos IDs, sem adicionar exposições à semana.
- **Zero** cenários com expected_action, expected_sporting_effect ou professional_approval_ref não nulos. Não entrou novo sporting oracle.
- Checks autorais atuais declaram **43 PASS / 0 FAIL**, revisão `FOUNDATION-AUDIT-20261022-check2`. Foram lidos; as verificações independentes acima são o recorte efetivamente reexecutado por este juiz.

**Parecer vigente:** permanece **READY WITH FIXES para revisão humana delimitada**, sem finding documental Running P0/P1/P2 pendente que impeça esse handoff. Os fixes remanescentes são os trabalhos profissionais e de escopo declarados pelo pacote; continuam impedindo adoção como autoridade/prescrição. Permanecem íntegros os limites C4(5/6), C5, C6, S29 e demais coverage já registrados. Nenhum gate/caso recebeu promoção.
