// R7A1-QE-r2 P14: D58's slot identity ("its slot is the one it already made easy", found by the easy-slot explanation) applied to a second,
// separate short break in the same week. A first short return eases Tuesday's quality run, which is then run (history). A second short
// break (Wednesday-Friday) is reported on Saturday; nothing is ahead that week, so its easy slot should pass on to next week's first quality
// slot (C5 A2: "the first quality slot still ahead of the report ... in the week re-entry starts or a later one"). Compared with the same
// second break alone (no first return). Run on FREEZE-A2 (live) and, with QE_LIVE_ROOT, on another copy. Synthetic data, prints only.
import {runtime,make,at,obs,line,addDays,print} from './qe-a2-lib.mjs';
const RT=await runtime('A1'),H=make(RT);
const travel=(start,end)=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(end)-Date.parse(start))/864e5)+1,startDate:start,endDate:end,reasonCategory:'TRAVEL',reason:'Work travel'}});
const live=s=>s.prescription&&s.status!=='SKIPPED';
const easySlots=(P,w0)=>P.weeks.slice(w0,w0+3).flatMap((x,k)=>x.sessions.filter(s=>/short break runs easy/.test(s.explanation??'')).map(s=>`w${w0+k}:${s.id}`));
const out={probe:'R7A1-QE-P14',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',cases:{}};
for(const withFirst of [true,false]){
 const t=H.start({id:'qa2-p14'},3),w=3,d0=t.p.weeks[w].startDate,log=[];
 if(withFirst){
  log.push('first short return '+H.ev(t,at(t.p,w,0,'06:00',travel(addDays(d0,-6),addDays(d0,-1)))));
  const tue=t.p.weeks[w].sessions.filter(s=>live(s)&&s.day<=1);
  log.push('Tuesday reported '+H.ev(t,at(t.p,w,2,'05:00',{kind:'WEEKLY_REVIEW',observations:tue.map(s=>obs(t.p,s))})));
 }else{
  // The same days trained as planned (no first break): Monday and Tuesday reported.
  const tue=t.p.weeks[w].sessions.filter(s=>live(s)&&s.day<=1);
  log.push('Mon-Tue reported '+H.ev(t,at(t.p,w,2,'05:00',{kind:'WEEKLY_REVIEW',observations:tue.map(s=>obs(t.p,s))})));
 }
 log.push('second short return '+H.ev(t,at(t.p,w,5,'06:00',travel(addDays(d0,2),addDays(d0,4)))));
 const afterReturn={easy:easySlots(t.p,w),week:line(t.p,w),next:line(t.p,w+1)};
 H.weekly(t,w,s=>s.day>=5);log.push('weekly w3 '+t.last.status+'/'+t.last.action);
 out.cases[withFirst?'firstThenSecond':'secondAlone']={log,afterReturn,afterReview:{easy:easySlots(t.p,w),week:line(t.p,w),next:line(t.p,w+1)},
  nextWeekFirstQuality:(t.p.weeks[w+1].sessions.find(s=>s.sport==='RUN'&&s.day===1)??{}).role};
}
out.sameNextWeek=JSON.stringify(out.cases.firstThenSecond.afterReview.next)===JSON.stringify(out.cases.secondAlone.afterReview.next);
print(out);
