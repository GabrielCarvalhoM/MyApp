// SSCTR R7ASC-SSCTR-r1 comparison (own; prints only). Reads my outputs in ssctr-r7asc-runs/ and compares each kit instrument, wall clocks and
// labels aside, with: the author's re-run of my kit on the same bytes (probes/kit-final/: does my independent run reproduce it?); my accepted run
// on STATE-EVIDENCE-FREEZE-1 (ssctr-r7ase-runs/, or the .PRED outputs of ssctr-r7asm-runs/ for the probes written in R7ASM); and my run on
// HISTORICAL-PROJECTION-FREEZE-1 (ssctr-r7asm-runs/). My .HP controls are compared with that HP run (same bytes, same instrument: determinism).
// Then it extracts the gate quantities: D56 (grid A, A2), D57/D53 (grid B, C; caps B, J, unexplained; caps extension), D58 (short grid), D59
// (first-week grids), F2 (repetition probe), F3 (R6-H25 trace) and the F1 traces. Usage: node ssctr-r7asc-compare.mjs
import fs from 'node:fs';
import path from 'node:path';

const here = import.meta.dirname, root = path.resolve(here, '../../..');
const MINE = path.join(here, 'ssctr-r7asc-runs'), KIT = path.join(root, 'audits/domain-coaching-r7a-state-consumer-2026-10-29/probes/kit-final');
const SE = path.join(root, 'audits/domain-coaching-r7a-state-evidence-2026-10-28/reviews/ssctr-r7ase-runs'), HP = path.join(root, 'audits/domain-coaching-r7a-state-model-2026-10-28/reviews/ssctr-r7asm-runs');
const LABELS = ['at', 'runtime', 'root', 'generatedAt', 'tree', 'node'];
const strip = x => Array.isArray(x) ? x.map(strip) : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).filter(([k]) => !LABELS.includes(k)).map(([k, v]) => [k, strip(v)])) : x;
const read = p => { if (!fs.existsSync(p)) return undefined; const t = fs.readFileSync(p, 'utf8'); try { return {json: strip(JSON.parse(t))}; } catch { return {text: t}; } };
const same = (a, b) => a !== undefined && b !== undefined && JSON.stringify(a) === JSON.stringify(b);
const J = (dir, name) => JSON.parse(fs.readFileSync(path.join(dir, name + '.out.json'), 'utf8'));
const runs = JSON.parse(fs.readFileSync(path.join(MINE, 'RUNS.json'), 'utf8')).runs;
const kitNames = runs.filter(r => r.group === 'kit').map(r => r.name);
const seRef = name => fs.existsSync(path.join(SE, name + '.out.json')) ? path.join(SE, name + '.out.json') : path.join(HP, name + '.PRED.out.json');
const identity = Object.fromEntries(kitNames.map(n => {
  const m = read(path.join(MINE, n + '.out.json'));
  return [n, {authorKitFinal: same(m, read(path.join(KIT, n + '.out.json'))), acceptedSE: read(seRef(n)) === undefined ? 'no reference' : same(m, read(seRef(n))), predecessorHP: read(path.join(HP, n + '.out.json')) === undefined ? 'no reference' : same(m, read(path.join(HP, n + '.out.json')))}];
}));
const controls = Object.fromEntries(runs.filter(r => r.group === 'control').map(r => { const n = r.name.replace(/\.HP$/, ''); return [r.name, {reproducesMyHPRun: same(read(path.join(MINE, r.name + '.out.json')), read(path.join(HP, n + '.out.json')))}]; }));
const sum = (prefix, n, f, dir = MINE) => Array.from({length: n}, (_, i) => f(J(dir, `${prefix}.shard${i}`))).reduce((a, b) => a + b, 0);
const flat = (prefix, n, f, dir = MINE) => Array.from({length: n}, (_, i) => f(J(dir, `${prefix}.shard${i}`))).flat();
const gridOf = dir => ({timelines: sum('grid', 4, o => o.timelines, dir), capWeeksLastNotWhole: sum('grid', 4, o => o.A.capWeeksLastNotWhole, dir), A_riseOrEnd: sum('grid', 4, o => o.A.riseOrEnd, dir),
  A2_held: sum('grid', 4, o => o.A2.held, dir), B: sum('grid', 4, o => o.B.violations, dir), C: sum('grid', 4, o => o.C.violations, dir), U: sum('grid', 4, o => o.U.jumps, dir),
  Bexamples: flat('grid', 4, o => o.B.examples.map(x => `${x.timeline} w${x.week} ${x.id} ${x.sets} sets, largest since break ${x.largestExecutedSinceBreak}`), dir)});
const capsOf = dir => ({B: sum('caps', 4, o => o.B.violations, dir), coveredJumps: sum('caps', 4, o => o.J.covered, dir), unexplained: sum('caps', 4, o => o.unexplained.length, dir),
  extB: sum('caps-ext', 2, o => o.B.violations, dir), extCovered: sum('caps-ext', 2, o => o.J.covered, dir), extUnexplained: sum('caps-ext', 2, o => o.unexplained.length, dir)});
const fwTally = dir => { const t = {}; let cases = 0; for (let i = 0; i < 8; i++) { const o = J(dir, 'x-firstweek.shard' + i); cases += o.cases; for (const [fam, c] of Object.entries(o.tally)) for (const [cls, v] of Object.entries(c)) for (const [k, n] of Object.entries(v)) { t[k] = (t[k] ?? 0) + n; } } return {cases, ...t}; };
const fw = J(MINE, 'firstweek'), sh = J(MINE, 'short');
const repsOut = o => Object.fromEntries(Object.entries(o.goals).map(([g, v]) => { const rows = [], walk = x => { if (typeof x === 'string') { if (/\d+x\d+@/.test(x)) rows.push(x); return; } if (x && typeof x === 'object') for (const y of Object.values(x)) walk(y); }; walk(v); const [lo, hi] = v.repRange; const bad = rows.filter(s => { const m = s.match(/ (\d+)x(\d+)@/); return m && (Number(m[2]) < lo || Number(m[2]) > hi); }); return [g, {rows: rows.length, outOfRange: bad.length, examples: bad.slice(0, 4)}]; }));
const h25 = J(MINE, 'trace-h25'), h25Rows = (o, k) => o[k].flatMap(st => (st.rows ?? []).filter(r => { const m = r.match(/^w\d+ (\d{4}-\d{2}-\d{2}) /); return m && m[1] >= '2027-01-25'; }));
const above8 = rows => rows.filter(r => { const m = r.match(/ \d+x(\d+)@/); return m && Number(m[1]) > 8; });
const out = {
  compare: 'R7ASC-SSCTR-r1-COMPARE',
  identity, identitySummary: {
    kitJobs: kitNames.length,
    reproducesAuthorKitFinal: kitNames.filter(n => identity[n].authorKitFinal).length,
    notReproducingAuthorKitFinal: kitNames.filter(n => !identity[n].authorKitFinal),
    identicalToAcceptedSE: kitNames.filter(n => identity[n].acceptedSE === true),
    differentFromAcceptedSE: kitNames.filter(n => identity[n].acceptedSE === false),
    identicalToPredecessorHP: kitNames.filter(n => identity[n].predecessorHP === true),
    differentFromPredecessorHP: kitNames.filter(n => identity[n].predecessorHP === false)},
  controls, controlsReproducingHP: Object.values(controls).filter(x => x.reproducesMyHPRun).length + '/' + Object.keys(controls).length,
  gates: {
    restorationGrid: {current: gridOf(MINE), acceptedSE: gridOf(SE), predecessorHP: gridOf(HP)},
    capsGrid: {current: capsOf(MINE), acceptedSE: capsOf(SE), predecessorHP: capsOf(HP)},
    D58_shortGrid: {cases: sh.cases, afterReturnDefects: sh.afterReturn.defects, afterReviewDefects: sh.afterReview.defects},
    D59_firstWeek: fw.byClass, D59_extendedFirstWeek: {current: fwTally(MINE), acceptedSE: fwTally(SE), predecessorHP: fwTally(HP)},
    F2_repsProbe: {current: repsOut(J(MINE, 'reps')), predecessorHP_control: repsOut(J(MINE, 'reps.HP'))},
    F3_traceH25: {rowsAfterChange: {holdout: h25Rows(h25, 'stateModel.holdout').length, fullRecord: h25Rows(h25, 'stateModel.fullRecord').length},
      above8: {holdout: above8(h25Rows(h25, 'stateModel.holdout')), fullRecord: above8(h25Rows(h25, 'stateModel.fullRecord'))},
      acceptedSE_above8: {holdout: above8(h25Rows(h25, 'predecessor.holdout')).length, fullRecord: above8(h25Rows(h25, 'predecessor.fullRecord')).length}},
  },
};
console.log(JSON.stringify(out, null, 1));
