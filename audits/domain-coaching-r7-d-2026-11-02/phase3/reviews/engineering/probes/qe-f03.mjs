// QE engineering check R7-D Phase 3 (independent judge): F03 machine round trip and "no computed machine load anywhere", across paths the
// directed tests do not walk (race window, nonclinical return, fatigue, substitution, equipment change, long silence, pound logs).
//   node qe-f03.mjs <root holding CoachingCore>
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=path.resolve(process.argv[2]);
const imp=p=>import(pathToFileURL(path.join(root,'CoachingCore',p)).href);
const H=await imp('r7/b/fixtures/helpers.mjs');
const {opts,K,FULL,elig,intake,review,live,runs,addDays,evaluateProgram,generateProgram}=H;
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const PLATE={'leg-press':10,'machine-chest-press':5,'seated-cable-row':5,'lat-pulldown':5,'leg-curl-machine':5,'leg-extension-machine':5};
const LB=0.45359237;
const MK=[K('leg-press',3,10,140,'MACHINE_STACK'),K('machine-chest-press',3,10,50,'MACHINE_STACK'),K('lat-pulldown',3,10,55,'MACHINE_STACK'),K('seated-cable-row',3,12,50,'MACHINE_STACK')];
/** A log of a session as the athlete does it: the next setting on a numberless row (or R if `fits` is false), the row's value otherwise. */
function log(p,s,{fits=true,unit='KG',response=OK,id='q'}={}){
 const sets=e=>{
  if(e.load.mode==='BODYWEIGHT')return Array.from({length:e.sets},()=>({reps:e.reps,rir:e.rir}));
  const kg=e.load.nextSetting?(fits?e.load.nextSetting.aboveKg+(PLATE[e.id]??5):e.load.nextSetting.aboveKg):e.load.mode==='KNOWN'?e.load.value:30;
  const reps=e.load.nextSetting&&!fits?e.load.nextSetting.fallbackReps??e.reps:e.reps;
  const value=unit==='LB'&&e.load.convention==='MACHINE_STACK'?Math.round(kg/LB):kg;
  return Array.from({length:e.sets},()=>({reps,rir:e.rir,load:{value,unit,convention:e.load.convention}}));
 };
 return {eventId:`${id}-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='AM'?'08':'19'}:00:00Z`,response,actual:{completed:true,minutes:s.prescription.durationMinutes,exercises:s.prescription.modality==='STRENGTH'?s.prescription.exercises.map(e=>({id:e.id,sets:sets(e)})):undefined}};
}
const kgOf=l=>l?.unit==='LB'?Math.round(l.value*LB*2)/2:l?.value;
/** A scenario: intake overrides and per-week review overrides; every plan in force and every proposal is checked (P16b-like, all weeks). */
function scenario(name,o,{weeks,step=()=>({}),logOpts=()=>({})}){
 const g=generateProgram(intake(o),opts);
 if(!g.program)return {name,generation:g.status,reason:g.reason};
 const t={p:g.program,ledger:[],ref:null},supplied=new Map(),add=(id,v)=>{if(!Number.isFinite(v))return;if(!supplied.has(id))supplied.set(id,new Set());supplied.get(id).add(Math.round(v*1000)/1000);};
 for(const k of o.knownExercises??[])if(k.load.convention==='MACHINE_STACK')add(k.id,kgOf(k.load));
 const fabricated=[],statuses=[],machineRowsSeen=new Set(),steps=[];
 const check=(plan,at)=>{for(const w of plan.weeks)for(const s of w.sessions.filter(live))for(const e of s.prescription.exercises??[]){if(e.load?.convention!=='MACHINE_STACK')continue;machineRowsSeen.add(e.id+':'+e.load.mode+(e.load.nextSetting?':STEP':''));if(e.load.mode==='KNOWN'&&!supplied.get(e.id)?.has(Math.round(e.load.value*1000)/1000))fabricated.push(`${at}:${s.id}:${e.id}:${e.load.value}`);if(e.load.mode!=='KNOWN'&&Number.isFinite(e.load.value))fabricated.push(`${at}:${s.id}:${e.id}:non-KNOWN row states ${e.load.value}`);}};
 check(t.p,'generate');
 for(let w=0;w<weeks;w++){
  const x=step(t,w)??{};if(x.skip)continue;
  const lo=logOpts(t,w)??{};
  const observations=x.observations??t.p.weeks[w].sessions.filter(s=>live(s)&&(x.keep?.(s)??true)).map(s=>log(t.p,s,{...lo,id:name+'-w'+w}));
  for(const ob of observations)for(const e of ob.actual?.exercises??[])for(const z of e.sets??[])if(z.load?.convention==='MACHINE_STACK')add(e.id,kgOf(z.load));
  for(const c of x.loadConfirmations??[])add(c.exerciseId,kgOf(c));
  const rv={...review(t.p,w,{observations,...(x.review??{})}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})};
  const r=evaluateProgram(t.p,rv,opts);
  statuses.push(`${w}:${r.status}:${r.action}`);
  if(r.proposal)check(r.proposal,'w'+w+'-'+r.action);
  t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;
  steps.push({w,status:r.status,questions:(r.loadQuestions??[]).filter(q=>/MACHINE|UNIT|ABOVE/.test(q.reason??'')).map(q=>q.exerciseId+':'+q.reason)});
  if(x.after)x.after(t,r);
 }
 return {name,statuses,machineRows:[...machineRowsSeen].sort(),fabricated,questionsByWeek:steps.filter(s=>s.questions.length).map(s=>`${s.w}:${s.questions.join(',')}`)};
}
const MSCHED={runDays:[1,3,6],strengthDays:[0,2,4],longRunDay:6,runMinutes:60,longRunMinutes:90};
const out=[];
// 1. Race window: a 10K at week 8 with machine lifts (build, taper, race week, post-event).
out.push(scenario('RACE_10K',{id:'qe-f03-race',weeks:12,goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',8*7+6)}},strength:'RUNNING_SUPPORT'},equipment:FULL,knownExercises:MK,recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:3},schedule:MSCHED},{weeks:12}));
// 2. Half marathon, STRENGTH goal machine MAIN under LOAD progression, through taper.
out.push(scenario('RACE_HALF_STRENGTH',{id:'qe-f03-half',weeks:16,goals:{run:{kind:'RACE',event:{kind:'HALF_MARATHON',date:addDays('2026-11-02',13*7+6)}},strength:'STRENGTH'},equipment:['MACHINES','DUMBBELLS','BENCH'],knownExercises:MK,recent:{runDaysPerWeek:3,runMinutesPerWeek:180,longestRunMinutes:90,strengthDaysPerWeek:3},schedule:MSCHED},{weeks:16}));
// 3. Moderate nonclinical return (14 days) mid-program, then re-entry weeks.
out.push(scenario('RETURN_MODERATE',{id:'qe-f03-ret',weeks:12,goals:{run:'NONE',strength:'HYPERTROPHY'},equipment:['MACHINES','DUMBBELLS','BENCH'],knownExercises:MK,recent:{strengthDaysPerWeek:3},schedule:{runDays:[],strengthDays:[0,2,4],longRunDay:undefined,runMinutes:undefined,longRunMinutes:undefined}},{weeks:11,step:(t,w)=>w===3||w===4?{skip:true}:w===5?{review:{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:t.p.weeks[3].startDate,endDate:addDays(t.p.weeks[4].startDate,6),reasonCategory:'VACATION',reason:'Holiday',nonclinical:true}},observations:[]}:{}}));
// 4. Long return (> moderate window): restart.
out.push(scenario('RETURN_LONG',{id:'qe-f03-retl',weeks:16,goals:{run:'NONE',strength:'HYPERTROPHY'},equipment:['MACHINES','DUMBBELLS','BENCH'],knownExercises:MK,recent:{strengthDaysPerWeek:3},schedule:{runDays:[],strengthDays:[0,2,4],longRunDay:undefined,runMinutes:undefined,longRunMinutes:undefined}},{weeks:14,step:(t,w)=>w>=3&&w<=7?{skip:true}:w===8?{review:{day:1,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:t.p.weeks[3].startDate,endDate:addDays(t.p.weeks[7].startDate,6),reasonCategory:'WORK',reason:'Work project',nonclinical:true}},observations:[]}:{}}));
// 5. Systemic and local fatigue events between weekly reviews; and a substitution of a machine (preference) and an equipment change.
out.push(scenario('EVENTS',{id:'qe-f03-ev',weeks:12,goals:{run:'GENERAL',strength:'HYPERTROPHY'},equipment:FULL,knownExercises:MK,recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:3},schedule:MSCHED},{weeks:12,step:(t,w)=>{
 if(w===2)return {after:(t)=>{const r=evaluateProgram(t.p,{...review(t.p,3,{day:1,hour:'07:00:00',kind:'SYSTEMIC_FATIGUE',signals:{systemicFatigue:true}}),actualLedger:t.ledger},opts);if(r.proposal)t.p=r.proposal;t.ledger=r.actualLedger??t.ledger;}};
 if(w===4)return {after:(t)=>{const r=evaluateProgram(t.p,{...review(t.p,5,{day:1,hour:'07:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'leg-press',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE'}}),actualLedger:t.ledger},opts);if(r.proposal)t.p=r.proposal;t.ledger=r.actualLedger??t.ledger;}};
 if(w===6)return {after:(t)=>{const r=evaluateProgram(t.p,{...review(t.p,7,{day:1,hour:'07:00:00',kind:'LOCAL_FATIGUE',signals:{localFatigue:'LOWER'}}),actualLedger:t.ledger},opts);if(r.proposal)t.p=r.proposal;t.ledger=r.actualLedger??t.ledger;}};
 return {};}}));
// 6. Pounds: the athlete's machine reads in pounds; every set logged in LB (the next setting and R as the machine shows them).
out.push(scenario('POUNDS',{id:'qe-f03-lb',weeks:8,goals:{run:'NONE',strength:'HYPERTROPHY'},equipment:['MACHINES','DUMBBELLS','BENCH'],knownExercises:[K('leg-press',3,10,140,'MACHINE_STACK'),K('seated-cable-row',3,12,50,'MACHINE_STACK')],recent:{strengthDaysPerWeek:3},schedule:{runDays:[],strengthDays:[0,2,4],longRunDay:undefined,runMinutes:undefined,longRunMinutes:undefined}},{weeks:8,logOpts:()=>({unit:'LB'})}));
// 7. Adverse every other week (REGRESS paths), athlete whose plate never fits.
out.push(scenario('ADVERSE_NOFIT',{id:'qe-f03-adv',weeks:12,goals:{run:'NONE',strength:'STRENGTH'},equipment:['MACHINES','DUMBBELLS','BENCH'],knownExercises:MK,recent:{strengthDaysPerWeek:3},schedule:{runDays:[],strengthDays:[0,2,4],longRunDay:undefined,runMinutes:undefined,longRunMinutes:undefined}},{weeks:10,logOpts:(t,w)=>({fits:false,response:w%2?{...OK,recovery:'ADVERSE',nextDayFunction:'IMPAIRED'}:OK})}));
console.log(JSON.stringify(out,null,1));
