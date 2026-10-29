// Q06c (QE reviewer-owned; class E, F4 structure outside the walk/jog steps). Approved rules: R6-NONCLINICAL-RETURN condition 7 ("SHORT: resume
// the last executed doses; the first quality slot runs easy; the next step waits for executed sessions") and the SSCTR's return base ("the last
// executed dose, never one not executed"). For a SHORT return (3, 6 or 10 days, from the Monday of week k, reported the day after it ends),
// compared per run dimension: the largest dose the athlete EVER executed before the pause (every row executed completely, no adverse response)
// against the first prescription of that dimension after the return (sessions dated on or after the report day, in the return week).
//   EASY runner: long-run minutes and easy-run minutes (the quality slot is checked by the SSCTR's short grid, D58, and is not counted here).
//   Walk/jog athlete whose last week was the ladder's last step (8: one 20-minute continuous jog), closed and graduated: continuous minutes.
import * as L from './qe-r7ada-lib.mjs';
const out = {probe: 'qe-r7ada-Q06c-return-base-run', tree: L.TREE, cases: []};
const live = (t, pred) => t.p.weeks.flatMap(w => w.sessions.filter(s => L.live(s) && s.sport === 'RUN' && pred(s)));
function shortReturn(t, k, days) {
  const start = t.p.weeks[k].startDate, end = L.addDays(start, days - 1), report = L.addDays(end, 1), W = t.p.weeks.findIndex(x => report >= x.startDate && report <= L.addDays(x.startDate, 6));
  const r = L.step(t, L.at(t.p, W, Math.round((Date.parse(report) - Date.parse(t.p.weeks[W].startDate)) / 864e5), '06:00:00', L.brk(start, end)), {allow: true});
  const d = t.p.decisions.at(-1), returnWeek = d.fromWeek;
  return {report, W, returnWeek, cls: d.interruption?.class, reason: d.reason ?? r.reason, entry: L.runOf(d.interruption?.entry?.run), rows: live(t, s => s.weekIndex === returnWeek && s.date >= report).map(s => ({date: s.date, role: s.role, minutes: s.prescription.durationMinutes, dim: s.progression?.dimension ?? null, value: s.progression?.value ?? null}))};
}
for (const days of [3, 6, 10]) for (const k of [2, 3, 5, 6, 8, 9]) {
  L.resetIds(); const t = L.gen({id: 'qe-q06c-easy'}); for (let w = 0; w < k; w++) L.weekly(t, w);
  const executed = live(t, s => s.weekIndex < k).filter(s => t.ledger.some(o => o.sessionId === s.id && !o.partial && !o.conflicted && o.actual?.completed));
  const maxLong = Math.max(...executed.filter(s => s.role === 'LONG').map(s => s.prescription.durationMinutes)), maxEasy = Math.max(...executed.filter(s => s.role === 'EASY').map(s => s.prescription.durationMinutes));
  const r = shortReturn(t, k, days), firstLong = r.rows.find(x => x.role === 'LONG')?.minutes ?? null, firstEasy = r.rows.filter(x => x.role === 'EASY' && x.dim === 'EASY_MINUTES').map(x => x.minutes);
  out.cases.push({shape: 'EASY_SHORT', days, k, cls: r.cls, maxExecuted: {long: maxLong, easy: maxEasy}, historyAtPause: {long: r.entry?.long, easy: r.entry?.easy}, firstAfterReturn: {long: firstLong, easy: firstEasy}, rows: r.rows,
    violation: (firstLong !== null && firstLong > maxLong) || firstEasy.some(m => m > maxEasy), reason: r.reason});
}
{
  L.resetIds(); const base = L.gen({id: 'qe-q06c-exit', ...L.WJ}); let w8 = -1;
  for (let w = 0; w < base.p.weeks.length - 3; w++) { if (base.p.weeks[w].sessions.some(s => L.live(s) && s.role === 'WALK_JOG' && s.progression?.value === 8)) { w8 = w; break; } L.weekly(base, w); }
  L.weekly(base, w8);
  const ladder = L.opts.authority.policy.operational.establishment.walkJogLadder, longestJogMinutes = Math.max(...ladder.map(s => s.jogSeconds / 60));
  for (const days of [3, 6, 10]) { const t = L.copy(base); const r = shortReturn(t, w8 + 1, days), cont = r.rows.filter(x => x.role === 'EASY').map(x => x.minutes);
    out.cases.push({shape: 'WALKJOG_EXIT_SHORT', days, cls: r.cls, lastExecuted: 'walk/jog step 8 (1 x 20 min continuous jog)', longestContinuousExecutedMinutes: longestJogMinutes, entry: r.entry && {mode: r.entry.mode, easy: r.entry.easy, walkStep: r.entry.walkStep, longestContinuous: r.entry.longestContinuous}, rows: r.rows, violation: cont.some(m => m > longestJogMinutes), reason: r.reason}); }
}
out.summary = {cases: out.cases.length, violations: out.cases.filter(c => c.violation).map(c => c.shape === 'EASY_SHORT' ? `EASY_SHORT k=${c.k} ${c.days}d: max executed long ${c.maxExecuted.long} easy ${c.maxExecuted.easy} -> first after return long ${c.firstAfterReturn.long} easy ${JSON.stringify(c.firstAfterReturn.easy)}` : `WALKJOG_EXIT_SHORT ${c.days}d: longest continuous executed ${c.longestContinuousExecutedMinutes} min -> ${JSON.stringify(c.rows.map(x => x.role + ':' + x.minutes))}`), clean: out.cases.filter(c => !c.violation).map(c => `${c.shape} k=${c.k ?? ''} ${c.days}d`)};
console.log(JSON.stringify(out, null, 1));
