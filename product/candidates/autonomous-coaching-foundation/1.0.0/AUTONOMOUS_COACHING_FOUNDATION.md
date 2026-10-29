# V1 Autonomous Coaching Foundation

ACF-1.0.0-r1 · 23/10/2026 · MyApp / Vilumo Fit. **CANDIDATE / NON-AUTHORITATIVE**. Este pacote é uma especificação offline implementável por contratos delimitados. Não é runtime, prescrição para pessoa real, Product Truth, validação humana ou demonstração de eficácia. Foundation0.2 conserva seus bytes e autoridade candidata. Os quatro vereditos finais e o alcance aceito ficam em FINAL_REPORT.md e GATE_DISPOSITION.json; a existência deste overview não os antecipa.

O treinador precisa construir o plano antes de decidir se ele muda: inputs reconciliados → elegibilidade/cobertura → objetivos/fase/contexto → receitas concretas → semana/bloco conjunto → proposta e aceite → execução versionada → fatos/response → atualização do mesmo Athlete Model → verificar validade → manter ou menor mudança suficiente → próximo horizonte. RUN e STRENGTH propõem; HYBRID/AE arbitra um único plano. Recovery e Interference não somam nova carga nem prescrevem planos concorrentes. JEV continua SHADOW, LLM não tem soberania.

| Pilar | Contrato implementável | Consumidor e prova |
|---|---|---|
| A Run | RUN_PRESCRIPTION_ENGINE.md + RUN_SESSION_RECIPES.json |16receitas finitas, targets/métodos/steps/guardas; semanas e cenários|
| B Strength | STRENGTH_PRESCRIPTION_ENGINE.md + STRENGTH_SESSION_RECIPES.json |8receitas, configuração×dose×contexto; cargas binding history e warmup separados|
| C Hybrid | HYBRID_PLANNING_ENGINE.md |REPLAN/INITIAL, schedule search, UNSAT/SEARCH_INCOMPLETE, prioridades e Pareto|
| D Policies | TRAINING_POLICY_LIBRARY.md/json |20famílias, candidate_actions, preserve/trade-off/forbidden/fallback, consumers reais|
| E Response | ATHLETE_RESPONSE_MODEL.md |Loop planned/actual/observed/pattern/model/future; equivalência, confounders, hysteresis e invalidação|
| F Recovery | RECOVERY_READINESS_MODEL.md |Recovery state ≠ readiness específica ≠ decisão; tiersA/B/C e ASK que muda escolha|
| G Autonomy | AUTONOMY_BOUNDARY_CONTRACT.md |A/B/C/D/E como tetos condicionados; confirmação não cria suporte científico|

COACHING_CONTRACTS.json define contratos lógicos de estado/eventos/provenance/units/erros e guard order. Não é o schema direto do JSON abreviado de fixtures; FIXTURE_SCHEMA.json e verify_foundation.py validam esse shape e suas relações. A futura implementação deve fazer um adapter explícito, sem completar semântica esportiva com heurística/LLM. IDs de policy/recipe/review e revisões não são aliases livres.

O pacote contém nove atletas sintéticos, nove semanas, incluindo Run-first/Strength-first/Balanced e general fitness, um bloco de4 semanas e24 cenários. O fixture author compila escolhas explícitas para inspeção; **não implementa um coach**. Every numeric value is either a supplied synthetic athlete input, a recipe design point or a derived arithmetic result. Literature supports specified frameworks/limits; it does not prove that35min or62.5kg is individually optimal. Calendário não conquista progressão; nova observação não obriga mutação.

Prescrição concreta significa estrutura finita e executável: warmup, trabalho, recuperações apenas onde indicadas, cooldown, método/unidade e calibração; força inclui configuração, séries/reps/carga/RIR/rest/ROM, não um fatigue score por exercício. A duração reservada de força é orçamento de agenda, não duração fisiológica medida. Sem binding crítico, retorna ASK/HOLD em vez de dose padrão. Reps por lado e carga por mão são explícitas; músculos secundários não viram séries sistêmicas extras.

Prescrição inicial usa plan_base_ref=NONE, adequacy=NOT_APPLICABLE_INITIAL, REPLAN scopeINITIAL e adoçãoB. KEEP de plano válido e execução de branch exata previamente aceita podem ter tetoA futuro. Estar dentro de um intervalo numérico sem branch aceita não autoriza alterar plano escolhido. Uma proposta B continua inelegível quando a ciência/regra não sustenta a dose; preferência/consentimento não corrige isso. Missing decision-changing input→C; unsupported scope→D; dependência clínica→E. O usuário pode parar independentemente do algoritmo.

Na aprendizagem, population prior, observação recente, evidência individual e padrão durável são estados distintos. A suficiência é conjunção qualitativa revisável (comparabilidade, ocorrências independentes, convergência, confounders, contraditórios e contexto), não número mágico. O exemplo repetido não prova causalidade nem valida personalização. Pode ranquear candidatos já admissíveis; não inventa dose, spacing mínimo ou autoridade. Mudança relevante de contexto/correção invalida inferências dependentes sem apagar fatos.

O SSCTR1.0.0 é autoridade interna provisória, sem credenciais humanas. Autoria, síntese, auditoria adversarial científica e governance são instâncias diferentes. Registros com hashes exatos e disposição por item em SCIENTIFIC_DECISION_REGISTRY.json e reviews/. Políticas autorais mantêm PENDING como estado da submissão; o registry é o overlay de decisão, não aprovação blanket. Toda aprovação prescritiva entra na fila humana única existente, sem sobrescrever46itens anteriores. Funding só muda com declaração real do Founder; clínica não espera funding. Profissional futuro pode manter, alterar ou revogar sem veto do agente.

COACHING_COVERAGE_MATRIX distingue situações normais, incomuns e clínicas/fora de escopo. Cobertura não significa nunca abster. A meta futura de resolver a grande maioria das situações normais exige baseline/avaliação independente representativa, não90/95% criado nesta missão. Fixtures desenhadas e contagem de documentos não medem cobertura populacional.

Handoff: usar o registry para selecionar somente contratos/ações/receitas com revisão vigente e condições satisfeitas; implementar guardas e semântica já definidas sob autorização futura; traduzir os24 oráculos para testes executáveis/shadow; medir erros/abstenções e calibrar com revisão competente. OPEN_GAPS possui owners e provas de saída para positivos ainda não sustentados. O próximo engenheiro não pode preencher esses gaps com defaults, nem chamar o subset implementado de treinador autônomo completo.
