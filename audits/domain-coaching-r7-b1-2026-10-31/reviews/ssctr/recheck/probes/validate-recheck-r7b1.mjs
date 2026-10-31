// Node port of .agents/skills/sports-science-review/scripts/validate_records.py for the R7B1-SSCTR-r2 recheck records (no Python interpreter here).
// Read-only. Checks: the decision schema (ajv draft 2020-12 from CoachingCore/node_modules), unique review IDs, revision, source identity, claim
// links, decision-support eligibility (verified, full text, eligible), every source linked from a claim, AE answers 1..10, the target (the
// R7B1-FREEZE-2 record and its hash); the proposed queue array (hq-proposed-recheck.json) against the approving records; and, when the markdown
// exists, that its fenced HQ-R7B1-SSCTR block equals that array and its last line is the gate line. The queue itself is not read or edited.
// Schema validity says nothing about scientific truth.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';

const root = path.resolve(import.meta.dirname, '../../../../../..');
const require = createRequire(path.join(root, 'CoachingCore', 'package.json'));
const Ajv2020 = require('ajv/dist/2020').default;
const schema = JSON.parse(fs.readFileSync(path.join(root, 'governance/agents/sports-science-reviewer/decision.schema.json'), 'utf8'));
const records = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '..', 'SSCTR_RECHECK_R7B1.json'), 'utf8'));
const hq = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'hq-proposed-recheck.json'), 'utf8'));
const ajv = new Ajv2020({allErrors: true, strict: false});
ajv.addFormat('date', /^\d{4}-\d{2}-\d{2}$/);
ajv.addFormat('uri', s => { try { new URL(s); return true; } catch { return false; } });
const validate = ajv.compile(schema);
const errors = [], seen = new Set(), identities = new Map();
for (const [i, r] of records.entries()) {
  const label = r.review_id ?? `record[${i}]`;
  if (!validate(r)) for (const e of validate.errors) errors.push(`${label}${e.instancePath}: ${e.message}`);
  if (seen.has(label)) errors.push(`${label}: duplicate review ID`); seen.add(label);
  if (r.review_revision !== 'R7B1-SSCTR-r2') errors.push(`${label}: revision ${r.review_revision}`);
  if (r.target?.artifact !== 'CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_2.json') errors.push(`${label}: target is not the R7B1-FREEZE-2 record`);
  const sources = r.literature_snapshot?.sources ?? [], map = new Map(sources.map(s => [s.source_id, s]));
  for (const s of sources) { const id = JSON.stringify([s.title, s.doi, s.pmid, s.year]); if (identities.has(s.source_id) && identities.get(s.source_id) !== id) errors.push(`${label}/${s.source_id}: source identity differs`); identities.set(s.source_id, id); }
  const cids = new Set();
  for (const c of r.claims ?? []) {
    if (cids.has(c.claim_id)) errors.push(`${label}/${c.claim_id}: duplicate claim`); cids.add(c.claim_id);
    const missing = (c.source_ids ?? []).filter(x => !map.has(x)); if (missing.length) errors.push(`${label}/${c.claim_id}: unresolved ${missing}`);
    if (c.role === 'DECISION_SUPPORT' && !(c.source_ids ?? []).some(x => map.get(x)?.verified === true && map.get(x)?.access === 'FULL_TEXT' && map.get(x)?.prescriptive_support_eligible === true)) errors.push(`${label}/${c.claim_id}: decisive claim lacks verified eligible full text`);
  }
  for (const s of sources) if (!(r.claims ?? []).some(c => (c.source_ids ?? []).includes(s.source_id))) errors.push(`${label}/${s.source_id}: source not linked from any claim`);
  const ae = r.ae_review ?? {};
  if (ae.applicable && JSON.stringify([...new Set((ae.answers ?? []).map(a => a.question_number))].sort((a, b) => a - b)) !== JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])) errors.push(`${label}: AE answers must cover 1..10`);
  const file = path.resolve(root, r.target?.artifact ?? '');
  if (!fs.existsSync(file)) errors.push(`${label}: target missing`);
  else if (createHash('sha256').update(fs.readFileSync(file)).digest('hex') !== r.target.sha256) errors.push(`${label}: target hash is stale`);
}
const approvals = records.filter(r => ['APPROVE', 'APPROVE_WITH_CONDITIONS'].includes(r.disposition) && r.scope?.prescriptive_impact);
for (const r of approvals) {
  const e = hq.find(x => x.decision_id === r.review_id);
  if (!e) { errors.push(`${r.review_id}: no proposed queue entry`); continue; }
  if (r.human_revalidation.queue_ref !== `reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json#${e.queue_id}`) errors.push(`${r.review_id}: queue_ref differs`);
  if (!/^HQ-R7B1-SSCTR-/.test(e.queue_id)) errors.push(`${r.review_id}: queue id ${e.queue_id}`);
  if (e.decision_revision !== r.review_revision || JSON.stringify(e.target) !== JSON.stringify(r.target) || JSON.stringify(e.conditions) !== JSON.stringify(r.decision.conditions) || JSON.stringify(e.re_review_triggers) !== JSON.stringify(r.expiry.triggers)) errors.push(`${r.review_id}: queue entry differs from the record`);
  if (e.state !== 'QUEUED_FOR_FUNDED_HUMAN_REVALIDATION' || e.human_review !== null || e.owner !== 'Chief / Founder' || !/RUNTIME_FREEZE_R7B1_2/.test(JSON.stringify(e.target))) errors.push(`${r.review_id}: queue entry fields`);
}
if (hq.length !== approvals.length) errors.push('queue array is not one entry per approving record');
const md = path.resolve(import.meta.dirname, '..', 'SSCTR_RECHECK_R7B1.md');
let mdCheck = 'markdown not written yet';
if (fs.existsSync(md)) {
  const text = fs.readFileSync(md, 'utf8'), blocks = [...text.matchAll(/```json\r?\n([\s\S]*?)\r?\n```/g)].map(m => { try { return JSON.parse(m[1]); } catch { return null; } });
  const block = blocks.find(b => Array.isArray(b) && b.length && b.every(e => /^HQ-R7B1-SSCTR-/.test(e?.queue_id)));
  if (!block) errors.push('markdown: no HQ-R7B1-SSCTR block'); else if (JSON.stringify(block) !== JSON.stringify(hq)) errors.push('markdown: queue block differs from hq-proposed-recheck.json');
  const lines = text.replace(/\s+$/, '').split(/\r?\n/), last = lines.at(-1);
  if (!/^R7B1_SSCTR_GATE = (ACCEPT|ACCEPT_WITH_CONDITIONS|BLOCK)$/.test(last)) errors.push('markdown: the last line is not the gate line');
  if (lines.filter(l => /^R7B1_SSCTR_GATE = /.test(l)).length !== 1) errors.push('markdown: more than one gate line');
  mdCheck = {queueBlockEqual: !!block && JSON.stringify(block) === JSON.stringify(hq), lastLine: last};
}
console.log(JSON.stringify({passed: !errors.length, records: records.length, dispositions: Object.fromEntries(records.map(r => [r.review_id, r.disposition])), queueEntries: hq.map(e => e.queue_id), markdown: mdCheck, errors}, null, 1));
process.exitCode = errors.length ? 1 : 0;
