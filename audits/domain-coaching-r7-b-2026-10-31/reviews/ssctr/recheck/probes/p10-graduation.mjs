// SSCTR R7-B recheck (FREEZE-2) copy of probe p10 (read-only; imports the frozen runtime, writes nothing): B0-C01 graduation behaviour.
// A: the introduction week (DECL-01: weekly total, single-run ceiling, whole-session duration incl. warm-up/cool-down).
// B: R6 comparator: an EASY_CURRENT athlete's first quality week.
// C: the easy alternative on the introduced session (c6): what is credited.
// D: R18: a qualifying week that never received its own gating weekly review.
import {program,reviewed,weekly,review,evaluateProgram,opts,runs,obs,live} from '../../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';

const RUN_ONLY = {goals: {run: 'PERFORMANCE', strength: 'NONE'}, schedule: {strengthDays: []}};
const GRAD = {id: 'p10-grad', ...RUN_ONLY, runExperience: 'NOVICE', recent: {runDaysPerWeek: 3, runMinutesPerWeek: 80, longestRunMinutes: 35}, schedule: {strengthDays: [], runMinutes: 45}, weeks: 16};
const line = (p, w) => runs(p, w).map(s => `${s.role}:${s.prescription.family}:${s.prescription.durationMinutes}${s.prescription.strides ? '+str' + (s.prescription.strides.optional ? '(opt)' : '') : ''}${s.introduction ? '[INTRO alt ' + s.alternative.minutes + ']' : ''}`).join(' ');
const total = (p, w) => runs(p, w).filter(s => s.prescription.family !== 'WALK').reduce((n, s) => n + s.prescription.durationMinutes, 0);

console.log('=== A. GRAD scenario (NOVICE, 80 min/3 days, runMinutes 45, 16 weeks) ===');
const t = reviewed(GRAD, 0);
console.log('class', t.p.capability.run.class, 'phases', t.p.phases.phases.join(','));
console.log('blocks', t.p.blocks.map(b => `${b.id}:${b.family}[${b.startWeek},${b.endWeekExclusive})`).join(' '));
let grad = null;
for (let w = 0; w < 8 && !grad; w++) {
  console.log(`w${w} ${t.p.weeks[w].phase} planned total ${total(t.p, w)} | ${line(t.p, w)}`);
  const r = weekly(t, w);
  if (r.action === 'RUN_QUALITY_GRADUATION') { grad = w; console.log(`  -> graduation decided at review of week ${w}:`, JSON.stringify(t.p.canonical.athlete.runGraduation.qualifyingWeeks)); }
}
for (let w = grad + 1; w < grad + 4; w++) console.log(`w${w} ${t.p.weeks[w].phase} planned total ${total(t.p, w)} | ${line(t.p, w)}`);
const intro = runs(t.p, grad + 1).find(s => s.role === 'QUALITY');
console.log('intro session:', JSON.stringify({dur: intro.prescription.durationMinutes, warm: intro.prescription.warmupMinutes, cool: intro.prescription.cooldownMinutes, work: intro.prescription.work, effortDomain: intro.prescription.effortDomain, calibration: intro.prescription.calibration, target: intro.prescription.target ?? null, alternative: intro.alternative}));
const longestExecuted = Math.max(...[...Array(grad + 1).keys()].flatMap(k => runs(t.p, k).map(s => s.prescription.durationMinutes)));
console.log('longest executed run before intro:', longestExecuted, '| intro session within single-run ceiling (longest + 5)?', intro.prescription.durationMinutes <= longestExecuted + 5);
console.log('weekly totals: last full week', total(t.p, grad - 1), '| graduation week', total(t.p, grad), '| intro week', total(t.p, grad + 1));

console.log('\n=== B. R6 comparator: EASY_CURRENT intermediate, first quality week ===');
const C = program({id: 'p10-current', ...RUN_ONLY, recent: {runDaysPerWeek: 3, runMinutesPerWeek: 90, longestRunMinutes: 40}, schedule: {strengthDays: [], runMinutes: 45}, weeks: 12});
console.log('class', C.capability.run.class, 'phases', C.phases.phases.join(','));
for (let w = 0; w < 6; w++) console.log(`w${w} ${C.weeks[w].phase} planned total ${total(C, w)} | ${line(C, w)}`);

console.log('\n=== C. Intro week: the athlete keeps the easy alternative (reports the alternative minutes on the quality session) ===');
const tc = reviewed({...GRAD, id: 'p10-alt'}, grad);
weekly(tc, grad);
const q = runs(tc.p, grad + 1).find(s => s.role === 'QUALITY');
console.log('quality', q.prescription.durationMinutes, 'min; alternative', q.alternative.minutes, 'min; 0.9 x quality =', 0.9 * q.prescription.durationMinutes);
const rAlt = weekly(tc, grad + 1, {o: s => s.role === 'QUALITY' ? {minutes: q.alternative.minutes} : {}});
console.log('review action', rAlt.action, 'gates', JSON.stringify(rAlt.gates));
console.log(`w${grad + 2} ${line(tc.p, grad + 2)}`);
console.log('state after: qualityStep', tc.p.stateTrace[grad + 2].run.qualityStep, 'thresholdDone', tc.p.stateTrace[grad + 2].run.thresholdDone);
// Same, but the alternative reported at a length >= 90% of the session (what an athlete whose usual easy run is that long would report).
const tc2 = reviewed({...GRAD, id: 'p10-alt2'}, grad);
weekly(tc2, grad);
const q2 = runs(tc2.p, grad + 1).find(s => s.role === 'QUALITY');
const rAlt2 = weekly(tc2, grad + 1, {o: s => s.role === 'QUALITY' ? {minutes: Math.ceil(0.9 * q2.prescription.durationMinutes)} : {}});
console.log('easy run of', Math.ceil(0.9 * q2.prescription.durationMinutes), 'min on the quality day -> gates', JSON.stringify(rAlt2.gates), '| qualityStep next', tc2.p.stateTrace[grad + 2].run.qualityStep, 'thresholdDone', tc2.p.stateTrace[grad + 2].run.thresholdDone, '|', line(tc2.p, grad + 2));

console.log('\n=== D. R18: week grad-1 never received its own gating weekly review ===');
const td = reviewed({...GRAD, id: 'p10-r18'}, grad - 1);
// Observations of weeks grad-1 and grad arrive together at the review of week grad.
const both = [grad - 1, grad].flatMap(w => td.p.weeks[w].sessions.filter(s => live(s)).map(s => obs(td.p, s)));
const rd = evaluateProgram(td.p, {...review(td.p, grad, {observations: both}), actualLedger: td.ledger}, opts);
console.log('review of week', grad, 'with week', grad - 1, 'unreviewed ->', rd.status, rd.action, '|', (rd.disclosures ?? []).map(d => d.id).join(','));
if (rd.proposal) console.log('  graduation recorded:', JSON.stringify(rd.proposal.canonical.athlete.runGraduation ?? null));
