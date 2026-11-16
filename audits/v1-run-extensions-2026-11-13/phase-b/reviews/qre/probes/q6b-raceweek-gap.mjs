// Q6b: race week. A correction in race week of a week-13 session first reported as not done: is it seen as a change?
// And: can a correction in race week change the recomputed frozen range while it is still shown?
import { client, racePlan, result, report, plain, asPrescribed, P, DEVF, hash } from './lib.mjs';
const out = {};
const build = (skip) => { const t = client(racePlan({ goalMinutes: 48, id: 'q-rw' }), { prefix: 'g' }); for (let w = 0; w < 15; w++) t.week(w, s => skip(w, s) ? false : plain(t, s), w === 7 ? { runEvidence: [result('10K', 2940, '2027-02-28', { id: 'tuneup' })] } : {}); return t; };
// weeks 10-13: every run reported as not done (adherence low, observed forecast differs from the plan scenario)
const t = build((w, s) => w >= 10 && w <= 13 && s.sport === 'RUN');
const w14 = t.peek(14, 0).runForecast, mon = t.peek(15, 0).runForecast.raceWeek;
out.lowAdherence = { w14: [w14.status, w14.display, w14.observedForecast?.status, w14.observedForecast?.forecastSeconds, w14.adherence?.mean], rwMonday: [mon.status, mon.reason ?? null, mon.frozenRange] };
// in race week, the athlete corrects each not-done report of weeks 10-13 to done (as prescribed)
const obs = [10, 11, 12, 13].flatMap(w => t.runsOf(w).map(s => { const row = t.row(s.id); const o = plain(t, s); return { ...o, eventId: 'fix-' + s.id, correctionOf: row.eventId, correctedAt: `${t.day(15, 1)}T07:00:00-03:00` }; }));
const r = t.step(15, 1, 'WEEKLY_REVIEW', { observations: obs }, '08:00');
const rows = [10, 11, 12, 13].flatMap(w => t.runsOf(w).map(s => t.row(s.id))).map(o => [o.eventId, o.actual.completed, o.provenance?.firstRecordedAt]);
const facts = (t.fmt ?? []).filter(f => f.fact === 'RUN_REPORT_RECEIVED' && /w1[0-3]-run/.test(f.sessionId)).map(f => [f.sessionId, f.recordedAt, f.report?.standing]);
// what the recomputed week-14 forecast is now (same cutoff), through the composed entry point's own pure path: ask a look of week 14 again
const recomputed = P.evaluateProgram(t.p, { ...t.review(15, 1, 'WEEKLY_REVIEW', {}, '09:00'), weekIndex: 14 }, DEVF).runForecast;
out.afterCorrections = { engine: r.status, raceWeek: [r.runForecast.raceWeek.status, r.runForecast.raceWeek.reason ?? null, r.runForecast.raceWeek.frozenRange], rowsNow: rows.slice(0, 4), facts: facts.slice(0, 6), factsCount: facts.length,
  week14ReadAgain: [recomputed.week, recomputed.status, recomputed.observedForecast?.forecastSeconds, recomputed.adherence?.mean] };
console.log(JSON.stringify(out, null, 1));
