// Applies the held OB-2 round-2 product-doc corrections in PENDING_DOC_CORRECTIONS_R2.json.
// Dry run by default; --apply writes. Refuses while DOMAIN_COACHING_R6 is open, when a target no
// longer matches the version the corrections were reviewed against, or when a result differs from it.
// Usage (from the repo root): node audits/new-figma-onboarding-v2-2026-10-25/apply-pending-doc-corrections.mjs [--apply]
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const apply = process.argv.includes('--apply');
const allowOpen = process.argv.includes('--allow-open-mission'); // only with explicit Founder approval
const pending = JSON.parse(fs.readFileSync(path.join(here, 'PENDING_DOC_CORRECTIONS_R2.json'), 'utf8'));
const sha = (b) => createHash('sha256').update(b).digest('hex');
const fail = (msg) => { console.error(`REFUSED: ${msg}`); process.exit(1); };

// 1. The mission these corrections wait for must be closed.
if (!fs.existsSync(path.join(root, pending.heldFor, 'FINAL_DISPOSITION.json')) && !allowOpen)
  fail(`${pending.heldFor} has no FINAL_DISPOSITION.json yet; its baseline binds product/ and canon/`);
const others = fs.readdirSync(path.join(root, 'audits'))
  .filter((d) => d.startsWith('domain-') && d !== 'domain-closure-r2-2026-10-24' && `audits/${d}` !== pending.heldFor)
  .filter((d) => !fs.existsSync(path.join(root, 'audits', d, 'FINAL_DISPOSITION.json')));
if (others.length) console.warn(`WARNING: check these missions before applying: ${others.join(', ')}`);

// 2. Every target must still be the version the judges reviewed.
const text = {};
for (const f of pending.files) {
  const buf = fs.readFileSync(path.join(root, f.path));
  if (sha(buf) !== f.preSha256) fail(`${f.path} changed since the corrections were prepared; re-validate the ops and re-check with the owning judge`);
  text[f.path] = buf.toString('utf8');
}

// 3. Exact single-occurrence replacements, then the result must match the reviewed one byte for byte.
for (const op of pending.ops) {
  const n = text[op.file].split(op.from).length - 1;
  if (n !== 1) fail(`op ${op.n} (${op.where}): expected 1 occurrence, found ${n}`);
  text[op.file] = text[op.file].replace(op.from, () => op.to);
}
for (const f of pending.files)
  if (sha(Buffer.from(text[f.path], 'utf8')) !== f.postSha256) fail(`${f.path}: result differs from the reviewed postSha256`);

if (apply) {
  const snap = path.join(here, 'before-r2');
  for (const f of pending.files) {
    const dst = path.join(snap, f.path);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(path.join(root, f.path), dst);
  }
  fs.writeFileSync(path.join(snap, 'SHA256SUMS.txt'), pending.files.map((f) => `${f.preSha256} *${f.path}`).join('\n') + '\n');
  for (const f of pending.files) fs.writeFileSync(path.join(root, f.path), text[f.path], 'utf8');
}
console.log(JSON.stringify({ applied: apply, ops: pending.ops.length, files: pending.files.map((f) => f.path) }));
