# DELTA — VILUMO-PTC-2.2.0 → VILUMO-PTC-2.3.0 (DRAFT)

This is a PCG governance record. It is not Product Truth, and it does not approve the draft; approval comes from the gates listed in §0. Contract excerpts are quoted in Portuguese, as in the source.

## 0. Identity

| Field | Value |
| --- | --- |
| previous_revision | VILUMO-PTC-2.2.0, `canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md`, sha256 `5c780fdc336166066edbc9ed62dfa0e947efdb5177898faf6c934346f6e35601`, canonical (event `VF-PTC-2.2.0-CANONICAL-20261010-001`). It differs from the reviewed 2.2.0 draft `724834fb…810e` only in the status marker on line 5 (verified by diff) |
| snapshot | `governance/drafts/VILUMO-PTC-2.3.0/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.2.2.0.snapshot.md`, byte-identical to the canon, same sha256 |
| new_revision | VILUMO-PTC-2.3.0, `governance/drafts/VILUMO-PTC-2.3.0/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md`, sha256 `13f3116d494b7885d2877118210312bf6af10cf942c8ce06cac288ac974fd65f` |
| state | PRODUCT_CONSTITUTION_DRAFT / GOVERNANCE_READY_FOR_REVIEW, not canonical |
| date | 2026-10-11 |
| author | PCG worker, a subagent of the Claude Chief session `07efc0a5-e1c7-44ef-828e-cbc759fc6a51`. Same author as 2.2.0; not a judge or consolidator |
| triggers | (1) the Founder's hybrid-experience decision; (2) the deferred non-blocking findings RA2-01 to RA2-04 and DI3-01 to DI3-03 from the 2.2.0 reviews, whose trigger was "next Canon revision" |
| decider / approval_ref | Hybrid experience: the Founder, `audits/founder-decisions/2026-10-11_hybrid-experience-founder-decision.md` (sha256 `1db720f2a77593a8771b0473ddb9379bcbe392bbcd4dea7bfd0040edff08ef27`), given 2026-10-11 about 09:30 America/Sao_Paulo. Deferred findings: PCG editorial authority (§2, §28); no new strategic decision |
| evidence_policy | `doctrine_audit` (formalization and fidelity). No hypothesis is validated |
| gates required | DOCTRINE_EVIDENCE_REVIEWED and DOCTRINE_INTERPRETABLE by fresh independent instances on the draft sha256 above, then PRODUCT_CONSTITUTION_READY (Chief) |

## 1. Ground and restate

**Task:**
- Formalize the Founder's hybrid-experience decision (9 principles plus the effort goal) at the lowest correct authority.
- Keep durable principles separate from interaction examples, and fix no UI, navigation or new scope.
- Formalize the in-product agent's role within L007, L022, L014, C012 and C015, without inventing the confirmation and autonomy contract.
- Decide whether the external reference is named in the Canon.
- Batch the deferred findings RA2-01 to RA2-04 and DI3-01 to DI3-03.
- L001–L023 and the Founder clause lines C016–C025, D010 and D011 stay byte-identical. If a principle needed to change one of them, that would be a THESIS_CONFLICT, and I would stop and escalate.

**Sources read:**
- the canon 2.2.0, in full;
- the Founder record, in full; its "Chief grounding notes" were used as routing interpretation only, not as doctrine;
- the round-2 sections of `audits/canon-2.2.0-reviews/DOCTRINE_EVIDENCE_REVIEWED_r1.md` (sha256 `dce0aef4…26a9a6`) and `DOCTRINE_INTERPRETABLE_r1.md` (sha256 `32b779b9…4f0030`);
- `registry/routing.json`, only to confirm the role ID `ai-systems-agent-experience-architect`.

**Not read:** `product/` (only hashed), `CURRENT_MISSION.md` (cited only as the reference-rule location named by the Chief), the Pierre product itself, and any legacy material.

## 2. CURRENT (2.2.0)

- The Canon has no in-product agent concept and no principle for experience shape or effort.
- §30 binds Product/UX to translate outcomes without fixing screens or navigation. D009 keeps objects, journeys and states as design space. §3 fixes no UI.
- §30.1 holds the Shareable Visual System (C027) but no visual-identity principle.
- C024 already places the minimum-credible-coverage determination inside Release Scope, but O014 does not say so (RA2-01).
- The opening sentence of §7.1 lists the clauses it reads as if exhaustive (RA2-02).
- The rule about approving a Release Scope reads as categorical (RA2-04).
- The interim record rule covers delegations only (DI3-02).
- The C025 anchor can move with each change (DI3-03).
- The scope of the C025 rights against role-neutral conditions, and whether invite projection is discretionary, are unclear (DI3-01).

## 3. TARGET

- A new §30.2 "Experiência híbrida" with one CURRENT PRODUCT DECISION per principle plus one for the decision and goal. The visual-identity principle goes in §30.1.
- Readings that tie each principle to existing clauses instead of repeating them.
- One HYPOTHESIS for the expected effect on effort.
- One OPEN QUESTION for the missing agent confirmation and autonomy contract, with competent non-Founder owners.
- Violation rows for the new decisions, and a one-sentence summary line in §33.
- The seven deferred findings resolved editorially.
- No LOCKED or Founder clause line changed, and no external product named.

## 4. Formalizing the hybrid-experience decision

### 4.1 Placement, granularity and classification

**Placement:**
- Principles 1–8 and the decision with its goal go in a new **§30.2** inside the Product/UX implications. They state experience outcomes and limits for Product/UX to translate (§30, D009).
- Principle 9 goes in **§30.1** (UI/Brand), because it governs visual and interactive manifestation, next to C027.
- No section was renumbered. Downstream artifacts cite §30.1 and §7.1.

**Granularity: one ID per principle (C029–C037), plus C028 for the decision and goal.**
- Why: each principle is cited downstream independently (Phase 4 architecture, Phase 5 experience model, Phase 13 UI). One ID per Founder principle keeps fidelity auditable line by line. The order follows the Founder's numbering.
- Principles 3 and 8 overlap existing doctrine. Their clauses state only the new element, and their readings cross-reference the existing clauses, so nothing is repeated.

**Classification:**
- All ten clauses are **DECIDED · CURRENT PRODUCT DECISION**. The Founder's text says "Decisão do fundador … Incorpore os seguintes princípios".
- None is LOCKED: they are revisable by the authorized process, and the Founder framed them as a decision, not an identity invariant.
- The readings are INFERRED. The expected effect is a HYPOTHESIS (H008, ASSUMED). The confirmation and autonomy gap is an OPEN QUESTION (O015).

**Rejected alternatives:**
- One single clause: hard to cite, and it would mix principles of different kinds.
- Separate IDs for the overlapping parts of principles 3 and 8: duplication, which the Founder's line 29 forbids.
- DESIGN SPACE: the principles use "precisam", "devem" and "não podem"; they are obligations, not open choices.
- LOCKED: above the Founder's framing.

### 4.2 Mapping: Founder principle → clause

| Founder text | Clause | What is new in the Canon | Existing clauses referenced, not repeated |
| --- | --- | --- | --- |
| Decision and goal (lines 7, 9) | VFT-C028 | Hybrid shape (simple contextual entry, direct execution, accessible depth). Goal: minimize cognitive and operational effort. Screen count is not a goal; no overloaded initial experience, no hard-to-find functions, no dependence on conversation for simple tasks | §3, D009, §30 (no UI fixed); L020 (not screen time) |
| Princípio 1, Entrada contextual (line 13) | VFT-C029 | The initial experience prioritizes what is planned, the next action, relevant changes and pertinent commitments; not every capability needs to appear at once | L007, L013 (reading) |
| Princípio 2, Execução direta (line 14) | VFT-C030 | Frequent execution and logging tasks have clear, predictable controls that are reachable without the agent. The five examples illustrate classes of task | D004 (food-logging example), Release Scope |
| Princípio 3, Profundidade por modalidade (line 15) | VFT-C031 | Each of the four sports has its own language and controls in the integrated experience; no single generic model | C023, L023, C024, §7.1, L003, O013 (reading) |
| Princípio 4, Agente para coordenação e decisões (line 16) | VFT-C032 | The agent is the conversational path for coordination and decisions: it interprets context, resolves conflicts, explains alternatives and prepares adjustments. It acts within the applicable confirmation and autonomy contract, with no silent changes | L004, L007, L022, L002, L014, §16, §17, C012, C015, §3, §29, D009; O015 (gap) |
| Princípio 5, Consistência entre agente e telas (line 17) | VFT-C033 | The conversational and direct paths use the same data and plans. Agent changes show on the direct paths, manual changes inform the next recommendations, differences in scope are explicit, and nothing additional changes silently | L007, §3, D009 (reading) |
| Princípio 6, Detalhes sob demanda (line 18) | VFT-C034 | History, advanced analyses and full explanations are discoverable. Frequent actions, relevant errors, sync problems and decision-affecting uncertainty are never hidden | C012 (reading) |
| Princípio 7, Navegação previsível (line 19) | VFT-C035 | Personalization may change priorities and contextual content, but stable references for finding and repeating tasks are preserved | §3, D009, §16 (reading) |
| Princípio 8, Social acessível (line 20) | VFT-C036 | Joining, finding people or groups again, following commitments and sharing progress need recognizable paths that do not depend exclusively on the agent | L002, L009–L014, C016–C022, C025, §21.1 (reading) |
| Princípio 9, Identidade preservada (line 21) | VFT-C037 (§30.1) | Simplicity coexists with visual personality, motion, feedback and finish. The Founder's external reference of contextual simplicity does not authorize copying its interface | C027; the reference is kept out of the Canon (§4.5) |
| Expected effect (implicit in "O objetivo é minimizar esforço") | VFT-H008 | The hybrid experience will reduce cognitive and operational effort | H-series convention (an effect is not stated as proven) |

### 4.3 Per-change entries

**CH-01 · §1 Document Status**
- Before: "VILUMO-PTC-2.2.0 · **Estado:** Publicado (status vigente em `canon/CANONICAL_INDEX.md`) · **Data:** 10/10/2026".
- After: "VILUMO-PTC-2.3.0 · **Estado:** DRAFT, não canônico · **Data:** 11/10/2026".
- The status rule is unchanged. Epistemic basis: OBSERVED. Authority: Chief instruction.
- Impact: at publication only this marker changes (OI-1).

**CH-06 · §30.1, new VFT-C037 and its reading (Princípio 9)**
- Clause text: "Simplicidade deve coexistir com personalidade visual, movimento, feedback e acabamento. A referência externa de simplicidade contextual indicada pelo Founder não autoriza copiar sua interface."
- Reading:
  - The named reference stays in the Founder record, outside the contract, and a visual reference is not Product Truth.
  - Other external references the Founder indicates likewise inform only the kind of quality they were indicated for and never authorize copying an interface.
  - C037 belongs to §30.2 and does not reduce C027.
- Epistemic basis: DECIDED for the clause; INFERRED for the generalization in the reading.
- Authority: Founder line 21; the project reference rules ("Treat them only as the type of reference explicitly provided"; "Visual reference != Product Truth"); the Chief's view on the principle.
- Rejected:
  - Naming the reference in the Canon (see §4.5).
  - Putting the generalization inside the clause text, which would attribute to the Founder more than the Founder said.

**CH-07 · new §30.2 heading, VFT-C028 and "Alcance de §30.2"**
- C028 text: "O Vilumo Fit deve adotar uma experiência híbrida, com entrada simples e contextual, execução direta e profundidade acessível. O objetivo é minimizar esforço cognitivo e operacional. Quantidade mínima de telas não é meta: reduzir telas não pode resultar em uma experiência inicial sobrecarregada, funções difíceis de encontrar ou dependência de conversa para tarefas simples."
  - The Founder's word "home" is rendered as "experiência inicial", the same term principle 1 uses, so no destination is named.
- "Alcance de §30.2" says:
  - the principles define outcomes and limits, not screens;
  - they fix no tabbar, screen count, destination names, navigation or new scope;
  - the examples illustrate classes and create no feature or launch obligation, and timing follows Release Scope;
  - the principles govern how in-scope capabilities are found and operated, and do not add capabilities or alter the pillars;
  - the effect is H008.
- Epistemic basis: DECIDED (C028); INFERRED (scope note).
- Authority: Founder lines 7 and 9; incorporation instructions at lines 26 and 27 ("Diferencie princípios duradouros de exemplos…"; "não fixa tabbar, quantidade de telas, nomes de destinos ou novo escopo"); §3; D009; §30.

**CH-08 · new VFT-H008**
- Text: "A experiência híbrida de VFT-C028 a VFT-C037 reduzirá o esforço cognitivo e operacional das pessoas no Vilumo."
- Epistemic basis: ASSUMED. Class: HYPOTHESIS.
- Rationale: the Founder states the goal (DECIDED, in C028). That this design achieves the goal is an empirical premise. Same convention as C016 → H007.
- Rejected: no hypothesis at all, which would leave the effect implicitly treated as proven.

**CH-09 · VFT-C029, VFT-C030 and their reading (Princípios 1 and 2)**
- C029 follows the Founder's text. "Todas as capacidades do produto não precisam aparecer simultaneamente" is rendered "Nem todas as capacidades do produto precisam aparecer simultaneamente", the same meaning.
- C030 states the obligation for the class "Tarefas frequentes de execução e registro" and lists the Founder's five examples as "exemplos dessas classes de tarefa".
- Reading: "next action" and "what is planned" follow the engine (L007); the entry treats interruption and return without moral failure (L013); the food-logging example applies to whatever food logging is in scope and does not make full food logging mandatory (D004).
- Epistemic basis: DECIDED (clauses); INFERRED (class abstraction and reading).
- Authority: Founder lines 13–14 and 26 (examples are not features).
- Rejected: the Founder's sentence verbatim, with the five examples as the grammatical subject. That would read as five mandatory controls, which line 26 rejects.

**CH-10 · VFT-C031 and its reading (Princípio 3)**
- Clause text: "Running, Cycling, Swimming e Strength Training, que permanecem de primeira classe (VFT-C023), preservam na experiência integrada linguagem, controles e profundidade funcional próprios."
- Reading: the new element is per-modality language and controls, with no single generic model. Depth and phasing stay in C023, L023, C024 and §7.1, and the whole person stays in L003. The clause applies as Release Scope includes each sport; it does not anticipate depth, declare support, or alter C024 or O013.
- Epistemic basis: DECIDED (clause); INFERRED (reading).
- Authority: Founder line 15; C024 (phasing, Founder); the sports record's "no forced generic template" as corroboration.
- Rejected:
  - Extending the clause to D011 sports (not in the Founder's text).
  - Reading principle 3 as simultaneous depth for all four (it would collide with C024; see §4.6).

**CH-11 · VFT-C032 and its reading (Princípio 4, the agent)** — see §4.4.

**CH-12 · VFT-C033 and its reading (Princípio 5)**
- The clause uses the Founder's verbs ("devem operar", "precisa aparecer", "precisa ser considerada", "devem ser explícitas").
- Reading: "telas" means the direct paths, without fixing their number, names or destinations. The manual change is considered by Adaptive Performance (L007). The ban on silent changes applies to every path.
- Epistemic basis: DECIDED; INFERRED (reading). Authority: Founder line 17. This is the durable consistency rule the Chief named.

**CH-13 · VFT-C034, VFT-C035 and their reading (Princípios 6 and 7)**
- Both clauses use the Founder's wording.
- Reading: the C034 items are classes of information, and the clause creates no new history or analytics. Decision-affecting uncertainty applies C012. In C035, "stable references" are an outcome, not a specific tabbar or destination, and personalization does not extend consent (§16).
- Epistemic basis: DECIDED; INFERRED (reading). Authority: Founder lines 18–19.

**CH-14 · VFT-C036 and its reading (Princípio 8)**
- The clause states only the new element.
- Reading: Social Continuity and Shareability stay governed by L002, L009–L014, C016–C022 and C025. "Reencontrar pessoas ou grupos" means people and Crews the person already has a relationship with in the product; it widens no C025 discovery and creates no public listing or search (L012). Sharing stays voluntary (§21.1).
- Epistemic basis: DECIDED; INFERRED (reading). Authority: Founder line 20 ("Preserve Social Continuity e Shareability conforme o contrato atual").
- Rationale: without the "reencontrar" guard, a reader could take the principle as permission for people search, contrary to C025 and L012.

**CH-15 · §31: two new violation rows**
- Row 1: the agent determines appropriateness against the engine, fabricates precision, diagnoses improperly, uses data beyond consent or applies a silent change; or an agent change does not appear on the direct paths. Clauses: L007/L014/C012/C015/C032/C033.
- Row 2: a simple, frequent or social task depends on conversation with the agent; personalization removes stable references; or a frequent action, relevant error, sync problem or decision-affecting uncertainty is hidden. Clauses: L022/C028/C030/C034/C035/C036.
- Epistemic basis: INFERRED (violation mapping of the new decisions, following the existing convention).

**CH-16 · §31 hypotheses row**
- "H001–H007/C008" becomes "H001–H008/C008", and "efeito da experiência híbrida" is added.

**CH-18 · §32, new VFT-O015** — see §4.4.

**CH-19 · §33 Canonical Summary**
- One paragraph added: "A experiência é híbrida: entrada simples e contextual, execução direta e profundidade acessível, para minimizar esforço cognitivo e operacional. O agente ajuda a coordenar e decidir sem substituir o motor nem os caminhos diretos, e simplicidade coexiste com identidade visual."
- A summary only, with no new obligation.

(CH-02 to CH-05 and CH-17 are the deferred findings, in §5.)

### 4.4 The agent (Princípio 4): VFT-C032, its limits, and VFT-O015

**C032 text:** "Na experiência híbrida, o agente é o caminho conversacional para coordenação e decisões: ajuda a interpretar contexto, resolver conflitos entre modalidades, agenda, recuperação e alimentação, explicar alternativas e preparar ajustes. O agente atua dentro do contrato de confirmação e autonomia aplicável (VFT-O015) e não aplica mudanças silenciosas."

**Limits stated in the reading, each against its clause:**
- **L007 and L004:** the agent does not determine appropriateness. It helps the person interpret and resolve conflicts, and the appropriateness of the alternatives stays with Adaptive Performance. The Founder's verb is "ajuda a … resolver".
- **L022, compatibility shown explicitly:** the agent is a path, not the identity or the mandatory interface.
  - Simple and frequent tasks have direct paths (C028, C030), social has recognizable paths outside the agent (C036), and value still comes from the two pillars (L002).
  - A design in which the product depends on the agent to function would reduce Vilumo to a "chatbot de treino" or a "camada de IA", and so would violate L022. A §31 row covers this.
- **L014, §16, §17:** the agent uses data only within the applicable consent. Talking to it neither extends consent nor exposes other members' data.
- **C012:** it states uncertainty and data limits, with no fabricated precision.
- **C015:** it gives no improper diagnosis and does not treat signals as medical certainty.
- **Scope:** when and how far the agent enters each release follows Release Scope. Its architecture, AI model and technical relation to the Adaptive Engine are not set by the contract (§3, §29, D009).

**Epistemic basis:** DECIDED (the role, Founder line 16); INFERRED (each limit, from the clause cited). Class: CURRENT PRODUCT DECISION plus a reading.

**The confirmation and autonomy gap, resolved as VFT-O015:**
- **The gap.** The Founder wrote "Respeite os contratos existentes de confirmação e autonomia". The Canon has authority (L007), consent (L014) and agency-related doctrine, but no explicit in-product contract for agent confirmation, undo or autonomy; the Chief's grounding notes record the same. PCG must not invent its content.
- **The binding outcome is recorded in C032:** the agent acts within the applicable confirmation and autonomy contract, with no silent changes. C033 adds explicit differences in scope.
- **New VFT-O015 (OPEN QUESTION):**
  - Question: which contract governs the changes the agent prepares or applies: which need confirmation, how they are undone, how scope is shown, and what the agent never applies alone.
  - Owners: Product/UX with the AI Systems & Agent Experience Architect propose and specify; Security assesses when sensitive data or actions are involved. The Founder decides only if a proposal widens the agent's autonomy enough to affect identity or the engine's authority (§2).
  - Trigger: before the architecture or the experience model specifies changes applied by the agent. In practice this is Phase 4 for agent placement and scope rules and Phase 5 for behavior, confirmation and undo, as the Chief's notes say.
  - Effect (§32): until O015 is decided, no solution treats as decided which changes the agent applies and with what confirmation. The C032 reading says so explicitly.
- **Why an OPEN QUESTION, given the Chief's guidance "only if genuinely strategic":**
  - §2 defines an OPEN QUESTION as "identifica uma decisão ausente". It does not require the decision to be strategic.
  - §32 already has OPEN QUESTIONS with non-Founder owners (O003, O007, O008).
  - The O row gives the gap a stable ID, a trigger and the §32 blocking effect, which a routing note inside C032 would lack.
  - The owner is not the Founder. The Founder enters only on the §2 trigger, so no strategy is escalated unnecessarily.
- **Rejected:**
  - (a) Inventing confirmation tiers or undo rules: forbidden, and design work.
  - (b) A routed obligation only inside C032's text: no stable trigger and no §32 effect.
  - (c) A Founder-owned OPEN QUESTION: overreach, since the content is specialist design.
  - (d) Treating PDM authority, I5 or I10 as the contract: those are downstream artifacts I did not read, and they are not agent-specific.

### 4.5 The external reference: not named in the Canon

**Decision.** The Canon formalizes the principle in C037: simplicity coexists with personality, motion, feedback and finish, and the Founder's reference of contextual simplicity does not authorize copying its interface. The name stays in the Founder record and in the mission's reference rules.

**Justification:**
1. §3: the Canon fixes no UI. Naming a product would invite downstream readers to treat it as a template.
2. Project rule: "Visual reference != Product Truth"; references are treated "only as the type of reference explicitly provided".
3. The Founder said "Pierre é uma referência de simplicidade contextual; esta decisão não autoriza copiar sua interface". The principle carries the normative content; the name adds no obligation.
4. One source of truth: the reference is already in the Founder record (line 21) and in the mission rules, per the Chief's notes.

**Rejected:** naming Pierre in C037, which would put a reference into Product Truth.

### 4.6 Conflict check (THESIS_CONFLICT)

**Result: no THESIS_CONFLICT.** No LOCKED invariant or Founder clause line needed changing; the checks confirm all are byte-identical.

| Existing clause | Hybrid principle | Finding |
| --- | --- | --- |
| L002 (two pillars) | all | Compatible: the hybrid decision shapes the experience and adds no pillar ("Alcance de §30.2") |
| L003 (one athlete, no miniapps) | Princípio 3 | Compatible: per-modality language inside an integrated experience |
| L007 / L004 (the engine determines) | Princípios 4, 5 | Compatible: the agent helps and does not determine; manual changes go to the engine |
| L009 (value without a Crew) | Princípios 1, 2 | Compatible: direct paths require no Crew |
| L012 / C025 (no public listing; discovery limits) | Princípio 8 "reencontrar" | Compatible under the reading (existing relationships only) |
| L013 (return) | Princípio 1 | Compatible: the reading ties contextual entry to L013 |
| L014, §16, §17 (consent) | Princípios 4, 7 | Compatible: the agent and personalization do not extend consent |
| L020 (no screen time as objective) | goal | Reinforced: the goal is to minimize effort |
| L022 (no chatbot or AI-layer identity) | Princípio 4 | Compatible, shown explicitly (§4.4), with a §31 row |
| L023, C023, C024, §7.1, O013 (depth and phasing) | Princípio 3 | Possible tension: "permanecem … preservando … profundidade funcional próprios" could be read as requiring all four at full depth now. Resolved without conflict: the Founder decision does not mention simultaneity and orders "Preserve os invariantes aprovados"; C024 (Founder) expressly allows phasing. C031 applies as Release Scope includes each sport |
| C006 / D004 (nutrition; full logging is design space) | Princípio 2 example | Compatible: the example illustrates a class and does not make full food logging mandatory |
| C012 (no fabricated precision) | Princípios 4, 6 | Reinforced |
| C015 (no improper diagnosis) | Princípio 4 | Compatible: stated as a limit on the agent |
| C016–C022 (Shareability) | Princípio 8 | Unchanged; C036 adds only recognizable paths |
| C027 (Shareable Visual System) | Princípio 9 | Compatible: C037 does not reduce it |
| §3, D009, §30 (no UI fixed) | all | Compatible: no tabbar, screen count or destinations; "telas" and "experiência inicial" are outcome terms |

## 5. Deferred findings from the 2.2.0 reviews

**CH-02 · RA2-02: §7.1 opening sentence**
- Before: "…leem §2, §28, VFT-O011, VFT-O012, VFT-D002, VFT-D010 e VFT-C019; a alocação de decisão que eles descrevem não tem a autoridade de VFT-L023."
- After: "…leem §2, §28, VFT-O011, VFT-O012, VFT-D002, VFT-D010 e VFT-C019, além das cláusulas que cada frase cita, como VFT-L023, VFT-C023 e VFT-C024 em “Limites do Release Scope”. Cada frase carrega a autoridade da cláusula que aplica; a alocação de decisão que esses parágrafos descrevem não tem a autoridade de VFT-L023."
- Epistemic basis: INFERRED.
- Rationale: an application of L023 is no longer downgraded, and the allocation still does not borrow LOCKED authority.

**CH-03 · RA2-04 and DI3-02: §7.1 row "Estado final abaixo da cobertura"**
- Before: "…que PCG registra como revisão de VFT-C023. Aprovar um Release Scope não equivale a essa decisão."
- After: "…que PCG registra como revisão de VFT-C023; até essa revisão, a decisão vale pelo seu registro rastreável (“Limites do Release Scope”). Aprovar um Release Scope, sem decisão explícita sobre aquela modalidade, não equivale a essa decisão."
- Epistemic basis: INFERRED.
- Authority:
  - RA2-04: the categorical form would refuse an explicit Founder end-state statement made inside a Release Scope approval.
  - DI3-02: the same interim rule as for delegations, from PCG-J2-06.
  - The Founder records' own practice: "the decision governs current work as decided".

**CH-04 · RA2-01 and DI3-02: §7.1 "Limites do Release Scope"**
- Before: "…(VFT-L023); quem fixa esses critérios e quem verifica que uma modalidade os atinge é VFT-O014. … Uma delegação explícita do Founder vale como o Founder a decidir. Até a revisão seguinte deste contrato, que a registra, ela vale pelo registro rastreável da decisão do Founder, que quem a invoca deve citar. Esta revisão não registra delegação."
- After: "…(VFT-L023). A determinação dessa cobertura pertence ao Release Scope (VFT-C024); dentro dela, quem fixa os critérios e quem verifica que uma modalidade os atinge é VFT-O014. … Essa decisão e uma delegação explícita do Founder valem como o Founder as decidir. Até a revisão seguinte deste contrato, que as registra, valem pelo registro rastreável da decisão do Founder, que quem as invoca deve citar. Esta revisão não registra delegação nem decisão desse tipo."
- Epistemic basis: INFERRED.
- Authority: C024 (the sports record's Release Scope paragraph, "Release planning must determine the minimum credible launch depth"); RA2-01; DI3-02.
- Rejected: a general §2 rule that every Founder decision is valid through its record. It would be broader than DI3-02 and could interact with the gates required to change LOCKED invariants (§2, §25).

**CH-17 · RA2-01: §32, O014 question**
- Before: "Quem fixa os critérios de cobertura mínima crível de cada modalidade e quem verifica…"
- After: "Dentro da determinação de cobertura mínima crível que VFT-C024 atribui ao Release Scope, quem fixa os critérios de cada modalidade e quem verifica…"
- The decider and trigger columns are unchanged. This is the only pre-existing defining line changed in 2.3.0.

**RA2-03 (delta only, no Canon change)**
- This corrects the basis recorded in the 2.2.0 delta, R1-03 ("D011 activity informs load").
- The rule rests on:
  - L003 and L004 (LOCKED);
  - C012;
  - the §7 sentence "Compreender a pessoa integralmente … Dados disponíveis e seus limites devem informar a confiança da decisão";
  - the §7.1 context row ("Vale para qualquer modalidade"; "sem … omissão silenciosa").
- R-DR-43 condition (4) only calls ignoring an activity "desfavorecido". It is corroboration, not the basis.
- The 2.2.0 delta is left unedited, as the historical record of the published version; this entry supersedes its "Auth" line for R1-03.

**CH-05 · DI3-01 and DI3-03: the §13 paragraph after C025** (the C025 clause line itself is unchanged)
- **DI3-01, added:**
  - Text: "Esses direitos dizem respeito ao papel, Full Member ou Crew Member, e à participação em mais de uma Crew até o limite. Condições neutras quanto ao papel, dentro de VFT-L011, VFT-L012 e VFT-L014, como limites contra abuso ou suspensões por segurança, são mecânicas para os owners competentes, com Security, e não restrições desses direitos; uma condição que, na prática, impeça um dos papéis de criar Crew, ou impeça participar de mais de uma Crew até o limite, conta como restrição. O objeto de convite projetável é possibilidade do produto dentro do limite de descoberta, não direito concedido a pessoas: oferecê-lo, e quando, segue VFT-D010 e o Release Scope; se oferecido, nunca inscreve ninguém por si, e o aceite por ele exige a confirmação de quem convidou."
  - Epistemic basis: INFERRED.
  - Authority:
    - FG-2 rows 1 and 3, which decide the rights by role and the cap.
    - C025: "a descoberta se limita ao … e a um objeto de convite que pode ser projetado", a limit.
    - D010 and the C016 examples, where "invitation/share objects" are possibilities, "não backlog obrigatório".
    - The §2 rule on possibilities granted to people.
    - Security informs (DI3-01).
  - Rationale: the reviewer's scenario ("one new Crew per person per week") is now a mechanic. A role-based or practically nullifying condition is still a restriction that needs the Founder.
  - Rejected:
    - Treating invite projection as a right of people: it is not in the record's wording, and D010 keeps the objects optional.
    - Listing allowed rate limits: that is design work.
- **DI3-03, changed:**
  - Before: "…ancorados nos valores de referência decididos. … PCG classifica cada alteração: …"
  - After: "…ancorados nos valores de referência decididos junto com VFT-C025. … PCG classifica cada alteração pelo efeito acumulado em relação a esses valores de origem: …"
  - Epistemic basis: INFERRED; PCG classifies (§2).
  - Rationale: the anchor is fixed to the values decided with C025 (the PDR FG-2 entry), and cumulative drift (8, then 10, then 12) is tested against that origin.

## 6. LOCKED invariants and Founder clauses

- L001–L023: all 23 defining lines are byte-identical to 2.2.0. No LOCKED ID was added.
- The Founder clause lines C016–C025, D010 and D011 are byte-identical (12/12). C026 and C027 are also unchanged.
- The deferred-finding fixes edit only readings, §7.1 rows and paragraphs, the §13 paragraph after C025, and the O014 question.

## 7. New IDs

- **C028 to C037** (CURRENT PRODUCT DECISION): C028 in §30.2 for the decision and goal; C029 to C036 in §30.2 for principles 1–8; C037 in §30.1 for principle 9.
- **H008** (HYPOTHESIS), in §30.2.
- **O015** (OPEN QUESTION), in §32.
- Each series is contiguous after C027, H007 and O014. No renumbering.

## 8. Impact on dependents and gates

Hashes at drafting time; content not read:
- PDR `product/PRODUCT_DECISION_REGISTER.md`: `dec6fab3…25498`
- PDM `product/PRODUCT_DOMAIN_MODEL.md`: `6a5ace35…223a3`
- PTM `product/PRODUCT_TRUTH_MAP.md`: `24404ad0…6ef7`

**Phase 4 architecture (the parallel worker).** It currently cites the Founder record; after publication it switches to C028–C037 and O015. Where its translation reads a principle differently from these readings, the difference goes back through the Architect and the Chief. Items to reconcile:
- the agent's placement and scope rules: C032, and the O015 trigger;
- one shared data and plan source for both paths: C033;
- contextual entry and stable references: C029, C035, with no destinations fixed;
- frequent-task classes with direct controls: C030;
- per-modality language and controls: C031, with phasing;
- social paths outside the agent: C036, with the "reencontrar" limit.

**Other dependents:**
- **Phase 5 experience model:** O015 (confirmation, undo, autonomy) and C034 (what is never hidden).
- **UI/Brand (Phase 13) and reference analysis (Phase 11):** C037; the reference is handled under the mission rules, not the Canon.
- **PTM:** add C028–C037, H008 and O015; update O014.
- **PDM:**
  - membership mechanics against DI3-01 (role-neutral conditions; invite projection optional);
  - the end-state record rule (DI3-02);
  - agent and data consistency (C032, C033).
- **PDR:**
  - record O015's routing (Product/UX with the AI Systems & Agent Experience Architect; Security);
  - the FG-2 values are the fixed origin anchor for C025 (DI3-03);
  - DR entries citing O014 pick up the C024 framing.
- **Security:** agent data use (C032, L014), sensitive agent actions (O015), and role-neutral anti-abuse conditions (DI3-01).
- **Gates:**
  - DOCTRINE_EVIDENCE_REVIEWED and DOCTRINE_INTERPRETABLE, fresh, on draft sha256 `13f3116d494b7885d2877118210312bf6af10cf942c8ce06cac288ac974fd65f`; then PRODUCT_CONSTITUTION_READY.
  - After publication, downstream gates bound to the 2.2.0 hash re-check only the edited scope: §7.1, §13, §30.1, §30.2, §31, §32 and §33.

## 9. Open items

- **OI-1** (owner: Chief): line 5 carries "DRAFT, não canônico". Publication changes the marker and the hash, so record a diff showing only the marker changed, as was done for 2.2.0.
- **VFT-O015** (owners: Product/UX with the AI Systems & Agent Experience Architect, and Security): not Founder-owned unless the §2 trigger applies.
- **Residuals carried over:** O013 and O014 (Founder) are unchanged in substance. The 2.2.0 reviewer's design-level residual remains: the line between allowed context display and limited representation is drawn by examples, and contested cases go to O013 or §28.
- **Founder decisions needed:** none. No THESIS_CONFLICT found.

## 10. Not changed, and why

- L001–L023, C016–C025, D010 and D011: hard constraint. C026 and C027: no finding touched them.
- §6 Fundamental Units: no "agent" unit was added. The agent is an experience path, not a conceptual unit of the thesis, and adding it would expand the thesis.
- §24 (C009, moat): not extended with the agent; no Founder text supports that.
- §29 (C002, D009), and §30 paragraphs 1–3: unchanged; the new principles sit beside them.
- §2: no new modal or general record rule (CH-04 rejected alternative).
- The Release Scope definition, O013, and the C025 clause line: unchanged.
- Out of Canon scope: implementation (forbidden by the Founder record, line 32), tabbar or destination design, the reference analysis, and the Chief's grounding notes as doctrine.

## 11. Deterministic checks

Script: `ptc_checks_230.mjs`, run with Node 24 from the session scratchpad, outside the repository. It verifies:
- the canon is unchanged (2.2.0 `5c780fdc…`) and the snapshot is identical to it;
- L001–L023 are identical; the Founder lines C016–C025, D010 and D011 are identical;
- of the pre-existing defining lines, only O014 changed;
- IDs are unique; all 2.2.0 IDs are kept; the new IDs are exactly C028–C037, H008 and O015, contiguous; every full and short-form reference is defined; class labels are correct; no new LOCKED ID;
- placement: C028–C036 and H008 in §30.2, C037 in §30.1, O015 in §32;
- tables are intact; the DRAFT status marker is present; no genealogy text in the body; the reference is not named in the Canon; no Crew numbers;
- §30.2 fixes no tabbar, screen count or destination, and states compatibility with L022, L007, L014, C012 and C015; the food-logging example is scoped by D004;
- this record covers RA2-01..04, DI3-01..03, Princípio 1–9, the THESIS_CONFLICT check and the Pierre decision, plus every new ID, and states both hashes.

The results are in the hand-off to the Chief: snapshot sha256 `5c780fdc336166066edbc9ed62dfa0e947efdb5177898faf6c934346f6e35601`; draft sha256 `13f3116d494b7885d2877118210312bf6af10cf942c8ce06cac288ac974fd65f`.

## 12. PCG self-check (rubric `evals/PRODUCT_GOVERNANCE.md`, "PCG — entrega/self-check")

This is a self-check only; it is not approval.
- **Sources, current, target and delta: PASS.** The Founder record was read in full and the gap was recorded as such.
- **Distinguishable classes, with IDs, sources and authority: PASS.** Ten CURRENT PRODUCT DECISIONs (DECIDED), readings (INFERRED), H008 (ASSUMED) and O015 (OPEN QUESTION).
- **No duplicated truth or renamed conventions: PASS.** Principles 3 and 8 add only their new element; no section was renumbered; the reference is kept in its record.
- **Binding decisions traceable; no hypothesis made into an obligation: PASS.** Each clause maps to a Founder line (§4.2); the effect stays H008.
- **Conflicts and drift: PASS.** Checked clause by clause (§4.6); none found.
- **Recoverable history and dependent impact: PASS.** Snapshot, §8, and before/after text per change.
- **No UI prescribed: PASS.** No tabbar, screens or destinations; the examples are classes; the confirmation and autonomy design is routed to O015 rather than invented.
