// R2 / B1: inside a week, the forecast and the insights show the Monday's numbers or a withdrawal with a reason, never another number.
// The R1 shapes (second source, corrections, one correction, insight corrections) plus shapes the author's cycle did not test.
import { client, racePlan, runner, result, plain, report, device, DEVF, hash, START } from './lib.mjs';
const out = { cases: [], violations: [] };
const fv = r => { const f = r.runForecast; return f.status === 'SHOWN' || f.status === 'TOO_UNCERTAIN_TO_SHOW' ? { kind: 'NUMBERS', digest: f.inputDigest, of: f.observedForecast?.forecastSeconds ?? null, ps: f.planScenario?.forecastSeconds ?? null, display: f.display } : { kind: 'NONE', status: f.status, reason: f.reason ?? null, numbers: !!(f.observedForecast || f.planScenario || f.current) }; };
const iv = r => { const p = r.paceInsights; return p.status === 'ACTIVE' ? { kind: 'NUMBERS', d: Object.fromEntries(Object.entries(p.domains).map(([k, d]) => [k, [d.state, d.votes, d.id]])) } : { kind: 'NONE', status: p.status, reason: p.reason ?? null, numbers: Object.keys(p.domains ?? {}).length > 0 }; };
function judge(label, mon, later) {
  const rec = { label, forecast: [fv(mon), fv(later)], insights: [iv(mon), iv(later)] };
  for (const [k, [a, b]] of [['forecast', rec.forecast], ['insights', rec.insights]]) {
    if (b.kind === 'NUMBERS' && a.kind === 'NUMBERS' && hash(a) !== hash(b)) out.violations.push({ label, what: k, monday: a, later: b });
    if (b.kind === 'NONE' && b.numbers) out.violations.push({ label, what: k + ' withdrawal carries numbers', later: b });
    if (b.kind === 'NUMBERS' && a.kind === 'NONE') out.violations.push({ label, what: k + ' numbers appear inside the week after a withdrawn Monday', later: b });
  }
  out.cases.push({ label, forecast: rec.forecast.map(x => x.kind === 'NONE' ? x.reason ?? x.status : 'numbers'), insights: rec.insights.map(x => x.kind === 'NONE' ? x.reason ?? x.status : 'numbers'), same: hash(rec.forecast[0]) === hash(rec.forecast[1]) && hash(rec.insights[0]) === hash(rec.insights[1]) });
}
const corr = (t, s, actual, at, suffix = '-v2') => { const row = t.row(s.id); return row && { eventId: row.eventId + suffix, athleteId: t.p.athleteId, sessionId: s.id, occurrenceDate: row.localDate, actual: { ...row.actual, ...actual }, response: row.response, correctionOf: row.eventId, correctedAt: at }; };
// base A: 10K plan, weeks 1-5 as prescribed, threshold sessions with a work pace
const thr = (t, s) => s.role === 'QUALITY' ? { pace: 330, rpe: 7, workPace: 300 } : plain(t, s);
const A0 = client(racePlan({ goalMinutes: 48, id: 'b1' }), { prefix: 'b1' }); for (let w = 0; w < 5; w++) A0.week(w, s => thr(A0, s));
const SA = A0.save(), A = () => client(racePlan({ goalMinutes: 48, id: 'b1' }), { prefix: 'b1x' }).load(SA);
const run = (label, act) => { const t = A(), mon = t.look(5, 0); act(t); const thu = t.look(5, 3), sun = t.look(5, 6, {}, '07:00'); judge(label + ' (Thu)', mon, thu); judge(label + ' (Sun)', mon, sun); return t; };
const wed = t => `${t.day(5, 2)}T07:00:00-03:00`;
// R1 shapes
run('R1 q3d: device reports of the 12 runs of weeks 2-5', t => t.step(5, 2, 'WEEKLY_REVIEW', { observations: [1, 2, 3, 4].flatMap(w => t.runsOf(w).map(s => device(t, s, { minutes: 12 }))) }, '08:00'));
run('R1 q3b(a): corrections of the 12 runs', t => t.step(5, 2, 'WEEKLY_REVIEW', { observations: [1, 2, 3, 4].flatMap(w => t.runsOf(w).map(s => corr(t, s, { minutes: 5, completed: false }, wed(t)))).filter(Boolean) }, '08:00'));
run('R1 q3(1): one correction', t => t.step(5, 2, 'WEEKLY_REVIEW', { observations: [corr(t, t.runsOf(3, s => s.role !== 'QUALITY')[0], { minutes: 10, completed: false }, wed(t))] }, '08:00'));
// new shapes
run('device report that agrees (same minutes) for one run', t => { const s = t.runsOf(3)[0]; t.step(5, 2, 'WEEKLY_REVIEW', { observations: [device(t, s, { minutes: s.prescription.durationMinutes })] }, '08:00'); });
run('same eventId re-sent with other content (no correctionOf)', t => { const s = t.runsOf(3, x => x.role !== 'QUALITY')[0], row = t.row(s.id); t.step(5, 2, 'WEEKLY_REVIEW', { observations: [{ eventId: row.eventId, athleteId: t.p.athleteId, sessionId: s.id, occurrenceDate: row.localDate, actual: { ...row.actual, minutes: 8, completed: false }, response: row.response }] }, '08:00'); });
run('correction of a strength session of week 4', t => { const s = t.p.weeks[3].sessions.find(x => x.sport === 'STRENGTH'), row = s && t.row(s.id); if (row) t.step(5, 2, 'WEEKLY_REVIEW', { observations: [{ ...report(t.p, s, {}), eventId: row.eventId + '-v2', correctionOf: row.eventId, correctedAt: wed(t) }] }, '08:00'); });
run('race result dated week 4, declared on Wednesday', t => t.step(5, 2, 'WEEKLY_REVIEW', { runEvidence: [result('10K', 2880, t.day(3, 5), { id: 'late-race' })] }, '08:00'));
run('3-day break in week 4 declared on Wednesday', t => t.step(5, 2, 'WEEKLY_REVIEW', { interruption: { startDate: t.day(3, 1), endDate: t.day(3, 3), days: 3, reasonCategory: 'TRAVEL' } }, '08:00'));
run('client edits a past row in the ledger it sends (no report)', t => { const s = t.runsOf(3, x => x.role !== 'QUALITY')[0]; t.ledger = t.ledger.map(o => o.sessionId === s.id && !o.fact && !o.superseded ? { ...o, actual: { ...o.actual, completed: false, minutes: 5 } } : o); });
// insights: a threshold athlete (no race), corrections of past work paces on Wednesday
{
  const intake = runner({ id: 'b1-thr', asOf: '2027-01-02', start: START, weeks: 16, runExperience: 'EXPERIENCED', goal: 'PERFORMANCE', anchors: [result('10K', 3000, '2027-01-01')], recent: { runDaysPerWeek: 4, runMinutesPerWeek: 240, longestRunMinutes: 90, strengthDaysPerWeek: 1 }, schedule: { runDays: [0, 1, 3, 6], strengthDays: [2], runMinutes: 75, longRunMinutes: 130, longRunDay: 6 } });
  const how = s => s.role === 'QUALITY' ? { pace: 330, rpe: 7, workPace: 325, actual: { measurement: 'TRACK' } } : { pace: s.role === 'LONG' ? 365 : 345, rpe: 4 };
  const t0 = client(intake, { prefix: 'b1t' }); for (let w = 0; w < 9; w++) t0.week(w, how); const ST = t0.save();
  const T = () => client(intake, { prefix: 'b1t2' }).load(ST);
  const go = (label, act) => { const t = T(), mon = t.look(9, 0); act(t); judge(label + ' (Thu)', mon, t.look(9, 3)); judge(label + ' (Sun)', mon, t.look(9, 6, {}, '07:00')); };
  go('R1 q3b(b): 4 threshold work paces corrected', t => t.step(9, 2, 'WEEKLY_REVIEW', { observations: [5, 6, 7, 8].map(w => t.runsOf(w, s => s.role === 'QUALITY')[0]).filter(Boolean).map(q => corr(t, q, { work: { paceSecondsPerKm: 268 } }, `${t.day(9, 2)}T07:00:00-03:00`)) }, '08:00'));
  go('device report of a past threshold session with conditions RAIN', t => { const q = t.runsOf(8, s => s.role === 'QUALITY')[0]; t.step(9, 2, 'WEEKLY_REVIEW', { observations: [device(t, q, { minutes: q.prescription.durationMinutes, conditions: ['RAIN'], distanceKm: 9, measurement: 'GPS', gpsQuality: 'OK' })] }, '08:00'); });
  go('nothing happens', t => {});
}
out.summary = { cases: out.cases.length, violations: out.violations.length };
console.log(JSON.stringify(out, null, 1));
