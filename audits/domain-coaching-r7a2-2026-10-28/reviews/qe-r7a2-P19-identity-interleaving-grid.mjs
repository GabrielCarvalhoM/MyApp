// R7A2-QE-r1 P19 (independent engineering judge, R7A2-FREEZE-1): equivalence classes around P17. A first return A (16-day break, reported
// Monday 06:00 of week 5, re-entry that week; Mon-Wed executed and reported Wednesday 21:00), then a separate break B after the re-entry,
// and a report A' of break A (same dates with another reason, its first day one day earlier, or its last day one day later), interleaved:
//   timing of A' : BEFORE_B (Wednesday 22:00, before B began) | DURING_B (B's first day, 12:00) | AFTER_B (the day after B ended, 06:00,
//                  before B is reported) | AFTER_B_REPORT (after B's report: expected ASK)
//   B            : starts Thursday of week 5 or Monday of week 6; 2 or 4 days (SHORT); reported the day after it ended, 07:00.
// Oracle per cell: B is NEW (or asked), never SAME_BREAK; after B no strength row at the pre-break dose (KNOWN load at 3 sets or more) and no
// long run above 45 minutes in B's week or the next. Synthetic data, DEV_TEST_ONLY authority, prints only.
import {runtime,make,at,obs,addDays,print} from '../../domain-coaching-r7a1-2026-10-27/reviews/qe-a2-lib.mjs';
const RT=await runtime('A1'),H=make(RT);
const brk=(start,end,reason='Work travel')=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(end)-Date.parse(start))/864e5)+1,startDate:start,endDate:end,reasonCategory:'TRAVEL',reason}});
const live=s=>s.prescription&&s.status!=='SKIPPED';
const weekOf=(P,d)=>Math.floor((Date.parse(d)-Date.parse(P.startDate))/(7*864e5));
const dayOf=(P,d)=>(Date.parse(d)-Date.parse(P.weeks[weekOf(P,d)].startDate))/864e5;
const base=(()=>{const t=H.start({id:'qa7a2-p19',schedule:{runDays:[1,3,6],strengthDays:[2,5],longRunDay:6}},3);H.weekly(t,3,()=>false);H.weekly(t,4,()=>false);
 const d0=t.p.weeks[5].startDate;H.ev(t,at(t.p,5,0,'06:00',brk(addDays(d0,-16),addDays(d0,-1))));
 H.ev(t,at(t.p,5,2,'21:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[5].sessions.filter(s=>live(s)&&s.day<3).map(s=>obs(t.p,s))}));return {t,d0,A:t.p.decisions.at(-1)};})();
const cells=[],tally={cells:0,sameBreakB:0,askB:0,preBreakDose:0,longAbove45:0,errors:0};
for(const bStartOff of [3,7])for(const len of [2,4])for(const kind of ['SAME_DATES','EARLIER_START','LATER_END'])for(const timing of ['BEFORE_B','DURING_B','AFTER_B','AFTER_B_REPORT']){
 const t=H.copy(base.t),d0=base.d0,bs=addDays(d0,bStartOff),be=addDays(bs,len-1),back=addDays(be,1);
 const fix=kind==='SAME_DATES'?brk(addDays(d0,-16),addDays(d0,-1),'Long work trip'):kind==='EARLIER_START'?brk(addDays(d0,-17),addDays(d0,-1)):brk(addDays(d0,-16),d0);
 const fixAt=timing==='BEFORE_B'?[addDays(d0,2),'22:00']:timing==='DURING_B'?[bs,'12:00']:timing==='AFTER_B'?[back,'06:00']:[back,'08:00'];
 const ev=[[fixAt[0],fixAt[1],'A_FIX',fix],[back,'07:00','B',brk(bs,be)]].sort((a,b)=>(a[0]+a[1]).localeCompare(b[0]+b[1]));
 const rec={bStart:bs,bDays:len,fixKind:kind,timing,steps:[]};
 try{
  for(const [d,hm,what,x] of ev){const res=H.ev(t,at(t.p,weekOf(t.p,d),dayOf(t.p,d),hm,x));const dd=res.endsWith('REESTABLISH')?t.p.decisions.at(-1).interruption:null;rec.steps.push({what,at:d+' '+hm,result:res,relation:dd?.relation??null,stateAt:dd?.stateAt?`${dd.stateAt.kind}/w${dd.stateAt.week}`:null});}
  const wb=weekOf(t.p,back),rowsAfter=[wb,wb+1].flatMap(k=>(t.p.weeks[k]?.sessions??[]).filter(s=>live(s)&&s.date>=back));
  rec.preBreakDose=rowsAfter.filter(s=>s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>e.load.mode==='KNOWN'&&e.sets>=3).map(e=>`${s.id}:${e.id} ${e.sets}x${e.reps}@${e.rir}/KNOWN${e.load.value}`));
  rec.longs=rowsAfter.filter(s=>s.role==='LONG').map(s=>`${s.id} ${s.prescription.durationMinutes}`);
  const b=rec.steps.find(x=>x.what==='B');
  rec.violations=[...(b.relation==='SAME_BREAK'?['B read as SAME_BREAK']:[]),...(rec.preBreakDose.length?['pre-break dose after B']:[]),...(rowsAfter.some(s=>s.role==='LONG'&&s.prescription.durationMinutes>45)?['long run above 45 after B']:[])];
  tally.sameBreakB+=b.relation==='SAME_BREAK'?1:0;tally.askB+=b.result.startsWith('ASK')?1:0;tally.preBreakDose+=rec.preBreakDose.length?1:0;tally.longAbove45+=rec.violations.includes('long run above 45 after B')?1:0;
 }catch(e){rec.error=String(e.message??e);tally.errors++;}
 tally.cells++;cells.push(rec);
}
const byTiming={};for(const c of cells){const k=c.timing;byTiming[k]??={cells:0,violating:0};byTiming[k].cells++;if(c.violations?.length)byTiming[k].violating++;}
print({probe:'R7A2-QE-P19',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',A:{eventId:base.A.eventId,day:'2026-12-07',break:[base.A.interruption?.startDate??null,base.A.interruption?.endDate??null]},tally,byTiming,cells});
