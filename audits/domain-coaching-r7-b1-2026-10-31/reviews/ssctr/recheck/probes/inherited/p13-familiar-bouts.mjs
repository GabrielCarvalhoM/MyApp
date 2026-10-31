import {pathToFileURL as __toUrl} from 'node:url';
const __ROOT = __toUrl((process.env.SSCTR_ROOT ?? '').replace(/[\\/]?$/, '/'));
// SSCTR R7-B recheck (FREEZE-2) copy of probe p13 (read-only): B0-C02 familiar repeated bouts.
// A: weekly placement and phases (week 1, consolidation weeks, single quality, adjacency to the long run).
// B: event program: SPECIFIC/TAPER/RACE/POST_EVENT never; NEXT_BLOCK after the race: is the task still "current" (<= 28 days, c1/c5)?
// C: withdrawal after repeated adverse responses: what follows, and is it disclosed as a different stimulus (c3)?
// D: a LONG break: lapse, then the threshold ladder after the restart (quality needs established easy weeks again?).
const {program, reviewed, weekly, review, evaluateProgram, opts, runs, addDays} = await import(new URL('CoachingCore/r7/b/fixtures/helpers.mjs', __ROOT).href);
const RUN_ONLY = {goals: {run: 'PERFORMANCE', strength: 'NONE'}, schedule: {strengthDays: []}};
const TASK = {category: 'VO2_STYLE', current: true, familiar: true, tolerated: true, observedAt: '2026-10-28', prescription: {modality: 'RUN', family: 'VO2_STYLE_INTERVALS', durationMinutes: 40, warmupMinutes: 12, cooldownMinutes: 8, work: {repetitions: 4, workMinutes: 3, recoveryMinutes: 2}}, target: {method: 'PACE', construct: 'FIELD_SESSION_TARGET', paceSecondsPerKm: 255, provenance: 'Athlete report of the last three track sessions'}, history: {sameTaskExposures: 6, response: 'TOLERATED'}, conditions: {comparable: true}};
const BOUTS = {id: 'p13-bouts', ...RUN_ONLY, recent: {runDaysPerWeek: 4, runMinutesPerWeek: 180, longestRunMinutes: 70}, knownRuns: [TASK], schedule: {strengthDays: [], runDays: [1, 3, 5, 6]}, weeks: 12};
const line = (p, w) => `${p.weeks[w].phase}` + ' | ' + runs(p, w).map(s => `d${s.day}:${s.role}:${s.prescription.family}:${s.prescription.durationMinutes}${s.prescription.work ? '(' + s.prescription.work.repetitions + 'x' + s.prescription.work.workMinutes + ')' : ''}`).join(' ');

console.log('=== A. plan of a fully specified familiar-bouts athlete (12 weeks) ===');
const p = program(BOUTS);
console.log('class', p.capability.run.class, '| long run day', p.schedule.longRunDay);
for (let w = 0; w < 12; w++) console.log(`w${w} ${line(p, w)}`);

console.log('\n=== B. 10K event (16 weeks) ===');
const ev = program({...BOUTS, id: 'p13-ev', goals: {run: 'RACE', strength: 'NONE'}, event: {kind: '10K', date: '2027-01-24'}, weeks: 16});
let lastBouts = null;
for (let w = 0; w < 16; w++) {
  const b = runs(ev, w).filter(s => s.prescription.family === 'FAMILIAR_REPEATED_BOUTS');
  const gap = b.length && lastBouts ? (Date.parse(b[0].date) - Date.parse(lastBouts)) / 864e5 : null;
  console.log(`w${w} ${line(ev, w)}${gap !== null && gap > 7 ? `  <-- bouts again ${gap} days after the previous bouts session` : ''}`);
  if (b.length) lastBouts = b.at(-1).date;
}
console.log('intake asOf 2026-11-01; task observedAt', TASK.observedAt);

console.log('\n=== C. two adverse bouts in 14 days: withdrawal ===');
const a = reviewed({...BOUTS, id: 'p13-adv'}, 0);
const bad = {response: {performance: 'UNDER', recovery: 'ADVERSE', effort: 'HARDER', nextDayFunction: 'IMPAIRED'}};
for (let w = 0; w < 2; w++) weekly(a, w);
const firstB = [...Array(12).keys()].find(w => runs(a.p, w).some(s => s.prescription.family === 'FAMILIAR_REPEATED_BOUTS'));
console.log('first bouts week', firstB);
for (let w = 2; w < firstB; w++) weekly(a, w);
const r1 = weekly(a, firstB, {o: s => s.role === 'QUALITY' ? bad : {}});
console.log(`review w${firstB} (adverse 1): ${r1.action} gates ${JSON.stringify(r1.gates)} | disclosures ${(r1.disclosures ?? []).map(d => d.id).join(',')}`);
const r2 = weekly(a, firstB + 1, {o: s => s.role === 'QUALITY' ? bad : {}});
console.log(`review w${firstB + 1} (adverse 2): ${r2.action} gates ${JSON.stringify(r2.gates)} | disclosures ${(r2.disclosures ?? []).map(d => d.id + ':' + (d.detail ?? '').slice(0, 100)).join(' || ')}`);
for (let w = firstB + 2; w < firstB + 5; w++) {
  const q = runs(a.p, w).find(s => s.role === 'QUALITY');
  console.log(`w${w} ${line(a.p, w)} | quality explanation: ${q?.explanation ?? null} | instructions[0]: ${q?.prescription.instructions?.[0] ?? null} | calibration ${JSON.stringify(q?.prescription.calibration ?? null)}`);
}
console.log('negotiation/disclosure mentioning the change of stimulus:', JSON.stringify((a.p.negotiation ?? []).filter(n => /bouts|interval|stimulus/i.test(JSON.stringify(n))).map(n => n.id)));

console.log('\n=== D. LONG break of a bouts athlete, then the restart ===');
const t = reviewed({...BOUTS, id: 'p13-long', weeks: 16}, 0);
for (let w = 0; w < 5; w++) weekly(t, w);
const start = t.p.weeks[5].startDate, end = addDays(start, 29);
let w = 5;
while (addDays(t.p.weeks[w].startDate, 6) <= end) { weekly(t, w, {keep: () => false}); w++; }
const day = (Date.parse(addDays(end, 1)) - Date.parse(t.p.weeks[w].startDate)) / 864e5, asOfDay = addDays(t.p.weeks[w].startDate, day);
const r = evaluateProgram(t.p, {...review(t.p, w, {day, kind: 'RETURN_AFTER_PAUSE', interruption: {startDate: start, endDate: end, reasonCategory: 'TRAVEL', nonclinical: true}}), actualLedger: t.ledger}, opts);
console.log('return', r.status, r.action);
for (let k = w; k < 16; k++) console.log(`w${k} ${r.proposal.stateTrace[k]?.run?.mode} easyWeeksDone ${r.proposal.stateTrace[k]?.run?.easyWeeksDone} qNeeds ${r.proposal.stateTrace[k]?.run?.qualityNeeds} | ${runs(r.proposal, k).filter(s => s.date > asOfDay).map(s => `${s.role}:${s.prescription.family}:${s.prescription.durationMinutes}`).join(' ')}`);
