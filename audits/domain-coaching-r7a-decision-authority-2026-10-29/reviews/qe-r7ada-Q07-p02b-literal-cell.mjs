// Q07 (QE reviewer-owned; class D): the one cell P02b's literal criterion flags on the candidate (EASY, k=1, NOLONG). Rebuilds P02b's U and R
// cells exactly (same intake, same review shapes) and compares the FULL run state of HistoricalState two weeks on (P02b's runOf omits easyExtra
// and devCount), the rows, and which cell prescribes more.
import * as L from './qe-r7ada-lib.mjs';
const k = 1, cells = {};
for (const cell of ['U', 'R']) {
  L.resetIds(); const g = L.R.generateProgram(L.intake({id: 'qe-p02b-EASY'}), L.opts), t = {p: g.program, ledger: []};
  for (let w = 0; w < k; w++) L.weekly(t, w);
  const keepK = s => !(s.sport === 'RUN' && s.role === 'LONG');
  if (cell === 'R') L.weekly(t, k, keepK); else for (const s of t.p.weeks[k].sessions.filter(s => L.live(s) && keepK(s))) L.step(t, L.at(t.p, k, s.day === 6 ? 5 : s.day, '21:30:00', {observations: [L.obs(t.p, s)]}));
  L.weekly(t, k + 1, () => false);
  const H = L.history(t, k + 2, 0).state.run, {planned, longByWeek, ...h} = H;
  cells[cell] = {facts: L.facts(t), history: h, rows: L.runRows(t, k + 2), minutes: t.p.weeks[k + 2].sessions.filter(s => L.live(s) && s.sport === 'RUN').reduce((a, s) => a + s.prescription.durationMinutes, 0)};
}
const diff = Object.keys(cells.U.history).filter(x => JSON.stringify(cells.U.history[x]) !== JSON.stringify(cells.R.history[x])).map(x => `${x}: U=${JSON.stringify(cells.U.history[x])} R=${JSON.stringify(cells.R.history[x])}`);
console.log(JSON.stringify({probe: 'qe-r7ada-Q07-p02b-literal-cell', tree: L.TREE, identicalFacts: cells.U.facts === cells.R.facts, fullHistoryDiff: diff, rows: {U: cells.U.rows, R: cells.R.rows}, weeklyRunMinutes: {U: cells.U.minutes, R: cells.R.minutes}, uPrescribesLess: cells.U.minutes < cells.R.minutes}, null, 1));
