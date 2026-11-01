// R7B1-ENG-r2 judge probe K4 (the cycle's exhaustion question: every candidate is already in a session with X). Read-only; PROBE_ROOT=<tree> runs
// it on another runtime. For every such question in a grid, an independent oracle names each other configuration of the same pattern
// (substitution.to) in the same review: "Name another exercise" must be offered exactly when one of them is applied, and a question offering only
// "Keep X" must ask for nothing. K4b: such a question leaves the plan as it was (no proposal) and a later weekly review is not blocked by it.
import {record,guard,done,reviewed,weekly,review,evaluateProgram,opts,live,FULL,R,LABEL} from './lib.mjs';
const strength=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH');
const grid=[];
for(const [exp,eq,days,rot] of [['NOVICE',['DUMBBELLS','BENCH'],[0,2,4,5],'COACH_DECIDES'],['INTERMEDIATE',['DUMBBELLS'],[0,2,4,5],'COACH_DECIDES'],['NOVICE',['DUMBBELLS','BENCH','BANDS'],[0,2,4],'FIXED'],['INTERMEDIATE',['BANDS','PULL_UP_BAR'],[0,2,4],'FIXED'],['INTERMEDIATE',FULL,[0,1,3,4],'FIXED'],['NONE',['DUMBBELLS','BENCH'],[0,2,4,5],'FIXED']])
 grid.push({id:`k4-${exp}-${eq.length}-${days.length}-${rot}`,weeks:16,rotation:rot,goals:{run:'PERFORMANCE',strength:'GENERAL'},strengthExperience:exp,equipment:eq,schedule:{strengthDays:days}});
const F=[],cases=[];let questions=0;
for(const o of grid){
 let t;try{t=reviewed(o,2);}catch(e){continue;}
 const ids=[...new Set(strength(t.p,3).flatMap(s=>s.prescription.exercises.filter(e=>e.role!=='PRACTICE').map(e=>e.id)))];
 for(const X of ids)for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE'])guard('K4-'+o.id,'exhaustion',()=>{
  const at=(x={})=>evaluateProgram(t.p,{...review(t.p,2,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason,...(reason==='SKILL_MISMATCH'?{}:{nonclinicalConfirmed:true}),...x}}),actualLedger:t.ledger},opts);
  const r=at();if(r.status!=='ASK'||!/^Every admissible alternative/.test(String(r.reason)))return;questions++;
  const d=(r.disclosures??[]).find(x=>x.id==='NO_ADMISSIBLE_ALTERNATIVE'),offersName=(d?.options??[]).some(x=>/Name another/.test(x));
  const Xc=R.configurationOf(X),works=R.CONFIGURATIONS.filter(e=>e.pattern===Xc.pattern&&e.id!==X).map(e=>e.id).filter(to=>at({to}).status==='MODIFY');
  cases.push({program:o.id,X,reason:reason[0],offersName,missingInputs:r.missingInputs,proposal:!!r.proposal,namedThatWork:works});
  if(offersName!==works.length>0)F.push({program:o.id,X,reason,offersName,namedThatWork:works,note:offersName?'naming offered but no named exercise is applied':'a named exercise is applied but naming is not offered'});
  if(!offersName&&(r.missingInputs??[]).length)F.push({program:o.id,X,reason,missingInputs:r.missingInputs,note:'only keeping is offered but an input is asked for'});
  if(r.proposal)F.push({program:o.id,X,reason,note:'the question proposes a plan'});
 });
}
// K4b: after a keep-only question, the next weekly review still decides normally.
const keepOnly=cases.find(c=>!c.offersName);let after=null;
if(keepOnly)guard('K4b','after',()=>{const o=grid.find(g=>g.id===keepOnly.program),t=reviewed(o,2);
 const r=evaluateProgram(t.p,{...review(t.p,2,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:keepOnly.X,reason:keepOnly.reason==='S'?'SKILL_MISMATCH':'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',...(keepOnly.reason==='S'?{}:{nonclinicalConfirmed:true})}}),actualLedger:t.ledger},opts);
 const w=weekly(t,2,{extra:{referenceState:r.referenceState}});after={question:{status:r.status,pending:r.referenceState?.pending?.status??null,missingInputs:r.missingInputs},nextWeekly:{status:w.status,action:w.action,pending:w.referenceState?.pending??null}};
 if(['ASK','HOLD'].includes(w.status))F.push({note:'the weekly review after a keep-only question is blocked',after});});
record('K4','the exhaustion question offers what acts',!F.length,'naming is offered exactly when a named exercise of the same pattern is applied; a keep-only question asks for nothing and proposes nothing; it never blocks the next weekly review',{label:LABEL,questions,failures:F.slice(0,12),cases:cases.slice(0,30),after});
done('k4-exhaustion-question');
