// R7-C Phase 5 correction cycle: differential of this worktree's committed runtime against R7C-FREEZE-1 (1890f66) on the paths the ceiling re-plan
// (QE-R7C-01, aboveFactsCeiling) must not touch, and on the class it is meant to reach:
// - weekZero: cold starts by run class, the intake the day before the start and on the start day; week 0 decisions (plain reviews day 0 and 2, an
//   unavailable day);
// - timely: six weeks with every session reported at its own reviews (mid-week day 2 and end of week), by class and intake date;
// - timely-short70: the same with every run executed at 70 % of its minutes;
// - returnDemo: a return after 10–35 days with a current demonstration (20–45 minutes), then the re-entry week's decisions and the next week's first;
// - neverReported: weeks never reported, decided at day 0 of weeks 1–5 (the class the re-plan reaches while the intake run is in the window).
// Each scenario's decisions (status, action, validity, question, the plan from the decision's week on) are compared step by step.
// Read-only: R7C-FREEZE-1's CoachingCore and the audit records its fixtures read are extracted with git archive into a temporary directory
// (removed after). Prints JSON. Usage: node audits/domain-coaching-r7-c-2026-11-01/probes/phase5-cc-differential.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL,fileURLToPath} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),REPO=path.resolve(HERE,'../../..'),F1='1890f66356455112907d757032a8b1cd2de29c00';
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7c-ccdiff-')),tar=path.join(tmp,'x.tar');
const ar=spawnSync('git',['archive','--format=tar','-o',tar,F1,'CoachingCore','audits/domain-coaching-r7-b0-2026-10-31/reviews'],{cwd:REPO,encoding:'utf8'});
if(ar.status!==0)throw Error('git archive: '+ar.stderr);
if(spawnSync('tar',['-xf','x.tar'],{cwd:tmp}).status!==0)throw Error('tar');fs.rmSync(tar);
const head=spawnSync('git',['rev-parse','HEAD'],{cwd:REPO,encoding:'utf8'}).stdout.trim();
const roots={F1:path.join(tmp,'CoachingCore'),HEAD:path.join(REPO,'CoachingCore')};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const BENCH={id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const intake=({id,weeks=12,asOf='2026-11-01',athlete={},schedule={},...rest})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,startDate:'2026-11-02',weeks,learningConsent:true,...rest,
 athlete:{id,ageEligible:true,eligibility:elig(asOf),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED',...athlete},
 schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:50,longRunDay:6,longRunMinutes:80,...schedule}});
const CLASSES={
 EASY_CURRENT:{},
 EASY_UNKNOWN:{athlete:{recent:{runDaysPerWeek:3,runMinutesPerWeek:null,longestRunMinutes:null,strengthDaysPerWeek:2}}},
 EASY_LOW:{athlete:{runExperience:'BEGINNER',recent:{runDaysPerWeek:2,runMinutesPerWeek:40,longestRunMinutes:20,strengthDaysPerWeek:2}}},
 RESTART:{athlete:{recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:0,strengthDaysPerWeek:2}}},
 WALK_JOG:{athlete:{runExperience:'NONE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:0,strengthDaysPerWeek:2}}},
 QUALITY_FAMILIAR:{athlete:{runExperience:'ADVANCED',recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:90,strengthDaysPerWeek:2}},schedule:{runDays:[1,2,4,6],runMinutes:60,longRunMinutes:100}},
 RACE_10K:{athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2}},schedule:{runMinutes:60,longRunMinutes:100}}
};
const mods={};
for(const [name,root] of Object.entries(roots)){const I=await import(pathToFileURL(path.join(root,'src/r6-index.mjs')).href),{devAuthority}=await import(pathToFileURL(path.join(root,'r6/fixtures/dev-authority.mjs')).href),{hash}=await import(pathToFileURL(path.join(root,'src/value.mjs')).href);mods[name]={I,opts:{authority:devAuthority()},hash};}
const live=s=>s.prescription&&s.status!=='SKIPPED';
function obs(p,s,{minutesFactor=1,N}){const pr=s.prescription,actual={completed:true,minutes:Math.max(1,Math.round(pr.durationMinutes*(s.sport==='RUN'?minutesFactor:1)))};
 if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:e.load.mode==='KNOWN'?{value:e.load.value,unit:'KG',convention:e.load.convention??'TOTAL'}:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:20,unit:'KG',convention:'TOTAL'},reps:e.reps,rir:e.rir??2}))}));
 return {eventId:`d-${p.athleteId}-${s.id}-${N.n++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const review=(p,w,N,{day=6,kind='WEEKLY_REVIEW',hour='21',...x}={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}:00:00Z`,weekIndex:w,event:{id:`d-${w}-${kind}-${N.n++}`,kind},eligibility:elig(d),...x};};
const summary=(M,r,w)=>{const P=r.proposal;return {s:r.status,a:r.action,v:r.planValidity?.status,q:r.question?.kind??null,ph:P?M.hash(P.weeks.slice(w).map(x=>x.sessions.map(s=>[s.id,s.status??null,s.prescription??null]))):null,runs:P?[w,w+1].filter(k=>P.weeks[k]).map(k=>P.weeks[k].sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>`${s.role[0]}${s.prescription.durationMinutes}`).join('/')).join(' | '):null,reason:String(r.reason??'').slice(0,160)};};
function timely(cls,asOf,{factor=1}){return M=>{const N={n:0},out=[];
 const g=M.I.generateProgram(intake({id:`d-${cls}-${asOf}`,asOf,...CLASSES[cls]}),M.opts);if(!g.program)return [{gen:g.status}];
 let p=g.program,ledger=[],ref=null;
 const step=(w,x)=>{const r=M.I.evaluateProgram(p,{...review(p,w,N,x),actualLedger:ledger,...(ref?{referenceState:ref}:{})},M.opts);out.push({w,day:x.day??6,...summary(M,r,w)});ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;ref=r.referenceState??ref;return r;};
 for(let w=0;w<6;w++){const cut=addDays(p.weeks[w].startDate,2);
  step(w,{day:2,hour:'07',observations:p.weeks[w].sessions.filter(s=>live(s)&&s.date<cut).map(s=>obs(p,s,{minutesFactor:factor,N}))});
  step(w,{day:6,observations:p.weeks[w].sessions.filter(s=>live(s)&&s.date>=cut).map(s=>obs(p,s,{minutesFactor:factor,N}))});}
 return out;};}
function weekZero(cls,asOf){return M=>{const N={n:0},out=[];const g=M.I.generateProgram(intake({id:`z-${cls}-${asOf}`,asOf,...CLASSES[cls]}),M.opts);if(!g.program)return [{gen:g.status}];const p=g.program;
 for(const [kind,day,x] of [['WEEKLY_REVIEW',0,{}],['WEEKLY_REVIEW',2,{}],['UNAVAILABLE_DAY',1,{changes:{dates:[addDays(p.weeks[0].startDate,3)]}}]]){const r=M.I.evaluateProgram(p,review(p,0,N,{day,kind,...x}),M.opts);out.push({kind,day,...summary(M,r,0)});}
 return out;};}
function returnDemo(cls,days,demoMinutes){return M=>{const N={n:0},out=[];const g=M.I.generateProgram(intake({id:`r-${cls}-${days}`,...CLASSES[cls]}),M.opts);if(!g.program)return [{gen:g.status}];
 let p=g.program,ledger=[],ref=null;
 const step=(w,x)=>{const r=M.I.evaluateProgram(p,{...review(p,w,N,x),actualLedger:ledger,...(ref?{referenceState:ref}:{})},M.opts);out.push({w,day:x.day??6,kind:x.kind??'WEEKLY_REVIEW',...summary(M,r,w)});ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;ref=r.referenceState??ref;return r;};
 step(0,{observations:p.weeks[0].sessions.filter(live).map(s=>obs(p,s,{N}))});
 const R=1+Math.ceil(days/7),endDay=p.weeks[R].startDate;
 step(R,{day:1,hour:'07',kind:'RETURN_AFTER_PAUSE',interruption:{days,reasonCategory:'TRAVEL',nonclinical:true,endDate:endDay},currentDemonstration:{observedAt:`${addDays(p.weeks[R].startDate,1)}T06:00:00Z`,sport:'RUN',family:'EASY',minutes:demoMinutes,completed:true,effort:'CONVERSATIONAL',response:'COMPATIBLE',ordinaryFunction:'COMPATIBLE',nextDayFunction:'NORMAL'}});
 step(R,{day:4,hour:'07',observations:p.weeks[R].sessions.filter(s=>live(s)&&s.date>=addDays(p.weeks[R].startDate,2)&&s.date<addDays(p.weeks[R].startDate,4)).map(s=>obs(p,s,{N}))});
 step(R,{day:6,observations:p.weeks[R].sessions.filter(s=>live(s)&&s.date>=addDays(p.weeks[R].startDate,4)).map(s=>obs(p,s,{N}))});
 if(p.weeks[R+1])step(R+1,{day:2,hour:'07',observations:p.weeks[R+1].sessions.filter(s=>live(s)&&s.date<addDays(p.weeks[R+1].startDate,2)).map(s=>obs(p,s,{N}))});
 return out;};}
function neverReported(cls,W){return M=>{const N={n:0};const g=M.I.generateProgram(intake({id:`n-${cls}-${W}`,...CLASSES[cls]}),M.opts);if(!g.program)return [{gen:g.status}];const p=g.program;
 return [{W,...summary(M,M.I.evaluateProgram(p,review(p,W,N,{day:0}),M.opts),W)}];};}
const scenarios=[];
for(const cls of Object.keys(CLASSES))for(const asOf of ['2026-11-01','2026-11-02'])scenarios.push([`weekZero ${cls} asOf=${asOf}`,weekZero(cls,asOf)]);
for(const cls of Object.keys(CLASSES))for(const asOf of ['2026-11-01','2026-11-02'])scenarios.push([`timely ${cls} asOf=${asOf}`,timely(cls,asOf,{})]);
for(const cls of ['EASY_CURRENT','EASY_UNKNOWN','RACE_10K'])scenarios.push([`timely-short70 ${cls}`,timely(cls,'2026-11-01',{factor:0.7})]);
for(const cls of ['EASY_CURRENT','EASY_UNKNOWN','EASY_LOW','RACE_10K'])for(const days of [10,18,26,35])for(const demo of [20,30,45])scenarios.push([`returnDemo ${cls} days=${days} demo=${demo}`,returnDemo(cls,days,demo)]);
for(const cls of ['EASY_CURRENT','QUALITY_FAMILIAR','RACE_10K','EASY_LOW'])for(const W of [1,2,3,4,5])scenarios.push([`neverReported ${cls} W=${W}`,neverReported(cls,W)]);
const families={},differing=[];let generationFailures=0;
for(const [name,run] of scenarios){
 const A=run(mods.F1),B=run(mods.HEAD),fam=name.split(' ')[0];families[fam]??={scenarios:0,identical:0,differing:0};families[fam].scenarios++;
 if(A.some(x=>x.gen)||B.some(x=>x.gen))generationFailures++;
 const steps=[];for(let i=0;i<Math.max(A.length,B.length);i++){const a=JSON.stringify({...A[i],reason:undefined}),b=JSON.stringify({...B[i],reason:undefined});if(a!==b)steps.push({step:i,F1:A[i],HEAD:B[i]});}
 if(steps.length){families[fam].differing++;differing.push({scenario:name,steps});}else families[fam].identical++;
}
fs.rmSync(tmp,{recursive:true,force:true});
console.log(JSON.stringify({check:'R7C-P5-CC-DIFFERENTIAL',base:{revision:'R7C-FREEZE-1',commit:F1},head,scenarios:scenarios.length,generationFailures,families,differing},null,1));
