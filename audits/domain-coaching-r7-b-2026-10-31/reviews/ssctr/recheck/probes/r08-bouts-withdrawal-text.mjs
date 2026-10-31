// SSCTR R7-B recheck probe r08 (read-only, FREEZE-2): F5 withdrawal wording when currency does not interfere: bouts executed as prescribed in
// weeks 2-4 (currency extended), adverse in weeks 5 and 6 (HOLD then REGRESS) -> withdrawal; which explanation does the replacing session carry?
import {reviewed, weekly, runs} from '../../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';

const TASK = {category: 'VO2_STYLE', current: true, familiar: true, tolerated: true, observedAt: '2026-10-28', prescription: {modality: 'RUN', family: 'VO2_STYLE_INTERVALS', durationMinutes: 40, warmupMinutes: 12, cooldownMinutes: 8, work: {repetitions: 4, workMinutes: 3, recoveryMinutes: 2}}, target: {method: 'PACE', construct: 'FIELD_SESSION_TARGET', paceSecondsPerKm: 255, provenance: 'Athlete report of the last three track sessions'}, history: {sameTaskExposures: 6, response: 'TOLERATED'}, conditions: {comparable: true}};
const bad = {response: {performance: 'UNDER', recovery: 'ADVERSE', effort: 'HARDER', nextDayFunction: 'IMPAIRED'}};
const t = reviewed({id: 'r08', goals: {run: 'PERFORMANCE', strength: 'NONE'}, recent: {runDaysPerWeek: 4, runMinutesPerWeek: 180, longestRunMinutes: 70}, knownRuns: [TASK], schedule: {strengthDays: [], runDays: [1, 3, 5, 6]}, weeks: 12}, 0);
for (let w = 0; w < 9; w++) {
  const s = runs(t.p, w).find(x => x.role === 'QUALITY'), r = t.p.stateTrace[w].run;
  console.log(`w${w} currentThrough=${r.familiarCurrentThrough} lapsed=${!!r.familiarBoutsLapsed} withdrawn=${!!r.familiarBoutsWithdrawn} | ${s ? s.prescription.family + ':' + s.prescription.durationMinutes + (s.explanation ? ' "' + s.explanation.slice(0, 110) + '"' : '') : '-'}`);
  const res = weekly(t, w, {o: x => x.role === 'QUALITY' && [5, 6].includes(w) ? bad : {}});
  if (res.gates?.QUALITY) console.log(`   review w${w}: QUALITY ${res.gates.QUALITY}`);
}
