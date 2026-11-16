// Q3b: temporal dependence, sharper cases.
import { client, racePlan, plain, report, runner, result, live, DEVF, DEVR, hash, F, RWS_DEV, START } from './lib.mjs';
const out = {};
const correction = (t, s, actual, at, eventSuffix = '-v2') => { const row = t.row(s.id); return { eventId: row.eventId + eventSuffix, athleteId: t.p.athleteId, sessionId: s.id, occurrenceDate: row.localDate, actual: { ...row.actual, ...actual }, response: row.response, correctionOf: row.eventId, correctedAt: at }; };
const fc = r => ({ digest: r.runForecast.inputDigest, status: r.runForecast.status, display: r.runForecast.display, of: r.runForecast.observedForecast?.forecastSeconds ?? null, ofStatus: r.runForecast.observedForecast?.status, ps: r.runForecast.planScenario?.forecastSeconds ?? null, mean: r.runForecast.adherence?.mean ?? null });
// (a) mid-week corrections that change the displayed forecast
{
  const t = client(racePlan({ goalMinutes: 48 })); for (let w = 0; w < 5; w++) t.week(w, s => plain(t, s));
  const mon = t.look(5, 0);
  const obs = [1, 2, 3, 4].flatMap(w => t.runsOf(w).map(s => correction(t, s, { minutes: 5, completed: false }, `${t.day(5, 2)}T07:00:00-03:00`)));
  t.step(5, 2, 'WEEKLY_REVIEW', { observations: obs }, '08:00');
  const thu = t.look(5, 3);
  out.displayedForecastMovesMidWeek = { corrected: obs.length, monday: fc(mon), thursday: fc(thu), shownChanged: JSON.stringify(fc(mon).of) !== JSON.stringify(fc(thu).of) || fc(mon).display !== fc(thu).display };
}
// (b) R3 / check (a): a past week's calibration re-read after a later correction (threshold work pace)
{
  const intake = runner({ id: 'q-thr', asOf: '2027-01-02', start: START, weeks: 16, runExperience: 'EXPERIENCED', goal: 'PERFORMANCE', anchors: [result('10K', 3000, '2027-01-01')], recent: { runDaysPerWeek: 4, runMinutesPerWeek: 240, longestRunMinutes: 90, strengthDaysPerWeek: 1 }, schedule: { runDays: [0, 1, 3, 6], strengthDays: [2], runMinutes: 75, longRunMinutes: 130, longRunDay: 6 } });
  const t = client(intake, { opts: DEVR });
  const how = s => s.role === 'QUALITY' ? { pace: 330, rpe: 7, workPace: 325, actual: { measurement: 'TRACK' } } : { pace: s.role === 'LONG' ? 365 : 345, rpe: 4 };
  for (let w = 0; w < 9; w++) t.week(w, how);
  const mon = t.look(9, 0);
  const calPast = k => F.runCalibrationOf({ program: t.p, ledger: t.ledger, evidenceRecord: t.ev, asOf: `${t.day(9, 3)}T08:00:00-03:00`, weekIndex: k, engineStatus: 'KEEP', eligibility: null, runFormatRecord: t.fmt }, RWS_DEV);
  const before = [6, 7, 8].map(k => calPast(k).paceBands?.THRESHOLD_CONTROLLED).map(b => b && [b.fastSecondsPerKm, b.slowSecondsPerKm, b.trainingFactor]);
  const thrMon = mon.paceInsights.domains.THRESHOLD_CONTROLLED, revMon = mon.paceRevision;
  const obs = [5, 6, 7, 8].map(w => t.runsOf(w, s => s.role === 'QUALITY')[0]).filter(Boolean).map(q => correction(t, q, { work: { paceSecondsPerKm: 268 } }, `${t.day(9, 2)}T07:00:00-03:00`));
  t.step(9, 2, 'WEEKLY_REVIEW', { observations: obs }, '08:00');
  const thu = t.look(9, 3);
  const after = [6, 7, 8].map(k => calPast(k).paceBands?.THRESHOLD_CONTROLLED).map(b => b && [b.fastSecondsPerKm, b.slowSecondsPerKm, b.trainingFactor]);
  const thrThu = thu.paceInsights.domains.THRESHOLD_CONTROLLED;
  out.pastCalibrationAfterCorrection = { corrected: obs.length, pastWeekBandsBefore: before, pastWeekBandsAfter: after, pastBandsMoved: JSON.stringify(before) !== JSON.stringify(after),
    currentBand: [mon.runCalibration.paceBands.THRESHOLD_CONTROLLED, thu.runCalibration.paceBands.THRESHOLD_CONTROLLED].map(b => [b.fastSecondsPerKm, b.slowSecondsPerKm, b.trainingFactor]),
    insightMon: { state: thrMon.state, votes: thrMon.votes, classes: thrMon.sessions.map(s => s.class), action: thrMon.action }, insightThu: { state: thrThu.state, votes: thrThu.votes, classes: thrThu.sessions.map(s => s.class), action: thrThu.action },
    revisionMon: { status: revMon.status, offer: revMon.offer?.offerId ?? null }, revisionThu: { status: thu.paceRevision.status, offer: thu.paceRevision.offer?.offerId ?? null, why: thu.paceRevision.offer ? null : 'none' } };
}
// (c) a declared break of 14 days (properly spanning weeks 3-4), recorded at the start of week 5
{
  const t = client(racePlan({ goalMinutes: 48 })); for (let w = 0; w < 3; w++) t.week(w, s => plain(t, s));
  const r = t.step(3, 1, 'WEEKLY_REVIEW', { interruption: { startDate: t.day(3, 0), endDate: t.day(4, 6), days: 14, reasonCategory: 'TRAVEL' } }, '08:00');
  const l5 = t.look(5, 0);
  const modes = t.p.stateTrace?.map(x => x?.run?.mode);
  out.break14 = { atDeclaration: { status: r.runForecast.status, reason: r.runForecast.reason, engine: r.status }, week5: { status: l5.runForecast.status, reason: l5.runForecast.reason, engine: l5.status }, modes };
}
console.log(JSON.stringify(out, null, 1));
