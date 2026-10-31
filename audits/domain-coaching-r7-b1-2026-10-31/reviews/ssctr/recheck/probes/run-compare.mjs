// SSCTR R7-B.1 narrow recheck (R7B1-SSCTR-r2): run probes on R7B1-FREEZE-2 (this checkout) and on R7B1-FREEZE-1 (a git archive mirror of d41df8b
// outside the repository, its 112 bound files checked against RUNTIME_FREEZE_R7B1_1.json) and compare outputs byte for byte. Read-only on both trees.
// Probes: the R7-B SSCTR recheck probes (audits/domain-coaching-r7-b-2026-10-31/reviews/ssctr/recheck/probes, copied to ./inherited/ with only their
// import root rewritten), and this folder's s-probes, which read the tree root from SSCTR_ROOT. Outputs: ./out/<label>/<probe>.txt and
// ./out/compare.json (merged across runs).
// Usage: node run-compare.mjs <r7b1-freeze1-root> <probe ...>   (a probe is an R7-B recheck probe name, e.g. p40-dose-sweep, or a local s-probe file name)
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../../../../../..');
const SRC = path.join(REPO, 'audits/domain-coaching-r7-b-2026-10-31/reviews/ssctr/recheck/probes');
const F1 = process.argv[2];
if (!F1 || !fs.existsSync(path.join(F1, 'CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_1.json'))) throw new Error('give the R7B1-FREEZE-1 mirror root as argv[2]');
if (fs.existsSync(path.join(F1, 'CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_2.json'))) throw new Error('argv[2] is not a FREEZE-1 tree');
const which = process.argv.slice(3);
const sha = b => createHash('sha256').update(b).digest('hex');
const header = "import {pathToFileURL as __toUrl} from 'node:url';\nconst __ROOT = __toUrl((process.env.SSCTR_ROOT ?? '').replace(/[\\\\/]?$/, '/'));\n";
fs.mkdirSync(path.join(HERE, 'inherited'), {recursive: true});
const scriptOf = name => {
  const local = path.join(HERE, name + '.mjs');
  if (fs.existsSync(local)) return local;
  const src = fs.readFileSync(path.join(SRC, name + '.mjs'), 'utf8');
  const body = src.replace(/^import\s*\{([^}]*)\}\s*from\s*'(?:\.\.\/){6}(CoachingCore\/[^']+)';\s*$/gm, (_, names, rel) => `const {${names}} = await import(new URL('${rel}', __ROOT).href);`);
  if (/^import\s.*from\s*'\.\./m.test(body)) throw new Error(name + ': an import was not rewritten');
  const out = path.join(HERE, 'inherited', name + '.mjs');
  fs.writeFileSync(out, header + body);
  return out;
};
const run = (root, label) => {
  const out = {};
  fs.mkdirSync(path.join(HERE, 'out', label), {recursive: true});
  for (const name of which) {
    const t0 = Date.now(), r = spawnSync(process.execPath, [scriptOf(name), label], {env: {...process.env, SSCTR_ROOT: root}, encoding: 'utf8', maxBuffer: 1 << 28, timeout: 3600000});
    const text = (r.stdout ?? '') + (r.stderr ? '\n[stderr]\n' + r.stderr : '') + (r.status !== 0 ? `\n[exit ${r.status} ${r.signal ?? ''}]` : '');
    fs.writeFileSync(path.join(HERE, 'out', label, name + '.txt'), text);
    out[name] = {exit: r.status, sha256: sha(text.replace(/"label": ?"[^"]*"/g, '"label":""')), ms: Date.now() - t0};
    process.stderr.write(`${label} ${name} exit ${r.status} ${Date.now() - t0} ms\n`);
  }
  return out;
};
const f2 = run(REPO, 'R7B1-F2'), f1 = run(path.resolve(F1), 'R7B1-F1');
const file = path.join(HERE, 'out', 'compare.json'), prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {probes: {}};
const probes = {...prev.probes, ...Object.fromEntries(which.map(n => [n, {identical: f2[n].sha256 === f1[n].sha256, r7b1f2: f2[n], r7b1f1: f1[n]}]))};
fs.writeFileSync(file, JSON.stringify({probe: 'R7B1-SSCTR-RECHECK-COMPARE', ran: new Date().toISOString(), trees: {'R7B1-F2': REPO, 'R7B1-F1': path.resolve(F1)}, probes}, null, 1) + '\n');
console.log(JSON.stringify(Object.fromEntries(which.map(n => [n, probes[n].identical ? 'IDENTICAL' : 'DIFFERENT']))));
