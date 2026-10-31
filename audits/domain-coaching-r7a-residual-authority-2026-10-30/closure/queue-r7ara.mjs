// R7-A formal closure — appends to the single funded-human revalidation queue, insert-only, the items the SSCTR proposed in its narrow
// recheck of R7A-RESIDUAL-AUTHORITY-FREEZE-1 (ESCALATION_AND_HUMAN_REVALIDATION.md: each approved decision with prescriptive impact is
// appended, owner Chief/Founder, human review null). The proposal is read from the SSCTR review commit, not from a copy, and must match
// its recorded hash. Only approvals are queued: the REVISE record R7ARA-SSCTR-CROSS-ENTRY-CAP (NF-R7ARA-1) stays in the backlog (R48).
// Every proposed field is kept verbatim except `owner`, set to the policy's Chief / Founder; the proposed value is recorded. Earlier
// items stay byte-identical; the funding trigger is unchanged. Writes the queue and, once, QUEUE_INTEGRATION_R7ARA.json beside this
// folder. Usage, from the repository root: node audits/domain-coaching-r7a-residual-authority-2026-10-30/closure/queue-r7ara.mjs
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root=execFileSync('git',['rev-parse','--show-toplevel'],{encoding:'utf8'}).trim(),abs=p=>path.join(root,p);
const sha=b=>createHash('sha256').update(b).digest('hex');
const QUEUE='reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json',AUDIT='audits/domain-coaching-r7a-residual-authority-2026-10-30/';
const RECORD=AUDIT+'QUEUE_INTEGRATION_R7ARA.json',R7ASE_RECORD='audits/domain-coaching-r7a-state-evidence-2026-10-28/QUEUE_INTEGRATION_R7ASE.json';
const SOURCE={branch:'review/r7ara-residual-authority-ssctr',commit:'b715dfd763da28b682428dbe38033d6a21ec45b8',file:AUDIT+'reviews/ssctr-recheck/ssctr-r7ara-queue-items.json',sha256:'2d95fa4e3944bb38617157c96f70364eebd354341cd191b369b500bd5727aa55'};
const FREEZE={revision:'R7A-RESIDUAL-AUTHORITY-FREEZE-1',recordSha256:'51e67fb05c5c0997da45366d99bbc44e5defa81405530ac86b85d3e5058379d3'};
const OWNER='Chief / Founder',NOT_QUEUED='R7ARA-SSCTR-CROSS-ENTRY-CAP';
if(fs.existsSync(abs(RECORD)))throw Error('Queue integration already recorded');

const proposalBytes=execFileSync('git',['show',`${SOURCE.commit}:${SOURCE.file}`],{cwd:root});
assert.equal(sha(proposalBytes),SOURCE.sha256,'The SSCTR proposal must be the reviewed bytes');
const proposal=JSON.parse(proposalBytes.toString('utf8'));
assert.equal(proposal.reviewRevision,'R7ARA-SSCTR-r1');
assert.equal(proposal.destination,QUEUE);
assert.equal(proposal.funding_trigger.state,'NOT_DECLARED');

const raw=fs.readFileSync(abs(QUEUE),'utf8'),queue=JSON.parse(raw),beforeSha=sha(Buffer.from(raw,'utf8'));
assert.equal(raw,JSON.stringify(queue,null,2)+'\n','Queue formatting must round-trip so earlier items stay byte-identical');
assert.equal(beforeSha,JSON.parse(fs.readFileSync(abs(R7ASE_RECORD),'utf8')).after.sha256,'The queue must be exactly the one the state evidence closure left');
const bound=JSON.parse(fs.readFileSync(abs(AUDIT+'BASELINE.json'),'utf8')).entries.find(e=>e.path===QUEUE);
assert.equal(beforeSha,bound.sha256,'The queue must be the one the residual authority baseline bound');

const existing=new Set(queue.items.map(i=>i.queue_id)),added=[],owners=[];
for(const item of proposal.items){
 assert.ok(/^HQ-R7ARA-SSCTR-/.test(item.queue_id),'Not an R7ARA SSCTR item: '+item.queue_id);
 assert.ok(!existing.has(item.queue_id),'Duplicate queue id '+item.queue_id);existing.add(item.queue_id);
 assert.notEqual(item.decision_id,NOT_QUEUED,'A REVISE record is not an approval');
 assert.equal(item.decision_revision,'R7ARA-SSCTR-r1');
 assert.equal(item.state,'QUEUED_FOR_FUNDED_HUMAN_REVALIDATION');
 assert.equal(item.human_review,null);
 assert.equal(item.target.artifact_revision,FREEZE.revision);
 assert.equal(item.target.sha256,FREEZE.recordSha256);
 for(const k of ['decision_id','approved_scope','conditions','approval_date','re_review_triggers'])assert.ok(item[k]!==undefined&&item[k]!==null,'Missing '+k+' in '+item.queue_id);
 owners.push({queue_id:item.queue_id,proposed:item.owner});
 added.push({...item,owner:OWNER});
}
assert.equal(added.length,5,'The SSCTR proposed five items');

const n=queue.items.length,earlier=JSON.stringify(queue.items),previousRevision=queue.queue_revision;
queue.items.push(...added);
queue.queue_revision='SSCTR-HRQ-20261031-R7ARA-r1';
queue.r7ara_queue_addendum={revision:'DCR7ARA-HRQ-r1',previousItems:n,addedItems:added.length,r7araItems:added.map(i=>i.queue_id),
 sources:[{branch:SOURCE.branch,commit:SOURCE.commit,file:SOURCE.file,sha256:SOURCE.sha256,items:added.length}],
 unit:'Approved return-ceiling and recheck decisions bound to R7A-RESIDUAL-AUTHORITY-FREEZE-1 and the unchanged policy hash; no generated-workout rows',
 notQueued:{[NOT_QUEUED]:'REVISE / MODIFY_CANDIDATE (NF-R7ARA-1): not an approval; nonblocking policy backlog R48'},
 ownerNormalized:'Every field verbatim from the proposal except owner, set to Chief / Founder as the queue policy requires; the proposed owner is recorded in QUEUE_INTEGRATION_R7ARA.json',
 fundingStateUnchanged:true,authority:'A qualified human may maintain, modify or revoke without AI veto; clinical care never waits for funding'};
assert.equal(JSON.stringify(queue.items.slice(0,n)),earlier);
assert.equal(queue.funding_trigger.state,'NOT_DECLARED');
// Earlier items stay byte-identical: dropping the appended items and the addendum and restoring the revision gives back the exact original bytes.
const after=JSON.stringify(queue,null,2)+'\n',back=JSON.parse(after);back.items=back.items.slice(0,n);back.queue_revision=previousRevision;delete back.r7ara_queue_addendum;
assert.equal(sha(Buffer.from(JSON.stringify(back,null,2)+'\n','utf8')),beforeSha,'Earlier items must stay byte-identical');
fs.writeFileSync(abs(QUEUE),after);
const record={revision:'R7ARA-QUEUE-INTEGRATION-1',date:new Date().toISOString(),queue:QUEUE,
 before:{revision:previousRevision,items:n,sha256:beforeSha},after:{revision:queue.queue_revision,items:queue.items.length,sha256:sha(fs.readFileSync(abs(QUEUE)))},
 source:SOURCE,appended:added.map(i=>({queue_id:i.queue_id,decision_id:i.decision_id,decision_revision:i.decision_revision,target:i.target.artifact_revision,approved_scope:i.approved_scope})),
 ownerNormalization:{queued:OWNER,basis:'governance/agents/sports-science-reviewer/ESCALATION_AND_HUMAN_REVALIDATION.md (Queue and funding trigger); all earlier entries',proposed:owners},
 notQueued:queue.r7ara_queue_addendum.notQueued,earlierItemsByteIdentical:true,fundingStateUnchanged:true};
fs.writeFileSync(abs(RECORD),JSON.stringify(record,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({before:record.before.items,after:record.after.items,appended:record.appended.map(a=>a.queue_id)}));
