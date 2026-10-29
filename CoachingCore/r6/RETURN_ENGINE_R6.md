# Return engine — R6

After a nonclinical break the athlete restarts from current evidence, with the prior tolerated dose as a ceiling, never by a universal percentage rollback. Anything clinical, or possibly clinical, goes to a human. It corrects the R5 root cause in H16 (a known nonclinical return was blocked by a preparation-dimension rule).

Scope: OFFLINE_SYNTHETIC_NODE24_REFERENCE; envelope R6-NONCLINICAL-RETURN. Evidence: `RETURN_ENGINE_R6.json`, demonstration K, trajectories T05, T08, T12, tests labelled return, D08, D09, D22, D34/D35.

## Screening the reason (`src/r6-clinical.mjs`)

Structured category first (travel, work, family, schedule, vacation, weather, equipment, motivation, study, moving, other nonclinical; illness, injury, pain, medical, surgery, pregnancy, postpartum, clinical). Free text in English, Portuguese and Spanish is split into clauses and matched on whole words; explicit denials ("no pain", "sem dor", "sin dolor") cover only what they govern. A clinical category or mention routes to CLINICAL_HUMAN_REQUIRED whatever the flags say; a denial counts only when nothing before it in the clause turns it into an affirmation ("couldn't run without pain" names pain); body parts, fatigue and falls are asked about; and free text alone never confirms a nonclinical break — that needs a structured nonclinical category (in the legacy R5 contract, its structured clinicalReason=false answer). The same screen applies to the intake pause and to the legacy path. Eligibility must be assessed on or after the end of the break.

FREEZE-2 changes:
- **Lexicon (QRE-R6-07).** It now covers common medical conditions, procedures, treatments and symptoms in the three languages (heart attack, stroke, cancer, chemotherapy, fracture, hernia, kidney stones, dengue, nausea, headache, bleeding, stitches, dislocation, panic attack, high blood pressure, among others). A damage verb with a body part in the same clause is a clinical mention ("broke my leg", "quebrei a perna", "me rompí la pierna"). Body parts alone, soreness, cramps, anxiety and treatment are asked about. All 26 of the engineering judge's misses now route CLINICAL or ASK. The screen stays a heuristic: the structured category is the primary safeguard.
- **Clinical flag.** A flag meaning yes in any form (`true`, `1`, `'yes'`, `'sim'`) routes to a human; a flag that is neither yes nor no is asked.

## Stages (`returnAfterPause`)

- **Short** (≤ 10 days): resume the last executed doses; the first quality slot runs easy; the next step waits for executed sessions.
- **Moderate** (≤ 28 days): running re-enters from a current demonstration (a completed conversational easy run after the break began, compatible response and function, within 7 days) or from the reviewed 15-minute entry, and returns to the prior executed dose in two conditional steps, each within the single-run ceiling. Strength re-enters with one effort-guided set at RIR ≥ 4; the prior load is a ceiling and is prescribed again only after a post-break logged entry supports it.
- **Long** (> 28 days): running restarts in restart mode; strength re-establishes by effort; no prior load is prescribed before a post-break log.

The interruption facts must hold together (QRE-R6-06). These are asked, never resolved to the least conservative class:
- days that are not a whole number from 1 to 3650;
- dates that are not dates;
- a start after the end, or an end or start after the review;
- days that disagree with the dates by more than one day.

A demonstration shorter than the 15-minute minimum session is not a demonstration.

EARNED is unavailable during return, and surplus counts only observations after the return began. A pause-driven restart at cold start needs this authority.

## Limits

No clinical return, rehabilitation or illness recovery programming. The engine never interprets a "recovered" label as clearance.

## After FREEZE-1 (SSCTR rounds 7–12; not frozen)

This describes the R6 runtime after FREEZE-1, which is **not frozen**: the SSCTR refused FREEZE-2 in round 12, and under the Founder's bound R6 closes with an explicit blocker (`OPEN_GAPS_R6.md`). The official evidence stays bound to FREEZE-1. Every rule below holds under the SSCTR's weekly-review contract: every elapsed week receives a gating weekly review, with unreported sessions reviewed as missed (a week without one keeps the projection's assumption; owned gap R18).

- **Clinical flags (SSCTR R6).** A clinical eligibility flag that means yes in any form, or a clinical status in any letter case, routes to a human in the intake, the review and the legacy path. "sí" counts. Any other non-boolean flag is asked.
- **Lexicon (SSCTR R7, R11).** Round-7 additions: birth and road or animal accident phrases and words (had a baby, hit by a car, car or bike crash, parto, atropelado, bitten, mordida) are clinical; baby, crash, collision, bite, slipped, escorreguei and resbalé are ambiguous. Locally negated damage is asked ("No broken bones"), and a distant negation does not hide damage. Round-8 additions (R11) include the joined compounds C-section and recém-nascido. Asking pregnancy or postpartum status again at reviews and returns stays an open gap.
- **Moderate return, entry week (author-found, R6-POLICY-4; SSCTR D45).** Every exposure of the entry week is at the entry dose, and exercises first set up in it follow the return steps. A return-entry log above the load before the break is capped there and asked about.
- **Strength sets in a moderate or long return (SSCTR D49).** The ceiling is the last count executed before the break, outside a return step and a phase reduction. Step 2 is max(1, min(ceiling − 1, entry + 1)). After the steps the count comes back one set per executed week without a phase reduction, up to the ceiling, and goes above it only through a later block with no return-step exposure. Phase reductions apply on top, in the steps too. Return weeks earn no block set.
- **Restart run history (author-found with D47).** A long-interruption restart clears the achieved run peaks and the longest continuous run. A return with a single long-run day completes its steps in projection (SSCTR R13).
- **The end of the return (SSCTR D51).** The return ends with the exercises in use. Exercises not used during it carry no return step once those in use finish theirs, rotation resumes on its cadence, and later new exercises start with normal establishment.
- **Executed exposures only (SSCTR D52).** An exercise first prescribed in a session dated inside the pause has never been performed, so it is established by effort when it reappears. The 28-day clock of an exercise not used during the return counts from its last executed exposure. A never-performed exercise prescribed while an exercise in the return is still at the entry step gets the entry dose, and joins the return once performed. A return clears the regain cap of an earlier re-establishment (SSCTR D53).
