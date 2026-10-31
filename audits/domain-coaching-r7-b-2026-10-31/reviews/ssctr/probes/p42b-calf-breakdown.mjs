// SSCTR R7-B probe p42b (read-only): breakdown of the p42 weeks whose single calf exposure is bent-knee, by goal, strength days, session
// minutes, experience and equipment count (the F7 figures: 4 strength days; 25, 30, 35 and 45 minutes).
import {gen} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
import {configurationOf} from '../../../../../CoachingCore/src/r7b-repertoire.mjs';

const by = {}, byMin = {};
for (const goal of ['RUNNING_SUPPORT', 'GENERAL', 'HYPERTROPHY']) for (const eq of [['DUMBBELLS', 'BENCH'], ['DUMBBELLS', 'BENCH', 'MACHINES', 'BARBELL', 'RACK', 'BANDS', 'PULL_UP_BAR', 'KETTLEBELL'], ['BANDS'], []]) for (const days of [[0, 2, 4, 5], [0, 2, 4], [0, 4], [0, 1, 2, 4, 5]]) for (const minutes of [25, 30, 35, 45, 60]) for (const exp of ['NONE', 'INTERMEDIATE']) for (const ev of [null, {kind: '10K', date: '2027-01-24'}]) {
  const g = gen({id: `p42b-${goal}-${eq.length}-${days.length}-${minutes}-${exp}-${ev ? 'ev' : 'no'}`, strengthExperience: exp, goals: {run: ev ? 'RACE' : 'PERFORMANCE', strength: goal}, equipment: eq, schedule: {strengthDays: days, strengthMinutes: minutes, runDays: [1, 3, 6]}, weeks: 16, ...(ev ? {event: ev} : {})});
  if (g.status !== 'PROPOSED') continue;
  for (const w of g.program.weeks) {
    const calves = w.sessions.filter(s => s.sport === 'STRENGTH' && s.prescription).flatMap(s => s.prescription.exercises.filter(e => configurationOf(e.id)?.pattern === 'CALF').map(e => configurationOf(e.id).subpattern));
    if (calves.length === 1 && calves[0] === 'BENT_KNEE') { const k = `goal=${goal} days=${days.length} min=${minutes} exp=${exp} eqN=${eq.length}`; by[k] = (by[k] ?? 0) + 1; byMin[`days=${days.length} min=${minutes}`] = (byMin[`days=${days.length} min=${minutes}`] ?? 0) + 1; }
  }
}
console.log('by days and minutes:', JSON.stringify(byMin));
for (const [k, v] of Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 15)) console.log(v, k);
