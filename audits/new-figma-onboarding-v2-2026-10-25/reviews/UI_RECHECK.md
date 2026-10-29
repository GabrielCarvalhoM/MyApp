# UI re-check — OB-2 onboarding, account and paywall · round 2 · 2026-10-26

Reviewer: the same UI & Experience Designer judge as round 1 (fresh instance, Opus 5.5, max effort). The judge did not author anything under review and worked read-only.
Rubric: `evals/UI.md` 1.0.0.
Figma: file `TYR10AIrquCpKvKL3eyXyO`, the live file on 2026-10-26, after the author's round-2 pass ("Round 2" in `ONBOARDING_V2.md`).
Round 1: [UI_REVIEW.md](UI_REVIEW.md), NOT_UI_READY with M1–M3. That file is unchanged.
No Figma edits were made. This file is the only write.

## Verdict: **UI_READY**

All three MUST findings are closed and verified on renders. Eight of the ten SHOULD findings are closed. Two SHOULD findings remain open; both are new and small, and neither blocks UI_READY:
- **N1:** the ON-V7 action bar floats 39 pt above the frame bottom.
- **N2:** the ON-02c note promises a close X that is not drawn.

Fix both before promotion. The COULD findings left open are listed below.

## What was rendered and measured

**Renders.** Each frame was rendered at 1x, enlarged where needed:
- ON-01 and its copies: ON-01 2/3, ON-01 3/3, ON-01r, ON-01s.
- ON-11, plus the lb · ft state `443:4723`.
- ON-02 and ON-02b.
- ON-08 and PP-01.
- ON-12a, ON-12b and ON-12c.
- ON-06, ON-14b and ON-V7b.
- PP-03.
- ON-15b on arrival `444:4793`, ON-15b after the act `397:4845`, and ON-15d `444:4889`.
- AC-04f `300:2889` and its variants `445:13343` and `445:13387`.
- ON-02c, ON-V7, ON-V5 and ON-16.
- AD-04 `148:1717`, a quick look only.

**Motion.** `get_motion_context` was run on ON-08. Videos were exported for ON-01 (11.4 s) and ON-08 (5.3 s), and frames were sampled every 0.2–0.8 s.

**Scripts.** All were read-only `use_figma` runs:
- A scan of 40 page-2 frames: text partly clipped by an ancestor, content crossing a pinned bar, unstyled numbers, and the explicit variable mode.
- A token contrast scan of 550 text segments.
- Sizes of the interactive instances.
- The text of the direction document and of the notes.

**Pixel contrast.** About 30 regions were measured from the renders. The scratch files are temporary, in the session scratchpad `…\scratchpad\judge-ob2\`:
- `r2/`: renders;
- `z2/`: enlarged crops;
- `v2/`: videos and contact sheets.

## 1 · MUST findings

| ID | State | Rendered evidence |
|---|---|---|
| M1 · ON-01 carousel slide 2 clipped | **CLOSED** | The slide-2 headline is now two lines ("Cada treino guiado, do tiro à última série."). Text block: `Texto` at y 412, body render y 502–544, inside `Slide 2`, which clips at 604. That is 60 pt clear of the clip and 78 pt above the dots at 622. The same holds in ON-01, the 2/3 and 3/3 statics, ON-01r and ON-01s. The ON-01 video shows slide 2 complete at 4.0–6.4 s. The scan finds no partly clipped text in any of the 40 frames. Crops: `z2/on01-2-hero.png` and `v2/sheet_on01_00.jpg`. |
| M2 · ON-11 height unstyled | **CLOSED** | `121:1080` is now "179" in Número/Médio (Sofia 18) plus " cm" in Texto/Meta. It matches the weight field. Crop: `z2/on11-fields.png`. |
| M3 · ON-02 day letters under 4.5:1 | **CLOSED** | The letters now use texto/secundário (Texto/Legenda). On the lit card they measure 6.78, 6.96, 7.26, 7.42, 7.65, 7.75 and 7.67:1 (S to D). ON-02b gives the same values. |

## 2 · SHOULD and COULD findings from round 1

| ID | State | Note |
|---|---|---|
| S1 · motion loops | CLOSED | The ON-07, ON-09, ON-16 and PP-03 notes, and the motion block `335:3501`, say "toca uma vez, não repete". Only the carousel and the ON-08 dots repeat. The Figma timelines still loop, which is a tool limit; the text now carries the rule. |
| S2 · no pause | CLOSED | A touch or drag pauses the carousel. Auto-advance stops after one cycle. With VoiceOver the carousel does not auto-advance and is one adjustable element. The ON-08 dots stop after 3 passes. Sources: the ON-01 note `118:877` and blocks `335:3501` and `357:3396`. |
| S3 · stale direction document | CLOSED | The progress dash now fills "em branco". The accessibility block says "Etapa n de 14". ON-13 is marked as retired. The ON-16 text and timing match the frame. |
| S4 · ON-08 direction cue | CLOSED | Arrowheads `445:13330` and `445:13335` sit where both lines enter the Vilumo tile. They fade in at 1.0–1.2 s, right after the lines finish drawing. Crop: `z2/on08-diagram.png`. |
| S5 · PP-01 last card under the bar | CLOSED | The bottom padding is 169. The last card ends at y 1442 and the bar starts at 1458, so the card clears it by 16 pt. Crop: `z2/pp01-bottom.png`. |
| S6 · ON-15b double inset and divider | CLOSED | The consent row aligns with the card text at x 33, with no divider. This holds in all three ON-15 variants. |
| S7 · orange glyph on ON-V7b | CLOSED | The calendar glyph is now neutral. |
| S8 · hit areas | CLOSED | "Dia da semana" is now 44×44 on ON-12a, ON-12b and ON-12c. Block `357:3396` documents a 44-pt hit area for the 36-pt units switch, for text links and for text buttons. The PP-03 links moved up to y 793, 30 pt above the home indicator. |
| S9 · shift times | CLOSED | The time values ("18:00 – 20:00", "06:30 – 08:00") are now Número/Hora (Sofia 17) on ON-12a, ON-12b and ON-12c. |
| S10 · lb · ft state | CLOSED | `443:4723` shows "5′ 10″" (numbers in Número/Médio, primes in Texto/Meta) and "172 lb", with the switch on lb · ft. Note `445:13436` is present. See N4. |
| C1 · ON-14b footnote at the bar | CLOSED | The footnote ends at y 747 and the bar starts at 753. |
| C2 · PP-03 tag crowding | PARTIAL | The gap is now 6 pt (it was 2). That is acceptable. |
| C3 · day rows misaligned | CLOSED | The circle positions on ON-12a, ON-12b and ON-12c are identical (x 20 … 329, 44 pt each). |
| C4 · moon as the rest glyph | OPEN | It is unchanged on ON-02, ON-16, PP-01 and PP-04. This is a system-wide choice. |
| C5 · ON-08 composition | OPEN | The arrowheads were added (S4), but the chips still float apart from the flow. |
| C6 · ON-02 empty lower third | CLOSED | The upload, 18+ and D10 lines now fill the lower part. |
| C7 · Selo token and description | CLOSED | The description documents the token exception (17.8:1). The `&quot;` entities are gone. |
| C8 · flattened carousel screens | CLOSED | The ON-01 note documents them as static illustrations to re-export. |
| C9 · ON-06 resting state | PARTIAL | The note and "Por tela" say nothing is selected on arrival, but no resting frame is drawn. |
| C10 · reason line placement | PARTIAL | On ON-06 the reason now sits directly under the recommended option. On ON-14b the "Recomendado" still has no reason line; that copy needs SSCTR. |
| C11 · inactive dots and dashes | OPEN | Unchanged. They pre-date OB-2. |
| C12 · items that pre-date OB-2 | PARTIAL | The 44-pt rule now covers text buttons. The tab-bar labels are still 4.37:1 (token scan, ON-02c and the carousel mock). The back buttons are still 40×40. |
| R1 · run window (Architect) | PARTIAL | The PP-01 long run is now "Sáb 07:00", inside 06:30–08:00. ON-12b still allows "Longão até 2 h" inside a 1 h 30 window. This is for the Architect. |
| R2 · "Sexo" label | N/A | It is not a UI item and is unchanged. |
| R3 · ON-02c dismissal | PARTIAL | The note now says the notice closes with an X or when the person leaves Hoje, but no X is drawn. See N2. |

## 3 · New and changed frames

These frames were checked for clipping, unstyled numbers, contrast, hit areas and overlap with the bar.

| Frame | Result |
|---|---|
| ON-15b on arrival `444:4793` | **Pass.** The switch is off. The knob is white on the track and the label measures 16.2:1. The consent body measures 7.78:1. The consent act sits above the bar on an 852-pt screen. |
| ON-15d `444:4889` | **Pass**, with COULD **N5**. The info text measures 5.97:1. |
| ON-15b after the act `397:4845` | **Pass.** It has the same layout as on arrival. |
| AC-04f `445:13343` and `445:13387` | **Pass.** The body measures 8.56:1, and the buttons are at least 44 pt. They match AC-04f `300:2889`. |
| ON-02b `300:2971` (rebuilt) | **Pass.** It matches ON-02 and adds the offline banner (7.06:1). The day letters measure 6.78:1 or more. The D10 line ends at y 820 inside scrolling content (bottom padding 140). |
| ON-11 lb · ft `443:4723` | **Pass**, with COULD **N4**. |
| ON-V7 `126:1887` (copy changed) | **SHOULD N1**, below. |
| AD-04 `148:1717` (redrawn, quick look) | No failure seen. |

Scans across all 40 frames found:
- no text partly clipped;
- no content crossing a bar;
- every frame with an explicit variable mode;
- unstyled numbers only inside the carousel's documented illustration copies;
- new or changed text all at 4.5:1 or above (550 segments checked). The only exception is the tab-bar labels that pre-date OB-2 (C12).

## New findings

**N1 · ON-V7 `126:1887`, SHOULD: the bar is not at the bottom of the frame.**
- The frame grew to 1049 pt, but `Ações` (`126:1996`) stays at y 911–1010, and the home indicator at 997.
- This leaves an empty band of 39 pt below the indicator. The last option ends 4 pt above the bar. Crop: `z2/onv7-bottom.png`.
- **Fix:** pin the bar and the indicator to the frame bottom, or return the frame to 1010.

**N2 · ON-02c `397:13488`, SHOULD: the note promises an X that is not drawn.**
- The note `400:13238` says the notice "fecha com o X ou ao sair do Hoje".
- The notice instance `397:13634` has only the icon, the text and the link. Crop: `z2/on02c-notice.png`.
- **Fix:** draw the X with a 44-pt hit area, or reword the note.

**N3 · ON-01 and its copies, COULD: the text block now overlaps the device mock.**
- The block moved up to y 412. It overlaps the device mock (which ends at y 460) and its fade (which ends at y 462) by about 48 pt.
- The bottom edge of the fade shows as a faint band between the two headline lines. It measures about 1.06:1 and is visible only when zoomed. Crop: `z2/on01-hero.png`.
- **Fix:** end the fade above the text, or extend it to the dots.

**N4 · ON-11 lb · ft, COULD: the prime marks are small.**
- The ′ and ″ marks are 12-pt Texto/Meta beside 18-pt numerals, so "5′ 10″" can read as "5 10" at small sizes.
- **Fix:** consider "5 ft 10 in", or larger primes.

**N5 · ON-15d, COULD: the referral line starts under the bar at rest.**
- On an 852-pt screen the referral line (y 730–822) starts under the pinned bar (y 753) before any scroll. The message about what happens without consent therefore needs a scroll.
- **Fix:** consider placing it above the switch.

**N6 · PP-03, COULD: the plan cards sit close to the bar.**
- After the cards moved up, they end 6 pt above the bar (y 674 against 680). This is tight but clear.

**Copy note (not UI).** The slide-2 headline lost "primeiro" to fit two lines ("do tiro à última série"). The copy owner may want to confirm the wording.

**Record note.** The round-1 render of ON-02 (2026-10-26) did not have the upload line, the 18+ sentence or the D10 warning. This matches the author's note that those lines were missing and were restored.

## Limits

- Figma renders at 1x, and the videos are low quality.
- No device check was done for VoiceOver, Dynamic Type, Reduce Motion or the ES/EN strings.
- Prototype links were not exercised.
- Only the ON-01 and ON-08 videos were re-rendered. The ON-07, ON-09, ON-16 and PP-03 timelines were not re-rendered in round 2; their notes were read instead.
