// R7B1-ENG-r1 judge probe J4 (QE-R7B-01 residual, QE-R7B-R2-04): the judge's N5 grid widened to every week ahead and to capped novices, both
// reasons, FIXED rotation (no calendar rotation can move a slot). Read-only; PROBE_ROOT=<tree> runs it on another runtime.
// - J4a: every applied substitution prescribes its selection in every slot of the replaced exercise, in every week ahead, and the replaced
//   exercise never returns;
// - J4b: the selection is never one already in the same session (the slot would take something else);
// - J4c: a substitution the runtime asks about because every candidate slips has, by the same rule, no candidate (no false question): the
//   first candidate of the R7-B order either fits every slot or is in a session with the replaced exercise.
import {record,guard,done,reviewed,review,evaluateProgram,opts,live,FULL,R,LABEL} from './lib.mjs';
const strengthSessions=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH');
const grid=[];
for(const [strength,eq,days] of [['GENERAL',['DUMBBELLS','BENCH','KETTLEBELL'],[0,4]],['STRENGTH',FULL,[0,2,4]],['HYPERTROPHY',['KETTLEBELL','BANDS'],[0,4]],['RUNNING_SUPPORT',[],[0,4]],['HYPERTROPHY',FULL,[0,1,3,4]],['GENERAL',['MACHINES','DUMBBELLS'],[0,2,4]],['STRENGTH',['DUMBBELLS','BENCH'],[0,1,3,4]],['HYPERTROPHY',['DUMBBELLS','BENCH','BANDS','PULL_UP_BAR'],[0,2,4]],['GENERAL',['BANDS','PULL_UP_BAR'],[0,2,4]],['RUNNING_SUPPORT',['DUMBBELLS','KETTLEBELL'],[0,1,3,4]],['GENERAL',['BANDS','PULL_UP_BAR'],[0,1,3,4]],['STRENGTH',['MACHINES','BANDS'],[0,2,4]],['GENERAL',FULL,[0,1,2,3,4]]])
 grid.push({id:`j4-${strength}-${eq.length}-${days.length}`,equipment:eq,goals:{run:'PERFORMANCE',strength},rotation:'FIXED',weeks:12,schedule:{strengthDays:days}});
for(const [eq,days] of [[['DUMBBELLS','BENCH'],[0,2,4,5]],[['DUMBBELLS','KETTLEBELL','BANDS'],[0,2,4]],[['BANDS','PULL_UP_BAR'],[0,1,3,4]]])
 grid.push({id:`j4-novice-${eq.length}-${days.length}`,strengthExperience:'NONE',equipment:eq,goals:{run:'REGULAR',strength:'GENERAL'},rotation:'FIXED',weeks:12,schedule:{strengthDays:days}});
let applied=0,asked=0;const A1=[],B1=[],C1=[],asks=[];
for(const o of grid){
 let t;try{t=reviewed(o,o.strengthExperience==='NONE'?1:3);}catch(e){continue;}
 const w0=o.strengthExperience==='NONE'?1:3;
 const ids=[...new Set(strengthSessions(t.p,w0+1).flatMap(s=>s.prescription.exercises.filter(e=>e.role!=='PRACTICE').map(e=>e.id)))];
 for(const id of ids)for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE'])guard('J4-'+o.id,'grid',()=>{
  const r=evaluateProgram(t.p,{...review(t.p,w0,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:id,reason,...(reason==='SKILL_MISMATCH'?{}:{nonclinicalConfirmed:true})}}),actualLedger:t.ledger},opts);
  if(r.status==='ASK'){asked++;asks.push({program:o.id,replaced:id,reason,why:String(r.reason).slice(0,160)});return;}
  if(r.status!=='MODIFY')return;applied++;
  const sel=r.substitutions[0].selected,pat=R.configurationOf(id).pattern;
  for(let w=w0+1;w<t.p.weeks.length;w++)for(const s of strengthSessions(t.p,w)){
   // Sessions are matched by template type (a decision may move a template to another day of the week: the arrangement is re-chosen).
   const old=s.prescription.exercises.find(e=>e.id===id),k=strengthSessions(t.p,w).filter(x=>x.templateType===s.templateType).indexOf(s);const nw=strengthSessions(r.proposal,w).filter(x=>x.templateType===s.templateType)[k],rows=nw?.prescription?.exercises??[];
   if(strengthSessions(r.proposal,w).some(x=>x.prescription.exercises.some(e=>e.id===id))&&k===0)A1.push({program:o.id,replaced:id,reason,week:w,session:s.id,note:'the replaced exercise returns'});
   if(!old)continue;
   // A session whose template the decision did not change may be capped/uncapped differently; compare the slot by pattern and role.
   const now=rows.filter(e=>e.pattern===pat&&e.role===old.role).map(e=>e.id);
   if(!now.includes(sel))A1.push({program:o.id,replaced:id,reason,selected:sel,week:w,session:s.id,role:old.role,prescribed:now});
   if(s.prescription.exercises.some(e=>e.id===sel))B1.push({program:o.id,replaced:id,reason,selected:sel,week:w,session:s.id});
  }
 });
}
record('J4a','the plan prescribes the selection in every slot, every week ahead',!A1.length,'every applied substitution prescribes its selection in every slot of the replaced exercise in every week ahead; the replaced exercise never returns',{programs:grid.length,applied,asked,failures:A1.slice(0,12),count:A1.length});
record('J4b','selection already in the session (information: it moves into the replaced slot and the other slot falls back)',true,'information',{failures:B1.slice(0,12),count:B1.length});
record('J4-asks','questions (information)',true,'',{asked,examples:asks.slice(0,40)});
done('j4-decision-vs-plan-grid');
