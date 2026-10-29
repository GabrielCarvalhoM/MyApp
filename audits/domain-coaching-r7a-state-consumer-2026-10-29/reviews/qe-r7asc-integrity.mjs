// Independent integrity check of STATE-MODEL-CONSUMER-FREEZE-1 (reviewer-owned, read-only).
// Re-implements the canonical hash rather than importing the runtime's, then cross-checks.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

const repo = 'C:/Users/carva/Desktop/myApp/MyApp';
const cc = path.join(repo, 'CoachingCore');
const freezePath = path.join(cc, 'r7/state-consumer/RUNTIME_FREEZE_STATE_MODEL_CONSUMER.json');
const fr = JSON.parse(fs.readFileSync(freezePath, 'utf8'));

function canonical(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
}
const myHash = v => createHash('sha256').update(canonical(v)).digest('hex');
const sha = p => createHash('sha256').update(fs.readFileSync(path.join(cc, p))).digest('hex');

const current = Object.fromEntries([
  ...fs.readdirSync(path.join(cc, 'src')).filter(f => f.endsWith('.mjs')).map(f => 'src/' + f),
  ...fs.readdirSync(path.join(cc, 'test')).filter(f => f.endsWith('.mjs')).map(f => 'test/' + f),
  'r6/PROGRAM_POLICY_R6.json', 'r6/fixtures/dev-authority.mjs', 'r6/fixtures/profiles.mjs', 'r6/fixtures/trajectories.mjs', 'package.json'
].sort().map(p => [p, sha(p)]));

const frozen = fr.files;
const mismatched = Object.keys(frozen).filter(p => current[p] !== frozen[p]);
const unfrozen = Object.keys(current).filter(p => !(p in frozen));
const missing = Object.keys(frozen).filter(p => !(p in current));

// Any other .mjs/.js/.json files anywhere under src/ or test/ (subdirectories, non-mjs) that could be loaded?
function walk(d, acc = []) {
  for (const e of fs.readdirSync(d, {withFileTypes: true})) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, acc); else acc.push(path.relative(cc, p).split(path.sep).join('/'));
  }
  return acc;
}
const allSrcTest = [...walk(path.join(cc, 'src')), ...walk(path.join(cc, 'test'))];
const strayFiles = allSrcTest.filter(p => !(p in frozen));

const srcMap = Object.fromEntries(Object.entries(current).filter(([p]) => p.startsWith('src/')));
const sourceDigest = myHash(srcMap);
const manifestDigest = myHash(current);

const policy = JSON.parse(fs.readFileSync(path.join(cc, 'r6/PROGRAM_POLICY_R6.json'), 'utf8').replace(/^\uFEFF/, ''));
const policyHash = myHash(policy);

const freezeFiles = fs.readdirSync(path.join(cc, 'r7/state-consumer')).filter(f => /^RUNTIME_FREEZE_/.test(f));

// cross-check with the runtime's own hash()
const rt = await import(pathToFileURL(path.join(cc, 'src/value.mjs')).href);
const rtSource = rt.hash(srcMap), rtManifest = rt.hash(current);

// predecessor delta
const pf = JSON.parse(fs.readFileSync(path.join(repo, 'audits/domain-coaching-r7a-state-consumer-2026-10-29/state-model-freeze-source/MANIFEST.json'), 'utf8'));
const prior = p => pf.files['CoachingCore/' + p];
const changed = Object.keys(current).filter(p => prior(p) !== undefined && prior(p) !== current[p]);
const added = Object.keys(current).filter(p => prior(p) === undefined);
const removed = Object.keys(pf.files).map(p => p.replace(/^CoachingCore\//, '')).filter(p => !current[p]);

// Predecessor copy integrity: do the byte-exact copies match their own MANIFEST?
const predDir = path.join(repo, 'audits/domain-coaching-r7a-state-consumer-2026-10-29/state-model-freeze-source');
const predMismatch = [];
for (const [p, h] of Object.entries(pf.files)) {
  const fp = path.join(predDir, p);
  if (!fs.existsSync(fp)) { predMismatch.push(p + ' (missing)'); continue; }
  const hh = createHash('sha256').update(fs.readFileSync(fp)).digest('hex');
  if (hh !== h) predMismatch.push(p);
}
const predSrc = Object.fromEntries(Object.entries(pf.files).filter(([p]) => p.startsWith('CoachingCore/src/')).map(([p, h]) => [p.replace(/^CoachingCore\//, ''), h]));

const out = {
  checkedAt: new Date().toISOString(), node: process.version,
  freezeRevision: fr.revision,
  recorded: {sourceDigest: fr.sourceDigest, manifestDigest: fr.manifestDigest, policyHash: fr.policyHash, files: Object.keys(frozen).length},
  recomputed: {sourceDigest, manifestDigest, policyHash, files: Object.keys(current).length, runtimeHashSource: rtSource, runtimeHashManifest: rtManifest},
  equal: {sourceDigest: sourceDigest === fr.sourceDigest, manifestDigest: manifestDigest === fr.manifestDigest, policyHash: policyHash === fr.policyHash, runtimeHashAgrees: rtSource === sourceDigest && rtManifest === manifestDigest},
  mismatched, unfrozen, missing, strayFiles,
  freezeFiles,
  deltaVsPredecessor: {changed, added, removed, recordedDelta: fr.deltaFromPredecessorFreeze},
  predecessor: {revision: pf.freeze?.revision, sourceDigestRecorded: pf.freeze?.sourceDigest, sourceDigestRecomputedFromManifest: myHash(predSrc), copyMismatches: predMismatch, files: Object.keys(pf.files).length},
  freezeRecordSha256: createHash('sha256').update(fs.readFileSync(freezePath)).digest('hex')
};
console.log(JSON.stringify(out, null, 2));
