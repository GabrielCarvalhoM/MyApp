import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {hash} from '../src/value.mjs';

/**
 * Appends to the single funded-human revalidation queue, insert-only, the items the SSCTR proposed in its state evidence regression check:
 * one per approved prescriptive decision, re-bound to STATE-EVIDENCE-FREEZE-1 (node scripts/queue-r7ase.mjs <the re-check's proposal>). An
 * approval stays bounded by its own conditions; a finding outside every approval has no item. Earlier items stay byte-identical; the funding
 * trigger is unchanged. The queue the R7-A boundary integration left is required as the starting point. Writes
 * audits/domain-coaching-r7a-state-evidence-2026-10-28/QUEUE_INTEGRATION_R7ASE.json once.
 */
const root=path.resolve(import.meta.dirname,'../..'),abs=p=>path.join(root,p),sha=p=>createHash('sha256').update(fs.readFileSync(abs(p))).digest('hex');
const QUEUE='reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json',AUDIT='audits/domain-coaching-r7a-state-evidence-2026-10-28/',RECORD=AUDIT+'QUEUE_INTEGRATION_R7ASE.json',R7AB_RECORD='audits/domain-coaching-r7a-boundary-2026-10-28/QUEUE_INTEGRATION_R7AB.json';
const SOURCES=process.argv.slice(2);
assert.ok(SOURCES.length>0&&SOURCES.every(p=>/^audits\/domain-coaching-r7a-state-evidence-2026-10-28\/reviews\/ssctr-r7ase-[a-z-]*queue-items\.json$/.test(p)),'Give the SSCTR queue proposal of this mission (audits/domain-coaching-r7a-state-evidence-2026-10-28/reviews/ssctr-r7ase-…queue-items.json)');
assert.equal(new Set(SOURCES).size,SOURCES.length,'A proposal is given twice');
if(fs.existsSync(abs(RECORD)))throw Error('Queue integration already recorded');
const raw=fs.readFileSync(abs(QUEUE),'utf8'),queue=JSON.parse(raw),beforeSha=sha(QUEUE),r7ab=JSON.parse(fs.readFileSync(abs(R7AB_RECORD),'utf8'));
assert.equal(raw,JSON.stringify(queue,null,2)+'\n','Queue formatting must round-trip so earlier items stay byte-identical');
assert.equal(beforeSha,r7ab.after.sha256,'The queue must be exactly the one the R7-A boundary closure left');
const baseline=JSON.parse(fs.readFileSync(abs(AUDIT+'BASELINE.json'),'utf8')).entries.find(e=>e.path===QUEUE);
assert.equal(beforeSha,baseline.sha256,'The queue must be the one the state evidence baseline bound');
const added=[],sourceOf=new Map();
for(const p of SOURCES){
 const source=JSON.parse(fs.readFileSync(abs(p),'utf8')),items=Array.isArray(source)?source:source.items;
 assert.ok(Array.isArray(items)&&items.length>0,'No SSCTR items to integrate in '+p);
 for(const item of items){added.push(item);sourceOf.set(item.queue_id,{file:p,proposal:source.revision??null,review:source.reviewRevision??null});}
}
const existing=new Set(queue.items.map(i=>i.queue_id));
for(const item of added){assert.ok(/^HQ-R7ASE-/.test(item.queue_id),'Not a state evidence item: '+item.queue_id);assert.ok(!existing.has(item.queue_id),'Duplicate queue id '+item.queue_id);existing.add(item.queue_id);}
const prefix=queue.items.map(i=>hash(i)),previousRevision=queue.queue_revision;
queue.items.push(...added);
queue.queue_revision='SSCTR-HRQ-20261028-R7ASE-r1';
queue.r7ase_queue_addendum={revision:'DCR7ASE-HRQ-r1',previousItems:prefix.length,addedItems:added.length,r7aseItems:added.map(i=>i.queue_id),sources:SOURCES.map(p=>({file:p,items:added.filter(i=>sourceOf.get(i.queue_id).file===p).length})),unit:'Approved return-state decisions re-bound to STATE-EVIDENCE-FREEZE-1 and the unchanged policy hash; a later item refines an earlier one by re-binding the same decision, without replacing it; no generated-workout rows',fundingStateUnchanged:true,authority:'A qualified human may maintain, modify or revoke without AI veto; clinical care never waits for funding'};
assert.deepEqual(queue.items.slice(0,prefix.length).map(i=>hash(i)),prefix);
assert.equal(queue.funding_trigger.state,'NOT_DECLARED');
// Earlier items stay byte-identical: dropping the appended items and the addendum and restoring the revision gives back the exact original bytes.
const after=JSON.stringify(queue,null,2)+'\n',back=JSON.parse(after);back.items=back.items.slice(0,prefix.length);back.queue_revision=previousRevision;delete back.r7ase_queue_addendum;
assert.equal(createHash('sha256').update(JSON.stringify(back,null,2)+'\n').digest('hex'),beforeSha,'Earlier items must stay byte-identical');
fs.writeFileSync(abs(QUEUE),after);
const record={revision:'R7ASE-QUEUE-INTEGRATION-1',date:new Date().toISOString(),queue:QUEUE,before:{revision:previousRevision,items:prefix.length,sha256:beforeSha},after:{revision:queue.queue_revision,items:queue.items.length,sha256:sha(QUEUE)},sources:SOURCES,appended:added.map(i=>({queue_id:i.queue_id,decision_id:i.decision_id??null,decision_revision:i.decision_revision??null,target:i.target?.artifact_revision??null,source:sourceOf.get(i.queue_id).file})),earlierItemsByteIdentical:true,fundingStateUnchanged:true};
fs.writeFileSync(abs(RECORD),JSON.stringify(record,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({before:record.before.items,after:record.after.items,appended:record.appended.map(a=>a.queue_id)}));
