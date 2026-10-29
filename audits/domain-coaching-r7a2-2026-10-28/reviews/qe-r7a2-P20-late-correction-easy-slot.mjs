// R7A2-QE-r1 P20 (independent engineering judge, R7A2-FREEZE-1): P14 (QE-R7A1-10) with a report A' of the first short break made after the
// second short break B ended and before B is reported. A first short return A (6 days, Monday 06:00 of week 3) eases Tuesday's quality run,
// which is run and reported. B: Wednesday-Friday. A' (same dates, another reason): Saturday 06:00. B: Saturday 07:00. Weekly review Sunday.
// Oracle (I9, D58 as P14 reads it): B gets its own easy slot, the first quality slot after it (week 4 Tuesday runs EASY), as when B is reported
// before A' or alone. Synthetic data, DEV_TEST_ONLY authority, prints only.
import {runtime,make,at,obs,line,addDays,print} from '../../domain-coaching-r7a1-2026-10-27/reviews/qe-a2-lib.mjs';
const RT=await runtime('A1'),H=make(RT);
const brk=(start,end,reason='Work travel')=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(end)-Date.parse(start))/864e5)+1,startDate:start,endDate:end,reasonCategory:'TRAVEL',reason}});
const live=s=>s.prescription&&s.status!=='SKIPPED';
const easySlots=(P,w0)=>P.weeks.slice(w0,w0+3).flatMap((x,k)=>x.sessions.filter(s=>/short break runs easy/.test(s.explanation??'')).map(s=>`w${w0+k}:${s.id}:${s.easedFor??'-'}`));
const out={probe:'R7A2-QE-P20',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',cases:{}};
for(const order of ['FIX_THEN_B','B_THEN_FIX','B_ONLY']){
 const t=H.start({id:'qa7a2-p20'},3),w=3,d0=t.p.weeks[w].startDate,log=[];
 log.push('A '+H.ev(t,at(t.p,w,0,'06:00',brk(addDays(d0,-6),addDays(d0,-1)))));const A=t.p.decisions.at(-1).eventId;
 log.push('Mon-Tue reported '+H.ev(t,at(t.p,w,2,'05:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.day<=1).map(s=>obs(t.p,s))})));
 const fix=()=>{log.push("A' "+H.ev(t,at(t.p,w,5,order==='FIX_THEN_B'?'06:00':'08:00',brk(addDays(d0,-6),addDays(d0,-1),'Long work trip'))));};
 const b=()=>{log.push('B '+H.ev(t,at(t.p,w,5,'07:00',brk(addDays(d0,2),addDays(d0,4)))));const d=t.p.decisions.at(-1);return {relation:d.interruption?.relation,episode:d.interruption?.episode,supersedes:d.interruption?.supersedes,eventId:d.eventId};};
 let B;if(order==='FIX_THEN_B'){fix();B=b();}else if(order==='B_THEN_FIX'){B=b();fix();}else B=b();
 H.weekly(t,w,s=>s.day>=5);log.push('weekly w3 '+t.last.status+'/'+t.last.action);
 out.cases[order]={log,A,B,easySlots:easySlots(t.p,w),week4Tuesday:(({role,prescription,easedFor})=>({role,family:prescription?.family,minutes:prescription?.durationMinutes,easedFor:easedFor??null}))(t.p.weeks[w+1].sessions.find(s=>s.sport==='RUN'&&s.day===1)),week4:line(t.p,w+1)};
}
print(out);
