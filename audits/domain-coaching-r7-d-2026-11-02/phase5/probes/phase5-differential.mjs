// R7-D Phase 5 differential (nothing else changes): every case of the diagnostic corpus, the generated diagnostic sample and the R7D-HARNESS-9
// development cases (DEV_CASES_R7D_9), run through the same client (client-9) on R7D-FREEZE-5 and on the working-tree candidate. Decisions are
// compared step by step on the canonical decision and plan view (canonical.mjs: ids, free text and the record excluded). A differing case is
// explained only by one of the cycle's own mechanisms, read at its first difference:
//  - F02 (QRE-P4-F01): the candidate asks UNREPORTED_TRAINING there and R7D-FREEZE-5 does not;
//  - F01 (SSCTR-P4-F01): a moderate or long return is in force in either run at or before that step, and the first difference is in strength rows
//    (the entry, return steps and counts of exercises without a pre-break state), never in the run rows alone;
//  - FC01 (R7D-FC-01): the first difference is in strength rows, and every differing row is of a band or assistance exercise (no kilogram).
// Later steps of a case that differs are consequences of its first difference. Anything else is UNEXPLAINED and fails. Labels, never local paths.
//   node phase5-differential.mjs --base <R7D-FREEZE-5 root> --out <file>
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {loadRuntime,runCase} from '../../harness/lib/client-9.mjs';
import {stepView,generationView} from '../../harness/lib/canonical.mjs';
import {canonicalJson} from '../../harness/lib/util.mjs';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const AUD=path.resolve(import.meta.dirname,'../..'),REPO=path.resolve(AUD,'../..');
const base=arg('--base'),out=arg('--out');if(!base||!out)throw Error('--base <root> --out <file>');if(fs.existsSync(out))throw Error('--out exists');
const srcOf=cc=>Object.fromEntries(fs.readdirSync(path.join(cc,'src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['CoachingCore/src/'+f,createHash('sha256').update(fs.readFileSync(path.join(cc,'src',f))).digest('hex')]));
const B=await loadRuntime(path.join(base,'CoachingCore')),C=await loadRuntime(path.join(REPO,'CoachingCore'));
const catalog=JSON.parse(fs.readFileSync(path.join(REPO,'CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json'),'utf8')),conv=new Map(catalog.strength.configurations.map(c=>[c.id,c.conv]));
const NO_KG=['BAND_TENSION','ASSISTED_BODYWEIGHT'];
const corpora=[['DIAGNOSTIC_REGRESSION','diagnostic/R7D_DIAGNOSTIC_CORPUS.json'],['GENERATED_REGRESSION','diagnostic/generated/R7D_GENERATED_DIAGNOSTIC.json'],['HARNESS_DEV_9','harness/validation/DEV_CASES_R7D_9.json']];
const view=t=>({gen:generationView(t),steps:t.steps.map(s=>({id:s.stepId,...stepView(s,{scope:'ALL'})})),stopped:t.stopped});
const live=s=>!!s.prescription&&s.status!=='SKIPPED';
const runsOf=p=>(p?.weeks??[]).flatMap(w=>w.sessions.filter(s=>s.sport==='RUN'&&live(s)).map(s=>[s.id,s.role,s.prescription.durationMinutes,s.prescription.family]));
const strengthOf=p=>(p?.weeks??[]).flatMap(w=>w.sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises.map(e=>[s.id+':'+e.id,e.id,e.sets,e.reps,e.rir,e.load?.mode,e.load?.value??null,e.exposure?.kind??null])));
const returnsUpTo=(t,i)=>(t.steps[i]?.planAfter.decisions??[]).filter(d=>d.action==='REESTABLISH'&&['MODERATE','LONG'].includes(d.interruption?.class));
const rows=[];
for(const [label,file] of corpora){
 const corpus=JSON.parse(fs.readFileSync(path.join(AUD,file),'utf8'));
 for(const kase of corpus.cases){
  let a,b;try{a=runCase(B,kase);b=runCase(C,kase);}catch(e){rows.push({corpus:label,caseId:kase.caseId,error:e.message});continue;}
  const va=view(a),vb=view(b);let first=null,fi=-2;
  if(canonicalJson(va.gen)!==canonicalJson(vb.gen)){first='GENERATE';fi=-1;}
  else for(let i=0;i<Math.max(va.steps.length,vb.steps.length);i++)if(canonicalJson(va.steps[i])!==canonicalJson(vb.steps[i])){first=va.steps[i]?.id??vb.steps[i]?.id;fi=i;break;}
  if(!first){rows.push({corpus:label,caseId:kase.caseId,same:true});continue;}
  let kind=null,detail={};
  if(fi>=0){
   const sa=a.steps[fi],sb=b.steps[fi],qa=sa?.result.question?.kind??null,qb=sb?.result.question?.kind??null;
   const runSame=canonicalJson(runsOf(sa?.planAfter))===canonicalJson(runsOf(sb?.planAfter)),stA=strengthOf(sa?.planAfter),stB=strengthOf(sb?.planAfter);
   const ka=new Map(stA.map(r=>[r[0],canonicalJson(r)])),diffIds=[...new Set([...stA,...stB].filter(r=>ka.get(r[0])!==canonicalJson(r)||!stA.some(x=>x[0]===r[0])).map(r=>r[1]))];
   const ret=[...returnsUpTo(a,fi),...returnsUpTo(b,fi)].length>0,decSame=canonicalJson(va.steps[fi]?.decision)===canonicalJson(vb.steps[fi]?.decision);
   detail={freeze5:{status:sa?.result.status??null,validity:sa?.result.planValidity?.status??null,question:qa},candidate:{status:sb?.result.status??null,validity:sb?.result.planValidity?.status??null,question:qb},runRowsSame:runSame,decisionSame:decSame,strengthExercisesDiffering:diffIds,returnInForce:ret};
   if(qb==='UNREPORTED_TRAINING'&&qa!=='UNREPORTED_TRAINING')kind='F02';
   else if(runSame&&diffIds.length&&diffIds.every(id=>NO_KG.includes(conv.get(id))))kind='FC01';
   else if(runSame&&diffIds.length&&ret)kind='F01';
   else if(runSame&&!diffIds.length&&ret&&!decSame)kind='F01';
  }
  rows.push({corpus:label,caseId:kase.caseId,same:false,firstDifference:first,kind,explained:!!kind,detail});
 }
}
const differing=rows.filter(r=>!r.same&&!r.error),unexplained=rows.filter(r=>r.error||(!r.same&&!r.explained));
const report={probe:'R7D-PHASE5-DIFFERENTIAL-1',baseline:'R7D-FREEZE-5 (record CoachingCore/r7/d/RUNTIME_FREEZE_R7D_5.json; bytes of cc0b56f)',candidate:'the working-tree runtime (R7-D Phase 5 candidate)',candidateSource:srcOf(path.join(REPO,'CoachingCore')),baselineSource:srcOf(path.join(base,'CoachingCore')),
 cases:rows.length,same:rows.filter(r=>r.same).length,differing:differing.length,byKind:Object.fromEntries(['F02','F01','FC01'].map(k=>[k,differing.filter(r=>r.kind===k).map(r=>`${r.corpus}:${r.caseId}`)])),unexplained:unexplained.map(r=>`${r.corpus}:${r.caseId}`),rows,result:unexplained.length?'FAIL':'PASS'};
fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n',{flag:'wx'});
console.log(JSON.stringify({cases:report.cases,same:report.same,differing:report.differing,byKind:Object.fromEntries(Object.entries(report.byKind).map(([k,v])=>[k,v.length])),unexplained:report.unexplained,result:report.result},null,1));
process.exitCode=unexplained.length?1:0;
