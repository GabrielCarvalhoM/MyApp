// SSCTR R7-B.1 recheck probe s14 (read-only): intake programs (no review) over the s11 grid. For each program, the configurations planned in
// strength sessions before the first event-phase day (the exposures the conditional projection assumes executed); then every event-phase strength
// row whose configuration was not planned before (a first exposure planned on a TAPER, RACE_WEEK or POST_EVENT day), and the event-week totals of
// strength sets and live strength sessions. Run on two trees to see what the every-row rule changes in planned event weeks at intake.
// Usage: SSCTR_ROOT=<tree root> node s14-intake-event-novelty.mjs
import {pathToFileURL} from 'node:url';
const ROOT = pathToFileURL((process.env.SSCTR_ROOT ?? '').replace(/[\\/]?$/, '/'));
const imp = rel => import(new URL(rel, ROOT).href);
const H = await imp('CoachingCore/r7/b/fixtures/helpers.mjs'), P = await imp('CoachingCore/src/r6-program.mjs'), AU = await imp('CoachingCore/src/r6-authority.mjs');
const {gen} = H, auth = AU.r6Authority(H.opts), EVENT = ['TAPER', 'RACE_WEEK', 'POST_EVENT'];
const equipmentSets = [['DUMBBELLS', 'BENCH'], ['DUMBBELLS', 'BENCH', 'MACHINES', 'BARBELL', 'RACK', 'BANDS', 'PULL_UP_BAR', 'KETTLEBELL'], ['BANDS'], []];
const T = {programs: 0, programsWithNovelty: 0, noveltyRows: 0, noveltyKinds: {}, eventSets: 0, eventLiveSessions: 0, eventRestByRule: 0, eventStandIns: 0, eventLeftOut: 0, examples: []};
for (const goal of ['RUNNING_SUPPORT', 'GENERAL', 'HYPERTROPHY', 'STRENGTH']) for (const eq of equipmentSets) for (const days of [[0, 2, 4, 5], [0, 2, 4], [0, 4], [0, 1, 2, 4, 5]]) for (const minutes of [25, 30, 35, 45, 60]) for (const exp of ['NONE', 'INTERMEDIATE']) for (const ev of [{kind: '10K', date: '2027-01-24'}, {kind: 'HALF_MARATHON', date: '2027-01-31'}]) for (const rotation of ['FIXED', 'EVERY_2_WEEKS']) {
  const g = gen({id: `s14-${goal}-${eq.length}-${days.length}-${minutes}-${exp}-${ev.kind}-${rotation}`, strengthExperience: exp, goals: {run: 'RACE', strength: goal}, equipment: eq, schedule: {strengthDays: days, strengthMinutes: minutes, runDays: [1, 3, 6]}, weeks: 16, event: ev, rotation});
  if (g.status !== 'PROPOSED') continue;
  T.programs++;
  const p = g.program, sk = P.skeletonOf(p, auth), before = new Set();
  let novelHere = 0;
  for (const w of p.weeks) for (const s of [...w.sessions].sort((a, b) => a.date < b.date ? -1 : 1).filter(z => z.sport === 'STRENGTH')) {
    const phase = P.dayPhaseOf(sk.at(w.index) ?? sk, w.index, s.day);
    if (!EVENT.includes(phase)) { if (!s.prescription) continue; if (phase !== 'NEXT_BLOCK') for (const e of s.prescription.exercises) before.add(e.id); continue; }
    if (s.eventStandIns) { T.eventStandIns += s.eventStandIns.filter(x => x.inEventWeeks).length; T.eventLeftOut += s.eventStandIns.filter(x => !x.inEventWeeks).length; }
    if (!s.prescription) { if (s.eventStandIns) T.eventRestByRule++; continue; }
    T.eventLiveSessions++;
    for (const e of s.prescription.exercises) {
      T.eventSets += e.sets;
      if (!before.has(e.id)) { T.noveltyRows++; novelHere++; const k = e.exposure?.kind ?? e.load?.mode; T.noveltyKinds[k] = (T.noveltyKinds[k] ?? 0) + 1; if (T.examples.length < 8) T.examples.push(`${p.athleteId} w${w.index} ${phase} ${s.date} ${e.id} ${e.sets}x${e.reps}@${e.rir} ${k}`); }
    }
  }
  if (novelHere) T.programsWithNovelty++;
}
console.log(JSON.stringify(T, null, 1));
