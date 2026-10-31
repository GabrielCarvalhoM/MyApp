// SSCTR R7-B recheck (FREEZE-2) copy of probe p31 (read-only): B0-C08 novice density in an event program, reviewed week by week.
// When is the cap released, in which phase do the new configurations first appear, with which dose, and does the release ever land in
// TAPER, RACE_WEEK or POST_EVENT (B0-C05 c1, R6-EVENT-TRANSITION C7: no new exercise there)? TPL.CORE dose before and after week 0.
import {reviewed, weekly, rows} from '../../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';

const base = {strengthExperience: 'NONE', goals: {run: 'RACE', strength: 'GENERAL'}, equipment: ['DUMBBELLS', 'BENCH'], recent: {runDaysPerWeek: 3, runMinutesPerWeek: 120, longestRunMinutes: 50, strengthDaysPerWeek: 0}, schedule: {runDays: [1, 3, 6], strengthDays: [0, 2, 4]}, weeks: 12};
for (const [label, date, missStrengthAt] of [['10K-12w all executed', '2027-01-10', -1], ['10K-12w strength missed in the first boundary week', '2027-01-10', 4], ['10K-8w', '2026-12-13', -1], ['10K-8w missed', '2026-12-13', 1]]) {
  const weeks = label.includes('8w') ? 8 : 12;
  const t = reviewed({...base, id: 'p31-' + label.replace(/\W+/g, '-'), weeks, event: {kind: '10K', date}}, 0);
  console.log(`\n=== ${label}: phases ${t.p.phases.phases.join(',')} | blocks ${t.p.blocks.map(b => b.family + '[' + b.startWeek + ',' + b.endWeekExclusive + ')').join(' ')}`);
  const seen = new Set();
  for (let w = 0; w < weeks; w++) {
    const ph = t.p.weeks[w].phase;
    const str = t.p.weeks[w].sessions.filter(s => s.sport === 'STRENGTH' && s.prescription);
    const fresh = rows(t.p, w).filter(({e}) => !seen.has(e.id));
    console.log(`w${w} ${ph} capped=${t.p.stateTrace[w]?.strength?.density?.capped ?? '-'} templates=${str.map(s => s.templateType).join(',')} | new: ${fresh.map(({e}) => `${e.id}x${e.sets}@${e.rir}${e.load.mode === 'ESTABLISH' ? 'E' : ''}`).join(' ')}`);
    if (w === 0 || w === 1) for (const s of str.filter(s => s.templateType === 'CORE')) console.log(`   CORE w${w}: ${s.prescription.exercises.map(e => `${e.id}[${e.role}] ${e.sets}x${e.reps}@${e.rir}`).join(', ')}`);
    rows(t.p, w).forEach(({e}) => seen.add(e.id));
    if (['RACE_WEEK', 'POST_EVENT'].includes(ph)) break;
    weekly(t, w, w === missStrengthAt ? {keep: s => s.sport !== 'STRENGTH'} : {});
  }
}
