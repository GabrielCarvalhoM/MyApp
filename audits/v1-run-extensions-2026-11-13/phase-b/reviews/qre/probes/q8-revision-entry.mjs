// Q8: the pace revision on (development authority) through the composed entry point: what changes against the run formats' answer, and
// nothing else; the record of answers; a correction after acceptance (replay through the entry point).
import { client, runner, result, report, live, DEVR, hash, START, P, F, RWS_DEV, rest } from './lib.mjs';
const out = { perAnswer: [] };
const MINE = ['paceRevisionResponse', 'paceRevisionRecord'];
const minus = rv => Object.fromEntries(Object.entries(rv).filter(([k]) => !MINE.includes(k)));
const intake = runner({ id: 'q-rev', asOf: '2027-01-02', start: START, weeks: 16, runExperience: 'EXPERIENCED', goal: 'PERFORMANCE', anchors: [result('10K', 3000, '2027-01-01')], recent: { runDaysPerWeek: 4, runMinutesPerWeek: 240, longestRunMinutes: 90, strengthDaysPerWeek: 1 }, schedule: { runDays: [0, 1, 3, 6], strengthDays: [2], runMinutes: 75, longRunMinutes: 130, longRunDay: 6 } });
const t = client(intake, { opts: DEVR, prefix: 'v' });
const how = s => s.role === 'QUALITY' ? { pace: 330, rpe: 7, workPace: 268, actual: { measurement: 'TRACK' } } : { pace: s.role === 'LONG' ? 365 : 345, rpe: 4 };
const famOf = id => t.p.weeks.flatMap(k => k.sessions).find(s => s.id === id)?.prescription?.family;
const cmp = (label, rv) => {
  const a = P.evaluateProgram(t.p, rv, DEVR), b = F.evaluateProgram(t.p, minus(rv), RWS_DEV);
  const keys = Object.keys(rest(a)).filter(k => hash(a[k]) !== hash(b[k]));
  const sess = a.runSessions && b.runSessions ? Object.keys(a.runSessions).filter(id => hash(a.runSessions[id]) !== hash(b.runSessions[id])) : [];
  const fmtKeys = a.runFormat && b.runFormat ? Object.keys(a.runFormat).filter(k => hash(a.runFormat[k]) !== hash(b.runFormat[k])) : [];
  out.perAnswer.push({ label, status: a.paceRevision.status, keys, runFormatKeys: fmtKeys, sessions: sess.map(id => id + ':' + famOf(id)), calSame: hash(a.runCalibration) === hash(b.runCalibration), engineSame: hash(a.proposal) === hash(b.proposal) && hash(a.actualLedger) === hash(b.actualLedger) && a.inputHash === b.inputHash, band: a.paceRevision.effectivePaceBands?.THRESHOLD_CONTROLLED && [a.paceRevision.effectivePaceBands.THRESHOLD_CONTROLLED.fastSecondsPerKm, a.paceRevision.effectivePaceBands.THRESHOLD_CONTROLLED.slowSecondsPerKm], record: a.paceRevisionRecord.length });
  return a;
};
for (let w = 0; w < 9; w++) t.week(w, how);
let look = t.take(cmp('look9', t.review(9, 0, 'WEEKLY_REVIEW', {}, '08:00')));
const offer = look.paceRevision.offer;
out.offer = offer && { step: offer.stepFraction, sessions: offer.sessions.length, effectiveFrom: offer.effectiveFrom, testFirst: offer.testFirst };
// an answer under an instant earlier than the record: not recorded
const early = P.evaluateProgram(t.p, { ...t.review(9, 0, 'WEEKLY_REVIEW', { paceRevisionResponse: { offerId: offer?.offerId, response: 'ACCEPT' } }, '07:00') }, DEVR);
out.earlyAnswer = { recorded: early.paceRevision.response?.recorded ?? null, reason: early.paceRevision.response?.reason ?? null, record: early.paceRevisionRecord.length };
t.take(cmp('accept9', t.review(9, 1, 'WEEKLY_REVIEW', { paceRevisionResponse: { offerId: offer?.offerId, response: 'ACCEPT' } }, '09:00')));
t.week(9, how);
t.take(cmp('look10', t.review(10, 0, 'WEEKLY_REVIEW', {}, '08:00')));
t.week(10, how);
t.take(cmp('look11', t.review(11, 0, 'WEEKLY_REVIEW', {}, '08:00')));
// a correction, in week 11, of one voting session of the accepted offer (single author; its chain keeps its first-recorded instant)
const voted = offer.sessions.map(eid => t.ledger.find(o => o.eventId === eid)).filter(Boolean);
const target = voted.at(-2) ?? voted[0];
const fix = { eventId: target.eventId + '-v2', athleteId: t.p.athleteId, sessionId: target.sessionId, occurrenceDate: target.localDate, actual: { ...target.actual, work: { paceSecondsPerKm: 330 } }, response: target.response, correctionOf: target.eventId, correctedAt: `${t.day(11, 2)}T07:00:00-03:00` };
t.take(cmp('correction11', t.review(11, 2, 'WEEKLY_REVIEW', { observations: [fix] }, '08:00')));
const after = t.take(cmp('look11-after', t.review(11, 3, 'WEEKLY_REVIEW', {}, '08:00')));
out.afterCorrection = { status: after.paceRevision.status, ended: after.paceRevision.ended, ignored: after.paceRevision.history?.ignored, band: after.paceRevision.effectivePaceBands.THRESHOLD_CONTROLLED && [after.paceRevision.effectivePaceBands.THRESHOLD_CONTROLLED.fastSecondsPerKm, after.paceRevision.effectivePaceBands.THRESHOLD_CONTROLLED.slowSecondsPerKm], record: after.paceRevisionRecord.length, corrected: target.eventId };
console.log(JSON.stringify(out, null, 1));
