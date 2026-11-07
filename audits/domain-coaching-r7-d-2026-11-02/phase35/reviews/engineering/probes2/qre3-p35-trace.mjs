// QRE R7-D Phase 3.5 recheck (QRE-R7D-PHASE35-CHECK-r2, Q3): the step-by-step trace of named corpus cases through a harness's own client, with each
// step's decision, the latest return's separate-break rows, and every P17/P18 violation the harness reports (to read a false block or a detection):
//   node qre3-p35-trace.mjs <harness dir> <runtime root> --corpus <file> --cases id,id [--out <file>]
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const [harness,root]=process.argv.slice(2),arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const ids=(arg('--cases')??'').split(',').filter(Boolean),outFile=arg('--out');
const imp=p=>import(pathToFileURL(path.join(harness,p)).href);
const {loadRuntime,runCase}=await imp('lib/client.mjs'),{evaluateProperties}=await imp('lib/properties.mjs');
const cc=path.join(root,'CoachingCore'),rt=await loadRuntime(cc);
const ctx={policy:JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8')),catalog:JSON.parse(fs.readFileSync(path.join(cc,'r7/b0/REPERTOIRE_CATALOG_B0.json'),'utf8'))};
const corpus=JSON.parse(fs.readFileSync(arg('--corpus'),'utf8')),out={probe:'QRE3-P35-TRACE-1',root,cases:{}};
for(const id of ids){const k=corpus.cases.find(c=>c.caseId===id);if(!k){out.cases[id]={missing:true};continue;}
 const t=runCase(rt,k),p=evaluateProperties(t,ctx);
 out.cases[id]={steps:t.steps.map(s=>{const last=(s.planAfter?.decisions??[]).filter(d=>d.action==='REESTABLISH').at(-1)?.interruption;
  return {step:s.stepId,named:s.review?.interruption?.episodeId??null,action:s.result.action,status:s.result.status??null,validity:s.result.planValidity?.status??null,missing:s.result.missingInputs??[],
   rows:(last?.separateBreaks??[]).map(b=>String(b.episode).split('-').at(-1)+':'+b.stop),reason:String(s.result.reason??'').slice(0,160)};}),
  P17:{result:p.P17?.result,violations:(p.P17?.violations??[]).map(v=>({at:v.at,issue:v.issue,declaredAt:v.declaredAt}))},P18:{result:p.P18?.result,violations:(p.P18?.violations??[]).map(v=>({at:v.at,issue:v.issue}))}};}
const text=JSON.stringify(out,null,1);if(outFile)fs.writeFileSync(outFile,text+'\n');
for(const [id,c] of Object.entries(out.cases)){console.log('== '+id,'P17',c.P17?.result,JSON.stringify(c.P17?.violations),'P18',c.P18?.result,JSON.stringify(c.P18?.violations));for(const s of c.steps??[])console.log('  ',s.step.padEnd(8),String(s.named).padEnd(12),s.action,s.status,s.validity,s.missing.join(','),s.rows.join('|'));}
