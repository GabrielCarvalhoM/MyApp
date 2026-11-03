// R7-D Phase 3.2 engineering check: the RESTATE_DECLARED_BREAK (P17, HARNESS-3, unchanged in HARNESS-4) result on QE-FB-2 in detail, and the
// same case read on the plain record: whether the kept correction of the applied break is ever asked again after the kept trip is applied.
//   node qe-p32-restate-fb2.mjs <root holding CoachingCore>
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const root=path.resolve(process.argv[2]??'.'),H=path.resolve(import.meta.dirname,'../../../../harness');
const {loadRuntime,runCase}=await import(pathToFileURL(path.join(H,'lib/client.mjs')).href);
const {runRelations}=await import(pathToFileURL(path.join(H,'lib/metamorphic.mjs')).href);
const dev=JSON.parse(fs.readFileSync(path.join(H,'validation/DEV_CASES_R7D_4.json'),'utf8'));
const cc=path.join(root,'CoachingCore'),rt=await loadRuntime(cc);
const ctx={policy:JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8')),catalog:JSON.parse(fs.readFileSync(path.join(cc,'r7/b0/REPERTOIRE_CATALOG_B0.json'),'utf8'))};
const clone=x=>JSON.parse(JSON.stringify(x)),D22=dev.cases.find(c=>c.caseId==='DEV-22'),VAC14=dev.cases.find(c=>c.caseId==='DEV-24').timeline[2].event.interruption;
const done={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const allDone=w=>[{each:{weeks:[w],sport:'RUN'},asPrescribed:true,response:done},{each:{weeks:[w],sport:'STRENGTH'},asPrescribed:true,loadsByPattern:{SQUAT:20,HINGE:20,LUNGE:12,CALF:12,PUSH:14,PULL:14,TRUNK:0},response:done}];
const c=clone(D22);c.caseId='QE-FB-2';
c.timeline=[...clone(D22.timeline.slice(0,2)),{stepId:'w4d0',at:{week:4,day:0,time:'07:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:VAC14}},
 {stepId:'w4r',at:{week:4,day:6,time:'21:00'},event:{kind:'WEEKLY_REVIEW'},observations:allDone(4)},{stepId:'w5r',at:{week:5,day:6,time:'21:00'},event:{kind:'WEEKLY_REVIEW'},observations:allDone(5)},
 {stepId:'w7d0',at:{week:7,day:0,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:{startDate:'2026-12-14',endDate:'2026-12-20',days:7,reasonCategory:'WORK',reason:'Work trip, no training',nonclinical:true}}},
 {stepId:'w7d1',at:{week:7,day:1,time:'07:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:{...VAC14,endDate:'2026-11-28',days:13,episodeId:'QE-FB-2-w4d0'}}},
 {stepId:'w7d2',at:{week:7,day:2,time:'07:00'},event:{kind:'WEEKLY_REVIEW'}},
 {stepId:'w7d3',at:{week:7,day:3,time:'07:00'},event:{kind:'WEEKLY_REVIEW'}},
 {stepId:'w7r',at:{week:7,day:6,time:'21:00'},event:{kind:'WEEKLY_REVIEW'}}];
const base=runCase(rt,c),rel=runRelations(rt,c,base,ctx,{only:['RESTATE_DECLARED_BREAK']});
const line=s=>({id:s.stepId,status:s.result?.status,action:s.result?.action,validity:s.result?.planValidity?.status,q:s.result?.question?.kind??null,reason:String(s.result?.reason).slice(0,200)});
console.log(JSON.stringify({probe:'R7D-ENG-P32-RESTATE-FB2',runtime:root,steps:base.steps.slice(5).map(line),restate:rel.RESTATE_DECLARED_BREAK},null,1));
