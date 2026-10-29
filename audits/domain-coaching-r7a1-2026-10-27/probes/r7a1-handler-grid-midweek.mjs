// DOMAIN_COACHING_R7-A.1 handler-equivalence grid, evening variant: on each evening from Tuesday to Sunday, every pair of changes reported
// at 20:00 and 21:00 UTC (the athlete's clock), in both orders, compared on the whole plan from that week (every week's rows in order and every
// later state). An evening leaves the earlier days and that morning in the past (a PM session stays ahead until the day ends), so it reaches
// the handlers a Monday-morning grid cannot: a missed past key session moved later in the week, mid-week partial and weekly reports, a return
// re-planning the rest of the week, an event conflict, a fatigue report once nothing is left to reduce. Pairs order-dependent by meaning are
// checked, not assumed: two statements of one fact must each equal their later statement alone; two adaptations of the week may differ only
// in which slot carries a move or a skip, with every restriction of both kept. Every other difference is a defect of the composition.
// RT=freeze2 runs the R7A-FREEZE-2 snapshot. Synthetic data, DEV_TEST_ONLY authority, read-only runtime use.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,tag=process.env.RT==='freeze2'?'R7A-FREEZE-2':'CURRENT';
const CC=tag==='CURRENT'?path.resolve(here,'../../../CoachingCore'):path.join(here,'../freeze2-source/CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const R=await load('src/r6-index.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs'),opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const BENCH={id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const intake=(id,athlete={},schedule={})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED',...athlete},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
let N=0;
const at=(p,w,day,hour,x)=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}:00:00Z`,weekIndex:w,event:{id:`gm-${N++}`,kind:x.kind},eligibility:elig(d),observations:[],...x};};
function obs(p,s){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));return {eventId:`gm-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const ev=(t,review)=>{const r=R.evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r.status+'/'+r.action;};
const start=(id,athlete,schedule,weeks)=>{const t={p:R.generateProgram(intake(id,athlete,schedule),opts).program,ledger:[]};for(let w=0;w<weeks;w++)ev(t,at(t.p,w,6,'21',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(t.p,s))}));return t;};
const line=(P,w)=>P.weeks[w].sessions.map(s=>`d${s.day}${s.turn??''} ${s.sport} ${s.role}${s.status==='SKIPPED'?' SKIPPED':''} ${s.prescription?(s.sport==='STRENGTH'?s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.rir}/${e.load.mode}${e.load.value??''}`).join(','):`${s.prescription.family}:${s.prescription.durationMinutes}`):'-'}`).join('\n');
const next=(P,w)=>{const {anchor,...st}=P.stateTrace[w+1];return JSON.stringify(st);};
const RACE={kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',13*7+6)}};
// The earlier weeks are reported as prescribed; this week's sessions are unreported unless a change reports them.
const programs={race:()=>start('gm-race',{goals:{run:RACE,strength:'STRENGTH'}},{strengthDays:[0,3]},6),plain:()=>start('gm-plain',{},{},3)};
const W={race:6,plain:3},DAYS=[1,2,3,4,5,6];
const changes=(p,w,isRace,day)=>{const d0=p.weeks[w].startDate,dd=addDays(d0,day),wk=p.weeks[w].sessions;
 const late=wk.find(s=>s.prescription&&s.day>day)??wk.filter(s=>s.prescription).at(-1),key=wk.find(s=>s.prescription&&s.sport==='RUN'&&s.role==='QUALITY'&&s.day<=day)??wk.find(s=>s.prescription&&s.sport==='STRENGTH'&&s.day<day);
 const past=wk.filter(s=>s.prescription&&s.day<day&&s.id!==key?.id);
 return {
 SYSTEMIC_FATIGUE:{kind:'SYSTEMIC_FATIGUE'},LOCAL_FATIGUE:{kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}},
 UNAVAILABLE_LATE:{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[late.date]}},
 EQUIPMENT_WINDOW:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:dd,to:addDays(d0,13)}},EQUIPMENT_PERMANENT:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}},
 SCHEDULE_NEXT:{kind:'SCHEDULE_CHANGE',changes:{runDays:[0,3,6],longRunDay:6}},SCHEDULE_MINUTES:{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:30}},
 GOAL_NEXT:{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}},
 RETURN_MODERATE:{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(dd,-16),endDate:addDays(dd,-1),reasonCategory:'TRAVEL',reason:'Work travel'}},
 RETURN_SHORT:{kind:'RETURN_AFTER_PAUSE',interruption:{days:5,startDate:addDays(dd,-5),endDate:addDays(dd,-1),reasonCategory:'TRAVEL',reason:'Work travel'}},
 ...(key?{MISSED_KEY:{kind:'MISSED_SESSION',targetSessionId:key.id}}:{}),
 PARTIAL_REPORTS:{kind:'PARTIAL_SESSION',observations:past.map(s=>obs(p,s))},
 WEEKLY_REPORTS:{kind:'WEEKLY_REVIEW',observations:past.map(s=>obs(p,s))},
 ...(isRace?{EVENT_REACHING:{kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(d0,9)}},EVENT_LATER:{kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(p.goal.run.event.date,14)}},EVENT_WEEK_CONFLICT:{kind:'EVENT_WEEK_CONFLICT',changes:{unavailableDates:[late.date]}}}:{})};};
// Pairs whose order changes the meaning, with the reason (each is a statement about facts, not about composition).
const EXPECTED={
 'RETURN_MODERATE+RETURN_SHORT':'Two return reports of the same break: the later report replaces the earlier (C5), so the order decides which applies; checked: each order equals its later statement alone',
 'EVENT_LATER+EVENT_REACHING':'Two statements of the same event date: the later one is the event (C5), so the order decides the race date; checked: each order equals its later statement alone'
};
const LATEST_WINS=new Set(Object.keys(EXPECTED));
// Two adaptations of one week each apply to the week as it stands when reported (C4): their order may decide which slot carries a move or a
// skip, never a dose. Checked in both orders: next week's start agrees; no hard run after a systemic fatigue report; no session on an
// unavailable or event-conflict date; no quality run after a short return; no run longer, and no exercise with more sets, than planned.
const ADAPTATIONS=new Set(['SYSTEMIC_FATIGUE','LOCAL_FATIGUE','UNAVAILABLE_LATE','MISSED_KEY','EVENT_WEEK_CONFLICT','RETURN_SHORT']);
function adaptationsHold(P,P0,w,day,hour,pair,C){
 const live=s=>s.prescription&&s.status!=='SKIPPED'&&(s.day>day||s.day===day&&!(s.turn==='AM'&&hour>=12)),rows=P.weeks[w].sessions.filter(live),base=P0.weeks[w].sessions.filter(live);
 const longest=Math.max(0,...base.filter(s=>s.sport==='RUN').map(s=>s.prescription.durationMinutes)),sets={};for(const s of base)for(const e of s.prescription.exercises??[])sets[e.id]=Math.max(sets[e.id]??0,e.sets);
 const dates=new Set(pair.flatMap(k=>C[k].changes?.unavailableDates??[]));
 if(pair.includes('SYSTEMIC_FATIGUE')&&rows.some(s=>s.sport==='RUN'&&['QUALITY','RACE_TOUCH'].includes(s.role)))return 'hard run after systemic fatigue';
 if(pair.includes('RETURN_SHORT')&&rows.some(s=>s.sport==='RUN'&&s.role==='QUALITY'))return 'quality run after a short return';
 if(rows.some(s=>dates.has(s.date)&&s.role!=='RACE'))return 'session on an unavailable date';
 if(rows.some(s=>s.sport==='RUN'&&s.prescription.durationMinutes>longest))return 'run above the longest planned';
 if(rows.some(s=>(s.prescription.exercises??[]).some(e=>e.sets>(sets[e.id]??Infinity))))return 'sets above the planned';
 return null;
}
const plan=(P,w)=>JSON.stringify({rows:P.weeks.slice(w).map((x,k)=>line(P,w+k)),states:P.stateTrace.slice(w+1).map(({anchor,...st})=>st)});
// Context records whose differences reach no row or state in the plan (listed, not counted as defects).
const CONTEXT=['canonical','goal','phases','blocks','templates','arrangementSessions','contextBefore'],contextDiff=(P,Q)=>CONTEXT.filter(k=>JSON.stringify(P[k]??null)!==JSON.stringify(Q[k]??null));
const out={probe:'R7A1-HANDLER-GRID-EVENINGS-1',runtime:tag,reviewDays:DAYS,pairs:0,same:0,representationOnly:[],expected:[],defects:[],errors:[]};
for(const [name,make] of Object.entries(programs)){
 const t=make(),w=W[name];
 for(const day of DAYS){
  const C=changes(t.p,w,name==='race',day),keys=Object.keys(C);
  for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++){
   const a=keys[i],b=keys[j];out.pairs++;
   try{
    const A={p:t.p,ledger:t.ledger},B={p:t.p,ledger:t.ledger};
    const la=[ev(A,at(A.p,w,day,'20',C[a])),ev(A,at(A.p,w,day,'21',C[b]))],lb=[ev(B,at(B.p,w,day,'20',C[b])),ev(B,at(B.p,w,day,'21',C[a]))];
    if(plan(A.p,w)===plan(B.p,w)){out.same++;const ctx=contextDiff(A.p,B.p);if(ctx.length)out.representationOnly.push({program:name,day,pair:a+' x '+b,contextKeys:ctx});continue;}
    const key=[a,b].sort().join('+'),entry={program:name,day,pair:`${a} x ${b}`,aThenB:la.join(' then '),bThenA:lb.join(' then '),weekDiffers:line(A.p,w)!==line(B.p,w),nextStartDiffers:next(A.p,w)!==next(B.p,w),aThenBWeek:line(A.p,w).split('\n'),bThenAWeek:line(B.p,w).split('\n')};
    // Two statements of one fact: the later replaces the earlier, so each order must equal its later statement alone (C5).
    if(LATEST_WINS.has(key)){const alone=k=>{const T={p:t.p,ledger:t.ledger};ev(T,at(T.p,w,day,'21',C[k]));return T.p;},xa=alone(b),xb=alone(a);if(plan(A.p,w)!==plan(xa,w)||plan(B.p,w)!==plan(xb,w)){out.defects.push({...entry,reason:'The later statement does not replace the earlier: an order differs from its later statement alone'});continue;}out.expected.push({...entry,reason:EXPECTED[key]});continue;}
    if(ADAPTATIONS.has(a)&&ADAPTATIONS.has(b)){const broken=next(A.p,w)!==next(B.p,w)?'next week starts differently':adaptationsHold(A.p,t.p,w,day,21,[a,b],C)??adaptationsHold(B.p,t.p,w,day,21,[a,b],C);(broken?out.defects:out.expected).push({...entry,reason:'Two adaptations of the week: '+(broken??'the order decides which slot carries a move or a skip; checked: next start, fatigue, unavailable dates, short return, doses')});continue;}
    out.defects.push(entry);
   }catch(e){out.errors.push({program:name,day,pair:`${a} x ${b}`,error:String(e?.stack??e).slice(0,400)});}
  }
 }
}
console.log(JSON.stringify(out,null,1));
