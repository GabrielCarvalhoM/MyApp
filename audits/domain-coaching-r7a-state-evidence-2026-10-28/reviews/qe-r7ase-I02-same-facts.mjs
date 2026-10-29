// R7ASE-QE-r1 I02 (independent engineering judge): oracle premise check for P50 and P51c. Rebuilds each pair of cells and compares their
// completed-work ledgers field by field (session, observation time, local date, actual execution, response), ignoring event ids and review
// clocks: the cells must hold the same facts and differ only in which weeks were reviewed. Read-only; synthetic; DEV_TEST_ONLY; prints only.
import {H,at,obs,print,copy,live} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const perDay=(t,w,keep)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s)]}));
 H.ev(t,at(t.p,w+1,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6&&keep(s)).map(s=>obs(t.p,s))}));};
const SAT=s=>s.sport==='STRENGTH'&&s.day===5,IDS=['db-rdl','db-split-squat'];
const facts=t=>JSON.stringify(t.ledger.filter(o=>!o.conflicted).map(o=>({s:o.sessionId,at:o.observedAt,d:o.localDate,a:o.actual,r:o.response})).sort((x,y)=>x.at<y.at?-1:x.at>y.at?1:x.s<y.s?-1:1));
const out={probe:'R7ASE-QE-I02',pairs:{}};
// P50: week 2 unreviewed (U) or reviewed (R), Saturday's lift missed in weeks 2-6, weeks 3-6 reviewed.
{const base=H.start({id:'qse-p50'},2),U=copy(base),R=copy(base);perDay(U,2,s=>!SAT(s));H.weekly(R,2,s=>!SAT(s));for(let k=3;k<=6;k++){H.weekly(U,k,s=>!SAT(s));H.weekly(R,k,s=>!SAT(s));}
 out.pairs.P50={sameFacts:facts(U)===facts(R),observations:[U.ledger.length,R.ledger.length]};}
// P51c repsShort: weeks 5 and 6 Saturday missed, week 6 unreviewed (U) or reviewed (R6); week 7 Saturday at 24 kg with 3 of 5 reps, reviewed.
{const base=H.start({id:'qse-p51c'},5),edit=x=>({...x,reps:3});
 const w7=t=>H.ev(t,at(t.p,7,6,'21:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[7].sessions.filter(live).map(s=>{const o=obs(t.p,s);if(SAT(s))o.actual.exercises=o.actual.exercises.map(e=>IDS.includes(e.id)?{...e,sets:e.sets.map(edit)}:e);return o;})}));
 const U=copy(base),R=copy(base);perDay(U,5,s=>!SAT(s));perDay(U,6,s=>!SAT(s));perDay(R,5,s=>!SAT(s));H.weekly(R,6,s=>!SAT(s));w7(U);w7(R);
 out.pairs.P51c_repsShort={sameFacts:facts(U)===facts(R),observations:[U.ledger.length,R.ledger.length],week7SaturdayPrescribed:[U,R].map(t=>t.p.weeks[7].sessions.filter(s=>live(s)&&SAT(s)).flatMap(s=>s.prescription.exercises.filter(e=>IDS.includes(e.id)).map(e=>`${e.id} ${e.sets}x${e.reps} ${e.load.mode}${e.load.value??''}`)))};}
print(out);
