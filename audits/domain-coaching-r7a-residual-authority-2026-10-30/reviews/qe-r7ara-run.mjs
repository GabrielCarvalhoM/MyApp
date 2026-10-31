// QE reviewer-owned runner (R7ARA engineering recheck). Runs one probe on one tree and binds its output to that tree's source digest, recomputed
// independently before and after the run, with the candidate's live digest too. Trees:
//   cand = the live CoachingCore (the frozen bytes under judgment);
//   pred = git archive of the predecessor freeze commit d4631cd (R7A-DECISION-AUTHORITY-FREEZE-1), built by the reviewer in $QE_TREES/pred;
//   sup  = git archive of b9fd42d, the superseded first evidence round (259ab3ef...), built by the reviewer in $QE_TREES/sup.
// Usage: node qe-r7ara-run.mjs <tree> <probe.mjs> [name]  -> writes qe-r7ara-runs/<name>.<tree>.out.json and appends qe-r7ara-runs/RUNS.json.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const here = import.meta.dirname, repo = path.resolve(here, '../../..'), runs = path.join(here, 'qe-r7ara-runs');
const TREES_DIR = process.env.QE_TREES ?? '/tmp/qe-r7ara/trees';
const TREES = {cand: path.join(repo, 'CoachingCore'), pred: path.join(TREES_DIR, 'pred/CoachingCore'), sup: path.join(TREES_DIR, 'sup/CoachingCore')};
const BUILT = {cand: 'live working tree (frozen bytes)', pred: 'git archive d4631cd03fb27bbc1857532500748476ab764987 CoachingCore', sup: 'git archive b9fd42d1fff90629650563a51f640d6f865943c0 CoachingCore'};
const EXPECT = {cand: 'e7172eb2e65bfb1da4c102a7efa2bae64bf1c70b06562fd3ce9896defd6dc17d', pred: '3a7166b25aaf550f7692cc058f0e582b42e9eb7f74b9e361f23733b5e74ab244', sup: '259ab3eff431d2381d50904be7594d9fa122c7d8d2fc369e20d67b5419f84cb6'};
const sha = b => createHash('sha256').update(b).digest('hex');
function canonical(v) { if (v === null || typeof v !== 'object') return JSON.stringify(v); if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']'; return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}'; }
const digest = root => sha(canonical(Object.fromEntries(fs.readdirSync(path.join(root, 'src')).filter(f => f.endsWith('.mjs')).sort().map(f => ['src/' + f, sha(fs.readFileSync(path.join(root, 'src', f)))]))));
const [tree, probe, name0] = process.argv.slice(2), root = TREES[tree];
if (!root) throw Error('tree must be one of ' + Object.keys(TREES));
const script = path.resolve(here, probe), name = name0 ?? path.basename(probe, '.mjs');
const start = digest(root), candStart = digest(TREES.cand);
if (start !== EXPECT[tree]) throw Error(`tree ${tree} digest ${start} != expected ${EXPECT[tree]}`);
const t0 = Date.now(), r = spawnSync(process.execPath, [script], {cwd: here, env: {...process.env, QE_ROOT: root, R7ADA_ROOT: root, SSCTR_CC: root}, encoding: 'buffer', maxBuffer: 1 << 30});
const end = digest(root), candEnd = digest(TREES.cand);
fs.mkdirSync(runs, {recursive: true});
const outRel = `${name}.${tree}.out.json`, outPath = path.join(runs, outRel);
fs.writeFileSync(outPath, r.stdout);
const rec = {name, tree, built: BUILT[tree], script: path.relative(here, script).split(path.sep).join('/'), scriptSha256: sha(fs.readFileSync(script)), node: process.version, exit: r.status, seconds: Math.round((Date.now() - t0) / 1000),
  treeDigestStart: start, treeDigestEnd: end, candidateDigestStart: candStart, candidateDigestEnd: candEnd, output: outRel, outSha256: sha(r.stdout), stderrTail: r.stderr.toString().slice(-800), at: new Date().toISOString()};
const recPath = path.join(runs, 'RUNS.json'), all = fs.existsSync(recPath) ? JSON.parse(fs.readFileSync(recPath, 'utf8')) : {revision: 'R7ARA-QE-RUNS-1', runs: []};
all.runs = [...all.runs.filter(x => !(x.name === name && x.tree === tree)), rec].sort((a, b) => (a.name + a.tree) < (b.name + b.tree) ? -1 : 1);
fs.writeFileSync(recPath, JSON.stringify(all, null, 1) + '\n');
console.log(JSON.stringify({name, tree, exit: r.status, seconds: rec.seconds, bound: start === end && candStart === candEnd && candStart === EXPECT.cand, out: outRel}));
process.exitCode = r.status === 0 && start === end ? 0 : 1;
