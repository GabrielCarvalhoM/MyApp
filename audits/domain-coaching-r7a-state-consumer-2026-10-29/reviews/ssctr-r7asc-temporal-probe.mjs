// SSCTR R7ASC-SSCTR-r1 temporal evidence probe (own; prints only). Founder §12, T1-T5 and P5/P6 in sporting terms: a return reported on Thursday
// morning, the Friday strength session still planned. Friday's exposures may move history and the restoration only after they were executed.
// Athlete: STRENGTH goal, strength Mon/Wed/Fri, runs Tue/Thu and the Sunday long run; weeks 0-3 executed and reviewed; week 4 Monday and Tuesday
// executed (reported the same evening); a 15-day break (MODERATE) from Wednesday of week 4, reported Thursday 07:00 of week 6, so re-entry starts
// that week (Thursday's run, Friday's strength, Sunday's long run). Cells:
//  FRI_NOT_EXECUTED  Thursday and Sunday executed, Friday never;
//  FRI_EXECUTED      everything executed, each session reported that evening, week 6 reviewed on Sunday;
//  FRI_LATE_SYNC     Friday executed on Friday but its report arrives on Tuesday of week 7, after the Sunday review planned week 7;
//  FRI_DONE_SATURDAY Friday's session executed on Saturday (its report says so).
// For each cell: HistoricalState (historicalStateOf, the record as each cut saw it, and the final record read at the same cuts) at Thursday 20:00,
// Friday 23:00, Saturday 12:00, Sunday 22:00, Tuesday 22:00 of week 7 and Monday of week 8; the rows of weeks 6-10 (strength counts and kinds,
// run return steps); and the restoration check (a covered count more than one set above the largest executed since the break).
// Read-only runtime use; synthetic data; DEV_TEST_ONLY authority.
import * as L from './ssctr-r7asc-lib.mjs';

const known = [L.K('back-squat', 3, 5, 80), L.K('barbell-rdl', 3, 6, 90), L.K('db-bench-press', 3, 8, 18, 'PER_HAND')];
const schedule = {runDays: [1, 3, 6], strengthDays: [0, 2, 4], longRunDay: 6};
const FRI = s => s.sport === 'STRENGTH' && s.day === 4;
const base = L.gen({id: 'ssctr-r7asc-temporal', goal: 'STRENGTH', known, schedule});
for (let w = 0; w < 4; w++) L.weekly(base, w);
for (const s of base.p.weeks[4].sessions.filter(s => L.live(s) && s.day <= 1)) L.step(base, L.at(base.p, 4, s.day, '21:00:00', {observations: [L.obs(base.p, s)]}));
const breakStart = L.addDays(base.p.weeks[4].startDate, 2), breakEnd = L.addDays(base.p.weeks[6].startDate, 2);
const ret = L.step(base, L.at(base.p, 6, 3, '07:00:00', L.brk(breakStart, breakEnd)));
const out = {probe: 'R7ASC-SSCTR-r1-TEMPORAL', runtime: L.TREE, break: {start: breakStart, end: breakEnd, reportedAt: L.addDays(base.p.weeks[6].startDate, 3) + 'T07:00:00Z', result: `${ret.status}/${ret.action}`}, cells: {}};
const cutDefs = [['thu20', 6, 3, '20:00:00'], ['fri23', 6, 4, '23:00:00'], ['sat12', 6, 5, '12:00:00'], ['sun22', 6, 6, '22:00:00'], ['tue22w7', 7, 1, '22:00:00'], ['mon06w8', 8, 0, '06:00:00']];
const histAt = (t, w, d, h) => { const H = L.history(t, w, d, h); if (!H) return 'not exported'; return {strength: Object.fromEntries(Object.entries(H.strength.exercises).map(([id, x]) => [id, `rs=${x.returnStep ?? '-'} last=${x.lastPerformedAt ?? '-'} sets=${x.lastExecutedSets ?? '-'}`])), run: `${H.state.run.mode} rs=${H.state.run.returnStep ?? '-'}`}; };
const rowsSummary = (t, w) => ({strength: L.rowsOf(t, w).map(r => `d${(Date.parse(r.date) - Date.parse(t.p.weeks[w].startDate)) / 864e5} ${r.id} ${r.sets}${r.kind ? ' ' + r.kind : ''}`), run: L.runRows(t, w)});
const CELLS = {
  FRI_NOT_EXECUTED: {keep: s => !FRI(s)},
  FRI_EXECUTED: {keep: () => true},
  FRI_LATE_SYNC: {keep: s => !FRI(s), lateFriday: true},
  FRI_DONE_SATURDAY: {keep: () => true, fridayAt: s => `${L.addDays(s.date, 1)}T10:00:00Z`},
};
for (const [name, c] of Object.entries(CELLS)) {
  const t = L.copy(base), seen = {};
  const after = t.p.weeks[6].sessions.filter(s => L.live(s) && s.day >= 3);
  const cutBefore = {};
  for (const s of after.filter(s => s.day < 6 && c.keep(s))) {
    const observedAt = FRI(s) && c.fridayAt ? c.fridayAt(s) : null, day = observedAt ? 5 : s.day;
    L.step(t, L.at(t.p, 6, day, '21:00:00', {observations: [L.obs(t.p, s, {observedAt})]}));
  }
  // The record as each cut saw it, before the Sunday review: Thursday, Friday and Saturday decisions read only what had been reported by then.
  for (const [k, w, d, h] of cutDefs.slice(0, 3)) cutBefore[k] = histAt(t, w, d, h);
  L.weekly(t, 6, s => s.day === 6 && c.keep(s));
  seen.sun22 = histAt(t, 6, 6, '22:00:00');
  const week7AsPlannedSunday = rowsSummary(t, 7);
  if (c.lateFriday) { const fri = after.find(FRI); L.step(t, L.at(t.p, 7, 1, '21:00:00', {observations: [L.obs(t.p, fri)]})); }
  for (let w = 7; w < 10; w++) L.weekly(t, w);
  const finalRecord = Object.fromEntries(cutDefs.map(([k, w, d, h]) => [k, histAt(t, w, d, h)]));
  // Restoration: per covered exercise, the largest count executed since the break and the next row's count.
  const jumps = [], largest = {};
  for (let w = 6; w < 11; w++) for (const r of L.rowsOf(t, w)) {
    const prev = largest[r.id];
    if (prev !== undefined && r.sets > prev + 1) jumps.push(`w${w} ${r.id} ${r.sets} sets after at most ${prev}`);
    if (w < 10) largest[r.id] = Math.max(prev ?? 0, r.sets);
  }
  out.cells[name] = {log: t.log.slice(base.log.length), historyAsEachCutSawIt: {...cutBefore, ...seen}, historyFinalRecordAtCuts: finalRecord,
    week7AsPlannedSunday, rows: Object.fromEntries([6, 7, 8, 9, 10].map(w => [`w${w}`, rowsSummary(t, w)])), restorationJumps: jumps};
}
console.log(JSON.stringify(out, null, 1));
