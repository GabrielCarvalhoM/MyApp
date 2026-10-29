import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {hash} from '../src/value.mjs';
const root=path.resolve(import.meta.dirname,'../..'),audit=path.join(root,'audits/domain-closure-r2-2026-10-24');
const queuePath=path.join(root,'reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json');
const baseline=JSON.parse(fs.readFileSync(path.join(audit,'before/HUMAN_REVALIDATION_QUEUE.json')));let raw=fs.readFileSync(queuePath,'utf8'),q=JSON.parse(raw);
const reviewDoc=JSON.parse(fs.readFileSync(path.join(audit,'reviews/ssctr-records.json'))),records=Array.isArray(reviewDoc)?reviewDoc:reviewDoc.records;
const approved=records.filter(r=>r.disposition==='APPROVE_WITH_CONDITIONS');
assert.deepEqual(q.items.slice(0,baseline.items.length),baseline.items,'Historical queue entries may not change');assert.deepEqual(q.funding_trigger,baseline.funding_trigger);
const additions=approved.map(r=>({queue_id:r.human_revalidation.queue_ref.split('#')[1],decision_id:r.review_id,decision_revision:r.review_revision,target:r.target,approved_scope:r.question+' / '+r.population_context.population,conditions:r.decision.conditions,approval_date:r.review_date,state:'QUEUED_FOR_FUNDED_HUMAN_REVALIDATION',owner:'Chief / Founder',human_review:null,re_review_triggers:r.expiry.triggers}));
const newItems=additions.filter(a=>!q.items.some(b=>b.queue_id===a.queue_id));
for(const a of additions){const old=q.items.find(b=>b.queue_id===a.queue_id);if(old){assert.deepEqual({...old,approved_scope:a.approved_scope},a,'Existing R2 queue approval has a material mismatch');if(old.approved_scope!==a.approved_scope){raw=raw.replace(JSON.stringify(old.approved_scope),JSON.stringify(a.approved_scope));old.approved_scope=a.approved_scope;}}}
if(raw!==fs.readFileSync(queuePath,'utf8'))fs.writeFileSync(queuePath,raw);
if(newItems.length){
 const start=raw.indexOf('[',raw.indexOf('"items"'));let close=-1,depth=0,inString=false,escaped=false;
 for(let n=start;n<raw.length;n++){const c=raw[n];if(inString){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')inString=false;continue;}if(c==='"'){inString=true;continue;}if(c==='[')depth++;if(c===']'&&--depth===0){close=n;break;}}
 if(close<0)throw new Error('Queue array boundary not found');
 const prefix=raw.slice(0,close).trimEnd();
 const serial=newItems.map(x=>JSON.stringify(x,null,2).split('\n').map(line=>'    '+line).join('\n')).join(',\n');
 let updated=prefix+',\n'+serial+'\n  '+raw.slice(close);
 updated=updated.replace('"queue_revision": '+JSON.stringify(q.queue_revision),'"queue_revision": "SSCTR-HRQ-20261024-R2-r1"');
 const last=updated.lastIndexOf('}');
 const addendum={revision:'DCR2-HRQ-r1',source:'audits/domain-closure-r2-2026-10-24/reviews/ssctr-records.json',previousItems:baseline.items.length,addedItems:additions.length,abstainedPoliciesNotQueued:records.filter(r=>r.disposition!=='APPROVE_WITH_CONDITIONS').flatMap(r=>r.target.rule_ids),fundingStateUnchanged:true,authority:'Future qualified human can maintain/change/revoke; no agent veto; clinical care never waits for funding'};
 updated=updated.slice(0,last).trimEnd()+',\n  "domain_closure_r2_addendum": '+JSON.stringify(addendum,null,2).split('\n').map((l,n)=>n?'  '+l:l).join('\n')+'\n}\n';
 const result=JSON.parse(updated);assert.equal(result.items.length,baseline.items.length+additions.length);assert.deepEqual(result.items.slice(0,baseline.items.length),baseline.items);assert.deepEqual(result.funding_trigger,baseline.funding_trigger);
 fs.writeFileSync(queuePath,updated);
}
const current=JSON.parse(fs.readFileSync(queuePath));
fs.writeFileSync(path.join(root,'CoachingCore/r2/HUMAN_REVALIDATION_QUEUE_UPDATE.json'),JSON.stringify({revision:'DCR2-HRQ-r1',singleAuthoritativeQueue:path.relative(root,queuePath).replaceAll('\\','/'),baselineItems:baseline.items.length,addedItems:additions.length,totalItems:current.items.length,historicalEntriesIdentical:true,historicalEntriesCanonicalHash:hash(baseline.items),fundingTriggerUnchanged:true,newQueueIds:additions.map(a=>a.queue_id),noAbstentionQueued:true},null,2)+'\n');
console.log(JSON.stringify({preserved:baseline.items.length,added:additions.length,total:current.items.length}));
