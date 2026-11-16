// Q5: composition. Per review of journeys of the judge: the composed answer minus its four keys vs the run formats' answer, byte for byte,
// under (a) no options (default authorities), (b) forecast+insights on, (c) revision on with no revision in force; plus a caller's band hook and
// the extension's review keys never reach anything below.
import { client, racePlan, runner, result, report, plain, live, DEVF, DEVR, OFF, hash, device, START, P, F, RWS_DEV, ELIG, rest, RFC_KEYS, asPrescribed, nativeReport } from './lib.mjs';
const out = { compared: 0, diffs: [], disabledKeys: new Set(), stepsByJourney: {} };
const MINE = ['paceRevisionResponse', 'paceRevisionRecord'];
const minus = rv => Object.fromEntries(Object.entries(rv).filter(([k]) => !MINE.includes(k)));
const evil = { [F.BAND_OF]: ({ week, domain, band }) => ({ ...band, fastSecondsPerKm: 100, slowSecondsPerKm: 120 }) };
function compare(label, p, rv) {
  const pairs = [
    ['default', P.evaluateProgram(p, rv, {}), F.evaluateProgram(p, minus(rv), {})],
    ['DEVF', P.evaluateProgram(p, rv, DEVF), F.evaluateProgram(p, minus(rv), RWS_DEV)],
    ['DEVR-noRevision', P.evaluateProgram(p, { ...rv, paceRevisionRecord: [] }, DEVR), F.evaluateProgram(p, minus(rv), RWS_DEV)],
    ['DEVF+callerBandHook', P.evaluateProgram(p, rv, { ...DEVF, ...evil }), F.evaluateProgram(p, minus(rv), RWS_DEV)],
    ['OFF', P.evaluateProgram(p, { ...rv, paceRevisionResponse: { offerId: 'x', response: 'ACCEPT' } }, OFF), F.evaluateProgram(p, minus(rv), RWS_DEV)],
  ];
  for (const [mode, a, b] of pairs) {
    out.compared++;
    if (hash(rest(a)) !== hash(b)) { const keys = [...new Set([...Object.keys(rest(a)), ...Object.keys(b)])].filter(k => hash(a[k]) !== hash(b[k])); out.diffs.push({ label, mode, keys }); }
    if (mode === 'default' || mode === 'OFF') for (const k of ['runForecast', 'paceInsights', 'paceRevision']) out.disabledKeys.add(mode + ':' + k + ':' + a[k]?.status + ':' + a[k]?.reason);
    if (mode === 'default' && hash(a.paceRevisionRecord) !== hash(rv.paceRevisionRecord ?? [])) out.diffs.push({ label, mode, keys: ['paceRevisionRecord not returned as carried'] });
  }
  return pairs[1][1];
}
function drive(name, t, plan) {
  let n = 0;
  for (const [w, d, kind, extra, time] of plan(t)) { const rv = t.review(w, d, kind, extra ?? {}, time ?? '20:00'); t.take(compare(`${name} w${w}d${d}`, t.p, rv)); n++; }
  out.stepsByJourney[name] = n;
}
const weekObs = (t, w, how) => t.p.weeks[w].sessions.filter(live).map(s => { const o = s.sport === 'RUN' ? how(s) : {}; return o === false ? report(t.p, s, { completed: false }) : o?.eventId ? o : report(t.p, s, o ?? {}); });
// J1: 10K race plan to race week, native sessions as prescribed, a tune-up race, a correction, a device second source, a missed week, a hold.
{
  const t = client(racePlan({ goalMinutes: 48, id: 'q-j1' }), { prefix: 'j1' });
  drive('J1', t, t => {
    const steps = [];
    for (let w = 0; w < 16; w++) {
      steps.push([w, 0, 'WEEKLY_REVIEW', {}, '08:00']);
      if (w === 9) { steps.push([w, 2, 'WEEKLY_REVIEW', { eligibility: ELIG(t.day(w, 2), { illness: true }) }, '09:00']); steps.push([w, 4, 'WEEKLY_REVIEW', {}, '09:00']); }
      if (w === 5) continue; // missed week
      const extra = w === 7 ? { runEvidence: [result('10K', 2940, '2027-02-28', { id: 'tuneup' })] } : {};
      steps.push([w, 6, 'WEEKLY_REVIEW', { ...extra, get observations() { return weekObs(t, w, s => asPrescribed(t, s)); } }, '20:00']);
      if (w === 8) steps.push([w + 1, 1, 'WEEKLY_REVIEW', { get observations() { const s = t.runsOf(8)[0], row = t.row(s.id); return row ? [{ eventId: row.eventId + '-v2', athleteId: t.p.athleteId, sessionId: s.id, occurrenceDate: row.localDate, actual: { ...row.actual, minutes: 12, completed: false }, response: row.response, correctionOf: row.eventId, correctedAt: `${t.day(9, 1)}T07:00:00-03:00` }] : []; } }, '08:00']);
      if (w === 10) steps.push([w + 1, 1, 'WEEKLY_REVIEW', { get observations() { const s = t.runsOf(10)[1]; return s ? [device(t, s, { minutes: 15 })] : []; } }, '08:00']);
    }
    return steps.map(s => { const [w, d, k, x, time] = s; return [w, d, k, x, time]; });
  });
  out.J1final = { forecast: t.last.runForecast.status, raceWeek: t.last.runForecast.raceWeek?.status, reason: t.last.runForecast.raceWeek?.reason };
  // restart from J1's record
  const s = JSON.parse(t.save());
  const fresh = runner({ id: 'q-j1', asOf: '2027-04-24', start: '2027-04-26', weeks: 8, goal: { kind: 'RACE', event: { kind: '10K', date: '2027-06-20' } } });
  const inp = { intake: fresh, record: s.ledger, referenceState: s.ref, asOf: '2027-04-24T10:00:00-03:00', athleteId: t.p.athleteId, runEvidenceRecord: s.ev, runFormatRecord: s.fmt, runHistoryRecord: s.hist };
  for (const [mode, o, f] of [['default', {}, {}], ['DEVF', DEVF, RWS_DEV], ['DEVR', DEVR, RWS_DEV]]) {
    const a = P.restartProgram({ ...inp, paceRevisionRecord: [{ fact: 'PACE_REVISION_RESPONSE', eventId: 'carried' }] }, o), b = F.restartProgram(inp, f); out.compared++;
    if (hash(rest(a)) !== hash(b)) out.diffs.push({ label: 'restart', mode, keys: Object.keys(b).filter(k => hash(a[k]) !== hash(b[k])) });
    out['restart_' + mode] = { forecast: [a.runForecast.status, a.runForecast.reason], carried: a.paceRevisionRecord };
  }
  for (const [mode, o, f] of [['default', {}, {}], ['DEVF', DEVF, RWS_DEV]]) { const a = P.generateProgram(fresh, o), b = F.generateProgram(fresh, f); out.compared++; if (hash(rest(a)) !== hash(b)) out.diffs.push({ label: 'generate', mode, keys: Object.keys(b).filter(k => hash(a[k]) !== hash(b[k])) }); }
}
// J2: a threshold athlete (no race), work paces reported, a symptom stop, a clinical hold.
{
  const intake = runner({ id: 'q-j2', asOf: '2027-01-02', start: START, weeks: 12, runExperience: 'EXPERIENCED', goal: 'PERFORMANCE', anchors: [result('10K', 3000, '2027-01-01')], recent: { runDaysPerWeek: 4, runMinutesPerWeek: 240, longestRunMinutes: 90, strengthDaysPerWeek: 1 }, schedule: { runDays: [0, 1, 3, 6], strengthDays: [2], runMinutes: 75, longRunMinutes: 130, longRunDay: 6 } });
  const t = client(intake, { prefix: 'j2' });
  const how = s => s.role === 'QUALITY' ? { pace: 330, rpe: 7, workPace: 270, actual: { measurement: 'TRACK' } } : { pace: s.role === 'LONG' ? 365 : 345, rpe: 4 };
  drive('J2', t, t => {
    const steps = [];
    for (let w = 0; w < 10; w++) {
      steps.push([w, 0, 'WEEKLY_REVIEW', {}, '08:00']);
      if (w === 6) steps.push([w, 2, 'WEEKLY_REVIEW', { get observations() { const s = t.runsOf(6)[0]; return [{ ...report(t.p, s, { completed: false }), actual: { completed: false, minutes: 10, stop: { reason: 'SYMPTOM' } } }]; } }, '09:00']);
      steps.push([w, 6, 'WEEKLY_REVIEW', { get observations() { return weekObs(t, w, how); } }, '20:00']);
    }
    return steps;
  });
}
out.disabledKeys = [...out.disabledKeys];
out.diffCount = out.diffs.length;
console.log(JSON.stringify(out, null, 1));
