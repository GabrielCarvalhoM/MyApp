// R7A1-QE-r2 P15: the A2 change that records an equipment statement with nothing to substitute (KEEP with an instantiation-only proposal,
// QE-R7A1-01) re-composes the strength weeks from this week. A statement that changes no exercise must change nothing else either (I2):
// every row and every later start equal the plan without it. Setups cover the A2 inputs this re-composition reads: mid-week, Sunday
// morning, after the weekly review (systemic hold; confirmed first loads), after a recorded move, and after a short return (D58).
// Synthetic data, DEV_TEST_ONLY authority, prints only.
import {runtime,make,at,obs,whole,line,addDays,print} from './qe-a2-lib.mjs';
const RT=await runtime('A1'),H=make(RT);
const live=s=>s.prescription&&s.status!=='SKIPPED';
const ALL=['DUMBBELLS','BENCH','BARBELL','RACK'];
const travel=(p,w,day,days)=>({kind:'RETURN_AFTER_PAUSE',interruption:{days,startDate:addDays(p.weeks[w].startDate,day-days),endDate:addDays(p.weeks[w].startDate,day-1),reasonCategory:'TRAVEL',reason:'Work travel'}});
const noops=(p,w)=>({
 addUnusedItem:{equipment:[...ALL,'TREADMILL']},
 windowThisWeekSameList:{equipment:ALL,from:p.weeks[w].startDate,to:addDays(p.weeks[w].startDate,6)},
 windowNextWeekSameList:{equipment:ALL,from:p.weeks[w+1].startDate,to:addDays(p.weeks[w+1].startDate,6)}});
const setups={
 midweekWed21:{ia:{id:'qa2-p15a'},weeks:3,w:3,prep:()=>[],at:[2,'21:00']},
 mondayMorning:{ia:{id:'qa2-p15a'},weeks:3,w:3,prep:()=>[],at:[0,'06:00']},
 sundayMorning:{ia:{id:'qa2-p15a'},weeks:3,w:3,prep:t=>[H.ev(t,at(t.p,3,6,'05:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[3].sessions.filter(s=>live(s)&&s.day<6).map(s=>obs(t.p,s))}))],at:[6,'07:00']},
 afterReview:{ia:{id:'qa2-p15a'},weeks:3,w:3,prep:t=>[H.weekly(t,3)],at:[6,'22:00']},
 afterReviewSystemic:{ia:{id:'qa2-p15b',schedule:{runDays:[1,4,6],strengthDays:[0,2],longRunDay:6}},weeks:3,w:3,prep:t=>[H.ev(t,at(t.p,3,6,'07:00',{kind:'SYSTEMIC_FATIGUE'})),H.weekly(t,3)],at:[6,'22:00']},
 afterReviewConfirmations:{ia:{id:'qa2-p15c'},weeks:0,w:0,prep:t=>{const w0=t.p.weeks[0].sessions,ids=[...new Set(w0.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises.filter(e=>e.load.mode==='ESTABLISH').map(e=>e.id)))];
  const conf=ids.map(id=>({exerciseId:id,value:20,unit:'KG',convention:w0.flatMap(s=>s.prescription?.exercises??[]).find(e=>e.id===id).load.convention}));
  return [H.ev(t,at(t.p,0,6,'21:00',{kind:'WEEKLY_REVIEW',observations:w0.filter(live).map(s=>obs(t.p,s)),loadConfirmations:conf}))];},at:[6,'22:00']},
 afterMove:{ia:{id:'qa2-p15d',schedule:{strengthDays:[0,2,5],runDays:[1,3,6],longRunDay:6}},weeks:3,w:3,prep:t=>[H.ev(t,at(t.p,3,1,'07:00',{kind:'MISSED_SESSION',targetSessionId:'w3-str-d0'}))],at:[1,'07:30']},
 afterShortReturn:{ia:{id:'qa2-p15e'},weeks:3,w:3,prep:t=>[H.ev(t,at(t.p,3,2,'09:00',travel(t.p,3,2,6)))],at:[2,'10:00']},
 afterShortReturnReview:{ia:{id:'qa2-p15e'},weeks:3,w:3,prep:t=>[H.ev(t,at(t.p,3,2,'09:00',travel(t.p,3,2,6))),H.weekly(t,3,s=>s.day>=2)],at:[6,'22:00']},
};
const out={probe:'R7A1-QE-P15',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',cases:{},differences:[]};
for(const [name,S] of Object.entries(setups)){
 const base=H.start(S.ia,S.weeks),prep=S.prep(base),w=S.w,ref=whole(base.p,w),refAdapt=JSON.stringify(base.p.weeks.slice(w).map(x=>(x.adaptations??[]).map(a=>a.kind)));
 for(const [n,changes] of Object.entries(noops(base.p,w))){
  const T=H.copy(base),r=H.ev(T,at(T.p,w,S.at[0],S.at[1],{kind:'EQUIPMENT_CHANGE',changes}));
  const same=whole(T.p,w)===ref,adapt=JSON.stringify(T.p.weeks.slice(w).map(x=>(x.adaptations??[]).map(a=>a.kind)));
  let first=null;if(!same){for(let i=w;i<T.p.weeks.length;i++){const a=line(T.p,i),b=line(base.p,i);if(a.join()!==b.join()){first={week:i,kind:'rows',now:a,before:b};break;}const {anchor:x1,...sa}=T.p.stateTrace[i+1]??{},{anchor:x2,...sb}=base.p.stateTrace[i+1]??{};if(JSON.stringify(sa)!==JSON.stringify(sb)){first={week:i+1,kind:'start',now:sa,before:sb};break;}}}
  out.cases[`${name}:${n}`]={prep,result:r,recorded:T.p!==base.p,same,adaptationsSame:adapt===refAdapt,...(first?{first}:{})};
  if(!same||adapt!==refAdapt)out.differences.push(`${name}:${n}`);
 }
}
print(out);
