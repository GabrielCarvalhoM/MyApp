// SSCTR R7ARA-SSCTR-r1 kit runner (own). Re-runs my 43-job kit (the job list of the decision authority closure's kit-final: same scripts, same
// environments) on the live tree, which must be R7A-RESIDUAL-AUTHORITY-FREEZE-1 (source digest recomputed before and after every job by my own
// canonical hash, not the runtime's). Outputs go to OUT (an absolute folder outside the repository); the round-12 instrument's data file is
// redirected there. Read-only for the repository. Usage: node ssctr-r7ara-kit-run.mjs <repoRoot> <outDir> [CONC]
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
const [repo, OUT, conc = '2'] = process.argv.slice(2);
const sha = p => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const canonical = v => v === null || typeof v !== 'object' ? JSON.stringify(v) : Array.isArray(v) ? '[' + v.map(canonical).join(',') + ']' : '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
const cc = path.join(repo, 'CoachingCore');
const digest = () => createHash('sha256').update(canonical(Object.fromEntries(fs.readdirSync(path.join(cc, 'src')).filter(f => f.endsWith('.mjs')).sort().map(f => ['src/' + f, sha(path.join(cc, 'src', f))])))).digest('hex');
const EXPECT = 'e7172eb2e65bfb1da4c102a7efa2bae64bf1c70b06562fd3ce9896defd6dc17d';
const kit = JSON.parse(fs.readFileSync(path.join(repo, 'audits/domain-coaching-r7a-decision-authority-2026-10-29/probes/kit-final/RUNS.json'), 'utf8')).runs;
fs.mkdirSync(OUT, {recursive: true});
const queue = [...kit].sort((a, b) => b.seconds - a.seconds), done = [];
const run = j => new Promise(resolve => {
  const env = {...j.env}, dir = path.dirname(path.join(repo, j.script));
  if ('R7A_PROBE_OUT' in env) env.R7A_PROBE_OUT = path.relative(dir, path.join(OUT, 'r12-instrument.data.json'));
  const start = digest(), t0 = Date.now(), o = [], e = [];
  const p = spawn(process.execPath, [path.join(repo, j.script)], {cwd: dir, env: {...process.env, ...env}});
  p.stdout.on('data', d => o.push(d)); p.stderr.on('data', d => e.push(d));
  p.on('close', code => { const out = path.join(OUT, j.name + '.out.json'); fs.writeFileSync(out, Buffer.concat(o)); fs.writeFileSync(path.join(OUT, j.name + '.err.txt'), Buffer.concat(e));
    resolve({name: j.name, script: j.script, scriptSha256: sha(path.join(repo, j.script)), env, exit: code, seconds: Math.round((Date.now() - t0) / 1000), sourceDigestStart: start, sourceDigestEnd: digest(), outSha256: sha(out), stderrBytes: Buffer.concat(e).length}); });
});
if (digest() !== EXPECT) throw Error('live tree is not the frozen candidate');
await Promise.all(Array.from({length: Number(conc)}, async () => { while (queue.length) { const j = queue.shift(), r = await run(j); done.push(r); process.stderr.write(`${r.name} exit ${r.exit} ${r.seconds}s\n`); } }));
done.sort((a, b) => a.name < b.name ? -1 : 1);
const rec = {revision: 'R7ARA-SSCTR-KIT-RUNS', node: process.version, tree: cc, expectedSourceDigest: EXPECT, finalSourceDigest: digest(), runs: done,
  unbound: done.filter(r => r.sourceDigestStart !== EXPECT || r.sourceDigestEnd !== EXPECT).map(r => r.name), failed: done.filter(r => r.exit !== 0).map(r => r.name)};
fs.writeFileSync(path.join(OUT, 'RUNS.json'), JSON.stringify(rec, null, 1) + '\n');
console.log(JSON.stringify({runs: done.length, failed: rec.failed, unbound: rec.unbound}));
