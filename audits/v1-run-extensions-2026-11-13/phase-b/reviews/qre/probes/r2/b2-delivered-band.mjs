// R2 / B2: the band an insight reads is the band the session was delivered with, from the record of formats.
// (1) every voting session's band vs the band the client was shown for that session in its own week (runSessions of the week's look);
// (2) past calibrations still move after a correction (the fact), the insight bands of the next week do not;
// (3) reordered format record; (4) a session whose format rows are removed; (5) a forged format row, hash-correct.
import { client, runner, result, DEVF, RWS_DEV, F, hash, START, flatSteps } from './lib.mjs';
const out = {};
const intake = runner({ id: 'b2-thr', asOf: '2027-01-02', start: START, weeks: 16, runExperience: 'EXPERIENCED', goal: 'PERFORMANCE', anchors: [result('10K', 3000, '2027-01-01')], recent: { runDaysPerWeek: 4, runMinutesPerWeek: 240, longestRunMinutes: 90, strengthDaysPerWeek: 1 }, schedule: { runDays: [0, 1, 3, 6], strengthDays: [2], runMinutes: 75, longRunMinutes: 130, longRunDay: 6 } });
const how = s => s.role === 'QUALITY' ? { pace: 330, rpe: 7, workPace: 325, actual: { measurement: 'TRACK' } } : { pace: s.role === 'LONG' ? 365 : 345, rpe: 4 };
const t = client(intake, { prefix: 'b2' }), shown = {};
const paceOf = run => { try { const p = flatSteps(run.blocks).find(x => x.kind === 'WORK' && x.intensity?.pace)?.intensity.pace; return p ? [p.fastSecondsPerKm, p.slowSecondsPerKm] : null; } catch { return null; } };
for (let w = 0; w < 10; w++) {
  const look = t.look(w, 0);
  for (const s of t.runsOf(w, x => x.role === 'QUALITY')) { const run = look.runSessions?.[s.id]; shown[s.id] = { expression: run?.expression ?? null, band: run ? paceOf(run) : null }; }
  if (w < 9) t.week(w, how);
}
const r10 = t.last, thr = r10.paceInsights.domains.THRESHOLD_CONTROLLED;
out.compare = thr.sessions.map(v => ({ id: v.sessionId, voted: [v.band.fastSecondsPerKm, v.band.slowSecondsPerKm], shownInItsWeek: shown[v.sessionId]?.band, expression: shown[v.sessionId]?.expression, equal: JSON.stringify([v.band.fastSecondsPerKm, v.band.slowSecondsPerKm]) === JSON.stringify(shown[v.sessionId]?.band) }));
out.excluded = thr.excluded.map(x => x.sessionId + ':' + x.reason);
out.allEqual = out.compare.every(x => x.equal);
const SAVE = t.save(), T = () => client(intake, { prefix: 'b2x' }).load(SAVE);
const thrOf = r => { const d = r.paceInsights.domains?.THRESHOLD_CONTROLLED; return d ? { state: d.state, votes: d.votes, sessions: d.sessions.map(v => [v.sessionId, v.band.fastSecondsPerKm, v.band.slowSecondsPerKm, v.class]), excluded: d.excluded.map(x => x.sessionId + ':' + x.reason) } : r.paceInsights.reason; };
// (2) a correction of 4 work paces in week index 9; past calibration re-read moves; next week's insight bands
{
  const u = T();
  const calPast = k => { const b = F.runCalibrationOf({ program: u.p, ledger: u.ledger, evidenceRecord: u.ev, asOf: `${u.day(10, 0)}T08:00:00-03:00`, weekIndex: k, engineStatus: 'KEEP', eligibility: null, runFormatRecord: u.fmt }, RWS_DEV).paceBands?.THRESHOLD_CONTROLLED; return b && [b.fastSecondsPerKm, b.slowSecondsPerKm, b.trainingFactor]; };
  const before = [6, 7, 8].map(calPast);
  const obs = [5, 6, 7, 8].map(w => u.runsOf(w, s => s.role === 'QUALITY')[0]).filter(Boolean).map(q => { const row = u.row(q.id); return { eventId: row.eventId + '-v2', athleteId: u.p.athleteId, sessionId: q.id, occurrenceDate: row.localDate, actual: { ...row.actual, work: { paceSecondsPerKm: 268 } }, response: row.response, correctionOf: row.eventId, correctedAt: `${u.day(9, 2)}T07:00:00-03:00` }; });
  u.step(9, 2, 'WEEKLY_REVIEW', { observations: obs }, '08:00'); u.week(9, how);
  const after = [6, 7, 8].map(calPast), next = u.look(10, 0);
  out.afterCorrection = { pastCalibrationBefore: before, pastCalibrationAfter: after, pastMoved: hash(before) !== hash(after), insightNextWeek: thrOf(next), bandsAreDelivered: thrOf(next).sessions?.every(([id, f, s]) => JSON.stringify([f, s]) === JSON.stringify(shown[id]?.band) || !shown[id]) };
}
// (3) the record of formats reversed; (4) a threshold session's format rows removed; (5) a forged format row with an absurd pace
{
  const base = thrOf(T().look(10, 1, {}, '09:00'));
  const u = T(); u.fmt = [...u.fmt].reverse(); const rev = thrOf(u.look(10, 1, {}, '09:00'));
  const v = T(), victim = v.runsOf(7, s => s.role === 'QUALITY')[0].id; v.fmt = v.fmt.filter(f => !(f.fact === 'RUN_FORMAT_EMITTED' && f.sessionId === victim)); const gone = v.look(10, 1, {}, '09:00');
  const x = T(), q = x.runsOf(8, s => s.role === 'QUALITY')[0], src = x.fmt.filter(f => f.fact === 'RUN_FORMAT_EMITTED' && f.sessionId === q.id).at(-1);
  const forged = JSON.parse(JSON.stringify(src.format)); for (const st of flatSteps(forged.blocks)) if (st.kind === 'WORK' && st.intensity?.pace) { st.intensity.pace.fastSecondsPerKm = 360; st.intensity.pace.slowSecondsPerKm = 380; }
  const hashMod = await import('file:///' + (process.env.WT || 'C:/Users/carva/Desktop/myApp/MyApp/.claude/worktrees/v1-run-extensions') + '/CoachingCore/src/value.mjs');
  const row = { ...src, eventId: src.eventId + '-forged', recordedAt: new Date(Date.parse(src.recordedAt) + 60000).toISOString(), format: forged, inputHash: hashMod.hash(forged) };
  x.fmt = [...x.fmt, row]; const fr = x.look(10, 1, {}, '09:00');
  out.record = { base, reversedEqual: hash(rev) === hash(base), removed: { victim, insight: thrOf(gone), runFormat: [gone.runFormat.status, gone.runFormat.reason ?? null, (gone.runFormat.unreadableFormats ?? []).length], engine: gone.status },
    forged: { session: q.id, insight: thrOf(fr), unreadableFormats: fr.runFormat?.unreadableFormats ?? null, runFormat: [fr.runFormat?.status, fr.runFormat?.reason ?? null], engine: fr.status } };
}
console.log(JSON.stringify(out, null, 1));
