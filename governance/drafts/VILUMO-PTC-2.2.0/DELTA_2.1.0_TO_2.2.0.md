# DELTA — VILUMO-PTC-2.1.0 → VILUMO-PTC-2.2.0 (DRAFT)

Governance record (PCG). This is not Product Truth and does not approve the draft. Approval is by the gates in §0. Contract excerpts are quoted in Portuguese, as in the source.

## 0. Identity

| Field | Value |
| --- | --- |
| previous_revision | VILUMO-PTC-2.1.0, `canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md`, sha256 `4d4ccb65b341efc45b88bbf5aa173bb34c2f39452e5f6b85dd3beb6b8ee6dbd1`. Canonical, event `VF-PTC-2.1.0-CANONICAL-20261010-001` |
| snapshot (recoverable) | `governance/drafts/VILUMO-PTC-2.2.0/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.2.1.0.snapshot.md`, byte-identical, same sha256 |
| new_revision | VILUMO-PTC-2.2.0, `governance/drafts/VILUMO-PTC-2.2.0/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md`. **Current (after correction round 1): sha256 `724834fbe39cd1467a5e61fd54d9aae3e025e4afffbcb0945a9db49027ae810e`.** The round-0 draft reviewed in r1 was `7059b5f833e1c674cd8ed45e81462bc034c48d6a1391081032f4a85829c8f3e4`; §1–§13 describe round 0, and §14 records the round-1 delta on top of it |
| state | PRODUCT_CONSTITUTION_DRAFT / GOVERNANCE_READY_FOR_REVIEW. Not canonical |
| date | 2026-10-10 |
| author | PCG worker: a subagent instance dispatched by the Claude Chief session `07efc0a5-e1c7-44ef-828e-cbc759fc6a51`. It is not a judge or consolidator of this revision |
| triggers | (1) The deferred non-blocking findings DI-01 to DI-07 (`audits/claude-canon-update-2026-10-10/reviews/doctrine-interpretability.json`; `reviews/canon-gate.json`, `non_blocking_findings_deferred`). (2) The Founder decision on FG-2 / VFT-O006, added by the Chief during this task |
| deciders / approval_ref | DI-01 to DI-07: PCG editorial authority under §2 and §28. No new strategic decision; the interim PCG rulings are the basis. C025: Founder, FG-2 answer "Pacote A (Recomendado)", 2026-10-10, about 11:20 America/Sao_Paulo (`audits/phase-1-3-reviews/founder-gate-phase3-decisions.md`) |
| evidence_policy | `doctrine_audit` (formalization and fidelity only). No hypothesis is validated |
| gates required | DOCTRINE_EVIDENCE_REVIEWED and DOCTRINE_INTERPRETABLE, each by a fresh independent instance on the draft sha256 above, then PRODUCT_CONSTITUTION_READY (Chief). Per `canon-gate.json` `revalidation_rule`, both 2.1.0 reviews are invalid for the edited scope |

## 1. Ground and restate

**Task as understood.**
- Resolve DI-01 to DI-07 by editorial clarification of the reach of existing clauses.
- Formalize the Founder's FG-2 decision, which resolves VFT-O006, at the lowest correct authority.
- Keep L001–L023 unchanged. Keep the substance of the Founder clauses C016–C023, D010 and D011.
- Work only in the draft folder. No publication.

**Sources read, and their role:**
- `canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md` 2.1.0, in full. Hash verified before any work.
- The two Founder authority records for the 2.1.0 delta: `shareability-founder-decision.md` and `sports-founder-decision.md`.
- The Founder authority record for O006: `audits/phase-1-3-reviews/founder-gate-phase3-decisions.md`.
- `reviews/doctrine-interpretability.json` (findings DI-01 to DI-07, downstream questions Q1–Q3), `reviews/canon-gate.json` and `reviews/doctrine-fidelity.json`.
- `product/PRODUCT_DECISION_REGISTER.md` §6 only: R-DR-43, R-DR-45, R-DR-10, R-DR-11, R-O005, R-D011, R-A8.
- `audits/phase-1-3-reviews/PCG-J_canon-ingestion-domain-decisions.md`, PCG-J2-06 only.
- `audits/phase-1-3-reviews/SEC-J_domain-model-boundaries.md`, SEC-J-10 and the threat row it cites.
- `canon/CANONICAL_INDEX.md`, and `audits/claude-canon-update-2026-10-10/CURRENT_TARGET_DELTA.md` for the local delta convention.

**Not read (clean room and scope):**
- The external provenance paths listed in the index.
- PTM and PDM, and the PDR outside §6. Their sha256 values were computed for the impact record but their content was not read.
- `UX-J_domain-model-structure.md`.
- No legacy product context.

## 2. CURRENT (2.1.0)

**Gates.** PRODUCT_CONSTITUTION_READY is PASS and the contract is published. Seven non-blocking findings were deferred to PCG for the next Canon revision, at the latest before Phase 4 translation of sport domains and shareables and before Phase 7 Release Scope.

**What each finding says:**
- **DI-01:** engine-context use of a sport versus declared support is not explicit. Six wordings describe the forbidden interim state: "tracking superficial", "compatibilidade incidental", "placeholder", "tracking genérico sem credibilidade", "tracking incidental" and "suporte genérico sem credibilidade". "Profundidade superficial" and "promessa de suporte completo…" also appear. The L023 trigger has two wordings ("declare" in L023 and §31; "apresentada" in §7). The §31 C023 row has no phase qualifier.
- **DI-02:** "Release Scope" is undefined and has no decider. O011 reads "Founder/Produto", with no split between proposer and decider. D010 and §30.1 point to an unnamed "escopo aceito".
- **DI-03:** "campanhas" and "campaign outcomes" sit inside a "deve" sentence but are not C005 concepts. "Health context" is undefined.
- **DI-04:** modal strength is unclear: the English "should" against the Portuguese "pode" in C018, the permissive verb in C019, and "quando apropriado" without a standard.
- **DI-05:** C021 says "sem permitir reidentificação" while §31 says "reidentificação indevida". A consented display of a member is ambiguous.
- **DI-06:** the §30.1 list may be read as a checklist, and its story/post ratios presuppose formats that D010 leaves open.
- **DI-07:** material 2.1.0 obligations sit in unlabeled prose, and the intended effects of C016 have no hypothesis ID.

**Interim state.** PCG rulings R-DR-43, R-DR-45, R-D011 and R-DR-11 act as interim readings (PDR §6). They become invalid in the scope this revision edits.

**VFT-O006** was an OPEN QUESTION. §13 said: "Tamanho, critérios de relação real, membership e descoberta permanecem abertos."

## 3. TARGET

- Each DI finding is resolved by a reading, a label, or a scoped wording change.
- LOCKED invariants and Founder clause texts are byte-identical.
- Every 2.1.0 prose obligation in scope is classified; new IDs are added only where a Founder record supports them.
- O006 is resolved by a CURRENT PRODUCT DECISION carrying the Founder's principle. Its numbers stay as Founder-owned reference parameters (§6 of this record).
- Downstream impacts and gate invalidations are explicit. No publication.

## 4. DELTA — per change

Abbreviations: Epi = epistemic basis; Norm = normative class; Auth = authority and source. "Reading" means text that clarifies an identified clause and carries that clause's authority (the new §2 sentence).

### CH-01 · §1 Document Status · (versioning)
- Before: "**Versão:** VILUMO-PTC-2.1.0 · **Data:** 09/10/2026 · **Owner:** …"
- After: "**Versão:** VILUMO-PTC-2.2.0 · **Estado:** DRAFT, não canônico · **Data:** 10/10/2026 · **Owner:** …"
- The status rule ("O status vigente de aprovação é controlado pelos gates…") is unchanged.
- Epi: OBSERVED. Norm: n/a. Auth: Chief instruction.
- Rationale: mark the draft as non-canonical, as instructed. No "previous version" line was added, because both Founder records forbid genealogy narrative in the contract body. History lives in this record.
- Rejected: stating the previous revision inside the contract.
- Impact: at publication the Chief changes only this marker (see open item OI-2).

### CH-02 · §2 Authority · DI-04, DI-07
- Before: "“Deve” e “não pode” expressam obrigações aprovadas; exemplos e hipóteses não criam obrigações."
- Added after it: "“Pode” delimita permissão ou design space e não cria obrigação. Uma direção formulada como “should” orienta o trabalho atual e admite exceção justificada, registrada pelo owner competente; não torna obrigatória cada ocorrência. Uma leitura ou nota de alcance registrada junto a uma cláusula esclarece-a com a autoridade dessa cláusula e não cria obrigação nova."
- Epi: INFERRED. Norm: authority-section clarification; no clause class changes.
- Auth: §2 (modal rule), the PCG modal vocabulary (SHOULD admits a justified exception; MAY delimits freedom), and the Founder's own "should … pode" in Shareability principle 2.
- Rationale: §2 defined only "deve" and "não pode". "Should" occurs once (the C018 title) and "pode" is used for permissions. The readings added in this revision need a stated authority, so that they do not recreate DI-07.
- Rejected: (a) treating "should" as MUST, which would extend C018; (b) treating it as MAY, which would empty the Founder's "should"; (c) a global rule that all unlabeled prose creates no obligation, which is out of scope and could weaken 2.0.0 prose.
- Impact: PTM legend; reviewers check that no other "should" exists (verified: only C018).

### CH-03 · §7 L023 explanatory sentence · DI-01
- Before: "…de qualquer modalidade apresentada como plenamente suportada."
- After: "…de qualquer modalidade declarada plenamente suportada (§7.1)."
- Epi: INFERRED. Norm: explanatory text (L023 itself unchanged).
- Auth: sports record: "Any sport represented by Vilumo as fully supported…".
- Rationale: this unifies the trigger on the verb that L023 itself uses ("declare"). §7.1 defines "declarar" with the Founder's broad sense of "represented".
- Rejected: editing the L023 text (forbidden), or keeping two verbs.

### CH-04 · §7 phasing paragraph → VFT-C024 · DI-07, DI-01, DI-02
- Before (unlabeled prose): "O conjunto mínimo define o produto, sem exigir profundidade de implementação idêntica ou lançamento simultâneo das quatro modalidades. Release Scope deve determinar sequencing, launch depth, dependency order, minimum credible coverage e progressive depth por modalidade, respeitando VFT-L023. Faseamento não autoriza placeholder, tracking genérico sem credibilidade ou promessa de suporte completo antes da profundidade necessária. Ampliar coordenação multiesporte não compensa uma promessa individual superficial."
- After: "**VFT-C024 · CURRENT PRODUCT DECISION — Faseamento das modalidades** — O conjunto mínimo define o produto, sem exigir profundidade de implementação idêntica ou lançamento simultâneo das quatro modalidades. O Release Scope (§7.1) deve determinar sequencing, launch depth, dependency order, minimum credible coverage e progressive depth por modalidade, respeitando VFT-L023. Faseamento não autoriza suporte superficial: placeholder, tracking genérico sem credibilidade ou promessa de suporte completo antes da profundidade necessária."
- Epi: DECIDED. Norm: CURRENT PRODUCT DECISION.
- Auth: Founder, sports record, "Release Scope" paragraph ("…does not by itself require identical implementation depth or simultaneous launch sequencing. Release planning must determine the minimum credible launch depth for each sport without violating the Sport Depth invariant… No placeholder or generic tracking without credibility."). The record labels the sport set a CURRENT PRODUCT DECISION, and this rule sits under it.
- Rationale: the substance is unchanged. Only the ID, the class, the "(§7.1)" pointer and the label "suporte superficial:" are added; the label groups the three examples under the unified term.
- Rejected: (a) LOCKED, which is forbidden and above the Founder's label; (b) folding the paragraph into C023, which would change the text of a Founder clause.
- Impact: PTM must list C024; PDM §3.1, §7 and PDR DR-45/DR-46 must cite C024 instead of R-DR-45 for the phasing rule.

### CH-05 · §7 sentence split · DI-07
- After: "Ampliar coordenação multiesporte não compensa uma promessa individual superficial (VFT-L023)."
- Epi: INFERRED. Norm: application of L023 (it restates L023's second sentence).
- Rationale: keep it outside C024, so that an L023 application is not lowered to CURRENT PRODUCT DECISION authority.

### CH-06 · new §7.1 "Contexto do motor, suporte declarado e Release Scope" · DI-01, DI-02
New subsection with an opening statement ("leitura de VFT-L023, VFT-C023, VFT-C024 e VFT-D011 … não cria obrigação nova"), a five-row term table, and two paragraphs.

- **Uso como contexto do motor.**
  - Content: activity in any modality informs the engine (load, recovery, interference, availability) with explicit confidence. This is not declaring support, and saying a session counted for load and recovery is not declaring support. Data that cannot be read credibly gets explicitly reduced confidence, with no fabricated precision and no silent omission.
  - Epi: INFERRED. Auth: L003, L004, C012; R-DR-43 conditions (1), (2) and (4).
- **Declarar suporte.**
  - Content: representing or presenting a modality as supported by any means. The illustrative examples are listing, placeholder or support announcement, and the sport's own plan, prescription or analytics. In L023, "declare como plenamente suportada" has this reach and needs no formal declaration.
  - Epi: INFERRED. Auth: sports record ("represented by Vilumo as fully supported"); R-DR-43 condition (1).
- **Suporte superficial.**
  - Content: one term for declaring support without the credible depth that the declaration requires. It covers C023's "tracking superficial" and C024's three examples. L023 forbids it for fully declared sports; C024 forbids it during the phasing of the C023 sports.
  - Epi: INFERRED. Auth: L023's own term "suporte superficial", §26, C023, C024.
- **Nível de contexto transitório.**
  - Content: a C023 sport below minimum credible coverage, used as engine context, not declared, and sequenced by Release Scope toward that coverage. It does not violate C023. Keeping it there as an end state equals "compatibilidade incidental" and needs a new explicit Founder decision.
  - Epi: INFERRED. Auth: C023 ("…não podem ser … tratadas como compatibilidade incidental sem nova decisão explícita do Founder"); R-DR-43 condition (3).
- **Release Scope.**
  - Content: the per-release decision answering O011: what enters, at what depth and in what order. It covers sport phasing (C024), social concepts launched or deferred (D002, O012) and Shareability selection (C019, D010). It is the "escopo aceito" of D010, §30 and §30.1.
  - Epi: INFERRED. Auth: O011, D002, D010, R-DR-11.
- **Decisão do Release Scope.**
  - Content: Product/UX proposes. Research & Evidence and domain authorities inform the credible-coverage criteria; Engineering informs the order of technical dependency; the Chief coordinates. The Founder decides strategic launch priorities: sequencing, launch depth above minimum credible coverage, and which modalities are declared fully supported in each release. Nobody declares full support below minimum credible coverage (L023). Removing or permanently reducing a C023 sport is not a Release Scope decision: it needs a new Founder decision and a C023 revision. An explicit Founder delegation "vale como o Founder a decidir, e PCG a registra na revisão seguinte". "Esta revisão não registra delegação."
  - Epi: INFERRED. Auth: §2 (the Founder decides strategy); O011; R-DR-45; PCG-J2-06 (delegation wording); Chief instruction.
- **Modalidades de VFT-D011.**
  - Content: using them as engine context is a Product/UX choice within D009 and D011, bounded by L022 and C012. Declaring one fully supported is a Release Scope decision with the same split. Adding one to the minimum set amends C023 and needs a Founder decision.
  - Epi: INFERRED. Auth: R-D011, levels 1–3.

**Norm and rationale.** The subsection is a reading of L023, C023, C024 and D011 and carries their authority. The authority allocation is mirrored in the O011 row (CH-24). This answers Q1 and Q3 of the interpretability review and replaces six wordings with one vocabulary, anchored on L023's own term. The decider follows the Canon's existing pattern ("X propõe; Founder decide", as in O001, O005 and O012).

**Rejected:**
- Editing L023 or C023 text.
- Creating a "partially supported" tier. That would be new strategy (see OI-3).
- Naming PDR item IDs (DR-20 and others) in the Canon, which would make upstream depend on downstream.
- Inventing a delegation.

**Impact:** R-DR-43, R-DR-45 and R-D011 are superseded in this scope at publication, and PDR §6 should point to §7.1. PDM §3.1, §4 ("Declaração de suporte", "Leitura de contexto"), A6, S10 and X4 must check that their terms match §7.1. PTM §4 (D002, D010, D011) must check its pointers.

### CH-07 · §13 → VFT-C025 and the exclusions sentence · O006
- Before: "Tamanho, critérios de relação real, membership e descoberta permanecem abertos. “Fechado” define o resultado e a fronteira de valor, sem escolher tecnologia ou interface."
- After, three paragraphs:
  1. **VFT-C025 · CURRENT PRODUCT DECISION — Fronteira da Crew.**
     - Crew size is in the order of an intimate circle.
     - A person may join more than one Crew, up to a low cap.
     - Anyone, Full Member or Crew Member, may create a Crew.
     - The real-relationship criterion is a nominal invite from a participant. An acceptance through a forwarded or projected invite also needs the inviter's confirmation.
     - Discovery is limited to the nominal invite and to an invite object that can be projected outside the product but never enrolls anyone on its own.
     - The numeric values are Founder-decided reference parameters, recorded in the Product Decision Register and revisable by Founder decision with evidence (H006). Adjusting them within the decided order of size and low cap does not require revising the contract; leaving that order alters C025.
  2. "Listagem ou busca pública de Crews e ingestão da agenda de contatos estão excluídas (VFT-L012, VFT-L014)."
  3. "VFT-C025 decide tamanho, critério de relação real, entrada e descoberta. Mecânicas de membership que essa cláusula não decide permanecem abertas para os owners competentes, dentro de VFT-L011, VFT-L012 e VFT-L014." The original last sentence on "Fechado" is kept verbatim.
- Epi: DECIDED for C025. INFERRED for the exclusions, which apply L012 and L014; the record presented them as "excluded in any option" with exactly those bases, and the Founder chose within them.
- Norm: CURRENT PRODUCT DECISION for C025. The exclusions sentence carries LOCKED authority from L012 and L014, with no new class.
- Auth: Founder, FG-2 "Pacote A (Recomendado)", and the record's "Package A as presented" table, rows 1–5 and the exclusions line. R-O005 had already placed "o direito de criar Crew (FG-2)" with the Founder.
- Rationale:
  - O006's decider was "Founder resolve fronteira estratégica", so the lowest correct authority for the decided boundary is a CURRENT PRODUCT DECISION. It is not LOCKED: the Founder framed the values as evidence-revisable.
  - The exclusions are not given CURRENT PRODUCT DECISION authority, which would lower them below the invariants they apply.
  - L011, L012 and the first two §13 paragraphs are unchanged. Only the "permanecem abertos" sentence is replaced, by what is now decided plus what stays open.
- Rejected:
  - Only marking the O006 row resolved, which would leave the boundary without a normative clause.
  - Putting the numbers in the Canon (see §6).
  - LOCKED.
- Impact: see §9 (PDR FG-2, PDM membership and invite sections, Security).

### CH-08 · §21.1 paragraph after C016 → "Alcance de VFT-C016" · DI-07, DI-03
- Before: the unlabeled paragraph "Vilumo deve transformar … quando apropriado. A intenção é reforçar … Esses efeitos são objetivos estratégicos sujeitos a evidência, não resultados demonstrados. Compartilhar permanece voluntário…"
- After: the same sentences under the bold label "**Alcance de VFT-C016.**", plus four additions:
  - "A obrigação recai sobre a capability; quais objetos existem e quando são lançados permanece em VFT-D010."
  - "(VFT-H007)" after the effects sentence.
  - "(VFT-L009, VFT-L014, VFT-L017)" after the voluntariness sentence.
- Epi: DECIDED for the "deve transformar" sentence, which is the Founder's verbatim "O produto deve transformar…". INFERRED for the capability-level reach and the annotations.
- Norm: scope of C016 (CURRENT PRODUCT DECISION). Voluntariness is an application of L009, L014 and L017, at LOCKED authority.
- Auth: Shareability record line 7, and lines 9 and 11 ("exemplos, não backlog obrigatório"); line 25 ("Não congele ontologia/lista final"); D010.
- Rationale: classifies the "deve" sentence and stops it being read as a per-item launch obligation, which would contradict D010.
- Rejected: a new C ID for voluntariness, which would lower it from LOCKED to CURRENT PRODUCT DECISION authority.

### CH-09 · new VFT-H007 · DI-07
- Added: "**VFT-H007 · HYPOTHESIS** — Shareability & Social Projection, dentro dos limites de VFT-C021 e VFT-C022, reforçará continuidade, pertencimento, distribuição orgânica, aquisição e efeitos de rede."
- Epi: ASSUMED (an empirical premise). The strategic objective itself stays DECIDED within C016. Norm: HYPOTHESIS.
- Auth: Shareability record line 7 ("reforçando continuidade, pertencimento, distribuição orgânica, aquisição e efeitos de rede"). The 2.1.0 contract already classed these as "objetivos estratégicos sujeitos a evidência".
- Rationale: this follows the existing pattern in which C003 (an objective) is paired with H002 and H003 (effects).
- Rejected: merging into H002 or H003, which are about social entry and retention, not projection.
- Impact: §31 H row (CH-21); PTM hypothesis list.

### CH-10 · new "Leitura de VFT-C016" · DI-03, DI-04
- **Campanhas.** "Campanhas" and "campaign outcomes" are illustrative. They mean the course and result of a time-bounded effort, individual or collective, structured by the person's objectives, by accepted C005 concepts (Season, Mission, Pact) or by collective goals. They create no social concept or mechanic beyond C005; names and mechanics follow D001, D002 and O012.
- **Quando apropriado.** The phrase opens no free criterion. An object or share is appropriate when three conditions hold:
  - it is compatible with the engine and does not make correct adaptation, recovery, rest or return less legitimate (L006, L008, C007);
  - it is voluntary and consented for purpose and destination (L014, C021);
  - it does not turn the product into audience, posting or volume competition (L019, L020, C022).
  - Concrete per-object criteria belong to the Shareable Object Model (C026), within D010.
- Epi: INFERRED. Norm: a reading of C016.
- Auth: Shareability record lines 7 and 11 (both terms are Founder examples, "não backlog obrigatório"); the cited clauses.
- Rationale: the term is mapped to accepted concepts and marked illustrative, as instructed. The standard is a cross-reference to existing clauses only.
- Rejected:
  - Deleting "campanhas", which is the Founder's word.
  - Adding "Campaign" to the C005 list, which would be a new social concept.
  - A new standard for "apropriado".

### CH-11 · new "Leitura de VFT-C018 e VFT-C019" · DI-04
- **C018** is a direction in the "should" sense of §2: it guides that relevant progress, including adaptation and return when appropriate in the C007 sense, be representable with high quality.
  - Excluding a type of relevant progress by design needs a recorded justification.
  - "Pode ganhar" means eligibility: no specific progress must be represented, and selection follows D010.
  - "Sem premiar maior volume ou exposição" is a prohibition (L008, L019, L020).
- **C019** fixes a direction, not an inventory.
  - Offering distinct expressions needs no new decision; renouncing the direction as product policy requires revising C019.
  - "Pode oferecer" means no specific expression, quantity or launch is mandatory (D010).
  - The expressions offered must preserve coherence and quality.
- Epi: INFERRED. Norm: a reading of C018 and C019.
- Auth:
  - Shareability record principle 2: "Progress should be representable, beautiful and shareable. Progresso relevante pode ganhar…".
  - Principle 3: "O sistema pode suportar … Não transformar isso em obrigação de lançar tudo no primeiro release."
  - Corroborating: sports record line 15, "Shareability may express different modalities, no forced generic template".
  - C016 and C017 already hold the capability-level MUST ("deve possuir uma camada forte"; "deve ser considerado na arquitetura").
- Rationale: the reading preserves the Founder's mixed modal: a strong direction, per-item eligibility, and firm prohibitions grounded in invariants. The C018 and C019 text is unchanged.
- Rejected: rewriting C018 as "deve", or demoting C019 to DESIGN SPACE.

### CH-12 · new "Leitura de VFT-C021" · DI-05, DI-03
- **Re-identification.** "Reidentificação" and "exposição por inferência", in C021 and §31, refer to a member without consent appropriate to purpose and destination. They mean making that member identifiable, directly or indirectly, or letting the object reveal by deduction a private datum of that member or their non-participation.
  - Showing an identifiable member with that member's own consent, appropriate to purpose and destination, is not re-identification.
  - "O consentimento de um ou mais membros nunca autoriza revelar dados de outro membro nem a não participação dele."
- **Health context** means personal health information, for example health state, conditions or physiological signals, including wearable signals (C015).
  - It belongs to the list of data that Crew membership does not authorize externalizing.
  - It is not a §6 unit, domain or capability, and its mention neither authorizes nor presupposes collecting health data (§16, §17).
- Consent and refusal mechanics belong to Product/UX, with Security assessing the concrete boundary (§17, O005).
- Epi: INFERRED. Norm: a reading of C021 (its text is unchanged).
- Auth:
  - Shareability record principle 5: "…sem consentimento apropriado. Shareables coletivos devem funcionar com dados agregados/consentidos…". This already admits consented data.
  - L014 ("exposição involuntária") and L017.
  - The Security position SEC-J-10, adopted verbatim in substance: "an identifiable member's own per-purpose consent to be shown is not 'reidentification'. No member's consent can authorize revealing another member's data or non-participation."
  - R-O005 (who owns the mechanics).
- Rationale: this aligns C021 and §31 on one defined term. It does not narrow protection: the unqualified reading would have barred the consented display that the Founder record explicitly allows ("consentidos"). Non-participation is covered by C021's "exposição por inferência" together with L017.
- Rejected:
  - Editing the C021 text, which is a Founder clause.
  - Keeping "indevida" in §31, which has no standard.
  - Importing SEC-J-10 mechanics (standing preference, silent refusal, revocation) into the Canon. Those are Product/UX and Security design.
  - Any Crew-size statement, which belongs to C025 and not to C021.

### CH-13 · §21.1 examples paragraph · DI-07
- Before: "Streaks e conquistas devem continuar compatíveis com recuperação adequada, interrupção e retorno."
- After: the same sentence followed by "(VFT-L006, VFT-L013, VFT-L019)".
- Epi: INFERRED. Norm: an application of LOCKED invariants. Rationale: classifies the 2.1.0 prose obligation without lowering it.

### CH-14 · §27 Non-goals · DI-02
- Before: "…Essas decisões pertencem aos contratos e owners competentes dentro dos limites atuais."
- After: "…Sequenciamento, profundidade de lançamento e modalidades declaradas em cada release pertencem ao Release Scope, decidido conforme §7.1 e VFT-O011; as demais decisões pertencem aos contratos e owners competentes dentro dos limites atuais."
- Epi: INFERRED. Norm: explanatory pointer. Rationale: names the owner that was unnamed, without changing what the contract does not choose.

### CH-15 · §30 sports sentence · DI-07
- Before: "Deve considerar Running, Cycling, Swimming e Strength Training como domínios de primeira classe em Athlete Model…"
- After: the same sentence with "(VFT-C023, VFT-C024)" inserted after "domínios de primeira classe".
- Epi: INFERRED. Norm: an application of C023 and C024 to the downstream artifacts that the Founder listed (sports record line 13).
- Rejected: a separate C ID, which would duplicate C023.

### CH-16 · §30 SOM paragraph → VFT-C026 · DI-07
- Before: unlabeled prose, "Na fase adequada, Product/UX deve considerar um **SHAREABLE OBJECT MODEL** …"
- After: the same text prefixed "**VFT-C026 · CURRENT PRODUCT DECISION — Shareable Object Model** —".
- Epi: DECIDED. Norm: CURRENT PRODUCT DECISION.
- Auth: Shareability record line 21: "Adicionar às Product/UX Implications a necessidade de considerar, quando chegar a fase adequada, um SHAREABLE OBJECT MODEL…".
- Rejected: DESIGN SPACE, because "necessidade de considerar" is an obligation, while its content stays open under D010.
- Impact: PDR DR-38 (Shareable Object Model) should cite C026.

### CH-17 · §30.1 → VFT-C027 and an illustrative list · DI-07, DI-06, DI-02
- Before: "Quando aplicável à fase e ao escopo aceitos, UI/Brand deve considerar um **SHAREABLE VISUAL SYSTEM** com potencial para famílias de templates, …, proporções story/post, safe areas, … Ele consome … preservar VFT-D010 …"
- After:
  1. "**VFT-C027 · CURRENT PRODUCT DECISION — Shareable Visual System** — Quando aplicável à fase e ao escopo aceitos (Release Scope, §7.1), UI/Brand deve considerar um **SHAREABLE VISUAL SYSTEM**. Ele consome … [unchanged]".
  2. "As possibilidades desse sistema são ilustrativas e não formam checklist nem inventário obrigatório: [same items, same order] …, proporções story/post quando esses formatos forem selecionados (VFT-D010), safe areas, …"
- Epi: DECIDED for the obligation to consider the system; INFERRED for the illustrative status and the story/post qualifier.
- Norm: CURRENT PRODUCT DECISION; the list is DESIGN SPACE under D010.
- Auth: Shareability record line 23 ("SHAREABLE VISUAL SYSTEM com potencial para…"), line 25 ("Não congele ontologia/lista final … Preserve Design Space"), principle 3; D010 ("formatos story/post … permanecem abertos").
- Rejected: deleting any Founder item, or reordering them.

### CH-18 · §31 new row for C025 · O006
- Added row: "Crew aceita entrada sem convite de um participante, ou por convite encaminhado ou projetado sem confirmação de quem convidou; é listada ou buscável publicamente; usa ingestão da agenda de contatos; ou tem tamanho ou limite de Crews por pessoa alterado sem decisão Founder. | L011/L012/L014/C025 | Corrigir a entrada, a descoberta ou o parâmetro; Security avalia a fronteira concreta."
- Epi: INFERRED (a violation mapping of C025). Rationale: every other current decision with a boundary has a violation row; this one keeps the confirmed projected-invite path legitimate.

### CH-19 · §31 L023 row · DI-01, DI-02
- Before: "Modalidade é declarada plenamente suportada com profundidade superficial. | L023 | Corrigir promessa ou capacidade pelo owner competente."
- After: "Modalidade declarada plenamente suportada (§7.1) tem suporte superficial. | L023 | Corrigir a promessa ou a capacidade; o que é declarado em cada release segue o Release Scope (§7.1, VFT-O011)."
- Epi: INFERRED. Rationale: uses the unified term and names the owner of the declaration.

### CH-20 · §31 C023 row, with a phase qualifier · DI-01
- Before: "Running, Cycling, Swimming ou Strength Training é removido do escopo intencional ou reduzido a tracking incidental, placeholder ou suporte genérico sem credibilidade. | C023/L023 | Corrigir a cobertura; alteração do conjunto mínimo exige nova decisão explícita Founder."
- After: "…é removido do escopo intencional, mantido no nível de contexto como estado final ou, em qualquer fase, recebe suporte superficial (§7.1). O nível de contexto transitório sequenciado pelo Release Scope não é violação. | C023/C024/L023 | Corrigir a cobertura ou a declaração; alterar o conjunto mínimo ou manter uma modalidade no nível de contexto como estado final exige nova decisão explícita Founder."
- Epi: INFERRED. Auth: C023, C024, R-DR-43 condition (3).
- Rationale: prevents a false violation finding during legitimate phasing, while keeping superficial support forbidden in every phase.

### CH-21 · §31 hypotheses row · DI-07
- Before: "Efeito social ou moat … | H001–H006/C008 |"
- After: "Efeito social, efeito de Shareability ou moat … | H001–H007/C008 |".

### CH-22 · §31 C021 row · DI-05
- Before: "…ou permite reidentificação indevida."
- After: "…ou permite reidentificação ou exposição por inferência (leitura de VFT-C021)."
- Rationale: the same wording as C021, defined once (CH-12).

### CH-23 · §32 O006 row · O006
- Before: decider "Product/UX propõe; Founder resolve fronteira estratégica"; trigger "Antes de definir membership, descoberta ou escala de Crew".
- After: decider "Resolvida pelo Founder em VFT-C025; valores numéricos de referência no Product Decision Register"; trigger "Revisar VFT-C025 ou seus parâmetros diante de evidência (VFT-H006)". The question text is unchanged.
- Epi: DECIDED. Rationale: the ID is kept stable and points to its resolution, with no deletion or renumbering.

### CH-24 · §32 O011 row · DI-02
- Before: decider "Founder/Produto, coordenados pelo Chief"; trigger "Antes de definir roadmap ou readiness de lançamento".
- After: decider "Product/UX propõe; Founder decide as prioridades estratégicas de lançamento; Chief coordena. Cada Release Scope responde a esta questão (§7.1)"; trigger "Antes de definir roadmap, Release Scope ou readiness de lançamento". The question text is unchanged.
- Epi: INFERRED. Auth: §2; R-DR-45; R-DR-11; the Chief's instruction for DI-02.
- Rationale: "Produto" becomes the proposer and the Founder keeps strategic decisions. Non-strategic launch criteria stay with their owners under §28. This is the split the finding said should be derived if derivable.
- **Reviewer attention:** this is an authority-allocation clarification. If the auditor finds that the split is not derivable from §2, it returns to the Founder.

### CH-25 · §32 closing paragraph · O006
- Added: "Uma questão resolvida mantém seu ID e aponta para a cláusula que a resolve." This is a convention for stable IDs.

### CH-26 · §33 Canonical Summary · DI-01, DI-02, O006
- Added: "Usar uma modalidade como contexto do motor não é declarar suporte; o sequenciamento pertence ao Release Scope, proposto por Product/UX e decidido pelo Founder em suas prioridades estratégicas." The prior clause "e o sequenciamento pertence a Release Scope" was folded into this sentence.
- Added: "A Crew é um círculo íntimo formado por convite nominal, sem listagem pública nem ingestão de contatos."
- Norm: summary only, with no new obligation.

## 5. Resolution matrix

| Finding | Changes | Resolution (one line) |
| --- | --- | --- |
| DI-01 | CH-03, CH-04, CH-06, CH-19, CH-20, CH-26 | §7.1 separates engine-context use from declaring support and defines one term ("suporte superficial") plus a transitional context level. The L023 trigger "declarar" means any representation. The §31 C023 row exempts sequenced phasing |
| DI-02 | CH-04, CH-06, CH-14, CH-17, CH-19, CH-24, CH-26 | Release Scope is defined as the per-release answer to O011. Product/UX proposes; the Founder decides strategic launch priorities; a Founder delegation takes effect as decided and PCG records it next revision; none is recorded. "Escopo aceito" maps to Release Scope |
| DI-03 | CH-08, CH-10, CH-12 | "Campanhas" and "campaign outcomes" are illustrative and mapped to objectives, C005 concepts or collective goals, with no new concept. "Health context" is defined as personal health information, protective only, not a unit, with no collection authorized |
| DI-04 | CH-02, CH-10, CH-11 | §2 defines "pode" (permission) and "should" (direction with a justified, recorded exception). C018 is a direction plus a prohibition with per-item eligibility; C019 is a direction, not an inventory. "Quando apropriado" is cross-referenced to L006, L008, L014, L019, L020, C007, C021 and C022 |
| DI-05 | CH-12, CH-22 | C021 and §31 share one defined term. A member's own consent to be shown is not re-identification; no consent authorizes revealing another member's data or non-participation (SEC-J-10) |
| DI-06 | CH-17 | The §30.1 list is explicitly illustrative, not a checklist; story/post ratios apply only if those formats are selected under D010 |
| DI-07 | CH-02, CH-04, CH-05, CH-08, CH-09, CH-13, CH-15, CH-16, CH-17, CH-21 | 2.1.0 prose obligations are classified. Phasing → C024; Shareable Object Model → C026; Shareable Visual System → C027 (all DECIDED, CURRENT PRODUCT DECISION). Intended effects → H007. The capability sentence is labeled as the scope of C016. Applications of invariants are annotated with their L IDs, not lowered |
| O006 | CH-07, CH-18, CH-23, CH-25, CH-26 | Founder Package A becomes C025, a CURRENT PRODUCT DECISION. The exclusions apply L012 and L014. The numbers are Founder-owned reference parameters in the PDR. The O006 row is marked resolved |

## 6. O006: where the numbers live (decision and justification)

**Choice.** The principle is in the Canon (C025): intimate-circle order of size, multiple Crews up to a low cap, open creation, the nominal-invite criterion with inviter confirmation, and discovery limits. The numeric values, up to 3 Crews per person and up to about 8 members, stay as Founder-decided reference parameters recorded in the PDR (FG-2 entry). The Canon does not repeat them.

**Justification:**
1. **Founder framing.** The record presents both numbers as revisable with evidence: "the exact number can be revised with evidence", and "can be adjusted with evidence, H006". They are calibration values under a hypothesis, not identity.
2. **Canon purpose.** §3 says the contract does not fix operational parameters (UI, architecture, measurement formulas). The identity-bearing content is the order of size and the entry and discovery model, and that content is now a CURRENT PRODUCT DECISION.
3. **One source of truth.** If the numbers sat in both the Canon and the PDR they would create a parallel truth (CLAUDE.md, "Do not create parallel sources of truth").
4. **Proportionality.** In the Canon, each evidence-based tweak (8 to 7, for example) would need a full PCG revision and three gates.
5. **No authority loss.**
   - C025 states that the values are Founder-decided and revisable only by Founder decision.
   - The §31 row makes an unauthorized change a violation.
   - Leaving the intimate-circle order or the low cap alters C025, so PCG must assess it.

**Rejected alternative.** Numbers in the Canon: clearer for a reader of one document, but heavier to change and duplicative of the PDR.

**Precondition (OI-1).** The PDR FG-2 entry must record "RESOLVED — Package A", with the values and this authority reference, before publication. Otherwise the pointer in C025 dangles.

## 7. LOCKED invariants unchanged

L001–L023: all 23 defining lines are byte-identical to 2.1.0 (deterministic check, §11). No invariant was added, removed or reclassified, and no new LOCKED ID exists. The §25 index is unchanged.

The readings in §7.1 that touch L023 define the reach of its verb "declare" using the Founder's source term "represented". They do not alter L023's text, threshold or scope ("plenamente suportada" is kept; no "partial support" tier is created).

**Reviewer attention:** confirm that this is a faithful reading and not a change of meaning.

## 8. Founder clauses preserved

C016, C017, C018, C019, C020, C021, C022, C023, D010 and D011 are byte-identical (deterministic check). Every clarification sits in labeled readings, scope notes or other sections. C024, C026 and C027 carry 2.1.0 prose that was already in the contract, with its substance unchanged. C025 carries the new Founder decision.

## 9. Impact on dependents, and gates to re-check

Hashes were computed at drafting time; the content of PTM, PDM and the PDR beyond §6 was not read.
- PDR `product/PRODUCT_DECISION_REGISTER.md`: 18be6924…a3cf93 (PDR-0.4)
- PDM `product/PRODUCT_DOMAIN_MODEL.md`: 20e9e630…cdedc (PDM-0.4)
- PTM `product/PRODUCT_TRUTH_MAP.md`: fe954fd9…0a5045

### PDR (owner: Product/UX)
- **§6 rulings.**
  - R-DR-43, R-DR-45 and R-D011 are superseded in scope by §7.1 at publication, as the §6 header provides.
  - The R-DR-45 delegation wording is now in the Canon in its PCG-J2-06 form.
  - R-DR-11 matches the O011 split. R-O005 is unaffected.
  - R-A8(b) now points to C025 instead of O006/FG-2.
  - The "DI relacionado" column closes at publication.
- **FG-2** must be recorded as resolved, with the Package A values (OI-1).
- **DR-38** (Shareable Object Model) should cite C026. DR-45 and DR-46 should cite C024 and §7.1. DR-07 and DR-43 should cite §7.1.
- **Out of scope.** FG-3, market and platform answers are PDR matters that Product/UX records; they are not Canon.

### PDM (owner: Product/UX)
- Localized reconcile only:
  - §3.1, §4 ("Declaração de suporte", "Leitura de contexto"), A6, S10 and X4: match the §7.1 vocabulary.
  - §3.2, §8.5 and I8/I9 (collective shareables, invites): match the C021 reading and C025 discovery (the invite object never enrolls; inviter confirmation).
  - Membership sections (§2, §6.2, §8.4): Crew Member may create a Crew; multiple Crews up to the cap.
- The PCG-J2-04 note stands: the read path is design space.

### PTM (owner: Product/UX)
- Add C024–C027 and H007.
- Mark O006 resolved.
- Update the O011 decider. Update the §4 pointers for D002, D010 and D011.

### Security
- The SEC-J review declares its validity bound to PTC-2.1.0.
- The C021 reading adopts the SEC-J-10 position. Security should confirm the alignment when it closes SEC-J-10.
- C025 makes SEC-J-03 (invite confirmation) and SEC-J-13 (cross-Crew inference, now that a person can belong to several Crews) current.

### Gates
- On this draft: DOCTRINE_EVIDENCE_REVIEWED and DOCTRINE_INTERPRETABLE, both fresh and independent, over the full edited scope.
- Then: PRODUCT_CONSTITUTION_READY.
- After publication:
  - Any downstream gate bound to the 2.1.0 hash is re-checked in the edited scope only: the phase 1–3 judge reviews of PDM-0.4 and PDR-0.4, and the Architect handoff acceptance.
  - Product/UX receives a versioned handoff.
  - The canonical index is updated by the Chief.
- `CURRENT_MISSION.md` and `MISSION_LEDGER.md` are not touched by this record; the Chief owns them.

## 10. Open items (none needs a new Founder decision for this draft)

- **OI-1** (owner: Product/UX, via the Chief): record FG-2 Package A values in the PDR before publication; this is a precondition of C025's pointer.
- **OI-2** (owner: Chief): line 5 carries "**Estado:** DRAFT, não canônico". Publication changes that marker and therefore the sha256. The gates bind to the draft hash above, so the Chief should record a diff showing that only the marker changed, plus both hashes.
- **OI-3** (owner: PCG; Founder only if raised): residual, not a THESIS_CONFLICT. The Canon defines context use and declared full support but no "declared but limited" tier, and this revision does not create one. A D011 sport presented as supported but not fully is governed by the readings and by Release Scope. If a Release Scope proposal needs such a tier, it returns to PCG as a candidate OPEN QUESTION.
- **OI-4** (owners: Product/UX and Security): consent mechanics for collective shareables (SEC-J-10, SEC-J2-03) and membership mechanics not decided by C025 (exit, removal, cross-Crew inference) remain design work.
- **OI-5** (checked, no conflict): C004 requires much lower friction for Crew entry than for full adoption. C025 adds inviter confirmation only for forwarded or projected acceptances. The Founder decided both, and relative friction stays low. The interpretability reviewer should confirm.

## 11. Not changed, and why

- L001–L023: hard constraint.
- C016–C023, D010, D011: Founder clause text. Clarified by readings, not edits.
- §6 units, including the Crew row "Pequeno grupo privado…": consistent with C025.
- L011, L012 and the first two paragraphs of §13: instruction, and no change needed.
- §25 invariant index and §26 anti-patterns ("declarar suporte superficial como completo" already matches §7.1).
- C004 and D008 (entry friction and evolution): no conflict with C025 (OI-5).
- O005, O007, O008, O009, O010, O012: not in the DI scope.
- 2.0.0 prose outside the 2.1.0 delta: DI-07 targets 2.1.0 material obligations. A global rule for unlabeled prose was rejected (CH-02).
- ID gaps C011, C013 and C014: not reused, to keep IDs stable.
- No historical narrative was added to the contract body (both Founder records forbid it).
- **Out of Canon scope** (not formalized): FG-3, the early confirmation of social option A as the working baseline (a Release Scope / PDR matter); the launch market (Brazil; PT-BR and English); the launch platforms (iOS and Android); and the minimum age. [Corrected in round 1, RA-11: the Founder answered "18+, como Runna (Recomendado)" (record §"Founder follow-up on minimum age", about 11:35). The record classifies it as a product-scope and legal-posture decision for the PDR, not Canon doctrine. No Canon impact.]

## 12. Deterministic checks

The script is `ptc_checks.mjs` (Node 24, in the session scratchpad, outside the repository). It was run on the files in this folder; results are in §13.

## 13. Check results and self-check

The final run is recorded in the Chief hand-off: the PASS count, the draft sha256 `7059b5f833e1c674cd8ed45e81462bc034c48d6a1391081032f4a85829c8f3e4` and the snapshot sha256 `4d4ccb65b341efc45b88bbf5aa173bb34c2f39452e5f6b85dd3beb6b8ee6dbd1`.

What the checks cover:
- canon unchanged, and snapshot equal to the canon;
- L001–L023 identical; Founder clauses identical; only O006 and O011 among the pre-existing defining lines changed;
- IDs unique; all 72 earlier IDs preserved; new IDs exactly C024–C027 and H007, contiguous; every full or short ID reference defined; class labels correct; no new LOCKED ID;
- tables intact; status marker present; no genealogy mention; O006 resolved;
- the §13 "permanecem abertos" sentence replaced; no Crew numbers in the Canon;
- this record covers DI-01 to DI-07, O006 and every new ID, and states the draft hash.

**PCG self-check** (rubric `evals/PRODUCT_GOVERNANCE.md`, "PCG — entrega/self-check"). This is a self-check only; it is not approval.
- Request, authority, current source and history recovered; current, target and delta explicit: PASS (§1–§4).
- Thesis, limits, invariants, decisions, design space, hypotheses and open questions distinguishable, with IDs, sources, classes and authority: PASS (new IDs labeled; readings governed by the §2 rule).
- Normative register owned by PCG, with no duplicated truth and no renamed conventions: PASS (existing ID series and file names; numbers only in the PDR).
- Every binding decision traceable to its origin, decider and acceptance; no hypothesis turned into MUST: PASS (C024, C026 and C027 trace to Founder records; C025 to FG-2; H007 is a HYPOTHESIS).
- Conflicts and drift with sources A/B, impact and resolver: N/A, none found. OI-3 and OI-5 are recorded as checked residuals.
- Recoverable history, supersession, version and dependent impact: PASS (snapshot, §9, per-change before/after).
- No UI or architecture prescribed as an outcome: PASS (examples marked illustrative; mechanics left to Product/UX and Security).

## 14. Correction round 1 (REQUEST_CHANGES r1)

**Inputs** (correction loop attempt 1 of 2):
- `audits/canon-2.2.0-reviews/DOCTRINE_INTERPRETABLE_r1.md`: FAIL / REQUEST_CHANGES. DI2-01 and DI2-02 are blocking; DI2-03 to DI2-06 are non-blocking; there is a minor DI-04 residual.
- `audits/canon-2.2.0-reviews/DOCTRINE_EVIDENCE_REVIEWED_r1.md`: PASS with condition RA-01; RA-02 to RA-09 and RA-11 are non-blocking.

**Scope of this round:**
- The round-0 record (§1–§13) is preserved. Superseded points are named below, and nothing was deleted.
- Re-read in this round: both r1 reports in full, and the Founder Phase 3 record for the minimum-age lines only. That file is now sha256 `bd1758a6…`; it changed after round 0 when the age follow-up was added, and its Package A section is unchanged at the same lines.
- L001–L023 and the Founder clause lines (C016–C023, D010, D011) remain byte-identical (§14.7).
- Draft after this round: sha256 `724834fbe39cd1467a5e61fd54d9aae3e025e4afffbcb0945a9db49027ae810e`.

### 14.1 Resolutions

**R1-01 · DI2-01 (blocking) and RA-03: limited support representations**

Changes:
- **§7.1, row "Declarar suporte".**
  - Before: "Em VFT-L023, “declare como plenamente suportada” tem esse alcance e não depende de declaração formal."
  - After: "A amplitude do termo se refere aos meios de representação, não ao nível de suporte representado. VFT-L023 se aplica quando a representação, por qualquer desses meios, apresenta a modalidade como plenamente suportada."
  - "Sem depender de declaração formal" moved into the row's first sentence.
- **§7.1, row "Suporte superficial", redefined.**
  - Before: "Declarar suporte sem a profundidade crível que a declaração exige. É o termo único … placeholder … (VFT-C024)…"
  - After: "Suporte a uma modalidade sem a profundidade que VFT-L023 exige … VFT-L023 proíbe declarar plenamente suportada uma modalidade nessa condição e proíbe que a coordenação multiesporte a mascare."
  - The row now carries only L023's own term and L023's authority.
- **New §7.1 row "Representações vedadas no faseamento".** For the four sports during phasing, C024 does not authorize placeholder, generic tracking without credibility, or a promise of complete support before the necessary depth, "qualquer que seja o nível de suporte representado". The row states "A vedação tem a autoridade de VFT-C024".
- **VFT-C024 text.** The round-0 label "suporte superficial:" is removed. The sentence returns to its 2.1.0 wording: "Faseamento não autoriza placeholder, tracking genérico sem credibilidade ou promessa de suporte completo antes da profundidade necessária." This supersedes that part of CH-04.
- **New §7.1 row "Representação de suporte limitado".** It covers limited or partial representations below minimum credible coverage that are neither full declarations nor banned by C024; examples are the sport's own analytics before plans, or a "beta" listing. Their status is undecided and goes to VFT-O013, as does any representation whose fit under C024 is doubtful.
- **New VFT-O013 (OPEN QUESTION).**
  - Question: "Uma modalidade abaixo da cobertura mínima crível pode receber representação de suporte limitado ou parcial … Em que condições?"
  - Decider: "Founder decide, na divisão do Release Scope: Product/UX propõe; Research & Evidence informa; Chief coordena (§7.1)".
  - Trigger: "Antes de qualquer Release Scope ou arquitetura adotar tal representação".
- **Elsewhere.** The §31 C023 row gains "representação de suporte limitado segue VFT-O013" (see also R1-04). The D011 paragraph gains "Representá-las com suporte limitado segue VFT-O013."

Classification and sources:
- **Epi:** INFERRED for the term reach and the placement of authority. The substance of O013 is not decided.
- **Norm:** readings of L023 and C024, plus a new OPEN QUESTION.
- **Auth:**
  - Sports record, "Any sport represented by Vilumo as fully supported…": the L023 trigger is full support.
  - Sports record, Release Scope paragraph, "No placeholder or generic tracking without credibility": the ban belongs to C024.
  - RA-03 (R&E r1).
  - §28: "Lacunas materiais retornam como OPEN QUESTION".
  - The Chief's instruction: Founder as owner, the given trigger, and no decision on substance.

**Rationale.** The three DI2-01 readers now converge:
- a placeholder or similar for the four sports violates C024;
- a full declaration without depth violates L023;
- anything in between needs O013 decided before adoption.

The placeholder ban now visibly carries CURRENT authority (C024), not LOCKED, which closes the DI-07 dependency the reviewer noted. A D011 placeholder is no longer an L023 matter by default (RA-03).

**Rejected:**
- Reader A, "partial means full": this would extend L023.
- Reader B, "permitted if credible": this would decide the substance.
- Leaving the question only in OI-3.

**Impact:** PDM sport states and the Phase 4 items in §30 (workout representation, metrics, onboarding/profile) must not adopt limited representations until O013 is decided. PTM adds O013. OI-3 (round 0) is superseded by O013.

**R1-02 · DI2-02 (blocking) and RA-02: the C025 rights bind the product**

Changes:
- **§2.**
  - Before: "“Pode” delimita permissão ou design space e não cria obrigação."
  - After: "Quando descreve o que o produto ou seus owners podem escolher, “pode” delimita permissão ou design space e não cria obrigação. Quando uma decisão concede uma possibilidade a pessoas, o produto deve respeitá-la; restringi-la exige a autoridade que a decidiu."
- **§13, the "decide" sentence.**
  - Before: "VFT-C025 decide tamanho, critério de relação real, entrada e descoberta."
  - After: "VFT-C025 decide tamanho, participação em mais de uma Crew até o limite, direito de criar Crew para Full Member e Crew Member, critério de relação real, entrada e descoberta. A participação em mais de uma Crew e o direito de criar Crew são possibilidades concedidas a pessoas e vinculam o produto (§2); restringi-las exige decisão do Founder."
- **§31 C025 row.** It adds "restringe a criação de Crew a um dos papéis ou impede participar de mais de uma Crew até o limite", and "o direito" in the response.
- **O005 row.** The decider column adds "O direito de criar Crew e a participação em mais de uma Crew estão decididos em VFT-C025".

Classification and sources:
- **Epi:** DECIDED for the rights (FG-2 rows 1 and 3: "Up to 3"; "Anyone (Full Member or Crew Member)"). INFERRED for the scope of "pode" in §2.
- **Norm:** content of C025 (CURRENT PRODUCT DECISION), and a modal clarification in §2.
- **Auth:** the FG-2 record; R-O005, which places "o direito de criar Crew (FG-2)" with the Founder; RA-02.

**Rationale.**
- Both fixes are applied. The rights bind locally (§13, §31, O005), and the §2 rule can no longer demote them.
- I checked the other uses of "pode":
  - Product or owner discretion keeps its meaning: the D clauses, C018, C019, C020, D006.
  - L010 ("pessoas … podem ter modalidades … diferentes") gains nothing beyond what L010 already says.

**Rejected:**
- Changing C025's "pode" to "deve": that would misstate a right of people as their duty.
- Changing §2 alone: the reviewer asked for the rights to be visible locally.

**Impact:** PDM membership sections must allow either role to create a Crew and allow several Crews up to the cap. Any O005 or O009 proposal to restrict these goes to the Founder.

**R1-03 · DI2-03: D011 activity informs load**
- Change to the D011 paragraph.
  - Before: "Usá-las como contexto do motor é escolha de Product/UX dentro de VFT-D009 e VFT-D011, limitada por VFT-L022 e VFT-C012."
  - After: "A atividade nessas modalidades informa o contexto do motor como a de qualquer outra (VFT-L004, VFT-C012). Product/UX escolhe como ela é lida e usada, dentro de VFT-D009 e VFT-D011 e limitada por VFT-L022, e não se ela informa carga e recuperação."
- **Epi:** INFERRED.
- **Auth:**
  - L004 (LOCKED) and C012.
  - The context row: "Vale para qualquer modalidade"; "sem … omissão silenciosa".
  - R-DR-43 condition (4): "'O motor ignora a atividade' é desfavorecido; só se admite confiança reduzida … nunca omissão silenciosa". Confidence is high for D011.
- **Rationale:** removes reader B's option of ignoring the activity openly.

**R1-04 · DI2-04 and RA-06: an end-state test and one authority wording**

Changes:
- **Row "Nível de contexto transitório".**
  - Before: "…sequenciada pelo Release Scope rumo a essa cobertura"
  - After: "…enquanto o Release Scope vigente registra para ela um prazo, em release ou data identificados, para atingir essa cobertura."
- **New row "Estado final abaixo da cobertura".**
  - Text: "A partir do primeiro Release Scope, manter uma modalidade de VFT-C023 abaixo da cobertura mínima crível sem prazo registrado no Release Scope vigente."
  - It maps C023's "reduzidas a tracking superficial" and "tratadas como compatibilidade incidental".
  - It adds "Aprovar um Release Scope não equivale a essa decisão."
- **One authority wording.** The table, the "Limites do Release Scope" paragraph and §31 now all say: "nova decisão explícita do Founder sobre aquela modalidade, que PCG registra como revisão de VFT-C023". This replaces the three round-0 variants: "(VFT-C023)", "… e revisão de VFT-C023", and "exige nova decisão explícita Founder".

Classification and sources:
- **Epi:** INFERRED.
- **Auth:**
  - C023: "sem nova decisão explícita do Founder".
  - R-DR-43 condition (3): "mantê-lo sem prazo exige decisão explícita do Founder". Confidence is medium-high for C023.
  - The PCG-J2-06 pattern: a Founder decision takes effect as decided, and PCG records it.

**Rationale.**
- RA-06 is resolved by alignment, not by recording a difference. The test is now R-DR-43's "sem prazo", made observable as a release or date in the current Release Scope.
- In the reviewer's scenario (Swimming deferred "after Cycling" in releases 1–3 with no target), every reader now sees an end state.
- "Aprovar um Release Scope não equivale" keeps the word "explícita" in C023 meaningful.

**Rejected:**
- "Sem sequenciamento" (round 0): not observable.
- A numeric deadline: that would be new strategy.

**Note for reviewers.** R-DR-45 says "exige decisão explícita do Founder e revisão de C023". The unified wording keeps both elements: the decision takes effect as the Founder decides, and PCG records the C023 revision. PCG-J2-06 set the same order for delegations. Reviewers should confirm this order is acceptable.

**R1-05 · DI2-05: gaps in the Release Scope allocation**

**(a) Non-strategic parts, and the overlap with O012.**
- Added to "Decisão do Release Scope": "Partes do Release Scope que são escolha dentro do design space, sem alterar estratégia, identidade ou direção material, podem seguir os owners próprios (§2, §28). Na dúvida sobre se uma parte é estratégica, o Chief a leva ao Founder (§2, §28). Para conceitos sociais, adiar um conceito aceito é prioridade de lançamento (VFT-O011, VFT-D002); abandoná-lo de vez ou redefini-lo é mudança material de direção (VFT-O012)."
- The Founder's list now reads "sequencing e prazos das modalidades"; the "prazos" follow from R1-04.
- **Epi:** INFERRED.
- **Auth:**
  - §2: "Soluções dentro do espaço aberto seguem os owners próprios"; the Founder decides "estratégia … e mudanças materiais".
  - §28: "Escolhas dentro do espaço aberto podem seguir os owners próprios".
  - D002: "Aceitar os conceitos não obriga lançar todos".
  - §10: "sem obrigar todas as mecânicas a existir no lançamento".
  - O012, and R-DR-11 (confidence high).
- The rule for doubtful cases is the conservative default that §2 already implies; it needs no new allocation.

**(b) Coverage criteria. Not derivable, so this becomes new VFT-O014 (OPEN QUESTION).**
- Question: "Quem fixa os critérios de cobertura mínima crível de cada modalidade e quem verifica, antes de uma declaração de suporte pleno, que a modalidade os atinge?"
- Decider: "Founder decide a alocação; Research & Evidence e autoridades de domínio informam; Product/UX propõe; Chief coordena".
- Trigger: "Antes de o primeiro Release Scope declarar uma modalidade plenamente suportada".
- The §7.1 paragraph "Limites do Release Scope" points to it.
- Why not derivable: R-DR-45 says only that the threshold "vem da evidência". §2 gives R&E an audit role over claims, but not ownership of the criteria or of the verification gate.

**(c) Where a delegation is recorded before the next revision.**
- Added: "Até a revisão seguinte deste contrato, que a registra, ela vale pelo registro rastreável da decisão do Founder, que quem a invoca deve citar."
- Basis: binding decisions must be traceable. §2 says the Founder decides and PCG formalizes, and Founder authority records are this project's form for Founder decisions.
- No new record type, and no new duty for any role beyond citing the record.

**Rejected:** naming Product/UX or R&E as the coverage decider (an invention), and a new register for delegations (a new artifact).

**R1-06 · DI2-06 and RA-09(b): bounds and classifier for the C025 parameters**
- Added to §13: "Os limites de VFT-C025 são qualitativos, a ordem de tamanho de um círculo íntimo e um limite baixo de Crews por pessoa, ancorados nos valores de referência decididos. Toda alteração desses valores é decisão do Founder. PCG classifica cada alteração: se permanece nesses limites, basta atualizar o registro; se sai deles, altera VFT-C025 e exige revisão deste contrato e seus gates. Na dúvida, PCG a trata como alteração de VFT-C025."
- In C025, "(VFT-H006)" becomes "; a evidência sobre o tamanho se relaciona a VFT-H006".
- **Epi:**
  - DECIDED: the Founder decides changes (record rows 1–2, "can be revised/adjusted with evidence").
  - INFERRED: PCG classifies (§2, "PCG … classifica seu alcance, detecta contradições").
  - H006 is scoped to size, as in the record: row 2 cites H006 and row 1 does not.
- **Rationale:** in the reviewer's scenario (8 to 12), the Founder decides the value and PCG classifies it; in doubt, the gates run. No numeric bound is invented.
- **Rejected:** a numeric ceiling (not in the record), and Product/UX as classifier.

**R1-07 · RA-04: the authority statement of §7.1**
- The opening of §7.1 now reads: "Cada parte carrega somente a autoridade das cláusulas que lê. Os termos sobre modalidades leem VFT-L003, VFT-L004, VFT-L023, VFT-C012, VFT-C023, VFT-C024 e VFT-D011. A definição de Release Scope e os parágrafos sobre sua decisão leem §2, §28, VFT-O011, VFT-O012, VFT-D002, VFT-D010 e VFT-C019; a alocação de decisão que eles descrevem não tem a autoridade de VFT-L023."
- **Rationale:** no reader can carry LOCKED authority into an INFERRED allocation.

**R1-08 · RA-05: recorded in the delta only (no Canon change)**
- **(a) Ruling confidences, as given in PDR §6:**
  - R-DR-43: high for D011; medium-high for C023.
  - R-DR-45: high that the Founder decides today; medium that it reflects the O011 split.
  - R-D011: medium-high. R-DR-11, R-O005 and R-A8: high. R-DR-10: high, not used.
  - The CH-06 and CH-24 derivations rest partly on medium or medium-high rulings. R&E r1 judged them derivable independently of those rulings, from §2, O011 and the Canon's "X propõe; Founder decide" pattern.
- **(b) SEC-J-10 is a Security position, not an authority.** It was offered "for PCG to decide".
  - CH-12 and R1-09 adopt it under PCG's editorial authority.
  - The authority bases are: Founder Shareability principle 5 ("dados agregados/consentidos"; "sem consentimento apropriado"); C021's "agregados e/ou consentidos"; L014; L017.
  - The "Auth" line of CH-12 should be read this way.
- **(c) Corroborations:**
  - The FG-3 framing the Founder accepted ("the final launch shape is decided at the Release Priorities gate") corroborates that launch priorities belong to the Founder (CH-24, R1-05).
  - The cost the Founder accepted with FG-2, "Every collective shareable needs the consent of each identifiable member", corroborates the C021 reading (CH-12, R1-09).

**R1-09 · RA-08: consent tied to data, purpose and destination**
- Change to the C021 reading.
  - Before: "Mostrar um membro identificável com o próprio consentimento dele, apropriado à finalidade e ao destino, não é reidentificação."
  - After: "Mostrar um membro identificável, com o próprio consentimento dele para aqueles dados, aquela finalidade e aquele destino, não é reidentificação. Esse consentimento não alcança outros dados do mesmo membro: o objeto continua sem poder revelar, nem por inferência, dados privados dele que não foram consentidos."
- **Epi:** INFERRED.
- **Auth:** C021 ("consentimentos apropriados à finalidade e ao destino"; "exposição por inferência"), and L014. Security confirms when it closes SEC-J-10.

**R1-10 · RA-07: "quando apropriado" as necessary minimum conditions**
- Before: "“Quando apropriado” não abre critério livre. Um objeto ou compartilhamento é apropriado quando …"
- After: "“Quando apropriado” não abre critério livre, mas este contrato não o esgota. São condições mínimas necessárias, não suficientes: …" plus "Os critérios concretos que completam o padrão pertencem ao Shareable Object Model (VFT-C026), dentro de VFT-D010."
- **Rationale:** PCG does not close the Founder's open term.

**R1-11 · RA-09(a): classification of the C025 exclusions**
- Change to §13.
  - Before: "…estão excluídas (VFT-L012, VFT-L014)."
  - After: "…estão excluídas. A exclusão foi aceita com VFT-C025 e se fundamenta em VFT-L012 e VFT-L014; uma revisão de VFT-C025 não a remove sem compatibilidade com esses invariantes."
- **Corrected classification.** This supersedes CH-07's statement that the sentence "carries LOCKED authority".
  - **Epi:** INFERRED. The ban on public listing or search follows from L012 (and §13). The ban on contact-book ingestion follows from L014 via the Security finding SEC-J-03 (third-party data). Both were presented to the Founder as "excluded in any option" and accepted in FG-2.
  - **Norm:** part of the boundary accepted with C025 (CURRENT PRODUCT DECISION). L012 and L014 still apply on their own, so removing the exclusion would also need compatibility with them.
- SEC-J-03 is named here and not in the Canon, which keeps downstream audit IDs out of the Canon.

**R1-12 · RA-11: minimum age**
- The §11 line is corrected in place and marked. The matter is out of Canon scope.

**R1-13 · DI-04 minor residual: "not selected" versus "excluded by design"**
- Change to the C018 reading.
  - Before: "Excluir por desenho um tipo de progresso relevante, como adaptação ou retorno, exige justificativa registrada. “Pode ganhar” indica elegibilidade: nenhum progresso específico precisa ser representado, e a seleção segue VFT-D010."
  - After: "“Pode ganhar” indica elegibilidade: nenhum progresso específico precisa ser representado. Não selecionar um tipo de progresso para um release é seleção de VFT-D010 e não exige justificativa. Excluir por desenho um tipo de progresso relevante, como adaptação ou retorno, de modo que o modelo de objetos ou a arquitetura impeça representá-lo, exige justificativa registrada."
- **Rationale:** the reviewer's example, a release-1 Shareable Object Model with no adaptation or return object, is a D010 selection unless the model makes such an object impossible.

**RA-01 (condition, handled by the Chief in parallel)**
- No PCG change. C025's pointer "registrados no Product Decision Register" is kept, as instructed.
- PCG did not edit the PDR.
- **PCG pointer confirmation.** This is an observation from a targeted lookup of the FG-2 entry and its source lines only, not a gate.
  - PDR-0.4.1 is sha256 `51271643282393185146219ff29f9ee8cb5e8c3f32bc9f5aba890321488b79ca`.
  - Its §3 heading reads "FG-2 — Fronteira da Crew (O006) · RESOLVIDO (Founder, 2026-10-10)", with the literal answer "Pacote A (Recomendado)".
  - It records the values "Até 3 (referência revisável com evidência)" and "Ordem de círculo íntimo, até cerca de 8 (referência revisável com evidência, H006)", the creation right for either role, criteria 4–5 and the exclusions.
  - It cites the source `audits/phase-1-3-reviews/founder-gate-phase3-decisions.md`.
  - The register row DR-22 = FG-2 reads "RESOLVIDO … Pacote A".
  - C025's pointer "registrados no Product Decision Register" is therefore true at that hash.
  - The PDR also scopes H006 to size only, which matches R1-06.
- OI-1 is closed by this observation, subject to the auditor's confirmation.

### 14.2 Summary

| Finding | Severity | Resolution | Change |
| --- | --- | --- | --- |
| DI2-01 + RA-03 | blocking | "Declarar" is broad in means only; L023 applies only to representation as fully supported. The placeholder ban sits in C024 with CURRENT authority. Limited representations go to new O013 (Founder; substance undecided) | R1-01 |
| DI2-02 + RA-02 | blocking | Creation by either role and multi-Crew participation up to the cap are decided rights that bind the product. They are in §13, §31 and O005, and the §2 "pode" rule is scoped | R1-02 |
| DI2-03 | non-blocking | D011 activity always informs load; Product/UX chooses only how | R1-03 |
| DI2-04 + RA-06 | non-blocking | Observable end-state test: no deadline in the current Release Scope. One authority wording, aligned with R-DR-43's "sem prazo" | R1-04 |
| DI2-05 | non-blocking | (a) Non-strategic parts go to their owners; in doubt, to the Founder; O012 overlap separated. (b) New O014 (Founder). (c) A delegation is valid through its traceable Founder record until recorded | R1-05 |
| DI2-06 + RA-09(b) | non-blocking | Qualitative bounds anchored on the decided values. The Founder decides changes; PCG classifies; in doubt, a C025 revision. H006 scoped to size | R1-06 |
| RA-04 | non-blocking | §7.1 states which clauses each part reads and which authority it carries | R1-07 |
| RA-05 | non-blocking | Confidences, the status of SEC-J-10 and the corroborations recorded (delta only) | R1-08 |
| RA-07 | non-blocking | "Quando apropriado": necessary minimum conditions; C026 completes the standard | R1-10 |
| RA-08 | non-blocking | Consent tied to the data, purpose and destination | R1-09 |
| RA-09(a) | non-blocking | Exclusions INFERRED via L012, and via L014 through SEC-J-03; accepted in FG-2; part of C025 | R1-11 |
| RA-11 | non-blocking | Minimum age corrected: 18+, out of Canon scope | R1-12 |
| DI-04 residual | minor | "Not selected" (D010) is separated from "excluded by design" (needs a justification) | R1-13 |
| RA-01 | condition | Recorded by the Chief/Product-UX in PDR-0.4.1. PCG confirmed that C025's pointer is now true (`51271643…79ca`) | — |

### 14.3 IDs after round 1

- New IDs: C024, C025, C026, C027, H007, and now **O013 and O014**. The O series is contiguous after O012.
- Pre-existing rows changed: O005 (pointer), O006 and O011.
- No LOCKED ID was added and no existing ID was renumbered.

### 14.4 Impact on dependents (in addition to §9)

- **PTM:** add O013 and O014; add the O005 pointer; reflect that the C024 sentence is back to its 2.1.0 wording.
- **PDM:**
  - Sport states adopt no limited representation until O013 is decided.
  - Each Release Scope records a deadline for each C023 sport below coverage, or the Founder decides that sport's end state explicitly.
  - Membership allows creation by either role and several Crews up to the cap.
  - D011 activity always informs load.
- **PDR:** R-DR-43 condition (3) and R-DR-45 are superseded in scope by §7.1 (wording now aligned). The FG-2 entry is RA-01.
- **Phase 4 architecture and Phase 7 Release Scope:** O013 and O014 are their triggers.
- **Security:** R1-09 (consent scoped to data) and R1-11 (the SEC-J-03 basis) bear on closing SEC-J-10 and SEC-J-03.
- **Gates:** both r1 verdicts are bound to `7059b5f8…`. The scope edited in this round is:
  - §2;
  - the C024 sentence in §7;
  - §7.1;
  - §13;
  - the §21.1 readings of C016, C018/C019 and C021;
  - the §31 C025 and C023 rows;
  - §32 (O005, O013, O014).

### 14.5 Open items after round 1

- OI-1 (RA-01): pointer confirmed true at PDR-0.4.1 `51271643…79ca` (see RA-01 in §14.1); the auditor confirms.
- OI-2 (status marker at publication): open.
- OI-3: superseded by VFT-O013.
- OI-4 and OI-5: unchanged.
- O013 and O014 are Founder-owned OPEN QUESTIONS. By §32 they block adopting the dependent solution, not READY.
- No Founder decision is needed for this draft, and no THESIS_CONFLICT was found.

### 14.6 Not changed in round 1, and why

- L001–L023, C016–C023, D010 and D011: byte-identical.
- The "pode" verbs in C025: see R1-02.
- C026, C027, H007, D010, and the texts of C021 and C022: no finding touched them.
- §25, §26 and §33: still consistent. §33 does not mention O013 or O014, as it does not list other open questions.

### 14.7 Checks (round 1)

**Script changes.** `ptc_checks.mjs` was updated for this round:
- expected changed rows are {O005, O006, O011};
- expected new IDs include O013 and O014;
- the O series must be contiguous;
- the class-label check skips O rows, whose class comes from the §32 table header;
- delta coverage now includes the round-1 findings.

**Result: 26/26 PASS.** The checks confirm:
- canon unchanged, and snapshot equal to it;
- L001–L023 identical (23/23); Founder clauses identical (10/10);
- among pre-existing rows, only O005, O006 and O011 changed;
- IDs unique, all 72 earlier IDs preserved, new IDs exactly C024–C027, H007, O013 and O014 and contiguous; every full and short-form reference defined;
- class labels correct, and no new LOCKED ID;
- all 5 tables intact;
- status marker present, and no genealogy in the contract body;
- O006 resolved; no Crew numbers in the Canon;
- delta coverage complete, and the draft sha256 stated.

Hashes: draft `724834fbe39cd1467a5e61fd54d9aae3e025e4afffbcb0945a9db49027ae810e`; snapshot `4d4ccb65b341efc45b88bbf5aa173bb34c2f39452e5f6b85dd3beb6b8ee6dbd1`.

### 14.8 Self-check, round 1 (PCG rubric; self-check only, not approval)

- **Current, target and delta per finding, with the source of each:** PASS (§14.1).
- **Distinguishable classes:** PASS.
  - The O013 and O014 substance is left undecided.
  - The C024 ban has CURRENT authority and is no longer conflated with L023.
  - The authority allocations are marked INFERRED and do not borrow LOCKED authority.
- **Traceable binding decisions:** PASS. The C025 rights trace to FG-2, and "pode" no longer demotes them.
- **No hypothesis turned into an obligation:** PASS. H006 is scoped to size.
- **Conflicts and drift:** N/A, none found.
- **Recoverable history:** PASS. The round-0 text is preserved, supersessions are named, and the snapshot is intact.
- **No UI prescribed:** PASS. The examples (analytics, "beta" listing) only illustrate O013's scope.
