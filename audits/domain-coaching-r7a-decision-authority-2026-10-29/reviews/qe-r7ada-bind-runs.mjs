// QE reviewer-owned: binds every output of this review (qe-r7ada-runs/) to the candidate source digest, recomputed independently at the moment
// of binding, with each output's SHA-256 and the SHA-256 of the probe script that produced it. Writes only qe-r7ada-runs/RUNS.json.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const here = import.meta.dirname, repo = path.resolve(here, '../../..'), runs = path.join(here, 'qe-r7ada-runs');
const sha = b => createHash('sha256').update(b).digest('hex');
function canonical(v) { if (v === null || typeof v !== 'object') return JSON.stringify(v); if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']'; return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}'; }
const digest = root => sha(canonical(Object.fromEntries(fs.readdirSync(path.join(root, 'src')).filter(f => f.endsWith('.mjs')).sort().map(f => ['src/' + f, sha(fs.readFileSync(path.join(root, 'src', f)))]))));
const walk = (d, acc = []) => { for (const e of fs.readdirSync(d, {withFileTypes: true})) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, acc); else acc.push(p); } return acc; };
const files = walk(runs).filter(p => !p.endsWith('RUNS.json')).sort().map(p => ({output: path.relative(here, p).split(path.sep).join('/'), sha256: sha(fs.readFileSync(p)), bytes: fs.statSync(p).size}));
const scripts = fs.readdirSync(here).filter(f => /^qe-r7ada-.*\.mjs$/.test(f)).sort().map(f => ({script: f, sha256: sha(fs.readFileSync(path.join(here, f)))}));
const rec = {revision: 'R7ADA-QE-RUNS-1', node: process.version, boundAt: new Date().toISOString(), candidateSourceDigest: digest(path.join(repo, 'CoachingCore')), predecessorSourceDigest: digest(path.join(repo, 'audits/domain-coaching-r7a-decision-authority-2026-10-29/state-consumer-freeze-source/CoachingCore')), scripts, outputs: files};
fs.writeFileSync(path.join(runs, 'RUNS.json'), JSON.stringify(rec, null, 1) + '\n');
console.log(JSON.stringify({candidateSourceDigest: rec.candidateSourceDigest, predecessorSourceDigest: rec.predecessorSourceDigest, scripts: scripts.length, outputs: files.length}));
