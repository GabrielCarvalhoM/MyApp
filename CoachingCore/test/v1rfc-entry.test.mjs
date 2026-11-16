// V1 Race Forecast + Pace Insights (phase B): the composed entry point (v1-run-forecast-index.mjs) on synthetic athletes, as a conforming
// client drives it. What is proven here: the values are the decision's; with no enabling record nothing is added; with the forecast and the
// insights on, every key the run formats return is untouched; each state and each withdrawal; the journeys the Founder's mission names; and
// determinism, JSON, replay and restart. Synthetic data only: nothing here is evidence about athletes.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as M from '../src/v1-race-forecast.mjs';
import {FORBIDDEN_CLAIM} from '../src/r6-prescription.mjs';
import {P,F,DEV,FORECAST_OFF,VALUES,FV,R2,RC,timeline,racePlan,runner,result,report,asPrescribed,hash,addDays,ELIG,START,live,near} from './v1rfc-helpers.mjs';
import {DEV as RWS_DEV} from './v1rws-helpers.mjs';

const RFC_KEYS=['runForecast','paceInsights','paceRevision','paceRevisionRecord'];
const rest=r=>Object.fromEntries(Object.entries(r).filter(([k])=>!RFC_KEYS.includes(k)));
const textsOf=v=>typeof v==='string'?[v]:Array.isArray(v)?v.flatMap(textsOf):v&&typeof v==='object'?Object.values(v).flatMap(textsOf):[];
const numbersOf=v=>typeof v==='number'?[v]:Array.isArray(v)?v.flatMap(numbersOf):v&&typeof v==='object'?Object.entries(v).filter(([k])=>/Seconds$/.test(k)).flatMap(([,x])=>numbersOf(x)).concat(Object.entries(v).filter(([k])=>!/Seconds$/.test(k)&&typeof v[k]==='object').flatMap(([,x])=>numbersOf(x))):[];
const ranges=f=>[f.status,f.display??null,f.shown??null,f.observedForecast?.forecastSeconds??f.observedForecast?.reason??null,f.planScenario?.forecastSeconds??null];
const TUNEUP=()=>result('10K',2940,'2027-02-28',{id:'tuneup'});
/** The 10 km journey: every week as prescribed; a 10 km race run on the last day of week 8 becomes the reference. `looks[w]`: Monday of week w+1. */
function journey({through=15,how=()=>null,evidence={7:[TUNEUP()]},intake=racePlan({goalMinutes:48}),opts=DEV,entry=P}={}){
 const t=timeline(intake,{opts,entry}),looks=[],reviews=[];
 for(let w=0;w<=through;w++){looks.push(t.look(w));if(w<15)reviews.push(t.week(w,s=>how(w,s)??asPrescribed(t,s),evidence[w]?{runEvidence:evidence[w]}:{}));}
 return {t,looks,reviews};
}
let J=null;const full=()=>J??=journey();

test('the values are the consolidated values of SSCTR-RFC-DECISION-r2, copied whole and pinned by hash',()=>{
 assert.deepEqual(VALUES,R2.values);assert.equal(VALUES.id,'SSCTR-RFC-VALUES-r2');
 assert.equal(M.FORECAST_VALUES_FILE_SHA256,M.FORECAST_VALUES_SHA256);assert.ok(M.RACE_FORECAST);
 assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../../audits/v1-race-forecast-2026-11-13/ssctr/SSCTR_RFC_DECISION_R2.json',import.meta.url))).digest('hex'),'51bec86bd0efb1f89dc9f6947da5630b6e591d52b3b33d9d36754c140beb1fe4');
 assert.equal(M.raceForecastOf(Buffer.from(JSON.stringify(VALUES))),null,'any other bytes are no values');
});
test('activation fails closed: a boundary is on only by an independent enabling record bound to the pinned values, each on its own',()=>{
 const rec=(x={},id='V1X-RUN-FORECAST')=>({records:[{boundaryId:id,extensionSha256:M.FORECAST_VALUES_SHA256,independent:true,disposition:'APPROVE_WITH_CONDITIONS',evidenceStatus:'SUPPORTED_WITH_LIMITS',sourceIds:['RFC01'],...x}]});
 const on=(records,name='FORECAST')=>M.allowsForecast(M.runForecastAuthority({runForecastRecords:records}),name);
 assert.equal(on({records:[]}),false);assert.equal(on(rec()),true);assert.equal(on(rec(),'INSIGHTS'),false);assert.equal(on(rec(),'REVISION'),false);
 assert.equal(on(rec({},'V1X-PACE-INSIGHTS'),'INSIGHTS'),true);assert.equal(on(rec({},'V1X-PACE-INSIGHTS'),'REVISION'),false);
 for(const bad of [{independent:false},{extensionSha256:'0'.repeat(64)},{sourceIds:[]},{disposition:'REJECT'},{evidenceStatus:'INSUFFICIENT_EVIDENCE'},{boundaryId:'V1X-RUN-NATIVE'}])assert.equal(on(rec(bad)),false,JSON.stringify(bad));
 // The file of records as the repository holds it: nothing is on beyond what an independent record in it enables; the pace revision never by default.
 const file=fs.existsSync(M.FORECAST_RECORDS_URL)?JSON.parse(fs.readFileSync(M.FORECAST_RECORDS_URL,'utf8')):null,standing=M.runForecastAuthority();
 for(const [name,id] of Object.entries(M.FORECAST_BOUNDARIES)){const mine=(file?.records??[]).filter(r=>r.boundaryId===id);assert.equal(M.allowsForecast(standing,name),mine.length>0&&mine.every(r=>r.independent===true&&r.extensionSha256===M.FORECAST_VALUES_SHA256),name);}
 assert.equal(M.allowsForecast(standing,'REVISION'),false,'V1X-PACE-REVISION stays off until an integration meets IC-2');
 // The development authority turns on the forecast and the insights only, unless the revision is named.
 assert.deepEqual(Object.keys(DEV.runForecast.approved).sort(),['V1X-PACE-INSIGHTS','V1X-RUN-FORECAST']);assert.equal(DEV.runForecast.source,'DEV_TEST_ONLY');
});
test('T1b every phase the engine gives a week is a counted phase or a zero-credit phase',()=>{
 const known=new Set([...FV.countedPhases,...FV.zeroCreditPhases]),plans=[racePlan({}),racePlan({event:'HALF_MARATHON'}),racePlan({event:'5K',weeks:12,anchors:[result('5K',1500,'2026-12-25')]}),racePlan({weeks:8}),racePlan({weeks:4}),runner({id:'rf-perf',weeks:16}),runner({id:'rf-reg',goal:'REGULAR',weeks:12}),
  runner({id:'rf-mar',asOf:'2027-01-02',start:START,weeks:16,runExperience:'EXPERIENCED',goal:{kind:'RACE',event:{kind:'MARATHON',date:addDays(START,111)}},anchors:[result('HALF_MARATHON',6600,'2026-12-20')],recent:{runDaysPerWeek:5,runMinutesPerWeek:360,longestRunMinutes:150,strengthDaysPerWeek:1},schedule:{runDays:[0,1,3,4,6],strengthDays:[2],runMinutes:90,strengthMinutes:35,longRunDay:6,longRunMinutes:210}})];
 const seen=new Set();for(const intake of plans){const g=P.generateProgram(intake,DEV);assert.ok(g.program,intake.athlete.id+': '+g.status);for(const w of g.program.weeks){seen.add(w.phase);assert.ok(known.has(w.phase),w.phase);}}
 assert.ok(seen.has('TAPER')&&seen.has('RACE_WEEK')&&seen.has('BUILD'));
});

test('T4, I1: with no enabling record every added key is DISABLED and every other key is the run formats\' answer, key for key',()=>{
 const none={...RWS_DEV,runForecastRecords:{records:[]}};
 for(const opts of [none,FORECAST_OFF]){
  const a=journey({through:4,opts}),b=journey({through:4,opts:RWS_DEV,entry:F});
  for(const [k,r] of [...a.looks,...a.reviews,a.t.g].entries()){
   const other=[...b.looks,...b.reviews,b.t.g][k];assert.equal(hash(rest(r)),hash(other),'answer '+k);assert.deepEqual(Object.keys(rest(r)),Object.keys(other));
   assert.deepEqual([r.runForecast.status,r.paceInsights.status,r.paceRevision.status,r.paceRevisionRecord],['DISABLED','DISABLED','DISABLED',[]]);
   assert.equal(r.runForecast.observedForecast,undefined);assert.deepEqual(numbersOf(r.runForecast),[]);
  }
 }
 // The boundaries under it: without the calibration's estimate boundary, or the native formats, nothing is computed either.
 const noNative=P.generateProgram(racePlan({}),{...DEV,runFormats:FORECAST_OFF.runFormats&&{...DEV.runFormats,approved:{}}});
 assert.deepEqual([noNative.runForecast.status,noNative.runForecast.reason,noNative.paceInsights.status],['DISABLED','RUN_NATIVE_BOUNDARY_REQUIRED','DISABLED']);
 const noEstimate=P.generateProgram(racePlan({}),{...DEV,runCalibration:{...DEV.runCalibration,approved:{...DEV.runCalibration.approved,'V1X-RUN-ESTIMATE':false}}});
 assert.deepEqual([noEstimate.runForecast.status,noEstimate.runForecast.reason],['DISABLED','RUN_ESTIMATE_BOUNDARY_REQUIRED']);
});
test('on, the forecast and the insights observe: every key the run formats return is the same, answer by answer, through a whole plan',()=>{
 const a=full(),b=journey({opts:RWS_DEV,entry:F}),mine=[a.t.g,...a.looks,...a.reviews],theirs=[b.t.g,...b.looks,...b.reviews];
 assert.equal(mine.length,theirs.length);
 for(const [k,r] of mine.entries()){assert.equal(hash(rest(r)),hash(theirs[k]),'answer '+k);assert.deepEqual(Object.keys(r).filter(x=>!RFC_KEYS.includes(x)),Object.keys(theirs[k]));}
 // A caller cannot hand a band: the hook's key is taken off (only the pace revision, on, sets it).
 const hooked=P.generateProgram(racePlan({goalMinutes:48}),{...DEV,[P.BAND_OF]:()=>({status:'AVAILABLE',domain:'THRESHOLD_CONTROLLED',fastSecondsPerKm:200,slowSecondsPerKm:210})});
 assert.equal(hash(rest(hooked)),hash(theirs[0]));
});

test('the journey of a 10 km plan: the plan scenario from the first day, the observed forecast from two weeks done, a new reference without double counting, and race week',()=>{
 const {looks}=full(),at=w=>looks[w].runForecast;
 // Before any week is done, and with one done: only the plan scenario, said as a condition (A2-1); from two: the observed forecast (A2-2).
 assert.deepEqual(ranges(at(0)),['SHOWN','PLAN_SCENARIO_ONLY',['PLAN_SCENARIO'],'NOT_ENOUGH_HISTORY',[2820,2940,3075]]);
 assert.deepEqual(ranges(at(1)),ranges(at(0)));
 assert.equal(at(0).planScenario.conditionalOn,'PLAN_FOLLOWED_FROM_NOW');assert.match(at(0).planScenario.statement,/^If you follow the plan from now on, your 10K on 2027-04-25: 47:00-51:15\. The slower end assumes no further improvement\. Not a promise\.$/);
 assert.deepEqual(ranges(at(2)),['SHOWN','ONE_RANGE_OBSERVED_FORECAST_COINCIDES_WITH_PLAN_SCENARIO',['OBSERVED_FORECAST'],[2820,2940,3075],[2820,2940,3075]]);
 assert.match(at(2).observedForecast.statement,/^If you keep training as you have over the last 2 weeks, in line with the plan, your 10K on 2027-04-25: 47:00-51:15\./);
 // Example (a) through the engine: week 5, four weeks done as prescribed, the reference of 2027-01-01.
 assert.deepEqual(at(4).observedForecast.forecastSeconds,[2820,2940,3075]);assert.ok(near(at(4).decomposition.U,0.016484,6e-7));assert.ok(near(at(4).decomposition.g.observedForecast,0.03767,6e-7));assert.equal(at(4).confidence,'LOW');
 // T6: with the adherence the range assumes, g does not depend on the day it is computed: U only trades places with F.
 for(let w=2;w<=7;w++){assert.ok(near(at(w).decomposition.g.planScenario,at(2).decomposition.g.planScenario,1e-12),'week '+w);assert.ok(near(at(w).decomposition.U+at(w).decomposition.F.planScenario,at(w).decomposition.g.planScenario,1e-15));}
 assert.ok(at(7).decomposition.U>at(3).decomposition.U);
 // The 10 km of 2027-02-28 (the last day of week 8) is the reference from week 9: its week is credited at the reference (U = 0), the gain it
 // measured (O) is never added, and the response is updated by the one pair.
 const nine=at(8);
 assert.equal(nine.current.reference,'tuneup');assert.deepEqual(nine.observedForecast.forecastSeconds,[2835,2925,3015]);assert.equal(nine.decomposition.U,0);
 assert.ok(near(nine.decomposition.O,Math.log(3000/2940),1e-12));assert.ok(nine.decomposition.g.observedForecast<at(7).decomposition.g.observedForecast);
 assert.equal(nine.response.source,'PRIOR_UPDATED_BY_ONE_PAIR');assert.deepEqual([nine.response.pair.H_A,nine.response.pair.H_B,nine.response.pair.days,nine.response.pair.used],[0,8,58,true]);assert.ok(nine.response.R_c>0.5&&nine.response.R_c<=1);
 for(let w=8;w<=14;w++)assert.deepEqual(ranges(at(w)),ranges(nine),'week '+w);
 // The slow edge is always the current estimate; the goal sits beside the range that is shown, never in race week.
 for(let w=0;w<=14;w++){const f=at(w);assert.equal((f.observedForecast.highSeconds??f.planScenario.highSeconds),f.current.highSeconds);assert.equal(f.planScenario.highSeconds,f.current.highSeconds);}
 assert.equal(at(4).observedForecast.goalRelation.relation,'INSIDE_RANGE');assert.equal(at(4).planScenario.goalRelation,null);assert.equal(at(0).planScenario.goalRelation.relation,'INSIDE_RANGE');
 assert.equal(looks[4].runCalibration.goal.relation,'FASTER_THAN_RANGE','the calibration\'s own comparison with the current estimate stays, and comes first');
 // Race week: nothing live; the forecast of the week before, frozen, low and high only, to the day before the race.
 const rw=at(15);
 assert.deepEqual([rw.status,rw.reason,rw.observedForecast,rw.planScenario],['UNAVAILABLE','RACE_WEEK',undefined,undefined]);
 assert.deepEqual([rw.raceWeek.status,rw.raceWeek.from,rw.raceWeek.through,rw.raceWeek.label,rw.raceWeek.frozenRange,rw.raceWeek.goalRelation,rw.raceWeek.pacingSource],
  ['SHOWN_FROZEN','2027-04-19','2027-04-24','Forecast of 2027-04-12; not updated in race week',{lowSeconds:2835,highSeconds:3015,centralShown:false},'NOT_SHOWN_IN_RACE_WEEK',false]);
 assert.deepEqual([at(14).observedForecast.lowSeconds,at(14).observedForecast.highSeconds],[2835,3015],'it is the range week 15 showed');
});
test('race week: never on race day; not after a new reference in the taper (A4-2); not when the last forecast was not shown (A4-3)',()=>{
 const a=full(),t=timeline(racePlan({goalMinutes:48}));Object.assign(t,JSON.parse(JSON.stringify({p:a.t.p,ledger:a.t.ledger,ref:a.t.ref,ev:a.t.ev,fmt:a.t.fmt,hist:a.t.hist,rev:a.t.rev,runs:a.t.runs})));t.n=200;
 assert.equal(t.step(15,5,'WEEKLY_REVIEW',{},'08:00').runForecast.raceWeek.status,'SHOWN_FROZEN');
 const day=t.step(15,6,'WEEKLY_REVIEW',{},'08:00').runForecast;assert.deepEqual([day.status,day.raceWeek.status,day.raceWeek.reason],['UNAVAILABLE','NOT_SHOWN','RACE_DAY']);
 // A4-2: a 10 km run in the taper becomes the reference for race week.
 const taper=journey({evidence:{7:[TUNEUP()],14:[result('10K',2850,'2027-04-18',{id:'late'})]}}).looks[15];
 assert.equal(taper.runCalibration.capacity.evidenceId,'late');assert.deepEqual([taper.runForecast.raceWeek.status,taper.runForecast.raceWeek.reason],['NOT_SHOWN','REFERENCE_CHANGED_SINCE_FROZEN']);
 // A result inside the calibration's deadband changes no reference, so the frozen forecast stands.
 assert.equal(journey({evidence:{7:[TUNEUP()],14:[result('10K',2925,'2027-04-18',{id:'near'})]}}).looks[15].runForecast.raceWeek.status,'SHOWN_FROZEN');
 // A4-3: with the plan's first result alone the estimate ages (56 days) and week 15 shows nothing: neither does race week.
 const aged=journey({evidence:{}}).looks;assert.equal(aged[14].runForecast.status,'TOO_UNCERTAIN_TO_SHOW');assert.deepEqual(aged[14].runForecast.shown,[]);
 assert.deepEqual([aged[15].runForecast.raceWeek.status,aged[15].runForecast.raceWeek.reason],['NOT_SHOWN','LAST_FORECAST_NOT_SHOWN']);
});

test('who gets a forecast: no history, an old best alone, an unknown or absent experience, and a reference too short for the event',()=>{
 const first=x=>P.generateProgram(racePlan(x),DEV),f=x=>first(x).runForecast;
 // No result on record: no estimate, so no forecast and no number of any kind; the guidance names only the calibration's own routes.
 const bare=f({anchors:null});
 assert.deepEqual([bare.status,bare.reason,bare.current],['UNAVAILABLE','CURRENT_ESTIMATE_UNAVAILABLE',null]);assert.deepEqual(numbersOf(bare),[]);
 assert.deepEqual(bare.guidance.routes,['REPORT_A_RACE_RESULT_AT_THE_EVENT_DISTANCE']);assert.ok(bare.guidance.never.includes('A_RACE_ENTRY'));
 // An old best is history, never current capacity: nothing is forecast from it.
 const best=first({anchors:[{kind:'PERSONAL_BEST',distance:'10K',seconds:2640,date:'2025-05-10',measurement:'OFFICIAL',rpe:9,tolerated:true}]});
 assert.equal(best.runCalibration.historicalBest.length,1);assert.deepEqual([best.runForecast.status,best.runForecast.reason],['UNAVAILABLE','CURRENT_ESTIMATE_UNAVAILABLE']);assert.deepEqual(numbersOf(best.runForecast),[]);
 // Experience: the class the athlete stated at the plan's creation. Not stated, the intake stores NOVICE (the highest ceiling): the forecast
 // reads it as unknown and uses the EXPERIENCED ceiling, the lowest.
 const stated=k=>f({x:{athlete:{runExperience:k}}}),unknown=f({x:{athlete:{runExperience:undefined}}});
 assert.deepEqual([unknown.experience,unknown.experienceSource,unknown.planScenario.forecastSeconds],['EXPERIENCED','UNKNOWN_READ_AS_EXPERIENCED',stated('EXPERIENCED').planScenario.forecastSeconds]);
 assert.equal(first({x:{athlete:{runExperience:undefined}}}).program.capability.run.experience,'NOVICE');
 assert.ok(stated('NOVICE').planScenario.lowSeconds<stated('INTERMEDIATE').planScenario.lowSeconds&&stated('INTERMEDIATE').planScenario.lowSeconds<unknown.planScenario.lowSeconds);
 assert.equal(stated('NOVICE').planScenario.highSeconds,unknown.planScenario.highSeconds);
 assert.deepEqual([stated('NONE').status,stated('NONE').reason],['UNAVAILABLE','EXPERIENCE_NONE']);
 // Example (h): a 10 km forecast from a 5 km result is wider than what is shown: the current estimate stays, the forecast says why and no more.
 const short=f({anchors:[result('5K',1320,'2027-01-01')]});
 assert.deepEqual([short.status,short.reason,short.shown,short.planScenario.status,short.planScenario.statement],['TOO_UNCERTAIN_TO_SHOW','WIDER_THAN_THE_WIDTH_SHOWN',[],'TOO_UNCERTAIN_TO_SHOW',null]);assert.ok(short.planScenario.width>short.planScenario.wMax);assert.ok(short.guidance);
 // A plan with no race has no forecast at all.
 assert.deepEqual([P.generateProgram(runner({id:'rf-perf2',weeks:12,anchors:[result('10K',3000,'2026-10-25')]}),DEV).runForecast.status],['NOT_APPLICABLE']);
});
test('missed training: the observed forecast slows with the adherence observed; the plan scenario is the alternative, never the headline',()=>{
 // The long run of every week left undone: about 0.6 of the planned minutes (example b); then two whole weeks missed.
 const partly=journey({through:5,how:(w,s)=>s.role==='LONG'?false:null,evidence:{}}),f=partly.looks[4].runForecast,o=f.observedForecast,p=f.planScenario;
 assert.equal(f.display,'BOTH_RANGES');assert.deepEqual(f.shown,['OBSERVED_FORECAST','PLAN_SCENARIO']);
 assert.ok(o.futureAdherence>0.5&&o.futureAdherence<0.7);assert.ok(o.fFuture>0&&o.fFuture<0.5);assert.ok(o.lowSeconds>p.lowSeconds,'the observed forecast is the slower of the two');assert.equal(o.highSeconds,p.highSeconds);
 assert.match(o.statement,/^If you keep training as you have over the last 4 weeks, your 10K/);assert.match(p.statement,/^If you follow the plan from now on/);assert.doesNotMatch(p.statement,/missed|short|behind/i);
 for(const k of f.adherence.weeks)for(const c of k.credits)assert.equal(c.rule,c.c===1?'COMPLETED':'MINUTES');
 assert.deepEqual(f.adherence.weeks[0].credits.map(c=>[c.plannedMinutes,c.c]),[[45,1],[45,1],[60,0]]);assert.ok(near(f.adherence.weeks[0].a,0.6,1e-12));
 const gone=journey({through:5,how:(w,s)=>w>=2&&w<=3?false:null,evidence:{}}).looks[4].runForecast;
 assert.deepEqual(gone.adherence.weeks.map(k=>k.a),[1,1,0,0]);assert.ok(near(gone.observedForecast.futureAdherence,0.5,1e-12));assert.equal(gone.observedForecast.fFuture,0);
 // With f = 0 the observed forecast adds only the gain of the weeks already done: it never passes the plan scenario, and never the estimate.
 assert.ok(gone.observedForecast.lowSeconds>=gone.planScenario.lowSeconds);assert.ok(gone.observedForecast.centralSeconds<=gone.current.centralSeconds);
 // A session that was not reported is no credit: the same as one reported as not done.
 const silent=timeline(racePlan({}));for(let w=0;w<4;w++)silent.step(w,6,'WEEKLY_REVIEW',{observations:silent.p.weeks[w].sessions.filter(live).filter(s=>s.role!=='LONG').map(s=>report(silent.p,s,s.sport==='RUN'?{pace:345,rpe:4}:{}))});
 const unreported=silent.look(4).runForecast.adherence.weeks[0];assert.deepEqual(unreported.credits.map(c=>c.rule),['COMPLETED','COMPLETED','MISSING_REPORT']);assert.ok(near(unreported.a,0.6,1e-12));
});
test('the withdrawals, at once: a hold, the warning-sign screen, a return after a break, after the race; and what they leave',()=>{
 const base=()=>{const t=timeline(racePlan({goalMinutes:48}));for(let w=0;w<3;w++)t.week(w,s=>asPrescribed(t,s));return t;};
 const shown=base().look(3).runForecast;assert.equal(shown.status,'SHOWN');
 // A clinical route: the engine prescribes nothing and the forecast says nothing.
 const pain=base().step(3,1,'WEEKLY_REVIEW',{eligibility:ELIG(addDays(START,22),{pain:true})});
 assert.ok(['HOLD','CLINICAL_HUMAN_REQUIRED'].includes(pain.status));assert.equal(pain.runForecast.status,'UNAVAILABLE');assert.deepEqual(numbersOf({o:pain.runForecast.observedForecast,p:pain.runForecast.planScenario}),[]);assert.notEqual(pain.paceInsights.status,'ACTIVE');
 // A run stopped for a symptom: the screen is asked, and until it is answered no forecast and no insight is shown.
 const t=base(),s=t.runsOf(3)[0],stop=t.step(3,2,'WEEKLY_REVIEW',{observations:[{...report(t.p,s,{pace:345,rpe:4,completed:false}),actual:{completed:false,minutes:10,stop:{reason:'SYMPTOM'}}}]});
 assert.equal(stop.runFormat.warningSignScreen.status,'REQUIRED');assert.deepEqual([stop.runForecast.status,stop.runForecast.reason,stop.paceInsights.status,stop.paceInsights.reason],['UNAVAILABLE','WARNING_SIGN_SCREEN_REQUIRED','UNAVAILABLE','WARNING_SIGN_SCREEN_REQUIRED']);
 // A break of 14 days: the plan returns by time and effort; nothing is forecast while it does, and the weeks of the break earned nothing.
 const u=base(),back=u.step(5,0,'RETURN_AFTER_PAUSE',{interruption:{startDate:u.day(3,0),endDate:u.day(4,6),days:14,reasonCategory:'TRAVEL'}},'08:00');
 assert.equal(back.runCalibration.status,'EFFORT_ONLY');assert.deepEqual([back.runForecast.status,back.runForecast.reason,back.paceInsights.reason],['UNAVAILABLE','MODE_WALK_JOG_RESTART_RETURN','MODE_WALK_JOG_RESTART_RETURN']);
 // After the race date (a race on the Saturday, read on the Sunday): nothing live and nothing frozen.
 const sat=timeline(racePlan({id:'rf-sat',x:{goal:{kind:'RACE',event:{kind:'10K',date:addDays(START,110)}}}})),past=sat.step(15,6,'WEEKLY_REVIEW',{},'09:00');
 assert.equal(past.runFormat.status,'ACTIVE');assert.deepEqual([past.runForecast.status,past.runForecast.reason,past.runForecast.raceWeek.status,past.runForecast.raceWeek.reason,past.paceInsights.reason],['UNAVAILABLE','AFTER_THE_RACE_DATE','NOT_SHOWN','AFTER_THE_RACE_DATE','AFTER_THE_RACE_DATE']);
 // A review the engine does not decide (here, one dated after the plan ended) is read by nothing: no forecast, and no number.
 const a=full(),after=timeline(racePlan({goalMinutes:48}));Object.assign(after,JSON.parse(JSON.stringify({p:a.t.p,ledger:a.t.ledger,ref:a.t.ref,ev:a.t.ev,fmt:a.t.fmt,hist:a.t.hist,rev:a.t.rev})));after.n=300;
 const undecided=P.evaluateProgram(after.p,{...after.review(15,6,'WEEKLY_REVIEW'),asOf:'2027-04-26T09:00:00-03:00',eligibility:ELIG('2027-04-26')},DEV);
 assert.notEqual(undecided.runFormat.status,'ACTIVE');assert.deepEqual([undecided.runForecast.status,undecided.runForecast.reason,undecided.paceInsights.status],['UNAVAILABLE','RUN_FORMATS_'+undecided.runFormat.reason,'UNAVAILABLE']);assert.deepEqual(numbersOf(undecided.runForecast),[]);
});
test('the marathon: the current marathon estimate only, never a forecast, a scenario or a goal relation (A7)',()=>{
 const g=P.generateProgram(runner({id:'rf-mar2',asOf:'2027-01-02',start:START,weeks:16,runExperience:'EXPERIENCED',goal:{kind:'RACE',event:{kind:'MARATHON',date:addDays(START,111),timeGoalMinutes:240}},anchors:[result('HALF_MARATHON',6600,'2026-12-20')],recent:{runDaysPerWeek:5,runMinutesPerWeek:360,longestRunMinutes:150,strengthDaysPerWeek:1},schedule:{runDays:[0,1,3,4,6],strengthDays:[2],runMinutes:90,strengthMinutes:35,longRunDay:6,longRunMinutes:210}}),DEV),f=g.runForecast;
 assert.equal(g.program.goal.run.event.kind,'MARATHON');assert.equal(g.runCalibration.estimates.MARATHON.status,'AVAILABLE');
 assert.deepEqual([f.status,f.display,f.shown,f.observedForecast,f.planScenario,f.flags],['SHOWN','CURRENT_MARATHON_ESTIMATE_ONLY_NEVER_LABELLED_FORECAST',[],null,null,['NO_TRAINING_GAIN_APPLIED_MARATHON']]);
 const e=g.runCalibration.estimates.MARATHON;assert.deepEqual([f.marathon.lowSeconds,f.marathon.centralSeconds,f.marathon.highSeconds],[e.lowSeconds,e.centralSeconds,e.highSeconds]);
 assert.deepEqual([f.marathon.currentEstimateOnly,f.marathon.labelledForecast,f.marathon.goalRelation],[true,false,'NOT_APPLICABLE_V1RC_GOAL_COMPARISON_ONLY']);assert.equal(f.decomposition.g.planScenario,0);
 assert.match(f.marathon.statement,/^Your current marathon estimate, assuming the block's long runs are completed: 3:46:00-4:20:00\. No further improvement is assumed for the marathon\. Not a promise\.$/);
});

test('T13 the texts: only the required wording, no claim the engine forbids, nothing of the decision\'s forbidden list, no percentage on a range',()=>{
 const {looks}=full(),partly=journey({through:5,how:(w,s)=>s.role==='LONG'?false:null,evidence:{}}).looks,all=[...looks,...partly].flatMap(r=>textsOf({f:r.runForecast,i:r.paceInsights,r:r.paceRevision}));
 const statements=[...looks,...partly].flatMap(r=>[r.runForecast.observedForecast?.statement,r.runForecast.planScenario?.statement,r.runForecast.observedForecast?.goalRelation?.statement,r.runForecast.planScenario?.goalRelation?.statement,r.runForecast.basis?.statement,r.runForecast.raceWeek?.statement]).filter(Boolean);
 assert.ok(statements.length>40);assert.ok(!all.some(t=>FORBIDDEN_CLAIM.test(t)));
 // Every text the values give for an athlete to read passes the same guard. (The values also hold the decision's own reasons for refusing the
 // race-pace domains, which name a term the guard forbids: they are reasons, never copy, and nothing emits them.)
 assert.ok(![FV.requiredText,FV.unavailableGuidance,VALUES.paceInsights.athleteConfirmedRevision.requiredText,VALUES.paceInsights.athleteConfirmedRevision.label].flatMap(textsOf).some(t=>FORBIDDEN_CLAIM.test(t)));
 assert.ok(textsOf(VALUES.paceInsights.athleteConfirmedRevision.refusedDomains).some(t=>FORBIDDEN_CLAIM.test(t)));assert.ok(!all.some(t=>/critical speed/i.test(t)));
 // The one place the word appears is the required sentence that denies it ("A plausible span, not a probability.").
 const words=['you will run','predicted time','on track','achievable','likely','probability','chance','confidence interval'];
 for(const t of statements){const read=t.replace('A plausible span, not a probability.','');for(const w of words)assert.ok(!read.toLowerCase().includes(w),`"${w}" in: ${t}`);assert.ok(!t.includes('%'),t);}
 for(const t of statements.filter(x=>/^If you/.test(x)))assert.match(t,/\d+:\d\d-\d+:\d\d\. The slower end assumes no further improvement\. Not a promise\.$/);
 assert.ok(statements.some(t=>/^Based on your race result of 2027-02-28; individual results vary\. A plausible span, not a probability\.$/.test(t)));
 assert.ok(statements.some(t=>/^Your goal 48:00 is within this range\.$/.test(t)));
 // Every range says what it is: an envelope, not a probability; and z is nowhere.
 for(const r of [...looks,...partly])for(const k of ['observedForecast','planScenario']){const x=r.runForecast[k];if(x?.interval)assert.deepEqual(x.interval,{kind:'PLAUSIBILITY_ENVELOPE',probabilistic:false,calibrated:false});}
 assert.ok(!JSON.stringify(looks.map(r=>r.runForecast)).includes('1.2816'));
});
test('T2, JSON and replay: the same record gives the same answer, through JSON, in any order of the record, and on a review sent again',()=>{
 const a=journey({through:9}),state=()=>JSON.parse(JSON.stringify({p:a.t.p,ledger:a.t.ledger,ref:a.t.ref,ev:a.t.ev,fmt:a.t.fmt,hist:a.t.hist,rev:a.t.rev}));
 const t=timeline(racePlan({goalMinutes:48}));Object.assign(t,state());t.n=400;const review=t.review(10,0,'WEEKLY_REVIEW',{},'08:00'),one=P.evaluateProgram(t.p,review,DEV),two=P.evaluateProgram(JSON.parse(JSON.stringify(t.p)),JSON.parse(JSON.stringify(review)),DEV);
 assert.equal(one.runForecast.status,'SHOWN');assert.equal(one.runForecast.hash,two.runForecast.hash);assert.equal(one.paceInsights.hash,two.paceInsights.hash);assert.equal(hash(one),hash(two));
 assert.equal(hash(JSON.parse(JSON.stringify(one))),hash(one),'the answer is a JSON value');
 // The order of the record's rows does not matter to what is forecast.
 const reversed=P.evaluateProgram(t.p,{...review,actualLedger:[...review.actualLedger].reverse(),runFormatRecord:[...review.runFormatRecord].reverse()},DEV);
 assert.deepEqual([reversed.runForecast.status,reversed.runForecast.inputDigest,reversed.runForecast.observedForecast.forecastSeconds],[one.runForecast.status,one.runForecast.inputDigest,one.runForecast.observedForecast.forecastSeconds]);
 // The same review again, on the record it returned: the same forecast.
 const kept=t.take(one),again=P.evaluateProgram(t.p,{...review,actualLedger:t.ledger,referenceState:t.ref,runEvidenceRecord:t.ev,runFormatRecord:t.fmt,runHistoryRecord:t.hist},DEV);
 assert.equal(again.runForecast.inputDigest,kept.runForecast.inputDigest);assert.deepEqual(ranges(again.runForecast),ranges(kept.runForecast));
});
test('a restart: a new plan from the record, forecast from its own first day; the carried answers are returned as they came',()=>{
 const a=full(),s=JSON.parse(JSON.stringify({ledger:a.t.ledger,ref:a.t.ref,ev:a.t.ev,fmt:a.t.fmt,hist:a.t.hist})),carried=[{fact:'PACE_REVISION_RESPONSE',eventId:'kept-as-it-came'}];
 const fresh=runner({id:'rf-race',asOf:'2027-03-06',start:'2027-03-08',weeks:8,goal:{kind:'RACE',event:{kind:'10K',date:'2027-05-02'}}});
 const r=P.restartProgram({intake:fresh,record:s.ledger,referenceState:s.ref,asOf:'2027-03-06T10:00:00-03:00',athleteId:a.t.p.athleteId,runEvidenceRecord:s.ev,runFormatRecord:s.fmt,runHistoryRecord:s.hist,paceRevisionRecord:carried},DEV);
 const plain=F.restartProgram({intake:fresh,record:s.ledger,referenceState:s.ref,asOf:'2027-03-06T10:00:00-03:00',athleteId:a.t.p.athleteId,runEvidenceRecord:s.ev,runFormatRecord:s.fmt,runHistoryRecord:s.hist},RWS_DEV);
 assert.equal(hash(rest(r)),hash(plain));assert.deepEqual(r.paceRevisionRecord,carried);
 if(r.program){const f=r.runForecast;assert.equal(f.week,0);if(f.status==='SHOWN'||f.status==='TOO_UNCERTAIN_TO_SHOW'){assert.equal(f.decomposition.U,0);assert.equal(f.observedForecast.reason,'NOT_ENOUGH_HISTORY','the weeks of the plan before earn nothing in the new one');}}
});

test('the handoff\'s first checks: an earlier week\'s calibration, read again from the record, is the one that week showed, and reads nothing later; the record of changes names each reference',()=>{
 const a=full(),t=a.t,asOf=`${t.day(15,0)}T08:00:00-03:00`,edges=cal=>Object.fromEntries(Object.entries(cal.paceBands).map(([k,b])=>[k,[b.status,b.fastSecondsPerKm??null,b.slowSecondsPerKm??null]]));
 const again=k=>P.runCalibrationOf({program:t.p,ledger:t.ledger,evidenceRecord:t.ev,asOf,weekIndex:k,engineStatus:'KEEP',eligibility:ELIG(t.day(15,0)),runFormatRecord:t.fmt},DEV);
 for(const k of [1,4,7,8,11,14]){
  const now=again(k),then=a.looks[k].runCalibration;
  // (a) the bands, the capacity and the estimates of week k, from the record as it is eight to fourteen weeks later.
  assert.deepEqual(edges(now),edges(then),'week '+k);assert.deepEqual([now.capacity.evidenceId,now.capacity.confidence,now.estimates['10K'].lowSeconds,now.estimates['10K'].highSeconds],[then.capacity.evidenceId,then.capacity.confidence,then.estimates['10K'].lowSeconds,then.estimates['10K'].highSeconds],'week '+k);
  // The view of the next week a calibration carries is that week's own (one calibration serves two weeks of bands).
  assert.deepEqual(edges({paceBands:now.nextWeek.paceBands}),edges(again(k+1)),'week '+(k+1));assert.equal(now.nextWeek.capacity.evidenceId,again(k+1).capacity.evidenceId);
 }
 // (b) with the estimate boundary on, the record of changes carries each reference with its date and its 10 km equivalent.
 assert.deepEqual(a.looks[15].runCalibration.projection.comparisons.filter(c=>c.to&&['FIRST_REFERENCE','NEW_REFERENCE'].includes(c.reason)).map(c=>[c.week,c.to.evidenceId,c.to.date,c.to.tenKEquivalentSeconds]),[[0,'intake-0','2027-01-01',3000],[8,'tuneup','2027-02-28',2940]]);
 // (c) every planned run session of a finished week resolves to its planning dose, the minutes the adherence is weighted by.
 for(const k of a.looks[9].runForecast.adherence.weeks)for(const c of k.credits)assert.equal(c.plannedMinutes,t.p.weeks[k.week].sessions.find(s=>s.id===c.sessionId).prescription.durationMinutes);
});
