// COACHING CORE — STATE MODEL CLOSURE self-challenge (Founder §23): the author's own attempt to contaminate HistoricalState through every
// channel the Founder names — weekly review, return, re-establishment, progression, week boundary, equipment, schedule, event, partial workout,
// no workout, a late historical correction, cross-sport and cross-exercise — by equivalence classes, not by exhaustive exploration.
//
// Two oracles, both read through the public surface:
//  FACTS   every exercise's history is supported by the record: its load is one the athlete logged (or the intake's reported dose, or a
//          re-establishment ceiling at or below one logged), its last-performed date is a date the record shows it executed, and its earned
//          progression credit never exceeds the successful exposures at that load.
//  NO-OP   a handler that brings no new fact leaves HistoricalState exactly as it was (P1, P3), and a week boundary or clock alone does the
//          same (P2), for the same program.
// Read-only; synthetic; DEV_TEST_ONLY; prints JSON. SM_ROOT points at a CoachingCore copy (default: the live one).
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),repo=path.resolve(here,'../../..');
const root=process.env.SM_ROOT?path.resolve(repo,process.env.SM_ROOT):path.join(repo,'CoachingCore');
const L=rel=>import(pathToFileURL(path.join(root,rel)).href);
const {generateProgram,evaluateProgram}=await L('src/r6-index.mjs'),A=await L('src/r6-adaptation.mjs'),{devAuthority}=await L('r6/fixtures/dev-authority.mjs');
// On STATE-EVIDENCE-FREEZE-1 there is no public HistoricalState: history is then read as the judges read it, through a what-if return that is
// evaluated and never applied (a Monday-Tuesday break reported Wednesday; its first day holds no strength session, so nothing is asked).
const historicalStateOf=A.historicalStateOf??((program,{asOf,actualLedger=[]},o)=>{
 const day=asOf.slice(0,10),k=program.weeks.findIndex(x=>day>=x.startDate&&day<=onDate7(x.startDate,6));if(k<0)return null;
 const d=program.weeks[k].startDate,r=evaluateProgram(program,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${onDate7(d,2)}T06:00:00Z`,weekIndex:k,event:{id:`sc-whatif-${N++}`,kind:'RETURN_AFTER_PAUSE'},eligibility:elig(onDate7(d,2)),observations:[],actualLedger,interruption:{days:2,startDate:d,endDate:onDate7(d,1),reasonCategory:'TRAVEL',reason:'Work travel'}},o);
 const B=r.proposal?r.proposal.decisions.filter(x=>x.action==='REESTABLISH').at(-1):null;
 if(!B?.interruption?.entry)return {whatIf:r.status+'/'+r.action,week:k,strength:{exercises:{}},run:{},state:{run:{},strength:{exercises:{}}}};
 const e=B.interruption.entry;
 return {version:'WHAT-IF-RETURN',week:k,strength:{exercises:Object.fromEntries(Object.entries(e.strength.exercises).map(([id,x])=>[id,{mode:x.mode,lastExecutedLoad:Number.isFinite(x.load)?x.load:null,convention:x.convention??null,lastPerformedAt:x.lastPerformed??null,lastExecutedSets:x.lastExecutedSets??null,earnedProgress:{loadTick:x.loadTick??0,stepEarned:false},returnStep:Number.isInteger(x.returnStep)?x.returnStep:null}]))},
  run:{mode:e.run.mode,achieved:e.run.achieved,longestContinuous:e.run.longestContinuous??null},state:{run:e.run,strength:e.strength}};
});
const onDate7=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,convention='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const KNOWN=[K('back-squat',3,5,80),K('db-bench-press',3,8,18,'PER_HAND')];
const intake=id=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:KNOWN,exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100}});
let N=0;
const at=(p,w,day,hour,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`sc-${w}-${N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
function obs(p,s,{kg=null,set=null,actual=null}={}){const pr=s.prescription,a={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')a.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>{const x={load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:kg?.(e.id,e)??(e.load.mode==='KNOWN'?e.load.value:20),unit:'KG',convention:e.load.convention},reps:e.reps,rir:e.rir};return set?set(e.id,x):x;})}));
 return {eventId:`sc-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:actual??a,response:{...OK}};}
const live=s=>s.prescription&&s.status!=='SKIPPED',SAT=s=>s.sport==='STRENGTH'&&s.day===5,WED=s=>s.sport==='STRENGTH'&&s.day===2,RUN=s=>s.sport==='RUN';
const ev=(t,review)=>{const r=evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.last=r;return r;};
const weekly=(t,w,keep=()=>true,o={})=>ev(t,at(t.p,w,6,'21:00:00',{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s,typeof o==='function'?o(s):o))}));
const perDay=(t,w,keep,o={})=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))ev(t,at(t.p,w,s.day,'21:00:00',{observations:[obs(t.p,s,typeof o==='function'?o(s):o)]}));
 ev(t,at(t.p,w+1,0,'06:00:00',{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day===6).map(s=>obs(t.p,s,typeof o==='function'?o(s):o))}));};
const start=(id,weeks)=>{const g=generateProgram(intake(id),opts);if(!g.program)throw Error(g.status+' '+g.reason);const t={p:g.program,ledger:[]};for(let w=0;w<weeks;w++)weekly(t,w);return t;};
const copy=t=>({p:t.p,ledger:t.ledger});
const brk=(s,e,x={})=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(e)-Date.parse(s))/864e5)+1,startDate:s,endDate:e,reasonCategory:'TRAVEL',reason:'Work travel',...x}});
const hist=(t,w,day=0,hour='06:00:00')=>historicalStateOf(t.p,{asOf:`${addDays(t.p.weeks[w].startDate,day)}T${hour}Z`,actualLedger:t.ledger},opts);
const stripDates=H=>JSON.stringify({strength:H.strength,run:H.run});

/** Every load the record shows logged for an exercise, and every date it shows executed. */
function record(t){
 const loads={},dates={};
 for(const o of t.ledger){
  if(o.conflicted)continue;
  for(const [id,l] of Object.entries(o.logs??{})){
   if(Number.isFinite(l.load)){(loads[id]??=new Set()).add(l.load);}
   if(o.actual?.completed===true||Number(o.actual?.minutes)>0)(dates[id]??=new Set()).add(o.localDate);
  }
  if(o.context?.sport==='STRENGTH'&&(o.actual?.completed===true)&&!Object.keys(o.logs??{}).length){
   // A completed strength report without exercise detail performs every exercise of its session.
   const s=t.p.weeks.flatMap(w=>w.sessions).find(x=>x.id===o.sessionId);
   for(const e of s?.prescription?.exercises??[])(dates[e.id]??=new Set()).add(o.localDate);
  }
 }
 return {loads,dates};
}
/** FACTS oracle: no historical value is unsupported by the record. */
function factsViolations(label,t,H){
 const v=[],{loads,dates}=record(t),known=Object.fromEntries(KNOWN.map(k=>[k.id,k.dose?.load?.value??k.load.value]));
 for(const [id,h] of Object.entries(H.strength.exercises)){
  const L=[...(loads[id]??[])],D=[...(dates[id]??[])].sort();
  if(Number.isFinite(h.lastExecutedLoad)&&h.mode==='KNOWN'){
   const ok=L.some(x=>Math.abs(x-h.lastExecutedLoad)<1e-9)||Math.abs((known[id]??NaN)-h.lastExecutedLoad)<1e-9;
   if(!ok)v.push({label,id,why:'load not in the record',load:h.lastExecutedLoad,logged:L});
   if(L.length&&h.lastExecutedLoad>Math.max(...L,known[id]??-Infinity)+1e-9)v.push({label,id,why:'load above every logged load',load:h.lastExecutedLoad,logged:L});
  }
  if(h.lastPerformedAt&&D.length&&!D.includes(h.lastPerformedAt)&&h.lastPerformedAt>D.at(-1))v.push({label,id,why:'performed date after every executed date',date:h.lastPerformedAt,executed:D});
  if((h.earnedProgress?.loadTick??0)>0&&Number.isFinite(h.lastExecutedLoad)){
   const atLoad=t.ledger.filter(o=>!o.conflicted&&Number.isFinite(o.logs?.[id]?.load)&&Math.abs(o.logs[id].load-h.lastExecutedLoad)<1e-9&&o.logs[id].repsMet!==false).length;
   if(h.earnedProgress.loadTick>atLoad)v.push({label,id,why:'credit above the exposures at that load',tick:h.earnedProgress.loadTick,exposures:atLoad});
  }
 }
 return v;
}

const out={probe:'R7ASM-SELF-CHALLENGE',root:process.env.SM_ROOT??'LIVE',classes:[],violations:[]};
const record1=(name,v)=>{out.classes.push({name,violations:v.length});out.violations.push(...v);};

// C1 — the weekly review: P40's split, every later week reviewed with the Saturday lift missed.
{
 const t=start('sc-c1',2);perDay(t,2,s=>!SAT(s));
 const before=stripDates(hist(t,3,0));
 for(let w=3;w<=7;w++)weekly(t,w,s=>!SAT(s));
 const H=hist(t,8,0),v=factsViolations('C1 review',t,H);
 for(const id of ['db-rdl','db-split-squat'])if(H.strength.exercises[id].lastExecutedLoad!==20)v.push({label:'C1 review',id,why:'a review moved an unexecuted load',load:H.strength.exercises[id].lastExecutedLoad});
 record1('C1 weekly review',v);
 // C2 — no-op handlers after that: no new fact, so history must not move.
 const base=stripDates(hist(t,8,0)),u=copy(t);
 ev(u,at(u.p,8,0,'07:00:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK']}}));
 ev(u,at(u.p,8,0,'08:00:00',{kind:'SCHEDULE_CHANGE',changes:{runMinutes:65}}));
 ev(u,at(u.p,8,0,'09:00:00',{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}));
 ev(u,at(u.p,8,0,'10:00:00',{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[addDays(u.p.weeks[8].startDate,3)]}}));
 ev(u,at(u.p,8,0,'11:00:00',{kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}));
 const after=stripDates(hist(u,8,0)),v2=[];
 if(after!==base)v2.push({label:'C2 no-op handlers',why:'a handler with no new fact moved history'});
 record1('C2 equipment, schedule, goal, unavailable day, fatigue (no new fact)',[...v2,...factsViolations('C2',u,hist(u,8,0))]);
 // C3 — the week boundary and the clock alone.
 const a=stripDates(hist(t,7,6,'23:30:00')),b=stripDates(hist(t,8,0,'00:30:00')),v3=[];
 if(a!==b)v3.push({label:'C3 week boundary',why:'the boundary alone moved history'});
 record1('C3 week boundary and clock',v3);
 if(before===after&&false)record1('unused',[]);
}
// C4 — a return and its re-entry, then a second return: nothing the athlete did not execute.
{
 const t=start('sc-c4',3);perDay(t,3,s=>!SAT(s));
 const d0=t.p.weeks[4].startDate;ev(t,at(t.p,4,0,'06:00:00',brk(addDays(d0,-16),addDays(d0,-1))));
 perDay(t,4,s=>s.day<3);weekly(t,5,()=>true,{kg:()=>20});
 const H=hist(t,6,0),v=factsViolations('C4 return',t,H);
 for(const [id,h] of Object.entries(H.strength.exercises))if(h.mode==='KNOWN'&&h.lastExecutedLoad>20+1e-9&&!['back-squat'].includes(id))v.push({label:'C4 return',id,why:'a load above the lifted 20',load:h.lastExecutedLoad});
 record1('C4 return and re-entry',v);
}
// C5 — re-establishment: five weeks with no strength at all, then one performed by effort.
{
 const t=start('sc-c5',2);
 for(let w=2;w<=6;w++)weekly(t,w,RUN);
 const H=hist(t,7,0),v=factsViolations('C5 reestablish',t,H);
 const rows=t.p.weeks[7].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.exposure?.kind));
 if(!rows.includes('REESTABLISH'))v.push({label:'C5 reestablish',why:'no re-establishment after five weeks without strength',rows:[...new Set(rows)]});
 weekly(t,7,()=>true,{kg:()=>15});
 const H2=hist(t,8,0);
 for(const [id,h] of Object.entries(H2.strength.exercises))if(h.mode==='KNOWN'&&h.lastExecutedLoad>Math.max(15,...[...(record(t).loads[id]??[0])])+1e-9)v.push({label:'C5 reestablish',id,why:'a load above what was re-established',load:h.lastExecutedLoad});
 record1('C5 re-establishment',v);
}
// C6 — progression: two development weeks executed in full, then one missed.
{
 const t=start('sc-c6',5),v=[];
 weekly(t,5);weekly(t,6);
 const H=hist(t,7,0);v.push(...factsViolations('C6 progression',t,H));
 for(const [id,h] of Object.entries(H.strength.exercises)){const L=[...(record(t).loads[id]??[])];
  if(h.mode==='KNOWN'&&L.length&&h.lastExecutedLoad>Math.max(...L)+1e-9)v.push({label:'C6 progression',id,why:'history above the heaviest logged',load:h.lastExecutedLoad,max:Math.max(...L)});}
 weekly(t,7,s=>!SAT(s));
 v.push(...factsViolations('C6 progression after a miss',t,hist(t,8,0)));
 record1('C6 progression',v);
}
// C7 — a partial workout and a session reported not done.
{
 const t=start('sc-c7',3),v=[];
 perDay(t,3,s=>!SAT(s),s=>WED(s)?{actual:{completed:true,minutes:5}}:{});
 v.push(...factsViolations('C7 partial',t,hist(t,4,0)));
 const u=start('sc-c7b',3);perDay(u,3,()=>true,s=>WED(s)?{actual:{completed:false,minutes:0}}:{});
 v.push(...factsViolations('C7 not done',u,hist(u,4,0)));
 const H=hist(u,4,0),wed=u.p.weeks[3].sessions.find(WED);
 for(const e of wed.prescription.exercises){const h=H.strength.exercises[e.id];if(h&&h.lastPerformedAt===wed.date)v.push({label:'C7 not done',id:e.id,why:'a session reported not done counts as performed'});}
 record1('C7 partial and not-done sessions',v);
}
// C8 — no workout at all for three weeks (weeks planned, nothing reported).
{
 const t=start('sc-c8',2),before=stripDates(hist(t,2,0)),v=[];
 for(let w=2;w<=4;w++)weekly(t,w,()=>false);
 const after=stripDates(hist(t,5,0));
 if(after!==before)v.push({label:'C8 no workout',why:'weeks with nothing reported moved history'});
 v.push(...factsViolations('C8 no workout',t,hist(t,5,0)));
 record1('C8 no workout',v);
}
// C9 — a late historical correction: a week reported as executed, then corrected to not done.
{
 const t=start('sc-c9',3),v=[];
 const sat=t.p.weeks[3].sessions.find(SAT),first=obs(t.p,sat);
 ev(t,at(t.p,3,5,'21:00:00',{observations:[first]}));
 const withIt=hist(t,3,6).strength.exercises['db-rdl'].lastExecutedLoad;
 ev(t,at(t.p,3,6,'21:00:00',{observations:[{...obs(t.p,sat),eventId:`${first.eventId}-fix`,supersedes:first.eventId,actual:{completed:false,minutes:0}}]}));
 const H=hist(t,4,0);
 if(H.strength.exercises['db-rdl'].lastExecutedLoad===withIt&&withIt!==20)v.push({label:'C9 correction',why:'the correction did not replace the fact',load:withIt});
 v.push(...factsViolations('C9 correction',t,H));
 record1('C9 late historical correction',v);
}
// C10 — cross-sport and cross-exercise isolation.
{
 const base=start('sc-c10',3),v=[];
 const runs=copy(base),none=copy(base);perDay(runs,3,RUN);perDay(none,3,()=>false);
 if(JSON.stringify(hist(runs,4,0).strength)!==JSON.stringify(hist(none,4,0).strength))v.push({label:'C10 cross-sport',why:'run evidence moved strength'});
 const lifts=copy(base);perDay(lifts,3,s=>s.sport==='STRENGTH');
 if(JSON.stringify(hist(lifts,4,0).run)!==JSON.stringify(hist(none,4,0).run))v.push({label:'C10 cross-sport',why:'strength evidence moved the run'});
 const satOnly=[...new Set(base.p.weeks[3].sessions.filter(SAT).flatMap(s=>s.prescription.exercises.map(e=>e.id)))].filter(id=>!base.p.weeks[3].sessions.some(s=>WED(s)&&s.prescription.exercises.some(e=>e.id===id)));
 const wed=copy(base);perDay(wed,3,s=>!SAT(s));
 for(const id of satOnly)if(JSON.stringify(hist(wed,4,0).strength.exercises[id])!==JSON.stringify(hist(none,4,0).strength.exercises[id]))v.push({label:'C10 cross-exercise',id,why:'another exercise moved it'});
 record1('C10 cross-sport and cross-exercise',v);
}
// C11 — an event change and a race week: the plan moves, history does not.
{
 const g=generateProgram({...intake('sc-c11'),athlete:{...intake('sc-c11').athlete,goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',13*7+6)}},strength:'STRENGTH'}}},opts);
 const v=[];
 if(!g.program)v.push({label:'C11 event',why:'no program: '+g.status});
 else{const t={p:g.program,ledger:[]};for(let w=0;w<4;w++)weekly(t,w);
  const before=stripDates(hist(t,4,0));
  ev(t,at(t.p,4,0,'07:00:00',{kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(t.p.goal.run.event.date,14)}}));
  if(stripDates(hist(t,4,0))!==before)v.push({label:'C11 event',why:'an event change moved history'});
  v.push(...factsViolations('C11 event',t,hist(t,4,0)));}
 record1('C11 event date change',v);
}
// C12 — order independence: a projection and an unrelated fact, both orders.
{
 const base=start('sc-c12',3),v=[];
 const plan=p=>at(p,3,0,'07:00:00',{kind:'SCHEDULE_CHANGE',changes:{runMinutes:65}});
 const fact=p=>at(p,3,1,'21:00:00',{observations:[obs(p,p.weeks[3].sessions.find(s=>RUN(s)&&s.day===1))]});
 const a=copy(base);ev(a,plan(a.p));ev(a,fact(a.p));
 const b=copy(base);ev(b,fact(b.p));ev(b,plan(b.p));
 if(stripDates(hist(a,3,2))!==stripDates(hist(b,3,2)))v.push({label:'C12 order',why:'the order of a projection and a fact changed history'});
 record1('C12 order independence',v);
}
out.classesRun=out.classes.length;out.totalViolations=out.violations.length;
console.log(JSON.stringify(out,null,1));
