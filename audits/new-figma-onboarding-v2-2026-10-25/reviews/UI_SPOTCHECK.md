# UI spot-check — OB-2 · fixes after the re-check · 2026-10-26

Reviewer: the same UI & Experience Designer judge as [UI_REVIEW](UI_REVIEW.md) and [UI_RECHECK](UI_RECHECK.md). It worked read-only on the live Figma `TYR10AIrquCpKvKL3eyXyO`, with rubric `evals/UI.md` 1.0.0. This file is the only write; no Figma edits were made.

## Result: **UI_READY still holds**

N1 and N2 are closed. The new action and the changed frames pass every check: clipping, hit area, contrast and overlap with the bar. No new finding blocks UI_READY.

## 1 · N1 and N2

| ID | State | Evidence |
|---|---|---|
| N1 · ON-V7 `126:1887` bar position | **CLOSED** | The bar `126:1996` now sits at y 950–1049, at the bottom of the 1049-pt frame. The home indicator `126:1997` is at y 1036. The last option ("Mais tempo por treino") ends at y 909, 41 pt above the bar. Crop: `z3/onv7-bottom.png`. |
| N2 · ON-02c `397:13488` close control | **CLOSED** | The close button `459:4960` is 44×44 pt, at the top right of the notice (x 331, y 140). The notice's right padding is 52 pt, so the texts end at x 298 and x 265, clear of the button. The X measures 14.7:1 against the card. It has no prototype link, but the note describes its behaviour. Crop: `z3/on02c-notice.png`. |

## 2 · New action and changed frames

**AC-04f, incomplete answers (`445:13343`) and complete answers (`445:13387`): pass.**
- "Não são minhas respostas · Recomeçar" (`459:4952` and `459:4956`) is a 361×50 button, so its hit area is fine. Its text runs from x 46 to 347 on one line and measures 17.8:1.
- It links to ON-01s (`386:5170`).
- `Ações` now spans y 593–800, with no clipping and well clear of the home indicator.
- **COULD:** it uses the same weight as "Entrar de outro jeito". A quieter style would rank it below the sign-in path. The erase step still sits behind the ON-01s confirmation sheet.

**ON-15 `122:1156`, ON-15b on arrival `444:4793`, ON-15b after the act `397:4845` and ON-15d `444:4889`: pass.**
- The pause sub-label, "Viagem, rotina ou outro motivo — sem dor nem lesão", now runs to two lines and the cards reflow. It measures 7.78:1, with no clipping and nothing crossing the bars.
- On ON-15b the consent switch stays above the action bar on an 852-pt screen.
- On ON-15d the referral box now starts about 18 pt lower, at y 748. It still begins under the bar on an 852-pt screen before any scroll. This is the COULD N5 from the re-check, and it is not blocking.

**Canvas: pass.**
- No frame or note overlaps another on page 2, and no section overlaps another.
- Section 2.2 is now 1580 pt tall, and the sections below it moved down to match.

## What was rendered and measured

- Eight frames rendered at 1x: ON-V7, ON-02c, both AC-04f variants, ON-15, both ON-15b states and ON-15d. Evidence files are in the temporary session scratchpad: `…\scratchpad\judge-ob2\r3\` and `z3\`.
- A read-only `use_figma` run measured the frame geometry, the button sizes and links, text clipping by an ancestor, content crossing the bar, and frame, note and section overlaps across the page.
- Pixel contrast was measured on the new action, the new sub-label, the notice text and the close glyph.

Limits are the same as before: 1x renders, and no device check of VoiceOver, Dynamic Type or Reduce Motion.
