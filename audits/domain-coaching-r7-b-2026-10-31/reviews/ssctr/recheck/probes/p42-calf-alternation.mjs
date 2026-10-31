// SSCTR R7-B recheck (FREEZE-2) copy of probe p42 (read-only): B0-C05 c2 calf alternation as executed rows: whenever the week holds a single calf exposure it is the
// straight-knee default; with two or more at most half are bent-knee. Time fit (short strength sessions) and novice density can drop rows.
import {gen} from '../../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
import {configurationOf} from '../../../../../../CoachingCore/src/r7b-repertoire.mjs';

const equipmentSets = [['DUMBBELLS', 'BENCH'], ['DUMBBELLS', 'BENCH', 'MACHINES', 'BARBELL', 'RACK', 'BANDS', 'PULL_UP_BAR', 'KETTLEBELL'], ['BANDS'], []];
let bad = [], weeksSeen = 0, singleBent = 0;
for (const goal of ['RUNNING_SUPPORT', 'GENERAL', 'HYPERTROPHY']) for (const eq of equipmentSets) for (const days of [[0, 2, 4, 5], [0, 2, 4], [0, 4], [0, 1, 2, 4, 5]]) for (const minutes of [25, 30, 35, 45, 60]) for (const exp of ['NONE', 'INTERMEDIATE']) for (const ev of [null, {kind: '10K', date: '2027-01-24'}]) {
  const g = gen({id: `p42-${goal}-${eq.length}-${days.length}-${minutes}-${exp}-${ev ? 'ev' : 'no'}`, strengthExperience: exp, goals: {run: ev ? 'RACE' : 'PERFORMANCE', strength: goal}, equipment: eq, schedule: {strengthDays: days, strengthMinutes: minutes, runDays: [1, 3, 6]}, weeks: 16, ...(ev ? {event: ev} : {})});
  if (g.status !== 'PROPOSED') continue;
  for (const w of g.program.weeks) {
    const calves = w.sessions.filter(s => s.sport === 'STRENGTH' && s.prescription).flatMap(s => s.prescription.exercises.filter(e => configurationOf(e.id)?.pattern === 'CALF').map(e => ({s: s.id, id: e.id, sub: configurationOf(e.id).subpattern})));
    if (!calves.length) continue;
    weeksSeen++;
    const bent = calves.filter(c => c.sub === 'BENT_KNEE').length;
    if (calves.length === 1 && bent === 1) { singleBent++; if (bad.length < 12) bad.push(`${g.program.athleteId} w${w.index}/${w.phase}: single calf exposure is bent-knee (${calves[0].id})`); }
    else if (calves.length >= 2 && bent > Math.floor(calves.length / 2)) { if (bad.length < 12) bad.push(`${g.program.athleteId} w${w.index}: ${bent}/${calves.length} bent-knee`); }
  }
}
console.log('weeks with calf exposures', weeksSeen, '| weeks with a single bent-knee calf exposure', singleBent);
bad.forEach(x => console.log('  ' + x));
