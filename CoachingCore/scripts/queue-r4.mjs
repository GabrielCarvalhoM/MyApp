import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {hash} from '../src/value.mjs';
const root=path.resolve(import.meta.dirname,'../..'),audit=path.join(root,'audits/domain-closure-r4-2026-10-25');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const dest=path.join(root,'reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json');
const before=read(path.join(audit,'before/reviews__provisional-sports-science__2026-10-23__HUMAN_REVALIDATION_QUEUE.json'));
const proposal=read(path.join(audit,'reviews/ssctr-proposed-queue-items.json')),q=read(dest),authority=read(path.join(audit,'reviews/ssctr-envelope-review.json'));
assert.equal(before.items.length,101);assert.deepEqual(q.items.slice(0,101),before.items);
for(const item of proposal.items){
 const id=item.target.rule_ids[0],a=authority.records.find(r=>r.envelopeId===id);
 assert.ok(a?.independent&&a.disposition==='APPROVE_WITH_CONDITIONS');
 assert.equal(item.decision_id,a.reviewId);
 const existing=q.items.find(x=>x.queue_id===item.queue_id);
 if(existing)assert.deepEqual(existing,item,'Existing R4 item differs; preserve history and record supersession instead of overwriting');else q.items.push(item);
}
q.queue_revision='SSCTR-HRQ-20261025-R4-r1';
q.r4_queue_semantics={revision:'DCR4-QUEUE-1',unit:'Reusable material approved envelope/rule and scientific revision',generatedInstances:'Referenced by decision traces; no new queue item inside unchanged approved boundaries',materialChanges:'Fresh independent review and history-preserving supersession or new revision; no silent overwrite',priorItems:'All 101 prior entries byte-equivalent as JSON objects; earlier exact-output semantics retained as historical scope',funding:'Existing Founder-declared trigger only; NOT_DECLARED remains unchanged',humanAuthority:'Qualified human may maintain/modify/revoke without AI veto; no clinical dependency waits for funding'};
assert.deepEqual(q.funding_trigger,before.funding_trigger);assert.equal(q.items.length,110);
write(dest,q);
write(path.join(root,'CoachingCore/r4/HUMAN_REVALIDATION_QUEUE_UPDATE_R4.json'),{revision:'DCR4-QUEUE-UPDATE-1',singleQueue:'reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json',before:101,added:proposal.items.length,total:q.items.length,preservedPrefixHash:hash(before.items),currentPrefixHash:hash(q.items.slice(0,101)),newDecisionIds:proposal.items.map(x=>x.decision_id),fundingTrigger:q.funding_trigger,semantics:q.r4_queue_semantics});
console.log(JSON.stringify({preserved:101,added:9,total:110,funding:q.funding_trigger.state}));
