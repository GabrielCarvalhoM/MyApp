// Probe batch C: boundary behaviour and impossible combinations on the frozen R7-B runtime (engineering judge, read-only).
import {record,guard,done,program,reviewed,weekly,review,evaluateProgram,generateProgram,opts,FULL,K,rows,runs,live,obs,intake,gen,addDays,RECORDS,without,strengthIds,qualityRuns,evalAt,apply,summary,R,P,V} from './lib.mjs';

const validate=p=>P.validateWeeks(P.skeletonOf(p,opts.authority),p.weeks);
/** Conformance of every live session of a program to the bound catalog (the request §21 property), plus no kilogram on a no-kg configuration. */
function conformance(p){
 const bad=[];
 for(const w of p.weeks)for(const s of w.sessions.filter(live)){
  if(s.sport==='RUN'){if(!R.runRepertoireOf(s.prescription))bad.push(`${s.id}:runFamily:${s.prescription.family}`);continue;}
  for(const e of s.prescription.exercises){const c=R.configurationOf(e.id);if(!c){bad.push(`${s.id}:unknown:${e.id}`);continue;}
   if(!c.roles.includes(e.role))bad.push(`${s.id}:role:${e.id}:${e.role}`);
   if(R.noExternalLoad(c)&&(e.load.unit==='KG'||Number.isFinite(e.load.value)&&e.load.value>0))bad.push(`${s.id}:kg:${e.id}`);
   if(c.skill==='HIGH'&&!P.highSkillAdmissible(P.skeletonOf(p,opts.authority),c.id))bad.push(`${s.id}:highSkill:${e.id}`);}
 }
 return bad;
}

// C2: the B0-C10 5K fallback when the authority given to the planner lacks the B0-C10 record (options.repertoireRecords).
guard('C2','authority binding / 5K fallback',()=>{
 const o={id:'c-5k',goals:{run:'RACE',strength:'NONE'},event:{kind:'5K',date:'2026-12-20'},schedule:{strengthDays:[]}};
 const off=gen(o,{...opts,repertoireRecords:without('B0-C10')}),on=gen(o);
 const a=R.repertoireAuthority({...opts,repertoireRecords:without('B0-C10'),asOf:'2026-11-01'});
 record('C2','authority binding / 5K fallback',off.status!=='PROPOSED',
  'the planner\'s own repertoire authority (without B0-C10) decides the 5K fallback: off, a 5K stays outside the event scope as in R6 (as when the records file lacks the record)',
  {authorityGivenApprovesC10:!!a.approved['B0-C10'],withoutC10:{status:off.status,goal:off.program?.goal?.run?.kind??null,disclosure:(off.negotiation??[]).some(n=>n.id==='EVENT_5K_PERFORMANCE_FALLBACK'),bindingApproved:off.program?.repertoire?.approvedCandidates??null},withC10:{status:on.status}});
});

// C4: one-day schedules and minimal equipment, every week executed and reviewed: each proposal validates and conforms (catalog, roles, no kg on
// bodyweight, band or assisted rows, HIGH skill only when admissible).
guard('C4','boundaries / one-day schedules and minimal equipment',()=>{
 const cases=[
  {id:'c-one-novice',strengthExperience:'NONE',runExperience:'NONE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:0,strengthDaysPerWeek:0},equipment:[],goals:{run:'PERFORMANCE',strength:'GENERAL'},schedule:{runDays:[6],strengthDays:[2],longRunDay:6,runMinutes:30,strengthMinutes:30,longRunMinutes:30}},
  {id:'c-one-strength',equipment:[],goals:{run:'PERFORMANCE',strength:'STRENGTH'},schedule:{runDays:[6],strengthDays:[2],longRunDay:6}},
  {id:'c-bands-only',equipment:['BANDS'],goals:{run:'REGULAR',strength:'HYPERTROPHY'},schedule:{strengthDays:[0,2,4]}},
  {id:'c-bar-only',equipment:['PULL_UP_BAR'],strengthExperience:'NOVICE',goals:{run:'PERFORMANCE',strength:'RUNNING_SUPPORT'},schedule:{strengthDays:[1,4]}},
  {id:'c-event-one-day',goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-24'},weeks:12,equipment:['KETTLEBELL'],recent:{runDaysPerWeek:2,runMinutesPerWeek:90,longestRunMinutes:45,strengthDaysPerWeek:1},schedule:{runDays:[2,6],strengthDays:[4]}}];
 const out=[];
 for(const o of cases){
  const g=gen(o);if(!g.program){out.push({id:o.id,status:g.status,reason:g.reason});continue;}
  const t={p:g.program,ledger:[]},issues=[];
  for(let w=0;w<t.p.weeks.length-1;w++){
   const r=evaluateProgram(t.p,{...review(t.p,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s,{kg:e=>e.load.convention==='PER_HAND'?8:16}))}),actualLedger:t.ledger},opts);
   if(['UNSUPPORTED','HOLD'].includes(r.status)){issues.push(`w${w}:${r.status}:${String(r.reason).slice(0,100)}:${(r.errors??[]).slice(0,3)}`);break;}
   apply(t,r);
   const v=validate(t.p),c=conformance(t.p);if(v.length||c.length)issues.push(`w${w}:validate:${v.slice(0,3)}|conformance:${c.slice(0,3)}`);
  }
  out.push({id:o.id,status:g.status,weeks:t.p.weeks.length,issues:issues.slice(0,4)});
 }
 record('C4','boundaries / one-day schedules and minimal equipment',out.every(x=>x.status!=='PROPOSED'||!x.issues.length),
  'every reviewed week of one-day and minimal-equipment programs validates and conforms to the bound catalog',out);
});

// C5: impossible block choices at a real block boundary: each is asked or refused, never planned.
guard('C5','impossible combinations / block choices',()=>{
 const t=reviewed({id:'c-choices',equipment:FULL,goals:{run:'PERFORMANCE',strength:'STRENGTH'},rotation:'COACH_DECIDES',weeks:16},4);
 const ob=t.p.weeks[4].sessions.filter(live).map(s=>obs(t.p,s));
 const inUse=strengthIds(t.p,4),acc=t.p.weeks[4].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises).find(e=>e.role==='ACCESSORY'&&!t.p.weeks[4].sessions.some(x=>(x.prescription?.exercises??[]).some(y=>y.id===e.id&&y.role==='MAIN')));
 const cases={
  ladderToUnknown:[{type:'LADDER_STEP',from:'goblet-squat',to:'no-such-lift'}],
  mainToUnknown:[{type:'MAIN_CHANGE',from:'goblet-squat',to:'no-such-lift',reason:'ATHLETE_PREFERENCE'}],
  mainFromAccessory:[{type:'MAIN_CHANGE',from:acc?.id,to:'leg-press',reason:'ATHLETE_PREFERENCE'}],
  mainToHighUnfamiliar:[{type:'MAIN_CHANGE',from:'goblet-squat',to:'front-squat',reason:'ATHLETE_PREFERENCE'}],
  ladderSkip:(()=>{for(const id of inUse)for(const c of R.SKILL_LADDERS){const i=c.indexOf(id);if(i>=0&&c[i+2])return [{type:'LADDER_STEP',from:id,to:c[i+2]}];}return [{type:'LADDER_STEP',from:'goblet-squat',to:'no-skip-found'}];})(),
  ladderNotInUse:[{type:'LADDER_STEP',from:'sit-to-stand',to:'box-squat-bodyweight'}],
  mainToOtherPattern:[{type:'MAIN_CHANGE',from:'goblet-squat',to:'db-rdl',reason:'EQUIPMENT_CHANGE'}],
  mainNoReason:[{type:'MAIN_CHANGE',from:'goblet-squat',to:'leg-press'}]
 };
 const out={};
 for(const [k,choices] of Object.entries(cases)){const r=evaluateProgram(t.p,{...review(t.p,4,{observations:ob,choices}),actualLedger:t.ledger},opts);
  const planned=r.proposal?choices.some(c=>c.to&&strengthIds(r.proposal,5).includes(c.to)&&!inUse.includes(c.to)):false;out[k]={...summary(r),planned};}
 record('C5','impossible combinations / block choices',Object.values(out).every(x=>x.status==='ASK'&&!x.planned),
  'unknown configurations, a MAIN change from an accessory or to another pattern or to an unfamiliar HIGH-skill lift, a step not on the next rung, a step from an exercise not in use, a MAIN change without a reason: asked, never planned',out);
});

// C6: impossible reason-based substitutions: asked or routed, never planned.
guard('C6','impossible combinations / substitution',()=>{
 const t=reviewed({id:'c-sub',equipment:['DUMBBELLS','BENCH'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},2);
 const pastOnly=t.p.weeks[1].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id)).find(id=>!t.p.weeks.slice(2).some(w=>w.sessions.some(s=>(s.prescription?.exercises??[]).some(e=>e.id===id))));
 const at=sub=>evaluateProgram(t.p,{...review(t.p,2,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:sub}),actualLedger:t.ledger},opts);
 const base={exerciseId:'goblet-squat',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true};
 const cases={toHighUnfamiliar:{...base,to:'back-squat'},toOtherPattern:{...base,to:'db-rdl'},toMissingEquipment:{...base,to:'leg-press'},toItself:{...base,to:'goblet-squat'},unknownExercise:{...base,exerciseId:'no-such-lift'},toUnknown:{...base,to:'no-such-lift'},painText:{exerciseId:'goblet-squat',reason:'SKILL_MISMATCH',text:'my knee hurts when I squat'},injuryFlag:{exerciseId:'goblet-squat',reason:'SKILL_MISMATCH',injury:true},...(pastOnly?{pastOnly:{...base,exerciseId:pastOnly}}:{}),unknownReason:{exerciseId:'goblet-squat',reason:'BORED'},notAnObject:'goblet-squat'};
 const out={};for(const [k,s] of Object.entries(cases)){const r=at(s);out[k]={...summary(r),planned:r.proposal&&s?.to?strengthIds(r.proposal,3).includes(s.to):false};}
 const ok=Object.entries(out).every(([k,x])=>(['painText','injuryFlag'].includes(k)?x.status==='CLINICAL_HUMAN_REQUIRED':x.status==='ASK')&&!x.planned);
 record('C6','impossible combinations / substitution',ok,'each impossible substitution is asked (pain and injury route to a human), never planned',out);
});

// C7: kilograms for bands and assistance: logged kilogram values, a kilogram confirmation and a pound value never become a band or assistance dose or state.
guard('C7','impossible combinations / kilograms for bands',()=>{
 const t=reviewed({id:'c-band-kg',equipment:['BANDS','PULL_UP_BAR'],goals:{run:'PERFORMANCE',strength:'GENERAL'},strengthExperience:'INTERMEDIATE',schedule:{strengthDays:[0,2,4]},weeks:8},0);
 const bandIds=new Set(rows(t.p,0).map(x=>x.e.id).filter(id=>R.ordinalResistance(R.configurationOf(id))));
 for(let w=0;w<5;w++){
  const ob=t.p.weeks[w].sessions.filter(live).map(s=>{const o=obs(t.p,s);for(const e of o.actual.exercises??[])if(bandIds.has(e.id))e.sets=e.sets.map((x,i)=>({...x,load:i%2?{value:15,unit:'KG',convention:'TOTAL'}:{value:30,unit:'LB',convention:'BAND_TENSION'}}));return o;});
  apply(t,evaluateProgram(t.p,{...review(t.p,w,{observations:ob,loadConfirmations:[...bandIds].map(id=>({exerciseId:id,value:15,unit:'KG',convention:'BAND_TENSION'}))}),actualLedger:t.ledger},opts));
 }
 const kgRows=t.p.weeks.flatMap(w=>rows(t.p,w.index)).filter(x=>bandIds.has(x.e.id)&&(x.e.load.unit==='KG'||x.e.load.value!==undefined)).map(x=>x.s.id+':'+x.e.id);
 const kgState=t.p.stateTrace.flatMap((s,i)=>Object.entries(s.strength.exercises).filter(([id,e])=>bandIds.has(id)&&Number.isFinite(e.load)).map(([id,e])=>`w${i}:${id}:${e.load}`));
 const h=P&&t.last;const questions=(t.last.loadQuestions??[]).filter(q=>bandIds.has(q.exerciseId)).map(q=>q.question);
 record('C7','impossible combinations / kilograms for bands',bandIds.size>0&&!kgRows.length&&!kgState.length,
  'no band or assistance row and no state of one ever carries a kilogram value',{bandExercises:[...bandIds],kgRows:kgRows.slice(0,5),kgState:kgState.slice(0,5),questions:questions.slice(0,3)});
});

// C8: quality without its gates after graduation: two run days, a non-performance goal, the B0-C01 record withdrawn at review.
const GRAD={id:'c-grad',goals:{run:'PERFORMANCE',strength:'NONE'},runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35},schedule:{strengthDays:[],runMinutes:45},weeks:16};
guard('C8','impossible combinations / quality without its gates',()=>{
 const t=reviewed(GRAD,3);const g=weekly(t,3);
 const two=evalAt(t,4,{day:0,hour:'06:00:00',kind:'SCHEDULE_CHANGE',changes:{runDays:[2,6],longRunDay:6}});
 const reg=evalAt(t,4,{day:0,hour:'06:00:00',kind:'GOAL_CHANGE',changes:{goals:{run:'REGULAR'}}});
 const noC01=evaluateProgram(t.p,{...review(t.p,4,{day:0,hour:'06:00:00',observations:[]}),actualLedger:t.ledger},{...opts,repertoireRecords:without('B0-C01')});
 const q=(r,from)=>r.proposal?r.proposal.weeks.slice(from).flatMap(w=>qualityRuns(r.proposal,w.index).map(s=>s.id)):null;
 record('C8','impossible combinations / quality without its gates',g.action==='RUN_QUALITY_GRADUATION'&&q(two,5)?.length===0&&q(reg,5)?.length===0&&(noC01.status==='UNSUPPORTED'||q(noC01,4)?.length===0),
  'after graduation, quality disappears when a gate closes (fewer than three run days, a non-performance goal) and is never planned without the B0-C01 authority',
  {graduation:g.action,twoRunDays:{...summary(two),quality:q(two,5)?.slice(0,3)},regularGoal:{...summary(reg),quality:q(reg,5)?.slice(0,3)},withoutC01Record:{...summary(noC01),quality:q(noC01,4)?.slice(0,3)}});
});

// C9: unknown configuration ids among known exercises never enter a plan or a state.
guard('C9','impossible combinations / unknown configurations',()=>{
 const g=gen({id:'c-unknown',equipment:FULL,knownExercises:[K('my-own-squat',3,5,100),{id:'mystery-lift',familiar:true},K('back-squat',3,5,80)],goals:{run:'PERFORMANCE',strength:'STRENGTH'}});
 const ids=g.program?g.program.weeks.flatMap(w=>rows(g.program,w.index).map(x=>x.e.id)):[];
 record('C9','impossible combinations / unknown configurations',g.status!=='PROPOSED'||!ids.some(id=>!R.configurationOf(id)),
  'an unknown exercise id is never planned (asked or ignored)',{status:g.status,unknownPlanned:[...new Set(ids.filter(id=>!R.configurationOf(id)))],known:g.program?.capability?.strength?.known?.map(k=>k.id)??null,missingInputs:g.missingInputs??[]});
});

// C10: block boundaries next to event phases and consolidation: phases and blocks of a 16-week 10K and of the graduation program; choices at the
// boundary into SPECIFIC are asked; a graduation never enters a non-development phase.
guard('C10','boundaries / event windows and consolidation',()=>{
 const E={id:'c-ev',goals:{run:'RACE',strength:'STRENGTH'},event:{kind:'10K',date:'2027-02-14'},weeks:16,equipment:FULL,rotation:'COACH_DECIDES',recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6]}};
 const t=reviewed(E,0),ph=t.p.phases.phases,blocks=t.p.blocks.map(b=>[b.family,b.startWeek,b.endWeekExclusive]);
 const lastDev=t.p.blocks.filter(b=>['BUILD','DEVELOPMENT','NEXT_BLOCK'].includes(b.family)&&ph[b.endWeekExclusive]==='SPECIFIC').at(-1);
 let res=null;
 if(lastDev){for(let w=0;w<lastDev.endWeekExclusive-1;w++)weekly(t,w);const w=lastDev.endWeekExclusive-1;
  res=evaluateProgram(t.p,{...review(t.p,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s)),choices:[{type:'MAIN_CHANGE',from:strengthIds(t.p,w,e=>e.role==='MAIN'&&e.pattern==='SQUAT')[0],to:'leg-press',reason:'ATHLETE_PREFERENCE'}]}),actualLedger:t.ledger},opts);}
 const gp=program(GRAD);
 record('C10','boundaries / event windows and consolidation',!lastDev||res?.status==='ASK',
  'a MAIN change at the boundary into SPECIFIC is asked (no MAIN change in deferred phases)',{eventPhases:ph,eventBlocks:blocks,boundaryWeek:lastDev?lastDev.endWeekExclusive-1:null,result:res?summary(res):null,gradPhases:gp.phases.phases,gradBlocks:gp.blocks.map(b=>[b.family,b.startWeek,b.endWeekExclusive])});
});

done('c-boundaries');
