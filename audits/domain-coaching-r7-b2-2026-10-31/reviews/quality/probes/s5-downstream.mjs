// QE-R7B2 judge probe S5-downstream: for the changed decision S5R2 (a return resent under its event id with an illness reason, in a review that
// also corrects last week's reports), which weeks' prescriptions differ between the two runtimes once each result is applied, and does the
// difference survive the next whole-week review? Controls: the same report under a new id, and a substitution pain report, each with the same
// correction (both runtimes route clinical and propose nothing). Read-only (dual.mjs).
import {NOW,PRED,BAD,correctionOf,apply,write} from './dual.mjs';
const presc=wk=>JSON.stringify(wk.sessions.map(s=>[s.id,s.prescription??null,s.status??null]));
function scenario(rt,variant){
 const {reviewed,weekly,review,evaluateProgram,opts,live,addDays}=rt.H;
 const t=reviewed({id:'qe-s5d',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},3);
 const rep=addDays(t.p.weeks[3].startDate,3),first={startDate:t.p.weeks[3].startDate,endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true};
 const r0=review(t.p,3,{day:3,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:first});apply(t,evaluateProgram(t.p,{...r0,actualLedger:t.ledger},opts));
 weekly(t,3);weekly(t,4);
 const when=`${t.p.weeks[5].startDate}T05:00:00Z`,fixes=t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&t.p.weeks[4].sessions.some(s=>s.id===o.sessionId&&s.sport==='STRENGTH')).map(o=>correctionOf(o,structuredClone(o.actual),when,BAD));
 const X=t.p.weeks[5].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
 const rv=variant==='substitution-pain'?review(t.p,5,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:fixes})
  :review(t.p,5,{day:0,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{...first,reasonCategory:null,reason:'Flu illness'},observations:fixes});
 const r=evaluateProgram(t.p,{...rv,...(variant==='same-id'?{event:{...rv.event,id:r0.event.id}}:{}),actualLedger:t.ledger},opts);
 const step={status:r.status,proposal:!!r.proposal};apply(t,r);const afterStep=t.p.weeks.map(presc);
 weekly(t,5);const afterWeek5=t.p.weeks.map(presc);
 return {step,afterStep,afterWeek5};
}
const rows=[];
for(const variant of ['same-id','new-id','substitution-pain']){
 const a=scenario(PRED,variant),b=scenario(NOW,variant);
 const weeks=(x,y)=>x.map((wk,k)=>wk!==y[k]?k:null).filter(k=>k!==null);
 rows.push({variant,freeze2:a.step,r7b2:b.step,weeksDifferingAfterTheStep:weeks(a.afterStep,b.afterStep),weeksDifferingAfterWeek5Review:weeks(a.afterWeek5,b.afterWeek5)});
}
write('s5-downstream',{rows});
console.log(JSON.stringify(rows,null,1));
