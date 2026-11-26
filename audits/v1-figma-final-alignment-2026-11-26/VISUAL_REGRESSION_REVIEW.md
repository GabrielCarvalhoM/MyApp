# Visual regression review

**Method:**
- **Before:** two sources.
  - Screenshots taken before editing, for `760:1484`.
  - The read-only text inventory of the 25 pages (`audits/v1-ui-functional-reconciliation/figma-inventory/`, taken 2026-11-24), for every other frame.
- **After:** screenshots rendered by Figma (`node.screenshot` / `get_screenshot`) of each changed frame or region, inspected by eye in this session.
- **A write was not accepted just because the MCP confirmed it.**

**Reviewer:** the same agent that made the edits. This is a self-check, not an independent review (worker ≠ judge). §4 lists what an independent reviewer should look at.

## 1. Frames inspected after editing

| Frame | What was looked at | Result |
|---|---|---|
| 71 `760:1484` (before and after) | Same composition, card, pills, colors and typography. 5 zones with bars at the new positions. The longer state copy grows the card by 2 lines (frame height HUG 1474 → 1510). No clipping. | PASS |
| 71 `760:1611` | The 3 bands became 5 Z1–Z5 rows of the approved component (same colors as Lucas). Frame HUG 1106 → 1209. The tab bar stays at the bottom. | PASS |
| 71 `1102:4302` (new) | A faithful clone of the approved screen with the new values. No clipping. | PASS |
| 71 `1102:4428` (new) | The Z5 label first wrapped onto 2 lines; fixed to "acima de Z4" and checked again. Bars aligned to 130/150/165/180. | PASS after the fix |
| 71 `845:4225` | Hiding a row leaves the list with 2 rows. Frame 1011 → 873 (HUG). No visual gap. The "zones not yet measured" art is unchanged. | PASS |
| 71 `760:1693` | The actions are hidden. The validity block closes the content. No empty space. | PASS |
| 10 `836:782` | The footnote grows to 3 lines. The pills and "Continuar" are unchanged. | PASS |
| 10 `1103:2299` (new) | A clone of `838:4053`. The second paragraph keeps the secondary style. Buttons unchanged. | PASS |
| 20 `575:1172` | The copy below the options is shorter (2 lines). The day carousel and "Começar" are unchanged. | PASS |
| 30 "Dia a dia" region of `509:115` | The footnote is 2 lines. The icon is aligned. | PASS |
| 41 `665:486` (card) | The "Ajustar carga" button fits without truncation. Visual weight is the same as before. | PASS |
| 50 `880:20729` | The source footer first touched the right edge. Shortened to "iPhone, não usado pelo plano · salvo às 19:23" and checked again (width 267 px). The "O que observamos" block is shorter. | PASS after the fix |
| 50 `682:2528` | "Excluir corrida" is hidden. "Corrigir dados / Compartilhar" stay. The new 2-line note fits. Map, splits and chart unchanged. | PASS |
| 81 `848:383` | The heading is 2 lines. The status column reads "Nada recebido" and fits. | PASS |
| 00 `897:2` Guia | The "O que mudou por último" cells grow to 2 lines in 10 rows. The table keeps its alignment. | PASS |
| 31 `645:749` | Annotations only. Checked that the frame shows no steps, load or "Começar" under a hold. | PASS (unchanged) |

## 2. Checklist

| Item | Result |
|---|---|
| Visual language preserved (palette, type, cards, icons, illustrations) | Yes. No style, variable, color, component or icon changed; no page was rearranged. |
| Unexpected component changes | None. Instances were not detached. The new rows on `760:1611` are clones of the approved rows. |
| Clipped text / overlap | Two cases found and fixed (`1102:4428` Z5, `880:20729` footer). |
| Broken variants | None. No component set was edited. |
| Spacing | Auto-layout kept everywhere. Only HUG heights grew. |
| Sport color meaning | Unchanged: blue is running, orange is strength, Z1–Z5 use the existing colors. |
| Charts legible | Yes. Zone bars are proportional to the real bpm. |
| Light mode | The only light variants in the file are shareable arts on page 82, which this mission did not touch. |
| Onboarding clear | Yes (`836:782`, `1103:2299`). |
| Home identity | Kept. Only one sentence changed on 3 Hoje screens (plus twins); the layout is intact. |
| Blocked states promise no forbidden action | Yes. Checked on 31 `645:749`, 10 `1103:2299` and 81 `849:3994` (inventory: no "Começar" in any blocked frame). |
| Screens depend on no fictional data to work | The numbers are design examples, and the HR5 ones were recomputed with the engine's rule. The new frames on 71 use the same values as the fixtures. |

## 3. Motion twins

The same text was applied to every twin found, matched by node path. The strap twin `785:5837` got its 5 rows cloned from the Lucas twin `785:5601`, so the zone-row motion is the one already approved for Lucas.

**Not verified:** playback of each animation. The keyframes of the 3 removed rows of `785:5837` were dropped along with those rows. **Recommendation:** open `785:5837` and play it once.

## 4. For an independent reviewer (suggested: Product/UX + SSCTR for the HR copy)

- 71 HR copy against SSCTR C1–C11, especially C3 (`1102:4302`) and C5 (`760:1588`).
- 10 `1103:2299` copy (sensitive population).
- 40 `661:1215`: "Parou ou sentiu algo fora do normal?" (SSCTR-ABC-S1).

## Verdict

**VISUAL_REGRESSION_REVIEW_PASSED = YES (self-check).**
- All the edited frames listed in §1 were inspected visually.
- The two defects found were fixed and checked again.
- Pending: animation playback for `785:5837`, and the independent review in §4.
