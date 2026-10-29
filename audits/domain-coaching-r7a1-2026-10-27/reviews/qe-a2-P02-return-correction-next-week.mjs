// R7A1-QE-r1 P02: C5 supersession of a return across a week boundary. A 16-day return reported on Friday evening of week w re-plans
// this week (re-entry from Saturday) and overwrites stateTrace[w]; Saturday and Sunday are executed as re-planned and reviewed; the athlete
// then corrects the report: the break was only Monday to Thursday of week w (4 days, SHORT). The author's fix (startBeforeReturn) covers a
// correction made in the same week. Metamorphic relation: the same correction about the same break, after the same executed history,
// reported ten hours apart (Sunday 22:00 of week w, inside the fix's scope, against Monday 07:00 of week w+1) must give the same plan from
// week w+1. Synthetic data, DEV_TEST_ONLY authority, prints only.
import {runtime,make,line,at,addDays,print,whole,firstDiff} from './qe-a2-lib.mjs';
const out={probe:'R7A1-QE-P02',cases:{}};
for(const tag of ['A1','F2']){
 const RT=await runtime(tag),H=make(RT),w=5;
 // Weeks 0-4 executed and reviewed; week 5 Monday-Thursday not trained (no reports).
 const base=H.start({id:'qa1-p02',schedule:{runDays:[1,3,6],strengthDays:[2,5],longRunDay:6}},5),d0=base.p.weeks[w].startDate;
 const first={kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(d0,-12),endDate:addDays(d0,3),reasonCategory:'TRAVEL',reason:'Work travel'}};
 const fix={kind:'RETURN_AFTER_PAUSE',interruption:{days:4,startDate:d0,endDate:addDays(d0,3),reasonCategory:'TRAVEL',reason:'Work travel'}};
 const weekend=s=>s.day>=5;
 const run=steps=>{const T=H.copy(base),log=[];for(const st of steps){if(st.weekly!==undefined){log.push('weekly:'+H.weekly(T,st.weekly,weekend));continue;}log.push(H.ev(T,at(T.p,st.w,st.day,st.hm,st.x)));}return {T,log};};
 const sunday=run([{w,day:4,hm:'21:00',x:first},{weekly:w},{w,day:6,hm:'22:00',x:fix}]);
 const monday=run([{w,day:4,hm:'21:00',x:first},{weekly:w},{w:w+1,day:0,hm:'07:00',x:fix}]);
 const firstOnly=run([{w,day:4,hm:'21:00',x:first},{weekly:w}]);
 const brief=(P,i)=>({runMode:P.stateTrace[i]?.run?.mode,runReturnStep:P.stateTrace[i]?.run?.returnStep??null,strengthSteps:Object.fromEntries(Object.entries(P.stateTrace[i]?.strength?.exercises??{}).map(([k,e])=>[k,e.returnStep??null])),rows:line(P,i)});
 out.cases[tag]={
  firstReturnOnly:{log:firstOnly.log,w6:brief(firstOnly.T.p,w+1)},
  correctionSundayNight:{log:sunday.log,w6:brief(sunday.T.p,w+1)},
  correctionMondayMorning:{log:monday.log,w6:brief(monday.T.p,w+1)},
  sameFromWeek6:whole(sunday.T.p,w+1)===whole(monday.T.p,w+1),firstDifference:firstDiff(sunday.T.p,monday.T.p,w+1)
 };
}
print(out);
