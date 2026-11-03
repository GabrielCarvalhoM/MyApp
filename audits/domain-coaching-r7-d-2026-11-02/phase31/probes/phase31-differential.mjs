// R7-D Phase 3.1 differential (the Founder: "any runtime difference outside the interruption-persistence family is unexplained and blocks the
// phase"): every case of the diagnostic corpus (regression only), the generated diagnostic sample and the HARNESS-3 development cases, run through
// the same C3 client on R7D-FREEZE-1 and on the candidate. Decisions are compared step by step on the canonical decision and plan view
// (canonical.mjs: ids, free text and the record excluded). A differing case is explained only by the family's own trigger, read on the R7D-FREEZE-1
// run: a review that states a break (an interruption object with a value, beginning by the review) whose own decision applied no return. The first
// difference must come after that review. Anything else is UNEXPLAINED and fails the probe.
//   node phase31-differential.mjs --d1 <R7D-FREEZE-1 root> --out <file>
import fs from 'node:fs';
import path from 'node:path';
import {loadRuntime,runCase} from '../../harness/lib/client.mjs';
import {stepView,generationView} from '../../harness/lib/canonical.mjs';
import {statedBreakOf,appliesReturn} from '../../harness/lib/properties.mjs';
import {canonicalJson} from '../../harness/lib/util.mjs';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const AUD=path.resolve(import.meta.dirname,'../..'),REPO=path.resolve(AUD,'../..');
const d1root=arg('--d1'),out=arg('--out');if(!d1root||!out)throw Error('--d1 <root> --out <file>');
const D1=await loadRuntime(path.join(d1root,'CoachingCore')),C=await loadRuntime(path.join(REPO,'CoachingCore'));
const corpora=[['DIAGNOSTIC_REGRESSION','diagnostic/R7D_DIAGNOSTIC_CORPUS.json'],['GENERATED_REGRESSION','diagnostic/generated/R7D_GENERATED_DIAGNOSTIC.json'],['HARNESS_DEV_3','harness/validation/DEV_CASES_R7D_3.json']];
const view=t=>({gen:generationView(t),steps:t.steps.map(s=>({id:s.stepId,...stepView(s,{scope:'ALL'})})),stopped:t.stopped});
const rows=[];
for(const [label,file] of corpora){
 const corpus=JSON.parse(fs.readFileSync(path.join(AUD,file),'utf8'));
 for(const kase of corpus.cases){
  let a,b;try{a=runCase(D1,kase);b=runCase(C,kase);}catch(e){rows.push({corpus:label,caseId:kase.caseId,error:e.message});continue;}
  const va=view(a),vb=view(b);let first=null,firstIndex=-1;
  if(canonicalJson(va.gen)!==canonicalJson(vb.gen)){first='GENERATE';firstIndex=-1;}
  else for(let i=0;i<Math.max(va.steps.length,vb.steps.length);i++)if(canonicalJson(va.steps[i])!==canonicalJson(vb.steps[i])){first=va.steps[i]?.id??vb.steps[i]?.id;firstIndex=i;break;}
  // The family's trigger on the R7D-FREEZE-1 run: a stated break its own decision did not apply.
  const unapplied=a.steps.map((s,i)=>({i,id:s.stepId,stated:!!statedBreakOf(s.review,s.asOfLocal),applied:appliesReturn(s),status:s.result.status})).filter(x=>x.stated&&!x.applied);
  const trigger=unapplied.find(x=>x.i<firstIndex)??null;
  rows.push({corpus:label,caseId:kase.caseId,same:!first,firstDifference:first,trigger:trigger?{at:trigger.id,status:trigger.status}:null,unappliedBreaks:unapplied.map(x=>x.id),explained:!first||!!trigger,
   atFirst:first&&firstIndex>=0?{freeze1:va.steps[firstIndex]?.decision??null,candidate:vb.steps[firstIndex]?.decision??null}:null});
 }
}
const differing=rows.filter(r=>!r.same),unexplained=rows.filter(r=>!r.explained||r.error);
const report={probe:'R7D-PHASE31-DIFFERENTIAL-1',baseline:'R7D-FREEZE-1',d1root:path.resolve(d1root),cases:rows.length,same:rows.filter(r=>r.same).length,differing:differing.length,unexplained:unexplained.map(r=>r.caseId),differingCases:differing.map(r=>({corpus:r.corpus,caseId:r.caseId,first:r.firstDifference,trigger:r.trigger})),rows};
fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({cases:report.cases,same:report.same,differing:report.differing,unexplained:report.unexplained,differingCases:report.differingCases},null,1));
process.exitCode=unexplained.length?1:0;
