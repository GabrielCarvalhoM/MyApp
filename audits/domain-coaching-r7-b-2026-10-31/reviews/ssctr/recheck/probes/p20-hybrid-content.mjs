// SSCTR R7-B recheck (FREEZE-2) copy of probe p20 (read-only): B0-C11 CMP.I11 and the CMP.P04 content stage.
// A: which rows the content stage reduces (lead, role, establishment/first exposure, phase) across a RUN-led event program.
// B: a strength session late on the last day of the week before a protected run early on day 0 of the next week (week wrap).
// C: the I11 ranking cost across the week wrap.
import {program, runs, FULL} from '../../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
import {interferenceCosts} from '../../../../../../CoachingCore/src/r6-balanced.mjs';

const H = {sameSessionGapHours: 6, nextDayGapHours: 30, twoDayGapHours: 54, heavyLowerRepeatGapHours: 48, preRaceStrengthGapHours: 72, turnHours: {AM: 7, PM: 18}, backToBackGapHours: 1.2, heavyLowerMinimumSets: 3, qualityAdjacentToLongForbiddenWhenAlternativeExists: true};
const hour = s => s.day * 24 + (H.turnHours[s.turn] ?? 12) + (s.backToBackOrder ?? 0) * H.backToBackGapHours;
function audit(p, label) {
  const out = {reduced: [], highEccNearNotReduced: []};
  for (const w of p.weeks) {
    const prot = w.sessions.filter(s => s.sport === 'RUN' && s.prescription && ['LONG', 'THRESHOLD', 'TEN_K_SPECIFIC', 'HALF_MARATHON_SPECIFIC', 'FAMILIAR_REPEATED_BOUTS'].includes(s.prescription.family));
    const lead = w.contextualPriority?.lead ?? p.goal.priorityByPhase?.[w.phase]?.lead ?? p.goal.baseLead;
    for (const s of w.sessions.filter(x => x.sport === 'STRENGTH' && x.prescription)) {
      // gap to the next protected run of this week, and of next week (wrap), in hours
      const nextW = p.weeks[w.index + 1];
      const gaps = [...prot.map(r => hour(r) - hour(s)), ...(nextW ? nextW.sessions.filter(x => x.sport === 'RUN' && x.prescription && ['LONG', 'THRESHOLD', 'TEN_K_SPECIFIC', 'HALF_MARATHON_SPECIFIC', 'FAMILIAR_REPEATED_BOUTS'].includes(x.prescription.family)).map(r => hour(r) + 168 - hour(s)) : [])].filter(g => g > 0);
      const near = gaps.length && Math.min(...gaps) <= 30;
      for (const e of s.prescription.exercises) {
        const hi = ['bulgarian-split-squat-db', 'single-leg-rdl-db'].includes(e.id);
        if (e.exposure?.contentReduction) out.reduced.push(`w${w.index}/${w.phase}/lead=${lead} ${s.id} ${e.id} role=${e.role} sets=${e.sets} kind=${e.exposure?.kind} establishment=${e.load?.mode === 'ESTABLISH'}`);
        else if (hi && near && e.role !== 'MAIN') out.highEccNearNotReduced.push(`w${w.index}/${w.phase}/lead=${lead} ${s.id} ${e.id} role=${e.role} sets=${e.sets} kind=${e.exposure?.kind} gap=${Math.min(...gaps)}h`);
      }
    }
  }
  console.log(`\n--- ${label}: reduced ${out.reduced.length}; HIGH-eccentric non-MAIN rows within 30 h before a protected run and not reduced: ${out.highEccNearNotReduced.length}`);
  out.reduced.slice(0, 12).forEach(x => console.log('  R ' + x));
  out.highEccNearNotReduced.slice(0, 12).forEach(x => console.log('  N ' + x));
}

console.log('=== A. RUN-led 10K event, STRENGTH goal (selection order picks bulgarian-split-squat-db, DECL-11), strength the day before the long run ===');
const base = {goals: {run: 'RACE', strength: 'STRENGTH'}, event: {kind: '10K', date: '2027-01-24'}, weeks: 16, equipment: FULL, recent: {runDaysPerWeek: 4, runMinutesPerWeek: 200, longestRunMinutes: 70, strengthDaysPerWeek: 3}, schedule: {runDays: [1, 3, 6], strengthDays: [0, 2, 5], longRunDay: 6}};
const a = program({id: 'p20-a', ...base, strengthExperience: 'INTERMEDIATE'});
console.log('leads by phase', JSON.stringify(Object.fromEntries(Object.entries(a.goal.priorityByPhase).map(([k, v]) => [k, v.lead]))));
audit(a, 'A (unfamiliar: first exposures)');
const a2 = program({id: 'p20-a2', ...base, knownExercises: [{id: 'bulgarian-split-squat-db', familiar: true}]});
audit(a2, 'A2 (familiar bulgarian split squat)');

console.log('\n=== B. week wrap: strength on day 6 PM, long run on day 0 AM ===');
const b = program({id: 'p20-b', ...base, schedule: {runDays: [0, 2, 4], strengthDays: [1, 3, 6], longRunDay: 0}});
console.log('day of long run', b.schedule.longRunDay, '| strength days', b.schedule.strengthDays.join(','));
audit(b, 'B');

console.log('\n=== C. I11 cost across the week wrap (ranking) ===');
const s = (id, day, turn, p) => ({id, day, turn, prescription: p});
const ecc = {modality: 'STRENGTH', exercises: [{id: 'bulgarian-split-squat-db', pattern: 'LUNGE', sets: 2, load: {mode: 'FROM_LOG', unit: 'KG'}}]};
const long = {modality: 'RUN', family: 'LONG', durationMinutes: 60};
console.log('wrap=true :', JSON.stringify(interferenceCosts([s('S', 6, 'PM', ecc), s('L', 0, 'AM', long)], {wrap: true, cmpI11: true}).map(c => c.cause)));
console.log('wrap=false:', JSON.stringify(interferenceCosts([s('S', 6, 'PM', ecc), s('L', 0, 'AM', long)], {wrap: false, cmpI11: true}).map(c => c.cause)));

console.log('\n=== D. which LUNGE/HINGE accessories were selected in A, and week wrap with a familiar bulgarian split squat ===');
console.log('A templates:', a.templates.map(t => t.type + '[' + t.rows.map(r => r.role[0] + ':' + r.entry.id).join(',') + ']').join(' '));
const b2 = program({id: 'p20-b2', ...base, knownExercises: [{id: 'bulgarian-split-squat-db', familiar: true}], schedule: {runDays: [0, 2, 4], strengthDays: [1, 3, 6], longRunDay: 0}});
console.log('B2 templates:', b2.templates.map(t => t.type + '[' + t.rows.map(r => r.role[0] + ':' + r.entry.id).join(',') + ']').join(' '));
console.log('B2 SPECIFIC week days:', b2.weeks.filter(w => w.phase === 'SPECIFIC').map(w => 'w' + w.index + ' ' + w.sessions.filter(s => s.prescription).map(s => s.sport[0] + s.day + (s.turn ?? '') + ':' + (s.sport === 'RUN' ? s.prescription.family : (s.templateType + '{' + s.prescription.exercises.map(e => e.id + 'x' + e.sets).join(',') + '}'))).join(' ')).join('\n  '));
audit(b2, 'B2 (week wrap, familiar bulgarian)');
