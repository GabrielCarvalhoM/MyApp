// V1CIB: classifies every difference of the regression corpus (the spent R7-D holdout final2/: H1 39 cases, H2 300 intakes) between a base runtime and
// the candidate, as an authorized delta or a regression. Read-only; writes only <outJson>. It is a regression corpus, never fresh evidence.
// Classes: HASH_ONLY_QRE_FF_06 (the same content as JSON; only digests differ, because canonical() now follows JSON semantics), CF_OBS_1 (the review is
// sent without the reference state after a clinical hold, the R7 "qualified clearance" convention: the record's hold now keeps it clinical, or a
// later step of that case follows from it), and UNCLASSIFIED (a regression candidate, listed in full).
// Usage: node classify-differential.mjs <baseRoot> <candidateRoot> <outJson>
import path from 'node:path';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

const [baseRoot,candRoot,out]=process.argv.slice(2);
if(!baseRoot||!candRoot||!out){console.error('usage');process.exit(2);}
const audit=r=>path.join(r,'audits/domain-coaching-r7-d-2026-11-02');
const client=await import(pathToFileURL(path.join(audit(candRoot),'harness/lib/client-9.mjs')).href);
const A=await client.loadRuntime(path.join(baseRoot,'CoachingCore')),B=await client.loadRuntime(path.join(candRoot,'CoachingCore'));
const json=v=>JSON.parse(JSON.stringify(v??null));
/** The JSON content with every digest field removed (hash, rowHash, inputHash, programHash, plannedPrescriptionHash, sourceProgramHash, ...). */
const content=v=>{const o=json(v);const walk=x=>{if(Array.isArray(x))return x.map(walk);if(x&&typeof x==='object')return Object.fromEntries(Object.entries(x).filter(([k])=>!/hash$/i.test(k)).map(([k,y])=>[k,walk(y)]));return x;};return JSON.stringify(walk(o));};
const H1=JSON.parse(fs.readFileSync(path.join(audit(candRoot),'final2/R7D_FINAL_HOLDOUT_2.json'),'utf8'));
const report={h1:{steps:0,identical:0,classes:{},unclassified:[]},h2:{intakes:0,identical:0,classes:{},unclassified:[]},generations:{total:0,identical:0,classes:{}}};
const bump=(o,k)=>{o.classes[k]=(o.classes[k]??0)+1;};
for(const kase of H1.cases){
 const ta=client.runCase(A,kase),tb=client.runCase(B,kase);
 report.generations.total++;
 if(JSON.stringify(json(ta.generation))===JSON.stringify(json(tb.generation)))report.generations.identical++;else bump(report.generations,content(ta.generation)===content(tb.generation)?'HASH_ONLY_QRE_FF_06':'UNCLASSIFIED');
 let cleared=false,diverged=false;
 for(let i=0;i<Math.max(ta.steps.length,tb.steps.length);i++){
  const sa=ta.steps[i],sb=tb.steps[i],a=sa?.result,b=sb?.result;report.h1.steps++;
  // The R7 convention this corpus used (client-9: step.clearance QUALIFIED_CLEARANCE drops the reference state and keeps the record).
  if(sb?.clearance)cleared=true;
  const heldBefore=(sb?.ledgerBefore??[]).some(o=>o?.fact==='CLINICAL_HOLD');
  if(JSON.stringify(json(a))===JSON.stringify(json(b))){report.h1.identical++;continue;}
  if(!diverged&&content(a)===content(b)){bump(report.h1,'HASH_ONLY_QRE_FF_06');continue;}
  if(cleared&&heldBefore&&b?.status==='CLINICAL_HUMAN_REQUIRED'&&a?.status!=='CLINICAL_HUMAN_REQUIRED'){diverged=true;bump(report.h1,'CF_OBS_1');continue;}
  if(diverged){bump(report.h1,'CF_OBS_1_DOWNSTREAM');continue;}
  report.h1.unclassified.push({caseId:kase.caseId,step:sa?.stepId??sb?.stepId,cleared,heldBefore,base:{status:a?.status,action:a?.action,reason:String(a?.reason??'').slice(0,240)},candidate:{status:b?.status,action:b?.action,reason:String(b?.reason??'').slice(0,240)}});
 }
}
const genPath=path.join(audit(candRoot),'final2/generated/R7D_GENERATED_FINAL.json');
if(fs.existsSync(genPath)){
 const H2=JSON.parse(fs.readFileSync(genPath,'utf8'));
 for(const x of H2.intakes??H2.cases??[]){
  const input=x.intake??x.input??x,ga=A.generateProgram(structuredClone(input)),gb=B.generateProgram(structuredClone(input));report.h2.intakes++;
  if(JSON.stringify(json(ga))===JSON.stringify(json(gb))){report.h2.identical++;continue;}
  if(content(ga)===content(gb)){bump(report.h2,'HASH_ONLY_QRE_FF_06');continue;}
  report.h2.unclassified.push({id:x.id??x.caseId??input?.athlete?.id,base:ga.status,candidate:gb.status});
 }
}
fs.writeFileSync(out,JSON.stringify(report,null,1));
console.log(JSON.stringify({h1:{steps:report.h1.steps,identical:report.h1.identical,classes:report.h1.classes,unclassified:report.h1.unclassified.length},generations:report.generations,h2:{intakes:report.h2.intakes,identical:report.h2.identical,classes:report.h2.classes,unclassified:report.h2.unclassified.length}}));
