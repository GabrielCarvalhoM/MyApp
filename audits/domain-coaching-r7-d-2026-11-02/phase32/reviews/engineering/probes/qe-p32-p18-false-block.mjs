// R7-D Phase 3.2 engineering check: can P18 or INSERT_NEWER_BREAK falsely block a correct holdout? Builds cases (from the HARNESS-4 development
// case DEV-24, contaminated by construction) for branches no development case reaches on the candidate, runs them on a runtime root and reports
// every property and relation result. Never writes in the repository.
//   node qe-p32-p18-false-block.mjs <root holding CoachingCore> [--relations]
//  FB-1  separate breaks with the sessions between them answered DONE: the return lists the holiday as TRAINING_AFTER (P18 (a), second branch)
//  FB-2  a correction of an applied break while a newer break is kept: the plain review applies the kept break, notApplied (P18 (a), third branch)
//  FB-3  two dateless reports with the same facts, two weeks apart (P18 joins them by facts; (a) not evaluable)
//  FB-4  two breaks stated at the same instant (the earlier unnamed, the other named separate), then a plain review
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const root=path.resolve(process.argv[2]??'.'),H=path.resolve(import.meta.dirname,'../../../../harness');
const {loadRuntime,runCase}=await import(pathToFileURL(path.join(H,'lib/client.mjs')).href);
const {evaluateProperties}=await import(pathToFileURL(path.join(H,'lib/properties.mjs')).href);
const {runRelations}=await import(pathToFileURL(path.join(H,'lib/metamorphic.mjs')).href);
const dev=JSON.parse(fs.readFileSync(path.join(H,'validation/DEV_CASES_R7D_4.json'),'utf8'));
const cc=path.join(root,'CoachingCore'),rt=await loadRuntime(cc);
const ctx={policy:JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8')),catalog:JSON.parse(fs.readFileSync(path.join(cc,'r7/b0/REPERTOIRE_CATALOG_B0.json'),'utf8'))};
const clone=x=>JSON.parse(JSON.stringify(x)),D24=dev.cases.find(c=>c.caseId==='DEV-24'),D22=dev.cases.find(c=>c.caseId==='DEV-22');
const twoWeeks=D24.timeline.slice(0,2),VAC14=D24.timeline[2].event.interruption,TRIP4=D24.timeline[3].event.interruption;
const done={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const cases=[];
{const c=clone(D24);c.caseId='QE-FB-1';c.authorIntent='Separate breaks; the sessions between them reported DONE when asked';c.timeline[5].answer={report:{completed:true,asPrescribed:true,response:done}};cases.push(c);}
{const c=clone(D22);c.caseId='QE-FB-2';c.authorIntent='A holiday applied by a return report; weeks 4-5 trained; a trip kept; a correction of the holiday; a plain review';
 const allDone=w=>[{each:{weeks:[w],sport:'RUN'},asPrescribed:true,response:done},{each:{weeks:[w],sport:'STRENGTH'},asPrescribed:true,loadsByPattern:{SQUAT:20,HINGE:20,LUNGE:12,CALF:12,PUSH:14,PULL:14,TRUNK:0},response:done}];
 c.timeline=[...clone(twoWeeks),{stepId:'w4d0',at:{week:4,day:0,time:'07:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:VAC14}},
  {stepId:'w4r',at:{week:4,day:6,time:'21:00'},event:{kind:'WEEKLY_REVIEW'},observations:allDone(4)},{stepId:'w5r',at:{week:5,day:6,time:'21:00'},event:{kind:'WEEKLY_REVIEW'},observations:allDone(5)},
  {stepId:'w7d0',at:{week:7,day:0,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:{startDate:'2026-12-14',endDate:'2026-12-20',days:7,reasonCategory:'WORK',reason:'Work trip, no training',nonclinical:true}}},
  {stepId:'w7d1',at:{week:7,day:1,time:'07:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:{...VAC14,endDate:'2026-11-28',days:13,episodeId:'QE-FB-2-w4d0'}}},
  {stepId:'w7d2',at:{week:7,day:2,time:'07:00'},event:{kind:'WEEKLY_REVIEW'}}];cases.push(c);}
{const c=clone(D24);c.caseId='QE-FB-3';c.authorIntent='Two dateless five-day trips with the same facts, two weeks apart, then a plain review';
 const f={days:5,reasonCategory:'WORK',reason:'Work trip, no training',nonclinical:true};
 c.timeline=[...clone(twoWeeks),{stepId:'w3d3',at:{week:3,day:3,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:{...f}}},{stepId:'w5d3',at:{week:5,day:3,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:{...f}}},{stepId:'w5d4',at:{week:5,day:4,time:'07:00'},event:{kind:'WEEKLY_REVIEW'}}];cases.push(c);}
{const c=clone(D24);c.caseId='QE-FB-4';c.authorIntent='Two breaks stated at the same instant (holiday unnamed, trip named), then a plain review';
 c.timeline=[...clone(twoWeeks),{stepId:'w4d0',at:{week:4,day:0,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:VAC14}},{stepId:'w4d0b',at:{week:4,day:0,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:{startDate:'2026-11-23',endDate:'2026-11-29',days:7,reasonCategory:'WORK',reason:'Work trip, no training',nonclinical:true,episodeId:'trip'}}},{stepId:'w4d1',at:{week:4,day:1,time:'07:00'},event:{kind:'WEEKLY_REVIEW'}}];cases.push(c);}
const out={probe:'R7D-ENG-P32-P18-FALSE-BLOCK-1',runtime:root,cases:[]};
for(const k of cases){
 const base=runCase(rt,k),props=evaluateProperties(base,ctx),rel=process.argv.includes('--relations')?runRelations(rt,k,base,ctx):{};
 const ret=base.steps.map(s=>({id:s.stepId,status:s.result?.status,action:s.result?.action,q:s.result?.question?.kind??null,ret:(s.planAfter?.decisions??[]).slice((s.planBefore?.decisions??[]).length).filter(d=>d.action==='REESTABLISH').map(d=>({start:d.interruption.startDate,end:d.interruption.endDate,days:d.interruption.days,class:d.interruption.class,separate:(d.interruption.separateBreaks??[]).map(b=>b.episode+':'+b.stop),notApplied:(d.interruption.notApplied??[]).map(b=>b.eventId)}))}));
 out.cases.push({caseId:k.caseId,corpusErrors:base.corpusErrors??[],runtimeErrors:base.runtimeErrors??[],steps:ret,
  fails:Object.values(props).filter(p=>p.result==='FAIL').map(p=>({property:p.id,violations:p.violations})),P18:{result:props.P18.result,units:props.P18.units,notEvaluable:props.P18.notEvaluable},P17:{result:props.P17.result,units:props.P17.units},
  relations:Object.fromEntries(Object.entries(rel).map(([n,r])=>[n,{applicable:r.applicable,units:r.units??null,violations:(r.violations??[]).length}]))});
}
console.log(JSON.stringify(out,null,1));
