// SSCTR R7-B recheck (FREEZE-2) copy of probe p41 (read-only): B0-C01 c8 strides optionality everywhere strides appear (easy runs, taper, shakeout, race-day warm-up),
// for walk/jog-, restart- and easy-low-started athletes and run experience NONE or NOVICE, in plans and after 8 reviewed weeks (graduation
// and event phases included). Also: the race-day completion rule for a walk/jog history after graduation (c9).
import {gen, reviewed, weekly, runs} from '../../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';

const cases = [
  ['easylow-int', {runExperience: 'INTERMEDIATE', recent: {runDaysPerWeek: 3, runMinutesPerWeek: 50, longestRunMinutes: 25}}],
  ['novice', {runExperience: 'NOVICE', recent: {runDaysPerWeek: 3, runMinutesPerWeek: 80, longestRunMinutes: 35}}],
  ['walkjog-int', {runExperience: 'INTERMEDIATE', recent: {runDaysPerWeek: 2, runMinutesPerWeek: 20, longestRunMinutes: 10}}],
  ['never', {runExperience: 'NONE', recent: {runDaysPerWeek: 0, runMinutesPerWeek: 0, longestRunMinutes: 0}}],
  ['restart-int', {runExperience: 'INTERMEDIATE', recent: {runDaysPerWeek: 0, runMinutesPerWeek: 0, longestRunMinutes: 0}}]
];
const events = [null, {kind: '10K', date: '2027-01-24'}, {kind: 'HALF_MARATHON', date: '2027-02-14'}];
let seen = 0, notOptional = [], completion = [];
const strideSites = p => p.weeks.flatMap(w => w.sessions.filter(s => s.sport === 'RUN' && s.prescription).flatMap(s => {
  const x = [];
  if (s.prescription.strides) x.push({w: w.index, phase: w.phase, where: s.role, optional: s.prescription.strides.optional === true});
  if (s.prescription.warmupStrides) x.push({w: w.index, phase: w.phase, where: 'race-warmup', optional: s.prescription.warmupStrides.optional === true});
  for (const t of s.prescription.instructions ?? []) if (/stride/i.test(t) && !s.prescription.strides) x.push({w: w.index, phase: w.phase, where: s.role + ':instruction', optional: /optional|if you like|equal alternative/i.test(t), text: t});
  return x;
}));
for (const [label, o] of cases) for (const ev of events) {
  const base = {id: `p41-${label}-${ev?.kind ?? 'none'}`, ...o, goals: {run: ev ? 'RACE' : 'PERFORMANCE', strength: 'NONE'}, schedule: {strengthDays: [], runDays: [1, 3, 5, 6], runMinutes: 45, longRunMinutes: 90}, weeks: 16, ...(ev ? {event: ev} : {})};
  const g = gen(base);
  if (g.status !== 'PROPOSED') { console.log(label, ev?.kind, g.status, g.reason); continue; }
  for (const x of strideSites(g.program)) { seen++; if (!x.optional) notOptional.push(`${base.id} plan ${JSON.stringify(x)}`); }
  const t = reviewed(base, 0);
  for (let w = 0; w < 16; w++) {
    if (!t.p.weeks[w]) break;
    if (['RACE_WEEK', 'POST_EVENT'].includes(t.p.weeks[w].phase)) break;
    weekly(t, w);
  }
  for (const x of strideSites(t.p)) { seen++; if (!x.optional) notOptional.push(`${base.id} reviewed ${JSON.stringify(x)}`); }
  if (ev) {
    const race = t.p.weeks.flatMap(w => runs(t.p, w.index)).find(s => s.role === 'RACE');
    completion.push(`${base.id}: class ${t.p.capability.run.class}, graduated ${!!t.p.canonical.athlete.runGraduation}, race completion ${race?.prescription?.completion ? 'YES' : 'no'}`);
  }
}
console.log('stride sites seen', seen, '| not optional', notOptional.length);
notOptional.slice(0, 10).forEach(x => console.log('  ' + x));
completion.forEach(x => console.log(x));
