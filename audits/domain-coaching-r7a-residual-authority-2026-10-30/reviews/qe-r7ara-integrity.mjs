// Independent integrity check of R7A-RESIDUAL-AUTHORITY-FREEZE-1 (QE reviewer-owned, read-only; R7ARA engineering recheck).
// Re-implements the canonical hash (does not import the runtime's), then cross-checks it against the runtime's own hash().
// Checks the working-tree bytes against the freeze commit's and the handoff commit's git blobs, that the handoff commit touches no bound file
// and no evidence file, the policy hash, the predecessor freeze commit's bytes, and the superseded round's digest at its commit.
// Usage: node qe-r7ara-integrity.mjs <label>   -> writes qe-r7ara-runs/integrity.<label>.out.json only.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';

const here = import.meta.dirname, repo = path.resolve(here, '../../..'), cc = path.join(repo, 'CoachingCore');
const label = process.argv[2] ?? 'adhoc';
const FREEZE_COMMIT = '7d2da3603e224124696a2290766ec448080f3264', HANDOFF_COMMIT = '4917489364bb1138f8d82b46c20dd65d1bf693c7';
const BASE_COMMIT = '5434b3265f5634d1e7c796426cd9d8415b3b1af2', PRED_FREEZE_COMMIT = 'd4631cd03fb27bbc1857532500748476ab764987', SUPERSEDED_COMMIT = 'b9fd42d1fff90629650563a51f640d6f865943c0';
const EXPECT = {source: 'e7172eb2e65bfb1da4c102a7efa2bae64bf1c70b06562fd3ce9896defd6dc17d', manifest: '3d214fb53f62e45ca7d99f39f2c562d358719a2264c2de46098d39b318c85125', policy: '18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c',
  predSource: '3a7166b25aaf550f7692cc058f0e582b42e9eb7f74b9e361f23733b5e74ab244', predManifest: 'a500cdd94b8a4994a718029d4ee6efdc703e4f54de59d0855b5598c0d1afb224', supersededSource: '259ab3eff431d2381d50904be7594d9fa122c7d8d2fc369e20d67b5419f84cb6'};
const freezeRel = 'CoachingCore/r7/residual-authority/RUNTIME_FREEZE_R7A_RESIDUAL_AUTHORITY.json';
const fr = JSON.parse(fs.readFileSync(path.join(repo, freezeRel), 'utf8'));
const git = (...a) => { const r = spawnSync('git', a, {cwd: repo, encoding: 'buffer', maxBuffer: 1 << 28}); return {status: r.status, out: r.stdout, err: r.stderr.toString()}; };
function canonical(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
}
const myHash = v => createHash('sha256').update(canonical(v)).digest('hex'), shaBuf = b => createHash('sha256').update(b).digest('hex');
const sha = p => shaBuf(fs.readFileSync(path.join(cc, p)));
// The live set, built from disk independently of the record: every src/test .mjs plus the five non-code bound files.
const current = Object.fromEntries([
  ...fs.readdirSync(path.join(cc, 'src')).filter(f => f.endsWith('.mjs')).map(f => 'src/' + f),
  ...fs.readdirSync(path.join(cc, 'test')).filter(f => f.endsWith('.mjs')).map(f => 'test/' + f),
  'r6/PROGRAM_POLICY_R6.json', 'r6/fixtures/dev-authority.mjs', 'r6/fixtures/profiles.mjs', 'r6/fixtures/trajectories.mjs', 'package.json'
].sort().map(p => [p, sha(p)]));
const frozen = fr.files;
const mismatched = Object.keys(frozen).filter(p => current[p] !== frozen[p]), unfrozen = Object.keys(current).filter(p => !(p in frozen)), missing = Object.keys(frozen).filter(p => !(p in current));
const walk = (d, acc = []) => { for (const e of fs.readdirSync(d, {withFileTypes: true})) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, acc); else acc.push(path.relative(cc, p).split(path.sep).join('/')); } return acc; };
const strayFiles = [...walk(path.join(cc, 'src')), ...walk(path.join(cc, 'test'))].filter(p => !(p in frozen));
const srcMap = Object.fromEntries(Object.entries(current).filter(([p]) => p.startsWith('src/')));
const sourceDigest = myHash(srcMap), manifestDigest = myHash(current);
const policyHash = myHash(JSON.parse(fs.readFileSync(path.join(cc, 'r6/PROGRAM_POLICY_R6.json'), 'utf8').replace(/^﻿/, '')));
// Bytes at the freeze and handoff commits (git blobs), per bound file.
const blobsAt = c => Object.fromEntries(Object.keys(frozen).map(p => { const a = git('show', `${c}:CoachingCore/${p}`); return [p, a.status === 0 ? shaBuf(a.out) : null]; }));
const atFreeze = blobsAt(FREEZE_COMMIT), atHandoff = blobsAt(HANDOFF_COMMIT);
const freezeCommitMismatch = Object.keys(frozen).filter(p => atFreeze[p] !== frozen[p]), handoffCommitMismatch = Object.keys(frozen).filter(p => atHandoff[p] !== frozen[p]);
const recordAtFreeze = git('show', `${FREEZE_COMMIT}:${freezeRel}`);
const handoffDiff = git('diff', '--name-only', FREEZE_COMMIT, HANDOFF_COMMIT).out.toString().split('\n').filter(Boolean);
const headDiff = git('diff', '--name-only', HANDOFF_COMMIT).out.toString().split('\n').filter(Boolean).concat(git('ls-files', '--others', '--exclude-standard').out.toString().split('\n').filter(Boolean));
const ancestry = {baseIsAncestorOfFreeze: git('merge-base', '--is-ancestor', BASE_COMMIT, FREEZE_COMMIT).status === 0, freezeIsParentOfHandoff: git('rev-parse', `${HANDOFF_COMMIT}^`).out.toString().trim() === FREEZE_COMMIT, predFreezeIsAncestor: git('merge-base', '--is-ancestor', PRED_FREEZE_COMMIT, FREEZE_COMMIT).status === 0};
// Source digest of a commit, from its git blobs.
const commitSource = c => myHash(Object.fromEntries(git('ls-tree', '--name-only', c, 'CoachingCore/src/').out.toString().split('\n').filter(n => n.endsWith('.mjs')).map(n => ['src/' + n.split('/').pop(), shaBuf(git('show', `${c}:${n}`).out)])));
const commitManifest = (c, files) => myHash(Object.fromEntries(Object.keys(files).map(p => [p, shaBuf(git('show', `${c}:CoachingCore/${p}`).out)])));
const predRecord = JSON.parse(git('show', `${PRED_FREEZE_COMMIT}:CoachingCore/r7/decision-authority/RUNTIME_FREEZE_R7A_DECISION_AUTHORITY.json`).out.toString());
const rt = await import(pathToFileURL(path.join(cc, 'src/value.mjs')).href);
const out = {probe: 'qe-r7ara-integrity', label, node: process.version, at: new Date().toISOString(), head: git('rev-parse', 'HEAD').out.toString().trim(), branch: git('branch', '--show-current').out.toString().trim(),
  candidate: {sourceDigest, manifestDigest, policyHash, runtimeHashSource: rt.hash(srcMap), runtimeHashManifest: rt.hash(current), boundFiles: Object.keys(frozen).length, mismatched, unfrozen, missing, strayFiles},
  record: {revision: fr.revision, sourceDigest: fr.sourceDigest, manifestDigest: fr.manifestDigest, policyHash: fr.policyHash, recordFileSha256: shaBuf(fs.readFileSync(path.join(repo, freezeRel))), recordAtFreezeCommitEqual: recordAtFreeze.status === 0 && shaBuf(recordAtFreeze.out) === shaBuf(fs.readFileSync(path.join(repo, freezeRel)))},
  commits: {ancestry, freezeCommitMismatch, handoffCommitMismatch, handoffChanges: handoffDiff, handoffTouchesBoundOrEvidence: handoffDiff.filter(f => f.startsWith('CoachingCore/') || f.includes('/probes/') || f.includes('decision-authority-freeze-source/')), workingTreeVsHandoff: headDiff},
  predecessor: {commit: PRED_FREEZE_COMMIT, sourceDigest: commitSource(PRED_FREEZE_COMMIT), manifestDigest: commitManifest(PRED_FREEZE_COMMIT, predRecord.files), recordSource: predRecord.sourceDigest, recordManifest: predRecord.manifestDigest},
  superseded: {commit: SUPERSEDED_COMMIT, sourceDigest: commitSource(SUPERSEDED_COMMIT)},
};
out.verdict = {sourceDigest: sourceDigest === EXPECT.source && fr.sourceDigest === EXPECT.source && out.candidate.runtimeHashSource === sourceDigest, manifestDigest: manifestDigest === EXPECT.manifest && fr.manifestDigest === EXPECT.manifest,
  policy: policyHash === EXPECT.policy && fr.policyHash === EXPECT.policy, boundBytes: !mismatched.length && !unfrozen.length && !missing.length && !strayFiles.length, freezeCommit: !freezeCommitMismatch.length && out.record.recordAtFreezeCommitEqual,
  handoffCommit: !handoffCommitMismatch.length && !out.commits.handoffTouchesBoundOrEvidence.length, ancestry: Object.values(ancestry).every(Boolean),
  predecessor: out.predecessor.sourceDigest === EXPECT.predSource && out.predecessor.manifestDigest === EXPECT.predManifest, superseded: out.superseded.sourceDigest === EXPECT.supersededSource};
out.RECHECK_INVALID = Object.values(out.verdict).every(Boolean) ? 'NO' : 'YES';
fs.mkdirSync(path.join(here, 'qe-r7ara-runs'), {recursive: true});
fs.writeFileSync(path.join(here, 'qe-r7ara-runs', `integrity.${label}.out.json`), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify({label, RECHECK_INVALID: out.RECHECK_INVALID, verdict: out.verdict, sourceDigest, manifestDigest, policyHash}));
