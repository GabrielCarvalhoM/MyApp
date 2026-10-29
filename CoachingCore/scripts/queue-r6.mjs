import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {hash} from '../src/value.mjs';

/**
 * Appends to the single funded-human revalidation queue, insert-only: the three OB-2 items prepared before R6 opened
 * (verbatim) and the reusable R6 envelope approvals proposed by the SSCTR's final round (one per approved boundary). Earlier items stay byte-identical; the
 * funding trigger is unchanged. Writes audits/domain-coaching-r6-2026-10-26/QUEUE_INTEGRATION_R6.json once.
 */
const root=path.resolve(import.meta.dirname,'../..'),abs=p=>path.join(root,p),sha=p=>createHash('sha256').update(fs.readFileSync(abs(p))).digest('hex');
const QUEUE='reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json',OB2='audits/new-figma-onboarding-v2-2026-10-25/QUEUE_ADDITIONS_PROPOSED.json',SSCTR='audits/domain-coaching-r6-2026-10-26/reviews/ssctr-proposed-queue-items.json',RECORD='audits/domain-coaching-r6-2026-10-26/QUEUE_INTEGRATION_R6.json';
if(fs.existsSync(abs(RECORD)))throw Error('Queue integration already recorded');
const raw=fs.readFileSync(abs(QUEUE),'utf8'),queue=JSON.parse(raw),beforeSha=sha(QUEUE);
assert.equal(raw,JSON.stringify(queue,null,2)+'\n','Queue formatting must round-trip so earlier items stay byte-identical');
const ob2=JSON.parse(fs.readFileSync(abs(OB2),'utf8')),ssctr=JSON.parse(fs.readFileSync(abs(SSCTR),'utf8'));
assert.equal(ob2.queue_at_preparation.items,queue.items.length,'OB-2 items were prepared against this queue length');
assert.equal(ob2.queue_at_preparation.sha256,beforeSha,'OB-2 items were prepared against this exact queue');
const existing=new Set(queue.items.map(i=>i.queue_id)),added=[...ob2.items,...ssctr.items];
for(const item of added)assert.ok(!existing.has(item.queue_id),'Duplicate queue id '+item.queue_id);
const prefix=queue.items.map(i=>hash(i));
queue.items.push(...added);
queue.queue_revision='SSCTR-HRQ-20261026-R6-r1';
queue.r6_queue_addendum={revision:'DCR6-HRQ-r1',previousItems:prefix.length,addedItems:added.length,ob2Items:ob2.items.map(i=>i.queue_id),r6Items:ssctr.items.map(i=>i.queue_id),sources:{ob2:OB2,r6:SSCTR},unit:'Reusable approved envelope bound to a policy hash; no generated-workout rows',fundingStateUnchanged:true,authority:'A qualified human may maintain, modify or revoke without AI veto; clinical care never waits for funding'};
assert.deepEqual(queue.items.slice(0,prefix.length).map(i=>hash(i)),prefix);
assert.equal(queue.funding_trigger.state,'NOT_DECLARED');
// Earlier items stay byte-identical: dropping the appended items and the addendum and restoring the revision must give back the exact
// original bytes. queue_revision precedes items in the file, so a byte-prefix test cannot express this. Checked before anything is written.
const after=JSON.stringify(queue,null,2)+'\n',back=JSON.parse(after);back.items=back.items.slice(0,prefix.length);back.queue_revision=JSON.parse(raw).queue_revision;delete back.r6_queue_addendum;
assert.equal(createHash('sha256').update(JSON.stringify(back,null,2)+'\n').digest('hex'),beforeSha,'Earlier items must stay byte-identical');
fs.writeFileSync(abs(QUEUE),after);
const record={revision:'R6-QUEUE-INTEGRATION-1',date:new Date().toISOString(),queue:QUEUE,before:{revision:'SSCTR-HRQ-20261026-R5-r1',items:prefix.length,sha256:beforeSha},after:{revision:queue.queue_revision,items:queue.items.length,sha256:sha(QUEUE)},appended:added.map(i=>({queue_id:i.queue_id,decision_id:i.decision_id,source:ob2.items.includes(i)?OB2:SSCTR})),earlierItemsByteIdentical:true,fundingTrigger:queue.funding_trigger.state,supersedes:'R5 verify asserts exactly 114 items; superseded by CoachingCore/r6/CONFORMANCE_SUPERSESSION_R6.md'};
fs.writeFileSync(abs(RECORD),JSON.stringify(record,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({before:record.before.items,after:record.after.items,appended:record.appended.length}));
