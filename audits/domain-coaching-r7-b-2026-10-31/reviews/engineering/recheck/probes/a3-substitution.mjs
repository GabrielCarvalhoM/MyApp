// Probe batch A3: reason-based substitution (DR-134; EXERCISE_SUBSTITUTION) - does the plan prescribe the configuration the decision reports?
// For every exercise in use in week 3 of a grid of programs, each reason (and an explicit `to`), the decision's `substitutions[0].selected` is
// compared with what the proposal prescribes in the slots that used the replaced exercise, in the weeks after. Read-only.
import {record,guard,done,program,reviewed,weekly,review,evaluateProgram,opts,FULL,live,obs,strengthIds,evalAt,apply,summary,R} from './lib.mjs';

const slotsUsing=(p,w,id)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map((e,i)=>({session:s.id,templateType:s.templateType,i,e})).filter(x=>x.e.id===id));
function check(t,w,sub,label){
 const r=evaluateProgram(t.p,{...review(t.p,w,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:sub}),actualLedger:t.ledger},opts);
 if(r.status!=='MODIFY')return {label,sub,status:r.status,reason:String(r.reason).slice(0,160)};
 const sel=r.substitutions?.[0]?.selected,P2=r.proposal,before=slotsUsing(t.p,w+1,sub.exerciseId);
 // In the next week, the sessions of the same template that used the replaced exercise: which configuration of the same pattern do they prescribe now?
 const now=before.map(b=>{const s=P2.weeks[w+1].sessions.find(x=>x.id===b.session);const pat=configurationOfPattern(sub.exerciseId);return {session:b.session,role:b.e.role,prescribed:(s?.prescription?.exercises??[]).filter(e=>e.pattern===pat&&e.role===b.e.role).map(e=>e.id)};});
 const ok=now.every(n=>n.prescribed.includes(sel));
 return {label,sub,status:r.status,selected:sel,nextWeek:now,consistent:ok};
}
const configurationOfPattern=id=>R.configurationOf(id)?.pattern;

guard('A10','reason-based substitution / decision vs plan',()=>{
 const cases=[],grid=[
  {id:'e3-sub-db',equipment:['DUMBBELLS','BENCH','KETTLEBELL'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},
  {id:'e3-sub-full',equipment:FULL,goals:{run:'PERFORMANCE',strength:'STRENGTH'},rotation:'FIXED',weeks:12,schedule:{strengthDays:[0,2,4]}},
  {id:'e3-sub-kb',equipment:['KETTLEBELL','BANDS'],goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},rotation:'FIXED',weeks:12},
  {id:'e3-sub-bw',equipment:[],goals:{run:'PERFORMANCE',strength:'RUNNING_SUPPORT'},rotation:'FIXED',weeks:12,strengthExperience:'NOVICE'}];
 for(const o of grid){
  const t=reviewed(o,3);
  const inUse=[...new Set(strengthIds(t.p,4,e=>e.role!=='PRACTICE'))];
  for(const id of inUse)for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE']){
   cases.push({program:o.id,...check(t,3,{exerciseId:id,reason,...(reason==='NONCLINICAL_DISCOMFORT_OR_PREFERENCE'?{nonclinicalConfirmed:true}:{})},reason)});
  }
 }
 const applied=cases.filter(c=>c.status==='MODIFY'),bad=applied.filter(c=>!c.consistent);
 record('A10','reason-based substitution / decision vs plan',bad.length===0,
  'the configuration a substitution decision reports as selected is the one the plan prescribes in place of the replaced exercise',
  {modified:applied.length,inconsistent:bad.length,asked:cases.filter(c=>c.status==='ASK').length,examples:bad.slice(0,8)});
});

// A11: a MAIN changed at the block boundary, then the new MAIN substituted for a reason: the plan must prescribe the substitute, never the MAIN the
// athlete deliberately moved away from.
guard('A11','reason-based substitution after a MAIN change',()=>{
 const LAD={id:'e3-main-sub',equipment:FULL,goals:{run:'PERFORMANCE',strength:'STRENGTH'},rotation:'COACH_DECIDES',weeks:16};
 const t=reviewed(LAD,4);
 apply(t,evalAt(t,4,{observations:t.p.weeks[4].sessions.filter(live).map(s=>obs(t.p,s)),choices:[{type:'MAIN_CHANGE',from:'goblet-squat',to:'leg-press',reason:'DELIBERATE_BLOCK_TRANSITION',purpose:'EQUIPMENT'}]}));
 const w5=strengthIds(t.p,5,e=>e.pattern==='SQUAT');weekly(t,5);
 const r=evalAt(t,6,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'leg-press',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}});
 const sel=r.substitutions?.[0]?.selected,w7=r.proposal?strengthIds(r.proposal,7,e=>e.pattern==='SQUAT'):null;
 record('A11','reason-based substitution after a MAIN change',r.status==='MODIFY'&&w7?.includes(sel)&&!w7?.includes('goblet-squat'),
  'leg-press (the MAIN chosen at the boundary) is replaced by the selected substitute; the plan never falls back to goblet-squat, the MAIN the athlete changed away from',
  {week5Squat:w5,substitution:{...summary(r),selected:sel},week7Squat:w7});
});

done('a3-substitution');
