// SSCTR R7ADA-SSCTR-r1 integrity probe (own; prints only). Recomputes, with the canonical hash re-implemented (not imported from the frozen bytes),
// the source and manifest digests of R7A-DECISION-AUTHORITY-FREEZE-1 on the live tree, every bound file against the freeze record, unbound src/
// and test/ files, the freeze file and policy hashes, and the predecessor copy against its MANIFEST. With SSCTR_TREES=<label>=<tree>,... it also
// digests the scratch trees my instruments ran on. Read-only. Usage: node ssctr-r7ada-digest.mjs > out.json
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

const root = path.resolve(import.meta.dirname, '../../..'), cc = path.join(root, 'CoachingCore'), AUDIT = path.resolve(import.meta.dirname, '..');
const canonical = v => v === null || typeof v !== 'object' ? JSON.stringify(v) : Array.isArray(v) ? '[' + v.map(canonical).join(',') + ']' : '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
const hash = v => createHash('sha256').update(canonical(v)).digest('hex'), sha = p => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const freezeFile = path.join(cc, 'r7/decision-authority/RUNTIME_FREEZE_R7A_DECISION_AUTHORITY.json'), F = JSON.parse(fs.readFileSync(freezeFile, 'utf8'));
const live = Object.fromEntries(Object.keys(F.files).map(p => [p, fs.existsSync(path.join(cc, p)) ? sha(path.join(cc, p)) : null]));
const drift = Object.entries(F.files).filter(([p, h]) => live[p] !== h).map(([p]) => p);
const unbound = [...fs.readdirSync(path.join(cc, 'src')).filter(f => f.endsWith('.mjs')).map(f => 'src/' + f), ...fs.readdirSync(path.join(cc, 'test')).filter(f => f.endsWith('.mjs')).map(f => 'test/' + f)].filter(p => !F.files[p]);
const srcDigest = tree => hash(Object.fromEntries(fs.readdirSync(path.join(tree, 'src')).filter(f => f.endsWith('.mjs')).sort().map(f => ['src/' + f, sha(path.join(tree, 'src', f))])));
const pm = JSON.parse(fs.readFileSync(path.join(AUDIT, 'state-consumer-freeze-source/MANIFEST.json'), 'utf8'));
const predCopyDrift = Object.entries(pm.files).filter(([p, h]) => sha(path.join(AUDIT, 'state-consumer-freeze-source', p)) !== h).map(([p]) => p);
const out = {
  probe: 'R7ADA-SSCTR-r1-DIGEST', node: process.version,
  freeze: {revision: F.revision, file: path.relative(root, freezeFile), fileSha256: sha(freezeFile), boundFiles: Object.keys(F.files).length, drift, unbound,
    sourceDigestRecorded: F.sourceDigest, sourceDigestRecomputed: hash(Object.fromEntries(Object.entries(live).filter(([p]) => p.startsWith('src/')))),
    manifestDigestRecorded: F.manifestDigest, manifestDigestRecomputed: hash(live), liveSrcDigest: srcDigest(cc)},
  policy: {recorded: F.policyHash, fileSha256Recorded: F.policyFileSha256, fileSha256: sha(path.join(cc, 'r6/PROGRAM_POLICY_R6.json'))},
  predecessorCopy: {revision: pm.freeze.revision, files: Object.keys(pm.files).length, drift: predCopyDrift, freezeFileSha256: sha(path.join(root, pm.freeze.file)), recorded: pm.freeze.fileSha256},
  scratchTrees: Object.fromEntries((process.env.SSCTR_TREES ?? '').split(',').filter(Boolean).map(x => { const [label, tree] = x.split('='); return [label, {srcDigest: srcDigest(tree)}]; })),
};
out.ok = !drift.length && !unbound.length && out.freeze.sourceDigestRecomputed === F.sourceDigest && out.freeze.manifestDigestRecomputed === F.manifestDigest && out.freeze.liveSrcDigest === F.sourceDigest
  && F.sourceDigest === '3a7166b25aaf550f7692cc058f0e582b42e9eb7f74b9e361f23733b5e74ab244' && F.manifestDigest === 'a500cdd94b8a4994a718029d4ee6efdc703e4f54de59d0855b5598c0d1afb224'
  && out.policy.fileSha256 === F.policyFileSha256 && F.policyHash.startsWith('18ec48f3') && !predCopyDrift.length && out.predecessorCopy.freezeFileSha256 === pm.freeze.fileSha256;
console.log(JSON.stringify(out, null, 1));
