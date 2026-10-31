// R7B1-ENG-r1 judge probe J3d (QE-R7B-R2-03, the question without a lower option): every NO_LOWER_SKILL_ALTERNATIVE question the equipment
// loss grid raises is a true question: by an independent oracle, no configuration in the direction of the SKILL_MISMATCH (a rung below the
// set-aside one, or of lower skill, never above the substitute) fits a slot of the replaced exercise with the equipment left, its role and MAIN
// subpatterns, skill admissibility and catalog admission. Also the reverse: a change applied (MODIFY) never leaves such a slot empty.
// Read-only; PROBE_ROOT=<tree> runs it on another runtime.
import {record,guard,done,reviewed,weekly,review,evaluateProgram,opts,live,addDays,FULL,apply,R,P,imp,LABEL} from './lib.mjs';
const AU=await imp('src/r6-authority.mjs'),auth=AU.r6Authority(opts);
const strengthSessions=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH');
const inUse=(p,w)=>[...new Set(strengthSessions(p,w).flatMap(s=>s.prescription.exercises.filter(e=>e.role!=='PRACTICE').map(e=>e.id)))];
const PROGRAMS=[];
for(const [eqn,eq] of [['db-kb',['DUMBBELLS','BENCH','KETTLEBELL']],['full',FULL],['db-bands',['DUMBBELLS','BENCH','BANDS']],['kb-bands-bar',['KETTLEBELL','BANDS','PULL_UP_BAR']],['machines-db',['MACHINES','DUMBBELLS','BANDS']],['bw-bands-bar',['BANDS','PULL_UP_BAR']]])
 for(const strength of ['GENERAL','STRENGTH'])for(const days of [[0,4],[0,2,4],[0,1,3,4]])PROGRAMS.push({id:`j3d-${eqn}-${strength}-${days.length}`,equipment:eq,goals:{run:'PERFORMANCE',strength},rotation:'FIXED',weeks:12,schedule:{strengthDays:days}});
const falseAsks=[],trueAsks=[],emptyOnModify=[];let asks=0,mods=0;
for(const o of PROGRAMS){
 let t0;try{t0=reviewed(o,3);}catch(e){continue;}
 const sk0=P.skeletonOf(t0.p,auth),rep=sk0.repertoire,a=t0.p.canonical.athlete,maxSkill=['NONE','NOVICE'].includes(a.strengthExperience)?0:1;
 const familiar=new Set((a.knownExercises??[]).filter(k=>k.familiar!==false).map(k=>k.id)),reached=new Set(a.ladderReached??[]);
 const skillOk=e=>familiar.has(e.id)||reached.has(e.id)||R.skillRank(e.skill)<=maxSkill;
 for(const X of inUse(t0.p,4))guard('J3d-'+o.id,'asks',()=>{
  const t=structuredClone(t0),s=evaluateProgram(t.p,{...review(t.p,3,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH'}}),actualLedger:t.ledger},opts);
  if(s.status!=='MODIFY')return;const S=s.substitutions[0].selected,Xc=R.configurationOf(X),Sc=R.configurationOf(S),extra=Sc.equipment.filter(q=>q!=='BODYWEIGHT'&&!Xc.equipment.includes(q));if(!extra.length)return;
  apply(t,s);weekly(t,3);
  const eq=t.p.canonical.athlete.equipment.filter(q=>!extra.includes(q)),have=new Set([...eq,'BODYWEIGHT']);
  const r=evaluateProgram(t.p,{...review(t.p,4,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:eq}}),actualLedger:t.ledger},opts);
  // X's slots ahead (template type, role, MAIN subpatterns) from the plan before the loss.
  const slots=[...new Map(strengthSessions(t0.p,4).flatMap(se=>se.prescription.exercises.filter(e=>e.id===X).map(e=>{const def=R.TEMPLATE_DEFS[se.templateType]?.slots?.find(z=>z.role===e.role&&(z.pattern===Xc.pattern||(z.goalContext&&Object.values(z.goalContext).some(g=>(g?.alternativePatterns??[]).includes(Xc.pattern)))));return [se.templateType+':'+e.role,{template:se.templateType,role:e.role,subpatterns:e.role==='MAIN'?def?.subpatterns??null:null,others:se.prescription.exercises.filter(z=>z.id!==X).map(z=>z.id)}];}))).values()];
  const options=sl=>R.CONFIGURATIONS.filter(e=>e.pattern===Xc.pattern&&e.roles.includes(sl.role)&&(!sl.subpatterns||sl.subpatterns.includes(e.subpattern))&&R.admitted(e,rep)&&skillOk(e)&&e.equipment.every(q=>have.has(q))&&e.id!==X&&R.followsSkillMismatch(Xc,e,Sc)&&!sl.others.includes(e.id)).map(e=>e.id);
  const perSlot=slots.map(sl=>({...sl,others:undefined,options:options(sl)}));
  if(r.status==='ASK'){asks++;const any=perSlot.filter(x=>x.options.length);(any.length?falseAsks:trueAsks).push({program:o.id,replaced:X,substitute:S,lost:extra,disclosure:(r.disclosures??[]).map(d=>d.id),slots:perSlot});}
  else if(r.status==='MODIFY'){mods++;for(const se of strengthSessions(r.proposal,4)){const was=strengthSessions(t0.p,4).find(z=>z.id===se.id);const xr=was?.prescription.exercises.find(e=>e.id===X);if(!xr)continue;if(!se.prescription.exercises.some(e=>e.pattern===Xc.pattern&&e.role===xr.role))emptyOnModify.push({program:o.id,replaced:X,substitute:S,session:se.id,role:xr.role});}}
 });
}
record('J3d','questions without a lower option are true questions',!falseAsks.length&&!emptyOnModify.length,'an equipment loss after a SKILL_MISMATCH asks only when no configuration in the reason\'s direction fits; a change applied never leaves the slot empty',{asks,mods,falseAsks:falseAsks.slice(0,10),falseCount:falseAsks.length,emptyOnModify:emptyOnModify.slice(0,10),trueAsks:trueAsks.slice(0,6)});
done('j3d-no-lower-option-asks');
