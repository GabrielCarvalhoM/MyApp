// QRE R7-D Phase 3.4 recheck (QRE-R7D-PHASE34-CHECK-r2): R7D-HARNESS-6 r2 adequacy probes (CQ-3). Cases built here plus DEV-46/DEV-47, run through the
// harness's own client and properties on a scratch runtime:
//   node qre2-p34-harness.mjs <harness dir> <runtime root> --label <name> [--out <file>]
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const [harness,root]=process.argv.slice(2),arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const label=arg('--label')??'unlabelled',outFile=arg('--out');
const {loadRuntime,runCase}=await import(pathToFileURL(path.join(harness,'lib/client.mjs')).href);
const {evaluateProperties}=await import(pathToFileURL(path.join(harness,'lib/properties.mjs')).href);
const cc=path.join(root,'CoachingCore'),rt=await loadRuntime(cc);
const ctx={policy:JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8')),catalog:JSON.parse(fs.readFileSync(path.join(cc,'r7/b0/REPERTOIRE_CATALOG_B0.json'),'utf8'))};
const dev=JSON.parse(fs.readFileSync(path.join(harness,'validation/DEV_CASES_R7D_6.json'),'utf8'));
const DEV34=dev.cases.find(c=>c.caseId==='DEV-34'),intake=DEV34.intake,head=DEV34.timeline.slice(0,2);
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'},LOADS={SQUAT:20,HINGE:20,LUNGE:12,CALF:12,PUSH:14,PULL:14,TRUNK:0};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10),W=w=>addDays('2026-11-02',7*w);
const runWeek=w=>[{each:{weeks:[w],sport:'RUN'},asPrescribed:true,response:OK},{ref:{week:w,sport:'STRENGTH',day:0},asPrescribed:true,loadsByPattern:LOADS,response:OK},{ref:{week:w,sport:'STRENGTH',day:4},completed:false}];
const noneWeek=w=>[{each:{weeks:[w],sport:'RUN'},completed:false},{each:{weeks:[w],sport:'STRENGTH'},completed:false}];
const brk=(start,days,x={})=>({startDate:start,endDate:addDays(start,days-1),days,reasonCategory:'WORK',reason:'Work trip, no training',nonclinical:true,...x});
const caseOf=(caseId,timeline)=>({caseId,authorIntent:'QRE2 probe',coverageTags:[],oracleClass:'INVARIANT_ORACLE',intake,timeline:[...head,...timeline],expectedDomainProperties:[],metamorphicRelations:[]});
const VAC={reasonCategory:'VACATION',reason:'Holiday'};
const cases=[
 // QH1 (r1): four separate breaks with a run-complete week between each pair (a two-level chain).
 caseOf('QH1',[
  {stepId:'z',at:{week:3,day:0,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:brk(W(2),7,VAC)}},
  {stepId:'y',at:{week:5,day:0,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(4),7,{episodeId:'QH1-y'})},observations:runWeek(3)},
  {stepId:'x',at:{week:7,day:0,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(6),7,{episodeId:'QH1-x'})},observations:runWeek(5)},
  {stepId:'h',at:{week:8,day:4,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(8),4,{episodeId:'QH1-h'})},observations:runWeek(7)},
  {stepId:'plain',at:{week:8,day:4,time:'08:00'},event:{kind:'WEEKLY_REVIEW'}}]),
 // QH4: the same chain with z overlapping y (z wk2 Mon to wk3 Wed; y wk3): y's own stop merges z (OVERLAPS); z ends after y starts.
 caseOf('QH4',[
  {stepId:'z',at:{week:4,day:0,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:brk(W(2),10,VAC)}},
  {stepId:'y',at:{week:4,day:0,time:'08:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(3),7,{episodeId:'QH4-y'})}},
  {stepId:'x',at:{week:6,day:0,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(5),7,{episodeId:'QH4-x'})},observations:runWeek(4)},
  {stepId:'h',at:{week:7,day:4,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(7),4,{episodeId:'QH4-h'})},observations:runWeek(6)},
  {stepId:'plain',at:{week:7,day:4,time:'08:00'},event:{kind:'WEEKLY_REVIEW'}}]),
 // QH6: control for QH4: z touching y (z wk2, y wk3): z ends the day before y starts.
 caseOf('QH6',[
  {stepId:'z',at:{week:4,day:0,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:brk(W(2),7,VAC)}},
  {stepId:'y',at:{week:4,day:0,time:'08:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(3),7,{episodeId:'QH6-y'})}},
  {stepId:'x',at:{week:6,day:0,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(5),7,{episodeId:'QH6-x'})},observations:runWeek(4)},
  {stepId:'h',at:{week:7,day:4,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(7),4,{episodeId:'QH6-h'})},observations:runWeek(6)},
  {stepId:'plain',at:{week:7,day:4,time:'08:00'},event:{kind:'WEEKLY_REVIEW'}}]),
 // QH5: z (wk2), week 3 not done (nothing trained between z and y), y (wk4), a run-complete week 5, x (wk6), a run-complete week 7, h (wk8 Mon-Thu):
 // y's own stop runs back through z (continuity); z is listed WITHIN_OWN_RETURN of x with stopInOwnReturn WITHIN_OWN_RETURN.
 caseOf('QH5',[
  {stepId:'z',at:{week:3,day:0,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:brk(W(2),7,VAC)}},
  {stepId:'y',at:{week:5,day:0,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(4),7,{episodeId:'QH5-y'})},observations:noneWeek(3)},
  {stepId:'x',at:{week:7,day:0,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(6),7,{episodeId:'QH5-x'})},observations:runWeek(5)},
  {stepId:'h',at:{week:8,day:4,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(8),4,{episodeId:'QH5-h'})},observations:runWeek(7)},
  {stepId:'plain',at:{week:8,day:4,time:'08:00'},event:{kind:'WEEKLY_REVIEW'}}]),
 ...['DEV-46','DEV-47'].map(id=>dev.cases.find(c=>c.caseId===id))
];
const out={probe:'QRE2-P34-HARNESS-1',label,harness,root,cases:{}};
for(const k of cases){
 let trace,props;
 try{trace=runCase(rt,k);props=evaluateProperties(trace,ctx);}catch(e){out.cases[k.caseId]={exception:e.name+': '+e.message};continue;}
 const last=trace.steps.at(-1),ret=(last?.planAfter?.decisions??[]).filter(d=>d.action==='REESTABLISH').at(-1)?.interruption;
 const runs=(last?.planAfter?.weeks??[]).slice(last?.weekIndex??0,(last?.weekIndex??0)+2).flatMap(w=>w.sessions.filter(s=>s.prescription&&s.status!=='SKIPPED'&&s.sport==='RUN'&&s.date>=(last?.asOfLocal??'')).map(s=>`${s.role}:${s.prescription.durationMinutes}`));
 const str=(last?.planAfter?.weeks??[]).slice(last?.weekIndex??0,(last?.weekIndex??0)+2).flatMap(w=>w.sessions.filter(s=>s.prescription&&s.status!=='SKIPPED'&&s.sport==='STRENGTH'&&s.date>=(last?.asOfLocal??'')).flatMap(s=>s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}`)));
 out.cases[k.caseId]={stopped:trace.stopped,runtimeErrors:trace.runtimeErrors,steps:trace.steps.map(s=>`${s.stepId}:${s.result.action}`),
  return:ret?{start:ret.startDate,end:ret.endDate,days:ret.days,cls:ret.class,runMode:ret.entry?.run?.mode,separateBreaks:(ret.separateBreaks??[]).map(b=>({episode:b.episode,start:b.startDate,end:b.endDate,stop:b.stop,...(b.ownReturn?{ownReturn:b.ownReturn}:{}),...(b.ownReturnOf?{ownReturnOf:b.ownReturnOf,stopInOwnReturn:b.stopInOwnReturn}:{})}))}:null,
  dosesAhead:{runs,strength:str},
  results:Object.fromEntries(Object.values(props).map(p=>[p.id,p.result])),
  fails:Object.values(props).filter(p=>p.result==='FAIL').map(p=>({property:p.id,violations:p.violations})),
  P18:{result:props.P18?.result,units:props.P18?.units,notEvaluable:props.P18?.notEvaluable}};
}
const text=JSON.stringify(out,null,1);
if(outFile)fs.writeFileSync(outFile,text+'\n');else console.log(text);
