// Builds a read-only reconstruction of the FREEZE-1 runtime under reviews/coaching-quality/freeze1-recon/
// so the judge can run counterfactual probes against FREEZE-1 without touching CoachingCore/.
// Every frozen code and policy file is verified against RUNTIME_FREEZE_R6.json. The FREEZE-1 SSCTR records file
// cannot be byte-verified (the archived r6 copy differs from the frozen bytes); the authority it yields is checked instead.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../..');
const recon = path.join(here, 'freeze1-recon');
const f1 = path.join(repo, 'audits/domain-coaching-r6-2026-10-26/freeze-1-source');
const sha = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const copy = (from, to) => { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to); };

fs.rmSync(recon, { recursive: true, force: true });
const freeze = JSON.parse(fs.readFileSync(path.join(repo, 'CoachingCore/r6/RUNTIME_FREEZE_R6.json'), 'utf8'));
const report = { freezeDigest: freeze.sourceDigest, verified: [], unverifiable: [], failures: [] };
for (const e of freeze.entries) {
  const target = path.join(recon, e.path);
  const rel = e.path.replace(/^CoachingCore\//, '');
  const frozenCopy = path.join(f1, rel);
  const current = path.join(repo, e.path);
  let src = null;
  if (fs.existsSync(frozenCopy) && sha(frozenCopy) === e.sha256) src = frozenCopy;
  else if (fs.existsSync(current) && sha(current) === e.sha256) src = current;
  if (src) { copy(src, target); report.verified.push(e.path); continue; }
  if (e.path.endsWith('ssctr-policy-review.json')) {
    copy(path.join(repo, 'audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.r6.json'), target);
    report.unverifiable.push({ path: e.path, frozenSha256: e.sha256, substitutedWith: 'reviews/ssctr-policy-review.r6.json', substituteSha256: sha(target) });
    continue;
  }
  report.failures.push(e.path);
}
// Files outside the freeze manifest that FREEZE-1 code reads (earlier-round authorities), copied as they are now.
for (const p of ['audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json', 'audits/domain-closure-r4-2026-10-25/reviews/ssctr-envelope-review.json', 'audits/domain-closure-r3-2026-10-24/reviews/ssctr-records.json']) {
  copy(path.join(repo, p), path.join(recon, p));
  report.unverifiable.push({ path: p, note: 'not in the FREEZE-1 manifest; copied from the current repository', sha256: sha(path.join(recon, p)) });
}
fs.writeFileSync(path.join(here, 'freeze1-recon-manifest.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ verified: report.verified.length, unverifiable: report.unverifiable.length, failures: report.failures }));
