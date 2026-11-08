# R7-D Fase 4: relatório final do autor independente do H1

Registrado pelo coordenador em 2026-11-08, sem edição, antes do selo e de qualquer execução. É o que o autor afirma; os juízes conferem contra os casos (PREREG-7 Δ46). Conferência do coordenador antes do selo, só estrutural:
- `check-corpus.mjs`: 0 erros, 0 avisos;
- 35 casos, 98 passos de timeline;
- os hashes das nove entradas permitidas batem com os arquivos de `58d6766`;
- `authorStartedAt` (2026-11-08T02:22:52.247Z) é posterior ao freeze (2026-11-07T22:29:32.639Z) e ao commit dos instrumentos (2026-11-08T02:21:24Z);
- níveis de atleta (Δ44): iniciantes F11, F13, F15, F25, F30, F35; intermediários F12, F24, F26, F28, F29, F31–F34.

---

## R7-D final holdout (H1): sealed

The corpus is written, passes `check-corpus.mjs` with **0 errors and 0 warnings**, and the manifest was written last. I changed nothing after that and ran no git commands.

- **Corpus SHA-256:** `2f2a5d270c96117dfa5a8ef3c9b8a8ba2d380c7ec27c0835a7af8a4834b63b18` (290,647 bytes)
- **authorStartedAt:** `2026-11-08T02:22:52.247Z` (after the R7D-FREEZE-5 creation time)
- **sealedAt:** `2026-11-08T03:52:36.663Z`
- **Size:** 35 cases (limit 32–36) and 98 steps (limit 70–100)
- **Builder SHA-256:** `fe3bc36b9bf43fe902e5928afc2b037ec5da20f4cdeb1af28f9556df3aeca763`

The files are in `audits/domain-coaching-r7-d-2026-11-02/final/`:
- `build-final-corpus.mjs`
- `R7D_FINAL_HOLDOUT.json`
- `FRESHNESS_MANIFEST.json`

The manifest script is in the author's scratch folder (`write-manifest.mjs`).

I opened only the brief, the seven interface files and the schema, and ran `check-corpus.mjs` without reading it. The manifest records every command, including one heredoc append that failed on shell quoting before it ran, so nothing was written by it.

## Cases
| Id | Main stratum | What it tests |
|---|---|---|
| F01 | Cold start, events | Half marathon in 16 weeks, Wednesday start; a confounded long run with adverse recovery and an impaired next day, versus a confounded run that went fine; race moved a week earlier |
| F02 | Cold start, taper | 10K in 7 weeks, experienced runner; late sync of the build, lower-body fatigue in the taper, race, week after the race |
| F03 | Cold start, events | Balanced hybrid with a shared day in the same confirmed turn; a double conflict on that day |
| F04 | Cold start, events | 4-week general block with far more chosen days than capacity; unreported vs missed sessions; schedule change in the last week |
| F05 | Cold start, learning | Experienced in both, with consent; one noisy hard run vs the same lower-body fatigue twice in a row |
| F06 | Cold start, events | Kettlebell-only athlete; travel week with bodyweight only |
| F07 | Restart, events | Walk/jog restart toward a 10K over 16 weeks; an unavailable day |
| F08 | Safety | Eligibility unknown |
| F09 | Safety | Persistent pain at onboarding |
| F10 | Scope | Adolescent (16) asking for a 10K |
| F11 | Longitudinal (item 1) | Seven weeks of silence; empty review, question and answer all in the last week |
| F12 | Cold start, longitudinal | Partial wearable history (strength by type and duration only); five weeks without run reports; answer with shortened runs and two missed long runs |
| F13 | Longitudinal, return | Seven weeks of silence answered with a declared break; long return / restart |
| F14 | Item 2, item 3 | Date-only run reported the same morning; finished family break stated in a review |
| F15 | Item 2, beginner | Absolute beginner, bodyweight only; break stated while still under way, then applied by the next review |
| F16 | Item 4, no consent | Hybrid on machines: logged as prescribed, date-only same-day report, own heavier settings, confirmation, equal second log |
| F17 | Item 4, cold start | Strength-first, strength-only: a heavier setting, a lighter setting that does not fit, an equal second log |
| F18 | Data, item 6 | Phone + watch duplicate, in-time correction, late correction, exact re-send |
| F19 | Data | Contradiction between devices, week arriving out of order, clock in the future, training in another time zone, correction |
| F20 | Items 8, 13 | Break stated with a schedule change; fatigue report before the next review; return on Thursday after Mon/Tue not done; both events sent again |
| F21 | Item 9 | Break stated while eligibility shows pain; qualified clearance; reviews that do not restate the break |
| F22 | Item 9, events | Skill-mismatch substitution; then a substitution with pain carrying a break; clearance |
| F23 | Items 9, 10 | Flu break (clinical cause), then a nonclinical break; clearance; the first break restated by name as nonclinical |
| F24 | Item 10 | Later break, shorter, starting the day after the earlier one ends; athlete says "separate" |
| F25 | Item 10, beginner | Overlapping later break; athlete says it corrects the earlier one |
| F26 | Item 10 | Days between two breaks; sessions between unreported until asked; separate |
| F27 | Taper (half marathon) | Late sync of the build; shortened hard run in the taper; race; week after |
| F28 | Items 11, 12 | One isolated run between a holiday and a trip; trip corrected by name to start later, uncovering unreported sessions |
| F29 | Items 11, 12 | A whole week done in both sports between breaks; later break has a start time on the day of the week's last session; corrected with only its length and last day |
| F30 | Items 11, 13, 14 | Week between: all runs done, strength missed; return on a Friday after a missed run; late lift on the earlier break's first day; start time answered in a return report |
| F31 | Items 11, 14 | Strength missed, then logged without reps in reserve; late lift; later break confirmed first; start time sent with another event; then the week's review |
| F32 | Item 11 | 10K race week between breaks: race touch at half its minutes, optional shakeout undone, race finished, strength done |
| F33 | Item 11 | Half-marathon race week between breaks: strength and shakeout recover adversely, race touch and race go well |
| F34 | Items 15, 11 | Chain of three breaks: a run-only week, then a race week with the race missed and strength done |
| F35 | Items 15, 11, beginner | Chain of three, the first two touching; walk/jog week with optional walks undone and strength missed |

## Required coverage (case ids, number of independent cases)
1. **Long silence:** F11, F12, F13 (3). Last-week question and answer: F11. Clinical and refusal carriers are listed as relations on F11, F12 and F13.
2. **Break with no pending question:** F14 finished, F15 under way (2).
3. **Same-day, date-only report:** F14, F16 (2).
4. **Machine loads:** F16, F17 (2). Confirmation in F16; equal second log in F16 and F17; setting that does not fit in F17.
5. **Confounded run:** F01, with its control in the same case (1).
6. **Corrections and duplicates:** F18 has all four parts; F19 adds a device conflict and a late correction (2).
7. **Clinical carrier:** carried by item 1's cases F11, F12, F13; their answers are nonclinical, so they mean the same directly and after clearance.
8. **Break stated with another event:** F20, F24, F25, F26, F28–F35 (12). F20 has a second event before the review and both events sent again.
9. **Break under a clinical route:** F21 (eligibility pain), F22 (substitution with pain) (2). Clinical-cause break, cleared, then restated by name as nonclinical: F23 (1).
10. **Two breaks before any return:** F23, F24, F25, F26 (4). Touching and shorter: F24. Overlap: F25. Days between and sessions asked: F26. "Separate": F24, F26. "Corrects": F25. Earlier clinical: F23.
11. **Separate breaks with training between:** F28–F35 (8).
    - isolated session: F28
    - whole week in both sports: F29
    - one sport only: F30, F31, F34, F35
    - optional sessions undone: F35, F32
    - race missed: F34
    - strength without reps in reserve: F31
    - start time on the week's last-session day: F29
    - race week of touch, shakeout and race: F32, F33
    - race touch at half its minutes: F32
    - lift on the earlier break's first day with strength then missed: F30
    - adverse strength and shakeout with a good touch and race: F33
12. **Later break corrected by name:** F28 (starts later, uncovers unreported sessions), F29 (length and last day only, also starts later) (2).
13. **Mid-week return:** F20 (Thursday), F30 (Friday) (2).
14. **Late lift on the earlier break's first day:** F30, F31 (2). Channels used: return report (F30, and F31 for confirming the later break first), another event (F31), the week's review (F31).
15. **Chain of breaks:** F34, F35 (2). First two touching: F35.

**Athlete levels:**
- **Beginners (NONE/NOVICE) in that material:** F11, F13, F15, F25, F30 (novice strength), F35, plus F27 in the taper (novice strength).
- **Intermediates:** F12, F24, F26, F28, F29, F31, F32, F33, F34, and more.

**Other strata:**
- Cold start: 10 or more cases (F01–F07, F12, F15, F16, F17, F27).
- Safety and scope: F08, F09, F10, F21, F22, F23.
- Events: F01, F03, F04, F06, F07, F20, F22.
- Nonclinical return: short F15, moderate F14, long F13.
- Taper: F02 (10K) and F27 (half marathon).
- Data: F18, F19.
- Learning: F05 (with a consent-off relation); no consent in F16.

## Interface gaps (also listed in the manifest)
1. The answer shorthand is defined for UNREPORTED_TRAINING only. It is not stated whether it also expands for TRAINING_BETWEEN_BREAKS, so F26 and F28 answer with explicit per-session facts.
2. After a proposal is adopted, references to earlier weeks depend on the client still resolving them in the plan in force. This affects F28, F30 and F31.
3. The race week's make-up is the coach's choice, so I cannot force a week of only touch, shakeout and race (items 11f and 11h). Bulk facts by role are used, and they expand to nothing if a session is absent.
4. When a "next heavier setting" row appears cannot be known in advance. Own settings are given per movement pattern, so two machine exercises of the same pattern cannot get different settings; I avoided PULL settings.
5. `startedAt` is used by deltas 3, 6 and 7 but is missing from the RETURN_AFTER_PAUSE field list in interface 1.
6. It is not stated whether `asPrescribed` records a load in a known unit when the row says ESTABLISH. The whole-week case F29 therefore uses known loads.
7. Execution reports have no reason field; context lives only in step notes.
8. It is not stated whether reports inside an asked (not applied) event count against a month of silence. I placed reports so no unintended silence arises.
9. Two behaviours are unspecified: a report clocked in the future (refused alone, or the whole review held), and a schedule change sent directly in the last week. The F19 and F04 expectations about them are JUDGED.
