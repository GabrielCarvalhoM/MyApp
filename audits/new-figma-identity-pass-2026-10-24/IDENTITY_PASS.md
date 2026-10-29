# New Figma — identity refinement pass (IDV-1)

Date: 2026-10-24 · File: `TYR10AIrquCpKvKL3eyXyO` · Source: [Founder request](FOUNDER_REQUEST.md).
Scope honored: visual expression only. No change to structure, navigation, content, states or product truth. No restart; legacy Figma and older visual directions were not used; no runtime.

Status: **UI_READY** for the revision re-inspected by the independent judge. Six small polish items the judge suggested were applied afterwards and checked by screenshot.

Routing: design phase, T2/R1/L2 — visual surface only, reversible, Figma-only. The current instance owned the work as UI & Experience Designer, on Opus 5.5 at max effort (the Founder's UI/UX floor). A fresh UI & Experience Designer instance judged the result, also on Opus 5.5 at max effort. It worked read-only, measured contrast from rendered pixels, and was not the author. Product/UX, Research, Security, Data and Engineering were not involved: no structure, hypothesis, trust boundary, measurement or technical boundary changed.

## Critical reading (before)

Preserved:
- One main action per screen and the honest coach voice.
- Real data depth.
- Sport color coding (run blue, strength orange).
- The plan's phase bar.

Generic:
1. Inter everywhere: the numbers were set like labels.
2. Every block was the same card: the day's plan did not stand out.
3. A system-blue accent served as identity; the brand appeared only on share cards.
4. Training screens were flat black, the same as settings.
5. Template patterns.

## Direction

Three real variants were applied to the same surfaces, Hoje and run execution. They are on Figma page `0 · Direção de identidade` (`219:3409`).
- **A · Instrumento** — Barlow Semi Condensed. Kept as a record.
- **B · Editorial** — serif. Removed: the Founder does not want serif.
- **C · Assinatura** — Sofia Sans Semi Condensed with sport light only in context. **Chosen by the Founder.**

The direction frame `231:252` holds:
- The critique and six principles: two voices; numbers as instrument; color says which sport; day marker; surface hierarchy; brand used sparingly.
- A type table rendered from the live styles.
- The atmosphere rules and the don'ts.

## System changes (page 9 and global styles)

- **Text styles in Sofia Sans Semi Condensed:**

  | Style | Size / line height |
  |---|---|
  | Display/Execução | 84/88 |
  | Display/Número | 50/54 |
  | Título/Grande | 36/40 |
  | Título/Coach | 30/34 |
  | Título/Seção | 22/26 |
  | Título/Card | 19/24 |
  | Número/Destaque | 22/26 |
  | Número/Médio | 18/22 |
  | Texto/Sobrelinha | 12/16, caps, +8% tracking |
  | Número/Grande (new) | 28/32 |
  | Número/Hora (new) | 17/20, used for the session-row time |

  Reading and UI styles stay Inter. OS UI keeps a system-like face: the status-bar clock and the lock-screen clock.
- **Tokens:** `borda/herói` (white 9%) and `superfície/painel-herói` (#0b0c0e at 40%), each with WEB and iOS code syntax.
- **Paint styles:**
  - `Luz/Herói · Corrida`, `· Força`, `· Corrida + Força`, `· Força + Corrida`: diagonal light with the base bound to `superfície/card`.
  - `Luz/Tela · Corrida` and `Luz/Tela · Força`: radial light from the top.
- **Components** in frame `Componentes · Identidade` (`236:477`):
  - `Marcador do dia` (`236:488`): 4 variants, one per sport set.
  - `Luz de esporte` (`236:491`): Corrida and Força, 393×380.

## Applied to the screens

- **Legacy texts:** unstyled legacy texts were linked to the styles by role. Section headers outside cards use Título/Seção; card titles use Título/Card; numbers that were on a section style use Número/Grande.
- **Units:** on large numbers, the unit renders at about 42% size in `texto/secundário`.
- **Hero day plan** on every Hoje screen except the rest day and the return-from-pause screen:
  - Light: hero paint style, `borda/herói` border, sessions panel on `superfície/painel-herói`.
  - Marker: a `Marcador do dia` instance.
  - Text: bound to `texto/primário` and `texto/secundário`.
  - Screens: HJ-01–14, EV-04, ON-01 preview, I18N-01/02/04.
  - PP-05 stays neutral: it lists several days, not one day's plan.
- **Sport screens** get a locked `Luz de esporte` instance behind the content; the background stays on `fundo/app`:
  - Run: DT-01/03/04/05, EX-R01–12, CC-01/03/07, EV-01/05, I18N-03.
  - Strength: DT-02/06/07, EX-F01–10, CC-02/04.
  - Overviews stay neutral.
- **Hoje header:** the date is a brand eyebrow ("QUARTA · 21 OUT", with EN/ES equivalents).
- **Brand:** the welcome screen has the wordmark with the marker; share cards use the wordmark in the brand face.
- **Fixes along the way:**
  - The status-bar clock had inherited the brand font from a title style; it is back to a system-like face.
  - Content that ran under the floating tab bar now clears it: 23 frames on page 1, EV-03/04, I18N-01/02/04, STR-03.
  - The large-text clone's avatar is a 40×40 circle again and its header eyebrow scales with the rest of the screen.
  - Value-unit pairs and pace ranges no longer split across lines.
  - Share-card dates are on secondary text.
  - PL-01 had a pre-existing overflow.

## Verification

- Screenshots after rollout and after each fix batch, including a run/strength comparison of the lights (DT-01/02, EX-R03/EX-F02).
- Automated text-overflow scan of pages 1–7: the only hit was a pre-existing overflow on PL-01, now fixed.
- A frame/note overlap check on the edited pages; the one overlap found later by the judge (CF-16 note) was moved.

## Independent judge

1. **First review: PASS WITH CONDITIONS.** These criteria passed: brief fit, structural fidelity, hierarchy, variant choice, adaptation, and the scoping of the light.
   - **MUST M1:** labels on lit cards measured 3.8–4.4:1 contrast.
   - **SHOULD:**
     - S1: the strength light rendered brown.
     - S2: type roles were applied inconsistently.
     - S3: the new elements were not components, styles or tokens.
     - S4: regressions in the large-text clone.
2. **Re-check: PASS, UI_READY granted.**
   - Lit labels now measure ≥5.96:1.
   - The strength light reads as a warm glow rather than a brown band.
   - S2–S4 are closed and verified.
   - Six COULD polish items remained; all were applied afterwards (PL-01 time spacing, CF-16 note, I18N-04 range break, EX-R11 unit, doc specimens, race-day hero title).
   - Evidence and sampling scripts are in the session scratchpad (`judge/`, `judge/r2/`).

Kept on purpose, both shown to the Founder in the approved C mock:
- **C1:** the greeting is larger than the hero headline.
- **C2:** the 12% second-sport glow on double days.

Open for the Founder's eye only: the warmth of the strength light. It no longer blocks anything.

Limits: Figma renders at 1x only. There was no device or simulator check of Dynamic Type or VoiceOver. Page 8 (documentation) was not inspected by the judge.
