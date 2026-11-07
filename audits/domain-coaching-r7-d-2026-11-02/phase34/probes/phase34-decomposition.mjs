// R7-D Phase 3.4 differential decomposition (containment without trusting the trigger explainer: the differential's triggers are necessary
// conditions, so they can over-explain, as QE-R7D-P33-08 noted for Phase 3.3). The candidate changes two source files. A hybrid runtime H is
// R7D-FREEZE-4 with only the candidate's r6-composition.mjs (the SSCTR-P34-F01 ceiling fix). Every case of the three differential corpora runs
// through the same C3 client on R7D-FREEZE-4, on H and on the candidate:
//  - A = cases where R7D-FREEZE-4 and H differ: the ceiling fix alone. Each must hold a CEILING trigger on the R7D-FREEZE-4 run at or before its
//    first difference;
//  - B = cases where H and the candidate differ: the r6-adaptation.mjs change alone (direction A, the re-entry contract, the same-day rule,
//    the correction and late-evidence re-reads, R-F08-1). Each must hold one of those triggers on the H run at or before its first difference;
//  - A and B together must be exactly the cases where R7D-FREEZE-4 and the candidate differ.
// It never deletes anything: H is a copy in a NEW directory (mkdtemp) under --work-parent; --d4 is only read. The report records runtime labels.
//   node phase34-decomposition.mjs --d4 <R7D-FREEZE-4 root> --work-parent <scratch dir> --out <file>
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {loadRuntime,runCase} from '../../harness/lib/client.mjs';
import {stepView,generationView} from '../../harness/lib/canonical.mjs';
import {sportWeekBetween} from '../../harness/lib/properties.mjs';
import {canonicalJson} from '../../harness/lib/util.mjs';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const AUD=path.resolve(import.meta.dirname,'../..'),REPO=path.resolve(AUD,'../..');
const d4root=arg('--d4'),parent=arg('--work-parent'),out=arg('--out');if(!d4root||!parent||!out)throw Error('--d4 <root> --work-parent <scratch dir> --out <file>');
if(!fs.statSync(parent).isDirectory()||path.resolve(parent).startsWith(REPO))throw Error('--work-parent must be an existing directory outside the repository');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const f4=JSON.parse(fs.readFileSync(path.join(REPO,'CoachingCore/r7/d/RUNTIME_FREEZE_R7D_4.json'),'utf8'));
const srcOf=root=>Object.fromEntries(fs.readdirSync(path.join(root,'CoachingCore/src')).filter(f=>f.endsWith('.mjs')).sort().map(f=>['CoachingCore/src/'+f,sha(path.join(root,'CoachingCore/src',f))]));
const d4src=srcOf(path.resolve(d4root));
if(!Object.entries(f4.files).filter(([p])=>p.startsWith('CoachingCore/src/')).every(([p,h])=>d4src[p]===h))throw Error('--d4 does not hold the R7D-FREEZE-4 source bytes');
// The hybrid: R7D-FREEZE-4 with the candidate's r6-composition.mjs only.
const work=fs.mkdtempSync(path.join(path.resolve(parent),'r7d-p34-hybrid-'));
fs.cpSync(path.join(path.resolve(d4root),'CoachingCore'),path.join(work,'CoachingCore'),{recursive:true,filter:p=>!/[\\/]\.git([\\/]|$)/.test(p)});
for(const r of ['audits/domain-coaching-r6-2026-10-26/reviews/ssctr-policy-review.json','audits/domain-coaching-r7-b0-2026-10-31/reviews/SSCTR_RECHECK_B0.json']){const s=path.join(path.resolve(d4root),r);if(fs.existsSync(s)){fs.mkdirSync(path.dirname(path.join(work,r)),{recursive:true});fs.copyFileSync(s,path.join(work,r));}}
fs.copyFileSync(path.join(REPO,'CoachingCore/src/r6-composition.mjs'),path.join(work,'CoachingCore/src/r6-composition.mjs'));
const hsrc=srcOf(work),csrc=srcOf(REPO);
const hybridDiff={fromFreeze4:Object.keys(hsrc).filter(p=>hsrc[p]!==d4src[p]),fromCandidate:Object.keys(hsrc).filter(p=>hsrc[p]!==csrc[p])};
if(hybridDiff.fromFreeze4.join()!=='CoachingCore/src/r6-composition.mjs'||hybridDiff.fromCandidate.join()!=='CoachingCore/src/r6-adaptation.mjs')throw Error('the hybrid is not R7D-FREEZE-4 plus the candidate composition: '+JSON.stringify(hybridDiff));
const RT={F4:await loadRuntime(path.join(path.resolve(d4root),'CoachingCore')),H:await loadRuntime(path.join(work,'CoachingCore')),C:await loadRuntime(path.join(REPO,'CoachingCore'))};
const corpora=[['DIAGNOSTIC_REGRESSION','diagnostic/R7D_DIAGNOSTIC_CORPUS.json'],['GENERATED_REGRESSION','diagnostic/generated/R7D_GENERATED_DIAGNOSTIC.json'],['HARNESS_DEV_6','harness/validation/DEV_CASES_R7D_6.json']];
const view=t=>({gen:generationView(t),steps:t.steps.map(s=>({id:s.stepId,...stepView(s,{scope:'ALL'})})),stopped:t.stopped});
const firstDiff=(a,b)=>{if(canonicalJson(a.gen)!==canonicalJson(b.gen))return -1;for(let i=0;i<Math.max(a.steps.length,b.steps.length);i++)if(canonicalJson(a.steps[i])!==canonicalJson(b.steps[i]))return i;return null;};
const added=s=>s.adopted?(s.planAfter.decisions??[]).slice((s.planBefore.decisions??[]).length):[];
const CLINICAL=['ILLNESS','INJURY','PAIN','MEDICAL','SURGERY','PREGNANCY','POSTPARTUM'];
// The phase's triggers, read on a run (the same readings as phase34-differential.mjs).
function triggers(t){
 const out=[],clinical=new Set(),starts=new Set();
 t.steps.forEach((s,i)=>{
  const i0=s.review.interruption,name=typeof i0?.episodeId==='string'?i0.episodeId:null,id=s.review.event?.id;
  // SAME_DAY reads the start time a stated break gives (the later break's startedAt), not only the return record's: a continuity stop starts
  // at the earlier break, which states none (DEV-44 and DEV-45 on R7D-FREEZE-4).
  if(typeof i0?.startedAt==='string'&&typeof i0?.startDate==='string')starts.add(i0.startDate);
  if(name&&clinical.has(name)||added(s).some(d=>d.action==='REESTABLISH'&&clinical.has(d.interruption?.episode)))out.push({i,kind:'CLINICAL_EPISODE'});
  if(i0&&(CLINICAL.includes(String(i0.reasonCategory??'').toUpperCase())||i0.clinicalReason===true))for(const x of [name,id].filter(Boolean))clinical.add(x);
  const dec=added(s).filter(d=>d.action==='REESTABLISH').at(-1),ret=dec?.interruption;if(!ret)return;
  const ledger=s.result.actualLedger??s.ledgerBefore??[],done=new Set(ledger.filter(o=>!o.conflicted&&o.actual?.completed===true).map(o=>o.sessionId));
  if(dec.fromWeek===s.weekIndex&&(s.planBefore.weeks[s.weekIndex]?.sessions??[]).some(x=>x.sport==='RUN'&&x.prescription&&x.status!=='SKIPPED'&&x.date<s.asOfLocal&&!done.has(x.id)))out.push({i,kind:'CEILING'});
  if(ret.relation==='SAME_BREAK'&&ret.supersedes){const prev=(s.planBefore.decisions??[]).find(x=>x.action==='REESTABLISH'&&x.eventId===ret.supersedes)?.interruption;if((prev?.separateBreaks??[]).length>1)out.push({i,kind:'CORRECTION'});}
  if(!ret.separateBreaks)return;
  const byStart=[...ret.separateBreaks].sort((x,y)=>x.startDate<y.startDate?-1:x.startDate>y.startDate?1:0);
  for(const b of ret.separateBreaks.filter(x=>x.stop==='TRAINING_NOT_REESTABLISHED'||x.stop==='NO_TRAINING_BETWEEN')){const next=byStart.find(x=>x.startDate>b.endDate);if(next&&sportWeekBetween(s.planBefore,ledger,b.endDate,next.startDate))out.push({i,kind:'OWN_RETURN'});}
  if(ret.startedAt||ret.separateBreaks.some(b=>starts.has(b.startDate)))out.push({i,kind:'SAME_DAY'});
  for(const b of ret.separateBreaks.filter(x=>x.stop==='TRAINING_AFTER')){const next=byStart.find(x=>x.startDate>b.endDate);if(next&&(s.planBefore.weeks??[]).flatMap(w=>w.sessions).some(x=>x.sport==='RUN'&&['RACE','RACE_TOUCH'].includes(x.role)&&x.prescription&&x.status!=='SKIPPED'&&x.date>b.endDate&&x.date<next.startDate&&!done.has(x.id)))out.push({i,kind:'RACE_KEYS'});}
 });
 return out;
}
const ADAPTATION=['OWN_RETURN','CORRECTION','CLINICAL_EPISODE','SAME_DAY','RACE_KEYS'];
const rows=[];
for(const [label,file] of corpora){
 for(const kase of JSON.parse(fs.readFileSync(path.join(AUD,file),'utf8')).cases){
  const t={};for(const k of ['F4','H','C'])t[k]=runCase(RT[k],kase);
  const v=Object.fromEntries(Object.entries(t).map(([k,x])=>[k,view(x)]));
  const fa=firstDiff(v.F4,v.H),fb=firstDiff(v.H,v.C),fc=firstDiff(v.F4,v.C);
  const ta=fa===null?null:triggers(t.F4).filter(x=>fa>=0&&x.i<=fa).map(x=>x.kind),tb=fb===null?null:triggers(t.H).filter(x=>fb>=0&&x.i<=fb).map(x=>x.kind);
  rows.push({corpus:label,caseId:kase.caseId,ceilingOnly:fa===null?null:{firstDifference:fa<0?'GENERATE':v.F4.steps[fa]?.id??v.H.steps[fa]?.id,triggers:[...new Set(ta)],explained:ta.includes('CEILING')},
   adaptationOnly:fb===null?null:{firstDifference:fb<0?'GENERATE':v.H.steps[fb]?.id??v.C.steps[fb]?.id,triggers:[...new Set(tb)],explained:tb.some(k=>ADAPTATION.includes(k))},differsFromFreeze4:fc!==null});
 }
}
const A=rows.filter(r=>r.ceilingOnly),B=rows.filter(r=>r.adaptationOnly),total=rows.filter(r=>r.differsFromFreeze4);
const union=new Set([...A,...B].map(r=>r.caseId)),problems=[];
if(A.some(r=>!r.ceilingOnly.explained))problems.push('a ceiling-only difference without a CEILING trigger: '+A.filter(r=>!r.ceilingOnly.explained).map(r=>r.caseId).join(', '));
if(B.some(r=>!r.adaptationOnly.explained))problems.push('an adaptation-only difference without one of its triggers: '+B.filter(r=>!r.adaptationOnly.explained).map(r=>r.caseId).join(', '));
if(total.some(r=>!union.has(r.caseId))||[...union].some(id=>!total.some(r=>r.caseId===id)))problems.push('A and B together are not the cases that differ from R7D-FREEZE-4');
const report={probe:'R7D-PHASE34-DECOMPOSITION-1',runtimes:{F4:'R7D-FREEZE-4',H:'R7D-FREEZE-4 + the candidate r6-composition.mjs (SSCTR-P34-F01 only)',C:'the working tree runtime'},hybridSource:hsrc,hybridDiff,
 cases:rows.length,differFromFreeze4:total.length,ceilingOnly:A.map(r=>({caseId:r.caseId,...r.ceilingOnly})),adaptationOnly:B.map(r=>({caseId:r.caseId,...r.adaptationOnly})),
 both:A.filter(r=>r.adaptationOnly).map(r=>r.caseId),scratch:'a new directory under --work-parent; nothing deleted',problems,result:problems.length?'FAIL':'PASS'};
fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({result:report.result,problems,cases:report.cases,differFromFreeze4:report.differFromFreeze4,ceilingOnly:A.map(r=>r.caseId),adaptationOnly:B.map(r=>`${r.caseId}[${r.adaptationOnly.triggers.join('/')}]`),both:report.both},null,1));
process.exitCode=problems.length?1:0;
