// SSCTR R7ASE-SSCTR-r1 holdout detail probe (own; prints only). For the two R6 holdout cases whose outputs changed (R6-H17, R6-H26), the sporting
// detail on both runtimes (the byte-exact R7A-BOUNDARY-FINAL-FREEZE copy, assembled in the OS temp dir and removed; and the live tree,
// STATE-EVIDENCE-FREEZE-1): per step, the run sessions (role, family, minutes) and strength rows of every week of the proposal from the week the
// case last reported to two weeks after the return, the return's entry (run state and strength states), and the facts the case reported.
// Read-only runtime use; synthetic data; DEV_TEST_ONLY authority. Usage: node ssctr-r7ase-holdout-detail.mjs > out.json
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {createHash} from 'node:crypto';import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'../../..'),sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const snap='audits/domain-coaching-r7a-state-evidence-2026-10-28/boundary-freeze-source',manifest=JSON.parse(fs.readFileSync(path.join(root,snap,'MANIFEST.json'),'utf8'));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ssctr-r7ase-hd-'));const put=(from,to)=>{fs.mkdirSync(path.dirname(path.join(tmp,to)),{recursive:true});fs.copyFileSync(from,path.join(tmp,to));};
const out={probe:'R7ASE-SSCTR-r1-HOLDOUT-DETAIL',at:new Date().toISOString()};
try{
 for(const [rel,d] of Object.entries(manifest.files)){if(sha(path.join(root,snap,rel))!==d)throw Error('drift '+rel);put(path.join(root,snap,rel),rel);}
 for(const p of ['CoachingCore/scripts/evaluate-holdout-r6.mjs','CoachingCore/scripts/simulate-r6.mjs','CoachingCore/r5/PROGRAM_POLICY_R5.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json','audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json'])if(!manifest.files[p]&&fs.existsSync(path.join(root,p)))put(path.join(root,p),p);
 const load=(base,rel)=>import(pathToFileURL(path.join(base,rel)).href),rt={};
 for(const [name,base] of [['boundary',tmp],['stateEvidence',root]]){const ev=await load(base,'CoachingCore/scripts/evaluate-holdout-r6.mjs'),dev=await load(base,'CoachingCore/r6/fixtures/dev-authority.mjs');rt[name]={ev:ev.evaluateHoldoutCase,authority:dev.devAuthority()};}
 const cases=JSON.parse(fs.readFileSync(path.join(root,'CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json'),'utf8')).cases.filter(c=>['R6-H17','R6-H26'].includes(c.caseId));
 const live=s=>s.prescription&&s.status!=='SKIPPED';
 const weekText=w=>({index:w.index,phase:w.phase,start:w.startDate,run:w.sessions.filter(s=>live(s)&&s.sport==='RUN').map(s=>`${s.date} ${s.role} ${s.prescription.family??''} ${s.prescription.durationMinutes}${s.prescription.work?` (${s.prescription.work.repetitions}x${s.prescription.work.workMinutes}/${s.prescription.work.recoveryMinutes})`:''}${s.prescription.strides?' +strides':''}`),
  strength:w.sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>`${s.date} ${e.id} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${Number.isFinite(e.load.value)?' '+e.load.value:''}${e.load.ceiling?' ceil '+e.load.ceiling.value:''}${e.exposure?.kind?' '+e.exposure.kind:''}`))});
 const runKeys=['mode','long','easy','quality','qualityStep','thresholdDone','qualityDone','stridesDone','easyWeeksDone','devCount','returnStep','returnSteps','longCeiling','ceiling','achieved'];
 const entry=e=>e?{run:Object.fromEntries(Object.entries(e.run).filter(([k])=>runKeys.includes(k))),strength:Object.fromEntries(Object.entries(e.strength.exercises).map(([id,x])=>[id,Object.fromEntries(['mode','load','reps','sets','loadTick','returnStep','setCeiling','lastExecutedSets','lastPerformed'].filter(k=>x[k]!==undefined).map(k=>[k,x[k]]))]))}:null;
 for(const c of cases){out[c.caseId]={};
  for(const [name,r] of Object.entries(rt)){const res=r.ev(structuredClone(c),{authority:r.authority});
   out[c.caseId][name]=res.steps.map((s,i)=>{const p=s.result.proposal,ret=s.result.action==='REESTABLISH',itr=ret?p?.decisions?.filter(d=>d.action==='REESTABLISH').at(-1)?.interruption:null;const rw=ret&&itr?p.weeks.findIndex(w=>w.sessions.some(x=>x.date>itr.endDate)):null;
    const from=Math.max(0,(s.review.weekIndex??0)-1),to=ret?Math.min(p.weeks.length-1,rw+2):Math.min(p?.weeks?.length-1??0,(s.review.weekIndex??0)+1);
    return {step:i,kind:s.review.event?.kind,asOf:s.review.asOf,result:`${s.result.status}/${s.result.action}`,...(ret?{interruption:{startDate:itr.startDate,endDate:itr.endDate,class:itr.class,days:itr.days,stateAt:{kind:itr.stateAt.kind,week:itr.stateAt.week,authority:itr.stateAt.authority,values:itr.stateAt.values?{RUN:itr.stateAt.values.RUN}:undefined}},entry:entry(itr.entry),returnWeek:rw}:{}),
     weeks:p?p.weeks.slice(from,to+1).map(weekText):null,startStatesRun:p?p.stateTrace.slice(from,to+1).map((x,k)=>({week:from+k,...Object.fromEntries(Object.entries(x.run).filter(([kk])=>['mode','long','easy','qualityStep','easyWeeksDone','returnStep'].includes(kk)))})):null};});
  }
 }
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
console.log(JSON.stringify(out,null,1));
