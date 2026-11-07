// QRE R7-D Phase 3.5 check (QRE-R7D-PHASE35-CHECK-r1, Q3): false-block risk. Every case of the given corpora through a harness's own client,
// properties and relations on a scratch runtime; lists each property or relation that fails, and each not-evaluable unit with its case result.
//   node qre2-p35-corpus.mjs <harness dir> <runtime root> --label <name> --corpus <file> [--corpus <file> ...] [--out <file>]
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const [harness,root]=process.argv.slice(2),arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const corpora=process.argv.flatMap((a,i)=>a==='--corpus'?[process.argv[i+1]]:[]),label=arg('--label')??'unlabelled',outFile=arg('--out');
const imp=p=>import(pathToFileURL(path.join(harness,p)).href);
const {loadRuntime,runCase}=await imp('lib/client.mjs'),{evaluateProperties}=await imp('lib/properties.mjs'),{runRelations}=await imp('lib/metamorphic.mjs');
const cc=path.join(root,'CoachingCore'),rt=await loadRuntime(cc);
const ctx={policy:JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8')),catalog:JSON.parse(fs.readFileSync(path.join(cc,'r7/b0/REPERTOIRE_CATALOG_B0.json'),'utf8'))};
const rows=[];
for(const file of corpora){
 const corpus=JSON.parse(fs.readFileSync(file,'utf8'));
 for(const k of corpus.cases){
  let trace,props,rel;
  try{trace=runCase(rt,k);}catch(e){rows.push({corpus:path.basename(file),caseId:k.caseId,error:e.name+': '+e.message.slice(0,200)});continue;}
  props=evaluateProperties(trace,ctx);try{rel=runRelations(rt,k,trace,ctx);}catch(e){rel={RELATIONS:{violations:[{error:e.message.slice(0,200)}]}};}
  rows.push({corpus:path.basename(file),caseId:k.caseId,
   fails:Object.values(props).filter(p=>p.result==='FAIL').map(p=>({property:p.id,issues:[...new Set(p.violations.map(v=>v.issue??'VIOLATION'))],n:p.violations.length})),
   relationFails:Object.entries(rel).filter(([,r])=>(r.violations??[]).length).map(([id,r])=>({relation:id,n:r.violations.length})),
   notEvaluable:Object.values(props).filter(p=>p.notEvaluable.length).map(p=>({property:p.id,result:p.result,units:p.notEvaluable.length,reasons:[...new Set(p.notEvaluable.map(x=>x.reason))]})),
   P17units:props.P17?.units??0,P18units:props.P18?.units??0});
 }
}
const failing=rows.filter(r=>r.fails?.length||r.relationFails?.length);
const report={probe:'QRE2-P35-CORPUS-1',label,harness:path.basename(path.dirname(harness))+'/'+path.basename(harness),cases:rows.length,errors:rows.filter(r=>r.error).map(r=>({caseId:r.caseId,error:r.error})),failing:failing.map(r=>({caseId:r.caseId,fails:r.fails,relationFails:r.relationFails})),
 notEvaluableCases:rows.filter(r=>r.notEvaluable?.length).map(r=>({caseId:r.caseId,notEvaluable:r.notEvaluable})),P17units:rows.reduce((n,r)=>n+(r.P17units??0),0),P18units:rows.reduce((n,r)=>n+(r.P18units??0),0)};
if(outFile)fs.writeFileSync(outFile,JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({label,cases:report.cases,errors:report.errors.length,failing:report.failing.map(f=>f.caseId+':'+[...f.fails.map(x=>x.property+'/'+x.issues.join('|')),...f.relationFails.map(x=>x.relation)].join(',')),notEvaluable:report.notEvaluableCases.map(c=>c.caseId+':'+c.notEvaluable.map(x=>x.property+'('+x.result+')').join(',')),P17units:report.P17units,P18units:report.P18units}));
