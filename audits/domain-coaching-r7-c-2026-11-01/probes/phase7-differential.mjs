// R7-C Phase 7 (QE-R7C-10): differential of this worktree's runtime against R7C-FREEZE-3 (08c6db3), with the Phase 6 differential's scenario
// families (weekZero, timely, timely-short70, returnDemo, neverReported, midweekUnreported, lateSingle, skippedReview: paths the per-report reading
// of what a review read must leave as they were), plus the habitual late reporter (each week's strength reported on its day and the week reviewed
// on day 6, the week's runs reported only on day 1 of the next week, after that review):
// - lateReporter: the runs done as prescribed. R7C-FREEZE-3 already read those weeks as unread (an executed run the review never saw), so the
//   per-report reading must leave every decision as it was;
// - lateReporterShort: the runs done at 70 % of their minutes, the class QE-R7C-10 is about: R7C-FREEZE-3 read those weeks as read (HOLD either
//   way), the per-report reading as unread. These scenarios may differ (expectedToDiffer); for each, the run minutes each week holds before its
//   review are compared with the same facts reported on time on this worktree (timely, factor 0.7): a late reporter's week above the timely
//   one would be a dose beyond the facts known on time (beyondTimely).
// Each scenario's decisions (status, action, validity, question, the plan from the decision's week on) are compared step by step; reason text is
// not compared. Read-only: R7C-FREEZE-3's CoachingCore and the audit records its fixtures read are extracted with git archive into a temporary
// directory (removed after). Prints JSON. Usage: node audits/domain-coaching-r7-c-2026-11-01/probes/phase7-differential.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL,fileURLToPath} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),REPO=path.resolve(HERE,'../../..'),F3='08c6db352d102e2b33ed7e834cff980248b90299';
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'r7c-p7diff-')),tar=path.join(tmp,'x.tar');
const ar=spawnSync('git',['archive','--format=tar','-o',tar,F3,'CoachingCore','audits/domain-coaching-r7-b0-2026-10-31/reviews'],{cwd:REPO,encoding:'utf8'});
if(ar.status!==0)throw Error('git archive: '+ar.stderr);
if(spawnSync('tar',['-xf','x.tar'],{cwd:tmp}).status!==0)throw Error('tar');fs.rmSync(tar);
const head=spawnSync('git',['rev-parse','HEAD'],{cwd:REPO,encoding:'utf8'}).stdout.trim();
const roots={F3:path.join(tmp,'CoachingCore'),WT:path.join(REPO,'CoachingCore')};
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
function obs(p,s,{minutesFactor=1,N,done=true}){const pr=s.prescription,actual=done?{completed:true,minutes:Math.max(1,Math.round(pr.durationMinutes*(s.sport==='RUN'?minutesFactor:1)))}:{completed:false};
 if(done&&pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:e.load.mode==='KNOWN'?{value:e.load.value,unit:'KG',convention:e.load.convention??'TOTAL'}:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:20,unit:'KG',convention:'TOTAL'},reps:e.reps,rir:e.rir??2}))}));
 return {eventId:`d-${p.athleteId}-${s.id}-${N.n++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:done?{...OK}:{}};}
const review=(p,w,N,{day=6,kind='WEEKLY_REVIEW',hour='21',...x}={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}:00:00Z`,weekIndex:w,event:{id:`d-${w}-${kind}-${N.n++}`,kind},eligibility:elig(d),...x};};
const summary=(M,r,w)=>{const P=r.proposal;return {s:r.status,a:r.action,v:r.planValidity?.status,q:r.question?.kind??null,ph:P?M.hash(P.weeks.slice(w).map(x=>x.sessions.map(s=>[s.id,s.status??null,s.prescription??null]))):null,runs:P?[w,w+1].filter(k=>P.weeks[k]).map(k=>P.weeks[k].sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>`${s.role[0]}${s.prescription.durationMinutes}`).join('/')).join(' | '):null,reason:String(r.reason??'').slice(0,160)};};
/** A timeline on runtime M for class cls: step(w,x) decides one review and carries the program, the record and the reference state. */
function tl(M,cls,asOf,out){const N={n:0};const g=M.I.generateProgram(intake({id:`d-${cls}-${asOf}`,asOf,...CLASSES[cls]}),M.opts);if(!g.program){out.push({gen:g.status});return null;}
 const t={N,p:g.program,ledger:[],ref:null};
 t.step=(w,x)=>{const r=M.I.evaluateProgram(t.p,{...review(t.p,w,N,x),actualLedger:t.ledger,...(t.ref?{referenceState:t.ref}:{})},M.opts);out.push({w,day:x.day??6,kind:x.kind??'WEEKLY_REVIEW',...summary(M,r,w)});t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.ref=r.referenceState??t.ref;return r;};
 t.reports=(w,from,to,f=()=>true,o={})=>t.p.weeks[w].sessions.filter(s=>live(s)&&s.date>=addDays(t.p.weeks[w].startDate,from)&&s.date<addDays(t.p.weeks[w].startDate,to)&&f(s)).map(s=>obs(t.p,s,{N,...o}));
 return t;}
function timely(cls,asOf,{factor=1}){return M=>{const out=[],t=tl(M,cls,asOf,out);if(!t)return out;
 for(let w=0;w<6;w++){t.step(w,{day:2,hour:'07',observations:t.reports(w,0,2,undefined,{minutesFactor:factor})});t.step(w,{day:6,observations:t.reports(w,2,7,undefined,{minutesFactor:factor})});}
 return out;};}
function midweekUnreported(cls){return M=>{const out=[],t=tl(M,cls,'2026-11-01',out);if(!t)return out;
 for(let w=0;w<8;w++){t.step(w,{day:2,hour:'07',observations:t.reports(w,0,2)});t.step(w,{day:4,hour:'07'});t.step(w,{day:6,observations:t.reports(w,2,7)});}
 return out;};}
function lateSingle(cls){return M=>{const out=[],t=tl(M,cls,'2026-11-01',out);if(!t)return out;
 const easy=s=>s.sport==='RUN'&&s.role==='EASY';let held=null;
 for(let w=0;w<6;w++){
  const keep=s=>w!==3||!(easy(s)&&!held&&(held=s.id));
  t.step(w,{day:2,hour:'07',observations:[...t.reports(w,0,2,keep),...(w===4&&held?t.reports(3,0,7,s=>s.id===held):[])]});t.step(w,{day:6,observations:t.reports(w,2,7,keep)});}
 return out;};}
function skippedReview(cls){return M=>{const out=[],t=tl(M,cls,'2026-11-01',out);if(!t)return out;
 for(let w=0;w<3;w++){t.step(w,{day:2,hour:'07',observations:t.reports(w,0,2)});t.step(w,{day:6,observations:t.reports(w,2,7)});}
 const first=t.p.weeks[3].sessions.find(s=>live(s)&&s.sport==='RUN');
 t.step(3,{day:2,hour:'07',observations:t.reports(3,0,2,s=>s.id!==first.id)});
 t.step(3,{day:4,hour:'07',observations:[...t.reports(3,2,4),...t.reports(3,0,7,s=>s.id===first.id,{done:false})]});
 t.step(3,{day:5,hour:'21',observations:t.reports(3,4,7)});
 t.step(4,{day:2,hour:'07',observations:t.reports(4,0,2)});
 return out;};}
function weekZero(cls,asOf){return M=>{const N={n:0},out=[];const g=M.I.generateProgram(intake({id:`z-${cls}-${asOf}`,asOf,...CLASSES[cls]}),M.opts);if(!g.program)return [{gen:g.status}];const p=g.program;
 for(const [kind,day,x] of [['WEEKLY_REVIEW',0,{}],['WEEKLY_REVIEW',2,{}],['UNAVAILABLE_DAY',1,{changes:{dates:[addDays(p.weeks[0].startDate,3)]}}]]){const r=M.I.evaluateProgram(p,review(p,0,N,{day,kind,...x}),M.opts);out.push({kind,day,...summary(M,r,0)});}
 return out;};}
function returnDemo(cls,days,demoMinutes){return M=>{const out=[],t=tl(M,cls,'2026-11-01',out);if(!t)return out;
 t.step(0,{observations:t.reports(0,0,7)});
 const R=1+Math.ceil(days/7),endDay=t.p.weeks[R].startDate;
 t.step(R,{day:1,hour:'07',kind:'RETURN_AFTER_PAUSE',interruption:{days,reasonCategory:'TRAVEL',nonclinical:true,endDate:endDay},currentDemonstration:{observedAt:`${addDays(t.p.weeks[R].startDate,1)}T06:00:00Z`,sport:'RUN',family:'EASY',minutes:demoMinutes,completed:true,effort:'CONVERSATIONAL',response:'COMPATIBLE',ordinaryFunction:'COMPATIBLE',nextDayFunction:'NORMAL'}});
 t.step(R,{day:4,hour:'07',observations:t.reports(R,2,4)});
 t.step(R,{day:6,observations:t.reports(R,4,7)});
 if(t.p.weeks[R+1])t.step(R+1,{day:2,hour:'07',observations:t.reports(R+1,0,2)});
 return out;};}
function neverReported(cls,W){return M=>{const N={n:0};const g=M.I.generateProgram(intake({id:`n-${cls}-${W}`,...CLASSES[cls]}),M.opts);if(!g.program)return [{gen:g.status}];const p=g.program;
 return [{W,...summary(M,M.I.evaluateProgram(p,review(p,W,N,{day:0}),M.opts),W)}];};}
function lateReporter(cls,factor){return M=>{const out=[],t=tl(M,cls,'2026-11-01',out);if(!t)return out;
 for(let w=0;w<8;w++){t.step(w,{day:1,hour:'07',observations:[...(w>0?t.reports(w-1,0,7,s=>s.sport==='RUN',{minutesFactor:factor}):[]),...t.reports(w,0,1,s=>s.sport==='STRENGTH')]});t.step(w,{day:6,observations:t.reports(w,1,7,s=>s.sport==='STRENGTH')});}
 return out;};}
const scenarios=[];
for(const cls of Object.keys(CLASSES))for(const asOf of ['2026-11-01','2026-11-02'])scenarios.push([`weekZero ${cls} asOf=${asOf}`,weekZero(cls,asOf)]);
for(const cls of Object.keys(CLASSES))for(const asOf of ['2026-11-01','2026-11-02'])scenarios.push([`timely ${cls} asOf=${asOf}`,timely(cls,asOf,{})]);
for(const cls of ['EASY_CURRENT','EASY_UNKNOWN','RACE_10K'])scenarios.push([`timely-short70 ${cls}`,timely(cls,'2026-11-01',{factor:0.7})]);
for(const cls of ['EASY_CURRENT','EASY_UNKNOWN','EASY_LOW','RACE_10K'])for(const days of [10,18,26,35])for(const demo of [20,30,45])scenarios.push([`returnDemo ${cls} days=${days} demo=${demo}`,returnDemo(cls,days,demo)]);
for(const cls of ['EASY_CURRENT','QUALITY_FAMILIAR','RACE_10K','EASY_LOW'])for(const W of [1,2,3,4,5])scenarios.push([`neverReported ${cls} W=${W}`,neverReported(cls,W)]);
for(const cls of ['EASY_CURRENT','EASY_UNKNOWN','QUALITY_FAMILIAR','RACE_10K'])scenarios.push([`lateReporter ${cls}`,lateReporter(cls,1)],[`lateReporterShort ${cls}`,lateReporter(cls,0.7)]);
for(const cls of Object.keys(CLASSES))scenarios.push([`midweekUnreported ${cls}`,midweekUnreported(cls)],[`lateSingle ${cls}`,lateSingle(cls)],[`skippedReview ${cls}`,skippedReview(cls)]);
const families={},differing=[];let generationFailures=0;
for(const [name,run] of scenarios){
 const A=run(mods.F3),B=run(mods.WT),fam=name.split(' ')[0];families[fam]??={scenarios:0,identical:0,differing:0};families[fam].scenarios++;
 if(A.some(x=>x.gen)||B.some(x=>x.gen))generationFailures++;
 const steps=[];for(let i=0;i<Math.max(A.length,B.length);i++){const a=JSON.stringify({...A[i],reason:undefined}),b=JSON.stringify({...B[i],reason:undefined});if(a!==b)steps.push({step:i,F3:A[i],WT:B[i]});}
 if(steps.length){families[fam].differing++;differing.push({scenario:name,steps});}else families[fam].identical++;
}
// The late shortened reporter against the same facts reported on time, on this worktree: run minutes per session the week holds before its review.
const beyondTimely=[];
for(const cls of ['EASY_CURRENT','EASY_UNKNOWN','QUALITY_FAMILIAR','RACE_10K']){
 const late=[],timelyOut=[];const L=tl(mods.WT,cls,'2026-11-01',late),T=tl(mods.WT,cls,'2026-11-01',timelyOut);if(!L||!T)continue;
 for(let w=0;w<8;w++){
  const before=t=>t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='RUN').map(s=>s.prescription.durationMinutes);
  L.step(w,{day:1,hour:'07',observations:[...(w>0?L.reports(w-1,0,7,s=>s.sport==='RUN',{minutesFactor:0.7}):[]),...L.reports(w,0,1,s=>s.sport==='STRENGTH')]});
  T.step(w,{day:1,hour:'07',observations:T.reports(w,0,1,undefined,{minutesFactor:0.7})});
  const l=before(L),m=before(T),sum=a=>a.reduce((x,y)=>x+y,0);
  if(sum(l)>sum(m)||Math.max(0,...l)>Math.max(0,...m))beyondTimely.push({cls,week:w,late:l,timely:m});
  L.step(w,{day:6,observations:L.reports(w,1,7,s=>s.sport==='STRENGTH')});T.step(w,{day:6,observations:T.reports(w,1,7,undefined,{minutesFactor:0.7})});
 }
}
fs.rmSync(tmp,{recursive:true,force:true});
const EXPECTED=['lateReporterShort'],unexpected=differing.filter(d=>!EXPECTED.includes(d.scenario.split(' ')[0]));
console.log(JSON.stringify({check:'R7C-P7-DIFFERENTIAL',base:{revision:'R7C-FREEZE-3',commit:F3},head,worktreeRuntime:true,scenarios:scenarios.length,generationFailures,families,expectedToDiffer:EXPECTED,unexpectedDiffering:unexpected.map(d=>d.scenario),beyondTimely,differing},null,1));
