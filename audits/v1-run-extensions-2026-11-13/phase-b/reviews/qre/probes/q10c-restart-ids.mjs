// Q10c: after a restart, can a row of the previous plan be credited as a session of the new plan (session ids are plan-relative)?
import { client, racePlan, runner, result, plain, P, DEVF, hash, ELIG, addDays } from './lib.mjs';
const t = client(racePlan({ goalMinutes: 48, id: 'q-rs' }), { prefix: 'rs' });
for (let w = 0; w < 6; w++) t.week(w, s => plain(t, s));
const s = JSON.parse(t.save());
const fresh = runner({ id: 'q-rs', asOf: '2027-02-20', start: '2027-02-22', weeks: 8, goal: { kind: 'RACE', event: { kind: '10K', date: '2027-04-18' } }, anchors: [result('10K', 3000, '2027-01-01')], athlete: { pause: { weeks: 0, reasonCategory: 'TRAVEL', nonclinical: true } } });
const a = P.restartProgram({ intake: fresh, record: s.ledger, referenceState: s.ref, asOf: '2027-02-20T10:00:00-03:00', athleteId: t.p.athleteId, runEvidenceRecord: s.ev, runFormatRecord: s.fmt, runHistoryRecord: s.hist }, DEVF);
const p = a.proposal ?? a.program, ledger = a.carriedRecord ?? s.ledger;
const newIds = p.weeks[0].sessions.filter(x => x.sport === 'RUN').map(x => x.id), oldIds = new Set(s.ledger.filter(o => !o.fact).map(o => o.sessionId));
const day = addDays(p.startDate, 7), rv = { version: 'R6-REVIEW-1', synthetic: true, purpose: 'SHADOW_REFERENCE', asOf: `${day}T08:00:00-03:00`, weekIndex: 1, event: { id: 'rs-new-1', kind: 'WEEKLY_REVIEW' }, eligibility: ELIG(day), observations: [], actualLedger: ledger, ...(a.referenceState ? { referenceState: a.referenceState } : {}), runEvidenceRecord: a.runEvidenceRecord, runFormatRecord: a.runFormatRecord, runHistoryRecord: a.runHistoryRecord, paceRevisionRecord: [] };
const r = P.evaluateProgram(p, rv, DEVF);
const wk0 = r.runForecast.adherence?.weeks?.find(k => k.week === 0);
console.log(JSON.stringify({ engine: r.status, programId: [t.p.id, p.id], newWeek0RunIds: newIds, collide: newIds.filter(id => oldIds.has(id)), forecast: [r.runForecast.status, r.runForecast.reason ?? null], week0Credits: wk0?.credits ?? null, week0a: wk0?.a ?? null,
  executions: newIds.map(id => [id, r.runSessions?.[id]?.execution?.eventId ?? null]) }, null, 1));
// two weeks into the new plan, nothing reported in it
const day2 = addDays(p.startDate, 14), rv2 = { ...rv, asOf: `${day2}T08:00:00-03:00`, weekIndex: 2, event: { id: 'rs-new-2', kind: 'WEEKLY_REVIEW' }, eligibility: ELIG(day2) };
const r2 = P.evaluateProgram(p, rv2, DEVF), f2 = r2.runForecast;
// control: the same record with the previous plan's rows given other session ids (so nothing can collide)
const renamed = ledger.map(o => o && !o.fact && typeof o.sessionId === 'string' ? { ...o, sessionId: 'old-' + o.sessionId } : o);
const r3 = P.evaluateProgram(p, { ...rv2, actualLedger: renamed }, DEVF), f3 = r3.runForecast;
console.log(JSON.stringify({ week2: { engine: r2.status, status: f2.status, display: f2.display, of: f2.observedForecast?.forecastSeconds ?? f2.observedForecast?.reason, ps: f2.planScenario?.forecastSeconds, mean: f2.adherence?.mean, weeks: f2.adherence?.weeks?.map(k => [k.week, k.a, k.credits.map(c => c.rule).join('/')]) },
  control: { engine: r3.status, status: f3.status, display: f3.display, of: f3.observedForecast?.forecastSeconds ?? f3.observedForecast?.reason, ps: f3.planScenario?.forecastSeconds, mean: f3.adherence?.mean, weeks: f3.adherence?.weeks?.map(k => [k.week, k.a, k.credits.map(c => c.rule).join('/')]) } }, null, 1));
