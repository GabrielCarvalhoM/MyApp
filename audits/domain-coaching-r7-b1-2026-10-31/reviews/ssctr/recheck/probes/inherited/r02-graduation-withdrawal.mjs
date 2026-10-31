import {pathToFileURL as __toUrl} from 'node:url';
const __ROOT = __toUrl((process.env.SSCTR_ROOT ?? '').replace(/[\\/]?$/, '/'));
// SSCTR R7-B recheck probe r02 (read-only, FREEZE-2): graduation withdrawal on corrected evidence (QE-R7B-04, revised R7B-DECL-04).
// GRAD graduates at the week-3 review; weeks 4 and 5 run the threshold session as prescribed; at the week-6 review a correction makes the week-2
// long run adverse. Expected inside the envelopes: quality leaves the sessions ahead, executed history stays, easy and long continue from what
// was executed (no regression, no jump), strides unchanged, and a later block review graduates again only on two new qualifying weeks, at step 0.
const {reviewed, weekly, review, evaluateProgram, opts, runs, live, obs} = await import(new URL('CoachingCore/r7/b/fixtures/helpers.mjs', __ROOT).href);
const RUN_ONLY = {goals: {run: 'PERFORMANCE', strength: 'NONE'}, schedule: {strengthDays: []}};
const GRAD = {id: 'r02-grad', ...RUN_ONLY, runExperience: 'NOVICE', recent: {runDaysPerWeek: 3, runMinutesPerWeek: 80, longestRunMinutes: 35}, schedule: {strengthDays: [], runMinutes: 45}, weeks: 16};
const BAD = {performance: 'UNDER', recovery: 'ADVERSE', effort: 'HARDER', nextDayFunction: 'IMPAIRED'};
const line = (p, w) => runs(p, w).map(s => `${s.role}:${s.prescription.family}:${s.prescription.durationMinutes}${s.prescription.strides ? '+str' + s.prescription.strides.repetitions : ''}${s.prescription.calibration?.firstExposure ? '(cal)' : ''}`).join(' ');
const t = reviewed(GRAD, 0);
for (let w = 0; w < 6; w++) { const r = weekly(t, w); if (r.action === 'RUN_QUALITY_GRADUATION') console.log(`graduated at the review of week ${w}`); }
for (let w = 3; w < 7; w++) console.log(`before: w${w} ${t.p.weeks[w].phase} ${line(t.p, w)}`);
const long2 = t.ledger.filter(o => !o.superseded && t.p.weeks[2].sessions.some(s => s.id === o.sessionId && s.role === 'LONG'))[0];
const fix = {eventId: long2.eventId + '-fix', athleteId: long2.athleteId, sessionId: long2.sessionId, observedAt: long2.observedAt, correctionOf: long2.eventId, correctedAt: `${t.p.weeks[6].startDate}T05:00:00Z`, actual: structuredClone(long2.actual), response: {...long2.response, ...BAD}};
const r = evaluateProgram(t.p, {...review(t.p, 6, {day: 0, hour: '06:00:00', observations: [fix]}), actualLedger: t.ledger}, opts);
console.log(`\ncorrection of the week-2 long run at the start of week 6 -> ${r.status} ${r.action}; disclosures ${(r.disclosures ?? []).map(d => d.id).join(',')}`);
t.p = r.proposal; t.ledger = r.actualLedger ?? t.ledger;
console.log('graduation now:', JSON.stringify(t.p.canonical.athlete.runGraduation ?? null), '| withdrawn:', JSON.stringify((t.p.canonical.athlete.runGraduationWithdrawn ?? []).map(x => ({from: x.withdrawnFrom, failed: x.failed}))));
for (let w = 3; w < 7; w++) console.log(`after:  w${w} ${t.p.weeks[w].phase} ${line(t.p, w)}`);
for (let w = 6; w < 12; w++) {
  const res = weekly(t, w);
  console.log(`w${w} ${t.p.weeks[w].phase} reviewed -> ${res.action}${(res.disclosures ?? []).some(d => d.id === 'RUN_QUALITY_INTRODUCED') ? ' (graduation offered again)' : ''} | next w${w + 1}: ${line(t.p, w + 1)} | state qualityRunner=${t.p.stateTrace[w + 1].run.qualityRunner} qStep=${t.p.stateTrace[w + 1].run.qualityStep}`);
}
