import fs from 'node:fs';
import assert from 'node:assert/strict';
import {hash} from '../src/value.mjs';
const root=new URL('../../',import.meta.url),queuePath=new URL('reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json',root),audit=new URL('audits/domain-coaching-r5-2026-10-25/',root),before=new URL('HUMAN_QUEUE_BEFORE.json',audit);
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
if(!fs.existsSync(before))fs.copyFileSync(queuePath,before);
const queue=read(queuePath),original=read(before),proposal=read(new URL('reviews/ssctr-proposed-queue-items.json',audit));
for(const old of original.items)assert.equal(hash(queue.items.find(i=>i.queue_id===old.queue_id)),hash(old),'Historical queue item changed');
for(const item of proposal.items){const existing=queue.items.find(i=>i.queue_id===item.queue_id);if(existing)assert.deepEqual(existing,item);else queue.items.push(item);}
queue.queue_revision='SSCTR-HRQ-20261026-R5-r1';
assert.equal(queue.items.length,original.items.length+4);assert.equal(queue.funding_trigger.state,'NOT_DECLARED');
fs.writeFileSync(queuePath,JSON.stringify(queue,null,2)+'\n');
fs.writeFileSync(new URL('QUEUE_INTEGRATION_R5.json',audit),JSON.stringify({before:original.items.length,added:proposal.items.length,total:queue.items.length,preservedHistoricalItems:true,fundingState:queue.funding_trigger.state,queueItemIds:proposal.items.map(i=>i.queue_id)},null,2)+'\n');
console.log(JSON.stringify({before:original.items.length,added:proposal.items.length,total:queue.items.length}));
