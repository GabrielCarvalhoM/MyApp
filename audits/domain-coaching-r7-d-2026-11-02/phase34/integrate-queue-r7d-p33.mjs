// Append-only integration of HQ-R7D-SSCTR-P33-RECHECK into the funded-human revalidation queue, by its authorized owner (Chief / Founder), under the
// Founder's R7-D Phase 3.4 authorization (phase34/AUTHORIZATION_PHASE34.md). The item is the one SSCTR-R7D-P33-RECHECK-r1 proposed
// (phase33/reviews/ssctr/SSCTR_PHASE33_RECHECK_R7D.json, proposedHumanRevalidation.item), unchanged in scientific content. It names the freeze that
// record judged and that bound it: R7D-FREEZE-4 (record CoachingCore/r7/d/RUNTIME_FREEZE_R7D_4.json; reviewed runtime 3228a70; SSCTR CF-P33-01,
// CF-P33-06). The item is bound by that record: its bytes, and its source digest recomputed from the reviewed commit's source files. It states no
// supersession (QE-R7D-P33-06): a later freeze, if one is created, records that it supersedes R7D-FREEZE-4. Only the fields the proposal left to the
// coordinator change: queue_id (without "(proposed)"), the runtime named in target, and owner (normalized). Nothing is deleted or rewritten: the
// existing items and addenda stay byte-identical; one item and one addendum key (r7d_p34_queue_addendum) are added.
//   node integrate-queue-r7d-p33.mjs [--write]
// Without --write it only checks. With --write it appends the item and writes phase34/QUEUE_INTEGRATION_R7D_P34.json.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

const root=path.resolve(import.meta.dirname,'../../..');process.chdir(root);
const AUD='audits/domain-coaching-r7-d-2026-11-02/',Q='reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json';
const SRC=AUD+'phase33/reviews/ssctr/SSCTR_PHASE33_RECHECK_R7D.json',REC='CoachingCore/r7/d/RUNTIME_FREEZE_R7D_4.json',OUT=AUD+'phase34/QUEUE_INTEGRATION_R7D_P34.json',KEY='r7d_p34_queue_addendum';
const FREEZE={revision:'R7D-FREEZE-4',record:REC,recordCommit:'8bbbb8e5dba0774257cd26e46c4a6abaf71202eb',boundCommit:'b2422376b04e444acd64504d9798db47ac0e079a',reviewedRuntime:'3228a705d52aa699747872490a332bc19dc55b25'};
const sha=b=>createHash('sha256').update(b).digest('hex'),git=(...a)=>spawnSync('git',a,{encoding:'buffer',maxBuffer:1<<28});
const problems=[],need=(ok,msg)=>{if(!ok)problems.push(msg);};
const raw=fs.readFileSync(Q,'utf8'),q=JSON.parse(raw);
if(JSON.stringify(q,null,2)+'\n'!==raw)throw Error('Queue serialization differs; refusing to rewrite.');
const recBytes=fs.readFileSync(REC),rec=JSON.parse(recBytes.toString('utf8')),recAtCommit=git('show',`${FREEZE.recordCommit}:${REC}`).stdout;
need(rec.revision===FREEZE.revision&&rec.commit===FREEZE.boundCommit&&rec.reviews?.postReview?.reviewedRuntime===FREEZE.reviewedRuntime,'the R7D-FREEZE-4 record is not the one expected');
need(sha(recAtCommit)===sha(recBytes),'the R7D-FREEZE-4 record differs from its commit');
const {hash}=await import(pathToFileURL(path.join(root,'CoachingCore/src/value.mjs')).href);
const names=git('ls-tree','--name-only',FREEZE.reviewedRuntime,'CoachingCore/src/').stdout.toString('utf8').split('\n').filter(p=>p.endsWith('.mjs')).sort();
const srcFiles=Object.fromEntries(names.map(p=>[p,sha(git('show',`${FREEZE.reviewedRuntime}:${p}`).stdout)])),sourceDigest=hash(srcFiles);
need(sourceDigest===rec.sourceDigest,'the reviewed runtime\'s source digest differs from the R7D-FREEZE-4 record');
const srcBytes=fs.readFileSync(SRC),ss=JSON.parse(srcBytes.toString('utf8')),p=ss.proposedHumanRevalidation;
need(rec.reviews?.ssctr?.path===SRC&&rec.reviews.ssctr.sha256===sha(srcBytes),'the SSCTR record is not the one R7D-FREEZE-4 binds');
need(!!p?.item,'no proposedHumanRevalidation.item in '+SRC);
const e=structuredClone(p.item);
e.queue_id=String(e.queue_id).replace(/\s*\(proposed\)\s*$/,'');
const prior=e.target.runtimeBaseline??null;
e.target={...e.target,artifact:REC,artifact_revision:`${FREEZE.revision} (record ${REC} sha256 ${sha(recBytes)}, record commit ${FREEZE.recordCommit}, bound files ${FREEZE.boundCommit}, reviewed runtime ${FREEZE.reviewedRuntime}, source digest ${sourceDigest}; the runtime this item's SSCTR record judged)`,runtimeBaseline:`${FREEZE.revision} (named by the coordinator; proposal text: ${prior})`};
e.owner='Chief / Founder';
const required=['queue_id','decision_id','decision_revision','target','approved_scope','conditions','approval_date','state','owner','human_review','re_review_triggers'];
for(const k of required)need(k in e,e.queue_id+': missing '+k);
need(e.queue_id==='HQ-R7D-SSCTR-P33-RECHECK','unexpected queue id '+e.queue_id);
need(!q.items.some(i=>i.queue_id===e.queue_id),e.queue_id+': already queued (refusing a duplicate)');
need(q.items.length===234,'expected 234 items before the append, found '+q.items.length);
need(!(KEY in q),'the Phase 3.4 addendum exists already');
need(e.state==='QUEUED_FOR_FUNDED_HUMAN_REVALIDATION'&&e.human_review===null,'state or human_review changed');
need(Array.isArray(e.conditions)&&e.conditions.length>0,'no conditions');
for(const k of Object.keys(p.item))if(!['queue_id','target','owner'].includes(k))need(JSON.stringify(e[k])===JSON.stringify(p.item[k]),e.queue_id+': '+k+' changed');
for(const k of Object.keys(p.item.target))if(!['runtimeBaseline'].includes(k))need(JSON.stringify(e.target[k])===JSON.stringify(p.item.target[k]),e.queue_id+': target.'+k+' changed');
need(q.funding_trigger?.state==='NOT_DECLARED','funding state changed: '+q.funding_trigger?.state);
const before=q.items.length,queueSha256Before=sha(Buffer.from(raw,'utf8'));
const report={revision:'R7D-QUEUE-INTEGRATION-P34-1',owner:'Chief / Founder',founderDecision:'R7-D Phase 3.4 (phase34/AUTHORIZATION_PHASE34.md): integrate the proposed HQ-R7D-SSCTR-P33-RECHECK, found and its origin validated, not duplicated, scientific content preserved, append-only, linked to its freeze; provisional AI revalidation is never funded human validation',
 source:{file:SRC,sha256:sha(srcBytes),recordId:ss.recordId??null,item:p.item.queue_id},freeze:{...FREEZE,recordSha256:sha(recBytes),sourceDigest},previousItems:before,addedItems:1,afterItems:before+1,queueIds:[e.queue_id],queueSha256Before,
 supersedes:'The 234-item view of R7-D Phase 3.3 (phase33/QUEUE_INTEGRATION_R7D_P33.json); earlier pins are preserved, not rewritten',
 note:'A provisional AI SSCTR record is queued for funded qualified-human revalidation; it is not human validation. A qualified human may maintain, modify or revoke it without AI veto.',problems};
if(problems.length){console.log(JSON.stringify(report,null,1));process.exit(1);}
if(process.argv.includes('--write')){
 if(fs.existsSync(OUT))throw Error('integration record exists already: '+OUT);
 q.items.push(e);
 q[KEY]={revision:'DCR7D-HRQ-P34-r1',previousItems:before,addedItems:1,r7dItems:[e.queue_id],sources:[{file:SRC,sha256:sha(srcBytes),recordId:ss.recordId??null}],
  unit:`The SSCTR-proposed R7-D Phase 3.3 recheck item, bound to ${FREEZE.revision}; no generated-workout rows`,
  ownerNormalized:'Every field verbatim from the SSCTR proposal except queue_id (without "(proposed)"), the runtime named in target (left to the coordinator by the proposal) and owner (Chief / Founder, as the queue policy requires)',
  fundingStateUnchanged:true,authority:'A qualified human may maintain, modify or revoke without AI veto; clinical care never waits for funding'};
 const text=JSON.stringify(q,null,2)+'\n';
 // Written whole after the round-trip check above; checked append-only right after, before the integration record exists.
 fs.writeFileSync(Q,text);
 const after=fs.readFileSync(Q,'utf8'),qa=JSON.parse(after),qb=JSON.parse(raw);
 report.queueSha256After=sha(Buffer.from(after,'utf8'));
 report.appendOnly=JSON.stringify(qa.items.slice(0,before))===JSON.stringify(qb.items)&&qa.items.length===before+1&&Object.keys(qb).every(k=>k==='items'||JSON.stringify(qa[k])===JSON.stringify(qb[k]))&&Object.keys(qa).filter(k=>!(k in qb)).join('|')===KEY;
 if(!report.appendOnly)throw Error('append-only check failed after writing');
 fs.writeFileSync(OUT,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
}
console.log(JSON.stringify(report,null,1));
