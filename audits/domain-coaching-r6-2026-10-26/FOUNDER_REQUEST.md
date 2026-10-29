# DOMAIN_COACHING_R6 — Founder request (recovered verbatim)

Recovered on 2026-10-26 by the Claude Code continuation session from the interrupted Codex root session rollout `~/.codex/sessions/2026/10/26/rollout-2026-10-26T10-05-11-01a17850-9b6a-7b73-86c8-037852fdc20d.jsonl` (user message at 2026-10-26T13:05:11.901Z). Only the user's own request text is reproduced; the bounded ChatGPT conversation preview that preceded it is untrusted reference data and is not reproduced. The previous execution persisted only a summary contract; this file restores the full authority text. SHA-256 of the request body below (LF): `f138bddd33f95691318c0efa591b75e782ebfd939d793460d3cd0a53b6efc5ab`.

---

Continuing from [Branch · Analisar fórmula de sucesso](chatgpt-conversation://6ad64a78-da44-83e8-9a49-c8ee4854daa9): Execute no projeto MyApp a missão: **DOMAIN_COACHING_R6 — ROBUST AUTONOMOUS COACHING & COLD-START COMPLETION**.

OBJETIVO
Transformar o treinador R5 — que já gera programas e raciocina por horizonte, mas ainda falha em vários casos inéditos — em um treinador muito mais robusto para situações normais da V1.

Esta missão NÃO deve ser uma expansão abstrata.
Ela deve começar pelos erros concretos do holdout R5 e fechar competências fundamentais ainda ausentes.

Prioridades:
1. corrigir todos os defeitos concretos revelados pelo holdout R5;
2. completar cold start real a partir de inputs imperfeitos de onboarding;
3. melhorar Balanced Hybrid;
4. completar geração whole-program;
5. fechar retorno não clínico e transição de evento/race-week nos perfis V1 principais;
6. melhorar substitution e adaptation breadth;
7. tornar Athlete Model longitudinal robusto a dados parciais/ruído/adesão;
8. criar novo holdout realmente não visto e usar qualidade de coaching como gate principal.

Node24 continua sendo o reference runtime/oracle.
NÃO migrar para KMP ainda.
NÃO tocar em UI/Figma.
NÃO aplicar plano real.

==================================================
CONTEXTO R5 CONGELADO
==================================================

R5 entregou:
- program → block → week → session;
- quatro horizontes H0/H1/H2/H3;
- whole-program simulator;
- counterfactual selection;
- longitudinal athlete associations;
- 11 trajetórias;
- 120 semanas sintéticas;
- 580 sessões prescritas;
- 550 actuals fornecidos como fixtures;
- 280/280 testes;
- 14/14 verificações objetivas;
- 365 historical replays preservados;
- frozen R4 preservado;
- 0 official-plan effects;
- 0 completed-work rewrites.

Holdout R5 independente (24 casos):
- 4 BEST_SUPPORTED
- 4 ACCEPTABLE_ALTERNATIVE
- 3 SUBOPTIMAL
- 6 INSUFFICIENT_INFORMATION
- 7 UNSUPPORTED

Falhas concretas reportadas:
- seleção Balanced subótima em 3 casos;
- contratos bloqueando progressão pretendida;
- contratos bloqueando retorno pretendido;
- substituições fornecidas, mas não selecionadas;
- adapter introduzindo horário futuro indevido em observações;
- H20: boa adaptação final, mas falha de geração inicial preservada;
- quatro trajetórias de meia maratona ainda com gap explícito de race-week;
- learning ainda não cobre adequadamente partial completion / adherence / ambiguous response.

Todos os readiness amplos permaneceram NOT_READY.
PRODUCTION_CORE_SEMANTIC_STABILITY = NOT_READY.
NEXT_ENGINEERING_STEP = DOMAIN_COACHING_R6.

==================================================
PRINCÍPIO CENTRAL
==================================================

R6 não mede sucesso por contagem de testes.

O principal objetivo é:
**o treinador deve conseguir conduzir um atleta elegível da entrada inicial até a progressão/adaptação futura, fazendo decisões best-supported sob informação imperfeita e sem depender de uma semana já pré-estruturada.**

O runtime já é determinístico.
Agora precisamos provar que o coaching é bom.

==================================================
1. CONGELE O HOLDOUT R5 COMO REGRESSION SUITE
==================================================

Os 24 casos do holdout R5 devem permanecer imutáveis.

Não alterar:
- facts;
- inputs;
- expected review framing;
- first evaluation raw.

Criar uma disposition explícita caso a caso:
- root cause;
- classificação R5;
- capability faltante;
- correção R6;
- resultado R6;
- se mudou, por quê;
- se continua gap, por quê.

Os 3 SUBOPTIMAL e 7 UNSUPPORTED devem receber análise individual.

Não é obrigatório transformar todos em positivos.
ASK/HOLD pode continuar correto.
Mas nenhum caso deve continuar falhando por bug/contrato artificial já conhecido.

==================================================
2. FIX BALANCED HYBRID
==================================================

Balanced é uma competência central, não uma média 50/50.

Formalizar:
1. procurar primeiro alternativa Pareto-dominante;
2. preservar ambos os estímulos essenciais quando possível;
3. comparar efeitos nos horizontes H0/H1/H2/H3;
4. aceitar trade-off apenas quando realmente necessário;
5. quando trade-off existir, escolher a alternativa que minimiza prejuízo conjunto ao progresso dos dois objetivos, considerando fase e atleta;
6. se alternativas forem genuinamente incomparáveis por preferência, usar ASK legítimo.

Não implementar:
- alternating winner heuristic;
- 50/50 hard split;
- hidden Run-first;
- hidden Strength-first.

Reproduzir e corrigir explicitamente os 3 Balanced SUBOPTIMAL do holdout R5.

Criar counterfactual traces mostrando:
- candidatos;
- stimulus preserved/lost;
- interference;
- horizon cost;
- athlete evidence;
- reason selected.

==================================================
3. COLD START REAL
==================================================

Esse é um blocker principal.

O produto real NÃO recebe uma semana perfeita pronta.
Ele recebe onboarding + dados possivelmente incompletos.

Construir pipeline realista:

OnboardingState
→ Canonical Athlete Intake
→ Capability / uncertainty assessment
→ Program Goal Model
→ Weekly constraints
→ Initial block
→ Week 1
→ executable sessions

Inputs possíveis:
- age eligibility already satisfied;
- sex optional;
- height/weight optional;
- run goal;
- strength goal;
- event/date/time goal if present;
- recent run frequency;
- recent run volume/distance;
- recent performance anchors;
- run experience;
- recent strength frequency;
- strength training age;
- known exercises/loads;
- strength emphasis/preferences;
- equipment;
- run days/turns;
- strength days/turns;
- preferred long-run day;
- workout duration budgets;
- exercise-rotation preference;
- available wearable capabilities;
- limitations/unknowns;
- no Vilumo history.

Do NOT require fields that onboarding does not actually collect unless R6 can justify a material ASK.

Unknowns should be categorized:
- safe to proceed with conservative establishment;
- ASK required;
- can be learned during first sessions;
- out-of-scope/clinical.

The engine must build a productive initial program for eligible low-data athletes instead of HOLD by default.

==================================================
4. ONBOARDING-CONTRACT COMPATIBILITY
==================================================

The UI team is evolving onboarding semantics.
R6 must not hardcode stale assumptions such as:
- static Run-first/Strength-first/Balanced user priority;
- coach freely chooses training days;
- every selected day must be filled regardless of validity;
- time goal directly defines training pace;
- sex directly maps to starting load;
- strength data never comes from wearables.

Use current Product Truth / Product Decision Register only.
If the current repo already contains superseding decisions, consume them.
If onboarding updates are not yet merged, design R6 contracts to tolerate their expected semantics without mutating UI/docs from this mission.

==================================================
5. INITIAL PROGRAM GENERATION
==================================================

R6 must generate complete initial programs from athlete intake — not from prebuilt weekly configurations.

Required representative profiles:

A. Run-first half-marathon intermediate
B. Strength-first intermediate
C. Balanced hybrid intermediate
D. novice runner + experienced strength
E. experienced runner + novice strength
F. general hybrid fitness
G. low-data/no-wearable athlete
H. athlete with partial wearable history

For each:
- build phase/block structure;
- create initial weekly architecture;
- create executable prescriptions;
- identify establishment sessions where uncertainty exists;
- preserve chosen training days/turns where valid;
- explicitly negotiate unsatisfiable schedules rather than silently changing them.

No static templates disguised as generation.
Templates may be primitives, but selection/composition must depend on athlete context.

==================================================
6. RUN PROGRAMMING BREADTH
==================================================

Expand/repair run trajectory competence for normal V1:
- easy establishment/progression;
- long-run progression;
- threshold/cruise progression;
- faster interval progression where supported;
- strides/hills where relevant;
- race-specific work;
- taper/race-week transition;
- return/re-establishment.

Intensity calibration must separate:
- current capability;
- athlete time goal;
- available anchors;
- uncertainty.

Do NOT let aspirational race goal directly become training intensity.

==================================================
7. STRENGTH PROGRAMMING BREADTH
==================================================

Expand/repair:
- first-session load establishment;
- known-load continuation;
- load/reps/set/RIR progression selection;
- regression;
- maintenance;
- running-support strength;
- hypertrophy emphasis/preferences;
- movement priority when applicable;
- substitutions;
- return after interruption;
- event-phase maintenance.

When multiple progression modes are valid, select based on objective/context rather than always load.

Exercise rotation preference must not destroy continuity.

==================================================
8. SUBSTITUTION SELECTION
==================================================

Fix R5 cases where valid substitutions were supplied but ignored.

Substitution logic should evaluate:
- movement/stimulus intent;
- equipment;
- configuration;
- skill/familiarity;
- loading practicality;
- local/systemic demand;
- running interference;
- current goal;
- athlete history;
- whether substitution requires new establishment.

No blind same-muscle equivalence.
No automatic load conversion between exercises.

==================================================
9. RETURN AFTER INTERRUPTION
==================================================

Close nonclinical return for V1 normal cases.

Trajectory:
prior program/history
→ interruption facts
→ current uncertainty
→ re-establishment prescription
→ observation
→ next-step progression
→ return to normal progression

Support at least:
- short interruption;
- moderate interruption;
- run-dominant athlete;
- strength-dominant athlete;
- hybrid athlete;
- known previous tolerance;
- partial current capacity evidence.

Do NOT use universal percentage rollback.

Clinical/injury/illness/clearance routes remain human/clinical.

==================================================
10. EVENT / TAPER / RACE-WEEK TRANSITION
==================================================

R5 half-marathon trajectories still contain explicit race-week gaps.
R6 must materially address this.

At minimum for supported recreational V1 profiles:
- 10K;
- half-marathon;
- Run-first hybrid athlete;
- Balanced athlete with temporarily elevated event importance where support exists.

Need trajectory:
build
→ race-specific
→ taper
→ race week
→ race
→ immediate nonclinical post-event transition

Do not create universal taper percentages.
Use approved reusable boundaries + Coaching Intelligence.

Strength should not disappear automatically.
Decide what to preserve/reduce based on event context and athlete history.

==================================================
11. ADAPTIVE BREADTH
==================================================

Expand from local adaptations to program-level normal cases:
- missed essential workout;
- missed optional workout;
- partial week;
- one-off underperformance;
- repeated underperformance;
- overperformance;
- local fatigue;
- systemic convergence;
- schedule change;
- unavailable preferred day;
- double conflict;
- progression not tolerated;
- progression too easy;
- objective/date change;
- substitution need;
- return after pause;
- event-week conflict.

Always evaluate:
KEEP
vs smallest valid change
vs larger replan.

MEC remains central.

==================================================
12. ATHLETE MODEL — PARTIAL / NOISY REALITY
==================================================

Improve longitudinal learning for imperfect data.

Handle:
- partially completed workout;
- missing RPE/RIR;
- missing HR;
- manual workout + wearable duplicate;
- stale wearable sync;
- corrected workout;
- one bad session;
- ambiguous subjective response;
- performance good / subjective bad;
- performance poor / recovery apparently good;
- inconsistent adherence;
- skipped optional work;
- repeated comparable outcomes.

Need provenance + confidence.

Do not learn a hard rule from one event.
Do not treat missing as negative.
Do not let duplicated activity double-count training.

Use:
- recency;
- comparability;
- consistency;
- source quality;
- repeated direction;
- hysteresis.

==================================================
13. FIX FUTURE-TIMESTAMP / PROVENANCE BUG
==================================================

The R5 review found observation episodes with future time introduced by adapter.

Trace root cause.
Fix it.
Add regression tests for:
- future timestamp;
- clock skew;
- duplicate event;
- stale event;
- out-of-order event;
- timezone normalization.

No future observation may influence a past decision unless explicitly simulated as a future-horizon scenario and isolated from causal runtime state.

==================================================
14. H20 INITIAL GENERATION FAILURE
==================================================

Preserve H20 R5 raw.

Perform explicit root-cause analysis of why initial generation failed even though later MOVE was good.

Fix generation capability, not merely downstream adaptation.

Add regression coverage.

==================================================
15. PROGRAM QUALITY REVIEW
==================================================

For generated whole programs, independent reviewer must evaluate more than schema validity.

At minimum:
- goal alignment;
- phase logic;
- progression logic;
- session distribution;
- strength/run interaction;
- key-stimulus placement;
- recovery opportunity;
- schedule compliance;
- event trajectory;
- unnecessary complexity;
- excessive monotony;
- avoidable interference;
- unexplained gaps.

Classification:
- PROGRAM_BEST_SUPPORTED
- PROGRAM_ACCEPTABLE
- PROGRAM_SUBOPTIMAL
- PROGRAM_INCOMPLETE
- PROGRAM_UNSUPPORTED

No self-labeling by runtime as quality evidence.

==================================================
16. DECISION QUALITY
==================================================

Preserve:
- BEST_SUPPORTED
- ACCEPTABLE_ALTERNATIVE
- SUBOPTIMAL
- INSUFFICIENT_INFORMATION
- UNSUPPORTED
- CLINICAL_OUT_OF_SCOPE

Primary quality goal is to increase BEST_SUPPORTED while eliminating structural SUBOPTIMAL/UNSUPPORTED cases.

Do NOT optimize raw positive count.

KEEP is success when KEEP is the best-supported coaching decision.
ASK is success when the missing information is genuinely required.

==================================================
17. COUNTERFACTUALS
==================================================

For important decisions, compare viable candidates.

Trace:
- why selected;
- why others lost;
- goal impact;
- H0/H1/H2/H3 impact;
- essential stimulus;
- interference;
- recovery;
- athlete-specific history;
- reversibility;
- change cost.

No arbitrary magic score.

==================================================
18. WHOLE-PROGRAM SIMULATION
==================================================

Expand simulator with at least:
- 4-week establishment trajectories;
- 8-week intermediate trajectories;
- 12–16 week event trajectories.

Include scripted actuals for:
- strong adherence;
- irregular adherence;
- missed key workout;
- overperformance;
- repeated underperformance;
- short interruption;
- schedule changes;
- substitution;
- event transition.

Synthetic actuals are fixtures, not physiology predictions.

Check:
- no runaway progression;
- no deadlock;
- no permanent HOLD;
- no repeated unnecessary ASK;
- no adaptation cascade;
- no weekly tremor;
- no priority inversion;
- no broken phase transition;
- no impossible schedule;
- no missing race week in supported event profiles.

==================================================
19. FRESH R6 UNSEEN HOLDOUT
==================================================

After implementation freeze:
1. hash runtime/contracts;
2. separate independent author creates a new corpus without viewing implementation internals/expected outputs;
3. seal corpus;
4. first evaluation runs once;
5. preserve raw;
6. independent reviewer evaluates quality;
7. no retuning before first-evaluation report.

Must include normal V1 cases for:
- cold-start run;
- cold-start strength;
- cold-start hybrid;
- Balanced conflict;
- low data;
- partial wearable data;
- missed key session;
- substitution;
- progression;
- regression;
- return;
- race-week;
- learned athlete-specific response;
- schedule constraint;
- partial completion;
- conflicting signals.

The R5 holdout remains regression only; do not reuse it as the fresh holdout.

==================================================
20. SCIENCE / SSCTR
==================================================

Maintain R4/R5 authority split:
- Sports Science defines defensible boundaries/envelopes/relationships;
- Coaching Intelligence selects concrete option inside them.

Do not return to paper-per-workout approval.

New scientific review only for:
- new/changed envelope;
- materially changed scientific claim;
- return/taper boundary changes;
- sex-specific or population-specific claims if introduced;
- other material domain changes.

No science review required for pure adapter bugfixes.

==================================================
21. WEARABLE-AWARE INPUT WITHOUT IMPLEMENTING INTEGRATIONS
==================================================

Do not implement Garmin/COROS/Polar integration in R6.

But input contracts should support capability-based data provenance such as:
- activity available;
- exercise identity available;
- sets/reps/load available;
- HR available;
- subjective effort absent/present;
- source/provider;
- confidence/completeness.

The coach must degrade gracefully when wearable detail is incomplete.

==================================================
22. REQUIRED END-TO-END DEMONSTRATIONS
==================================================

R6 must demonstrate at least:

A. Cold-start Run-first from onboarding-like inputs → initial 12–16 week plan → week 1.
B. Cold-start Strength-first → initial block → first load establishment/progression.
C. Cold-start Balanced hybrid → initial plan without static priority flag.
D. Balanced real conflict → Pareto/counterfactual selection.
E. Missed key run → best horizon-preserving adaptation.
F. Missed key strength session → best horizon-preserving adaptation.
G. Partial completed session → learning update without overreaction.
H. Repeated underperformance → regression/adjustment.
I. Overperformance → earned progression.
J. Substitution due equipment change → valid replacement.
K. Short nonclinical interruption → re-entry trajectory.
L. Half-marathon build → taper → race week → event → post-event transition.
M. Athlete-specific learned pattern changes a future valid decision.

Each must show:
- initial facts;
- uncertainty;
- generated program;
- relevant horizons;
- candidate options;
- selected option;
- reasoning;
- response;
- model update;
- future effect.

==================================================
23. METRICS
==================================================

Headline metrics should prioritize coaching quality, not test counts.

Report:

### R5 holdout regression
- BEST_SUPPORTED
- ACCEPTABLE
- SUBOPTIMAL
- INSUFFICIENT_INFORMATION
- UNSUPPORTED

### R6 fresh holdout
same distribution.

### Cold start
- complete programs generated
- establishment-required programs
- legitimate ASK
- incomplete/unsupported

### Whole-program quality
- PROGRAM_BEST_SUPPORTED
- PROGRAM_ACCEPTABLE
- PROGRAM_SUBOPTIMAL
- PROGRAM_INCOMPLETE
- PROGRAM_UNSUPPORTED

### Adaptation
- appropriate KEEP
- appropriate MODIFY
- unnecessary mutation
- insufficient mutation
- excessive mutation

### Learning
- valid update
- ignored relevant history
- overfit
- duplicate contamination
- false causal hardening

Also report tests/replays, but not as primary readiness evidence.

==================================================
24. KMP PREP GATE
==================================================

Do NOT migrate.

At the end, evaluate whether the semantic core is stable enough for KMP.

KMP_PRODUCTION_CORE_PREP may only be recommended if:
- cold start works for core V1 profiles;
- whole-program generation works end-to-end;
- Balanced no longer has structural suboptimal behavior;
- run/strength/hybrid trajectories are materially complete;
- normal nonclinical return works;
- supported event profiles include race-week transition;
- substitution works;
- Athlete Model changes future decisions without obvious overfit;
- fresh unseen holdout reveals no fundamental architecture/domain hole;
- remaining gaps are bounded/edge coverage rather than core semantics.

If not, NEXT_ENGINEERING_STEP remains DOMAIN_COACHING_R7 or other explicit bounded mission.

==================================================
25. DELIVERABLES
==================================================

At minimum:
1. `R5_HOLDOUT_REGRESSION_R6.md/json`
2. `BALANCED_HYBRID_R6.md/json`
3. `COLD_START_ENGINE_R6.md/json`
4. `INITIAL_PROGRAM_GENERATION_R6.md/json`
5. `RUN_PROGRAMMING_R6.md/json`
6. `STRENGTH_PROGRAMMING_R6.md/json`
7. `HYBRID_PROGRAMMING_R6.md/json`
8. `SUBSTITUTION_ENGINE_R6.md/json`
9. `RETURN_ENGINE_R6.md/json`
10. `EVENT_TRANSITION_R6.md/json`
11. `ADAPTIVE_COACHING_R6.md/json`
12. `ATHLETE_MODEL_R6.md/json`
13. `PROVENANCE_TIME_R6.md/json`
14. `PROGRAM_QUALITY_R6.md/json`
15. Node runtime implementation
16. regression tests
17. whole-program simulator results
18. fresh R6 holdout corpus
19. first evaluation raw
20. independent coaching-quality review
21. SSCTR review only where required
22. `OPEN_GAPS_R6.md/json`
23. `READINESS_VERDICTS_R6.json`
24. `VERIFICATION.json`
25. `FINAL_REPORT.md`

==================================================
26. VERDICTS
==================================================

Emit separately:
- COLD_START_READINESS
- WHOLE_PROGRAM_GENERATION_READINESS
- RUN_PROGRAMMING_READINESS
- STRENGTH_PROGRAMMING_READINESS
- BALANCED_HYBRID_READINESS
- HYBRID_PROGRAMMING_READINESS
- SUBSTITUTION_READINESS
- RETURN_AFTER_PAUSE_READINESS
- EVENT_TRANSITION_READINESS
- HORIZON_COACHING_READINESS
- ADAPTIVE_COACHING_READINESS
- ATHLETE_LEARNING_MODEL_READINESS
- COACHING_DECISION_QUALITY
- WHOLE_PROGRAM_QUALITY
- AUTONOMOUS_COACHING_SPEC_READINESS
- PRODUCTION_CORE_SEMANTIC_STABILITY
- KMP_PRODUCTION_CORE_PREP_READINESS
- NEXT_ENGINEERING_STEP

Allowed NEXT_ENGINEERING_STEP examples:
- DOMAIN_COACHING_R7
- KMP_PRODUCTION_CORE_PREP
- SHADOW_EXPANSION
- OTHER with rationale.

Do not force READY.

==================================================
DEFINITION OF DONE
==================================================

R6 is done when:
- every R5 holdout defect has a disposition;
- known software bugs are fixed with regression tests;
- cold start no longer assumes a prebuilt weekly plan;
- initial program generation works from onboarding-like inputs for core profiles;
- Balanced structural suboptimality is materially corrected;
- provided substitutions can be selected when appropriate;
- nonclinical return has executable trajectories;
- supported event trajectories include race week;
- Athlete Model handles partial/noisy data without obvious overfit;
- H20 root cause is fixed or explicitly narrowed;
- R5 holdout improves without changing its facts;
- fresh unseen R6 holdout is executed once and independently reviewed;
- coaching quality, not mere output existence, drives readiness;
- Node remains deterministic/auditable;
- no UI/Figma/KMP/production/real plan is changed.

FINAL OBJECTIVE
**Move Vilumo from a promising but incomplete synthetic coach to a robust V1 coaching core that can start from realistic athlete intake, generate a full program, coordinate running and strength, adapt across horizons, learn from imperfect real-world responses, and preserve the athlete's long-term objective with best-supported decisions.**
