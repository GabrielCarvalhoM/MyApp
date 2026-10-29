// R7AB-QE-r1 P44 (independent engineering judge): the "executed in full" exception of the inside-a-return base rule (contract §3, B8) when an
// exercise is absent from the whole week. A's return (afterA: 16 days, re-entry Monday of week 5, MODERATE). Week 5: Wednesday's lift missed
// (back-squat's only session), the rest executed day by day, Sunday's run on Monday; not reviewed (U) or reviewed Sunday 21:00 (R, control).
// Week 6: an equipment window without barbell and rack covering week 6 (stated Monday 06:00), so back-squat is substituted; every session
// executed; weekly review Sunday 21:00. B: Tuesday-Wednesday of week 7, reported Thursday 06:00. Oracle: back-squat's return step in B's start
// is the one executed (step 0 at the re-entry; never executed since). Prints only; synthetic data; DEV_TEST_ONLY authority.
import {H,at,obs,on,addDays,brk,lastR,afterA,print,copy,live,strengthRows} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const auth=a=>a?`${a.authority} RUN:${a.RUN?.provenance} STR:${a.STRENGTH?.provenance}`:null;
const perDay=(t,w,keep)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s)]}));};
const sundayOnMonday=(t,w)=>H.ev(t,at(t.p,w+1,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s))}));
const miss=s=>s.sport==='STRENGTH'&&s.day===2;
const {t:base,d0}=afterA('qab-p44');const out={probe:'R7AB-QE-P44',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',cells:{}};
for(const cell of ['U','R']){
 const t=copy(base);if(cell==='U'){perDay(t,5,s=>!miss(s));sundayOnMonday(t,5);}else H.weekly(t,5,s=>!miss(s));
 const w6=t.p.weeks[6].startDate,eq=H.ev(t,at(t.p,6,0,'06:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:w6,to:addDays(w6,6)}}));
 const week6Rows=strengthRows(t.p,6,w6).filter(x=>/back-squat|goblet|split|squat/.test(x));
 const rv=H.weekly(t,6),w7=auth(t.p.weeks[7].startAuthority);
 const d=t.p.weeks[7].startDate,b=H.ev(t,on(t,addDays(d,3),'06:00',brk(addDays(d,1),addDays(d,2)))),B=lastR(t.p);
 const bs=x=>x?.strength?.exercises?.['back-squat'];
 out.cells[cell]={week6StartBackSquat:bs(t.p.stateTrace[6]),equipment:eq,week6SquatRows:week6Rows,week6Review:rv,week7Start:w7,week7BackSquat:bs(t.p.stateTrace[7]),B:b,stateAt:`${B.interruption.stateAt.kind}/w${B.interruption.stateAt.week}`,authority:B.interruption.stateAt.authority,entryBackSquat:bs(B.interruption.entry),
  backSquatExecuted:t.ledger.filter(o=>o.logs?.['back-squat']).map(o=>`${o.localDate} ${o.logs['back-squat'].load}`)};
}
print(out);
