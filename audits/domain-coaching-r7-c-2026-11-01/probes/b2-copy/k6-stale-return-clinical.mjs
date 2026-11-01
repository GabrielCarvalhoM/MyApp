// R7B1-ENG-r2 judge probe K6 (outside the cycle's delta; pre-existing path checked for the clinical-first invariant QE-R7B1-01 restores): the R7-A
// late-evidence question (staleReturn, "confirm that interruption again") is decided before the handler, like the block-choice question was. Does
// a review that reports pain with an exercise, or an illness interruption, during a return's re-entry week with late training before that break
// still route to a human? Read-only; PROBE_ROOT=<tree> runs it on another runtime.
import {record,guard,done,reviewed,weekly,review,evaluateProgram,opts,live,addDays,obs,apply,LABEL} from './lib.mjs';
const rows=[];
guard('K6','stale return x clinical',()=>{
 const t=reviewed({id:'k6',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},2);
 const late=t.p.weeks[2].sessions.find(s=>live(s)&&s.sport==='STRENGTH'&&s.day===4);
 weekly(t,2,{keep:s=>s.id!==late.id});
 const rep=addDays(t.p.weeks[3].startDate,3);
 const ret=apply(t,evaluateProgram(t.p,{...review(t.p,3,{day:3,hour:'06:00:00',kind:'RETURN_AFTER_PAUSE',interruption:{startDate:t.p.weeks[3].startDate,endDate:addDays(rep,-1),reasonCategory:'WORK',reason:'Work travel',nonclinical:true}}),actualLedger:t.ledger},opts));
 const lateObs=obs(t.p,late),X=t.p.weeks[3].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>rep).flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
 for(const [name,x] of [['weekly-midweek',{}],['substitution-pain',{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true}}],['substitution-pain-no-late',{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},noLate:true}],['return-illness',{kind:'RETURN_AFTER_PAUSE',interruption:{days:1,reason:'Flu illness',nonclinical:true}}],['substitution-pain+ladder-choice',{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}]}],['substitution-pain+unrecognised-choice',{kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},choices:[{type:'LADDER_JUMP'}]}]]){
  const {noLate,...rx}=x;
  const r=evaluateProgram(t.p,{...review(t.p,3,{day:4,hour:'06:00:00',...rx,observations:noLate?[]:[lateObs]}),actualLedger:t.ledger},opts);
  rows.push({name,status:r.status,action:r.action,proposal:!!r.proposal,pending:r.referenceState?.pending?.status??null,reason:String(r.reason).slice(0,150)});
 }
 rows.unshift({name:'return',status:ret.status,action:ret.action});
});
const bypass=rows.filter(r=>/pain|illness/.test(r.name)&&r.status!=='CLINICAL_HUMAN_REQUIRED');
record('K6','clinical first against the late-evidence question (pre-existing path, information)',!bypass.length,'a review reporting pain or illness routes to a human even when late training before the latest break is in the same review',{label:LABEL,rows,bypass});
done('k6-stale-return-clinical');
