// QE reviewer-owned (R7ARA engineering recheck, preservation §14, read-only): re-runs a bounded subset of the SSCTR kit (the jobs of the decision
// authority closure's kit-final, same scripts, env and working folder) on the candidate (live tree), and compares each output byte for byte with
// that closure's recorded output on the predecessor bytes (kit-final/<name>.out.json, R7A-DECISION-AUTHORITY-FREEZE-1). Each script's SHA-256 is
// checked against kit-final's record first. Outputs go to qe-r7ara-runs/kit/; nothing else is written (three jobs build scratch trees in the OS
// temporary folder, as they always did). Excluded: r12-instrument (writes a data file beside its script), the sharded grid/caps/first-week jobs.
// Usage: node qe-r7ara-kit.mjs [name ...]
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
const here = import.meta.dirname, repo = path.resolve(here, '../../..'), cc = path.join(repo, 'CoachingCore'), outDir = path.join(here, 'qe-r7ara-runs', 'kit');
const KF = 'audits/domain-coaching-r7a-decision-authority-2026-10-29/probes/kit-final/';
const sha = b => createHash('sha256').update(b).digest('hex');
function canonical(v) { if (v === null || typeof v !== 'object') return JSON.stringify(v); if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']'; return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}'; }
const digest = () => sha(canonical(Object.fromEntries(fs.readdirSync(path.join(cc, 'src')).filter(f => f.endsWith('.mjs')).sort().map(f => ['src/' + f, sha(fs.readFileSync(path.join(cc, 'src', f)))]))));
const DEFAULT = ['b-probe', 'changes', 'd58', 'f-probe', 'holdout-detail', 'probe', 'systemic', 'x-items', 'regression', 'reps', 'se-probe', 'tick', 'trace-b', 'trace-b2', 'trace-d47', 'trace-h25', 'x-rotation', 'x-sameday', 'x-trace-rot', 'x-trace-sd', 'x-ceiling', 'f-sameday'];
const kit = JSON.parse(fs.readFileSync(path.join(repo, KF, 'RUNS.json'), 'utf8')).runs, want = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT;
fs.mkdirSync(outDir, {recursive: true});
const run = r => new Promise(resolve => {
  const script = path.join(repo, r.script); if (sha(fs.readFileSync(script)) !== r.scriptSha256) return resolve({name: r.name, error: 'script changed since kit-final'});
  const start = digest(), t0 = Date.now(), o = [], e = [];
  const p = spawn(process.execPath, [script], {cwd: path.dirname(script), env: {...process.env, ...r.env}});
  p.stdout.on('data', d => o.push(d)); p.stderr.on('data', d => e.push(d));
  p.on('close', code => { const buf = Buffer.concat(o), end = digest(), pred = path.join(repo, KF, r.name + '.out.json'), predBuf = fs.existsSync(pred) ? fs.readFileSync(pred) : null;
    fs.writeFileSync(path.join(outDir, r.name + '.cand.out.json'), buf);
    resolve({name: r.name, script: r.script, scriptSha256: r.scriptSha256, env: r.env, exit: code, predecessorExit: r.exit, seconds: Math.round((Date.now() - t0) / 1000), sourceDigestStart: start, sourceDigestEnd: end, outSha256: sha(buf), predecessorOutSha256: predBuf ? sha(predBuf) : null, recordedPredecessorOutSha256: r.outSha256, identicalToPredecessor: !!predBuf && buf.equals(predBuf), stderrTail: Buffer.concat(e).toString().slice(-400)}); });
});
const jobs = kit.filter(r => want.includes(r.name)), done = [];
await Promise.all(Array.from({length: Number(process.env.CONC ?? 4)}, async () => { while (jobs.length) { const r = await run(jobs.shift()); done.push(r); process.stderr.write(`${r.name} exit ${r.exit} identical ${r.identicalToPredecessor}\n`); } }));
const rec = {revision: 'R7ARA-QE-KIT-1', node: process.version, at: new Date().toISOString(), runs: done.sort((a, b) => a.name < b.name ? -1 : 1)};
fs.writeFileSync(path.join(outDir, 'KIT_RUNS.json'), JSON.stringify(rec, null, 1) + '\n');
console.log(JSON.stringify({jobs: done.length, identical: done.filter(r => r.identicalToPredecessor).map(r => r.name), differ: done.filter(r => !r.identicalToPredecessor).map(r => r.name), failed: done.filter(r => r.exit !== 0).map(r => `${r.name}:${r.exit}/${r.predecessorExit}`)}));
