# SSCTR sporting decision for V1 Final Closure (SSCTR-V1FC-DECISION-r1, 2026-11-11)

`SSCTR_V1FC_DECISION.json` next to this file is the authoritative record. Where the two differ, the JSON prevails.

**Reviewer.** An SSCTR-1.0.0 instance as decision author (PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical sporting content only). It is an AI agent with no human credentials and claims no human, clinical or empirical validation. A fresh SSCTR instance judges the implemented candidate. The host injected CLAUDE.md files and a MEMORY.md; they were used only to orient, never as approval or finding.

**Inputs.** Request `bb425388…`, policy `a75be1aa…`, catalog `ceee276a…`, the earlier F08 records (Q05–Q08, FF recheck). No code was run.

**Literature.** Europe PMC worked; PubMed/PMC pages and the publisher refused automated access. Full text read: Smyth 2021, Frandsen 2025, van Poppel 2021; the rest is abstract-only, so confidence is LOW to MODERATE where a ruling leans on it.

## Rulings

| Item | Disposition | Value | Evidence |
|---|---|---|---|
| A eligibility | APPROVE | none beyond the engine's | SWL |
| A long run | APPROVE | 60 | SWL |
| A ladder | APPROVE_WITH_COND | 6×2', 8×2', 5×3', 6×3' / 2' | SWL (LOW) |
| A effort cue | APPROVE | FIVE_K_EFFORT as proposed | SWL |
| A first exposure | APPROVE_WITH_COND | effort-cued, admissible; rung 1 first; **INTERMEDIATE/EXPERIENCED only**, novices keep the threshold ladder | SWL (LOW) |
| A specific / taper weeks | APPROVE | 3 / 1, upper point | WS / SWL |
| A race-week touch | APPROVE | 3×1' / 2', ≥ 3 days out | SWL |
| A race day | APPROVE | window 45, warm-up 12 | SWL |
| A min run days / completion | APPROVE(_WITH_COND) | 2 / today's modes, no long-run threshold | SWL |
| B1.1 continuous, current | APPROVE | as proposed | SWL |
| B1.2 longest run | APPROVE_WITH_COND | ≥ 90, **completed within 30 days** | SWL |
| B1.3 weekly | APPROVE | ≥ 180 min | SWL |
| B1.4 run days | APPROVE | ≥ 4 | SWL |
| B1.5 long-run day time | APPROVE_WITH_COND | ≥ 150; the available time caps the long run | SWL |
| B1.6 race horizon | APPROVE | ≥ 12 weeks, inside the horizon | SWL |
| B1.7 experience | APPROVE_WITH_COND | INTERMEDIATE/EXPERIENCED; **known months < 6 is not eligible** | SWL |
| B2 preparatory plan | APPROVE_WITH_COND | ordinary plan, **long-run target 90**, no automatic switch | SWL |
| B3 long run | APPROVE_WITH_COND | 180 as a cap; the peak-below-target note is keyed to 150 | SWL (LOW) |
| B3 ladder / cue | APPROVE(_WITH_COND) | 2×15', 3×15', 2×20', 3×20' / 3'; MARATHON_EFFORT | SWL |
| B3 specific / taper | APPROVE | 6 / 2; days 14–20 upper, days 7–13 lower | SWL / WS |
| B3 touch / race day | APPROVE | 2×5' / 3'; window 360, warm-up 5 | SWL |
| B3 completion | APPROVE_WITH_COND | below 150; **below 90, the later or shorter event is shown first** | SWL (LOW) |
| B3 race-day text | APPROVE_WITH_COND | adds that fuelling, drinking and heat are not covered | SWL |
| B3 post-event | APPROVE | 7 days without running | SWL (LOW) |
| B3 post-event transition (new) | APPROVE_WITH_COND | **days 8–14 short easy runs only (≤ 30 min); next-block dose from day 15** | SWL (LOW) |
| B3 post-event strength (new) | APPROVE_WITH_COND | **no strength on days 1–3**; to day 14, one light session per 7 days | SWL (LOW) |
| B3 min run days | APPROVE | 4 | SWL |
| B4 | APPROVE | stays outside | SWL |
| C.1 Situation 1 out of V1 | APPROVE_WITH_COND | typed unavailability; no less safe path | SWL |
| C.2 / C.3 | APPROVE | as Q07, CF-OBS-1, Q08 | SWL |

SWL = SUPPORTED_WITH_LIMITS · WS = WELL_SUPPORTED. No ruling rests on PLAUSIBLE_BUT_UNCERTAIN. The exact ladder rungs and caps are implementation choices inside supported envelopes (Midgley 2007).

## Conditions the implementation must meet (all are in the JSON)

- **G.1:** 10K and half-marathon outputs stay byte-identical. Both keep 1 taper week.
- **G.2:** every existing safety and progression rule applies to the new events.
- **G.3:** the race never counts as a long, easy or quality peak, or as the ceiling reference. A marathon test must prove it.
- **G.4:** no pace, zone, VO2max or finish time.
- **G.5:** the catalog changes only as stated. Ultra and VO2_DE_NOVO stay closed.
- **G.6:** a race longer than its window is never an adverse signal.
- **C.1:**
  - Situation 1 is unreachable from every input.
  - The "not 100%" report never counts as a compatible response or as ADVANCE/EARNED.
  - A test shows the D49 cap held across per-sport declared-break chains (QRE-FFC-01).
  - The message covers five points (JSON C.1, condition 5): skip, shorten or stop; missed sessions are not made up; declare a break; seek assessment if symptoms persist or worsen; the race date option. It never says the athlete is fine.

## Why

- **Eligibility.** Rasmussen 2013 links less than 30 km a week before a marathon to about twice the injury risk. Novices have about twice the injury incidence (Videbæk 2015). Single-session spikes above 10% of the 30-day longest run carry more risk (Frandsen 2025).
- **Taper.** Bosquet 2007 and Mujika 2003 support a 2-week progressive taper that keeps intensity. Smyth 2021 links strict marathon tapers of up to 3 weeks to better recreational times.
- **Post-marathon.** Rest restored work capacity sooner than easy running (Sherman 1984, n = 10). Fiber damage lasts through day 7 (Hikida 1983). A week off costs little (Spiering 2021).
- **5K for novices.** Run Clever (Ramskov 2018) covers intensity progression only in runners with 6 months or more, so this record abstains for novices.

## Queue, escalations, expiry

- **Queue:** 5 proposed items (HQ-V1FC-SSCTR-A, B1, B2, B3, C), state QUEUED_FOR_FUNDED_HUMAN_REVALIDATION. Nothing was appended.
- **Escalations:** Founder (the novice 5K abstention, the day 8–14 transition); Product/UX (disclosure wording); G04 (urgency wording stays interim); Engineering (verify G.3 and G.6 in code).
- **Validation:** the skill validator was not run (Python is absent). The JSON was checked with Node. The record has the caller's shape, not `decision.schema.json`.
- **Status:** gate not closed, nothing published.
- **Expiry:** review by 2027-05-11, or earlier on the triggers listed in the JSON.
