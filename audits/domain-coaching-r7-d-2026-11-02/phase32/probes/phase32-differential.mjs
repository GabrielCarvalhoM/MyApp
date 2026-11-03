// R7-D Phase 3.2 differential (the Founder: "any runtime difference outside the F02 / unresolved-multiple-interruption family is unexplained and
// blocks this phase"): every case of the diagnostic corpus (regression only), the generated diagnostic sample and the HARNESS-4 development cases,
// run through the same C3 client on R7D-FREEZE-2 and on the candidate. Decisions are compared step by step on the canonical decision and plan view
// (canonical.mjs: ids, free text and the record excluded). A differing case is explained only by the family's own trigger, read on the R7D-FREEZE-2
// run: a review that states a break while an earlier stated break is still open (stated, and no return applied since). The first difference must
// come at or after that review. Anything else is UNEXPLAINED and fails the probe.
//   node phase32-differential.mjs --d2 <R7D-FREEZE-2 root> --out <file>
import fs from 'node:fs';
import path from 'node:path';
import {loadRuntime,runCase} from '../../harness/lib/client.mjs';
import {stepView,generationView} from '../../harness/lib/canonical.mjs';
import {statedBreakOf,appliesReturn} from '../../harness/lib/properties.mjs';
import {canonicalJson} from '../../harness/lib/util.mjs';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const AUD=path.resolve(import.meta.dirname,'../..'),REPO=path.resolve(AUD,'../..');
const d2root=arg('--d2'),out=arg('--out');if(!d2root||!out)throw Error('--d2 <root> --out <file>');
const D2=await loadRuntime(path.join(d2root,'CoachingCore')),C=await loadRuntime(path.join(REPO,'CoachingCore'));
const corpora=[['DIAGNOSTIC_REGRESSION','diagnostic/R7D_DIAGNOSTIC_CORPUS.json'],['GENERATED_REGRESSION','diagnostic/generated/R7D_GENERATED_DIAGNOSTIC.json'],['HARNESS_DEV_4','harness/validation/DEV_CASES_R7D_4.json']];
const view=t=>({gen:generationView(t),steps:t.steps.map(s=>({id:s.stepId,...stepView(s,{scope:'ALL'})})),stopped:t.stopped});
/** The family's trigger on the R7D-FREEZE-2 run: each review that states a break while an earlier stated break is still open. */
function triggers(t){
 const out=[];let open=[];
 t.steps.forEach((s,i)=>{
  const stated=!!statedBreakOf(s.review,s.asOfLocal);
  if(stated&&open.length)out.push({i,id:s.stepId,open:open.map(x=>x.id),status:s.result.status});
  if(appliesReturn(s))open=[];else if(stated)open.push({i,id:s.stepId});
 });
 return out;
}
const rows=[];
for(const [label,file] of corpora){
 const corpus=JSON.parse(fs.readFileSync(path.join(AUD,file),'utf8'));
 for(const kase of corpus.cases){
  let a,b;try{a=runCase(D2,kase);b=runCase(C,kase);}catch(e){rows.push({corpus:label,caseId:kase.caseId,error:e.message});continue;}
  const va=view(a),vb=view(b);let first=null,firstIndex=-1;
  if(canonicalJson(va.gen)!==canonicalJson(vb.gen)){first='GENERATE';firstIndex=-1;}
  else for(let i=0;i<Math.max(va.steps.length,vb.steps.length);i++)if(canonicalJson(va.steps[i])!==canonicalJson(vb.steps[i])){first=va.steps[i]?.id??vb.steps[i]?.id;firstIndex=i;break;}
  const trig=triggers(a),trigger=first&&firstIndex>=0?trig.find(x=>x.i<=firstIndex)??null:null;
  rows.push({corpus:label,caseId:kase.caseId,same:!first,firstDifference:first,trigger:trigger?{at:trigger.id,open:trigger.open,status:trigger.status}:null,familyTriggers:trig.map(x=>x.id),explained:!first||!!trigger,
   atFirst:first&&firstIndex>=0?{freeze2:va.steps[firstIndex]?.decision??null,candidate:vb.steps[firstIndex]?.decision??null}:null});
 }
}
const differing=rows.filter(r=>!r.same),unexplained=rows.filter(r=>!r.explained||r.error);
const report={probe:'R7D-PHASE32-DIFFERENTIAL-1',baseline:'R7D-FREEZE-2',d2root:path.resolve(d2root),cases:rows.length,same:rows.filter(r=>r.same).length,differing:differing.length,unexplained:unexplained.map(r=>r.caseId),differingCases:differing.map(r=>({corpus:r.corpus,caseId:r.caseId,first:r.firstDifference,trigger:r.trigger})),casesWithFamilyTrigger:rows.filter(r=>(r.familyTriggers??[]).length).map(r=>r.caseId),rows};
fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({cases:report.cases,same:report.same,differing:report.differing,unexplained:report.unexplained,differingCases:report.differingCases,casesWithFamilyTrigger:report.casesWithFamilyTrigger},null,1));
process.exitCode=unexplained.length?1:0;
