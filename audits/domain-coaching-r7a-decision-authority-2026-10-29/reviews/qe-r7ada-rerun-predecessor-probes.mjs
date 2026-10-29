// QE reviewer-owned (R7A-DECISION-AUTHORITY-FREEZE-1): re-runs the predecessor QE judge's probes UNMODIFIED, from their own folder, against
// the candidate (CoachingCore/) and the predecessor copy (state-consumer-freeze-source/CoachingCore). Writes only into qe-r7ada-runs/predecessor-probes/<tree>/.
// Binds each batch to the candidate source digest before and after (recomputed with an independent canonical hash).
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
const here = import.meta.dirname, repo = path.resolve(here, '../../..');
const REV = path.join(repo, 'audits/domain-coaching-r7a-state-consumer-2026-10-29/reviews');
const TREES = {candidate: path.join(repo, 'CoachingCore'), predecessor: path.join(repo, 'audits/domain-coaching-r7a-decision-authority-2026-10-29/state-consumer-freeze-source/CoachingCore')};
const sha = b => createHash('sha256').update(b).digest('hex');
function canonical(v) { if (v === null || typeof v !== 'object') return JSON.stringify(v); if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']'; return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}'; }
const srcDigest = root => sha(canonical(Object.fromEntries(fs.readdirSync(path.join(root, 'src')).filter(f => f.endsWith('.mjs')).sort().map(f => ['src/' + f, sha(fs.readFileSync(path.join(root, 'src', f)))]))));
const PROBES = [
  ['P01', 'qe-r7asc-P01-stale-known-row-adoption.mjs', {}], ['P01.w3kg24', 'qe-r7asc-P01-stale-known-row-adoption.mjs', {QE_W3KG: '24'}],
  ['P01b', 'qe-r7asc-P01b-stale-known-row-robustness.mjs', {}], ['P02', 'qe-r7asc-P02-run-view-e10.mjs', {}], ['P02b', 'qe-r7asc-P02b-run-view-sweep.mjs', {}],
  ['P03', 'qe-r7asc-P03-correction-boundary.mjs', {}], ['P03b', 'qe-r7asc-P03b-correction-plan-diff.mjs', {}], ['P04', 'qe-r7asc-P04-temporal.mjs', {}],
  ['P05', 'qe-r7asc-P05-reentry-run-gate.mjs', {}], ['P05b', 'qe-r7asc-P05b-reentry-basis.mjs', {}], ['P06', 'qe-r7asc-P06-strength-dose-sweep.mjs', {}],
  ['P07', 'qe-r7asc-P07-goal-change-two-readings.mjs', {}]];
const only = process.argv.slice(2);
const jobs = [];
for (const [tree, root] of Object.entries(TREES)) for (const [name, script, env] of PROBES) if (!only.length || only.includes(name)) jobs.push({tree, root, name, script, env});
const before = srcDigest(TREES.candidate), beforePred = srcDigest(TREES.predecessor);
const run = j => new Promise(res => { const t0 = Date.now(), p = spawn(process.execPath, [path.join(REV, j.script)], {cwd: REV, env: {...process.env, QE_ROOT: j.root, ...j.env}}), o = [], e = [];
  p.stdout.on('data', d => o.push(d)); p.stderr.on('data', d => e.push(d));
  p.on('close', code => { const dir = path.join(here, 'qe-r7ada-runs/predecessor-probes', j.tree); fs.mkdirSync(dir, {recursive: true}); const stdout = Buffer.concat(o);
    fs.writeFileSync(path.join(dir, j.name + '.out.json'), stdout); if (e.length) fs.writeFileSync(path.join(dir, j.name + '.err.txt'), Buffer.concat(e));
    res({tree: j.tree, name: j.name, exit: code, seconds: Math.round((Date.now() - t0) / 1000), outSha256: sha(stdout), scriptSha256: sha(fs.readFileSync(path.join(REV, j.script)))}); }); });
const results = []; { const q = [...jobs]; await Promise.all(Array.from({length: Number(process.env.CONC ?? 6)}, async () => { while (q.length) results.push(await run(q.shift())); })); }
const after = srcDigest(TREES.candidate), afterPred = srcDigest(TREES.predecessor);
const rec = {probe: 'qe-r7ada-rerun-predecessor-probes', node: process.version, ranAt: new Date().toISOString(), candidateSourceDigest: {before, after}, predecessorSourceDigest: {before: beforePred, after: afterPred}, results: results.sort((a, b) => (a.tree + a.name).localeCompare(b.tree + b.name))};
const dir = path.join(here, 'qe-r7ada-runs/predecessor-probes'); fs.mkdirSync(dir, {recursive: true});
fs.writeFileSync(path.join(dir, only.length ? `RUNS.${only.join('_')}.json` : 'RUNS.json'), JSON.stringify(rec, null, 1) + '\n');
console.log(JSON.stringify(rec, null, 1));
