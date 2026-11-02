// R7-D Phase 3 differential (SSCTR-R7D-F03B-r1 T10; the Founder's "no regression"): every case of the diagnostic corpus (regression only), the
// generated diagnostic sample and the HARNESS-2 development cases, run through the same C3 client on R7C-FREEZE-4 and on the candidate. Decisions
// are compared step by step on the canonical decision and plan view (canonical.mjs, record provenance excluded). Every differing case must carry a
// trigger of one of the four corrections; a difference in a case without one is UNEXPLAINED and fails the probe.
//   node phase3-differential.mjs --f4 <R7C-FREEZE-4 root> --out <file>
import fs from 'node:fs';
import path from 'node:path';
import {loadRuntime,runCase} from '../../harness/lib/client.mjs';
import {stepView,generationView} from '../../harness/lib/canonical.mjs';
import {canonicalJson,digestOf} from '../../harness/lib/util.mjs';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const AUD=path.resolve(import.meta.dirname,'../..'),REPO=path.resolve(AUD,'../..');
const f4root=arg('--f4'),out=arg('--out');if(!f4root||!out)throw Error('--f4 <root> --out <file>');
const F4=await loadRuntime(path.join(f4root,'CoachingCore')),C=await loadRuntime(path.join(REPO,'CoachingCore'));
const corpora=[['DIAGNOSTIC_REGRESSION','diagnostic/R7D_DIAGNOSTIC_CORPUS.json'],['GENERATED_REGRESSION','diagnostic/generated/R7D_GENERATED_DIAGNOSTIC.json'],['HARNESS_DEV_2','harness/validation/DEV_CASES_R7D_2.json']];
// Triggers of the four corrections, read from the case inputs and the FREEZE-4 run (what each fix can change).
function triggers(kase,t4){
 const out=new Set(),steps=kase.timeline??[],facts=steps.flatMap(s=>[...(s.observations??[]),...(s.answer?.overrides??[]),...(s.answer?.report?[s.answer.report]:[])]);
 if((kase.intake?.athlete?.equipment??[]).includes('MACHINES')||(kase.intake?.athlete?.knownExercises??[]).some(k=>k?.load?.convention==='MACHINE_STACK'))out.add('F03_MACHINES');
 if(steps.some(s=>{const i=s.event?.interruption??s.answer?.declareBreak;return i&&typeof i==='object'&&Object.keys(i).length&&(s.event?.kind??'WEEKLY_REVIEW')!=='RETURN_AFTER_PAUSE';}))out.add('DX02_BREAK_OUTSIDE_RETURN');
 if(facts.some(f=>f?.confounded===true))out.add('F04_CONFOUNDED');
 if(t4.steps.some(s=>(s.result.provenance?.excluded??[]).some(e=>e.reason==='REPORT_BEFORE_OBSERVATION')))out.add('DX01_ROW_DROPPED_ON_FREEZE4');
 return [...out];
}
const view=t=>({gen:generationView(t),steps:t.steps.map(s=>({id:s.stepId,...stepView(s,{scope:'ALL'})})),stopped:t.stopped});
const rows=[];
for(const [label,file] of corpora){
 const corpus=JSON.parse(fs.readFileSync(path.join(AUD,file),'utf8'));
 for(const kase of corpus.cases){
  let a,b;try{a=runCase(F4,kase);b=runCase(C,kase);}catch(e){rows.push({corpus:label,caseId:kase.caseId,error:e.message});continue;}
  const va=view(a),vb=view(b);let first=null;
  if(canonicalJson(va.gen)!==canonicalJson(vb.gen))first='GENERATE';
  else for(let i=0;i<Math.max(va.steps.length,vb.steps.length);i++)if(canonicalJson(va.steps[i])!==canonicalJson(vb.steps[i])){first=va.steps[i]?.id??vb.steps[i]?.id;break;}
  const trig=triggers(kase,a);
  rows.push({corpus:label,caseId:kase.caseId,same:!first,firstDifference:first,triggers:trig,explained:!first||trig.length>0,stepsF4:a.steps.length,stepsCandidate:b.steps.length,digestF4:digestOf(a.steps.map(s=>s.result.status)),digestCandidate:digestOf(b.steps.map(s=>s.result.status))});
 }
}
const differing=rows.filter(r=>!r.same),unexplained=rows.filter(r=>!r.explained||r.error);
const report={probe:'R7D-PHASE3-DIFFERENTIAL-1',f4root:path.resolve(f4root),cases:rows.length,same:rows.filter(r=>r.same).length,differing:differing.length,unexplained:unexplained.map(r=>r.caseId),byTrigger:Object.fromEntries(['F03_MACHINES','DX02_BREAK_OUTSIDE_RETURN','F04_CONFOUNDED','DX01_ROW_DROPPED_ON_FREEZE4'].map(t=>[t,differing.filter(r=>r.triggers.includes(t)).map(r=>r.caseId)])),rows};
fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({cases:report.cases,same:report.same,differing:report.differing,unexplained:report.unexplained,byTrigger:report.byTrigger},null,1));
process.exitCode=unexplained.length?1:0;
