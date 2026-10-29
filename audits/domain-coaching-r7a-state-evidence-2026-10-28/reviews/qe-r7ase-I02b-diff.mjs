// R7ASE-QE-r1 I02b (independent engineering judge): which observations differ between P51c's U and R6 (repsShort), per session and exercise.
// Read-only; synthetic; DEV_TEST_ONLY; prints only.
import {H,at,obs,print,copy,live} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const perDay=(t,w,keep)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s)]}));
 H.ev(t,at(t.p,w+1,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6&&keep(s)).map(s=>obs(t.p,s))}));};
const SAT=s=>s.sport==='STRENGTH'&&s.day===5,IDS=['db-rdl','db-split-squat'],edit=x=>({...x,reps:3});
const base=H.start({id:'qse-p51c'},5);
const w7=t=>H.ev(t,at(t.p,7,6,'21:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[7].sessions.filter(live).map(s=>{const o=obs(t.p,s);if(SAT(s))o.actual.exercises=o.actual.exercises.map(e=>IDS.includes(e.id)?{...e,sets:e.sets.map(edit)}:e);return o;})}));
const U=copy(base),R=copy(base);perDay(U,5,s=>!SAT(s));perDay(U,6,s=>!SAT(s));perDay(R,5,s=>!SAT(s));H.weekly(R,6,s=>!SAT(s));w7(U);w7(R);
const key=o=>o.sessionId+'@'+o.observedAt,mU=new Map(U.ledger.map(o=>[key(o),o])),mR=new Map(R.ledger.map(o=>[key(o),o])),diffs=[];
for(const k of new Set([...mU.keys(),...mR.keys()])){const a=mU.get(k),b=mR.get(k);if(!a||!b){diffs.push({k,only:a?'U':'R6'});continue;}
 const ea=Object.fromEntries((a.actual.exercises??[]).map(e=>[e.id,JSON.stringify(e.sets.map(x=>[x.load?.value,x.reps,x.rir]))])),eb=Object.fromEntries((b.actual.exercises??[]).map(e=>[e.id,JSON.stringify(e.sets.map(x=>[x.load?.value,x.reps,x.rir]))]));
 const ex=[...new Set([...Object.keys(ea),...Object.keys(eb)])].filter(id=>ea[id]!==eb[id]).map(id=>`${id}: U=${ea[id]} R6=${eb[id]}`);
 if(ex.length||a.actual.minutes!==b.actual.minutes||a.localDate!==b.localDate)diffs.push({k,week:a.context?.weekIndex,minutes:[a.actual.minutes,b.actual.minutes],exercises:ex});}
print({differing:diffs});
