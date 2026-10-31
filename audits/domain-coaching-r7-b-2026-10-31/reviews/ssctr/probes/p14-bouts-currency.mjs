// SSCTR R7-B probe p14 (read-only): B0-C02 currency and disclosure.
// A: a task observed 27 days before the intake: days between its last performance and the first prescribed bouts session (DECL-05 deferral).
// B: a short nonclinical break lapses the bouts: is the change to the threshold ladder disclosed as a different stimulus (c3/c5)?
// C: half-marathon event: NEXT_BLOCK resumption gap.
import {program, reviewed, weekly, review, evaluateProgram, opts, runs} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';

const RUN_ONLY = {goals: {run: 'PERFORMANCE', strength: 'NONE'}, schedule: {strengthDays: []}};
const TASK = {category: 'VO2_STYLE', current: true, familiar: true, tolerated: true, observedAt: '2026-10-28', prescription: {modality: 'RUN', family: 'VO2_STYLE_INTERVALS', durationMinutes: 40, warmupMinutes: 12, cooldownMinutes: 8, work: {repetitions: 4, workMinutes: 3, recoveryMinutes: 2}}, target: {method: 'PACE', construct: 'FIELD_SESSION_TARGET', paceSecondsPerKm: 255, provenance: 'Athlete report of the last three track sessions'}, history: {sameTaskExposures: 6, response: 'TOLERATED'}, conditions: {comparable: true}};
const BOUTS = {id: 'p14', ...RUN_ONLY, recent: {runDaysPerWeek: 4, runMinutesPerWeek: 180, longestRunMinutes: 70}, knownRuns: [TASK], schedule: {strengthDays: [], runDays: [1, 3, 5, 6]}, weeks: 12};
const firstBouts = p => p.weeks.flatMap(w => runs(p, w.index)).find(s => s.prescription.family === 'FAMILIAR_REPEATED_BOUTS');

console.log('=== A. observedAt vs the first prescribed bouts session ===');
for (const observedAt of ['2026-10-28', '2026-10-15', '2026-10-05']) {
  const p = program({...BOUTS, id: 'p14-a-' + observedAt, knownRuns: [{...TASK, observedAt}]});
  const s = firstBouts(p);
  console.log(`observedAt ${observedAt} (intake asOf 2026-11-01): first bouts ${s?.date ?? 'none'} = ${s ? (Date.parse(s.date) - Date.parse(observedAt)) / 864e5 : '-'} days after the task was last performed`);
}

console.log('\n=== B. short break lapses the bouts: disclosure? ===');
const i = reviewed({...BOUTS, id: 'p14-b'}, 3);
const ret = evaluateProgram(i.p, {...review(i.p, 4, {day: 3, kind: 'RETURN_AFTER_PAUSE', interruption: {days: 4, reasonCategory: 'TRAVEL', nonclinical: true}}), actualLedger: i.ledger}, opts);
console.log('return', ret.action, '| disclosures:', JSON.stringify((ret.disclosures ?? []).map(d => d.id)), '| negotiation ids:', JSON.stringify((ret.proposal?.negotiation ?? []).map(n => n.id)));
for (let w = 5; w < 8; w++) { const q = runs(ret.proposal, w).find(s => s.role === 'QUALITY' || s.prescription.family === 'THRESHOLD'); console.log(`w${w}`, q ? `${q.role}:${q.prescription.family}:${q.prescription.durationMinutes} explanation=${q.explanation}` : 'no quality'); }

console.log('\n=== C. half marathon: NEXT_BLOCK resumption ===');
const ev = program({...BOUTS, id: 'p14-hm', goals: {run: 'RACE', strength: 'NONE'}, event: {kind: 'HALF_MARATHON', date: '2027-01-24'}, weeks: 16});
let last = null;
for (const w of ev.weeks) {
  const b = runs(ev, w.index).find(s => s.prescription.family === 'FAMILIAR_REPEATED_BOUTS');
  if (b) { if (last && (Date.parse(b.date) - Date.parse(last)) / 864e5 > 7) console.log(`w${w.index} ${w.phase}: bouts resume ${(Date.parse(b.date) - Date.parse(last)) / 864e5} days after the previous bouts session (${last})`); last = b.date; }
}
console.log('phases', ev.phases.phases.join(','));
