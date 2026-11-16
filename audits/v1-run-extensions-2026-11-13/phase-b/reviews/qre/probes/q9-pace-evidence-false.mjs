// Q9: a native threshold session whose execution says paceEvidence === false while paceWithheld is null and the row is not listed:
// which shapes exist, and does phase B keep each out of its pace readers (the line the mutant E03 removes)?
import { client, runner, result, report, live, DEVF, START, asPrescribed, nativeReport, flatSteps } from './lib.mjs';
const intake = runner({ id: 'q-e03', asOf: '2027-01-02', start: START, weeks: 16, runExperience: 'EXPERIENCED', goal: 'PERFORMANCE', anchors: [result('10K', 3000, '2027-01-01')], recent: { runDaysPerWeek: 4, runMinutesPerWeek: 240, longestRunMinutes: 90, strengthDaysPerWeek: 1 }, schedule: { runDays: [0, 1, 3, 6], strengthDays: [2], runMinutes: 75, longRunMinutes: 130, longRunDay: 6 } });
const out = {};
const SHAPES = {
  plainLaps: {},
  implausibleDistance: { distanceKm: 45, measurement: 'GPS' },
  untimed: { distanceKm: 10, measurement: 'GPS', minutes: undefined },
  lapNull: 'LAP_NULL',
};
for (const [name, extra] of Object.entries(SHAPES)) {
  const t = client(intake, { opts: DEVF, prefix: 'e' + name });
  const easy = s => ({ pace: s.role === 'LONG' ? 365 : 345, rpe: 4 });
  for (let w = 0; w < 9; w++) t.week(w, s => {
    if (s.role !== 'QUALITY') return easy(s);
    const run = t.runs[s.id];
    if (run?.expression !== 'NATIVE') return { pace: 330, rpe: 7, workPace: 268, actual: { measurement: 'TRACK' } };
    const o = nativeReport(t, s, { minutes: s.prescription.durationMinutes, rpe: 7, measurement: 'TRACK', met: extra === 'LAP_NULL' ? (() => null) : () => true });
    const a = { ...o.actual, work: { paceSecondsPerKm: 268 }, measurement: 'TRACK', ...(typeof extra === 'object' ? extra : {}) };
    if (typeof extra === 'object' && 'minutes' in extra && extra.minutes === undefined) delete a.minutes;
    return { ...o, actual: a };
  });
  const r = t.look(9, 0), d = r.paceInsights.domains.THRESHOLD_CONTROLLED;
  const natives = Object.values(r.runSessions).filter(x => x.execution && x.family === 'THRESHOLD' && x.expression === 'NATIVE').map(x => ({ id: x.sessionId, status: x.execution.status, basis: x.execution.basis, pe: x.execution.paceEvidence, pw: x.execution.paceWithheld, completed: x.execution.completed }));
  out[name] = { natives, votes: d.votes, excluded: d.excluded.map(x => x.sessionId + ':' + x.reason), voters: d.sessions.map(s => s.sessionId) };
}
console.log(JSON.stringify(out, null, 1));
