// Append-only integration of HQ-R7D-SSCTR-P32-RECHECK into the funded-human revalidation queue, by its authorized owner (Chief / Founder), under the
// Founder's R7-D Phase 3.3 authorization (phase33/AUTHORIZATION_PHASE33.md). The item is the one SSCTR-R7D-P32-RECHECK-r1 proposed
// (phase32/reviews/ssctr/SSCTR_PHASE32_RECHECK_R7D.json, proposedHumanRevalidation.item), unchanged in scientific content. It names the freeze that
// record judged and that bound it: R7D-FREEZE-3 (record CoachingCore/r7/d/RUNTIME_FREEZE_R7D_3.json; reviewed runtime dfd8779; SSCTR CF-P32-08).
// The working tree's runtime is no longer R7D-FREEZE-3, so the item is bound by that record: its bytes, and its source digest recomputed from the
// reviewed commit's source files. Only the fields the proposal left to the coordinator change: queue_id (without "(proposed)"), the runtime named in
// target, and owner (normalized). Nothing is deleted or rewritten: the existing items and addenda stay byte-identical; one item and one addendum key
// (r7d_p33_queue_addendum) are added.
//   node integrate-queue-r7d-p32.mjs [--write]
// Without --write it only checks. With --write it appends the item and writes phase33/QUEUE_INTEGRATION_R7D_P33.json.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

const root=path.resolve(import.meta.dirname,'../../..');process.chdir(root);
const AUD='audits/domain-coaching-r7-d-2026-11-02/',Q='reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json';
const SRC=AUD+'phase32/reviews/ssctr/SSCTR_PHASE32_RECHECK_R7D.json',REC='CoachingCore/r7/d/RUNTIME_FREEZE_R7D_3.json',OUT=AUD+'phase33/QUEUE_INTEGRATION_R7D_P33.json';
const FREEZE={revision:'R7D-FREEZE-3',record:REC,recordCommit:'c938b5301c643579c61369b5b39842506a940d60',boundCommit:'aeafc833745fec8bf2d41c1aa0a4dce511d52777',reviewedRuntime:'dfd87791e9ba995332696ed93cbc2b34529932a7'};
const sha=b=>createHash('sha256').update(b).digest('hex'),git=(...a)=>spawnSync('git',a,{encoding:'buffer',maxBuffer:1<<28});
const problems=[],need=(ok,msg)=>{if(!ok)problems.push(msg);};
const raw=fs.readFileSync(Q,'utf8'),q=JSON.parse(raw);
if(JSON.stringify(q,null,2)+'\n'!==raw)throw Error('Queue serialization differs; refusing to rewrite.');
// The freeze the item names: its record as committed, and its source digest recomputed from the reviewed runtime's source bytes.
const recBytes=fs.readFileSync(REC),rec=JSON.parse(recBytes.toString('utf8')),recAtCommit=git('show',`${FREEZE.recordCommit}:${REC}`).stdout;
need(rec.revision===FREEZE.revision&&rec.commit===FREEZE.boundCommit&&rec.reviews?.postReview?.reviewedRuntime===FREEZE.reviewedRuntime,'the R7D-FREEZE-3 record is not the one expected');
need(sha(recAtCommit)===sha(recBytes),'the R7D-FREEZE-3 record differs from its commit');
const {hash}=await import(pathToFileURL(path.join(root,'CoachingCore/src/value.mjs')).href);
const names=git('ls-tree','--name-only',FREEZE.reviewedRuntime,'CoachingCore/src/').stdout.toString('utf8').split('\n').filter(p=>p.endsWith('.mjs')).sort();
const srcFiles=Object.fromEntries(names.map(p=>[p,sha(git('show',`${FREEZE.reviewedRuntime}:${p}`).stdout)])),sourceDigest=hash(srcFiles);
need(sourceDigest===rec.sourceDigest,'the reviewed runtime\'s source digest differs from the R7D-FREEZE-3 record');
// The proposal, and the SSCTR record bound by R7D-FREEZE-3.
const srcBytes=fs.readFileSync(SRC),ss=JSON.parse(srcBytes.toString('utf8')),p=ss.proposedHumanRevalidation;
need(rec.reviews?.ssctr?.path===SRC&&rec.reviews.ssctr.sha256===sha(srcBytes),'the SSCTR record is not the one R7D-FREEZE-3 binds');
need(!!p?.item,'no proposedHumanRevalidation.item in '+SRC);
const e=structuredClone(p.item);
e.queue_id=String(e.queue_id).replace(/\s*\(proposed\)\s*$/,'');
const prior=e.target.runtimeBaseline??null;
e.target={...e.target,artifact:REC,artifact_revision:`${FREEZE.revision} (record ${REC} sha256 ${sha(recBytes)}, record commit ${FREEZE.recordCommit}, bound files ${FREEZE.boundCommit}, reviewed runtime ${FREEZE.reviewedRuntime}, source digest ${sourceDigest}; superseded by R7D-FREEZE-4 in R7-D Phase 3.3, which changes r6-adaptation.mjs only, for SSCTR-P32-F01)`,runtimeBaseline:`${FREEZE.revision} (named by the coordinator; proposal text: ${prior})`};
e.owner='Chief / Founder';
const required=['queue_id','decision_id','decision_revision','target','approved_scope','conditions','approval_date','state','owner','human_review','re_review_triggers'];
for(const k of required)need(k in e,e.queue_id+': missing '+k);
need(e.queue_id==='HQ-R7D-SSCTR-P32-RECHECK','unexpected queue id '+e.queue_id);
need(!q.items.some(i=>i.queue_id===e.queue_id),e.queue_id+': already queued (refusing a duplicate)');
need(q.items.length===233,'expected 233 items before the append, found '+q.items.length);
need(!('r7d_p33_queue_addendum' in q),'the Phase 3.3 addendum exists already');
need(e.state==='QUEUED_FOR_FUNDED_HUMAN_REVALIDATION'&&e.human_review===null,'state or human_review changed');
need(Array.isArray(e.conditions)&&e.conditions.length>0,'no conditions');
// Scientific content unchanged: every field but queue_id, target and owner is the proposal's own; inside target, only the runtime fields.
for(const k of Object.keys(p.item))if(!['queue_id','target','owner'].includes(k))need(JSON.stringify(e[k])===JSON.stringify(p.item[k]),e.queue_id+': '+k+' changed');
for(const k of Object.keys(p.item.target))if(!['runtimeBaseline'].includes(k))need(JSON.stringify(e.target[k])===JSON.stringify(p.item.target[k]),e.queue_id+': target.'+k+' changed');
need(q.funding_trigger?.state==='NOT_DECLARED','funding state changed: '+q.funding_trigger?.state);
const before=q.items.length,queueSha256Before=sha(Buffer.from(raw,'utf8'));
const report={revision:'R7D-QUEUE-INTEGRATION-P33-1',owner:'Chief / Founder',founderDecision:'R7-D Phase 3.3 (phase33/AUTHORIZATION_PHASE33.md): integrate the proposed HQ-R7D-SSCTR-P32-RECHECK, checked for duplicates, every earlier item preserved, scientific content unchanged, bound to the verified review and freeze; provisional AI revalidation is never funded human validation',
 source:{file:SRC,sha256:sha(srcBytes),recordId:ss.recordId??null,item:p.item.queue_id},freeze:{...FREEZE,recordSha256:sha(recBytes),sourceDigest},previousItems:before,addedItems:1,afterItems:before+1,queueIds:[e.queue_id],queueSha256Before,
 supersedes:'The 233-item view of R7-D Phase 3.1 (phase31/QUEUE_INTEGRATION_R7D.json); earlier pins are preserved, not rewritten',
 note:'A provisional AI SSCTR record is queued for funded qualified-human revalidation; it is not human validation. A qualified human may maintain, modify or revoke it without AI veto.',problems};
if(problems.length){console.log(JSON.stringify(report,null,1));process.exit(1);}
if(process.argv.includes('--write')){
 if(fs.existsSync(OUT))throw Error('integration record exists already: '+OUT);
 q.items.push(e);
 q.r7d_p33_queue_addendum={revision:'DCR7D-HRQ-P33-r1',previousItems:before,addedItems:1,r7dItems:[e.queue_id],sources:[{file:SRC,sha256:sha(srcBytes),recordId:ss.recordId??null}],
  unit:`The SSCTR-proposed R7-D Phase 3.2 recheck item, bound to ${FREEZE.revision}; no generated-workout rows`,
  ownerNormalized:'Every field verbatim from the SSCTR proposal except queue_id (without "(proposed)"), the runtime named in target (left to the coordinator by the proposal) and owner (Chief / Founder, as the queue policy requires)',
  fundingStateUnchanged:true,authority:'A qualified human may maintain, modify or revoke without AI veto; clinical care never waits for funding'};
 fs.writeFileSync(Q,JSON.stringify(q,null,2)+'\n');
 const after=fs.readFileSync(Q,'utf8'),qa=JSON.parse(after);
 report.queueSha256After=sha(Buffer.from(after,'utf8'));
 report.appendOnly=JSON.stringify(qa.items.slice(0,before))===JSON.stringify(JSON.parse(raw).items)&&Object.keys(JSON.parse(raw)).every(k=>k==='items'||JSON.stringify(qa[k])===JSON.stringify(JSON.parse(raw)[k]));
 if(!report.appendOnly)throw Error('append-only check failed after writing');
 fs.writeFileSync(OUT,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
}
console.log(JSON.stringify(report,null,1));
