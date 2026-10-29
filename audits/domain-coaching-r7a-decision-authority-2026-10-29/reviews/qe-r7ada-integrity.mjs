// Independent integrity check of R7A-DECISION-AUTHORITY-FREEZE-1 (QE reviewer-owned, read-only).
// Re-implements the canonical hash (does not import the runtime's), then cross-checks against the runtime's own hash().
// Also checks the working-tree bytes against the freeze commit's git blobs, and that the handoff commit touches no bound file.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';

const repo = path.resolve(import.meta.dirname, '../../..');
const cc = path.join(repo, 'CoachingCore');
const FREEZE_COMMIT = 'd4631cd03fb27bbc1857532500748476ab764987', HANDOFF_COMMIT = '5434b3265f5634d1e7c796426cd9d8415b3b1af2';
const freezeRel = 'CoachingCore/r7/decision-authority/RUNTIME_FREEZE_R7A_DECISION_AUTHORITY.json';
const fr = JSON.parse(fs.readFileSync(path.join(repo, freezeRel), 'utf8'));
const git = (...a) => { const r = spawnSync('git', a, {cwd: repo, encoding: 'buffer', maxBuffer: 1 << 28}); return {status: r.status, out: r.stdout, err: r.stderr.toString()}; };

function canonical(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
}
const myHash = v => createHash('sha256').update(canonical(v)).digest('hex');
const shaBuf = b => createHash('sha256').update(b).digest('hex');
const sha = p => shaBuf(fs.readFileSync(path.join(cc, p)));

const current = Object.fromEntries([
  ...fs.readdirSync(path.join(cc, 'src')).filter(f => f.endsWith('.mjs')).map(f => 'src/' + f),
  ...fs.readdirSync(path.join(cc, 'test')).filter(f => f.endsWith('.mjs')).map(f => 'test/' + f),
  'r6/PROGRAM_POLICY_R6.json', 'r6/fixtures/dev-authority.mjs', 'r6/fixtures/profiles.mjs', 'r6/fixtures/trajectories.mjs', 'package.json'
].sort().map(p => [p, sha(p)]));
const frozen = fr.files;
const mismatched = Object.keys(frozen).filter(p => current[p] !== frozen[p]);
const unfrozen = Object.keys(current).filter(p => !(p in frozen));
const missing = Object.keys(frozen).filter(p => !(p in current));

function walk(d, acc = []) { for (const e of fs.readdirSync(d, {withFileTypes: true})) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, acc); else acc.push(path.relative(cc, p).split(path.sep).join('/')); } return acc; }
const strayFiles = [...walk(path.join(cc, 'src')), ...walk(path.join(cc, 'test'))].filter(p => !(p in frozen));

const srcMap = Object.fromEntries(Object.entries(current).filter(([p]) => p.startsWith('src/')));
const sourceDigest = myHash(srcMap), manifestDigest = myHash(current);
const policy = JSON.parse(fs.readFileSync(path.join(cc, 'r6/PROGRAM_POLICY_R6.json'), 'utf8').replace(/^﻿/, ''));
const policyHash = myHash(policy);

// Bytes in the freeze commit's tree (git blobs), per bound file.
const atFreeze = {}, atHandoff = {};
for (const p of Object.keys(frozen)) {
  const a = git('show', `${FREEZE_COMMIT}:CoachingCore/${p}`); atFreeze[p] = a.status === 0 ? shaBuf(a.out) : null;
  const b = git('show', `${HANDOFF_COMMIT}:CoachingCore/${p}`); atHandoff[p] = b.status === 0 ? shaBuf(b.out) : null;
}
const freezeCommitMismatch = Object.keys(frozen).filter(p => atFreeze[p] !== frozen[p]);
const handoffCommitMismatch = Object.keys(frozen).filter(p => atHandoff[p] !== frozen[p]);
const freezeRecordAtCommit = git('show', `${FREEZE_COMMIT}:${freezeRel}`);
const handoffDiffFiles = git('diff', '--name-only', FREEZE_COMMIT, HANDOFF_COMMIT).out.toString().split('\n').filter(Boolean);
const headToHandoff = git('diff', '--name-only', HANDOFF_COMMIT, 'HEAD').out.toString().split('\n').filter(Boolean);
const freezeParent = git('rev-parse', `${FREEZE_COMMIT}^`).out.toString().trim();
const freezeCommitFiles = git('diff', '--name-only', freezeParent, FREEZE_COMMIT).out.toString().split('\n').filter(Boolean);

const rt = await import(pathToFileURL(path.join(cc, 'src/value.mjs')).href);
const rtSource = rt.hash(srcMap), rtManifest = rt.hash(current);

// Predecessor byte-exact copy: matches its own MANIFEST?
const predRoot = path.join(repo, 'audits/domain-coaching-r7a-decision-authority-2026-10-29/state-consumer-freeze-source');
const pf = JSON.parse(fs.readFileSync(path.join(predRoot, 'MANIFEST.json'), 'utf8'));
const predMismatch = Object.entries(pf.files).filter(([p, h]) => !fs.existsSync(path.join(predRoot, p)) || shaBuf(fs.readFileSync(path.join(predRoot, p))) !== h).map(([p]) => p);
const predSrc = Object.fromEntries(Object.entries(pf.files).filter(([p]) => p.startsWith('CoachingCore/src/')).map(([p, h]) => [p.replace(/^CoachingCore\//, ''), h]));
const predAll = Object.fromEntries(Object.entries(pf.files).map(([p, h]) => [p.replace(/^CoachingCore\//, ''), h]));
const prior = p => pf.files['CoachingCore/' + p];
const changed = Object.keys(current).filter(p => prior(p) !== undefined && prior(p) !== current[p]);
const added = Object.keys(current).filter(p => prior(p) === undefined);
const removed = Object.keys(pf.files).map(p => p.replace(/^CoachingCore\//, '')).filter(p => !current[p]);
// The predecessor's own freeze record (original location) still matches the copy?
const predFreezeFile = pf.freeze?.file, predFreezeOk = predFreezeFile ? shaBuf(fs.readFileSync(path.join(repo, predFreezeFile))) === pf.freeze.fileSha256 : null;

const out = {
  checkedAt: new Date().toISOString(), node: process.version,
  git: {branch: git('branch', '--show-current').out.toString().trim(), head: git('rev-parse', 'HEAD').out.toString().trim(), status: git('status', '--short').out.toString().split('\n').filter(Boolean),
    freezeCommit: FREEZE_COMMIT, freezeParent, handoffCommit: HANDOFF_COMMIT, handoffIsChildOfFreeze: git('rev-parse', `${HANDOFF_COMMIT}^`).out.toString().trim() === FREEZE_COMMIT,
    filesChangedByFreezeCommit: freezeCommitFiles.length, filesChangedByHandoffCommit: handoffDiffFiles, filesChangedHandoffToHead: headToHandoff,
    freezeRecordAtFreezeCommitEqualsWorkingTree: freezeRecordAtCommit.status === 0 && shaBuf(freezeRecordAtCommit.out) === shaBuf(fs.readFileSync(path.join(repo, freezeRel)))},
  freezeRevision: fr.revision, freezeNode: fr.node,
  recorded: {sourceDigest: fr.sourceDigest, manifestDigest: fr.manifestDigest, policyHash: fr.policyHash, files: Object.keys(frozen).length},
  recomputed: {sourceDigest, manifestDigest, policyHash, files: Object.keys(current).length, runtimeHashSource: rtSource, runtimeHashManifest: rtManifest},
  expectedByRequest: {sourceDigest: '3a7166b25aaf550f7692cc058f0e582b42e9eb7f74b9e361f23733b5e74ab244', manifestDigest: 'a500cdd94b8a4994a718029d4ee6efdc703e4f54de59d0855b5598c0d1afb224', policyPrefix: '18ec48f3'},
  equal: {sourceDigest: sourceDigest === fr.sourceDigest, manifestDigest: manifestDigest === fr.manifestDigest, policyHash: policyHash === fr.policyHash,
    sourceDigestAsRequested: sourceDigest === '3a7166b25aaf550f7692cc058f0e582b42e9eb7f74b9e361f23733b5e74ab244', manifestDigestAsRequested: manifestDigest === 'a500cdd94b8a4994a718029d4ee6efdc703e4f54de59d0855b5598c0d1afb224', policyPrefixAsRequested: policyHash.startsWith('18ec48f3'),
    runtimeHashAgrees: rtSource === sourceDigest && rtManifest === manifestDigest},
  workingTreeVsRecord: {mismatched, unfrozen, missing, strayFiles},
  freezeCommitBlobsVsRecord: {mismatched: freezeCommitMismatch}, handoffCommitBlobsVsRecord: {mismatched: handoffCommitMismatch},
  deltaVsPredecessor: {changed, added, removed, recordedDelta: {changed: fr.deltaFromPredecessorFreeze.changed, added: fr.deltaFromPredecessorFreeze.added, removed: fr.deltaFromPredecessorFreeze.removed}},
  predecessor: {revision: pf.freeze?.revision, sourceDigestRecorded: pf.freeze?.sourceDigest, sourceDigestRecomputed: myHash(predSrc), manifestDigestRecorded: pf.freeze?.manifestDigest, manifestDigestRecomputed: myHash(predAll), copyMismatches: predMismatch, files: Object.keys(pf.files).length, originalFreezeFileUnchanged: predFreezeOk},
  freezeRecordSha256: shaBuf(fs.readFileSync(path.join(repo, freezeRel)))
};
out.REVIEW_INVALID = (out.equal.sourceDigest && out.equal.manifestDigest && out.equal.policyHash && out.equal.sourceDigestAsRequested && out.equal.manifestDigestAsRequested && out.equal.policyPrefixAsRequested && out.equal.runtimeHashAgrees && !mismatched.length && !missing.length && !unfrozen.length && !strayFiles.length && !freezeCommitMismatch.length && !handoffCommitMismatch.length) ? 'NO' : 'YES';
console.log(JSON.stringify(out, null, 2));
