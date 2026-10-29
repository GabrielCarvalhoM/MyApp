// R7-A final successor of the engineering judge's P02 (audits/domain-coaching-r7a1-2026-10-27/reviews/qe-a2-P02-return-correction-next-week.mjs):
// the same sequence with the correction naming its interruption (interruption.episodeId), as the Founder's §8 requires; the unnamed P02 is now
// asked at both clocks. A 16-day return reported on Friday evening of week w re-plans this week; Saturday and Sunday are executed and reviewed;
// the athlete then corrects the report: the break was only Monday to Thursday of week w (4 days, SHORT). Metamorphic relation: the same
// correction reported ten hours apart (Sunday 22:00 of week w against Monday 07:00 of week w+1) gives the same plan from week w+1, and it is the
// same interruption. Synthetic data, DEV_TEST_ONLY authority, prints only.
import {runtime,make,line,at,addDays,print,whole,firstDiff} from '../../domain-coaching-r7a1-2026-10-27/reviews/qe-a2-lib.mjs';
const out={probe:'R7AF-P02-NAMED',cases:{}};
const RT=await runtime('A1'),H=make(RT),w=5;
const base=H.start({id:'qa1-p02',schedule:{runDays:[1,3,6],strengthDays:[2,5],longRunDay:6}},5),d0=base.p.weeks[w].startDate;
const first={kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(d0,-12),endDate:addDays(d0,3),reasonCategory:'TRAVEL',reason:'Work travel'}};
const fix=episodeId=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:4,startDate:d0,endDate:addDays(d0,3),reasonCategory:'TRAVEL',reason:'Work travel',episodeId}});
const weekend=s=>s.day>=5;
const run=steps=>{const T=H.copy(base),log=[];for(const st of steps){if(st.weekly!==undefined){log.push('weekly:'+H.weekly(T,st.weekly,weekend));continue;}const x=typeof st.x==='function'?st.x(T.p.decisions.filter(d=>d.action==='REESTABLISH').at(-1).interruption.episode):st.x;log.push(H.ev(T,at(T.p,st.w,st.day,st.hm,x)));}return {T,log};};
const sunday=run([{w,day:4,hm:'21:00',x:first},{weekly:w},{w,day:6,hm:'22:00',x:fix}]);
const monday=run([{w,day:4,hm:'21:00',x:first},{weekly:w},{w:w+1,day:0,hm:'07:00',x:fix}]);
const firstOnly=run([{w,day:4,hm:'21:00',x:first},{weekly:w}]);
const brief=(P,i)=>({runMode:P.stateTrace[i]?.run?.mode,runReturnStep:P.stateTrace[i]?.run?.returnStep??null,strengthSteps:Object.fromEntries(Object.entries(P.stateTrace[i]?.strength?.exercises??{}).map(([k,e])=>[k,e.returnStep??null])),rows:line(P,i)});
const rec=P=>{const d=P.decisions.filter(x=>x.action==='REESTABLISH').at(-1).interruption;return {relation:d.relation,basis:d.basis,revision:d.revision,episode:d.episode,stateAt:`${d.stateAt.kind}/w${d.stateAt.week}`,class:d.class};};
out.cases.A1={firstReturnOnly:{log:firstOnly.log,w6:brief(firstOnly.T.p,w+1)},correctionSundayNight:{log:sunday.log,record:rec(sunday.T.p),w6:brief(sunday.T.p,w+1)},correctionMondayMorning:{log:monday.log,record:rec(monday.T.p),w6:brief(monday.T.p,w+1)},
 sameFromWeek6:whole(sunday.T.p,w+1)===whole(monday.T.p,w+1),firstDifference:firstDiff(sunday.T.p,monday.T.p,w+1),episodes:[sunday,monday].map(x=>new Set(x.T.p.decisions.filter(d=>d.action==='REESTABLISH').map(d=>d.interruption.episode)).size)};
print(out);
