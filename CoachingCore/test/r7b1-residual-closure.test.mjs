// DOMAIN_COACHING_R7-B.1 — residual runtime blocker closure (audits/domain-coaching-r7-b1-2026-10-31/TASK_CONTRACT.md). One test group per
// blocker of the R7-B closure (CoachingCore/r7/b/R7B_CLOSURE_HANDOFF.md): QE-R7B-OBS-04 (event-week substitution), QE-R7B-R2-01 (stored novice
// templates), QE-R7B-R2-02 (the block-choice question keeps the factual re-plan) and QE-R7B-R2-03 (the SKILL_MISMATCH fallback never climbs).
// Plan-level tests run the weekly reviews after the deciding review, not only the deciding review (R7-B closure lesson).
import test from 'node:test';
import assert from 'node:assert/strict';
import {program,reviewed,weekly,review,evaluateProgram,opts,live,addDays,FULL as FULL_EQ} from '../r7/b/fixtures/helpers.mjs';
import {historicalStateOf} from '../src/r6-adaptation.mjs';
import {dayPhaseOf,skeletonOf} from '../src/r6-program.mjs';
import {r6Authority} from '../src/r6-authority.mjs';
import {configurationOf,skillRank,ladderNext} from '../src/r7b-repertoire.mjs';

const BAD={performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'IMPAIRED'};
const correctionOf=(o,actual,correctedAt,response=null)=>({eventId:o.eventId+'-fix',athleteId:o.athleteId,sessionId:o.sessionId,observedAt:o.observedAt,correctionOf:o.eventId,correctedAt,actual,response:{...o.response,...(response??{})}});
const apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const types=(p,w,after=null)=>p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription&&(!after||s.date>after)).map(s=>s.templateType).sort().join(',');
const ids=(p,w)=>[...new Set(p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id)))];
const obsFor=(t,w,pred)=>t.ledger.filter(o=>!o.superseded&&t.p.weeks[w].sessions.some(s=>s.id===o.sessionId&&pred(s)));
const qualityRuns=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='RUN'&&['THRESHOLD','TEN_K_SPECIFIC','HALF_MARATHON_SPECIFIC','FAMILIAR_REPEATED_BOUTS'].includes(s.prescription.family));
const prescriptionsFrom=(p,w)=>JSON.stringify(p.weeks.slice(w).map(x=>x.sessions.map(s=>[s.id,s.prescription])));
const NOV={id:'b1-novice',strengthExperience:'NONE',goals:{run:'REGULAR',strength:'GENERAL'},equipment:['DUMBBELLS','BENCH'],schedule:{strengthDays:[0,2,4,5]},weeks:12};
const GRAD={id:'b1-grad',goals:{run:'PERFORMANCE',strength:'NONE'},runExperience:'NOVICE',recent:{runDaysPerWeek:3,runMinutesPerWeek:80,longestRunMinutes:35},schedule:{strengthDays:[],runMinutes:45},weeks:16};
const EV={id:'b1-event',goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:['DUMBBELLS','BENCH','KETTLEBELL'],recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6],strengthDays:[0,4]},rotation:'FIXED'};
const EVENT_PHASES=['TAPER','RACE_WEEK','POST_EVENT'];
const substitution=(t,w,exerciseId,reason,x={})=>evaluateProgram(t.p,{...review(t.p,w,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId,reason,...(reason==='NONCLINICAL_DISCOMFORT_OR_PREFERENCE'?{nonclinicalConfirmed:true}:{}),...x}}),actualLedger:t.ledger},opts);

// ---------- QE-R7B-R2-02: a block choice asked about never drops the factual re-plan (R7-A A5) ----------
/** NOV executed and reviewed through week 4 (the cap released at the first block boundary); a correction of week 4's strength reports as
 * adverse moves this week's PlanningView: the cap holds, so week 5 ahead is capped again. */
const correctedNovice=()=>{const t=reviewed(NOV,5),day=t.p.weeks[5].startDate;return {t,day,fixes:obsFor(t,4,s=>s.sport==='STRENGTH').map(o=>correctionOf(o,structuredClone(o.actual),`${day}T05:00:00Z`,BAD))};};
test('R7-B.1 R2-02: a mid-week correction with a block choice asks and still carries the factual re-plan',()=>{
 const {t,day,fixes}=correctedNovice();
 const control=evaluateProgram(t.p,{...review(t.p,5,{day:0,hour:'06:00:00',observations:fixes}),actualLedger:t.ledger},opts);
 assert.equal(control.action,'REPLAN_FROM_EVIDENCE');assert.match(types(control.proposal,5,day),/CORE/);
 const r=evaluateProgram(t.p,{...review(t.p,5,{day:0,hour:'06:00:00',observations:fixes,choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}]}),actualLedger:t.ledger},opts);
 assert.equal(r.status,'ASK');assert.deepEqual(r.missingInputs,['choices']);
 assert.ok(r.proposal,'the question carries the factual re-plan its correction requires');
 assert.equal(r.proposal.decisions.at(-1).action,'REPLAN_FROM_EVIDENCE');
 assert.equal(prescriptionsFrom(r.proposal,5),prescriptionsFrom(control.proposal,5),'the same facts give the same re-plan whatever the review also asks');
 assert.ok((r.actualLedger??[]).some(o=>o.correctionOf),'the correction is recorded');
});
test('R7-B.1 R2-02: no stale-state resurrection after the question: later reviews keep the corrected basis',()=>{
 const {t,day,fixes}=correctedNovice();
 apply(t,evaluateProgram(t.p,{...review(t.p,5,{day:0,hour:'06:00:00',observations:fixes,choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}]}),actualLedger:t.ledger},opts));
 // The athlete answers by sending the same week's next review without the choice and with no new report: nothing from the retracted facts returns.
 const f=apply(t,evaluateProgram(t.p,{...review(t.p,5,{day:1,hour:'06:00:00'}),actualLedger:t.ledger},opts));
 assert.notEqual(f.status,'ASK');assert.match(types(t.p,5,addDays(day,1)),/CORE/);
 const h=historicalStateOf(t.p,{asOf:`${addDays(day,1)}T06:00:00Z`,actualLedger:t.ledger},opts);
 assert.equal(h.state.strength.density?.capped,true,'history holds the cap');assert.equal(t.p.stateTrace[5].strength.density?.capped,true,'and so does the plan');
 // The weekly review of the complete week plans the next one from the corrected evidence too.
 weekly(t,5);assert.match(types(t.p,6),/CORE/);assert.equal(t.p.stateTrace[6].strength.density?.capped,true);
});
test('R7-B.1 R2-02: a correction with a graduation answer mid-week asks and carries the withdrawal',()=>{
 const t=reviewed(GRAD,4);assert.ok(t.p.canonical.athlete.runGraduation,'graduated at the block boundary');
 const longObs=obsFor(t,3,s=>s.role==='LONG')[0],fix=correctionOf(longObs,structuredClone(longObs.actual),`${t.p.weeks[4].startDate}T05:00:00Z`,BAD);
 const r=evaluateProgram(t.p,{...review(t.p,4,{day:0,hour:'06:00:00',observations:[fix],choices:[{offer:'RUN_QUALITY_GRADUATION',decision:'DECLINE'}]}),actualLedger:t.ledger},opts);
 assert.equal(r.status,'ASK');assert.ok(r.proposal,'the withdrawal comes with the question');
 assert.equal(qualityRuns(r.proposal,4).length,0);assert.equal(r.proposal.canonical.athlete.runGraduation,undefined);
 assert.equal(r.proposal.canonical.athlete.runGraduationWithdrawn?.length,1);
 assert.ok(r.disclosures.some(d=>d.id==='RUN_QUALITY_GRADUATION_WITHDRAWN'));
});
test('R7-B.1 R2-02: a correction with a block choice in another review kind asks and carries the factual re-plan',()=>{
 const {t,day,fixes}=correctedNovice();
 const r=evaluateProgram(t.p,{...review(t.p,5,{day:0,hour:'06:00:00',kind:'LOCAL_FATIGUE',signals:{region:'UPPER'},observations:fixes,choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}]}),actualLedger:t.ledger},opts);
 assert.equal(r.status,'ASK');assert.deepEqual(r.missingInputs,['choices']);assert.ok(r.proposal);assert.match(types(r.proposal,5,day),/CORE/);
});
test('R7-B.1 R2-02: without a correction a block choice off the boundary still asks and proposes nothing',()=>{
 const t=reviewed(NOV,5);
 const r=evaluateProgram(t.p,{...review(t.p,5,{day:0,hour:'06:00:00',choices:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}]}),actualLedger:t.ledger},opts);
 assert.equal(r.status,'ASK');assert.equal(r.proposal,null);
});

// ---------- QE-R7B-R2-01: the capped templates of the context in force are stored with every proposal ----------
const cappedIds=p=>[...new Set((p.noviceTemplates??[]).flatMap(x=>x.rows.map(r=>r.entry.id)))];
test('R7-B.1 R2-01: a capped novice SKILL_MISMATCH substitution survives the next weekly reviews',()=>{
 const t=reviewed(NOV,2);
 const s=apply(t,evaluateProgram(t.p,{...review(t.p,2,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'goblet-squat',reason:'SKILL_MISMATCH'}}),actualLedger:t.ledger},opts));
 assert.equal(s.status,'MODIFY');assert.ok(!cappedIds(t.p).includes('goblet-squat'),'the stored capped templates follow the decision');
 for(let w=2;w<6;w++){weekly(t,w);assert.ok(!ids(t.p,w+1).includes('goblet-squat'),`week ${w+1}: the exercise set aside never comes back`);}
});
test('R7-B.1 R2-01: a capped novice preference substitution survives the next weekly reviews',()=>{
 const t=reviewed(NOV,2);
 const s=apply(t,evaluateProgram(t.p,{...review(t.p,2,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'db-row',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true}}),actualLedger:t.ledger},opts));
 assert.equal(s.status,'MODIFY');const sel=s.substitutions[0].selected;
 for(let w=2;w<5;w++){weekly(t,w);assert.ok(!ids(t.p,w+1).includes('db-row'),`week ${w+1}`);}
 assert.ok([3,4,5].some(w=>ids(t.p,w).includes(sel)),'the selected exercise is what the plan prescribes');
});
test('R7-B.1 R2-01: a cap started by a schedule change survives the next weekly reviews',()=>{
 const t={p:program({...NOV,id:'b1-novice-2d',schedule:{strengthDays:[0,4]}}),ledger:[]};weekly(t,0);
 apply(t,evaluateProgram(t.p,{...review(t.p,1,{day:0,hour:'06:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,2,4,5]}}),actualLedger:t.ledger},opts));
 assert.ok(t.p.noviceTemplates?.length,'the context the change started stores its capped templates');
 for(let w=1;w<5;w++){
  weekly(t,w);const capped=t.p.stateTrace[w+1].strength.density?.capped===true;
  assert.equal(/CORE/.test(types(t.p,w+1)),capped,`week ${w+1}: the plan is capped exactly when its state is`);
  if(w+1<=3)assert.ok(capped,`week ${w+1} precedes the first block boundary`);
 }
});
test('R7-B.1 R2-01: a kettlebell-only change while capped survives the next weekly review',()=>{
 const t=reviewed(NOV,1);
 const e=apply(t,evaluateProgram(t.p,{...review(t.p,1,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:['KETTLEBELL']}}),actualLedger:t.ledger},opts));
 assert.equal(e.status,'MODIFY');
 for(const id of cappedIds(t.p))assert.ok(configurationOf(id).equipment.every(q=>q==='KETTLEBELL'||q==='BODYWEIGHT'),id);
 for(let w=1;w<4;w++){
  const r=weekly(t,w,{o:()=>({kg:()=>12})});assert.notEqual(r.status,'UNSUPPORTED');
  for(const s of t.p.weeks[w+1].sessions.filter(x=>live(x)&&x.sport==='STRENGTH'))for(const x of s.prescription.exercises)assert.ok(configurationOf(x.id).equipment.every(q=>q==='KETTLEBELL'||q==='BODYWEIGHT'),`${s.id} ${x.id}`);
 }
});

// ---------- QE-R7B-R2-03: after a SKILL_MISMATCH the fallback goes down, never up the ladder ----------
const hingeMain=(p,w)=>[...new Set(p.weeks[w].sessions.filter(x=>live(x)&&x.sport==='STRENGTH').flatMap(x=>x.prescription.exercises.filter(e=>e.pattern==='HINGE'&&e.role==='MAIN').map(e=>e.id)))];
const climb=id=>{const out=new Set(),todo=[id];while(todo.length)for(const n of ladderNext(todo.pop()))if(!out.has(n)){out.add(n);todo.push(n);}return out;};
const SUBEQ={id:'b1-sub-eq',equipment:['DUMBBELLS','BENCH','KETTLEBELL'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12};
const mismatchThenLoss=(change)=>{
 const t=reviewed(SUBEQ,3);
 const s=apply(t,evaluateProgram(t.p,{...review(t.p,3,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'db-rdl',reason:'SKILL_MISMATCH'}}),actualLedger:t.ledger},opts));
 assert.equal(s.substitutions[0].selected,'kb-deadlift','the previous rung on its ladder');
 weekly(t,3);
 const r=evaluateProgram(t.p,{...review(t.p,4,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:change(t)}),actualLedger:t.ledger},opts);
 return {t,r};
};
const assertNeverUp=(p,weeks)=>{const above=climb('db-rdl');for(const w of weeks)for(const id of hingeMain(p,w)){
 assert.ok(!above.has(id),`week ${w}: ${id} is above db-rdl on its ladder`);assert.notEqual(id,'db-rdl');
 if(id!=='kb-deadlift')assert.ok(skillRank(configurationOf(id).skill)<=skillRank(configurationOf('kb-deadlift').skill),`week ${w}: ${id} is harder than the substitute in use`);}};
test('R7-B.1 R2-03: a permanent loss of the substitute\'s equipment never climbs the ladder, also after later reviews',()=>{
 const {t,r}=mismatchThenLoss(()=>({equipment:['DUMBBELLS','BENCH']}));
 assert.equal(r.status,'MODIFY');assert.ok(hingeMain(r.proposal,4).length,'the hinge slot keeps an exercise');assertNeverUp(r.proposal,[4,5,6,7]);
 apply(t,r);for(let w=4;w<7;w++){weekly(t,w);assertNeverUp(t.p,[w+1]);}
});
test('R7-B.1 R2-03: a dated window without the substitute\'s equipment never climbs the ladder',()=>{
 const {r}=mismatchThenLoss(t=>({equipment:['DUMBBELLS','BENCH'],from:t.p.weeks[5].startDate,to:addDays(t.p.weeks[5].startDate,6)}));
 assert.equal(r.status,'MODIFY');assertNeverUp(r.proposal,[4,5,6]);
 assert.deepEqual(hingeMain(r.proposal,4),['kb-deadlift']);assert.deepEqual(hingeMain(r.proposal,6),['kb-deadlift'],'the substitute returns after the window');
});
test('R7-B.1 R2-03: with no lower option the equipment change asks instead of climbing',()=>{
 const t=reviewed({id:'b1-row',equipment:['DUMBBELLS','BANDS'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},3);
 assert.ok(ids(t.p,4).includes('db-row'));
 const s=apply(t,evaluateProgram(t.p,{...review(t.p,3,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'db-row',reason:'SKILL_MISMATCH'}}),actualLedger:t.ledger},opts));
 assert.equal(s.substitutions[0].selected,'band-row');
 const r=evaluateProgram(t.p,{...review(t.p,4,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS']}}),actualLedger:t.ledger},opts);
 assert.equal(r.status,'ASK');assert.equal(r.proposal,null);assert.match(r.reason,/db-row/);assert.match(r.reason,/band-row/);
});

// ---------- QE-R7B-01 residual (QE-R7B-R2-04): the plan prescribes what the decision selects in every slot of the replaced exercise ----------
const sessionsWith=(p,w,id)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.prescription.exercises.some(e=>e.id===id));
for(const [label,o,x] of [
 ['an accessory row beside the MAIN it would duplicate',{id:'b1-r204-pull',equipment:FULL_EQ,goals:{run:'PERFORMANCE',strength:'STRENGTH'},rotation:'FIXED',weeks:12,schedule:{strengthDays:[0,2,4]}},'one-arm-db-row'],
 ['a bodyweight push accessory',{id:'b1-r204-push',equipment:['BANDS','PULL_UP_BAR'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12,schedule:{strengthDays:[0,2,4]}},'incline-push-up'],
 ['a machine press accessory',{id:'b1-r204-machine',equipment:['MACHINES','DUMBBELLS'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12,schedule:{strengthDays:[0,2,4]}},'machine-chest-press']])
 test(`R7-B.1 QE-R7B-01 residual: a substitution of ${label} never selects an exercise already in the same session`,()=>{
  const t=reviewed(o,3);assert.ok(ids(t.p,4).includes(x),`${x} is in use in week 4`);let applied=0;
  for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE']){
   const r=evaluateProgram(t.p,{...review(t.p,3,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:x,reason,...(reason==='SKILL_MISMATCH'?{}:{nonclinicalConfirmed:true})}}),actualLedger:t.ledger},opts);
   if(r.status!=='MODIFY')continue;applied++;const sel=r.substitutions[0].selected;
   for(const s of sessionsWith(t.p,4,x)){const now=r.proposal.weeks[4].sessions.find(y=>y.id===s.id);
    assert.ok(now.prescription.exercises.some(e=>e.id===sel),`${reason}: ${s.id} prescribes ${sel}, the exercise the decision selected`);
    assert.ok(!s.prescription.exercises.some(e=>e.id===sel),`${reason}: ${sel} was not already in ${s.id}`);}
  }
  assert.ok(applied>=1,'a substitution was applied');
 });
test('R7-B.1 QE-R7B-01 residual: a named exercise already in a session with the replaced one is asked about',()=>{
 const t=reviewed({id:'b1-r204-named',equipment:FULL_EQ,goals:{run:'PERFORMANCE',strength:'STRENGTH'},rotation:'FIXED',weeks:12,schedule:{strengthDays:[0,2,4]}},3);
 const s=sessionsWith(t.p,4,'one-arm-db-row')[0];assert.ok(s,'one-arm-db-row is in use');
 const other=s.prescription.exercises.find(e=>e.pattern==='PULL'&&e.id!=='one-arm-db-row');assert.ok(other,'another pull is in the same session');
 const r=evaluateProgram(t.p,{...review(t.p,3,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'one-arm-db-row',reason:'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',nonclinicalConfirmed:true,to:other.id}}),actualLedger:t.ledger},opts);
 assert.equal(r.status,'ASK');assert.deepEqual(r.missingInputs,['substitution.to']);
});

// ---------- QE-R7B-OBS-04: no never-performed exercise in TAPER, RACE_WEEK or POST_EVENT through a reason-based substitution ----------
const performedIds=t=>{const byId=new Map(t.p.weeks.flatMap(w=>w.sessions.map(s=>[s.id,s])));return new Set(t.ledger.filter(o=>!o.superseded&&o.actual?.completed).flatMap(o=>(o.actual.exercises??byId.get(o.sessionId)?.prescription?.exercises??[]).map(e=>e.id)));};
const eventRows=(t,p,from)=>{const sk=skeletonOf(p,r6Authority(opts));return p.weeks.slice(from).flatMap(w=>w.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&EVENT_PHASES.includes(dayPhaseOf(sk.at(w.index)??sk,w.index,s.day))).flatMap(s=>s.prescription.exercises.map(e=>({w:w.index,s,e}))));};
const eventCase=(phase)=>{const t=reviewed(EV,0),wk=t.p.phases.phases.indexOf(phase);for(let w=0;w<wk;w++)weekly(t,w);return {t,wk,post:t.p.phases.phases.indexOf('POST_EVENT')};};
for(const phase of EVENT_PHASES)test(`R7-B.1 OBS-04: a substitution requested in ${phase} brings no never-performed exercise into the event weeks`,()=>{
 const {t,wk,post}=eventCase(phase),performed=performedIds(t);
 const inUse=[...new Set(t.p.weeks[wk].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>e.role!=='PRACTICE').map(e=>e.id)))];
 assert.ok(inUse.length,`exercises are in use in ${phase}`);let modified=0;
 for(const id of inUse)for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE']){
  const r=substitution(t,wk,id,reason);if(r.status!=='MODIFY')continue;modified++;
  for(const {w,s,e} of eventRows(t,r.proposal,wk))assert.ok(performed.has(e.id),`${phase} ${id} ${reason}: week ${w} ${s.id} prescribes ${e.id}, never performed in this program`);
  assert.ok(!r.proposal.weeks.slice(wk).some(w=>w.sessions.some(s=>live(s)&&s.date>=addDays(t.p.weeks[wk].startDate,0)&&s.sport==='STRENGTH'&&s.prescription.exercises.some(e=>e.id===id))),`${id} leaves every session ahead`);
  const sel=r.substitutions[0].selected,after=r.proposal.weeks.slice(post+1).flatMap(w=>w.sessions.filter(live).flatMap(s=>(s.prescription.exercises??[]).filter(e=>e.id===sel)));
  if(!performed.has(sel)&&after.length)assert.ok(['FIRST_ESTABLISH','BODYWEIGHT','REESTABLISH'].includes(after[0].exposure?.kind),`${sel} starts after the event with its establishment (${after[0].exposure?.kind})`);
  if(!performed.has(sel))assert.ok(r.disclosures.some(d=>d.id==='NO_NEW_EXERCISE_IN_EVENT_WEEKS'&&d.exerciseId===id&&d.selected===sel),`${id}: the event-week handling is disclosed`);
 }
 assert.ok(modified>=2,`${phase}: substitutions were applied (${modified})`);
});
test('R7-B.1 OBS-04: in event weeks a configuration already performed in this program and admissible stands in; otherwise the slot is left out and disclosed',()=>{
 const {t,wk}=eventCase('TAPER'),performed=performedIds(t);
 const r=substitution(t,wk,'db-rdl','NONCLINICAL_DISCOMFORT_OR_PREFERENCE');assert.equal(r.status,'MODIFY');
 const d=r.disclosures.find(x=>x.id==='NO_NEW_EXERCISE_IN_EVENT_WEEKS');assert.ok(d);
 const rows=eventRows(t,r.proposal,wk).filter(x=>x.e.pattern==='HINGE');
 for(const id of d.standIns)assert.ok(performed.has(id),`${id} stands in and was performed`);
 assert.ok(rows.every(x=>d.standIns.includes(x.e.id)),'every hinge row in the event weeks is a disclosed stand-in');
 if(!d.standIns.length)assert.equal(rows.length,0,'the hinge slot is left out of the event weeks');
 assert.ok(d.options.length>=2);
});
test('R7-B.1 OBS-04: an admissible configuration this program performed stands in during the taper, at its own dose',()=>{
 const t=reviewed({...EV,id:'b1-event-rotating',rotation:'EVERY_2_WEEKS'},0),wk=t.p.phases.phases.indexOf('TAPER');for(let w=0;w<wk;w++)weekly(t,w);
 const performed=performedIds(t),X=configurationOf('db-split-squat');
 for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE']){
  const r=substitution(t,wk,X.id,reason);assert.equal(r.status,'MODIFY');const sel=r.substitutions[0].selected;
  assert.ok(!performed.has(sel),`${sel} is new in this program`);
  const d=r.disclosures.find(x=>x.id==='NO_NEW_EXERCISE_IN_EVENT_WEEKS');assert.ok(d?.standIns.length,`${reason}: a stand-in`);
  for(const id of d.standIns){const c=configurationOf(id);assert.ok(performed.has(id),`${id} was performed`);assert.equal(c.subpattern,X.subpattern);
   if(reason==='SKILL_MISMATCH')assert.ok(skillRank(c.skill)<skillRank(X.skill)&&skillRank(c.skill)<=skillRank(configurationOf(sel).skill),`${id} follows the SKILL_MISMATCH direction`);}
  const lunge=eventRows(t,r.proposal,wk).filter(x=>x.e.pattern==='LUNGE');assert.ok(lunge.length,'the slot is kept in the taper');
  for(const x of lunge){assert.ok(d.standIns.includes(x.e.id));assert.notEqual(x.e.exposure?.kind,'FIRST_ESTABLISH');assert.ok(x.e.instructions.some(i=>/stands in for db-split-squat/.test(i)));}
  assert.ok((r.substitutions[0].eventWeeks?.standIns??[]).length);
 }
});
test('R7-B.1 OBS-04: the clinical screen and the questions still come first in event weeks',()=>{
 const {t,wk}=eventCase('TAPER');
 assert.equal(substitution(t,wk,'goblet-squat','SKILL_MISMATCH',{pain:true}).status,'CLINICAL_HUMAN_REQUIRED');
 assert.equal(substitution(t,wk,'goblet-squat','NONCLINICAL_DISCOMFORT_OR_PREFERENCE',{nonclinicalConfirmed:undefined}).status,'ASK');
 assert.equal(substitution(t,wk,'goblet-squat',undefined).status,'ASK');
});
test('R7-B.1 OBS-04: a substitution before the taper whose substitute is performed keeps it in the event weeks',()=>{
 const t=reviewed(EV,0),wk=t.p.phases.phases.indexOf('TAPER'),spec=wk-2;
 for(let w=0;w<spec;w++)weekly(t,w);
 const r=apply(t,substitution(t,spec,'db-split-squat','NONCLINICAL_DISCOMFORT_OR_PREFERENCE'));assert.equal(r.status,'MODIFY');const sel=r.substitutions[0].selected;
 for(let w=spec;w<wk;w++)weekly(t,w);
 assert.ok(performedIds(t).has(sel),'the substitute was performed before the taper');
 assert.ok(eventRows(t,t.p,wk).some(x=>x.e.id===sel),'so it stays in the taper');
});
