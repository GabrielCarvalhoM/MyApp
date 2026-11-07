// QRE R7-D Phase 3.5 check (QRE-R7D-PHASE35-CHECK-r1, Q3): R7D-HARNESS-7 adequacy probes. Cases built here (the role's QH shapes, and the R04/R07
// restatement flows in the corpus format) plus DEV-46 to DEV-52, run through the harness's own client, properties and relations on a scratch runtime:
//   node qre2-p35-harness.mjs <harness dir> <runtime root> --label <name> [--out <file>] [--corpus-out <file>]
// --corpus-out writes the built cases as a corpus file (for a run of the harness's own CLI).
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const [harness,root]=process.argv.slice(2),arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const label=arg('--label')??'unlabelled',outFile=arg('--out'),corpusOut=arg('--corpus-out');
const {loadRuntime,runCase}=await import(pathToFileURL(path.join(harness,'lib/client.mjs')).href);
const {evaluateProperties}=await import(pathToFileURL(path.join(harness,'lib/properties.mjs')).href);
const {runRelations}=await import(pathToFileURL(path.join(harness,'lib/metamorphic.mjs')).href);
const cc=path.join(root,'CoachingCore'),rt=await loadRuntime(cc);
const ctx={policy:JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8')),catalog:JSON.parse(fs.readFileSync(path.join(cc,'r7/b0/REPERTOIRE_CATALOG_B0.json'),'utf8'))};
const dev=JSON.parse(fs.readFileSync(path.join(harness,'validation/DEV_CASES_R7D_7.json'),'utf8'));
const DEV34=dev.cases.find(c=>c.caseId==='DEV-34'),DEV51=dev.cases.find(c=>c.caseId==='DEV-51');
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'},LOADS={SQUAT:20,HINGE:20,LUNGE:12,CALF:12,PUSH:14,PULL:14,TRUNK:0};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10),W=w=>addDays('2026-11-02',7*w);
const runWeek=w=>[{each:{weeks:[w],sport:'RUN'},asPrescribed:true,response:OK},{ref:{week:w,sport:'STRENGTH',day:0},asPrescribed:true,loadsByPattern:LOADS,response:OK},{ref:{week:w,sport:'STRENGTH',day:4},completed:false}];
const noneWeek=w=>[{each:{weeks:[w],sport:'RUN'},completed:false},{each:{weeks:[w],sport:'STRENGTH'},completed:false}];
const allWeek=w=>[{each:{weeks:[w],sport:'RUN'},asPrescribed:true,response:OK},{each:{weeks:[w],sport:'STRENGTH'},asPrescribed:true,loadsByPattern:LOADS,response:OK}];
const brk=(start,days,x={})=>({startDate:start,endDate:addDays(start,days-1),days,reasonCategory:'WORK',reason:'Work trip, no training',nonclinical:true,...x});
const VAC={reasonCategory:'VACATION',reason:'Holiday'};
const caseOf=(caseId,timeline,from=DEV34)=>({caseId,authorIntent:'QRE2-P35 probe',coverageTags:[],oracleClass:'INVARIANT_ORACLE',intake:from.intake,timeline:[...from.timeline.slice(0,2),...timeline],expectedDomainProperties:[],metamorphicRelations:[]});
// The R04/R07 flows in the corpus format (DEV-51's intake): the holiday wk2-3 (its first report states no start time), weeks 4-5, the trip Mon-Thu wk6.
const HOL={startDate:'2026-11-16',endDate:'2026-11-29',days:14,reasonCategory:'VACATION',reason:'Holiday, no training at all',nonclinical:true};
const TRIP={startDate:'2026-12-14',endDate:'2026-12-17',days:4,reasonCategory:'WORK',reason:'Work trip, no training',nonclinical:true};
const LIFT={ref:{week:2,sport:'STRENGTH',day:0},asPrescribed:true,loadsByPattern:LOADS,response:OK,observedAt:'2026-11-16T19:00:00Z'};
const rep4=[{each:{weeks:[4],sport:'RUN'},asPrescribed:true,response:OK},{ref:{week:4,sport:'STRENGTH',day:0},asPrescribed:true,loadsByPattern:LOADS,response:OK},{ref:{week:4,sport:'STRENGTH',day:4},completed:false},
 {ref:{week:5,sport:'STRENGTH',day:0},asPrescribed:true,loadsByPattern:LOADS,response:OK},{ref:{week:5,sport:'STRENGTH',day:4},asPrescribed:true,loadsByPattern:LOADS,response:OK},{ref:{week:5,sport:'RUN',day:1},completed:false},{ref:{week:5,sport:'RUN',day:3},asPrescribed:true,response:OK},{ref:{week:5,sport:'RUN',day:6},asPrescribed:true,response:OK}];
const fri=[{each:{weeks:[4],sport:'RUN'},asPrescribed:true,response:OK},{ref:{week:4,sport:'STRENGTH',day:0},asPrescribed:true,loadsByPattern:LOADS,response:OK},{ref:{week:4,sport:'STRENGTH',day:4},completed:false},
 {each:{weeks:[5],sport:'RUN'},asPrescribed:true,response:OK},{ref:{week:5,sport:'STRENGTH',day:0},asPrescribed:true,loadsByPattern:LOADS,response:OK},{ref:{week:5,sport:'STRENGTH',day:4},completed:false}];
const restateHol=(id,x={})=>({...HOL,episodeId:id+'-w4d0',startedAt:'2026-11-16T20:00:00Z',...x});
const head=(id,obs,{lift=false}={})=>[{stepId:'w4d0',at:{week:4,day:0,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:HOL},...(lift?{observations:[LIFT]}:{})},
 {stepId:'brk2',at:{week:6,day:4,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:{...TRIP,episodeId:id+'-brk2'}},observations:obs},{stepId:'plain',at:{week:6,day:4,time:'08:00'},event:{kind:'WEEKLY_REVIEW'}}];
const tail=[{stepId:'sun',at:{week:6,day:6,time:'21:00'},event:{kind:'WEEKLY_REVIEW'}},{stepId:'wk7',at:{week:7,day:6,time:'21:00'},event:{kind:'WEEKLY_REVIEW'},observations:allWeek(7)},{stepId:'wk8',at:{week:8,day:6,time:'21:00'},event:{kind:'WEEKLY_REVIEW'},observations:allWeek(8)}];
const CORR={startDate:'2026-12-08',endDate:'2026-12-18',days:11,reasonCategory:'WORK',reason:'Work trip, no training',nonclinical:true};
const cases=[
 caseOf('QH1',[
  {stepId:'z',at:{week:3,day:0,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:brk(W(2),7,VAC)}},
  {stepId:'y',at:{week:5,day:0,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(4),7,{episodeId:'QH1-y'})},observations:runWeek(3)},
  {stepId:'x',at:{week:7,day:0,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(6),7,{episodeId:'QH1-x'})},observations:runWeek(5)},
  {stepId:'h',at:{week:8,day:4,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(8),4,{episodeId:'QH1-h'})},observations:runWeek(7)},
  {stepId:'plain',at:{week:8,day:4,time:'08:00'},event:{kind:'WEEKLY_REVIEW'}}]),
 caseOf('QH4',[
  {stepId:'z',at:{week:4,day:0,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:brk(W(2),10,VAC)}},
  {stepId:'y',at:{week:4,day:0,time:'08:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(3),7,{episodeId:'QH4-y'})}},
  {stepId:'x',at:{week:6,day:0,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(5),7,{episodeId:'QH4-x'})},observations:runWeek(4)},
  {stepId:'h',at:{week:7,day:4,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(7),4,{episodeId:'QH4-h'})},observations:runWeek(6)},
  {stepId:'plain',at:{week:7,day:4,time:'08:00'},event:{kind:'WEEKLY_REVIEW'}}]),
 caseOf('QH6',[
  {stepId:'z',at:{week:4,day:0,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:brk(W(2),7,VAC)}},
  {stepId:'y',at:{week:4,day:0,time:'08:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(3),7,{episodeId:'QH6-y'})}},
  {stepId:'x',at:{week:6,day:0,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(5),7,{episodeId:'QH6-x'})},observations:runWeek(4)},
  {stepId:'h',at:{week:7,day:4,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(7),4,{episodeId:'QH6-h'})},observations:runWeek(6)},
  {stepId:'plain',at:{week:7,day:4,time:'08:00'},event:{kind:'WEEKLY_REVIEW'}}]),
 caseOf('QH5',[
  {stepId:'z',at:{week:3,day:0,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:brk(W(2),7,VAC)}},
  {stepId:'y',at:{week:5,day:0,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(4),7,{episodeId:'QH5-y'})},observations:noneWeek(3)},
  {stepId:'x',at:{week:7,day:0,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(6),7,{episodeId:'QH5-x'})},observations:runWeek(5)},
  {stepId:'h',at:{week:8,day:4,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:brk(W(8),4,{episodeId:'QH5-h'})},observations:runWeek(7)},
  {stepId:'plain',at:{week:8,day:4,time:'08:00'},event:{kind:'WEEKLY_REVIEW'}}]),
 // QH10 (R04, declaration channel): the correction asks the holiday's start time; the holiday restated by a LOCAL_FATIGUE report; the next review applies.
 caseOf('QH10',[...head('QH10',rep4,{lift:true}),{stepId:'corr',at:{week:6,day:5,time:'10:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:{...CORR,episodeId:'QH10-brk2'}}},
  {stepId:'restate',at:{week:6,day:5,time:'11:00'},event:{kind:'LOCAL_FATIGUE',interruption:restateHol('QH10')}},{stepId:'plain2',at:{week:6,day:5,time:'12:00'},event:{kind:'WEEKLY_REVIEW'}},...tail],DEV51),
 // QH11 (R04, weekly review channel): the restating weekly review applies the kept correction in the same review.
 caseOf('QH11',[...head('QH11',rep4,{lift:true}),{stepId:'corr',at:{week:6,day:5,time:'10:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:{...CORR,episodeId:'QH11-brk2'}}},
  {stepId:'restate',at:{week:6,day:5,time:'11:00'},event:{kind:'WEEKLY_REVIEW',interruption:restateHol('QH11')}},...tail],DEV51),
 // QH12 (R07, confirmation first, then the restatement by a LOCAL_FATIGUE report; the next review applies the kept confirmation).
 caseOf('QH12',[...head('QH12',fri),{stepId:'late',at:{week:6,day:5,time:'09:00'},event:{kind:'WEEKLY_REVIEW'},observations:[LIFT]},
  {stepId:'confirm',at:{week:6,day:5,time:'10:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:{...TRIP,episodeId:'QH12-brk2'}}},
  {stepId:'restate',at:{week:6,day:5,time:'11:00'},event:{kind:'LOCAL_FATIGUE',interruption:restateHol('QH12')}},{stepId:'plain2',at:{week:6,day:5,time:'12:00'},event:{kind:'WEEKLY_REVIEW'}},...tail],DEV51),
 // QH13 (W-P17e shape): a report of the holiday that changes another fact (the reason): it opens its window; the runtime asks it; then a valid one.
 caseOf('QH13',[...head('QH13',fri),{stepId:'late',at:{week:6,day:5,time:'09:00'},event:{kind:'WEEKLY_REVIEW'},observations:[LIFT]},
  {stepId:'changed',at:{week:6,day:5,time:'10:00'},event:{kind:'WEEKLY_REVIEW',interruption:restateHol('QH13',{reason:'Holiday abroad'})}},
  {stepId:'restate',at:{week:6,day:5,time:'11:00'},event:{kind:'WEEKLY_REVIEW',interruption:restateHol('QH13')}},
  {stepId:'confirm',at:{week:6,day:5,time:'12:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:{...TRIP,episodeId:'QH13-brk2'}}},...tail],DEV51),
 // QH14 (R07, restatement by a return report with the start before the lift: KEEP VALID; DEV-51 by another channel).
 caseOf('QH14',[...head('QH14',fri),{stepId:'late',at:{week:6,day:5,time:'09:00'},event:{kind:'WEEKLY_REVIEW'},observations:[LIFT]},
  {stepId:'restate',at:{week:6,day:5,time:'10:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:restateHol('QH14',{startedAt:'2026-11-16T07:00:00Z'})}},...tail],DEV51),
 ...['DEV-46','DEV-47','DEV-48','DEV-49','DEV-50','DEV-51','DEV-52'].map(id=>dev.cases.find(c=>c.caseId===id))
];
// QH15 (P18(e) necessity): DEV-48 with the strength sessions and the optional shakeout reported performance OVER with recovery ADVERSE. The runtime
// classifies such a report CONFLICTING (r6-learning classify), never ADVERSE, so its systemic rule does not hold the week; P18(e) counts recovery ADVERSE.
// QH16: the same with a gated easy run added to the race week (the DEV-48 schedule with run days Tue, Thu, Sat, Sun).
{const base=dev.cases.find(c=>c.caseId==='DEV-48'),CONF={performance:'OVER',recovery:'ADVERSE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
 const mk=(id,intake)=>{const k=JSON.parse(JSON.stringify(base));k.caseId=id;k.authorIntent='QRE2-P35 probe: CONFLICTING reports in a race week';if(intake)k.intake=intake(k.intake);
  const b=k.timeline.find(s=>s.stepId==='brk2');b.event.interruption.episodeId=id+'-brk2';for(const o of b.observations)if(o.each?.sport==='STRENGTH'||o.each?.roles?.includes('SHAKEOUT'))o.response=CONF;
  if(intake)b.observations.push({ref:{week:7,sport:'RUN',day:1},asPrescribed:true,response:OK});return k;};
 cases.push(mk('QH15'),mk('QH16',i=>({...i,athlete:{...i.athlete},schedule:{...i.schedule,runDays:[1,3,5,6]}})));}
// QH17: after the separate-breaks return (the holiday read as its own return), the trip reported again with the same dates and no episodeId (R7-A §9
// demonstrable duplicate). QH18: the R07 flow answered as the coach asks, the I6 confirmation sent "with the same dates" (no episodeId).
cases.push(caseOf('QH17',[...head('QH17',fri),{stepId:'dup',at:{week:6,day:5,time:'10:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:TRIP}},{stepId:'plain2',at:{week:6,day:5,time:'12:00'},event:{kind:'WEEKLY_REVIEW'}}],DEV51),
 caseOf('QH18',[...head('QH18',fri),{stepId:'late',at:{week:6,day:5,time:'09:00'},event:{kind:'WEEKLY_REVIEW'},observations:[LIFT]},
  {stepId:'restate',at:{week:6,day:5,time:'10:00'},event:{kind:'WEEKLY_REVIEW',interruption:restateHol('QH18')}},{stepId:'confirm',at:{week:6,day:5,time:'11:00'},event:{kind:'RETURN_AFTER_PAUSE',interruption:TRIP}},...tail],DEV51));
// QH19 (P18 and the restatement reading): the R07 flow answered with a start before the lift (KEEP), weeks 7-8 done, then a new trip (Tue-Thu of
// week 9, no episodeId) declared on Friday and a plain review: the runtime reads the new trip alone (the restatement is no break of its own).
// QH20: the same with the new trip named (control).
for(const [id,named] of [['QH19',false],['QH20',true]])cases.push(caseOf(id,[...head(id,fri),{stepId:'late',at:{week:6,day:5,time:'09:00'},event:{kind:'WEEKLY_REVIEW'},observations:[LIFT]},
 {stepId:'restate',at:{week:6,day:5,time:'10:00'},event:{kind:'WEEKLY_REVIEW',interruption:restateHol(id,{startedAt:'2026-11-16T07:00:00Z'})}},...tail,
 {stepId:'trip2',at:{week:9,day:4,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:{startDate:'2027-01-05',endDate:'2027-01-07',days:3,reasonCategory:'WORK',reason:'Work trip, no training',nonclinical:true,...(named?{episodeId:id+'-trip2'}:{})}}},
 {stepId:'plain3',at:{week:9,day:4,time:'08:00'},event:{kind:'WEEKLY_REVIEW'}}],DEV51));
if(corpusOut)fs.writeFileSync(corpusOut,JSON.stringify({corpusRevision:'QRE2-P35-HARNESS-PROBE',cases},null,1)+'\n');
const out={probe:'QRE2-P35-HARNESS-1',label,harness,root,cases:{}};
for(const k of cases){
 let trace,props,rel;
 try{trace=runCase(rt,k);props=evaluateProperties(trace,ctx);rel=runRelations(rt,k,trace,ctx);}catch(e){out.cases[k.caseId]={exception:e.name+': '+e.message,stack:String(e.stack).split('\n').slice(0,4).join(' | ')};continue;}
 const last=trace.steps.at(-1),ret=(last?.planAfter?.decisions??[]).filter(d=>d.action==='REESTABLISH').at(-1)?.interruption;
 const str=(last?.planAfter?.weeks??[]).slice(last?.weekIndex??0,(last?.weekIndex??0)+2).flatMap(w=>w.sessions.filter(s=>s.prescription&&s.status!=='SKIPPED'&&s.sport==='STRENGTH'&&s.date>=(last?.asOfLocal??'')).flatMap(s=>s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}`)));
 out.cases[k.caseId]={steps:trace.steps.map(s=>`${s.stepId}:${s.result.action}${(s.result.missingInputs??[]).length?'['+s.result.missingInputs.join(',')+']':''}:${s.result.planValidity?.status??''}`),
  return:ret?{start:ret.startDate,end:ret.endDate,days:ret.days,cls:ret.class,stops:(ret.separateBreaks??[]).map(b=>`${b.episode}:${b.stop}${b.stopInOwnReturn?'['+b.ownReturnOf+':'+b.stopInOwnReturn+']':''}`)}:null,
  strengthAhead:str,
  results:Object.fromEntries(Object.values(props).map(p=>[p.id,p.result])),
  fails:Object.values(props).filter(p=>p.result==='FAIL').map(p=>({property:p.id,violations:p.violations})),
  relationFails:Object.entries(rel).filter(([,r])=>(r.violations??[]).length).map(([id,r])=>({relation:id,violations:r.violations.slice(0,3)})),
  relationUnits:Object.fromEntries(Object.entries(rel).map(([id,r])=>[id,r.units??0])),
  P17:{result:props.P17?.result,units:props.P17?.units},
  P18:{result:props.P18?.result,units:props.P18?.units,notEvaluable:props.P18?.notEvaluable}};
}
const text=JSON.stringify(out,null,1);
if(outFile)fs.writeFileSync(outFile,text+'\n');else console.log(text);
