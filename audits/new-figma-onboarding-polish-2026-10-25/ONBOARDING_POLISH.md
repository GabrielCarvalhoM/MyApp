# New Figma — onboarding visual pass (OB-1)

Date: 2026-10-25 · File: `TYR10AIrquCpKvKL3eyXyO` · Source: [Founder request](FOUNDER_REQUEST.md).
Scope honored: visual expression only, inside identity IDV-1. Structure, navigation, questions, answers, states and product truth are unchanged. Where a screen gained a visual, it draws facts the screen already stated. The only copy edit: ON-06's example loses its first sentence ("Agachamento pesado na sexta e longão no sábado."), which the new session-pair row now draws. No repo product/canon file changed; legacy Figma untouched; no runtime.

Status: **ROUND 2 PENDING** — round 1 was NOT UI_READY (one MUST); all fixes are applied (see "Independent judge" below).

Routing: design phase, T2/R1/L2 — visual surface, reversible, Figma-only. The current instance owned the work as UI & Experience Designer on Opus 5.5 at max effort (Founder UI/UX floor). A fresh UI & Experience Designer instance judges it read-only, on Opus 5.5 at max effort. Product/UX, Research, Security, Data, Engineering and the sports-science reviewer were not involved: no structure, hypothesis, trust boundary, measurement, technical boundary or training rule changed.

## Critical reading (before)

Preserved: one question per screen; the honest voice that says what each answer changes; real data (history, loads, race); colour by sport.

Raw:
1. Every step was the same grey card; nothing told running steps from strength steps.
2. Selection was a white radio.
3. The progress bar said nothing beyond position.
4. Typed values (loads, height, times, race goal) were set like labels.
5. The end of the questionnaire (ON-16) was a spinner.

## Direction

Three real variants of ON-04 sit in Figma section `2.6` (`322:2951`) with the reason for each decision:
- **A · Ícone na opção — chosen.** Reuses the Opção component and the app's own session tiles; scales to long descriptions (ON-06) and to every question; low maintenance.
- **B · Capítulo + lista — discarded.** A big badge plus eyebrow repeated the title and read as a template; a grouped list weakens each option's tap target.
- **C · Grade 2×2 — discarded.** Breaks titles in two lines, does not scale to ON-06/ON-15, and is the most generic onboarding pattern.

The Founder's mid-turn message (icons, green check, more than sport light) was folded into A, plus one authored element per screen where content allowed it. The direction document is frame `335:3468`.

Principles:
1. Colour says the sport — progress, step marker, tiles and light only where a sport is in focus.
2. Icon only where it tells options apart — none on time ranges (years of practice), no glyph repeated across a list.
3. Selection is green and has shape — green check, selection border and tint; never colour alone. In questions that report a symptom (pain, illness, discomfort) the mark is neutral (white): a status colour does not judge a health signal (extends IDV-1's "status colour judging sleep/HRV" don't).
4. Numbers as instrument — typed values in Sofia Sans, unit smaller in `texto/secundário`.
5. Show what the answer becomes — race → 16 weeks to the date; priority → the conflicting pair of sessions; double days → the marker pills; the end → the week assembling.
6. Brand with restraint — the progress ends as the path's signature (white, blue, orange); the wordmark stays on the welcome screen only.

## System changes (page 9)

- **Tokens:** `seleção/marca` (#34C77B, its own value, decoupled from status; check in `texto/sobre-cor`, 8.9:1), `seleção/borda` (same green at 55%, stroke), `seleção/fundo` (same green at 6%, fill). WEB and iOS code syntax set. Alpha lives in the token because bound-paint opacity did not propagate from main component to instances.
- **Opção** `117:613`: selected = green check + selection border/tint; new property `Marca=Verde/Neutra` (neutral = white check and white border on the card fill, for symptom questions). Strokes no longer count in layout, so selecting never changes the size. Text and visibility property references re-linked on the cloned variants.
- **Ícone de sessão** `116:698`: new `Tipo=Corrida + Força` (36 `327:541`, 40 `327:525`), split tile with both glyphs.
- **New, frame "Componentes · Onboarding (OB-1)"** `327:557`: `Glifo de dia` `327:566` (Dois · Talvez dois · Um, built from the day-marker pills; "talvez" is an outlined pill), `Pílula de seleção` `327:574` (Estado × Marca, text property Rótulo, hit area ≥ 44 pt) and `Dia da semana` `353:555` (Padrão/Selecionado, text property Letra; selected = selection green with the letter in `texto/sobre-cor`).

## Applied to the screens (page 2)

| Screen | OB-1 |
|---|---|
| All question steps | Progress dashes coloured by the step's sport (ON-04/07/09 blue, ON-05/10 orange, shared white). |
| ON-03 | Dual marker; tiles Corrida + Força · Corrida · Força. |
| ON-04 | Run light; run marker; run tiles: flag, stopwatch, route, calendar. |
| ON-05 | Strength light; strength tiles: trend, layers, shield (maintain), runner (strength for running). |
| ON-06 | Dual marker; tiles; the conflict example's sessions in one row (Sex · Agachamento pesado › Sáb · Longão), replacing the sentence that said the same. Block ends 20 pt under the bar on an 852-pt screen (9 pt before OB-1). |
| ON-07 | Run light; selection pills; "16 semanas até a prova": 16 flexible week ticks (this week white, the rest grey) and the race flag, replacing the text line with the same facts — no phase colours, phases exist only after the plan. Goal time in Sofia. |
| ON-08 | One-row Apple Saúde → Vilumo diagram (ingest only, DR-107); both cards fit above the bar on an 852-pt screen. |
| ON-09 / ON-10 | Sport light and marker; ON-10 loads in Sofia numerals (no repeated glyph); "Adicionar exercício" in strength orange. |
| ON-11 | Field icons (ruler, scale, heart); Sofia numerals with small units. |
| ON-12 | Selected days in selection green (Dia da semana); times and durations in Sofia. |
| ON-13 | Dual marker; Glifo de dia per answer. |
| ON-14 | Dual marker; section labels with sport markers; strength tiles (gym, home, bodyweight); selection pills. |
| ON-15 | Neutral tiles (none, stethoscope, return, lock); neutral mark. |
| ON-16 | The PP-01 week strip assembling in a card (Mon/Tue/Wed placed, Thu arriving, Fri/Sat dashed, Sun rest because ON-12 leaves it out) replaces the spinner; dual marker. Same result as PP-01, never a session the proposal lacks. |
| PP-01 / ON-V4 | Week strip (from PP-04) above the session list; ON-V4's Wednesday is a free day, matching its rows. |
| PP-02 | Green-check choice; sport marker before each option title; "Protege" is a shield in the protected sport's colour, "Cede" neutral. |
| PP-03 / PP-06 / PP-07 | Plan cards with green-check selection; feature ticks neutral so green means selection only; prices in Sofia (values unchanged, still G10-dependent). |
| ON-V1 / V2 / V3 | Sport light, marker and progress, like ON-09/ON-10. |
| ON-V5 | Pain-region pills with the neutral mark; "Pode seguir" no longer status green. |
| ON-V7 | Options without tiles (the "O que não fecha" card already shows the sports); fold back to the pre-OB-1 layout. |
| CF-04 (page 6) | Days use Dia da semana, like ON-12. |

Unchanged on purpose: ON-01 (already lit hero), ON-01b and ON-02 (eligibility/account, reviewed by Security), ON-V6 (neutral end), PP-04, PP-05, PP-08.

File-wide effect: the Opção selection is the same everywhere. Neutral mark on HJ-08, HJ-13, EX-R10, RR-04 (symptom questions) as well as ON-15 and ON-V5; green elsewhere (DT-07, EX-F06, HI-05/06, AD-04/10/11, CF-03/04/06, EV-06).

## Verification (author, not a gate)

- Screenshots of every changed frame after each batch, plus overview of section 2.1.
- Automated scan of the text nodes in sections 2.1–2.3 (540 before the round-1 fixes, 538 after): no text box overflow, nothing outside the screen, no row wider than its parent, no content ending under a pinned action bar inside the frame, no note overlapping a frame; every screen keeps its explicit variable mode.
- Fold on an 852-pt screen, checked by hand after the judge's S5: ON-08 fits; ON-06 and ON-V7 scroll as they did before OB-1 (ON-06 by 11 pt more).
- Notes moved below frames that grew; sections 2.2–2.6 shifted down to avoid overlap. Page 8 index lists section 2.6.

## Independent judge

A fresh UI & Experience Designer instance (Opus 5.5, max effort), read-only, rubric `evals/UI.md` 1.0.0. It rendered all 35 onboarding frames, the direction document, the page-9 components and 15 screens outside onboarding that use Opção, and measured contrast from rendered pixels. Evidence: session scratchpad `judge-ob1\` (temporary).

**Round 1: NOT UI_READY.** Passed: structural and product fidelity, colour semantics, measured contrast (new text ≥ 4.84:1, text on light ≥ 5.0:1, check on green 8.81:1), selection not by colour alone, variant choice, hygiene (3,077 bindings resolve, 896 instances, 0 broken, no overflow in 577 texts). Findings and what was done:

| Finding | Fix |
|---|---|
| **M1** ON-12 selected days still white (also CF-04) | New Dia da semana component; selected days in selection green on ON-12 and CF-04. |
| S1 Selecting made Opção and Pílula 1 pt taller | Strokes no longer count in layout on both sets. |
| S2 Neutral selected card hid the neutral tile | Neutral selected state keeps the card fill and a white border. |
| S3 Green check meant two things on PP-02 (and PP-03 ticks) | "Protege" = shield in the sport's colour; feature ticks neutral. EX-F06 (outside onboarding) left. |
| S4 ON-V5 "Pode seguir" in status green on a symptom screen | Neutral glyph. |
| S5 ON-08, ON-06, ON-V7 lost content under the bar on an 852-pt screen | ON-08 one-row diagram (fits); ON-06 one-row pair and the redundant sentence removed (20 pt under, was 9); ON-V7 tiles removed (back to its pre-OB-1 fold). |
| C1/C6 ON-16 week built differently from PP-01; Sunday shown open | ON-16 uses the PP-01 strip; Sunday is rest. |
| C2 Two glyph colours on sport tiles | Base sport colour everywhere. |
| C3 Selection tied to two status greens | `seleção/marca` has its own value. |
| C4 Weak or repeated glyphs | Shield for "Manter a força"; ON-10 rows without glyph; ON-V7 without tiles. |
| C5/C7 Low-contrast supporting graphics; first-week tick blue like the Base phase | Ticks white/grey; "Talvez dois" pill outlined; vacancies in `texto/terciário`. Progress track left as before OB-1. |
| C8/C9/C10 Hit area, VoiceOver notes, tidy-ups | Pílula ≥ 44 pt hit area; accessibility block in the direction document; "por mês" tone; Glifo description; ON-V3 back to 852. |
| C11 Tell the Founder about the white checks | In the delivery message. |

**Round 2:** pending.

## Limits

Figma renders at 1x. No device or simulator check of VoiceOver or Dynamic Type. Motion is specified in the direction document, not prototyped. Prices, legal text and integrations keep their gates (G10, G07, G06).
