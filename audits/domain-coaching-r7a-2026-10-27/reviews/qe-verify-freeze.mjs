// QE judge: verify the reviewed CoachingCore files against R7A-FREEZE-1 (read-only).
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const core = join(here, '..', '..', '..', 'CoachingCore');
const freeze = JSON.parse(readFileSync(join(core, 'r7', 'RUNTIME_FREEZE_R7A_1.json'), 'utf8'));
const sha = (b) => createHash('sha256').update(b).digest('hex');
let ok = 0, bad = [];
for (const [rel, h] of Object.entries(freeze.files)) {
  const actual = sha(readFileSync(join(core, rel)));
  if (actual === h) ok++; else bad.push({ rel, expected: h, actual });
}
// Recompute source digest candidates: sha of sorted "path:hash\n"
const lines = Object.keys(freeze.files).sort().map((k) => `${k}:${freeze.files[k]}`);
const cands = {
  'path:hash\n': sha(lines.join('\n')),
  'path:hash\n trailing': sha(lines.join('\n') + '\n'),
  'path  hash': sha(Object.keys(freeze.files).sort().map((k) => `${freeze.files[k]}  ${k}`).join('\n') + '\n'),
  json: sha(JSON.stringify(freeze.files)),
};
console.log(JSON.stringify({ revision: freeze.revision, files: Object.keys(freeze.files).length, matching: ok, mismatching: bad, declaredSourceDigest: freeze.sourceDigest, digestCandidates: cands, digestMatches: Object.entries(cands).filter(([, v]) => v === freeze.sourceDigest).map(([k]) => k) }, null, 2));
// Source digest as defined by CoachingCore/scripts/freeze-r7a.mjs: hash() of the src/ entries.
import { pathToFileURL } from 'node:url';
const { hash } = await import(pathToFileURL(join(core, 'src', 'value.mjs')).href);
const srcDigest = hash(Object.fromEntries(Object.entries(freeze.files).filter(([p]) => p.startsWith('src/'))));
console.log(JSON.stringify({ recomputedSourceDigest: srcDigest, matchesDeclared: srcDigest === freeze.sourceDigest }));
