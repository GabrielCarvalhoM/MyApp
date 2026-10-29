// Reviewer-owned: re-run every earlier judge probe the author re-ran (EVIDENCE_RUNS_R7ASC.json, names qe-*), unchanged, on the live freeze,
// with the same env and cwd (repo root). Compares stdout SHA-256 with the author's outSha256, and records the script's own SHA-256 so a
// changed script is visible. Writes only into the output directory given as argv[2].
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const repo = 'C:/Users/carva/Desktop/myApp/MyApp';
const outDir = process.argv[2];
fs.mkdirSync(outDir, {recursive: true});
const sha = b => createHash('sha256').update(b).digest('hex');
const ev = JSON.parse(fs.readFileSync(path.join(repo, 'audits/domain-coaching-r7a-state-consumer-2026-10-29/probes/EVIDENCE_RUNS_R7ASC.json'), 'utf8'));
const only = process.argv[3] ? new RegExp(process.argv[3]) : null;
const results = [];
for (const r of ev.runs.filter(r => /^qe-/.test(r.name) && (!only || only.test(r.name)))) {
  const abs = path.join(repo, r.script);
  const scriptSha = sha(fs.readFileSync(abs));
  const t0 = Date.now();
  const p = spawnSync(process.execPath, [abs], {cwd: repo, env: {...process.env, ...(r.env ?? {})}, encoding: 'buffer', maxBuffer: 512 * 1024 * 1024});
  const out = p.stdout ?? Buffer.alloc(0), err = p.stderr ?? Buffer.alloc(0);
  fs.writeFileSync(path.join(outDir, r.name + '.out.json'), out);
  if (err.length) fs.writeFileSync(path.join(outDir, r.name + '.err.txt'), err);
  const authorOut = path.join(repo, 'audits/domain-coaching-r7a-state-consumer-2026-10-29/probes/runs', r.name + '.out.json');
  const authorBytes = fs.existsSync(authorOut) ? fs.readFileSync(authorOut) : null;
  results.push({name: r.name, script: r.script, env: r.env ?? {}, exit: p.status, seconds: Math.round((Date.now() - t0) / 1000),
    scriptSha256: scriptSha, scriptUnchangedSinceAuthorRun: scriptSha === r.scriptSha256,
    outSha256: sha(out), authorOutSha256: r.outSha256, identicalToAuthorRecord: sha(out) === r.outSha256,
    identicalToAuthorFile: authorBytes ? sha(authorBytes) === sha(out) : null, bytes: out.length, stderrBytes: err.length});
  console.error(r.name, p.status, sha(out) === r.outSha256 ? 'IDENTICAL' : 'DIFFERENT');
}
const summary = {runs: results.length, failed: results.filter(r => r.exit !== 0).map(r => r.name), different: results.filter(r => !r.identicalToAuthorRecord).map(r => r.name), scriptsChanged: results.filter(r => !r.scriptUnchangedSinceAuthorRun).map(r => r.name)};
fs.writeFileSync(path.join(outDir, 'SHA256_vs_author.json'), JSON.stringify({node: process.version, ranAt: new Date().toISOString(), summary, results}, null, 1) + '\n');
console.log(JSON.stringify(summary, null, 1));
