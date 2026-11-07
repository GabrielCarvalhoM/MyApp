// QRE R7-D Phase 3.5 check (QRE-R7D-PHASE35-CHECK-r1, Q1/Q2/Q4): an independent step-by-step differential of two rebuilt runtimes on the R7-D
// corpora (the diagnostic regression corpus, the generated sample and the HARNESS-7 development cases), through the harness's own client and canonical
// step view (ids, free text and the record excluded), with no trigger filter of its own: every differing case is listed with the first differing step
// and both decisions there, and every step where the candidate asks while the baseline did not. Scratch copies only:
//   node qre2-p35-differential.mjs --base <root> --cand <root> [--instruments <root>] --label <name> [--out <file>]
// The roots are git archives; the harness and the corpora are read from --instruments (default: the candidate root; the 8e78b8a archive).
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const baseRoot=arg('--base'),candRoot=arg('--cand'),label=arg('--label')??'unlabelled',outFile=arg('--out');
const AUD=path.join(arg('--instruments')??candRoot,'audits/domain-coaching-r7-d-2026-11-02'),H=path.join(AUD,'harness/lib');
const imp=p=>import(pathToFileURL(p).href);
const {loadRuntime,runCase}=await imp(path.join(H,'client.mjs')),{stepView,generationView}=await imp(path.join(H,'canonical.mjs')),{canonicalJson}=await imp(path.join(H,'util.mjs'));
const B=await loadRuntime(path.join(baseRoot,'CoachingCore')),C=await loadRuntime(path.join(candRoot,'CoachingCore'));
const corpora=[['DIAGNOSTIC_REGRESSION','diagnostic/R7D_DIAGNOSTIC_CORPUS.json'],['GENERATED_REGRESSION','diagnostic/generated/R7D_GENERATED_DIAGNOSTIC.json'],['HARNESS_DEV_7','harness/validation/DEV_CASES_R7D_7.json']];
const view=t=>({gen:generationView(t),steps:t.steps.map(s=>({id:s.stepId,...stepView(s,{scope:'ALL'})})),stopped:t.stopped});
const act=s=>s?`${s.result.action}${(s.result.missingInputs??[]).length?'['+s.result.missingInputs.join(',')+']':''}`:null;
const rows=[];
for(const [corpusLabel,file] of corpora){
 const corpus=JSON.parse(fs.readFileSync(path.join(AUD,file),'utf8'));
 for(const kase of corpus.cases){
  let a,b;try{a=runCase(B,kase);b=runCase(C,kase);}catch(e){rows.push({corpus:corpusLabel,caseId:kase.caseId,error:e.message});continue;}
  const va=view(a),vb=view(b);let first=null;
  if(canonicalJson(va.gen)!==canonicalJson(vb.gen))first='GENERATE';
  else for(let i=0;i<Math.max(va.steps.length,vb.steps.length);i++)if(canonicalJson(va.steps[i])!==canonicalJson(vb.steps[i])){first=i;break;}
  const newAsks=b.steps.map((s,i)=>({s,i})).filter(({s,i})=>s.result.action==='ASK'&&a.steps[i]?.result.action!=='ASK').map(({s,i})=>({step:s.stepId,candidate:act(s),base:act(a.steps[i])}));
  const goneAsks=a.steps.map((s,i)=>({s,i})).filter(({s,i})=>s.result.action==='ASK'&&b.steps[i]?.result.action!=='ASK').map(({s,i})=>({step:s.stepId,base:act(s),candidate:act(b.steps[i])}));
  rows.push({corpus:corpusLabel,caseId:kase.caseId,same:first===null,first:first===null?null:first==='GENERATE'?'GENERATE':{step:va.steps[first]?.id??vb.steps[first]?.id,base:act(a.steps[first]),candidate:act(b.steps[first])},
   actions:first===null?undefined:{base:a.steps.map(act),candidate:b.steps.map(act)},newAsks,goneAsks,
   trailingAsk:{base:a.steps.at(-1)?.result.action==='ASK',candidate:b.steps.at(-1)?.result.action==='ASK'}});
 }
}
const differing=rows.filter(r=>!r.same);
const report={probe:'QRE2-P35-DIFFERENTIAL-1',label,cases:rows.length,same:rows.filter(r=>r.same).length,differing:differing.length,errors:rows.filter(r=>r.error).map(r=>({caseId:r.caseId,error:r.error})),
 differingCases:differing.map(r=>({corpus:r.corpus,caseId:r.caseId,first:r.first,newAsks:r.newAsks,goneAsks:r.goneAsks,trailingAsk:r.trailingAsk})),
 casesWithNewAsks:rows.filter(r=>r.newAsks?.length).map(r=>r.caseId),rows};
const text=JSON.stringify(report,null,1);
if(outFile)fs.writeFileSync(outFile,text+'\n');
console.log(JSON.stringify({label,cases:report.cases,same:report.same,differing:report.differing,errors:report.errors.length,differingIds:differing.map(r=>r.caseId),casesWithNewAsks:report.casesWithNewAsks}));
