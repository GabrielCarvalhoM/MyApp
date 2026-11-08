// QRE-R7D-PHASE5-REVIEW-r1 path probe (read-only): the changed paths under retroactive, late, re-sent and answered inputs, on a runtime copy
// (--root, a `git archive` extraction; never the repository). Shapes are the directed tests' own (R7D-F13, R7D-F14 intakes; synthetic athletes).
//   node qre-p5-paths.mjs --root <extracted root> [--label name]
import path from 'node:path';import {pathToFileURL} from 'node:url';
const arg=k=>{const i=process.argv.indexOf(k);return i>=0?process.argv[i+1]:null;};
const ROOT=arg('--root');if(!ROOT)throw Error('--root');
const {generateProgram,evaluateProgram}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/r6-index.mjs')).href);
const {loadR6Policy}=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/r6-authority.mjs')).href);
const RT=loadR6Policy().operational.return;
const ELIG=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const offset=m=>(m<0?'-':'+')+String(Math.floor(Math.abs(m)/60)).padStart(2,'0')+':'+String(Math.abs(m)%60).padStart(2,'0');
const live=s=>!!s?.prescription&&s.status!=='SKIPPED';
const intake=({id,asOf,startDate,weeks,tz,runExperience,strengthExperience,recent,goals,equipment,schedule})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,startDate,weeks,timezoneOffsetMinutes:tz,
 athlete:{ageEligible:true,eligibility:ELIG(asOf),id,runExperience,strengthExperience,recent,goals,equipment},schedule});
const F13=intake({id:'ath-f13-dana',asOf:'2026-11-15',startDate:'2026-11-16',weeks:16,tz:-300,runExperience:'NOVICE',strengthExperience:'NOVICE',recent:{runDaysPerWeek:2,runMinutesPerWeek:60,longestRunMinutes:35,strengthDaysPerWeek:1},goals:{run:'REGULAR',strength:'GENERAL'},equipment:['BODYWEIGHT','BANDS'],schedule:{runDays:[0,2,5],strengthDays:[3],runMinutes:35,strengthMinutes:30,longRunDay:5,longRunMinutes:50}});
const F14=intake({id:'ath-f14-chiara',asOf:'2026-12-12',startDate:'2026-12-14',weeks:12,tz:60,runExperience:'INTERMEDIATE',strengthExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:1},goals:{run:'REGULAR',strength:'HYPERTROPHY'},equipment:['DUMBBELLS','BENCH','BODYWEIGHT','BANDS'],schedule:{runDays:[1,3,6],strengthDays:[0,4],runMinutes:45,strengthMinutes:50,longRunDay:6,longRunMinutes:80}});
const asPrescribed=(p,s,{completed=true,id=null}={})=>{const x=s.prescription,actual={completed};
 if(completed){actual.minutes=x.durationMinutes;if(x.modality==='STRENGTH')actual.exercises=x.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,...(e.load.mode==='BODYWEIGHT'?{load:{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}}:e.load.mode==='KNOWN'?{load:{value:e.load.value,unit:e.load.unit??'KG',convention:e.load.convention}}:{}),...(Number.isFinite(e.rir)?{rir:e.rir}:{})}))}));}
 return {eventId:id??`t-${s.id}${completed?'':'-nd'}`,athleteId:p.athleteId,sessionId:s.id,actual,response:{performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN'},occurrenceDate:s.date};};
const sessions=(p,w,sport)=>p.weeks[w].sessions.filter(s=>live(s)&&(!sport||s.sport===sport));
function timeline(input){
 const g=generateProgram(structuredClone(input));if(g.status!=='PROPOSED')throw Error(g.reason);
 const t={p:g.program,ledger:[],ref:null,model:null,tz:input.timezoneOffsetMinutes??0,n:0,results:[]};
 t.step=(at,{kind='WEEKLY_REVIEW',observations=[],interruption=null,eventId=null}={})=>{
  const p=t.p,day=addDays(p.startDate,at.week*7+at.day),asOf=`${day}T${at.time}:00${offset(t.tz)}`;
  const review={version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,weekIndex:Math.floor((at.week*7+at.day)/7),event:{id:eventId??`t-${input.athlete.id}-s${++t.n}`,kind},eligibility:ELIG(day),observations:typeof observations==='function'?observations(p):observations,
   ...(interruption?{interruption}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{}),...(t.model?{athleteModel:t.model}:{})};
  const r=evaluateProgram(p,review);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;t.model=r.updatedModel??t.model;if(r.proposal)t.p=r.proposal;t.results.push(r);return r;};
 return t;
}
const rows=(p,w)=>sessions(p,w,'STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>({...e,session:s.id})));
const dose=(p,w)=>rows(p,w).map(e=>`${e.id}:${e.sets}x${e.reps}@${e.rir}:${e.exposure?.kind??'-'}`);
const runs=(p,w)=>sessions(p,w,'RUN').map(s=>`${s.role}:${s.prescription.durationMinutes}`);
const brk={startDate:'2026-11-24',endDate:'2027-01-09',reasonCategory:'WORK',reason:'night shifts for seven weeks, no training at all',nonclinical:true};
const before=p=>[...sessions(p,0).map(s=>asPrescribed(p,s)),asPrescribed(p,sessions(p,1,'RUN').find(s=>s.day===0))];
const out={root:path.basename(ROOT),label:arg('--label'),probes:{}};const put=(k,v)=>{out.probes[k]=v;};
const summary=r=>({status:r.status,action:r.action??null,validity:r.planValidity?.status??null,question:r.question?.kind??null,asked:r.question?.unreported?.sessionIds?.length??null});
// P1. F13 answered, entry week strength NOT reported at the week-8 review (only runs): week 9 stays an entry week; then the week-8 strength
// reported late at the week-9 review together with week 9: history reads the entry week, week 10 is return step 2, at most normal-1 sets.
{const t=timeline(F13);t.step({week:7,day:6,time:'20:00'});t.step({week:7,day:6,time:'20:40'},{observations:before,interruption:brk});
 const r8=t.step({week:8,day:6,time:'20:00'},{observations:p=>sessions(p,8,'RUN').map(s=>asPrescribed(p,s))});const w9a=dose(t.p,9);
 const r9=t.step({week:9,day:6,time:'20:00'},{observations:p=>[...sessions(p,8,'STRENGTH').map(s=>asPrescribed(p,s)),...sessions(p,9).map(s=>asPrescribed(p,s))]});
 put('P1_lateEntryReport',{r8:summary(r8),week9AfterR8:w9a,r9:summary(r9),week10:dose(t.p,10),week11:dose(t.p,11),marker9:t.p.stateTrace[9]?.strength?.returnEntry??null,marker10:t.p.stateTrace[10]?.strength?.returnEntry??null});}
// P2. F13 answered, then the entry week reported not done at all (strength and runs): the marker must stay; week 9 an entry week again.
{const t=timeline(F13);t.step({week:7,day:6,time:'20:00'});t.step({week:7,day:6,time:'20:40'},{observations:before,interruption:brk});
 const r8=t.step({week:8,day:6,time:'20:00'},{observations:p=>sessions(p,8).map(s=>asPrescribed(p,s,{completed:false}))});
 put('P2_entryWeekMissed',{r8:summary(r8),week9:dose(t.p,9),runs9:runs(t.p,9),marker9:t.p.stateTrace[9]?.strength?.returnEntry??null});}
// P3. F13 answered, then a named correction of the break (start one week later, same end) a review later: the return re-plans; strength entry
// still from the marker; deterministic across two runs.
{const go=()=>{const t=timeline(F13);t.step({week:7,day:6,time:'20:00'});const a=t.step({week:7,day:6,time:'20:40'},{observations:before,interruption:{...brk,episodeId:'trip-1'}});
  const c=t.step({week:7,day:6,time:'21:30'},{interruption:{...brk,startDate:'2026-12-01',episodeId:'trip-1'}});return {t,a,c};};
 const x=go(),y=go();put('P3_namedCorrection',{answer:summary(x.a),correction:summary(x.c),week8:dose(x.t.p,8),week9:dose(x.t.p,9),runs8:runs(x.t.p,8),deterministic:JSON.stringify(x.t.results)===JSON.stringify(y.t.results)});}
// P4. QRE-P4-F01 answered directly: (a) every listed session reported done as prescribed; (b) every listed session reported not done. No question
// after the answer; (a) plans the credit, (b) the zero reading; neither asks again at the next review (no repetitive question).
for(const [k,done] of [['P4a_answerDone',true],['P4b_answerNotDone',false]]){const t=timeline(F13);const q=t.step({week:7,day:6,time:'20:00'});const ids=new Set(q.question?.unreported?.sessionIds??[]);
 const all=t.p.weeks.flatMap(w=>w.sessions);const a=t.step({week:7,day:6,time:'20:40'},{observations:p=>[...p.weeks.flatMap(w=>w.sessions).filter(s=>ids.has(s.id)&&live(s)).map(s=>asPrescribed(p,s,{completed:done})),...(done?p.weeks.slice(0,8).flatMap(w=>w.sessions.filter(s=>live(s)&&s.sport==='STRENGTH')).map(s=>asPrescribed(p,s)):[])]});
 const n=t.step({week:8,day:6,time:'20:00'},{observations:p=>sessions(p,8).map(s=>asPrescribed(p,s))});
 put(k,{question:summary(q),listed:ids.size,listedAreRuns:[...ids].every(id=>/run/.test(id)),answer:summary(a),runs8:runs(t.p,8),next:summary(n),runs9:runs(t.p,9)});}
// P5. The same question re-sent twice (the empty review again an hour later): same question, same sessions, no plan.
{const t=timeline(F13);const q1=t.step({week:7,day:6,time:'20:00'}),q2=t.step({week:7,day:6,time:'21:00'});put('P5_questionAgain',{q1:summary(q1),q2:summary(q2),sameSessions:JSON.stringify(q1.question?.unreported?.sessionIds)===JSON.stringify(q2.question?.unreported?.sessionIds)});}
// P6. A SHORT break after the F13 return's entry week was executed: the marker is gone, the short break resumes the state (no entry restarted).
{const t=timeline(F13);t.step({week:7,day:6,time:'20:00'});t.step({week:7,day:6,time:'20:40'},{observations:before,interruption:brk});t.step({week:8,day:6,time:'20:00'},{observations:p=>sessions(p,8).map(s=>asPrescribed(p,s))});
 const w9=dose(t.p,9);const r=t.step({week:9,day:6,time:'20:00'},{observations:[],interruption:{startDate:addDays(t.p.startDate,63),endDate:addDays(t.p.startDate,67),reasonCategory:'TRAVEL',reason:'short trip',nonclinical:true}});
 put('P6_shortAfter',{r:summary(r),week9before:w9,week10:dose(t.p,10),marker10:t.p.stateTrace[10]?.strength?.returnEntry??null});}
// P7. W-D49 arm B (valid history) with rotation every two weeks: control, should follow the exercises' own steps (compare with the frozen runtime).
{const input={...F14,athlete:{...F14.athlete,exerciseRotationPreference:'EVERY_2_WEEKS'}};const t=timeline(input);
 t.step({week:3,day:6,time:'20:00'},{observations:p=>sessions(p,0).map(s=>asPrescribed(p,s)),interruption:{startDate:'2026-12-21',endDate:'2027-01-08',reasonCategory:'FAMILY',reason:'family visit abroad',nonclinical:true}});
 const w4=dose(t.p,4);t.step({week:4,day:6,time:'20:00'},{observations:p=>sessions(p,4).map(s=>asPrescribed(p,s))});put('P7_controlBRotation',{week4:w4,week5:dose(t.p,5),week6:dose(t.p,6),week7:dose(t.p,7)});}
// P8. W-D49 arm A (no strength history) with a partial entry week: week 4 runs and the day-0 strength session done as prescribed, the day-4 session
// not done. Exercises only on day 4 were never executed, before the break or in the entry week: what do they get in week 5 (marker ended by day 0)?
{const t=timeline(F14);t.step({week:3,day:6,time:'20:00'},{observations:[],interruption:{startDate:'2026-12-14',endDate:'2027-01-08',reasonCategory:'FAMILY',reason:'family visit abroad',nonclinical:true}});
 const w4=dose(t.p,4);const r=t.step({week:4,day:6,time:'20:00'},{observations:p=>[...sessions(p,4,'RUN').map(s=>asPrescribed(p,s)),...sessions(p,4,'STRENGTH').map(s=>asPrescribed(p,s,{completed:s.day===0}))]});
 const byDay=(p,w)=>sessions(p,w,'STRENGTH').map(s=>s.id+' '+s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.rir}:${e.exposure?.kind??'-'}`).join(', '));
 put('P8_partialEntryWeek',{week4:w4,r:summary(r),week5:byDay(t.p,5),week6:byDay(t.p,6),marker5:t.p.stateTrace[5]?.strength?.returnEntry??null});}
// P9. W-D49 arm A exactly as T43 (week 4 executed as prescribed; the loaded rows' chosen loads left out, as the test's client does), and P10 the same
// with a usable load logged for every loaded row (12 kg per hand, convention as planned): the exposure kinds of weeks 5 to 7 by day.
for(const [k,load] of [['P9_armA_noLoads',null],['P10_armA_withLoads',12]]){const t=timeline(F14);t.step({week:3,day:6,time:'20:00'},{observations:[],interruption:{startDate:'2026-12-14',endDate:'2027-01-08',reasonCategory:'FAMILY',reason:'family visit abroad',nonclinical:true}});
 const withLoad=(p,s)=>{const o=asPrescribed(p,s);if(load!==null&&s.sport==='STRENGTH')for(const e of o.actual.exercises){const pe=s.prescription.exercises.find(x=>x.id===e.id);if(pe&&pe.load.mode!=='BODYWEIGHT')e.sets=e.sets.map(x=>({...x,load:{value:load,unit:'KG',convention:pe.load.convention??'PER_HAND'}}));}return o;};
 const r=t.step({week:4,day:6,time:'20:00'},{observations:p=>sessions(p,4).map(s=>withLoad(p,s))});
 const r5=t.step({week:5,day:6,time:'20:00'},{observations:p=>sessions(p,5).map(s=>withLoad(p,s))});
 const byDay=(p,w)=>sessions(p,w,'STRENGTH').map(s=>s.id+' '+s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.rir}:${e.exposure?.kind??'-'}`).join(', '));
 put(k,{r:summary(r),r5:summary(r5),week5:byDay(t.p,5),week6:byDay(t.p,6),week7:byDay(t.p,7)});}
console.log(JSON.stringify(out,null,1));
