# Founder Gate — Phase 3: raw Founder decisions

Authority record: these are the Founder's answers, given to the Claude Chief session on 2026-10-10 (about 11:20 America/Sao_Paulo) through the structured Founder Gate. This record is evidence, not Product Truth. Normative effects are formalized by PCG (Canon) or recorded by Product/UX (PDR/PDM) under their own gates.

Questions as presented are summarized from PDR-0.4 §3 (FG-2, FG-3) and the Chief-composed entries (market and platforms). The answers are verbatim.

| # | Question | Founder answer (verbatim) |
| --- | --- | --- |
| FG-2 | Which Crew boundary should Phase 4 use? Public listing/search of Crews and contact-book ingestion are excluded in every option. | "Pacote A (Recomendado)" |
| FG-3 | Which social baseline should Phases 4–6 structure? This is an early, non-blocking confirmation; the final launch shape is decided at the Release Priorities gate before Phase 6. | "Confirmar A (Recomendado)" |
| MKT | Launch market, language and minimum age? | "Brasil pt br + inglês, em relação a idade verifique o comportamento de apps da área como gymrats, strava, Runna, garmin coach e replique" |
| PLT | Launch platforms? | "iOS + Android (Recomendado)" |

## Package A as presented (FG-2)

| # | Parameter | Value |
| --- | --- | --- |
| 1 | Crews per person | Up to 3 (low cap; the exact number can be revised with evidence) |
| 2 | Size order | Intimate circle, up to about 8 (the exact number can be adjusted with evidence, H006) |
| 3 | Who may create a Crew | Anyone (Full Member or Crew Member) |
| 4 | Real-relationship criterion | Nominal invite from a participant. An acceptance through a forwarded or projected invite also needs confirmation by the inviter |
| 5 | Discovery in the closed model | Nominal invite, plus an invite object that can be projected outside the product but enrolls no one on its own (R-A8) |

**Excluded in any option:** public listing or search of Crews (L012, §13); contact-book ingestion (SEC-J-03; L014, third-party data).

**Costs presented with the package:**
- Consent and Contribution are per Crew, which means more states.
- Cross-Crew inference, mitigated by SEC-J-13.
- A larger surface for forwarded invites.
- Every collective shareable needs the consent of each identifiable member; real groups larger than about 8 must split.
- More Crews and more invites in circulation.
- The inviter becomes the gatekeeper for forwarded acceptances.
- Option 4(a) would be coherent only with 5(a). Package A uses 4(b) and 5(b).

## Option A as presented (FG-3)

The thesis-critical minimum: Crew, membership and invite, shared commitment, consented contribution (including return), support, and non-physical collective progress. Sessions together (B) become the first later depth. The final launch shape is decided at the Release Priorities gate (D-CHIEF-02).

## Platform answer as presented (PLT)

A smartphone app on iOS and Android. Watches and other apps act only as data sources through integrations; the integration strategy is decided later.

## Market answer (MKT): language and minimum-age instruction

- Market: Brazil. Languages: PT-BR and English.
- Minimum age: the Founder instructed the Chief to verify the behavior of GymRats, Strava, Runna and Garmin Coach and replicate it. The Chief's verification follows.

### Minimum-age verification (Chief, 2026-10-10, primary sources where reachable)

| App | Minimum age | Source and notes |
| --- | --- | --- |
| GymRats | "Users must be older than 13" | GymRats Terms of Use, last updated 2024-06-19 (https://www.gymrats.app/terms). No parental-consent provision. The App Store age rating is 13+ |
| Strava | "at least 13 years old, or such higher age as may be required in your jurisdiction". Users below the legal age to contract may use it only with parent or guardian permission. Content is public by default "unless you are under the age of 18" | Strava Terms of Service, effective 2026-09-28 (https://www.strava.com/legal/terms) |
| Runna | 18 or older. Plans "são feitos para adultos e não são adequados para pessoas que ainda estão em fase de crescimento e desenvolvimento" | Runna support article (https://support.runna.com/pt-BR/articles/14102837-requisitos-de-idade-para-usar-o-runna) |
| Garmin Coach (inside Garmin Connect) | Under 13 in the US and under 16 in the rest of the world are asked not to provide personal data; such data is deleted | Garmin Connect Privacy Policy, official PDF (https://www8.garmin.com/privacy/connect_privacy_20200605.pdf; PDF generated 2021-03-29). The current web policy could not be read (JS-rendered), so the current wording is unverified |

**Finding:** the peers diverge.
- Social and challenge apps (GymRats, Strava) use 13+. Strava requires parental permission below the contract age and keeps minors' content private by default.
- Garmin uses 16+ outside the US.
- The adaptive coaching app (Runna) uses 18+, with a training-safety rationale.

There is no single behavior to replicate, so the choice of threshold goes back to the Founder with these facts and a recommendation. This is not legal advice.

### Founder follow-up on minimum age (2026-10-10, about 11:35 America/Sao_Paulo)

The Chief presented the divergence above with three options: 18+ like Runna (recommended); 16+ like Garmin; 13+ like Strava and GymRats.

**Founder answer (verbatim):** "18+, como Runna (Recomendado)"

**Effect:** the launch minimum age is 18+. Phase 4 includes age verification only, with no guardian-permission flows or adolescent-specific protections. This is a product-scope and legal-posture decision, not Canon doctrine, and it is recorded in the PDR at the next Architect pass. Security condition SEC-J2-08 (minors) is resolved by scope exclusion. Data-subject rights as Phase 4 requirements, and the legal memo, remain.
