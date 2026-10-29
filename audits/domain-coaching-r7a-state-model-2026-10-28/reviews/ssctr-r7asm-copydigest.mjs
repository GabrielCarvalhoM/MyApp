// SSCTR R7ASM-SSCTR-r1 predecessor-copy integrity probe (own; prints only): the byte-exact STATE-EVIDENCE-FREEZE-1 copy against its MANIFEST and its
// recorded source digest. Usage: node ssctr-r7asm-copydigest.mjs <state-evidence-freeze-source dir>.
// Read-only check that the predecessor copy is byte-exact with its MANIFEST and that its source digest is 692483ce…
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root = process.argv[2];
const canonical = v => v === null || typeof v !== 'object' ? JSON.stringify(v)
  : Array.isArray(v) ? '[' + v.map(canonical).join(',') + ']'
  : '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
const hash = v => createHash('sha256').update(canonical(v)).digest('hex');
const shaFile = p => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const m = JSON.parse(fs.readFileSync(path.join(root, 'MANIFEST.json'), 'utf8'));
const drift = [];
for (const [p, h] of Object.entries(m.files)) { const f = path.join(root, p); const now = fs.existsSync(f) ? shaFile(f) : null; if (now !== h) drift.push({p, recorded: h, now}); }
const src = Object.fromEntries(Object.keys(m.files).filter(p => p.startsWith('CoachingCore/src/')).sort().map(p => [p.replace(/^CoachingCore\//, ''), shaFile(path.join(root, p))]));
console.log(JSON.stringify({files: Object.keys(m.files).length, drift, recordedSourceDigest: m.freeze.sourceDigest, recomputed: hash(src), matches: hash(src) === m.freeze.sourceDigest}, null, 2));
