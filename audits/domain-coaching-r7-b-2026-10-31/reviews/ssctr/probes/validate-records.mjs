// Node port of .agents/skills/sports-science-review/scripts/validate_records.py (no Python interpreter on this machine). Read-only.
// Checks: decision.schema.json (draft 2020-12, ajv from CoachingCore/node_modules), duplicate review/source/claim ids, source identity,
// claim -> source links, decision-support claims linked to verified eligible full text, AE answers 1..10, target hash. The queue check is
// reported, not enforced: this reviewer must not edit the queue, so approval queue refs are PROPOSED entries for the Chief to append.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';

const root = path.resolve(import.meta.dirname, '../../../../..');
const require = createRequire(path.join(root, 'CoachingCore', 'package.json'));
const Ajv2020 = require('ajv/dist/2020').default;
const schema = JSON.parse(fs.readFileSync(path.join(root, 'governance/agents/sports-science-reviewer/decision.schema.json'), 'utf8'));
const records = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '..', 'SSCTR_REVIEW_R7B.json'), 'utf8'));
const ajv = new Ajv2020({allErrors: true, strict: false});
ajv.addFormat('date', /^\d{4}-\d{2}-\d{2}$/);
ajv.addFormat('uri', s => { try { new URL(s); return true; } catch { return false; } });
const validate = ajv.compile(schema);
const errors = [], seen = new Set(), identities = new Map(), queueRefs = [];
for (const [i, r] of records.entries()) {
  const label = r.review_id ?? `record[${i}]`;
  if (!validate(r)) for (const e of validate.errors) errors.push(`${label}${e.instancePath}: ${e.message}${e.params ? ' ' + JSON.stringify(e.params) : ''}`);
  if (seen.has(label)) errors.push(`${label}: duplicate review ID`); seen.add(label);
  const sources = r.literature_snapshot?.sources ?? [], map = new Map(sources.map(s => [s.source_id, s]));
  if (map.size !== sources.length) errors.push(`${label}: duplicate source ID`);
  for (const s of sources) { const id = JSON.stringify([s.title, s.doi, s.pmid, s.year]); if (identities.has(s.source_id) && identities.get(s.source_id) !== id) errors.push(`${label}/${s.source_id}: source identity differs between records`); identities.set(s.source_id, id); }
  const claimIds = new Set();
  for (const c of r.claims ?? []) {
    if (claimIds.has(c.claim_id)) errors.push(`${label}/${c.claim_id}: duplicate claim ID`); claimIds.add(c.claim_id);
    const missing = (c.source_ids ?? []).filter(x => !map.has(x)); if (missing.length) errors.push(`${label}/${c.claim_id}: unresolved source IDs ${missing}`);
    if (c.role === 'DECISION_SUPPORT') {
      const eligible = (c.source_ids ?? []).map(x => map.get(x)).filter(s => s && s.verified === true && s.access === 'FULL_TEXT' && s.prescriptive_support_eligible === true);
      if (!eligible.length) errors.push(`${label}/${c.claim_id}: decisive claim lacks linked verified eligible full text`);
      if (!['WELL_SUPPORTED', 'SUPPORTED_WITH_LIMITS'].includes(c.evidence_status)) errors.push(`${label}/${c.claim_id}: weak claim cannot be decision support`);
    }
  }
  const ae = r.ae_review ?? {};
  if (ae.applicable && JSON.stringify([...new Set((ae.answers ?? []).map(a => a.question_number))].sort((a, b) => a - b)) !== JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])) errors.push(`${label}: AE answers must cover 1..10 exactly once`);
  const t = r.target ?? {}, file = path.resolve(root, t.artifact ?? '');
  if (!file.startsWith(root) || !fs.existsSync(file)) errors.push(`${label}: target is not an existing project file`);
  else if (!t.sha256) errors.push(`${label}: material target hash is required`);
  else if (createHash('sha256').update(fs.readFileSync(file)).digest('hex') !== t.sha256.toLowerCase()) errors.push(`${label}: target hash is stale`);
  if (['APPROVE', 'APPROVE_WITH_CONDITIONS'].includes(r.disposition) && r.scope?.prescriptive_impact) queueRefs.push({record: label, queue_ref: r.human_revalidation?.queue_ref, state: r.human_revalidation?.state, conditions: r.decision?.conditions?.length});
}
console.log(JSON.stringify({passed: !errors.length, records: records.length, dispositions: Object.fromEntries(records.map(r => [r.review_id, r.disposition])), errors, proposedQueueEntries: queueRefs, queueCheck: 'NOT RUN: the queue is append-only and edited by the Chief, not by this reviewer; the entries above are proposed', limits: 'Record consistency only; source truth, applicability and clinical safety require competent review.'}, null, 1));
process.exitCode = errors.length ? 1 : 0;
