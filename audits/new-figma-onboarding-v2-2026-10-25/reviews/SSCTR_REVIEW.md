# SSCTR review — OB-2 training-policy semantics (DR-112–115)

- **Review ID:** SSCTR-OB2-2026-10-25-r1 · date 2026-10-25 · instance: this session's reviewer instance, read-only for every pre-existing file.
- **Versions:** agent SSCTR-1.0.0 · constitution SSCTR-CONST-1.0.0 · evidence protocol SSCTR-EP-1.0.0 · skill sports-science-review 1.0.0.
- **Runtime honesty:** this instance received the project adapter body (`.claude/agents/sports-science-concurrent-training-reviewer.md`) verbatim as its system instructions, and it has no Agent/delegation tool. That is consistent with dispatch as the native project agent type, but this instance cannot independently verify how the caller dispatched it. Model, tools and permissions were inherited. No specialist was delegated. No human review, human validation, empirical product validation or clinical clearance happened.
- **Targets (SHA-256):**
  - `audits/new-figma-onboarding-v2-2026-10-25/DECISIONS_DRAFT.md`: `90547e3368b980e4ad8b58a2152239ab88f01c676f64d1b91f4becb8e5df75a0` (draft r1, rows DR-112–115, SSCTR questions 1–5).
  - `FOUNDER_REQUEST.md`: `a94132ba569bcdf09182073c286a8b9e4da1b9fb983080a22eeadc541e594fdc`.
- **Context read:** CURRENT_MISSION (SSCTR, NFV1 blocks); UXS ONB-01/02/06–09/20/21 and EDT-02; AEOS `profile_context`/`practice_context`; the STIL/SIS variation paragraphs; candidate POL-07/POL-08, HYBRID_PLANNING_ENGINE HP-03 and the candidate literature snapshot L01–L24; the prior C1–C6 order notes.
- **Not under review:** the product direction itself (the Founder DECIDED it). This review covers only the coach semantics, guardrails and copy proposed for it.
- **Prior decisions reused, not contradicted:**
  - POL-07 forbids universal 6/12/24/48-hour spacing minimums, "Run-first preference proves fatigue" and "count a double as a third load event".
  - POL-08: overlap is not interference, and evidence from one sex or training status is not universal.
  - HP-03: in Balanced, an event date does not silently grant running priority, there is no default runner-first or 50/50, and windows that cannot support both minimum stimuli lead to ASK.
  - The C1–C6 notes: Balanced with no declared order preference leads to ASK the order or the accepted trade-off.

## Literature access actually available

- **Tools:** WebFetch/WebSearch were available.
- **PubMed:** search pages mostly returned a cookie wall (one search page rendered).
- **Europe PMC:** discovery and metadata/abstract verification went through the Europe PMC REST API (`ebi.ac.uk/europepmc/webservices/rest/search`). All new sources below were verified at record/abstract level.
- **Full text read this session:** only Eddens 2018 (PMC5752732) was opened in full.
- **Reused sources:** L01–L24 are reused at the access depth recorded in the prior candidate snapshot (`product/candidates/autonomous-coaching-foundation/1.0.0/LITERATURE_SNAPSHOT.json`). They were not re-read in this session.
- **Not available:** full texts of the paywalled Kassiano 2022, Schoenfeld 2019, Grgic 2018, Roberts 2020, Refalo 2025 (open access but not opened), Nuzzo 2023 and Doma 2023.
- **Rule applied:** under EP §2, an abstract can carry only narrow, explicitly reported findings. No prescriptive dose is approved here, and every approval below is an allocation/semantics envelope that leans on full-text sources (L01, L02, L03, L04, L07, Eddens 2018) wherever it is decisive.
- **Structured records:** no structured JSON record was produced. The `validate_records.py` helper was **not executed** because Python is not installed in this environment. This Markdown record is the review of record for this request.

## Query log (2026-10-25)

| # | Database | Query (abbreviated) | Purpose | Kept |
|---|---|---|---|---|
| Q1 | PubMed web | Kassiano varying resistance exercises | variation SR | blocked (cookies); redone in Q4 |
| Q2 | PubMed web | Eddens intra-session sequence | order MA | blocked; redone in Q5 |
| Q3 | PubMed web | McNulty menstrual cycle MA 2020 | cycle programming | McNulty 2020 and Elliott-Sale 2020 records |
| Q4 | Europe PMC | TITLE "varying resistance exercises" AND hypertrophy | variation | S03 Kassiano 2022 SR, S04 Kassiano 2025 RCT |
| Q5 | Europe PMC | TITLE "intra-session exercise sequence" AND interference | order | S01 Eddens 2018 (full text opened), Ruiz-Alias 2022 (counterevidence) |
| Q6 | Europe PMC | "concurrent training" AND (order OR sequence) AND meta-analysis | order, counterevidence | S02 Gao 2023 (and its corrigendum); excluded the 2026 T2DM network MA (clinical population) |
| Q7 | Europe PMC | DOIs for Schoenfeld 2019 and Grgic 2018 | frequency vs volume | S07, S08 |
| Q8 | Europe PMC | sex differences RT MA; Colenso-Semple 2023; Roberts 2020 | sex and cycle | S10 Roberts 2020, S11 Refalo 2025, S12 Jones 2021 (older adults, applicability limit), S14 Colenso-Semple 2023 |
| Q9 | Europe PMC | exercise variation / selection 2014–2026 | variation, counterevidence | S05 Baz-Valle 2019, S06 Valério 2026, Barbalho 2021 (context); excluded a preprint (Roy 2026), letters and acute EMG studies |
| Q10 | Europe PMC | sex differences narrative review (Nuzzo) | absolute strength baseline | S13 Nuzzo 2023 |
| Q11 | Europe PMC | Frandsen 2025 DOI | single-session spikes | L17 abstract re-verified |
| Q12 | Europe PMC | Doma running economy after resistance | long-run adjacency | S16 Doma & Deakin 2013; Doma 2017 review (context) |
| Q13 | Europe PMC | Fonseca 2014; Spiering 2021; specificity | variation, maintenance | S09 Fonseca 2014, S17 Spiering 2021 (narrative); specificity reviews (Behm & Sale 1993) used as context only |
| Q14 | Europe PMC | Murlasits 2018 DOI | order | S18 |
| Q15 | Europe PMC | repeated bout effect reviews 2015–2026 | novelty cost of new exercises | S19 Doma 2023 SR/MA; Hayman 2026 and Lindsay 2021 context; Hyldahl 2017 abstract absent |
| Q16 | Europe PMC | running frequency AND injury | high-frequency novice guardrail | no applicable adult study found (null result, logged; not proof of absence) |

---

## Q1 — Chosen days are binding (DR-112)

**Decision: APPROVE_WITH_CONDITIONS.** This covers the allocation envelope ("each chosen day carries a session of that sport; the coach decides content, dose, order and how the weekly load is distributed across the chosen days; more days spread the load rather than add to it").

The high-frequency guardrail and the "no full rest day" note are a **LIMITED_REVERSIBLE_RECOMMENDATION**. **Proposed AE action:** NOT_APPLICABLE to a live adaptation. This is a planning-input semantics rule.

**Population:** adult, recreational, nonclinical V1, with modality-specific eligibility (G01). Unknown eligibility → ASK / ELIGIBILITY_UNASSESSED.

### Findings

| Claim | Status | Basis |
|---|---|---|
| C1.1 With weekly volume equated, how often a muscle is trained per week does not meaningfully change hypertrophy, and the strength effect of frequency is mostly explained by volume. Distributing a fixed weekly strength load across the chosen days is therefore defensible. | WELL_SUPPORTED for hypertrophy; SUPPORTED_WITH_LIMITS for strength (mostly untrained participants; frequency may matter for multi-joint upper-body lifts) | S07, S08 (abstract), L03 (full text) |
| C1.2 Spreading weekly running over more days lowers how much any single run must carry. The available cohort evidence links injury to a single run that markedly exceeds the recent longest run, not to week-to-week change. | SUPPORTED_WITH_LIMITS (observational association; 22% female; device-tracked runners) | L17 (abstract, re-verified) |
| C1.3 A safe maximum run or strength frequency for a novice, or for a jump from current practice, cannot be stated. No applicable trial or cohort defines one. | INSUFFICIENT_EVIDENCE, so no number is set | Q16 null; L20, L23 (abstract) show graded or volume-versus-intensity progression did not change injury in their settings |
| C1.4 Lower-body resistance work can acutely worsen subsequent running (higher next-day running cost, lower time to exhaustion, peak-torque loss and soreness). Effects depend on task and dose. Submaximal running physiology is often little changed. | SUPPORTED_WITH_LIMITS | L02 (full text), S16 (abstract; 14 trained men, 6 h gap), S19 (abstract) |
| C1.5 Chronic interference is outcome-specific (explosive strength more than hypertrophy or maximal strength) and is not established for any particular day layout. | SUPPORTED_WITH_LIMITS | L01, L04 (full text) |

### Conditions the product rule must carry

1. **Fill days with content, not load.** "Each chosen day carries a session" means a session of a supported family for that sport and profile. That can be a short or easy run (including run-walk only if a reviewed recipe exists) or a lower-demand strength session. The weekly load is set first, from goal, recent practice (ONB-08), phase and approved policy. Only then is it distributed across the chosen days. Choosing more days never raises the weekly load and never lowers the per-session floor below a supported recipe.
2. **High frequency is measured against the person, not a universal count.** The comparator is the person's own declared recent frequency and volume (ONB-08), not a fixed number like "6 days". The order of response is:
   - (a) Use content: shorter and easier sessions inside approved recipes. Weekly-load progression stays under existing policy.
   - (b) If the coach cannot make every chosen day a supported session for this profile (no reviewed recipe, coverage or eligibility), show ON-V7: name the fact, give the options (keep all days with short, easy sessions where possible / choose fewer days / keep the choice anyway), and let the person decide.
   - The app never drops a chosen day on its own and never invents a frequency ceiling. The same honesty applies in the other direction: if too few days were chosen for the declared goal (for example, a dated race goal with one run day), ON-V7 says so (HP-03: ASK, not an underdosed plan).
3. **Long-run day versus strength days is handled by content, never by moving days.** Within the chosen strength days, the coach decides which strength session lands where. Where the chosen days allow, it keeps the heaviest lower-body, eccentric-dominant or novel work away from the day before the long run, and away from the same day before it. If every strength day is adjacent to the long run, the coach lowers lower-body demand on that day by content (an upper-body or trunk emphasis, or a reduced lower-body dose under approved policy) and explains the trade-off. Priority decides what is protected: in Strength-first, the long run's content may flex instead. There is no hour-based spacing rule (POL-07). Long-run length progression stays under existing run policy. C1.2 adds no new number.
4. **On a day with both sports in different shifts, the person's shift choice fixes the order.** The coach protects the priority through the content of the earlier session, not by changing shifts. Only the person moves sessions (EDT-02).
5. **HOLD, limitations and clinical routing as drafted.** A scoped HOLD, a reported limitation or an out-of-coverage case may reduce a session, replace it with recovery, or retain it, always explained and never by silently removing the day. Persistent pain, injury or illness → CLINICAL_HUMAN_REQUIRED. No substitute dose is offered in its place.
6. **No full rest day (limited recommendation).** When the combined selection leaves no day without training, ON-V7 may say so neutrally and state that the coach will keep some days light. The person decides. This is not a mandated rest rule: evidence for a universal rest-day requirement was not established here (L18 is abstract-only consensus context).

### Copy

The draft gives no Q1 strings beyond ON-V7. Acceptable ON-V7 pattern:

> "Você escolheu 6 dias de corrida e hoje corre cerca de 2. Dá para usar os 6, com alguns treinos curtos e leves no começo. Se preferir, escolha menos dias."

The numbers in the string must come from the person's answers.

**Prohibited claims:** "o ideal é N dias"; "N dias causa lesão" or any risk percentage; "mais dias = mais resultado"; "o coach vai usar só os dias necessários"; "seguro". There is also no implication that the plan was checked for injury risk.

### Confidence and gate

- **Confidence:** MODERATE for C1.1 and C1.5. LOW–MODERATE for the guardrail wording, because C1.3 is a gap and the order of response is a reasoned reversible design.
- **Ten AE questions:** not applicable (onboarding planning-input semantics, no adaptive decision on an adopted plan). Q3, Q5 and Q6 are reflected in conditions 2 and 3 (smallest sufficient change = content before ON-V7, never dropping a day).
- **Gate status:** NOT_CLOSED_BY_THIS_RECORD. **Publication status:** NOT_PUBLISHED.
- **Next owners:** Product/UX for ON-V7 structure; training policy for the recipe floor ("supported session"). The candidate HYBRID_PLANNING_ENGINE must map "chosen days are hard constraints" (owner R5 gap; it is not edited here).

---

## Q2 — Same shift, back-to-back sessions

**Decision: APPROVE_WITH_CONDITIONS.** Planning two sessions in sequence after explicit confirmation is approved. The order rule below is SUPPORTED_WITH_LIMITS. The pairing condition (C2.4) is a LIMITED_REVERSIBLE_RECOMMENDATION. This is consistent with POL-07 (SSCTR-ACF-P07): the familiar, accepted double is executed in its planned order, with no inference of zero interference and no universal spacing.

### Findings

| Claim | Status | Basis |
|---|---|---|
| C2.1 Same-session concurrent training in chronic trials improves both qualities. Order did not change VO2max/aerobic capacity, hypertrophy or static strength. Strength-then-endurance favoured lower-body dynamic strength (Eddens: WMD about 6.9%; Murlasits: about 4 kg 1RM; Gao: SMD 0.19). | SUPPORTED_WITH_LIMITS (mostly untrained or recreational; under 15 min between modes; heterogeneity I² 66–72%; endurance *performance* was not measured) | S01 (full text), S18, S02 (abstract) |
| C2.2 Counterevidence: one 8-week trial (n = 24) found endurance-then-strength better for jumps and VO2max. | Single small RCT, which does not overturn C2.1 | Ruiz-Alias 2022 (abstract) |
| C2.3 Doing strength first acutely impairs a subsequent run (session quality). This is the main rationale for running first when a key run must be protected, not a chronic aerobic benefit. | SUPPORTED_WITH_LIMITS (acute) | L02 (full text), S16 |
| C2.4 Pairing two demanding key sessions back to back adds acute cost to the second (explosive-strength attenuation is clearest with same-session combinations). | PLAUSIBLE_BUT_UNCERTAIN to SUPPORTED_WITH_LIMITS | L01 (full text), L02 |

### Conditions

1. **Back-to-back needs a recorded choice.** It is allowed only when the person chose the same day and shift for both sports and confirmed "fazer em sequência". The confirmation is stored as a preference that the person can change, not as an inference.
2. **Order follows the day's key session and the declared priority.** The person can always swap it, and a swap is an input, not an error.
   - **Força primeiro:** strength first (C2.1).
   - **Corrida primeiro:** the run goes first when it is that day's key run (quality, long or race-specific), per C2.3. When the run is easy and the strength session matters more that day, strength first is equally defensible (C2.1: no aerobic order cost). The coach may choose, and must explain.
   - **Equilíbrio:** the key session of that day goes first. If both are key, the trade-off is surfaced (ASK, per the C1–C6 note and HP-03), never silently defaulted to run-first.
3. **No hour rule.** There is no rule on gaps or minutes, and no claim about recovery between the two parts (POL-07).
4. **Content pairing (limited recommendation).** Where the chosen days allow, the coach avoids putting a demanding key session of one sport straight before a demanding key session of the other by content allocation across the chosen days, not by moving days. If unavoidable, it lowers the non-priority session's demand under approved policy and explains it.
5. **A double counts as two sessions.** It is not a third load event and is not a "fatigue score" (POL-07, HP §weekly vector).
6. **The combined length is a logistics fact.** It is shown to the person as the sum of the two sessions, not as a physiological measure.

### Copy

**Conflict sheet — accept, with this wording:**

- Title: "Força e corrida no mesmo turno"
- Body: "Nesses dias os dois treinos ficam um depois do outro. O dia fica mais longo, e o coach define a ordem e o conteúdo pela sua prioridade. Você pode inverter a ordem quando quiser."
- Buttons: "Fazer em sequência" / "Mudar o turno"

**Order explainer — acceptable:** "Primeiro vem o treino que mais importa para o seu objetivo naquele dia."

**Prohibited:**
- "a ordem não faz diferença"
- "sem prejuízo" / "não atrapalha"
- "ordem ideal" / "a melhor ordem"
- "evita a interferência"
- any hours or minutes "necessários"
- "correr depois da musculação queima mais gordura" or similar

### Confidence and gate

- **Confidence:** MODERATE (consistent meta-analyses for the strength endpoint, mostly untrained cohorts; acute run-quality evidence is heterogeneous).
- **Ten AE questions:** not applicable (no adaptive decision).
- **Gate status:** NOT_CLOSED_BY_THIS_RECORD. **Publication status:** NOT_PUBLISHED.

---

## Q3 — Strength exercise rotation cadence (DR-113)

**Decision:**

- **Offering the four options:** APPROVE_WITH_CONDITIONS.
- **"O coach decide" as Recomendado:** APPROVE_WITH_CONDITIONS.
- **Option copy and footnote:** REVISE.
- **Anchor-lift handling for strength goals and race-week deferral:** LIMITED_REVERSIBLE_RECOMMENDATION.
- **The exact cadences (2 and 6 weeks) as optimal:** ABSTAIN. They are preference choices, not evidence-derived numbers.

### Findings

| Claim | Status | Basis |
|---|---|---|
| C3.1 Fixed and varied exercise selection give broadly similar strength and hypertrophy over 8–14 weeks when volume and effort are adequate. Examples: within-week rotation in 70 young women (10 weeks); per-session app randomisation in 21 trained men (8 weeks, similar outcomes plus higher intrinsic motivation); variation without extra benefit in 32 adults (8 weeks). | SUPPORTED_WITH_LIMITS (short horizons; small samples; none compared 2-week versus 6-week blocks) | S04, S05, S06 (abstract) |
| C3.2 Systematic variation (anatomically and biomechanically reasoned) may help regional hypertrophy. Excessive or random variation and redundant exercises may compromise gains. | SUPPORTED_WITH_LIMITS (8 studies, 241 young men only) | S03 (abstract); S09 is supporting context |
| C3.3 No trial compares the cadences 2 weeks, 6 weeks, fixed and coach-decided. | INSUFFICIENT_EVIDENCE for any optimal cadence | Q4, Q9 search |
| C3.4 Strength expression is partly specific to the trained task. A new exercise's working load is unknown and must be calibrated, so external-load progression on a specific lift restarts when that lift changes. Effort, volume and underlying adaptation continue. | SUPPORTED_WITH_LIMITS | L03, L07 (full text); specificity context (Behm & Sale 1993; Taniguchi 1997) |
| C3.5 A first exposure to an unaccustomed multi-joint exercise produces more soreness and CK, lower strength/jump and worse running economy at 24–48 h than a repeated bout. How far protection transfers between similar exercises is not established. | SUPPORTED_WITH_LIMITS (first-bout effect); PLAUSIBLE (transfer) | S19 (abstract), L02 |

### Conditions

1. **"Rotation" means exercise selection only.** A rotation swaps an exercise for one that preserves the essential stimulus: the same target muscles and pattern role, comparable demand, available equipment and the person's competence. It is systematic, never random, and never redundant. Programmed variation keeps a training purpose (STIL/AEOS change_reason PROGRAMMED_VARIATION).
2. **The first session with a new exercise is a calibration exposure.** Its load is set from effort (RIR/RPE) under the approved autoregulation policy, not carried over by formula. No exact first-exposure dose is approved here.
3. **"Fixo" keeps the selection.** The exceptions are eligible substitutions (equipment, discomfort or restriction), which always need the person's agency. Persistent pain or a new limitation goes to CLINICAL_HUMAN_REQUIRED, not to a substitution.
4. **Behaviour of "O coach decide" until a rotation policy is SSCTR-reviewed.** The selection is kept within a block, and changes happen at block transitions or for a stated purpose (phase, specificity, equipment, the person's request). The "Recomendado" tag is justified only as "derived from approved policy" (STIL Programmed Variation). It must not pre-select. "O coach decide" must never mean frequent unexplained changes.
5. **Timing around key runs and races (limited recommendation).** Where the chosen days allow, a rotation's first exposure is placed by content away from the long run or key run (C3.5). A rotation that falls due inside a taper or race week is deferred until after the event, with a one-line explanation, and the person can override. A change of cadence is never presented as a rest or deload.
6. **Anchor lifts (limited recommendation; Product/UX and Founder to choose).** For goals measured by specific lifts ("Ficar mais forte"), a 2-week full rotation makes progress on one lift harder to show (C3.4). Two honest options:
   - (a) The 2-week option rotates accessories and close variants of the main lifts, and says so in its helper text.
   - (b) Full rotation, with progress shown by block or effort rather than by a single lift.
   - Silently overriding the person's choice is not acceptable.
7. **Novices.** No forced override. The "O coach decide" recommendation is especially appropriate for them (learning and skill favour some repetition; this is PLAUSIBLE, not decisive).
8. **The rotation recipe itself remains open.** What changes, how many exercises, and how loads carry over still go to training policy + SSCTR before any runtime use (as in the draft).

### Copy

| Option | Draft | Verdict | Accepted string |
|---|---|---|---|
| O coach decide | "Troca quando o seu objetivo pede, geralmente ao fim de um bloco" | KEEP with a small change ("pede" overstates necessity) | "Troca quando faz sentido para o seu objetivo, em geral na virada de um bloco" |
| A cada 6 semanas | "Tempo para progredir nos mesmos exercícios" | KEEP | "Mais tempo para evoluir nos mesmos exercícios" (draft also acceptable) |
| A cada 2 semanas | "Mais variedade; a progressão continua" | CHANGE ("a progressão continua" hides the load reset on new exercises) | "Mais variedade; cada exercício novo começa com uma carga de ajuste" |
| Fixo | "Os mesmos exercícios até você pedir para trocar" | KEEP | — |
| Footnote | "Trocar exercícios não interrompe a progressão: cargas, séries e repetições seguem evoluindo." | REVISE (the load claim is false for a newly introduced exercise) | "Em qualquer opção o treino continua evoluindo. Quando um exercício muda, a carga do novo começa por um ajuste." |

**Prohibited claims:** "confusão muscular"; "evita platô"; "variar dá mais hipertrofia/força"; "6 semanas é o ideal"; "trocar sempre é melhor"; "fixo é melhor"; "não perde nada".

### Confidence and gate

- **Confidence:** MODERATE that all four options sit within an acceptable range for recreational adults under conditions 1–2. LOW on any cadence being better than another.
- **Ten AE questions:** not applicable (preference capture). Rotation execution later is PROGRAMMED_VARIATION under existing AE guards.
- **Gate status:** NOT_CLOSED_BY_THIS_RECORD. **Publication status:** NOT_PUBLISHED.

---

## Q4 — Sex as a coach input (DR-114)

**Decision: LIMITED_REVERSIBLE_RECOMMENDATION.** This is not an approval of a prescriptive use. The menstrual-cycle, hormonal and clinical uses are OUT_OF_SCOPE (CLINICAL_HUMAN_REQUIRED where a clinical state is involved).

### Findings

| Claim | Status | Basis |
|---|---|---|
| C4.1 Healthy adult women and men respond similarly to the same resistance training: no meaningful difference in hypertrophy or lower-body strength gain. Relative upper-body strength gains are larger in women, relative muscle-size gains are similar, and absolute gains favour men. In over-50s, absolute gains favour men and relative gains are mostly similar. | SUPPORTED_WITH_LIMITS | S10, S11, S12 (abstract) |
| C4.2 Absolute baseline strength differs on average by sex, more in the upper body than the lower body, largely through muscle mass. Individual overlap is large, and no validated starting-load formula from sex was verified. | PLAUSIBLE_BUT_UNCERTAIN as a cold-start prior | S13 (abstract, narrative review) |
| C4.3 Programming by menstrual-cycle phase is not supported. Performance differences across the cycle are trivial and inconsistent, the evidence quality is low, and the authors decline general guidance. | INSUFFICIENT/CONFLICTING, so prohibited | S14, S15 (abstract) |
| C4.4 Concurrent-training sex subgroups are sparse (female hypertrophy data especially), so no sex-based interference rule follows. | SUPPORTED_WITH_LIMITS (as a limitation) | L04 (full text); POL-08 |

### Envelope

**Permitted (bounded, reversible):** sex may serve only as a weak prior for the *first suggested absolute load range* of a strength exercise when no load or performance is known. Every one of these must hold:

- The first exposure is calibration by effort, and the person's own performance replaces the prior from the first logged sets (L07; AEOS rule that profile data loses weight as observed data accumulates).
- The prior never sets volume, frequency, rep range, progression rate or exercise selection.
- "Outro" and "Prefiro não dizer" take the same neutral calibration path. That path must be adequate on its own, so that disclosing sex never gives a materially better plan.

The prior's actual values need a separate SSCTR review before any runtime use. Nothing numeric is approved here.

**Prohibited:**

- Different goals, priority recommendations, volume, frequency, intensity, rest, progression rates or exercise menus by sex ("exercícios femininos").
- Running pace, zone or recovery estimates from sex.
- Interference or recovery rules from sex.
- Any menstrual-cycle, hormonal, contraceptive, pregnancy, postpartum or menopause inference or programming.
- Any inference from "Outro" (for example, about hormone therapy).
- Body-composition or "toning" framing.

A clinical state the person reports (pregnancy, postpartum, a hormonal condition) is CLINICAL_HUMAN_REQUIRED / ASK under existing eligibility rules. It is never inferred from the sex field.

**Field semantics (for Security/Product):** a physiological prior can only use sex, not gender identity. If the field is presented as gender, it supports no physiological use at all. "Outro / Prefiro não dizer = no sex-specific context" is scientifically acceptable.

### Copy

- **Draft:** "Usamos como ponto de partida das cargas. Não muda seus objetivos."
- **Verdict:** CHANGE. The draft overstates the role, and "ponto de partida das cargas" reads as a determinant.
- **Accepted string:** "Só ajuda a sugerir as primeiras cargas. Depois, o que conta é como você treina."
- **Prohibited:** "Treinos adaptados ao seu sexo"; "mulheres/homens precisam de…"; "ajustado ao seu ciclo"; "Personalizado pelo seu gênero".

### Confidence and gate

- **Confidence:** MODERATE that sex should have a minimal role (C4.1, C4.3). LOW that it adds value even as a load prior (C4.2).
- **Note on ONB-01:** with a consumer this weak, whether to ask is a product decision. The Founder decided to ask, and nothing here reverses that.
- **Gate status:** NOT_CLOSED_BY_THIS_RECORD. **Publication status:** NOT_PUBLISHED.

---

## Q5 — "Recomendado" priority mapping (DR-115)

**Decision: LIMITED_REVERSIBLE_RECOMMENDATION** for the mapping as a visible, non-pre-selected suggestion. **REVISE** the residual rule ("any other pair → Equilíbrio").

Priority is a declared preference and trade-off (ONB-07, C049, HP-03), not a scientific determination. Science can only say whether a suggestion is consistent with the goals.

### Per mapping

| Goals | Draft suggestion | Verdict | Basis |
|---|---|---|---|
| Strength "Força para correr melhor" (+ any run goal) | Corrida primeiro | Consistent: the strength goal serves a running endpoint. SUPPORTED_WITH_LIMITS. | L12 (running economy), L01 |
| Strength "Manter a força" (+ any run goal) | Corrida primeiro | Consistent: maintenance needs a smaller dose than development if intensity is kept. PLAUSIBLE to SUPPORTED_WITH_LIMITS (narrative review; mostly younger adults, and older adults may need more). | S17, L03 |
| Run "Correr com regularidade" + strength "Ficar mais forte" / "Ganhar massa muscular" | Força primeiro | Acceptable as a suggestion. Regularity is protected by the chosen run days (DR-112) rather than by priority. PLAUSIBLE. | Goal logic; C1.1 |
| Run "Uma prova com data" + strength development | Corrida primeiro | Acceptable only as a visible suggestion, with the reason shown. HP-03 says a race date must not *silently* grant running priority, and Equilíbrio is equally defensible when the race is distant. Not pre-selected, so compatible. | HP-03; L01 (hypertrophy not clearly attenuated) |
| Any other pair | Equilíbrio | REVISE. A residual default is not "derived"; it risks reading as a hidden default (C049: no default or hidden weights). | ONB-07; HP-03 |

### Conditions

1. **Never pre-selected.** The reason line names the person's own goals, not science. Changing the choice costs nothing.
2. **Explicit, exhaustive precedence table.** The strength-goal rules (maintain / for running) take precedence over the race rule, so "prova com data + Manter a força" gives Corrida primeiro without ambiguity. Equilíbrio is tagged only where both goals are development goals with no dated event (for example, a run performance goal without a date + "Ficar mais forte"). Unmapped, multiple or ambiguous goal sets show **no tag**.
3. **Only one sport chosen.** There is no priority question and no tag.
4. **Revisit when goals change.** A goal edit later recomputes the suggestion only for display. It never changes an adopted priority without the person's confirmation.
5. **The mapping must not depend on sex** (Q4).

### Copy

**Acceptable reason lines:**

- "Recomendado pelo seu objetivo de força: ‹Força para correr melhor›"
- "Recomendado porque sua prova tem data. A força segue no plano, com menos prioridade perto da prova."

**Prohibited:** "cientificamente melhor"; "evita interferência"; "garante seu resultado"; "necessário"; "a escolha certa"; any claim that another option would harm the person.

### Confidence and gate

- **Confidence:** MODERATE for the two "strength supports running / maintenance" mappings. LOW–MODERATE for the other two (preference-laden).
- **Gate status:** NOT_CLOSED_BY_THIS_RECORD. **Publication status:** NOT_PUBLISHED.

---

## Separate status fields (all items)

- **Disposition:** as stated per item above.
- **Evidence status:** per claim, as listed.
- **Proposed AE action:** NOT_APPLICABLE (no live adaptation).
- **Gate:** NOT_CLOSED_BY_THIS_RECORD; whole-gate closure is false.
- **Publication:** NOT_PUBLISHED. The PCG/Chief doc sync is the next owner.
- **Validation flags:** human validation false; empirical product validation false; clinical clearance false.
- **Runtime:** none. The CoachingCore and candidate foundation still need R5 mapping (owner gap).
- **Re-review owner:** training policy + SSCTR.
- **Expiry:** 2027-04-25, or earlier on any of these events: a new systematic review or meta-analysis on concurrent order, exercise variation, frequency or sex differences; correction or retraction of a cited source; a change to V1 population or objectives; real-use data showing chosen-day or back-to-back adherence or adverse patterns; definition of the rotation recipe or the cold-start load prior; the Founder declaring funded-human revalidation.

## Proposed entries for the single funded-human queue

These are proposals only. The queue file was not edited.

| Proposed ID | Rule (scope) | Basis decision | Status to set |
|---|---|---|---|
| OB2-Q1-ALLOC | Chosen days are binding; weekly load is set first and then distributed; content before ON-V7; never drop days; the long-run adjacency is handled by content (Q1 conditions 1–5) | SSCTR-OB2-2026-10-25-r1 Q1 APPROVE_WITH_CONDITIONS | QUEUED_FOR_FUNDED_HUMAN_REVALIDATION |
| OB2-Q2-ORDER | Confirmed back-to-back; the day's key session goes first by priority; Balanced with both sessions key → ASK; no hour rule (Q2 conditions 1–5) | Q2 APPROVE_WITH_CONDITIONS | QUEUED_FOR_FUNDED_HUMAN_REVALIDATION |
| OB2-Q3-ROTATION | Rotation preserves the essential stimulus; first exposure is calibration; Fixo keeps selection except agency-confirmed substitution; coach-decides behaviour until a recipe is reviewed (Q3 conditions 1–4) | Q3 APPROVE_WITH_CONDITIONS | QUEUED_FOR_FUNDED_HUMAN_REVALIDATION |

**Q4 and Q5 (limited recommendations):** no queue entry is required, because no prescriptive approval was granted. Chief may optionally queue OB2-Q5-PRIORITY-SUGGEST for visibility. Any future cold-start load prior that uses sex needs its own SSCTR approval and a queue entry before activation.

## Sources

Access depth shown is what was actually read.

**Order of concurrent sessions**

- **S01** Eddens L, van Someren K, Howatson G. The Role of Intra-Session Exercise Sequence in the Interference Effect: A Systematic Review with Meta-Analysis. *Sports Med* 2018;48(1):177-188. doi:10.1007/s40279-017-0784-1 · PMID 28917030 · https://pmc.ncbi.nlm.nih.gov/articles/PMC5752732/ · FULL_TEXT.
- **S02** Gao J, Yu L. Effects of concurrent training sequence on VO2max and lower limb strength performance: SR/MA. *Front Physiol* 2023;14:1072679. doi:10.3389/fphys.2023.1072679 · PMID 36776981 · corrigendum doi:10.3389/fphys.2023.1192593 (content of the correction not stated in the record) · ABSTRACT_ONLY.
- **S18** Murlasits Z, Kneffel Z, Thalib L. The physiological effects of concurrent strength and endurance training sequence: SR/MA. *J Sports Sci* 2018;36(11):1212-1219. doi:10.1080/02640414.2017.1364405 · PMID 28783467 · ABSTRACT_ONLY.
- **Counterevidence:** Ruiz-Alias SA et al. *J Sports Sci* 2022;40(15):1722-1731. doi:10.1080/02640414.2022.2103615 · PMID 35856521 · ABSTRACT_ONLY.

**Exercise variation and specificity**

- **S03** Kassiano W et al. Does Varying Resistance Exercises Promote Superior Muscle Hypertrophy and Strength Gains? A Systematic Review. *J Strength Cond Res* 2022;36(6):1753-1762. doi:10.1519/JSC.0000000000004258 · PMID 35438660 · ABSTRACT_ONLY.
- **S04** Kassiano W et al. Muscle Hypertrophy and Strength Adaptations to Systematically Varying Resistance Exercises. *Res Q Exerc Sport* 2025;96(2):371-381. doi:10.1080/02701367.2024.2409961 · PMID 39388663 · ABSTRACT_ONLY.
- **S05** Baz-Valle E et al. The effects of exercise variation in muscle thickness, maximal strength and motivation in resistance trained men. *PLoS One* 2019;14(12):e0226989. doi:10.1371/journal.pone.0226989 · PMID 31881066 · ABSTRACT_ONLY (open access, not opened).
- **S06** Fabrício Valério D et al. Changes in Upper-Limb Lean Tissue Mass in the Early Stages of Resistance Training: The Role of Volume Progression and Exercise Variation. *Res Q Exerc Sport* 2026. doi:10.1080/02701367.2026.2652354 · PMID 41985475 · ABSTRACT_ONLY.
- **S09** Fonseca RM et al. Changes in exercises are more effective than in loading schemes to improve muscle strength. *J Strength Cond Res* 2014;28(11):3085-3092. doi:10.1519/JSC.0000000000000539 · PMID 24832974 · ABSTRACT_ONLY (variation cadence not verified).
- **Specificity context only:** Behm DG, Sale DG. Velocity specificity of resistance training. *Sports Med* 1993;15(6):374-388. doi:10.2165/00007256-199315060-00003 · RECORD/ABSTRACT. Taniguchi Y. *Eur J Appl Physiol* 1997;75(2):144-150. doi:10.1007/s004210050139 · ABSTRACT_ONLY.

**Training frequency**

- **S07** Schoenfeld BJ, Grgic J, Krieger J. How many times per week should a muscle be trained to maximize muscle hypertrophy? *J Sports Sci* 2019;37(11):1286-1295. doi:10.1080/02640414.2018.1555906 · PMID 30558493 · ABSTRACT_ONLY.
- **S08** Grgic J et al. Effect of Resistance Training Frequency on Gains in Muscular Strength: SR/MA. *Sports Med* 2018;48(5):1207-1220. doi:10.1007/s40279-018-0872-x · PMID 29470825 · ABSTRACT_ONLY.

**Sex differences**

- **S10** Roberts BM, Nuckols G, Krieger JW. Sex Differences in Resistance Training: SR/MA. *J Strength Cond Res* 2020;34(5):1448-1460. doi:10.1519/JSC.0000000000003521 · PMID 32218059 · ABSTRACT_ONLY.
- **S11** Refalo MC et al. Sex differences in absolute and relative changes in muscle size following resistance training in healthy adults: SR with Bayesian MA. *PeerJ* 2025;13:e19042. doi:10.7717/peerj.19042 · PMID 40028215 · ABSTRACT_ONLY.
- **S12** Jones MD et al. Sex Differences in Adaptations in Muscle Strength and Size Following Resistance Training in Older Adults: SR/MA. *Sports Med* 2021;51(3):503-517. doi:10.1007/s40279-020-01388-4 · PMID 33332016 · ABSTRACT_ONLY (applicability: over-50s).
- **S13** Nuzzo JL. A narrative review of sex differences in strength, endurance, … and neuromuscular adaptations. *J Strength Cond Res* 2023;37(2):494-536. doi:10.1519/JSC.0000000000004329 · PMID 36696264 · ABSTRACT_ONLY (narrative; not prescriptive support).

**Menstrual cycle**

- **S14** Colenso-Semple LM et al. Current evidence shows no influence of women's menstrual cycle phase on acute strength performance or adaptations to resistance exercise training. *Front Sports Act Living* 2023;5:1054542. doi:10.3389/fspor.2023.1054542 · PMID 37033884 · ABSTRACT_ONLY.
- **S15** McNulty KL et al. The Effects of Menstrual Cycle Phase on Exercise Performance in Eumenorrheic Women: SR/MA. *Sports Med* 2020;50(10):1813-1827. doi:10.1007/s40279-020-01319-3 · PMID 32661839 · ABSTRACT_ONLY.

**Acute effects of strength work on running, and first-exposure cost**

- **S16** Doma K, Deakin GB. The effects of strength training and endurance training order on running economy and performance. *Appl Physiol Nutr Metab* 2013;38(6):651-656. doi:10.1139/apnm-2012-0362 · PMID 23724883 · ABSTRACT_ONLY.
- **S19** Doma K et al. The Repeated Bout Effect of Multiarticular Exercises on Muscle Damage Markers and Physical Performances: SR/MA. *J Strength Cond Res* 2023;37(12):2504-2515. doi:10.1519/JSC.0000000000004628 · PMID 38015738 · ABSTRACT_ONLY.

**Maintenance dose**

- **S17** Spiering BA et al. Maintaining Physical Performance: The Minimal Dose of Exercise Needed to Preserve Endurance and Strength Over Time. *J Strength Cond Res* 2021;35(5):1449-1458. doi:10.1519/JSC.0000000000003964 · PMID 33629972 · ABSTRACT_ONLY (narrative).

**Reused from the candidate snapshot (access as recorded there, not re-read here):**

- L01 Schumann 2022 (FULL_TEXT)
- L02 de Carvalho e Silva 2022 (FULL_TEXT)
- L03 Currier/ACSM 2026 (FULL_TEXT)
- L04 Huiberts 2024 (FULL_TEXT)
- L07 Hickmott 2022 (FULL_TEXT)
- L12 strength training and running economy MA 2023 (FULL_TEXT)
- L17 Frandsen 2025 (ABSTRACT_ONLY; re-verified in this session)
- L18 ECSS/ACSM overtraining consensus 2013 (ABSTRACT_ONLY)
- L20 Buist 2008 (ABSTRACT_ONLY)
- L23 Ramskov 2018 (ABSTRACT_ONLY)
