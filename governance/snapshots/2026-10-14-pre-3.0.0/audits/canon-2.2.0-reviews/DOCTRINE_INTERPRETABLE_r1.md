# DOCTRINE_INTERPRETABLE — VILUMO-PTC-2.2.0 draft, review round 1

| Field | Value |
| --- | --- |
| Gate | DOCTRINE_INTERPRETABLE (PRODUCT_GOVERNANCE rubric 1.2.0, Product/UX reviewer) |
| Artifact | `governance/drafts/VILUMO-PTC-2.2.0/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md`, sha256 `7059b5f833e1c674cd8ed45e81462bc034c48d6a1391081032f4a85829c8f3e4`; delta `c5563dc4…38b9`; baseline `4d4ccb65…` |
| Verdict | **FAIL / REQUEST_CHANGES**: 2 blocking findings (DI2-01, DI2-02), both PCG editorial; nothing DOCTRINE_BLOCKED. DI-01 to DI-07 are all resolved |
| Reviewer | The same independent Product/UX reviewer instance that reviewed 2.1.0 and raised DI-01 to DI-07. It did not author the draft and wrote no files. The reviewer disclosed that this is a re-review by the author of the original findings and mitigated it by re-running scenarios against the draft text only |
| Route | claude-opus-5-5 / max. The pass was interrupted by HTTP 429 at about 11:50 and resumed at 16:03 |
| Date | 2026-10-10 |

The reviewer's report follows verbatim, apart from formatting.

## Criteria
- **C1 (obligations vs design space): FAIL.**
  - DI2-01: readers diverge on whether a limited declaration of support is prohibited, permitted or undecided.
  - DI2-02: readers diverge on whether the C025 right to create a Crew is decided or is open design space.
  - Everything else improved. §2 now defines "pode", "should" and readings. C024, C026, C027 and H007 are labelled.
- **C2 (scope, terms, no contradictions): PASS,** with non-blocking notes DI2-03, DI2-04 and DI2-06.
  - The terms are now unified: "suporte superficial", "declarar suporte", "Health context" and "campanhas".
  - No remaining conflict lacks a reading supported by the text and by LOCKED precedence.
- **C3 (translatable without inventing strategy): FAIL,** on DI2-01 only.
  - C025 and §7.1 translate into objects, journeys and states.
  - The one undecided sport-support state is routed only in the delta's OI-3, not in the Canon.
- **C4 (design space preserved): PASS.**
  - D009 and D010 are unchanged.
  - §30.1: "ilustrativas e não formam checklist nem inventário obrigatório", and story/post apply only "quando esses formatos forem selecionados".
  - C026 "pode integrar o artefato de arquitetura existente".
  - C025 fixes entry and discovery policy, not UI.
- **C5 (independence): PASS.**
  - I am a fresh instance. I did not author or edit the draft or the delta, and I wrote no files.
  - Disclosure: I reviewed 2.1.0 and wrote DI-01 to DI-07, so this is a re-review by the author of the findings. To limit that bias I re-ran every scenario against the draft text only.
  - The PCG author is a different instance under the same Chief session.

## DI-01 to DI-07: resolution
- **DI-01: resolved.**
  - Re-run: Swimming below launch depth, and a user syncs swims.
  - The swims inform load, recovery, interference and availability with explicit confidence ("Vale para qualquer modalidade, inclusive as de VFT-C023 abaixo…"; "informar que uma sessão foi considerada … não é declarar suporte").
  - A judge applying the §31 C023 row finds "O nível de contexto transitório sequenciado pelo Release Scope não é violação".
  - The two readers converge. Residuals: DI2-01, DI2-03, DI2-04.
- **DI-02: resolved.**
  - Re-run, Swimming in release 2: "O Founder decide … inclusive sequencing", so both Chiefs route it to the Founder.
  - Re-run, release 1 without sharing: Release Scope covers "a seleção de objetos e expressões de Shareability", and "quais objetos existem e quando são lançados permanece em VFT-D010". It becomes a launch-shape decision under Release Scope and O011, and the readers converge.
  - O011's proposer/decider split is clear. Whether that split can be derived from §2 is for R&E to judge, not me.
  - Residual: DI2-05.
- **DI-03: resolved.**
  - "Campanhas" is now illustrative and "não criam conceito social nem mecânica além de VFT-C005".
  - "Health context" is defined, protective only, and authorizes no data collection.
- **DI-04: resolved.**
  - Re-run, C018 used as a MUST: §2 says "should" "não torna obrigatória cada ocorrência", and the reading says "nenhum progresso específico precisa ser representado". No failure, and the readers converge.
  - Minor residual (non-blocking, no ID): the reading does not separate "not selected for a release" (D010) from "Excluir por desenho…", which needs a recorded justification. Example: a release-1 Shareable Object Model with no adaptation or return object. Recording a justification is cheap.
- **DI-05: resolved.**
  - Re-run, 3-person Crew collective streak: it needs the consent of each identifiable member, appropriate to the purpose and destination.
  - If one member refuses, the object cannot reveal that member's data or non-participation: "O consentimento de um ou mais membros nunca autoriza…". The §31 row is aligned, and the readers converge.
- **DI-06: resolved.**
- **DI-07: resolved,** with one dependency.
  - Whether the placeholder prohibition carries LOCKED authority (L023) or CURRENT authority (C024) now depends on how DI2-01 is resolved.

## New findings

**DI2-01 · BLOCKING · owner: PCG editorial; the Founder decides the substance only when it is triggered**
- **Clauses:**
  - §7.1, rows "Declarar suporte", "Suporte superficial" and "Nível de contexto transitório";
  - §7.1, paragraph "Decisão do Release Scope";
  - L023, C024 and the §31 L023 and C023 rows.
- **Issue:** a representation of *limited* support for a sport below minimum credible coverage (for example sport-specific analytics or a "beta" listing) has no determinable status. Three readings are each supported by the text:
  - **(A) Prohibited.** "Em VFT-L023, 'declare como plenamente suportada' tem esse alcance" treats any representation as a full declaration, and the examples include "analytics próprios da modalidade". The transitional level is defined as "sem declaração de suporte".
  - **(B) Permitted if credible.** L023 keeps "plenamente", and "Ninguém declara suporte pleno abaixo…" covers only full declarations. "Suporte superficial" is relative: "sem a profundidade crível que a declaração exige". C024 names "promessa de suporte completo". §2 says a reading "não cria obrigação nova", so §7.1 cannot extend L023.
  - **(C) Undecided and must go back as an OPEN QUESTION.** This is the author's intent (delta OI-3), but it is absent from the Canon.
- **Scenario:** Release Scope proposes release 1 with "Swimming analytics (pace/100 m, SWOLF), plans later".
  - Reader A finds superficial support and a §31 violation.
  - Reader B finds it compliant.
  - Reader C requires a decision first.
  - "Anúncio de suporte" (coming soon, waitlist) splits the same way.
  - This directly affects the Phase 4 sport states listed in §30: workout representation, metrics, onboarding/profile.
- **Minimal resolution:**
  - Say whether "esse alcance" covers only the means of declaring (any representation, no formal declaration) or also equates partial with full declarations.
  - Record in the Canon the status of limited declarations below minimum credible coverage, for example as an OPEN QUESTION. Owner: the Founder, under the Release Scope split. Trigger: before any Release Scope or architecture adopts such a representation.
  - PCG must not decide the substance.

**DI2-02 · BLOCKING · owner: PCG editorial (the FG-2 record is explicit: "Anyone (Full Member or Crew Member)")**
- **Clauses:** C025 with the new §2 rule ("'Pode' … não cria obrigação"); the §13 sentence "VFT-C025 decide tamanho, critério de relação real, entrada e descoberta"; the §31 C025 row; O005.
- **Issue:**
  - "Qualquer pessoa … pode criar uma Crew" and "pode participar de mais de uma Crew" are phrased as "pode".
  - The §13 "decide" sentence leaves out creation, and adds "Mecânicas de membership que essa cláusula não decide permanecem abertas".
  - The §31 C025 row does not cover restricting who may create a Crew.
  - O005 still lists Crew Member rights as open, with no pointer to C025.
- **Scenario:** a Phase 4 membership design, or an O005/O009 proposal, restricts creation to Full Members.
  - Reader A: this violates the Founder's FG-2 boundary.
  - Reader B: it is open design space, with no violation and no escalation.
  - A Founder-decided boundary can therefore be narrowed without anyone noticing, with effects on C003/H002 (acquisition) and C004 (light entry).
  - The cap is partly protected, because §31 treats it as a parameter.
- **Minimal resolution:**
  - Make creation by either role, and participation in several Crews up to the cap, read as decided content the product must honor: add them to the "decide" sentence and to the §31 row, and optionally point O005 to C025.
  - A local fix is enough; §2 does not need to change.

**DI2-03 · non-blocking · owner: PCG editorial**
- **Clauses:** §7.1 "Modalidades de VFT-D011" against the context row and L003/L004/L005/C012.
- **Issue:** "Usá-las como contexto do motor é escolha de Product/UX" can be read as permission not to count a person's D011 activity at all, as long as that is stated openly.
- **Scenario:** a runner also plays football. Reader A counts the football session as load with reduced confidence. Reader B ignores it, telling the user.
- **Why non-blocking:** the text leans toward A ("Vale para qualquer modalidade", "sem … omissão silenciosa", LOCKED L004).
- **Minimal resolution:** state that the choice is about *how* such activity is used, not *whether* it informs load.

**DI2-04 · non-blocking · owner: PCG editorial**
- **Clauses:** the transitional context level and its end state.
- **Issue:**
  - "sequenciada pelo Release Scope rumo a essa cobertura" gives no observable test that separates repeated deferral from an end state.
  - The authority needed for an end state is worded three ways: "nova decisão explícita do Founder (VFT-C023)" in the table, "… e revisão de VFT-C023" in the paragraph, and "exige nova decisão explícita Founder" in §31.
- **Scenario:** Swimming is deferred "after Cycling" in releases 1, 2 and 3 with no target. Reader A: still transitional. Reader B: a de facto end state, so a §31 violation that needs a C023 revision.

**DI2-05 · non-blocking · owner: PCG editorial; the Founder only if the allocation cannot be derived**
- **Clauses:** "Decisão do Release Scope", O011, O012. Three residual gaps:
  - **(a) Non-strategic decisions.** No decider is named for the non-strategic parts of a release scope; Product/UX only "propõe". "Estratégicas" is illustrated only with sport examples, and it overlaps O012's own split for social concepts.
  - **(b) Coverage criteria.** No one is named to set the minimum-credible-coverage criteria or to rule on whether a sport meets them. R&E and unnamed "autoridades de domínio competentes" only "informam". This matters because "Ninguém declara suporte pleno abaixo…" is the guardrail for L023.
  - **(c) Delegation.** A Founder delegation "vale como o Founder a decidir", but there is no named record for it before the next revision.

**DI2-06 · non-blocking · owner: PCG editorial**
- **Clauses:** the C025 parameters.
- **Issue:**
  - "sair deles altera VFT-C025", but "ordem de tamanho de um círculo íntimo" and "limite baixo" have no stated boundary, and no one is named to classify a change.
  - C025 also depends on the PDR entry (OI-1), which I could not see.
- **Scenario:** the Founder raises the size reference to 12. Reader A: a PDR update is enough. Reader B: the size leaves the "intimate circle" order, so C025 needs a revision with gates.

## Targeted checks
- **§7.1:**
  - The context-versus-support distinction is clear, and the transitional level is coherent.
  - The end-state test is DI2-04; the D011 choice is DI2-03.
- **"Declarar" read as any representation:**
  - It fixes the drift between "declare" and "apresentada", and it is outcome-based, so nothing is over-specified.
  - "Tem esse alcance" creates DI2-01.
- **Release Scope and O011:** clear for the strategic and sport items. The rest is DI2-05.
- **§2 modals:**
  - "Should" appears only at lines 17 (the definition), 272 (C018) and 276 (the C018 reading).
  - The "pode" rule collides with C025, giving DI2-02.
  - The reading rule supports reader B in DI2-01.
- **C024, C026, C027:** no new ambiguity. C026's "Na fase adequada" still has no trigger. That is acceptable because C017 already binds the current social-object architecture.
- **H007:** interpretable. It bundles five effects, as H002/H003 do. Making it measurable belongs to Research and Data.
- **C025, O006, §13:** C025 is translatable. Its pieces map as follows:
  - **Objects:** Crew, membership, nominal invite, forwarded invite, projected invite object, inviter confirmation.
  - **Journeys:** create a Crew, invite, accept, forward or project an invite, confirm, reach the cap.
  - **States:** pending confirmation, confirmed, declined or expired, Crew full, person at cap.
  - Undecided membership mechanics are routed to their owners within L011/L012/L014.
  - It is coherent with C004: inviter confirmation applies only to forwarded or projected acceptances, so entry stays much lighter than full adoption. I agree with OI-5.
  - It is coherent with L011/L012: a nominal invite is the real-relationship criterion, there is no public listing or search, a projected invite never enrolls anyone by itself, and the size is an intimate circle.
  - Blocker: DI2-02. Note: DI2-06.
- **New §31 rows:**
  - The C023 row now has a phase qualifier, and the L023 row names Release Scope.
  - The C021 and hypothesis rows are aligned.
  - The C025 row lacks creation (DI2-02).
- **Design space:** preserved (see C4).

## Limitations
- This was a single pass by one judge, and the scenarios are simulated. It is also a re-review by the author of the original findings.
- I did not read:
  - `product/` (PDR, PDM, PTM), other audits, the SEC-J and PCG-J records, or the `reviews/*.json` files the delta cites;
  - the delta's bases for those records (R-DR-43/45, R-D011, R-DR-11, SEC-J-10, PCG-J2-06), so I did not verify them;
  - the PDR entry OI-1 requires before publication, so I could not check it. C025's pointer to the PDR depends on that entry.
- Fidelity and authority derivability are R&E's gate and were not assessed: the O011 split from §2, "declarar" as "represented", and the classification of the exclusions sentence.
- I read the Founder Phase 3 record only for C025's intent. Its market, platform and age answers are outside the Canon and were not assessed.
- This verdict binds only draft sha256 7059b5f8…f3e4. Changing the publication marker (OI-2) changes the hash, so the Chief needs to record a marker-only diff.

---

# Round 2 — delta re-review after PCG correction round 1 (2026-10-10, same reviewer instance)

| Field | Value |
| --- | --- |
| Inputs | Draft `724834fbe39cd1467a5e61fd54d9aae3e025e4afffbcb0945a9db49027ae810e`; delta `d86d8c93…5878`; snapshot/canon `4d4ccb65…` (verified). L001–L023, C016–C023, D010 and D011 are byte-identical; the round-1 edits stay within the scope declared in §14.4 |
| Verdict | **PASS.** DI2-01 to DI2-06 resolved; no regression of DI-01 to DI-07; 3 new non-blocking findings (DI3-01 to DI3-03); nothing DOCTRINE_BLOCKED. Under §32, O013 and O014 block the solutions that depend on them, not READY. Not an Architecture Eval or VISUAL_READY |
| Criteria | C1 PASS · C2 PASS · C3 PASS · C4 PASS · C5 PASS. The reviewer re-reviewed its own findings, disclosed it, and mitigated by re-running scenarios against the draft text only |
| Route | resumed instance, claude-opus-5-5 / max; 0 file writes |

## Scenario re-runs
- **DI2-01:** "Swimming analytics now, plans later", with Swimming below coverage. It is not presented as fully supported (L023 does not apply) and it is not a placeholder or non-credible tracking (C024 does not ban it). It is therefore a "Representação de suporte limitado" and goes to **O013**, which needs a Founder decision before adoption. Any "plans coming" copy that promises complete support is banned by C024. All three readers converge. Non-blocking design-level residual: the line between allowed context display and a limited representation is drawn only by examples. Contested cases go to O013 or §28.
- **DI2-02:** a Phase 4 design restricts Crew creation to Full Members. Every reader finds this violates C025: §13 ("vinculam o produto… restringi-las exige decisão do Founder"), §31 ("restringe a criação de Crew a um dos papéis") and the O005 pointer. The §2 rule is coherent with every "pode" and "permite" in the contract.
- **DI2-03:** football now counts as load, with explicit confidence.
- **DI2-04:** with no release or date recorded in the current Release Scope, the state is an end state from the first Release Scope onward. The same wording appears in all three places. Serial postponement with recorded deadlines stays transitional, and each new deadline is a Founder decision.
- **DI2-05:**
  - (a) Design-space parts go to their owners; in doubt, the Chief takes them to the Founder. Deferring a social concept (O011) is separated from abandoning one (O012).
  - (b) O014 reads as the allocation inside C024's own Release Scope determination.
  - (c) A delegation is valid through a traceable Founder record.
- **DI2-06:** the Founder decides the values, PCG classifies each change, and in doubt it is treated as a C025 revision. H006 is scoped to size. The DI-04 residual is resolved.

## New findings (all non-blocking, owner PCG editorial)
- **DI3-01** · §2 rule on possibilities granted to people, with C025, §13 and §31. It is unclear whether role-neutral conditions are "restrictions", for example anti-abuse rate limits on Crew creation or Security suspensions. It is also unclear whether projecting the invite object is a binding possibility. Scenario: Security requires "one new Crew per person per week"; reader A treats it as an open mechanic, reader B as a restriction that needs the Founder. Fix: state that the decided rights concern only roles and multi-Crew participation up to the cap, with role-neutral conditions within L011, L012 and L014 counting as mechanics; and state whether invite projection is discretionary. Security informs.
- **DI3-02** · §7.1 "Estado final" and "Limites", the §31 C023 row and §2. The interim traceable-record rule is stated for delegations but not for end-state decisions awaiting PCG's C023 revision. Fix: apply the same rule to end-state decisions.
- **DI3-03** · the C025 bounds in §13. "Ancorados nos valores de referência decididos" can be read as a moving anchor, so cumulative in-bound changes (8, then 10, then 12) could leave the intimate-circle order. Fix: anchor on the values decided with C025, or have PCG classify the cumulative change.

Limitations: a single pass over §14 and its interactions, on top of one full read. The r1 draft is no longer on disk, so the round-1 changes were verified through the §14 quotes, the diff against the 2.1.0 snapshot and the reviewer's own r1 read. The reviewer did not read `product/` or R&E's reports beyond the overlapping RA items. Derivability of the new rules is R&E's gate.
