// SSCTR R7-B.1 recheck probe s11 (read-only): event-week strength rows of intake programs (no review), over the p42 grid (goals x equipment x days
// x minutes x experience, with a 10K) and the p40 event programs. Prints one canonical line per event-phase strength session: program, week,
// day phase, date, rows (id:sets x reps@RIR/kind) or REST, and eventStandIns. Run on two trees and diff the outputs to see what the rule changes
// in planned event weeks at intake.
// Usage: SSCTR_ROOT=<tree root> node s11-intake-event-weeks.mjs
import {pathToFileURL} from 'node:url';
const ROOT = pathToFileURL((process.env.SSCTR_ROOT ?? '').replace(/[\\/]?$/, '/'));
const imp = rel => import(new URL(rel, ROOT).href);
const H = await imp('CoachingCore/r7/b/fixtures/helpers.mjs'), P = await imp('CoachingCore/src/r6-program.mjs'), AU = await imp('CoachingCore/src/r6-authority.mjs');
const {gen} = H, auth = AU.r6Authority(H.opts), EVENT = ['TAPER', 'RACE_WEEK', 'POST_EVENT'];
const equipmentSets = [['DUMBBELLS', 'BENCH'], ['DUMBBELLS', 'BENCH', 'MACHINES', 'BARBELL', 'RACK', 'BANDS', 'PULL_UP_BAR', 'KETTLEBELL'], ['BANDS'], []];
let programs = 0, sessions = 0;
const lines = [];
for (const goal of ['RUNNING_SUPPORT', 'GENERAL', 'HYPERTROPHY', 'STRENGTH']) for (const eq of equipmentSets) for (const days of [[0, 2, 4, 5], [0, 2, 4], [0, 4], [0, 1, 2, 4, 5]]) for (const minutes of [25, 30, 35, 45, 60]) for (const exp of ['NONE', 'INTERMEDIATE']) for (const ev of [{kind: '10K', date: '2027-01-24'}, {kind: 'HALF_MARATHON', date: '2027-01-31'}]) for (const rotation of ['FIXED', 'EVERY_2_WEEKS']) {
  const g = gen({id: `s11-${goal}-${eq.length}-${days.length}-${minutes}-${exp}-${ev.kind}-${rotation}`, strengthExperience: exp, goals: {run: 'RACE', strength: goal}, equipment: eq, schedule: {strengthDays: days, strengthMinutes: minutes, runDays: [1, 3, 6]}, weeks: 16, event: ev, rotation});
  if (g.status !== 'PROPOSED') continue;
  programs++;
  const p = g.program, sk = P.skeletonOf(p, auth);
  for (const w of p.weeks) for (const s of w.sessions.filter(z => z.sport === 'STRENGTH')) {
    const phase = P.dayPhaseOf(sk.at(w.index) ?? sk, w.index, s.day); if (!EVENT.includes(phase)) continue;
    sessions++;
    lines.push(`${p.athleteId} w${w.index} ${phase} ${s.date} ${s.prescription ? s.prescription.exercises.map(e => `${e.id}:${e.sets}x${e.reps}@${e.rir}/${e.exposure?.kind ?? e.load?.mode}`).join(',') : 'REST'}${s.eventStandIns ? ' | eventStandIns ' + JSON.stringify(s.eventStandIns.map(x => x.selected + '->' + (x.inEventWeeks ?? 'out'))) : ''}`);
  }
}
console.log(`programs ${programs} event-phase strength sessions ${sessions}`);
console.log(lines.join('\n'));
