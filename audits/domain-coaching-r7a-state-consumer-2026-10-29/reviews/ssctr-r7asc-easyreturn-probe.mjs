// SSCTR R7ASC-SSCTR-r1 easy-run return probe (own; prints only). The breadth check of my walk/jog finding: does an EASY-mode runner show the same
// pattern (history kept above the dose the plan held, then a later return resuming above the approved dose)? advanceRun in EASY mode continues
// "from what was prescribed" for every gate except in CONSOLIDATION weeks. Athlete: the default intermediate runner and STRENGTH lifter of my
// probes (runs Tue/Thu/Sun long; 16 weeks: CONSOLIDATION in weeks 3, 7, 11, 15). A first SHORT break from Monday of week W1, reported Thursday
// 07:00 of week W1+1 (the sessions from the report on executed, the week reviewed); the next week (HELD) executed ALL or with the easy runs
// missed (NO_EASY); then a second SHORT break (Tuesday to Saturday, reported Sunday 07:00) in the week after. Cells: W1 = 1 (HELD week 3,
// CONSOLIDATION) and W1 = 4 (HELD week 6, DEVELOPMENT). Prints the easy and long minutes the plan prescribes, HistoricalState's run, the runs
// executed, and flags a first week back whose easy or long run exceeds the longest of that kind executed before the second break.
// Read-only runtime use; synthetic data; DEV_TEST_ONLY authority.
import * as L from './ssctr-r7asc-lib.mjs';

const known = [L.K('back-squat', 3, 5, 80), L.K('db-bench-press', 3, 8, 18, 'PER_HAND')];
const runOf = (t, w) => (t.p.weeks[w]?.sessions ?? []).filter(s => L.live(s) && s.sport === 'RUN').map(s => ({role: s.role, min: s.prescription.durationMinutes, dim: s.progression?.dimension ?? null, val: s.progression?.value ?? null}));
const fmt = rs => rs.map(r => `${r.role}:${r.min}`).join(' ');
const histRun = (t, w) => { const H = L.history(t, w, 0, '00:30:00'); if (!H) return 'not exported'; const r = H.state.run; return `${r.mode} easy=${r.easy} long=${r.long}`; };
const out = {probe: 'R7ASC-SSCTR-r1-EASY-RETURN', runtime: L.TREE, cells: {}};
let above = 0;
for (const W1 of [1, 4]) for (const v of ['ALL', 'NO_EASY']) {
  const t = L.gen({id: `ssctr-r7asc-easy-${W1}-${v}`, goal: 'STRENGTH', known});
  for (let w = 0; w < W1; w++) L.weekly(t, w);
  const b1 = t.p.weeks[W1].startDate, rd = L.addDays(t.p.weeks[W1 + 1].startDate, 3);
  L.step(t, L.at(t.p, W1 + 1, 3, '07:00:00', L.brk(b1, L.addDays(rd, -1))));
  L.weekly(t, W1 + 1, s => s.date >= rd);
  const H = W1 + 2, cell = out.cells[`W1=${W1}/${v}`] = {heldWeek: H, heldPhase: t.p.weeks[H].phase, heldPrescribed: fmt(runOf(t, H))};
  L.weekly(t, H, v === 'ALL' ? () => true : s => !(s.sport === 'RUN' && s.role === 'EASY'));
  cell.gates = {EASY: L.gateOf(t.last, 'EASY'), LONG: L.gateOf(t.last, 'LONG')};
  cell.planAfterHeld = fmt(runOf(t, H + 1)); cell.historyAfterHeld = histRun(t, H + 1);
  const W = H + 1, b2 = L.addDays(t.p.weeks[W].startDate, 1);
  L.weekly(t, W, s => s.date < b2, {}, '06:30:00');
  const r = L.step(t, L.at(t.p, W, 6, '07:00:00', L.brk(b2, L.addDays(t.p.weeks[W].startDate, 5))));
  cell.secondReturn = `${r.status}/${r.action}`;
  const executed = t.p.weeks.slice(0, W + 1).flatMap(w => w.sessions.filter(s => L.live(s) && s.sport === 'RUN' && t.ledger.some(o => (o.sessionId ?? o.context?.sessionId) === s.id && !o.superseded)).map(s => ({role: s.role, min: s.prescription.durationMinutes, date: s.date})));
  const lastOf = role => executed.filter(x => x.role === role).sort((a, b) => a.date < b.date ? -1 : 1).at(-1)?.min ?? null;
  const maxOf = role => Math.max(0, ...executed.filter(x => x.role === role).map(x => x.min));
  cell.lastExecuted = {EASY: lastOf('EASY'), LONG: lastOf('LONG')}, cell.longestExecuted = {EASY: maxOf('EASY'), LONG: maxOf('LONG')};
  cell.firstWeekBack = fmt(runOf(t, W + 1));
  const back = runOf(t, W + 1);
  cell.aboveLongestExecuted = back.filter(x => ['EASY', 'LONG'].includes(x.role) && x.min > cell.longestExecuted[x.role]).map(x => `${x.role}:${x.min} > ${cell.longestExecuted[x.role]}`);
  cell.aboveLastExecuted = back.filter(x => ['EASY', 'LONG'].includes(x.role) && cell.lastExecuted[x.role] !== null && x.min > cell.lastExecuted[x.role]).map(x => `${x.role}:${x.min} > last ${cell.lastExecuted[x.role]}`);
  if (cell.aboveLongestExecuted.length) above++;
}
out.cellsAboveLongestExecuted = above;
console.log(JSON.stringify(out, null, 1));
