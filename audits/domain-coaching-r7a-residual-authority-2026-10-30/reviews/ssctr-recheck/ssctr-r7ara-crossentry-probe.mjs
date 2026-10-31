// SSCTR R7ARA-SSCTR-r1 cross-entry probe (own; prints only). One bounded question raised by my return probe (C1/HM/k7 and C7): after a SHORT
// return whose re-entry week is a CONSOLIDATION week, a second SHORT pause reads only the runs executed since the first return's report (E1.2).
// Pairs, identical except the response of the re-entry week's long run (COMPATIBLE or recovery ADVERSE): PERF k=7 and HM k=7 (first pause from
// Monday of week 7 for 6 days; the re-entry week, week 8, is CONSOLIDATION); then a second SHORT pause from Monday of week 9 for 6 days. Prints
// the long runs executed before each pause, HistoricalState's run at the second pause, the second return's entry and its re-entry rows, and the
// no-break control (the same record with no second pause: week 9's rows after week 8's review). SSCTR_CC selects the runtime (required).
import * as L from './ssctr-r7ada-lib.mjs';
if (!process.env.SSCTR_CC) throw Error('SSCTR_CC is required');
const {PROFILES} = await L.loadProfiles();
const ATHLETES = {PERF: () => L.intake({id: 'ssctr-r7ara-perf'}), HM: () => { const p = structuredClone(PROFILES.A_RUN_FIRST_HALF_MARATHON); p.athlete.id = 'ssctr-r7ara-hm'; return p; }};
const rowTxt = s => `${s.date.slice(5)} ${s.role}:${s.prescription.durationMinutes}${s.progression?.dimension ? ' ' + s.progression.dimension + '=' + s.progression.value : ''}`;
const sessAt = s => `${s.date}T${s.turn === 'PM' ? '19:00:00' : '08:00:00'}Z`;
const longs = t => t.p.weeks.flatMap(w => w.sessions.filter(s => L.isRun(s) && s.role === 'LONG' && L.reported(t, s.id)).map(s => `w${w.index} ${s.prescription.durationMinutes}`));
const pick = e => e && {mode: e.mode, easy: e.easy ?? null, long: e.long ?? null, returnStep: e.returnStep ?? null};
function pause(t, k, days) {
  const start = t.p.weeks[k].startDate, end = L.addDays(start, days - 1), report = L.addDays(end, 1), W = t.p.weeks.findIndex(x => report >= x.startDate && report <= L.addDays(x.startDate, 6));
  const before = t.p.decisions.length, r = L.step(t, L.at(t.p, W, Math.round((Date.parse(report) - Date.parse(t.p.weeks[W].startDate)) / 864e5), '06:00:00', L.brk(start, end)));
  const d = t.p.decisions.slice(before).filter(x => x.interruption).at(-1), reportAt = `${report}T06:00:00Z`, fromWeek = d?.fromWeek ?? W;
  const rows = (t.p.weeks[fromWeek]?.sessions ?? []).filter(s => L.isRun(s) && sessAt(s) > reportAt);
  return {status: `${r.status}/${r.action}`, cls: d?.interruption?.class ?? null, entry: pick(d?.interruption?.entry?.run), reentryWeek: rows.length ? fromWeek : fromWeek + 1, rows: (rows.length ? rows : (t.p.weeks[fromWeek + 1]?.sessions ?? []).filter(L.isRun)).map(rowTxt), report: reportAt};
}
const out = {probe: 'R7ARA-SSCTR-r1-CROSS-ENTRY', runtime: process.env.SSCTR_CC, cells: {}};
for (const name of Object.keys(ATHLETES)) for (const resp of ['COMPATIBLE', 'ADVERSE']) {
  const t = L.genFrom(ATHLETES[name]()); for (let w = 0; w < 7; w++) L.weekly(t, w);
  const first = pause(t, 7, 6), W = first.reentryWeek, phase = t.p.weeks[W].phase;
  L.weekly(t, W, s => sessAt(s) > first.report, s => s.role === 'LONG' && resp === 'ADVERSE' ? {extra: {response: {...L.OK, recovery: 'ADVERSE'}}} : {});
  const control = L.copy(t), H = L.historicalStateOf(t.p, {asOf: `${t.p.weeks[W + 1].startDate}T00:30:00Z`, actualLedger: t.ledger}, L.opts).state.run;
  const second = pause(t, W + 1, 6);
  out.cells[`${name}/${resp}`] = {first: {cls: first.cls, entry: first.entry, reentryWeek: W, reentryPhase: phase, rows: first.rows}, longRunsExecuted: longs(t),
    historyAtSecondPause: {mode: H.mode, easy: H.easy, long: H.long}, second: {cls: second.cls, entry: second.entry, rows: second.rows},
    noBreakControl: {week: W + 1, phase: control.p.weeks[W + 1].phase, rows: control.p.weeks[W + 1].sessions.filter(L.isRun).map(rowTxt)}};
}
console.log(JSON.stringify(out, null, 1));
