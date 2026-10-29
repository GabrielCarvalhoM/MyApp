// SSCTR R7ADA-SSCTR-r1 comparison (own; prints only). Reads my outputs in ssctr-r7ada-runs/ and compares each kit instrument, wall clocks and
// labels aside, with: the author's re-run of my kit on the same bytes (probes/kit-final/: does my independent run reproduce it?); my R7ASC run
// on STATE-MODEL-CONSUMER-FREEZE-1, the predecessor (../../domain-coaching-r7a-state-consumer-2026-10-29/reviews/ssctr-r7asc-runs/); and my
// accepted run on STATE-EVIDENCE-FREEZE-1 where it exists. My .pred controls are compared with that predecessor run (same bytes, same instrument:
// determinism). Then it extracts the gate quantities item by item: D53 (restoration grid B, C; round-12 instrument), D56 (grid A, A2; caps
// persistence), D57 (caps B, covered jumps, unexplained; caps extension), D58 (short grid; d58 instrument), D59 (first-week grids; same-day),
// F2 (repetition and tick probes), F3 (R6-H25 trace) and the F1 traces. Usage: node ssctr-r7ada-compare.mjs
import fs from 'node:fs';
import path from 'node:path';

const here = import.meta.dirname, root = path.resolve(here, '../../..');
const MINE = path.join(here, 'ssctr-r7ada-runs'), KIT = path.join(here, '../probes/kit-final');
const PRED = path.join(root, 'audits/domain-coaching-r7a-state-consumer-2026-10-29/reviews/ssctr-r7asc-runs');
const SE = path.join(root, 'audits/domain-coaching-r7a-state-evidence-2026-10-28/reviews/ssctr-r7ase-runs'), HP = path.join(root, 'audits/domain-coaching-r7a-state-model-2026-10-28/reviews/ssctr-r7asm-runs');
const LABELS = ['at', 'runtime', 'root', 'generatedAt', 'tree', 'node'];
const strip = x => Array.isArray(x) ? x.map(strip) : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).filter(([k]) => !LABELS.includes(k)).map(([k, v]) => [k, strip(v)])) : x;
const read = p => { if (!fs.existsSync(p)) return undefined; const t = fs.readFileSync(p, 'utf8'); try { return {json: strip(JSON.parse(t))}; } catch { return {text: t}; } };
const same = (a, b) => a !== undefined && b !== undefined && JSON.stringify(a) === JSON.stringify(b);
const J = (dir, name) => JSON.parse(fs.readFileSync(path.join(dir, name + '.out.json'), 'utf8'));
const has = (dir, name) => fs.existsSync(path.join(dir, name + '.out.json'));
const runs = JSON.parse(fs.readFileSync(path.join(MINE, 'RUNS.json'), 'utf8')).runs;
const kitNames = runs.filter(r => r.group === 'kit').map(r => r.name);
const seRef = name => fs.existsSync(path.join(SE, name + '.out.json')) ? path.join(SE, name + '.out.json') : path.join(HP, name + '.PRED.out.json');
/** The first differing paths of two JSON values (labels stripped). */
const diffPaths = (a, b, p = '', out = []) => {
  if (out.length >= 8) return out;
  if (JSON.stringify(a) === JSON.stringify(b)) return out;
  if (a && b && typeof a === 'object' && typeof b === 'object' && Array.isArray(a) === Array.isArray(b)) { for (const k of [...new Set([...Object.keys(a), ...Object.keys(b)])]) diffPaths(a[k], b[k], `${p}/${k}`, out); return out; }
  out.push(`${p}: ${JSON.stringify(a)?.slice(0, 140)} | ${JSON.stringify(b)?.slice(0, 140)}`); return out;
};
const identity = Object.fromEntries(kitNames.map(n => {
  const m = read(path.join(MINE, n + '.out.json')), k = read(path.join(KIT, n + '.out.json')), p = read(path.join(PRED, n + '.out.json'));
  return [n, {authorKitFinal: same(m, k), predecessorSC: p === undefined ? 'no reference' : same(m, p), acceptedSE: read(seRef(n)) === undefined ? 'no reference' : same(m, read(seRef(n))),
    ...(same(m, k) ? {} : {firstDiffsVsAuthor: diffPaths(m?.json, k?.json)}), ...(p === undefined || same(m, p) ? {} : {firstDiffsVsPredecessor: diffPaths(m?.json, p?.json)})}];
}));
const controls = Object.fromEntries(runs.filter(r => r.group === 'control').map(r => { const n = r.name.replace(/\.pred$/, ''); const m = read(path.join(MINE, r.name + '.out.json')), p = read(path.join(PRED, n + '.out.json'));
  return [r.name, {reproducesMyPredecessorRun: same(m, p), ...(same(m, p) ? {} : {firstDiffs: diffPaths(m?.json, p?.json)})}]; }));
const sum = (prefix, n, f, dir = MINE) => Array.from({length: n}, (_, i) => f(J(dir, `${prefix}.shard${i}`))).reduce((a, b) => a + b, 0);
const flat = (prefix, n, f, dir = MINE) => Array.from({length: n}, (_, i) => f(J(dir, `${prefix}.shard${i}`))).flat();
const gridOf = dir => ({timelines: sum('grid', 4, o => o.timelines, dir), capWeeksLastNotWhole: sum('grid', 4, o => o.A.capWeeksLastNotWhole, dir), A_riseOrEnd: sum('grid', 4, o => o.A.riseOrEnd, dir),
  A2_held: sum('grid', 4, o => o.A2.held, dir), B: sum('grid', 4, o => o.B.violations, dir), C: sum('grid', 4, o => o.C.violations, dir), U: sum('grid', 4, o => o.U.jumps, dir),
  Bexamples: flat('grid', 4, o => o.B.examples.map(x => `${x.timeline} w${x.week} ${x.id} ${x.sets} sets, largest since break ${x.largestExecutedSinceBreak}`), dir).slice(0, 6)});
const capsOf = dir => ({B: sum('caps', 4, o => o.B.violations, dir), coveredJumps: sum('caps', 4, o => o.J.covered, dir), unexplained: sum('caps', 4, o => o.unexplained.length, dir),
  extB: sum('caps-ext', 2, o => o.B.violations, dir), extCovered: sum('caps-ext', 2, o => o.J.covered, dir), extUnexplained: sum('caps-ext', 2, o => o.unexplained.length, dir)});
const fwTally = dir => { const t = {}; let cases = 0; for (let i = 0; i < 8; i++) { const o = J(dir, 'x-firstweek.shard' + i); cases += o.cases; for (const [, c] of Object.entries(o.tally)) for (const [, v] of Object.entries(c)) for (const [k, n] of Object.entries(v)) { t[k] = (t[k] ?? 0) + n; } } return {cases, ...t}; };
const repsOut = o => Object.fromEntries(Object.entries(o.goals).map(([g, v]) => { const rows = [], walk = x => { if (typeof x === 'string') { if (/\d+x\d+@/.test(x)) rows.push(x); return; } if (x && typeof x === 'object') for (const y of Object.values(x)) walk(y); }; walk(v); const [lo, hi] = v.repRange; const bad = rows.filter(s => { const m = s.match(/ (\d+)x(\d+)@/); return m && (Number(m[2]) < lo || Number(m[2]) > hi); }); return [g, {rows: rows.length, outOfRange: bad.length, examples: bad.slice(0, 4)}]; }));
const sh = J(MINE, 'short'), fw = J(MINE, 'firstweek');
const out = {
  compare: 'R7ADA-SSCTR-r1-COMPARE',
  identity, identitySummary: {
    kitJobs: kitNames.length,
    reproducesAuthorKitFinal: kitNames.filter(n => identity[n].authorKitFinal).length,
    notReproducingAuthorKitFinal: kitNames.filter(n => !identity[n].authorKitFinal),
    identicalToPredecessorSC: kitNames.filter(n => identity[n].predecessorSC === true),
    differentFromPredecessorSC: kitNames.filter(n => identity[n].predecessorSC === false),
    noPredecessorReference: kitNames.filter(n => identity[n].predecessorSC === 'no reference')},
  controls, controlsReproducingPredecessor: Object.values(controls).filter(x => x.reproducesMyPredecessorRun).length + '/' + Object.keys(controls).length,
  gates: {
    restorationGrid: {candidate: gridOf(MINE), predecessorSC: gridOf(PRED), acceptedSE: fs.existsSync(path.join(SE, 'grid.shard0.out.json')) ? gridOf(SE) : 'no reference'},
    capsGrid: {candidate: capsOf(MINE), predecessorSC: capsOf(PRED), acceptedSE: fs.existsSync(path.join(SE, 'caps.shard0.out.json')) ? capsOf(SE) : 'no reference'},
    D58_shortGrid: {cases: sh.cases, afterReturnDefects: sh.afterReturn?.defects, afterReviewDefects: sh.afterReview?.defects},
    D59_firstWeek: fw.byClass, D59_extendedFirstWeek: {candidate: fwTally(MINE), predecessorSC: fwTally(PRED)},
    F2_repsProbe: {candidate: repsOut(J(MINE, 'reps')), predecessorControl: repsOut(J(MINE, 'reps.pred'))},
  },
};
console.log(JSON.stringify(out, null, 1));
