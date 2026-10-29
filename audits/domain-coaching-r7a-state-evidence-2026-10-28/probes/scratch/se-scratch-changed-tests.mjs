// Scratch (author, pre-freeze): the three R7-A boundary tests whose assertions the state evidence model changes. Prints, for the live
// runtime (or QE_LIVE_ROOT), each case's break point and the return steps and loads it starts from, beside the reviewed and unreviewed
// controls. Synthetic data, DEV_TEST_ONLY authority; prints only.
import {H,at,obs,on,addDays,brk,lastR,stateSummary,print,copy,live} from '../../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const sum=B=>({kind:B.interruption.stateAt.kind,week:B.interruption.stateAt.week,authority:B.interruption.stateAt.authority,entry:stateSummary(B.interruption.entry)});
const perDay=(t,w,keep)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s)]}));};
const after=id=>{const t=H.start({id,schedule:{runDays:[1,3,6],strengthDays:[2,5],longRunDay:6}},3);H.weekly(t,3,()=>false);H.weekly(t,4,()=>false);const d0=t.p.weeks[5].startDate;H.ev(t,at(t.p,5,0,'06:00',brk(addDays(d0,-16),addDays(d0,-1))));return {t,d0};};
const tripB=(t,d0)=>{H.ev(t,on(t,addDays(d0,10),'06:00',brk(addDays(d0,8),addDays(d0,9))));return lastR(t.p);};
const out={runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE'};
{const {t,d0}=after('se-ac');perDay(t,5,s=>s.day<3);
 const control=sum(tripB(copy(t),d0)),rv=copy(t);H.weekly(rv,5,()=>false);const reviewed=sum(tripB(rv,d0));
 const sun=copy(t);H.ev(sun,at(sun.p,5,6,'06:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:addDays(d0,21),to:addDays(d0,24)}}));
 out.familiesAC={week6:sun.p.weeks[6].startAuthority,control,reviewed,sundayEquipment:sum(tripB(sun,d0))};}
{const {t,d0}=after('se-held');perDay(t,5,s=>s.day<5);H.ev(t,at(t.p,6,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[5].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s))}));
 const held=copy(t);H.weekly(held,6,s=>s.day!==5);H.ev(held,on(held,addDays(d0,17),'06:00',brk(addDays(d0,15),addDays(d0,16))));out.I4held=sum(lastR(held.p));}
print(out);
