// SSCTR R7ASC-SSCTR-r1 MAINTAIN probe (own; prints only). F3 and Founder §10 in a controlled, longitudinal form: the last factual execution of the
// back squat is 70 kg x 10 under HYPERTROPHY while the projection already holds 70 x 12; the strength goal then changes to MAINTAIN (8-8, two
// sets, RIR 3, mode HOLD) from the next week. Every later row of an exercise with a known dose must stay inside 8-8, at most two sets, at
// RIR >= 3, and never above the last executed load (MAINTAIN progresses nothing), for 9 weeks. Cells (the change decided on Sunday of week 1):
//  REVIEWED     weeks 0-1 executed and reviewed (history 70 x 10 with the next step earned);
//  UNREVIEWED   week 0 reviewed, week 1 reported day by day and never reviewed (history 70 x 10 facts only; the projection steps to 12);
//  MISSES       as REVIEWED, then every back squat after the change lifted 2 short of its target;
//  EXTRA        as REVIEWED, then every back squat after the change lifted 3 above its target with RIR+2 (an ADVANCE under a progressing goal);
//  RETURN       as REVIEWED, then a 13-day break from Monday of week 3, reported on Monday of week 5 (return rows under MAINTAIN).
// Sets are also checked against MAINTAIN's declared count (sets and maxSets 2), separately from the repetition contract F3 is about.
// Rows are split into known-dose rows (KNOWN, or a from-log/return/unlogged row of an exercise that has a load) and establishment rows (the
// declared exception: a first establishment or re-establishment keeps the goal's establishment target). Read-only; synthetic; DEV_TEST_ONLY.
import * as L from './ssctr-r7asc-lib.mjs';

const ID = 'back-squat', [lo, hi] = L.DOSES.MAINTAIN.repRange, maxSets = L.DOSES.MAINTAIN.maxSets, rirMin = L.DOSES.MAINTAIN.targetRir;
const known = [L.K(ID, 3, 8, 70), L.K('db-bench-press', 3, 8, 18, 'PER_HAND')];
const change = t => L.step(t, L.at(t.p, 1, 6, '22:00:00', {kind: 'GOAL_CHANGE', changes: {goals: {run: 'PERFORMANCE', strength: 'MAINTAIN'}, from: t.p.weeks[2].startDate}}));
const setsBy = f => s => s.sport === 'STRENGTH' ? {set: (id, x, e) => id === ID ? f(x, e) : x} : {};
const CELLS = {
  REVIEWED: t => { L.weekly(t, 0); L.weekly(t, 1); },
  UNREVIEWED: t => { L.weekly(t, 0); L.perDay(t, 1); },
  MISSES: t => { L.weekly(t, 0); L.weekly(t, 1); },
  EXTRA: t => { L.weekly(t, 0); L.weekly(t, 1); },
  RETURN: t => { L.weekly(t, 0); L.weekly(t, 1); },
};
const LATER = {
  MISSES: setsBy((x, e) => ({...x, reps: Math.max(1, e.reps - 2)})),
  EXTRA: setsBy((x, e) => ({...x, reps: e.reps + 3, rir: e.rir + 2})),
};
const out = {probe: 'R7ASC-SSCTR-r1-MAINTAIN', runtime: L.TREE, maintain: L.DOSES.MAINTAIN, cells: {}};
const totals = {cells: 0, knownRowsAfterChange: 0, knownAboveRange: 0, knownBelowRange: 0, setsAboveMax: 0, rirBelowTarget: 0, loadAboveLastExecuted: 0, establishmentRows: 0, establishmentAboveRange: 0};
for (const [name, setup] of Object.entries(CELLS)) {
  const t = L.gen({id: `ssctr-r7asc-maintain-${name}`, goal: 'HYPERTROPHY', known});
  setup(t);
  const before = {history: L.histEx(t, 2, ID), projection: L.projEx(t, 2, ID), storedWeek2: L.rowsOf(t, 2, [ID]).map(L.rowText)};
  const r = change(t), cell = out.cells[name] = {before, change: `${r.status}/${r.action}`, goalAfter: t.p.goal?.strength?.kind ?? null};
  if (name === 'RETURN') {
    L.weekly(t, 2);
    // A 13-day break (MODERATE) from Monday of week 3 to Sunday of week 4, reported on Monday of week 5.
    const s = L.addDays(t.p.weeks[3].startDate, 0), e = L.addDays(s, 13);
    const rr = L.step(t, L.at(t.p, 5, 0, '07:00:00', L.brk(s, e)));
    cell.return = `${rr.status}/${rr.action}`;
    for (let w = 5; w < 11; w++) L.weekly(t, w);
  } else for (let w = 2; w < 11; w++) L.weekly(t, w, () => true, LATER[name] ?? {});
  const lastLoad = (() => { const h = L.histEx(t, 2, ID); return typeof h === 'object' && h ? h.lastExecutedLoad : 70; })();
  const rows = []; for (let w = 2; w < 12; w++) rows.push(...L.rowsOf(t, w));
  const knownRow = r => r.mode === 'KNOWN' || ((r.mode === 'FROM_LOG' || r.kind === 'RETURN_ENTRY' || r.kind === 'RETURN_STEP' || r.kind === 'UNLOGGED') && (r.value !== null || r.ceiling !== null || ['RETURN_ENTRY', 'RETURN_STEP', 'UNLOGGED', 'FROM_LOG'].includes(r.kind) && r.id === ID));
  const establishment = r => !knownRow(r) && r.mode !== 'BODYWEIGHT';
  const kr = rows.filter(knownRow), er = rows.filter(establishment);
  cell.backSquatRows = rows.filter(r => r.id === ID).map(L.rowText);
  cell.otherKnownRows = kr.filter(r => r.id !== ID).slice(0, 12).map(L.rowText);
  cell.establishmentRows = er.slice(0, 12).map(L.rowText);
  const f = cell.flags = {
    knownAboveRange: kr.filter(r => r.reps > hi).map(L.rowText), knownBelowRange: kr.filter(r => r.reps < lo).map(L.rowText),
    setsAboveMax: rows.filter(r => r.sets > maxSets).map(L.rowText), rirBelowTarget: rows.filter(r => r.rir < rirMin).map(L.rowText),
    backSquatLoadAboveLastExecuted: rows.filter(r => r.id === ID && Number.isFinite(r.value) && r.value > lastLoad + 1e-9).map(L.rowText),
    establishmentAboveRange: er.filter(r => r.reps > hi).map(L.rowText)};
  totals.cells++; totals.knownRowsAfterChange += kr.length; totals.establishmentRows += er.length;
  totals.knownAboveRange += f.knownAboveRange.length; totals.knownBelowRange += f.knownBelowRange.length; totals.setsAboveMax += f.setsAboveMax.length;
  totals.rirBelowTarget += f.rirBelowTarget.length; totals.loadAboveLastExecuted += f.backSquatLoadAboveLastExecuted.length; totals.establishmentAboveRange += f.establishmentAboveRange.length;
  cell.log = t.log;
}
out.totals = totals;
console.log(JSON.stringify(out, null, 1));
