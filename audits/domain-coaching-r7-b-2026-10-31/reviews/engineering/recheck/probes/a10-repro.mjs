// Focused reproduction of A10: a SKILL_MISMATCH substitution reports the previous ladder step, the plan prescribes the next one. Read-only.
import {record,guard,done,reviewed,review,evaluateProgram,opts,live,R} from './lib.mjs';

guard('A10r','reason-based substitution / decision vs plan (focused)',()=>{
 const o={id:'e3-sub-db',equipment:['DUMBBELLS','BENCH','KETTLEBELL'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12};
 const t=reviewed(o,3),out=[];
 for(const [id,pattern,extra] of [['db-rdl','HINGE',{}],['dead-bug','TRUNK',{}],['db-rdl','HINGE',{reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true,to:'kb-deadlift'}]]){
  const r=evaluateProgram(t.p,{...review(t.p,3,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:id,reason:'SKILL_MISMATCH',...extra}}),actualLedger:t.ledger},opts);
  const sel=r.substitutions?.[0]?.selected,P2=r.proposal;
  const weeks=[4,5,6,7,8].map(w=>({week:w,[pattern]:[...new Set(P2.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>e.pattern===pattern).map(e=>`${e.id}(${e.role})`)))]}));
  out.push({replaced:id,reason:extra.reason??'SKILL_MISMATCH',athleteChosenTo:extra.to??null,decision:{status:r.status,reason:r.reason,selected:sel},ladder:{previous:R.ladderPrevious(id),next:R.ladderNext(id)},skill:{replaced:R.configurationOf(id).skill,selected:R.configurationOf(sel)?.skill,laterality:{selected:R.configurationOf(sel)?.laterality}},plannedAfter:weeks});
 }
 const bad=out.filter(x=>x.plannedAfter.some(w=>!Object.values(w)[1].some(e=>e.startsWith(x.decision.selected+'('))));
 record('A10r','reason-based substitution / decision vs plan (focused)',!bad.length,
  'after "cannot be done with steady technique" (SKILL_MISMATCH) the plan prescribes the configuration the decision selected (the previous ladder step), never the next ladder step',out);
});
done('a10-repro');
