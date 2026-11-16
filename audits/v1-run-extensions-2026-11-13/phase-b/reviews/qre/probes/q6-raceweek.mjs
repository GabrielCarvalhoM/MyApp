// Q6: race week. The frozen forecast is the one week 14 (the week before RACE_WEEK) showed, and is never shown changed after late changes.
import { client, racePlan, result, report, live, DEVF, hash, device, asPrescribed, plain } from './lib.mjs';
const out = { singles: [], violations: [] };
const t0 = client(racePlan({ goalMinutes: 48, id: 'q-rw' }), { prefix: 'rw' });
const looks = [];
for (let w = 0; w < 15; w++) { looks[w] = t0.look(w, 0); t0.week(w, s => plain(t0, s), w === 7 ? { runEvidence: [result('10K', 2940, '2027-02-28', { id: 'tuneup' })] } : {}); }
const SAVE = t0.save();
const again = () => { const t = client(racePlan({ goalMinutes: 48, id: 'q-rw' }), { prefix: 'rw2' }); return t.load(SAVE); };
const w14 = looks[14].runForecast;
const mon = again().peek(15, 0).runForecast.raceWeek, sat = again().peek(15, 5).runForecast.raceWeek, day = again().peek(15, 6, {}, '07:00').runForecast.raceWeek;
out.week14 = { status: w14.status, display: w14.display, of: w14.observedForecast?.forecastSeconds, weekStart: w14.weekStart };
out.raceWeek = { monday: [mon.status, mon.reason ?? null, mon.frozenRange, mon.label], saturday: [sat.status, sat.frozenRange], raceDay: [day.status, day.reason] };
out.frozenEqualsWeek14 = mon.status === 'SHOWN_FROZEN' && mon.frozenRange.lowSeconds === w14.observedForecast.lowSeconds && mon.frozenRange.highSeconds === w14.observedForecast.highSeconds;
const want = mon.frozenRange && [mon.frozenRange.lowSeconds, mon.frozenRange.highSeconds];
const judge = (label, r) => { const x = r.runForecast.raceWeek; const got = x.frozenRange ? [x.frozenRange.lowSeconds, x.frozenRange.highSeconds] : null; const rec = { label, status: x.status, reason: x.reason ?? null, got }; if (x.status === 'SHOWN_FROZEN' && JSON.stringify(got) !== JSON.stringify(want)) { out.violations.push(rec); } return rec; };
const corr = (t, s, actual, at) => { const row = t.row(s.id); return row && { eventId: row.eventId + '-late', athleteId: t.p.athleteId, sessionId: s.id, occurrenceDate: row.localDate, actual: { ...row.actual, ...actual }, response: row.response, correctionOf: row.eventId, correctedAt: at }; };
// every run session of weeks 9..13, corrected alone in race week to a stop at 5 minutes
for (const w of [9, 10, 11, 12, 13]) for (const s of again().runsOf(w)) {
  const t = again(), o = corr(t, s, { minutes: 5, completed: false, ...(t.row(s.id)?.actual?.distanceKm ? { distanceKm: 0.8 } : {}) }, `${t.day(15, 1)}T07:00:00-03:00`); if (!o) continue;
  const r = t.step(15, 1, 'WEEKLY_REVIEW', { observations: [o] }, '08:00');
  out.singles.push({ ...judge(`correct ${s.id} (${s.role}, ${t.runs[s.id]?.expression ?? '?'})`, r), engine: r.status });
}
// all of weeks 10..13 corrected at once (to see the recompute would move)
{
  const t = again(), obs = [10, 11, 12, 13].flatMap(w => t.runsOf(w).map(s => corr(t, s, { minutes: 5, completed: false }, `${t.day(15, 1)}T07:00:00-03:00`))).filter(Boolean);
  out.batch = judge('batch corrections weeks 10-13', t.step(15, 1, 'WEEKLY_REVIEW', { observations: obs }, '08:00'));
}
// a device second source for each run session of week 13
for (const s of again().runsOf(13)) { const t = again(); out.singles.push(judge(`device ${s.id}`, t.step(15, 1, 'WEEKLY_REVIEW', { observations: [device(t, s, { minutes: 6 })] }, '08:00'))); }
// a race result dated in week 13, declared in race week; a 3-day break in week 12 declared in race week; a hold
{ const t = again(); out.singles.push(judge('late race result dated week 13', t.step(15, 1, 'WEEKLY_REVIEW', { runEvidence: [result('10K', 2900, t.day(13, 6), { id: 'late' })] }, '08:00'))); }
{ const t = again(); out.singles.push(judge('late break week 12', t.step(15, 1, 'WEEKLY_REVIEW', { interruption: { startDate: t.day(12, 1), endDate: t.day(12, 3), days: 3, reasonCategory: 'TRAVEL' } }, '08:00'))); }
// a session of week 13 never reported, first reported in race week: not read by the frozen forecast (may stay shown, unchanged)
{
  const t = client(racePlan({ goalMinutes: 48, id: 'q-rw' }), { prefix: 'rw3' });
  for (let w = 0; w < 15; w++) t.week(w, s => w === 13 && s.role === 'LONG' ? false : plain(t, s), w === 7 ? { runEvidence: [result('10K', 2940, '2027-02-28', { id: 'tuneup' })] } : {});
  const m = t.peek(15, 0).runForecast.raceWeek, long = t.runsOf(13, s => s.role === 'LONG')[0];
  const row = t.row(long.id);
  const r = t.step(15, 1, 'WEEKLY_REVIEW', { observations: [{ ...asPrescribed(t, long), eventId: 'late-first-' + long.id, ...(row ? { correctionOf: row.eventId, correctedAt: `${t.day(15, 1)}T07:00:00-03:00` } : {}) }] }, '08:00').runForecast.raceWeek;
  out.lateFirst = { monday: [m.status, m.frozenRange], after: [r.status, r.reason ?? null, r.frozenRange], hadRow: !!row };
}
out.summary = { singles: out.singles.length, byStatus: out.singles.reduce((a, x) => (a[x.status + ':' + x.reason] = (a[x.status + ':' + x.reason] || 0) + 1, a), {}), violations: out.violations.length };
console.log(JSON.stringify(out, null, 1));
