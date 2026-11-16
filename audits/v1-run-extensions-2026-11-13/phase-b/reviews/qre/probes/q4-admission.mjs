// Q4: evidence admission through the composed entry point. Invariants checked on every answer:
//  I-A no voting insight session, no offered revision session, is a row the run formats withhold or do not admit;
//  I-B a completed execution of a finished counted week is credited 1 (admission never removes adherence);
//  I-C an answer of the run formats that delivers no session carries no forecast number, no insight domain, no offer.
import { client, runner, result, report, plain, live, DEVF, DEVR, hash, device, UNKNOWN, START, P, F, RWS_DEV, ELIG, addDays } from './lib.mjs';
const out = { cases: [], violations: [] };
const thrIntake = () => runner({ id: 'q-thr', asOf: '2027-01-02', start: START, weeks: 16, runExperience: 'EXPERIENCED', goal: 'PERFORMANCE', anchors: [result('10K', 3000, '2027-01-01')], recent: { runDaysPerWeek: 4, runMinutesPerWeek: 240, longestRunMinutes: 90, strengthDaysPerWeek: 1 }, schedule: { runDays: [0, 1, 3, 6], strengthDays: [2], runMinutes: 75, longRunMinutes: 130, longRunDay: 6 } });
function check(label, r) {
  if (!r?.runSessions || r.runFormat?.status !== 'ACTIVE') return;
  const listed = new Map((r.runFormat.paceEvidenceWithheld ?? []).map(x => [x.eventId, x.reason]));
  const exOf = id => r.runSessions[id]?.execution ?? null;
  const admittedEv = (sid, eid) => { const e = exOf(sid); return !!e && e.eventId === eid && e.paceWithheld === null && !listed.has(eid) && e.paceEvidence !== false; };
  for (const [d, x] of Object.entries(r.paceInsights?.domains ?? {})) for (const s of x.sessions ?? []) if (!admittedEv(s.sessionId, s.eventId)) out.violations.push({ label, kind: 'I-A vote', domain: d, eventId: s.eventId, e: exOf(s.sessionId) && { pw: exOf(s.sessionId).paceWithheld, pe: exOf(s.sessionId).paceEvidence, eid: exOf(s.sessionId).eventId }, listed: listed.get(s.eventId) ?? null });
  const off = r.paceRevision?.offer; if (off) for (const eid of off.sessions) { const sid = (r.actualLedger ?? []).find(o => o.eventId === eid)?.sessionId; if (!admittedEv(sid, eid)) out.violations.push({ label, kind: 'I-A offer', eventId: eid }); }
  const fcw = r.runForecast?.adherence?.weeks ?? [];
  for (const k of fcw) if (k.counted) for (const c of k.credits ?? []) { const e = exOf(c.sessionId); if (e?.completed === true && c.rule !== 'COMPLETED') { const row = (r.actualLedger ?? []).find(o => o.eventId === e.eventId); out.violations.push({ label, kind: 'I-B credit', week: k.week, sessionId: c.sessionId, rule: c.rule, c: c.c, rowFirst: row?.provenance?.firstRecordedAt ?? null, rowDate: row?.localDate }); } }
}
function inert(label, r) {
  const f = r.runForecast, i = r.paceInsights, v = r.paceRevision;
  const nums = f && (f.observedForecast || f.planScenario || f.current || f.marathon);
  const bad = r.runFormat?.status !== 'ACTIVE' && (nums || Object.keys(i?.domains ?? {}).length || v?.offer || v?.active);
  out.cases.push({ label, runFormat: [r.runFormat?.status, r.runFormat?.reason], forecast: [f?.status, f?.reason], insights: [i?.status, i?.reason], revision: v?.status, bad: !!bad });
  if (bad) out.violations.push({ label, kind: 'I-C inert answer carries numbers' });
}
// ---- the E-01 / C-01 / D-01 matrix on threshold sessions by time ----
const WATCH = { none: null, POOR: { distanceKm: 9, measurement: 'GPS', gpsQuality: 'POOR' }, OK: { distanceKm: 6.2, measurement: 'GPS', gpsQuality: 'OK' }, emptySegments: { distanceKm: 6.2, measurement: 'GPS', gpsQuality: 'OK', segments: [] }, partial: { minutes: 20, completed: false } };
const MORE = { none: undefined, plain: {}, lists: { segments: [{ distanceKm: 4, measurement: 'GPS' }, { distanceKm: 2.2, measurement: 'GPS' }] }, declaresReason: { declared: { distanceKm: 9, reason: 'SIGNAL_LOSS' } }, declaresNoReason: { declared: { distanceKm: 9 } }, minutesOnly: { minutes: 50 } };
const FIRST = { plain: {}, lists: { segments: [{ distanceKm: 4, measurement: 'GPS' }, { distanceKm: 2.2, measurement: 'GPS' }] } };
const BASE = (() => { const t = client(thrIntake(), { opts: DEVR, prefix: 'b' }); const how = s => s.role === 'QUALITY' ? { pace: 330, rpe: 7, workPace: 268, actual: { measurement: 'TRACK' } } : { pace: s.role === 'LONG' ? 365 : 345, rpe: 4 }; for (let w = 0; w < 3; w++) t.week(w, how); return t.save(); })();
let n = 0;
for (const [wk, watch] of Object.entries(WATCH)) for (const [mk, more] of Object.entries(MORE)) for (const [fk, first] of Object.entries(FIRST)) for (const resync of [false, true]) {
  if (resync && !watch) continue;
  const label = `watch=${wk} more=${mk} first=${fk} resync=${resync}`;
  const t = client(thrIntake(), { opts: DEVR, prefix: 'm' + (n++) }); t.load(BASE);
  for (const w of [3, 4, 5, 6, 7, 8]) {
    const q = t.runsOf(w, s => s.role === 'QUALITY')[0]; if (!q) continue;
    const others = t.p.weeks[w].sessions.filter(live).filter(s => s.id !== q.id).map(s => report(t.p, s, s.sport === 'RUN' ? { pace: s.role === 'LONG' ? 365 : 345, rpe: 4 } : {}));
    const said = report(t.p, q, { workPace: 255, rpe: 7 }), run = t.runs[q.id];
    const a1 = { ...said, eventId: 'app-' + q.id, actual: { ...said.actual, ...(run?.timeFormatHash ? { formatHash: run.timeFormatHash } : {}), ...first } };
    const d1 = watch ? device(t, q, watch) : null, day = t.day(w, 6);
    t.step(w, 6, 'WEEKLY_REVIEW', { observations: [...others, a1, ...(d1 ? [d1] : [])] }, '18:00');
    if (more !== undefined) t.step(w, 6, 'WEEKLY_REVIEW', { observations: [{ ...a1, eventId: a1.eventId + '-v2', actual: { ...a1.actual, ...more }, correctionOf: a1.eventId, correctedAt: `${day}T19:30:00-03:00` }] }, '20:00');
    if (resync) t.step(w, 6, 'WEEKLY_REVIEW', { observations: [{ ...d1, eventId: d1.eventId + '-v2', correctionOf: d1.eventId, correctedAt: `${day}T20:30:00-03:00` }] }, '21:00');
    check(label + ' w' + w, t.last);
  }
  const r = t.look(9, 0); check(label + ' look9', r);
  const thr = r.paceInsights.domains.THRESHOLD_CONTROLLED;
  const withheld = (r.runFormat.paceEvidenceWithheld ?? []).filter(x => /run-d/.test(x.sessionId)).length;
  out.cases.push({ label, withheldRows: withheld, votes: thr.votes, excluded: thr.excluded.map(x => x.reason + (x.withheld ? ':' + x.withheld : '')), state: thr.state, action: thr.action, revision: r.paceRevision.status, offerSessions: r.paceRevision.offer?.sessions ?? null, band: r.paceRevision.effectivePaceBands?.THRESHOLD_CONTROLLED && [r.paceRevision.effectivePaceBands.THRESHOLD_CONTROLLED.fastSecondsPerKm, r.paceRevision.effectivePaceBands.THRESHOLD_CONTROLLED.slowSecondsPerKm], q8: r.runCalibration.capacity?.trainingFactors?.THRESHOLD_CONTROLLED?.fraction });
}
// ---- C-05 shapes: inert answers ----
{
  const t = client(thrIntake(), { opts: DEVR, prefix: 'c' }); t.load(BASE);
  const q = t.runsOf(3, s => s.role === 'QUALITY')[0];
  t.week(3, s => s.role === 'QUALITY' ? { pace: 330, rpe: 7, workPace: 268, actual: { measurement: 'TRACK' } } : { pace: 345, rpe: 4 });
  const rv = t.review(4, 1, 'WEEKLY_REVIEW', {}, '08:00');
  inert('before the record', P.evaluateProgram(t.p, { ...rv, asOf: `${t.day(2, 1)}T08:00:00-03:00`, weekIndex: 2, eligibility: ELIG(t.day(2, 1)) }, DEVR));
  inert('no asOf', P.evaluateProgram(t.p, { ...rv, asOf: undefined }, DEVR));
  inert('unknown format cited', P.evaluateProgram(t.p, { ...rv, observations: [{ ...report(t.p, t.runsOf(4)[0], { pace: 345, rpe: 4 }), actual: { completed: true, minutes: 40, formatHash: 'f'.repeat(64) } }] }, DEVR));
  inert('symptom stop', P.evaluateProgram(t.p, { ...rv, observations: [{ ...report(t.p, t.runsOf(4)[0], { completed: false }), actual: { completed: false, minutes: 10, stop: { reason: 'SYMPTOM' } } }] }, DEVR));
  inert('clinical eligibility', P.evaluateProgram(t.p, { ...rv, eligibility: ELIG(t.day(4, 1), { pain: true, persistentPain: true }) }, DEVR));
  inert('invalid review', P.evaluateProgram(t.p, { ...rv, version: 'NOPE' }, DEVR));
  inert('lost format record', P.evaluateProgram(t.p, { ...rv, runFormatRecord: [] }, DEVR));
  inert('valid look', P.evaluateProgram(t.p, rv, DEVR));
}
console.log(JSON.stringify(out, null, 1));
