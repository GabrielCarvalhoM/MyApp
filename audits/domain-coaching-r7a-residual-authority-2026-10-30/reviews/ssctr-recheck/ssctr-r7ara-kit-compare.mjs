// SSCTR R7ARA-SSCTR-r1 kit comparison (own; prints only). Compares my 43 kit outputs on R7A-RESIDUAL-AUTHORITY-FREEZE-1, wall clocks and
// labels aside, with (a) the author's run of the same jobs on the same bytes (probes/runs/kit/: does my independent run reproduce it?) and
// (b) the decision authority closure's kit-final on the predecessor bytes (R7A-DECISION-AUTHORITY-FREEZE-1, which my R7ADA review reproduced).
// Then it extracts the gate quantities, item by item, on both trees: D53 (restoration grid B, C), D56 (grid A, A2), D57 (caps B, covered jumps,
// unexplained; caps extension), D58 (short grid; d58 sections), D59 (first-week grids; same-day), F2 (repetition and tick probes), F3 (R6-H25
// trace) and the F1 traces. Usage: node ssctr-r7ara-kit-compare.mjs <mine> <author> <predecessor>
import fs from 'node:fs';
import path from 'node:path';
const [MINE, AUTH, PRED] = process.argv.slice(2);
const LABELS = ['at', 'runtime', 'root', 'generatedAt', 'tree', 'node'];
const strip = x => Array.isArray(x) ? x.map(strip) : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).filter(([k]) => !LABELS.includes(k)).map(([k, v]) => [k, strip(v)])) : x;
// Text outputs (a trace printed as lines) are compared with machine paths removed.
const read = p => { if (!fs.existsSync(p)) return undefined; const t = fs.readFileSync(p, 'utf8'); try { return {json: strip(JSON.parse(t))}; } catch { return {text: t.replace(/\/[^\s'"]*CoachingCore/g, '<CC>')}; } };
const same = (a, b) => a !== undefined && b !== undefined && JSON.stringify(a) === JSON.stringify(b);
const J = (dir, name) => JSON.parse(fs.readFileSync(path.join(dir, name + '.out.json'), 'utf8'));
const diffPaths = (a, b, p = '', out = []) => {
  if (out.length >= 10) return out;
  if (JSON.stringify(a) === JSON.stringify(b)) return out;
  if (a && b && typeof a === 'object' && typeof b === 'object' && Array.isArray(a) === Array.isArray(b)) { for (const k of [...new Set([...Object.keys(a), ...Object.keys(b)])]) diffPaths(a[k], b[k], `${p}/${k}`, out); return out; }
  out.push(`${p}: ${JSON.stringify(a)?.slice(0, 220)} | ${JSON.stringify(b)?.slice(0, 220)}`); return out;
};
const runs = JSON.parse(fs.readFileSync(path.join(MINE, 'RUNS.json'), 'utf8')).runs, names = runs.map(r => r.name);
const identity = Object.fromEntries(names.map(n => {
  const m = read(path.join(MINE, n + '.out.json')), a = read(path.join(AUTH, n + '.out.json')), p = read(path.join(PRED, n + '.out.json'));
  return [n, {exit: runs.find(r => r.name === n).exit, reproducesAuthor: same(m, a), identicalToPredecessor: same(m, p),
    ...(same(m, a) ? {} : {firstDiffsVsAuthor: diffPaths(m?.json ?? m?.text, a?.json ?? a?.text)}), ...(same(m, p) ? {} : {firstDiffsVsPredecessor: diffPaths(m?.json ?? m?.text, p?.json ?? p?.text)})}];
}));
const sum = (dir, prefix, n, f) => Array.from({length: n}, (_, i) => f(J(dir, `${prefix}.shard${i}`))).reduce((a, b) => a + b, 0);
const gridOf = dir => ({timelines: sum(dir, 'grid', 4, o => o.timelines), A_capWeeksLastNotWhole: sum(dir, 'grid', 4, o => o.A.capWeeksLastNotWhole), A_riseOrEnd: sum(dir, 'grid', 4, o => o.A.riseOrEnd),
  A2_capWeeksLastWhole: sum(dir, 'grid', 4, o => o.A2.capWeeksLastWhole), A2_held: sum(dir, 'grid', 4, o => o.A2.held), B: sum(dir, 'grid', 4, o => o.B.violations), C: sum(dir, 'grid', 4, o => o.C.violations), U_uncoveredR23: sum(dir, 'grid', 4, o => o.U.jumps)});
const capsOf = dir => ({B: sum(dir, 'caps', 4, o => o.B.violations), coveredJumps: sum(dir, 'caps', 4, o => o.J.covered), unexplained: sum(dir, 'caps', 4, o => o.unexplained.length),
  extB: sum(dir, 'caps-ext', 2, o => o.B.violations), extCovered: sum(dir, 'caps-ext', 2, o => o.J.covered), extUnexplained: sum(dir, 'caps-ext', 2, o => o.unexplained.length)});
const fwTally = dir => { const t = {}; let cases = 0; for (let i = 0; i < 8; i++) { const o = J(dir, 'x-firstweek.shard' + i); cases += o.cases; for (const c of Object.values(o.tally)) for (const v of Object.values(c)) for (const [k, n] of Object.entries(v)) t[k] = (t[k] ?? 0) + n; } return {cases, ...t}; };
const flatTally = o => { const t = {}; for (const c of Object.values(o.tally ?? {})) for (const v of Object.values(c)) for (const [k, n] of Object.entries(v)) if (typeof n === 'number') t[k] = (t[k] ?? 0) + n; return t; };
const repsOut = o => Object.fromEntries(Object.entries(o.goals).map(([g, v]) => { const rows = [], walk = x => { if (typeof x === 'string') { if (/\d+x\d+@/.test(x)) rows.push(x); return; } if (x && typeof x === 'object') for (const y of Object.values(x)) walk(y); }; walk(v);
  const [lo, hi] = v.repRange ?? [0, 99]; const bad = rows.filter(s => { const m = s.match(/ (\d+)x(\d+)@/); return m && (Number(m[2]) < lo || Number(m[2]) > hi); }); return [g, {rows: rows.length, outOfRange: bad.length}]; }));
const gates = dir => {
  const sh = J(dir, 'short'), fw = J(dir, 'firstweek');
  return {D53_D56_restorationGrid: gridOf(dir), D57_capsGrid: capsOf(dir),
    D58_shortGrid: {cases: sh.cases, notShort: sh.notShort, afterReturnDefects: sh.afterReturn?.defects, afterReviewDefects: sh.afterReview?.defects},
    D59_firstWeek: fw.byClass, D59_extendedFirstWeek: fwTally(dir), D59_sameDay: {fSameday: {cases: J(dir, 'f-sameday').cases, ...flatTally(J(dir, 'f-sameday'))}, xSameday: {cases: J(dir, 'x-sameday').cases, ...flatTally(J(dir, 'x-sameday'))}},
    F2_reps: repsOut(J(dir, 'reps'))};
};
const out = {compare: 'R7ARA-SSCTR-r1-KIT-COMPARE', identity,
  summary: {jobs: names.length, exitNonZero: names.filter(n => identity[n].exit !== 0), reproducesAuthor: names.filter(n => identity[n].reproducesAuthor).length,
    notReproducingAuthor: names.filter(n => !identity[n].reproducesAuthor), identicalToPredecessor: names.filter(n => identity[n].identicalToPredecessor).length,
    differentFromPredecessor: names.filter(n => !identity[n].identicalToPredecessor)},
  gates: {candidate: gates(MINE), predecessor: gates(PRED)}};
console.log(JSON.stringify(out, null, 1));
