// R7-D Phase 3.4 differential (the Founder: "nenhuma divergência fora do escopo pode ser ignorada"): every case of the diagnostic corpus (regression
// only), the generated diagnostic sample and the HARNESS-6 development cases, run through the same C3 client on R7D-FREEZE-4 and on the candidate.
// Decisions are compared step by step on the canonical decision and plan view (canonical.mjs: ids, free text and the record excluded). A differing
// case is explained only by one of the phase's own triggers, read on the R7D-FREEZE-4 run, at or before its first difference:
//  - OWN_RETURN (SSCTR-P33-F01, direction A): a review that applied a return reading separate breaks and ran the stop through an earlier break
//    (TRAINING_NOT_REESTABLISHED or NO_TRAINING_BETWEEN) although a whole week of the plan between them was executed in one sport (sportWeekBetween, the HARNESS-6 reading);
//  - CORRECTION: a return that is a newer report (SAME_BREAK) of an interruption whose return read separate breaks;
//  - CLINICAL_EPISODE (R-F08-1): a decision after a break with a clinical category was stated in the case;
//  - SAME_DAY (Q5): a return reading separate breaks one of which was stated with a start time (startedAt);
//  - CEILING (SSCTR-P34-F01): a return that re-plans its own week while that week holds runs dated before the return with no executed report;
//  - RACE_KEYS (BR-Q4): a re-entry through a week whose race touch or race has no executed report.
// Anything else is UNEXPLAINED and fails. The report records runtime labels, never local paths.
//   node phase34-differential.mjs --d4 <R7D-FREEZE-4 root> --out <file>
import fs from 'node:fs';
import path from 'node:path';
import {loadRuntime,runCase} from '../../harness/lib/client.mjs';
import {stepView,generationView} from '../../harness/lib/canonical.mjs';
import {sportWeekBetween} from '../../harness/lib/properties.mjs';
import {canonicalJson} from '../../harness/lib/util.mjs';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const AUD=path.resolve(import.meta.dirname,'../..'),REPO=path.resolve(AUD,'../..');
const d4root=arg('--d4'),out=arg('--out');if(!d4root||!out)throw Error('--d4 <root> --out <file>');
const D4=await loadRuntime(path.join(d4root,'CoachingCore')),C=await loadRuntime(path.join(REPO,'CoachingCore'));
const corpora=[['DIAGNOSTIC_REGRESSION','diagnostic/R7D_DIAGNOSTIC_CORPUS.json'],['GENERATED_REGRESSION','diagnostic/generated/R7D_GENERATED_DIAGNOSTIC.json'],['HARNESS_DEV_6','harness/validation/DEV_CASES_R7D_6.json']];
const view=t=>({gen:generationView(t),steps:t.steps.map(s=>({id:s.stepId,...stepView(s,{scope:'ALL'})})),stopped:t.stopped});
const added=s=>s.adopted?(s.planAfter.decisions??[]).slice((s.planBefore.decisions??[]).length):[];
const CLINICAL=['ILLNESS','INJURY','PAIN','MEDICAL','SURGERY','PREGNANCY','POSTPARTUM'];
/** On the R7D-FREEZE-4 run: the steps where a trigger of this phase applies. */
function triggers(t){
 const out=[],clinical=new Set(),starts=new Set();
 t.steps.forEach((s,i)=>{
  const i0=s.review.interruption,name=typeof i0?.episodeId==='string'?i0.episodeId:null,id=s.review.event?.id;
  // SAME_DAY reads the start time a stated break gives (the later break's startedAt), not only the return record's: a continuity stop starts
  // at the earlier break, which states none (DEV-44 and DEV-45 on R7D-FREEZE-4).
  if(typeof i0?.startedAt==='string'&&typeof i0?.startDate==='string')starts.add(i0.startDate);
  // R-F08-1: a later report naming a clinical-cause episode, or a return of it, on the R7D-FREEZE-4 run.
  if(name&&clinical.has(name)||added(s).some(d=>d.action==='REESTABLISH'&&clinical.has(d.interruption?.episode)))out.push({i,id:s.stepId,kind:'CLINICAL_EPISODE'});
  if(i0&&(CLINICAL.includes(String(i0.reasonCategory??'').toUpperCase())||i0.clinicalReason===true))for(const x of [name,id].filter(Boolean))clinical.add(x);
  const dec=added(s).filter(d=>d.action==='REESTABLISH').at(-1),ret=dec?.interruption;if(!ret)return;
  const ledger=s.result.actualLedger??s.ledgerBefore??[];
  // CEILING (SSCTR-P34-F01): a return that re-plans its own week while that week holds runs dated before the return with no executed report.
  const done=new Set(ledger.filter(o=>!o.conflicted&&o.actual?.completed===true).map(o=>o.sessionId));
  if(dec.fromWeek===s.weekIndex&&(s.planBefore.weeks[s.weekIndex]?.sessions??[]).some(x=>x.sport==='RUN'&&x.prescription&&x.status!=='SKIPPED'&&x.date<s.asOfLocal&&!done.has(x.id)))out.push({i,id:s.stepId,kind:'CEILING'});
  if(ret.relation==='SAME_BREAK'&&ret.supersedes){const prev=(s.planBefore.decisions??[]).find(x=>x.action==='REESTABLISH'&&x.eventId===ret.supersedes)?.interruption;if((prev?.separateBreaks??[]).length>1)out.push({i,id:s.stepId,kind:'CORRECTION'});}
  if(!ret.separateBreaks)return;
  // The next break after b in date order is the one b's stop ran into: the window is b's last day to that break's first day.
  const byStart=[...ret.separateBreaks].sort((x,y)=>x.startDate<y.startDate?-1:x.startDate>y.startDate?1:0);
  for(const b of ret.separateBreaks.filter(x=>x.stop==='TRAINING_NOT_REESTABLISHED'||x.stop==='NO_TRAINING_BETWEEN')){const next=byStart.find(x=>x.startDate>b.endDate);if(next&&sportWeekBetween(s.planBefore,ledger,b.endDate,next.startDate))out.push({i,id:s.stepId,kind:'OWN_RETURN',break:`${b.startDate}..${b.endDate}`});}
  if(ret.startedAt||ret.separateBreaks.some(b=>starts.has(b.startDate)))out.push({i,id:s.stepId,kind:'SAME_DAY'});
  // RACE_KEYS (SSCTR BR-Q4): a re-entry (TRAINING_AFTER) through a week whose race touch or race between the breaks has no executed report.
  for(const b of ret.separateBreaks.filter(x=>x.stop==='TRAINING_AFTER')){const next=byStart.find(x=>x.startDate>b.endDate);if(next&&(s.planBefore.weeks??[]).flatMap(w=>w.sessions).some(x=>x.sport==='RUN'&&['RACE','RACE_TOUCH'].includes(x.role)&&x.prescription&&x.status!=='SKIPPED'&&x.date>b.endDate&&x.date<next.startDate&&!done.has(x.id)))out.push({i,id:s.stepId,kind:'RACE_KEYS'});}
 });
 return out;
}
const rows=[];
for(const [label,file] of corpora){
 const corpus=JSON.parse(fs.readFileSync(path.join(AUD,file),'utf8'));
 for(const kase of corpus.cases){
  let a,b;try{a=runCase(D4,kase);b=runCase(C,kase);}catch(e){rows.push({corpus:label,caseId:kase.caseId,error:e.message});continue;}
  const va=view(a),vb=view(b);let first=null,firstIndex=-1;
  if(canonicalJson(va.gen)!==canonicalJson(vb.gen)){first='GENERATE';firstIndex=-1;}
  else for(let i=0;i<Math.max(va.steps.length,vb.steps.length);i++)if(canonicalJson(va.steps[i])!==canonicalJson(vb.steps[i])){first=va.steps[i]?.id??vb.steps[i]?.id;firstIndex=i;break;}
  const trig=triggers(a),trigger=first&&firstIndex>=0?trig.find(x=>x.i<=firstIndex)??null:null,kinds=first&&firstIndex>=0?[...new Set(trig.filter(x=>x.i<=firstIndex).map(x=>x.kind))]:[];
  rows.push({corpus:label,caseId:kase.caseId,same:!first,firstDifference:first,trigger:trigger?{at:trigger.id,kind:trigger.kind,...(trigger.break?{break:trigger.break}:{})}:null,triggers:trig.map(x=>({at:x.id,kind:x.kind})),kindsAtOrBeforeFirst:kinds,explained:!first||!!trigger,
   atFirst:first&&firstIndex>=0?{freeze4:va.steps[firstIndex]?.decision??null,candidate:vb.steps[firstIndex]?.decision??null}:null});
 }
}
const differing=rows.filter(r=>!r.same),unexplained=rows.filter(r=>!r.explained||r.error);
const report={probe:'R7D-PHASE34-DIFFERENTIAL-1',baseline:'R7D-FREEZE-4',candidate:'the working tree runtime',cases:rows.length,same:rows.filter(r=>r.same).length,differing:differing.length,unexplained:unexplained.map(r=>r.caseId),
 differingCases:differing.map(r=>({corpus:r.corpus,caseId:r.caseId,first:r.firstDifference,trigger:r.trigger,kinds:r.kindsAtOrBeforeFirst})),
 // Multi-label: a differing case is listed under every trigger that applies at or before its first difference (a necessary reading, never a cause:
 // phase34-decomposition.mjs separates the two source changes).
 byTrigger:Object.fromEntries(['OWN_RETURN','CORRECTION','CLINICAL_EPISODE','SAME_DAY','CEILING','RACE_KEYS'].map(k=>[k,differing.filter(r=>r.kindsAtOrBeforeFirst?.includes(k)).map(r=>r.caseId)])),rows};
fs.writeFileSync(out,JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({cases:report.cases,same:report.same,differing:report.differing,unexplained:report.unexplained,byTrigger:report.byTrigger},null,1));
process.exitCode=unexplained.length?1:0;
