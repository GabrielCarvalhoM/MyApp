// Q3d: T5 literally. Rows first recorded inside week 5 (device reports of past sessions) move week 5's forecast as shown.
import { client, racePlan, plain, device } from './lib.mjs';
const fc = r => ({ digest: r.runForecast.inputDigest, status: r.runForecast.status, display: r.runForecast.display, of: r.runForecast.observedForecast?.forecastSeconds ?? null, ps: r.runForecast.planScenario?.forecastSeconds ?? null, mean: r.runForecast.adherence?.mean ?? null });
const t = client(racePlan({ goalMinutes: 48, id: 'q-3d' }), { prefix: 'd' }); for (let w = 0; w < 5; w++) t.week(w, s => plain(t, s));
const mon = t.look(5, 0);
const before = t.row(t.runsOf(2)[0].id);
const obs = [1, 2, 3, 4].flatMap(w => t.runsOf(w).map(s => device(t, s, { minutes: 12 })));
const r = t.step(5, 2, 'WEEKLY_REVIEW', { observations: obs }, '08:00');
const thu = t.look(5, 3);
const s2 = t.runsOf(2)[0], after = t.row(s2.id), live = t.ledger.filter(o => o.sessionId === s2.id && !o.fact);
console.log(JSON.stringify({ engine: r.status, monday: fc(mon), thursday: fc(thu), shownChanged: JSON.stringify([fc(mon).display, fc(mon).of]) !== JSON.stringify([fc(thu).display, fc(thu).of]),
  rowBefore: { eventId: before.eventId, first: before.provenance?.firstRecordedAt, observedAt: before.observedAt },
  rowAfter: { eventId: after?.eventId, conflicted: after?.conflicted, first: after?.provenance?.firstRecordedAt, observedAt: after?.observedAt },
  rowsOfSession: live.map(o => [o.eventId, !!o.superseded, o.conflicted ?? null, o.provenance?.firstRecordedAt]),
  creditThu: thu.runForecast.adherence.weeks[2].credits.find(c => c.sessionId === s2.id) }, null, 1));
