// SSCTR R7-B.1 review (R7B1-SSCTR-r1): re-run the R7-B SSCTR recheck probes (audits/domain-coaching-r7-b-2026-10-31/reviews/ssctr/recheck/probes,
// unchanged there) on two trees and compare their outputs byte for byte. Read-only on both trees.
// - R7B1: this checkout (R7B1-FREEZE-1 bytes, verified with scripts/verify-r7b1.mjs before and after).
// - FREEZE-2: a `git archive 10b26d6` extraction outside the repository (path in argv[2]); its 105 bound files were checked against
//   CoachingCore/r7/b/RUNTIME_FREEZE_R7B_2.json before use.
// Each probe is copied to ./inherited/ with its static imports of '../../../../../../CoachingCore/<rel>' rewritten to a dynamic import from the
// tree root given in SSCTR_ROOT; nothing else in the probe changes. Outputs go to ./out/<label>/<probe>.txt and ./out/inherited-comparison.json.
// Usage: node run-inherited.mjs <freeze2-root> [probe ...]
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../../../../..');
const SRC = path.join(REPO, 'audits/domain-coaching-r7-b-2026-10-31/reviews/ssctr/recheck/probes');
const FREEZE2 = process.argv[2];
if (!FREEZE2 || !fs.existsSync(path.join(FREEZE2, 'CoachingCore/src/r6-program.mjs'))) throw new Error('give the FREEZE-2 tree root as argv[2]');
const ALL = ['p10-graduation', 'p11-graduation-edges', 'p12-return-interplay', 'p13-familiar-bouts', 'p14-bouts-currency', 'p16-bouts-short-break-actual', 'p20-hybrid-content', 'p31-novice-density-event', 'p40-dose-sweep', 'p41-strides-optional', 'p42-calf-alternation', 'p43-claims-scan', 'r01-bouts-adverse-currency', 'r02-graduation-withdrawal', 'r03-density-practice', 'r04-density-after-review', 'r05-density-context-variants', 'r06-obs04-taper-substitution', 'r07-disclosures', 'r08-bouts-withdrawal-text'];
const which = process.argv.slice(3).length ? process.argv.slice(3) : ALL;
const sha = b => createHash('sha256').update(b).digest('hex');

fs.mkdirSync(path.join(HERE, 'inherited'), {recursive: true});
const header = "import {pathToFileURL as __toUrl} from 'node:url';\nconst __ROOT = __toUrl((process.env.SSCTR_ROOT ?? '').replace(/[\\\\/]?$/, '/'));\n";
const copies = {};
for (const name of which) {
  const src = fs.readFileSync(path.join(SRC, name + '.mjs'), 'utf8');
  let n = 0;
  const body = src.replace(/^import\s*\{([^}]*)\}\s*from\s*'(?:\.\.\/){6}(CoachingCore\/[^']+)';\s*$/gm, (_, names, rel) => { n++; return `const {${names}} = await import(new URL('${rel}', __ROOT).href);`; });
  if (/^import\s.*from\s*'\.\./m.test(body)) throw new Error(name + ': an import was not rewritten');
  fs.writeFileSync(path.join(HERE, 'inherited', name + '.mjs'), header + body);
  copies[name] = {sourceSha256: sha(src), importsRewritten: n};
}

const run = (root, label) => {
  const out = {};
  fs.mkdirSync(path.join(HERE, 'out', label), {recursive: true});
  for (const name of which) {
    const t0 = Date.now();
    const r = spawnSync(process.execPath, [path.join(HERE, 'inherited', name + '.mjs')], {env: {...process.env, SSCTR_ROOT: root}, encoding: 'utf8', maxBuffer: 1 << 28, timeout: 1800000});
    const text = (r.stdout ?? '') + (r.stderr ? '\n[stderr]\n' + r.stderr : '') + (r.status !== 0 ? `\n[exit ${r.status} ${r.signal ?? ''}]` : '');
    fs.writeFileSync(path.join(HERE, 'out', label, name + '.txt'), text);
    out[name] = {exit: r.status, sha256: sha(text), ms: Date.now() - t0};
    process.stderr.write(`${label} ${name} exit ${r.status} ${Date.now() - t0} ms\n`);
  }
  return out;
};
const r7b1 = run(REPO, 'R7B1'), f2 = run(path.resolve(FREEZE2), 'FREEZE-2');
const comparison = Object.fromEntries(which.map(n => [n, {identical: r7b1[n].sha256 === f2[n].sha256, r7b1: r7b1[n], freeze2: f2[n]}]));
const prev = fs.existsSync(path.join(HERE, 'out', 'inherited-comparison.json')) ? JSON.parse(fs.readFileSync(path.join(HERE, 'out', 'inherited-comparison.json'), 'utf8')) : {probes: {}};
const report = {probe: 'R7B1-SSCTR-INHERITED', ran: new Date().toISOString(), trees: {R7B1: REPO, 'FREEZE-2': path.resolve(FREEZE2)}, copies: {...(prev.copies ?? {}), ...copies}, probes: {...prev.probes, ...comparison}};
fs.writeFileSync(path.join(HERE, 'out', 'inherited-comparison.json'), JSON.stringify(report, null, 1) + '\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries(comparison).map(([k, v]) => [k, v.identical ? 'IDENTICAL' : 'DIFFERENT']))));
