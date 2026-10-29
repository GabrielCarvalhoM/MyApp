// QE reviewer-owned: re-runs, unchanged, the 35 earlier judge probes (EVIDENCE_RUNS_R7ASC.json, names qe-*) on the candidate, with their env and
// the repository root as cwd. Each output is compared with (a) the output recorded on STATE-MODEL-CONSUMER-FREEZE-1 and (b) the author's R7ADA
// re-run, byte for byte and with machine-path fields (root, runtime, ROOT) removed. Writes only into qe-r7ada-runs/earlier-judges/.
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
const here = import.meta.dirname, repo = path.resolve(here, '../../..'), outDir = path.join(here, 'qe-r7ada-runs/earlier-judges'); fs.mkdirSync(outDir, {recursive: true});
const prior = path.join(repo, 'audits/domain-coaching-r7a-state-consumer-2026-10-29/probes'), author = path.join(repo, 'audits/domain-coaching-r7a-decision-authority-2026-10-29/probes/judges');
const ev = JSON.parse(fs.readFileSync(path.join(prior, 'EVIDENCE_RUNS_R7ASC.json'), 'utf8')), sha = b => createHash('sha256').update(b).digest('hex');
const strip = b => { try { const o = JSON.parse(b.toString()); const f = x => { if (Array.isArray(x)) return x.map(f); if (x && typeof x === 'object') return Object.fromEntries(Object.entries(x).filter(([k]) => !['root', 'runtime', 'ROOT', 'rootUsed', 'tree'].includes(k)).map(([k, v]) => [k, f(v)])); return typeof x === 'string' ? x.replace(/C:\/Users\/[^"]*?MyApp\//g, '').replace(/\/home\/user\/MyApp\//g, '') : x; }; return JSON.stringify(f(o)); } catch { return null; } };
const jobs = ev.runs.filter(r => /^qe-/.test(r.name));
const run = r => new Promise(res => { const t0 = Date.now(), p = spawn(process.execPath, [path.join(repo, r.script)], {cwd: repo, env: {...process.env, ...(r.env ?? {})}}), o = [], e = []; p.stdout.on('data', d => o.push(d)); p.stderr.on('data', d => e.push(d));
  p.on('close', code => { const out = Buffer.concat(o); fs.writeFileSync(path.join(outDir, r.name + '.out.json'), out); if (e.length) fs.writeFileSync(path.join(outDir, r.name + '.err.txt'), Buffer.concat(e));
    const pb = fs.existsSync(path.join(prior, 'runs', r.name + '.out.json')) ? fs.readFileSync(path.join(prior, 'runs', r.name + '.out.json')) : null, ab = fs.existsSync(path.join(author, r.name + '.out.json')) ? fs.readFileSync(path.join(author, r.name + '.out.json')) : null;
    res({name: r.name, exit: code, seconds: Math.round((Date.now() - t0) / 1000), scriptUnchanged: sha(fs.readFileSync(path.join(repo, r.script))) === r.scriptSha256, identicalToPredecessorRun: pb ? sha(pb) === sha(out) : null, identicalToPredecessorExceptPath: pb ? strip(pb) === strip(out) : null, identicalToAuthorRerun: ab ? sha(ab) === sha(out) : null, identicalToAuthorExceptPath: ab ? strip(ab) === strip(out) : null}); }); });
const results = []; { const q = [...jobs]; await Promise.all(Array.from({length: 4}, async () => { while (q.length) results.push(await run(q.shift())); })); }
results.sort((a, b) => a.name.localeCompare(b.name));
const summary = {runs: results.length, failed: results.filter(r => r.exit !== 0).map(r => r.name), scriptsChanged: results.filter(r => !r.scriptUnchanged).map(r => r.name),
  vsPredecessor: {identical: results.filter(r => r.identicalToPredecessorRun).length, pathOnly: results.filter(r => !r.identicalToPredecessorRun && r.identicalToPredecessorExceptPath).length, different: results.filter(r => r.identicalToPredecessorExceptPath === false).map(r => r.name)},
  vsAuthorRerun: {identical: results.filter(r => r.identicalToAuthorRerun).length, pathOnly: results.filter(r => !r.identicalToAuthorRerun && r.identicalToAuthorExceptPath).length, different: results.filter(r => r.identicalToAuthorExceptPath === false).map(r => r.name)}};
fs.writeFileSync(path.join(outDir, 'RUNS.json'), JSON.stringify({node: process.version, ranAt: new Date().toISOString(), summary, results}, null, 1) + '\n');
console.log(JSON.stringify(summary, null, 1));
