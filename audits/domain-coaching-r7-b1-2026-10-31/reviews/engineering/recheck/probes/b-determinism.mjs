// Probe batch B: determinism (same input, same output; no dependence on object, array or file order; one instant, one decision). Read-only.
import {record,guard,done,program,reviewed,weekly,review,evaluateProgram,generateProgram,opts,FULL,K,live,obs,intake,RECORDS,V,R,P,summary,strengthIds} from './lib.mjs';

const h=V.hash;
// B1: the same input twice gives the same program and the same review result.
guard('B1','determinism / repeat',()=>{
 const o={id:'d-rep',equipment:FULL,goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},rotation:'EVERY_2_WEEKS',schedule:{strengthDays:[0,2,4]},knownExercises:[K('goblet-squat',3,8,20)]};
 const a=generateProgram(intake(o),opts),b=generateProgram(intake(o),opts);
 const t1=reviewed(o,5),t2=reviewed(o,5);
 const r1=evaluateProgram(t1.p,{...review(t1.p,5,{event:{id:'same',kind:'WEEKLY_REVIEW'},observations:t1.p.weeks[5].sessions.filter(live).map((s,i)=>({...obs(t1.p,s),eventId:'o'+i}))}),actualLedger:t1.ledger},opts);
 const r2=evaluateProgram(t2.p,{...review(t2.p,5,{event:{id:'same',kind:'WEEKLY_REVIEW'},observations:t2.p.weeks[5].sessions.filter(live).map((s,i)=>({...obs(t2.p,s),eventId:'o'+i}))}),actualLedger:t2.ledger},opts);
 const strip=r=>{const {actualLedger,...x}=r;return h({...x,actualLedger:(actualLedger??[]).map(({eventId,provenance,...o})=>o)});};
 record('B1','determinism / repeat',a.program.hash===b.program.hash&&h(r1.proposal?.weeks??null)===h(r2.proposal?.weeks??null)&&r1.status===r2.status,
  'identical inputs give byte-identical programs and decisions',{programHash:[a.program.hash.slice(0,16),b.program.hash.slice(0,16)],review:[r1.status,r2.status],proposalWeeks:[h(r1.proposal?.weeks??null).slice(0,16),h(r2.proposal?.weeks??null).slice(0,16)]});
});

// B2: permuting input arrays (equipment, known exercises, known runs, chosen days) changes no planned session.
guard('B2','determinism / input order',()=>{
 const task={category:'VO2_STYLE',current:true,familiar:true,tolerated:true,observedAt:'2026-10-28',prescription:{modality:'RUN',family:'VO2_STYLE_INTERVALS',durationMinutes:40,warmupMinutes:12,cooldownMinutes:8,work:{repetitions:4,workMinutes:3,recoveryMinutes:2}},target:{method:'PACE',construct:'FIELD_SESSION_TARGET',paceSecondsPerKm:255,provenance:'Athlete report'},history:{sameTaskExposures:6,response:'TOLERATED'},conditions:{comparable:true}};
 const hills={...task,category:'HILLS',prescription:{...task.prescription,family:'HILLS'}};
 const A={id:'d-ord',equipment:['DUMBBELLS','BENCH','KETTLEBELL','BANDS','PULL_UP_BAR'],goals:{run:'PERFORMANCE',strength:'GENERAL'},knownExercises:[K('goblet-squat',3,8,20),K('db-row',3,10,16,'PER_HAND'),{id:'push-up',familiar:true}],knownRuns:[task,hills],recent:{runDaysPerWeek:4,runMinutesPerWeek:180,longestRunMinutes:70,strengthDaysPerWeek:3},schedule:{runDays:[1,3,5,6],strengthDays:[0,2,4]}};
 const B={...A,equipment:[...A.equipment].reverse(),knownExercises:[...A.knownExercises].reverse(),knownRuns:[...A.knownRuns].reverse(),schedule:{runDays:[6,5,3,1],strengthDays:[4,2,0]}};
 const a=program(A),b=program(B);
 const weeks=p=>h(p.weeks.map(w=>w.sessions.map(s=>[s.id,s.prescription])));
 record('B2','determinism / input order',weeks(a)===weeks(b)&&h(a.templates)===h(b.templates),
  'no planned session or template depends on the order of input lists',{weeks:[weeks(a).slice(0,16),weeks(b).slice(0,16)],templates:[h(a.templates).slice(0,16),h(b.templates).slice(0,16)],programHash:[a.hash.slice(0,16),b.hash.slice(0,16)],canonicalEquipment:[a.canonical.athlete.equipment,b.canonical.athlete.equipment]});
});

// B3: SSCTR records supplied in another order (options.repertoireRecords): the same authority and the same plan; does the binding identity move?
guard('B3','determinism / record order',()=>{
 const o={id:'d-rec'};
 const a=program(o,{...opts,repertoireRecords:RECORDS}),b=program(o,{...opts,repertoireRecords:[...RECORDS].reverse()});
 const weeks=p=>h(p.weeks);
 record('B3','determinism / record order',a.repertoire.recordsSha256===b.repertoire.recordsSha256&&a.hash===b.hash,
  'the same set of records gives the same binding and program whatever their order',{recordsSha256:[a.repertoire.recordsSha256.slice(0,16),b.repertoire.recordsSha256.slice(0,16)],programHash:[a.hash.slice(0,16),b.hash.slice(0,16)],weeksEqual:weeks(a)===weeks(b)});
});

// B4: one instant written with two UTC offsets, on the SSCTR records' review-by date (2027-04-30): the repertoire authority is read from the
// written date (asOf.slice(0,10)), not from the instant.
guard('B4','determinism / review-by boundary',()=>{
 const inp=intake({id:'d-reviewby',weeks:8});inp.asOf='2027-04-18';inp.startDate='2027-04-19';inp.athlete.eligibility.assessedAt='2027-04-18';
 const g=generateProgram(inp,opts);if(!g.program)throw new Error('generation: '+g.status+' '+g.reason);
 const p=g.program,w=1;
 const mk=asOf=>({version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,weekIndex:w,event:{id:'d-rb-'+asOf,kind:'WEEKLY_REVIEW'},eligibility:{status:'NONCLINICAL_CONFIRMED',assessedAt:'2027-04-29',pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false},observations:[]});
 const z=evaluateProgram(p,mk('2027-04-30T21:00:00Z'),opts),plus=evaluateProgram(p,mk('2027-05-01T02:00:00+05:00'),opts),minus=evaluateProgram(p,mk('2027-04-30T22:00:00-03:00'),opts);
 record('B4','determinism / review-by boundary',z.status===plus.status,
  'the same instant gives the same decision whatever UTC offset it is written with (the review-by date is read on one clock)',
  {sameInstantZ:summary(z),sameInstantPlus5:summary(plus),laterInstantMinus3_isUTCMay1:summary(minus),programWeeks:p.weeks.map(x=>x.startDate)});
});

// B5: the observations of a boundary review in reverse order give the same decision (graduation, density release, gates).
guard('B5','determinism / observation order',()=>{
 const GRAD={id:'d-obs',goals:{run:'PERFORMANCE',strength:'GENERAL'},runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35,strengthDaysPerWeek:0},strengthExperience:'NONE',schedule:{runMinutes:45,strengthDays:[0,2,4,5]},weeks:16};
 const t=reviewed(GRAD,3);const list=t.p.weeks[3].sessions.filter(live).map(s=>obs(t.p,s));
 const a=evaluateProgram(t.p,{...review(t.p,3,{event:{id:'x',kind:'WEEKLY_REVIEW'},observations:list}),actualLedger:t.ledger},opts);
 const b=evaluateProgram(t.p,{...review(t.p,3,{event:{id:'x',kind:'WEEKLY_REVIEW'},observations:[...list].reverse()}),actualLedger:t.ledger},opts);
 record('B5','determinism / observation order',a.status===b.status&&a.action===b.action&&h(a.proposal?.weeks??null)===h(b.proposal?.weeks??null),
  'the order of a review\'s observations never changes the decision',{a:summary(a),b:summary(b),sameProposal:h(a.proposal?.weeks??null)===h(b.proposal?.weeks??null)});
});

// B6: a configuration that is MAIN in one session and ACCESSORY in another the same week: a MAIN change of it depends on the session order?
guard('B6','determinism / role lookup at the boundary',()=>{
 const found=[];
 for(const strength of ['HYPERTROPHY','GENERAL','STRENGTH','RUNNING_SUPPORT'])for(const days of [[0,1,3,4],[0,2,4],[1,3,5,6],[0,2,4,6]])for(const eq of [FULL,['DUMBBELLS','BENCH'],['KETTLEBELL','BANDS'],['DUMBBELLS'],['MACHINES','DUMBBELLS'],[]]){
  const o={id:`d-dual-${strength}-${days.join('')}-${eq.join('')}`,equipment:eq,goals:{run:'PERFORMANCE',strength},rotation:'COACH_DECIDES',weeks:16,schedule:{strengthDays:days}};
  const g=generateProgram(intake(o),opts);if(!g.program)continue;const p=g.program,roles=new Map();for(const s of p.weeks[4].sessions.filter(x=>live(x)&&x.sport==='STRENGTH'))for(const e of s.prescription.exercises)(roles.get(e.id)??roles.set(e.id,[]).get(e.id)).push({role:e.role,day:s.day});
  for(const [id,list] of roles)if(new Set(list.map(x=>x.role)).size>1)found.push({o,id,list,mainLast:list.at(-1).role==='MAIN'});
 }
 if(!found.length){record('B6','determinism / role lookup at the boundary',true,'n/a','no configuration served two roles in one week in this grid');return;}
 const pick=[found.find(x=>x.mainLast),found.find(x=>!x.mainLast&&x.list.some(y=>y.role==='MAIN'))].filter(Boolean);
 const res=pick.map(({o,id,list})=>{
  const t=reviewed(o,4),obsList=t.p.weeks[4].sessions.filter(live).map(s=>obs(t.p,s));
  const cfg=R.configurationOf(id),alt=R.CONFIGURATIONS.find(e=>e.id!==id&&e.pattern===cfg.pattern&&e.roles.includes('MAIN')&&e.skill!=='HIGH'&&e.equipment.every(q=>[...o.equipment,'BODYWEIGHT'].includes(q))&&e.primary.some(m=>cfg.primary.includes(m))&&!strengthIds(t.p,4).includes(e.id));
  const r=evaluateProgram(t.p,{...review(t.p,4,{observations:obsList,choices:[{type:'MAIN_CHANGE',from:id,to:alt?.id,reason:'ATHLETE_PREFERENCE'}]}),actualLedger:t.ledger},opts);
  const lastRole=list.at(-1).role;
  return {program:o.id,exercise:id,rolesThisWeek:list,to:alt?.id??null,result:summary(r),lastSessionRole:lastRole,accessoryRowAlsoChanged:r.proposal?r.proposal.weeks[5].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises).filter(e=>e.id===alt?.id).map(e=>e.role):null};
 });
 record('B6','determinism / role lookup at the boundary',res.every(x=>x.result.status==='MODIFY'&&!(x.accessoryRowAlsoChanged??[]).includes('ACCESSORY')),
  'a MAIN change of a configuration that also fills an accessory slot is accepted from its MAIN slot (not from whichever session is read last) and changes only the MAIN slot',res);
});

done('b-determinism');
