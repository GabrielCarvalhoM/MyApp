import {pathToFileURL as __toUrl} from 'node:url';
const __ROOT = __toUrl((process.env.SSCTR_ROOT ?? '').replace(/[\\/]?$/, '/'));
// SSCTR R7-B recheck probe r04 (read-only, FREEZE-2): R7B-DECL-16 / QE-R7B-05 / B0-C08 c1. A strength-NONE athlete with 2 strength days moves to
// 4 days at week 1. (1) The SCHEDULE_CHANGE proposal; (2) the plan after the ordinary weekly review of week 1, with week 1 executed; (3) a variant
// with the change reported at week 1 and nothing else. For each: weeks 2-5 template types, the state's cap flag and the program's novice data.
const {reviewed, weekly, review, evaluateProgram, opts} = await import(new URL('CoachingCore/r7/b/fixtures/helpers.mjs', __ROOT).href);
const NOV = {strengthExperience: 'NONE', goals: {run: 'REGULAR', strength: 'GENERAL'}, equipment: ['DUMBBELLS', 'BENCH'], schedule: {strengthDays: [0, 4]}, weeks: 12};
const types = (p, w) => p.weeks[w].sessions.filter(s => s.sport === 'STRENGTH' && s.prescription).map(s => s.templateType).sort().join(',');
const show = (label, p) => {
  console.log(`\n--- ${label}: noviceTemplates ${p.noviceTemplates ? p.noviceTemplates.map(t => t.type).join(',') : 'none'} | arrangement keys ${Object.keys(p.arrangementSessions ?? {}).join(',')} | contextBefore ${JSON.stringify((p.contextBefore ?? []).map(x => ({untilWeek: x.untilWeek, days: x.canonical?.schedule?.strengthDays, novice: !!x.noviceTemplates})))}`);
  for (let w = 1; w < 7; w++) console.log(`  w${w} ${p.weeks[w].phase} capped=${p.stateTrace[w]?.strength?.density?.capped ?? '-'} templates=${types(p, w)}`);
};
const t = reviewed({...NOV, id: 'r04'}, 0);
weekly(t, 0);
const r = evaluateProgram(t.p, {...review(t.p, 1, {day: 0, hour: '06:00:00', kind: 'SCHEDULE_CHANGE', changes: {strengthDays: [0, 2, 4, 5]}}), actualLedger: t.ledger}, opts);
console.log('schedule change at week 1:', r.status, r.action);
t.p = r.proposal; t.ledger = r.actualLedger ?? t.ledger;
show('(1) the SCHEDULE_CHANGE proposal', t.p);
const r1 = weekly(t, 1);
console.log('\nweekly review of week 1:', r1.status, r1.action);
show('(2) after the weekly review of week 1', t.p);
const r2 = weekly(t, 2);
console.log('\nweekly review of week 2:', r2.status, r2.action);
show('(3) after the weekly review of week 2', t.p);
