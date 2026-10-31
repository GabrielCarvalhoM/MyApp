// R7B1-ENG-r1 judge probe J3 (QE-R7B-R2-03 and the knock-on restriction). Read-only; PROBE_ROOT=<tree> runs it on another runtime.
// Grid: programs x every exercise in use x SKILL_MISMATCH (week 3), then
// - J3a: equipment loss of the substitute (permanent and a one-week window, week 4 on) and the next weekly reviews: the replaced exercise's
//   slots never take the replaced exercise, a rung above it, or a configuration above the substitute's skill; when a usable rung below it exists,
//   the slot takes the nearest such rung; a slot left without a configuration is asked about, never silently dropped;
// - J3b: knock-on slots (other rows of a session that change because of the decision): do they take a configuration harder than the
//   exercise just reported as not doable with steady technique, on its own ladder or of a higher skill in its pattern?
// - J3c: a later context change (schedule, goal) after the SKILL_MISMATCH keeps the direction and never leaves a pattern silently unfilled.
import {record,guard,done,reviewed,weekly,review,evaluateProgram,opts,live,addDays,FULL,apply,R,LABEL} from './lib.mjs';

const climb=id=>{const out=new Set(),todo=[id];while(todo.length)for(const n of R.ladderNext(todo.pop()))if(!out.has(n)){out.add(n);todo.push(n);}return out;};
const sk=id=>R.skillRank(R.configurationOf(id).skill);
const strengthSessions=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH');
const inUse=(p,w)=>[...new Set(strengthSessions(p,w).flatMap(s=>s.prescription.exercises.filter(e=>e.role!=='PRACTICE').map(e=>e.id)))];
const PROGRAMS=[];
for(const [eqn,eq] of [['db-kb',['DUMBBELLS','BENCH','KETTLEBELL']],['full',FULL],['db-bands',['DUMBBELLS','BENCH','BANDS']],['kb-bands-bar',['KETTLEBELL','BANDS','PULL_UP_BAR']],['machines-db',['MACHINES','DUMBBELLS','BANDS']],['bw-bands-bar',['BANDS','PULL_UP_BAR']],['db-only',['DUMBBELLS']]])
 for(const strength of ['GENERAL','STRENGTH','HYPERTROPHY'])for(const days of [[0,4],[0,2,4],[0,1,3,4]])PROGRAMS.push({id:`j3-${eqn}-${strength}-${days.length}`,equipment:eq,goals:{run:'PERFORMANCE',strength},rotation:'FIXED',weeks:12,schedule:{strengthDays:days}});
PROGRAMS.push({id:'j3-novice-kb-bands',strengthExperience:'NONE',equipment:['DUMBBELLS','KETTLEBELL','BANDS'],goals:{run:'REGULAR',strength:'GENERAL'},rotation:'FIXED',weeks:12,schedule:{strengthDays:[0,2,4,5]}});
const F={J3a:[],J3aAsk:[],J3b:[],J3bAll:[],J3c:[]},stats={substitutions:0,withEquipment:0,losses:0,asked:0,modified:0,knockOnRows:0,knockOnClimbs:0,laterChanges:0};
const rowsOf=s=>s.prescription.exercises;
for(const o of PROGRAMS){
 let t0;try{t0=reviewed(o,3);}catch(e){continue;}
 for(const X of inUse(t0.p,4))guard('J3-'+o.id,'skill mismatch',()=>{
  const t=structuredClone(t0),s=evaluateProgram(t.p,{...review(t.p,3,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH'}}),actualLedger:t.ledger},opts);
  if(s.status!=='MODIFY')return;stats.substitutions++;
  const S=s.substitutions[0].selected,Xc=R.configurationOf(X),Sc=R.configurationOf(S),above=climb(X);
  // J3b: knock-on rows in weeks 4..end (FIXED rotation): rows that are new in a session and are not the substitute.
  for(let w=4;w<t0.p.weeks.length;w++)for(const before of strengthSessions(t0.p,w)){const after=s.proposal.weeks[w].sessions.find(x=>x.id===before.id);if(!after?.prescription?.exercises)continue;
   const had=new Set(rowsOf(before).map(e=>e.id));for(const e of rowsOf(after)){if(had.has(e.id)||e.id===S||e.role==='PRACTICE')continue;stats.knockOnRows++;
    const harder=e.pattern===Xc.pattern&&(above.has(e.id)||sk(e.id)>sk(X));if(harder){stats.knockOnClimbs++;F.J3bAll.push({program:o.id,replaced:X,substitute:S,knockOn:e.id,role:e.role,aboveOnLadder:above.has(e.id),skill:{replaced:Xc.skill,knockOn:R.configurationOf(e.id).skill}});if(F.J3b.length<40)F.J3b.push({program:o.id,week:w,session:before.id,replaced:X,substitute:S,knockOn:e.id,role:e.role,aboveOnLadder:above.has(e.id),skill:{replaced:Xc.skill,knockOn:R.configurationOf(e.id).skill},wasInSession:[...had].filter(id=>R.configurationOf(id)?.pattern===Xc.pattern)});}}}
  // J3a: equipment loss of the substitute.
  const extra=Sc.equipment.filter(q=>q!=='BODYWEIGHT'&&!Xc.equipment.includes(q));
  if(extra.length){stats.withEquipment++;
   apply(t,s);weekly(t,3);
   for(const variant of ['permanent','window']){
    const c=structuredClone(t),eq=c.p.canonical.athlete.equipment.filter(q=>!extra.includes(q)),change=variant==='permanent'?{equipment:eq}:{equipment:eq,from:c.p.weeks[5].startDate,to:addDays(c.p.weeks[5].startDate,6)};
    const r=evaluateProgram(c.p,{...review(c.p,4,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:change}),actualLedger:c.ledger},opts);stats.losses++;
    const x={program:o.id,replaced:X,substitute:S,lost:extra,variant,status:r.status};
    if(r.status==='ASK'){stats.asked++;F.J3aAsk.push({...x,disclosure:(r.disclosures??[]).map(d=>d.id),reason:String(r.reason).slice(0,200)});continue;}
    if(!['MODIFY','KEEP'].includes(r.status)){F.J3a.push({...x,note:'neither a change nor a question',reason:String(r.reason).slice(0,160)});continue;}
    stats.modified++;apply(c,r);
    for(let w=4;w<Math.min(9,c.p.weeks.length);w++){if(w>4)weekly(c,w-1,{o:()=>({kg:()=>12})});
     const win=variant==='window'&&w===5,have=new Set([...(win?eq:c.p.canonical.athlete.equipment),'BODYWEIGHT']);
     for(const before of strengthSessions(t0.p,w)){const xr=rowsOf(before).find(e=>e.id===X);if(!xr)continue;const now=c.p.weeks[w].sessions.find(z=>z.id===before.id);if(!now?.prescription)continue;
      const slot=rowsOf(now).filter(e=>e.pattern===Xc.pattern&&e.role===xr.role);
      if(!slot.length){F.J3a.push({...x,week:w,session:before.id,note:'the replaced exercise\'s slot is empty without a question'});continue;}
      for(const e of slot){
       if(e.id===X||above.has(e.id)||e.id!==S&&sk(e.id)>sk(S))F.J3a.push({...x,week:w,session:before.id,prescribes:e.id,note:'climbs'});
       // order oracle: a usable rung below X (equipment of the date, role, MAIN subpatterns via the slot pattern, not in the session) comes first.
       if(e.id!==S){const down=R.ladderDown(X).filter(id=>{const g=R.configurationOf(id);return g&&g.roles.includes(xr.role)&&g.equipment.every(q=>have.has(q))&&g.pattern===Xc.pattern&&R.followsSkillMismatch(Xc,g,Sc)&&!rowsOf(now).some(z=>z.id===id&&z!==e);});
        if(down.length&&e.id!==down[0])F.J3a.push({...x,week:w,session:before.id,prescribes:e.id,nearestUsableRung:down[0],note:'not the nearest usable rung below the set-aside one'});}
      }}
    }
   }
  }
 });
}
// J3c: later context changes after a SKILL_MISMATCH (schedule, goal): the direction holds and no pattern is silently left out.
for(const [name,o,X,change] of [
 ['hinge-2to3',{id:'j3c-a',equipment:['DUMBBELLS','BENCH','KETTLEBELL'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},'db-rdl',{kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4]}}],
 ['hinge-2to4',{id:'j3c-b',equipment:['DUMBBELLS','BENCH','KETTLEBELL'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},'db-rdl',{kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,1,3,4]}}],
 ['hinge-goal',{id:'j3c-c',equipment:['DUMBBELLS','BENCH','KETTLEBELL'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},'db-rdl',{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}],
 ['push-3to4',{id:'j3c-d',equipment:['BANDS','PULL_UP_BAR'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12,schedule:{strengthDays:[0,2,4]}},'push-up',{kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,1,3,4]}}],
 ['row-2to4',{id:'j3c-e',equipment:FULL,goals:{run:'PERFORMANCE',strength:'STRENGTH'},rotation:'FIXED',weeks:12},'db-row',{kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,1,3,4]}}],
 ['hinge-kbwindow-2to3',{id:'j3c-f',equipment:['DUMBBELLS','BENCH','KETTLEBELL'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},'db-rdl',{kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4]}},true]])
 guard('J3c-'+name,'later context change',()=>{
  const t=reviewed(o,3);if(!inUse(t.p,4).includes(X)){F.J3c.push({name,note:X+' not in use'});return;}
  const s=apply(t,evaluateProgram(t.p,{...review(t.p,3,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH'}}),actualLedger:t.ledger},opts));
  if(s.status!=='MODIFY'){F.J3c.push({name,note:'substitution '+s.status});return;}
  const S=s.substitutions[0].selected,Xc=R.configurationOf(X),above=climb(X);weekly(t,3);
  const r=evaluateProgram(t.p,{...review(t.p,4,{day:0,hour:'06:00:00',...change}),actualLedger:t.ledger},opts);stats.laterChanges++;
  const x={name,replaced:X,substitute:S,change:change.kind,status:r.status,action:r.action};
  if(r.status!=='MODIFY'){F.J3c.push({...x,note:'not applied',reason:String(r.reason).slice(0,200)});return;}
  apply(t,r);
  for(let w=5;w<t.p.weeks.length;w++){for(const s2 of strengthSessions(t.p,w)){
    const tpl=s2.templateType,mainPats=(R.TEMPLATE_DEFS[tpl]?.slots??[]).filter(z=>z.role==='MAIN').map(z=>z.pattern);
    for(const e of rowsOf(s2))if(e.pattern===Xc.pattern&&(e.id===X||above.has(e.id)||e.id!==S&&sk(e.id)>sk(S)))F.J3c.push({...x,week:w,session:s2.id,prescribes:e.id,note:'climbs after a later context change'});
    if(mainPats.includes(Xc.pattern)&&!rowsOf(s2).some(e=>e.pattern===Xc.pattern||R.configurationOf(e.id)?.pattern===Xc.pattern))F.J3c.push({...x,week:w,session:s2.id,template:tpl,note:'a MAIN '+Xc.pattern+' slot is silently empty'});}
   if(w<t.p.weeks.length-1&&w<8)weekly(t,w,{o:()=>({kg:()=>12})});}
 });
record('J3a','fallback after the substitute loses its equipment',!F.J3a.length,'never the replaced exercise, a rung above it or above the substitute\'s skill; the nearest usable rung below first; no slot silently empty',{stats,failures:F.J3a.slice(0,20),count:F.J3a.length,asked:F.J3aAsk.slice(0,30)});
record('J3b','knock-on slots after a SKILL_MISMATCH (information for the restriction)',true,'counted, judged in the review',{knockOnRows:stats.knockOnRows,knockOnHarder:stats.knockOnClimbs,byPair:Object.entries(F.J3bAll.reduce((m,x)=>{const k=x.replaced+' -> '+x.substitute+' | knock-on '+x.knockOn+' ('+x.role+(x.aboveOnLadder?', above on ladder':'')+', '+x.skill.replaced+'->'+x.skill.knockOn+')';m[k]=(m[k]??0)+1;return m;},{})),examples:F.J3b});
record('J3c','direction after later context changes',!F.J3c.length,'a schedule or goal change after a SKILL_MISMATCH keeps the direction and never leaves a MAIN pattern silently empty',{failures:F.J3c.slice(0,20),count:F.J3c.length});
done('j3-skill-mismatch-fallback');
