// Proves, row by row, what changed in the holdout cases whose repetition target rose (R6-H24, R6-H29): the same case is replayed on
// STATE-EVIDENCE-FREEZE-1 and on this candidate, and every strength row of the differing sessions is printed with its load mode and value.
// Read-only; writes nothing; prints JSON.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'../../..');
const snap='audits/domain-coaching-r7a-state-model-2026-10-28/state-evidence-freeze-source';
const manifest=JSON.parse(fs.readFileSync(path.join(root,snap,'MANIFEST.json'),'utf8')),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7asm-rows-'));
const put=(from,to)=>{fs.mkdirSync(path.dirname(path.join(tmp,to)),{recursive:true});fs.copyFileSync(from,path.join(tmp,to));};
const out={probe:'R7ASM-ROWS-H24-H29',cases:{}};
try{
 for(const rel of Object.keys(manifest.files))put(path.join(root,snap,rel),rel);
 for(const p of ['CoachingCore/scripts/evaluate-holdout-r6.mjs','CoachingCore/r5/PROGRAM_POLICY_R5.json','audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json'])if(!manifest.files[p])put(path.join(root,p),p);
 const load=(base,rel)=>import(pathToFileURL(path.join(base,rel)).href);
 const rt={};
 for(const [name,base] of [['priorFreeze',tmp],['current',root]]){
  const ev=await load(base,'CoachingCore/scripts/evaluate-holdout-r6.mjs'),dev=await load(base,'CoachingCore/r6/fixtures/dev-authority.mjs');
  rt[name]={run:ev.evaluateHoldoutCase,authority:dev.devAuthority()};
 }
 const cases=JSON.parse(fs.readFileSync(path.join(root,'CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json'),'utf8')).cases;
 const rowsOf=(res,step,week,session)=>{const P=res.steps?.[step]?.result?.proposal;if(!P)return null;
  const s=P.weeks?.[week]?.sessions?.[session];if(!s?.prescription?.exercises)return null;
  return s.prescription.exercises.map(e=>({id:e.id,sets:e.sets,reps:e.reps,rir:e.rir,mode:e.load.mode,value:e.load.value??null,establishment:!!e.establishment,kind:e.exposure?.kind??null}));};
 const TARGETS={'R6-H24':[[0,6,0]],'R6-H29':[[0,5,0],[0,6,3],[0,7,0]]};
 for(const [id,spots] of Object.entries(TARGETS)){
  const c=cases.find(x=>x.caseId===id);
  const a=rt.priorFreeze.run(structuredClone(c),{authority:rt.priorFreeze.authority}),b=rt.current.run(structuredClone(c),{authority:rt.current.authority});
  out.cases[id]=spots.map(([st,w,se])=>({at:`step ${st} week ${w} session ${se}`,priorFreeze:rowsOf(a,st,w,se),current:rowsOf(b,st,w,se)}));
 }
 // Every risen repetition target must sit on a row that is effort-guided in the candidate (no known load), or carry no load at all.
 const risen=[];
 for(const [id,spots] of Object.entries(out.cases))for(const s of spots){
  if(!s.priorFreeze||!s.current)continue;
  for(const [i,e] of s.current.entries()){const p=s.priorFreeze[i];if(!p||p.id!==e.id)continue;
   if(e.reps>p.reps)risen.push({case:id,at:s.at,id:e.id,reps:`${p.reps}->${e.reps}`,priorMode:`${p.mode}${p.value??''}`,currentMode:`${e.mode}${e.value??''}`,effortGuided:e.mode!=='KNOWN',sets:`${p.sets}->${e.sets}`});}
 }
 out.risenRepetitionTargets=risen;
 out.allRisenAreEffortGuided=risen.every(r=>r.effortGuided);
 console.log(JSON.stringify(out,null,1));
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
