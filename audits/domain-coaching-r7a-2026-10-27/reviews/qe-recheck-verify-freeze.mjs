// QE judge re-check (R7A-QE-r2): verify the CoachingCore files against R7A-FREEZE-2 (read-only) and list the FREEZE-1 -> FREEZE-2 delta.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const core = join(here, '..', '..', '..', 'CoachingCore');
const f2 = JSON.parse(readFileSync(join(core, 'r7', 'RUNTIME_FREEZE_R7A_2.json'), 'utf8'));
const f1 = JSON.parse(readFileSync(join(core, 'r7', 'RUNTIME_FREEZE_R7A_1.json'), 'utf8'));
const sha = (b) => createHash('sha256').update(b).digest('hex');
let ok = 0; const bad = [];
for (const [rel, h] of Object.entries(f2.files)) {
  const actual = sha(readFileSync(join(core, rel)));
  if (actual === h) ok++; else bad.push({ rel, expected: h, actual });
}
const { hash } = await import(pathToFileURL(join(core, 'src', 'value.mjs')).href);
const srcDigest = hash(Object.fromEntries(Object.entries(f2.files).filter(([p]) => p.startsWith('src/'))));
const changed = Object.keys(f2.files).filter((k) => f1.files[k] && f1.files[k] !== f2.files[k]);
const added = Object.keys(f2.files).filter((k) => !f1.files[k]);
const removed = Object.keys(f1.files).filter((k) => !f2.files[k]);
const policySha = sha(readFileSync(join(core, 'r6', 'PROGRAM_POLICY_R6.json')));
console.log(JSON.stringify({
  revision: f2.revision, files: Object.keys(f2.files).length, matching: ok, mismatching: bad,
  declaredSourceDigest: f2.sourceDigest, recomputedSourceDigest: srcDigest, digestMatches: srcDigest === f2.sourceDigest,
  policyHash: f2.policyHash, policyFileSha256: policySha, policyFileMatches: policySha === f2.policyFileSha256, policyUnchangedFromFreeze1: f1.policyHash === f2.policyHash && f1.policyFileSha256 === f2.policyFileSha256,
  deltaFromFreeze1: { changed, added, removed },
}, null, 2));
