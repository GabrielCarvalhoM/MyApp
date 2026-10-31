// SSCTR R7-B probe p00 (read-only): summarize the 13 R7B0-SSCTR-r2 records (ids, disposition, conditions).
import fs from 'node:fs';
import path from 'node:path';
const repo = path.resolve(import.meta.dirname, '../../../../..');
const recs = JSON.parse(fs.readFileSync(path.join(repo, 'audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json'), 'utf8'));
const list = Array.isArray(recs) ? recs : (recs.records ?? Object.values(recs));
console.log('top-level keys:', Array.isArray(recs) ? 'array' : Object.keys(recs));
for (const r of list) {
  if (!r || typeof r !== 'object') continue;
  console.log('\n=== ' + r.review_id + ' rev ' + r.review_revision + ' | ' + r.disposition + ' | ' + r.evidence_status + ' | conf ' + r.confidence?.level);
  console.log('target: ' + r.target?.artifact + ' ' + r.target?.artifact_revision + ' ' + r.target?.sha256);
  console.log('rules: ' + (r.target?.rule_ids || []).join(', '));
  console.log('Q: ' + r.question);
  (r.decision?.conditions || []).forEach((c, i) => console.log('  c' + (i + 1) + ': ' + c));
  (r.decision?.must_not || []).forEach((c, i) => console.log('  mustNot' + (i + 1) + ': ' + c));
  console.log('  queue: ' + r.human_revalidation?.queue_ref + ' ' + r.human_revalidation?.state);
}
