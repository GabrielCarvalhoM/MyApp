// SSCTR R7ASC-SSCTR-r1 record validator (own; prints only). Declared substitute for .agents/skills/sports-science-review/scripts/
// validate_records.py, because Python and jsonschema are not installed here: Node + ajv 8 (Ajv2020, allErrors) from CoachingCore/node_modules
// with local date and uri formats, and the helper's cross-checks ported one for one (duplicate IDs, source identity across records, claim ->
// source resolution, decisive claims backed by verified eligible full text, AE answers 1..10 exactly once, an existing target with a current
// hash, and the funded-human queue correspondence). Record consistency only: not source truth, applicability or clinical safety.
// Usage: node ssctr-r7asc-validate.mjs <records.json> [--queue <queue.json>]
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const require = createRequire(path.join(ROOT, 'CoachingCore/package.json'));
const Ajv2020 = require('ajv/dist/2020.js').default ?? require('ajv/dist/2020.js');
const ajvVersion = require('ajv/package.json').version;
const load = p => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, ''));
const schema = load(path.join(ROOT, 'governance/agents/sports-science-reviewer/decision.schema.json'));
const ajv = new Ajv2020({allErrors: true, strict: true, strictTypes: false});
ajv.addFormat('date', s => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s + 'T00:00:00Z')) && new Date(s + 'T00:00:00Z').toISOString().slice(0, 10) === s);
ajv.addFormat('uri', s => { try { return /^[a-z][a-z0-9+.-]*:/i.test(s) && !!new URL(s); } catch { return false; } });
const validate = ajv.compile(schema);
const APPROVALS = new Set(['APPROVE', 'APPROVE_WITH_CONDITIONS']), STRONG = new Set(['WELL_SUPPORTED', 'SUPPORTED_WITH_LIMITS']);
const args = process.argv.slice(2), recordsPath = path.resolve(args[0]), qi = args.indexOf('--queue'), queuePath = qi >= 0 ? path.resolve(args[qi + 1]) : null;
const data = load(recordsPath), records = Array.isArray(data) ? data : data.decisions ?? data.records;
const errors = [], seen = new Set(), identities = {};
for (const [i, r] of records.entries()) {
  const label = r.review_id ?? `record[${i}]`;
  if (!validate(r)) for (const e of validate.errors) errors.push(`${label}/${e.instancePath || 'record'}: ${e.message}`);
  if (seen.has(label)) errors.push(`${label}: duplicate review ID`); seen.add(label);
  const sources = r.literature_snapshot?.sources ?? [], map = Object.fromEntries(sources.map(s => [s.source_id, s]));
  if (Object.keys(map).length !== sources.length) errors.push(`${label}: duplicate source ID`);
  for (const s of sources) { const id = JSON.stringify([s.title, s.doi, s.pmid, s.year]); if (identities[s.source_id] && identities[s.source_id] !== id) errors.push(`${label}/${s.source_id}: source identity differs between records`); identities[s.source_id] = id; }
  const cids = new Set();
  for (const c of r.claims ?? []) {
    if (cids.has(c.claim_id)) errors.push(`${label}/${c.claim_id}: duplicate claim ID`); cids.add(c.claim_id);
    const missing = (c.source_ids ?? []).filter(x => !map[x]); if (missing.length) errors.push(`${label}/${c.claim_id}: unresolved source IDs ${missing}`);
    if (c.role === 'DECISION_SUPPORT') {
      if (!(c.source_ids ?? []).some(x => map[x]?.verified === true && map[x]?.access === 'FULL_TEXT' && map[x]?.prescriptive_support_eligible === true)) errors.push(`${label}/${c.claim_id}: decisive claim lacks linked verified eligible full text`);
      if (!STRONG.has(c.evidence_status)) errors.push(`${label}/${c.claim_id}: weak claim cannot be decision support`);
    }
  }
  const ae = r.ae_review ?? {};
  if (ae.applicable) { const q = (ae.answers ?? []).map(a => a.question_number); if (q.length !== 10 || new Set(q).size !== 10 || [...Array(10).keys()].some(n => !q.includes(n + 1))) errors.push(`${label}: AE answers must cover each of questions 1..10 exactly once`); }
  const t = r.target ?? {}, tp = path.resolve(ROOT, t.artifact ?? '');
  if (!tp.startsWith(ROOT) || !fs.existsSync(tp) || !fs.statSync(tp).isFile()) errors.push(`${label}: target is not an existing project file`);
  else if (t.sha256) { if (createHash('sha256').update(fs.readFileSync(tp)).digest('hex') !== t.sha256.toLowerCase()) errors.push(`${label}: target hash is stale`); }
  else errors.push(`${label}: material target hash is required by record protocol`);
}
if (queuePath) {
  const queue = load(queuePath), entries = queue.items ?? [], byId = Object.fromEntries(entries.map(x => [x.queue_id, x]));
  if (Object.keys(byId).length !== entries.length) errors.push('queue: duplicate queue ID');
  const funding = queue.funding_trigger ?? {}, funded = funding.state !== 'NOT_DECLARED';
  if (funded && !(funding.declaration_ref && funding.declared_at)) errors.push('queue: funded trigger lacks Founder declaration provenance');
  const expected = funded ? 'HUMAN_REVALIDATION_REQUIRED' : 'QUEUED_FOR_FUNDED_HUMAN_REVALIDATION', matched = [];
  for (const r of records.filter(r => APPROVALS.has(r.disposition) && r.scope?.prescriptive_impact)) {
    const [p, qid] = (r.human_revalidation?.queue_ref ?? '').split('#');
    if (path.resolve(ROOT, p) !== queuePath || !byId[qid]) { errors.push(`${r.review_id}: missing or unresolved funded-human queue reference`); continue; }
    const e = byId[qid]; matched.push(qid);
    if (e.decision_id !== r.review_id || e.decision_revision !== r.review_revision) errors.push(`${r.review_id}: queue references wrong decision/revision`);
    for (const f of ['artifact', 'artifact_revision', 'sha256', 'rule_ids']) if (JSON.stringify(e.target?.[f]) !== JSON.stringify(r.target[f])) errors.push(`${r.review_id}: queue target mismatch for ${f}`);
    if (JSON.stringify(e.conditions) !== JSON.stringify(r.decision.conditions)) errors.push(`${r.review_id}: queue conditions differ from approval`);
    if (e.state !== expected || r.human_revalidation.state !== expected) errors.push(`${r.review_id}: revalidation state inconsistent with funding declaration`);
    if (e.human_review !== null && e.human_review !== undefined) errors.push(`${r.review_id}: this provisional AI-record validator cannot certify a human review`);
  }
  if (new Set(matched).size !== Object.keys(byId).length || matched.some(m => !byId[m])) errors.push('queue: missing approval or extra entry not linked to a prescriptive approval');
} else if (records.some(r => APPROVALS.has(r.disposition) && r.scope?.prescriptive_impact)) errors.push('--queue is required for prescriptive-impact approvals');
console.log(JSON.stringify({passed: !errors.length, records: records.length, errors, validator: `declared substitute: Node ${process.version} + ajv ${ajvVersion} (Ajv2020, allErrors, strict except the Ajv-only strictTypes lint) with local date/uri formats; cross-checks ported from validate_records.py`, limits: 'Record consistency only; source truth, applicability and clinical safety require competent review.'}, null, 2));
process.exitCode = errors.length ? 1 : 0;
