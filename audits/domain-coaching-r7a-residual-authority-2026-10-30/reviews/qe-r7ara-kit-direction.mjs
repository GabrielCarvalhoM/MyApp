// QE reviewer-owned (R7ARA engineering recheck, preservation §14): the reviewer's own direction check of the kit jobs whose candidate output
// differs from the predecessor's (qe-r7ara-runs/kit/<name>.cand.out.json against kit-final/<name>.out.json). Both JSON outputs are flattened to
// path -> leaf; at every path present in both, a numeric leaf whose key names a dose (minutes, duration, load/kg/value, sets, reps, long, easy,
// steps, restart, total) that is HIGHER on the candidate is a rise, listed with its path for reading; strings that differ are counted, and a
// difference only in clock-like fields (at, asOf, timestamps, seconds, paths, digests) is "clock only". Writes qe-r7ara-runs/kit/DIRECTION.json.
import fs from 'node:fs';
import path from 'node:path';
const here = import.meta.dirname, repo = path.resolve(here, '../../..'), kitDir = path.join(here, 'qe-r7ara-runs', 'kit'), KF = path.join(repo, 'audits/domain-coaching-r7a-decision-authority-2026-10-29/probes/kit-final');
const flat = (v, p = '', o = {}) => { if (v !== null && typeof v === 'object') { for (const [k, x] of Object.entries(v)) flat(x, p ? p + '.' + k : k, o); } else o[p] = v; return o; };
const DOSE = /(minutes|Minutes|duration|Duration|load|Load|kg|Kg|sets|Sets|reps|Reps|^long$|\.long$|easy$|Easy$|walkStep|restart|returnStep|qualityStep|total|Total|value)$/;
const CLOCK = /(^|\.)(at|asOf|generatedAt|ranAt|updatedAt|startedAt|time|timestamp|seconds|ms|elapsed|duration_ms|node|tree|runtime|root|path|file|digest|sha256|hash)$/i;
const parse = f => { const s = fs.readFileSync(f, 'utf8'); try { return JSON.parse(s); } catch { const i = s.indexOf('{'); return JSON.parse(s.slice(i)); } };
const names = JSON.parse(fs.readFileSync(path.join(kitDir, 'KIT_RUNS.json'), 'utf8')).runs.filter(r => !r.identicalToPredecessor).map(r => r.name);
const out = {revision: 'R7ARA-QE-KIT-DIRECTION-1', jobs: {}};
for (const n of names) {
  const C = flat(parse(path.join(kitDir, n + '.cand.out.json'))), P = flat(parse(path.join(KF, n + '.out.json')));
  const both = Object.keys(C).filter(k => k in P), onlyC = Object.keys(C).filter(k => !(k in P)), onlyP = Object.keys(P).filter(k => !(k in C));
  const changed = both.filter(k => C[k] !== P[k]), clockOnly = changed.every(k => CLOCK.test(k)) && !onlyC.some(k => !CLOCK.test(k)) && !onlyP.some(k => !CLOCK.test(k));
  const num = changed.filter(k => typeof C[k] === 'number' && typeof P[k] === 'number' && DOSE.test(k.split('.').pop()) && !CLOCK.test(k));
  const rises = num.filter(k => C[k] > P[k]).map(k => ({path: k, predecessor: P[k], candidate: C[k]})), falls = num.filter(k => C[k] < P[k]).length;
  // Rows the probes print as strings ("d6 LONG LONG:70", "2026-12-17 EASY EASY 45 +strides", "KNOWN22 2x5"): dates removed, the words compared,
  // the numbers compared in order. Same words: a dose comparison; other words: a change of kind, listed with both rows.
  const parts = s => { const t = String(s).replace(/\d{4}-\d{2}-\d{2}(T[\d:.]+Z)?/g, ' '); return {words: t.replace(/[\d.]+/g, '#').replace(/\s+/g, ' ').trim(), nums: (t.match(/\d+(\.\d+)?/g) ?? []).map(Number)}; };
  const strs = changed.filter(k => typeof C[k] === 'string' && typeof P[k] === 'string' && !CLOCK.test(k)), sRise = [], sFall = [], kinds = [], other = [];
  for (const k of strs) { const a = parts(P[k]), b = parts(C[k]);
    if (a.words === b.words && a.nums.length === b.nums.length && a.nums.length) { const up = b.nums.some((x, i) => x > a.nums[i]), down = b.nums.some((x, i) => x < a.nums[i]); (up ? sRise : down ? sFall : other).push({path: k, predecessor: P[k], candidate: C[k]}); }
    else if (a.nums.length || b.nums.length) kinds.push({path: k, predecessor: P[k], candidate: C[k]}); else other.push({path: k, predecessor: P[k], candidate: C[k]}); }
  out.jobs[n] = {pathsCompared: both.length, changed: changed.length, onlyCandidate: onlyC.length, onlyPredecessor: onlyP.length, clockOnly, doseReadingsChanged: num.length, fell: falls, rose: rises.length, rises,
    rowStrings: {changed: strs.length, fell: sFall.length, rose: sRise.length, kindChanged: kinds.length, other: other.length, rises: sRise, kindChanges: kinds, others: other.slice(0, 30)}};
}
out.summary = Object.fromEntries(Object.entries(out.jobs).map(([n, j]) => [n, `changed ${j.changed}, clockOnly ${j.clockOnly}, numeric doses: fell ${j.fell}, rose ${j.rose}; row strings ${j.rowStrings.changed}: fell ${j.rowStrings.fell}, rose ${j.rowStrings.rose}, kind changed ${j.rowStrings.kindChanged}, other ${j.rowStrings.other}`]));
fs.writeFileSync(path.join(kitDir, 'DIRECTION.json'), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify(out.summary, null, 1));
