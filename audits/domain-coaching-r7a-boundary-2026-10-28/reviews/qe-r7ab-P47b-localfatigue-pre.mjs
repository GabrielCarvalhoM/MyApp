// R7AB-QE-r1 P47b: P47's PRE base (week 2 executed but Saturday's lift, unreviewed; week 3 the same, Sunday's run not reported) with a local
// fatigue report on Sunday 22:00 of week 3 (nothing optional left: it reviews the week, R7-A.1 C4), against no report. B Tue-Wed of week 4.
// Prints B's point and the Saturday-only exercises in B's entry, with the loads the ledger shows executed. Prints only; DEV_TEST_ONLY.
import {H,at,obs,on,addDays,brk,lastR,print,copy,live} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const perDay=(t,w,keep)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s)]}));};
const miss=s=>s.sport==='STRENGTH'&&s.day===5,t0=H.start({id:'qab-p47b'},2);perDay(t0,2,s=>!miss(s));H.ev(t0,at(t0.p,3,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t0.p.weeks[2].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t0.p,s))}));perDay(t0,3,s=>!miss(s));
const bDay=addDays(t0.p.weeks[4].startDate,1),B=t=>{H.ev(t,on(t,addDays(bDay,2),'06:00',brk(bDay,addDays(bDay,1))));return lastR(t.p);};
const pick=D=>({point:`${D.interruption.stateAt.kind}/w${D.interruption.stateAt.week}`,authority:D.interruption.stateAt.authority,...Object.fromEntries(['db-rdl','db-split-squat','db-row','db-bench-press'].map(id=>{const e=D.interruption.entry.strength.exercises[id];return [id,`${e?.mode}${e?.load} tick ${e?.loadTick}`];}))});
const c=copy(t0),ctl=pick(B(c)),f=copy(t0),x=H.ev(f,at(f.p,3,6,'22:00',{kind:'LOCAL_FATIGUE',signals:{region:'UPPER'}})),lf=pick(B(f));
print({probe:'R7AB-QE-P47b',localFatigue:x,week4StartAfterReport:f.p.weeks[4].startAuthority?.authority,control:ctl,withLocalFatigue:lf,executedSaturdayOnly:t0.ledger.filter(o=>o.logs).flatMap(o=>Object.entries(o.logs).filter(([id])=>/db-rdl|db-split-squat/.test(id)).map(([id,l])=>`${o.localDate} ${id} ${l.load}`))});
