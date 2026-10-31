// DOMAIN_COACHING_R7-B.1 — the one correction cycle after the independent reviews of R7B1-FREEZE-1 (request §17; TASK_CONTRACT §3). One test group per
// finding the cycle closes: QE-R7B1-01 (Engineering: the clinical screen comes before any block-choice question), QR7B1-01 (Quality: the no-lower-skill
// question offers options that act), QR7B1-02 (Quality, with SSCTR R7B1-SSCTR-F11: no configuration this program has not performed enters the event
// weeks, whatever placed it), QR7B1-03 (the question raised when every candidate is already in the session offers what acts), QR7B1-04 (a review that
// leaves an event-week slot out discloses it) and QR7B1-05 (a program that ends with the post-event week says so). Every test fails on R7B1-FREEZE-1
// except those named "preserved" (behaviour FREEZE-1 already had that the cycle must keep).
import test from 'node:test';
import assert from 'node:assert/strict';
import {program,reviewed,weekly,review,evaluateProgram,opts,live,FULL as FULL_EQ} from '../r7/b/fixtures/helpers.mjs';
import {dayPhaseOf,skeletonOf} from '../src/r6-program.mjs';
import {r6Authority} from '../src/r6-authority.mjs';
import {generateProgram} from '../src/r6-index.mjs';
import {PROFILES} from '../r6/fixtures/profiles.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';

const auth=r6Authority(opts),EVENT_PHASES=['TAPER','RACE_WEEK','POST_EVENT'];
const BAD={performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'IMPAIRED'};
const correctionOf=(o,actual,correctedAt,response=null)=>({eventId:o.eventId+'-fix',athleteId:o.athleteId,sessionId:o.sessionId,observedAt:o.observedAt,correctionOf:o.eventId,correctedAt,actual,response:{...o.response,...(response??{})}});
const apply=(t,r)=>{t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const prescriptionsFrom=(p,w)=>JSON.stringify(p.weeks.slice(w).map(x=>x.sessions.map(s=>[s.id,s.prescription])));
const performedIds=t=>{const byId=new Map(t.p.weeks.flatMap(w=>w.sessions.map(s=>[s.id,s])));return new Set(t.ledger.filter(o=>!o.superseded&&o.actual?.completed).flatMap(o=>(o.actual.exercises??byId.get(o.sessionId)?.prescription?.exercises??[]).map(e=>e.id)));};
/** Every strength row on an event-phase day (TAPER, RACE_WEEK, POST_EVENT by dayPhaseOf) of a program from a week on. */
const eventRows=(p,from)=>{const sk=skeletonOf(p,auth);return p.weeks.slice(from).flatMap(w=>w.sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&EVENT_PHASES.includes(dayPhaseOf(sk.at(w.index)??sk,w.index,s.day))).flatMap(s=>s.prescription.exercises.map(e=>({w:w.index,s,e}))));};
const substitution=(t,w,exerciseId,reason,x={},day=0)=>evaluateProgram(t.p,{...review(t.p,w,{day,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId,reason,...(reason==='NONCLINICAL_DISCOMFORT_OR_PREFERENCE'?{nonclinicalConfirmed:true}:{}),...x}}),actualLedger:t.ledger},opts);
const EV={id:'b1c-event',goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:['DUMBBELLS','BENCH','KETTLEBELL'],recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6],strengthDays:[0,4]},rotation:'FIXED'};
/** An athlete reviewed week by week up to the start of an event phase. */
const upTo=(o,phase,shift=0)=>{const t=reviewed(o,0),wk=t.p.phases.phases.indexOf(phase)+shift;for(let w=0;w<wk;w++)weekly(t,w);return {t,wk};};

// ---------- QE-R7B1-01: the clinical screen comes before any block-choice question (B0-C06 condition 8; SSCTR D08; R7-A: a clinical route proposes nothing) ----------
const NOV={id:'b1c-novice',strengthExperience:'NONE',goals:{run:'REGULAR',strength:'GENERAL'},equipment:['DUMBBELLS','BENCH'],schedule:{strengthDays:[0,2,4,5]},weeks:12};
const CHOICES={ladder:[{type:'LADDER_STEP',from:'goblet-squat',to:'kb-goblet-squat'}],decline:[{offer:'RUN_QUALITY_GRADUATION',decision:'DECLINE'}],unrecognised:[{type:'LADDER_JUMP'}]};
/** NOV reviewed through week 4; on day 0 of week 5 the review may also correct week 4's strength reports as adverse (a fact that re-plans week 5). */
const clinicalCase=()=>{const t=reviewed(NOV,5),day=t.p.weeks[5].startDate;
 const fixes=t.ledger.filter(o=>!o.superseded&&!o.correctionOf&&t.p.weeks[4].sessions.some(s=>s.id===o.sessionId&&s.sport==='STRENGTH')).map(o=>correctionOf(o,structuredClone(o.actual),`${day}T05:00:00Z`,BAD));
 const X=t.p.weeks[5].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>day).flatMap(s=>s.prescription.exercises.filter(e=>e.role!=='PRACTICE').map(e=>e.id))[0];
 return {t,fixes,X};};
for(const [label,kind] of [['pain with an exercise',X=>({kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true}})],['an illness interruption',()=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:2,reason:'Flu illness',nonclinical:true}})]])
 test(`R7-B.1 cycle QE-R7B1-01: a review reporting ${label} routes to a human whatever block choice it carries, and proposes nothing`,()=>{
  const {t,fixes,X}=clinicalCase();
  for(const [name,choices] of Object.entries(CHOICES))for(const fix of [false,true]){
   const r=evaluateProgram(t.p,{...review(t.p,5,{day:0,hour:'06:00:00',...kind(X),observations:fix?fixes:[],choices}),actualLedger:t.ledger},opts),at=`${name}${fix?' with a correction':''}`;
   assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',at);assert.equal(r.proposal,null,at+': a clinical route proposes nothing');
   assert.equal(r.referenceState?.pending?.status,'CLINICAL_HUMAN_REQUIRED',at+': the clinical dependency carries to later reviews');
   if(fix)assert.ok((r.actualLedger??[]).some(o=>o.correctionOf),at+': the correction is still recorded');
  }
 });
test('R7-B.1 cycle QE-R7B1-01: an unrecognised choice with a correction asks and still carries the factual re-plan',()=>{
 const {t,fixes}=clinicalCase();
 const control=evaluateProgram(t.p,{...review(t.p,5,{day:0,hour:'06:00:00',observations:fixes}),actualLedger:t.ledger},opts);
 assert.equal(control.action,'REPLAN_FROM_EVIDENCE');
 const r=evaluateProgram(t.p,{...review(t.p,5,{day:0,hour:'06:00:00',observations:fixes,choices:CHOICES.unrecognised}),actualLedger:t.ledger},opts);
 assert.equal(r.status,'ASK');assert.deepEqual(r.missingInputs,['choices']);assert.match(r.reason,/not recognised/);
 assert.ok(r.proposal,'the question carries the factual re-plan (QE-R7B-R2-02 holds for this question too)');
 assert.equal(prescriptionsFrom(r.proposal,5),prescriptionsFrom(control.proposal,5));
});
test('R7-B.1 cycle QE-R7B1-01 (preserved): a nonclinical review with a block choice off the boundary still asks and proposes nothing',()=>{
 const {t,X}=clinicalCase();
 const r=evaluateProgram(t.p,{...review(t.p,5,{day:0,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH'},choices:CHOICES.ladder}),actualLedger:t.ledger},opts);
 assert.equal(r.status,'ASK');assert.deepEqual(r.missingInputs,['choices']);assert.equal(r.proposal,null);
});

// ---------- QR7B1-01: the no-lower-skill question names what is missing and offers two options that act ----------
/** db-row set aside for a SKILL_MISMATCH and replaced by band-row; the athlete then loses the bands, and no lower pull exercise fits the dumbbells. */
const rowCase=()=>{const t=reviewed({id:'b1c-row',equipment:['DUMBBELLS','BANDS'],goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'FIXED',weeks:12},3);
 const s=apply(t,evaluateProgram(t.p,{...review(t.p,3,{day:1,hour:'06:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:'db-row',reason:'SKILL_MISMATCH'}}),actualLedger:t.ledger},opts));
 assert.equal(s.substitutions[0].selected,'band-row');return t;};
const pullsAhead=(p,from)=>p.weeks.slice(from).flatMap(w=>w.sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>e.pattern==='PULL').map(e=>e.id)));
test('R7-B.1 cycle QR7B1-01: the question names only the missing equipment and its options are inputs the review reads',()=>{
 const t=rowCase(),r=evaluateProgram(t.p,{...review(t.p,4,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS']}}),actualLedger:t.ledger},opts);
 assert.equal(r.status,'ASK');assert.equal(r.proposal,null,'keeping the equipment changes nothing');assert.deepEqual(r.missingInputs,['changes.acceptGap']);
 const d=r.disclosures.find(x=>x.id==='NO_LOWER_SKILL_ALTERNATIVE');
 assert.deepEqual(d.options,['Keep the equipment','Leave the pull slot out until the equipment returns']);assert.deepEqual(d.missingEquipment,['bands']);
 assert.match(r.reason,/band-row needs bands, which is not available/);assert.doesNotMatch(r.reason,/dumbbells/,'equipment the athlete still has is not named as missing');
});
test('R7-B.1 cycle QR7B1-01: confirming the loss records it with the pull slot left out, disclosed, and nothing harder takes its place through later reviews',()=>{
 const t=rowCase(),r=apply(t,evaluateProgram(t.p,{...review(t.p,4,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS'],acceptGap:true}}),actualLedger:t.ledger},opts));
 assert.equal(r.status,'MODIFY');assert.deepEqual(r.proposal.canonical.athlete.equipment,['DUMBBELLS'],'the equipment change is recorded');
 const d=r.disclosures.find(x=>x.id==='NO_LOWER_SKILL_ALTERNATIVE');assert.equal(d?.accepted,true);assert.equal(d.informational,true);assert.match(d.detail,/pull slot is left out until the equipment returns/);
 assert.deepEqual(pullsAhead(t.p,4),[],'no pull exercise takes the place of the one set aside');
 weekly(t,4);weekly(t,5);assert.deepEqual(pullsAhead(t.p,6),[],'later reviews do not climb the ladder either');
 const again=evaluateProgram(t.p,{...review(t.p,6,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}}),actualLedger:t.ledger},opts);
 assert.notEqual(again.status,'ASK','a gap the program already holds is not asked about again');
});

test('R7-B.1 cycle QR7B1-01: the question never says equipment the athlete still has is missing',()=>{
 const FULL_NO_BANDS=FULL_EQ.filter(q=>q!=='BANDS');
 const t=reviewed({id:'b1c-q12',equipment:FULL_EQ,goals:{run:'PERFORMANCE',strength:'RUNNING_SUPPORT'},strengthExperience:'INTERMEDIATE',rotation:'FIXED',weeks:12,schedule:{strengthDays:[0,2,4]}},3);
 assert.equal(apply(t,substitution(t,3,'db-row','SKILL_MISMATCH',{},1)).substitutions[0].selected,'band-face-pull');weekly(t,3);
 assert.equal(apply(t,substitution(t,4,'band-face-pull','SKILL_MISMATCH',{to:'one-arm-db-row'})).status,'MODIFY');
 const r=evaluateProgram(t.p,{...review(t.p,4,{day:1,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:FULL_NO_BANDS}}),actualLedger:t.ledger},opts);
 assert.equal(r.status,'ASK');const d=r.disclosures.find(x=>x.id==='NO_LOWER_SKILL_ALTERNATIVE');
 assert.deepEqual(d.missingEquipment,[],'one-arm-db-row needs only dumbbells, which the athlete has');assert.doesNotMatch(r.reason,/needs dumbbells/);
});

// ---------- QR7B1-02 (with SSCTR F11): no configuration this program has not performed enters the event weeks, whatever placed it ----------
const ROT={goals:{run:'RACE'},recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,5,6],strengthDays:[0,2,4],longRunMinutes:90},rotation:'EVERY_2_WEEKS'};
for(const [id,o,X] of [
 ['W1',{event:{kind:'10K',date:'2027-01-17'},weeks:12,equipment:FULL_EQ,strength:'GENERAL'},'push-up'],
 ['W2',{event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:FULL_EQ,strength:'GENERAL'},'inverted-row'],
 ['W3',{event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:['BANDS','PULL_UP_BAR'],strength:'GENERAL'},'glute-bridge'],
 ['W4',{event:{kind:'10K',date:'2027-01-24'},weeks:16,equipment:FULL_EQ,strength:'RUNNING_SUPPORT'},'kb-row']])
 test(`R7-B.1 cycle QR7B1-02: a taper substitution under a two-week rotation brings no never-performed configuration into the event weeks (${id}, ${X})`,()=>{
  const {t,wk}=upTo({...ROT,id:'b1c-rot-'+id,goals:{run:'RACE',strength:o.strength},event:o.event,weeks:o.weeks,equipment:o.equipment},'TAPER'),performed=performedIds(t);
  const before=new Set(eventRows(t.p,wk).map(x=>x.e.id)),r=substitution(t,wk,X,'NONCLINICAL_DISCOMFORT_OR_PREFERENCE');assert.equal(r.status,'MODIFY');
  const entered=eventRows(r.proposal,wk).filter(x=>!before.has(x.e.id)&&!performed.has(x.e.id));
  assert.deepEqual(entered.map(x=>`w${x.w} ${x.s.id} ${x.e.id}`),[],'every exercise new to the event weeks has been performed in this program');
 });
test('R7-B.1 cycle QR7B1-02: under a two-week rotation the plan prescribes what the decision selects in every slot of the replaced exercise',()=>{
 const t=reviewed({id:'b1c-rot-slot',equipment:FULL_EQ,goals:{run:'PERFORMANCE',strength:'GENERAL'},rotation:'EVERY_2_WEEKS',weeks:12,schedule:{strengthDays:[0,2,4]}},4);
 for(const X of ['push-up','kb-row']){
  const r=substitution(t,4,X,'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',{},1);assert.equal(r.status,'MODIFY',X);const sel=r.substitutions[0].selected;let held=0;
  for(const w of [4,5])for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>t.p.weeks[4].startDate&&s.prescription.exercises.some(e=>e.id===X))){
   const role=s.prescription.exercises.find(e=>e.id===X).role,now=r.proposal.weeks[w].sessions.find(y=>y.id===s.id);held++;
   assert.ok(now.prescription.exercises.some(e=>e.id===sel&&e.role===role),`${X}: ${s.id} holds ${sel} in the ${role} place of ${X}`);
   assert.ok(!s.prescription.exercises.some(e=>e.id===sel),`${X}: ${sel} was not already in ${s.id}`);
  }
  assert.ok(held>=2,`${X} was in use in weeks 4 and 5`);
 }
});
test('R7-B.1 cycle QR7B1-04 (preserved): a taper substitution\'s own event-week disclosure is not repeated by the decision\'s general note',()=>{
 const {t,wk}=upTo({...EV,id:'b1c-own'},'TAPER');
 for(const [X,reason] of [['goblet-squat','SKILL_MISMATCH'],['db-rdl','NONCLINICAL_DISCOMFORT_OR_PREFERENCE'],['db-row','NONCLINICAL_DISCOMFORT_OR_PREFERENCE'],['db-bench-press','SKILL_MISMATCH']]){
  const r=substitution(t,wk,X,reason);assert.equal(r.status,'MODIFY',X);
  const d=r.disclosures.filter(x=>x.id==='NO_NEW_EXERCISE_IN_EVENT_WEEKS');assert.equal(d.length,1,X);assert.equal(d[0].exerciseId,X);
 }
});
test('R7-B.1 cycle QR7B1-02 (F11): an equipment change at the start of the taper leaves never-performed substitutes out of the event weeks, disclosed',()=>{
 const o={id:'b1c-equip',goals:{run:'RACE',strength:'STRENGTH'},event:{kind:'10K',date:'2027-01-24'},weeks:16,recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:FULL_EQ,schedule:{runDays:[1,3,5,6],strengthDays:[0,2,4]},rotation:'COACH_DECIDES'};
 const {t,wk}=upTo(o,'TAPER'),post=t.p.phases.phases.indexOf('POST_EVENT');
 const r=apply(t,evaluateProgram(t.p,{...review(t.p,wk,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:['KETTLEBELL']}}),actualLedger:t.ledger},opts));
 assert.equal(r.status,'MODIFY');assert.ok(r.substitutions.length,'the equipment change substitutes');
 const d=r.disclosures.find(x=>x.id==='NO_NEW_EXERCISE_IN_EVENT_WEEKS');assert.ok(d&&d.slots.length,'the slots kept out of the event weeks are disclosed');
 assert.match(d.detail,/starts? after the post-event week$/);
 for(let w=wk;w<=post;w++){const performed=performedIds(t);
  assert.deepEqual(eventRows(t.p,w).filter(x=>x.w===w&&!performed.has(x.e.id)).map(x=>`${x.s.id} ${x.e.id}`),[],`week ${w}: no exercise first performed on an event-phase day`);
  weekly(t,w);}
});

test('R7-B.1 cycle QR7B1-02: a configuration a rebuild brings into the taper that this program has not performed gives way to a performed alternative',()=>{
 const o={id:'b1c-machines',goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-24'},weeks:16,recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:FULL_EQ,schedule:{runDays:[1,3,5,6],strengthDays:[0,2,4],longRunMinutes:90},rotation:'EVERY_2_WEEKS'};
 const {t,wk}=upTo(o,'TAPER'),performed=performedIds(t);
 const r=evaluateProgram(t.p,{...review(t.p,wk,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:FULL_EQ.filter(q=>q!=='MACHINES')}}),actualLedger:t.ledger},opts);
 assert.equal(r.status,'MODIFY');
 const s=r.proposal.weeks[wk].sessions.find(x=>(x.eventStandIns??[]).some(g=>g.selected==='band-row'));assert.ok(s,'band-row, never performed, is kept out of the taper');
 const g=s.eventStandIns.find(x=>x.selected==='band-row');assert.equal(g.setAside,null);assert.equal(g.inEventWeeks,'inverted-row');
 assert.ok(performed.has('inverted-row')&&s.prescription.exercises.some(e=>e.id==='inverted-row'),'inverted-row, already done in this program, stands in');
 assert.ok(r.disclosures.some(d=>d.id==='NO_NEW_EXERCISE_IN_EVENT_WEEKS'&&/inverted-row, already done in this program, stands in for band-row/.test(d.detail)));
});
test('R7-B.1 cycle QR7B1-02 (preserved): a row the session time leaves out anyway records no event-week omission (profile E at intake)',()=>{
 const p=generateProgram(PROFILES.E_EXPERIENCED_RUNNER_NOVICE_STRENGTH,{authority:devAuthority()}).program,sk=skeletonOf(p,auth);
 assert.ok(p.weeks.some(w=>w.phase==='TAPER'),'profile E tapers within its horizon');
 assert.deepEqual(p.weeks.flatMap(w=>w.sessions.filter(s=>s.sport==='STRENGTH'&&EVENT_PHASES.includes(dayPhaseOf(sk.at(w.index)??sk,w.index,s.day))).flatMap(s=>(s.eventStandIns??[]).map(g=>s.id+':'+g.selected))),[]);
});

// ---------- QR7B1-03: when every candidate is already in the session, the question offers what acts ----------
const p04=(equipment,exp)=>reviewed({id:'b1c-p04',weeks:16,rotation:'COACH_DECIDES',goals:{run:'PERFORMANCE',strength:'GENERAL'},strengthExperience:exp,equipment,schedule:{strengthDays:[0,2,4,5]}},2);
test('R7-B.1 cycle QR7B1-03: naming another exercise is offered when one would take its place, and it does',()=>{
 const t=p04(['DUMBBELLS','BENCH'],'NOVICE'),r=substitution(t,2,'front-plank','SKILL_MISMATCH',{},1);
 assert.equal(r.status,'ASK');assert.match(r.reason,/^Every admissible alternative/);assert.deepEqual(r.missingInputs,['substitution.to']);
 assert.deepEqual(r.disclosures[0].options,['Keep front-plank','Name another exercise of the same pattern']);
 assert.ok(['bird-dog','side-plank'].some(to=>substitution(t,2,'front-plank','SKILL_MISMATCH',{to},1).status==='MODIFY'),'a named exercise of the same pattern is applied');
});
test('R7-B.1 cycle QR7B1-03: with nothing that could take its place the question offers only keeping the exercise',()=>{
 const t=p04(['DUMBBELLS'],'INTERMEDIATE');
 for(const reason of ['SKILL_MISMATCH','NONCLINICAL_DISCOMFORT_OR_PREFERENCE']){
  const r=substitution(t,2,'prone-ytw-raise',reason,{},1);
  assert.equal(r.status,'ASK');assert.match(r.reason,/no other exercise of the same pattern can take its place now/);
  assert.deepEqual(r.disclosures[0].options,['Keep prone-ytw-raise']);assert.deepEqual(r.missingInputs,[]);
 }
});

// ---------- QR7B1-04 (with SSCTR F12): a review that leaves an event-week slot out discloses it ----------
test('R7-B.1 cycle QR7B1-04: a substitute planned in the last SPECIFIC week and not done there is left out of the taper, and the weekly review says so',()=>{
 const {t,wk}=upTo({...EV,id:'b1c-missed'},'TAPER',-1),taper=wk+1;
 const r=apply(t,substitution(t,wk,'db-rdl','NONCLINICAL_DISCOMFORT_OR_PREFERENCE'));assert.equal(r.status,'MODIFY');const sel=r.substitutions[0].selected;
 const res=weekly(t,wk,{keep:s=>!(s.sport==='STRENGTH'&&s.prescription?.exercises.some(e=>e.id===sel))});
 assert.ok(!eventRows(t.p,taper).some(x=>x.e.id===sel),`${sel}, never performed, is not on an event-phase day`);
 const d=(res.disclosures??[]).find(x=>x.id==='NO_NEW_EXERCISE_IN_EVENT_WEEKS');assert.ok(d,'the omission is disclosed by the review that makes it');
 assert.ok(d.slots.some(g=>g.selected===sel&&g.week===taper));assert.match(d.detail,new RegExp(sel));
});
test('R7-B.1 cycle QR7B1-04 (preserved): a substitute done in the last SPECIFIC week continues in the taper with no omission disclosed',()=>{
 const {t,wk}=upTo({...EV,id:'b1c-done'},'TAPER',-1),taper=wk+1;
 const r=apply(t,substitution(t,wk,'db-rdl','NONCLINICAL_DISCOMFORT_OR_PREFERENCE'));const sel=r.substitutions[0].selected;
 const res=weekly(t,wk);
 assert.ok(eventRows(t.p,taper).some(x=>x.e.id===sel),`${sel}, performed, stays in the taper`);
 assert.ok(!(res.disclosures??[]).some(x=>x.id==='NO_NEW_EXERCISE_IN_EVENT_WEEKS'));
});

// ---------- QR7B1-05: where no week follows the event weeks, the option and the text say so ----------
const SHORT={...EV,id:'b1c-short',weeks:12,event:{kind:'10K',date:'2027-01-17'}};
test('R7-B.1 cycle QR7B1-05: in a program that ends with the post-event week the option does not promise a week after it',()=>{
 const {t,wk}=upTo(SHORT,'TAPER');const ph=t.p.phases.phases;assert.equal(ph.indexOf('POST_EVENT'),ph.length-1);
 const r=substitution(t,wk,'goblet-squat','SKILL_MISMATCH');assert.equal(r.status,'MODIFY');
 const d=r.disclosures.find(x=>x.id==='NO_NEW_EXERCISE_IN_EVENT_WEEKS');
 assert.deepEqual(d.options,['Keep this plan','Keep goblet-squat instead: this program ends with the post-event week']);
});
test('R7-B.1 cycle QR7B1-05: the event-week note of a decision in a program that ends with the post-event week says they start after this program',()=>{
 const {t,wk}=upTo(SHORT,'TAPER');
 const r=evaluateProgram(t.p,{...review(t.p,wk,{day:0,hour:'06:00:00',kind:'EQUIPMENT_CHANGE',changes:{equipment:['KETTLEBELL']}}),actualLedger:t.ledger},opts);
 const d=r.disclosures.find(x=>x.id==='NO_NEW_EXERCISE_IN_EVENT_WEEKS');assert.ok(d?.slots?.length);assert.match(d.detail,/starts? after this program$/);
});
test('R7-B.1 cycle QR7B1-05: a race-week session left with no exercise says they start after this program',()=>{
 const {t,wk}=upTo(SHORT,'TAPER'),race=t.p.phases.phases.indexOf('RACE_WEEK');
 for(const X of ['goblet-squat','db-bench-press','db-row'])assert.equal(apply(t,substitution(t,wk,X,'NONCLINICAL_DISCOMFORT_OR_PREFERENCE')).status,'MODIFY');
 const s=t.p.weeks[race].sessions.find(x=>x.sport==='STRENGTH'&&x.day===0);
 assert.equal(s.prescription,null);assert.match(s.explanation,/start after this program$/);
});

// ---------- the week-level slot test keeps capped novices' substitutions (preserved) ----------
test('R7-B.1 cycle (preserved): a capped novice\'s substitution is applied when its full session moves to another day of the week',()=>{
 const t=reviewed({id:'b1c-cap4',weeks:16,rotation:'COACH_DECIDES',goals:{run:'PERFORMANCE',strength:'GENERAL'},strengthExperience:'NOVICE',equipment:['DUMBBELLS','BENCH'],schedule:{strengthDays:[0,2,4,5]}},2);
 for(const [X,sel] of [['glute-bridge','single-leg-glute-bridge'],['reverse-lunge','split-squat-bodyweight']]){
  const r=substitution(t,2,X,'NONCLINICAL_DISCOMFORT_OR_PREFERENCE',{},1);assert.equal(r.status,'MODIFY',X);assert.equal(r.substitutions[0].selected,sel);
  const held=r.proposal.weeks[2].sessions.filter(s=>live(s)&&s.sport==='STRENGTH'&&s.date>t.p.weeks[2].startDate).flatMap(s=>s.prescription.exercises.map(e=>e.id));
  assert.ok(held.includes(sel)&&!held.includes(X),`${sel} takes the place of ${X} in week 2`);
 }
});
