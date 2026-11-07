// R7-D Phase 3.3 differential (the Founder: "toda diferença fora do escopo de F01 precisa ser explicada e justificada; diferenças inexplicadas impedem
// o fechamento"): every case of the diagnostic corpus (regression only), the generated diagnostic sample and the HARNESS-5 development cases, run
// through the same C3 client on R7D-FREEZE-3 and on the candidate. Decisions are compared step by step on the canonical decision and plan view
// (canonical.mjs: ids, free text and the record excluded). A differing case is explained only by F01's own trigger, read on the R7D-FREEZE-3 run: a
// review that applied a return reading separate breaks and listed an earlier one TRAINING_AFTER although no whole week of the plan between that break
// and the return's stop was executed (executedWeekBetween, the P18(a) reading of R7D-HARNESS-5). The first difference must come at or after that
// review. A TRAINING_AFTER return with such a week (a re-entry) is a control: a case may not differ there. Anything else is UNEXPLAINED and fails.
//   node phase33-differential.mjs --d3 <R7D-FREEZE-3 root> --out <file>
import fs from 'node:fs';
import path from 'node:path';
import {loadRuntime,runCase} from '../../harness/lib/client.mjs';
import {stepView,generationView} from '../../harness/lib/canonical.mjs';
import {executedWeekBetween} from '../../harness/lib/properties.mjs';
import {canonicalJson} from '../../harness/lib/util.mjs';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const AUD=path.resolve(import.meta.dirname,'../..'),REPO=path.resolve(AUD,'../..');
const d3root=arg('--d3'),out=arg('--out');if(!d3root||!out)throw Error('--d3 <root> --out <file>');
const D3=await loadRuntime(path.join(d3root,'CoachingCore')),C=await loadRuntime(path.join(REPO,'CoachingCore'));
const corpora=[['DIAGNOSTIC_REGRESSION','diagnostic/R7D_DIAGNOSTIC_CORPUS.json'],['GENERATED_REGRESSION','diagnostic/generated/R7D_GENERATED_DIAGNOSTIC.json'],['HARNESS_DEV_5','harness/validation/DEV_CASES_R7D_5.json']];
const view=t=>({gen:generationView(t),steps:t.steps.map(s=>({id:s.stepId,...stepView(s,{scope:'ALL'})})),stopped:t.stopped});
const added=s=>s.adopted?(s.planAfter.decisions??[]).slice((s.planBefore.decisions??[]).length):[];
/** On the R7D-FREEZE-3 run: each review whose return listed an earlier separate break TRAINING_AFTER, with or without a whole executed week after it. */
function triggers(t){
 const out=[];
 t.steps.forEach((s,i)=>{
  const ret=added(s).filter(d=>d.action==='REESTABLISH').at(-1)?.interruption;if(!ret?.separateBreaks)return;
  const ledger=s.result.actualLedger??s.ledgerBefore??[];
  for(const b of ret.separateBreaks.filter(x=>x.stop==='TRAINING_AFTER')){
   const reentry=executedWeekBetween(s.planBefore,ledger,b.endDate,ret.startDate);
   out.push({i,id:s.stepId,break:`${b.startDate}..${b.endDate}`,stop:`${ret.startDate}..${ret.endDate}`,kind:reentry?'REENTRY_CONTROL':'F01'});
  }
 });
 return out;
}
const rows=[];
for(const [label,file] of corpora){
 const corpus=JSON.parse(fs.readFileSync(path.join(AUD,file),'utf8'));
 for(const kase of corpus.cases){
  let a,b;try{a=runCase(D3,kase);b=runCase(C,kase);}catch(e){rows.push({corpus:label,caseId:kase.caseId,error:e.message});continue;}
  const va=view(a),vb=view(b);let first=null,firstIndex=-1;
  if(canonicalJson(va.gen)!==canonicalJson(vb.gen)){first='GENERATE';firstIndex=-1;}
  else for(let i=0;i<Math.max(va.steps.length,vb.steps.length);i++)if(canonicalJson(va.steps[i])!==canonicalJson(vb.steps[i])){first=va.steps[i]?.id??vb.steps[i]?.id;firstIndex=i;break;}
  const trig=triggers(a),f01=trig.filter(x=>x.kind==='F01'),trigger=first&&firstIndex>=0?f01.find(x=>x.i<=firstIndex)??null:null;
  // A difference that begins at a re-entry control (a TRAINING_AFTER return with a whole executed week) is never explained by F01.
  const atControl=first&&firstIndex>=0?trig.some(x=>x.kind==='REENTRY_CONTROL'&&x.i===firstIndex&&!f01.some(y=>y.i===firstIndex)):false;
  rows.push({corpus:label,caseId:kase.caseId,same:!first,firstDifference:first,trigger:trigger?{at:trigger.id,break:trigger.break,stop:trigger.stop}:null,triggers:trig.map(x=>({at:x.id,kind:x.kind,break:x.break})),explained:!first||(!!trigger&&!atControl),
   atFirst:first&&firstIndex>=0?{freeze3:va.steps[firstIndex]?.decision??null,candidate:vb.steps[firstIndex]?.decision??null}:null});
 }
}
const differing=rows.filter(r=>!r.same),unexplained=rows.filter(r=>!r.explained||r.error);
const report={probe:'R7D-PHASE33-DIFFERENTIAL-1',baseline:'R7D-FREEZE-3',d3root:path.resolve(d3root),cases:rows.length,same:rows.filter(r=>r.same).length,differing:differing.length,unexplained:unexplained.map(r=>r.caseId),
 differingCases:differing.map(r=>({corpus:r.corpus,caseId:r.caseId,first:r.firstDifference,trigger:r.trigger})),casesWithF01Trigger:rows.filter(r=>(r.triggers??[]).some(x=>x.kind==='F01')).map(r=>r.caseId),
 reentryControls:rows.filter(r=>(r.triggers??[]).some(x=>x.kind==='REENTRY_CONTROL')).map(r=>({caseId:r.caseId,same:r.same})),rows};
fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({cases:report.cases,same:report.same,differing:report.differing,unexplained:report.unexplained,differingCases:report.differingCases,casesWithF01Trigger:report.casesWithF01Trigger,reentryControls:report.reentryControls},null,1));
process.exitCode=unexplained.length?1:0;
