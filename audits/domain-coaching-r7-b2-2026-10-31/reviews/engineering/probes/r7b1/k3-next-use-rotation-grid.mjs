// R7B1-ENG-r2 judge probe K3 (the cycle's week-of-next-use slot check, counted over the week). Read-only; PROBE_ROOT=<tree> runs it on another
// runtime (compare the status table between FREEZE-1 and FREEZE-2). Grid: programs under EVERY_2_WEEKS, COACH_DECIDES and FIXED rotation, plus
// capped novices, every exercise in use in the next week, both reasons, decided on day 1 of week 4 (rotation active).
// - K3a: an applied substitution holds the selection in every place (pattern and role, counted over the week) the replaced exercise held in its
//   week of next use, and the replaced exercise never returns;
// - K3b: the status of every decision, for the comparison with FREEZE-1 (a question FREEZE-1 did not raise must be a true slip, never a false one).
import {record,guard,done,reviewed,review,evaluateProgram,opts,live,FULL,R,LABEL} from './lib.mjs';
import {createHash} from 'node:crypto';
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0,12);
const strength=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH');
const grid=[];
for(const rotation of ['EVERY_2_WEEKS','COACH_DECIDES','FIXED'])for(const [goal,eq,days] of [['GENERAL',FULL,[0,2,4]],['HYPERTROPHY',['DUMBBELLS','BENCH','BANDS','PULL_UP_BAR'],[0,2,4]],['STRENGTH',['DUMBBELLS','BENCH','KETTLEBELL'],[0,1,3,4]],['GENERAL',['BANDS','PULL_UP_BAR'],[0,2,4]],['RUNNING_SUPPORT',['MACHINES','DUMBBELLS'],[0,4]]])
 grid.push({id:`k3-${rotation}-${goal}-${eq.length}-${days.length}`,equipment:eq,goals:{run:'PERFORMANCE',strength:goal},rotation,weeks:12,schedule:{strengthDays:days}});
for(const rotation of ['EVERY_2_WEEKS','COACH_DECIDES'])grid.push({id:`k3-novice-${rotation}`,strengthExperience:'NONE',equipment:['DUMBBELLS','BENCH'],goals:{run:'REGULAR',strength:'GENERAL'},rotation,weeks:12,schedule:{strengthDays:[0,2,4,5]}});
const table=[],A3=[];let applied=0,asked=0;
for(const o of grid){
 let t;try{t=reviewed(o,o.strengthExperience==='NONE'?2:4);}catch(e){table.push(`${o.id}: setup ${String(e.message).slice(0,80)}`);continue;}
 const w0=o.strengthExperience==='NONE'?2:4,day=t.p.weeks[w0].startDate;
 const ids=[...new Set([w0,w0+1].flatMap(w=>strength(t.p,w).filter(s=>s.date>day).flatMap(s=>s.prescription.exercises.filter(e=>e.role!=='PRACTICE').map(e=>e.id))))].sort();
 for(const X of ids)for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE'])guard('K3-'+o.id,'grid',()=>{
  const r=evaluateProgram(t.p,{...review(t.p,w0,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason,...(reason==='SKILL_MISMATCH'?{}:{nonclinicalConfirmed:true})}}),actualLedger:t.ledger},opts);
  table.push(`${o.id}|${X}|${reason[0]}: ${r.status}${r.substitutions?'>'+r.substitutions[0].selected:''}`);
  if(r.status==='ASK'){asked++;return;}if(r.status!=='MODIFY')return;applied++;
  const sel=r.substitutions[0].selected,ahead=s=>s.date>=t.p.weeks[w0].startDate&&!(s.weekIndex===w0&&s.date<=day);
  const kX=t.p.weeks.findIndex((x,i)=>i>=w0&&x.sessions.some(s=>ahead(s)&&live(s)&&(s.prescription.exercises??[]).some(e=>e.id===X)));
  if(kX<0)return;
  const need=new Map(),put=(k,d)=>need.set(k,(need.get(k)??0)+d);
  for(const s of t.p.weeks[kX].sessions.filter(s=>ahead(s)&&live(s)))for(const e of s.prescription.exercises??[])if(e.id===X)put(e.pattern+'|'+e.role,1);
  for(const s of r.proposal.weeks[kX].sessions.filter(s=>ahead(s)&&live(s)))for(const e of s.prescription.exercises??[])if(e.id===sel)put(e.pattern+'|'+e.role,-1);
  const short=[...need].filter(([,v])=>v>0);
  if(short.length)A3.push({program:o.id,replaced:X,reason,selected:sel,week:kX,places:short});
  if(r.proposal.weeks.slice(w0).some(x=>x.sessions.some(s=>ahead(s)&&live(s)&&(s.prescription.exercises??[]).some(e=>e.id===X))))A3.push({program:o.id,replaced:X,reason,note:'the replaced exercise returns'});
 });
}
record('K3a','the week of next use holds the selection',!A3.length,'every applied substitution holds its selection in each place the replaced exercise held in its week of next use, and the replaced exercise never returns',{label:LABEL,programs:grid.length,applied,asked,failures:A3.slice(0,12),count:A3.length});
record('K3b','status table (for the FREEZE-1 comparison)',true,'',{tableHash:sha(table),table});
done('k3-next-use-rotation-grid');
