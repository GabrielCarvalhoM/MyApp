import {pathToFileURL as __toUrl} from 'node:url';
const __ROOT = __toUrl((process.env.SSCTR_ROOT ?? '').replace(/[\\/]?$/, '/'));
// SSCTR R7-B recheck probe r03 (read-only, FREEZE-2): R7B-DECL-16 lazy start of the novice density cap and Q-R7B-05 one practice row per
// configuration per session. A strength-NONE athlete starts with 2 strength days, then moves to 4 days (A) before and (B) after the first
// development-block boundary. Per week: template types, cap flag, new configurations with their first dose, and the CORE/practice rows.
const {reviewed, weekly, review, evaluateProgram, opts, rows} = await import(new URL('CoachingCore/r7/b/fixtures/helpers.mjs', __ROOT).href);
const NOV = {strengthExperience: 'NONE', goals: {run: 'REGULAR', strength: 'GENERAL'}, equipment: ['DUMBBELLS', 'BENCH'], schedule: {strengthDays: [0, 4]}, weeks: 12};
const types = (p, w) => p.weeks[w].sessions.filter(s => s.sport === 'STRENGTH' && s.prescription).map(s => s.templateType).sort().join(',');
for (const [label, changeWeek] of [['A: 2 -> 4 days at week 1 (before the first boundary)', 1], ['B: 2 -> 4 days at week 6 (after the first boundary)', 6]]) {
  const t = reviewed({...NOV, id: 'r03-' + label[0]}, 0);
  console.log(`\n=== ${label} | phases ${t.p.phases.phases.join(',')} | blocks ${t.p.blocks.map(b => b.family + '[' + b.startWeek + ',' + b.endWeekExclusive + ')').join(' ')}`);
  for (let w = 0; w < changeWeek; w++) weekly(t, w);
  const r = evaluateProgram(t.p, {...review(t.p, changeWeek, {day: 0, hour: '06:00:00', kind: 'SCHEDULE_CHANGE', changes: {strengthDays: [0, 2, 4, 5]}}), actualLedger: t.ledger}, opts);
  console.log(`schedule change at week ${changeWeek}: ${r.status} ${r.action}`);
  t.p = r.proposal ?? t.p; t.ledger = r.actualLedger ?? t.ledger;
  const seen = new Set(); for (let w = 0; w < changeWeek; w++) rows(t.p, w).forEach(({e}) => seen.add(e.id));
  for (let w = changeWeek; w < Math.min(12, changeWeek + 6); w++) {
    const fresh = rows(t.p, w).filter(({e}) => !seen.has(e.id)).map(({e}) => `${e.id}x${e.sets}@${e.rir}${e.load.mode === 'ESTABLISH' ? 'E' : ''}`);
    const dup = t.p.weeks[w].sessions.filter(s => s.sport === 'STRENGTH' && s.prescription).filter(s => new Set(s.prescription.exercises.map(e => e.id)).size !== s.prescription.exercises.length).map(s => s.id);
    console.log(`w${w} ${t.p.weeks[w].phase} capped=${t.p.stateTrace[w]?.strength?.density?.capped ?? '-'} templates=${types(t.p, w)} | new: ${fresh.join(' ')}${dup.length ? ' | DUPLICATE ROWS in ' + dup.join(',') : ''}`);
    rows(t.p, w).forEach(({e}) => seen.add(e.id));
    weekly(t, w);
  }
}
console.log('\n=== Q-R7B-05: practice rows in the establishment week of a 4-day strength-NONE athlete ===');
const n = reviewed({...NOV, id: 'r03-c', schedule: {strengthDays: [0, 2, 4, 5]}}, 0);
for (const s of n.p.weeks[0].sessions.filter(s => s.sport === 'STRENGTH' && s.prescription)) console.log(`${s.id} ${s.templateType}: ${s.prescription.exercises.map(e => `${e.id}[${e.role}] ${e.sets}x${e.reps}@${e.rir}`).join(', ')}`);
