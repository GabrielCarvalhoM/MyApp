// Q3: temporal dependence. Does anything recorded from the week's first day on move that week's forecast or insights?
import { client, racePlan, plain, report, live, DEVF, DEVR, hash, strip, device } from './lib.mjs';
const out = {};
const T = () => client(racePlan({ goalMinutes: 48 }));
// base: weeks 0..4 as prescribed, threshold sessions reported with a work pace inside the band
const thr = (t, s) => s.role === 'QUALITY' ? { pace: 330, rpe: 7, workPace: 300 } : plain(t, s);
const t0 = T(); for (let w = 0; w < 5; w++) t0.week(w, s => thr(t0, s));
const SAVE = t0.save();
const fresh = () => { const t = T(); return t.load(SAVE); };
const fc = r => ({ digest: r.runForecast.inputDigest, status: r.runForecast.status, of: r.runForecast.observedForecast?.forecastSeconds ?? null, ps: r.runForecast.planScenario?.forecastSeconds ?? null, mean: r.runForecast.adherence?.mean ?? null, cal: r.runCalibration?.hash });
const ins = r => { const d = r.paceInsights?.domains?.THRESHOLD_CONTROLLED; return d ? { state: d.state, votes: d.votes, classes: d.sessions.map(s => s.class), id: d.id, hash: r.paceInsights.hash } : r.paceInsights?.status; };
const correction = (t, s, actual, at) => { const row = t.row(s.id); return { eventId: row.eventId + '-v2', athleteId: t.p.athleteId, sessionId: s.id, occurrenceDate: row.localDate, actual: { ...row.actual, ...actual }, response: row.response, correctionOf: row.eventId, correctedAt: at }; };
// (1) mid-week correction of a week-3 easy session: completed -> not completed
{
  const t = fresh(), mon = t.look(5, 0);
  const easy = t.runsOf(3, s => s.role !== 'QUALITY' && s.role !== 'LONG')[0] ?? t.runsOf(3, s => s.role !== 'QUALITY')[0];
  const fix = t.step(5, 2, 'WEEKLY_REVIEW', { observations: [correction(t, easy, { minutes: 10, completed: false }, `${t.day(5, 2)}T07:00:00-03:00`)] }, '08:00');
  const thu = t.look(5, 3);
  out.correctionMidWeek = { session: easy.id, rowNow: { eventId: t.row(easy.id).eventId, first: t.row(easy.id).provenance?.firstRecordedAt, completed: t.row(easy.id).actual.completed }, monday: fc(mon), afterFix: fc(fix), thursday: fc(thu),
    creditMon: mon.runForecast.adherence.weeks[3].credits.find(c => c.sessionId === easy.id), creditThu: thu.runForecast.adherence.weeks[3].credits.find(c => c.sessionId === easy.id),
    forecastMoved: fc(mon).digest !== fc(thu).digest, calibrationMoved: fc(mon).cal !== fc(thu).cal };
  // the same correction recorded the week after: the week-6 forecast differs (allowed)
  const t2 = fresh(); t2.week(5, s => thr(t2, s)); const m6 = t2.look(6, 0);
  t2.step(6, 2, 'WEEKLY_REVIEW', { observations: [correction(t2, easy, { minutes: 10, completed: false }, `${t2.day(6, 2)}T07:00:00-03:00`)] }, '08:00');
  const th6 = t2.look(6, 3);
  out.correctionMidWeek.week6 = { monday: fc(m6), thursday: fc(th6), moved: fc(m6).digest !== fc(th6).digest };
}
// (2) mid-week correction of last week's threshold work pace (single author): does the insight move inside the week?
{
  const t = fresh(); t.week(5, s => thr(t, s)); t.week(6, s => thr(t, s));
  const mon = t.look(7, 0, {}, '08:00');
  const obs = [3, 4, 5, 6].map(w => { const q = t.runsOf(w, s => s.role === 'QUALITY')[0]; return q ? correction(t, q, { work: { paceSecondsPerKm: 270 } }, `${t.day(7, 2)}T07:00:00-03:00`) : null; }).filter(Boolean);
  const fix = t.step(7, 2, 'WEEKLY_REVIEW', { observations: obs }, '08:00');
  const thu = t.look(7, 3);
  out.insightCorrectionMidWeek = { corrected: obs.length, monday: ins(mon), thursday: ins(thu), moved: hash(ins(mon)) !== hash(ins(thu)), calMoved: mon.runCalibration.hash !== thu.runCalibration.hash,
    q8Mon: mon.runCalibration.capacity?.trainingFactors?.THRESHOLD_CONTROLLED, q8Thu: thu.runCalibration.capacity?.trainingFactors?.THRESHOLD_CONTROLLED };
}
// (3) mid-week: a second source (device) for a past session
{
  const t = fresh(), mon = t.look(5, 0);
  const easy = t.runsOf(3, s => s.role !== 'QUALITY')[0];
  const r = t.step(5, 2, 'WEEKLY_REVIEW', { observations: [device(t, easy, { minutes: 12 })] }, '08:00');
  const thu = t.look(5, 3);
  out.secondSourceMidWeek = { conflicted: t.row(easy.id)?.conflicted ?? null, monday: fc(mon), thursday: fc(thu), moved: fc(mon).digest !== fc(thu).digest, credit: thu.runForecast.adherence.weeks[3].credits.find(c => c.sessionId === easy.id) };
}
// (4) mid-week: a late declared break covering week 3 (7 days) and (5) 14 days
for (const days of [7, 14]) {
  const t = fresh(), mon = t.look(5, 0);
  const r = t.step(5, 2, 'WEEKLY_REVIEW', { interruption: { startDate: t.day(3, 0), endDate: t.day(3, days - 1 > 6 ? 6 : days - 1), days, reasonCategory: 'TRAVEL' } }, '08:00');
  const thu = t.look(5, 3);
  out['breakMidWeek' + days] = { monday: fc(mon), thursday: fc(thu), statusThu: thu.runForecast.status, reasonThu: thu.runForecast.reason, moved: fc(mon).digest !== fc(thu).digest };
}
// (6) determinism, JSON round trip, ledger order
{
  const t = fresh(); const a = t.peek(5, 2), b = t.peek(5, 2);
  const rv = t.review(5, 2, 'WEEKLY_REVIEW', {}, '08:00');
  const c = (await import('./lib.mjs')).P.evaluateProgram(strip(t.p), strip(rv), DEVF);
  const shuffled = { ...rv, actualLedger: [...rv.actualLedger].reverse(), runFormatRecord: [...rv.runFormatRecord].reverse() };
  const d = (await import('./lib.mjs')).P.evaluateProgram(t.p, shuffled, DEVF);
  const keys = ['runForecast', 'paceInsights', 'paceRevision'];
  out.determinism = { sameTwice: keys.every(k => hash(a[k]) === hash(b[k])), jsonRoundTrip: keys.every(k => hash(a[k]) === hash(c[k])), reversedRecords: Object.fromEntries(keys.map(k => [k, hash(a[k]) === hash(d[k])])), wholeAnswerReversed: hash(a) === hash(d) };
}
console.log(JSON.stringify(out, null, 1));
