// SSCTR R7-B probe p01 (read-only): list the sources and searches used by the B0 r1/r2 records (for re-verification, not reuse as-is).
import fs from 'node:fs';
import path from 'node:path';
const repo = path.resolve(import.meta.dirname, '../../../../..');
for (const f of ['audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json', 'audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_REVIEW_B0.json']) {
  const recs = JSON.parse(fs.readFileSync(path.join(repo, f), 'utf8'));
  const list = Array.isArray(recs) ? recs : (recs.records ?? []);
  const seen = new Map();
  for (const r of list) for (const s of r.literature_snapshot?.sources || []) {
    const k = s.source_id + '|' + (s.doi || s.pmid || s.url);
    if (!seen.has(k)) seen.set(k, { ...s, usedBy: [] });
    seen.get(k).usedBy.push(r.review_id);
  }
  console.log('\n######## ' + f + ' — ' + seen.size + ' distinct sources');
  for (const s of seen.values()) console.log(`- ${s.source_id} | ${s.year} | ${s.title.slice(0, 110)} | ${s.authors.slice(0, 40)} | doi=${s.doi} pmid=${s.pmid} | ${s.access} verified=${s.verified} elig=${s.prescriptive_support_eligible} | ${s.url} | used by ${[...new Set(s.usedBy)].join(',')}`);
}
