# UX-J — Product/UX structural judge: domain model and decision register

| Field | Value |
| --- | --- |
| Gate components | DOMAIN_MODEL_APPROVED (structure of PDM-0.3); PDR-0.3 structural resolutions and Founder Gate entries (input to PRODUCT_DECISIONS_SUFFICIENT) |
| Verdict | **FAIL**: 4 blocking findings (UX-J-01 to UX-J-04), all localized Architect corrections; no Founder decision, doctrine change or re-architecture needed; no invariant violated; no THESIS_CONFLICT |
| Judge | Fresh native product-ux-architect subagent ("UX judge: domain model structure"), dispatched by Claude Chief session 07efc0a5-e1c7-44ef-828e-cbc759fc6a51 |
| Route | requested claude-opus-5-5 / max (work_kind ui_ux_judge, L2, Founder floor); observed claude-opus-5-5 / max; 0 file writes |
| Inputs | PTC-2.1.0 `4d4ccb65…6dbd1`; PDM-0.3 `9ec7fd63…fb4ea`; PDR-0.3 `925f68c4…f31e` (verified); PTM-0.3 `d1be5cdd…02442` and CURRENT_MISSION `7da945f6…9e269` consulted |
| Rubric | PRODUCT_ARCHITECTURE 1.0.0 plus its 1.2.0 extension, applied at domain-model level (navigation N/A) |
| Date | 2026-10-10 |

The judge's report follows verbatim, apart from formatting.

## 1. Hash verification and independence

The three gated inputs match the expected SHA-256 values:

| Artifact | SHA-256 | Result |
|---|---|---|
| `C:/Users/carva/Desktop/myApp/MyApp/canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md` (PTC-2.1.0) | `4d4ccb65b341efc45b88bbf5aa173bb34c2f39452e5f6b85dd3beb6b8ee6dbd1` | MATCH |
| `C:/Users/carva/Desktop/myApp/MyApp/product/PRODUCT_DOMAIN_MODEL.md` (PDM-0.3) | `9ec7fd63237e10d1484437298cb17d6fe4f2c937a1f6a3e8ee1aed79edffb4ea` | MATCH |
| `C:/Users/carva/Desktop/myApp/MyApp/product/PRODUCT_DECISION_REGISTER.md` (PDR-0.3) | `925f68c47e7db0a4e34907dcea7e44313e28347ac71cbfb6d1e9d1d87805f31e` | MATCH |

Two further files were consulted but have no expected hash:
- PTM-0.3 (traceability only): `d1be5cdd83b664cb49db671f1a42ba641ee32e7e6ef0d2deb2e3b62e89502442`
- `CURRENT_MISSION.md`: `7da945f69e524cce0ef4403bad14b5a84a48011d38173d043e02c4e9de269e69`

**Independence.**
- I am a fresh Product/UX Architect instance (constitution 1.2.0).
- I did not author or co-author the PDM, PDR, PTM, CORRECTION-01 or the Canon.
- I read only the listed inputs plus the global CORE protocol, rubric, eval format and constitution.
- Mode: independent. Rubric: PRODUCT_ARCHITECTURE 1.0.0 with its 1.2.0 extension, applied through verify-product-architecture at domain-model level. Navigation and screens are N/A.
- I wrote no files.

## 2. Structural verdict: FAIL

The verdict applies only to PDM-0.3 and PDR-0.3 at the hashes above.

- There are four blocking findings, UX-J-01 to UX-J-04.
- All four are localized Architect corrections. None needs re-architecture, a Founder decision or a doctrine change.
- No invariant is violated and there is no THESIS_CONFLICT, so no escalation trigger applies.
- Strengths to preserve:
  - Canon traceability.
  - The pillar relationship and its forbidden edges.
  - The Capacidade esportiva structure.
  - The LC/DA/RESP discipline.
  - The A1–A8 alternatives and the S1–S12 scenarios.

**Rubric results at domain level:**

| Criterion | Verdict | Basis |
|---|---|---|
| Need/outcome | PASS | |
| Canonical ownership | FAIL | UX-J-01, UX-J-03 |
| Navigation | N/A | Phase 4 |
| Domain grouping | PASS | |
| Journey | FAIL | UX-J-01, UX-J-02, UX-J-04 |
| Hierarchy | PASS | L007/L008 precedence is explicit in §1 and §7 |
| States | FAIL | UX-J-02, UX-J-04 |
| Terminology/invariants | PASS with notes | UX-J-08, UX-J-09 |
| Alternatives/proof | PASS | |
| Handoff | PASS | Lineage and open items recorded; worker self-assessment labeled in PDR §1 |

**S1. Coverage: PASS on presence.** Every item in mission §2 is present. Soundness per item:

| Item | Assessment |
|---|---|
| Actors (§2.1) | Sound |
| Modes (§2.2) | Sound; wording issues in UX-J-08 |
| Domains and boundaries (§3) | Partition sound; contract set incomplete (UX-J-01) |
| Core entities (§4) | Gaps: prescription/plan (UX-J-01), Crew Member declared intent (UX-J-03), support declaration (UX-J-07), "marcos" (UX-J-06) |
| Relationships (§5) | Gaps: UX-J-05, UX-J-08 |
| Lifecycles (§6) | Gaps: UX-J-02, UX-J-04, UX-J-10 |
| Authority (§7) | Sound |
| Permissions and information boundaries (§8) | Sound, pending Security; gaps UX-J-03, UX-J-11 |
| Cross-domain dependencies (§9) | Gap (UX-J-01) |
| Pillars and relationship (§1) | Sound: forbidden edges, I4/I5 rules, Shareability is not a pillar (C016) |
| Athlete Model, Adaptive Engine, Recovery, Nutrition Context, Training Context, Goals, Load, Schedule | Present; sound except UX-J-01(c) and UX-J-08 |
| Crew, Full Member, Crew Member | Present; gaps UX-J-03, UX-J-04 |
| C023, L023, D011 and separate sequencing (§3.1) | Sound; no sport mechanics invented; DR-45 kept separate; see UX-J-07 |
| A named concept is not automatically a launch entity | Sound |

**S2. Structural soundness: FAIL.**
- **Single owner.** Fails for:
  - the prescribed session or plan;
  - the Crew Member's declared intent.

  Unavailability can be declared in two domains. "Marcos" and the support declaration have no owner.
- **Authority.** There is no authority cycle. The loop Adequação → Continuidade → SC → Performance (through I5) carries only intent the person declared, so it is benign.
- **Decoupling (C002).**
  - The partition is coherent: Social Continuity depends only on Pessoa & Participação and I4; Shareability depends only on I6–I8.
  - However, §3 and §9 declare I1–I9 closed, while §3.1, §4, §6.4, §6.6 and §7 rely on flows no contract carries. The decoupling test in §3 therefore overstates.
- **Lifecycles.**
  - Personal continuity (§6.6) and Crew (§6.2, §6.3, §6.7) are incomplete.
  - The missing cases are combined states, departures, pause and closure.
- **Flows.** They are minimal, but not complete or explicit.

**S3. Scenarios.** Results are in the table in section 3.

**S4. Over-specification: PASS, with non-blocking findings.**
- No UI, navigation or screens are fixed (§12; labels go to phase 18).
- No sport mechanics are invented. §3.1 lists responsibilities only; mechanics go to phases 5–8 and DR-20.
- D001, D005, D009 and D011 are preserved.
- Three narrowings are non-blocking:
  - D002: a prohibition tagged [C] (UX-J-09).
  - D010: Shareability can source only from Continuidade through I7 (UX-J-06).
  - Discovery under Canon §13: "Convite: única porta" plus the FG-2 framing (UX-J-11).

**S5. PDR: FAIL for the resolutions; the Founder Gate entries are acceptable with framing fixes.**

AGENT-RESOLVABLE resolutions:
- **Sound:** DR-01, DR-06, DR-07, DR-08, DR-11, DR-12, DR-13, DR-16 and DR-42 (DR-42 together with UX-J-01b and UX-J-07). DR-10 is sound in principle but depends on UX-J-01.
- **Not sound as "Resolvido":**
  - DR-02 (UX-J-01)
  - DR-09 (UX-J-02)
  - DR-03 (UX-J-03)
- **Over-reach:** DR-05 over-tags (UX-J-09) and DR-44 over-restricts sources (UX-J-06).
- **Out of my scope:** the privacy substance of DR-04, DR-14 and DR-44 belongs to Security.

**FG-2 (Crew boundary).**
- **Necessary before phase 4?** Partly.
  - It is needed for the number of Crews per person, which shapes the information architecture.
  - It is needed for the order of size, which affects presence and re-identification.
  - Creation rights could sit in DR-33.
- **Alternatives:** distinct but not orthogonal.
- **Trade-offs:** they lean towards option A.
- **What is missing:** see UX-J-11.

**FG-3 (Social Continuity launch shape).**
- **Necessary before phase 4?** Not as a blocker.
  - O012 gives Product/UX the translation; the Founder decides only material changes of direction.
  - Deferring accepted-direction (DA) concepts is not such a change (C005, D002).
  - O011's trigger is launch readiness.
  - B and C can be added later through I5 and the DA concepts, without changing contracts.
- **Alternatives:** the options form a nested ladder. That is acceptable for depth, but they are not distinct social shapes.
- **Trade-offs:** honest.
- **Recommendation:** consistent with L022.
- **What is missing:** see UX-J-12.

**FG-4 (commercial model in scope).**
- **Necessary before phase 4?** No. The PDR itself marks it non-blocking for phases 4–6 because the DR-12 access seam already exists.
- **Alternatives:** distinct.
- **Trade-offs:** the trade-off for C is mildly biased. It attributes to deciding now a risk that §22 imposes on any commercial decision.
- **Recommendation:** A is sound.
- **What is missing:** say explicitly that A leaves the strategic part of O005 open, namely Crew Member access.

**Dependency on the pending PCG rulings.**
- **DR-43.**
  - The PDM structure works under the reading it adopted for DR-43.
  - If PCG rejects that reading, the PDR fallback "o motor ignora a atividade" contradicts the PDM's own [C] rule in §5. That rule derives Load and Trajetória from all modalities.
  - Simultaneous launch would then be the only structurally clean fallback.
- **DI-01.** The ruling needs the detail of which path reads a context-level session (UX-J-07).
- **DR-45 and DI-02.** Only two things depend on them: the owner of the support declaration and the LC confirmation.

## 3. Scenarios

| # | Scenario | Result | Note |
|---|---|---|---|
| S1 | No Crew, no device, rest | Supported | Rest is known only by self-declaration; the rule for unlogged rest is in UX-J-02 |
| S2 | Invitee joins only the Crew | Supported, with gap | Where the Crew Member's intent lives, and who sees it, is undefined (UX-J-03) |
| S3 | Intervals, rest and walk counted equally | Supported | No physical unit crosses |
| S4 | Planned session, but engine says recover | Supported | Covered by the launch-candidate commitment; Together stays DA |
| S5 | Three weeks without data, then return | Supported, with gap | The sharing step needs an active commitment (UX-J-05) |
| S6 | Someone "vanished" | Supported | Residual inference risk is Security point §8.4-2 |
| S7 | Conflicting recovery signals | Structure supported; conduct depends on DR-17 | Agree with PDM |
| S8 | Additional sport at context level | Supported, with gap | The reader of a session with no capability is unnamed (UX-J-07) |
| S9 | Four sports, one integrated decision | Supported, with gap | Owner of the prescription content is missing (UX-J-01c) |
| S10 | A C023 sport below launch depth | Depends on PCG ruling (DR-43, DI-01) | See also UX-J-07 |
| S11 | Share one's own return externally | Supported, with gap | No route for the person's own data; "Desfecho Retornar" mixes decision type and outcome (UX-J-06, UX-J-08) |
| S12 | Share a collective achievement | Supported, with Security condition | DR-40, DR-44, UX-J-10 |
| X1 | Crew Member with no engine context | Supported, with gaps | Intent owner (UX-J-03); no exit from Retornando without the engine (UX-J-02); Recovery and Nutrition cardinality (UX-J-08) |
| X2 | Engine prescribes rest during a Crew commitment | Supported | §6.7 and §6.8; the reason stays private; unlogged-rest residual (UX-J-02) |
| X3 | Same week: missing data, declared interruption and a recovery decision | Gap | See details below |
| X4 | Multi-sport person; Swimming below launch depth | Depends on PCG ruling (DR-43, DI-01) | Works under the PDM's reading; see UX-J-07. Goals that include swimming are only partly served, so honest communication is required |
| X5 | A member leaves, or the Crew closes | Gap | UX-J-04; retention is Security's (DR-14, DR-33) |
| X6 | Collective achievement of a 3-person Crew shared externally | Supported, with Security condition | UX-J-10 |

X3 details:
- Recuperando cannot transition to SemDados or to Interrompido.
- For unlogged rest, Honrada versus Desconhecida is undefined.
- The engine never learns of the declared interruption.
- See UX-J-01 and UX-J-02.

## 4. Findings

**UX-J-01 · PDM §3 (I1–I9), §3.1, §4, §6.4, §6.6, §7, §9; PDR DR-02, DR-10 · Blocking · Owner: Architect**

The PDM declares I1–I9 the "únicos pontos de contato" (§3) and states "Permitidas: somente I1–I9" (§9). Its own rules nevertheless need flows that no contract carries:
- **(a) Outcomes do not reach the engine.** The model relies on this loop in three places:
  - "o motor ... re-planeja a partir do desfecho" (§7);
  - "o ajuste é dado para o motor" (§6.4);
  - "Retornando → EmCurso: motor re-baseia" (§6.6).

  C009 also relies on "dinâmica comportamental". Yet Desfecho, the reason for an adjustment and a declared Interrupção all live in Continuidade, and there is no Continuidade → Adequação contract.
- **(b) Sport implications.** The §3.1 table says they are "entregues a Recovery e Nutrition Context". The §3.1 bullet says they travel "via I1". The PDM must state where load × recovery and training × energy availability (C006) are integrated.
- **(c) The prescription or plan has no owner.**
  - Training Context includes "treino planejado" in Performance (§4).
  - The engine "re-planeja" (§7).
  - DR-07 defines full support as "planejamento e adaptação".

  Nobody owns composing the prescribed session from a capability's workout representation, and there is no Adequação → Performance path.
- **(d) Unavailability can be declared in two places:**
  - Schedule & Disponibilidade, in Performance;
  - Interrompido, in Continuidade.

**Fix:**
- Complete the contract set or reroute the flows, keeping them private.
- Name the owner of the prescription or plan.
- Reconcile availability with interruption.

**UX-J-02 · PDM §6.6, §6.4; PDR DR-09 · Blocking · Owner: Architect**

The personal continuity state machine cannot represent combined conditions.
- Interrompido and SemDados are reachable only from EmCurso, not from Adaptando, Recuperando or Retornando.
- There is no rule for a Recuperar or Descansar decision without data (Honrada or Desconhecida). Canon §15 requires distinguishing recovery from missing data before attributing results, and L006 credits honored rest.
- Retornando → EmCurso is triggered by the engine, so a Crew Member (no engine) has no exit.

**Fix:**
- Make interruption and no-data reachable from every active state, or nest the sub-states.
- State the unlogged-rest rule, or its owner and phase, with "never failure" as the floor.
- Define how a Crew Member exits Retornando.

**UX-J-03 · PDM §2.2 (M3), §3 (Continuidade "Possui"), §4 (Desfecho), §6.7, §8.1, I3; PDR DR-03 · Blocking · Owner: Architect (Security for the boundary)**

The Crew Member's "intenção declarada" plays the role that the Decisão de Adequação plays for a Full Member, yet it has no owner.
- Continuidade's responsibility mentions intention, but its "Possui" list omits it.
- I3 carries only "comportamento real".
- §6.7 frames the intent as the person's share of a commitment, which belongs to Social Continuity.
- No row in §8.1 says whether the intent crosses to the Crew.

Under FG-2 option A, a per-commitment reading would yield one intent per Crew, creating competing sources for the same person.

**Fix:**
- Name the entity and assign it to Continuidade as a personal entity.
- Add it to I3.
- Add a row to §8.1 with the default "does not cross".

**UX-J-04 · PDM §6.2, §6.3, §6.7; DR-01 · Blocking · Owner: Architect (DR-33 and DR-14 with Security)**

Departures, pauses and closure are under-defined.
- **Pause.**
  - "Ativa: 2 ou mais participantes ativos" counts active participants, but Vínculo separates Ativo from Pausado.
  - Read literally, one pause in a 2-person Crew demotes it to "Em formação: sem compromisso ativo" and ends the commitment for the other member.
  - That contradicts "pausar ... sem penalidade" (L017) and "sem marcação de ausência".
- **Departures.** There is no transition when departures leave fewer than 2 participants.
- **Commitment fate.** What happens to the commitment on closure or demotion is undefined, including the triggers for Cancelado.
- **Last participant.** The case of the last participant leaving is undefined.

**Fix:**
- Define "participante ativo" so that paused members count.
- Make the Crew state independent of pauses.
- Add the departure transitions and the commitment's fate.

**UX-J-05 · PDM §4 (Contribuição), §5, §6.3, §8.1 (presença); S5 · Non-blocking · Owner: Architect (input to FG-3)**

Contributions exist only "no compromisso", a Crew has at most one active commitment, and "Crew sem compromisso ativo é apenas Ativa".

So between commitments a Crew has:
- no contribution;
- no presence;
- no clear container for a shared return.

Social Continuity is therefore commitment-centric by structure.

**Fix:** either allow Crew-scoped contribution and return outside a commitment, or record commitment-centricity as an explicit consequence of FG-3 option A.

**UX-J-06 · PDM §3.2, I7–I9, §6.9, §8.5; PDR DR-44 · Non-blocking · Owner: Architect (Security for projecting the person's own data)**

Shareability can source only from Continuidade (I7) and Social Continuity (I8).
- Canon §21.1 lists these as possibilities: workout result, goal reached, performance moments and multi-sport progress. All are Performance-owned and unreachable, which contradicts "formatos ... sem alterar I1–I9" (§3).
- §6.9 and S11 allow the person's own intimate data "por escolha explícita", but no route exists.
- "Marcos" and "progresso multiesporte" have no owner.
- The invite is projected externally (§8.5) but is missing from I8.

**Fix:**
- Add an explicit path for projecting the person's own data, governed by I6, or record it as a phase-4 Shareable Object Model decision.
- Assign owners to "marcos" and multi-sport progress.
- Add the invite to I8.

**UX-J-07 · PDM §3.1, §4 (Prática de modalidade, Training Context), §5; PDR DR-07, DR-43, DR-45 · Non-blocking · Owner: Architect, with PCG for DR-43 and DI-01**

- **Support level sits in the wrong place.** It sits on the person's Prática de modalidade. But L023's "declare plenamente suportada" is a product-level declaration owned by Release Scope.
- **Unnamed reading paths.**
  - Who reads a session for a modality with no capability.
  - Whether a C023 sport at context level is read by its own limited capability or by a generic path. The generic path is what §7 forbids as "tracking genérico".

**Fix:**
- Model the support declaration at catalogue level, with its owner.
- Name the context-reading path and send it to the PCG ruling.

**UX-J-08 · PDM §2.2, §3, §4, §5, §6.1, S9, S11 · Non-blocking · Owner: Architect (Security for data minimization)**

- "1 Modo vigente" (§5) conflicts with "conta sem modo ativo" (§6.1).
- "1 Recovery State · 1 Nutrition Context" per person also binds Crew Members, against data minimization (C004, §8.4-6, §27).
- "Athlete Model ... Crew Member: mínimo" conflicts with A3.
- M4 is a property of a Crew, not a participation mode.
- "N Decisões por janela" conflicts with "uma decisão integrada por janela" (S9).
- Performance is called "contexto integrado" although Recovery and Nutrition are separate domains.
- Interference is owned by Load (§4) but S9 says "a Adequação coordena interferência".
- Trajetória and Registro de Continuidade overlap.
- "Desfecho Retornar" mixes a decision type with an outcome.

**Fix:** set cardinality to 0..1 for Crew Members and align the wording.

**UX-J-09 · PDM §6.7; PDR DR-05 · Non-blocking · Owner: PCG (interpretation); Architect relabels**

The PDM states "Proibido [C]: compromisso definido por ... modalidade, lugar ou objetivo comuns".
- The bans on dose, volume and physical units are canonical (L008, L018, §11).
- Canon §14 says only that the Crew "não exige" a common sport, goal or place.

Tagging that as [C] turns a derived reading into canon and narrows D002, for example a voluntarily shared race goal.

**Fix:** relabel it as a derived reading or proposal, or narrow it to "required for participation or recognition".

**UX-J-10 · PDM §3.2, §6.9, §8.5, I8; S12 · Non-blocking · Owner: Security (DR-40, DR-44); Architect in the phase-4 Shareable Object Model**

In a 3-person Crew:
- Consent is effectively unanimous.
- The Crew's name can itself identify members.
- Asking for consent can reveal who declined and create pressure (L017, L014).

In addition:
- §6.9 has no declined, expired or revoked states.
- Sharing from a closed Crew, or by former members, is undefined.

**UX-J-11 · PDR FG-2 (also PDM §4 Convite and Consentimento) · Non-blocking for this gate; must be fixed before PRODUCT_DECISIONS_SUFFICIENT · Owner: Architect; PCG for the §13 reading**

- **Misattribution.** FG-2 lists "entrada por convite ... sem descoberta pública" as "Já fixado pelo Canon". But:
  - Canon §13 keeps "critérios de relação real, membership e descoberta" open;
  - O006 asks about real relationships;
  - PDM §4 marks Convite "[A FG-2]".

  As a result the Founder is not asked about real-relationship criteria or private discovery.
- **Option C is a bundle.** It combines a cap of 20, unlimited Crews and admin approval.
- **Option A's costs are understated:**
  - per-Crew consent and contribution;
  - cross-Crew inference;
  - a larger surface for forwarded invites;
  - friction for Crew Members, which is itself a C004 cost.
- **Consent has no Crew scope.** Option A needs one.
- **Missing for the Founder:**
  - which parameters shape the information architecture and which can be tuned later;
  - whether creation rights are strategic.

**UX-J-12 · PDR FG-3, §1, DR-11 · Non-blocking · Owner: Architect (classification); Chief (gate composition)**

FG-3 is not a necessary blocker before phase 4 (reasoning in S5).

Missing for the Founder:
- the commitment-centric consequence of option A (UX-J-05);
- the extra design scope B and C would add to this mission;
- which collective shareables each option enables;
- what is decided now versus at Release Scope.

FG-3 option A also lists "retorno", but the DR-11 launch-candidate set does not.

**Fix:** proceed with option A under O012 and keep the Founder's launch-shape decision at Release Scope. An early, non-blocking "confirm A or request expansion" is acceptable.

## 5. Limitations

- **Method.** This was a single pass, done analytically from the documents. No journey prototypes were used. I did not judge doctrine fidelity (PCG) or privacy and abuse sufficiency (Security). UX-J-08 and UX-J-10 only flag the structural hooks for those reviews.
- **Pending rulings.** The S10 and X4 results assume the PDM's DR-43 reading. A PCG ruling, or DI-01 to DI-07, may change them.
- **Files not read.** I did not read the ledger, `canon/CANONICAL_INDEX.md`, the audits or `AGENTS.md`. The PDR's note that the index still lists 2.0.0 is unverified.
- **Gate record.** The PDM header names only PCG and Security as judges. It should record this structural review in its next revision.
- **Validity.** A new revision invalidates this verdict. No approval or VISUAL_READY is issued; the Chief consolidates DOMAIN_MODEL_APPROVED.

**Next action.**
1. Architect: issue PDM-0.4 and PDR-0.4 that fix UX-J-01 to UX-J-04, and preferably UX-J-05 to UX-J-08, UX-J-11 and UX-J-12 in the same pass.
2. PCG: take UX-J-09 and the DR-43 dependency in UX-J-07.
3. Security: take UX-J-10 together with DR-40 and DR-44.
4. Independent re-review: cover the changed sections plus X1, X3, X5 and S9.

---

# Delta re-review on PDM-0.4 / PDR-0.4 (2026-10-10, same judge instance)

| Field | Value |
| --- | --- |
| Verdict | **Structural PASS** for PDM-0.4 / PDR-0.4 (`20e9e630…cdedc` / `18be6924…3cf93`; Canon `4d4ccb65…` unchanged; PTM-0.4 hash only) |
| Route | resumed instance, observed claude-opus-5-5 / max; 0 file writes |
| Rubric | Ownership PASS · Journey PASS · States PASS · Terminology/invariants PASS with notes · Alternatives PASS (A9, A10) · Handoff PASS |
| Resolutions | UX-J-01 to UX-J-04 RESOLVED. UX-J-05 to UX-J-12 ACCEPTABLE |
| UX-J-09 divergence | Accepted. PCG owns doctrine interpretation; the physical-unit goal ban is LD from §11, L008, L018 and L019 combined; the ban stays in force (§6.7, §8.5, A4) |
| Scenarios | S1, S5, S9, X1, X3 and X5 supported. S4 and X2 supported with a condition (UX-J2-02). S7 structure supported; concrete conduct blocked by DR-17. S10/X4 supported under R-DR-43 (interim LD; DI-01) |
| FG readiness | **FG-3 READY_TO_PRESENT.** **FG-2 ready after two text fixes:** (1) 4(a) is coherent only with 5(a); (2) state the costs of recommended values 2(a), 3(a) and 4(b). **FG-4** is not part of the Phase 3 gate; it needs one added sentence: choosing B or C reopens Phases 4–5 for commercial entry points |

## New findings (all non-blocking)

- **UX-J2-01** · PDM §6.4, I2, I3, §3.1 · Architect, Phase 5 with DR-20. The adherence criterion has no owner. Continuidade should classify Honrada vs Ajustada using a per-capability adherence criterion carried with the prescribed session. It must cover partial completion and multi-session windows, and never favor volume.
- **UX-J2-02** · PDM §8.1 "Fonte da Contribuição", §6.4, §6.8 · Architect (text), PCG (scope of R-DR-10), Security (SEC-J-02, SEC-J-07). Fix in the next revision, at the latest before the Phase 5 eligibility rules. "Same meaning for any source" makes a deviation to more volume equal to honoring, which R-DR-10 rejects. Fix: same meaning only among eligible sources; a deviation to more volume is ineligible or weighted strictly below; period granularity applies.
- **UX-J2-03** · PDM §4, §5, §8.3 · Architect and Security (DR-14). Return contributions made outside a commitment need a bounded retention window and the exit rule. Same issue as SEC-J2-04.
- **UX-J2-04** · PDM §8.2 · Architect. Crew creation must be a person-level permission under FG-2 parameter 3, otherwise an M1 member could never create a first Crew.
- **UX-J2-05** · PDM §3.1, I1, §4 · Architect (PCG aware). At context level a capability delivers load and implications only. No Decision may prescribe a session in that sport (R-DR-43 condition 1).
- **UX-J2-06** · PDM §5, §6.6 · Architect and Security. (a) Crew Member Recovery and Nutrition data has no consumer: set it to 0 or name a purpose (D-CHIEF-03). (b) For a Crew Member, "falta de dados" should be defined against the Intenção declarada.
- **UX-J2-07** · PDM §4, §6.2, §6.6 · Architect (Phase 4), UI & Experience (labels, Phase 18). State explicitly that Interrupção and a paused membership are independent. Route two questions: whether declaring an interruption may offer to pause memberships without exposure, and how both are labelled.

Limitations: single delta pass; unchanged sections reviewed only where scenarios needed them. Doctrine conformity (PCG), SEC-J substance, and the Chief-composed platform/market entry were not judged. Walkthroughs are analytical.

---

# Delta re-review on PDM-0.5 / PDR-0.5 against Canon 2.2.0 (2026-10-11, same judge instance)

| Field | Value |
| --- | --- |
| Verdict | **Structural PASS** for PDM-0.5 `6a5ace35…23a3` and PDR-0.5 `dec6fab3…5498` (Canon 2.2.0 `5c780fdc…`; PTM-0.5 hash only) |
| Route | resumed instance, claude-opus-5-5 / max; 0 file writes. Interrupted by HTTP 429 at about 22:00; resumed 09:45 |
| Resolutions | UX-J2-01 to UX-J2-07 RESOLVED. For UX-J2-07 the independence rule is correct and the offer is deferred to CPB-10 |
| Judgment calls | (a) deviation to more volume is ineligible: ACCEPT with condition UX-J3-04. (b) creation right for people with no active mode: ACCEPT with condition UX-J3-01(a). (c) catalog state "não declarada (só contexto do motor)", no third state: ACCEPT. (d) I10 secondary purpose behind its own off-by-default consent: ACCEPT with condition UX-J3-03 |
| Founder decisions in the model | Structurally sound. Package A/C025: person-level rights, cap counting Ativo and Pausado, creator as first participant, Crew starting Em formação. BR / PT-BR + EN: no locked text or format. iOS + Android: smartphone, watches only as data sources. 18+: verified on all three entry paths; a failed check exposes no reason |
| Scenarios | X7, X8, X9, X10, X11, X1, X5 and S9 supported, with residuals noted |
| Scope | The 2026-10-11 hybrid-experience decision is out of scope |

## New findings (all non-blocking)
- **UX-J3-01** · PDM §5, §6.1, §6.2, §8.1 · Architect (Security for b). (a) Creating a Crew must carry the same Crew-scoped informed consent as accepting an invite (mechanics in CPB-03). (b) Leaving the personal experience needs a disposition rule: Full Member → Crew Member, or a Full Member with no Crew leaving (missing from §6.1). The Athlete Model, Recovery State, Nutrition Context, Plano and I10 secondary data are eliminated or retained only under the privacy contract; the Registro de Continuidade is kept; durations go to CPB-08 and Phase 22.
- **UX-J3-02** · PDR §10 · Architect and Chief. §10 complements mission §4 and is not the full architecture scope. Cover DR-31 (Recovery representation and surfaces), DR-32 (entry, cold start, progressive context capture), DR-34 (Crew Member ↔ Full Member evolution and access), PDM §6.7 (joining or leaving a commitment mid-period) and the PDM §2.3 surfaces pointer. Add negative cases:
  - CPB-02: an acceptance pending when the inviter leaves, is removed or pauses; an invite to a full Crew;
  - CPB-07: an invitee at the 3-Crew cap, which the inviter must not be able to tell;
  - CPB-11: age failure indistinguishable from decline or expiry; data and contact discarded; Crew Member entry kept light (C004);
  - CPB-04: what happens when the creator leaves, if DR-33 gives the creator any power.
- **UX-J3-03** · PDM I10, I6, §8.3, A11 · Architect with Security; Phase 5 and Phase 22. Give I10's primary purpose an operational boundary, for example: recent outcomes used for the current Plano are primary; longitudinal patterns are secondary.
- **UX-J3-04** · PDM §3.1, §6.4, X10 · Architect; Phase 5 with DR-20. The adherence criterion needs a tolerance band, so that a marginal excess on an Executar day does not withhold recognition.
- **UX-J3-05** · PDM I9 · Architect (wording). Rephrase "O único caminho de entrada vindo de fora é o aceite de convite" as "o único caminho de entrada a partir de um objeto projetado", so it doesn't contradict direct adoption (M1) or entry by creating a Crew.

Limitations: single delta pass. Canon 2.2.0 was read in full but not byte-diffed against 2.1.0. PTM was checked by hash only. Doctrine (PCG) and the substance of Security conditions were not judged. Walkthroughs are analytical.
