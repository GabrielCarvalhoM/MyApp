// Append-only integration of the SSCTR-approved R7-B.1 decisions into the funded-human revalidation queue (the R7-B script, re-bound).
// Usage: node integrate-queue-r7b1.mjs <reviews/...md holding the JSON block> [--write]
// Without --write it only checks. With --write it appends the entries verbatim (owner normalized to the queue policy value if needed), adds
// r7b1_queue_addendum and writes QUEUE_INTEGRATION_R7B1.json. Entries must target the R7B1-FREEZE-1 record; REVISE or REJECT records are never queued.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

const root = path.resolve(import.meta.dirname, '../..');
process.chdir(root);
const A = 'audits/domain-coaching-r7-b1-2026-10-31/';
const Q = 'reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json';
const FREEZE = 'CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_1.json';
const src = process.argv[2];
if (!src) throw Error('Pass the reviews markdown that holds the queue JSON block.');
const sha = b => createHash('sha256').update(b).digest('hex');
const raw = fs.readFileSync(Q, 'utf8'), q = JSON.parse(raw);
if (JSON.stringify(q, null, 2) + '\n' !== raw) throw Error('Queue serialization differs; refusing to rewrite.');
const freezeSha = sha(fs.readFileSync(FREEZE)), freeze = JSON.parse(fs.readFileSync(FREEZE, 'utf8'));
const md = fs.readFileSync(src, 'utf8');
const blocks = [...md.matchAll(/```json\r?\n([\s\S]*?)\r?\n```/g)].map(m => { try { return JSON.parse(m[1]); } catch { return null; } });
const entries = blocks.find(b => Array.isArray(b) && b.length && b.every(e => /^HQ-R7B1-SSCTR-/.test(e?.queue_id)));
if (!entries) throw Error('No HQ-R7B1-SSCTR queue block found in ' + src);
const OWNER = 'Chief / Founder', required = ['queue_id', 'decision_id', 'decision_revision', 'target', 'approved_scope', 'conditions', 'approval_date', 'state', 'owner', 'human_review', 're_review_triggers'];
const problems = [], existing = new Set(q.items.map(i => i.queue_id)), ownersProposed = {};
for (const e of entries) {
  for (const k of required) if (!(k in e)) problems.push(e.queue_id + ': missing ' + k);
  if (existing.has(e.queue_id)) problems.push(e.queue_id + ': already queued');
  if (e.state !== 'QUEUED_FOR_FUNDED_HUMAN_REVALIDATION') problems.push(e.queue_id + ': state ' + e.state);
  if (e.human_review !== null) problems.push(e.queue_id + ': human_review not null');
  if (!Array.isArray(e.conditions) || !e.conditions.length) problems.push(e.queue_id + ': no conditions');
  const t = JSON.stringify(e.target ?? {});
  if (!t.includes(freeze.sourceDigest) && !t.includes(freezeSha) && !t.includes('RUNTIME_FREEZE_R7B1_1')) problems.push(e.queue_id + ': target is not the R7B1-FREEZE-1 record');
  if (e.owner !== OWNER) ownersProposed[e.queue_id] = e.owner;
}
if (new Set(entries.map(e => e.queue_id)).size !== entries.length) problems.push('duplicate queue ids in the block');
if (q.funding_trigger?.state !== 'NOT_DECLARED') problems.push('funding state changed: ' + q.funding_trigger?.state);
const before = q.items.length;
const report = {revision: 'R7B1-QUEUE-INTEGRATION-1', source: {file: src, sha256: sha(Buffer.from(md, 'utf8')), items: entries.length}, freeze: {record: FREEZE, sha256: freezeSha, sourceDigest: freeze.sourceDigest}, previousItems: before, addedItems: entries.length, afterItems: before + entries.length, queueIds: entries.map(e => e.queue_id), ownersProposedBeforeNormalization: ownersProposed, supersedes: 'The 223-item view of the R7-B closure (QUEUE_INTEGRATION_R7B.json); earlier pins are preserved, not rewritten', problems};
if (problems.length) { console.log(JSON.stringify(report, null, 1)); process.exit(1); }
if (process.argv.includes('--write')) {
  for (const e of entries) q.items.push({...e, owner: OWNER});
  q.r7b1_queue_addendum = {
    revision: 'DCR7B1-HRQ-r1',
    previousItems: before,
    addedItems: entries.length,
    r7b1Items: entries.map(e => e.queue_id),
    sources: [{file: src, sha256: report.source.sha256, items: entries.length}],
    unit: 'SSCTR-approved R7-B.1 decisions (revision R7B1-SSCTR-r1), bound to R7B1-FREEZE-1; no generated-workout rows',
    notQueued: {'REVISE or REJECT records': 'Not approvals; never queued', 'R7-B records': 'Their queued r2 entries stay as they are; R7-B.1 records supersede them only where they say so'},
    ownerNormalized: 'Every field verbatim from the SSCTR block except owner, set to Chief / Founder as the queue policy requires; proposed owners are recorded in QUEUE_INTEGRATION_R7B1.json',
    fundingStateUnchanged: true,
    authority: 'A qualified human may maintain, modify or revoke without AI veto; clinical care never waits for funding'
  };
  fs.writeFileSync(Q, JSON.stringify(q, null, 2) + '\n');
  report.queueSha256After = sha(fs.readFileSync(Q));
  fs.writeFileSync(A + 'QUEUE_INTEGRATION_R7B1.json', JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify(report, null, 1));
