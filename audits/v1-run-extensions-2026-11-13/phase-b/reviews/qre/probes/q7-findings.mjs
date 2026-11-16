// Q7: the author's findings B-1, B-2, B-4, B-5 as facts; and the revision replay after a later correction (pure function).
import { client, racePlan, runner, result, plain, P, PI, RF, DEVF, addDays, START } from './lib.mjs';
const VAL = RF.RACE_FORECAST, PV = VAL.paceInsights;
const RC = (await import('./oracle.mjs')).RC;
const out = {};
// B-1: one pre-plan result only; forecast status at each Monday
{
  const t = client(racePlan({ goalMinutes: 48, id: 'q-b1' }), { prefix: 'b1' }), st = [];
  for (let w = 0; w < 16; w++) { const r = t.look(w, 0); st.push([w, r.runForecast.status, r.runForecast.reason ?? null, r.runCalibration.estimates?.['10K']?.confidence ?? r.runCalibration.estimates?.['10K']?.status, r.runForecast.raceWeek?.status ?? null]); if (w < 15) t.week(w, s => plain(t, s)); }
  out.B1 = st;
  const all = JSON.stringify(t.last); out.B4 = { criticalSpeedInLastAnswer: /critical speed/i.test(all) };
}
// B-2: plan lengths the engine generates for long horizons
{
  const lens = {};
  for (const weeks of [4, 8, 12, 16, 18, 20, 24, 26]) { const g = P.generateProgram(runner({ id: 'q-b2', asOf: '2027-01-02', start: START, weeks, goal: { kind: 'RACE', event: { kind: '10K', date: addDays(START, weeks * 7 - 1) } }, anchors: [result('10K', 3000, '2027-01-01')] }), DEVF); lens[weeks] = [g.program?.weeks?.length ?? null, g.status, g.runForecast?.status, g.runForecast?.reason ?? null, g.runForecast?.availableFrom ?? null]; }
  out.B2 = lens;
}
// B-5: a last slow session far from the others is exceptional and does not vote; the earlier ones may read IMPROVING
{
  const band = { fastSecondsPerKm: 310, slowSecondsPerKm: 330 };
  const mk = (date, pace) => ({ eventId: 'e' + date, sessionId: 's' + date, date, recordedOn: date, secondsPerKm: pace, rpe: 7, admitted: true, completed: true, comparable: true, compatible: true, longBouts: true, measurement: 'TRACK', totalWorkMinutes: 24 });
  const ex = [mk('2027-02-01', 298), mk('2027-02-08', 299), mk('2027-02-15', 297), mk('2027-02-22', 350)];
  const i = PI.insightOf('THRESHOLD_CONTROLLED', ex, { weekStart: '2027-03-01', cutoff: '2027-03-01', bandAt: () => band }, PV, RC);
  out.B5 = { state: i.state, sessions: i.sessions.map(s => [s.date, s.class, s.exceptional]) };
}
// Revision replay: an accepted step, then a later correction (first-recorded instant kept) of one voting session: does the history hold?
{
  const add = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10), wk = n => add('2027-01-04', 7 * (n - 1));
  const mkWeeks = upto => Array.from({ length: upto }, (_, i) => { const n = i + 1; return { index: i, startDate: wk(n), phase: 'BUILD', mode: 'EASY', band: n >= 6 ? { fastSecondsPerKm: 300, slowSecondsPerKm: 320, derived: true } : { fastSecondsPerKm: 310, slowSecondsPerKm: 330, derived: true }, factor: n >= 6 ? 0.045 : 0.03, withdrawn: false, referenceId: 'ref', withdrawal: null }; });
  const mk = (date, pace, rec = date) => ({ eventId: 'x' + date, sessionId: 's' + date, date, recordedOn: rec, secondsPerKm: pace, rpe: 7, admitted: true, completed: true, comparable: true, compatible: true, longBouts: true, measurement: 'TRACK', gpsGood: false, totalWorkMinutes: 24 });
  const base = [mk('2027-02-10', 282), mk('2027-02-17', 288), mk('2027-02-24', 281)];
  const run = (upto, execs, responses) => PI.paceRevisionOf({ now: upto - 1, weeks: mkWeeks(upto), executions: execs, adverse: [], breaks: [], responses, raceDate: '2027-06-30', experience: 'INTERMEDIATE', asOfDay: wk(upto), screenRequired: false, p3Offered: false, scope: 'plan' }, PV, RC);
  const w9 = run(9, base, []), accept = [{ offerId: w9.offer.offerId, response: 'ACCEPT', date: '2027-03-02' }];
  const w11 = run(11, base, accept);
  // the athlete corrects the 2027-02-17 session's pace in week 11 (the corrected row keeps the first-recorded instant of its chain)
  const corrected = [base[0], mk('2027-02-17', 296), base[2]];
  const w11c = run(11, corrected, accept);
  const w11c2 = run(11, [base[0], mk('2027-02-17', 318), base[2]], accept);
  out.revisionReplay = { before: { status: w11.status, fraction: w11.active?.fraction, band: w11.bandAt({ date: '2027-03-15', week: 10 }) }, afterSmallCorrection: { status: w11c.status, fraction: w11c.active?.fraction, ignored: w11c.history.ignored, band: w11c.bandAt({ date: '2027-03-15', week: 10 }) },
    afterLargerCorrection: { status: w11c2.status, ignored: w11c2.history.ignored, offerNow: w11c2.offer ? { week: w11c2.offer.week, step: w11c2.offer.stepFraction } : null, band: w11c2.bandAt({ date: '2027-03-15', week: 10 }) } };
}
console.log(JSON.stringify(out, null, 1));
