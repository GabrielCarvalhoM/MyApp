// R7B1-ENG-r1 judge probe J7 (QE-R7B-05 / R2-01 through a state transition the delta reaches: the return). A strength-NONE novice is capped
// before the first block boundary, either from intake (four days) or by a schedule change in week 1 (two to four days, QE-R7B-05). A short
// nonclinical interruption is reported in week 2 (RETURN_AFTER_PAUSE). Is the re-entry still capped while the state says the cap holds, and do
// the later weekly reviews keep it until the boundary? Also a mid-week correction after the return (factual re-plan). Read-only.
import {record,guard,done,program,weekly,review,evaluateProgram,opts,live,addDays,apply,A,P,imp,LABEL} from './lib.mjs';
const AU=await imp('src/r6-authority.mjs'),auth=AU.r6Authority(opts);
const NOV={strengthExperience:'NONE',goals:{run:'REGULAR',strength:'GENERAL'},equipment:['DUMBBELLS','BENCH'],weeks:12};
const types=(p,w,after=null)=>p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription&&s.status!=='SKIPPED'&&(!after||s.date>after)).map(s=>s.templateType).sort().join(',');
const F=[],out={};
for(const [name,o,pre] of [['intake-capped',{...NOV,id:'j7-intake',schedule:{strengthDays:[0,2,4,5]}},t=>{weekly(t,1);}],['schedule-capped',{...NOV,id:'j7-sched',schedule:{strengthDays:[0,4]}},t=>{apply(t,evaluateProgram(t.p,{...review(t.p,1,{day:0,hour:'06:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4,5]}}),actualLedger:t.ledger},opts));weekly(t,1);}]])
 for(const [cls,days,day] of [['short',3,3],['moderate',9,3]])guard('J7-'+name+'-'+cls,'cap across a return',()=>{
  const t={p:program(o),ledger:[]};weekly(t,0);pre(t);
  const sk=P.skeletonOf(t.p,auth),boundary=P.firstStrengthBoundary(sk);
  const before={week2:types(t.p,2),week3:types(t.p,3),density2:t.p.stateTrace[2]?.strength?.density??null};
  // Executed until the interruption; the return is reported on `day` of week 2 (days of interruption ending the day before).
  const w=2,repDay=addDays(t.p.weeks[w].startDate,day),start=addDays(repDay,-days);
  const r=evaluateProgram(t.p,{...review(t.p,w,{day,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:start,endDate:addDays(repDay,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true}}),actualLedger:t.ledger},opts);
  apply(t,r);
  const st=k=>t.p.stateTrace[k]?.strength?.density??null;
  const res={boundary,before,return:{status:r.status,action:r.action,reason:String(r.reason).slice(0,160)},aheadWeek2:types(t.p,2,repDay),week3:types(t.p,3),density3:st(3)};
  // the weekly reviews up to the boundary
  const reviews=[];for(let k=w;k<Math.min(boundary,t.p.weeks.length-1);k++){const rv=weekly(t,k,{o:()=>({kg:()=>12})});reviews.push({reviewed:k,next:types(t.p,k+1),density:st(k+1),action:rv.action});}
  res.reviews=reviews;out[name+'-'+cls]=res;
  const cappedNeeded=k=>k<boundary;
  // the re-entry week itself: the sessions still ahead after the return stay capped while its state said so (no LOWER/UPPER split)
  if(r.status==='MODIFY'&&before.density2?.capped&&/LOWER|UPPER/.test(res.aheadWeek2))F.push({case:name+'-'+cls,week:2,aheadAfterReturn:res.aheadWeek2,densityBefore:before.density2,note:'the sessions still ahead in the re-entry week are planned uncapped'});
  if(r.status==='MODIFY'&&cappedNeeded(3)&&!/CORE/.test(res.week3))F.push({case:name+'-'+cls,week:3,types:res.week3,density:res.density3,note:'re-entry plan uncapped before the first block boundary'});
  for(const x of reviews)if(cappedNeeded(x.reviewed+1)&&!/CORE/.test(x.next))F.push({case:name+'-'+cls,week:x.reviewed+1,types:x.next,density:x.density,note:'uncapped after the weekly review'});
 });
record('J7','the novice cap survives a return before the first boundary',!F.length,'a return reported before the first block boundary re-enters under the cap and later reviews keep it until the boundary, whether the cap came from intake or from a schedule change',{label:LABEL,failures:F,cases:out});
done('j7-cap-across-return');
