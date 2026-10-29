// R7A2-QE-r1 P21 (independent engineering judge, R7A2-FREEZE-1): the second source of the same window. A return A is reported late, with its
// break's dates stated (Monday-Tuesday of week 3), on Saturday 06:00 of week 3; Wednesday's sessions were executed under the plan before A
// (C5). A separate break B on Thursday-Friday of week 3 is reported on Sunday 06:00. B lies after A's stated end and before A's report day.
// Engineering question only: is B a break of its own (NEW) or read as A (SAME_BREAK)? Control: the same B when A states no end (it then ends
// the day before its report and covers B). Synthetic data, DEV_TEST_ONLY authority, prints only.
import {runtime,make,at,obs,line,addDays,print} from '../../domain-coaching-r7a1-2026-10-27/reviews/qe-a2-lib.mjs';
const RT=await runtime('A1'),H=make(RT);
const brk=(start,end,reason='Work travel')=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(end)-Date.parse(start))/864e5)+1,startDate:start,endDate:end,reasonCategory:'TRAVEL',reason}});
const live=s=>s.prescription&&s.status!=='SKIPPED';
const out={probe:'R7A2-QE-P21',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',cases:{}};
const t=H.start({id:'qa7a2-p21'},3),w=3,d0=t.p.weeks[w].startDate,log=[];
log.push('Wed reported '+H.ev(t,at(t.p,w,2,'21:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===2).map(s=>obs(t.p,s))})));
log.push('A (Mon-Tue) on Sat '+H.ev(t,at(t.p,w,5,'06:00',brk(d0,addDays(d0,1)))));const A=t.p.decisions.at(-1).interruption;
log.push('B (Thu-Fri) on Sun '+H.ev(t,at(t.p,w,6,'06:00',brk(addDays(d0,3),addDays(d0,4)))));const B=t.p.decisions.at(-1).interruption;
out.cases.G1={log,A:{relation:A.relation,start:A.startDate,end:A.endDate},B:{relation:B.relation,supersedes:B.supersedes,episode:B.episode,start:B.startDate,end:B.endDate,days:B.days,stateAt:B.stateAt?.kind+'/w'+B.stateAt?.week},liveReturns:t.p.decisions.filter(d=>d.action==='REESTABLISH').length};
print(out);
