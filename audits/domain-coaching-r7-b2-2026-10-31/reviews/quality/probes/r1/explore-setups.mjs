// R7B2-QUALITY-r1 exploratory probe: which states can put a factual proposal (factualReplan or graduationWithdrawal) on a FREEZE-2 question that
// R7-B.2 replaces with a clinical route? Checks the setups the enumeration (q1-enum.mjs) relies on, on both runtimes:
//  X1 a return reported with fewer than two sessions ahead (fromWeek = w+1), so staleReturn is live in the report week, whose PlanningView the
//     return does not anchor; X2 the run-quality graduation of a novice runner with strength, kept through a short return.
// Usage: NOW_ROOT=<worktree> PRED_ROOT=<temp archive of 146ebb8> node explore-setups.mjs
import {NOW,PRED,BAD,correctionOf,apply,write,full} from './qr1.mjs';

function x1(rt,{repDay=5,repHour='06:00:00',revDay=6,revHour='06:00:00',revWeek=3}={}){
 const {reviewed,weekly,review,evaluateProgram,opts,live,addDays,obs}=rt.H;
 const t=reviewed({id:'q-x1',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},2);
 const late=t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.day===4);weekly(t,2,{keep:s=>s.id!==late.id});
 const rep=addDays(t.p.weeks[3].startDate,repDay);
 const ret=apply(t,evaluateProgram(t.p,{...review(t.p,3,{day:repDay,hour:repHour,kind:'RETURN_AFTER_PAUSE',interruption:{startDate:t.p.weeks[3].startDate,endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true}}),actualLedger:t.ledger},opts));
 const d=t.p.decisions.filter(x=>x.action==='REESTABLISH').at(-1);
 const out={ret:{status:ret.status,action:ret.action,fromWeek:d?.fromWeek??null,cls:d?.interruption?.class??null}};
 const X=t.p.weeks[revWeek].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0]??'goblet-squat';
 const when=`${addDays(t.p.weeks[revWeek].startDate,revDay)}T05:00:00Z`;
 const w2=k=>t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&t.p.weeks[2].sessions.some(s=>s.id===o.sessionId&&s.sport===k)).map(o=>correctionOf(o,structuredClone(o.actual),when,BAD));
 const at=x=>evaluateProgram(t.p,{...review(t.p,revWeek,{day:revDay,hour:revHour,...x}),actualLedger:t.ledger},opts);
 const lateObs=obs(t.p,late);
 for(const [name,observations] of [['late only',[lateObs]],['late + w2 strength BAD',[...w2('STRENGTH'),lateObs]],['late + w2 run BAD',[...w2('RUN'),lateObs]],['w2 strength BAD only',w2('STRENGTH')],['w2 run BAD only',w2('RUN')]]){
  const a=full(rt,at({observations})),b=full(rt,at({kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations}));
  out[name]={weekly:{status:a.status,proposal:a.proposal,proposalAction:a.proposalAction,reason:String(a.reason).slice(0,110)},pain:{status:b.status,proposal:b.proposal,reason:String(b.reason).slice(0,110)}};
 }
 return out;
}
function x2(rt){
 const {reviewed,weekly,review,evaluateProgram,opts,live,addDays,obs}=rt.H;
 const GRADS={id:'q-grads',goals:{run:'PERFORMANCE',strength:'GENERAL'},runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35,strengthDaysPerWeek:2},schedule:{runMinutes:45},equipment:['DUMBBELLS','BENCH'],weeks:16};
 const t=reviewed(GRADS,3);const g=weekly(t,3);
 const out={week3:{status:g.status,action:g.action,graduated:!!t.p.canonical.athlete.runGraduation,qualifyingWeeks:t.p.canonical.athlete.runGraduation?.qualifyingWeeks?.map(q=>q.week)??null,fromWeek:t.p.canonical.athlete.runGraduation?.fromWeek??null}};
 // A short WORK return in week 4 (break days 0-2, reported day 3), then the correction of week 3's long run in week 4 / week 5.
 const rep=addDays(t.p.weeks[4].startDate,3);
 const ret=apply(t,evaluateProgram(t.p,{...review(t.p,4,{day:3,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:t.p.weeks[4].startDate,endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true}}),actualLedger:t.ledger},opts));
 out.ret={status:ret.status,action:ret.action,stillGraduated:!!t.p.canonical.athlete.runGraduation,fromWeek:t.p.decisions.filter(x=>x.action==='REESTABLISH').at(-1)?.fromWeek};
 const longObs=t.ledger.filter(o=>!o.superseded&&t.p.weeks[3].sessions.some(s=>s.id===o.sessionId&&s.role==='LONG'))[0];
 const fix=correctionOf(longObs,structuredClone(longObs.actual),`${addDays(rep,1)}T05:00:00Z`,BAD);
 const r=full(rt,evaluateProgram(t.p,{...review(t.p,4,{day:4,hour:'06:00:00',observations:[fix]}),actualLedger:t.ledger},opts));
 out.correctionInReentryWeek={status:r.status,proposal:r.proposal,proposalAction:r.proposalAction,disclosureIds:r.disclosureIds,reason:String(r.reason).slice(0,120)};
 return out;
}
const res={};
for(const [label,rt] of [['freeze2',PRED],['r7b2',NOW]]){
 res[label]={
  x1_rep5_rev6:x1(rt),
  x1_rep5_rev5noon:x1(rt,{revDay:5,revHour:'12:00:00'}),
  x1_rep4pm_rev6:x1(rt,{repDay:4,repHour:'21:00:00',revDay:6,revHour:'06:00:00'}),
  x1_rep5_rev_w4d0:x1(rt,{revWeek:4,revDay:0}),
  x2:x2(rt)};
}
write('explore-setups',res);
console.log(JSON.stringify(res,null,1));
