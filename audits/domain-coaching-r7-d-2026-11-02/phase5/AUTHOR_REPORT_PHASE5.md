# R7-D Fase 5: relatório final do autor independente do novo H1

Registrado pelo coordenador em 2026-11-08, sem edição, antes do selo e de qualquer execução. É o que o autor afirma; os juízes conferem contra os casos (PREREG-8 Δ55: o coordenador não dá nota). Conferência do coordenador antes do selo, só estrutural:
- `check-corpus.mjs`: 0 erros, 0 avisos.
- `check-corpus-8.mjs`: 0 erros e 15 avisos mantidos. Todos são referências de dia em H04, H09, H22, H23, H26, H31, H32 e H33. As `domainNotes` de cada um desses casos dizem que o dia é fixo e por quê.
- 39 casos (limite 34–40) e 130 passos de timeline (limite 80–130). Os ids vão de `R7D-H01` a `R7D-H39`, em sequência, com `corpusRevision` `R7D-FINAL-2`.
- O SHA-256 do corpus (`24df5704…9dba`, 372.099 bytes) e o do builder (`727ec5bb…d2c4`) são os do manifesto. Uma cópia do builder, rodada fora do repositório, reproduz o corpus byte a byte.
- Os hashes das dez entradas permitidas e dos dois checadores batem com os bytes de `aedcd5c` (o HEAD). O commit mais recente de qualquer um deles é `c7c72e5`.
- `authorStartedAt` (2026-11-08T14:05:56.357Z) é posterior:
  - à criação do R7D-FREEZE-6 (14:03:19.912Z);
  - ao commit dos instrumentos `c7c72e5` (13:20:53Z);
  - ao do freeze `40daadd` (14:03:41Z);
  - ao da verificação `aedcd5c` (14:05:20Z).
- `sealedAt` (15:48:13.102Z) é a hora de gravação do corpus. O manifesto foi gravado depois (15:49:57Z).
- Manifesto:
  - as oito marcas de independência estão como o brief pede;
  - `generationMethod` `INDEPENDENT_AUTHOR`, `seed` nulo, `evaluationCount` 0;
  - `runtimeFreeze` `R7D-FREEZE-6`, com o digest do manifesto do registro (`be0765b6…e928`).
- Níveis de atleta, contados no material longitudinal, de pausa, retorno, correção ou semana de prova:
  - com NONE ou NOVICE em ao menos um esporte: H06, H07, H09, H11, H15, H22, H23, H28, H31 e H33, entre outros;
  - INTERMEDIATE nos dois esportes: H16, H17, H20, H21, H27, H29, H30, H32, H34 e H35, entre outros.

**Divulgação para os juízes (independência, PREREG-8 Δ55).**
- O autor relata que o host injetou no seu contexto, no início, três arquivos que ele não abriu:
  - `C:/Users/carva/.claude/CLAUDE.md`, sha256 `c75718d0…09c6`;
  - `MyApp/CLAUDE.md`, sha256 `e657d059…22e6`;
  - o índice de memória automática `MEMORY.md`, sha256 `32ba3f25…2b00`.

  O coordenador registra esses hashes como os arquivos estão agora. Pela hora de gravação, nenhum deles mudou depois de `authorStartedAt`.
- O índice resume cada fase anterior do R7-C e do R7-D em uma linha. Ele inclui:
  - o resultado da Fase 4: holdout rodado uma vez no FREEZE-5, NOT_READY e INVALID_HOLDOUT por cobertura;
  - os nomes dos bloqueios SSCTR-P4-F01 (D49) e QRE-P4-F01 (P03(d));
  - regras já fechadas, como "reentrada só por uma semana inteira executada do plano".

  Não traz conteúdo de caso, código do runtime nem saída do runtime sobre este corpus.
- O manifesto lista essa injeção em `inspectedFiles` com `sha256` nulo e mantém `outputsInspectedBeforeSeal:false`. O manifesto do autor da Fase 4 não tem essa divulgação.
- O juiz de qualidade decide se isso afeta a validade.

---

The R7-D final holdout H1 (R7D-FINAL-2) is written and sealed. It has 39 cases and 130 steps, and it passes `check-corpus.mjs` with 0 errors and 0 warnings. 130 steps is exactly the upper bound of 80–130. I ran no git command, deleted nothing, never ran the coach or the harness, and opened only the brief, the 8 interface files and the schema.

**Files** (in `C:\Users\carva\Desktop\myApp\MyApp\.claude\worktrees\domain-coaching-r7-d\audits\domain-coaching-r7-d-2026-11-02\final2\`):
- `build-final-corpus.mjs` (sha256 `727ec5bb009c7dbad3b869f6350d6bc9044b3ed39c7be5bd2faab9a3a88cd2c4`)
- `R7D_FINAL_HOLDOUT_2.json`
- `FRESHNESS_MANIFEST.json`, written last; nothing was changed after it.

**Seal**
- corpus SHA-256: `24df57049442e1041f2ba09bdb08fccc4de5ccbd2c894bab680f6d33719c9dba` (372,099 bytes)
- authorStartedAt: 2026-11-08T14:05:56.357Z
- sealedAt: 2026-11-08T15:48:13.102Z
- cases: 39; steps: 130

**One independence point you need to judge.** At session start the host automatically put the user's and project's CLAUDE.md and an auto-memory index into my context. I did not open them. The index has one-line summaries of earlier R7 phases, including that the Phase 4 holdout ended INVALID on coverage and the names of earlier blockers. It contains no case content, no runtime code and nothing from runs of this corpus, and I used none of it. The manifest lists it under `inspectedFiles` with `sha256: null` and keeps `outputsInspectedBeforeSeal:false`.

**Cases** (main stratum: one line)
- H01 Cold start / taper (half marathon): 12 weeks, build, calf fatigue in the taper, race, week after; same-day report.
- H02 Cold start close 10K / race week between breaks: touch, shakeout and race; strength and shakeout recover badly.
- H03 Cold start strength-first on machines: logged as prescribed, own heavier setting, confirmation, failed heavier attempt.
- H04 Cold start balanced hybrid, shared days split AM/PM: duplicate, in-time and late correction, re-send, double conflict.
- H05 Cold start 4-week general / events: skill swap, pain swap stating a travel break, clearance, two reviews, last-week schedule change refused.
- H06 Cold start absolute beginner, bodyweight / short return on a Thursday after Monday–Wednesday reported not done.
- H07 Built from walk/jog toward a 10K (16 weeks) / full week between breaks with optional walks undone.
- H08 Cold start experienced in both / chain of four breaks, first two touching.
- H09 Cold start kettlebell-only / full week between breaks, later break's start time on that week's last session day; correction moving its start later.
- H10 Cold start partial wearable (strength by type and duration only) / always reports a week late.
- H11 Cold start more chosen days than capacity / full week between breaks with optional walks undone.
- H12 Safety: eligibility unknown.
- H13 Safety: persistent pain at onboarding.
- H14 Scope: 16-year-old.
- H15 Longitudinal: 5-week silence, empty review on the last week's first evening, answered with a declared break.
- H16 Longitudinal: silence while machine lifts are logged (heavier setting, then equal second log); unavailable-day request; "no runs" answer.
- H17 Longitudinal: silence; travel equipment change in the last week; "all done except two long runs" answer.
- H18 Item 9: break stated with a pain flag, clearance, then reviews.
- H19 Item 9: break in a return report with an illness flag (novice), clearance, then reviews.
- H20 Item 2 (break stated while under way) and item 13 (Thursday return).
- H21 Item 10: long and short breaks touching; relation answered "separate".
- H22 Item 10: days between; relation answered "corrects".
- H23 Item 10 / 11: separate; sessions between asked about; one isolated run (novice).
- H24 Safety, clinical cause / items 10 and 9: flu break, then a work break, clearance, flu restated as a nonclinical cold.
- H25 Item 8: break stated with a schedule change, fatigue report before the review, both re-sent; same-day report.
- H26 Item 8: break stated with a goal change, re-sent; race date moved.
- H27 Item 11 race week: race touch at half its minutes, race cancelled.
- H28 Item 11 race week (half marathon): strength and shakeout adverse, touch and race fine.
- H29 Item 11: strength session on the earlier break's first day, strength missed between; start time answered.
- H30 Item 11 (strength logged without reps in reserve) and item 12 (correction by length and last day, uncovering an unreported run).
- H31 Item 14: answer through a return report.
- H32 Item 14: later break confirmed first, then answer in the week's review.
- H33 Item 14: answer through another event (RECOVERED); strength beginner.
- H34 Item 15: chain of three breaks.
- H35 Taper (10K) and item 2 (finished 17-day break applied in a review, moderate return).
- H36 Long return: 7 weeks, restart on four run days, short demonstration run.
- H37 Longitudinal: shortened, mixed and adverse runs; item 5 confounded heat run plus a fine trail run as control; repeated local fatigue.
- H38 Data: duplicate, contradiction, corrections, out-of-order report, clock in the future, time zones.
- H39 Learning: pattern versus noise, consent revoked.

**Checker results**
- `check-corpus.mjs`: 0 errors, 0 warnings.
- `check-corpus-8.mjs`: 0 errors, 15 warnings, all kept. Every one is a day reference to:
  - a week no adopted decision re-planned, because only ASK or clinical decisions came before it; or
  - a week whose named sessions had already happened before the adopted decision.
  - Each of these cases explains this in `domainNotes`.
  - H04 s3: week 1, days 0 (twice), 2 and 4. The double conflict concerns Monday of week 2.
  - H09 s2: week 3 strength, days 2 and 6. The Friday session needs its own observedAt.
  - H22 s3: week 3, days 0–3. The bulk form would include sessions inside the later break.
  - H23 s5: one answer reference, week 3 day 1.
  - H26 s2: week 2 day 0.
  - H31 s3 (week 3 day 0), H32 s3 (week 3 day 0), H33 s3 (week 2 day 0): the late first-day strength reports.

**Required coverage** (number of independent cases; ⁺ = the extra case of an (R) item)
1. Long silence: H15, H16, H17 (3).
   - (R) direct answer next step: H15, H16, H17⁺.
   - (R) question and answer in the last week: H15, H16, H17⁺.
   - (R) strength session on or after the answer day: H15, H16, H17⁺.
2. Break in a review with no question pending: H20 (still under way), H35 (finished) (2).
3. Same-day day-precision report: H01, H25 (2).
4. Machine loads: H03 (confirmation; heavier setting that missed target), H16 (equal second log) (2).
5. Confounded run with adverse recovery, plus control: H37 (1).
6. Corrections and duplicates: H04, H38 (2). Each has an in-time correction, a late correction, a phone + watch duplicate and an exact re-send.
7. Clinical carrier: through H15–H17 (CARRIER_CLINICAL listed); the answers make sense directly.
8. Break stated with another event: H25, H26 (2). H25 has a different event before the review; both re-send the original event.
9. (R) Break under a clinical route, clearance, reviews: H18 (pain flag), H19 (illness flag), H05⁺ (pain substitution by pattern). Clinical-cause break, cleared, restated by name as nonclinical: H24 (1).
10. Two or more breaks before the first is applied: H21, H22, H23, H24 (4).
    - later shorter, starting the day after: H21
    - days between: H22, H23
    - separate: H21, H23; corrects: H22
    - sessions between reported only when asked: H23
    - earlier clinical, later not: H24
11. Two separate breaks with training between:
    - isolated training: H23
    - (R) full week in every sport: H09, H07, H11⁺
    - one sport only: H27, H29, H30, H31, H32, H33
    - (R) optional sessions undone: H07, H11⁺. Race week with touch or race missed: H27, where the touch at half its minutes counts as not done and the race was cancelled. This is borderline; no case has a touch missed outright.
    - strength without reps in reserve: H30; later break with a start time on the last session's day: H09
    - (R) race week of only touch, shakeout and race: H02, H28, H27⁺; touch at half its minutes: H27
    - strength on the earlier break's first day, then strength missed: H29
    - (R) that race week with strength and shakeout adverse, touch and race fine: H02, H28⁺
12. Correction of the later break by name: H09 (start moved later), H30 (only length and last day; uncovers an unreported run) (2).
13. Mid-week return: H06, H20, both on a Thursday (2).
14. Late first-day strength report: H31 (return report), H32 (weekly review, later break confirmed first), H33 (another event) (3).
15. Chain of breaks: H34 (three), H08 (four, first two touching) (2).
- Athlete level:
  - Beginners in item or return material: H06, H07, H11, H23, H33 (5).
  - Intermediates: H02, H09, H20–H22, H27–H32, H34, H35 and others.

**Interface gaps noticed** (also in the manifest)
1. The schema still requires `substitution.exerciseRef.day`, but delta 8 allows `{week, pattern}`. The checker accepts the pattern-only form, which H05 uses.
2. `loadsByPattern` takes one value per pattern, and the author cannot know which exercise or load convention the coach puts in a pattern.
3. There is no pattern-level way to log strength without reps in reserve, or a heavier setting that missed its target. Explicit `exercises` need the coach's exercise ids, so H03 and H30 use the athlete's known ids; those logs won't match if the coach chose others.
4. The bulk form cannot select part of a week's same-sport sessions, which forces the 15 day references above.
5. No assertion type reads the returned record (break readings, re-entry week, load questions, missing inputs), so those outcomes are written as JUDGED expectations.
6. The start-time question has no documented question kind.
7. Whether a race week holds only touch, shakeout and race depends on what the coach composed earlier and on offers the author can't foresee.
8. The interface doesn't say how a weekly review placed before its week's last session is read. The checker accepts it, and several cases rely on it.
9. No rule says whether an event that came with an unreported-training question is re-sent after the answer. H16 and H17 re-send it.

The probe, patch and manifest-writer scripts I used are in `C:\Users\carva\AppData\Local\Temp\claude\858165ffefe5d744\41d3355a-4a33-41ed-bd61-2af20361ff64\scratchpad\p5-author-20261108\`.
