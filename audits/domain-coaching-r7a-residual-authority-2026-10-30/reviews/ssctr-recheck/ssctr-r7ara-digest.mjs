// SSCTR R7ARA-SSCTR-r1 digest check (own; prints only). Recomputes, with my own canonical hash (re-implemented here, not imported from the
// runtime), the source and manifest digests of a CoachingCore tree against the freeze record it carries, the drift of every bound file, the
// src/test files the record does not bind, and the policy's canonical hash and file SHA-256. Usage:
//   node ssctr-r7ara-digest.mjs <label> <CoachingCore dir> <freeze record path relative to it> [<more dir> <record> ...]
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const [label, ...pairs] = process.argv.slice(2);
const sha = p => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const canonical = v => v === null || typeof v !== 'object' ? JSON.stringify(v) : Array.isArray(v) ? '[' + v.map(canonical).join(',') + ']' : '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
const H = v => createHash('sha256').update(canonical(v)).digest('hex');
const trees = [];
for (let i = 0; i < pairs.length; i += 2) {
  const cc = path.resolve(pairs[i]), F = JSON.parse(fs.readFileSync(path.join(cc, pairs[i + 1]), 'utf8'));
  const live = Object.fromEntries(Object.keys(F.files).map(p => [p, fs.existsSync(path.join(cc, p)) ? sha(path.join(cc, p)) : null]));
  const drift = Object.entries(F.files).filter(([p, h]) => live[p] !== h).map(([p]) => p);
  const unbound = ['src', 'test'].flatMap(d => fs.readdirSync(path.join(cc, d)).filter(f => f.endsWith('.mjs')).map(f => `${d}/${f}`)).filter(p => !(p in F.files));
  const policyPath = path.join(cc, 'r6/PROGRAM_POLICY_R6.json'), policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
  const src = H(Object.fromEntries(Object.entries(live).filter(([p]) => p.startsWith('src/')))), man = H(live);
  trees.push({tree: pairs[i], record: pairs[i + 1], revision: F.revision, boundFiles: Object.keys(F.files).length, drift, unbound,
    sourceDigest: src, sourceDigestMatchesRecord: src === F.sourceDigest, manifestDigest: man, manifestDigestMatchesRecord: man === F.manifestDigest,
    policyRevision: policy.revision, policyCanonical: H(policy), policyFileSha256: sha(policyPath), recordSha256: sha(path.join(cc, pairs[i + 1]))});
}
console.log(JSON.stringify({check: 'R7ARA-SSCTR-r1-DIGEST', label, at: new Date().toISOString(), node: process.version, trees}, null, 1));
