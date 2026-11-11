// CoachingCore V1 Final Closure: the single directed fix cycle, the QRE findings on 2d089c0 (QRE-V1FC-01, -02, -04) and the test gaps its mutation run
// named (QRE-V1FC-07: M04, M09, M15, M26, M30, M35). Development authority for the event extension; synthetic data only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as V1 from '../src/v1-index.mjs';
import * as Research from '../src/r6-index.mjs';
import * as F from '../src/v1-f08.mjs';
import {simulateProgram} from '../src/r6-simulator.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';
import {intake,EDGE_PROFILES} from '../r6/fixtures/profiles.mjs';
import {devEventExtension,extensionOf,EXTENSION_SHA256,EXTENSION_URL} from '../src/v1-events.mjs';
import {opts,K,FULL,program,review,obs,live,addDays} from '../r7/b/fixtures/helpers.mjs';
import {createCustody} from '../src/boundary/custody.mjs';
import {memoryStore} from '../src/boundary/store.mjs';
import {createBoundary} from '../src/boundary/api.mjs';
import {HYBRID,ELIG} from './v1cib-helpers.mjs';

const dev={authority:devAuthority(),eventExtension:devEventExtension()};
const GEN={id:'v1fc-qre',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:FULL,knownExercises:[K('back-squat',3,5,82.5)]};
const NO=c=>Object.fromEntries(F.signsFor(c).map(k=>[k,false]));
const client=p=>({p,ledger:[],ref:null});
const step=(t,w,x={},engine=V1,o=opts)=>{const r=engine.evaluateProgram(t.p,{...review(t.p,w,x),...(x.event?{event:x.event}:{}),...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{})},o);t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;return r;};
const done=(t,w,engine=V1,o=opts)=>step(t,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s))},engine,o);
const base=()=>{const t=client(program(GEN));for(const w of [0,1])done(t,w);return t;};
let k=0;const report=(t,w,wellbeing)=>step(t,w,{kind:'NOT_FEELING_100',day:1,hour:'08:00:00',wellbeing,event:{id:'nf-'+(++k),kind:'NOT_FEELING_100'}});
const mar=(over={},sched={},date='2027-01-31')=>intake('v1fc-qre-mar',{weeks:16,athlete:{goals:{run:{kind:'RACE',event:{kind:'MARATHON',date}},strength:'MAINTAIN'},runExperience:'EXPERIENCED',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:5,runMinutesPerWeek:360,longestRunMinutes:150},...over},schedule:{runDays:[0,1,3,4,6],strengthDays:[2],runMinutes:90,strengthMinutes:35,longRunDay:6,longRunMinutes:210,...sched}});

test('QRE-V1FC-02: the V1 screen of a "not 100%" report is the instrument\'s own: the condition from its vocabulary, every sign of that condition, no unrecognized or non-boolean answer; only then is the plan kept',()=>{
 const generic=Object.fromEntries(F.signsFor('NEED_REST').map(x=>[x,false]));   // the nine signs every condition asks
 const cases=[[{warningSigns:generic},'wellbeing.condition'],[{condition:'FLU',warningSigns:generic},'wellbeing.condition'],[{condition:7,warningSigns:generic},'wellbeing.condition'],
  [{condition:'MILD_ILLNESS',warningSigns:generic},'wellbeing.warningSigns.'+F.WARNING_SIGNS.W10],[{condition:'NEED_REST',warningSigns:{...generic,somethingElse:true}},'wellbeing.warningSigns.unrecognized'],
  [{condition:'NEED_REST',warningSigns:{...generic,[F.WARNING_SIGNS.W1]:'no'}},'wellbeing.warningSigns.'+F.WARNING_SIGNS.W1],[{condition:'NEED_REST',warningSigns:generic,freeText:'I feel odd'},'wellbeing.unrecognized'],[null,'wellbeing'],['tired','wellbeing']];
 for(const [w,missing] of cases){const t=base(),before=t.p.hash,r=report(t,2,w);assert.equal(r.status,'ASK',JSON.stringify(w));assert.ok(r.missingInputs.includes(missing),`${JSON.stringify(w)} → ${r.missingInputs}`);assert.equal(r.unavailable,undefined);assert.equal(t.p.hash,before);
  // The same input at the research entry point (the behaviour of 3b14804) is asked too: V1 never asks less.
  assert.equal(report(base(),2,w)&&step(base(),2,{kind:'NOT_FEELING_100',day:1,hour:'08:00:00',wellbeing:w,event:{id:'r-'+(++k),kind:'NOT_FEELING_100'}},Research).status,'ASK');}
 // An illness report needs all 15 signs: with the six systemic ones unanswered it is asked for exactly those.
 const ill=report(base(),2,{condition:'MILD_ILLNESS',warningSigns:generic});assert.equal(ill.missingInputs.length,6);
 // What V1 does not read is never asked: no intent, no days, any sports or region.
 for(const w of [{condition:'NEED_REST',warningSigns:generic},{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REDUCE_LIGHT',days:30,sports:['RUN'],region:'UPPER_BODY',returnSpeed:'FASTER'}]){const r=report(base(),2,w);assert.equal(r.status,'KEEP',r.reason);assert.equal(r.unavailable.code,'OUTSIDE_V1_SCOPE');}
 // A sign answered yes is the hold whatever else is wrong with the report.
 assert.equal(report(base(),2,{condition:'FLU',warningSigns:{[F.WARNING_SIGNS.W3]:true},junk:1}).status,'CLINICAL_HUMAN_REQUIRED');
});
test('QRE-V1FC-01: a marathon\'s date is an eligibility fact: a date change (by either review kind) asks for a new plan; the same marathon again keeps the plan; a 5K or 10K date still moves',()=>{
 const p=Research.generateProgram(mar(),dev).program;assert.equal(p.goal.run.event.kind,'MARATHON');const o={...dev};
 for(const [days,label] of [[9,'nine days out'],[35,'five weeks out'],[84,'twelve weeks out'],[98,'two weeks later than planned']]){const date=addDays(p.startDate,days);if(date===p.goal.run.event.date)continue;
  for(const x of [{kind:'EVENT_DATE_CHANGE',changes:{eventDate:date}},{kind:'GOAL_CHANGE',changes:{event:{kind:'MARATHON',date}}}]){const t=client(p),r=step(t,0,{day:1,hour:'08:00:00',...x},V1,o);
   assert.equal(r.status,'ASK',`${label} ${x.kind}: ${r.reason}`);assert.deepEqual(r.missingInputs,['newProgramInput']);assert.equal(r.proposal,null);assert.equal(t.p.hash,p.hash);}}
 const same=step(client(p),0,{day:1,hour:'08:00:00',kind:'GOAL_CHANGE',changes:{event:{kind:'MARATHON',date:p.goal.run.event.date}}},V1,o);assert.equal(same.status,'KEEP',same.reason);
 // M30: a change into a 5K or a marathon mid-plan asks for a new plan; a 10K date still moves as before.
 const ten=Research.generateProgram(EDGE_PROFILES.TEN_K_EIGHT_WEEKS,dev).program,d=ten.goal.run.event.date;
 for(const kind of ['5K','MARATHON','ULTRA']){const r=step(client(ten),1,{day:1,hour:'08:00:00',kind:'GOAL_CHANGE',changes:{event:{kind,date:d}}},V1,o);assert.equal(r.status,'ASK',kind);assert.equal(r.proposal,null);}
 const moved=step(client(ten),1,{day:1,hour:'08:00:00',kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(d,-7)}},V1,o);assert.equal(moved.status,'MODIFY',moved.reason);
 const five=Research.generateProgram(intake('v1fc-qre-5k',{weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind:'5K',date:'2027-01-17'}},strength:'MAINTAIN'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:110,longestRunMinutes:45}},schedule:{runDays:[0,2,5],strengthDays:[1,3],runMinutes:50,strengthMinutes:40,longRunDay:5,longRunMinutes:70}}),dev).program;
 const five2=step(client(five),1,{day:1,hour:'08:00:00',kind:'EVENT_DATE_CHANGE',changes:{eventDate:'2027-01-10'}},V1,o);assert.equal(five2.status,'MODIFY','a 5K keeps its recipe through a date change: '+five2.reason);assert.equal(five2.proposal.eventExtension.sha256,five.eventExtension.sha256);
});
test('QRE-V1FC-04 and M04: a record with a temporary-reduction report (not kept by V1) is refused by the V1 restart and by a V1 review of a plan V1 made',()=>{
 const t=base();step(t,2,{kind:'NOT_FEELING_100',day:1,hour:'08:00:00',wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:4},event:{id:'nf-research',kind:'NOT_FEELING_100'}},Research);
 const foreign=t.ledger;assert.ok(foreign.some(x=>x.fact===F.WELLBEING_DECLARED));
 // M04: a plan V1 made (no reduction in it), reviewed with the foreign record: the record clause alone holds.
 const clean=base();assert.ok(!clean.p.weeks.some(x=>(x.adaptations??[]).some(a=>a.kind==='WELLBEING_REDUCTION')));
 const r=V1.evaluateProgram(clean.p,{...review(clean.p,2,{observations:[]}),actualLedger:foreign},opts);assert.equal(r.status,'HOLD');assert.deepEqual(r.errors,['record.outsideV1Scope']);
 assert.notEqual(Research.evaluateProgram(clean.p,{...review(clean.p,2,{observations:[]}),actualLedger:foreign},opts).status,'HOLD','the research entry point reads it; only V1 holds');
 // QRE-V1FC-04: no new plan over such a record.
 const again={...HYBRID(),asOf:'2026-12-01',startDate:'2026-12-07',athlete:{...HYBRID().athlete,eligibility:ELIG('2026-12-01'),pause:{nonclinical:true,reasonCategory:'SCHEDULE'}}};
 const n=V1.restartProgram({intake:again,record:foreign,asOf:'2026-12-01T10:00:00Z',athleteId:again.athlete.id});assert.equal(n.status,'HOLD');assert.deepEqual(n.errors,['record.outsideV1Scope']);assert.equal(n.program,null);
 assert.notEqual(V1.restartProgram({intake:again,record:[],asOf:'2026-12-01T10:00:00Z',athleteId:again.athlete.id}).status,'HOLD');
});
test('M09: on the real engine a learned rearrangement is withheld on request: the same review is decided as the plain weekly review, at the same arrangement of days',()=>{
 const sh=EDGE_PROFILES.SHARED_SAME_TURN,input={...structuredClone(sh),schedule:{...sh.schedule,temporaryPreference:'STRENGTH',sameTurnConfirmed:true}},o={authority:devAuthority()};
 const r=simulateProgram(input,{weeks:Array.from({length:8},(_,x)=>x>=3&&x<=5?{responses:[{sport:'RUN',role:'QUALITY',response:'HARDER'}]}:{})},o),row=r.rows.find(x=>x.weekly?.result?.action==='LEARNED_REARRANGEMENT');
 assert.ok(row,'the scripted athlete produces a learned rearrangement');const {review:rv,programBeforeRef:p}=row.weekly;
 const withIt=Research.evaluateProgram(p,rv,o),plain=Research.evaluateProgram(p,rv,{...o,withhold:['LEARNED_REARRANGEMENT']});
 assert.equal(withIt.action,'LEARNED_REARRANGEMENT');assert.notEqual(plain.action,'LEARNED_REARRANGEMENT');assert.notEqual(JSON.stringify(withIt.proposal.arrangementSessions),JSON.stringify(p.arrangementSessions));
 assert.equal(JSON.stringify((plain.proposal??p).arrangementSessions),JSON.stringify(p.arrangementSessions),'withheld: the days stay as they were');assert.deepEqual(plain.actualLedger,withIt.actualLedger);
});
test('M15: any change that follows the evidence but rearranges the days waits for the athlete, whatever the engine calls it',()=>{
 const clock={t:Date.parse('2026-11-07T12:00:00-03:00')},ME={athleteId:'ath-m15'};
 const engine={...V1,evaluateProgram:(program,input,options={})=>{const r=V1.evaluateProgram(program,input,options);if(!r.proposal)return r;const p=JSON.parse(JSON.stringify(r.proposal));p.arrangementSessions={...p.arrangementSessions,__moved:true};return {...r,action:'GATED_NEXT_STEP',status:'MODIFY',proposal:p};}};
 const custody=createCustody({store:memoryStore(),key:'m15-key-not-a-secret',now:()=>clock.t,engine}),api=createBoundary({custody,now:()=>clock.t});
 assert.ok(api.onboard({actor:ME,intake:HYBRID(),consents:{COACHING:true,HEALTH_SIGNALS:true,LEARNING:false},clientRequestId:'a'}).enrolled);
 clock.t=Date.parse('2026-11-15T20:00:00-03:00');const d=custody.read({actor:ME}).doc,kept=d.program.hash;
 const reports=d.program.weeks[0].sessions.filter(live).map(x=>({sessionId:x.id,occurredOn:x.date,completed:true,minutes:x.prescription.durationMinutes,...(x.sport==='STRENGTH'?{exercises:x.prescription.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,...(Number.isFinite(e.rir)?{rir:e.rir}:{})}))}))}:{}),response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}}));
 const r=api.weeklyCheckIn({actor:ME,clientRequestId:'b',expectedVersion:d.version,eligibility:{...ELIG('2026-11-15'),assessedAt:new Date(clock.t).toISOString()},reports});
 assert.equal(r.adoption,'PENDING',JSON.stringify(r.error??r.decision?.reason));assert.equal(custody.read({actor:ME}).doc.program.hash,kept,'not applied on its own');assert.equal(r.view.state,'PENDING_CONFIRMATION');
});
test('M26: the extension values are read only from the pinned bytes',()=>{
 const bytes=fs.readFileSync(EXTENSION_URL);assert.ok(extensionOf(bytes),'the committed file is the pinned bytes');
 const altered=Buffer.from(bytes.toString('utf8').replace('"longRunTarget": 180','"longRunTarget": 240'));assert.notEqual(altered.toString(),bytes.toString());
 assert.equal(extensionOf(altered),null);assert.equal(extensionOf(Buffer.concat([bytes,Buffer.from(' ')])),null);assert.equal(extensionOf(null),null);assert.match(EXTENSION_SHA256,/^[0-9a-f]{64}$/);
});
test('M35 (B1.1): the running class the planner assigns is an eligibility criterion: every number met, but running on too few days to be continuous current running, gives the preparatory plan',()=>{
 const g=Research.generateProgram(mar({recent:{runDaysPerWeek:1,runMinutesPerWeek:360,longestRunMinutes:150}}),dev);assert.equal(g.status,'PROPOSED',g.reason);
 const u=g.program.canonical.goals.contextEvent?.unmet??[];assert.equal(g.program.goal.run.event,null);assert.ok(u.some(x=>x.id==='CURRENT_RUNNING_CLASS'),JSON.stringify(u));
 assert.ok(!g.program.weeks.some(w=>w.sessions.some(s=>s.role==='RACE')));assert.equal(Research.generateProgram(mar(),dev).program.goal.run.event.kind,'MARATHON');
});
