// SSCTR R7ASC-SSCTR-r1 digest probe (own; read-only; prints only).
// Independent re-computation of STATE-MODEL-CONSUMER-FREEZE-1: every bound file, unfrozen/missing files, the single freeze file,
// the source and manifest digests, the policy hash, the evidence bindings, and the integrity of both byte-exact predecessor copies.
// Re-implements the canonical hash rather than importing it from the frozen bytes.
// Usage: node ssctr-r7asc-digest.mjs <repo root>
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

const repo = path.resolve(process.argv[2] ?? '.');
const cc = path.join(repo, 'CoachingCore');
const canonical = v => v === null || typeof v !== 'object' ? JSON.stringify(v)
  : Array.isArray(v) ? '[' + v.map(canonical).join(',') + ']'
  : '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
const hash = v => createHash('sha256').update(canonical(v)).digest('hex');
const shaFile = p => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const readJson = p => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, ''));

const freezeDir = path.join(cc, 'r7/state-consumer');
const freezePath = path.join(freezeDir, 'RUNTIME_FREEZE_STATE_MODEL_CONSUMER.json');
const m = readJson(freezePath);

const drift = [];
for (const [p, h] of Object.entries(m.files)) {
  const f = path.join(cc, p);
  const now = fs.existsSync(f) ? shaFile(f) : null;
  if (now !== h) drift.push({p, recorded: h, now});
}
const live = [
  ...fs.readdirSync(path.join(cc, 'src')).filter(f => f.endsWith('.mjs')).map(f => 'src/' + f),
  ...fs.readdirSync(path.join(cc, 'test')).filter(f => f.endsWith('.mjs')).map(f => 'test/' + f),
];
const unfrozen = live.filter(p => !(p in m.files));
const missing = Object.keys(m.files).filter(p => !fs.existsSync(path.join(cc, p)));
const nowMap = Object.fromEntries(Object.keys(m.files).sort().map(p => [p, fs.existsSync(path.join(cc, p)) ? shaFile(path.join(cc, p)) : null]));
const srcMap = Object.fromEntries(Object.entries(nowMap).filter(([p]) => p.startsWith('src/')));
const recomputedSourceDigest = hash(srcMap);
const recomputedManifestDigest = hash(nowMap);
const policy = readJson(path.join(cc, 'r6/PROGRAM_POLICY_R6.json'));
const freezeFilesInDir = fs.readdirSync(freezeDir).filter(f => /^RUNTIME_FREEZE_/.test(f));

const evidenceBindings = [];
const bindCheck = (label, b) => { if (b?.path) { const f = path.join(repo, b.path); evidenceBindings.push({label, path: b.path, recorded: b.sha256, now: fs.existsSync(f) ? shaFile(f) : null, matches: fs.existsSync(f) && shaFile(f) === b.sha256}); } };
bindCheck('probes', m.evidence?.probes);
bindCheck('ssctrKit', m.evidence?.ssctrKit);
bindCheck('mutation', m.evidence?.mutation);
bindCheck('mutationSurvivors', m.evidence?.mutation?.survivorsDocument);
bindCheck('regression', m.evidence?.regression);
bindCheck('regressionNamed', m.evidence?.regression?.named);
bindCheck('baseline', {path: m.sourceRevision?.baseline, sha256: m.sourceRevision?.baselineSha256});

function copyIntegrity(root) {
  const man = readJson(path.join(root, 'MANIFEST.json'));
  const d = [];
  for (const [p, h] of Object.entries(man.files)) { const f = path.join(root, p); const now = fs.existsSync(f) ? shaFile(f) : null; if (now !== h) d.push({p, recorded: h, now}); }
  const src = Object.fromEntries(Object.keys(man.files).filter(p => p.startsWith('CoachingCore/src/')).sort().map(p => [p.replace(/^CoachingCore\//, ''), shaFile(path.join(root, p))]));
  return {root: path.relative(repo, root).split(path.sep).join('/'), revision: man.freeze?.revision, files: Object.keys(man.files).length, drift: d, recordedSourceDigest: man.freeze?.sourceDigest, recomputed: hash(src), matches: hash(src) === man.freeze?.sourceDigest, src};
}
const pred = copyIntegrity(path.join(repo, 'audits/domain-coaching-r7a-state-consumer-2026-10-29/state-model-freeze-source'));
const se = copyIntegrity(path.join(repo, 'audits/domain-coaching-r7a-state-model-2026-10-28/state-evidence-freeze-source'));
const srcDelta = (a, b) => [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(p => a[p] !== b[p]).sort();

console.log(JSON.stringify({
  at: new Date().toISOString(), node: process.version,
  revision: m.revision, frozenAt: m.frozenAt,
  freezeFileSha256: shaFile(freezePath),
  recordedSourceDigest: m.sourceDigest, recomputedSourceDigest, sourceDigestMatches: recomputedSourceDigest === m.sourceDigest,
  recordedManifestDigest: m.manifestDigest, recomputedManifestDigest, manifestDigestMatches: recomputedManifestDigest === m.manifestDigest,
  policyRevision: policy.revision, policyHashRecomputed: hash(policy), policyHashRecorded: m.policyHash, policyMatches: hash(policy) === m.policyHash,
  filesBound: Object.keys(m.files).length, drift, unfrozen, missing, freezeFilesInDir,
  evidenceBindings,
  recordedDelta: m.deltaFromPredecessorFreeze,
  predecessorCopy: {...pred, src: undefined},
  stateEvidenceCopy: {...se, src: undefined},
  srcDeltaVsPredecessor: srcDelta(srcMap, pred.src),
  srcDeltaVsStateEvidence: srcDelta(srcMap, se.src),
}, null, 2));
