// QRE R7-D Phase 3.5 recheck (QRE-R7D-PHASE35-CHECK-r2, Q1/Q4): the role's r1 differential (probes/qre2-p35-differential.mjs) with the corpora given on
// the command line: every case of each corpus through the harness's own client and canonical step view (ids, free text and the record excluded,
// as the harness scopes them), no trigger filter; each differing case with its first differing step and both decisions there, new and gone asks.
// A second, record view (each REESTABLISH's separateBreaks rows: episode role, stop, dates) is compared too, since the bounded cycle changes records.
//   node qre3-p35-differential.mjs --base <root> --cand <root> --instruments <root> --label <name> --corpus <file> [--corpus <file> ...] [--out <file>]
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const baseRoot=arg('--base'),candRoot=arg('--cand'),label=arg('--label')??'unlabelled',outFile=arg('--out');
const corpora=process.argv.flatMap((a,i)=>a==='--corpus'?[process.argv[i+1]]:[]);
const H=path.join(arg('--instruments')??candRoot,'audits/domain-coaching-r7-d-2026-11-02/harness/lib');
const imp=p=>import(pathToFileURL(p).href);
const {loadRuntime,runCase}=await imp(path.join(H,'client.mjs')),{stepView,generationView}=await imp(path.join(H,'canonical.mjs')),{canonicalJson}=await imp(path.join(H,'util.mjs'));
const B=await loadRuntime(path.join(baseRoot,'CoachingCore')),C=await loadRuntime(path.join(candRoot,'CoachingCore'));
const view=t=>({gen:generationView(t),steps:t.steps.map(s=>({id:s.stepId,...stepView(s,{scope:'ALL'})})),stopped:t.stopped});
const role=s=>String(s).split('-').at(-1);
const records=t=>t.steps.map(s=>(s.planAfter?.decisions??[]).filter(d=>d.action==='REESTABLISH').map(d=>({start:d.interruption?.startDate,end:d.interruption?.endDate,days:d.interruption?.days,cls:d.interruption?.class,rows:(d.interruption?.separateBreaks??[]).map(b=>role(b.episode)+':'+b.stop+':'+b.startDate+'..'+b.endDate)})));
const act=s=>s?`${s.result.action}${(s.result.missingInputs??[]).length?'['+s.result.missingInputs.join(',')+']':''}`:null;
const rows=[];
for(const file of corpora){
 const corpus=JSON.parse(fs.readFileSync(file,'utf8'));
 for(const kase of corpus.cases){
  let a,b;try{a=runCase(B,kase);b=runCase(C,kase);}catch(e){rows.push({corpus:path.basename(file),caseId:kase.caseId,error:e.message});continue;}
  const va=view(a),vb=view(b);let first=null;
  if(canonicalJson(va.gen)!==canonicalJson(vb.gen))first='GENERATE';
  else for(let i=0;i<Math.max(va.steps.length,vb.steps.length);i++)if(canonicalJson(va.steps[i])!==canonicalJson(vb.steps[i])){first=i;break;}
  const ra=records(a),rb=records(b);let firstRecord=null;for(let i=0;i<Math.max(ra.length,rb.length);i++)if(canonicalJson(ra[i]??null)!==canonicalJson(rb[i]??null)){firstRecord=i;break;}
  const newAsks=b.steps.map((s,i)=>({s,i})).filter(({s,i})=>s.result.action==='ASK'&&a.steps[i]?.result.action!=='ASK').map(({s,i})=>({step:s.stepId,candidate:act(s),base:act(a.steps[i])}));
  const goneAsks=a.steps.map((s,i)=>({s,i})).filter(({s,i})=>s.result.action==='ASK'&&b.steps[i]?.result.action!=='ASK').map(({s,i})=>({step:s.stepId,base:act(s),candidate:act(b.steps[i])}));
  rows.push({corpus:path.basename(file),caseId:kase.caseId,same:first===null,sameRecord:firstRecord===null,
   first:first===null?null:first==='GENERATE'?'GENERATE':{step:va.steps[first]?.id??vb.steps[first]?.id,base:act(a.steps[first]),candidate:act(b.steps[first])},
   firstRecord:firstRecord===null?null:{step:a.steps[firstRecord]?.stepId??b.steps[firstRecord]?.stepId,base:(ra[firstRecord]??[]).at(-1)??null,candidate:(rb[firstRecord]??[]).at(-1)??null},
   actions:first===null&&firstRecord===null?undefined:{base:a.steps.map(act),candidate:b.steps.map(act)},newAsks,goneAsks,
   trailingAsk:{base:a.steps.at(-1)?.result.action==='ASK',candidate:b.steps.at(-1)?.result.action==='ASK'}});
 }
}
const differing=rows.filter(r=>!r.same||!r.sameRecord);
const report={probe:'QRE3-P35-DIFFERENTIAL-1',label,corpora:corpora.map(f=>path.basename(f)),cases:rows.length,same:rows.filter(r=>r.same&&r.sameRecord).length,differing:differing.length,
 differingStepView:rows.filter(r=>!r.same).map(r=>r.caseId),differingRecordOnly:rows.filter(r=>r.same&&!r.sameRecord).map(r=>r.caseId),errors:rows.filter(r=>r.error).map(r=>({caseId:r.caseId,error:r.error})),
 differingCases:differing.map(r=>({corpus:r.corpus,caseId:r.caseId,first:r.first,firstRecord:r.firstRecord,newAsks:r.newAsks,goneAsks:r.goneAsks,trailingAsk:r.trailingAsk,actions:r.actions})),
 casesWithNewAsks:rows.filter(r=>r.newAsks?.length).map(r=>r.caseId),rows};
const text=JSON.stringify(report,null,1);
if(outFile)fs.writeFileSync(outFile,text+'\n');
console.log(JSON.stringify({label,cases:report.cases,same:report.same,differing:report.differing,stepView:report.differingStepView,recordOnly:report.differingRecordOnly,errors:report.errors.length,newAsks:report.casesWithNewAsks}));
