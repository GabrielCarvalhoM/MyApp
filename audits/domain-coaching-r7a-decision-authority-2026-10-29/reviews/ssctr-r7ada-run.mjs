// SSCTR R7ADA-SSCTR-r1 runner (own; regression review of R7A-DECISION-AUTHORITY-FREEZE-1). Runs, unchanged and from their own folders:
//  - kit: my earlier print-only instruments (R7-A.1/R7-A.2 grids, R7-A final, boundary, state-evidence, R7ASM probes, round-12 instrument), the
//    same 43 jobs as probes/kit-final, on the live CoachingCore tree (the candidate); the instruments that accept SSCTR_CC also on the
//    predecessor tree (".pred", STATE-MODEL-CONSUMER-FREEZE-1 rebuilt from r7/decision-authority-closure-base and checked against its manifest);
//  - asc: my R7ASC probes (hold, maintain, temporal, walkjog, walkjog-trace, easyreturn) on both trees (".cand", ".pred");
//  - mine: the new probes of this review (ssctr-r7ada-*-probe.mjs) on both trees, and with SSCTR_SE also on the accepted STATE-EVIDENCE-FREEZE-1
//    (".se": its byte-exact copy laid over the candidate tree, source digest checked) as an origin control.
// Each stdout goes to ssctr-r7ada-runs/<name>.out.json in THIS folder; the live source digest and the SSCTR_CC tree's digest are recorded before
// and after each job in ssctr-r7ada-runs/RUNS.json. Child processes get TEMP/TMP = SSCTR_TMP (session scratch), so temporary runtime copies never
// land in the repository. The round-12 instrument's data file is redirected here through a path relative to its folder. Nothing is written under
// CoachingCore/ or into another audit folder. Read-only runtime use; synthetic data; DEV_TEST_ONLY authority.
// Usage: SSCTR_TMP=<dir> SSCTR_CAND=<tree> SSCTR_PRED=<tree> [SSCTR_SE=<tree>] node ssctr-r7ada-run.mjs [kit|control|asc|mine|name-or-prefix ...]  (CONC, default 4)
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';

const here = import.meta.dirname, root = path.resolve(here, '../../..'), cc = path.join(root, 'CoachingCore'), runs = path.join(here, 'ssctr-r7ada-runs');
const CAND = process.env.SSCTR_CAND, PRED = process.env.SSCTR_PRED, SEF = process.env.SSCTR_SE ?? null;
if (!CAND || !PRED || !fs.existsSync(path.join(CAND, 'src')) || !fs.existsSync(path.join(PRED, 'src'))) throw Error('set SSCTR_CAND and SSCTR_PRED to CoachingCore trees');
const A1R = path.join(root, 'audits/domain-coaching-r7a1-2026-10-27/reviews'), A2R = path.join(root, 'audits/domain-coaching-r7a2-2026-10-28/reviews');
const AFR = path.join(root, 'audits/domain-coaching-r7a-final-2026-10-28/reviews'), ABR = path.join(root, 'audits/domain-coaching-r7a-boundary-2026-10-28/reviews');
const SER = path.join(root, 'audits/domain-coaching-r7a-state-evidence-2026-10-28/reviews'), SMR = path.join(root, 'audits/domain-coaching-r7a-state-model-2026-10-28/reviews');
const ASC = path.join(root, 'audits/domain-coaching-r7a-state-consumer-2026-10-29/reviews');
// The canonical hash, re-implemented (not imported from the frozen bytes).
const canonical = v => v === null || typeof v !== 'object' ? JSON.stringify(v) : Array.isArray(v) ? '[' + v.map(canonical).join(',') + ']' : '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
const hash = v => createHash('sha256').update(canonical(v)).digest('hex'), sha = p => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const digestOf = tree => hash(Object.fromEntries(fs.readdirSync(path.join(tree, 'src')).filter(f => f.endsWith('.mjs')).sort().map(f => ['src/' + f, sha(path.join(tree, 'src', f))])));
const J = (name, cwd, script, env = {}, group = 'kit') => ({name, cwd, script, env, group});
const withPred = (name, cwd, script, env = {}) => [J(name, cwd, script, env), J(name + '.pred', cwd, script, {...env, SSCTR_CC: PRED}, 'control')];
const both = (group, name, cwd, script) => [J(name + '.cand', cwd, script, {SSCTR_CC: CAND}, group), J(name + '.pred', cwd, script, {SSCTR_CC: PRED}, group), ...(group === 'mine' && SEF ? [J(name + '.se', cwd, script, {SSCTR_CC: SEF}, group)] : [])];
const JOBS = [
  J('firstweek', A1R, 'ssctr-r7a1-recheck-firstweek.mjs'),
  ...[0, 1, 2, 3].map(i => J('grid.shard' + i, A1R, 'ssctr-r7a1-grid.mjs', {SHARD: `${i}/4`})),
  ...[0, 1, 2, 3].map(i => J('caps.shard' + i, A1R, 'ssctr-r7a1-recheck-caps.mjs', {SHARD: `${i}/4`})),
  ...[0, 1].map(i => J('caps-ext.shard' + i, A1R, 'ssctr-r7a1-recheck-caps.mjs', {SHARD: `${i}/2`, EXT: '1'})),
  J('short', A1R, 'ssctr-r7a1-short.mjs'), J('d58', A1R, 'ssctr-r7a1-recheck-d58.mjs'), J('probe', A1R, 'ssctr-r7a1-probe.mjs'),
  ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => J('x-firstweek.shard' + i, A2R, 'ssctr-r7a2-firstweek-ext.mjs', {SHARD: `${i}/8`})),
  J('x-items', A2R, 'ssctr-r7a2-items.mjs'), J('x-sameday', A2R, 'ssctr-r7a2-sameday.mjs'), J('x-trace-sd', A2R, 'ssctr-r7a2-trace-sd.mjs'),
  J('x-rotation', A2R, 'ssctr-r7a2-rotation.mjs'), J('x-ceiling', A2R, 'ssctr-r7a2-ceiling.mjs'), J('x-trace-rot', A2R, 'ssctr-r7a2-trace-rot.mjs'),
  J('r12-instrument', SMR, 'ssctr-r7asm-r12-instrument.mjs', {R7A_PROBE_OUT: path.relative(SMR, path.join(runs, 'r12-instrument.data.json'))}),
  ...withPred('f-probe', AFR, 'ssctr-r7af-probe.mjs'), ...withPred('f-sameday', AFR, 'ssctr-r7af-sameday.mjs'),
  ...withPred('b-probe', ABR, 'ssctr-r7ab-probe.mjs'), ...withPred('se-probe', SER, 'ssctr-r7ase-probe.mjs'),
  ...withPred('systemic', SER, 'ssctr-r7ase-systemic-probe.mjs'), ...withPred('tick', SER, 'ssctr-r7ase-tick-probe.mjs'),
  J('regression', SMR, 'ssctr-r7asm-regression-probe.mjs'),
  ...withPred('changes', SMR, 'ssctr-r7asm-changes-probe.mjs'), ...withPred('reps', SMR, 'ssctr-r7asm-reps-probe.mjs'),
  ...withPred('trace-b', SMR, 'ssctr-r7asm-trace-b.mjs'), ...withPred('trace-b2', SMR, 'ssctr-r7asm-trace-b2.mjs'),
  J('holdout-detail', SMR, 'ssctr-r7asm-holdout-detail.mjs'),
  ...withPred('trace-d47', SMR, 'ssctr-r7asm-trace-d47.mjs'), J('trace-h25', SMR, 'ssctr-r7asm-trace-h25.mjs'),
  // My R7ASC probes, unchanged, on both trees.
  ...both('asc', 'asc-hold', ASC, 'ssctr-r7asc-hold-probe.mjs'), ...both('asc', 'asc-maintain', ASC, 'ssctr-r7asc-maintain-probe.mjs'),
  ...both('asc', 'asc-temporal', ASC, 'ssctr-r7asc-temporal-probe.mjs'), ...both('asc', 'asc-walkjog', ASC, 'ssctr-r7asc-walkjog-probe.mjs'),
  ...both('asc', 'asc-walkjog-trace', ASC, 'ssctr-r7asc-walkjog-trace.mjs'), ...both('asc', 'asc-easyreturn', ASC, 'ssctr-r7asc-easyreturn-probe.mjs'),
  // The new probes of this review.
  ...fs.readdirSync(here).filter(f => /^ssctr-r7ada-.*-probe\.mjs$/.test(f)).sort().flatMap(f => both('mine', f.replace(/^ssctr-r7ada-|-probe\.mjs$/g, ''), here, f)),
];
const wanted = process.argv.slice(2);
const jobs = !wanted.length ? JOBS : JOBS.filter(j => wanted.some(w => ['kit', 'control', 'asc', 'mine'].includes(w) ? j.group === w : j.name === w || j.name.startsWith(w + '.')));
fs.mkdirSync(runs, {recursive: true});
const tmpDir = process.env.SSCTR_TMP;
if (!tmpDir || !fs.existsSync(tmpDir)) throw Error('set SSCTR_TMP to an existing scratch directory');
const file = path.join(runs, 'RUNS.json'), records = [];
const rel = p => path.relative(root, p).replace(/\\/g, '/');
const treeLabel = p => p === CAND ? 'candidate (scratch rebuild of d4631cd, digest-checked)' : p === PRED ? 'predecessor (scratch rebuild of ffc1136, manifest-checked)' : p === SEF ? 'accepted STATE-EVIDENCE-FREEZE-1 (scratch: its byte-exact copy over the candidate tree, digest-checked)' : rel(p);
const runOne = j => new Promise(res => {
  const t0 = Date.now(), d0 = digestOf(cc), c0 = j.env.SSCTR_CC ? digestOf(j.env.SSCTR_CC) : null, o = path.join(runs, j.name + '.out.json'), out = fs.createWriteStream(o), err = [];
  const p = spawn(process.execPath, [path.join(j.cwd, j.script)], {cwd: j.cwd, env: {...process.env, TEMP: tmpDir, TMP: tmpDir, TMPDIR: tmpDir, ...j.env}});
  p.stdout.pipe(out);
  p.stderr.on('data', d => err.push(d));
  p.on('close', code => {
    out.end(() => {
      const e = Buffer.concat(err);
      if (e.length) fs.writeFileSync(path.join(runs, j.name + '.err.txt'), e);
      records.push({name: j.name, group: j.group, script: rel(path.join(j.cwd, j.script)), scriptSha256: sha(path.join(j.cwd, j.script)),
        env: Object.fromEntries(Object.entries(j.env).map(([k, v]) => [k, k === 'SSCTR_CC' ? treeLabel(v) : v])), exit: code, seconds: Math.round((Date.now() - t0) / 1000),
        sourceDigestStart: d0, sourceDigestEnd: digestOf(cc), ...(c0 ? {ssctrCcDigestStart: c0, ssctrCcDigestEnd: digestOf(j.env.SSCTR_CC)} : {}),
        outSha256: sha(o), stderrBytes: e.length});
      res();
    });
  });
});
// Longest jobs first, so the wall clock is bounded by the round-12 instrument.
const ORDER = ['r12-instrument', 'grid', 'caps', 'firstweek', 'caps-ext', 'short', 'x-firstweek'];
const rank = j => { const i = ORDER.findIndex(o => j.name === o || j.name.startsWith(o + '.')); return i < 0 ? ORDER.length : i; };
const queue = [...jobs].sort((a, b) => rank(a) - rank(b)), conc = Number(process.env.CONC ?? 4);
await Promise.all(Array.from({length: conc}, async () => { while (queue.length) await runOne(queue.shift()); }));
const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {runs: []};
const merged = [...prev.runs.filter(r => !records.some(x => x.name === r.name)), ...records].sort((a, b) => a.name < b.name ? -1 : 1);
fs.writeFileSync(file, JSON.stringify({revision: 'R7ADA-SSCTR-RUNS', updatedAt: new Date().toISOString(), node: process.version, runs: merged}, null, 1) + '\n');
console.log(JSON.stringify({ran: records.length, failed: records.filter(r => r.exit !== 0).map(r => r.name), digests: [...new Set(records.flatMap(r => [r.sourceDigestStart, r.sourceDigestEnd]))], ccDigests: [...new Set(records.flatMap(r => r.ssctrCcDigestStart ? [r.ssctrCcDigestStart, r.ssctrCcDigestEnd] : []))]}));
