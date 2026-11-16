// QRE probe library: a conforming client of the composed entry point, written by the judge.
// Uses the frozen helpers of earlier phases (v1rc-helpers, v1rws-helpers) for intakes and reports only; never the v1rfc helpers.
const WT = process.env.WT || 'C:/Users/carva/Desktop/myApp/MyApp/.claude/worktrees/v1-run-extensions';
const CC = 'file:///' + WT + '/CoachingCore/';
export const P = await import(CC + 'src/v1-run-forecast-index.mjs');
export const F = await import(CC + 'src/v1-run-format-index.mjs');
export const RF = await import(CC + 'src/v1-race-forecast.mjs');
export const PI = await import(CC + 'src/v1-pace-insights.mjs');
const RCH = await import(CC + 'test/v1rc-helpers.mjs');
const RWH = await import(CC + 'test/v1rws-helpers.mjs');
const VAL = await import(CC + 'src/value.mjs');
export const { ELIG, addDays, live, runner, result, report } = RCH;
export const { asPrescribed, nativeReport, flatSteps } = RWH;
export const hash = VAL.hash;
export const RC_DEV = RCH.DEV, RWS_DEV = RWH.DEV;
export const DEVF = { ...RWH.DEV, runForecast: RF.devRunForecast() };
export const DEVR = { ...RWH.DEV, runForecast: RF.devRunForecast(Object.values(RF.FORECAST_BOUNDARIES)) };
export const OFF = { ...RWH.DEV, runForecast: RF.devRunForecast([]) };
export const RFC_KEYS = ['runForecast', 'paceInsights', 'paceRevision', 'paceRevisionRecord'];
export const rest = r => Object.fromEntries(Object.entries(r).filter(([k]) => !RFC_KEYS.includes(k)));
export const START = '2027-01-04';
const STATE = ['p', 'ledger', 'ref', 'ev', 'fmt', 'hist', 'rev', 'n'];
export function client(intake, { opts = DEVF, prefix = 'q' } = {}) {
  const g = P.generateProgram(intake, opts);
  const t = { g, p: g.program, ledger: [], ref: null, ev: g.runEvidenceRecord ?? [], fmt: g.runFormatRecord ?? [], hist: g.runHistoryRecord ?? [], rev: g.paceRevisionRecord ?? [], runs: g.runSessions ?? {}, n: 0, opts, last: g };
  t.day = (w, d) => addDays(t.p.startDate, w * 7 + d);
  t.review = (w, d, kind, extra = {}, time = '20:00') => {
    const day = t.day(w, d);
    return { version: 'R6-REVIEW-1', synthetic: true, purpose: 'SHADOW_REFERENCE', asOf: extra.asOf ?? `${day}T${time}:00-03:00`, weekIndex: extra.weekIndex ?? w, event: { id: extra.eventId ?? `${prefix}-${++t.n}`, kind }, eligibility: extra.eligibility ?? ELIG(day), observations: extra.observations ?? [],
      ...(extra.interruption ? { interruption: extra.interruption } : {}), ...(extra.signals ? { signals: extra.signals } : {}),
      ...(t.ledger.length ? { actualLedger: t.ledger } : {}), ...(t.ref ? { referenceState: t.ref } : {}), ...(extra.runEvidence ? { runEvidence: extra.runEvidence } : {}), runEvidenceRecord: t.ev, runFormatRecord: t.fmt, runHistoryRecord: t.hist,
      paceRevisionRecord: t.rev, ...(extra.paceRevisionResponse ? { paceRevisionResponse: extra.paceRevisionResponse } : {}) };
  };
  t.take = r => { t.ledger = r.actualLedger ?? t.ledger; t.ref = r.referenceState ?? t.ref; if (r.proposal) t.p = r.proposal; t.ev = r.runEvidenceRecord ?? t.ev; t.fmt = r.runFormatRecord ?? t.fmt; t.hist = r.runHistoryRecord ?? t.hist; t.rev = r.paceRevisionRecord ?? t.rev; if (r.runFormat?.status === 'ACTIVE') t.runs = r.runSessions; t.last = r; return r; };
  t.ask = (w, d, kind, extra = {}, time = '20:00') => P.evaluateProgram(t.p, t.review(w, d, kind, extra, time), t.opts); // no state change
  t.step = (w, d, kind, extra = {}, time = '20:00') => t.take(t.ask(w, d, kind, extra, time));
  t.week = (w, how = () => ({}), extra = {}) => t.step(w, 6, 'WEEKLY_REVIEW', { ...extra, observations: [...t.p.weeks[w].sessions.filter(live).map(s => { const o = s.sport === 'RUN' ? how(s) : {}; return o === false ? report(t.p, s, { completed: false }) : o?.eventId ? o : report(t.p, s, o ?? {}); }), ...(extra.more ?? [])] });
  t.look = (w, d = 0, extra = {}, time = '08:00') => t.step(w, d, 'WEEKLY_REVIEW', extra, time);
  t.peek = (w, d = 0, extra = {}, time = '08:00') => t.ask(w, d, 'WEEKLY_REVIEW', extra, time);
  t.row = id => t.ledger.find(o => o.sessionId === id && !o.superseded && !o.fact) ?? null;
  t.runsOf = (w, pick = () => true) => t.p.weeks[w].sessions.filter(s => s.sport === 'RUN' && live(s) && pick(s));
  t.save = () => JSON.stringify(Object.fromEntries(STATE.map(k => [k, t[k]])));
  t.load = s => { Object.assign(t, JSON.parse(s)); return t; };
  return t;
}
export const racePlan = ({ event = '10K', weeks = 16, anchors = [result('10K', 3000, '2027-01-01')], experience = 'INTERMEDIATE', goalMinutes = null, id = 'q-race', x = {} } = {}) => runner({ id, asOf: '2027-01-02', start: START, weeks, runExperience: experience,
  goal: { kind: 'RACE', event: { kind: event, date: addDays(START, weeks * 7 - 1), ...(goalMinutes ? { timeGoalMinutes: goalMinutes } : {}) } }, anchors, ...x });
export const plain = (t, s) => { const o = s.sport === 'RUN' ? asPrescribed(t, s) : {}; return o?.eventId ? o : report(t.p, s, o ?? {}); };
export const UNKNOWN = { performance: 'UNKNOWN', recovery: 'UNKNOWN', effort: 'UNKNOWN', nextDayFunction: 'UNKNOWN' };
export const device = (t, q, actual, id = 'dev-' + q.id, activity = 'hk-' + q.id, quality = 'WEARABLE_FULL') => ({ eventId: id, athleteId: t.p.athleteId, sessionId: q.id, occurrenceDate: q.date, canonicalActivityId: activity, source: { provider: 'HEALTHKIT', activityId: activity, quality }, actual: { completed: true, minutes: q.prescription.durationMinutes, ...actual }, response: UNKNOWN });
export const strip = o => JSON.parse(JSON.stringify(o));
