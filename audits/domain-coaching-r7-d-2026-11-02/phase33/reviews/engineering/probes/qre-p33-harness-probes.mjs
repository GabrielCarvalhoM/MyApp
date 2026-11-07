// R7-D Phase 3.3 independent quality/reliability probe of R7D-HARNESS-5 P18(a) (QUALITY_CHECK_R7D_PHASE33): can P18(a) block a runtime that
// applies the runtime's own re-entry rule? The rule reads a week as executed completely through the weekly gates, which exist only for the run
// roles EASY, LONG, QUALITY and WALK_JOG and for strength exercises (RUN_GATE_ROLE); P18(a) asks every live session of the week for an executed
// report. A plan with optional brisk walks (WALK, optional: true) separates the two. Cases in the DEV format, run through the harness client
// (lib/client.mjs) and properties (lib/properties.mjs) as the validation runs them. Reads the harness and a runtime root; writes one JSON file.
//   node qre-p33-harness-probes.mjs --rt <runtime root> --harness <harness dir> --out <file>
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const root=arg('--rt'),hdir=arg('--harness'),out=arg('--out');if(!root||!hdir||!out)throw Error('--rt <root> --harness <dir> --out <file>');
const {loadRuntime,runCase}=await import(pathToFileURL(path.join(hdir,'lib/client.mjs')).href);
const {evaluateProperties,executedWeekBetween}=await import(pathToFileURL(path.join(hdir,'lib/properties.mjs')).href);
const cc=path.join(root,'CoachingCore'),rt=await loadRuntime(cc);
const ctx={policy:JSON.parse(fs.readFileSync(path.join(cc,'r6/PROGRAM_POLICY_R6.json'),'utf8')),catalog:JSON.parse(fs.readFileSync(path.join(cc,'r7/b0/REPERTOIRE_CATALOG_B0.json'),'utf8'))};
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const FULL=['BARBELL','RACK','BENCH','DUMBBELLS','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'];
const LOADS={SQUAT:20,HINGE:20,LUNGE:12,CALF:12,PUSH:14,PULL:14,TRUNK:0};
const intake=(id,{weeks=12,startDate='2026-11-02',asOf='2026-11-01',goals={run:'PERFORMANCE',strength:'GENERAL'},equipment=['DUMBBELLS','BENCH'],recent={runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60,strengthDaysPerWeek:2},knownExercises=[],schedule={},athlete={},...rest}={})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,startDate,weeks,learningConsent:true,...rest,
 athlete:{id,ageEligible:true,eligibility:elig(asOf),goals,runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent,equipment,knownExercises,exerciseRotationPreference:'FIXED',...athlete},
 schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:90,...schedule}});
const allDone=w=>[{each:{weeks:[w],sport:'RUN'},asPrescribed:true,response:OK},{each:{weeks:[w],sport:'STRENGTH'},asPrescribed:true,loadsByPattern:LOADS,response:OK}];
const review=(w,observations)=>({stepId:`w${w}r`,at:{week:w,day:6,time:'21:00'},event:{kind:'WEEKLY_REVIEW'},observations});
const twoWeeks=[review(0,allDone(0)),review(1,allDone(1))];
const VAC14={startDate:'2026-11-16',endDate:'2026-11-29',days:14,reasonCategory:'VACATION',reason:'Holiday, no training at all',nonclinical:true};
const TRIP4b={startDate:'2026-12-07',endDate:'2026-12-10',days:4,reasonCategory:'WORK',reason:'Work trip, no training',nonclinical:true};
const WALKS=intake('qre-walks',{goals:{run:'GENERAL',strength:'GENERAL'},recent:{runDaysPerWeek:2,runMinutesPerWeek:60,longestRunMinutes:35,strengthDaysPerWeek:2},schedule:{runDays:[1,2,3,5,6]},equipment:FULL});
const gated=[{each:{weeks:[4],sport:'RUN',roles:['EASY','LONG','QUALITY','WALK_JOG']},asPrescribed:true,response:OK},{each:{weeks:[4],sport:'STRENGTH'},asPrescribed:true,loadsByPattern:LOADS,response:OK}];
const kase=(caseId,observations)=>({caseId,authorIntent:'reviewer probe',coverageTags:[],oracleClass:'INVARIANT_ORACLE',intake:WALKS,
 timeline:[...twoWeeks,{stepId:'w4d0',at:{week:4,day:0,time:'07:00'},event:{kind:'SYSTEMIC_FATIGUE',interruption:VAC14}},
  {stepId:'brk2',at:{week:5,day:4,time:'07:00'},event:{kind:'LOCAL_FATIGUE',interruption:{...TRIP4b,episodeId:`${caseId}-brk2`}},observations},
  {stepId:'plain',at:{week:5,day:4,time:'08:00'},event:{kind:'WEEKLY_REVIEW'}}],expectedDomainProperties:[],metamorphicRelations:[],independentAssessment:{rationale:'',preferredCoachingBehavior:'',acceptableAlternatives:[],concerns:[]},domainNotes:''});
const CASES=[
 kase('QH-1-walks-unreported',gated),
 kase('QH-2-walks-not-done',[...gated,{each:{weeks:[4],sport:'RUN',roles:['WALK']},completed:false}]),
 kase('QH-3-every-session-done',allDone(4))];
const rows=[];
for(const c of CASES){
 const t=runCase(rt,c),P=evaluateProperties(t,ctx),s=t.steps.find(x=>x.stepId==='plain');
 const ret=s?.adopted?(s.planAfter.decisions??[]).slice((s.planBefore.decisions??[]).length).filter(d=>d.action==='REESTABLISH').at(-1)?.interruption:null;
 const week4=s?s.planBefore.weeks[4].sessions.filter(x=>x.prescription&&x.status!=='SKIPPED').map(x=>({date:x.date,sport:x.sport,role:x.role,optional:!!x.optional,executedReport:(s.result.actualLedger??[]).some(r=>r.sessionId===x.id&&!r.superseded&&!r.conflicted&&r.actual?.completed===true)})):null;
 rows.push({caseId:c.caseId,corpusErrors:t.corpusErrors,runtimeErrors:t.runtimeErrors,plain:s?{action:s.result.action,validity:s.result.planValidity?.status??null}:null,
  ret:ret?{start:ret.startDate,end:ret.endDate,days:ret.days,class:ret.class,separate:(ret.separateBreaks??[]).map(b=>({start:b.startDate,end:b.endDate,stop:b.stop,reentryWeek:b.reentryWeek??null}))}:null,
  executedWeekBetween:ret?executedWeekBetween(s.planBefore,s.result.actualLedger??[],VAC14.endDate,ret.startDate):null,week4,
  P18:{result:P.P18.result,units:P.P18.units,violations:P.P18.violations},
  failing:Object.values(P).filter(p=>p.result==='FAIL').map(p=>({property:p.id,issues:[...new Set(p.violations.map(v=>v.issue??'VIOLATION'))]}))});
}
fs.mkdirSync(path.dirname(path.resolve(out)),{recursive:true});
fs.writeFileSync(out,JSON.stringify({probe:'QRE-R7D-P33-HARNESS-PROBE-1',harness:path.resolve(hdir),runtimeRoot:path.resolve(root),rows},null,1)+'\n');
console.log(JSON.stringify(rows.map(r=>({caseId:r.caseId,errors:[...r.corpusErrors,...r.runtimeErrors].length,plain:r.plain,ret:r.ret&&[r.ret.start,r.ret.days,r.ret.class,r.ret.separate.map(b=>b.stop).join('/')],executedWeekBetween:r.executedWeekBetween,P18:r.P18.result,failing:r.failing})),null,1));
