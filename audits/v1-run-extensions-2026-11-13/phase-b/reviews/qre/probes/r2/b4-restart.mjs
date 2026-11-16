// R2 / B4: restarts the author's cycle did not test. Credits and votes of the new plan from rows of the old plan.
import { client, racePlan, runner, result, plain, report, P, F, DEVF, RWS_DEV, ELIG, addDays, hash, rest } from './lib.mjs';
const out = {};
function restartFrom(t, { asOfDay, start, asOfTime = '12:00', weeks = 8 }) {
  const s = JSON.parse(t.save());
  const fresh = runner({ id: t.p.athleteId, asOf: asOfDay, start, weeks, goal: { kind: 'RACE', event: { kind: '10K', date: addDays(start, weeks * 7 - 1) } }, anchors: [result('10K', 3000, '2027-01-01')], athlete: { pause: { weeks: 0, reasonCategory: 'TRAVEL', nonclinical: true } } });
  const inp = { intake: fresh, record: s.ledger, referenceState: s.ref, asOf: `${asOfDay}T${asOfTime}:00-03:00`, athleteId: t.p.athleteId, runEvidenceRecord: s.ev, runFormatRecord: s.fmt, runHistoryRecord: s.hist };
  const a = P.restartProgram(inp, DEVF), b = F.restartProgram(inp, RWS_DEV);
  return { a, same: hash(rest(a)) === hash(b), ledger: a.carriedRecord ?? s.ledger };
}
function lookNew(a, ledger, w, d, time = '08:00') {
  const p = a.proposal ?? a.program, day = addDays(p.startDate, 7 * w + d);
  return P.evaluateProgram(p, { version: 'R6-REVIEW-1', synthetic: true, purpose: 'SHADOW_REFERENCE', asOf: `${day}T${time}:00-03:00`, weekIndex: w, event: { id: 'b4-' + w + '-' + d, kind: 'WEEKLY_REVIEW' }, eligibility: ELIG(day), observations: [], actualLedger: ledger, ...(a.referenceState ? { referenceState: a.referenceState } : {}), runEvidenceRecord: a.runEvidenceRecord, runFormatRecord: a.runFormatRecord, runHistoryRecord: a.runHistoryRecord, paceRevisionRecord: [] }, DEVF);
}
const summary = r => ({ engine: r.status, forecast: [r.runForecast.status, r.runForecast.reason ?? null], weeks: r.runForecast.adherence?.weeks?.map(k => [k.week, k.a, k.credits.map(c => c.sessionId + ':' + c.rule).join(' ')]) ?? null, votes: Object.fromEntries(Object.entries(r.paceInsights.domains ?? {}).map(([k, d]) => [k, d.sessions.map(v => v.sessionId + '@' + v.date)])) });
// (1) restart with no gap: right after the week-6 review (Sunday evening), new plan from the next Monday
{
  const t = client(racePlan({ goalMinutes: 48, id: 'b4a' }), { prefix: 'b4a' }); for (let w = 0; w < 6; w++) t.week(w, s => plain(t, s));
  const { a, same, ledger } = restartFrom(t, { asOfDay: t.day(5, 6), start: t.day(6, 0), asOfTime: '21:00' });
  out.noGap = { program: !!(a.proposal ?? a.program), same, atRestart: [a.runForecast.status, a.runForecast.reason ?? null], week1: (a.proposal ?? a.program) ? summary(lookNew(a, ledger, 1, 0)) : null, week2: (a.proposal ?? a.program) ? summary(lookNew(a, ledger, 2, 0)) : null };
}
// (2) restart on the day of an old-plan run, the new plan starting that same day (old rows dated inside the new week 0, recorded that day)
{
  const t = client(racePlan({ goalMinutes: 48, id: 'b4b' }), { prefix: 'b4b' });
  // week 0 of the old plan: report the sessions up to Sunday on Sunday morning (the Sunday run included)
  t.step(0, 6, 'WEEKLY_REVIEW', { observations: t.p.weeks[0].sessions.filter(s => s.prescription && s.status !== 'SKIPPED').map(s => report(t.p, s, s.sport === 'RUN' ? { pace: 345, rpe: 4 } : {})) }, '09:00');
  const oldIds = t.ledger.filter(o => !o.fact && o.context?.sport === 'RUN').map(o => o.sessionId + '@' + o.localDate);
  const r = restartFrom(t, { asOfDay: t.day(0, 6), start: t.day(0, 6), asOfTime: '12:00' });
  const p = r.a.proposal ?? r.a.program;
  out.sameDayStart = { oldRows: oldIds, program: !!p, same: r.same, engine: r.a.status, reason: r.a.reason, newWeek0: p ? p.weeks[0].sessions.filter(s => s.sport === 'RUN').map(s => s.id + '@' + s.date) : null, week1: p ? summary(lookNew(r.a, r.ledger, 1, 0)) : null };
}
console.log(JSON.stringify(out, null, 1));
