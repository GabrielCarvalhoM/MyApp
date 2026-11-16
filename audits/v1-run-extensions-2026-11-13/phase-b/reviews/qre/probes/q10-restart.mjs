// Q10: a valid restart through the composed entry point: the run formats' answer key for key, carried answers kept, forecast from week 0.
import { client, racePlan, runner, result, plain, P, F, DEVF, DEVR, RWS_DEV, hash, rest } from './lib.mjs';
const t = client(racePlan({ goalMinutes: 48, id: 'q-rs' }), { prefix: 'rs' });
for (let w = 0; w < 6; w++) t.week(w, s => plain(t, s));
const s = JSON.parse(t.save());
const fresh = runner({ id: 'q-rs', asOf: '2027-02-20', start: '2027-02-22', weeks: 8, goal: { kind: 'RACE', event: { kind: '10K', date: '2027-04-18' } }, anchors: [result('10K', 3000, '2027-01-01')], athlete: { pause: { weeks: 0, reasonCategory: 'TRAVEL', nonclinical: true } } });
const inp = { intake: fresh, record: s.ledger, referenceState: s.ref, asOf: '2027-02-20T10:00:00-03:00', athleteId: t.p.athleteId, runEvidenceRecord: s.ev, runFormatRecord: s.fmt, runHistoryRecord: s.hist };
const out = {};
for (const [mode, o, f] of [['default', {}, {}], ['DEVF', DEVF, RWS_DEV], ['DEVR', DEVR, RWS_DEV]]) {
  const carried = [{ fact: 'PACE_REVISION_RESPONSE', eventId: 'carried-as-it-came' }];
  const a = P.restartProgram({ ...inp, paceRevisionRecord: carried }, o), b = F.restartProgram(inp, f);
  out[mode] = { program: !!a.program, same: hash(rest(a)) === hash(b), forecast: [a.runForecast.status, a.runForecast.reason ?? null, a.runForecast.week, a.runForecast.decomposition?.U ?? null, a.runForecast.observedForecast?.reason ?? null], insights: a.paceInsights.status, revision: a.paceRevision.status, carriedBack: hash(a.paceRevisionRecord) === hash(carried) };
}
console.log(JSON.stringify(out, null, 1));
