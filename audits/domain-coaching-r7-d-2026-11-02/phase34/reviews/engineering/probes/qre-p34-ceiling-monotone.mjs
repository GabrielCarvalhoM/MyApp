// QRE R7-D Phase 3.4: does the ceiling fix (SSCTR-P34-F01, r6-composition.mjs) alone ever raise a planned dose? Every case of the three corpora runs
// through the harness client on R7D-FREEZE-4 (--d4) and on a hybrid (--hybrid: R7D-FREEZE-4 with only the candidate's r6-composition.mjs, built by the
// caller in a new scratch directory). Per step, every live session of the plan after the step is compared by id: run minutes, strength sets/reps/load.
//   node qre-p34-ceiling-monotone.mjs --harness <dir> --audit <audit dir> --d4 <root> --hybrid <root> --out <file>
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const harness=arg('--harness'),aud=arg('--audit'),d4=arg('--d4'),hy=arg('--hybrid'),outFile=arg('--out');
const {loadRuntime,runCase}=await import(pathToFileURL(path.join(harness,'lib/client.mjs')).href);
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex'),src=r=>Object.fromEntries(fs.readdirSync(path.join(r,'CoachingCore/src')).filter(f=>f.endsWith('.mjs')).map(f=>[f,sha(path.join(r,'CoachingCore/src',f))]));
const a=src(d4),b=src(hy),diff=Object.keys(a).filter(f=>a[f]!==b[f]);
if(diff.join()!=='r6-composition.mjs')throw Error('the hybrid is not R7D-FREEZE-4 plus one composition file: '+diff.join());
const RT={F4:await loadRuntime(path.join(d4,'CoachingCore')),H:await loadRuntime(path.join(hy,'CoachingCore'))};
const live=s=>!!s?.prescription&&s.status!=='SKIPPED';
const doses=plan=>new Map((plan?.weeks??[]).flatMap(w=>w.sessions.filter(live).map(s=>[s.id,s.sport==='RUN'?{sport:'RUN',role:s.role,min:s.prescription.durationMinutes}:{sport:'STRENGTH',ex:(s.prescription.exercises??[]).map(e=>({id:e.id,sets:e.sets,reps:e.reps,load:e.load?.mode==='KNOWN'?e.load.value:null}))}])));
const corpora=[['DIAGNOSTIC','diagnostic/R7D_DIAGNOSTIC_CORPUS.json'],['GENERATED','diagnostic/generated/R7D_GENERATED_DIAGNOSTIC.json'],['DEV_6','harness/validation/DEV_CASES_R7D_6.json']];
const out={probe:'QRE-P34-CEILING-MONOTONE-1',d4,hybrid:hy,cases:0,casesDiffering:[],raised:[],strengthChanged:[],sessionsMissingOrAdded:[]};
for(const [label,file] of corpora){
 for(const kase of JSON.parse(fs.readFileSync(path.join(aud,file),'utf8')).cases){
  out.cases++;const t={F4:runCase(RT.F4,kase),H:runCase(RT.H,kase)};let differs=false;
  const n=Math.min(t.F4.steps.length,t.H.steps.length);if(t.F4.steps.length!==t.H.steps.length)differs=true;
  for(let i=0;i<n;i++){
   const x=doses(t.F4.steps[i].planAfter),y=doses(t.H.steps[i].planAfter);
   for(const [id,v] of y){const u=x.get(id);
    if(!u){out.sessionsMissingOrAdded.push({corpus:label,caseId:kase.caseId,step:t.H.steps[i].stepId,id,side:'H only'});differs=true;continue;}
    if(v.sport==='RUN'){if(v.min!==u.min)differs=true;if(v.min>u.min)out.raised.push({corpus:label,caseId:kase.caseId,step:t.H.steps[i].stepId,id,role:v.role,F4:u.min,H:v.min});}
    else if(JSON.stringify(v.ex)!==JSON.stringify(u.ex)){differs=true;out.strengthChanged.push({corpus:label,caseId:kase.caseId,step:t.H.steps[i].stepId,id});}
   }
   for(const id of x.keys())if(!y.has(id)){out.sessionsMissingOrAdded.push({corpus:label,caseId:kase.caseId,step:t.F4.steps[i].stepId,id,side:'F4 only'});differs=true;}
   if(t.F4.steps[i].result.action!==t.H.steps[i].result.action)differs=true;
  }
  if(differs)out.casesDiffering.push(`${label}:${kase.caseId}`);
 }
}
out.result=out.raised.length?'RAISED':'NEVER_RAISED';
fs.writeFileSync(outFile,JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({cases:out.cases,differing:out.casesDiffering,raised:out.raised.length,strengthChanged:out.strengthChanged.length,sessionsMissingOrAdded:out.sessionsMissingOrAdded.length,result:out.result}));
