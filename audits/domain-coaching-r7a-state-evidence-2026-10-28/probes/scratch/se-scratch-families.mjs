// Scratch (author, pre-freeze): the Founder's families on the P40 history, live or QE_LIVE_ROOT. Prints B's point, values and the loads of the
// Saturday-only exercises. Synthetic data, DEV_TEST_ONLY; prints only.
import {H,at,obs,on,addDays,brk,lastR,print,copy,live} from '../../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const perDay=(t,w,keep,o={})=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s,o)]}));};
const sundayOnMonday=(t,w)=>H.ev(t,at(t.p,w+1,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s))}));
const sat=s=>s.sport==='STRENGTH'&&s.day===5,out={runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE'};
const ids=['db-rdl','db-split-squat','db-row','back-squat'];
const show=(t,B)=>({stateAt:{kind:B.interruption.stateAt.kind,week:B.interruption.stateAt.week,authority:B.interruption.stateAt.authority,values:Object.fromEntries(ids.map(i=>[i,B.interruption.stateAt.values?.STRENGTH?.[i]]))},entry:Object.fromEntries(ids.map(i=>{const e=B.interruption.entry.strength.exercises[i];return [i,e?`${e.mode}${e.load??''} t${e.loadTick} lp ${e.lastPerformed} les ${e.lastExecutedSets??'-'} rs ${e.returnStep??'-'}`:null];})),
 w3:Object.fromEntries(ids.map(i=>[i,t.p.stateTrace[3].strength.exercises[i]?.load])),w4:Object.fromEntries(ids.map(i=>{const e=t.p.stateTrace[4].strength.exercises[i];return [i,e?`${e.load} lp ${e.lastPerformed}`:null];})),
 w4rows:t.p.weeks[4].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>ids.includes(e.id)).map(e=>`${s.date} ${e.id} ${e.sets}x${e.reps} ${e.load.mode}${e.load.value??''} ${e.exposure?.kind??''}`)),rebased:t.p.weeks[4].startAuthority.STRENGTH.rebased??null});
const base=H.start({id:'se-fam'},2);
const B=(t,days=2)=>{const d=t.p.weeks[4].startDate;H.ev(t,on(t,addDays(d,days+1),'06:00',brk(addDays(d,1),addDays(d,days))));return lastR(t.p);};
// A (P40 U): week 2 Saturday missed, unreviewed; week 3 Saturday missed, reviewed.
{const t=copy(base);perDay(t,2,s=>!sat(s));sundayOnMonday(t,2);H.weekly(t,3,s=>!sat(s));out.A=show(t,B(t));}
// B: the projected 22 executed in week 3 (Saturday lifted at the prescribed load), reviewed.
{const t=copy(base);perDay(t,2,s=>!sat(s));sundayOnMonday(t,2);H.weekly(t,3);out.B=show(t,B(t));}
// B unreviewed: week 3 executed in full, never reviewed (Sunday's run on Monday of week 4); B Tuesday of week 4.
{const t=copy(base);perDay(t,2,s=>!sat(s));sundayOnMonday(t,2);perDay(t,3,()=>true);sundayOnMonday(t,3);out.Bunreviewed=show(t,B(t));}
// P5: week 3's Saturday lifted at 21 against the projected 22 (never reviewed), B Tuesday of week 4.
{const t=copy(base);perDay(t,2,s=>!sat(s));sundayOnMonday(t,2);perDay(t,3,()=>true,{over:{'db-rdl':{load:{value:21,unit:'KG',convention:'PER_HAND'}}}});sundayOnMonday(t,3);out.P5=show(t,B(t));}
// H: MODERATE (14 days) after A's history.
{const t=copy(base);perDay(t,2,s=>!sat(s));sundayOnMonday(t,2);H.weekly(t,3,s=>!sat(s));out.Hmoderate=show(t,B(t,13));}
print(out);
