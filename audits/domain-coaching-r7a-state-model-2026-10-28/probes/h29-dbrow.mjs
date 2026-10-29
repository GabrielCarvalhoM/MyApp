// Explains R6-H29's db-row: the same case on STATE-EVIDENCE-FREEZE-1 and on this candidate, printing db-row's state per week in both runtimes,
// the goal's repetition rule, and the repetitions the record shows logged. Read-only; prints JSON.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'../../..');
const snap='audits/domain-coaching-r7a-state-model-2026-10-28/state-evidence-freeze-source';
const manifest=JSON.parse(fs.readFileSync(path.join(root,snap,'MANIFEST.json'),'utf8')),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7asm-h29-'));
const put=(from,to)=>{fs.mkdirSync(path.dirname(path.join(tmp,to)),{recursive:true});fs.copyFileSync(from,path.join(tmp,to));};
const out={probe:'R7ASM-H29-DBROW'};
try{
 for(const rel of Object.keys(manifest.files))put(path.join(root,snap,rel),rel);
 for(const p of ['CoachingCore/scripts/evaluate-holdout-r6.mjs','CoachingCore/r5/PROGRAM_POLICY_R5.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'])if(!manifest.files[p])put(path.join(root,p),p);
 const load=(base,rel)=>import(pathToFileURL(path.join(base,rel)).href),rt={};
 for(const [name,base] of [['priorFreeze',tmp],['current',root]]){
  const ev=await load(base,'CoachingCore/scripts/evaluate-holdout-r6.mjs'),dev=await load(base,'CoachingCore/r6/fixtures/dev-authority.mjs');
  rt[name]={run:ev.evaluateHoldoutCase,authority:dev.devAuthority()};
 }
 const c=JSON.parse(fs.readFileSync(path.join(root,'CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json'),'utf8')).cases.find(x=>x.caseId==='R6-H29');
 out.goals=c.intake.athlete.goals;out.known=(c.intake.athlete.knownExercises??[]).map(k=>`${k.id} ${k.sets}x${k.reps}@${k.load?.value}${k.load?.unit}`);
 const res={};for(const [n,r] of Object.entries(rt))res[n]=r.run(structuredClone(c),{authority:r.authority});
 const state=(R,step,week)=>{const P=R.steps?.[step]?.result?.proposal;const e=P?.stateTrace?.[week]?.strength?.exercises?.['db-row'];return e?{load:e.load,reps:e.reps,sets:e.sets,tick:e.loadTick,mode:e.mode,source:e.source,lastExecutedSets:e.lastExecutedSets??null}:null;};
 out.perWeek=[];
 for(let w=3;w<=8;w++)out.perWeek.push({week:w,priorFreeze:state(res.priorFreeze,0,w),current:state(res.current,0,w)});
 const led=(R,step)=>(R.steps?.[step]?.result?.actualLedger??[]).filter(o=>o.logs?.['db-row']).map(o=>`${o.localDate} ${o.logs['db-row'].load}kg reps=${o.logs['db-row'].reps} repsMet=${o.logs['db-row'].repsMet} rir=${o.logs['db-row'].minRir}`);
 out.loggedPrior=led(res.priorFreeze,0);out.loggedCurrent=led(res.current,0);
 out.statusPrior=(res.priorFreeze.steps??[]).map(s=>s.result.status+'/'+s.result.action);
 out.statusCurrent=(res.current.steps??[]).map(s=>s.result.status+'/'+s.result.action);
 console.log(JSON.stringify(out,null,1));
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
