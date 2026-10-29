import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {generateProgram,evaluateProgram} from '../src/r6-index.mjs';
import {screenInterruptionReason} from '../src/r6-clinical.mjs';
import {runMinutesOf} from '../src/r6-program.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';

/** Regression tests for the SSCTR round-7 binding defects (reviews/ssctr-policy-review.json, R6-SSCTR-POLICY-r7). */
const opts={authority:devAuthority()},op=opts.authority.policy.operational;
const R5_CASE=JSON.parse(fs.readFileSync(new URL('../r5/holdout/R5_INDEPENDENT_HOLDOUT.json',import.meta.url))).cases.find(c=>c.caseId==='R5-H02');
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const gap=(a,b)=>(Date.parse(b)-Date.parse(a))/864e5;
const sessionsOf=p=>p.weeks.flatMap(w=>w.sessions);
function intake({id,asOf='2026-11-01',startDate='2026-11-02',weeks=8,athlete={},schedule={}}){
 return {version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,startDate,weeks,learningConsent:true,
  athlete:{id,ageEligible:true,eligibility:elig(asOf),goals:{run:'PERFORMANCE',strength:'GENERAL'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH'],knownExercises:[],...athlete},
  schedule:{runDays:[1,3,6],strengthDays:[2,4],runTurn:'AM',strengthTurn:'PM',runMinutes:45,strengthMinutes:45,longRunDay:6,longRunMinutes:90,...schedule}};
}
const tenK=(date)=>({run:{kind:'RACE',event:{kind:'10K',date}},strength:'MAINTAIN'});

test('SSCTR D42: a raised walk/jog start never puts more jogging into one session than the longest current run',()=>{
 for(const [L,W,days] of [[3,5,[2]],[3,10,[2]],[5,10,[2]],[3,10,[1,4]],[10,14,[1,3,5]],[12,14,[3]]]){
  const g=generateProgram(intake({id:`t-d42-${L}-${W}-${days.length}`,athlete:{recent:{runDaysPerWeek:days.length,runMinutesPerWeek:W,longestRunMinutes:L}},schedule:{runDays:days,longRunDay:days.at(-1)}}),opts);
  assert.equal(g.program.capability.run.class,'WALK_JOG');
  for(const s of g.program.weeks[0].sessions.filter(x=>x.role==='WALK_JOG'))assert.ok(runMinutesOf(s)<=L,`L ${L} W ${W}: ${runMinutesOf(s)} min of jogging in one session`);
 }
});
test('SSCTR D43: a walk/jog athlete keeps walk/jog through taper, race window and after the race, and completes the race with walk breaks',()=>{
 const g=generateProgram(intake({id:'t-d43-wj',asOf:'2026-11-12',startDate:'2026-11-17',athlete:{goals:tenK('2026-12-13'),runExperience:'EXPERIENCED',recent:{runDaysPerWeek:3,runMinutesPerWeek:10,longestRunMinutes:5}},schedule:{runDays:[5],strengthDays:[4],longRunDay:5,runMinutes:30,longRunMinutes:30}}),opts);
 assert.equal(g.status,'PROPOSED');const P=g.program,race=sessionsOf(P).find(s=>s.role==='RACE');
 assert.equal(race.prescription.completion,true);assert.equal(race.prescription.effortDomain,'EASY_CONVERSATIONAL');
 assert.ok(race.prescription.instructions.some(i=>/walk breaks/i.test(i)));assert.ok(!race.prescription.instructions.some(i=>/press\b|relaxed strides/i.test(i)&&!/nothing to press/i.test(i)));
 for(const s of sessionsOf(P).filter(s=>s.sport==='RUN'&&s.prescription&&s.role!=='RACE'&&Math.abs(gap(race.date,s.date))<=13))
  assert.ok(['WALK_JOG','WALK'].includes(s.role),`${s.id} ${s.role} near the race for a walk/jog athlete`);
 const stepAt=w=>P.stateTrace[w].run.walkStep;
 for(let w=P.phases.raceWeek-1;w<=P.phases.raceWeek+1&&w<P.weeks.length-1;w++)if(['TAPER','RACE_WEEK','POST_EVENT'].includes(P.phases.phases[w]))assert.ok(stepAt(w+1)<=stepAt(w),'the ladder does not advance through event weeks');
 assert.ok(g.negotiation.some(n=>n.id==='EVENT_AMBITIOUS_FOR_CURRENT_RUNNING'&&/walk\/jog step/.test(n.detail)&&/walk breaks/.test(n.detail)));
});
test('SSCTR D43: a restart athlete holds current easy minutes in the taper, reduces them before the race and completes the race',()=>{
 const g=generateProgram(intake({id:'t-d43-restart',weeks:8,athlete:{goals:tenK('2026-12-20'),pause:{nonclinical:true,weeks:8,reasonCategory:'WORK'}},schedule:{runDays:[1,3,5],longRunDay:5}}),opts);
 assert.equal(g.program.capability.run.class,'RESTART');
 const P=g.program,race=sessionsOf(P).find(s=>s.role==='RACE'),rw=P.phases.raceWeek,mode=P.stateTrace[rw].run.mode;
 if(mode!=='EASY'){
  assert.equal(race.prescription.completion,true);
  const current=P.stateTrace[rw].run.restart;
  for(const s of sessionsOf(P).filter(s=>s.sport==='RUN'&&s.prescription&&s.role!=='RACE'&&gap(s.date,race.date)>=1&&gap(s.date,race.date)<=6))assert.ok(s.prescription.durationMinutes<=Math.max(current,op.return.entryRunMinutes));
 }
});
test('SSCTR D43(c): race-day warm-up strides only after strides were executed',()=>{
 const g=generateProgram(intake({id:'t-d43-strides',weeks:12,athlete:{goals:tenK('2027-01-17'),recent:{runDaysPerWeek:4,runMinutesPerWeek:160,longestRunMinutes:60}},schedule:{runDays:[1,3,5,6],longRunDay:6,runMinutes:50,longRunMinutes:80}}),opts);
 const P=g.program,race=sessionsOf(P).find(s=>s.role==='RACE'),achieved=P.stateTrace[P.phases.raceWeek].run.achieved?.strides??0;
 assert.equal(race.prescription.instructions.some(i=>/relaxed strides/.test(i)),achieved>0);
});
test('SSCTR R9: a half marathon with an achieved long run below the declared minimum is a completion race',()=>{
 const g=generateProgram(intake({id:'t-r9',weeks:8,athlete:{goals:{run:{kind:'RACE',event:{kind:'HALF_MARATHON',date:'2026-12-20'}},strength:'MAINTAIN'},recent:{runDaysPerWeek:3,runMinutesPerWeek:90,longestRunMinutes:35}},schedule:{runDays:[1,3,6],longRunDay:6,runMinutes:40,longRunMinutes:60}}),opts);
 const P=g.program,race=sessionsOf(P).find(s=>s.role==='RACE'),long=P.stateTrace[P.phases.raceWeek].run.achieved?.long??0;
 assert.equal(race.prescription.completion===true,long<op.event.raceDayCompletion.halfMarathonAchievedLongRunBelowMinutes);
});
test('SSCTR D46: in projection a dimension without a planned session holds',()=>{
 const g=generateProgram(intake({id:'t-d46',asOf:'2026-11-12',startDate:'2026-11-17',athlete:{goals:tenK('2026-12-13'),runExperience:'NOVICE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:null}},schedule:{runDays:[1,3,5],longRunDay:5}}),opts);
 const P=g.program;
 for(let w=0;w<P.weeks.length-1;w++){
  const planned=new Set(P.weeks[w].sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>s.role)),a=P.stateTrace[w].run,b=P.stateTrace[w+1].run;
  if(a.mode==='WALK_JOG'&&!planned.has('WALK_JOG'))assert.equal(b.walkStep,a.walkStep,'week '+w+' has no walk/jog session');
  if(a.mode==='EASY'&&!planned.has('EASY'))assert.equal(b.easyWeeksDone??0,a.easyWeeksDone??0);
 }
 assert.ok(!sessionsOf(P).some(s=>s.weekIndex>P.phases.raceWeek&&s.prescription&&['EASY','LONG'].includes(s.role)&&P.stateTrace[s.weekIndex].run.mode==='WALK_JOG'));
});
test('SSCTR R10: in the taper the long run is never shorter than the easy run',()=>{
 for(const [id,recent] of [['t-r10-restart',{runDaysPerWeek:3,runMinutesPerWeek:75,longestRunMinutes:25}],['t-r10-easy',{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50}]]){
  const g=generateProgram(intake({id,weeks:12,athlete:{goals:tenK('2027-01-17'),recent}}),opts);if(!g.program)continue;
  for(const w of g.program.weeks.filter(w=>w.phase==='TAPER')){const long=w.sessions.find(s=>s.role==='LONG'),easy=w.sessions.filter(s=>s.role==='EASY');if(long&&easy.length)assert.ok(long.prescription.durationMinutes>=Math.max(...easy.map(s=>s.prescription.durationMinutes)));}
 }
});

// ---------- logged-load adoption (D44, D45) and the return entry ----------
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const strengthIntake=(id,athlete={})=>intake({id,athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[SQUAT],...athlete}});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
function review(p,w,{kind='WEEKLY_REVIEW',day=6,...extra}={}){const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:d+'T21:00:00Z',weekIndex:w,event:{id:`t-${kind}-w${w}-d${day}`,kind},eligibility:elig(d),...extra};}
/** Every planned session of week w executed as prescribed; `set(e)` overrides the fields of each logged set of exercise e. */
function weekObs(p,w,set=()=>null){
 return p.weeks[w].sessions.filter(s=>s.prescription).map(s=>({eventId:`t-${p.athleteId}-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),
  actual:{completed:true,minutes:s.prescription.durationMinutes,...(s.prescription.exercises?{exercises:s.prescription.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,rir:e.rir,load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:e.load.value??20,unit:'KG',convention:e.load.convention},...(set(e)??{})}))}))}:{})},
  response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}}));
}
const loadsOf=(p,w,id)=>p.weeks[w].sessions.flatMap(s=>s.prescription?.exercises??[]).filter(e=>e.id===id).map(e=>e.load);
const conventionIn=(p,w)=>id=>p.weeks[w].sessions.flatMap(s=>s.prescription?.exercises??[]).find(e=>e.id===id).load.convention;
const kg=(value,convention)=>({load:{value,unit:'KG',convention}});
const goblet=v=>e=>e.id==='goblet-squat'?kg(v,'PER_HAND'):null;

test('SSCTR D44: an above-plan logged load is adopted only when that exposure met the ADVANCE criterion',()=>{
 const p=generateProgram(strengthIntake('t-d44'),opts).program;
 for(const [label,over] of [['3 of 5 reps',{reps:3}],['RIR 0 against the prescription',{rir:0}]]){
  const r=evaluateProgram(p,review(p,0,{observations:weekObs(p,0,e=>e.id==='back-squat'?{...kg(82.5,'TOTAL'),...over}:null)}),opts);
  assert.equal(r.gates['back-squat'],'HOLD',label);
  for(const l of loadsOf(r.proposal??p,1,'back-squat'))assert.equal(l.value,80,`${label}: the planned 80 kg stays (${l.value})`);
  assert.ok(r.loadQuestions.some(q=>q.exerciseId==='back-squat'&&q.reason==='LOGGED_LOAD_ABOVE_PLAN_TARGET_NOT_MET'&&q.logged===82.5),label+': asked');
 }
 const met=evaluateProgram(p,review(p,0,{observations:weekObs(p,0,e=>e.id==='back-squat'?kg(82.5,'TOTAL'):null)}),opts);
 assert.ok(['ADVANCE','EARNED'].includes(met.gates['back-squat']));
 for(const l of loadsOf(met.proposal,1,'back-squat'))assert.ok(l.value>=82.5,'target met: the executed load is the reference');
 assert.ok(!met.loadQuestions.some(q=>q.exerciseId==='back-squat'));
 // Before the week is gated the target criterion is not judged, so nothing is asked about it yet.
 const first=p.weeks[0].sessions.find(s=>s.prescription?.exercises?.some(e=>e.id==='back-squat'));
 const mid=evaluateProgram(p,review(p,0,{day:first.day,observations:weekObs(p,0,e=>e.id==='back-squat'?{...kg(82.5,'TOTAL'),reps:3}:null).filter(o=>o.sessionId===first.id)}),opts);
 assert.equal(mid.gates,null);assert.ok(!mid.loadQuestions.some(q=>q.reason==='LOGGED_LOAD_ABOVE_PLAN_TARGET_NOT_MET'));
});
test('SSCTR D45: one establishment log is not a number until confirmed, logged again or matching the athlete’s own hint',()=>{
 const p=generateProgram(intake({id:'t-d45'}),opts).program;
 const r=evaluateProgram(p,review(p,0,{observations:weekObs(p,0,goblet(160))}),opts);
 for(const l of loadsOf(r.proposal,1,'goblet-squat'))assert.ok(l.mode==='FROM_LOG'&&l.value===undefined,'no number from one unconfirmed log');
 assert.ok(r.loadQuestions.some(q=>q.exerciseId==='goblet-squat'&&q.reason==='ESTABLISHMENT_LOG_UNCONFIRMED'&&q.logged===160&&/per hand/.test(q.question)));
 assert.equal(r.proposal.stateTrace[1].strength.exercises['goblet-squat'].pendingLoad,160);
 // (a) the athlete's confirmation, in kilograms or pounds, in the planned convention
 for(const c of [{value:16,unit:'KG'},{value:35,unit:'lb'}]){
  const a=evaluateProgram(p,review(p,0,{observations:weekObs(p,0,goblet(160)),loadConfirmations:[{exerciseId:'goblet-squat',convention:'PER_HAND',...c}]}),opts);
  for(const l of loadsOf(a.proposal,1,'goblet-squat'))assert.ok(l.mode==='KNOWN'&&l.value>=16&&l.value<=18,`${c.value} ${c.unit} confirmed (${l.value})`);
  assert.ok(!a.loadQuestions.some(q=>q.exerciseId==='goblet-squat'));
 }
 const other=evaluateProgram(p,review(p,0,{observations:weekObs(p,0,goblet(160)),loadConfirmations:[{exerciseId:'goblet-squat',value:16,unit:'KG',convention:'TOTAL'}]}),opts);
 for(const l of loadsOf(other.proposal,1,'goblet-squat'))assert.equal(l.mode,'FROM_LOG','a confirmation in another convention confirms nothing');
 assert.equal(evaluateProgram(p,review(p,0,{observations:weekObs(p,0),loadConfirmations:{goblet:16}}),opts).status,'HOLD');
 // (b) a later log that differs stays pending and is carried forward; one agreeing within an increment becomes the number
 const p1=r.proposal,b1=evaluateProgram(p1,review(p1,1,{observations:weekObs(p1,1,goblet(16)),actualLedger:r.actualLedger}),opts);
 assert.equal(b1.proposal.stateTrace[2].strength.exercises['goblet-squat'].pendingLoad,16);
 for(const l of loadsOf(b1.proposal,2,'goblet-squat'))assert.equal(l.mode,'FROM_LOG');
 const p2=b1.proposal,b2=evaluateProgram(p2,review(p2,2,{observations:weekObs(p2,2,goblet(16)),actualLedger:b1.actualLedger}),opts);
 for(const l of loadsOf(b2.proposal,3,'goblet-squat'))assert.ok(l.mode==='KNOWN'&&l.value>=16&&l.value<=18);
 // Two agreeing logs in the same week also count (an exercise planned twice in week 1).
 const twice=p.weeks[0].sessions.flatMap(s=>s.prescription?.exercises?.map(e=>e.id)??[]).find((id,i,all)=>all.indexOf(id)!==i&&loadsOf(p,0,id)[0].mode==='ESTABLISH');
 assert.ok(twice,'the fixture plans an exercise twice in week 1');
 for(const l of loadsOf(evaluateProgram(p,review(p,0,{observations:weekObs(p,0)}),opts).proposal,1,twice))assert.equal(l.mode,'KNOWN',twice);
 // (c) within one increment of the athlete's own load hint in the same convention
 const h=generateProgram(intake({id:'t-d45-hint',athlete:{knownExercises:[{id:'goblet-squat',sets:3,reps:10,load:{value:16,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-08-01'}]}}),opts).program;
 for(const l of loadsOf(evaluateProgram(h,review(h,0,{observations:weekObs(h,0,goblet(18))}),opts).proposal,1,'goblet-squat'))assert.ok(l.mode==='KNOWN'&&l.value>=18);
 for(const l of loadsOf(evaluateProgram(h,review(h,0,{observations:weekObs(h,0,goblet(24))}),opts).proposal,1,'goblet-squat'))assert.equal(l.mode,'FROM_LOG');
});
test('SSCTR D45: a changed pending load reaches the next review even when no prescription changes',()=>{
 const p=generateProgram(intake({id:'t-d45-carry'}),opts).program,conv=conventionIn(p,0);
 const ask=evaluateProgram(p,review(p,0,{observations:weekObs(p,0,goblet(160))}),opts);
 const others=ask.loadQuestions.filter(q=>q.reason==='ESTABLISHMENT_LOG_UNCONFIRMED'&&q.exerciseId!=='goblet-squat').map(q=>({exerciseId:q.exerciseId,value:q.logged,unit:'KG',convention:conv(q.exerciseId)}));
 const r=evaluateProgram(p,review(p,0,{observations:weekObs(p,0,goblet(160)),loadConfirmations:others}),opts),p1=r.proposal;
 const next=evaluateProgram(p1,review(p1,1,{observations:weekObs(p1,1,goblet(16)),actualLedger:r.actualLedger}),opts);
 assert.ok(next.proposal,'the new pending value travels in a proposal');assert.equal(next.status,'KEEP');
 assert.equal(next.proposal.stateTrace[2].strength.exercises['goblet-squat'].pendingLoad,16);
});
test('SSCTR D45: a return-entry log never sets a load above the one before the break',()=>{
 const p=generateProgram(strengthIntake('t-d45-ret'),opts).program,w=2;
 const ret=evaluateProgram(p,review(p,w,{kind:'RETURN_AFTER_PAUSE',interruption:{days:18,reasonCategory:'TRAVEL',nonclinical:true}}),opts);
 assert.equal(ret.action,'REESTABLISH');const P=ret.proposal;
 const r=evaluateProgram(P,review(P,w+1,{observations:weekObs(P,w+1,e=>e.id==='back-squat'?kg(100,'TOTAL'):null)}),opts);
 const next=loadsOf(r.proposal,w+2,'back-squat');assert.ok(next.length);
 for(const l of next)assert.ok(l.mode==='KNOWN'&&l.value<=80,`never above the 80 kg before the break (${l.value})`);
 assert.ok(r.loadQuestions.some(q=>q.exerciseId==='back-squat'&&q.reason==='LOGGED_LOAD_ABOVE_CEILING_CAPPED'));
});
test('Author-found (R6-POLICY-4): a return-entry week holds the entry dose in every session, and exercises first set up in it follow the return steps',()=>{
 const p=generateProgram(strengthIntake('t-ret-week'),opts).program,w=2;
 const P=evaluateProgram(p,review(p,w,{kind:'RETURN_AFTER_PAUSE',interruption:{days:18,reasonCategory:'TRAVEL',nonclinical:true}}),opts).proposal;
 const rows=(Q,x)=>Q.weeks[x].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises.map(e=>({s:s.id,...e})));
 assert.ok(rows(P,w+1).length);
 for(const e of rows(P,w+1))assert.ok(e.sets===op.return.strengthEntrySets&&e.rir>=op.return.strengthEntryMinimumRir,`${e.s} ${e.id}: ${e.sets} sets at RIR ${e.rir}`);
 const r=evaluateProgram(P,review(P,w+1,{observations:weekObs(P,w+1)}),opts),before=rows(p,w);let compared=0;
 for(const e of rows(r.proposal,w+2)){const pre=before.find(x=>x.id===e.id);if(pre){compared++;assert.ok(e.sets<pre.sets&&e.rir>=3,`${e.s} ${e.id}: ${e.sets} sets (before the break ${pre.sets})`);}}
 assert.ok(compared>0);
});

// ---------- eligibility flags (R6) and the free-text screen (R7) ----------
test('SSCTR R6: a clinical flag that means yes in any form routes to a human in the intake, the review and the legacy path',()=>{
 const p=generateProgram(intake({id:'t-r6'}),opts).program,el=d=>({...elig(addDays(p.weeks[0].startDate,6)),...d});
 for(const yes of ['true','TRUE',' yes ',1,'1','sim','Sim','sí','si','y']){
  assert.equal(evaluateProgram(p,review(p,0,{eligibility:el({pain:yes})}),opts).status,'CLINICAL_HUMAN_REQUIRED',`review flag ${JSON.stringify(yes)}`);
  assert.equal(generateProgram(intake({id:'t-r6-intake',athlete:{eligibility:{...elig('2026-11-01'),injury:yes}}}),opts).status,'CLINICAL_HUMAN_REQUIRED',`intake flag ${JSON.stringify(yes)}`);
 }
 assert.equal(evaluateProgram(p,review(p,0,{eligibility:el({status:' clinical '})}),opts).status,'CLINICAL_HUMAN_REQUIRED');
 // Anything else that is not a boolean stays unknown: asked, never clearance and never assumed disease.
 for(const other of ['false','no',0,'maybe',null])assert.equal(evaluateProgram(p,review(p,0,{eligibility:el({illness:other})}),opts).status,'ASK',`review flag ${JSON.stringify(other)}`);
 assert.equal(screenInterruptionReason({reasonCategory:'TRAVEL',clinicalReason:'sí'}).status,'CLINICAL');
 assert.equal(screenInterruptionReason({reasonCategory:'TRAVEL',clinicalReason:'não'}).status,'NONCLINICAL');
 // The R5-INPUT-1 path reads the same flags (the frozen R5 validator itself reads only true).
 const legacy=structuredClone(R5_CASE.programInput);legacy.athlete.eligibility.pain='sim';
 assert.equal(generateProgram(legacy,opts).status,'CLINICAL_HUMAN_REQUIRED');
 const lp=generateProgram(structuredClone(R5_CASE.programInput),opts).program,start=lp.weeks[0].startDate;
 assert.equal(evaluateProgram(lp,{version:'R5-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:start+'T12:00:00Z',weekIndex:0,event:{id:'t-r6-legacy',kind:'WEEKLY_REVIEW'},eligibility:{...R5_CASE.programInput.athlete.eligibility,assessedAt:start,illness:'yes'}},opts).status,'CLINICAL_HUMAN_REQUIRED');
});
test('SSCTR R7: the round-7 residuals route to CLINICAL or ASK, and a locally negated damage statement is asked, not clinical',()=>{
 const screen=reason=>screenInterruptionReason({reason,reasonCategory:'OTHER_NONCLINICAL'}).status;
 for(const r of ['Had a baby','Tive um bebê','Tuve un bebé','Hit by a car','Car crash','Bike crash','Car accident','Bitten by a dog','Fui atropelado','Me atropellaron, quedé atropellada','Levei uma mordida','mordedura de perro','Parto em setembro'])assert.equal(screen(r),'CLINICAL',r);
 for(const r of ['Slipped on ice','Escorreguei na chuva','Me resbalé','New baby at home','A bike collision','Crashed on the bike path','Dog bite'])assert.notEqual(screen(r),'NONCLINICAL',r);
 for(const r of ['No broken bones','Didn\'t break my leg','Did not break my leg','Não quebrei a perna','No me rompí la pierna','Nenhum osso quebrado','Ningún hueso roto','Haven\'t broken anything in my arm'])assert.equal(screen(r),'ASK',r);
 // Only a local negation counts: a negation elsewhere in the clause does not hide a damage statement.
 for(const r of ['Broke my leg','I could not run because I broke my leg','Didn\'t break my arm and broke my leg','Quebrei a perna','Me rompí la pierna'])assert.equal(screen(r),'CLINICAL',r);
});
