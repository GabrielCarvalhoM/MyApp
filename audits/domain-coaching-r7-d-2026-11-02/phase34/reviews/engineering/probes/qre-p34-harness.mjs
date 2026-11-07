// QRE R7-D Phase 3.4: R7D-HARNESS-6 adequacy probes (could a check block a correct runtime?). Development-style cases built here, run through the
// harness's own client and properties on a scratch runtime: node qre-p34-harness.mjs <harness dir> <runtime root> --label <name> [--out <file>]
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const [harness,root]=process.argv.slice(2),arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const label=arg('--label')??'unlabelled',outFile=arg('--out');
const {loadRuntime,runCase}=await import(pathToFileURL(path.join(harness,'lib/client.mjs')).href);
const {evaluateProperties}=await import(pathToFileURL(path.join(harness,'lib/properties.mjs')).href);
const cc=path.join(root,'CoachingCore'),rt=await loadRuntime(cc);
const ctx={policy:JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8')),catalog:JSON.parse(fs.readFileSync(path.join(cc,'r7/b0/REPERTOIRE_CATALOG_B0.json'),'utf8'))};
// The DEV-34 intake (program start Mon 2026-11-02; runs Tue, Thu, Sun long; strength Mon, Fri).
const dev=JSON.parse(fs.readFileSync(path.join(harness,'validation/DEV_CASES_R7D_6.json'),'utf8'));
const DEV34=dev.cases.find(c=>c.caseId==='DEV-34'),intake=DEV34.intake,head=DEV34.timeline.slice(0,2);
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'},LOADS={SQUAT:20,HINGE:20,LUNGE:12,CALF:12,PUSH:14,PULL:14,TRUNK:0};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10),W=w=>addDays('2026-11-02',7*w);
// A week with every run as prescribed, the Monday strength as prescribed and the Friday strength not done (running complete, strength not).
const runWeek=w=>[{each:{weeks:[w],sport:'RUN'},asPrescribed:true,response:OK},{ref:{week:w,sport:'STRENGTH',day:0},asPrescribed:true,loadsByPattern:LOADS,response:OK},{ref:{week:w,sport:'STRENGTH',day:4},completed:false}];
const brk=(start,days,x={})=>({startDate:start,endDate:addDays(start,days-1),days,reasonCategory:'WORK',reason:'Work trip, no training',nonclinical:true,...x});
const caseOf=(caseId,timeline)=>({caseId,authorIntent:'QRE probe',coverageTags:[],oracleClass:'INVARIANT_ORACLE',intake,timeline:[...head,...timeline],expectedDomainProperties:[],metamorphicRelations:[]});
const cases=[
 // QH1: four separate unapplied breaks z (wk2), y (wk4), x (wk6), H (wk8 Mon-Thu), with a run-complete week between each pair (wk3, wk5, wk7).
 // Direction A reads x as its own return, recursively y inside x's own stop and z inside y's: z is WITHIN_OWN_RETURN of x with stopInOwnReturn WITHIN_OWN_RETURN.
 caseOf('QH1',[
  {stepId:'z',at:{week:3,day:0,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:brk(W(2),7,{reasonCategory:'VACATION',reason:'Holiday'})}},
  {stepId:'y',at:{week:5,day:0,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(4),7,{episodeId:'QH1-y'})},observations:runWeek(3)},
  {stepId:'x',at:{week:7,day:0,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(6),7,{episodeId:'QH1-x'})},observations:runWeek(5)},
  {stepId:'h',at:{week:8,day:4,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(8),4,{episodeId:'QH1-h'})},observations:runWeek(7)},
  {stepId:'plain',at:{week:8,day:4,time:'08:00'},event:{kind:'WEEKLY_REVIEW'}}]),
 // QH2: three breaks y (wk4), x (wk6), H (wk8): y is WITHIN_OWN_RETURN of x with stopInOwnReturn OWN_RETURN (one level of recursion).
 caseOf('QH2',[
  {stepId:'y',at:{week:5,day:0,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:brk(W(4),7,{reasonCategory:'VACATION',reason:'Holiday'})},observations:[{each:{weeks:[2,3],sport:'RUN'},asPrescribed:true,response:OK},{each:{weeks:[2,3],sport:'STRENGTH'},asPrescribed:true,loadsByPattern:LOADS,response:OK}]},
  {stepId:'x',at:{week:7,day:0,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(6),7,{episodeId:'QH2-x'})},observations:runWeek(5)},
  {stepId:'h',at:{week:8,day:4,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(8),4,{episodeId:'QH2-h'})},observations:runWeek(7)},
  {stepId:'plain',at:{week:8,day:4,time:'08:00'},event:{kind:'WEEKLY_REVIEW'}}]),
 // QH3: three breaks z (wk4 Mon-Wed), x (wk4 Thu-wk5 Sun, touching z), H (wk7 Mon-Thu): z is WITHIN_OWN_RETURN of x with stopInOwnReturn TOUCHES.
 caseOf('QH3',[
  {stepId:'z',at:{week:4,day:3,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:brk(W(4),3,{reasonCategory:'VACATION',reason:'Holiday'})},observations:runWeek(2).concat(runWeek(3))},
  {stepId:'x',at:{week:6,day:0,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(addDays(W(4),3),11,{episodeId:'QH3-x'})}},
  {stepId:'h',at:{week:7,day:4,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(7),4,{episodeId:'QH3-h'})},observations:runWeek(6)},
  {stepId:'plain',at:{week:7,day:4,time:'08:00'},event:{kind:'WEEKLY_REVIEW'}}])
];
const out={probe:'QRE-P34-HARNESS-1',label,harness,root,cases:{}};
for(const k of cases){
 const trace=runCase(rt,k),props=evaluateProperties(trace,ctx),last=trace.steps.at(-1),ret=(last?.planAfter?.decisions??[]).filter(d=>d.action==='REESTABLISH').at(-1)?.interruption;
 out.cases[k.caseId]={stopped:trace.stopped,corpusErrors:trace.corpusErrors,runtimeErrors:trace.runtimeErrors,steps:trace.steps.map(s=>`${s.stepId}:${s.result.action}`),
  return:ret?{start:ret.startDate,end:ret.endDate,days:ret.days,cls:ret.class,runMode:ret.entry?.run?.mode,separateBreaks:(ret.separateBreaks??[]).map(b=>({episode:b.episode,start:b.startDate,end:b.endDate,stop:b.stop,...(b.ownReturn?{ownReturn:b.ownReturn}:{}),...(b.ownReturnOf?{ownReturnOf:b.ownReturnOf,stopInOwnReturn:b.stopInOwnReturn}:{})}))}:null,
  fails:Object.values(props).filter(p=>p.result==='FAIL').map(p=>({property:p.id,violations:p.violations})),P18:{result:props.P18?.result,units:props.P18?.units}};
}
const text=JSON.stringify(out,null,1);
if(outFile)fs.writeFileSync(outFile,text+'\n');else console.log(text);
