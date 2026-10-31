// R7B1-ENG-r2 judge copy (REPO six levels up; output in this folder) of the R7-B.1 adversarial probes (request §12): four small grids, one per blocker, plus the QE-R7B-01/-05 residual paths. Read-only against the runtime of
// the tree given; writes only probes/out/<label>.json. Usage: node adversarial-r7b1.mjs [<tree root containing CoachingCore>] [<label>]
// (default: this repository, label R7B1). Run it on a FREEZE-2 tree too (git archive 10b26d6) to show each grid finds the blocker there.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),REPO=path.resolve(HERE,'../../../../../..'),root=process.argv[2]??REPO,label=process.argv[3]??'R7B1-2-judge-copy';
const imp=rel=>import(pathToFileURL(path.join(root,'CoachingCore',rel)).href);
const H=await imp('r7/b/fixtures/helpers.mjs'),A=await imp('src/r6-adaptation.mjs'),P=await imp('src/r6-program.mjs'),AU=await imp('src/r6-authority.mjs'),R=await imp('src/r7b-repertoire.mjs');
const {program,reviewed,weekly,review,evaluateProgram,opts,live,addDays,FULL}=H;
const auth=AU.r6Authority(opts),BAD={performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'IMPAIRED'};
const results={};let checks=0;
const grid=(id,what)=>results[id]={what,cases:0,checks:0,failures:[]};
const check=(g,ok,detail)=>{checks++;results[g].checks++;if(!ok&&results[g].failures.length<12)results[g].failures.push(detail);if(!ok)results[g].failed=(results[g].failed??0)+1;};
const apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const strengthIds=(p,w)=>[...new Set(p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>e.role!=='PRACTICE').map(e=>e.id)))];
const performedIds=t=>{const byId=new Map(t.p.weeks.flatMap(w=>w.sessions.map(s=>[s.id,s])));return new Set(t.ledger.filter(o=>!o.superseded&&o.actual?.completed).flatMap(o=>(o.actual.exercises??byId.get(o.sessionId)?.prescription?.exercises??[]).map(e=>e.id)));};
const EVENT=['TAPER','RACE_WEEK','POST_EVENT'];
const eventRows=(p,from)=>{const sk=P.skeletonOf(p,auth);return p.weeks.slice(from).flatMap(w=>w.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&EVENT.includes(P.dayPhaseOf(sk.at(w.index)??sk,w.index,s.day))).flatMap(s=>s.prescription.exercises.map(e=>({w:w.index,s,e}))));};
const sub=(t,w,id,reason,x={})=>evaluateProgram(t.p,{...review(t.p,w,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:id,reason,...(reason==='NONCLINICAL_DISCOMFORT_OR_PREFERENCE'?{nonclinicalConfirmed:true}:{}),...x}}),actualLedger:t.ledger},opts);
const EV={goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:['DUMBBELLS','BENCH','KETTLEBELL'],recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6],strengthDays:[0,4]}};
const guard=(g,fn,detail)=>{try{fn();}catch(e){check(g,false,{...detail,error:String(e?.message??e).slice(0,200)});}};

// ---------- P1 OBS-04: event phase × substitution reason × familiarity ----------
grid('P1','event phase x reason x familiarity: no never-performed configuration enters TAPER/RACE_WEEK/POST_EVENT through a reason-based substitution; the set-aside one never returns; stand-ins are performed, admissible and in the reason\'s direction; the substitute starts after the event with establishment; the decision discloses it');
const athletes=[['fixed',{...EV,id:'p1-fixed',rotation:'FIXED'}],['rotating',{...EV,id:'p1-rot',rotation:'EVERY_2_WEEKS'}],['familiar-intake',{...EV,id:'p1-fam',rotation:'FIXED',knownExercises:[{id:'box-squat-bodyweight',familiar:true,current:true,tolerated:true,observedAt:'2026-10-29'}]}],['half-full',{...EV,id:'p1-hm',equipment:FULL,goals:{run:'RACE',strength:'RUNNING_SUPPORT'},event:{kind:'HALF_MARATHON',date:'2027-01-31'},rotation:'COACH_DECIDES',schedule:{runDays:[1,3,4,6],strengthDays:[0,2,4],longRunMinutes:120}}]];
for(const [fam,o] of athletes){
 const base=reviewed(o,0),ph=base.p.phases.phases,post=ph.indexOf('POST_EVENT'),points=[['TAPER',ph.indexOf('TAPER')],['RACE_WEEK',ph.indexOf('RACE_WEEK')],['POST_EVENT',post],['LAST_SPECIFIC_MISSED',ph.indexOf('TAPER')-1]];
 for(const [phase,wk] of points){
  const t=reviewed({...o,id:o.id+'-'+phase},0);for(let w=0;w<wk;w++)weekly(t,w);
  for(const id of strengthIds(t.p,wk))for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE'])guard('P1',()=>{
   const performed=performedIds(t),r=sub(t,wk,id,reason);results.P1.cases++;if(r.status!=='MODIFY')return;
   const x={fam,phase,id,reason},sel=r.substitutions[0].selected,c=structuredClone(t);apply(c,r);
   // The decision's week, then the weekly reviews through the post-event week; in LAST_SPECIFIC_MISSED the substitute's sessions are missed. Each event
   // week is judged in the plan in force when it starts (the decision for its own week, else the weekly review of the week before): later weeks of a
   // proposal are a conditional projection that assumes the exposures before them executed, as for every step; those are counted, not judged.
   for(let w=wk;w<=Math.min(post,c.p.weeks.length-1);w++){
    for(const {w:k,s,e} of eventRows(c.p,w)){const ok=performedIds(c).has(e.id)||performed.has(e.id);if(k===w)check('P1',ok,{...x,week:k,session:s.id,prescribes:e.id,note:'never performed in this program'});else if(!ok)results.P1.projectedOnly=(results.P1.projectedOnly??0)+1;}
    weekly(c,w,{keep:phase==='LAST_SPECIFIC_MISSED'&&w===wk?s=>!(s.prescription.exercises??[]).some(e=>e.id===sel):()=>true});
   }
   check('P1',!c.p.weeks.slice(wk).some(w=>w.sessions.some(s=>live(s)&&s.sport==='STRENGTH'&&s.prescription.exercises.some(e=>e.id===id))),{...x,note:'the set-aside configuration returns'});
   const d=r.disclosures.find(z=>z.id==='NO_NEW_EXERCISE_IN_EVENT_WEEKS'),X=R.configurationOf(id);
   for(const s0 of d?.standIns??[]){const e=R.configurationOf(s0);check('P1',performed.has(s0)&&e.roles.some(role=>R.admissibleAlternative(X,e,{role,skillOk:()=>true,auth:R.DEFAULT_REPERTOIRE}))&&e.subpattern===X.subpattern&&(reason!=='SKILL_MISMATCH'||R.skillRank(e.skill)<=R.skillRank(R.configurationOf(sel).skill)),{...x,standIn:s0,note:'stand-in not performed, not admissible or above the direction'});}
   if(!performed.has(sel)&&['TAPER','RACE_WEEK','POST_EVENT'].includes(phase))check('P1',!!d,{...x,note:'no disclosure'});
   const after=c.p.weeks.slice(post+1).flatMap(w=>w.sessions.filter(live).flatMap(s=>(s.prescription.exercises??[]).filter(e=>e.id===sel)));
   if(after.length&&!performedIds(c).has(sel))check('P1',['FIRST_ESTABLISH','BODYWEIGHT','REESTABLISH'].includes(after[0].exposure?.kind)&&after[0].sets<=2,{...x,first:after[0].exposure?.kind,sets:after[0].sets,note:'first exposure after the event is not an establishment'});
  },{fam,phase,id,reason});
 }
}
// The clinical screen and the questions come first, whatever the phase.
{const t=reviewed({...EV,id:'p1-first',rotation:'FIXED'},0),wk=t.p.phases.phases.indexOf('TAPER');for(let w=0;w<wk;w++)weekly(t,w);const id=strengthIds(t.p,wk)[0];
 check('P1',sub(t,wk,id,'SKILL_MISMATCH',{pain:true}).status==='CLINICAL_HUMAN_REQUIRED',{note:'pain not routed first'});check('P1',sub(t,wk,id,'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',{nonclinicalConfirmed:undefined}).status==='ASK',{note:'unconfirmed preference not asked'});results.P1.cases+=2;
 // Observation for the SSCTR (inherited R6-SUBSTITUTION path, not a reason-based substitution): a permanent equipment change in the taper week.
 const performed=performedIds(t),e=evaluateProgram(t.p,{...review(t.p,wk,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:['KETTLEBELL']}}),actualLedger:t.ledger},opts);
 results.P1.inheritedEquipmentChangeInTaper={status:e.status,action:e.action,newInEventWeeks:e.proposal?[...new Set(eventRows(e.proposal,wk).filter(x=>!performed.has(x.e.id)).map(x=>`w${x.w}:${x.e.id}`))]:[],swaps:(e.substitutions??[]).map(z=>z.exerciseId+'->'+z.selected)};}

// ---------- P2 R2-01: novice × weekly review × reconstructed state ----------
grid('P2','novice x weekly review x reconstructed state: after a decision that rebuilds the capped templates, every later weekly review plans capped weeks exactly when the state is capped, from templates that keep the decision (no set-aside exercise, only available equipment), and history agrees with the plan');
const NOV={strengthExperience:'NONE',goals:{run:'REGULAR',strength:'GENERAL'},equipment:['DUMBBELLS','BENCH'],schedule:{strengthDays:[0,2,4,5]},weeks:12};
const decisions=[
 ['substitution-mismatch',{...NOV,id:'p2-a'},1,t=>({kind:'EXERCISE_SUBSTITUTION',day:1,substitution:{exerciseId:'goblet-squat',reason:'SKILL_MISMATCH'}})],
 ['substitution-preference',{...NOV,id:'p2-b'},1,t=>({kind:'EXERCISE_SUBSTITUTION',day:1,substitution:{exerciseId:'db-floor-press',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}})],
 ['schedule-2-to-4',{...NOV,id:'p2-c',schedule:{strengthDays:[0,4]}},1,t=>({kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4,5]}})],
 ['schedule-2-to-3',{...NOV,id:'p2-d',schedule:{strengthDays:[0,4]}},1,t=>({kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4]}})],
 ['kettlebell-only',{...NOV,id:'p2-e'},1,t=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['KETTLEBELL']}})],
 ['bodyweight-only',{...NOV,id:'p2-f'},1,t=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:[]}})],
 ['goal-change',{...NOV,id:'p2-g'},1,t=>({kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}})]];
for(const [name,o,w0,make] of decisions)guard('P2',()=>{
 const t=reviewed(o,w0),x=make(t),r=apply(t,evaluateProgram(t.p,{...review(t.p,w0,{hour:'06:00:00',...x,day:x.day??0}),actualLedger:t.ledger},opts));results.P2.cases++;
 check('P2',r.status==='MODIFY',{name,status:r.status,reason:String(r.reason).slice(0,160)});if(r.status!=='MODIFY')return;
 const aside=new Set((t.p.canonical.athlete.strengthSelections??[]).filter(s=>s.setAside).map(s=>s.from)),have=new Set([...t.p.canonical.athlete.equipment,'BODYWEIGHT']);
 const sk=P.skeletonOf(t.p,auth),applies=P.noviceDensityApplies(sk);
 check('P2',!!t.p.noviceTemplates===applies,{name,stored:!!t.p.noviceTemplates,applies,note:'stored capped templates do not follow the context'});
 for(const tp of t.p.noviceTemplates??[])for(const row of tp.rows)check('P2',!aside.has(row.entry.id)&&row.entry.equipment.every(q=>have.has(q)),{name,template:tp.type,exercise:row.entry.id,note:'stored capped templates hold a set-aside exercise or missing equipment'});
 for(let w=w0;w<w0+4&&w<t.p.weeks.length-1;w++){
  const rv=weekly(t,w,{o:()=>({kg:()=>12})});check('P2',!['UNSUPPORTED','HOLD'].includes(rv.status),{name,week:w,status:rv.status});
  const k=w+1,capped=t.p.stateTrace[k].strength.density?.capped===true,types=t.p.weeks[k].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).map(s=>s.templateType);
  if(t.p.canonical.schedule.strengthDays.length>2)check('P2',types.includes('CORE')===capped,{name,week:k,capped,types,note:'the plan is not capped exactly when its state is'});
  for(const s of t.p.weeks[k].sessions.filter(z=>live(z)&&z.sport==='STRENGTH'))for(const e of s.prescription.exercises)check('P2',!aside.has(e.id)&&R.configurationOf(e.id).equipment.every(q=>have.has(q)),{name,week:k,exercise:e.id,note:'a set-aside exercise returns or equipment is missing'});
  const h=A.historicalStateOf(t.p,{asOf:`${t.p.weeks[k].startDate}T03:00:00Z`,actualLedger:t.ledger},opts);
  // HISTORY judges a week under its own context and PLAN under the context entered (R7-A decision authority closure): where a change of the day count
  // starts the cap, only the plan holds it; elsewhere both readings must agree.
  if(!/^schedule/.test(name))check('P2',(h?.state?.strength?.density?.capped??null)===(t.p.stateTrace[k].strength.density?.capped??null),{name,week:k,history:h?.state?.strength?.density??null,plan:t.p.stateTrace[k].strength.density??null,note:'history and plan disagree on the cap'});
 }
},{name});

// ---------- P3 R2-02: correction × ASK × block choice ----------
grid('P3','correction x ASK x block choice: whatever else a review asks, a correction it records comes with the factual re-plan the same correction gives alone; a review that records nothing proposes nothing; the follow-up review never brings the retracted plan back');
const choices=[['ladder',{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}],['main',{type:'MAIN_CHANGE',from:'goblet-squat',to:'box-squat-bodyweight',reason:'ATHLETE_PREFERENCE'}],['graduation-decline',{offer:'RUN_QUALITY_GRADUATION',decision:'DECLINE'}],['graduation-accept',{offer:'RUN_QUALITY_GRADUATION',decision:'ACCEPT'}],['unknown',{type:'SOMETHING_ELSE'}]];
const kinds=[['weekly-midweek',{}],['local-fatigue',{kind:'LOCAL_FATIGUE',signals:{region:'UPPER'}}],['schedule',{kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4,5]}}],['equipment',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','KETTLEBELL']}}]];
const ahead=(p,w,day)=>JSON.stringify(p.weeks.slice(w).map(x=>x.sessions.filter(s=>s.date>day).map(s=>[s.id,s.prescription])));
for(const [setup,make,w,pred] of [['novice-strength',()=>reviewed({...NOV,id:'p3-n'},5),5,s=>s.sport==='STRENGTH'],['graduation-long',()=>reviewed({id:'p3-g',goals:{run:'PERFORMANCE',strength:'NONE'},runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35},schedule:{strengthDays:[],runMinutes:45},weeks:16},4),4,s=>s.role==='LONG']]){
 const t0=make(),at=`${t0.p.weeks[w].startDate}T05:00:00Z`,day=t0.p.weeks[w].startDate;
 const fixes=t=>t.ledger.filter(o=>!o.superseded&&t.p.weeks[w-1].sessions.some(s=>s.id===o.sessionId&&pred(s))).map(o=>({eventId:o.eventId+'-fix',athleteId:o.athleteId,sessionId:o.sessionId,observedAt:o.observedAt,correctionOf:o.eventId,correctedAt:at,actual:structuredClone(o.actual),response:{...o.response,...BAD}}));
 for(const [kn,kx] of kinds)for(const [cn,choice] of choices)guard('P3',()=>{
  const t=structuredClone(t0),obs=fixes(t);results.P3.cases++;
  const ctl=evaluateProgram(t.p,{...review(t.p,w,{day:0,hour:'06:00:00',...kx,observations:obs}),actualLedger:t.ledger},opts);
  const r=evaluateProgram(t.p,{...review(t.p,w,{day:0,hour:'06:00:00',...kx,observations:obs,choices:[choice]}),actualLedger:t.ledger},opts),x={setup,kind:kn,choice:cn,status:r.status,control:ctl.status};
  const recorded=(r.actualLedger??[]).some(o=>o.correctionOf);
  if(!recorded){check('P3',!r.proposal&&['ASK','HOLD'].includes(r.status),{...x,note:'nothing recorded but something proposed'});return;}
  // The factual part: the sessions ahead the correction alone re-plans (as a mid-week weekly review) come with the question.
  const alone=evaluateProgram(t.p,{...review(t.p,w,{day:0,hour:'06:00:00',observations:obs}),actualLedger:t.ledger},opts);
  if(r.status==='ASK'){check('P3',!!r.proposal===!!alone.proposal,{...x,proposal:!!r.proposal,alone:!!alone.proposal,note:'the question drops the factual re-plan'});if(r.proposal&&alone.proposal)check('P3',ahead(r.proposal,w,day)===ahead(alone.proposal,w,day),{...x,note:'the question carries another plan than the factual re-plan'});}
  if(r.proposal){const c=structuredClone(t);apply(c,r);const f=evaluateProgram(c.p,{...review(c.p,w,{day:1,hour:'06:00:00'}),actualLedger:c.ledger},opts);const p2=f.proposal??c.p;
   if(r.status==='ASK'&&alone.proposal)check('P3',ahead(p2,w,addDays(day,1))===ahead(alone.proposal,w,addDays(day,1)),{...x,note:'the follow-up review brings the retracted plan back'});}
 },{setup,kind:kn,choice:cn});
}

// ---------- P4 R2-03: skill mismatch × equipment loss × ladder ----------
grid('P4','skill mismatch x equipment loss x ladder: once a SKILL_MISMATCH substitute loses its equipment, the replaced exercise\'s slots never take a configuration above the substitute\'s skill or above the set-aside one on its ladder; without a lower option the decision asks');
const above=id=>{const out=new Set(),todo=[id];while(todo.length)for(const n of R.ladderNext(todo.pop()))if(!out.has(n)){out.add(n);todo.push(n);}return out;};
const p4Athletes=[['db-kb',['DUMBBELLS','BENCH','KETTLEBELL']],['full',FULL],['db-bands',['DUMBBELLS','BENCH','BANDS']],['kb-bands-bar',['KETTLEBELL','BANDS','PULL_UP_BAR']],['machines-db',['MACHINES','DUMBBELLS','BANDS']]];
for(const [eqn,eq] of p4Athletes)for(const strength of ['GENERAL','STRENGTH'])for(const days of [[0,4],[0,2,4]]){
 const o={id:`p4-${eqn}-${strength}-${days.length}`,equipment:eq,goals:{run:'PERFORMANCE',strength},rotation:'FIXED',weeks:12,schedule:{strengthDays:days}};
 const t0=reviewed(o,3);
 for(const id of strengthIds(t0.p,4))guard('P4',()=>{
  const t=structuredClone(t0),s=evaluateProgram(t.p,{...review(t.p,3,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:id,reason:'SKILL_MISMATCH'}}),actualLedger:t.ledger},opts);if(s.status!=='MODIFY')return;
  const S=R.configurationOf(s.substitutions[0].selected),X=R.configurationOf(id),extra=S.equipment.filter(q=>q!=='BODYWEIGHT'&&!X.equipment.includes(q));if(!extra.length)return;
  apply(t,s);weekly(t,3);
  for(const variant of ['permanent','window']){
   const c=structuredClone(t),change=variant==='permanent'?{equipment:eq.filter(q=>!extra.includes(q))}:{equipment:eq.filter(q=>!extra.includes(q)),from:c.p.weeks[5].startDate,to:addDays(c.p.weeks[5].startDate,6)};
   const r=evaluateProgram(c.p,{...review(c.p,4,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:change}),actualLedger:c.ledger},opts);results.P4.cases++;
   const x={program:o.id,replaced:id,substitute:S.id,lost:extra,variant,status:r.status};
   if(r.status==='ASK'){check('P4',(r.disclosures??[]).some(d=>d.id==='NO_LOWER_SKILL_ALTERNATIVE')||/./.test(r.reason),x);continue;}
   if(r.status!=='MODIFY'&&r.status!=='KEEP'){check('P4',false,{...x,note:'neither a change nor a question',reason:String(r.reason).slice(0,160)});continue;}
   apply(c,r);for(let w=4;w<7;w++){if(w>4)weekly(c,w-1);
    for(const sess of c.p.weeks[w].sessions.filter(z=>live(z)&&z.sport==='STRENGTH')){const was=t0.p.weeks[w].sessions.find(z=>z.id===sess.id);if(!was?.prescription?.exercises?.some(e=>e.id===id))continue;const role=was.prescription.exercises.find(e=>e.id===id).role;
     for(const e of sess.prescription.exercises.filter(z=>z.pattern===X.pattern&&z.role===role)){const cfg=R.configurationOf(e.id);
      check('P4',e.id!==id&&!above(id).has(e.id)&&(e.id===S.id||R.skillRank(cfg.skill)<=R.skillRank(S.skill)),{...x,week:w,session:sess.id,prescribes:e.id,skill:cfg.skill,note:'the slot climbs after equipment loss'});}}}
  }
 },{program:o.id,replaced:id});
}

// ---------- residual paths of QE-R7B-01 and QE-R7B-05 ----------
grid('RES','QE-R7B-01: every applied substitution prescribes its selection in the replaced exercise\'s slot (N5 grid); QE-R7B-05: a cap started by a context change holds through the next reviews, and with an elapsed week reviewed even when nothing is reported (R18)');
for(const [strength,eq,days] of [['GENERAL',['DUMBBELLS','BENCH','KETTLEBELL'],[0,4]],['STRENGTH',FULL,[0,2,4]],['HYPERTROPHY',['KETTLEBELL','BANDS'],[0,4]],['RUNNING_SUPPORT',[],[0,4]],['HYPERTROPHY',FULL,[0,1,3,4]],['GENERAL',['MACHINES','DUMBBELLS'],[0,2,4]],['STRENGTH',['DUMBBELLS','BENCH'],[0,1,3,4]],['HYPERTROPHY',['DUMBBELLS','BENCH','BANDS','PULL_UP_BAR'],[0,2,4]],['GENERAL',['BANDS','PULL_UP_BAR'],[0,2,4]],['RUNNING_SUPPORT',['DUMBBELLS','KETTLEBELL'],[0,1,3,4]]]){
 const t=reviewed({id:`res-${strength}-${eq.length}-${days.length}`,equipment:eq,goals:{run:'PERFORMANCE',strength},rotation:'FIXED',weeks:12,schedule:{strengthDays:days}},3);
 for(const id of strengthIds(t.p,4))for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE'])guard('RES',()=>{
  const r=evaluateProgram(t.p,{...review(t.p,3,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:id,reason,...(reason==='SKILL_MISMATCH'?{}:{nonclinicalConfirmed:true})}}),actualLedger:t.ledger},opts);results.RES.cases++;if(r.status!=='MODIFY')return;
  const sel=r.substitutions[0].selected,pat=R.configurationOf(id).pattern;
  for(const s of t.p.weeks[4].sessions.filter(z=>live(z)&&z.sport==='STRENGTH')){const old=s.prescription.exercises.find(e=>e.id===id);if(!old)continue;const now=(r.proposal.weeks[4].sessions.find(z=>z.id===s.id)?.prescription?.exercises??[]).filter(e=>e.pattern===pat&&e.role===old.role).map(e=>e.id);check('RES',now.includes(sel),{program:t.p.athleteId,replaced:id,reason,selected:sel,session:s.id,prescribed:now,note:'QE-R7B-01: the slot does not prescribe the selection'});}
 },{replaced:id,reason});
}
{const make=()=>{const t={p:program({...NOV,id:'res-2d',schedule:{strengthDays:[0,4]}}),ledger:[]};weekly(t,0);apply(t,evaluateProgram(t.p,{...review(t.p,1,{day:0,hour:'06:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4,5]}}),actualLedger:t.ledger},opts));return t;};
 const t=make();for(let w=1;w<4;w++){weekly(t,w);const k=w+1;check('RES',t.p.weeks[k].sessions.some(s=>s.templateType==='CORE')===(t.p.stateTrace[k].strength.density?.capped===true),{week:k,note:'QE-R7B-05: the plan is not capped exactly when its state is'});}results.RES.cases++;
 // R18 control: week 1 reviewed with nothing reported, then a decision in week 2 plans week 2 capped.
 const c=make();weekly(c,1,{keep:()=>false});const d=evaluateProgram(c.p,{...review(c.p,2,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'goblet-squat',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}}),actualLedger:c.ledger},opts);
 check('RES',(d.proposal??c.p).weeks[2].sessions.some(s=>s.templateType==='CORE'),{note:'QE-R7B-05 with the elapsed week reviewed: week 2 is not capped'});results.RES.cases++;
 // Without the review of week 1 (outside the R18 contract): recorded as the R18 path, not counted.
 const u=make(),e=evaluateProgram(u.p,{...review(u.p,2,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'goblet-squat',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}}),actualLedger:u.ledger},opts);
 results.RES.r18PathWeekUnreviewed={status:e.status,week2Capped:(e.proposal??u.p).weeks[2].sessions.some(s=>s.templateType==='CORE'),note:'QE-R7B-R2-05: only when an elapsed week receives no review at all (R18 condition, request §9)'};}

fs.mkdirSync(path.join(HERE,'out'),{recursive:true});
const out={probe:'R7B1-ADVERSARIAL',label,tree:root===REPO?'this repository':'given tree',ran:new Date().toISOString(),checks,failed:Object.values(results).reduce((n,g)=>n+(g.failed??0),0),results};
fs.writeFileSync(path.join(HERE,'out',`adversarial-${label}.json`),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({label,checks,failed:out.failed,grids:Object.fromEntries(Object.entries(results).map(([k,g])=>[k,{cases:g.cases,checks:g.checks,failed:g.failed??0}])),inherited:results.P1.inheritedEquipmentChangeInTaper,r18:results.RES.r18PathWeekUnreviewed}));
