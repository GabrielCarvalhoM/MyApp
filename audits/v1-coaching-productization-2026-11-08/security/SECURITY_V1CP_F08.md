# Security, Privacy & Abuse: F08 inputs (SECURITY_V1CP_F08 r1, 2026-11-08)

- **Reviewer:** an independent `security-privacy-abuse-architect` instance (not an author of the design, no delegation). Opus 5.5, high effort, L3, design level only.
- **Reviewed:** `DESIGN_V1CP.md` r1 (sha256 `7ac633c4…2b41`), Block 2 "Inputs" and "Security questions".
- **Baseline read** (runtime line numbers and hashes as of commit `4584a77`; another author's uncommitted Block 1 edits in the working tree were not reviewed):
  - `CoachingCore/src/r6-adaptation.mjs` (`8a5cfb5c…`), lines 18, 731–759 and 892;
  - `CoachingCore/src/r6-intake.mjs` (`8becd1c6…`), lines 25–34;
  - `CoachingCore/src/r6-clinical.mjs` (`51449486…`), line 147;
  - Founder D2;
  - the PDR G07 row and DR-108/109/110/111/114/121/129/132/133;
  - UXS ONB-05/11/15, SURF-13, FLOW-15, DEG-23, AG-12, RUN-08, SHR-08 and CTN-08.
- **Machine-readable twin:** `SECURITY_V1CP_F08.json`. The condition ids there are the ones the integration contract cites.

## Verdict

**SECURITY_READY_WITH_CONDITIONS.** This covers the input design as amended by the dispositions below. Two draft fields are dropped (SEC-V1CP-04 and SEC-V1CP-05).

- **Not a runtime approval.** Nothing is implemented, so the BEFORE_EXPOSURE conditions need evidence on the implementation, and Security re-verifies it then (SEC-V1CP-25).
- **What invalidates this verdict:** any change to the inputs, the purposes, who can read the record, or an outbound surface.

## Field dispositions

| Field | Disposition | Conditions (SEC-V1CP-) |
|---|---|---|
| `wellbeing.condition` | **KEEP.** A self-reported category, not a diagnosis. No subtypes, named illness, symptom or medication, and the app never shows a diagnostic label. | 01, 02, 21 |
| `wellbeing.scope` | **KEEP.** UPPER/LOWER is the finest body granularity allowed: no joint, side or site. | 02 |
| `wellbeing.redFlags` (7) | **KEEP.** The safety routing consumes them. Each starts unanswered and is actively answered; declining means ASK, never no. | 01, 02, 03, 13, 21 |
| Eligibility flags (baseline) | **KEEP**, unchanged, under the same no-prefill rule. | 03 |
| `wellbeing.intent`, window, `returnSpeed` | **KEEP.** Training preferences and dates; health data by association with the episode. | 01 |
| `text` (Situation 1) | **DROP.** The structured fields and red flags already cover every consumer. Free text invites diagnoses, medication and third parties' health for no added decision. Re-entry only if the SSCTR shows a red-flag consumer the booleans miss. | 05 |
| `episodeId` | **KEEP.** Opaque and non-semantic, with ownership checked on the server. | 19, 22 |
| `declaredRecovered` | **KEEP** as the athlete's own declaration, never a clearance. | 21, 22 |
| Per-sport `ready` and `restrictions` | **KEEP.** Closed functional vocabulary only. No free-text restriction and no "my doctor said". | 02, 21 |
| Current eligibility (readiness) | **KEEP.** Fresh and actively answered, dated on or after the episode's last day and its latest sign. | 03, 22 |
| `professionalSeen` | **DROP.** It has no consumer, and it records a medical encounter. It reads as a proxy clearance, invites coercion and drifts into a gate. The restriction vocabulary already carries a professional's advice in functional terms. | 04 |
| `RESTART_PLAN` updated intake | **KEEP.** Existing intake fields, with eligibility re-asked. | 03, 23 |
| `RESTART_PLAN` carried record | **CHANGE.** Carried by reference, not copied. Only the episode classification (R-F08-1), active restrictions and training history carry; raw red flags and text stay in their episode. | 23 |
| Baseline `interruption.reason`, `substitution.text`/`statedReason` | **KEEP_RESTRICTED.** Today the reason is cloned verbatim and unbounded into `INTERRUPTION_DECLARED`. | 06, 07, 14 |
| Baseline `reasonCategory`, A1 `clinicalReason` yes/no | **KEEP.** Closed values; the yes/no is never prefilled. | 01, 03 |
| Derived: states, HOLD reasons, decision text, screen outcome, matched terms, hashes | **CHANGE (classify as health data).** The decision reason at `r6-adaptation.mjs:738` embeds matched clinical words. Hashes of low-entropy enums are reversible. | 01, 14, 15, 16 |

## Binding conditions (owner and trigger in the JSON)

- **Data and minimisation**
  - **01 Classification:** everything above is art. 11 health data, inventoried as purpose → data → derived.
  - **02 Closed structure, fail closed:** unknown values are rejected and become ASK, never a default.
  - **03 No prefilled health answers:** no "all no" shortcut; unknown is never clearance and never an assumed disease.
  - **04** `professionalSeen` is dropped in every form.
  - **05** The F08 inputs have no free text.
- **Free text**
  - **06 Baseline text handling:** bounded; read only by the deterministic screen (CLINICAL/ASK only); never sent to an LLM, translation, analytics or any third party; output-encoded.
  - **07** Deleting or editing the text never reclassifies the episode.
- **Purpose and consent**
  - **08 Purpose limitation:** training adaptation, the athlete's own history and the safety routing only.
  - **09** Analytics see adapted or completed sessions, never the cause.
  - **10 Consent:** specific and highlighted, at the point of use, by an explicit act, unbundled, recorded with language and version.
  - **11 Refusal:** skip or rest is still possible, a generic "seek assessment" message shows, and the SSCTR's UNASSESSED/ASK posture applies. Refusal is never clearance or illness.
  - **12 Revocation fails conservative:** it never exits S3 or S6 into progression or restores prior doses.
- **Retention and erasure**
  - **13 Retention:** in the account record only, with no side copies. Deleted with the account or per episode on request. Durations are G07.
  - **14 Erasure fails closed:** `readableDeclaration` (line 759) silently drops a row whose hash does not match, and `programHash` covers the decisions. A designed tombstone must therefore read as clinical-cause or unknown, never as absent.
  - **15** Hashes of these facts are the facts.
- **Leakage**
  - **16 No health values in logs, telemetry or crash reports,** proven by a canary test. Request-body logging is off for these routes.
  - **17 Neutral OS surfaces:** push, lock screen, widgets, Live Activities, Spotlight and Siri, Handoff, clipboard; the app-switcher snapshot SHOULD be obscured.
  - **18 Shareables and exports never carry these facts or derived labels** (no "comeback after injury"). The athlete's own access export does carry them, behind reauthentication.
- **Access and storage**
  - **19 Athlete-only, enforced on the server:** cross-account access denied, no staff view, break-glass only, synthetic data for debugging.
  - **20 Protection at rest and in transit:** iOS Data Protection on the record and the offline queue; field-level encryption SHOULD (G09).
- **Copy and documents**
  - **21 Copy never claims clearance or diagnosis:** the denylist covers PT-BR, EN and ES ("liberado", "alta", "apto", "aprovado por", "cleared", "approved by", "dado de alta"…). Readiness reads "Você informou que…". There is no proof or certificate artifact, and chest pain or fainting carries urgent-care guidance.
  - **24 No medical document in V1:** no upload, photo, scan or OCR, file picker, link, or request by e-mail or messaging, support included. A document received spontaneously is not attached to the record. **Confirmed and refined:** the rule covers every channel, not only an upload control.
- **Integrity and abuse**
  - **22 Readiness integrity:** own episode only, fresh screen, append-only, replay is a no-op. Device-owner authentication SHOULD apply.
  - **23** A restart plan never clears S3 or a restriction, enforced in the core.
  - **26** Health facts never drive commerce, and the safety route is never paywalled.
  - **27** The age gate is unchanged.
- **Verification**
  - **25 Before exposure:** the named tests run, then Security re-verifies.

## Abuse cases

| Id | Case | Mitigation (conditions) | Residual |
|---|---|---|---|
| AB-01 | False "ready" declaration to escape a hold | Fresh screen; conservative restart by episode length; restrictions as hard caps; any new sign returns to S3; self-declaration copy (03, 21, 22) | Accepted by Founder D2: no verification |
| AB-02 | Red flags answered "no" while symptomatic, or skipped | No prefill; unknown is ASK; urgent-care copy (03, 21) | Self-report limit |
| AB-03 | Coercion: a partner, coach, employer or organizer demands proof, or monitors | No third-party view; no proof artifact; nothing in shares or notifications; export behind reauthentication (17, 18, 19, 21) | Unlocked-phone viewing (AB-04) |
| AB-04 | Shared device views or declares | Neutral OS surfaces; snapshot obscuring; device-owner authentication SHOULD; export reauthentication MUST (17, 18, 22) | Unlocked device; app lock is G09 |
| AB-05 | Escaping a hold by deleting text, revoking, erasing or starting a new plan | Classification persists; fail conservative or closed; S3 refuses or holds a restart (07, 12, 14, 23) | Needs the regression tests |
| AB-06 | Minor misreports age | 18+ gate unchanged; no inference; free text dropped (27) | Self-declared age: G07/G08 |
| AB-07 | Cross-account access on `episodeId`, or a replay | Server ownership checks; `eventId` dedupe; date rule (19, 22) | Rate limits: G09 |
| AB-08 | Injection through text into a future staff view or LLM | Text dropped or bounded; output-encoded; no LLM (05, 06) | None in V1 |
| AB-09 | Leakage through telemetry, crash reports, hashes or push | Canary scrub; hashes treated as the facts; neutral push (15, 16, 17) | Vendors and contracts: G07 |
| AB-10 | Growth or commerce exploiting the episode | Purpose, share and commerce exclusions (08, 18, 26) | None at design level |

## Needs the legal owner (G07), outside this role

- **Legal basis:** art. 11 I consent for the adaptation. Whether an art. 11 II hypothesis covers the red-flag routing, or keeping a clinical-cause marker after revocation or erasure.
- **Consent scope and text:** whether one consent purpose may cover ONB-11, eligibility and F08 together, and the final consent text in three languages.
- **Retention:** periods, deletion timelines and art. 16 exceptions, backups included.
- **Impact report:** a RIPD (art. 38) before real collection, recommended.
- **Processors and transfer:** hosting, crash and analytics vendors, international transfer (art. 33) and their contracts.
- **Age:** whether self-declared 18+ is adequate for health data (with G08).
- **Regulation:** whether the red-flag screen and the professional-assessment routing fall under any Brazilian health-software, medical-device or professional-council regulation, given the positioning of automated suggestions without supervision.
- **Copy and support:** final copy and disclaimers (with G11), and the support procedure for documents received spontaneously.

Neither escalation trigger fired: no medical document is needed, and no clearance is claimed by the design. No repository file outside this folder was changed.
