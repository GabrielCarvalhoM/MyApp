import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {hash} from '../src/value.mjs';

/**
 * Appends to the single funded-human revalidation queue, insert-only: the R7-A items the SSCTR's single narrow re-check proposed (one per
 * approved prescriptive decision, bound to the freeze it rests on). Earlier items stay byte-identical; the funding trigger is unchanged.
 * The queue pin in the closed R6 verifier (127 items) is superseded by this append and recorded, never rewritten.
 * Writes audits/domain-coaching-r7a-2026-10-27/QUEUE_INTEGRATION_R7A.json once.
 */
const root=path.resolve(import.meta.dirname,'../..'),abs=p=>path.join(root,p),sha=p=>createHash('sha256').update(fs.readFileSync(abs(p))).digest('hex');
const QUEUE='reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json',AUDIT='audits/domain-coaching-r7a-2026-10-27/',SSCTR=AUDIT+'reviews/ssctr-r7a-recheck-queue-items.json',RECORD=AUDIT+'QUEUE_INTEGRATION_R7A.json',R6_RECORD='audits/domain-coaching-r6-2026-10-26/QUEUE_INTEGRATION_R6.json';
if(fs.existsSync(abs(RECORD)))throw Error('Queue integration already recorded');
const raw=fs.readFileSync(abs(QUEUE),'utf8'),queue=JSON.parse(raw),beforeSha=sha(QUEUE),r6=JSON.parse(fs.readFileSync(abs(R6_RECORD),'utf8'));
assert.equal(raw,JSON.stringify(queue,null,2)+'\n','Queue formatting must round-trip so earlier items stay byte-identical');
assert.equal(beforeSha,r6.after.sha256,'The queue must be exactly the one R6 left');
const baseline=JSON.parse(fs.readFileSync(abs(AUDIT+'BASELINE.json'),'utf8')).entries.find(e=>e.path===QUEUE);
assert.equal(beforeSha,baseline.sha256,'The queue must be the one the R7-A baseline bound');
const source=JSON.parse(fs.readFileSync(abs(SSCTR),'utf8')),added=Array.isArray(source)?source:source.items;
assert.ok(Array.isArray(added)&&added.length>0,'No SSCTR items to integrate');
const existing=new Set(queue.items.map(i=>i.queue_id));
for(const item of added){assert.ok(/^HQ-R7A-/.test(item.queue_id),'Not an R7-A item: '+item.queue_id);assert.ok(!existing.has(item.queue_id),'Duplicate queue id '+item.queue_id);existing.add(item.queue_id);}
const prefix=queue.items.map(i=>hash(i)),previousRevision=queue.queue_revision;
queue.items.push(...added);
queue.queue_revision='SSCTR-HRQ-20261027-R7A-r1';
queue.r7a_queue_addendum={revision:'DCR7A-HRQ-r1',previousItems:prefix.length,addedItems:added.length,r7aItems:added.map(i=>i.queue_id),sources:{r7a:SSCTR},unit:'Approved runtime-composition decisions bound to a freeze and the unchanged policy hash; no generated-workout rows',fundingStateUnchanged:true,supersedes:{record:R6_RECORD,pinnedItems:r6.after.items,pinnedSha256:r6.after.sha256,note:'The closed R6 verifier pins the queue R6 left; this append supersedes that pin without changing any earlier item. The R6 record and verifier are not rewritten.'},authority:'A qualified human may maintain, modify or revoke without AI veto; clinical care never waits for funding'};
assert.deepEqual(queue.items.slice(0,prefix.length).map(i=>hash(i)),prefix);
assert.equal(queue.funding_trigger.state,'NOT_DECLARED');
// Earlier items stay byte-identical: dropping the appended items and the addendum and restoring the revision gives back the exact
// original bytes (queue_revision precedes items, so a byte-prefix test cannot express it). Checked before anything is written.
const after=JSON.stringify(queue,null,2)+'\n',back=JSON.parse(after);back.items=back.items.slice(0,prefix.length);back.queue_revision=previousRevision;delete back.r7a_queue_addendum;
assert.equal(createHash('sha256').update(JSON.stringify(back,null,2)+'\n').digest('hex'),beforeSha,'Earlier items must stay byte-identical');
fs.writeFileSync(abs(QUEUE),after);
const record={revision:'R7A-QUEUE-INTEGRATION-1',date:new Date().toISOString(),queue:QUEUE,before:{revision:previousRevision,items:prefix.length,sha256:beforeSha},after:{revision:queue.queue_revision,items:queue.items.length,sha256:sha(QUEUE)},appended:added.map(i=>({queue_id:i.queue_id,decision_id:i.decision_id??null,target:i.target?.artifact_revision??null,source:SSCTR})),earlierItemsByteIdentical:true,fundingStateUnchanged:true,supersedesR6Pin:{record:R6_RECORD,items:r6.after.items,sha256:r6.after.sha256}};
fs.writeFileSync(abs(RECORD),JSON.stringify(record,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({before:record.before.items,after:record.after.items,appended:record.appended.map(a=>a.queue_id)}));
