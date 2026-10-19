# SEC-J — Security judge: domain-model information boundaries

| Field | Value |
| --- | --- |
| Gate component | DOMAIN_MODEL_APPROVED, trust/privacy boundary scope (conceptual, pre-implementation) |
| Verdict | **SECURITY_READY_WITH_CONDITIONS** |
| Judge | Fresh native security-privacy-abuse-architect subagent ("Security judge: PDM info boundaries"), dispatched by Claude Chief session 07efc0a5-e1c7-44ef-828e-cbc759fc6a51 |
| Route | requested claude-opus-5-5 / high (work_kind material_other, L3); observed claude-opus-5-5 / high; 0 file writes |
| Inputs | PTC-2.1.0 `4d4ccb65…6dbd1`; PDM-0.3 `9ec7fd63…b4ea`; PDR-0.3 `925f68c4…f31e` (all verified by judge) |
| Date | 2026-10-10 |
| Invalidation | A material change to PDM §3 (I4–I9), §6.2, §6.9 or §8, or a decision on FG-2, FG-3, DR-30, DR-33 or DR-38, invalidates the affected parts of this gate |

The judge's report follows verbatim, apart from formatting.

## 1. Hash verification and independence

- Canon `canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md` (VILUMO-PTC-2.1.0): `4d4ccb65…6dbd1`, matches.
- PDM `product/PRODUCT_DOMAIN_MODEL.md` (PDM-0.3): `9ec7fd63…b4ea`, matches.
- PDR `product/PRODUCT_DECISION_REGISTER.md` (PDR-0.3): `925f68c4…1f6a3e8ee1aed79edffb4ea`, matches.
- **Independence.** I am a fresh judge instance. I did not write the Canon, the PDM or the PDR. I read only the three listed files, my constitution, the SECURITY rubric and CORE. I wrote nothing. This gate covers only these three versions and the boundary scope of PDM §2, §3 (I4–I9), §6.2, §6.3, §6.6, §6.9 and §8.

## 2. Verdict

**SECURITY_READY_WITH_CONDITIONS** for the domain-model boundary scope.

The structure holds:
- The social side reads only through I4, a minimal consented projection.
- Shareability holds no source data (I7, I8, I9).
- Consent is its own entity, scoped by purpose and destination.
- The PDM forbids absence alerts, presence and "last seen", confidence or verification crossing to the Crew, and projection by default.
- A Crew Member is never evaluated by the engine.

I found no boundary defect that needs REQUEST_CHANGES now. The gaps are underspecified rules, not wrong boundaries.

**SEC-J-03, SEC-J-05 and SEC-J-10 must be closed before Phase 4 architecture is approved.** Under the rubric, an open critical condition blocks the stage that depends on it. These conditions are not READY in full.

## 3. Threats and abuse

| Asset / actor | Boundary | Threat | Mitigation in the PDM | Residual risk |
|---|---|---|---|---|
| Participant's minimal Contribution | Person → Crew (I4) | Consent at join is bundled, so the person can't refuse the minimal projection and stay active | §8.1 (informed consent at acceptance), §6.2 (pause and leave without penalty), categories are opt-in | Medium. Who can see contributions changes as new participants join; the PDM doesn't say whether newcomers see history (SEC-J-01) |
| Absence pattern | Crew view | In a Crew of 2–8, a missing contribution reads as absence. A partner or peer can track it. | §6.2, §8.1, §8.2 (no absence marker, alerts, real-time status or "last seen"; pause shows no reason); S6 | **Missing:** granularity, "who hasn't contributed" views, and nudges that cite peers (SEC-J-02) |
| Engine compliance / mode | I4 semantics | Contribution eligibility (Phase 5) leaks whether the engine decision was honored or adjusted, the data source, or Full vs Crew Member | §8.1 (confidence and verification don't cross); §6.4 defers eligibility | **Missing:** Contribution meaning must not depend on its source; mode isn't listed in §8.1 (SEC-J-07) |
| Person resting appropriately | Collective progress | Peer pressure against rest, or a collective goal that "fails" because of one identifiable person (L008, L017) | §6.7 (no volume or dose), §6.8, S3; O008 deferred | **Missing:** a rule against all-or-nothing goals and subtraction attacks (SEC-J-08) |
| Crew access | Invite → membership | A forwarded or externally posted invite becomes a bearer token. A stranger joins, or an ex-partner gets back in. | §6.2 (Convidado sees nothing), §8.2 (no access without an accepted invite); DR-33 and FG-2 open | **High.** Holding an invite is not yet distinct from being a member (SEC-J-03) |
| Invitee / third-party contacts | Acquisition (C003) | Address-book harvesting, or keeping the invitee's contact after a decline or expiry | Not addressed | Medium (SEC-J-03) |
| Ex-member / removed member | Post-exit access | An ex-member keeps access to Crew history, or comes back without the others agreeing. A victim is trapped with an abuser because the only exit is leaving. | §6.2 ("Saiu: nada novo"); removal is DR-33, open | Medium (SEC-J-04) |
| Ex-member's contributions | Retention (DR-14, §8.3) | "Deixam de identificá-la" doesn't work in a small Crew: the remaining members know who was there | §8.3 (proposal) | **Defect in the proposed rule** (SEC-J-05) |
| Support messages | Crew channel (DR-30) | Free text used for harassment, coercion, "why didn't you train?", or exposing third parties | DR-30 says free text needs a Security review; §8.2 forbids demanding justification | High if free text is adopted; there is no moderator or reporting actor (§2.1) (SEC-J-06) |
| Crew Member self-declaration | M3 → Continuidade → Crew | Over-collection, or health and reasons disclosed in free text | §2.2, I3 (no evaluation), C004 low friction | Low–medium (SEC-J-07) |
| Collective shareable | Crew → external (I8, I9) | In a Crew of ≤8, an aggregate is reidentifiable. Consent requests turn into peer pressure. A refusal, or a "4 of 5", reveals who didn't take part. | §3.2 and §8.5 (consent of identifiable members; aggregation alone isn't enough; non-contributors not revealed) | Medium (SEC-J-10; DI-05) |
| External copy | Product → destination (I9) | Copies can't be recalled. Live links, metadata or referral IDs leak identity or Crew membership. Viewers are tracked. | §6.9 (informed beforehand; future projections revocable), I9 | Medium (SEC-J-11) |
| Invite as a shareable | Crew → external | The Crew name or the inviter reveals membership. A landing page reveals the roster. | §8.5 (only the Crew name and the inviter) | Medium. The Crew name is collective identity (I8) (SEC-J-12) |
| Multi-Crew person | Crew ↔ Crew (FG-2 A) | Overlapping members correlate the person across Crews; other Crew memberships become visible | Not addressed | Low–medium (SEC-J-13) |
| Health-adjacent personal data | Product / regulatory | Recovery, Nutrition and body composition are likely sensitive data under law; deletion and rights are deferred | §6.1 (account deletion → Phase 22), §8.2 (no over-collection) | Not assessed (SEC-J-14) |

## 4. Conditions and findings

All of the following are non-blocking for DOMAIN_MODEL_APPROVED. **SEC-J-03, SEC-J-05 and SEC-J-10 must close before Phase 4 architecture approval.**

**SEC-J-01 · Consent at join is an acceptable basis, with constraints (§8.4 point 1)**
- Owner: Product/UX Architect. Trigger: Phase 4.
- The disclosure at join must state exactly what crosses: display name, minimal Contribution and pause state.
- It must state the audience, including future joiners.
- It must state the granularity.
- Consent is per Crew. Categories stay as separate opt-ins, per Crew.
- Pause stays a full alternative that costs nothing.
- Consent is presented again whenever the scope of what crosses grows.
- New participants do not see contributions made before they joined.
- Evidence to close: the Phase 4 consent and audience model, plus the Phase 8 disclosure states.

**SEC-J-02 · Absence inference (point 2)**
- Owner: Product/UX Architect. Trigger: Phase 6.
- No per-person, per-day grid.
- Default granularity is the commitment period, with no visible timestamps or day of week.
- No "pending" or "not yet" lists, and no ordering by contribution count.
- No nudge or notification may mention another named participant's status or the group's dependence on someone (for example, "3 of 4 have done their part").
- Evidence to close: Core Flows and states, plus a Security walk-through of S6 extended to a two-person partner Crew.

**SEC-J-03 · Holding an invite is not membership (point 3)**
- Owner: Product/UX Architect, within DR-33 and FG-2. Trigger: Phase 4.
- An invite is addressed to one person, expires, can be revoked and has bounded uses.
- A forwarded or projected invite never grants access without confirmation by the inviter or by the Crew rule (DR-33).
- No address-book ingestion.
- The invitee's contact data is used only to deliver the invite and is dropped on decline or expiry.
- Existing participants are told when someone new joins.
- Evidence to close: the invite lifecycle in Phase 4, with negative cases: a stranger uses a forwarded link; a removed or ex-member is re-invited.

**SEC-J-04 · Exit, removal and ex-members**
- Owner: Product/UX Architect, with Security review. Trigger: Phase 4.
- Leaving or being removed revokes all access to Crew content at once, including history.
- Re-entry happens only through a new invite under SEC-J-03.
- A removal mechanism exists, so nobody is trapped with an abuser. It shows no reason and makes no announcement beyond the list changing.
- A person can mute Apoio from a specific participant without leaving.
- Closing a Crew does not expose anyone's individual history.
- Evidence to close: DR-33 rules with abuse cases.

**SEC-J-05 · Retention after leaving or closure (DR-14, point 4)**
- Owner: Product/UX Architect (rule, Phase 4); Engineering with Security (durations and deletion proof, Phase 22). Trigger: Phase 4.
- Replace "deixam de identificá-la" in §8.3.
- On exit, the person's Contributions and Apoios are deleted or reduced to a Crew-level fact (for example, "compromisso concluído"). No count, position or composition may remain from which their participation can be derived.
- The ex-member is excluded from future collective shareables unless they consent again.
- Their own personal Continuidade record is unaffected.
- When a Crew closes, per-person social data is eliminated after a bounded period.
- Evidence to close: the amended rule, then a Phase 22 retention and deletion spec with verified deletion.

**SEC-J-06 · Support text (DR-30, point 5)**
- Owner: Product/UX Architect. If moderation capacity is needed, the Founder decides. Trigger: Phase 4.
- Security recommends structured gestures at launch.
- Free text only with all of the following:
  - block and mute;
  - a reporting path, plus a named owner for abuse response (no such actor exists today);
  - no prompts asking for reasons;
  - the text never feeds shareables, external projection, the engine or profiling (O007);
  - bounded retention.
- Evidence to close: the DR-30 decision record, plus a Security review if free text is chosen.

**SEC-J-07 · Minimal self-declaration and source-independent meaning (point 6)**
- Owner: Product/UX Architect. Trigger: Phase 6.
- Crew Member self-declaration is structured: intention and outcome category only. No health, location or free-text reason crosses to the Crew.
- The Contribution reads the same to the Crew whatever its source: engine-honored, adjusted or self-declared.
- Add explicit §8.1 rows: participation mode and capability access do not cross.
- Evidence to close: the Phase 5–6 eligibility rule, checked against this condition.

**SEC-J-08 · Collective progress without attributable pressure (L008, L017)**
- Owner: Product/UX Architect, with O008. Trigger: Phase 6.
- No all-or-nothing collective outcome in which one identifiable person's missing contribution visibly causes a failure.
- No per-member totals that let someone find non-contributors by subtraction.
- Evidence to close: the collective progress design (DR-06), walked through with S3 and a case where one member rests.

**SEC-J-09 · Shared-device and coercive-control assumptions**
- Owner: Security. Trigger: Phase 22.
- Account and session isolation on shared devices, and quick-exit or pause paths, are out of conceptual scope and must be threat-modeled.
- Evidence to close: the Phase 22 threat model.

**SEC-J-10 · Collective shareables in small Crews (point 7; DI-05)**
- Owner: Product/UX Architect (DR-38 Shareable Object Model). Doctrine is PCG's, through the Chief. Trigger: Phase 4.
- In a Crew of ≤8, treat every collective object as personal data of each identifiable member. In practice the aggregate path is not available.
- Consent is individual, per purpose and per destination, and off by default. Never by group vote. Never given by the sharer on someone else's behalf.
- Prefer a standing preference over a request for each object, to reduce pressure.
- A refusal is silent: the requester is not told who refused. The object then degrades to a form that doesn't reveal its composition (no "4 of 5").
- Any member's revocation stops future projections by everyone.
- **Security position on DI-05, for PCG to decide:** an identifiable member's own per-purpose consent to be shown is not "reidentification". No member's consent can authorize revealing another member's data or non-participation.
- Evidence to close: the DR-38 object model, with a consent and refusal walk-through for a two-person and a five-person Crew.

**SEC-J-11 · External projection mechanics (point 8)**
- Owner: Product/UX Architect (Phase 4 model choice); Engineering (Phase 22 verification). Trigger: Phase 4.
- Projections are static snapshots, with no live link that resolves to internal data.
- If a link or landing page exists, it is revocable, not enumerable, and carries nothing beyond the object.
- Referral or attribution identifiers reveal no identity, Crew or membership, and viewers are not tracked.
- Location and timestamp metadata is stripped.
- The person is told before projecting that the copy can't be recalled.
- Evidence to close: the DR-38 projection model, plus a Phase 22 metadata and link test.

**SEC-J-12 · Invite as a shareable (point 9)**
- Owner: Product/UX Architect (DR-33, DR-40). Trigger: Phase 4.
- An external invite carries no participant names, photos, member count or contributions.
- The Crew name appears only under a Crew-level consent for external identity (I8).
- Accepting through it always goes through SEC-J-03 confirmation.
- Evidence to close: the invite object in DR-38.

**SEC-J-13 · Multiple Crews per person (if FG-2 option A)**
- Owner: Product/UX Architect. Trigger: Phase 4, after FG-2.
- Consent and Contribution are separate for each Crew.
- A person's other Crew memberships are never visible to any Crew.
- Evidence to close: the Phase 4 topology.

**SEC-J-14 · Regulatory classification and data-subject rights**
- Owner: Founder, who obtains competent legal input, with Security. Trigger: Phase 4 for classification; controls come in Phase 22.
- Classify the health-adjacent data (Recovery, Nutrition, body composition) and its legal basis.
- Cover export and deletion rights, and account deletion (§6.1).
- Evidence to close: a classification memo that feeds the Consentimento entity.

**SEC-J-15 · Required negative verification**
- Owner: Security, with Engineering. Trigger: Phase 22, with scenarios drafted in Phase 6.
- Server-side authorization. A permission enforced only in the frontend is a FAIL.
- Tests: cross-Crew denial, ex-member and removed-member denial, a forwarded invite used by a stranger, consent revocation reaching future projections, rate limits on invites and Apoio, and the partner-surveillance and peer-nudge scenarios.
- Evidence to close: the executed test evidence.

## 5. Limitations

- This is a conceptual, pre-implementation review. No control, data store, flow or UI exists, so nothing was verified as implemented. Threats are judged against PDM rules only.
- Durations, the regulatory basis, operator and internal access, and account security are out of scope or deferred.
- FG-2, FG-3, DR-30, DR-33 and DR-38 are open. Each one, when decided, may raise new boundaries and invalidate this gate for the parts it affects.
- I did not resolve DI-05; that is doctrine for PCG.
- This gate applies only to PTC-2.1.0, PDM-0.3 and PDR-0.3 at the hashes above. A material change to PDM §3 (I4–I9), §6.2, §6.9 or §8 invalidates it.
- Files read (no files were written):
  - C:/Users/carva/Desktop/myApp/MyApp/canon/VILUMO_FIT_PRODUCT_THESIS_CONTRACT.md
  - C:/Users/carva/Desktop/myApp/MyApp/product/PRODUCT_DOMAIN_MODEL.md
  - C:/Users/carva/Desktop/myApp/MyApp/product/PRODUCT_DECISION_REGISTER.md

---

# Delta re-review on PDM-0.4 / PDR-0.4 (2026-10-10, same judge instance)

| Field | Value |
| --- | --- |
| Verdict | **SECURITY_READY_WITH_CONDITIONS** for the PDM-0.4 boundary scope. Nothing blocking |
| Inputs | PDM-0.4 `20e9e630…cdedc`; PDR-0.4 `18be6924…3cf93`; Canon `4d4ccb65…6dbd1` (verified) |
| Route | resumed instance, observed claude-opus-5-5 / high; 0 file writes |
| Point results | 1 SEC-J-05 retention rule: PASS (also resolves PCG-J-12). 2 SEC-J-07 §8.1 rows: PASS. 3 Boundary impact: I10 personal and private PASS (condition SEC-J2-02); no default exposure added; I9 one-way mostly PASS (SEC-J2-05); "Intenção declarada" does not cross: PASS; paused members counting: PASS (extension SEC-J2-06); §6.2/§6.3/§8.2 PASS. 4 Structural defaults adequate; shareable-state defect SEC-J2-03 closes with SEC-J-10. 5 PDR §7 carried conditions accurate; editorial inconsistency SEC-J2-09. 6 D-CHIEF-03 adequate as interim baseline, with gaps SEC-J2-08 |
| Validity | PDM-0.4, PDR-0.4 and PTC-2.1.0 only. A material change to I4, I6–I10, §6.2, §6.3, §6.9 or §8 invalidates it |

## New findings (all non-blocking)

| ID | Finding | Owner | Trigger |
| --- | --- | --- | --- |
| SEC-J2-01 | I7 from Performance: define what Performance projects, as opposed to raw Performance. Exclude by default route or location, precise timestamps, body weight, engine justification text and I10 reasons. Include any of them only by explicit choice, with route privacy. | Product/UX Architect (DR-38) | Phase 4 |
| SEC-J2-02 | I10 secondary use (C009 "dinâmica comportamental") needs its own per-purpose consent through I6. Reasons must not feed SSP or SPG without O007. Retention of reasons is bounded. | Product/UX Architect, with Security | Phase 4 |
| SEC-J2-03 | The requester sees one outcome that does not distinguish declined from expired. Limit recomposition and re-requests so a differencing attack can't reveal who refused. Prefer a standing-preference model. | Product/UX Architect (DR-38) | Phase 4. Closes with SEC-J-10, before PRODUCT_ARCHITECTURE_APPROVED |
| SEC-J2-04 | Give return Contributions made outside a commitment, and their Apoios, a bounded lifecycle. The §8.3 exit rule applies to them. | Product/UX Architect (rule); Engineering (durations) | Phase 4; durations Phase 22 |
| SEC-J2-05 | I9: no conversion or attribution feedback. Invite acceptance is the only inbound path, and it goes through SEC-J-03 confirmation. | Product/UX Architect | Phase 4 |
| SEC-J2-06 | SEC-J-02 also covers the pause state (no pause time, history or frequency shown). Sharing a return is chosen per Crew, never broadcast to all of a person's Crews. | Product/UX Architect | Phase 6 |
| SEC-J2-07 | The opt-in outcome categories offered must not reveal mode (for example, "adaptação" offered only to Full Members). | Product/UX Architect | Phase 6 |
| SEC-J2-08 | D-CHIEF-03 gaps: handling of minors or age; data-subject rights as Phase 4 architecture requirements; any legal finding that affects architecture must arrive before PRODUCT_ARCHITECTURE_APPROVED, or that approval is reopened. | Founder (memo); Product/UX Architect (rights in architecture) | Phase 4 |
| SEC-J2-09 | Make PDM §8.4 agree with PDR §7 and PDM §12 on which conditions close before PRODUCT_ARCHITECTURE_APPROVED. Editorial. | Product/UX Architect | Next PDM revision |
| SEC-J2-10 | A DA object entering I8 (Moments, Season recap, Crew Memory) requires a Security review when it enters, consistent with DR-36 and DR-37. | Product/UX Architect | When a DA object enters (Phase 4 if FG-3 B or C) |

Limitations: delta-only, single pass, conceptual; no controls verified. DI-05 remains with PCG. The judge checked the PDR §7 carry against its original report, not against this file.

---

# Delta re-review on PDM-0.5 / PDR-0.5 under PTC-2.2.0 (2026-10-11, same judge instance)

| Field | Value |
| --- | --- |
| Verdict | **SECURITY_READY_WITH_CONDITIONS** for the PDM-0.5 boundary scope under PTC-2.2.0 |
| Inputs | Canon 2.2.0 `5c780fdc…35601`; PDM-0.5 `6a5ace35…223a3`; PDR-0.5 `dec6fab3…25498` (verified after resume) |
| Route | resumed instance, claude-opus-5-5 / high; 0 file writes. Interrupted by the HTTP 429 session limit at about 22:00; resumed 09:45 |
| Scope | PDR §7, §10 and §11; PDM §2.3, §3 (I1–I10), §4–§6.3, §6.6, §6.9, §7, §8, §9, A11 and X7–X11; Canon C021 reading, C025 and the §31 rows. The Founder's 2026-10-11 hybrid-agent decision is excluded and needs its own Security review with PDM-0.6 |
| Resolutions | SEC-J2-02 PASS (derived-artifact residual SEC-J3-07). SEC-J2-04 PASS. SEC-J2-05 PASS, with a carve-out needed (SEC-J3-01). SEC-J2-06 PASS. SEC-J2-07 PASS. SEC-J2-09 PASS. SEC-J2-08 (minors) PASS through the 18+ scope; age verification is a new boundary (SEC-J3-02); the rights part is deferred to CPB-08 |
| 2.2.0 sync | Aligned with the C021 reading and C025; make the data scope explicit in consent (SEC-J3-08). Package A adds no default exposure. Leaks to close: the cap leak (SEC-J3-01) and overlapping-member inference (SEC-J3-09). The carried conditions SEC-J-01 to 15 and SEC-J2-01 to 10 are still accurate |
| CP-B deferrals | Correctly recorded (CPB-01, 02, 03, 04, 05, 06, 07, 08, 09, 11). Gap: CPB-07 needs a Security review (SEC-J3-09) |
| Validity | PTC-2.2.0, PDM-0.5 and PDR-0.5 only. A material change to I4, I6–I10, §2.3, §6.1–§6.3, §6.9 or §8 invalidates it |

## New findings (all non-blocking)

| ID | Finding | Owner | Trigger |
| --- | --- | --- | --- |
| SEC-J3-01 | **Invite outcome states.** The inviter sees only pending, accepted, or "not accepted / expired". Age-verification failure, the invitee's 3-Crew cap and an explicit decline must look the same. I9 names the C025 confirmation as its one exception: the inviter sees only what is needed to confirm the pending person. | Product/UX (CPB-02, CPB-07, CPB-11), with Security | Phase 4 CP-B; closes with SEC-J-03 before PRODUCT_ARCHITECTURE_APPROVED |
| SEC-J3-02 | **Age-verification minimization.** Keep only the outcome ("adult: yes") and a minimal audit fact. Don't keep documents, date of birth or biometrics beyond what the chosen method strictly needs. A failed verification leaves no stored profile. A third-party verifier is a new trust boundary and needs Security review when the method is chosen. | Product/UX, with Security (CPB-11); controls by Engineering | Phase 4 CP-B; controls Phase 22 |
| SEC-J3-03 | **Invite harassment.** An invitee can decline and block further invites from a given person, across every Crew that person creates; the sender is not told about the block. Cap pending invites per person and rate-limit invites. Feeds SEC-J-15. | Product/UX (CPB-02, CPB-07) | Phase 4 CP-B |
| SEC-J3-04 | **Integrations.** Explicit consent per source and per data type (D-CHIEF-03), with the smallest platform scopes. Disconnecting stops ingestion and has a defined retention for data already ingested. Inbound data is untrusted: it carries confidence (C012) and stays under the Safety Policy. No write-back or outbound sharing to a platform without separate consent. | Engineering, with Security; consent architecture by Product/UX | Phase 4 CP-B (consent architecture); Phase 22 (DR-13 integration strategy) |
| SEC-J3-05 | **Phone surfaces.** Notifications, lock-screen content and widgets never show Crew content, other people's status or sensitive data by default. This extends SEC-J-09 (shared device, coercive control). | Product/UX, with Security | Phase 8 UX Spec; threat model Phase 22 |
| SEC-J3-06 | **Bilingual consent parity.** Consent and disclosure texts have the same scope in PT-BR and EN, and the consent record keeps the language and text version. | Product/UX | Phase 8 |
| SEC-J3-07 | **Revoking the I10 secondary purpose.** Revocation stops the use and removes, or stops using, whatever was derived under that purpose. | Product/UX (rule, in CPB-08); Engineering (proof) | Phase 4 CP-B; Phase 22 |
| SEC-J3-08 | **C021 data scope.** Collective-object consent states which data of the member is shown, as well as purpose and destination. The object can't reveal unconsented data of that member, even by inference. | Product/UX (CPB-01) | Phase 4 CP-B; closes with SEC-J-10 before PRODUCT_ARCHITECTURE_APPROVED |
| SEC-J3-09 | **Multi-Crew overlap.** Add Security review to CPB-07. The walk-through of a person in 3 Crews with shared members covers what overlapping members can infer from per-Crew states, and the cap leak in SEC-J3-01. | Product/UX, with Security (CPB-07) | Phase 4 CP-B |

Limitations: conceptual, single-pass delta; no controls verified. The judge did not read the Founder decisions file or the earlier audit reports; Founder decisions were taken from PDM §2.3 and PDR §10 as written.
