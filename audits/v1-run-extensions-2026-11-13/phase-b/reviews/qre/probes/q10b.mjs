import { client, racePlan, runner, result, plain, F, RWS_DEV } from './lib.mjs';
const t = client(racePlan({ goalMinutes: 48, id: 'q-rs' }), { prefix: 'rs' });
for (let w = 0; w < 6; w++) t.week(w, s => plain(t, s));
const s = JSON.parse(t.save());
const fresh = runner({ id: 'q-rs', asOf: '2027-02-20', start: '2027-02-22', weeks: 8, goal: { kind: 'RACE', event: { kind: '10K', date: '2027-04-18' } }, anchors: [result('10K', 3000, '2027-01-01')], athlete: { pause: { weeks: 0, reasonCategory: 'TRAVEL', nonclinical: true } } });
const b = F.restartProgram({ intake: fresh, record: s.ledger, referenceState: s.ref, asOf: '2027-02-20T10:00:00-03:00', athleteId: t.p.athleteId, runEvidenceRecord: s.ev, runFormatRecord: s.fmt, runHistoryRecord: s.hist }, RWS_DEV);
console.log(b.status, b.reason, JSON.stringify(b.errors), JSON.stringify(b.missingInputs));
