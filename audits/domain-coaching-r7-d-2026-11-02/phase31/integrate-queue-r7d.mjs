// Append-only integration of the SSCTR-proposed R7-D human-revalidation items into the funded-human revalidation queue, by its authorized owner
// (Chief / Founder; the R7-B.1 script, re-bound). Founder D4 (R7-D Phase 3.1): the Phase 3 items, unchanged in scientific content, plus the item the
// Phase 3.1 recheck proposes, each naming R7D-FREEZE-2. The freeze record does not exist yet when this runs (it binds the queue): the items name the
// freeze by its revision, its runtime commit and its source digest, which the freeze script checks.
//   node integrate-queue-r7d.mjs --runtime <commit> [--write] <SSCTR record.json>...
// Without --write it only checks. With --write it appends the items, adds r7d_queue_addendum and writes QUEUE_INTEGRATION_R7D.json. Only the
// fields the proposals left to the coordinator change: queue_id (without "(proposed)"), the runtime the target names, and owner (normalized).
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

const root=path.resolve(import.meta.dirname,'../../..');process.chdir(root);
const A='audits/domain-coaching-r7-d-2026-11-02/phase31/',Q='reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json',FREEZE='R7D-FREEZE-2';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const runtime=arg('--runtime'),sources=process.argv.slice(2).filter((a,i,all)=>a.endsWith('.json')&&all[i-1]!=='--runtime');
if(!runtime||!sources.length)throw Error('usage: --runtime <commit> [--write] <SSCTR record.json>...');
const sha=b=>createHash('sha256').update(b).digest('hex');
const raw=fs.readFileSync(Q,'utf8'),q=JSON.parse(raw);
if(JSON.stringify(q,null,2)+'\n'!==raw)throw Error('Queue serialization differs; refusing to rewrite.');
// The freeze identity: the runtime commit's source bytes and their digest (the digest the freeze record computes, src/value.mjs).
const rev=spawnSync('git',['rev-parse',runtime],{encoding:'utf8'});if(rev.status!==0)throw Error('unknown commit '+runtime);
const commit=rev.stdout.trim(),{hash}=await import(pathToFileURL(path.join(root,'CoachingCore/src/value.mjs')).href);
const names=spawnSync('git',['ls-tree','--name-only',commit,'CoachingCore/src/'],{encoding:'utf8'}).stdout.split('\n').filter(p=>p.endsWith('.mjs')).sort();
const srcFiles=Object.fromEntries(names.map(p=>[p,sha(spawnSync('git',['show',`${commit}:${p}`],{encoding:'buffer',maxBuffer:1<<28}).stdout)]));
const sourceDigest=hash(srcFiles);
const stale=names.filter(p=>srcFiles[p]!==sha(fs.readFileSync(p)));if(stale.length)throw Error('working-tree sources differ from '+commit+': '+stale.join(', '));
const OWNER='Chief / Founder',required=['queue_id','decision_id','decision_revision','target','approved_scope','conditions','approval_date','state','owner','human_review','re_review_triggers'];
const problems=[],existing=new Set(q.items.map(i=>i.queue_id)),entries=[],src=[];
for(const f of sources){
 const bytes=fs.readFileSync(f),rec=JSON.parse(bytes.toString('utf8')),p=rec.proposedHumanRevalidation;
 if(!p?.item){problems.push(f+': no proposedHumanRevalidation.item');continue;}
 src.push({file:f,sha256:sha(bytes),recordId:rec.recordId??null,item:p.item.queue_id});
 const e=structuredClone(p.item);
 e.queue_id=String(e.queue_id).replace(/\s*\(proposed\)\s*$/,'');
 // The runtime the proposal left to the coordinator to name.
 const prior=e.target.runtimeBaseline??null;
 e.target={...e.target,artifact:'CoachingCore/r7/d/RUNTIME_FREEZE_R7D_2.json',artifact_revision:`${FREEZE} (runtime commit ${commit}, source digest ${sourceDigest}; supersedes R7D-FREEZE-1, bytes 4cabd18def76f88d170a90723cef422989f502c7, record 6c03ca8, whose F03-B, DX-02 and F04 source carries into ${FREEZE} unchanged except the Phase 3.1 interruption-persistence delta in r6-adaptation.mjs)`,runtimeBaseline:`${FREEZE} (named by the coordinator; proposal text: ${prior})`};
 e.owner=OWNER;
 for(const k of required)if(!(k in e))problems.push(e.queue_id+': missing '+k);
 if(existing.has(e.queue_id))problems.push(e.queue_id+': already queued');
 if(e.state!=='QUEUED_FOR_FUNDED_HUMAN_REVALIDATION')problems.push(e.queue_id+': state '+e.state);
 if(e.human_review!==null)problems.push(e.queue_id+': human_review not null');
 if(!Array.isArray(e.conditions)||!e.conditions.length)problems.push(e.queue_id+': no conditions');
 // Scientific content unchanged: every field but queue_id, target and owner is the proposal's own.
 for(const k of Object.keys(p.item))if(!['queue_id','target','owner'].includes(k)&&JSON.stringify(e[k])!==JSON.stringify(p.item[k]))problems.push(e.queue_id+': '+k+' changed');
 entries.push(e);
}
if(new Set(entries.map(e=>e.queue_id)).size!==entries.length)problems.push('duplicate queue ids');
if(q.funding_trigger?.state!=='NOT_DECLARED')problems.push('funding state changed: '+q.funding_trigger?.state);
const before=q.items.length;
const report={revision:'R7D-QUEUE-INTEGRATION-1',owner:OWNER,founderDecision:'D4 (R7-D Phase 3.1): append the Phase 3 SSCTR-proposed items through the authorized owner, unchanged in scientific content',sources:src,freeze:{revision:FREEZE,runtimeCommit:commit,sourceDigest,record:'CoachingCore/r7/d/RUNTIME_FREEZE_R7D_2.json (written after this append; it binds this record and the queue bytes)'},previousItems:before,addedItems:entries.length,afterItems:before+entries.length,queueIds:entries.map(e=>e.queue_id),pointToFreeze2:entries.map(e=>e.queue_id),supersedes:'The 230-item view of the R7-B.1 closure (QUEUE_INTEGRATION_R7B1.json); earlier pins are preserved, not rewritten',problems};
if(problems.length){console.log(JSON.stringify(report,null,1));process.exit(1);}
if(process.argv.includes('--write')){
 for(const e of entries)q.items.push(e);
 q.r7d_queue_addendum={revision:'DCR7D-HRQ-r1',previousItems:before,addedItems:entries.length,r7dItems:entries.map(e=>e.queue_id),sources:src.map(({file,sha256,recordId})=>({file,sha256,recordId})),
  unit:`SSCTR-proposed R7-D items (F03-B rule; Phase 3 recheck; Phase 3.1 recheck), bound to ${FREEZE}; no generated-workout rows`,
  ownerNormalized:'Every field verbatim from the SSCTR proposals except queue_id (without "(proposed)"), the runtime named in target (left to the coordinator by the proposals) and owner (Chief / Founder, as the queue policy requires)',
  fundingStateUnchanged:true,authority:'A qualified human may maintain, modify or revoke without AI veto; clinical care never waits for funding'};
 fs.writeFileSync(Q,JSON.stringify(q,null,2)+'\n');
 report.queueSha256After=sha(fs.readFileSync(Q));
 fs.writeFileSync(A+'QUEUE_INTEGRATION_R7D.json',JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify(report,null,1));
