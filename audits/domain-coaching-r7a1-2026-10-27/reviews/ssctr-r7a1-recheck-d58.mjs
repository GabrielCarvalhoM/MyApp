// SSCTR R7A1-SSCTR-r2 D58 edge probe (own instrument). Read-only runtime use (live tree), synthetic data, DEV_TEST_ONLY authority.
// Usage: node ssctr-r7a1-recheck-d58.mjs > out.json
// Layout: run days Tue (quality), Thu (easy), Sun (long), strength Wed and Sat; a short break Fri-Sun of week 3 reported on Monday of week 4.
// E1 reading (a): systemic fatigue and the short return on Monday morning, in both orders.
// E2 reading (b): the Tuesday quality day unavailable, then the return (and the other order).
// E3 reading (c): the return, then its easy Tuesday reported unavailable: next week before and after the weekly review, and after a
//    next-week report made without that review.
// E4 not named in the dossier: the easy Tuesday not done (a missed-session report, or unreported at the weekly review), with controls.
// E5 not named in the dossier: a race program; the short return reported in the taper week after its quality, or in race week.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,ROOT=path.resolve(here,'../../..'),CC=path.join(ROOT,'CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const R=await load('src/r6-index.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs'),opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,convention='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const EASY_SLOT='First quality slot after a short break runs easy';
const intake=(id,run='PERFORMANCE')=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run,strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[K('back-squat',3,5,80)],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100}});
let N=0;
const at=(p,w,day,hour,x)=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`sd-${N++}`,kind:x.kind},eligibility:elig(d),observations:[],...x};};
function obs(p,s){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));return {eventId:`sd-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const ev=(t,x)=>{const r=R.evaluateProgram(t.p,{...x,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;const s=`${x.event.kind}@w${x.weekIndex}d${x.asOf.slice(8,10)}T${x.asOf.slice(11,16)}:${r.status}/${r.action}`;t.log.push(s);return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const weekly=(t,w,keep=()=>true)=>ev(t,at(t.p,w,6,'21:00:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s))}));
const fork=t=>({p:t.p,ledger:t.ledger,log:[...t.log]});
const runs=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='RUN').map(s=>`d${s.day} ${s.role}${s.status==='SKIPPED'?' SKIPPED':''}${s.prescription?' '+s.prescription.family+':'+s.prescription.durationMinutes:''}${s.explanation===EASY_SLOT?' [easy slot]':''}${s.moved?' (moved)':''}`);
const easySlots=(P,w0)=>P.weeks.slice(w0).flatMap(x=>x.sessions.filter(s=>s.explanation===EASY_SLOT).map(s=>`w${x.index}:${s.id}${s.status==='SKIPPED'?':SKIPPED':''}`));
const view=(t,w0,n=2)=>({log:t.log.slice(-4),...Object.fromEntries([...Array(n).keys()].map(k=>[`w${w0+k}`,runs(t.p,w0+k)])),easySlots:easySlots(t.p,w0)});
const breakFriSun=(p,w)=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:3,startDate:addDays(p.weeks[w-1].startDate,4),endDate:addDays(p.weeks[w-1].startDate,6),reasonCategory:'TRAVEL',reason:'Work travel'}});
const out={probe:'R7A1-SSCTR-r2-D58',runtime:'live tree (check the digest)',sections:{}};
const section=(name,fn)=>{try{out.sections[name]=fn();}catch(err){out.sections[name]={error:String(err?.stack??err).slice(0,600)};}};
// Base: weeks 0-2 executed and reviewed; week 3 executed up to Thursday (the break is Fri-Sun) and reviewed.
const W=4,base=(()=>{const g=R.generateProgram(intake('sd-base'),opts),t={p:g.program,ledger:[],log:[]};for(let w=0;w<3;w++)weekly(t,w);weekly(t,3,s=>s.day<4);return t;})();
const lastQuality=runs(base.p,3).find(x=>/QUALITY/.test(x));
section('E1_fatigueAndReturn',()=>{
 const res={lastExecutedQuality:`w3 ${lastQuality}`};
 for(const order of ['fatigueThenReturn','returnThenFatigue']){
  const t=fork(base),F=()=>ev(t,at(t.p,W,0,order==='fatigueThenReturn'?'05:00:00':'06:00:00',{kind:'SYSTEMIC_FATIGUE'})),Rt=()=>ev(t,at(t.p,W,0,order==='fatigueThenReturn'?'06:00:00':'05:00:00',breakFriSun(t.p,W)));
  if(order==='fatigueThenReturn'){F();Rt();}else{Rt();F();}
  const afterPair=view(t,W);weekly(t,W);res[order]={afterPair,afterReview:view(t,W+1,1)};
 }
 return res;
});
section('E2_unavailableAndReturn',()=>{
 const res={};
 for(const order of ['unavailableThenReturn','returnThenUnavailable']){
  const t=fork(base),tue=addDays(t.p.weeks[W].startDate,1),U=()=>ev(t,at(t.p,W,0,order==='unavailableThenReturn'?'05:00:00':'06:00:00',{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[tue]}})),Rt=()=>ev(t,at(t.p,W,0,order==='unavailableThenReturn'?'06:00:00':'05:00:00',breakFriSun(t.p,W)));
  if(order==='unavailableThenReturn'){U();Rt();}else{Rt();U();}
  const afterPair=view(t,W);weekly(t,W);res[order]={afterPair,afterReview:view(t,W+1,1)};
 }
 return res;
});
section('E3_easySlotUnavailable',()=>{
 const t=fork(base),tue=addDays(t.p.weeks[W].startDate,1);ev(t,at(t.p,W,0,'05:00:00',breakFriSun(t.p,W)));const afterReturn=view(t,W);
 ev(t,at(t.p,W,0,'07:00:00',{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[tue]}}));const beforeReview=view(t,W);
 const noReview=fork(t);
 weekly(t,W);const afterReview=view(t,W+1,1);
 // No weekly review of week 4: a report on Monday 05:00 of week 5 (more strength time), then that week's Tuesday.
 const r=ev(noReview,at(noReview.p,W+1,0,'05:00:00',{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:45}}));
 return {afterReturn,beforeReview,afterReview,nextWeekReportWithoutReview:{status:`${r.status}/${r.action}`,reason:r.reason??null,...view(noReview,W+1,1)}};
});
section('E4_easySlotNotDone',()=>{
 const res={lastExecutedQuality:`w3 ${lastQuality}`};
 const ret=()=>{const t=fork(base);ev(t,at(t.p,W,0,'05:00:00',breakFriSun(t.p,W)));return t;};
 const tueId=P=>P.weeks[W].sessions.find(s=>s.sport==='RUN'&&s.day===1).id;
 {const t=ret();weekly(t,W);res.controlEasyDone=view(t,W+1,1);}
 {const t=ret();const r=ev(t,at(t.p,W,1,'21:00:00',{kind:'MISSED_SESSION',targetSessionId:tueId(t.p)}));const afterMissed={status:`${r.status}/${r.action}`,...view(t,W)};weekly(t,W,s=>s.id!==tueId(t.p));res.missedReport={afterMissed,afterReview:view(t,W+1,1)};}
 {const t=ret();weekly(t,W,s=>s.id!==tueId(t.p));res.unreportedAtReview=view(t,W+1,1);}
 // Control without a break: week 4's Tuesday quality not done and unreported at the review.
 {const g=R.generateProgram(intake('sd-base'),opts),t={p:g.program,ledger:[],log:[]};for(let w=0;w<4;w++)weekly(t,w);weekly(t,W,s=>!(s.sport==='RUN'&&s.day===1));res.controlNoBreakQualityMissed={w4:runs(t.p,W),...view(t,W+1,1)};}
 return res;
});
section('E5_raceProgram',()=>{
 const race={kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',13*7+6)}},g=R.generateProgram(intake('sd-race',race),opts);
 const t0={p:g.program,ledger:[],log:[]};for(let w=0;w<11;w++)weekly(t0,w);
 const res={phases:g.program.phases.phases.slice(11)};
 // (i) taper week 12: a break Sat-Mon reported Tuesday 21:00, the Tuesday quality already past (not done).
 {const t=fork(t0);weekly(t,11,s=>s.day<5);const d=t.p.weeks[12].startDate;
  ev(t,at(t.p,12,1,'21:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:3,startDate:addDays(d,-2),endDate:d,reasonCategory:'TRAVEL',reason:'Work travel'}}));
  const afterReturn=view(t,12,4);for(let w=12;w<15;w++)weekly(t,w,s=>w>12||s.day>1);res.taperReportedAfterQuality={afterReturn,afterReviews:view(t,13,3)};}
 // (ii) race week 13: a break Fri-Sun of the taper week reported Monday 06:00 of race week.
 {const t=fork(t0);weekly(t,11);weekly(t,12,s=>s.day<4);ev(t,at(t.p,13,0,'06:00:00',breakFriSun(t.p,13)));
  const afterReturn=view(t,13,3);for(let w=13;w<15;w++)weekly(t,w);res.raceWeekReport={afterReturn,afterReviews:view(t,14,2)};}
 return res;
});
console.log(JSON.stringify(out,null,1));
