// SSCTR R7-B probe p02 (read-only): print the conditions of the R6 envelope records the runtime reads (ssctr-policy-review.json).
import fs from 'node:fs';
import path from 'node:path';
const repo = path.resolve(import.meta.dirname, '../../../../..');
const raw = JSON.parse(fs.readFileSync(path.join(repo, 'audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json'), 'utf8').replace(/^﻿/, ''));
const list = Array.isArray(raw) ? raw : (raw.records ?? raw.decisions ?? Object.values(raw).find(Array.isArray) ?? []);
const want = process.argv.slice(2);
console.log('top keys:', Array.isArray(raw) ? 'array' : Object.keys(raw), 'records:', list.length);
for (const r of list) {
  const id = r.review_id ?? r.boundaryId ?? r.id;
  const ids = [r.review_id, r.boundaryId, ...(r.scope?.item_ids ?? []), ...(r.target?.rule_ids ?? [])].filter(Boolean).join(' ');
  if (want.length && !want.some(w => ids.includes(w))) { console.log('- ' + id + ' | ' + r.disposition + ' | ' + (r.scope?.item_ids ?? []).join(',')); continue; }
  console.log('\n=== ' + id + ' rev ' + r.review_revision + ' | ' + r.disposition + ' | ' + r.evidence_status);
  console.log('items: ' + (r.scope?.item_ids ?? []).join(', '));
  console.log('Q: ' + r.question);
  (r.decision?.conditions ?? []).forEach((c, i) => console.log('  C' + (i + 1) + ': ' + c));
  (r.decision?.must_not ?? []).forEach((c, i) => console.log('  mustNot' + (i + 1) + ': ' + c));
}
