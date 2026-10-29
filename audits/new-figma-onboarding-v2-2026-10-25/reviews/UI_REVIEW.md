# UI review — OB-2 onboarding, account and paywall · round 1 · 2026-10-26

Reviewer: UI & Experience Designer 1.2.0, fresh instance on Opus 5.5 at max effort. It worked read-only and authored nothing under review.
Rubric: `evals/UI.md` 1.0.0. Figma file `TYR10AIrquCpKvKL3eyXyO`, as inspected on 2026-10-26. The coordinator reported no Figma change after the review started. No Figma edit was made, and this file is the only repo write.

## Verdict: **NOT_UI_READY**

The review found 3 MUST, 10 SHOULD and 12 COULD findings. All three MUSTs are small local fixes. The Founder's asks are all present, and most are well crafted. The blockers are execution defects:
- clipped text on the first screen;
- an unstyled value on the step this pass changed;
- a contrast failure on the new account card.

A re-check only needs the MUST frames. It also needs the notes or direction text for S1–S3, if those are done in the same pass.

## What was rendered and measured

**Renders.** 37 frames were rendered with `get_screenshot` at 1x, each downloaded and inspected, and enlarged where in doubt:
- Section 2.1 main row: ON-01, ON-01b, ON-03, ON-04, ON-05, ON-06, ON-07, ON-08, ON-09, ON-10, ON-11, ON-12a, ON-12b, ON-14, ON-14b, ON-15, ON-02, ON-16, PP-01, PP-03, PP-04 and PP-05.
- Support row: ON-01 2/3, ON-01 3/3, ON-01r, ON-01s, ON-12c, ON-15b and ON-02d.
- Other sections: ON-V7 `126:1887`, ON-V7b `400:4698`, AC-04f `300:2889` and ON-02c `397:13488`.
- Page 6: CF-04 `178:3793` and CF-02 `178:3611`.
- Page 9: Selo de destaque `396:4773`.
- AC-04 `250:1868`, for comparison only.

**Motion.** `get_motion_context` (recursive) was run on ON-01, ON-07, ON-08, ON-09, ON-16 and PP-03. Each was exported with `export_video` (WIDTH 393, low quality, 5–10 fps). Frames were sampled every 0.1–0.4 s and laid out on contact sheets.

**Read-only scripts (`use_figma`):**
- A scan of 33 frames for text partly clipped by an ancestor, and for content under a pinned bar.
- Sizes of interactive instances.
- The text style of every numeric value.
- A token contrast scan of 1,064 text segments: the text colour is resolved against the composited ancestor fills.
- Raw (unbound) paints on nodes from the OB-2 era.
- Explicit variable modes.
- The notes, and the direction document `335:3468`.

**Pixel contrast.** About 50 regions were measured from the renders: the lightest pixel against the darkest pixel, using the WCAG formula.

**Evidence files.** These are temporary, in the session scratchpad `…\scratchpad\judge-ob2\`:
- `r/`: frame renders;
- `z/`: zoomed crops;
- `v/`: videos, frames and sheets;
- `tools/`: the crop and pixel scripts.

## MUST (blocks UI_READY)

**M1 · ON-01 `118:512` (and ON-01r `386:4394`, ON-01s `386:5170`, static 2/3 `384:3591`, static 3/3 `384:4369`). The body text of carousel slide 2 is clipped.**
- The body "Ritmo, cargas e descansos… do aquecimento ao fim." (`376:3829`) spans y 566–608. Its parent `Slide 2` (`376:3658`) and the `Carrossel` both clip at y 604.
- The descenders of the second line are cut. The crops `z/on01-2-text.png` and `z/on01-video-5.2s-text.png` show this in the static frame and in the animated carousel at 5.2 s. The text then sits 14 pt above the dots.
- Cause: the slide-2 headline runs to three lines (120 pt) where the others run to two, inside a fixed, clipping 492-pt slide.
- It is on screen for 3.2 s of every 11.4-s loop, on the first screen of the product. The same layout has no room for ES/EN or larger text (ES is in V1, DR-103).
- **Fix:** give the slide text block room for a three-line headline and a two-line body, or bring that headline to two lines. Keep at least 12 pt above the dots, and do not clip text with the slide container. Check with the ES strings.

**M2 · ON-11 `121:1030`. The height value is unstyled and reads as a placeholder.**
- "179 cm" (`121:1080`) is Inter Medium 12 with no text style, in secondary grey.
- The weight next to it, "78 kg" (`121:1084`), is "78" in Número/Médio (Sofia 18) with " kg" in Texto/Meta. The crop `z/on11-fields.png` shows both.
- On the step the Founder asked to change, the filled height looks empty beside a real value. This breaks the OB-1 rule "numbers in Sofia, unit smaller", and the numeric-style scan found no other unstyled value.
- **Fix:** give the height the same structure as the weight: "179" in Número/Médio and " cm" in Texto/Meta. Draw the imperial format the same way (see S10).

**M3 · ON-02 `118:655`. The day letters on the lit "Seus dias" card are below 4.5:1.**
- The 11-pt letters use texto/terciário #80868F. The rendered contrast against the blue-lit card is:

  | Letter | S | T | Q | Q | S | S | D |
  |---|---|---|---|---|---|---|---|
  | Contrast | 4.22 | 4.33 | 4.52 | 4.62 | 4.76 | 4.83 | 4.78 |

- The background behind S is about #192534.
- From tokens alone the same letters reach 4.84:1, so the brand light is what drops them. That is the failure class of IDV-1's M1 (labels on lit cards at 3.8–4.4:1).
- **Fix:** use texto/secundário for the letters. The "SEUS DIAS" eyebrow in that colour measures 6.62:1 on the same card. Alternatively, lower the light under the row.

## SHOULD

**S1 · Motion handoff: every timeline is a full loop.**
- `get_motion_context` reports `loopMode: loop` and `repeat: Infinity` for these timelines:

  | Frame | Timeline |
  |---|---|
  | ON-01 | 11.4 s |
  | ON-07 | 2 s |
  | ON-08 | 5.3 s |
  | ON-09 | 2 s |
  | ON-16 | 3 s |
  | PP-03 | 2 s |

- Built literally, the chart builds replay without end. The week ticks, bars, week strip and phases vanish and rebuild every 2–3 s, and the whole ON-08 diagram resets every 5.3 s. That contradicts the direction document's "nada pisca".
- Only the ON-08 note limits the loop (the dots, 1.4–5.3 s).
- **Fix:** add to the ON-07, ON-09, ON-16 and PP-03 notes, and to the direction document's motion block: "plays once on first appearance; only the carousel and the ON-08 dots loop". The Plugin API cannot set a play-once mode, so the text has to carry this.

**S2 · Auto-advance and looping content have no pause (WCAG 2.2.2).**
- ON-01 advances every ~3.8 s, indefinitely. The ON-08 dots loop forever. The only stop is iOS Reduce Motion, which is defined well in the OB-2 block of `400:13229`.
- **Fix:** specify these behaviours:
  - touch or drag pauses the carousel;
  - auto-advance stops after one cycle, or there is a pause control;
  - with VoiceOver on there is no auto-advance, and the carousel is one adjustable element;
  - the ON-08 dots stop after 2–3 passes.

**S3 · The direction document `335:3468` still describes the pre-OB-2 state, and it is the implementation spec.**
- The motion block `335:3501` says "o traço do progresso preenche na cor da etapa". That would undo the Founder's white dashes.
- The accessibility block `357:3396` says "Etapa n de 13"; there are now 14 steps.
- "Por tela" `335:3488` still lists ON-13 (removed) and the old ON-16 strip (Mon–Wed placed, Thu arriving).
- The ON-16 timing (8 pt / 220 ms / 120 ms) does not match the timeline (16 pt with overshoot, about 330 ms stagger).
- **Fix:** bring all four in line with the current frames.

**S4 · ON-08 `120:985` needs a direction cue in the still and reduced-motion state.**
- The two connectors (`379:3559` and `379:3561`) are plain white lines at 38% with no arrowheads, so "one way, read only" depends on the moving dots. With Reduce Motion the dots stay still.
- OB-1's own rule asks for a "seta de mão única", and it is no longer drawn.
- **Fix:** add a small arrowhead or chevron where the lines enter the Vilumo tile.

**S5 · PP-01 `122:1305`. The last card stays under the pinned bar.**
- The content padding-bottom is 150. The two-button bar `122:1543` takes 168 pt from the bottom.
- At maximum scroll, the bottom 18 pt of "16 semanas até a prova" (`122:1533`, y 1293–1442) remain under the bar, which starts at y 1424. The crop `z/pp01-bottom.png` shows this.
- **Fix:** raise the bottom inset to at least the bar height plus 16.

**S6 · ON-15b `397:4845`. The consent card has a double inset and a dangling divider.**
- The card `397:4951` nests a settings-row instance `397:4954` ("Linha · Autorizo") that brings its own 16-pt inset and bottom stroke.
- As a result the toggle label starts at x 49 while the card text starts at x 33, and a separator floats about 7 pt above the card edge. The crop `z/on15b-consent.png` shows this.
- **Fix:** use a row inside the card with no extra inset and no divider.

**S7 · ON-V7b `400:4698`. A strength colour appears in a running card.**
- The calendar glyph for "Escolhidos: 6 dias" is strength orange inside "Sua corrida" (crop `z/onv7b-card.png`).
- Colour says the sport, so this glyph should be neutral, as in ON-V7's "Seus dias", or run blue.

**S8 · Hit areas below 44 pt on new controls.**
- On ON-11, the units switch `392:4427` is 172×36, and its segments are about 28 pt tall.
- "Dia da semana" is 42×42 on ON-12a, ON-12b and ON-12c, but 44×44 in CF-04.
- These text links are 16 pt tall:
  - "Política de privacidade" on ON-01, ON-01r, ON-01s and ON-08 (`377:3577`, `378:3608`);
  - PP-03's "Restaurar compra · Termos · Privacidade" (`123:1373`–`1375`, y 817–833). Its baseline sits about 6 pt above the home indicator at y 839.
- **Fix:** document hit frames of at least 44 pt, as Pílula already does, and move the PP-03 links clear of the home-indicator zone.

**S9 · ON-12a `121:1100`, ON-12b `121:1213` and ON-12c `395:4416`. The shift times are in the reading face.**
- "18:00 – 20:00" and "06:30 – 08:00" (`I393:4440;117:619`, `I394:4433;117:619`, `I395:4486;117:619`) come from the settings row in Inter 15 Texto/Corpo.
- The durations beside them ("até **60** min") are in Sofia, and OB-1 set onboarding times in Sofia.
- **Fix:** use Número/Hora, as the PP-01 session times do.

**S10 · ON-11. The lb · ft state is not drawn.**
- A search of page 2 finds no lb, ft, ′ or ″ value. The Founder asked for this switch.
- The imperial height has two numbers and two units (5′ 10″), which tests the field layout and the number style.
- **Fix:** draw that state, or at least its two fields.

## COULD

- **C1 · ON-14b `374:3379`.** The footnote `396:4564` ends at y 754 against the bar line at 753, so the "j" of "ajuste" touches the bar at rest. It scrolls clear, but it looks cut. Trim the copy or the spacing.
- **C2 · PP-03 `123:1304`.** The "Economize 72%" tag `396:4777` (y 509) sits 2 pt below the last benefit's description (ends at y 507). Give it 8 pt or more.
- **C3 · ON-12a vs ON-12b.** The day rows do not line up between the two screens:

  | Screen | Circle x positions | Step |
  |---|---|---|
  | ON-12a | 16 … 335 | 53 |
  | ON-12b | 21 … 330 | about 51.5 |

  The circles jump between consecutive screens.
- **C4 · Rest glyph.** The moon (ON-02, ON-16, PP-01, PP-04) now sits next to a "Noite" shift ("Força seg e qui à noite") and can read as "night". Consider a neutral rest glyph, such as the bed already used in PP-05. This is a system-wide choice.
- **C5 · ON-08 craft.** The drawing meets the ask: tiles pop in, the lines draw, the chips stagger in and the dots flow one way. Two changes would lift it further:
  - the data chips float above and below without joining the flow; let them ride the lines or land in the Vilumo tile;
  - the two lines form a rectangular loop rather than converging streams.
- **C6 · ON-02.** The auth stack sits in the middle of the screen with about 170 pt empty below it. Consider anchoring it lower, in the thumb zone, or balancing the composition.
- **C7 · Selo de destaque `396:4773`.** The fill is bound to a text token (texto/primário). Add a surface token or document the exception. The description also shows the raw `&quot;` entity.
- **C8 · Carousel screens.** The device screens inside ON-01, ON-01r and ON-01s are flattened copies with about 158 raw colours. Document them as static illustrations to re-export when HJ-01, EX-F02 or AD-02 change, or use instances.
- **C9 · ON-06 `120:828`.** The frame shows the recommended option already selected, which is Lucas's answer. A resting variant with the tag shown and nothing selected would make "never pre-selects" (DR-115) visible, as ON-14b does.
- **C10 · ON-06.** The reason line sits below all three options, about 250 pt from the tag it explains. Move it closer. ON-14b's recommendation has no visible reason at all. Its copy is bound to SSCTR, so route any new wording there.
- **C11 · Inactive indicators.** The inactive carousel dots and the upcoming progress dashes measure about 1.4:1. This is not new in OB-2, but worth a look.
- **C12 · Pre-existing, outside OB-2.** These were not caused by this pass:
  - the inactive tab-bar labels measure 4.37:1 in the token scan (ON-02c, PP-05);
  - the back buttons are 40×40;
  - the ON-01r "Recomeçar" / "Já tenho conta" buttons and the ON-02 "Já tenho conta · Entrar" button are 40 pt tall.

## Routed to Product/UX Architect (not UI-owned, not blocking UI)

- **R1 · Run window in the mock.** PP-01 places the long run at "Sáb 08:00" (60 min), but the chosen run window is "06:30 – 08:00". ON-12b also allows "Longão até 2 h" inside a 1 h 30 window. The mock shows a session at or past the edge of the chosen shift. Settle what the window means under DR-112 (a start window or a full window) and fix the scenario.
- **R2 · "Sexo" vs "gênero".** The label "Sexo" differs from the Founder's word "gênero". This is a reasoned decision (SSCTR Q4, Security Q3), but the Founder should see it stated explicitly.
- **R3 · ON-02c notice.** Its dismissal or expiry is not specified.

## Criteria

| Criterion | Result |
|---|---|
| Structural fidelity | No UI deviation seen. The frame order follows DR-111, and the states named in the notes exist. Links and flow logic belong to the Architect. |
| Founder asks | All present: carousel with three real app screens; motion charts on ON-07, ON-09, ON-16 and PP-03; the ON-08 diagram (meets the ask, see C5); a richer sign-up with the chosen week; annual plan emphasis with a computed 72% (199.90 ÷ 12 = 16.66; 1 − 16.66 ÷ 59.90 = 72%); Recomendado only on ON-06 and ON-14b, never on goals; white dashes on every step; units switch; optional sex field without pre-selection. The gaps are M2, S10, and S4 for the still diagram. |
| Hierarchy | Good. There is one primary action per screen. PP-03 reads in order: plan, then benefits, then choice. The charged price is the largest number. |
| Design system | Selo is a real component with tokens and a text style. Selection uses `seleção/*` and green means selection only. The failures are M2 (unstyled text), S7 (wrong semantic colour), S9 (wrong style) and C7. |
| Identity (IDV-1 / OB-1) | Sport light only on sport steps: ON-12a orange, ON-12b blue, ON-14b orange. ON-11 and ON-15 are neutral. The brand light appears only on welcome, account and paywall. No serif. Icons tell options apart: target, calendar, swap and lock on ON-14b. |
| States and interaction | ON-01r, ON-01s, ON-12c, ON-15b, ON-02d, ON-02c and AC-04f are drawn. The lb · ft state is missing (S10), and the ON-06 resting state would help (C9). |
| Accessibility | Selection never relies on colour alone: check plus border, luminance on the day circles, weight on the segmented control, position on the toggle. The token scan found new text at 4.5:1 or above. Rendered spot checks: Selo 17.8:1, PP-03 disclosure 5.33:1, terms 5.33:1, destructive label 5.21:1, subtitles under sport light 8.3:1 or above. Failures: M3 and S8. |
| Adaptation | Fails on M1 (fixed clipping text area). ES and Dynamic Type were not rendered. |
| Motion | The builds explain what they show: the ticks lead to the flag, the bars rise from a masked baseline, the dots flow one way, the week assembles in order, and the phases fill before the badge. Easing is ease-out, with overshoot only on the pops. A reduced-motion rule exists. Gaps: S1–S4. |
| Honesty | No ratings, testimonials, countdowns, "só hoje" or efficacy claims. The CTA names the plan, the disclosure states the yearly charge, and a close button is present. The carousel copy states facts about the product. |
| Hygiene | All 33 inspected page-2 frames keep an explicit variable mode, checked by id. The only text partly clipped by an ancestor is M1; the other hits were inside the device mock and fully hidden. |

## Limits

- Figma renders at 1x, and the videos are low quality at 5–10 fps.
- No device or simulator check was done for VoiceOver, Dynamic Type, Reduce Motion or the ES/EN strings.
- Prototype links were not exercised.
- The PRODUCT_UX, SECURITY_R2 and SSCTR_BINDING reviews were not read, to keep this judgment independent.
- This review grades the visual layer only. It does not grade structure, legal text or training rules.
